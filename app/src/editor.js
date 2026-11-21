// Viceprint editor: wires the studio page together.
//
// State: the chosen layout and grade, the photo library (two bundled
// samples plus anything the person adds), one view per frame (which photo,
// how far it is zoomed, where it sits), and the words. The preview canvas
// and the exported PNG are painted by the same renderCover call, so what
// you see is what you save. A `?shot=` query sets up a fixed scene for a
// screenshot instead (./shots.js).

import { LAYOUTS, layoutById, frameContains } from './layouts.js';
import { GRADES, gradeById } from './grades.js';
import { renderCover } from './painter.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const noteEl = document.getElementById('panelNote');
const trayEl = document.getElementById('tray');
const layoutPicker = document.getElementById('layoutPicker');
const gradePicker = document.getElementById('gradePicker');
const panelPhotoSel = document.getElementById('panelPhoto');
const panelZoom = document.getElementById('panelZoom');

const SAMPLES = [
  { name: 'Pier at sunset', url: 'samples/pier.jpg' },
  { name: 'Boulevard at dusk', url: 'samples/boulevard.jpg' },
];

/** Loads an image from a URL, resolving once it can be drawn. */
function loadImage(url) {
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
  photos: [],          // { name, url, img }
  frames: [],          // { photo, zoom, dx, dy } per frame, -1..1 offsets
  selectedFrame: 0,
  kicker: 'WELCOME TO LEONIDA',
  titleLines: ['SUNSET', 'HEIST'],
  script: 'one last score',
};

function defaultFrames(count) {
  return Array.from({ length: count }, () => ({ photo: 0, zoom: 1, dx: 0, dy: 0 }));
}

function syncFrames() {
  const count = state.layout.frames().length;
  while (state.frames.length < count) state.frames.push({ photo: 0, zoom: 1, dx: 0, dy: 0 });
  state.frames.length = count;
  if (state.selectedFrame >= count) state.selectedFrame = 0;
}

function renderState() {
  renderCover(canvas, {
    layout: state.layout,
    grade: state.grade,
    photos: state.photos.map((p) => p.img),
    frames: state.frames,
    kicker: state.kicker,
    titleLines: state.titleLines,
    script: state.script,
  });
}

function redraw() {
  renderState();
  const frames = state.layout.frames();
  noteEl.textContent = `Panel ${state.selectedFrame + 1} of ${frames.length} selected — ${state.layout.label}`;
  const view = state.frames[state.selectedFrame];
  if (view) {
    panelPhotoSel.value = String(view.photo);
    panelZoom.value = String(view.zoom);
  }
}

function buildTray() {
  trayEl.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const thumb = document.createElement('img');
    thumb.src = photo.url;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    if (state.frames[state.selectedFrame]?.photo === i) thumb.classList.add('active');
    thumb.addEventListener('click', () => {
      state.frames[state.selectedFrame].photo = i;
      buildTray();
      redraw();
    });
    trayEl.appendChild(thumb);
  });
  panelPhotoSel.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = photo.name;
    panelPhotoSel.appendChild(opt);
  });
}

function buildPickers() {
  layoutPicker.innerHTML = '';
  gradePicker.innerHTML = '';
  LAYOUTS.forEach((layout) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = layout.label;
    b.title = layout.note;
    if (layout.id === state.layout.id) b.classList.add('active');
    b.addEventListener('click', () => {
      state.layout = layout;
      syncFrames();
      buildPickers();
      redraw();
    });
    layoutPicker.appendChild(b);
  });
  GRADES.forEach((grade) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = grade.label;
    if (grade.id === state.grade.id) b.classList.add('active');
    b.addEventListener('click', () => {
      state.grade = grade;
      buildPickers();
      redraw();
    });
    gradePicker.appendChild(b);
  });
}

// Drag on the preview: pick a frame, then move its photo inside it.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width;
  const fy = (e.clientY - r.top) / r.height;
  const frames = state.layout.frames();
  const hit = frames.findIndex((f) => frameContains(f, fx, fy));
  if (hit === -1) return;
  state.selectedFrame = hit;
  drag = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  buildTray();
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const view = state.frames[state.selectedFrame];
  view.dx = Math.max(-1, Math.min(1, view.dx + ((e.clientX - drag.x) / r.width) * 2));
  view.dy = Math.max(-1, Math.min(1, view.dy + ((e.clientY - drag.y) / r.height) * 2));
  drag = { x: e.clientX, y: e.clientY };
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

panelPhotoSel.addEventListener('change', () => {
  state.frames[state.selectedFrame].photo = Number(panelPhotoSel.value);
  buildTray();
  redraw();
});
panelZoom.addEventListener('input', () => {
  state.frames[state.selectedFrame].zoom = Number(panelZoom.value);
  redraw();
});
document.getElementById('resetPanel').addEventListener('click', () => {
  state.frames[state.selectedFrame] = { photo: state.frames[state.selectedFrame].photo, zoom: 1, dx: 0, dy: 0 };
  redraw();
});
document.getElementById('fillAll').addEventListener('click', () => {
  const photo = state.frames[state.selectedFrame].photo;
  state.frames.forEach((v) => { v.photo = photo; });
  buildTray();
  redraw();
});
document.getElementById('addPhotos').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    state.photos.push({ name: file.name, url, img });
  }
  buildTray();
  redraw();
});

for (const [id, key] of [['kicker', 'kicker'], ['script', 'script']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    redraw();
  });
}
document.getElementById('title1').addEventListener('input', (e) => {
  state.titleLines[0] = e.target.value;
  redraw();
});
document.getElementById('title2').addEventListener('input', (e) => {
  state.titleLines[1] = e.target.value;
  redraw();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const [w, h] = document.getElementById('exportSize').value.split('x').map(Number);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  renderCover(out, {
    layout: state.layout,
    grade: state.grade,
    photos: state.photos.map((p) => p.img),
    frames: state.frames,
    kicker: state.kicker,
    titleLines: state.titleLines,
    script: state.script,
  });
  out.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `viceprint-${w}x${h}.png`;
    a.click();
    statusEl.textContent = `Saved viceprint-${w}x${h}.png`;
  }, 'image/png');
});

async function boot() {
  for (const sample of SAMPLES) {
    const img = await loadImage(sample.url);
    state.photos.push({ ...sample, img });
  }
  syncFrames();
  buildTray();
  buildPickers();

  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    await runShot(shot, query, async (scene) => {
      canvas.width = scene.width;
      canvas.height = scene.height;
      state.layout = layoutById(scene.layout);
      state.grade = gradeById(scene.grade);
      state.kicker = scene.kicker;
      state.titleLines = scene.title;
      state.script = scene.script;
      syncFrames();
      const photoIndex = state.photos.findIndex((p) => p.url.includes(scene.photo));
      state.frames.forEach((v) => { v.photo = photoIndex === -1 ? 0 : photoIndex; });
      buildPickers();
      redraw();
    });
  } else {
    redraw();
  }
}

boot();
