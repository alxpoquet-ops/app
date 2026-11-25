// Mentions légales, politique de confidentialité, conditions générales de vente
// ⚠️ Les éléments entre accolades proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
// Règles : aucun tiret long, aucun point-virgule, phrases courtes, rien d'invérifiable. Chaque terme technique est
// expliqué la première fois qu'il apparaît dans un article. Le nom de marque vient de site.name.
const cfg = require('../config');
const { site, paiement, fidelite, forfaits, fractionne, bande, limites, aLaDemande, creationSeule } = cfg;
const L = site.legal;
const contact = site.email ? `e-mail à ${site.email} ou le formulaire de contact (${site.url}/contact/)` : `le formulaire de contact (${site.url}/contact/)`;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;
const UPDATED = '2026-11-24'; // mentions légales : 24 novembre 2026, le SIREN de l'entreprise individuelle (le SIRET de l'activité est en cours)
const UPDATED_CONF = '2026-11-24'; // politique de confidentialité : 24 novembre 2026, les outils au mois (comptes sans site, réseaux reliés, photos, avis et devis confiés aux outils). Avant : offre du 19 novembre 2026 (abonnement facultatif, paiement des extras par carte).
const UPDATED_CGV = '2026-11-25'; // 25 novembre 2026 : plus d'appel avant la création (article 11), chaque site relu par un autre outil avant la livraison (article 15). 24 novembre 2026, tard : vérification par Alex (retirée le 25). Au soir : les outils mis de côté (article 20 gardé pour les abonnements en cours, avec une phrase en tête). Plus tôt le 24 novembre : article 20, les outils au mois (essai de 14 jours sans carte, abonnement outil par outil, limites, rétractation). 23 novembre 2026 : la bande fait et relit le travail (Alex pour les cas délicats), bouton de résiliation, rétractation des extras, formulaire type, garantie de conformité ; conditions générales : une seule offre, le Site Essentiel avec l'option e-commerce (21 novembre 2026)
// La petite bande (config.bande) : six Minis Monstres, présentés par leur prénom et leur rôle. Le parrainage est retiré (19 novembre 2026).
// Une seule mention du système automatisé qui les fait fonctionner : l'article 15 des conditions générales
// (règlement européen sur ces systèmes, obligation de transparence). La politique de confidentialité nomme le fournisseur.

// L'offre du 21 novembre 2026 : un seul site payé une fois, le Site Essentiel (config.offreSite), avec l'option e-commerce (type
// 'boutique'). Le Site Visibilité est retiré : les pages pour Google sont l'extra « page de visibilité Google ». Puis deux façons de faire vivre le site : Autonomie (config.creationSeule, sans abonnement, export du site remis au client)
// ou Mini (config.forfaits[0], au mois, sans engagement). L'abonnement est facultatif. Trois extras (config.aLaDemande non retirés) :
// la page de visibilité Google, payée une fois par carte depuis l'espace client, la traduction anglaise et la fonctionnalité
// spécifique, sur devis. Les délais des modifications sont des délais habituels, jamais garantis.
// Tous les nombres viennent de src/config.js, pour que les CGV suivent les prix.
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l, mot = 'et') => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${mot} ${l[l.length - 1]}` : l.join(''));
const EN_FOIS = `en ${fractionne.fois} fois avec ${fractionne.organismes}`; // par un organisme externe, sur la page de paiement
const EN_FOIS_MAJ = EN_FOIS.charAt(0).toUpperCase() + EN_FOIS.slice(1);
const ESS = cfg.offreSite.site, BOU = cfg.offreSite.avecBoutique, ECO = cfg.offreSite.option; // le site, le site avec l'option, l'option
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const dom = mini.domaine || 2; // le nom de domaine fourni par nos soins : en plus, par mois
const avecDom = mini.month + dom; // le forfait Mini avec le nom de domaine // abonnement Mini, facultatif
const AUTO = creationSeule.name; // sans abonnement : Autonomie
const DATE_OFFRE = '19 novembre 2026'; // nouvelle offre : clause de transition (article 7)
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
const listeDelais = `${ESS.delai}, avec ou sans l’option ${minus(ECO.name)}`;
const DATE_OFFRE_SITE = '21 novembre 2026'; // un seul site : clause de transition pour les sites commandés avant (article 7)
const tvaMention = L.tva || 'non applicable, art. 293 B du CGI';
// Ce que comprend chaque site : la liste vient de config.types (inclus), la première version et les modifications sont à l'article 11 et 12.
const inclusDe = (t) => t.inclus.map((x) => `- ${x.replace(/\*$/, '').replace('à votre activité', 'à l’activité du client').replace('vos informations et vos photos', 'les informations et les photos du client').replace('par vous-même', 'par le client lui-même')}`).join('\n');
// Les extras encore proposés (config.aLaDemande, non retirés) : un prix à la page, ou un devis.
const extras = aLaDemande.filter((x) => !x.retire);
const pageGoogle = extras.find((x) => x.id === 'packseo') || { name: 'Page de visibilité Google', prix: 0 };
const listeExtras = extras
  .map((x) => (x.devis
    ? `- **${x.name}** : sur devis, gratuit et sans engagement.`
    : `- **${x.name}, ${eur(x.prix)} € la ${x.unite || 'page'}**, sans abonnement : ${(x.inclus || []).map(minus).join(', ')}.`))
  .join('\n');
// La petite bande, par prénom et par rôle. Ce que fait chacun est écrit ici pour les CGV.
const ROLE_CGV = {
  support: 'répond aux questions dans la bulle d’aide',
  constructeur: 'aide le client à formuler ses demandes de modification et les réalise',
  ecrivain: 'prépare les contenus, aide à rédiger les textes et améliore leur lisibilité',
  observateur: 'prépare les pages de visibilité Google et soigne le référencement local',
  organisateur: 'classe les contenus, organise les pages et range la boutique et ses commandes',
  extras: 'présente les extras et prépare les devis',
};
const presente = (b) => `- **${b.nom}, ${minus(b.role)}** : ${ROLE_CGV[b.id] || minus(b.court.replace(/\.$/, ''))}.`;
const laBande = bande.map(presente).join('\n');
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const mirette = monstre('observateur').nom;

// Les outils au mois (config.outilsOffre, décision d'Alex du 24 novembre 2026) : article 20 des conditions générales et point 7
// de la politique de confidentialité. Vendus à tous, avec ou sans site. Essai gratuit sans carte, un par outil et par compte.
// Les réseaux et la photo à publier : ce que fait vraiment src/wordpress/aled08-espace/includes/reseaux.php (jetons dans la fiche
// du client, jamais affichés, effacés quand il délie le réseau ; photo gardée environ une heure, puis effacée par une tâche planifiée).
const OO = cfg.outilsOffre || { actif: false, outils: [], bande: {}, essaiJours: 14 };
const outilsPrets = (OO.outils || []).filter((o) => o.statut === 'pret');
const outilsBientot = (OO.outils || []).filter((o) => o.statut === 'bientot');
const AVEC_OUTILS = !!OO.actif && outilsPrets.length > 0;
// Outils mis de côté (actif: false, 24 novembre 2026 au soir) : l'article 20 reste, avec une phrase en tête, pour les abonnements
// déjà pris (son ancre #20-les-outils-au-mois reste valable). Le reste des conditions ne parle plus des outils.
const ARTICLE_OUTILS = outilsPrets.length > 0;
const outilOffert = outilsPrets.find((o) => o.inclusSite);
const listeOutils = outilsPrets
  .map((o) => `- **${o.nom}, ${eur(o.prix)} € par mois**${o.inclusSite ? `, compris sans supplément tant que le client a le forfait ${mini.name}` : ''} : jusqu’à ${o.limite} ${o.unite} par mois.`)
  .join('\n');
const nomsBientot = liste(outilsBientot.map((o) => `« ${o.nom} »`));
// Mentions légales : le SIRET s'affiche dès qu'il est dans config.js (14 chiffres). D'ici là, le SIREN de l'entreprise individuelle.
const SIRET_PRET = /^\d{14}$/.test(String(L.siret || '').replace(/\s/g, ''));
const ligneSiren = SIRET_PRET
  ? `- **SIRET** : ${L.siret}`
  : `- **SIREN** : ${L.siren || 'en cours d’attribution'} (le numéro SIRET de l’activité de création de sites est ${L.siret || 'en cours d’attribution'})`;
const exploitant = /individuel/i.test(L.status || '') ? `${site.owner} EI` : site.owner; // l'entrepreneur individuel signe « EI »

module.exports = [
  {
    path: '/mentions-legales/',
    name: 'Mentions légales',
    title: `Mentions légales | Les Minis Monstres`,
    description: `Mentions légales du site des Minis Monstres : éditeur, hébergeur, prestataire de paiement, propriété intellectuelle, responsabilité et médiation.`,
    lead: 'Informations sur l’éditeur et l’hébergeur du site, conformément à la loi pour la confiance dans l’économie numérique.',
    updated: UPDATED,
    body: `## Éditeur du site

- **Nom commercial** : Les Minis Monstres
- **Exploitant** : ${exploitant}
- **Forme juridique** : ${L.status}
- **Adresse** : ${addr}, France
- **Contact** : ${contact}
${ligneSiren}
- **TVA** : ${tvaMention}

## Directeur de la publication

${L.publicationDirector}.

## Hébergeur

${L.host}.

## Paiement en ligne

Les paiements sur ce site sont traités par Stripe (Stripe Payments Europe Ltd, Dublin, Irlande). Les données bancaires sont saisies sur les pages sécurisées de Stripe et ne transitent pas par ce site.

## Propriété intellectuelle

Les textes, la mise en page, le logo, les personnages et les éléments graphiques de ce site appartiennent aux Minis Monstres, sauf mention contraire. Toute reproduction sans accord écrit est interdite.

## Responsabilité

Les informations du site sont données à titre indicatif et peuvent évoluer. Seul le récapitulatif de commande accepté engage les deux parties. Le comparatif avec les autres solutions décrit des façons de travailler. Quand le site cite un prix du marché, c’est une fourchette courante, donnée comme ordre de grandeur : elle ne vise aucun concurrent en particulier.

## Médiation

Pour un litige avec un consommateur, un médiateur de la consommation peut être saisi gratuitement. Ses coordonnées figurent dans les [conditions générales de vente](/conditions-generales/#19-mediation-et-litiges).`,
  },
  {
    path: '/politique-de-confidentialite/',
    name: 'Politique de confidentialité',
    title: `Politique de confidentialité | Les Minis Monstres`,
    description: `Comment les Minis Monstres traitent vos données : devis, commande, paiement, nom de domaine, espace client, outils et réseaux reliés. Aucun traceur publicitaire.`,
    lead: 'Ce que deviennent les informations que vous m’envoyez, combien de temps je les garde, et vos droits.',
    updated: UPDATED_CONF,
    body: `## 1. Responsable du traitement

${site.owner}, Les Minis Monstres, ${addr}. Contact : ${contact}.

## 2. Les données que je collecte

- **Demande de contact ou de devis** : votre nom, votre e-mail, votre téléphone si vous le donnez, vos choix (site, abonnement, nom de domaine) et votre message.
- **Commande en ligne** : prénom, nom, e-mail, téléphone, adresse postale, nom de votre activité, vos choix, le nom de domaine souhaité, votre message et un éventuel code promo. L’adresse postale sert à la facture et à la réservation du nom de domaine.
- **Espace client** : vos identifiants, vos demandes de modification (texte et photos), vos messages dans la bulle d’aide et la date de votre dernière connexion.${AVEC_OUTILS ? `
- **Outils au mois** : ce que vous confiez à un outil (une photo, un texte, le texte d’un avis Google avec le prénom de son auteur s’il y figure, des devis de fournisseurs collés pour les comparer), la courte description de votre activité si vous l’écrivez, le dernier résultat obtenu et le nombre d’utilisations du mois. Un compte peut servir aux outils seuls, sans site.
- **Réseaux sociaux reliés** : le nom de vos comptes ou de vos pages, les clés qui permettent d’y publier et la liste de vos dernières publications (voir le point 7).` : ''}
- **Paiement** : je ne reçois jamais votre numéro de carte ni votre IBAN (voir le point 4).

## 3. Pourquoi je les utilise

Pour vous répondre et préparer votre récapitulatif. Pour exécuter votre commande : créer le site, réserver le nom de domaine, gérer votre abonnement si vous en avez un, vos demandes de modification et vos extras.${AVEC_OUTILS ? ' Pour faire marcher les outils que vous essayez ou que vous payez au mois, et suivre leur limite.' : ''} Pour établir les factures et les garder le temps prévu par la loi. Rien d’autre : pas de publicité, pas de revente, pas de profilage.

Ces traitements sont nécessaires au contrat que vous passez avec moi, ou à sa préparation quand vous demandez un devis. La conservation des factures répond à une obligation légale.

## 4. Paiement par Stripe

Les paiements sont confiés à Stripe, prestataire de paiement. Au moment de payer, vous saisissez vos données bancaires sur une page sécurisée de Stripe. Elles ne passent pas par mon site et les Minis Monstres ne les stockent jamais. Je reçois seulement l’état du paiement (réussi, en attente, refusé) et la facture correspondante. Stripe traite ces données selon sa propre politique de confidentialité, consultable sur [stripe.com/fr/privacy](https://stripe.com/fr/privacy).

## 5. Nom de domaine

Votre nom de domaine est l’adresse de votre site, par exemple votre-activite.fr. Quand vous vérifiez s’il est libre, le nom saisi est envoyé au registre officiel de l’extension, l’organisme qui gère ces adresses : l’AFNIC pour les .fr, Verisign pour les .com et les .net, PIR pour les .org. L’envoi passe par RDAP, le service public qui indique si un nom est déjà pris. Cette vérification part de votre navigateur pendant que vous tapez, puis de mon serveur au moment de la commande, pour confirmer la disponibilité. Seul le nom recherché est transmis.

Pour réserver le nom de domaine, je transmets vos coordonnées de titulaire (prénom, nom, adresse, e-mail, téléphone) au bureau d’enregistrement, l’entreprise qui enregistre le nom pour vous, et au registre de l’extension. Sans cela, le nom de domaine ne peut pas être enregistré à votre nom. En règle générale, les coordonnées d’un particulier ne sont pas publiées dans l’annuaire public du registre.

## 6. Espace client et comptes

Votre compte est créé à la commande${AVEC_OUTILS ? ', ou sans rien commander, par exemple pour essayer un outil' : ''}, avec votre adresse e-mail et le mot de passe que vous choisissez. Les demandes envoyées depuis l’espace client (texte et photos) servent uniquement à réaliser la modification demandée.

Certains petits monstres fonctionnent avec Claude, un service de la société Anthropic. C’est le cas de ${cerise}, qui vous répond dans la bulle d’aide, et de ${monstre('constructeur').nom}, qui vous aide à formuler vos demandes de modification. Quand vous écrivez dans la bulle ou que vous demandez une modification, le texte, la photo ou l’adresse de page que vous donnez sont envoyés à Claude pour préparer la réponse ou le résumé de votre demande. L’envoi passe par une liaison chiffrée, c’est-à-dire protégée contre les regards extérieurs. Ces éléments ne servent à rien d’autre. D’après les conditions d’Anthropic pour les professionnels, ces données ne servent pas à entraîner ses modèles. Évitez d’y mettre des informations sensibles : santé, coordonnées bancaires, nom complet d’un de vos clients.

Un compte sans aucune connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec les demandes et les photos qu’il contient. Un e-mail vous prévient 30 jours avant. Il suffit de vous connecter pour le conserver.

${AVEC_OUTILS ? `## 7. Les outils et vos réseaux sociaux

Les outils au mois (article 20 des conditions générales) préparent des publications, des réponses aux avis, des fiches produits ou la comparaison de vos devis. Ce que vous leur confiez sert seulement à préparer le résultat demandé.

- **Ce qui part chez Claude** : comme pour la bulle d’aide (point 6), le texte, la photo, l’avis ou le devis donné à un outil est envoyé à Claude pour préparer le résultat. La photo est d’abord réduite, et la copie faite pour l’envoi est effacée aussitôt. Certains outils travaillent directement dans votre navigateur, par exemple pour recadrer une photo ou créer un QR code : rien ne m’est alors envoyé. Un devis contient souvent les coordonnées d’un fournisseur : collez seulement ce qui sert à comparer.
- **Ce qui reste dans votre compte** : le dernier résultat obtenu, pour le retrouver si la connexion coupe, remplacé par le suivant. Le nombre d’utilisations de chaque outil dans le mois, pour suivre sa limite. La courte description de votre activité, si vous l’écrivez, pour préremplir les outils.
- **Vos comptes de réseaux sociaux** : pour publier sans quitter votre espace, vous reliez un compte une fois. Pour Facebook, Instagram et LinkedIn, vous donnez votre accord sur le site du réseau, qui me remet un jeton d’accès, une clé qui permet de publier pour vous. Pour Bluesky, vous créez un mot de passe d’application, différent de votre mot de passe habituel. Pour Mastodon, vous créez un code d’accès sur votre serveur. Ces clés restent dans votre compte, sur le serveur du site, et ne sont jamais affichées. Elles servent quand vous publiez. Elles sont effacées dès que vous déliez le réseau, ou avec votre compte. Vous pouvez aussi retirer votre accord depuis le réseau lui-même. Le jeton de LinkedIn expire de lui-même au bout de deux mois environ.
- **La photo à publier** : elle est réduite, puis déposée sur le serveur du site à une adresse impossible à deviner, le temps que les réseaux viennent la chercher. Elle est effacée automatiquement après une heure environ.
- **Vos publications** : une fois publiés, votre texte et votre photo sont chez le réseau, sous votre nom, et suivent ses propres règles de confidentialité. Je garde la liste de vos 30 dernières publications (le réseau, le lien et le début du texte), que vous retrouvez dans l’outil. Si vous partagez avec le bouton Partager de votre téléphone, le texte va directement de votre téléphone à l’application choisie.
- **Essai et abonnement** : l’essai gratuit ne demande aucune donnée bancaire. L’abonnement qui suit est payé par Stripe (point 4).

` : ''}## ${AVEC_OUTILS ? 8 : 7}. Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Commandes et comptes clients : toute la durée de la relation, puis 5 ans pour les pièces du contrat et 10 ans pour les factures, comme la loi l’impose.
- Comptes inactifs : supprimés après 12 mois sans connexion ni abonnement actif (point 6).${AVEC_OUTILS ? `
- Clés d’accès à vos réseaux sociaux : jusqu’à ce que vous déliiez le réseau, ou jusqu’à la suppression de votre compte.
- Photo à publier : une heure environ.
- Liste de vos publications : les 30 dernières.
- Photo, texte, avis ou devis confiés à un outil : rien n’est gardé après le travail. Seul le dernier résultat reste, remplacé par le suivant.` : ''}

## ${AVEC_OUTILS ? 9 : 8}. Destinataires

Vos données sont destinées aux Minis Monstres uniquement. Elles transitent par l’hébergeur du site, ${L.host}, par la messagerie qui reçoit les demandes, par Stripe pour le paiement et par le bureau d’enregistrement pour le nom de domaine. Ce que vous écrivez dans la bulle d’aide ou dans une demande de modification${AVEC_OUTILS ? ', et ce que vous confiez à un outil,' : ''} passe par Anthropic (Claude), société américaine : ce traitement peut avoir lieu hors de l’Union européenne, dans le cadre prévu par ses conditions de traitement des données.${AVEC_OUTILS ? ' Quand vous publiez, votre publication et la clé du réseau sont envoyées au réseau que vous avez choisi parmi ceux que vous avez reliés : Meta (Facebook et Instagram), LinkedIn, Bluesky ou votre serveur Mastodon. Ces réseaux la traitent ensuite selon leurs propres règles, parfois hors de l’Union européenne.' : ''} Vos données ne sont jamais vendues ni cédées.

## ${AVEC_OUTILS ? 10 : 9}. Cookies et stockage local

Ce site n’utilise aucun traceur publicitaire ni outil de mesure d’audience. Il ne pose aucun cookie, ce petit fichier qu’un site range dans votre navigateur, tant que vous n’êtes pas connecté à votre espace client.

- Quand vous vous connectez à l’espace client, un cookie de connexion est posé. Il est nécessaire au service et sert uniquement à vous garder connecté.

## ${AVEC_OUTILS ? 11 : 10}. Vos droits

Vous pouvez demander l’accès à vos données, leur correction, leur suppression ou une copie, et vous opposer à un traitement, en écrivant par ${contact}. Je réponds sous un mois. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: `Conditions générales de vente | Les Minis Monstres`,
    description: `Conditions générales de vente des Minis Monstres : commande en ligne, site à prix fixe, option e-commerce, abonnement facultatif, extras, outils au mois.`,
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif de commande.',
    updated: UPDATED_CGV,
    body: `## 1. Objet

Ces conditions s’appliquent à toute commande passée auprès des Minis Monstres : création d’un site internet, abonnement au mois, extras et services liés${AVEC_OUTILS ? ', ainsi que les outils au mois, ouverts à tous, avec ou sans site (article 20)' : ''}. Elles complètent le récapitulatif de commande, qui précise le site choisi, la formule retenue pour la suite (le forfait ${AUTO} ou le forfait ${mini.name}) et les prix.

## 2. Commande en ligne

La commande se passe sur le site, en trois étapes : le choix du site, les coordonnées avec la création de l’espace client, puis le paiement sécurisé. Le client commande d’abord son site, avec ou sans l’option ${minus(ECO.name)} (article 3). Il choisit ensuite la façon de le faire vivre : le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, au mois. Avec le forfait ${mini.name}, il indique son nom de domaine s’il en a un, ou en choisit un, fourni en supplément (article 10). Le total s’affiche en dernier. Le prix du site se règle le jour même, en une fois ou en plusieurs fois (article 5). Avant de payer, le client voit un récapitulatif complet, avec le montant réglé le jour même et le prix du forfait qui suivra. S’il a un code promo (article 4), il le saisit dans la case « Code promo » avant de commander.

En cliquant sur « Commander et payer », le client accepte ces conditions et passe une commande ferme. Une fois le paiement fait, il reçoit un e-mail de confirmation avec le récapitulatif et la référence de commande, à rappeler dans les échanges.

Une commande peut aussi être passée par e-mail ou par message. Elle est alors ferme quand le client accepte le récapitulatif par écrit et règle le prix de création.

## 3. Prix

Les prix sont en euros. La TVA n’est pas applicable (article 293 B du Code général des impôts) tant que l’entreprise bénéficie de la franchise de TVA. Si cette situation change, les prix affichés sont mis à jour. Les commandes déjà passées gardent leur prix.

L’offre est la même pour tous les clients. Elle tient en deux parties : la création du site, réglée à la commande, puis la façon de le faire vivre. Le client choisit entre le forfait ${AUTO}, sans abonnement, et le forfait ${mini.name}. L’abonnement est facultatif.

**Le site.** Un seul site est proposé : sa création se règle à la commande, sans abonnement. Il est assemblé à partir de modules déjà conçus par les Minis Monstres (par exemple l’accueil, la présentation, les services et tarifs, la galerie, les questions fréquentes et le contact), puis rempli avec les informations et les photos fournies par le client.

**${ESS.name}, ${eur(ESS.price)} €.** Il comprend :

${inclusDe(ESS)}

**Option ${minus(ECO.name)}, ${eur(ECO.prix)} € de plus**, soit ${eur(BOU.price)} € avec le site. Elle se choisit à la commande. Elle ajoute :

${ECO.inclus.map((x) => `- ${x.replace(/par vous$/, 'par le client')}`).join('\n')}

**Première version et modifications.** Le site est livré en ligne dans une première version, faite avec les réponses et les photos du client. Avec le forfait ${mini.name}, le client modifie lui-même, sans limite, les textes et les photos de ses pages depuis son espace client, et demande les autres changements (article 12). Les modifications portent sur le site commandé : elles ne permettent pas de changer de site ni d’ajouter ce qui n’a pas été commandé.

**Export du site.** L’export est possible, avec ou sans l’option ${minus(ECO.name)}. Il s’agit d’une copie complète du site, avec ses fichiers et une sauvegarde, prête à installer chez un hébergeur. Le client la reçoit avec le forfait ${AUTO}, et à la fin de son abonnement s’il en a un (article 8).

**Visibilité Google.** La visibilité Google, aussi appelée référencement, désigne ce qui aide un site à être trouvé plus facilement sur Google. Le ${ESS.name} en pose les bases. Pour être trouvé sur plus de recherches, le client ajoute des pages de visibilité Google, une fois son site en ligne, avec l’extra prévu (voir ci-dessous). Aucune page n’est ajoutée sans sa demande.

**Gestion de la boutique en ligne.** Avec l’option ${minus(ECO.name)}, les Minis Monstres configurent la boutique. Le client gère ensuite son catalogue lui-même, depuis l’onglet « Ma boutique » de son espace client : ses produits et ses services, ses prix, ses promotions, la livraison et le suivi de ses commandes. Le nombre d’articles n’est pas limité. Le client installe lui-même ses moyens de paiement (Stripe, PayPal) depuis cet espace. Ses clés de paiement sont enregistrées sur son propre site, jamais chez les Minis Monstres. Les Minis Monstres ne promettent ni un volume de ventes ni un résultat.

**Les extras.** Les extras sont des services à la carte. Aucun n’est imposé, et aucun n’est renouvelé sans que le client l’ait demandé. Il y en a trois :

${listeExtras}

La ${minus(pageGoogle.name)} se commande depuis l’espace client. Elle est payée par carte bancaire au moment de la commande, en un seul paiement. Elle n’est jamais facturée au mois. En la commandant, le client demande qu’elle soit faite tout de suite : il perd son droit de rétractation une fois la page entièrement livrée (article 9). Les extras sur devis sont réalisés après l’accord écrit du client sur le prix.

**Le forfait ${AUTO}, ${eur(creationSeule.month)} € par mois.** Le client paie seulement son site, sans abonnement. Il gère lui-même son hébergement, son nom de domaine, ses sauvegardes et ses mises à jour. Les Minis Monstres ne fournissent ni hébergement ni nom de domaine. Une fois le site validé, le client reçoit l’export de son site, avec une courte notice d’installation. Il fait l’installation lui-même, ou avec l’aide de son hébergeur. La maintenance, la sécurité et les modifications ne sont pas comprises. Le client peut prendre le forfait ${mini.name} plus tard.

**Le forfait ${mini.name}, ${eur(mini.month)} € par mois.** Les Minis Monstres installent le site, le mettent en ligne et le font vivre (article 6). Si le client n’a pas de nom de domaine, les Minis Monstres le lui fournissent pour ${eur(dom)} € de plus par mois, soit ${eur(avecDom)} € par mois (article 10).

**Devis.** Une refonte complète du site, une traduction ou une fonction nouvelle, comme une prise de rendez-vous, fait l’objet d’un devis. Le client l’accepte avant le début du travail.

## 4. Codes promo

Les Minis Monstres peuvent proposer des codes promo, par exemple lors d’une opération ponctuelle. Un code promo donne une remise sur la création du site, quel que soit le site choisi. Il ne s’applique pas à l’abonnement, ni aux extras commandés plus tard.

Le client saisit le code au moment de commander. Le code est vérifié, et le récapitulatif montre le prix après remise avant le paiement. Le prix de création payé à la commande est calculé sur ce prix remisé (article 5).

## 5. Paiement de la création

**Le prix payé à la commande.** Le prix de création du site se paie en entier à la commande, sur la page de paiement sécurisée. Les options payées une fois, s’il y en a, se règlent en même temps. Aucune autre somme n’est due pour la création, ni pendant le travail ni à la livraison du site.

Sur la page de paiement, le client choisit sa façon de payer :

- **En une fois** : par carte bancaire, Apple Pay, Google Pay ou PayPal, selon les moyens proposés sur cette page.
- **${EN_FOIS_MAJ}** : ce paiement fractionné est proposé par ces organismes, selon leurs propres conditions et après leur accord. L’organisme verse aussitôt le prix entier aux Minis Monstres. Le client le rembourse ensuite à l’organisme, en ${fractionne.fois} fois. Le contrat de paiement fractionné est conclu entre le client et l’organisme. Les Minis Monstres n’y sont pas partie.

Ce choix est ouvert avec le forfait ${mini.name} comme avec le forfait ${AUTO} (article 3). Le forfait ${mini.name}, lui, se paie à part, chaque mois, à partir de la mise en ligne du site (article 6).

**En cas de rétractation.** Si le client se rétracte dans les 14 jours, le prix payé lui est remboursé en entier (article 9). S’il a demandé que la création démarre tout de suite, les Minis Monstres retiennent le montant qui correspond au travail déjà fait à la date de la rétractation, au prorata du prix de création. Le reste lui est remboursé. Une fois le site entièrement livré à sa demande, il ne peut plus se rétracter. Le remboursement se fait par le moyen de paiement utilisé à la commande.

Exemple pour un ${ESS.name} avec l’option ${minus(ECO.name)}, soit ${eur(BOU.price)} €, sans code promo : le client paie ${eur(BOU.price)} € à la commande, en une fois, ou choisit de les régler ${EN_FOIS}. S’il prend le forfait ${mini.name}, il paie ensuite ${eur(mini.month)} € par mois à partir de la mise en ligne, ou ${eur(avecDom)} € avec le nom de domaine fourni.

Les extras commandés plus tard ne suivent pas cette règle : la ${minus(pageGoogle.name)} est payée en entier, par carte, quand le client la commande (article 3).

## 6. L’abonnement

Le forfait ${mini.name} est facultatif. Le client peut le prendre au moment de la commande, avec son nom de domaine, ou plus tard. C’est le seul abonnement proposé pour le site${AVEC_OUTILS ? ' (les outils ont leur propre abonnement, article 20)' : ''}. Il démarre à la mise en ligne du site : le client enregistre alors sa carte pour le forfait. Il est sans engagement (article 8).

**Le forfait ${mini.name}, ${eur(mini.month)} € par mois.** Il comprend :

- **L’hébergement** : le site reste accessible 24 h/24, avec le HTTPS, le petit cadenas qui protège les échanges avec les visiteurs.
- **Les sauvegardes automatiques** : des copies de sécurité du site, faites régulièrement.
- **La sécurité** : le site est protégé contre les attaques.
- **La maintenance technique** : des contrôles et des mises à jour faits régulièrement, pour que le site reste en état de marche.
- **L’espace client**, avec la bulle d’aide (article 13).
- **Les Minis Monstres au service du client** : une question posée reçoit une réponse.
- **Les modifications**, incluses et demandées directement depuis l’espace client. Le client a une demande en cours à la fois (article 12).

Le délai de traitement des modifications est un délai habituel, donné à titre indicatif. Il ne constitue pas une garantie.

**Paiement.** L’abonnement est prélevé d’avance, chaque mois : ${eur(mini.month)} € par mois pour le forfait ${mini.name}, ou ${eur(avecDom)} € par mois quand les Minis Monstres fournissent le nom de domaine (article 10).

Les paiements sont confiés à Stripe, le prestataire de paiement en ligne, par carte bancaire ou par prélèvement SEPA, c’est-à-dire directement sur le compte bancaire. Les Minis Monstres ne voient pas et ne conservent pas les données bancaires. Chaque facture est envoyée par e-mail et reste disponible dans l’espace client.

En cas d’échec de paiement, le client est prévenu par e-mail. Si rien n’est régularisé sous 30 jours, le site peut être mis en pause jusqu’au règlement.

## 7. Clients inscrits avant le ${DATE_OFFRE}

Un client inscrit avant le ${DATE_OFFRE} garde l’abonnement, les options et les extras qu’il a déjà, aux mêmes conditions, tant qu’il ne les retire pas. Un abonnement déjà en cours continue à son prix actuel. Les anciens extras ne sont plus proposés à la vente.

Un site commandé avant le ${DATE_OFFRE_SITE}, par exemple un Site Visibilité, est réalisé et livré comme prévu dans sa commande, à son prix.

## 8. Engagement, résiliation et fin de l’abonnement

L’abonnement est sans engagement. Le client peut l’arrêter à tout moment, par e-mail, par message ou avec le bouton « Résilier mon forfait » de son espace client. L’arrêt prend effet à la fin de la période déjà payée.

Quand le client paie la création en plusieurs fois par un organisme externe, ses échéances sont dues à cet organisme, selon le contrat passé avec lui. Cela ne crée aucun engagement de durée sur le forfait.

La fin de l’abonnement met fin à l’hébergement du site par les Minis Monstres, à son entretien et aux modifications. Le client reçoit l’export de son site (textes, images, pages), pour le faire héberger où il veut. Le nom de domaine lui appartient : il peut le transférer vers le prestataire de son choix. L’hébergement par les Minis Monstres s’arrête 30 jours après la fin de l’abonnement.

## 9. Droit de rétractation

Le client qui commande à distance dispose de 14 jours pour se rétracter, sans avoir à se justifier. Un message par ${contact} suffit.

En commandant, le client choisit lui-même quand la création commence.

- **Démarrer maintenant** : le client demande expressément que la création commence avant la fin de ces 14 jours. Il reconnaît qu’il perd son droit de rétractation dès que le site est entièrement livré. S’il se rétracte avant cette livraison, le travail déjà réalisé est retenu, au prorata du prix de création, et le reste lui est remboursé (article 5).
- **Attendre 14 jours** : la création commence à la fin du délai. Le client garde son droit de rétractation jusque-là, avec un remboursement intégral, et les délais de création (article 11) courent à partir de ce moment.

Aucun de ces deux choix n’est coché d’avance. Le nom de domaine déjà réservé, l’adresse du site, reste à sa charge, car il est enregistré à son nom et pour un an.

Pour se rétracter, le client peut, s’il le souhaite, utiliser ce modèle, envoyé par ${contact} :

> À l’attention des Minis Monstres (Alexandre Poquet EI, ${site.address.postalCode} ${site.address.city}) : je vous notifie par la présente ma rétractation du contrat portant sur la prestation ci-dessous. Commandée le : … Référence de commande : … Nom du client : … Adresse du client : … Date : …
${AVEC_OUTILS ? `
Pour un outil au mois, les règles de rétractation sont précisées à l’article 20.
` : ''}
## 10. Nom de domaine

Le nom de domaine est l’adresse du site sur internet. Le client en est le titulaire. Avec le forfait ${mini.name}, les Minis Monstres y figurent comme contact technique, pour pouvoir le gérer. Le nom est réservé après le premier paiement, s’il est encore disponible à ce moment-là.

Le nom de domaine n’est pas compris dans le prix du forfait ${mini.name}. Si le client n’en possède pas, les Minis Monstres lui fournissent un nom de domaine standard en .fr, .com, .net ou .org, enregistré à son nom, pour ${eur(dom)} € de plus par mois, soit ${eur(avecDom)} € par mois au total. Ce supplément couvre le renouvellement annuel du nom tant que l’abonnement est actif. Si le client utilise son propre nom de domaine, le forfait reste à ${eur(mini.month)} € par mois. Les autres extensions et les noms dits « premium », vendus plus cher par les registres (les organismes qui gèrent chaque extension), font l’objet d’un devis.

Si le client possède déjà un nom de domaine, il peut le transférer vers les Minis Monstres ou le garder chez son prestataire et le faire pointer vers le site. Les Minis Monstres lui envoient les réglages à faire. Avec le forfait ${AUTO}, le client gère son nom de domaine sans les Minis Monstres (article 3).

## 11. Création du site, première version et délais

La création commence par le questionnaire de création, rempli par le client dans son espace client. Le client y fournit ses textes, photos et informations, ou les prépare avec les Minis Monstres à partir de ses explications. La création démarre dès l’envoi de ce questionnaire. Les délais annoncés (${listeDelais}) sont indicatifs. Ils courent à partir de cet envoi, une fois les éléments reçus.

Le site est mis en ligne dans une première version, présentée au client par e-mail (article 3), ou remis sous forme d’export avec le forfait ${AUTO}. Le client l’ajuste ensuite à son goût, comme le prévoit l’article 12.

## 12. Modifications

**Ce qui est inclus.** Les modifications sont incluses dans le forfait ${mini.name}. Une modification est un changement demandé sur le site déjà en ligne : ajouter ou changer un texte ou des photos, mettre à jour une information. Ajouter une ${minus(pageGoogle.name)} n’en est pas une : c’est un extra (article 3). Une refonte complète fait l’objet d’un devis. Sans abonnement, le client fait lui-même ses modifications.

**Modification par le client.** Avec le forfait ${mini.name}, le client peut aussi changer lui-même les textes et les photos de son site, depuis son espace client (bouton « Modifier mon site moi-même »). Ces changements sont publiés tout de suite, sous sa responsabilité. Le reste passe par une demande de modification.

**Déroulé.** Chaque modification suit les mêmes étapes :

1. Le client fait sa demande dans son espace client.
2. ${monstre('constructeur').nom}, un petit monstre de la bande (article 15), l’aide à la formuler clairement et lui pose les questions utiles.
3. Le client confirme la demande résumée par ${monstre('constructeur').nom}.
4. Les Minis Monstres réalisent la modification. Elle est relue par un second outil avant que le client soit prévenu, et Alexandre Poquet traite lui-même les demandes délicates.
5. Le client reçoit un e-mail dès qu’elle est en ligne.

Le client peut annuler une demande tant qu’elle n’est pas commencée.

**Demandes en cours.** Le client a une demande en cours à la fois. La suivante peut être envoyée dès qu’une demande est terminée.

**Délai.** Aucun délai fixe n’est garanti pour une modification. Chaque demande est traitée dans un délai raisonnable, qui dépend de sa complexité et des éléments fournis par le client. Le client suit l’avancement dans son espace client.

Une demande sur devis suit le délai indiqué dans le devis.

## 13. Espace client et compte

Pour commander, le client crée son espace client, avec son adresse e-mail et un mot de passe qu’il choisit (ou se connecte à celui qu’il a déjà). C’est sa page personnelle, protégée par un mot de passe. Il y suit sa commande et ses factures. Avec le forfait ${mini.name}, il y fait ses demandes de modification et y gère son abonnement. C’est aussi là qu’il commande une ${minus(pageGoogle.name)} (article 3), et, avec le ${BOU.name}, qu’il gère son catalogue dans l’onglet « Ma boutique ». La bulle d’aide de ${cerise} y répond à ses questions, dans la limite de ${limites.bulleJour} messages par jour.${AVEC_OUTILS ? ' Pour utiliser les outils au mois (article 20), un espace client suffit : il se crée gratuitement, sans commander de site.' : ''} Il garde ses identifiants pour lui et prévient les Minis Monstres en cas de doute sur leur usage.

Un compte sans connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec ses demandes et ses photos. Le client est prévenu par e-mail 30 jours avant. Une connexion suffit pour annuler la suppression. Les factures sont conservées en dehors du compte, le temps prévu par la loi.

## 14. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images, logos et produits qu’il fournit. Il reste responsable des informations légales propres à son activité : mentions exigées par la loi, conditions de vente de sa boutique, prix affichés.

## 15. Versions et outils automatisés

Avec le forfait ${mini.name}, chaque version du site est conservée et peut être restaurée sur demande.

Alex a conçu la méthode de création et en reste responsable. Le travail est fait par des outils qu’il a mis au point, présentés sur le site comme une petite bande de six Minis Monstres :

${laBande}

Dans cet article, « les petits monstres » désigne l’ensemble de ces outils, bulle d’aide comprise${AVEC_OUTILS ? ', ainsi que les outils au mois de l’article 20' : ''}.

Les petits monstres sont des outils automatisés, dont certains reposent sur un système d’intelligence artificielle, qui peuvent se tromper. Chaque site est relu par un autre outil avant d’être livré au client. Les modifications et les pages de visibilité Google sont relues par un autre outil avant d’être mises en ligne, selon les règles écrites par Alex, qui traite lui-même les cas délicats (réclamation, remboursement, demande hors forfait). Le site est livré en première version, que le client fait ensuite ajuster (articles 11 et 12). Les textes et les conseils que donnent les outils sont des propositions : le client les relit et reste responsable de ce qu’il publie. Ces outils ne donnent pas de conseil juridique, médical ou comptable.

## 16. Visibilité Google (référencement)

La visibilité Google, ou référencement, c’est le travail qui aide un site à être trouvé sur Google. Le ${ESS.name} est construit pour cela : pages rapides, titres et descriptions écrits pour Google. Les pages de visibilité Google commandées comme extras (article 3), payées une fois, ouvrent le site à plus de recherches. ${mirette}, la spécialiste visibilité de la petite bande, les prépare.

Dans tous les cas, la visibilité Google est une obligation de moyens : les Minis Monstres font de leur mieux et appliquent les bonnes pratiques, sans garantir une position donnée sur Google.

## 17. Fidélité

Un deuxième site commandé par le même client bénéficie de ${fidelite.remiseSecondSite} % de remise sur la création. Cet avantage n’est pas convertible en argent.

## 18. Responsabilité

Les Minis Monstres mettent tout en œuvre pour que le site reste disponible et sauvegardé tant qu’ils l’hébergent. Les Minis Monstres ne peuvent pas être tenus responsables d’une panne de l’hébergeur (l’entreprise qui garde le site en ligne), d’un registre de noms de domaine ou du service de paiement, ni des contenus fournis par le client${AVEC_OUTILS ? ', ni d’une panne ou d’un changement de règles d’un réseau social ou de Google' : ''}. Avec le forfait ${AUTO}, le client est seul responsable de l’hébergement, des sauvegardes et des mises à jour de son site après la remise de l’export. Un éventuel dédommagement ne peut pas dépasser les sommes versées au titre de l’abonnement${AVEC_OUTILS ? ' (forfait du site ou outils au mois)' : ''} au cours des 12 derniers mois, ou le prix du site en l’absence d’abonnement, sauf si la loi en dispose autrement.

Garantie légale de conformité. Le client consommateur bénéficie de la garantie légale de conformité des contenus et services numériques (articles L224-25-12 et suivants du Code de la consommation). Si le site ne correspond pas à ce qui a été commandé, il obtient sa mise en conformité, sans frais ; à défaut, une réduction du prix ou la résolution du contrat. Cette garantie s’ajoute aux modifications prévues à l’article 12.

## 19. Médiation et litiges

En cas de désaccord, le client écrit d’abord par ${contact} : la plupart des questions se règlent en quelques échanges. Si la réponse ne lui convient pas, le client consommateur peut saisir gratuitement un médiateur de la consommation : ${L.mediator}. Le droit français s’applique.${ARTICLE_OUTILS ? `

## 20. Les outils au mois
${AVEC_OUTILS ? '' : `
**Les outils ne sont pas proposés pour l’instant.** Aucun essai ni abonnement ne peut être pris. Un abonnement déjà en cours s’arrête depuis l’espace client, dans Mon compte, et plus rien n’est prélevé ensuite. Cet article reste valable pour ces abonnements, jusqu’à leur arrêt.
`}
**Objet.** Les Minis Monstres ${AVEC_OUTILS ? 'proposent aussi' : 'ont proposé'} de petits outils en ligne, utilisés depuis l’espace client : préparer des publications pour les réseaux sociaux, demander des avis Google et y répondre, préparer des fiches produits, comparer des devis de fournisseurs. ${AVEC_OUTILS ? 'Ils sont ouverts' : 'Ils étaient ouverts'} à tous, professionnels et particuliers, avec ou sans site chez les Minis Monstres. Ce sont des petits monstres au sens de l’article 15.

**Compte.** Un espace client est nécessaire (article 13). Il se crée gratuitement, sans commander de site.

**Les outils et leur prix.** Chaque outil se prend seul, par abonnement au mois. L’usage est compris dans le prix, sans jeton ni supplément, dans une limite raisonnable par mois, affichée dans chaque outil :

${listeOutils}

**${OO.bande.nom}, ${eur(OO.bande.prix)} € par mois** : tous les outils en vente, avec les mêmes limites, et ceux qui seront mis en vente ensuite, dès leur sortie.${outilsBientot.length ? ` ${nomsBientot} ${outilsBientot.length > 1 ? 'sont annoncés' : 'est annoncé'}, mais pas encore en vente : rien n’est facturé pour ${outilsBientot.length > 1 ? 'eux' : 'lui'}, et aucune date de sortie n’est promise.` : ''}

**Essai gratuit.** Chaque outil s’essaie gratuitement pendant ${OO.essaiJours} jours, sans carte bancaire. Il y a un essai par outil et par compte. À la fin de l’essai, l’outil s’arrête tout seul, sans rien coûter. Pour continuer, le client s’abonne lui-même depuis son espace client : aucun paiement ne démarre sans cette démarche.

**Paiement et facture.** L’abonnement à un outil se paie d’avance, chaque mois, par Stripe (article 6). Si le client a déjà le forfait ${mini.name}, ses outils s’ajoutent à la même facture mensuelle. Sinon, ils ont leur propre facture chaque mois. Chaque facture est envoyée par e-mail et reste dans l’espace client. En cas d’échec de paiement, le client est prévenu par e-mail, et l’outil peut être mis en pause jusqu’au règlement.

**Limite du mois.** Une fois la limite d’un outil atteinte, il reprend le mois suivant. Rien n’est facturé en plus. Le client qui a besoin de davantage écrit aux Minis Monstres.

**Sans engagement.** Chaque outil s’arrête séparément, à tout moment, depuis l’espace client. L’arrêt prend effet à la fin de la période déjà payée : l’outil reste utilisable jusque-là. Les autres outils et le forfait du site continuent.${outilOffert ? ` ${outilOffert.nom}, compris avec le forfait ${mini.name}, s’arrête avec ce forfait, sauf si le client choisit de s’y abonner à part.` : ''}

**Changement de prix.** Si le prix d’un outil change, le client abonné est prévenu par e-mail au moins 30 jours avant. Il peut arrêter l’outil avant que le nouveau prix s’applique.

**Disponibilité et résultats.** Les Minis Monstres font de leur mieux pour que les outils restent disponibles, sans garantir qu’ils fonctionnent sans interruption : maintenance, panne d’un prestataire, panne ou changement de règles d’un réseau social ou de Google. Si un réseau ferme la publication directe, le client peut encore partager avec le bouton Partager de son téléphone. Les outils ne garantissent aucun résultat : ni nombre de vues, d’abonnés, d’avis ou de ventes, ni note sur Google.

**Ce que le client publie.** Les textes, réponses et fiches préparés par un outil sont des propositions (article 15). Le client les relit et peut les modifier. C’est lui qui décide de les publier, avec le bouton « Tout publier » ou en les partageant lui-même : les Minis Monstres ne publient rien à sa place. Le client reste seul responsable de ce qu’il publie, des photos qu’il envoie et des prix qu’il affiche (article 14).

**Comptes reliés.** Pour publier sans quitter son espace, le client relie ses comptes (Facebook, Instagram, LinkedIn, Bluesky, Mastodon) en donnant son autorisation sur le réseau. Il peut les délier à tout moment depuis l’outil, ou retirer son autorisation depuis le réseau. La politique de confidentialité explique ce que deviennent ces autorisations.

**Règles des réseaux et de Google.** Le client respecte les conditions d’utilisation de chaque réseau social et de Google. Pour les avis, il ne donne rien en échange d’un avis (remise, cadeau, participation à un jeu), il ne demande pas d’avis seulement aux clients satisfaits, il n’écrit pas d’avis sur sa propre activité et ne publie pas de faux avis, que la loi interdit aussi.

**Suspension en cas d’abus.** Les Minis Monstres peuvent suspendre un outil en cas d’usage contraire à ces conditions, à la loi ou aux règles d’un réseau : envois en masse non sollicités, contenu illicite, faux avis, usage par un robot ou pour contourner les limites. Le client est prévenu, avec le motif, avant la suspension, sauf urgence, et peut s’expliquer. Si l’abus est grave ou continue, l’abonnement à cet outil peut être résilié.

**Droit de rétractation.** Le client consommateur dispose de 14 jours pour se rétracter à partir du jour où il s’abonne à un outil, avec un simple message ou le modèle de l’article 9. L’essai gratuit, lui, ne coûte rien et s’arrête quand le client veut. En s’abonnant, le client demande expressément que l’outil fonctionne tout de suite, avant la fin de ce délai. S’il se rétracte ensuite, il paie seulement la part du mois déjà écoulée, au prorata, et le reste lui est remboursé.

**Données.** Les photos, textes, avis et devis confiés à un outil servent seulement à préparer le résultat demandé. La politique de confidentialité précise ce qui est gardé, combien de temps, et qui le reçoit.` : ''}`,
  },
];
