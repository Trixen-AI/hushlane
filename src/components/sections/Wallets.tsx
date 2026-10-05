import { wallets } from '@/data/site'
import { walletRows } from '@/data/logos'
import { ArrowLink } from '@/components/ui/links'
import { InlineSvg } from '@/components/ui/InlineSvg'
import { Marquee } from '@/components/ui/Marquee'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function Wallets() {
  const mobile = useMediaQuery('(max-width: 809.98px)')
  // Phones show four shorter rows, as the reference does.
  const rows = mobile ? walletRows.flatMap((r) => [r.slice(0, Math.ceil(r.length / 2)), r.slice(Math.ceil(r.length / 2))]) : walletRows
  return (
    <section id="wallets" className="section wallets" aria-labelledby="wallets-title">
      <div className="wallets__head">
        <h2 id="wallets-title" className="t-h3">
          {wallets.title}
        </h2>
        <ArrowLink href={wallets.link.href}>{wallets.link.label}</ArrowLink>
      </div>
      <div className="wallets__rows">
        {rows.map((row, r) => (
          <Marquee key={r} speed={50} gap={10} reverse={r % 2 === 1} className="wallets__row">
            {row.map((b) => (
              <li key={b.key} className="logo-tile" data-logo={b.key}>
                <InlineSvg svg={b.svg} className="logo-tile__svg" label={b.name} />
              </li>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  )
}
