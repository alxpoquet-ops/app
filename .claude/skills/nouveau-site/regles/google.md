# Être trouvé sur Google (et par les assistants IA)

Trois niveaux : ce que tout site reçoit, les pages de visibilité Google achetées en plus, et ce que le client doit faire de son côté. Sources dans `sources.md`.

## 1. Sur chaque site, même le Site Essentiel

**Le titre et la description pour Google**

- Le titre de la page (balise `title`) : l'activité, la ville, le nom. Environ 60 caractères. Exemple : « Bougies artisanales à Rethel | Nom de l'atelier ».
- La description : une ou deux phrases, environ 150 caractères, avec ce que le visiteur y gagne et une invitation à agir.
- Un seul grand titre (`h1`) par page, qui dit l'activité et la ville. Les intertitres suivent dans l'ordre (`h2`, puis `h3`).

**Le nom, l'adresse et le téléphone, identiques partout**

Le nom de l'entreprise, son adresse et son téléphone s'écrivent exactement de la même façon dans le pied de page, la partie contact, les mentions légales et les données de l'entreprise. Si le client a une fiche Google, on reprend son écriture à la lettre. Google et les assistants IA se méfient d'une entreprise dont les informations varient d'un endroit à l'autre.

**Les données de l'entreprise (données structurées)**

Sur l'accueil, un bloc JSON-LD `LocalBusiness`, avec le type le plus précis possible pour le métier (`Florist`, `Bakery`, `HairSalon`, `Electrician`, `Store`…), et seulement ce que le client a donné :

- `name`, `url`, `image`, `description` ;
- `telephone`, `email`, `address` (ville et code postal au moins) ;
- `areaServed` : sa zone ;
- `openingHoursSpecification` : seulement s'il a donné ses horaires ;
- `priceRange` : seulement s'il a donné ses prix ;
- `sameAs` : ses réseaux, sa fiche Google, s'il les a donnés.

Jamais d'avis ni de note (`aggregateRating`, `review`) qu'il n'a pas fournis. Une donnée fausse ou différente de sa fiche Google fait plus de mal que pas de donnée du tout : dans le doute, on ne met pas le champ.

**Le reste**

- Chaque photo a un texte de remplacement (`alt`) qui la décrit simplement.
- Les questions fréquentes sont du vrai texte dans la page (pas une image), une question par intertitre, la réponse dès la première phrase.
- Des adresses de page courtes et lisibles (`/contact/`, `/bougies-parfumees/`).
- Le titre, la description et une image pour le partage sur les réseaux (Open Graph).
- Le plan du site est à jour, et le site n'est pas fermé aux moteurs (Réglages › Lecture : la case « ne pas indexer » est décochée).

## 2. Les pages de visibilité Google (10 € la page)

Seulement quand le client en a acheté (ou pour un ancien Site Visibilité). Autant de pages que payées. Chaque page est une porte d'entrée de plus : elle répond à une recherche précise.

**Les quatre sortes de pages**

| Sorte | Sujet | D'où vient le contenu |
|---|---|---|
| Service ou produit | Un service ou un produit phare, avec son mot clé | Le questionnaire (produits, réponses « recherches ») |
| Locale | Un service dans une ville ou un secteur | Uniquement les villes données par le client (réponse « villes »), jamais une autre |
| Questions fréquentes | Toutes ses questions, sur une page à part | Le questionnaire |
| Conseils | Un sujet utile sur son métier | Savoir général et exact, sans rien affirmer sur le client |

Ordre de choix quand le sujet est libre : d'abord les services et produits, puis les villes, puis les conseils. On évite les sujets déjà traités sur le site.

**Comment est faite une page**

1. Un titre (`h1`) qui reprend la recherche visée : le service, et la ville pour une page locale.
2. Une courte introduction qui parle de la situation du visiteur.
3. 3 à 5 parties avec intertitres : ce qui est proposé et ce qui est compris, les bénéfices, comment ça se passe, le prix si le client l'a donné.
4. Deux à quatre questions fréquentes propres au sujet.
5. Le bouton d'action du site (contact ou boutique).
6. Des liens vers 2 ou 3 autres pages du site, et un lien vers cette page depuis une page existante qui s'y prête.
7. Le titre et la description pour Google, et l'ajout au plan du site.

Entre 400 et 900 mots utiles. Le même soin visuel que l'accueil, en clair et en sombre, lisible sur téléphone.

**Les pièges à éviter**

- **Pas de pages jumelles** : une page locale n'est pas la copie d'une autre avec le nom de la ville changé. Chaque page a son angle et ses propres phrases.
- **Pas de fausse proximité** : on n'invente ni adresse, ni « à deux pas de… », ni clients dans la ville. On dit seulement que le client y travaille ou y livre, s'il l'a dit.
- **Pages de conseils** : rien sur le client qu'il n'ait donné (ni prix, ni délai, ni promesse, ni méthode de fabrication). Elles sont listées dans le résumé de livraison pour qu'il les relise.

## 3. Les assistants IA (ChatGPT, Gemini, les réponses IA de Google)

Il n'y a pas de recette à part : ce qui marche pour Google marche pour eux. Ce qui compte le plus :

- **Des réponses directes** : une question en intertitre, la réponse dans la phrase qui suit. C'est ce que les assistants reprennent.
- **Des faits clairs et constants** : qui, quoi, où, pour qui, à quel prix. Les mêmes mots partout sur le site.
- **Une présentation nette de l'entreprise** : une phrase qui dit exactement ce qu'elle fait et où, reprise à l'identique dans le pied de page et les données de l'entreprise.
- **Les avis et la cohérence des annuaires** : les assistants recommandent surtout les entreprises bien notées, dont les informations sont les mêmes partout. Cela dépend du client (voir ci-dessous).

## 4. Ce que le client fait de son côté

On ne peut pas le faire à sa place : ce sont ses comptes. Le résumé de livraison le lui dit en clair, dans le paragraphe « À ajouter quand vous pourrez » :

- **Créer ou compléter sa fiche Google** (Google Business Profile) : c'est ce qui pèse le plus pour être trouvé près de chez soi. La bonne catégorie principale, les horaires, des photos, et l'adresse de son nouveau site.
- **Écrire son nom, son adresse et son téléphone de la même façon partout** : fiche Google, réseaux sociaux, annuaires.
- **Demander des avis à ses clients, et répondre à chacun.**
- S'il a le temps : une fiche sur Bing Places et sur Apple Plans.

Formule type à adapter : « Pour être mieux trouvé sur Google, de votre côté : créez ou complétez votre fiche Google (catégorie, horaires, photos, adresse de votre site), et demandez un avis à vos prochains clients. »
