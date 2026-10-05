// Local, per-browser storage for the dashboard. Hushlane has no account and no server,
// so routes, saved wallets and settings live only in this browser.
import { useSyncExternalStore } from 'react'

type Listener = () => void

function createStore<T>(key: string, initial: T) {
  let state: T = initial
  try {
    const raw = localStorage.getItem(key)
    if (raw) state = { ...initial, ...JSON.parse(raw) }
  } catch {
    /* storage blocked or corrupt: start fresh */
  }
  const listeners = new Set<Listener>()
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* ignore quota / private mode */
    }
  }
  const store = {
    get: () => state,
    set: (next: T | ((s: T) => T)) => {
      state = typeof next === 'function' ? (next as (s: T) => T)(state) : next
      persist()
      listeners.forEach((l) => l())
    },
    subscribe: (l: Listener) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
  // Keep tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== key || !e.newValue) return
    try {
      state = { ...initial, ...JSON.parse(e.newValue) }
      listeners.forEach((l) => l())
    } catch {
      /* ignore */
    }
  })
  return store
}

export function useStore<T, S>(store: { get: () => T; subscribe: (l: Listener) => () => void }, select: (s: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => select(store.get()))
}

/* ---------------- Saved destination wallets ---------------- */

export type SavedWallet = { address: string; label: string; addedAt: number }

export const walletStore = createStore<{ items: SavedWallet[] }>('hushlane.wallets.v1', { items: [] })

export const wallets = {
  add(address: string, label: string) {
    walletStore.set((s) =>
      s.items.some((w) => w.address === address) ? s : { items: [...s.items, { address, label: label.trim() || 'Wallet', addedAt: Date.now() }] },
    )
  },
  rename(address: string, label: string) {
    walletStore.set((s) => ({ items: s.items.map((w) => (w.address === address ? { ...w, label } : w)) }))
  },
  remove(address: string) {
    walletStore.set((s) => ({ items: s.items.filter((w) => w.address !== address) }))
  },
}

/* ---------------- Settings ---------------- */

export type Settings = {
  rpcUrl: string
  defaultHold: string
  defaultLandAs: 'SOL' | 'USDC'
  slippageBps: number
}

export const settingsStore = createStore<Settings>('hushlane.settings.v1', {
  rpcUrl: '',
  defaultHold: '1–3 hours',
  defaultLandAs: 'SOL',
  slippageBps: 100,
})
