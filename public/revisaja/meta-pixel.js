/* RevisaJá ENEM: Meta Pixel isolado, sem eventos de checkout ou pagamento.
 * Antes da publicação, validar a base legal e a política de privacidade.
 * Este script não presume nem registra consentimento do visitante.
 */
(() => {
  'use strict';
  // Uma instância por documento, inclusive se o script for executado novamente.
  if (window.REVISAJA_META_PIXEL) return;
  const PIXEL_ID = '1819169519225400';
  const state = { initialized: false, sent: { PageView: false, ViewContent: false } };
  let ready = false;

  function loadBase() {
    // Bootstrap oficial da Meta. Reutiliza fbq e evita downloads duplicados.
    !function(f,b,e,v,n,t,s) {
      if (f.fbq) return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      if (b.querySelector('script[src*="connect.facebook.net/"][src*="/fbevents.js"]')) return;
      t=b.createElement(e);t.async=!0;t.src=v;t.dataset.revisajaMetaBase='';
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  }
  function initialize() {
    if (state.initialized) return;
    loadBase();
    // Não habilita rastreamento automático de cliques/formulários.
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    let alreadyInitialized = false;
    try {
      alreadyInitialized = window.fbq.getState?.().pixels?.some(pixel => String(pixel.id) === PIXEL_ID) ||
        window.fbq.queue?.some(args => args[0] === 'init' && String(args[1]) === PIXEL_ID);
    } catch {}
    if (!alreadyInitialized) window.fbq('init', PIXEL_ID);
    state.initialized = true;
  }
  function sendOnce(event, data) {
    if (state.sent[event]) return;
    state.sent[event] = true;
    // Limita cada evento ao Pixel correto, sem enviar para outros IDs.
    window.fbq('trackSingle', PIXEL_ID, event, data || {});
  }
  function syncTracking() {
    if (!ready) return;
    initialize();
    sendOnce('PageView');
    // ViewContent só ocorre quando a oferta está renderizada em uma página visível.
    if (!document.hidden && document.querySelector('h1') &&
        document.querySelector('.plan.complete') && document.querySelector('.plan.essential')) {
      sendOnce('ViewContent', { content_name: 'RevisaJá ENEM', content_type: 'product' });
    }
  }
  window.REVISAJA_META_PIXEL = Object.freeze({
    pixelId: PIXEL_ID,
    getState: () => ({ pixelId: PIXEL_ID, initialized: state.initialized, events: { ...state.sent } })
  });
  function setup() {
    if (ready) return;
    ready = true;
    syncTracking();
  }
  document.addEventListener('visibilitychange', syncTracking);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
