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
try { if (localStorage.getItem('mg_consent') === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' }); } catch(_) {}
gtag('config', 'G-0HJYEEB2XR');
