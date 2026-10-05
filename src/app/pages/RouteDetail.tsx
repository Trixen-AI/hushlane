import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ASSETS, fromBase, getQuote, isTransparentZec, submitDeposit, toBase } from '../lib/oneclick'
import { legFromQuote, routes, syncRoute, useRoute, zecReceived, type Leg, type Route } from '../lib/routes'
import { short, solscanAccount, solscanTx } from '../lib/solana'
import { settingsStore } from '../lib/store'
import { num, usd } from '../lib/prices'
import { CopyField, PhasePill, Qr, Tracker } from '../components/ui'
import { duration, useNow } from '../components/time'
import { useWallet } from '../wallet/walletCtx'

const ZEC_FEE_BUFFER = 0.0002

function TxLinks({ txs, label }: { txs: { hash: string; explorerUrl: string }[]; label: string }) {
  if (!txs.length) return null
  return (
    <p className="faint">
      {label}:{' '}
      {txs.map((t, i) => (
        <a key={t.hash} href={t.explorerUrl || solscanTx(t.hash)} target="_blank" rel="noopener noreferrer" className="tx-link">
          {short(t.hash, 6)}
          {i < txs.length - 1 ? ', ' : ''}
        </a>
      ))}
    </p>
  )
}

function DepositBox({ leg, children }: { leg: Leg; children?: React.ReactNode }) {
  return (
    <div className="deposit">
      <Qr value={leg.depositAddress} />
      <div className="deposit__body">
        <p className="label">Send exactly</p>
        <p className="deposit__amount">
          {leg.amountInFormatted} {leg.from}
        </p>
        <p className="label" style={{ marginTop: 12 }}>
          To this {ASSETS[leg.from].chain === 'zec' ? 'Zcash' : 'Solana'} deposit address
        </p>
        <CopyField value={leg.depositAddress} label="Deposit address" />
        {children}
      </div>
    </div>
  )
}

function SendFromWallet({ route }: { route: Route }) {
  const wallet = useWallet()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!wallet.configured) return null
  if (!wallet.isConnected)
    return (
      <button type="button" className="btn" onClick={wallet.open}>
        Connect a wallet to send in one click
      </button>
    )
  if (route.in.sentTx)
    return (
      <p className="faint">
        Sent from your wallet:{' '}
        <a href={solscanTx(route.in.sentTx)} target="_blank" rel="noopener noreferrer" className="tx-link">
          {short(route.in.sentTx, 6)}
        </a>
        . Waiting for the swap provider to see it.
      </p>
    )
  const asset = route.source === 'USDC' ? 'USDC' : 'SOL'
  return (
    <div className="field">
      <button
        type="button"
        className="btn btn--solid"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          setError(null)
          try {
            const sig = await wallet.send(asset, route.in.depositAddress, BigInt(route.in.amountIn))
            routes.update(route.id, (r) => ({ ...r, in: { ...r.in, sentTx: sig } }))
            submitDeposit(route.in.depositAddress, sig)
          } catch (e) {
            setError((e as Error).message || 'The wallet did not send the transfer.')
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? 'Confirm in your wallet…' : `Send ${route.in.amountInFormatted} ${asset} from ${short(wallet.address ?? '')}`}
      </button>
      {error && <p className="notice notice--warn">{error}</p>}
    </div>
  )
}

function ReturnPanel({ route }: { route: Route }) {
  const received = zecReceived(route)
  const [zecToSend, setZecToSend] = useState(() => Math.max(0, received - ZEC_FEE_BUFFER * route.outputs.length).toFixed(6))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalBase = toBase(zecToSend, 8)

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const slippageBps = settingsStore.get().slippageBps
      // Split in base units; the last wallet takes the rounding remainder.
      let left = totalBase
      const shares = route.outputs.map((o, i) => {
        const s = i === route.outputs.length - 1 ? left : (totalBase * BigInt(Math.round(o.pct * 100))) / 10_000n
        left -= s
        return s
      })
      const legs: Route["out"] = []
      for (let i = 0; i < route.outputs.length; i++) {
        const o = route.outputs[i]
        const q = await getQuote({ from: 'ZEC', to: route.landAs, amount: shares[i], recipient: o.address, refundTo: route.zecAddress, slippageBps, dry: false, validHours: 24 })
        legs.push({ ...legFromQuote(q, 'ZEC', route.landAs, o.address), pct: o.pct, label: o.label })
      }
      routes.update(route.id, (r) => ({ ...r, out: legs, phase: 'returning' }))
    } catch (e) {
      const m = (e as Error).message
      setError(/refundTo|refund/i.test(m) ? 'The swap provider rejected your Zcash address as a refund address. Use a transparent (t1…) address from the same wallet.' : m)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel panel--strong">
      <h2 className="panel__title">Swap back to {route.landAs}</h2>
      <p className="panel__sub">
        The hold is over. Create one return swap per destination wallet, then send the ZEC from your Zcash wallet. {num(received, 6)} ZEC arrived; a little is kept aside for Zcash network fees.
      </p>
      <div className="field" style={{ maxWidth: 360 }}>
        <label className="label" htmlFor="zec-send">
          ZEC to send back
        </label>
        <input id="zec-send" className="input" inputMode="decimal" value={zecToSend} onChange={(e) => setZecToSend(e.target.value.replace(/[^0-9.]/g, ''))} />
        <p className="faint">Lower this if your wallet shows less after shielding or fees.</p>
      </div>
      <ul className="split-preview">
        {route.outputs.map((o) => (
          <li key={o.address}>
            <span className="mono">{o.label ? `${o.label} · ` : ''}{short(o.address)}</span>
            <span>
              {o.pct}% · {num((Number(zecToSend || 0) * o.pct) / 100, 6)} ZEC
            </span>
          </li>
        ))}
      </ul>
      {error && <p className="notice notice--warn">{error}</p>}
      <div className="btn-row">
        <button type="button" className="btn btn--solid btn--lg" onClick={create} disabled={busy || totalBase <= 0n || Number(zecToSend) > received}>
          {busy ? 'Creating swaps…' : `Create ${route.outputs.length} return swap${route.outputs.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}

export function RouteDetail() {
  const { id } = useParams()
  const route = useRoute(id)
  const navigate = useNavigate()
  const now = useNow(1000)
  const [refreshing, setRefreshing] = useState(false)
  if (!route) return <Navigate to="/app/routes" replace />

  const holdLeft = route.holdUntil ? Math.max(0, route.holdUntil - now) : 0
  const holdProgress =
    route.holdUntil && route.holdStartedAt ? Math.min(1, (now - route.holdStartedAt) / Math.max(1, route.holdUntil - route.holdStartedAt)) : undefined
  const deadlineLeft = new Date(route.in.deadline).getTime() - now

  const refresh = async () => {
    setRefreshing(true)
    try {
      await syncRoute(route)
    } catch {
      /* shown as stale state */
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <div className="route-head">
        <div>
          <p className="faint">
            <Link to="/app/routes" className="tx-link">
              ← Routes
            </Link>{' '}
            · started {new Date(route.createdAt).toLocaleString()}
          </p>
          <h2 className="route-head__title">
            {route.in.amountInFormatted} {route.source} → {route.outputs.length} wallet{route.outputs.length > 1 ? 's' : ''}
          </h2>
        </div>
        <div className="btn-row">
          <PhasePill phase={route.phase} />
          <button type="button" className="btn btn--sm" onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Checking…' : 'Refresh'}
          </button>
        </div>
      </div>

      <Tracker phase={route.phase} holdProgress={route.phase === 'holding' ? holdProgress : undefined} />

      {route.phase === 'awaiting_deposit' && (
        <div className="panel panel--strong">
          <h2 className="panel__title">Step 1 · Send your {route.source}</h2>
          <p className="panel__sub">
            Send from any wallet you control. The swap to ZEC starts once the deposit is seen, usually in about {Math.ceil(route.in.timeEstimate / 60)} min. This address closes in{' '}
            {duration(deadlineLeft)}.
          </p>
          <DepositBox leg={route.in}>
            <SendFromWallet route={route} />
          </DepositBox>
          {route.in.status === 'INCOMPLETE_DEPOSIT' && (
            <p className="notice notice--warn">The deposit received is less than the quoted amount. Send the difference, or wait for the automatic refund to {short(route.refundTo)}.</p>
          )}
        </div>
      )}

      {route.phase === 'swapping_in' && (
        <div className="panel panel--strong">
          <h2 className="panel__title">Swapping to ZEC</h2>
          <p className="panel__sub">Deposit received. The swap provider is converting it and paying ZEC to your Zcash address {short(route.zecAddress, 6)}.</p>
          <TxLinks txs={route.in.originTx} label="Deposit" />
        </div>
      )}

      {route.phase === 'holding' && (
        <div className="panel panel--strong">
          <h2 className="panel__title">In the shielded pool</h2>
          <div className="hold">
            <p className="hold__time">{duration(holdLeft)}</p>
            <p className="panel__sub">
              {num(zecReceived(route), 6)} ZEC reached your Zcash wallet. Keep it there until the timer ends. The exact moment was picked at random inside {route.holdHours[0]}–{route.holdHours[1]} hours.
            </p>
          </div>
          {isTransparentZec(route.zecAddress) && (
            <p className="notice">It arrived at a transparent address. Shield it in your Zcash wallet now so it moves into the shielded pool.</p>
          )}
          <TxLinks txs={route.in.destTx} label="ZEC payout" />
        </div>
      )}

      {route.phase === 'ready_to_return' && <ReturnPanel route={route} />}

      {route.phase === 'returning' && (
        <div className="panel panel--strong">
          <h2 className="panel__title">Step 3 · Send ZEC back</h2>
          <p className="panel__sub">From your Zcash wallet, send each amount to its own address. Sending them at different times adds more timing noise.</p>
          <div className="out-list">
            {route.out.map((l, i) => (
              <div key={l.depositAddress} className="out-item">
                <div className="out-item__head">
                  <p className="label">
                    Wallet {i + 1} · {l.label || short(l.recipient)} · {l.pct}%
                  </p>
                  <span className={`status status--${l.status === 'SUCCESS' ? 'done' : l.status === 'REFUNDED' || l.status === 'FAILED' ? 'warn' : 'live'}`}>
                    {l.status === 'PENDING_DEPOSIT' ? 'Waiting for ZEC' : l.status === 'SUCCESS' ? 'Arrived' : l.status.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                {l.status === 'PENDING_DEPOSIT' || l.status === 'INCOMPLETE_DEPOSIT' ? (
                  <DepositBox leg={l} />
                ) : (
                  <>
                    <p className="panel__sub">
                      {l.status === 'SUCCESS'
                        ? `${num(fromBase(l.finalAmountOut ?? l.amountOut, ASSETS[l.to].decimals), 4)} ${l.to} landed on ${short(l.recipient)}.`
                        : 'Deposit seen, swap in progress.'}
                    </p>
                    <TxLinks txs={l.destTx} label="Payout" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {route.phase === 'completed' && (
        <div className="panel panel--strong">
          <h2 className="panel__title">Arrived on Solana</h2>
          <ul className="split-preview">
            {route.out.map((l) => (
              <li key={l.depositAddress}>
                <a className="mono tx-link" href={solscanAccount(l.recipient)} target="_blank" rel="noopener noreferrer">
                  {l.label ? `${l.label} · ` : ''}
                  {short(l.recipient)}
                </a>
                <span>
                  {num(fromBase(l.finalAmountOut ?? l.amountOut, ASSETS[l.to].decimals), 4)} {l.to}
                </span>
              </li>
            ))}
          </ul>
          <div className="btn-row">
            <Link to="/app/new" className="btn btn--solid">
              Plan another route
            </Link>
          </div>
        </div>
      )}

      {(route.phase === 'refunded' || route.phase === 'failed' || route.phase === 'expired') && (
        <div className="panel panel--strong">
          <h2 className="panel__title">
            {route.phase === 'expired' ? 'Deposit window closed' : route.phase === 'refunded' ? 'Refunded' : 'Swap failed'}
          </h2>
          <p className="panel__sub">
            {route.phase === 'expired'
              ? 'No deposit arrived before the address closed. If you sent funds after it closed, they are refunded to your refund address.'
              : `Funds were or will be returned to the refund address of the leg that stopped. ${route.in.refundReason ?? ''}`}
          </p>
          <TxLinks txs={[...route.in.destTx, ...route.out.flatMap((l) => l.destTx)]} label="Transactions" />
          <div className="btn-row">
            <Link to="/app/new" className="btn btn--solid">
              Start a new route
            </Link>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="panel">
          <h3 className="panel__title">Details</h3>
          <dl className="kv">
            <div>
              <dt>Send</dt>
              <dd>
                {route.in.amountInFormatted} {route.source} · {usd(Number(route.in.amountInUsd))}
              </dd>
            </div>
            <div>
              <dt>ZEC quoted</dt>
              <dd>{route.in.amountOutFormatted} ZEC</dd>
            </div>
            <div>
              <dt>Land as</dt>
              <dd>{route.landAs}</dd>
            </div>
            <div>
              <dt>Hold window</dt>
              <dd>
                {route.holdHours[0]}–{route.holdHours[1]} hours
              </dd>
            </div>
            <div>
              <dt>Zcash address</dt>
              <dd className="mono">{short(route.zecAddress, 8)}</dd>
            </div>
            <div>
              <dt>Refund address</dt>
              <dd className="mono">{short(route.refundTo, 6)}</dd>
            </div>
          </dl>
        </div>
        <div className="panel">
          <h3 className="panel__title">Destinations</h3>
          <ul className="split-preview">
            {route.outputs.map((o) => (
              <li key={o.address}>
                <a className="mono tx-link" href={solscanAccount(o.address)} target="_blank" rel="noopener noreferrer">
                  {o.label ? `${o.label} · ` : ''}
                  {short(o.address)}
                </a>
                <span>{o.pct}%</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--sm"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              if (confirm('Remove this route from this browser? Swaps already running are not affected.')) {
                routes.remove(route.id)
                navigate('/app/routes')
              }
            }}
          >
            Remove from this browser
          </button>
        </div>
      </div>
    </>
  )
}
