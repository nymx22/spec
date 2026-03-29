/**
 * post1.2 · 2 (world only): LiquidFun via SpecSpeckLiquid (no Matter, no sketch.js).
 * Canvas 4:5; mobile + desktop fit `main` via canvasFit4x5.js.
 */
function setup() {
  var dim = window.specCanvas4x5 ? specCanvas4x5.compute() : { w: 480, h: 600 };
  var cnv = createCanvas(dim.w, dim.h);
  if (window.specCanvas4x5) specCanvas4x5.applyPixelDensity(window);
  var mainEl = typeof document !== 'undefined' ? document.querySelector('main') : null;
  if (mainEl && cnv && cnv.parent) cnv.parent(mainEl);

  if (!window.SpecSpeckLiquid || !SpecSpeckLiquid.available()) {
    console.error('[liquidfunDemo] SpecSpeckLiquid or liquidfun not available');
    return;
  }
  var ok = SpecSpeckLiquid.initDemoWorld({ width: width, height: height });
  if (!ok) console.error('[liquidfunDemo] initDemoWorld failed');
  if (window.specCanvas4x5 && specCanvas4x5.installMainResizeDispatch) specCanvas4x5.installMainResizeDispatch();
}

function windowResized() {
  if (!window.specCanvas4x5) return;
  var dim = specCanvas4x5.compute();
  resizeCanvas(dim.w, dim.h);
  specCanvas4x5.applyPixelDensity(window);
  if (window.SpecSpeckLiquid && SpecSpeckLiquid.available()) {
    SpecSpeckLiquid.destroy();
    SpecSpeckLiquid.initDemoWorld({ width: width, height: height });
  }
}

function draw() {
  background(228);
  if (!window.SpecSpeckLiquid) return;
  var dt = typeof deltaTime !== 'undefined' ? deltaTime : 16;
  SpecSpeckLiquid.step(dt);
  SpecSpeckLiquid.drawParticles(255, 255, 255);
}
