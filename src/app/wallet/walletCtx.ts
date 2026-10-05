import { createContext, useContext } from 'react'

export type WalletApi = {
  configured: boolean
  address: string | undefined
  isConnected: boolean
  open: () => void
  openAccount: () => void
  disconnect: () => void
  /** Sends `amount` (base units) of SOL or USDC to `to`. Returns the transaction signature. */
  send: (asset: 'SOL' | 'USDC', to: string, amount: bigint) => Promise<string>
}

export const notConfigured: WalletApi = {
  configured: false,
  address: undefined,
  isConnected: false,
  open: () => {},
  openAccount: () => {},
  disconnect: () => {},
  send: () => Promise.reject(new Error('Wallet connection is not configured. Set VITE_REOWN_PROJECT_ID.')),
}

export const Ctx = createContext<WalletApi>(notConfigured)
export const useWallet = () => useContext(Ctx)
