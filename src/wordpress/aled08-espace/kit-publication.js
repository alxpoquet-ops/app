/* Les Minis Monstres : le kit de publication de Publier partout (Pépite). Une carte par réseau, un bouton par réseau.
 *  - lien prérempli (X, Threads, Bluesky, LinkedIn, WhatsApp, Pinterest) : le réseau s'ouvre avec le texte déjà écrit ;
 *  - publication assistée (Instagram, Facebook, TikTok, YouTube, Fiche Google) : sur téléphone, la légende est copiée et
 *    le partage du téléphone s'ouvre avec LE bon fichier (photo 4:5 ou vidéo) ; sur ordinateur, le fichier est téléchargé,
 *    la légende copiée, la page du réseau ouverte, et un QR code mène au même kit sur le téléphone ;
 *  - publication directe (réseau présenté à Pépite, outils.js) : elle passe avant, la carte le dit.
 * Utilisé par l'outil (outils.js, LMMKit.monter) et par la page du lien personnel (/mon-espace/?kit=…, plus bas).
 * Les fichiers sont calculés dans le navigateur par kit-video.js. Les textes ne sont jamais insérés comme du HTML. */
(function () {
  'use strict';
  var d = document, K = window.LMMKit = window.LMMKit || {};
  function $(s, r) { return (r || d).querySelector(s); }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function bouton(cls, txt) { var b = el('button', 'btn ' + cls, txt); b.type = 'button'; return b; }
  var tactile = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  K.tactile = tactile;

  K.copier = function (txt, fini) {
    fini = fini || function () {};
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) { navigator.clipboard.writeText(txt).then(function () { fini(true); }, function () { fini(vieuxCopier(txt)); }); return; }
    fini(vieuxCopier(txt));
  };
  function vieuxCopier(txt) {
    var t = el('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; d.body.appendChild(t); t.select();
    var ok = false; try { ok = d.execCommand('copy'); } catch (e) {} d.body.removeChild(t); return ok;
  }
  K.telecharger = function (blob, nom) {
    var a = el('a'), u = URL.createObjectURL(blob);
    a.href = u; a.download = nom; d.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 8000);
  };
  var toastT = 0;
  K.toast = function (txt) {
    var t = $('.kp-toast') || d.body.appendChild(el('div', 'kp-toast'));
    t.setAttribute('role', 'status'); t.textContent = txt; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 4500);
  };
  K.qr = function (box, url) {
    if (!box || typeof window.qrcode !== 'function') return false;
    var qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
    var n = qr.getModuleCount(), m = 2, path = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) path += 'M' + (c + m) + ',' + (r + m) + 'h1v1h-1z';
    var t = n + m * 2;
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" role="img" aria-label="QR code vers votre publication" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path fill="#2E2A47" d="' + path + '"/></svg>';
    return true;
  };

  /* ---------- le texte d'un réseau ---------- */
  K.tags = function (s) {
    var vus = {}, l = [];
    String(s || '').split(/[\s,;]+/).forEach(function (h) {
      h = h.replace(/[^\p{L}\p{N}_]/gu, '');
      if (!h || /^\d+$/.test(h) || h.length > 40) return;
      var k = h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (vus[k]) return; vus[k] = 1; l.push('#' + h);
    });
    return l;
  };
  // la longueur comptée par le réseau (X compte double les émojis et les écritures d'Asie)
  K.longueur = function (id, t) {
    var n = 0;
    Array.from(String(t || '')).forEach(function (c) {
      var o = c.codePointAt(0);
      n += id !== 'x' || o <= 0x10FF || (o >= 0x2000 && o <= 0x200D) || (o >= 0x2010 && o <= 0x201F) || (o >= 0x2032 && o <= 0x2037) ? 1 : 2;
    });
    return n;
  };
  K.assembler = function (id, r) {
    var t = String(r.texte || '').trim();
    if (id === 'site' && String(r.titre || '').trim()) t = String(r.titre).trim() + '\n\n' + t;
    return r.hashtags && r.hashtags.length ? t.replace(/\s+$/, '') + '\n\n' + r.hashtags.join(' ') : t;
  };
  function lienDe(modele, v) {
    return modele.replace('{texte}', encodeURIComponent(v.texte || '')).replace('{url}', encodeURIComponent(v.url || '')).replace('{media}', encodeURIComponent(v.media || ''));
  }

  /* =========================================================================
   *  Monter un kit : o = { kit, defs, photo: () => Promise<Blob|null>, photoUrl, site, directs, cases,
   *    fichiersBoite, cartesBoite, surChange(), surFait(carte, mode), versTel() }
   *  Rend { cartes, donnees(), fichier(cle), nouvellePhoto(), photoUrl(u), detruire() }
   * ========================================================================= */
  K.monter = function (o) {
    var defs = o.defs || {}, kit = o.kit || { ordre: [], reseaux: {} }, directs = o.directs || [];
    var etat = { src: null, cadrage: 'auto', fichiers: {}, urls: [], video: null, videoP: null, videoN: 0, titreOn: false, titre: kit.titre_image || '', photoUrl: o.photoUrl || '', fini: false };
    var cartes = [];
    var NOMS = { '45': 'photo-4x5', '11': 'photo-carree', '916': 'story', '23': 'pinterest' };
    // la vidéo se prépare d'avance pour TikTok et YouTube (le partage du téléphone doit partir tout de suite au toucher) ;
    // pour un Reel ou une vidéo Facebook, au premier toucher
    var besoinVideo = (kit.ordre || []).some(function (id) { return defs[id] && defs[id].fichier === 'video'; });

    function garderUrl(u) { etat.urls.push(u); return u; }
    function oublierUrls() { etat.urls.forEach(function (u) { URL.revokeObjectURL(u); }); etat.urls = []; }

    /* ---------- les fichiers : les formats de la photo, puis la vidéo ---------- */
    var boiteF = o.fichiersBoite, grille, video = {};
    function dessinerBoite() {
      boiteF.innerHTML = '';
      var tete = el('div', 'kp-fichiers-tete');
      tete.appendChild(el('strong', '', 'Vos fichiers, au bon format'));
      var sel = el('select'); sel.setAttribute('aria-label', 'Cadrage de la photo');
      [['auto', 'Cadrage automatique'], ['flou', 'Toute la photo, fond flouté'], ['recadrer', 'Remplir le cadre (recadrée)']].forEach(function (x) { var op = el('option', '', x[1]); op.value = x[0]; if (x[0] === etat.cadrage) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', function () { etat.cadrage = sel.value; preparer(true); });
      boiteF.appendChild(tete);
      grille = el('div', 'kp-grille');
      if (!etat.src) {
        boiteF.appendChild(el('p', 'app-note', 'Ajoutez une photo : Pépite la met au bon format pour chaque réseau, et en fait une courte vidéo pour TikTok, YouTube Shorts et les Reels.'));
        if (o.ajouterPhoto) boiteF.appendChild(o.ajouterPhoto());
        return;
      }
      tete.appendChild(sel);
      boiteF.appendChild(el('p', 'app-note', 'Tout est préparé sur votre appareil : rien n’est envoyé ailleurs.'));
      boiteF.appendChild(grille);
    }
    function figure(cle, F) {
      var fig = el('figure', 'kp-fig'), img = el('img'), cap = el('figcaption'), taille = el('small', '', F.taille);
      img.alt = 'Aperçu ' + F.nom; img.width = 150; img.height = 150;
      cap.appendChild(el('strong', '', F.nom)); cap.appendChild(taille);
      var dl = bouton('btn-light btn-sm', 'Télécharger');
      dl.addEventListener('click', function () { var f = etat.fichiers[cle]; if (f) K.telecharger(f.blob, NOMS[cle] + '.jpg'); });
      cap.appendChild(dl);
      fig.appendChild(img); fig.appendChild(cap);
      return { fig: fig, img: img, taille: taille };
    }
    function poids(n) { return n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko'; }
    function preparer(refaire) {
      return o.photo().then(function (blob) {
        if (!blob) { etat.src = null; dessinerBoite(); majCartes(); return; }
        return (etat.src && !refaire ? Promise.resolve(etat.src) : K.ouvrir(blob).then(function (s) { if (etat.src && etat.src !== s) etat.src.fermer(); etat.src = s; return s; })).then(function (src) {
          oublierUrls(); etat.fichiers = {};
          dessinerBoite();
          var cles = ['45', '916', '11', '23'].filter(function (c) { return K.FORMATS[c]; }), figs = {};
          cles.forEach(function (c) { figs[c] = figure(c, K.FORMATS[c]); grille.appendChild(figs[c].fig); });
          figureVideo();
          // une image à la fois : la page reste fluide
          return cles.reduce(function (p, c) {
            return p.then(function () {
              return K.image(src, c, etat.cadrage).then(function (f) {
                etat.fichiers[c] = f;
                figs[c].img.src = garderUrl(URL.createObjectURL(f.blob));
                figs[c].taille.textContent = K.FORMATS[c].taille + ', ' + poids(f.blob.size);
              });
            });
          }, Promise.resolve()).then(function () {
            majCartes();
            if (besoinVideo || etat.video) lancerVideo();
          });
        });
      }).catch(function () {
        boiteF.innerHTML = '';
        boiteF.appendChild(el('p', 'ol-etat is-err', 'Cette photo ne s’ouvre pas ici. Enregistrez-la en JPG (ou faites une capture d’écran), puis réessayez.'));
      });
    }
    function figureVideo() {
      var fig = el('figure', 'kp-fig kp-video'), place = el('div', 'kp-attente', 'Vidéo'), ctl = el('figcaption', 'kp-video-ctl');
      ctl.appendChild(el('strong', '', 'Vidéo pour TikTok, YouTube Shorts et les Reels'));
      var info = el('small', '', '1080 × 1920, 7 secondes, sans son : ajoutez une musique dans l’appli si vous voulez.');
      ctl.appendChild(info);
      var barre = el('div', 'kp-barre'), plein = el('span'); barre.appendChild(plein);
      barre.setAttribute('role', 'progressbar'); barre.setAttribute('aria-label', 'Préparation de la vidéo'); barre.setAttribute('aria-valuemin', '0'); barre.setAttribute('aria-valuemax', '100'); barre.hidden = true;
      ctl.appendChild(barre);
      var cas = el('label', 'ao-case'), cb = el('input'); cb.type = 'checkbox'; cb.checked = etat.titreOn;
      cas.appendChild(cb); cas.appendChild(d.createTextNode(' Écrire un titre sur la vidéo'));
      var ti = el('input'); ti.type = 'text'; ti.maxLength = 40; ti.value = etat.titre; ti.hidden = !etat.titreOn; ti.setAttribute('aria-label', 'Titre écrit sur la vidéo');
      ctl.appendChild(cas); ctl.appendChild(ti);
      var act = el('div', 'ol-bloc-actions'), go = bouton('btn-primary btn-sm', 'Préparer la vidéo'), dl = bouton('btn-light btn-sm', 'Télécharger');
      dl.hidden = true;
      act.appendChild(go); act.appendChild(dl); ctl.appendChild(act);
      var msg = el('p', 'ol-etat'); msg.setAttribute('role', 'status'); ctl.appendChild(msg);
      fig.appendChild(place); fig.appendChild(ctl); grille.appendChild(fig);
      video = { fig: fig, place: place, barre: barre, plein: plein, go: go, dl: dl, msg: msg, info: info };
      var refaire = 0;
      var change = function () { clearTimeout(refaire); refaire = setTimeout(lancerVideo, 900); };
      cb.addEventListener('change', function () { etat.titreOn = cb.checked; ti.hidden = !cb.checked; if (cb.checked && !ti.value.trim()) ti.focus(); if (etat.video || etat.videoP) change(); if (o.surChange) o.surChange(); });
      ti.addEventListener('input', function () { etat.titre = ti.value; if (etat.titreOn && (etat.video || etat.videoP)) change(); if (o.surChange) o.surChange(); });
      go.addEventListener('click', lancerVideo);
      dl.addEventListener('click', function () { if (etat.video) K.telecharger(etat.video.blob, 'video-verticale.' + etat.video.ext); });
      if (!K.videoPossible || !K.videoPossible()) { go.hidden = true; place.textContent = 'Vidéo impossible ici'; msg.textContent = 'Ce navigateur ne sait pas fabriquer de vidéo. Ouvrez le lien sur votre téléphone, ou publiez la photo.'; }
      if (etat.video) montrerVideo();
    }
    function montrerVideo() {
      var v = el('video'); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.controls = true; v.preload = 'metadata';
      if (etat.fichiers['916']) v.poster = garderUrl(URL.createObjectURL(etat.fichiers['916'].blob));
      v.src = garderUrl(URL.createObjectURL(etat.video.blob));
      v.setAttribute('aria-label', 'Aperçu de la vidéo');
      if (video.place && video.place.parentNode) video.fig.replaceChild(v, video.place);
      video.place = v;
      video.barre.hidden = true; video.dl.hidden = false; video.go.textContent = 'Refaire la vidéo';
      video.msg.className = 'ol-etat is-ok';
      video.msg.textContent = etat.video.ext === 'mp4' ? 'La vidéo est prête (MP4, ' + poids(etat.video.blob.size) + ').' : 'La vidéo est prête, au format WebM (ce navigateur ne sait pas faire de MP4) : TikTok et YouTube l’acceptent ; pour Instagram, ouvrez plutôt le lien sur votre téléphone.';
    }
    function lancerVideo() {
      if (!etat.src || !video.go || !K.videoPossible || !K.videoPossible()) return;
      var n = ++etat.videoN;
      video.go.disabled = true; video.barre.hidden = false; video.plein.style.width = '0%'; video.msg.className = 'ol-etat'; video.msg.textContent = 'Pépite prépare la vidéo…';
      var p = K.video(etat.src, {
        titre: etat.titreOn ? etat.titre : '', cadrage: etat.cadrage,
        progres: function (x) { if (n !== etat.videoN) return; var pc = Math.round(x * 100); video.plein.style.width = pc + '%'; video.barre.setAttribute('aria-valuenow', String(pc)); },
        annule: function () { return n !== etat.videoN || etat.fini; }
      });
      etat.videoP = p;
      p.then(function (v) {
        if (n !== etat.videoN) return;
        etat.videoP = null; etat.video = v; video.go.disabled = false;
        montrerVideo(); majCartes();
      }, function (e) {
        if (n !== etat.videoN) return;
        etat.videoP = null; video.go.disabled = false; video.barre.hidden = true;
        video.msg.className = 'ol-etat is-err'; video.msg.textContent = 'La vidéo n’a pas pu se faire ici. Essayez sur votre téléphone, ou publiez la photo.';
      });
    }
    /* le fichier d'un format, prêt : une image (Blob) ou la vidéo */
    function fichier(cle) {
      if (cle === 'video') return etat.video ? { blob: etat.video.blob, nom: 'video-verticale.' + etat.video.ext, type: etat.video.type } : null;
      var f = etat.fichiers[cle];
      return f ? { blob: f.blob, nom: NOMS[cle] + '.jpg', type: 'image/jpeg' } : null;
    }
    function enFichier(f) { try { return new File([f.blob], f.nom, { type: f.type }); } catch (e) { return null; } }
    function partageable(file) { return !!(tactile && file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); }

    /* ---------- les cartes, une par réseau ---------- */
    function carte(id) {
      var def = defs[id], r = kit.reseaux[id] || { texte: '', hashtags: [], titre: '' };
      var direct = directs.indexOf(id) !== -1, c = { cle: id, nom: def.nom, direct: direct, def: def };
      var e = el('div', 'ao-carte kp-carte'), tete = el(o.cases ? 'label' : 'div', 'ao-carte-tete' + (o.cases ? ' a-case' : ''));
      if (o.cases) { var cb = el('input'); cb.type = 'checkbox'; cb.checked = true; tete.appendChild(cb); c.cb = cb; }
      else c.cb = { checked: true };
      var mini = el('img', 'kp-mini'); mini.alt = ''; mini.hidden = true; mini.width = 40; mini.height = 40;
      var nomBox = el('span', 'kp-nom'), mode = el('small', 'ao-mode');
      mode.textContent = direct ? (id === 'site' ? 'Pépite la publie sur votre site' : 'Pépite publie directement') : def.mode === 'lien' ? 'Texte déjà rempli' : def.mode === 'assiste' ? 'Fichier prêt, texte copié' : 'À copier';
      if (direct) mode.classList.add('is-direct');
      nomBox.appendChild(el('strong', '', def.long || def.nom)); nomBox.appendChild(mode);
      tete.appendChild(mini); tete.appendChild(nomBox);
      e.appendChild(tete);
      var champ = function (lab, input) { var w = el('label', 'kp-champ'); w.appendChild(el('span', '', lab)); w.appendChild(input); e.appendChild(w); return input; };
      if (def.titre) { var ti = el('textarea', 'kp-titre'); ti.rows = 2; ti.value = r.titre || ''; c.titre = champ(id === 'site' ? 'Titre de l’actualité' : 'Titre', ti); }
      var ta = el('textarea'); ta.value = r.texte || '';
      ta.rows = Math.min(9, Math.max(3, Math.ceil((r.texte || '').length / 40) + ((r.texte || '').match(/\n/g) || []).length));
      ta.setAttribute('aria-label', 'Texte pour ' + def.nom);
      e.appendChild(ta); c.ta = ta;
      if (def.tags && def.tags[1] > 0) { var tg = el('textarea', 'kp-tags'); tg.rows = 2; tg.value = (r.hashtags || []).join(' '); tg.setAttribute('autocapitalize', 'off'); tg.spellcheck = false; c.tg = champ('Hashtags', tg); }
      var compte = el('small', 'kp-compte');
      e.appendChild(compte);
      c.donnees = function () { return { texte: ta.value.trim(), hashtags: c.tg ? K.tags(c.tg.value) : [], titre: c.titre ? c.titre.value.trim() : '' }; };
      c.texte = function () { return K.assembler(id, c.donnees()); };
      var maj = function () {
        var n = K.longueur(id, c.texte()), trop = def.max && n > def.max;
        compte.textContent = n + (def.max ? ' sur ' + def.max : '') + ' caractères' + (trop ? ' : c’est trop long pour ' + def.nom + ', raccourcissez-le.' : '');
        compte.classList.toggle('is-trop', !!trop);
        if (c.titre && def.titre && c.titre.value.length > def.titre) { compte.textContent += ' Le titre fait ' + c.titre.value.length + ' caractères (' + def.titre + ' au plus).'; compte.classList.add('is-trop'); }
      };
      [ta, c.tg, c.titre].forEach(function (x) { if (x) x.addEventListener('input', function () { maj(); if (o.surChange) o.surChange(); }); });
      if (c.tg) c.tg.addEventListener('change', function () { c.tg.value = K.tags(c.tg.value).join(' '); maj(); });
      maj();
      var actions = el('div', 'ol-bloc-actions'), msg = el('span', 'ol-bloc-msg'); msg.setAttribute('role', 'status');
      c.dire = function (t, err) { msg.className = 'ol-bloc-msg' + (err ? ' is-err' : ''); msg.textContent = t || ''; };
      c.msg = msg;
      var principal = null;
      if (!direct && def.mode === 'lien') principal = bouton('btn-primary btn-sm', id === 'whatsapp' ? 'Envoyer sur WhatsApp' : id === 'pinterest' ? 'Épingler sur Pinterest' : 'Publier sur ' + def.nom);
      else if (!direct && def.mode === 'assiste') principal = bouton('btn-primary btn-sm', 'Publier sur ' + (id === 'google' ? 'ma fiche Google' : def.nom));
      if (principal) { principal.addEventListener('click', function () { agir(c, def.fichier); }); actions.appendChild(principal); c.bp = principal; }
      // les autres façons : Reel, story, ou la photo avec un réseau à lien prérempli
      var autres = def.autres || (def.mode === 'lien' && id !== 'pinterest' ? { '45': 'Avec la photo' } : {});
      c.autres = {};
      Object.keys(autres).forEach(function (cle) {
        var b2 = bouton('btn-light btn-sm', autres[cle]);
        b2.addEventListener('click', function () { if (def.mode === 'lien') avecPhoto(c); else agir(c, cle); });
        actions.appendChild(b2); c.autres[cle] = b2;
      });
      if (id === 'pinterest' && c.titre) { var bt2 = bouton('btn-light btn-sm', 'Copier le titre'); bt2.addEventListener('click', function () { K.copier(c.titre.value.trim(), function (ok) { c.dire(ok ? 'Titre copié : collez-le dans Pinterest.' : 'Sélectionnez le titre pour le copier.'); }); }); actions.appendChild(bt2); }
      if (id === 'youtube') { var bd = bouton('btn-light btn-sm', 'Copier la description'); bd.addEventListener('click', function () { var t = K.assembler(id, { texte: c.donnees().texte, hashtags: c.donnees().hashtags }); K.copier(t, function (ok) { c.dire(ok ? 'Description copiée : collez-la dans YouTube.' : 'Sélectionnez le texte pour le copier.'); }); }); actions.appendChild(bd); }
      var bc = bouton('btn-light btn-sm', 'Copier');
      bc.addEventListener('click', function () { K.copier(c.texte(), function (ok) { c.dire(ok ? 'Copié.' : 'Sélectionnez le texte pour le copier.'); }); });
      actions.appendChild(bc); actions.appendChild(msg); e.appendChild(actions);
      if (o.cases) c.cb.addEventListener('change', function () { e.classList.toggle('is-off', !c.cb.checked); if (o.surChange) o.surChange(); });
      if (!direct && def.mode === 'direct') c.dire('Se publie depuis votre espace, avec Publier partout. Ici, copiez le texte.');
      c.el = e; c.mini = mini;
      return c;
    }
    function majCartes() {
      cartes.forEach(function (c) {
        var f = c.def.fichier && c.def.fichier !== 'video' ? etat.fichiers[c.def.fichier] : null;
        if (c.def.fichier === 'video' && etat.fichiers['916']) f = etat.fichiers['916'];
        if (f && f.blob) { c.mini.src = garderUrl(URL.createObjectURL(f.blob)); c.mini.hidden = false; } else c.mini.hidden = true;
        if (c.def.fichier === 'video' && c.bp && !c.direct) c.bp.textContent = 'Publier sur ' + c.def.nom + (etat.video ? '' : etat.videoP ? ' (vidéo en préparation…)' : '');
      });
    }
    function legende(c, cle) {
      var x = c.donnees();
      if (c.cle === 'youtube') return cle === 'video' ? (x.titre || x.texte).slice(0, 100) : c.texte();
      return c.texte();
    }
    /* le bouton d'un réseau */
    function agir(c, cle) {
      var def = c.def;
      if (def.mode === 'lien') return parLien(c);
      if (!etat.src) { c.dire(def.nom + ' demande ' + (cle === 'video' ? 'une vidéo : ajoutez une photo, Pépite en fait une vidéo.' : 'une photo : ajoutez-en une.'), true); return; }
      var f = fichier(cle);
      if (!f) {
        if (cle === 'video') { if (!etat.videoP) lancerVideo(); c.dire('La vidéo se prépare : touchez à nouveau le bouton dans un instant.'); }
        else c.dire('La photo se prépare : touchez à nouveau dans un instant.');
        return;
      }
      var titre = c.cle === 'youtube' && cle === 'video', cap = legende(c, cle), file = enFichier(f);
      var quoi = titre ? 'Titre copié : collez-le' : 'Légende copiée : collez-la';
      K.copier(cap);
      if (def.partage !== false && partageable(file)) {
        K.toast(quoi + ' dans ' + def.nom + '.');
        c.dire(quoi + ' dans ' + def.nom + '.');
        navigator.share({ files: [file], title: def.nom }).then(function () { fait(c, 'partage'); }, function (e) {
          if (e && e.name === 'AbortError') { c.dire('Partage annulé. ' + (titre ? 'Le titre reste copié.' : 'La légende reste copiée.')); return; }
          surOrdinateur(c, f, cap);
        });
        return;
      }
      surOrdinateur(c, f, cap);
    }
    function surOrdinateur(c, f, cap) {
      var def = c.def;
      K.telecharger(f.blob, f.nom);
      if (def.ouvrir) window.open(def.ouvrir, '_blank', 'noopener');
      var dit = (f.type.indexOf('video') === 0 ? 'Vidéo téléchargée' : 'Photo téléchargée') + ', ' + (c.cle === 'youtube' ? 'titre copié' : 'légende copiée') + '. ' + (def.aide || '');
      c.dire(dit + (o.versTel && !tactile ? ' Plus simple : visez le QR code avec votre téléphone.' : ''));
      if (o.versTel && !tactile) o.versTel();
      fait(c, 'partage');
    }
    function parLien(c) {
      var def = c.def, t = c.texte();
      if (def.media && !etat.photoUrl) { c.dire(def.nom + ' demande une photo en ligne : ajoutez une photo, ou utilisez « Copier ».', true); return; }
      if (def.max && K.longueur(c.cle, t) > def.max) { c.dire('Ce texte est trop long pour ' + def.nom + ' (' + def.max + ' caractères). Raccourcissez-le, puis touchez à nouveau.', true); c.ta.focus(); return; }
      var u = lienDe(def.lien, { texte: t, url: o.site || '', media: etat.photoUrl });
      K.copier(t);
      window.open(u, '_blank', 'noopener');
      c.dire(def.media ? 'Pinterest s’ouvre avec la photo et le texte. Choisissez le tableau, puis enregistrez.' : 'Le texte est déjà écrit dans ' + def.nom + ' (et copié, au cas où). ' + (def.fichier && etat.src ? 'Pour ajouter la photo : « Avec la photo ».' : ''));
      fait(c, 'partage');
    }
    function avecPhoto(c) {
      var f = fichier('45');
      if (!f) { c.dire(etat.src ? 'La photo se prépare : touchez à nouveau dans un instant.' : 'Ajoutez d’abord une photo.', true); return; }
      var t = c.texte(), file = enFichier(f);
      K.copier(t);
      if (partageable(file)) {
        K.toast('Texte copié : collez-le dans ' + c.def.nom + '.');
        navigator.share({ files: [file], text: t }).then(function () { fait(c, 'partage'); }, function (e) { if (!e || e.name !== 'AbortError') { K.telecharger(f.blob, f.nom); c.dire('Photo téléchargée et texte copié.'); } });
        return;
      }
      K.telecharger(f.blob, f.nom);
      c.dire('Photo téléchargée et texte copié : dans ' + c.def.nom + ', ajoutez la photo à votre publication.');
    }
    function fait(c, mode) { c.fait = c.fait || mode; c.el.classList.add('is-fait'); if (o.surFait) o.surFait(c, mode); }

    (kit.ordre || []).forEach(function (id) { if (defs[id]) { var c = carte(id); cartes.push(c); o.cartesBoite.appendChild(c.el); } });
    preparer(true);

    return {
      cartes: cartes,
      donnees: function () {
        var r = {};
        cartes.forEach(function (c) { r[c.cle] = c.donnees(); });
        return { ordre: kit.ordre, reseaux: r, titre_image: etat.titre };
      },
      fichier: fichier,
      nouvellePhoto: function () { etat.video = null; etat.videoN++; return preparer(true); },
      photoUrl: function (u) { etat.photoUrl = u || ''; },
      detruire: function () { etat.fini = true; etat.videoN++; oublierUrls(); if (etat.src) etat.src.fermer(); etat.src = null; o.cartesBoite.innerHTML = ''; boiteF.innerHTML = ''; }
    };
  };

  /* =========================================================================
   *  La page du lien personnel (/mon-espace/?kit=…) : le kit, sans connexion
   * ========================================================================= */
  function bascule() {
    var h = d.documentElement, b = $('[data-kp-theme]');
    if (!b) return;
    var appliquer = function (t) {
      h.setAttribute('data-theme', t);
      var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#16142A' : '#FFF8F2');
      var c = $('meta[name="color-scheme"]'); if (c) c.setAttribute('content', t === 'dark' ? 'dark' : 'light');
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false'); b.setAttribute('aria-label', t === 'dark' ? 'Passer en apparence claire' : 'Passer en apparence sombre');
    };
    appliquer(h.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    b.addEventListener('click', function () { var t = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; appliquer(t); try { localStorage.setItem('mm-theme', t); } catch (e) {} });
  }
  function page() {
    bascule();
    var racine = $('[data-kp-page]'), donnees = $('#kp-donnees');
    if (!racine || !donnees || !K.monter) return;
    var D = {};
    try { D = JSON.parse(donnees.textContent); } catch (e) { return; }
    var photo = null;
    K.monter({
      kit: D.kit, defs: D.defs, photoUrl: D.photo, site: D.site, directs: [], cases: false,
      fichiersBoite: $('[data-kp-fichiers]', racine), cartesBoite: $('[data-kp-cartes]', racine),
      photo: function () {
        if (photo || !D.photo) return Promise.resolve(photo);
        return fetch(D.photo, { credentials: 'omit' }).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) { photo = b; return b; }, function () { return null; });
      }
    });
    // sur ordinateur : le même lien en QR code, pour le téléphone
    var ici = $('[data-kp-ici]', racine);
    if (ici && !tactile) {
      var dessiner = function () { if (K.qr($('[data-kp-qr]', ici), location.href)) ici.hidden = false; };
      if (typeof window.qrcode === 'function') dessiner(); else window.addEventListener('load', dessiner);
    }
    var oubli = $('[data-kp-oubli]', racine), et = $('[data-kp-etat]', racine);
    if (oubli) oubli.addEventListener('click', function () {
      if (!window.confirm('Effacer cette publication et sa photo ? Le lien ne marchera plus.')) return;
      var fd = new FormData();
      fd.append('action', 'aled08e_kit_oubli'); fd.append('kit', new URLSearchParams(location.search).get('kit') || '');
      oubli.disabled = true;
      fetch(D.ajax, { method: 'POST', body: fd, credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.success) { location.reload(); return; }
        oubli.disabled = false; et.className = 'ol-etat is-err'; et.textContent = (j && j.data && j.data.message) || 'Ça n’a pas marché. Réessayez.';
      }, function () { oubli.disabled = false; et.className = 'ol-etat is-err'; et.textContent = 'Pas de connexion. Réessayez.'; });
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', page); else page();
  try { d.dispatchEvent(new Event('lmmkit')); } catch (e) {}
})();
