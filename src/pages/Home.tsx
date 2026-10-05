import { Hero } from '@/components/sections/Hero'
import { Metrics } from '@/components/sections/Metrics'
import { Design } from '@/components/sections/Design'
import { Wallets } from '@/components/sections/Wallets'
import { HowItMoves } from '@/components/sections/HowItMoves'
import { Principles } from '@/components/sections/Principles'
import { Guides } from '@/components/sections/Guides'
import { usePageMeta } from '@/hooks/usePageMeta'

export function Home() {
  usePageMeta(
    'Hushlane | Send on Solana. Vanish in Zcash.',
    "Route SOL or USDC through Zcash's shielded pool and land it on up to five Solana wallets. No account, no custody, fees shown before you send.",
    '/',
  )
  return (
    <main>
      <Hero />
      <Metrics />
      <Design />
      <Wallets />
      <HowItMoves />
      <Principles />
      <Guides />
    </main>
  )
}
