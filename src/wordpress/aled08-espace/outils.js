/* Les Minis Monstres Espace client : l'atelier « Les outils » (Publier partout, Mes avis Google, Fiche produit, Comparer mes devis).
 * Chaque outil est une section [data-ao] écrite par includes/atelier-outils.php. Rien n'est compté ici : le serveur vérifie
 * l'abonnement et la limite du mois avant chaque travail d'un petit monstre. */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function copier(txt, fini) {
    fini = fini || function () {};
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { fini(true); }, function () { fini(false); });
    else { var t = el('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; d.body.appendChild(t); t.select(); var ok = false; try { ok = d.execCommand('copy'); } catch (e) {} d.body.removeChild(t); fini(ok); }
  }
  function liste(noms) { return noms.length > 1 ? noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1] : (noms[0] || ''); }
  function telecharger(blob, nom) {
    var a = el('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = nom; d.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }
  function enFichier(blob, nom) { try { return new File([blob], nom, { type: blob.type || 'image/jpeg' }); } catch (e) { return null; } }
  var tactile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* une photo réduite dans le navigateur (JPEG, cote pixels au plus) : plus légère à envoyer, bien tournée */
  function reduire(file, cote, q) {
    return new Promise(function (ok, ko) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w0 = img.naturalWidth, h0 = img.naturalHeight, r = Math.min(1, cote / Math.max(w0, h0)), w = Math.round(w0 * r), h = Math.round(h0 * r);
        var c = el('canvas'); c.width = w; c.height = h;
        var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        if (!c.toBlob) { ko(); return; }
        c.toBlob(function (b) { if (b) ok(b); else ko(); }, 'image/jpeg', q || 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ko(); };
      img.src = url;
    });
  }

  /* ---------- l'ancien prix d'une demande par Cerise (seulement si l'énergie revenait : data-jl-estime) ---------- */
  var est = $('[data-jl-estime]');
  if (est) {
    var eform = est.closest('form'), etxt = $('textarea[name="demande"]', eform), efile = $('[data-req-file]', eform), eout = $('[data-jl-prix]', est);
    var base = +est.getAttribute('data-base'), parMots = +est.getAttribute('data-mots') || 10, parImage = +est.getAttribute('data-image'), solde = +est.getAttribute('data-solde');
    var calc = function () {
      var mots = Math.max((etxt.value.trim().match(/\S+/g) || []).length, Math.ceil(etxt.value.trim().length / 6));
      var photos = efile && efile.files ? Math.min(3, efile.files.length) : 0;
      var prix = base + Math.ceil(mots / parMots) + parImage * photos;
      eout.textContent = prix;
      est.classList.toggle('is-trop', prix > solde);
      var lia = $('input[name="par"][value="lia"]', eform);
      est.hidden = !!(lia && !lia.checked);
    };
    etxt.addEventListener('input', calc);
    if (efile) efile.addEventListener('change', calc);
    $$('input[name="par"]', eform).forEach(function (r) { r.addEventListener('change', calc); });
    calc();
  }

  /* les réseaux : nom, adresse où publier à la main, longueur conseillée */
  var RS = {
    instagram: { nom: 'Instagram', url: function () { return 'https://www.instagram.com/'; } },
    facebook: { nom: 'Facebook', url: function () { return 'https://www.facebook.com/'; } },
    google: { nom: 'Fiche Google', url: function () { return 'https://business.google.com/'; } },
    linkedin: { nom: 'LinkedIn', url: function (t) { return 'https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(t); } },
    site: { nom: 'Mon site' },
    bluesky: { nom: 'Bluesky', url: function (t) { return 'https://bsky.app/intent/compose?text=' + encodeURIComponent(t); } },
    mastodon: { nom: 'Mastodon', url: function (t) { return 'https://mastodon.social/share?text=' + encodeURIComponent(t); } }
  };
  function reseauDe(titre) {
    var t = String(titre || '').toLowerCase().trim();
    if (t === 'fiche google' || t === 'google') return 'google';
    if (t === 'mon site' || t === 'site') return 'site';
    return RS[t] ? t : '';
  }

  $$('[data-ao][data-ajax]').forEach(function (sec) {
    var outil = sec.getAttribute('data-ao'), ajax = sec.getAttribute('data-ajax'), nonce = sec.getAttribute('data-nonce'), chef = sec.getAttribute('data-chef') || 'Le petit monstre';
    var photo = { blob: null, ref: '' };

    function poster(donnees) {
      var fd = donnees instanceof FormData ? donnees : new FormData();
      if (!(donnees instanceof FormData)) Object.keys(donnees).forEach(function (k) {
        var v = donnees[k];
        if (v == null) return;
        if (Array.isArray(v)) v.forEach(function (x) { fd.append(k + '[]', x); });
        else if (v instanceof Blob) fd.append(k, v, 'photo.jpg');
        else if (typeof v === 'object') Object.keys(v).forEach(function (x) { fd.append(k + '[' + x + ']', v[x]); });
        else fd.append(k, v);
      });
      fd.append('_ao', nonce);
      return fetch(ajax, { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return { success: false, data: { message: 'Réponse illisible. Réessayez.' } }; }); });
    }
    function dire(etat, texte, cls) { if (!etat) return; etat.className = (etat.className.split(' ')[0] || 'ol-etat') + (cls ? ' ' + cls : ''); etat.textContent = texte; }
    function erreur(j, defaut) { return (j && j.data && j.data.message) || defaut || 'Ça n’a pas marché. Réessayez.'; }
    function majUsage(data) {
      if (!data || !data.usage) return;
      var u = $('[data-ao-usage]', sec), j = $('[data-ao-jauge]', sec);
      if (u && data.usageTxt) u.textContent = data.usageTxt;
      if (j && data.usage.limite) j.style.width = Math.min(100, Math.round(100 * data.usage.fait / data.usage.limite)) + '%';
    }

    /* ---------- les boutons de l'outil : un panneau à la fois ---------- */
    function montrer(pid) {
      var p = $('[data-ao-panneau="' + pid + '"]', sec);
      if (!p) return;
      $$('[data-ao-panneau]', sec).forEach(function (x) { x.hidden = x !== p; });
      $$('.ao-nav [data-ao-aller]', sec).forEach(function (b) { var on = b.getAttribute('data-ao-aller') === pid; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (p.getBoundingClientRect().top < 0) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $$('[data-ao-aller]', sec).forEach(function (b) { b.addEventListener('click', function () { montrer(b.getAttribute('data-ao-aller')); }); });

    /* ---------- les compteurs : un texte trop long n'est jamais coupé, il est signalé ---------- */
    $$('textarea[data-max]', sec).forEach(function (t) {
      var c = $('[data-ao-compte]', t.parentNode), max = +t.getAttribute('data-max');
      var maj = function () {
        if (!c) return;
        var n = t.value.length;
        c.textContent = n > max * 0.6 ? n + ' sur ' + max + ' caractères' + (n > max ? ' : c’est trop long, raccourcissez-le.' : '') : '';
        c.classList.toggle('is-trop', n > max);
      };
      t.addEventListener('input', maj); maj();
    });

    /* ---------- la photo, choisie une fois pour tout l'outil ---------- */
    var zone = $('[data-ao-photo]', sec), apresPhoto = [];
    if (zone) {
      var fi = $('[data-ao-photo-file]', zone), ap = $('[data-ao-photo-apercu]', zone), vide = $('[data-ao-photo-vide]', zone), ret = $('[data-ao-photo-retirer]', zone), pe = $('[data-ao-photo-etat]', zone), urlAp = '';
      var vider = function () {
        photo.blob = null; photo.ref = ''; fi.value = '';
        if (urlAp) URL.revokeObjectURL(urlAp);
        ap.hidden = true; ap.removeAttribute('src'); vide.hidden = false; ret.hidden = true; dire(pe, '');
        apresPhoto.forEach(function (f) { f(); });
      };
      fi.addEventListener('change', function () {
        var f = fi.files && fi.files[0];
        if (!f) return;
        if (!/^image\//.test(f.type || 'image/')) { dire(pe, 'Choisissez une photo.', 'is-err'); return; }
        dire(pe, 'Préparation de la photo…');
        reduire(f, 1600, 0.85).then(function (b) {
          photo.blob = b; photo.ref = '';
          if (urlAp) URL.revokeObjectURL(urlAp);
          urlAp = URL.createObjectURL(b); ap.src = urlAp; ap.hidden = false; vide.hidden = true; ret.hidden = false; dire(pe, '');
          apresPhoto.forEach(function (fn) { fn(); });
        }, function () { dire(pe, 'Cette photo ne s’ouvre pas ici. Enregistrez-la en JPG (ou faites une capture d’écran), puis réessayez.', 'is-err'); });
      });
      ret.addEventListener('click', vider);
      sec._viderPhoto = vider;
    }

    /* ---------- les résultats : un bloc par texte, modifiable, à copier ---------- */
    function blocCarte(b, limites) {
      var c = el('div', 'ol-bloc'), tete = el('div', 'ol-bloc-tete'), compte = el('small', '', '');
      tete.appendChild(el('strong', '', b.titre || 'Texte')); tete.appendChild(compte); c.appendChild(tete);
      var ta = el('textarea');
      ta.value = b.texte; ta.rows = Math.min(12, Math.max(3, Math.ceil(b.texte.length / 60) + (b.texte.match(/\n/g) || []).length));
      ta.setAttribute('aria-label', b.titre || 'Texte');
      var limite = (limites && limites[b.titre]) || 0;
      var maj = function () { compte.textContent = ta.value.length + (limite ? ' sur ' + limite : '') + ' caractères'; compte.classList.toggle('is-trop', !!limite && ta.value.length > limite); };
      ta.addEventListener('input', maj); maj();
      c.appendChild(ta);
      var actions = el('div', 'ol-bloc-actions'), msg = el('span', 'ol-bloc-msg'); msg.setAttribute('role', 'status');
      var bc = el('button', 'btn btn-light btn-sm', 'Copier'); bc.type = 'button';
      bc.addEventListener('click', function () { copier(ta.value, function (ok) { msg.textContent = ok ? 'Copié.' : 'Sélectionnez le texte pour le copier.'; setTimeout(function () { msg.textContent = ''; }, 4000); }); });
      actions.appendChild(bc); actions.appendChild(msg); c.appendChild(actions);
      c.ta = ta; c.actions = actions; c.msg = msg;
      return c;
    }
    /* « Tableau comparatif » : des lignes « a | b | c » deviennent un vrai tableau (le texte reste à copier) */
    function tableauCarte(b) {
      var lignes = b.texte.split('\n').filter(function (l) { return l.indexOf('|') !== -1 && !/^[\s|:\-]+$/.test(l); }).map(function (l) {
        var c = l.split('|').map(function (x) { return x.trim(); });
        if (c[0] === '') c.shift();
        if (c.length && c[c.length - 1] === '') c.pop();
        return c;
      });
      if (lignes.length < 2) return null;
      var carte = el('div', 'ol-bloc'), tete = el('div', 'ol-bloc-tete');
      tete.appendChild(el('strong', '', b.titre)); carte.appendChild(tete);
      var wrap = el('div', 'ao-table'), t = el('table'), th = el('thead'), tr = el('tr');
      wrap.setAttribute('tabindex', '0'); wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', b.titre);
      lignes[0].forEach(function (x) { var h = el('th', '', x); h.scope = 'col'; tr.appendChild(h); });
      th.appendChild(tr); t.appendChild(th);
      var tb = el('tbody');
      lignes.slice(1).forEach(function (l) { var r = el('tr'); l.forEach(function (x, i) { var cell = el(i === 0 ? 'th' : 'td', '', x); if (i === 0) cell.scope = 'row'; r.appendChild(cell); }); tb.appendChild(r); });
      t.appendChild(tb); wrap.appendChild(t); carte.appendChild(wrap);
      var actions = el('div', 'ol-bloc-actions'), msg = el('span', 'ol-bloc-msg'), bc = el('button', 'btn btn-light btn-sm', 'Copier le tableau'); bc.type = 'button';
      bc.addEventListener('click', function () { copier(lignes.map(function (l) { return l.join('\t'); }).join('\n'), function () { msg.textContent = 'Copié : collez-le dans un tableur.'; }); });
      actions.appendChild(bc); actions.appendChild(msg); carte.appendChild(actions);
      return carte;
    }
    function afficher(res, blocs, opts) {
      opts = opts || {};
      var limites = {};
      try { limites = JSON.parse(res.getAttribute('data-limites') || '{}'); } catch (e) {}
      res.innerHTML = '';
      res.appendChild(el('p', 'app-note', res.getAttribute('data-note') || 'Relisez, changez ce que vous voulez, puis copiez.'));
      var cartes = {};
      blocs.forEach(function (b) {
        var c = /^tableau/i.test(b.titre || '') ? tableauCarte(b) : null;
        if (!c) {
          c = blocCarte(b, limites);
          cartes[b.titre] = c;
          if (opts.utiliser) {
            var bu = el('button', 'btn btn-primary btn-sm', 'Publier cette idée'); bu.type = 'button';
            bu.addEventListener('click', function () { opts.utiliser(c.ta.value); });
            c.actions.insertBefore(bu, c.actions.firstChild);
          }
        }
        res.appendChild(c);
      });
      if (opts.boutique) res.appendChild(boutiqueForm(cartes));
      res.hidden = false;
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* ---------- lancer une brique ---------- */
    function manque(form) {
      var vides = $$('textarea[required], input[required]', form).filter(function (x) { return !x.value.trim(); });
      if (vides.length) { var lab = form.querySelector('label[for="' + vides[0].id + '"]'); vides[0].focus(); return 'Il manque : ' + (lab ? lab.textContent : 'une case'); }
      var t = $$('textarea[data-max]', form).filter(function (x) { return x.value.length > +x.getAttribute('data-max'); })[0];
      if (t) { t.focus(); return 'Votre texte fait ' + t.value.length + ' caractères. Cette case en prend ' + t.getAttribute('data-max') + '. Raccourcissez-le, puis relancez.'; }
      if (form.getAttribute('data-photo') === 'requis' && !photo.blob) return 'Il manque : la photo, en haut.';
      if (form.getAttribute('data-ao-pub') != null && !$$('input[name="c_reseaux[]"]:checked', form).length) return 'Cochez au moins un endroit où publier.';
      return '';
    }
    /* les devis : photos réduites (lisibles), PDF tels quels (5 Mo au plus) */
    function preparerFichiers(form) {
      var fi = $('[data-ao-fichiers]', form);
      if (!fi || !fi.files || !fi.files.length) return Promise.resolve([]);
      var max = +fi.getAttribute('data-max') || 4, l = Array.prototype.slice.call(fi.files);
      if (l.length > max) return Promise.reject('Envoyez ' + max + ' fichiers au plus.');
      return Promise.all(l.map(function (f) {
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) return f.size > 5 * 1048576 ? Promise.reject('« ' + f.name + ' » est trop lourd (5 Mo au plus) : envoyez plutôt une photo de chaque page.') : Promise.resolve([f, f.name, fi.name]);
        return reduire(f, 2000, 0.85).then(function (b) { return [b, f.name.replace(/\.[^.]+$/, '') + '.jpg', fi.name]; }, function () { return Promise.reject('« ' + f.name + ' » ne s’ouvre pas ici. Enregistrez-le en JPG ou en PDF.'); });
      }));
    }
    function lancer(form, reussi) {
      var bid = form.getAttribute('data-brique'), etat = $('[data-ao-etat]', form), btn = $('button[type=submit]', form);
      if (btn.disabled) return;
      var m = manque(form);
      if (m) { dire(etat, m, 'is-err'); return; }
      btn.disabled = true; form.classList.add('is-busy');
      dire(etat, chef + ' s’y met… quelques secondes.');
      var fin = function () { btn.disabled = false; form.classList.remove('is-busy'); };
      preparerFichiers(form).then(function (fichiers) {
        var fd = new FormData(form);
        fd.delete && fd.delete('c_image');
        $$('[data-ao-fichiers]', form).forEach(function (x) { if (fd.delete) fd.delete(x.name); });
        fichiers.forEach(function (f) { fd.append(f[2], f[0], f[1]); });
        if (form.getAttribute('data-photo') && photo.blob) fd.append('c_image', photo.blob, 'photo.jpg');
        fd.append('action', 'aled08e_ao_brique'); fd.append('outil', outil); fd.append('brique', bid);
        var debut = Date.now();
        var ok = function (data) { fin(); dire(etat, 'C’est prêt.', 'is-ok'); majUsage(data); reussi(data.blocs); };
        poster(fd).then(function (j) {
          if (!j || !j.success) { fin(); dire(etat, erreur(j, chef + ' n’a pas pu répondre. Réessayez.'), 'is-err'); return; }
          ok(j.data);
        }, function () {
          /* la connexion a coupé, mais le monstre a peut-être fini : on revient chercher son résultat (4 essais sur une minute) */
          dire(etat, 'La connexion a coupé. Je regarde si ' + chef + ' a fini…');
          var essais = 0;
          var revoir = function () {
            essais++;
            poster({ action: 'aled08e_ao_dernier', brique: bid, il_y_a: Math.ceil((Date.now() - debut) / 1000) + 5 }).then(function (j) {
              if (j && j.success) { ok(j.data); return; }
              if (essais < 4) { setTimeout(revoir, 15000); return; }
              fin(); dire(etat, 'La connexion a coupé avant la réponse. Réessayez quand le réseau est revenu.', 'is-err');
            }, function () { if (essais < 4) setTimeout(revoir, 15000); else { fin(); dire(etat, 'Pas de connexion. Réessayez quand le réseau est revenu.', 'is-err'); } });
          };
          setTimeout(revoir, 8000);
        });
      }, function (msg) { fin(); dire(etat, String(msg), 'is-err'); });
    }
    $$('[data-ao-fichiers]', sec).forEach(function (fi) {
      var l = $('[data-ao-fichiers-liste]', fi.closest('.field'));
      fi.addEventListener('change', function () {
        if (!l) return;
        l.innerHTML = '';
        Array.prototype.slice.call(fi.files || []).forEach(function (f) { l.appendChild(el('li', '', f.name)); });
      });
    });

    /* ---------- Fiche produit : mettre en boutique ---------- */
    function boutiqueForm(cartes) {
      var box = el('div', 'ao-boutique'), etat = el('p', 'ol-etat');
      etat.setAttribute('role', 'status');
      box.appendChild(el('p', 'app-sub', 'Mettre en boutique'));
      var f = el('div', 'field'), lab = el('label', '', 'Votre prix de vente, en euros'), inp = el('input');
      var idp = 'ao-prix-' + Date.now(); lab.htmlFor = idp; inp.id = idp; inp.type = 'text'; inp.inputMode = 'decimal'; inp.placeholder = 'Par exemple 35';
      f.appendChild(lab); f.appendChild(inp); box.appendChild(f);
      var cas = el('label', 'ao-case'), cb = el('input'); cb.type = 'checkbox'; cas.appendChild(cb); cas.appendChild(d.createTextNode(' Sans prix (sur demande)')); box.appendChild(cas);
      var bt = el('button', 'btn btn-primary', 'Mettre en boutique'); bt.type = 'button'; box.appendChild(bt); box.appendChild(etat);
      bt.addEventListener('click', function () {
        var titre = cartes['Titre'] ? cartes['Titre'].ta.value.trim() : '';
        var desc = [cartes['Accroche'], cartes['Description']].filter(Boolean).map(function (c) { return c.ta.value.trim(); }).join('\n\n');
        if (!photo.blob) { dire(etat, 'Ajoutez la photo du produit, en haut.', 'is-err'); return; }
        if (!cb.checked && !inp.value.trim()) { dire(etat, 'Indiquez votre prix, ou cochez « Sans prix ».', 'is-err'); inp.focus(); return; }
        bt.disabled = true; dire(etat, 'Mirette met votre article en boutique…');
        poster({ action: 'aled08e_ao_boutique', nom: titre, description: desc, prix: inp.value, sans_prix: cb.checked ? 1 : null, image: photo.blob }).then(function (j) {
          if (!j || !j.success) { bt.disabled = false; dire(etat, erreur(j), 'is-err'); return; }
          dire(etat, j.data.message, 'is-ok'); bt.textContent = 'En boutique';
        }, function () { bt.disabled = false; dire(etat, 'La connexion a coupé. Réessayez.', 'is-err'); });
      });
      return box;
    }

    /* ---------- Publier partout ---------- */
    var pub = $('[data-ao-publier]', sec);
    var publierForm = pub && $('form[data-ao-pub]', pub);
    if (pub) initPublier();
    function initPublier() {
      var directs = [], limites = {};
      try { directs = JSON.parse(pub.getAttribute('data-directs') || '[]'); } catch (e) {}
      try { limites = JSON.parse(pub.getAttribute('data-limites') || '{}'); } catch (e) {}
      var ecrans = $$('[data-ao-ecran]', pub), boite = $('[data-ao-cartes]', pub), consigne = $('[data-ao-consigne]', pub);
      var tout = $('[data-ao-tout]', pub), etat2 = $('[data-ao-etat2]', pub), progOuvrir = $('[data-ao-prog-ouvrir]', pub), prog = $('[data-ao-prog]', pub);
      var cartes = [], fini = '';
      function ecran(n) {
        ecrans.forEach(function (e) { e.hidden = e.getAttribute('data-ao-ecran') !== String(n); });
        var e = $('[data-ao-ecran="' + n + '"]', pub);
        if (e && e.getBoundingClientRect().top < 0) e.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      function cochees() { return cartes.filter(function (c) { return c.cb.checked; }); }
      function noms(l) { return l.map(function (c) { return c.nom; }); }
      function majConsigne() {
        var on = cochees(), dir = on.filter(function (c) { return c.direct && !c.fait; }), par = on.filter(function (c) { return !c.direct && !c.fait; });
        tout.hidden = !dir.length;
        progOuvrir.hidden = !on.filter(function (c) { return c.direct; }).length;
        if (!on.length) consigne.textContent = 'Cochez au moins un réseau.';
        else if (dir.length && par.length) consigne.textContent = 'Relisez et changez ce que vous voulez. « Tout publier » envoie sur ' + liste(noms(dir)) + '. Pour ' + liste(noms(par)) + ', touchez « Partager » : tout est prêt, il reste un geste.';
        else if (dir.length) consigne.textContent = 'Relisez et changez ce que vous voulez, puis « Tout publier ».';
        else if (par.length) consigne.textContent = 'Relisez et changez ce que vous voulez, puis touchez « Partager » sur chaque carte : le texte et la photo sont prêts, il reste un geste par réseau.';
        else consigne.textContent = '';
      }
      function marquer(c, mode, url) {
        c.fait = mode; c.url = url || '';
        c.el.classList.add('is-fait');
        if (c.bp) c.bp.textContent = mode === 'partage' ? 'Partagé' : 'Publié';
        majConsigne();
        var reste = cochees().filter(function (x) { return !x.fait; });
        if (!reste.length && cochees().length) setTimeout(function () { finir(); }, 600);
      }
      function carte(b) {
        var cle = reseauDe(b.titre), r = RS[cle] || { nom: b.titre }, direct = directs.indexOf(cle) !== -1;
        var c = { cle: cle, nom: r.nom, direct: direct };
        var e = el('div', 'ao-carte'), tete = el('label', 'ao-carte-tete'), cb = el('input'), compte = el('small');
        cb.type = 'checkbox'; cb.checked = true;
        tete.appendChild(cb); tete.appendChild(el('strong', '', r.nom)); tete.appendChild(compte); e.appendChild(tete);
        var ta = el('textarea'); ta.value = b.texte; ta.rows = Math.min(10, Math.max(3, Math.ceil(b.texte.length / 38) + (b.texte.match(/\n/g) || []).length + 1));
        ta.setAttribute('aria-label', 'Texte pour ' + r.nom);
        var limite = limites[b.titre] || 0;
        var maj = function () { compte.textContent = ta.value.length + (limite ? ' sur ' + limite : ''); compte.classList.toggle('is-trop', !!limite && ta.value.length > limite); };
        ta.addEventListener('input', maj); maj();
        e.appendChild(ta);
        var actions = el('div', 'ol-bloc-actions'), msg = el('span', 'ol-bloc-msg'); msg.setAttribute('role', 'status');
        c.dire = function (t, err) { msg.className = 'ol-bloc-msg' + (err ? ' is-err' : ''); msg.textContent = t; };
        if (direct) actions.appendChild(el('span', 'ao-mode is-direct', cle === 'site' ? 'Pépite la publie sur votre site' : 'Pépite publie directement'));
        else if (r.url) {
          var bp = el('button', 'btn btn-primary btn-sm', 'Partager sur ' + r.nom); bp.type = 'button';
          bp.addEventListener('click', function () { partager(c); });
          actions.appendChild(bp); c.bp = bp;
        }
        var bc = el('button', 'btn btn-light btn-sm', 'Copier'); bc.type = 'button';
        bc.addEventListener('click', function () { copier(ta.value, function (ok) { c.dire(ok ? 'Copié.' : 'Sélectionnez le texte pour le copier.'); }); });
        actions.appendChild(bc); actions.appendChild(msg); e.appendChild(actions);
        cb.addEventListener('change', function () { e.classList.toggle('is-off', !cb.checked); majConsigne(); });
        c.el = e; c.cb = cb; c.ta = ta;
        if (cle === 'instagram' && !photo.blob) {
          c.dire('Instagram demande une photo : ajoutez-en une (Changer ma photo), ou décochez Instagram.', true);
          if (direct) { cb.checked = false; e.classList.add('is-off'); }
        }
        return c;
      }
      /* « Partager » : le partage du téléphone (photo + texte) ; sur ordinateur, texte copié, photo téléchargée, réseau ouvert */
      function partager(c) {
        var r = RS[c.cle], t = c.ta.value, f = photo.blob ? enFichier(photo.blob, 'photo.jpg') : null;
        if (c.cle === 'instagram' && !f) { c.dire('Instagram demande une photo : ajoutez-en une, en haut.', true); return; }
        var avecFichier = !!(f && navigator.canShare && navigator.canShare({ files: [f] }));
        if (tactile && navigator.share && (avecFichier || !f)) {
          copier(t);
          var data = { text: t };
          if (avecFichier) data.files = [f];
          c.dire('Le texte est copié : dans ' + r.nom + ', collez-le en légende si besoin.');
          navigator.share(data).then(function () { marquer(c, 'partage'); }, function (e) {
            if (e && e.name === 'AbortError') { c.dire('Partage annulé. Le texte reste copié.'); return; }
            var a = el('a', '', 'Ouvrir ' + r.nom); a.href = r.url(t); a.target = '_blank'; a.rel = 'noopener';
            c.dire('Le partage n’a pas marché. Le texte est copié : ');
            c.el.querySelector('.ol-bloc-msg').appendChild(a);
          });
          return;
        }
        copier(t);
        if (f) telecharger(photo.blob, 'photo-' + c.cle + '.jpg');
        window.open(r.url(t), '_blank', 'noopener');
        c.dire('Texte copié' + (f ? ' et photo téléchargée' : '') + '. Dans ' + r.nom + ' (nouvel onglet), créez une publication' + (f ? ', ajoutez la photo' : '') + ' et collez le texte.');
        marquer(c, 'partage');
      }
      function deposerPhoto() {
        if (!photo.blob || photo.ref) return Promise.resolve(photo.ref);
        return poster({ action: 'aled08e_rs_photo', image: photo.blob }).then(function (j) {
          if (!j || !j.success) throw new Error(erreur(j, 'La photo n’est pas partie.'));
          photo.ref = j.data.photo; return photo.ref;
        });
      }
      tout.addEventListener('click', function () {
        var aFaire = cochees().filter(function (c) { return c.direct && !c.fait; });
        if (!aFaire.length) return;
        tout.disabled = true; dire(etat2, 'Pépite publie…');
        deposerPhoto().then(function (ref) {
          return aFaire.reduce(function (p, c) {
            return p.then(function () {
              c.dire('Publication en cours…');
              return poster({ action: 'aled08e_publier', reseau: c.cle, texte: c.ta.value, photo: ref || null }).then(function (j) {
                if (!j || !j.success) { c.dire(erreur(j, 'La publication n’est pas partie. Réessayez.'), true); return; }
                c.dire('Publié. ');
                var a = el('a', '', 'Voir'); a.href = j.data.url; a.target = '_blank'; a.rel = 'noopener';
                c.el.querySelector('.ol-bloc-msg').appendChild(a);
                marquer(c, 'publie', j.data.url);
              }, function () { c.dire('La connexion a coupé. Réessayez.', true); });
            });
          }, Promise.resolve());
        }).then(function () {
          tout.disabled = false;
          var reste = cochees().filter(function (c) { return !c.fait; });
          dire(etat2, reste.length ? 'Il reste ' + liste(noms(reste)) + '.' : '', reste.length ? '' : 'is-ok');
        }, function (e) { tout.disabled = false; dire(etat2, e.message, 'is-err'); });
      });
      /* programmer pour plus tard : seulement les réseaux où Pépite publie directement */
      progOuvrir.addEventListener('click', function () {
        prog.hidden = !prog.hidden;
        var on = cochees(), dir = on.filter(function (c) { return c.direct; }), par = on.filter(function (c) { return !c.direct; });
        $('[data-ao-prog-note]', prog).textContent = 'Pépite publiera sur ' + liste(noms(dir)) + ' au moment choisi.' + (par.length ? ' ' + liste(noms(par)) + (par.length > 1 ? ' ne se programment' : ' ne se programme') + ' pas : partagez maintenant, ou présentez Pépite à ce compte.' : '');
        if (!prog.hidden) $('[data-ao-prog-quand]', prog).focus();
      });
      $('[data-ao-prog-ok]', prog).addEventListener('click', function () {
        var bt = this, quand = $('[data-ao-prog-quand]', prog).value;
        if (!quand) { dire(etat2, 'Choisissez un jour et une heure.', 'is-err'); return; }
        var textes = {};
        cochees().forEach(function (c) { if (c.direct && !c.fait) textes[c.cle] = c.ta.value; });
        if (!Object.keys(textes).length) { dire(etat2, 'Rien à programmer.', 'is-err'); return; }
        bt.disabled = true; dire(etat2, 'Un instant…');
        poster({ action: 'aled08e_ao_programmer', quand: quand, textes: textes, extrait: extrait(), image: photo.blob }).then(function (j) {
          bt.disabled = false;
          if (!j || !j.success) { dire(etat2, erreur(j), 'is-err'); return; }
          cochees().forEach(function (c) { if (textes[c.cle] != null) { c.fait = 'programme'; c.el.classList.add('is-fait'); c.dire('Programmé.'); } });
          prog.hidden = true;
          fini = j.data.message;
          var reste = cochees().filter(function (c) { return !c.fait; });
          if (reste.length) { majConsigne(); dire(etat2, j.data.message + ' Il reste ' + liste(noms(reste)) + ' à partager.', 'is-ok'); }
          else finir();
        }, function () { bt.disabled = false; dire(etat2, 'La connexion a coupé. Réessayez.', 'is-err'); });
      });
      function extrait() { var t = $('textarea[name="c_description"]', publierForm); return t ? t.value.trim().slice(0, 80) : ''; }
      function finir() {
        var on = cochees(), publies = on.filter(function (c) { return c.fait === 'publie'; }), partages = on.filter(function (c) { return c.fait === 'partage'; });
        if (publies.length || partages.length) poster({ action: 'aled08e_ao_fini', publies: publies.map(function (c) { return c.cle; }), partages: partages.map(function (c) { return c.cle; }), extrait: extrait() });
        var titre = $('[data-ao-fin-titre]', pub), ou = $('[data-ao-fin-ou]', pub), liens = $('[data-ao-fin-liens]', pub);
        titre.textContent = publies.length ? 'C’est publié !' : (fini ? 'C’est programmé !' : 'C’est prêt !');
        ou.textContent = ((publies.length ? 'Sur ' + liste(noms(publies)) + '.' : '') + (partages.length ? (publies.length ? ' Et prêt pour ' : 'Prêt pour ') + liste(noms(partages)) + '.' : '') + (fini ? ' ' + fini : '')).trim();
        liens.innerHTML = '';
        publies.forEach(function (c) { if (!c.url) return; var li = el('li'), a = el('a', '', 'Voir sur ' + c.nom); a.href = c.url; a.target = '_blank'; a.rel = 'noopener'; li.appendChild(a); liens.appendChild(li); });
        ecran(3);
        titre.focus({ preventScroll: true });
      }
      $('[data-ao-retour]', pub).addEventListener('click', function () { ecran(1); });
      $('[data-ao-nouvelle]', pub).addEventListener('click', function () {
        publierForm.reset(); boite.innerHTML = ''; cartes = []; fini = ''; dire(etat2, '');
        if (sec._viderPhoto) sec._viderPhoto();
        ecran(1);
      });
      /* le formulaire : Pépite écrit, puis l'écran 2 */
      publierForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        lancer(publierForm, function (blocs) {
          boite.innerHTML = ''; cartes = []; fini = ''; dire(etat2, ''); prog.hidden = true;
          blocs.forEach(function (b) { var c = carte(b); cartes.push(c); boite.appendChild(c.el); });
          majConsigne();
          ecran(2);
        });
      });
      /* une nouvelle photo : Pépite pourra republier, avec la nouvelle */
      apresPhoto.push(function () { photo.ref = ''; });
      /* « Publier cette idée » : l'idée devient les quelques mots de la publication */
      pub._utiliser = function (t) {
        var ta = $('textarea[name="c_description"]', publierForm), max = +(ta.getAttribute('data-max') || 600);
        ta.value = t.replace(/(^|\s)#\S+/g, '').replace(/\s+\n/g, '\n').trim().slice(0, max);
        ta.dispatchEvent(new Event('input'));
        montrer('publier'); ecran(1); ta.focus();
      };
      /* mes programmées : annuler */
      $$('[data-ao-deprog]', pub).forEach(function (b) {
        b.addEventListener('click', function () {
          b.disabled = true;
          poster({ action: 'aled08e_ao_deprogrammer', id: b.getAttribute('data-ao-deprog') }).then(function (j) {
            if (j && j.success) { var li = b.closest('li'), ul = li.parentNode; li.remove(); if (!ul.children.length) ul.closest('.ao-progs').remove(); }
            else b.disabled = false;
          }, function () { b.disabled = false; });
        });
      });
    }

    /* les autres formulaires : un résultat en blocs */
    $$('[data-ao-form]', sec).forEach(function (form) {
      if (form === publierForm) return;
      var res = form.parentNode.querySelector('[data-ao-res]');
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var bid = form.getAttribute('data-brique');
        lancer(form, function (blocs) {
          afficher(res, blocs, { boutique: bid === 'produit' && res.hasAttribute('data-ao-boutique'), utiliser: bid === 'idees' && pub && pub._utiliser });
        });
      });
    });

    /* ---------- mes réseaux : présenter Pépite, ne plus publier, choisir sa page ---------- */
    var recharger = function () { location.reload(); };
    $$('[data-rs-relier]', sec).forEach(function (f) {
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var et = $('[data-rs-etat]', f), b = $('button[type=submit]', f), donnees = { action: 'aled08e_rs', op: 'relier', reseau: f.getAttribute('data-rs-relier') };
        $$('input', f).forEach(function (i) { donnees[i.name] = i.value; });
        b.disabled = true; dire(et, 'Vérification…');
        poster(donnees).then(function (j) {
          if (j && j.success) { dire(et, j.data.message, 'is-ok'); setTimeout(recharger, 900); return; }
          b.disabled = false; dire(et, erreur(j, 'Ça n’a pas marché. Réessayez.'), 'is-err');
        }, function () { b.disabled = false; dire(et, 'La connexion a coupé. Réessayez.', 'is-err'); });
      });
    });
    $$('[data-rs-delier]', sec).forEach(function (b) {
      b.addEventListener('click', function () { b.disabled = true; poster({ action: 'aled08e_rs', op: 'delier', reseau: b.getAttribute('data-rs-delier') }).then(recharger, recharger); });
    });
    var selPage = $('[data-rs-page]', sec);
    if (selPage) selPage.addEventListener('change', function () { poster({ action: 'aled08e_rs', op: 'page', page: selPage.value }).then(recharger, recharger); });

    /* ---------- Mes avis Google : le lien, le message, le QR code ---------- */
    $$('[data-ao-avis-lien]', sec).forEach(function (f) {
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var et = $('[data-ao-etat]', f), b = $('button[type=submit]', f), v = $('input[name="lien"]', f).value.trim();
        if (!v) { dire(et, 'Collez d’abord votre lien.', 'is-err'); return; }
        b.disabled = true;
        poster({ action: 'aled08e_ao_avis_lien', lien: v }).then(function (j) {
          if (j && j.success) { dire(et, j.data.message, 'is-ok'); setTimeout(recharger, 700); return; }
          b.disabled = false; dire(et, erreur(j), 'is-err');
        }, function () { b.disabled = false; dire(et, 'La connexion a coupé. Réessayez.', 'is-err'); });
      });
    });
    var avis = $('[data-ao-avis]', sec);
    if (avis) {
      var msgA = $('[data-ao-avis-msg]', avis), st = $('.ol-bloc-msg', avis);
      var majLiens = function () {
        var t = msgA.value;
        $('[data-ao-avis-sms]', avis).href = 'sms:?&body=' + encodeURIComponent(t);
        $('[data-ao-avis-wa]', avis).href = 'https://wa.me/?text=' + encodeURIComponent(t);
        $('[data-ao-avis-mail]', avis).href = 'mailto:?subject=' + encodeURIComponent('Votre avis compte') + '&body=' + encodeURIComponent(t);
      };
      msgA.addEventListener('input', majLiens); majLiens();
      $('[data-ao-avis-copier]', avis).addEventListener('click', function () { copier(msgA.value, function (ok) { st.textContent = ok ? 'Copié : collez-le dans votre message.' : 'Sélectionnez le texte pour le copier.'; }); });
    }
    function dessinerQr() {
      if (typeof window.qrcode !== 'function') return false;
      $$('[data-ao-qr]', sec).forEach(function (box) {
        var qr = window.qrcode(0, 'M');
        qr.addData(box.getAttribute('data-ao-qr')); qr.make();
        var n = qr.getModuleCount(), m = 2, path = '';
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) path += 'M' + (c + m) + ',' + (r + m) + 'h1v1h-1z';
        var t = n + m * 2;
        box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" role="img" aria-label="QR code" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path fill="#2E2A47" d="' + path + '"/></svg>';
        var dl = $('[data-ao-qr-dl]', box.parentNode);
        if (!dl || dl._ok) return;
        dl._ok = true;
        /* l'image à imprimer : le code, et pour les avis une phrase dessous */
        dl.addEventListener('click', function () {
          var nom = box.getAttribute('data-ao-qr-nom') || '', avecTexte = box.hasAttribute('data-ao-qr-texte');
          var W = 1200, H = avecTexte ? 1500 : 1200, cv = el('canvas'), cx = cv.getContext('2d'), k = Math.floor(1000 / t), o = (W - k * t) / 2;
          cv.width = W; cv.height = H; cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H); cx.fillStyle = '#2E2A47';
          for (var r2 = 0; r2 < n; r2++) for (var c2 = 0; c2 < n; c2++) if (qr.isDark(r2, c2)) cx.fillRect(o + (c2 + m) * k, 60 + (r2 + m) * k, k, k);
          if (avecTexte) {
            cx.textAlign = 'center'; cx.textBaseline = 'top';
            cx.font = '800 72px "Plus Jakarta Sans", system-ui, Arial, sans-serif'; cx.fillText('Votre avis compte !', W / 2, 60 + k * t + 40);
            cx.font = '600 42px "Plus Jakarta Sans", system-ui, Arial, sans-serif'; cx.fillText('Visez ce code avec votre téléphone', W / 2, 60 + k * t + 140);
            if (nom) { cx.font = '700 40px "Plus Jakarta Sans", system-ui, Arial, sans-serif'; cx.fillText(nom.slice(0, 48), W / 2, 60 + k * t + 210); }
          }
          if (cv.toBlob) cv.toBlob(function (b) { if (b) telecharger(b, avecTexte ? 'qr-code-avis.png' : 'qr-code.png'); }, 'image/png');
        });
      });
      return true;
    }
    if ($('[data-ao-qr]', sec) && !dessinerQr()) window.addEventListener('load', dessinerQr);

    /* ---------- Fiche produit : la photo recadrée et allégée, dans le navigateur ---------- */
    var fz = $('[data-ao-formats]', sec);
    if (fz) {
      var FORMATS = [
        ['Pour votre site, légère', 1600, 0], ['Boutique, carré', 1080, 1080], ['Instagram, portrait', 1080, 1350], ['Story et Reel', 1080, 1920],
        ['Facebook et LinkedIn', 1200, 630], ['Fiche Google', 1200, 900]
      ];
      var fl = $('[data-formats-liste]', fz), info = $('[data-formats-info]', fz);
      var poids = function (o) { return o > 1048576 ? (o / 1048576).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(o / 1024)) + ' Ko'; };
      var preparer = function () {
        fl.innerHTML = '';
        if (!photo.blob) { dire(info, 'Choisissez d’abord la photo, en haut.'); return; }
        var img = new Image(), url = URL.createObjectURL(photo.blob);
        img.onload = function () {
          dire(info, 'Votre photo : ' + img.naturalWidth + ' × ' + img.naturalHeight + '. Touchez « Télécharger » sous le format voulu.');
          FORMATS.forEach(function (F) {
            var c = el('canvas'), W = F[1], H = F[2];
            if (!H) { var r = Math.min(1, W / Math.max(img.naturalWidth, img.naturalHeight)); W = Math.round(img.naturalWidth * r); H = Math.round(img.naturalHeight * r); c.width = W; c.height = H; c.getContext('2d').drawImage(img, 0, 0, W, H); }
            else { c.width = W; c.height = H; var k = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k; c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) / 2, w, h); }
            var fig = el('figure', 'ol-format'), cap = el('figcaption'), taille = el('small', '', W + ' × ' + H), a = el('a', 'btn btn-light btn-sm', 'Télécharger');
            fig.appendChild(c); cap.appendChild(el('strong', '', F[0])); cap.appendChild(taille);
            a.download = 'photo-' + W + 'x' + H + '.jpg'; cap.appendChild(a); fig.appendChild(cap); fl.appendChild(fig);
            if (c.toBlob) c.toBlob(function (bl) { if (!bl) { a.href = c.toDataURL('image/jpeg', 0.82); return; } a.href = URL.createObjectURL(bl); taille.textContent = W + ' × ' + H + ', ' + poids(bl.size); }, 'image/jpeg', 0.82);
            else a.href = c.toDataURL('image/jpeg', 0.82);
          });
          URL.revokeObjectURL(url);
        };
        img.src = url;
      };
      apresPhoto.push(preparer);
      preparer();
    }

    /* retour d'une liaison (Facebook, LinkedIn) ou lien vers un outil : on l'amène à l'écran */
    if (new URLSearchParams(location.search).get('outil') === outil) setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400);
  });
})();
