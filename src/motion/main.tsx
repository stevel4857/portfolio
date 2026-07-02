import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyAnimationPresets } from './lib/applyPresets';
import { initHashNavigation, normalizePath } from './lib/navigation';

function getInitialPage() {
  const pageRoot = document.querySelector('[data-motion-page]') ?? document.querySelector('main');

  if (!pageRoot) {
    return null;
  }

  return {
    key: normalizePath(window.location.pathname),
    html: pageRoot.innerHTML,
    className: pageRoot.getAttribute('class') ?? '',
    element: pageRoot,
  };
}

function boot() {
  initHashNavigation();

  const initialPage = getInitialPage();
  if (!initialPage) {
    return;
  }

  const mountPoint = document.createElement('div');
  mountPoint.id = 'motion-root';
  initialPage.element.replaceWith(mountPoint);

  createRoot(mountPoint).render(
    <StrictMode>
      <App
        initialPage={{
          key: initialPage.key,
          html: initialPage.html,
          className: initialPage.className,
        }}
      />
    </StrictMode>,
  );

  requestAnimationFrame(() => applyAnimationPresets(document));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}