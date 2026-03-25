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

const POST2_DESCRIPTION =
  "we want to stray from the obvious and popular and focus on things unnoticed, that people forget or take for granted.";

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
let descPusherBodies = null; // Matter bodies (segmented pusher)
let descPusherSpec = null;
let post2SolidInkG = null;
let post2Sediment = null;

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

function preload() {
  uiFont = loadFont('genwan_latin_092725_1-R.otf');
}

function setup() {
  // 4:5 canvas (portrait)
  cnv = createCanvas(600, 750);
  const mainEl = (typeof document !== 'undefined') ? document.querySelector('main') : null;
  if (mainEl && cnv?.parent) cnv.parent(mainEl);

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

  if (!staticFinalMode && !galleryMode) {
    recordBtn = createButton('Export MP4');
    recordBtn.mousePressed(exportSequence);
    recordBtn.position(10, height + 10);
  }
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

  const { Engine, World, Bodies, Body } = window.Matter;
  matterEngine = Engine.create();
  matterWorld = matterEngine.world;
  matterWorld.gravity.x = 0;
  matterWorld.gravity.y = 0.45;

  // Approximate circle boundaries using static segments.
  // Top circle (speck) is a wall, plus the bottom two circles act as walls too.
  const segs = 28;
  const wallThickness = 16;
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
  addCircleWall(targets[1], rFinal + BOTTOM_CIRCLE_WALL_PAD);
  addCircleWall(targets[2], rFinal + BOTTOM_CIRCLE_WALL_PAD);
  World.add(matterWorld, speckWalls);

  // Build letter bodies around the label center
  textSize(VENN_TEXT_SIZE);
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

function updateDescPusherFromScreenBox(cam, boxX, boxY, boxW, boxH, grow01, opts) {
  if (!matterReady || !matterWorld || !matterAvailable()) return;
  const { World, Bodies, Body } = window.Matter;
  const o = opts || {};

  const PAD_PX = 38; // increase padding between speck and sentence
  const wWorld = (boxW + PAD_PX * 2) / cam.zoom;
  const hWorld = (boxH + PAD_PX * 2) / cam.zoom;

  const cxS = boxX + boxW / 2;
  const cyS = boxY + boxH / 2;
  const target = screenToWorld(cxS, cyS, cam);

  // Start below and rise into the sentence area.
  // We use multiple segments so the pushing front is uneven (less "gliding").
  if (!descPusherSpec) {
    // "Pocket pull" feel: start closer so the top emerges early.
    const start = screenToWorld(cxS, cyS + boxH * 0.72 + 46, cam);
    descPusherSpec = {
      wWorld,
      hWorld,
      startX: start.x,
      startY: start.y,
      targetX: target.x,
      targetY: target.y,
      segs: 7,
      lastW: wWorld,
      lastH: hWorld,
      bornMs: millis(),
    };
  }

  // If zoom/layout changes a lot, rebuild bodies to keep them stable.
  const sizeChanged = (Math.abs(wWorld - descPusherSpec.lastW) / Math.max(1, descPusherSpec.lastW) > 0.08) ||
    (Math.abs(hWorld - descPusherSpec.lastH) / Math.max(1, descPusherSpec.lastH) > 0.08);
  descPusherSpec.lastW = wWorld;
  descPusherSpec.lastH = hWorld;

  if (sizeChanged && descPusherBodies && descPusherBodies.length) {
    for (const b of descPusherBodies) World.remove(matterWorld, b);
    descPusherBodies = null;
  }

  if (!descPusherBodies) {
    const segs = descPusherSpec.segs;
    const segW = wWorld / segs;
    descPusherBodies = [];
    for (let i = 0; i < segs; i++) {
      const localX = (i + 0.5 - segs / 2) * segW;
      const bx = descPusherSpec.startX + localX;
      const by = descPusherSpec.startY;
      const body = Bodies.rectangle(bx, by, segW * 1.04, hWorld, {
        isStatic: true,
        friction: 0.22,
        restitution: 0,
      });
      descPusherBodies.push(body);
    }
    World.add(matterWorld, descPusherBodies);
  }

  // Ragged advance: quantized + noise-wobbled progress per-segment.
  const baseU = smootherstep(clamp01(grow01));
  // Pocket pull: accelerate early (top emerges first), then settle.
  const baseUy = easeOutCubic(baseU);
  const tMs = millis() - descPusherSpec.bornMs;
  const wobT = tMs * 0.0022;
  const segs = descPusherSpec.segs;
  const segW = wWorld / segs;

  // Low-pass filter the pusher motion to avoid "teleport jitter" in collisions.
  if (!descPusherSpec.curY || descPusherSpec.curY.length !== segs) {
    descPusherSpec.curY = new Array(segs).fill(descPusherSpec.startY);
  }

  for (let i = 0; i < descPusherBodies.length; i++) {
    const b = descPusherBodies[i];
    const localX = (i + 0.5 - segs / 2) * segW;

    // Per-segment progress variation (edges lead/lag slightly).
    const n = noise(i * 0.35 + 10.1, wobT);
    const roughAmp = (o.roughAmp != null) ? o.roughAmp : 0.12;
    const rough = (n - 0.5) * roughAmp * (1 - baseU); // smaller roughness to reduce glitchiness
    let u2 = clamp01(baseU + rough);

    // Slight "stepping" so it feels like erosion/growth instead of a glide.
    const steps = (o.steps != null) ? o.steps : 40; // finer steps = smoother
    const uq = Math.floor(u2 * steps) / steps;
    const stepBlend = (o.stepBlend != null) ? o.stepBlend : 0.85;
    u2 = lerp(uq, u2, stepBlend);

    const x = lerp(descPusherSpec.startX, descPusherSpec.targetX, baseU) + localX;
    // Pocket pull: y follows a faster-easing curve than x.
    const yTarget = lerp(descPusherSpec.startY, descPusherSpec.targetY, easeOutCubic(u2));
    // Smooth position update (prevents abrupt solver responses).
    const yLerp = (o.yLerp != null) ? o.yLerp : 0.22;
    const ySm = lerp(descPusherSpec.curY[i], yTarget, yLerp);
    descPusherSpec.curY[i] = ySm;
    Body.setPosition(b, { x, y: ySm });
  }
}

function stepMatter(dtMs) {
  if (!matterReady || !matterEngine) return;
  window.Matter.Engine.update(matterEngine, dtMs);
}

function drawMatterSpeckLetters() {
  if (!matterReady || !speckBodies) return;
  textSize(VENN_TEXT_SIZE);
  textAlign(CENTER, CENTER);
  for (const l of speckBodies) {
    const p = l.body.position;
    push();
    translate(p.x, p.y);
    rotate(l.body.angle);
    // Physics should only act on the white "speck" letters.
    fill(255);
    stroke(0, 90);
    strokeWeight(1);
    text(l.ch, 0, 0);
    pop();
  }
}

function applySpeckBreakthroughFriction(grow01, opts) {
  if (!matterReady || !speckBodies) return;
  const t = clamp01(grow01);
  if (t <= 0) return;
  const k = easeInOutCubic(t);
  const o = opts || {};

  for (const l of speckBodies) {
    const b = l.body;
    const base = l.base || { friction: SPECK_MATTER.friction, frictionAir: SPECK_MATTER.frictionAir, restitution: SPECK_MATTER.restitution };
    // Increase damping & surface friction so it feels like "pushing through" resistance.
    const airT = (o.frictionAirTarget != null) ? o.frictionAirTarget : 0.22;
    const frT = (o.frictionTarget != null) ? o.frictionTarget : 0.92;
    const reT = (o.restitutionTarget != null) ? o.restitutionTarget : 0.12;
    b.frictionAir = lerp(base.frictionAir, airT, k);
    b.friction = lerp(base.friction, frT, k);
    b.restitution = lerp(base.restitution, reT, k);
  }

  // Add subtle impulse "breakthrough" pops while the pusher is advancing.
  const doImpulses = (o.impulses != null) ? !!o.impulses : true;
  if (!doImpulses) return;
  if (!descPusherBodies || !descPusherBodies.length) return;
  if (t >= 0.98) return;
  if (frameCount % 6 !== 0) return; // less frequent = less jitter

  const { Body } = window.Matter;
  const impulseScale = (o.impulseScale != null) ? o.impulseScale : 1;
  const impulse = 0.00042 * impulseScale * (0.25 + 0.75 * k);

  for (const l of speckBodies) {
    const b = l.body;
    const p = b.position;

    // Find nearest pusher segment by x.
    let nearest = null;
    let bestDx = Infinity;
    for (const pb of descPusherBodies) {
      const dx = Math.abs(p.x - pb.position.x);
      if (dx < bestDx) { bestDx = dx; nearest = pb; }
    }
    if (!nearest) continue;

    // If the letter is close to the pusher front, add an upward+side impulse.
    const px = nearest.position.x;
    const py = nearest.position.y;
    const bw = nearest.bounds.max.x - nearest.bounds.min.x;
    const bh = nearest.bounds.max.y - nearest.bounds.min.y;
    const inX = Math.abs(p.x - px) < bw * 0.55;
    const inY = p.y > py - bh * 0.9 && p.y < py + bh * 1.2;
    if (!inX || !inY) continue;

    // Deterministic impulse (noise-driven), avoids per-frame random jitter.
    const nz = noise(p.x * 0.02 + 3.1, p.y * 0.02 + 7.7, millis() * 0.0006);
    const side = (nz - 0.5) * 0.7;
    const up = 0.92 + 0.12 * noise(p.x * 0.01, millis() * 0.0009);
    Body.applyForce(b, p, { x: impulse * side, y: -impulse * up });
    // Occasional tiny rotation nudge (noise-gated).
    if (nz > 0.82) Body.setAngularVelocity(b, b.angularVelocity + (nz - 0.5) * 0.02);
  }
}

function inkAvailable() {
  return typeof window !== 'undefined' && window.SpecInk;
}

function ensurePost2SolidInkLayer(p5) {
  if (!post2SolidInkG || post2SolidInkG.width !== width || post2SolidInkG.height !== height) {
    post2SolidInkG = p5.createGraphics(width, height);
    post2SolidInkG.pixelDensity(1);
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
    `${Math.round(targets[1].x)}|${Math.round(targets[1].y)}|${Math.round(targets[2].x)}|${Math.round(targets[2].y)}|${width}x${height}`;
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

  const g = p5.createGraphics(width, height);
  g.pixelDensity(1);
  g.clear();
  const maskWorldG = p5.createGraphics(width, height);
  maskWorldG.pixelDensity(1);
  maskWorldG.clear();
  const maskScreenG = p5.createGraphics(width, height);
  maskScreenG.pixelDensity(1);
  maskScreenG.clear();
  const sentenceG = p5.createGraphics(width, height);
  sentenceG.pixelDensity(1);
  sentenceG.clear();
  const sentenceOutG = p5.createGraphics(width, height);
  sentenceOutG.pixelDensity(1);
  sentenceOutG.clear();

  post2Sediment = {
    key,
    g,
    maskWorldG,
    maskScreenG,
    sentenceG,
    sentenceOutG,
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
  g.textSize(18);
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
  textSize(VENN_TEXT_SIZE);
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
  textSize(VENN_TEXT_SIZE);
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
  if (!isFrame4DraggableActive() || !speckLetters) return;
  const m = screenToWorld(mouseX, mouseY, frame4Cam);
  textSize(VENN_TEXT_SIZE);
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

  textSize(VENN_TEXT_SIZE);
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
  return distSq(px, py, c.x, c.y) < (r - LABEL_MARGIN_PX) * (r - LABEL_MARGIN_PX);
}

function pointOutsideCircle(px, py, c, r) {
  return distSq(px, py, c.x, c.y) > (r + LABEL_MARGIN_PX) * (r + LABEL_MARGIN_PX);
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

function draw() {
  background(255);

  const cx = width / 2;
  const cy = height / 2;
  const r = 120;
  const size = r * 2;

  const galleryFrame = galleryMode
    ? Math.max(1, Math.min(5, (typeof window !== 'undefined' && window.__SPEC_GALLERY_FRAME__) ? Number(window.__SPEC_GALLERY_FRAME__) : 1))
    : 0;

  // Original 's' position in "spec" (centered at cx, cy) — keep s here before adding words
  textSize(44);
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

  const linePositions = [
    { x: sCenterX, y: cy + WORD_STACK_VISUAL_Y - sGap },
    { x: sCenterX, y: cy + WORD_STACK_VISUAL_Y },
    { x: sCenterX, y: cy + WORD_STACK_VISUAL_Y + sGap },
  ];

  function vennTargetsFor(offset) {
    return [
      { x: cx, y: cy - offset },
      { x: cx - offset * 0.9, y: cy + offset * 0.6 },
      { x: cx + offset * 0.9, y: cy + offset * 0.6 },
    ];
  }

  const vennTargetsBase = vennTargetsFor(VENN_OFFSET);
  const vennTargetsSpread = vennTargetsFor(VENN_OFFSET * 1.35); // reduce triple-overlap region
  // Frame mapping:
  // 1: base, 2: spread, 3: spread+zoom, 4: motion 1->2->3 (ink), 5: motion 1->2->3 (sediment)
  const vennTargets = (galleryMode && (galleryFrame === 2 || galleryFrame === 3)) ? vennTargetsSpread : vennTargetsBase;
  // Black & white palette (grayscale). Same fill so overlaps read slightly darker.
  const vennColors = [
    [235, 235, 235, 150],
    [235, 235, 235, 150],
    [235, 235, 235, 150],
  ];

  if (galleryMode) {
    // Always render the final Venn state; frames 3/4 are the zoom + motion.
    const rFinal = VENN_SIZE_SCALED / 2;
    const key = `${rFinal}|${VENN_TEXT_SIZE}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, VENN_TEXT_SIZE);
    }

    const finalLayouts = cachedFinalLayouts;

    // --- camera for frames 1/2/3/4/5 ---
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

    // Frame 3: static zoomed view
    let camX = (galleryFrame === 3) ? cam2.x : cam1.x;
    let camY = (galleryFrame === 3) ? cam2.y : cam1.y;
    let camZoom = (galleryFrame === 3) ? cam2.zoom : cam1.zoom;
    let screenY = (galleryFrame === 3) ? cam2.screenY : cam1.screenY;

    let transitionDone = false;
    if (galleryFrame === 4 || galleryFrame === 5) {
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
        descPusherBodies = null;
        descPusherSpec = null;
        post2SolidInkG = null;
        post2Sediment = null;
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
      const curOffset = lerp(VENN_OFFSET, VENN_OFFSET * 1.35, easeA);
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
      const curLayouts = computeExclusiveLabelLayout(curTargets, rFinal, WORDS, VENN_TEXT_SIZE);

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
          const labelY = curSpeck.y + curLayouts[0].dy + SPECK_MATTER_Y_OFFSET;
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
        ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);
        noFill();
        stroke(120, 220);
        strokeWeight(3);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);
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
      for (let i = 0; i < 3; i++) {
        const x = curTargets[i].x;
        const y = curTargets[i].y;
        const wx = x + curLayouts[i].dx;
        const wy = y + curLayouts[i].dy;
        if (i === 0 && done && matterReady) {
          drawMatterSpeckLetters();
        } else {
          fill(0);
          textAlign(CENTER, CENTER);
          textSize(VENN_TEXT_SIZE);
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

        const margin = 28;
        const boxW = Math.min(520, width - margin * 2);
        const boxH = Math.min(240, height * 0.34);
        const boxX = Math.max(margin, Math.min(width - margin - boxW, labelScreenX - boxW / 2));
        const boxYRaw = labelScreenY + 88;
        const boxY = Math.max(margin, Math.min(height - margin - boxH, boxYRaw));

        const cam = { x: camX, y: camY, zoom: camZoom, screenY };

        // Sentence is invisible until accumulation overlays it:
        // render text in a layer and mask it by the *screen-space* sediment fill mask.
        if (post2Sediment.maskWorldG && post2Sediment.maskScreenG && post2Sediment.sentenceG && post2Sediment.sentenceOutG) {
          // Build screen-space mask of filled sediment.
          post2Sediment.maskScreenG.clear();
          post2Sediment.maskScreenG.push();
          post2Sediment.maskScreenG.translate(cx, screenY);
          post2Sediment.maskScreenG.scale(camZoom);
          post2Sediment.maskScreenG.translate(-camX, -camY);
          post2Sediment.maskScreenG.image(post2Sediment.maskWorldG, 0, 0);
          post2Sediment.maskScreenG.pop();

          // Render the sentence (white) in screen coords.
          post2Sediment.sentenceG.clear();
          post2Sediment.sentenceG.textAlign(LEFT, TOP);
          post2Sediment.sentenceG.noStroke();
          post2Sediment.sentenceG.fill(255);
          post2Sediment.sentenceG.textSize(16);
          post2Sediment.sentenceG.textLeading(20);
          if (uiFont) post2Sediment.sentenceG.textFont(uiFont);
          post2Sediment.sentenceG.text(POST2_DESCRIPTION, boxX, boxY, boxW, boxH);

          // Mask by sediment fill on screen so it only appears where black has accumulated behind it.
          const ctxS = post2Sediment.sentenceOutG.drawingContext;
          ctxS.save();
          ctxS.globalCompositeOperation = 'source-over';
          ctxS.clearRect(0, 0, post2Sediment.sentenceOutG.width, post2Sediment.sentenceOutG.height);
          post2Sediment.sentenceOutG.image(post2Sediment.sentenceG, 0, 0);
          ctxS.globalCompositeOperation = 'destination-in';
          post2Sediment.sentenceOutG.image(post2Sediment.maskScreenG, 0, 0);
          ctxS.globalCompositeOperation = 'source-over';
          ctxS.restore();

          noTint();
          image(post2Sediment.sentenceOutG, 0, 0);
        }

        // Start pushing only after the first sediment impact (first accumulation).
        if (post2Sediment.startedAtMs) {
          // Push follows accumulation ONLY.
          const fillRows = Math.max(0, post2Sediment.bottomRow - post2Sediment.scanRow);
          // Aim to reach full push once sediment has climbed to the sentence box.
          const worldBottom = screenToWorld(boxX + boxW / 2, boxY + boxH, cam);
          const rowBoxBottom = Math.max(0, Math.min(post2Sediment.rows - 1, Math.floor((worldBottom.y - post2Sediment.minY) / post2Sediment.cell)));
          const targetRows = Math.max(1, post2Sediment.bottomRow - rowBoxBottom + 1);
          const fillBased = clamp01(fillRows / targetRows);
          const grow = easeInOutCubic(fillBased);

          updateDescPusherFromScreenBox(cam, boxX, boxY, boxW, boxH, grow, {
            roughAmp: 0.06,
            steps: 70,
            stepBlend: 0.92,
            yLerp: 0.14,
          });
          applySpeckBreakthroughFriction(grow, {
            impulses: false,
            frictionAirTarget: 0.12,
            frictionTarget: 0.62,
            restitutionTarget: 0.22,
          });
        }

        // Ensure "speck" floats ABOVE the sentence text (draw it last).
        if (matterReady) {
          push();
          translate(cx, screenY);
          scale(camZoom);
          translate(-camX, -camY);
          drawMatterSpeckLetters();
          pop();
        }
      } else if (done && inkDone && descStartMs) {
        const fade = clamp01((millis() - descStartMs) / 1100);
        const a = easeOutCubic(fade);

        const labelWorldX = curSpeck.x + curLayouts[0].dx;
        const labelWorldY = curSpeck.y + curLayouts[0].dy;
        const labelScreenX = cx + (labelWorldX - camX) * camZoom;
        const labelScreenY = screenY + (labelWorldY - camY) * camZoom;

        const margin = 28;
        const boxW = Math.min(520, width - margin * 2);
        const boxH = Math.min(240, height * 0.34);
        const boxX = Math.max(margin, Math.min(width - margin - boxW, labelScreenX - boxW / 2));
        const boxYRaw = labelScreenY + 88;
        const boxY = Math.max(margin, Math.min(height - margin - boxH, boxYRaw));

        // Reveal: clean "tree growth" (bottom->top clip). No erosion texture on the text.
        {
          const grow = easeInOutCubic(fade);
          const clipH = Math.max(1, boxH * grow);
          const clipY = boxY + boxH - clipH;

          drawingContext.save();
          drawingContext.beginPath();
          drawingContext.rect(boxX, clipY, boxW, clipH);
          drawingContext.clip();

          textAlign(LEFT, TOP);
          fill(255, 255 * a);
          noStroke();
          textSize(16);
          textLeading(20);
          text(POST2_DESCRIPTION, boxX, boxY, boxW, boxH);

          drawingContext.restore();

          // Push the speck letters up with padding as the sentence emerges.
          const cam = { x: camX, y: camY, zoom: camZoom, screenY };
          updateDescPusherFromScreenBox(cam, boxX, boxY, boxW, boxH, grow);
          applySpeckBreakthroughFriction(grow);
        }

        // Ensure "speck" floats ABOVE the sentence text (draw it last).
        if (matterReady) {
          push();
          translate(cx, screenY);
          scale(camZoom);
          translate(-camX, -camY);
          drawMatterSpeckLetters();
          pop();
        }

        if (fade >= 1) noLoop();
      }
      return;
    } else {
      noLoop();
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
      ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);

      noFill();
      stroke(120, 220);
      strokeWeight(3);
      strokeJoin(ROUND);
      strokeCap(ROUND);
      ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);

      fill(0);
      textAlign(CENTER, CENTER);
      textSize(VENN_TEXT_SIZE);
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

    // After the motion completes (frame 3), show the description text.
    if (galleryFrame === 4 && transitionDone) {
      const margin = 28;
      const boxW = width - margin * 2;
      const boxH = Math.min(240, height * 0.34);
      textAlign(LEFT, TOP);
      fill(0);
      noStroke();
      textSize(16);
      textLeading(20);
      text(POST2_DESCRIPTION, margin, margin, boxW, boxH);
    }
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

    textSize(44);
    // Metric-based vertical centering for this font:
    // position text baseline so the glyph box center aligns to cy
    const specBaselineY = cy + (textAscent() - textDescent()) / 2 + SPEC_VISUAL_Y;
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
    textSize(44);
    const specBaselineY = cy + (textAscent() - textDescent()) / 2 + SPEC_VISUAL_Y;
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
    textSize(44);
    fill(0);
    noStroke();

    if (easeWords <= 0) {
      // only three s's splitting at original 's' position in "spec"
      // Keep lowercase 's' consistent with word-building phase
      textSize(44);
      textAlign(CENTER, CENTER);
      for (let i = 0; i < 3; i++) {
        const y = lerp(cy, linePositions[i].y, easeSplit);
        text('s', sCenterX, y);
      }
    } else {
      // words building — left-align so 's' stays at original spec position
      textSize(44);
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
    textSize(44);
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
    textSize(44);
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
    const textSz = VENN_TEXT_SIZE; // text stays the same while circles scale up

    // Compute final exclusive-region offsets + rotations ONCE and cache them to avoid twitches.
    const rFinal = VENN_SIZE_SCALED / 2;
    const key = `${rFinal}|${VENN_TEXT_SIZE}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, VENN_TEXT_SIZE);
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
      const d = lerp(size, VENN_SIZE_SCALED, ease);

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
      textSize(44);
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
    const rFinal = VENN_SIZE_SCALED / 2;
    const key = `${rFinal}|${VENN_TEXT_SIZE}|${LABEL_MIN_DIST_FRAC_TOP}|${LABEL_MAX_DIST_FRAC_TOP}|${LABEL_MIN_DIST_FRAC_BOTTOM}|${LABEL_MAX_DIST_FRAC_BOTTOM}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
      `${vennTargets[0].x},${vennTargets[0].y}|${vennTargets[1].x},${vennTargets[1].y}|${vennTargets[2].x},${vennTargets[2].y}`;
    if (!cachedFinalLayouts || cachedFinalLayoutsKey !== key) {
      cachedFinalLayoutsKey = key;
      computeExclusiveLabelLayout.fixedThetas = FIXED_LABEL_THETAS;
      cachedFinalLayouts = computeExclusiveLabelLayout(vennTargets, rFinal, WORDS, VENN_TEXT_SIZE);
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
      ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);
      if (staticFinalMode) {
        noFill();
        stroke(120, 220);
        strokeWeight(3);
        strokeJoin(ROUND);
        strokeCap(ROUND);
        ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);
      } else {
        drawInkCircleOutline(x, y, VENN_SIZE_SCALED / 2, 120, 3, 700 + i);
      }
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(VENN_TEXT_SIZE);
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
  const t = (millis() / 1000) * 0.35;
  const points = 140;
  const amp = 2.2;     // subtle wobble
  const blobAmp = 5.5; // occasional blobbing
  const freq = 0.9;

  push();
  noFill();
  stroke(0, 0, 0, alpha);
  strokeWeight(weight);
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
