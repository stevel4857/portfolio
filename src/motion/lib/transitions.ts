import type { Transition, Variants } from 'motion/react';

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const reducedMotionVariants: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

export function getPageTransition(reducedMotion: boolean): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }

  return {
    duration: 0.38,
    ease: [0.22, 1, 0.36, 1],
  };
}