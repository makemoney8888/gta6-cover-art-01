// Viceprint entry program (Node 22, standard library only).
//
// The app is plain static files under app/ (app/index.html and its ES
// modules, no library, no network request) and this program hands it in:
// it copies app/ and screenshots/ from beside this file to the output
// directory and writes /output/dossier.json with the kit's buildDossier.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps, mirrored here so a bad tree fails loudly at build
// time instead of at grading: 3 or 4 screenshots, each at most 256 KiB,
// and an OSI-approved license carrying its SPDX identifier line.
const licensePath = join(here, 'LICENSE');
if (!existsSync(licensePath) || !readFileSync(licensePath, 'utf8').includes('SPDX-License-Identifier: MIT')) {
  throw new Error('LICENSE is missing or lacks the SPDX-License-Identifier: MIT line');
}
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => !f.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const shot of shots) {
  const bytes = statSync(join(shotsDir, shot)).size;
  if (bytes > 262144) throw new Error(`screenshot ${shot} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// The dossier itself is capped at 1.5 MiB; refuse a build that busts it.
const dossierBytes = statSync(join(out, 'dossier.json')).size;
if (dossierBytes > 1572864) {
  throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
}

console.log(`Viceprint dossier written: ${shots.length} screenshots, ${readdirSync(join(out, 'app'), { recursive: true }).length} app entries, dossier ${dossierBytes} bytes`);
