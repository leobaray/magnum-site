// ===== Footer year =====
const _yearEl = document.getElementById('year');
if (_yearEl) _yearEl.textContent = new Date().getFullYear();

// ===== Cookie consent banner (LGPD + Google Consent Mode v2) =====
(function () {
  let stored = null;
  try { stored = localStorage.getItem('mg_consent'); } catch (_) {}

  // Revogação de consentimento (botão na Política de Privacidade)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-revoke-consent]');
    if (!b) return;
    try { localStorage.removeItem('mg_consent'); } catch (_) {}
    // Faz a revogação valer JÁ neste documento, não só depois do reload.
    window.mgConsent = 'unset';
    if (typeof window.gtag === 'function') {
      try { window.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (_) {}
    }
    window.location.reload();
  });

  if (stored === 'granted' || stored === 'denied') return;

  function persist(value) {
    try { localStorage.setItem('mg_consent', value); } catch (_) {}
    if (value === 'granted') {
      // Liga o GA4 agora: consent update + config, e é o config que emite o
      // page_view desta página — a landing de quem acabou de aceitar.
      if (typeof window.mgStartAnalytics === 'function') window.mgStartAnalytics();
      else window.mgConsent = 'granted';
    } else {
      window.mgConsent = 'denied';
      if (typeof window.gtag === 'function') {
        try { window.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (_) {}
      }
    }
  }

  function mount() {
    if (document.getElementById('cookie-consent')) return;
    const banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.setAttribute('aria-describedby', 'cookie-consent-desc');
    banner.innerHTML = `
      <div class="cookie-consent__inner">
        <div class="cookie-consent__text">
          <p id="cookie-consent-title" class="cookie-consent__title">Cookies e privacidade</p>
          <p id="cookie-consent-desc" class="cookie-consent__desc">Usamos cookies de medição (Google Analytics) para entender como você usa o site. Você pode aceitar ou recusar. Cookies essenciais sempre ficam ativos. Detalhes na <a href="/privacidade/">Política de Privacidade</a>.</p>
        </div>
        <div class="cookie-consent__actions">
          <button type="button" class="btn btn-ghost btn-sm" data-consent="denied">Recusar</button>
          <button type="button" class="btn btn-primary btn-sm" data-consent="granted">Aceitar</button>
        </div>
      </div>
    `;
    // No início do body (logo após o skip link) para leitores de tela encontrarem cedo
    document.body.insertBefore(banner, document.body.children[1]);
    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
      // O banner é chão dos botões flutuantes: recalcula agora que ele existe
      // e já está na posição final (o translateY(20px) inicial mede errado).
      if (typeof window.__mgUpdateFloatFloor === 'function') window.__mgUpdateFloatFloor();
    });

    banner.querySelectorAll('[data-consent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.consent;
        persist(value);
        banner.classList.remove('is-visible');
        // O botão que acabou de ser clicado vai sumir do DOM: devolve o foco a um
        // elemento estável, senão o teclado volta pro início do documento em silêncio.
        try { document.querySelector('.skip-link')?.focus({ preventScroll: true }); } catch (_) {}
        setTimeout(() => {
          banner.remove();
          if (typeof window.__mgUpdateFloatFloor === 'function') window.__mgUpdateFloatFloor();
        }, 250);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();

// ===== Indicador de horário de funcionamento (Seg-Sex 8h-18h, America/Sao_Paulo) =====
(function () {
  const el = document.querySelector('[data-business-hours]');
  if (!el) return;
  const dot = el.querySelector('.dot');
  const text = el.querySelector('.hours-text');
  // Sem este guard, um .hours-text ausente joga um TypeError aqui — e como este é
  // o 2º IIFE do arquivo, isso derrubaria TODO o resto do main.js (menu, form,
  // carrossel, botões flutuantes). O bloco é duplicado à mão em 11 HTMLs.
  if (!text) return;
  const weekdayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  function partsInBrazil() {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const wd = parts.find(p => p.type === 'weekday').value.toLowerCase();
    const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
    const dayIdx = ['sun','mon','tue','wed','thu','fri','sat'].indexOf(wd);
    return { dayIdx, h, m };
  }

  function update() {
    const { dayIdx, h, m } = partsInBrazil();
    const minutes = h * 60 + m;
    const isWeekday = dayIdx >= 1 && dayIdx <= 5;
    const isOpen = isWeekday && minutes >= 8 * 60 && minutes < 18 * 60;

    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);

    if (isOpen) {
      text.textContent = 'Aberto agora · fecha às 18h';
    } else {
      let nextDay = dayIdx;
      if (dayIdx === 0) nextDay = 1;           // dom -> seg
      else if (dayIdx === 6) nextDay = 1;      // sáb -> seg
      else if (dayIdx >= 1 && dayIdx <= 5 && minutes < 8 * 60) nextDay = dayIdx; // mesmo dia cedo
      else if (dayIdx === 5 && minutes >= 18 * 60) nextDay = 1; // sex noite -> seg
      else nextDay = dayIdx + 1;
      const dayLabel = (nextDay === dayIdx) ? 'hoje' : weekdayNames[nextDay];
      text.textContent = `Fechado · abre ${dayLabel} às 8h`;
    }
  }

  let intervalId = null;
  function start() { if (intervalId == null) intervalId = setInterval(update, 60 * 1000); }
  function stop()  { if (intervalId != null) { clearInterval(intervalId); intervalId = null; } }
  update();
  start();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { update(); start(); }
  });
})();

// ===== GA4 event helper =====
function trackEvent(name, params) {
  // Gate de consentimento. Sem aceite explícito nada é enviado ao Google — nem o
  // ping sem cookie do Consent Mode, que ainda carrega URL, referrer, dispositivo
  // e todos os parâmetros do evento. É o que privacidade/index.html promete.
  if (window.mgConsent !== 'granted') return;
  if (typeof window.gtag === 'function') {
    try { window.gtag('event', name, params || {}); } catch (_) {}
  }
}

// ===== Conversion tracking: cliques em WhatsApp, telefone, e-mail =====
(function () {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const section = a.closest('[id]')?.id || 'unknown';
    if (/^https?:\/\/wa\.me\//i.test(href) || /api\.whatsapp\.com/i.test(href)) {
      trackEvent('click_whatsapp', { link_url: href, location: a.classList.contains('wa-float') ? 'floating' : section });
    } else if (/^tel:/i.test(href)) {
      trackEvent('click_phone', { link_url: href, location: section });
    } else if (/^mailto:/i.test(href)) {
      trackEvent('click_email', { link_url: href, location: section });
    }
  }, { passive: true });
})();

// ===== Hash-on-load: corrige offset do header fixo ao chegar via /#secao =====
(function () {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch (_) { id = hash.slice(1); }
  // Espera o layout estabilizar antes de reposicionar
  window.addEventListener('load', () => {
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      // Temporariamente desliga scroll-behavior:smooth para reposicionar sem animação.
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, top);
      root.style.scrollBehavior = prev;
    });
  });
})();

// ===== Icons (only the ones actually swapped by JS) =====
const iconMenu = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
const iconX = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

// ===== Scroll =====
// O CSS já força scroll-behavior:auto sob prefers-reduced-motion, mas window.scrollTo
// com behavior:'smooth' ignora o CSS e anima assim mesmo. Os dois precisam concordar.
const _reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
function scrollBehavior() { return _reduceMotionMQ.matches ? 'auto' : 'smooth'; }

function scrollToSection(id, offset = 80) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: scrollBehavior() });
}

// ===== Header =====
(function () {
  const header = document.querySelector('.header');
  if (!header) return;

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const logoLink = document.getElementById('logo-link');
  const navLinks = document.querySelectorAll('.nav-desktop a[data-section], .nav-mobile a[data-section]');
  const allSectionLinks = document.querySelectorAll('a[data-section]');
  // Ordem do DOM, e cada id aqui precisa ter link correspondente no menu:
  // ativar um id sem link apagaria o estado ativo da barra em vez de movê-lo.
  const sectionIds = ['inicio', 'sobre', 'servicos', 'parceiros', 'pecas', 'depoimentos', 'faq', 'contato'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const isBlogPage = document.body.classList.contains('blog-page');

  // Mesma lista que o modal usa mais abaixo.
  const NAV_FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])';

  // Com a gaveta aberta, o Tab saía dela e ia parar num controle 100% coberto pelo
  // painel — e como body.nav-open trava o scroll, não havia como chegar até ele.
  // Foco invisível e página que rola sozinha por baixo: WCAG 2.4.11.
  function trapNav(e) {
    if (e.key !== 'Tab' || !mobileNav.classList.contains('open')) return;
    const items = [hamburger, ...mobileNav.querySelectorAll(NAV_FOCUSABLE)]
      .filter(el => el.offsetParent !== null || el === hamburger);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!mobileNav.contains(document.activeElement) && document.activeElement !== hamburger) {
      // Já escapou (foco veio de fora do ciclo): traz de volta em vez de deixar ir.
      e.preventDefault(); first.focus();
    }
  }

  function setMobileOpen(open) {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    hamburger.innerHTML = open ? iconX : iconMenu;
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    // inert tira o resto da página do foco E do cursor virtual do leitor de tela.
    // Onde não houver suporte, o trapNav acima já resolve o teclado sozinho.
    ['main', '.footer', '.wa-float', '.back-to-top'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el && 'inert' in el) el.inert = open;
    });
    if (open) document.addEventListener('keydown', trapNav, true);
    else document.removeEventListener('keydown', trapNav, true);
  }
  function closeMobile() {
    if (mobileNav && mobileNav.classList.contains('open')) setMobileOpen(false);
  }
  if (mobileNav && hamburger) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobile();
        hamburger.focus();
      }
    });
    hamburger.addEventListener('click', () => {
      setMobileOpen(!mobileNav.classList.contains('open'));
    });

    // Fecha a gaveta ao cruzar o breakpoint do nav. Sem isto, abrir a gaveta e
    // girar um tablet (768 retrato -> 1024 paisagem), redimensionar a janela ou
    // só mudar o tamanho de fonte do navegador deixava a página INTEIRA inerte:
    // main, footer e os dois flutuantes seguiam com inert, body.nav-open seguia
    // travando o scroll, e o hambúrguer já estava display:none — zero elementos
    // focáveis e nada clicável, com a página ainda rolando (parecia viva).
    // O breakpoint é em em justamente para acompanhar a preferência de fonte,
    // então esse cruzamento não é um caso raro. addListener é o fallback para
    // Safari <= 13, mesmo padrão que o carrossel já usa.
    const navMQ = window.matchMedia('(min-width:55em)');
    const onNavMQ = (e) => { if (e.matches) closeMobile(); };
    if (typeof navMQ.addEventListener === 'function') navMQ.addEventListener('change', onNavMQ);
    else if (typeof navMQ.addListener === 'function') navMQ.addListener(onNavMQ);
  }

  // Header shadow on scroll (em paginas de blog fica sempre com sombra)
  function updateHeaderShadow() {
    header.classList.toggle('scrolled', isBlogPage || window.scrollY > 10);
  }
  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });

  // Em paginas de blog, scrollspy fica desabilitado (posts podem ter secoes
  // com id colidindo com o menu, ex: id="faq"). So marca o item "Blog" ativo.
  if (isBlogPage) {
    document.querySelectorAll('.nav-desktop a[href="/blog/"], .nav-mobile a[href="/blog/"]').forEach(a => {
      a.classList.add('active');
      a.setAttribute('aria-current', 'true');
    });
  } else if (sections.length > 0) {
    function updateActive() {
      const headerH = header.offsetHeight || 80;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const scrollBottom = window.scrollY + viewportH;
      if (scrollBottom >= docH - 4) {
        setActive(sectionIds[sectionIds.length - 1]);
        return;
      }
      let bestId = sectionIds[0];
      let bestVisible = -1;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        const top = Math.max(rect.top, headerH);
        const bottom = Math.min(rect.bottom, viewportH);
        const visible = Math.max(0, bottom - top);
        if (visible > bestVisible) { bestVisible = visible; bestId = el.id; }
      }
      setActive(bestId);
    }
    function setActive(id) {
      navLinks.forEach(link => {
        const isActive = link.dataset.section === id;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { updateActive(); ticking = false; });
      }
    }, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    window.addEventListener('load', updateActive);
    updateActive();
  }

  // Logo click: so intercepta se tem a secao #inicio na pagina; senao deixa navegar normal
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      const inicio = document.getElementById('inicio');
      if (inicio) { e.preventDefault(); closeMobile(); scrollToSection('inicio'); }
      else { closeMobile(); }
    });
  }

  // Links de secao: so intercepta se a secao existe na pagina atual; senao deixa navegar
  allSectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.dataset.section;
      const href = link.getAttribute('href') || '';
      // Se href e caminho absoluto (/#xxx), deixa navegar pro home
      if (href.startsWith('/') && !href.startsWith('/#')) return;
      const targetEl = targetId ? document.getElementById(targetId) : null;
      if (!targetEl) return;
      e.preventDefault();
      // closeMobile() ANTES de medir. A gaveta vive dentro do <header> sticky, então
      // aberta ela empurra o documento inteiro pra baixo (~577px em 390px de largura).
      // Medir antes de fechar fazia todo link da gaveta parar uma seção adiante —
      // tocar "Contato" deixava o formulário abaixo da dobra.
      closeMobile();
      scrollToSection(targetId);
    });
  });
})();

// ===== Testimonials Carousel =====
(function () {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const pauseBtn = document.getElementById('carousel-pause');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
  const wrapper = track.closest('.carousel-wrapper');

  const cards = track.children;
  const total = cards.length;
  // cards[0].offsetWidth mais abaixo joga TypeError com a track vazia, e isso
  // derrubaria o formulário, o back-to-top e os botões flutuantes junto.
  if (!total) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTOPLAY_MS = 6000;

  let current = 0;
  let perView = getPerView();
  let timer = null;
  let userPaused = false; // pausa explícita do usuário: nada reinicia o autoplay

  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }
  function maxIdx() { return Math.max(0, total - perView); }

  // Lê o gap real do CSS (1.5rem) em vez de assumir 24px. Com root font aumentado
  // — zoom, "Fonte muito grande" do Chrome — o valor fixo acumulava erro por slide
  // e cortava o texto do último depoimento.
  function currentGap() {
    const cs = getComputedStyle(track);
    const g = parseFloat(cs.columnGap || cs.gap);
    return Number.isFinite(g) ? g : 24;
  }

  function update() {
    const gap = currentGap();
    track.style.transform = `translateX(-${current * (cards[0].offsetWidth + gap)}px)`;
    Array.from(dotsContainer.children).forEach((d, i) => {
      const active = i === current;
      d.classList.toggle('active', active);
      d.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function go(idx) {
    const max = maxIdx();
    current = idx < 0 ? max : idx > max ? 0 : idx;
    update();
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ver depoimento ${i + 1}`);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
      dotsContainer.appendChild(dot);
    }
  }

  function startAuto() {
    if (userPaused) return; // guarda central: cobre mouseleave, focusout, IO, etc.
    if (reduceMotion.matches) return;
    if (maxIdx() === 0) return;
    stopAuto();
    timer = setInterval(() => go(current + 1), AUTOPLAY_MS);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  prevBtn.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });

  // Botão pausar/retomar rotação automática
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      // aria-pressed é a única fonte de verdade: o CSS troca os ícones a partir dele.
      // O atributo `hidden` não funciona em <svg> (não é HTMLElement), então os dois
      // ícones apareciam ao mesmo tempo e nunca trocavam.
      pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', userPaused ? 'Retomar rotação automática' : 'Pausar rotação automática');
      if (userPaused) stopAuto();
      else startAuto();
    });
  }

  // Pausa em hover/focus
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);
    wrapper.addEventListener('focusin', stopAuto);
    wrapper.addEventListener('focusout', startAuto);
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); go(current - 1); startAuto(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); go(current + 1); startAuto(); }
    });
  }

  // Touch swipe. Precisa dos dois eixos: sem comparar dx com dy, rolar a página
  // verticalmente por cima do carrossel trocava de slide sem querer. E com dois
  // dedos (pinch pra dar zoom no texto) changedTouches[0] é um dedo arbitrário.
  let startX = 0, startY = 0, multiTouch = false;
  track.addEventListener('touchstart', (e) => {
    stopAuto();
    if (e.touches.length > 1) { multiTouch = true; return; }
    multiTouch = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (!multiTouch && t) {
      const dx = startX - t.clientX;
      const dy = startY - t.clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) go(current + 1);
        else go(current - 1);
      }
    }
    multiTouch = false;
    startAuto();
  }, { passive: true });
  track.addEventListener('touchcancel', () => { multiTouch = false; startAuto(); }, { passive: true });

  window.addEventListener('resize', () => {
    perView = getPerView();
    if (current > maxIdx()) current = maxIdx();
    buildDots();
    update();
  });

  // MediaQueryList só ganhou addEventListener no Safari 14. Chamar direto joga
  // TypeError no Safari <= 13.7 — e como este arquivo é um script clássico plano,
  // esse throw levava junto o formulário de contato, o back-to-top, os botões
  // flutuantes e o modal, que vêm todos depois no arquivo.
  const onReduceMotionChange = () => { reduceMotion.matches ? stopAuto() : startAuto(); };
  if (typeof reduceMotion.addEventListener === 'function') reduceMotion.addEventListener('change', onReduceMotionChange);
  else if (typeof reduceMotion.addListener === 'function') reduceMotion.addListener(onReduceMotionChange);

  // Pausa quando não visível (economiza bateria)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? startAuto() : stopAuto();
    }, { threshold: 0.2 }).observe(track);
  } else {
    startAuto();
  }

  buildDots();
  update();
})();

// ===== Contact Form =====
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const honeypot = form.querySelector('#hp-field');

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add(`is-${type}`);
  }

  // Variante para o estado de repasse: os canais de recuperação viram links de
  // verdade. Num celular, "ligue para (41) 3503-6828" como texto puro obriga a
  // pessoa a decorar e digitar — e essa é justamente a saída de quem o WhatsApp
  // não abriu. Monta por DOM (sem innerHTML) para não abrir superfície de HTML.
  function setStatusWithChannels(before, after) {
    if (!status) return;
    status.textContent = '';
    status.classList.remove('is-success', 'is-error');
    const tel = document.createElement('a');
    tel.href = 'tel:+554135036828';
    tel.textContent = '(41) 3503-6828';
    const mail = document.createElement('a');
    mail.href = 'mailto:contato@magnumtorque.com.br';
    mail.textContent = 'contato@magnumtorque.com.br';
    status.append(before, tel, ' ou escreva para ', mail, after);
  }

  function markInvalid(field, invalid) {
    field.closest('.form-group').classList.toggle('has-error', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  // Trava de reentrada. Um duplo clique no enviar abria o WhatsApp DUAS vezes e
  // contava generate_lead duas vezes — e o generate_lead é justamente a métrica
  // que o PRODUCT.md diz que reabriria a discussão do handler server-side, então
  // inflá-la corrompe uma decisão de produto, não só um número.
  let sending = false;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sending) return;

    // Honeypot: se preenchido, provavelmente bot. Silenciosamente aborta.
    if (honeypot && honeypot.value) { form.reset(); return; }

    const name = form.querySelector('#name');
    const phone = form.querySelector('#phone');
    const email = form.querySelector('#email');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');
    let valid = true;
    let firstInvalid = null;

    const phoneDigits = phone.value.replace(/\D/g, '');
    const emailVal = email.value.trim();

    const checks = [
      [name, name.value.trim().length >= 3],
      // Teto 11, não 13: a máscara normaliza pra no máximo 11 dígitos, então 12-13
      // era faixa morta que só servia pra deixar passar número truncado.
      [phone, phoneDigits.length >= 10 && phoneDigits.length <= 11],
      [email, emailVal === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)],
      [subject, !!subject.value],
      [message, message.value.trim().length >= 10],
    ];
    for (const [field, ok] of checks) {
      markInvalid(field, !ok);
      if (!ok) { valid = false; firstInvalid = firstInvalid || field; }
    }

    if (!valid) {
      setStatus('Revise os campos destacados antes de enviar.', 'error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const labels = { orcamento: 'Orçamento', duvida: 'Dúvida Técnica', agendamento: 'Agendamento', outro: 'Outro' };
    const contactLines = [name.value.trim(), `Tel: ${phone.value.trim()}`];
    if (emailVal) contactLines.push(emailVal);
    const text = `${labels[subject.value] || subject.value}\n\n${message.value.trim()}\n\n${contactLines.join('\n')}`;
    const waUrl = `https://wa.me/554135036828?text=${encodeURIComponent(text)}`;

    trackEvent('generate_lead', {
      form_id: 'contact-form',
      subject: subject.value,
      has_email: emailVal ? 'yes' : 'no'
    });
    trackEvent('form_submit', { form_id: 'contact-form' });

    sending = true;
    setTimeout(() => { sending = false; }, 1500);
    setStatus('Abrindo o WhatsApp com sua mensagem...', null);
    // 'noopener' na string de features faz window.open retornar sempre null (spec),
    // o que dispararia o fallback junto com o popup (WhatsApp aberto 2x).
    // Isola o opener manualmente para manter a detecção de popup bloqueado.
    const opened = window.open(waUrl, '_blank');
    if (!opened) { window.location.href = waUrl; return; }
    try { opened.opener = null; } catch (_) {}

    // NÃO diz "enviado" e NÃO é verde de sucesso: o wa.me abre o WhatsApp com o
    // texto pronto, mas quem envia é a pessoa. Antes isto dizia "Abrindo
    // WhatsApp..." em verde de sucesso, limpava o formulário e apagava o status
    // em 4s — três afirmações de que deu certo para algo que ainda não aconteceu,
    // e no desktop sem WhatsApp Web não acontece nunca.
    setStatusWithChannels(
      'Abrimos o WhatsApp com sua mensagem pronta — confira e toque em enviar por lá. Não abriu? Ligue para ',
      '.'
    );

    // form.reset() removido de propósito: o texto digitado é o ÚNICO artefato que
    // sobra se o repasse falhar. Limpar aqui destruía o trabalho da pessoa no
    // momento de menor certeza. Só o estado de erro é limpo.
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    form.querySelectorAll('[aria-invalid]').forEach(f => f.setAttribute('aria-invalid', 'false'));
  });

  // Limpa o erro ao digitar novamente
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.closest('.form-group')?.classList.contains('has-error')) {
        markInvalid(field, false);
      }
      // E some com o aviso vermelho quando NÃO sobrou mais nenhum campo com erro.
      // Antes, "Revise os campos destacados antes de enviar." continuava lá em
      // vermelho mesmo depois de a pessoa corrigir os quatro — o aviso apontava
      // para destaques que já não existiam.
      if (status && status.classList.contains('is-error') && !form.querySelector('.form-group.has-error')) {
        setStatus('', null);
      }
    });
  });

  // Máscara leve de telefone (BR)
  const phoneField = form.querySelector('#phone');
  if (phoneField) {
    phoneField.addEventListener('input', () => {
      let raw = phoneField.value.replace(/\D/g, '');

      // Normaliza em vez de cortar. O .slice(0,11) cego transformava um número
      // colado com +55 ou com 0 na frente em OUTRO número — que passava na
      // validação e ia pro WhatsApp errado, sem nenhum aviso.
      // As duas normalizações são travadas em length > 11: DDD 55 (Santa Maria)
      // com celular de 9 dígitos dá exatamente 11 e nunca é tocado.
      if (raw.length > 11 && raw.slice(0, 2) === '55') raw = raw.slice(2);
      if (raw.length > 11 && raw[0] === '0') raw = raw.slice(1);
      // Ainda longo demais: deixa o texto do usuário intacto e sai. A validação
      // rejeita com erro visível em vez de descartar dígitos em silêncio.
      if (raw.length > 11) return;

      const d = raw;
      if (d.length === 0) { phoneField.value = ''; return; }

      let out = '';
      if (d.length < 3)       out = `(${d}`;
      else if (d.length <= 6) out = `(${d.slice(0,2)}) ${d.slice(2)}`;
      else if (d.length <= 10)out = `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
      else                    out = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;

      if (out === phoneField.value) return; // não mexe no caret à toa (IME/autofill)

      // Preserva o caret contando DÍGITOS, não caracteres: os separadores mudam de
      // posição conforme a contagem, então reescrever o valor jogava o cursor pro
      // fim a cada edição no meio do campo.
      const isActive = phoneField === document.activeElement;
      const pos = isActive ? phoneField.selectionStart : null;
      const digitsBefore = isActive
        ? phoneField.value.slice(0, pos).replace(/\D/g, '').length
        : 0;

      phoneField.value = out;

      if (isActive) {
        let seen = 0, idx = out.length;
        for (let i = 0; i < out.length; i++) {
          if (/\d/.test(out[i])) {
            seen++;
            if (seen === digitsBefore) { idx = i + 1; break; }
          }
        }
        if (digitsBefore === 0) idx = out.length;
        try { phoneField.setSelectionRange(idx, idx); } catch (_) {}
      }
    });
  }
})();

// ===== Back to Top =====
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
  btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: scrollBehavior() }); });
})();

// ===== Botões flutuantes: param no footer, saem da frente do banner, e nunca deixam a tela =====
(function () {
  try {
    const footer = document.querySelector('.footer');
    const root = document.documentElement;
    let ticking = false;
    let headerH = 0;

    function measureHeader() {
      const h = document.querySelector('.header');
      headerH = h ? h.offsetHeight : 0;
      // Altura só da BARRA (o .container), sem a gaveta mobile — que vive dentro do
      // mesmo <header> e, aberta, dobraria esse número. O CSS usa isto para limitar
      // a altura da gaveta a "o que sobra da tela", com fallback de 4.5rem.
      const bar = h && h.querySelector('.container');
      if (bar) root.style.setProperty('--header-bar-h', bar.offsetHeight + 'px');
    }

    function update() {
      // 1) Quanto do footer já entrou na viewport = quanto os botões precisam subir.
      const footerOverlap = footer
        ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top)
        : 0;

      // 2) O banner de cookie também é chão: ele ocupa a base da tela e cobriria
      //    o botão do WhatsApp — que é o único controle de conversão do site.
      //    Sem este termo o contrato do --float-floor era falso (só via o footer).
      const banner = document.getElementById('cookie-consent');
      const bannerOverlap = banner
        ? Math.max(0, window.innerHeight - banner.getBoundingClientRect().top) + 12
        : 0;

      // 3) Teto — dimensionado pelo WHATSAPP, não pelo par.
      //    Os dois botões compartilham --float-floor, e o voltar-ao-topo fica 5.5rem
      //    acima. Um teto que garantisse os DOIS abaixo do cabeçalho (innerHeight -
      //    headerH - 140) limitava o WhatsApp a menos do que ele precisa para subir
      //    do banner: em 812x375 o banner pede 204px e esse teto dava 163, deixando
      //    5px do botão cobertos. Priorizar o par sobre o WhatsApp é a prioridade
      //    invertida — o WhatsApp É o trabalho da página, o voltar-ao-topo é
      //    conveniência. Então o teto passa a ser o do WhatsApp sozinho...
      const WA_H = 52, BTT_H = 44, BASE = 24, BTT_OFFSET = 88, GAP = 8;
      const cap = Math.max(0, window.innerHeight - headerH - WA_H - BASE - GAP);

      const floor = Math.min(Math.max(footerOverlap, bannerOverlap), cap);
      root.style.setProperty('--float-floor', floor + 'px');

      // ...e quando esse chão empurra o voltar-ao-topo para debaixo do cabeçalho
      // (onde o toque acertaria o hambúrguer), ele se esconde em vez de ficar lá
      // atrás fingindo que é clicável. É o único dos dois que pode sair de cena.
      const bttTop = window.innerHeight - (BTT_OFFSET + floor) - BTT_H;
      root.classList.toggle('btt-no-room', bttTop < headerH + GAP);
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { update(); ticking = false; });
      }
    }, { passive: true });
    window.addEventListener('resize', () => { measureHeader(); update(); }, { passive: true });

    // O banner monta/desmonta depois deste IIFE. Sem este gancho, update() nunca
    // roda nos dois únicos momentos em que o chão realmente muda.
    window.__mgUpdateFloatFloor = update;

    measureHeader();
    update();
  } catch (e) { console.error('[float-floor]', e); }
})();

// ===== Mapa sob demanda (fachada de clique-para-carregar) =====
(function () {
  try {
    const facade = document.getElementById('map-facade');
    if (!facade) return;
    facade.addEventListener('click', () => {
      const src = facade.dataset.mapSrc;
      if (!src) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Mapa Magnum Torque - Rua Irmã Maria Lucia Roland, 403 - Hauer, Curitiba-PR';
      iframe.width = '600';
      iframe.height = '220';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      facade.replaceWith(iframe);
      // O clique veio de um botão que acabou de sair do DOM: manda o foco para o
      // mapa, senão ele volta pro início do documento em silêncio.
      iframe.setAttribute('tabindex', '0');
      try { iframe.focus({ preventScroll: true }); } catch (_) {}
    }, { once: true });
  } catch (e) { console.error('[map-facade]', e); }
})();

// ===== Modal =====
(function () {
  const overlay = document.getElementById('modal-overlay');
  const openBtn = document.getElementById('open-modal');
  if (!overlay || !openBtn) return;
  const modal = overlay.querySelector('.modal');
  const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])';
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
    const first = modal.querySelector(FOCUSABLE);
    if (first) first.focus();
  }
  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  function trap(e) {
    if (e.key !== 'Tab') return;
    const items = modal.querySelectorAll(FOCUSABLE);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  openBtn.addEventListener('click', open);
  overlay.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', close));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else trap(e);
  });
})();

// ===== Motion de chegada: a marca vermelha sendo aplicada =====
// Quarto contrato JS↔CSS deste arquivo, junto de --float-floor, --header-bar-h
// e .btt-no-room. Aqui são duas classes: `js-mark` na raiz e `is-marked` em cada
// alvo. Ver "Motion de chegada" em css/style.css e "A Regra da Marca Aplicada"
// no DESIGN.md.
//
// A ordem importa e é o oposto do reflexo: o CSS em repouso já desenha as
// marcas, e só a presença de `js-mark` introduz o estado escondido. Por isso a
// classe entra DEPOIS de confirmar que o IntersectionObserver existe — sem ele,
// nada é escondido e as marcas nascem prontas. Um script que não roda não pode
// apagar conteúdo.
//
// Por que não `animation-timeline:view()`, que não custaria JS nenhum: toda
// faixa do site tem `overflow:hidden`, que faz dela um contêiner de rolagem, e
// view-timeline mede contra o contêiner ancestral mais próximo — não contra a
// viewport. Medido em navegador real, o progresso ficava fixo e errado. O
// comentário no CSS tem os números.
(function () {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('.section-title, .service-card');
  if (!targets.length) return;

  document.documentElement.classList.add('js-mark');

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-marked');
      obs.unobserve(entry.target); // a marca é aplicada uma vez, não repete na volta
    });
  }, {
    // Encolhe o fundo da root em 18%: a marca começa a ser traçada quando o
    // título já subiu para dentro da leitura, não no instante em que a borda
    // dele raspa a dobra. threshold 0 basta — quem atrasa é a rootMargin.
    rootMargin: '0px 0px -18% 0px',
    threshold: 0
  });

  targets.forEach(t => io.observe(t));
})();
