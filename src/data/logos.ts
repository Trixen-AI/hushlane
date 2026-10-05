// Official third-party logo files (see src/assets/logos/manifest.json for every source URL).
// Brands are named to identify the wallets and networks a route works with. Not a partnership claim.

const files = import.meta.glob('/src/assets/logos/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const social = import.meta.glob('/src/assets/social/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const pick = (map: Record<string, string>, dir: string, key: string) => map[`/src/assets/${dir}/${key}.svg`]

type Brand = { key: string; name: string }

const ROW_ONE: Brand[] = [
  { key: 'phantom', name: 'Phantom' },
  { key: 'solflare', name: 'Solflare' },
  { key: 'backpack', name: 'Backpack' },
  { key: 'ledger', name: 'Ledger' },
  { key: 'trezor', name: 'Trezor' },
  { key: 'exodus', name: 'Exodus' },
]
const ROW_TWO: Brand[] = [
  // solana.svg and usdc.svg have light text for dark backgrounds; the official marks work on light tiles.
  { key: 'solana-mark', name: 'Solana' },
  { key: 'zcash', name: 'Zcash' },
  { key: 'usdc-mark', name: 'USDC' },
  { key: 'trustwallet', name: 'Trust Wallet' },
  { key: 'coinbasewallet', name: 'Coinbase Wallet' },
  { key: 'okxwallet', name: 'OKX Wallet' },
]

const withSvg = (list: Brand[]) =>
  list.flatMap((b) => {
    const svg = pick(files, 'logos', b.key)
    return svg ? [{ ...b, svg }] : []
  })

export const walletRows = [withSvg(ROW_ONE), withSvg(ROW_TWO)]

// Social links. Only X for now.
const SOCIAL = [{ key: 'x', label: 'Hushlane on X', href: 'https://x.com/Hushlane_xyz' }]

// The icon sits on an ink disc, so the white X logo from the official kit is used.
export const socials = SOCIAL.map((s) => ({ ...s, svg: pick(social, 'social', `${s.key}-white`) ?? pick(social, 'social', s.key) }))
