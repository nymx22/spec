# Changelog

## [Unreleased]

### Added

- **`spec_motion_site/`**: spec + motion **site** — **`index.html`** (home / project list), **`fonts/`** (shared type for sketches), **`docs/`** (e.g. `MOTION_POST_1_2.md`), **`mobile-view-index.html`** (optional dev frame around the home page — not a QA test suite), **`post1-2.html`** redirect shim, **`projects/media_motion_01/`** (that project’s **`html/`**, **`js/`**, **`video/`**). **`cargo_project/`** at repo root stays separate (Cargo snippets + GlitchGenerator).

### Changed

- **Mobile preview** (`spec_motion_site/mobile-view-index.html`): lives next to **`index.html`** (no longer under **`tests/`**); iframe **`src`** is **`index.html`**. Empty **`spec_motion_site/tests/`** directory removed.
- **Repo root `index.html`**: redirects to **`spec_motion_site/index.html`** (was `media_motion_01/index.html`).
- **`spec_motion_site/post1-2.html`**: redirect target is **`projects/media_motion_01/html/post1-2.html`** (preserves `hash` / `search`).
- **Venn sketch fonts**: `loadFont` resolves **`spec_motion_site/fonts/`** via URL relative to **`sketch.js` / `speckSketch.js`** (`../../../fonts/…`).
- **Project overview** breadcrumb “spec” → **`../../../index.html`** (site home).
- **post1.2 hub** (`spec_motion_site/projects/media_motion_01/html/post1-2.html`): **`matchMedia`** **`addListener`** fallback when **`addEventListener`** is missing (older iOS Safari), so **`syncFromHash`** always runs.

## [0.2.0](https://github.com/nymx22/spec/compare/v0.1.0...main) — 2026-03-28

### Added

- **post1.2 hub** (`spec_motion_site/projects/media_motion_01/html/post1-2.html`): URL hashes for each preview (`#gallery`, `#liquidfun-world`, `#glyph-break`, `#speck-word`) plus aliases (`#1`–`#4`, `#matter`, `#world`, `#glyph`, `#speck`, …); back/forward updates the iframe.
- **LiquidFun gallery** (`spec_motion_site/projects/media_motion_01/html/liquidfun-phases/liquidfun-gallery.html`): one page cycling the three LiquidFun phase HTMLs; chevron prev/next (keyboard ←/→); hash per slide for sharing (`#liquidfun-world`, `#glyph-break`, `#speck-word`).
- **`canvasFit4x5.js`** (`spec_motion_site/projects/media_motion_01/js/canvasFit4x5.js`): shared 4:5 fit to `main`, mobile ref 480×600, desktop cap, **ceil(devicePixelRatio)** on desktop (cap 4), **`installMainResizeDispatch`** (ResizeObserver → synthetic `resize` for iframe flex).
- **`spec_motion_site/projects/media_motion_01/video/specvenn.mp4`**: H.264 **MP4** alongside **`specvenn.mov`** for **post1** slide-2 **`<video>`** (broad browser support; `.mov` remains fallback).

### Changed

- **Repo layout (prior nesting)**: Cargo in **`cargo_project/`**; motion work under **`media_motion_01/`** with landing **`index.html`**, **`html/`**, **`js/`**, **`fonts/`**, **`docs/`**, **`video/`** — superseded by **`spec_motion_site/`** in **[Unreleased]**.
- **post1.2 hub navigation**: sidebar is two items — Venn frames + LiquidFun; LiquidFun loads `liquidfun-gallery.html`; hashes `#liquidfun-world` / `#glyph-break` / `#speck-word` (and numeric aliases) still open the matching slide inside the gallery iframe.
- **Venn gallery** (`spec_motion_site/projects/media_motion_01/html/post2-gallery.html`): `viewport-fit=cover`; **50%**-wide `.frame-stage`, `align-self: center`; safe-area padding on the stage; **`.gallery-content`** flex row `[prev] [main] [next]` so chevrons sit beside the canvas column (not pinned to the outer column edges); transparent arrow buttons, LiquidFun-matched stroke color / hover; `main` canvas `object-fit: contain` + fill; bottom counter only (no Prev/Next labels); ←/→ keys.
- **LiquidFun gallery** arrows: transparent circles, same gray / hover treatment as Venn gallery.
- **post1** (`spec_motion_site/projects/media_motion_01/html/post1.html`): same **gallery chrome** as **`post2-gallery.html`** (50% centered stage, side chevrons, counter **1 / 2**, ←/→): **slide 1** = live p5 sequence; **slide 2** = **`specvenn.mp4`** with **`.mov` fallback**, letterboxed with **`object-fit: contain`**. Inactive slides use **visibility/opacity** (not **`display:none`**) so the video can load; **`playsInline`**, **`preload="auto"`**, **`video.load()`** nudge when opening slide 2 if needed. **`__SPEC_POST1_GALLERY__`** enables hub 4:5 + DPR + `ResizeObserver` without the five-frame Matter gallery.
- **Venn sketch** (`spec_motion_site/projects/media_motion_01/js/sketch.js`): `useHubCanvasSizing()` also when **`__SPEC_POST1_GALLERY__`**; hides **Export MP4** in that shell. Otherwise unchanged for **`__SPEC_GALLERY__`** / **`__SPEC_STATIC_FINAL__`** (hub sizing, ink/sediment `pd`, etc.).
- **SpecInk** (`spec_motion_site/projects/media_motion_01/js/inkBlob.js`): display `createGraphics` density tracks / exceeds main canvas so ink is not soft when composited.
- **LiquidFun world + phases** (`spec_motion_site/projects/media_motion_01/js/liquidfunDemo.js`, phase HTML under `html/liquidfun-phases/`): 4:5 canvases; `canvasFit4x5.js` + `windowResized` (re-init world / `resetScene` on phase-4); physics stay in logical units (no particle-radius retune); phase pages load shared fit helper; `.demo-main canvas`: `object-fit: contain`, fill (no `width/height: auto !important` iframe bug).
- **LiquidFun glyph pages** (`spec_motion_site/projects/media_motion_01/html/liquidfun-phases/phase-4-break-one-glyph-no-collision.html`, `phase-4-speck-word.html`): after Break Glyph, control shows Reset first (disabled, toolbar typeface) until Reset.
- **Project overview** (`spec_motion_site/projects/media_motion_01/html/overview.html`): **post1** card copy updated for sketch + video gallery.

## [0.1.0](https://github.com/nymx22/spec/compare/42f6639e31cd4153e714607bcd1a11e4a6cf90ec...main) — 2026-03-27

### Added

- Mobile preview shell (`spec_motion_site/mobile-view-index.html`; historically under `media_motion_01/html/`): framed iframe to **`index.html`**, presets 375×667 / 320×568, rotate and reload controls.
- Documentation for the post1.2 testing hub (`spec_motion_site/docs/MOTION_POST_1_2.md`).
- Glyph and particle color control (`<input type="color">`) on liquidfun phase **4 — speck word** (`spec_motion_site/projects/media_motion_01/html/liquidfun-phases/phase-4-speck-word.html`).

### Changed

- **post1.2** hub (`spec_motion_site/projects/media_motion_01/html/post1-2.html`): on narrow viewports, sidebar becomes a slide-out drawer with a menu control; preview iframe uses remaining viewport height (`100dvh` / flex).
- **Testing iframes** (`spec_motion_site/projects/media_motion_01/html/post2-gallery.html`, `liquidfun-phases/phase-3-speckliquid-world-only.html`, phase-4 glyph pages): `demo-root` layout so controls, optional description, and p5 canvas share the viewport; canvas scales down with `max-width` / `max-height` inside the flex area.
- **Spec landing** (`spec_motion_site/index.html`) and **project overview** (`spec_motion_site/projects/media_motion_01/html/overview.html`): smaller typography and spacing on small screens; project and asset link arrows use SVG instead of Unicode ↗ (avoids emoji-style rendering on iOS).
