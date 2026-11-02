/*
 * Flip book for blog posts.
 * Markup: <div class="flipbook" data-flipbook="/assets/flipbooks/NAME/pages.json"> fallback content </div>
 * Uses the vendored StPageFlip library (js/vendor/page-flip.browser.js, MIT).
 * Pages load lazily near the current spread. Click, tap, swipe, arrow keys, buttons and full screen.
 */
(function () {
  'use strict';

  var LIB_SRC = '/js/vendor/page-flip.browser.js';
  var STYLE_ID = 'flipbook-styles';
  var CSS = [
    '.flipbook{position:relative;margin:2.5rem 0;}',
    '.flipbook-stage{position:relative;margin:0 auto;width:100%;touch-action:pan-y;transition:transform .45s ease;}',
    '@media (prefers-reduced-motion: reduce){.flipbook-stage{transition:none;}}',
    '.flipbook-stage .fb-page{background:#fff;overflow:hidden;}',
    '.flipbook-stage .fb-page img{display:block;width:100%;height:100%;object-fit:cover;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;user-select:none;-webkit-user-drag:none;pointer-events:none;}',
    '.flipbook-stage .stf__parent{margin:0 auto;}',
    '.flipbook-stage .stf__block{filter:drop-shadow(0 10px 24px rgba(15,23,42,.18));}',
    '.flipbook-bar{display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:1rem;flex-wrap:wrap;}',
    '.flipbook-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-width:44px;height:44px;padding:0 .9rem;border:1px solid #e2e8f0;border-radius:9999px;background:#fff;color:#0f172a;font:500 14px/1 Inter,system-ui,sans-serif;cursor:pointer;transition:background .2s,border-color .2s;}',
    '.flipbook-btn:hover{background:#f8fafc;border-color:#cbd5e1;}',
    '.flipbook-btn:focus-visible{outline:2px solid #0f172a;outline-offset:2px;}',
    '.flipbook-btn[disabled]{opacity:.4;cursor:default;}',
    '.flipbook-count{min-width:10.5rem;text-align:center;font:500 14px/1.2 Inter,system-ui,sans-serif;color:#475569;font-variant-numeric:tabular-nums;}',
    '.flipbook-hint{margin-top:.6rem;text-align:center;font-size:13px;color:#64748b;}',
    '.flipbook.is-fs{position:fixed;inset:0;z-index:2147483000;margin:0;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;}',
    '.flipbook:fullscreen{position:fixed;inset:0;margin:0;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;}',
    '.flipbook:-webkit-full-screen{position:fixed;inset:0;margin:0;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;width:100%;height:100%;}',
    '.flipbook.is-fs .flipbook-stage{flex:0 0 auto;}',
    '.flipbook.is-fs .flipbook-bar{margin-top:12px;}',
    '.flipbook.is-fs .flipbook-btn{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.25);color:#fff;}',
    '.flipbook.is-fs .flipbook-btn:hover{background:rgba(255,255,255,.16);}',
    '.flipbook.is-fs .flipbook-btn:focus-visible{outline-color:#fff;}',
    '.flipbook.is-fs .flipbook-count{color:#e2e8f0;}',
    '.flipbook.is-fs .flipbook-hint{display:none;}',
    '@media (max-width:440px){.flipbook-btn span{display:none}.flipbook-count{min-width:8.5rem}}',
    'html.flipbook-lock,html.flipbook-lock body{overflow:hidden!important;}'
  ].join('\n');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var libPromise = null;
  function loadLib() {
    if (window.St && window.St.PageFlip) return Promise.resolve();
    if (libPromise) return libPromise;
    libPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = LIB_SRC;
      s.onload = function () { resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function icon(name) {
    var paths = {
      prev: '<path d="M15 18l-6-6 6-6"/>',
      next: '<path d="M9 18l6-6-6-6"/>',
      expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
      shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'
    };
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  }

  function Flipbook(root, manifest, base) {
    this.root = root;
    this.m = manifest;
    this.base = base;
    this.total = manifest.pages.length;
    this.interior = this.total - 2;
    this.ratio = manifest.width / manifest.height;
    this.loaded = {};
    this.inView = false;
    this.fs = false;
    this.overlay = false;
    this.savedScroll = 0;
    this.build();
  }

  Flipbook.prototype.build = function () {
    var self = this;
    var root = this.root;
    root.innerHTML = '';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'flip book');
    root.setAttribute('aria-label', this.m.title + ', picture book');

    var stage = document.createElement('div');
    stage.className = 'flipbook-stage';
    var book = document.createElement('div');
    stage.appendChild(book);

    this.pageEls = this.m.pages.map(function (p, i) {
      var d = document.createElement('div');
      d.className = 'fb-page';
      if (i === 0 || i === self.total - 1) d.setAttribute('data-density', 'hard');
      var img = document.createElement('img');
      img.alt = p.alt || ('Page ' + i);
      img.decoding = 'async';
      img.draggable = false;
      img.width = self.m.width;
      img.height = self.m.height;
      img.setAttribute('data-src', self.base + p.src);
      d.appendChild(img);
      book.appendChild(d);
      return d;
    });

    var bar = document.createElement('div');
    bar.className = 'flipbook-bar';
    bar.innerHTML =
      '<button type="button" class="flipbook-btn" data-fb="prev" aria-label="Previous page">' + icon('prev') + '</button>' +
      '<span class="flipbook-count" aria-live="polite"></span>' +
      '<button type="button" class="flipbook-btn" data-fb="next" aria-label="Next page">' + icon('next') + '</button>' +
      '<button type="button" class="flipbook-btn" data-fb="fs" aria-label="Full screen" aria-pressed="false">' + icon('expand') + '<span>Full screen</span></button>';

    var hint = document.createElement('p');
    hint.className = 'flipbook-hint';
    hint.textContent = 'Click or swipe a page to turn it. Arrow keys work too.';

    root.appendChild(stage);
    root.appendChild(bar);
    root.appendChild(hint);

    this.stage = stage;
    this.bookEl = book;
    this.countEl = bar.querySelector('.flipbook-count');
    this.prevBtn = bar.querySelector('[data-fb="prev"]');
    this.nextBtn = bar.querySelector('[data-fb="next"]');
    this.fsBtn = bar.querySelector('[data-fb="fs"]');

    this.prevBtn.addEventListener('click', function () { self.go(-1); });
    this.nextBtn.addEventListener('click', function () { self.go(1); });
    this.fsBtn.addEventListener('click', function () { self.toggleFs(); });

    this.pf = new window.St.PageFlip(book, {
      width: this.m.width / 2,
      height: this.m.height / 2,
      size: 'stretch',
      minWidth: 180,
      maxWidth: 1400,
      minHeight: Math.round(180 / this.ratio),
      maxHeight: Math.round(1400 / this.ratio),
      showCover: true,
      usePortrait: true,
      mobileScrollSupport: true,
      maxShadowOpacity: reduceMotion ? 0 : 0.45,
      drawShadow: !reduceMotion,
      flippingTime: reduceMotion ? 1 : 750,
      showPageCorners: !reduceMotion,
      startZIndex: 0,
      autoSize: true
    });
    this.pf.loadFromHTML(this.pageEls);
    // Touch: treat any horizontal swipe under 0.8s as a page turn. The library's slow touch drag
    // can pick the wrong direction in one page (portrait) mode, so it only starts after a long hold.
    try { var ui = this.pf.getUI(); if (ui) ui.swipeTimeout = 800; } catch (e) {}
    this.pf.on('flip', function () { self.onChange(); });
    this.pf.on('changeOrientation', function () { self.onChange(); });
    this.pf.on('init', function () { self.onChange(); });

    // Keyboard: only when the book is on screen or in full screen, and not while typing.
    document.addEventListener('keydown', function (e) {
      if (!(self.inView || self.fs)) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); self.go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.go(-1); }
      else if (e.key === 'Escape' && self.overlay) { self.exitFs(); }
    });

    document.addEventListener('fullscreenchange', function () { self.onFsChange(); });
    document.addEventListener('webkitfullscreenchange', function () { self.onFsChange(); });
    window.addEventListener('resize', function () { self.layout(); });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          self.inView = en.isIntersecting;
          if (en.isIntersecting) self.loadAround();
        });
      }, { rootMargin: '600px 0px' });
      io.observe(root);
    } else {
      this.inView = true;
      this.loadAround();
    }
    this.layout();
    this.onChange();
  };

  Flipbook.prototype.index = function () {
    try { return this.pf.getCurrentPageIndex(); } catch (e) { return 0; }
  };

  Flipbook.prototype.go = function (dir) {
    if (reduceMotion) {
      var i = this.index();
      var step = this.pf.getOrientation() === 'landscape' ? (i === 0 && dir > 0 ? 1 : 2) : 1;
      var target = Math.max(0, Math.min(this.total - 1, i + dir * step));
      if (this.pf.getOrientation() === 'landscape' && target > 0 && target < this.total - 1 && target % 2 === 0) target -= 1;
      this.pf.turnToPage(target);
      this.onChange();
    } else if (dir > 0) {
      this.pf.flipNext();
    } else {
      this.pf.flipPrev();
    }
  };

  Flipbook.prototype.loadPage = function (i) {
    if (i < 0 || i >= this.total || this.loaded[i]) return;
    this.loaded[i] = true;
    var img = this.pageEls[i].querySelector('img');
    img.src = img.getAttribute('data-src');
  };

  Flipbook.prototype.loadAround = function () {
    if (!this.inView && !this.fs) return;
    var i = this.index();
    for (var k = i - 2; k <= i + 5; k++) this.loadPage(k);
  };

  Flipbook.prototype.onChange = function () {
    var i = this.index();
    var last = this.total - 1;
    var txt;
    if (i <= 0) txt = 'Front cover';
    else if (i >= last) txt = 'Back cover';
    else if (this.pf.getOrientation() === 'landscape') {
      var a = i % 2 === 1 ? i : i - 1;
      txt = 'Pages ' + a + ' and ' + Math.min(a + 1, this.interior) + ' of ' + this.interior;
    } else txt = 'Page ' + i + ' of ' + this.interior;
    this.countEl.textContent = txt;
    // Center the closed book: the front cover sits on the right half and the back cover on the left.
    var shift = 0;
    if (this.pf.getOrientation() === 'landscape') shift = i <= 0 ? -25 : (i >= last ? 25 : 0);
    this.stage.style.transform = shift ? 'translateX(' + shift + '%)' : '';
    this.prevBtn.disabled = i <= 0;
    this.nextBtn.disabled = i >= last;
    this.loadAround();
  };

  // Size the stage. Inline: full column width. Full screen: as large as fits.
  Flipbook.prototype.layout = function () {
    var stage = this.stage;
    if (this.fs) {
      var barH = 76;
      var W = window.innerWidth - 32;
      var H = window.innerHeight - 32 - barH;
      var spread = Math.min(W, 2 * H * this.ratio);
      var single = Math.min(W, H * this.ratio);
      // Use two page spreads when the screen is wide enough for them.
      var useSpread = spread / 2 >= 180 && W > H * this.ratio * 1.35;
      stage.style.width = Math.floor(useSpread ? spread : single) + 'px';
      // StPageFlip switches to one page when the stage is narrower than two minimum pages.
      this.pf.getSettings().minWidth = useSpread ? 180 : Math.ceil(single / 2) + 1;
    } else {
      stage.style.width = '';
      this.pf.getSettings().minWidth = 180;
    }
    var keep = this.index();
    try { this.pf.update(); } catch (e) {}
    if (this.index() !== keep) this.pf.turnToPage(keep);
    this.onChange();
  };

  Flipbook.prototype.toggleFs = function () {
    if (this.fs) this.exitFs(); else this.enterFs();
  };

  Flipbook.prototype.enterFs = function () {
    var r = this.root;
    this.savedScroll = window.scrollY || window.pageYOffset || 0;
    var req = r.requestFullscreen || r.webkitRequestFullscreen;
    if (req) {
      try {
        var p = req.call(r);
        if (p && p.catch) {
          var self = this;
          p.catch(function () { self.enterOverlay(); });
        }
        return;
      } catch (e) {}
    }
    this.enterOverlay();
  };

  Flipbook.prototype.enterOverlay = function () {
    this.overlay = true;
    document.documentElement.classList.add('flipbook-lock');
    if (window.__lenis && window.__lenis.stop) window.__lenis.stop();
    this.setFs(true);
  };

  Flipbook.prototype.exitFs = function () {
    if (this.overlay) {
      this.overlay = false;
      document.documentElement.classList.remove('flipbook-lock');
      if (window.__lenis && window.__lenis.start) window.__lenis.start();
      this.setFs(false);
      return;
    }
    var ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsElement() && ex) ex.call(document);
  };

  Flipbook.prototype.onFsChange = function () {
    var on = fsElement() === this.root;
    if (on === this.fs || this.overlay) return;
    if (on && window.__lenis && window.__lenis.stop) window.__lenis.stop();
    if (!on && window.__lenis && window.__lenis.start) window.__lenis.start();
    this.setFs(on);
  };

  Flipbook.prototype.setFs = function (on) {
    var keep = this.index();
    this.fs = on;
    this.root.classList.toggle('is-fs', on);
    this.fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    this.fsBtn.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    this.fsBtn.innerHTML = icon(on ? 'shrink' : 'expand') + '<span>' + (on ? 'Exit full screen' : 'Full screen') + '</span>';
    this.layout();
    if (this.index() !== keep) this.pf.turnToPage(keep);
    this.onChange();
    if (!on) {
      var y = this.savedScroll;
      window.scrollTo(0, y);
      if (window.__lenis && window.__lenis.scrollTo) window.__lenis.scrollTo(y, { immediate: true, force: true });
    }
    this.fsBtn.focus({ preventScroll: true });
  };

  function initOne(root) {
    if (root.__flipbook) return;
    root.__flipbook = true;
    var url = root.getAttribute('data-flipbook');
    var base = url.replace(/[^/]*$/, '');
    Promise.all([
      loadLib(),
      fetch(url, { credentials: 'same-origin' }).then(function (r) { return r.json(); })
    ]).then(function (res) {
      addStyles();
      root.__flipbook = new Flipbook(root, res[1], base);
    }).catch(function (err) {
      root.__flipbook = false;
      if (window.console) console.warn('Flip book could not load', err);
    });
  }

  function initFlipbooks(scope) {
    var list = (scope || document).querySelectorAll('[data-flipbook]');
    for (var i = 0; i < list.length; i++) initOne(list[i]);
  }

  window.initFlipbooks = initFlipbooks;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initFlipbooks(); });
  else initFlipbooks();
})();
