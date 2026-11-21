// Fixed scenes for screenshots, driven by `?shot=`.
//   ?shot=cover  — the cover alone, filling the window (body.shot-cover).
//   ?shot=editor — the full studio with a sample photo loaded.
// Query knobs: layout, grade, photo (pier|boulevard), kicker, title (lines
// joined by |), script, size (1080x1080|1080x1350|1920x1080).
// window.__shotReady is set once the cover is painted with fonts loaded.

export async function runShot(shot, query, apply) {
  const size = (query.get('size') ?? '1080x1080').split('x').map(Number);
  const scene = {
    layout: query.get('layout') ?? 'collage',
    grade: query.get('grade') ?? 'sunset',
    photo: query.get('photo') ?? 'pier',
    kicker: query.get('kicker') ?? 'WELCOME TO LEONIDA',
    title: (query.get('title') ?? 'SUNSET|HEIST').split('|'),
    script: query.get('script') ?? 'one last score',
    width: size[0] || 1080,
    height: size[1] || 1080,
  };
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await apply(scene);
  try { await document.fonts.ready; } catch { /* fonts are local; paint anyway */ }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
