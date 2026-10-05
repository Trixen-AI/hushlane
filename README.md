# Hushlane

Send on Solana. Vanish in Zcash.

Hushlane routes SOL or USDC through Zcash's shielded pool and lands it on up to five Solana wallets. No account, no custody. Live at [hushlane.net](https://hushlane.net).

- `/` marketing site and guides (`/guides/:slug`)
- `/app` dashboard: build, run and track routes, saved wallets, settings

Swaps run through the NEAR Intents 1Click API. Wallet connection uses Reown AppKit (Solana). Routes and saved wallets are stored in the browser only.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in VITE_REOWN_PROJECT_ID
npm run dev
```

## Environment variables

All variables are read at build time by Vite and end up in the public bundle, so never put a secret here.

| Variable | Required | What it does |
| --- | --- | --- |
| `VITE_REOWN_PROJECT_ID` | Yes | Reown AppKit project id from [dashboard.reown.com](https://dashboard.reown.com). Turns on wallet connection. |
| `VITE_SOLANA_RPC_URL` | No | Solana RPC for balances and activity. Defaults to Reown RPC, then `solana-rpc.publicnode.com`. |
| `VITE_FEE_RECIPIENT` | No | NEAR account that receives the service fee. Empty means no service fee. |
| `VITE_FEE_BPS` | No | Service fee in basis points. `30` is 0.3%. Only used when `VITE_FEE_RECIPIENT` is set. |
| `VITE_ONECLICK_JWT` | No | NEAR Intents 1Click partner JWT. Without it 1Click adds its own small fee. |

## Deploy on Vercel

1. Import the repository in Vercel. `vercel.json` sets the Vite build, SPA rewrites, caching and security headers.
2. Add the environment variables above in Project Settings → Environment Variables (Production and Preview).
3. Add `hushlane.net` and `www.hushlane.net` under Domains. `www` redirects to the apex domain.
4. In the Reown dashboard, add `hushlane.net` to the project's allowed domains.
5. Redeploy after changing any environment variable, since they are baked in at build time.

## Scripts

- `npm run build` typecheck and production build
- `npm run lint` lint with oxlint
- `node scripts/build-logo.mjs` regenerate the logo, favicon and brand PNGs
- `node scripts/build-og.mjs` regenerate the share image and app icons

Privacy tools are regulated differently by country, so check the rules where you live before using one.
