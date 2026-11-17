// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (2 à 4 phrases) et honnêtes, en mots de tous les jours. Chaque terme technique
// (SEO, nom de domaine, hébergement, sauvegarde, maintenance, aperçu…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 17 novembre 2026 : le Site Internet Professionnel à prix fixe (jusqu'à creation.pages pages), une seule option
// à la commande (la boutique en ligne, payée une fois), le Pack SEO commandé plus tard depuis l'espace client, puis le
// choix « On s'occupe de tout » (deux formules au mois sans engagement : Tranquillité et Évolution, modifications
// incluses sans limite) ou « Je m'en occupe moi-même » (création seule, le code du site est remis au client). La petite bande (config.bande) : les automatisations d'Alex, présentées
// par leur prénom. On n'écrit jamais « IA » ici.
const cfg = require('../config');
const { forfaits, annuel, lissage, options, paiement, fidelite, creation, marche, bande, evenement, limites } = cfg;

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

// Les deux formules au mois : id 'base' = Tranquillité, id 'evolution' = Évolution.
const tranquille = forfaits.find((f) => f.id === 'base') || forfaits[0];
const evolution = forfaits.find((f) => f.id === 'evolution') || forfaits[forfaits.length - 1];
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // une formule payée à l'année
const delaiT = tranquille.delai; // 72 heures (au plus)
const delaiE = evolution.delai; // 12 à 24 heures (en moyenne)
// Le Pack SEO (config.options) ne se choisit plus à la commande : il se commande plus tard depuis l'espace client
// (quand: 'espace'). La seule option à la commande est la boutique en ligne (creation.boutique).
const packSeo = options.find((o) => o.id === 'packseo' && !o.retire) || { name: 'Pack SEO', price: { once: 0 }, pages: 0 };
const boutique = creation.prix + creation.boutique;
const restantes = creation.pages - creation.exemplePages; // l'exemple : 8 pages utilisées, 12 pour Google
const NOM_SITE = creation.nom || 'Site Internet Professionnel';
const VERIF = '30 minutes'; // sans refus d'Alex dans ce délai, la modification préparée est validée
const lieux = liste(evenement.lieux, 'ou');
const moisOffert = fidelite.parrainageMois === 1 ? 'un mois offert' : `${fidelite.parrainageMois} mois offerts`;

// La petite bande : chaque petit monstre par son prénom, avec son rôle (config.bande).
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const bricou = monstre('bricoleur').nom;
const plume = monstre('ecrivain').nom;
const mirette = monstre('observateur').nom;
const lumi = monstre('etoile').nom;
const champi = monstre('vendeur').nom;
// Ce que fait chacun, en quelques mots (écrit ici pour la FAQ, différent des phrases de config.js).
const MISSION = {
  support: 'accueille vos demandes',
  bricoleur: 'prépare vos modifications',
  ecrivain: 'aide à écrire vos textes',
  organisateur: 'range vos pages',
  gardien: 'protège votre site',
  observateur: 'suit vos visites',
  etoile: 'écrit les pages qui vous font trouver',
  vendeur: 'tient votre boutique',
};
const mission = (b) => MISSION[b.id] || minus(b.court.replace(/\.$/, ''));
const presente = (b) => `${b.nom} (${minus(b.role)}) ${mission(b)}`;
const bandeComprise = liste(bande.filter((b) => b.compris).map(presente));
const bandeBoutique = bande.filter((b) => b.option === 'boutique').map((b) => `${b.nom} (${minus(b.role)}) arrive avec la boutique en ligne.`).join(' ');

module.exports = {
  creation: [
    { q: `Que comprend le site à ${eur(creation.prix)} € ?`, a: `Le ${NOM_SITE} compte jusqu’à ${creation.pages} pages, avec un design fait pour vous, adapté au téléphone comme à l’ordinateur. Il a un formulaire de contact, une carte Google et le référencement Google de base, c’est-à-dire ce qui aide votre site à être trouvé sur Google. Je vous accompagne du début à la fin, avec les Minis Monstres. Si vous me confiez la mise en ligne, le nom de domaine (l’adresse de votre site) et l’hébergement (l’endroit où il reste en ligne 24 h/24) sont offerts la première année, sauf avec la boutique en ligne. Sinon, je vous remets le code de votre site, prêt à installer.` },
    { q: 'Que deviennent les pages que je n’utilise pas ?', a: `Elles ne sont pas perdues : elles peuvent devenir des pages SEO, écrites pour que votre site soit plus facile à trouver sur Google. Imaginons que votre activité tienne en ${creation.exemplePages} pages. Les ${restantes} pages restantes répondent alors aux recherches de vos clients et améliorent votre présence sur Google.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous me racontez votre métier, et ${plume}, la rédactrice de ma petite bande, m’aide à en tirer des textes clairs. Pour les photos, je choisis des images que l’on a le droit d’utiliser, adaptées à votre activité. Vous mettrez les vôtres quand vous voudrez : c’est une modification, donc c’est inclus.` },
    { q: 'Quelles options puis-je ajouter ?', a: `Une seule à la commande : la boutique en ligne, à ${eur(creation.boutique)} € payés une fois, pour vendre vos produits sur internet. Le ${packSeo.name}, à ${eur(packSeo.price.once)} €, se demande plus tard, quand vous voulez, depuis votre espace client (onglet « Mes demandes »). Il ajoute ${packSeo.pages} pages SEO : chacune répond à une question que vos clients tapent sur Google. Rien n’est obligatoire.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat se vaut : moderne, rapide, soigné. Je conçois votre site moi-même, et ma petite bande d’automatisations se charge de ce qui se répète. Je vais donc plus vite, et je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, un développeur reste le bon choix, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % en commandant. Le reste se paie quand vous recevez votre site, d’un coup ou en ${durees} fois sans frais, avec ou sans formule au mois. Si vous avez une formule, elle démarre ce jour-là, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: 'Sur la page Créer mon site, tout se lit de haut en bas : votre site, la boutique en ligne si vous voulez vendre, puis qui s’occupe de la mise en ligne. Si vous me la confiez, vous choisissez ensuite votre nom de domaine et votre formule. En bas, le total s’affiche, avec le paiement en une fois ou étalé et la case « Code promo ou parrainage ». Vous cliquez sur Commander, vous relisez le récapitulatif et vous donnez vos coordonnées. Vous payez en ligne, et un e-mail de confirmation arrive aussitôt avec votre référence de commande.' },
    { q: 'Que paie-je aujourd’hui ?', a: `Seulement ${paiement.acompte} % du prix du site, boutique en ligne comprise si vous l’avez choisie. Le reste se règle à la réception du site, et votre formule, si vous en prenez une, ne démarre qu’à ce moment-là. Le montant exact s’affiche sur le bouton avant de valider.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, que vous preniez une formule ou la création seule. Après l’acompte de ${paiement.acompte} %, le reste se paie à la réception, en ${durees} fois sans frais. Pour un site à ${eur(creation.prix)} € : ${eur(acompte(creation.prix))} € à la commande, puis ${eur(lisse(creation.prix, D1))} € par mois pendant ${D1} mois, ou ${eur(lisse(creation.prix))} € pendant ${LN} mois. Si vous avez une formule, elle se règle alors au mois. Quand le site est payé, plus rien ne s’ajoute.` },
    { q: 'Suis-je engagé ?', a: `Non. Votre formule s’arrête quand vous le décidez, à la fin de la période déjà payée. Seule exception : si vous payez le site en ${durees} fois, vous vous engagez le temps de ce paiement, avec ou sans formule. En cas de départ avant la fin, le reste du prix du site se règle d’un coup.` },
    { q: 'Puis-je changer de formule ou ajouter une option plus tard ?', a: `Oui. Vous passez de ${tranquille.name} à ${evolution.name}, ou l’inverse, depuis votre espace client, et le nouveau prix démarre à la période suivante. Le ${packSeo.name} se commande au même endroit, dans l’onglet « Mes demandes », quand vous le souhaitez. Pour ajouter la boutique en ligne après la mise en ligne, écrivez-moi. Les deux se paient une seule fois.` },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe, le service de paiement en ligne, émet la facture et vous l’envoie par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas, car l’entreprise est en franchise de TVA (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Vous me prévenez, et votre formule se termine à la fin de la période en cours. Vous gardez votre nom de domaine, c’est-à-dire l’adresse de votre site, et je vous remets une copie complète du site. Je le laisse en ligne encore 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme vous me demandez de commencer tout de suite, vous payez seulement le travail déjà fait, au prorata. Le nom de domaine déjà réservé (l’adresse de votre site) reste à votre nom pour un an, et à votre charge.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `${eur(creation.prix)} € une fois pour le site. Si je m’occupe de tout, ajoutez ${eur(tranquille.month)} € ou ${eur(evolution.month)} € par mois selon la formule choisie. Avec ${tranquille.name}, la première année revient à ${eur(creation.prix + 12 * tranquille.month)} €, ou à ${eur(creation.prix + parAn(tranquille))} € si vous payez la formule à l’année. En création seule, vous ne payez que le site. La boutique en ligne et le ${packSeo.name}, si vous en prenez, se paient une seule fois.` },
    { q: 'Quelle formule choisir ?', a: `Prenez ${tranquille.name}, à ${eur(tranquille.month)} € par mois, si vous voulez un site entretenu et à jour sans y penser. Choisissez ${evolution.name}, à ${eur(evolution.month)} € par mois, si vous voulez que votre site grandisse : vos demandes passent en premier, et une nouvelle page pour Google s’ajoute chaque semaine. Les deux sont sans engagement, et vous pouvez changer en cours de route.` },
    { q: `Que comprend la formule ${tranquille.name} ?`, a: `Tout ce qui garde votre site en ligne et à jour. Elle comprend l’hébergement (l’endroit où votre site reste accessible jour et nuit), le nom de domaine (son adresse), les sauvegardes (des copies de sécurité), la sécurité, la surveillance et la maintenance, c’est-à-dire les vérifications techniques régulières qui gardent le site en état de marche. Vos modifications sont incluses, sans limite, et en ligne en ${delaiT} au plus.` },
    { q: `Et la formule ${evolution.name} ?`, a: `Elle reprend tout ce que comprend ${tranquille.name}. En plus, vos demandes de modification passent en priorité, avec un délai moyen de ${delaiE} au lieu de ${delaiT} au plus. Chaque semaine, une page SEO s’ajoute aussi à votre site : une page de plus pour être trouvé sur Google.` },
    { q: 'Les modifications sont-elles limitées ?', a: `Non. Avec les deux formules, vous demandez autant de modifications que vous voulez. Ajouter un texte ou des photos, changer un horaire, ajouter une page tant que le site reste dans ses ${creation.pages} pages : tout cela compte comme une modification. Seules une refonte complète ou une fonction nouvelle, comme une prise de rendez-vous, se font sur devis.` },
    { q: 'Le nom de domaine et l’hébergement sont-ils compris ?', a: 'Oui, si vous me confiez la mise en ligne. Le nom de domaine, c’est l’adresse de votre site, comme votre-nom.fr : vous le choisissez en commandant, et je le réserve à votre nom. L’hébergement, c’est l’endroit où votre site est rangé pour rester visible 24 h/24. Les deux sont offerts la première année, sauf si vous prenez la boutique en ligne, puis votre formule les prend en charge, sans supplément. En création seule, vous gardez les vôtres.' },
    { q: 'J’ai déjà mon nom de domaine et mon hébergement. Comment faire ?', a: `Choisissez « Je m’en occupe moi-même » en commandant : c’est la création seule. Vous ne payez que votre site, ${eur(creation.prix)} €, sans formule au mois, avec ${paiement.acompte} % à la commande puis le reste à la réception, en une fois ou en ${durees} fois sans frais. Une fois le site terminé, je vous donne son code : tous ses fichiers et une sauvegarde complète, avec une courte notice pour l’installer. Vous l’installez vous-même ou avec l’aide de votre hébergeur, qui a souvent des guides gratuits pour cela. Ensuite, la maintenance, la sécurité et les modifications ne sont pas comprises, mais vous pourrez prendre une formule plus tard.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous préférez. À l’année, vous payez ${12 - annuel.moisOfferts} mois et ${annuel.moisOfferts} sont offerts : ${eur(parAn(tranquille))} € pour ${tranquille.name}, ${eur(parAn(evolution))} € pour ${evolution.name}. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'J’ai un code promo ou un code de parrainage. Où le mettre ?', a: `Dans la case « Code promo ou parrainage », en bas de la page, juste au-dessus du bouton Commander. Je vérifie le code tout de suite. Un code promo réduit le prix de la création. Un code de parrainage vous donne ${moisOffert}, à vous comme à la personne qui vous a recommandé.` },
    { q: 'Et pour une boutique en ligne ?', a: `C’est une option à ${eur(creation.boutique)} €, payée une fois, soit ${eur(boutique)} € avec le site. Vous avez un catalogue de vos produits, un panier, le paiement en ligne, la gestion des commandes et des e-mails envoyés tout seuls à vos clients. ${champi}, le vendeur de ma petite bande, s’en occupe avec vous. Votre formule au mois reste la même.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site fait à la main ?`, a: `Parce que j’ai passé beaucoup de temps à programmer ma petite bande : des automatisations qui font tout ce qui se répète. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages avec référencement coûte souvent entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, et une agence demande davantage. Chez moi, c’est ${eur(creation.prix)} €, et votre site est quand même conçu, relu et testé par moi. Pas de magie, juste de l’organisation.` },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif de commande montre tout : le site, la boutique si vous l’ajoutez, et votre formule si vous en choisissez une. Un devis n’arrive que pour un gros chantier, comme refaire tout le site, et vous l’acceptez ou non avant que je commence.' },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous faites votre demande dans votre espace client, et ${bricou}, le constructeur de ma petite bande, prépare la modification. Un aperçu est créé, c’est-à-dire une prévisualisation de la page modifiée, et vous pouvez le regarder. Je reçois ensuite la proposition et je la vérifie : sans refus de ma part sous ${VERIF}, elle est validée puis mise en ligne. Si ${bricou} ne peut pas la faire, je m’en occupe à la main.` },
    { q: 'En combien de temps est-ce fait ?', a: `Avec ${tranquille.name}, votre modification est en ligne en ${delaiT} au plus. Avec ${evolution.name}, vos demandes passent avant les autres : comptez entre ${delaiE.replace(' à ', ' et ')} en moyenne. Je vous préviens dès que c’est en ligne.` },
    { q: 'Puis-je ajouter une page à mon site ?', a: `Oui, c’est une modification comme une autre : vous la demandez depuis votre espace client, sans rien payer de plus. La seule limite, ce sont les ${creation.pages} pages de votre site.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucune formule active. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre formule tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: `Non, il est compris avec votre formule. Vous y demandez vos modifications, vous suivez leur avancement et vous retrouvez vos factures et votre lien de parrainage. ${cerise}, la secrétaire de ma petite bande, vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour.` },
  ],
  seo: [
    { q: 'C’est quoi, le SEO ?', a: `C’est tout ce qui aide votre site à être trouvé plus facilement sur Google. Des titres clairs, des pages qui répondent aux questions de vos clients, un site rapide : Google aime tout cela. Votre site en a les bases dès sa création, et ${lumi}, l’étoile de Google de ma petite bande, prépare vos pages SEO.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Je déclare votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'Comment avoir plus de pages pour Google ?', a: `Il y a trois façons, qui s’additionnent. Les pages que vous n’utilisez pas parmi les ${creation.pages} de votre site deviennent des pages SEO, faites pour vous rendre visible sur Google. Le ${packSeo.name} en ajoute ${packSeo.pages} pour ${eur(packSeo.price.once)} €, payés une fois : vous le commandez depuis votre espace client, au moment qui vous convient. La formule ${evolution.name}, elle, en ajoute une chaque semaine.` },
    { q: 'C’est quoi, une page SEO ?', a: `Une page qui répond à une recherche précise de vos clients sur Google, comme un service dans votre ville ou une question qu’on vous pose souvent. Elle a un titre clair et renvoie vers vos services. ${lumi} la prépare, et je la relis avant sa mise en ligne.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté, et ${mirette}, l’observatrice de ma petite bande, suit les visites de votre site pour repérer ce qui peut être amélioré.` },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Je peux le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site à ${eur(creation.prix)} € fait par mes soins. Écrivez-moi pour en parler.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont mes automatisations, des programmes que j’ai écrits un par un puis dessinés en petits monstres. ${bandeComprise}.${bandeBoutique ? ` ${bandeBoutique}` : ''} Je vérifie tout ce qu’ils font.` },
    { q: 'Les petits monstres font-ils mon site ?', a: `Non. C’est moi qui conçois votre site et qui fais les choix. ${bricou} m’aide à le construire, et le reste de la bande s’occupe de ce qui se répète autour. La relecture et les vérifications, c’est moi.` },
    { q: 'Les petits monstres peuvent-ils se tromper ?', a: 'Oui, comme tout programme automatique. C’est pour ça que je reçois chaque proposition et que je la vérifie avant sa mise en ligne. Ils vont vite, mais c’est moi qui garde la main.' },
    { q: 'Mes clients verront-ils que des automatisations ont servi ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins cher qu’une agence ?', a: 'Parce que je travaille autrement. Ma petite bande d’automatisations se charge des tâches répétitives, et je traite en direct avec des hébergeurs français, les entreprises qui gardent les sites en ligne. Je n’ai ni local à payer ni équipe à faire tourner. Pour un très gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, c’est vous qui construisez le site, le mettez à jour et écrivez pour Google, souvent le soir. Chez moi, vous décrivez ce que vous voulez et je le fais. Vous n’avez aucun outil à apprendre.' },
    { q: 'Et par rapport à un freelance ?', a: 'Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Avec mes formules, je garde votre site en ligne, protégé et à jour, et vos modifications sont incluses, sans limite. Vous connaissez le prix à l’avance.' },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Votre nom de domaine, l’adresse de votre site, est à votre nom et se transfère où vous voulez. Je vous remets aussi les fichiers du site pour le faire héberger ailleurs, c’est-à-dire le mettre en ligne chez un autre prestataire. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou il donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${moisOffert} sur votre formule.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
    { q: 'Y a-t-il une remise pour un deuxième site ?', a: `Oui. La création de votre deuxième site coûte ${fidelite.remiseSecondSite} % de moins. C’est ma façon de remercier les clients qui reviennent.` },
  ],
};
