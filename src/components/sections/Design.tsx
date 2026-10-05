import { design } from '@/data/site'
import { Glyph } from '@/components/ui/icons'
import { SweepCard } from '@/components/ui/SweepCard'

export function Design() {
  return (
    <section id="design" className="section design" aria-labelledby="design-title">
      <div className="section__inner">
        <div className="section__head">
          <h2 id="design-title" className="t-h3">
            {design.title}
          </h2>
        </div>
        <div className="design__grid">
          {design.items.map((item) => (
            <SweepCard key={item.title} className="design__card">
              <Glyph name={item.icon} />
              <div className="card-text">
                <h3 className="t-card-title">{item.title}</h3>
                <p className="t-card-desc">{item.body}</p>
              </div>
            </SweepCard>
          ))}
        </div>
      </div>
    </section>
  )
}
