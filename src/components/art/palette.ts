// Shared poster palette and type stacks.
export const C = {
  bg: '#cdbdff',
  paper: '#f7f4ff',
  ink: '#0e0b1a',
  lime: '#d4ff3a',
  coral: '#ff5e3a',
  violet: '#3a1fd6',
  sky: '#7fd4ff',
}
export const W = 200
export const H = 272
export const DISPLAY = "Unbounded, 'Inter Variable', sans-serif"
export const SERIF = "'Newsreader Variable', Georgia, serif"
export const SANS = "'Inter Variable', sans-serif"


export function rng(seed: number) {
  let s = seed % 2147483647 || 1
  return () => (s = (s * 48271) % 2147483647) / 2147483647
}
