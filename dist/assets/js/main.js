/* ALED08 — scripts (léger, sans dépendance) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- menu mobile ---------- */
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      var hd = document.querySelector('.site-header');
      if (open && hd) nav.style.setProperty('--nav-top', Math.max(0, hd.getBoundingClientRect().bottom) + 'px');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
      d.body.classList.toggle('nav-open', open);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) burger.click();
    });
  }
  $$('.sub-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var sub = d.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open);
      if (sub) sub.classList.toggle('is-open', open);
    });
  });

  /* ---------- en-tête au défilement ---------- */
  var header = $('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- apparition au défilement ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }


  /* ---------- avant / après ---------- */
  $$('.ba-range').forEach(function (r) {
    var frame = r.closest('.ba-frame');
    var set = function () { frame.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set);
    set();
  });

  /* ---------- consentement cookies & carte ---------- */
  var KEY = 'aled08-consent-v1';
  var banner = $('#cookie'), mapsBox = $('#consent-maps');
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  var write = function (v) { try { localStorage.setItem(KEY, JSON.stringify({ maps: !!v.maps, date: new Date().toISOString() })); } catch (e) {} };
  var loadMaps = function () {
    $$('[data-map-src]').forEach(function (m) {
      if (m.querySelector('iframe')) return;
      var f = d.createElement('iframe');
      f.src = m.getAttribute('data-map-src');
      f.title = m.getAttribute('data-map-title') || 'Carte';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      m.appendChild(f);
      var ph = m.querySelector('.map-placeholder'); if (ph) ph.remove();
    });
  };
  var applyConsent = function (c) { if (c && c.maps) loadMaps(); };
  var showBanner = function () {
    if (!banner) return;
    var c = read();
    if (mapsBox) mapsBox.checked = !!(c && c.maps);
    banner.hidden = false;
  };
  var decide = function (maps) { write({ maps: maps }); if (banner) banner.hidden = true; if (maps) loadMaps(); };
  var consent = read();
  if (!consent) showBanner(); else applyConsent(consent);
  $$('[data-consent]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-consent');
      decide(a === 'accept' ? true : a === 'refuse' ? false : !!(mapsBox && mapsBox.checked));
    });
  });
  $$('[data-cookie-settings]').forEach(function (b) { b.addEventListener('click', showBanner); });
  $$('[data-map-load]').forEach(function (b) { b.addEventListener('click', function () { decide(true); }); });

  /* ---------- formulaires ---------- */
  $$('form[data-form]').forEach(function (f) {
    var t = f.querySelector('input[name="_t"]'); if (t) t.value = Date.now();
    var p = new URLSearchParams(location.search);
    var pre = p.get('prestation'), sel = f.querySelector('select[name="prestation"]');
    if (pre && sel) { $$('option', sel).forEach(function (o) { if (o.value === pre) sel.value = pre; }); }
    var com = f.querySelector('select[name="commune"]');
    var preC = p.get('commune');
    if (com && preC) { $$('option', com).forEach(function (o) { if (o.value === preC) com.value = preC; }); }
    f.addEventListener('submit', function (e) {
      if (!f.checkValidity()) { e.preventDefault(); f.reportValidity(); return; }
      var btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Envoi en cours…'; }
    });
  });
  if (/[?&]erreur=1/.test(location.search)) {
    $$('[data-form-error]').forEach(function (el) { el.hidden = false; });
  }

})();
