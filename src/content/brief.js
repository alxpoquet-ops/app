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
      { id: 'activite', label: 'Votre activité en quelques phrases', kind: 'texte_long', requis: true, aide: 'Ce que vous faites, pour qui, et ce qui vous rend différent.' },
      { id: 'slogan', label: 'Une phrase d’accroche (facultatif)', kind: 'texte', aide: 'Par exemple : « Des fleurs qui ne fanent jamais ».' },
      { id: 'zone', label: 'Où travaillez-vous ?', kind: 'texte', aide: 'Une ville, un département, ou partout en France.' },
    ],
  },
  {
    id: 'style',
    titre: 'Le style',
    icon: 'palette',
    champs: [
      { id: 'couleurs', label: 'Les couleurs que vous aimez', kind: 'multi', autre: true, options: ['Pastel', 'Couleurs vives', 'Rouge', 'Rose', 'Orange', 'Jaune', 'Vert', 'Bleu', 'Violet', 'Beige et naturel', 'Noir et blanc', 'Doré'] },
      { id: 'couleurs_precises', label: 'Des couleurs précises ? (facultatif)', kind: 'texte', aide: 'Les couleurs de votre logo ou de votre boutique, par exemple « vert sauge et crème ».' },
      { id: 'ambiance', label: 'L’ambiance du site', kind: 'multi', autre: true, options: ['Kawaii, mignon', 'Naturel', 'Élégant, chic', 'Moderne', 'Minimaliste', 'Rétro, vintage', 'Chaleureux', 'Sérieux, professionnel', 'Ludique, coloré'] },
      { id: 'logo', label: 'Votre logo', kind: 'fichier', aide: 'Pas de logo ? Laissez vide : le nom de votre site sera écrit avec une belle police.' },
      { id: 'sites_aimes', label: 'Des sites que vous aimez (facultatif)', kind: 'texte_long', aide: 'Leurs adresses, et ce qui vous plaît : les couleurs, la mise en page, les photos…' },
    ],
  },
  {
    id: 'contact',
    titre: 'Vos coordonnées sur le site',
    icon: 'phone',
    champs: [
      { id: 'formulaire', label: 'Un formulaire de contact sur le site ?', kind: 'ouinon', defaut: 'oui' },
      { id: 'formulaire_email', label: 'L’adresse e-mail qui reçoit les messages', kind: 'email', prerempli: 'email', si: { champ: 'formulaire', vaut: 'oui' } },
      { id: 'telephone_afficher', label: 'Afficher votre numéro de téléphone ?', kind: 'ouinon' },
      { id: 'telephone', label: 'Le numéro à afficher', kind: 'tel', prerempli: 'telephone', si: { champ: 'telephone_afficher', vaut: 'oui' } },
      { id: 'adresse_afficher', label: 'Afficher une adresse ?', kind: 'ouinon', aide: 'Utile si vos clients viennent chez vous : boutique, cabinet, atelier.' },
      { id: 'adresse', label: 'L’adresse à afficher', kind: 'texte', prerempli: 'adresse_complete', si: { champ: 'adresse_afficher', vaut: 'oui' } },
      { id: 'horaires', label: 'Vos horaires (facultatif)', kind: 'texte_long', aide: 'Par exemple : du mardi au samedi, 9 h à 18 h.' },
      { id: 'reseaux', label: 'Vos réseaux sociaux (facultatif)', kind: 'texte_long', aide: 'Les adresses de vos pages Instagram, Facebook, TikTok…' },
    ],
  },
  {
    id: 'images',
    titre: 'Vos images',
    icon: 'image-plus',
    champs: [
      { id: 'images', label: 'Vos photos, avec une petite description pour chacune', kind: 'images', max: 10, aide: 'Vos produits, votre lieu, votre travail, vous. Une phrase par photo suffit : « le bouquet de mariée rose », « l’atelier ». 8 Mo au plus par photo.' },
    ],
  },
  {
    id: 'pages',
    titre: 'Le contenu',
    icon: 'layout-template',
    champs: [
      { id: 'blocs', label: 'Ce qui doit apparaître sur votre page', kind: 'multi', types: ['une-page'], autre: true, options: ['Présentation', 'Vos services', 'Vos tarifs', 'Galerie de photos', 'Horaires et accès', 'Contact'] },
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
      { id: 'prix', label: 'Vos prix', kind: 'liste', max: 12, si: { champ: 'prix_afficher', vaut: 'oui' }, colonnes: [{ id: 'nom', label: 'Prestation', kind: 'texte' }, { id: 'prix', label: 'Prix', kind: 'texte' }, { id: 'description', label: 'Description', kind: 'texte' }] },
    ],
  },
  {
    id: 'vente',
    titre: 'Ce que vous vendez',
    icon: 'shopping-bag',
    types: ['boutique'],
    champs: [
      { id: 'vente_type', label: 'Vous vendez…', kind: 'choix', requis: true, options: ['Des produits physiques', 'Des services', 'Les deux', 'Des produits numériques (à télécharger)'] },
      { id: 'produits', label: 'Vos produits ou services (les premiers suffisent)', kind: 'liste', max: 12, colonnes: [{ id: 'nom', label: 'Nom', kind: 'texte' }, { id: 'prix', label: 'Prix', kind: 'texte' }, { id: 'description', label: 'Description', kind: 'texte' }], aide: 'Vous en avez beaucoup ? Mettez les premiers ici : vous ajouterez les autres vous-même, sans limite, depuis votre espace client.' },
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
      { id: 'siret', label: 'Votre SIRET (si vous en avez un)', kind: 'texte' },
      { id: 'adresse_legale', label: 'L’adresse de l’entreprise', kind: 'texte', prerempli: 'adresse_complete' },
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
