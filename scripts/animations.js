(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = [
    '.trust-grid > *',
    '.svc-grid > *',
    '.zig > *',
    '.gal > figure',
    '.why-ed-list > li'
  ];

  document.querySelectorAll([
    '.hero-in',
    '.trust-grid > *',
    '.svc-grid > *',
    '.zig > *',
    '.gal > figure',
    '.why-ed-intro',
    '.why-ed-list > li',
    '.rev-head',
    '.rev-view',
    '.rev-plat',
    '.about-grid > *',
    '.area-wrap > *',
    '.form-grid > *',
    '.cta .wrap',
    '.foot-grid > *',
    '.page-head .wrap',
    'main > section .wrap > .prose'
  ].join(',')).forEach(function (el) {
    el.classList.add('rv');
  });

  document.querySelectorAll('h1, h2, h3, figure, img').forEach(function (el) {
    if (el.closest('section, .page-head') && !el.closest('.rv')) {
      el.classList.add('rv');
    }
  });

  var revealTargets = document.querySelectorAll('.rv');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    document.documentElement.classList.add('motion-ready');
    revealTargets.forEach(function (el, index) {
      el.classList.remove('in');
      el.style.transitionDelay = ((index % 4) * 55) + 'ms';
      observer.observe(el);
    });

    groups.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, index) {
        el.style.transitionDelay = (Math.min(index, 6) * 75) + 'ms';
      });
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('in');
    });
  }

  if (reduceMotion) return;

  var backgrounds = document.querySelectorAll('.areas-bg, .cta-bg');
  if (!backgrounds.length) return;

  var frame = 0;
  var updateParallax = function () {
    frame = 0;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var limit = window.innerWidth <= 680 ? 9 : 16;

    backgrounds.forEach(function (el) {
      var bounds = el.parentElement.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > viewportHeight) return;

      var distance = bounds.top + bounds.height / 2 - viewportHeight / 2;
      var offset = Math.max(-limit, Math.min(limit, -distance * 0.035));
      el.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
    });
  };
  var requestParallaxUpdate = function () {
    if (!frame) frame = window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestParallaxUpdate);
  updateParallax();
})();
