import { C, DISPLAY, SERIF } from './palette'
import { PixelField, Rings, Route } from './parts'

/** Guide card art, 367x336 frame. */
export function GuideArt({ art }: { art: string }) {
  const common = { width: '100%', height: '100%', viewBox: '0 0 367 336', preserveAspectRatio: 'xMidYMin slice' as const }
  if (art === 'guide-pool')
    return (
      <svg {...common} aria-hidden="true">
        <rect width="367" height="336" fill={C.ink} />
        <Rings cx={250} cy={210} n={9} gap={22} stroke={C.violet} />
        <Route x={36} y={150} w={240} h={120} n={3} ink={C.lime} pool={C.bg} />
        <text x="36" y="74" fontFamily={SERIF} fontWeight="300" fontSize="34" fill={C.paper}>
          How a shielded pool
        </text>
        <text x="36" y="112" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="34" fill={C.paper}>
          breaks the link
        </text>
      </svg>
    )
  if (art === 'guide-split')
    return (
      <svg {...common} aria-hidden="true">
        <rect width="367" height="336" fill={C.lime} />
        {[34, 22, 18, 16, 10].map((p, i, arr) => {
          const before = arr.slice(0, i).reduce((a, b) => a + b, 0)
          return <rect key={i} x={36 + before * 2.95} y="170" width={p * 2.95 - 4} height="120" fill={[C.ink, C.violet, C.coral, C.sky, C.paper][i]} />
        })}
        <text x="36" y="74" fontFamily={DISPLAY} fontWeight="700" fontSize="30" fill={C.ink}>
          Picking splits
        </text>
        <text x="36" y="118" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="34" fill={C.ink}>
          and delays
        </text>
      </svg>
    )
  return (
    <svg {...common} aria-hidden="true">
      <rect width="367" height="336" fill={C.violet} />
      <PixelField seed={53} cols={18} rows={8} x={0} y={176} size={20.4} colors={[C.bg, C.ink]} density={0.35} />
      <text x="36" y="74" fontFamily={SERIF} fontWeight="300" fontSize="34" fill={C.paper}>
        Check your
      </text>
      <text x="36" y="114" fontFamily={DISPLAY} fontWeight="700" fontSize="32" fill={C.lime}>
        local rules
      </text>
      <text x="36" y="146" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="24" fill={C.paper}>
        before you route
      </text>
    </svg>
  )
}
