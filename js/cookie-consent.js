/* ─── Cookie Consent — Liuteria Fontana ─────────────────────────────────── */

(function () {
  const STORAGE_KEY = 'lf_cookie_consent';
  const CONSENT_VERSION = '1'; // incrementa se cambi le finalità dei cookie

  /* ── Leggi preferenza salvata ─────────────────────────────────── */
  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      // Se la versione è cambiata, richedi il consenso
      if (obj.version !== CONSENT_VERSION) return null;
      return obj.accepted; // true | false
    } catch (e) {
      return null;
    }
  }

  function saveConsent(accepted) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accepted,
      version: CONSENT_VERSION,
      date: new Date().toISOString()
    }));
  }

  /* ── Banner HTML ──────────────────────────────────────────────── */
  function createBanner() {
    const overlay = document.createElement('div');
    overlay.id = 'cookie-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Informativa sui cookie');

    overlay.innerHTML = `
      <div id="cookie-banner">
        <div class="cb-eyebrow">Privacy & Cookie</div>
        <h2>Utilizziamo i cookie di Google Maps</h2>
        <p>
          Per mostrarti la nostra posizione usiamo Google Maps, che potrebbe impostare
          cookie di terze parti sul tuo dispositivo per analisi e pubblicità personalizzata.
          Consulta la
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy di Google</a>
          per maggiori dettagli.
          Puoi accettare o rifiutare; in caso di rifiuto la mappa non verrà caricata.
        </p>
        <div class="cb-actions">
          <button class="cb-btn cb-btn-accept" id="cb-accept">
            <i class="fa-solid fa-check" style="margin-right:8px"></i>Accetta e mostra la mappa
          </button>
          <button class="cb-btn cb-btn-reject" id="cb-reject">
            Rifiuta
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Mostra con leggero delay per permettere il paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    document.getElementById('cb-accept').addEventListener('click', () => {
      saveConsent(true);
      hideBanner(overlay);
      loadMaps();
    });

    document.getElementById('cb-reject').addEventListener('click', () => {
      saveConsent(false);
      hideBanner(overlay);
      showBlockedNotice();
    });
  }

  function hideBanner(overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 400);
  }

  /* ── Gestione mappa ───────────────────────────────────────────── */

  /*
   * Trova tutti i contenitori mappa nel documento.
   * Convenzione: aggiungi data-map-src="URL_EMBED_GOOGLE_MAPS"
   * all'elemento che deve contenere la mappa, es:
   *   <div class="map-wrapper" data-map-src="https://maps.google.com/maps?...&output=embed"></div>
   *
   * Oppure, se hai già un <iframe> con src="", usa data-map-iframe="true" sull'iframe.
   */
  function getMapContainers() {
    return [
      ...document.querySelectorAll('[data-map-src]'),
      ...document.querySelectorAll('iframe[data-map-iframe]')
    ];
  }

  function loadMaps() {
    // Rimuovi eventuali notice di blocco
    document.querySelectorAll('.map-blocked').forEach(el => {
      el.classList.remove('map-blocked');
    });
    document.querySelectorAll('.map-blocked-notice').forEach(el => el.remove());

    // Carica gli iframe
    document.querySelectorAll('[data-map-src]').forEach(container => {
      const src = container.getAttribute('data-map-src');
      if (!src) return;

      // Se il container ha già un iframe, aggiorna il src
      let iframe = container.querySelector('iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.border = '0';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        container.appendChild(iframe);
      }
      iframe.src = src;
    });

    // Se usi iframe con data-map-iframe e src vuoto
    document.querySelectorAll('iframe[data-map-iframe]').forEach(iframe => {
      const src = iframe.getAttribute('data-map-real-src');
      if (src) iframe.src = src;
    });
  }

  function blockMaps() {
    document.querySelectorAll('[data-map-src]').forEach(container => {
      container.classList.add('map-blocked');
      // Rimuovi eventuali iframe già presenti
      container.querySelectorAll('iframe').forEach(f => f.remove());
    });

    document.querySelectorAll('iframe[data-map-iframe]').forEach(iframe => {
      // Salva il src reale e svuota
      if (!iframe.getAttribute('data-map-real-src') && iframe.src) {
        iframe.setAttribute('data-map-real-src', iframe.src);
      }
      iframe.src = '';
      iframe.parentElement.classList.add('map-blocked');
    });
  }

  function showBlockedNotice() {
    document.querySelectorAll('[data-map-src], iframe[data-map-iframe]').forEach(el => {
      const container = el.hasAttribute('data-map-src') ? el : el.parentElement;
      if (!container) return;
      container.classList.add('map-blocked');

      // Evita duplicati
      if (container.querySelector('.map-blocked-notice')) return;

      const notice = document.createElement('div');
      notice.className = 'map-blocked-notice';
      notice.innerHTML = `
        <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
        <p>La mappa non è disponibile perché hai rifiutato i cookie di Google Maps.</p>
        <button id="cb-reopen">Modifica preferenze</button>
      `;
      container.appendChild(notice);

      notice.querySelector('#cb-reopen').addEventListener('click', () => {
        // Rimuovi la preferenza e riapri il banner
        localStorage.removeItem(STORAGE_KEY);
        notice.remove();
        container.classList.remove('map-blocked');
        createBanner();
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  function init() {
    const maps = getMapContainers();

    // Nessuna mappa in questa pagina: non fare nulla
    if (maps.length === 0) return;

    const consent = getConsent();

    if (consent === true) {
      loadMaps();
    } else if (consent === false) {
      blockMaps();
      showBlockedNotice();
    } else {
      // Consenso non ancora espresso
      blockMaps();
      createBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();