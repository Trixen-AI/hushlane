// Original Hushlane poster art. Grammar: two- or three-ink risograph prints of route diagrams
// (a lane in, the pool, lanes out), stamped display type and pixel noise.
import type { ReactNode } from 'react'
import { C, DISPLAY, SANS, SERIF, W, rng } from './palette'
import { Bg, PixelField, Rings, Route, Stamp } from './parts'

type Ctx = { id: (s: string) => string; seed: number }
type Draw = (ctx: Ctx) => ReactNode

export const POSTERS: Record<string, Draw> = {
  /* ---------- Hero set (looping) ---------- */
  vanish: ({ seed }) => (
    <>
      <Bg fill={C.violet} />
      <PixelField seed={seed} cols={10} rows={4} x={0} y={196} size={20} colors={[C.bg, C.ink]} density={0.3} />
      <text x="12" y="62" fontFamily={DISPLAY} fontWeight="700" fontSize="44" fill={C.lime} textLength="176" lengthAdjust="spacingAndGlyphs">
        VANISH
      </text>
      <Route x={16} y={84} w={168} h={96} n={3} ink={C.lime} pool={C.bg} live />
      <Stamp x={12} y={186} text="IN ZCASH" fill={C.paper} />
    </>
  ),
  splitfive: ({ seed }) => (
    <>
      <Bg fill={C.lime} />
      <text x="8" y="132" fontFamily={DISPLAY} fontWeight="700" fontSize="118" fill={C.ink} textLength="184" lengthAdjust="spacingAndGlyphs">
        ×5
      </text>
      <Route x={18} y={160} w={166} h={88} n={5} ink={C.ink} pool={C.violet} live />
      <Stamp x={12} y={22} text="ONE SEND / FIVE WALLETS" fill={C.ink} />
      <PixelField seed={seed} cols={3} rows={2} x={152} y={28} size={10} colors={[C.coral]} density={0.6} />
    </>
  ),
  shieldedgrid: ({ seed }) => (
    <>
      <Bg fill={C.paper} />
      <PixelField seed={seed} cols={8} rows={9} x={20} y={98} size={20} colors={[C.bg, C.violet, C.sky]} density={0.55} live />
      <text x="16" y="58" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="46" fill={C.ink}>
        Shielded
      </text>
      <text x="18" y="84" fontFamily={SERIF} fontWeight="300" fontSize="20" fill={C.ink}>
        amounts. addresses.
      </text>
    </>
  ),
  stackround: () => (
    <>
      <Bg fill={C.coral} />
      {['SOL', 'ZEC', 'SOL'].map((t, i) => (
        <text key={i} x="14" y={78 + i * 76} fontFamily={DISPLAY} fontWeight="700" fontSize="64" fill={i === 1 ? C.paper : C.ink}>
          {t}
        </text>
      ))}
      <g className="pa-spin" style={{ transformOrigin: '164px 148px' }}>
        <circle cx="164" cy="148" r="22" fill="none" stroke={C.ink} strokeWidth="3" strokeDasharray="10 7" />
        <path d="M164 122 l7 4 -7 4z" fill={C.ink} />
      </g>
    </>
  ),
  nocustody: () => (
    <>
      <Bg fill={C.ink} />
      <Rings cx={100} cy={150} n={7} gap={14} stroke={C.bg} live />
      <rect x="86" y="136" width="28" height="28" rx="4" fill={C.lime} />
      <text x="18" y="40" fontFamily={DISPLAY} fontWeight="700" fontSize="22" fill={C.paper}>
        NO
      </text>
      <text x="18" y="64" fontFamily={DISPLAY} fontWeight="700" fontSize="22" fill={C.paper}>
        CUSTODY
      </text>
      <text x="18" y="256" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="18" fill={C.bg}>
        you sign every transfer
      </text>
    </>
  ),
  hourglass: () => (
    <>
      <Bg fill={C.sky} />
      <g className="pa-sweep" style={{ transformOrigin: '100px 176px' }}>
        <path d="M100 176 L100 96 A80 80 0 0 1 169 136 Z" fill={C.violet} opacity="0.85" />
      </g>
      <circle cx="100" cy="176" r="80" fill="none" stroke={C.ink} strokeWidth="2" />
      <text x="14" y="70" fontFamily={SERIF} fontWeight="300" fontSize="64" fill={C.ink}>
        1–3h
      </text>
      <Stamp x={14} y={262} text="TIME IN THE POOL" fill={C.ink} />
    </>
  ),

  /* ---------- Principles set ---------- */
  hours: ({ seed }) => (
    <>
      <Bg fill={C.bg} />
      <PixelField seed={seed} cols={10} rows={6} x={0} y={0} size={20} colors={[C.paper]} density={0.25} />
      <text x="14" y="150" fontFamily={DISPLAY} fontWeight="700" fontSize="58" fill={C.lime} stroke={C.ink} strokeWidth="1.5">
        1–3h
      </text>
      <text x="16" y="186" fontFamily={DISPLAY} fontWeight="700" fontSize="26" fill={C.ink}>
        HOLD
      </text>
      <Stamp x={16} y={258} text="RANDOM PER ROUTE" fill={C.ink} />
    </>
  ),
  five: () => (
    <>
      <Bg fill={C.violet} />
      <Route x={14} y={60} w={172} h={150} n={5} ink={C.paper} pool={C.lime} />
      <text x="14" y="44" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="34" fill={C.paper}>
        five wallets
      </text>
      <Stamp x={14} y={256} text="1 TO 5 / YOUR SPLIT" fill={C.lime} />
    </>
  ),
  flat: () => (
    <>
      <Bg fill={C.paper} />
      <rect x="0" y="168" width={W} height="104" fill={C.coral} />
      <text x="10" y="150" fontFamily={DISPLAY} fontWeight="700" fontSize="74" fill={C.ink} textLength="180" lengthAdjust="spacingAndGlyphs">
        0.3%
      </text>
      <text x="14" y="214" fontFamily={SERIF} fontWeight="300" fontSize="30" fill={C.paper}>
        flat fee
      </text>
      <Stamp x={14} y={40} text="QUOTED BEFORE YOU SEND" fill={C.ink} />
    </>
  ),
  nologin: ({ seed }) => (
    <>
      <Bg fill={C.ink} />
      <PixelField seed={seed} cols={20} rows={27} x={0} y={0} size={10} colors={[C.violet]} density={0.18} />
      {['NO', 'LOG', 'IN'].map((t, i) => (
        <text key={t} x="14" y={86 + i * 62} fontFamily={DISPLAY} fontWeight="700" fontSize="58" fill={i === 1 ? C.lime : C.paper}>
          {t}
        </text>
      ))}
    </>
  ),
  roundtrip: () => (
    <>
      <Bg fill={C.lime} />
      <circle cx="100" cy="136" r="70" fill="none" stroke={C.ink} strokeWidth="5" strokeDasharray="24 10" />
      <text x="62" y="128" fontFamily={DISPLAY} fontWeight="700" fontSize="22" fill={C.ink}>
        SOL
      </text>
      <text x="62" y="156" fontFamily={DISPLAY} fontWeight="700" fontSize="22" fill={C.violet}>
        ZEC
      </text>
      <text x="14" y="252" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="30" fill={C.ink}>
        round trip
      </text>
    </>
  ),
  local: ({ seed }) => (
    <>
      <Bg fill={C.sky} />
      <rect x="30" y="70" width="140" height="100" rx="8" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <rect x="30" y="70" width="140" height="18" rx="8" fill={C.ink} />
      <PixelField seed={seed} cols={6} rows={3} x={58} y={104} size={14} colors={[C.violet, C.coral]} density={0.6} />
      <text x="14" y="44" fontFamily={DISPLAY} fontWeight="700" fontSize="24" fill={C.ink}>
        KEYS STAY
      </text>
      <text x="14" y="232" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="46" fill={C.ink}>
        local
      </text>
    </>
  ),
  noise: ({ seed }) => (
    <>
      <Bg fill={C.coral} />
      {Array.from({ length: 14 }, (_, i) => {
        const r = rng(seed + i)
        return <rect key={i} x={10 + i * 13} y={150 - r() * 100} width="7" height={20 + r() * 110} fill={i % 3 ? C.ink : C.paper} />
      })}
      <text x="14" y="236" fontFamily={DISPLAY} fontWeight="700" fontSize="40" fill={C.paper} textLength="172" lengthAdjust="spacingAndGlyphs">
        NOISE
      </text>
      <Stamp x={14} y={258} text="RANDOM DELAYS" fill={C.ink} />
    </>
  ),
  percent: () => (
    <>
      <Bg fill={C.paper} />
      {[40, 25, 20, 10, 5].map((p, i, arr) => {
        const before = arr.slice(0, i).reduce((a, b) => a + b, 0)
        return (
          <rect key={i} x="14" y={50 + before * 1.7} width="172" height={p * 1.7 - 3} fill={[C.violet, C.bg, C.lime, C.coral, C.ink][i]} />
        )
      })}
      <text x="14" y="38" fontFamily={DISPLAY} fontWeight="700" fontSize="20" fill={C.ink}>
        SPLIT %
      </text>
      <text x="22" y="86" fontFamily={SANS} fontWeight="700" fontSize="14" fill={C.paper}>
        40
      </text>
      <text x="14" y="252" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="26" fill={C.ink}>
        your numbers
      </text>
    </>
  ),
  shielded: () => (
    <>
      <Bg fill={C.violet} />
      <path d="M100 52 L160 74 V140 C160 182 132 206 100 222 C68 206 40 182 40 140 V74 Z" fill={C.bg} />
      <path d="M100 74 L140 90 V140 C140 168 122 186 100 198 C78 186 60 168 60 140 V90 Z" fill={C.ink} />
      <text x="14" y="38" fontFamily={DISPLAY} fontWeight="700" fontSize="20" fill={C.lime}>
        SHIELDED
      </text>
      <text x="14" y="256" fontFamily={SERIF} fontWeight="300" fontSize="21" fill={C.paper}>
        amounts stay private
      </text>
    </>
  ),
  usdc: ({ seed }) => (
    <>
      <Bg fill={C.bg} />
      <PixelField seed={seed} cols={10} rows={4} x={0} y={192} size={20} colors={[C.sky, C.paper]} density={0.5} />
      <text x="12" y="104" fontFamily={DISPLAY} fontWeight="700" fontSize="50" fill={C.ink} textLength="176" lengthAdjust="spacingAndGlyphs">
        SOL
      </text>
      <text x="14" y="134" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="28" fill={C.ink}>
        or
      </text>
      <text x="12" y="184" fontFamily={DISPLAY} fontWeight="700" fontSize="50" fill={C.violet} textLength="176" lengthAdjust="spacingAndGlyphs">
        USDC
      </text>
    </>
  ),
  nolink: () => (
    <>
      <Bg fill={C.ink} />
      <line x1="20" y1="120" x2="86" y2="120" stroke={C.paper} strokeWidth="6" strokeLinecap="round" />
      <line x1="114" y1="120" x2="180" y2="120" stroke={C.lime} strokeWidth="6" strokeLinecap="round" />
      <path d="M92 104 L108 136 M108 104 L92 136" stroke={C.coral} strokeWidth="5" strokeLinecap="round" />
      <text x="14" y="66" fontFamily={SERIF} fontStyle="italic" fontWeight="300" fontSize="40" fill={C.paper}>
        zero link
      </text>
      <Stamp x={14} y={256} text="SOURCE  ✕  DESTINATION" fill={C.bg} />
    </>
  ),
}

