import type { ReactNode } from 'react'

/** Bordered card with the shared hover device: a paper-toned gradient sweeps down over it. */
export function SweepCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`sweep-card ${className ?? ''}`}>
      <span className="sweep-card__sweep" aria-hidden="true" />
      <div className="sweep-card__body">{children}</div>
    </div>
  )
}
