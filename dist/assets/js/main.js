/* ALED08 : scripts (léger, sans dépendance) */
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

/* ---------- petites étincelles qui se baladent (décoratif) ---------- */
(function () {
  'use strict';
  if (!window.requestAnimationFrame || !document.createElement('canvas').getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas');
  cv.className = 'sparks';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0, R = Math.min(window.devicePixelRatio || 1, 1.5);
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7071, 0.7071], [-0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, -0.7071]];
  var sparks = [], arcs = [], running = true;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * R; cv.height = H * R;
    ctx.setTransform(R, 0, 0, R, 0, 0);
  }
  // Les étincelles sont placées dans la page (pas dans l'écran) : elles défilent avec le contenu.
  var next = 90;
  function spawn() {
    var sy = window.pageYOffset || 0;
    var s = { x: rnd(W * 0.05, W * 0.95), y: sy + rnd(H * 0.1, H * 0.9), d: DIRS[(Math.random() * 8) | 0], v: rnd(1.6, 2.6), left: rnd(25, 70), life: rnd(50, 80), age: 0, trail: [] };
    sparks.push(s);
    if (Math.random() < 0.35) zigzag(s.x, s.y);
  }
  function maxAlive() { return W < 720 ? 1 : 2; }
  function init() { size(); sparks = []; }
  function zigzag(x, y) {
    var pts = [[x, y]], n = 5, a = rnd(0, Math.PI * 2), len = rnd(18, 34);
    for (var i = 1; i <= n; i++) {
      pts.push([x + Math.cos(a) * len * i / n + rnd(-6, 6), y + Math.sin(a) * len * i / n + rnd(-6, 6)]);
    }
    arcs.push({ pts: pts, t: 0 });
  }
  function frame() {
    if (!running) return;
    var sy = window.pageYOffset || 0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    if (--next <= 0) {
      if (sparks.length < maxAlive()) spawn();
      next = rnd(110, 260); // une nouvelle étincelle toutes les 2 à 4 secondes environ
    }
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.d[0] * s.v; s.y += s.d[1] * s.v; s.age++; s.left -= s.v;
      if (s.left <= 0) { s.d = DIRS[(Math.random() * 8) | 0]; s.left = rnd(25, 70); }
      if (s.age > s.life) { sparks.splice(i, 1); continue; }
      var fade = Math.min(1, s.age / 8, (s.life - s.age) / 25);
      s.trail.push([s.x, s.y]);
      if (s.trail.length > 16) s.trail.shift();
      for (var t = 1; t < s.trail.length; t++) {
        ctx.strokeStyle = 'rgba(255, 180, 70,' + (0.6 * fade * t / s.trail.length) + ')';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.trail[t - 1][0], s.trail[t - 1][1] - sy); ctx.lineTo(s.trail[t][0], s.trail[t][1] - sy); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 236, 190,' + (0.9 * fade) + ')';
      ctx.beginPath(); ctx.arc(s.x, s.y - sy, 1.6, 0, 6.2832); ctx.fill();
    }
    for (var j = arcs.length - 1; j >= 0; j--) {
      var a = arcs[j]; a.t++;
      if (a.t > 9) { arcs.splice(j, 1); continue; }
      ctx.strokeStyle = 'rgba(255, 220, 140,' + (0.8 - a.t / 12) + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(a.pts[0][0], a.pts[0][1] - sy);
      for (var k = 1; k < a.pts.length; k++) ctx.lineTo(a.pts[k][0], a.pts[k][1] - sy);
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  init();
  window.addEventListener('resize', function () { size(); });
  document.addEventListener('visibilitychange', function () {
    var was = running; running = !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
})();
