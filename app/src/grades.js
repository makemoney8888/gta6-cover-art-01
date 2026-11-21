// Colour grades for Viceprint covers.
//
// One grade re-skins the whole cover at once: the painter applies the
// `filter` to every panel photograph, lays a two-stop `wash` over it in
// `blend` mode, pools a soft `glow` in the panel's upper third, and paints
// the backdrop, the title gradient and the seal from the same palette.

export const GRADES = [
  {
    id: 'sunset',
    label: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.07) brightness(1.03)',
    washTop: 'rgba(255, 94, 58, 0.34)',
    washBottom: 'rgba(64, 12, 92, 0.42)',
    blend: 'soft-light',
    glow: 'rgba(255, 150, 80, 0.20)',
    sky: ['#2b0f3a', '#7a1e4f', '#e2543e'],
    ink: ['#fff6e8', '#ffd23e', '#ff7847'],
    accent: '#ff5e8a',
  },
  {
    id: 'neon',
    label: 'Neon Nights',
    filter: 'saturate(1.5) contrast(1.12) brightness(0.99) hue-rotate(-8deg)',
    washTop: 'rgba(0, 229, 255, 0.30)',
    washBottom: 'rgba(255, 0, 128, 0.36)',
    blend: 'soft-light',
    glow: 'rgba(0, 229, 255, 0.18)',
    sky: ['#050914', '#0d2b52', '#3d1159'],
    ink: ['#eaffff', '#4de3ff', '#ff4dd2'],
    accent: '#4de3ff',
  },
  {
    id: 'gold',
    label: 'Golden Hour',
    filter: 'saturate(1.22) contrast(1.05) brightness(1.06) sepia(0.28)',
    washTop: 'rgba(255, 196, 64, 0.30)',
    washBottom: 'rgba(120, 53, 15, 0.38)',
    blend: 'soft-light',
    glow: 'rgba(255, 205, 92, 0.22)',
    sky: ['#241203', '#6e3410', '#c97b2d'],
    ink: ['#fffbef', '#ffe9a8', '#f5a83d'],
    accent: '#ffb347',
  },
  {
    id: 'chrome',
    label: 'Midnight Chrome',
    filter: 'saturate(0.72) contrast(1.16) brightness(1.0)',
    washTop: 'rgba(148, 197, 255, 0.26)',
    washBottom: 'rgba(8, 12, 32, 0.46)',
    blend: 'soft-light',
    glow: 'rgba(160, 200, 255, 0.14)',
    sky: ['#04060d', '#101c33', '#27395c'],
    ink: ['#ffffff', '#cfe4ff', '#7fa8d9'],
    accent: '#a9c8ff',
  },
  {
    id: 'punch',
    label: 'Tropical Punch',
    filter: 'saturate(1.65) contrast(1.1) brightness(1.05)',
    washTop: 'rgba(64, 255, 196, 0.26)',
    washBottom: 'rgba(255, 64, 128, 0.34)',
    blend: 'soft-light',
    glow: 'rgba(120, 255, 190, 0.16)',
    sky: ['#0b2e1f', '#0f5e46', '#d9366b'],
    ink: ['#f4fff8', '#8dffce', '#ff5e8a'],
    accent: '#ffe14d',
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
