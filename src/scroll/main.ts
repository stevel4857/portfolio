import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;

function startLenis() {
  if (lenis || reduced.matches) return;
  // Reading pages (blog posts) keep native scrolling: wheel/trackpad must always work there.
  if (document.querySelector('.blog-content')) return;
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  (window as Window & { __lenis?: Lenis }).__lenis = lenis;
  // Keep Lenis' scroll limit in sync as images, embeds and soft-navigated pages change height.
  new ResizeObserver(() => { lenis?.resize(); ScrollTrigger.refresh(); }).observe(document.body);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function below(el: Element) {
  return el.getBoundingClientRect().top > window.innerHeight * 0.92;
}

function setup() {
  ctx?.revert();
  document.querySelectorAll('[data-sfx-pending]').forEach((el) => el.removeAttribute('data-sfx-pending'));
  if (reduced.matches) return;
  const root = document.getElementById('motion-root') ?? document.querySelector('main');
  if (!root) return;

  ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (c) => {
      const desktop = !!c.conditions?.desktop;
      const article = root.querySelector<HTMLElement>('.blog-content');
      const reading = !!article;
      const dist = reading ? (desktop ? 18 : 12) : desktop ? 48 : 24;

      const reveal = (els: HTMLElement[], d = dist, stagger = 0.1) => {
        els = els.filter((el, i, a) => a.indexOf(el) === i && below(el));
        if (!els.length) return;
        gsap.set(els, { opacity: 0, y: d });
        els.forEach((el) => el.setAttribute('data-sfx-pending', ''));
        ScrollTrigger.batch(els, {
          start: 'top 97%', once: true,
          onEnter: (b) => show(b as HTMLElement[], stagger),
        });
      };
      const show = (b: HTMLElement[], stagger: number) => {
        b = b.filter((el) => el.hasAttribute('data-sfx-pending'));
        b.forEach((el) => el.removeAttribute('data-sfx-pending'));
        if (b.length) gsap.to(b, { opacity: 1, y: 0, duration: reading ? 0.7 : 0.9, ease: 'power3.out', stagger, overwrite: true, clearProps: 'transform' });
      };

      // Homepage hero: content drifts up and softens, background parallax (desktop only).
      const hero = root.querySelector<HTMLElement>('header[style*="background-image"]');
      if (hero && desktop) {
        const inner = hero.querySelector(':scope > .relative');
        if (inner) gsap.to(inner, { yPercent: -18, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.fromTo(hero, { backgroundPosition: '50% 50%' }, { backgroundPosition: '50% 75%', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }

      // Section headings, eyebrows and intro lines (not inside the article body).
      reveal(Array.from(root.querySelectorAll<HTMLElement>('section h2, section h2 ~ p, section .uppercase.tracking-\\[3px\\]')).filter((el) => !article?.contains(el) && !hero?.contains(el)), dist * 0.6, 0.06);

      // Cards (work, notes, pricing, testimonials, blog index).
      reveal(Array.from(root.querySelectorAll<HTMLElement>('[data-stagger-item], #pricing .rounded-3xl, .work-card, article.rounded-3xl, a.rounded-3xl')).filter((el) => !hero?.contains(el) && !article?.contains(el)));

      // Blog posts: subtle reveals for headings and media only; body text stays put.
      if (article) {
        reveal(Array.from(article.querySelectorAll<HTMLElement>(':scope > h2, :scope > h3, :scope > figure, :scope > img, :scope > pre, :scope > blockquote, :scope > iframe, :scope > div')), dist, 0.05);
      }

      // Image parallax inside clipped frames (desktop, non-reading pages).
      if (desktop && !reading) {
        root.querySelectorAll<HTMLImageElement>('.overflow-hidden > img').forEach((img) => {
          gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
      // Safety net: after jumps (anchor links, /#section arrivals) reveal anything already in or above view.
      const sweep = () => show(Array.from(document.querySelectorAll<HTMLElement>('[data-sfx-pending]')).filter((el) => el.getBoundingClientRect().top < window.innerHeight), 0.05);
      ScrollTrigger.addEventListener('scrollEnd', sweep);
      window.addEventListener('hashchange', () => setTimeout(sweep, 1200));
      const iv = window.setInterval(sweep, 1000);
      return () => { ScrollTrigger.removeEventListener('scrollEnd', sweep); window.clearInterval(iv); };
    });
  });
  ScrollTrigger.refresh();
  landOnHash();
}

// Cross-page links like /#contact: land on the section once effects are set up and again after load.
let landed = false;
function landOnHash() {
  if (landed || !location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  const go = () => (lenis ? lenis.scrollTo(target, { immediate: true, force: true }) : target.scrollIntoView({ block: 'start' }));
  go();
  if (document.readyState !== 'complete') window.addEventListener('load', () => setTimeout(() => { ScrollTrigger.refresh(); go(); }, 50), { once: true });
  else setTimeout(go, 300);
  landed = true;
}

function boot() {
  startLenis();
  // motion-bundle swaps <main> for #motion-root; wait for it.
  const go = () => requestAnimationFrame(() => requestAnimationFrame(setup));
  if (document.getElementById('motion-root') || !document.querySelector('[data-motion-page]')) go();
  else {
    const mo = new MutationObserver(() => { if (document.getElementById('motion-root')) { mo.disconnect(); go(); } });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { mo.disconnect(); go(); }, 1500);
  }
  window.addEventListener('motion:page-enter', () => setTimeout(() => {
    // Soft navigation can swap a normal page for a blog post (or back): toggle smooth scroll to match.
    if (document.querySelector('.blog-content') && lenis) { lenis.destroy(); lenis = null; delete (window as Window & { __lenis?: Lenis }).__lenis; }
    else if (!lenis) startLenis();
    lenis?.resize();
    setup();
  }, 350));
  window.addEventListener('load', () => ScrollTrigger.refresh());
  reduced.addEventListener('change', () => { if (reduced.matches) { ctx?.revert(); lenis?.destroy(); lenis = null; delete (window as Window & { __lenis?: Lenis }).__lenis; } else { startLenis(); setup(); } });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
