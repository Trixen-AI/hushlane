import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** px per second */
  speed?: number
  gap?: number
  reverse?: boolean
  fade?: boolean
  className?: string
}

/**
 * Infinite ticker driven by the Web Animations API (the reference uses WAAPI too):
 * the set of children is repeated enough to cover two viewport widths, then the list
 * translates by exactly one set width at a constant speed. Paused when offscreen.
 */
export function Marquee({ children, speed = 50, gap = 10, reverse = false, fade = false, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLUListElement>(null)
  const [copies, setCopies] = useState(2)
  const [setWidth, setSetWidth] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      const set = setRef.current
      const wrap = wrapRef.current
      if (!set || !wrap) return
      const w = set.getBoundingClientRect().width + gap
      setSetWidth(w)
      setCopies(Math.max(2, Math.ceil((wrap.clientWidth * 2) / Math.max(w, 1)) + 1))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (setRef.current) ro.observe(setRef.current)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [gap])

  useEffect(() => {
    const list = listRef.current
    const wrap = wrapRef.current
    if (!list || !wrap || !setWidth) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const from = reverse ? -setWidth : 0
    const to = reverse ? 0 : -setWidth
    const anim = list.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], {
      duration: (setWidth / speed) * 1000,
      iterations: Infinity,
      easing: 'linear',
    })
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? anim.play() : anim.pause()))
    io.observe(wrap)
    return () => {
      io.disconnect()
      anim.cancel()
    }
  }, [setWidth, speed, reverse])

  return (
    <div ref={wrapRef} className={`marquee ${fade ? 'marquee--fade' : ''} ${className ?? ''}`}>
      <div ref={listRef} className="marquee__list" style={{ gap }}>
        {Array.from({ length: copies }, (_, i) => (
          <ul
            key={i}
            ref={i === 0 ? setRef : undefined}
            className="marquee__set"
            style={{ gap }}
            aria-hidden={i > 0 || undefined}
          >
            {children}
          </ul>
        ))}
      </div>
    </div>
  )
}
