// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
const { abonnement, modification, options, paiement } = require('../config');
const prix = (id, mode) => options.find((o) => o.id === id)[mode];

module.exports = {
  sites: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: `Non. Je peux écrire les textes avec vous (option à ${prix('textes', 'u').once} €) et choisir des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.` },
    { q: 'Pourrai-je modifier mon site moi-même ?', a: 'Oui, si vous le souhaitez. Je peux construire votre site sur WordPress et vous montrer comment changer un texte ou une photo. Sinon, vous m’envoyez un message et je m’en occupe.' },
    { q: 'Mon site sera-t-il visible sur Google ?', a: 'Chaque site est préparé pour Google : titres, descriptions, vitesse, version mobile. Pour sortir sur des recherches près de chez vous, l’option référencement local aide beaucoup. Personne ne peut garantir la première place, donc je ne vous la promettrai pas.' },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. La différence se joue sur le temps passé, donc sur le prix. Pour un projet complexe, comme une application sur mesure ou un catalogue de milliers de produits, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
  ],
  tarifs: [
    { q: 'Pourquoi des prix « à partir de » ?', a: 'Parce que chaque projet est différent. Le prix de départ correspond au site décrit dans la formule. Si votre projet demande plus, c’est écrit dans le devis, avant de commencer.' },
    { q: 'Que se passe-t-il si j’arrête l’abonnement ?', a: `Après les ${abonnement.engagement} premiers mois, vous arrêtez quand vous voulez. Je vous remets votre site et votre nom de domaine, pour que vous puissiez le garder ailleurs.` },
    { q: 'Le nom de domaine est-il à mon nom ?', a: 'Oui. Il est enregistré à votre nom : c’est votre adresse sur internet, elle vous appartient.' },
    { q: 'Comment se passe le paiement ?', a: `Avec le paiement unique : ${paiement.acompte} % à la commande, le reste à la mise en ligne. Avec l’abonnement : un paiement chaque mois, à partir de la mise en ligne.` },
    { q: 'Et si je veux une modification plus tard ?', a: `Avec l’abonnement, les petites modifications sont comprises. Sans abonnement, une petite modification coûte ${modification} €, ou elles sont comprises dans l’option maintenance.` },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le devis indique tout : la création, les options, et ce qui se paie chaque mois ou chaque année.' },
  ],
  jeux: [
    { q: 'Sur quels appareils mon jeu fonctionnera-t-il ?', a: 'Dans un navigateur récent, sur ordinateur, tablette et téléphone. Il n’y a rien à installer : un lien suffit pour jouer.' },
    { q: 'Peut-on le publier sur l’App Store ou Google Play ?', a: 'C’est possible pour certains projets, mais c’est plus long et plus cher : comptes développeur, validation des boutiques. On en parle au moment du devis.' },
    { q: 'D’où viennent les graphismes ?', a: 'Formes simples et couleurs à votre image, vos propres dessins, ou des illustrations créées avec l’IA dont on a le droit de se servir.' },
    { q: 'Pouvez-vous refaire un jeu connu ?', a: 'Non. Je crée des jeux originaux. On peut partir d’un genre que vous aimez, comme l’adresse, la réflexion ou la plateforme, mais pas copier un jeu existant.' },
  ],
  auto: [
    { q: 'Faut-il acheter un logiciel ?', a: 'Le plus souvent, non : beaucoup de routines se font avec Gmail, Outlook ou les outils Google que vous avez déjà. Si un outil payant est vraiment utile, je vous le dis avant, avec son prix.' },
    { q: 'Et si une routine s’arrête de fonctionner ?', a: `Avec le suivi à 9 € par mois, je surveille et je corrige. Sans suivi, une correction coûte le prix d’une petite modification, soit ${modification} €.` },
    { q: 'C’est pour les entreprises ou les particuliers ?', a: 'Les deux. Un artisan qui croule sous les mails et une famille qui veut ranger ses papiers ont souvent le même besoin : moins de tâches répétitives.' },
  ],
  methode: [
    { q: 'Est-ce que mes clients verront que le site est fait avec l’IA ?', a: 'Non, rien ne le signale sur votre site. Ce qu’ils voient, c’est un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
    { q: 'L’IA peut-elle faire des erreurs ?', a: 'Oui, et c’est pour ça que je relis, teste et corrige tout avant la mise en ligne. L’IA va vite, mais c’est moi qui valide.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: 'Il indique votre nom dans sa demande de devis. Dès qu’il a passé commande, la réduction s’applique sur sa facture et sur votre prochaine facture.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui, dans la limite de la moitié du prix d’un projet. Ils ne sont pas convertibles en argent.' },
  ],
};
