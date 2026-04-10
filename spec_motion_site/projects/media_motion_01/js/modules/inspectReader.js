/**
 * Inspect label sweep + per-letter zoom envelope math (no p5 draw).
 * Depends on global `Easing` from easing.js. Orchestration in sketch.js.
 */
const InspectReader = {};

InspectReader.TWO_PI = Math.PI * 2;

/**
 * Measure word in current font (`textSize` / `textFont` must be set). Returns local coords with origin at word center.
 */
InspectReader.measureWordLayout = function (word) {
  const chars = Array.from(word);
  const n = chars.length;
  let tw = 0;
  for (let i = 0; i < n; i++) {
    tw += textWidth(chars[i]);
  }
  const wordLeft = -tw / 2;
  const centers = [];
  const tFracs = [];
  let pen = wordLeft;
  for (let i = 0; i < n; i++) {
    const cw = textWidth(chars[i]);
    const cx = pen + cw / 2;
    centers.push(cx);
    tFracs.push((cx - wordLeft) / tw);
    pen += cw;
  }
  return { chars, tw, wordLeft, centers, tFracs, n };
};

/** Sweep parameter `sweepT` in [0,1) crosses normalized letter position `tHit` (forward or wrap). */
InspectReader.sweepCrossedLetter = function (prevS, sweepT, tHit) {
  const eps = 1e-7;
  if (sweepT > prevS) return prevS < tHit - eps && sweepT >= tHit - eps;
  return prevS < tHit - eps || sweepT >= tHit - eps;
};

InspectReader.updateSweepAndTriggers = function (anim, dtMs, nowMs, periodMs, tFracs, n) {
  const prev = anim.sweepT;
  anim.sweepT += dtMs / periodMs;
  if (anim.sweepT > 1) anim.sweepT -= 1;
  for (let i = 0; i < n; i++) {
    if (InspectReader.sweepCrossedLetter(prev, anim.sweepT, tFracs[i])) {
      anim.triggered[i] = nowMs;
    }
  }
  anim.sweepTPrev = anim.sweepT;
};

InspectReader.computeEnvelope = function (dtTriggeredMs, riseMs, holdMs, fallMs) {
  const dt = dtTriggeredMs;
  const rise = Easing.clamp01(dt / riseMs);
  const fall = Easing.clamp01((dt - riseMs - holdMs) / fallMs);
  return Easing.easeOutCubic(rise) * (1 - Easing.easeInOutCubic(fall));
};

InspectReader.computeScaleAndEnvelope = function (
  nowMs,
  triggeredMs,
  idleOff,
  peak,
  idleAmp,
  idlePeriodS,
  riseMs,
  holdMs,
  fallMs,
) {
  const dtTrig = triggeredMs > 0 ? nowMs - triggeredMs : 1e12;
  const envelope = InspectReader.computeEnvelope(dtTrig, riseMs, holdMs, fallMs);
  const idleU = Math.sin(((nowMs / 1000 + idleOff) * InspectReader.TWO_PI) / idlePeriodS);
  const idleScale = 1 + idleAmp * idleU * (1 - envelope);
  const scale = Easing.lerp(1, peak, envelope) * idleScale;
  return { scale, envelope };
};
