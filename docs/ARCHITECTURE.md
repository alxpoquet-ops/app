# BOSS IA — Architecture

> L'IA réfléchit. L'humain exécute. L'humain garde toujours le dernier mot.

## 1. Choix structurants

| Décision | Choix | Pourquoi |
|---|---|---|
| Application | **PWA** React 19 + Vite (installable PC / téléphone / tablette) | Une seule base de code, installable, hors-ligne, pas de store. |
| Données sur l'appareil | **IndexedDB (Dexie)**, local-first | L'atelier n'a pas toujours de réseau : tout marche hors-ligne, instantanément. |
| Synchronisation | Serveur Node (Hono) + **SQLite**, journal versionné, *last-write-wins* par enregistrement | Mono-entreprise, quelques appareils : simple, robuste, sans conflit visible. |
| Cerveau | **`@boss/core`** : TypeScript pur, déterministe, testé | Le plan du jour doit être instantané, explicable, gratuit et disponible hors-ligne. |
| IA générative | **Agents Claude** côté serveur (`claude-opus-5-5`) | Langage, recherche web, vision : ce que le cerveau déterministe ne sait pas faire. |
| Sécurité des actions | **File de validations** + point de sortie unique côté serveur | Aucune dépense, signature, publication ou envoi sans clic humain. |

```
┌──────────────── Appareil (PWA) ────────────────┐        ┌────────────── Serveur ──────────────┐
│ 5 gros boutons ─► écrans                        │        │ /api/sync      journal SQLite        │
│        │                                        │  sync  │ /api/ai/*      agents Claude         │
│        ▼                                        │◄──────►│   coach · éclaireur · acheteur       │
│ @boss/core (cerveau)   ◄── Dexie (IndexedDB) ──►│ outbox │   candidatures · média (vision)      │
│  planificateur · prévisions · achats ·          │        │ /api/actions/:id/execute             │
│  événements · récap · apprentissage             │        │   └─ refuse tout ce qui n'est pas    │
└─────────────────────────────────────────────────┘        │      "approuvé" par un humain        │
                                                           └──────────────────────────────────────┘
```

## 2. Arborescence

```
packages/core     Cerveau métier pur (aucune dépendance) + tests vitest
  types.ts        Modèle de données (produits, fournitures, commandes, événements, bilans, ventes, temps, validations, mémoire)
  planner.ts      « À FAIRE » : besoins → jobs scorés → faisabilité matière → remplissage du temps → ordonnancement en série
  forecast.ts     Saisonnalité apprise, ventes de fond, attente par événement (historique pondéré), demande par produit
  purchasing.ts   « À ACHETER » : besoins matière via nomenclatures, arrondi au conditionnement, urgence
  events.ts       Classement 🔥 / 👍 / 💤 expliqué, filtres du profil (distance, budget, dispo, plafond mensuel)
  timeStats.ts    Temps moyen réel (seule statistique de temps exposée)
  learn.ts        Mémoire : rythme de travail, énergie productive, produits populaires, événements rentables
  recap.ts        Les 8 informations du RÉCAP
  mutations.ts    Effets métier : fin de bloc (stock, commande, matière, temps), validation de stock (ventes)
apps/web          PWA (écrans, Dexie, synchro, extraction d'images-clés vidéo dans le navigateur)
apps/server       Synchro SQLite, agents IA, garde-fou d'exécution, service des fichiers de la PWA
```

## 3. Le cerveau de « À FAIRE »

Entrées : temps disponible, énergie, pauses oui/non, plus l'instantané complet de l'entreprise.

1. **Besoins** — commandes clients ouvertes ; événements inscrits dans les 45 j (unités attendues apprises des éditions passées) ; ventes de fond prévues à 30 j (taux × saisonnalité) ; stocks minimum.
2. **Jobs scorés** — commandes : urgence `1/(jours+1)` × priorité ; stock : urgence × valeur par minute (prix / temps moyen réel) × pression de l'objectif mensuel (retard sur le rythme attendu).
3. **Faisabilité** — limite par la matière disponible ; les manques deviennent des alertes « À ACHETER ».
4. **Remplissage** — budget = temps − pauses conseillées (5 min / 30 min, 15 min / 2 h) − préparation/rangement ; efficacité ajustée à l'énergie ; séries trop courtes évitées.
5. **Ordonnancement**
   - préparation groupée (une checklist fusionnée : matières × quantités + outils) ;
   - **mode série** : un bloc par étape lourde (10 pétales → 10 tiges → assemblage) ;
   - étapes légères (**contrôle, photo, emballage**) regroupées pour tous les produits en fin de session ;
   - énergie : *motivé* → le plus technique d'abord ; *fatigué* → échauffement facile d'abord ;
   - tâches de contexte : emballer une commande prête, préparer le stand J-4, relire une candidature avant la date limite ;
   - pauses insérées comme **recommandations** (toujours « Pas besoin, je continue »).
6. **Explication** — un titre (« Priorité : la commande de Mme Dupont ») et 2-5 raisons courtes. Bouton optionnel « Explique-moi avec tes mots » (agent coach).

Pendant la production : objectif, `3 / 10`, barre de progression, **temps écoulé (jamais de compte à rebours)**, gros bouton **TERMINÉ** (+1 par clic), passage automatique à l'étape suivante. La session est persistée : on peut fermer l'app et reprendre.

À la fin d'un bloc : temps historisé (pour le temps moyen), stock ou commande crédité, composants consommés.

## 4. Apprentissage & mémoire

- Tout est journalisé : `timeLogs` (chaque bloc), `sales`, `eventResults` (bilan d'événement : CA, coût, produits vendus, heures, distance, commentaire), `observations` (chaque décision et action), `approvals`.
- **Temps moyen** : moyenne pondérée (sessions récentes un peu plus lourdes), mêlée à l'estimation initiale tant qu'il y a moins de 3 mesures. Min / max / record / dernier temps : jamais affichés.
- **Événements** : clé de série stable (`slugify` sans l'année) → « Marché de Rethel 520 / 610 / 580 € » ⇒ attente ≈ 585 €, tendance, mix produits ⇒ besoins de production et d'achats.
- **Saisonnalité** : a priori métiers d'art (pic nov.-déc.) mélangé à l'observé (confiance pleine à 24 mois).
- Une baisse de stock produit en STOCK est proposée comme **vente** : la mémoire commerciale se construit sans saisie.

## 5. Agents IA (serveur, Claude API)

| Agent | Déclencheur | Outils | Sortie |
|---|---|---|---|
| Coach | « Explique-moi » | — | titre + raisons (ne modifie jamais le plan) |
| Éclaireur | « Chercher des événements » | recherche web | événements structurés → classés par le cerveau |
| Acheteur | « Mieux ailleurs ? » | recherche web | offres comparées + alternatives |
| Candidatures | « Préparer la candidature » | vision (photos) | lettre, présentation, dossier, choix des photos → **validation** |
| Média | photo / vidéo | vision sur images-clés extraites dans le navigateur | moments clés, idées reels/shorts/posts → **validation** |

Détails : sorties structurées validées par Zod, `effort` réglé par agent, `fallbacks: "default"` activé (repli serveur en cas de refus de sécurité), gestion de `pause_turn` pour la recherche web, contenu web traité comme donnée et non comme instruction, consommation journalisée (`ai_log`). Les agents **n'ont aucun outil capable d'agir** : ils proposent.

## 6. Garanties « l'humain garde le contrôle »

- Achat : le bouton « Valider l'achat » crée la validation ; le serveur ouvre seulement la page fournisseur. **Aucun paiement automatique.**
- Candidature / publication : brouillon en statut `en_attente` → l'utilisateur relit → « JE VALIDE » → le serveur vérifie le statut `approuve` avant toute exécution (`/api/actions/:id/execute` renvoie 403 sinon).
- Signature : type `signature` prévu dans la file, aucun connecteur ne signe.
- Prix de vente : saisi par l'utilisateur ; aucun module ne calcule de prix conseillé.

## 7. Synchronisation

Écriture locale → `outbox` → `POST /api/sync {since, changes}` (déclenché 1,5 s après une écriture, au retour du réseau, au réveil de l'app, toutes les 60 s). Le serveur accepte un enregistrement s'il est plus récent, lui attribue un `seq`, et renvoie tout ce qui a changé depuis le curseur de l'appareil. Suppressions douces propagées. Sauvegarde / restauration JSON dans Réglages.

## 8. Exploitation

```
npm install
npm test                       # tests du cerveau
npm run build                  # PWA
BOSS_TOKEN=… ANTHROPIC_API_KEY=… npm start   # serveur + PWA sur :8787
```

Déploiement conseillé : un petit VPS ou un NAS avec HTTPS (Caddy) ; la PWA s'installe depuis le navigateur sur chaque appareil.

## 9. Feuille de route

1. Connecteurs OAuth (Gmail brouillons, Google Agenda pour les événements inscrits, Drive pour les photos, Etsy pour importer les ventes, Instagram/TikTok en publication assistée), toujours derrière la file de validations.
2. Recherche d'événements planifiée (hebdomadaire) côté serveur, avec notification.
3. Suivi des encours de série entre deux sessions (pétales faits hier, assemblage aujourd'hui).
4. Multi-utilisateurs (apprenti / associé) avec rôles.
5. Chiffrement des données au repos sur le serveur.
