/* Les Minis Monstres : scripts (léger, sans dépendance) */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var round2 = function (n) { return Math.round(n * 100) / 100; };
  var floor2 = function (n) { return Math.floor(n * 100 + 1e-6) / 100; };
  // Version anglaise (pages /en/) : petits textes écrits par le script, et prix au format « €250 »
  var EN = /^en\b/i.test(d.documentElement.lang || '');
  var TR = {
    // bulle de Cerise et « i » des options
    
    " mois": " months",
    "Et le forfait, chaque année": "And the subscription, every year",
    "Et le forfait, chaque mois": "And the subscription, every month",
    "Prix total du site : ": "Total price of the website: ",
    'Site Internet Professionnel, avec boutique': 'Professional Website, with an online shop',
    'Site Internet Professionnel': 'Professional Website',
    'Vérification du code…': 'Checking the code…',
    'Le code sera vérifié au moment de commander.': 'The code will be checked when you order.',
    'Code valable : la remise est appliquée.': 'Valid code: the discount is applied.',
    'Ce code n’est pas reconnu. Vérifiez-le, ou écrivez-nous.': 'This code is not recognised. Check it, or write to me.',
    'Et votre forfait, chaque année': 'And your plan, every year',
    'Et votre forfait, chaque mois': 'And your plan, every month',
    ' + abonnement': ' + plan',
    'Code promo : ': 'Promo code: ',
    ' % de remise sur la création, déjà déduits': '% off the website, already deducted',
    ' fois, et votre forfait': ' instalments, and your plan',
    'Tranquillité': 'Peace of mind',
    'Évolution': 'Growth',
    'Pack SEO': 'SEO pack',
    'Création seule': 'Website only',
    'Autonomie': 'On your own',
    'Forfait Autonome': 'On your own',
    'compris': 'included',
    'le vôtre': 'yours',
    'Code promo valable : la remise est appliquée.': 'Valid promo code: the discount is applied.',
    'Je m’en occupe moi-même': 'I will handle it myself',
    'Je m’en occupe moi-même (création seule)': 'I will handle it myself (website only)',
    'Formule ': 'Plan ',
    'Abonnement ': 'Subscription: ',
    
    
    'Puis votre forfait, chaque année': 'Then your plan, every year',
    'Puis votre forfait, chaque mois': 'Then your plan, every month',
    ', sans abonnement': ', no plan',
    ' puis ': ' then ',
    'offert': 'free',
    'avec le forfait': 'with the plan',
    'sans abonnement': 'no plan',
    'Ensuite, chaque mois': 'Then, every month',
    'rien': 'nothing',
    ' fois': ' instalments',
    'Alex s’en occupe': 'Alex is on it',
    'En savoir plus': 'Learn more',
    'Alex a fait votre modification, elle est en ligne (démo)': 'Alex made your change, it is live (demo)',
    ", sans frais en plus.": ", with no extra fees.",
    'Votre site, avec boutique en ligne': 'Your website, with an online shop',
    'Votre site': 'Your website',
    'Fermer': 'Close',
    'Exemple : ': 'Example: ',
    'Exemple d’écran : le vôtre sera à vos couleurs.': 'Example screen: yours will be in your own colours.',
    'Votre demande pour Bricou': 'Your request for Bricou',
    'Les petits monstres': 'The little monsters',
    'Environ ': 'About ',
    '. C’est Alex qui fera la modification.': '. Alex will make the change.',
    'C’est bien ça ? Alex fera la modification lui-même.': 'Is that right? Alex will make the change himself.',
    'Oui, c’est bien ça': 'Yes, that’s right',
    'Outil : ': 'Tool: ',
    ' à chaque lancement.': ' each time you use it.',
    'Sans énergie.': 'No energy needed.',
    'Ouvrir l’outil': 'Open the tool',
    'Dans votre espace : ': 'In your area: ',
    'Y aller': 'Go there',
    'Je corrige': 'Let me fix it',
    'Pas de souci ! Dites-moi ce qu’il faut changer, et je reformule votre demande.': 'No problem! Tell me what to change and I will rephrase your request.',
    'Merci pour vos précisions ! Votre demande est prête dans « Modifications ». Ajoutez une photo si vous voulez, puis envoyez : je transmets à Bricou !': 'Thank you for the details! Your request is ready in “My requests”. Add a photo if you like, then send it: I will pass it on to Alex!',
    'Dans votre vrai espace, je vous réponds ici.': 'In your real client area, I answer you here.',
    'Cerise n’a pas pu répondre. Réessayez dans un instant.': 'Cerise couldn’t answer. Try again in a moment.',
    'La connexion a coupé. Réessayez dans un instant.': 'The connection dropped. Try again in a moment.',
    ' d’énergie': ' energy',
    'Énergie': 'Energy',
    ' par message.': ' per message.',
    'Redonner de l’énergie': 'Top up the energy',
    'Lien d’avis Google': 'Google review link',
    'Abonnement et factures': 'Subscription and invoices',
    'Fermer le menu': 'Close the menu', 'Ouvrir le menu': 'Open the menu',
    'Écrivez au moins deux lettres, par exemple le nom de votre entreprise.': 'Type at least two letters, for example the name of your business.',
    'Je regarde si ': 'Checking whether ', ' est libre…': ' is available…',
    ' est disponible à l’instant. Je le réserve à la commande, à votre nom.': ' is available right now. I will register it in your name when you order.',
    ' est déjà pris. Une idée :': ' is already taken. An idea:',
    'Je n’arrive pas à vérifier pour l’instant. Pas de souci : je le ferai pour vous.': 'I cannot check right now. No problem: I will do it for you.',
    'Parfait, on gardera votre nom de domaine actuel.': 'Perfect, we will keep your current domain name.',
    'Forfait ': 'Plan ', '/an': '/year', '/mois': '/month', 'an': 'year', 'mois': 'month', 'année': 'year',
    'Mon nom de domaine actuel': 'My current domain name', ' (disponible)': ' (available)', ' (déjà pris)': ' (already taken)',
    'Nom de domaine à choisir': 'Domain name to choose', ' fois sans frais': ' interest-free instalments',
    'Création, une fois': 'Creation, one-off', 'Abonnement': 'Subscription',
    'Aujourd’hui ': 'Today ', ' + abonnement': ' + subscription',
    'Au mois': 'Monthly', 
    ' options': ' options', 'Options': 'Options', ' pages en plus': ' extra pages', ' page en plus': ' extra page',
    'Un instant, je prépare le paiement…': 'One moment, I am preparing the payment…', 'Lien copié, prêt à envoyer': 'Link copied, ready to send',
    'Écrivez votre demande en quelques mots': 'Write your request in a few words',
    'La photo dépasse 8 Mo : choisissez-en une plus légère': 'The photo is over 8 MB: please choose a lighter one',
    'Envoi en cours…': 'Sending…', 'Nouvelle étape': 'New step', 'QR code vers votre site': 'QR code to your website', 'QR code téléchargé': 'QR code downloaded',
    'Vos modifications du mois sont utilisées : je vous recontacte pour en parler (démo)': 'You have used this month’s changes: I will get back to you to talk about it (demo)',
    'envoyée à l’instant': 'sent just now', 'Transmise à Alex': 'Sent to Alex', 'Ajouter une photo (facultatif)': 'Add a photo (optional)',
    'Demande envoyée : je m’en occupe (démo)': 'Request sent: I am on it (demo)', 'Demande envoyée': 'Request sent', 'Merci pour vos précisions, je transmets à Bricou ! (démo)': 'Thank you for the details, I am passing it on to Alex! (demo)', 'Vous avez utilisé vos petites retouches du mois (démo)': 'You have used your small edits for this month (demo)', 'd’énergie (démo)': 'energy (demo)', 'Il ne vous reste pas assez d’énergie pour cette demande (démo)': 'You do not have enough energy left for this request (demo)', 'En cours': 'In progress', 'Faite': 'Done',
    'Votre modification est en ligne (démo)': 'Your change is live (demo)', ' choisi, à partir du mois prochain (démo)': ' chosen, from next month (demo)',
    'Option ajoutée': 'Option added', 'Option retirée': 'Option removed', ' (démo)': ' (demo)', 'à l’instant': 'just now',
    'Je souhaite payer le site en ': 'I would like to pay for the website in ', ' fois.': ' instalments.', 'Options choisies : ': 'Chosen options: ',
    // valeurs venues des données du site (types, délais, options)
    'Site une page': 'One-page website', 'Site vitrine': 'Showcase website', 'Boutique en ligne': 'Online shop',
    'site une page': 'one-page website', 'site vitrine': 'showcase website', 'boutique en ligne': 'online shop',
    '3 à 5 jours': '3 to 5 days', '1 à 2 semaines': '1 to 2 weeks', '2 à 3 semaines': '2 to 3 weeks',
    'Adresse e-mail pro': 'Professional email address', 'Traduction en anglais': 'English translation', 'Gestion du stock': 'Stock management', 'Comptes clients': 'Customer accounts'
  };
  /* il n'y a plus qu'un abonnement : on l'appelle par son nom, sans « forfait » devant */
  var planName = function (n) { return tr(n); };
  var tr = function (s) { return EN && Object.prototype.hasOwnProperty.call(TR, s) ? TR[s] : s; };
  // Bouton FR | EN : il mène à la même page dans l'autre langue (l'espace client réel n'existe qu'en français)
  $$('[data-lang-switch]').forEach(function (a) {
    var p = location.pathname;
    if (EN) a.href = p.replace(/^\/en(\/|$)/, '/') + location.hash;
    else a.href = (/^\/mon-espace\/(?!demo\/)/.test(p) && p !== '/mon-espace/demo/' ? '/en/' : '/en' + p) + location.hash;
  });
  var euro = function (n) { var v = round2(n); var t = v % 1 ? v.toFixed(2) : String(v); return EN ? '€' + t : t.replace('.', ',') + ' €'; };
  var slug = function (v) { return (v || '').replace(/[^a-z0-9-]/g, ''); };

  // Peinture : sous chaque bouton essentiel, une flaque dessinée au hasard (jamais deux pareilles, toujours bien régulière), et une éclaboussure au clic
  (function () {
    var lisse = function (pts) { // courbe fermée et douce passant par les points
      var n = pts.length, dd = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (var i = 0; i < n; i++) {
        var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        dd += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return dd + 'Z';
    };
    var pilule = function (t) { // point et normale sur une pilule (x 50 à 250, rayon 32, centre y 50)
      var x0 = 50, x1 = 250, r = 32, cy = 50, a = x1 - x0, L = 2 * a + 2 * Math.PI * r, s = t * L, g;
      if (s < a) return [x0 + s, cy - r, 0, -1]; s -= a;
      if (s < Math.PI * r) { g = -Math.PI / 2 + s / r; return [x1 + r * Math.cos(g), cy + r * Math.sin(g), Math.cos(g), Math.sin(g)]; } s -= Math.PI * r;
      if (s < a) return [x1 - s, cy + r, 0, 1]; s -= a;
      g = Math.PI / 2 + s / r; return [x0 + r * Math.cos(g), cy + r * Math.sin(g), Math.cos(g), Math.sin(g)];
    };
    var flaque = function () {
      var pts = [], f1 = Math.random() * 6.3, f2 = Math.random() * 6.3, k1 = 2 + Math.floor(Math.random() * 3), k2 = 5 + Math.floor(Math.random() * 4);
      for (var i = 0; i < 34; i++) {
        var t = i / 34, q = pilule(t), off = 8 + 2.4 * Math.sin(t * 6.283 * k1 + f1) + 1.8 * Math.sin(t * 6.283 * k2 + f2) + (Math.random() - 0.5) * 1.4; // toujours au moins 3 : jamais de trou
        pts.push([q[0] + q[2] * off, q[1] + q[3] * off]);
      }
      var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100' preserveAspectRatio='none'><path d='" + lisse(pts) + "'/>";
      for (var g = 0, ng = 1 + Math.floor(Math.random() * 3); g < ng; g++) {
        var q2 = pilule(Math.random()), o = 13 + Math.random() * 4;
        svg += "<circle cx='" + (q2[0] + q2[2] * o).toFixed(1) + "' cy='" + (q2[1] + q2[3] * o).toFixed(1) + "' r='" + (2.4 + Math.random() * 2).toFixed(1) + "'/>";
      }
      return 'url("data:image/svg+xml,' + encodeURIComponent(svg + '</svg>') + '")';
    };
    $$('.btn-flaque').forEach(function (b) { b.style.setProperty('--fl', flaque()); });
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    d.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn-flaque');
      if (!b) return;
      var r = b.getBoundingClientRect(), w = r.width, h = r.height;
      b.classList.remove('is-splash'); void b.offsetWidth; b.classList.add('is-splash');
      for (var k = 0; k < 9; k++) {
        // chaque goutte part du bord du bouton et s'envole vers l'extérieur
        var gt = d.createElement('span'), a = (k / 9) * 6.283 + Math.random() * 0.5, dist = 26 + Math.random() * 34;
        gt.className = 'goutte-vol';
        gt.style.left = (w / 2 + Math.cos(a) * w / 2.1) + 'px'; gt.style.top = (h / 2 + Math.sin(a) * h / 2) + 'px';
        gt.style.setProperty('--dx', Math.round(Math.cos(a) * dist * 1.3) + 'px');
        gt.style.setProperty('--dy', Math.round(Math.sin(a) * dist) + 'px');
        gt.style.setProperty('--t', Math.round(6 + Math.random() * 9) + 'px');
        b.appendChild(gt);
        setTimeout(function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(gt), 700);
      }
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

  /* ---------- un code promo, nettoyé (majuscules, chiffres et tirets) ---------- */
  var cleanCode = function (v) { return (v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20); };

  /* options réservées à certains types de site (stock, comptes clients : boutique) */
  var filterOpts = function (scope, typeId) {
    $$('.b-opt[data-types]', scope).forEach(function (l) {
      var ok = (' ' + l.getAttribute('data-types') + ' ').indexOf(' ' + typeId + ' ') >= 0;
      l.hidden = !ok;
      var i = l.querySelector('input');
      if (!ok && i) i.checked = false;
    });
  };

  /* le site (21 novembre 2026) : le Site Essentiel (champ caché 'une-page') et la case « E-commerce » (même nom, valeur 'boutique').
     ?type=boutique (ou ecommerce) dans l'adresse coche la case. L'ancien ?type=vitrine (Site Visibilité, retiré) donne le Site Essentiel. */
  var initBoutique = function (scope) {
    var box = $('[data-type-choix]', scope);
    if (!box) return;
    var q = slug(new URLSearchParams(location.search).get('type') || '');
    var id = /^(boutique|e-?commerce)/.test(q) ? 'boutique' : '';
    var r = id && $('input[value="' + id + '"]', box);
    if (r) r.checked = true;
  };
  var siteNom = function (t) { return tr(t.label || t.name || 'Site'); };
  /* ---------- la case « Code promo » : vérifiée par le serveur ----------
     ok : true (code valable), false (inconnu), null (pas encore vérifié, ou vérification impossible ici)
     Un code promo donne toujours sa remise sur la création du site. La remise est celle que renvoie le serveur (st.remise) :
     un code personnel de mail de prospection (MAIL10-…) donne 10 %, sur la création seulement (st.sur = 'creation'). */
  var codeEvenement = function (scope, onChange) {
    var input = $('[data-code-evenement]', scope), etat = $('[data-code-etat]', scope);
    var st = { code: '', ok: null }, timer = null, ajax = (window.aled08Ajax || '/wp-admin/admin-ajax.php');
    if (!input) return st;
    var dire = function (txt, cls) { if (etat) { etat.textContent = txt; etat.className = 'b-code-etat' + (cls ? ' ' + cls : ''); } };
    var verifier = function () {
      var c = cleanCode(input.value);
      st.code = c; st.ok = null; st.type = ''; st.remise = 0; st.sur = '';
      if (c.length < 3) { dire(''); onChange(); return; }
      dire(tr('Vérification du code…'));
      onChange();
      if (!window.fetch) { dire(tr('Le code sera vérifié au moment de commander.')); return; }
      fetch(ajax + '?action=aled08e_code_evenement&code=' + encodeURIComponent(c), { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (cleanCode(input.value) !== c) return;
          if (j && j.success) { st.ok = true; st.type = (j.data && j.data.type) || 'promo'; st.remise = (j.data && +j.data.remise) || 0; st.sur = (j.data && j.data.sur) || ''; dire(tr('Code promo valable : la remise est appliquée.'), 'is-ok'); }
          else if (j && j.success === false) { st.ok = false; dire(tr('Ce code n’est pas reconnu. Vérifiez-le, ou écrivez-nous.'), 'is-ko'); }
          else dire(tr('Le code sera vérifié au moment de commander.'));
          onChange();
        })
        .catch(function () { if (cleanCode(input.value) === c) dire(tr('Le code sera vérifié au moment de commander.')); });
    };
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(verifier, 450); });
    st.set = function (c) { if (c) { input.value = cleanCode(c); verifier(); } };
    return st;
  };

  /* ---------- menu mobile ---------- */
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      var hd = $('.site-header');
      if (open && hd) nav.style.setProperty('--nav-top', Math.max(0, hd.getBoundingClientRect().bottom) + 'px');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', tr(open ? 'Fermer le menu' : 'Ouvrir le menu'));
      nav.classList.toggle('is-open', open);
      d.body.classList.toggle('nav-open', open);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) burger.click();
    });
  }

  /* ---------- les grands onglets des ateliers ---------- */
  // L'onglet allumé : l'atelier dont un chemin (data-chemins) contient la page, le plus long gagne (« / » : l'accueil seulement).
  // Sous WordPress, l'en-tête est le même partout : c'est ce script qui choisit l'onglet.
  (function () {
    var lis = $$('.onglet-li');
    if (!lis.length) return;
    var p = location.pathname, best = null, len = -1;
    lis.forEach(function (li) {
      (li.getAttribute('data-chemins') || '').split(' ').forEach(function (c) {
        if (!c) return;
        var ok = c === '/' ? p === '/' : p.indexOf(c) === 0;
        if (ok && c.length > len) { best = li; len = c.length; }
      });
    });
    lis.forEach(function (li) {
      var a = $('.onglet', li), on = li === best;
      li.classList.toggle('is-on', on);
      if (!a) return;
      if (on) a.setAttribute('aria-current', a.getAttribute('href') === p ? 'page' : 'true'); else a.removeAttribute('aria-current');
    });
    // Le petit menu de chaque onglet (ordinateur) : le bouton flèche l'ouvre, Échap ou un clic ailleurs le ferme
    var fermer = function (li, focus) {
      var b = $('.onglet-plus', li);
      if (!b || b.getAttribute('aria-expanded') !== 'true') return;
      b.setAttribute('aria-expanded', 'false'); li.classList.remove('is-open');
      if (focus) b.focus();
    };
    lis.forEach(function (li) {
      var b = $('.onglet-plus', li);
      if (!b) return;
      b.addEventListener('click', function () {
        var ouvrir = b.getAttribute('aria-expanded') !== 'true';
        lis.forEach(function (x) { if (x !== li) fermer(x); });
        b.setAttribute('aria-expanded', ouvrir ? 'true' : 'false'); li.classList.toggle('is-open', ouvrir);
      });
      li.addEventListener('focusout', function (e) { if (!e.relatedTarget || !li.contains(e.relatedTarget)) fermer(li); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Escape' && li.classList.contains('is-open')) { e.stopPropagation(); fermer(li, true); } });
    });
    d.addEventListener('click', function (e) { lis.forEach(function (li) { if (!li.contains(e.target)) fermer(li); }); });
  })();

  /* ---------- Mes Tutos : la recherche instantanée du hub ---------- */
  // Sans JavaScript, le champ reste caché et tout est listé. Avec : chaque lettre filtre les cartes (tutos, À la une, guides) ;
  // pendant une recherche, la jauge des étapes se range pour laisser les résultats en haut.
  (function () {
    var liste = $('[data-tuto-liste]'), boite = $('[data-tuto-recherche]');
    if (!liste || !boite) return;
    var champ = $('input', boite);
    var themes = $$('[data-theme]', liste), cartes = $$('[data-tuto]', liste), masques = $$('[data-masque-recherche]', liste);
    var vide = $('[data-tuto-vide]', liste), compte = $('[data-tuto-compte]', liste), filtres = $('.tuto-filtres', liste);
    var norm = function (x) { x = x || ''; return (x.normalize ? x.normalize('NFD').replace(/[̀-ͯ]/g, '') : x).toLowerCase(); };
    boite.hidden = false;
    var appliquer = function () {
      var mots = norm(champ.value.trim()).split(/\s+/).filter(Boolean), n = 0, cherche = mots.length > 0;
      cartes.forEach(function (c) {
        var t = c.getAttribute('data-texte') || '';
        var ok = mots.every(function (m) { return t.indexOf(m) > -1; });
        c.classList.toggle('is-cache', !ok);
        if (ok) n++;
      });
      themes.forEach(function (th) { th.classList.toggle('is-cache', !$$('[data-tuto]:not(.is-cache)', th).length); });
      masques.forEach(function (m) { m.hidden = cherche; });
      if (filtres) filtres.hidden = cherche;
      if (vide) vide.hidden = !cherche || n > 0;
      if (compte) compte.textContent = !cherche ? '' : n ? n + (n > 1 ? ' tutos trouvés' : ' tuto trouvé') : 'Aucun tuto ne correspond';
    };
    champ.addEventListener('input', appliquer);
    champ.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var doux = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      liste.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' });
    });
    var tout = $('[data-tuto-tout]', liste);
    if (tout) tout.addEventListener('click', function () { champ.value = ''; appliquer(); champ.focus(); });
  })();

  /* ---------- la frise des étapes de la création (Mes Tutos) ---------- */
  // Survol (souris), focus (clavier) ou toucher : l'étape grossit doucement, sa bulle s'ouvre et la frise se remplit jusqu'à elle.
  // Flèches (gauche, droite, haut, bas), Début et Fin pour passer d'une étape à l'autre, Échap pour refermer la bulle.
  // Le sens de la frise vient du CSS (--sens: h sur ordinateur, v sur téléphone).
  $$('[data-frise]').forEach(function (j) {
    var etapes = $$('.frise-etape', j), piste = $('.frise-piste', j), rempli = $('.frise-rempli', j);
    if (!etapes.length || !piste || !rempli) return;
    j.classList.add('is-vivante');
    var actif = -1, souris = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
    var bouton = function (i) { return $('.frise-point', etapes[i]); };
    var pastille = function (i) { return $('.frise-n', etapes[i]); };
    var centre = function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    var vertical = function () { return getComputedStyle(j).getPropertyValue('--sens').trim() === 'v'; };
    // la piste va du centre de la première pastille au centre de la dernière ; le remplissage s'arrête sur l'étape active
    var mesurer = function () {
      var a = centre(pastille(0)), z = centre(pastille(etapes.length - 1)), o = j.getBoundingClientRect(), v = vertical();
      piste.style.left = (a.x - o.left) + 'px';
      piste.style.top = (a.y - o.top) + 'px';
      piste.style.width = v ? '' : Math.max(0, z.x - a.x) + 'px';
      piste.style.height = v ? Math.max(0, z.y - a.y) + 'px' : '';
      var part = 0;
      if (actif > -1) {
        var p = centre(pastille(actif)), long = v ? z.y - a.y : z.x - a.x;
        part = long ? (v ? p.y - a.y : p.x - a.x) / long : 0;
      }
      rempli.style.setProperty('--part', Math.max(0, Math.min(1, part)).toFixed(4));
    };
    var ouvrir = function (i) {
      if (i === actif) return;
      actif = i;
      etapes.forEach(function (e, k) {
        var on = k === i;
        e.classList.toggle('is-active', on);
        e.classList.toggle('is-faite', i > -1 && k < i);
        var b = bouton(k);
        if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      mesurer();
    };
    etapes.forEach(function (e, i) {
      var b = bouton(i);
      if (souris) e.addEventListener('mouseenter', function () { ouvrir(i); });
      if (!b) return;
      // le focus au clavier ouvre la bulle ; au doigt, c'est le toucher (un second toucher la referme)
      var auDoigt = false;
      b.addEventListener('pointerdown', function () { auDoigt = true; });
      b.addEventListener('focus', function () { if (!auDoigt) ouvrir(i); });
      b.addEventListener('click', function () { auDoigt = false; ouvrir(i === actif && !souris ? -1 : i); });
      b.addEventListener('keydown', function (ev) {
        var k = ev.key, n = etapes.length, cible = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') cible = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') cible = (i - 1 + n) % n;
        else if (k === 'Home') cible = 0;
        else if (k === 'End') cible = n - 1;
        else if (k === 'Escape') { ouvrir(-1); return; }
        if (cible < 0) return;
        ev.preventDefault();
        var bc = bouton(cible);
        if (bc) bc.focus();
      });
    });
    // un toucher ailleurs que sur la frise referme la bulle (téléphone)
    d.addEventListener('click', function (ev) { if (!souris && actif > -1 && !j.contains(ev.target)) ouvrir(-1); });
    window.addEventListener('resize', mesurer);
    // les bulles qui s'ouvrent (frise verticale) changent la hauteur : on remesure
    if (window.ResizeObserver) new ResizeObserver(mesurer).observe(j);
    // au départ : la première étape, bulle ouverte sur ordinateur ; sur téléphone, tout est replié
    ouvrir(souris ? 0 : -1);
  });

  /* ---------- commander : les ventes ouvrent bientôt ---------- */
  // Le serveur renvoie ici (?ventes=bientot) une commande envoyée pendant que les ventes sont fermées.
  if (/[?&]ventes=bientot(&|$)/.test(location.search)) $$('[data-ventes-bientot]').forEach(function (el) { el.hidden = false; });

  /* ---------- apparition au défilement ---------- */
  var reveals = $$('.reveal');
  d.documentElement.classList.add('rv-pret');
  // ce qui est déjà à l'écran s'affiche tout de suite, sans fondu
  var basEcran = window.innerHeight * 0.96;
  // ce qui est rangé dans un menu déroulant (fermé) s'affiche tel quel à l'ouverture : pas de fondu, jamais de bloc vide
  reveals = reveals.filter(function (el) { if (el.closest('details') || el.getBoundingClientRect().top < basEcran) { el.classList.add('is-visible', 'rv-direct'); return false; } return true; });
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

  /* Le paiement à l'année n'est plus proposé : le forfait Mini se paie au mois, sans engagement. */

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
      if (name.length < 2) { show('d-err', tr('Écrivez au moins deux lettres, par exemple le nom de votre entreprise.')); notify(); return; }
      var full = name + tld.value;
      busy = true; checkBtn.disabled = true;
      show('d-wait', ICO.wait + tr('Je regarde si ') + full + tr(' est libre…'));
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
      fetch(RDAP[tld.value] + encodeURIComponent(full), { headers: { Accept: 'application/rdap+json' }, signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          if (res.status === 404) {
            dom.status = 'libre';
            show('d-ok', ICO.ok + full + tr(' est disponible à l’instant. Je le réserve à la commande, à votre nom.'));
          } else if (res.ok) {
            dom.status = 'pris';
            show('d-taken', ICO.no + full + tr(' est déjà pris. Une idée :'));
            suggest(name, tld.value);
          } else {
            throw new Error('rdap ' + res.status);
          }
        })
        .catch(function () {
          dom.status = 'inconnu';
          show('d-err', tr('Je n’arrive pas à vérifier pour l’instant. Pas de souci : je le ferai pour vous.'));
        })
        .then(function () { clearTimeout(timer); busy = false; checkBtn.disabled = false; notify(); });
    }
    var applyOwn = function () {
      [input, tld, checkBtn].forEach(function (el) { el.disabled = own.checked; });
      if (own.checked) { dom.status = 'mien'; show('d-ok', ICO.ok + tr('Parfait, on gardera votre nom de domaine actuel.')); }
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
      // Coche ou décoche « J'ai déjà un nom de domaine » (création seule : le client garde le sien)
      setOwn: function (on) { if (own.checked !== !!on) { own.checked = !!on; applyOwn(); notify(); } },
      focus: function () { (own.checked ? own : input).focus(); }
    };
  }

  /* ---------- pages en plus : compteur (boutons + et -), 10 € la page, payé une fois ---------- */
  var pagesPlus = function (scope, data) {
    var i = $('[data-pages-plus]', scope);
    if (!i) return 0;
    var n = parseInt(i.value, 10);
    n = isNaN(n) ? 0 : Math.max(0, Math.min(data.pagesPlusMax || 40, n));
    if (String(n) !== i.value) i.value = String(n);
    var prix = $('[data-pp-prix]', scope);
    if (prix) prix.textContent = n ? '+ ' + euro(n * (data.pagePlus || 0)) : euro(0);
    return n;
  };
  var initPagesPlus = function (scope, n) {
    var i = $('[data-pages-plus]', scope);
    if (!i) return;
    if (n) i.value = String(parseInt(n, 10) || 0);
    $$('[data-pp-step]', scope).forEach(function (b) {
      b.addEventListener('click', function () {
        i.value = String(Math.max(0, (parseInt(i.value, 10) || 0) + parseInt(b.getAttribute('data-pp-step'), 10)));
        i.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    i.addEventListener('input', function () { i.dispatchEvent(new Event('change', { bubbles: true })); });
  };
  var ppNom = function (n) { return n + (n > 1 ? tr(' pages en plus') : tr(' page en plus')); };

  /* ---------- configurateur « Créer mon site » ---------- */
  var builder = $('[data-builder]');
  if (builder) {
    var bData;
    try { bData = JSON.parse(builder.getAttribute('data-builder')); } catch (e) { bData = null; }
    if (bData) initBuilder(builder, bData);
  }

  function initBuilder(box, data) {
    var find = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
    var val = function (name) { var r = $('input[name="' + name + '"]:checked', box) || $('input[type="hidden"][name="' + name + '"]', box); return r ? r.value : ''; };
    initBoutique(box);
    var setText = function (key, text) { $$('[data-sum="' + key + '"]', box).forEach(function (el) { el.textContent = text; }); };
    var params = new URLSearchParams(location.search);
    // préremplissage : ?forfait=sans (je m'en occupe moi-même), ?gestion=moi…
    var pf = slug(params.get('forfait') || '');
    if (pf === 'sans' || slug(params.get('gestion') || '') === 'moi') { var gm = $('input[name="b-gestion"][value="moi"]', box); if (gm) gm.checked = true; }
    else if (pf) { var fr = $('input[name="b-forfait"][value="' + pf + '"]', box); if (fr) fr.checked = true; }
    var lp = params.get('lissage') === 'oui' ? '12' : (params.get('lissage') || '');
    if (lp) { var l = $('input[name="b-lisse"][value="' + slug(lp) + '"]', box); if (l) l.checked = true; }
    var code = codeEvenement(box, function () { update(); });
    var form = $('[data-builder-form]', box);
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    var domain = initDomain(box, update);
    var autoOwn = false; // « j'ai déjà un nom de domaine » coché par le choix « je m'en occupe moi-même »

    /* le total, en bas de la page */
    function update(ev) {
      var t = find(data.types, val('b-type')) || find(data.types, 'une-page') || data.types[0];
      var seule = val('b-gestion') === 'moi'; // création seule : pas de formule, le code du site est remis
      var f = seule ? (find(data.forfaits, 'sans') || { id: 'sans', name: 'Autonome', month: 0 }) : (find(data.forfaits, val('b-forfait')) || data.forfaits[0]);
      // le client garde son nom de domaine : on le note, et on le remet comme avant s'il revient à « on s'occupe de tout »
      if (seule && !domain.own()) { autoOwn = true; domain.setOwn(true); return; }
      if (!seule && autoOwn) { autoOwn = false; domain.setOwn(false); return; }
      $$('[data-avec-formule]', box).forEach(function (e) { e.hidden = seule; });
      $$('[data-seule-txt]', box).forEach(function (e) { e.hidden = !seule; });
      var lisseN = parseInt(val('b-lisse'), 10) || 0;
      var lnote = $('[data-lisse-note]', box);
      if (lnote) lnote.hidden = !lisseN;
      var annual = false; // l'abonnement se paie toujours au mois
      var mult = annual ? 12 - data.free : 1;
      var per = tr(annual ? '/an' : '/mois');
      setText('type', siteNom(t));
      setText('type-price', euro(t.price));
      // Forfait Mini : 10 € par mois avec le nom de domaine du client ; s'il n'en a pas, on le fournit pour data.domaine € de plus par mois
      var domPlus = (!seule && !domain.own()) ? (data.domaine || 0) : 0;
      setText('forfait', seule ? tr('Forfait Autonome') : tr('Forfait ') + planName(f.name));
      setText('forfait-price', seule ? tr('sans abonnement') : euro(f.month * mult) + per);
      var dom = domain.get(), domText = '';
      if (domain.own()) domText = tr('Mon nom de domaine actuel');
      else if (dom.name) domText = dom.name + dom.tld + (dom.status === 'libre' ? tr(' (disponible)') : dom.status === 'pris' ? tr(' (déjà pris)') : '');
      setText('domain', domain.own() ? 'Nom de domaine : le vôtre' : 'Nom de domaine fourni' + (domText ? ' : ' + domText : ''));
      setText('domain-prix', domain.own() ? euro(0) : '+ ' + euro(domPlus) + per);
      // code promo valable : la remise porte sur la création (le site et la boutique), jamais sur la formule
      var r = code.ok ? (code.remise || data.remise || 0) : 0;
      var prixSite = round2(t.price * (100 - r) / 100);
      var rLine = $('[data-sum-remise]', box);
      if (rLine) rLine.hidden = !r;
      // le libellé suit la remise du code tapé (10 % pour un code de mail de prospection, 20 % pour un code événement)
      var rLab = rLine && rLine.querySelector('span');
      if (rLab && r) rLab.textContent = (EN ? 'Promo code' : 'Code promo') + ' (- ' + r + ' %)';
      setText('remise', '- ' + euro(round2(t.price - prixSite)));
      // la création se paie en entier à la commande (data.acompte = 100) : en une fois, ou en 3 ou 4 fois avec un
      // organisme externe, sur la page de paiement. Le forfait démarre à la mise en ligne du site.
      var aPayer = round2(prixSite * (data.acompte || 100) / 100);
      var recur = f.month * mult + domPlus;
      var lisse = lisseN > 0;
      setText('today-label', tr('Aujourd’hui, à la commande : votre site'));
      setText('today', euro(aPayer));
      setText('recur-label', seule ? tr('Ensuite, chaque mois') : tr('Dès la mise en ligne, chaque mois'));
      setText('recur', seule ? tr('rien') : euro(recur) + per);
      setText('detail', tr('Prix total du site : ') + euro(prixSite) + '.');
      var bar = $('[data-sum="bar"]', box);
      if (bar) bar.innerHTML = '<b>' + euro(prixSite) + '</b>' + (seule ? tr(', sans abonnement') : tr(' puis ') + '<b>' + euro(recur) + per + '</b>');
      // Lien « Poser une question » (formulaire de contact, en clair)
      var q = { type: t.label, forfait: seule ? 'Forfait Autonome (je gère tout moi-même)' : f.name, paiement: seule ? '' : 'Au mois', lissage: lisse ? String(lisseN) : '', domaine: seule ? '' : domText, options: '' };
      $$('[data-sum-go]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href'), q)); });
      // Lien « Commander » : paramètres exacts attendus par /commander/
      var o = { type: t.id, forfait: f.id, periode: annual ? 'annee' : 'mois', lissage: lisse ? String(lisseN) : '', domaine: seule ? '' : domain.full(), domaine_statut: domain.statut(), options: '', pages_plus: '', code: code.code && code.ok !== false ? code.code : '' };
      $$('[data-sum-order]', box).forEach(function (a) { a.setAttribute('href', withParams(a.getAttribute('href').split('?')[0], o)); });
    }
    box.addEventListener('change', update);
    update();
    if (params.get('domaine') || params.get('domaine_statut') === 'mien') domain.set(params.get('domaine'), params.get('domaine_statut'));
    if (code.set) code.set(params.get('code'));

    /* barre du bas (téléphone) : cachée quand le total est visible ; « Mon total » y descend */
    var bar = $('[data-sum-bar]', box), sum = $('.b-sum', box);
    if (bar && sum && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { bar.classList.toggle('is-hidden', en.isIntersecting); });
      }, { threshold: 0.1 }).observe(sum);
    }
    $$('[data-sum-total]', box).forEach(function (a) { a.addEventListener('click', function (e) { if (!sum) return; e.preventDefault(); sum.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
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
    var val = function (name) { var r = $('input[name="' + name + '"]:checked', form) || $('input[type="hidden"][name="' + name + '"]', form); return r ? r.value : ''; };
    initBoutique(form);
    var setText = function (key, text) { $$('[data-order="' + key + '"]', root).forEach(function (el) { el.textContent = text; }); };
    var params = new URLSearchParams(location.search);
    var t0 = form.querySelector('input[name="_t"]'); if (t0) t0.value = Date.now();
    // Déjà connecté à son espace client : la commande va sur ce compte, sans mot de passe à taper
    (function () {
      var ajax = (window.aled08Ajax || '/wp-admin/admin-ajax.php');
      if (!window.fetch) return;
      fetch(ajax + '?action=aled08e_moi', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j || !j.success || !j.data || !j.data.connecte) return;
        var d = j.data, box = $('[data-order-moi]', form), mdp = $('[data-order-mdp]', form);
        if (mdp) { mdp.hidden = true; var i = $('input', mdp); if (i) { i.required = false; i.disabled = true; } }
        ['prenom', 'nom', 'telephone', 'entreprise', 'adresse', 'code_postal', 'ville'].forEach(function (k) {
          var el = form.querySelector('[name="' + k + '"]'); if (el && !el.value && d[k]) el.value = d[k];
        });
        var em = form.querySelector('[name="email"]'); if (em) { em.value = d.email || em.value; em.readOnly = true; }
        if (box) { box.textContent = 'Vous êtes connecté à votre espace client (' + (d.email || '') + ') : la commande s’y ajoute.'; box.hidden = false; }
      }).catch(function () {});
    })();

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

    /* préremplissage depuis l'adresse (?forfait=sans : je m'en occupe moi-même) */
    var pfo = slug(params.get('forfait') || '');
    if (pfo === 'sans' || slug(params.get('gestion') || '') === 'moi') { var gmo = $('input[name="gestion"][value="moi"]', form); if (gmo) gmo.checked = true; }
    ['type', 'forfait'].forEach(function (k) {
      var v = slug(params.get(k) || '');
      var r = v && $('input[name="' + k + '"][value="' + v + '"]', form);
      if (r) r.checked = true;
    });
    var lpo = params.get('lissage') === 'oui' ? '12' : (params.get('lissage') || '');
    if (lpo) { var lr = $('input[name="lissage"][value="' + slug(lpo) + '"]', form); if (lr) lr.checked = true; }
    (params.get('options') || '').split(',').forEach(function (id) {
      var c = id && $('.b-opt input[value="' + slug(id) + '"]', form);
      if (c) c.checked = true;
    });
    initPagesPlus(form, params.get('pages_plus'));
    var code = codeEvenement(form, function () { update(true); });
    var domain = initDomain(root, function () { update(true); });
    var hiddenDomain = $('[data-order-domaine]', form);
    var engRow = $('[data-order-engagement]', form), engBox = engRow && engRow.querySelector('input');
    var autoOwn = false; // « j'ai déjà un nom de domaine » coché par « je m'en occupe moi-même »

    function update(fromUser, ev) {
      var t = find(data.types, val('type')) || find(data.types, 'une-page') || data.types[0];
      var seule = val('gestion') === 'moi'; // création seule : pas de formule, le code du site est remis
      var f = seule ? (find(data.forfaits, 'sans') || { id: 'sans', name: 'Autonome', month: 0 }) : (find(data.forfaits, val('forfait')) || data.forfaits[0]);
      if (seule && !domain.own()) { autoOwn = true; domain.setOwn(true); return; }
      if (!seule && autoOwn) { autoOwn = false; domain.setOwn(false); return; }
      filterOpts(form, t.id);
      var lisseN = parseInt(val('lissage'), 10) || 0;
      var lnote = $('[data-lisse-note]', form);
      if (lnote) lnote.hidden = !lisseN;
      var annual = false; // l'abonnement se paie toujours au mois
      root.setAttribute('data-billing', annual ? 'annuel' : 'mensuel');
      var mult = annual ? 12 - data.free : 1;
      var per = tr(annual ? '/an' : '/mois');
      var perWord = tr(annual ? 'année' : 'mois');
      var perUnit = tr(annual ? 'an' : 'mois');
      var lisse = lisseN > 0;
      setText('eng-n', String(lisseN || ''));
      if (engRow) { engRow.hidden = !lisse; }
      if (engBox) { engBox.required = lisse; if (!lisse) engBox.checked = false; }
      var optOnce = 0, optRec = 0, names = [], ids = [], lines = [];
      $$('.b-opt input:checked', form).forEach(function (i) {
        var o = find(data.options, i.value);
        if (!o) return;
        names.push(tr(o.name)); ids.push(o.id); optOnce += o.once; optRec += o.month * mult;
      });
      var pp = pagesPlus(form, data);
      if (pp) { names.push(ppNom(pp)); optOnce += pp * data.pagePlus; }
      // code promo valable : la remise porte sur la création (le site et les options payées une fois)
      var r = code.ok ? (code.remise || data.remise || 0) : 0;
      var k = (100 - r) / 100;
      var kOpt = code.sur === 'creation' ? 1 : k; // un code de mail de prospection ne touche que la création
      var prixSite = round2(t.price * k);
      // la création se paie en entier à la commande (data.acompte = 100)
      var aPayer = round2(prixSite * (data.acompte || 100) / 100);
      var forfaitFirst = f.month * mult;
      // nom de domaine fourni : data.domaine € de plus par mois (rien si le client a déjà le sien, rien en Autonomie)
      var domPlus = (!seule && !domain.own()) ? (data.domaine || 0) : 0;
      $$('[data-avec-formule]', root).forEach(function (e) { e.hidden = seule; });
      $$('[data-seule-txt]', root).forEach(function (e) { e.hidden = !seule; });
      setText('domain-prix', domain.own() ? euro(0) : '+ ' + euro(domPlus) + per);
      // aujourd'hui : la création en entier et les options payées une fois ; le forfait démarre à la mise en ligne du site
      lines.push([tr('Création du site (') + siteNom(t).toLowerCase() + ')', aPayer]);
      $$('.b-opt input:checked', form).forEach(function (i) {
        var o = find(data.options, i.value);
        if (o && o.once) lines.push([tr(o.name), round2(o.once * kOpt)]);
      });
      if (r) lines.push([tr('Code promo : ') + r + tr(' % de remise sur la création, déjà déduits'), 0]);
      optOnce = round2(optOnce * kOpt);
      if (pp) lines.push([ppNom(pp) + ' (' + pp + ' × ' + euro(data.pagePlus) + ')', pp * data.pagePlus]);
      var today = round2(lines.reduce(function (s, l) { return s + l[1]; }, 0));
      var next = round2(forfaitFirst + domPlus + optRec);
      setText('today', euro(today));
      setText('btn', euro(today));
      setText('next', seule ? tr('rien') : euro(next) + per);
      setText('next-label', seule ? tr('Ensuite : pas d’abonnement') : tr('Dès la mise en ligne : votre forfait'));
      var ul = $('[data-order-lines]', root);
      if (ul) {
        ul.innerHTML = '';
        lines.forEach(function (l) {
          var li = d.createElement('li');
          li.innerHTML = '<span></span><b></b>';
          li.firstChild.textContent = l[0];
          li.lastChild.textContent = l[1] ? euro(l[1]) : '';
          ul.appendChild(li);
        });
      }
      /* récapitulatif latéral */
      setText('type', siteNom(t));
      setText('type-price', euro(prixSite));
      setText('forfait', seule ? tr('Forfait Autonome') : tr('Forfait ') + planName(f.name));
      setText('forfait-price', seule ? tr('sans abonnement') : euro(forfaitFirst) + per);
      setText('delai', tr(t.delai));
      var optLine = $('[data-order-opts]', root);
      if (optLine) {
        optLine.hidden = !names.length;
        setText('opts-label', names.length > 1 ? names.length + tr(' options') : (names[0] || tr('Options')));
        var parts = [];
        if (optOnce) parts.push(euro(optOnce));
        if (optRec) parts.push(euro(optRec) + per);
        setText('opts', parts.join(' + '));
      }
      var dom = domain.get(), domText = '';
      if (domain.own()) domText = tr('Mon nom de domaine actuel');
      else if (dom.name) domText = dom.name + dom.tld + (dom.status === 'libre' ? tr(' (disponible)') : dom.status === 'pris' ? tr(' (déjà pris)') : '');
      setText('domain', domain.own() ? 'Nom de domaine : le vôtre' : 'Nom de domaine fourni' + (domText ? ' : ' + domText : ''));
      if (hiddenDomain) hiddenDomain.value = domain.full();
      /* la configuration reste dans l'adresse (retour arrière, partage, erreur serveur) */
      if (fromUser && window.history && history.replaceState) {
        var q = new URLSearchParams(location.search);
        var o = { type: t.id, forfait: f.id, periode: annual ? 'annee' : 'mois', lissage: lisse ? String(lisseN) : '', domaine: domain.full(), domaine_statut: domain.statut(), options: ids.join(','), pages_plus: pp ? String(pp) : '', code: code.code || '' };
        Object.keys(o).forEach(function (k) { if (o[k]) q.set(k, o[k]); else q.delete(k); });
        q.delete('erreur'); q.delete('annule');
        var qs = q.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
    }
    form.addEventListener('change', function (e) { update(true, e); });
    update(false);
    if (params.get('domaine') || params.get('domaine_statut') === 'mien') domain.set(params.get('domaine'), params.get('domaine_statut'));
    if (code.set) code.set(params.get('code'));

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
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = tr('Un instant, je prépare le paiement…'); }
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
  /* L'œil : voir le mot de passe qu'on tape (connexion, « Mon compte », clés de paiement) */
  var OEIL = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="oeil-barre" d="M4 4l16 16"/></svg>';
  var oeilPoser = function (racine) {
    $$('input[type="password"]', racine || d).forEach(function (i) {
      if (i.getAttribute('data-oeil') || i.closest('#wpadminbar')) return;
      i.setAttribute('data-oeil', '1');
      var w = d.createElement('span');
      w.className = 'mdp-oeil';
      i.parentNode.insertBefore(w, i);
      w.appendChild(i);
      var b = d.createElement('button');
      b.type = 'button';
      b.className = 'mdp-oeil-btn';
      b.setAttribute('aria-label', 'Afficher le mot de passe');
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = OEIL;
      w.appendChild(b);
      b.addEventListener('click', function () {
        var voir = i.type === 'password';
        i.type = voir ? 'text' : 'password';
        b.setAttribute('aria-pressed', voir ? 'true' : 'false');
        b.setAttribute('aria-label', voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
        i.focus();
      });
    });
  };
  oeilPoser();
  window.aled08OeilPoser = oeilPoser;

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
    /* « Forfait et factures » est rangé dans « Mon compte » : on y va, puis on descend jusqu'au bloc */
    var bloc = null;
    var alias = function (id) {
      bloc = null;
      if (id === 'forfait' && !$('[data-tab="forfait"]', app) && $('#forfait-bloc', app)) { bloc = $('#forfait-bloc', app); return 'compte'; }
      return id;
    };
    var doux = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    /* Pendant la création du site, certains onglets restent fermés : on ramène à la grande jauge */
    var verrou = (app.getAttribute('data-verrou') || '').split(',').filter(Boolean);
    var jauge = $('#jauge-creation', app);
    tabs.forEach(function (t) { if (verrou.indexOf(t.getAttribute('data-tab')) >= 0) { t.classList.add('is-ferme'); t.setAttribute('aria-disabled', 'true'); t.title = 'Disponible quand votre site sera en ligne'; } });
    /* Ma boutique se prépare en arrière-plan : l'espace s'affiche d'abord, sans attendre le site du client */
    var chargerBoutique = function () {
      var p = d.getElementById('t-vacances');
      var att = p && $('[data-charger]', p);
      if (!att || att._encours || !window.fetch || !window.DOMParser) return;
      att._encours = true;
      fetch(att.getAttribute('data-charger'), { credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } })
        .then(function (r) { if (!r.ok) throw new Error('http'); return r.text(); })
        .then(function (html) {
          var neuf = new DOMParser().parseFromString(html, 'text/html').getElementById('t-vacances');
          if (!neuf || $('[data-charger]', neuf)) throw new Error('contenu');
          p.innerHTML = neuf.innerHTML;
          $$('script', p).forEach(function (o) { if (o.src) return; var n = d.createElement('script'); n.text = o.text; o.parentNode.replaceChild(n, o); });
          if (typeof brancher === 'function') brancher(p);
          if (window.aled08OeilPoser) window.aled08OeilPoser(p);
        })
        .catch(function () { att._encours = false; var t = $('p', att); if (t) t.innerHTML = 'Votre boutique met du temps à répondre. <a href="' + att.getAttribute('data-charger') + '#vacances">Réessayer</a>'; });
    };
    setTimeout(chargerBoutique, 1200);
    var show = function (id, focus, auto) {
      id = alias(id);
      if (id === 'vacances') chargerBoutique();
      if (verrou.indexOf(id) >= 0) {
        if (jauge && !auto) {
          var hj = d.querySelector('.site-header');
          window.scrollBy({ top: jauge.getBoundingClientRect().top - (hj ? hj.offsetHeight : 70) - 10, behavior: doux ? 'smooth' : 'auto' });
          jauge.classList.remove('is-rappel'); void jauge.offsetWidth; jauge.classList.add('is-rappel');
        }
        if (auto) id = 'accueil'; else return;
      }
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        var panel = d.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (on) {
            // le panneau arrive en douceur
            panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
            // Ma boutique : son sous-menu s'illumine un instant, pour qu'on le voie
            var sous = $('.bg-nav, .bq-menu', panel);
            if (sous) { sous.classList.remove('is-flash'); void sous.offsetWidth; sous.classList.add('is-flash'); setTimeout(function () { sous.classList.remove('is-flash'); }, 2200); }
          }
        }
        if (on && window.innerWidth < 900) {
          // l'onglet choisi glisse au milieu de la rangée, sans faire bouger la page
          var rang = t.parentNode;
          if (rang && rang.scrollTo) rang.scrollTo({ left: t.offsetLeft - (rang.clientWidth - t.offsetWidth) / 2, behavior: doux ? 'smooth' : 'auto' });
        }
      });
      // « Mon site » reste allumé quand une de ses rubriques (Ma commande, Modifications, Extras, Ma boutique) est ouverte
      var siteTab = $('[role="tab"][data-tab="site"]', app);
      if (siteTab) {
        var sous = tabs.some(function (t) { return t.getAttribute('data-groupe') === 'site' && t.getAttribute('data-tab') === id; });
        siteTab.classList.toggle('is-groupe-on', sous);
        app.classList.toggle('is-site-sous', sous);
      }
      var entete = d.querySelector('.site-header');
      var haut = (entete ? entete.offsetHeight : 70) + 10;
      if (bloc && window.lmmSmOuvrir) { var part = bloc.closest('[data-sm-part]'); if (part) window.lmmSmOuvrir(part); } // la rubrique qui contient le bloc s'ouvre
      if (bloc) { window.scrollBy({ top: bloc.getBoundingClientRect().top - haut, behavior: doux ? 'smooth' : 'auto' }); return; }
      if (auto) return;
      // la page glisse jusqu'au début de l'onglet : sur téléphone, la rangée d'onglets vient juste sous l'en-tête
      var tel = window.innerWidth < 900;
      var cible = (tel && $('.app-tabs', app)) || $('.app-main', app);
      var dy = cible.getBoundingClientRect().top - haut;
      if (tel ? Math.abs(dy) > 6 : dy < 0) window.scrollBy({ top: dy, behavior: doux ? 'smooth' : 'auto' });
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
    // onglet Extras : le filtre par famille
    $$('[data-ex-filtre]', app).forEach(function (b) {
      b.addEventListener('click', function () {
        var fam = b.getAttribute('data-ex-filtre');
        $$('[data-ex-filtre]', app).forEach(function (x) { x.classList.toggle('is-on', x === b); });
        $$('[data-ex-groupe]', app).forEach(function (g) { g.hidden = fam !== 'tous' && g.getAttribute('data-ex-groupe') !== fam; });
      });
    });
    var startTab = (new URLSearchParams(location.search).get('outil') || location.hash.slice(1) || '').replace(/[^a-z]/g, '');
    if (startTab && $('[data-tab="' + alias(startTab) + '"]', app)) show(startTab, false, true);
    // Tout ce qui se branche sur le contenu d'un onglet (au chargement, puis après un changement de rubrique sans rechargement)
    var brancher = function (racine) {
    // Mes articles : cocher plusieurs articles pour les supprimer d'un coup
    $$('form[data-art-lot]', racine).forEach(function (f) {
        var cases = $$('input[form="' + f.id + '"]', racine), tout = $('[data-art-tout]', f), bt = $('[data-art-lot-btn]', f);
        var maj = function () {
          var n = cases.filter(function (c) { return c.checked; }).length;
          cases.forEach(function (c) { var li = c.closest('.art-carte'); if (li) li.classList.toggle('est-coche', c.checked); });
          if (tout) { tout.checked = n > 0 && n === cases.length; tout.indeterminate = n > 0 && n < cases.length; }
          f.classList.toggle('a-des-coches', n > 0);
          if (bt && !bt.classList.contains('is-confirmer')) { bt.disabled = n === 0; var s = $('span', bt); if (s) s.textContent = n ? 'Supprimer ' + n + (n > 1 ? ' articles' : ' article') : 'Supprimer la sélection'; }
        };
        cases.forEach(function (c) { c.addEventListener('change', maj); });
        if (tout) tout.addEventListener('change', function () { cases.forEach(function (c) { c.checked = tout.checked; }); maj(); });
        maj();
    });
    // supprimer, retirer, annuler : le bouton devient « Confirmer », un second appui valide
    $$('form[data-confirmer]', racine).forEach(function (f) {
      f.addEventListener('submit', function (e) {
        if (f._ok) return;
        e.preventDefault();
        var b = $('button[type=submit]', f); if (!b) return;
        var avant = b.innerHTML;
        f._ok = true; b.classList.add('is-confirmer'); b.innerHTML = '<span>Confirmer</span>';
        setTimeout(function () { f._ok = false; b.classList.remove('is-confirmer'); b.innerHTML = avant; }, 4000);
      });
    });
      // Ma boutique : changer de rubrique sans recharger la page (pas de saut en haut puis en bas).
      // Les autres rubriques sont préparées en arrière-plan : le clic les affiche aussitôt.
      window._bqPrets = window._bqPrets || {};
      var bqObtenir = function (url) {
        if (!window._bqPrets[url]) window._bqPrets[url] = fetch(url, { credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } }).then(function (r) { if (!r.ok) throw new Error('http'); return r.text(); });
        window._bqPrets[url].catch(function () { delete window._bqPrets[url]; });
        return window._bqPrets[url];
      };
      var bqLiens = $$('.bg-nav a.bg-lien', racine);
      if (bqLiens.length && window.fetch) setTimeout(function () { bqLiens.forEach(function (x, i) { if (!x.classList.contains('is-on')) setTimeout(function () { bqObtenir(x.href.split('#')[0]); }, i * 350); }); }, 400);
      bqLiens.forEach(function (l) {
        l.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || !window.fetch || !window.DOMParser) return;
          var panneau = l.closest('.app-panel');
          if (!panneau || !panneau.id) return;
          e.preventDefault();
          var url = l.href.split('#')[0];
          $$('.bg-nav a.bg-lien', panneau).forEach(function (x) { x.classList.toggle('is-on', x === l); if (x === l) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
          panneau.classList.add('est-en-charge');
          bqObtenir(url).then(function (html) {
            delete window._bqPrets[url]; // la prochaine fois, une version fraîche
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var neuf = doc.getElementById(panneau.id);
            if (!neuf || !neuf.querySelector('.bg-nav')) throw new Error('contenu');
            panneau.innerHTML = neuf.innerHTML;
            // les petits scripts posés dans la rubrique (aperçu des congés…) doivent repartir
            $$('script', panneau).forEach(function (o) { if (o.src) return; var n = d.createElement('script'); n.text = o.text; o.parentNode.replaceChild(n, o); });
            panneau.classList.remove('est-en-charge');
            try { history.pushState({ aled08: 1 }, '', url + '#' + panneau.id.replace(/^t-/, '')); window._aled08Pousse = true; } catch (err) {}
            brancher(panneau); oeilPoser(panneau);
            var contenu = $('.bg-nav', panneau);
            if (contenu) {
              // le contenu de la rubrique arrive en douceur, et la page glisse (une seule fois) jusqu'au sous-menu
              var suite = contenu.nextElementSibling;
              while (suite) { suite.classList.add('bg-arrive'); suite = suite.nextElementSibling; }
              var entete = d.querySelector('.site-header');
              var dy = contenu.getBoundingClientRect().top - (entete ? entete.offsetHeight : 70) - 10;
              if (Math.abs(dy) > 6) window.scrollBy({ top: dy, behavior: doux ? 'smooth' : 'auto' });
            }
          }).catch(function () { location.href = l.href; });
        });
      });
    };
    brancher(app);
    window.addEventListener('popstate', function () { if (window._aled08Pousse) location.reload(); });
    // Après un enregistrement dans Ma boutique, la page revient directement sur la rubrique, sans animation
    if (/[?&]sub=/.test(location.search)) {
      var sousMenu = $('.app-panel:not([hidden]) .bg-nav', app);
      if (sousMenu) {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        var caler = function () { var en = d.querySelector('.site-header'); window.scrollBy(0, sousMenu.getBoundingClientRect().top - (en ? en.offsetHeight : 70) - 10); };
        caler(); window.addEventListener('load', caler);
      }
    }
  }

  function copyButtons(app, toast) {
    $$('[data-copy]', app).forEach(function (btn) {
      var src = d.getElementById(btn.getAttribute('data-copy')) || $('[data-copy-src]', app);
      if (!src) return;
      btn.addEventListener('click', function () {
        var done = function () { toast(btn.getAttribute('data-copy-msg') || tr('Lien copié, prêt à envoyer')); };
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
      if (ta && !ta.value.trim()) { e.preventDefault(); toast(tr('Écrivez votre demande en quelques mots')); ta.focus(); return; }
      if (file && file.files && file.files[0] && file.files[0].size > 8 * 1024 * 1024) { e.preventDefault(); toast(tr('La photo dépasse 8 Mo : choisissez-en une plus légère')); return; }
      var b = reqForm.querySelector('button[type="submit"]');
      if (b) { b.disabled = true; b.querySelector('span').textContent = tr('Envoi en cours…'); }
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
            if (lastStatut && j.statut !== lastStatut) toast(j.libelle || tr('Nouvelle étape'));
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
      qrBox.innerHTML = '<svg class="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + tr('QR code vers votre site') + '" shape-rendering="crispEdges"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path fill="#2E2A47" d="' + path + '"/></svg>';
      var dl = $('[data-qr-dl]', app);
      if (dl) dl.addEventListener('click', function () {
        var svg = qrBox.querySelector('svg').outerHTML;
        var img = new Image();
        img.onload = function () {
          var cv = d.createElement('canvas'); cv.width = cv.height = 1200;
          var cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false; cx.drawImage(img, 0, 0, 1200, 1200);
          var a = d.createElement('a'); a.download = 'qr-code.png'; a.href = cv.toDataURL('image/png'); d.body.appendChild(a); a.click(); a.remove();
          toast(tr('QR code téléchargé'));
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
    };
    if (d.readyState === 'complete') drawQr(); else window.addEventListener('load', drawQr);
  }

  /* démo de l'espace client : les mêmes onglets que le vrai espace, chaque bouton affiche un petit message */
  function initApp(app) {
    var toast = makeToast(app);
    initTabs(app);
    $$('[data-toast-msg]', app).forEach(function (b) { b.addEventListener('click', function () { toast(b.getAttribute('data-toast-msg')); }); });

    // « Modifier mon site moi-même » : un petit site en mode modification, comme le vrai (rien n'est envoyé)
    var ed = $('[data-demo-ed]', app);
    if (ed) {
      var edSite = $('[data-ed-site]', ed), edAnnuler = $('[data-ed-annuler]', ed), pile = [], courant = null, avant = '', pop = null;
      var fermerPop = function () { if (pop && pop.parentNode) pop.parentNode.removeChild(pop); pop = null; };
      var fermer = function (garder) {
        if (!courant) return;
        var el = courant; courant = null; fermerPop();
        el.removeAttribute('contenteditable'); el.classList.remove('is-cours');
        if (!garder || !el.textContent.trim()) { el.textContent = avant; return; }
        if (el.textContent !== avant) { pile.push([el, avant]); edAnnuler.hidden = false; toast(tr('C’est enregistré : votre site est à jour (démo)')); }
      };
      $$('[data-ed-texte]', ed).forEach(function (el) {
        el.addEventListener('click', function () {
          if (courant === el) return;
          fermer(true);
          courant = el; avant = el.textContent;
          el.setAttribute('contenteditable', 'true'); el.classList.add('is-cours'); el.focus();
          pop = document.createElement('div'); pop.className = 'demo-ed-pop';
          pop.innerHTML = '<button type="button" class="is-ok">' + tr('Enregistrer') + '</button><button type="button">' + tr('Annuler') + '</button>';
          el.insertAdjacentElement('afterend', pop);
          pop.firstChild.addEventListener('mousedown', function (e) { e.preventDefault(); fermer(true); });
          pop.lastChild.addEventListener('mousedown', function (e) { e.preventDefault(); fermer(false); });
        });
        el.addEventListener('keydown', function (e) {
          if (courant !== el) return;
          if (e.key === 'Escape') { e.preventDefault(); fermer(false); }
          if (e.key === 'Enter' && el.tagName !== 'P') { e.preventDefault(); fermer(true); }
        });
      });
      $('[data-ed-photo]', ed).addEventListener('click', function () { fermer(true); toast(tr('Dans votre vrai espace : choisissez une photo sur votre téléphone, elle remplace celle-ci (démo)')); });
      edAnnuler.addEventListener('click', function () { var x = pile.pop(); if (x) { x[0].textContent = x[1]; toast(tr('C’est annulé (démo)')); } edAnnuler.hidden = !pile.length; });
      $('[data-ed-fin]', ed).addEventListener('click', function () { fermer(true); ed.open = false; toast(tr('Mode modification fermé (démo)')); });
      edSite.addEventListener('mousedown', function (e) { if (courant && !courant.contains(e.target) && !(pop && pop.contains(e.target))) fermer(true); });
      // le bouton « Modifier mon site moi-même » (Mon site, Modifications) : le site s'ouvre en mode modification
      $$('[data-ed-ouvrir]', app).forEach(function (b) {
        b.addEventListener('click', function () {
          var t = $('[role="tab"][data-tab="site"]', app); if (t && t.getAttribute('aria-selected') !== 'true') t.click();
          ed.open = true;
          var doux = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
          setTimeout(function () { ed.scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' }); }, 60);
        });
      });
    }

    /* une demande de modification : Bricou la reçoit, Alex la fait (démo : quelques secondes) */
    var form = $('[data-req]', app), txt = $('#req-txt', app), list = $('[data-reqs]', app);
    var file = $('[data-req-file]', app), fileName = $('[data-req-file-name]', app);
    if (!form || !txt || !list) return;
    var fileTxt = fileName ? fileName.textContent : '';
    if (file && fileName) file.addEventListener('change', function () { if (file.files && file.files[0]) fileName.textContent = file.files[0].name; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = txt.value.trim();
      if (!text) { toast(tr('Écrivez votre demande en quelques mots')); txt.focus(); return; }
      var li = d.createElement('li');
      li.innerHTML = '<span><strong></strong><small>' + tr('envoyée à l’instant') + '</small></span><em class="st st-new">' + tr('Reçue par Bricou') + '</em>';
      li.querySelector('strong').textContent = text.length > 60 ? text.slice(0, 57) + '…' : text;
      list.insertBefore(li, list.firstChild);
      txt.value = ''; if (file) file.value = ''; if (fileName) fileName.textContent = fileTxt;
      toast(tr('Merci ! Bricou a bien reçu votre demande (démo)'));
      var st = li.querySelector('.st');
      setTimeout(function () { st.className = 'st st-doing'; st.textContent = tr('Alex s’en occupe'); }, 2000);
      setTimeout(function () { st.className = 'st st-done'; st.textContent = tr('Faite'); toast(tr('Alex a fait votre modification, elle est en ligne (démo)')); }, 4500);
    });
  }

  /* ---------- la bulle de Cerise : en bas de l'écran, sur toutes les pages ----------
     Sur le site : quelques questions, avec la réponse tout de suite (écrite dans la page, sans appel extérieur).
     Dans l'espace client : on écrit à Cerise, elle répond, reformule la demande, le client la confirme et elle part chez Alex.
     Dans la démo : les mêmes gestes, avec des réponses d'exemple écrites dans la page. */
  var flot = $('[data-lia-flot]');
  if (flot) {
    var flotBtn = $('.lia-flot-btn', flot), flotPanel = $('.lia-flot-panel', flot), coucou = $('.lia-flot-coucou', flot);
    var fil = $('[data-lia-fil]', flot), liaForm = $('[data-lia-form]', flot), champ = $('textarea', liaForm), liaNote = $('[data-lia-note]', flot), jetonsEl = $('[data-lia-jetons]', flot);
    var reglages = $('[data-lia-chat]'); // posé par l'espace client (ou par la démo)
    var mode = reglages ? reglages.getAttribute('data-lia-chat') : 'site'; // site | ok | demo | attente | abonnement
    var dial = mode === 'ok' || mode === 'demo';
    var prix = reglages ? +reglages.getAttribute('data-prix') || 1 : 1;
    var solde = reglages ? +reglages.getAttribute('data-solde') || 0 : 0;
    var sansLimite = reglages && reglages.getAttribute('data-illimite') === '1';
    var sansEnergie = !!reglages && reglages.getAttribute('data-sans-energie') === '1'; // énergie en pause : rien à compter ni à afficher
    var cleFil = 'lia_fil_' + (reglages ? reglages.getAttribute('data-uid') || mode : 'site');

    var ecrire = function (texte, qui, html) {
      var p = d.createElement('p');
      p.className = 'lia-msg is-' + qui;
      if (html) p.innerHTML = html; else p.textContent = texte;
      fil.appendChild(p);
      fil.scrollTop = fil.scrollHeight;
      return p;
    };
    var garder = function (qui, texte) { // la conversation survit à un changement de page
      try {
        var l = JSON.parse(sessionStorage.getItem(cleFil) || '[]');
        l.push([qui, texte]);
        sessionStorage.setItem(cleFil, JSON.stringify(l.slice(-20)));
      } catch (e) {}
    };
    var jetonsTxt = function (n) { return n + tr(' d’énergie'); };
    var majJetons = function () {
      if (!dial || !jetonsEl || sansEnergie) return;
      jetonsEl.hidden = false;
      jetonsEl.textContent = sansLimite ? '∞' : jetonsTxt(solde);
    };
    var aller = function (id) {
      var b = $('[role="tab"][data-tab="' + id + '"]') || $('[data-go="' + id + '"]');
      if (b) b.click();
      return !!b;
    };
    var flotOuvrir = function (oui) {
      flotPanel.hidden = !oui;
      flotBtn.setAttribute('aria-expanded', oui ? 'true' : 'false');
      flot.classList.toggle('is-open', oui);
      if (coucou) coucou.hidden = true;
      try { sessionStorage.setItem('lia_vue', '1'); } catch (e) {}
      if (oui) { fil.scrollTop = fil.scrollHeight; if (dial && champ && window.innerWidth > 720) champ.focus(); }
    };

    /* la carte d'une demande reformulée par Cerise : le client confirme, ou non */
    var carte = function (a) {
      if (!a || !a.type || a.type === 'aucune') return;
      var titre, detail = '', petit = '', oui;
      if (a.type === 'demande') {
        var parLia = a.par === 'lia';
        titre = tr('Votre demande pour Bricou');
        detail = a.texte || '';
        petit = parLia && !sansEnergie ? tr('Environ ') + jetonsTxt(a.jetons || 0) + tr('. C’est Alex qui fera la modification.') : tr('C’est bien ça ? Alex fera la modification lui-même.');
        oui = tr('Oui, c’est bien ça');
      } else if (a.type === 'outil') {
        titre = tr('Outil : ') + tr(a.nom || '');
        petit = a.jetons > 0 ? jetonsTxt(a.jetons) + tr(' à chaque lancement.') : tr('Sans énergie.');
        oui = tr('Ouvrir l’outil');
      } else if (a.type === 'onglet') {
        titre = tr('Dans ton espace : ') + tr(a.nom || '');
        oui = tr('Y aller');
      } else return;
      var c = d.createElement('div');
      c.className = 'lia-carte';
      var st = d.createElement('strong'); st.textContent = titre; c.appendChild(st);
      if (detail) { var pd = d.createElement('p'); pd.textContent = detail; c.appendChild(pd); }
      if (petit) { var sm = d.createElement('small'); sm.textContent = petit; c.appendChild(sm); }
      var bs = d.createElement('div'); bs.className = 'lia-carte-btns';
      var bo = d.createElement('button'); bo.type = 'button'; bo.className = 'lia-oui'; bo.textContent = oui;
      var bn = d.createElement('button'); bn.type = 'button'; bn.className = 'lia-non'; bn.textContent = tr('Je corrige');
      bs.appendChild(bo); bs.appendChild(bn); c.appendChild(bs);
      fil.appendChild(c);
      fil.scrollTop = fil.scrollHeight;
      var fini = function () { c.classList.add('is-fait'); bo.disabled = bn.disabled = true; };
      bn.addEventListener('click', function () { fini(); ecrire(tr('Pas de souci ! Dis-moi ce qu’il faut changer, et je reprends ta demande.'), 'lia'); });
      bo.addEventListener('click', function () {
        fini();
        if (a.type === 'demande') {
          var ta = $('#req-txt'), radio = $('input[name="par"][value="' + a.par + '"]');
          if (radio && !radio.disabled) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
          if (ta) { ta.value = a.texte || ''; ta.dispatchEvent(new Event('input', { bubbles: true })); }
          aller('demandes');
          var m = tr('Merci ! Ta demande est prête dans « Modifications ». Ajoute une photo si tu veux, puis envoie : Bricou s’en occupe !');
          ecrire(m, 'lia'); garder('lia', m);
          flotOuvrir(false);
          if (ta) setTimeout(function () { ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); ta.focus(); }, 250);
        } else if (a.type === 'outil') {
          if (!aller('outils')) aller('visibilite');
          var bt = $('[data-ol-ouvrir="' + a.outil + '"]');
          if (bt && bt.getAttribute('aria-expanded') !== 'true') bt.click();
          flotOuvrir(false);
          if (bt) setTimeout(function () { bt.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
        } else {
          aller(a.onglet);
          flotOuvrir(false);
        }
      });
    };

    /* la réponse de Cerise : par le serveur (espace client), ou tirée des exemples de la page (démo) */
    var repondre = function (message, fait) {
      if (mode === 'demo') {
        // les réponses d'exemple sont écrites dans la page (data-cout et non data-jetons : la démo réécrit ces éléments-là)
        var ex = $$('[data-lia-demo] [data-mots]'), bas = message.toLowerCase(), choix = null;
        ex.forEach(function (e) { if (!choix && e.getAttribute('data-mots').split(',').some(function (m) { return m && bas.indexOf(m) > -1; })) choix = e; });
        choix = choix || $('[data-lia-demo] [data-defaut]');
        setTimeout(function () {
          if (!choix) return fait({ reponse: tr('Dans ton vrai espace, je te réponds ici.'), action: { type: 'aucune' }, solde: solde });
          var g = function (n) { return choix.getAttribute('data-' + n) || ''; };
          fait({ reponse: choix.textContent.trim(), solde: sansEnergie ? solde : Math.max(0, solde - prix), action: { type: g('type') || 'aucune', par: g('par'), texte: g('texte'), jetons: +g('cout') || 0, outil: g('outil'), nom: g('nom'), onglet: g('onglet') } });
        }, 700);
        return;
      }
      var fd = new FormData();
      fd.append('action', 'aled08e_bulle');
      fd.append('_n', reglages.getAttribute('data-nonce'));
      fd.append('message', message);
      fetch(reglages.getAttribute('data-ajax'), { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.success) fait(j.data); else fait(null, (j && j.data && j.data.message) || tr('Oups, je n’ai pas pu répondre. Réessaie dans un instant.'), j && j.data && j.data.solde); })
        .catch(function () { fait(null, tr('La connexion a coupé. Réessaie dans un instant.')); });
    };
    var occupe = false;
    var envoyer = function (message) {
      message = (message || '').trim();
      if (!message || occupe) return;
      occupe = true;
      $('button', liaForm).disabled = true;
      ecrire(message, 'moi'); garder('moi', message);
      champ.value = '';
      $$('[data-lia-liens="espace"]', flot).forEach(function (g) { g.hidden = true; }); // les exemples laissent la place à la conversation
      var attente = ecrire('', 'lia is-attente', '<i></i><i></i><i></i>');
      repondre(message, function (r, erreur, manque) {
        attente.remove();
        occupe = false;
        $('button', liaForm).disabled = false;
        if (!r) {
          ecrire(erreur, 'err');
          if (manque && !sansEnergie) carte({ type: 'onglet', onglet: 'outils', nom: 'Redonner de l’énergie' });
          return;
        }
        if (typeof r.solde === 'number') solde = r.solde;
        if (r.illimite) sansLimite = true;
        majJetons();
        ecrire(r.reponse, 'lia'); garder('lia', r.reponse);
        carte(r.action);
      });
    };

    /* mise en place selon l'endroit */
    $$('[data-lia-accueil]', flot).forEach(function (p) { p.hidden = p.getAttribute('data-lia-accueil') !== mode; });
    $$('[data-lia-liens]', flot).forEach(function (g) { g.hidden = g.getAttribute('data-lia-liens') !== (dial ? 'espace' : 'site') || (mode !== 'site' && !dial); });
    var dialogue = null;
    if (dial) {
      // dans l'espace client, la conversation s'affiche sous la barre « Les Minis Monstres à votre service » (plus de bulle flottante)
      dialogue = mode === 'ok' ? $('[data-dialogue]') : null;
      if (dialogue) { dialogue.appendChild(fil); dialogue.hidden = false; }
      liaForm.hidden = false; liaNote.hidden = false;
      var prixEl = $('[data-lia-prix]', flot);
      if (prixEl) prixEl.textContent = sansEnergie ? '' : jetonsTxt(prix) + tr(' par message.');
      if (reglages.getAttribute('data-max')) champ.maxLength = +reglages.getAttribute('data-max');
      majJetons();
      try {
        // dans l'espace client, la conversation est gardée côté serveur (elle ne disparaît plus quand on recharge la page)
        var histo = reglages && reglages.getAttribute('data-histo');
        var ancien = histo ? JSON.parse(histo) : JSON.parse(sessionStorage.getItem(cleFil) || '[]');
        ancien.forEach(function (m) { ecrire(m[1], m[0] === 'moi' ? 'moi' : 'lia'); });
        if (ancien.length) $$('[data-lia-liens="espace"]', flot).forEach(function (g) { g.hidden = true; });
      } catch (e) {}
      liaForm.addEventListener('submit', function (e) { e.preventDefault(); envoyer(champ.value); });
      // « Écrire à Cerise », sur l'accueil de l'espace client : le message part dans la bulle, qui s'ouvre
      var ceriseDire = function (texte) {
        texte = (texte || '').trim();
        if (dialogue) { if (texte) envoyer(texte); return; }
        flotOuvrir(true);
        if (texte) envoyer(texte); else if (champ) champ.focus();
      };
      $$('[data-cerise-form]').forEach(function (fo) {
        fo.addEventListener('submit', function (e) { e.preventDefault(); var i = $('input', fo); ceriseDire(i.value); i.value = ''; });
      });
      // stopPropagation : sinon le clic remonte au document, qui referme la bulle juste après son ouverture
      $$('[data-cerise-idee]').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); ceriseDire(b.textContent); }); });
      champ.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(champ.value); } });
      $$('[data-lia-ex]', flot).forEach(function (b) { b.addEventListener('click', function () { champ.value = b.textContent.trim(); champ.focus(); }); });
      var nouveau = $('[data-lia-nouveau]', flot);
      if (nouveau) nouveau.addEventListener('click', function () {
        $$('.lia-msg:not([data-lia-accueil]), .lia-carte', fil).forEach(function (x) { x.remove(); });
        try { sessionStorage.removeItem(cleFil); } catch (e) {}
        $$('[data-lia-liens="espace"]', flot).forEach(function (g) { g.hidden = false; });
        if (mode === 'ok') { var fd = new FormData(); fd.append('action', 'aled08e_bulle'); fd.append('_n', reglages.getAttribute('data-nonce')); fd.append('nouveau', '1'); fetch(reglages.getAttribute('data-ajax'), { method: 'POST', body: fd, credentials: 'same-origin' }); }
        champ.focus();
      });
    } else if (mode === 'site') {
      var histoSite = []; // les derniers échanges, renvoyés à chaque question (le serveur n'en garde rien)
      $$('[data-lia-q]', flot).forEach(function (b) {
        b.addEventListener('click', function () {
          var r = $('[data-lia-r="' + b.getAttribute('data-lia-q') + '"]', flot);
          ecrire(b.textContent.trim(), 'moi');
          if (r) ecrire('', 'lia', r.innerHTML);
          histoSite.push(['moi', b.textContent.trim()], ['lia', r ? r.textContent.replace(/\s+/g, ' ').trim() : '']);
        });
      });
      // la barre de discussion : une question libre, Cerise répond avec ce qu'elle sait du site
      var noteSite = $('[data-lia-note-site]', flot), ajaxSite = liaForm && liaForm.getAttribute('data-site-ajax');
      if (liaForm && ajaxSite) {
        liaForm.hidden = false; if (noteSite) noteSite.hidden = false;
        champ.maxLength = 300;
        var occupeSite = false;
        var poserSite = function (q) {
          q = (q || '').trim();
          if (!q || occupeSite) return;
          occupeSite = true;
          var envoi = $('button', liaForm); envoi.disabled = true;
          ecrire(q, 'moi'); champ.value = '';
          $$('[data-lia-liens="site"]', flot).forEach(function (g) { g.hidden = true; }); // les questions toutes faites laissent la place à la conversation
          var attenteSite = ecrire('', 'lia is-attente', '<i></i><i></i><i></i>');
          var finiSite = function (txt, lien) {
            attenteSite.remove(); occupeSite = false; envoi.disabled = false;
            var p = ecrire(txt, lien === false ? 'err' : 'lia');
            if (lien && lien.href) { var a = d.createElement('a'); a.href = lien.href; a.textContent = ' ' + lien.texte; p.appendChild(a); }
            if (lien === false) { var c = d.createElement('a'); c.href = '/contact/'; c.textContent = ' Nous écrire'; p.appendChild(c); }
          };
          var fd = new FormData();
          fd.append('message', q); fd.append('histo', JSON.stringify(histoSite.slice(-6)));
          fetch(ajaxSite, { method: 'POST', body: fd, credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (j && j.success) { histoSite.push(['moi', q], ['lia', j.data.reponse]); finiSite(j.data.reponse, j.data.lien); }
              else finiSite((j && j.data && j.data.message) || tr('Oups, je n’ai pas pu répondre. Réessaie dans un instant.'), false);
            })
            .catch(function () { finiSite(tr('Cerise n’est pas joignable pour le moment.'), false); });
        };
        liaForm.addEventListener('submit', function (e) { e.preventDefault(); poserSite(champ.value); });
        champ.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); poserSite(champ.value); } });
      }
    }
    flot.hidden = !!dialogue; // la bulle flottante reste cachée quand la conversation est dans la page
    flotBtn.addEventListener('click', function () { flotOuvrir(flotPanel.hidden); });
    var flotX = $('.lia-flot-fermer', flot);
    if (flotX) flotX.addEventListener('click', function () { flotOuvrir(false); flotBtn.focus(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !flotPanel.hidden) { flotOuvrir(false); flotBtn.focus(); } });
    d.addEventListener('click', function (e) { if (!flotPanel.hidden && !flot.contains(e.target) && d.body.contains(e.target)) flotOuvrir(false); });
    /* un petit bonjour, une seule fois par visite */
    var dejaVue = false;
    try { dejaVue = sessionStorage.getItem('lia_vue') === '1'; } catch (e) {}
    if (coucou && !dejaVue) {
      // « Je suis là pour vous aider ! » : il apparaît au bout de 2 secondes, puis s'efface tout seul après quelques secondes
      // ou dès qu'on fait défiler la page, pour ne rien cacher. La bulle ronde, elle, reste.
      var coucouFini = false;
      var rangerCoucou = function () {
        if (coucouFini) return;
        coucouFini = true; coucou.hidden = true;
        window.removeEventListener('scroll', rangerCoucou);
        try { sessionStorage.setItem('lia_vue', '1'); } catch (e) {}
      };
      setTimeout(function () {
        if (coucouFini || !flotPanel.hidden || window.pageYOffset > 80) return;
        coucou.hidden = false;
        window.addEventListener('scroll', rangerCoucou, { passive: true });
        setTimeout(rangerCoucou, 6000);
      }, 2000);
      coucou.addEventListener('click', function () { flotOuvrir(true); });
    }
  }
  /* Cerise et Alex suivent le visiteur des yeux : chaque monstre regarde vers le pointeur (ou le doigt) */
  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var regards = $$('.monster .m-look'), regardRaf = 0, regardXY = null;
    var regarder = function () {
      regardRaf = 0;
      if (!regardXY) return;
      regards.forEach(function (g) {
        var svg = g.ownerSVGElement, r = svg ? svg.getBoundingClientRect() : null;
        if (!r || !r.width || r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var dx = regardXY[0] - (r.left + r.width / 2), dy = regardXY[1] - (r.top + r.height * 0.6), n = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = Math.min(1, n / 160) * 2.6;
        g.setAttribute('transform', 'translate(' + (dx / n * f).toFixed(2) + ' ' + (dy / n * f * 0.8).toFixed(2) + ')');
      });
    };
    var regardVers = function (e) {
      var p = e.touches && e.touches[0] ? e.touches[0] : e;
      regardXY = [p.clientX, p.clientY];
      if (!regardRaf) regardRaf = requestAnimationFrame(regarder);
    };
    if (regards.length) {
      window.addEventListener('pointermove', regardVers, { passive: true });
      window.addEventListener('touchstart', regardVers, { passive: true });
    }
  }

  /* ---------- le petit « i » des options et des extras : ce que ça ajoute, avec une capture ----------
     Au survol (souris) ou au clic (téléphone, clavier). Le texte et l'image sont dans les attributs du bouton. */
  (function () {
    var pop = null, cible = null, fige = false, tCache = 0, tMontre = 0;
    var survol = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var creer = function () {
      pop = d.createElement('div');
      pop.className = 'opt-pop'; pop.id = 'opt-pop'; pop.setAttribute('role', 'dialog'); pop.hidden = true;
      pop.innerHTML = '<button type="button" class="opt-pop-x"></button><div class="opt-pop-img"></div><strong></strong><p></p><a class="opt-pop-lien" hidden></a><small></small>';
      var x = $('.opt-pop-x', pop);
      x.setAttribute('aria-label', tr('Fermer'));
      x.textContent = '×';
      $('small', pop).textContent = tr('Exemple d’écran : le vôtre sera à vos couleurs.');
      d.body.appendChild(pop);
      pop.addEventListener('mouseenter', function () { clearTimeout(tCache); });
      pop.addEventListener('mouseleave', function () { if (!fige) cacherBientot(); });
      x.addEventListener('click', function () { cacher(true); });
    };
    var placer = function () {
      if (!cible || !pop || pop.hidden) return;
      if (window.innerWidth <= 560) { pop.style.left = ''; pop.style.top = ''; return; } // en bas de l'écran (CSS)
      var r = cible.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
      var x = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
      var y = r.bottom + 10;
      if (y + h > window.innerHeight - 12 && r.top - h - 10 > 12) y = r.top - h - 10;
      pop.style.left = x + 'px';
      pop.style.top = Math.max(12, y) + 'px';
    };
    var montrer = function (b, figer) {
      if (!pop) creer();
      clearTimeout(tCache);
      if (cible && cible !== b) cible.setAttribute('aria-expanded', 'false');
      cible = b; fige = !!figer;
      var src = b.getAttribute('data-img'), box = $('.opt-pop-img', pop);
      box.innerHTML = '';
      box.hidden = !src;
      if (src) {
        var im = new Image();
        im.width = 640; im.height = 400; im.decoding = 'async';
        im.alt = tr('Exemple : ') + b.getAttribute('data-titre');
        im.onload = placer;
        im.src = src;
        box.appendChild(im);
      }
      $('strong', pop).textContent = b.getAttribute('data-titre');
      $('p', pop).textContent = b.getAttribute('data-info');
      // un mot technique : un lien « En savoir plus » vers le lexique, et pas de légende d'écran
      var lien = b.getAttribute('data-lien'), a = $('.opt-pop-lien', pop);
      a.hidden = !lien;
      if (lien) { a.href = lien; a.textContent = tr('En savoir plus'); }
      $('small', pop).hidden = !src;
      pop.hidden = false;
      b.setAttribute('aria-expanded', 'true');
      b.setAttribute('aria-controls', 'opt-pop');
      placer();
    };
    var cacher = function (rendreFocus) {
      if (!pop || pop.hidden) return;
      pop.hidden = true;
      if (cible) { cible.setAttribute('aria-expanded', 'false'); if (rendreFocus) cible.focus(); }
      cible = null; fige = false;
    };
    var cacherBientot = function () { clearTimeout(tCache); tCache = setTimeout(function () { if (!fige) cacher(); }, 200); };
    // phase de capture : le clic sur le « i » ne coche pas la case de l'option qui l'entoure
    d.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.opt-i');
      if (b) {
        e.preventDefault(); e.stopPropagation();
        if (cible === b && fige) cacher(); else montrer(b, true);
        return;
      }
      if (pop && !pop.hidden && !pop.contains(e.target)) cacher();
    }, true);
    if (survol) {
      d.addEventListener('mouseover', function (e) {
        var b = e.target.closest && e.target.closest('.opt-i');
        if (b && !fige) { clearTimeout(tMontre); clearTimeout(tCache); tMontre = setTimeout(function () { montrer(b, false); }, 120); }
      });
      d.addEventListener('mouseout', function (e) {
        var b = e.target.closest && e.target.closest('.opt-i');
        if (b) { clearTimeout(tMontre); if (!fige) cacherBientot(); }
      });
    }
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop && !pop.hidden) cacher(true); });
    window.addEventListener('scroll', function () { if (pop && !pop.hidden) { if (fige) placer(); else cacher(); } }, { passive: true });
    window.addEventListener('resize', placer);
  })();

  /* ---------- menus déroulants : un lien vers une ancre ouvre le déroulant qui la contient ---------- */
  (function () {
    var ouvrir = function () {
      var id = decodeURIComponent((location.hash || '').slice(1));
      if (!id) return;
      var el = d.getElementById(id);
      if (!el) return;
      var det = el.closest ? el.closest('details') : null, fait = false;
      while (det) { if (!det.open) { det.open = true; fait = true; } det = det.parentElement && det.parentElement.closest ? det.parentElement.closest('details') : null; }
      if (fait && el.scrollIntoView) el.scrollIntoView();
    };
    ouvrir();
    window.addEventListener('hashchange', ouvrir);
  })();

  /* ---------- barre du bas (téléphone) : cachée tant que les boutons du haut de page sont à l'écran ---------- */
  (function () {
    var bar = $('.mobile-bar'), ctas = $('.hero-ctas');
    if (!bar || !ctas || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { bar.classList.toggle('is-hidden', en.isIntersecting); });
    }).observe(ctas);
  })();

  /* ---------- formulaire de contact ---------- */
  $$('form[data-form]').forEach(function (f) {
    var t = f.querySelector('input[name="_t"]'); if (t) t.value = Date.now();
    var p = new URLSearchParams(location.search);
    var pick = function (sel, v) { if (!sel || !v) return; $$('option', sel).forEach(function (o) { if (o.value === v) sel.value = v; }); };
    /* « Votre demande » : un site (devis, information) ou juste me contacter. Pour « juste contacter », on cache ce qui parle du site. */
    /* Ce sont de grosses cases à choisir (boutons radio) ; un ancien <select> marche encore. */
    var motifSel = f.querySelector('select[name="motif"]'), motifRadios = $$('input[type="radio"][name="motif"]', f);
    var motif = motifSel || (motifRadios.length ? {
      get value() { var c = motifRadios.filter(function (r) { return r.checked; })[0]; return c ? c.value : ''; },
      addEventListener: function (ev, fn) { motifRadios.forEach(function (r) { r.addEventListener(ev, fn); }); }
    } : null);
    if (motif) {
      var pickMotif = function (v) { if (!v) return; if (motifSel) pick(motifSel, v); else motifRadios.forEach(function (r) { if (r.value === v) r.checked = true; }); };
      var siteOnly = $$('[data-site-only]', f), typeSel = f.querySelector('select[name="type"]'), msgBox = f.querySelector('textarea[name="message"]');
      var venuDuSite = p.get('type') || p.get('forfait') || p.get('options') || p.get('domaine') || p.get('paiement') || p.get('lissage');
      pickMotif(p.get('motif') || (venuDuSite ? 'Site : un devis précis' : ''));
      var majMotif = function () {
        var simple = motif.value === 'Contact simple';
        siteOnly.forEach(function (z) { z.hidden = simple; $$('input,select', z).forEach(function (i) { i.disabled = simple; }); });
        if (typeSel) typeSel.required = !simple;
        if (msgBox) msgBox.placeholder = msgBox.getAttribute(simple ? 'data-ph-contact' : 'data-ph-site') || msgBox.placeholder;
      };
      motif.addEventListener('change', majMotif); majMotif();
    }
    pick(f.querySelector('select[name="type"]'), p.get('type'));
    pick(f.querySelector('select[name="forfait"]'), p.get('forfait'));
    var pay = p.get('paiement');
    if (pay) $$('input[name="paiement"]', f).forEach(function (r) { if (r.value === pay) r.checked = true; });
    var dom = p.get('domaine'), domInput = f.querySelector('input[name="domaine"]');
    if (dom && domInput) domInput.value = dom;
    var opts = p.get('options'), msg = f.querySelector('textarea[name="message"]');
    var intro = [];
    var pl = p.get('lissage') === 'oui' ? '12' : p.get('lissage');
    if (pl && /^\d+$/.test(pl)) intro.push(tr('Je souhaite payer le site en ') + pl + tr(' fois.'));
    if (opts) intro.push(tr('Options choisies : ') + opts + '.');
    if (intro.length && msg && !msg.value) msg.value = intro.join('\n') + '\n\n';
    f.addEventListener('submit', function (e) {
      if (!f.checkValidity()) { e.preventDefault(); f.reportValidity(); return; }
      var btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.querySelector('span').textContent = tr('Envoi en cours…'); }
    });
  });
  if (/[?&]connexion=erreur/.test(location.search)) {
    $$('[data-login-error]').forEach(function (el) { el.hidden = false; });
  }
  if (/[?&]erreur=1(&|$)/.test(location.search)) {
    $$('[data-form-error]').forEach(function (el) { el.hidden = false; });
  }
})();

/* Le bouton soleil / lune : le site s'ouvre en clair ; le dernier choix du visiteur est gardé sur son appareil */
(function () {
  var h = document.documentElement, b = document.querySelector('.theme-btn');
  var appliquer = function (t) {
    h.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#16142A' : '#FFF8F2');
    var c = document.querySelector('meta[name="color-scheme"]'); if (c) c.setAttribute('content', t === 'dark' ? 'dark' : 'light');
    if (b) { b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false'); b.setAttribute('aria-label', t === 'dark' ? 'Passer en apparence claire' : 'Passer en apparence sombre'); }
  };
  appliquer(h.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  if (!b) return;
  b.addEventListener('click', function () {
    var t = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    appliquer(t);
    try { localStorage.setItem('mm-theme', t); } catch (e) {}
  });
})();

/* ---------- Statistiques (onglet de « Mon site », espace client et démo, 25 novembre 2026) ----------
   Le squelette vient de includes/statistiques.php (ou de la démo). Les chiffres : le connecteur du site du client
   (visiteurs et pages vues jour par jour, pages les plus vues, provenance, appareils, Google). Tout est calculé ici,
   clairement : totaux, évolution sur 7 jours, meilleures pages avec leur part, record, vitesse. Rien d'inventé. */
(function () {
  var box = document.querySelector('[data-stats2]');
  if (!box) return;
  var $ = function (s) { return box.querySelector(s); };
  var nf = function (n) { return Math.round(n).toLocaleString('fr-FR'); };
  var pc = function (n) { return (Math.round(n * 10) / 10).toLocaleString('fr-FR') + ' %'; };
  var mk = function (t, cls, txt) { var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var vider = function (n) { while (n && n.firstChild) n.removeChild(n.firstChild); };
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var date = function (s) { var d = new Date(s + 'T12:00:00'); return isNaN(d) ? s : JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; };
  var court = function (s) { var d = new Date(s + 'T12:00:00'); return isNaN(d) ? '' : d.getDate() + ' ' + MOIS[d.getMonth()]; };
  // le nom d'une page : son vrai titre si on le connaît, sinon tiré de son adresse
  var nomPage = function (chemin, info) {
    if (info && info.titre) return info.titre;
    if (!chemin || chemin === '/') return 'Accueil';
    var s = chemin.replace(/\/+$/, '').split('/').pop().replace(/[-_]+/g, ' ');
    try { s = decodeURIComponent(s); } catch (e) {}
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  var set = function (k, v, plus, ton) {
    var e = $('[data-st2-v="' + k + '"]'); if (e) e.textContent = v;
    var p = $('[data-st2-p="' + k + '"]'); if (p) { p.textContent = plus || ''; p.className = 'st2-kpi-plus' + (ton ? ' is-' + ton : ''); }
  };
  function barres(n, obj, total, ordre) {
    vider(n); if (!n) return;
    var cles = (ordre || Object.keys(obj || {})).filter(function (k) { return (obj || {})[k] > 0; });
    if (!cles.length || !total) { n.appendChild(mk('li', 'st2-vide', 'Pas encore de visite mesurée.')); return; }
    cles.sort(function (a, b) { return obj[b] - obj[a]; }).forEach(function (k) {
      var part = obj[k] / total * 100, li = mk('li');
      var l = mk('span', 'st2-b-l', k.charAt(0).toUpperCase() + k.slice(1)), v = mk('span', 'st2-b-v', pc(part)), b = mk('span', 'st2-b-b'), i = mk('i');
      i.style.width = Math.max(2, part) + '%'; b.appendChild(i); li.appendChild(l); li.appendChild(v); li.appendChild(b);
      li.title = nf(obj[k]) + ' visiteurs'; n.appendChild(li);
    });
  }
  function afficher(d) {
    var jours = d.jours || [], vis = 0, vues = 0;
    jours.forEach(function (j) { vis += +j.visiteurs || 0; vues += +j.vues || 0; });
    var sem = 0, avant = 0;
    jours.slice(-7).forEach(function (j) { sem += +j.visiteurs || 0; });
    jours.slice(-14, -7).forEach(function (j) { avant += +j.visiteurs || 0; });
    set('visiteurs', nf(vis), vis ? (Math.round(vues / vis * 10) / 10).toLocaleString('fr-FR') + ' pages vues par visiteur' : 'Pas encore de visite');
    set('vues', nf(vues), d.aujourdhui ? 'Aujourd’hui : ' + nf(d.aujourdhui.vues || 0) + ' pages vues' : '');
    var evol = avant ? Math.round((sem - avant) / avant * 100) : null;
    set('semaine', nf(sem), evol === null ? (sem ? 'Première semaine mesurée' : '7 derniers jours') : (evol > 0 ? '+' : '') + evol + ' % par rapport à la semaine d’avant', evol === null ? '' : (evol > 0 ? 'haut' : (evol < 0 ? 'bas' : '')));
    var g = d.google || {};
    set('google', g.etat === 'ok' ? nf(g.clics || 0) : '–', g.etat === 'ok' ? nf(g.apparitions || 0) + ' apparitions sur ' + (g.jours || 28) + ' jours' : 'Google n’est pas encore relié');

    // les meilleures pages
    var ol = $('[data-st2="pages"]'); vider(ol);
    var pages = d.pages || {}, infos = d.pages_infos || {}, cles = Object.keys(pages).sort(function (a, b) { return pages[b] - pages[a]; });
    var totPages = vues || cles.reduce(function (s, k) { return s + pages[k]; }, 0), max = cles.length ? pages[cles[0]] : 1;
    if (!cles.length) ol.appendChild(mk('li', 'st2-vide', 'Vos pages les plus vues s’afficheront ici dès les premières visites.'));
    cles.forEach(function (k, i) {
      var info = infos[k] || null, li = mk('li', i < 3 ? 'is-top' : '');
      li.appendChild(mk('span', 'st2-rang', String(i + 1)));
      var corps = mk('span', 'st2-p-corps'), titre = info && info.adresse ? mk('a', 'st2-p-titre', nomPage(k, info)) : mk('span', 'st2-p-titre', nomPage(k, info));
      if (info && info.adresse) { titre.href = info.adresse; titre.target = '_blank'; titre.rel = 'noopener'; }
      corps.appendChild(titre);
      var sous = mk('small', 'st2-p-sous', k); if (info && info.google) { var bg = mk('em', 'st2-badge', 'Page Google'); sous.appendChild(bg); }
      corps.appendChild(sous);
      var b = mk('span', 'st2-p-b'), bi = mk('i'); bi.style.width = Math.max(3, pages[k] / max * 100) + '%'; b.appendChild(bi); corps.appendChild(b);
      li.appendChild(corps);
      var chiffres = mk('span', 'st2-p-chiffres'); chiffres.appendChild(mk('strong', '', nf(pages[k]))); chiffres.appendChild(mk('small', '', 'vues · ' + pc(totPages ? pages[k] / totPages * 100 : 0)));
      li.appendChild(chiffres); ol.appendChild(li);
    });

    // jour par jour
    var zone = $('[data-st2="jours"]'); vider(zone);
    var maxJ = Math.max.apply(null, jours.map(function (j) { return +j.visiteurs || 0; }).concat([1]));
    var grille = mk('div', 'st2-j-grille'); grille.setAttribute('role', 'img');
    grille.setAttribute('aria-label', 'Visiteurs par jour sur 30 jours, ' + nf(vis) + ' au total');
    jours.forEach(function (j, i) {
      var c = mk('span', 'st2-j' + (i === jours.length - 1 ? ' is-auj' : '')), barre = mk('i');
      barre.style.height = Math.max(2, (+j.visiteurs || 0) / maxJ * 100) + '%';
      c.title = date(j.jour) + ' : ' + nf(j.visiteurs || 0) + ' visiteurs, ' + nf(j.vues || 0) + ' pages vues';
      c.appendChild(barre); grille.appendChild(c);
    });
    zone.appendChild(grille);
    if (jours.length) { var ax = mk('div', 'st2-j-axe'); ax.appendChild(mk('span', '', court(jours[0].jour))); ax.appendChild(mk('span', '', court(jours[Math.floor(jours.length / 2)].jour))); ax.appendChild(mk('span', '', 'Aujourd’hui')); zone.appendChild(ax); }
    var rec = $('[data-st2="record"]'), best = null;
    jours.forEach(function (j) { if (!best || (+j.visiteurs || 0) > (+best.visiteurs || 0)) best = j; });
    rec.textContent = best && +best.visiteurs ? 'Meilleure journée : ' + date(best.jour) + ', avec ' + nf(best.visiteurs) + ' visiteur' + (+best.visiteurs > 1 ? 's' : '') + '. Moyenne : ' + (Math.round(vis / Math.max(1, jours.length) * 10) / 10).toLocaleString('fr-FR') + ' visiteurs par jour.' : 'Pas encore de visite sur les 30 derniers jours.';

    // provenance et appareils
    var src = d.sources || {}, totS = Object.keys(src).reduce(function (s, k) { return s + (+src[k] || 0); }, 0);
    barres($('[data-st2="sources"]'), src, totS);
    var ap = d.appareils || {}, ap2 = { 'téléphone': +ap.mobile || 0, 'ordinateur': +ap.ordinateur || 0, 'tablette': +ap.tablette || 0 };
    barres($('[data-st2="appareils"]'), ap2, ap2['téléphone'] + ap2.ordinateur + ap2.tablette);

    // Google
    var gz = $('[data-st2="google"]'); vider(gz);
    if (g.etat !== 'ok') {
      gz.appendChild(mk('p', 'st2-vide', g.etat === 'vide' ? 'Google n’a pas encore montré votre site : ça vient dans les semaines qui suivent la mise en ligne.' : 'Vos chiffres Google s’afficheront ici dès que Google Search Console sera relié à votre site. On s’en occupe.'));
    } else {
      var gk = mk('div', 'st2-g-kpis');
      [[nf(g.apparitions || 0), 'apparitions'], [nf(g.clics || 0), 'clics'], [g.apparitions ? pc((g.clics || 0) / g.apparitions * 100) : '–', 'des apparitions donnent un clic']].forEach(function (x) { var s = mk('span'); s.appendChild(mk('strong', '', x[0])); s.appendChild(mk('small', '', x[1])); gk.appendChild(s); });
      gz.appendChild(gk);
      var rl = mk('ol', 'st2-recherches');
      (g.recherches || []).slice(0, 8).forEach(function (r) {
        var li = mk('li'), t = mk('span', 'st2-r-t', r.recherche), pos = Math.max(1, Math.round(r.position || 0));
        t.appendChild(mk('small', '', nf(r.apparitions || 0) + ' apparitions · ' + nf(r.clics || 0) + ' clic' + ((r.clics || 0) > 1 ? 's' : '')));
        var p = mk('span', 'st2-r-pos' + (pos <= 3 ? ' is-haut' : (pos <= 10 ? ' is-page1' : '')));
        p.appendChild(mk('strong', '', pos + (pos === 1 ? 're' : 'e'))); p.appendChild(mk('small', '', pos <= 10 ? 'page 1' : 'page ' + Math.ceil(pos / 10)));
        li.appendChild(t); li.appendChild(p); rl.appendChild(li);
      });
      if (rl.children.length) { gz.appendChild(mk('p', 'st2-sous-titre', 'Les recherches qui vous amènent')); gz.appendChild(rl); }
    }

    // le site en bref
    var dl = $('[data-st2="infos"]'); vider(dl);
    var s = d.serveur || {}, c = d.contenu || {}, b = d.boutique, t = s.temps_reponse;
    var lignes = [
      ['Votre site', d.etat === 'ok' ? 'En ligne' : '–', d.etat === 'ok' ? 'ok' : ''],
      ['Cadenas (HTTPS)', s.https ? 'Actif' : (s.https === false ? 'À vérifier' : '–'), s.https ? 'ok' : ''],
      ['Vitesse', t == null ? 'Pas encore mesurée' : (t < 0.6 ? 'Très rapide' : (t < 1.2 ? 'Correcte' : 'À améliorer')) + (t == null ? '' : ' (' + (Math.round(t * 100) / 100).toLocaleString('fr-FR') + ' s)'), t != null && t < 0.6 ? 'ok' : ''],
      ['Pages en ligne', c.pages != null ? nf(c.pages) : '–', ''],
      ['Visiteurs en ce moment', d.aujourdhui ? nf(d.aujourdhui.actifs || 0) + ' dans la dernière heure' : '–', '']
    ];
    if (c.articles) lignes.push(['Articles', nf(c.articles), '']);
    if (b) { lignes.push(['Produits en vente', nf(b.produits || 0), '']); lignes.push(['Commandes sur 30 jours', nf(b.commandes_30j || 0) + (b.ventes_30j ? ' · ' + (Math.round(b.ventes_30j * 100) / 100).toLocaleString('fr-FR') + ' €' : ''), '']); }
    lignes.forEach(function (l) { var dv = mk('div', l[2] ? 'is-' + l[2] : ''); dv.appendChild(mk('dt', '', l[0])); dv.appendChild(mk('dd', '', l[1])); dl.appendChild(dv); });
  }

  var msg = $('[data-st2-msg]'), maj = $('[data-st2-maj]');
  if (box.getAttribute('data-demo') === '1') {
    try { afficher(JSON.parse(box.getAttribute('data-exemple') || '{}')); } catch (e) {}
    maj.textContent = 'Exemple : les chiffres de votre site s’affichent ici, mis à jour toutes les heures.';
    return;
  }
  box.classList.add('is-attente'); // pas de faux « 0 visiteur » : les chiffres n'apparaissent qu'une fois vraiment reçus
  var MSG = { non_relie: 'Votre site n’est pas encore relié à votre espace : vos chiffres apparaîtront ici dès que c’est fait. On s’en occupe.', connecteur_ancien: 'L’extension de votre site doit être mise à jour pour afficher vos chiffres. On s’en occupe.', injoignable: 'Votre site ne répond pas pour le moment : nouvel essai dans quelques minutes.' };
  var le = 0;
  var quand = function () { var m = Math.round((Date.now() / 1000 - le) / 60); return m < 1 ? 'à l’instant' : (m < 60 ? 'il y a ' + m + ' min' : 'il y a ' + Math.floor(m / 60) + ' h'); };
  function charger() {
    if (document.hidden) return;
    var f = new FormData(); f.append('action', 'aled08e_stats2'); f.append('_n', box.getAttribute('data-nonce') || '');
    fetch(box.getAttribute('data-ajax'), { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (r) {
      var d = r && r.data ? r.data : {};
      if (!r.success || d.etat !== 'ok') { msg.textContent = MSG[d.etat] || 'Vos chiffres ne sont pas disponibles pour le moment.'; msg.hidden = false; maj.textContent = ''; return; }
      msg.hidden = true; le = d.le || Date.now() / 1000; afficher(d); box.classList.remove('is-attente'); maj.textContent = 'Chiffres mis à jour ' + quand() + ', puis toutes les heures.';
    }).catch(function () { msg.textContent = MSG.injoignable; msg.hidden = false; });
  }
  // on ne charge les chiffres que quand l'onglet est ouvert (ou s'il l'est déjà)
  var panneau = box.closest('[role="tabpanel"]'), charge = false;
  var essayer = function () { if (!charge && (!panneau || !panneau.hidden)) { charge = true; charger(); setInterval(charger, 3600000); } };
  if (panneau && window.MutationObserver) new MutationObserver(essayer).observe(panneau, { attributes: true, attributeFilter: ['hidden'] });
  essayer();
})();

/* ---------- Les sous-menus des onglets (Mon site, Statistiques, Modifications, Mon compte), comme Ma boutique ----------
   Une grille de rubriques en haut de l'onglet ([data-sm-nav]) ; on touche une rubrique, seule elle s'affiche ([data-sm-part]).
   La dernière rubrique ouverte de chaque onglet est gardée pour la visite (sessionStorage). */
(function () {
  var navs = document.querySelectorAll('[data-sm-nav]');
  if (!navs.length) return;
  var ouvrir = function (nav, id, garder) {
    var zone = nav.parentNode;
    var parts = Array.prototype.filter.call(zone.querySelectorAll('[data-sm-part]'), function (p) { return p.parentNode === zone; });
    if (!parts.some(function (p) { return p.getAttribute('data-sm-part') === id; })) return;
    parts.forEach(function (p) { p.hidden = p.getAttribute('data-sm-part') !== id; });
    nav.querySelectorAll('[data-sm-go]').forEach(function (b) { var on = b.getAttribute('data-sm-go') === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var panneau = nav.closest('[role="tabpanel"]');
    if (garder && panneau) { try { sessionStorage.setItem('lmm-sm-' + panneau.id, id); } catch (e) {} }
  };
  window.lmmSmOuvrir = function (part) {
    var zone = part.parentNode, nav = zone && Array.prototype.filter.call(zone.children, function (c) { return c.hasAttribute('data-sm-nav'); })[0];
    if (nav) ouvrir(nav, part.getAttribute('data-sm-part'), false);
  };
  navs.forEach(function (nav) {
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sm-go]'); if (!b) return;
      ouvrir(nav, b.getAttribute('data-sm-go'), true);
      // sur téléphone, le haut de la rubrique reste en vue juste sous la grille
      var r = nav.getBoundingClientRect(), h = document.querySelector('.site-header');
      if (r.top < (h ? h.offsetHeight : 70)) window.scrollBy({ top: r.top - (h ? h.offsetHeight : 70) - 10, behavior: 'smooth' });
    });
    var panneau = nav.closest('[role="tabpanel"]'), memo = null;
    try { memo = panneau && sessionStorage.getItem('lmm-sm-' + panneau.id); } catch (e) {}
    if (memo) ouvrir(nav, memo, false);
  });
})();
