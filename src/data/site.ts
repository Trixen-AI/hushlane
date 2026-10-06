// All site copy lives here. Written for Hushlane: Solana in, Zcash shielded pool, Solana out.

export const BRAND = 'Hushlane'

export const X_URL = 'https://x.com/HushlaneApp'

/** Main call to action, used in the header and the hero. Opens the dashboard. */
export const APP_PATH = '/app'
export const cta = { label: 'Launch App', href: APP_PATH }

export const announce = {
  lead: 'Send on Solana.',
  link: 'Vanish in Zcash.',
  href: '/#how',
}

export const nav = [
  { label: 'How it works', href: '/#how' },
  { label: 'Fees', href: '/#fees' },
  { label: 'Design', href: '/#design' },
  { label: 'Wallets', href: '/#wallets' },
  { label: 'Principles', href: '/#principles' },
  { label: 'Guides', href: '/#guides' },
]

export const navCta = cta

export const hero = {
  lines: [
    "Route SOL through Zcash's shielded pool to up to five wallets.",
    'No account, no wallet connect, no custody.',
  ],
  primary: cta,
  secondary: { label: 'See how it works', href: '/#how' },
  ticker: 'Keys are generated in your browser.',
}

/** Product facts shown in the metrics grid. These are spec values, not usage stats. */
export const facts = {
  wallets: { value: '5', unit: '', label: 'Solana wallets per route, at most', note: 'Set in the route planner' },
  pool: { label: 'Time your funds spend in the shielded pool', big: ['1–3', 'Hours'], note: 'Random per route' },
  fee: { value: '0.3', unit: '%', label: 'Service fee, shown before you send', note: 'Listed on every quote' },
  none: {
    cells: [
      { label: 'Accounts', value: 'None' },
      { label: 'Wallet connect', value: 'Never' },
      { label: 'Custody', value: 'Zero' },
    ],
    note: 'Fixed by design',
  },
  steps: { value: '4', label: 'Steps from send to arrival' },
  spread: { value: '~0.8%', label: 'Typical swap spread' },
}

export const design = {
  title: "Why it's built this way",
  items: [
    {
      icon: 'custody',
      title: 'Non-custodial',
      body: 'The site never holds funds or private keys. You sign every transfer yourself.',
    },
    {
      icon: 'noise',
      title: 'Timing noise',
      body: 'Random delays and split amounts make input and output harder to match.',
    },
    {
      icon: 'math',
      title: 'Open math',
      body: 'Fees are shown up front, before you send anything. Nothing is added later.',
    },
    {
      icon: 'keys',
      title: 'Keys in your browser',
      body: 'Route keys are generated on your device. There is nothing to sign up for and nothing kept on a server.',
    },
  ],
}

export const wallets = {
  title: 'Send from the wallet you already use',
  link: { label: 'Read the guides', href: '/#guides' },
}

export const how = {
  title: ['How a route ', 'moves'],
  steps: [
    {
      icon: 'step1',
      title: 'Swap to ZEC',
      body: "You send SOL from any wallet you control to a swap provider's deposit address.",
    },
    {
      icon: 'step2',
      title: 'Shielded pool',
      body: "The ZEC rests inside Zcash's shielded pool for a random stretch of one to three hours.",
    },
    {
      icon: 'step3',
      title: 'Swap back',
      body: 'ZEC converts back to SOL or USDC and is split between your wallets.',
    },
    {
      icon: 'step4',
      title: 'Arrive on Solana',
      body: 'Funds land on your wallets with no on-chain link to your source.',
    },
    {
      icon: 'split',
      title: 'Your split, your call',
      body: 'Add 1 to 5 wallets and set the percentage each one receives, or split equally.',
    },
    {
      icon: 'quote',
      title: 'A quote before you send',
      body: 'Service fee, swap spread and network fees are listed next to what you receive.',
    },
  ],
}

export const principles = {
  title: ['What every route ', 'includes'],
  // Poster art keys map to src/components/art/posters.tsx
  items: [
    { art: 'hours', title: 'Random hold time', body: 'Each route rests one to three hours inside the shielded pool.' },
    { art: 'five', title: 'Up to five wallets', body: 'Split one send across as many as five Solana addresses.' },
    { art: 'flat', title: 'One flat fee', body: 'A 0.3% service fee, quoted before anything moves.' },
    { art: 'nologin', title: 'No login', body: 'No account, no email and no wallet connect.' },
    { art: 'roundtrip', title: 'Round trip', body: 'SOL to ZEC, through the pool, then back to SOL or USDC.' },
    { art: 'local', title: 'Keys stay local', body: 'Route keys are generated in your browser.' },
    { art: 'noise', title: 'Timing noise', body: 'Random delays make timing analysis harder.' },
    { art: 'percent', title: 'Custom splits', body: 'Set the percentage each wallet receives.' },
    { art: 'shielded', title: 'Shielded pool', body: "Zcash's shielded pool hides amounts and addresses." },
    { art: 'usdc', title: 'Land as USDC', body: 'Choose SOL or USDC for the final leg.' },
    { art: 'nolink', title: 'No on-chain link', body: 'The wallets you receive on are not tied to your source.' },
  ],
}

export const guides = {
  title: ['Read ', 'before', ' you route'],
  items: [
    { art: 'guide-pool', title: 'How a shielded pool breaks the link', href: '/guides/shielded-pool' },
    { art: 'guide-split', title: 'Picking splits and delays', href: '/guides/splits-and-delays' },
    { art: 'guide-rules', title: 'Check your local rules first', href: '/guides/local-rules' },
  ],
}

export const footer = {
  newsletter: 'Release notes, a few times a year',
  legalNote:
    'Privacy tools are regulated differently by country, so check the rules where you live before using one.',
  columns: [
    {
      label: 'Learn',
      links: [
        { label: 'How it works', href: '/#how' },
        { label: 'Fees', href: '/#fees' },
      ],
    },
    {
      label: 'Guides',
      links: [
        { label: 'Shielded pool', href: '/guides/shielded-pool' },
        { label: 'Splits and delays', href: '/guides/splits-and-delays' },
        { label: 'Local rules', href: '/guides/local-rules' },
      ],
    },
    {
      label: 'Project',
      links: [
        { label: 'Design', href: '/#design' },
        { label: 'Wallets', href: '/#wallets' },
        { label: 'Principles', href: '/#principles' },
        { label: 'Brand kit', href: '/brand/logo.svg' },
      ],
    },
    {
      label: 'Follow',
      links: [{ label: 'X', href: X_URL }],
    },
  ],
  copyright: '© 2026 Hushlane',
}
