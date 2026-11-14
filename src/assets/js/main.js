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
      setText('forfait', f.id === 'entretien' ? 'Entretien seul' : 'Entretien et forfait ' + f.name);
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
      setText('once', euro(t.price + optOnce));
      setText('recur-label', annual ? 'Puis chaque année' : 'Puis chaque mois');
      setText('recur', euro((month + optMonth) * mult));
      setText('recur-short', euro((month + optMonth) * mult) + per);
      var q = { type: t.label, forfait: f.name, paiement: annual ? 'À l’année' : 'Au mois', domaine: domText, options: chosen.join(', ') };
      $$('[data-sum-go]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href'), q)); });
    }
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

  /* ---------- démo de l'espace client ---------- */
  var appEl = $('[data-app]');
  if (appEl) initApp(appEl);

  function initApp(app) {
    var tpl = $('template[data-icons]', app), mtpl = $('template[data-monsters]', app);
    var ico = function (n) { var el = tpl && tpl.content.querySelector('[data-i="' + n + '"]'); return el ? el.innerHTML : ''; };
    var toastEl = $('[data-toast]', app), toastTimer;
    var toast = function (msg) {
      toastEl.textContent = msg; toastEl.hidden = false;
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2800);
    };

    /* onglets */
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
      var main = $('.app-main', app);
      var top = main.getBoundingClientRect().top;
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
    var startTab = new URLSearchParams(location.search).get('outil');
    if (startTab && $('[data-tab="' + startTab.replace(/[^a-z]/g, '') + '"]', app)) show(startTab.replace(/[^a-z]/g, ''));
    $$('[data-toast-msg]', app).forEach(function (b) { b.addEventListener('click', function () { toast(b.getAttribute('data-toast-msg')); }); });

    /* journal */
    var log = $('[data-log]', app);
    var addLog = function (ic, text) {
      if (!log) return;
      var li = d.createElement('li');
      li.innerHTML = ico(ic) + '<span></span><small>à l’instant</small>';
      li.querySelector('span').textContent = text;
      log.insertBefore(li, log.firstChild);
    };

    /* jetons IA */
    var jetons = 7, max = 10;
    var recharge = +app.getAttribute('data-recharge') || 10, rechargePrice = app.getAttribute('data-recharge-price') || '5';
    var jauge = $('[data-jauge]', app);
    var drawJauge = function () {
      $('[data-jetons]', app).textContent = jetons;
      var cap = Math.max(max, jetons);
      $('[data-jetons-max]', app).textContent = cap;
      $('[data-jauge-fill]', app).style.width = (cap ? jetons / cap * 100 : 0) + '%';
      jauge.classList.toggle('is-low', jetons <= 2);
    };
    var useJeton = function () {
      if (jetons <= 0) { toast('Plus de jetons ce mois-ci : rechargez ou changez de forfait'); return false; }
      jetons--; drawJauge();
      if (jetons === 0) setTimeout(function () { toast('C’était votre dernier jeton du mois. Vous pouvez recharger en un clic.'); }, 1500);
      return true;
    };
    $('[data-recharger]', app).addEventListener('click', function () {
      jetons += recharge; drawJauge();
      toast('+' + recharge + ' jetons pour ' + rechargePrice + ' \u20ac (démo, rien n’est payé)');
      addLog('coins', 'Recharge de ' + recharge + ' jetons');
    });
    drawJauge();

    /* modifier le site */
    var chatLog = $('[data-chat-log]', app), chatForm = $('[data-chat-form]', app), chatIn = $('#chat-in', app);
    var versions = $('[data-versions]', app);
    var bubble = function (cls, html) {
      var el = d.createElement('div');
      el.className = 'bubble ' + cls;
      if (html) el.innerHTML = html;
      chatLog.appendChild(el);
      chatLog.scrollTop = chatLog.scrollHeight;
      return el;
    };
    var say = function (cls, text) { var el = bubble(cls, ''); el.textContent = text; chatLog.scrollTop = chatLog.scrollHeight; return el; };
    var understand = function (text) {
      var t = text.toLowerCase();
      if (/ferm|horaire|ouvert|heure|lundi|dimanche/.test(t)) return { what: 'vos horaires', page: 'Accueil', hl: text.length > 42 ? 'Horaires mis à jour' : text.replace(/[.!]+$/, ''), photo: false };
      if (/photo|image|vitrine/.test(t)) return { what: 'la photo du haut de page', page: 'Accueil', hl: 'Nouvelle photo', photo: true };
      var price = t.match(/(\d+(?:[.,]\d+)?)\s?\u20ac/);
      if (price || /prix|tarif|produit|carte|ajoute/.test(t)) return { what: 'votre carte', page: 'Carte', hl: price ? 'Nouveau : ' + price[1] + ' \u20ac' : 'Carte mise à jour', photo: false };
      return { what: 'le texte demandé', page: 'Accueil', hl: 'Texte mis à jour', photo: false };
    };
    var addVersion = function () {
      var first = versions.firstElementChild;
      if (first) first.innerHTML = '<span>' + ico('history') + 'Version précédente</span><button type="button" class="link-btn" data-restore>Restaurer</button>';
      var li = d.createElement('li');
      li.innerHTML = '<span>' + ico('circle-check') + 'Version actuelle</span><small>à l’instant</small>';
      versions.insertBefore(li, versions.firstChild);
    };
    versions.addEventListener('click', function (e) {
      if (e.target.closest('[data-restore]')) toast('Version restaurée, sans jeton (démo)');
    });
    var send = function (text) {
      text = (text || '').trim();
      if (!text) return;
      chatIn.value = '';
      say('me', text);
      var typing = bubble('ai typing', '<i></i><i></i><i></i>');
      setTimeout(function () {
        typing.remove();
        var p = understand(text);
        var b = bubble('ai', '<p></p><div class="mini-site"><i class="ms-photo' + (p.photo ? ' new' : '') + '"></i><i class="ms-line"></i><i class="ms-line short"></i><span class="ms-hl"></span></div><div class="bubble-actions"><button type="button" class="pill pill-go">' + ico('check') + 'Publier (1 jeton)</button><button type="button" class="pill">' + ico('undo-2') + 'Annuler</button></div>');
        b.querySelector('p').textContent = 'C’est prêt ! J’ai préparé ' + p.what + ' sur la page ' + p.page + '. Voici l’aperçu :';
        b.querySelector('.ms-hl').textContent = p.hl;
        var btns = b.querySelectorAll('button');
        var done = function () { btns[0].disabled = true; btns[1].disabled = true; };
        btns[0].addEventListener('click', function () {
          if (!useJeton()) return;
          done();
          say('ai', 'Publié ! Votre site est à jour.');
          addVersion();
          addLog('check', 'Site modifié : ' + p.what);
          toast('Modification publiée (démo)');
        });
        btns[1].addEventListener('click', function () { done(); say('ai', 'D’accord, je n’ai rien changé. Aucun jeton utilisé.'); });
      }, 1100);
    };
    chatForm.addEventListener('submit', function (e) { e.preventDefault(); send(chatIn.value); });
    $$('[data-say]', app).forEach(function (b) { b.addEventListener('click', function () { send(b.getAttribute('data-say')); }); });

    /* publier sur les réseaux */
    var pub = $('[data-pub]', app), file = $('[data-pub-file]', app), img = $('[data-pub-img]', app);
    var out = $('[data-pub-out]', app), posts = $('[data-posts]', app), desc = $('[data-pub-desc]', app);
    var NETS = {
      instagram: { name: 'Instagram', icon: 'camera', ratio: 'r-1', fmt: 'Carré' },
      facebook: { name: 'Facebook', icon: 'thumbs-up', ratio: 'r-191', fmt: 'Paysage' },
      google: { name: 'Fiche Google', icon: 'map-pin', ratio: 'r-43', fmt: '4:3' }
    };
    var STOP = ['avec', 'pour', 'dans', 'nous', 'notre', 'votre', 'vous', 'cette', 'plus', 'tout', 'tous', 'toute', 'toutes', 'chez', 'week', 'weekend', 'nouvelle', 'nouveau', 'nouvelles', 'nouveaux', 'aussi', 'sont', 'vient', 'arrive'];
    var hashtags = function (text) {
      var t = text.toLowerCase();
      if (t.normalize) t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var seen = [];
      t.split(/[^a-z0-9]+/).forEach(function (w) { if (w.length > 3 && STOP.indexOf(w) < 0 && seen.indexOf(w) < 0) seen.push(w); });
      return seen.slice(0, 3).concat(['patisserie', 'rethel', 'faitmaison']).slice(0, 5).map(function (w) { return '#' + w; }).join(' ');
    };
    var textFor = function (net, text) {
      var base = text.trim().replace(/[.!\s]+$/, '');
      if (net === 'instagram') return base + ' !\n\nPassez nous voir, on vous attend.\n\n' + hashtags(base);
      if (net === 'facebook') return base + ' ! C’est à découvrir en boutique dès maintenant. Une question, une réservation ? Écrivez-nous en message privé.';
      return base + '. À découvrir chez Pâtisserie Lila, 12 rue des Lilas à Rethel.';
    };
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      if (img._url) URL.revokeObjectURL(img._url);
      img._url = URL.createObjectURL(f);
      img.src = img._url;
      if (!out.hidden) build();
    });
    var build = function () {
      var nets = $$('.pub-nets input:checked', app).map(function (i) { return i.value; });
      if (!nets.length) { toast('Choisissez au moins un réseau'); return false; }
      var text = desc.value.trim() || 'Notre nouveauté du moment';
      posts.innerHTML = '';
      nets.forEach(function (n) {
        var c = NETS[n], el = d.createElement('article');
        el.className = 'post';
        el.innerHTML = '<p class="post-head">' + ico(c.icon) + c.name + '<small>' + c.fmt + '</small></p><img class="post-img ' + c.ratio + '" alt=""><p class="post-text" contenteditable="true" spellcheck="true"></p>' + (n === 'google' ? '<span class="post-cta">En savoir plus</span>' : '');
        el.querySelector('img').src = img.src;
        var pt = el.querySelector('.post-text');
        pt.textContent = textFor(n, text);
        pt.setAttribute('aria-label', 'Texte pour ' + c.name);
        posts.appendChild(el);
      });
      out.hidden = false;
      return true;
    };
    pub.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = pub.querySelector('button[type="submit"]'), span = btn.querySelector('span'), label = span.textContent;
      btn.disabled = true; span.textContent = 'L’IA prépare vos textes…';
      setTimeout(function () {
        btn.disabled = false; span.textContent = label;
        if (build()) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 900);
    });
    $('[data-pub-send]', app).addEventListener('click', function () {
      if (!useJeton()) return;
      var n = posts.children.length;
      toast('Publié sur ' + n + (n > 1 ? ' réseaux' : ' réseau') + ' (démo : rien n’est parti)');
      addLog('send', '« ' + (desc.value.trim().slice(0, 40) || 'Publication') + ' » publiée');
    });
    $('[data-pub-plan]', app).addEventListener('click', function () { toast('Programmé pour demain à 18 h (démo)'); });

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
        max = +r.getAttribute('data-jetons');
        drawJauge(); recompute();
        toast(r.getAttribute('data-name') + ' choisi : ' + (max ? max + ' jetons par mois' : 'sans jetons, recharge possible') + ' (démo)');
      });
    });
    $$('.app-opt input', app).forEach(function (c) {
      c.addEventListener('change', function () {
        recompute();
        var name = c.closest('.app-opt').querySelector('strong').textContent;
        toast((c.checked ? 'Option ajoutée : ' : 'Option retirée : ') + name + ' (démo)');
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
    var dom = p.get('domaine'), domInput = f.querySelector('input[name="domaine"]');
    if (dom && domInput) domInput.value = dom;
    var opts = p.get('options'), msg = f.querySelector('textarea[name="message"]');
    if (opts && msg && !msg.value) msg.value = 'Options choisies : ' + opts + '.\n\n';
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
