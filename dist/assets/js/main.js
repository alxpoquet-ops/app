/* ALED08 : scripts (léger, sans dépendance) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var euro = function (n) { return (Math.round(n * 100) / 100).toString().replace('.', ',') + '\u00a0\u20ac'; };
  // Change un paramètre d'un lien sans toucher au chemin (qui peut être relatif)
  var withParams = function (href, params) {
    var hash = '', i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    var j = href.indexOf('?'), base = j >= 0 ? href.slice(0, j) : href;
    var q = new URLSearchParams(j >= 0 ? href.slice(j + 1) : '');
    Object.keys(params).forEach(function (k) { if (params[k]) q.set(k, params[k]); else q.delete(k); });
    var qs = q.toString();
    return base + (qs ? '?' + qs : '') + hash;
  };

  /* ---------- menu mobile ---------- */
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      var hd = $('.site-header');
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

  /* ---------- paiement unique / abonnement ---------- */
  var setMode = null;
  $$('[data-mode-switch]').forEach(function (sw) {
    var scope = sw.closest('.section') || d;
    var buttons = $$('button[data-mode]', sw);
    setMode = function (mode, fromEstimator) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-mode') === mode;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on);
      });
      $$('.formules, .pay-notes', scope).forEach(function (el) { el.setAttribute('data-mode', mode); });
      // Le bouton « Choisir cette formule » transmet aussi la façon de payer
      $$('.formule a.btn', scope).forEach(function (a) {
        a.setAttribute('href', withParams(a.getAttribute('href'), { paiement: mode === 'mensuel' ? 'Abonnement' : 'Paiement unique' }));
      });
      if (!fromEstimator) {
        var r = $('.estimator input[name="est-m"][value="' + mode + '"]');
        if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
  });

  /* ---------- simulateur de prix ---------- */
  $$('[data-estimator]').forEach(function (box) {
    var data;
    try { data = JSON.parse(box.getAttribute('data-estimator')); } catch (e) { return; }
    var out = {
      once: $('[data-est="once"]', box),
      month: $('[data-est="month"]', box),
      year: $('[data-est="year"]', box)
    };
    var link = $('.est-total a.btn', box);
    var label = function (p, mode) {
      if (p === 'inclus') return 'Inclus';
      var parts = [];
      if (p.once) parts.push(euro(p.once));
      if (p.month) parts.push(euro(p.month) + '/mois');
      if (p.year) parts.push(euro(p.year) + '/an');
      return '+' + parts.join(' + ');
    };
    function update() {
      var fId = ($('input[name="est-f"]:checked', box) || {}).value;
      var mode = ($('input[name="est-m"]:checked', box) || {}).value || 'unique';
      var f = data.formules.filter(function (x) { return x.id === fId; })[0] || data.formules[0];
      var key = mode === 'mensuel' ? 'a' : 'u';
      var t = { once: mode === 'mensuel' ? 0 : f.u, month: mode === 'mensuel' ? f.m : 0, year: 0 };
      var chosen = [];
      data.options.forEach(function (o) {
        var row = $('[data-opt="' + o.id + '"]', box);
        if (!row) return;
        var input = $('input', row), p = o[key];
        var included = p === 'inclus';
        row.classList.toggle('is-included', included);
        if (included) { input.checked = true; input.disabled = true; }
        else if (input.disabled) { input.disabled = false; input.checked = false; }
        $('[data-opt-price]', row).textContent = label(p, mode);
        if (input.checked && !included) {
          chosen.push(o.name);
          t.once += p.once || 0; t.month += p.month || 0; t.year += p.year || 0;
        }
      });
      out.once.textContent = euro(t.once);
      out.month.textContent = euro(t.month);
      out.year.textContent = euro(t.year);
      out.year.parentNode.hidden = !t.year;
      if (link) {
        link.setAttribute('href', withParams(link.getAttribute('href'), {
          projet: f.label,
          paiement: mode === 'mensuel' ? 'Abonnement' : 'Paiement unique',
          options: chosen.join(', ')
        }));
      }
      return mode;
    }
    box.addEventListener('change', function (e) {
      var mode = update();
      if (e.target && e.target.name === 'est-m' && setMode) setMode(mode, true);
    });
    update();
  });

  /* ---------- formulaire de devis ---------- */
  $$('form[data-form]').forEach(function (f) {
    var t = f.querySelector('input[name="_t"]'); if (t) t.value = Date.now();
    var p = new URLSearchParams(location.search);
    var projet = p.get('projet'), sel = f.querySelector('select[name="projet"]');
    if (projet && sel) { $$('option', sel).forEach(function (o) { if (o.value === projet) sel.value = projet; }); }
    var pay = p.get('paiement');
    if (pay) { $$('input[name="paiement"]', f).forEach(function (r) { if (r.value === pay) r.checked = true; }); }
    var opts = p.get('options'), msg = f.querySelector('textarea[name="message"]');
    if (opts && msg && !msg.value) msg.value = 'Options qui m’intéressent : ' + opts + '.\n\n';
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

/* ---------- jeu de démonstration : Attrape-éclairs ---------- */
(function () {
  'use strict';
  var box = document.querySelector('[data-game]');
  if (!box) return;
  var cv = box.querySelector('canvas'), ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  var W = 720, H = 420, R = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * R; cv.height = H * R;
  ctx.setTransform(R, 0, 0, R, 0, 0);
  var ui = {
    score: box.querySelector('[data-score]'),
    lives: box.querySelector('[data-lives]'),
    best: box.querySelector('[data-best]'),
    start: box.querySelector('[data-start]'),
    play: box.querySelector('[data-play]')
  };
  var KEY = 'aled08-jeu-record';
  var best = 0;
  try { best = parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) {}
  ui.best.textContent = best;

  var paddle = { x: W / 2, w: 104, h: 18, y: H - 34 }, target = W / 2;
  var items = [], bits = [], score = 0, lives = 3, playing = false, last = 0, spawnIn = 0, elapsed = 0, keys = {};
  var stars = [];
  for (var i = 0; i < 40; i++) stars.push([Math.random() * W, Math.random() * H, Math.random() * 1.4 + 0.3]);

  function bolt(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(3, -17); ctx.lineTo(-10, 2); ctx.lineTo(-1, 2); ctx.lineTo(-4, 17); ctx.lineTo(10, -3); ctx.lineTo(1, -3); ctx.closePath();
    ctx.fillStyle = '#ffb627'; ctx.shadowColor = 'rgba(255, 182, 39, .8)'; ctx.shadowBlur = 14; ctx.fill();
    ctx.restore();
  }
  function bug(x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#ff7a5c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    var wig = Math.sin(t / 90) * 2;
    for (var k = -1; k <= 1; k++) {
      ctx.beginPath(); ctx.moveTo(-8, k * 6); ctx.lineTo(-15, k * 7 + wig); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, k * 6); ctx.lineTo(15, k * 7 - wig); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-4, -11); ctx.lineTo(-8, -17); ctx.moveTo(4, -11); ctx.lineTo(8, -17); ctx.stroke();
    ctx.fillStyle = '#ff7a5c';
    ctx.beginPath(); ctx.ellipse(0, 1, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0d1830';
    ctx.beginPath(); ctx.arc(-3.5, -5, 2, 0, Math.PI * 2); ctx.arc(3.5, -5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function burst(x, y, color) {
    for (var k = 0; k < 10; k++) {
      var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 120;
      bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.5, age: 0, c: color });
    }
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#13234a'); g.addColorStop(1, '#0d1830');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255, 255, 255, .5)';
    stars.forEach(function (s) { ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t / 700 + s[0]); ctx.fillRect(s[0], s[1], s[2], s[2]); });
    ctx.globalAlpha = 1;
    items.forEach(function (it) { if (it.good) bolt(it.x, it.y, 1.15); else bug(it.x, it.y, 1, t); });
    bits.forEach(function (b) {
      ctx.globalAlpha = Math.max(0, 1 - b.age / b.life);
      ctx.fillStyle = b.c; ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    var px = paddle.x - paddle.w / 2;
    roundRect(px, paddle.y, paddle.w, paddle.h, 9);
    var pg = ctx.createLinearGradient(px, 0, px + paddle.w, 0);
    pg.addColorStop(0, '#2fd3c0'); pg.addColorStop(1, '#6cb6ff');
    ctx.fillStyle = pg; ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, .35)'; roundRect(px + 10, paddle.y + 4, paddle.w - 20, 4, 2); ctx.fill();
  }
  function step(t) {
    if (!playing) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0); last = t; elapsed += dt;
    var level = Math.min(1, elapsed / 60);
    if (keys.left) target -= 520 * dt;
    if (keys.right) target += 520 * dt;
    target = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, target));
    paddle.x += (target - paddle.x) * Math.min(1, dt * 18);
    spawnIn -= dt;
    if (spawnIn <= 0) {
      var good = Math.random() > 0.24 + level * 0.12;
      items.push({ x: 30 + Math.random() * (W - 60), y: -20, v: 140 + level * 210 + Math.random() * 50, good: good });
      spawnIn = 0.95 - level * 0.55;
    }
    for (var k = items.length - 1; k >= 0; k--) {
      var it = items[k];
      it.y += it.v * dt;
      var hit = it.y > paddle.y - 14 && it.y < paddle.y + paddle.h && Math.abs(it.x - paddle.x) < paddle.w / 2 + 10;
      if (hit) {
        items.splice(k, 1);
        if (it.good) { score++; burst(it.x, paddle.y, '#ffd27a'); }
        else { lives--; burst(it.x, paddle.y, '#ff7a5c'); }
        ui.score.textContent = score; ui.lives.textContent = Math.max(0, lives);
        if (lives <= 0) return over();
      } else if (it.y > H + 20) {
        items.splice(k, 1);
        // Un éclair manqué coûte une vie, un bug évité ne coûte rien
        if (it.good) {
          lives--; ui.lives.textContent = Math.max(0, lives);
          if (lives <= 0) return over();
        }
      }
    }
    for (var j = bits.length - 1; j >= 0; j--) {
      var b = bits[j]; b.age += dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 300 * dt;
      if (b.age > b.life) bits.splice(j, 1);
    }
    draw(t);
    requestAnimationFrame(step);
  }
  function start() {
    items = []; bits = []; score = 0; lives = 3; elapsed = 0; spawnIn = 0.4;
    ui.score.textContent = 0; ui.lives.textContent = 3;
    ui.start.hidden = true; box.classList.add('is-playing');
    playing = true; last = performance.now();
    requestAnimationFrame(step);
  }
  function over() {
    playing = false; box.classList.remove('is-playing');
    if (score > best) { best = score; try { localStorage.setItem(KEY, String(best)); } catch (e) {} }
    ui.best.textContent = best;
    draw(performance.now());
    ui.start.querySelector('.game-title').textContent = 'Partie terminée';
    ui.start.querySelector('p:not(.game-title)').textContent = score + (score > 1 ? ' éclairs attrapés.' : ' éclair attrapé.') + ' Record : ' + best + '.';
    ui.play.querySelector('span').textContent = 'Rejouer';
    ui.start.hidden = false;
    ui.play.focus({ preventScroll: true });
  }
  function moveTo(clientX) {
    var r = cv.getBoundingClientRect();
    target = (clientX - r.left) / r.width * W;
  }
  cv.addEventListener('pointermove', function (e) { if (playing) moveTo(e.clientX); });
  cv.addEventListener('pointerdown', function (e) { if (playing) moveTo(e.clientX); });
  document.addEventListener('keydown', function (e) {
    if (!playing) return;
    if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
  });
  document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) { playing = false; over(); } });
  ui.play.addEventListener('click', start);
  draw(0);
  // Un éclair et un bug posés sur l'écran d'accueil, pour montrer le principe
  items = [{ x: W * 0.3, y: H * 0.42, good: true }, { x: W * 0.7, y: H * 0.5, good: false }];
  draw(0);
  items = [];
})();

/* ---------- petites étoiles (décor, discret) ---------- */
(function () {
  'use strict';
  if (!window.requestAnimationFrame || !document.createElement('canvas').getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.createElement('canvas');
  cv.className = 'sparks';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  var ctx = cv.getContext('2d'), W = 0, H = 0, R = Math.min(window.devicePixelRatio || 1, 1.5);
  var COLORS = ['255, 182, 39', '47, 211, 192', '255, 143, 192', '185, 164, 255', '108, 182, 255'];
  var list = [], running = true, next = 1.2, last = 0;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  function size() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * R; cv.height = H * R;
    ctx.setTransform(R, 0, 0, R, 0, 0);
  }
  // Les étoiles sont placées dans la page, pas dans l'écran : elles défilent avec le contenu.
  function spawn() {
    var side = Math.random() < 0.5;
    var x = side ? rnd(0.02, 0.16) * W : rnd(0.84, 0.98) * W;
    list.push({ x: x, y: (window.pageYOffset || 0) + rnd(0.12, 0.88) * H, r: rnd(5, 9), life: rnd(1, 1.5), age: 0, c: COLORS[(Math.random() * COLORS.length) | 0], rot: rnd(0, 0.6) });
  }
  function star(x, y, r, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.fill(); ctx.restore();
  }
  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    var sy = window.pageYOffset || 0;
    ctx.clearRect(0, 0, W, H);
    next -= dt;
    if (next <= 0) {
      if (list.length < (W < 720 ? 1 : 2)) spawn();
      next = rnd(2.2, 4.2);
    }
    for (var i = list.length - 1; i >= 0; i--) {
      var s = list[i]; s.age += dt;
      if (s.age > s.life) { list.splice(i, 1); continue; }
      var k = s.age / s.life, grow = Math.sin(k * Math.PI);
      ctx.fillStyle = 'rgba(' + s.c + ',' + (0.85 * grow) + ')';
      ctx.shadowColor = 'rgba(' + s.c + ', .8)'; ctx.shadowBlur = 10;
      star(s.x, s.y - sy - k * 10, s.r * (0.4 + 0.6 * grow), s.rot + k * 0.8);
    }
    requestAnimationFrame(frame);
  }
  size();
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', function () {
    var was = running; running = !document.hidden;
    if (running && !was) { last = performance.now(); requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
})();
