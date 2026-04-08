// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

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
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const logoLink = document.getElementById('logo-link');
  const navLinks = document.querySelectorAll('.nav-desktop a[data-section]:not(.btn), .nav-mobile a[data-section]:not(.btn)');
  const allSectionLinks = document.querySelectorAll('a[data-section]');
  let activeSection = 'inicio';

  function closeMobile() {
    if (mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.innerHTML = iconMenu;
    }
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);

    const sections = ['inicio', 'sobre', 'servicos', 'pecas', 'parceiros', 'depoimentos', 'faq', 'contato'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) { activeSection = id; break; }
      }
    }
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === activeSection));
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.innerHTML = mobileNav.classList.toggle('open') ? iconX : iconMenu;
  });

  logoLink.addEventListener('click', (e) => { e.preventDefault(); scrollToSection('inicio'); closeMobile(); });

  allSectionLinks.forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); scrollToSection(link.dataset.section); closeMobile(); });
  });
})();

// ===== Testimonials Carousel =====
(function () {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;

  const cards = track.children;
  const total = cards.length;
  let current = 0;
  let perView = getPerView();

  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }
  function maxIdx() { return Math.max(0, total - perView); }

  function update() {
    const gap = 24;
    track.style.transform = `translateX(-${current * (cards[0].offsetWidth + gap)}px)`;
    Array.from(dotsContainer.children).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver depoimento ${i + 1}`);
      if (i === current) dot.classList.add('active');
      dot.addEventListener('click', () => { current = i; update(); });
      dotsContainer.appendChild(dot);
    }
  }

  prevBtn.addEventListener('click', () => { current = current > 0 ? current - 1 : maxIdx(); update(); });
  nextBtn.addEventListener('click', () => { current = current < maxIdx() ? current + 1 : 0; update(); });

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { e.preventDefault(); diff > 0 ? nextBtn.click() : prevBtn.click(); }
  });

  window.addEventListener('resize', () => {
    perView = getPerView();
    if (current > maxIdx()) current = maxIdx();
    buildDots();
    update();
  });

  buildDots();
  update();
})();

// ===== Contact Form =====
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');
    let valid = true;

    if (name.value.trim().length < 3) { name.closest('.form-group').classList.add('has-error'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.closest('.form-group').classList.add('has-error'); valid = false; }
    if (!subject.value) { subject.closest('.form-group').classList.add('has-error'); valid = false; }
    if (message.value.trim().length < 10) { message.closest('.form-group').classList.add('has-error'); valid = false; }
    if (!valid) return;

    const labels = { orcamento: 'Orçamento', duvida: 'Dúvida Técnica', agendamento: 'Agendamento', outro: 'Outro' };
    const text = `${labels[subject.value] || subject.value}\n\n${message.value}\n\n${name.value}\n${email.value}`;
    const waUrl = `https://wa.me/554135036828?text=${encodeURIComponent(text)}`;
    const opened = window.open(waUrl, '_blank');
    if (!opened) { window.location.href = waUrl; }
    form.reset();
  });
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
  openBtn.addEventListener('click', () => overlay.classList.add('open'));
  overlay.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', () => overlay.classList.remove('open')));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) overlay.classList.remove('open'); });
})();
