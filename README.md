# Viceprint — GTA-style Cover Art Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/makemoney8888/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/makemoney8888/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Viceprint turns your own photos and a few words into cover art in the
spirit of GTA 6's posters: a multi-panel collage with bold display
lettering and a Vice City sunset or neon colour grade, exported as a PNG
to share. It is a static web app — plain files under `app/`, no build
step, no network requests — and your photos are read on your own machine
and never uploaded anywhere.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome. Or serve `app/` with any
static file server.

## What it does

1. **Photos** — start from the two bundled samples (a boulevard at dusk,
   a pier at sunset) or add your own; every panel of the cover can hold a
   different photo, or one photo can fill them all.
2. **Layouts** — five poster grids: Cover Collage (hero + two beats + a
   wide strip), Twin Bill (two portraits split by a slanted cut), Hero
   Shot (one full-bleed photograph), Four Corners (2×2), and Hero &
   Strip (a wide hero over a three-panel film strip).
3. **Panels** — pick a panel, choose its photo, zoom it, and drag the
   photo right on the preview to position it in the frame.
4. **Colour grades** — Vice Sunset, Neon Nights, Golden Hour, Midnight
   Chrome and Tropical Punch re-skin the photos, the backdrop, the
   lettering and the studio seal in one click.
5. **Words** — a letterspaced kicker, a big Anton title with an ink
   outline and hard shadow, and a glowing Pacifico script line.
6. **Export** — one click saves the exact previewed pixels as a PNG in
   the common post sizes: 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## How it is put together

- `app/index.html` + `app/style.css` — the editor page and its theme.
- `app/src/panels.js` — the layout geometry, in fraction coordinates so
  every layout fits every export size.
- `app/src/grade.js` — the five colour grades (filter, wash, palette).
- `app/src/render.js` — the cover painter: graded backdrop, clipped
  photo panels, lettering, seal, grain and vignette. The preview and the
  exported PNG are the same drawing.
- `app/src/main.js` — the editor wiring: photo tray, panel selection,
  drag-to-position, export.
- `app/src/shots.js` — deterministic `?shot=` scenes used to take the
  screenshots in `screenshots/` (see `shots.json`).
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` with the kit's
  `buildDossier` (`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`).

## Fonts and samples

Anton and Pacifico are vendored under `app/fonts/` with their SIL Open
Font License texts (`OFL-Anton.txt`, `OFL-Pacifico.txt`). The two sample
photos under `app/samples/` were made with an image model for make.fun
and are free to use. Everything else — design, code, lettering — is
original to this entry; no Rockstar Games logo, artwork or font is used.

## License

MIT — see `LICENSE`.
