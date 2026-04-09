/** Pure Venn circle overlap tests (no p5). Loaded before sketch.js. */
const VennGeometry = {};

VennGeometry.distSq = function (ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};

VennGeometry.pointInsideCircle = function (px, py, c, r, margin) {
  const m = margin;
  return VennGeometry.distSq(px, py, c.x, c.y) < (r - m) * (r - m);
};

VennGeometry.pointOutsideCircle = function (px, py, c, r, margin) {
  const m = margin;
  return VennGeometry.distSq(px, py, c.x, c.y) > (r + m) * (r + m);
};

/** Exclusive lobe for circle `i` using full `rFinal` disks (matches speck-exclusive when i === 0). */
VennGeometry.isExclusiveRegionGeometric = function (px, py, i, centers, rFinal) {
  const r2 = rFinal * rFinal;
  for (let k = 0; k < centers.length; k++) {
    const d2 = VennGeometry.distSq(px, py, centers[k].x, centers[k].y);
    if (k === i) {
      if (d2 > r2) return false;
    } else if (d2 <= r2) {
      return false;
    }
  }
  return true;
};

/**
 * Reader scan clip: same non-spectrum exclusions as `isExclusiveRegionGeometric(..., 2, ...)` (other disks at `rFinal`),
 * but spectrum disk radius is `rFinal + spectrumOutset` so the bar can reach the drawn ring (outer isolated edge).
 */
VennGeometry.isSpectrumExclusiveReaderScanClip = function (px, py, centers, rFinal, spectrumOutset) {
  const o = Math.max(0, spectrumOutset);
  const c2 = centers[2];
  const rSpec2 = (rFinal + o) * (rFinal + o);
  const r2 = rFinal * rFinal;
  if (VennGeometry.distSq(px, py, c2.x, c2.y) > rSpec2) return false;
  for (let k = 0; k < centers.length; k++) {
    if (k === 2) continue;
    if (VennGeometry.distSq(px, py, centers[k].x, centers[k].y) <= r2) return false;
  }
  return true;
};

/** Speck ∩ spectrum with full `rFinal` disks, excluding the inspect (1) disk (no triple-overlap fill). */
VennGeometry.isSpeckSpectrumOverlapGeometric = function (px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = VennGeometry.distSq(px, py, centers[0].x, centers[0].y);
  const d1 = VennGeometry.distSq(px, py, centers[1].x, centers[1].y);
  const d2 = VennGeometry.distSq(px, py, centers[2].x, centers[2].y);
  return d0 <= r2 && d2 <= r2 && d1 > r2;
};

/** Inspect ∩ spectrum with full `rFinal` disks, excluding the speck (0) disk (pair-phrase lobe, no triple overlap). */
VennGeometry.isInspectSpectrumOverlapGeometric = function (px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = VennGeometry.distSq(px, py, centers[0].x, centers[0].y);
  const d1 = VennGeometry.distSq(px, py, centers[1].x, centers[1].y);
  const d2 = VennGeometry.distSq(px, py, centers[2].x, centers[2].y);
  return d1 <= r2 && d2 <= r2 && d0 > r2;
};

/** Speck ∩ inspect with full `rFinal` disks, excluding the spectrum (2) disk (space-phrase lobe, no triple overlap). */
VennGeometry.isSpeckInspectOverlapGeometric = function (px, py, centers, rFinal) {
  const r2 = rFinal * rFinal;
  const d0 = VennGeometry.distSq(px, py, centers[0].x, centers[0].y);
  const d1 = VennGeometry.distSq(px, py, centers[1].x, centers[1].y);
  const d2 = VennGeometry.distSq(px, py, centers[2].x, centers[2].y);
  return d0 <= r2 && d1 <= r2 && d2 > r2;
};

VennGeometry.normalizeAnglePi = function (a) {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
};

VennGeometry.makeTextUpright = function (theta) {
  let t = VennGeometry.normalizeAnglePi(theta);
  if (t > Math.PI / 2) t -= Math.PI;
  if (t < -Math.PI / 2) t += Math.PI;
  return t;
};
