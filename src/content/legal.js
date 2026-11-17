// Mentions légales, politique de confidentialité, conditions générales de vente
// ⚠️ Les éléments entre accolades proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
// Règles : aucun tiret long, aucun point-virgule, phrases courtes, rien d'invérifiable. Chaque terme technique est
// expliqué la première fois qu'il apparaît dans un article. Le nom de marque vient de site.name.
const cfg = require('../config');
const { site, annuel, paiement, fidelite, forfaits, lissage, types, options, creation, bande, evenement, limites, optimisation } = cfg;
const L = site.legal;
const contact = site.email ? `e-mail à ${site.email} ou le formulaire de contact (${site.url}/contact/)` : `le formulaire de contact (${site.url}/contact/)`;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;
const UPDATED = '2026-11-15'; // mentions légales
const UPDATED_CONF = '2026-11-17'; // politique de confidentialité : offre simplifiée (abonnements Mini et Maxi, code promo, bulle et modifications)
const UPDATED_CGV = '2026-11-17'; // conditions générales : offre simplifiée du 17 novembre 2026
// La petite bande (config.bande) : les automatisations d'Alex, présentées par leur prénom et leur rôle.
// Une seule mention du système automatisé qui les fait fonctionner : l'article 15 des conditions générales
// (règlement européen AI Act, obligation de transparence). La politique de confidentialité nomme le fournisseur.

// L'offre du 17 novembre 2026 : la création du « Site Internet Professionnel » à prix fixe, une seule option à la commande
// (la boutique en ligne, payée une fois), les pages SEO supplémentaires commandées plus tard depuis l'espace client (à la
// page), puis le choix de la mise en ligne : « On s'occupe de tout » (un abonnement au mois sans engagement, au choix :
// Mini, id 'base', ou Maxi, id 'evolution', avec priorité, une page SEO par semaine et l'optimisation continue) ou
// « Je m'en occupe moi-même » (création seule, code du site remis au client), et l'offre événement. Les délais des
// modifications sont des délais habituels, jamais garantis. Tous les nombres viennent de src/config.js, pour que les CGV
// suivent les prix.
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l, mot = 'et') => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${mot} ${l[l.length - 1]}` : l.join(''));
const durees = lissage.durees.join(' ou ');
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
const lisse = (prix, n) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // échéance arrondie au centime inférieur
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // abonnement Mini
const maxi = forfaits.find((f) => f.id === 'evolution') || forfaits[forfaits.length - 1]; // abonnement Maxi
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const packSeo = options.find((o) => o.id === 'packseo' && !o.retire) || { name: 'Page SEO supplémentaire', price: { once: 5 }, pages: 1 };
const boutique = creation.prix + creation.boutique;
const restantes = creation.pages - creation.exemplePages;
const NOM_SITE = creation.nom || 'Site Internet Professionnel';
const DATE_OFFRE = '17 novembre 2026'; // offre simplifiée : clause de transition (article 7)
// 17 novembre 2026 : Alex fait toutes les modifications à la main. Cerise aide le client à formuler sa demande (article 12).
const lieux = liste(evenement.lieux, 'ou');
const moisOffert = fidelite.parrainageMois === 1 ? 'un mois offert' : `${fidelite.parrainageMois} mois offerts`;
const listeDelais = types.map((t) => `${t.id === 'boutique' ? 'une boutique en ligne' : t.id === 'une-page' ? 'une seule page' : 'un site de plusieurs pages'} : ${t.delai}`).join(', ');
const tvaMention = L.tva || 'non applicable, art. 293 B du CGI';
// Options choisies à la commande et payées une fois : celles de config.options encore proposées avec quand 'creation',
// puis la boutique en ligne (creation.boutique). La page SEO supplémentaire (id 'packseo') n'en fait pas partie, quel que
// soit son champ quand ('espace' depuis le 17 novembre 2026) : elle se commande plus tard, à la page, depuis l'espace
// client (article 3, paragraphe dédié).
// La phrase d'explication est écrite ici pour les CGV, différente de celle de la page Tarifs.
const DETAIL = {
  packseo: () => 'une page de plus, pensée pour une recherche précise faite sur Google, par exemple un service et une ville, une FAQ, un métier, une page locale ou un guide',
};
const optionsCommande = options.filter((o) => o.quand === 'creation' && !o.retire && o.id !== 'packseo');
const listeOptions = optionsCommande
  .map((o) => `- **${o.name}, ${eur(o.price.once)} €**${DETAIL[o.id] ? ` : ${DETAIL[o.id](o)}` : ''}.`)
  .concat(`- **Boutique en ligne, ${eur(creation.boutique)} €** : un catalogue de produits, un panier, le paiement en ligne, la gestion des commandes et des e-mails envoyés automatiquement aux acheteurs. Avec la boutique, la création coûte ${eur(boutique)} €.`)
  .join('\n');
const nbOptions = optionsCommande.length + 1; // la boutique en ligne comprise
const NOMBRE = ['aucune', 'une', 'deux', 'trois', 'quatre', 'cinq'];
// La petite bande, par prénom et par rôle. Ce que fait chacun est écrit ici pour les CGV.
const ROLE_CGV = {
  support: 'répond dans la bulle d’aide, aide le client à formuler ses demandes de modification et les transmet à Alex',
  ecrivain: 'prépare les contenus, aide à rédiger les textes et améliore leur lisibilité',
  organisateur: 'classe les contenus et organise les pages',
  gardien: 'fait les sauvegardes et la maintenance, veille sur la sécurité et surveille le site',
  observateur: 'suit les statistiques et les performances du site, et repère ce qui peut être amélioré',
  etoile: 'analyse le site et choisit les sujets des pages SEO, qu’Alex écrit et publie',
  vendeur: 'range le catalogue, suit les commandes et envoie les e-mails aux acheteurs',
};
const presente = (b) => `- **${b.nom}, ${minus(b.role)}** : ${ROLE_CGV[b.id] || minus(b.court.replace(/\.$/, ''))}.`;
const bandeComprise = bande.filter((b) => b.compris).map(presente).join('\n');
const bandeBoutique = bande
  .filter((b) => b.option === 'boutique')
  .map((b) => `**${b.nom}, ${minus(b.role)}**, arrive avec la boutique en ligne : il ${ROLE_CGV[b.id] || minus(b.court.replace(/\.$/, ''))}.`)
  .join(' ');
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const lumi = monstre('etoile').nom;
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

- **Demande de contact ou de devis** : votre nom, votre e-mail, votre téléphone si vous le donnez, vos choix (options, abonnement, nom de domaine) et votre message.
- **Commande en ligne** : prénom, nom, e-mail, téléphone, adresse postale, nom de votre activité, vos choix, le nom de domaine souhaité, votre message et un éventuel code promo ou de parrainage. L’adresse postale sert à la facture et à la réservation du nom de domaine.
- **Espace client** : vos identifiants, vos demandes de modification (texte et photos), vos messages dans la bulle d’aide et la date de votre dernière connexion.
- **Paiement** : je ne reçois jamais votre numéro de carte ni votre IBAN (voir le point 4).

## 3. Pourquoi je les utilise

Pour vous répondre et préparer votre récapitulatif. Pour exécuter votre commande : créer le site, réserver le nom de domaine, gérer votre abonnement et vos demandes de modification. Pour établir les factures et les garder le temps prévu par la loi. Rien d’autre : pas de publicité, pas de revente, pas de profilage.

## 4. Paiement par Stripe

Les paiements sont confiés à Stripe, prestataire de paiement. Au moment de payer, vous saisissez vos données bancaires sur une page sécurisée de Stripe. Elles ne passent pas par mon site et les Minis Monstres ne les stockent jamais. Je reçois seulement l’état du paiement (réussi, en attente, refusé) et la facture correspondante. Stripe traite ces données selon sa propre politique de confidentialité, consultable sur [stripe.com/fr/privacy](https://stripe.com/fr/privacy).

## 5. Nom de domaine

Votre nom de domaine est l’adresse de votre site, par exemple votre-activite.fr. Quand vous vérifiez s’il est libre, le nom saisi est envoyé au registre officiel de l’extension, l’organisme qui gère ces adresses : l’AFNIC pour les .fr, Verisign pour les .com et les .net, PIR pour les .org. L’envoi passe par RDAP, le service public qui indique si un nom est déjà pris. Cette vérification part de votre navigateur pendant que vous tapez, puis de mon serveur au moment de la commande, pour confirmer la disponibilité. Seul le nom recherché est transmis.

Pour réserver le nom de domaine, je transmets vos coordonnées de titulaire (prénom, nom, adresse, e-mail, téléphone) au bureau d’enregistrement, l’entreprise qui enregistre le nom pour vous, et au registre de l’extension. C’est obligatoire pour que le nom de domaine soit enregistré à votre nom. En règle générale, les coordonnées d’un particulier ne sont pas publiées dans l’annuaire public du registre.

## 6. Espace client et comptes

Votre compte est créé automatiquement à la commande, avec votre adresse e-mail. Les demandes envoyées depuis l’espace client (texte et photos) servent uniquement à réaliser la modification demandée.

Certains petits monstres fonctionnent avec Claude, un service de la société Anthropic. C’est le cas de ${cerise}, qui vous répond dans la bulle d’aide et vous aide à formuler vos demandes de modification. Quand vous écrivez dans la bulle ou que vous demandez une modification, le texte, la photo ou l’adresse de page que vous donnez sont envoyés à Claude pour préparer la réponse ou le résumé de votre demande. L’envoi passe par une liaison chiffrée, c’est-à-dire protégée contre les regards extérieurs. Ces éléments ne servent à rien d’autre. D’après les conditions d’Anthropic pour les professionnels, ces données ne servent pas à entraîner ses modèles. Évitez d’y mettre des informations sensibles : santé, coordonnées bancaires, nom complet d’un de vos clients.

Un compte sans aucune connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec les demandes et les photos qu’il contient. Un e-mail vous prévient 30 jours avant. Il suffit de vous connecter pour le conserver.

## 7. Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Commandes et comptes clients : toute la durée de la relation, puis 5 ans pour les pièces du contrat et 10 ans pour les factures, comme la loi l’impose.
- Comptes inactifs : supprimés après 12 mois sans connexion ni abonnement actif (point 6).

## 8. Destinataires

Vos données sont destinées aux Minis Monstres uniquement. Elles transitent par l’hébergeur du site, ${L.host}, par la messagerie qui reçoit les demandes, par Stripe pour le paiement et par le bureau d’enregistrement pour le nom de domaine. Ce que vous écrivez dans la bulle d’aide ou dans une demande de modification passe par Anthropic (Claude), société américaine : ce traitement peut avoir lieu hors de l’Union européenne, dans le cadre prévu par ses conditions de traitement des données. Elles ne sont jamais vendues ni cédées.

## 9. Cookies et stockage local

Ce site n’utilise aucun traceur publicitaire ni outil de mesure d’audience. Il ne pose aucun cookie, ce petit fichier qu’un site range dans votre navigateur, tant que vous n’êtes pas connecté à votre espace client.

- Si vous arrivez par un lien de parrainage, le code du parrain est gardé 60 jours dans le stockage local de votre navigateur, une petite mémoire propre à chaque site, pour le préremplir dans le formulaire de commande. Il n’est envoyé qu’avec votre commande.
- Quand vous vous connectez à l’espace client, un cookie de connexion est posé. Il est nécessaire au service et sert uniquement à vous garder connecté.

## 10. Vos droits

Vous pouvez demander l’accès à vos données, leur correction, leur suppression ou une copie, et vous opposer à un traitement, en écrivant par ${contact}. Je réponds sous un mois. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: `Conditions générales de vente | Les Minis Monstres`,
    description: `Conditions générales de vente des Minis Monstres : commande en ligne, site à prix fixe, options, abonnement au mois, codes promo, nom de domaine, rétractation.`,
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif de commande.',
    updated: UPDATED_CGV,
    body: `## 1. Objet

Ces conditions s’appliquent à toute commande passée auprès des Minis Monstres : création d’un site internet, options, abonnement au mois et services liés. Elles complètent le récapitulatif de commande, qui précise le site, l’option choisie, l’abonnement ou la création seule, et les prix.

## 2. Commande en ligne

La commande se passe sur le site, en trois étapes : la composition du site, les coordonnées, puis le paiement sécurisé. Pour composer son site, le client voit dans l’ordre : le site, l’option boutique en ligne, puis le choix de la mise en ligne. Il la confie aux Minis Monstres avec un abonnement au mois, ${mini.name} ou ${maxi.name} (« On s’occupe de tout »), ou il s’en occupe lui-même (« Je m’en occupe moi-même », la création seule). Avec un abonnement, il choisit ensuite son nom de domaine. Le total s’affiche en dernier, avec le choix de payer le reste en une fois ou en plusieurs fois (article 5). Avant de payer, le client voit un récapitulatif complet, avec le montant réglé le jour même et les montants suivants. S’il a un code promo (article 4) ou un code de parrainage (article 17), il le saisit dans la case « Code promo ou parrainage » avant de commander.

En cliquant sur « Commander et payer », le client accepte ces conditions et passe une commande ferme. Il reçoit aussitôt un e-mail de confirmation avec une référence de commande, à rappeler dans les échanges.

Une commande peut aussi être passée par e-mail ou par message. Elle est alors ferme quand le client accepte le récapitulatif par écrit et règle le premier paiement.

## 3. Prix

Les prix sont en euros. La TVA n’est pas applicable (article 293 B du Code général des impôts) tant que l’entreprise bénéficie de la franchise de TVA. Si cette situation change, les prix affichés sont mis à jour. Les commandes déjà passées gardent leur prix.

L’offre est la même pour tous les clients. Elle tient en deux parties : la création du site, payée une fois, puis le choix de la personne qui met le site en ligne et le fait vivre. Avec un abonnement au mois, payé tant que le site est hébergé par les Minis Monstres, ils s’occupent de tout. En création seule, le client s’en occupe lui-même.

**La création du site coûte ${eur(creation.prix)} €.** Ce prix correspond au « ${NOM_SITE} ». Il comprend jusqu’à ${creation.pages} pages, un design personnalisé, un affichage adapté à tous les écrans, un formulaire de contact et un accompagnement personnalisé par Alex et les Minis Monstres.

**Nom de domaine et hébergement.** Le nom de domaine est l’adresse du site. L’hébergement est le service qui garde le site accessible 24 h/24. Avec un abonnement, les Minis Monstres installent et mettent en ligne le site, et les deux sont offerts la première année, sauf pour un site avec boutique en ligne. Ensuite, l’abonnement les prend en charge (article 6). En création seule, le client gère lui-même son nom de domaine et son hébergement.

**Pages SEO.** Le référencement, aussi appelé SEO, désigne ce qui aide un site à être trouvé plus facilement sur Google. Les pages que le client n’utilise pas, parmi les ${creation.pages} comprises, peuvent devenir des pages SEO. Chacune répond à une recherche que font ses propres clients sur Google, pour rendre le site plus visible. Par exemple, un client qui utilise ${creation.exemplePages} pages pour présenter son activité garde ${restantes} pages pour améliorer sa présence sur Google.

**Les options** se paient une fois, en plus du prix de création, et aucune n’est obligatoire. À la commande, il y en a ${NOMBRE[nbOptions] || nbOptions} :

${listeOptions}

**Les pages SEO supplémentaires, ${eur(packSeo.price.once)} € la page**, payées une fois. Chacune est ${DETAIL.packseo(packSeo)}. Elles ne se choisissent pas à la commande. Le client les commande plus tard, une par une, quand il le souhaite, depuis son espace client (onglet « Mes demandes »).

**Les abonnements.** Le client qui confie la mise en ligne aux Minis Monstres choisit l’un des deux abonnements proposés : ${mini.name}, à ${eur(mini.month)} € par mois, ou ${maxi.name}, à ${eur(maxi.month)} € par mois (article 6). Payé à l’année, chacun bénéficie de ${annuel.moisOfferts} mois offerts.

**Création seule.** Le client qui préfère s’occuper lui-même de la mise en ligne choisit « Je m’en occupe moi-même » à la commande : c’est la création seule. Il paie alors seulement la création du site, ${eur(creation.prix)} €, et la boutique en ligne s’il la prend, sans abonnement. Il gère lui-même son nom de domaine et son hébergement, qu’il peut déjà avoir. Les Minis Monstres ne fournissent ni l’un ni l’autre. Une fois le site terminé et le reste réglé, ou son paiement en plusieurs fois mis en place, Alex remet au client le code du site : ses fichiers et une sauvegarde complète, avec une courte notice d’installation, prêts à installer chez l’hébergeur du client. Le client fait l’installation lui-même, ou avec l’aide de son hébergeur. Il peut s’appuyer sur des guides publics et gratuits, comme les pages d’aide de son hébergeur. La maintenance, les sauvegardes, la sécurité et les modifications ne sont pas comprises. Le client peut prendre un abonnement plus tard.

**Devis.** Une refonte complète du site ou une fonction nouvelle, comme une prise de rendez-vous, fait l’objet d’un devis. Le client l’accepte avant le début du travail.

## 4. Codes promo

Les Minis Monstres peuvent proposer des codes promo, par exemple lors d’une opération ponctuelle. Un code promo donne une remise sur la création du site, c’est-à-dire sur le site et sur la boutique en ligne si elle est prise. Il ne s’applique pas aux abonnements, ni aux pages SEO supplémentaires commandées plus tard.

Le client saisit le code au moment de commander. Le code est vérifié, et le récapitulatif montre le prix après remise avant le paiement. L’acompte et le reste du prix de création sont calculés sur ce prix remisé (article 5).

## 5. Paiement de la création

Le prix de création se paie en deux temps.

- **À la commande** : un acompte de ${paiement.acompte} % du prix de création, boutique en ligne comprise s’il y en a une.
- **À la réception du site** : le reste, en une fois.
- **Ou, à la réception, en ${durees} fois sans frais** : le reste est divisé en ${durees} mensualités, au choix du client. S’il a un abonnement, celui-ci est alors payé au mois. Chaque échéance est arrondie au centime inférieur : le total ne dépasse jamais le prix du site. Les prélèvements s’arrêtent d’eux-mêmes après la dernière échéance.

Le client choisit, au moment de la commande, de payer le reste en une fois ou en plusieurs fois. Ce choix est ouvert avec un abonnement comme en création seule (article 3).

Exemple pour un site à ${eur(creation.prix)} €, sans code promo : le client paie ${eur(acompte(creation.prix))} € à la commande. À la réception, il paie ${eur(creation.prix - acompte(creation.prix))} € en une fois, ou ${lissage.durees.map((n) => `${eur(lisse(creation.prix, n))} € par mois pendant ${n} mois`).join(', ou ')}.

## 6. Les abonnements

Le client qui confie la mise en ligne aux Minis Monstres choisit son abonnement au moment de la commande, avec son nom de domaine. Deux abonnements sont proposés : ${mini.name} et ${maxi.name}. L’abonnement démarre à la réception du site. Il est sans engagement (article 8).

**L’abonnement ${mini.name}, ${eur(mini.month)} € par mois.** Il comprend :

- **L’hébergement** : le site reste accessible 24 h/24, avec le HTTPS, le petit cadenas qui protège les échanges avec les visiteurs.
- **Le nom de domaine**, c’est-à-dire l’adresse du site, enregistré au nom du client et renouvelé chaque année (article 10).
- **Les sauvegardes** : des copies de sécurité du site, faites régulièrement.
- **La sécurité et la surveillance** : le site est protégé, et son bon fonctionnement est vérifié jour et nuit.
- **La maintenance** : des contrôles techniques faits régulièrement, pour que le site reste en état de marche.
- **Les modifications**, incluses sans limite de nombre et faites par Alex. Le client a une demande en cours à la fois. Le délai habituel de traitement va jusqu’à ${mini.delai} (article 12).
- **Une page SEO par mois**, dont ${lumi}, l’étoile de Google de la petite bande, choisit le sujet. Alex l’écrit et l’ajoute au site du client.
- **Le tableau de bord**, qui montre les visites du site et ses pages les plus vues.
- **L’espace client**, avec la bulle d’aide (article 13).

**L’abonnement ${maxi.name}, ${eur(maxi.month)} € par mois.** Il comprend tout ce que comprend l’abonnement ${mini.name}, avec en plus :

- **Des modifications prioritaires** : les demandes du client sont traitées en priorité par Alex, en général sous ${maxi.delai}. Le client peut avoir deux demandes en cours à la fois (article 12).
- **Une page SEO optimisée par semaine**, à la place de la page mensuelle. ${lumi} en choisit le sujet, Alex l’écrit et la publie.
- **L’${minus(optimisation.titre)}** : ${mirette}, l’observatrice de la petite bande (article 15), analyse régulièrement le site. Les Minis Monstres proposent des améliorations pour sa visibilité, sous forme de suggestions affichées dans l’espace client. Le client choisit celles qu’il souhaite appliquer.

Les délais de traitement indiqués pour chaque abonnement sont des délais habituels, donnés à titre indicatif. Ils ne constituent pas une garantie.

**Changer d’abonnement.** Le client peut passer de ${mini.name} à ${maxi.name}, ou de ${maxi.name} à ${mini.name}, à tout moment. Le changement prend effet à partir du mois suivant, au prix du nouvel abonnement.

La première année, le nom de domaine et l’hébergement sont offerts avec un abonnement, sauf pour un site avec boutique en ligne. L’installation et la mise en ligne du site sont toujours comprises (article 3). À partir de la deuxième année, ou dès la mise en ligne pour un site avec boutique, l’abonnement les prend en charge, sans supplément.

**Paiement.** L’abonnement est prélevé d’avance, chaque mois ou chaque année, selon le choix du client. À l’année, le client paie ${12 - annuel.moisOfferts} mois sur 12, soit ${annuel.moisOfferts} mois offerts : ${eur(parAn(mini))} € par an pour ${mini.name} et ${eur(parAn(maxi))} € par an pour ${maxi.name}. Le client peut passer du mois à l’année, ou de l’année au mois, au renouvellement.

Les paiements sont confiés à Stripe, le prestataire de paiement en ligne, par carte bancaire ou par prélèvement SEPA, c’est-à-dire directement sur le compte bancaire. Les Minis Monstres ne voient pas et ne conservent pas les données bancaires. Chaque facture est envoyée par e-mail et reste disponible dans l’espace client.

En cas d’échec de paiement, le client est prévenu par e-mail. Si rien n’est régularisé sous 30 jours, le site peut être mis en pause jusqu’au règlement.

## 7. Clients inscrits avant le ${DATE_OFFRE}

Un client inscrit avant le ${DATE_OFFRE} garde les options et les extras qu’il a déjà, aux mêmes conditions, tant qu’il ne les retire pas. Un abonnement déjà en cours continue à son prix actuel.

## 8. Engagement, résiliation et fin de l’abonnement

L’abonnement est sans engagement. Le client peut l’arrêter à tout moment, par e-mail, par message ou avec le bouton prévu dans son espace client. L’arrêt prend effet à la fin de la période déjà payée.

Une seule exception : quand le reste du prix de création est payé en plusieurs fois, le client s’engage le temps du paiement, soit ${durees} mois à partir de la réception du site. S’il arrête avant, le reste du prix de création devient exigible en une fois. En création seule, les mensualités restent dues de la même façon jusqu’à la dernière. Une fois le site payé, l’abonnement est sans engagement.

La fin de l’abonnement met fin à l’hébergement du site par les Minis Monstres, à son entretien et aux modifications. Le client reçoit son site sous forme de fichiers (textes, images, pages), pour le faire héberger où il veut. Le nom de domaine lui appartient : il peut le transférer vers le prestataire de son choix. L’hébergement par les Minis Monstres s’arrête 30 jours après la fin de l’abonnement.

## 9. Droit de rétractation

Le client qui commande à distance dispose de 14 jours pour se rétracter, sans avoir à se justifier. Un message par ${contact} suffit.

En commandant, le client demande expressément, en cochant la case prévue, que la création commence tout de suite. S’il se rétracte pendant ces 14 jours, il paie le travail déjà réalisé, au prorata du prix de création. Le nom de domaine déjà réservé, l’adresse du site, reste à sa charge, car il est enregistré à son nom et pour un an.

## 10. Nom de domaine

Le nom de domaine est l’adresse du site sur internet. Le client en est le titulaire. Les Minis Monstres y figurent comme contact technique, pour pouvoir le gérer. Le nom est réservé après le premier paiement, s’il est encore disponible à ce moment-là.

Avec un abonnement, un nom de domaine standard en .fr, .com, .net ou .org est offert la première année, sauf pour un site avec boutique en ligne. Ensuite, son renouvellement annuel est compris dans l’abonnement. Les autres extensions et les noms dits « premium », vendus plus cher par les registres (les organismes qui gèrent chaque extension), font l’objet d’un devis.

Si le client possède déjà un nom de domaine, il peut le transférer vers les Minis Monstres ou le garder chez son prestataire et le faire pointer vers le site. Les Minis Monstres lui envoient les réglages à faire. En création seule, le client gère son nom de domaine sans les Minis Monstres (article 3).

## 11. Création du site et délais

Le client fournit ses textes, photos et informations, ou les prépare avec les Minis Monstres à partir de ses explications. Les délais annoncés (${listeDelais}) sont indicatifs. Ils courent à partir de la réception de ces éléments. Le client voit son site avant la mise en ligne et peut demander des ajustements sur ce qui a été commandé.

## 12. Modifications

**Ce qui est inclus.** Les modifications sont incluses dans les deux abonnements, sans limite de nombre. Une modification est un changement demandé sur le site : ajouter ou changer un texte ou des photos, mettre à jour une information. Ajouter une page en est une aussi, dans la limite des ${creation.pages} pages du site. Une refonte complète ou une fonction nouvelle, comme une prise de rendez-vous, fait l’objet d’un devis (article 3).

**Déroulé.** Chaque modification suit les mêmes étapes :

1. Le client fait sa demande dans son espace client.
2. ${cerise}, la secrétaire de la petite bande (article 15), l’aide à la formuler clairement et lui pose les questions utiles.
3. Le client confirme la demande résumée par ${cerise}.
4. La demande est transmise à Alex.
5. Alex fait la modification à la main, puis la met en ligne.

Aucun petit monstre ne modifie le site. Le client peut annuler une demande tant qu’Alex ne l’a pas commencée.

**Demandes en cours.** Avec ${mini.name}, le client a une demande en cours à la fois. Avec ${maxi.name}, il peut en avoir deux. La suivante peut être envoyée dès qu’une demande est terminée.

**Délais.** Les délais ci-dessous sont des délais habituels, donnés à titre indicatif et sans garantie. Ils peuvent être plus longs pour une demande complexe ou incomplète.

- **Avec ${mini.name}** : le délai habituel de traitement va jusqu’à ${mini.delai}.
- **Avec ${maxi.name}** : les demandes sont prioritaires. Le délai habituel de traitement va jusqu’à ${maxi.delai}.

Une demande sur devis suit le délai indiqué dans le devis.

## 13. Espace client et compte

Un espace client est créé automatiquement à la commande, avec l’adresse e-mail du client. C’est sa page personnelle, protégée par un mot de passe. Il y suit sa commande, ses demandes de modification, son abonnement et ses factures, et il y trouve son lien de parrainage. C’est aussi là qu’il commande les pages SEO supplémentaires, dans l’onglet « Mes demandes ». Avec l’abonnement ${maxi.name}, il y reçoit aussi les suggestions d’amélioration des Minis Monstres (article 6). La bulle d’aide de ${cerise} y répond à ses questions, dans la limite de ${limites.bulleJour} messages par jour. Il garde ses identifiants pour lui et prévient les Minis Monstres en cas de doute sur leur usage.

Un compte sans connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec ses demandes et ses photos. Le client est prévenu par e-mail 30 jours avant. Une connexion suffit pour annuler la suppression. Les factures sont conservées en dehors du compte, le temps prévu par la loi.

## 14. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images, logos et produits qu’il fournit. Il reste responsable des informations légales propres à son activité : mentions obligatoires, conditions de vente de sa boutique, prix affichés.

## 15. Versions et outils automatisés

Chaque version du site est conservée et peut être restaurée sur demande.

Alex conçoit et réalise chaque site. Pour les tâches répétitives, il s’aide d’outils automatisés qu’il a programmés, présentés sur le site comme une petite bande de petits monstres. Avec un abonnement, la bande comprend :

${bandeComprise}

${bandeBoutique} Dans cet article, « les petits monstres » désigne l’ensemble de ces outils, bulle d’aide comprise.

Les petits monstres sont des outils automatisés, dont certains reposent sur un système d’intelligence artificielle, qui peuvent se tromper. Ils ne modifient pas le site : c’est Alex qui fait chaque modification (article 12). Les textes et les conseils que donnent les outils sont des propositions : le client les relit et reste responsable de ce qu’il publie. Ces outils ne donnent pas de conseil juridique, médical ou comptable.

## 16. Référencement

Le référencement, ou SEO, c’est le travail qui aide un site à être trouvé sur Google. Les pages SEO (article 3), les pages SEO supplémentaires commandées depuis l’espace client et les pages ajoutées avec l’abonnement (article 6), une par mois avec ${mini.name} et une par semaine avec ${maxi.name}, renforcent la présence du site sur Google.

Dans tous les cas, y compris pour l’${minus(optimisation.titre)} de l’abonnement ${maxi.name}, le référencement est une obligation de moyens : les Minis Monstres font de leur mieux et appliquent les bonnes pratiques, sans garantir une position donnée sur Google.

## 17. Parrainage et fidélité

Chaque client dispose d’un lien et d’un code de parrainage dans son espace client. Quand le site d’un filleul est en ligne, le parrain et le filleul reçoivent chacun ${moisOffert} sur leur abonnement, crédité sur la facture suivante. Un deuxième site commandé par le même client bénéficie de ${fidelite.remiseSecondSite} % de remise sur la création. Ces avantages ne sont pas convertibles en argent.

## 18. Responsabilité

Les Minis Monstres mettent tout en œuvre pour que le site reste disponible et sauvegardé. Les Minis Monstres ne peuvent pas être tenus responsables d’une panne de l’hébergeur (l’entreprise qui garde le site en ligne), d’un registre de noms de domaine ou du service de paiement, ni des contenus fournis par le client. Un éventuel dédommagement ne peut pas dépasser les sommes versées au titre de l’abonnement au cours des 12 derniers mois, sauf si la loi en dispose autrement.

## 19. Médiation et litiges

En cas de désaccord, le client écrit d’abord par ${contact} : la plupart des questions se règlent en quelques échanges. Si la réponse ne lui convient pas, le client consommateur peut saisir gratuitement un médiateur de la consommation : ${L.mediator}. Le droit français s’applique.`,
  },
];
