// Drawing parts shared by the posters and guide art.
import type { ReactNode } from 'react'
import { H, SANS, W, rng } from './palette'

export const Bg = ({ fill }: { fill: string }) => <rect width={W} height={H} fill={fill} />

/** Lane in -> pool block -> n lanes out, scaled into a box. */
export function Route({
  x,
  y,
  w,
  h,
  n,
  ink,
  pool,
  live,
}: {
  x: number
  y: number
  w: number
  h: number
  n: number
  ink: string
  pool: string
  live?: boolean
}) {
  const midY = y + h / 2
  const px = x + w * 0.36
  const pw = w * 0.2
  const outs = Array.from({ length: n }, (_, i) => y + (n === 1 ? h / 2 : (h * (i + 0.5)) / n))
  return (
    <g>
      <line x1={x} y1={midY} x2={px - 6} y2={midY} stroke={ink} strokeWidth="6" strokeLinecap="round" />
      <rect x={px} y={y} width={pw} height={h} rx="6" fill={pool} />
      {outs.map((oy, i) => (
        <path
          key={i}
          d={`M${px + pw + 6} ${midY} C ${px + pw + w * 0.18} ${midY}, ${px + pw + w * 0.14} ${oy}, ${x + w} ${oy}`}
          fill="none"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          className={live ? 'pa-draw' : undefined}
          style={live ? { animationDelay: `${i * 0.35}s` } : undefined}
          pathLength={live ? 1 : undefined}
        />
      ))}
      {live && <circle cx={x} cy={midY} r="5" fill={pool} className="pa-travel" style={{ ['--tx' as string]: `${px - x}px` }} />}
    </g>
  )
}

export function PixelField({
  seed,
  cols,
  rows,
  x,
  y,
  size,
  colors,
  density = 0.45,
  live,
}: {
  seed: number
  cols: number
  rows: number
  x: number
  y: number
  size: number
  colors: string[]
  density?: number
  live?: boolean
}) {
  const r = rng(seed)
  const cells: ReactNode[] = []
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const v = r()
      if (v > density) continue
      const c = colors[Math.floor(r() * colors.length)]
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={x + i * size}
          y={y + j * size}
          width={size}
          height={size}
          fill={c}
          className={live ? 'pa-blink' : undefined}
          style={live ? { animationDelay: `${(r() * 3).toFixed(2)}s` } : undefined}
        />,
      )
    }
  return <g>{cells}</g>
}

export function Rings({ cx, cy, n, gap, stroke, live }: { cx: number; cy: number; n: number; gap: number; stroke: string; live?: boolean }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={(i + 1) * gap}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          className={live ? 'pa-pulse' : undefined}
          style={live ? { animationDelay: `${i * 0.3}s`, transformOrigin: `${cx}px ${cy}px` } : undefined}
        />
      ))}
    </g>
  )
}

export const Stamp = ({ x, y, text, fill, size = 7 }: { x: number; y: number; text: string; fill: string; size?: number }) => (
  <text x={x} y={y} fontFamily={SANS} fontWeight="700" fontSize={size} letterSpacing="1.2" fill={fill}>
    {text}
  </text>
)

