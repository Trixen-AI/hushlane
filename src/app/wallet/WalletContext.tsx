import { useCallback, useMemo, type ReactNode } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { rpcUrl, USDC_MINT } from '../lib/solana'
import { walletConfigured } from './appkit'
import { Ctx, notConfigured, type WalletApi } from './walletCtx'

function ConnectedWalletProvider({ children }: { children: ReactNode }) {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const { disconnect } = useDisconnect()

  const send = useCallback<WalletApi['send']>(
    async (asset, to, amount) => {
      if (!address || !walletProvider) throw new Error('Connect a wallet first.')
      const conn = (connection as Connection | undefined) ?? new Connection(rpcUrl(), 'confirmed')
      const from = new PublicKey(address)
      const dest = new PublicKey(to)
      const tx = new Transaction()
      if (asset === 'SOL') {
        tx.add(SystemProgram.transfer({ fromPubkey: from, toPubkey: dest, lamports: amount }))
      } else {
        const mint = new PublicKey(USDC_MINT)
        const fromAta = getAssociatedTokenAddressSync(mint, from)
        const toAta = getAssociatedTokenAddressSync(mint, dest, true)
        tx.add(createAssociatedTokenAccountIdempotentInstruction(from, toAta, dest, mint))
        tx.add(createTransferCheckedInstruction(fromAta, mint, toAta, from, amount, 6))
      }
      const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed')
      tx.feePayer = from
      tx.recentBlockhash = blockhash
      tx.lastValidBlockHeight = lastValidBlockHeight
      return walletProvider.sendTransaction(tx, conn)
    },
    [address, walletProvider, connection],
  )

  const api = useMemo<WalletApi>(
    () => ({
      configured: true,
      address: isConnected ? address : undefined,
      isConnected: Boolean(isConnected && address),
      open: () => open({ view: 'Connect' }),
      openAccount: () => open({ view: 'Account' }),
      disconnect: () => void disconnect(),
      send,
    }),
    [address, isConnected, open, disconnect, send],
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  if (!walletConfigured) return <Ctx.Provider value={notConfigured}>{children}</Ctx.Provider>
  return <ConnectedWalletProvider>{children}</ConnectedWalletProvider>
}
