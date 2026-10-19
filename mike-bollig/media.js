/* Lazy YouTube (nocookie) facades + simple photo lightbox. */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-yt]'); if (!b) return;
    var id = b.dataset.yt, list = b.dataset.list, src = 'https://www.youtube-nocookie.com/embed/' + (list ? 'videoseries?list=' + list + '&' : id + '?') + 'autoplay=1&rel=0&enablejsapi=1';
    var f = document.createElement('iframe'); f.src = src; f.title = b.getAttribute('aria-label') || 'YouTube video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.className = 'mb-yt-frame';
    document.querySelectorAll('[data-mb-player]').forEach(function (p) { p.mbp && p.mbp.audio.pause(); });
    b.replaceWith(f);
  });
  window.addEventListener('mbp:play', function () { document.querySelectorAll('.mb-yt-frame').forEach(function (f) { try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch (_) {} }); });
  var items = [].slice.call(document.querySelectorAll('[data-lightbox]')); if (!items.length) return;
  var dlg = document.createElement('dialog'); dlg.className = 'mb-lb'; dlg.setAttribute('aria-label', 'Photo viewer');
  dlg.innerHTML = '<img alt=""><button type="button" class="mb-lb-x" aria-label="Close">&times;</button><button type="button" class="mb-lb-p" aria-label="Previous photo">&#8249;</button><button type="button" class="mb-lb-n" aria-label="Next photo">&#8250;</button>';
  document.body.appendChild(dlg); var img = dlg.querySelector('img'), at = 0;
  function open(i) { at = (i + items.length) % items.length; img.src = items[at].getAttribute('href'); img.alt = items[at].querySelector('img').alt; if (!dlg.open) dlg.showModal(); }
  items.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
  dlg.querySelector('.mb-lb-x').onclick = function () { dlg.close(); };
  dlg.querySelector('.mb-lb-p').onclick = function () { open(at - 1); };
  dlg.querySelector('.mb-lb-n').onclick = function () { open(at + 1); };
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') open(at - 1); if (e.key === 'ArrowRight') open(at + 1); });
})();
