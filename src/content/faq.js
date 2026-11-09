// FAQ complète (page /faq/)
module.exports = [
  {
    id: 'tarifs-paiement',
    title: 'Tarifs et paiement',
    icon: 'euro',
    items: [
      { q: 'Où puis-je consulter vos prix ?', a: "Tous mes tarifs de base sont publiés sur la page [Tarifs](/tarifs/) : diagnostic de panne 79 €, déplacement à partir de 20 €, prise ou interrupteur dès 35 €, point lumineux dès 90 €, disjoncteur dès 45 €, tableau dès 650 €. La mise en sécurité est chiffrée sur devis après visite." },
      { q: 'Y a-t-il une majoration le soir, le samedi ou le dimanche ?', a: "Aucune. J'ai choisi de travailler sur ces créneaux ; ce n'est pas à vous d'en payer le prix." },
      { q: 'Comment le supplément kilométrique est-il calculé ?', a: "Selon la distance par la route entre Signy-l'Abbaye et votre domicile : rien jusqu'à 15 km, 10 € de 15 à 30 km, 20 € de 30 à 45 km. Au-delà, le déplacement est convenu à l'avance." },
      { q: 'Quand dois-je payer ?', a: "Pour un dépannage, à la fin de l'intervention, sur présentation de la facture. Pour des travaux sur devis, selon l'échéancier indiqué sur le devis, avec éventuellement un acompte à la commande." },
      { q: 'Recevrai-je une facture ?', a: "Toujours. Elle détaille le déplacement, le diagnostic éventuel, le matériel posé et la main-d'œuvre. Conservez-la : elle peut être utile pour votre assurance ou lors de la vente du logement." },
    ],
  },
  {
    id: 'disponibilites',
    title: 'Disponibilités et rendez-vous',
    icon: 'calendar-days',
    items: [
      { q: 'Quels sont vos horaires d’intervention ?', a: "Du lundi au vendredi de 18 h à 21 h 30, le samedi de 8 h à 19 h et le dimanche de 9 h à 18 h. Toujours sur rendez-vous." },
      { q: 'Pourquoi uniquement sur rendez-vous ?', a: "Pour vous donner une heure d'arrivée fiable et préparer le bon matériel. Un rendez-vous évite aussi de vous faire attendre une demi-journée derrière votre fenêtre." },
      { q: 'Pouvez-vous venir le soir même ?', a: "Quand le planning le permet, oui. Appelez en fin d'après-midi : selon les rendez-vous déjà pris et la distance, je peux souvent proposer un créneau le soir même ou le lendemain soir." },
      { q: 'Combien de temps dure une intervention en soirée ?', a: "La plupart des dépannages et petits travaux tiennent en une à deux heures. Les chantiers plus longs, comme un remplacement de tableau, sont programmés le week-end." },
    ],
  },
  {
    id: 'interventions',
    title: 'Interventions et travaux',
    icon: 'wrench',
    items: [
      { q: 'Quels types de travaux réalisez-vous ?', a: "Dépannage, recherche de panne, remplacement de prises et d'interrupteurs, éclairage intérieur et extérieur, ajout de circuits, prises spécialisées, remplacement de disjoncteurs et de tableaux, mise en sécurité. La liste complète est sur la page [Prestations](/prestations/)." },
      { q: 'Faut-il que je sois présent ?', a: "Oui, ou une personne de confiance majeure. Je dois pouvoir accéder au tableau et vous expliquer ce qui a été fait à la fin." },
      { q: 'Fournissez-vous le matériel ?', a: "Oui, du matériel de marque, neuf et conforme. Vous pouvez aussi fournir vos luminaires ou appareillages décoratifs : je vérifie alors qu'ils conviennent à l'emplacement prévu." },
      { q: 'Faites-vous des saignées dans les murs ?', a: "Oui, lorsque c'est nécessaire, avec rebouchage propre au plâtre. Les finitions décoratives (peinture, papier peint) restent à votre charge. Sur un mur fragile, la pose en apparent sous moulure est souvent une meilleure option." },
      { q: 'Posez-vous des bornes de recharge pour voiture électrique ?', a: "Je pose des prises renforcées adaptées à la recharge lente. Pour une borne de plus de 3,7 kW, la réglementation impose un installateur qualifié IRVE : voir la page [recharge de véhicule électrique](/prise-renforcee-voiture-electrique/)." },
    ],
  },
  {
    id: 'securite',
    title: 'Sécurité et normes',
    icon: 'shield-check',
    items: [
      { q: 'Qu’est-ce que la norme NF C 15-100 ?', a: "C'est la norme française qui fixe les règles des installations électriques basse tension dans les logements : protections, sections de câbles, nombre de prises, salle de bain, terre. Elle s'applique aux installations neuves et aux parties rénovées. Lire [l'essentiel de la norme](/blog/norme-nf-c-15-100-essentiel/)." },
      { q: 'Mon installation est ancienne : est-elle dangereuse ?', a: "Pas forcément, mais certains signes doivent alerter : fusibles, absence de différentiel 30 mA, prises sans terre, fils en tissu, traces de chauffe. Un [diagnostic](/diagnostic-electrique-ardennes/) permet de faire le point." },
      { q: 'Que faire si je sens une odeur de brûlé ?', a: "Coupez immédiatement le disjoncteur général, n'essayez pas de remettre le courant et éloignez-vous de la zone. S'il y a de la fumée ou des flammes, appelez le 18 ou le 112. Ensuite seulement, faites contrôler l'installation." },
      { q: 'Délivrez-vous le diagnostic électrique obligatoire pour une vente ?', a: "Non : ce diagnostic réglementaire est réservé aux diagnostiqueurs certifiés. En revanche, je réalise les travaux qui corrigent les anomalies qu'il a relevées, et je peux vous accompagner lors d'une [visite avant achat](/bilan-electrique-avant-achat/)." },
    ],
  },
  {
    id: 'devis',
    title: 'Devis et contact',
    icon: 'file-text',
    items: [
      { q: 'Comment obtenir un devis ?', a: "Par téléphone, sur WhatsApp ou via le [formulaire de devis](/devis/). Pour les travaux simples, un échange et quelques photos suffisent. Pour un tableau ou une mise en sécurité, je passe voir l'installation." },
      { q: 'Le devis est-il payant ?', a: "Non, il est gratuit et sans engagement." },
      { q: 'Quel est le moyen le plus rapide pour vous joindre ?', a: "Le téléphone, ou un message WhatsApp avec une photo. Je consulte mes messages tous les jours et je rappelle en priorité les pannes en cours." },
    ],
  },
];
