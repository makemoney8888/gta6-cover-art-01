// The Viceprint cover painter: everything the app exports is drawn here, so
// the on-screen preview and the saved PNG are the same pixels. A cover is a
// graded backdrop, a set of photo panels clipped to the layout's polygons,
// and three pieces of lettering: a letterspaced kicker, a big Anton title
// with an ink outline and hard shadow, and a Pacifico script line tucked
// against it. A film grain and vignette pass finishes every cover.

import { panelPoly } from './panels.js';

const DISPLAY_FONT = '"Anton", "Arial Narrow", sans-serif';
const SCRIPT_FONT = '"Pacifico", cursive';

/** A small tile of monochrome noise, drawn tiled as film grain. */
function grainTile() {
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const g = tile.getContext('2d');
  const data = g.createImageData(140, 140);
  let seed = 20261121;
  for (let i = 0; i < data.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = 96 + (seed % 128);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return tile;
}
const grain = grainTile();

/** Shrinks a font size from `start` until `text` fits `maxWidth`. */
function fitFont(ctx, text, maxWidth, start, family) {
  let px = start;
  ctx.font = `${px}px ${family}`;
  while (px > 10 && ctx.measureText(text).width > maxWidth) {
    px *= 0.94;
    ctx.font = `${px}px ${family}`;
  }
  return px;
}

/** Draws one photo into one panel: clipped, cover-fitted, graded. */
function paintPanel(ctx, W, H, panel, view, img, grade) {
  const poly = panelPoly(panel).map(([fx, fy]) => [fx * W, fy * H]);
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const bx = Math.min(...xs);
  const by = Math.min(...ys);
  const bw = Math.max(...xs) - bx;
  const bh = Math.max(...ys) - by;

  ctx.save();
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.clip();

  if (img) {
    const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * (view?.zoom ?? 1);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const ox = bx + (bw - dw) / 2 + (view?.dx ?? 0) * Math.max(0, dw - bw) * 0.5;
    const oy = by + (bh - dh) / 2 + (view?.dy ?? 0) * Math.max(0, dh - bh) * 0.5;
    ctx.filter = grade.filter;
    ctx.drawImage(img, ox, oy, dw, dh);
    ctx.filter = 'none';
  } else {
    const empty = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    empty.addColorStop(0, '#3a2b4d');
    empty.addColorStop(1, '#171021');
    ctx.fillStyle = empty;
    ctx.fillRect(bx, by, bw, bh);
  }

  // The grade's wash: a two-stop gradient blended over the photograph.
  const wash = ctx.createLinearGradient(bx, by, bx, by + bh);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.globalCompositeOperation = grade.blend;
  ctx.fillStyle = wash;
  ctx.fillRect(bx, by, bw, bh);
  ctx.globalCompositeOperation = 'source-over';

  // A soft glow pooled in the panel's upper third.
  const glow = ctx.createRadialGradient(bx + bw / 2, by + bh * 0.3, 0, bx + bw / 2, by + bh * 0.3, bw * 0.75);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(bx, by, bw, bh);
  ctx.restore();

  // Keylines: a dark outer rule and a cream inner one, like a cut poster.
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.strokeStyle = 'rgba(10, 4, 18, 0.85)';
  ctx.lineWidth = Math.max(2, H * 0.007);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 244, 224, 0.9)';
  ctx.lineWidth = Math.max(1, H * 0.0022);
  ctx.stroke();
}

/** The striped retro sun that sits in the headline band of band layouts. */
function paintSun(ctx, W, H, grade) {
  const cx = W * 0.86;
  const cy = H * 0.115;
  const r = H * 0.085;
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, grade.titleInk[1]);
  sun.addColorStop(1, grade.titleInk[2]);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(20, 6, 30, 0.55)';
  for (let i = 0; i < 4; i++) {
    const y = cy + r * (0.08 + i * 0.22);
    ctx.fillRect(cx - r, y, r * 2, r * (0.045 + i * 0.02));
  }
  ctx.restore();
}

/** One title line: gradient face, ink outline, hard offset shadow. */
function paintTitleLine(ctx, text, cx, y, px, grade) {
  ctx.font = `${px}px ${DISPLAY_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(24, 5, 32, 0.9)';
  ctx.fillText(text, cx + px * 0.055, y + px * 0.06);
  const face = ctx.createLinearGradient(0, y - px, 0, y);
  face.addColorStop(0, grade.titleInk[0]);
  face.addColorStop(0.55, grade.titleInk[1]);
  face.addColorStop(1, grade.titleInk[2]);
  ctx.strokeStyle = '#20082e';
  ctx.lineWidth = px * 0.14;
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = face;
  ctx.fillText(text, cx, y);
}

/** The lettering block: kicker, title lines, script line. */
function paintLettering(ctx, W, H, state) {
  const { grade, layout } = state;
  const title = (state.title || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const band = layout.titleSpot === 'band';
  const cx = band ? W * 0.44 : W * 0.5;
  const kicker = (state.kicker || '').toUpperCase();
  const script = (state.script || '').trim();

  // Fit everything first: an overlay block is anchored by its foot (the
  // layout's titleBase), so it ends where the art it stands on ends.
  const maxW = band ? W * 0.78 : W * 0.9;
  const startPx = band ? H * 0.105 : H * 0.125;
  const fitted = title.map((line) => {
    const text = line.toUpperCase();
    return { text, px: fitFont(ctx, text, maxW, startPx, DISPLAY_FONT) };
  });
  const kickerPx = Math.max(11, H * 0.021);
  const scriptPx = script ? fitFont(ctx, script, W * 0.52, H * 0.052, SCRIPT_FONT) : 0;

  let top;
  if (band) {
    top = H * 0.045;
  } else {
    const base = (layout.titleBase ?? 0.965) * H;
    const blockH = (kicker ? kickerPx + H * 0.035 : 0)
      + fitted.reduce((sum, l) => sum + l.px * 0.98, 0)
      + (script ? scriptPx * 1.1 : 0);
    top = base - blockH;
    // A scrim behind the block so the lettering stands on the photograph.
    const scrimTop = Math.max(0, top - H * 0.05);
    const scrimBottom = Math.min(H, base + H * 0.03);
    const scrim = ctx.createLinearGradient(0, scrimTop, 0, scrimBottom);
    scrim.addColorStop(0, 'rgba(8, 2, 14, 0)');
    scrim.addColorStop(0.4, 'rgba(8, 2, 14, 0.55)');
    scrim.addColorStop(1, 'rgba(8, 2, 14, 0.88)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, scrimTop, W, scrimBottom - scrimTop);
  }

  // Kicker: small, uppercase, letterspaced, with rules either side.
  if (kicker) {
    const px = kickerPx;
    ctx.font = `${px}px ${DISPLAY_FONT}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${px * 0.42}px`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.titleInk[0];
    ctx.globalAlpha = 0.92;
    ctx.fillText(kicker, cx, top + px);
    const kw = ctx.measureText(kicker).width + px * 0.42 * kicker.length;
    ctx.globalAlpha = 0.7;
    const ruleY = top + px * 0.62;
    const ruleH = Math.max(1.5, px * 0.09);
    const leftRule = [cx - kw / 2 - W * 0.055, cx - kw / 2 - W * 0.017];
    const rightRule = [cx + kw / 2 + W * 0.017, cx + kw / 2 + W * 0.055];
    if (leftRule[0] > W * 0.012) ctx.fillRect(leftRule[0], ruleY, leftRule[1] - leftRule[0], ruleH);
    if (rightRule[1] < W * 0.988) ctx.fillRect(rightRule[0], ruleY, rightRule[1] - rightRule[0], ruleH);
    ctx.globalAlpha = 1;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  // Title lines, each fitted to the band or the full width.
  let y = top + (kicker ? kickerPx + H * 0.035 : 0);
  for (const line of fitted) {
    y += line.px * 0.98;
    paintTitleLine(ctx, line.text, cx, y, line.px, grade);
  }

  // Script line: Pacifico, leaned back, glowing in the grade's accent.
  if (script) {
    const px = scriptPx;
    ctx.save();
    ctx.translate(cx + W * 0.16, y + px * 0.78);
    ctx.rotate(-0.045);
    ctx.font = `${px}px ${SCRIPT_FONT}`;
    ctx.textAlign = 'center';
    ctx.shadowColor = grade.scriptInk;
    ctx.shadowBlur = px * 0.45;
    ctx.fillStyle = grade.scriptInk;
    ctx.fillText(script, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.globalAlpha = 0.35;
    ctx.fillText(script, 0, -px * 0.03);
    ctx.restore();
  }
}

/** The studio seal: an original double-ring badge, bottom-right. */
function paintSeal(ctx, W, H, grade) {
  const r = H * 0.052;
  const cx = W - r - W * 0.028;
  const cy = H - r - H * 0.028;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 5, 26, 0.82)';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, H * 0.0028);
  ctx.strokeStyle = grade.titleInk[1];
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, H * 0.0016);
  ctx.strokeStyle = 'rgba(255, 246, 232, 0.75)';
  ctx.stroke();
  // A five-point star.
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r * 0.42 : r * 0.18;
    const x = cx + Math.cos(ang) * rad;
    const yy = cy - r * 0.16 + Math.sin(ang) * rad;
    i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  }
  ctx.closePath();
  ctx.fillStyle = grade.titleInk[1];
  ctx.fill();
  ctx.font = `${r * 0.30}px ${DISPLAY_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 246, 232, 0.95)';
  ctx.fillText('VICEPRINT', cx, cy + r * 0.42);
  ctx.font = `${r * 0.235}px ${DISPLAY_FONT}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText('COVER STUDIO', cx, cy + r * 0.66);
  ctx.restore();
}

/**
 * Paints the whole cover into `canvas` at the state's export size.
 * state: { layout, grade, photos, panels: [{photo, zoom, dx, dy}],
 *          kicker, title, script }
 */
export function paintCover(canvas, state) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const { layout, grade } = state;

  // Backdrop: the grade's sky, darkest at the foot of the cover.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (layout.titleSpot === 'band') paintSun(ctx, W, H, grade);

  const panels = layout.panels();
  panels.forEach((panel, i) => {
    const view = state.panels[i] ?? { photo: 0, zoom: 1, dx: 0, dy: 0 };
    const img = state.photos[view.photo] ?? state.photos[0] ?? null;
    paintPanel(ctx, W, H, panel, view, img, grade);
  });

  paintLettering(ctx, W, H, state);
  paintSeal(ctx, W, H, grade);

  // Finish: vignette, then grain over everything at a whisper.
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(5, 0, 10, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grain, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
