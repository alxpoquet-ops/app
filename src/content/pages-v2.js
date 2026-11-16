// Pages V2 : réassurance, guides de fond et page locale (novembre 2026).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de src/config.js),
// aucun chiffre sans source, et pas de phrase de 9 mots ou plus reprise d'une autre page.
const { site, creation, types, forfaits, annuel, lissage, delais, options, aLaDemande, paiement, marche, fidelite, clients, jetonsLia } = require('../config');

// helpers
const T = (id) => types.find((t) => t.id === id);
const O = (id) => options.find((o) => o.id === id);
const A = (id) => aLaDemande.find((a) => a.id === id);
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500

const page = T('une-page'), vitrine = T('vitrine'), boutique = T('boutique');
const abo = forfaits[0]; // l'abonnement : il n'y en a qu'un
const annee = abo.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const durees = lissage.durees.join(' ou ');
const seo = O('seo');
const extrasMois = options.filter((o) => o.quand === 'mois');
// Jetons : ceux de l'abonnement reviennent le 1er du mois, ceux rachetés restent.
const recharge = jetonsLia.recharge[0]; // la plus petite recharge, rachetée à l'utilisation
const OUTIL = '3 à 16'; // jetons pour un outil, le prix exact est affiché sur son bouton
const retouchesMois = Math.floor(abo.jetons / jetonsLia.modif.base); // petites retouches automatiques avec les jetons du mois
// Textes publics : on parle des automatisations d'Alex et des « retouches automatiques », pas de Lia
// (au plus une mention par page, comme l'assistante de la bulle en bas de l'écran).
const alexEnPlus = A('alex'), urgent = A('urgent');
const interv = abo.quota === 1 ? 'une intervention' : `${abo.quota} interventions`;
const ville = site.address.city.replace(/'/g, '’');
const dept = site.address.department;
const num = site.address.postalCode.slice(0, 2);
const flore = clients.find((c) => c.nom === 'Flore et Chenilles');

// Sources des chiffres cités (page « Pourquoi avoir un site internet ? »)
const SRC_BARO = 'https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/barometre-du-numerique/le-barometre-du-numerique-edition-2026.html';
const SRC_BARO_INFO = 'https://www.arcep.fr/uploads/tx_gspublication/barometre-du-numerique-edition-2026_INFOGRAPHIE.pdf';

const PUBLIE = '2026-11-16';

const pages = [
  // ------------------------------------------------------------------ pourquoi moins cher
  {
    path: '/pourquoi-moins-cher/',
    nom: 'Pourquoi moins cher',
    icon: 'piggy-bank',
    color: 'lilac',
    title: 'Pourquoi un site moins cher, sans rien sacrifier | Alex & Lia',
    description: `Un site à partir de ${eur(creation.prix)} € : le temps gagné sur les tâches répétitives, ce qu’Alex vérifie à la main, et tout ce qui n’est jamais sacrifié.`,
    h1: 'Pourquoi sommes-nous moins chers ?',
    lead: 'Un site coûte cher surtout à cause du temps passé dessus. J’ai réduit ce temps, pas le soin. Voici comment, et ce que vous gardez.',
    resume: 'Le temps gagné, et ce qui ne change pas.',
    points: [
      { icon: 'timer', t: 'De l’optimisation', d: 'Un travail automatisé là où il se répète, et un hébergement en direct, en France.' },
      { icon: 'user-check', t: 'Tout vérifié à la main', d: 'Je relis, je teste sur téléphone et je mets en ligne moi-même.' },
      { icon: 'badge-euro', t: 'Un prix affiché', d: `À partir de ${eur(creation.prix)} €, le même pour tous, sans devis à attendre.` },
      { icon: 'shield-check', t: 'Rien de sacrifié', d: 'Qualité, sécurité, référencement et un vrai interlocuteur restent au rendez-vous.' },
    ],
    body: `## Ce que vous payez vraiment dans un site

Un site internet, c’est surtout du temps. Quand un indépendant le fait entièrement à la main, il y passe des jours, parfois des semaines : la maquette, la mise en page de chaque écran, les premiers textes, les réglages, les tests. Ce temps a un prix, et c’est lui qui fait la facture.

D’après des repères publics relevés en France, un site vitrine fait par un indépendant coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Son entretien revient souvent entre ${mille(marche.entretienMin)} et ${mille(marche.entretienMax)} € par mois. Ces prix ne sont pas exagérés : ils correspondent au travail fourni.

Mon idée est différente. Je passe moins de temps sur ce qui se répète d’un site à l’autre, pour que les petites entreprises et les associations aient elles aussi un site pro, à un prix qu’elles peuvent se permettre.

## Pas de magie : de l’optimisation

J’ai passé du temps à automatiser mon travail, et j’ai des accès directs chez des hébergeurs français. C’est ce qui me permet de proposer ces prix. Ce n’est pas de la magie, c’est de l’optimisation.

### Un travail automatisé là où il se répète

Beaucoup d’étapes reviennent sur chaque projet. J’ai automatisé tout ce qui se répète : c’est ce qui fait baisser les délais et le prix. Ce qui me prenait des jours se fait maintenant en quelques heures.

- **La mise en page de base** : une première version des écrans, à partir de ce que vous m’avez raconté.
- **Les premiers textes** : une base de travail, que je reprends ensuite avec vos mots.
- **Les réglages** : les titres lus par Google, l’affichage sur téléphone, le formulaire de contact.

Résultat : un site une page est prêt en ${page.delai}, un site vitrine en ${vitrine.delai}.

### Un hébergement en direct

Vos sites sont hébergés en France, chez des hébergeurs auxquels j’accède en direct. Il n’y a pas d’intermédiaire entre eux et moi, et c’est aussi ce qui garde l’abonnement à un prix bas.

## Ce que je fais à la main

Mes automatisations vont vite, mais elles ne décident de rien. C’est moi qui conçois votre site : je vous écoute, je fais les choix et je reprends tout ce qu’elles préparent.

- **La relecture** : chaque page, chaque texte, chaque horaire et chaque prix affiché.
- **Les tests sur téléphone** : je parcours le site sur plusieurs appareils, comme le feront vos clients.
- **La vérification** : les liens, le formulaire, la vitesse d’affichage, les informations destinées à Google.
- **La mise en ligne** : je relie votre nom de domaine, j’installe le cadenas qui protège vos visiteurs et je publie le site moi-même.

Votre site ne part en ligne qu’après être passé entre mes mains.

## Un prix affiché, sans devis

Chez beaucoup de prestataires, il faut demander un devis, attendre, puis comparer. Ici, le prix est écrit sur le site et il est le même pour tout le monde. La création démarre à ${eur(creation.prix)} €, pour un site une page comme pour un site vitrine jusqu’à cinq pages. Une boutique en ligne ajoute ${eur(creation.boutique)} €.

Vous réglez ${paiement.acompte} % à la commande et le reste à la mise en ligne, en une fois ou en ${durees} fois sans frais. Ensuite, l’abonnement à ${eur(abo.month)} € par mois fait vivre le site, sans engagement. Le détail complet est sur la page [tarifs](/tarifs/).

## Les repères du marché, honnêtement

Face à un site vitrine fait par un indépendant, l’écart est souvent de ${marche.fois} fois. Je préfère pourtant être complet : des offres à bas prix existent aussi, entre ${mille(marche.basMin)} et ${mille(marche.basMax)} € le site. Face à elles, nous sommes dans les mêmes eaux.

La différence se joue alors sur ce qui vient avec : la vérification à la main, le suivi après la mise en ligne, et quelqu’un qui vous répond quand vous avez une question.

> Ces fourchettes sont des ordres de grandeur, relevés sur des pages publiques en novembre 2026. Chaque prestataire fixe ses prix, et un projet particulier peut coûter plus ou moins.

## Ce qui n’est pas sacrifié

Un prix plus bas ne veut pas dire un travail bâclé. Voici ce que vous gardez, quel que soit le site choisi :

- **La qualité** : un site moderne, clair et rapide, pensé d’abord pour le téléphone.
- **La sécurité** : le cadenas HTTPS, les mises à jour faites pour vous, les sauvegardes, un site surveillé.
- **Le référencement** : les bases sont posées sur chaque page, pour que Google comprenne votre activité.
- **Un vrai interlocuteur** : quand vous écrivez, c’est moi qui lis et qui réponds, sous ${delais.reponse}.
- **Votre liberté** : le nom de domaine est à votre nom, et l’abonnement s’arrête quand vous le décidez.

Et si votre projet dépasse ce que je sais bien faire, comme une application sur mesure ou un catalogue de milliers de produits, je vous le dis dès notre premier échange.`,
    faq: [
      { q: 'Moins cher, ça veut dire moins bien ?', a: 'Non. Le prix baisse parce que je passe moins de temps sur ce qui se répète, pas parce que je saute des étapes. Chaque site est relu, testé sur téléphone et vérifié avant d’être publié.' },
      { q: 'Mon site est-il fait automatiquement ?', a: 'Non. C’est moi qui conçois votre site. Mes automatisations s’occupent seulement de ce qui se répète : une mise en page de base, des premiers textes, des réglages. Je reprends ensuite tout à la main, je fais les choix avec vous et je publie le site moi-même.' },
      { q: 'Y a-t-il des frais en plus du prix affiché ?', a: `Non. La création démarre à ${eur(creation.prix)} €, puis l’abonnement coûte ${eur(abo.month)} € par mois. Les options sont facultatives, et leur prix est indiqué avant que vous commandiez.` },
      { q: 'Pourquoi n’y a-t-il pas de devis ?', a: 'Parce que la plupart des sites d’indépendants, d’artisans, de commerces ou d’associations se construisent de la même façon. Un prix fixe est plus simple pour vous comme pour moi. Pour un projet hors norme, je vous le dis franchement.' },
    ],
    voir: ['/tarifs/', '/pourquoi-alex-et-lia/', '/comparatif/'],
    cta: { titre: 'Un site soigné, à prix clair', texte: 'Choisissez votre site et vos options : le total apparaît tout de suite.' },
  },

  // ------------------------------------------------------------------ pourquoi un site internet
  {
    path: '/pourquoi-un-site-internet/',
    nom: 'Pourquoi un site',
    icon: 'globe',
    color: 'sky',
    title: 'Pourquoi avoir un site internet ? Les vraies raisons | Alex & Lia',
    description: 'Être trouvé, rassurer, recevoir des demandes sans dépendre d’une plateforme : ce qu’un site apporte de plus qu’une page Facebook ou une simple fiche Google.',
    h1: 'Pourquoi avoir un site internet ?',
    lead: 'Une page Facebook ou une fiche Google, c’est un bon début. Un site, c’est l’endroit qui vous appartient, où vos clients trouvent tout et vous contactent directement.',
    resume: 'Facebook, fiche Google ou site : ce qui change vraiment.',
    points: [
      { icon: 'search', t: 'Être trouvé', d: 'Une page par service, et Google sait quoi montrer quand on vous cherche.' },
      { icon: 'badge-check', t: 'Rassurer', d: 'Vos prestations, vos photos, vos horaires : on sait à qui on a affaire.' },
      { icon: 'house', t: 'Être chez vous', d: 'Votre adresse, vos règles, sans dépendre d’une plateforme.' },
      { icon: 'send', t: 'Recevoir des demandes', d: 'Un formulaire et un bouton d’appel, les messages arrivent chez vous.' },
    ],
    body: `## Vos clients vous cherchent sur leur téléphone

Avant d’appeler un artisan, de pousser la porte d’un commerce ou de rejoindre une association, beaucoup de gens jettent d’abord un œil sur internet. Et ils le font souvent depuis leur téléphone. Selon le Baromètre du numérique 2026, mené par le Crédoc pour l’Arcep, 91 % des personnes de 12 ans et plus ont un smartphone ([source](${SRC_BARO})). La même enquête indique que 74 % des personnes ont fait au moins un achat en ligne au cours des 12 derniers mois ([source](${SRC_BARO_INFO})).

Ce que la personne trouve à ce moment-là compte beaucoup. Si elle ne trouve rien, ou une page oubliée depuis deux ans, elle passe simplement au suivant.

## Facebook, fiche Google, site : trois rôles différents

Ces trois outils ne font pas le même travail. Ils se complètent.

- **La page Facebook ou Instagram** sert à donner des nouvelles et à garder le lien avec ceux qui vous suivent déjà. Mais vos publications descendent vite dans le fil, et une partie de vos clients n’y va jamais.
- **La fiche Google** montre votre adresse, vos horaires et vos avis. Elle est gratuite et précieuse, mais elle laisse peu de place pour expliquer ce que vous faites. Le guide [fiche Google entreprise](/guides/fiche-google-entreprise/) explique comment la remplir.
- **Le site** rassemble tout : vos services, vos photos, votre histoire, vos coordonnées, et vos prix si vous le souhaitez. C’est le seul des trois qui vous appartient vraiment.

Le site devient le point central. Votre page Facebook et votre fiche Google renvoient vers lui, et il renvoie vers elles.

## Rassurer avant le premier contact

Un site soigné, c’est aussi une question de crédibilité. Une adresse à votre nom, des pages claires, des photos de votre vrai travail : on sent tout de suite une activité sérieuse et suivie.

À l’inverse, une simple page sur un réseau peut laisser penser que l’activité est récente ou peu active, même quand ce n’est pas le cas. Le visiteur qui hésite entre deux noms choisit souvent celui qui répond déjà à ses questions : ce que vous faites, où, comment vous joindre.

## Ne pas dépendre d’une plateforme

Sur un réseau social, vous êtes un invité. La plateforme décide de ce qui s’affiche et de qui le voit. Elle peut changer ses règles du jour au lendemain, et un compte peut être bloqué ou piraté. Vos abonnés ne sont pas vraiment à vous.

Avec un site, l’adresse est à votre nom. Vous choisissez ce qui est écrit et comment c’est présenté. Rien ne vient se mettre entre vous et la personne qui vous lit.

## Ce qu’un site change, selon votre activité

### Pour un indépendant ou un artisan

Chaque prestation a sa page, avec des photos de vos réalisations et votre zone d’intervention. Les demandes de devis arrivent par le formulaire, même quand vous êtes en rendez-vous ou sur un chantier. La page [site internet pour artisan](/site-internet-artisan/) détaille ce qu’il faut y mettre.

### Pour un commerce

Vos horaires, votre adresse, vos produits phares, et pourquoi pas une boutique en ligne pour vendre quand le magasin est fermé. Voyez la page du [site pour commerçant](/site-internet-commercant/).

### Pour une association

Vos activités, vos prochains événements, la façon d’adhérer ou de devenir bénévole. Un site clair rassure aussi les partenaires qui veulent savoir qui vous êtes. Voyez la page du [site pour association](/site-internet-association/).

## Recevoir des demandes, même le soir

Un site travaille quand vous ne pouvez pas décrocher. Une personne qui vous découvre à dix heures du soir peut lire vos services, regarder vos photos et vous laisser un message. Le lendemain matin, sa demande vous attend dans votre boîte mail, avec ses coordonnées.

> Commencer petit, c’est possible. Un site une page suffit souvent pour être trouvé et joignable, et vous pourrez l’agrandir plus tard. Le guide [site une page ou site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à choisir.

Chez moi, la création démarre à ${eur(creation.prix)} €. Ensuite, l’abonnement à ${eur(abo.month)} € par mois s’occupe du reste : l’hébergement, le nom de domaine, les mises à jour et le support.`,
    faq: [
      { q: 'Ma page Facebook ne suffit pas ?', a: 'Elle suffit pour garder le contact avec vos abonnés. Pour être trouvé par quelqu’un qui ne vous connaît pas encore, et pour présenter clairement vos services, un site fait mieux. Les deux vont très bien ensemble.' },
      { q: 'J’ai déjà une fiche Google, à quoi bon un site ?', a: 'La fiche indique votre adresse, vos horaires et vos avis. Le site raconte ce que vous faites, comment, et pourquoi vous choisir. Une fiche reliée à un vrai site inspire aussi davantage confiance.' },
      { q: 'Un site, c’est compliqué à tenir à jour ?', a: 'Pas si quelqu’un s’en charge pour vous. Avec l’abonnement, vous envoyez vos changements depuis votre espace client, avec une photo si besoin, et ils sont faits pour vous.' },
      { q: 'Quel site choisir pour commencer ?', a: 'Un site une page, si vous voulez surtout être trouvé et joignable. Un site vitrine, si vous avez plusieurs services à présenter. Le prix de création est le même dans les deux cas.' },
    ],
    voir: ['/etre-visible-sur-google/', '/guides/site-une-page-ou-site-vitrine/', '/metiers/'],
    cta: { titre: 'Votre site, sans prise de tête', texte: 'Dites-moi ce que vous faites, je m’occupe du reste.' },
  },

  // ------------------------------------------------------------------ être visible sur Google
  {
    path: '/etre-visible-sur-google/',
    nom: 'Être visible sur Google',
    icon: 'search-check',
    color: 'butter',
    title: 'Comment être visible sur Google : le guide simple | Alex & Lia',
    description: 'Fiche Google, avis, une page par service, les mots de vos clients, un site rapide sur téléphone et de la patience : les gestes simples pour être trouvé.',
    h1: 'Comment être visible sur Google ?',
    lead: 'Pas de formule magique, mais quelques gestes simples, faits avec soin et dans la durée. Voici ceux qui comptent le plus pour une petite entreprise.',
    resume: 'Six gestes simples pour être trouvé.',
    points: [
      { icon: 'map-pin', t: 'La fiche Google', d: 'Gratuite, elle vous place sur la carte près de vos clients.' },
      { icon: 'star', t: 'De vrais avis', d: 'Demandez-les après un travail réussi, et répondez à chacun.' },
      { icon: 'layers', t: 'Une page par service', d: 'Chaque page répond à une recherche précise.' },
      { icon: 'clock', t: 'De la patience', d: 'Le référencement se construit en semaines, souvent en mois.' },
    ],
    body: `## Ce que Google cherche à montrer

Google veut proposer à chaque personne la réponse la plus utile à sa question. Il ne récompense ni le plus beau site, ni le plus cher. Il cherche celui qui répond clairement, qui inspire confiance et qui s’affiche bien sur l’écran utilisé. Tout le reste découle de cette idée.

Personne ne commande le classement, ni moi, ni une agence, ni vous. On peut seulement mettre toutes les chances de son côté, avec les gestes qui suivent.

## Votre fiche Google et vos avis

### La fiche d’établissement

Pour une recherche près de chez soi, Google affiche souvent une carte avec quelques établissements. C’est la fiche d’établissement, gratuite, qui vous permet d’y figurer. Choisissez bien votre catégorie, remplissez vos horaires, ajoutez quelques photos et le lien vers votre site.

Le pas à pas complet est dans le guide [fiche Google entreprise](/guides/fiche-google-entreprise/).

### Les avis de vos clients

Les avis rassurent ceux qui hésitent, et Google en tient compte. Le plus simple reste de les demander, au bon moment, à des clients satisfaits. Envoyez-leur le lien direct vers votre fiche : en deux clics, c’est fait.

Répondez à chaque avis, même court, même critique. Une réponse calme montre qu’il y a quelqu’un derrière l’entreprise.

!> Ne publiez jamais de faux avis et n’en achetez pas. C’est interdit, et cela finit toujours par se voir.

## Un site clair, avec une page par service

Imaginez un paysagiste qui crée des jardins, les entretient et taille les haies. Une seule page qui dit tout en vrac aura du mal à sortir sur chacune de ces recherches. Une page pour la création, une pour l’entretien, une pour la taille, et chacune a sa chance. C’est tout l’intérêt d’un site vitrine : une page, un sujet.

Sur chaque page, Google doit comprendre en un coup d’œil ce que vous faites, où, et pour qui. Un titre net, quelques paragraphes, vos propres photos et un moyen de vous contacter suffisent.

Reliez aussi vos pages entre elles : de l’accueil vers chaque service, et de chaque service vers le contact. Le visiteur trouve son chemin sans chercher, et Google comprend mieux comment votre site est organisé.

## Les mots de vos clients, pas ceux du métier

Vos clients ne tapent pas « réfection de couverture en ardoise naturelle ». Ils tapent « refaire toit ardoise », suivi du nom de leur ville. Écrivez avec leurs mots, ceux qu’ils emploient quand ils vous appellent.

Notez les questions qu’on vous pose souvent. Chacune peut devenir un paragraphe, et parfois une page entière.

Indiquez aussi clairement votre ville et les communes où vous travaillez. Pour une recherche locale, c’est souvent ce détail qui fait la différence.

## Un site rapide sur téléphone

Vos clients vous cherchent souvent sur leur téléphone, parfois avec une connexion moyenne. Un site qui tarde à s’afficher fait fuir le visiteur avant même qu’il vous lise.

Des photos allégées, un texte lisible sans zoomer, un bouton d’appel bien visible : ce sont des détails, mais ils comptent. Sur les sites que je crée, ces réglages sont faits dès le départ.

## La patience, et un peu de régularité

Le référencement, c’est-à-dire votre place dans les résultats de Google, prend du temps. Google doit découvrir le site, le lire, puis le comparer aux autres. Sur votre propre nom, on vous trouve en général assez vite. Sur des recherches plus disputées, il faut compter des semaines, et souvent des mois.

Ce qui aide ensuite : garder vos informations à jour, ajouter de temps en temps une réalisation ou une page utile, et continuer à demander des avis.

Méfiez-vous en revanche des raccourcis : des pages copiées les unes sur les autres, des mots répétés à l’excès, des liens achetés. Ils font souvent plus de mal que de bien, et le retard se rattrape ensuite difficilement.

> Vous préférez que quelqu’un s’en occupe ? Avec l’option ${seo.name}, à ${eur(seo.price.month)} € par mois, je regarde ce que vos clients recherchent et j’améliore vos pages en conséquence. Tout est expliqué sur la page [référencement SEO](/referencement-seo/).`,
    faq: [
      { q: 'Combien de temps pour apparaître sur Google ?', a: 'Sur le nom de votre entreprise, c’est en général rapide. Sur des recherches où beaucoup d’entreprises sont présentes, comptez plutôt plusieurs mois, avec un site soigné et des informations à jour.' },
      { q: 'Faut-il payer Google pour être bien placé ?', a: 'Non. Les résultats naturels ne s’achètent pas. Les annonces payantes existent, elles sont signalées comme sponsorisées, et elles disparaissent dès que vous arrêtez de payer.' },
      { q: 'Un concurrent sort avant moi, que faire ?', a: 'Regardez ce qu’il fait mieux : plus d’avis, des pages plus précises, une fiche mieux remplie. Puis avancez sur ces points un par un, sans chercher de raccourci.' },
      { q: 'Pouvez-vous me promettre un résultat ?', a: 'Non, et méfiez-vous de ceux qui le font. Je pose des bases solides sur chaque site, et je vous explique ce qui dépend de vous.' },
    ],
    voir: ['/guides/fiche-google-entreprise/', '/referencement-seo/', '/creation-site-internet-ardennes/'],
    cta: { titre: 'Partir sur de bonnes bases', texte: 'Chaque site que je crée est prêt pour Google dès sa mise en ligne.' },
  },

  // ------------------------------------------------------------------ pourquoi Alex & Lia
  {
    path: '/pourquoi-alex-et-lia/',
    nom: 'Pourquoi Alex & Lia',
    icon: 'heart-handshake',
    color: 'pink',
    title: 'Pourquoi choisir Alex & Lia : nos engagements | Alex & Lia',
    description: 'Un vrai interlocuteur qui vous répond, un prix affiché, sans engagement, le nom de domaine à votre nom, et des automatisations qui font baisser le prix.',
    h1: 'Pourquoi choisir Alex & Lia ?',
    lead: 'Parce qu’internet devrait être simple. Derrière ce site, il y a une personne, moi, qui conçoit votre site, le met en ligne et vous répond. Et tout ce qui se répète, je l’ai automatisé pour que vous payiez moins.',
    resume: 'Un vrai interlocuteur, des engagements écrits.',
    points: [
      { icon: 'user', t: 'Une vraie personne', d: 'C’est moi, Alex, qui lis vos messages et qui vous réponds.' },
      { icon: 'tag', t: 'Un prix affiché', d: 'Le même pour tous, sans devis et sans surprise.' },
      { icon: 'lock', t: 'Rien ne vous retient', d: 'Sans engagement, et votre nom de domaine reste à votre nom.' },
      { icon: 'workflow', t: 'Des automatisations', d: 'Le travail répétitif est automatisé, et votre facture baisse d’autant.' },
    ],
    body: `## Alex, un vrai interlocuteur

Je m’appelle Alex. Je crée des sites internet pour des indépendants, des artisans, des commerces et des associations. Je suis installé à ${ville}, dans les ${dept}, et je travaille à distance pour toute la France.

Quand vous m’écrivez, c’est moi qui lis. Quand votre site est en ligne, c’est moi qui en réponds. Vous n’avez pas un standard ou un ticket anonyme en face de vous, mais quelqu’un qui connaît votre site.

Je suis un jeune entrepreneur. Mon idée de départ est simple : que les petites structures aient, elles aussi, un site pro, à un prix qu’elles peuvent se permettre, et pas seulement les grandes entreprises.

Vous pouvez me poser vos questions avant de commander, sans rien vous engager. Si mon offre ne correspond pas à votre besoin, je vous le dis franchement.

## Ma méthode, en quatre temps

1. **On échange** : vous me dites ce que vous faites, pour qui, et ce que vous attendez du site. Les choix se font avec vous.
2. **Je conçois votre site** : la structure, les pages, le style. Au passage, mes automatisations prennent en charge le répétitif, comme la mise en page de base, les premiers textes et les réglages.
3. **Je vérifie** : je relis tout, je teste le site sur plusieurs appareils et je corrige ce qui doit l’être.
4. **Je mets en ligne, et je reste là** : le nom de domaine, l’hébergement, le cadenas HTTPS, puis le suivi au fil des mois.

## Mes engagements

Ce sont des promesses simples, écrites ici pour que vous puissiez me les rappeler.

- **Un prix affiché** : à partir de ${eur(creation.prix)} € pour le site, écrit noir sur blanc, le même pour tout le monde.
- **Sans engagement** : l’abonnement s’arrête quand vous le décidez. Seule exception, si vous payez le site en ${durees} fois, vous restez le temps du paiement.
- **Le nom de domaine à votre nom** : l’adresse de votre site vous appartient, pas à moi.
- **Vous repartez avec votre site** : si vous arrêtez, je vous remets une copie complète, et votre adresse vous suit.
- **Rien en ligne sans vérification** : je contrôle votre site avant sa mise en ligne, et chaque retouche automatique passe d’abord par un aperçu que vous validez.
- **Une réponse sous ${delais.reponse}** : le support est compris dans l’abonnement, pour toutes vos questions sur votre site.

## Mes automatisations

D’un site à l’autre, beaucoup de choses se ressemblent : la structure de départ, les réglages pour Google, l’affichage sur téléphone, les sauvegardes. Ce travail-là, je l’ai automatisé. Il se fait vite et sans oubli, et c’est autant de temps que vous ne payez pas. La conception de votre site, elle, reste mon travail.

Une fois le site en ligne, vos petites demandes passent aussi par une retouche automatique : un horaire, un prix, une photo. Elle utilise les jetons compris dans votre abonnement, et vous voyez toujours un aperçu avant que quoi que ce soit change. Une demande trop grande ou pas claire arrive directement chez moi.

Ces automatisations ne vendent rien et ne décident pas à votre place. Elles ne peuvent ni supprimer une page, ni toucher aux réglages sensibles de votre site. Et elles ne me remplacent pas : c’est toujours moi qui réponds de votre site.

Une question en passant ? Lia, mon assistante, vous répond dans la bulle en bas de l’écran, ici comme dans votre espace client. Sur ce site, vous croiserez aussi nos deux mascottes, deux petits monstres mignons. Ils sont là pour rappeler qu’internet peut rester sympathique.

## Ce que je fais bien, et ce que je ne fais pas

Je crée des sites une page, des sites vitrines et des petites boutiques en ligne. C’est ce que je sais bien faire, vite et avec soin. Vous pouvez en voir quelques-uns sur la page [réalisations](/realisations/).

Pour une application sur mesure, un logiciel métier ou un catalogue de milliers de produits, il faut un développeur expérimenté. Dans ce cas, je vous le dis honnêtement, et je peux vous orienter vers les bonnes personnes.

Si mes prix restent doux, c’est grâce aux automatisations que j’ai mises en place, et à mes accès directs chez des hébergeurs français. La page [pourquoi moins cher](/pourquoi-moins-cher/) détaille tout.`,
    faq: [
      { q: 'Est-ce que je parle à une vraie personne ?', a: 'Oui. Les messages du formulaire de contact arrivent chez moi, et c’est moi qui réponds. Dans votre espace client, une petite retouche peut se faire automatiquement, mais vous pouvez toujours choisir de vous adresser à moi.' },
      { q: 'Et si une retouche automatique se trompe ?', a: 'Cela peut arriver, comme avec tout outil. C’est pour cela que chaque retouche montre un aperçu avant d’être publiée, qu’elle n’a pas accès aux réglages sensibles, et que je contrôle chaque site avant de le publier.' },
      { q: 'Et si je veux partir un jour ?', a: 'Vous partez librement. Le nom de domaine est déjà à votre nom, et je vous remets les fichiers de votre site pour le faire héberger ailleurs.' },
      { q: 'Faut-il habiter près de chez vous ?', a: `Non. Tout peut se faire à distance, par e-mail, au téléphone ou en visio, partout en France. Si vous êtes dans les ${dept}, on peut aussi se rencontrer.` },
    ],
    voir: ['/pourquoi-moins-cher/', '/realisations/', '/accompagnement/'],
    cta: { titre: 'Parlons de votre projet', texte: 'Écrivez-moi, je vous réponds personnellement.' },
  },

  // ------------------------------------------------------------------ accompagnement
  {
    path: '/accompagnement/',
    nom: 'Accompagnement',
    icon: 'life-buoy',
    color: 'mint',
    title: 'Accompagnement après la mise en ligne du site | Alex & Lia',
    description: `Pour ${eur(abo.month)} € par mois : nom de domaine, hébergement, mises à jour, sauvegardes, support et retouches. Options et extras à la carte, sans engagement.`,
    h1: 'Accompagnement : ce qui se passe après la mise en ligne',
    lead: 'Un site ne s’arrête pas le jour où il est publié. Chaque mois, je m’occupe de ce qui le fait tourner, et vous me demandez les changements quand vous en avez besoin.',
    resume: 'Chaque mois, votre site entretenu et suivi.',
    points: [
      { icon: 'shield-check', t: 'Votre site entretenu', d: 'Mises à jour, sauvegardes, surveillance et cadenas HTTPS, faits pour vous.' },
      { icon: 'pencil', t: 'Des changements simples', d: 'Une demande depuis votre espace client, avec une photo si besoin.' },
      { icon: 'layout-grid', t: 'À la carte', d: 'Des options au mois et des extras ponctuels, quand vous voulez.' },
      { icon: 'handshake', t: 'Sans engagement', d: 'Vous arrêtez quand vous voulez et vous gardez votre adresse.' },
    ],
    body: `## Ce que fait l’abonnement, chaque mois

L’abonnement coûte ${eur(abo.month)} € par mois, ou ${eur(annee)} € à l’année avec ${annuel.moisOfferts} mois offerts. Il démarre quand votre site est en ligne et il comprend :

${abo.details.map((d) => `- ${d}.`).join('\n')}

L’hébergement, c’est l’ordinateur où vit votre site. Le nom de domaine, c’est son adresse. Vous n’avez à vous occuper ni de l’un ni de l’autre : je gère la technique pour que vous n’ayez pas à y penser.

## Demander une modification

Un horaire qui change, une nouvelle photo, un prix à mettre à jour ? Tout passe par votre espace client, sur ordinateur comme sur téléphone.

1. **Vous écrivez votre demande** en quelques mots, et vous joignez une photo si besoin.
2. **Pour une petite retouche**, le changement se prépare automatiquement et vous voyez un aperçu. Vous validez, et c’est en ligne.
3. **Pour une demande plus grande**, ou si vous préférez, je m’en occupe à la main. L’abonnement comprend ${interv} de ma part par ${abo.periode}.
4. **Vous suivez tout** depuis votre espace, et je vous préviens quand c’est fait.

Pour une simple question sur votre site, je vous réponds sous ${delais.reponse}. Et pour un renseignement rapide, Lia, mon assistante, est là dans la bulle en bas de votre espace client.

> Envie de voir à quoi cela ressemble ? La [démo de l’espace client](/mon-espace/demo/) se visite librement, sans créer de compte.

## Les jetons, pour les retouches et les outils

Les retouches automatiques et les outils de votre espace client fonctionnent avec des jetons. L’abonnement en comprend ${abo.jetons} chaque mois.

- **Une retouche automatique** : ${jetonsLia.modif.base} jetons et plus, selon la longueur du texte et le nombre de photos.
- **Un outil** : de ${OUTIL} jetons, et son prix est affiché sur son bouton avant de le lancer.
- **Besoin de plus ?** Vous en rachetez à l’utilisation, ${eur(recharge.prix)} € les ${recharge.jetons} jetons, ajoutés à votre prochaine facture.

Les jetons de l’abonnement repartent à ${abo.jetons} le 1er de chaque mois. Ceux que vous rachetez restent sur votre compte tant que vous ne les avez pas utilisés.

## Les options au mois

Elles s’ajoutent ou se retirent quand vous voulez, depuis votre espace client. Aucune n’est obligatoire.

${extrasMois.map((o) => `- **${o.name}**, ${eur(o.price.month)} € par mois${o.types ? ', pour une boutique en ligne' : ''}. ${o.court}`).join('\n')}

Le nouveau montant s’applique à partir de la période suivante, sans démarche compliquée.

## Les extras à la demande

Besoin d’un coup de main ponctuel ? Ces extras se commandent depuis votre espace client, se paient une seule fois et s’ajoutent à votre prochaine facture. Si vous ne vous en servez pas, vous ne payez rien.

${aLaDemande.map((a) => `- **${a.name}** : ${eur(a.prix)} €`).join('\n')}

Pour l’article, vous donnez le sujet : un premier jet se prépare automatiquement, puis je le relis, je l’illustre et je le publie sur votre site. Le point avec moi se fait au téléphone ou en visio, pour regarder ensemble votre site et vos projets.

## Sans engagement, et si vous arrêtez

Vous arrêtez l’abonnement quand vous voulez, et il prend fin à la fin de la période déjà payée. Seule exception : si vous avez choisi de régler votre site en ${durees} fois, vous restez le temps du paiement.

Et après ? Votre nom de domaine est à votre nom, il reste donc à vous. Je vous remets une copie complète de votre site, pour le faire héberger où vous voulez. Vous ne perdez ni votre adresse, ni le travail déjà fait.

Tous les prix sont réunis sur la page [tarifs](/tarifs/). Et si vous parlez de moi autour de vous, le [parrainage](/fidelite/) vous offre ${fidelite.parrainageMois} mois d’abonnement, à vous comme à la personne parrainée.`,
    faq: [
      { q: 'Puis-je avoir un site sans abonnement ?', a: 'Non, tant que votre site est hébergé chez moi. L’abonnement couvre ce qui le fait vivre : son adresse, son hébergement et son entretien. Il reste sans engagement.' },
      { q: 'Combien de modifications puis-je demander ?', a: `Avec les ${abo.jetons} jetons du mois, jusqu’à ${retouchesMois} petites retouches automatiques, et ${interv} faite à la main par ${abo.periode}. Il vous en faut plus ? Rachetez des jetons, ${eur(recharge.prix)} € les ${recharge.jetons}, ou demandez une intervention d’Alex en plus pour ${eur(alexEnPlus.prix)} €.` },
      { q: 'En combien de temps ma demande est-elle traitée ?', a: `Une petite retouche automatique est en ligne en quelques minutes, une fois l’aperçu validé. Pour une demande faite à la main, je réponds sous ${delais.reponse}. Si c’est pressé, l’extra « ${urgent.name} » la fait passer avant les autres.` },
      { q: 'Puis-je changer d’options plus tard ?', a: 'Oui. Les options au mois se prennent ou s’arrêtent depuis votre espace client, à tout moment, et le changement compte pour la période suivante.' },
    ],
    voir: ['/tarifs/', '/mon-espace/demo/', '/pourquoi-alex-et-lia/'],
    cta: { titre: 'Entre de bonnes mains', texte: 'Visitez la démo de l’espace client, ou composez votre site.' },
  },

  // ------------------------------------------------------------------ page locale : Ardennes
  {
    path: '/creation-site-internet-ardennes/',
    nom: 'Site internet dans les Ardennes',
    icon: 'map-pin',
    color: 'peach',
    title: `Création de site internet dans les ${dept} (${num}) | Alex & Lia`,
    description: `Alex crée votre site internet depuis ${ville} : rencontre possible à Charleville-Mézières, Sedan ou Rethel, ou tout à distance. À partir de ${eur(creation.prix)} €.`,
    h1: `Création de site internet dans les ${dept}`,
    lead: `Je suis installé à ${ville}, dans les ${dept}. Si vous êtes dans le coin, on peut se rencontrer. Sinon, tout se fait très bien à distance.`,
    resume: `Un créateur de sites installé dans les ${dept}.`,
    points: [
      { icon: 'map-pin', t: `Basé à ${ville}`, d: 'Au cœur des Ardennes, entre Charleville-Mézières et Rethel.' },
      { icon: 'handshake', t: 'Une rencontre possible', d: 'Pour les clients des Ardennes, si vous le souhaitez.' },
      { icon: 'phone', t: 'Ou tout à distance', d: 'Téléphone, e-mail ou visio : le résultat est le même.' },
      { icon: 'search', t: 'Pensé pour être trouvé ici', d: 'Votre ville et les communes autour, écrites dans vos pages.' },
    ],
    body: `## Un créateur de sites dans les Ardennes

Je m’appelle Alex et je crée des sites internet depuis ${ville} (${site.address.postalCode}). Je travaille à distance pour toute la France, et les ${dept}, c’est chez moi.

Je fais des sites une page, des sites vitrines et des boutiques en ligne. L’offre est la même ici qu’ailleurs : un prix affiché, un site vérifié à la main, puis un abonnement qui s’occupe de l’entretien.

Indépendants, artisans, commerçants, gîtes, associations : si vous êtes à Charleville-Mézières, à Sedan, à Rethel, à ${ville} ou dans un village autour, on peut se voir pour parler de votre projet. Ce n’est jamais obligatoire. Beaucoup de choses se règlent très bien par téléphone ou par e-mail.

## Se rencontrer, ou tout faire à distance

Certaines personnes aiment mettre un visage sur un nom avant de se lancer. D’autres n’ont pas le temps de se déplacer. Les deux me conviennent.

- **En rendez-vous**, dans les Ardennes : on regarde ensemble ce que vous faites, vos photos et vos idées.
- **À distance** : vous m’écrivez ou on s’appelle, puis vous suivez tout depuis votre espace client.

Dans les deux cas, le tarif ne change pas et il est affiché à l’avance. Le site démarre à ${eur(creation.prix)} €, puis l’abonnement coûte ${eur(abo.month)} € par mois, sans engagement.

## Être trouvé près de chez vous

Pour une entreprise locale, tout ne se joue pas face à la France entière. Tout se joue sur les recherches des gens du coin : « couvreur Rethel », « fleuriste Sedan », « gîte près de Charleville ». Trois choses comptent particulièrement.

1. **Votre fiche Google**, bien remplie, avec la bonne catégorie et vos horaires. C’est elle qui vous place sur la carte. Le [guide de la fiche Google](/guides/fiche-google-entreprise/) explique comment faire.
2. **Le nom de votre ville et des communes autour**, écrit clairement dans vos pages. Si vous êtes à Rethel et que vous travaillez jusqu’à ${ville}, écrivez les deux. Google ne devine pas votre zone.
3. **De vrais avis** laissés par vos clients d’ici. Ils rassurent ceux qui hésitent, et Google les prend en compte.

Pensez aussi aux mots que les gens emploient vraiment. Beaucoup disent « Charleville » plutôt que « Charleville-Mézières ». Pour un gîte, la vallée de la Meuse ou la forêt des Ardennes parlent souvent plus qu’un simple nom de commune. Glissez ces mots naturellement dans vos textes, sans les répéter à chaque ligne.

> Pas de pages en série pour chaque village. Une page vraie et utile vaut mieux que vingt copies où seul le nom de la commune change. Google le repère, et vos clients aussi.

Pour aller plus loin, lisez le guide [comment être visible sur Google](/etre-visible-sur-google/).

## Un exemple ardennais : ${flore.nom}

[${flore.nom}](${flore.url}) crée des fleurs éternelles en fil chenille, faites main à ${ville}. J’ai créé son site, une boutique en ligne pour présenter et vendre ses créations. La boutique ouvre très bientôt.

C’est un bon exemple de ce qu’un site peut apporter à une activité d’ici : se faire connaître des Ardennais qui cherchent une idée de cadeau, et vendre aussi plus loin que le département. Les autres sites sont sur la page [réalisations](/realisations/).

## Comment ça se passe

1. **Vous me contactez** par le [formulaire](/contact/), en précisant si vous aimeriez une rencontre.
2. **On fait le point**, en rendez-vous dans les Ardennes ou au téléphone.
3. **Je crée votre site** : un site une page en ${page.delai}, un site vitrine en ${vitrine.delai}, une boutique en ${boutique.delai}.
4. **Je le mets en ligne** après vérification, puis je m’occupe de son entretien et de vos changements.

Côté paiement, vous réglez ${paiement.acompte} % à la commande, et le reste quand le site est en ligne.`,
    faq: [
      { q: 'Faut-il être dans les Ardennes pour travailler avec vous ?', a: 'Non. Je crée des sites pour toute la France, à distance. Être dans les Ardennes permet seulement de se rencontrer plus facilement, si vous le souhaitez.' },
      { q: 'Vous déplacez-vous pour un rendez-vous ?', a: `Oui, dans les ${dept}, par exemple à Charleville-Mézières, Sedan, Rethel ou ${ville}. Dites-moi dans votre message où vous êtes, et on trouve un moment.` },
      { q: 'Le prix change-t-il pour une entreprise ardennaise ?', a: `Non. Qu’on se rencontre ou pas, c’est le même prix pour tous : à partir de ${eur(creation.prix)} € pour la création, puis l’abonnement mensuel.` },
      { q: 'Faites-vous une page pour chaque ville ?', a: 'Non, pas en série. Je préfère une page vraie, qui cite votre ville et les communes où vous travaillez, plutôt que des copies qui ne servent à personne.' },
    ],
    voir: ['/etre-visible-sur-google/', '/realisations/', '/contact/'],
    cta: { titre: 'Un projet dans les Ardennes ?', texte: 'Écrivez-moi : on se voit, ou on avance à distance.' },
  },
];

module.exports = { pages, PUBLIE };
