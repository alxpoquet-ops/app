// Mentions légales, politique de confidentialité, conditions générales de vente
// ⚠️ Les éléments entre accolades proviennent de src/config.js et doivent y être complétés.
// ⚠️ Modèle à faire relire : il ne remplace pas l'avis d'un professionnel du droit.
// Règles : aucun tiret long, phrases courtes, rien d'invérifiable. Le nom de marque vient de site.name.
const { site, annuel, paiement, fidelite, forfaits, lissage, types, options, jetonsLia, delais = { reponse: '72 heures', titan: '24 heures' } } = require('../config');
const L = site.legal;
const contact = site.email ? `e-mail à ${site.email} ou le formulaire de contact (${site.url}/contact/)` : `le formulaire de contact (${site.url}/contact/)`;
const addr = `${site.address.street ? site.address.street + ', ' : ''}${site.address.postalCode} ${site.address.city}`;
const UPDATED = '2026-11-15';

// Le forfait Titan peut ne pas encore exister : chaque phrase qui le cite est conditionnelle.
const F = (id) => forfaits.find((f) => f.id === id);
const chico = F('chico') || forfaits[0];
const power = F('power') || forfaits[1] || chico;
const titan = F('titan');
const solde = 100 - paiement.acompte;
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const listeForfaits = forfaits.map((f) => `${f.name} ${eur(f.month)} € par mois`).join(', ');
const listeTypes = types.map((t) => `${t.label.toLowerCase()} ${eur(t.price)} €`).join(', ');
const listeDelais = types.map((t) => `${t.label.toLowerCase()} : ${t.delai}`).join(' ; ');
const listeOptions = options
  .map((o) => `${o.name.toLowerCase()} ${o.price.month ? `${eur(o.price.month)} € par mois` : `${eur(o.price.once)} € une fois`}`)
  .join(', ');
const tvaMention = L.tva || 'non applicable, art. 293 B du CGI';
// Jetons Lia : les nombres viennent de config.jetonsLia, pour que les CGV suivent toujours les prix.
const modifsAlex = (f) => `${f.quota} modification${f.quota > 1 ? 's' : ''} par Alex`;
const liaPlusOpt = options.find((o) => o.id === 'liaplus');
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

Les informations du site sont données à titre indicatif et peuvent évoluer. Seul le récapitulatif de commande accepté engage les deux parties. Le comparatif avec les autres solutions ne cite aucun prix de concurrent : il décrit des façons de travailler.

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

- **Demande de contact ou de devis** : votre nom, votre e-mail, votre téléphone si vous le donnez, vos choix dans le configurateur (type de site, forfait, options, nom de domaine) et votre message.
- **Commande en ligne** : prénom, nom, e-mail, téléphone, adresse postale, nom de votre activité, vos choix, le nom de domaine souhaité, votre message et un éventuel code de parrainage. L’adresse postale sert à la facture et à la réservation du nom de domaine.
- **Espace client** : vos identifiants, vos demandes de modification (texte et photos) et la date de votre dernière connexion.
- **Paiement** : je ne reçois jamais votre numéro de carte ni votre IBAN (voir le point 4).

## 3. Pourquoi je les utilise

Pour vous répondre et préparer votre récapitulatif. Pour exécuter votre commande : créer le site, réserver le nom de domaine, gérer le forfait et les demandes. Pour établir les factures et les garder le temps prévu par la loi. Rien d’autre : pas de publicité, pas de revente, pas de profilage.

## 4. Paiement par Stripe

Les paiements sont confiés à Stripe, prestataire de paiement. Au moment de payer, vous saisissez vos données bancaires sur une page sécurisée de Stripe. Elles ne passent pas par mon site et ${site.name} ne les stocke jamais. Je reçois seulement l’état du paiement (réussi, en attente, refusé) et la facture correspondante. Stripe traite ces données selon sa propre politique de confidentialité, consultable sur [stripe.com/fr/privacy](https://stripe.com/fr/privacy).

## 5. Nom de domaine

Quand vous vérifiez un nom de domaine, le nom saisi est envoyé au registre officiel de l’extension par le protocole RDAP : l’AFNIC pour les .fr, Verisign pour les .com et les .net, PIR pour les .org. Cette vérification part de votre navigateur pendant que vous tapez, puis de mon serveur au moment de la commande, pour confirmer la disponibilité. Seul le nom recherché est transmis.

Pour réserver le nom de domaine, je transmets vos coordonnées de titulaire (prénom, nom, adresse, e-mail, téléphone) au bureau d’enregistrement et au registre de l’extension. C’est obligatoire pour que le nom de domaine soit enregistré à votre nom. En règle générale, les coordonnées d’un particulier ne sont pas publiées dans l’annuaire public du registre.

## 6. Espace client et comptes

Votre compte est créé automatiquement à la commande, avec votre adresse e-mail. Les demandes envoyées depuis l’espace client (texte et photos) servent uniquement à réaliser la modification demandée. Pour aller plus vite, je peux m’aider d’outils d’intelligence artificielle ; je vérifie tout avant la mise en ligne.

Un compte sans aucune connexion depuis 12 mois et sans forfait actif est supprimé automatiquement, avec les demandes et les photos qu’il contient. Un e-mail vous prévient 30 jours avant. Il suffit de vous connecter pour le conserver.

## 7. Durée de conservation

- Demandes sans suite : 3 ans après le dernier échange.
- Commandes et comptes clients : toute la durée de la relation, puis 5 ans pour les pièces du contrat et 10 ans pour les factures, comme la loi l’impose.
- Comptes inactifs : supprimés après 12 mois sans connexion ni forfait actif (point 6).

## 8. Destinataires

Vos données sont destinées à ${site.name} uniquement. Elles transitent par l’hébergeur du site, ${L.host}, par la messagerie qui reçoit les demandes, par Stripe pour le paiement et par le bureau d’enregistrement pour le nom de domaine. Elles ne sont jamais vendues ni cédées.

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
    description: `Conditions générales de vente d’${site.name} : commande en ligne, création à prix fixe en une ou plusieurs fois, forfaits, nom de domaine, rétractation, médiation.`,
    lead: 'Les règles du jeu, écrites simplement. Elles s’appliquent à toutes les prestations, avec le récapitulatif de commande.',
    updated: UPDATED,
    body: `## 1. Objet

Ces conditions s’appliquent à toute commande passée auprès d’${site.name} : création d’un site internet, forfait mensuel ou annuel, options et services liés. Elles complètent le récapitulatif de commande, qui précise le type de site, le forfait, les options et les prix.

## 2. Commande en ligne

La commande se passe sur le site, en trois étapes : le choix du site et du forfait, les coordonnées, puis le paiement sécurisé. Avant de payer, le client voit un récapitulatif complet, avec le montant réglé le jour même et les montants suivants.

En cliquant sur « Commander et payer », le client accepte ces conditions et passe une commande ferme. Il reçoit aussitôt un e-mail de confirmation avec une référence de commande, à rappeler dans les échanges.

Une commande peut aussi être passée par e-mail ou par message. Elle est alors ferme quand le client accepte le récapitulatif par écrit et règle le premier paiement.

## 3. Prix

Les prix sont en euros. La TVA n’est pas applicable (article 293 B du Code général des impôts) tant que l’entreprise bénéficie de la franchise de TVA. Si cette situation change, les prix affichés sont mis à jour ; les commandes déjà passées gardent leur prix.

La création du site est à prix fixe pour le type choisi : ${listeTypes}. Un site plus grand fait l’objet d’un devis. Les options sont au tarif indiqué à la commande : ${listeOptions}.

Les forfaits sont mensuels : ${listeForfaits}. À l’année, le client paie dix mois pour douze, soit ${annuel.moisOfferts} mois offerts.

## 4. Paiement de la création

Le client choisit l’une des deux formules au moment de la commande.

- **À la commande** : un acompte de ${paiement.acompte} % du prix de la création.
- **À la réception du site** : le reste, en une fois. Le forfait démarre à ce moment-là.
- **Ou, à la réception, en ${lissage.durees.join(' ou ')} fois sans frais** : le reste du prix du site est divisé en ${lissage.durees.join(' ou ')} mensualités, au choix du client, ajoutées au forfait. Le forfait est alors payé au mois. Chaque échéance est arrondie au centime inférieur : le total ne dépasse jamais le prix du site. Les prélèvements s’arrêtent d’eux-mêmes après la dernière échéance.

## 5. Paiement du forfait et factures

Le forfait démarre le jour de la commande : il couvre dès ce jour la réservation du nom de domaine et la préparation de l’hébergement. Il est prélevé d’avance, chaque mois ou chaque année selon la période choisie.

Les paiements sont confiés à Stripe, par carte bancaire ou prélèvement SEPA. ${site.name} ne voit pas et ne conserve pas les données bancaires. Chaque facture est envoyée par e-mail et reste disponible dans l’espace client.

En cas d’échec de paiement, le client est prévenu par e-mail. Si rien n’est régularisé sous 30 jours, le site peut être mis en pause jusqu’au règlement.

## 6. Engagement et résiliation

- **Reste payé en une fois** : le forfait est sans engagement. Le client peut l’arrêter à tout moment par e-mail ou par message : le bouton est dans son espace client. L’arrêt prend effet à la fin de la période déjà payée.
- **Reste payé en plusieurs fois** : le client s’engage le temps du paiement, à partir de la réception du site, soit ${lissage.durees.join(' ou ')} mois. S’il arrête avant, le reste du prix de création devient exigible en une fois. Ensuite, le forfait est sans engagement.

Le client peut changer de forfait à tout moment. Le nouveau prix s’applique à la période suivante.

## 7. Fin du forfait

À la fin du forfait, le client reçoit son site sous forme de fichiers (textes, images, pages), pour le faire héberger où il veut. Le nom de domaine lui appartient : il peut le transférer vers le prestataire de son choix. L’hébergement par ${site.name} s’arrête 30 jours après la fin du forfait.

## 8. Droit de rétractation

Le client qui commande à distance dispose de 14 jours pour se rétracter, sans avoir à se justifier. Un message par ${contact} suffit.

En commandant, le client demande expressément, en cochant la case prévue, que la création commence tout de suite. S’il se rétracte pendant ces 14 jours, il paie le travail déjà réalisé, au prorata du prix de création. Le nom de domaine déjà réservé reste à sa charge, car il est enregistré à son nom et pour un an.

## 9. Nom de domaine

Le client est le titulaire de son nom de domaine. ${site.name} y figure comme contact technique, pour pouvoir le gérer. Le nom est réservé après le premier paiement, s’il est encore disponible à ce moment-là.

Le prix d’un nom de domaine standard en .fr, .com, .net ou .org est compris dans le forfait. Les autres extensions et les noms dits « premium », vendus plus cher par les registres, font l’objet d’un devis.

Si le client possède déjà un nom de domaine, il peut le transférer vers ${site.name} ou le garder chez son prestataire et le faire pointer vers le site. ${site.name} lui envoie les réglages à faire.

## 10. Création du site et délais

Le client fournit ses textes, photos et informations, ou les prépare avec ${site.name} à partir de ses explications. Les délais annoncés (${listeDelais}) sont indicatifs. Ils courent à partir de la réception de ces éléments. Le client voit son site avant la mise en ligne et peut demander des ajustements sur ce qui a été commandé.

## 11. Modifications comprises

Le client envoie ses demandes de modification depuis son espace client ou par message. Il y a deux sortes de modifications :

- **Par Lia** : une modification faite par Lia, l’IA d’${site.name}, et payée en Jetons Lia. Lia montre l’aperçu au client et ne modifie le site qu’après son accord.
- **Par Alex** : une modification faite à la main, vérifiée et paramétrée par Alex.

Les **Jetons Lia** paient ce que fait Lia : les modifications du site et les outils de l’espace client (publications pour les réseaux, hashtags, réponses aux avis, fiches produit et autres outils du même genre). Un Jeton Lia vaut ${eur(Math.round(jetonsLia.valeur * 100))} centime d’euro.

Chaque forfait comprend, par mois :

- ${chico.name} : ${chico.jetons} Jetons Lia et ${modifsAlex(chico)}.
- ${power.name} : ${power.jetons} Jetons Lia et ${modifsAlex(power)}.
${titan ? `- ${titan.name} : ${titan.jetons} Jetons Lia et ${modifsAlex(titan)}.` : ''}

Une modification faite par Lia coûte ${jetonsLia.modif.base} Jetons Lia, plus 1 jeton par tranche de ${jetonsLia.modif.mots} mots écrits dans la demande, plus ${jetonsLia.modif.image} jetons par photo jointe. Les outils de l’espace client sont accessibles dès le forfait ${chico.name}. Chaque outil se paie en Jetons Lia, au tarif affiché avant son utilisation.

Les Jetons Lia et les modifications par Alex sont comptés séparément. Les jetons du forfait sont remis chaque mois et ne se reportent pas d’un mois sur l’autre. Lia réalise les petites et moyennes modifications (un budget de mots et d’images par demande, sur une seule page) et montre toujours un aperçu que le client valide avant toute mise en ligne. Alex réalise les plus grandes. Une demande trop grande pour Lia est transmise à Alex. Elle compte alors parmi les demandes Alex, et ses jetons sont rendus au client.

L’option Lia + ajoute ${jetonsLia.liaplus} Jetons Lia par mois${liaPlusOpt ? `, pour ${eur(liaPlusOpt.price.month)} € par mois` : ''}. Le client peut aussi acheter une recharge à l’unité : ${listeRecharges}. La recharge est ajoutée à sa prochaine facture. Les jetons d’une recharge ne s’effacent pas à la fin du mois.

Une modification est un changement précis sur une page existante : un texte, un prix, un horaire, une photo, un produit. Les modifications par Alex non utilisées ne se reportent pas. Une demande peut être annulée gratuitement par le client dans les 24 heures qui suivent son envoi, depuis son espace client, dans la limite de trois annulations par mois : elle n’est alors pas décomptée, ses jetons sont rendus, et ce que Lia avait mis en ligne est remis comme avant. Au-delà, l’annulation se demande à Alex. Les modifications réalisées par Lia sont mises en ligne dès que le client valide l’aperçu, en général dans les 5 minutes qui suivent la demande. Au-delà du nombre de modifications par Alex compris, le client peut demander un Boost : une modification en plus pour 1 €, réalisée par Alex, ajoutée à sa prochaine facture, avec son accord à chaque demande. Sinon, la demande est reportée à la période suivante, au choix du client. Une page nouvelle ou un site plus grand fait l’objet d’un devis.

## 12. Délais de réponse

${site.name} répond à chaque demande sous ${delais.reponse}, en jours ouvrés${titan ? `, et sous ${delais.titan} pour le forfait ${titan.name}` : ''}. Répondre, c’est prendre en charge la demande et donner une date. Les petites modifications sont en général faites dans ce délai.

## 13. Espace client et compte

Un espace client est créé automatiquement à la commande, avec l’adresse e-mail du client. Il y suit sa commande, ses demandes, son forfait et ses factures. Il garde ses identifiants pour lui et prévient ${site.name} en cas de doute sur leur usage.

Un compte sans connexion depuis 12 mois et sans forfait actif est supprimé automatiquement, avec ses demandes et ses photos. Le client est prévenu par e-mail 30 jours avant. Une connexion suffit pour annuler la suppression. Les factures sont conservées en dehors du compte, le temps prévu par la loi.

## 14. Contenus fournis par le client

Le client garantit qu’il a le droit d’utiliser les textes, images, logos et produits qu’il fournit. Il reste responsable des informations légales propres à son activité : mentions obligatoires, conditions de vente de sa boutique, prix affichés.

## 15. Versions et intelligence artificielle

Chaque version du site est conservée et peut être restaurée sur demande. ${site.name} s’aide d’outils d’intelligence artificielle pour travailler plus vite ; chaque modification est relue et testée avant la mise en ligne.

## 16. Référencement

Le référencement est une obligation de moyens. ${site.name} applique les bonnes pratiques et suit les résultats, sans garantir une position donnée sur Google.

## 17. Parrainage et fidélité

Chaque client dispose d’un lien et d’un code de parrainage dans son espace client. Quand le site d’un filleul est en ligne, le parrain et le filleul reçoivent chacun ${fidelite.parrainageMois} mois de forfait offert, crédité sur la facture suivante. Un deuxième site commandé par le même client bénéficie de ${fidelite.remiseSecondSite} % sur la création. Ces avantages ne sont pas convertibles en argent.

## 18. Responsabilité

${site.name} met tout en œuvre pour que le site reste disponible et sauvegardé. ${site.name} ne peut pas être tenu responsable d’une panne de l’hébergeur, d’un registre ou du service de paiement, ni des contenus fournis par le client. Un éventuel dédommagement ne peut pas dépasser les sommes versées au titre du forfait au cours des 12 derniers mois, sauf si la loi en dispose autrement.

## 19. Médiation et litiges

En cas de désaccord, le client écrit d’abord par ${contact} : la plupart des questions se règlent en quelques échanges. Si la réponse ne lui convient pas, le client consommateur peut saisir gratuitement un médiateur de la consommation : ${L.mediator}. Le droit français s’applique.`,
  },
];
