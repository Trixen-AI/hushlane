import { Navigate, useParams } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { GUIDES, guideBySlug, type GuideBlock } from '@/data/guides'
import { GuideArt } from '@/components/art/GuideArt'
import { ArrowLink, SmartLink } from '@/components/ui/links'
import { ArrowRight } from '@/components/ui/icons'
import { SPRING } from '@/lib/motion'
import { usePageMeta } from '@/hooks/usePageMeta'

function Block({ block }: { block: GuideBlock }) {
  if (block.type === 'p') return <p className="guide__p">{block.text}</p>
  if (block.type === 'list')
    return (
      <ul className="guide__list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  return (
    <ol className="guide__steps">
      {block.items.map((s, i) => (
        <li key={s.title}>
          <span className="guide__step-n">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <p className="guide__step-title">{s.title}</p>
            <p className="guide__p">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function GuidePage() {
  const { slug } = useParams()
  const reduce = useReducedMotion()
  const guide = guideBySlug(slug)
  usePageMeta(
    guide ? `${guide.title} ${guide.titleEm} | Hushlane` : 'Hushlane guides',
    guide ? guide.intro : "Guides for routing funds through Zcash's shielded pool.",
    guide ? `/guides/${guide.slug}` : '/',
  )
  if (!guide) return <Navigate to="/#guides" replace />
  const others = GUIDES.filter((g) => g.slug !== guide.slug)

  return (
    <main className="guide">
      <article>
        <header className="guide__head">
          <div className="guide__head-text">
            <SmartLink href="/#guides" className="guide__back">
              <span aria-hidden="true">←</span> All guides
            </SmartLink>
            <p className="guide__kicker">
              {guide.kicker} · {guide.readMinutes} min read
            </p>
            <h1 className="guide__title">
              {guide.title} <em>{guide.titleEm}</em>
            </h1>
            <p className="guide__intro">{guide.intro}</p>
          </div>
          <motion.div
            className="guide__art"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.1 }}
          >
            <div className="guide__art-inner">
              <GuideArt art={guide.art} />
            </div>
          </motion.div>
        </header>

        <div className="guide__body">
          {guide.sections.map((s) => (
            <section key={s.heading} className="guide__section">
              <h2 className="guide__h2">{s.heading}</h2>
              <div className="guide__blocks">
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <section className="guide__more" aria-labelledby="more-title">
        <div className="guide__more-inner">
          <div className="guide__more-head">
            <h2 id="more-title" className="t-h3">
              Keep <em>reading</em>
            </h2>
            <ArrowLink href="/#how">See how it works</ArrowLink>
          </div>
          <ul className="guide__more-row">
            {others.map((g) => (
              <li key={g.slug}>
                <SmartLink href={`/guides/${g.slug}`} className="guide__more-card">
                  <div className="guides__img">
                    <GuideArt art={g.art} />
                  </div>
                  <p className="guide__more-title">
                    <span>
                      {g.title} {g.titleEm}
                    </span>
                    <ArrowRight />
                  </p>
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
