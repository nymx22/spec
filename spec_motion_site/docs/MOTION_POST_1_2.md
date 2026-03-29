# Motion post 1.2 — overview

**post1.2** is the testing track for **media_motion_01**: one shell page with four previews, mixing the existing **p5.js + Matter.js** Venn work with **LiquidFun** (Box2D particles) experiments. It is linked from [`overview.html`](../projects/media_motion_01/html/overview.html) under **motion assets → testing**.

## Entry point

| What | Path |
|------|------|
| Hub (sidebar + iframe) | [`projects/media_motion_01/html/post1-2.html`](../projects/media_motion_01/html/post1-2.html) (or [`post1-2.html`](../post1-2.html) at **`spec_motion_site/`** root — redirects) |
| Aliases / redirects | [`post2.html`](../projects/media_motion_01/html/post2.html), [`testing.html`](../projects/media_motion_01/html/testing.html) → `post1-2.html` |

The hub loads previews in an **iframe**; the sidebar switches `iframe.src` between the four targets below.

## The four previews (1 · 2 · 3 · 4)

### 1 — p5.js + Matter.js (live)

- **File:** [`post2-gallery.html`](../projects/media_motion_01/html/post2-gallery.html)
- **Stack:** p5.js, Matter.js, [`inkBlob.js`](../projects/media_motion_01/js/inkBlob.js)
- **Role:** Venn diagram–style **frames** — speck, ink blob behavior, and transitions. This is the production-adjacent line continued from **post1**; post1.2 treats it as the stable baseline while items 2–4 explore fluid particles.

### 2 — LiquidFun world only (dev)

- **File:** [`phase-3-speckliquid-world-only.html`](../projects/media_motion_01/html/liquidfun-phases/phase-3-speckliquid-world-only.html)
- **Stack:** p5.js, [`lib/liquidfun.js`](../projects/media_motion_01/js/lib/liquidfun.js), [`speckLiquidFun.js`](../projects/media_motion_01/js/speckLiquidFun.js), [`liquidfunDemo.js`](../projects/media_motion_01/js/liquidfunDemo.js)
- **Role:** **No Matter.js, no sketch.js** — a circular “bucket” and viscous water blob using `SpecSpeckLiquid.initDemoWorld` (see comments in `speckLiquidFun.js`). Sanity check that LiquidFun loads, steps, and draws in isolation.

### 3 — Break one glyph (wip)

- **File:** [`phase-4-break-one-glyph-no-collision.html`](../projects/media_motion_01/html/liquidfun-phases/phase-4-break-one-glyph-no-collision.html)
- **Stack:** p5.js, `liquidfun.js`, inline phase-4 logic
- **Role:** A **single letter** (A–Z) rendered with **genwanlatin** (`@font-face` in the page), fit inside the circle, built from many small **particle groups** (circle patches). **Break** releases particles with staggered timing; the glyph mask is trimmed with **`DestroyParticlesInShape`** (small kills) so groups stay cohesive. Silhouette overlay tracks **released-only** center-of-mass motion; white break overlay fades without a heavy black outline pass.

### 4 — “Speck” word in circle (wip)

- **File:** [`phase-4-speck-word.html`](../projects/media_motion_01/html/liquidfun-phases/phase-4-speck-word.html)
- **Stack:** Same pipeline as item 3, with a **wider text raster**, higher patch cap, and a **word** field (default `speck`, letters only).
- **Extras:** **Color** control (`<input type="color">`) drives glyph tint, particle fill, and `b2ParticleColor` on spawn.

## Related files (not in the sidebar)

| Path | Note |
|------|------|
| [`phase-1-liquidfun-smoke.html`](../projects/media_motion_01/html/liquidfun-phases/phase-1-liquidfun-smoke.html) | Minimal load test for `liquidfun.js` / `b2World`; useful for debugging load or `window.liquidfun` availability. |
| [`speckLiquidFun.js`](../projects/media_motion_01/js/speckLiquidFun.js) | Shared LiquidFun helpers / demo world API used by phase 3+. |
| [`liquidfunDemo.js`](../projects/media_motion_01/js/liquidfunDemo.js) | p5 sketch glue for the world-only demo (post1.2 · 2). |

## How this relates to post1

- **[`post1.html`](../projects/media_motion_01/html/post1.html)** — earlier single-track Venn / p5 composition (**production** on the media index).
- **post1.2** — **testing** hub: keeps the Matter gallery as **1**, and adds **2–4** as a staged path toward glyph-shaped LiquidFun fluid, without folding all of that into the main sketch yet.

## Status labels (in the hub)

Sidebar badges are informational only: **live** (1), **dev** (2), **wip** (3–4). They match the copy on [`overview.html`](../projects/media_motion_01/html/overview.html) (e.g. “1 p5.js matter.js, 2 liquidfun world only, 3 break one glyph, 4 speck word”).

## Site preview (dev tool)

- **[`mobile-view-index.html`](../mobile-view-index.html)** — wraps the site home (**`index.html`**) in a fixed phone-sized frame (presets, rotate, reload). Serve over **`http://localhost`**. This is a convenience for manual checks, not an automated **testing** suite.

---

*Last aligned with repo layout: `spec_motion_site/projects/media_motion_01/html` hub + LiquidFun gallery iframes.*
