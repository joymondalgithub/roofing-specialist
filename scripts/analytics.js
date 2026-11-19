
(function () {
  'use strict';

  var GA4 = 'G-S2V4317LZW';
  var KEY = 'roofing_consent';

  if (!GA4 || GA4.indexOf('G-') !== 0) return;

  var loaded = false;
  var bar = null;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {  } }

  function grantConsent() {
    if (loaded) return;
    loaded = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA4);

    var q = window.__trackQueue || [];
    window.__trackQueue = null;
    q.forEach(function (ev) { window.track(ev[0], ev[1]); });
  }

  window.track = function (name, params) {
    if (!loaded) {
      if (read() === 'no') return;
      window.__trackQueue = window.__trackQueue || [];
      window.__trackQueue.push([name, params]);
      return;
    }
    try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {}
  };

  function css() {
    var st = document.createElement('style');
    st.textContent =
      '.cc{position:fixed;left:0;right:0;bottom:0;z-index:90;background:var(--ink,#15171A);' +
      'color:#fff;border-top:1px solid rgba(106,143,245,.32);' +
      'box-shadow:0 -10px 30px rgba(8,15,26,.35);' +
      'padding:16px 20px calc(16px + env(safe-area-inset-bottom))}' +
      '.cc[hidden]{display:none!important}' +
      '.cc-in{max-width:1160px;margin-inline:auto;display:flex;align-items:center;' +
      'gap:16px 22px;flex-wrap:wrap}' +
      '.cc p{color:rgba(255,255,255,.86);font-size:13.6px;line-height:1.55;flex:1 1 320px;margin:0}' +
      '.cc a{color:inherit;text-decoration:underline}' +
      '.cc-btns{display:flex;gap:10px;flex:0 0 auto}' +
      '.cc-btn{font:inherit;font-weight:700;font-size:14px;padding:11px 22px;min-height:44px;' +
      'border-radius:10px;cursor:pointer;white-space:nowrap;border:0}' +
      '.cc-yes{background:var(--brand,#2858E8);color:#fff}' +
      '.cc-no{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.7)}' +
      '.cc-btn:focus-visible{outline:2px solid var(--brand-lt,#6A8FF5);outline-offset:2px}' +

      'body.cc-open .wa{bottom:calc(var(--cc-h,120px) + 16px)}' +
      '@media(max-width:600px){.cc-btns{width:100%}.cc-btn{flex:1 1 0}}';
    document.head.appendChild(st);
  }

  function build() {
    bar = document.getElementById('cc');
    if (!bar) {
      css();
      bar = document.createElement('div');
      bar.className = 'cc';
      bar.id = 'cc';
      bar.setAttribute('role', 'dialog');
      bar.setAttribute('aria-label', 'Cookie choices');
      bar.hidden = true;
      bar.innerHTML =
        '<div class="cc-in">' +
          '<p>We use Google Analytics cookies to see how the website is doing. Nothing is set ' +
          'unless you accept, and declining does not affect your enquiry. ' +
          'See our <a href="./pages/privacy-policy.html">privacy policy</a>.</p>' +
          '<div class="cc-btns">' +
            '<button class="cc-btn cc-no" type="button" data-cc="no">Decline</button>' +
            '<button class="cc-btn cc-yes" type="button" data-cc="yes">Accept</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(bar);
    }

    // Document-level delegation ensures clicks on ANY accept/decline button ALWAYS work
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-cc]') : null;
      if (!b) return;
      var yes = b.getAttribute('data-cc') === 'yes';
      store(yes ? 'yes' : 'no');
      hide();
      if (yes) grantConsent(); else window.__trackQueue = null;
    });
  }

  function fit() {
    if (bar && !bar.hidden && bar.style.display !== 'none') {
      document.body.style.setProperty('--cc-h', bar.offsetHeight + 'px');
    }
  }
  function show() {
    if (!bar) bar = document.getElementById('cc');
    if (!bar) return;
    bar.hidden = false;
    bar.removeAttribute('hidden');
    bar.style.display = '';
    document.body.classList.add('cc-open');
    fit();
    window.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(bar);
  }
  function hide() {
    var bars = document.querySelectorAll('.cc, #cc');
    for (var i = 0; i < bars.length; i++) {
      bars[i].hidden = true;
      bars[i].setAttribute('hidden', '');
      bars[i].style.display = 'none';
    }
    document.body.classList.remove('cc-open');
    document.body.style.removeProperty('--cc-h');
  }

  function wire() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) window.track('contact_call', { method: 'phone', number: href.slice(4) });
      else if (href.indexOf('https://wa.me/') === 0) window.track('contact_whatsapp', { method: 'whatsapp' });
      else if (href.indexOf('mailto:') === 0) window.track('contact_email', { method: 'email' });
    }, true);

    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (!f || f.id !== 'quoteForm') return;
      var v = function (k) { return (f.elements[k] && f.elements[k].value || '').trim(); };

      var phoneDigits = v('phone').replace(/\D/g, '').length;
      if (v('botcheck') || v('name').length < 2 || phoneDigits < 9 || phoneDigits > 15 ||
          !v('area') || !v('service') || v('message').length < 5) return;
      window.track('generate_lead', { method: 'quote_form', service: v('service') });
    }, true);
  }

  function start() {
    build();
    wire();
    var prior = read();
    if (prior === 'yes') {
      grantConsent();
      hide();
    } else if (prior === 'no') {
      hide();
    } else {
      show();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
