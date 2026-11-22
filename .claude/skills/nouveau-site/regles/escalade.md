# Les cas pour Alex

Décision d'Alex (22 novembre 2026) : LMM tourne seul. Les agents font tout ce qui est prévu par les règles, et **seuls les cas compliqués lui remontent**. Un e-mail à Alex est une exception : avant de l'envoyer, demande-toi si une règle te permet de décider seul.

## Ce qui remonte toujours à Alex

1. **L'argent** : un remboursement, un geste commercial, un prix à changer, un devis, un impayé, un litige de paiement.
2. **Un client mécontent** : une réclamation, un ton de reproche, une menace (mauvais avis, avocat).
3. **Les accès** : comptes, mots de passe, nom de domaine, hébergement, adresses e-mail, moyens de paiement.
4. **Le juridique** : rédiger des conditions de vente ou des mentions pour le client, un contenu à risque (santé, promesse de résultat, produit réglementé, marque d'un autre, photo d'une personne sans son accord).
5. **Ce qui sort du forfait** : une page en plus, une boutique à ajouter, une traduction, un logo, de la publicité, les réseaux sociaux, de l'impression. Ce sont des extras ou des devis.
6. **Une refonte** : changer toute l'organisation ou tout le style d'un site. Une modification change un endroit, pas le site entier.
7. **Une demande impossible à suivre** : incompréhensible malgré les précisions, ou qui demande d'écrire quelque chose de faux ou de trompeur (un faux avis, un faux label, une fausse promotion).
8. **Un blocage qui dure** : un site injoignable ou une erreur qui se répète sur deux passages de suite.
9. **Trois refus du contrôle** sur le même travail (cela part tout seul chez Alex).
10. **Ce qu'aucune règle ne couvre** et qui engagerait l'agence ou le client.

## Ce qui ne remonte pas

Créer un site, écrire une page Google, changer un texte, une photo, un prix, un horaire, une couleur, ajouter ou retirer une ligne, corriger une faute, réordonner des parties, remplir une partie « bientôt » avec ce que le client vient d'envoyer. Un doute léger : on choisit l'option la plus prudente (on n'invente rien, on retire plutôt que d'ajouter) et on le dit dans sa note.

## Comment remonter un cas

Avec `faire: "pour_alex"` et un `texte` court, en trois temps :

1. ce que le client demande, ou ce qui se passe ;
2. pourquoi c'est pour Alex (le numéro de la liste ci-dessus) ;
3. ce que tu proposes : une ou deux options, pour qu'il n'ait qu'à choisir.

| Travail | Appel |
|---|---|
| Un site | `/aled08/v1/atelier/chantier` avec `{ "commande": ID, "faire": "pour_alex", "texte": "…" }` |
| Une page Google | `/aled08/v1/atelier/page-google` avec `{ "demande": N, "faire": "pour_alex", "texte": "…" }` |
| Une modification | `/aled08/v1/atelier/demande` avec `{ "demande": N, "faire": "pour_alex", "texte": "…" }` |

Alex reçoit un e-mail « À voir par vous ». Le travail est en attente : plus aucun agent n'y touche. Pour une modification, le client voit que sa demande a besoin du regard d'Alex.

## Quand Alex a tranché

Il le dit dans une conversation avec Claude. Cette conversation relance le travail avec `faire: "reprendre"`, `accord_alex: true` et sa consigne dans `texte`. Le travail repart chez le constructeur, puis repasse au contrôle. Un agent ne met jamais `accord_alex` lui-même.
