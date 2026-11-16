# Prix du marché et assistants IA pour WordPress (novembre 2026)

Recherche faite le 15 novembre 2026 pour fixer l'offre unique d'Alex & Co :
500 € le site, 10 € par mois, des options à la création et des extras au mois.
Les chiffres viennent de pages publiques. Ce sont des ordres de grandeur, à relire une fois par an.
Les repères utilisés par le site sont dans `src/config.js` (`marche`).

## 1. Ce que coûte un site ailleurs

| Quoi | Indépendant | Agence |
|---|---|---|
| Site vitrine d'environ 5 pages | 1 500 à 3 000 € le plus souvent (800 à 5 000 € selon l'expérience) | 3 000 à 8 000 €, parfois plus |
| Boutique en ligne simple | 2 000 à 6 000 € | 4 000 à 20 000 € |
| Entretien et hébergement, par mois | 60 à 200 € | 150 à 500 € |

Il existe aussi des offres à bas prix : 390 à 1 290 € le site, et 22 à 32 € par mois tout compris.

**Ce qu'on a le droit de dire.** « 4 à 5 fois moins cher qu'un site fait à la main » est vrai face à un
indépendant (500 € contre 1 500 à 3 000 €, soit 3 à 6 fois moins). Face à une agence, l'écart est plus grand.
Face aux offres à bas prix, nous sommes au même niveau : la page Tarifs le dit.

Ce que nous coûte un client par an : le nom de domaine (8 à 15 €) et sa part d'hébergement.
Les 120 € d'abonnement couvrent cela.

## 2. Les options vues ailleurs

| Option | Prix vus ailleurs | Chez Alex & Co |
|---|---|---|
| Langue en plus | 120 € par langue | 100 € (anglais) |
| Page en plus | 60 à 200 € la page | 100 € les cinq pages |
| Prise de rendez-vous | souvent un outil externe, 16 à 20 $ par mois | 100 €, une fois |
| Reprise d'un ancien site | 70 à 100 % du prix d'une création | 100 € |
| Boutique en ligne | 2 000 à 6 000 € | + 200 € |
| Référencement suivi | 300 à 800 € par mois | 10 € par mois |
| Adresse e-mail pro | 20 à 70 € par an, 60 € de mise en place | 3 € par mois |
| Modification en plus, faite à la main | 30 à 80 € de l'heure | 5 € la modification (Boost) |

## 3. Existe-t-il une extension avec un bot qui modifie le site de chaque client ?

**Non, pas pour notre besoin.** Aucune extension ne met, sans clé d'API, un bot dans notre espace client
(un seul endroit) qui modifie le site de chaque client. Les outils se rangent en quatre familles.

| Famille | Exemples | Pourquoi ça ne convient pas |
|---|---|---|
| Agent dans l'admin de chaque site | Angie (Elementor), Divi AI, Hostinger, Jetpack AI | Le client doit entrer dans l'admin WordPress de son site. Pas d'endroit central. |
| Connecteur MCP | AI Engine, Easy MCP AI, MCP Adapter officiel, MainWP, WPVibe | Pas de clé, mais la discussion se passe dans Claude ou ChatGPT, avec l'abonnement de chaque client. |
| Plateforme fermée | 10Web (marque blanche, 85 à 160 $ par mois), SiteGround AI Studio | Les sites doivent être chez eux, ou c'est leur interface. |
| Chatbot pour visiteurs | WPBot, Tidio, Chatbase, MxChat | Il répond aux visiteurs, il ne modifie pas le site. |

**Le plus simple reste notre montage : Lia dans l'espace client, avec une seule clé Claude.**
C'est la seule solution qui tient en un seul endroit, à nos couleurs, pour tous nos outils.
WordPress 7.0 a bien un « client IA », mais il demande une clé sur chaque site.

## 4. Le prix d'une action, comparé

Action type : un texte de 6 000 jetons lu, 1 500 jetons écrits. 1 € vaut environ 1,11 $.

| Solution | Coût de l'action |
|---|---|
| Claude Opus 5.5 en direct (notre choix) | environ 5 centimes |
| Claude Sonnet 5.5 en direct | environ 2,5 centimes |
| Claude Haiku 5.5 en direct | environ 0,1 centime |
| AI Engine avec sa propre clé | pareil que Claude en direct, plus 59 $ par an |
| Elementor One (crédits) | 0,1 à 3 centimes, dans l'admin du site seulement |
| Divi AI Agent | 5 à 50 centimes la tâche |
| SiteGround AI Studio | environ 70 centimes (10 $ les 100 000 jetons, comptage non vérifié) |
| Chatbase (visiteurs) | 3 à 4 centimes le crédit |
| Tidio Lyro (visiteurs) | 60 centimes la conversation |

**Nos Jetons Lia.** 1 jeton = 1 centime. Un outil est vendu 4 fois ce qu'il nous coûte chez Claude,
une modification du site 2 fois. Un outil coûte donc 3 à 16 jetons au client (3 à 16 centimes),
une modification par Lia 30 jetons et plus. C'est dans les prix du marché, et souvent en dessous
(Divi : jusqu'à 50 centimes la tâche ; Tidio : 60 centimes la conversation).

Avec les 100 jetons de l'abonnement, un client fait par mois trois modifications par Lia,
ou huit textes corrigés. Au-delà : la recharge, achetée à l'utilisation (1 € les 100 jetons). L'option Lia + a été supprimée le 16 novembre 2026.

## 5. Adresses lues

- Prix des sites : plateya.fr (guide des prix 2026), fenxi.fr, kacz-web.fr, kolonell.com, lafabriquedunet.fr (extraits), wisestart.fr, digitiz.fr
- Hébergement et domaine : o2switch.fr, ovhcloud.com
- Assistants IA : meowapps.com (AI Engine), elementor.com (Angie, tarifs), jetpack.com, make.wordpress.org (client IA de WordPress 7.0, Abilities API, MCP Adapter), hostinger.com, 10web.io, elegantthemes.com (Divi AI), mainwp.com, wp-umbrella.com, instawp.com, wpbeginner.com (WPVibe), siteground.com, wordpress.org/plugins
- Chatbots : tidio.com, chatbase.co, eesel.ai (WPBot)
- Change : banque-france.fr (11 novembre 2026)
