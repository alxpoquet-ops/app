/* ALED08 : scripts (léger, sans dépendance) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var euro = function (n) { return (Math.round(n * 100) / 100).toString().replace('.', ',') + '\u00a0\u20ac'; };
  // Change des paramètres d'un lien sans toucher au chemin (qui peut être relatif)
  var withParams = function (href, params) {
    var hash = '', i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    var j = href.indexOf('?'), base = j >= 0 ? href.slice(0, j) : href;
    var q = new URLSearchParams(j >= 0 ? href.slice(j + 1) : '');
    Object.keys(params).forEach(function (k) { if (params[k]) q.set(k, params[k]); else q.delete(k); });
    var qs = q.toString();
    return base + (qs ? '?' + qs : '') + hash;
  };

  /* ---------- parrainage : le code d'un lien ?parrain=… est gardé 60 jours ---------- */
  var cleanCode = function (v) { return (v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20); };
  var parrain = cleanCode(new URLSearchParams(location.search).get('parrain'));
  if (parrain.length < 3) parrain = '';
  try {
    if (parrain) localStorage.setItem('aled08_parrain', JSON.stringify({ c: parrain, t: Date.now() }));
    var saved = JSON.parse(localStorage.getItem('aled08_parrain') || 'null');
    if (!parrain && saved && Date.now() - saved.t < 60 * 864e5) parrain = cleanCode(saved.c);
  } catch (e) { /* stockage indisponible : le code de l'adresse suffit */ }

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

  /* ---------- forfait au mois ou à l'année ---------- */
  $$('[data-billing-switch]').forEach(function (sw) {
    var scope = sw.closest('[data-billing-scope]') || d.body;
    var buttons = $$('button[data-billing]', sw);
    var set = function (mode) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-billing') === mode;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on);
      });
      scope.setAttribute('data-billing', mode);
      $$('.plan a.btn', scope).forEach(function (a) {
        a.setAttribute('href', withParams(a.getAttribute('href'), { periode: mode === 'annuel' ? 'annuel' : '' }));
      });
      scope.dispatchEvent(new CustomEvent('billing', { detail: mode }));
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-billing')); });
    });
    sw._set = set;
  });

  /* ---------- configurateur « Créer mon site » ---------- */
  var builder = $('[data-builder]');
  if (builder) {
    var data;
    try { data = JSON.parse(builder.getAttribute('data-builder')); } catch (e) { data = null; }
    if (data) initBuilder(builder, data);
  }

  function initBuilder(box, data) {
    var find = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
    var val = function (name) { var r = $('input[name="' + name + '"]:checked', box); return r ? r.value : ''; };
    var setText = function (key, text) { $$('[data-sum="' + key + '"]', box).forEach(function (el) { el.textContent = text; }); };
    var params = new URLSearchParams(location.search);
    ['type', 'forfait'].forEach(function (k) {
      var v = params.get(k);
      var r = v && $('input[name="b-' + k + '"][value="' + v.replace(/[^a-z0-9-]/g, '') + '"]', box);
      if (r) r.checked = true;
    });
    var sw = $('[data-billing-switch]', box);
    if (params.get('periode') === 'annuel' && sw && sw._set) sw._set('annuel');

    /* nom de domaine */
    var dom = { name: '', tld: '.fr', status: '' };
    var input = $('#b-domain', box), tld = $('#b-tld', box), out = $('[data-domain-result]', box);
    var checkBtn = $('[data-domain-check]', box), own = $('[data-domain-own]', box);
    var RDAP = {
      '.fr': 'https://rdap.nic.fr/domain/',
      '.com': 'https://rdap.verisign.com/com/v1/domain/',
      '.net': 'https://rdap.verisign.com/net/v1/domain/',
      '.org': 'https://rdap.publicinterestregistry.org/rdap/domain/'
    };
    var ICO = {
      ok: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
      no: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      wait: '<svg class="ico d-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>'
    };
    var clean = function (v) {
      v = (v || '').toLowerCase().trim();
      if (v.normalize) v = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      v = v.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      var m = v.match(/\.(fr|com|net|org)$/);
      if (m) { tld.value = '.' + m[1]; v = v.slice(0, -m[0].length); }
      return v.replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);
    };
    var show = function (cls, html) { out.innerHTML = '<span class="d-pill ' + cls + '">' + html + '</span>'; };
    var suggest = function (name, ext) {
      var other = ext === '.fr' ? '.com' : '.fr';
      var list = [[name + '-08', ext], ['mon-' + name, ext], [name, other]];
      var wrap = d.createElement('div');
      wrap.className = 'd-sugg';
      list.forEach(function (s) {
        var b = d.createElement('button');
        b.type = 'button';
        b.textContent = s[0] + s[1];
        b.addEventListener('click', function () { input.value = s[0]; tld.value = s[1]; check(); });
        wrap.appendChild(b);
      });
      out.appendChild(wrap);
    };
    var busy = false;
    function check() {
      if (busy || own.checked) return;
      var name = clean(input.value);
      input.value = name;
      dom.name = name; dom.tld = tld.value; dom.status = '';
      if (name.length < 2) { show('d-err', 'Écrivez au moins deux lettres, par exemple le nom de votre entreprise.'); update(); return; }
      var full = name + tld.value;
      busy = true; checkBtn.disabled = true;
      show('d-wait', ICO.wait + 'Je regarde si ' + full + ' est libre…');
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
      fetch(RDAP[tld.value] + encodeURIComponent(full), { headers: { Accept: 'application/rdap+json' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (res.status === 404) {
            dom.status = 'libre';
            show('d-ok', ICO.ok + full + ' est libre ! Je le réserverai à votre nom.');
          } else if (res.ok) {
            dom.status = 'pris';
            show('d-taken', ICO.no + full + ' est déjà pris. Une idée :');
            suggest(name, tld.value);
          } else {
            throw new Error('rdap ' + res.status);
          }
        })
        .catch(function () {
          dom.status = 'inconnu';
          show('d-err', 'Je n’arrive pas à vérifier pour l’instant. Pas de souci : je le ferai pour vous.');
        })
        .then(function () { clearTimeout(timer); busy = false; checkBtn.disabled = false; update(); });
    }
    checkBtn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    input.addEventListener('input', function () { if (dom.status) { dom.status = ''; out.innerHTML = ''; update(); } });
    tld.addEventListener('change', function () { if (input.value) check(); });
    own.addEventListener('change', function () {
      [input, tld, checkBtn].forEach(function (el) { el.disabled = own.checked; });
      if (own.checked) { dom.status = 'mien'; show('d-ok', ICO.ok + 'Parfait, on gardera votre nom de domaine actuel.'); }
      else { dom.status = ''; out.innerHTML = ''; }
      update();
    });
    var form = $('[data-builder-form]', box);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });

    /* récapitulatif */
    function update() {
      var t = find(data.types, val('b-type')) || data.types[0];
      var f = find(data.forfaits, val('b-forfait')) || data.forfaits[0];
      var annual = box.getAttribute('data-billing') === 'annuel';
      var mult = annual ? 12 - data.free : 1;
      var per = annual ? '/an' : '/mois';
      var month = f.month;
      var optOnce = 0, optMonth = 0, chosen = [];
      $$('.b-opt input:checked', box).forEach(function (i) {
        var o = find(data.options, i.value);
        if (!o) return;
        chosen.push(o.name); optOnce += o.once; optMonth += o.month;
      });
      setText('type', t.label);
      setText('type-price', euro(t.price));
      setText('forfait', 'Forfait ' + f.name);
      $$('[data-sum-shopify]', box).forEach(function (el) { el.hidden = t.id !== 'boutique'; });
      setText('forfait-price', euro(month * mult) + per);
      var optLine = $('[data-sum-opts]', box);
      if (optLine) {
        optLine.hidden = !chosen.length;
        var parts = [];
        if (optOnce) parts.push(euro(optOnce));
        if (optMonth) parts.push(euro(optMonth * mult) + per);
        optLine.querySelector('span').textContent = chosen.length > 1 ? chosen.length + ' options' : (chosen[0] || 'Options');
        setText('opts', parts.join(' + '));
      }
      var domText = '';
      if (dom.status === 'mien') domText = 'Mon nom de domaine actuel';
      else if (dom.name) domText = dom.name + dom.tld + (dom.status === 'libre' ? ' (libre)' : dom.status === 'pris' ? ' (déjà pris)' : '');
      setText('domain', domText || 'Nom de domaine à choisir');
      var lisse = val('b-lisse') === 'oui';
      var lisseLine = $('[data-sum-lisse]', box);
      if (lisseLine) lisseLine.hidden = !lisse;
      setText('lisse', euro(Math.round(t.price / data.lissage * 100) / 100) + '/mois');
      setText('once-label', lisse ? 'À la commande' : 'Création, une fois');
      setText('once', euro((lisse ? 0 : t.price) + optOnce));
      setText('recur-label', annual ? 'Puis chaque année' : 'Puis chaque mois');
      setText('recur', euro((month + optMonth) * mult));
      setText('recur-short', euro((month + optMonth) * mult) + per);
      var q = { type: t.label, forfait: f.name, paiement: annual ? 'À l’année' : 'Au mois', lissage: lisse ? 'oui' : '', domaine: domText, options: chosen.join(', '), parrain: parrain };
      $$('[data-sum-go]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href'), q)); });
    }
    var pLine = $('[data-sum-parrain]', box);
    if (pLine && parrain) pLine.hidden = false;
    box.addEventListener('change', update);
    box.addEventListener('billing', update);
    update();

    /* barre du bas (téléphone) : cachée quand le récapitulatif complet est visible */
    var bar = $('[data-sum-bar]', box), sum = $('.b-sum', box);
    if (bar && sum && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { bar.classList.toggle('is-hidden', en.isIntersecting); });
      }, { threshold: 0.2 }).observe(sum);
    }
  }

  /* ---------- espace client (démo et vrai espace) ---------- */
  var appEl = $('[data-app]');
  if (appEl) initApp(appEl);
  var espaceEl = $('[data-espace]');
  if (espaceEl) initEspace(espaceEl);

  function makeToast(app) {
    var toastEl = $('[data-toast]', app), toastTimer;
    return function (msg) {
      if (!toastEl) return;
      toastEl.textContent = msg; toastEl.hidden = false;
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2800);
    };
  }

  function initTabs(app) {
    var tabs = $$('[role="tab"]', app);
    var show = function (id, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        var panel = d.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && t.scrollIntoView && window.innerWidth < 900) t.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      var top = $('.app-main', app).getBoundingClientRect().top;
      if (top < 0) window.scrollBy({ top: top - 90, behavior: 'smooth' });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); show(n.getAttribute('data-tab'), true); }
      });
    });
    $$('[data-go]', app).forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-go')); }); });
    var startTab = (new URLSearchParams(location.search).get('outil') || location.hash.slice(1) || '').replace(/[^a-z]/g, '');
    if (startTab && $('[data-tab="' + startTab + '"]', app)) show(startTab);
  }

  function copyButtons(app, toast) {
    $$('[data-copy]', app).forEach(function (btn) {
      var src = d.getElementById(btn.getAttribute('data-copy')) || $('[data-copy-src]', app);
      if (!src) return;
      btn.addEventListener('click', function () {
        var done = function () { toast(btn.getAttribute('data-copy-msg') || 'Lien copié, prêt à envoyer'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(src.value).then(done, function () { src.select(); done(); });
        else { src.select(); done(); }
      });
    });
  }

  /* vrai espace client (WordPress) */
  function initEspace(app) {
    var toast = makeToast(app);
    initTabs(app);
    copyButtons(app, toast);
    var file = $('[data-req-file]', app), fileName = $('[data-req-file-name]', app);
    if (file && fileName) file.addEventListener('change', function () { if (file.files && file.files[0]) fileName.textContent = file.files[0].name; });
    var reqForm = $('form[data-req-real]', app);
    if (reqForm) reqForm.addEventListener('submit', function (e) {
      var ta = reqForm.querySelector('textarea');
      if (ta && !ta.value.trim()) { e.preventDefault(); toast('Écrivez votre demande en quelques mots'); ta.focus(); return; }
      if (file && file.files && file.files[0] && file.files[0].size > 8 * 1024 * 1024) { e.preventDefault(); toast('La photo dépasse 8 Mo : choisissez-en une plus légère'); return; }
      var b = reqForm.querySelector('button[type="submit"]');
      if (b) { b.disabled = true; b.querySelector('span').textContent = 'Envoi en cours…'; }
    });
    var flash = $('[data-flash]', app);
    if (flash && flash.textContent.trim()) toast(flash.textContent.trim());
    /* QR code dessiné dans la page (bibliothèque qrcode-generator, MIT) */
    var qrBox = $('[data-qr]', app);
    var drawQr = function () {
      if (!qrBox || typeof window.qrcode !== 'function') return;
      var qr = window.qrcode(0, 'M');
      qr.addData(qrBox.getAttribute('data-qr'));
      qr.make();
      var n = qr.getModuleCount(), m = 2, path = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) path += 'M' + (c + m) + ',' + (r + m) + 'h1v1h-1z';
      var size = n + m * 2;
      qrBox.innerHTML = '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="QR code vers votre site" shape-rendering="crispEdges"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path fill="#2E2A47" d="' + path + '"/></svg>';
      var dl = $('[data-qr-dl]', app);
      if (dl) dl.addEventListener('click', function () {
        var svg = qrBox.querySelector('svg').outerHTML;
        var img = new Image();
        img.onload = function () {
          var cv = d.createElement('canvas'); cv.width = cv.height = 1200;
          var cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false; cx.drawImage(img, 0, 0, 1200, 1200);
          var a = d.createElement('a'); a.download = 'qr-code.png'; a.href = cv.toDataURL('image/png'); d.body.appendChild(a); a.click(); a.remove();
          toast('QR code téléchargé');
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
    };
    if (d.readyState === 'complete') drawQr(); else window.addEventListener('load', drawQr);
  }

  /* démo de l'espace client */
  function initApp(app) {
    var tpl = $('template[data-icons]', app), mtpl = $('template[data-monsters]', app);
    var ico = function (n) { var el = tpl && tpl.content.querySelector('[data-i="' + n + '"]'); return el ? el.innerHTML : ''; };
    var toast = makeToast(app);
    initTabs(app);
    $$('[data-toast-msg]', app).forEach(function (b) { b.addEventListener('click', function () { toast(b.getAttribute('data-toast-msg')); }); });

    var log = $('[data-log]', app);
    var addLog = function (ic, text) {
      var li = d.createElement('li');
      li.innerHTML = ico(ic) + '<span></span><small>à l’instant</small>';
      li.querySelector('span').textContent = text;
      log.insertBefore(li, log.firstChild);
    };

    /* modifications du mois */
    var left = 3, max = 4;
    var drawJauge = function () {
      $('[data-jetons]', app).textContent = left;
      $('[data-jetons-max]', app).textContent = max;
      $('[data-jauge-fill]', app).style.width = (max ? Math.min(100, left / max * 100) : 0) + '%';
      $('[data-jauge]', app).classList.toggle('is-low', left <= 0);
    };
    drawJauge();

    /* demandes de modification */
    var form = $('[data-req]', app), txt = $('#req-txt', app), list = $('[data-reqs]', app);
    var file = $('[data-req-file]', app), fileName = $('[data-req-file-name]', app);
    file.addEventListener('change', function () { if (file.files && file.files[0]) fileName.textContent = file.files[0].name; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = txt.value.trim();
      if (!text) { toast('Écrivez votre demande en quelques mots'); txt.focus(); return; }
      if (left <= 0) { toast('Vos modifications du mois sont utilisées : je vous recontacte pour en parler (démo)'); return; }
      left--; drawJauge();
      var li = d.createElement('li');
      li.innerHTML = '<span><strong></strong><small>envoyée à l’instant</small></span><em class="st st-new">Reçue</em>';
      li.querySelector('strong').textContent = text.length > 60 ? text.slice(0, 57) + '…' : text;
      list.insertBefore(li, list.firstChild);
      txt.value = ''; file.value = ''; fileName.textContent = 'Ajouter une photo (facultatif)';
      toast('Demande envoyée : je m’en occupe (démo)');
      var st = li.querySelector('.st');
      setTimeout(function () { st.className = 'st st-doing'; st.textContent = 'En cours'; }, 2000);
      setTimeout(function () {
        st.className = 'st st-done'; st.textContent = 'Faite';
        toast('Votre modification est en ligne (démo)');
        addLog('check', 'Modification faite : ' + li.querySelector('strong').textContent);
      }, 4500);
    });

    /* lien d'avis */
    copyButtons(app, toast);

    /* forfait et options */
    var total = $('[data-app-total]', app);
    var recompute = function () {
      var p = $('input[name="app-plan"]:checked', app);
      var sum = p ? +p.getAttribute('data-month') : 0;
      $$('.app-opt input:checked', app).forEach(function (i) { sum += +i.getAttribute('data-month'); });
      total.textContent = euro(sum);
      if (p) {
        $('[data-app-plan-name]', app).textContent = p.getAttribute('data-name');
        $('[data-app-plan-price]', app).textContent = euro(+p.getAttribute('data-month')) + ' par mois';
        var m = mtpl && mtpl.content.querySelector('[data-m="' + p.value + '"]');
        if (m) $('[data-app-plan-art]', app).innerHTML = m.innerHTML;
      }
    };
    $$('input[name="app-plan"]', app).forEach(function (r) {
      r.addEventListener('change', function () {
        max = +r.getAttribute('data-jetons'); left = Math.min(left, max);
        drawJauge(); recompute();
        toast('Forfait ' + r.getAttribute('data-name') + ' choisi, à partir du mois prochain (démo)');
      });
    });
    $$('.app-opt input', app).forEach(function (c) {
      c.addEventListener('change', function () {
        recompute();
        toast((c.checked ? 'Option ajoutée' : 'Option retirée') + ' (démo)');
      });
    });
    recompute();
  }

  /* ---------- formulaire de contact ---------- */
  $$('form[data-form]').forEach(function (f) {
    var t = f.querySelector('input[name="_t"]'); if (t) t.value = Date.now();
    var p = new URLSearchParams(location.search);
    var pick = function (sel, v) { if (!sel || !v) return; $$('option', sel).forEach(function (o) { if (o.value === v) sel.value = v; }); };
    pick(f.querySelector('select[name="type"]'), p.get('type'));
    pick(f.querySelector('select[name="forfait"]'), p.get('forfait'));
    var pay = p.get('paiement');
    if (pay) $$('input[name="paiement"]', f).forEach(function (r) { if (r.value === pay) r.checked = true; });
    var pInput = f.querySelector('input[name="parrain"]');
    if (pInput && !pInput.value) pInput.value = cleanCode(p.get('parrain')) || parrain;
    var dom = p.get('domaine'), domInput = f.querySelector('input[name="domaine"]');
    if (dom && domInput) domInput.value = dom;
    var opts = p.get('options'), msg = f.querySelector('textarea[name="message"]');
    var intro = [];
    if (p.get('lissage') === 'oui') intro.push('Je souhaite lisser le prix du site sur 2 ans.');
    if (opts) intro.push('Options choisies : ' + opts + '.');
    if (intro.length && msg && !msg.value) msg.value = intro.join('\n') + '\n\n';
    f.addEventListener('submit', function (e) {
      if (!f.checkValidity()) { e.preventDefault(); f.reportValidity(); return; }
      var btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Envoi en cours…'; }
    });
  });
  if (/[?&]connexion=erreur/.test(location.search)) {
    $$('[data-login-error]').forEach(function (el) { el.hidden = false; });
  }
  if (/[?&]erreur=1/.test(location.search)) {
    $$('[data-form-error]').forEach(function (el) { el.hidden = false; });
  }
})();
