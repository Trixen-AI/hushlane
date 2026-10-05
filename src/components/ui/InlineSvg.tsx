import { useId, useMemo } from 'react'

/**
 * Inlines an official SVG file byte-for-byte, except that internal ids are prefixed so
 * gradients and clip paths of different logos cannot collide on one page. Shapes, colours and
 * proportions are untouched.
 */
export function InlineSvg({ svg, className, label }: { svg: string; className?: string; label?: string }) {
  const prefix = useId().replace(/[^a-zA-Z0-9]/g, '')
  const html = useMemo(() => {
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
    let out = svg.replace(/<\?xml[^>]*>/, '').replace(/<!DOCTYPE[^>]*>/i, '')
    for (const id of ids) {
      const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      out = out
        .replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefix}-${id}"`)
        .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}-${id})`)
        .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${prefix}-${id}"`)
    }
    return out
  }, [svg, prefix])
  return <span className={className} role={label ? 'img' : undefined} aria-label={label} dangerouslySetInnerHTML={{ __html: html }} />
}
