/* Alex & Lia : scripts (léger, sans dépendance) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var round2 = function (n) { return Math.round(n * 100) / 100; };
  var floor2 = function (n) { return Math.floor(n * 100 + 1e-6) / 100; };
  var euro = function (n) { var v = round2(n); return (v % 1 ? v.toFixed(2) : String(v)).replace('.', ',') + ' €'; };
  var slug = function (v) { return (v || '').replace(/[^a-z0-9-]/g, ''); };

  // Peinture : une flaque différente sous chaque bouton principal, et une éclaboussure au clic
  (function () {
    $$('.btn-primary').forEach(function (b, i) { b.setAttribute('data-flaque', String((i % 4) + 1)); });
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    d.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn-primary:not(.btn-sm)');
      if (!b) return;
      var r = b.getBoundingClientRect(), w = r.width, h = r.height;
      b.classList.remove('is-splash'); void b.offsetWidth; b.classList.add('is-splash');
      for (var k = 0; k < 9; k++) {
        // chaque goutte part du bord du bouton et s'envole vers l'extérieur
        var g = d.createElement('span'), a = (k / 9) * 6.283 + Math.random() * 0.5, dist = 26 + Math.random() * 34;
        g.className = 'goutte-vol';
        g.style.left = (w / 2 + Math.cos(a) * w / 2.1) + 'px'; g.style.top = (h / 2 + Math.sin(a) * h / 2) + 'px';
        g.style.setProperty('--dx', Math.round(Math.cos(a) * dist * 1.3) + 'px');
        g.style.setProperty('--dy', Math.round(Math.sin(a) * dist) + 'px');
        g.style.setProperty('--t', Math.round(6 + Math.random() * 9) + 'px');
        b.appendChild(g);
        setTimeout(function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(g), 700);
      }
    });
  })();

  // Mode sombre : bouton lune / soleil en haut, choix gardé sur l'appareil
  (function () {
    var root = d.documentElement;
    var meta = $('meta[name="theme-color"]');
    var apply = function (dark) {
      if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
      if (meta) meta.setAttribute('content', dark ? '#16142A' : '#FFF8F2');
      $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre'); b.setAttribute('aria-pressed', dark ? 'true' : 'false'); });
    };
    apply(root.getAttribute('data-theme') === 'dark');
    d.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-theme-toggle]');
      if (!b) return;
      var dark = root.getAttribute('data-theme') !== 'dark';
      apply(dark);
      try { localStorage.setItem('al-theme', dark ? 'dark' : 'light'); } catch (err) {}
    });
  })();
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

  /* options réservées à certains types de site (stock, comptes clients : boutique) */
  var filterOpts = function (scope, typeId) {
    $$('.b-opt[data-types]', scope).forEach(function (l) {
      var ok = (' ' + l.getAttribute('data-types') + ' ').indexOf(' ' + typeId + ' ') >= 0;
      l.hidden = !ok;
      var i = l.querySelector('input');
      if (!ok && i) i.checked = false;
    });
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
        a.setAttribute('href', withParams(a.getAttribute('href'), { periode: mode === 'annuel' ? 'annee' : '' }));
      });
      scope.dispatchEvent(new CustomEvent('billing', { detail: mode }));
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-billing')); });
    });
    sw._set = set;
  });

  /* ---------- nom de domaine : saisie et vérification RDAP (configurateur et commande) ---------- */
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
  // Renvoie { get, full, statut, set, check, own }. onChange est appelé à chaque changement.
  function initDomain(root, onChange) {
    var input = $('[data-domain-name]', root), tld = $('[data-domain-tld]', root), out = $('[data-domain-result]', root);
    var checkBtn = $('[data-domain-check]', root), own = $('[data-domain-own]', root);
    var dom = { name: '', tld: '.fr', status: '' };
    var notify = function () { if (onChange) onChange(dom); };
    var clean = function (v) {
      v = (v || '').toLowerCase().trim();
      if (v.normalize) v = v.normalize('NFD').replace(/[̀-ͯ]/g, '');
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
      if (name.length < 2) { show('d-err', 'Écrivez au moins deux lettres, par exemple le nom de votre entreprise.'); notify(); return; }
      var full = name + tld.value;
      busy = true; checkBtn.disabled = true;
      show('d-wait', ICO.wait + 'Je regarde si ' + full + ' est libre…');
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
      fetch(RDAP[tld.value] + encodeURIComponent(full), { headers: { Accept: 'application/rdap+json' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (res.status === 404) {
            dom.status = 'libre';
            show('d-ok', ICO.ok + full + ' est disponible à l’instant. Je le réserve à la commande, à votre nom.');
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
        .then(function () { clearTimeout(timer); busy = false; checkBtn.disabled = false; notify(); });
    }
    var applyOwn = function () {
      [input, tld, checkBtn].forEach(function (el) { el.disabled = own.checked; });
      if (own.checked) { dom.status = 'mien'; show('d-ok', ICO.ok + 'Parfait, on gardera votre nom de domaine actuel.'); }
      else { dom.status = ''; out.innerHTML = ''; }
    };
    checkBtn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    input.addEventListener('input', function () { dom.name = clean(input.value); dom.tld = tld.value; if (dom.status) { dom.status = ''; out.innerHTML = ''; } notify(); });
    tld.addEventListener('change', function () { dom.tld = tld.value; if (input.value) check(); else notify(); });
    own.addEventListener('change', function () { applyOwn(); notify(); });
    return {
      get: function () { return dom; },
      own: function () { return own.checked; },
      // Nom complet (ma-boite.fr), vide si l'on garde son propre nom de domaine
      full: function () { return own.checked || !dom.name ? '' : dom.name + dom.tld; },
      // Statut pour l'adresse : libre | pris | mien | vide
      statut: function () { return own.checked ? 'mien' : (dom.status === 'libre' || dom.status === 'pris') ? dom.status : ''; },
      // Préremplissage depuis l'adresse (?domaine=ma-boite.fr&domaine_statut=libre)
      set: function (full, statut) {
        if (statut === 'mien') { own.checked = true; applyOwn(); notify(); return; }
        var name = clean(full || '');
        if (!name) { notify(); return; }
        input.value = name; dom.name = name; dom.tld = tld.value;
        check();
      },
      focus: function () { (own.checked ? own : input).focus(); }
    };
  }

  /* ---------- configurateur « Créer mon site » ---------- */
  var builder = $('[data-builder]');
  if (builder) {
    var bData;
    try { bData = JSON.parse(builder.getAttribute('data-builder')); } catch (e) { bData = null; }
    if (bData) initBuilder(builder, bData);
  }

  function initBuilder(box, data) {
    var find = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
    var val = function (name) { var r = $('input[name="' + name + '"]:checked', box); return r ? r.value : ''; };
    var setText = function (key, text) { $$('[data-sum="' + key + '"]', box).forEach(function (el) { el.textContent = text; }); };
    var params = new URLSearchParams(location.search);
    ['type', 'forfait'].forEach(function (k) {
      var v = params.get(k);
      var r = v && $('input[name="b-' + k + '"][value="' + slug(v) + '"]', box);
      if (r) r.checked = true;
    });
    var sw = $('[data-billing-switch]', box);
    if (/^ann/.test(params.get('periode') || '') && sw && sw._set) sw._set('annuel');
    var lp = params.get('lissage') === 'oui' ? '12' : (params.get('lissage') || '');
    if (lp) { var l = $('input[name="b-lisse"][value="' + slug(lp) + '"]', box); if (l) l.checked = true; }
    (params.get('options') || '').split(',').forEach(function (id) {
      var c = id && $('.b-opt input[value="' + slug(id) + '"]', box);
      if (c) c.checked = true;
    });
    var form = $('[data-builder-form]', box);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    var domain = initDomain(box, update);

    /* récapitulatif */
    function update(ev) {
      var t = find(data.types, val('b-type')) || data.types[0];
      var f = find(data.forfaits, val('b-forfait')) || data.forfaits[0];
      filterOpts(box, t.id);
      // site en plusieurs fois : le forfait se paie au mois (un clic sur « à l'année » repasse le site en une fois)
      var lisseN = parseInt(val('b-lisse'), 10) || 0;
      if (lisseN && box.getAttribute('data-billing') === 'annuel') {
        if (ev && ev.type === 'billing') { var one = $('input[name="b-lisse"][value="non"]', box); if (one) one.checked = true; lisseN = 0; }
        else if (sw && sw._set) { sw._set('mensuel'); return; }
      }
      var lnote = $('[data-lisse-note]', box);
      if (lnote) lnote.hidden = !lisseN;
      var annual = box.getAttribute('data-billing') === 'annuel';
      var mult = annual ? 12 - data.free : 1;
      var per = annual ? '/an' : '/mois';
      var month = f.month;
      var optOnce = 0, optMonth = 0, chosen = [], ids = [];
      $$('.b-opt input:checked', box).forEach(function (i) {
        var o = find(data.options, i.value);
        if (!o) return;
        chosen.push(o.name); ids.push(o.id); optOnce += o.once; optMonth += o.month;
      });
      setText('type', t.label);
      setText('type-price', euro(t.price));
      setText('forfait', 'Forfait ' + f.name);
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
      var dom = domain.get(), domText = '';
      if (domain.own()) domText = 'Mon nom de domaine actuel';
      else if (dom.name) domText = dom.name + dom.tld + (dom.status === 'libre' ? ' (disponible)' : dom.status === 'pris' ? ' (déjà pris)' : '');
      setText('domain', domText || 'Nom de domaine à choisir');
      var lisse = lisseN > 0;
      var acompte = round2(t.price * data.acompte / 100);
      var reste = round2(t.price - acompte);
      var lisseAmt = lisse ? floor2(reste / lisseN) : 0;
      var lisseLine = $('[data-sum-lisse]', box);
      if (lisseLine) lisseLine.hidden = !lisse;
      setText('lisse-label', 'Le reste en ' + lisseN + ' fois sans frais');
      setText('lisse', euro(lisseAmt) + per);
      var onceLine = $('[data-sum="once"]', box) && $('[data-sum="once"]', box).parentNode;
      if (onceLine) onceLine.hidden = false;
      setText('once-label', 'Création, une fois');
      setText('once', euro(t.price + optOnce));
      var recur = (month + optMonth) * mult;
      setText('recur-label', 'Forfait, dès la réception, par ' + (annual ? 'an' : 'mois'));
      setText('recur', euro(recur));
      // montant du jour, le même que sur /commander/ : l'acompte et les options payées une fois.
      // À la réception : le reste (en une fois ou lissé) et le forfait démarre.
      var today = round2(acompte + optOnce);
      setText('today', euro(today));
      var bar = $('[data-sum="bar"]', box);
      if (bar) {
        bar.innerHTML = 'Aujourd’hui <b>' + euro(today) + '</b>, à la réception <b>' + (lisse ? euro(lisseAmt) + '/mois × ' + lisseN : euro(reste)) + '</b> + forfait';
      }
      // Lien « Poser une question » (formulaire de contact, en clair)
      var q = { type: t.label, forfait: f.name, paiement: annual ? 'À l’année' : 'Au mois', lissage: lisse ? String(lisseN) : '', domaine: domText, options: chosen.join(', '), parrain: parrain };
      $$('[data-sum-go]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href'), q)); });
      // Lien « Commander » : paramètres exacts attendus par /commander/
      var o = { type: t.id, forfait: f.id, periode: annual ? 'annee' : 'mois', lissage: lisse ? String(lisseN) : '', domaine: domain.full(), domaine_statut: domain.statut(), options: ids.join(','), parrain: parrain };
      $$('[data-sum-order]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href').split('?')[0], o)); });
    }
    var pLine = $('[data-sum-parrain]', box);
    if (pLine && parrain) pLine.hidden = false;
    box.addEventListener('change', update);
    box.addEventListener('billing', update);
    update();
    if (params.get('domaine') || params.get('domaine_statut') === 'mien') domain.set(params.get('domaine'), params.get('domaine_statut'));

    /* barre du bas (téléphone) : cachée quand le récapitulatif complet est visible */
    var bar = $('[data-sum-bar]', box), sum = $('.b-sum', box);
    if (bar && sum && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { bar.classList.toggle('is-hidden', en.isIntersecting); });
      }, { threshold: 0.2 }).observe(sum);
    }
  }

  /* ---------- page Commander ---------- */
  var orderEl = $('[data-aled-order]');
  if (orderEl && orderEl.getAttribute('data-order-data')) {
    var oData;
    try { oData = JSON.parse(orderEl.getAttribute('data-order-data')); } catch (e) { oData = null; }
    if (oData) initOrder(orderEl, oData);
  }

  function initOrder(root, data) {
    var form = $('[data-order-form]', root);
    if (!form) return;
    var find = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
    var val = function (name) { var r = $('input[name="' + name + '"]:checked', form); return r ? r.value : ''; };
    var setText = function (key, text) { $$('[data-order="' + key + '"]', root).forEach(function (el) { el.textContent = text; }); };
    var params = new URLSearchParams(location.search);
    var t0 = form.querySelector('input[name="_t"]'); if (t0) t0.value = Date.now();

    /* messages d'erreur (?erreur=CODE, ?annule=1, ou vérification avant envoi) */
    var alertBox = $('[data-order-error]', root), tpl = $('template[data-order-errors]', root);
    var message = function (code) {
      var p = tpl && tpl.content.querySelector('[data-code="' + code + '"]');
      if (!p) p = tpl && tpl.content.querySelector('[data-code="inconnu"]');
      return p ? p.textContent : '';
    };
    var fieldError = null;
    var hideFieldError = function () { if (fieldError && fieldError.parentNode) fieldError.parentNode.removeChild(fieldError); fieldError = null; };
    /* Erreur renvoyée par le serveur (?erreur=…) : on montre l'alerte en tête du formulaire.
       Erreur de saisie repérée avant l'envoi : on va au champ fautif, avec le message juste à côté. */
    var showError = function (code, focusEl) {
      if (!alertBox) return;
      var msg = message(code);
      alertBox.textContent = msg;
      alertBox.hidden = false;
      hideFieldError();
      if (!focusEl) { alertBox.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      var wrap = focusEl.closest('.field, .check, .domain, .o-lisse') || focusEl.parentNode;
      fieldError = d.createElement('p');
      fieldError.className = 'field-error';
      fieldError.textContent = msg;
      if (wrap.classList.contains('field')) wrap.appendChild(fieldError);
      else wrap.parentNode.insertBefore(fieldError, wrap.nextSibling);
      wrap.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(function () { focusEl.focus({ preventScroll: true }); }, 350);
    };
    var hideError = function () { if (alertBox) alertBox.hidden = true; hideFieldError(); };
    var code = (params.get('erreur') || '').replace(/[^a-z]/g, '');
    if (code) showError(code);
    else if (params.get('annule') === '1') showError('annule');

    /* préremplissage depuis l'adresse */
    ['type', 'forfait', 'periode'].forEach(function (k) {
      var v = slug(params.get(k) || '');
      if (k === 'periode' && v === 'annuel') v = 'annee';
      var r = v && $('input[name="' + k + '"][value="' + v + '"]', form);
      if (r) r.checked = true;
    });
    var lpo = params.get('lissage') === 'oui' ? '12' : (params.get('lissage') || '');
    if (lpo) { var lr = $('input[name="lissage"][value="' + slug(lpo) + '"]', form); if (lr) lr.checked = true; }
    (params.get('options') || '').split(',').forEach(function (id) {
      var c = id && $('.b-opt input[value="' + slug(id) + '"]', form);
      if (c) c.checked = true;
    });
    var pInput = form.querySelector('input[name="parrain"]');
    if (pInput && !pInput.value) pInput.value = cleanCode(params.get('parrain')) || parrain;
    var pLine = $('[data-order-parrain]', root);
    var domain = initDomain(root, function () { update(true); });
    var hiddenDomain = $('[data-order-domaine]', form);
    var engRow = $('[data-order-engagement]', form), engBox = engRow && engRow.querySelector('input');

    function update(fromUser, ev) {
      var t = find(data.types, val('type')) || data.types[0];
      var f = find(data.forfaits, val('forfait')) || data.forfaits[0];
      filterOpts(form, t.id);
      // site en plusieurs fois : le forfait se paie au mois (choisir « à l'année » repasse le site en une fois)
      var lisseN = parseInt(val('lissage'), 10) || 0;
      if (lisseN && val('periode') === 'annee') {
        var target = ev && ev.target && ev.target.name;
        if (target === 'periode') { var one = $('input[name="lissage"][value=""]', form); if (one) one.checked = true; lisseN = 0; }
        else { var m = $('input[name="periode"][value="mois"]', form); if (m) m.checked = true; }
      }
      var lnote = $('[data-lisse-note]', form);
      if (lnote) lnote.hidden = !lisseN;
      var annual = val('periode') === 'annee';
      root.setAttribute('data-billing', annual ? 'annuel' : 'mensuel');
      var mult = annual ? 12 - data.free : 1;
      var per = annual ? '/an' : '/mois';
      var perWord = annual ? 'année' : 'mois';
      var perUnit = annual ? 'an' : 'mois';
      var lisse = lisseN > 0;
      setText('eng-n', String(lisseN || ''));
      if (engRow) { engRow.hidden = !lisse; }
      if (engBox) { engBox.required = lisse; if (!lisse) engBox.checked = false; }
      var optOnce = 0, optRec = 0, names = [], ids = [], lines = [];
      $$('.b-opt input:checked', form).forEach(function (i) {
        var o = find(data.options, i.value);
        if (!o) return;
        names.push(o.name); ids.push(o.id); optOnce += o.once; optRec += o.month * mult;
      });
      var acompte = round2(t.price * data.acompte / 100);
      var solde = round2(t.price - acompte);
      var lisseAmt = lisse ? floor2(solde / lisseN) : 0;
      var forfaitFirst = f.month * mult;
      // aujourd'hui : l'acompte et les options payées une fois ; le forfait démarre à la réception du site
      lines.push(['Acompte de ' + data.acompte + ' % sur la création (' + t.label.toLowerCase() + ')', acompte]);
      $$('.b-opt input:checked', form).forEach(function (i) {
        var o = find(data.options, i.value);
        if (o && o.once) lines.push([o.name, o.once]);
      });
      var today = round2(lines.reduce(function (s, l) { return s + l[1]; }, 0));
      var next = round2(forfaitFirst + optRec);
      setText('today', euro(today));
      setText('btn', euro(today));
      setText('next', lisse ? euro(lisseAmt) + ' × ' + lisseN + ' + ' + euro(next) + per : euro(solde) + ' + ' + euro(next) + per);
      setText('next-label', lisse ? 'À la réception : le reste en ' + lisseN + ' fois, et le forfait' : 'À la réception : le reste, et le forfait');
      if ($('[data-order="solde"]', root)) setText('solde', euro(solde));
      setText('lisse', euro(lisseAmt));
      setText('lisse-per', perUnit);
      setText('lisse-n', String(lisseN));
      var soldeNote = $('[data-order-solde]', root), lisseNote = $('[data-order-lisse-note]', root);
      if (soldeNote) soldeNote.hidden = lisse;
      if (lisseNote) lisseNote.hidden = !lisse;
      var ul = $('[data-order-lines]', root);
      if (ul) {
        ul.innerHTML = '';
        lines.forEach(function (l) {
          var li = d.createElement('li');
          li.innerHTML = '<span></span><b></b>';
          li.firstChild.textContent = l[0];
          li.lastChild.textContent = euro(l[1]);
          ul.appendChild(li);
        });
      }
      /* récapitulatif latéral */
      setText('type', t.label);
      setText('type-price', euro(t.price));
      setText('forfait', 'Forfait ' + f.name);
      setText('forfait-price', euro(forfaitFirst) + per);
      setText('delai', t.delai);
      var optLine = $('[data-order-opts]', root);
      if (optLine) {
        optLine.hidden = !names.length;
        setText('opts-label', names.length > 1 ? names.length + ' options' : (names[0] || 'Options'));
        var parts = [];
        if (optOnce) parts.push(euro(optOnce));
        if (optRec) parts.push(euro(optRec) + per);
        setText('opts', parts.join(' + '));
      }
      var dom = domain.get(), domText = '';
      if (domain.own()) domText = 'Mon nom de domaine actuel';
      else if (dom.name) domText = dom.name + dom.tld + (dom.status === 'libre' ? ' (disponible)' : dom.status === 'pris' ? ' (déjà pris)' : '');
      setText('domain', domText || 'Nom de domaine à choisir');
      if (hiddenDomain) hiddenDomain.value = domain.full();
      var pCode = pInput ? cleanCode(pInput.value) : parrain;
      if (pLine) pLine.hidden = !pCode;
      /* la configuration reste dans l'adresse (retour arrière, partage, erreur serveur) */
      if (fromUser && window.history && history.replaceState) {
        var q = new URLSearchParams(location.search);
        var o = { type: t.id, forfait: f.id, periode: annual ? 'annee' : 'mois', lissage: lisse ? String(lisseN) : '', domaine: domain.full(), domaine_statut: domain.statut(), options: ids.join(','), parrain: pCode };
        Object.keys(o).forEach(function (k) { if (o[k]) q.set(k, o[k]); else q.delete(k); });
        q.delete('erreur'); q.delete('annule');
        var qs = q.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
    }
    form.addEventListener('change', function (e) { update(true, e); });
    if (pInput) pInput.addEventListener('input', function () { update(true); });
    update(false);
    if (params.get('domaine') || params.get('domaine_statut') === 'mien') domain.set(params.get('domaine'), params.get('domaine_statut'));

    /* vérification avant envoi (le serveur revérifie tout) */
    form.addEventListener('submit', function (e) {
      hideError();
      update(false);
      if (!form.checkValidity()) {
        e.preventDefault();
        var bad = $$('input, textarea, select', form).filter(function (el) { return !el.disabled && !el.checkValidity(); })[0];
        var code = 'champs';
        if (bad) {
          if (bad.type === 'email' && bad.value) code = 'email';
          else if (bad.name === 'cgv' || bad.name === 'demarrage' || bad.name === 'engagement') code = bad.name;
        }
        showError(code, bad);
        return;
      }
      if (!domain.own() && domain.get().name.length < 2) {
        e.preventDefault();
        showError('domaine', $('[data-domain-name]', root));
        return;
      }
      var t = form.querySelector('input[name="_t"]'); if (t && !t.value) t.value = Date.now();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Un instant, je prépare le paiement…'; }
    });
  }

  /* ---------- page Commande confirmée ---------- */
  var refEl = $('[data-ref]');
  if (refEl) {
    var cp = new URLSearchParams(location.search);
    var ref = (cp.get('ref') || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
    if (ref) {
      refEl.textContent = ref;
      $$('[data-ref-box]').forEach(function (el) { el.hidden = false; });
    }
    if (cp.get('attente') === '1') {
      $$('[data-confirm-paid]').forEach(function (el) { el.hidden = true; });
      $$('[data-confirm-wait]').forEach(function (el) { el.hidden = false; });
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
    /* mise en ligne en cours : l'état se rafraîchit tout seul, sans recharger la page */
    var etat = $('[data-commande-etat][data-poll]', app);
    if (etat && window.fetch) {
      var every = Math.max(20, +etat.getAttribute('data-poll') || 60) * 1000, lastStatut = '';
      var refresh = function () {
        if (d.hidden) return;
        fetch(etat.getAttribute('data-url') + '?cid=' + encodeURIComponent(etat.getAttribute('data-cid')), { credentials: 'same-origin', headers: { 'X-WP-Nonce': etat.getAttribute('data-nonce') } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) {
            if (!j || !j.html) return;
            etat.innerHTML = j.html;
            if (lastStatut && j.statut !== lastStatut) toast(j.libelle || 'Nouvelle étape');
            lastStatut = j.statut;
            if (!j.auto) { clearInterval(timer); setTimeout(function () { location.reload(); }, 1500); }
          })
          .catch(function () {});
      };
      var timer = setInterval(refresh, every);
    }
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

    /* modifications restantes ce mois : le quota vient du forfait coché (data-jetons), deux demandes sont déjà faites dans la démo */
    var startPlan = $('input[name="app-plan"]:checked', app);
    var used = 2;
    var max = startPlan ? +startPlan.getAttribute('data-jetons') : 4, left = Math.max(0, max - used);
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
      used++; left = Math.max(0, max - used); drawJauge();
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
        max = +r.getAttribute('data-jetons'); left = Math.max(0, max - used);
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
    var pl = p.get('lissage') === 'oui' ? '12' : p.get('lissage');
    if (pl && /^\d+$/.test(pl)) intro.push('Je souhaite payer le site en ' + pl + ' fois.');
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
  if (/[?&]erreur=1(&|$)/.test(location.search)) {
    $$('[data-form-error]').forEach(function (el) { el.hidden = false; });
  }
})();
