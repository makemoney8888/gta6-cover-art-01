// Viceprint — entry program for the gta6-cover-art-01 bounty (Node 22,
// standard library only). The app itself is this directory's app/ folder:
// plain static files a desktop browser runs fully offline. This program
// hands the entry in: it copies app/ and screenshots/ into the output
// directory and writes dossier.json there with the kit's buildDossier, the
// summary the judge reads.
//
// The output directory is emptied first, so a stale file from an earlier
// run can never leak into an entry and two runs over the same repository
// write byte-identical output.
//
// Serve the app locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/** Counts the files and bytes under a directory, recursively. */
function measure(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = measure(path);
      files += inner.files;
      bytes += inner.bytes;
    } else {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (see the kit's RULES.txt, "The gate"):
// at most 4 screenshots of 256 KiB each, at most 993 files and 48 MiB
// under app/, no app path over 1000 bytes, and the dossier's source text
// capped at 160 KiB. buildDossier refuses an entry the scorer would
// refuse, rather than writing a dossier for it.
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

// Handover summary: the gate wants 3 or 4 screenshots, so say so loudly
// here rather than letting a short or over-long set reach the scorer.
const shots = readdirSync(join(out, 'screenshots')).filter((n) => !n.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ holds ${shots.length} images; the gate wants 3 or 4`);
}
const total = measure(out);
console.log(
  `viceprint: handed in ${total.files} files, ${total.bytes} bytes, ` +
  `${shots.length} screenshots, dossier ${statSync(join(out, 'dossier.json')).size} bytes`,
);
