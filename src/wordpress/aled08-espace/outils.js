/* Alex & Lia Espace client : l'onglet « Outils » (outils de Lia, Jetons Lia) et le prix d'une demande par Lia. */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function jetons(n) { return n + ' jeton' + (n > 1 ? 's' : ''); }
  function copier(txt, fini) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(fini, fini);
    else { var t = el('textarea'); t.value = txt; d.body.appendChild(t); t.select(); try { d.execCommand('copy'); } catch (e) {} d.body.removeChild(t); fini(); }
  }

  /* ---------- prix d'une demande par Lia, calculé pendant que le client écrit ---------- */
  var est = $('[data-jl-estime]');
  if (est) {
    var form = est.closest('form'), txt = $('textarea[name="demande"]', form), file = $('[data-req-file]', form), out = $('[data-jl-prix]', est);
    var base = +est.getAttribute('data-base'), parMots = +est.getAttribute('data-mots') || 10, parImage = +est.getAttribute('data-image'), solde = +est.getAttribute('data-solde');
    var calc = function () {
      var mots = Math.max((txt.value.trim().match(/\S+/g) || []).length, Math.ceil(txt.value.trim().length / 6));
      var photos = file && file.files ? Math.min(3, file.files.length) : 0;
      var prix = base + Math.ceil(mots / parMots) + parImage * photos;
      out.textContent = prix;
      est.classList.toggle('is-trop', prix > solde);
      var lia = $('input[name="par"][value="lia"]', form);
      est.hidden = !!(lia && !lia.checked);
    };
    txt.addEventListener('input', calc);
    if (file) file.addEventListener('change', calc);
    $$('input[name="par"]', form).forEach(function (r) { r.addEventListener('change', calc); });
    calc();
  }

  /* ---------- les outils ---------- */
  var grille = $('[data-outils]');
  if (!grille) return;
  var ajax = grille.getAttribute('data-ajax'), nonce = grille.getAttribute('data-nonce');
  var panneaux = $$('[data-ol]');
  function ouvrir(id) {
    panneaux.forEach(function (p) { p.hidden = p.getAttribute('data-ol') !== id; });
    $$('[data-ol-ouvrir]', grille).forEach(function (b) { var on = b.getAttribute('data-ol-ouvrir') === id; b.setAttribute('aria-expanded', on ? 'true' : 'false'); b.classList.toggle('is-on', on); });
    var p = id && d.getElementById('ol-' + id);
    if (p) { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = $('input:not([type=hidden]):not([type=file]), textarea, select', p); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350); }
  }
  $$('[data-ol-ouvrir]', grille).forEach(function (b) {
    b.addEventListener('click', function () { ouvrir(b.getAttribute('aria-expanded') === 'true' ? '' : b.getAttribute('data-ol-ouvrir')); });
  });
  /* les familles d'outils : un bouton par famille, « Tous » pour tout revoir */
  $$('[data-ol-filtre]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-ol-filtre');
      $$('[data-ol-filtre]').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $$('[data-ol-ouvrir]', grille).forEach(function (c) { c.hidden = !!cat && c.getAttribute('data-cat') !== cat; });
      ouvrir('');
    });
  });
  $$('[data-ol-fermer]').forEach(function (b) { b.addEventListener('click', function () { ouvrir(''); grille.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }); });
  /* un texte trop long n'est jamais coupé : le compteur prévient, et l'envoi est refusé */
  $$('textarea[data-max]').forEach(function (t) {
    var c = $('[data-ol-compte]', t.parentNode), max = +t.getAttribute('data-max');
    var maj = function () {
      var n = t.value.length;
      if (!c) return;
      c.textContent = n > max * 0.6 || n > max ? n + ' sur ' + max + ' caractères' + (n > max ? ' : c’est trop long, coupez votre texte en deux.' : '') : '';
      c.classList.toggle('is-trop', n > max);
    };
    t.addEventListener('input', maj); maj();
  });
  function tropLong(form) {
    var t = $$('textarea[data-max]', form).filter(function (x) { return x.value.length > +x.getAttribute('data-max'); })[0];
    return t ? 'Votre texte fait ' + t.value.length + ' caractères. Cet outil en prend ' + t.getAttribute('data-max') + '. Coupez-le en deux, puis relancez.' : '';
  }
  $$('[data-ol-file]').forEach(function (i) {
    var nom = $('[data-ol-file-name]', i.parentNode), depart = nom.textContent;
    i.addEventListener('change', function () { nom.textContent = i.files && i.files[0] ? i.files[0].name : depart; });
  });

  /* où coller le texte : chaque réseau s'ouvre sur sa page pour publier */
  var RESEAUX = {
    'facebook': ['Facebook', function () { return 'https://www.facebook.com/'; }],
    'instagram': ['Instagram', function () { return 'https://www.instagram.com/'; }],
    'linkedin': ['LinkedIn', function (t) { return 'https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(t); }],
    'x': ['X', function (t) { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(t); }],
    'fiche google': ['Google', function () { return 'https://business.google.com/'; }],
    'tiktok': ['TikTok', function () { return 'https://www.tiktok.com/upload'; }],
    'bluesky': ['Bluesky', function (t) { return 'https://bsky.app/intent/compose?text=' + encodeURIComponent(t); }],
    'mastodon': ['Mastodon', function (t) { return 'https://mastodon.social/share?text=' + encodeURIComponent(t); }]
  };
  function poster(donnees) {
    var fd = new FormData();
    Object.keys(donnees).forEach(function (k) { if (donnees[k] != null) fd.append(k, donnees[k]); });
    fd.append('_aled08e_jl', nonce);
    return fetch(ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return { success: false, data: { message: 'Réponse illisible. Réessayez.' } }; }); });
  }
  var LIMITES_RESEAUX = { 'x': 280, 'bluesky': 300, 'mastodon': 500 };
  function bloc(b, partage, image, relies, limites) {
    var c = el('div', 'ol-bloc');
    var tete = el('div', 'ol-bloc-tete');
    tete.appendChild(el('strong', '', b.titre || 'Texte'));
    var compte = el('small', '', '');
    tete.appendChild(compte);
    c.appendChild(tete);
    var ta = el('textarea');
    ta.value = b.texte; ta.rows = Math.min(12, Math.max(3, Math.ceil(b.texte.length / 60) + (b.texte.match(/\n/g) || []).length));
    ta.setAttribute('aria-label', b.titre || 'Texte');
    var limite = (limites && limites[b.titre]) || (partage && LIMITES_RESEAUX[(b.titre || '').toLowerCase()]) || 0;
    var maj = function () {
      compte.textContent = ta.value.length + (limite ? ' sur ' + limite : '') + ' caractères';
      compte.classList.toggle('is-trop', !!limite && ta.value.length > limite);
    };
    ta.addEventListener('input', maj); maj();
    c.appendChild(ta);
    var actions = el('div', 'ol-bloc-actions');
    var msg = el('span', 'ol-bloc-msg'); msg.setAttribute('role', 'status');
    var dire = function (t) { msg.textContent = t; setTimeout(function () { if (msg.textContent === t) msg.textContent = ''; }, 5000); };
    var bc = el('button', 'btn btn-light btn-sm', 'Copier'); bc.type = 'button';
    bc.addEventListener('click', function () { copier(ta.value, function () { dire('Copié.'); }); });
    actions.appendChild(bc);
    var cle = (b.titre || '').toLowerCase();
    var r = partage && RESEAUX[cle];
    if (r && relies && relies.indexOf(cle) !== -1) {
      /* compte relié : la publication part directement */
      var bd = el('button', 'btn btn-primary btn-sm', 'Publier sur ' + r[0]); bd.type = 'button';
      bd.setAttribute('data-ol-publier', cle);
      c.publier = function () {
        if (bd.disabled) return Promise.resolve();
        if (cle === 'instagram' && !image) { msg.className = 'ol-bloc-msg is-err'; msg.textContent = 'Instagram demande une photo : ajoutez-en une en haut.'; return Promise.resolve(); }
        bd.disabled = true; msg.className = 'ol-bloc-msg'; msg.textContent = 'Publication en cours…';
        return poster({ action: 'aled08e_publier', reseau: cle, texte: ta.value, image: image }).then(function (j) {
          if (!j || !j.success) { bd.disabled = false; msg.className = 'ol-bloc-msg is-err'; msg.textContent = (j && j.data && j.data.message) || 'La publication n’est pas partie. Réessayez.'; return; }
          msg.className = 'ol-bloc-msg'; msg.textContent = 'Publié. ';
          var a = el('a', '', 'Voir la publication'); a.href = j.data.url; a.target = '_blank'; a.rel = 'noopener';
          msg.appendChild(a);
          bd.textContent = 'Publié'; c.classList.add('is-publie');
        }, function () { bd.disabled = false; msg.className = 'ol-bloc-msg is-err'; msg.textContent = 'La connexion a coupé. Réessayez.'; });
      };
      bd.addEventListener('click', c.publier);
      actions.appendChild(bd);
    } else if (r) {
      var bo = el('button', 'btn btn-primary btn-sm', 'Publier sur ' + r[0]); bo.type = 'button';
      bo.addEventListener('click', function () {
        var url = r[1](ta.value);
        copier(ta.value, function () { dire('Texte copié : collez-le dans ' + r[0] + (image ? ', puis ajoutez votre photo.' : '.')); });
        window.open(url, '_blank', 'noopener');
      });
      actions.appendChild(bo);
      if (navigator.share) {
        var bp = el('button', 'btn btn-light btn-sm', 'Partager'); bp.type = 'button';
        bp.addEventListener('click', function () {
          var data = { text: ta.value };
          if (image && navigator.canShare && navigator.canShare({ files: [image] })) data.files = [image];
          navigator.share(data).catch(function () {});
        });
        actions.appendChild(bp);
      }
    }
    actions.appendChild(msg);
    c.appendChild(actions);
    return c;
  }

  function afficher(res, blocs, image) {
    var partage = res.hasAttribute('data-partage'), relies = [], limites = {}, note = res.getAttribute('data-note');
    try { relies = JSON.parse(res.getAttribute('data-relies') || '[]'); } catch (e) {}
    try { limites = JSON.parse(res.getAttribute('data-limites') || '{}'); } catch (e) {}
    res.innerHTML = '';
    var directs = blocs.filter(function (b) { return relies.indexOf((b.titre || '').toLowerCase()) !== -1; }).length;
    res.appendChild(el('p', 'app-note', !partage ? (note || 'Relisez, changez ce que vous voulez, puis copiez.') : directs ? 'Relisez, changez ce que vous voulez, puis publiez. Sur vos comptes reliés, la publication part directement.' : 'Relisez, changez ce que vous voulez, puis publiez : le texte est copié, le réseau s’ouvre, il reste à coller.'));
    var cartes = blocs.map(function (b) { var c = bloc(b, partage, image, relies, limites); res.appendChild(c); return c; });
    if (directs > 1) {
      var tout = el('button', 'btn btn-primary', 'Tout publier sur mes ' + directs + ' comptes reliés'); tout.type = 'button';
      tout.addEventListener('click', function () {
        tout.disabled = true;
        cartes.filter(function (c) { return c.publier; }).reduce(function (p, c) { return p.then(c.publier); }, Promise.resolve()).then(function () { tout.textContent = 'C’est parti'; });
      });
      res.insertBefore(tout, res.children[1]);
    }
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $$('[data-ol-form]').forEach(function (form) {
    var sec = form.closest('[data-ol]'), res = $('[data-ol-resultat]', sec), etat = $('[data-ol-etat]', form), btn = $('button[type=submit]', form);
    var direct = $('[data-ol-direct]', form);
    if (direct) direct.addEventListener('click', function () {
      var t = $('textarea[name="c_description"]', form), texte = t.value.trim();
      if (!texte) { etat.className = 'ol-etat is-err'; etat.textContent = 'Écrivez d’abord votre texte.'; t.focus(); return; }
      var choisis = $$('input[name="c_reseaux[]"]:checked', form).map(function (i) { return i.value; });
      if (!choisis.length) { etat.className = 'ol-etat is-err'; etat.textContent = 'Cochez au moins un réseau.'; return; }
      var fi = $('[data-ol-file]', form);
      etat.className = 'ol-etat'; etat.textContent = '';
      afficher(res, choisis.map(function (n) { return { titre: n, texte: texte }; }), fi && fi.files && fi.files[0] ? fi.files[0] : null);
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (btn.disabled) return;
      var long = tropLong(form), fq = $('[data-ol-file][data-requis]', form);
      if (long) { etat.className = 'ol-etat is-err'; etat.textContent = long; return; }
      if (fq && !(fq.files && fq.files[0])) { etat.className = 'ol-etat is-err'; etat.textContent = 'Il manque : votre photo.'; return; }
      var debut = Date.now();
      var reussi = function (data) {
          btn.disabled = false; form.classList.remove('is-busy');
          etat.className = 'ol-etat is-ok';
          etat.textContent = data.illimite ? 'C’est prêt.' : 'C’est prêt. ' + jetons(data.jetons) + ' utilisé' + (data.jetons > 1 ? 's' : '') + ', il vous en reste ' + data.solde + '.';
          var s = $('[data-jl-solde]'); if (s && !data.illimite) s.textContent = data.solde;
          var vz = $('[data-visuel]', sec);
          if (vz && vz.remplir) { vz.remplir(data.blocs); res.hidden = true; }
          else afficher(res, data.blocs, image);
      };
      var fd = new FormData(form);
      fd.append('action', 'aled08e_outil');
      fd.append('_aled08e_jl', nonce);
      var fi = $('[data-ol-file]', form), image = fi && fi.files && fi.files[0] ? fi.files[0] : null;
      btn.disabled = true; form.classList.add('is-busy');
      etat.className = 'ol-etat'; etat.textContent = 'Lia écrit… quelques secondes.';
      fetch(ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return { success: false, data: { message: 'Réponse illisible. Réessayez.' } }; }); })
        .then(function (j) {
          if (!j || !j.success) { btn.disabled = false; form.classList.remove('is-busy'); etat.className = 'ol-etat is-err'; etat.textContent = (j && j.data && j.data.message) || 'Lia n’a pas pu répondre. Réessayez.'; return; }
          reussi(j.data);
        })
        .catch(function () {
          /* la connexion a coupé, mais Lia a peut-être fini : on revient chercher son résultat (4 essais sur une minute) */
          etat.className = 'ol-etat'; etat.textContent = 'La connexion a coupé. Je regarde si Lia a fini…';
          var essais = 0, outil = fd.get('outil');
          var revoir = function () {
            essais++;
            poster({ action: 'aled08e_outil_dernier', outil: outil, il_y_a: Math.ceil((Date.now() - debut) / 1000) + 5 }).then(function (j) {
              if (j && j.success) { reussi(j.data); return; }
              if (essais < 4) { setTimeout(revoir, 15000); return; }
              btn.disabled = false; form.classList.remove('is-busy'); etat.className = 'ol-etat is-err';
              etat.textContent = 'La connexion a coupé avant la réponse. Regardez votre solde en rechargeant la page : si des jetons ont été comptés, écrivez à Alex.';
            }, function () { if (essais < 4) setTimeout(revoir, 15000); else { btn.disabled = false; form.classList.remove('is-busy'); etat.className = 'ol-etat is-err'; etat.textContent = 'Pas de connexion. Réessayez quand le réseau est revenu.'; } });
          };
          setTimeout(revoir, 8000);
        });
    });
  });

  /* ---------- mes réseaux : relier, délier, choisir sa page ---------- */
  var revenir = function () { try { sessionStorage.setItem('aled08-ol', 'publier'); } catch (e) {} location.hash = 'outils'; location.reload(); };
  $$('[data-rs-relier]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var et = $('[data-rs-etat]', f), b = $('button[type=submit]', f), d2 = { action: 'aled08e_rs', op: 'relier', reseau: f.getAttribute('data-rs-relier') };
      $$('input', f).forEach(function (i) { d2[i.name] = i.value; });
      b.disabled = true; et.className = 'ol-etat'; et.textContent = 'Vérification…';
      poster(d2).then(function (j) {
        if (j && j.success) { et.className = 'ol-etat is-ok'; et.textContent = j.data.message; revenir(); return; }
        b.disabled = false; et.className = 'ol-etat is-err'; et.textContent = (j && j.data && j.data.message) || 'La liaison n’a pas marché. Réessayez.';
      }, function () { b.disabled = false; et.className = 'ol-etat is-err'; et.textContent = 'La connexion a coupé. Réessayez.'; });
    });
  });
  $$('[data-rs-delier]').forEach(function (b) {
    b.addEventListener('click', function () { b.disabled = true; poster({ action: 'aled08e_rs', op: 'delier', reseau: b.getAttribute('data-rs-delier') }).then(revenir, revenir); });
  });
  var selPage = $('[data-rs-page]');
  if (selPage) selPage.addEventListener('change', function () { poster({ action: 'aled08e_rs', op: 'page', page: selPage.value }).then(revenir, revenir); });
  /* retour d'une liaison : l'outil se rouvre tout seul */
  var rouvrir = new URLSearchParams(location.search).get('ol');
  try { rouvrir = rouvrir || sessionStorage.getItem('aled08-ol'); sessionStorage.removeItem('aled08-ol'); } catch (e) {}
  if (rouvrir && d.getElementById('ol-' + rouvrir)) setTimeout(function () { ouvrir(rouvrir); }, 400);

  /* ---------- visuel d'annonce : un texte sur une couleur ou sur une photo, dessiné dans le navigateur ---------- */
  $$('[data-visuel]').forEach(function (vz) {
    var cv = $('[data-v-canvas]', vz), ctx = cv.getContext('2d'), dl = $('[data-v-dl]', vz), photo = null;
    var champ = function (n) { return $('[data-v-' + n + ']', vz); };
    var choix = function (n) { var c = $('input[name="v-' + n + '"]:checked', vz); return c ? c.value : ''; };
    var FORMATS = { carre: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920] };
    var COULEURS = {
      rose: ['#FFD9E7', '#A3305F'], lilas: ['#E8E0FF', '#5B3FC4'], menthe: ['#D5F5E8', '#176A4C'], peche: ['#FFE4D6', '#9C4220'],
      ciel: ['#DDEEFF', '#2C67AE'], beurre: ['#FFF1C2', '#7A5600'], sombre: ['#2E2A47', '#FFFFFF'], blanc: ['#FFFFFF', '#2E2A47']
    };
    var police = function (px, gras) { return (gras ? '800 ' : '600 ') + px + 'px "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'; };
    /* coupe un texte en lignes qui tiennent dans la largeur */
    var lignes = function (txt, px, gras, larg) {
      ctx.font = police(px, gras);
      var out = [];
      String(txt).split('\n').forEach(function (par) {
        var l = '';
        par.split(/\s+/).forEach(function (mot) {
          var essai = l ? l + ' ' + mot : mot;
          if (l && ctx.measureText(essai).width > larg) { out.push(l); l = mot; } else l = essai;
        });
        if (l) out.push(l);
      });
      return out;
    };
    var dessiner = function () {
      var F = FORMATS[choix('format')] || FORMATS.carre, W = F[0], H = F[1];
      var C = COULEURS[choix('couleur')] || COULEURS.rose, titre = champ('titre').value.trim(), sous = champ('sous').value.trim(), pied = champ('pied').value.trim();
      cv.width = W; cv.height = H;
      var encre = C[1], marge = 90, larg = W - marge * 2;
      if (photo) {
        var k = Math.max(W / photo.width, H / photo.height), w = photo.width * k, h = photo.height * k;
        ctx.drawImage(photo, (W - w) / 2, (H - h) / 2, w, h);
        /* un voile sombre pour que le texte se lise sur n'importe quelle photo */
        var place = choix('place') || 'bas', g = ctx.createLinearGradient(0, 0, 0, H);
        if (place === 'haut') { g.addColorStop(0, 'rgba(20,18,36,.78)'); g.addColorStop(.6, 'rgba(20,18,36,.12)'); g.addColorStop(1, 'rgba(20,18,36,.35)'); }
        else if (place === 'milieu') { g.addColorStop(0, 'rgba(20,18,36,.5)'); g.addColorStop(1, 'rgba(20,18,36,.5)'); }
        else { g.addColorStop(0, 'rgba(20,18,36,.2)'); g.addColorStop(.4, 'rgba(20,18,36,.12)'); g.addColorStop(1, 'rgba(20,18,36,.8)'); }
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        encre = '#FFFFFF';
      } else {
        ctx.fillStyle = C[0]; ctx.fillRect(0, 0, W, H);
        /* deux ronds doux, pour un fond moins plat */
        ctx.globalAlpha = .1; ctx.fillStyle = C[1];
        ctx.beginPath(); ctx.arc(W * .92, H * .08, W * .28, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W * .05, H * .97, W * .22, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
      /* le titre : aussi grand que possible, sur 4 lignes au plus */
      var px = 150, lt = [];
      for (; px >= 54; px -= 6) { lt = lignes(titre || 'Votre titre', px, true, larg); var large = lt.some(function (l) { ctx.font = police(px, true); return ctx.measureText(l).width > larg; }); if (lt.length <= 4 && !large) break; }
      var pxs = Math.max(40, Math.round(px * .42)), ls = sous ? lignes(sous, pxs, false, larg).slice(0, 4) : [];
      var hTitre = lt.length * px * 1.12, hSous = ls.length ? ls.length * pxs * 1.35 + px * .35 : 0, bloc = hTitre + hSous;
      var p = choix('place') || 'milieu', basLibre = pied ? 150 : 90;
      var y = p === 'haut' ? marge + 40 : p === 'bas' ? H - basLibre - bloc : (H - bloc) / 2 - (pied ? 20 : 0);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = encre;
      ctx.font = police(px, true);
      lt.forEach(function (l, i) { ctx.fillText(l, W / 2, y + i * px * 1.12); });
      if (ls.length) {
        ctx.font = police(pxs, false); ctx.globalAlpha = .92;
        ls.forEach(function (l, i) { ctx.fillText(l, W / 2, y + hTitre + px * .35 + i * pxs * 1.35); });
        ctx.globalAlpha = 1;
      }
      if (pied) {
        ctx.font = police(34, true);
        var wp = Math.min(larg, ctx.measureText(pied).width + 64), hp = 68, xp = (W - wp) / 2, yp = H - 60 - hp, r = hp / 2;
        ctx.fillStyle = photo ? 'rgba(255,255,255,.92)' : encre;
        ctx.beginPath(); ctx.moveTo(xp + r, yp); ctx.arcTo(xp + wp, yp, xp + wp, yp + hp, r); ctx.arcTo(xp + wp, yp + hp, xp, yp + hp, r); ctx.arcTo(xp, yp + hp, xp, yp, r); ctx.arcTo(xp, yp, xp + wp, yp, r); ctx.closePath(); ctx.fill();
        ctx.fillStyle = photo ? '#2E2A47' : C[0]; ctx.textBaseline = 'middle';
        ctx.fillText(pied, W / 2, yp + hp / 2 + 2, wp - 40);
      }
      try { dl.href = cv.toDataURL('image/jpeg', .92); dl.download = 'annonce-' + W + 'x' + H + '.jpg'; } catch (e) {}
    };
    var redessiner = function () { if (d.fonts && d.fonts.ready) d.fonts.ready.then(dessiner); else dessiner(); };
    $$('input, textarea', vz).forEach(function (i) { if (i.type !== 'file') i.addEventListener(i.type === 'radio' ? 'change' : 'input', dessiner); });
    var fp = $('[data-v-photo]', vz), retirer = $('[data-v-sans]', vz);
    if (fp) fp.addEventListener('change', function () {
      var f = fp.files && fp.files[0];
      if (!f) return;
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () { photo = img; if (retirer) retirer.hidden = false; vz.classList.add('a-photo'); dessiner(); URL.revokeObjectURL(url); };
      img.src = url;
    });
    if (retirer) retirer.addEventListener('click', function () { photo = null; fp.value = ''; retirer.hidden = true; vz.classList.remove('a-photo'); dessiner(); });
    /* quand Lia propose les mots (outil juste au-dessous), ils vont dans le visuel */
    vz.remplir = function (blocs) {
      blocs.forEach(function (b) {
        var t = (b.titre || '').toLowerCase();
        if (t.indexOf('sous') === 0 || t.indexOf('ligne') === 0) champ('sous').value = b.texte; else if (t.indexOf('titre') === 0) champ('titre').value = b.texte;
      });
      dessiner();
      vz.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    redessiner();
    /* l'outil est caché au chargement : on redessine quand il s'ouvre */
    var sec = vz.closest('[data-ol]');
    if (sec && window.MutationObserver) new MutationObserver(function () { if (!sec.hidden) redessiner(); }).observe(sec, { attributes: true, attributeFilter: ['hidden'] });
  });

  /* ---------- recadrer et alléger une photo : tout se passe dans le navigateur ---------- */
  var fz = $('[data-formats]');
  if (fz) {
    /* [nom, largeur, hauteur] ; hauteur 0 = photo entière, seulement réduite (pour le site) */
    var FORMATS = [
      ['Pour votre site, légère', 1600, 0], ['Instagram, carré', 1080, 1080], ['Instagram, portrait', 1080, 1350], ['Story et Reel', 1080, 1920],
      ['Facebook et LinkedIn', 1200, 630], ['Fiche Google', 1200, 900]
    ];
    var liste = $('[data-formats-liste]', fz), info = $('[data-formats-info]', fz);
    var poids = function (o) { return o > 1048576 ? (o / 1048576).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(o / 1024)) + ' Ko'; };
    $('[data-formats-file]', fz).addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var img = new Image(), url = URL.createObjectURL(f);
      liste.innerHTML = '';
      if (info) { info.className = 'ol-etat'; info.textContent = 'Préparation…'; }
      img.onerror = function () {
        URL.revokeObjectURL(url);
        if (info) { info.className = 'ol-etat is-err'; info.textContent = 'Cette photo ne s’ouvre pas ici. Enregistrez-la en JPG (ou faites une capture d’écran de la photo), puis réessayez.'; }
      };
      img.onload = function () {
        if (info) { info.className = 'ol-etat'; info.textContent = 'Votre photo : ' + img.width + ' × ' + img.height + ', ' + poids(f.size) + '.'; }
        FORMATS.forEach(function (F) {
          var c = el('canvas'), W = F[1], H = F[2];
          if (!H) { var r = Math.min(1, W / Math.max(img.width, img.height)); W = Math.round(img.width * r); H = Math.round(img.height * r); c.width = W; c.height = H; c.getContext('2d').drawImage(img, 0, 0, W, H); }
          else { c.width = W; c.height = H; var k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k; c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) / 2, w, h); }
          var fig = el('figure', 'ol-format');
          fig.appendChild(c);
          var cap = el('figcaption');
          cap.appendChild(el('strong', '', F[0]));
          var taille = el('small', '', W + ' × ' + H);
          cap.appendChild(taille);
          var a = el('a', 'btn btn-light btn-sm', 'Télécharger');
          a.download = (f.name.replace(/\.[^.]+$/, '') || 'photo') + '-' + W + 'x' + H + '.jpg';
          cap.appendChild(a);
          fig.appendChild(cap);
          liste.appendChild(fig);
          /* toBlob donne le poids du fichier ; à défaut, on garde l'ancien chemin */
          if (c.toBlob) c.toBlob(function (bl) { if (!bl) { a.href = c.toDataURL('image/jpeg', 0.82); return; } a.href = URL.createObjectURL(bl); taille.textContent = W + ' × ' + H + ', ' + poids(bl.size); }, 'image/jpeg', 0.82);
          else a.href = c.toDataURL('image/jpeg', 0.82);
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }
})();
