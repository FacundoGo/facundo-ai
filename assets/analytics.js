/* facundo.ai — Google Analytics 4 with a cookie banner (GDPR).
   GA only loads after the visitor clicks "Accept". Nothing is tracked before that.
   To change the GA property, edit GA_ID below. Leave it empty to turn analytics off. */
(function () {
  var GA_ID = '';                 // e.g. 'G-XXXXXXXXXX'
  var KEY = 'fai_cookie_consent'; // 'accepted' | 'declined'

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function loadGA() {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('config', GA_ID, location.search.indexOf('debug=1') > -1 ? { debug_mode: true } : {});
  }

  // Key actions as GA events (they show up under Reports → Engagement → Events).
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || !window.__gaLoaded) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0) gtag('event', 'email_click', { link_text: a.textContent.trim() });
    else if (a.classList.contains('pill--accent')) gtag('event', 'cta_click', { link_text: a.textContent.trim(), link_url: href });
  });
  document.addEventListener('submit', function (e) {
    if (window.__gaLoaded && e.target.classList.contains('newsletter')) gtag('event', 'newsletter_submit');
  });

  // Footer "Cookie settings" link reopens the banner.
  window.faiCookieSettings = function () { showBanner(); return false; };

  function showBanner() {
    if (!GA_ID || document.getElementById('cookie-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie notice');
    bar.innerHTML =
      '<p>With your permission I use Google Analytics cookies to see which pages people read. No ads, no selling data. <a href="/privacy/">Privacy</a></p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="pill pill--outline pill--sm" data-c="declined">Essential only</button>' +
        '<button type="button" class="pill pill--dark pill--sm" data-c="accepted">Accept</button>' +
      '</div>';
    bar.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!v) return;
      set(v);
      bar.remove();
      if (v === 'accepted') loadGA();
      else if (window.__gaLoaded) gtag('consent', 'update', { analytics_storage: 'denied' });
    });
    document.body.appendChild(bar);
  }

  var stored = get();
  if (stored === 'accepted') loadGA();
  else if (!stored) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
