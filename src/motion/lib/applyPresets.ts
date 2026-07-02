import { getPreset, type AnimationPreset, type AnimationTrigger } from '../presets/catalog';
import { applyMotionPreset } from '../presets/motion';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolveTrigger(element: HTMLElement, preset: AnimationPreset): AnimationTrigger {
  const override = element.getAttribute('data-animate-trigger') as AnimationTrigger | null;
  return override ?? preset.trigger;
}

function applyCssPreset(element: HTMLElement, preset: AnimationPreset, trigger: AnimationTrigger): void {
  if (!preset.cssClass) {
    return;
  }

  if (trigger === 'hover') {
    element.classList.add('preset-hover-parent');
    const hoverClass = `${preset.cssClass}-on-hover`;
    element.dataset.presetHoverClass = hoverClass;
    return;
  }

  if (trigger === 'scroll') {
    element.classList.add('preset-scroll-reveal', preset.cssClass);
    return;
  }

  element.classList.add(preset.cssClass);
}

function applyPresetToElement(element: HTMLElement): void {
  const name = element.getAttribute('data-animate');
  if (!name) {
    return;
  }

  const preset = getPreset(name);
  if (!preset) {
    console.warn(`Unknown animation preset: "${name}"`);
    return;
  }

  const trigger = resolveTrigger(element, preset);
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    if (trigger === 'loop') {
      return;
    }

    element.classList.add('preset-reduced-instant');
    return;
  }

  if (preset.engine === 'motion') {
    const motionTrigger = trigger === 'scroll' ? 'scroll' : 'load';
    applyMotionPreset(element, { ...preset, trigger: motionTrigger });
    return;
  }

  applyCssPreset(element, preset, trigger);
}

function initScrollRevealObserver(root: ParentNode): void {
  const targets = root.querySelectorAll<HTMLElement>('.preset-scroll-reveal:not(.preset-scroll-reveal--done)');

  if (!targets.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const el = entry.target as HTMLElement;
        el.classList.add('preset-scroll-reveal--done', 'is-visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.25 },
  );

  targets.forEach((target) => observer.observe(target));
}

function initHoverPresets(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.preset-hover-parent').forEach((parent) => {
    const hoverClass = parent.dataset.presetHoverClass;
    if (!hoverClass) {
      return;
    }

    parent.addEventListener('mouseenter', () => parent.classList.add(hoverClass));
    parent.addEventListener('mouseleave', () => parent.classList.remove(hoverClass));
    parent.addEventListener('focusin', () => parent.classList.add(hoverClass));
    parent.addEventListener('focusout', () => parent.classList.remove(hoverClass));
  });
}

/** Scan a DOM subtree and apply [data-animate] presets */
export function applyAnimationPresets(root: ParentNode = document): void {
  const elements = root.querySelectorAll<HTMLElement>('[data-animate]');
  elements.forEach(applyPresetToElement);
  initScrollRevealObserver(root);
  initHoverPresets(root);
}