# Changelog

## [Unreleased]

## [0.1.0](https://github.com/nymx22/spec/compare/42f6639e31cd4153e714607bcd1a11e4a6cf90ec...main) — 2026-03-27

### Added

- Mobile preview shell at repo root (`mobile-view-index.html`): framed iframe to `index.html`, presets 375×667 / 320×568, rotate and reload controls.
- Documentation for the post1.2 testing hub (`motion asset/MOTION_POST_1_2.md`).
- Glyph and particle color control (`<input type="color">`) on liquidfun phase **4 — speck word** (`motion asset/liquidfun-phases/phase-4-speck-word.html`).

### Changed

- **post1.2** hub (`motion asset/post1-2.html`): on narrow viewports, sidebar becomes a slide-out drawer with a menu control; preview iframe uses remaining viewport height (`100dvh` / flex).
- **Testing iframes** (`post2-gallery.html`, `phase-3-speckliquid-world-only.html`, phase-4 glyph pages): `demo-root` layout so controls, optional description, and p5 canvas share the viewport; canvas scales down with `max-width` / `max-height` inside the flex area.
- **Spec landing** (`index.html`) and **media_motion_01** (`media_motion_01/index.html`): smaller typography and spacing on small screens; project and asset link arrows use SVG instead of Unicode ↗ (avoids emoji-style rendering on iOS).
