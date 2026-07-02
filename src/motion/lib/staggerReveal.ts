import { animate, stagger } from 'motion';

export function runStaggerReveal(root: HTMLElement, reducedMotion: boolean): void {
  if (reducedMotion) {
    return;
  }

  const items = root.querySelectorAll<HTMLElement>('[data-stagger-item]');
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