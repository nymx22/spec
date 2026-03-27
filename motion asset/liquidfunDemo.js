/**
 * Phase 2–3: LiquidFun via SpecSpeckLiquid (no Matter, no sketch.js).
 * initDemoWorld = circular wall + water blob in pixel/Matter-style coords.
 */
function setup() {
  var cnv = createCanvas(480, 480);
  var mainEl = typeof document !== 'undefined' ? document.querySelector('main') : null;
  if (mainEl && cnv && cnv.parent) cnv.parent(mainEl);

  if (!window.SpecSpeckLiquid || !SpecSpeckLiquid.available()) {
    console.error('[liquidfunDemo] SpecSpeckLiquid or liquidfun not available');
    return;
  }
  var ok = SpecSpeckLiquid.initDemoWorld({ width: width, height: height });
  if (!ok) console.error('[liquidfunDemo] initDemoWorld failed');
}

function draw() {
  background(248);
  if (!window.SpecSpeckLiquid) return;
  var dt = typeof deltaTime !== 'undefined' ? deltaTime : 16;
  SpecSpeckLiquid.step(dt);
  SpecSpeckLiquid.drawParticles(30, 100, 220);
}
