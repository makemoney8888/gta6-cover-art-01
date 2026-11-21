// The Viceprint editor: wires the page's controls to the cover painter in
// render.js. Photos live only in this tab's memory (object URLs and the two
// bundled samples); the canvas always shows the exact pixels Export saves.
// A `?shot=` query hands control to ./shots.js, which stages fixed scenes
// for the entry's screenshots.

import { LAYOUTS, layoutById, panelHit } from './panels.js';
import { GRADES, gradeById } from './grade.js';
import { paintCover } from './render.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('stage');
const status = document.getElementById('status');
const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const state = {
  layout: layoutById('collage'),
  grade: gradeById('sunset'),
  photos: [],
  photoNames: [],
  panels: [],
  selected: 0,
  kicker: '',
  title: '',
  script: '',
};

const sampleCache = new Map();
async function samplePhoto(path) {
  if (!sampleCache.has(path)) sampleCache.set(path, await loadImage(path));
  return sampleCache.get(path);
}

/** Adds a photo to the tray and returns its index. */
function addPhoto(img, name) {
  state.photos.push(img);
  state.photoNames.push(name);
  renderTray();
  syncPanelPhotoOptions();
  return state.photos.length - 1;
}

/** (Re)builds the per-panel views for the current layout. */
function resetPanels(pattern) {
  const count = state.layout.panels().length;
  state.panels = Array.from({ length: count }, (_, i) => ({
    photo: pattern?.[i] ?? (state.photos.length ? i % state.photos.length : 0),
    zoom: 1,
    dx: 0,
    dy: 0,
  }));
  state.selected = 0;
  buildPanelTabs();
  syncPanelControls();
}

function redraw() {
  state.kicker = document.getElementById('kicker').value;
  state.title = document.getElementById('title').value;
  state.script = document.getElementById('script').value;
  paintCover(canvas, state);
}

// ---- control builders -------------------------------------------------

function buildLayouts() {
  const box = document.getElementById('layouts');
  box.innerHTML = '';
  for (const layout of LAYOUTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (layout.id === state.layout.id ? ' active' : '');
    btn.innerHTML = `<span class="choice-name"></span><span class="choice-blurb"></span>`;
    btn.querySelector('.choice-name').textContent = layout.name;
    btn.querySelector('.choice-blurb').textContent = layout.blurb;
    btn.addEventListener('click', () => {
      state.layout = layout;
      resetPanels();
      buildLayouts();
      redraw();
    });
    box.appendChild(btn);
  }
}

function buildGrades() {
  const box = document.getElementById('grades');
  box.innerHTML = '';
  for (const grade of GRADES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice grade-choice' + (grade.id === state.grade.id ? ' active' : '');
    const swatch = document.createElement('span');
    swatch.className = 'grade-swatch';
    swatch.style.background = `linear-gradient(180deg, ${grade.sky[1]}, ${grade.sky[2]})`;
    const label = document.createElement('span');
    label.innerHTML = `<span class="choice-name"></span>`;
    label.querySelector('.choice-name').textContent = grade.name;
    btn.append(swatch, label);
    btn.addEventListener('click', () => {
      state.grade = grade;
      buildGrades();
      redraw();
    });
    box.appendChild(btn);
  }
}

function buildPanelTabs() {
  const box = document.getElementById('panel-tabs');
  box.innerHTML = '';
  state.panels.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-tab' + (i === state.selected ? ' active' : '');
    btn.textContent = `Panel ${i + 1}`;
    btn.addEventListener('click', () => {
      state.selected = i;
      buildPanelTabs();
      syncPanelControls();
    });
    box.appendChild(btn);
  });
}

function renderTray() {
  const tray = document.getElementById('tray');
  tray.innerHTML = '';
  state.photoNames.forEach((name, i) => {
    const chip = document.createElement('span');
    chip.textContent = `${i + 1}. ${name}`;
    tray.appendChild(chip);
  });
}

function syncPanelPhotoOptions() {
  const sel = document.getElementById('panel-photo');
  sel.innerHTML = '';
  state.photoNames.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `${i + 1}. ${name}`;
    sel.appendChild(opt);
  });
  syncPanelControls();
}

function syncPanelControls() {
  const view = state.panels[state.selected];
  if (!view) return;
  document.getElementById('panel-photo').value = String(view.photo);
  document.getElementById('panel-zoom').value = String(view.zoom);
}

// ---- events -------------------------------------------------------------

document.getElementById('upload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const img = await loadImage(URL.createObjectURL(file));
    addPhoto(img, file.name.replace(/\.[^.]+$/, ''));
  }
  if (state.panels.length === 0) resetPanels();
  redraw();
  status.textContent = `${state.photos.length} photo(s) in the tray.`;
});

document.querySelectorAll('[data-sample]').forEach((chip) => {
  chip.addEventListener('click', async () => {
    const path = chip.dataset.sample;
    let idx = state.photoNames.findIndex((n) => n.toLowerCase() === path.split('/').pop().split('.')[0]);
    if (idx === -1) idx = addPhoto(await samplePhoto(path), path.split('/').pop().split('.')[0]);
    const view = state.panels[state.selected];
    if (view) view.photo = idx;
    syncPanelControls();
    redraw();
  });
});

document.getElementById('panel-photo').addEventListener('change', (e) => {
  state.panels[state.selected].photo = Number(e.target.value);
  redraw();
});
document.getElementById('panel-zoom').addEventListener('input', (e) => {
  state.panels[state.selected].zoom = Number(e.target.value);
  redraw();
});
document.getElementById('panel-reset').addEventListener('click', () => {
  Object.assign(state.panels[state.selected], { zoom: 1, dx: 0, dy: 0 });
  syncPanelControls();
  redraw();
});
document.getElementById('panel-fill-all').addEventListener('click', () => {
  const photo = state.panels[state.selected].photo;
  state.panels.forEach((p) => { p.photo = photo; });
  redraw();
});

document.getElementById('size').addEventListener('change', (e) => {
  const [w, h] = SIZES[e.target.value];
  canvas.width = w;
  canvas.height = h;
  redraw();
});

for (const id of ['kicker', 'title', 'script']) {
  document.getElementById(id).addEventListener('input', redraw);
}

document.getElementById('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `viceprint-cover-${canvas.width}x${canvas.height}.png`;
    a.click();
    status.textContent = `Saved ${a.download}`;
  }, 'image/png');
});

// Dragging on the canvas repositions the photo in the panel under the
// pointer (and selects that panel, so the sliders follow along).
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width;
  const fy = (e.clientY - r.top) / r.height;
  const panels = state.layout.panels();
  const hit = panels.findIndex((p) => panelHit(p, fx, fy));
  if (hit === -1) return;
  if (hit !== state.selected) {
    state.selected = hit;
    buildPanelTabs();
    syncPanelControls();
  }
  drag = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const view = state.panels[state.selected];
  view.dx = Math.max(-1, Math.min(1, view.dx + ((e.clientX - drag.x) / r.width) * 2.4));
  view.dy = Math.max(-1, Math.min(1, view.dy + ((e.clientY - drag.y) / r.height) * 2.4));
  drag = { x: e.clientX, y: e.clientY };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

// ---- start ---------------------------------------------------------------

const api = {
  state,
  canvas,
  redraw,
  resetPanels,
  buildLayouts,
  buildGrades,
  addPhoto,
  samplePhoto,
  setSize(w, h) {
    canvas.width = w;
    canvas.height = h;
    document.getElementById('size').value = `${w}x${h}`;
  },
  setLayout(id) { state.layout = layoutById(id); buildLayouts(); },
  setGrade(id) { state.grade = gradeById(id); buildGrades(); },
  setWords({ kicker, title, script }) {
    if (kicker !== undefined) document.getElementById('kicker').value = kicker;
    if (title !== undefined) document.getElementById('title').value = title;
    if (script !== undefined) document.getElementById('script').value = script;
  },
};

async function start() {
  buildLayouts();
  buildGrades();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), api);
    return;
  }
  // Default scene: the pier in the hero panel, the boulevard around it.
  const pier = addPhoto(await samplePhoto('samples/pier.jpg'), 'pier');
  const boulevard = addPhoto(await samplePhoto('samples/boulevard.jpg'), 'boulevard');
  resetPanels([pier, boulevard, boulevard, pier]);
  redraw();
  if (document.fonts?.ready) document.fonts.ready.then(redraw);
}

start();
