// Poster layouts for Viceprint covers.
//
// A layout is a list of frames in fraction coordinates (0..1 of the cover
// width and height), so one layout fits the square, portrait and wide export
// sizes alike. A frame is { x, y, w, h } plus an optional `lean`: how far the
// bottom edge shifts sideways against the top edge, which gives the duo
// layout its slanted divider, like a hand-cut poster collage. `headline`
// says where the words live: in a clear band across the top ('band'), or
// standing on the artwork itself, anchored by its foot ('foot').

function frame(x, y, w, h, lean = 0) {
  return { x, y, w, h, lean };
}

/** The four corners of a frame as [fx, fy] points, clockwise from top-left. */
export function frameCorners(f) {
  return [
    [f.x, f.y],
    [f.x + f.w, f.y],
    [f.x + f.w + f.lean, f.y + f.h],
    [f.x + f.lean, f.y + f.h],
  ];
}

/** True when the fraction point (fx, fy) falls inside the frame's quad. */
export function frameContains(f, fx, fy) {
  // Frames are convex quads: every edge must turn the same way.
  const corners = frameCorners(f);
  let sign = 0;
  for (let i = 0; i < corners.length; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[(i + 1) % corners.length];
    const cross = (bx - ax) * (fy - ay) - (by - ay) * (fx - ax);
    if (cross === 0) continue;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

export const LAYOUTS = [
  {
    id: 'collage',
    label: 'Cover Collage',
    note: 'Hero panel, two beats, a wide strip — the classic poster grid.',
    headline: 'band',
    frames: () => [
      frame(0.025, 0.245, 0.545, 0.505),
      frame(0.59, 0.245, 0.385, 0.242),
      frame(0.59, 0.507, 0.385, 0.243),
      frame(0.025, 0.77, 0.95, 0.205),
    ],
  },
  {
    id: 'duo',
    label: 'Twin Bill',
    note: 'Two portraits split by one slanted cut, words across the top.',
    headline: 'band',
    frames: () => [
      frame(0.025, 0.235, 0.475, 0.74, 0.055),
      frame(0.52, 0.235, 0.455, 0.74, 0.055),
    ],
  },
  {
    id: 'hero',
    label: 'Hero Shot',
    note: 'One photograph, full bleed, the title standing on the art.',
    headline: 'foot',
    footAt: 0.965,
    frames: () => [frame(0.02, 0.025, 0.96, 0.95)],
  },
  {
    id: 'grid',
    label: 'Four Corners',
    note: 'A tidy 2×2 of moments under a headline band.',
    headline: 'band',
    frames: () => [
      frame(0.025, 0.225, 0.462, 0.365),
      frame(0.513, 0.225, 0.462, 0.365),
      frame(0.025, 0.61, 0.462, 0.365),
      frame(0.513, 0.61, 0.462, 0.365),
    ],
  },
  {
    id: 'strip',
    label: 'Hero & Strip',
    note: 'A wide hero frame over a three-panel film strip.',
    headline: 'foot',
    footAt: 0.615,
    frames: () => [
      frame(0.025, 0.03, 0.95, 0.60),
      frame(0.025, 0.655, 0.30, 0.315),
      frame(0.35, 0.655, 0.30, 0.315),
      frame(0.675, 0.655, 0.30, 0.315),
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
