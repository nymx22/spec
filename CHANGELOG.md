# Changelog

## [Unreleased]

### Added

- **post1.2 hub** (`motion asset/post1-2.html`): URL hashes for each preview (`#gallery`, `#liquidfun-world`, `#glyph-break`, `#speck-word`) plus aliases (`#1`–`#4`, `#matter`, `#world`, `#glyph`, `#speck`, …); back/forward updates the iframe.
- **LiquidFun gallery** (`motion asset/liquidfun-phases/liquidfun-gallery.html`): one page cycling the three LiquidFun phase HTMLs; chevron prev/next (keyboard ←/→); hash per slide for sharing (`#liquidfun-world`, `#glyph-break`, `#speck-word`).
- **`canvasFit4x5.js`**: shared 4:5 fit to `main`, mobile ref 480×600, desktop cap, **ceil(devicePixelRatio)** on desktop (cap 4), **`installMainResizeDispatch`** (ResizeObserver → synthetic `resize` for iframe flex).

### Changed

- **post1.2 hub navigation**: sidebar is two items — Venn frames + LiquidFun; LiquidFun loads `liquidfun-gallery.html`; hashes `#liquidfun-world` / `#glyph-break` / `#speck-word` (and numeric aliases) still open the matching slide inside the gallery iframe.
- **Venn gallery** (`post2-gallery.html`): `viewport-fit=cover`; **50%**-wide `.frame-stage`, `align-self: center`; safe-area padding on the stage; **`.gallery-content`** flex row `[prev] [main] [next]` so chevrons sit beside the canvas column (not pinned to the outer column edges); transparent arrow buttons, LiquidFun-matched stroke color / hover; `main` canvas `object-fit: contain` + fill; bottom counter only (no Prev/Next labels); ←/→ keys.
- **LiquidFun gallery** arrows: transparent circles, same gray / hover treatment as Venn gallery.
- **post1** (`post1.html`): `viewport-fit`, full-viewport flex `main` + safe-area padding; canvas `object-fit: contain` so fixed 600×750 fits mobile; not using hub responsive canvas logic.
- **Venn sketch** (`motion asset/sketch.js`): `useHubCanvasSizing()` — `__SPEC_GALLERY__` / `__SPEC_STATIC_FINAL__`: 4:5 canvas from `main.getBoundingClientRect()` on all hub viewports, `layoutMarginScale`, ceil(DPR) (cap 4) on desktop hub / 1 on mobile hub; solid-ink + sediment + SpecInk layer density follows main canvas; sediment cache key includes `pd`; ResizeObserver on `main` (hub only). `post1.html`: always 600×750, `pixelDensity(1)`, `windowResized` does not resize canvas.
- **SpecInk** (`motion asset/inkBlob.js`): display `createGraphics` density tracks / exceeds main canvas so ink is not soft when composited.
- **LiquidFun world + phases** (`liquidfunDemo.js`, phase HTML): 4:5 canvases; `canvasFit4x5.js` + `windowResized` (re-init world / `resetScene` on phase-4); physics stay in logical units (no particle-radius retune); phase pages load shared fit helper; `.demo-main canvas`: `object-fit: contain`, fill (no `width/height: auto !important` iframe bug).
- **LiquidFun glyph pages** (`phase-4-break-one-glyph-no-collision.html`, `phase-4-speck-word.html`): after Break Glyph, control shows Reset first (disabled, toolbar typeface) until Reset.

## [0.1.0](https://github.com/nymx22/spec/compare/42f6639e31cd4153e714607bcd1a11e4a6cf90ec...main) — 2026-03-27

### Added

- Mobile preview shell at repo root (`mobile-view-index.html`): framed iframe to `index.html`, presets 375×667 / 320×568, rotate and reload controls.
- Documentation for the post1.2 testing hub (`motion asset/MOTION_POST_1_2.md`).
- Glyph and particle color control (`<input type="color">`) on liquidfun phase **4 — speck word** (`motion asset/liquidfun-phases/phase-4-speck-word.html`).

### Changed

- **post1.2** hub (`motion asset/post1-2.html`): on narrow viewports, sidebar becomes a slide-out drawer with a menu control; preview iframe uses remaining viewport height (`100dvh` / flex).
- **Testing iframes** (`post2-gallery.html`, `phase-3-speckliquid-world-only.html`, phase-4 glyph pages): `demo-root` layout so controls, optional description, and p5 canvas share the viewport; canvas scales down with `max-width` / `max-height` inside the flex area.
- **Spec landing** (`index.html`) and **media_motion_01** (`media_motion_01/index.html`): smaller typography and spacing on small screens; project and asset link arrows use SVG instead of Unicode ↗ (avoids emoji-style rendering on iOS).
