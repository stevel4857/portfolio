import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence } from 'motion/react';
import { AnimatedPage } from './AnimatedPage';
import {
  canSoftNavigate,
  fetchPageContent,
  isInternalLink,
  normalizePath,
  reinitializePageScripts,
  shouldHardNavigate,
} from '../lib/navigation';

type PageState = {
  key: string;
  html: string;
  className: string;
  title?: string;
  href?: string;
};

type PageTransitionContextValue = {
  navigate: (url: string, options?: { replace?: boolean }) => void;
  isTransitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function usePageTransition(): PageTransitionContextValue {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }

  return context;
}

type PageTransitionProviderProps = {
  initialPage: PageState;
  children?: ReactNode;
};

export function PageTransitionProvider({ initialPage, children }: PageTransitionProviderProps) {
  const [page, setPage] = useState<PageState>(initialPage);
  const [visible, setVisible] = useState(true);
  const [queuedPage, setQueuedPage] = useState<PageState | null>(null);
  const [pendingHardNavigation, setPendingHardNavigation] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleExitComplete = useCallback(() => {
    if (pendingHardNavigation) {
      window.location.assign(pendingHardNavigation);
      return;
    }

    if (!queuedPage) {
      setIsTransitioning(false);
      return;
    }

    if (queuedPage.title) {
      document.title = queuedPage.title;
    }

    setPage({
      key: queuedPage.key,
      html: queuedPage.html,
      className: queuedPage.className,
    });
    setQueuedPage(null);
    setVisible(true);
    setIsTransitioning(false);

    if (queuedPage.href) {
      window.history.pushState({}, '', queuedPage.href);
    }

    reinitializePageScripts();
  }, [pendingHardNavigation, queuedPage]);

  const navigate = useCallback(async (url: string) => {
    const target = new URL(url, window.location.origin);
    const targetPath = normalizePath(target.pathname);

    setIsTransitioning(true);

    if (shouldHardNavigate(targetPath) || !canSoftNavigate(targetPath)) {
      setPendingHardNavigation(target.href);
      setVisible(false);
      return;
    }

    try {
      const nextPage = await fetchPageContent(target.href);
      setQueuedPage({
        key: targetPath,
        html: nextPage.html,
        className: nextPage.className,
        title: nextPage.title,
        href: target.href,
      });
      setVisible(false);
    } catch {
      window.location.assign(target.href);
    }
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement) || !isInternalLink(anchor)) {
        return;
      }

      event.preventDefault();
      void navigate(anchor.href);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname);
      if (shouldHardNavigate(path)) {
        window.location.reload();
        return;
      }

      setIsTransitioning(true);
      fetchPageContent(window.location.href)
        .then((nextPage) => {
          setQueuedPage({
            key: path,
            html: nextPage.html,
            className: nextPage.className,
            title: nextPage.title,
            href: window.location.href,
          });
          setVisible(false);
        })
        .catch(() => {
          window.location.reload();
        });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const contextValue = useMemo(
    () => ({
      navigate,
      isTransitioning,
    }),
    [navigate, isTransitioning],
  );

  return (
    <PageTransitionContext.Provider value={contextValue}>
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {visible ? (
          <AnimatedPage
            pageKey={page.key}
            html={page.html}
            className={page.className}
          />
        ) : null}
      </AnimatePresence>
      {children}
    </PageTransitionContext.Provider>
  );
}