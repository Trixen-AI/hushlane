// Live USD prices for SOL, ZEC and USDC (CoinGecko public API), cached for a minute.
import { useEffect, useState } from 'react'

export type Prices = { SOL: number; ZEC: number; USDC: number; updatedAt: number }

let cache: Prices | null = null
let inflight: Promise<Prices> | null = null

export async function fetchPrices(): Promise<Prices> {
  if (cache && Date.now() - cache.updatedAt < 60_000) return cache
  if (inflight) return inflight
  inflight = fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,zcash,usd-coin&vs_currencies=usd')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`prices ${r.status}`))))
    .then((j: Record<string, { usd: number }>) => {
      cache = { SOL: j.solana?.usd ?? 0, ZEC: j.zcash?.usd ?? 0, USDC: j['usd-coin']?.usd ?? 1, updatedAt: Date.now() }
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** Prices refreshed every 60 s. `null` until the first response; `error` set if it fails. */
export function usePrices() {
  const [prices, setPrices] = useState<Prices | null>(cache)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    const load = () =>
      fetchPrices()
        .then((p) => alive && (setPrices(p), setError(null)))
        .catch((e: Error) => alive && setError(e.message))
    load()
    const t = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])
  return { prices, error }
}

export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const num = (n: number, d = 4) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
