// Les mots techniques expliqués simplement. Sur chaque page, la première fois qu'un de ces mots apparaît dans le texte,
// un petit « ? » s'ajoute à côté : au survol ou au clic, une bulle donne l'explication, avec un lien vers le lexique.
// Appliqué après la traduction, sur les pages françaises (fr) et anglaises (en) : voir scripts/glossaire.js.
// fr / en : les façons d'écrire le mot (la première trouvée dans la page reçoit le « ? »).
// lien : la page qui en dit plus (le lexique ou un guide), sans le préfixe /en/.
module.exports = [
  {
    fr: ['SEO', 'référencement'],
    en: ['SEO'],
    titre: 'SEO', titreEn: 'SEO',
    def: 'Tout ce qui permet à votre site d’être plus facilement trouvé sur Google.',
    defEn: 'Everything that helps your website be found more easily on Google.',
    lien: '/lexique/referencement-naturel-seo/',
  },
  {
    fr: ['nom de domaine', 'noms de domaine'],
    en: ['domain name', 'domain names'],
    titre: 'Nom de domaine', titreEn: 'Domain name',
    def: 'L’adresse de votre site internet, par exemple mon-entreprise.fr. Elle est à votre nom.',
    defEn: 'Your website’s address, for example my-business.com. It is registered in your name.',
    lien: '/guides/choisir-nom-de-domaine/',
  },
  {
    fr: ['hébergement'],
    en: ['hosting'],
    titre: 'Hébergement', titreEn: 'Hosting',
    def: 'L’endroit où votre site est rangé, pour rester accessible 24 h/24.',
    defEn: 'The place where your website is stored, so it stays online 24/7.',
    lien: '/lexique/hebergement-web/',
  },
  {
    fr: ['sauvegardes', 'sauvegarde'],
    en: ['backups', 'backup'],
    titre: 'Sauvegarde', titreEn: 'Backup',
    def: 'Une copie de sécurité de votre site, pour le remettre comme avant en cas de souci.',
    defEn: 'A safety copy of your website, to put it back as it was if something goes wrong.',
    lien: '/lexique/sauvegarde-site/',
  },
  {
    fr: ['maintenance'],
    en: ['maintenance'],
    titre: 'Maintenance', titreEn: 'Maintenance',
    def: 'Les vérifications techniques régulières qui gardent votre site en état de marche.',
    defEn: 'The regular technical checks that keep your website working properly.',
    lien: '/lexique/maintenance-site/',
  },
  {
    fr: ['HTTPS'],
    en: ['HTTPS'],
    titre: 'HTTPS', titreEn: 'HTTPS',
    def: 'Le petit cadenas à côté de l’adresse : les échanges entre vos visiteurs et votre site sont protégés.',
    defEn: 'The little padlock next to the address: what your visitors send to your website is protected.',
    lien: '/lexique/https-certificat-ssl/',
  },
  {
    fr: ['Google Search Console'],
    en: ['Google Search Console'],
    titre: 'Google Search Console', titreEn: 'Google Search Console',
    def: 'Un outil gratuit de Google qui montre comment Google voit votre site et sur quelles recherches il apparaît.',
    defEn: 'A free Google tool that shows how Google sees your website and which searches it appears in.',
    lien: '/lexique/google-search-console/',
  },
  {
    fr: ['CMS'],
    en: ['CMS'],
    titre: 'CMS', titreEn: 'CMS',
    def: 'Le logiciel qui fait tourner un site et permet d’en changer le contenu, comme WordPress.',
    defEn: 'The software that runs a website and lets you change its content, such as WordPress.',
    lien: '/lexique/cms/',
  },
];
