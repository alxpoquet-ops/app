// Questionnaire de création (« le brief ») : le client le remplit dans son espace après sa commande.
// Une seule définition, utilisée par l'espace client (PHP, via data.json), par la page Documentation
// et par la version anglaise. Avec ces réponses, on doit pouvoir créer le site sans autre échange.
//
// Champs : id, label, kind (texte, texte_long, email, tel, choix, multi, ouinon, fichier, images, liste),
// aide (facultatif), options (choix et multi), autre (true : champ libre « Autre »),
// types (limite le champ à certains types de site), si (affiché seulement si un autre champ a cette valeur),
// prerempli (valeur reprise de la commande), requis, max (images et listes), colonnes (listes).
const sections = [
  {
    id: 'site',
    titre: 'Votre site',
    icon: 'globe',
    champs: [
      { id: 'nom_site', label: 'Le nom de votre site', kind: 'texte', requis: true, prerempli: 'entreprise', aide: 'Celui qui s’affiche en haut du site, en général le nom de votre entreprise.' },
      { id: 'domaine', label: 'Votre nom de domaine', kind: 'texte', prerempli: 'domaine', lectureSeule: true },
      { id: 'activite', label: 'Votre activité en quelques phrases', kind: 'texte_long', requis: true, aide: 'Ce que vous faites et pour qui. Écrivez comme vous parlez : on met en forme.' },
      { id: 'points_forts', label: 'Pourquoi vos clients vous choisissent-ils ?', kind: 'texte_long', requis: true, aide: 'Deux à quatre raisons : la qualité, les matières, le fait main, l’écoute, la rapidité, l’expérience… Pas d’idée ? Notez ce que vos clients vous disent souvent. C’est la partie « Pourquoi me choisir » de votre site.' },
      { id: 'slogan', label: 'Une phrase d’accroche (facultatif)', kind: 'texte', aide: 'Par exemple : « Des fleurs qui ne fanent jamais ». Pas d’idée ? Laissez vide.' },
      { id: 'base', label: 'Où êtes-vous installé(e) ?', kind: 'texte', requis: true, aide: 'Votre ville. Elle sert aussi à être trouvé(e) sur Google près de chez vous.' },
      { id: 'zone', label: 'Jusqu’où travaillez-vous, ou envoyez-vous ?', kind: 'choix', autre: true, options: ['Dans ma ville et autour', 'Dans mon département ou ma région', 'Partout en France', 'En France et à l’étranger'] },
    ],
  },
  {
    id: 'travail',
    titre: 'Votre façon de travailler',
    icon: 'handshake',
    champs: [
      { id: 'achat', label: 'Comment vos clients vous achètent-ils ou vous contactent-ils ?', kind: 'multi', requis: true, autre: true, options: ['Par le formulaire du site', 'Par téléphone', 'Par e-mail', 'Par les réseaux sociaux', 'Sur les marchés ou les salons', 'Dans ma boutique ou mon atelier', 'Sur rendez-vous', 'Directement sur le site (boutique en ligne)'] },
      { id: 'envoi', label: 'Envoyez-vous vos produits ?', kind: 'choix', types: ['une-page', 'vitrine'], autre: true, options: ['Oui, partout en France', 'Oui, en France et à l’étranger', 'Oui, seulement près de chez moi', 'Non, on vient les chercher', 'Je ne vends pas de produits'] },
      { id: 'perso_ok', label: 'Proposez-vous du sur-mesure ou de la personnalisation ?', kind: 'ouinon' },
      { id: 'perso', label: 'Que peut-on personnaliser, et quels choix proposez-vous ?', kind: 'texte_long', si: { champ: 'perso_ok', vaut: 'oui' }, aide: 'Par exemple : la forme (ronde, carrée), le parfum (vanille, figue), la couleur, un prénom. Donnez les choix possibles : on ne montre que ceux-là.' },
      { id: 'etapes', label: 'Comment se passe une commande ou une prestation, du premier contact à la fin ?', kind: 'texte_long', aide: 'Par exemple : « vous m’écrivez, on choisit ensemble, je fabrique, j’envoie ». Ajoutez le délai si vous en avez un. C’est la partie « Comment ça se passe ».' },
      { id: 'vedette', label: 'Un produit ou une offre à mettre en avant ? (facultatif)', kind: 'texte', aide: 'Votre produit phare, ou une offre de saison : Noël, fête des mères, été…' },
      { id: 'evenements', label: 'Faites-vous des marchés, des salons ou des événements ?', kind: 'ouinon' },
      { id: 'agenda', label: 'Vos prochaines dates', kind: 'liste', max: 12, si: { champ: 'evenements', vaut: 'oui' }, colonnes: [{ id: 'date', label: 'Date', kind: 'texte' }, { id: 'lieu', label: 'Lieu et nom de l’événement', kind: 'texte' }], aide: 'Pas encore vos dates ? Laissez vide : votre site affichera « bientôt », et vous nous les enverrez quand vous les aurez.' },
      { id: 'faq', label: 'Les questions que vos clients vous posent souvent (facultatif)', kind: 'liste', max: 8, colonnes: [{ id: 'question', label: 'La question', kind: 'texte' }, { id: 'reponse', label: 'Votre réponse', kind: 'texte_long' }], aide: 'Avec votre réponse. Pas d’idée ? Laissez vide : nous écrirons les questions fréquentes à partir de vos réponses à ce questionnaire, sans rien ajouter.' },
    ],
  },
  {
    id: 'google',
    titre: 'Être trouvé sur Google',
    icon: 'search-check',
    types: ['vitrine', 'boutique'],
    champs: [
      { id: 'villes', label: 'Dans quelles villes ou quels secteurs voulez-vous être trouvé ?', kind: 'texte_long', requis: true, aide: 'Par exemple : Thionville, Hayange, Metz et alentours. Une page peut être faite pour chacun : seulement ceux que vous nous donnez.' },
      { id: 'recherches', label: 'Que tapent vos clients sur Google pour vous trouver ?', kind: 'texte_long', requis: true, aide: 'Quelques recherches, comme vous les imaginez : « bougie personnalisée prénom », « cadeau naissance bougie ». Pas d’idée ? Notez vos produits et services principaux.' },
      { id: 'conseils', label: 'Des sujets de conseils que vous aimeriez partager ? (facultatif)', kind: 'texte_long', aide: 'Par exemple : « comment bien entretenir une bougie ». Nous écrivons aussi des pages de conseils sur votre métier pour Google : vous les relisez avant la mise en ligne.' },
    ],
  },
  {
    id: 'style',
    titre: 'Le style',
    icon: 'palette',
    champs: [
      { id: 'couleurs', label: 'Les couleurs que vous aimez', kind: 'multi', autre: true, options: ['Pastel', 'Couleurs vives', 'Rouge', 'Rose', 'Orange', 'Jaune', 'Vert', 'Bleu', 'Violet', 'Beige et naturel', 'Noir et blanc', 'Doré'] },
      { id: 'couleurs_precises', label: 'Des couleurs précises ? (facultatif)', kind: 'texte', aide: 'Les couleurs de votre logo ou de votre boutique, par exemple « vert sauge et crème ». Pas d’idée ? Laissez vide : on choisit avec vos couleurs préférées.' },
      { id: 'ambiance', label: 'L’ambiance du site', kind: 'multi', autre: true, options: ['Kawaii, mignon', 'Naturel', 'Élégant, chic', 'Moderne', 'Minimaliste', 'Rétro, vintage', 'Chaleureux', 'Sérieux, professionnel', 'Ludique, coloré'] },
      { id: 'logo', label: 'Votre logo', kind: 'fichier', aide: 'Pas de logo ? Laissez vide : le nom de votre site sera écrit avec une belle police.' },
      { id: 'sites_aimes', label: 'Un site internet dont le style vous plaît ? (facultatif)', kind: 'texte_long', aide: 'Celui d’une marque, d’un commerçant ou d’un créateur que vous aimez. Donnez son nom ou son adresse, et ce qui vous plaît : les couleurs, les photos, la façon dont c’est rangé. On s’en inspire sans copier. Rien en tête ? Laissez vide : nous regardons nous-mêmes ce qui se fait dans votre métier.' },
    ],
  },
  {
    id: 'contact',
    titre: 'Vos coordonnées sur le site',
    icon: 'phone',
    champs: [
      { id: 'formulaire', label: 'Un formulaire de contact sur le site ?', kind: 'ouinon', defaut: 'oui' },
      { id: 'formulaire_email', label: 'L’adresse e-mail qui reçoit les messages', kind: 'email', prerempli: 'email', si: { champ: 'formulaire', vaut: 'oui' }, aide: 'Vous voulez une autre adresse plus tard ? Gardez celle-ci pour l’instant : elle se change en un message.' },
      { id: 'telephone_afficher', label: 'Afficher votre numéro de téléphone ?', kind: 'ouinon' },
      { id: 'telephone', label: 'Le numéro à afficher', kind: 'tel', prerempli: 'telephone', si: { champ: 'telephone_afficher', vaut: 'oui' } },
      { id: 'adresse_afficher', label: 'Afficher une adresse ?', kind: 'ouinon', aide: 'Utile si vos clients viennent chez vous : boutique, cabinet, atelier.' },
      { id: 'adresse', label: 'L’adresse à afficher', kind: 'texte', prerempli: 'adresse_complete', si: { champ: 'adresse_afficher', vaut: 'oui' } },
      { id: 'horaires', label: 'Vos horaires (facultatif)', kind: 'texte_long', aide: 'Par exemple : du mardi au samedi, 9 h à 18 h. Pas d’horaires fixes (sur rendez-vous, sur les marchés, en ligne) ? Dites-le simplement.' },
      { id: 'reseaux', label: 'Vos réseaux sociaux (facultatif)', kind: 'texte_long', aide: 'Les adresses de vos pages Instagram, Facebook, TikTok… Pas encore prêtes ? Écrivez par exemple « Instagram plus tard » : on prévoit la place.' },
    ],
  },
  {
    id: 'images',
    titre: 'Vos images',
    icon: 'image-plus',
    champs: [
      { id: 'images', label: 'Vos photos, avec une petite description pour chacune', kind: 'images', max: 10, aide: 'Vos produits, votre lieu, votre travail, vous. Une phrase par photo suffit : « le bouquet de mariée rose », « l’atelier ». 8 Mo au plus par photo. Pas encore de photos ? Aucun souci : on met une jolie image d’attente, la même partout, et vous enverrez vos photos plus tard.' },
    ],
  },
  {
    id: 'pages',
    titre: 'Le contenu',
    icon: 'layout-template',
    champs: [
      { id: 'blocs', label: 'Les parties de votre page', kind: 'multi', types: ['une-page'], autre: true, options: ['Pourquoi me choisir', 'Mes produits ou services', 'Mes prix', 'Comment ça se passe', 'Galerie de photos', 'Où me trouver (adresse, horaires, marchés)', 'Questions fréquentes', 'Contact'], defaut: ['Pourquoi me choisir', 'Mes produits ou services', 'Mes prix', 'Comment ça se passe', 'Galerie de photos', 'Où me trouver (adresse, horaires, marchés)', 'Questions fréquentes', 'Contact'], aide: 'Tout est coché : c’est ce qui fait un site complet. Décochez seulement ce que vous ne voulez pas. Une partie encore vide (pas de photos, pas de dates) affichera « bientôt ».' },
      { id: 'pages_voulues', label: 'Les pages que vous voulez', kind: 'liste', types: ['vitrine', 'boutique'], max: 20, colonnes: [{ id: 'nom', label: 'Nom de la page', kind: 'texte' }, { id: 'contenu', label: 'Ce qu’elle doit dire', kind: 'texte_long' }], aide: 'Par exemple : Accueil, Nos services, Tarifs, FAQ, À propos, Contact. Jusqu’à 20 pages, pages de visibilité Google comprises.' },
      { id: 'textes', label: 'Les textes du site', kind: 'choix', requis: true, options: ['Écrivez-les pour moi à partir de mes réponses', 'J’écris mes textes et je les envoie'] },
    ],
  },
  {
    id: 'prix',
    titre: 'Vos prix',
    icon: 'euro',
    types: ['une-page', 'vitrine'],
    champs: [
      { id: 'prix_afficher', label: 'Afficher vos prix sur le site ?', kind: 'ouinon' },
      { id: 'prix', label: 'Vos prix', kind: 'liste', max: 12, si: { champ: 'prix_afficher', vaut: 'oui' }, colonnes: [{ id: 'nom', label: 'Produit ou prestation', kind: 'texte' }, { id: 'prix', label: 'Prix', kind: 'texte' }, { id: 'description', label: 'Ce qui est compris', kind: 'texte' }], aide: 'Une ligne par prix. Pour un pack ou une formule, dites ce qu’il contient : « Pack Noël, 40 €, 5 bougies ».' },
    ],
  },
  {
    id: 'vente',
    titre: 'Ce que vous vendez',
    icon: 'shopping-bag',
    types: ['boutique'],
    champs: [
      { id: 'vente_type', label: 'Vous vendez…', kind: 'choix', requis: true, options: ['Des produits physiques', 'Des services', 'Les deux', 'Des produits numériques (à télécharger)'] },
      { id: 'produits', label: 'Vos produits ou services (les premiers suffisent)', kind: 'liste', max: 12, colonnes: [{ id: 'nom', label: 'Nom', kind: 'texte' }, { id: 'prix', label: 'Prix', kind: 'texte' }, { id: 'description', label: 'Description et ce qui est compris', kind: 'texte' }], aide: 'Vous en avez beaucoup ? Mettez les premiers ici : vous ajouterez les autres vous-même, sans limite, depuis votre espace client.' },
      { id: 'nb_produits', label: 'Combien de produits en tout, à peu près ?', kind: 'texte' },
      { id: 'categories', label: 'Vos catégories (facultatif)', kind: 'texte', aide: 'Par exemple : Bouquets, Roses, Cadeaux.' },
      { id: 'livraison_modes', label: 'Comment livrez-vous ?', kind: 'multi', autre: true, si: { champ: 'vente_type', vaut: ['Des produits physiques', 'Les deux'] }, options: ['Colissimo (La Poste)', 'Point relais (Mondial Relay…)', 'Retrait sur place', 'Livraison locale par moi'] },
      { id: 'livraison_zones', label: 'Où livrez-vous ?', kind: 'multi', si: { champ: 'vente_type', vaut: ['Des produits physiques', 'Les deux'] }, options: ['France', 'Europe', 'Monde entier'] },
      { id: 'livraison_frais', label: 'Les frais de livraison', kind: 'texte_long', si: { champ: 'vente_type', vaut: ['Des produits physiques', 'Les deux'] }, aide: 'Par exemple : 6 € en France, offerte dès 60 € d’achat.' },
      { id: 'expedition_delai', label: 'Sous combien de jours expédiez-vous ?', kind: 'texte', si: { champ: 'vente_type', vaut: ['Des produits physiques', 'Les deux'] } },
      { id: 'rendez_vous', label: 'Vos clients doivent-ils prendre rendez-vous ?', kind: 'ouinon', aide: 'Une prise de rendez-vous en ligne est une fonctionnalité spécifique : elle se fait sur devis.', si: { champ: 'vente_type', vaut: ['Des services', 'Les deux'] } },
      { id: 'paiements', label: 'Les paiements acceptés', kind: 'multi', options: ['Carte bancaire (Stripe)', 'PayPal'], aide: 'Vous installez vous-même ces moyens de paiement depuis votre espace client.' },
      { id: 'retours', label: 'Vos conditions de retour (facultatif)', kind: 'texte_long', aide: 'Par exemple : retour possible sous 14 jours, produit non utilisé.' },
    ],
  },
  {
    id: 'legal',
    titre: 'Pour les mentions légales',
    icon: 'scale',
    champs: [
      { id: 'raison_sociale', label: 'Le nom de votre entreprise (ou votre nom)', kind: 'texte', requis: true, prerempli: 'raison' },
      { id: 'siret', label: 'Votre SIRET (si vous en avez un)', kind: 'texte', aide: 'Pas encore de SIRET ? Laissez vide.' },
      { id: 'adresse_legale', label: 'L’adresse de l’entreprise', kind: 'texte', requis: true, prerempli: 'adresse_complete', aide: 'Obligatoire : la loi demande l’adresse de la personne qui publie le site. Elle apparaît seulement dans les mentions légales, en bas du site. Vous travaillez de chez vous ? Votre adresse personnelle ou celle de votre domiciliation convient.' },
    ],
  },
  {
    id: 'fin',
    titre: 'Pour finir',
    icon: 'message-circle',
    champs: [
      { id: 'infos_plus', label: 'Autre chose à savoir ? (facultatif)', kind: 'texte_long', aide: 'Une idée, une contrainte, une date à respecter…' },
    ],
  },
];

// Le questionnaire pour un type de site : seulement les sections et les champs qui le concernent
function pour(type) {
  return sections
    .filter((s) => !s.types || s.types.includes(type))
    .map((s) => ({ ...s, champs: s.champs.filter((c) => !c.types || c.types.includes(type)) }))
    .filter((s) => s.champs.length);
}

module.exports = { sections, pour };
