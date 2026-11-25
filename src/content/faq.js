// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes (1 à 3 phrases) et honnêtes, « nous / on » (jamais « je », Alex est nommé), vouvoiement, en mots de tous les jours. Chaque terme technique
// (nom de domaine, hébergement, sauvegarde, maintenance…) est expliqué la première fois qu'il apparaît
// dans une réponse. Aucun tiret long, aucun point-virgule, aucun prix d'un concurrent nommé (seule la fourchette
// du marché de config.marche est citée), et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page
// (scripts/check.js). Les phrases longues de config.js (pitch, desc, info, fait…) ne sont pas recopiées ici.
// Offre du 21 novembre 2026 : un seul site payé une fois, le Site Essentiel (config.offreSite), avec l'option e-commerce
// (type 'boutique'), assemblé à partir de nos modules et rempli avec le contenu du client. Le Site Visibilité est retiré : les pages
// pour Google sont l'extra « page de visibilité Google ». Puis deux façons de faire vivre le site : Autonomie (config.creationSeule, 0 € par mois, le client gère tout et reçoit
// l'export de son site) ou Mini (config.forfaits[0], au mois, sans engagement, modifications incluses, une demande à la fois).
// L'abonnement est facultatif. Trois extras seulement (config.aLaDemande non retirés) : la page de visibilité Google,
// payée une fois par carte depuis l'espace client, la traduction anglaise et la fonctionnalité spécifique, sur devis.
// La petite bande (config.bande) compte six Minis Monstres, présentés par leur prénom (Pépite, la spécialiste des extras, depuis le 19 novembre 2026).
// Le parrainage est retiré du site (seule la remise sur un deuxième site reste). Bricou clarifie les demandes de modification et les envoie à Alex, qui fait la modification. Aucun délai n'est annoncé.
// Tour global du 19 novembre 2026 : questions regroupées (59 → 44), même ordre que l'offre (le site, puis Autonomie ou Mini,
// enfin les extras), « visibilité sur Google » plutôt que « référencement », « modification » plutôt que « retouche ».
const cfg = require('../config');
const { forfaits, fractionne, paiement, fidelite, creation, marche, bande, limites, aLaDemande, creationSeule } = cfg;

const { sourcesInline, INDEPENDANT_DES: INDEP } = require('../lib/components');
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const minus = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const liste = (l, mot = 'et') => (l.length > 1 ? `${l.slice(0, -1).join(', ')} ${mot} ${l[l.length - 1]}` : l.join(''));
const EN_FOIS = `en ${fractionne.fois} fois avec ${fractionne.organismes}`; // par un organisme externe, sur la page de paiement

// Le site (config.offreSite) : le Site Essentiel, le même avec l'option e-commerce, et l'option seule.
const ESS = cfg.offreSite.site, BOU = cfg.offreSite.avecBoutique, ECO = cfg.offreSite.option;
const packs = (() => { const p = (aLaDemande.find((x) => x.id === 'packseo') || { packs: [] }).packs.filter((n) => n > 1); return p.length ? liste(p.map(String), 'ou') : ''; })();
// Un seul abonnement, facultatif : Mini (id 'base'). Sans abonnement : Autonomie (config.creationSeule).
const mini = forfaits.find((f) => f.id === 'base') || forfaits[0];
const dom = mini.domaine || 2; // le nom de domaine fourni par nos soins : en plus, par mois
const avecDom = mini.month + dom; // le forfait Mini avec le nom de domaine
const AUTO = creationSeule.name;
const delaiModif = `jusqu’à ${mini.delai.replace(/ heures?$/, ' h')}`; // une modification peut prendre jusqu'à 48 h
// Les extras encore proposés (config.aLaDemande, non retirés).
const extra = (id) => aLaDemande.find((x) => x.id === id && !x.retire) || {};
const pageGoogle = extra('packseo'), anglais = extra('anglais'), specifique = extra('specifique');
const prixPage = eur(pageGoogle.prix); // prix d'une page de visibilité Google, payée une fois

// La petite bande : chaque Mini Monstre par son prénom, avec son rôle (config.bande).
const monstre = (id) => bande.find((b) => b.id === id) || { nom: '', role: '' };
const cerise = monstre('support').nom;
const bricou = monstre('constructeur').nom;
const plume = monstre('ecrivain').nom;
const mirette = monstre('observateur').nom;
const mochi = monstre('organisateur').nom;
// Ce que fait chacun, en quelques mots (écrit ici pour la FAQ, différent des phrases de config.js).
const MISSION = {
  support: 'répond à vos questions',
  constructeur: 'prépare vos demandes de modification pour Alex',
  ecrivain: 'aide à écrire vos textes',
  observateur: 'prépare vos pages pour Google',
  organisateur: 'range vos pages, vos produits et vos commandes',
  extras: 'présente les extras et prépare vos devis',
};
const mission = (b) => MISSION[b.id] || minus(b.court.replace(/\.$/, ''));
const presente = (b) => `${b.nom} (${minus(b.role)}) ${mission(b)}`;
const bandeComprise = liste(bande.map(presente));

// Les outils au mois (config.outilsOffre, décision d'Alex du 24 novembre 2026) : rubrique « outils », pour la page /outils/
// et la FAQ complète. Ouverts à tous, avec ou sans site. Jamais un mot sur l'IA : ce sont des petits monstres.
// Les règles précises sont à l'article 20 des conditions générales (src/content/legal.js).
const OO = cfg.outilsOffre || { outils: [], bande: {}, essaiJours: 14 };
const outilsPrets = (OO.outils || []).filter((o) => o.statut === 'pret');
const outilOffert = outilsPrets.find((o) => o.inclusSite);
const prixOutils = liste(outilsPrets.map((o) => `${o.nom} ${eur(o.prix)} €`));
const publier = outilsPrets.find((o) => o.id === 'publier');
const exempleLimite = publier ? `${publier.limite} ${publier.unite} pour ${publier.nom}` : '';

module.exports = {
  creation: [
    { q: 'Quel site proposez-vous, et à quel prix ?', a: `Un seul, le ${ESS.name}, à ${eur(ESS.price)} € la création. Il comprend les pages essentielles (accueil, présentation, services et tarifs, galerie, questions fréquentes, contact), et Alex le crée avec vos réponses : vos textes, vos photos, vos couleurs. Pour vendre en ligne, l’option ${minus(ECO.name)} ajoute ${eur(ECO.prix)} €, soit ${eur(BOU.price)} € en tout.` },
    { q: 'Comment un site aussi soigné peut-il coûter moins cher ?', a: `Parce que nous avons réduit nos charges au maximum, et que ces économies vous reviennent. Le soin, lui, reste entier : votre site est prêt en ${ESS.delai} une fois votre contenu reçu.` },
    { q: 'Puis-je modifier mon site moi-même ?', a: `Oui. À la livraison, vous recevez une première version de votre site. Avec le forfait ${mini.name}, le bouton « Modifier mon site moi-même » de votre espace client vous permet de cliquer sur un texte ou une photo et de le changer, en direct. Vous préférez nous le confier ? Envoyez-nous une demande.` },
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Vous nous racontez votre métier, et ${plume}, la rédactrice de la bande, aide à en tirer des textes clairs. Pour les photos, nous choisissons des images libres de droits, que vous remplacerez par les vôtres quand vous voudrez.` },
    { q: 'Combien de modifications puis-je faire ?', a: `Autant que vous voulez, avec le forfait ${mini.name} : vous changez vous-même vos textes et vos photos, en direct, et vous nous demandez le reste dans « Mes modifications ».` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat se vaut : moderne, rapide, soigné. Notre méthode est rodée, donc nous allons plus vite et nous coûtons moins cher. Pour une application sur mesure ou un très gros catalogue, un développeur reste le bon choix, et nous vous le dirons.' },
    { q: 'Comment se passe le paiement du site ?', a: `Vous payez votre site en commandant, d’un coup ou ${EN_FOIS}. Plus rien n’est dû pour la création ensuite. Si vous prenez le forfait ${mini.name}, il démarre à la mise en ligne, pas avant.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: `Tout se lit de haut en bas sur la page Créer mon site. D’abord vous choisissez votre site, ensuite le forfait ${AUTO} ou le forfait ${mini.name}, et le total s’affiche. Vous payez votre site en ligne, et un e-mail de confirmation arrive aussitôt.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, avec ou sans abonnement. Au moment de commander, sur la page de paiement, vous choisissez de régler en une fois, ou ${EN_FOIS}. L’organisme nous verse tout de suite le prix du site, puis vous le remboursez en ${fractionne.fois} fois. C’est lui qui vous propose l’échéancier et qui donne son accord, selon ses conditions.` },
    { q: 'Suis-je obligé de prendre un abonnement ?', a: `Non. Avec le forfait ${AUTO}, vous ne payez rien par mois et vous gérez votre site vous-même. Le forfait ${mini.name} est facultatif et s’arrête quand vous le décidez.` },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe, le service de paiement en ligne, vous envoie la facture par e-mail. Vous la retrouvez aussi dans votre espace client. La TVA n’y figure pas, car l’entreprise est en franchise de TVA (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Votre abonnement se termine à la fin de la période en cours. Vous gardez votre nom de domaine (l’adresse de votre site) et vous recevez l’export de votre site, une copie complète prête à installer ailleurs. Le site reste en ligne encore 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail, et vous êtes remboursé en entier. Si vous avez demandé à démarrer tout de suite, on garde seulement la part du travail déjà fait, au prorata, et on vous rembourse le reste. Une fois votre site entièrement livré, vous ne pouvez plus vous rétracter. Le nom de domaine déjà réservé reste à votre nom pour un an, et à votre charge.' },
  ],
  forfaits: [
    { q: 'Combien ça coûte, en tout ?', a: `Le prix de votre site, une fois : ${eur(ESS.price)} €, ou ${eur(BOU.price)} € avec l’option ${minus(ECO.name)}. Ensuite, ${eur(creationSeule.month)} € par mois avec le forfait ${AUTO}, ou ${eur(mini.month)} € par mois avec le forfait ${mini.name}. Pour un ${ESS.name} avec le forfait ${mini.name}, la première année revient à ${eur(ESS.price + 12 * mini.month)} €, ou à ${eur(ESS.price + 12 * avecDom)} € si nous fournissons le nom de domaine.` },
    { q: `Que comprend le forfait ${mini.name} ?`, a: `Tout ce qui garde votre site en ligne et à jour : l’hébergement (l’endroit où votre site reste accessible jour et nuit), les sauvegardes automatiques, la sécurité et la maintenance technique. Vos modifications sont incluses, une demande à la fois, depuis votre espace client. Il coûte ${eur(mini.month)} € par mois, sans engagement, ou ${eur(avecDom)} € si nous fournissons le nom de domaine.` },
    { q: `C’est quoi, le forfait ${AUTO} ?`, a: `C’est le site sans abonnement : ${eur(creationSeule.month)} € par mois. Une fois le site validé, vous recevez son export, une copie complète avec une courte notice, à installer chez l’hébergeur de votre choix. L’hébergement, le nom de domaine, les sauvegardes et les mises à jour sont alors à votre charge.` },
    { q: 'Quels sont les extras ?', a: `Il y en a trois, jamais imposés. La ${minus(pageGoogle.name)}, à ${prixPage} € la page, se commande dans votre espace client et se paie une fois, par carte. La ${minus(anglais.name)} et la ${minus(specifique.name)}, par exemple une prise de rendez-vous, se font sur devis.` },
    { q: 'Les modifications sont-elles limitées ?', a: `Non, pas avec le forfait ${mini.name} : vous en demandez autant que vous voulez, une à la fois. Un texte, des photos, un horaire, une page à corriger : ce sont des modifications. Une nouvelle page pour Google, une traduction ou une refonte complète sont des extras ou un devis.` },
    { q: 'Le nom de domaine est-il compris ?', a: `Vous avez déjà un nom de domaine (l’adresse de votre site) ? Le forfait ${mini.name} reste à ${eur(mini.month)} € par mois. Vous n’en avez pas ? On vous le fournit, à votre nom, pour ${eur(dom)} € de plus par mois, soit ${eur(avecDom)} €. L’hébergement, lui, est toujours compris.` },
    { q: 'Comment se paie l’abonnement ?', a: `Au mois : ${eur(mini.month)} € par mois, sans engagement. Il démarre à la mise en ligne de votre site et s’arrête quand vous le décidez. Ce jour-là, vous enregistrez votre carte pour le forfait.` },
    { q: 'J’ai un code promo. Où le mettre ?', a: 'Dans la case « Code promo », juste au-dessus du bouton Commander. Il réduit le prix du site, jamais celui de l’abonnement ni des extras.' },
    { q: 'Et pour une boutique en ligne ?', a: `Cochez l’option ${minus(ECO.name)} sous le ${ESS.name} : ${eur(ECO.prix)} € de plus pour la création, soit ${eur(BOU.price)} € en tout. Elle ajoute le panier et le paiement en ligne sécurisé. Nous configurons la boutique, puis vous gérez vos produits, vos prix et vos commandes depuis votre espace client, sans limite d’articles.` },
    { q: `Pourquoi est-ce ${marche.foisTexte} fois moins cher qu’un site vitrine classique ?`, a: `Parce que nos charges sont au plus bas : moins de dépenses pour nous, c’est un prix plus léger pour vous. Chez un indépendant, un site vitrine de ${marche.pagesCompare} pages coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €, contre ${eur(ESS.price)} € pour notre ${ESS.name}. Ces fourchettes viennent de prestataires, donc prudence : des indépendants existent dès ${eur(INDEP)} €. Sources consultées en novembre 2026 : ${sourcesInline()}.` },
    { q: 'Y a-t-il des frais cachés ?', a: `Non. Le récapitulatif de commande montre tout : le site choisi, et le forfait ${mini.name} si vous le prenez. Un devis n’arrive que si vous le demandez, et vous l’acceptez ou non avant le début du travail.` },
  ],
  espace: [
    { q: 'Comment se passe une modification ?', a: `Vous écrivez votre demande dans votre espace client. ${bricou}, le constructeur de la bande, la clarifie avec vous et l’envoie à Alex, qui fait la modification. Vous êtes prévenu quand c’est en ligne.` },
    { q: 'Comment suivre ma demande ?', a: `Vous la suivez dans votre espace client, étape par étape, et vous êtes prévenu dès qu’elle est faite. Vous avez une seule demande en cours à la fois : dès qu’elle est terminée, vous envoyez la suivante.` },
    { q: 'Puis-je annuler une demande ?', a: 'Oui, tant qu’elle n’est pas commencée : un bouton Annuler s’affiche à côté de la demande. Une fois le travail lancé, écrivez-nous.' },
    { q: 'Que trouve-t-on dans l’espace client ?', a: `La liste de toutes les pages de votre site, dont vos pages de visibilité Google, avec un lien pour voir ou modifier chacune. Vous y suivez votre commande, vous demandez vos modifications, vous commandez un extra et vous retrouvez vos factures. Avec le forfait ${mini.name}, le bouton « Modifier mon site moi-même » change un texte ou une photo en direct, et l’option ${minus(ECO.name)} ajoute Ma boutique. ${cerise} vous y répond aussi dans la bulle en bas de l’écran, jusqu’à ${limites.bulleJour} messages par jour.` },
    { q: 'Comment est créé mon compte ?', a: 'En commandant : vous choisissez votre mot de passe dans le formulaire de commande, et votre espace client est prêt tout de suite. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Vous êtes prévenu par e-mail 30 jours avant, et une simple connexion annule tout.' },
  ],
  seo: [
    { q: 'Comment un site m’aide-t-il à être trouvé sur Google ?', a: `Sans site internet, Google n’a presque rien à montrer quand on cherche votre métier. Avec des titres clairs, des pages qui répondent aux questions de vos clients et un affichage rapide, il comprend ce que vous faites et où. Nous y veillons sur chaque page, et ${mirette}, la spécialiste visibilité de la bande, soigne votre présence locale.` },
    { q: 'En combien de temps serai-je sur Google ?', a: 'Nous déclarons votre site à Google dès sa mise en ligne, et on le trouve vite en tapant votre nom. Pour des recherches plus disputées, comme votre métier et votre ville, comptez quelques semaines à quelques mois.' },
    { q: 'C’est quoi, une page de visibilité Google ?', a: `Une page qui répond à une recherche précise de vos clients : un service dans votre ville, une question fréquente, un petit guide. C’est ainsi que votre site grandit sur Google, une fois en ligne. Vous la commandez dans votre espace client, à ${prixPage} € la page, sans abonnement${packs ? `, à l’unité ou par ${packs}` : ''} : ${mirette} en choisit le sujet avec vous.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: 'Non, et personne ne le peut honnêtement. Nous mettons toutes les chances de votre côté : des pages utiles, que Google comprend, sur un site rapide. Le reste dépend aussi de vos concurrents et du temps.' },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: `Nous pouvons le regarder et vous dire ce qui freine votre visibilité sur Google. Ensuite, vous choisissez : un devis pour l’améliorer, ou un nouveau site, à partir de ${eur(ESS.price)} €.` },
  ],
  methode: [
    { q: 'Qui sont les petits monstres ?', a: `Ce sont les six personnages de notre petite bande, chacun avec son rôle. ${bandeComprise}.` },
    { q: 'Qui construit mon site ?', a: `Alex, la personne derrière les Minis Monstres. Il crée votre site à partir de votre questionnaire, et votre site est relu en entier avant sa mise en ligne. Ensuite, les petits monstres veillent dessus : ils le sauvegardent, le tiennent à jour et relèvent vos visites pour votre espace client, et ${bricou} prépare vos demandes de modification pour Alex. Rien ne part en ligne sans vérification.` },
    { q: 'Mes clients verront-ils comment mon site a été fait ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide, à votre nom. De notre côté, nous préférons vous dire comment nous travaillons : vous savez ce que vous achetez.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins chers qu’une agence ?', a: 'Parce que nos charges sont bien plus légères : nous les avons réduites au maximum, et nous traitons en direct avec des hébergeurs français. Pour un très gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, vous construisez le site et vous le tenez à jour, souvent le soir. Chez nous, vous décrivez ce que vous voulez et c’est fait pour vous.' },
    { q: 'Et par rapport à un indépendant ?', a: `Un indépendant crée votre site, puis chaque changement passe souvent par lui. Chez nous, votre espace client vous donne la liste de vos pages et l’accès à tout. Avec le forfait ${mini.name}, vous modifiez vous-même, vos demandes sont incluses, et le prix est connu à l’avance.` },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Votre nom de domaine est à votre nom et se transfère où vous voulez. Vous recevez aussi l’export de votre site, pour le mettre en ligne chez un autre prestataire. Rien ne vous retient.' },
  ],
  outils: [
    { q: 'Faut-il avoir un site chez vous pour prendre un outil ?', a: 'Non. Les outils sont ouverts à tous, pour votre activité comme pour vos projets personnels, que votre site soit chez nous, ailleurs, ou que vous n’en ayez pas. Il faut seulement un compte client, gratuit.' },
    { q: 'Combien coûtent les outils ?', a: `Chacun a son prix au mois : ${prixOutils}. ${OO.bande.nom ? `${OO.bande.nom}, à ${eur(OO.bande.prix)} € par mois, les réunit tous, avec les suivants dès leur sortie. ` : ''}Avec le forfait ${mini.name}, ${outilOffert ? `${outilOffert.nom} est offert et ` : ''}les outils s’ajoutent à la même facture.` },
    { q: 'L’essai est-il gratuit ? Faut-il une carte bancaire ?', a: `L’essai dure ${OO.essaiJours} jours, il est gratuit, et aucune carte n’est demandée. Vous avez un essai par outil. S’il ne vous convient pas, ne faites rien : l’outil s’arrête de lui-même, et rien n’est prélevé.` },
    { q: 'Comment arrêter un outil ?', a: 'Depuis votre espace client, outil par outil, quand vous voulez : il n’y a pas d’engagement. L’outil marche jusqu’au bout du mois déjà payé, puis s’arrête, et vos autres outils continuent.' },
    { q: 'Que se passe-t-il si je dépasse la limite ?', a: `Chaque outil affiche sa limite du mois${exempleLimite ? `, par exemple ${exempleLimite}` : ''}. Une fois atteinte, il se repose jusqu’au mois suivant, sans rien vous facturer en plus. Il vous en faut davantage ? Écrivez-nous.` },
    { q: 'Est-ce que vous publiez sans moi ?', a: 'Jamais. Les petits monstres vous proposent un texte par réseau, vous le changez si vous voulez, puis c’est vous qui appuyez sur « Tout publier ». Vous restez maître de ce qui sort en votre nom.' },
    { q: 'Mes comptes sont-ils en sécurité ?', a: 'Vous reliez un réseau une fois, avec une autorisation créée sur le réseau lui-même : nous ne voyons jamais votre mot de passe habituel. Cette clé reste dans votre compte, sans jamais s’afficher, et elle est effacée quand vous déliez le réseau. Vous préférez ne rien relier ? Le bouton Partager de votre téléphone suffit.' },
  ],
  fidelite: [
    { q: 'Y a-t-il une remise pour un deuxième site ?', a: `Oui. Votre deuxième site coûte ${fidelite.remiseSecondSite} % de moins : c’est notre façon de remercier les clients qui reviennent.` },
    { q: 'La remise s’applique-t-elle à l’abonnement ?', a: 'Non. Elle porte sur le prix de la création du site. L’abonnement et les extras gardent leur prix affiché.' },
  ],
};
