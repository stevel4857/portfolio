import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;

function startLenis() {
  if (lenis || reduced.matches) return;
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function below(el: Element) {
  return el.getBoundingClientRect().top > window.innerHeight * 0.92;
}

function setup() {
  ctx?.revert();
  if (reduced.matches) return;
  const root = document.getElementById('motion-root') ?? document.querySelector('main');
  if (!root) return;

  ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (c) => {
      const desktop = !!c.conditions?.desktop;
      const dist = desktop ? 48 : 24;

      // Hero: content drifts up and softens, background parallax (desktop only).
      const hero = root.querySelector<HTMLElement>('header');
      if (hero && desktop) {
        const inner = hero.querySelector(':scope > .relative');
        if (inner) gsap.to(inner, { yPercent: -18, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.fromTo(hero, { backgroundPosition: '50% 50%' }, { backgroundPosition: '50% 75%', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      }

      // Section headings + eyebrows.
      root.querySelectorAll<HTMLElement>('section h2, section h2 ~ p, section .uppercase.tracking-\\[3px\\]').forEach((el) => {
        if (!below(el)) return;
        gsap.from(el, { y: dist * 0.6, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      // Cards (work, notes, pricing, testimonials) reveal in batches.
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-stagger-item], #pricing .rounded-3xl, #work .work-card')).filter((el, i, a) => a.indexOf(el) === i && below(el) && !hero?.contains(el));
      gsap.set(cards, { opacity: 0, y: dist });
      ScrollTrigger.batch(cards, {
        start: 'top 90%', once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true, clearProps: 'transform' }),
      });

      // Image parallax inside clipped frames (desktop only).
      if (desktop) {
        root.querySelectorAll<HTMLImageElement>('.overflow-hidden > img, .overflow-hidden img.object-cover').forEach((img) => {
          gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
    });
  });
  ScrollTrigger.refresh();
}

function boot() {
  startLenis();
  // motion-bundle swaps <main> for #motion-root; wait for it.
  const go = () => requestAnimationFrame(() => requestAnimationFrame(setup));
  if (document.getElementById('motion-root')) go();
  else {
    const mo = new MutationObserver(() => { if (document.getElementById('motion-root')) { mo.disconnect(); go(); } });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { mo.disconnect(); go(); }, 1500);
  }
  window.addEventListener('motion:page-enter', () => setTimeout(setup, 50));
  window.addEventListener('load', () => ScrollTrigger.refresh());
  reduced.addEventListener('change', () => { if (reduced.matches) { ctx?.revert(); lenis?.destroy(); lenis = null; } else { startLenis(); setup(); } });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
