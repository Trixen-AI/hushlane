import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { announce, nav, navCta } from '@/data/site'
import { Logo } from '@/components/brand/Logo'
import { LaneIcon } from '@/components/ui/icons'
import { PillLink, SmartLink } from '@/components/ui/links'

export function AnnounceBar() {
  return (
    <div className="announce">
      <LaneIcon />
      <p>
        {announce.lead}{' '}
        <SmartLink href={announce.href} className="announce__link">
          {announce.link}
        </SmartLink>
      </p>
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <SmartLink href="/" className="site-header__logo" aria-label="Hushlane home">
          <Logo height={26} />
        </SmartLink>
        <nav className="site-nav" aria-label="Main">
          {nav.map((item) => (
            <SmartLink key={item.label} href={item.href} className="site-nav__link">
              <span className="site-nav__roll" data-text={item.label}>
                {item.label}
              </span>
            </SmartLink>
          ))}
          <PillLink href={navCta.href} size="sm">
            {navCta.label}
          </PillLink>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`menu-btn__grid ${open ? 'is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {nav.map((item) => (
              <SmartLink key={item.label} href={item.href} className="mobile-menu__link" onClick={() => setOpen(false)}>
                {item.label}
              </SmartLink>
            ))}
            <div onClick={() => setOpen(false)}>
              <PillLink href={navCta.href}>{navCta.label}</PillLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
