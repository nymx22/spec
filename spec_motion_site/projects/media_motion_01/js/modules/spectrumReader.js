/**
 * Spectrum scan math (inverse projection, vertical runs, sweep). Depends on `Easing` for `sweepLocal` lerp only.
 * Draw/orchestration stays in sketch.js.
 */
const SpectrumReader = {};

/**
 * Inverse of gallery frame-4 stack: translate(cx,screenY) scale(camZoom) translate(-camX,-camY),
 * then rotate(sceneAngle) about (graphCX, graphCY).
 */
SpectrumReader.screenToWorld = function (sx, sy, cam) {
  const rx = (sx - cam.cx) / cam.camZoom + cam.camX;
  const ry = (sy - cam.screenY) / cam.camZoom + cam.camY;
  const ca = Math.cos(cam.sceneAngle);
  const sa = Math.sin(cam.sceneAngle);
  const ddx = rx - cam.graphCX;
  const ddy = ry - cam.graphCY;
  const ox = ca * ddx + sa * ddy;
  const oy = -sa * ddx + ca * ddy;
  return { x: cam.graphCX + ox, y: cam.graphCY + oy };
};

SpectrumReader.worldToScreen = function (wx, wy, cam) {
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
};

/** True if any reader scan strip (center **x**, half-width **half**) overlaps screen-x interval `[left, right]`. */
SpectrumReader.scanStripsHitInterval = function (left, right, strips) {
  if (!strips || strips.length === 0) return false;
  for (let i = 0; i < strips.length; i++) {
    const x = strips[i].x;
    const h = strips[i].half;
    if (!(x + h < left || x - h > right)) return true;
  }
  return false;
};

/**
 * Contiguous canvas-vertical segments where a thick vertical stroke fits inside the exclusive region.
 * When `halfStrokePx` > 0, both horizontal edges of the stroke (center ± half width) must test inside;
 * otherwise only the center column is used (thin stroke).
 */
SpectrumReader.verticalRunsAtScreenX = function (scanSx, inExclusiveFn, yStepPx, cam, halfStrokePx, canvasH) {
  const h = typeof halfStrokePx === 'number' && halfStrokePx > 0 ? halfStrokePx : 0;
  const runs = [];
  let runStart = null;
  const H = canvasH;
  for (let sy = 0; sy <= H; sy += yStepPx) {
    let inside;
    if (h > 0) {
      const wl = SpectrumReader.screenToWorld(scanSx - h, sy, cam);
      const wr = SpectrumReader.screenToWorld(scanSx + h, sy, cam);
      inside = inExclusiveFn(wl.x, wl.y) && inExclusiveFn(wr.x, wr.y);
    } else {
      const w = SpectrumReader.screenToWorld(scanSx, sy, cam);
      inside = inExclusiveFn(w.x, w.y);
    }
    if (inside && runStart === null) runStart = sy;
    if (!inside && runStart !== null) {
      runs.push({ y0: runStart, y1: sy });
      runStart = null;
    }
  }
  if (runStart !== null) runs.push({ y0: runStart, y1: H });
  return runs;
};

/**
 * Left/right extent along the label baseline through `(wx, wy)` where `inExclusiveFn(world)` is true.
 * Returns `s` in label-local units: world point `(wx + cos θ·s, wy + sin θ·s)`.
 */
SpectrumReader.sweepSpanAlongWord = function (wx, wy, cosT, sinT, rFinal, inExclusiveFn) {
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
};

/** Ping-pong `xSweepL` along [xLeft,xRight] for normalized time `u` in [0,1); `sweepFrac` is the sweep portion of the cycle. */
SpectrumReader.sweepLocal = function (u, sweepFrac, xLeft, xRight) {
  const inSweep = u < sweepFrac;
  let xSweepL;
  let sweepForwardHalf = false;
  if (inSweep) {
    const tSweep = u / sweepFrac;
    if (tSweep < 0.5) {
      sweepForwardHalf = true;
      xSweepL = Easing.lerp(xLeft, xRight, tSweep * 2);
    } else {
      xSweepL = Easing.lerp(xRight, xLeft, (tSweep - 0.5) * 2);
    }
  } else {
    xSweepL = xLeft;
  }
  return { xSweepL, inSweep, sweepForwardHalf };
};
