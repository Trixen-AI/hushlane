import { Link, useNavigate } from 'react-router'
import { isActive, PHASE_LABEL, useRoutes, type Route } from '../lib/routes'
import { short, solscanAccount, solscanTx } from '../lib/solana'
import { useStore, walletStore } from '../lib/store'
import { num, usd, usePrices } from '../lib/prices'
import { PhasePill } from '../components/ui'
import { duration, timeAgo, useNow } from '../components/time'
import { useWallet } from '../wallet/walletCtx'
import { useBalances } from '../wallet/useBalances'

function nextAction(r: Route, now: number) {
  switch (r.phase) {
    case 'awaiting_deposit':
      return `Send ${r.in.amountInFormatted} ${r.source}`
    case 'swapping_in':
      return 'Swap to ZEC in progress'
    case 'holding':
      return r.holdUntil ? `Hold ends in ${duration(r.holdUntil - now)}` : 'In the pool'
    case 'ready_to_return':
      return 'Create return swaps'
    case 'returning': {
      const waiting = r.out.filter((l) => l.status === 'PENDING_DEPOSIT').length
      return waiting ? `Send ZEC to ${waiting} address${waiting > 1 ? 'es' : ''}` : 'Swapping back'
    }
    default:
      return PHASE_LABEL[r.phase]
  }
}

function WalletPanel() {
  const w = useWallet()
  const { data, error, loading, refresh } = useBalances(w.address, true)
  const { prices } = usePrices()

  if (!w.isConnected || !w.address)
    return (
      <div className="panel panel--paper">
        <h2 className="panel__title">Your wallet</h2>
        <p className="panel__sub">
          Connecting is optional. It shows your balances here, fills in your refund address and lets you send a deposit in one click. You can always send from any wallet instead.
        </p>
        <div className="btn-row">
          {w.configured ? (
            <button type="button" className="btn btn--solid" onClick={w.open}>
              Connect wallet
            </button>
          ) : (
            <p className="notice">Wallet connection is off. Add VITE_REOWN_PROJECT_ID to your .env file to turn it on.</p>
          )}
        </div>
      </div>
    )

  const totalUsd = data && prices ? data.sol * prices.SOL + data.usdc * prices.USDC : null
  return (
    <div className="panel panel--paper">
      <div className="panel__head">
        <div>
          <h2 className="panel__title">Your wallet</h2>
          <a className="mono faint tx-link" href={solscanAccount(w.address)} target="_blank" rel="noopener noreferrer">
            {short(w.address, 6)}
          </a>
        </div>
        <button type="button" className="btn btn--sm" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      {error && <p className="notice notice--warn">Could not read balances: {error}. You can set another RPC in Settings.</p>}
      <div className="grid-3">
        <div className="mini-stat">
          <p className="label">SOL</p>
          <p className="mini-stat__v">{data ? num(data.sol, 4) : '…'}</p>
          <p className="faint">{data && prices ? usd(data.sol * prices.SOL) : ' '}</p>
        </div>
        <div className="mini-stat">
          <p className="label">USDC</p>
          <p className="mini-stat__v">{data ? num(data.usdc, 2) : '…'}</p>
          <p className="faint">{data && prices ? usd(data.usdc * prices.USDC) : ' '}</p>
        </div>
        <div className="mini-stat">
          <p className="label">Total</p>
          <p className="mini-stat__v">{totalUsd != null ? usd(totalUsd) : '…'}</p>
          <p className="faint">SOL + USDC</p>
        </div>
      </div>
      {data && data.recent.length > 0 && (
        <div>
          <p className="label" style={{ marginBottom: 6 }}>
            Recent activity
          </p>
          <ul className="activity">
            {data.recent.map((s) => (
              <li key={s.signature}>
                <a className="mono tx-link" href={solscanTx(s.signature)} target="_blank" rel="noopener noreferrer">
                  {short(s.signature, 8)}
                </a>
                <span className={s.err ? 'status status--warn' : 'faint'}>{s.err ? 'failed' : s.blockTime ? timeAgo(s.blockTime * 1000) : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Overview() {
  const all = useRoutes()
  const saved = useStore(walletStore, (s) => s.items)
  const navigate = useNavigate()
  const now = useNow(1000)
  const active = all.filter(isActive)
  const completed = all.filter((r) => r.phase === 'completed')
  const routedUsd = completed.reduce((a, r) => a + Number(r.in.amountInUsd || 0), 0)

  return (
    <>
      <div className="grid-4">
        <div className="stat">
          <p className="label">Active routes</p>
          <p className="stat__value">{active.length}</p>
          <div className="stat__foot">
            <span className="muted">{active.filter((r) => r.phase === 'ready_to_return' || r.phase === 'awaiting_deposit').length} need you</span>
          </div>
        </div>
        <div className="stat">
          <p className="label">Completed</p>
          <p className="stat__value">{completed.length}</p>
          <div className="stat__foot">
            <span className="muted">{all.length} total in this browser</span>
          </div>
        </div>
        <div className="stat">
          <p className="label">Routed</p>
          <p className="stat__value">{usd(routedUsd)}</p>
          <div className="stat__foot">
            <span className="muted">Completed routes, value at send time</span>
          </div>
        </div>
        <div className="stat">
          <p className="label">Saved wallets</p>
          <p className="stat__value">{saved.length}</p>
          <div className="stat__foot">
            <Link to="/app/wallets" className="tx-link">
              Manage
            </Link>
          </div>
        </div>
      </div>

      <div className="split">
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">Active routes</h2>
            <Link to="/app/new" className="btn btn--solid btn--sm">
              New route
            </Link>
          </div>
          {active.length === 0 ? (
            <div className="empty">
              <p className="empty__title">No route in motion</p>
              <p className="panel__sub">Send on Solana, rest in Zcash’s shielded pool, land on up to five wallets.</p>
              <Link to="/app/new" className="btn btn--solid">
                Build a route
              </Link>
            </div>
          ) : (
            <ul className="route-cards">
              {active.map((r) => (
                <li key={r.id}>
                  <button type="button" className="route-card" onClick={() => navigate(`/app/routes/${r.id}`)}>
                    <div className="route-card__top">
                      <span className="route-card__amt">
                        {r.in.amountInFormatted} {r.source} → {r.outputs.length} wallet{r.outputs.length > 1 ? 's' : ''}
                      </span>
                      <PhasePill phase={r.phase} />
                    </div>
                    <div className="route-card__bottom">
                      <span>{nextAction(r, now)}</span>
                      <span className="faint">{timeAgo(r.createdAt)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <WalletPanel />
      </div>
    </>
  )
}
