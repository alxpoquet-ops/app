# L'application Les Minis Monstres (Android)

L'application ouvre `https://www.les-minis-monstres.fr/appli/` dans une vraie application Android (Capacitor). Tout le contenu vient du site : pour changer un écran, on change le site (`src/wordpress/aled08-espace/includes/appli.php` et `appli.js`), pas l'application. On ne refabrique l'application que pour changer son nom, son icône ou ses autorisations.

Ce que l'application ajoute au site : son icône sur le téléphone, l'appareil photo, et la dictée (on parle, le texte s'écrit).

## L'essayer sur un téléphone Android

1. Sur GitHub, onglet **Actions**, « Application Android », dernière ligne verte.
2. En bas, **Artifacts** : télécharger `appli-essai`, ouvrir le zip, envoyer `app-debug.apk` sur le téléphone.
3. Ouvrir le fichier sur le téléphone et accepter l'installation (« source inconnue » : c'est normal pour un essai).

Sans attendre, la même application s'installe depuis le site : ouvrir `les-minis-monstres.fr/appli/` dans Chrome sur le téléphone, menu, « Ajouter à l'écran d'accueil ».

## La publier sur Google Play

1. Créer un compte Google Play Console (25 $, une fois). Un compte personnel doit d'abord faire un test fermé avec 12 testeurs pendant 14 jours.
2. Créer la clé de signature, une seule fois, sur un ordinateur (à garder précieusement, avec son mot de passe) :
   `keytool -genkeypair -v -keystore lmm.jks -alias lmm -keyalg RSA -keysize 2048 -validity 10000`
3. Dans GitHub, Settings › Secrets and variables › Actions, ajouter quatre secrets : `LMM_KEYSTORE_B64` (le résultat de `base64 -w0 lmm.jks`), `LMM_KEYSTORE_PASSWORD`, `LMM_KEY_ALIAS` (`lmm`), `LMM_KEY_PASSWORD`.
4. Relancer « Application Android » : l'artefact `appli-google-play` contient `app-release.aab`, à déposer dans la Play Console.
5. Pour que les liens `/appli/` rouvrent l'application : copier l'empreinte SHA-256 donnée par la Play Console (Intégrité de l'application) dans `https://www.les-minis-monstres.fr/.well-known/assetlinks.json`.

Google demande aussi : une fiche (description, captures), l'adresse de la politique de confidentialité (`/politique-de-confidentialite/`), et de dire à quoi servent l'appareil photo et le micro (la photo à publier, la dictée de la description).

## Fabriquer sur un ordinateur (facultatif)

Node 22, Java 21 et Android Studio. Dans `appli/` : `npm ci`, puis `npm run apk`.
