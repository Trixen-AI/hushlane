// Route records and their lifecycle. A route is two real swap legs with a hold between them:
//   in:  SOL/USDC (Solana) -> ZEC, paid to the user's own Zcash address
//   hold: a random wait inside the shielded pool
//   out: one ZEC -> SOL/USDC swap per destination wallet
import { useEffect } from 'react'
import { FINAL, fromBase, getStatus, type AssetKey, type Quote, type StatusResponse, type SwapStatus } from './oneclick'
import { useStore } from './store'

export type Leg = {
  depositAddress: string
  from: AssetKey
  to: AssetKey
  amountIn: string
  amountInFormatted: string
  amountInUsd: string
  amountOut: string
  amountOutFormatted: string
  amountOutUsd: string
  minAmountOut: string
  deadline: string
  timeEstimate: number
  recipient: string
  status: SwapStatus
  updatedAt: string
  originTx: { hash: string; explorerUrl: string }[]
  destTx: { hash: string; explorerUrl: string }[]
  finalAmountOut?: string
  refundReason?: string | null
  sentTx?: string
}

export type Output = { address: string; label: string; pct: number }

export type Phase =
  | 'awaiting_deposit'
  | 'swapping_in'
  | 'holding'
  | 'ready_to_return'
  | 'returning'
  | 'completed'
  | 'refunded'
  | 'failed'
  | 'expired'

export type Route = {
  id: string
  createdAt: number
  source: AssetKey
  landAs: AssetKey
  refundTo: string
  zecAddress: string
  outputs: Output[]
  holdHours: [number, number]
  holdStartedAt?: number
  holdUntil?: number
  in: Leg
  out: (Leg & { pct: number; label: string })[]
  phase: Phase
}

export const HOLD_OPTIONS: { label: string; hours: [number, number] }[] = [
  { label: '1–3 hours', hours: [1, 3] },
  { label: '3–6 hours', hours: [3, 6] },
  { label: '6–12 hours', hours: [6, 12] },
  { label: '12–24 hours', hours: [12, 24] },
]

export function legFromQuote(q: Quote, from: AssetKey, to: AssetKey, recipient: string): Leg {
  if (!q.depositAddress) throw new Error('The swap provider did not return a deposit address.')
  return {
    depositAddress: q.depositAddress,
    from,
    to,
    amountIn: q.amountIn,
    amountInFormatted: q.amountInFormatted,
    amountInUsd: q.amountInUsd,
    amountOut: q.amountOut,
    amountOutFormatted: q.amountOutFormatted,
    amountOutUsd: q.amountOutUsd,
    minAmountOut: q.minAmountOut,
    deadline: q.deadline ?? new Date(Date.now() + 24 * 3600_000).toISOString(),
    timeEstimate: q.timeEstimate,
    recipient,
    status: 'PENDING_DEPOSIT',
    updatedAt: new Date().toISOString(),
    originTx: [],
    destTx: [],
  }
}

/* ---------------- Store ---------------- */

type State = { items: Route[] }
const KEY = 'hushlane.routes.v1'
let state: State = { items: [] }
try {
  const raw = localStorage.getItem(KEY)
  if (raw) state = JSON.parse(raw)
} catch {
  /* ignore */
}
const listeners = new Set<() => void>()
function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}
window.addEventListener('storage', (e) => {
  if (e.key === KEY && e.newValue) {
    try {
      state = JSON.parse(e.newValue)
      listeners.forEach((l) => l())
    } catch {
      /* ignore */
    }
  }
})

export const routeStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export const routes = {
  add(r: Route) {
    set({ items: [r, ...state.items] })
  },
  update(id: string, patch: Partial<Route> | ((r: Route) => Route)) {
    set({ items: state.items.map((r) => (r.id === id ? (typeof patch === 'function' ? patch(r) : { ...r, ...patch }) : r)) })
  },
  remove(id: string) {
    set({ items: state.items.filter((r) => r.id !== id) })
  },
  replaceAll(items: Route[]) {
    set({ items })
  },
}

export const useRoutes = () => useStore(routeStore, (s) => s.items)
export const useRoute = (id: string | undefined) => useStore(routeStore, (s) => s.items.find((r) => r.id === id))

/* ---------------- Lifecycle ---------------- */

/** Cryptographically random hold end inside the chosen window. */
export function randomHoldUntil(from: number, [min, max]: [number, number]) {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  const span = (max - min) * 3600_000
  return from + min * 3600_000 + Math.floor((buf[0] / 0xffffffff) * span)
}

function applyStatus(leg: Leg, s: StatusResponse): Leg {
  return {
    ...leg,
    status: s.status,
    updatedAt: s.updatedAt,
    originTx: s.swapDetails.originChainTxHashes ?? leg.originTx,
    destTx: s.swapDetails.destinationChainTxHashes ?? leg.destTx,
    finalAmountOut: s.swapDetails.amountOut ?? leg.finalAmountOut,
    refundReason: s.swapDetails.refundReason,
  }
}

/** Derives the route phase from its legs and the clock. */
export function derivePhase(r: Route, now = Date.now()): Phase {
  const inS = r.in.status
  if (inS === 'REFUNDED') return 'refunded'
  if (inS === 'FAILED') return 'failed'
  if (inS !== 'SUCCESS') {
    if (inS === 'PENDING_DEPOSIT' && new Date(r.in.deadline).getTime() < now) return 'expired'
    return inS === 'PENDING_DEPOSIT' || inS === 'INCOMPLETE_DEPOSIT' ? 'awaiting_deposit' : 'swapping_in'
  }
  if (r.out.length === 0) return r.holdUntil && now >= r.holdUntil ? 'ready_to_return' : 'holding'
  if (r.out.every((l) => l.status === 'SUCCESS')) return 'completed'
  if (r.out.some((l) => l.status === 'FAILED')) return 'failed'
  if (r.out.every((l) => FINAL.includes(l.status)) && r.out.some((l) => l.status === 'REFUNDED')) return 'refunded'
  return 'returning'
}

/** ZEC received from the in-leg, as a number. */
export const zecReceived = (r: Route) => fromBase(r.in.finalAmountOut ?? r.in.amountOut, 8)

export async function syncRoute(r: Route, signal?: AbortSignal) {
  let next = { ...r }
  if (!FINAL.includes(r.in.status)) {
    next.in = applyStatus(r.in, await getStatus(r.in.depositAddress, signal))
  }
  if (next.in.status === 'SUCCESS' && !next.holdUntil) {
    next.holdStartedAt = Date.now()
    next.holdUntil = randomHoldUntil(next.holdStartedAt, next.holdHours)
  }
  if (next.out.length) {
    const outs = await Promise.all(
      next.out.map(async (l) => (FINAL.includes(l.status) ? l : { ...l, ...applyStatus(l, await getStatus(l.depositAddress, signal)) })),
    )
    next = { ...next, out: outs }
  }
  next.phase = derivePhase(next)
  routes.update(r.id, () => next)
  return next
}

const ACTIVE: Phase[] = ['awaiting_deposit', 'swapping_in', 'holding', 'ready_to_return', 'returning']
export const isActive = (r: Route) => ACTIVE.includes(r.phase)

/** Polls every active route every 15 s while the dashboard is open, and re-derives clock-based phases. */
export function useRouteSync() {
  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    const tick = async () => {
      for (const r of routeStore.get().items.filter(isActive)) {
        if (!alive) return
        const needsNetwork = !FINAL.includes(r.in.status) || r.out.some((l) => !FINAL.includes(l.status))
        try {
          if (needsNetwork) await syncRoute(r, ctrl.signal)
          else {
            const phase = derivePhase(r)
            if (phase !== r.phase) routes.update(r.id, { phase })
          }
        } catch {
          /* keep last known state; retry next tick */
        }
      }
    }
    tick()
    const t = setInterval(tick, 15_000)
    return () => {
      alive = false
      ctrl.abort()
      clearInterval(t)
    }
  }, [])
}

export const PHASE_LABEL: Record<Phase, string> = {
  awaiting_deposit: 'Waiting for deposit',
  swapping_in: 'Swapping to ZEC',
  holding: 'In the shielded pool',
  ready_to_return: 'Ready to swap back',
  returning: 'Swapping back',
  completed: 'Arrived',
  refunded: 'Refunded',
  failed: 'Failed',
  expired: 'Expired',
}

export const phaseTone = (p: Phase) =>
  p === 'completed' ? 'done' : p === 'refunded' || p === 'failed' || p === 'expired' ? 'warn' : p === 'ready_to_return' ? 'live' : 'live'

/** Step index 0..3 on the four-step tracker. */
export const phaseStep = (p: Phase) =>
  p === 'awaiting_deposit' || p === 'swapping_in' ? 0 : p === 'holding' ? 1 : p === 'ready_to_return' || p === 'returning' ? 2 : 3
