/**
 * Iframe slide gallery: hash routing, arrows, keyboard, title + index.
 * Call initSpecGallery({ slides: [{ src, hash, title }, ...], ...ids }).
 */
(function (global) {
  function initSpecGallery(opts) {
    var slides = opts && opts.slides;
    if (!slides || !slides.length) return;

    var iframe = document.getElementById(opts.iframeId || 'demoFrame');
    var titleEl = document.getElementById(opts.titleId || 'slideTitle');
    var idxEl = document.getElementById(opts.idxId || 'slideIdx');
    var btnPrev = document.getElementById(opts.prevId || 'arrowPrev');
    var btnNext = document.getElementById(opts.nextId || 'arrowNext');

    if (!iframe) return;

    var HASH_TO_I = {};
    for (var s = 0; s < slides.length; s++) {
      HASH_TO_I[String(slides[s].hash || '').toLowerCase()] = s;
    }

    var idx = 0;

    function readHashIndex() {
      var h = (location.hash || '').replace(/^#/, '').trim().toLowerCase();
      if (Object.prototype.hasOwnProperty.call(HASH_TO_I, h)) return HASH_TO_I[h];
      return 0;
    }

    function setHashForIndex(i) {
      var h = slides[i].hash;
      var url = location.pathname + location.search + '#' + h;
      if (location.hash !== '#' + h) {
        history.replaceState(null, '', url);
      }
    }

    function show(i) {
      var n = slides.length;
      idx = ((i % n) + n) % n;
      iframe.src = slides[idx].src;
      if (titleEl) titleEl.textContent = slides[idx].title;
      if (idxEl) idxEl.textContent = idx + 1 + ' / ' + n;
      setHashForIndex(idx);
    }

    function step(d) {
      show(idx + d);
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { step(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { step(1); });

    window.addEventListener('hashchange', function () {
      var j = readHashIndex();
      if (j !== idx) {
        idx = j;
        iframe.src = slides[idx].src;
        if (titleEl) titleEl.textContent = slides[idx].title;
        if (idxEl) idxEl.textContent = idx + 1 + ' / ' + slides.length;
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      }
    });

    idx = readHashIndex();
    iframe.src = slides[idx].src;
    if (titleEl) titleEl.textContent = slides[idx].title;
    if (idxEl) idxEl.textContent = idx + 1 + ' / ' + slides.length;
    setHashForIndex(idx);
  }

  global.initSpecGallery = initSpecGallery;
})(typeof window !== 'undefined' ? window : this);
