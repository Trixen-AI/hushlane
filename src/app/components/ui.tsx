import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { PHASE_LABEL, phaseStep, phaseTone, type Phase } from '../lib/routes'

export function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="copy">
      <span className="copy__value mono" aria-label={label}>
        {value}
      </span>
      <button
        type="button"
        className="copy__btn"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          } catch {
            /* clipboard blocked: the value is still selectable */
          }
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export function Qr({ value, size = 168 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0e0b1a', light: '#f7f4ff' } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''))
    return () => {
      alive = false
    }
  }, [value])
  return <div className="qr" style={{ width: size, height: size }} role="img" aria-label={`QR code for ${value}`} dangerouslySetInnerHTML={{ __html: svg }} />
}

export function PhasePill({ phase }: { phase: Phase }) {
  return <span className={`status status--${phaseTone(phase)}`}>{PHASE_LABEL[phase]}</span>
}

const STEPS = ['Swap to ZEC', 'Shielded pool', 'Swap back', 'Arrive on Solana']

export function Tracker({ phase, holdProgress }: { phase: Phase; holdProgress?: number }) {
  const active = phaseStep(phase)
  const done = phase === 'completed'
  const stopped = phase === 'refunded' || phase === 'failed' || phase === 'expired'
  return (
    <ol className="tracker" aria-label="Route progress">
      {STEPS.map((s, i) => {
        const state = done || i < active ? 'is-done' : i === active && !stopped ? 'is-active' : ''
        const p = i === 1 && holdProgress != null ? `${Math.round(holdProgress * 100)}%` : '35%'
        return (
          <li key={s} className={`tracker__step ${state}`} style={{ ['--p' as string]: p }} aria-current={i === active && !done ? 'step' : undefined}>
            <span className="tracker__bar" />
            <span className="tracker__n">Step {i + 1}</span>
            <span className="tracker__title">{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
