/**
 * Shared 4:5 canvas fitting for LiquidFun phase pages.
 * Mobile and desktop both fit `main` (or window) so hub iframes and narrow viewports match the layout
 * (fixed 480×600 on mobile caused letterboxing / scale fights with CSS `object-fit: contain`).
 */
(function () {
  var RW = 480;
  var RH = 600;
  var MQ = '(max-width: 768px)';
  var MAX_W = 1120;
  var MAX_H = 1400;

  function compute() {
    if (typeof window === 'undefined') return { w: RW, h: RH };

    var mobile = window.matchMedia(MQ).matches;
    var main = typeof document !== 'undefined' ? document.querySelector('main') : null;
    var rect = main
      ? main.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };

    var floorW = mobile ? 160 : 260;
    var floorH = mobile ? 200 : 320;
    var minFinalW = mobile ? 140 : 280;
    var boxW = Math.max(floorW, rect.width);
    var boxH = Math.max(floorH, rect.height);

    var w = Math.min(boxW, boxH * (RW / RH));
    w = Math.floor(w);
    var h = Math.round(w * (RH / RW));
    if (h > boxH) {
      h = Math.floor(boxH);
      w = Math.floor(h * (RW / RH));
      h = Math.round(w * (RH / RW));
    }

    if (mobile) {
      w = Math.max(minFinalW, w);
      w = Math.min(w, Math.floor(boxW));
      h = Math.round(w * (RH / RW));
      if (h > boxH) {
        h = Math.floor(boxH);
        w = Math.max(minFinalW, Math.floor(h * (RW / RH)));
        w = Math.min(w, Math.floor(boxW));
        h = Math.round(w * (RH / RW));
      }
      return { w: w, h: h };
    }

    var sd = Math.min(1, MAX_W / w, MAX_H / h);
    w = Math.max(minFinalW, Math.floor(w * sd));
    h = Math.round(w * (RH / RW));
    if (h > boxH) {
      h = Math.floor(boxH);
      w = Math.floor(h * (RW / RH));
      w = Math.max(minFinalW, Math.min(w, Math.floor(boxW)));
      h = Math.round(w * (RH / RW));
    }
    return { w: w, h: h };
  }

  /**
   * Desktop: match device pixels (ceil fractional DPR). Cap at 4 for memory.
   * Physics stay in logical p5 units; only the backing store sharpens — no radius retune.
   */
  function desktopPixelDensity() {
    var dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return Math.min(4, Math.max(1, Math.ceil(dpr)));
  }

  function applyPixelDensity(p5) {
    if (!p5 || typeof p5.pixelDensity !== 'function') return;
    var mobile = window.matchMedia(MQ).matches;
    p5.pixelDensity(mobile ? 1 : desktopPixelDensity());
  }

  /** p5 listens to `window` resize; iframe flex often resizes `main` without that. */
  function installMainResizeDispatch() {
    if (typeof ResizeObserver === 'undefined' || typeof document === 'undefined') return;
    if (window.__specMainResizeObserved) return;
    var main = document.querySelector('main');
    if (!main) return;
    window.__specMainResizeObserved = true;
    var t;
    new ResizeObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
      }, 60);
    }).observe(main);
  }

  window.specCanvas4x5 = {
    refW: RW,
    refH: RH,
    compute: compute,
    applyPixelDensity: applyPixelDensity,
    desktopPixelDensity: desktopPixelDensity,
    installMainResizeDispatch: installMainResizeDispatch,
  };
})();
