/* Les Minis Monstres : l'application (/appli/, includes/appli.php).
 * - installe le service worker (l'application web s'ajoute à l'écran d'accueil) ;
 * - ajoute « Dicter » sous la description de Publier partout : on parle, le texte s'écrit. Dans l'application Android
 *   (Capacitor), c'est la reconnaissance vocale du téléphone ; dans un navigateur, celle du navigateur quand il en a une.
 *   Rien n'est enregistré par nous : seul le texte reconnu arrive dans la case, et le client le relit avant d'envoyer ;
 * - ouvre l'appareil photo du téléphone pour la photo ;
 * - au retour d'une liaison de réseau faite dans le navigateur, recharge la page pour montrer le compte relié. */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/appli/sw.js', { scope: '/appli/' }).catch(function () {});
  }

  /* ---------- la dictée ---------- */
  var cap = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SpeechRecognition;
  var Web = window.SpeechRecognition || window.webkitSpeechRecognition;
  var zone = $('textarea[name="c_description"]');
  if (zone && (cap || Web)) {
    var ligne = el('div', 'ap-micro');
    var bouton = el('button', 'btn btn-light btn-sm');
    bouton.type = 'button';
    bouton.setAttribute('aria-pressed', 'false');
    var libelle = el('span', null, 'Dicter');
    bouton.appendChild(el('span', null, '🎤'));
    bouton.appendChild(libelle);
    var etat = el('small', null, 'Parlez, Pépite écrit.');
    etat.setAttribute('role', 'status');
    ligne.appendChild(bouton);
    ligne.appendChild(etat);
    zone.parentNode.insertBefore(ligne, zone.nextSibling);

    var enCours = false, base = '', reco = null, ecoute = null;
    var max = parseInt(zone.getAttribute('data-max') || zone.getAttribute('maxlength') || '600', 10) || 600;
    function poser(texte) {
      var t = (base ? base.replace(/\s+$/, '') + ' ' : '') + texte.replace(/^\s+/, '');
      zone.value = t.slice(0, max);
      zone.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function fin(message) {
      enCours = false;
      bouton.classList.remove('is-rec');
      bouton.setAttribute('aria-pressed', 'false');
      libelle.textContent = 'Dicter';
      etat.textContent = message || 'Relisez, corrigez si besoin, puis lancez Pépite.';
      if (ecoute && ecoute.remove) { ecoute.remove(); ecoute = null; }
    }
    function debut() {
      enCours = true;
      base = zone.value;
      bouton.classList.add('is-rec');
      bouton.setAttribute('aria-pressed', 'true');
      libelle.textContent = 'Arrêter';
      etat.textContent = 'Je vous écoute…';
    }
    function refus() { fin('Le micro n’est pas autorisé. Autorisez-le dans les réglages du téléphone, ou écrivez au clavier.'); }

    function dicterCap() {
      cap.available().then(function (r) {
        if (!r || !r.available) { fin('La dictée n’est pas disponible sur ce téléphone. Écrivez au clavier.'); return; }
        return cap.requestPermissions().then(function (p) {
          if (p && p.speechRecognition && p.speechRecognition !== 'granted') { refus(); return; }
          debut();
          var ajout = cap.addListener('partialResults', function (x) { if (x && x.matches && x.matches[0]) poser(x.matches[0]); });
          if (ajout && ajout.then) ajout.then(function (h) { ecoute = h; }); else ecoute = ajout;
          return cap.start({ language: 'fr-FR', maxResults: 1, partialResults: true, popup: false }).then(function (x) {
            if (x && x.matches && x.matches[0]) poser(x.matches[0]);
            fin();
          });
        });
      }).catch(function () { if (enCours) fin(); else fin('La dictée n’a pas démarré. Réessayez, ou écrivez au clavier.'); });
    }
    function dicterWeb() {
      reco = new Web();
      reco.lang = 'fr-FR';
      reco.interimResults = true;
      reco.continuous = false;
      reco.onresult = function (e) {
        var t = '';
        for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        poser(t);
      };
      reco.onerror = function (e) { if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed')) refus(); else fin('Je n’ai pas bien entendu. Réessayez, ou écrivez au clavier.'); };
      reco.onend = function () { if (enCours) fin(); };
      debut();
      try { reco.start(); } catch (err) { fin('La dictée n’a pas démarré. Réessayez, ou écrivez au clavier.'); }
    }
    bouton.addEventListener('click', function () {
      if (enCours) {
        if (cap) cap.stop().catch(function () {});
        else if (reco) reco.stop();
        fin();
        return;
      }
      if (cap) dicterCap(); else dicterWeb();
    });
  }

  /* ---------- la photo : l'appareil photo du téléphone d'abord (le client peut toujours choisir dans sa galerie) ---------- */
  var photo = $('input[type="file"][data-ao-photo-file]');
  if (photo && /Android|iPhone|iPad/i.test(navigator.userAgent) && !photo.hasAttribute('capture')) {
    var choix = el('p', 'ap-petit');
    var lien = el('button', 'link-btn', 'Prendre la photo maintenant');
    lien.type = 'button';
    lien.addEventListener('click', function () { photo.setAttribute('capture', 'environment'); photo.click(); setTimeout(function () { photo.removeAttribute('capture'); }, 1000); });
    choix.appendChild(lien);
    var cadre = photo.closest('label');
    if (cadre && cadre.parentNode) cadre.parentNode.insertBefore(choix, cadre.nextSibling);
  }

  /* ---------- le point du soir : allumé ou éteint ---------- */
  var notif = $('[data-ap-notif]');
  if (notif) {
    var coche = $('[data-ap-notif-on]', notif), dit = $('[data-ap-notif-etat]', notif);
    coche.addEventListener('change', function () {
      var f = new FormData();
      f.append('action', 'aled08e_appli_notif'); f.append('_n', notif.getAttribute('data-nonce')); f.append('on', coche.checked ? '1' : '0');
      fetch(notif.getAttribute('data-ajax'), { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
        dit.textContent = j && j.success ? (coche.checked ? 'C’est noté : un message par jour, pas plus.' : 'C’est noté : plus de message le soir.') : 'Ça n’a pas marché. Réessayez.';
      }).catch(function () { dit.textContent = 'Pas de réseau. Réessayez.'; });
    });
  }

  /* ---------- retour d'une liaison faite dans le navigateur du téléphone ---------- */
  var parti = false;
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="aled08e_rs="]');
    if (a) parti = true;
  });
  d.addEventListener('visibilitychange', function () { if (parti && d.visibilityState === 'visible') { parti = false; location.reload(); } });
})();
