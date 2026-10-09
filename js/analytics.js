// GA4 bootstrap + Consent Mode v2 (LGPD).
// Externo (não inline) para a CSP funcionar sem 'unsafe-inline' em script-src.
// Deve ser carregado ANTES do loader async do gtag.js.
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
// Fonte única de verdade do consentimento. Lida por js/main.js (trackEvent) e por
// js/blog-search.js. 'unset' = a pessoa ainda não respondeu ao banner.
window.mgConsent = 'unset';
try {
  const v = localStorage.getItem('mg_consent');
  if (v === 'granted' || v === 'denied') window.mgConsent = v;
} catch (_) {}

// gtag('config') é o que dispara o page_view, e ele fica RETIDO até o aceite.
// Motivo: a política de privacidade promete medição "somente após você aceitar",
// e no Consent Mode v2 'denied' NÃO para de enviar — só deixa de usar cookie.
// Reter o config aqui também conserta o page_view da landing page de quem aceita:
// antes ele saía sob 'denied' e nunca era recontado com o client_id novo.
window.mgStartAnalytics = function () {
  if (window.mgStartAnalytics.started) return;
  window.mgStartAnalytics.started = true;
  window.mgConsent = 'granted';

  // O loader do gtag.js é injetado AQUI, não por uma <script> no HTML. Ele pesa
  // 169 KB na rede — 28% do peso da home e 41% do de um artigo — e antes era
  // baixado por todo visitante, inclusive quem recusava. Baixar a biblioteca de
  // medição antes do consentimento é justamente o que o gate existe para impedir.
  // CSP-safe: script-src já permite www.googletagmanager.com.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-0HJYEEB2XR';
  document.head.appendChild(s);

  gtag('consent', 'update', { analytics_storage: 'granted' });
  gtag('config', 'G-0HJYEEB2XR');
};

if (window.mgConsent === 'granted') window.mgStartAnalytics();
