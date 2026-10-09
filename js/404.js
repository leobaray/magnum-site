// Lógica da página 404. Externo (não inline) para que 404.html possa declarar
// script-src 'self' sem 'unsafe-inline', igual às outras 11 páginas.
// Carregado no <head> sem defer de propósito: o redirect de caminho legado precisa
// disparar antes de a página pintar, senão o visitante vê um 404 que some sozinho.

// Mapa de caminhos legado -> seções do SPA
var sectionMap = {
  'inicio': 'inicio', 'home': 'inicio', 'index': 'inicio',
  'sobre': 'sobre', 'about': 'sobre', 'empresa': 'sobre', 'quem-somos': 'sobre',
  'servicos': 'servicos', 'services': 'servicos', 'retifica': 'servicos', 'conversor': 'servicos', 'conversores': 'servicos',
  'pecas': 'pecas', 'parts': 'pecas', 'produtos': 'pecas',
  'parceiros': 'parceiros', 'partners': 'parceiros', 'marcas': 'parceiros',
  'depoimentos': 'depoimentos', 'testimonials': 'depoimentos', 'avaliacoes': 'depoimentos',
  'faq': 'faq', 'duvidas': 'faq', 'perguntas': 'faq',
  'contato': 'contato', 'contact': 'contato', 'orcamento': 'contato', 'fale-conosco': 'contato'
};

(function () {
  try {
    var path = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    var firstSeg = path.split('/')[0];
    var target = sectionMap[firstSeg];
    var url = target ? ('/#' + target) : '/';
    // Redireciona imediatamente se houver match ou o path for vazio
    if (target) {
      location.replace(url);
      return;
    }
    // Caso contrário, mostra página 404 e agenda redirect
    window.__redirectUrl = url;
  } catch (e) { window.__redirectUrl = '/'; }
})();

// Contador regressivo. Espera o DOM porque este arquivo roda no <head>.
(function () {
  function start() {
    var secs = 20;
    var secsEl = document.getElementById('secs');
    var target = window.__redirectUrl || '/';
    var btn = document.getElementById('home-btn');
    if (!btn) return;
    btn.setAttribute('href', target);
    var id = setInterval(function () {
      secs--;
      if (secsEl) secsEl.textContent = secs;
      if (secs <= 0) { clearInterval(id); location.replace(target); }
    }, 1000);
    // Cancela o auto-redirect se o usuário interagir (foco, clique, tecla).
    function cancel() {
      clearInterval(id);
      var cd = document.getElementById('countdown');
      if (cd) cd.hidden = true;
    }
    ['keydown', 'pointerdown', 'focusin'].forEach(function (ev) {
      document.addEventListener(ev, cancel, { once: true, passive: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
