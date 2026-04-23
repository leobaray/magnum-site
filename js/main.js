// ===== Footer year =====
const _yearEl = document.getElementById('year');
if (_yearEl) _yearEl.textContent = new Date().getFullYear();

// ===== Indicador de horário de funcionamento (Seg-Sex 8h-18h, America/Sao_Paulo) =====
(function () {
  const el = document.querySelector('[data-business-hours]');
  if (!el) return;
  const dot = el.querySelector('.dot');
  const text = el.querySelector('.hours-text');
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

  update();
  setInterval(update, 60 * 1000);
})();

// ===== GA4 event helper =====
function trackEvent(name, params) {
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
  const id = hash.slice(1);
  // Espera o layout estabilizar antes de reposicionar
  window.addEventListener('load', () => {
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'instant' });
    });
  });
})();

// ===== Icons (only the ones actually swapped by JS) =====
const iconMenu = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
const iconX = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

// ===== Scroll =====
function scrollToSection(id, offset = 80) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
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
  const sectionIds = ['inicio', 'sobre', 'servicos', 'pecas', 'parceiros', 'depoimentos', 'faq', 'contato'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const isBlogPage = document.body.classList.contains('blog-page');

  function setMobileOpen(open) {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    hamburger.innerHTML = open ? iconX : iconMenu;
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
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
  }

  // Header shadow on scroll (em paginas de blog fica sempre com sombra)
  function updateHeaderShadow() {
    header.classList.toggle('scrolled', isBlogPage || window.scrollY > 10);
  }
  updateHeaderShadow();
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });

  // Scrollspy: so roda em paginas que tem as secoes (home)
  if (sections.length > 0) {
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
      navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === id));
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
  } else if (isBlogPage) {
    // Em paginas de blog, marca o item "Blog" como ativo
    document.querySelectorAll('.nav-desktop a[href^="/blog"], .nav-mobile a[href^="/blog"]').forEach(a => a.classList.add('active'));
  }

  // Logo click: so intercepta se tem a secao #inicio na pagina; senao deixa navegar normal
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      const inicio = document.getElementById('inicio');
      if (inicio) { e.preventDefault(); scrollToSection('inicio'); closeMobile(); }
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
      scrollToSection(targetId);
      closeMobile();
    });
  });
})();

// ===== Testimonials Carousel =====
(function () {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;
  const wrapper = track.closest('.carousel-wrapper');

  const cards = track.children;
  const total = cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTOPLAY_MS = 6000;

  let current = 0;
  let perView = getPerView();
  let timer = null;

  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }
  function maxIdx() { return Math.max(0, total - perView); }

  function update() {
    const gap = 24;
    track.style.transform = `translateX(-${current * (cards[0].offsetWidth + gap)}px)`;
    Array.from(dotsContainer.children).forEach((d, i) => {
      const active = i === current;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
      d.setAttribute('tabindex', active ? '0' : '-1');
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
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ver depoimento ${i + 1}`);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      dot.setAttribute('tabindex', i === current ? '0' : '-1');
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => { stopAuto(); go(i); startAuto(); });
      dotsContainer.appendChild(dot);
    }
  }

  function startAuto() {
    if (reduceMotion.matches) return;
    stopAuto();
    timer = setInterval(() => go(current + 1), AUTOPLAY_MS);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  prevBtn.addEventListener('click', () => { stopAuto(); go(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); go(current + 1); startAuto(); });

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

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => { stopAuto(); startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? go(current + 1) : go(current - 1); }
    startAuto();
  }, { passive: true });

  window.addEventListener('resize', () => {
    perView = getPerView();
    if (current > maxIdx()) current = maxIdx();
    buildDots();
    update();
  });

  reduceMotion.addEventListener('change', () => { reduceMotion.matches ? stopAuto() : startAuto(); });

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

  function markInvalid(field, invalid) {
    field.closest('.form-group').classList.toggle('has-error', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

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
      [phone, phoneDigits.length >= 10 && phoneDigits.length <= 13],
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

    setStatus('Abrindo WhatsApp...', 'success');
    const opened = window.open(waUrl, '_blank', 'noopener');
    if (!opened) { window.location.href = waUrl; return; }
    form.reset();
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    form.querySelectorAll('[aria-invalid]').forEach(f => f.setAttribute('aria-invalid', 'false'));
    setTimeout(() => setStatus('', null), 4000);
  });

  // Limpa o erro ao digitar novamente
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.closest('.form-group')?.classList.contains('has-error')) {
        markInvalid(field, false);
      }
    });
  });

  // Máscara leve de telefone (BR)
  const phoneField = form.querySelector('#phone');
  if (phoneField) {
    phoneField.addEventListener('input', () => {
      let d = phoneField.value.replace(/\D/g, '').slice(0, 11);
      let out = '';
      if (d.length === 0) { phoneField.value = ''; return; }
      if (d.length < 3)       out = `(${d}`;
      else if (d.length <= 6) out = `(${d.slice(0,2)}) ${d.slice(2)}`;
      else if (d.length <= 10)out = `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
      else                    out = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
      phoneField.value = out;
    });
  }
})();

// ===== Back to Top =====
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > 400); }, { passive: true });
  btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
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
