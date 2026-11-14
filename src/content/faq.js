// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
const { types, forfaits, annuel, lissage, options, paiement, fidelite, pageEnPlus } = require('../config');
const opt = (id) => options.find((o) => o.id === id);

module.exports = {
  creation: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: 'Non. On écrit les textes ensemble à partir de ce que vous me racontez, et je choisis des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.' },
    { q: 'Le prix de création est-il vraiment fixe ?', a: `Oui. Il couvre ce que décrit chaque type de site. Si vous voulez plus de pages, c’est ${pageEnPlus} € la page, et tout est écrit dans le récapitulatif avant de commencer.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. Je vais plus vite grâce à l’IA, donc je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % pour lancer le projet, puis le solde quand le site est en ligne. Le forfait démarre ce jour-là.` },
  ],
  forfaits: [
    { q: 'Quelle différence entre Chico et Power ?', a: `Chico (${forfaits[0].month} € par mois) garde votre site en ligne et à jour, avec une modification par mois. Power (${forfaits[1].month} € par mois) ajoute le SEO, un rapport mensuel sur vos visiteurs, vos ventes et vos positions, et une modification par semaine.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui : le prix du site peut être lissé sur ${lissage.mois} mois. Dans ce cas, l’engagement est de 2 ans.` },
    { q: 'Suis-je engagé ?', a: `Au mois, non : vous arrêtez quand vous voulez, avec un mois de préavis. À l’année, vous payez douze mois d’un coup et ${annuel.moisOfferts} sont offerts. Si le site est lissé sur 2 ans, l’engagement est de 2 ans.` },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Votre nom de domaine est à votre nom : vous le gardez. Je vous remets une copie de votre site (contenus, images et fichiers) pour que vous puissiez le faire héberger ailleurs.' },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif indique tout : la création, le forfait et les options choisies. Rien d’autre.' },
  ],
  espace: [
    { q: 'Comment demander une modification ?', a: 'Depuis votre espace client : vous écrivez ce que vous voulez changer, avec une photo si besoin. Vous pouvez aussi m’écrire sur WhatsApp. Je m’occupe du reste.' },
    { q: 'En combien de temps est-ce fait ?', a: 'En général sous 48 heures pour une petite modification. Je vous préviens dès que c’est en ligne.' },
    { q: 'Les outils de l’espace client sont-ils payants ?', a: 'Non. Tableau de bord, QR code, lien d’avis et factures sont gratuits pour les sites hébergés chez moi.' },
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
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou donne votre code dans sa demande. Les deux sont dans votre espace client. Quand son site est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois de forfait offert.` },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Les avantages ne sont pas convertibles en argent.' },
  ],
};
