/**
 * post1.2 · 3 — Same Venn geometry + label placement as gallery **frame 1** (`sketch.js`);
 * step-2 LiquidFun bucket in the speck circle, clipped to that circle.
 */
const LAYOUT_REF_W = 600;
const VENN_OFFSET = 55;
const VENN_R = 85;
const VENN_SCALE = 1.7;
const VENN_SIZE_SCALED = VENN_R * 2 * VENN_SCALE;
const VENN_TEXT_SIZE = 24;
const WORDS = ['speck', 'inspect', 'spectrum'];

// --- exclusive label layout (must match sketch.js gallery frame 1) ---
const FIXED_LABEL_THETAS = [0, null, null];
const LABEL_MIN_DIST_FRAC_TOP = 0.48;
const LABEL_MAX_DIST_FRAC_TOP = 0.68;
const LABEL_MIN_DIST_FRAC_BOTTOM = 0.48;
const LABEL_MAX_DIST_FRAC_BOTTOM = 0.68;
const LABEL_DIST_STEP = 0.05;
const LABEL_MARGIN_PX = 2;

/** Set before any label hit-test; mirrors sketch `layoutMarginScale`. */
let _layoutLs = 1;

let _cachedFinalLayouts = null;
let _cachedFinalLayoutsKey = '';

function distSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function pointInsideCircle(px, py, c, r) {
  const m = LABEL_MARGIN_PX * _layoutLs;
  return distSq(px, py, c.x, c.y) < (r - m) * (r - m);
}

function pointOutsideCircle(px, py, c, r) {
  const m = LABEL_MARGIN_PX * _layoutLs;
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

function rotatedRectFits(px, py, theta, w, h, i, centers, r) {
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
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function makeTextUpright(theta) {
  let t = normalizeAnglePi(theta);
  if (t > Math.PI / 2) t -= Math.PI;
  if (t < -Math.PI / 2) t += Math.PI;
  return t;
}

function computeExclusiveLabelLayout(centers, r, words, textPx) {
  textSize(textPx);
  const h = textAscent() + textDescent();
  const layouts = [];

  for (let i = 0; i < 3; i++) {
    const ci = centers[i];
    const others = centers.filter((_, idx) => idx !== i);

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
    const thetaCandidates = typeof fixed === 'number'
      ? [fixed]
      : [makeTextUpright(baseTheta + Math.PI / 2), makeTextUpright(baseTheta - Math.PI / 2)];

    const minFrac = i === 0 ? LABEL_MIN_DIST_FRAC_TOP : LABEL_MIN_DIST_FRAC_BOTTOM;
    const maxFrac = i === 0 ? LABEL_MAX_DIST_FRAC_TOP : LABEL_MAX_DIST_FRAC_BOTTOM;

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

    if (!best) {
      for (let frac = maxFrac; frac >= minFrac; frac -= LABEL_DIST_STEP) {
        const px = ci.x + dx * (frac * r);
        const py = ci.y + dy * (frac * r);
        if (isExclusivePoint(px, py, i, centers, r)) {
          const th = typeof fixed === 'number' ? fixed : makeTextUpright(baseTheta + Math.PI / 2);
          best = { dx: px - ci.x, dy: py - ci.y, theta: th };
          break;
        }
      }
    }
    layouts.push(best || { dx: 0, dy: 0, theta: 0 });
  }

  return layouts;
}

function vennTargetsFor(cx, cy, offset) {
  return [
    { x: cx, y: cy - offset },
    { x: cx - offset * 0.9, y: cy + offset * 0.6 },
    { x: cx + offset * 0.9, y: cy + offset * 0.6 },
  ];
}

function ensureFinalLayouts(vennTargets, rFinal, vennTextPx, ls) {
  _layoutLs = ls;
  const key = `${rFinal}|${vennTextPx}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
    `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
  if (_cachedFinalLayoutsKey !== key) {
    _cachedFinalLayoutsKey = key;
    computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
    _cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, vennTextPx);
  }
  return _cachedFinalLayouts;
}

function specCompositeFontUrl(file) {
  if (typeof document === 'undefined') return '../fonts/' + file;
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].src;
    if (src && /\/vennLiquidFunComposite\.js(\?|#|$)/.test(src)) {
      try {
        return new URL(`../fonts/${file}`, src).href;
      } catch (e) {
        break;
      }
    }
  }
  return '../fonts/' + file;
}

let uiFont;
const speckGeom = { x: 0, y: 0, r: 0 };

function preload() {
  uiFont = loadFont(specCompositeFontUrl('genwan_latin_092725_1-R.otf'));
}

function recomputeSpeckGeom(vennTargets, vennD) {
  speckGeom.x = vennTargets[0].x;
  speckGeom.y = vennTargets[0].y;
  speckGeom.r = vennD / 2;
}

function initFluidInSpeck() {
  if (!window.SpecSpeckLiquid || !SpecSpeckLiquid.available()) return;
  const ls = width / LAYOUT_REF_W;
  const cx = width / 2;
  const cy = height / 2;
  const vennOff = VENN_OFFSET * ls;
  const vennD = VENN_SIZE_SCALED * ls;
  const vennTargets = vennTargetsFor(cx, cy, vennOff);
  recomputeSpeckGeom(vennTargets, vennD);
  const br = Math.min(speckGeom.r * 0.88, Math.min(width, height) * 0.32);
  SpecSpeckLiquid.initDemoWorld({
    width,
    height,
    bucketCx: speckGeom.x,
    bucketCy: speckGeom.y,
    bucketRadius: br,
  });
}

function setup() {
  const dim = window.specCanvas4x5 ? specCanvas4x5.compute() : { w: 480, h: 600 };
  const cnv = createCanvas(dim.w, dim.h);
  if (window.specCanvas4x5) specCanvas4x5.applyPixelDensity(window);
  const mainEl = typeof document !== 'undefined' ? document.querySelector('main') : null;
  if (mainEl && cnv && cnv.parent) cnv.parent(mainEl);

  if (window.specCanvas4x5 && specCanvas4x5.installMainResizeDispatch) {
    specCanvas4x5.installMainResizeDispatch();
  }

  if (uiFont) textFont(uiFont);

  if (!window.SpecSpeckLiquid || !SpecSpeckLiquid.available()) {
    console.error('[vennLiquidFunComposite] SpecSpeckLiquid / liquidfun not available');
    return;
  }
  initFluidInSpeck();
}

function windowResized() {
  if (!window.specCanvas4x5) return;
  const dim = specCanvas4x5.compute();
  resizeCanvas(dim.w, dim.h);
  specCanvas4x5.applyPixelDensity(window);
  _cachedFinalLayoutsKey = '';
  if (window.SpecSpeckLiquid && SpecSpeckLiquid.available()) {
    SpecSpeckLiquid.destroy();
    initFluidInSpeck();
  }
}

function draw() {
  background(255);

  const ls = width / LAYOUT_REF_W;
  const cx = width / 2;
  const cy = height / 2;
  const vennOff = VENN_OFFSET * ls;
  const vennD = VENN_SIZE_SCALED * ls;
  const vennTargets = vennTargetsFor(cx, cy, vennOff);
  const vennTextPx = VENN_TEXT_SIZE * ls;
  const rFinal = vennD / 2;

  if (uiFont) textFont(uiFont);
  const finalLayouts = ensureFinalLayouts(vennTargets, rFinal, vennTextPx, ls);

  for (let i = 0; i < 3; i++) {
    const x = vennTargets[i].x;
    const y = vennTargets[i].y;
    noStroke();
    noFill();
    ellipse(x, y, vennD, vennD);
    noFill();
    stroke(0, 220);
    strokeWeight(3 * ls);
    strokeJoin(ROUND);
    strokeCap(ROUND);
    ellipse(x, y, vennD, vennD);
  }

  if (!window.SpecSpeckLiquid) return;
  const dt = typeof deltaTime !== 'undefined' ? deltaTime : 16;
  SpecSpeckLiquid.step(dt);

  recomputeSpeckGeom(vennTargets, vennD);
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.arc(speckGeom.x, speckGeom.y, speckGeom.r * 0.99, 0, Math.PI * 2);
  drawingContext.clip();
  SpecSpeckLiquid.drawParticles(30, 100, 220);
  drawingContext.restore();

  if (uiFont) textFont(uiFont);
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(vennTextPx);
  for (let i = 0; i < 3; i++) {
    const x = vennTargets[i].x;
    const y = vennTargets[i].y;
    const wx = x + finalLayouts[i].dx;
    const wy = y + finalLayouts[i].dy;
    push();
    translate(wx, wy);
    rotate(finalLayouts[i].theta);
    text(WORDS[i], 0, 0);
    pop();
  }
}
