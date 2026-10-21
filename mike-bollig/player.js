/* Reusable multi-track MP3 player. Usage: <div data-mb-player data-tracks="#tracks-json"></div>
   Track JSON: [{id,title,src,art,duration,lyrics,download}] — no dependencies. */
(function () {
  function fmt(s) { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function init(root) {
    var tracks = JSON.parse(document.querySelector(root.dataset.tracks).textContent);
    var artist = root.dataset.artist || '';
    var audio = new Audio(); audio.preload = 'none';
    var cur = 0, loaded = -1;
    root.classList.add('mbp');
    root.innerHTML =
      '<div class="mbp-now">' +
        '<img class="mbp-art" alt="" width="600" height="600">' +
        '<div class="mbp-meta"><p class="mbp-kicker">Now playing</p><h3 class="mbp-title" aria-live="polite"></h3><p class="mbp-artist">' + esc(artist) + '</p>' +
          '<div class="mbp-controls">' +
            '<button type="button" class="mbp-btn mbp-prev" aria-label="Previous track"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM9.5 12 18 6v12z"/></svg></button>' +
            '<button type="button" class="mbp-btn mbp-play" aria-label="Play"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg></button>' +
            '<button type="button" class="mbp-btn mbp-next" aria-label="Next track"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg></button>' +
          '</div>' +
          '<div class="mbp-seekrow"><span class="mbp-cur">0:00</span><input class="mbp-seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek"><span class="mbp-dur">0:00</span></div>' +
        '</div>' +
      '</div>' +
      '<ol class="mbp-list"></ol>';
    var collapsible = root.hasAttribute('data-collapsible'), bar, panel, mini, setOpen = function () {};
    if (collapsible) {
      var pid = (root.id || 'mbp') + '-panel';
      panel = document.createElement('div'); panel.className = 'mbp-panel'; panel.id = pid;
      while (root.firstChild) panel.appendChild(root.firstChild);
      bar = document.createElement('div'); bar.className = 'mbp-bar';
      bar.innerHTML = '<button type="button" class="mbp-toggle" aria-expanded="false" aria-controls="' + pid + '">' +
        '<span class="mbp-bar-txt"><span class="mbp-bar-title">Listen: ' + tracks.length + ' tracks</span><span class="mbp-bar-now"></span></span>' +
        '<span class="mbp-bar-cta">Open player</span><svg class="mbp-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg></button>' +
        '<button type="button" class="mbp-btn mbp-mini" aria-label="Play"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg></button>';
      root.appendChild(bar); root.appendChild(panel);
      root.classList.add('mbp-collapsible');
      var toggle = bar.querySelector('.mbp-toggle'), cta = bar.querySelector('.mbp-bar-cta'); mini = bar.querySelector('.mbp-mini');
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      var refresh = function () { window.dispatchEvent(new Event('resize')); };
      panel.hidden = true;
      setOpen = function (open) {
        if ((toggle.getAttribute('aria-expanded') === 'true') === open) return;
        toggle.setAttribute('aria-expanded', String(open)); root.classList.toggle('is-open', open); cta.textContent = open ? 'Close player' : 'Open player';
        var done = function () { panel.style.height = ''; panel.style.overflow = ''; if (!open) panel.hidden = true; refresh(); };
        if (reduce.matches) { panel.hidden = !open; done(); return; }
        panel.hidden = false; var h = panel.scrollHeight; panel.style.overflow = 'hidden';
        panel.style.height = (open ? 0 : h) + 'px'; panel.offsetHeight; panel.style.height = (open ? h : 0) + 'px';
        var t, fin = function (e) { if (e && e.target !== panel) return; panel.removeEventListener('transitionend', fin); clearTimeout(t); done(); };
        t = setTimeout(fin, 600); panel.addEventListener('transitionend', fin);
      };
      toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
      root.mbpOpen = setOpen;
    }
    var $ = function (s) { return root.querySelector(s); };
    var art = $('.mbp-art'), title = $('.mbp-title'), play = $('.mbp-play'), seek = $('.mbp-seek'), tcur = $('.mbp-cur'), tdur = $('.mbp-dur'), list = $('.mbp-list');
    tracks.forEach(function (t, i) {
      var li = document.createElement('li'); li.className = 'mbp-item';
      li.innerHTML = '<div class="mbp-row"><button type="button" class="mbp-pick" data-i="' + i + '"><img src="' + esc(t.art) + '" alt="" loading="lazy" width="48" height="48"><span class="mbp-n">' + (i + 1) + '</span><span class="mbp-t">' + esc(t.title) + '</span><span class="mbp-d">' + fmt(t.duration) + '</span></button>' +
        '<a class="mbp-dl" href="' + esc(t.src) + '" download="' + esc(t.download) + '" aria-label="Download ' + esc(t.title) + ' (MP3)" title="Download MP3"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v9l3.5-3.5 1.4 1.4L12 16.8 6.1 10.9l1.4-1.4L11 13zM5 18h14v2H5z"/></svg></a></div>' +
        (t.lyrics ? '<details class="mbp-lyrics"><summary>Lyrics</summary><pre data-lenis-prevent>' + esc(t.lyrics) + '</pre></details>' : '');
      list.appendChild(li);
    });
    function show(i) {
      var t = tracks[i]; if (bar) bar.querySelector('.mbp-bar-now').textContent = (loaded >= 0 ? 'Now playing: ' : 'Up next: ') + t.title; art.src = t.art; art.alt = t.title + ' cover art'; title.textContent = t.title;
      tdur.textContent = fmt(t.duration); tcur.textContent = '0:00'; seek.value = 0;
      list.querySelectorAll('.mbp-item').forEach(function (li, k) { li.classList.toggle('is-current', k === i); var b = li.querySelector('.mbp-pick'); if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    function load(i) { cur = (i + tracks.length) % tracks.length; loaded = cur; show(cur); audio.src = tracks[cur].src; }
    function start(i) { if (i !== undefined && i !== loaded) load(i); else if (loaded < 0) load(cur); var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    function setState() { var on = !audio.paused; root.classList.toggle('is-playing', on); play.setAttribute('aria-label', on ? 'Pause' : 'Play'); if (mini) mini.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + tracks[cur].title); }
    if (mini) mini.addEventListener('click', function () { audio.paused ? start() : audio.pause(); });
    play.addEventListener('click', function () { audio.paused ? start() : audio.pause(); });
    $('.mbp-prev').addEventListener('click', function () { var w = !audio.paused || loaded < 0; if (audio.currentTime > 3) { audio.currentTime = 0; return; } load(cur - 1); if (w) start(); });
    $('.mbp-next').addEventListener('click', function () { var w = !audio.paused || loaded < 0; load(cur + 1); if (w) start(); });
    list.addEventListener('click', function (e) { var b = e.target.closest('.mbp-pick'); if (!b) return; var i = +b.dataset.i; if (i === loaded && !audio.paused) { audio.pause(); return; } start(i); });
    audio.addEventListener('play', setState); audio.addEventListener('pause', setState);
    audio.addEventListener('loadedmetadata', function () { tdur.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', function () { if (!seeking && audio.duration) { seek.value = audio.currentTime / audio.duration * 100; } tcur.textContent = fmt(audio.currentTime); });
    audio.addEventListener('ended', function () { if (cur < tracks.length - 1) start(cur + 1); else { load(0); setState(); } });
    var seeking = false;
    seek.addEventListener('input', function () { seeking = true; var d = audio.duration || tracks[cur].duration; tcur.textContent = fmt(seek.value / 100 * d); });
    seek.addEventListener('change', function () { seeking = false; if (loaded < 0) load(cur); var d = audio.duration; if (d) audio.currentTime = seek.value / 100 * d; else audio.addEventListener('loadedmetadata', function f() { audio.currentTime = seek.value / 100 * audio.duration; audio.removeEventListener('loadedmetadata', f); }); });
    root.addEventListener('keydown', function (e) { if (e.target.matches('input,summary,a,.mbp-toggle')) return; if (e.key === ' ' && !e.target.matches('button')) { e.preventDefault(); play.click(); } });
    // Only one media element plays at a time on the page.
    document.addEventListener('play', function (e) { if (e.target !== audio) audio.pause(); }, true);
    audio.addEventListener('play', function () { document.querySelectorAll('audio,video').forEach(function (m) { if (m !== audio) m.pause(); }); window.dispatchEvent(new CustomEvent('mbp:play')); });
    show(0);
    root.mbp = { audio: audio, tracks: tracks, play: start, next: function () { $('.mbp-next').click(); }, prev: function () { $('.mbp-prev').click(); }, get index() { return cur; } };
  }
  function boot() { document.querySelectorAll('[data-mb-player]').forEach(function (el) { if (!el.mbp) init(el); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('components:loaded', boot);
})();
