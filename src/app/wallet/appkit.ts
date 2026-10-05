// Reown AppKit modal, Solana mainnet only. Created once, and only when a project id is configured.
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana } from '@reown/appkit/networks'

export const REOWN_PROJECT_ID = (import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined)?.trim() || ''
export const walletConfigured = REOWN_PROJECT_ID.length > 0

let created = false

export function initAppKit() {
  if (created || !walletConfigured) return
  created = true
  createAppKit({
    adapters: [new SolanaAdapter()],
    networks: [solana],
    defaultNetwork: solana,
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: 'Hushlane',
      description: 'Send on Solana. Vanish in Zcash.',
      url: window.location.origin,
      icons: [`${window.location.origin}/brand/logo-500.png`],
    },
    features: { analytics: false, email: false, socials: false, swaps: false, onramp: false, history: false },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#0e0b1a',
      '--w3m-color-mix': '#cdbdff',
      '--w3m-color-mix-strength': 20,
      '--w3m-font-family': "'Inter Variable', Inter, system-ui, sans-serif",
      '--w3m-border-radius-master': '2px',
      '--w3m-z-index': 100,
    },
  })
}
