import { animate, stagger } from 'motion';

export function runStaggerReveal(root: HTMLElement, reducedMotion: boolean): void {
  if (reducedMotion) {
    return;
  }

  // Pages opted into scroll effects reveal below-the-fold items with ScrollTrigger instead.
  const scrollFx = document.documentElement.hasAttribute('data-scroll-fx');
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-stagger-item]')).filter(
    (el) => !scrollFx || el.getBoundingClientRect().top < window.innerHeight,
  );
  if (!items.length) {
    return;
  }

  items.forEach((item) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(14px)';
  });

  animate(
    items,
    { opacity: [0, 1], y: [14, 0] },
    {
      delay: stagger(0.07, { startDelay: 0.08 }),
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  );
}