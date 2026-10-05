import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Chevron } from './icons'

/** Internal routes and in-page anchors go through the router; everything else is a plain anchor. */
export function SmartLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string
  className?: string
  children: ReactNode
  'aria-label'?: string
  onClick?: () => void
}) {
  if (href.startsWith('/') && !href.startsWith('/brand/')) {
    return (
      <Link to={href} className={className} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:/.test(href)
  return (
    <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
}

/** Outlined pill (header CTA, hero button). */
export function PillLink({ href, children, size = 'md' }: { href: string; children: ReactNode; size?: 'md' | 'sm' | 'xs' }) {
  return (
    <SmartLink href={href} className={`pill pill--${size}`}>
      <span className="pill__fill" aria-hidden="true" />
      <span className="pill__label">{children}</span>
    </SmartLink>
  )
}

/** Text link with an arrow that nudges right on hover. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <SmartLink href={href} className="arrow-link">
      <span>{children}</span>
      <ArrowRight />
    </SmartLink>
  )
}

export function CircleButton({ dir, onClick, label }: { dir: 'left' | 'right'; onClick: () => void; label: string }) {
  return (
    <button type="button" className="circle-btn" onClick={onClick} aria-label={label}>
      <Chevron dir={dir} />
    </button>
  )
}
