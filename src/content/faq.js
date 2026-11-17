// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (2 à 4 phrases) et honnêtes, en mots de tous les jours. Chaque terme technique
// (SEO, nom de domaine, hébergement, sauvegarde, maintenance…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 17 novembre 2026 : le Site Internet Professionnel à prix fixe (jusqu'à creation.pages pages), une seule option
// à la commande (la boutique en ligne, payée une fois), les pages SEO supplémentaires commandées plus tard depuis l'espace
// client (options packseo, prix à la page), puis le choix « On s'occupe de tout » (un abonnement au mois sans engagement,
// au choix : Mini, id 'base', modifications faites par Alex sous 7 jours, une demande à la fois et une page SEO par mois, ou Maxi,
// id 'evolution', modifications prioritaires sous 48 h, deux demandes à la fois, une page SEO par semaine et l'optimisation continue de config.optimisation)
// ou « Je m'en occupe moi-même » (création seule, le code du site est remis au client). On change d'abonnement quand on
// veut, à partir du mois suivant. La petite bande (config.bande) : les automatisations d'Alex, présentées
// par leur prénom. On n'écrit jamais « IA » ici.
const cfg = require('../config');
const { forfaits, annuel, lissage, options, paiement, fidelite, creation, marche, bande, evenement, limites, optimisation } = cfg;

const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l, mot = 'et') => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${mot} ${l[l.length - 1]}` : l.join(''));
const durees = lissage.durees.join(' ou ');
const D1 = lissage.durees[0];
const LN = lissage.durees[lissage.durees.length - 1];
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
// Mensualité du lissage, arrondie au centime inférieur (même règle que le serveur).
const lisse = (prix, n = LN) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // mensualité du reste, après l’acompte

// Deux abonnements depuis le 17 novembre 2026 : Mini (id 'base') et Maxi (id 'evolution').
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const maxi = forfaits.find((f) => f.id === 'evolution') || forfaits[forfaits.length - 1];
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const optiNom = minus(optimisation.titre); // « optimisation continue »
// La page SEO supplémentaire (config.options, id 'packseo') ne se choisit pas à la commande : elle se commande plus tard,
// à l'unité, depuis l'espace client (quand: 'espace'). La seule option à la commande est la boutique en ligne.
const packSeo = options.find((o) => o.id === 'packseo' && !o.retire) || { name: 'Page SEO supplémentaire', price: { once: 5 }, pages: 1 };
const prixPage = eur(packSeo.price.once); // prix d'une page SEO supplémentaire
const boutique = creation.prix + creation.boutique;
const restantes = creation.pages - creation.exemplePages; // l'exemple : 8 pages utilisées, 7 pour Google
const NOM_SITE = creation.nom || 'Site Internet Professionnel';
const lieux = liste(evenement.lieux, 'ou');
const moisOffert = fidelite.parrainageMois === 1 ? 'un mois offert' : `${fidelite.parrainageMois} mois offerts`;

// La petite bande : chaque petit monstre par son prénom, avec son rôle (config.bande).
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const plume = monstre('ecrivain').nom;
const mirette = monstre('observateur').nom;
const lumi = monstre('etoile').nom;
const champi = monstre('vendeur').nom;
// Ce que fait chacun, en quelques mots (écrit ici pour la FAQ, différent des phrases de config.js).
const MISSION = {
  support: 'vous aide à formuler vos demandes',
  ecrivain: 'aide à écrire vos textes',
  organisateur: 'range vos pages',
  gardien: 'protège votre site',
  observateur: 'suit vos visites',
  etoile: 'choisit les sujets de vos pages pour Google',
  vendeur: 'tient votre boutique',
};
const mission = (b) => MISSION[b.id] || minus(b.court.replace(/\.$/, ''));
const presente = (b) => `${b.nom} (${minus(b.role)}) ${mission(b)}`;
const bandeComprise = liste(bande.filter((b) => b.compris).map(presente));
const bandeBoutique = bande.filter((b) => b.option === 'boutique').map((b) => `${b.nom} (${minus(b.role)}) arrive avec la boutique en ligne.`).join(' ');

module.exports = {
  creation: [
    { q: `Que comprend le site à ${eur(creation.prix)} € ?`, a: `Le ${NOM_SITE} compte jusqu’à ${creation.pages} pages, avec un design fait pour vous, adapté à tous les écrans, du téléphone à l’ordinateur. Il a aussi un formulaire de contact, pour que vos clients vous écrivent directement. Je vous accompagne du début à la fin, avec les Minis Monstres. Si vous prenez un abonnement, le nom de domaine (l’adresse de votre site) et l’hébergement (l’endroit où il reste en ligne 24 h/24) sont offerts la première année, sauf avec la boutique en ligne. Sinon, je vous remets le code de votre site, prêt à installer.` },
    { q: 'Que deviennent les pages que je n’utilise pas ?', a: `Elles ne sont pas perdues : elles peuvent devenir des pages SEO, écrites pour que votre site soit plus facile à trouver sur Google. Imaginons que votre activité tienne en ${creation.exemplePages} pages. Les ${restantes} pages restantes répondent alors aux recherches de vos clients et améliorent votre présence sur Google.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous me racontez votre métier, et ${plume}, la rédactrice de ma petite bande, m’aide à en tirer des textes clairs. Pour les photos, je choisis des images que l’on a le droit d’utiliser, adaptées à votre activité. Vous mettrez les vôtres quand vous voudrez : c’est une modification, donc c’est inclus.` },
    { q: 'Quelles options puis-je ajouter ?', a: `Une seule à la commande : la boutique en ligne, à ${eur(creation.boutique)} € payés une fois, pour vendre vos produits sur internet. Plus tard, vous pourrez aussi ajouter des pages SEO supplémentaires, à ${prixPage} € la page, depuis votre espace client (onglet « Mes demandes »). Chacune répond à une question que vos clients tapent sur Google. Rien n’est obligatoire.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat se vaut : moderne, rapide, soigné. Je conçois votre site moi-même, et ma petite bande d’automatisations se charge de ce qui se répète. Je vais donc plus vite, et je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, un développeur reste le bon choix, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % en commandant. Le reste se paie quand vous recevez votre site, d’un coup ou en ${durees} fois sans frais, avec ou sans abonnement. Si vous avez un abonnement, il démarre ce jour-là, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: `Sur la page Créer mon site, tout se lit de haut en bas : votre site, la boutique en ligne si vous voulez vendre, puis qui s’occupe de la mise en ligne. Si vous me la confiez, vous choisissez ensuite votre abonnement, ${mini.name} ou ${maxi.name}, et votre nom de domaine. En bas, le total s’affiche, avec le paiement en une fois ou étalé et la case « Code promo ou parrainage ». Vous cliquez sur Commander, vous relisez le récapitulatif et vous donnez vos coordonnées. Vous payez en ligne, et un e-mail de confirmation arrive aussitôt avec votre référence de commande.` },
    { q: 'Que paie-je aujourd’hui ?', a: `Seulement ${paiement.acompte} % du prix du site, boutique en ligne comprise si vous l’avez choisie. Le reste se règle à la réception du site, et l’abonnement, si vous le prenez, ne démarre qu’à ce moment-là. Le montant exact s’affiche sur le bouton avant de valider.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, que vous preniez un abonnement ou la création seule. Après l’acompte de ${paiement.acompte} %, le reste se paie à la réception, en ${durees} fois sans frais. Pour un site à ${eur(creation.prix)} € : ${eur(acompte(creation.prix))} € à la commande, puis ${eur(lisse(creation.prix, D1))} € par mois pendant ${D1} mois, ou ${eur(lisse(creation.prix))} € pendant ${LN} mois. Si vous avez un abonnement, il se règle alors au mois. Quand le site est payé, plus rien ne s’ajoute.` },
    { q: 'Suis-je engagé ?', a: `Non. Votre abonnement s’arrête quand vous le décidez, à la fin de la période déjà payée. Seule exception : si vous payez le site en ${durees} fois, vous vous engagez le temps de ce paiement, avec ou sans abonnement. En cas de départ avant la fin, le reste du prix du site se règle d’un coup.` },
    { q: 'Puis-je ajouter une option plus tard ?', a: `Oui. Les pages SEO supplémentaires se commandent une par une depuis votre espace client, dans l’onglet « Mes demandes », quand vous le souhaitez. Pour ajouter la boutique en ligne après la mise en ligne, écrivez-moi. Chaque ajout se paie une seule fois.` },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe, le service de paiement en ligne, émet la facture et vous l’envoie par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas, car l’entreprise est en franchise de TVA (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Vous me prévenez, et votre abonnement se termine à la fin de la période en cours. Vous gardez votre nom de domaine, c’est-à-dire l’adresse de votre site, et je vous remets une copie complète du site. Je le laisse en ligne encore 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme vous me demandez de commencer tout de suite, vous payez seulement le travail déjà fait, au prorata. Le nom de domaine déjà réservé (l’adresse de votre site) reste à votre nom pour un an, et à votre charge.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `${eur(creation.prix)} € une fois pour le site. Si je m’occupe de tout, ajoutez un abonnement : ${mini.name} à ${eur(mini.month)} € par mois, ou ${maxi.name} à ${eur(maxi.month)} € par mois. Avec ${mini.name}, la première année revient à ${eur(creation.prix + 12 * mini.month)} €, ou à ${eur(creation.prix + parAn(mini))} € si vous le payez à l’année. Avec ${maxi.name}, comptez ${eur(creation.prix + 12 * maxi.month)} €, ou ${eur(creation.prix + parAn(maxi))} € à l’année. En création seule, vous ne payez que le site. La boutique en ligne se paie une seule fois, comme chaque page SEO supplémentaire, à ${prixPage} € la page.` },
    { q: `Quelle différence entre ${mini.name} et ${maxi.name} ?`, a: `${mini.name}, à ${eur(mini.month)} € par mois, garde votre site en ligne, protégé et entretenu. Vos modifications sont incluses, faites en général sous ${mini.delai}, et une page SEO s’ajoute chaque mois. ${maxi.name}, à ${eur(maxi.month)} € par mois, comprend tout cela et va plus vite. Je traite vos demandes en priorité, sous ${maxi.delai} en général, et vous pouvez en avoir deux en cours. Vous avez une page SEO par semaine, et la bande suit votre site pour vous proposer des améliorations. Les deux sont sans engagement.` },
    { q: `Que comprend l’abonnement ${mini.name} ?`, a: `Tout ce qui garde votre site en ligne et à jour. Il comprend l’hébergement (l’endroit où votre site reste accessible jour et nuit), le nom de domaine (son adresse), les sauvegardes (des copies de sécurité), la sécurité et la maintenance, c’est-à-dire les vérifications techniques régulières qui gardent le site en état de marche. Vos modifications sont incluses, sans limite, une demande à la fois. Je les fais en général sous ${mini.delai}. Chaque mois, une page SEO s’ajoute aussi à votre site : une page de plus pour être trouvé sur Google. Vous suivez vos visites dans votre tableau de bord.` },
    { q: `Que comprend ${maxi.name} en plus ?`, a: `Tout ce que comprend ${mini.name}, avec la priorité sur vos demandes. Je fais vos modifications sous ${maxi.delai} en général, et vous pouvez envoyer deux demandes à la fois au lieu d’une. Une page SEO optimisée s’ajoute chaque semaine, au lieu d’une par mois. Enfin, ${mirette}, l’observatrice de ma petite bande, analyse votre site régulièrement : c’est l’${optiNom}.` },
    { q: `C’est quoi, l’${optiNom} ?`, a: `C’est un suivi de votre site dans la durée, compris dans ${maxi.name}. ${mirette} regarde vos visites, vos pages et la vitesse de votre site. La bande repère ce qui pourrait mieux marcher, par exemple un titre à revoir ou une page qui manque. Vous recevez ces idées sous forme de petits messages dans votre espace client, et vous choisissez celles que vous voulez appliquer. Le but : que votre site soit un peu plus visible, mois après mois.` },
    { q: 'Puis-je changer d’abonnement ?', a: `Oui, quand vous voulez, dans un sens comme dans l’autre. Le nouvel abonnement s’applique à partir du mois suivant. Vous pouvez donc commencer avec ${mini.name}, puis passer à ${maxi.name} quand votre activité en a besoin.` },
    { q: 'Les modifications sont-elles limitées ?', a: `Non. Avec ${mini.name} comme avec ${maxi.name}, vous demandez autant de modifications que vous voulez. Ajouter un texte ou des photos, changer un horaire, ajouter une page tant que le site reste dans ses ${creation.pages} pages : tout cela compte comme une modification. Seules une refonte complète ou une fonction nouvelle, comme une prise de rendez-vous, se font sur devis.` },
    { q: 'Le nom de domaine et l’hébergement sont-ils compris ?', a: 'Oui, si vous me confiez la mise en ligne. Le nom de domaine, c’est l’adresse de votre site, comme votre-nom.fr : vous le choisissez en commandant, et je le réserve à votre nom. L’hébergement, c’est l’endroit où votre site est rangé pour rester visible 24 h/24. Les deux sont offerts la première année, sauf si vous prenez la boutique en ligne, puis votre abonnement les prend en charge, sans supplément. En création seule, vous gardez les vôtres.' },
    { q: 'J’ai déjà mon nom de domaine et mon hébergement. Comment faire ?', a: `Choisissez « Je m’en occupe moi-même » en commandant : c’est la création seule. Vous ne payez que votre site, ${eur(creation.prix)} €, sans abonnement, avec ${paiement.acompte} % à la commande puis le reste à la réception, en une fois ou en ${durees} fois sans frais. Une fois le site terminé, je vous donne son code : tous ses fichiers et une sauvegarde complète, avec une courte notice pour l’installer. Vous l’installez vous-même ou avec l’aide de votre hébergeur, qui a souvent des guides gratuits pour cela. Ensuite, la maintenance, la sécurité et les modifications ne sont pas comprises, mais vous pourrez prendre un abonnement plus tard.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous préférez. À l’année, vous payez ${12 - annuel.moisOfferts} mois et ${annuel.moisOfferts} sont offerts. ${mini.name} revient à ${eur(parAn(mini))} € par an au lieu de ${eur(12 * mini.month)} €, et ${maxi.name} à ${eur(parAn(maxi))} € au lieu de ${eur(12 * maxi.month)} €. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'J’ai un code promo ou un code de parrainage. Où le mettre ?', a: `Dans la case « Code promo ou parrainage », en bas de la page, juste au-dessus du bouton Commander. Je vérifie le code tout de suite. Un code promo réduit le prix de la création. Un code de parrainage vous donne ${moisOffert}, à vous comme à la personne qui vous a recommandé.` },
    { q: 'Et pour une boutique en ligne ?', a: `C’est une option à ${eur(creation.boutique)} €, payée une fois, soit ${eur(boutique)} € avec le site. Vos produits sont présentés en images, avec un panier, le paiement en ligne, la gestion des commandes et des e-mails envoyés tout seuls à vos clients. Vos clients achètent sans créer de compte. Il n’y a pas de stock à tenir : on ne compte pas les quantités, et un produit qui manque passe simplement en épuisé. Dans votre espace client, un onglet « Ma boutique » s’ajoute : vous y réglez vos codes promo, vos soldes, un bandeau d’annonce et le mode vacances, sans que ça compte dans vos modifications. Vos commandes apparaissent aussi dans votre tableau de bord. ${champi}, le vendeur de ma petite bande, s’en occupe avec vous. Le prix de votre abonnement, lui, ne change pas.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site fait à la main ?`, a: `Parce que j’ai passé beaucoup de temps à programmer ma petite bande : des automatisations qui font tout ce qui se répète. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages avec référencement coûte souvent entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, et une agence demande davantage. Chez moi, c’est ${eur(creation.prix)} €, et votre site est quand même conçu, relu et testé par moi. Pas de magie, juste de l’organisation.` },
    { q: 'Qu’est-ce que je vois dans le tableau de bord ?', a: 'Le tableau de bord est compris dans les deux abonnements, boutique ou pas. Vous y voyez vos visiteurs jour par jour, d’où ils arrivent (Google, réseaux sociaux, lien direct), vos pages les plus vues et vos meilleures recherches sur Google. Les visites sont comptées sans cookie. Avec une boutique, vos commandes s’y ajoutent.' },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif de commande montre tout : le site, la boutique si vous l’ajoutez, et l’abonnement choisi s’il y en a un. Un devis n’arrive que pour un gros chantier, comme refaire tout le site, et vous l’acceptez ou non avant que je commence.' },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous écrivez votre demande à ${cerise}, la secrétaire de ma petite bande, dans votre espace client. Elle vous pose quelques questions pour bien comprendre, puis vous résume la demande. Vous la confirmez, et elle me la transmet. C’est moi qui fais la modification, à la main, et je vous préviens quand elle est en ligne.` },
    { q: 'Puis-je annuler une demande ?', a: 'Oui, tant que je ne l’ai pas commencée. Un bouton Annuler s’affiche à côté de la demande, dans votre espace client. Une fois que j’ai commencé, écrivez-moi et nous en parlons.' },
    { q: 'En combien de temps est-ce fait ?', a: `Cela dépend de votre abonnement. Avec ${mini.name}, le délai habituel va jusqu’à ${mini.delai}. Avec ${maxi.name}, vos demandes passent avant les autres, et je les fais en général sous ${maxi.delai}. Vous avez une demande en cours à la fois avec ${mini.name}, deux avec ${maxi.name}.` },
    { q: 'Puis-je ajouter une page à mon site ?', a: `Oui, c’est une modification comme une autre : vous la demandez depuis votre espace client, sans rien payer de plus. La seule limite, ce sont les ${creation.pages} pages de votre site.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre abonnement tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: `Non, il est compris dans votre abonnement, ${mini.name} ou ${maxi.name}. Vous y demandez vos modifications, vous suivez leur avancement et vous retrouvez vos factures et votre lien de parrainage. ${cerise}, la secrétaire de ma petite bande, vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour. Avec ${maxi.name}, vous y trouvez en plus les suggestions de la bande pour votre site.` },
  ],
  seo: [
    { q: 'C’est quoi, le SEO ?', a: `C’est tout ce qui aide votre site à être trouvé plus facilement sur Google. Des titres clairs, des pages qui répondent aux questions de vos clients, un site rapide : Google aime tout cela. J’y veille sur chaque page de votre site, et ${lumi}, l’étoile de Google de ma petite bande, choisit les sujets de vos pages SEO.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Je déclare votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'Comment avoir plus de pages pour Google ?', a: `Il y a trois façons, qui s’additionnent. Les pages que vous n’utilisez pas parmi les ${creation.pages} de votre site deviennent des pages SEO, faites pour vous rendre visible sur Google. Votre abonnement en ajoute une chaque mois avec ${mini.name}, ou une chaque semaine avec ${maxi.name}. Enfin, vous pouvez commander des pages SEO supplémentaires, à ${prixPage} € la page, depuis votre espace client, au moment qui vous convient. Par exemple, une page sur un service dans votre ville, une FAQ ou un petit guide.` },
    { q: 'C’est quoi, une page SEO ?', a: `Une page qui répond à une recherche précise de vos clients sur Google, comme un service dans votre ville ou une question qu’on vous pose souvent. Elle a un titre clair et renvoie vers vos services. ${lumi} en choisit le sujet, puis je l’écris et je la publie.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté, et ${mirette}, l’observatrice de ma petite bande, suit les visites de votre site pour repérer ce qui peut être amélioré.` },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Je peux le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site à ${eur(creation.prix)} € fait par mes soins. Écrivez-moi pour en parler.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont mes automatisations, des programmes que j’ai écrits un par un puis dessinés en petits monstres. ${bandeComprise}.${bandeBoutique ? ` ${bandeBoutique}` : ''} Ils vous aident, mais c’est moi qui modifie votre site.` },
    { q: 'Les petits monstres construisent-ils mon site ?', a: `Non. C’est moi qui conçois votre site et qui fais les choix. Je le construis moi-même, et la bande s’occupe de ce qui se répète autour. La relecture, les vérifications et les modifications, c’est moi.` },
    { q: 'Les petits monstres peuvent-ils se tromper ?', a: 'Oui, comme tout programme automatique. C’est pour ça qu’aucun d’eux ne touche à votre site : ils aident, préparent et surveillent. C’est moi qui garde la main.' },
    { q: 'Mes clients verront-ils que des automatisations ont servi ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins cher qu’une agence ?', a: 'Parce que je travaille autrement. Ma petite bande d’automatisations se charge des tâches répétitives, et je traite en direct avec des hébergeurs français, les entreprises qui gardent les sites en ligne. Je n’ai ni local à payer ni équipe à faire tourner. Pour un très gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, c’est vous qui construisez le site, le mettez à jour et écrivez pour Google, souvent le soir. Chez moi, vous décrivez ce que vous voulez et je le fais. Vous n’avez aucun outil à apprendre.' },
    { q: 'Et par rapport à un freelance ?', a: 'Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Avec un abonnement, je garde votre site en ligne, protégé et à jour, et vos modifications sont incluses, sans limite. Vous connaissez le prix à l’avance.' },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Votre nom de domaine, l’adresse de votre site, est à votre nom et se transfère où vous voulez. Je vous remets aussi les fichiers du site pour le faire héberger ailleurs, c’est-à-dire le mettre en ligne chez un autre prestataire. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou il donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${moisOffert} sur votre abonnement.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
    { q: 'Y a-t-il une remise pour un deuxième site ?', a: `Oui. La création de votre deuxième site coûte ${fidelite.remiseSecondSite} % de moins. C’est ma façon de remercier les clients qui reviennent.` },
  ],
};
