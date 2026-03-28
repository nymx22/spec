// Ink fill for the "speck-only" (exclusive) region using a pixel-perfect mask.
// Exposes a single global: window.SpecInk
//
// Core idea (Option A):
// - Build a binary mask (allowed pixels) for the speck-exclusive region at fixed resolution.
// - Stamp glyphs ("s/p/e/c/k") into a paint layer.
// - Track remaining unpainted mask pixels by reading actual paint alpha.
//
// Usage from sketch.js:
//   SpecInk.reset();
//   SpecInk.ensureLayer(p5, width, height);
//   SpecInk.init(p5, targets, rFinal);
//   SpecInk.addBlobs(p5, targets, rFinal, n);
//   SpecInk.render(p5, targets, rFinal);
//   SpecInk.coverage() -> 0..1
//   SpecInk.isDone() -> bool

(function () {
  // Higher raster resolution so the fill stays crisp under camera zoom.
  // (Post2 zoom is ~2.35x; 1536 keeps the ink from looking low-res.)
  const MASK_RES = 1536; // pixel-perfect mask resolution

  const state = {
    w: 0,
    h: 0,
    g: null,      // display layer (w x h)
    inkDisplayPd: 0,
    maskG: null,  // mask raster (MASK_RES x MASK_RES)
    paintG: null, // paint raster (MASK_RES x MASK_RES)
    mask: null,   // Uint8Array (0/1), length = MASK_RES^2
    filled: null, // Uint8Array (0/1), length = MASK_RES^2
    remaining: 0,
    total: 0,
    done: false,
  };

  function reset() {
    state.mask = null;
    state.filled = null;
    state.remaining = 0;
    state.total = 0;
    state.done = false;
    state.inkDisplayPd = 0;
    if (state.paintG) state.paintG.clear();
    if (state.maskG) state.maskG.clear();
  }

  function ensureLayer(p5, w, h) {
    state.w = w;
    state.h = h;
    const mainPd = p5.pixelDensity();
    const displayPd = Math.min(4, Math.max(mainPd, Math.round(mainPd * 1.5)));
    if (!state.g || state.g.width !== w || state.g.height !== h || state.inkDisplayPd !== displayPd) {
      state.g = p5.createGraphics(w, h);
      state.g.pixelDensity(displayPd);
      state.inkDisplayPd = displayPd;
    }
    if (!state.maskG) {
      state.maskG = p5.createGraphics(MASK_RES, MASK_RES);
      state.maskG.pixelDensity(1);
    }
    if (!state.paintG) {
      state.paintG = p5.createGraphics(MASK_RES, MASK_RES);
      state.paintG.pixelDensity(1);
    }

    // Ensure 2D contexts are smoothing text edges (fonts), not resampling artifacts.
    if (state.g?.drawingContext) state.g.drawingContext.imageSmoothingEnabled = true;
    if (state.maskG?.drawingContext) state.maskG.drawingContext.imageSmoothingEnabled = true;
    if (state.paintG?.drawingContext) state.paintG.drawingContext.imageSmoothingEnabled = true;
  }

  function init(p5, targets, rFinal) {
    if (!state.maskG || !state.paintG || !state.w || !state.h) return;

    state.done = false;

    const sx = MASK_RES / state.w;
    const sy = MASK_RES / state.h;

    // Build mask in maskG: speck circle minus bottom circles.
    const ctx = state.maskG.drawingContext;
    ctx.globalCompositeOperation = 'source-over';
    state.maskG.clear();
    state.maskG.blendMode(p5.BLEND);
    state.maskG.noStroke();
    state.maskG.push();
    state.maskG.scale(sx, sy);
    state.maskG.fill(255);
    state.maskG.ellipse(targets[0].x, targets[0].y, rFinal * 2, rFinal * 2);

    // Subtract bottom circles.
    ctx.globalCompositeOperation = 'destination-out';
    state.maskG.fill(255);
    state.maskG.ellipse(targets[1].x, targets[1].y, rFinal * 2, rFinal * 2);
    state.maskG.ellipse(targets[2].x, targets[2].y, rFinal * 2, rFinal * 2);
    state.maskG.pop();
    ctx.globalCompositeOperation = 'source-over';

    // Rasterize mask to Uint8Array
    state.maskG.loadPixels();
    const mp = state.maskG.pixels;
    const mask = new Uint8Array(MASK_RES * MASK_RES);
    let total = 0;
    for (let i = 0; i < mask.length; i++) {
      const a = mp[i * 4 + 3];
      const v = a > 0 ? 1 : 0;
      mask[i] = v;
      total += v;
    }
    state.mask = mask;
    state.filled = new Uint8Array(MASK_RES * MASK_RES);
    state.total = total;
    state.remaining = total;

    // Clear paint layer.
    state.paintG.clear();
  }

  function initSquare(p5, x, y, size) {
    if (!state.maskG || !state.paintG || !state.w || !state.h) return;

    state.done = false;

    const sx = MASK_RES / state.w;
    const sy = MASK_RES / state.h;

    const ctx = state.maskG.drawingContext;
    ctx.globalCompositeOperation = 'source-over';
    state.maskG.clear();
    state.maskG.blendMode(p5.BLEND);
    state.maskG.noStroke();
    state.maskG.push();
    state.maskG.scale(sx, sy);
    state.maskG.fill(255);
    state.maskG.rect(x, y, size, size);
    state.maskG.pop();
    ctx.globalCompositeOperation = 'source-over';

    // Rasterize mask
    state.maskG.loadPixels();
    const mp = state.maskG.pixels;
    const mask = new Uint8Array(MASK_RES * MASK_RES);
    let total = 0;
    for (let i = 0; i < mask.length; i++) {
      const a = mp[i * 4 + 3];
      const v = a > 0 ? 1 : 0;
      mask[i] = v;
      total += v;
    }
    state.mask = mask;
    state.filled = new Uint8Array(MASK_RES * MASK_RES);
    state.total = total;
    state.remaining = total;

    state.paintG.clear();
  }

  function pickUnfilledIndex(p5) {
    if (!state.mask || !state.filled) return -1;
    if (state.remaining <= 0) return -1;

    const len = state.mask.length;
    const cov = coverage();

    // When far from full, random hits are fast.
    if (cov < 0.9) {
      for (let k = 0; k < 250; k++) {
        const i = Math.floor(p5.random(len));
        if (state.mask[i] && !state.filled[i]) return i;
      }
    }

    // When close to full, scan from a random start until we find a gap.
    const start = Math.floor(p5.random(len));
    for (let k = 0; k < len; k++) {
      const i = (start + k) % len;
      if (state.mask[i] && !state.filled[i]) return i;
    }
    return -1;
  }

  function addOneBlob(p5, targets, rFinal) {
    if (!state.paintG || !state.mask || !state.filled) return;
    const idx = pickUnfilledIndex(p5);
    if (idx < 0) {
      state.done = true;
      return;
    }

    const sx = MASK_RES / state.w;
    const sy = MASK_RES / state.h;
    const px = idx % MASK_RES;
    const py = Math.floor(idx / MASK_RES);
    const x = px / sx;
    const y = py / sy;

    // Stamp glyph (acts like a "blob").
    const cov = coverage();
    // Smaller stamp sizes (denser texture)
    let fsMin = rFinal * 0.55;
    let fsMax = rFinal * 1.45;
    if (cov > 0.7) { fsMin = rFinal * 0.40; fsMax = rFinal * 1.15; }
    if (cov > 0.9) { fsMin = rFinal * 0.28; fsMax = rFinal * 0.90; }
    if (cov > 0.97) { fsMin = rFinal * 0.18; fsMax = rFinal * 0.65; }
    // Randomize stamp size (bias slightly toward smaller marks for texture).
    const fs = p5.lerp(fsMin, fsMax, Math.pow(p5.random(), 0.75));
    const letters = 'speck';
    const ch = letters[Math.floor(p5.random(letters.length))];
    const rot = p5.random(-Math.PI, Math.PI);

    const ctx = state.paintG.drawingContext;
    ctx.globalCompositeOperation = 'source-over';
    state.paintG.blendMode(p5.BLEND);
    state.paintG.noStroke();
    state.paintG.fill(0);
    state.paintG.textAlign(p5.CENTER, p5.CENTER);
    // Use the currently active font at the randomized size (prevents fallback rasterization).
    if (p5?._renderer?._textFont) state.paintG.textFont(p5._renderer._textFont);

    state.paintG.push();
    state.paintG.scale(sx, sy);
    state.paintG.translate(x, y);
    state.paintG.rotate(rot);
    state.paintG.textSize(fs);
    const jitter = Math.max(0.6, Math.min(3.0, fs * 0.02));
    for (let k = 0; k < 8; k++) {
      state.paintG.text(ch, p5.random(-jitter, jitter), p5.random(-jitter, jitter));
    }
    state.paintG.pop();

    // Update filled pixels in a bounding box around the stamp, using actual paint alpha.
    state.paintG.loadPixels();
    const pp = state.paintG.pixels;
    const radPx = Math.min(
      MASK_RES,
      Math.max(6, Math.ceil((fs * 1.2) * sx))
    );
    const x0 = Math.max(0, px - radPx);
    const x1 = Math.min(MASK_RES - 1, px + radPx);
    const y0 = Math.max(0, py - radPx);
    const y1 = Math.min(MASK_RES - 1, py + radPx);

    for (let yy = y0; yy <= y1; yy++) {
      const row = yy * MASK_RES;
      for (let xx = x0; xx <= x1; xx++) {
        const i = row + xx;
        if (!state.mask[i] || state.filled[i]) continue;
        const a = pp[i * 4 + 3];
        if (a > 0) {
          state.filled[i] = 1;
          state.remaining--;
        }
      }
    }

    if (state.remaining <= 0) state.done = true;
  }

  function addBlobs(p5, targets, rFinal, count) {
    for (let i = 0; i < count; i++) addOneBlob(p5, targets, rFinal);
  }

  function coverage() {
    if (!state.total) return 0;
    return 1 - state.remaining / state.total;
  }

  function isDone() {
    return !!state.done || coverage() >= 0.9999;
  }

  function render(p5, targets, rFinal) {
    if (!state.g || !state.paintG) return;

    const ctx = state.g.drawingContext;
    ctx.globalCompositeOperation = 'source-over';
    state.g.blendMode(p5.BLEND);
    state.g.clear();

    // Draw paintG upscaled to world-space.
    state.g.image(state.paintG, 0, 0, state.w, state.h);

    // Enforce the exact region in world-space too (prevents any stamp spill).
    ctx.globalCompositeOperation = 'destination-in';
    // Use the same raster mask that we use for pixel-perfect completion.
    state.g.image(state.maskG, 0, 0, state.w, state.h);

    ctx.globalCompositeOperation = 'source-over';
  }

  function layer() {
    return state.g;
  }

  window.SpecInk = {
    reset,
    ensureLayer,
    init,
    initSquare,
    addBlobs,
    render,
    layer,
    coverage,
    isDone,
  };
})();

