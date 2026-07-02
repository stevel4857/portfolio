const SOFT_NAV_PAGES = new Set([
  '/',
  '/index.html',
  '/about.html',
  '/about',
]);

const BLOG_PAGE = '/blog.html';

export function normalizePath(pathname: string): string {
  if (pathname === '/' || pathname.endsWith('/index.html')) {
    return '/';
  }

  return pathname.replace(/\/$/, '');
}

export function isInternalLink(anchor: HTMLAnchorElement): boolean {
  if (!anchor.href || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }

  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) {
    return false;
  }

  // Section links (e.g. /#work, /#contact) must reach the hash — never soft-nav without it.
  if (url.hash) {
    return false;
  }

  const normalized = normalizePath(url.pathname);
  if (normalized.startsWith('/blog/') || normalized.startsWith('/work/')) {
    return true;
  }

  return /\.html$/.test(url.pathname) || url.pathname === '/';
}

export function scrollToHash(hash?: string, behavior: ScrollBehavior = 'smooth'): void {
  const id = (hash ?? window.location.hash).replace(/^#/, '');
  if (!id) {
    return;
  }

  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior, block: 'start' });
}

export function isSamePageHashLink(anchor: HTMLAnchorElement): boolean {
  const url = new URL(anchor.href, window.location.origin);
  if (!url.hash || url.origin !== window.location.origin) {
    return false;
  }

  return normalizePath(url.pathname) === normalizePath(window.location.pathname);
}

export function initHashNavigation(): void {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement) || !isSamePageHashLink(anchor)) {
      return;
    }

    event.preventDefault();

    const url = new URL(anchor.href, window.location.origin);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    scrollToHash(url.hash, reducedMotion ? 'auto' : 'smooth');
  });
}

export function canSoftNavigate(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return SOFT_NAV_PAGES.has(normalized);
}

export function shouldHardNavigate(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === BLOG_PAGE || normalized.startsWith('/blog/') || normalized.startsWith('/work/');
}

export async function fetchPageContent(url: string): Promise<{
  html: string;
  title: string;
  className: string;
}> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const pageRoot = doc.querySelector('[data-motion-page]') ?? doc.querySelector('main');

  if (!pageRoot) {
    throw new Error(`No motion page root found in ${url}`);
  }

  return {
    html: pageRoot.innerHTML,
    title: doc.title,
    className: pageRoot.getAttribute('class') ?? '',
  };
}

export function reinitializePageScripts(): void {
  window.dispatchEvent(new CustomEvent('motion:page-enter', { bubbles: true }));

  if (typeof (window as Window & { loadAllComponents?: () => void }).loadAllComponents === 'function') {
    (window as Window & { loadAllComponents?: () => void }).loadAllComponents?.();
  }

  if (typeof (window as Window & { init?: () => void }).init === 'function') {
    (window as Window & { init?: () => void }).init?.();
  }
}