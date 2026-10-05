import { useState } from 'react'
import { principles } from '@/data/site'
import { Poster } from '@/components/art/Poster'

// Resting tilt per poster, a loose hand-pinned rhythm.
const TILT = [-1, 1.5, -0.5, 1, -1.5, 0.5, 1, -1, 0.5, -0.5, 1.5]

/**
 * Poster wall. Hovering (or focusing) a poster widens its slot to reveal a caption beside it;
 * the other posters reflow, as on the reference.
 */
export function Principles() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <section id="principles" className="section principles" aria-labelledby="principles-title">
      <div className="section__inner">
        <div className="section__head">
          <h2 id="principles-title" className="t-h3">
            {principles.title[0]}
            <em>{principles.title[1]}</em>
          </h2>
        </div>
        <ul className="wall" onMouseLeave={() => setActive(null)}>
          {principles.items.map((item, i) => (
            <li
              key={item.art}
              className={`wall__item ${active === i ? 'is-open' : ''}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={`${item.title}. ${item.body}`}
            >
              <div className="wall__poster" style={{ ['--tilt' as string]: `${TILT[i % TILT.length]}deg` }}>
                <Poster art={item.art} />
              </div>
              <div className="wall__caption" aria-hidden="true">
                <p className="wall__title">{item.title}</p>
                <p className="wall__body">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
