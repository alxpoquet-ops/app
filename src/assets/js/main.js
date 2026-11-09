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

  /* ---------- disponibilité du moment (heure locale) ---------- */
  (function () {
    var now = new Date(), day = now.getDay(), h = now.getHours() + now.getMinutes() / 60, txt;
    var weekend = day === 0 || day === 6;
    if (weekend) {
      var end = day === 6 ? 19 : 18, start = day === 6 ? 8 : 9;
      if (h < start) txt = 'Créneaux aujourd’hui dès ' + start + ' h, sur RDV';
      else if (h < end) txt = 'Disponible aujourd’hui, sur rendez-vous';
      else txt = day === 6 ? 'Créneaux demain, dimanche, sur RDV' : 'Créneaux demain soir dès 18 h';
    } else {
      if (h < 18) txt = 'Créneaux ce soir dès 18 h, sur RDV';
      else if (h < 21.5) txt = 'Joignable ce soir — appelez maintenant';
      else txt = day === 5 ? 'Créneaux demain, samedi, sur RDV' : 'Créneaux demain soir dès 18 h';
    }
    $$('[data-dispo]').forEach(function (el) { el.textContent = txt; });
  })();

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
  var COMMUNES = window.ALED_COMMUNES || null;
  var tierText = function (km) {
    if (km <= 15) return 'sans supplément kilométrique (déplacement : 20 €)';
    if (km <= 30) return 'supplément de 10 € (déplacement : 30 €)';
    if (km <= 45) return 'supplément de 20 € (déplacement : 40 €)';
    return 'déplacement sur devis, annoncé à l’avance';
  };
  $$('form[data-form]').forEach(function (f) {
    var t = f.querySelector('input[name="_t"]'); if (t) t.value = Date.now();
    var p = new URLSearchParams(location.search);
    var pre = p.get('prestation'), sel = f.querySelector('select[name="prestation"]');
    if (pre && sel) { $$('option', sel).forEach(function (o) { if (o.value === pre) sel.value = pre; }); }
    var com = f.querySelector('select[name="commune"]'), out = f.querySelector('.form-km');
    var preC = p.get('commune');
    if (com && preC) { $$('option', com).forEach(function (o) { if (o.value === preC) com.value = preC; }); }
    var upd = function () {
      if (!com || !out || !COMMUNES) return;
      var km = COMMUNES[com.value];
      if (km === undefined) { out.classList.remove('is-on'); return; }
      out.textContent = com.value + ' : environ ' + km + ' km de Signy-l’Abbaye — ' + tierText(km) + '.';
      out.classList.add('is-on');
    };
    if (com) { com.addEventListener('change', upd); upd(); }
    f.addEventListener('submit', function (e) {
      if (!f.checkValidity()) { e.preventDefault(); f.reportValidity(); return; }
      var btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Envoi en cours…'; }
    });
  });
  if (/[?&]erreur=1/.test(location.search)) {
    $$('[data-form-error]').forEach(function (el) { el.hidden = false; });
  }

  /* ---------- estimateur de déplacement ---------- */
  var est = $('[data-estimator]');
  if (est && COMMUNES) {
    var s = est.querySelector('select'), o = est.querySelector('.estimator-out');
    s.addEventListener('change', function () {
      var km = COMMUNES[s.value];
      if (km === undefined) { o.classList.remove('is-on'); return; }
      o.innerHTML = '<strong>' + s.value + '</strong> — environ ' + km + ' km : ' + tierText(km) + '.';
      o.classList.add('is-on');
    });
  }
})();
