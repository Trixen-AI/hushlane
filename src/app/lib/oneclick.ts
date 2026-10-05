// NEAR Intents 1Click API client (https://1click.chaindefuser.com). Browser-safe: CORS is open
// and no key is required. Each quote returns a one-off deposit address; the swap runs once
// funds arrive there, and /v0/status reports progress.

const BASE = 'https://1click.chaindefuser.com'
const JWT = import.meta.env.VITE_ONECLICK_JWT as string | undefined

/** Hushlane service fee, paid through the 1Click appFees field to a NEAR account. */
export const FEE_RECIPIENT = (import.meta.env.VITE_FEE_RECIPIENT as string | undefined)?.trim() || ''
export const FEE_BPS = FEE_RECIPIENT ? Number(import.meta.env.VITE_FEE_BPS ?? 30) || 0 : 0

export const ASSETS = {
  SOL: { id: 'nep141:sol.omft.near', decimals: 9, symbol: 'SOL', chain: 'sol' },
  USDC: { id: 'nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near', decimals: 6, symbol: 'USDC', chain: 'sol' },
  ZEC: { id: 'nep141:zec.omft.near', decimals: 8, symbol: 'ZEC', chain: 'zec' },
} as const
export type AssetKey = keyof typeof ASSETS

export type SwapStatus =
  | 'PENDING_DEPOSIT'
  | 'KNOWN_DEPOSIT_TX'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'INCOMPLETE_DEPOSIT'
  | 'REFUNDED'
  | 'FAILED'

export const FINAL: SwapStatus[] = ['SUCCESS', 'REFUNDED', 'FAILED']

export type Quote = {
  amountIn: string
  amountInFormatted: string
  amountInUsd: string
  minAmountIn: string
  amountOut: string
  amountOutFormatted: string
  amountOutUsd: string
  minAmountOut: string
  timeEstimate: number
  deadline?: string
  depositAddress?: string
  refundFee?: string
  withdrawFee?: string
}

export type QuoteParams = {
  from: AssetKey
  to: AssetKey
  /** amount in base units of `from` */
  amount: bigint
  recipient: string
  refundTo: string
  slippageBps: number
  dry: boolean
  /** hours the deposit address stays open */
  validHours?: number
  /** charge the Hushlane service fee on this leg (the in-leg only, so the total stays 0.3%) */
  withFee?: boolean
}

export class OneClickError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (JWT) headers.Authorization = `Bearer ${JWT}`
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as Record<string, string>) } })
  } catch {
    throw new OneClickError('Could not reach the swap provider. Check your connection and try again.')
  }
  const body = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) throw new OneClickError(body.message ? capitalise(body.message) : `Swap provider error (${res.status})`)
  return body
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function getQuote(p: QuoteParams, signal?: AbortSignal) {
  const deadline = new Date(Date.now() + (p.validHours ?? 24) * 3600_000).toISOString()
  const body = {
    dry: p.dry,
    swapType: 'EXACT_INPUT',
    slippageTolerance: p.slippageBps,
    originAsset: ASSETS[p.from].id,
    depositType: 'ORIGIN_CHAIN',
    destinationAsset: ASSETS[p.to].id,
    amount: p.amount.toString(),
    refundTo: p.refundTo.trim(),
    refundType: 'ORIGIN_CHAIN',
    recipient: p.recipient.trim(),
    recipientType: 'DESTINATION_CHAIN',
    deadline,
    ...(p.withFee && FEE_BPS > 0 ? { appFees: [{ recipient: FEE_RECIPIENT, fee: FEE_BPS }] } : {}),
  }
  const r = await call<{ quote: Quote }>('/v0/quote', { method: 'POST', body: JSON.stringify(body), signal })
  return r.quote
}

export type StatusResponse = {
  status: SwapStatus
  updatedAt: string
  swapDetails: {
    amountIn: string | null
    amountInFormatted: string | null
    amountOut: string | null
    amountOutFormatted: string | null
    amountOutUsd: string | null
    depositedAmountFormatted: string | null
    refundedAmountFormatted: string | null
    refundReason: string | null
    originChainTxHashes: { hash: string; explorerUrl: string }[]
    destinationChainTxHashes: { hash: string; explorerUrl: string }[]
  }
}

export function getStatus(depositAddress: string, signal?: AbortSignal) {
  return call<StatusResponse>(`/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`, { signal })
}

/** Optional: tell 1Click about a deposit tx so it is picked up sooner. Failures are harmless. */
export async function submitDeposit(depositAddress: string, txHash: string) {
  try {
    await call('/v0/deposit/submit', { method: 'POST', body: JSON.stringify({ depositAddress, txHash }) })
  } catch {
    /* the swap still runs once the deposit is seen on chain */
  }
}

/* ---------------- Amount helpers ---------------- */

export function toBase(amount: string | number, decimals: number): bigint {
  const s = typeof amount === 'number' ? amount.toFixed(decimals) : amount.trim()
  if (!/^\d*(\.\d*)?$/.test(s) || s === '' || s === '.') return 0n
  const [whole, frac = ''] = s.split('.')
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt((frac + '0'.repeat(decimals)).slice(0, decimals) || '0')
}

export function fromBase(v: bigint | string, decimals: number): number {
  const b = typeof v === 'string' ? BigInt(v || '0') : v
  return Number(b) / 10 ** decimals
}

/** Zcash address shape check (transparent t1/t3, Sapling zs, unified u1). 1Click does the real validation. */
export function looksLikeZcashAddress(s: string) {
  const v = s.trim()
  return /^t[13][1-9A-HJ-NP-Za-km-z]{33}$/.test(v) || /^zs1[0-9a-z]{75}$/.test(v) || /^u1[0-9a-z]{100,}$/.test(v)
}
export const isTransparentZec = (s: string) => /^t[13]/.test(s.trim())
