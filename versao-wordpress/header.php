<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- SVG Symbols (reusáveis) -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-star" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></symbol>
  <symbol id="icon-quote" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></symbol>
  <symbol id="icon-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
</svg>

<!-- ===== HEADER ===== -->
<header class="header">
  <div class="container">
    <a href="<?php echo esc_url(home_url('/')); ?>#inicio" class="logo" id="logo-link">Magnum <span>Torque</span></a>

    <nav class="nav-desktop">
      <a href="#inicio" data-section="inicio" class="active">Início</a>
      <a href="#sobre" data-section="sobre">Sobre</a>
      <a href="#servicos" data-section="servicos">Serviços</a>
      <a href="#parceiros" data-section="parceiros">Parceiros</a>
      <a href="#depoimentos" data-section="depoimentos">Depoimentos</a>
      <a href="#contato" data-section="contato" class="btn btn-primary" style="padding:.5rem 1.25rem">Entre em Contato</a>
    </nav>

    <button class="hamburger" id="hamburger" aria-label="Abrir menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
    </button>
  </div>

  <nav class="nav-mobile" id="mobile-nav">
    <a href="#inicio" data-section="inicio">Início</a>
    <a href="#sobre" data-section="sobre">Sobre</a>
    <a href="#servicos" data-section="servicos">Serviços</a>
    <a href="#parceiros" data-section="parceiros">Parceiros</a>
    <a href="#depoimentos" data-section="depoimentos">Depoimentos</a>
    <a href="#contato" data-section="contato" class="btn btn-primary" style="width:100%;margin-top:.5rem">Entre em Contato</a>
  </nav>
</header>
