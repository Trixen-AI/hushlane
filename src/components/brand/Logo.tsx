import { LOCKUP, MARK_PATH, WORD_PATH } from './logoPaths'

type Props = { height?: number; className?: string; title?: string }

/** Hushlane lockup: mark + outlined wordmark, one inline SVG. */
export function Logo({ height = 24, className, title = 'Hushlane' }: Props) {
  const width = (LOCKUP.width / LOCKUP.height) * height
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`}
      fill="currentColor"
      role="img"
      aria-label={title}
    >
      <path d={MARK_PATH} transform={`scale(${LOCKUP.markScale})`} />
      <path d={WORD_PATH} transform={`translate(${LOCKUP.wordX} ${LOCKUP.wordY})`} />
    </svg>
  )
}

export function Mark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d={MARK_PATH} />
    </svg>
  )
}
