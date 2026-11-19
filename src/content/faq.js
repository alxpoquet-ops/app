// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (2 à 4 phrases) et honnêtes, en mots de tous les jours. Chaque terme technique
// (nom de domaine, hébergement, sauvegarde, maintenance…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 19 novembre 2026 : trois sites payés une fois (config.types : Site Essentiel, Site Visibilité, Site Boutique),
// puis deux façons de faire vivre le site : Autonomie (config.creationSeule, 0 € par mois, le client gère tout et reçoit
// l'export de son site) ou Mini (config.forfaits[0], au mois, sans engagement, modifications incluses, une demande à la fois).
// L'abonnement est facultatif. Trois extras seulement (config.aLaDemande non retirés) : la page de visibilité Google,
// payée une fois par carte depuis l'espace client, la traduction anglaise et la fonctionnalité spécifique, sur devis.
// La petite bande (config.bande) compte cinq Minis Monstres, présentés par leur prénom.
const cfg = require('../config');
const { forfaits, annuel, lissage, paiement, fidelite, creation, marche, bande, limites, aLaDemande, types, creationSeule } = cfg;

const { sourcesInline, INDEPENDANT_DES: INDEP } = require('../lib/components');
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l, mot = 'et') => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${mot} ${l[l.length - 1]}` : l.join(''));
const durees = lissage.durees.join(' ou ');
const D1 = lissage.durees[0];
const LN = lissage.durees[lissage.durees.length - 1];
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
// Mensualité du lissage, arrondie au centime inférieur (même règle que le serveur).
const lisse = (prix, n = LN) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // mensualité du reste, après l’acompte

// Les trois sites (config.types) : Site Essentiel, Site Visibilité, Site Boutique.
const T = (id) => types.find((t) => t.id === id) || {};
const ESS = T('une-page'), VIS = T('vitrine'), BOU = T('boutique');
// Un seul abonnement, facultatif : Mini (id 'base'). Sans abonnement : Autonomie (config.creationSeule).
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const AUTO = creationSeule.name;
const parAn = (f) => f.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
// Les extras encore proposés (config.aLaDemande, non retirés).
const extra = (id) => aLaDemande.find((x) => x.id === id && !x.retire) || {};
const pageGoogle = extra('packseo'), anglais = extra('anglais'), specifique = extra('specifique');
const prixPage = eur(pageGoogle.prix); // prix d'une page de visibilité Google, payée une fois
const moisOffert = fidelite.parrainageMois === 1 ? 'un mois offert' : `${fidelite.parrainageMois} mois offerts`;

// La petite bande : chaque Mini Monstre par son prénom, avec son rôle (config.bande).
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const bricou = monstre('constructeur').nom;
const plume = monstre('ecrivain').nom;
const mirette = monstre('observateur').nom;
const mochi = monstre('organisateur').nom;
// Ce que fait chacun, en quelques mots (écrit ici pour la FAQ, différent des phrases de config.js).
const MISSION = {
  support: 'répond à vos questions et note vos demandes',
  constructeur: 'monte votre site et fait vos modifications',
  ecrivain: 'aide à écrire vos textes',
  observateur: 'prépare vos pages pour Google',
  organisateur: 'range vos pages, vos produits et vos commandes',
};
const mission = (b) => MISSION[b.id] || minus(b.court.replace(/\.$/, ''));
const presente = (b) => `${b.nom} (${minus(b.role)}) ${mission(b)}`;
const bandeComprise = liste(bande.map(presente));

module.exports = {
  creation: [
    { q: 'Quels sites proposez-vous, et à quel prix ?', a: `Trois sites, payés une seule fois. Le ${ESS.name}, à ${eur(ESS.price)} €, tient sur une page et vous fait exister sur internet. Le ${VIS.name}, à ${eur(VIS.price)} €, compte jusqu’à ${creation.pages} pages pensées pour que l’on vous trouve sur Google. Le ${BOU.name}, à ${mille(BOU.price)} €, ajoute une boutique en ligne complète pour vendre. Chacun reprend tout ce que contient le précédent.` },
    { q: `Que comprend le ${ESS.name} à ${eur(ESS.price)} € ?`, a: `Un site d’une seule page, dessiné pour votre activité, lisible sur téléphone comme sur ordinateur. Il a un formulaire de contact, pour que vos clients vous écrivent directement. On commence par un rendez-vous téléphonique pour faire connaissance. Ensuite, vous demandez autant de retouches que vous voulez jusqu’à ce que vous validiez le site, puis il est mis en ligne.` },
    { q: `Et le ${VIS.name}, qu’a-t-il de plus ?`, a: `Tout le ${ESS.name}, avec jusqu’à ${creation.pages} pages au lieu d’une. Des pages de visibilité Google sont intégrées dès le départ, ainsi qu’une FAQ écrite pour votre activité. Le référencement local est renforcé, c’est-à-dire tout ce qui aide Google à vous montrer aux personnes de votre secteur. Il coûte ${eur(VIS.price)} €, payés une fois.` },
    { q: `Et si j’ai besoin de plus de ${creation.pages} pages ?`, a: `Vous ajoutez une page de visibilité Google quand vous voulez, depuis votre espace client. Elle coûte ${prixPage} € la page, payés une seule fois, par carte, au moment de la commande. Elle est écrite pour une recherche que font vos clients sur Google, puis intégrée à votre site. Rien ne s’ajoute tout seul.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous me racontez votre métier, et ${plume}, la rédactrice de ma petite bande, m’aide à en tirer des textes clairs. Pour les photos, je choisis des images que l’on a le droit d’utiliser, adaptées à votre activité. Vous mettrez les vôtres quand vous voudrez.` },
    { q: 'Les révisions sont-elles vraiment illimitées ?', a: `Oui, jusqu’à la validation finale de votre site. Tant que vous ne l’avez pas validé, vous demandez des retouches sur ce que vous avez commandé : les textes, les photos, les couleurs, la mise en page. Une fois le site en ligne, les changements passent par l’abonnement ${mini.name}, où les modifications sont incluses.` },
    { q: 'Quels extras puis-je ajouter ?', a: `Il y en a trois. La ${minus(pageGoogle.name)}, à ${prixPage} € la page, payée une fois. La ${minus(anglais.name)} et la ${minus(specifique.name)}, par exemple une prise de rendez-vous ou une galerie, se font sur devis, gratuit et sans engagement. Aucun n’est imposé.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat se vaut : moderne, rapide, soigné. Je conçois votre site avec les Minis Monstres, selon une méthode bien rodée. Je vais donc plus vite, et je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, un développeur reste le bon choix, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % en commandant. Le reste se paie quand vous recevez votre site, d’un coup ou en ${durees} fois sans frais, avec ou sans abonnement. Si vous prenez l’abonnement ${mini.name}, il démarre ce jour-là, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: `Sur la page Créer mon site, tout se lit de haut en bas. D’abord vous choisissez votre site : ${liste([ESS.name, VIS.name, BOU.name], 'ou')}. Ensuite vous décidez comment il vivra : ${AUTO}, où vous gérez tout vous-même, ou ${mini.name}, où l’on s’en occupe pour vous. En bas, le total s’affiche, avec le paiement en une fois ou étalé et la case « Code promo ou parrainage ». Vous relisez le récapitulatif, vous donnez vos coordonnées et vous payez en ligne. Un e-mail de confirmation arrive aussitôt avec votre référence de commande.` },
    { q: 'Que paie-je aujourd’hui ?', a: `Seulement ${paiement.acompte} % du prix du site choisi. Le reste se règle à la réception du site, et l’abonnement ${mini.name}, si vous le prenez, ne démarre qu’à ce moment-là. Le montant exact s’affiche sur le bouton avant de valider.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, avec ou sans abonnement. Après l’acompte de ${paiement.acompte} %, le reste se paie à la réception, en ${durees} fois sans frais. Pour un ${VIS.name} à ${eur(VIS.price)} € : ${eur(acompte(VIS.price))} € à la commande, puis ${eur(lisse(VIS.price, D1))} € par mois pendant ${D1} mois, ou ${eur(lisse(VIS.price))} € pendant ${LN} mois. Quand le site est payé, plus rien ne s’ajoute.` },
    { q: 'Suis-je engagé ?', a: `Non. L’abonnement ${mini.name} est facultatif, et il s’arrête quand vous le décidez, à la fin de la période déjà payée. Seule exception : si vous payez le site en ${durees} fois, vous vous engagez le temps de ce paiement. En cas de départ avant la fin, le reste du prix du site se règle d’un coup.` },
    { q: 'Dois-je prendre un abonnement ?', a: `Non, c’est vous qui choisissez. Avec ${AUTO}, vous ne payez rien par mois : vous recevez votre site prêt à installer et vous gérez votre hébergement, votre nom de domaine, vos sauvegardes et vos mises à jour. Avec ${mini.name}, à ${eur(mini.month)} € par mois sans engagement, tout cela est fait pour vous, modifications comprises.` },
    { q: 'Puis-je ajouter un extra plus tard ?', a: `Oui. Une ${minus(pageGoogle.name)} se commande depuis votre espace client, quand vous en avez besoin, et vous la payez par carte tout de suite. Pour une ${minus(anglais.name)} ou une ${minus(specifique.name)}, vous demandez un devis. Pour passer plus tard à un site plus complet, par exemple ajouter la boutique, écrivez-moi.` },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe, le service de paiement en ligne, émet la facture et vous l’envoie par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas, car l’entreprise est en franchise de TVA (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: `Vous me prévenez, et votre abonnement se termine à la fin de la période en cours. Vous gardez votre nom de domaine, c’est-à-dire l’adresse de votre site, et je vous remets l’export de votre site : une copie complète, prête à installer ailleurs. Je le laisse en ligne encore 30 jours, le temps de déménager.` },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme vous me demandez de commencer tout de suite, vous payez seulement le travail déjà fait, au prorata. Le nom de domaine déjà réservé (l’adresse de votre site) reste à votre nom pour un an, et à votre charge.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `Le prix de votre site, une fois : ${eur(ESS.price)} €, ${eur(VIS.price)} € ou ${mille(BOU.price)} € selon celui que vous choisissez. Ensuite, c’est ${eur(creationSeule.month)} € par mois en ${AUTO}, ou ${eur(mini.month)} € par mois avec ${mini.name}. Pour un ${VIS.name} avec ${mini.name}, la première année revient à ${eur(VIS.price + 12 * mini.month)} €, ou à ${eur(VIS.price + parAn(mini))} € si vous payez l’abonnement à l’année.` },
    { q: 'Qu’est-ce qu’un extra ?', a: `C’est un plus que vous prenez à la carte, seulement si vous en avez besoin. La ${minus(pageGoogle.name)} coûte ${prixPage} € la page : vous la commandez dans votre espace client et vous la réglez par carte sur le moment, une seule fois. La ${minus(anglais.name)} et la ${minus(specifique.name)} font l’objet d’un devis. Les prix sont sur la page Tarifs.` },
    { q: `Que comprend l’abonnement ${mini.name} ?`, a: `Tout ce qui garde votre site en ligne et à jour. Il comprend l’hébergement (l’endroit où votre site reste accessible jour et nuit), le nom de domaine (son adresse), les sauvegardes automatiques (des copies de sécurité), la sécurité et la maintenance technique, c’est-à-dire les vérifications régulières qui gardent le site en état de marche. Vous avez aussi votre espace client, où vous demandez vos modifications : elles sont incluses, une demande à la fois, et une modification peut prendre ${delaiModif}. Il coûte ${eur(mini.month)} € par mois, sans engagement.` },
    { q: `C’est quoi, la formule ${AUTO} ?`, a: `C’est la création du site sans abonnement : ${eur(creationSeule.month)} € par mois. Une fois le site validé, je vous remets son export, c’est-à-dire tous ses fichiers et une sauvegarde complète, avec une courte notice. Vous l’installez chez l’hébergeur de votre choix, seul ou avec son aide. Ensuite, l’hébergement, le nom de domaine, les sauvegardes et les mises à jour sont à votre charge.` },
    { q: 'Comment une page de visibilité Google m’aide-t-elle, et qui la choisit ?', a: `${mirette}, la spécialiste visibilité de la bande, en choisit le sujet avec vous, à partir de ce que cherchent vos clients. Chaque page est une porte de plus vers votre site : un service dans une ville, une question fréquente, un petit guide. Elle est écrite, relue, puis intégrée à votre site. Elle se paie une seule fois : une page n’est jamais facturée au mois.` },
    { q: 'Les modifications sont-elles limitées ?', a: `Non, pas avec ${mini.name}. Vous demandez autant de modifications que vous voulez, une à la fois : une modification peut prendre ${delaiModif}. Ajouter un texte ou des photos, changer un horaire, corriger une page existante : tout cela compte comme une modification. Une nouvelle page pour Google, une traduction ou une refonte complète n’en sont pas : ce sont des extras ou un devis.` },
    { q: 'Le nom de domaine et l’hébergement sont-ils compris ?', a: `Oui, avec l’abonnement ${mini.name}. Le nom de domaine, c’est l’adresse de votre site, comme votre-nom.fr : vous le choisissez en commandant, et je le réserve à votre nom. L’hébergement, c’est l’endroit où votre site est rangé pour rester visible 24 h/24. Les deux sont compris tant que l’abonnement est actif, sans supplément. En ${AUTO}, vous gardez les vôtres.` },
    { q: 'J’ai déjà mon nom de domaine et mon hébergement. Comment faire ?', a: `Choisissez ${AUTO} en commandant. Vous ne payez que votre site, avec ${paiement.acompte} % à la commande puis le reste à la réception, en une fois ou en ${durees} fois sans frais. Une fois le site terminé, vous recevez son export et une notice pour l’installer. Votre hébergeur a souvent des guides gratuits pour cela. Vous pourrez prendre ${mini.name} plus tard si vous changez d’avis.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous préférez. À l’année, vous payez ${12 - annuel.moisOfferts} mois et ${annuel.moisOfferts} sont offerts. ${mini.name} revient à ${eur(parAn(mini))} € par an au lieu de ${eur(12 * mini.month)} €. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'J’ai un code promo ou un code de parrainage. Où le mettre ?', a: `Dans la case « Code promo ou parrainage », en bas de la page, juste au-dessus du bouton Commander. Je vérifie le code tout de suite. Un code promo réduit le prix de la création. Un code de parrainage vous donne ${moisOffert}, à vous comme à la personne qui vous a recommandé.` },
    { q: 'Et pour une boutique en ligne ?', a: `C’est le ${BOU.name}, à ${mille(BOU.price)} € payés une fois. Il reprend tout le ${VIS.name} et ajoute une boutique complète : panier, paiement en ligne sécurisé, e-mails envoyés tout seuls à vos clients. Je configure la boutique, puis vous gérez votre catalogue librement depuis votre espace client : vos produits et vos services, vos prix, vos promotions et le suivi de vos commandes, sans limite d’articles. Vous installez vous-même vos moyens de paiement, Stripe ou PayPal, depuis ce même espace. ${mochi}, l’organisateur de la bande, garde le tout bien rangé.` },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site vitrine classique ?`, a: `Parce que ma méthode est rodée et que les Minis Monstres se chargent de tout ce qui se répète. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages avec les bases du référencement coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, et une agence demande davantage. Notre ${VIS.name} coûte ${eur(VIS.price)} €. Ces fourchettes sont publiées par des prestataires, donc à lire avec prudence, et des indépendants existent dès ${eur(INDEP)} € : l’écart est alors presque nul. L’entretien, lui, coûte ${eur(marche.entretienMin)} à ${eur(marche.entretienMax)} € par mois chez les prestataires consultés, contre ${eur(mini.month)} € avec ${mini.name}. Sources consultées en novembre 2026 : ${sourcesInline()}.` },
    { q: 'Qu’est-ce que je vois dans le tableau de bord ?', a: `Le tableau de bord fait partie de l’espace client, donc de l’abonnement ${mini.name}. Vous y voyez vos visiteurs jour par jour, d’où ils arrivent (Google, réseaux sociaux, lien direct), vos pages les plus vues et vos meilleures recherches sur Google. Les visites sont comptées sans cookie. Avec un ${BOU.name}, vos commandes s’y ajoutent.` },
    { q: 'Y a-t-il des frais cachés ?', a: `Non. Le récapitulatif de commande montre tout : le site choisi, et l’abonnement ${mini.name} si vous le prenez. Un devis n’arrive que si vous le demandez, pour une ${minus(anglais.name)}, une ${minus(specifique.name)} ou un gros chantier, et vous l’acceptez ou non avant que je commence.` },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous écrivez votre demande à ${cerise}, la secrétaire de ma petite bande, dans votre espace client. Elle vous pose quelques questions pour bien comprendre, puis vous résume la demande. Vous la confirmez, et elle la transmet. ${bricou}, le constructeur, s’en charge, je vérifie le résultat, et vous êtes prévenu quand c’est en ligne.` },
    { q: 'Puis-je annuler une demande ?', a: 'Oui, tant qu’elle n’est pas commencée. Un bouton Annuler s’affiche à côté de la demande, dans votre espace client. Une fois le travail lancé, écrivez-moi et nous en parlons.' },
    { q: 'En combien de temps est-ce fait ?', a: `Une modification peut prendre ${delaiModif}. Vous avez une seule demande en cours à la fois : dès qu’elle est terminée, vous pouvez envoyer la suivante.` },
    { q: 'Puis-je ajouter une page à mon site ?', a: `Oui, avec l’extra « ${pageGoogle.name} », à ${prixPage} € la page. Vous la commandez depuis votre espace client et vous la payez par carte aussitôt. ${mirette} en prépare le sujet avec vous, puis la page rejoint votre site.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre abonnement tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: `Non, il est compris dans l’abonnement ${mini.name}. Vous y demandez vos modifications, vous suivez leur avancement et vous retrouvez vos factures et votre lien de parrainage. ${cerise} vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour. C’est aussi là que vous commandez une page de plus pour Google.` },
  ],
  seo: [
    { q: 'C’est quoi, le référencement ?', a: `C’est tout ce qui aide votre site à être trouvé plus facilement sur Google. Des titres clairs, des pages qui répondent aux questions de vos clients, un site rapide : Google aime tout cela. J’y veille sur chaque page, et ${mirette}, la spécialiste visibilité de ma petite bande, soigne votre référencement local.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Je déclare votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'Quel site choisir pour être trouvé sur Google ?', a: `Le ${VIS.name}. Avec ses pages (jusqu’à ${creation.pages}), chacune peut parler d’un sujet précis, et Google peut montrer chacune dans ses résultats. Le ${ESS.name} suffit pour être joignable quand on tape votre nom, mais une seule page ne peut pas répondre à toutes les recherches.` },
    { q: 'Comment avoir plus de pages pour Google ?', a: `Vous les prenez en extra, depuis votre espace client, au moment qui vous convient. Une page de visibilité Google coûte ${prixPage} €. Chaque page se paie une fois, par carte, sans abonnement de plus. Par exemple, une page sur un service dans votre ville ou un petit guide.` },
    { q: 'C’est quoi, une page de visibilité Google ?', a: `Une page qui répond à une recherche précise de vos clients sur Google, comme un service dans votre ville ou une question qu’on vous pose souvent. Elle a un titre clair et renvoie vers vos services. Elle est optimisée pour le référencement local, puis intégrée à votre site.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté : une structure que Google comprend, des pages utiles, un site rapide. Le reste dépend aussi de vos concurrents et du temps.` },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Je peux le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site fait par mes soins, à partir de ${eur(ESS.price)} €. Écrivez-moi pour en parler.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont les cinq personnages de ma petite bande, chacun avec son rôle. ${bandeComprise}. Ils vous accompagnent du premier rendez-vous à la mise en ligne, et après si vous prenez ${mini.name}.` },
    { q: 'Les petits monstres construisent-ils mon site ?', a: `Ils y participent, chacun à sa place, mais c’est moi qui conçois votre site et qui fais les choix. Je relis tout et je vérifie chaque page avant la mise en ligne. Rien ne part sans mon accord, ni sans le vôtre.` },
    { q: 'Les petits monstres peuvent-ils se tromper ?', a: 'Oui, comme tout le monde. C’est pour ça que je garde la main : je contrôle leur travail, et vous validez votre site avant qu’il soit publié. Si quelque chose ne vous plaît pas, on le reprend.' },
    { q: 'Mes clients verront-ils comment mon site a été fait ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide, à votre nom. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins cher qu’une agence ?', a: 'Parce que je travaille autrement. Les Minis Monstres se chargent des tâches répétitives, et je traite en direct avec des hébergeurs français, les entreprises qui gardent les sites en ligne. Je n’ai ni local à payer ni équipe à faire tourner. Pour un très gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, c’est vous qui construisez le site, le mettez à jour et écrivez pour Google, souvent le soir. Chez moi, vous décrivez ce que vous voulez et c’est fait pour vous. Vous n’avez aucun outil à apprendre.' },
    { q: 'Et par rapport à un freelance ?', a: `Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Avec ${mini.name}, votre site reste en ligne, protégé et à jour, et vos modifications sont incluses. Vous connaissez le prix à l’avance.` },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Votre nom de domaine, l’adresse de votre site, est à votre nom et se transfère où vous voulez. L’export du site est possible avec les trois sites : vous recevez ses fichiers pour le mettre en ligne chez un autre prestataire. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou il donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${moisOffert} sur votre abonnement.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
    { q: 'Y a-t-il une remise pour un deuxième site ?', a: `Oui. La création de votre deuxième site coûte ${fidelite.remiseSecondSite} % de moins. C’est ma façon de remercier les clients qui reviennent.` },
  ],
};
