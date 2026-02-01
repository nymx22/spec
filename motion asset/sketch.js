const DURATION_FADE = 1;       // circle fades in
const DURATION_LINGER = 4;     // circle + "spec" linger
const DURATION_ONE = DURATION_FADE + DURATION_LINGER;
const DURATION_ZOOM_IN = 1.5;  // camera zooms into circle
const DURATION_S_AND_WORDS = 6; // split 's' into three + add letters (speck, Inspect, spectrum) — inside one circle
const DURATION_ZOOM_OUT = 1.5; // zoom out (single circle, three words stacked)
const DURATION_HOLD = 0.8;     // hold at 1.0x before Venn split
const DURATION_VENN = 2.5;     // after zoom out: split into 3 Venn circles until full Venn diagram
const DURATION_END_HOLD = 1.2; // hold final Venn before looping
const TOTAL = DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS + DURATION_ZOOM_OUT + DURATION_HOLD + DURATION_VENN + DURATION_END_HOLD;

const CIRCLE_ZOOM_MAX = 2;
const WORD_ZOOM_MAX = 1.5;
const WORD_ZOOM_OUT_END = 0.5;

const WORDS = ['speck', 'inspect', 'spectrum'];
const TOTAL_LETTERS = 5 + 7 + 8; // 20

const sGap = 50; // vertical spacing for three words inside single circle

const VENN_OFFSET = 55;
const VENN_R = 85;
const VENN_SIZE = VENN_R * 2;
const VENN_SCALE = 1.7; // circles grow larger during Venn split
const VENN_SIZE_SCALED = VENN_SIZE * VENN_SCALE;
const VENN_TEXT_SIZE = 24; // keep text size constant during Venn split

let uiFont;
let cachedFinalLayouts = null;
let cachedFinalLayoutsKey = '';

// Label rotations (radians): top=0°, left=+40° (pi/4.5), right=-40° (-(pi/4.5))
const FIXED_LABEL_THETAS = [0, Math.PI / 4.5, -Math.PI / 4.5];

// --- label placement (exclusive regions) ---
// We place words in the non-overlapping (exclusive) lobe of each circle.
// Order: 0=top (speck), 1=left (Inspect), 2=right (spectrum)
// Push labels further toward the outer (exclusive) lobes
const LABEL_MIN_DIST_FRAC = 0.3;
const LABEL_MAX_DIST_FRAC = 0.65;
const LABEL_DIST_STEP = 0.05;
const LABEL_MARGIN_PX = 2; // small cushion from circle boundaries

function preload() {
  uiFont = loadFont('genwan_latin_092725_1-R.otf');
}

function setup() {
  createCanvas(600, 500);
  if (uiFont) textFont(uiFont);
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
    const thetaCandidates = (typeof fixed === 'number')
      ? [fixed]
      : [baseTheta, 0, baseTheta + Math.PI / 2, baseTheta - Math.PI / 2];

    for (let frac = LABEL_MAX_DIST_FRAC; frac >= LABEL_MIN_DIST_FRAC; frac -= LABEL_DIST_STEP) {
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
      for (let frac = LABEL_MAX_DIST_FRAC; frac >= LABEL_MIN_DIST_FRAC; frac -= LABEL_DIST_STEP) {
        const px = ci.x + dx * (frac * r);
        const py = ci.y + dy * (frac * r);
        if (isExclusivePoint(px, py, i, centers, r)) {
          best = { dx: px - ci.x, dy: py - ci.y, theta: (typeof fixed === 'number') ? fixed : baseTheta };
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
    { x: sCenterX, y: cy - sGap },
    { x: sCenterX, y: cy },
    { x: sCenterX, y: cy + sGap },
  ];

  const vennTargets = [
    { x: cx, y: cy - VENN_OFFSET },
    { x: cx - VENN_OFFSET * 0.9, y: cy + VENN_OFFSET * 0.6 },
    { x: cx + VENN_OFFSET * 0.9, y: cy + VENN_OFFSET * 0.6 },
  ];
  // Black & white palette (grayscale). Same fill so overlaps read slightly darker.
  const vennColors = [
    [235, 235, 235, 150],
    [235, 235, 235, 150],
    [235, 235, 235, 150],
  ];

  const t = (millis() / 1000) % TOTAL;

  if (t < DURATION_ONE) {
    // Phase 1: circle fades in, "spec" lingers 3s (no zoom)
    const fadeIn = Math.min(1, t / DURATION_FADE);
    const circleAlpha = 180 * fadeIn;
    const strokeAlpha = 80 * fadeIn;

    noStroke();
    fill(235, circleAlpha);
    ellipse(cx, cy, size, size);
    drawInkCircleOutline(cx, cy, size / 2, strokeAlpha * 1.6, 3, 101);

    const specAlpha = Math.min(1, (t - DURATION_FADE * 0.4) / (DURATION_FADE * 0.6));
    const specOpacity = 255 * Math.max(0, specAlpha);

    textSize(44);
    // Metric-based vertical centering for this font:
    // position text baseline so the glyph box center aligns to cy
    const specBaselineY = cy + (textAscent() - textDescent()) / 2;
    textAlign(CENTER, BASELINE);
    fill(0, specOpacity);
    noStroke();
    text('spec', cx, specBaselineY);
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN) {
    // Phase 2: zoom INTO circle
    const s = (t - DURATION_ONE) / DURATION_ZOOM_IN;
    const ease = 1 - Math.pow(1 - s, 1.2);
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
    const specBaselineY = cy + (textAscent() - textDescent()) / 2;
    textAlign(CENTER, BASELINE);
    fill(0);
    noStroke();
    text('spec', cx, specBaselineY);
    pop();
  } else if (t < DURATION_ONE + DURATION_ZOOM_IN + DURATION_S_AND_WORDS) {
    // Phase 3: split 's' into three + pad words (speck, Inspect, spectrum) — inside one circle, zoomed in
    const elapsed = t - DURATION_ONE - DURATION_ZOOM_IN;
    const sSplit = Math.min(1, elapsed / 1); // first 1s: split three s's
    const easeSplit = 1 - Math.pow(1 - sSplit, 1.5);
    const sWords = (elapsed - 1) / (DURATION_S_AND_WORDS - 1); // rest: build words
    const easeWords = Math.max(0, Math.min(1, sWords * 1.05));
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
      // smoothstep for extra softness
      const recenterEase = recenterT * recenterT * (3 - 2 * recenterT);
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
    const ease = 1 - Math.pow(1 - s, 1.2);
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
    // Smoothstep for a softer start/end (avoids abrupt beginning)
    const ease = s * s * (3 - 2 * s);

    // Crossfade: keep the single circle at first, then fade in the 3 circles as they split out
    const fadeT = Math.max(0, Math.min(1, s / 0.35)); // fade-in completes early
    const fade = fadeT * fadeT * (3 - 2 * fadeT);     // smoothstep

    // Start from the single (zoomed-out) circle and have it split into three circles.
    // Words follow their corresponding circle as it moves out.
    const baseColor = [235, 235, 235, 180];
    const textSz = VENN_TEXT_SIZE; // text stays the same while circles scale up

    // Compute final exclusive-region offsets + rotations ONCE and cache them to avoid twitches.
    const rFinal = VENN_SIZE_SCALED / 2;
    const key = `${rFinal}|${VENN_TEXT_SIZE}|${LABEL_MIN_DIST_FRAC}|${LABEL_MAX_DIST_FRAC}|${LABEL_DIST_STEP}|${LABEL_MARGIN_PX}|${FIXED_LABEL_THETAS.join(',')}|` +
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
      const centerWorldY = cy + (i - 1) * sGap;
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
    const finalLayouts = cachedFinalLayouts;
    for (let i = 0; i < 3; i++) {
      const x = vennTargets[i].x;
      const y = vennTargets[i].y;
      noStroke();
      fill(...vennColors[i]);
      ellipse(x, y, VENN_SIZE_SCALED, VENN_SIZE_SCALED);
      drawInkCircleOutline(x, y, VENN_SIZE_SCALED / 2, 120, 3, 700 + i);
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
