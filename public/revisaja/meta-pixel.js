/* RevisaJá ENEM: Meta Pixel isolado, sem eventos de checkout ou pagamento. */
(() => {
  'use strict';
  // Uma instância por documento, inclusive se o script for executado novamente.
  if (window.REVISAJA_META_PIXEL) return;
  const PIXEL_ID = '1819169519225400';
  const CONSENT_KEY = 'revisaja-enem:marketing-consent:v1';
  const CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000;
  const state = { choice: null, initialized: false, sdkGranted: false, sent: { PageView: false, ViewContent: false } };
  let ready = false;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (saved?.version === 1 && typeof saved.marketing === 'boolean' &&
          Number.isFinite(saved.updatedAt) && Date.now() >= saved.updatedAt &&
          Date.now() - saved.updatedAt < CONSENT_TTL_MS) return saved.marketing;
    } catch { /* Sem armazenamento disponível, a escolha vale somente nesta página. */ }
    return null;
  }
  function rememberChoice(choice) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, marketing: choice, updatedAt: Date.now() })); } catch {}
  }
  function removeOwnPixelCookies() {
    // Somente os cookies do Pixel neste host. Não altera cookies de outros produtos/domínios.
    for (const name of ['_fbp', '_fbc']) {
      const cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = cookie;
      document.cookie = `${cookie}; domain=${location.hostname}`;
    }
  }
  function cancelQueuedEvents() {
    const queue = window.fbq?.queue;
    if (window.fbq?.callMethod || !Array.isArray(queue)) return;
    // Uma revogação durante o download não deve enviar eventos ainda pendentes.
    for (let i = queue.length - 1; i >= 0; i--) {
      const args = Array.from(queue[i]);
      if (args[0] === 'trackSingle' && args[1] === PIXEL_ID && args[2] in state.sent) {
        state.sent[args[2]] = false;
        queue.splice(i, 1);
      }
    }
  }
  function revoke() {
    cancelQueuedEvents();
    if (state.initialized && state.sdkGranted) window.fbq('consent', 'revoke');
    state.sdkGranted = false;
    removeOwnPixelCookies();
  }
  function loadBase() {
    // Bootstrap oficial da Meta, chamado somente após autorização de publicidade.
    // O guard fbq e a checagem do script impedem downloads duplicados.
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
    if (!state.initialized) {
      loadBase();
      // Impede a configuração automática de eventos por cliques/formulários neste Pixel.
      window.fbq('set', 'autoConfig', false, PIXEL_ID);
      let alreadyInitialized = false;
      try {
        alreadyInitialized = window.fbq.getState?.().pixels?.some(pixel => String(pixel.id) === PIXEL_ID) ||
          window.fbq.queue?.some(args => args[0] === 'init' && String(args[1]) === PIXEL_ID);
      } catch {}
      if (!alreadyInitialized) window.fbq('init', PIXEL_ID);
      state.initialized = true;
    }
    if (!state.sdkGranted) {
      window.fbq('consent', 'grant');
      state.sdkGranted = true;
    }
  }
  function sendOnce(event, data) {
    if (state.sent[event]) return;
    state.sent[event] = true;
    // trackSingle limita o envio ao Pixel correto, sem transmitir para outros IDs.
    window.fbq('trackSingle', PIXEL_ID, event, data || {});
  }
  function syncTracking() {
    if (!ready || state.choice !== true || document.hidden) return;
    initialize();
    sendOnce('PageView');
    // O HTML da oferta já foi renderizado pela aplicação antes deste script defer.
    if (document.querySelector('h1') && document.querySelector('.plan.complete') && document.querySelector('.plan.essential')) {
      sendOnce('ViewContent', { content_name: 'RevisaJá ENEM', content_type: 'product' });
    }
  }
  function updateNotice(show = state.choice === null) {
    const panel = document.querySelector('#pixel-consent');
    if (!panel) return;
    panel.hidden = !show;
    document.querySelector('#pixel-consent-preferences')?.setAttribute('aria-expanded', String(show));
    const status = panel.querySelector('[data-consent-status]');
    status.textContent = state.choice === true ? 'Publicidade permitida. Você pode alterar sua escolha.' :
      state.choice === false ? 'Publicidade recusada. Você pode alterar sua escolha.' : '';
    status.hidden = state.choice === null;
  }
  function setMarketingConsent(choice) {
    if (typeof choice !== 'boolean') return;
    state.choice = choice;
    rememberChoice(choice);
    if (!choice) revoke();
    updateNotice(false);
    syncTracking();
  }
  window.REVISAJA_META_PIXEL = Object.freeze({
    pixelId: PIXEL_ID,
    setMarketingConsent,
    getState: () => ({ pixelId: PIXEL_ID, consent: state.choice, initialized: state.initialized, events: { ...state.sent } })
  });
  function setup() {
    if (ready) return;
    ready = true;
    state.choice = readChoice();
    const panel = document.querySelector('#pixel-consent');
    if (panel) {
      panel.querySelector('[data-consent="accept"]').addEventListener('click', () => setMarketingConsent(true));
      panel.querySelector('[data-consent="reject"]').addEventListener('click', () => setMarketingConsent(false));
      const policy = panel.querySelector('[data-consent-policy]');
      const url = typeof CONFIG !== 'undefined' ? CONFIG.PRIVACY_URL : '';
      if (url && /^https:\/\//.test(url)) { policy.href = url; policy.closest('[data-consent-policy-wrapper]').hidden = false; }
      const preferences = document.createElement('button');
      preferences.type = 'button';preferences.id = 'pixel-consent-preferences';
      preferences.textContent = 'Preferências de cookies';preferences.setAttribute('aria-controls', 'pixel-consent');
      preferences.addEventListener('click', () => { updateNotice(true); panel.focus({ preventScroll: true }); });
      document.querySelector('#legal-links').append(preferences);
    }
    updateNotice();
    if (state.choice === false) revoke();
    syncTracking();
  }
  document.addEventListener('visibilitychange', syncTracking);
  window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    state.choice = readChoice();
    if (state.choice !== true) revoke();
    updateNotice();syncTracking();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
