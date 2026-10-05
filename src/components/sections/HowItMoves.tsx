import { useState } from 'react'
import { motion } from 'motion/react'
import { how } from '@/data/site'
import { Glyph } from '@/components/ui/icons'
import { CircleButton } from '@/components/ui/links'
import { SweepCard } from '@/components/ui/SweepCard'
import { SPRING } from '@/lib/motion'

const mod = (a: number, n: number) => ((a % n) + n) % n

/**
 * Infinite slider: each slide sits at an absolute position p (left = p * step) and the
 * track moves by -index * step. Slides are rendered in a window around the index, keyed by p,
 * so stepping forever in either direction never rewinds.
 */
export function HowItMoves() {
  const [index, setIndex] = useState(0)
  const n = how.steps.length
  const positions = Array.from({ length: n * 2 + 2 }, (_, k) => index - 2 + k)

  return (
    <section id="how" className="section section--carousel how" aria-labelledby="how-title">
      <div className="section__inner">
        <div className="section__head">
          <h2 id="how-title" className="t-h3">
            {how.title[0]}
            <em>{how.title[1]}</em>
          </h2>
        </div>
        <div className="how__viewport">
          <motion.ul
            className="how__track"
            initial={false}
            animate={{ x: `calc(${-index} * var(--how-step))` }}
            transition={SPRING}
          >
            {positions.map((p) => {
              const s = how.steps[mod(p, n)]
              return (
                <li key={p} className="how__slide" style={{ left: `calc(${p} * var(--how-step))` }} aria-hidden={p !== index || undefined}>
                  <SweepCard className="how__card">
                    <Glyph name={s.icon} />
                    <div className="card-text">
                      <p className="how__step">{`Step ${String(mod(p, n) + 1).padStart(2, '0')}`}</p>
                      <h3 className="t-card-title">{s.title}</h3>
                      <p className="t-card-desc">{s.body}</p>
                    </div>
                  </SweepCard>
                </li>
              )
            })}
          </motion.ul>
        </div>
        <div className="carousel-controls" role="group" aria-label="Route steps controls">
          <CircleButton dir="left" label="Previous step" onClick={() => setIndex((v) => v - 1)} />
          <CircleButton dir="right" label="Next step" onClick={() => setIndex((v) => v + 1)} />
        </div>
      </div>
    </section>
  )
}
