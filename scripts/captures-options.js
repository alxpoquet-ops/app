// Captures d'exemple des options et des extras : ce que chacun ajoute, sur le site d'une cliente imaginaire
// (Pâtisserie Lila, la même que dans la démo de l'espace client). Une image par option, montrée par le petit « i ».
// Usage : node scripts/captures-options.js   (Playwright + Chromium ; écrit src/assets/img/options/<id>.webp)
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src/assets/img/options');
const font = 'data:font/woff2;base64,' + fs.readFileSync(path.join(ROOT, 'src/assets/fonts/jakarta-var.woff2')).toString('base64');
const { icon } = require('../src/lib/icons');
const { monster } = require('../src/lib/monsters');

const W = 640;
const H = 400;

// ---------------------------------------------------------------- petits dessins de pâtisseries
const gateau = {
  tarte: `<svg viewBox="0 0 100 70"><ellipse cx="50" cy="48" rx="42" ry="16" fill="#E9B872"/><ellipse cx="50" cy="42" rx="38" ry="13" fill="#FFE7B8"/>${[[30, 40], [44, 36], [58, 38], [70, 43], [38, 47], [53, 46], [64, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#F0485E"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".6"/>`).join('')}</svg>`,
  eclair: `<svg viewBox="0 0 100 70"><rect x="10" y="30" width="80" height="26" rx="13" fill="#E9B872"/><rect x="12" y="26" width="76" height="14" rx="7" fill="#6B3B2A"/><path d="M22 30h56" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/></svg>`,
  macarons: `<svg viewBox="0 0 100 70">${[['#FFB3CD', 22], ['#C9B8FF', 50], ['#A6EBCF', 78]].map(([c, x]) => `<ellipse cx="${x}" cy="46" rx="15" ry="7" fill="${c}"/><rect x="${x - 14}" y="38" width="28" height="5" rx="2.5" fill="#FFF4E2"/><ellipse cx="${x}" cy="36" rx="15" ry="7" fill="${c}"/>`).join('')}</svg>`,
  parisbrest: `<svg viewBox="0 0 100 70"><ellipse cx="50" cy="44" rx="38" ry="18" fill="#E2A65E"/><ellipse cx="50" cy="40" rx="24" ry="9" fill="#F7E3C4"/><ellipse cx="50" cy="40" rx="13" ry="4.5" fill="#E2A65E"/>${[[22, 34], [38, 28], [62, 28], [78, 34], [30, 46], [70, 46]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="3" rx="1" fill="#FFF" opacity=".75"/>`).join('')}</svg>`,
  layer: `<svg viewBox="0 0 100 70"><rect x="22" y="22" width="56" height="36" rx="6" fill="#FFD9E7"/><rect x="22" y="34" width="56" height="5" fill="#F27BA8"/><rect x="22" y="46" width="56" height="5" fill="#F27BA8"/><circle cx="50" cy="18" r="6" fill="#F0485E"/></svg>`,
};

// ---------------------------------------------------------------- cadres
const navigateur = (url, contenu, { menu = true } = {}) => `<div class="nav">
  <div class="nav-barre"><i></i><i></i><i></i><span>${url}</span></div>
  <div class="site">${menu ? `<header class="site-tete"><b>Pâtisserie Lila</b><nav><span>Accueil</span><span>Nos gâteaux</span><span>Contact</span></nav></header>` : ''}${contenu}</div>
</div>`;
const espace = (contenu) => `<div class="esp"><aside class="esp-cote"><div class="esp-moi">${monster('coucou', { size: 34 })}<span><b>Pâtisserie Lila</b><small>patisserie-lila.fr</small></span></div>${['Accueil', 'Mes demandes', 'Tableau de bord', 'Outils', 'Mon compte'].map((t, i) => `<p class="${i === 2 ? 'on' : ''}">${t}</p>`).join('')}</aside><main class="esp-main">${contenu}</main></div>`;
const exemple = '<p class="ex">Exemple</p>';

const produit = (img, nom, prix, extra = '') => `<article class="prod"><div class="prod-img">${gateau[img]}</div><b>${nom}</b><span class="prix">${prix}</span>${extra}</article>`;

// ---------------------------------------------------------------- les scènes
const SCENES = {
  boutique: navigateur('patisserie-lila.fr/boutique', `<div class="bq">
    <div class="bq-liste"><h2>La boutique</h2><div class="grille">
      ${produit('tarte', 'Tarte aux fraises', '4,50 €', '<button>Ajouter au panier</button>')}
      ${produit('eclair', 'Éclair au chocolat', '3,20 €', '<button class="ok">Ajouté</button>')}
      ${produit('macarons', 'Macarons, boîte de 6', '9,00 €', '<button>Ajouter au panier</button>')}
      ${produit('parisbrest', 'Paris-Brest', '4,80 €', '<button>Ajouter au panier</button>')}
    </div></div>
    <aside class="panier"><p class="panier-t">${icon('shopping-bag')}Votre panier</p><p class="ligne"><span>Tarte aux fraises</span><b>4,50 €</b></p><p class="ligne"><span>Éclair au chocolat</span><b>3,20 €</b></p><p class="ligne tot"><span>Total</span><b>7,70 €</b></p><button class="payer">${icon('credit-card')}Payer par carte</button><p class="sur">${icon('lock')}Paiement sécurisé</p></aside>
  </div>`),

  en: navigateur('patisserie-lila.fr/en/', `<header class="site-tete"><b>Pâtisserie Lila</b><nav><span>Home</span><span>Our cakes</span><span>Contact</span><span class="langue"><span>FR</span><b>EN</b></span></nav></header><div class="hero-en">
    <div><p class="pastille">Homemade, every morning</p><h2>Cakes and pastries made with love</h2><p>Fresh fruit tarts, éclairs and macarons. Order online and pick up at the shop.</p><button>Order a cake</button></div>
    <div class="hero-img">${gateau.tarte}</div>
  </div>`, { menu: false }),

  rdv: navigateur('patisserie-lila.fr/rendez-vous', `<div class="rdv"><h2>Réserver un atelier pâtisserie</h2>
    <div class="cal">${['Lun. 8', 'Mar. 9', 'Mer. 10', 'Jeu. 11', 'Ven. 12'].map((j, i) => `<div class="jour"><b>${j}</b>${['9 h 00', '10 h 30', '14 h 00', '16 h 00'].map((h, k) => `<span class="${(i + k) % 3 === 0 ? 'pris' : ''}${i === 3 && k === 1 ? ' choisi' : ''}">${h}</span>`).join('')}</div>`).join('')}</div>
    <div class="rdv-bas"><p>${icon('calendar-check')}<b>Jeudi 11 à 10 h 30</b></p><button>Confirmer la réservation</button></div>
    <p class="rdv-mail">${icon('mail')}Vous recevez un e-mail à chaque réservation.</p>
  </div>`),

  reprise: `<div class="rep">
    <div class="rep-col"><p class="rep-t">Avant</p><div class="vieux"><div class="vieux-tete">PATISSERIE LILA</div><table><tr><td>Accueil</td><td>Produits</td><td>Contact</td></tr></table><p>Bienvenue sur notre site internet. Nous vous proposons des gateaux faits maison.</p><div class="vieux-img"></div><p class="petit">Copyright 2014. Site optimise pour Internet Explorer.</p></div></div>
    <div class="fleche">${icon('arrow-right')}</div>
    <div class="rep-col"><p class="rep-t neuf">Après</p>${navigateur('patisserie-lila.fr', `<div class="mini-hero"><h3>Des gâteaux faits maison, chaque matin</h3><p>Vos textes et vos photos, repris et remis au propre.</p><div class="mini-img">${gateau.tarte}</div></div>`)}</div>
    <p class="rep-garde">${icon('circle-check')}Textes, photos et adresses des pages gardés : votre place sur Google aussi.</p>
  </div>`,

  pages: navigateur('patisserie-lila.fr', `<div class="pg">
    <div class="pg-menu">${[['Accueil', 0], ['Nos gâteaux', 0], ['Pièces montées', 1], ['Ateliers', 1], ['Mariages', 1], ['Anniversaires', 1], ['Notre histoire', 0], ['Avis', 1], ['Questions', 0], ['Contact', 0]].map(([t, n]) => `<p class="${n ? 'neuf' : ''}">${t}${n ? '<em>nouvelle</em>' : ''}</p>`).join('')}</div>
    <div class="pg-txt"><h2>Pièces montées</h2><p>Une page par sujet : Google peut montrer chacune dans ses résultats.</p><div class="pg-img">${gateau.layer}</div></div>
  </div>`, { menu: false }),

  seo: `<div class="seo">
    <div class="g"><p class="g-barre">${icon('search')}pâtisserie rethel</p>
      <div class="g-res moi"><small>patisserie-lila.fr</small><b>Pâtisserie Lila : gâteaux faits maison à Rethel</b><span>Tartes, éclairs, macarons et pièces montées. Commande en ligne, retrait en boutique.</span></div>
      <div class="g-res"><small>annuaire-exemple.fr</small><b>Les pâtisseries près de chez vous</b><span>Adresses, horaires et avis.</span></div>
      <div class="g-res"><small>autre-exemple.fr</small><b>Boulangerie du centre</b><span>Pain, viennoiseries et gâteaux.</span></div>
    </div>
    <div class="seo-rap"><p class="seo-t">${icon('search-check')}Votre rapport du mois</p>
      ${[['pâtisserie rethel', '2e', 'up'], ['gâteau anniversaire rethel', '4e', 'up'], ['macarons ardennes', '7e', '']].map(([m, p, s]) => `<p class="seo-l"><span>${m}</span><b class="${s}">${p}</b></p>`).join('')}
      <div class="seo-graph"><svg viewBox="0 0 200 60"><polyline points="0,52 30,48 60,44 90,36 120,30 150,22 180,16 200,12" fill="none" stroke="#34B27F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><small>Visites venues de Google</small></div>
      <p class="seo-note">Et chaque mois, je retouche vos pages.</p>
    </div>
  </div>`,

  stats: espace(`<h2>Votre site, heure par heure</h2>
    <div class="kpis">${[['Visiteurs', '1 240'], ['Sur Google', '3 420'], ['Ventes', '86']].map(([a, b]) => `<p><small>${a}</small><b>${b}</b></p>`).join('')}</div>
    <div class="charts"><div class="ch"><small>Visiteurs sur 30 jours</small><svg viewBox="0 0 220 70"><path d="M0 60 L0 50 L20 46 L40 52 L60 40 L80 44 L100 34 L120 38 L140 26 L160 30 L180 20 L200 24 L220 14 L220 60Z" fill="#D5F5E8"/><polyline points="0,50 20,46 40,52 60,40 80,44 100,34 120,38 140,26 160,30 180,20 200,24 220,14" fill="none" stroke="#34B27F" stroke-width="3" stroke-linejoin="round"/></svg></div>
    <div class="ch"><small>Appareils</small><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="24" fill="none" stroke="#E8E0FF" stroke-width="12"/><circle cx="35" cy="35" r="24" fill="none" stroke="#8C6CF2" stroke-width="12" stroke-dasharray="100 151" transform="rotate(-90 35 35)"/></svg><p class="leg"><span class="a"></span>Téléphone 66 %<br><span class="b"></span>Ordinateur 34 %</p></div>
    <div class="ch"><small>D’où viennent vos visiteurs</small>${[['Google', 62], ['Facebook', 21], ['Direct', 17]].map(([a, b]) => `<p class="barre"><span>${a}</span><i><u style="width:${b}%"></u></i></p>`).join('')}</div></div>`),

  mail: `<div class="tel-scene"><div class="tel"><div class="tel-in">
    <p class="tel-h">${icon('mail')}<b>contact@patisserie-lila.fr</b></p>
    ${[['Marie D.', 'Commande pour samedi', 'Bonjour, je voudrais un fraisier pour 8…'], ['Mairie', 'Marché de Noël', 'Votre stand est confirmé pour le…'], ['Julien P.', 'Merci !', 'Le gâteau était parfait, toute la famille…'], ['Fournisseur', 'Votre facture', 'Veuillez trouver ci-joint…']].map(([a, b, c], i) => `<div class="m${i === 0 ? ' neuf' : ''}"><b>${a}</b><span>${b}</span><small>${c}</small></div>`).join('')}
  </div></div>
  <div class="tel-txt"><h2>Une adresse à votre nom</h2><p>Sur votre téléphone et votre ordinateur. Plus sérieux qu’une adresse en gmail ou hotmail.</p></div></div>`,

  stock: navigateur('patisserie-lila.fr/gestion', `<div class="stk"><h2>Mon stock</h2>
    ${[['macarons', 'Macarons, boîte de 6', 18, ''], ['tarte', 'Tarte aux fraises', 2, 'bas'], ['eclair', 'Éclair au chocolat', 0, 'vide'], ['parisbrest', 'Paris-Brest', 9, '']].map(([img, n, q, e]) => `<div class="stk-l"><div class="stk-img">${gateau[img]}</div><b>${n}</b><span class="q ${e}">${e === 'vide' ? 'Épuisé' : e === 'bas' ? `Plus que ${q}` : `${q} en stock`}</span></div>`).join('')}
    <p class="stk-note">${icon('refresh-cw')}Le stock baisse tout seul à chaque vente.</p></div>`, { menu: false }),

  comptes: navigateur('patisserie-lila.fr/mon-compte', `<div class="cpt"><h2>Bonjour Marie !</h2>
    <div class="cpt-tabs"><b>Mes commandes</b><span>Mes adresses</span><span>Mes favoris</span></div>
    ${[['n° 1042', '12 novembre', 'Fraisier pour 8', '32,00 €', 'Prête'], ['n° 1031', '28 octobre', 'Macarons, boîte de 6', '9,00 €', 'Retirée']].map(([n, d, p, t, s], i) => `<div class="cpt-l"><span><b>Commande ${n}</b><small>${d} · ${p}</small></span><b>${t}</b><em class="${i === 0 ? 'ok' : ''}">${s}</em></div>`).join('')}
    <button>${icon('refresh-cw')}Commander à nouveau</button></div>`),
};

const CSS = `@font-face{font-family:J;src:url(${font});font-weight:200 800}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;font-family:J,sans-serif;color:#2E2A47;background:linear-gradient(135deg,#FFF1F6,#F2EEFF 55%,#E9FBF3);overflow:hidden}
.scene{position:relative;width:${W}px;height:${H}px;padding:22px;display:flex}
.ico{width:1em;height:1em;flex:none}
.ex{position:absolute;right:16px;bottom:12px;padding:3px 10px;border-radius:99px;background:rgba(46,42,71,.75);color:#fff;font-size:11px;font-weight:700}
h2{font-size:20px;font-weight:800;letter-spacing:-.01em}h3{font-size:15px;font-weight:800}
button{border:0;border-radius:99px;background:#7EDDB5;color:#1B2A24;font:inherit;font-weight:800;font-size:11px;padding:6px 12px;display:inline-flex;align-items:center;gap:6px}
.nav{flex:1;display:flex;flex-direction:column;border-radius:14px;background:#fff;box-shadow:0 0 0 1px #E8E0F5,0 18px 40px -20px rgba(91,63,196,.45);overflow:hidden;min-width:0}
.nav-barre{display:flex;align-items:center;gap:6px;padding:8px 12px;background:#F4F1FA;border-bottom:1px solid #ECE6F6}.nav-barre i{width:9px;height:9px;border-radius:50%;background:#FF8F8F}.nav-barre i:nth-child(2){background:#FFD45E}.nav-barre i:nth-child(3){background:#7EDDB5}
.nav-barre span{margin-left:10px;padding:3px 12px;border-radius:99px;background:#fff;color:#6B6789;font-size:11px;font-weight:600;flex:1}
.site{flex:1;position:relative;padding:0 18px 16px;overflow:hidden}
.site-tete{display:flex;justify-content:space-between;align-items:center;padding:11px 0;margin-bottom:8px;border-bottom:1px solid #F1ECF8}.site-tete b{font-size:14px;color:#A3305F}.site-tete nav{display:flex;gap:14px;font-size:11px;font-weight:700;color:#6B6789}
.prod{display:grid;gap:2px;padding:6px 8px;border-radius:12px;background:#FFF8F2}.prod-img{height:40px;border-radius:9px;background:#FFE9F1;display:grid;place-items:center}.prod-img svg{height:36px}
.prod b{font-size:11.5px}.prix{font-size:12px;font-weight:800;color:#A3305F}.prod button{justify-content:center;font-size:10px;padding:5px 8px}.prod button.ok{background:#E8E0FF;color:#5B3FC4}
.bq{display:flex;gap:14px}.bq-liste{flex:1}.bq h2{margin-bottom:6px;font-size:18px}.grille{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.panier{width:178px;flex:none;align-self:flex-start;margin-top:30px;padding:12px;border-radius:14px;background:#fff;box-shadow:0 0 0 2px #FFD9E7;display:grid;gap:6px}
.panier-t{display:flex;gap:7px;align-items:center;font-weight:800;font-size:13px}.ligne{display:flex;justify-content:space-between;font-size:11px;gap:8px}.ligne.tot{border-top:1px solid #F1ECF8;padding-top:6px;font-size:13px;font-weight:800}
.payer{justify-content:center;font-size:12px;padding:8px}.sur{display:flex;gap:5px;align-items:center;justify-content:center;font-size:10px;color:#6B6789;font-weight:700}
.hero-en{display:flex;gap:16px;align-items:center;padding-top:14px}.hero-en>div:first-child{flex:1;display:grid;gap:9px;justify-items:start}.hero-en h2{font-size:24px;line-height:1.15}.hero-en p{font-size:12.5px;color:#4B4668;line-height:1.5}
.pastille{padding:3px 10px;border-radius:99px;background:#FFD9E7;color:#A3305F!important;font-weight:800;font-size:11px!important}.hero-img{width:190px;height:150px;border-radius:20px;background:#FFE9F1;display:grid;place-items:center}.hero-img svg{width:160px}
.site-tete nav{align-items:center}.langue{display:flex;padding:2px;border-radius:99px;background:#F4F1FA;font-size:11px;font-weight:800;box-shadow:0 0 0 3px #8C6CF2}.langue span,.langue b{padding:3px 9px;border-radius:99px}.langue b{background:#8C6CF2;color:#fff}
.rdv{display:grid;gap:10px}.cal{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.jour{display:grid;gap:5px}.jour b{font-size:11px;text-align:center;color:#6B6789}
.jour span{padding:6px 0;border-radius:9px;background:#E9FBF3;color:#176A4C;font-size:11px;font-weight:800;text-align:center}.jour span.pris{background:#F4F1FA;color:#B8B3CC;text-decoration:line-through}.jour span.choisi{background:#34B27F;color:#fff;box-shadow:0 0 0 3px #BFF0DA}
.rdv-bas{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:12px;background:#FFF8F2}.rdv-bas p{display:flex;gap:7px;align-items:center;font-size:13px}.rdv-bas button{font-size:12px;padding:8px 14px}
.rdv-mail{display:flex;gap:7px;align-items:center;font-size:11.5px;color:#6B6789;font-weight:700}
.rep{flex:1;display:grid;grid-template-columns:1fr 34px 1fr;grid-template-rows:1fr auto;gap:10px 8px;align-items:center}.rep-col{display:flex;flex-direction:column;gap:6px;height:100%}.rep-t{font-weight:800;font-size:13px;color:#6B6789}.rep-t.neuf{color:#176A4C}
.vieux{flex:1;padding:10px;border:2px solid #9a9a9a;background:#EDEDED;font-family:Georgia,serif;color:#333;font-size:11px;display:grid;gap:7px;align-content:start}.vieux-tete{background:#4b5f7a;color:#ff0;padding:8px;font-size:15px;font-weight:bold;letter-spacing:2px;text-align:center}
.vieux table{width:100%;border-collapse:collapse}.vieux td{border:1px solid #888;padding:3px;text-align:center;background:#d6d6d6;color:#00e;text-decoration:underline}.vieux-img{height:60px;background:repeating-linear-gradient(45deg,#bbb 0 6px,#ccc 6px 12px)}.vieux .petit{font-size:9px;color:#666}
.fleche{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#34B27F;color:#fff}.rep .nav{height:100%}
.mini-hero{display:grid;gap:6px;padding-top:6px}.mini-hero p{font-size:11px;color:#4B4668}.mini-img{height:90px;border-radius:14px;background:#FFE9F1;display:grid;place-items:center}.mini-img svg{height:80px}
.rep-garde{grid-column:1/-1;display:flex;gap:8px;align-items:center;justify-content:flex-start;font-size:12.5px;font-weight:800;color:#176A4C}
.pg{display:flex;gap:16px;padding-top:14px;height:100%}.pg-menu{width:200px;flex:none;padding:8px;border-radius:14px;background:#FFF8F2;display:grid;gap:3px;align-content:start}
.pg-menu p{display:flex;justify-content:space-between;align-items:center;padding:5px 9px;border-radius:8px;font-size:11.5px;font-weight:700}.pg-menu p.neuf{background:#E9FBF3;color:#176A4C}.pg-menu em{font-style:normal;font-size:9px;padding:2px 6px;border-radius:99px;background:#34B27F;color:#fff}
.pg-txt{flex:1;display:grid;gap:8px;align-content:start}.pg-txt p{font-size:12px;color:#4B4668;line-height:1.5}.pg-img{height:150px;border-radius:16px;background:#FFE9F1;display:grid;place-items:center}.pg-img svg{height:120px}
.seo{flex:1;display:flex;gap:14px}.g{flex:1.2;padding:14px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px #E8E0F5;display:grid;gap:10px;align-content:start}
.g-barre{display:flex;gap:8px;align-items:center;padding:8px 14px;border-radius:99px;box-shadow:0 0 0 1px #DDD8EA;font-size:12.5px}.g-res{display:grid;gap:2px;padding:8px;border-radius:10px}.g-res small{font-size:10px;color:#4B6B4E}.g-res b{font-size:13px;color:#1A47B8;font-weight:700}.g-res span{font-size:11px;color:#4B4668}
.g-res.moi{background:#E9FBF3;box-shadow:0 0 0 2px #7EDDB5}
.seo-rap{flex:1;padding:14px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px #E8E0F5;display:grid;gap:7px;align-content:start}.seo-t{display:flex;gap:7px;align-items:center;font-weight:800;font-size:13px}
.seo-l{display:flex;justify-content:space-between;font-size:11.5px;padding:5px 8px;border-radius:8px;background:#FFF8F2}.seo-l b.up{color:#176A4C}.seo-graph{padding:6px;border-radius:10px;background:#F4FBF7}.seo-graph small{font-size:10px;color:#6B6789}.seo-note{font-size:11px;font-weight:700;color:#6B6789}
.esp{flex:1;display:flex;border-radius:16px;background:#fff;box-shadow:0 0 0 1px #E8E0F5,0 18px 40px -20px rgba(91,63,196,.45);overflow:hidden}
.esp-cote{width:150px;flex:none;padding:12px 10px;background:#F7F2FF;display:grid;gap:4px;align-content:start}.esp-moi{display:flex;gap:6px;align-items:center;margin-bottom:8px}.esp-moi b{display:block;font-size:11px}.esp-moi small{font-size:9px;color:#6B6789}
.esp-cote>p{padding:6px 9px;border-radius:9px;font-size:11px;font-weight:700;color:#6B6789}.esp-cote>p.on{background:#fff;color:#2E2A47;box-shadow:0 0 0 2px #E8E0FF}
.esp-main{flex:1;padding:16px;display:grid;gap:12px;align-content:start;min-width:0}
.jauge{padding:12px;border-radius:14px;background:#FFF1F6;display:grid;gap:7px}.jauge p{display:flex;justify-content:space-between;font-size:12.5px;font-weight:800}.jauge p span{display:flex;gap:6px;align-items:center}.jauge i{height:10px;border-radius:99px;background:#fff}.jauge u{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#F27BA8,#8C6CF2)}.jauge small{font-size:10.5px;color:#6B6789;font-weight:700}
.lp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.lp div{padding:10px;border-radius:12px;background:#F7F2FF;display:grid;gap:3px}.lp .ico{width:18px;height:18px;color:#8C6CF2}.lp b{font-size:11.5px}.lp small{font-size:10px;color:#6B6789}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.kpis p{padding:9px;border-radius:12px;background:#E9FBF3;display:grid}.kpis small{font-size:10px;color:#176A4C;font-weight:700}.kpis b{font-size:18px}
.charts{display:grid;grid-template-columns:1.4fr 1fr;gap:8px}.ch{padding:9px;border-radius:12px;background:#FFF8F2;display:grid;gap:4px;align-content:start}.ch:first-child{grid-row:span 2}.ch small{font-size:10px;font-weight:700;color:#6B6789}.ch svg{width:100%}.ch:nth-child(2){grid-template-columns:52px 1fr;align-items:center}.ch:nth-child(2) small{grid-column:1/-1}
.leg{font-size:10px;line-height:1.6}.leg span{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}.leg .a{background:#8C6CF2}.leg .b{background:#E8E0FF}
.barre{display:grid;grid-template-columns:52px 1fr;gap:6px;align-items:center;font-size:10px}.barre i{height:7px;border-radius:99px;background:#fff}.barre u{display:block;height:100%;border-radius:99px;background:#5AA2F0}
.tel-scene{flex:1;display:flex;gap:26px;align-items:center;justify-content:center}.tel{width:200px;height:350px;padding:10px;border-radius:30px;background:#2E2A47;box-shadow:0 18px 40px -16px rgba(46,42,71,.6)}.tel-in{height:100%;border-radius:22px;background:#fff;padding:14px 10px;display:grid;gap:7px;align-content:start;overflow:hidden}
.tel-h{display:flex;gap:6px;align-items:center;font-size:10px;padding-bottom:6px;border-bottom:1px solid #F1ECF8}.tel-h .ico{color:#8C6CF2}.m{display:grid;gap:1px;padding:7px 8px;border-radius:10px;background:#F7F2FF}.m.neuf{background:#E9FBF3;box-shadow:inset 3px 0 #34B27F}.m b{font-size:11px}.m span{font-size:10.5px;font-weight:700}.m small{font-size:9.5px;color:#6B6789}
.tel-txt{width:230px;display:grid;gap:8px}.tel-txt p{font-size:13px;color:#4B4668;line-height:1.5}
.stk{display:grid;gap:7px;padding-top:12px}.stk-l{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;padding:6px 10px;border-radius:12px;background:#FFF8F2}.stk-img{height:38px;border-radius:8px;background:#FFE9F1;display:grid;place-items:center}.stk-img svg{height:32px}
.stk-l b{font-size:12.5px}.q{padding:4px 10px;border-radius:99px;background:#E9FBF3;color:#176A4C;font-size:11px;font-weight:800}.q.bas{background:#FFF1C2;color:#7A5600}.q.vide{background:#F4F1FA;color:#9A95B3}
.stk-note{display:flex;gap:7px;align-items:center;font-size:11.5px;font-weight:700;color:#6B6789}
.cpt{display:grid;gap:9px;padding-top:4px}.cpt-tabs{display:flex;gap:6px;font-size:11px;font-weight:700}.cpt-tabs>*{padding:5px 11px;border-radius:99px;background:#F4F1FA;color:#6B6789}.cpt-tabs b{background:#2E2A47;color:#fff}
.cpt-l{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:9px 12px;border-radius:12px;background:#FFF8F2}.cpt-l span{display:grid}.cpt-l b{font-size:12.5px}.cpt-l small{font-size:10.5px;color:#6B6789}.cpt-l em{font-style:normal;font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:99px;background:#F4F1FA;color:#6B6789}.cpt-l em.ok{background:#E9FBF3;color:#176A4C}
.cpt button{justify-self:start;font-size:11.5px;padding:7px 13px}`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
  const seule = process.argv[2];
  for (const [id, html] of Object.entries(SCENES)) {
    if (seule && seule !== id) continue;
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="scene">${html}${exemple}</div></body></html>`, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const png = path.join(OUT, id + '.png');
    await p.screenshot({ path: png });
    // en WebP, plus léger (Pillow)
    execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).save(sys.argv[2],"WEBP",quality=80,method=6)', png, png.replace(/\.png$/, '.webp')]);
    fs.unlinkSync(png);
    console.log('✔', path.relative(ROOT, png.replace(/\.png$/, '.webp')), Math.round(fs.statSync(png.replace(/\.png$/, '.webp')).size / 1024) + ' Ko');
  }
  await b.close();
})();
