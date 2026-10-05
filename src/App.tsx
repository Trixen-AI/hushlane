import { Suspense, lazy, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router'
import { AnnounceBar, Header } from './components/layout/Chrome'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { GuidePage } from './pages/GuidePage'

const DashboardApp = lazy(() => import('./app/DashboardApp'))

/** Scroll to the hash target on navigation, or to the top on a new page. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  return (
    <>
      <ScrollManager />
      <AnnounceBar />
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export function App() {
  return (
    <Routes>
      <Route
        path="app/*"
        element={
          <Suspense fallback={<div className="app-loading">Loading Hushlane…</div>}>
            <DashboardApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="guides/:slug" element={<GuidePage />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
