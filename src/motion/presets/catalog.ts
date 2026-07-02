export type AnimationTrigger = 'load' | 'scroll' | 'hover' | 'loop';
export type AnimationEngine = 'css' | 'motion';

export interface AnimationPreset {
  name: string;
  description: string;
  engine: AnimationEngine;
  trigger: AnimationTrigger;
  cssClass?: string;
  /** Plain-language Lottie equivalent for animation requests */
  lottieLike: string;
}

/**
 * Named animation presets — request by name in chat, e.g. "add float-gentle to the hero badge".
 * Preview all presets at /demos/animations.html
 */
export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  'settle-up': {
    name: 'settle-up',
    description: 'Pop in from below with a soft scale settle',
    engine: 'motion',
    trigger: 'scroll',
    lottieLike: 'Lottie fade-up / bounce-out entrance',
  },
  'float-gentle': {
    name: 'float-gentle',
    description: 'Slow vertical float with a subtle breathe',
    engine: 'css',
    trigger: 'loop',
    cssClass: 'animate-float-gentle',
    lottieLike: 'Lottie idle float / levitation loop',
  },
  'pulse-ring': {
    name: 'pulse-ring',
    description: 'Expanding ring ripple from center',
    engine: 'css',
    trigger: 'loop',
    cssClass: 'preset-pulse-ring',
    lottieLike: 'Lottie radar ping / notification ripple',
  },
  'draw-line': {
    name: 'draw-line',
    description: 'SVG stroke reveal along a path',
    engine: 'css',
    trigger: 'scroll',
    cssClass: 'preset-draw-line',
    lottieLike: 'Lottie stroke draw-on / signature reveal',
  },
  'shimmer': {
    name: 'shimmer',
    description: 'Gradient light sweep across a surface',
    engine: 'css',
    trigger: 'loop',
    cssClass: 'preset-shimmer',
    lottieLike: 'Lottie skeleton shimmer / loading sheen',
  },
  'morph-blob': {
    name: 'morph-blob',
    description: 'Organic border-radius morph loop',
    engine: 'css',
    trigger: 'loop',
    cssClass: 'animate-morph-blob',
    lottieLike: 'Lottie blob morph / liquid shape loop',
  },
};

export const PRESET_NAMES = Object.keys(ANIMATION_PRESETS);

export function getPreset(name: string): AnimationPreset | undefined {
  return ANIMATION_PRESETS[name];
}