// Mentions légales, politique de confidentialité, conditions générales
// ⚠️ Les éléments entre crochets proviennent de src/config.js et doivent y être complétés.
const { site } = require('../config');
const L = site.legal;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;

module.exports = [
  {
    path: '/mentions-legales/',
    name: 'Mentions légales',
    title: 'Mentions légales | ALED08',
    description: "Mentions légales du site ALED08, électricien à Signy-l'Abbaye (Ardennes) : éditeur, hébergeur, propriété intellectuelle.",
    lead: 'Informations relatives à l’éditeur et à l’hébergeur du site, conformément à la loi pour la confiance dans l’économie numérique (LCEN).',
    updated: '2026-11-09',
    body: `## Éditeur du site

- **Nom commercial** : ${site.name}
- **Exploitant** : ${site.owner}
- **Forme juridique** : ${L.status}
- **Adresse** : ${addr}, France
- **Téléphone** : ${site.phoneDisplay}
- **E-mail** : ${site.email}
- **SIRET** : ${L.siret}
- **Immatriculation** : ${L.rm}
${L.tva ? `- **TVA** : ${L.tva}` : ''}

## Directeur de la publication

${L.publicationDirector}.

## Hébergement

${L.host}

## Assurance professionnelle

- **Assureur** : ${L.insurer}
- **Contrat** : ${L.insuranceContract}
- **Garanties** : ${L.insuranceScope}
- **Couverture géographique** : ${L.insuranceArea}

## Propriété intellectuelle

L'ensemble des contenus de ce site (textes, illustrations, logo, mise en page) est la propriété de ${site.name}, sauf mention contraire. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est interdite. Les polices de caractères Inter et Sora sont distribuées sous licence SIL Open Font License ; les icônes proviennent du projet Lucide (licence ISC).

## Responsabilité

Les informations publiées sur ce site, notamment les articles du blog, sont fournies à titre général et ne remplacent pas un diagnostic sur place. Les interventions sur une installation électrique présentent des risques : en cas de doute, coupez le courant au disjoncteur général et faites appel à un professionnel.

## Liens externes

Le site peut contenir des liens vers d'autres sites (Google Maps, WhatsApp). ${site.name} n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.

## Données personnelles

Le traitement des données transmises via les formulaires est décrit dans la [politique de confidentialité](/politique-de-confidentialite/).`,
  },
  {
    path: '/politique-de-confidentialite/',
    name: 'Politique de confidentialité',
    title: 'Politique de confidentialité et cookies | ALED08',
    description: "Comment ALED08 traite vos données personnelles (formulaires de contact et de devis) et utilise les cookies, conformément au RGPD.",
    lead: 'Vos données servent uniquement à répondre à vos demandes. Voici, en toute transparence, ce qui est collecté, pourquoi et pendant combien de temps.',
    updated: '2026-11-09',
    body: `## Responsable du traitement

${site.owner}, ${site.name}, ${addr}. Contact : ${site.email} — ${site.phoneDisplay}.

## Données collectées

Lorsque vous utilisez le formulaire de contact ou de demande de devis, les données suivantes sont collectées : nom, numéro de téléphone, adresse e-mail (facultative), commune et adresse d'intervention (facultative), description de votre besoin et créneaux souhaités.

Lorsque vous me contactez par téléphone, SMS ou WhatsApp, votre numéro et le contenu de vos messages sont conservés dans mon téléphone professionnel aussi longtemps que nécessaire au suivi de votre demande.

## Finalités et base légale

- **Répondre à votre demande** et établir un devis : mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).
- **Réaliser l'intervention et la facturer** : exécution du contrat et obligations légales comptables (articles 6.1.b et 6.1.c).

Vos données ne sont **jamais vendues, louées ni utilisées à des fins publicitaires**.

## Durée de conservation

- Demandes n'ayant pas donné lieu à une intervention : 3 ans à compter du dernier contact.
- Données clients liées à une intervention : durée de la relation commerciale, puis archivage le temps des garanties applicables.
- Factures : 10 ans, conformément aux obligations comptables.

## Destinataires

Les données sont destinées exclusivement à ${site.owner}. Elles transitent par l'hébergeur du site et le service de messagerie électronique utilisés pour la réception des formulaires. WhatsApp, si vous choisissez ce canal, est un service de Meta Platforms soumis à ses propres conditions.

## Vos droits

Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Pour les exercer, écrivez à ${site.email}. Vous pouvez également introduire une réclamation auprès de la CNIL ([cnil.fr](https://www.cnil.fr)).

## Cookies et traceurs

Ce site **n'utilise aucun cookie publicitaire et aucun outil de mesure d'audience**. Les seuls éléments stockés sur votre appareil sont :

- votre **choix concernant les cookies**, enregistré dans le stockage local de votre navigateur pendant 6 mois au maximum, afin de ne pas vous reposer la question à chaque page ;
- les **cookies de Google**, uniquement si vous choisissez d'afficher la carte Google Maps. Sans votre accord, la carte ne se charge pas et aucune donnée n'est transmise à Google.

Vous pouvez modifier votre choix à tout moment grâce au lien « Gestion des cookies » en bas de chaque page.

## Sécurité

Le site est servi en HTTPS. Les formulaires sont protégés contre les envois automatisés et les données ne sont pas stockées dans une base de données sur le serveur : elles sont transmises par e-mail au responsable du traitement.`,
  },
  {
    path: '/conditions-generales/',
    name: 'Conditions générales de prestation',
    title: 'Conditions générales de prestation | ALED08',
    description: "Conditions générales de prestation d'ALED08 pour les particuliers : devis, prix, déplacement, paiement, droit de rétractation, garanties et médiation.",
    lead: 'Les règles qui s’appliquent à nos interventions chez les particuliers : simples, claires et conformes au Code de la consommation.',
    updated: '2026-11-09',
    body: `## 1. Objet

Les présentes conditions s'appliquent à toutes les prestations d'électricité réalisées par ${site.name} (${site.owner}) au domicile de clients particuliers : dépannage, recherche de panne, petits travaux, remplacement de matériel, mise en sécurité.

## 2. Prix

Les prix sont exprimés en euros TTC${L.tva ? ` (${L.tva})` : ''}. Le dépannage est facturé au forfait publié sur la page [Tarifs](/tarifs/). Les réparations, les pièces et les travaux font l'objet d'un devis préalable. Les tarifs sont identiques en semaine, en soirée et le week-end.

## 3. Forfait dépannage et déplacement

Le forfait dépannage, d'un montant de 79 € TTC, comprend le déplacement jusqu'à 15 km de Signy-l'Abbaye, la recherche de panne, la proposition de solution et l'établissement d'un devis de réparation. Il est majoré de 10 € entre 15 et 30 km et de 20 € entre 30 et 45 km. Au-delà de 45 km, le supplément est fixé à l'avance avec le client. La distance est calculée par la route.

## 4. Devis

Le devis de travaux est gratuit ; le devis de réparation établi lors d'un dépannage est compris dans le forfait. Il est obligatoire, et remis avant toute exécution, pour les travaux dont le montant dépasse 150 € TTC, ainsi qu'à la demande du client pour tout montant. Il précise la nature des travaux, le matériel, le prix et sa durée de validité (un mois sauf mention contraire). Les travaux commencent après acceptation écrite et signée du devis.

## 5. Déroulement d'un dépannage

Le montant du forfait dépannage, supplément kilométrique éventuel compris, est annoncé au client avant le déplacement. À l'issue de la recherche de panne, un devis de réparation lui est remis ; il reste libre de l'accepter ou de le refuser, sans obligation. En cas de refus, seul le forfait dépannage est dû.

Si, à l'issue de la recherche, l'origine de la panne n'a pas pu être identifiée, une remise est consentie au client sur le forfait dépannage. Son montant lui est communiqué sur place, avant le règlement, et figure sur la facture.

## 6. Droit de rétractation

Lorsque le contrat est conclu à distance ou hors établissement, le client dispose d'un délai de **14 jours** pour se rétracter, sans avoir à se justifier (articles L221-18 et suivants du Code de la consommation). Un formulaire de rétractation est joint au devis.

Si le client demande expressément que les travaux commencent avant la fin de ce délai, il en fait la demande écrite ; en cas de rétractation, il devra le montant correspondant au service fourni jusqu'à la communication de sa décision.

Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux **travaux d'entretien ou de réparation à réaliser en urgence** au domicile du client et expressément sollicités par lui, dans la limite des pièces de rechange et travaux strictement nécessaires pour répondre à l'urgence.

## 7. Paiement

Le paiement est dû à la fin de l'intervention pour les dépannages, et selon l'échéancier prévu au devis pour les travaux (un acompte peut être demandé à la commande). Les moyens de paiement acceptés sont indiqués sur le devis. Une facture détaillée est remise pour chaque intervention.

## 8. Obligations du client

Le client garantit l'accès au logement et au tableau électrique au créneau convenu. Il informe ${site.name} de toute particularité connue de l'installation (travaux antérieurs, sinistre, présence d'amiante dans les zones de travail).

## 9. Matériel

Le matériel fourni est neuf, de marque et conforme aux normes en vigueur. Il reste la propriété de ${site.name} jusqu'au paiement complet. Lorsque le client fournit lui-même du matériel, ${site.name} ne peut être tenu responsable de sa conformité ni de ses défauts.

## 10. Garanties

Les travaux bénéficient des garanties légales applicables. ${site.name} est assuré en ${L.insuranceScope.toLowerCase()} auprès de ${L.insurer} (contrat ${L.insuranceContract}), couverture : ${L.insuranceArea}. Le matériel bénéficie en outre de la garantie du fabricant.

## 11. Réclamations et médiation

Toute réclamation peut être adressée à ${site.email} ou par courrier. En cas de litige non résolu, le client peut recourir gratuitement au médiateur de la consommation : ${L.mediator}${L.mediatorUrl ? ` ([${L.mediatorUrl}](${L.mediatorUrl}))` : ''}.

## 12. Droit applicable

Les présentes conditions sont soumises au droit français.`,
  },
];
