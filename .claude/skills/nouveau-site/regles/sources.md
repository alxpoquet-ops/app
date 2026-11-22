# D'où viennent les règles tirées du web

Recherche faite le **22 novembre 2026**. À relire une fois par an, ou quand Google, la CNIL ou la loi changent. Les règles propres à l'agence (rien d'inventé, V1 livrée, clair et sombre…) viennent d'Alex, pas du web.

## Ce qui est solide

| Règle | Fichier | Source |
|---|---|---|
| Seuils de vitesse : LCP 2,5 s, INP 200 ms, CLS 0,1, les mêmes sur téléphone et ordinateur | `vitesse-accessibilite.md` | [web.dev, les seuils des Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=fr) |
| Image du haut : `fetchpriority="high"`, jamais `loading="lazy"`, visible dans le HTML | `vitesse-accessibilite.md` | [Chrome, optimiser la priorité des images](https://developer.chrome.com/docs/modern-web-guidance/guides/performance/optimize-image-priority), [web.dev, Fetch Priority](https://web.dev/articles/fetch-priority) |
| Contraste 4,5 pour 1, cibles de 24 × 24 px, focus visible | `vitesse-accessibilite.md` | [W3C, les nouveautés de WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), [WCAG 2.2 en français](https://www.w3.org/Translations/WCAG22-fr-20250317/) |
| Mentions légales obligatoires pour tout site professionnel, hébergeur compris | `legal.md` | [Service public, mentions obligatoires](https://entreprendre.service-public.gouv.fr/vosdroits/F37351?lang=fr), [Bercy, mentions sur votre site](https://www.economie.gouv.fr/entreprises/site-internet-mentions-obligatoires) |
| Mesure d'audience sans consentement : conditions strictes, pas de réutilisation des données | `legal.md` | [CNIL, solutions pour la mesure d'audience](https://www.cnil.fr/fr/solutions-pour-la-mesure-daudience) |
| Fiche Google en premier pour le référencement local, nom, adresse et téléphone identiques partout, données `LocalBusiness` avec un type précis | `google.md` | [BrightLocal, checklist de la fiche Google](https://www.brightlocal.com/learn/google-business-profile/checklist/), [Search Engine Journal, audit de référencement local](https://www.searchenginejournal.com/local-seo-audit-checklist), [Ahrefs, SEO local 2026](https://ahrefs.com/blog/fr/astuces-seo-local/) |
| Assistants IA : pas de recette à part, les fondamentaux, les avis et la cohérence des informations | `google.md` | [France Num, optimisation pour les moteurs génératifs](https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/referencement/optimisation-pour-les-moteurs), [France Num, référencement local et IA](https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/referencement/referencement-local-comment-rendre), [Blog du Modérateur, GEO local](https://www.blogdumoderateur.com/geo-local-3-leviers-concrets-apparaitre-reponses-ia/), [Ahrefs, GEO](https://ahrefs.com/blog/fr/geo-generative-engine-optimisation) |

## Ce qui est un bon usage, sans preuve chiffrée

Ces règles reviennent dans beaucoup de guides, mais surtout chez des vendeurs de sites ou d'outils. Aucune étude indépendante ne mesure l'effet de chacune. On les applique parce qu'elles sont de bon sens, pas parce qu'un chiffre le prouve.

| Règle | Fichier | Source |
|---|---|---|
| Comprendre l'offre en quelques secondes, titre concret plutôt que « Bienvenue », preuves et bouton visibles | `conversion.md` | [La Fabrique du Net, pages d'accueil](https://www.lafabriquedunet.fr/creation-site-vitrine/articles/exemples-design-page-accueil/), [La Poste, une page d'accueil qui convertit](https://www.laposte.fr/professionnel/mag/construire-page-accueil-qui-convertit) |
| Bouton d'action répété en haut, au milieu et en bas, avec une phrase qui rassure | `conversion.md` | [CCI Paris Île-de-France, 7 améliorations](https://www.entreprises.cci-paris-idf.fr/fiches-pratiques/uxui-7-ameliorations-qui-font-bouger-les-conversions) |
| Page « service + ville » : titre, ce qui est compris, étapes, avis, formulaire court, téléphone cliquable | `google.md`, `conversion.md` | [Ahrefs, pages locales](https://ahrefs.com/blog/location-pages), [Contractor+, site d'artisan](https://contractorplus.app/fr/blog/what-a-contractor-website-should-actually-do-15-must-have-pages) |

## Ce qui reste à confirmer

- **Accessibilité obligatoire pour le commerce en ligne** (directive européenne 2019/882, depuis le 28 juin 2025) et dispense des très petites entreprises : lu dans une seule source secondaire. À vérifier sur une source officielle avant de l'affirmer à un client. [donneespersonnelles.fr](https://www.donneespersonnelles.fr/accessibilite-numerique-entreprises)
- **Réponses IA de Google en France** : les sources se contredisent sur leur déploiement.
- **Prix des concurrents** (`concurrents.md`) : repères tirés de comparatifs, pas des grilles officielles. [tool-advisor.fr](https://tool-advisor.fr/logiciel-creation-site-web/), [sk-web.fr](https://sk-web.fr/article/cout-site-web-artisan-2026), [codeur.com](https://www.codeur.com/blog/createurs-sites-web-artisans/)
- **Obligations de la vente en ligne** (rétractation, médiateur, conditions de vente) : rappelées d'après des guides, à confirmer sur [Service public, vente en ligne](https://entreprendre.service-public.gouv.fr/vosdroits/F23455) et auprès de la DGCCRF.
