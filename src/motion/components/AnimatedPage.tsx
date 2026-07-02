import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getPageTransition, pageVariants, reducedMotionVariants } from '../lib/transitions';
import { runStaggerReveal } from '../lib/staggerReveal';
import { scrollToHash } from '../lib/navigation';
import { applyAnimationPresets } from '../lib/applyPresets';

type AnimatedPageProps = {
  pageKey: string;
  html: string;
  className?: string;
};

export function AnimatedPage({ pageKey, html, className }: AnimatedPageProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) {
      return;
    }

    runStaggerReveal(pageRef.current, reducedMotion);
    applyAnimationPresets(pageRef.current);

    if (window.location.hash) {
      requestAnimationFrame(() => {
        scrollToHash(undefined, reducedMotion ? 'auto' : 'smooth');
      });
    }
  }, [pageKey, html, reducedMotion]);

  return (
    <motion.div
      key={pageKey}
      ref={pageRef}
      role="main"
      className={className}
      data-motion-page=""
      variants={reducedMotion ? reducedMotionVariants : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={getPageTransition(reducedMotion)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}