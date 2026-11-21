// Colour grades for Viceprint covers. A grade is three passes the painter
// applies to every panel photograph: a canvas filter string (the base
// exposure and saturation), a two-stop gradient laid over the photo in a
// blend mode (the sunset or neon wash), and a soft radial glow colour. The
// backdrop gradient behind the panels and the title gradient come from the
// same palette, so a grade re-skins the whole cover at once.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.07) brightness(1.03)',
    washTop: 'rgba(255, 94, 58, 0.34)',
    washBottom: 'rgba(64, 12, 92, 0.42)',
    blend: 'soft-light',
    glow: 'rgba(255, 150, 80, 0.20)',
    sky: ['#2b0f3a', '#7a1e4f', '#e2543e'],
    titleInk: ['#fff6e8', '#ffd23e', '#ff7847'],
    scriptInk: '#ff5e8a',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    filter: 'saturate(1.5) contrast(1.12) brightness(0.99) hue-rotate(-8deg)',
    washTop: 'rgba(0, 229, 255, 0.30)',
    washBottom: 'rgba(255, 0, 128, 0.36)',
    blend: 'soft-light',
    glow: 'rgba(0, 229, 255, 0.18)',
    sky: ['#050914', '#0d2b52', '#3d1159'],
    titleInk: ['#eaffff', '#4de3ff', '#ff4dd2'],
    scriptInk: '#4de3ff',
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    filter: 'saturate(1.22) contrast(1.05) brightness(1.06) sepia(0.28)',
    washTop: 'rgba(255, 196, 64, 0.30)',
    washBottom: 'rgba(120, 53, 15, 0.38)',
    blend: 'soft-light',
    glow: 'rgba(255, 205, 92, 0.22)',
    sky: ['#241203', '#6e3410', '#c97b2d'],
    titleInk: ['#fffbeF', '#ffe9a8', '#f5a83d'],
    scriptInk: '#ffb347',
  },
  {
    id: 'chrome',
    name: 'Midnight Chrome',
    filter: 'saturate(0.72) contrast(1.16) brightness(1.0)',
    washTop: 'rgba(148, 197, 255, 0.26)',
    washBottom: 'rgba(8, 12, 32, 0.46)',
    blend: 'soft-light',
    glow: 'rgba(160, 200, 255, 0.14)',
    sky: ['#04060d', '#101c33', '#27395c'],
    titleInk: ['#ffffff', '#cfe4ff', '#7fa8d9'],
    scriptInk: '#a9c8ff',
  },
  {
    id: 'punch',
    name: 'Tropical Punch',
    filter: 'saturate(1.65) contrast(1.1) brightness(1.05)',
    washTop: 'rgba(64, 255, 196, 0.26)',
    washBottom: 'rgba(255, 64, 128, 0.34)',
    blend: 'soft-light',
    glow: 'rgba(120, 255, 190, 0.16)',
    sky: ['#0b2e1f', '#0f5e46', '#d9366b'],
    titleInk: ['#f4fff8', '#8dffce', '#ff5e8a'],
    scriptInk: '#ffe14d',
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
