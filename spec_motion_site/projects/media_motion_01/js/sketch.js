const DURATION_FADE = 1;       // circle fades in
const DURATION_LINGER = 4;     // circle + "spec" linger
const DURATION_ONE = DURATION_FADE + DURATION_LINGER;
const DURATION_ZOOM_IN = 1.5;  // camera zooms into circle
const DURATION_S_AND_WORDS = 6; // split 's' into three + add letters (speck, Inspect, spectrum) — inside one circle
const DURATION_ZOOM_OUT = 1.5; // zoom out (single circle, three words stacked)
const DURATION_HOLD = 0.8;     // hold at 1.0x before Venn split
const DURATION_VENN = 2.5;     // after zoom out: split into 3 Venn circles until full Venn diagram
const DURATION_END_HOLD = 4.0; // hold final Venn before looping
const TOTAL = DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS + DURATION_ZOOM_OUT + DURATION_HOLD + DURATION_VENN + DURATION_END_HOLD;

const CIRCLE_ZOOM_MAX = 2;
const WORD_ZOOM_MAX = 1.5;
const WORD_ZOOM_OUT_END = 0.5;

const WORDS = ['speck', 'inspect', 'spectrum'];

/** Compact gallery frame 4: speck ∩ spectrum \ inspect. */
const SPECK_SPECTRUM_OVERLAP_PHRASES = [
  'personal narrative',
  'rituals and ceremonies',
  'history',
  'ephemera',
];
const SPECTRUM_STILL_PHRASES = [
  'minority representation, trends, aesthetics',
];
/** Sole duration (ms) for fading in those Still 05 white lines on compact frame 4 (live `45`); higher = slower / calmer ramp. */
const SPECTRUM_STILL_PHRASE_FADE_MS = 2000;
/** Target black dots per scanned character (rejection-sampled on white fill only); `d` = diameter (px). */
const SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOTS = 64;
const SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOT_D = 2.25;
/** Luminance threshold on mask buffer (0–255) to count as “white” glyph. */
const SPECTRUM_STILL_PHRASE_SCAN_GLITCH_WHITE_THRESH = 118;
const INSPECT_STILL_PHRASES = [
  'archive, research, fieldwork',
];

/** Compact gallery frame 5: inspect ∩ spectrum \ speck. */
const INSPECT_SPECTRUM_PAIR_PHRASES = [
  'cultural, media studies',
  'print, digital media',
];

/** Compact gallery frame 6: speck ∩ inspect \ spectrum. */
const SPECK_INSPECT_SPACE_PHRASES = [
  'territorial regional studies',
  'ethnography',
  'geography',
  'landscape',
  'study of space',
];

/** Item 2.5 slide 3 (`motionSegment=45` live): spectrum label reader + vertical scan in exclusive lobe. */
const SPECTRUM_READER_SWEEP_FRAC = 0.55;
/** Screen-space vertical sampling step (px) for spectrum-exclusive scan clipping. */
const SPECTRUM_READER_SCAN_SCREEN_STEP_PX = 2.8;
/** Fast scan bar stroke weight (× `ls`); half-width for glitch overlap with **`spectrumReaderScanBarsScreen`**. */
const SPECTRUM_READER_SCAN_STROKE_LS = 10.85;
/** Slower, thicker bar (× `ls`); drawn behind the fast bar. */
const SPECTRUM_READER_SCAN_STROKE_SLOW_LS = 17.6;
/** Slow bar sweep period = `cycleMs` × this (same ping-pong shape as the fast bar). */
const SPECTRUM_READER_SLOW_BAR_CYCLE_MUL = 2.45;
/** Match compact frame‑4 Venn ring **`strokeWeight(3 * ls)`** — used to extend reader clip to the **outer** spectrum edge (world units via zoom). */
const SPECTRUM_READER_CLIP_VENN_RING_STROKE_LS = 3;
/**
 * Live `45` reader: item **2.5** slide **3** vs hub **2.7** slides **4–5** (`liveMotions27`).
 * Use `spectrumReaderTuning()` for cycle length. Scan bars: fast **`SPECTRUM_READER_SCAN_STROKE_LS`**, slow thicker **`SPECTRUM_READER_SCAN_STROKE_SLOW_LS`** (**`SPECTRUM_READER_SLOW_BAR_CYCLE_MUL`** on `cycleMs`).
 */
const SPECTRUM_READER_TUNING = {
  default: { cycleMs: 5200 },
  live27: { cycleMs: 8400 },
};
const TOTAL_LETTERS = 5 + 7 + 8; // 20

const sGap = 50; // vertical spacing for three words inside single circle
const WORD_STACK_VISUAL_Y = -10; // nudge stack upward for better visual centering
const SPEC_VISUAL_Y = -6; // nudge "spec" upward for visual centering

const VENN_OFFSET = 55;
const VENN_R = 85;
const VENN_SIZE = VENN_R * 2;
const VENN_SCALE = 1.7; // circles grow larger during Venn split
const VENN_SIZE_SCALED = VENN_SIZE * VENN_SCALE;
const VENN_TEXT_SIZE = 24; // keep text size constant during Venn split

// Post 2 item 2 (design ideas): white text below speck after exclusive-region fill completes.
const POST2_DESCRIPTION = 'trivial, folklore, objects';
const POST2_SHOW_DESCRIPTION = true;
/** Grid cells filled per landing glyph on the sediment floor layer (item 2 extended frame 5; was 14). */
const POST2_SEDIMENT_CELLS_PER_PARTICLE = 70;
const POST2_SEDIMENT_SPAWN_PER_TICK = 2;
const POST2_SEDIMENT_SPAWN_EVERY_MS = 70;
/** Gallery 2.5 slide 1 only (`liveMotionsDesign` + red-coverage sediment): faster spawn + chunkier floor per glyph. */
const LIVE25_SEDIMENT_CELLS_PER_PARTICLE = 150;
const LIVE25_SEDIMENT_SPAWN_PER_TICK =5;
const LIVE25_SEDIMENT_SPAWN_EVERY_MS = 50;
/** Gallery 2.7 only: fill spawn cadence (vs **2.5** `LIVE25_*`). */
const LIVE27_SEDIMENT_SPAWN_PER_TICK = 3;
const LIVE27_SEDIMENT_SPAWN_EVERY_MS = 56;
/** Gallery 2.7: cells added per glyph landing (base before landing ramp / `LIVE27_FILL_CELLS_LANDING_MUL`). */
const LIVE27_SEDIMENT_CELLS_PER_PARTICLE = 175;
/** Gallery 2.5 slide 1: optional pause (frames) after fill before drain; **0** = drain uses same clock as fill immediately. */
const LIVE25_DRAIN_HOLD_FRAMES = 0;
/** Gallery 2.5 / 2.7 slide 1: POST2 eases in after zoom (`liveMotionsDesign`); longer = slower. */
const LIVE25_POST2_FADE_IN_MS = 900;
/** Gallery 2.7 slide 1: after sediment drain, POST2 fades out before the loop restarts (full white “quiet” beat). */
const LIVE25_POST2_FADE_OUT_MS = 900;
/** Gallery 2.7 slide 1: wall-clock span for fill ramp (`easeInExpo`) and drain ramp (`easeOutExpo`); same duration for both. */
const LIVE27_SEDIMENT_EASE_MS = 1350;
/** Gallery 2.7: max cells cleared per **frame** during eased drain (large values = chunky pops). */
const LIVE27_DRAIN_MAX_CELLS_PER_FRAME = 118;
/** Gallery 2.7: max cells added per **frame** from glyph landings (avoids multi-hit spikes). */
const LIVE27_FILL_MAX_CELLS_PER_FRAME = 132;
/** Gallery 2.7: multiplies spawn rate vs base `spawnEveryMs` at full ramp. */
const LIVE27_FILL_SPAWN_SPEED_MUL = 1.42;
/** Gallery 2.7: scales `cellsPerParticle` on landing at full ramp (easeInExpo). */
const LIVE27_FILL_CELLS_LANDING_MUL = 1.32;
/** Gallery 2.7 drain: black glyphs falling out — interval divisor (higher = denser / faster). */
const LIVE27_DRAIN_GLYPH_SPAWN_MUL = 1.38;
/** Gallery 2.7 drain: glyphs spawned per spawn pulse (independent of fill `spawnPerTick`). */
const LIVE27_DRAIN_GLYPHS_PER_TICK = 2;
/** Gallery 2.7 drain: initial downward speed for black “fall-out” glyphs (pixels/frame-ish; then `gravity`). */
const LIVE27_DRAIN_GLYPH_VY_MIN = 0.45;
const LIVE27_DRAIN_GLYPH_VY_MAX = 2.05;
/** Multiplier on `s.gravity` while integrating drain glyphs ( >1 = faster acceleration downward). */
const LIVE27_DRAIN_GLYPH_GRAVITY_MUL = 1.22;
function patchPost2SedimentRuntimeTuning(s) {
  if (!s) return;
  if (s.redCoverageSediment) {
    if (specLiveMotions27()) {
      s.cellsPerParticle = LIVE27_SEDIMENT_CELLS_PER_PARTICLE;
      s.spawnPerTick = LIVE27_SEDIMENT_SPAWN_PER_TICK;
      s.spawnEveryMs = LIVE27_SEDIMENT_SPAWN_EVERY_MS;
    } else {
      s.cellsPerParticle = LIVE25_SEDIMENT_CELLS_PER_PARTICLE;
      s.spawnPerTick = LIVE25_SEDIMENT_SPAWN_PER_TICK;
      s.spawnEveryMs = LIVE25_SEDIMENT_SPAWN_EVERY_MS;
    }
  } else {
    s.cellsPerParticle = POST2_SEDIMENT_CELLS_PER_PARTICLE;
    s.spawnPerTick = POST2_SEDIMENT_SPAWN_PER_TICK;
    s.spawnEveryMs = POST2_SEDIMENT_SPAWN_EVERY_MS;
  }
}
/** Design-ideas shell only (`gallery2Shell=1`): red grid — speck (`23`), speck∩spectrum\inspect (`34`), spectrum (`45`), inspect∩spectrum\speck (`56`), inspect (`67`), speck∩inspect\spectrum (`78`). */
const DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS = true;
/** Slide 1 (`23`) red debug grid alpha (0–255); **0** = off (no red). Slides **`34`/`56`/`67`/`78`** default to **128** unless overridden. */
const DEBUG_G2_SLIDE1_FILL_ALPHA = 0;
/** Slide 3 (`45`) spectrum-exclusive red debug grid; **0** = transparent (waveform / reader visible without red fill). */
const DEBUG_G2_SLIDE45_FILL_ALPHA = 0;
function specLiveMotionsDesign() {
  return typeof window !== 'undefined' && window.__SPEC_LIVE_MOTIONS_DESIGN__ === true;
}

/** Hub item **2.7** only (`liveMotions27=1`): slide **23** speck label uses difference blend over sediment so ink reads inverted over black. */
function specLiveMotions27() {
  return typeof window !== 'undefined' && window.__SPEC_LIVE_MOTIONS_27__ === true;
}

/** Branch for `SPECTRUM_READER_TUNING` (2.5 slide 3 vs hub 2.7 slides 4–5). */
function spectrumReaderTuning() {
  return specLiveMotions27() ? SPECTRUM_READER_TUNING.live27 : SPECTRUM_READER_TUNING.default;
}

function specGallery2Shell() {
  return typeof window !== 'undefined' && window.__SPEC_GALLERY2_SHELL__ === true;
}

/**
 * Post1.2 hub **1** (stills) & **1.5** (live motions): `post2-gallery.html` without `gallery2Shell` / `liveMotionsDesign`.
 * Canvas phrase / POST2 typography uses **black** ink on the light gray stage (vs white fills on design shells).
 */
function specGallery1Or15InkTypography() {
  return !specGallery2Shell() && !specLiveMotionsDesign();
}

/** Shared with slide-1 red debug grid and item **2.5** sediment “red coverage” fill (`liveMotionsDesign`). */
function speckExclusiveRedDebugGridParams(ls, rFinal) {
  const step = Math.max(0.48 * ls, rFinal * 0.0095);
  const cellDraw = step * 1.68;
  const pad = Math.max(step * 0.9, rFinal * 0.018);
  return { step, cellDraw, pad };
}

/**
 * Full-disk exclusive lobe (same convention as `isInsideSpeckExclusive`), not label-margin `isExclusivePoint`.
 * `bboxCircleIndex`: only sample that circle’s bbox (the lobe lies inside that disk); finer step + pad reduce edge gaps.
 */
function debugG2DrawExclusiveFillGrid(testFn, centers, rFinal, ls, bboxCircleIndex, fillAlpha) {
  const a = fillAlpha !== undefined && fillAlpha !== null ? fillAlpha : 128;
  if (a <= 0) return;
  const { step, cellDraw, pad } = speckExclusiveRedDebugGridParams(ls, rFinal);
  push();
  noStroke();
  fill(255, 0, 0, a);
  rectMode(CENTER);
  const cell = cellDraw;
  const ciList =
    bboxCircleIndex !== undefined && bboxCircleIndex >= 0 && bboxCircleIndex < 3
      ? [bboxCircleIndex]
      : [0, 1, 2];
  for (let li = 0; li < ciList.length; li++) {
    const c = centers[ciList[li]];
    for (let wx = c.x - rFinal - pad; wx <= c.x + rFinal + pad; wx += step) {
      for (let wy = c.y - rFinal - pad; wy <= c.y + rFinal + pad; wy += step) {
        if (!testFn(wx, wy)) continue;
        rect(wx, wy, cell, cell);
      }
    }
  }
  pop();
}

/** Sample `testFn` on a fixed world axis-aligned rect (e.g. speck∩spectrum overlap). */
function debugG2DrawFillGridWorldRect(testFn, minX, maxX, minY, maxY, rFinal, ls) {
  push();
  noStroke();
  fill(255, 0, 0, 128);
  rectMode(CENTER);
  const { step, cellDraw } = speckExclusiveRedDebugGridParams(ls, rFinal);
  const cell = cellDraw;
  for (let wx = minX; wx <= maxX; wx += step) {
    for (let wy = minY; wy <= maxY; wy += step) {
      if (!testFn(wx, wy)) continue;
      rect(wx, wy, cell, cell);
    }
  }
  pop();
}

/**
 * Inverse of gallery frame-4 stack: translate(cx,screenY) scale(camZoom) translate(-camX,-camY),
 * then rotate(sceneAngle) about (graphCX, graphCY).
 */
function spectrumReaderScreenToWorld(sx, sy, cam) {
  const rx = (sx - cam.cx) / cam.camZoom + cam.camX;
  const ry = (sy - cam.screenY) / cam.camZoom + cam.camY;
  const ca = Math.cos(cam.sceneAngle);
  const sa = Math.sin(cam.sceneAngle);
  const ddx = rx - cam.graphCX;
  const ddy = ry - cam.graphCY;
  const ox = ca * ddx + sa * ddy;
  const oy = -sa * ddx + ca * ddy;
  return { x: cam.graphCX + ox, y: cam.graphCY + oy };
}

function spectrumReaderWorldToScreen(wx, wy, cam) {
  const ca = Math.cos(cam.sceneAngle);
  const sa = Math.sin(cam.sceneAngle);
  const ox = wx - cam.graphCX;
  const oy = wy - cam.graphCY;
  const rx = cam.graphCX + ca * ox - sa * oy;
  const ry = cam.graphCY + sa * ox + ca * oy;
  return {
    x: cam.cx + (rx - cam.camX) * cam.camZoom,
    y: cam.screenY + (ry - cam.camY) * cam.camZoom,
  };
}

/** True if any reader scan strip (center **`x`**, half-width **`half`**) overlaps screen-x interval `[left, right]`. */
function spectrumReaderScanStripsHitScreenXInterval(left, right, strips) {
  if (!strips || strips.length === 0) return false;
  for (let i = 0; i < strips.length; i++) {
    const x = strips[i].x;
    const h = strips[i].half;
    if (!(x + h < left || x - h > right)) return true;
  }
  return false;
}

/**
 * Contiguous canvas-vertical segments where a thick vertical stroke fits inside the exclusive region.
 * When `halfStrokePx` > 0, both horizontal edges of the stroke (center ± half width) must test inside;
 * otherwise only the center column is used (thin stroke).
 */
function spectrumExclusiveVerticalRunsAtScreenX(scanSx, inExclusiveFn, yStepPx, cam, halfStrokePx) {
  const h = typeof halfStrokePx === 'number' && halfStrokePx > 0 ? halfStrokePx : 0;
  const runs = [];
  let runStart = null;
  for (let sy = 0; sy <= height; sy += yStepPx) {
    let inside;
    if (h > 0) {
      const wl = spectrumReaderScreenToWorld(scanSx - h, sy, cam);
      const wr = spectrumReaderScreenToWorld(scanSx + h, sy, cam);
      inside = inExclusiveFn(wl.x, wl.y) && inExclusiveFn(wr.x, wr.y);
    } else {
      const w = spectrumReaderScreenToWorld(scanSx, sy, cam);
      inside = inExclusiveFn(w.x, w.y);
    }
    if (inside && runStart === null) runStart = sy;
    if (!inside && runStart !== null) {
      runs.push({ y0: runStart, y1: sy });
      runStart = null;
    }
  }
  if (runStart !== null) runs.push({ y0: runStart, y1: height });
  return runs;
}

/** Canvas-vertical scan at fixed screen X; clip to spectrum-exclusive lobe via inverse projection. Filled rects (sharp edges), not stroked lines with round caps. */
function drawSpectrumExclusiveVerticalScanScreen(scanScreenX, ls, strokeLs, inExclusiveFn, cam) {
  const strokePx = strokeLs * ls;
  const halfStrokePx = strokePx / 2;
  const runs = spectrumExclusiveVerticalRunsAtScreenX(
    scanScreenX,
    inExclusiveFn,
    SPECTRUM_READER_SCAN_SCREEN_STEP_PX,
    cam,
    halfStrokePx,
  );
  push();
  resetMatrix();
  rectMode(CENTER);
  noStroke();
  fill(0, 255);
  for (let r = 0; r < runs.length; r++) {
    const { y0, y1 } = runs[r];
    const h = y1 - y0;
    if (h <= 0) continue;
    rect(scanScreenX, y0 + h / 2, strokePx, h);
  }
  pop();
}

/**
 * Dense dots on glyph fill when the scan overlaps each character (mask = white on black).
 * `invertDots` (hub **2.7** slide **5**): draw **white** dots on inverted (black) glyphs.
 */
function drawSpectrumStillPhrasesScanGlitchDots(
  spectrumSx,
  firstLineY,
  lineStep,
  phrases,
  phraseSizeScreen,
  phraseAlpha,
  ls,
  invertDots,
) {
  const strips = spectrumReaderScanBarsScreen;
  if (!strips || strips.length === 0 || phraseAlpha <= 8) return;
  textSize(phraseSizeScreen);
  if (uiFont) textFont(uiFont);
  textAlign(CENTER, TOP);
  const n = phrases.length;
  const targetDotsPerChar = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOTS;
  const dotD = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOT_D;
  const th = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_WHITE_THRESH;
  const maxTries = targetDotsPerChar * 52;
  noStroke();
  for (let pi = 0; pi < n; pi++) {
    const line = phrases[pi];
    const twLine = textWidth(line);
    const lineLx = spectrumSx - twLine / 2;
    const ty = firstLineY + pi * lineStep;
    const lineRx = spectrumSx + twLine / 2;
    if (!spectrumReaderScanStripsHitScreenXInterval(lineLx, lineRx, strips)) continue;

    let penX = lineLx;
    const chars = Array.from(line);
    for (let ci = 0; ci < chars.length; ci++) {
      const ch = chars[ci];
      const cw = textWidth(ch);
      const chLx = penX;
      const chRx = penX + cw;
      penX += cw;
      if (!spectrumReaderScanStripsHitScreenXInterval(chLx, chRx, strips)) continue;

      const w = Math.max(4, Math.ceil(cw));
      const h = Math.max(4, Math.ceil(Math.min(lineStep * 0.92, phraseSizeScreen * 1.48)));
      if (
        !spectrumPhraseGlitchMaskBuffer ||
        spectrumPhraseGlitchMaskBuffer.width !== w ||
        spectrumPhraseGlitchMaskBuffer.height !== h
      ) {
        spectrumPhraseGlitchMaskBuffer = createGraphics(w, h);
        spectrumPhraseGlitchMaskBuffer.pixelDensity(1);
      }
      const pg = spectrumPhraseGlitchMaskBuffer;
      pg.background(0);
      pg.fill(255);
      pg.noStroke();
      pg.textAlign(CENTER, TOP);
      pg.textSize(phraseSizeScreen);
      if (uiFont) pg.textFont(uiFont);
      pg.text(ch, w / 2, 0);
      pg.loadPixels();
      const pix = pg.pixels;
      const stride = w * 4;

      let placed = 0;
      let tries = 0;
      while (placed < targetDotsPerChar && tries < maxTries) {
        tries++;
        const rxCl = (random(w) | 0) % w;
        const ryCl = (random(h) | 0) % h;
        const i = ryCl * stride + rxCl * 4;
        const lum = 0.299 * pix[i] + 0.587 * pix[i + 1] + 0.114 * pix[i + 2];
        if (lum <= th) continue;
        if (invertDots) fill(255, phraseAlpha);
        else fill(0, phraseAlpha);
        circle(chLx + rxCl + 0.5, ty + ryCl + 0.5, dotD);
        placed++;
      }
    }
  }
}

/**
 * Same mask sampling and tunables as `drawSpectrumStillPhrasesScanGlitchDots`, for the live rotated **`spectrum`** label (segment **45** reader).
 * Projects each glyph’s bounds to screen for overlap with **both** scan strips (**`spectrumReaderScanBarsScreen`**); **white** dots on black fill.
 */
function drawSpectrumReaderWordScanGlitchDots(
  cam,
  wx,
  wy,
  theta,
  ls,
  vennTextPx,
  chars,
  centers,
  phraseAlpha,
) {
  const strips = spectrumReaderScanBarsScreen;
  if (!strips || strips.length === 0 || phraseAlpha <= 8) return;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const targetDotsPerChar = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOTS;
  const dotD = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_DOT_D;
  const th = SPECTRUM_STILL_PHRASE_SCAN_GLITCH_WHITE_THRESH;
  const maxTries = targetDotsPerChar * 52;

  textSize(vennTextPx);
  if (uiFont) textFont(uiFont);

  push();
  resetMatrix();
  noStroke();
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cw = textWidth(ch);
    const gx = centers[i];
    const gy = 0;
    const halfW = cw / 2;
    const hBuf = Math.max(4, Math.ceil(vennTextPx * 1.48));
    const halfH = hBuf / 2;
    const corners = [
      [gx - halfW, gy - halfH],
      [gx + halfW, gy - halfH],
      [gx - halfW, gy + halfH],
      [gx + halfW, gy + halfH],
    ];
    let minSX = Infinity;
    let maxSX = -Infinity;
    for (let c = 0; c < 4; c++) {
      const lx = corners[c][0];
      const ly = corners[c][1];
      const wxW = wx + lx * cosT - ly * sinT;
      const wyW = wy + lx * sinT + ly * cosT;
      const scr = spectrumReaderWorldToScreen(wxW, wyW, cam);
      if (scr.x < minSX) minSX = scr.x;
      if (scr.x > maxSX) maxSX = scr.x;
    }
    if (!spectrumReaderScanStripsHitScreenXInterval(minSX, maxSX, strips)) continue;

    const w = Math.max(4, Math.ceil(cw));
    if (
      !spectrumPhraseGlitchMaskBuffer ||
      spectrumPhraseGlitchMaskBuffer.width !== w ||
      spectrumPhraseGlitchMaskBuffer.height !== hBuf
    ) {
      spectrumPhraseGlitchMaskBuffer = createGraphics(w, hBuf);
      spectrumPhraseGlitchMaskBuffer.pixelDensity(1);
    }
    const pg = spectrumPhraseGlitchMaskBuffer;
    pg.background(0);
    pg.fill(255);
    pg.noStroke();
    pg.textAlign(CENTER, CENTER);
    pg.textSize(vennTextPx);
    if (uiFont) pg.textFont(uiFont);
    pg.text(ch, w / 2, hBuf / 2);
    pg.loadPixels();
    const pix = pg.pixels;
    const stride = w * 4;

    let placed = 0;
    let tries = 0;
    while (placed < targetDotsPerChar && tries < maxTries) {
      tries++;
      const rxCl = (random(w) | 0) % w;
      const ryCl = (random(hBuf) | 0) % hBuf;
      const pi = ryCl * stride + rxCl * 4;
      const lum = 0.299 * pix[pi] + 0.587 * pix[pi + 1] + 0.114 * pix[pi + 2];
      if (lum <= th) continue;
      const localX = gx + (rxCl + 0.5 - w / 2);
      const localY = gy + (ryCl + 0.5 - hBuf / 2);
      const wxW = wx + localX * cosT - localY * sinT;
      const wyW = wy + localX * sinT + localY * cosT;
      const dotScr = spectrumReaderWorldToScreen(wxW, wyW, cam);
      fill(255, phraseAlpha);
      circle(dotScr.x, dotScr.y, dotD);
      placed++;
    }
  }
  pop();
}

/**
 * Left/right extent along the label baseline through `(wx, wy)` where `inExclusiveFn(world)` is true.
 * Returns `s` in label-local units (same as `xSweepL`): world point `(wx + cos θ·s, wy + sin θ·s)`.
 * Uses the inside run that contains `s = 0` when possible; otherwise the run whose midpoint is nearest 0.
 */
function spectrumExclusiveSweepSpanAlongWord(wx, wy, cosT, sinT, rFinal, inExclusiveFn) {
  const step = Math.max(rFinal * 0.028, 0.45);
  const span = 3.6 * rFinal;
  const samples = [];
  for (let s = -span; s <= span; s += step) {
    const inside = inExclusiveFn(wx + cosT * s, wy + sinT * s);
    samples.push({ s, inside });
  }
  const runs = [];
  let i = 0;
  while (i < samples.length) {
    if (!samples[i].inside) {
      i++;
      continue;
    }
    let j = i;
    while (j < samples.length && samples[j].inside) j++;
    runs.push({ xLeft: samples[i].s, xRight: samples[j - 1].s });
    i = j;
  }
  if (runs.length === 0) return null;
  const hit0 = runs.find((r) => r.xLeft <= 0 && r.xRight >= 0);
  if (hit0) return hit0;
  return runs.reduce((a, b) =>
    Math.abs((a.xLeft + a.xRight) / 2) <= Math.abs((b.xLeft + b.xRight) / 2) ? a : b,
  );
}

/** Ping-pong `xSweepL` along [xLeft,xRight] for normalized time `u` in [0,1); `sweepFrac` is the sweep portion of the cycle. */
function spectrumReaderSweepLocal(u, sweepFrac, xLeft, xRight) {
  const inSweep = u < sweepFrac;
  let xSweepL;
  let sweepForwardHalf = false;
  if (inSweep) {
    const tSweep = u / sweepFrac;
    if (tSweep < 0.5) {
      sweepForwardHalf = true;
      xSweepL = lerp(xLeft, xRight, tSweep * 2);
    } else {
      xSweepL = lerp(xRight, xLeft, (tSweep - 0.5) * 2);
    }
  } else {
    xSweepL = xLeft;
  }
  return { xSweepL, inSweep, sweepForwardHalf };
}

/**
 * Static **spectrum** label + vertical opaque black scan bars in spectrum-exclusive lobe (item 2.5 slide 3).
 * Same scan interaction as Still **05** phrase lines: **glitch dots** on overlap only — no per-letter underline or drift.
 * **Spectrum** glyphs are **black** (`fill(0, 255)`). Sweep ping-pongs left→right→left along the label baseline in the lobe.
 * Uses `millis()` so motion stays smooth while gallery loop resets; relies on global `loop()` on frame 4.
 */
function drawSeg45SpectrumReaderSpectrumLabel(targets, rFinal, ls, wx, wy, theta, vennTextPx, word, frame4Cam) {
  const chars = Array.from(word);
  const n = chars.length;
  const tun = spectrumReaderTuning();
  const cycleMs = tun.cycleMs;
  const cycleT = millis() % cycleMs;
  const u = cycleT / cycleMs;
  const sweepFrac = SPECTRUM_READER_SWEEP_FRAC;
  const ringOutWorld = spectrumReaderScanSpectrumRingOutsetWorld(ls, frame4Cam.camZoom);
  const inEx = (px, py) => isSpectrumExclusiveReaderScanClip(px, py, targets, rFinal, ringOutWorld);

  push();
  translate(wx, wy);
  rotate(theta);
  textAlign(CENTER, CENTER);
  textSize(vennTextPx);
  if (uiFont) textFont(uiFont);
  let tw = 0;
  for (let i = 0; i < n; i++) {
    tw += textWidth(chars[i]);
  }
  const centers = [];
  let run = -tw / 2;
  for (let i = 0; i < n; i++) {
    const cw = textWidth(chars[i]);
    centers.push(run + cw / 2);
    run += cw;
  }
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const lobeSpan = spectrumExclusiveSweepSpanAlongWord(wx, wy, cosT, sinT, rFinal, inEx);
  const xLeft = lobeSpan ? lobeSpan.xLeft : -tw / 2 - 4 * ls;
  const xRight = lobeSpan ? lobeSpan.xRight : tw / 2 + 4 * ls;
  const xSweepL = spectrumReaderSweepLocal(u, sweepFrac, xLeft, xRight).xSweepL;

  const slowCycleMs = cycleMs * SPECTRUM_READER_SLOW_BAR_CYCLE_MUL;
  const uSlow = (millis() % slowCycleMs) / slowCycleMs;
  const slowSweep = spectrumReaderSweepLocal(uSlow, sweepFrac, xLeft, xRight);
  const xSweepLSlow = slowSweep.xSweepL;

  const xScanWorld = wx + cosT * xSweepL;
  const yScanWorld = wy + sinT * xSweepL;
  const xScanWorldSlow = wx + cosT * xSweepLSlow;
  const yScanWorldSlow = wy + sinT * xSweepLSlow;
  pop();

  const scanScrSlow = spectrumReaderWorldToScreen(xScanWorldSlow, yScanWorldSlow, frame4Cam);
  drawSpectrumExclusiveVerticalScanScreen(
    scanScrSlow.x,
    ls,
    SPECTRUM_READER_SCAN_STROKE_SLOW_LS,
    inEx,
    frame4Cam,
  );

  const scanScr = spectrumReaderWorldToScreen(xScanWorld, yScanWorld, frame4Cam);
  spectrumReaderScanBarsScreen = [
    { x: scanScrSlow.x, half: (SPECTRUM_READER_SCAN_STROKE_SLOW_LS * ls) / 2 },
    { x: scanScr.x, half: (SPECTRUM_READER_SCAN_STROKE_LS * ls) / 2 },
  ];
  drawSpectrumExclusiveVerticalScanScreen(scanScr.x, ls, SPECTRUM_READER_SCAN_STROKE_LS, inEx, frame4Cam);

  push();
  translate(wx, wy);
  rotate(theta);
  textAlign(CENTER, CENTER);
  textSize(vennTextPx);
  if (uiFont) textFont(uiFont);
  for (let i = 0; i < n; i++) {
    const gx = centers[i];
    noStroke();
    push();
    translate(gx, 0);
    fill(0, 255);
    text(chars[i], 0, 0);
    pop();
  }
  pop();

  drawSpectrumReaderWordScanGlitchDots(frame4Cam, wx, wy, theta, ls, vennTextPx, chars, centers, 255);
}

/** Screen-space; centered in projected speck-exclusive width (not full canvas). */
function drawPost2ExclusiveDescription(ls, centerScreenX, centerScreenY, maxWidthScreen) {
  if (!POST2_SHOW_DESCRIPTION || !POST2_DESCRIPTION) return;
  const pad = 10 * ls;
  const w = Math.max(24, maxWidthScreen - pad * 2);
  const boxH = Math.min(120 * ls, height * 0.22);
  const ty = Math.max(pad, Math.min(height - pad - boxH, centerScreenY - boxH / 2));

  textAlign(CENTER, CENTER);
  fill(specGallery1Or15InkTypography() ? 0 : 255);
  noStroke();
  textSize(16 * ls);
  textLeading(20 * ls);
  text(POST2_DESCRIPTION, centerScreenX, ty + boxH / 2, w, boxH);
}

/**
 * Shared geometry for compact frame 6 speck∩inspect\spectrum (spread targets): lobe centroid,
 * zoom fit, and `phraseRotAt` / rotation constants. Single source for Still 08 and slide 8 start.
 */
function buildSpeckInspectSpaceFrame6Geometry(targets, rFinal, width, height, ls) {
  const c0 = targets[0];
  const c1 = targets[1];
  const c2 = targets[2];
  const graphCX = (c0.x + c1.x + c2.x) / 3;
  const graphCY = (c0.y + c1.y + c2.y) / 3;
  const dx = c1.x - c0.x;
  const dy = c1.y - c0.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const chordHalf = Math.sqrt(Math.max(0.0001, rFinal * rFinal - (d * d) / 4));
  const rCirc = rFinal;
  const inSpeckInspectOnlyLobe = (px, py) => {
    const d0 = Math.sqrt((px - c0.x) ** 2 + (py - c0.y) ** 2);
    const d1 = Math.sqrt((px - c1.x) ** 2 + (py - c1.y) ** 2);
    const d2 = Math.sqrt((px - c2.x) ** 2 + (py - c2.y) ** 2);
    return d0 <= rCirc * 0.99 && d1 <= rCirc * 0.99 && d2 >= rCirc * 1.02;
  };
  let phraseWx = (c0.x + c1.x) / 2;
  let phraseWy = (c0.y + c1.y) / 2;
  let lobeRadiusWorld = Math.max(chordHalf * 0.92, 16 * ls);
  {
    const pad = rCirc * 1.05;
    const bx0 = Math.min(c0.x, c1.x, c2.x) - pad;
    const bx1 = Math.max(c0.x, c1.x, c2.x) + pad;
    const by0 = Math.min(c0.y, c1.y, c2.y) - pad;
    const by1 = Math.max(c0.y, c1.y, c2.y) + pad;
    const gridN = 22;
    let accX = 0;
    let accY = 0;
    let nHit = 0;
    for (let gi = 0; gi <= gridN; gi++) {
      for (let gj = 0; gj <= gridN; gj++) {
        const px = bx0 + ((bx1 - bx0) * gi) / gridN;
        const py = by0 + ((by1 - by0) * gj) / gridN;
        if (inSpeckInspectOnlyLobe(px, py)) {
          accX += px;
          accY += py;
          nHit++;
        }
      }
    }
    if (nHit > 0) {
      phraseWx = accX / nHit;
      phraseWy = accY / nHit;
      let maxD = 0;
      for (let gi = 0; gi <= gridN; gi++) {
        for (let gj = 0; gj <= gridN; gj++) {
          const px = bx0 + ((bx1 - bx0) * gi) / gridN;
          const py = by0 + ((by1 - by0) * gj) / gridN;
          if (inSpeckInspectOnlyLobe(px, py)) {
            const dd = Math.sqrt((px - phraseWx) ** 2 + (py - phraseWy) ** 2);
            if (dd > maxD) maxD = dd;
          }
        }
      }
      lobeRadiusWorld = Math.max(maxD * 1.12, 14 * ls);
    }
  }
  const fitSideFrac = 0.8;
  const zoom2 = 2.35;
  const zoomTarget = Math.min(
    6.6,
    Math.max(zoom2 + 0.4, (Math.min(width, height) * fitSideFrac) / Math.max(2 * lobeRadiusWorld, 18 * ls)),
  );
  const phraseRotAt = (a) => {
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const ox = phraseWx - graphCX;
    const oy = phraseWy - graphCY;
    return {
      x: graphCX + ca * ox - sa * oy,
      y: graphCY + sa * ox + ca * oy,
    };
  };
  const rotSlide3 = (-60 * Math.PI) / 180;
  const rotStep120 = (-120 * Math.PI) / 180;
  return {
    graphCX,
    graphCY,
    phraseWx,
    phraseWy,
    phraseRotAt,
    zoomTarget,
    rotSlide3,
    rotStep120,
    chordHalf,
    inSpeckInspectOnlyLobe,
  };
}

/** Still 08 endpoint: same as compact frame 6 `spaceStill` branch (`aEnd`, `phraseRotAt`, `zoomTarget`, `screenY = cy`). */
function still08Frame6EndFromGeometry(geom, cy) {
  const aEnd = geom.rotSlide3 + 2 * geom.rotStep120;
  const prS = geom.phraseRotAt(aEnd);
  return {
    camX: prS.x,
    camY: prS.y,
    camZoom: geom.zoomTarget,
    screenY: cy,
    angle: aEnd,
  };
}

/** Slide 8 (`motionSegment=89`) when `__SPEC_FRAME6_END__` is absent — identical to Still 08. */
function computeSpacePhrasesStillFrame6End(targets, rFinal, cy, width, height, ls) {
  return still08Frame6EndFromGeometry(buildSpeckInspectSpaceFrame6Geometry(targets, rFinal, width, height, ls), cy);
}

let uiFont;
let specLogoImg = null;
let specLogoLoadTried = false;
let cachedFinalLayouts = null;
let cachedFinalLayoutsKey = '';
let cnv;
let sequenceStartMs = 0;
let galleryAnimStartMs = 0;
let galleryLastFrame = 0;
let galleryTextStartMs = 0;
/** Item 2.7 slide 23: millis() when sediment finished draining; POST2 outro fade, then loop. */
let galleryLive23OutroStartMs = 0;

/** Per frame: both reader scan strips in screen space for glitch dots — `[{ x, half }, …]`; `null` after `draw()` clears. */
let spectrumReaderScanBarsScreen = null;
/** Reused offscreen buffer for Still 05 glitch dots (white-fill mask). */
let spectrumPhraseGlitchMaskBuffer = null;

const ENABLE_SPECK_DRAG = false;

// Frame 4 interaction: draggable letters for "speck"
let frame4Ready = false;
let frame4Cam = { x: 0, y: 0, zoom: 1, screenY: 0 };
let frame4SpeckCircle = { x: 0, y: 0, r: 0 };
let speckLetters = null; // [{ ch, x, y }]
let speckDragIdx = -1;
let speckDragOff = { x: 0, y: 0 };

// Frame 4 Matter.js physics for "speck"
let matterEngine = null;
let matterWorld = null;
let speckBodies = null; // [{ ch, body }]
let speckWalls = null;
let matterReady = false;

const SPECK_MATTER = {
  friction: 0.28,
  frictionAir: 0.06,
  restitution: 0.55,
  density: 0.0018,
};

// Keep speck letters away from the bottom-circle borders by expanding those walls.
const BOTTOM_CIRCLE_WALL_PAD = 18; // px (in world coords)
const SPECK_MATTER_Y_OFFSET = 14; // nudge initial speck letters downward

// Frame 4 ink-fill (speck-exclusive region) + description reveal
let inkStartMs = 0;
let inkDone = false;
let inkLastAddMs = 0;
let post2SolidInkG = null;
let post2Sediment = null;
let frame5FlashFrame = -1;
let frame5AfterglowStartMs = 0;

// Export recording (MP4 when supported; otherwise WebM)
let recordBtn;
let isRecording = false;
let recorder = null;
let recordedChunks = [];
let recordStopTimeout = null;
let staticFinalMode = false;
let galleryMode = false;

// Label rotations (radians): top is fixed upright; bottom labels are computed as tangents.
const FIXED_LABEL_THETAS = [0, null, null];

// --- label placement (exclusive regions) ---
// We place words in the non-overlapping (exclusive) lobe of each circle.
// Order: 0=top (speck), 1=left (Inspect), 2=right (spectrum)
// Label placement radius (fraction of circle radius).
// Larger = closer to the border, smaller = further inward.
// We keep bottom labels closer to the tangent than the top label.
const LABEL_MIN_DIST_FRAC_TOP = 0.48;
const LABEL_MAX_DIST_FRAC_TOP = 0.68;
const LABEL_MIN_DIST_FRAC_BOTTOM = 0.48;
const LABEL_MAX_DIST_FRAC_BOTTOM = 0.68;
const LABEL_DIST_STEP = 0.05;
const LABEL_MARGIN_PX = 2; // small cushion from circle boundaries

/** Design size (4:5). Layout scales as `width / LAYOUT_REF_W` when canvas is larger (hub only). */
const LAYOUT_REF_W = 600;
const LAYOUT_REF_H = 750;
const MOBILE_CANVAS_MQ = '(max-width: 768px)';

/** post1 plain: fixed 600×750 + pixelDensity(1). Hub iframes (gallery, static final, post1 gallery shell): fit container + retina DPR. */
function useHubCanvasSizing() {
  return typeof window !== 'undefined'
    && (window.__SPEC_GALLERY__ === true
      || window.__SPEC_STATIC_FINAL__ === true
      || window.__SPEC_POST1_GALLERY__ === true);
}

/** Set at the start of each `draw()`; used by label hit-tests. */
let layoutMarginScale = 1;

function canvasSize4x5ForContainer() {
  if (!useHubCanvasSizing()) {
    return { w: LAYOUT_REF_W, h: LAYOUT_REF_H };
  }

  const mobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia(MOBILE_CANVAS_MQ).matches;
  const minW = mobile ? 140 : 280;
  const floorW = mobile ? 160 : 280;
  const floorH = mobile ? 200 : 350;

  const main = typeof document !== 'undefined' ? document.querySelector('main') : null;
  const rect = main
    ? main.getBoundingClientRect()
    : { width: typeof window !== 'undefined' ? window.innerWidth : LAYOUT_REF_W, height: typeof window !== 'undefined' ? window.innerHeight : LAYOUT_REF_H };
  const boxW = Math.max(floorW, rect.width);
  const boxH = Math.max(floorH, rect.height);
  let w = Math.min(boxW, boxH * (LAYOUT_REF_W / LAYOUT_REF_H));
  w = Math.floor(w);
  let h = Math.round(w * (LAYOUT_REF_H / LAYOUT_REF_W));
  if (h > boxH) {
    h = Math.floor(boxH);
    w = Math.floor(h * (LAYOUT_REF_W / LAYOUT_REF_H));
    h = Math.round(w * (LAYOUT_REF_H / LAYOUT_REF_W));
  }
  const maxW = 1400;
  const maxH = 1750;
  const scaleDown = Math.min(1, maxW / w, maxH / h);
  w = Math.floor(w * scaleDown);
  w = Math.max(minW, w);
  w = Math.min(w, Math.floor(boxW));
  h = Math.round(w * (LAYOUT_REF_H / LAYOUT_REF_W));
  if (h > boxH) {
    h = Math.floor(boxH);
    w = Math.floor(h * (LAYOUT_REF_W / LAYOUT_REF_H));
    w = Math.max(minW, Math.min(w, Math.floor(boxW)));
    h = Math.round(w * (LAYOUT_REF_H / LAYOUT_REF_W));
  }
  return { w, h };
}

/** Desktop backing-store scale: ceil(DPR), cap 4 — avoids blur on 3x / fractional DPR. */
function sketchDesktopPixelDensity() {
  const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
  return Math.min(4, Math.max(1, Math.ceil(dpr)));
}

function applySketchCanvasDimensions() {
  const { w, h } = canvasSize4x5ForContainer();
  resizeCanvas(w, h);
  if (useHubCanvasSizing()) {
    const mobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia(MOBILE_CANVAS_MQ).matches;
    pixelDensity(mobile ? 1 : sketchDesktopPixelDensity());
  } else {
    pixelDensity(1);
  }
}

/** Fonts live under `projects/media_motion_01/fonts/`; resolve from this script (`…/js/sketch.js`). */
function specSiteFontUrl(file) {
  if (typeof document === 'undefined') return '../fonts/' + file;
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].src;
    if (src && /\/sketch\.js(\?|#|$)/.test(src)) {
      try {
        return new URL(`../fonts/${file}`, src).href;
      } catch (e) {
        break;
      }
    }
  }
  return '../fonts/' + file;
}

function preload() {
  uiFont = loadFont(specSiteFontUrl('genwan_latin_092725_1-R.otf'));
}

function ensureSpecLogoLoaded() {
  if (specLogoLoadTried) return;
  specLogoLoadTried = true;
  specLogoImg = loadImage(
    '../assets/spec-logo.png',
    () => { if (galleryMode) redraw(); },
    () => { specLogoImg = null; },
  );
}

function setup() {
  const { w, h } = canvasSize4x5ForContainer();
  cnv = createCanvas(w, h);
  if (useHubCanvasSizing()) {
    const mobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia(MOBILE_CANVAS_MQ).matches;
    pixelDensity(mobile ? 1 : sketchDesktopPixelDensity());
  } else {
    pixelDensity(1);
  }
  const mainEl = (typeof document !== 'undefined') ? document.querySelector('main') : null;
  if (mainEl && cnv?.parent) cnv.parent(mainEl);
  // post1.2 iframe: flex can resize `main` without a window resize — sync canvas + DPR.
  if (useHubCanvasSizing() && typeof ResizeObserver !== 'undefined' && mainEl) {
    let roT = null;
    const ro = new ResizeObserver(() => {
      clearTimeout(roT);
      roT = setTimeout(() => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('resize'));
      }, 60);
    });
    ro.observe(mainEl);
  }
  // Allow native context menu on the canvas (Inspect, etc.). p5/WebGL helpers may disable it.
  if (cnv?.elt) cnv.elt.oncontextmenu = null;

  if (uiFont) textFont(uiFont);
  staticFinalMode = !!(typeof window !== 'undefined' && window.__SPEC_STATIC_FINAL__ === true);
  galleryMode = !!(typeof window !== 'undefined' && window.__SPEC_GALLERY__ === true);

  if (staticFinalMode || galleryMode) {
    // Start timeline in the middle of the final hold and render once.
    const tFinal = TOTAL - DURATION_END_HOLD * 0.5;
    sequenceStartMs = millis() - tFinal * 1000;
    noLoop();
    // p5 won't call draw() automatically when noLoop() is set in setup,
    // so trigger the initial render explicitly (gallery uses redraw() for navigation too).
    redraw();
  } else {
    sequenceStartMs = millis();
  }

  if (!staticFinalMode && !galleryMode && !(typeof window !== 'undefined' && window.__SPEC_POST1_GALLERY__ === true)) {
    recordBtn = createButton('Export MP4');
    recordBtn.mousePressed(exportSequence);
    recordBtn.position(10, height + 10);
  }
}

function windowResized() {
  if (!useHubCanvasSizing()) {
    if (recordBtn) recordBtn.position(10, height + 10);
    return;
  }
  applySketchCanvasDimensions();
  cachedFinalLayouts = null;
  cachedFinalLayoutsKey = '';
  post2SolidInkG = null;
  post2Sediment = null;
  matterReady = false;
  matterEngine = null;
  matterWorld = null;
  speckBodies = null;
  speckWalls = null;
  speckLetters = null;
  frame4Ready = false;
  if (recordBtn) recordBtn.position(10, height + 10);
  if (staticFinalMode || galleryMode) redraw();
}

function pickRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    // MP4 (supported on some browsers, notably Safari)
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4',
    // WebM (supported in Chrome/Firefox/Edge)
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function exportSequence() {
  if (isRecording) return;
  if (!cnv || !cnv.elt || typeof cnv.elt.captureStream !== 'function') return;
  if (typeof MediaRecorder === 'undefined') return;

  // Restart the animation so the capture always records a full sequence from t=0.
  sequenceStartMs = millis();

  const mimeType = pickRecorderMimeType();
  recordedChunks = [];

  const stream = cnv.elt.captureStream(60);
  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }

  isRecording = true;
  recordBtn.html('Recording…');

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  recorder.onstop = () => {
    const type = mimeType || (recordedChunks[0]?.type ?? 'video/webm');
    const isMp4 = (type || '').includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';

    const blob = new Blob(recordedChunks, { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spec_sequence.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    isRecording = false;
    recordBtn.html(isMp4 ? 'Export MP4' : 'Export WebM');
  };

  recorder.start();
  clearTimeout(recordStopTimeout);
  recordStopTimeout = setTimeout(() => {
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, Math.ceil(TOTAL * 1000) + 250);
}

// --- easing helpers (for smoother, more dynamic motion) ---
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function easeOutCubic(t) {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  t = clamp01(t);
  return (t < 0.5) ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smootherstep(t) {
  t = clamp01(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** easeInExpo — https://easings.net/#easeInExpo (slow start, fast end). */
function easeInExpo(t) {
  t = clamp01(t);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.pow(2, 10 * t - 10);
}

/** easeOutExpo — https://easings.net/#easeOutExpo (fast start, slow end). */
function easeOutExpo(t) {
  t = clamp01(t);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

function screenToWorld(mx, my, cam) {
  // In gallery camera: translate(cx, cam.screenY); scale(cam.zoom); translate(-cam.x, -cam.y)
  const cx = width / 2;
  const wx = cam.x + (mx - cx) / cam.zoom;
  const wy = cam.y + (my - cam.screenY) / cam.zoom;
  return { x: wx, y: wy };
}

function clampPointToCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  const d = Math.hypot(dx, dy);
  if (d <= r || d === 0) return { x: px, y: py };
  const s = r / d;
  return { x: cx + dx * s, y: cy + dy * s };
}

function matterAvailable() {
  return typeof window !== 'undefined' && window.Matter && window.Matter.Engine;
}

function ensureMatterSpeckInitialized(targets, rFinal, labelX, labelY) {
  if (!matterAvailable() || matterReady) return;

  const ls = width / LAYOUT_REF_W;

  const { Engine, World, Bodies, Body } = window.Matter;
  matterEngine = Engine.create();
  matterWorld = matterEngine.world;
  matterWorld.gravity.x = 0;
  matterWorld.gravity.y = 0.45;

  // Approximate circle boundaries using static segments.
  // Top circle (speck) is a wall, plus the bottom two circles act as walls too.
  const segs = 28;
  const wallThickness = 16 * ls;
  speckWalls = [];

  function addCircleWall(c, radius) {
    const wallLen = (2 * Math.PI * radius) / segs;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = c.x + Math.cos(a) * radius;
      const y = c.y + Math.sin(a) * radius;
      speckWalls.push(Bodies.rectangle(x, y, wallLen, wallThickness, {
        isStatic: true,
        angle: a,
        friction: 0,
        restitution: 0.2,
      }));
    }
  }

  // Speck circle boundary
  addCircleWall(targets[0], rFinal);
  // Bottom circles: expand slightly so letters don't touch their borders
  const wallPad = BOTTOM_CIRCLE_WALL_PAD * ls;
  addCircleWall(targets[1], rFinal + wallPad);
  addCircleWall(targets[2], rFinal + wallPad);
  World.add(matterWorld, speckWalls);

  // Build letter bodies around the label center
  textSize(VENN_TEXT_SIZE * ls);
  textAlign(LEFT, CENTER);
  const chars = WORDS[0].split('');
  const widths = chars.map((c) => textWidth(c));
  const totalW = widths.reduce((a, b) => a + b, 0);
  const h = textAscent() + textDescent();

  let x = labelX - totalW / 2;
  speckBodies = [];
  for (let i = 0; i < chars.length; i++) {
    const w = Math.max(10, widths[i] + 6);
    const cx = x + widths[i] / 2;
    x += widths[i];
    const body = Bodies.rectangle(cx, labelY, w, h, {
      friction: SPECK_MATTER.friction,
      frictionAir: SPECK_MATTER.frictionAir,
      restitution: SPECK_MATTER.restitution,
      density: SPECK_MATTER.density,
    });
    // Give a little initial kick
    Body.setVelocity(body, { x: random(-2.2, 2.2), y: random(-1.8, 1.8) });
    Body.setAngularVelocity(body, random(-0.08, 0.08));
    speckBodies.push({
      ch: chars[i],
      body,
      base: {
        friction: body.friction,
        frictionAir: body.frictionAir,
        restitution: body.restitution,
      },
    });
  }
  World.add(matterWorld, speckBodies.map((x) => x.body));

  matterReady = true;
}

function stepMatter(dtMs) {
  if (!matterReady || !matterEngine) return;
  window.Matter.Engine.update(matterEngine, dtMs);
}

function drawMatterSpeckLetters(fx) {
  if (!matterReady || !speckBodies) return;
  const ls = layoutMarginScale || width / LAYOUT_REF_W;
  textSize(VENN_TEXT_SIZE * ls);
  textAlign(CENTER, CENTER);
  const flashA = fx?.flashA || 0;
  const glowA = fx?.glowA || 0;
  for (const l of speckBodies) {
    const p = l.body.position;
    push();
    translate(p.x, p.y);
    rotate(l.body.angle);
    // Physics should only act on the white "speck" letters.
    const ctx = drawingContext;
    if (glowA > 0.5) {
      // Negative color glow for white text => black glow.
      ctx.save();
      ctx.shadowColor = `rgba(0,0,0,${Math.min(0.35, glowA / 255)})`;
      ctx.shadowBlur = 16 * ls;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    fill(255, Math.max(220, flashA > 0 ? 255 : 220));
    stroke(0, flashA > 0 ? 120 : 90);
    strokeWeight((flashA > 0 ? 1.25 : 1) * ls);
    text(l.ch, 0, 0);
    if (glowA > 0.5) ctx.restore();
    pop();
  }
}

function inkAvailable() {
  return typeof window !== 'undefined' && window.SpecInk;
}

function ensurePost2SolidInkLayer(p5) {
  const pd = Math.min(4, Math.max(1, p5.pixelDensity()));
  if (!post2SolidInkG || post2SolidInkG.width !== width || post2SolidInkG.height !== height
      || post2SolidInkG.pixelDensity() !== pd) {
    post2SolidInkG = p5.createGraphics(width, height);
    post2SolidInkG.pixelDensity(pd);
  }
  return post2SolidInkG;
}

function renderSolidSpeckExclusive(p5, targets, rFinal) {
  const g = ensurePost2SolidInkLayer(p5);
  const ctx = g.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, g.width, g.height);

  // Robust solid fill:
  // 1) Paint full canvas black
  // 2) Keep only the TOP circle (destination-in)
  // 3) Subtract bottom circles (destination-out)
  g.noStroke();
  g.fill(0);
  g.rect(0, 0, g.width, g.height);

  ctx.globalCompositeOperation = 'destination-in';
  g.noStroke();
  g.fill(255);
  g.ellipse(targets[0].x, targets[0].y, rFinal * 2, rFinal * 2);

  ctx.globalCompositeOperation = 'destination-out';
  g.noStroke();
  g.fill(255);
  g.ellipse(targets[1].x, targets[1].y, rFinal * 2, rFinal * 2);
  g.ellipse(targets[2].x, targets[2].y, rFinal * 2, rFinal * 2);

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  return g;
}

function isInsideSpeckExclusive(px, py, targets, rFinal) {
  const dx0 = px - targets[0].x;
  const dy0 = py - targets[0].y;
  if (dx0 * dx0 + dy0 * dy0 > rFinal * rFinal) return false;
  const dx1 = px - targets[1].x;
  const dy1 = py - targets[1].y;
  if (dx1 * dx1 + dy1 * dy1 <= rFinal * rFinal) return false;
  const dx2 = px - targets[2].x;
  const dy2 = py - targets[2].y;
  if (dx2 * dx2 + dy2 * dy2 <= rFinal * rFinal) return false;
  return true;
}

/** Item 2.5 sediment tiles match red debug rects (`drawCell` × `drawCell` centered on the same grid). */
function post2SedimentParticleTouchesAllowed(p, s, targets, rFinal) {
  if (!s.redCoverageSediment) return isInsideSpeckExclusive(p.x, p.y, targets, rFinal);
  const half = s.drawCell * 0.51;
  const c0 = Math.floor((p.x - s.minX) / s.cell);
  const r0 = Math.floor((p.y - s.minY) / s.cell);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const c = c0 + dc;
      const r = r0 + dr;
      if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) continue;
      if (!s.allowed[r * s.cols + c]) continue;
      const cx = s.minX + c * s.cell;
      const cy = s.minY + r * s.cell;
      if (Math.abs(p.x - cx) <= half && Math.abs(p.y - cy) <= half) return true;
    }
  }
  return false;
}

function renderPost2SpeckExclusiveSedimentMask(p5, targets, rFinal) {
  if (!post2Sediment?.coverageMaskG) return renderSolidSpeckExclusive(p5, targets, rFinal);
  const g = ensurePost2SolidInkLayer(p5);
  const ctx = g.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, g.width, g.height);
  g.noStroke();
  g.fill(0);
  g.rect(0, 0, g.width, g.height);
  ctx.globalCompositeOperation = 'destination-in';
  g.image(post2Sediment.coverageMaskG, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  return g;
}

/** Horizontal center and half-width of speck-exclusive (black) region at world `py`, or null if empty. */
function speckExclusiveSpanWorldAtY(py, targets, rFinal) {
  const T = targets[0];
  const dy = py - T.y;
  const disc = rFinal * rFinal - dy * dy;
  if (disc <= 0) return null;
  const xHalf = Math.sqrt(disc);
  const step = Math.max(0.35, xHalf / 100);
  let xMin = null;
  let xMax = null;
  for (let x = T.x - xHalf; x <= T.x + xHalf + 1e-6; x += step) {
    if (isInsideSpeckExclusive(x, py, targets, rFinal)) {
      if (xMin === null || x < xMin) xMin = x;
      if (xMax === null || x > xMax) xMax = x;
    }
  }
  if (xMin === null || xMax === null) return null;
  return { cx: (xMin + xMax) / 2, halfW: (xMax - xMin) / 2 };
}

function ensurePost2Sediment(p5, targets, rFinal, ls) {
  const lsEff = ls != null ? ls : (layoutMarginScale || width / LAYOUT_REF_W);
  const redCoverageSediment = specLiveMotionsDesign();

  let minX;
  let minY;
  let cell;
  let drawCell;
  let cols;
  let rows;
  const wxList = [];
  const wyList = [];

  if (redCoverageSediment) {
    const { step, cellDraw, pad } = speckExclusiveRedDebugGridParams(lsEff, rFinal);
    const c0 = targets[0];
    minX = c0.x - rFinal - pad;
    minY = c0.y - rFinal - pad;
    cell = step;
    drawCell = cellDraw;
    const maxX = c0.x + rFinal + pad;
    const maxY = c0.y + rFinal + pad;
    for (let wx = minX; wx <= maxX + 1e-8; wx += step) wxList.push(wx);
    for (let wy = minY; wy <= maxY + 1e-8; wy += step) wyList.push(wy);
    cols = Math.max(1, wxList.length);
    rows = Math.max(1, wyList.length);
  } else {
    cell = 5;
    drawCell = 5;
    minX = targets[0].x - rFinal;
    minY = targets[0].y - rFinal;
  const maxX = targets[0].x + rFinal;
  const maxY = targets[0].y + rFinal;
    cols = Math.max(12, Math.floor((maxX - minX) / cell));
    rows = Math.max(12, Math.floor((maxY - minY) / cell));
  }

  const key = `${redCoverageSediment ? 'L25' : 'LEG'}|${Math.round(minX)}|${Math.round(minY)}|${cols}x${rows}|c${cell}|dc${drawCell}|${Math.round(rFinal)}|` +
    `${Math.round(targets[1].x)}|${Math.round(targets[1].y)}|${Math.round(targets[2].x)}|${Math.round(targets[2].y)}|${width}x${height}|pd${p5.pixelDensity()}`;
  if (post2Sediment?.key === key) {
    patchPost2SedimentRuntimeTuning(post2Sediment);
    post2Sediment.liveMotions27 = redCoverageSediment && specLiveMotions27();
    return;
  }

  const allowed = new Uint8Array(cols * rows);
  const filled = new Uint8Array(cols * rows);
  const rowAllowed = new Uint16Array(rows);
  const rowFilled = new Uint16Array(rows);
  const rowAllowedCols = new Array(rows);
  const allowedCols = [];
  const hasCol = new Uint8Array(cols);
  let total = 0;

  for (let r = 0; r < rows; r++) {
    let rc = 0;
    const colsInRow = [];
    for (let c = 0; c < cols; c++) {
      const x = redCoverageSediment ? wxList[c] : minX + (c + 0.5) * cell;
      const y = redCoverageSediment ? wyList[r] : minY + (r + 0.5) * cell;
      const ok = isInsideSpeckExclusive(x, y, targets, rFinal);
      const idx = r * cols + c;
      if (ok) {
        allowed[idx] = 1;
        rc++;
        total++;
        hasCol[c] = 1;
        colsInRow.push(c);
      }
    }
    rowAllowed[r] = rc;
    rowAllowedCols[r] = colsInRow;
  }
  for (let c = 0; c < cols; c++) if (hasCol[c]) allowedCols.push(c);

  const pd = Math.min(4, Math.max(1, p5.pixelDensity()));
  const g = p5.createGraphics(width, height);
  g.pixelDensity(pd);
  g.clear();
  const maskWorldG = POST2_SHOW_DESCRIPTION ? p5.createGraphics(width, height) : null;
  if (maskWorldG) {
    maskWorldG.pixelDensity(pd);
    maskWorldG.clear();
  }

  let coverageMaskG = null;
  if (redCoverageSediment) {
    coverageMaskG = p5.createGraphics(width, height);
    coverageMaskG.pixelDensity(pd);
    coverageMaskG.clear();
    coverageMaskG.noStroke();
    coverageMaskG.fill(255);
    coverageMaskG.rectMode(CENTER);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!allowed[r * cols + c]) continue;
        coverageMaskG.rect(wxList[c], wyList[r], drawCell, drawCell);
      }
    }
    coverageMaskG.rectMode(CORNER);
  }

  post2Sediment = {
    key,
    g,
    maskWorldG,
    coverageMaskG,
    redCoverageSediment,
    minX,
    minY,
    cell,
    drawCell,
    cols,
    rows,
    allowed,
    filled,
    rowAllowed,
    rowFilled,
    rowAllowedCols,
    total,
    remaining: total,
    scanRow: rows - 1,
    bottomRow: rows - 1,
    startedAtMs: 0,
    cellsPerParticle: POST2_SEDIMENT_CELLS_PER_PARTICLE,
    particles: [],
    allowedCols,
    gravity: 0.38,
    maxVy: 7.0,
    spawnPerTick: POST2_SEDIMENT_SPAWN_PER_TICK,
    spawnEveryMs: POST2_SEDIMENT_SPAWN_EVERY_MS,
    lastSpawnMs: 0,
    lastDrainMs: 0,
    done: false,
    draining: false,
    drained: false,
    drainHoldFrames: 0,
    liveMotions27: redCoverageSediment && specLiveMotions27(),
    fillEaseT0: 0,
    drainEaseT0: 0,
    drainStartFilled: 0,
    lastStepPost2Ms: 0,
    fillSpawnAccumMs: 0,
    drainGlyphAccumMs: 0,
    /** Item 2.7: mask has no filled cells; wait for drain glyphs to fall off before `drained`. */
    drainGridClear: false,
  };
  patchPost2SedimentRuntimeTuning(post2Sediment);

  while (post2Sediment.scanRow >= 0 && post2Sediment.rowAllowed[post2Sediment.scanRow] === 0) {
    post2Sediment.scanRow--;
  }
  post2Sediment.bottomRow = post2Sediment.scanRow;
}

function sedimentSurfaceRow(s) {
  // Current row being filled (surface is at the top of this row).
  while (s.scanRow >= 0) {
    if (s.rowAllowed[s.scanRow] === 0) { s.scanRow--; continue; }
    if (s.rowFilled[s.scanRow] >= s.rowAllowed[s.scanRow]) { s.scanRow--; continue; }
    break;
  }
  return Math.max(0, Math.min(s.rows - 1, s.scanRow));
}

/** Bottom-up curtain clear: up to `maxCells` filled cells (item 2.5 / 2.7 drain). */
function post2SedimentDrainClearCells(s, maxCells) {
  if (!s || maxCells <= 0) return;
  const clearCell = (r, c) => {
    const idx = r * s.cols + c;
    if (!s.filled[idx]) return;
    s.filled[idx] = 0;
    s.rowFilled[r]--;
    s.remaining++;
  };
  let k = maxCells;
  while (k > 0) {
    let pickR = -1;
    for (let r = s.rows - 1; r >= 0; r--) {
      if (s.rowAllowed[r] === 0) continue;
      const rowBase = r * s.cols;
      for (let c = 0; c < s.cols; c++) {
        if (s.filled[rowBase + c]) {
          pickR = r;
          break;
        }
      }
      if (pickR >= 0) break;
    }
    if (pickR < 0) break;

    const rowBase = pickR * s.cols;
    const colsFilled = [];
    for (let c = 0; c < s.cols; c++) {
      if (s.filled[rowBase + c]) colsFilled.push(c);
    }
    if (colsFilled.length === 0) break;

    colsFilled.sort((a, b) => a - b);
    if (colsFilled.length <= k) {
      for (let j = 0; j < colsFilled.length; j++) {
        clearCell(pickR, colsFilled[j]);
      }
      k -= colsFilled.length;
    } else {
      for (let j = 0; j < k; j++) {
        clearCell(pickR, colsFilled[j]);
      }
      k = 0;
    }
  }
}

function post2SedimentDrainFinalizeIfEmpty(s) {
  if (!s) return;
  let anyFilled = false;
  for (let i = 0; i < s.filled.length; i++) {
    if (s.filled[i]) {
      anyFilled = true;
      break;
    }
  }
  if (!anyFilled) {
    if (s.liveMotions27) {
      s.drainGridClear = true;
      return;
    }
    s.drained = true;
    s.draining = false;
    s.particles = [];
  }
}

/** Item 2.5 slide 1: bottom-up “curtain” drain — same cell budget per tick as fill (`spawnPerTick * cellsPerParticle`); strips whole bottom rows first, then left-to-right on the current bottom row if the budget is smaller than the row. */
function live25SedimentDrainStep(s) {
  if (!s || !s.redCoverageSediment || !s.draining || s.drained) return;
  const now = millis();
  const every = s.spawnEveryMs != null ? s.spawnEveryMs : POST2_SEDIMENT_SPAWN_EVERY_MS;
  if (!s.lastDrainMs) s.lastDrainMs = now;
  if (now - s.lastDrainMs < every) return;
  s.lastDrainMs = now;

  const sp = Math.max(1, s.spawnPerTick | 0);
  const cpp = Math.max(1, s.cellsPerParticle | 0);
  post2SedimentDrainClearCells(s, sp * cpp);
  post2SedimentDrainFinalizeIfEmpty(s);
}

/** Item 2.7 slide 1: drain target follows easeOutExpo (fast start — easeInExpo left the mask “stuck” full at t≈0). */
function live27SedimentDrainStep(s) {
  if (!s || !s.redCoverageSediment || !s.draining || s.drained) return;
  if (s.drainGridClear) return;
  if (!s.drainEaseT0) {
    s.drainEaseT0 = millis();
    s.drainStartFilled = s.total - s.remaining;
  }
  const u = clamp01((millis() - s.drainEaseT0) / LIVE27_SEDIMENT_EASE_MS);
  const full0 = Math.max(1, s.drainStartFilled | 0);
  const targetFilled =
    u >= 1 ? 0 : Math.max(0, Math.floor((1 - easeOutExpo(u)) * full0));
  const have = s.total - s.remaining;
  const needClear = have - targetFilled;
  if (needClear > 0) {
    post2SedimentDrainClearCells(s, Math.min(needClear, LIVE27_DRAIN_MAX_CELLS_PER_FRAME));
  }
  post2SedimentDrainFinalizeIfEmpty(s);
}

/**
 * Spawn one black drain glyph on the **bottom edge** of the filled region (per column: lowest filled row),
 * with y near the **bottom** of that tile so glyphs peel downward off the black mass — not from random cells
 * higher in the blob.
 */
function live27SpawnDrainGlyphVisual(s) {
  const bottomEdge = [];
  for (let c = 0; c < s.cols; c++) {
    for (let r = s.rows - 1; r >= 0; r--) {
      const idx = r * s.cols + c;
      if (s.filled[idx]) {
        bottomEdge.push({ r, c });
        break;
      }
    }
  }
  if (bottomEdge.length === 0) return;
  const { r, c } = bottomEdge[Math.floor(random(bottomEdge.length))];
  const x = s.minX + c * s.cell;
  const cy = s.minY + r * s.cell;
  const y = cy + s.drawCell * 0.42;
  s.particles.push({
    x,
    y,
    vy: random(LIVE27_DRAIN_GLYPH_VY_MIN, LIVE27_DRAIN_GLYPH_VY_MAX),
    ch: 'speck'.charAt(Math.floor(random(5))),
    drain: true,
  });
}

/** Black “speck” glyphs fall downward during drain (same gravity / fall-through as fill phase). */
function live27DrainParticlesStep(s, dtMs) {
  if (!s || s.drained) return;
  const now = millis();
  const spawnEveryMs = s.spawnEveryMs != null ? s.spawnEveryMs : POST2_SEDIMENT_SPAWN_EVERY_MS;
  let uDrain = 0;
  if (s.drainEaseT0) {
    uDrain = clamp01((now - s.drainEaseT0) / LIVE27_SEDIMENT_EASE_MS);
  }
  const ramp = 0.1 + 0.9 * easeOutExpo(uDrain);
  const interval = Math.max(10, spawnEveryMs / (ramp * LIVE27_DRAIN_GLYPH_SPAWN_MUL));

  s.drainGlyphAccumMs = (s.drainGlyphAccumMs || 0) + dtMs;
  const dg = Math.max(1, LIVE27_DRAIN_GLYPHS_PER_TICK | 0);
  while (s.drainGlyphAccumMs >= interval) {
    s.drainGlyphAccumMs -= interval;
    for (let i = 0; i < dg; i++) {
      live27SpawnDrainGlyphVisual(s);
    }
  }

  const fallThroughY = s.redCoverageSediment
    ? s.minY + (s.rows - 1) * s.cell + s.drawCell * 0.5 + 180
    : s.minY + s.rows * s.cell + 180;

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    if (!p.drain) {
      s.particles.splice(i, 1);
      continue;
    }
    p.vy = Math.min(s.maxVy, p.vy + s.gravity * LIVE27_DRAIN_GLYPH_GRAVITY_MUL);
    p.y += p.vy;
    if (p.y > fallThroughY) s.particles.splice(i, 1);
  }
}

function sedimentFillSomeCells(s, count) {
  if (!s.startedAtMs) s.startedAtMs = millis();
  let k = count;
  while (k > 0 && s.scanRow >= 0 && s.remaining > 0) {
    // Skip empty / full rows
    if (s.rowAllowed[s.scanRow] === 0 || s.rowFilled[s.scanRow] >= s.rowAllowed[s.scanRow]) {
      s.scanRow--;
      continue;
    }

    const colsInRow = s.rowAllowedCols[s.scanRow];
    if (!colsInRow || colsInRow.length === 0) {
      s.scanRow--;
      continue;
    }

    // Random pick with fallback scan.
    let chosen = -1;
    for (let t = 0; t < 18; t++) {
      const c = colsInRow[Math.floor(random(colsInRow.length))];
      const idx = s.scanRow * s.cols + c;
      if (s.allowed[idx] && !s.filled[idx]) { chosen = idx; break; }
    }
    if (chosen < 0) {
      for (let j = 0; j < colsInRow.length; j++) {
        const idx = s.scanRow * s.cols + colsInRow[j];
        if (s.allowed[idx] && !s.filled[idx]) { chosen = idx; break; }
      }
    }
    if (chosen < 0) {
      // Shouldn't happen, but advance row if it does.
      s.scanRow--;
      continue;
    }

    s.filled[chosen] = 1;
    s.rowFilled[s.scanRow]++;
    s.remaining--;
    k--;
  }
  if (s.remaining <= 0) {
    s.done = true;
    s.remaining = 0;
  }
}

function stepPost2Sediment(p5, targets, rFinal) {
  if (!post2Sediment) return;
  const s = post2Sediment;
  const stepNow = millis();
  const dtMs = s.lastStepPost2Ms != null ? Math.min(64, Math.max(1, stepNow - s.lastStepPost2Ms)) : 16.67;
  s.lastStepPost2Ms = stepNow;

  if (s.redCoverageSediment && s.draining) {
    if (s.liveMotions27) {
      live27SedimentDrainStep(s);
      if (!s.drained) {
        live27DrainParticlesStep(s, dtMs);
        if (s.drainGridClear && s.particles.length === 0) {
          s.drained = true;
          s.draining = false;
        }
      }
    } else {
      live25SedimentDrainStep(s);
    }
    return;
  }
  if (s.done) {
    if (s.redCoverageSediment && s.particles.length) s.particles = [];
    return;
  }

  // If region is empty, finish immediately.
  if (s.scanRow < 0 || s.total <= 0) {
    s.done = true;
    s.remaining = 0;
    return;
  }

  if (s.redCoverageSediment && s.liveMotions27 && !s.fillEaseT0) {
    s.fillEaseT0 = millis();
  }

  const now = millis();
  const spawnEveryMs = s.spawnEveryMs != null ? s.spawnEveryMs : POST2_SEDIMENT_SPAWN_EVERY_MS;
  let spawnInterval = spawnEveryMs;
  if (s.redCoverageSediment && s.liveMotions27 && s.fillEaseT0) {
    const uFill = clamp01((now - s.fillEaseT0) / LIVE27_SEDIMENT_EASE_MS);
    const ramp = 0.1 + 0.9 * easeInExpo(uFill);
    spawnInterval = Math.max(12, spawnEveryMs / (ramp * LIVE27_FILL_SPAWN_SPEED_MUL));
  }
  if (s.redCoverageSediment && s.liveMotions27) {
    s.fillSpawnAccumMs = (s.fillSpawnAccumMs || 0) + dtMs;
    while (s.fillSpawnAccumMs >= spawnInterval) {
      s.fillSpawnAccumMs -= spawnInterval;
      const sr = sedimentSurfaceRow(s);
      const colsInRow = s.rowAllowedCols[sr] || s.allowedCols;
      for (let i = 0; i < s.spawnPerTick; i++) {
        const c = colsInRow[Math.floor(random(colsInRow.length))] ?? Math.floor(random(s.cols));
        const x = s.redCoverageSediment ? s.minX + c * s.cell : s.minX + (c + 0.5) * s.cell;
        const y = s.minY - random(25, 90);
        const ch = 'speck'.charAt(Math.floor(random(5)));
        s.particles.push({ x, y, vy: random(0.2, 1.3), ch });
      }
    }
  } else {
  if (!s.lastSpawnMs) s.lastSpawnMs = now;
    if (now - s.lastSpawnMs >= spawnInterval) {
    const sr = sedimentSurfaceRow(s);
    const colsInRow = s.rowAllowedCols[sr] || s.allowedCols;
    for (let i = 0; i < s.spawnPerTick; i++) {
      const c = colsInRow[Math.floor(random(colsInRow.length))] ?? Math.floor(random(s.cols));
        const x = s.redCoverageSediment ? s.minX + c * s.cell : s.minX + (c + 0.5) * s.cell;
      const y = s.minY - random(25, 90);
      const ch = 'speck'.charAt(Math.floor(random(5)));
      s.particles.push({ x, y, vy: random(0.2, 1.3), ch });
    }
    s.lastSpawnMs = now;
    }
  }

  const sr = sedimentSurfaceRow(s);
  const surfaceY = s.redCoverageSediment
    ? s.minY + sr * s.cell - s.drawCell * 0.5
    : s.minY + sr * s.cell;

  const fallThroughY = s.redCoverageSediment
    ? s.minY + (s.rows - 1) * s.cell + s.drawCell * 0.5 + 180
    : s.minY + s.rows * s.cell + 180;

  let fillBudget =
    s.redCoverageSediment && s.liveMotions27 ? LIVE27_FILL_MAX_CELLS_PER_FRAME : 1e9;

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.vy = Math.min(s.maxVy, p.vy + s.gravity);
    p.y += p.vy;

    if (p.y > fallThroughY) {
      s.particles.splice(i, 1);
      continue;
    }

    if (p.y >= surfaceY && post2SedimentParticleTouchesAllowed(p, s, targets, rFinal)) {
      let fillN = s.cellsPerParticle;
      if (s.liveMotions27 && s.fillEaseT0) {
        const uFill = clamp01((now - s.fillEaseT0) / LIVE27_SEDIMENT_EASE_MS);
        const ramp = 0.35 + 0.65 * easeInExpo(uFill);
        fillN = Math.max(
          1,
          Math.round(s.cellsPerParticle * ramp * LIVE27_FILL_CELLS_LANDING_MUL),
        );
      }
      if (s.liveMotions27) {
        fillN = Math.min(fillN, Math.max(0, fillBudget));
        if (fillN < 1) {
          continue;
        }
        fillBudget -= fillN;
      }
      sedimentFillSomeCells(s, fillN);
      s.particles.splice(i, 1);
    }
  }
}

function post2SedimentClearG(s) {
  const g = s.g;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, g.width, g.height);
  ctx.restore();
}

function post2SedimentClearGAndMaskW(s) {
  post2SedimentClearG(s);
  const maskW = s.maskWorldG;
  if (maskW) {
    const ctxM = maskW.drawingContext;
    ctxM.save();
    ctxM.globalCompositeOperation = 'source-over';
    ctxM.clearRect(0, 0, maskW.width, maskW.height);
    ctxM.restore();
  }
  }

function post2SedimentDrawFilledCells(s) {
  const g = s.g;
  const maskW = s.maskWorldG;
  g.noStroke();
  g.fill(0);
  if (maskW) {
    maskW.noStroke();
    maskW.fill(255);
  }
  const r0 = s.redCoverageSediment ? 0 : Math.max(0, s.scanRow);
  if (s.redCoverageSediment) {
    g.rectMode(CENTER);
    if (maskW) maskW.rectMode(CENTER);
    for (let r = r0; r < s.rows; r++) {
      const cy = s.minY + r * s.cell;
      const rowBase = r * s.cols;
      for (let c = 0; c < s.cols; c++) {
        const idx = rowBase + c;
        if (!s.filled[idx]) continue;
        const cx = s.minX + c * s.cell;
        g.rect(cx, cy, s.drawCell + 0.9, s.drawCell + 0.9);
        if (maskW) maskW.rect(cx, cy, s.drawCell + 0.9, s.drawCell + 0.9);
      }
    }
    g.rectMode(CORNER);
    if (maskW) maskW.rectMode(CORNER);
  } else {
  for (let r = r0; r < s.rows; r++) {
    const y = s.minY + r * s.cell;
    const rowBase = r * s.cols;
    for (let c = 0; c < s.cols; c++) {
      const idx = rowBase + c;
      if (!s.filled[idx]) continue;
      const x = s.minX + c * s.cell;
      g.rect(x, y, s.cell + 0.9, s.cell + 0.9);
      if (maskW) maskW.rect(x, y, s.cell + 0.9, s.cell + 0.9);
      }
    }
    }
  }

function post2SedimentDrawParticleGlyphs(s) {
  const g = s.g;
  g.noStroke();
  g.fill(0);
  g.textAlign(CENTER, CENTER);
  g.textSize(18 * layoutMarginScale);
  if (uiFont) g.textFont(uiFont);
  for (const p of s.particles) {
    g.text(p.ch, p.x, p.y);
  }
}

function post2SedimentApplySpeckExclusiveMask(p5, s, targets, rFinal, includeMaskWorld) {
  const g = s.g;
  const ctx = g.drawingContext;
  const maskImg = renderPost2SpeckExclusiveSedimentMask(p5, targets, rFinal);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  g.image(maskImg, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  if (includeMaskWorld && s.maskWorldG) {
    const ctxM = s.maskWorldG.drawingContext;
    ctxM.save();
    ctxM.globalCompositeOperation = 'destination-in';
    s.maskWorldG.image(maskImg, 0, 0);
    ctxM.globalCompositeOperation = 'source-over';
    ctxM.restore();
  }
}

/** Black tile floor only, masked (no falling glyphs). */
function renderPost2SedimentFloorOnly(p5, targets, rFinal) {
  if (!post2Sediment) return null;
  const s = post2Sediment;
  post2SedimentClearGAndMaskW(s);
  post2SedimentDrawFilledCells(s);
  post2SedimentApplySpeckExclusiveMask(p5, s, targets, rFinal, true);
  return s.g;
}

/** Falling glyphs only, masked (no tiles). */
function renderPost2SedimentGlyphsOnly(p5, targets, rFinal) {
  if (!post2Sediment) return null;
  const s = post2Sediment;
  post2SedimentClearG(s);
  post2SedimentDrawParticleGlyphs(s);
  post2SedimentApplySpeckExclusiveMask(p5, s, targets, rFinal, false);
  return s.g;
}

function renderPost2SedimentLayer(p5, targets, rFinal) {
  if (!post2Sediment) return null;
  const s = post2Sediment;
  post2SedimentClearGAndMaskW(s);
  post2SedimentDrawFilledCells(s);
  post2SedimentDrawParticleGlyphs(s);
  post2SedimentApplySpeckExclusiveMask(p5, s, targets, rFinal, true);
  return s.g;
}

function ensureSpeckLettersInitialized(labelCx, labelCy) {
  if (speckLetters) return;
  textSize(VENN_TEXT_SIZE * layoutMarginScale);
  textAlign(LEFT, CENTER);
  const chars = WORDS[0].split('');
  const widths = chars.map((c) => textWidth(c));
  const totalW = widths.reduce((a, b) => a + b, 0);
  let x = labelCx - totalW / 2;
  speckLetters = chars.map((ch, i) => {
    const w = widths[i];
    const cx = x + w / 2;
    x += w;
    return { ch, x: cx, y: labelCy };
  });
}

function drawSpeckLetters() {
  if (!speckLetters) return;
  textSize(VENN_TEXT_SIZE * layoutMarginScale);
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  for (const l of speckLetters) {
    text(l.ch, l.x, l.y);
  }
}

function isFrame4DraggableActive() {
  if (!ENABLE_SPECK_DRAG) return false;
  if (!galleryMode) return false;
  const f = (typeof window !== 'undefined' && window.__SPEC_GALLERY_FRAME__)
    ? Number(window.__SPEC_GALLERY_FRAME__)
    : 1;
  return f === 4 && frame4Ready;
}

function mousePressed() {
  if (mouseButton === RIGHT || mouseButton === 'right') return true;
  if (!isFrame4DraggableActive() || !speckLetters) return;
  const m = screenToWorld(mouseX, mouseY, frame4Cam);
  textSize(VENN_TEXT_SIZE * layoutMarginScale);
  const h = textAscent() + textDescent();

  // hit-test from top-most
  for (let i = speckLetters.length - 1; i >= 0; i--) {
    const l = speckLetters[i];
    const w = textWidth(l.ch);
    if (Math.abs(m.x - l.x) <= w * 0.7 && Math.abs(m.y - l.y) <= h * 0.7) {
      speckDragIdx = i;
      speckDragOff.x = m.x - l.x;
      speckDragOff.y = m.y - l.y;
      // bring to front
      const picked = speckLetters.splice(i, 1)[0];
      speckLetters.push(picked);
      speckDragIdx = speckLetters.length - 1;
      redraw();
      return;
    }
  }
}

function mouseDragged() {
  if (!isFrame4DraggableActive() || speckDragIdx < 0 || !speckLetters) return;
  const m = screenToWorld(mouseX, mouseY, frame4Cam);
  const l = speckLetters[speckDragIdx];

  textSize(VENN_TEXT_SIZE * layoutMarginScale);
  const w = textWidth(l.ch);
  const h = textAscent() + textDescent();
  const pad = Math.max(w, h) * 0.6 + 3;
  const r = Math.max(0, frame4SpeckCircle.r - pad);

  const nextX = m.x - speckDragOff.x;
  const nextY = m.y - speckDragOff.y;
  const clamped = clampPointToCircle(nextX, nextY, frame4SpeckCircle.x, frame4SpeckCircle.y, r);
  l.x = clamped.x;
  l.y = clamped.y;
  redraw();
}

function mouseReleased() {
  if (speckDragIdx >= 0) {
    speckDragIdx = -1;
    redraw();
  }
}

function distSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function pointInsideCircle(px, py, c, r) {
  const m = LABEL_MARGIN_PX * layoutMarginScale;
  return distSq(px, py, c.x, c.y) < (r - m) * (r - m);
}

function pointOutsideCircle(px, py, c, r) {
  const m = LABEL_MARGIN_PX * layoutMarginScale;
  return distSq(px, py, c.x, c.y) > (r + m) * (r + m);
}

function isExclusivePoint(px, py, i, centers, r) {
  if (!pointInsideCircle(px, py, centers[i], r)) return false;
  for (let k = 0; k < centers.length; k++) {
    if (k === i) continue;
    if (!pointOutsideCircle(px, py, centers[k], r)) return false;
  }
  return true;
}

/** Exclusive lobe for circle `i` using full `rFinal` disks (matches `isInsideSpeckExclusive` when i === 0). */
function isExclusiveRegionGeometric(px, py, i, centers, rFinal) {
  const r2 = rFinal * rFinal;
  for (let k = 0; k < centers.length; k++) {
    const d2 = distSq(px, py, centers[k].x, centers[k].y);
    if (k === i) {
      if (d2 > r2) return false;
    } else if (d2 <= r2) {
      return false;
    }
  }
  return true;
}

/**
 * Reader scan clip: same **non‑spectrum** exclusions as **`isExclusiveRegionGeometric(..., 2, ...)`** (other disks at **`rFinal`**),
 * but spectrum disk radius is **`rFinal + spectrumOutset`** so the bar can reach the **drawn ring** (outer isolated edge).
 */
function isSpectrumExclusiveReaderScanClip(px, py, centers, rFinal, spectrumOutset) {
  const o = Math.max(0, spectrumOutset);
  const c2 = centers[2];
  const rSpec2 = (rFinal + o) * (rFinal + o);
  const r2 = rFinal * rFinal;
  if (distSq(px, py, c2.x, c2.y) > rSpec2) return false;
  for (let k = 0; k < centers.length; k++) {
    if (k === 2) continue;
    if (distSq(px, py, centers[k].x, centers[k].y) <= r2) return false;
  }
  return true;
}

/** Half the Venn ring stroke in **world** units (matches **`scale(camZoom)`** + **`strokeWeight(SPECTRUM_READER_CLIP_VENN_RING_STROKE_LS * ls)`**). */
function spectrumReaderScanSpectrumRingOutsetWorld(ls, camZoom) {
  return (SPECTRUM_READER_CLIP_VENN_RING_STROKE_LS * ls) / (2 * Math.max(camZoom, 1e-4));
}

/** Speck ∩ spectrum with full `rFinal` disks, excluding the inspect (1) disk (no triple-overlap fill). */
function isSpeckSpectrumOverlapGeometric(px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = distSq(px, py, centers[0].x, centers[0].y);
  const d1 = distSq(px, py, centers[1].x, centers[1].y);
  const d2 = distSq(px, py, centers[2].x, centers[2].y);
  return d0 <= r2 && d2 <= r2 && d1 > r2;
}

/** Inspect ∩ spectrum with full `rFinal` disks, excluding the speck (0) disk (pair-phrase lobe, no triple overlap). */
function isInspectSpectrumOverlapGeometric(px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = distSq(px, py, centers[0].x, centers[0].y);
  const d1 = distSq(px, py, centers[1].x, centers[1].y);
  const d2 = distSq(px, py, centers[2].x, centers[2].y);
  return d1 <= r2 && d2 <= r2 && d0 > r2;
}

/** Speck ∩ inspect with full `rFinal` disks, excluding the spectrum (2) disk (space-phrase lobe, no triple overlap). */
function isSpeckInspectOverlapGeometric(px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = distSq(px, py, centers[0].x, centers[0].y);
  const d1 = distSq(px, py, centers[1].x, centers[1].y);
  const d2 = distSq(px, py, centers[2].x, centers[2].y);
  return d0 <= r2 && d1 <= r2 && d2 > r2;
}

function rotatedRectFits(px, py, theta, w, h, i, centers, r) {
  // Test corners (and midpoints) of the rotated text box.
  const hw = w / 2;
  const hh = h / 2;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const pts = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
    { x: 0, y: -hh },
    { x: 0, y: hh },
    { x: -hw, y: 0 },
    { x: hw, y: 0 },
  ];
  for (const p of pts) {
    const rx = px + p.x * c - p.y * s;
    const ry = py + p.x * s + p.y * c;
    if (!isExclusivePoint(rx, ry, i, centers, r)) return false;
  }
  return true;
}

function normalizeAnglePi(a) {
  // Normalize to [-PI, PI]
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function makeTextUpright(theta) {
  // Avoid upside-down labels: keep within [-PI/2, PI/2] (allowing tilt).
  let t = normalizeAnglePi(theta);
  if (t > Math.PI / 2) t -= Math.PI;
  if (t < -Math.PI / 2) t += Math.PI;
  return t;
}

function computeExclusiveLabelLayout(centers, r, words, textPx) {
  // Returns [{dx, dy, theta}] offsets from circle center in final layout.
  textSize(textPx);
  const h = textAscent() + textDescent();
  const layouts = [];

  for (let i = 0; i < 3; i++) {
    const ci = centers[i];
    const others = centers.filter((_, idx) => idx !== i);

    // Outward direction away from the other two centers
    let dx = 0;
    let dy = 0;
    for (const c of others) {
      const vx = ci.x - c.x;
      const vy = ci.y - c.y;
      const m = Math.hypot(vx, vy) || 1;
      dx += vx / m;
      dy += vy / m;
    }
    const dm = Math.hypot(dx, dy) || 1;
    dx /= dm;
    dy /= dm;

    const baseTheta = Math.atan2(dy, dx);
    const w = textWidth(words[i]);

    let best = null;
    const fixed = computeExclusiveLabelLayout.fixedThetas?.[i];
    // For the two bottom words: make the label tangent to the circle edge.
    // For the top word: keep it upright.
    const thetaCandidates = (typeof fixed === 'number')
      ? [fixed]
      : [makeTextUpright(baseTheta + Math.PI / 2), makeTextUpright(baseTheta - Math.PI / 2)];

    const minFrac = (i === 0) ? LABEL_MIN_DIST_FRAC_TOP : LABEL_MIN_DIST_FRAC_BOTTOM;
    const maxFrac = (i === 0) ? LABEL_MAX_DIST_FRAC_TOP : LABEL_MAX_DIST_FRAC_BOTTOM;

    for (let frac = maxFrac; frac >= minFrac; frac -= LABEL_DIST_STEP) {
      const px = ci.x + dx * (frac * r);
      const py = ci.y + dy * (frac * r);
      if (!isExclusivePoint(px, py, i, centers, r)) continue;
      for (const th of thetaCandidates) {
        if (rotatedRectFits(px, py, th, w, h, i, centers, r)) {
          best = { dx: px - ci.x, dy: py - ci.y, theta: th };
          break;
        }
      }
      if (best) break;
    }

    // Fallbacks:
    // 1) If we couldn't fit the full rotated bbox, at least place the word center in an exclusive point.
    if (!best) {
      for (let frac = maxFrac; frac >= minFrac; frac -= LABEL_DIST_STEP) {
        const px = ci.x + dx * (frac * r);
        const py = ci.y + dy * (frac * r);
        if (isExclusivePoint(px, py, i, centers, r)) {
          const th = (typeof fixed === 'number') ? fixed : makeTextUpright(baseTheta + Math.PI / 2);
          best = { dx: px - ci.x, dy: py - ci.y, theta: th };
          break;
        }
      }
    }
    // 2) Last resort: center (if exclusive region is too small / nonexistent)
    layouts.push(best || { dx: 0, dy: 0, theta: 0 });
  }

  return layouts;
}

function getFrame5SpeckFx() {
  if (!frame5AfterglowStartMs) return null;
  const isFlashFrame = frameCount === frame5FlashFrame;
  const dt = millis() - frame5AfterglowStartMs;
  const flashA = isFlashFrame ? 255 : 0;
  const glowA = Math.max(0, 46 * Math.exp(-dt / 3200));
  if (flashA <= 0 && glowA <= 0.4) return null;
  return { flashA, glowA };
}

function draw() {
  background(255);
  spectrumReaderScanBarsScreen = null;
  if (
    typeof window !== 'undefined' &&
    window.__SPEC_LOGO_STILL__ === true
  ) {
    ensureSpecLogoLoaded();
  }

  layoutMarginScale = width / LAYOUT_REF_W;
  const ls = layoutMarginScale;

  const cx = width / 2;
  const cy = height / 2;
  const r = 120 * ls;
  const circleSize = r * 2;

  const galleryMaxFrame = (typeof window !== 'undefined' && window.__SPEC_GALLERY_MAX_FRAME)
    ? Number(window.__SPEC_GALLERY_MAX_FRAME)
    : 3;
  const galleryFrame = galleryMode
    ? Math.max(1, Math.min(galleryMaxFrame, (typeof window !== 'undefined' && window.__SPEC_GALLERY_FRAME__) ? Number(window.__SPEC_GALLERY_FRAME__) : 1))
    : 0;
  const galleryExtended = galleryMode && typeof window !== 'undefined' && window.__SPEC_GALLERY_EXTENDED__ === true;

  // Original 's' position in "spec" (centered at cx, cy) — keep s here before adding words
  const specTextPx = 44 * ls;
  textSize(specTextPx);
  const twSpec = textWidth('spec');
  const twS = textWidth('s');
  const sCenterX = cx - twSpec / 2 + twS / 2;
  const sLeftX = sCenterX - twS / 2; // left edge so 's' aligns when drawing words
  // Center the 3-word block by its true bounds:
  // left-most = left edge of "in" in inspect (since inspect extends left of the shared 's')
  // right-most = max(right edges of speck / spectrum / inspect-suffix)
  const wSpeck = textWidth('speck');
  const wSpectrum = textWidth('spectrum');
  const wIn = textWidth('in');
  const wPect = textWidth('pect');
  const wInspectRight = twS + wPect; // 's' anchored at xLeft, then "pect" extends right
  const rightExtent = Math.max(wSpeck, wSpectrum, wInspectRight);
  // Solve: center = xLeft + (rightExtent - wIn)/2  =>  xLeft = cx - (rightExtent - wIn)/2
  const centeredLeftX = cx - (rightExtent - wIn) / 2;

  const gapY = sGap * ls;
  const stackNudge = WORD_STACK_VISUAL_Y * ls;
  const linePositions = [
    { x: sCenterX, y: cy + stackNudge - gapY },
    { x: sCenterX, y: cy + stackNudge },
    { x: sCenterX, y: cy + stackNudge + gapY },
  ];

  function vennTargetsFor(offset) {
    return [
      { x: cx, y: cy - offset },
      { x: cx - offset * 0.9, y: cy + offset * 0.6 },
      { x: cx + offset * 0.9, y: cy + offset * 0.6 },
    ];
  }

  const vennOff = VENN_OFFSET * ls;
  const vennTargetsBase = vennTargetsFor(vennOff);
  const vennTargetsSpread = vennTargetsFor(vennOff * 1.35); // reduce triple-overlap region
  const vennD = VENN_SIZE_SCALED * ls;
  const vennTextPx = VENN_TEXT_SIZE * ls;
  // Frame mapping:
  // 1: base, 2: spread, 3: motion 1->2->zoom (no speck-specific physics effects)
  const vennTargets = (galleryMode && (galleryFrame === 2 || (galleryFrame === 3 && galleryExtended)))
    ? vennTargetsSpread
    : vennTargetsBase;
  // Black & white palette (grayscale). Same fill so overlaps read slightly darker.
  const vennColors = [
    [255, 255, 255, 255],
    [255, 255, 255, 255],
    [255, 255, 255, 255],
  ];

  if (galleryMode) {
    const prevGalleryFrame = galleryLastFrame;
    // Always render the final Venn state; frames 3/4 are the zoom + motion.
    const rFinal = vennD / 2;
    const key = `${rFinal}|${vennTextPx}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, vennTextPx);
    }

    const finalLayouts = cachedFinalLayouts;

    // --- camera for frames 1/2/3 ---
    // Zoom/motion target is based on the SPREAD layout (the "speck" circle in frame 2/3).
    const speckCenterSpread = vennTargetsSpread[0];
    const zoom2 = 2.35;
    // Put the speck circle in the bottom half (around 75% down).
    const desiredSpeckCenterY = height * 0.80;
    const screen2Y = desiredSpeckCenterY;

    // Frame 1 camera (identity)
    const cam1 = { x: cx, y: cy, zoom: 1, screenY: cy };
    // Frame 2 camera (zoomed-in on speck circle)
    const cam2 = { x: speckCenterSpread.x, y: speckCenterSpread.y, zoom: zoom2, screenY: screen2Y };

    // Frame 3: transition motion (1 -> 2 -> zoom)
    let camX = (galleryFrame === 3 && galleryExtended) ? cam2.x : cam1.x;
    let camY = (galleryFrame === 3 && galleryExtended) ? cam2.y : cam1.y;
    let camZoom = (galleryFrame === 3 && galleryExtended) ? cam2.zoom : cam1.zoom;
    let screenY = (galleryFrame === 3 && galleryExtended) ? cam2.screenY : cam1.screenY;

    if (galleryFrame === 3 && !galleryExtended) {
      if (typeof window !== 'undefined') {
        window.__SPEC_FRAME4_END__ = null;
        window.__SPEC_FRAME5_END__ = null;
      }
      const forceRestart = (typeof window !== 'undefined' && window.__SPEC_FORCE_MOTION_RESTART__);
      if (galleryLastFrame !== 3 || forceRestart) {
        galleryAnimStartMs = millis();
        if (typeof window !== 'undefined') window.__SPEC_FORCE_MOTION_RESTART__ = false;
        loop();
      }
      const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
      const liveMd23 =
        motionSegment === '23' &&
        typeof window !== 'undefined' &&
        window.__SPEC_LIVE_MOTIONS_DESIGN__ === true;
      const liveMd27 = liveMd23 && specLiveMotions27();
      if ((galleryLastFrame !== 3 || forceRestart) && liveMd23) {
        post2Sediment = null;
        galleryLive23OutroStartMs = 0;
      }
      const elapsed = millis() - galleryAnimStartMs;
      const gallery15ZoomMs = 2000;
      const gallery15Seg23PhraseMs = 950;
      const motionZoomedInStart =
        typeof window !== 'undefined' && window.__SPEC_MOTION_ZOOMED_IN_START__ === true;
      const seg23SkipZoom = motionSegment === '23' && motionZoomedInStart;
      const seg23ZoomDone =
        motionSegment === '23' && (seg23SkipZoom || elapsed >= gallery15ZoomMs);
      const seg23Post2FadeElapsed = Math.max(
        0,
        motionSegment === '23' ? (seg23SkipZoom ? elapsed : elapsed - gallery15ZoomMs) : 0,
      );
      /** Gallery 2.7 slide 2 (`motionZoomedIn=1`): POST2 at full opacity; no fade-in/out; loop when drain ends. */
      const seg23SkipPost2Fades = liveMd27 && seg23SkipZoom;
      let t;
      let done;
      let post2BelowSpeckAlpha = 0;
      if (motionSegment === '12') {
        const p = Math.max(0, Math.min(1, elapsed / gallery15ZoomMs));
        t = 0.45 * p;
        done = p >= 1;
      } else if (motionSegment === '23') {
        const pZoom = seg23SkipZoom ? 1 : Math.max(0, Math.min(1, elapsed / gallery15ZoomMs));
        t = 0.45 + 0.55 * pZoom;
        if (liveMd23) {
          post2BelowSpeckAlpha = 0;
          done = false;
        } else {
          const phraseU = seg23SkipZoom
            ? Math.max(0, Math.min(1, elapsed / gallery15Seg23PhraseMs))
            : elapsed <= gallery15ZoomMs
              ? 0
              : Math.max(0, Math.min(1, (elapsed - gallery15ZoomMs) / gallery15Seg23PhraseMs));
          post2BelowSpeckAlpha = 255 * smootherstep(phraseU);
          done = seg23SkipZoom
            ? elapsed >= gallery15Seg23PhraseMs
            : elapsed >= gallery15ZoomMs + gallery15Seg23PhraseMs;
        }
      } else {
        const p = Math.max(0, Math.min(1, elapsed / gallery15ZoomMs));
        t = p;
        done = p >= 1;
      }

      const a = Math.max(0, Math.min(1, t / 0.45));
      const easeA = easeInOutCubic(a);
      const curOffset = lerp(vennOff, vennOff * 1.35, easeA);
      const curTargets = vennTargetsFor(curOffset);

      const b = Math.max(0, Math.min(1, (t - 0.45) / 0.55));
      const easeB = easeInOutCubic(b);
      const curSpeck = curTargets[0];
      camX = lerp(cam1.x, curSpeck.x, easeB);
      camY = lerp(cam1.y, curSpeck.y, easeB);
      camZoom = lerp(1, zoom2, easeB);
      screenY = lerp(cy, desiredSpeckCenterY, easeB);

      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      const curLayouts = computeExclusiveLabelLayout(curTargets, rFinal, WORDS, vennTextPx);

      const g2Slide23Shell =
        motionSegment === '23' &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true;
      const g2Slide23VennOutlineA = g2Slide23Shell ? 255 : 220;

      if (liveMd23 && seg23ZoomDone) {
        ensurePost2Sediment(this, curTargets, rFinal, ls);
        const s25 = post2Sediment;
        if (s25?.redCoverageSediment && s25.done && !s25.draining && !s25.drained) {
          if (LIVE25_DRAIN_HOLD_FRAMES <= 0) {
            s25.draining = true;
            const ev = s25.spawnEveryMs != null ? s25.spawnEveryMs : POST2_SEDIMENT_SPAWN_EVERY_MS;
            s25.lastDrainMs = millis() - ev;
            if (s25.liveMotions27) {
              s25.particles = [];
              s25.drainGlyphAccumMs = 0;
              s25.fillSpawnAccumMs = 0;
            }
          } else {
            s25.drainHoldFrames = (s25.drainHoldFrames || 0) + 1;
            if (s25.drainHoldFrames >= LIVE25_DRAIN_HOLD_FRAMES) {
              s25.draining = true;
              const ev = s25.spawnEveryMs != null ? s25.spawnEveryMs : POST2_SEDIMENT_SPAWN_EVERY_MS;
              s25.lastDrainMs = millis() - ev;
              if (s25.liveMotions27) {
                s25.particles = [];
                s25.drainGlyphAccumMs = 0;
                s25.fillSpawnAccumMs = 0;
              }
            }
          }
        }
        stepPost2Sediment(this, curTargets, rFinal);
      }

      if (motionSegment === '23' && liveMd23) {
        const zoomDone = seg23ZoomDone;
        const fillComplete = !!post2Sediment?.done;
        const drainComplete = !post2Sediment || post2Sediment.drained;
        if (
          liveMd27 &&
          !seg23SkipPost2Fades &&
          post2Sediment?.redCoverageSediment &&
          post2Sediment.drained
        ) {
          if (!galleryLive23OutroStartMs) galleryLive23OutroStartMs = millis();
        } else if (!(liveMd27 && post2Sediment?.drained)) {
          galleryLive23OutroStartMs = 0;
        }
        if (liveMd27) {
          const outroDone = seg23SkipPost2Fades
            ? true
            : galleryLive23OutroStartMs > 0 &&
              millis() - galleryLive23OutroStartMs >= LIVE25_POST2_FADE_OUT_MS;
          done = zoomDone && fillComplete && drainComplete && outroDone;
        } else {
          done = zoomDone && fillComplete && drainComplete;
        }
      }

      let seg23Post2Alpha = 255;
      let seg23ShowPost2 = false;
      if (motionSegment === '23' && POST2_SHOW_DESCRIPTION && POST2_DESCRIPTION) {
        seg23ShowPost2 = liveMd23
          ? seg23ZoomDone
          : post2BelowSpeckAlpha > 0;
        seg23Post2Alpha = liveMd23 ? 255 : post2BelowSpeckAlpha;
        if (liveMd23 && seg23ZoomDone && !seg23SkipPost2Fades) {
          const tIn = Math.max(0, Math.min(1, seg23Post2FadeElapsed / LIVE25_POST2_FADE_IN_MS));
          seg23Post2Alpha = 255 * smootherstep(tIn);
        }
        if (
          liveMd23 &&
          !liveMd27 &&
          post2Sediment?.redCoverageSediment &&
          post2Sediment.total > 0 &&
          (post2Sediment.draining || post2Sediment.drained)
        ) {
          const filledN = post2Sediment.total - post2Sediment.remaining;
          const u = Math.max(0, Math.min(1, filledN / post2Sediment.total));
          seg23Post2Alpha *= smootherstep(u);
        }
        if (liveMd27 && !seg23SkipPost2Fades && galleryLive23OutroStartMs > 0) {
          const outroU = Math.max(
            0,
            Math.min(1, (millis() - galleryLive23OutroStartMs) / LIVE25_POST2_FADE_OUT_MS),
          );
          seg23Post2Alpha *= Math.max(0, 1 - smootherstep(outroU));
        }
      }

      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);

      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        noStroke();
        noFill();
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(0, g2Slide23VennOutlineA);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      // Live motions: floor → POST2 (2.7: difference vs black tiles) → glyph rain on top.
      if (liveMd23 && seg23ZoomDone) {
        const floorG = renderPost2SedimentFloorOnly(this, curTargets, rFinal);
        if (floorG) {
          noTint();
          image(floorG, 0, 0);
        }
        if (
          seg23ShowPost2 &&
          POST2_SHOW_DESCRIPTION &&
          POST2_DESCRIPTION
        ) {
          const p2wx = curTargets[0].x + curLayouts[0].dx;
          const p2wy = curTargets[0].y + curLayouts[0].dy;
          textAlign(CENTER, CENTER);
          textSize((20 * ls) / camZoom);
          textLeading((20 * ls) / camZoom);
          noStroke();
          if (liveMd27) {
            blendMode(DIFFERENCE);
            fill(255, seg23Post2Alpha);
            text(POST2_DESCRIPTION, p2wx, p2wy + (90 * ls) / camZoom);
            blendMode(BLEND);
          } else {
            fill(255, seg23Post2Alpha);
            text(POST2_DESCRIPTION, p2wx, p2wy + (90 * ls) / camZoom);
          }
        }
        const glyphG = renderPost2SedimentGlyphsOnly(this, curTargets, rFinal);
        if (glyphG) {
          noTint();
          image(glyphG, 0, 0);
        }
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        DEBUG_G2_SLIDE1_FILL_ALPHA > 0 &&
        motionSegment === '23' &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        debugG2DrawExclusiveFillGrid(
          (wx, wy) => isInsideSpeckExclusive(wx, wy, curTargets, rFinal),
          curTargets,
          rFinal,
          ls,
          0,
          DEBUG_G2_SLIDE1_FILL_ALPHA,
        );
      }

      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        textAlign(CENTER, CENTER);
        textSize(vennTextPx);
        noStroke();
        push();
        translate(wx, wy);
        rotate(curLayouts[i].theta);
        // 2.7 slide 1: draw speck after sediment with difference + white so glyphs invert where black fill covers them.
        if (liveMd27 && i === 0 && seg23ZoomDone) {
          blendMode(DIFFERENCE);
          fill(255);
        text(WORDS[i], 0, 0);
          blendMode(BLEND);
        } else {
          fill(0);
          text(WORDS[i], 0, 0);
        }
        pop();
      }
      pop();

      if (POST2_SHOW_DESCRIPTION && POST2_DESCRIPTION && motionSegment === '23') {
        const speckWx = curTargets[0].x + curLayouts[0].dx;
        const speckWy = curTargets[0].y + curLayouts[0].dy;
        const speckSx = cx + (speckWx - camX) * camZoom;
        const speckSy = screenY + (speckWy - camY) * camZoom;
        // liveMd23 POST2 is drawn inside the camera stack before sediment (see above).
        if (seg23ShowPost2 && !liveMd23) {
          push();
          resetMatrix();
          textAlign(CENTER, CENTER);
          textSize(20 * ls);
          textLeading(20 * ls);
          if (specGallery1Or15InkTypography()) {
            noStroke();
            fill(0, seg23Post2Alpha);
          } else {
            stroke(0, seg23Post2Alpha);
            strokeWeight(Math.max(1.2, 2 * ls));
            fill(255, seg23Post2Alpha);
          }
          text(POST2_DESCRIPTION, speckSx, speckSy + 90 * ls);
          pop();
        }
      }

      galleryLastFrame = galleryFrame;
      if (specLiveMotionsDesign() && motionSegment === '23' && done) {
        galleryAnimStartMs = millis();
        galleryLive23OutroStartMs = 0;
        post2Sediment = null;
        loop();
      } else if (done) {
        noLoop();
      }
      return;
    }

    // Gallery 1 only: frame 4 = from zoomed speck, center graph on canvas, rotate ~60° left about graph centroid;
    // phrases sit in speck∩spectrum but outside inspect (no triple overlap), drawn horizontal in screen space.
    if (galleryFrame === 4 && !galleryExtended) {
      const overlapStill = typeof window !== 'undefined' && window.__SPEC_OVERLAP_STILL__ === true;
      const spectrumStill = typeof window !== 'undefined' && window.__SPEC_SPECTRUM_STILL__ === true;
      const motionSpectrumSettled =
        typeof window !== 'undefined' && window.__SPEC_MOTION_SPECTRUM_SETTLED__ === true;
      const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
      const segment34 = motionSegment === '34';
      const segment45 = motionSegment === '45';
      const spectrumMode = spectrumStill || segment45;
      const gallery15F4 = segment34 || segment45;
      const G34_ROT_MS = 1200;
      const G34_PHRASE_FADE_MS = 500;
      const G45_ROT_MS = 1200;
      const seg34Live = segment34 && !overlapStill && !spectrumStill;
      const seg45Live = segment45 && !overlapStill && !spectrumStill;
      /** Hub **2.7** only: `45` live starts at Still 05 orientation (no rotation lerp); phrase fade only. */
      const seg45MotionSpectrumSettled =
        segment45 && specLiveMotions27() && motionSpectrumSettled && seg45Live;
      /** Item **2.5** slide 3 and hub **2.7** slides **4–5** (live `45`). */
      const seg45SpectrumReaderFx = specLiveMotionsDesign() && segment45 && seg45Live;
      const targets = vennTargetsSpread;
      const c0 = targets[0];
      const c1 = targets[1];
      const c2 = targets[2];
      const graphCX = (c0.x + c1.x + c2.x) / 3;
      const graphCY = (c0.y + c1.y + c2.y) / 3;
      const dx = c2.x - c0.x;
      const dy = c2.y - c0.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const midSpX = (c0.x + c2.x) / 2;
      const midSpY = (c0.y + c2.y) / 2;
      const chordHalf = Math.sqrt(Math.max(0.0001, rFinal * rFinal - (d * d) / 4));
      const rSpeck = rFinal;
      // speck ∩ spectrum minus inspect interior: centroid via grid sample (centers phrases in the almond).
      const inSpeckSpectrumOnlyLobe = (px, py) => {
        const d0 = Math.sqrt((px - c0.x) ** 2 + (py - c0.y) ** 2);
        const d1 = Math.sqrt((px - c1.x) ** 2 + (py - c1.y) ** 2);
        const d2 = Math.sqrt((px - c2.x) ** 2 + (py - c2.y) ** 2);
        return d0 <= rSpeck * 0.99 && d2 <= rSpeck * 0.99 && d1 >= rSpeck * 1.02;
      };
      let phraseWx = midSpX;
      let phraseWy = midSpY;
      let lobeRadiusWorld = Math.max(chordHalf * 0.92, 16 * ls);
      {
        const pad = rSpeck * 1.05;
        const bx0 = Math.min(c0.x, c1.x, c2.x) - pad;
        const bx1 = Math.max(c0.x, c1.x, c2.x) + pad;
        const by0 = Math.min(c0.y, c1.y, c2.y) - pad;
        const by1 = Math.max(c0.y, c1.y, c2.y) + pad;
        const gridN = 22;
        let accX = 0;
        let accY = 0;
        let nHit = 0;
        for (let gi = 0; gi <= gridN; gi++) {
          for (let gj = 0; gj <= gridN; gj++) {
            const px = bx0 + ((bx1 - bx0) * gi) / gridN;
            const py = by0 + ((by1 - by0) * gj) / gridN;
            if (inSpeckSpectrumOnlyLobe(px, py)) {
              accX += px;
              accY += py;
              nHit++;
            }
          }
        }
        if (nHit > 0) {
          phraseWx = accX / nHit;
          phraseWy = accY / nHit;
          let maxD = 0;
          for (let gi = 0; gi <= gridN; gi++) {
            for (let gj = 0; gj <= gridN; gj++) {
              const px = bx0 + ((bx1 - bx0) * gi) / gridN;
              const py = by0 + ((by1 - by0) * gj) / gridN;
              if (inSpeckSpectrumOnlyLobe(px, py)) {
                const dd = Math.sqrt((px - phraseWx) ** 2 + (py - phraseWy) ** 2);
                if (dd > maxD) maxD = dd;
              }
            }
          }
          lobeRadiusWorld = Math.max(maxD * 1.12, 14 * ls);
        }
      }

      if (galleryLastFrame !== 4) {
        if (!overlapStill && !spectrumStill) galleryAnimStartMs = millis();
        loop();
      }
      let frame4Elapsed = 0;
      let seg34OverlapPhraseAlpha = 255;
      let seg45SpectrumPhraseAlpha = 255;
      let tAnim;
      let easeAnim;
      if (overlapStill || spectrumStill) {
        tAnim = 1;
        easeAnim = 1;
      } else {
        frame4Elapsed = millis() - galleryAnimStartMs;
        if (seg34Live) {
          const rotP = Math.min(1, frame4Elapsed / G34_ROT_MS);
          easeAnim = easeInOutCubic(rotP);
          tAnim = Math.min(1, frame4Elapsed / (G34_ROT_MS + G34_PHRASE_FADE_MS));
          const fadeU =
            frame4Elapsed <= G34_ROT_MS
              ? 0
              : Math.max(0, Math.min(1, (frame4Elapsed - G34_ROT_MS) / G34_PHRASE_FADE_MS));
          seg34OverlapPhraseAlpha = 255 * smootherstep(fadeU);
        } else if (seg45Live) {
          if (seg45MotionSpectrumSettled) {
            easeAnim = 1;
            tAnim = Math.min(1, frame4Elapsed / SPECTRUM_STILL_PHRASE_FADE_MS);
            const fadeU = Math.max(
              0,
              Math.min(1, frame4Elapsed / SPECTRUM_STILL_PHRASE_FADE_MS),
            );
            seg45SpectrumPhraseAlpha = 255 * smootherstep(fadeU);
          } else {
            const rotP = Math.min(1, frame4Elapsed / G45_ROT_MS);
            easeAnim = easeInOutCubic(rotP);
            tAnim = Math.min(1, frame4Elapsed / (G45_ROT_MS + SPECTRUM_STILL_PHRASE_FADE_MS));
            const fadeU =
              frame4Elapsed <= G45_ROT_MS
                ? 0
                : Math.max(
                    0,
                    Math.min(
                      1,
                      (frame4Elapsed - G45_ROT_MS) / SPECTRUM_STILL_PHRASE_FADE_MS,
                    ),
                  );
            seg45SpectrumPhraseAlpha = 255 * smootherstep(fadeU);
          }
        } else {
          tAnim = Math.max(0, Math.min(1, frame4Elapsed / 1200));
          easeAnim = easeInOutCubic(tAnim);
        }
      }
      const zoom2 = 2.35;
      const desiredSpeckCenterY = height * 0.75;
      const cam2 = { x: targets[0].x, y: targets[0].y, zoom: zoom2, screenY: desiredSpeckCenterY };
      // p5: positive rotate = CW; “60° left” = CCW
      const rotEnd = (-60 * Math.PI) / 180;
      const angle = rotEnd * easeAnim;
      // Zoom so the phrase lobe (~2 * lobeRadiusWorld across) fills more of the shorter canvas side (larger type).
      const fitSideFrac = 0.8;
      const zoomTarget = Math.min(
        6.6,
        Math.max(zoom2 + 0.4, (Math.min(width, height) * fitSideFrac) / Math.max(2 * lobeRadiusWorld, 18 * ls)),
      );
      let camZoom = lerp(zoom2, zoomTarget, easeAnim);
      // Camera follows the phrase-lobe centroid in *rotated* world space so that point stays at screen center.
      const phraseRotAt = (a) => {
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const ox = phraseWx - graphCX;
        const oy = phraseWy - graphCY;
        return {
          x: graphCX + ca * ox - sa * oy,
          y: graphCY + sa * ox + ca * oy,
        };
      };
      const pr = phraseRotAt(angle);
      let camX = lerp(cam2.x, pr.x, easeAnim);
      let camY = lerp(cam2.y, pr.y, easeAnim);
      let screenY = lerp(cam2.screenY, cy, easeAnim);

      const rotWorldToScreen = (wx, wy) => {
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const ox = wx - graphCX;
        const oy = wy - graphCY;
        const rx = graphCX + ca * ox - sa * oy;
        const ry = graphCY + sa * ox + ca * oy;
        return {
          x: (rx - camX) * camZoom + cx,
          y: (ry - camY) * camZoom + screenY,
        };
      };

      // Phrases use the *end* camera/zoom/angle only so size/position do not jitter while motion eases.
      const anglePh = rotEnd;
      const zoomPh = zoomTarget;
      const prPh = phraseRotAt(anglePh);
      const camXPh = prPh.x;
      const camYPh = prPh.y;
      const screenYPh = cy;
      const screenToUnrotWorldPhrase = (sx, sy) => {
        const rx = (sx - cx) / zoomPh + camXPh;
        const ry = (sy - screenYPh) / zoomPh + camYPh;
        const ca = Math.cos(anglePh);
        const sa = Math.sin(anglePh);
        const ddx = rx - graphCX;
        const ddy = ry - graphCY;
        const ox = ca * ddx + sa * ddy;
        const oy = -sa * ddx + ca * ddy;
        return { x: graphCX + ox, y: graphCY + oy };
      };

      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      const curLayouts = computeExclusiveLabelLayout(targets, rFinal, WORDS, vennTextPx);
      let sceneAngle = angle;
      if (spectrumMode) {
        // Rotate whole graphic so "spectrum" is parallel to canvas.
        const sceneAngleTarget = -curLayouts[2].theta;
        const spectrumWx = targets[2].x + curLayouts[2].dx;
        const spectrumWy = targets[2].y + curLayouts[2].dy;
        const ca = Math.cos(sceneAngleTarget);
        const sa = Math.sin(sceneAngleTarget);
        const ox = spectrumWx - graphCX;
        const oy = spectrumWy - graphCY;
        const camXTarget = graphCX + ca * ox - sa * oy;
        const camYTarget = graphCY + sa * ox + ca * oy;
        if (segment45) {
          // Live motion 4: start at Still 04 endpoint, transition to Still 05 endpoint.
          const rotT45 = seg45MotionSpectrumSettled
            ? 1
            : seg45Live
              ? Math.min(1, frame4Elapsed / G45_ROT_MS)
              : tAnim;
          const e45 = easeInOutCubic(rotT45);
          const prStart = phraseRotAt(rotEnd);
          sceneAngle = lerp(rotEnd, sceneAngleTarget, e45);
          camZoom = zoomTarget;
          screenY = cy;
          camX = lerp(prStart.x, camXTarget, e45);
          camY = lerp(prStart.y, camYTarget, e45);
        } else {
          sceneAngle = sceneAngleTarget;
          camX = camXTarget;
          camY = camYTarget;
        }
      }

      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);
      translate(graphCX, graphCY);
      rotate(sceneAngle);
      translate(-graphCX, -graphCY);

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        noStroke();
        noFill();
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(0, specGallery2Shell() ? 255 : 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        segment34 &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        const padG = rFinal * 1.05;
        const gx0 = Math.min(c0.x, c1.x, c2.x) - padG;
        const gx1 = Math.max(c0.x, c1.x, c2.x) + padG;
        const gy0 = Math.min(c0.y, c1.y, c2.y) - padG;
        const gy1 = Math.max(c0.y, c1.y, c2.y) + padG;
        debugG2DrawFillGridWorldRect(
          (wx, wy) => isSpeckSpectrumOverlapGeometric(wx, wy, targets, rFinal),
          gx0,
          gx1,
          gy0,
          gy1,
          rFinal,
          ls,
        );
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        segment45 &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        debugG2DrawExclusiveFillGrid(
          (wx, wy) => isExclusiveRegionGeometric(wx, wy, 2, targets, rFinal),
          targets,
          rFinal,
          ls,
          2,
          DEBUG_G2_SLIDE45_FILL_ALPHA,
        );
      }

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        if (seg45SpectrumReaderFx && i === 2) {
          drawSeg45SpectrumReaderSpectrumLabel(
            targets,
            rFinal,
            ls,
            wx,
            wy,
            curLayouts[i].theta,
            vennTextPx,
            WORDS[2],
            {
              cx,
              screenY,
              camZoom,
              camX,
              camY,
              graphCX,
              graphCY,
              sceneAngle,
            },
          );
        } else {
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(vennTextPx);
        noStroke();
        push();
        translate(wx, wy);
        rotate(curLayouts[i].theta);
        text(WORDS[i], 0, 0);
        pop();
        }
      }

      pop();

      // Gallery 1.5 (34/45): phrases visible from frame 0, full opacity, no fade-out.
      const phraseFadeT0 = gallery15F4 ? 0 : 0.64;
      if (tAnim > phraseFadeT0 || gallery15F4) {
        const u = gallery15F4
          ? 1
          : Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = gallery15F4 ? 1 : smootherstep(u);
        if (segment34 && seg34Live && frame4Elapsed < G34_ROT_MS * 0.5) {
          const speckWx = targets[0].x + curLayouts[0].dx;
          const speckWy = targets[0].y + curLayouts[0].dy;
          const ca = Math.cos(sceneAngle);
          const sa = Math.sin(sceneAngle);
          const ox = speckWx - graphCX;
          const oy = speckWy - graphCY;
          const speckSx = cx + ((graphCX + ca * ox - sa * oy) - camX) * camZoom;
          const speckSy = screenY + ((graphCY + sa * ox + ca * oy) - camY) * camZoom;
          const post2Ty = speckSy + 90 * ls;
          const speckLabelAngle = sceneAngle + curLayouts[0].theta;
          push();
          resetMatrix();
          translate(speckSx, post2Ty);
          rotate(speckLabelAngle);
          textAlign(CENTER, CENTER);
          textSize(20 * ls);
          textLeading(20 * ls);
          if (specGallery1Or15InkTypography()) {
            noStroke();
            fill(0);
          } else {
            stroke(0);
            strokeWeight(Math.max(1.2, 2 * ls));
            fill(255);
          }
          text(POST2_DESCRIPTION, 0, 0);
          pop();
        } else {
        const useSpectrumPhrases =
          spectrumStill ||
          (segment45 && (!seg45Live || frame4Elapsed >= G45_ROT_MS || seg45MotionSpectrumSettled));
        const phrases = useSpectrumPhrases ? SPECTRUM_STILL_PHRASES : SPECK_SPECTRUM_OVERLAP_PHRASES;
        const spectrumLabelToPhraseGap = 74 * ls; // match Still 03 speck->phrase gap
        const baseScr = { x: cx, y: cy };
        const padScr = Math.max(3, 4 * ls);
        const lineLead = 1.22;
        const blockCornersInLobe = (sizeScr, ctrX, ctrY) => {
          textSize(sizeScr);
          const lineStep = sizeScr * lineLead;
          let maxTw = 0;
          for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
          const halfW = maxTw / 2 + padScr;
          const halfH = (phrases.length * lineStep) / 2 + padScr;
          const xs = [-halfW, 0, halfW, -halfW, halfW, -halfW, 0, halfW];
          const ys = [-halfH, -halfH, -halfH, 0, 0, halfH, halfH, halfH];
          for (let k = 0; k < xs.length; k++) {
            const w = screenToUnrotWorldPhrase(ctrX + xs[k], ctrY + ys[k]);
            if (!inSpeckSpectrumOnlyLobe(w.x, w.y)) return false;
          }
          return true;
        };
        let phraseSizeScreen = Math.min(13 * ls * zoomPh, chordHalf * 0.95 * zoomPh);
        if (!useSpectrumPhrases) {
          while (phraseSizeScreen > 3.2 * ls * zoomPh) {
            textSize(phraseSizeScreen);
            let maxTw = 0;
            for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
            if (maxTw + 2 * padScr > chordHalf * 1.9 * zoomPh) {
              phraseSizeScreen -= 0.35 * ls * zoomPh;
              continue;
            }
            if (blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) break;
            phraseSizeScreen -= 0.35 * ls * zoomPh;
          }
          while (phraseSizeScreen > 2.4 * ls * zoomPh && !blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) {
            phraseSizeScreen -= 0.28 * ls * zoomPh;
          }
        } else {
          phraseSizeScreen = 20 * ls;
        }
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = useSpectrumPhrases ? 26 * ls : phraseSizeScreen * lineLead;
        textLeading(lineStep);
        const n = phrases.length;
        if (useSpectrumPhrases) {
          const spectrumWx = targets[2].x + curLayouts[2].dx;
          const spectrumWy = targets[2].y + curLayouts[2].dy;
          const ca = Math.cos(sceneAngle);
          const sa = Math.sin(sceneAngle);
          const ox = spectrumWx - graphCX;
          const oy = spectrumWy - graphCY;
          const spectrumSx = cx + ((graphCX + ca * ox - sa * oy) - camX) * camZoom;
          const spectrumSy = screenY + ((graphCY + sa * ox + ca * oy) - camY) * camZoom;
          const firstLineY = spectrumSy - spectrumLabelToPhraseGap - n * lineStep;
          /** Hub **2.7** slide **5** (`motionSpectrumSettled`): all lines black fill + white stroke; white glitch dots only on scanned glyphs. */
          const spectrumPhrases27Slide5Invert = seg45MotionSpectrumSettled;
          const phraseSw = specLiveMotions27()
            ? Math.max(0.75, 1.05 * ls)
            : Math.max(1.2, 2 * ls);
          textSize(phraseSizeScreen);
          const g1g15Ink = specGallery1Or15InkTypography();
          if (spectrumPhrases27Slide5Invert) {
          textAlign(CENTER, TOP);
            stroke(255, seg45SpectrumPhraseAlpha);
            strokeWeight(phraseSw);
            fill(0, seg45SpectrumPhraseAlpha);
          for (let pi = 0; pi < n; pi++) {
            text(phrases[pi], spectrumSx, firstLineY + pi * lineStep);
          }
        } else {
            textAlign(CENTER, TOP);
            if (g1g15Ink) {
              noStroke();
              fill(0, seg45SpectrumPhraseAlpha);
            } else {
              stroke(0, seg45SpectrumPhraseAlpha);
              strokeWeight(phraseSw);
              fill(255, seg45SpectrumPhraseAlpha);
            }
            for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], spectrumSx, firstLineY + pi * lineStep);
            }
          }
          drawSpectrumStillPhrasesScanGlitchDots(
            spectrumSx,
            firstLineY,
            lineStep,
            phrases,
            phraseSizeScreen,
            seg45SpectrumPhraseAlpha,
            ls,
            spectrumPhrases27Slide5Invert || g1g15Ink,
          );
        } else {
          const rotatingPhraseCenter = () => {
            const ca = Math.cos(sceneAngle);
            const sa = Math.sin(sceneAngle);
            const ox = phraseWx - graphCX;
            const oy = phraseWy - graphCY;
            const rwx = graphCX + ca * ox - sa * oy;
            const rwy = graphCY + sa * ox + ca * oy;
            return {
              x: cx + (rwx - camX) * camZoom,
              y: screenY + (rwy - camY) * camZoom,
            };
          };
          const phraseCtr = gallery15F4 ? rotatingPhraseCenter() : baseScr;
          textAlign(CENTER, CENTER);
          fill(0, seg34OverlapPhraseAlpha);
          noStroke();
          const mid = (n - 1) / 2;
          if (segment45) {
            translate(phraseCtr.x, phraseCtr.y);
            rotate(sceneAngle - rotEnd);
          for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], 0, (pi - mid) * lineStep);
            }
          } else {
            for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], phraseCtr.x, phraseCtr.y + (pi - mid) * lineStep);
            }
          }
        }
        pop();
        }
      }

      // Handoff to compact slide 4: keep current camera, zoom, and rotation (even mid-animation).
      if (!overlapStill && !spectrumStill && typeof window !== 'undefined') {
        window.__SPEC_FRAME4_END__ = { camX, camY, camZoom, screenY, angle: sceneAngle };
      }

      galleryLastFrame = galleryFrame;
      const live25LoopF4 =
        specLiveMotionsDesign() &&
        (segment34 || segment45) &&
        !overlapStill &&
        !spectrumStill &&
        tAnim >= 1;
      if (live25LoopF4) {
        galleryAnimStartMs = millis();
        loop();
      } else if (tAnim >= 1) {
        noLoop();
      }
      return;
    }

    // Compact frame 5: inspect ∩ spectrum \ speck; from slide 3 add −120° (e.g. −60° → −180°).
    if (galleryFrame === 5 && !galleryExtended) {
      const targets = vennTargetsSpread;
      const c0 = targets[0];
      const c1 = targets[1];
      const c2 = targets[2];
      const graphCX = (c0.x + c1.x + c2.x) / 3;
      const graphCY = (c0.y + c1.y + c2.y) / 3;
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const chordHalf = Math.sqrt(Math.max(0.0001, rFinal * rFinal - (d * d) / 4));
      const rCirc = rFinal;
      const inInspectSpectrumOnlyLobe = (px, py) => {
        const d0 = Math.sqrt((px - c0.x) ** 2 + (py - c0.y) ** 2);
        const d1 = Math.sqrt((px - c1.x) ** 2 + (py - c1.y) ** 2);
        const d2 = Math.sqrt((px - c2.x) ** 2 + (py - c2.y) ** 2);
        return d1 <= rCirc * 0.99 && d2 <= rCirc * 0.99 && d0 >= rCirc * 1.02;
      };
      let phraseWx = (c1.x + c2.x) / 2;
      let phraseWy = (c1.y + c2.y) / 2;
      let lobeRadiusWorld = Math.max(chordHalf * 0.92, 16 * ls);
      {
        const pad = rCirc * 1.05;
        const bx0 = Math.min(c0.x, c1.x, c2.x) - pad;
        const bx1 = Math.max(c0.x, c1.x, c2.x) + pad;
        const by0 = Math.min(c0.y, c1.y, c2.y) - pad;
        const by1 = Math.max(c0.y, c1.y, c2.y) + pad;
        const gridN = 22;
        let accX = 0;
        let accY = 0;
        let nHit = 0;
        for (let gi = 0; gi <= gridN; gi++) {
          for (let gj = 0; gj <= gridN; gj++) {
            const px = bx0 + ((bx1 - bx0) * gi) / gridN;
            const py = by0 + ((by1 - by0) * gj) / gridN;
            if (inInspectSpectrumOnlyLobe(px, py)) {
              accX += px;
              accY += py;
              nHit++;
            }
          }
        }
        if (nHit > 0) {
          phraseWx = accX / nHit;
          phraseWy = accY / nHit;
          let maxD = 0;
          for (let gi = 0; gi <= gridN; gi++) {
            for (let gj = 0; gj <= gridN; gj++) {
              const px = bx0 + ((bx1 - bx0) * gi) / gridN;
              const py = by0 + ((by1 - by0) * gj) / gridN;
              if (inInspectSpectrumOnlyLobe(px, py)) {
                const dd = Math.sqrt((px - phraseWx) ** 2 + (py - phraseWy) ** 2);
                if (dd > maxD) maxD = dd;
              }
            }
          }
          lobeRadiusWorld = Math.max(maxD * 1.12, 14 * ls);
        }
      }

      const pairStill = typeof window !== 'undefined' && window.__SPEC_MEDIA_PAIR_STILL__ === true;
      const inspectStill = typeof window !== 'undefined' && window.__SPEC_INSPECT_STILL__ === true;
      const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
      const segment56 = motionSegment === '56';
      const segment67 = motionSegment === '67';
      const gallery15F5 = segment56 || segment67;
      const G56_ROT_MS = 1200;
      const G56_PAIR_FADE_MS = 500;
      const G67_ROT_MS = 1200;
      const G67_INSPECT_FADE_MS = 500;
      const seg56Live = segment56 && !pairStill && !inspectStill;
      const seg67Live = segment67 && !pairStill && !inspectStill;
      const inspectMode = inspectStill || segment67;
      if (galleryLastFrame !== 5) {
        if (!pairStill && !inspectStill) galleryAnimStartMs = millis();
        loop();
      }
      let frame5Elapsed = 0;
      let seg56PairPhraseAlpha = 255;
      let seg67InspectPhraseAlpha = 255;
      let tAnim;
      let easeAnim;
      if (pairStill || inspectStill) {
        tAnim = 1;
        easeAnim = 1;
      } else {
        frame5Elapsed = millis() - galleryAnimStartMs;
        if (seg56Live) {
          const rotP = Math.min(1, frame5Elapsed / G56_ROT_MS);
          easeAnim = easeInOutCubic(rotP);
          tAnim = Math.min(1, frame5Elapsed / (G56_ROT_MS + G56_PAIR_FADE_MS));
          const fadeU =
            frame5Elapsed <= G56_ROT_MS
              ? 0
              : Math.max(0, Math.min(1, (frame5Elapsed - G56_ROT_MS) / G56_PAIR_FADE_MS));
          seg56PairPhraseAlpha = 255 * smootherstep(fadeU);
        } else if (seg67Live) {
          const rotP = Math.min(1, frame5Elapsed / G67_ROT_MS);
          easeAnim = easeInOutCubic(rotP);
          tAnim = Math.min(1, frame5Elapsed / (G67_ROT_MS + G67_INSPECT_FADE_MS));
          const fadeU =
            frame5Elapsed <= G67_ROT_MS
              ? 0
              : Math.max(0, Math.min(1, (frame5Elapsed - G67_ROT_MS) / G67_INSPECT_FADE_MS));
          seg67InspectPhraseAlpha = 255 * smootherstep(fadeU);
        } else {
          tAnim = Math.max(0, Math.min(1, frame5Elapsed / 1200));
          easeAnim = easeInOutCubic(tAnim);
        }
      }
      const fitSideFrac = 0.8;
      const zoom2 = 2.35;
      const zoomTarget = Math.min(
        6.6,
        Math.max(zoom2 + 0.4, (Math.min(width, height) * fitSideFrac) / Math.max(2 * lobeRadiusWorld, 18 * ls)),
      );
      const phraseRotAt = (a) => {
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const ox = phraseWx - graphCX;
        const oy = phraseWy - graphCY;
        return {
          x: graphCX + ca * ox - sa * oy,
          y: graphCY + sa * ox + ca * oy,
        };
      };

      const desiredSpeckCenterY = height * 0.75;
      const f4end = typeof window !== 'undefined' ? window.__SPEC_FRAME4_END__ : null;
      const fromSlide3 =
        f4end && typeof f4end.camX === 'number' && typeof f4end.angle === 'number';
      const rotSlide3 = (-60 * Math.PI) / 180;
      const rotStep120 = (-120 * Math.PI) / 180;
      const angleTarget = segment56
        ? rotSlide3 + rotStep120
        : (fromSlide3 ? f4end.angle + rotStep120 : rotStep120);
      const angleFrom = fromSlide3 ? f4end.angle : 0;

      let angle;
      let camZoom;
      let camX;
      let camY;
      let screenY;
      if (pairStill || inspectStill) {
        const aEnd = rotSlide3 + rotStep120;
        angle = aEnd;
        camZoom = zoomTarget;
        const prS = phraseRotAt(aEnd);
        camX = prS.x;
        camY = prS.y;
        screenY = cy;
      } else {
        let angleStart = angleFrom;
        let cam2f5 = fromSlide3
          ? { x: f4end.camX, y: f4end.camY, zoom: f4end.camZoom, screenY: f4end.screenY }
          : { x: targets[0].x, y: targets[0].y, zoom: zoom2, screenY: desiredSpeckCenterY };
        if (segment56) {
          // Live motion 5: start at Still 05 endpoint, transition to Still 06 endpoint.
          computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
          const startLayouts = computeExclusiveLabelLayout(targets, rFinal, WORDS, vennTextPx);
          const aSpectrum = -startLayouts[2].theta;
          const spectrumWx = targets[2].x + startLayouts[2].dx;
          const spectrumWy = targets[2].y + startLayouts[2].dy;
          const ca = Math.cos(aSpectrum);
          const sa = Math.sin(aSpectrum);
          const ox = spectrumWx - graphCX;
          const oy = spectrumWy - graphCY;
          const camXSpectrum = graphCX + ca * ox - sa * oy;
          const camYSpectrum = graphCY + sa * ox + ca * oy;
          angleStart = aSpectrum;
          cam2f5 = { x: camXSpectrum, y: camYSpectrum, zoom: zoomTarget, screenY: cy };
        }
        angle = lerp(angleStart, angleTarget, easeAnim);
        const pr = phraseRotAt(angle);
        camZoom = lerp(cam2f5.zoom, zoomTarget, easeAnim);
        camX = lerp(cam2f5.x, pr.x, easeAnim);
        camY = lerp(cam2f5.y, pr.y, easeAnim);
        screenY = lerp(cam2f5.screenY, cy, easeAnim);
      }

      const anglePh = pairStill ? rotSlide3 + rotStep120 : angleTarget;
      const zoomPh = zoomTarget;
      const prPh = phraseRotAt(anglePh);
      const camXPh = prPh.x;
      const camYPh = prPh.y;
      const screenYPh = cy;
      const screenToUnrotWorldPhrase = (sx, sy) => {
        const rx = (sx - cx) / zoomPh + camXPh;
        const ry = (sy - screenYPh) / zoomPh + camYPh;
        const ca = Math.cos(anglePh);
        const sa = Math.sin(anglePh);
        const ddx = rx - graphCX;
        const ddy = ry - graphCY;
        const ox = ca * ddx + sa * ddy;
        const oy = -sa * ddx + ca * ddy;
        return { x: graphCX + ox, y: graphCY + oy };
      };

      const aStart67 = rotSlide3 + rotStep120;
      const prPh67Start = phraseRotAt(aStart67);
      const screenToUnrotWorldPhrase67Start = (sx, sy) => {
        const rx = (sx - cx) / zoomPh + prPh67Start.x;
        const ry = (sy - screenYPh) / zoomPh + prPh67Start.y;
        const ca = Math.cos(aStart67);
        const sa = Math.sin(aStart67);
        const ddx = rx - graphCX;
        const ddy = ry - graphCY;
        const ox = ca * ddx + sa * ddy;
        const oy = -sa * ddx + ca * ddy;
        return { x: graphCX + ox, y: graphCY + oy };
      };

      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      const curLayouts = computeExclusiveLabelLayout(targets, rFinal, WORDS, vennTextPx);
      let sceneAngle = angle;
      if (inspectMode) {
        // Rotate full graphic so "inspect" is parallel to canvas.
        const sceneAngleTarget = -curLayouts[1].theta;
        const inspectWx = targets[1].x + curLayouts[1].dx;
        const inspectWy = targets[1].y + curLayouts[1].dy;
        const ca = Math.cos(sceneAngleTarget);
        const sa = Math.sin(sceneAngleTarget);
        const ox = inspectWx - graphCX;
        const oy = inspectWy - graphCY;
        const camXTarget = graphCX + ca * ox - sa * oy;
        const camYTarget = graphCY + sa * ox + ca * oy;
        if (segment67) {
          // Live motion 6: start at Still 06 endpoint, transition to Still 07 endpoint.
          const rotT67 = seg67Live ? Math.min(1, frame5Elapsed / G67_ROT_MS) : tAnim;
          const e67 = easeInOutCubic(rotT67);
          const aStart = rotSlide3 + rotStep120;
          const prStart = phraseRotAt(aStart);
          sceneAngle = lerp(aStart, sceneAngleTarget, e67);
          camZoom = zoomTarget;
          screenY = cy;
          camX = lerp(prStart.x, camXTarget, e67);
          camY = lerp(prStart.y, camYTarget, e67);
        } else {
          sceneAngle = sceneAngleTarget;
          camX = camXTarget;
          camY = camYTarget;
        }
      }

      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);
      translate(graphCX, graphCY);
      rotate(sceneAngle);
      translate(-graphCX, -graphCY);

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        noStroke();
        noFill();
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(0, specGallery2Shell() ? 255 : 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        segment56 &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        const padG = rFinal * 1.05;
        const gx0 = Math.min(c0.x, c1.x, c2.x) - padG;
        const gx1 = Math.max(c0.x, c1.x, c2.x) + padG;
        const gy0 = Math.min(c0.y, c1.y, c2.y) - padG;
        const gy1 = Math.max(c0.y, c1.y, c2.y) + padG;
        debugG2DrawFillGridWorldRect(
          (wx, wy) => isInspectSpectrumOverlapGeometric(wx, wy, targets, rFinal),
          gx0,
          gx1,
          gy0,
          gy1,
          rFinal,
          ls,
        );
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        segment67 &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        debugG2DrawExclusiveFillGrid(
          (wx, wy) => isExclusiveRegionGeometric(wx, wy, 1, targets, rFinal),
          targets,
          rFinal,
          ls,
          1,
        );
      }

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(vennTextPx);
        noStroke();
        push();
        translate(wx, wy);
        rotate(curLayouts[i].theta);
        text(WORDS[i], 0, 0);
        pop();
      }

      pop();

      const phraseFadeT0 = gallery15F5 ? 0 : 0.64;
      if (tAnim > phraseFadeT0 || gallery15F5) {
        const u = gallery15F5
          ? 1
          : Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = gallery15F5 ? 1 : smootherstep(u);
        const useSpectrumPhrases = seg56Live && frame5Elapsed < G56_ROT_MS;
        const useInspectPhrases =
          inspectStill || (seg67Live && frame5Elapsed >= G67_ROT_MS);
        const phrases = useInspectPhrases
          ? INSPECT_STILL_PHRASES
          : (useSpectrumPhrases ? SPECTRUM_STILL_PHRASES : INSPECT_SPECTRUM_PAIR_PHRASES);
        const baseScr = { x: cx, y: cy };
        const padScr = Math.max(3, 4 * ls);
        const lineLead = 1.22;
        const seg67InitialPair = seg67Live && frame5Elapsed < G67_ROT_MS;
        const screenToUnrotForPairFit = seg67InitialPair
          ? screenToUnrotWorldPhrase67Start
          : screenToUnrotWorldPhrase;
        const blockCornersInLobe = (sizeScr, ctrX, ctrY) => {
          textSize(sizeScr);
          const lineStep = sizeScr * lineLead;
          let maxTw = 0;
          for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
          const halfW = maxTw / 2 + padScr;
          const halfH = (phrases.length * lineStep) / 2 + padScr;
          const xs = [-halfW, 0, halfW, -halfW, halfW, -halfW, 0, halfW];
          const ys = [-halfH, -halfH, -halfH, 0, 0, halfH, halfH, halfH];
          for (let k = 0; k < xs.length; k++) {
            const w = screenToUnrotForPairFit(ctrX + xs[k], ctrY + ys[k]);
            if (!inInspectSpectrumOnlyLobe(w.x, w.y)) return false;
          }
          return true;
        };
        let phraseSizeScreen = Math.min(13 * ls * zoomPh, chordHalf * 0.95 * zoomPh);
        if (!useInspectPhrases && !useSpectrumPhrases) {
          while (phraseSizeScreen > 3.2 * ls * zoomPh) {
            textSize(phraseSizeScreen);
            let maxTw = 0;
            for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
            if (maxTw + 2 * padScr > chordHalf * 1.9 * zoomPh) {
              phraseSizeScreen -= 0.35 * ls * zoomPh;
              continue;
            }
            if (blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) break;
            phraseSizeScreen -= 0.35 * ls * zoomPh;
          }
          while (phraseSizeScreen > 2.4 * ls * zoomPh && !blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) {
            phraseSizeScreen -= 0.28 * ls * zoomPh;
          }
        } else {
          phraseSizeScreen = 20 * ls;
        }
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = (useInspectPhrases || useSpectrumPhrases) ? 26 * ls : phraseSizeScreen * lineLead;
        textLeading(lineStep);
        const n = phrases.length;
        if (useInspectPhrases) {
          const inspectWx = targets[1].x + curLayouts[1].dx;
          const inspectWy = targets[1].y + curLayouts[1].dy;
          const ca = Math.cos(sceneAngle);
          const sa = Math.sin(sceneAngle);
          const ox = inspectWx - graphCX;
          const oy = inspectWy - graphCY;
          const inspectSx = cx + ((graphCX + ca * ox - sa * oy) - camX) * camZoom;
          const inspectSy = screenY + ((graphCY + sa * ox + ca * oy) - camY) * camZoom;
          const gap = 74 * ls;
          const firstLineY = inspectSy - gap - n * lineStep;
          textAlign(CENTER, TOP);
          if (specGallery1Or15InkTypography()) {
            noStroke();
            fill(0, seg67InspectPhraseAlpha);
          } else {
            stroke(0, seg67InspectPhraseAlpha);
            strokeWeight(Math.max(1.2, 2 * ls));
            fill(255, seg67InspectPhraseAlpha);
          }
          for (let pi = 0; pi < n; pi++) {
            text(phrases[pi], inspectSx, firstLineY + pi * lineStep);
          }
        } else if (useSpectrumPhrases) {
          const spectrumWx = targets[2].x + curLayouts[2].dx;
          const spectrumWy = targets[2].y + curLayouts[2].dy;
          const ca = Math.cos(sceneAngle);
          const sa = Math.sin(sceneAngle);
          const ox = spectrumWx - graphCX;
          const oy = spectrumWy - graphCY;
          const spectrumSx = cx + ((graphCX + ca * ox - sa * oy) - camX) * camZoom;
          const spectrumSy = screenY + ((graphCY + sa * ox + ca * oy) - camY) * camZoom;
          const gap = 74 * ls;
          const firstLineY = spectrumSy - gap - n * lineStep;
          const midSp = (n - 1) / 2;
          const stackCy = firstLineY + (n * lineStep) / 2;
          if (specGallery1Or15InkTypography()) {
            noStroke();
            fill(0);
          } else {
            stroke(0, 255);
            strokeWeight(Math.max(1.2, 2 * ls));
            fill(255);
          }
          if (segment56 && seg56Live) {
            const angleStartSpectrum = -curLayouts[2].theta;
            push();
            translate(spectrumSx, stackCy);
            rotate(sceneAngle - angleStartSpectrum);
            textAlign(CENTER, CENTER);
            for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], 0, (pi - midSp) * lineStep);
            }
            pop();
        } else {
            textAlign(CENTER, TOP);
            for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], spectrumSx, firstLineY + pi * lineStep);
            }
          }
        } else {
          const rotatingPairCtr = () => {
            const ca = Math.cos(sceneAngle);
            const sa = Math.sin(sceneAngle);
            const ox = phraseWx - graphCX;
            const oy = phraseWy - graphCY;
            const rwx = graphCX + ca * ox - sa * oy;
            const rwy = graphCY + sa * ox + ca * oy;
            return {
              x: cx + (rwx - camX) * camZoom,
              y: screenY + (rwy - camY) * camZoom,
            };
          };
          const pairCtr = gallery15F5 ? rotatingPairCtr() : baseScr;
          textAlign(CENTER, CENTER);
          fill(0, seg56PairPhraseAlpha);
          noStroke();
          const mid = (n - 1) / 2;
          if (segment67 && seg67Live && seg67InitialPair) {
            push();
            translate(pairCtr.x, pairCtr.y);
            rotate(sceneAngle - aStart67);
          for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], 0, (pi - mid) * lineStep);
            }
            pop();
          } else {
            for (let pi = 0; pi < n; pi++) {
              text(phrases[pi], pairCtr.x, pairCtr.y + (pi - mid) * lineStep);
            }
          }
        }
        pop();
      }

      if (!pairStill && !inspectStill && typeof window !== 'undefined') {
        window.__SPEC_FRAME5_END__ = { camX, camY, camZoom, screenY, angle: sceneAngle };
      }

      galleryLastFrame = galleryFrame;
      const live25LoopF5 =
        specLiveMotionsDesign() &&
        (segment56 || segment67) &&
        !pairStill &&
        !inspectStill &&
        tAnim >= 1;
      if (live25LoopF5) {
        galleryAnimStartMs = millis();
        loop();
      } else if (tAnim >= 1) {
        noLoop();
      }
      return;
    }

    // Compact frame 6: speck ∩ inspect \ spectrum; from frame 5 add −120° (e.g. −180° → −300°).
    if (galleryFrame === 6 && !galleryExtended) {
      const targets = vennTargetsSpread;
      const geom = buildSpeckInspectSpaceFrame6Geometry(targets, rFinal, width, height, ls);
      const {
        graphCX,
        graphCY,
        phraseWx,
        phraseWy,
        phraseRotAt,
        zoomTarget,
        rotSlide3,
        rotStep120,
        chordHalf,
        inSpeckInspectOnlyLobe,
      } = geom;
      const zoom2 = 2.35;

      const spaceStill = typeof window !== 'undefined' && window.__SPEC_SPACE_PHRASES_STILL__ === true;
      const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
      const segment78 = motionSegment === '78';
      const G78_ROT_MS = 1200;
      const G78_SPACE_FADE_MS = 500;
      /** Slide 7 space phrases: slight right shift for optical center in the inspect∩spectrum lobe. */
      const G78_SPACE_PHRASE_X_NUDGE_LS = 5.5;
      const seg78Live = segment78 && !spaceStill;
      if (galleryLastFrame !== 6) {
        if (!spaceStill) galleryAnimStartMs = millis();
        loop();
      }

      const desiredSpeckCenterY = height * 0.75;
      const f5end = typeof window !== 'undefined' ? window.__SPEC_FRAME5_END__ : null;
      const fromSlide5 =
        f5end && typeof f5end.camX === 'number' && typeof f5end.angle === 'number';
      const angleTarget = segment78
        ? rotSlide3 + 2 * rotStep120
        : (fromSlide5 ? f5end.angle + rotStep120 : rotSlide3 + 2 * rotStep120);
      const angleFrom = fromSlide5 ? f5end.angle : 0;

      let frame6Elapsed = 0;
      let seg78SpacePhraseAlpha = 255;
      let tAnim;
      let easeAnim;
      if (spaceStill) {
        tAnim = 1;
        easeAnim = 1;
      } else {
        frame6Elapsed = millis() - galleryAnimStartMs;
        if (seg78Live) {
          const rotP = Math.min(1, frame6Elapsed / G78_ROT_MS);
          easeAnim = easeInOutCubic(rotP);
          tAnim = Math.min(1, frame6Elapsed / (G78_ROT_MS + G78_SPACE_FADE_MS));
          const fadeU =
            frame6Elapsed <= G78_ROT_MS
              ? 0
              : Math.max(0, Math.min(1, (frame6Elapsed - G78_ROT_MS) / G78_SPACE_FADE_MS));
          seg78SpacePhraseAlpha = 255 * smootherstep(fadeU);
        } else {
          tAnim = Math.max(0, Math.min(1, frame6Elapsed / 1200));
          easeAnim = easeInOutCubic(tAnim);
        }
      }

      let angle;
      let camZoom;
      let camX;
      let camY;
      let screenY;
      if (spaceStill) {
        const s08 = still08Frame6EndFromGeometry(geom, cy);
        angle = s08.angle;
        camZoom = s08.camZoom;
        camX = s08.camX;
        camY = s08.camY;
        screenY = s08.screenY;
      } else {
        let angleStart = angleFrom;
        let cam2f6 = fromSlide5
          ? { x: f5end.camX, y: f5end.camY, zoom: f5end.camZoom, screenY: f5end.screenY }
          : { x: targets[0].x, y: targets[0].y, zoom: zoom2, screenY: desiredSpeckCenterY };
        if (segment78) {
          // Live motion 7: start at Still 07 endpoint, transition to Still 08 endpoint.
          computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
          const startLayouts = computeExclusiveLabelLayout(targets, rFinal, WORDS, vennTextPx);
          const aInspect = -startLayouts[1].theta;
          const inspectWx = targets[1].x + startLayouts[1].dx;
          const inspectWy = targets[1].y + startLayouts[1].dy;
          const ca = Math.cos(aInspect);
          const sa = Math.sin(aInspect);
          const ox = inspectWx - graphCX;
          const oy = inspectWy - graphCY;
          const camXInspect = graphCX + ca * ox - sa * oy;
          const camYInspect = graphCY + sa * ox + ca * oy;
          angleStart = aInspect;
          cam2f6 = { x: camXInspect, y: camYInspect, zoom: zoomTarget, screenY: cy };
        }
        angle = lerp(angleStart, angleTarget, easeAnim);
        const pr = phraseRotAt(angle);
        camZoom = lerp(cam2f6.zoom, zoomTarget, easeAnim);
        camX = lerp(cam2f6.x, pr.x, easeAnim);
        camY = lerp(cam2f6.y, pr.y, easeAnim);
        screenY = lerp(cam2f6.screenY, cy, easeAnim);
      }

      const anglePh = spaceStill ? rotSlide3 + 2 * rotStep120 : angleTarget;
      const zoomPh = zoomTarget;
      const prPh = phraseRotAt(anglePh);
      const camXPh = prPh.x;
      const camYPh = prPh.y;
      const screenYPh = cy;
      const gallery15F6 = segment78;
      // Space-phrase fit uses end-state camera/zoom/angle only (not the live lerp) so type size
      // does not track zoom during motion.
      const screenToUnrotWorldPhrase = (sx, sy) => {
        const rx = (sx - cx) / zoomPh + camXPh;
        const ry = (sy - screenYPh) / zoomPh + camYPh;
        const ca = Math.cos(anglePh);
        const sa = Math.sin(anglePh);
        const ddx = rx - graphCX;
        const ddy = ry - graphCY;
        const ox = ca * ddx + sa * ddy;
        const oy = -sa * ddx + ca * ddy;
        return { x: graphCX + ox, y: graphCY + oy };
      };

      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      const curLayouts = computeExclusiveLabelLayout(targets, rFinal, WORDS, vennTextPx);

      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);
      translate(graphCX, graphCY);
      rotate(angle);
      translate(-graphCX, -graphCY);

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        noStroke();
        noFill();
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(0, specGallery2Shell() ? 255 : 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      if (
        DEBUG_G2_ISOLATED_EXCLUSIVE_FILLS &&
        segment78 &&
        typeof window !== 'undefined' &&
        window.__SPEC_GALLERY2_SHELL__ === true
      ) {
        const c0 = targets[0];
        const c1 = targets[1];
        const c2 = targets[2];
        const padG = rFinal * 1.05;
        const gx0 = Math.min(c0.x, c1.x, c2.x) - padG;
        const gx1 = Math.max(c0.x, c1.x, c2.x) + padG;
        const gy0 = Math.min(c0.y, c1.y, c2.y) - padG;
        const gy1 = Math.max(c0.y, c1.y, c2.y) + padG;
        debugG2DrawFillGridWorldRect(
          (wx, wy) => isSpeckInspectOverlapGeometric(wx, wy, targets, rFinal),
          gx0,
          gx1,
          gy0,
          gy1,
          rFinal,
          ls,
        );
      }

      for (let i = 0; i < 3; i++) {
        const x = targets[i].x;
        const y = targets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(vennTextPx);
        noStroke();
        push();
        translate(wx, wy);
        rotate(curLayouts[i].theta);
        text(WORDS[i], 0, 0);
        pop();
      }

      pop();

      const phraseFadeT0 = gallery15F6 ? 0 : 0.64;
      if (tAnim > phraseFadeT0 || gallery15F6) {
        const u = gallery15F6
          ? 1
          : Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = gallery15F6 ? 1 : smootherstep(u);
        const useInspectPhrases = seg78Live && frame6Elapsed < G78_ROT_MS;
        const phrases = useInspectPhrases ? INSPECT_STILL_PHRASES : SPECK_INSPECT_SPACE_PHRASES;
        const baseScr = { x: cx, y: cy };
        const padScr = Math.max(3, 4 * ls);
        const lineLead = 1.22;
        const blockCornersInLobe = (sizeScr, ctrX, ctrY) => {
          textSize(sizeScr);
          const lineStep = sizeScr * lineLead;
          let maxTw = 0;
          for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
          const halfW = maxTw / 2 + padScr;
          const halfH = (phrases.length * lineStep) / 2 + padScr;
          const xs = [-halfW, 0, halfW, -halfW, halfW, -halfW, 0, halfW];
          const ys = [-halfH, -halfH, -halfH, 0, 0, halfH, halfH, halfH];
          for (let k = 0; k < xs.length; k++) {
            const w = screenToUnrotWorldPhrase(ctrX + xs[k], ctrY + ys[k]);
            if (!inSpeckInspectOnlyLobe(w.x, w.y)) return false;
          }
          return true;
        };
        let phraseSizeScreen = Math.min(12 * ls * zoomPh, chordHalf * 0.92 * zoomPh);
        if (!spaceStill && !useInspectPhrases) {
          while (phraseSizeScreen > 2.8 * ls * zoomPh) {
            textSize(phraseSizeScreen);
            let maxTw = 0;
            for (let i = 0; i < phrases.length; i++) maxTw = Math.max(maxTw, textWidth(phrases[i]));
            if (maxTw + 2 * padScr > chordHalf * 1.85 * zoomPh) {
              phraseSizeScreen -= 0.32 * ls * zoomPh;
              continue;
            }
            if (blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) break;
            phraseSizeScreen -= 0.32 * ls * zoomPh;
          }
          while (phraseSizeScreen > 2.2 * ls * zoomPh && !blockCornersInLobe(phraseSizeScreen, baseScr.x, baseScr.y)) {
            phraseSizeScreen -= 0.25 * ls * zoomPh;
          }
        } else {
          phraseSizeScreen = 20 * ls;
        }
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = (spaceStill || useInspectPhrases) ? 26 * ls : phraseSizeScreen * lineLead;
        textLeading(lineStep);
        const n = phrases.length;
        if (useInspectPhrases) {
          const inspectWx = targets[1].x + curLayouts[1].dx;
          const inspectWy = targets[1].y + curLayouts[1].dy;
          const ca = Math.cos(angle);
          const sa = Math.sin(angle);
          const ox = inspectWx - graphCX;
          const oy = inspectWy - graphCY;
          const inspectSx = cx + ((graphCX + ca * ox - sa * oy) - camX) * camZoom;
          const inspectSy = screenY + ((graphCY + sa * ox + ca * oy) - camY) * camZoom;
          const gap = 74 * ls;
          // Match black INSPECT label: world stack is rotate(angle) then rotate(curLayouts[1].theta).
          // angleStart for slide 7 is -theta so at t=0 this rotation is 0 (horizontal); it tracks scene during lerp.
          const phraseRotScreen = angle + curLayouts[1].theta;
          textAlign(CENTER, TOP);
          if (specGallery1Or15InkTypography()) {
            noStroke();
            fill(0);
          } else {
            stroke(0, 255);
            strokeWeight(Math.max(1.2, 2 * ls));
            fill(255);
          }
          push();
          translate(inspectSx, inspectSy);
          rotate(phraseRotScreen);
          const y0 = -gap - n * lineStep;
          for (let pi = 0; pi < n; pi++) {
            text(phrases[pi], 0, y0 + pi * lineStep);
          }
          pop();
        } else {
        textAlign(CENTER, CENTER);
          fill(0, seg78SpacePhraseAlpha);
        noStroke();
        const mid = (n - 1) / 2;
        const lobeCenterScreenXAtY = (sy) => {
          if (!spaceStill) return baseScr.x;
          const samples = 160;
          let minX = Infinity;
          let maxX = -Infinity;
          for (let si = 0; si <= samples; si++) {
            const sx = (width * si) / samples;
            const w = screenToUnrotWorldPhrase(sx, sy);
            if (!inSpeckInspectOnlyLobe(w.x, w.y)) continue;
            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
          }
          return Number.isFinite(minX) && Number.isFinite(maxX) && maxX > minX
            ? (minX + maxX) * 0.5
            : baseScr.x;
        };
          const spacePhraseXShift = segment78 ? G78_SPACE_PHRASE_X_NUDGE_LS * ls : 0;
        for (let pi = 0; pi < n; pi++) {
          const lineY = baseScr.y + (pi - mid) * lineStep;
            const lineX = lobeCenterScreenXAtY(lineY) + spacePhraseXShift;
          text(phrases[pi], lineX, lineY);
          }
        }
        pop();
      }

      galleryLastFrame = galleryFrame;
      if (typeof window !== 'undefined' && !spaceStill) {
        window.__SPEC_FRAME6_END__ = { camX, camY, camZoom, screenY, angle };
      }
      const live25LoopF6 =
        specLiveMotionsDesign() &&
        segment78 &&
        !spaceStill &&
        tAnim >= 1;
      if (live25LoopF6) {
        galleryAnimStartMs = millis();
        loop();
      } else if (tAnim >= 1) {
        noLoop();
      }
      return;
    }

    let transitionDone = false;
    if (galleryExtended && (galleryFrame === 4 || galleryFrame === 5)) {
      const useSediment = galleryFrame === 5;
      if (galleryLastFrame !== galleryFrame) {
        galleryAnimStartMs = millis();
        galleryTextStartMs = 0;
        frame4Ready = false;
        speckLetters = null;
        matterReady = false;
        matterEngine = null;
        matterWorld = null;
        speckBodies = null;
        speckWalls = null;
        post2SolidInkG = null;
        post2Sediment = null;
        frame5FlashFrame = -1;
        frame5AfterglowStartMs = 0;
        inkStartMs = 0;
        inkLastAddMs = 0;
        inkDone = false;
        if (inkAvailable()) window.SpecInk.reset();
        loop();
      }
      const u = (millis() - galleryAnimStartMs) / 2000; // total motion duration
      const t = Math.max(0, Math.min(1, u));
      const done = t >= 1;

      // Stage A (0..0.45): 1 -> 2 (reduce overlap by spreading circles)
      const a = Math.max(0, Math.min(1, t / 0.45));
      const easeA = easeInOutCubic(a);
      const curOffset = lerp(vennOff, vennOff * 1.35, easeA);
      const curTargets = vennTargetsFor(curOffset);

      // Stage B (0.45..1): 2 -> 3 (zoom into speck)
      const b = Math.max(0, Math.min(1, (t - 0.45) / 0.55));
      const easeB = easeInOutCubic(b);
      const curSpeck = curTargets[0];

      camX = lerp(cam1.x, curSpeck.x, easeB);
      camY = lerp(cam1.y, curSpeck.y, easeB);
      camZoom = lerp(1, zoom2, easeB);
      screenY = lerp(cy, desiredSpeckCenterY, easeB);

      // Recompute layouts for the current (animated) targets so labels follow.
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      const curLayouts = computeExclusiveLabelLayout(curTargets, rFinal, WORDS, vennTextPx);

      // Publish final camera + circle bounds for dragging once motion is done.
      if (done) {
        frame4Ready = true;
        frame4Cam = { x: camX, y: camY, zoom: camZoom, screenY };
        frame4SpeckCircle = { x: curSpeck.x, y: curSpeck.y, r: rFinal };
      }

      // Matter + ink start once the motion is done.
      if (done) {
        if (!matterReady) {
          const labelX = curSpeck.x + curLayouts[0].dx;
          const labelY = curSpeck.y + curLayouts[0].dy + SPECK_MATTER_Y_OFFSET * ls;
          ensureMatterSpeckInitialized(curTargets, rFinal, labelX, labelY);
        }
        if (!inkStartMs) {
          inkStartMs = millis();
          if (useSediment) {
            ensurePost2Sediment(this, curTargets, rFinal, ls);
          } else if (inkAvailable()) {
            window.SpecInk.ensureLayer(this, width, height);
            window.SpecInk.init(this, curTargets, rFinal);
          }
        }
      }

      // Step physics while frame 4 is active.
      if (done && matterReady) {
        stepMatter(Math.min(33, Math.max(8, deltaTime)));
      }

      // Draw using current targets/layouts under the current camera.
      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);

      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        noStroke();
        noFill();
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(0, specGallery2Shell() ? 255 : 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      // Fill layer (speck-exclusive region) — behind text
      if (done) {
        if (useSediment) {
          ensurePost2Sediment(this, curTargets, rFinal, ls);
          stepPost2Sediment(this, curTargets, rFinal);
          const layer = renderPost2SedimentLayer(this, curTargets, rFinal);
          if (layer) {
            noTint();
            image(layer, 0, 0);
          }
          inkDone = !!post2Sediment?.done;
          if (inkDone) {
            // Fully solid black at the end (remove any tiny gaps).
            noTint();
            image(renderPost2SpeckExclusiveSedimentMask(this, curTargets, rFinal), 0, 0);
          }

          // Frame 5: blink-and-miss "speck" flash when sediment first starts accumulating.
          if (post2Sediment?.startedAtMs && !frame5AfterglowStartMs) {
            frame5AfterglowStartMs = millis();
            frame5FlashFrame = frameCount; // exactly one frame
          }
        } else {
          // Original ink blob fill (Frame 4)
          if (!inkDone && inkAvailable()) {
            // Slow down the fill by throttling blob additions.
            const now = millis();
            const cov = window.SpecInk.coverage();
            const addEveryMs = cov < 0.7 ? 70 : 100; // even slower near the end
            const n = 1;
            if (!inkLastAddMs) inkLastAddMs = now;
            if (now - inkLastAddMs >= addEveryMs) {
              window.SpecInk.addBlobs(this, curTargets, rFinal, n);
              inkLastAddMs = now;
            }
            inkDone = window.SpecInk.isDone();
          }
          if (inkAvailable()) {
            window.SpecInk.ensureLayer(this, width, height);
            window.SpecInk.render(this, curTargets, rFinal);
            // Draw ink layer in world-space under the camera transform
            noTint();
            image(window.SpecInk.layer(), 0, 0);
          }
          if (inkDone) {
            // Once the fill is complete, black out the constrained region to eliminate tiny gaps.
            noTint();
            image(renderSolidSpeckExclusive(this, curTargets, rFinal), 0, 0);
          }
        }
      }

      // Draw words
      const frame5Fx = useSediment ? getFrame5SpeckFx() : null;
      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        if (i === 0 && done && matterReady) {
          drawMatterSpeckLetters(frame5Fx);
        } else {
          fill(0);
          textAlign(CENTER, CENTER);
          textSize(vennTextPx);
          noStroke();
          push();
          translate(wx, wy);
          rotate(curLayouts[i].theta);
          text(WORDS[i], 0, 0);
          pop();
        }
      }
      pop();

      if (done) {
        transitionDone = true;
      }
      galleryLastFrame = galleryFrame;

      // Description: below speck label, horizontally centered on speck-exclusive (black) span at that latitude.
      if (done && POST2_SHOW_DESCRIPTION) {
        const labelWorldY = curSpeck.y + curLayouts[0].dy;
        const labelScreenY = screenY + (labelWorldY - camY) * camZoom;
        let py = camY + (labelScreenY + 88 * ls - screenY) / camZoom;
        let span = speckExclusiveSpanWorldAtY(py, curTargets, rFinal);
        for (let k = 0; k < 14 && !span; k++) {
          py -= rFinal * 0.05;
          span = speckExclusiveSpanWorldAtY(py, curTargets, rFinal);
        }
        if (span) {
          const centerSx = cx + (span.cx - camX) * camZoom;
          const centerSy = screenY + (py - camY) * camZoom;
          const maxWScreen = 2 * span.halfW * camZoom;
          drawPost2ExclusiveDescription(ls, centerSx, centerSy, maxWScreen);
        } else {
          const centerSx = cx + (curSpeck.x - camX) * camZoom;
          drawPost2ExclusiveDescription(ls, centerSx, labelScreenY + 88 * ls, rFinal * camZoom * 1.1);
        }
        }

        // Ensure "speck" floats ABOVE the sentence text (draw it last).
      if (done && matterReady) {
          push();
          translate(cx, screenY);
          scale(camZoom);
          translate(-camX, -camY);
        drawMatterSpeckLetters(useSediment ? frame5Fx : null);
          pop();
        }

      if (done && !useSediment && inkDone) {
        noLoop();
      }
      return;
    } else {
      const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
      const animatedFrame2 = galleryExtended && galleryFrame === 2 && (motionSegment === '89' || motionSegment === '910' || motionSegment === '1011');
      if (!animatedFrame2) noLoop();
    }

    if (!galleryExtended && galleryFrame === 1 && typeof window !== 'undefined') {
      window.__SPEC_FRAME4_END__ = null;
      window.__SPEC_FRAME5_END__ = null;
    }

    const motionSegment = (typeof window !== 'undefined' && window.__SPEC_MOTION_SEGMENT__) || '';
    const segment89 = galleryExtended && galleryFrame === 2 && motionSegment === '89';
      let f6end = typeof window !== 'undefined' ? window.__SPEC_FRAME6_END__ : null;
      if (segment89 && (!f6end || typeof f6end.camX !== 'number')) {
        f6end = computeSpacePhrasesStillFrame6End(vennTargetsSpread, rFinal, cy, width, height, ls);
      }
      if (segment89 && f6end && typeof f6end.camX === 'number' && typeof f6end.angle !== 'number') {
        f6end = {
          ...f6end,
          angle: still08Frame6EndFromGeometry(
            buildSpeckInspectSpaceFrame6Geometry(vennTargetsSpread, rFinal, width, height, ls),
            cy,
          ).angle,
        };
      }
    let fadeIndividual = 1;
    let fadeOverlap = 1;
    let fadeLogo = 1;
    let seg89SpacePhraseAlpha = 255;
    /** Still 08→09: fade black space lines at fixed camera, then zoom + spin + Still 09 white in. */
    const G89_TEXT_FADE_MS = 450;
    const G89_ZOOM_MS = 950;
    const G89_TOTAL_MS = G89_TEXT_FADE_MS + G89_ZOOM_MS;
    const G91011_FADE_MS = 1200;
    let seg89SceneAngle = 0;
    if (segment89) {
      if (prevGalleryFrame !== 2) {
        galleryAnimStartMs = millis();
        loop();
      }
      const elapsed89 = millis() - galleryAnimStartMs;
      if (f6end && typeof f6end.camX === 'number') {
        if (elapsed89 <= G89_TEXT_FADE_MS) {
          camX = f6end.camX;
          camY = f6end.camY;
          camZoom = f6end.camZoom;
          screenY = f6end.screenY;
          seg89SceneAngle = f6end.angle;
          seg89SpacePhraseAlpha = 255 * (1 - smootherstep(elapsed89 / G89_TEXT_FADE_MS));
          fadeIndividual = 0;
        } else {
          const uCam = Math.min(1, (elapsed89 - G89_TEXT_FADE_MS) / G89_ZOOM_MS);
          const e = easeInOutCubic(uCam);
          camX = lerp(f6end.camX, cam1.x, e);
          camY = lerp(f6end.camY, cam1.y, e);
          camZoom = lerp(f6end.camZoom, cam1.zoom, e);
          screenY = lerp(f6end.screenY, cam1.screenY, e);
          seg89SceneAngle = lerp(f6end.angle, 0, e);
          seg89SpacePhraseAlpha = 0;
          fadeIndividual = smootherstep(uCam);
        }
      } else {
        fadeIndividual = 1;
        seg89SpacePhraseAlpha = 0;
      }
    } else if (galleryExtended && galleryFrame === 2 && (motionSegment === '910' || motionSegment === '1011')) {
      if (prevGalleryFrame !== 2) {
        galleryAnimStartMs = millis();
        loop();
      }
      const tFade = Math.max(0, Math.min(1, (millis() - galleryAnimStartMs) / G91011_FADE_MS));
      const eFade = easeInOutCubic(tFade);
      if (motionSegment === '910' && f6end && typeof f6end.camX === 'number') {
        camX = lerp(f6end.camX, camX, eFade);
        camY = lerp(f6end.camY, camY, eFade);
        camZoom = lerp(f6end.camZoom, camZoom, eFade);
        screenY = lerp(f6end.screenY, screenY, eFade);
      }
      if (motionSegment === '910') {
        fadeOverlap = smootherstep(tFade);
      }
      if (motionSegment === '1011') {
        fadeLogo = smootherstep(tFade);
      }
    }

    galleryLastFrame = galleryFrame;
    if (
      segment89 &&
      f6end &&
      typeof f6end.camX === 'number' &&
      millis() - galleryAnimStartMs >= G89_TOTAL_MS
    ) {
      noLoop();
    }
    if (
      galleryExtended &&
      galleryFrame === 2 &&
      (motionSegment === '910' || motionSegment === '1011') &&
      millis() - galleryAnimStartMs >= G91011_FADE_MS
    ) {
      noLoop();
    }

    // Apply camera transform so cam maps to (cx, screenY).
    push();
    translate(cx, screenY);
    scale(camZoom);
    translate(-camX, -camY);
    if (segment89 && f6end && typeof f6end.camX === 'number') {
      const g89cx = (vennTargets[0].x + vennTargets[1].x + vennTargets[2].x) / 3;
      const g89cy = (vennTargets[0].y + vennTargets[1].y + vennTargets[2].y) / 3;
      translate(g89cx, g89cy);
      rotate(seg89SceneAngle);
      translate(-g89cx, -g89cy);
    }

    for (let i = 0; i < 3; i++) {
      const x = vennTargets[i].x;
      const y = vennTargets[i].y;
      noStroke();
      noFill();
      ellipse(x, y, vennD, vennD);

      noFill();
      stroke(0, specGallery2Shell() ? 255 : 220);
      strokeWeight(3 * ls);
      strokeJoin(ROUND);
      strokeCap(ROUND);
      ellipse(x, y, vennD, vennD);

      fill(0);
      textAlign(CENTER, CENTER);
      textSize(vennTextPx);
      noStroke();
      const wx = x + finalLayouts[i].dx;
      const wy = y + finalLayouts[i].dy;
      push();
      translate(wx, wy);
      rotate(finalLayouts[i].theta);
      text(WORDS[i], 0, 0);
      pop();
    }

    if (
      galleryExtended &&
      galleryFrame === 2 &&
      typeof window !== 'undefined' &&
      (window.__SPEC_ALL_PHRASES_STILL__ === true || window.__SPEC_ALL_OVERLAP_TEXTS_STILL__ === true)
    ) {
      const allOverlapTextsStill = window.__SPEC_ALL_OVERLAP_TEXTS_STILL__ === true;
      const showIndividualPhrases = window.__SPEC_ALL_PHRASES_STILL__ === true || allOverlapTextsStill;
      const showOverlapBlocks =
        allOverlapTextsStill ||
        (window.__SPEC_ALL_PHRASES_STILL__ === true && window.__SPEC_LOGO_STILL__ === true);
      if (motionSegment === '89') {
        // Still 08 space lines fade while camera zooms out + scene rotates to upright (Still 09).
        if (f6end && typeof f6end.camX === 'number' && seg89SpacePhraseAlpha > 0) {
          const phrases = SPECK_INSPECT_SPACE_PHRASES;
          const c0 = vennTargets[0];
          const c1 = vennTargets[1];
          const c2 = vennTargets[2];
          const rCirc = rFinal;
          const inSpeckInspectOnlyLobe = (px, py) => {
            const d0 = Math.sqrt((px - c0.x) ** 2 + (py - c0.y) ** 2);
            const d1 = Math.sqrt((px - c1.x) ** 2 + (py - c1.y) ** 2);
            const d2 = Math.sqrt((px - c2.x) ** 2 + (py - c2.y) ** 2);
            return d0 <= rCirc * 0.99 && d1 <= rCirc * 0.99 && d2 >= rCirc * 1.02;
          };
          const graphCX = (c0.x + c1.x + c2.x) / 3;
          const graphCY = (c0.y + c1.y + c2.y) / 3;
          const anglePh = seg89SceneAngle;
          // Match compact frame 6 Still 08: phrase stack anchored to canvas center (cx, cy), not
          // speck–inspect midpoint — per-line x from lobeCenterScreenXAtY uses screenToUnrotWorldPhrase.
          const screenToUnrotWorldPhrase = (sx, sy) => {
            const rx = (sx - cx) / camZoom + camX;
            const ry = (sy - screenY) / camZoom + camY;
            const ca = Math.cos(anglePh);
            const sa = Math.sin(anglePh);
            const ddx = rx - graphCX;
            const ddy = ry - graphCY;
            const ox = ca * ddx + sa * ddy;
            const oy = -sa * ddx + ca * ddy;
            return { x: graphCX + ox, y: graphCY + oy };
          };
          push();
          resetMatrix();
          textAlign(CENTER, CENTER);
          textSize(20 * ls);
          textLeading(26 * ls);
          fill(0, seg89SpacePhraseAlpha);
          noStroke();
          const n = phrases.length;
          const mid = (n - 1) / 2;
          const baseScr = { x: cx, y: cy };
          const lobeCenterScreenXAtY = (sy) => {
            const samples = 160;
            let minX = Infinity;
            let maxX = -Infinity;
            for (let si = 0; si <= samples; si++) {
              const sx = (width * si) / samples;
              const w = screenToUnrotWorldPhrase(sx, sy);
              if (!inSpeckInspectOnlyLobe(w.x, w.y)) continue;
              if (sx < minX) minX = sx;
              if (sx > maxX) maxX = sx;
            }
            return Number.isFinite(minX) && Number.isFinite(maxX) && maxX > minX
              ? (minX + maxX) * 0.5
              : baseScr.x;
          };
          for (let pi = 0; pi < n; pi++) {
            const lineY = baseScr.y + (pi - mid) * (26 * ls);
            const lineX = lobeCenterScreenXAtY(lineY);
            text(phrases[pi], lineX, lineY);
          }
          pop();
        }
      }

      if (showOverlapBlocks) {
        // Still 10/11: overlay all overlap-phrase blocks in their own overlap regions.
        const c0 = vennTargets[0];
        const c1 = vennTargets[1];
        const c2 = vennTargets[2];
        const r = rFinal * 0.995;
        const inA = (px, py) =>
          dist(px, py, c0.x, c0.y) <= r &&
          dist(px, py, c2.x, c2.y) <= r &&
          dist(px, py, c1.x, c1.y) > r;
        const inB = (px, py) =>
          dist(px, py, c1.x, c1.y) <= r &&
          dist(px, py, c2.x, c2.y) <= r &&
          dist(px, py, c0.x, c0.y) > r;
        const inC = (px, py) =>
          dist(px, py, c0.x, c0.y) <= r &&
          dist(px, py, c1.x, c1.y) <= r &&
          dist(px, py, c2.x, c2.y) > r;
        const regionCenter = (predicate) => {
          const pad = rFinal * 1.05;
          const bx0 = Math.min(c0.x, c1.x, c2.x) - pad;
          const bx1 = Math.max(c0.x, c1.x, c2.x) + pad;
          const by0 = Math.min(c0.y, c1.y, c2.y) - pad;
          const by1 = Math.max(c0.y, c1.y, c2.y) + pad;
          const gridN = 36;
          let accX = 0;
          let accY = 0;
          let nHit = 0;
          for (let gi = 0; gi <= gridN; gi++) {
            for (let gj = 0; gj <= gridN; gj++) {
              const px = bx0 + ((bx1 - bx0) * gi) / gridN;
              const py = by0 + ((by1 - by0) * gj) / gridN;
              if (!predicate(px, py)) continue;
              accX += px;
              accY += py;
              nHit++;
            }
          }
          if (!nHit) return null;
          return { x: accX / nHit, y: accY / nHit };
        };
        const graphCenterWorld = {
          x: (c0.x + c1.x + c2.x) / 3,
          y: (c0.y + c1.y + c2.y) / 3,
        };
        const gcxOv = graphCenterWorld.x;
        const gcyOv = graphCenterWorld.y;
        const toScreen = (wx, wy) => {
          let rwx = wx;
          let rwy = wy;
          if (segment89 && seg89SceneAngle !== 0) {
            const ca = Math.cos(seg89SceneAngle);
            const sa = Math.sin(seg89SceneAngle);
            const ox = wx - gcxOv;
            const oy = wy - gcyOv;
            rwx = gcxOv + ca * ox - sa * oy;
            rwy = gcyOv + sa * ox + ca * oy;
          }
          return {
            x: cx + (rwx - camX) * camZoom,
            y: screenY + (rwy - camY) * camZoom,
          };
        };
        const graphCenterScreen = toScreen(graphCenterWorld.x, graphCenterWorld.y);
        const ca = regionCenter(inA);
        const cb = regionCenter(inB);
        const cc = regionCenter(inC);
        const REF_ZOOM_STILL03 = 2.35;
        const zoomScale = Math.max(0.35, camZoom / REF_ZOOM_STILL03);
        const styleSize = 14.5 * ls * zoomScale;
        const lineStep = styleSize * 1.22;
        const drawBlock = (phrases, center) => {
          if (!center) return;
          const vx = center.x - graphCenterScreen.x;
          const vy = center.y - graphCenterScreen.y;
          // Tangential orientation: phrase baseline is perpendicular to radial line.
          const theta = Math.atan2(vy, vx) + Math.PI / 2;
          const n = phrases.length;
          const mid = (n - 1) / 2;
          push();
          translate(center.x, center.y);
          rotate(theta);
          for (let i = 0; i < n; i++) {
            text(phrases[i], 0, (i - mid) * lineStep);
          }
          pop();
        };
        push();
        resetMatrix();
        textAlign(CENTER, CENTER);
        textSize(styleSize);
        textLeading(lineStep);
        fill(0, 255 * fadeOverlap);
        noStroke();
        drawBlock(SPECK_SPECTRUM_OVERLAP_PHRASES, ca ? toScreen(ca.x, ca.y) : null);
        drawBlock(INSPECT_SPECTRUM_PAIR_PHRASES, cb ? toScreen(cb.x, cb.y) : null);
        drawBlock(SPECK_INSPECT_SPACE_PHRASES, cc ? toScreen(cc.x, cc.y) : null);
    pop();
      }

      if (showIndividualPhrases) {
        // Still 09: same zoomed-out frame as still02, phrases anchored to each word (not canvas).
        const speckWx = vennTargets[0].x + finalLayouts[0].dx;
        const speckWy = vennTargets[0].y + finalLayouts[0].dy;
        const inspectWx = vennTargets[1].x + finalLayouts[1].dx;
        const inspectWy = vennTargets[1].y + finalLayouts[1].dy;
        const spectrumWx = vennTargets[2].x + finalLayouts[2].dx;
        const spectrumWy = vennTargets[2].y + finalLayouts[2].dy;
        // Match Still03 look, but scaled for zoomed-out frame-2 view.
        const REF_ZOOM_STILL03 = 2.35;
        const zoomScale = Math.max(0.35, camZoom / REF_ZOOM_STILL03);
        const gap = 74 * ls * zoomScale;
        const styleSize = 20 * ls * zoomScale;
        const gcxInd = (vennTargets[0].x + vennTargets[1].x + vennTargets[2].x) / 3;
        const gcyInd = (vennTargets[0].y + vennTargets[1].y + vennTargets[2].y) / 3;
        const placeRelativeToLabel = (wx, wy, theta, mode, phrase) => {
          let rwx = wx;
          let rwy = wy;
          if (segment89 && seg89SceneAngle !== 0) {
            const ca = Math.cos(seg89SceneAngle);
            const sa = Math.sin(seg89SceneAngle);
            const ox = wx - gcxInd;
            const oy = wy - gcyInd;
            rwx = gcxInd + ca * ox - sa * oy;
            rwy = gcyInd + sa * ox + ca * oy;
          }
          const sx = cx + (rwx - camX) * camZoom;
          const sy = screenY + (rwy - camY) * camZoom;
          const sign = mode === 'above' ? -1 : 1;
          const thetaScr = theta + (segment89 ? seg89SceneAngle : 0);
          const dx = -Math.sin(thetaScr) * gap * sign;
          const dy = Math.cos(thetaScr) * gap * sign;
          push();
          resetMatrix();
          translate(sx + dx, sy + dy);
          rotate(thetaScr);
          text(phrase, 0, 0);
          pop();
        };

        textAlign(CENTER, CENTER);
        textSize(styleSize);
        if (specGallery1Or15InkTypography()) {
          noStroke();
          fill(0, 255 * fadeIndividual);
        } else {
          stroke(0);
          strokeWeight(Math.max(0.9, 1.5 * ls * zoomScale));
          stroke(0, 255 * fadeIndividual);
          fill(255, 255 * fadeIndividual);
        }
        placeRelativeToLabel(speckWx, speckWy, finalLayouts[0].theta, 'below', POST2_DESCRIPTION);
        placeRelativeToLabel(inspectWx, inspectWy, finalLayouts[1].theta, 'above', INSPECT_STILL_PHRASES[0]);
        placeRelativeToLabel(spectrumWx, spectrumWy, finalLayouts[2].theta, 'above', SPECTRUM_STILL_PHRASES[0]);
      }

      if (typeof window !== 'undefined' && window.__SPEC_LOGO_STILL__ === true && specLogoImg) {
        push();
        resetMatrix();
        tint(255, 255 * fadeLogo);
        imageMode(CENTER);
        const maxW = width * 0.22;
        const maxH = height * 0.22;
        const iw = Math.max(1, specLogoImg.width || 1);
        const ih = Math.max(1, specLogoImg.height || 1);
        const s = Math.min(maxW / iw, maxH / ih);
        image(specLogoImg, width / 2, height / 2, iw * s, ih * s);
        noTint();
        imageMode(CORNER);
        pop();
      }
    }
    pop();

    if (
      galleryExtended &&
      galleryFrame === 3 &&
      typeof window !== 'undefined' &&
      window.__SPEC_STILL03__ === true
    ) {
      const speckLabelWx = vennTargets[0].x + finalLayouts[0].dx;
      const speckLabelWy = vennTargets[0].y + finalLayouts[0].dy;
      const speckLabelSx = cx + (speckLabelWx - camX) * camZoom;
      const speckLabelSy = screenY + (speckLabelWy - camY) * camZoom;
      push();
      resetMatrix();
      textAlign(CENTER, CENTER);
      textSize(20 * ls);
      textLeading(20 * ls);
      if (specGallery1Or15InkTypography()) {
        noStroke();
        fill(0);
      } else {
        stroke(0);
        strokeWeight(Math.max(1.2, 2 * ls));
        fill(255);
      }
      text(POST2_DESCRIPTION, speckLabelSx, speckLabelSy + 90 * ls);
      pop();
    }

    // Post 2 definition sentence disabled in default gallery mode.
    return;
  }

  const t = ((millis() - sequenceStartMs) / 1000) % TOTAL;

  if (t < DURATION_ONE) {
    // Phase 1: circle fades in, "spec" lingers 3s (no zoom)
    const fadeIn = easeOutCubic(t / DURATION_FADE);
    const circleAlpha = 180 * fadeIn;
    const strokeAlpha = 80 * fadeIn;

    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, strokeAlpha * 1.6, 3, 101);

    const specAlpha = easeOutCubic((t - DURATION_FADE * 0.4) / (DURATION_FADE * 0.6));
    const specOpacity = 255 * specAlpha;

    textSize(specTextPx);
    // Metric-based vertical centering for this font:
    // position text baseline so the glyph box center aligns to cy
    const specBaselineY = cy + (textAscent() - textDescent()) / 2 + SPEC_VISUAL_Y * ls;
    textAlign(CENTER, BASELINE);
    fill(0, specOpacity);
    noStroke();
    text('spec', cx, specBaselineY);
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN) {
    // Phase 2: zoom INTO circle
    const s = (t - DURATION_ONE) / DURATION_ZOOM_IN;
    const ease = easeInOutCubic(s);
    const circleZoom = 1 + (CIRCLE_ZOOM_MAX - 1) * ease; // 1 -> 2
    const wordZoom = 1 + (WORD_ZOOM_MAX - 1) * ease;     // 1 -> 1.5

    // Circle zooms to 2.0x
    push();
    translate(cx, cy);
    scale(circleZoom);
    translate(-cx, -cy);
    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, 120, 3 / circleZoom, 102);
    pop();

    // Words zoom to 1.5x (reach max at same time as circle)
    push();
    translate(cx, cy);
    scale(wordZoom);
    translate(-cx, -cy);
    textSize(specTextPx);
    const specBaselineY = cy + (textAscent() - textDescent()) / 2 + SPEC_VISUAL_Y * ls;
    textAlign(CENTER, BASELINE);
    fill(0);
    noStroke();
    text('spec', cx, specBaselineY);
    pop();
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS) {
    // Phase 3: split 's' into three + pad words (speck, Inspect, spectrum) — inside one circle, zoomed in
    const elapsed = t - DURATION_ONE - DURATION_ZOOM_IN;
    const sSplit = Math.min(1, elapsed / 1); // first 1s: split three s's
    const easeSplit = easeOutCubic(sSplit);
    const sWords = (elapsed - 1) / (DURATION_S_AND_WORDS - 1); // rest: build words
    const easeWords = easeInOutCubic(sWords * 1.02);
    const step = Math.min(Math.floor(easeWords * TOTAL_LETTERS), TOTAL_LETTERS - 1);

    let n0 = 0, n1 = 0, n2 = 0;
    if (step < 5) {
      n0 = step + 1;
    } else if (step < 12) {
      n0 = 5;
      n1 = step - 5 + 1;
    } else {
      n0 = 5;
      n1 = 7;
      n2 = step - 12 + 1;
    }

    const part0 = WORDS[0].substring(0, n0);
    // Inspect is drawn specially so "In" appears before a fixed 's'
    const inspectProgress = n1; // 0..7 from the existing stepper
    const part2 = WORDS[2].substring(0, n2);
    const display2 = part2.length > 0 ? part2 : 's';

    // Circle stays at 2.0x while inside phase 3
    push();
    translate(cx, cy);
    scale(CIRCLE_ZOOM_MAX);
    translate(-cx, -cy);
    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, 120, 3 / CIRCLE_ZOOM_MAX, 103);
    pop();

    // Words stay at 1.5x while inside phase 3
    push();
    translate(cx, cy);
    scale(WORD_ZOOM_MAX);
    translate(-cx, -cy);

    textAlign(CENTER, CENTER);
    textSize(specTextPx);
    fill(0);
    noStroke();

    if (easeWords <= 0) {
      // only three s's splitting at original 's' position in "spec"
      // Keep lowercase 's' consistent with word-building phase
      textSize(specTextPx);
      textAlign(CENTER, CENTER);
      for (let i = 0; i < 3; i++) {
        const y = lerp(cy, linePositions[i].y, easeSplit);
        text('s', sCenterX, y);
      }
    } else {
      // words building — left-align so 's' stays at original spec position
      textSize(specTextPx);
      // Smoothly recenter the 3-line block near the end of typing (avoid a sudden snap)
      // Start recentering during the last portion of the word-build phase.
      const RECENTER_START = 0.85; // start when typing progress reaches 85%
      const recenterT = Math.max(0, Math.min(1, (easeWords - RECENTER_START) / (1 - RECENTER_START)));
      // smootherstep for extra softness
      const recenterEase = smootherstep(recenterT);
      const xLeft = lerp(sLeftX, centeredLeftX, recenterEase);

      textAlign(LEFT, CENTER);
      if (part0.length > 0) text(part0, xLeft, linePositions[0].y);

      // Inspect: keep the 's' fixed; show "I" in its FINAL spot, then add "n",
      // then build "pect" after the fixed 's' (so the prefix doesn't shift when 'n' appears).
      // Progress mapping:
      // 0: "s"
      // 1: "I" (already at final x) + "s"
      // 2+: "In" (with I staying put) + "s" + ("p","pe","pec","pect")
      const suffixLen = Math.min(4, Math.max(0, inspectProgress - 2));
      const suffix = 'pect'.substring(0, suffixLen);

      // Draw prefix with fixed positions (no shifting)
      const wIn = textWidth('in');
      const wI = textWidth('i');
      const prefixLeft = xLeft - wIn; // left edge of full "In" block (final position)
      if (inspectProgress >= 1) {
        textAlign(LEFT, CENTER);
        text('i', prefixLeft, linePositions[1].y);
      }
      if (inspectProgress >= 2) {
        textAlign(LEFT, CENTER);
        text('n', prefixLeft + wI, linePositions[1].y);
      }
      // The fixed 's'
      textAlign(LEFT, CENTER);
      text('s', xLeft, linePositions[1].y);
      // Suffix left-aligned after the 's'
      if (suffix.length > 0) {
        text(suffix, xLeft + twS, linePositions[1].y);
      }

      // Spectrum (and others) continue normally
      textAlign(LEFT, CENTER);
      text(display2, xLeft, linePositions[2].y);
    }
    pop();
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS + DURATION_ZOOM_OUT) {
    // Phase 4: zoom OUT — single circle, three words stacked (no Venn yet)
    // Slight multiplier ensures we actually reach 1.0 before phase ends
    const s = Math.min(
      1,
      Math.max(0, ((t - DURATION_ONE - DURATION_ZOOM_IN - DURATION_S_AND_WORDS) / DURATION_ZOOM_OUT) * 1.02)
    );
    const ease = easeInOutCubic(s);
    const circleZoom = CIRCLE_ZOOM_MAX - (CIRCLE_ZOOM_MAX - 1) * ease; // 2 -> 1
    const wordZoom = WORD_ZOOM_MAX - (WORD_ZOOM_MAX - WORD_ZOOM_OUT_END) * ease; // 1.5 -> 0.5

    // Circle zooms out from 2.0x -> 1.0x
    push();
    translate(cx, cy);
    scale(circleZoom);
    translate(-cx, -cy);

    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, 120, 3 / circleZoom, 104);
    pop();

    // Words zoom out from 1.5x -> 1.0x (same timing)
    push();
    translate(cx, cy);
    scale(wordZoom);
    translate(-cx, -cy);
    textSize(specTextPx);
    fill(0);
    noStroke();

    // speck
    textAlign(LEFT, CENTER);
    text(WORDS[0], centeredLeftX, linePositions[0].y);

    // Inspect (keep 's' fixed even when fully spelled)
    textAlign(RIGHT, CENTER);
    text('in', centeredLeftX, linePositions[1].y);
    textAlign(LEFT, CENTER);
    text('s', centeredLeftX, linePositions[1].y);
    text('pect', centeredLeftX + twS, linePositions[1].y);

    // spectrum
    textAlign(LEFT, CENTER);
    text(WORDS[2], centeredLeftX, linePositions[2].y);
    pop();
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS + DURATION_ZOOM_OUT + DURATION_HOLD) {
    // Phase 5: hold at original scale (1.0x) before Venn split
    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, 120, 3, 105);

    // Keep words at the zoom-out end scale (0.5x) during the hold
    push();
    translate(cx, cy);
    scale(WORD_ZOOM_OUT_END);
    translate(-cx, -cy);
    textAlign(LEFT, CENTER);
    textSize(specTextPx);
    fill(0);
    noStroke();
    text(WORDS[0], centeredLeftX, linePositions[0].y);
    // Inspect (keep 's' fixed)
    textAlign(RIGHT, CENTER);
    text('in', centeredLeftX, linePositions[1].y);
    textAlign(LEFT, CENTER);
    text('s', centeredLeftX, linePositions[1].y);
    text('pect', centeredLeftX + twS, linePositions[1].y);
    text(WORDS[2], centeredLeftX, linePositions[2].y);
    pop();
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS + DURATION_ZOOM_OUT + DURATION_HOLD + DURATION_VENN) {
    // Phase 6: split into 3 Venn circles — circles drag out from center, each with a word (after zoom out + hold)
    const sRaw = (t - DURATION_ONE - DURATION_ZOOM_IN - DURATION_S_AND_WORDS - DURATION_ZOOM_OUT - DURATION_HOLD) / DURATION_VENN;
    const s = Math.max(0, Math.min(1, sRaw));
    // Smootherstep for a softer start/end (more dynamic acceleration)
    const ease = smootherstep(s);

    // Crossfade: keep the single circle at first, then fade in the 3 circles as they split out
    const fadeT = Math.max(0, Math.min(1, s / 0.35)); // fade-in completes early
    const fade = smootherstep(fadeT);

    // Start from the single (zoomed-out) circle and have it split into three circles.
    // Words follow their corresponding circle as it moves out.
    const baseColor = [255, 255, 255, 255];
    const textSz = vennTextPx; // text stays the same while circles scale up

    // Compute final exclusive-region offsets + rotations ONCE and cache them to avoid twitches.
    const rFinal = vennD / 2;
    const key = `${rFinal}|${vennTextPx}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, vennTextPx);
    }
    const finalLayouts = cachedFinalLayouts;

    // Draw the original circle fading out
    noStroke();
    noFill();
    ellipse(cx, cy, circleSize, circleSize);
    drawInkCircleOutline(cx, cy, circleSize / 2, 255 * (1 - fade), 3, 106);

    for (let i = 0; i < 3; i++) {
      const x = lerp(cx, vennTargets[i].x, ease);
      const y = lerp(cy, vennTargets[i].y, ease);
      const d = lerp(circleSize, vennD, ease);

      const rC = lerp(baseColor[0], vennColors[i][0], ease);
      const gC = lerp(baseColor[1], vennColors[i][1], ease);
      const bC = lerp(baseColor[2], vennColors[i][2], ease);
      const aC = lerp(baseColor[3], vennColors[i][3], ease);

      noStroke();
      noFill();
      ellipse(x, y, d, d);
      drawInkCircleOutline(x, y, d / 2, 120 * fade, 3, 200 + i);

      fill(0);
      textAlign(CENTER, CENTER);
      textSize(textSz);
      noStroke();
      // Start with the stacked word positions in the single circle (as displayed in hold),
      // then move each word's CENTER into its circle center.
      // Compute the *actual on-screen* starting center from the hold transform:
      // hold uses scale(WORD_ZOOM_OUT_END) around (cx, cy).
      //
      // Also, all three words share the same vertical 's' alignment at x = centeredLeftX,
      // but Inspect extends left because \"In\" is right-aligned to that same x.
      textSize(specTextPx);
      const w48 = textWidth(WORDS[i]);
      const inW = textWidth('in');
      const leftWorldX = (i === 1) ? (centeredLeftX - inW) : centeredLeftX; // Inspect vs others
      const centerWorldX = leftWorldX + w48 / 2;
      const centerWorldY = linePositions[i].y;
      const startWX = cx + (centerWorldX - cx) * WORD_ZOOM_OUT_END;
      const startWY = cy + (centerWorldY - cy) * WORD_ZOOM_OUT_END;

      // Target: exclusive (non-overlap) region inside this circle (scaled as circle grows)
      const rCur = d / 2;
      const scaleToCur = rCur / rFinal;
      const targetX = x + finalLayouts[i].dx * scaleToCur;
      const targetY = y + finalLayouts[i].dy * scaleToCur;
      // Finish rotation slightly early so Phase 7 doesn't "snap" the last bit.
      const rotEase = Math.min(1, ease * 1.03);
      const theta = finalLayouts[i].theta * rotEase;

      // Move word center from its original stacked position to its exclusive-region target
      const wx = lerp(startWX, targetX, ease);
      const wy = lerp(startWY, targetY, ease);

      fill(0, 255 * fade);
      push();
      translate(wx, wy);
      rotate(theta);
      textSize(textSz);
      text(WORDS[i], 0, 0);
      pop();
    }
  } else {
    // Phase 7: hold final Venn diagram before looping
    // In static-final mode we can land directly in Phase 7 without ever running Phase 6,
    // so ensure final label layouts are computed here too.
    const rFinal = vennD / 2;
    const key = `${rFinal}|${vennTextPx}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, vennTextPx);
    }

    const finalLayouts = cachedFinalLayouts;
    for (let i = 0; i < 3; i++) {
      const x = vennTargets[i].x;
      const y = vennTargets[i].y;
      noStroke();
      noFill();
      ellipse(x, y, vennD, vennD);
      if (staticFinalMode) {
        noFill();
        stroke(0, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      } else {
        drawInkCircleOutline(x, y, vennD / 2, 120, 3, 700 + i);
      }
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(vennTextPx);
      noStroke();
      const wx = x + finalLayouts[i].dx;
      const wy = y + finalLayouts[i].dy;
      push();
      translate(wx, wy);
      rotate(finalLayouts[i].theta);
      text(WORDS[i], 0, 0);
      pop();
    }
  }

}

// --- minimalist ink-blobbing circle outline ---
function drawInkCircleOutline(cx, cy, r, alpha = 120, weight = 3, seed = 0) {
  const ls = width / LAYOUT_REF_W;
  const t = (millis() / 1000) * 0.35;
  const points = 140;
  const amp = 2.2 * ls;     // subtle wobble
  const blobAmp = 5.5 * ls; // occasional blobbing
  const freq = 0.9;

  push();
  noFill();
  stroke(0, 0, 0, alpha);
  strokeWeight(weight * ls);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  beginShape();
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * TWO_PI;
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    // noise sampled in a circle around origin, with time
    const n = noise(ca * freq + 10 + seed, sa * freq + 10 + seed, t);
    const b = noise(ca * (freq * 0.6) + 50 + seed, sa * (freq * 0.6) + 50 + seed, t * 0.6);
    const blob = Math.pow(Math.max(0, (b - 0.62) / 0.38), 2) * blobAmp;
    const dr = (n - 0.5) * 2 * amp + blob;

    vertex(cx + ca * (r + dr), cy + sa * (r + dr));
  }
  endShape();

  pop();
}
