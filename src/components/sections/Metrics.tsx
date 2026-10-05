import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { facts } from '@/data/site'
import { DotMark } from '@/components/ui/icons'
import { SPRING, VIEWPORT } from '@/lib/motion'

type From = { x?: number; y?: number }

function MetricCard({
  from,
  className,
  children,
  delay = 0,
}: {
  from: From
  className: string
  children: ReactNode
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`metric ${className}`}
      initial={reduce ? false : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...SPRING, delay }}
    >
      <div className="metric__lift">
        <div className="metric__card">
          <PatternPanel />
          {children}
        </div>
      </div>
    </motion.div>
  )
}

/** Hover pattern: a field of route dots that slides into the card. */
function PatternPanel() {
  const dots = []
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const on = (x * 7 + y * 3) % 5 === 0
      dots.push(<rect key={`${x}-${y}`} className={on ? 'metric__dot is-on' : 'metric__dot'} x={x * 36 + 8} y={y * 36 + 8} width="22" height="22" rx="2" style={{ animationDelay: `${((x + y) % 6) * 0.25}s` }} />)
    }
  return (
    <div className="metric__pattern" aria-hidden="true">
      <svg viewBox="0 0 296 296" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        {dots}
      </svg>
    </div>
  )
}

function Note({ text }: { text: string }) {
  return (
    <div className="metric__foot">
      <span className="metric__rule" />
      <p className="metric__note">
        <span>{text}</span>
        <DotMark />
      </p>
    </div>
  )
}

export function Metrics() {
  const { wallets, pool, fee, none, steps, spread } = facts
  return (
    <section id="fees" className="metrics" aria-label="Route facts">
      <div className="metrics__grid">
        <MetricCard className="metric--a" from={{ y: 150 }}>
          <div className="metric__top">
            <p className="metric__num">
              <span>{wallets.value}</span>
            </p>
            <p className="metric__label">{wallets.label}</p>
          </div>
          <Note text={wallets.note} />
        </MetricCard>

        <MetricCard className="metric--b" from={{ y: 150 }} delay={0.05}>
          <p className="metric__label metric__label--lg">{pool.label}</p>
          <div className="metric__bottom">
            <p className="metric__big">
              <span>{pool.big[0]}</span>
              <span>{pool.big[1]}</span>
            </p>
            <Note text={pool.note} />
          </div>
        </MetricCard>

        <MetricCard className="metric--c" from={{ y: 150 }} delay={0.1}>
          <div className="metric__top">
            <p className="metric__num">
              <span>{fee.value}</span>
              <span>{fee.unit}</span>
            </p>
            <p className="metric__label">{fee.label}</p>
          </div>
          <Note text={fee.note} />
        </MetricCard>

        <MetricCard className="metric--d" from={{ x: -150 }}>
          <div className="metric__cells">
            {none.cells.map((c) => (
              <div key={c.label} className="metric__cell">
                <p className="metric__cell-label">{c.label}</p>
                <p className="metric__cell-value">{c.value}</p>
              </div>
            ))}
          </div>
          <Note text={none.note} />
        </MetricCard>

        <MetricCard className="metric--e" from={{ x: 150 }} delay={0.05}>
          <p className="metric__cell-value">{steps.value}</p>
          <p className="metric__cell-label">{steps.label}</p>
        </MetricCard>

        <MetricCard className="metric--f" from={{ x: 150 }} delay={0.1}>
          <p className="metric__cell-value">{spread.value}</p>
          <p className="metric__cell-label">{spread.label}</p>
        </MetricCard>
      </div>
    </section>
  )
}
