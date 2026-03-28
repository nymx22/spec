# Changelog

## [Unreleased]

## [0.2.0](https://github.com/nymx22/spec/compare/v0.1.0...main) — 2026-03-28

### Added

- **post1.2 hub** (`media_motion_01/html/post1-2.html`): URL hashes for each preview (`#gallery`, `#liquidfun-world`, `#glyph-break`, `#speck-word`) plus aliases (`#1`–`#4`, `#matter`, `#world`, `#glyph`, `#speck`, …); back/forward updates the iframe.
- **LiquidFun gallery** (`media_motion_01/html/liquidfun-phases/liquidfun-gallery.html`): one page cycling the three LiquidFun phase HTMLs; chevron prev/next (keyboard ←/→); hash per slide for sharing (`#liquidfun-world`, `#glyph-break`, `#speck-word`).
- **`canvasFit4x5.js`** (`media_motion_01/js/canvasFit4x5.js`): shared 4:5 fit to `main`, mobile ref 480×600, desktop cap, **ceil(devicePixelRatio)** on desktop (cap 4), **`installMainResizeDispatch`** (ResizeObserver → synthetic `resize` for iframe flex).
- **`media_motion_01/video/specvenn.mp4`**: H.264 **MP4** alongside **`specvenn.mov`** for **post1** slide-2 **`<video>`** (broad browser support; `.mov` remains fallback).

### Changed

- **Repo layout**: Cargo site snippets in **`cargo_project/`** (renamed from `cargo_copy/`), including **`GlitchGenerator/`**. Spec motion under **`media_motion_01/`**: spec landing is **`index.html`**; other work lives only in subfolders — **`html/`**, **`js/`**, **`fonts/`**, **`docs/`**, **`video/`**. Root **`index.html`** redirects to **`media_motion_01/index.html`**.
- **post1.2 hub navigation**: sidebar is two items — Venn frames + LiquidFun; LiquidFun loads `liquidfun-gallery.html`; hashes `#liquidfun-world` / `#glyph-break` / `#speck-word` (and numeric aliases) still open the matching slide inside the gallery iframe.
- **Venn gallery** (`media_motion_01/html/post2-gallery.html`): `viewport-fit=cover`; **50%**-wide `.frame-stage`, `align-self: center`; safe-area padding on the stage; **`.gallery-content`** flex row `[prev] [main] [next]` so chevrons sit beside the canvas column (not pinned to the outer column edges); transparent arrow buttons, LiquidFun-matched stroke color / hover; `main` canvas `object-fit: contain` + fill; bottom counter only (no Prev/Next labels); ←/→ keys.
- **LiquidFun gallery** arrows: transparent circles, same gray / hover treatment as Venn gallery.
- **post1** (`media_motion_01/html/post1.html`): same **gallery chrome** as **`post2-gallery.html`** (50% centered stage, side chevrons, counter **1 / 2**, ←/→): **slide 1** = live p5 sequence; **slide 2** = **`specvenn.mp4`** with **`.mov` fallback**, letterboxed with **`object-fit: contain`**. Inactive slides use **visibility/opacity** (not **`display:none`**) so the video can load; **`playsInline`**, **`preload="auto"`**, **`video.load()`** nudge when opening slide 2 if needed. **`__SPEC_POST1_GALLERY__`** enables hub 4:5 + DPR + `ResizeObserver` without the five-frame Matter gallery.
- **Venn sketch** (`media_motion_01/js/sketch.js`): `useHubCanvasSizing()` also when **`__SPEC_POST1_GALLERY__`**; hides **Export MP4** in that shell. Otherwise unchanged for **`__SPEC_GALLERY__`** / **`__SPEC_STATIC_FINAL__`** (hub sizing, ink/sediment `pd`, etc.).
- **SpecInk** (`media_motion_01/js/inkBlob.js`): display `createGraphics` density tracks / exceeds main canvas so ink is not soft when composited.
- **LiquidFun world + phases** (`media_motion_01/js/liquidfunDemo.js`, phase HTML under `html/liquidfun-phases/`): 4:5 canvases; `canvasFit4x5.js` + `windowResized` (re-init world / `resetScene` on phase-4); physics stay in logical units (no particle-radius retune); phase pages load shared fit helper; `.demo-main canvas`: `object-fit: contain`, fill (no `width/height: auto !important` iframe bug).
- **LiquidFun glyph pages** (`media_motion_01/html/liquidfun-phases/phase-4-break-one-glyph-no-collision.html`, `phase-4-speck-word.html`): after Break Glyph, control shows Reset first (disabled, toolbar typeface) until Reset.
- **Project overview** (`media_motion_01/html/overview.html`): **post1** card copy updated for sketch + video gallery.

## [0.1.0](https://github.com/nymx22/spec/compare/42f6639e31cd4153e714607bcd1a11e4a6cf90ec...main) — 2026-03-27

### Added

- Mobile preview shell (`media_motion_01/html/mobile-view-index.html`): framed iframe to the spec landing, presets 375×667 / 320×568, rotate and reload controls.
- Documentation for the post1.2 testing hub (`media_motion_01/docs/MOTION_POST_1_2.md`).
- Glyph and particle color control (`<input type="color">`) on liquidfun phase **4 — speck word** (`media_motion_01/html/liquidfun-phases/phase-4-speck-word.html`).

### Changed

- **post1.2** hub (`media_motion_01/html/post1-2.html`): on narrow viewports, sidebar becomes a slide-out drawer with a menu control; preview iframe uses remaining viewport height (`100dvh` / flex).
- **Testing iframes** (`media_motion_01/html/post2-gallery.html`, `liquidfun-phases/phase-3-speckliquid-world-only.html`, phase-4 glyph pages): `demo-root` layout so controls, optional description, and p5 canvas share the viewport; canvas scales down with `max-width` / `max-height` inside the flex area.
- **Spec landing** (`media_motion_01/index.html`) and **project overview** (`media_motion_01/html/overview.html`): smaller typography and spacing on small screens; project and asset link arrows use SVG instead of Unicode ↗ (avoids emoji-style rendering on iOS).
