import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { Glyph } from '@/components/ui/icons'
import { SmartLink } from '@/components/ui/links'
import { X_URL } from '@/data/site'
import { usePrices, usd } from './lib/prices'
import { ConnectButton } from './wallet/ConnectButton'

const APP_NAV = [
  { to: '/app', label: 'Overview', icon: 'overview', end: true },
  { to: '/app/new', label: 'New route', icon: 'route', end: false },
  { to: '/app/routes', label: 'Routes', icon: 'list', end: false },
  { to: '/app/wallets', label: 'Wallets', icon: 'wallet', end: false },
  { to: '/app/settings', label: 'Settings', icon: 'settings', end: false },
]

function titleFor(pathname: string) {
  if (pathname.startsWith('/app/routes/')) return 'Route'
  const hit = [...APP_NAV].reverse().find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  return hit?.label ?? 'Overview'
}

function PriceChips() {
  const { prices } = usePrices()
  return (
    <div className="app-prices" aria-label="Live prices">
      {(['SOL', 'ZEC'] as const).map((k) => (
        <span key={k} className="app-price">
          <span className="app-price__k">{k}</span>
          <span className="app-price__v">{prices ? usd(prices[k]) : '…'}</span>
        </span>
      ))}
    </div>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)

  return (
    <div className="app">
      <aside className={`app-side ${menu ? 'is-open' : ''}`}>
        <SmartLink href="/" className="app-side__logo" aria-label="Hushlane website">
          <Logo height={22} />
        </SmartLink>
        <nav className="app-nav" aria-label="Dashboard">
          {APP_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="app-nav__link" onClick={() => setMenu(false)}>
              <Glyph name={n.icon} size={20} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-side__foot">
          <p className="app-side__note">Routes and saved wallets are stored in this browser only.</p>
          <SmartLink href="/" className="app-side__link">
            ← Website
          </SmartLink>
          <SmartLink href={X_URL} className="app-side__link">
            Hushlane on X
          </SmartLink>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-top">
          <button type="button" className="app-top__menu" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            <span className={`menu-btn__grid ${menu ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </button>
          <h1 className="app-top__title">{titleFor(pathname)}</h1>
          <PriceChips />
          <ConnectButton />
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      {menu && <button type="button" className="app-scrim" aria-label="Close menu" onClick={() => setMenu(false)} />}
    </div>
  )
}
