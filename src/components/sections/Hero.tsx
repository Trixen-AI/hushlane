import { motion, useReducedMotion } from 'motion/react'
import { hero } from '@/data/site'
import { Poster } from '@/components/art/Poster'
import { ArrowLink, PillLink } from '@/components/ui/links'
import { Marquee } from '@/components/ui/Marquee'
import { TickerMark } from '@/components/ui/icons'
import { SPRING } from '@/lib/motion'

// Rotation per poster slot, same rhythm as the reference stage (+1, +1, -2, +1, -2, +1 degrees).
const STAGE = [
  { art: 'vanish', rot: 1 },
  { art: 'splitfive', rot: 1 },
  { art: 'shieldedgrid', rot: -2 },
  { art: 'stackround', rot: 1 },
  { art: 'nocustody', rot: -2 },
  { art: 'hourglass', rot: 1 },
]

const WORD_DELAY = 2.25 // heading starts after the stage settles
const WORD_STAGGER = 0.045

export function Hero() {
  const reduce = useReducedMotion()
  let wordIndex = 0

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__stage">
          {STAGE.map((p, i) => (
            <div key={p.art} className="hero__poster" style={{ transform: `rotate(${p.rot}deg)`, zIndex: i === 2 || i === 4 ? 2 : 1 }}>
              <Poster art={p.art} animated />
            </div>
          ))}
        </div>

        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            {hero.lines.map((line, li) => (
              <span key={li} className="hero__line">
                {line.split(' ').map((word, wi) => {
                  const d = WORD_DELAY + wordIndex++ * WORD_STAGGER
                  return (
                    <motion.span
                      key={wi}
                      className="hero__word"
                      initial={reduce ? false : { opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: d }}
                    >
                      {word}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>
          <motion.div
            className="hero__actions"
            initial={reduce ? false : { opacity: 0, y: 150 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 1.2 }}
          >
            <PillLink href={hero.primary.href}>{hero.primary.label}</PillLink>
            <ArrowLink href={hero.secondary.href}>{hero.secondary.label}</ArrowLink>
          </motion.div>
        </div>
      </div>

      <div className="ticker">
        <Marquee speed={50} gap={10} className="ticker__track" fade>
          <li className="ticker__item">
            <TickerMark />
            <span>{hero.ticker}</span>
          </li>
        </Marquee>
      </div>
    </section>
  )
}
