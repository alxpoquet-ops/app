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
      var mots = (txt.value.trim().match(/\S+/g) || []).length;
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
  $$('[data-ol-fermer]').forEach(function (b) { b.addEventListener('click', function () { ouvrir(''); grille.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }); });
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
  function bloc(b, partage, image, relies) {
    var c = el('div', 'ol-bloc');
    var tete = el('div', 'ol-bloc-tete');
    tete.appendChild(el('strong', '', b.titre || 'Texte'));
    var compte = el('small', '', '');
    tete.appendChild(compte);
    c.appendChild(tete);
    var ta = el('textarea');
    ta.value = b.texte; ta.rows = Math.min(12, Math.max(3, Math.ceil(b.texte.length / 60) + (b.texte.match(/\n/g) || []).length));
    ta.setAttribute('aria-label', b.titre || 'Texte');
    var maj = function () { compte.textContent = ta.value.length + ' caractères'; };
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
    var partage = res.hasAttribute('data-partage'), relies = [];
    try { relies = JSON.parse(res.getAttribute('data-relies') || '[]'); } catch (e) {}
    res.innerHTML = '';
    var directs = blocs.filter(function (b) { return relies.indexOf((b.titre || '').toLowerCase()) !== -1; }).length;
    res.appendChild(el('p', 'app-note', !partage ? 'Relisez, changez ce que vous voulez, puis copiez.' : directs ? 'Relisez, changez ce que vous voulez, puis publiez. Sur vos comptes reliés, la publication part directement.' : 'Relisez, changez ce que vous voulez, puis publiez : le texte est copié, le réseau s’ouvre, il reste à coller.'));
    var cartes = blocs.map(function (b) { var c = bloc(b, partage, image, relies); res.appendChild(c); return c; });
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
      var fd = new FormData(form);
      fd.append('action', 'aled08e_outil');
      fd.append('_aled08e_jl', nonce);
      var fi = $('[data-ol-file]', form), image = fi && fi.files && fi.files[0] ? fi.files[0] : null;
      btn.disabled = true; form.classList.add('is-busy');
      etat.className = 'ol-etat'; etat.textContent = 'Lia écrit… quelques secondes.';
      fetch(ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return { success: false, data: { message: 'Réponse illisible. Réessayez.' } }; }); })
        .then(function (j) {
          btn.disabled = false; form.classList.remove('is-busy');
          if (!j || !j.success) { etat.className = 'ol-etat is-err'; etat.textContent = (j && j.data && j.data.message) || 'Lia n’a pas pu répondre. Réessayez.'; return; }
          var data = j.data;
          etat.className = 'ol-etat is-ok';
          etat.textContent = data.illimite ? 'C’est prêt.' : 'C’est prêt. ' + jetons(data.jetons) + ' utilisé' + (data.jetons > 1 ? 's' : '') + ', il vous en reste ' + data.solde + '.';
          var s = $('[data-jl-solde]'); if (s && !data.illimite) s.textContent = data.solde;
          afficher(res, data.blocs, image);
        })
        .catch(function () { btn.disabled = false; form.classList.remove('is-busy'); etat.className = 'ol-etat is-err'; etat.textContent = 'La connexion a coupé. Réessayez : aucun jeton n’a été compté.'; });
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

  /* ---------- photo aux bons formats : tout se passe dans le navigateur ---------- */
  var fz = $('[data-formats]');
  if (fz) {
    var FORMATS = [
      ['Instagram, carré', 1080, 1080], ['Instagram, portrait', 1080, 1350], ['Story et Reel', 1080, 1920],
      ['Facebook et LinkedIn', 1200, 630], ['Fiche Google', 1200, 900]
    ];
    var liste = $('[data-formats-liste]', fz);
    $('[data-formats-file]', fz).addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () {
        liste.innerHTML = '';
        FORMATS.forEach(function (F) {
          var c = el('canvas'); c.width = F[1]; c.height = F[2];
          var k = Math.max(F[1] / img.width, F[2] / img.height), w = img.width * k, h = img.height * k;
          c.getContext('2d').drawImage(img, (F[1] - w) / 2, (F[2] - h) / 2, w, h);
          var fig = el('figure', 'ol-format');
          fig.appendChild(c);
          var cap = el('figcaption');
          cap.appendChild(el('strong', '', F[0]));
          cap.appendChild(el('small', '', F[1] + ' × ' + F[2]));
          var a = el('a', 'btn btn-light btn-sm', 'Télécharger');
          a.download = (f.name.replace(/\.[^.]+$/, '') || 'photo') + '-' + F[1] + 'x' + F[2] + '.jpg';
          a.href = c.toDataURL('image/jpeg', 0.9);
          cap.appendChild(a);
          fig.appendChild(cap);
          liste.appendChild(fig);
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  }
})();
