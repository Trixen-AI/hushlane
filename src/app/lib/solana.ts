// Minimal Solana JSON-RPC client for reading real wallet data from the browser.
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { settingsStore } from './store'

export const SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const LAMPORTS_PER_SOL = 1_000_000_000

const PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined
const ENV_RPC = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined

/**
 * RPC endpoint, in order of preference: user setting, env var, Reown RPC (project id), then a public
 * endpoint that allows browser calls (api.mainnet-beta.solana.com answers 403 to browsers).
 */
export function rpcUrl() {
  const fromSettings = settingsStore.get().rpcUrl.trim()
  if (fromSettings) return fromSettings
  if (ENV_RPC) return ENV_RPC
  if (PROJECT_ID) return `https://rpc.walletconnect.org/v1/?chainId=${SOLANA_MAINNET}&projectId=${PROJECT_ID}`
  return 'https://solana-rpc.publicnode.com'
}

let nextId = 1
export async function rpc<T>(method: string, params: unknown[] = [], signal?: AbortSignal): Promise<T> {
  const res = await fetch(rpcUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    signal,
  })
  if (!res.ok) throw new Error(`RPC ${method} failed (${res.status})`)
  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (json.error) throw new Error(json.error.message)
  return json.result as T
}

export async function getSolBalance(address: string, signal?: AbortSignal) {
  const r = await rpc<{ value: number }>('getBalance', [address, { commitment: 'confirmed' }], signal)
  return r.value / LAMPORTS_PER_SOL
}

/**
 * Token balance held in the owner's associated token account, read with getAccountInfo.
 * Searching by mint (getTokenAccountsByOwner) and getTokenAccountBalance are "indexed" calls
 * that many free public RPCs refuse; a plain account read works everywhere.
 */
export async function getTokenBalance(owner: string, mint: string, signal?: AbortSignal) {
  const ata = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner), true).toBase58()
  const r = await rpc<{ value: { data: { parsed?: { info?: { tokenAmount?: { uiAmount: number | null } } } } } | null }>(
    'getAccountInfo',
    [ata, { encoding: 'jsonParsed', commitment: 'confirmed' }],
    signal,
  )
  // No token account yet means a zero balance.
  return r.value?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
}

export type SigInfo = { signature: string; blockTime: number | null; err: unknown; slot: number }

export async function getSignatures(address: string, limit = 10, signal?: AbortSignal) {
  return rpc<SigInfo[]>('getSignaturesForAddress', [address, { limit, commitment: 'confirmed' }], signal)
}

export async function getSignatureStatus(signature: string, signal?: AbortSignal) {
  const r = await rpc<{ value: ({ confirmationStatus: string; err: unknown } | null)[] }>(
    'getSignatureStatuses',
    [[signature], { searchTransactionHistory: true }],
    signal,
  )
  return r.value[0]
}

/* ---------------- Address validation ---------------- */

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** Decodes base58 and checks the result is a 32-byte public key. */
export function isSolanaAddress(input: string) {
  const s = input.trim()
  if (s.length < 32 || s.length > 44) return false
  let bytes: number[] = []
  for (const ch of s) {
    const v = B58.indexOf(ch)
    if (v < 0) return false
    let carry = v
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58
      bytes[i] = carry & 0xff
      carry >>= 8
    }
    while (carry) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  for (const ch of s) {
    if (ch !== '1') break
    bytes.push(0)
  }
  bytes = bytes.reverse()
  return bytes.length === 32
}

export const solscanTx = (sig: string) => `https://solscan.io/tx/${sig}`
export const solscanAccount = (addr: string) => `https://solscan.io/account/${addr}`
export const short = (addr: string, n = 4) => (addr.length > n * 2 + 1 ? `${addr.slice(0, n)}…${addr.slice(-n)}` : addr)
