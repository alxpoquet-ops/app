// Mentions légales, politique de confidentialité, conditions générales
// ⚠️ Les éléments entre crochets proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
const { site, annuel, paiement, fidelite, entretien, jetons } = require('../config');
const L = site.legal;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;

module.exports = [
  {
    path: '/mentions-legales/',
    name: 'Mentions légales',
    title: 'Mentions légales | ALED08',
    description: 'Mentions légales du site ALED08, création de sites internet et référencement SEO : éditeur, hébergeur, propriété intellectuelle et responsabilité.',
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

Les textes, la mise en page, le logo, les personnages et les éléments graphiques de ce site appartiennent à ${site.name}, sauf mention contraire. Toute reproduction sans accord écrit est interdite.

## Responsabilité

Les informations du site sont données à titre indicatif et peuvent évoluer. Seul le récapitulatif accepté engage les deux parties. Les prix de Shopify cités dans le comparatif sont des prix publics relevés à la date indiquée sur la page.`,
  },
  {
    path: '/politique-de-confidentialite/',
    name: 'Politique de confidentialité',
    title: 'Politique de confidentialité | ALED08',
    description: 'Comment ALED08 traite vos données : demande de devis, vérification de nom de domaine, espace client et IA. Aucun cookie publicitaire sur le site.',
    lead: 'Ce que deviennent les informations que vous m’envoyez, et vos droits.',
    updated: '2026-11-14',
    body: `## Responsable du traitement

${site.owner}, ${site.name}, ${addr}. Contact : ${site.email}.

## Données collectées

Quand vous envoyez une demande, je reçois votre nom, votre adresse e-mail, votre téléphone si vous le donnez, vos choix (type de site, forfait, options, nom de domaine) et votre message. Ces informations servent uniquement à vous répondre et à préparer votre récapitulatif.

## Vérification d’un nom de domaine

Quand vous vérifiez un nom de domaine, votre navigateur interroge directement le registre officiel de l’extension : l’AFNIC pour .fr, Verisign pour .com et .net, PIR pour .org. Seul le nom recherché leur est transmis. Je ne le reçois pas tant que vous n’envoyez pas votre demande.

## Espace client et IA

Les demandes écrites dans l’espace client (modification du site, publication sur les réseaux) sont traitées par un fournisseur d’intelligence artificielle pour préparer la modification ou le texte. Elles ne servent qu’à cela. Les accès à vos réseaux sociaux restent les vôtres et peuvent être retirés à tout moment.

## Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Clients : le temps de la relation, puis les durées prévues par la loi pour les factures (10 ans).

## Destinataires

Les données sont destinées à ${site.name} uniquement. Elles transitent par l’hébergeur du site, par la messagerie utilisée pour recevoir les demandes et, pour l’espace client, par les services nécessaires à son fonctionnement (paiement, IA). Elles ne sont jamais vendues.

## Cookies

Ce site n’utilise aucun cookie publicitaire ni outil de mesure d’audience.

## Vos droits

Vous pouvez demander l’accès, la correction ou la suppression de vos données en écrivant à ${site.email}. Vous pouvez aussi saisir la CNIL (www.cnil.fr).`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales',
    title: 'Conditions générales de vente | ALED08',
    description: 'Conditions générales de vente d’ALED08 : création à prix fixe, entretien et forfaits au mois ou à l’année, jetons IA, espace client et rétractation.',
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif accepté.',
    updated: '2026-11-14',
    body: `## 1. Commande

Chaque projet fait l’objet d’un récapitulatif gratuit : type de site, forfait, options et prix. La commande est ferme quand le récapitulatif est accepté par écrit (e-mail ou message) et l’acompte réglé.

## 2. Création du site

Le prix de création est fixe pour le type de site choisi. ${paiement.acompte} % sont payés à la commande, le reste à la mise en ligne. Les pages ou produits en plus sont indiqués dans le récapitulatif.

## 3. Entretien et forfaits

L’entretien (${entretien.month} € par mois) comprend l’hébergement, le nom de domaine, les sauvegardes, les mises à jour des extensions et l’accès à l’espace client. Il démarre à la mise en ligne. Les forfaits IA s’y ajoutent et donnent chaque mois des jetons, le référencement et le support décrits sur la page Forfaits.

- **Au mois** : sans engagement, résiliable à tout moment avec un mois de préavis.
- **À l’année** : engagement de douze mois, payé en une fois, avec ${annuel.moisOfferts} mois offerts.

Le client peut changer de forfait ou ajouter une option à tout moment. Le nouveau prix s’applique à la période suivante.

## 4. Jetons IA

Un jeton permet une petite modification du site ou une publication sur les réseaux sociaux avec les outils de l’espace client. Des jetons supplémentaires peuvent être achetés à tout moment (${jetons.recharge.price} € les ${jetons.recharge.qty}). Les jetons ne sont pas remboursables ni convertibles en argent.

## 5. Nom de domaine et fin du forfait

Le nom de domaine est enregistré au nom du client. À la fin du forfait, le client garde son nom de domaine et reçoit une copie de son site (contenus, images et fichiers).

## 6. Espace client et IA

Les modifications demandées dans l’espace client sont préparées par une intelligence artificielle. Le client voit l’aperçu et valide avant la publication. Chaque version est conservée et peut être restaurée. Le client reste responsable des contenus qu’il publie, sur son site comme sur ses réseaux sociaux.

## 7. Référencement

Le référencement est une obligation de moyens : ${site.name} s’engage à appliquer les bonnes pratiques et à suivre les résultats, sans pouvoir garantir une position précise sur Google.

## 8. Délais

Les délais sont donnés à titre indicatif. Ils courent à partir de la réception des éléments nécessaires (textes, photos, accès).

## 9. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images et logos qu’il fournit.

## 10. Fidélité

Le parrainage donne ${fidelite.parrainageMois} mois d’entretien et de forfait offert au parrain et au filleul, quand le site du filleul est en ligne. Les avantages ne sont pas convertibles en argent.

## 11. Droit de rétractation

Le client particulier dispose de 14 jours après la commande pour se rétracter. S’il demande que le travail commence avant la fin de ce délai, il paie la part déjà réalisée en cas de rétractation.

## 12. Médiation

En cas de litige, le client peut recourir gratuitement au médiateur de la consommation : ${L.mediator}.`,
  },
];
