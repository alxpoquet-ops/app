// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (1 à 3 phrases) et honnêtes, « nous / on » (jamais « je », Alex est nommé), vouvoiement, en mots de tous les jours. Chaque terme technique
// (nom de domaine, hébergement, sauvegarde, maintenance…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 19 novembre 2026 : trois sites payés une fois (config.types : Site Essentiel, Site Visibilité, Site Boutique),
// puis deux façons de faire vivre le site : Autonomie (config.creationSeule, 0 € par mois, le client gère tout et reçoit
// l'export de son site) ou Mini (config.forfaits[0], au mois, sans engagement, modifications incluses, une demande à la fois).
// L'abonnement est facultatif. Trois extras seulement (config.aLaDemande non retirés) : la page de visibilité Google,
// payée une fois par carte depuis l'espace client, la traduction anglaise et la fonctionnalité spécifique, sur devis.
// La petite bande (config.bande) compte six Minis Monstres, présentés par leur prénom (Pépite, la spécialiste des extras, depuis le 19 novembre 2026).
// Le parrainage est retiré du site (seule la remise sur un deuxième site reste). C'est Bricou qui fait les modifications ; Alex conçoit et contrôle.
// Tour global du 19 novembre 2026 : questions regroupées (59 → 44), même ordre que l'offre (le site, puis Autonomie ou Mini,
// enfin les extras), « visibilité sur Google » plutôt que « référencement », « modification » plutôt que « retouche ».
const cfg = require('../config');
const { forfaits, annuel, lissage, paiement, fidelite, creation, marche, bande, limites, aLaDemande, types, creationSeule } = cfg;

const { sourcesInline, INDEPENDANT_DES: INDEP } = require('../lib/components');
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

// Les trois sites (config.types) : Site Essentiel, Site Visibilité, Site Boutique.
const T = (id) => types.find((t) => t.id === id) || {};
const ESS = T('une-page'), VIS = T('vitrine'), BOU = T('boutique');
// Un seul abonnement, facultatif : Mini (id 'base'). Sans abonnement : Autonomie (config.creationSeule).
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const AUTO = creationSeule.name;
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
// Les extras encore proposés (config.aLaDemande, non retirés).
const extra = (id) => aLaDemande.find((x) => x.id === id && !x.retire) || {};
const pageGoogle = extra('packseo'), anglais = extra('anglais'), specifique = extra('specifique');
const prixPage = eur(pageGoogle.prix); // prix d'une page de visibilité Google, payée une fois

// La petite bande : chaque Mini Monstre par son prénom, avec son rôle (config.bande).
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const bricou = monstre('constructeur').nom;
const plume = monstre('ecrivain').nom;
const mirette = monstre('observateur').nom;
const mochi = monstre('organisateur').nom;
// Ce que fait chacun, en quelques mots (écrit ici pour la FAQ, différent des phrases de config.js).
const MISSION = {
  support: 'répond à vos questions et note vos demandes',
  constructeur: 'monte votre site et fait vos modifications',
  ecrivain: 'aide à écrire vos textes',
  observateur: 'prépare vos pages pour Google',
  organisateur: 'range vos pages, vos produits et vos commandes',
  extras: 'présente les extras et prépare vos devis',
};
const mission = (b) => MISSION[b.id] || minus(b.court.replace(/\.$/, ''));
const presente = (b) => `${b.nom} (${minus(b.role)}) ${mission(b)}`;
const bandeComprise = liste(bande.map(presente));

module.exports = {
  creation: [
    { q: 'Quels sites proposez-vous, et à quel prix ?', a: `Trois sites, payés une seule fois. Le ${ESS.name}, à ${eur(ESS.price)} €, tient sur une page : il vous fait exister sur internet. Le ${VIS.name}, à ${eur(VIS.price)} €, compte jusqu’à ${creation.pages} pages pour être trouvé sur Google. Le ${BOU.name}, à ${mille(BOU.price)} €, ajoute une boutique complète pour vendre sur internet.` },
    { q: 'Lequel choisir ?', a: `Le ${ESS.name} si l’on vous cherche surtout par votre nom. Le ${VIS.name} si vous comptez sur Google pour trouver de nouveaux clients : chaque page peut répondre à une recherche précise. Le ${BOU.name} si vous voulez encaisser des commandes en ligne.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous nous racontez votre métier, et ${plume}, la rédactrice de la bande, aide à en tirer des textes clairs. Pour les photos, nous choisissons des images libres de droits, que vous remplacerez par les vôtres quand vous voudrez.` },
    { q: 'Combien de modifications puis-je demander avant la mise en ligne ?', a: `Autant que vous voulez, jusqu’à ce que vous validiez votre site : textes, photos, couleurs, mise en page. Une fois le site en ligne, les changements passent par l’abonnement ${mini.name}.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat se vaut : moderne, rapide, soigné. Notre méthode est rodée, donc nous allons plus vite et nous coûtons moins cher. Pour une application sur mesure ou un très gros catalogue, un développeur reste le bon choix, et nous vous le dirons.' },
    { q: 'Comment se passe le paiement du site ?', a: `Vous réglez ${paiement.acompte} % en commandant. Le reste se paie quand vous recevez votre site, d’un coup ou en ${durees} fois sans frais. Si vous prenez l’abonnement ${mini.name}, il démarre ce jour-là, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: `Tout se lit de haut en bas sur la page Créer mon site. D’abord vous choisissez votre site, ensuite ${AUTO} ou ${mini.name}, et le total s’affiche. Vous payez l’acompte en ligne, et un e-mail de confirmation arrive aussitôt.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, avec ou sans abonnement. Pour un ${VIS.name} à ${eur(VIS.price)} € : ${eur(acompte(VIS.price))} € à la commande, puis ${eur(lisse(VIS.price, D1))} € par mois pendant ${D1} mois, ou ${eur(lisse(VIS.price))} € pendant ${LN} mois, sans frais.` },
    { q: 'Suis-je obligé de prendre un abonnement ?', a: `Non. Avec ${AUTO}, vous ne payez rien par mois et vous gérez votre site vous-même. L’abonnement ${mini.name} est facultatif et s’arrête quand vous le décidez. Seule exception : si vous payez le site en ${durees} fois, vous restez le temps de ce paiement.` },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe, le service de paiement en ligne, vous envoie la facture par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas, car l’entreprise est en franchise de TVA (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Votre abonnement se termine à la fin de la période en cours. Vous gardez votre nom de domaine (l’adresse de votre site) et vous recevez l’export de votre site, une copie complète prête à installer ailleurs. Le site reste en ligne encore 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme le travail commence tout de suite à votre demande, vous payez seulement ce qui est déjà fait, au prorata. Le nom de domaine déjà réservé reste à votre nom pour un an, et à votre charge.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `Le prix de votre site, une fois : ${eur(ESS.price)} €, ${eur(VIS.price)} € ou ${mille(BOU.price)} €. Ensuite, ${eur(creationSeule.month)} € par mois en ${AUTO}, ou ${eur(mini.month)} € par mois avec ${mini.name}. Pour un ${VIS.name} avec ${mini.name}, la première année revient à ${eur(VIS.price + 12 * mini.month)} €.` },
    { q: `Que comprend l’abonnement ${mini.name} ?`, a: `Tout ce qui garde votre site en ligne et à jour : l’hébergement (l’endroit où votre site reste accessible jour et nuit), le nom de domaine (son adresse), les sauvegardes automatiques, la sécurité et la maintenance technique. Vos modifications sont incluses, une demande à la fois, depuis votre espace client. Il coûte ${eur(mini.month)} € par mois, sans engagement.` },
    { q: `C’est quoi, la formule ${AUTO} ?`, a: `C’est le site sans abonnement : ${eur(creationSeule.month)} € par mois. Une fois le site validé, vous recevez son export, une copie complète avec une courte notice, à installer chez l’hébergeur de votre choix. L’hébergement, le nom de domaine, les sauvegardes et les mises à jour sont alors à votre charge.` },
    { q: 'Quels sont les extras ?', a: `Il y en a trois, jamais imposés. La ${minus(pageGoogle.name)}, à ${prixPage} € la page, se commande dans votre espace client et se paie une fois, par carte. La ${minus(anglais.name)} et la ${minus(specifique.name)}, par exemple une prise de rendez-vous, se font sur devis.` },
    { q: 'Les modifications sont-elles limitées ?', a: `Non, pas avec ${mini.name} : vous en demandez autant que vous voulez, une à la fois, et chacune peut prendre ${delaiModif}. Un texte, des photos, un horaire, une page à corriger : ce sont des modifications. Une nouvelle page pour Google, une traduction ou une refonte complète sont des extras ou un devis.` },
    { q: 'Le nom de domaine et l’hébergement sont-ils compris ?', a: `Oui, avec l’abonnement ${mini.name}, tant qu’il est actif. Le nom de domaine, comme votre-nom.fr, est réservé à votre nom. Vous avez déjà les vôtres ? Choisissez ${AUTO}, et vous les gardez.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous préférez. À l’année, ${annuel.moisOfferts} mois sont offerts : ${mini.name} revient à ${eur(parAn(mini))} € par an au lieu de ${eur(12 * mini.month)} €.` },
    { q: 'J’ai un code promo. Où le mettre ?', a: 'Dans la case « Code promo », juste au-dessus du bouton Commander. Il réduit le prix du site, jamais celui de l’abonnement ni des extras.' },
    { q: 'Et pour une boutique en ligne ?', a: `C’est le ${BOU.name}, à ${mille(BOU.price)} € payés une fois : tout le ${VIS.name}, avec le panier et le paiement en ligne sécurisé. Nous configurons la boutique, puis vous gérez vos produits, vos prix et vos commandes depuis votre espace client, sans limite d’articles.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site vitrine classique ?`, a: `Parce que notre méthode est rodée et que les Minis Monstres se chargent de ce qui se répète. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, contre ${eur(VIS.price)} € pour notre ${VIS.name}. Ces fourchettes viennent de prestataires, donc prudence : des indépendants existent dès ${eur(INDEP)} €. Sources consultées en novembre 2026 : ${sourcesInline()}.` },
    { q: 'Y a-t-il des frais cachés ?', a: `Non. Le récapitulatif de commande montre tout : le site choisi, et l’abonnement ${mini.name} si vous le prenez. Un devis n’arrive que si vous le demandez, et vous l’acceptez ou non avant le début du travail.` },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous écrivez votre demande dans votre espace client. ${cerise}, la secrétaire de la bande, vous aide à la préciser, puis ${bricou}, le constructeur, fait la modification. Vous êtes prévenu quand c’est en ligne.` },
    { q: 'En combien de temps est-ce fait ?', a: `Une modification peut prendre ${delaiModif}. Vous avez une seule demande en cours à la fois : dès qu’elle est terminée, vous envoyez la suivante.` },
    { q: 'Puis-je annuler une demande ?', a: 'Oui, tant qu’elle n’est pas commencée : un bouton Annuler s’affiche à côté de la demande. Une fois le travail lancé, écrivez-nous.' },
    { q: 'Que trouve-t-on dans l’espace client ?', a: `Les onglets Accueil, Demandes, Extras et Mon compte, plus Ma boutique avec le ${BOU.name}. Vous y demandez vos modifications, vous commandez un extra et vous retrouvez vos factures. ${cerise} vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous recevez un e-mail avec un lien pour choisir votre mot de passe. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Vous êtes prévenu par e-mail 30 jours avant, et une simple connexion annule tout.' },
  ],
  seo: [
    { q: 'Comment un site m’aide-t-il à être trouvé sur Google ?', a: `Sans site internet, Google n’a presque rien à montrer quand on cherche votre métier. Avec des titres clairs, des pages qui répondent aux questions de vos clients et un affichage rapide, il comprend ce que vous faites et où. Nous y veillons sur chaque page, et ${mirette}, la spécialiste visibilité de la bande, soigne votre présence locale.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Nous déclarons votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'C’est quoi, une page de visibilité Google ?', a: `Une page qui répond à une recherche précise de vos clients : un service dans votre ville, une question fréquente, un petit guide. Le ${VIS.name} en contient déjà. Pour en ajouter, vous la commandez dans votre espace client, à ${prixPage} € la page, payée une fois : ${mirette} en choisit le sujet avec vous.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: 'Non, et personne ne le peut honnêtement. Nous mettons toutes les chances de votre côté : des pages utiles, que Google comprend, sur un site rapide. Le reste dépend aussi de vos concurrents et du temps.' },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Nous pouvons le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site, à partir de ${eur(ESS.price)} €.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont les six personnages de notre petite bande, chacun avec son rôle. ${bandeComprise}.` },
    { q: 'Qui construit mon site ?', a: `Alex, la personne derrière les Minis Monstres, conçoit votre site et fait les choix avec vous. Les petits monstres l’aident sur ce qui se répète, ${bricou} fait ensuite vos modifications, et Alex contrôle le tout. Rien ne part en ligne sans son accord, ni sans le vôtre.` },
    { q: 'Mes clients verront-ils comment mon site a été fait ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide, à votre nom. De notre côté, nous préférons vous dire comment nous travaillons : vous savez ce que vous achetez.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins chers qu’une agence ?', a: 'Parce que nous travaillons autrement. Les Minis Monstres se chargent des tâches répétitives, et nous traitons en direct avec des hébergeurs français, les entreprises qui gardent les sites en ligne. Pour un très gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, vous construisez le site et vous le tenez à jour, souvent le soir. Chez nous, vous décrivez ce que vous voulez et c’est fait pour vous.' },
    { q: 'Et par rapport à un indépendant ?', a: `Un indépendant crée votre site, puis chaque changement se négocie quand il est disponible. Avec ${mini.name}, votre site reste en ligne et à jour, vos modifications sont incluses, et vous connaissez le prix à l’avance.` },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Votre nom de domaine est à votre nom et se transfère où vous voulez. Vous recevez aussi l’export de votre site, pour le mettre en ligne chez un autre prestataire. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Y a-t-il une remise pour un deuxième site ?', a: `Oui. Votre deuxième site coûte ${fidelite.remiseSecondSite} % de moins : c’est notre façon de remercier les clients qui reviennent.` },
    { q: 'La remise s’applique-t-elle à l’abonnement ?', a: 'Non. Elle porte sur le prix du site, payé une fois. L’abonnement et les extras gardent leur prix affiché.' },
  ],
};
