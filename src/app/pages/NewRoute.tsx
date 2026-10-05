import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ASSETS, FEE_BPS, fromBase, getQuote, looksLikeZcashAddress, isTransparentZec, toBase, type AssetKey, type Quote } from '../lib/oneclick'
import { HOLD_OPTIONS, legFromQuote, routes, type Route } from '../lib/routes'
import { isSolanaAddress, short } from '../lib/solana'
import { settingsStore, useStore, walletStore } from '../lib/store'
import { num, usd, usePrices } from '../lib/prices'
import { useWallet } from '../wallet/walletCtx'
import { useBalances } from '../wallet/useBalances'

const MAX_WALLETS = 5
/** ZEC kept aside per return transfer for Zcash network fees (ZIP-317 fees are ~0.0001 ZEC). */
const ZEC_FEE_BUFFER = 0.0002
/** SOL kept in the source wallet for transaction and rent costs when using Max. */
const SOL_RESERVE = 0.005

type Row = { id: number; address: string; label: string; pct: number }
let rowId = 1

type Estimate = { inQ: Quote; outQ: Quote; zecToReturn: number }

function friendly(msg: string) {
  if (/recipient is not valid/i.test(msg)) return 'The swap provider did not accept this Zcash address. Copy a unified (u1…) or transparent (t1…) receive address from your Zcash wallet.'
  if (/refundTo is not valid|refund.*not valid/i.test(msg)) return 'The refund address is not a valid Solana address.'
  if (/amount is too low|too small|minimum/i.test(msg)) return 'This amount is below the swap provider’s minimum. Try a larger amount.'
  return msg
}

export function NewRoute() {
  const navigate = useNavigate()
  const wallet = useWallet()
  const { data: bal } = useBalances(wallet.address)
  const { prices } = usePrices()
  const settings = useStore(settingsStore, (s) => s)
  const saved = useStore(walletStore, (s) => s.items)

  const [rows, setRows] = useState<Row[]>([{ id: rowId++, address: '', label: '', pct: 100 }])
  const [source, setSource] = useState<AssetKey>('SOL')
  const [amount, setAmount] = useState('')
  const [landAs, setLandAs] = useState<AssetKey>(settings.defaultLandAs)
  const [holdIdx, setHoldIdx] = useState(Math.max(0, HOLD_OPTIONS.findIndex((h) => h.label === settings.defaultHold)))
  const [zecAddress, setZecAddress] = useState('')
  const [refundInput, setRefundInput] = useState('')
  const refundTo = refundInput || wallet.address || ''

  // Quote results are tagged with the inputs they were made for, so stale ones are ignored.
  const [result, setResult] = useState<{ key: string; estimate?: Estimate; error?: string }>({ key: '' })
  const [reviewedKey, setReviewedKey] = useState('')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const total = rows.reduce((a, r) => a + (Number.isFinite(r.pct) ? r.pct : 0), 0)
  const amountBase = toBase(amount, ASSETS[source].decimals)

  const problems = useMemo(() => {
    const p: string[] = []
    if (rows.some((r) => !isSolanaAddress(r.address))) p.push('Every destination needs a valid Solana address.')
    if (new Set(rows.map((r) => r.address.trim())).size !== rows.length) p.push('Each destination wallet can appear once.')
    if (Math.round(total) !== 100) p.push(`Percentages add up to ${total}%. They need to total 100%.`)
    if (rows.some((r) => !(r.pct > 0))) p.push('Every destination needs a share above 0%.')
    if (amountBase <= 0n) p.push('Enter an amount to send.')
    if (!looksLikeZcashAddress(zecAddress)) p.push('Add the Zcash address that will receive the ZEC.')
    if (!isSolanaAddress(refundTo)) p.push('Add a Solana refund address (your source wallet).')
    return p
  }, [rows, total, amountBase, zecAddress, refundTo])

  const quoteKey = problems.length
    ? ''
    : JSON.stringify([source, amountBase.toString(), zecAddress, refundTo, landAs, rows.map((r) => [r.address, r.pct]), settings.slippageBps])
  const current = result.key === quoteKey && quoteKey !== '' ? result : null
  const estimate = current?.estimate ?? null
  const quoteError = current?.error ?? null
  const quoting = quoteKey !== '' && !current
  const reviewed = reviewedKey === quoteKey && estimate != null

  // Live quote: both legs, as dry runs, whenever the inputs are complete.
  useEffect(() => {
    if (!quoteKey) return
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const inQ = await getQuote(
          { from: source, to: 'ZEC', amount: amountBase, recipient: zecAddress, refundTo, slippageBps: settings.slippageBps, dry: true, withFee: true },
          ctrl.signal,
        )
        const zecIn = fromBase(inQ.amountOut, 8)
        const zecToReturn = Math.max(0, zecIn - ZEC_FEE_BUFFER * rows.length)
        const outQ = await getQuote(
          { from: 'ZEC', to: landAs, amount: toBase(zecToReturn, 8), recipient: rows[0].address, refundTo: zecAddress, slippageBps: settings.slippageBps, dry: true },
          ctrl.signal,
        )
        setResult({ key: quoteKey, estimate: { inQ, outQ, zecToReturn } })
      } catch (e) {
        if (!ctrl.signal.aborted) setResult({ key: quoteKey, error: friendly((e as Error).message) })
      }
    }, 650)
    return () => {
      ctrl.abort()
      clearTimeout(t)
    }
  }, [quoteKey, source, amountBase, zecAddress, refundTo, landAs, rows, settings.slippageBps])

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const addRow = (address = '', label = '') => {
    if (rows.length >= MAX_WALLETS) return
    setRows((rs) => {
      const empty = rs.find((r) => !r.address)
      if (address && empty) return rs.map((r) => (r.id === empty.id ? { ...r, address, label } : r))
      return [...rs, { id: rowId++, address, label, pct: 0 }]
    })
  }
  const splitEqually = () =>
    setRows((rs) => {
      const base = Math.floor(100 / rs.length)
      return rs.map((r, i) => ({ ...r, pct: base + (i < 100 - base * rs.length ? 1 : 0) }))
    })

  const maxAmount = bal ? (source === 'SOL' ? Math.max(0, bal.sol - SOL_RESERVE) : bal.usdc) : null

  // Fee math, from the quotes themselves.
  const inUsd = estimate ? Number(estimate.inQ.amountInUsd) : 0
  const outUsd = estimate ? Number(estimate.outQ.amountOutUsd) : 0
  const feeUsd = (inUsd * FEE_BPS) / 10_000
  const zecBufferUsd = prices ? ZEC_FEE_BUFFER * rows.length * prices.ZEC : 0
  const spreadUsd = Math.max(0, inUsd - outUsd - feeUsd - zecBufferUsd)
  const outTotal = estimate ? fromBase(estimate.outQ.amountOut, ASSETS[landAs].decimals) : 0
  const minutes = estimate ? Math.ceil((estimate.inQ.timeEstimate + estimate.outQ.timeEstimate) / 60) : 0
  const hold = HOLD_OPTIONS[holdIdx]

  const start = async () => {
    if (!estimate || problems.length) return
    setStarting(true)
    setStartError(null)
    try {
      const inQ = await getQuote({
        from: source,
        to: 'ZEC',
        amount: amountBase,
        recipient: zecAddress,
        refundTo,
        slippageBps: settings.slippageBps,
        dry: false,
        validHours: 24,
        withFee: true,
      })
      const route: Route = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source,
        landAs,
        refundTo: refundTo.trim(),
        zecAddress: zecAddress.trim(),
        outputs: rows.map((r) => ({ address: r.address.trim(), label: r.label.trim(), pct: r.pct })),
        holdHours: hold.hours,
        in: legFromQuote(inQ, source, 'ZEC', zecAddress.trim()),
        out: [],
        phase: 'awaiting_deposit',
      }
      routes.add(route)
      navigate(`/app/routes/${route.id}`)
    } catch (e) {
      setStartError(friendly((e as Error).message))
      setStarting(false)
    }
  }

  return (
    <div className="split">
      <div className="panel panel--strong">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">Build a route</h2>
            <p className="panel__sub">Add 1 to 5 wallets and set the percentage each one receives.</p>
          </div>
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label" style={{ marginBottom: 8 }}>
            Destination Solana wallets ({rows.length}/{MAX_WALLETS})
          </legend>
          <ul className="dest-list">
            {rows.map((r, i) => (
              <li key={r.id} className="dest-row">
                <input
                  className="input mono"
                  placeholder="Solana address"
                  aria-label={`Wallet ${i + 1} address`}
                  value={r.address}
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={r.address !== '' && !isSolanaAddress(r.address)}
                  onChange={(e) => update(r.id, { address: e.target.value.trim() })}
                />
                <div className="pct-input">
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    aria-label={`Wallet ${i + 1} percentage`}
                    value={Number.isFinite(r.pct) ? r.pct : ''}
                    onChange={(e) => update(r.id, { pct: e.target.value === '' ? NaN : Math.min(100, Math.max(0, Math.round(Number(e.target.value)))) })}
                  />
                  <span>%</span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove wallet ${i + 1}`}
                  disabled={rows.length === 1}
                  onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="btn-row">
            <button type="button" className="btn btn--sm" onClick={() => addRow()} disabled={rows.length >= MAX_WALLETS}>
              + Add wallet
            </button>
            <button type="button" className="btn btn--sm" onClick={splitEqually}>
              Split equally
            </button>
            <span className={`total-chip ${Math.round(total) === 100 ? '' : 'is-off'}`}>Total {total || 0}%</span>
          </div>
          {saved.length > 0 && (
            <div className="saved-chips" aria-label="Saved wallets">
              <span className="faint">Saved:</span>
              {saved
                .filter((s) => !rows.some((r) => r.address === s.address))
                .map((s) => (
                  <button key={s.address} type="button" className="chip" onClick={() => addRow(s.address, s.label)} disabled={rows.length >= MAX_WALLETS && rows.every((r) => r.address)}>
                    {s.label} · <span className="mono">{short(s.address)}</span>
                  </button>
                ))}
            </div>
          )}
        </fieldset>

        <div className="grid-2">
          <div className="field">
            <label className="label" htmlFor="amount">
              Amount
            </label>
            <div className="amount-row">
              <input
                id="amount"
                className="input amount-input"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              />
              <div className="seg seg--asset" role="radiogroup" aria-label="Asset to send">
                {(['SOL', 'USDC'] as const).map((a) => (
                  <button key={a} type="button" role="radio" aria-checked={source === a} className={source === a ? 'is-on' : ''} onClick={() => setSource(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <p className="faint">
              {bal ? (
                <>
                  Balance {num(source === 'SOL' ? bal.sol : bal.usdc, source === 'SOL' ? 4 : 2)} {source}{' '}
                  {maxAmount != null && maxAmount > 0 && (
                    <button type="button" className="link-btn" onClick={() => setAmount(maxAmount.toFixed(source === 'SOL' ? 6 : 2))}>
                      Use max
                    </button>
                  )}
                </>
              ) : (
                'Send from any Solana wallet. Connecting one only fills in your balance and lets you send in one click.'
              )}
            </p>
          </div>
          <div className="field">
            <label className="label" htmlFor="hold">
              Time in shielded pool
            </label>
            <select id="hold" className="input" value={holdIdx} onChange={(e) => setHoldIdx(Number(e.target.value))}>
              {HOLD_OPTIONS.map((h, i) => (
                <option key={h.label} value={i}>
                  {h.label}
                </option>
              ))}
            </select>
            <p className="faint">A random moment inside this window. Longer holds make timing harder to match.</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <p className="label" id="land-label">
              Land as
            </p>
            <div className="seg" role="radiogroup" aria-labelledby="land-label">
              {(['SOL', 'USDC'] as const).map((a) => (
                <button key={a} type="button" role="radio" aria-checked={landAs === a} className={landAs === a ? 'is-on' : ''} onClick={() => setLandAs(a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="refund">
              Refund address (Solana)
            </label>
            <input
              id="refund"
              className="input mono"
              placeholder={wallet.address ? short(wallet.address, 6) : 'Your source wallet'}
              value={refundInput}
              spellCheck={false}
              aria-invalid={refundInput !== '' && !isSolanaAddress(refundInput)}
              onChange={(e) => setRefundInput(e.target.value.trim())}
            />
            <p className="faint">{wallet.address && !refundInput ? 'Using your connected wallet.' : 'Used only if the first swap cannot complete.'}</p>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="zec">
            Your Zcash address
          </label>
          <input
            id="zec"
            className="input mono"
            placeholder="u1… or t1… from your Zcash wallet"
            value={zecAddress}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={zecAddress !== '' && !looksLikeZcashAddress(zecAddress)}
            onChange={(e) => setZecAddress(e.target.value.trim())}
          />
          <p className="faint">
            The ZEC from the first swap lands here, in a wallet only you control (for example Zashi or Zingo). You send it back from that wallet when the hold ends.
            {isTransparentZec(zecAddress) && ' This is a transparent address: shield the ZEC in your wallet as soon as it arrives.'}
          </p>
        </div>
      </div>

      <aside className="panel panel--paper quote-panel" aria-live="polite">
        <div className="panel__head">
          <h2 className="panel__title">Your quote</h2>
          {quoting && <span className="status status--live">Updating</span>}
        </div>

        {problems.length > 0 && !estimate && (
          <ul className="todo">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {quoteError && <p className="notice notice--warn">{quoteError}</p>}

        {estimate && (
          <>
            <dl className="kv">
              <div>
                <dt>You send</dt>
                <dd>
                  {estimate.inQ.amountInFormatted} {source} <span className="muted">· {usd(inUsd)}</span>
                </dd>
              </div>
              <div>
                <dt>ZEC into the pool</dt>
                <dd>{num(fromBase(estimate.inQ.amountOut, 8), 6)} ZEC</dd>
              </div>
              <div>
                <dt>Service fee{FEE_BPS > 0 ? ` ${(FEE_BPS / 100).toFixed(1)}%` : ''}</dt>
                <dd>{FEE_BPS > 0 ? usd(feeUsd) : 'not charged'}</dd>
              </div>
              <div>
                <dt>Swap spread and provider fees</dt>
                <dd>{usd(spreadUsd)}</dd>
              </div>
              <div>
                <dt>Zcash network fees (est.)</dt>
                <dd>{prices ? usd(zecBufferUsd) : `${ZEC_FEE_BUFFER * rows.length} ZEC`}</dd>
              </div>
              <div className="kv__total">
                <dt>You receive ≈</dt>
                <dd>
                  {num(outTotal, landAs === 'SOL' ? 4 : 2)} {landAs}
                </dd>
              </div>
            </dl>
            <ul className="split-preview">
              {rows.map((r) => (
                <li key={r.id}>
                  <span className="mono">{short(r.address)}</span>
                  <span>
                    {r.pct}% · {num((outTotal * r.pct) / 100, landAs === 'SOL' ? 4 : 2)} {landAs}
                  </span>
                </li>
              ))}
            </ul>
            <p className="faint">
              Swaps take about {minutes} min in total, plus {hold.label} in the pool. Prices move: the return leg is quoted again when the hold ends.
            </p>

            {!reviewed ? (
              <button type="button" className="btn btn--solid btn--lg" onClick={() => setReviewedKey(quoteKey)}>
                Plan route
              </button>
            ) : (
              <div className="review">
                <p className="notice">
                  Starting creates a one-off deposit address for {estimate.inQ.amountInFormatted} {source}. Nothing moves until you send it. The address stays open for 24 hours.
                </p>
                {startError && <p className="notice notice--warn">{startError}</p>}
                <div className="btn-row">
                  <button type="button" className="btn btn--solid btn--lg" onClick={start} disabled={starting}>
                    {starting ? 'Creating…' : 'Start route'}
                  </button>
                  <button type="button" className="btn btn--lg" onClick={() => setReviewedKey('')} disabled={starting}>
                    Back
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <p className="faint">Privacy tools are regulated differently by country, so check the rules where you live before using one.</p>
      </aside>
    </div>
  )
}
