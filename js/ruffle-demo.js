/**
 * Live Flash (SWF) demo via Ruffle — shared by blog modal + permalink pages.
 * Expects a #ruffle-demo container in the post HTML.
 */
(function () {
  const DEFAULT_CONTAINER_ID = 'ruffle-demo';
  const DEFAULT_SWF = '/flash/techlogo.swf';
  const RUFFLE_SOURCES = [
    'https://unpkg.com/@ruffle-rs/ruffle',
    'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle',
  ];

  function showMessage(container, message) {
    container.innerHTML =
      '<p class="text-sm text-slate-400 p-4 text-center m-0" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">' +
      message +
      '</p>';
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-ruffle-src="' + src + '"]');
      if (existing) {
        if (window.RufflePlayer) {
          resolve();
          return;
        }
        existing.addEventListener('load', function () {
          resolve();
        });
        existing.addEventListener('error', function () {
          reject(new Error('Failed to load ' + src));
        });
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.ruffleSrc = src;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(script);
    });
  }

  function ensureRuffle() {
    if (window.RufflePlayer) {
      return Promise.resolve();
    }

    var chain = Promise.reject(new Error('start'));
    RUFFLE_SOURCES.forEach(function (src) {
      chain = chain.catch(function () {
        return loadScript(src).then(function () {
          if (!window.RufflePlayer) {
            throw new Error('Ruffle loaded but RufflePlayer is missing');
          }
        });
      });
    });
    return chain;
  }

  /**
   * Prepare container for absolute-fill player sizing (Firefox-safe).
   * Percentage heights on custom elements often collapse when parent height is auto.
   */
  function prepareContainer(container) {
    var cs = window.getComputedStyle(container);
    if (cs.position === 'static') {
      container.style.position = 'relative';
    }
    container.style.overflow = 'hidden';
    if (!container.style.width) {
      container.style.width = '100%';
    }
    if (!container.style.maxWidth) {
      container.style.maxWidth = '640px';
    }
    if (!container.style.aspectRatio && !container.style.height) {
      container.style.aspectRatio = '4 / 3';
    }
    if (!container.style.minHeight) {
      container.style.minHeight = '240px';
    }
    if (!container.style.backgroundColor && !container.classList.contains('bg-black')) {
      container.style.backgroundColor = '#000';
    }
  }

  /**
   * @param {object} [options]
   * @param {string} [options.containerId]
   * @param {string} [options.swfPath]
   * @param {object} [options.config] RufflePlayer.config overrides
   * @returns {Promise<void>}
   */
  function initRuffleDemo(options) {
    options = options || {};
    var containerId = options.containerId || DEFAULT_CONTAINER_ID;
    var swfPath = options.swfPath || DEFAULT_SWF;
    var container = document.getElementById(containerId);

    if (!container) {
      return Promise.resolve();
    }

    // Avoid double-mounting the same container
    if (container.dataset.ruffleInit === 'pending' || container.dataset.ruffleInit === 'done') {
      return Promise.resolve();
    }
    container.dataset.ruffleInit = 'pending';

    prepareContainer(container);
    showMessage(container, 'Loading Flash player…');

    return ensureRuffle()
      .then(function () {
        window.RufflePlayer = window.RufflePlayer || {};
        window.RufflePlayer.config = Object.assign(
          {
            autoplay: 'on',
            splashScreen: false,
            unmuteOverlay: 'hidden',
            quality: 'high',
            letterbox: 'on',
            scale: 'showAll',
          },
          window.RufflePlayer.config || {},
          options.config || {},
        );

        var ruffle = window.RufflePlayer.newest();
        var player = ruffle.createPlayer();

        container.innerHTML = '';
        container.appendChild(player);

        // Absolute fill: works with aspect-ratio boxes in Firefox and Chrome
        player.style.cssText =
          'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';

        return player.load(swfPath).then(function () {
          container.dataset.ruffleInit = 'done';
        });
      })
      .catch(function (err) {
        console.warn('Could not initialize Ruffle live demo:', err);
        container.dataset.ruffleInit = 'error';
        showMessage(
          container,
          'Could not start the Flash demo. Allow scripts from unpkg.com or jsdelivr.net, then refresh — or try Chrome/Edge.',
        );
      });
  }

  /** Reset init flag so a modal re-open can remount the player. */
  function resetRuffleDemo(containerId) {
    var container = document.getElementById(containerId || DEFAULT_CONTAINER_ID);
    if (container) {
      delete container.dataset.ruffleInit;
      container.innerHTML = '';
    }
  }

  window.initRuffleDemo = initRuffleDemo;
  window.resetRuffleDemo = resetRuffleDemo;

  function autoInit() {
    if (document.getElementById(DEFAULT_CONTAINER_ID)) {
      initRuffleDemo();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    // Defer one tick so a sync Ruffle <script> in <head> can finish first
    setTimeout(autoInit, 0);
  }
})();
