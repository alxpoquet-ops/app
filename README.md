# Publik

**Dépose tes photos ou ta vidéo, décris ce que tu veux publier : Publik s'occupe du reste.**

Publik choisit les meilleurs moments, monte une vidéo au bon format, ajoute une musique libre de droits, des effets, des sous-titres animés et les hashtags. Il te la montre pour validation, puis la publie sur **TikTok, Instagram, Facebook, YouTube et X**.

L'application s'ouvre dans un navigateur sur PC, téléphone et tablette, et s'installe comme une app (« Ajouter à l'écran d'accueil »).

---

## Ce que ça fait

| Étape | Ce qui se passe |
|---|---|
| **Analyse** | Lecture des photos et vidéos, remise à l'endroit des photos de téléphone. |
| **Découpage** | Les vidéos sont découpées en images clés. Les plus nettes et les plus variées sont gardées, les images floues ou noires sont écartées. |
| **Textes & hashtags** | Écriture de l'accroche, des sous-titres image par image, des légendes et des hashtags adaptés à chaque réseau (longueur, ton, nombre de hashtags). |
| **Musique** | Choix d'une musique selon l'ambiance (chill, énergique, inspirant, émotion, fun, lo-fi). Les changements d'image tombent sur le rythme. |
| **Montage** | Effet de caméra lent (Ken Burns), fond flou quand le cadrage ne colle pas, transitions, étalonnage selon l'ambiance, sous-titres mot à mot façon TikTok, message de fin. Formats 9:16 (TikTok, Reels, Shorts) et 1:1 (X), réglables. |
| **Ta validation** | Aperçu de la vidéo. Tu peux modifier les textes et les hashtags, changer la musique ou l'ambiance, réordonner ou retirer des images, puis **valider** ou **programmer** la publication. |
| **Envoi → Publié** | Publication en parallèle sur tous les réseaux choisis, avec un lien vers chaque publication. |

Tout s'affiche en direct à l'écran : on voit chaque étape avancer.

### Automatisations internes
- Une file d'attente pour le montage et une autre pour la publication : tu peux fermer la page pendant le travail.
- **Reprise automatique** des travaux interrompus si le serveur redémarre.
- **Publications programmées** à la date et l'heure de ton choix.
- **Nouvel essai automatique** après une erreur temporaire de publication (au bout de 2, 10 puis 30 minutes).
- **Renouvellement automatique** des connexions aux réseaux.
- **Ménage automatique** des fichiers, avec un délai réglable.
- **Musiques composées par l'app** au premier démarrage : 12 morceaux originaux, donc sans aucun droit à payer. Tu peux aussi ajouter tes propres morceaux.
- Notification dans le navigateur quand la vidéo est prête ou publiée.

### Deux niveaux d'intelligence
- **Mode automatique (gratuit)** : sélection des images par analyse de netteté, textes et hashtags tirés de ta description.
- **Mode IA (recommandé)** : avec une clé Claude (Anthropic), l'IA *regarde* tes images pour choisir les plus belles et écrit des textes sur mesure pour chaque réseau. Compte quelques centimes par vidéo.

---

## Démarrer

### Option A — Sur ton ordinateur (le plus rapide pour essayer)
1. Installe [Node.js](https://nodejs.org) (version 20 ou plus) et **ffmpeg** :
   - Windows : `winget install Gyan.FFmpeg`
   - Mac : `brew install ffmpeg`
   - Linux : `sudo apt install ffmpeg`
2. Double-clique sur `start.bat` (Windows) ou lance `./start.sh` (Mac/Linux).
3. Le navigateur s'ouvre sur `http://localhost:3000`. Choisis un mot de passe et c'est prêt.

> Pour l'utiliser depuis ton téléphone sur le même Wi-Fi, ouvre `http://ADRESSE-IP-DU-PC:3000`.

### Option B — En ligne, accessible partout (recommandé pour l'usage quotidien et le partage)
Sur un petit serveur (VPS à environ 5 €/mois chez Hetzner, OVH, Scaleway…) avec Docker :

```bash
git clone <ce-dépôt> publik && cd publik
cp .env.example .env        # renseigne DOMAIN=publik.mondomaine.fr et PUBLIC_URL=https://publik.mondomaine.fr
docker compose --profile https up -d
```

Fais pointer ton nom de domaine vers le serveur. Le certificat HTTPS est obtenu automatiquement.

Autre possibilité : le fichier `render.yaml` permet un déploiement en un clic sur [Render](https://render.com) (offre payante, avec disque). Le `Dockerfile` fonctionne aussi sur Railway, Fly.io, etc.

### Partager l'app
Donne le lien et le mot de passe à ton équipe. Dans **Réglages → Partager & installer**, le bouton « Partager » envoie le lien. Sur téléphone, « Ajouter à l'écran d'accueil » installe Publik comme une vraie app.

---

## Relier tes réseaux : ce dont tu as besoin

Le guide détaillé, menu par menu, est intégré à l'app : **Comptes → Guide pas à pas** (`/guide.html`).

### Mode simple (recommandé) — 5 minutes
1. Un compte sur **[upload-post.com](https://www.upload-post.com)**. Un seul compte suffit pour connecter TikTok, Instagram, Facebook, YouTube et X. Une offre gratuite permet de commencer, puis l'abonnement dépend du volume.
2. Dans Publik : **Comptes → Simple**, colle la clé API et le nom du profil.

### Mode direct (gratuit, plus technique)
Une « application développeur » à créer une fois sur chaque réseau. L'écran **Comptes** affiche l'adresse de redirection à copier.

| Réseau | Où s'inscrire | Bon à savoir |
|---|---|---|
| YouTube | [Google Cloud Console](https://console.cloud.google.com) → YouTube Data API v3 | Environ 6 vidéos par jour avec le quota gratuit |
| Facebook + Instagram | [Meta for Developers](https://developers.facebook.com/apps/) | Il faut une Page Facebook et un compte Instagram **professionnel** relié à cette Page |
| TikTok | [TikTok for Developers](https://developers.tiktok.com) → Content Posting API | Publication en **privé** tant que TikTok n'a pas audité ton app |
| X | [X Developer Portal](https://developer.x.com) → OAuth 2.0 | L'offre gratuite permet de publier |

Le mode direct demande une adresse publique en **https**, donc l'option B.

### Intelligence artificielle (facultatif)
Une clé sur **[console.anthropic.com](https://console.anthropic.com)**, à coller dans **Réglages → Intelligence artificielle**.

---

## Coûts

| Élément | Coût |
|---|---|
| Publik | Gratuit (open source) |
| Musiques | Gratuites (composées par l'app) |
| Montage | Gratuit (fait sur ta machine ou ton serveur) |
| IA (facultatif) | Quelques centimes par vidéo |
| Hébergement en ligne (facultatif) | Environ 5 €/mois pour un VPS |
| Upload-Post (mode simple) | Offre gratuite pour démarrer, puis abonnement |
| Mode direct | Gratuit |

---

## Pour les développeurs

```
server/
  index.js            API HTTP, direct (SSE), authentification
  config.js           réglages persistants (data/settings.json), secrets masqués côté interface
  store.js            base JSON (data/db.json)
  queue.js            files d'attente montage / publication
  automations.js      reprise, programmation, nouveaux essais, jetons, ménage
  pipeline/
    analyze.js        probe, orientation EXIF, extraction et score des images clés
    ai.js             planification par Claude (vision + sortie JSON structurée)
    text.js           textes, hashtags et ambiance en mode automatique
    synth.js          synthétiseur : compose les musiques libres de droits
    music.js          bibliothèque musicale
    subtitles.js      sous-titres animés (ASS / libass)
    render.js         montage ffmpeg (zoompan, xfade, subtitles, musique)
    index.js          orchestration des étapes
  publishers/         Upload-Post, YouTube, Meta (Facebook/Instagram), TikTok, X
public/               interface (PWA sans étape de build)
assets/fonts/         Montserrat (sous-titres vidéo, licence OFL)
```

- `npm start` lance le serveur, `npm run dev` le relance à chaque modification, `npm test` lance le test de bout en bout (montage réel avec ffmpeg).
- Variables d'environnement : voir `.env.example`. Toutes ont un équivalent dans l'écran Réglages.
- Données : `DATA_DIR` (par défaut `./data`, `/data` dans Docker).

### Limites connues
- Les sous-titres viennent de ta description, pas de la parole de la vidéo (pas de transcription audio pour l'instant).
- Le montage est un diaporama dynamique d'images clés, comme prévu pour cette première version. Les extraits vidéo animés pourront venir ensuite.
- Les intégrations directes suivent la documentation officielle de chaque réseau, mais n'ont pas pu être testées avec de vrais comptes. Les API évoluent souvent : en cas d'erreur, le message exact du réseau s'affiche dans l'app.
