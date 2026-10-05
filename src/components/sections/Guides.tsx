import { guides } from '@/data/site'
import { GuideArt } from '@/components/art/GuideArt'
import { SmartLink } from '@/components/ui/links'

export function Guides() {
  return (
    <section id="guides" className="section guides" aria-labelledby="guides-title">
      <div className="section__inner">
        <div className="section__head">
          <h2 id="guides-title" className="t-h3">
            {guides.title[0]}
            <em>{guides.title[1]}</em>
            {guides.title[2]}
          </h2>
        </div>
        <ul className="guides__row">
          {guides.items.map((g) => (
            <li key={g.art} className="guides__item">
              <SmartLink href={g.href} className="guides__card" aria-label={g.title}>
                <div className="guides__img">
                  <GuideArt art={g.art} />
                </div>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
