import { animate, inView } from 'motion';
import type { AnimationPreset } from './catalog';

const SETTLE_UP = {
  opacity: [0, 1],
  y: [18, 0],
  scale: [0.96, 1],
};

const SETTLE_UP_TRANSITION = {
  duration: 0.62,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function applyMotionPreset(element: HTMLElement, preset: AnimationPreset): void {
  if (preset.name === 'settle-up') {
    if (preset.trigger === 'load') {
      animate(element, SETTLE_UP, SETTLE_UP_TRANSITION);
      return;
    }

    inView(
      element,
      () => {
        animate(element, SETTLE_UP, SETTLE_UP_TRANSITION);
      },
      { amount: 0.35, once: true },
    );
  }
}