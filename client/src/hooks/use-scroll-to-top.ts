import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook que força o scroll para o topo quando a rota muda.
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location]);
}
