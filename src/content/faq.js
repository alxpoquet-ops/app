// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes et honnêtes, aucun tiret long, aucun prix d'un concurrent nommé
// (seule la fourchette du marché de config.marche est citée),
// et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page (scripts/check.js).
// V2 (novembre 2026) : Alex fait chaque site. Ses automatisations forment une petite bande de petits monstres
// (config.bande) : le gardien est compris, l'écrivain et le messager aident au quotidien, et chaque option au mois
// en ajoute un. Les petites retouches et les outils sont compris pour un usage normal. On ne parle pas du compteur.
const cfg = require('../config');
const { forfaits, annuel, lissage, options, paiement, fidelite, delais, creation, aLaDemande, marche, bande } = cfg;
// Réglages du compteur des outils (appelé « énergie » dans l'espace client) : on n'en cite que la plus petite recharge.
const compteur = Object.values(cfg).find((v) => v && v.recharge && v.modif);
const rechargeMin = compteur.recharge[0].prix;
const opt = (id) => options.find((o) => o.id === id);
const demande = (id) => aLaDemande.find((x) => x.id === id);
const abo = forfaits[0]; // l'abonnement : il n'y en a qu'un
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}` : l.join(''));
const durees = lissage.durees.join(' ou ');
const D1 = lissage.durees[0];
const LN = lissage.durees[lissage.durees.length - 1];
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
// Mensualité du lissage, arrondie au centime inférieur (même règle que le serveur).
const lisse = (prix, n = LN) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // mensualité du reste, après l’acompte
const annee = abo.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const boutique = creation.prix + creation.boutique;
// L'intervention d'Alex comprise : une par trimestre depuis la V2. Les clients inscrits avant le 16 novembre 2026 gardent une par mois.
const periode = abo.periode || 'mois';
const interventions = abo.quota === 1 ? 'une intervention' : `${abo.quota} interventions`;
const anciens = periode === 'trimestre' ? ' Inscrit avant le 16 novembre 2026 ? Vous gardez une intervention d’Alex chaque mois.' : '';
// La petite bande : on présente chaque petit monstre par son rôle, jamais par un prénom.
const gardien = minus(bande.find((b) => b.id === 'gardien').role); // le gardien
const bricoleur = minus(bande.find((b) => b.id === 'bricoleur').role); // le bricoleur, pour les petites modifications
const NOMBRE = ['aucun', 'un', 'deux', 'trois', 'quatre', 'cinq'];
const compris = bande.filter((b) => b.compris);
const listeCompris = liste(compris.map((b) => minus(b.role))); // l’assistante, le gardien et le bricoleur
const auQuotidien = liste(bande.filter((b) => b.outils).map((b) => minus(b.role))); // l’écrivain et le messager
const parOption = liste(bande.filter((b) => b.option && opt(b.option)).map((b) => `${minus(b.role)} avec ${opt(b.option).name}`));
const etoile = minus(bande.find((b) => b.option === 'seo').role); // l’étoile de Google
const alexPlus = demande('alex'), urgent = demande('urgent'), article = demande('article');
const listeDemande = (() => {
  const l = aLaDemande.map((x) => `${minus(x.name)} à ${eur(x.prix)} €`);
  return `${l.slice(0, -1).join(', ')} ou ${l[l.length - 1]}`;
})();
const extras = options.filter((o) => o.quand === 'mois');
const prixExtra = (o) => `${o.name} à ${eur(o.price.month)} €`;
const extrasTous = extras.filter((o) => !o.types).map(prixExtra).join(', ');
const extrasBoutique = extras.filter((o) => o.types).map(prixExtra).join(' et ');

module.exports = {
  creation: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: 'Non. On écrit les textes ensemble à partir de ce que vous me racontez, et je choisis des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.' },
    { q: 'Quel site choisir ?', a: `Une seule page, si vous démarrez ou si quelques lignes suffisent pour vous présenter : c’est votre carte de visite sur internet. Plusieurs pages, si vous avez plusieurs services ou si vous voulez bien sortir sur Google : chaque page parle d’un sujet, et Google peut toutes les montrer. Le prix reste le même jusqu’à ${creation.pages} pages, alors choisissez selon ce que vous avez à dire. Ajoutez la boutique en ligne si vous voulez vendre vos produits sur internet. Vous hésitez ? Écrivez-nous, on vous conseille.` },
    { q: 'Le prix de création est-il vraiment fixe ?', a: `Oui : ${eur(creation.prix)} € pour votre site, d’une seule page ou de plusieurs, jusqu’à ${creation.pages} pages. Une boutique en ligne ajoute ${eur(creation.boutique)} €. Il vous faut plus de place ? Chaque page au-delà de ${creation.pages} coûte ${eur(creation.pagePlus)} €, payée une fois. Tout est écrit dans le récapitulatif avant de commencer.` },
    { q: 'Les pages pour Google sont-elles payantes ?', a: `Non. Les pages que je crée pour vous faire trouver sur Google sont comprises, et elles ne comptent pas dans vos ${creation.pages} pages. Ce sont par exemple des pages de conseils, de questions fréquentes ou une page par ville. Je ne crée pas des pages pour en créer : chacune est réfléchie, elle répond à une vraie recherche de vos clients, et elle est optimisée pour bien sortir.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. C’est moi qui conçois et fais votre site, et ma petite bande d’automatisations prend en charge ce qui se répète. Je vais donc plus vite, et je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % en commandant. À la réception du site, vous réglez le reste d’un coup, ou en ${durees} fois sans frais. Votre abonnement commence ce jour-là, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: 'Vous composez votre site, puis vous cliquez sur Commander. Vous relisez le récapitulatif, vous donnez vos coordonnées et vous payez en ligne. Un e-mail de confirmation arrive aussitôt, avec une référence de commande. Je vous écris ensuite pour démarrer.' },
    { q: 'Que paie-je aujourd’hui ?', a: `Seulement ${paiement.acompte} % du site, et les options payées une fois s’il y en a. L’abonnement ne démarre qu’à la réception du site, avec le reste à payer en une fois ou en ${durees} fois sans frais. Le montant exact s’affiche sur le bouton avant de valider.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui. Après l’acompte de ${paiement.acompte} %, le reste se paie à la réception, en ${durees} fois sans frais. Pour un site à ${eur(creation.prix)} € : ${eur(acompte(creation.prix))} € à la commande, puis ${eur(lisse(creation.prix, D1))} € par mois pendant ${D1} mois, ou ${eur(lisse(creation.prix))} € pendant ${LN} mois. L’abonnement se paie alors au mois. Rien de plus quand c’est fini.` },
    { q: 'Suis-je engagé ?', a: `Non. L’abonnement s’arrête quand vous le décidez, à la fin de la période payée. Seule exception : si vous payez le reste du site en ${durees} fois, vous vous engagez le temps du paiement. Si vous partez avant, ce qui reste du prix du site est dû en une fois.` },
    { q: 'Puis-je ajouter ou retirer un extra plus tard ?', a: 'Oui, quand vous voulez, depuis votre espace client. Le nouveau prix démarre à la période suivante. Les options de création, elles, se paient une seule fois : pour en ajouter une après coup, écrivez-moi.' },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe émet la facture et vous l’envoie par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas : l’entreprise est en franchise (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Vous me prévenez, et l’abonnement se termine à la fin de la période en cours. Vous repartez avec votre nom de domaine et une copie complète de votre site. L’hébergement chez moi reste actif 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme vous me demandez de commencer tout de suite, vous payez seulement le travail déjà fait, au prorata. Le nom de domaine déjà réservé reste à votre charge : il est à votre nom, pour un an.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `${eur(creation.prix)} € une fois pour le site, puis ${eur(abo.month)} € par mois pour l’abonnement. Le prix du site ne change pas, d’une page à ${creation.pages} pages. La première année revient donc à ${eur(creation.prix + 12 * abo.month)} €, ou à ${eur(creation.prix + annee)} € si vous payez l’abonnement à l’année.` },
    { q: 'Que comprend l’abonnement ?', a: `Tout ce qui fait tourner votre site : le nom de domaine, à votre nom et renouvelé chaque année, l’hébergement, les mises à jour, les sauvegardes et le suivi du site. Il y a aussi le support, avec une réponse sous ${delais.reponse}, et les bases du SEO. ${gardien.charAt(0).toUpperCase() + gardien.slice(1)}, un petit monstre de ma bande, veille sur votre site. Vous profitez aussi des petites retouches et des outils de la bande, compris tant que l’usage reste normal. S’y ajoute ${interventions} d’Alex par ${periode}.${anciens}` },
    { q: 'L’abonnement est-il obligatoire ?', a: 'Oui, tant que votre site est en ligne chez moi : c’est lui qui paie le nom de domaine, l’hébergement et l’entretien. Mais il est sans engagement. Vous l’arrêtez quand vous voulez, et vous gardez votre nom de domaine et une copie de votre site.' },
    { q: 'Qui sont les petits monstres ?', a: `Ce sont mes automatisations. Je les ai programmées une par une, puis dessinées en petits monstres. Chacun s’occupe d’une tâche répétitive mais utile, et il travaille seul. L’abonnement de base en compte ${NOMBRE[compris.length] || compris.length} : ${listeCompris}. ${gardien.charAt(0).toUpperCase() + gardien.slice(1)} s’occupe des mises à jour, des sauvegardes, de la sécurité et de la surveillance, et ${bricoleur} de vos petites modifications. Dans votre espace client, ${auQuotidien} vous donnent un coup de main au quotidien. Chaque option au mois en ajoute un autre : ${parOption}. Je vérifie toujours ce qu’ils font.` },
    { q: 'Et si j’ai besoin de plus de modifications ?', a: `Les petites retouches passent par la bande, et vous pouvez en reprendre si vous dépassez un usage normal. Vous voulez qu’Alex repasse avant le prochain ${periode} ? Commandez ${minus(alexPlus.name)} depuis votre espace client, pour ${eur(alexPlus.prix)} €. Elle s’ajoute à votre facture suivante.` },
    { q: 'Une retouche qui échoue est-elle comptée ?', a: 'Non. Elle ne compte pas si la mise en ligne échoue, si vous refusez l’aperçu ou si la demande passe à Alex. C’est pareil quand vous annulez une demande dans les 24 heures qui suivent son envoi, jusqu’à trois fois par mois.' },
    { q: 'Qui fait mes modifications ?', a: `C’est vous qui choisissez, à chaque demande. Pour une petite retouche, ${bricoleur}, un petit monstre de la bande, prépare le changement en quelques minutes et vous en montre l’aperçu : rien ne bouge sur votre site sans votre accord. Les plus grandes, je les fais à la main : ${interventions} par ${periode} est comprise, faite sous ${delais.reponse}, et je la vérifie moi-même. Je garde aussi un œil sur le travail de la bande.` },
    { q: 'Quels extras puis-je ajouter à l’abonnement ?', a: `Ils se paient au mois, et vous les ajoutez ou les retirez quand vous voulez depuis votre espace client : ${extrasTous}. Pour les boutiques en ligne, il y a aussi ${extrasBoutique}. Chacun ajoute un petit monstre à votre bande. Aucun n’est obligatoire.` },
    { q: 'Et les extras à la demande ?', a: `Ils se paient une fois, seulement quand vous en avez besoin : ${listeDemande}. Vous les commandez vous-même depuis votre espace client, et le montant est ajouté à votre prochaine facture. Pas de commande, rien à payer.` },
    { q: 'Et pour une boutique en ligne ?', a: `C’est ${eur(creation.boutique)} € de plus à la création, soit ${eur(boutique)} € une fois. L’abonnement reste à ${eur(abo.month)} € par mois. La boutique comprend le paiement par carte, le suivi des commandes et jusqu’à 20 produits que j’ajoute pour vous.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous voulez. Au mois, l’abonnement coûte ${eur(abo.month)} €. À l’année, il coûte ${eur(annee)} € : vous payez dix mois d’un coup et ${annuel.moisOfferts} sont offerts. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'Qu’est-ce qui compte comme une modification ?', a: `Un changement précis sur une page qui existe : un horaire, un prix, une photo, un texte, un produit. Une demande, une modification. L’intervention d’Alex du ${periode} ne se reporte pas si vous ne l’utilisez pas. Une nouvelle page coûte 10 €, à commander depuis votre espace client. Une nouvelle fonction, c’est un petit devis.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site fait à la main ?`, a: `Parce que j’ai passé beaucoup de temps à programmer ma petite bande, des automatisations qui prennent en charge tout ce qui se répète. J’ai aussi des accès directs chez des hébergeurs français. Pas de magie là-dedans, juste de l’optimisation. Un site vitrine fait à la main par une agence ou un indépendant coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Chez moi, c’est ${eur(creation.prix)} €. Vous ne payez pas des semaines de travail, et votre site est quand même conçu, relu et testé par moi.` },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif indique tout : la création, l’abonnement, les options et les extras choisis. Les extras à la demande, eux, ne se paient que si vous les commandez. Rien d’autre.' },
  ],
  espace: [
    { q: 'Comment demander une modification ?', a: 'Depuis votre espace client : vous écrivez ce que vous voulez changer, avec une photo si besoin. Vous choisissez ensuite : une petite retouche par la bande, ou une modification faite à la main par moi. Une question en chemin ? La bulle en bas de l’écran est là pour ça.' },
    { q: 'En combien de temps est-ce fait ?', a: `Une petite retouche prend quelques minutes : vous validez l’aperçu et c’est en ligne. À la main, je vous réponds sous ${delais.reponse} en jours ouvrés, et une petite modification est en général faite dans ce délai. Je vous préviens dès que c’est fait. Pressé ? Avec l’extra « ${urgent.name} », à ${eur(urgent.prix)} €, votre demande passe en priorité.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre abonnement tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: `Non, il fait partie de l’abonnement : demandes de modification, tableau de bord, parrainage et factures. Les outils de ${auQuotidien} y sont compris aussi, pour un usage normal. C’est également là que vous commandez les extras à la demande.` },
    { q: 'Que se passe-t-il si j’utilise beaucoup les outils ?', a: `Pour un usage normal, rien du tout : les outils et les petites retouches sont compris. Si vous en faites beaucoup plus, vous pouvez en reprendre depuis votre espace client, à partir de ${eur(rechargeMin)} €, ajouté à votre prochaine facture. Ce que vous reprenez reste disponible tant que vous ne l’avez pas utilisé.` },
  ],
  seo: [
    { q: 'En combien de temps serai-je sur Google ?', a: 'Votre site est déclaré à Google dès la mise en ligne. On le trouve vite sur votre nom. Pour des recherches plus disputées, comptez quelques semaines à quelques mois.' },
    { q: 'Le SEO est-il compris dans l’abonnement ?', a: `Les bases, oui : Google sait lire et comprendre votre site. Pour le faire remonter mois après mois, il y a l’extra ${opt('seo').name}, à ${eur(opt('seo').price.month)} € par mois : ${etoile} rejoint alors votre bande. Vous le prenez quand vous voulez, et vous l’arrêtez de la même façon.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté. Avec l’extra ${opt('seo').name}, je vous montre chaque mois où vous en êtes.` },
    { q: 'C’est quoi, un contenu optimisé ?', a: `Un article ou une page qui répond à une vraie question de vos clients, avec des titres clairs et des liens vers vos services. La bande en prépare une première version, et je la relis avant de la publier. Vous pouvez en commander un à l’unité avec l’extra « ${article.name} », à ${eur(article.prix)} €.` },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: 'Oui. Je regarde votre site et je vous dis ce qui freine votre visibilité. Écrivez-moi pour un devis.' },
  ],
  methode: [
    { q: 'Mes clients verront-ils que des automatisations ont servi ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
    { q: 'Les petits monstres peuvent-ils se tromper ?', a: 'Oui, comme tout outil automatique. C’est pour ça que je vérifie leur travail, et que rien n’est publié sans votre accord. Ils vont vite, mais c’est moi qui valide.' },
    { q: 'Les petits monstres font-ils mon site ?', a: 'Non. C’est moi qui conçois et qui fais votre site, page par page. La bande s’occupe de ce qui se répète autour : les mises à jour, les sauvegardes, la surveillance, les petites retouches. Les choix, la relecture et les vérifications, c’est moi.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins cher qu’une agence ?', a: 'Parce que je travaille autrement. Ma petite bande d’automatisations se charge des tâches répétitives, et je traite directement avec des hébergeurs français, sans intermédiaire. Je n’ai ni local à payer ni équipe à faire tourner. Je garde les projets simples, que je sais bien faire. Pour un gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, c’est vous qui construisez le site, le mettez à jour et écrivez pour Google, souvent le soir. Chez moi, vous décrivez ce que vous voulez et je le fais. Vous n’avez aucun outil à apprendre.' },
    { q: 'Et par rapport à un freelance ?', a: `Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Mon abonnement prend la suite : hébergement, sauvegardes, mises à jour, la bande et ses outils, ${interventions} d’Alex par ${periode}, tout est compris. Vous connaissez le prix à l’avance.` },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Le nom de domaine est à vous et se transfère où vous voulez. Je vous remets aussi les fichiers du site, pour le faire héberger ailleurs. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois d’abonnement offert.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
  ],
};
