<?php
/**
 * Les Minis Monstres Espace client : le « kit de publication » de Publier partout (Pépite, 24 novembre 2026).
 *
 * Une photo et quelques mots donnent, en une seule écriture de Pépite (comptée une fois dans l'usage du mois) :
 *  - un texte par réseau, avec ses hashtags (vérifiés et nettoyés ici : longueurs, « #mot », doublons) ;
 *  - les bons formats de la photo et une courte vidéo verticale, calculés dans le navigateur (kit-video.js) ;
 *  - un bouton par réseau (kit-publication.js) : lien prérempli quand le réseau en offre un (X, Threads, Bluesky,
 *    LinkedIn, WhatsApp, Pinterest), sinon « publication assistée » (Instagram, Facebook, TikTok, YouTube, Fiche Google) :
 *    le bon fichier prêt, la légende copiée, l'appli ouverte. Aucun mot de passe de réseau, aucune API non officielle.
 *    Un réseau relié (reseaux.php) reste publié directement par Pépite.
 *  - un lien personnel vers une page simple pour le téléphone, ouvrable sans se connecter : /mon-espace/?kit=<jeton>.
 *    Jeton aléatoire de 43 caractères ; seule son empreinte sert à retrouver le kit (option aled08_kit_<empreinte>),
 *    comparée en temps constant. Le kit et sa photo s'effacent au bout de 30 jours (ou quand le client le supprime).
 *    30 kits gardés au plus par client. Un rappel par e-mail peut être programmé (« C'est l'heure de publier »).
 * Chargé par includes/atelier-outils.php.
 */
defined('ABSPATH') || exit;

const ALED08E_KIT_JOURS = 30;
const ALED08E_KIT_MAX = 30;

/* =========================================================================
 *  Les réseaux du kit : nom, façon de publier, longueurs, hashtags, liens
 *  mode : lien (vrai lien prérempli), assiste (fichier prêt + légende copiée + appli ouverte), direct (seulement par Pépite)
 *  max : longueur du texte entier (hashtags compris) ; tags : [conseillé au moins, au plus] ; titre : longueur du titre
 *  fichier : le format envoyé avec la publication (45 = 1080×1350, 23 = 1000×1500, video = 1080×1920 MP4)
 *  lien : {texte}, {url} (site du client) et {media} (photo publique) remplacés dans le navigateur
 * ========================================================================= */
function aled08e_kit_defs() {
    return [
        'instagram' => ['nom' => 'Instagram', 'mode' => 'assiste', 'max' => 2200, 'tags' => [5, 10], 'fichier' => '45', 'autres' => ['video' => 'En Reel (vidéo)', '916' => 'En story'], 'ouvrir' => 'https://www.instagram.com/', 'aide' => 'Dans Instagram (nouvel onglet) : « Créer », choisissez la photo, puis collez la légende.'],
        'facebook' => ['nom' => 'Facebook', 'mode' => 'assiste', 'max' => 5000, 'tags' => [1, 3], 'fichier' => '45', 'autres' => ['video' => 'En vidéo'], 'ouvrir' => 'https://www.facebook.com/', 'aide' => 'Dans Facebook (nouvel onglet) : « Photo/vidéo », choisissez la photo, puis collez le texte.'],
        'tiktok' => ['nom' => 'TikTok', 'mode' => 'assiste', 'max' => 2200, 'tags' => [3, 5], 'fichier' => 'video', 'ouvrir' => 'https://www.tiktok.com/upload', 'aide' => 'Dans TikTok (nouvel onglet) : choisissez la vidéo, puis collez la légende. Ajoutez une musique si vous voulez.'],
        'youtube' => ['nom' => 'YouTube', 'long' => 'YouTube Shorts', 'mode' => 'assiste', 'max' => 5000, 'tags' => [1, 5], 'titre' => 100, 'force' => 'Shorts', 'fichier' => 'video', 'ouvrir' => 'https://studio.youtube.com/', 'aide' => 'Dans YouTube Studio (nouvel onglet) : « Créer », « Importer des vidéos », choisissez la vidéo et collez le titre. Puis « Copier la description ».'],
        'linkedin' => ['nom' => 'LinkedIn', 'mode' => 'lien', 'max' => 3000, 'tags' => [0, 3], 'fichier' => '45', 'lien' => 'https://www.linkedin.com/feed/?shareActive=true&text={texte}'],
        'x' => ['nom' => 'X', 'mode' => 'lien', 'max' => 280, 'poids' => 'x', 'tags' => [0, 2], 'fichier' => '45', 'lien' => 'https://x.com/intent/post?text={texte}'],
        'threads' => ['nom' => 'Threads', 'mode' => 'lien', 'max' => 500, 'tags' => [0, 1], 'fichier' => '45', 'lien' => 'https://www.threads.net/intent/post?text={texte}'],
        'bluesky' => ['nom' => 'Bluesky', 'mode' => 'lien', 'max' => 300, 'tags' => [0, 2], 'fichier' => '45', 'lien' => 'https://bsky.app/intent/compose?text={texte}'],
        'pinterest' => ['nom' => 'Pinterest', 'mode' => 'lien', 'max' => 500, 'tags' => [0, 5], 'titre' => 100, 'fichier' => '23', 'media' => true, 'lien' => 'https://www.pinterest.com/pin/create/button/?url={url}&media={media}&description={texte}'],
        'whatsapp' => ['nom' => 'WhatsApp', 'mode' => 'lien', 'max' => 1000, 'tags' => [0, 0], 'fichier' => '45', 'lien' => 'https://wa.me/?text={texte}'],
        'google' => ['nom' => 'Fiche Google', 'mode' => 'assiste', 'max' => 1500, 'tags' => [0, 0], 'fichier' => '45', 'partage' => false, 'ouvrir' => 'https://business.google.com/', 'aide' => 'Dans votre fiche Google (nouvel onglet) : « Ajouter une actualité », collez le texte et ajoutez la photo.'],
        'site' => ['nom' => 'Mon site', 'mode' => 'direct', 'max' => 5000, 'tags' => [0, 0], 'titre' => 90],
        'mastodon' => ['nom' => 'Mastodon', 'mode' => 'direct', 'max' => 500, 'tags' => [0, 4]],
    ];
}
/* Le nom d'un réseau dans la liste « Où publier ? » vers son identifiant */
function aled08e_kit_id_de($nom) {
    $n = mb_strtolower(trim((string) $nom));
    foreach (aled08e_kit_defs() as $id => $d) if ($n === mb_strtolower($d['nom']) || $n === $id || $n === mb_strtolower($d['long'] ?? '')) return $id;
    return '';
}

/* =========================================================================
 *  Le texte : longueurs, coupe propre, hashtags
 * ========================================================================= */
/* La longueur comptée par le réseau. X compte double les émojis et les écritures d'Asie ; ailleurs, un caractère. */
function aled08e_kit_longueur($id, $t) {
    $t = (string) $t;
    if ($id !== 'x') {
        $n = function_exists('grapheme_strlen') ? grapheme_strlen($t) : false;
        return is_int($n) ? $n : mb_strlen($t);
    }
    $n = 0;
    foreach (preg_split('//u', $t, -1, PREG_SPLIT_NO_EMPTY) as $c) {
        $o = mb_ord($c);
        $n += ($o <= 0x10FF || ($o >= 0x2000 && $o <= 0x200D) || ($o >= 0x2010 && $o <= 0x201F) || ($o >= 0x2032 && $o <= 0x2037)) ? 1 : 2;
    }
    return $n;
}
/* Couper un texte trop long au dernier mot entier, avec « … » (jamais au milieu d'un mot) */
function aled08e_kit_couper($t, $max, $id = '') {
    $t = trim((string) $t);
    if ($max <= 0 || aled08e_kit_longueur($id, $t) <= $max) return $t;
    $c = mb_substr($t, 0, max(1, $max - 1));
    while ($c !== '' && aled08e_kit_longueur($id, $c . '…') > $max) $c = mb_substr($c, 0, -1);
    $p = max((int) mb_strrpos($c, ' '), (int) mb_strrpos($c, "\n"));
    if ($p > mb_strlen($c) * 0.6) $c = mb_substr($c, 0, $p);
    return rtrim($c, " \n\t,;:–-") . '…';
}
/* Un hashtag propre : « #motcle » (lettres, chiffres, _), ou '' s'il n'en reste rien */
function aled08e_kit_hashtag($h) {
    $h = preg_replace('/[^\p{L}\p{N}_]/u', '', wp_check_invalid_utf8((string) $h, true));
    if ($h === '' || preg_match('/^\d+$/', $h) || mb_strlen($h) > 40) return '';
    return '#' . $h;
}
/* Une liste de hashtags : nettoyés, sans doublon (majuscules et accents comptent pour rien), ni ceux déjà dans le texte */
function aled08e_kit_hashtags($liste, $texte = '', $max = 30) {
    if (is_string($liste)) $liste = preg_split('/[\s,;]+/u', $liste, -1, PREG_SPLIT_NO_EMPTY);
    $deja = [];
    if (preg_match_all('/#([\p{L}\p{N}_]+)/u', (string) $texte, $m)) foreach ($m[1] as $x) $deja[remove_accents(mb_strtolower($x))] = 1;
    $l = [];
    foreach ((array) $liste as $h) {
        if (!is_scalar($h)) continue;
        $h = aled08e_kit_hashtag($h);
        $cle = remove_accents(mb_strtolower(mb_substr($h, 1)));
        if ($h === '' || isset($deja[$cle])) continue;
        $deja[$cle] = 1;
        $l[] = $h;
        if (count($l) >= $max) break;
    }
    return $l;
}
/* Le texte entier tel qu'il part sur le réseau. Mon site : le titre sur la première ligne (reseaux.php le reprend). */
function aled08e_kit_assembler($id, $r) {
    $t = trim((string) ($r['texte'] ?? ''));
    if ($id === 'site' && trim((string) ($r['titre'] ?? '')) !== '') $t = trim((string) $r['titre']) . "\n\n" . $t;
    $h = (array) ($r['hashtags'] ?? []);
    return $h ? rtrim($t) . "\n\n" . implode(' ', $h) : $t;
}
/* Un réseau du kit, nettoyé et mis aux longueurs du réseau. $coupe : couper ce qui dépasse (réponse de Pépite) ;
 * sans coupe (texte changé par le client), seule la limite dure de 5 000 caractères s'applique. */
function aled08e_kit_reseau($id, $x, $coupe = true) {
    $d = aled08e_kit_defs()[$id];
    $texte = aled08e_jl_texte(is_scalar($x['texte'] ?? '') ? $x['texte'] ?? '' : '');
    $texte = preg_replace("/\n{3,}/", "\n\n", $texte);
    $titre = trim(preg_replace('/\s+/u', ' ', aled08e_jl_texte(is_scalar($x['titre'] ?? '') ? $x['titre'] ?? '' : '')));
    $tags = (int) $d['tags'][1] > 0 ? aled08e_kit_hashtags($x['hashtags'] ?? [], $texte, $coupe ? (int) $d['tags'][1] : 30) : [];
    if (!empty($d['force'])) {
        $f = '#' . $d['force'];
        $tags = array_values(array_filter($tags, function ($h) use ($f) { return mb_strtolower($h) !== mb_strtolower($f); }));
        if (stripos($texte, $f) === false) { array_unshift($tags, $f); if ($coupe) $tags = array_slice($tags, 0, (int) $d['tags'][1]); }
    }
    if (!empty($d['titre'])) $titre = $coupe ? aled08e_kit_couper($titre, (int) $d['titre']) : mb_substr($titre, 0, 300);
    else $titre = '';
    $r = ['texte' => mb_substr($texte, 0, 5000), 'hashtags' => $tags, 'titre' => $titre];
    if (!$coupe) return $r;
    // trop long : d'abord moins de hashtags (on garde #Shorts), puis le texte coupé au dernier mot entier
    $max = (int) $d['max'];
    while (count($r['hashtags']) > (empty($d['force']) ? 0 : 1) && aled08e_kit_longueur($id, aled08e_kit_assembler($id, $r)) > $max) array_pop($r['hashtags']);
    if (aled08e_kit_longueur($id, aled08e_kit_assembler($id, $r)) > $max) {
        $reste = $max - aled08e_kit_longueur($id, aled08e_kit_assembler($id, ['texte' => '', 'titre' => $r['titre'], 'hashtags' => $r['hashtags']]));
        $r['texte'] = aled08e_kit_couper($r['texte'], max(20, $reste), $id);
    }
    return $r;
}
/* La réponse de Pépite, vérifiée : seulement les réseaux demandés, un seul texte par réseau, des longueurs tenues.
 * Un réseau demandé et oublié reprend le texte d'un réseau proche (rien d'inventé). Rend le kit ou une WP_Error. */
function aled08e_kit_normaliser($brut, $demandes) {
    $defs = aled08e_kit_defs();
    $ids = [];
    foreach ((array) $demandes as $n) { $id = aled08e_kit_id_de($n); if ($id !== '' && !in_array($id, $ids, true)) $ids[] = $id; }
    $erreur = new WP_Error('aled08_kit', 'La réponse de Pépite est arrivée abîmée. Réessayez : rien n’a été compté.');
    if (!is_array($brut) || !$ids) return $erreur;
    $recus = [];
    foreach ((array) ($brut['reseaux'] ?? []) as $x) {
        if (!is_array($x)) continue;
        $id = sanitize_key((string) ($x['reseau'] ?? ''));
        if (!isset($defs[$id]) || !in_array($id, $ids, true) || isset($recus[$id])) continue;
        $r = aled08e_kit_reseau($id, $x);
        if (trim($r['texte']) === '' || mb_strlen($r['texte']) < 8) continue;
        $recus[$id] = $r;
    }
    if (!$recus) return $erreur;
    // un réseau oublié : le texte d'un voisin, remis à ses longueurs
    $voisins = ['instagram' => ['facebook', 'threads'], 'facebook' => ['instagram', 'linkedin'], 'tiktok' => ['instagram', 'x'], 'youtube' => ['tiktok', 'instagram'], 'linkedin' => ['facebook'], 'x' => ['bluesky', 'threads', 'tiktok'], 'threads' => ['instagram', 'x'], 'bluesky' => ['x', 'threads'], 'pinterest' => ['instagram', 'facebook'], 'whatsapp' => ['facebook'], 'google' => ['facebook'], 'site' => ['facebook', 'linkedin'], 'mastodon' => ['bluesky', 'facebook']];
    foreach ($ids as $id) {
        if (isset($recus[$id])) continue;
        foreach (array_merge($voisins[$id] ?? [], array_keys($recus)) as $v) {
            if (!isset($recus[$v])) continue;
            $titre = $recus[$v]['titre'] !== '' ? $recus[$v]['titre'] : wp_trim_words($recus[$v]['texte'], 8, '');
            $recus[$id] = aled08e_kit_reseau($id, ['texte' => $recus[$v]['texte'], 'titre' => $titre, 'hashtags' => $recus[$v]['hashtags']]);
            break;
        }
    }
    $kit = ['ordre' => [], 'reseaux' => [], 'titre_image' => ''];
    foreach ($ids as $id) if (isset($recus[$id])) { $kit['ordre'][] = $id; $kit['reseaux'][$id] = $recus[$id]; }
    $ti = trim(preg_replace('/\s+/u', ' ', preg_replace('/#[\p{L}\p{N}_]+/u', '', aled08e_jl_texte(is_scalar($brut['titre_image'] ?? '') ? $brut['titre_image'] ?? '' : ''))));
    $kit['titre_image'] = aled08e_kit_couper($ti, 40);
    return $kit;
}
/* Une ancienne réponse en blocs (titre = nom du réseau, hashtags sur la dernière ligne) remise en forme de kit */
function aled08e_kit_depuis_blocs($blocs) {
    $l = [];
    foreach ((array) $blocs as $b) {
        $id = aled08e_kit_id_de($b['titre'] ?? '');
        if ($id === '') continue;
        $t = trim((string) ($b['texte'] ?? ''));
        $tags = [];
        $lignes = explode("\n", $t);
        if (count($lignes) > 1 && preg_match('/^(\s*#[\p{L}\p{N}_]+)+\s*$/u', end($lignes))) { preg_match_all('/#[\p{L}\p{N}_]+/u', array_pop($lignes), $m); $tags = $m[0]; $t = trim(implode("\n", $lignes)); }
        $titre = '';
        if ($id === 'site') { $p = preg_split('/\n+/', $t, 2); $titre = trim((string) $p[0]); $t = trim((string) ($p[1] ?? $p[0])); }
        $l[] = ['reseau' => $id, 'titre' => $titre, 'texte' => $t, 'hashtags' => $tags];
    }
    return ['stop' => '', 'titre_image' => '', 'reseaux' => $l];
}
/* Un kit renvoyé par le navigateur (textes changés par le client) : mêmes réseaux que le kit gardé, textes nettoyés, rien coupé */
function aled08e_kit_edition($garde, $recu) {
    if (!is_array($recu)) return $garde;
    $kit = $garde;
    foreach ((array) $garde['ordre'] as $id) {
        $x = $recu['reseaux'][$id] ?? null;
        if (!is_array($x)) continue;
        $r = aled08e_kit_reseau($id, $x, false);
        if (trim($r['texte']) !== '') $kit['reseaux'][$id] = $r;
    }
    if (isset($recu['titre_image']) && is_scalar($recu['titre_image'])) $kit['titre_image'] = mb_substr(trim(preg_replace('/\s+/u', ' ', aled08e_jl_texte($recu['titre_image']))), 0, 60);
    return $kit;
}

/* =========================================================================
 *  Les kits gardés : option aled08_kit_<empreinte> (retrouvée sans connexion), liste du client en méta utilisateur
 * ========================================================================= */
function aled08e_kit_cle($jeton) { return substr(hash('sha256', 'aled08-kit|' . (string) $jeton), 0, 32); }
function aled08e_kit_jeton_ok($jeton) { return is_string($jeton) && preg_match('/^[A-Za-z0-9_-]{43}$/', $jeton); }
function aled08e_kit_lien($jeton) { return aled08e_url(['kit' => $jeton]); }
function aled08e_kit_liste($uid) {
    $l = get_user_meta((int) $uid, 'aled08_kits', true);
    return is_array($l) ? $l : [];
}
function aled08e_kit_lire($cle) {
    $cle = preg_replace('/[^a-f0-9]/', '', (string) $cle);
    if (strlen($cle) !== 32) return null;
    $k = get_option('aled08_kit_' . $cle);
    return is_array($k) && !empty($k['uid']) ? $k : null;
}
/* Retrouver un kit par son jeton (lien personnel) : empreinte comparée en temps constant, kit encore valable */
function aled08e_kit_trouver($jeton) {
    if (!aled08e_kit_jeton_ok($jeton)) return null;
    $cle = aled08e_kit_cle($jeton);
    $k = aled08e_kit_lire($cle);
    if (!$k || !hash_equals((string) ($k['h'] ?? ''), hash('sha256', 'aled08-kit|' . $jeton))) return null;
    if ((int) ($k['fin'] ?? 0) < time()) { aled08e_kit_effacer($cle); return null; }
    return ['cle' => $cle] + $k;
}
/* Le kit d'un client connecté, par sa clé (outil Publier partout) */
function aled08e_kit_du_client($uid, $cle) {
    $k = aled08e_kit_lire($cle);
    if (!$k || (int) $k['uid'] !== (int) $uid) return null;
    if ((int) ($k['fin'] ?? 0) < time()) { aled08e_kit_effacer($cle); return null; }
    return ['cle' => preg_replace('/[^a-f0-9]/', '', (string) $cle)] + $k;
}
/* La photo d'un kit : réduite, tournée, réenregistrée en JPEG (rien d'autre n'est gardé), nom imprévisible, 30 jours */
function aled08e_kit_dossier() {
    $up = wp_upload_dir();
    return ['dir' => trailingslashit($up['basedir']) . 'aled08-kits', 'url' => trailingslashit($up['baseurl']) . 'aled08-kits'];
}
function aled08e_kit_photo_url($nom) {
    if (!is_string($nom) || !preg_match('/^[A-Za-z0-9]{32}\.jpg$/', $nom)) return '';
    $d = aled08e_kit_dossier();
    return file_exists($d['dir'] . '/' . $nom) ? $d['url'] . '/' . $nom : '';
}
function aled08e_kit_photo_garder($fichier) {
    if (empty($fichier['name'])) return '';
    if (!empty($fichier['error']) || empty($fichier['tmp_name']) || !is_uploaded_file($fichier['tmp_name'])) return new WP_Error('aled08_kit', 'La photo n’est pas arrivée.');
    if ((int) $fichier['size'] > 8 * MB_IN_BYTES) return new WP_Error('aled08_kit', 'La photo est trop lourde (8 Mo au plus).');
    $type = wp_check_filetype_and_ext($fichier['tmp_name'], $fichier['name']);
    if (!in_array($type['type'] ?? '', ['image/jpeg', 'image/png', 'image/webp'], true) || !@getimagesize($fichier['tmp_name'])) return new WP_Error('aled08_kit', 'La photo doit être un JPG, un PNG ou un WEBP.');
    $d = aled08e_kit_dossier();
    if (!wp_mkdir_p($d['dir'])) return new WP_Error('aled08_kit', 'Impossible de garder la photo.');
    if (!file_exists($d['dir'] . '/index.html')) @file_put_contents($d['dir'] . '/index.html', '');
    $ed = wp_get_image_editor($fichier['tmp_name']);
    if (is_wp_error($ed)) return new WP_Error('aled08_kit', 'Cette photo ne peut pas être lue.');
    if (method_exists($ed, 'maybe_exif_rotate')) $ed->maybe_exif_rotate();
    $ed->resize(1600, 1600, false);
    $ed->set_quality(86);
    $nom = wp_generate_password(32, false, false) . '.jpg';
    $s = $ed->save($d['dir'] . '/' . $nom, 'image/jpeg');
    if (is_wp_error($s) || empty($s['path'])) return new WP_Error('aled08_kit', 'Impossible de garder la photo.');
    return basename($s['path']) === $nom ? $nom : new WP_Error('aled08_kit', 'Impossible de garder la photo.');
}
function aled08e_kit_photo_effacer($nom) {
    if (!is_string($nom) || !preg_match('/^[A-Za-z0-9]{32}\.jpg$/', $nom)) return;
    $f = aled08e_kit_dossier()['dir'] . '/' . $nom;
    if (file_exists($f)) @unlink($f);
}
/* Garder un kit qui vient d'être écrit. Rend ['cle', 'jeton', 'lien', 'fin', 'photo' => adresse publique ou ''] (ou une WP_Error). */
function aled08e_kit_creer($uid, $kit, $fichier = [], $extrait = '') {
    $uid = (int) $uid;
    $photo = !empty($fichier['name']) ? aled08e_kit_photo_garder($fichier) : '';
    if (is_wp_error($photo)) $photo = ''; // le kit reste utile sans sa photo (le navigateur la garde pour cette fois)
    $jeton = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $cle = aled08e_kit_cle($jeton);
    $fin = time() + ALED08E_KIT_JOURS * DAY_IN_SECONDS;
    $extrait = mb_substr(trim(preg_replace('/\s+/u', ' ', aled08e_jl_texte($extrait))), 0, 80);
    add_option('aled08_kit_' . $cle, ['h' => hash('sha256', 'aled08-kit|' . $jeton), 'uid' => $uid, 't' => time(), 'fin' => $fin, 'photo' => $photo, 'kit' => $kit, 'extrait' => $extrait, 'rappel' => 0], '', false);
    $l = aled08e_kit_liste($uid);
    $l[$cle] = ['j' => $jeton, 't' => time(), 'fin' => $fin, 'x' => $extrait, 'r' => array_values((array) $kit['ordre'])];
    // les kits passés, puis les plus anciens au-delà de 30
    foreach ($l as $c => $e) if ((int) ($e['fin'] ?? 0) < time() || !aled08e_kit_lire($c)) { unset($l[$c]); aled08e_kit_effacer($c, false); }
    uasort($l, function ($a, $b) { return (int) $a['t'] <=> (int) $b['t']; });
    while (count($l) > ALED08E_KIT_MAX) { $c = array_key_first($l); unset($l[$c]); aled08e_kit_effacer($c, false); }
    update_user_meta($uid, 'aled08_kits', $l);
    wp_schedule_single_event($fin + 60, 'aled08_kit_expire', [$cle]);
    return ['cle' => $cle, 'jeton' => $jeton, 'lien' => aled08e_kit_lien($jeton), 'fin' => $fin, 'finTxt' => wp_date('j F', $fin), 'photo' => aled08e_kit_photo_url($photo)];
}
/* Effacer un kit : sa fiche, sa photo, son rappel, et sa ligne dans la liste du client */
function aled08e_kit_effacer($cle, $liste = true) {
    $cle = preg_replace('/[^a-f0-9]/', '', (string) $cle);
    if (strlen($cle) !== 32) return;
    $k = get_option('aled08_kit_' . $cle);
    if (is_array($k)) {
        aled08e_kit_photo_effacer($k['photo'] ?? '');
        if ($liste && !empty($k['uid'])) { $l = aled08e_kit_liste($k['uid']); unset($l[$cle]); update_user_meta((int) $k['uid'], 'aled08_kits', $l); }
    }
    delete_option('aled08_kit_' . $cle);
    wp_clear_scheduled_hook('aled08_kit_rappel', [$cle]);
    wp_clear_scheduled_hook('aled08_kit_expire', [$cle]);
}
add_action('aled08_kit_expire', function ($cle) { aled08e_kit_effacer($cle); });
/* Filet de sécurité, chaque jour : les kits passés (tâche manquée), et les photos sans kit */
add_action('init', function () { if (!wp_doing_ajax() && !wp_next_scheduled('aled08_kits_menage')) wp_schedule_event(time() + HOUR_IN_SECONDS, 'daily', 'aled08_kits_menage'); }, 30);
add_action('aled08_kits_menage', function () {
    global $wpdb;
    $noms = $wpdb->get_col($wpdb->prepare("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT 2000", $wpdb->esc_like('aled08_kit_') . '%'));
    $photos = [];
    foreach ((array) $noms as $n) {
        $cle = substr((string) $n, strlen('aled08_kit_'));
        $k = aled08e_kit_lire($cle);
        if (!$k || (int) ($k['fin'] ?? 0) < time()) { aled08e_kit_effacer($cle); continue; }
        if (!empty($k['photo'])) $photos[$k['photo']] = 1;
    }
    $d = aled08e_kit_dossier()['dir'];
    foreach ((array) glob($d . '/*.jpg') as $f) if (!isset($photos[basename($f)]) && filemtime($f) < time() - DAY_IN_SECONDS) @unlink($f);
});

/* =========================================================================
 *  Les e-mails : le lien sur le téléphone, et le rappel « C'est l'heure de publier »
 * ========================================================================= */
function aled08e_kit_noms($ids) {
    $defs = aled08e_kit_defs();
    $n = array_values(array_filter(array_map(function ($id) use ($defs) { return $defs[$id]['nom'] ?? ''; }, (array) $ids)));
    return count($n) > 1 ? implode(', ', array_slice($n, 0, -1)) . ' et ' . end($n) : ($n[0] ?? 'vos réseaux');
}
function aled08e_kit_mail($uid, $k, $jeton, $rappel = false) {
    $u = get_userdata((int) $uid);
    if (!$u || !is_email($u->user_email)) return false;
    $lien = aled08e_kit_lien($jeton);
    $prenom = trim((string) ($u->first_name ?: $u->display_name));
    $sujet = $rappel ? 'C’est l’heure de publier' : 'Votre publication est prête';
    $pour = aled08e_kit_noms($k['kit']['ordre'] ?? []);
    $x = (string) ($k['extrait'] ?? '');
    $intro = $rappel ? 'C’est le moment que vous aviez choisi : votre publication' . ($x !== '' ? ' « ' . $x . ' »' : '') . ' pour ' . $pour . ' vous attend.' : 'Pépite a préparé votre publication' . ($x !== '' ? ' « ' . $x . ' »' : '') . ' pour ' . $pour . '.';
    $suite = 'Ouvrez ce lien sur votre téléphone : la photo, la vidéo et les textes sont prêts, réseau par réseau. Un bouton par réseau, et c’est publié.';
    $fin = 'Ce lien marche sans mot de passe jusqu’au ' . wp_date('j F', (int) $k['fin']) . '. Gardez-le pour vous : il ouvre votre publication.';
    $texte = 'Bonjour' . ($prenom !== '' ? ' ' . $prenom : '') . ",\n\n" . $intro . "\n\n" . $suite . "\n\n" . $lien . "\n\n" . $fin . "\n\nÀ bientôt,\nPépite et les Minis Monstres\n";
    $html = '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#2E2A47;">' . esc_html($sujet) . '</h1>'
        . '<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#4B4668;">Bonjour' . esc_html($prenom !== '' ? ' ' . $prenom : '') . ',</p>'
        . '<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#4B4668;">' . esc_html($intro) . '</p>'
        . '<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#4B4668;">' . esc_html($suite) . '</p>'
        . (function_exists('aled08e_mail_bouton') ? aled08e_mail_bouton($lien, 'Ouvrir ma publication', '#FFF1C2') : '<p><a href="' . esc_url($lien) . '">Ouvrir ma publication</a></p>')
        . '<p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#6B6789;">' . esc_html($fin) . '</p>';
    if (function_exists('aled08e_mail_coque')) {
        $GLOBALS['aled08e_mail_alt'] = $texte; // la version texte (mails.php la donne à PHPMailer)
        $ok = wp_mail($u->user_email, $sujet, aled08e_mail_coque($sujet, function_exists('aled08e_mail_carte') ? aled08e_mail_carte('beurre', $html, 'etoile') : $html, $intro), ['Content-Type: text/html; charset=UTF-8']);
        $GLOBALS['aled08e_mail_alt'] = ''; // jamais pour un autre e-mail
        return $ok;
    }
    return wp_mail($u->user_email, $sujet, $texte, ['Content-Type: text/plain; charset=UTF-8']);
}
add_action('aled08_kit_rappel', function ($cle) {
    $k = aled08e_kit_lire($cle);
    if (!$k || (int) ($k['fin'] ?? 0) < time()) return;
    $l = aled08e_kit_liste($k['uid']);
    if (empty($l[$cle]['j'])) return;
    $k['rappel'] = 0;
    update_option('aled08_kit_' . $cle, $k, false);
    aled08e_kit_mail($k['uid'], $k, $l[$cle]['j'], true);
});

/* =========================================================================
 *  Les points d'entrée de l'outil (client connecté, nonce aled08e_ao)
 * ========================================================================= */
function aled08e_kit_entree() {
    $uid = aled08e_ao_entree();
    aled08e_ao_exiger($uid, 'publier');
    $k = aled08e_kit_du_client($uid, sanitize_key(wp_unslash($_POST['k'] ?? '')));
    if (!$k) wp_send_json_error(['message' => 'Cette publication n’existe plus (son lien a été supprimé ou il a plus de 30 jours).'], 404);
    return [$uid, $k];
}
/* Les textes changés par le client (et une photo ajoutée après coup) */
add_action('wp_ajax_aled08e_ao_kit_maj', function () {
    [$uid, $k] = aled08e_kit_entree();
    if (!aled08e_jl_quota($uid, 'aled08_kit_maj_', 300)) wp_send_json_error(['message' => 'Beaucoup de changements cette heure-ci.'], 429);
    $brut = (string) wp_unslash($_POST['kit'] ?? '');
    if (strlen($brut) > 200000) wp_send_json_error(['message' => 'Ces textes sont trop longs.'], 400);
    $cle = $k['cle'];
    unset($k['cle']);
    $k['kit'] = aled08e_kit_edition($k['kit'], json_decode($brut, true));
    $photo = '';
    if (!empty($_FILES['image']['name'])) {
        $p = aled08e_kit_photo_garder($_FILES['image']);
        if (is_wp_error($p)) wp_send_json_error(['message' => $p->get_error_message()], 400);
        aled08e_kit_photo_effacer($k['photo'] ?? '');
        $k['photo'] = $p;
        $photo = aled08e_kit_photo_url($p);
    }
    update_option('aled08_kit_' . $cle, $k, false);
    wp_send_json_success(['ok' => 1, 'photo' => $photo]);
});
add_action('wp_ajax_aled08e_ao_kit_mail', function () {
    [$uid, $k] = aled08e_kit_entree();
    if (!aled08e_jl_quota($uid, 'aled08_kit_mail_', 10)) wp_send_json_error(['message' => 'Plusieurs e-mails sont déjà partis cette heure-ci. Utilisez le QR code, ou réessayez plus tard.'], 429);
    $l = aled08e_kit_liste($uid);
    if (empty($l[$k['cle']]['j']) || !aled08e_kit_mail($uid, $k, $l[$k['cle']]['j'])) wp_send_json_error(['message' => 'L’e-mail n’est pas parti. Utilisez le QR code, ou réessayez dans un instant.'], 400);
    $u = get_userdata($uid);
    wp_send_json_success(['message' => 'C’est envoyé à ' . ($u ? $u->user_email : 'votre adresse') . '. Ouvrez l’e-mail sur votre téléphone.']);
});
add_action('wp_ajax_aled08e_ao_kit_rappel', function () {
    [$uid, $k] = aled08e_kit_entree();
    $cle = $k['cle'];
    unset($k['cle']);
    wp_clear_scheduled_hook('aled08_kit_rappel', [$cle]);
    if (!empty($_POST['annuler'])) {
        $k['rappel'] = 0;
        update_option('aled08_kit_' . $cle, $k, false);
        wp_send_json_success(['message' => 'Le rappel est annulé.']);
    }
    if (!aled08e_jl_quota($uid, 'aled08_kit_rap_', 30)) wp_send_json_error(['message' => 'Beaucoup de rappels cette heure-ci. Réessayez dans un moment.'], 429);
    $dt = DateTime::createFromFormat('Y-m-d\TH:i', sanitize_text_field(wp_unslash($_POST['quand'] ?? '')), wp_timezone());
    if (!$dt) wp_send_json_error(['message' => 'Choisissez un jour et une heure.'], 400);
    $t = $dt->getTimestamp();
    if ($t < time() + 5 * MINUTE_IN_SECONDS) wp_send_json_error(['message' => 'Choisissez un moment dans plus de 5 minutes.'], 400);
    if ($t > (int) $k['fin'] - HOUR_IN_SECONDS) wp_send_json_error(['message' => 'Ce lien s’efface le ' . wp_date('j F', (int) $k['fin']) . ' : choisissez un moment avant.'], 400);
    $k['rappel'] = $t;
    update_option('aled08_kit_' . $cle, $k, false);
    wp_schedule_single_event($t, 'aled08_kit_rappel', [$cle]);
    wp_send_json_success(['message' => 'C’est noté : Pépite vous écrit le ' . wp_date('j F à G \h i', $t) . ', avec le lien.']);
});
add_action('wp_ajax_aled08e_ao_kit_effacer', function () {
    [$uid, $k] = aled08e_kit_entree();
    aled08e_kit_effacer($k['cle']);
    wp_send_json_success(['message' => 'Ce lien est supprimé : la publication et sa photo sont effacées.']);
});
/* Depuis la page du lien (sans connexion) : le jeton suffit, comme pour ouvrir la page */
function aled08e_kit_oubli() {
    if (!aled08e_kit_essais_ok()) wp_send_json_error(['message' => 'Trop d’essais. Réessayez plus tard.'], 429);
    $k = aled08e_kit_trouver((string) wp_unslash($_POST['kit'] ?? ''));
    if (!$k) { aled08e_kit_essai_rate(); wp_send_json_error(['message' => 'Ce lien n’existe plus.'], 404); }
    aled08e_kit_effacer($k['cle']);
    wp_send_json_success(['message' => 'C’est effacé.']);
}
add_action('wp_ajax_aled08e_kit_oubli', 'aled08e_kit_oubli');
add_action('wp_ajax_nopriv_aled08e_kit_oubli', 'aled08e_kit_oubli');

/* Pas plus de 30 jetons faux par heure et par adresse */
function aled08e_kit_essais_cle() { return 'aled08_kit_ip_' . md5((string) ($_SERVER['REMOTE_ADDR'] ?? '')); }
function aled08e_kit_essais_ok() { return (int) get_transient(aled08e_kit_essais_cle()) < 30; }
function aled08e_kit_essai_rate() { set_transient(aled08e_kit_essais_cle(), (int) get_transient(aled08e_kit_essais_cle()) + 1, HOUR_IN_SECONDS); }

/* =========================================================================
 *  Dans l'outil : les publications prêtes (liens encore valables)
 * ========================================================================= */
function aled08e_kit_liste_html($uid) {
    $l = array_filter(aled08e_kit_liste($uid), function ($e) { return (int) ($e['fin'] ?? 0) > time(); });
    if (!$l) return '';
    uasort($l, function ($a, $b) { return (int) $b['t'] <=> (int) $a['t']; });
    $h = '<details class="ao-progs ao-kits"><summary class="app-sub">' . aled08e_icon('link') . '<span>Mes publications prêtes (' . count($l) . ')</span></summary><ul>';
    foreach (array_slice($l, 0, 12, true) as $cle => $e) {
        $h .= '<li><span><strong>' . esc_html(wp_date('j F', (int) $e['t'])) . '</strong> · ' . esc_html(aled08e_kit_noms($e['r'] ?? [])) . ($e['x'] !== '' ? '<small>' . esc_html($e['x']) . '</small>' : '') . '<small>Lien valable jusqu’au ' . esc_html(wp_date('j F', (int) $e['fin'])) . '</small></span>'
            . '<span class="ao-kits-actions"><a class="link-btn" href="' . esc_url(aled08e_kit_lien($e['j'])) . '" target="_blank" rel="noopener noreferrer">Ouvrir</a><button type="button" class="link-btn" data-ao-kit-suppr="' . esc_attr($cle) . '">Supprimer</button></span></li>';
    }
    return $h . '</ul></details>';
}

/* =========================================================================
 *  La page du lien : /mon-espace/?kit=<jeton> (sans connexion, jamais indexée)
 * ========================================================================= */
add_action('template_redirect', function () {
    if (!isset($_GET['kit']) || is_admin() || !is_page('mon-espace')) return;
    nocache_headers();
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
    do_action('litespeed_control_set_nocache', 'kit de publication');
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
    header('Referrer-Policy: no-referrer', true);
    header('X-Content-Type-Options: nosniff', true);
    header('X-Frame-Options: DENY', true);
    $jeton = is_string($_GET['kit']) ? (string) wp_unslash($_GET['kit']) : '';
    $k = null;
    if (aled08e_kit_essais_ok()) {
        $k = aled08e_kit_trouver($jeton);
        if (!$k) aled08e_kit_essai_rate();
    }
    status_header($k ? 200 : 404);
    header('Content-Type: text/html; charset=UTF-8');
    echo aled08e_kit_page_html($k); // phpcs:ignore -- page construite et échappée ci-dessous
    exit;
}, 1);

function aled08e_kit_page_html($k) {
    $theme = get_template_directory_uri();
    $f = defined('ALED08E_FILE') ? ALED08E_FILE : dirname(__DIR__) . '/aled08-espace.php';
    $dir = dirname($f);
    $v = function ($nom) use ($dir) { return (string) @filemtime($dir . '/' . $nom); };
    $css = '';
    foreach (['/assets/css/style.css', '/assets/css/espace.css'] as $c) if (file_exists(get_template_directory() . $c)) $css .= '<link rel="stylesheet" href="' . esc_url($theme . $c . '?v=' . filemtime(get_template_directory() . $c)) . '">';
    $lune = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    $h = '<!doctype html><html lang="fr" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><meta name="color-scheme" content="light"><meta name="theme-color" content="#FFF8F2">'
        . '<title>' . esc_html($k ? 'Votre publication est prête' : 'Ce lien n’existe plus') . ' · Les Minis Monstres</title>'
        . '<script>(function(h){var t;try{t=localStorage.getItem(\'mm-theme\')}catch(e){}h.setAttribute(\'data-theme\',t===\'dark\'?\'dark\':\'light\')})(document.documentElement)</script>'
        . $css . (function_exists('aled08e_ao_styles') ? aled08e_ao_styles() : '') . aled08e_kit_styles()
        . '</head><body class="kp-corps-page">';
    $tete = '<header class="kp-haut"><a class="kp-logo" href="' . esc_url(home_url('/')) . '"><img src="' . esc_url($theme . '/assets/img/logo-192.png') . '" width="40" height="40" alt=""><span>Les Minis<b>MONSTRES</b></span></a>'
        . '<button class="theme-btn kp-theme" type="button" aria-label="Passer en apparence sombre" aria-pressed="false" data-kp-theme>' . aled08e_icon('sun') . $lune . '</button></header>';
    if (!$k) {
        return $h . $tete . '<main class="kp-page"><section class="ao c-butter kp-fin"><span class="ao-fin-monstre" aria-hidden="true">' . aled08e_monster('etoile') . '</span><h1>Ce lien n’existe plus</h1>'
            . '<p>Les publications préparées par Pépite restent 30 jours, puis s’effacent. Celle-ci a été supprimée, ou le lien est incomplet.</p>'
            . '<p><a class="btn btn-primary" href="' . esc_url(aled08e_url(['outil' => 'publier']) . '#outils') . '">Ouvrir Publier partout</a></p></section></main>'
            . '<script src="' . esc_url(plugins_url('kit-publication.js', $f) . '?v=' . $v('kit-publication.js')) . '" defer></script></body></html>';
    }
    $defs = aled08e_kit_defs();
    $site = esc_url_raw(aled08e_meta((int) $k['uid'], 'site'));
    $donnees = ['kit' => $k['kit'], 'defs' => $defs, 'photo' => aled08e_kit_photo_url($k['photo'] ?? ''), 'site' => $site, 'ajax' => admin_url('admin-ajax.php'), 'fin' => wp_date('j F', (int) $k['fin'])];
    $x = (string) ($k['extrait'] ?? '');
    $h .= $tete . '<main class="kp-page"><section class="ao c-butter kp" data-kp-page>'
        . '<header class="ao-tete"><span class="ao-monstre" aria-hidden="true">' . aled08e_monster('etoile') . '</span><div><p class="ao-chef">Pépite</p><h1>Votre publication est prête</h1>'
        . '<p class="ao-court">Pour ' . esc_html(aled08e_kit_noms($k['kit']['ordre'] ?? [])) . ($x !== '' ? ' : « ' . esc_html($x) . ' »' : '') . '.</p></div></header>'
        . '<p class="app-note">Touchez le bouton de chaque réseau : le bon fichier est prêt et le texte est copié. Il ne reste qu’à coller et publier.</p>'
        . '<div class="kp-fichiers" data-kp-fichiers></div><div class="ao-cartes" data-kp-cartes></div>'
        . '<div class="kp-tel" data-kp-ici hidden><div class="ao-qr"><div class="ao-qr-code" data-kp-qr></div><div><p class="app-sub">' . aled08e_icon('phone') . 'Ouvrir sur mon téléphone</p><p class="app-note">Visez ce code avec l’appareil photo de votre téléphone : c’est plus simple d’y publier.</p></div></div></div>'
        . '<p class="app-note kp-bas">Ce lien est à vous : il marche sans mot de passe jusqu’au ' . esc_html(wp_date('j F', (int) $k['fin'])) . ', puis la publication et sa photo s’effacent. Vos changements ici restent sur cet appareil.</p>'
        . '<p class="kp-bas"><button type="button" class="link-btn" data-kp-oubli>Effacer cette publication maintenant</button></p><p class="ol-etat" data-kp-etat role="status" aria-live="polite"></p>'
        . '</section></main>'
        . '<script type="application/json" id="kp-donnees">' . wp_json_encode($donnees, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) . '</script>';
    if (file_exists($dir . '/qrcode.js')) $h .= '<script src="' . esc_url(plugins_url('qrcode.js', $f) . '?v=' . $v('qrcode.js')) . '" defer></script>';
    $h .= '<script src="' . esc_url(plugins_url('kit-video.js', $f) . '?v=' . $v('kit-video.js')) . '" defer></script>'
        . '<script src="' . esc_url(plugins_url('kit-publication.js', $f) . '?v=' . $v('kit-publication.js')) . '" defer></script>';
    return $h . '</body></html>';
}

/* Les styles du kit (outil et page du lien) */
function aled08e_kit_styles() {
    static $fait = false;
    if ($fait) return '';
    $fait = true;
    return '<style id="aled08e-kit-styles">'
        . '.kp-corps-page{margin:0;background:var(--bg);color:var(--text);font-family:var(--font)}.kp-page{max-width:640px;margin:0 auto;padding:8px 16px 40px}'
        . '.kp-haut{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:640px;margin:0 auto;padding:12px 16px}.kp-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:900;line-height:1}.kp-logo img{border-radius:12px}.kp-logo b{display:block;margin-top:3px;font-size:.72rem;letter-spacing:.24em;color:var(--pink-d)}'
        . '.kp-theme{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:999px;background:var(--card);color:var(--ink);box-shadow:0 0 0 2px var(--line) inset;cursor:pointer}.kp-theme svg{width:22px;height:22px}.kp-theme svg+svg{display:none}[data-theme="dark"] .kp-theme svg{display:none}[data-theme="dark"] .kp-theme svg+svg{display:block}'
        . '.kp .ao-tete h1{margin:0;font-size:1.35rem;color:var(--ink)}.kp-fin{display:grid;justify-items:center;text-align:center;gap:12px}.kp-fin h1{margin:0;color:var(--ink)}.kp-bas{margin:0}'
        . '.kp{display:grid;gap:14px}.kp>.app-note{margin:0}'
        . '.kp-fichiers{display:grid;gap:10px;padding:14px;border-radius:18px;background:var(--soft);box-shadow:0 0 0 2px var(--line) inset}.kp-fichiers>.app-sub,.kp-fichiers>.app-note{margin:0}'
        . '.kp-fichiers-tete{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}.kp-fichiers-tete strong{color:var(--ink);font-weight:900}.kp-fichiers-tete select{max-width:100%;min-height:40px;border-radius:12px;border:0;box-shadow:0 0 0 2px var(--line) inset;background:var(--card);color:var(--ink);font:700 .9rem var(--font);padding:0 10px}'
        . '.kp-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}'
        . '.kp-fig{margin:0;display:grid;gap:6px;align-content:start;padding:8px;border-radius:14px;background:var(--card)}.kp-fig img,.kp-fig video{display:block;width:100%;height:150px;object-fit:contain;border-radius:10px;background:#16142A}'
        . '.kp-fig figcaption{display:grid;gap:4px}.kp-fig strong{color:var(--ink);font-size:.9rem}.kp-fig small{color:var(--muted);font-weight:700}.kp-fig .btn{min-height:38px;font-size:.88rem;padding:0 .8em;white-space:normal}'
        . '.kp-video{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,150px) minmax(0,1fr);gap:12px;align-items:start}.kp-video video,.kp-video .kp-attente{height:240px}'
        . '.kp-attente{display:grid;place-items:center;border-radius:10px;background:var(--soft);color:var(--muted);font-weight:800;text-align:center;padding:8px}'
        . '.kp-barre{height:10px;border-radius:999px;background:var(--line);overflow:hidden}.kp-barre span{display:block;height:100%;width:0;background:var(--butter-d);border-radius:inherit;transition:width .2s}'
        . '.kp-video-ctl{display:grid;gap:8px}.kp-video-ctl label.ao-case{display:flex;gap:8px;align-items:center;font-weight:700;color:var(--ink)}.kp-video-ctl input[type=text]{width:100%;min-height:42px;border:0;border-radius:12px;box-shadow:0 0 0 2px var(--line) inset;background:var(--card);color:var(--ink);font:700 .95rem var(--font);padding:0 12px}'
        . '.kp-video-ctl .ol-bloc-actions{display:flex;flex-wrap:wrap;gap:8px}.kp-video-ctl small{color:var(--muted);font-weight:700}'
        . '.kp-carte .ao-carte-tete{cursor:default}.kp-carte .ao-carte-tete.a-case{cursor:pointer}.kp-mini{flex:none;width:40px;height:40px;border-radius:10px;object-fit:cover;background:var(--card);box-shadow:0 0 0 2px var(--line) inset}'
        . '.kp-nom{flex:1;display:grid;gap:1px}.kp-nom strong{color:var(--ink);font-weight:900}.kp-nom .ao-mode{font-size:.8rem}'
        . '.kp-carte textarea.kp-tags,.kp-carte textarea.kp-titre{font-weight:700;resize:vertical;min-height:0}'
        . '.kp-carte .kp-champ{display:grid;gap:4px}.kp-carte .kp-champ>span{font-size:.85rem;font-weight:800;color:var(--muted)}'
        . '.kp-carte .ol-bloc-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.kp-carte .btn{white-space:normal;text-align:center}.kp-carte .ol-bloc-msg{flex:1 1 100%;font-weight:700;color:var(--text)}.kp-carte .ol-bloc-msg.is-err{color:var(--peach-dd)}'
        . '.kp-tel{display:grid;gap:12px;padding:14px;border-radius:18px;background:var(--mint)}.kp-tel .app-sub,.kp-tel .app-note{margin:0}.kp-tel .ol-bloc-actions{display:flex;flex-wrap:wrap;gap:8px}.kp-lien{width:100%;min-height:42px;border:0;border-radius:12px;background:var(--card);color:var(--ink);font:600 .85rem var(--font);padding:0 12px;box-shadow:0 0 0 2px var(--line) inset}'
        . '.kp-tel .ao-prog{background:var(--card)}.kp-tel.is-vu{animation:kp-vu 1.2s ease 2}@keyframes kp-vu{50%{box-shadow:0 0 0 4px var(--mint-d)}}'
        . '.kp-toast{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;max-width:calc(100vw - 32px);padding:12px 18px;border-radius:999px;background:#2E2A47;color:#fff;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.25)}'
        . '.ao-kits>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px}.ao-kits>summary::-webkit-details-marker{display:none}.ao-kits[open]>summary{margin-bottom:6px}.ao-kits-actions{display:flex;gap:12px}'
        . '@media (max-width:520px){.kp-video{grid-template-columns:1fr}.kp-video video,.kp-video .kp-attente{height:300px}.kp-carte .btn-primary{flex:1 1 100%}.kp-carte .btn-light{flex:1 1 auto;min-height:40px}}'
        . '@media (prefers-reduced-motion:reduce){.kp-tel.is-vu{animation:none}.kp-barre span{transition:none}}'
        . '</style>';
}
