// Mentions légales, politique de confidentialité, conditions générales
// ⚠️ Les éléments entre crochets proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
const { site, abonnement, paiement } = require('../config');
const L = site.legal;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;

module.exports = [
  {
    path: '/mentions-legales/',
    name: 'Mentions légales',
    title: 'Mentions légales | ALED08',
    description: 'Mentions légales du site ALED08, création de sites internet et services autour de l’IA : éditeur, hébergeur, propriété intellectuelle.',
    lead: 'Informations sur l’éditeur et l’hébergeur du site, conformément à la loi pour la confiance dans l’économie numérique.',
    updated: '2026-11-14',
    body: `## Éditeur du site

- **Nom commercial** : ${site.name}
- **Exploitant** : ${site.owner}
- **Forme juridique** : ${L.status}
- **Adresse** : ${addr}, France
- **Téléphone** : ${site.phoneDisplay}
- **E-mail** : ${site.email}
- **SIRET** : ${L.siret}
${L.tva ? `- **TVA** : ${L.tva}` : ''}

## Directeur de la publication

${L.publicationDirector}.

## Hébergeur

${L.host}.

## Propriété intellectuelle

Les textes, la mise en page, le logo et les éléments graphiques de ce site appartiennent à ${site.name}, sauf mention contraire. Toute reproduction sans accord écrit est interdite.

## Responsabilité

Les informations du site sont données à titre indicatif et peuvent évoluer. Les prix affichés sont des prix de départ : seul le devis accepté engage les deux parties.`,
  },
  {
    path: '/politique-de-confidentialite/',
    name: 'Politique de confidentialité',
    title: 'Politique de confidentialité | ALED08',
    description: 'Comment ALED08 traite les données envoyées par le formulaire de contact : finalité, durée de conservation, vos droits. Aucun cookie publicitaire sur le site.',
    lead: 'Ce que deviennent les informations que vous m’envoyez, et vos droits.',
    updated: '2026-11-14',
    body: `## Responsable du traitement

${site.owner}, ${site.name}, ${addr}. Contact : ${site.email}.

## Données collectées

Quand vous remplissez le formulaire, je reçois votre nom, votre adresse e-mail, votre téléphone si vous le donnez, le type de projet et votre message. Ces informations servent uniquement à vous répondre et à préparer un devis.

## Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Clients : le temps de la relation, puis les durées prévues par la loi pour les factures (10 ans).

## Destinataires

Les données sont destinées à ${site.name} uniquement. Elles transitent par l’hébergeur du site et par la messagerie utilisée pour recevoir les demandes. Elles ne sont jamais vendues.

## Cookies

Ce site n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Le jeu de démonstration peut garder votre meilleur score dans votre navigateur : cette information reste sur votre appareil.

## Vos droits

Vous pouvez demander l’accès, la correction ou la suppression de vos données en écrivant à ${site.email}. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: 'Conditions générales de vente | ALED08',
    description: 'Conditions générales de vente d’ALED08 : devis, paiement unique ou abonnement, délais, propriété du site, résiliation, droit de rétractation.',
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le devis accepté.',
    updated: '2026-11-14',
    body: `## 1. Devis et commande

Chaque prestation fait l’objet d’un devis gratuit. La commande est ferme quand le devis est accepté par écrit (e-mail ou message) et, pour un paiement unique, quand l’acompte est réglé.

## 2. Prix

Les prix du site sont des prix de départ. Le prix applicable est celui du devis accepté.${L.tva ? ` ${L.tva}.` : ''}

## 3. Paiement unique

Un acompte de ${paiement.acompte} % est demandé à la commande, le solde à la mise en ligne. Une fois le paiement complet, le site et ses fichiers appartiennent au client. L’hébergement et le nom de domaine ne sont pas compris, sauf option choisie.

## 4. Abonnement

L’abonnement comprend la création du site, l’hébergement, le nom de domaine, la maintenance et les petites modifications décrites sur la page Tarifs. Il est conclu pour ${abonnement.engagement} mois, puis se poursuit de mois en mois et peut être arrêté à tout moment avec un mois de préavis. À l’arrêt, le client récupère les fichiers de son site et son nom de domaine.

## 5. Délais

Les délais sont donnés à titre indicatif. Ils courent à partir de la réception des éléments nécessaires (textes, photos, accès).

## 6. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images et logos qu’il fournit.

## 7. Utilisation de l’IA

${site.name} utilise des outils d’intelligence artificielle pour concevoir plus vite. Tout ce qui est livré est relu, testé et corrigé avant la mise en ligne.

## 8. Droit de rétractation

Le client particulier dispose de 14 jours après la commande pour se rétracter. S’il demande que le travail commence avant la fin de ce délai, il paie la part déjà réalisée en cas de rétractation.

## 9. Médiation

En cas de litige, le client peut recourir gratuitement au médiateur de la consommation : ${L.mediator}.`,
  },
];
