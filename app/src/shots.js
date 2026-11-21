// Fixed scenes for the entry's screenshots, staged by query string:
//   ?shot=editor — the studio with a finished cover loaded, UI and all.
//   ?shot=cover  — the cover alone (the page chrome is hidden by CSS).
// Both take layout, grade, size (e.g. 1920x1080), kicker, title (use %0A
// for a second line), script, and assign: a comma list of sample names, one
// per panel. window.__shotReady is set once the scene is painted with the
// real fonts, so the screenshot driver never catches a half-loaded page.

const SCENES = {
  editor: {
    layout: 'collage',
    grade: 'sunset',
    size: '1080x1350',
    kicker: 'One summer in Leonida',
    title: 'NEON\nHORIZON',
    script: 'wish you were here',
    assign: 'pier,boulevard,boulevard,pier',
  },
  cover: {
    layout: 'collage',
    grade: 'sunset',
    size: '1920x1080',
    kicker: 'One summer in Leonida',
    title: 'NEON\nHORIZON',
    script: 'wish you were here',
    assign: 'pier,boulevard,pier,boulevard',
  },
};

export async function runShot(shot, query, api) {
  const scene = { ...(SCENES[shot] ?? SCENES.cover) };
  for (const key of ['layout', 'grade', 'size', 'kicker', 'title', 'script', 'assign']) {
    if (query.get(key)) scene[key] = query.get(key);
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');

  const [w, h] = scene.size.split('x').map(Number);
  api.setSize(w, h);
  api.setLayout(scene.layout);
  api.setGrade(scene.grade);
  api.setWords({ kicker: scene.kicker, title: scene.title, script: scene.script });

  const names = scene.assign.split(',').map((s) => s.trim()).filter(Boolean);
  const seen = new Map();
  const indices = [];
  for (const name of names) {
    if (!seen.has(name)) seen.set(name, api.addPhoto(await api.samplePhoto(`samples/${name}.jpg`), name));
    indices.push(seen.get(name));
  }
  api.resetPanels(indices);
  api.redraw();
  if (document.fonts?.ready) {
    await document.fonts.ready;
    api.redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
