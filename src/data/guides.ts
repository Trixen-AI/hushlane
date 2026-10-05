// Guide pages linked from the "Read before you route" cards.

export type GuideBlock = { type: 'p'; text: string } | { type: 'list'; items: string[] } | { type: 'steps'; items: { title: string; text: string }[] }

export type Guide = {
  slug: string
  art: string
  kicker: string
  title: string
  titleEm: string
  intro: string
  readMinutes: number
  sections: { heading: string; blocks: GuideBlock[] }[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'shielded-pool',
    art: 'guide-pool',
    kicker: 'Guide 01',
    title: 'How a shielded pool',
    titleEm: 'breaks the link',
    intro:
      'Solana is a public ledger. Anyone can follow a payment from one address to the next. A route through Zcash puts a stretch of private ledger between where your funds start and where they land.',
    readMinutes: 4,
    sections: [
      {
        heading: 'What a public chain shows',
        blocks: [
          {
            type: 'p',
            text: 'Every Solana transfer records the sending address, the receiving address and the amount, in the open and for good. Explorers make that history easy to read, and analytics tools group addresses that look related.',
          },
          {
            type: 'p',
            text: 'So when you pay someone from your main wallet, they can see what else that wallet holds and where it has sent money before. So can anyone they share the address with.',
          },
        ],
      },
      {
        heading: 'What the shielded pool hides',
        blocks: [
          {
            type: 'p',
            text: 'Zcash supports shielded transactions. Their sender, receiver and amount are encrypted, and zero-knowledge proofs let the network check that a transfer is valid without seeing any of those details.',
          },
          {
            type: 'p',
            text: 'Coins inside the shielded pool can move without leaving a trail an outsider can read. That private stretch is what a route is built around.',
          },
        ],
      },
      {
        heading: 'How a route uses it',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Swap to ZEC',
                text: 'You send SOL from a wallet you control to a swap provider, which pays out ZEC to a shielded address made for this route. The keys for that address are generated in your browser.',
              },
              { title: 'Rest in the pool', text: 'The ZEC waits in the shielded pool for a random stretch of time.' },
              { title: 'Swap back', text: 'A second swap converts it back to SOL or USDC.' },
              { title: 'Arrive on Solana', text: 'The output is split across up to five Solana wallets you picked.' },
            ],
          },
        ],
      },
      {
        heading: 'What it does not hide',
        blocks: [
          {
            type: 'p',
            text: 'A route cuts the visible chain of transfers. It does not make you invisible. Each swap provider sees its own swap: the deposit it received and the payout it sent.',
          },
          {
            type: 'p',
            text: 'That leaves amount and timing as the main clues for anyone trying to match the two ends. Random delays and split outputs are there to blur exactly those clues.',
          },
          {
            type: 'p',
            text: 'Your destination wallets also start a public history the moment funds land. Sending everything from them straight back to your source wallet joins the two ends again.',
          },
        ],
      },
      {
        heading: 'The short version',
        blocks: [
          {
            type: 'list',
            items: [
              'The shielded pool breaks the readable chain between source and destination.',
              'Delays and splits make the two ends harder to match by size and time.',
              'Careful use of your destination wallets keeps it that way.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'splits-and-delays',
    art: 'guide-split',
    kicker: 'Guide 02',
    title: 'Picking splits',
    titleEm: 'and delays',
    intro:
      'Two settings decide how hard a route is to match: how the output is split, and how long funds rest in the pool. Here is how to think about each one.',
    readMinutes: 3,
    sections: [
      {
        heading: 'Why amounts matter',
        blocks: [
          {
            type: 'p',
            text: 'If 12.37 SOL goes in and 12.20 SOL comes out a little later, the pairing is easy to guess, even with a private stretch in between. Splitting the output into several smaller amounts removes that one obvious match.',
          },
        ],
      },
      {
        heading: 'How many wallets',
        blocks: [
          {
            type: 'list',
            items: [
              'One wallet is the simplest and cheapest option.',
              'Two or three is a sensible middle ground for most routes.',
              'Five gives the most separation, but every extra wallet adds a small network fee and one more address to look after.',
            ],
          },
          { type: 'p', text: 'Only add wallets you control and plan to keep.' },
        ],
      },
      {
        heading: 'Which percentages',
        blocks: [
          {
            type: 'p',
            text: 'Uneven splits look less like one payment cut into equal parts. Something like 45, 30 and 25 percent works better than 33, 33 and 34.',
          },
          {
            type: 'p',
            text: 'Split equally is there for when you just want it done. It is still better than a single output.',
          },
        ],
      },
      {
        heading: 'How long to hold',
        blocks: [
          {
            type: 'p',
            text: 'The default hold is a random one to three hours. A longer hold puts more unrelated activity between your deposit and your payout, which makes timing harder to line up.',
          },
          { type: 'p', text: 'The cost is waiting. If you are not in a hurry, a longer hold is the easiest upgrade you can make.' },
        ],
      },
      {
        heading: 'Habits that keep it working',
        blocks: [
          {
            type: 'list',
            items: [
              'Use fresh destination wallets for each route.',
              'Do not send everything from your destination wallets back to your source wallet in one go.',
              'Move funds onward at different times rather than all at once.',
              'Keep a private record of each route for your own taxes and paperwork.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'local-rules',
    art: 'guide-rules',
    kicker: 'Guide 03',
    title: 'Check your',
    titleEm: 'local rules first',
    intro:
      'Privacy tools are regulated differently by country, so check the rules where you live before using one. This page lists what to look at. It is not legal advice.',
    readMinutes: 3,
    sections: [
      {
        heading: 'Privacy coins and exchanges',
        blocks: [
          {
            type: 'p',
            text: 'Some countries restrict privacy coins, and some exchanges in some regions no longer list them or ask extra questions about deposits that came through one.',
          },
          {
            type: 'p',
            text: 'Check whether ZEC and shielded transactions are allowed where you live, and how the exchanges you use treat funds that passed through a privacy tool.',
          },
        ],
      },
      {
        heading: 'Taxes',
        blocks: [
          {
            type: 'p',
            text: 'In many places a swap between two assets, such as SOL to ZEC and back, can count as a taxable event even if you end up holding the asset you started with. Fees and price moves during the hold can create small gains or losses.',
          },
          {
            type: 'list',
            items: ['Dates of each swap', 'Amounts in and out', 'Prices at the time', 'Destination addresses'],
          },
          { type: 'p', text: 'Keep those records yourself. Nobody else will have the full picture.' },
        ],
      },
      {
        heading: 'Source of funds',
        blocks: [
          {
            type: 'p',
            text: 'Banks and exchanges may ask where funds came from. Privacy from the public is not the same as hiding from people who are entitled to ask, so keep the records that let you answer honestly.',
          },
        ],
      },
      {
        heading: 'Where to ask',
        blocks: [
          {
            type: 'p',
            text: 'For a clear answer about your own situation, talk to a lawyer or tax adviser who knows digital assets in your country. Your tax authority’s published guidance on digital assets is a good first read.',
          },
        ],
      },
      {
        heading: 'Why this comes first',
        blocks: [
          {
            type: 'p',
            text: 'Hushlane is built for people who want their payment history out of public view, which is a normal thing to want. Using it within the law where you live is part of using it well.',
          },
        ],
      },
    ],
  },
]

export const guideBySlug = (slug: string | undefined) => GUIDES.find((g) => g.slug === slug)
