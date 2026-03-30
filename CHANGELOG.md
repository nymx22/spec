# Changelog

## [Unreleased]

### Added

- **Shared iframe gallery shell** (`spec_motion_site/projects/media_motion_01/css/galleryShell.css`, `js/galleryShell.js`): prev/next arrows, keyboard, title + `n / total`, hash per slide (`initSpecGallery`). **LiquidFun gallery** (`liquidfun-phases/liquidfun-gallery.html`) uses it instead of inline CSS/JS.
- **post1.2 hub gallery shells** (`post1-2-gallery-2.html`, `post1-2-gallery-4.html`): added focused shells for **item 2** (Venn frames 4/5) and **item 4** (`'speck' dev process`, copied from prior gallery-3 single slide).
- **`spec_motion_site/`**: spec + motion **site** — **`index.html`** (home / project list), **`fonts/`** (shared type for sketches), **`docs/`** (e.g. `MOTION_POST_1_2.md`), **`mobile-view-index.html`** (optional dev frame around the home page — not a QA test suite), **`post1-2.html`** redirect shim, **`projects/media_motion_01/`** (that project’s **`html/`**, **`js/`**, **`video/`**). **`cargo_project/`** at repo root stays separate (Cargo snippets + GlitchGenerator).
- **post1.2 hub page 3** (`venn-liquidfun-composite.html`, `vennLiquidFunComposite.js`): three-circle Venn layout with **step-2** `initDemoWorld` fluid **clipped** to the speck (top) circle; **`speckLiquidFun.js`** **`initDemoWorld`** accepts optional **`bucketCx`**, **`bucketCy`**, **`bucketRadius`** for placement.
- **post1.2 hub item 0** (`motion-post-1-2-doc.html`): sidebar entry **`MOTION_POST_1_2.md`** embeds the doc with **edit + rendered preview**; **Download** / **Save to file…** (File System Access where supported). Default hub tab remains **1** (Matter gallery).
- **post1.2 gallery item 1 — speck ∩ spectrum** (`post2-gallery.html`, `js/sketch.js`): third compact slide (`#venn-overlap`) eases zoom from frame‑3 `zoom2` up to a **stronger lobe-fit** zoom (higher fill fraction / cap so the four lines read larger), centers the view on that lobe’s centroid (camera tracks its **rotated** position during the **60° left** spin about the graph centroid), places labels at the sampled centroid, shrinks type until a screen-space **axis-aligned** block fits inside the lobe, and draws lines **centered** in that shape; phrase **layout uses the end-state camera/zoom** (no per-frame resize drift) with a **smootherstep** fade starting ~64% through the motion. **Fourth compact slide** (`#venn-media-pair`, sketch frame **5**): **inspect ∩ spectrum** lobe (excluding speck), **−120° further** from slide 3 (e.g. −60° → **−180°**); without slide 3 handoff, animates **0 → −120°** from upright; two lines (**cultural, media studies**, **print, digital media**); rotation and camera **continue from slide 3** via **`__SPEC_FRAME4_END__`**; phrases use **`resetMatrix()`**. **Slide 1 grid** adds a fifth cell still: `?lock=1&mediaPairStill=1#venn-media-pair`. Cache cleared on compact **motion** (slide 2) and **stills** (slide 1).

- **post1.2 gallery item 1 — compact frame 6** (`post2-gallery.html`, `js/sketch.js`): fifth UI slide (`#venn-space-phrases`, sketch **6**) — **speck ∩ inspect \ spectrum**, **−120°** from frame 5 via **`__SPEC_FRAME5_END__`**; five lines (territorial regional studies, ethnography, geography, landscape, study of space); **`spacePhrasesStill=1`** for slide 1 grid sixth cell; **`__SPEC_GALLERY_MAX_FRAME = 6`**; frame 5 now writes **`__SPEC_FRAME5_END__`** each frame (when not `mediaPairStill`); **`__SPEC_FRAME5_END__`** cleared with frame 4 cache on motion/stills. **`__SPEC_GALLERY_EXTENDED__`** is true only for `?max=5` (item 2 ink/sediment); compact and extended both use **`__SPEC_GALLERY_MAX_FRAME = 5`** so sketch frame 5 is either media pair or sediment. Grid still for frame 4 drops `max=4` on the overlap iframe (rely on `overlapStill=1` + lock).

### Fixed

- **post1.2 gallery item 2** (`post2-gallery.html`): when the outer shell (`post1-2-gallery-2.html` / hub) switches slides by changing only `#venn-frame-4` → `#venn-frame-5` on the same locked iframe URL, the inner gallery now applies **`hashchange`** (it was skipped under `lock=1`), so slide 2 shows **Venn frame 5** instead of repeating frame 4.
- **post1.2 doc editor** (`motion-post-1-2-doc.html`): the linked `.md` file handle is **persisted in IndexedDB** and restored when the hub iframe reloads (e.g. switching post1.2 sidebar items), so **Cmd+S** / **Ctrl+S** writes to the same file without opening **Save As** again after the first pick; write permission is re-requested when the browser requires it (`prompt` state).
- **post1.2 gallery item 1 compact mode** (`post2-gallery.html`, `js/sketch.js`): removed remaining outer inset on the still-grid slide so the grid fills the content container; entering `venn-motion` now force-restarts the zoom animation reliably.
- **post1.2 gallery item 1 compact mode** (`post2-gallery.html`): entering slide 2 now explicitly calls `loop()` when switching from still-grid to `venn-motion`, so motion starts even after prior `noLoop()` states.
- **post1.2 still-grid frame restore** (`post2-gallery.html`, `js/sketch.js`): restored the old zoomed-speck still (frame 3) and placed it into the grid as the third filled cell; in `max=5` mode frame 3 is static zoom again, while compact mode keeps slide 2 as motion.
- **post1.2 compact motion playback** (`post2-gallery.html`): fixed compact-mode frame mapping so slide 2 can drive internal sketch frame 3 (`1 -> 2 -> 3` motion) instead of being clamped by the UI slide count.
- **post1.2 gallery item 2** (`post1-2-gallery-2.html`, `post2-gallery.html`): Venn-only shell now embeds `post2-gallery.html?lock=1#venn-frame-4/#venn-frame-5` so inner controls are hidden/locked and it no longer exposes all five Venn frames inside item 2.
- **LiquidFun gallery view 1** (`liquidfun-phases/phase-3-speckliquid-world-only.html`): restored the page content after it became empty, so item 2’s first slide (`#liquidfun-world`) renders again.
- **LiquidFun gallery** (`liquidfun-phases/liquidfun-gallery.html`): shared shell **`href`s** use **`../../css/`** and **`../../js/`** (one level deeper than `post1-2-gallery-3.html`); **`../css/`** pointed at a non-existent `html/css/` path, so layout and **`initSpecGallery`** did not load in the hub iframe.
- **post1.2 item 3 / `#post12-3`** (`liquidfun-phases/phase-4-speck-word.html`): hide the inner page-level arrows + `2 / 2` badge so only the outer gallery shell controls/counter are visible.
- **post1.2 hash cleanup** (`post1-2.html`): removed leftover `#venn-fluid-composite` handling from the old single-view slot and reassigned deep links for the new 2/3/4 mapping (`#venn-frame-4/#venn-frame-5`, `#liquidfun-world/#glyph-break/#speck-word`, `#speck-dev-process`).

### Changed

- **post1.2 gallery item 1 still grid** (`post2-gallery.html`): still previews **load only when slide 1 is active** (not on other slides); six embeds use **`data-src` + `about:blank`** and **staggered** `src` assignment (~55ms apart) so the main gallery stays responsive and avoids six simultaneous p5+Matter+sketch parses; **`loading="lazy"`** on each iframe.
- **post1.2 sidebar** (`post1-2.html`): removed per-item status pills (`live` / `dev`) to simplify navigation labels while the project states are still in flux.
- **post1.2 hub mapping** (`post1-2.html`): item **2** now points to `'speck' design ideas` (Venn slide 4/5), item **3** to `'speck' testings` (three LiquidFun slides moved from prior item 2), and item **4** to `'speck' dev process`; removed the duplicated item-3 copy that mirrored item 1.
- **post1.2 gallery item 1 arrows** (`post2-gallery.html`): arrow placement now matches the shared shell pattern (overlayed left/right within the stage instead of side-column row arrows).
- **post1.2 gallery item 1 arrows** (`post2-gallery.html`): stage padding moved from `.frame-stage` to `.demo-main` so arrow positions stay fixed to the gallery shell and are independent of canvas/content bounds.
- **post1.2 gallery item 1 arrows** (`post2-gallery.html`): stage now spans full preview width while the canvas remains a centered column; arrows anchor to full stage edges (same shell behavior as other galleries), not the white canvas panel.
- **post1.2 gallery item 1** (`post2-gallery.html`, `js/sketch.js`): default gallery mode is three slides — still grid, zoom motion, then speck ∩ spectrum overlap (no Matter/ink/sediment on those slides; those remain on extended frames 4–5).
- **post1.2 gallery item 2 deep links** (`post1-2-gallery-2.html`, `post1-2.html`): restored to `#venn-frame-4/#venn-frame-5` using locked `post2-gallery.html?max=5` embeds, so item 2 still shows the speck-specific motion states.
- **post1.2 gallery item 1 layout** (`post2-gallery.html`): compact mode now combines still states into a single first slide as a 2x3 grid shell (`venn-stills`) and keeps zoom-motion as slide 2 (`venn-motion`); gallery 2 remains on extended `max=5` mode.
- **post1.2 gallery item 1 still-grid** (`post2-gallery.html`): cells 1–3 embed locked extended stills (`#venn-frame-1` … `#venn-frame-3`); cells 4–6 compact stills for frames 4–6 (`overlapStill`, `mediaPairStill`, `spacePhrasesStill` + matching hashes); grid is full **3×2**.
- **post1.2 gallery item 1 still-grid** (`post2-gallery.html`): grid orientation is now 3x2 on desktop and 2x3 on mobile.
- **post1.2 gallery item 1 still-grid** (`post2-gallery.html`): removed forced square-cell aspect ratio so the 3x2 grid expands to fill the full content container height/width.
- **post1.2 gallery item 1** (`post2-gallery.html`): aligned toolbar typography/chrome to the shared gallery standard (Space Grotesk, muted toolbar treatment, title + index in footer).
- **post1.2 page 3** (`phase-4-speck-word.html#post12-3`): LiquidFun **speck-word** mode — **speck** sits at the same **exclusive-label** position as **Venn gallery frame 1** (both mini-gallery views); black glyph/particles; circle geometry aligned to frame 1; timed break/reset as configured; **view 2** adds **Box2D edge walls** along the lower two circles so particles collide with those boundaries (walls removed in view 1).
- **post1.2 Venn on mobile**: `post2-gallery.html` uses full-width stage below 768px (was 50% → cramped canvas). **`canvasFit4x5.js`** fits LiquidFun canvases to `main` on mobile instead of fixed 480×600 so hub iframe + header layout matches the sketch.
- **post1.2 hub hashes**: **`#3`** now opens **`#speck-break`** (aliases include **`composite`**, **`fluid`**, **`vennfluid`**, **`speckbreak`**); **glyph-break** slide is **`#4`**; **speck-word** slide is **`#5`** (LiquidFun deep links unchanged for item 2).
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
