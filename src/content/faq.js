// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes et honnêtes, aucun tiret long, aucun prix d'un concurrent nommé
// (seule la fourchette du marché de config.marche est citée),
// et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page (scripts/check.js).
const { forfaits, annuel, lissage, options, paiement, fidelite, delais, creation, boost, jetonsLia, marche } = require('../config');
const opt = (id) => options.find((o) => o.id === id);
const abo = forfaits[0]; // l'abonnement : il n'y en a qu'un
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
const mille = (n) => String(n).replace(/\B(?=(\d{3})+$)/g, ' '); // 1500 → 1 500
const durees = lissage.durees.join(' ou ');
const D1 = lissage.durees[0];
const LN = lissage.durees[lissage.durees.length - 1];
const acompte = (prix) => Math.round(prix * paiement.acompte) / 100;
// Mensualité du lissage, arrondie au centime inférieur (même règle que le serveur).
const lisse = (prix, n = LN) => Math.floor(((prix - acompte(prix)) / n) * 100) / 100; // mensualité du reste, après l’acompte
const annee = abo.month * (12 - annuel.moisOfferts); // l'abonnement payé à l'année
const boutique = creation.prix + creation.boutique;
const modifMax = 65; // la plus grande demande que Lia accepte (mots et photos) : voir la Documentation
const recharges = jetonsLia.recharge.map((r, i) => `${r.jetons}${i ? '' : ' jetons'} pour ${eur(r.prix)} €`);
const listeRecharges = `${recharges.slice(0, -1).join(', ')} ou ${recharges[recharges.length - 1]}`;
const extras = options.filter((o) => o.quand === 'mois');
const prixExtra = (o) => `${o.name} à ${eur(o.price.month)} €`;
const extrasTous = extras.filter((o) => !o.types).map(prixExtra).join(', ');
const extrasBoutique = extras.filter((o) => o.types).map(prixExtra).join(' et ');
const pagesPlus = opt('pages');

module.exports = {
  creation: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: 'Non. On écrit les textes ensemble à partir de ce que vous me racontez, et je choisis des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.' },
    { q: 'Quel site choisir ?', a: 'Le site une page, si vous démarrez ou si quelques lignes suffisent pour vous présenter : c’est votre carte de visite sur internet. Le site vitrine, si vous avez plusieurs services ou si vous voulez bien sortir sur Google : chaque page parle d’un sujet, et Google peut toutes les montrer. Les deux sont au même prix, alors choisissez selon ce que vous avez à dire. La boutique en ligne, si vous voulez vendre vos produits sur internet. Vous hésitez ? Écrivez-nous, on vous conseille.' },
    { q: 'Le prix de création est-il vraiment fixe ?', a: `Oui : ${eur(creation.prix)} € pour une page comme pour un site vitrine jusqu’à cinq pages, et ${eur(creation.boutique)} € de plus pour une boutique en ligne. Il vous faut plus de place ? Comptez ${eur(pagesPlus.price.once)} € pour l’option « ${pagesPlus.name} ». Tout est écrit dans le récapitulatif avant de commencer.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. Je vais plus vite grâce à l’IA, donc je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
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
    { q: 'Combien ça coûte, en tout ?', a: `${eur(creation.prix)} € une fois pour le site, puis ${eur(abo.month)} € par mois pour l’abonnement. Le prix du site ne change pas, que vous preniez une seule page ou un site vitrine de cinq pages. La première année revient donc à ${eur(creation.prix + 12 * abo.month)} €, ou à ${eur(creation.prix + annee)} € si vous payez l’abonnement à l’année.` },
    { q: 'Que comprend l’abonnement ?', a: `Tout ce qui fait tourner votre site : le nom de domaine, à votre nom et renouvelé chaque année, l’hébergement, les mises à jour, les sauvegardes et le suivi du site. Il y a aussi le support, avec une réponse sous ${delais.reponse}, et les bases du SEO. Chaque mois, vous recevez ${abo.jetons} Jetons Lia et une modification par Alex. Votre espace client et ses outils sont compris.` },
    { q: 'L’abonnement est-il obligatoire ?', a: 'Oui, tant que votre site est en ligne chez moi : c’est lui qui paie le nom de domaine, l’hébergement et l’entretien. Mais il est sans engagement. Vous l’arrêtez quand vous voulez, et vous gardez votre nom de domaine et une copie de votre site.' },
    { q: 'C’est quoi, un Jeton Lia ?', a: `Un Jeton Lia vaut ${eur(Math.round(jetonsLia.valeur * 100))} centime. Les jetons paient ce que fait Lia, l’IA : une modification de votre site, entre ${jetonsLia.modif.base} et ${modifMax} jetons, et les outils de votre espace client, dont le prix s’affiche avant de lancer. Les ${abo.jetons} jetons de l’abonnement font 2 à 3 modifications par Lia, ou une dizaine d’utilisations d’outils. Ils reviennent le 1er du mois et ne se reportent pas.` },
    { q: 'Et si j’ai besoin de plus de modifications ?', a: `Pour Lia, l’extra ${opt('liaplus').name} ajoute ${jetonsLia.liaplus} Jetons Lia chaque mois pour ${eur(opt('liaplus').price.month)} €. Vous pouvez aussi prendre une recharge quand il vous en manque : ${listeRecharges}. Les jetons d’une recharge restent, même quand le mois est fini. Pour Alex, il y a le Boost : une modification en plus de celle du mois pour ${eur(boost.prix)} €, ajoutée à votre prochaine facture.` },
    { q: 'Mes Jetons Lia peuvent-ils m’être rendus ?', a: 'Oui, dans quatre cas : la demande passe à Alex, la mise en ligne échoue, vous refusez l’aperçu, ou vous annulez la demande dans les 24 heures. Les jetons reviennent alors sur votre compteur.' },
    { q: 'Lia ou Alex : qui modifie mon site ?', a: `C’est vous qui choisissez, à chaque demande. Lia, c’est l’IA : c’est fait en 5 minutes. Elle prépare la modification, vous montre l’aperçu, et ne modifie votre site qu’après votre accord. Alex, c’est moi : je fais la modification à la main, sous ${delais.reponse}, et je la vérifie moi-même. Je vérifie aussi tout ce que fait Lia.` },
    { q: 'Quels extras puis-je ajouter à l’abonnement ?', a: `Ils se paient au mois, et vous les ajoutez ou les retirez quand vous voulez depuis votre espace client : ${extrasTous}. Pour les boutiques en ligne, il y a aussi ${extrasBoutique}. Aucun n’est obligatoire.` },
    { q: 'Et pour une boutique en ligne ?', a: `C’est ${eur(creation.boutique)} € de plus à la création, soit ${eur(boutique)} € une fois. L’abonnement reste à ${eur(abo.month)} € par mois. La boutique comprend le paiement par carte, le suivi des commandes et jusqu’à 20 produits que j’ajoute pour vous.` },
    { q: 'Au mois ou à l’année ?', a: `Comme vous voulez. Au mois, l’abonnement coûte ${eur(abo.month)} €. À l’année, il coûte ${eur(annee)} € : vous payez dix mois d’un coup et ${annuel.moisOfferts} sont offerts. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'Qu’est-ce qui compte comme une modification ?', a: 'Un changement précis sur une page qui existe : un horaire, un prix, une photo, un texte, un produit. Une demande, une modification. Les demandes non utilisées ne se reportent pas. Une page entière ou une nouvelle fonction, c’est un petit devis.' },
    { q: `Pourquoi est-ce ${marche.fois} fois moins cher qu’un site fait à la main ?`, a: `Parce que Lia, l’IA, fait le gros du travail en quelques heures, et que je vérifie tout derrière elle. Un site vitrine fait à la main par une agence ou un indépendant coûte en général entre ${mille(marche.vitrineMin)} et ${mille(marche.vitrineMax)} €. Chez moi, c’est ${eur(creation.prix)} €. Vous ne payez pas des semaines de travail, et votre site est quand même relu et testé par un humain.` },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif indique tout : la création, l’abonnement, les options et les extras choisis. Rien d’autre.' },
  ],
  espace: [
    { q: 'Comment demander une modification ?', a: 'Depuis votre espace client : vous écrivez ce que vous voulez changer, avec une photo si besoin. Vous choisissez qui s’en charge : Lia ou Alex. Je m’occupe du reste.' },
    { q: 'En combien de temps est-ce fait ?', a: `Avec Lia, quelques minutes : vous validez l’aperçu et c’est en ligne. Avec Alex, je vous réponds sous ${delais.reponse} en jours ouvrés, et une petite modification est en général faite dans ce délai. Je vous préviens dès que c’est fait.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun abonnement actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre abonnement tourne, votre compte reste.' },
    { q: 'L’espace client est-il payant ?', a: 'Non, il fait partie de l’abonnement : demandes de modification, tableau de bord, parrainage et factures. Les outils de Lia, eux, se paient en Jetons Lia. Leur prix est affiché avant chaque utilisation.' },
  ],
  seo: [
    { q: 'En combien de temps serai-je sur Google ?', a: 'Votre site est déclaré à Google dès la mise en ligne. On le trouve vite sur votre nom. Pour des recherches plus disputées, comptez quelques semaines à quelques mois.' },
    { q: 'Le SEO est-il compris dans l’abonnement ?', a: `Les bases, oui : Google sait lire et comprendre votre site. Pour le faire remonter mois après mois, il y a l’extra ${opt('seo').name}, à ${eur(opt('seo').price.month)} € par mois. Vous le prenez quand vous voulez, et vous l’arrêtez de la même façon.` },
    { q: 'Pouvez-vous me garantir la première place ?', a: `Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté. Avec l’extra ${opt('seo').name}, je vous montre chaque mois où vous en êtes.` },
    { q: 'C’est quoi, un contenu optimisé ?', a: 'Un article ou une page qui répond à une vraie question de vos clients, avec des titres clairs et des liens vers vos services. Je le prépare avec l’IA et je le relis avant de le publier.' },
    { q: 'J’ai déjà un site. Pouvez-vous l’améliorer ?', a: 'Oui. Je regarde votre site et je vous dis ce qui freine votre visibilité. Écrivez-moi pour un devis.' },
  ],
  methode: [
    { q: 'Mes clients verront-ils que le site est fait avec l’IA ?', a: 'Non, rien ne le signale sur votre site. Ils voient un site propre et rapide. De mon côté, je préfère vous dire comment je travaille : vous savez ce que vous achetez.' },
    { q: 'L’IA peut-elle faire des erreurs ?', a: 'Oui. C’est pour ça que je relis, teste et corrige tout avant la mise en ligne. L’IA va vite, mais c’est moi qui valide.' },
  ],
  comparatif: [
    { q: 'Pourquoi êtes-vous moins cher qu’une agence ?', a: 'Parce que je travaille autrement. L’IA m’aide à coder plus vite, je n’ai pas de local à payer ni d’équipe à faire tourner. Je garde les projets simples, que je sais bien faire. Pour un gros projet, une agence reste le bon choix.' },
    { q: 'Quelle différence avec une plateforme à faire soi-même ?', a: 'Qui fait le travail. Sur une plateforme, c’est vous qui construisez le site, le mettez à jour et écrivez pour Google, souvent le soir. Chez moi, vous décrivez ce que vous voulez et je le fais. Vous n’avez aucun outil à apprendre.' },
    { q: 'Et par rapport à un freelance ?', a: `Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Mon abonnement prend la suite : hébergement, sauvegardes, mises à jour, ${abo.jetons} Jetons Lia et une modification par Alex sont compris chaque mois. Vous connaissez le prix à l’avance.` },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Le nom de domaine est à vous et se transfère où vous voulez. Je vous remets aussi les fichiers du site, pour le faire héberger ailleurs. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois d’abonnement offert.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
  ],
};
