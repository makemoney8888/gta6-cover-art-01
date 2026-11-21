// Panel geometry for Viceprint covers. Every layout is a set of panels in
// fraction coordinates (0..1 of the cover's width and height), so the same
// layout works at 1080x1080, 1080x1350 and 1920x1080. A panel is a rectangle
// {x, y, w, h} plus an optional `slant`: the x-shift of its bottom corners
// against its top corners, which gives the duo layout its angled divider in
// the spirit of hand-cut poster collages. `titleSpot` says where the
// lettering lives: in a clear band at the top, or overlaid on the art.

function rect(x, y, w, h, slant = 0) {
  return { x, y, w, h, slant };
}

/** The polygon of a panel as [fx, fy] corner points, clockwise from top-left. */
export function panelPoly(p) {
  const s = p.slant;
  return [
    [p.x, p.y],
    [p.x + p.w, p.y],
    [p.x + p.w + s, p.y + p.h],
    [p.x + s, p.y + p.h],
  ];
}

/** True when the fraction point (fx, fy) falls inside the panel's polygon. */
export function panelHit(p, fx, fy) {
  // Panels are convex quads; walk the edges and keep a consistent sign.
  const poly = panelPoly(p);
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const cross = (bx - ax) * (fy - ay) - (by - ay) * (fx - ax);
    if (cross !== 0) {
      if (sign === 0) sign = Math.sign(cross);
      else if (Math.sign(cross) !== sign) return false;
    }
  }
  return true;
}

export const LAYOUTS = [
  {
    id: 'collage',
    name: 'Cover Collage',
    blurb: 'The classic poster grid: one hero panel, two beats, a wide strip.',
    titleSpot: 'band',
    panels: () => [
      rect(0.025, 0.245, 0.545, 0.505),
      rect(0.59, 0.245, 0.385, 0.242),
      rect(0.59, 0.507, 0.385, 0.243),
      rect(0.025, 0.77, 0.95, 0.205),
    ],
  },
  {
    id: 'duo',
    name: 'Twin Bill',
    blurb: 'Two portraits split by one slanted cut, lettering across the top.',
    titleSpot: 'band',
    panels: () => [
      rect(0.025, 0.235, 0.475, 0.74, 0.055),
      rect(0.52, 0.235, 0.455, 0.74, 0.055),
    ],
  },
  {
    id: 'hero',
    name: 'Hero Shot',
    blurb: 'One photograph, full bleed, with the title standing on the art.',
    titleSpot: 'overlay',
    titleBase: 0.965,
    panels: () => [rect(0.02, 0.025, 0.96, 0.95)],
  },
  {
    id: 'grid',
    name: 'Four Corners',
    blurb: 'A tidy 2x2 of moments under a headline band.',
    titleSpot: 'band',
    panels: () => [
      rect(0.025, 0.225, 0.462, 0.365),
      rect(0.513, 0.225, 0.462, 0.365),
      rect(0.025, 0.61, 0.462, 0.365),
      rect(0.513, 0.61, 0.462, 0.365),
    ],
  },
  {
    id: 'strip',
    name: 'Hero & Strip',
    blurb: 'A wide hero frame with a three-panel film strip beneath it.',
    titleSpot: 'overlay',
    titleBase: 0.615,
    panels: () => [
      rect(0.025, 0.03, 0.95, 0.60),
      rect(0.025, 0.655, 0.30, 0.315),
      rect(0.35, 0.655, 0.30, 0.315),
      rect(0.675, 0.655, 0.30, 0.315),
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
