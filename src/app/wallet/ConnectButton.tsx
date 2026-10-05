import { short } from '../lib/solana'
import { num } from '../lib/prices'
import { useBalances } from './useBalances'
import { useWallet } from './walletCtx'

export function ConnectButton() {
  const w = useWallet()
  const { data } = useBalances(w.address)

  if (!w.configured)
    return (
      <span className="btn btn--sm" title="Set VITE_REOWN_PROJECT_ID in .env to enable wallet connection" aria-disabled="true" style={{ opacity: 0.5 }}>
        Wallet connect off
      </span>
    )

  if (!w.isConnected || !w.address)
    return (
      <button type="button" className="btn btn--solid" onClick={w.open}>
        Connect wallet
      </button>
    )

  return (
    <button type="button" className="btn wallet-chip" onClick={w.openAccount} aria-label="Wallet account">
      <span className="wallet-chip__dot" aria-hidden="true" />
      <span className="mono">{short(w.address)}</span>
      {data && <span className="wallet-chip__bal">{num(data.sol, 3)} SOL</span>}
    </button>
  )
}
