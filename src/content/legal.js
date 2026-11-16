// Mentions légales, politique de confidentialité, conditions générales de vente
// ⚠️ Les éléments entre accolades proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
// Règles : aucun tiret long, phrases courtes, rien d'invérifiable. Le nom de marque vient de site.name.
const { site, annuel, paiement, fidelite, forfaits, lissage, types, options, jetonsLia, delais, creation, aLaDemande } = require('../config');
const L = site.legal;
const contact = site.email ? `e-mail à ${site.email} ou le formulaire de contact (${site.url}/contact/)` : `le formulaire de contact (${site.url}/contact/)`;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;
const UPDATED = '2026-11-15'; // mentions légales et politique de confidentialité
const UPDATED_CGV = '2026-11-16'; // conditions générales : offre V2 (intervention d'Alex par trimestre, extras à la demande)

// L'offre unique : la création à prix fixe, un seul abonnement, des options payées une fois, des extras au mois,
// et des extras à la demande payés une fois. Tous les nombres viennent de src/config.js, pour que les CGV suivent toujours les prix.
const abo = forfaits[0];
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
// Interventions d'Alex comprises : une par trimestre depuis la V2. Les clients inscrits avant gardent une par mois.
const periode = abo.periode || 'mois';
const intervAlex = abo.quota === 1 ? 'une intervention' : `${abo.quota} interventions`;
const DATE_V2 = '16 novembre 2026';
const maj = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const durees = lissage.durees.join(' ou ');
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
const lisse = (prix, n) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // échéance arrondie au centime inférieur
const annee = abo.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const boutique = creation.prix + creation.boutique;
const listeDelais = types.map((t) => `${t.label.toLowerCase()} : ${t.delai}`).join(', ');
const tvaMention = L.tva || 'non applicable, art. 293 B du CGI';
// Options payées une fois et extras au mois : le nom et le prix viennent de la config, la phrase d'explication est ici
// (écrite pour les CGV, différente de celle de la page Tarifs).
const DETAIL = {
  en: 'le site traduit en anglais et relu, avec un bouton pour changer de langue',
  rdv: 'un agenda sur le site, où les visiteurs réservent un créneau parmi ceux que le client ouvre',
  reprise: 'les textes, les photos et les adresses de pages de l’ancien site du client, repris dans le nouveau',
  pages: 'cinq pages en plus des cinq comprises, pour un site vitrine ou une boutique en ligne',
  seo: 'le travail de référencement mené chaque mois, avec un point sur les résultats',
  liaplus: `un usage régulier de Lia et de ses outils, soit ${jetonsLia.liaplus} Jetons Lia en plus chaque mois (article 12)`,
  stats: 'les chiffres du site heure par heure, et un rapport chaque mois',
  mail: 'une adresse e-mail au nom de domaine du client',
  stock: 'le stock de la boutique, décompté à chaque vente',
  comptes: 'un compte pour chaque acheteur de la boutique, avec ses commandes et ses adresses',
};
const detail = (o) => (DETAIL[o.id] ? ` : ${DETAIL[o.id]}` : '');
const boutiqueSeule = (o) => (o.types && o.types.length === 1 && o.types[0] === 'boutique' ? ' Réservé aux boutiques en ligne.' : '');
const listeOptions = options
  .filter((o) => o.quand === 'creation')
  .map((o) => `- **${o.name}, ${eur(o.price.once)} €**${detail(o)}.`)
  .join('\n');
const listeExtras = options
  .filter((o) => o.quand === 'mois')
  .map((o) => `- **${o.name}, ${eur(o.price.month)} € par mois**${detail(o)}.${boutiqueSeule(o)}`)
  .join('\n');
const liaPlus = options.find((o) => o.id === 'liaplus');
const seoSuivi = options.find((o) => o.id === 'seo');
// Extras à la demande : payés une fois, commandés par le client depuis son espace, ajoutés à la prochaine facture.
const DETAIL_DEMANDE = {
  alex: `une modification faite à la main par Alex, en plus de l’intervention comprise dans la période (article 11)`,
  urgent: `la demande est prise en charge avant les autres et traitée sous ${delais.urgent}, du lundi au vendredi`,
  article: 'le client choisit le sujet, Lia prépare l’article, Alex le relit, l’illustre et le publie sur le site du client',
  point: 'un rendez-vous avec Alex, par téléphone ou en visio, pour faire le point sur le site et les projets du client',
};
const listeDemande = aLaDemande
  .map((x) => `- **${x.name}, ${eur(x.prix)} €**${DETAIL_DEMANDE[x.id] ? ` : ${DETAIL_DEMANDE[x.id]}` : ''}.`)
  .join('\n');
const alexPlus = aLaDemande.find((x) => x.id === 'alex');
const urgent = aLaDemande.find((x) => x.id === 'urgent');
// Jetons Lia : le compteur interne de l'espace client (les pages publiques n'en parlent pas)
const centime = eur(Math.round(jetonsLia.valeur * 100));
const modifMax = 65; // la plus grande demande que Lia accepte (mots et photos)
const listeRecharges = jetonsLia.recharge.map((r) => `${r.jetons} jetons pour ${eur(r.prix)} €`).join(', ');

module.exports = [
  {
    path: '/mentions-legales/',
    name: 'Mentions légales',
    title: `Mentions légales | ${site.name}`,
    description: `Mentions légales du site ${site.name} : éditeur, hébergeur, prestataire de paiement, propriété intellectuelle, responsabilité et médiation.`,
    lead: 'Informations sur l’éditeur et l’hébergeur du site, conformément à la loi pour la confiance dans l’économie numérique.',
    updated: UPDATED,
    body: `## Éditeur du site

- **Nom commercial** : ${site.name}
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

Les textes, la mise en page, le logo, les personnages et les éléments graphiques de ce site appartiennent à ${site.name}, sauf mention contraire. Toute reproduction sans accord écrit est interdite.

## Responsabilité

Les informations du site sont données à titre indicatif et peuvent évoluer. Seul le récapitulatif de commande accepté engage les deux parties. Le comparatif avec les autres solutions décrit des façons de travailler. Quand le site cite un prix du marché, c’est une fourchette courante, donnée comme ordre de grandeur : elle ne vise aucun concurrent en particulier.

## Médiation

Pour un litige avec un consommateur, un médiateur de la consommation peut être saisi gratuitement. Ses coordonnées figurent dans les [conditions générales de vente](/conditions-generales/#19-mediation-et-litiges).`,
  },
  {
    path: '/politique-de-confidentialite/',
    name: 'Politique de confidentialité',
    title: `Politique de confidentialité | ${site.name}`,
    description: `Comment ${site.name} traite vos données : demande de devis, commande en ligne, paiement par Stripe, nom de domaine, espace client et IA. Aucun traceur publicitaire.`,
    lead: 'Ce que deviennent les informations que vous m’envoyez, combien de temps je les garde, et vos droits.',
    updated: UPDATED,
    body: `## 1. Responsable du traitement

${site.owner}, ${site.name}, ${addr}. Contact : ${contact}.

## 2. Les données que je collecte

- **Demande de contact ou de devis** : votre nom, votre e-mail, votre téléphone si vous le donnez, vos choix dans le configurateur (type de site, options, extras, nom de domaine) et votre message.
- **Commande en ligne** : prénom, nom, e-mail, téléphone, adresse postale, nom de votre activité, vos choix, le nom de domaine souhaité, votre message et un éventuel code de parrainage. L’adresse postale sert à la facture et à la réservation du nom de domaine.
- **Espace client** : vos identifiants, vos demandes de modification (texte et photos) et la date de votre dernière connexion.
- **Paiement** : je ne reçois jamais votre numéro de carte ni votre IBAN (voir le point 4).

## 3. Pourquoi je les utilise

Pour vous répondre et préparer votre récapitulatif. Pour exécuter votre commande : créer le site, réserver le nom de domaine, gérer l’abonnement et les demandes. Pour établir les factures et les garder le temps prévu par la loi. Rien d’autre : pas de publicité, pas de revente, pas de profilage.

## 4. Paiement par Stripe

Les paiements sont confiés à Stripe, prestataire de paiement. Au moment de payer, vous saisissez vos données bancaires sur une page sécurisée de Stripe. Elles ne passent pas par mon site et ${site.name} ne les stocke jamais. Je reçois seulement l’état du paiement (réussi, en attente, refusé) et la facture correspondante. Stripe traite ces données selon sa propre politique de confidentialité, consultable sur [stripe.com/fr/privacy](https://stripe.com/fr/privacy).

## 5. Nom de domaine

Quand vous vérifiez un nom de domaine, le nom saisi est envoyé au registre officiel de l’extension par le protocole RDAP : l’AFNIC pour les .fr, Verisign pour les .com et les .net, PIR pour les .org. Cette vérification part de votre navigateur pendant que vous tapez, puis de mon serveur au moment de la commande, pour confirmer la disponibilité. Seul le nom recherché est transmis.

Pour réserver le nom de domaine, je transmets vos coordonnées de titulaire (prénom, nom, adresse, e-mail, téléphone) au bureau d’enregistrement et au registre de l’extension. C’est obligatoire pour que le nom de domaine soit enregistré à votre nom. En règle générale, les coordonnées d’un particulier ne sont pas publiées dans l’annuaire public du registre.

## 6. Espace client et comptes

Votre compte est créé automatiquement à la commande, avec votre adresse e-mail. Les demandes envoyées depuis l’espace client (texte et photos) servent uniquement à réaliser la modification demandée.

Lia, l’IA de l’espace client, fonctionne avec Claude, un service de la société Anthropic. Quand vous lui confiez une modification ou que vous lancez un de ses outils, le texte, la photo ou l’adresse de page que vous donnez sont envoyés à Claude, par une liaison chiffrée, pour produire la réponse. Ils ne servent à rien d’autre. D’après les conditions d’Anthropic pour les professionnels, ces données ne servent pas à entraîner ses modèles. Évitez d’y mettre des informations sensibles : santé, coordonnées bancaires, nom complet d’un de vos clients.

Quand vous publiez sur un réseau social depuis l’outil « Publier partout », votre texte et votre photo sont envoyés à ce réseau, sur le compte que vous avez relié. La photo est gardée une heure sur notre serveur, le temps de l’envoi, puis effacée.

Un compte sans aucune connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec les demandes et les photos qu’il contient. Un e-mail vous prévient 30 jours avant. Il suffit de vous connecter pour le conserver.

## 7. Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Commandes et comptes clients : toute la durée de la relation, puis 5 ans pour les pièces du contrat et 10 ans pour les factures, comme la loi l’impose.
- Comptes inactifs : supprimés après 12 mois sans connexion ni abonnement actif (point 6).

## 8. Destinataires

Vos données sont destinées à ${site.name} uniquement. Elles transitent par l’hébergeur du site, ${L.host}, par la messagerie qui reçoit les demandes, par Stripe pour le paiement et par le bureau d’enregistrement pour le nom de domaine. Ce que vous confiez à Lia passe par Anthropic (Claude), société américaine : ce traitement peut avoir lieu hors de l’Union européenne, dans le cadre prévu par ses conditions de traitement des données. Elles ne sont jamais vendues ni cédées.

## 9. Cookies et stockage local

Ce site n’utilise aucun traceur publicitaire ni outil de mesure d’audience. Il ne pose aucun cookie tant que vous n’êtes pas connecté à votre espace client.

- Si vous arrivez par un lien de parrainage, le code du parrain est gardé 60 jours dans le stockage local de votre navigateur, pour le préremplir dans le formulaire de commande. Il n’est envoyé qu’avec votre commande.
- Quand vous vous connectez à l’espace client, un cookie de connexion est posé. Il est nécessaire au service et sert uniquement à vous garder connecté.

## 10. Vos droits

Vous pouvez demander l’accès à vos données, leur correction, leur suppression ou une copie, et vous opposer à un traitement, en écrivant par ${contact}. Je réponds sous un mois. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: `Conditions générales de vente | ${site.name}`,
    description: `Conditions générales de vente d’${site.name} : commande en ligne, création à prix fixe, abonnement, extras au mois et à la demande, domaine, rétractation.`,
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif de commande.',
    updated: UPDATED_CGV,
    body: `## 1. Objet

Ces conditions s’appliquent à toute commande passée auprès d’${site.name} : création d’un site internet, abonnement, options, extras et services liés. Elles complètent le récapitulatif de commande, qui précise le type de site, les options, les extras et les prix.

## 2. Commande en ligne

La commande se passe sur le site, en trois étapes : le choix du site, de ses options et des extras, les coordonnées, puis le paiement sécurisé. Avant de payer, le client voit un récapitulatif complet, avec le montant réglé le jour même et les montants suivants.

En cliquant sur « Commander et payer », le client accepte ces conditions et passe une commande ferme. Il reçoit aussitôt un e-mail de confirmation avec une référence de commande, à rappeler dans les échanges.

Une commande peut aussi être passée par e-mail ou par message. Elle est alors ferme quand le client accepte le récapitulatif par écrit et règle le premier paiement.

## 3. Prix

Les prix sont en euros. La TVA n’est pas applicable (article 293 B du Code général des impôts) tant que l’entreprise bénéficie de la franchise de TVA. Si cette situation change, les prix affichés sont mis à jour. Les commandes déjà passées gardent leur prix.

L’offre est la même pour tous les clients. Elle tient en deux prix : la création du site, payée une fois, et l’abonnement, payé tant que le site est hébergé par ${site.name}.

**La création du site coûte ${eur(creation.prix)} €.** Ce prix est le même pour un site d’une seule page et pour un site vitrine de cinq pages au plus. Il comprend la maquette, le site complet et sa mise en ligne.

**La boutique en ligne coûte ${eur(creation.boutique)} € de plus**, soit ${eur(boutique)} € pour la création. Ce supplément comprend le paiement par carte, le suivi des commandes, la mise en ligne de 20 produits au plus et une base de conditions de vente que le client complète.

**Les options de création** se paient une fois, en plus du prix de création :

${listeOptions}

**L’abonnement coûte ${eur(abo.month)} € par mois**, ou ${eur(annee)} € par an (article 5). Des **extras** payés au mois peuvent s’y ajouter, ainsi que des **extras à la demande**, payés une fois (article 6).

Un site plus grand, ou une demande qui sort de ce cadre, fait l’objet d’un devis que le client accepte avant le début du travail.

## 4. Paiement de la création

Le prix de création se paie en deux temps.

- **À la commande** : un acompte de ${paiement.acompte} % du prix de création, boutique en ligne comprise s’il y en a une. Les options de création sont réglées en entier ce jour-là.
- **À la réception du site** : le reste, en une fois.
- **Ou, à la réception, en ${durees} fois sans frais** : le reste est divisé en ${durees} mensualités, au choix du client. L’abonnement est alors payé au mois. Chaque échéance est arrondie au centime inférieur : le total ne dépasse jamais le prix du site. Les prélèvements s’arrêtent d’eux-mêmes après la dernière échéance.

Le client choisit, au moment de la commande, de payer le reste en une fois ou en plusieurs fois.

Exemple pour un site à ${eur(creation.prix)} € : le client paie ${eur(acompte(creation.prix))} € à la commande. À la réception, il paie ${eur(creation.prix - acompte(creation.prix))} € en une fois, ou ${lissage.durees.map((n) => `${eur(lisse(creation.prix, n))} € par mois pendant ${n} mois`).join(', ou ')}.

## 5. Abonnement

L’abonnement est obligatoire : ${site.name} n’héberge pas de site sans abonnement. Il n’y en a qu’un, le même pour tous les sites. Il démarre à la réception du site.

Il comprend :

- **Le nom de domaine**, enregistré au nom du client et renouvelé chaque année (article 9).
- **L’hébergement** du site, avec le HTTPS.
- **Les mises à jour et les sauvegardes** du site.
- **Le suivi du site** : son bon fonctionnement est surveillé.
- **Le support** : une réponse sous ${delais.reponse}, en jours ouvrés (article 11).
- **Les bases du SEO** : le site est construit pour que Google puisse le lire et le comprendre.
- **Les petites retouches avec Lia** et l’usage des outils de l’espace client, dans la limite du compteur de Jetons Lia (article 12).
- **${maj(intervAlex)} d’Alex par ${periode}** (article 11).${periode === 'trimestre' ? ` Le client inscrit avant le ${DATE_V2} garde une intervention d’Alex par mois.` : ''}
- **L’espace client et ses outils** (article 13).

L’abonnement est prélevé d’avance, chaque mois ou chaque année selon la période choisie par le client. À l’année, il coûte ${eur(annee)} € : le client paie ${12 - annuel.moisOfferts} mois sur 12, soit ${annuel.moisOfferts} mois offerts. Le client peut passer du mois à l’année, ou de l’année au mois, au renouvellement.

Les paiements sont confiés à Stripe, par carte bancaire ou prélèvement SEPA. ${site.name} ne voit pas et ne conserve pas les données bancaires. Chaque facture est envoyée par e-mail et reste disponible dans l’espace client.

En cas d’échec de paiement, le client est prévenu par e-mail. Si rien n’est régularisé sous 30 jours, le site peut être mis en pause jusqu’au règlement.

## 6. Extras au mois et extras à la demande

Un extra est un service en plus. Il y en a deux sortes : les extras au mois et les extras à la demande. Aucun extra n’est obligatoire.

**Extras au mois.** Ils sont payés au mois avec l’abonnement.

${listeExtras}

L’extra ${seoSuivi.name} s’appelait auparavant « SEO suivi ». Seul le nom change.

Le client ajoute ou retire un extra au mois quand il veut, depuis son espace client. Le nouveau prix s’applique à l’échéance suivante. Quand l’abonnement est payé à l’année, les extras au mois le sont aussi, avec les mêmes ${annuel.moisOfferts} mois offerts.

**Extras à la demande.** Ils sont payés une fois, à l’unité.

${listeDemande}

Le client commande lui-même un extra à la demande depuis son espace client, quand il en a besoin. Il voit le prix et donne son accord avant chaque commande. Le montant est ajouté à sa prochaine facture. Un client qui ne commande rien ne paie rien de plus.

## 7. Engagement, résiliation et fin de l’abonnement

L’abonnement est sans engagement. Le client peut l’arrêter à tout moment par e-mail ou par message : le bouton est dans son espace client. L’arrêt prend effet à la fin de la période déjà payée.

Une seule exception : quand le reste du prix de création est payé en plusieurs fois, le client s’engage le temps du paiement, soit ${durees} mois à partir de la réception du site. S’il arrête avant, le reste du prix de création devient exigible en une fois. Une fois le site payé, l’abonnement est sans engagement.

La fin de l’abonnement met fin aux extras et à l’hébergement du site par ${site.name}. Le client reçoit son site sous forme de fichiers (textes, images, pages), pour le faire héberger où il veut. Le nom de domaine lui appartient : il peut le transférer vers le prestataire de son choix. L’hébergement par ${site.name} s’arrête 30 jours après la fin de l’abonnement.

## 8. Droit de rétractation

Le client qui commande à distance dispose de 14 jours pour se rétracter, sans avoir à se justifier. Un message par ${contact} suffit.

En commandant, le client demande expressément, en cochant la case prévue, que la création commence tout de suite. S’il se rétracte pendant ces 14 jours, il paie le travail déjà réalisé, au prorata du prix de création. Le nom de domaine déjà réservé reste à sa charge, car il est enregistré à son nom et pour un an.

## 9. Nom de domaine

Le client est le titulaire de son nom de domaine. ${site.name} y figure comme contact technique, pour pouvoir le gérer. Le nom est réservé après le premier paiement, s’il est encore disponible à ce moment-là.

Le prix d’un nom de domaine standard en .fr, .com, .net ou .org est compris dans l’abonnement, renouvellement annuel compris. Les autres extensions et les noms dits « premium », vendus plus cher par les registres, font l’objet d’un devis.

Si le client possède déjà un nom de domaine, il peut le transférer vers ${site.name} ou le garder chez son prestataire et le faire pointer vers le site. ${site.name} lui envoie les réglages à faire.

## 10. Création du site et délais

Le client fournit ses textes, photos et informations, ou les prépare avec ${site.name} à partir de ses explications. Les délais annoncés (${listeDelais}) sont indicatifs. Ils courent à partir de la réception de ces éléments. Le client voit son site avant la mise en ligne et peut demander des ajustements sur ce qui a été commandé.

## 11. Modifications et délai de réponse

Le client envoie ses demandes de modification depuis son espace client ou par message. Une modification est un changement précis sur une page existante : un texte, un prix, un horaire, une photo, un produit. Une page nouvelle ou un site plus grand fait l’objet d’un devis.

À chaque demande, le client choisit qui s’en charge :

- **Lia** : la modification est préparée par Lia, l’assistante numérique d’${site.name}. Lia est une intelligence artificielle. Elle aide Alex à automatiser certaines tâches répétitives et ne le remplace pas. Lia montre l’aperçu au client et ne modifie le site qu’après son accord. La modification est décomptée du compteur de Jetons Lia (article 12).
- **Alex** : la modification est faite à la main, vérifiée et paramétrée par Alex.

**Petites retouches avec Lia.** Lia réalise les petites et moyennes modifications : un budget de mots et d’images par demande, sur une seule page. La modification est mise en ligne dès que le client valide l’aperçu, en général dans les 5 minutes qui suivent la demande. Une demande trop grande pour Lia est transmise à Alex. Elle compte alors comme une intervention d’Alex.

**Intervention d’Alex.** L’abonnement comprend ${intervAlex} d’Alex par ${periode} : une modification faite à la main.${periode === 'trimestre' ? ` Pour un client inscrit avant le ${DATE_V2}, c’est une intervention par mois, aux mêmes conditions.` : ''} Une intervention non utilisée ne se reporte pas à la période suivante.

**${alexPlus.name}.** Quand l’intervention de la période est déjà utilisée, le client peut commander ${minus(alexPlus.name)}, pour ${eur(alexPlus.prix)} € (article 6). Cet extra à la demande remplace le « Boost », au même prix. Le client donne son accord à chaque commande, et le montant est ajouté à sa prochaine facture. Il peut aussi choisir de reporter sa demande à la période suivante.

**Annulation.** Une demande peut être annulée gratuitement par le client dans les 24 heures qui suivent son envoi, depuis son espace client, dans la limite de trois annulations par mois : elle n’est alors pas décomptée, ses Jetons Lia sont recrédités, et ce que Lia avait mis en ligne est remis comme avant. Au-delà, l’annulation se demande à Alex.

**Délai de réponse.** ${site.name} répond à chaque demande sous ${delais.reponse}, en jours ouvrés. Ce délai est le même pour tous les clients. Répondre, c’est prendre en charge la demande et donner une date. Les petites modifications sont en général faites dans ce délai. Avec l’extra à la demande « ${urgent.name} » (article 6), la demande est traitée sous ${delais.urgent}, du lundi au vendredi.

## 12. Jetons Lia

Les Jetons Lia sont le compteur interne des retouches avec Lia et des outils de l’espace client. Le client voit ce compteur dans son espace client. Un Jeton Lia vaut ${centime} centime d’euro. Le compteur sert aux modifications du site par Lia et aux outils de l’espace client (publier sur les réseaux, corriger ou traduire un texte, conseils sur une photo ou sur une page du site, et autres outils du même genre).

**Décompte.** Une modification faite par Lia compte ${jetonsLia.modif.base} Jetons Lia, plus 1 jeton par tranche de ${jetonsLia.modif.mots} mots écrits dans la demande, plus ${jetonsLia.modif.image} jetons par photo jointe. Cela fait entre ${jetonsLia.modif.base} et ${modifMax} jetons par modification. Chaque outil compte le nombre de jetons affiché avant son utilisation.

**Usage compris dans l’abonnement.** L’abonnement donne ${abo.jetons} Jetons Lia par mois, pour un usage occasionnel. Cela représente en général 2 à 3 retouches avec Lia, ou une dizaine d’utilisations d’outils. Ces jetons sont remis le 1er de chaque mois et ne se reportent pas d’un mois sur l’autre.

**Usage régulier.** L’extra ${liaPlus.name} ajoute ${jetonsLia.liaplus} Jetons Lia par mois, pour ${eur(liaPlus.price.month)} € par mois. Ces jetons suivent la même règle que ceux de l’abonnement : ils reviennent le 1er du mois, sans report. Le client peut aussi acheter une recharge à l’unité : ${listeRecharges}. La recharge est ajoutée à sa prochaine facture. Les jetons d’une recharge ne s’effacent pas à la fin du mois : ils restent jusqu’à ce qu’ils soient utilisés.

**Jetons recrédités.** Les jetons d’une demande sont recrédités dans quatre cas : la demande est transmise à Alex, la mise en ligne échoue, le client refuse l’aperçu, ou le client annule sa demande dans les 24 heures.

Le compteur de Jetons Lia et les interventions d’Alex sont comptés séparément.

## 13. Espace client et compte

Un espace client est créé automatiquement à la commande, avec l’adresse e-mail du client. Il y suit sa commande, ses demandes, son abonnement, ses extras et ses factures. Il y commande les extras à la demande (article 6). Il y trouve aussi les outils de Lia et son compteur de Jetons Lia (article 12). Il garde ses identifiants pour lui et prévient ${site.name} en cas de doute sur leur usage.

Un compte sans connexion depuis 12 mois et sans abonnement actif est supprimé automatiquement, avec ses demandes et ses photos. Le client est prévenu par e-mail 30 jours avant. Une connexion suffit pour annuler la suppression. Les factures sont conservées en dehors du compte, le temps prévu par la loi.

## 14. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images, logos et produits qu’il fournit. Il reste responsable des informations légales propres à son activité : mentions obligatoires, conditions de vente de sa boutique, prix affichés.

## 15. Versions et intelligence artificielle

Chaque version du site est conservée et peut être restaurée sur demande. ${site.name} s’aide d’outils d’intelligence artificielle pour travailler plus vite. Une modification préparée par Lia n’est mise en ligne qu’après l’accord du client, qui voit l’aperçu. Les textes et les conseils que donnent les outils de Lia sont des propositions : le client les relit avant de s’en servir et reste responsable de ce qu’il publie. Lia ne donne pas de conseil juridique, médical ou comptable.

## 16. Référencement

Les bases du SEO sont comprises dans l’abonnement. Le travail mené chaque mois pour faire monter le site relève de l’extra ${seoSuivi.name} (article 6). Dans les deux cas, le référencement est une obligation de moyens. ${site.name} applique les bonnes pratiques et suit les résultats, sans garantir une position donnée sur Google.

## 17. Parrainage et fidélité

Chaque client dispose d’un lien et d’un code de parrainage dans son espace client. Quand le site d’un filleul est en ligne, le parrain et le filleul reçoivent chacun ${fidelite.parrainageMois} mois d’abonnement offert, crédité sur la facture suivante. Un deuxième site commandé par le même client bénéficie de ${fidelite.remiseSecondSite} % sur la création. Ces avantages ne sont pas convertibles en argent.

## 18. Responsabilité

${site.name} met tout en œuvre pour que le site reste disponible et sauvegardé. ${site.name} ne peut pas être tenu responsable d’une panne de l’hébergeur, d’un registre ou du service de paiement, ni des contenus fournis par le client. Un éventuel dédommagement ne peut pas dépasser les sommes versées au titre de l’abonnement au cours des 12 derniers mois, sauf si la loi en dispose autrement.

## 19. Médiation et litiges

En cas de désaccord, le client écrit d’abord par ${contact} : la plupart des questions se règlent en quelques échanges. Si la réponse ne lui convient pas, le client consommateur peut saisir gratuitement un médiateur de la consommation : ${L.mediator}. Le droit français s’applique.`,
  },
];
