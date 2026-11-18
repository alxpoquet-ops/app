// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (2 à 4 phrases) et honnêtes, en mots de tous les jours. Chaque terme technique
// (SEO, nom de domaine, hébergement, sauvegarde, maintenance…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 18 novembre 2026 : le Site Internet Professionnel à prix fixe (creation.pages pages, adapté à tous les supports), une seule
// option à la commande (la boutique en ligne, payée une fois, avec creation.boutiqueProduits produits), puis le choix « On s'occupe de tout »
// (un seul abonnement au mois sans engagement : Mini, id 'base', modifications faites par Alex en 48 h au plus, une demande à la fois, nom de domaine
// offert tant que l'abonnement est actif) ou « Je m'en occupe moi-même » (création seule, le code du site est remis au client). Tout le reste
// (pages en plus, pages visibilité Google, article de blog, analyse de Mirette, deux demandes à la fois…) se prend en extra depuis l'espace client
// (config.aLaDemande et options au mois). La petite bande (config.bande) : les automatisations d'Alex, présentées
// par leur prénom. On n'écrit jamais « IA » ici.
const cfg = require('../config');
const { forfaits, annuel, lissage, options, paiement, fidelite, creation, marche, bande, evenement, limites, aLaDemande } = cfg;

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

// Un seul abonnement depuis le 18 novembre 2026 : Mini (id 'base'). Maxi est retiré.
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
// Les extras (config.js) : ceux payés une fois (aLaDemande) et ceux au mois (options)
const extra = (id) => aLaDemande.find((x) => x.id === id && !x.retire) || {};
const extraMois = (id) => options.find((o) => o.id === id && o.quand === 'mois' && !o.retire) || { price: {} };
const seomois = extraMois('seomois'), seosemaine = extraMois('seosemaine'), analyse = extraMois('mirette'), deux = extraMois('deux'), stock = extraMois('stock');
const articleBlog = extra('article'), pageEnPlus = extra('page');
const packsDe = (x) => liste((x.packs || []).filter((n) => n > 1), 'ou'); // « 5 ou 10 »
// La page SEO supplémentaire (config.options, id 'packseo') ne se choisit pas à la commande : elle se commande plus tard,
// à l'unité, depuis l'espace client (quand: 'espace'). La seule option à la commande est la boutique en ligne.
const packSeo = options.find((o) => o.id === 'packseo' && !o.retire) || { name: 'Page SEO optimisée', price: { once: 0 }, pages: 1 };
const prixPage = eur(packSeo.price.once); // prix d'une page SEO optimisée
const boutique = creation.prix + creation.boutique;
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
const bandeExtras = bande.filter((b) => b.option && b.option !== 'boutique').map((b) => `${b.nom} (${minus(b.role)}) ${mission(b)} avec ${b.option === 'seomois' ? 'les extras pages SEO' : `l’extra « ${analyse.name} »`}.`).join(' ');
const bandeBoutique = bande.filter((b) => b.option === 'boutique').map((b) => `${b.nom} (${minus(b.role)}) arrive avec la boutique en ligne.`).join(' ');

module.exports = {
  creation: [
    { q: `Que comprend le site à ${eur(creation.prix)} € ?`, a: `Le ${NOM_SITE} compte ${creation.pages} pages, avec un design fait pour vous, adapté à tous les supports : ordinateur, tablette et téléphone. Il a aussi un formulaire de contact, pour que vos clients vous écrivent directement. Je vous accompagne du début à la fin, avec les Minis Monstres. Si vous prenez un abonnement, le nom de domaine (l’adresse de votre site) est offert tant que l’abonnement est actif, et l’hébergement (l’endroit où il reste en ligne 24 h/24) est compris. Sinon, je vous remets le code de votre site, prêt à installer.` },
    { q: `Et si j’ai besoin de plus de ${creation.pages} pages ?`, a: `Vous ajoutez des pages quand vous voulez, depuis votre espace client. Une page en plus coûte ${eur(pageEnPlus.prix)} €. Une page SEO optimisée, écrite pour une recherche que font vos clients sur Google, coûte ${prixPage} € la page, seule ou en packs de ${packsDe(packSeo)}. Ce sont des extras : rien n’est obligatoire, et rien ne s’ajoute tout seul.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous me racontez votre métier, et ${plume}, la rédactrice de ma petite bande, m’aide à en tirer des textes clairs. Pour les photos, je choisis des images que l’on a le droit d’utiliser, adaptées à votre activité. Vous mettrez les vôtres quand vous voudrez : c’est une modification, donc c’est inclus.` },
    { q: 'Quelles options puis-je ajouter ?', a: `Une seule à la commande : la boutique en ligne, à ${eur(creation.boutique)} € payés une fois, pour vendre vos produits sur internet. Vous ajoutez vos articles vous-même depuis votre espace client : une photo, une description, un prix. ${creation.boutiqueProduits} emplacements sont compris, puis ${eur(creation.boutiqueSlot)} € l’emplacement en plus, payé une fois et à vous pour toujours. Vos produits sont présentés en images, avec un panier, le paiement en ligne, la gestion des commandes et des e-mails envoyés tout seuls à vos clients. Vos clients achètent sans créer de compte. Par défaut, il n’y a pas de stock à tenir : on ne compte pas les quantités, et un produit qui manque passe simplement en épuisé. L’extra « ${stock.name} » décompte le stock à chaque vente. Dans votre espace client, un onglet « Ma boutique » s’ajoute : vous y réglez vos codes promo, vos soldes, un bandeau d’annonce et le mode vacances, sans que ça compte dans vos modifications. Vos commandes apparaissent aussi dans votre tableau de bord. ${champi}, le vendeur de ma petite bande, s’en occupe avec vous. Le prix de votre abonnement, lui, ne change pas.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site fait à la main ?`, a: `Parce que j’ai passé beaucoup de temps à programmer ma petite bande : des automatisations qui font tout ce qui se répète. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages avec référencement coûte souvent entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, et une agence demande davantage. Chez moi, c’est ${eur(creation.prix)} €, et votre site est quand même conçu, relu et testé par moi. Pas de magie, juste de l’organisation.` },
    { q: 'Qu’est-ce que je vois dans le tableau de bord ?', a: 'Le tableau de bord est compris dans l’abonnement, boutique ou pas. Vous y voyez vos visiteurs jour par jour, d’où ils arrivent (Google, réseaux sociaux, lien direct), vos pages les plus vues et vos meilleures recherches sur Google. Les visites sont comptées sans cookie. Avec une boutique, vos commandes s’y ajoutent.' },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif de commande montre tout : le site, la boutique si vous l’ajoutez, et l’abonnement choisi s’il y en a un. Un devis n’arrive que pour un gros chantier, comme refaire tout le site, et vous l’acceptez ou non avant que je commence.' },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous écrivez votre demande à ${cerise}, la secrétaire de ma petite bande, dans votre espace client. Elle vous pose quelques questions pour bien comprendre, puis vous résume la demande. Vous la confirmez, et elle me la transmet. C’est moi qui fais la modification, à la main, et je vous préviens quand elle est en ligne.` },
    { q: 'Puis-je annuler une demande ?', a: 'Oui, tant que je ne l’ai pas commencée. Un bouton Annuler s’affiche à côté de la demande, dans votre espace client. Une fois que j’ai commencé, écrivez-moi et nous en parlons.' },
    { q: 'En combien de temps est-ce fait ?', a: `Une modification peut prendre ${delaiModif}. Vous avez une demande en cours à la fois, ou deux avec l’extra « ${deux.name} ». Pour passer devant les autres, il y a l’extra « ${extra('urgent').name} » : votre demande est faite en 24 heures, du lundi au vendredi.` },
    { q: 'Puis-je ajouter une page à mon site ?', a: `Oui, avec l’extra « ${pageEnPlus.name} », à ${eur(pageEnPlus.prix)} € la page. Vous le demandez depuis votre espace client, je prépare la page avec vos textes et vos photos, puis je la publie. Votre site compte ${creation.pages} pages au départ.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre abonnement tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: `Non, il est compris dans votre abonnement. Vous y demandez vos modifications, vous suivez leur avancement et vous retrouvez vos factures et votre lien de parrainage. ${cerise}, la secrétaire de ma petite bande, vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour. C’est aussi là que vous prenez vos extras, quand vous en avez besoin.` },
  ],
  seo: [
    { q: 'C’est quoi, le SEO ?', a: `C’est tout ce qui aide votre site à être trouvé plus facilement sur Google. Des titres clairs, des pages qui répondent aux questions de vos clients, un site rapide : Google aime tout cela. J’y veille sur chaque page de votre site, et ${lumi}, l’étoile de Google de ma petite bande, choisit les sujets de vos pages SEO.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Je déclare votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'Comment avoir plus de pages pour Google ?', a: `Les pages se prennent en extra, depuis votre espace client, au moment qui vous convient. Une page SEO optimisée coûte ${prixPage} €, seule ou en packs de ${packsDe(packSeo)}. Pour un rythme régulier, il y a « ${seomois.name} » à ${eur(seomois.price.month)} € par mois, ou « ${seosemaine.name} » à ${eur(seosemaine.price.month)} € par mois. Par exemple, une page sur un service dans votre ville, une FAQ ou un petit guide.` },
    { q: 'C’est quoi, une page SEO ?', a: `Une page qui répond à une recherche précise de vos clients sur Google, comme un service dans votre ville ou une question qu’on vous pose souvent. Elle a un titre clair et renvoie vers vos services. ${lumi} en choisit le sujet, puis je l’écris et je la publie.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté, et avec l’extra « ${analyse.name} », ${mirette}, l’observatrice de ma petite bande, suit les visites de votre site pour repérer ce qui peut être amélioré.` },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Je peux le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site à ${eur(creation.prix)} € fait par mes soins. Écrivez-moi pour en parler.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont mes automatisations, des programmes que j’ai écrits un par un puis dessinés en petits monstres. ${bandeComprise}. ${bandeExtras}${bandeBoutique ? ` ${bandeBoutique}` : ''} Ils vous aident, mais c’est moi qui modifie votre site.` },
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
