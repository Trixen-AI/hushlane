// Builds the social share image (1200x630) and app icons from the Hushlane logo source.
// Text is outlined from Unbounded Bold so the render does not depend on installed fonts.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mod = fs.readFileSync(path.join(root, 'src/components/brand/logoPaths.ts'), 'utf8')
const MARK = JSON.parse(mod.match(/MARK_PATH = (".*")/)[1])
const WORD = JSON.parse(mod.match(/WORD_PATH = (".*")/)[1])
const L = Object.fromEntries([...mod.matchAll(/(\w+): ([\d.]+)/g)].map((m) => [m[1], Number(m[2])]))

const INK = '#0E0B1A'
const BG = '#CDBDFF'
const LIME = '#D4FF3A'
const VIOLET = '#3A1FD6'

const buf = fs.readFileSync(path.join(root, 'node_modules/@fontsource/unbounded/files/unbounded-latin-700-normal.woff'))
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const text = (s, x, y, size, track = -0.02) => {
  let cx = x
  let d = ''
  for (const ch of s) {
    const g = font.charToGlyph(ch)
    d += g.getPath(cx, y, size).toPathData(2)
    cx += (g.advanceWidth / font.unitsPerEm) * size + track * size
  }
  return d
}

const lockup = (x, y, h, fill) => {
  const s = h / L.height
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="${MARK}" transform="scale(${L.markScale})"/><path d="${WORD}" transform="translate(${L.wordX} ${L.wordY})"/></g>`
}

// Route diagram on the right: one lane in, the pool, five lanes out.
const route = () => {
  const ox = 690
  const oy = 150
  const outs = [0, 1, 2, 3, 4].map((i) => oy + 30 + i * 75)
  const mid = oy + 180
  return `
  <clipPath id="box"><rect x="${ox}" y="${oy - 30}" width="440" height="420"/></clipPath>
  <rect x="${ox}" y="${oy - 30}" width="440" height="420" fill="${INK}"/>
  <g clip-path="url(#box)">${[1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${ox + 250}" cy="${mid}" r="${i * 34}" fill="none" stroke="${VIOLET}" stroke-width="3"/>`).join('')}</g>
  <line x1="${ox + 40}" y1="${mid}" x2="${ox + 160}" y2="${mid}" stroke="${LIME}" stroke-width="14" stroke-linecap="round"/>
  <rect x="${ox + 180}" y="${oy + 10}" width="70" height="340" rx="10" fill="${BG}"/>
  ${outs.map((y) => `<path d="M${ox + 270} ${mid} C ${ox + 330} ${mid}, ${ox + 320} ${y}, ${ox + 400} ${y}" fill="none" stroke="${LIME}" stroke-width="8" stroke-linecap="round"/>`).join('')}
  `
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  ${lockup(70, 70, 44, INK)}
  <path d="${text('Send on Solana.', 70, 300, 58)}" fill="${INK}"/>
  <path d="${text('Vanish in Zcash.', 70, 380, 58)}" fill="${VIOLET}"/>
  <path d="${text('UP TO FIVE WALLETS / NO CUSTODY', 72, 520, 18, 0.06)}" fill="${INK}"/>
  ${route()}
</svg>`

const icon = (size, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-6 -6 44 44"><rect x="-6" y="-6" width="44" height="44" fill="${bg}"/><path fill="${BG}" d="${MARK}"/></svg>`

const render = (svg, file) => {
  fs.writeFileSync(path.join(root, 'public', file), new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng())
  console.log('wrote', file)
}
render(og, 'og-image.png')
render(icon(180, INK), 'apple-touch-icon.png')
render(icon(192, INK), 'icon-192.png')
render(icon(512, INK), 'icon-512.png')
