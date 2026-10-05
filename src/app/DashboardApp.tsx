// Dashboard entry, loaded lazily from the website router at /app/*.
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import '@/styles/app.css'
import { initAppKit } from './wallet/appkit'
import { WalletProvider } from './wallet/WalletContext'
import { useRouteSync } from './lib/routes'
import { AppShell } from './AppShell'
import { Overview } from './pages/Overview'
import { NewRoute } from './pages/NewRoute'
import { RoutesList } from './pages/RoutesList'
import { RouteDetail } from './pages/RouteDetail'
import { Wallets } from './pages/Wallets'
import { Settings } from './pages/Settings'
import { usePageMeta } from '@/hooks/usePageMeta'

initAppKit()

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Sync() {
  useRouteSync()
  return null
}

export default function DashboardApp() {
  usePageMeta('Hushlane App | Build a private route', "Plan and track routes from Solana through Zcash's shielded pool to up to five wallets.", '/app')

  return (
    <WalletProvider>
      <ScrollTop />
      <Sync />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="new" element={<NewRoute />} />
          <Route path="routes" element={<RoutesList />} />
          <Route path="routes/:id" element={<RouteDetail />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </WalletProvider>
  )
}
