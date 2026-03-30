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

// Post 2 "definition sentence" (currently disabled per request).
// const POST2_DESCRIPTION =
//   "we want to stray from the obvious and popular and focus on things unnoticed, that people forget or take for granted.";
const POST2_DESCRIPTION = "";
const POST2_SHOW_DESCRIPTION = false;

let uiFont;
let cachedFinalLayouts = null;
let cachedFinalLayoutsKey = '';
let cnv;
let sequenceStartMs = 0;
let galleryAnimStartMs = 0;
let galleryLastFrame = 0;
let galleryTextStartMs = 0;

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
let descStartMs = 0;
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

/** Fonts live under `spec_motion_site/fonts/`; resolve from this script (`…/js/sketch.js`). */
function specSiteFontUrl(file) {
  if (typeof document === 'undefined') return '../fonts/' + file;
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].src;
    if (src && /\/sketch\.js(\?|#|$)/.test(src)) {
      try {
        return new URL(`../../../fonts/${file}`, src).href;
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

function ensurePost2Sediment(p5, targets, rFinal) {
  const cell = 5; // world px (finer grid = smoother accumulation)
  const minX = targets[0].x - rFinal;
  const maxX = targets[0].x + rFinal;
  const minY = targets[0].y - rFinal;
  const maxY = targets[0].y + rFinal;

  const cols = Math.max(12, Math.floor((maxX - minX) / cell));
  const rows = Math.max(12, Math.floor((maxY - minY) / cell));

  const key = `${Math.round(minX)}|${Math.round(minY)}|${cols}x${rows}|${Math.round(rFinal)}|` +
    `${Math.round(targets[1].x)}|${Math.round(targets[1].y)}|${Math.round(targets[2].x)}|${Math.round(targets[2].y)}|${width}x${height}|pd${p5.pixelDensity()}`;
  if (post2Sediment?.key === key) return;

  const allowed = new Uint8Array(cols * rows);
  const filled = new Uint8Array(cols * rows);
  const rowAllowed = new Uint16Array(rows);
  const rowFilled = new Uint16Array(rows);
  const rowAllowedCols = new Array(rows);
  const allowedCols = [];
  const hasCol = new Uint8Array(cols);
  let total = 0;

  for (let r = 0; r < rows; r++) {
    const y = minY + (r + 0.5) * cell;
    let rc = 0;
    const colsInRow = [];
    for (let c = 0; c < cols; c++) {
      const x = minX + (c + 0.5) * cell;
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

  post2Sediment = {
    key,
    g,
    maskWorldG,
    minX,
    minY,
    cell,
    cols,
    rows,
    allowed,
    filled,
    rowAllowed,
    rowFilled,
    rowAllowedCols,
    total,
    remaining: total,
    // fill from bottom up (but bottom of the *allowed region*, not the bounding box)
    scanRow: rows - 1,
    bottomRow: rows - 1,
    startedAtMs: 0,
    cellsPerParticle: 14,
    particles: [],
    allowedCols,
    gravity: 0.38,
    maxVy: 7.0,
    spawnPerTick: 2,
    lastSpawnMs: 0,
    done: false,
  };

  // Start at the lowest row that actually has allowed cells.
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
  if (!post2Sediment || post2Sediment.done) return;
  const s = post2Sediment;

  // If region is empty, finish immediately.
  if (s.scanRow < 0 || s.total <= 0) {
    s.done = true;
    s.remaining = 0;
    return;
  }

  const now = millis();
  const spawnEveryMs = 70;
  if (!s.lastSpawnMs) s.lastSpawnMs = now;
  if (now - s.lastSpawnMs >= spawnEveryMs) {
    const sr = sedimentSurfaceRow(s);
    const colsInRow = s.rowAllowedCols[sr] || s.allowedCols;
    for (let i = 0; i < s.spawnPerTick; i++) {
      const c = colsInRow[Math.floor(random(colsInRow.length))] ?? Math.floor(random(s.cols));
      const x = s.minX + (c + 0.5) * s.cell;
      const y = s.minY - random(25, 90);
      const ch = 'speck'.charAt(Math.floor(random(5)));
      s.particles.push({ x, y, vy: random(0.2, 1.3), ch });
    }
    s.lastSpawnMs = now;
  }

  const surfaceY = s.minY + sedimentSurfaceRow(s) * s.cell;

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.vy = Math.min(s.maxVy, p.vy + s.gravity);
    p.y += p.vy;

    if (p.y > s.minY + s.rows * s.cell + 180) {
      s.particles.splice(i, 1);
      continue;
    }

    if (p.y >= surfaceY && isInsideSpeckExclusive(p.x, p.y, targets, rFinal)) {
      sedimentFillSomeCells(s, s.cellsPerParticle);
      s.particles.splice(i, 1);
    }
  }
}

function renderPost2SedimentLayer(p5, targets, rFinal) {
  if (!post2Sediment) return null;
  const s = post2Sediment;
  const g = s.g;
  const maskW = s.maskWorldG;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, g.width, g.height);
  if (maskW) {
    const ctxM = maskW.drawingContext;
    ctxM.save();
    ctxM.globalCompositeOperation = 'source-over';
    ctxM.clearRect(0, 0, maskW.width, maskW.height);
    ctxM.restore();
  }

  // Solid black fill for already-filled cells (accumulation).
  g.noStroke();
  g.fill(0);
  if (maskW) {
    maskW.noStroke();
    maskW.fill(255);
  }
  const r0 = Math.max(0, s.scanRow);
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

  // Falling sediment glyphs above the surface.
  g.noStroke();
  g.fill(0);
  g.textAlign(CENTER, CENTER);
  g.textSize(18 * layoutMarginScale);
  if (uiFont) g.textFont(uiFont);
  for (const p of s.particles) {
    g.text(p.ch, p.x, p.y);
  }

  // Constrain everything to the speck-exclusive region.
  ctx.globalCompositeOperation = 'destination-in';
  g.image(renderSolidSpeckExclusive(p5, targets, rFinal), 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  if (maskW) {
    const ctxM = maskW.drawingContext;
    ctxM.save();
    ctxM.globalCompositeOperation = 'destination-in';
    maskW.image(renderSolidSpeckExclusive(p5, targets, rFinal), 0, 0);
    ctxM.globalCompositeOperation = 'source-over';
    ctxM.restore();
  }

  return g;
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

  layoutMarginScale = width / LAYOUT_REF_W;
  const ls = layoutMarginScale;

  const cx = width / 2;
  const cy = height / 2;
  const r = 120 * ls;
  const size = r * 2;

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
    [235, 235, 235, 150],
    [235, 235, 235, 150],
    [235, 235, 235, 150],
  ];

  if (galleryMode) {
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
    const desiredSpeckCenterY = height * 0.75;
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
      const u = (millis() - galleryAnimStartMs) / 2000;
      const t = Math.max(0, Math.min(1, u));
      const done = t >= 1;

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

      push();
      translate(cx, screenY);
      scale(camZoom);
      translate(-camX, -camY);

      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        noStroke();
        fill(245, 120);
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(120, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
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

      galleryLastFrame = galleryFrame;
      if (done) noLoop();
      return;
    }

    // Gallery 1 only: frame 4 = from zoomed speck, center graph on canvas, rotate ~60° left about graph centroid;
    // phrases sit in speck∩spectrum but outside inspect (no triple overlap), drawn horizontal in screen space.
    if (galleryFrame === 4 && !galleryExtended) {
      const overlapStill = typeof window !== 'undefined' && window.__SPEC_OVERLAP_STILL__ === true;
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
        if (!overlapStill) galleryAnimStartMs = millis();
        loop();
      }
      const tAnim = overlapStill
        ? 1
        : Math.max(0, Math.min(1, (millis() - galleryAnimStartMs) / 1200));
      const easeAnim = easeInOutCubic(tAnim);
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
      const camZoom = lerp(zoom2, zoomTarget, easeAnim);
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
      const camX = lerp(cam2.x, pr.x, easeAnim);
      const camY = lerp(cam2.y, pr.y, easeAnim);
      const screenY = lerp(cam2.screenY, cy, easeAnim);

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
        fill(245, 120);
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(120, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
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

      // Fade in after pan/zoom/rotate are mostly settled; stable layout + smootherstep avoids bumpy pops.
      const phraseFadeT0 = 0.64;
      if (tAnim > phraseFadeT0) {
        const u = Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = smootherstep(u);
        const phrases = SPECK_SPECTRUM_OVERLAP_PHRASES;
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
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = phraseSizeScreen * lineLead;
        textLeading(lineStep);
        textAlign(CENTER, CENTER);
        fill(0, 255 * phraseEase);
        noStroke();
        const n = phrases.length;
        const mid = (n - 1) / 2;
        for (let pi = 0; pi < n; pi++) {
          text(phrases[pi], baseScr.x, baseScr.y + (pi - mid) * lineStep);
        }
        pop();
      }

      // Handoff to compact slide 4: keep current camera, zoom, and rotation (even mid-animation).
      if (!overlapStill && typeof window !== 'undefined') {
        window.__SPEC_FRAME4_END__ = { camX, camY, camZoom, screenY, angle };
      }

      galleryLastFrame = galleryFrame;
      if (tAnim >= 1) noLoop();
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
      if (galleryLastFrame !== 5) {
        if (!pairStill) galleryAnimStartMs = millis();
        loop();
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
      const angleTarget = fromSlide3 ? f4end.angle + rotStep120 : rotStep120;
      const angleFrom = fromSlide3 ? f4end.angle : 0;

      const tAnim = pairStill
        ? 1
        : Math.max(0, Math.min(1, (millis() - galleryAnimStartMs) / 1200));
      const easeAnim = pairStill ? 1 : easeInOutCubic(tAnim);

      let angle;
      let camZoom;
      let camX;
      let camY;
      let screenY;
      if (pairStill) {
        const aEnd = rotSlide3 + rotStep120;
        angle = aEnd;
        camZoom = zoomTarget;
        const prS = phraseRotAt(aEnd);
        camX = prS.x;
        camY = prS.y;
        screenY = cy;
      } else {
        angle = lerp(angleFrom, angleTarget, easeAnim);
        const cam2f5 = fromSlide3
          ? { x: f4end.camX, y: f4end.camY, zoom: f4end.camZoom, screenY: f4end.screenY }
          : { x: targets[0].x, y: targets[0].y, zoom: zoom2, screenY: desiredSpeckCenterY };
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
        fill(245, 120);
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(120, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
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

      const phraseFadeT0 = 0.64;
      if (tAnim > phraseFadeT0) {
        const u = Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = smootherstep(u);
        const phrases = INSPECT_SPECTRUM_PAIR_PHRASES;
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
            if (!inInspectSpectrumOnlyLobe(w.x, w.y)) return false;
          }
          return true;
        };
        let phraseSizeScreen = Math.min(13 * ls * zoomPh, chordHalf * 0.95 * zoomPh);
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
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = phraseSizeScreen * lineLead;
        textLeading(lineStep);
        textAlign(CENTER, CENTER);
        fill(0, 255 * phraseEase);
        noStroke();
        const n = phrases.length;
        const mid = (n - 1) / 2;
        for (let pi = 0; pi < n; pi++) {
          text(phrases[pi], baseScr.x, baseScr.y + (pi - mid) * lineStep);
        }
        pop();
      }

      if (!pairStill && typeof window !== 'undefined') {
        window.__SPEC_FRAME5_END__ = { camX, camY, camZoom, screenY, angle };
      }

      galleryLastFrame = galleryFrame;
      if (tAnim >= 1) noLoop();
      return;
    }

    // Compact frame 6: speck ∩ inspect \ spectrum; from frame 5 add −120° (e.g. −180° → −300°).
    if (galleryFrame === 6 && !galleryExtended) {
      const targets = vennTargetsSpread;
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

      const spaceStill = typeof window !== 'undefined' && window.__SPEC_SPACE_PHRASES_STILL__ === true;
      if (galleryLastFrame !== 6) {
        if (!spaceStill) galleryAnimStartMs = millis();
        loop();
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
      const f5end = typeof window !== 'undefined' ? window.__SPEC_FRAME5_END__ : null;
      const fromSlide5 =
        f5end && typeof f5end.camX === 'number' && typeof f5end.angle === 'number';
      const rotSlide3 = (-60 * Math.PI) / 180;
      const rotStep120 = (-120 * Math.PI) / 180;
      const angleTarget = fromSlide5
        ? f5end.angle + rotStep120
        : rotSlide3 + 2 * rotStep120;
      const angleFrom = fromSlide5 ? f5end.angle : 0;

      const tAnim = spaceStill
        ? 1
        : Math.max(0, Math.min(1, (millis() - galleryAnimStartMs) / 1200));
      const easeAnim = spaceStill ? 1 : easeInOutCubic(tAnim);

      let angle;
      let camZoom;
      let camX;
      let camY;
      let screenY;
      if (spaceStill) {
        const aEnd = rotSlide3 + 2 * rotStep120;
        angle = aEnd;
        camZoom = zoomTarget;
        const prS = phraseRotAt(aEnd);
        camX = prS.x;
        camY = prS.y;
        screenY = cy;
      } else {
        angle = lerp(angleFrom, angleTarget, easeAnim);
        const cam2f6 = fromSlide5
          ? { x: f5end.camX, y: f5end.camY, zoom: f5end.camZoom, screenY: f5end.screenY }
          : { x: targets[0].x, y: targets[0].y, zoom: zoom2, screenY: desiredSpeckCenterY };
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
        fill(245, 120);
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(120, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
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

      const phraseFadeT0 = 0.64;
      if (tAnim > phraseFadeT0) {
        const u = Math.max(0, Math.min(1, (tAnim - phraseFadeT0) / (1 - phraseFadeT0)));
        const phraseEase = smootherstep(u);
        const phrases = SPECK_INSPECT_SPACE_PHRASES;
        const baseScr = { x: cx, y: cy };
        const padScr = Math.max(3, 4 * ls);
        const lineLead = 1.2;
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
        push();
        resetMatrix();
        textSize(phraseSizeScreen);
        const lineStep = phraseSizeScreen * lineLead;
        textLeading(lineStep);
        textAlign(CENTER, CENTER);
        fill(0, 255 * phraseEase);
        noStroke();
        const n = phrases.length;
        const mid = (n - 1) / 2;
        for (let pi = 0; pi < n; pi++) {
          text(phrases[pi], baseScr.x, baseScr.y + (pi - mid) * lineStep);
        }
        pop();
      }

      galleryLastFrame = galleryFrame;
      if (tAnim >= 1) noLoop();
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
        descStartMs = 0;
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
            ensurePost2Sediment(this, curTargets, rFinal);
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
        fill(245, 120);
        ellipse(x, y, vennD, vennD);
        noFill();
        stroke(120, 220);
        strokeWeight(3 * ls);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, vennD, vennD);
      }

      // Fill layer (speck-exclusive region) — behind text
      if (done) {
        if (useSediment) {
          ensurePost2Sediment(this, curTargets, rFinal);
          stepPost2Sediment(this, curTargets, rFinal);
          const layer = renderPost2SedimentLayer(this, curTargets, rFinal);
          if (layer) {
            noTint();
            image(layer, 0, 0);
          }
          inkDone = !!post2Sediment?.done;
          if (inkDone && !descStartMs) descStartMs = millis();
          if (inkDone) {
            // Fully solid black at the end (remove any tiny gaps).
            noTint();
            image(renderSolidSpeckExclusive(this, curTargets, rFinal), 0, 0);
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
            if (inkDone && !descStartMs) descStartMs = millis();
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

      // Description + push behavior:
      // - Frame 4 (ink): description reveals after fill completes.
      // - Frame 5 (sediment): sentence exists immediately; speck starts getting pushed once sediment begins.
      if (done && useSediment && post2Sediment) {
        const labelWorldX = curSpeck.x + curLayouts[0].dx;
        const labelWorldY = curSpeck.y + curLayouts[0].dy;
        const labelScreenX = cx + (labelWorldX - camX) * camZoom;
        const labelScreenY = screenY + (labelWorldY - camY) * camZoom;

        const margin = 28 * ls;
        const boxW = Math.min(520 * ls, width - margin * 2);
        const boxH = Math.min(240 * ls, height * 0.34);
        const boxX = Math.max(margin, Math.min(width - margin - boxW, labelScreenX - boxW / 2));
        const boxYRaw = labelScreenY + 88 * ls;
        const boxY = Math.max(margin, Math.min(height - margin - boxH, boxYRaw));

        const cam = { x: camX, y: camY, zoom: camZoom, screenY };

        // Post 2 definition sentence disabled (no draw here).

        // Push removed per request.

        // Ensure "speck" floats ABOVE the sentence text (draw it last).
        if (matterReady) {
          push();
          translate(cx, screenY);
          scale(camZoom);
          translate(-camX, -camY);
          drawMatterSpeckLetters(frame5Fx);
          pop();
        }
      } else if (done && inkDone && descStartMs) {
        const fade = clamp01((millis() - descStartMs) / 1100);
        const a = easeOutCubic(fade);

        const labelWorldX = curSpeck.x + curLayouts[0].dx;
        const labelWorldY = curSpeck.y + curLayouts[0].dy;
        const labelScreenX = cx + (labelWorldX - camX) * camZoom;
        const labelScreenY = screenY + (labelWorldY - camY) * camZoom;

        const margin = 28 * ls;
        const boxW = Math.min(520 * ls, width - margin * 2);
        const boxH = Math.min(240 * ls, height * 0.34);
        const boxX = Math.max(margin, Math.min(width - margin - boxW, labelScreenX - boxW / 2));
        const boxYRaw = labelScreenY + 88 * ls;
        const boxY = Math.max(margin, Math.min(height - margin - boxH, boxYRaw));

        {
          const grow = easeInOutCubic(fade);

          if (POST2_SHOW_DESCRIPTION) {
            // Reveal: clean "tree growth" (bottom->top clip). No erosion texture on the text.
            const clipH = Math.max(1, boxH * grow);
            const clipY = boxY + boxH - clipH;

            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.rect(boxX, clipY, boxW, clipH);
            drawingContext.clip();

            textAlign(LEFT, TOP);
            fill(255, 255 * a);
            noStroke();
            textSize(16 * ls);
            textLeading(20 * ls);
            text(POST2_DESCRIPTION, boxX, boxY, boxW, boxH);

            drawingContext.restore();
          }

          // Push removed per request.
        }

        // Ensure "speck" floats ABOVE the sentence text (draw it last).
        if (matterReady) {
          push();
          translate(cx, screenY);
          scale(camZoom);
          translate(-camX, -camY);
          drawMatterSpeckLetters(null);
          pop();
        }

        if (fade >= 1) noLoop();
      }
      return;
    } else {
      noLoop();
    }

    if (!galleryExtended && galleryFrame === 1 && typeof window !== 'undefined') {
      window.__SPEC_FRAME4_END__ = null;
      window.__SPEC_FRAME5_END__ = null;
    }

    galleryLastFrame = galleryFrame;

    // Apply camera transform so cam maps to (cx, screenY).
    push();
    translate(cx, screenY);
    scale(camZoom);
    translate(-camX, -camY);

    for (let i = 0; i < 3; i++) {
      const x = vennTargets[i].x;
      const y = vennTargets[i].y;
      noStroke();
      fill(245, 120);
      ellipse(x, y, vennD, vennD);

      noFill();
      stroke(120, 220);
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
    pop();

    // Post 2 definition sentence disabled.
    return;
  }

  const t = ((millis() - sequenceStartMs) / 1000) % TOTAL;

  if (t < DURATION_ONE) {
    // Phase 1: circle fades in, "spec" lingers 3s (no zoom)
    const fadeIn = easeOutCubic(t / DURATION_FADE);
    const circleAlpha = 180 * fadeIn;
    const strokeAlpha = 80 * fadeIn;

    noStroke();
    fill(235, circleAlpha);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, strokeAlpha * 1.6, 3, 101);

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
    fill(235, 180);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, 120, 3 / circleZoom, 102);
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
    fill(235, 180);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, 120, 3 / CIRCLE_ZOOM_MAX, 103);
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
    fill(235, 180);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, 120, 3 / circleZoom, 104);
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
    fill(235, 180);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, 120, 3, 105);

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
    const baseColor = [235, 235, 235, 180];
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
    fill(baseColor[0], baseColor[1], baseColor[2], baseColor[3] * (1 - fade));
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, 255 * (1 - fade), 3, 106);

    for (let i = 0; i < 3; i++) {
      const x = lerp(cx, vennTargets[i].x, ease);
      const y = lerp(cy, vennTargets[i].y, ease);
      const d = lerp(size, vennD, ease);

      const rC = lerp(baseColor[0], vennColors[i][0], ease);
      const gC = lerp(baseColor[1], vennColors[i][1], ease);
      const bC = lerp(baseColor[2], vennColors[i][2], ease);
      const aC = lerp(baseColor[3], vennColors[i][3], ease);

      noStroke();
      fill(rC, gC, bC, aC * fade);
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
      if (staticFinalMode) {
        fill(245, 120);
      } else {
        fill(...vennColors[i]);
      }
      ellipse(x, y, vennD, vennD);
      if (staticFinalMode) {
        noFill();
        stroke(120, 220);
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
