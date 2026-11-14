// Questions fréquentes, par rubrique. La page /faq/ les reprend toutes.
// Règles : réponses courtes et honnêtes, aucun tiret long, aucun chiffre sur les concurrents,
// et pas de phrase de 9 mots ou plus reprise d'une autre réponse ou d'une page (scripts/check.js).
const { forfaits, annuel, lissage, options, paiement, fidelite, pageEnPlus, types, delais = { reponse: '72 heures', titan: '24 heures' } } = require('../config');
const opt = (id) => options.find((o) => o.id === id);
const F = (id) => forfaits.find((f) => f.id === id);
const chico = F('chico') || forfaits[0];
const power = F('power') || forfaits[1] || chico;
const titan = F('titan'); // peut ne pas exister encore : chaque réponse qui le cite est conditionnelle
const vitrine = types.find((t) => t.id === 'vitrine') || types[0];
const eur = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
// Mensualité du lissage, arrondie au centime inférieur (même règle que le serveur).
const LN = lissage.durees[lissage.durees.length - 1];
const lisse = (prix, n = LN) => Math.floor((prix / n) * 100) / 100;
const solde = 100 - paiement.acompte;

module.exports = {
  creation: [
    { q: 'Je n’ai ni textes ni photos, c’est un problème ?', a: 'Non. On écrit les textes ensemble à partir de ce que vous me racontez, et je choisis des photos libres de droits adaptées à votre activité. Vous les remplacerez par les vôtres quand vous voudrez.' },
    { q: 'Le prix de création est-il vraiment fixe ?', a: `Oui. Il couvre ce que décrit chaque type de site. Si vous voulez plus de pages, c’est ${eur(pageEnPlus)} € la page, et tout est écrit dans le récapitulatif avant de commencer.` },
    { q: 'Quelle différence avec un site fait par un développeur ?', a: 'Pour un site vitrine ou une petite boutique, le résultat est comparable : moderne, rapide, soigné. Je vais plus vite grâce à l’IA, donc je coûte moins cher. Pour une application sur mesure ou un très gros catalogue, l’expertise d’un développeur reste irremplaçable, et je vous le dirai.' },
    { q: 'Comment se passe le paiement de la création ?', a: `Vous réglez ${paiement.acompte} % en commandant, puis le solde quand le site est en ligne. Si vous préférez, vous le payez en ${lissage.durees.join(' ou ')} fois sans frais, ajouté à votre forfait.` },
  ],
  commande: [
    { q: 'Comment ça se passe quand je commande ?', a: 'Vous composez votre site, puis vous cliquez sur Commander. Vous relisez le récapitulatif, vous donnez vos coordonnées et vous payez en ligne. Un e-mail de confirmation arrive aussitôt, avec une référence de commande. Je vous écris ensuite pour démarrer.' },
    { q: 'Que paie-je aujourd’hui ?', a: `En une fois : un acompte de ${paiement.acompte} % sur la création, plus la première échéance de votre forfait et de vos options. Les ${solde} % restants vous sont demandés quand le site est en ligne. En plusieurs fois : la première mensualité du site et celle du forfait. Le montant exact s’affiche sur le bouton avant de valider.` },
    { q: 'Puis-je payer le site en plusieurs fois ?', a: `Oui, en ${lissage.durees.join(' ou ')} fois sans frais, en plus du forfait payé au mois. Un ${vitrine.label.toLowerCase()} à ${eur(vitrine.price)} € revient ainsi à ${eur(lisse(vitrine.price, lissage.durees[0]))} € par mois pendant ${lissage.durees[0]} mois, ou ${eur(lisse(vitrine.price))} € pendant ${LN} mois. Rien de plus à payer quand c’est fini.` },
    { q: 'Suis-je engagé ?', a: `Non, le forfait s’arrête quand vous le décidez, à la fin de la période payée. Seule exception : si vous payez le site en ${lissage.durees.join(' ou ')} fois, vous vous engagez le temps du paiement. Si vous partez avant, ce qui reste du prix du site est dû en une fois.` },
    { q: 'Puis-je changer de forfait ?', a: 'Oui, dans les deux sens, par message : le bouton est dans votre espace client, onglet Forfait et factures. Le nouveau prix démarre à la période suivante. Avec un site lissé, le forfait continue jusqu’à la fin des mensualités, quel que soit son niveau.' },
    { q: 'Comment sont faites les factures ?', a: 'À chaque paiement, Stripe émet la facture et vous l’envoie par e-mail. Vous la retrouvez aussi dans votre espace client, onglet Forfait et factures. La TVA n’y figure pas : l’entreprise est en franchise (article 293 B du CGI).' },
    { q: 'Que se passe-t-il si j’arrête ?', a: 'Vous me prévenez, et le forfait se termine à la fin de la période en cours. Vous repartez avec votre nom de domaine et une copie complète de votre site. L’hébergement chez moi reste actif 30 jours, le temps de déménager.' },
    { q: 'Et si je me rétracte ?', a: 'Vous avez 14 jours, par simple e-mail. Comme vous me demandez de commencer tout de suite, vous payez seulement le travail déjà fait, au prorata. Le nom de domaine déjà réservé reste à votre charge : il est à votre nom, pour un an.' },
  ],
  forfaits: [
    { q: `Quelle différence entre ${chico.name}, ${power.name} et ${titan ? titan.name : ''} ?`, a: `${chico.name} (${eur(chico.month)} € par mois) garde votre site en ligne et à jour sur un serveur de qualité, avec une modification par mois, faite par Lia ou par Alex, au choix. ${power.name} (${eur(power.month)} € par mois) ajoute le SEO, pour faire remonter votre site sur Google, un serveur plus rapide, un support et des modifications rapides : quatre modifications et quatre jetons Lia par mois.${titan ? ` ${titan.name} (${eur(titan.month)} € par mois) ajoute le retour de vos ventes et de vos chiffres chaque mois, et nos outils en illimité.` : ''}` },
    { q: 'Lia ou Alex : qui modifie mon site ?', a: 'C’est vous qui choisissez, à chaque demande. Lia, c’est l’IA : c’est instantané. Elle prépare la modification, vous montre l’aperçu, et ne modifie votre site qu’après votre accord. Chaque action de Lia utilise un jeton Lia. Alex, c’est moi : je fais la modification à la main, sous 72 heures, et je la vérifie moi-même. Je vérifie aussi tout ce que fait Lia.' },
    { q: 'Au mois ou à l’année ?', a: `Comme vous voulez. Au mois, vous arrêtez quand vous le souhaitez. À l’année, vous payez dix mois d’un coup et ${annuel.moisOfferts} sont offerts. Vous pouvez passer de l’un à l’autre au renouvellement.` },
    { q: 'Qu’est-ce qui compte comme une modification ?', a: 'Un changement précis sur une page qui existe : un horaire, un prix, une photo, un texte, un produit. Une demande, une modification. Les demandes non utilisées ne se reportent pas. Une page entière ou une nouvelle fonction, c’est un petit devis.' },
    { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le récapitulatif indique tout : la création, le forfait et les options choisies. Rien d’autre.' },
  ],
  espace: [
    { q: 'Comment demander une modification ?', a: 'Depuis votre espace client : vous écrivez ce que vous voulez changer, avec une photo si besoin. Vous choisissez qui s’en charge : Lia ou Alex. Je m’occupe du reste.' },
    { q: 'En combien de temps est-ce fait ?', a: `Je vous réponds sous ${delais.reponse} en jours ouvrés${titan ? `, et sous ${delais.titan} avec ${titan.name}` : ''}. Une petite modification est en général en ligne dans ce délai. Je vous préviens dès que c’est fait.` },
    { q: 'Comment est créé mon compte ?', a: 'Tout seul, dès que votre commande est validée. Vous pouvez aussi le créer avant, sans rien commander, sur la page Mon espace. Dans les deux cas, vous recevez un e-mail avec un lien pour choisir votre mot de passe. Si un compte existait déjà avec votre adresse, la commande y est simplement rattachée.' },
    { q: 'Mon compte peut-il être supprimé ?', a: 'Seulement s’il ne sert plus : aucune connexion depuis 12 mois et aucun forfait actif. Je vous préviens par e-mail 30 jours avant, et une simple connexion annule tout. Tant que votre forfait tourne, votre compte reste.' },
    { q: 'Les outils de l’espace client sont-ils payants ?', a: 'Non. Tableau de bord, QR code, lien d’avis et factures sont gratuits pour les sites hébergés chez moi.' },
  ],
  seo: [
    { q: 'En combien de temps serai-je sur Google ?', a: 'Votre site est déclaré à Google dès la mise en ligne. On le trouve vite sur votre nom. Pour des recherches plus disputées, comptez quelques semaines à quelques mois.' },
    { q: 'Le SEO, c’est compris dans quel forfait ?', a: 'Les bases sont comprises dans tous les forfaits : Google sait lire votre site. Le travail pour le faire remonter, chaque mois, est compris dans Power et Titan.' },
    { q: 'Pouvez-vous me garantir la première place ?', a: 'Non, et personne ne le peut honnêtement. Je mets toutes les chances de votre côté et je vous montre chaque mois où vous en êtes.' },
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
    { q: 'Et par rapport à un freelance ?', a: 'Un freelance crée votre site, puis chaque changement se négocie quand il est disponible. Mon forfait prend la suite : hébergement, sauvegardes, mises à jour et vos modifications sont compris chaque mois. Vous connaissez le prix à l’avance.' },
    { q: 'Si je pars, puis-je récupérer mon site ?', a: 'Oui. Le nom de domaine est à vous et se transfère où vous voulez. Je vous remets aussi les fichiers du site, pour le faire héberger ailleurs. Rien ne vous retient.' },
  ],
  fidelite: [
    { q: 'Comment mon filleul profite-t-il du parrainage ?', a: `Il passe par votre lien de parrainage, ou donne votre code dans sa commande. Quand son site est en ligne, vous recevez chacun ${fidelite.parrainageMois} mois de forfait offert.` },
    { q: 'Où trouver mon lien et mon code ?', a: 'Dans votre espace client, onglet Parrainage. Le lien se partage par message ou sur vos réseaux. Le code se tape dans le formulaire de commande. Les deux donnent le même avantage.' },
    { q: 'Quand le mois offert est-il appliqué ?', a: 'Dès que le site de votre filleul est en ligne. Il est déduit de votre facture suivante, et de la sienne. Il ne peut pas être échangé contre de l’argent.' },
    { q: 'Les avantages se cumulent-ils ?', a: 'Oui : vous pouvez parrainer plusieurs personnes. Chaque filleul en ligne vous apporte un mois de plus.' },
  ],
};
