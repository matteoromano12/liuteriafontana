(function () {
  const STORAGE_KEY = 'lf-lang';
  let current = localStorage.getItem(STORAGE_KEY) || 'it';

  function translate(lang) {
    document.querySelectorAll('[data-it]').forEach(el => {
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.it;
    });
    current = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    updateBtn();
  }

  function updateBtn() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.textContent = current === 'it' ? '🇬🇧 EN' : '🇮🇹 IT';
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBtn();
    if (current === 'en') translate('en');
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      translate(current === 'it' ? 'en' : 'it');
    });
  });
})();
