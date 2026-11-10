# Guide de référencement local — passer devant la concurrence

Le site est prêt techniquement. Mais sur une recherche comme « électricien Rethel », Google affiche **d'abord la carte avec trois fiches d'entreprises**, puis les sites. Votre place sur cette carte dépend de votre **fiche Google Business Profile** et de vos **avis**, pas du site. Ce guide liste, dans l'ordre, ce qu'il reste à faire de votre côté.

## 1. Créer et remplir la fiche Google Business Profile (priorité n° 1)

Rendez-vous sur google.com/business. Comptez une heure, puis quelques jours pour la validation.

- **Nom** : `ALED08`. N'ajoutez pas de mots-clés dans le nom (« ALED08 électricien dépannage Rethel ») : Google peut suspendre la fiche.
- **Catégorie principale** : Électricien.
- **Type d'établissement** : vous vous déplacez chez les clients. Masquez votre adresse et déclarez une **zone desservie** : Signy-l'Abbaye, Rethel, Charleville-Mézières, Sedan, Rocroi, Liart, Novion-Porcien, Thin-le-Moutier, Poix-Terron, Château-Porcien.
- **Horaires** : lundi à vendredi 18 h – 21 h 30, samedi 8 h – 19 h, dimanche 9 h – 18 h. Ils doivent être identiques à ceux du site.
- **Téléphone et site** : exactement les mêmes que sur le site.
- **Services** : ajoutez-les un par un (dépannage électrique, recherche de panne, remplacement de tableau, prises et interrupteurs, éclairage, mise en sécurité), avec une phrase chacun. Indiquez le prix pour le dépannage : 79 €.
- **Photos** : un portrait de vous, votre véhicule, votre outillage, puis des photos de chantier (avant / après). Ajoutez-en une ou deux par mois.

**Description à copier-coller** (moins de 750 caractères) :

> ALED08, c'est Alexandre Poquet, électricien depuis 10 ans, installé à Signy-l'Abbaye. Ma spécialité : le dépannage et la recherche de panne chez les particuliers des Ardennes. Forfait dépannage 79 € : déplacement (jusqu'à 15 km), recherche de panne, proposition de solution et devis de réparation sans obligation. J'interviens le soir en semaine (18 h – 21 h 30) et le week-end, sur rendez-vous, sans majoration. Travaux sur devis gratuit : tableau électrique, prises, éclairage, mise en sécurité. Secteur : Signy-l'Abbaye, Rethel, Charleville-Mézières, Sedan, Rocroi et alentours.

Une fois la fiche validée, copiez son lien dans `googleReviewsUrl` (fichier `src/config.js`).

## 2. Obtenir de vrais avis

Le concurrent local le mieux noté n'a que 5 avis. **Dix avis réels suffisent à vous placer devant.**

- Demandez l'avis **le jour même ou le lendemain** de l'intervention, quand le client est content.
- Envoyez le lien direct vers le formulaire d'avis (dans votre fiche : « Demander des avis »).
- **Répondez à chaque avis**, en deux lignes, y compris aux avis moyens.
- N'offrez rien en échange d'un avis, et n'en écrivez jamais vous-même : c'est interdit et Google supprime les fiches.

**Message à envoyer par SMS ou WhatsApp :**

> Bonjour, c'est Alexandre d'ALED08. Merci pour votre confiance. Si l'intervention vous a convenu, un avis Google m'aiderait beaucoup, cela prend une minute : [lien]. Bonne journée !

Quand un avis est publié, ajoutez-le dans `src/content/avis.js` : la section « Avis » réapparaît alors automatiquement sur le site.

## 3. Inscrire l'entreprise dans les annuaires utiles

Le nom, l'adresse et le téléphone doivent être **strictement identiques partout** (c'est un signal de confiance pour Google). Inscriptions gratuites, par ordre d'utilité :

1. PagesJaunes (fiche gratuite)
2. Bing Places et Apple Business Connect (Plans sur iPhone)
3. Page Facebook professionnelle
4. Annuaire de la Chambre de Métiers et de l'Artisanat
5. Obat et travaux.com : vos concurrents y sont listés, la fiche de base est gratuite. Ne payez pas pour des « contacts ».

## 4. Déclarer le site à Google

1. Ouvrez Google Search Console et ajoutez le site.
2. Envoyez le plan du site : `https://www.aled08.fr/sitemap.xml`.
3. Après un mois, regardez l'onglet « Performances » : il indique sur quelles recherches le site apparaît.

## 5. Les recherches visées par le site

| Recherche | Page qui y répond |
|---|---|
| électricien Signy-l'Abbaye | `/electricien-signy-l-abbaye/` |
| électricien + commune (26 communes) | `/electricien-rethel/`, `/electricien-nouzonville/`… |
| dépannage électrique Ardennes | `/depannage-electrique-ardennes/` |
| tarif / prix dépannage électrique | `/tarifs/` et l'article de blog sur le prix |
| électricien soir, week-end, dimanche | `/electricien-soiree-ardennes/`, `/electricien-week-end-ardennes/` |
| disjoncteur qui saute, Linky qui disjoncte, plus d'eau chaude… | les 12 pages de pannes |
| remplacement tableau électrique | `/prestations/tableau-electrique/` et pages locales |

## 6. Faire vivre le site

- **Une photo réelle par mois** dans la page Réalisations, avec une phrase sur la panne et la commune (avec l'accord du client).
- **Un article de blog par trimestre**, tiré d'une vraie intervention : c'est ce que les annuaires ne pourront jamais copier.
- **Mettez à jour** `experienceYears` chaque année et les horaires dès qu'ils changent, sur le site **et** sur la fiche Google.

## À ne jamais faire

- Publier de faux avis ou des avis « d'exemple » non signalés.
- Acheter des liens ou des avis.
- Afficher des horaires ou des prix différents entre le site, la fiche Google et les annuaires.
