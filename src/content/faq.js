// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
const { types, entretien, jetons, forfaits, annuel, options, paiement, fidelite, pageEnPlus } = require('../config');
const opt = (id) => options.find((o) => o.id === id);

module.exports = {
  creation: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Je peux écrire les textes avec vous (option à ${opt('textes').price.once} €) et choisir des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.` },
    { q: 'Le prix de création est-il vraiment fixe ?', a: `Oui. Il couvre ce que décrit chaque type de site. Si vous voulez plus de pages, c’est ${pageEnPlus} € la page, et tout est écrit dans le récapitulatif avant de commencer.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. Je vais plus vite grâce à l’IA, donc je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % pour lancer le projet, puis le solde quand le site est en ligne. Le forfait démarre ce jour-là.` },
  ],
  forfaits: [
    { q: 'Que comprend l’entretien ?', a: `Pour ${entretien.month} € par mois : l’hébergement, le nom de domaine, les sauvegardes, les mises à jour des extensions et votre espace client. Il est compris dans tous les forfaits.` },
    { q: 'Suis-je engagé ?', a: `Au mois, non : vous arrêtez quand vous voulez, avec un mois de préavis. À l’année, vous vous engagez pour un an, payé en une fois, et vous avez ${annuel.moisOfferts} mois offerts.` },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Votre nom de domaine est à votre nom : vous le gardez. Je vous remets une copie de votre site (contenus, images et fichiers) pour que vous puissiez le faire héberger ailleurs.' },
    { q: 'Puis-je changer de forfait ?', a: 'Oui, à tout moment depuis votre espace client ou par message. Le nouveau prix s’applique le mois suivant.' },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif indique tout : la création, l’entretien, le forfait et les options choisies. Rien d’autre.' },
  ],
  jetons: [
    { q: 'C’est quoi, un jeton ?', a: 'C’est votre crédit de modifications. Une petite modification de votre site ou une publication sur vos réseaux utilise un jeton, que je la fasse pour vous ou que vous passiez par nos outils.' },
    { q: 'Combien de jetons dans chaque forfait ?', a: `${forfaits.map((f) => `${f.name} : ${f.jetons} par mois`).join(', ')}. ${forfaits[0].name} offre en plus une publication chaque mois.` },
    { q: 'Et si je n’ai plus de jetons ?', a: `Vous rechargez en un clic depuis votre espace : ${jetons.recharge.price} € les ${jetons.recharge.qty} jetons. Ou vous passez au forfait du dessus.` },
  ],
  espace: [
    { q: 'Dois-je faire les modifications moi-même ?', a: 'Non. Je m’occupe de vos modifications : un message suffit. Nos outils sont là si vous voulez la main, par exemple pour annoncer une fermeture un dimanche soir.' },
    { q: 'Faut-il être à l’aise avec l’informatique ?', a: 'Non. Si vous savez envoyer un message, vous savez utiliser nos outils. Tout se fait depuis votre téléphone.' },
    { q: 'Et si un outil se trompe ?', a: 'Vous voyez l’aperçu avant de publier, et vous revenez à la version précédente en un clic. Je vérifie aussi les changements derrière vous.' },
    { q: 'Sur quels réseaux peut-on publier ?', a: 'Instagram, Facebook et votre fiche Google, avec tous les forfaits. Vos comptes restent les vôtres, vous pouvez couper l’accès à tout moment.' },
  ],
  seo: [
    { q: 'En combien de temps serai-je sur Google ?', a: 'Votre site est déclaré à Google dès la mise en ligne. On le trouve vite sur votre nom. Pour des recherches plus disputées, comptez quelques semaines à quelques mois.' },
    { q: 'Pouvez-vous me garantir la première place ?', a: 'Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté et je vous montre chaque mois où vous en êtes.' },
    { q: 'C’est quoi, un contenu optimisé ?', a: 'Un article ou une page qui répond à une vraie question de vos clients, avec des titres clairs et des liens vers vos services. Je le prépare avec l’IA et je le relis avant de le publier.' },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: 'Oui. Je regarde votre site et je vous dis ce qui freine votre visibilité. Écrivez-moi pour un devis.' },
  ],
  methode: [
    { q: 'Mes clients verront-ils que le site est fait avec l’IA ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
    { q: 'L’IA peut-elle faire des erreurs ?', a: 'Oui. C’est pour ça que je relis, teste et corrige tout avant la mise en ligne. L’IA va vite, mais c’est moi qui valide.' },
  ],
  shopify: [
    { q: 'Puis-je quitter Shopify pour une boutique ALED08 ?', a: 'Oui. Je reprends vos produits, vos photos et vos textes, et je prépare les redirections pour ne pas perdre votre place sur Google. Le prix dépend du nombre de produits : demandez-moi un devis.' },
    { q: 'Les frais de paiement sont-ils différents ?', a: 'Presque pas : environ 1,5 % + 0,25 € par paiement par carte européenne dans les deux cas. La vraie différence se joue sur l’abonnement, les applications et le temps que vous y passez.' },
  ],
  visibilite: [
    { q: 'Par quoi commencer quand on a peu de budget ?', a: 'Pour un commerce ou un artisan, la fiche Google et les avis clients rapportent souvent le plus. Ensuite viennent le site, puis les réseaux.' },
    { q: 'Faut-il être sur tous les réseaux ?', a: 'Non. Mieux vaut un ou deux réseaux bien tenus que cinq comptes abandonnés. On choisit ensemble ceux où sont vos clients.' },
    { q: 'Puis-je ajouter un outil plus tard ?', a: 'Bien sûr. Vous l’activez quand vous voulez, dans votre espace client ou en m’écrivant. Rien n’est obligatoire au départ.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il indique votre nom dans sa demande. Quand son site est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois de forfait offert.` },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Les avantages ne sont pas convertibles en argent.' },
  ],
};
