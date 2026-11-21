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
const UPDATED = '2026-11-15'; // mentions légales
const UPDATED_CONF = '2026-11-19'; // politique de confidentialité : offre du 19 novembre 2026 (abonnement facultatif, paiement des extras par carte). Rien à changer le 21 novembre 2026 (un seul site).
const UPDATED_CGV = '2026-11-21'; // conditions générales : une seule offre, le Site Essentiel avec l'option e-commerce (21 novembre 2026)
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
    : `- **${x.name}, ${eur(x.prix)} € la ${x.unite || 'page'}**, payée une seule fois : ${(x.inclus || []).map(minus).join(', ')}.`))
  .join('\n');
// La petite bande, par prénom et par rôle. Ce que fait chacun est écrit ici pour les CGV.
const ROLE_CGV = {
  support: 'répond aux questions dans la bulle d’aide',
  constructeur: 'aide le client à formuler ses demandes de modification et les transmet à Alexandre Poquet',
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
- **Exploitant** : ${site.owner}
- **Forme juridique** : ${L.status}
- **Adresse** : ${addr}, France
- **Contact** : ${contact}
- **SIRET** : ${L.siret}
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
    description: `Comment les Minis Monstres traitent vos données : devis, commande en ligne, paiement par Stripe, nom de domaine, espace client. Aucun traceur publicitaire.`,
    lead: 'Ce que deviennent les informations que vous m’envoyez, combien de temps je les garde, et vos droits.',
    updated: UPDATED_CONF,
    body: `## 1. Responsable du traitement

${site.owner}, Les Minis Monstres, ${addr}. Contact : ${contact}.

## 2. Les données que je collecte

- **Demande de contact ou de devis** : votre nom, votre e-mail, votre téléphone si vous le donnez, vos choix (site, abonnement, nom de domaine) et votre message.
- **Commande en ligne** : prénom, nom, e-mail, téléphone, adresse postale, nom de votre activité, vos choix, le nom de domaine souhaité, votre message et un éventuel code promo. L’adresse postale sert à la facture et à la réservation du nom de domaine.
- **Espace client** : vos identifiants, vos demandes de modification (texte et photos), vos messages dans la bulle d’aide et la date de votre dernière connexion.
- **Paiement** : je ne reçois jamais votre numéro de carte ni votre IBAN (voir le point 4).

## 3. Pourquoi je les utilise

Pour vous répondre et préparer votre récapitulatif. Pour exécuter votre commande : créer le site, réserver le nom de domaine, gérer votre abonnement si vous en avez un, vos demandes de modification et vos extras. Pour établir les factures et les garder le temps prévu par la loi. Rien d’autre : pas de publicité, pas de revente, pas de profilage.

## 4. Paiement par Stripe

Les paiements sont confiés à Stripe, prestataire de paiement. Au moment de payer, vous saisissez vos données bancaires sur une page sécurisée de Stripe. Elles ne passent pas par mon site et les Minis Monstres ne les stockent jamais. Je reçois seulement l’état du paiement (réussi, en attente, refusé) et la facture correspondante. Stripe traite ces données selon sa propre politique de confidentialité, consultable sur [stripe.com/fr/privacy](https://stripe.com/fr/privacy).

## 5. Nom de domaine

Votre nom de domaine est l’adresse de votre site, par exemple votre-activite.fr. Quand vous vérifiez s’il est libre, le nom saisi est envoyé au registre officiel de l’extension, l’organisme qui gère ces adresses : l’AFNIC pour les .fr, Verisign pour les .com et les .net, PIR pour les .org. L’envoi passe par RDAP, le service public qui indique si un nom est déjà pris. Cette vérification part de votre navigateur pendant que vous tapez, puis de mon serveur au moment de la commande, pour confirmer la disponibilité. Seul le nom recherché est transmis.

Pour réserver le nom de domaine, je transmets vos coordonnées de titulaire (prénom, nom, adresse, e-mail, téléphone) au bureau d’enregistrement, l’entreprise qui enregistre le nom pour vous, et au registre de l’extension. Sans cela, le nom de domaine ne peut pas être enregistré à votre nom. En règle générale, les coordonnées d’un particulier ne sont pas publiées dans l’annuaire public du registre.

## 6. Espace client et comptes

Votre compte est créé automatiquement à la commande, avec votre adresse e-mail. Les demandes envoyées depuis l’espace client (texte et photos) servent uniquement à réaliser la modification demandée.

Certains petits monstres fonctionnent avec Claude, un service de la société Anthropic. C’est le cas de ${cerise}, qui vous répond dans la bulle d’aide, et de ${monstre('constructeur').nom}, qui vous aide à formuler vos demandes de modification. Quand vous écrivez dans la bulle ou que vous demandez une modification, le texte, la photo ou l’adresse de page que vous donnez sont envoyés à Claude pour préparer la réponse ou le résumé de votre demande. L’envoi passe par une liaison chiffrée, c’est-à-dire protégée contre les regards extérieurs. Ces éléments ne servent à rien d’autre. D’après les conditions d’Anthropic pour les professionnels, ces données ne servent pas à entraîner ses modèles. Évitez d’y mettre des informations sensibles : santé, coordonnées bancaires, nom complet d’un de vos clients.

Un compte sans aucune connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec les demandes et les photos qu’il contient. Un e-mail vous prévient 30 jours avant. Il suffit de vous connecter pour le conserver.

## 7. Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Commandes et comptes clients : toute la durée de la relation, puis 5 ans pour les pièces du contrat et 10 ans pour les factures, comme la loi l’impose.
- Comptes inactifs : supprimés après 12 mois sans connexion ni abonnement actif (point 6).

## 8. Destinataires

Vos données sont destinées aux Minis Monstres uniquement. Elles transitent par l’hébergeur du site, ${L.host}, par la messagerie qui reçoit les demandes, par Stripe pour le paiement et par le bureau d’enregistrement pour le nom de domaine. Ce que vous écrivez dans la bulle d’aide ou dans une demande de modification passe par Anthropic (Claude), société américaine : ce traitement peut avoir lieu hors de l’Union européenne, dans le cadre prévu par ses conditions de traitement des données. Elles ne sont jamais vendues ni cédées.

## 9. Cookies et stockage local

Ce site n’utilise aucun traceur publicitaire ni outil de mesure d’audience. Il ne pose aucun cookie, ce petit fichier qu’un site range dans votre navigateur, tant que vous n’êtes pas connecté à votre espace client.

- Quand vous vous connectez à l’espace client, un cookie de connexion est posé. Il est nécessaire au service et sert uniquement à vous garder connecté.

## 10. Vos droits

Vous pouvez demander l’accès à vos données, leur correction, leur suppression ou une copie, et vous opposer à un traitement, en écrivant par ${contact}. Je réponds sous un mois. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: `Conditions générales de vente | Les Minis Monstres`,
    description: `Conditions générales de vente des Minis Monstres : commande en ligne, un site à prix fixe, option e-commerce, abonnement facultatif, extras, rétractation.`,
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif de commande.',
    updated: UPDATED_CGV,
    body: `## 1. Objet

Ces conditions s’appliquent à toute commande passée auprès des Minis Monstres : création d’un site internet, abonnement au mois, extras et services liés. Elles complètent le récapitulatif de commande, qui précise le site choisi, la formule retenue pour la suite (le forfait ${AUTO} ou le forfait ${mini.name}) et les prix.

## 2. Commande en ligne

La commande se passe sur le site, en trois étapes : le choix du site, les coordonnées, puis le paiement sécurisé. Le client commande d’abord son site, avec ou sans l’option ${minus(ECO.name)} (article 3). Il choisit ensuite la façon de le faire vivre : le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, au mois. Avec le forfait ${mini.name}, il indique son nom de domaine s’il en a un, ou en choisit un, fourni en supplément (article 10). Le total s’affiche en dernier. Le prix du site se règle le jour même, en une fois ou en plusieurs fois (article 5). Avant de payer, le client voit un récapitulatif complet, avec le montant réglé le jour même et le prix du forfait qui suivra. S’il a un code promo (article 4), il le saisit dans la case « Code promo » avant de commander.

En cliquant sur « Commander et payer », le client accepte ces conditions et passe une commande ferme. Il reçoit aussitôt un e-mail de confirmation avec une référence de commande, à rappeler dans les échanges.

Une commande peut aussi être passée par e-mail ou par message. Elle est alors ferme quand le client accepte le récapitulatif par écrit et règle le prix de création.

## 3. Prix

Les prix sont en euros. La TVA n’est pas applicable (article 293 B du Code général des impôts) tant que l’entreprise bénéficie de la franchise de TVA. Si cette situation change, les prix affichés sont mis à jour. Les commandes déjà passées gardent leur prix.

L’offre est la même pour tous les clients. Elle tient en deux parties : la création du site, payée une fois, puis la façon de le faire vivre. Le client choisit entre le forfait ${AUTO}, sans abonnement, et le forfait ${mini.name}. L’abonnement est facultatif.

**Le site.** Un seul site est proposé : sa création se paie une seule fois. Il est assemblé à partir de modules déjà conçus par les Minis Monstres (par exemple l’accueil, la présentation, les services et tarifs, la galerie, les questions fréquentes et le contact), puis rempli avec les informations et les photos fournies par le client.

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

La ${minus(pageGoogle.name)} se commande depuis l’espace client. Elle est payée par carte bancaire au moment de la commande, en une seule fois. Elle n’est jamais facturée au mois. Les extras sur devis sont réalisés après l’accord écrit du client sur le prix.

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

Le forfait ${mini.name} est facultatif. Le client peut le prendre au moment de la commande, avec son nom de domaine, ou plus tard. C’est le seul abonnement proposé. Il démarre à la mise en ligne du site : le client enregistre alors sa carte pour le forfait. Il est sans engagement (article 8).

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

L’abonnement est sans engagement. Le client peut l’arrêter à tout moment, par e-mail, par message ou avec le bouton prévu dans son espace client. L’arrêt prend effet à la fin de la période déjà payée.

Quand le client paie la création en plusieurs fois par un organisme externe, ses échéances sont dues à cet organisme, selon le contrat passé avec lui. Cela ne crée aucun engagement de durée sur le forfait.

La fin de l’abonnement met fin à l’hébergement du site par les Minis Monstres, à son entretien et aux modifications. Le client reçoit l’export de son site (textes, images, pages), pour le faire héberger où il veut. Le nom de domaine lui appartient : il peut le transférer vers le prestataire de son choix. L’hébergement par les Minis Monstres s’arrête 30 jours après la fin de l’abonnement.

## 9. Droit de rétractation

Le client qui commande à distance dispose de 14 jours pour se rétracter, sans avoir à se justifier. Un message par ${contact} suffit.

En commandant, le client choisit lui-même quand la création commence.

- **Démarrer maintenant** : le client demande expressément que la création commence avant la fin de ces 14 jours. Il reconnaît qu’il perd son droit de rétractation dès que le site est entièrement livré. S’il se rétracte avant cette livraison, le travail déjà réalisé est retenu, au prorata du prix de création, et le reste lui est remboursé (article 5).
- **Attendre 14 jours** : la création commence à la fin du délai. Le client garde son droit de rétractation jusque-là, avec un remboursement intégral, et les délais de création (article 11) courent à partir de ce moment.

Aucun de ces deux choix n’est coché d’avance. Le nom de domaine déjà réservé, l’adresse du site, reste à sa charge, car il est enregistré à son nom et pour un an.

## 10. Nom de domaine

Le nom de domaine est l’adresse du site sur internet. Le client en est le titulaire. Avec le forfait ${mini.name}, les Minis Monstres y figurent comme contact technique, pour pouvoir le gérer. Le nom est réservé après le premier paiement, s’il est encore disponible à ce moment-là.

Le nom de domaine n’est pas compris dans le prix du forfait ${mini.name}. Si le client n’en possède pas, les Minis Monstres lui fournissent un nom de domaine standard en .fr, .com, .net ou .org, enregistré à son nom, pour ${eur(dom)} € de plus par mois, soit ${eur(avecDom)} € par mois au total. Ce supplément couvre le renouvellement annuel du nom tant que l’abonnement est actif. Si le client utilise son propre nom de domaine, le forfait reste à ${eur(mini.month)} € par mois. Les autres extensions et les noms dits « premium », vendus plus cher par les registres (les organismes qui gèrent chaque extension), font l’objet d’un devis.

Si le client possède déjà un nom de domaine, il peut le transférer vers les Minis Monstres ou le garder chez son prestataire et le faire pointer vers le site. Les Minis Monstres lui envoient les réglages à faire. Avec le forfait ${AUTO}, le client gère son nom de domaine sans les Minis Monstres (article 3).

## 11. Création du site, première version et délais

La création commence par le questionnaire de création, rempli par le client dans son espace client. Le client y fournit ses textes, photos et informations, ou les prépare avec les Minis Monstres à partir de ses explications. Les délais annoncés (${listeDelais}) sont indicatifs. Ils courent à partir de la réception de ces éléments.

Le site est mis en ligne dans une première version, présentée au client par e-mail (article 3), ou remis sous forme d’export avec le forfait ${AUTO}. Le client l’ajuste ensuite à son goût, comme le prévoit l’article 12.

## 12. Modifications

**Ce qui est inclus.** Les modifications sont incluses dans le forfait ${mini.name}. Une modification est un changement demandé sur le site déjà en ligne : ajouter ou changer un texte ou des photos, mettre à jour une information. Ajouter une ${minus(pageGoogle.name)} n’en est pas une : c’est un extra (article 3). Une refonte complète fait l’objet d’un devis. Sans abonnement, le client fait lui-même ses modifications.

**Modification par le client.** Avec le forfait ${mini.name}, le client peut aussi changer lui-même les textes et les photos de son site, depuis son espace client (bouton « Modifier mon site moi-même »). Ces changements sont publiés tout de suite, sous sa responsabilité. Le reste passe par une demande de modification.

**Déroulé.** Chaque modification suit les mêmes étapes :

1. Le client fait sa demande dans son espace client.
2. ${monstre('constructeur').nom}, un petit monstre de la bande (article 15), l’aide à la formuler clairement et lui pose les questions utiles.
3. Le client confirme la demande résumée par ${monstre('constructeur').nom}.
4. La demande est transmise à Alexandre Poquet.
5. Alexandre Poquet réalise la modification, puis elle est mise en ligne.

Le client peut annuler une demande tant qu’elle n’est pas commencée.

**Demandes en cours.** Le client a une demande en cours à la fois. La suivante peut être envoyée dès qu’une demande est terminée.

**Délai.** Aucun délai fixe n’est garanti pour une modification. Chaque demande est traitée dans un délai raisonnable, qui dépend de sa complexité et des éléments fournis par le client. Le client suit l’avancement dans son espace client.

Une demande sur devis suit le délai indiqué dans le devis.

## 13. Espace client et compte

Un espace client est créé automatiquement à la commande, avec l’adresse e-mail du client. C’est sa page personnelle, protégée par un mot de passe. Il y suit sa commande et ses factures. Avec le forfait ${mini.name}, il y fait ses demandes de modification et y gère son abonnement. C’est aussi là qu’il commande une ${minus(pageGoogle.name)} (article 3), et, avec le ${BOU.name}, qu’il gère son catalogue dans l’onglet « Ma boutique ». La bulle d’aide de ${cerise} y répond à ses questions, dans la limite de ${limites.bulleJour} messages par jour. Il garde ses identifiants pour lui et prévient les Minis Monstres en cas de doute sur leur usage.

Un compte sans connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec ses demandes et ses photos. Le client est prévenu par e-mail 30 jours avant. Une connexion suffit pour annuler la suppression. Les factures sont conservées en dehors du compte, le temps prévu par la loi.

## 14. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images, logos et produits qu’il fournit. Il reste responsable des informations légales propres à son activité : mentions exigées par la loi, conditions de vente de sa boutique, prix affichés.

## 15. Versions et outils automatisés

Avec le forfait ${mini.name}, chaque version du site est conservée et peut être restaurée sur demande.

Alex conçoit chaque site et en contrôle la réalisation. Il s’appuie sur des outils qu’il a mis au point, présentés sur le site comme une petite bande de six Minis Monstres :

${laBande}

Dans cet article, « les petits monstres » désigne l’ensemble de ces outils, bulle d’aide comprise.

Les petits monstres sont des outils automatisés, dont certains reposent sur un système d’intelligence artificielle, qui peuvent se tromper. Alex contrôle leur travail, et le client valide son site avant la mise en ligne (article 11). Les textes et les conseils que donnent les outils sont des propositions : le client les relit et reste responsable de ce qu’il publie. Ces outils ne donnent pas de conseil juridique, médical ou comptable.

## 16. Visibilité Google (référencement)

La visibilité Google, ou référencement, c’est le travail qui aide un site à être trouvé sur Google. Le ${ESS.name} est construit pour cela : pages rapides, titres et descriptions écrits pour Google. Les pages de visibilité Google commandées comme extras (article 3), payées une fois, ouvrent le site à plus de recherches. ${mirette}, la spécialiste visibilité de la petite bande, les prépare.

Dans tous les cas, la visibilité Google est une obligation de moyens : les Minis Monstres font de leur mieux et appliquent les bonnes pratiques, sans garantir une position donnée sur Google.

## 17. Fidélité

Un deuxième site commandé par le même client bénéficie de ${fidelite.remiseSecondSite} % de remise sur la création. Cet avantage n’est pas convertible en argent.

## 18. Responsabilité

Les Minis Monstres mettent tout en œuvre pour que le site reste disponible et sauvegardé tant qu’ils l’hébergent. Les Minis Monstres ne peuvent pas être tenus responsables d’une panne de l’hébergeur (l’entreprise qui garde le site en ligne), d’un registre de noms de domaine ou du service de paiement, ni des contenus fournis par le client. Avec le forfait ${AUTO}, le client est seul responsable de l’hébergement, des sauvegardes et des mises à jour de son site après la remise de l’export. Un éventuel dédommagement ne peut pas dépasser les sommes versées au titre de l’abonnement au cours des 12 derniers mois, ou le prix du site en l’absence d’abonnement, sauf si la loi en dispose autrement.

## 19. Médiation et litiges

En cas de désaccord, le client écrit d’abord par ${contact} : la plupart des questions se règlent en quelques échanges. Si la réponse ne lui convient pas, le client consommateur peut saisir gratuitement un médiateur de la consommation : ${L.mediator}. Le droit français s’applique.`,
  },
];
