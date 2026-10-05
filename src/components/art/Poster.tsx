import { useId, type ReactNode } from 'react'
import { POSTERS } from './posters'

export const POSTER_W = 200
export const POSTER_H = 272

type Props = { art: string; animated?: boolean; className?: string; label?: string }

/**
 * A printed paper poster: the art layer, then a crumple-light layer and grain on top.
 * The paper layers are static so looping art underneath does not re-run the filters' inputs.
 */
export function Poster({ art, animated = false, className, label }: Props) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (s: string) => `${raw}-${s}`
  const draw = POSTERS[art] ?? POSTERS.hours
  const seed = [...art].reduce((a, c) => a + c.charCodeAt(0), 0)

  return (
    <svg
      className={`poster ${animated ? 'poster--live' : ''} ${className ?? ''}`}
      viewBox={`0 0 ${POSTER_W} ${POSTER_H}`}
      preserveAspectRatio="xMidYMid slice"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={id('clip')}>
          <rect width={POSTER_W} height={POSTER_H} />
        </clipPath>
        <filter id={id('crumple')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.026" numOctaves="3" seed={seed % 97} result="n" />
          <feDiffuseLighting in="n" surfaceScale="3.2" lightingColor="#fff" diffuseConstant="1.05" result="l">
            <feDistantLight azimuth="225" elevation="52" />
          </feDiffuseLighting>
          <feColorMatrix in="l" type="saturate" values="0" />
        </filter>
        <filter id={id('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={(seed * 7) % 89} />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
        </filter>
      </defs>
      <g clipPath={`url(#${id('clip')})`}>
        {draw({ id, seed }) as ReactNode}
        <rect width={POSTER_W} height={POSTER_H} filter={`url(#${id('crumple')})`} style={{ mixBlendMode: 'multiply' }} opacity="0.42" />
        <rect width={POSTER_W} height={POSTER_H} filter={`url(#${id('grain')})`} />
        <path d={`M0 ${40 + (seed % 60)} L${POSTER_W} ${10 + (seed % 90)}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
        <path d={`M${60 + (seed % 70)} 0 L${30 + (seed % 120)} ${POSTER_H}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="0.7" />
      </g>
    </svg>
  )
}
