import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook que força o scroll para o topo quando a página é carregada ou recarregada
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Força scroll para o topo imediatamente
    window.scrollTo(0, 0);
    
    // Também força após um pequeno delay para garantir que funcione
    // mesmo com componentes que carregam de forma assíncrona
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location]); // Executa sempre que a rota muda

  // Também força no carregamento inicial da página
  useEffect(() => {
    // Remove o comportamento padrão de restaurar posição do scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Força scroll para o topo no carregamento
    window.scrollTo(0, 0);
  }, []);
}