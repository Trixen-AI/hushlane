import { useState, type FormEvent } from 'react'
import { footer } from '@/data/site'
import { socials } from '@/data/logos'
import { Logo } from '@/components/brand/Logo'
import { InlineSvg } from '@/components/ui/InlineSvg'
import { SmartLink } from '@/components/ui/links'

export function Footer() {
  const [sent, setSent] = useState(false)
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // No mailing backend is wired up yet; this only confirms locally.
    setSent(true)
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo height={50} className="site-footer__logo" />
        <div className="site-footer__main">
          <div className="site-footer__news">
            <p className="site-footer__lead">{footer.newsletter}</p>
            <form className="news-form" onSubmit={onSubmit}>
              <label htmlFor="news-email" className="sr-only">
                Email
              </label>
              <input id="news-email" type="email" required placeholder={sent ? 'Thanks, noted.' : 'Email'} disabled={sent} />
              <button type="submit" aria-label="Subscribe" disabled={sent}>
                →
              </button>
            </form>
            <p className="site-footer__legal-note">{footer.legalNote}</p>
          </div>
          <div className="site-footer__cols">
            {footer.columns.map((col) => (
              <div key={col.label} className="site-footer__col">
                <p className="site-footer__col-label">{col.label}</p>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <SmartLink href={l.href} className="foot-pill">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="site-footer__bottom">
          <ul className="socials">
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="socials__link">
                  {s.svg ? <InlineSvg svg={s.svg} className="socials__svg" /> : <span>{s.label[0]}</span>}
                </a>
              </li>
            ))}
          </ul>
          <p className="site-footer__copy">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
