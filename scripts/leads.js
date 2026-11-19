
(function () {
  'use strict';

  var LEAD_URL = 'https://script.google.com/macros/s/AKfycbzE2mbDhJfAwqShTRvDwDgWwNbbNP8YhL6lA7u1M2KG3ODYnRakRs8olTUAyefyGK8ktw/exec';
  if (LEAD_URL.indexOf('https://script.google.com/macros/s/') !== 0) return;

  var m = /[?&]test=(1|crm)\b/.exec(location.search);
  var LEAD_TEST = m ? (m[1] === 'crm' ? 'crm' : true) : false;

  function sendLead(d) {
    try {
      d.page = location.pathname || '/';
      d.referrer = document.referrer || '';

      d.site = 'roofingspecialist.ie';
      if (LEAD_TEST) d.test = LEAD_TEST;
      fetch(LEAD_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(d)
      })['catch'](function () {  });
    } catch (e) {  }
  }
  window.sendLead = sendLead;

  function where(el) {
    if (!el || !el.closest) return 'page';
    if (el.closest('.mobile-call-bar')) return 'mobile call bar';
    if (el.closest('.wa')) return 'whatsapp button';
    if (el.closest('#drawer')) return 'menu';
    if (el.closest('#nav, .nav')) return 'nav';
    if (el.closest('.hero, .page-head')) return 'top of page';
    if (el.closest('#contact')) return 'contact section';
    if (el.closest('.side-card')) return 'side panel';
    if (el.closest('.cta, .cta-band')) return 'call to action';
    if (el.closest('footer, .foot')) return 'footer';
    return 'page';
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0) {
      sendLead({ type: 'Call click', phone: h.slice(4), source: where(a) });
    } else if (/^https:\/\/wa\.me\//.test(h)) {
      sendLead({ type: 'WhatsApp click', source: where(a) });
    } else if (h.indexOf('mailto:') === 0) {
      sendLead({ type: 'Email click', details: h.slice(7).split('?')[0], source: where(a) });
    }
  }, true);

  function accepted(v) {
    var phoneDigits = v('phone').replace(/\D/g, '').length;
    return !v('botcheck') && v('name').length >= 2 && phoneDigits >= 9 && phoneDigits <= 15 &&
      v('area') && v('service') && v('message').length >= 5;
  }
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id !== 'quoteForm') return;
    var v = function (k) { return (f.elements[k] && f.elements[k].value || '').trim(); };
    if (!accepted(v)) return;
    sendLead({
      type: 'Quote form',
      name: v('name'),
      phone: v('phone'),
      area: v('area'),
      service: v('service'),
      details: v('message'),
      source: location.pathname === '/contact/' ? 'contact page form' : 'homepage form'
    });
  }, true);
})();
