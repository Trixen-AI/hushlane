import { useCallback, useEffect, useState } from 'react'
import { getSignatures, getSolBalance, getTokenBalance, USDC_MINT, type SigInfo } from '../lib/solana'

export type Balances = { sol: number; usdc: number; recent: SigInfo[] }

/** Real on-chain balances and recent activity for an address, refreshed every 30 s. */
export function useBalances(address: string | undefined, withActivity = false) {
  const [data, setData] = useState<Balances | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!address) return
    const ctrl = new AbortController()
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const [sol, usdc, recent] = await Promise.all([
          getSolBalance(address, ctrl.signal),
          getTokenBalance(address, USDC_MINT, ctrl.signal),
          withActivity ? getSignatures(address, 6, ctrl.signal) : Promise.resolve([] as SigInfo[]),
        ])
        if (alive) {
          setData({ sol, usdc, recent })
          setError(null)
        }
      } catch (e) {
        if (alive && !ctrl.signal.aborted) setError((e as Error).message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 30_000)
    return () => {
      alive = false
      ctrl.abort()
      clearInterval(t)
    }
  }, [address, withActivity, nonce])

  const refresh = useCallback(() => setNonce((n) => n + 1), [])
  return { data: address ? data : null, error: address ? error : null, loading, refresh }
}
