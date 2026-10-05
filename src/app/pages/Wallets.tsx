import { useEffect, useState } from 'react'
import { getSignatures, getSolBalance, getTokenBalance, isSolanaAddress, short, solscanAccount, USDC_MINT } from '../lib/solana'
import { useStore, walletStore, wallets, type SavedWallet } from '../lib/store'
import { num } from '../lib/prices'
import { CopyField } from '../components/ui'
import { useWallet } from '../wallet/walletCtx'

type Info = { sol: number | null; usdc: number | null; txCount: number | null; capped: boolean }

/** Live balance and history check for a saved wallet. "Fresh" means no transactions yet. */
function useWalletInfo(address: string) {
  const [info, setInfo] = useState<Info | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    const ctrl = new AbortController()
    Promise.allSettled([getSolBalance(address, ctrl.signal), getTokenBalance(address, USDC_MINT, ctrl.signal), getSignatures(address, 20, ctrl.signal)]).then(
      ([sol, usdc, sigs]) => {
        if (ctrl.signal.aborted) return
        const v = <T,>(r: PromiseSettledResult<T>) => (r.status === 'fulfilled' ? r.value : null)
        const s = v(sigs)
        if ([sol, usdc, sigs].every((r) => r.status === 'rejected')) setError(true)
        else setInfo({ sol: v(sol), usdc: v(usdc), txCount: s ? s.length : null, capped: (s?.length ?? 0) >= 20 })
      },
    )
    return () => ctrl.abort()
  }, [address])
  return { info, error }
}

function WalletRow({ w }: { w: SavedWallet }) {
  const { info, error } = useWalletInfo(w.address)
  const [label, setLabel] = useState(w.label)
  return (
    <tr>
      <td>
        <input className="input input--inline" value={label} aria-label="Label" onChange={(e) => setLabel(e.target.value)} onBlur={() => wallets.rename(w.address, label.trim() || 'Wallet')} />
      </td>
      <td>
        <a className="mono tx-link" href={solscanAccount(w.address)} target="_blank" rel="noopener noreferrer">
          {short(w.address, 6)}
        </a>
      </td>
      <td>{info ? (info.sol != null ? num(info.sol, 4) : 'n/a') : error ? 'n/a' : '…'}</td>
      <td>{info ? (info.usdc != null ? num(info.usdc, 2) : 'n/a') : error ? 'n/a' : '…'}</td>
      <td>
        {info && info.txCount != null ? (
          info.txCount === 0 ? (
            <span className="status status--done">Fresh</span>
          ) : (
            <span className="status status--idle">
              {info.txCount}
              {info.capped ? '+' : ''} tx
            </span>
          )
        ) : null}
      </td>
      <td>
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => {
            if (confirm(`Remove ${label || 'this wallet'} from saved wallets?`)) wallets.remove(w.address)
          }}
        >
          Remove
        </button>
      </td>
    </tr>
  )
}

export function Wallets() {
  const items = useStore(walletStore, (s) => s.items)
  const connected = useWallet()
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const valid = isSolanaAddress(address)
  const exists = items.some((w) => w.address === address.trim())

  return (
    <>
      <div className="split">
        <div className="panel panel--strong">
          <h2 className="panel__title">Destination wallets</h2>
          <p className="panel__sub">Save the wallets you route to. A fresh wallet, one with no history yet, keeps your old activity out of view.</p>
          <form
            className="add-wallet"
            onSubmit={(e) => {
              e.preventDefault()
              if (!valid || exists) return
              wallets.add(address.trim(), label)
              setAddress('')
              setLabel('')
            }}
          >
            <input className="input mono" placeholder="Solana address" value={address} spellCheck={false} aria-label="Solana address" aria-invalid={address !== '' && !valid} onChange={(e) => setAddress(e.target.value.trim())} />
            <input className="input" placeholder="Label (optional)" value={label} aria-label="Label" onChange={(e) => setLabel(e.target.value)} />
            <button type="submit" className="btn btn--solid" disabled={!valid || exists}>
              Save
            </button>
          </form>
          {exists && <p className="faint">Already saved.</p>}
        </div>
        <div className="panel panel--paper">
          <h2 className="panel__title">Tips</h2>
          <ul className="tips">
            <li>Use wallets you control and plan to keep.</li>
            <li>Avoid sending everything from a destination straight back to your source wallet.</li>
            <li>Uneven splits look less like one payment cut into parts.</li>
          </ul>
          {connected.isConnected && connected.address && (
            <div className="field">
              <p className="label">Connected wallet</p>
              <CopyField value={connected.address} />
              <p className="faint">This is your source wallet. Routing back to it joins both ends of the route, so it is not offered as a destination.</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel__title">Saved ({items.length})</h2>
        {items.length === 0 ? (
          <div className="empty">
            <p className="empty__title">No saved wallets</p>
            <p className="panel__sub">Saved wallets show up as one-tap picks when you build a route.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Address</th>
                  <th>SOL</th>
                  <th>USDC</th>
                  <th>History</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <WalletRow key={w.address} w={w} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
