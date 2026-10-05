// Small original glyphs. Pixel grammar on an 8x8 grid, ink + one accent.
import type { ReactNode } from 'react'

const INK = 'var(--c-ink)'

function Px({ cells, fill = INK, size = 32 }: { cells: string[]; fill?: string; size?: number }) {
  const rects: ReactNode[] = []
  cells.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === '#') rects.push(<rect key={`${x}-${y}`} x={x * 4} y={y * 4} width="4" height="4" fill={fill} />)
      if (c === '+') rects.push(<rect key={`${x}-${y}`} x={x * 4} y={y * 4} width="4" height="4" fill="var(--c-violet)" />)
    }),
  )
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" shapeRendering="crispEdges">
      {rects}
    </svg>
  )
}

const GLYPHS: Record<string, string[]> = {
  overview: ['###.###.', '#.#.#.#.', '###.###.', '........', '###.+++.', '#.#.+.+.', '###.+++.', '........'],
  route: ['........', '##......', '.#..++..', '.####++#', '....++.#', '.......#', '......##', '........'],
  list: ['........', '+.######', '........', '+.######', '........', '+.######', '........', '........'],
  wallet: ['........', '#######.', '#.....#.', '#...####', '#...#++#', '#...####', '#######.', '........'],
  settings: ['...##...', '.#.##.#.', '..####..', '####++##', '####++##', '..####..', '.#.##.#.', '...##...'],
  custody: ['..####..', '.#....#.', '.#....#.', '########', '#......#', '#..++..#', '#...+..#', '########'],
  noise: ['#..#.+..', '..#...#.', '.+..#...', '#...#..#', '..#..+..', '#.....#.', '.#.+...#', '...#.#..'],
  math: ['........', '.##..##.', '.##..##.', '........', '########', '........', '.++++++.', '........'],
  keys: ['.###....', '#...#...', '#.+.#...', '#...#...', '.#######', '.....#.#', '.....#.#', '........'],
  step1: ['........', '#####...', '....#...', '....#...', '....####', '.......+', '.......+', '........'],
  step2: ['########', '#......#', '#.++++.#', '#.+..+.#', '#.+..+.#', '#.++++.#', '#......#', '########'],
  step3: ['......##', '.....##.', '....##..', '###++...', '....##..', '.....##.', '......##', '........'],
  step4: ['...##...', '...##...', '...##...', '...##...', '#..##..#', '.#.##.#.', '..####..', '+++##+++'],
  split: ['.......#', '......#.', '.....#..', '#####+++', '.....#..', '......#.', '.......#', '........'],
  quote: ['########', '#......#', '#.####.#', '#......#', '#.##++.#', '#......#', '#.####.#', '########'],
}

export function Glyph({ name, size = 32 }: { name: string; size?: number }) {
  return <Px cells={GLYPHS[name] ?? GLYPHS.quote} size={size} />
}

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Announce bar glyph: a lane dipping under a line. */
export function LaneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3" stroke="var(--c-lime)" strokeWidth="1.5" />
      <path d="M4 5.5h3v5h5" stroke="var(--c-lime)" strokeWidth="1.5" />
    </svg>
  )
}

/** Small source-line marks (10px) used in the metrics cards. */
export function DotMark({ color = 'var(--c-violet)' }: { color?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <rect width="10" height="10" rx="2" fill={color} />
      <rect x="3" y="3" width="4" height="4" fill="var(--c-paper)" />
    </svg>
  )
}


/** Ticker separator: a rotating diamond with an open core, our own replacement for a Lottie. */
export function TickerMark() {
  return (
    <svg className="ticker-mark" width="35" height="25" viewBox="0 0 35 25" aria-hidden="true">
      <g className="ticker-mark__spin">
        <path d="M17.5 3.5 26.5 12.5 17.5 21.5 8.5 12.5z" fill="var(--c-lime)" stroke="var(--c-ink)" strokeWidth="1.2" />
        <rect x="15.5" y="10.5" width="4" height="4" fill="var(--c-ink)" />
      </g>
    </svg>
  )
}
