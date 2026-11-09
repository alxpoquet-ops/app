// Prestations principales (menu, cartes) et liste complète des 14 prestations.

const mainServices = [
  { key: 'depannage', path: '/prestations/depannage-electrique/', name: 'Dépannage électrique', short: 'Plus de courant, disjoncteur qui saute, prise morte : remise en service sûre, le soir ou le week-end.', icon: 'zap' },
  { key: 'panne', path: '/prestations/recherche-de-panne/', name: 'Recherche de panne', short: 'Pannes franches ou intermittentes : méthode, mesures et explication claire de l’origine du défaut.', icon: 'search' },
  { key: 'tableau', path: '/prestations/tableau-electrique/', name: 'Tableaux électriques', short: 'Remplacement de tableau à fusibles ou vétuste, ajout de différentiels 30 mA, repérage des circuits.', icon: 'panel-top' },
  { key: 'prises', path: '/prestations/prises-et-interrupteurs/', name: 'Prises et interrupteurs', short: 'Remplacement, ajout, prises spécialisées, va-et-vient : du matériel fiable posé dans les règles.', icon: 'plug' },
  { key: 'eclairage-int', path: '/prestations/eclairage-interieur/', name: 'Éclairage intérieur', short: 'Plafonniers, spots LED, appliques, variateurs : un éclairage confortable et économe.', icon: 'lamp-ceiling' },
  { key: 'eclairage-ext', path: '/prestations/eclairage-exterieur/', name: 'Éclairage extérieur', short: 'Façade, allée, terrasse : luminaires étanches, détecteurs de présence et prises extérieures.', icon: 'lamp-wall-up' },
  { key: 'securite', path: '/prestations/mise-en-securite/', name: 'Mise en sécurité', short: 'Terre, différentiels, salle de bain, conducteurs nus : on supprime les dangers en priorité.', icon: 'shield-check' },
];

const allServices = [
  { name: 'Recherche de panne électrique', path: '/prestations/recherche-de-panne/', icon: 'search', value: 'recherche-panne' },
  { name: 'Dépannage électrique', path: '/prestations/depannage-electrique/', icon: 'zap', value: 'depannage' },
  { name: 'Remplacement de prises', path: '/prestations/prises-et-interrupteurs/', icon: 'plug', value: 'prises' },
  { name: 'Remplacement d’interrupteurs', path: '/prestations/prises-et-interrupteurs/', icon: 'toggle-right', value: 'interrupteurs' },
  { name: 'Installation d’éclairage intérieur', path: '/prestations/eclairage-interieur/', icon: 'lamp-ceiling', value: 'eclairage-interieur' },
  { name: 'Installation d’éclairage extérieur', path: '/prestations/eclairage-exterieur/', icon: 'lamp-wall-up', value: 'eclairage-exterieur' },
  { name: 'Remplacement d’éclairage existant', path: '/remplacement-eclairage-led/', icon: 'lightbulb', value: 'remplacement-eclairage' },
  { name: 'Mise en sécurité d’installation', path: '/prestations/mise-en-securite/', icon: 'shield-check', value: 'mise-en-securite' },
  { name: 'Remplacement de tableau électrique', path: '/prestations/tableau-electrique/', icon: 'panel-top', value: 'tableau' },
  { name: 'Ajout de circuits électriques', path: '/ajout-circuit-electrique/', icon: 'cable', value: 'ajout-circuit' },
  { name: 'Remplacement de disjoncteurs', path: '/remplacement-disjoncteur/', icon: 'zap-off', value: 'disjoncteur' },
  { name: 'Installation de prises spécialisées', path: '/prise-specialisee/', icon: 'plug-zap', value: 'prise-specialisee' },
  { name: 'Diagnostic électrique', path: '/diagnostic-electrique-ardennes/', icon: 'clipboard-check', value: 'diagnostic' },
  { name: 'Petits travaux électriques', path: '/petits-travaux-electriques/', icon: 'wrench', value: 'petits-travaux' },
];

module.exports = { mainServices, allServices };
