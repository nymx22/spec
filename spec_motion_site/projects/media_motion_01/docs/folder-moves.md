# Safe Folder Moves

## Rules
- Search for a file's name before moving it
- Move one file at a time, test after each
- Never move and rename in the same step
- Commit before you start each session

---

## ~~Step 1 — Create `js/modules/`~~ ✓ Done
## ~~Step 2 — Move `docs/`~~ ✓ Done
## ~~Step 3 — Move `assets/spec-logo.png`~~ ✓ Done
## ~~Step 4 — Commit~~ ✓ Done
## ~~Step 5 — Delete `about/`~~ ✓ Done
## ~~Step 6 — Move `fonts/`~~ ✓ Done
## ~~Step 7 — Group stills into `html/stills/`~~ ✓ Done
## ~~Step 8 — Group redirects into `html/redirects/`~~ ✓ Done

---

## Current `html/` state

```
html/
├── liquidfun-phases/          ✓ grouped
├── redirects/                 ✓ grouped
├── stills/                    ✓ grouped
├── motion-post-1-2-doc.html   stays — referenced by post1-2.html
├── overview.html              stays — core hub entry
├── post1-2-gallery-2.html     → move to galleries/
├── post1-2-gallery-2-5.html   → move to galleries/
├── post1-2-gallery-2-7.html   → move to galleries/
├── post1-2-gallery-3.html     → move to galleries/ (not linked from hub — direct URL only)
├── post1-2-gallery-4.html     → move to galleries/
├── post1-2.html               stays — core hub
├── post1.html                 stays — linked from overview
├── post2-gallery.html         stays — loaded by almost everything
├── speck-dev-char-fall.html   → move to dev/
├── speck.html                 → move to dev/
└── venn-liquidfun-composite.html → move to dev/
```

---

## ~~Step 9 — Move dev pages into `html/dev/`~~ ✓ Done
**Risk: low · Nothing external links to these**

Files to move:
```
html/speck.html                    →  html/dev/speck.html
html/speck-dev-char-fall.html      →  html/dev/speck-dev-char-fall.html
html/venn-liquidfun-composite.html →  html/dev/venn-liquidfun-composite.html
```

For each file after moving, update the internal JS paths from `../js/` to `../../js/`:

`speck.html` — 2 lines:
```html
<script src="../../js/inkBlob.js"></script>
<script src="../../js/speckSketch.js"></script>
```

`speck-dev-char-fall.html` — 1 line:
```html
<script src="../../js/canvasFit4x5.js"></script>
```

`venn-liquidfun-composite.html` — 4 lines:
```html
<script src="../../js/canvasFit4x5.js"></script>
<script src="../../js/lib/liquidfun.js"></script>
<script src="../../js/speckLiquidFun.js"></script>
<script src="../../js/vennLiquidFunComposite.js"></script>
```

Move and fix one file at a time. Open each in browser to verify it loads.

---

## ~~Step 10 — Move gallery shells into `html/galleries/`~~ ✓ Done
**Risk: medium · Requires updates in post1-2.html and inside each shell**

Files to move:
```
html/post1-2-gallery-2.html    →  html/galleries/post1-2-gallery-2.html
html/post1-2-gallery-2-5.html  →  html/galleries/post1-2-gallery-2-5.html
html/post1-2-gallery-2-7.html  →  html/galleries/post1-2-gallery-2-7.html
html/post1-2-gallery-3.html    →  html/galleries/post1-2-gallery-3.html
html/post1-2-gallery-4.html    →  html/galleries/post1-2-gallery-4.html
```

**Inside each gallery shell**, update 2 paths (one level deeper now):
```html
<!-- before -->
<link rel="stylesheet" href="../css/galleryShell.css" />
<script src="../js/galleryShell.js"></script>

<!-- after -->
<link rel="stylesheet" href="../../css/galleryShell.css" />
<script src="../../js/galleryShell.js"></script>
```

**Also inside each shell**, the `initSpecGallery` slide srcs reference sibling HTML files.
Add `../` prefix to any relative HTML path:
```js
// before
src: 'post2-gallery.html?...'
src: 'liquidfun-phases/phase-4-speck-word.html...'

// after
src: '../post2-gallery.html?...'
src: '../liquidfun-phases/phase-4-speck-word.html...'
```

**In `post1-2.html`**, update the 4 data-src values:
```html
<!-- before -->
data-src="post1-2-gallery-2.html"
data-src="post1-2-gallery-2-5.html"
data-src="post1-2-gallery-2-7.html"
data-src="post1-2-gallery-4.html"

<!-- after -->
data-src="galleries/post1-2-gallery-2.html"
data-src="galleries/post1-2-gallery-2-5.html"
data-src="galleries/post1-2-gallery-2-7.html"
data-src="galleries/post1-2-gallery-4.html"
```

Move one gallery file at a time, fix its paths, test it loads, then do the next.
Update `post1-2.html` only after all 5 gallery shells are moved and verified.

---

## Final `html/` state after steps 9 and 10

```
html/
├── dev/
│   ├── speck.html
│   ├── speck-dev-char-fall.html
│   └── venn-liquidfun-composite.html
├── galleries/
│   ├── post1-2-gallery-2.html
│   ├── post1-2-gallery-2-5.html
│   ├── post1-2-gallery-2-7.html
│   ├── post1-2-gallery-3.html
│   └── post1-2-gallery-4.html
├── liquidfun-phases/
├── redirects/
├── stills/
├── motion-post-1-2-doc.html
├── overview.html
├── post1-2.html
├── post1.html
└── post2-gallery.html
```

---

## Do not touch
```
html/post1-2.html              ←  core hub, 700+ lines, many internal links
html/post2-gallery.html        ←  loaded as iframe by almost every page
js/sketch.js                   ←  loaded by almost every page
js/galleryShell.js             ←  loaded by every gallery
css/galleryShell.css           ←  loaded by every gallery
```

---

## For reference — redirect files (keep these)
```
spec_motion_site/post1-2.html              →  projects/.../html/post1-2.html
html/redirects/testing.html               →  ../post1-2.html
html/redirects/post2.html                 →  ../post1-2.html
```

---

## ~~Step 11 — Extract `js/modules/`~~ ✓ Done

Three pure-computation modules, namespace pattern (`const X = {}`), no p5:

- `js/modules/easing.js` — `Easing.{clamp01, lerp, easeOutCubic, easeInOutCubic, smootherstep, easeInExpo, easeOutExpo}`
- `js/modules/vennGeometry.js` — `VennGeometry.{distSq, pointInsideCircle, pointOutsideCircle, isExclusiveRegionGeometric, isSpectrumExclusiveReaderScanClip, isSpeckSpectrumOverlapGeometric, isInspectSpectrumOverlapGeometric, isSpeckInspectOverlapGeometric, normalizeAnglePi, makeTextUpright}`
- `js/modules/spectrumReader.js` — `SpectrumReader.{screenToWorld, worldToScreen, scanStripsHitInterval, verticalRunsAtScreenX, sweepSpanAlongWord, sweepLocal}` (uses `Easing.lerp`)

`post2-gallery.html` loads all three before `sketch.js`. `sketch.js` already delegates to module functions throughout.

---

## Do not touch
```
html/post1-2.html              ←  core hub, 700+ lines, many internal links
html/post2-gallery.html        ←  loaded as iframe by almost every page
js/sketch.js                   ←  loaded by almost every page
js/galleryShell.js             ←  loaded by every gallery
css/galleryShell.css           ←  loaded by every gallery
js/modules/                    ←  loaded before sketch.js via post2-gallery.html
```
