/* Les Minis Monstres : les fichiers du kit de publication (Publier partout), calculés dans le navigateur.
 * Rien n'est envoyé à un service extérieur : la photo du client devient ici les bons formats d'image et une courte vidéo.
 *  LMMKit.FORMATS                      les formats d'image (Instagram 4:5, carré, story, Pinterest)
 *  LMMKit.ouvrir(blob)                 la photo prête à dessiner : { img, w, h, fermer() }
 *  LMMKit.image(src, cle, cadrage)     une image JPEG au format cle : Promise<{ blob, W, H, cadrage }>
 *  LMMKit.video(src, options)          la vidéo verticale 1080 × 1920 (7,5 s, zoom lent, titre facultatif) :
 *                                      Promise<{ blob, type, ext, via }>. MP4 (H.264) par WebCodecs et mp4-muxer
 *                                      (vendor/mp4-muxer.js, licence MIT, chargé seulement à ce moment-là) ; sinon
 *                                      MediaRecorder (MP4 si le navigateur sait, sinon WebM). Pas de son.
 * cadrage : 'flou' (toute la photo, sur un fond flouté de la même photo), 'recadrer' (remplit le cadre, centré)
 * ou 'auto' (recadrer si on perd peu, sinon flou ; flou pour les formats verticaux). */
(function () {
  'use strict';
  var K = window.LMMKit = window.LMMKit || {};
  var ICI = (document.currentScript && document.currentScript.src) || '';
  K.FORMATS = {
    '45': { nom: 'Instagram et Facebook', taille: 'Portrait 4:5', W: 1080, H: 1350 },
    '11': { nom: 'Carré', taille: 'Carré 1:1', W: 1080, H: 1080 },
    '916': { nom: 'Story', taille: 'Vertical 9:16', W: 1080, H: 1920 },
    '23': { nom: 'Pinterest', taille: 'Épingle 2:3', W: 1000, H: 1500 }
  };
  K.VIDEO = { W: 1080, H: 1920, duree: 7.5, fps: 30 };

  function toile(W, H) { var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function attendre(ms) { return new Promise(function (ok) { setTimeout(ok, ms || 0); }); }

  /* ---------- la photo ---------- */
  function viaImg(blob) {
    return new Promise(function (ok, ko) {
      var u = URL.createObjectURL(blob), i = new Image();
      i.decoding = 'async';
      i.onload = function () { ok({ img: i, w: i.naturalWidth, h: i.naturalHeight, fermer: function () { URL.revokeObjectURL(u); } }); };
      i.onerror = function () { URL.revokeObjectURL(u); ko(new Error('photo')); };
      i.src = u;
    });
  }
  K.ouvrir = function (blob) {
    if (!blob) return Promise.reject(new Error('photo'));
    if (window.createImageBitmap) {
      return createImageBitmap(blob, { imageOrientation: 'from-image' }).then(function (b) {
        return { img: b, w: b.width, h: b.height, fermer: function () { if (b.close) b.close(); } };
      }, function () { return viaImg(blob); });
    }
    return viaImg(blob);
  };

  /* ---------- le cadrage ---------- */
  // la part de la photo perdue si on remplit le cadre W × H
  K.perte = function (w, h, W, H) { var r = w / h, R = W / H; return r > R ? 1 - R / r : 1 - r / R; };
  K.cadrage = function (choix, src, cle) {
    if (choix === 'flou' || choix === 'recadrer') return choix;
    var F = cle === 'video' ? K.VIDEO : K.FORMATS[cle], p = K.perte(src.w, src.h, F.W, F.H);
    if (cle === 'video' || cle === '916' || cle === '23') return p < 0.06 ? 'recadrer' : 'flou';
    return p <= 0.22 ? 'recadrer' : 'flou';
  };
  // le fond : la même photo, très floutée et un peu assombrie. Le flou du navigateur quand il existe (ctx.filter),
  // sinon des réductions et agrandissements par moitiés, qui lissent aussi bien (Safari ancien)
  function fond(src, W, H) {
    var c = toile(W, H), cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    var k = Math.max(W / src.w, H / src.h) * 1.12, w = src.w * k, h = src.h * k;
    if (typeof cx.filter === 'string') {
      cx.drawImage(src.img, (W - w) / 2, (H - h) / 2, w, h); // sous le flou : pas de bord transparent
      cx.filter = 'blur(' + Math.round(Math.max(W, H) / 40) + 'px)';
      cx.drawImage(src.img, (W - w) / 2, (H - h) / 2, w, h);
      cx.filter = 'none';
    } else {
      var t = toile(W, H), tx = t.getContext('2d'), tw = W, th = H, etapes = [];
      tx.drawImage(src.img, (W - w) / 2, (H - h) / 2, w, h);
      while (tw > W / 32) { var n = toile(Math.max(2, Math.round(tw / 2)), Math.max(2, Math.round(th / 2))), nx = n.getContext('2d'); nx.imageSmoothingQuality = 'high'; nx.drawImage(t, 0, 0, n.width, n.height); etapes.push(t); t = n; tw = n.width; th = n.height; }
      while (etapes.length) { var g = etapes.pop(), gx = g.getContext('2d'); gx.imageSmoothingQuality = 'high'; gx.clearRect(0, 0, g.width, g.height); gx.drawImage(t, 0, 0, g.width, g.height); t.width = t.height = 0; t = g; }
      cx.drawImage(t, 0, 0, W, H);
      t.width = t.height = 0;
    }
    cx.fillStyle = 'rgba(22,20,42,.30)'; cx.fillRect(0, 0, W, H);
    return c;
  }
  // la photo posée dans le cadre ; zoom > 1 pour le mouvement de la vidéo ; dy : petit glissement vertical
  function poser(cx, src, W, H, cadrage, zoom, fondC, dy) {
    zoom = zoom || 1; dy = dy || 0;
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    if (cadrage === 'flou') {
      if (fondC) cx.drawImage(fondC, 0, 0, W, H);
      var k = Math.min(W / src.w, H / src.h) * zoom, w = src.w * k, h = src.h * k;
      cx.drawImage(src.img, (W - w) / 2, (H - h) / 2 + dy, w, h);
      return;
    }
    // recadrée, centrée ; une photo plus haute que le cadre est gardée un peu plus haut (les visages, les objets posés)
    var k2 = Math.max(W / src.w, H / src.h) * zoom, w2 = src.w * k2, h2 = src.h * k2;
    var y = (H - h2) * (h2 > H * 1.05 ? 0.42 : 0.5) + dy;
    cx.drawImage(src.img, (W - w2) / 2, Math.min(0, Math.max(H - h2, y)), w2, h2);
  }
  function enBlob(c, type, q) {
    return new Promise(function (ok, ko) {
      if (c.toBlob) { c.toBlob(function (b) { if (b) ok(b); else ko(new Error('image')); }, type, q); return; }
      try {
        var u = c.toDataURL(type, q), bin = atob(u.split(',')[1]), a = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
        ok(new Blob([a], { type: type }));
      } catch (e) { ko(e); }
    });
  }
  K.image = function (src, cle, choix) {
    var F = K.FORMATS[cle];
    if (!F || !src) return Promise.reject(new Error('format'));
    var mode = K.cadrage(choix, src, cle), c = toile(F.W, F.H), cx = c.getContext('2d');
    cx.fillStyle = '#FFFFFF'; cx.fillRect(0, 0, F.W, F.H);
    var fc = mode === 'flou' ? fond(src, F.W, F.H) : null;
    poser(cx, src, F.W, F.H, mode, 1, fc, 0);
    if (fc) fc.width = fc.height = 0;
    return enBlob(c, 'image/jpeg', 0.9).then(function (b) { c.width = c.height = 0; return { blob: b, W: F.W, H: F.H, cadrage: mode }; });
  };

  /* ---------- le titre écrit sur la vidéo : lisible, dans la zone que TikTok, Reels et Shorts ne couvrent pas ---------- */
  var POLICE = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  function lignes(cx, t, largeur, taille) {
    cx.font = '800 ' + taille + 'px ' + POLICE;
    var mots = t.split(/\s+/), l = [], cur = '';
    mots.forEach(function (m) {
      var essai = cur ? cur + ' ' + m : m;
      if (cx.measureText(essai).width <= largeur || !cur) cur = essai; else { l.push(cur); cur = m; }
    });
    if (cur) l.push(cur);
    return l;
  }
  function mesurerTitre(cx, t, W) {
    // marges de sécurité : 9 % à gauche et à droite, sous la barre du haut (environ 13 % de la hauteur)
    var largeur = W * 0.74, taille = 84, l;
    for (; taille >= 48; taille -= 4) {
      l = lignes(cx, t, largeur, taille);
      if (l.length <= 3 && l.every(function (x) { return cx.measureText(x).width <= largeur; })) break;
    }
    return { l: l.slice(0, 3), taille: taille };
  }
  function ecrireTitre(cx, W, H, m, alpha) {
    if (!m || !m.l.length || alpha <= 0) return;
    var t = m.taille, pas = Math.round(t * 1.18), pad = Math.round(t * 0.42);
    cx.save();
    cx.globalAlpha = Math.min(1, alpha);
    cx.font = '800 ' + t + 'px ' + POLICE;
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    var large = 0;
    m.l.forEach(function (x) { large = Math.max(large, cx.measureText(x).width); });
    var bw = large + pad * 2, bh = pas * m.l.length + pad * 1.4, bx = (W - bw) / 2, by = H * 0.135;
    cx.fillStyle = 'rgba(46,42,71,.86)';
    var r = Math.min(36, bh / 2);
    cx.beginPath();
    cx.moveTo(bx + r, by); cx.arcTo(bx + bw, by, bx + bw, by + bh, r); cx.arcTo(bx + bw, by + bh, bx, by + bh, r); cx.arcTo(bx, by + bh, bx, by, r); cx.arcTo(bx, by, bx + bw, by, r);
    cx.closePath(); cx.fill();
    cx.fillStyle = '#FFFFFF';
    m.l.forEach(function (x, i) { cx.fillText(x, W / 2, by + pad * 0.7 + pas * (i + 0.5)); });
    cx.restore();
  }

  /* ---------- une image de la vidéo, au moment p (de 0 à 1) ---------- */
  function scene(o) {
    var c = toile(o.W, o.H), cx = c.getContext('2d', { alpha: false });
    var fc = o.cadrage === 'flou' ? fond(o.src, o.W, o.H) : null;
    var titre = o.titre ? mesurerTitre(cx, o.titre, o.W) : null;
    return {
      toile: c,
      dessiner: function (p) {
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // lent au début et à la fin
        cx.fillStyle = '#16142A'; cx.fillRect(0, 0, o.W, o.H);
        poser(cx, o.src, o.W, o.H, o.cadrage, 1 + 0.1 * e, fc, -o.H * 0.012 * e);
        if (titre) ecrireTitre(cx, o.W, o.H, titre, (p * o.duree) / 0.45);
      },
      fermer: function () { c.width = c.height = 0; if (fc) fc.width = fc.height = 0; }
    };
  }

  /* ---------- MP4 (H.264) par WebCodecs et mp4-muxer ---------- */
  var muxer = null;
  function chargerMuxer() {
    if (window.Mp4Muxer) return Promise.resolve(window.Mp4Muxer);
    if (muxer) return muxer;
    muxer = new Promise(function (ok, ko) {
      var u;
      try { u = new URL('vendor/mp4-muxer.js', ICI || location.href); if (ICI) u.search = new URL(ICI).search; } catch (e) { ko(e); return; }
      var s = document.createElement('script');
      s.src = u.href; s.async = true;
      s.onload = function () { if (window.Mp4Muxer) ok(window.Mp4Muxer); else ko(new Error('mp4-muxer')); };
      s.onerror = function () { muxer = null; ko(new Error('mp4-muxer')); };
      document.head.appendChild(s);
    });
    return muxer;
  }
  var CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.640032'];
  function codecAvc(W, H, debit, fps) {
    if (!window.VideoEncoder || !window.VideoFrame || !VideoEncoder.isConfigSupported) return Promise.resolve('');
    var i = 0;
    var essai = function () {
      if (i >= CODECS.length) return Promise.resolve('');
      var c = CODECS[i++];
      return VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: debit, framerate: fps }).then(function (s) { return s && s.supported ? c : essai(); }, essai);
    };
    return essai();
  }
  function viaWebCodecs(o, codec) {
    return chargerMuxer().then(function (M) {
      var sc = scene(o), N = Math.round(o.duree * o.fps), us = 1e6 / o.fps, i = 0, erreur = null;
      var mux = new M.Muxer({ target: new M.ArrayBufferTarget(), video: { codec: 'avc', width: o.W, height: o.H, frameRate: o.fps }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
      var enc = new VideoEncoder({ output: function (morceau, meta) { mux.addVideoChunk(morceau, meta); }, error: function (e) { erreur = e; } });
      enc.configure({ codec: codec, width: o.W, height: o.H, bitrate: o.debit, framerate: o.fps, avc: { format: 'avc' } });
      var fin = function () { try { if (enc.state !== 'closed') enc.close(); } catch (e) {} sc.fermer(); };
      return new Promise(function (ok, ko) {
        var pas = function () {
          if (erreur) { fin(); ko(erreur); return; }
          if (o.annule && o.annule()) { fin(); ko(new Error('annule')); return; }
          var t0 = performance.now();
          // quelques images à la fois, puis la main rendue à la page (elle ne se fige pas)
          while (i < N && enc.encodeQueueSize < 5 && performance.now() - t0 < 24) {
            sc.dessiner(N > 1 ? i / (N - 1) : 1);
            var f = new VideoFrame(sc.toile, { timestamp: Math.round(i * us), duration: Math.round(us) });
            enc.encode(f, { keyFrame: i % (o.fps * 2) === 0 });
            f.close();
            i++;
          }
          if (o.progres) o.progres(0.95 * i / N);
          if (i < N) { setTimeout(pas, enc.encodeQueueSize >= 5 ? 12 : 0); return; }
          enc.flush().then(function () {
            if (erreur) throw erreur;
            mux.finalize();
            var buf = mux.target.buffer;
            fin();
            if (o.progres) o.progres(1);
            ok({ blob: new Blob([buf], { type: 'video/mp4' }), type: 'video/mp4', ext: 'mp4', via: 'webcodecs' });
          }).catch(function (e) { fin(); ko(e); });
        };
        pas();
      });
    });
  }

  /* ---------- repli : MediaRecorder (en temps réel : la page doit rester ouverte) ---------- */
  var TYPES = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  K.enregistreur = function () {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported || !HTMLCanvasElement.prototype.captureStream) return '';
    for (var i = 0; i < TYPES.length; i++) if (MediaRecorder.isTypeSupported(TYPES[i])) return TYPES[i];
    return '';
  };
  function viaRecorder(o) {
    var type = K.enregistreur();
    if (!type) return Promise.reject(new Error('video'));
    var sc = scene(o), flux = sc.toile.captureStream(o.fps), rec, morceaux = [];
    try { rec = new MediaRecorder(flux, { mimeType: type, videoBitsPerSecond: o.debit }); } catch (e) { sc.fermer(); return Promise.reject(e); }
    return new Promise(function (ok, ko) {
      var arreter = function () { flux.getTracks().forEach(function (t) { t.stop(); }); sc.fermer(); };
      rec.ondataavailable = function (e) { if (e.data && e.data.size) morceaux.push(e.data); };
      rec.onerror = function (e) { arreter(); ko(e.error || new Error('video')); };
      rec.onstop = function () {
        arreter();
        if (o.annule && o.annule()) { ko(new Error('annule')); return; }
        var t = (rec.mimeType || type).split(';')[0];
        if (o.progres) o.progres(1);
        ok({ blob: new Blob(morceaux, { type: t }), type: t, ext: t.indexOf('mp4') !== -1 ? 'mp4' : 'webm', via: 'mediarecorder' });
      };
      sc.dessiner(0);
      rec.start(250);
      var t0 = performance.now();
      var tic = function () {
        var p = (performance.now() - t0) / 1000 / o.duree;
        if ((o.annule && o.annule()) || p >= 1) { sc.dessiner(1); setTimeout(function () { if (rec.state !== 'inactive') rec.stop(); }, 120); return; }
        sc.dessiner(p);
        if (o.progres) o.progres(0.97 * p);
        requestAnimationFrame(tic);
      };
      requestAnimationFrame(tic);
    });
  }

  /* La vidéo : WebCodecs d'abord (rapide, MP4 sûr), sinon MediaRecorder */
  K.videoPossible = function () { return !!((window.VideoEncoder && window.VideoFrame) || K.enregistreur()); };
  K.video = function (src, opts) {
    opts = opts || {};
    var o = {
      src: src, W: K.VIDEO.W, H: K.VIDEO.H, duree: opts.duree || K.VIDEO.duree, fps: opts.fps || K.VIDEO.fps, debit: opts.debit || 6000000,
      titre: (opts.titre || '').trim().slice(0, 60), progres: opts.progres, annule: opts.annule
    };
    o.cadrage = K.cadrage(opts.cadrage || 'auto', src, 'video');
    var polices = document.fonts && document.fonts.load ? document.fonts.load('800 80px "Plus Jakarta Sans"').catch(function () {}) : Promise.resolve();
    return Promise.race([polices, attendre(1500)]).then(function () {
      if (opts.force === 'mediarecorder') return '';
      return codecAvc(o.W, o.H, o.debit, o.fps);
    }).then(function (codec) {
      if (!codec) return viaRecorder(o);
      return viaWebCodecs(o, codec).catch(function (e) { if (e && e.message === 'annule') throw e; return viaRecorder(o); });
    });
  };
})();
