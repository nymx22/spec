/** Standalone easing + interpolation (no p5). Loaded before sketch.js. */
const Easing = {};

Easing.clamp01 = function (x) {
  return Math.max(0, Math.min(1, x));
};

Easing.lerp = function (a, b, t) {
  return a + (b - a) * t;
};

Easing.easeOutCubic = function (t) {
  t = Easing.clamp01(t);
  return 1 - Math.pow(1 - t, 3);
};

Easing.easeInOutCubic = function (t) {
  t = Easing.clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

Easing.smootherstep = function (t) {
  t = Easing.clamp01(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** easeInExpo — https://easings.net/#easeInExpo (slow start, fast end). */
Easing.easeInExpo = function (t) {
  t = Easing.clamp01(t);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.pow(2, 10 * t - 10);
};

/** easeOutExpo — https://easings.net/#easeOutExpo (fast start, slow end). */
Easing.easeOutExpo = function (t) {
  t = Easing.clamp01(t);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
};
