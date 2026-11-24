// Pages V2 : réassurance, guides de fond et page locale (novembre 2026).
// Règles (scripts/check.js) : title de 65 caractères au plus, description de 120 à 160, aucun tiret long
// ni demi-cadratin, aucun point-virgule, aucun prix écrit en dur (tout vient de src/config.js),
// aucun chiffre sans source, et pas de phrase de 9 mots ou plus reprise d'une autre page.
// Offre du 21 novembre 2026 : un seul site payé une fois, le Site Essentiel (config.offreSite), assemblé à partir de nos modules
// (les « minis monstres » créés et optimisés par Alex), avec l'option e-commerce (+ 200 €). Le Site Visibilité est retiré :
// les pages pour Google sont l'extra « page de visibilité Google ». Puis Autonomie (config.creationSeule, sans abonnement, export du site remis au client) ou Mini (config.forfaits[0], au mois,
// sans engagement, modifications incluses, une demande à la fois). L'abonnement est facultatif. Trois extras : la page de
// visibilité Google (payée une fois, par carte, depuis l'espace client), la traduction anglaise et la fonctionnalité spécifique
// (sur devis). Chaque mot technique est expliqué la première fois qu'il apparaît sur une page.
// Ton (tour global du 19 novembre 2026) : « nous / on » pour les Minis Monstres, Alex nommé quand c'est utile (jamais « je »),
// vouvoiement, « site internet », « visibilité sur Google » plutôt que « référencement », « modification » plutôt que « retouche ».
// Ordre de l'offre, toujours le même : le site (payé une fois), puis Autonomie ou Mini, enfin les extras.
// Fil rouge : un site internet rend visible, et notre métier est d'apporter cette visibilité. Pages courtes, pensées pour le téléphone.
const { site, creation, types, forfaits, fractionne, paiement, marche, fidelite, clients, bande, creationSeule, aLaDemande } = require('../config');

// helpers
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
// Le site (config.offreSite) : le Site Essentiel, le même avec l'option e-commerce, l'option seule, et son délai indicatif.
const { offreSite } = require('../config');
const ESS = offreSite.site, BOU = offreSite.avecBoutique, ECO = offreSite.option;
const eco = ECO.name.toLowerCase(); // « e-commerce »

const mini = forfaits.find((f) => f.id === 'base') || forfaits[0]; // Mini, le seul abonnement, facultatif
const dom = mini.domaine || 2; // le nom de domaine fourni par nos soins : en plus, par mois
const avecDom = mini.month + dom; // le forfait Mini avec le nom de domaine
const AUTO = creationSeule.name; // sans abonnement
const { sourcesMd, INDEPENDANT_DES } = require('../lib/components');
const pageGoogle = aLaDemande.find((x) => x.id === 'packseo' && !x.retire) || { name: 'Page de visibilité Google', prix: 0 };
const prixPage = eur(pageGoogle.prix); // la page de visibilité Google, payée une fois
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
const EN_FOIS = `en ${fractionne.fois} fois avec ${fractionne.organismes}`; // par un organisme externe, sur la page de paiement

// La petite bande : six Minis Monstres (Pépite, la spécialiste des extras, depuis le 19 novembre 2026). Prénom et métier : « Cerise, la secrétaire ».
const B = (id) => bande.find((b) => b.id === id);
const nomRole = (b) => `${b.nom}, ${minus(b.role)}`;
// Ce que fait chaque petit monstre, écrit pour ces pages (différent des textes de config.bande), après « Prénom, rôle, ».
// DIT : présentation de la bande (page Pourquoi les Minis Monstres). APRES : leur travail une fois le site en ligne (Accompagnement).
const DIT = {
  support: 'vous répond dans la petite bulle, vous aide à formuler chaque demande et la transmet.',
  constructeur: 'monte vos pages et s’assure que tout fonctionne, sur téléphone comme sur ordinateur.',
  ecrivain: 'propose une première version de vos textes, qu’Alex reprend avec vous.',
  observateur: 'prépare les pages qui vous feront trouver sur Google, près de chez vous.',
  organisateur: 'classe vos pages et vos contenus, pour que vos visiteurs trouvent vite leur chemin.',
  extras: 'vous présente les trois extras et prépare votre devis quand il en faut un.',
};
const APRES = {
  support: 'reçoit votre demande dans votre espace client, vous pose les questions utiles et s’assure qu’il ne manque rien avant de la transmettre.',
  constructeur: 'fait la modification demandée et vérifie que rien d’autre n’a bougé.',
  ecrivain: 'vous aide à tourner un nouveau texte quand les mots ne viennent pas.',
  observateur: 'prépare chaque page de visibilité Google que vous commandez en plus.',
  organisateur: 'place chaque nouveauté au bon endroit, et garde votre boutique en ordre si vous en avez une.',
  extras: 'vous guide dans l’onglet Extras de votre espace client, et chiffre une traduction ou une fonctionnalité spécifique.',
};

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
    title: 'Pourquoi un site moins cher, sans rien sacrifier | Les Minis Monstres',
    description: `Un site internet dès ${eur(ESS.price)} € pour être enfin visible : le temps gagné sur le répétitif, ce qu’Alex vérifie à la main, et ce qui n’est jamais sacrifié.`,
    h1: 'Pourquoi sommes-nous moins chers ?',
    lead: `Un site professionnel ${marche.foisMin} fois moins cher qu’un indépendant : pas de locaux, pas de loyer, pas de lourde organisation, et un temps de fabrication réduit. Le soin, lui, reste entier.`,
    resume: 'Le temps gagné, et ce qui ne change pas.',
    points: [
      { icon: 'house', t: 'Pas de locaux, pas de loyer', d: 'Aucun bureau, aucun loyer, aucun commercial : ces frais ne finissent pas sur votre facture.' },
      { icon: 'timer', t: 'Une méthode rodée', d: 'La petite bande des Minis Monstres se charge du répétitif, et aucun intermédiaire n’est à payer.' },
      { icon: 'user-check', t: 'Tout vérifié à la main', d: 'Alex relit, teste sur téléphone et contrôle chaque mise en ligne.' },
      { icon: 'badge-euro', t: 'Un prix affiché', d: `${eur(ESS.price)} € le site, ${eur(BOU.price)} € avec une boutique, les mêmes pour tous, sans devis à attendre.` },
      { icon: 'shield-check', t: 'Rien de sacrifié', d: 'Qualité, sécurité, visibilité sur Google et une vraie personne qui vous répond.' },
    ],
    body: `## Être visible ne devrait pas être un luxe

Une activité que personne ne trouve sur internet perd des clients sans le savoir. Beaucoup de petites structures renoncent pourtant au site internet à cause du prix.

Notre métier, c’est de leur apporter cette visibilité à un tarif qu’elles peuvent se permettre.

## Ce que vous payez vraiment dans un site

Un site internet, c’est surtout du temps : la maquette, la mise en page de chaque écran, les textes, les réglages, les tests. Fait entièrement à la main, cela prend des jours, parfois des semaines.

D’après des repères publics relevés en France, un site vitrine de ${marche.pagesCompare} pages fait par un indépendant coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Son entretien revient souvent entre ${mille(marche.entretienMin)} et ${mille(marche.entretienMax)} € par mois. Ces prix ne sont pas exagérés : ils correspondent au travail fourni.

## Pas de locaux, pas de loyer, pas de frais cachés

Une agence paie des bureaux, un loyer, des commerciaux, des réunions et toute une organisation. Ces frais se retrouvent dans le prix de chaque site.

Chez nous, rien de tout cela : pas de locaux, pas de loyer, pas d’équipe commerciale à faire vivre. Ce que nous n’avons pas à payer, vous ne le payez pas non plus. Notre objectif : vous fournir un site professionnel plus rapidement et moins cher que les autres.

> Creuser un trou, on peut le faire à la pelle ou à la tractopelle. Le trou est le même à l’arrivée. Le temps passé pour y arriver, lui, n’a rien à voir. Les Minis Monstres, c’est notre tractopelle.

## Le cerveau est prêt, il ne manque que votre contenu

Un site est fait de parties qui reviennent presque toujours : l’accueil, la présentation, les services et les tarifs, la galerie, les questions fréquentes, le contact, et parfois la boutique. Alex a créé et optimisé chacune de ces parties, une fois pour toutes. Ce sont nos modules, nos minis monstres à nous : soignés, rapides, lisibles sur téléphone, et modifiables chacun de leur côté.

Pour votre site, nous assemblons ces modules et nous les remplissons avec vos informations et vos photos. Le travail de fond n’est pas à refaire à chaque fois : c’est ce qui garde le prix bas.

## Une base commune, des sites tous différents

La préconfiguration concerne la partie que vos visiteurs ne voient jamais : le code qui fait tourner le site en coulisses, sous vos textes et vos images. C’est lui qui rend chaque page rapide, sécurisée, agréable sur téléphone et lisible par Google. Nous vous le livrons prêt et éprouvé.

Ce qui se voit, en revanche, est fait pour vous : l’ambiance, les couleurs, les polices, la mise en avant de vos photos, le ton de vos textes. Votre site est en ligne en quelques heures, puis nous l’ajustons à votre goût, avec des modifications à volonté. Le résultat ressemble à votre activité, pas à celle du voisin.

## Comment nous gagnons du temps

D’un site à l’autre, beaucoup d’étapes se répètent. Nous les avons confiées à une petite bande de compagnons, les Minis Monstres.

- **Pour les textes** : ${nomRole(B('ecrivain'))}, prépare une première base.
- **Pour les pages** : ${nomRole(B('constructeur'))}, les monte, et ${nomRole(B('organisateur'))}, les range.
- **Pour Google** : ${nomRole(B('observateur'))}, prépare les pages qui vous feront trouver près de chez vous.
- **Sans intermédiaire** : nous traitons en direct avec des hébergeurs français, les entreprises qui gardent les sites en ligne.
${ESS.delai ? `
Ce qui prenait des semaines se fait en ${ESS.delai}, avec ou sans l’option ${eco}.
` : ''}
## Ce qu’Alex fait à la main

Les petits monstres vont vite, mais ils ne décident de rien. Alex, qui a créé les Minis Monstres, conçoit votre site et reprend tout ce qu’ils préparent.

- **La relecture** : chaque page, chaque texte, chaque horaire, chaque prix affiché.
- **Les tests sur téléphone**, comme le feront vos clients.
- **La vérification** : les liens, le formulaire, la vitesse d’affichage, les informations destinées à Google.
- **Vos modifications** : à volonté ensuite, par vous-même ou sur demande, avec le forfait ${mini.name}.

Aucun site ne part en ligne sans ce contrôle.

## Un prix affiché, le même pour tous

Pas de devis à attendre. Tout se lit dans le même ordre.

1. **D’abord la création du site** : ${eur(ESS.price)} € le ${ESS.name}, et ${eur(ECO.prix)} € de plus avec l’option ${eco} pour vendre sur internet.
2. **Ensuite, Forfait ${AUTO} ou Forfait ${mini.name}** : vous gérez le site vous-même sans rien payer chaque mois, ou nous nous en occupons pour ${eur(mini.month)} € par mois, sans engagement.
3. **Enfin, les extras, si besoin** : une ${minus(pageGoogle.name)} à ${prixPage} €, une traduction anglaise ou une fonctionnalité spécifique sur devis.

Le site se règle à la commande, d’un coup ou ${EN_FOIS}, au choix sur la page de paiement. Le détail est sur la page [tarifs](/tarifs/).

## Les repères du marché, honnêtement

Face à un site vitrine de ${marche.pagesCompare} pages fait par un indépendant, notre ${ESS.name} à ${eur(ESS.price)} €, qui en reprend les mêmes parties, coûte ${marche.fois} fois moins, d’après les fourchettes publiées.

Côté entretien, les prestataires consultés demandent ${eur(marche.entretienMin)} à ${eur(marche.entretienMax)} € par mois, l’hébergement étant souvent en plus. Le forfait ${mini.name} coûte ${eur(mini.month)} € par mois, ou ${eur(avecDom)} € avec le nom de domaine, hébergement et modifications compris. Cela reste nettement en dessous de ces fourchettes.

> Soyons honnêtes : ces fourchettes viennent de prestataires, donc à lire avec prudence, et chacun fixe ses prix. Des indépendants proposent aussi un site dès ${eur(INDEPENDANT_DES)} €, et l’écart devient alors presque nul.

**Sources**, consultées en novembre 2026 :

${sourcesMd()}

## Ce qui n’est pas sacrifié

- **La qualité** : un site moderne, clair et rapide, lisible sur téléphone comme sur ordinateur.
- **La sécurité** : avec le forfait ${mini.name}, le cadenas dans la barre d’adresse, la maintenance technique et les sauvegardes automatiques.
- **La visibilité** : chaque page est écrite et réglée pour que Google comprenne votre activité.
- **Une vraie personne** : quand vous écrivez, Alex vous répond, en général dans la journée.
- **Votre liberté** : le nom de domaine (l’adresse de votre site) est à votre nom, et l’abonnement n’est pas imposé.

Votre projet dépasse ce que nous savons bien faire, comme une application sur mesure ou un catalogue de milliers de produits ? Nous vous le disons dès le premier échange.`,
    faq: [
      { q: 'Moins cher, ça veut dire moins bien ?', a: 'Non. Le prix baisse parce que nous passons moins de temps sur ce qui se répète, pas parce que nous sautons des étapes. Chaque site est relu, testé sur téléphone et vérifié avant d’être publié.' },
      { q: 'Mon site est-il fait à la chaîne ?', a: 'Non. Alex conçoit votre site et fait les choix avec vous. La petite bande prépare seulement ce qui se répète, et rien n’est publié sans votre validation.' },
      { q: 'Y a-t-il des frais en plus du prix affiché ?', a: `Non. Vous payez le site choisi, puis ${eur(mini.month)} € par mois seulement si vous prenez le forfait ${mini.name}. Les extras sont facultatifs, et leur prix est affiché.` },
      { q: 'Pourquoi n’y a-t-il pas de devis ?', a: 'Parce que la plupart des sites d’artisans, de commerces ou d’associations se construisent de la même façon. Un prix fixe est plus simple pour tout le monde.' },
    ],
    voir: ['/tarifs/', '/pourquoi-les-minis-monstres/', '/comparatif/'],
    cta: { titre: 'Un site soigné, à prix clair', texte: 'Choisissez votre site, puis qui s’en occupe : le total apparaît tout de suite.' },
  },

  // ------------------------------------------------------------------ pourquoi un site internet
  {
    path: '/pourquoi-un-site-internet/',
    nom: 'Pourquoi un site',
    icon: 'globe',
    color: 'sky',
    title: 'Pourquoi avoir un site internet ? Pour être visible | Les Minis Monstres',
    description: 'Un site internet rend votre activité visible : être trouvé, rassurer, recevoir des demandes. Ce qu’il apporte de plus qu’une page Facebook ou une fiche Google.',
    h1: 'Pourquoi avoir un site internet ?',
    lead: 'Pour être vu. Un site internet, c’est l’endroit où vos futurs clients vous découvrent, comprennent ce que vous faites et vous contactent. Et vous rendre visible, c’est notre métier.',
    resume: 'Un site rend visible : voici comment.',
    points: [
      { icon: 'search', t: 'Être trouvé', d: 'Une page par service, et Google sait quoi montrer quand on vous cherche.' },
      { icon: 'badge-check', t: 'Rassurer', d: 'Vos prestations, vos photos, vos horaires : on sait à qui on a affaire.' },
      { icon: 'house', t: 'Être chez vous', d: 'Votre adresse, vos règles, sans dépendre d’une plateforme.' },
      { icon: 'send', t: 'Recevoir des demandes', d: 'Un formulaire et un bouton d’appel, les messages arrivent chez vous.' },
    ],
    body: `## Une vitrine que l’on voit enfin

Sans site internet, votre activité ressemble à une belle vitrine installée dans une rue déserte. Vos futurs clients ne peuvent pas choisir ce qu’ils ne voient pas.

Un site vous installe dans la rue la plus fréquentée du moment : celle où l’on cherche, téléphone en main. Aux Minis Monstres, notre travail consiste à vous y faire une place.

## Vos clients vous cherchent sur leur téléphone

Avant d’appeler un artisan ou de pousser la porte d’un commerce, beaucoup de gens regardent d’abord sur internet.

- 91 % des personnes de 12 ans et plus ont un smartphone, selon le Baromètre du numérique 2026 du Crédoc pour l’Arcep ([source](${SRC_BARO})).
- 74 % ont fait au moins un achat en ligne au cours des 12 derniers mois, d’après la même enquête ([source](${SRC_BARO_INFO})).

Si la personne ne trouve rien, ou une page oubliée depuis deux ans, elle passe au suivant.

## Facebook, fiche Google, site : trois rôles

Ces trois outils se complètent.

- **La page Facebook ou Instagram** garde le lien avec ceux qui vous suivent déjà. Mais vos publications descendent vite dans le fil.
- **La fiche Google** montre votre adresse, vos horaires et vos avis. Elle laisse peu de place pour expliquer ce que vous faites. Le guide [fiche Google entreprise](/guides/fiche-google-entreprise/) explique comment la remplir.
- **Le site internet** rassemble tout : vos services, vos photos, votre histoire, vos coordonnées. C’est le seul des trois qui vous appartient vraiment.

## Ce qu’un site internet change

- **On vous trouve** : même les personnes qui ne connaissent pas encore votre nom.
- **On vous fait confiance** : une adresse à votre nom et des photos de votre vrai travail montrent une activité sérieuse.
- **Vous êtes chez vous** : aucune plateforme ne décide de ce qui s’affiche, ni de qui le voit.
- **Les demandes arrivent, même le soir** : le visiteur de dix heures du soir vous laisse un message, et vous le lisez le lendemain matin.

## Selon votre activité

- **Artisan ou indépendant** : une page par prestation, vos chantiers en photos, des demandes de devis. Voyez le [site internet pour artisan](/site-internet-artisan/).
- **Commerce** : vos horaires, vos produits, et pourquoi pas une boutique en ligne. Voyez le [site pour commerçant](/site-internet-commercant/).
- **Association** : vos activités, vos dates, la façon d’adhérer. Voyez le [site pour association](/site-internet-association/).

Les autres métiers sont réunis sur la page [votre métier](/metiers/).

## Par où commencer

Chez nous, c’est simple : un seul site, puis ce dont vous avez besoin.

- **${ESS.name}, ${eur(ESS.price)} €** : exister sur internet et être joignable.
- **Option ${eco}, + ${eur(ECO.prix)} €** : vendre sur internet.
- **Pages de visibilité Google, ${prixPage} € la page** : être trouvé sur plus de recherches, quand vous voulez.

Ensuite, vous gérez votre site vous-même avec le forfait ${AUTO}, ou nous nous en occupons avec le forfait ${mini.name}, à ${eur(mini.month)} € par mois. Les prix sont détaillés sur la page [tarifs](/tarifs/).

> Vous hésitez entre une page et plusieurs ? Le guide [site une page ou site vitrine](/guides/site-une-page-ou-site-vitrine/) vous aide à choisir.`,
    faq: [
      { q: 'Ma page Facebook ne suffit pas ?', a: 'Elle suffit pour garder le contact avec vos abonnés. Pour être trouvé par quelqu’un qui ne vous connaît pas encore, un site internet fait mieux. Les deux vont très bien ensemble.' },
      { q: 'J’ai déjà une fiche Google, à quoi bon un site ?', a: 'La fiche indique votre adresse, vos horaires et vos avis. Le site raconte ce que vous faites, et pourquoi vous choisir. Une fiche reliée à un vrai site inspire aussi davantage confiance.' },
      { q: 'Un site, c’est compliqué à tenir à jour ?', a: `Pas si quelqu’un s’en charge pour vous. Avec le forfait ${mini.name}, vous envoyez vos changements depuis votre espace client, et ils sont faits pour vous.` },
      { q: 'Par quoi commencer ?', a: `Par le ${ESS.name}. Vous vendez en ligne ? Cochez l’option ${eco}. Vous comptez sur Google pour trouver des clients ? Ajoutez des pages de visibilité Google une fois le site en ligne.` },
    ],
    voir: ['/etre-visible-sur-google/', '/guides/site-une-page-ou-site-vitrine/', '/metiers/'],
    cta: { titre: 'Devenez visible, sans prise de tête', texte: 'Dites-nous ce que vous faites, on s’occupe du reste.' },
  },

  // ------------------------------------------------------------------ être visible sur Google
  {
    path: '/etre-visible-sur-google/',
    nom: 'Être visible sur Google',
    icon: 'search-check',
    color: 'butter',
    title: 'Comment être visible sur Google : le guide simple | Les Minis Monstres',
    description: 'Fiche Google, avis, une page par service, les mots de vos clients, un site rapide sur téléphone et de la patience : les gestes simples pour être trouvé.',
    h1: 'Comment être visible sur Google ?',
    lead: 'Pas de formule magique, mais six gestes simples, faits avec soin et dans la durée. Nous les appliquons sur chaque site que nous créons.',
    resume: 'Six gestes simples pour être trouvé.',
    points: [
      { icon: 'map-pin', t: 'La fiche Google', d: 'Gratuite, elle vous place sur la carte près de vos clients.' },
      { icon: 'star', t: 'De vrais avis', d: 'Demandez-les après un travail réussi, et répondez à chacun.' },
      { icon: 'layers', t: 'Une page par service', d: 'Chaque page répond à une recherche précise.' },
      { icon: 'clock', t: 'De la patience', d: 'Votre place sur Google se construit en semaines, souvent en mois.' },
    ],
    body: `## Ce que Google cherche à montrer

Google veut donner à chacun la réponse la plus utile. Il ne récompense ni le plus beau site, ni le plus cher. Il cherche celui qui répond clairement et qui s’affiche bien sur l’écran utilisé.

Personne ne commande le classement, ni nous, ni une agence, ni vous. On peut seulement mettre toutes les chances de son côté, avec les six gestes qui suivent.

## 1. Votre fiche Google

Pour une recherche près de chez soi, Google affiche souvent une carte avec quelques établissements. La fiche d’établissement, gratuite, vous permet d’y figurer.

Choisissez bien votre catégorie, remplissez vos horaires, ajoutez des photos et le lien vers votre site. Le pas à pas est dans le guide [fiche Google entreprise](/guides/fiche-google-entreprise/).

## 2. Les avis de vos clients

Les avis rassurent ceux qui hésitent, et Google en tient compte. Demandez-les à vos clients satisfaits, en leur envoyant le lien direct vers votre fiche.

Répondez à chaque avis, même court, même critique.

!> Ne publiez jamais de faux avis et n’en achetez pas. C’est interdit, et cela finit toujours par se voir.

## 3. Une page par service

Imaginez un paysagiste qui crée des jardins, les entretient et taille les haies. Une seule page qui dit tout en vrac aura du mal à sortir sur chacune de ces recherches. Avec une page par service, chacune a sa chance.

Sur chaque page, Google doit comprendre ce que vous faites, où, et pour qui. Un titre net, quelques paragraphes, vos photos et un moyen de vous contacter suffisent.

C’est le rôle de nos pages de visibilité Google : ${prixPage} € la page, ajoutées à votre site quand vous voulez, depuis votre espace client.

## 4. Les mots de vos clients

Vos clients ne tapent pas « réfection de couverture en ardoise naturelle ». Ils tapent « refaire toit ardoise », suivi du nom de leur ville. Écrivez avec leurs mots.

- Notez les questions qu’on vous pose souvent : chacune peut devenir un paragraphe, parfois une page.
- Citez votre ville et les communes où vous travaillez.

## 5. Un site rapide sur téléphone

Un site qui tarde à s’afficher fait fuir le visiteur avant qu’il vous lise. Des photos allégées, un texte lisible sans zoomer, un bouton d’appel bien visible : sur nos sites, ces réglages sont faits dès le départ.

## 6. De la patience, et un peu de régularité

Google doit découvrir le site, le lire, puis le comparer aux autres. Sur votre propre nom, on vous trouve en général assez vite. Sur des recherches plus disputées, il faut des semaines, souvent des mois.

Ce qui aide ensuite : garder vos informations à jour, ajouter de temps en temps une réalisation ou une page utile, et continuer à demander des avis.

Méfiez-vous des raccourcis : pages copiées, mots répétés à l’excès, liens achetés. Ils font souvent plus de mal que de bien.

> Vous préférez que quelqu’un s’en occupe ? ${nomRole(B('observateur'))} de notre petite bande, prépare vos pages de visibilité Google. Chaque page de plus se commande depuis votre espace client, à ${prixPage} € la page, payée une fois. Pour aller plus loin, voyez la page [visibilité sur Google](/referencement-seo/).`,
    faq: [
      { q: 'Combien de temps pour apparaître sur Google ?', a: 'Sur le nom de votre entreprise, c’est en général rapide. Sur des recherches où beaucoup d’entreprises sont présentes, comptez plutôt plusieurs mois.' },
      { q: 'Faut-il payer Google pour être bien placé ?', a: 'Non. Les résultats naturels ne s’achètent pas. Les annonces payantes existent, elles sont signalées comme sponsorisées, et elles disparaissent dès que vous arrêtez de payer.' },
      { q: 'Un concurrent sort avant moi, que faire ?', a: 'Regardez ce qu’il fait mieux : plus d’avis, des pages plus précises, une fiche mieux remplie. Puis avancez sur ces points un par un.' },
      { q: 'Pouvez-vous me promettre un résultat ?', a: 'Non, et méfiez-vous de ceux qui le font. Nous posons des bases solides sur chaque site, et nous vous expliquons ce qui dépend de vous.' },
    ],
    voir: ['/guides/fiche-google-entreprise/', '/referencement-seo/', '/creation-site-internet-ardennes/'],
    cta: { titre: 'Partir sur de bonnes bases', texte: 'Chaque site que nous créons est prêt pour Google dès sa mise en ligne.' },
  },

  // ------------------------------------------------------------------ pourquoi les Minis Monstres
  {
    path: '/pourquoi-les-minis-monstres/',
    nom: 'Pourquoi les Minis Monstres',
    icon: 'heart-handshake',
    color: 'pink',
    title: 'Pourquoi choisir les Minis Monstres : nos engagements | Les Minis Monstres',
    description: 'Notre métier : rendre votre activité visible sur internet. Alex conçoit votre site, six Minis Monstres l’aident, les prix sont affichés et rien ne vous retient.',
    h1: 'Pourquoi choisir les Minis Monstres ?',
    lead: 'Parce que notre métier tient en une phrase : rendre votre activité visible sur internet, simplement. Derrière ce site, il y a Alex, qui conçoit votre site et vous répond, et une petite bande de six monstres qui l’aide.',
    resume: 'Une vraie personne, des engagements écrits.',
    points: [
      { icon: 'user', t: 'Une vraie personne', d: 'Alex lit vos messages et vous répond.' },
      { icon: 'tag', t: 'Un prix affiché', d: 'Le même pour tous, sans devis et sans surprise.' },
      { icon: 'lock', t: 'Rien ne vous retient', d: 'Aucun abonnement imposé, et l’adresse de votre site reste à votre nom.' },
      { icon: 'workflow', t: 'Une petite bande', d: 'Six petits monstres se chargent du répétitif, et votre facture baisse d’autant.' },
    ],
    body: `## Notre métier : vous rendre visible

Vous avez un savoir-faire, des clients contents, une belle activité. Il manque souvent une seule chose : que l’on vous trouve sur internet.

C’est ce que nous apportons. Un site internet clair, à votre nom, prêt pour Google, à un prix que les petites structures peuvent se permettre.

## Alex, la personne derrière les Minis Monstres

Alex crée des sites internet pour des indépendants, des artisans, des commerces et des associations. Il est installé à ${ville}, dans les ${dept}, et travaille à distance pour toute la France.

Quand vous écrivez, c’est lui qui lit. Quand votre site est en ligne, c’est lui qui en répond. Vous n’avez pas un standard en face de vous, mais quelqu’un qui connaît votre site.

Vos questions avant la commande ne vous engagent à rien. Si notre offre ne correspond pas à votre besoin, nous vous le disons franchement.

## Notre méthode, en quatre temps

1. **Vous nous racontez votre activité** : dans le questionnaire de votre espace client, ce que vous faites, pour qui, et ce que vous attendez du site.
2. **Alex conçoit votre site** : la structure, les pages, le style. La petite bande prend en charge ce qui se répète.
3. **Alex vérifie** : tout est relu et testé sur plusieurs appareils, puis votre première version part en ligne.
4. **Vous le peaufinez** : avec le forfait ${mini.name}, nous l’hébergeons et vous le modifiez à volonté, vous-même ou avec nous. Avec le forfait ${AUTO}, vous recevez l’export du site, une copie complète prête à installer.

## Nos engagements

- **Un prix affiché** : ${eur(ESS.price)} € le site, ${eur(BOU.price)} € avec l’option ${eco}, le même pour tout le monde.
- **Aucun abonnement imposé** : le forfait ${mini.name} est facultatif et sans engagement.
- **Le nom de domaine à votre nom** : l’adresse de votre site vous appartient.
- **Vous repartez avec votre site** : l’export reste possible à tout moment.
- **Rien en ligne sans vérification** : Alex contrôle votre site, et vous le validez.
- **Une réponse en général dans la journée.**

## La petite bande

D’un site à l’autre, beaucoup de choses se ressemblent. Pour ce travail-là, Alex s’appuie sur six compagnons, dessinés en petits monstres. Ils travaillent vite et sans oubli, et c’est autant de temps que vous ne payez pas.

${bande.map((b) => `- **${nomRole(b)}**, ${DIT[b.id] || `${minus(b.court)}`}`).join('\n')}

Ils ne décident pas à votre place, et ils ne remplacent pas Alex : il regarde tout ce qu’ils font. Faites leur connaissance sur la page [notre équipe](/notre-equipe/).

## Ce que nous faisons bien, et le reste

Nous créons des sites vitrines, assemblés à partir de nos modules, des boutiques en ligne, et des pages pour être trouvé sur Google. Quelques exemples sont sur la page [réalisations](/realisations/).

Pour une application sur mesure, un logiciel métier ou un catalogue de milliers de produits, il faut un développeur expérimenté. Dans ce cas, nous vous orientons vers les bonnes personnes.

Et pour comprendre d’où viennent nos prix, lisez [pourquoi moins cher](/pourquoi-moins-cher/).`,
    faq: [
      { q: 'Est-ce que je parle à une vraie personne ?', a: `Oui. Les messages du formulaire de contact arrivent chez Alex, et c’est lui qui répond. Dans votre espace client, ${B('constructeur').nom} prépare vos demandes de modification avec vous, et c’est encore Alex qui les fait.` },
      { q: 'Et si un petit monstre se trompe ?', a: `Cela peut arriver, comme avec tout outil. C’est pour cela qu’Alex contrôle leur travail. ${B('constructeur').nom} vous relit aussi votre demande avant de l’envoyer à Alex, et vous la confirmez.` },
      { q: 'Et si je veux partir un jour ?', a: 'Vous partez librement. Le nom de domaine est déjà à votre nom, et vous recevez l’export de votre site pour le faire héberger ailleurs.' },
      { q: 'Faut-il habiter près de chez vous ?', a: `Non. Tout peut se faire à distance, par e-mail, au téléphone ou en visio, partout en France. Si vous êtes dans les ${dept}, on peut aussi se rencontrer.` },
    ],
    voir: ['/pourquoi-moins-cher/', '/realisations/', '/accompagnement/'],
    cta: { titre: 'Parlons de votre projet', texte: 'Écrivez-nous : Alex vous répond personnellement.' },
  },

  // ------------------------------------------------------------------ accompagnement
  {
    path: '/accompagnement/',
    nom: 'Accompagnement',
    icon: 'life-buoy',
    color: 'mint',
    title: 'Accompagnement après la mise en ligne du site | Les Minis Monstres',
    description: `Le forfait ${mini.name}, facultatif et sans engagement, ${eur(mini.month)} € par mois : votre site reste visible, hébergé et entretenu, modifications incluses.`,
    h1: 'Accompagnement : ce qui se passe après la mise en ligne',
    lead: 'Un site ne reste visible que s’il reste en ligne et à jour. Vous pouvez le gérer seul, ou nous le confier : nous nous occupons alors de ce qui le fait tourner, et vous demandez vos changements quand vous en avez besoin.',
    resume: 'Chaque mois, votre site entretenu et suivi.',
    points: [
      { icon: 'shield-check', t: 'Votre site entretenu', d: 'Hébergement, sauvegardes automatiques, sécurité et maintenance technique : tout est fait pour vous.' },
      { icon: 'pencil', t: 'Des modifications incluses', d: `Vous demandez, ${B('constructeur').nom} clarifie avec vous, et Alex fait la modification.` },
      { icon: 'search-check', t: 'Trois extras, pas plus', d: 'Une page de visibilité Google, une traduction anglaise, une fonctionnalité spécifique : seulement si vous en avez besoin.' },
      { icon: 'handshake', t: 'Sans engagement', d: 'Vous arrêtez quand vous voulez et vous gardez votre adresse.' },
    ],
    body: `## Après le site : le forfait ${AUTO} ou le forfait ${mini.name}

Une fois le site créé, vous choisissez qui le fait vivre.

- **Forfait ${AUTO}, ${eur(creationSeule.month)} € par mois** : vous recevez votre site prêt à installer. L’hébergement, le nom de domaine, les sauvegardes et les mises à jour sont à votre charge.
- **Forfait ${mini.name}, ${eur(mini.month)} € par mois** : nous nous occupons de tout. L’abonnement démarre à la mise en ligne du site, sans engagement.

## Ce que comprend le forfait ${mini.name}

Votre site reste en ligne, protégé et à jour, donc visible, sans que vous ayez à y penser.

- **L’hébergement** : l’endroit où votre site reste accessible 24 h/24.
- **Les sauvegardes automatiques** : une copie de sécurité, faite régulièrement.
- **La sécurité** : des protections tenues à jour.
- **La maintenance technique** : des vérifications régulières, pour que tout reste en état de marche.
- **Vos modifications**, incluses, une demande à la fois.
- **Votre espace client**, où vous faites vos demandes et commandez vos extras.

Et le nom de domaine, l’adresse de votre site ? Vous en avez déjà un : le forfait reste à ${eur(mini.month)} € par mois. Vous n’en avez pas : nous le réservons à votre nom, et le forfait passe à ${eur(avecDom)} € par mois (${eur(dom)} € de plus).

## Demander une modification

Un horaire qui change, une nouvelle photo, un texte à ajouter : tout part de votre espace client, une page privée que vous ouvrez aussi sur téléphone.

1. **Vous faites votre demande** en quelques mots, avec une photo si besoin.
2. **${B('constructeur').nom} la clarifie avec vous**, puis vous la résume.
3. **Vous confirmez**, et il l’envoie à Alex.
4. **Alex fait la modification**, et vous êtes prévenu.

Tant que le travail n’a pas commencé, vous pouvez annuler votre demande. Seule une refonte complète, ou l’ajout d’une fonction nouvelle, passe par un devis.

> Envie de voir à quoi cela ressemble ? La [démo de l’espace client](/mon-espace/demo/) se visite librement, sans créer de compte.

## Trois extras, à la carte

Vous prenez un extra quand vous en avez besoin. Rien ne se renouvelle tout seul.

- **Une ${minus(pageGoogle.name)}, ${prixPage} € la page** : une porte d’entrée de plus vers votre site, écrite pour une recherche précise. Vous la commandez dans votre espace client et vous la payez par carte, une seule fois.
- **Une traduction anglaise**, sur devis.
- **Une fonctionnalité spécifique**, sur devis : dites-nous votre besoin, nous répondons avec un prix.

Les extras sont détaillés sur la page [tarifs](/tarifs/#extras).

## La petite bande, après la mise en ligne

Avec le forfait ${mini.name}, les six petits monstres continuent de travailler pour vous :

${bande.map((b) => `- **${nomRole(b)}**, ${APRES[b.id] || minus(b.court)}`).join('\n')}

## Si vous arrêtez

Vous arrêtez quand vous voulez, et l’abonnement prend fin à la fin de la période déjà payée.

Votre nom de domaine reste à vous, et nous vous remettons l’export de votre site, pour le faire héberger où vous voulez. Vous ne perdez ni votre adresse, ni le travail déjà fait.

Vous revenez pour un deuxième site ? Il profite de ${fidelite.remiseSecondSite} % de remise sur sa création.`,
    faq: [
      { q: 'Puis-je avoir un site sans abonnement ?', a: `Oui, avec le forfait ${AUTO}, à choisir en commandant. Vous recevez l’export de votre site et vous l’installez chez votre hébergeur. Tant que le site est hébergé chez nous, le forfait ${mini.name} est nécessaire.` },
      { q: 'Combien de modifications puis-je demander ?', a: `Autant qu’il vous en faut, une demande à la fois : elles sont incluses dans le forfait ${mini.name}.` },
      { q: 'Comment savoir où en est ma demande ?', a: `Vous la suivez dans votre espace client, étape par étape. Vous êtes prévenu par e-mail dès qu’elle est en ligne.` },
    ],
    voir: ['/tarifs/', '/mon-espace/demo/', '/pourquoi-les-minis-monstres/'],
    cta: { titre: 'Entre de bonnes mains', texte: 'Visitez la démo de l’espace client, ou choisissez votre site.' },
  },

  // ------------------------------------------------------------------ page locale : Ardennes
  {
    path: '/creation-site-internet-ardennes/',
    nom: 'Site internet dans les Ardennes',
    icon: 'map-pin',
    color: 'peach',
    title: `Création de site internet dans les ${dept} (${num}) | Les Minis Monstres`,
    description: `Les Minis Monstres créent votre site internet depuis ${ville}, pour vous rendre visible près de chez vous. Rencontre possible, ou tout à distance. Dès ${eur(ESS.price)} €.`,
    h1: `Création de site internet dans les ${dept}`,
    lead: `Les Minis Monstres sont installés à ${ville}, dans les ${dept}. Notre métier : rendre visibles les entreprises d’ici. Si vous êtes dans le coin, on peut se rencontrer. Sinon, tout se fait très bien à distance.`,
    resume: `Des sites internet créés dans les ${dept}.`,
    points: [
      { icon: 'map-pin', t: `Basés à ${ville}`, d: 'Au cœur des Ardennes, entre Charleville-Mézières et Rethel.' },
      { icon: 'handshake', t: 'Une rencontre possible', d: 'Pour les clients des Ardennes, si vous le souhaitez.' },
      { icon: 'phone', t: 'Ou tout à distance', d: 'Téléphone, e-mail ou visio : le résultat est le même.' },
      { icon: 'search', t: 'Pensé pour être trouvé ici', d: 'Votre ville et les communes autour, écrites dans vos pages.' },
    ],
    body: `## Des sites internet créés dans les Ardennes

Alex crée des sites internet depuis ${ville} (${site.address.postalCode}), avec sa petite bande de Minis Monstres. Nous travaillons pour toute la France, et les ${dept}, c’est chez nous.

Artisans, commerçants, gîtes, associations : beaucoup d’activités d’ici font du très bon travail sans que personne ne les trouve sur internet. C’est ce que nous changeons, avec la même offre qu’ailleurs et un prix affiché.

## Se rencontrer, ou tout faire à distance

- **En rendez-vous**, à Charleville-Mézières, Sedan, Rethel, ${ville} ou dans un village autour : on regarde ensemble ce que vous faites, vos photos et vos idées.
- **À distance** : vous nous écrivez ou on s’appelle, puis vous suivez tout depuis votre espace client.

Dans les deux cas, le tarif ne change pas : ${eur(ESS.price)} € pour le ${ESS.name}, ou ${eur(BOU.price)} € avec l’option ${eco}. Ensuite, c’est le forfait ${AUTO}, sans abonnement, ou le forfait ${mini.name}, à ${eur(mini.month)} € par mois. Le détail est sur la page [tarifs](/tarifs/).

## Être trouvé près de chez vous

Pour une entreprise locale, tout se joue sur les recherches des gens du coin : « couvreur Rethel », « fleuriste Sedan », « gîte près de Charleville ». Trois choses comptent.

1. **Votre fiche Google**, bien remplie. C’est elle qui vous place sur la carte. Le [guide de la fiche Google](/guides/fiche-google-entreprise/) explique comment faire.
2. **Le nom de votre ville et des communes autour**, écrit dans vos pages. Google ne devine pas votre zone.
3. **De vrais avis**, laissés par vos clients d’ici.

Pensez aussi aux mots que les gens emploient vraiment. Beaucoup disent « Charleville » plutôt que « Charleville-Mézières ». Pour un gîte, la vallée de la Meuse ou la forêt des Ardennes parlent souvent plus qu’un nom de commune.

Les pages de visibilité Google sont faites pour cela. Pour un couvreur de Rethel, une page peut parler de la réparation d’ardoises, une autre du démoussage : chacune répond à une vraie recherche d’ici.

> Pas de pages en série pour chaque village. Une page vraie et utile vaut mieux que vingt copies où seul le nom de la commune change.

Pour aller plus loin, lisez [comment être visible sur Google](/etre-visible-sur-google/).

## Un exemple ardennais : ${flore.nom}

[${flore.nom}](${flore.url}) crée des fleurs éternelles en fil chenille, faites main à ${ville}. Nous avons créé son site, une boutique en ligne qui ouvre très bientôt.

Elle se fera connaître des Ardennais qui cherchent une idée de cadeau, et vendra aussi plus loin que le département. Les autres sites sont sur la page [réalisations](/realisations/).

## Comment ça se passe

1. **Vous nous contactez** par le [formulaire](/contact/), en précisant si vous aimeriez une rencontre. Vous savez déjà ce qu’il vous faut ? Commandez sur la page [créer mon site](/creer-mon-site/).
2. **Vous remplissez le questionnaire** de création, dans votre espace client.
3. **Nous créons votre site**${ESS.delai ? ` : comptez ${ESS.delai}, puisque nos modules sont déjà prêts` : ', et vous voyez chaque étape'}.
4. **Votre site part en ligne**, et vous le modifiez ensuite à votre goût.

Côté paiement, vous réglez le site en commandant. Vous préférez étaler ? Choisissez ${EN_FOIS} sur la page de paiement.`,
    faq: [
      { q: 'Faut-il être dans les Ardennes pour travailler avec vous ?', a: 'Non. Nous créons des sites pour toute la France, à distance. Être dans les Ardennes permet seulement de se rencontrer plus facilement.' },
      { q: 'Vous déplacez-vous pour un rendez-vous ?', a: `Oui, dans les ${dept}, par exemple à Charleville-Mézières, Sedan, Rethel ou ${ville}. Dites-nous où vous êtes dans votre message, et on trouve un moment.` },
      { q: 'Le prix change-t-il pour une entreprise ardennaise ?', a: `Non. Qu’on se rencontre ou pas, c’est le même prix pour tous : à partir de ${eur(ESS.price)} € pour le site, puis l’abonnement au mois si vous le souhaitez.` },
      { q: 'Faites-vous une page pour chaque ville ?', a: 'Non, pas en série. Nous préférons une page vraie, qui cite votre ville et les communes où vous travaillez, plutôt que des copies qui ne servent à personne.' },
    ],
    voir: ['/etre-visible-sur-google/', '/realisations/', '/contact/'],
    cta: { titre: 'Un projet dans les Ardennes ?', texte: 'Écrivez-nous : on se voit, ou on avance à distance.' },
  },
];

module.exports = { pages, PUBLIE };
