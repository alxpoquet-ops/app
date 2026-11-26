<?php
/**
 * Les Minis Monstres Espace client : publier sur les réseaux depuis l'outil « Publier partout » (atelier « Les outils », Pépite).
 *
 * Le client présente Pépite une fois à ses comptes, puis tout part d'un seul bouton, sans quitter son espace.
 *  - Facebook (page) et Instagram (compte professionnel relié à la page) : par l'application Meta des Minis Monstres
 *    (identifiant et clé secrète dans les réglages de l'extension).
 *  - LinkedIn (profil) : par l'application LinkedIn des Minis Monstres (identifiant et clé secrète dans les réglages).
 *  - Bluesky et Mastodon : le client donne un mot de passe d'application ou un code. Aucune application à déclarer.
 *  - Mon site : une actualité publiée sur le site du client par son connecteur (actions « image » et « publier »).
 *  - La fiche Google n'a pas d'accès simple : elle passe toujours par son bouton (texte copié, photo, fiche ouverte).
 * Un réseau pas encore relié se publie avec son bouton du kit de publication (kit-publication.php et kit-publication.js) :
 * lien prérempli, ou fichier prêt et légende copiée, sans aucun accord de Meta, de TikTok ou de Google.
 * Les jetons d'accès restent dans la fiche du client (jamais affichés). La photo est gardée une heure (ou jusqu'à la
 * publication programmée), le temps que les réseaux la récupèrent, puis effacée.
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  Réglages et état
 * ========================================================================= */
function aled08e_rs_opt($k) { return trim((string) get_option('aled08_rs_' . $k, '')); }
function aled08e_rs_meta_ok() { return aled08e_rs_opt('meta_id') !== '' && aled08e_rs_opt('meta_secret') !== ''; }
/* Upload-Post : un service déjà validé par Meta, qui publie sur la page Facebook et le compte Instagram du client.
 * Alex colle sa clé dans les Réglages. Sans clé, Facebook et Instagram passent par leur bouton (texte copié). */
function aled08e_rs_up_ok() { return aled08e_rs_opt('uploadpost_key') !== ''; }
function aled08e_rs_linkedin_ok() { return aled08e_rs_opt('linkedin_id') !== '' && aled08e_rs_opt('linkedin_secret') !== ''; }
function aled08e_rs_retour($reseau) { return aled08e_url(['aled08e_rs' => $reseau]); }
/* Publier partout est-il ouvert pour ce client ? (abonnement ou essai de l'outil, atelier-outils.php) */
function aled08e_rs_ouvert($uid) {
    if (function_exists('aled08e_ao_actif')) return aled08e_ao_actif($uid, 'publier');
    return function_exists('aled08e_outils_on') && aled08e_outils_on();
}
/* Le site du client est relié à l'espace (connecteur) : Pépite peut y publier une actualité */
function aled08e_rs_site_ok($uid) { return aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== ''; }
/* Après une liaison (ou une erreur), retour sur l'outil Publier partout */
function aled08e_rs_revenir($uid, $ok, $texte) {
    set_transient('aled08_ao_flash_' . (int) $uid, [$ok, $texte], 300);
    // parti de l'application : on y revient
    if (get_transient('aled08_rs_depuis_' . (int) $uid) === 'appli' && function_exists('aled08e_appli_url')) { delete_transient('aled08_rs_depuis_' . (int) $uid); wp_safe_redirect(aled08e_appli_url(), 303); exit; }
    wp_safe_redirect(function_exists('aled08e_ao_url') ? aled08e_ao_url('publier') : aled08e_url() . '#outils', 303);
    exit;
}
function aled08e_rs_get($uid) { $c = get_user_meta($uid, 'aled08_rs', true); return is_array($c) ? $c : []; }
function aled08e_rs_set($uid, $c) { update_user_meta($uid, 'aled08_rs', $c); }
/* La page Facebook choisie (avec son compte Instagram, s'il y en a un) */
function aled08e_rs_page($c) {
    $pages = (array) ($c['meta']['pages'] ?? []);
    if (!$pages) return null;
    $i = (int) ($c['meta']['page'] ?? 0);
    return $pages[$i] ?? $pages[0];
}
/* Les réseaux où ce client peut publier directement : identifiant => nom du compte */
function aled08e_rs_relies($uid) {
    $c = aled08e_rs_get($uid);
    $r = [];
    if (!empty($c['bluesky']['did'])) $r['bluesky'] = '@' . $c['bluesky']['handle'];
    if (!empty($c['mastodon']['jeton'])) $r['mastodon'] = $c['mastodon']['nom'];
    $p = aled08e_rs_page($c);
    if ($p) {
        $r['facebook'] = $p['nom'];
        if (!empty($p['ig_id'])) $r['instagram'] = '@' . $p['ig_nom'];
    }
    // reliés par Upload-Post (quand l'application Meta des Minis Monstres n'a pas servi)
    foreach (['facebook', 'instagram'] as $x) if (!isset($r[$x]) && !empty($c['up']['comptes'][$x]) && aled08e_rs_up_ok()) $r[$x] = (string) $c['up']['comptes'][$x];
    if (!empty($c['linkedin']['jeton']) && (int) ($c['linkedin']['exp'] ?? 0) > time()) $r['linkedin'] = $c['linkedin']['nom'];
    return $r;
}

/* =========================================================================
 *  Appels aux réseaux
 * ========================================================================= */
/* $protege : l'adresse vient du client (serveur Mastodon) : pas de redirection suivie, pas d'adresse interne, pas de détail d'erreur renvoyé */
function aled08e_rs_http($methode, $url, $args = [], $protege = false) {
    $args += ['timeout' => 40, 'method' => $methode];
    if ($protege) $r = wp_safe_remote_request($url, ['redirection' => 0, 'reject_unsafe_urls' => true, 'limit_response_size' => 200000] + $args);
    else $r = wp_remote_request($url, $args);
    if (is_wp_error($r)) return new WP_Error('aled08_rs', 'Le réseau ne répond pas. Réessayez dans un instant.');
    $code = (int) wp_remote_retrieve_response_code($r);
    $corps = (string) wp_remote_retrieve_body($r);
    $j = json_decode($corps, true);
    if ($code >= 400) {
        $m = '';
        if (is_array($j)) $m = $j['error']['message'] ?? ($j['message'] ?? ($j['error_description'] ?? (is_string($j['error'] ?? null) ? $j['error'] : '')));
        return new WP_Error('aled08_rs', $m !== '' && !$protege ? mb_substr(wp_strip_all_tags((string) $m), 0, 300) : 'Le réseau a refusé (réponse ' . $code . ').', ['code' => $code]);
    }
    return ['code' => $code, 'json' => is_array($j) ? $j : [], 'headers' => wp_remote_retrieve_headers($r)];
}
function aled08e_rs_json($methode, $url, $donnees, $entetes = [], $protege = false) {
    return aled08e_rs_http($methode, $url, ['headers' => $entetes + ['Content-Type' => 'application/json'], 'body' => wp_json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)], $protege);
}

/* ---------- La photo : réduite, en JPEG, gardée une heure dans un dossier public (Facebook et Instagram viennent la chercher) ---------- */
function aled08e_rs_image($fichier, $garde = HOUR_IN_SECONDS) {
    if (empty($fichier['name'])) return null;
    if (!empty($fichier['error']) || empty($fichier['tmp_name']) || !is_uploaded_file($fichier['tmp_name'])) return new WP_Error('aled08_rs', 'Votre photo n’est pas arrivée (trop lourde, ou envoi coupé). Rien n’a été publié : réessayez avec une photo plus légère.');
    if ($fichier['size'] > 8 * 1024 * 1024) return new WP_Error('aled08_rs', 'Cette photo est trop lourde (8 Mo au plus).');
    $type = wp_check_filetype_and_ext($fichier['tmp_name'], $fichier['name']);
    if (!in_array($type['type'], ['image/jpeg', 'image/png', 'image/webp'], true)) return new WP_Error('aled08_rs', 'Choisissez une photo JPG, PNG ou WebP.');
    $up = wp_upload_dir();
    $dossier = trailingslashit($up['basedir']) . 'aled08-publications';
    if (!wp_mkdir_p($dossier)) return new WP_Error('aled08_rs', 'Impossible de préparer la photo.');
    if (!file_exists($dossier . '/index.html')) @file_put_contents($dossier . '/index.html', '');
    $nom = wp_generate_password(24, false, false) . '.jpg';
    $ed = wp_get_image_editor($fichier['tmp_name']);
    if (is_wp_error($ed)) return new WP_Error('aled08_rs', 'Cette photo ne peut pas être lue. Essayez-en une autre.');
    // moins de 1 Mo : c'est la limite de Bluesky, et c'est bien assez pour les autres réseaux
    foreach ([[1600, 85], [1280, 78], [1080, 68]] as $essai) {
        $e = wp_get_image_editor($fichier['tmp_name']);
        if (is_wp_error($e)) return new WP_Error('aled08_rs', 'Cette photo ne peut pas être lue. Essayez-en une autre.');
        if (method_exists($e, 'maybe_exif_rotate')) $e->maybe_exif_rotate(); // photo de téléphone prise en portrait
        $e->resize($essai[0], $essai[0], false);
        $e->set_quality($essai[1]);
        $s = $e->save($dossier . '/' . $nom, 'image/jpeg');
        if (is_wp_error($s) || empty($s['path'])) return new WP_Error('aled08_rs', 'Impossible de préparer la photo.');
        if (filesize($s['path']) < 950000) break;
    }
    wp_schedule_single_event(time() + max(HOUR_IN_SECONDS, (int) $garde), 'aled08_rs_nettoyer', [$s['path']]);
    return ['chemin' => $s['path'], 'url' => trailingslashit($up['baseurl']) . 'aled08-publications/' . basename($s['path']), 'mime' => 'image/jpeg'];
}
add_action('aled08_rs_nettoyer', function ($chemin) {
    $up = wp_upload_dir();
    $dossier = trailingslashit($up['basedir']) . 'aled08-publications/';
    if (is_string($chemin) && strpos($chemin, $dossier) === 0 && file_exists($chemin)) @unlink($chemin);
});

/* ---------- Bluesky ---------- */
function aled08e_rs_bluesky_session($identifiant, $mdp) {
    $r = aled08e_rs_json('POST', 'https://bsky.social/xrpc/com.atproto.server.createSession', ['identifier' => $identifiant, 'password' => $mdp]);
    if (is_wp_error($r)) return new WP_Error('aled08_rs', 'Bluesky refuse la connexion : vérifiez l’identifiant et le mot de passe d’application.');
    return $r['json'];
}
/* Hashtags et liens cliquables : Bluesky veut leur place en octets dans le texte */
function aled08e_rs_bluesky_facets($t) {
    $f = [];
    if (preg_match_all('/(?:^|\s)(#[\p{L}\p{N}_]+)/u', $t, $m, PREG_OFFSET_CAPTURE)) {
        foreach ($m[1] as $x) $f[] = ['index' => ['byteStart' => $x[1], 'byteEnd' => $x[1] + strlen($x[0])], 'features' => [['$type' => 'app.bsky.richtext.facet#tag', 'tag' => substr($x[0], 1)]]];
    }
    if (preg_match_all('/https?:\/\/[^\s]+/u', $t, $m, PREG_OFFSET_CAPTURE)) {
        foreach ($m[0] as $x) { $u = rtrim($x[0], '.,;:!?)'); $f[] = ['index' => ['byteStart' => $x[1], 'byteEnd' => $x[1] + strlen($u)], 'features' => [['$type' => 'app.bsky.richtext.facet#link', 'uri' => $u]]]; }
    }
    return $f;
}
function aled08e_rs_bluesky_publier($c, $texte, $image) {
    if (mb_strlen($texte) > 300) return new WP_Error('aled08_rs', 'Bluesky accepte 300 caractères : votre texte en fait ' . mb_strlen($texte) . '. Raccourcissez-le dans la case, puis publiez.');
    $s = aled08e_rs_bluesky_session($c['handle'], $c['mdp']);
    if (is_wp_error($s)) return $s;
    $auth = ['Authorization' => 'Bearer ' . $s['accessJwt']];
    $post = ['$type' => 'app.bsky.feed.post', 'text' => $texte, 'createdAt' => gmdate('Y-m-d\TH:i:s.000\Z'), 'langs' => ['fr']];
    $facets = aled08e_rs_bluesky_facets($texte);
    if ($facets) $post['facets'] = $facets;
    if ($image) {
        $b = aled08e_rs_http('POST', 'https://bsky.social/xrpc/com.atproto.repo.uploadBlob', ['headers' => $auth + ['Content-Type' => $image['mime']], 'body' => file_get_contents($image['chemin'])]);
        if (is_wp_error($b)) return $b;
        $post['embed'] = ['$type' => 'app.bsky.embed.images', 'images' => [['alt' => '', 'image' => $b['json']['blob']]]];
    }
    $r = aled08e_rs_json('POST', 'https://bsky.social/xrpc/com.atproto.repo.createRecord', ['repo' => $s['did'], 'collection' => 'app.bsky.feed.post', 'record' => $post], $auth);
    if (is_wp_error($r)) return $r;
    $rkey = basename((string) ($r['json']['uri'] ?? ''));
    return ['url' => 'https://bsky.app/profile/' . $s['handle'] . '/post/' . $rkey];
}

/* ---------- Mastodon ---------- */
function aled08e_rs_mastodon_publier($c, $texte, $image) {
    if (mb_strlen($texte) > 500) return new WP_Error('aled08_rs', 'Mastodon accepte 500 caractères : votre texte en fait ' . mb_strlen($texte) . '. Raccourcissez-le dans la case, puis publiez.');
    $auth = ['Authorization' => 'Bearer ' . $c['jeton']];
    $donnees = ['status' => $texte, 'language' => 'fr'];
    if ($image) {
        $sep = '----aled08' . wp_generate_password(16, false, false);
        $corps = "--$sep\r\nContent-Disposition: form-data; name=\"file\"; filename=\"photo.jpg\"\r\nContent-Type: " . $image['mime'] . "\r\n\r\n" . file_get_contents($image['chemin']) . "\r\n--$sep--\r\n";
        $m = aled08e_rs_http('POST', $c['instance'] . '/api/v2/media', ['headers' => $auth + ['Content-Type' => 'multipart/form-data; boundary=' . $sep], 'body' => $corps], true);
        if (is_wp_error($m)) return $m;
        if (!empty($m['json']['id'])) $donnees['media_ids'] = [(string) $m['json']['id']];
        if ($m['code'] === 202) sleep(2); // la photo est encore en traitement
    }
    $r = aled08e_rs_json('POST', $c['instance'] . '/api/v1/statuses', $donnees, $auth, true);
    if (is_wp_error($r)) return $r;
    $lien = esc_url_raw((string) ($r['json']['url'] ?? ''), ['https']);
    return ['url' => $lien !== '' ? $lien : $c['instance']];
}

/* ---------- Facebook (page) et Instagram (compte professionnel relié à la page) ---------- */
function aled08e_rs_facebook_publier($p, $texte, $image) {
    $base = 'https://graph.facebook.com/' . rawurlencode($p['id']);
    if ($image) $r = aled08e_rs_http('POST', $base . '/photos', ['body' => ['url' => $image['url'], 'caption' => $texte, 'access_token' => $p['jeton']]]);
    else $r = aled08e_rs_http('POST', $base . '/feed', ['body' => ['message' => $texte, 'access_token' => $p['jeton']]]);
    if (is_wp_error($r)) return $r;
    $id = (string) ($r['json']['post_id'] ?? ($r['json']['id'] ?? ''));
    return ['url' => $id !== '' ? 'https://www.facebook.com/' . $id : 'https://www.facebook.com/' . $p['id']];
}
function aled08e_rs_instagram_publier($p, $texte, $image) {
    if (!$image) return new WP_Error('aled08_rs', 'Instagram demande une photo : ajoutez-en une.');
    $base = 'https://graph.facebook.com/';
    $c = aled08e_rs_http('POST', $base . rawurlencode($p['ig_id']) . '/media', ['body' => ['image_url' => $image['url'], 'caption' => mb_substr($texte, 0, 2200), 'access_token' => $p['jeton']]]);
    if (is_wp_error($c)) return $c;
    $cid = (string) ($c['json']['id'] ?? '');
    if ($cid === '') return new WP_Error('aled08_rs', 'Instagram n’a pas accepté la photo.');
    // Instagram prépare la photo : on attend qu'elle soit prête (quelques secondes)
    for ($i = 0; $i < 6; $i++) {
        $e = aled08e_rs_http('GET', $base . rawurlencode($cid) . '?fields=status_code&access_token=' . rawurlencode($p['jeton']));
        if (is_wp_error($e) || ($e['json']['status_code'] ?? 'FINISHED') === 'FINISHED') break;
        if (($e['json']['status_code'] ?? '') === 'ERROR') return new WP_Error('aled08_rs', 'Instagram n’a pas pu préparer la photo. Essayez avec une autre.');
        sleep(2);
    }
    $r = aled08e_rs_http('POST', $base . rawurlencode($p['ig_id']) . '/media_publish', ['body' => ['creation_id' => $cid, 'access_token' => $p['jeton']]]);
    if (is_wp_error($r)) return $r;
    $lien = aled08e_rs_http('GET', $base . rawurlencode((string) ($r['json']['id'] ?? '')) . '?fields=permalink&access_token=' . rawurlencode($p['jeton']));
    return ['url' => !is_wp_error($lien) && !empty($lien['json']['permalink']) ? (string) $lien['json']['permalink'] : 'https://www.instagram.com/' . $p['ig_nom'] . '/'];
}

/* ---------- Upload-Post : Facebook et Instagram, sans attendre la validation de Meta ----------
 * Un « profil » par client chez Upload-Post, nommé d'après son numéro de compte chez nous (aucun nom, aucun e-mail).
 * Le client relie ses comptes sur la page de connexion d'Upload-Post ; nous ne recevons ni mot de passe ni jeton. */
function aled08e_rs_up_profil($uid) { return 'lmm-' . (int) $uid; }
function aled08e_rs_up_appel($methode, $chemin, $donnees = null) {
    $args = ['headers' => ['Authorization' => 'Apikey ' . aled08e_rs_opt('uploadpost_key')], 'timeout' => 70];
    if ($donnees !== null) { $args['headers']['Content-Type'] = 'application/json'; $args['body'] = wp_json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); }
    return aled08e_rs_http($methode, 'https://api.upload-post.com' . $chemin, $args);
}
/* Le profil existe (créé au besoin) */
function aled08e_rs_up_creer($uid) {
    $r = aled08e_rs_up_appel('POST', '/api/uploadposts/users', ['username' => aled08e_rs_up_profil($uid)]);
    if (is_wp_error($r) && (int) ($r->get_error_data()['code'] ?? 0) !== 409) return $r; // 409 : il existe déjà
    return true;
}
/* Les comptes que le client a reliés : ['facebook' => nom, 'instagram' => @nom], et la page Facebook */
function aled08e_rs_up_rafraichir($uid) {
    $r = aled08e_rs_up_appel('GET', '/api/uploadposts/users/' . rawurlencode(aled08e_rs_up_profil($uid)));
    if (is_wp_error($r)) return $r;
    $sa = (array) ($r['json']['profile']['social_accounts'] ?? []);
    $comptes = [];
    foreach (['facebook', 'instagram'] as $x) {
        $a = $sa[$x] ?? null;
        if (!is_array($a) || !$a || !empty($a['reauth_required'])) continue;
        $nom = (string) ($a['display_name'] ?? ($a['handle'] ?? ($a['username'] ?? '')));
        $nom = mb_substr(sanitize_text_field($nom), 0, 80);
        $comptes[$x] = $nom !== '' ? ($x === 'instagram' && $nom[0] !== '@' && !empty($a['handle']) ? '@' . ltrim((string) $a['handle'], '@') : $nom) : ($x === 'facebook' ? 'Votre page' : 'Votre compte');
    }
    $c = aled08e_rs_get($uid);
    $page = (string) ($c['up']['page'] ?? '');
    if (isset($comptes['facebook'])) {
        $p = aled08e_rs_up_appel('GET', '/api/uploadposts/facebook/pages?profile=' . rawurlencode(aled08e_rs_up_profil($uid)));
        $pages = is_wp_error($p) ? [] : (array) ($p['json']['pages'] ?? []);
        $ids = array_map(function ($x) { return (string) ($x['page_id'] ?? ''); }, $pages);
        if ($page === '' || !in_array($page, $ids, true)) $page = (string) ($ids[0] ?? '');
        foreach ($pages as $x) if ((string) ($x['page_id'] ?? '') === $page && !empty($x['page_name'])) $comptes['facebook'] = mb_substr(sanitize_text_field((string) $x['page_name']), 0, 80);
    }
    $c['up'] = ['comptes' => $comptes, 'page' => $page, 'maj' => time()];
    aled08e_rs_set($uid, $c);
    return $comptes;
}
/* Publier une photo et son texte sur Facebook ou Instagram */
function aled08e_rs_up_publier($uid, $reseau, $texte, $image) {
    if (!$image) return new WP_Error('aled08_rs', ($reseau === 'instagram' ? 'Instagram' : 'Facebook') . ' demande une photo : ajoutez-en une.');
    $c = aled08e_rs_get($uid);
    $champs = [['user', aled08e_rs_up_profil($uid)], ['platform[]', $reseau], ['photos[]', $image['url']], ['title', mb_substr($texte, 0, 2200)]];
    if ($reseau === 'facebook' && !empty($c['up']['page'])) $champs[] = ['facebook_page_id', (string) $c['up']['page']];
    $sep = '----aled08' . wp_generate_password(16, false, false);
    $corps = '';
    foreach ($champs as $ch) $corps .= "--$sep\r\nContent-Disposition: form-data; name=\"" . $ch[0] . "\"\r\n\r\n" . $ch[1] . "\r\n";
    $corps .= "--$sep--\r\n";
    // la même demande rejouée (connexion coupée) ne publie pas deux fois
    $cle = substr(hash('sha256', $uid . '|' . $reseau . '|' . $image['url'] . '|' . $texte), 0, 40);
    $r = aled08e_rs_http('POST', 'https://api.upload-post.com/api/upload_photos', ['headers' => ['Authorization' => 'Apikey ' . aled08e_rs_opt('uploadpost_key'), 'Content-Type' => 'multipart/form-data; boundary=' . $sep, 'Idempotency-Key' => $cle], 'body' => $corps, 'timeout' => 75]);
    if (is_wp_error($r)) {
        $code = (int) ($r->get_error_data()['code'] ?? 0);
        if ($code === 429) return new WP_Error('aled08_rs', 'Trop de publications pour l’instant. Réessayez un peu plus tard, ou utilisez le bouton du réseau.');
        return $r;
    }
    $j = $r['json'];
    // la publication a pris plus d'une minute : on attend sa fin (40 secondes au plus)
    $suivi = (string) ($j['request_id'] ?? '');
    if (empty($j['results']) && $suivi !== '') {
        for ($i = 0; $i < 8; $i++) {
            sleep(5);
            $e = aled08e_rs_up_appel('GET', '/api/uploadposts/status?request_id=' . rawurlencode($suivi));
            if (is_wp_error($e)) break;
            $j = $e['json'];
            if (in_array((string) ($j['status'] ?? ''), ['completed', 'failed'], true)) break;
        }
    }
    $res = $j['results'][$reseau] ?? null;
    if (!is_array($res) && isset($j['results']) && is_array($j['results'])) foreach ($j['results'] as $x) if (is_array($x) && ($x['platform'] ?? '') === $reseau) $res = $x;
    if (is_array($res) && (isset($res['success']) ? !$res['success'] : ($res['status'] ?? '') === 'failed')) {
        $m = mb_substr(wp_strip_all_tags((string) ($res['error'] ?? ($res['message'] ?? ''))), 0, 200);
        return new WP_Error('aled08_rs', ($reseau === 'instagram' ? 'Instagram' : 'Facebook') . ' a refusé la publication' . ($m !== '' ? ' : ' . $m : '.') );
    }
    $lien = is_array($res) ? esc_url_raw((string) ($res['url'] ?? ($res['post_url'] ?? '')), ['https']) : '';
    if ($lien === '' && is_array($res) && !empty($res['post_id']) && $reseau === 'facebook') $lien = 'https://www.facebook.com/' . rawurlencode((string) $res['post_id']);
    if (!is_array($res) && empty($j['success'])) return new WP_Error('aled08_rs', 'La publication n’a pas pu être confirmée. Regardez sur ' . ($reseau === 'instagram' ? 'Instagram' : 'Facebook') . ' avant de réessayer.');
    return ['url' => $lien !== '' ? $lien : ($reseau === 'instagram' ? 'https://www.instagram.com/' : 'https://www.facebook.com/')];
}
/* Ne plus publier : le profil est supprimé chez Upload-Post (les comptes y sont déliés) */
function aled08e_rs_up_oublier($uid) {
    if (aled08e_rs_up_ok()) aled08e_rs_up_appel('DELETE', '/api/uploadposts/users', ['username' => aled08e_rs_up_profil($uid)]);
    $c = aled08e_rs_get($uid);
    unset($c['up']);
    aled08e_rs_set($uid, $c);
}
add_action('delete_user', function ($uid) { $c = aled08e_rs_get((int) $uid); if (!empty($c['up'])) aled08e_rs_up_oublier((int) $uid); });

/* ---------- LinkedIn (profil) ---------- */
function aled08e_rs_linkedin_publier($c, $texte, $image) {
    $auth = ['Authorization' => 'Bearer ' . $c['jeton'], 'X-Restli-Protocol-Version' => '2.0.0'];
    $auteur = 'urn:li:person:' . $c['sub'];
    $contenu = ['shareCommentary' => ['text' => mb_substr($texte, 0, 2900)], 'shareMediaCategory' => 'NONE'];
    if ($image) {
        $u = aled08e_rs_json('POST', 'https://api.linkedin.com/v2/assets?action=registerUpload', ['registerUploadRequest' => [
            'recipes' => ['urn:li:digitalmediaRecipe:feedshare-image'], 'owner' => $auteur,
            'serviceRelationships' => [['relationshipType' => 'OWNER', 'identifier' => 'urn:li:userGeneratedContent']],
        ]], $auth);
        if (is_wp_error($u)) return $u;
        $ou = (string) ($u['json']['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl'] ?? '');
        $asset = (string) ($u['json']['value']['asset'] ?? '');
        if ($ou === '' || $asset === '') return new WP_Error('aled08_rs', 'LinkedIn n’a pas accepté la photo.');
        $e = aled08e_rs_http('PUT', $ou, ['headers' => ['Authorization' => 'Bearer ' . $c['jeton'], 'Content-Type' => $image['mime']], 'body' => file_get_contents($image['chemin'])]);
        if (is_wp_error($e)) return $e;
        $contenu['shareMediaCategory'] = 'IMAGE';
        $contenu['media'] = [['status' => 'READY', 'media' => $asset]];
    }
    $r = aled08e_rs_json('POST', 'https://api.linkedin.com/v2/ugcPosts', [
        'author' => $auteur, 'lifecycleState' => 'PUBLISHED',
        'specificContent' => ['com.linkedin.ugc.ShareContent' => $contenu],
        'visibility' => ['com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'],
    ], $auth);
    if (is_wp_error($r)) return $r;
    $id = (string) ($r['json']['id'] ?? '');
    return ['url' => $id !== '' ? 'https://www.linkedin.com/feed/update/' . $id . '/' : 'https://www.linkedin.com/feed/'];
}

/* ---------- Mon site : une actualité, par le connecteur du site du client ----------
 * La première ligne du texte est le titre (Pépite l'écrit ainsi), le reste est le texte de l'actualité. */
function aled08e_rs_site_publier($uid, $texte, $image) {
    $l = preg_split('/\n+/', trim((string) $texte), 2);
    $titre = trim(preg_replace('/^[#*\s]+|[*\s]+$/u', '', (string) ($l[0] ?? '')));
    $corps = trim((string) ($l[1] ?? ''));
    if ($corps === '') { $corps = $titre; $titre = wp_trim_words($titre, 10, '…'); }
    $titre = mb_substr($titre, 0, 90);
    if ($titre === '' || $corps === '') return new WP_Error('aled08_rs', 'Le texte pour votre site est vide.');
    $args = ['titre' => $titre, 'contenu' => wpautop(make_clickable(esc_html($corps)))];
    if ($image) {
        $im = aled08e_lia_appel($uid, 'image', ['url' => $image['url'], 'description' => $titre]);
        if (!is_wp_error($im) && !empty($im['image_id'])) $args['image_id'] = (int) $im['image_id'];
    }
    $r = aled08e_lia_appel($uid, 'publier', $args);
    if (is_wp_error($r) || empty($r['id'])) return new WP_Error('aled08_rs', 'Votre site n’a pas répondu. Réessayez dans un instant.');
    $lien = esc_url_raw((string) ($r['adresse'] ?? ''), ['http', 'https']);
    return ['url' => $lien !== '' ? $lien : esc_url_raw(aled08e_meta($uid, 'site'))];
}

/* Les réseaux où Pépite publie directement pour ce client (comptes reliés, plus son site s'il est relié) */
function aled08e_rs_directs($uid) {
    $r = aled08e_rs_relies($uid);
    if (aled08e_rs_site_ok($uid)) $r['site'] = 'Mon site';
    return $r;
}

/* Publier sur un réseau relié (ou sur le site). Rend ['url' => adresse de la publication] ou une WP_Error. */
function aled08e_rs_publier($uid, $reseau, $texte, $image) {
    $c = aled08e_rs_get($uid);
    $relies = aled08e_rs_directs($uid);
    if (!isset($relies[$reseau])) return new WP_Error('aled08_rs', 'Ce réseau n’est pas encore présenté à Pépite : utilisez son bouton dans la publication.');
    switch ($reseau) {
        case 'site': return aled08e_rs_site_publier($uid, $texte, $image);
        case 'bluesky': return aled08e_rs_bluesky_publier($c['bluesky'], $texte, $image);
        case 'mastodon': return aled08e_rs_mastodon_publier($c['mastodon'], $texte, $image);
        case 'facebook': $p = aled08e_rs_page($c); return $p ? aled08e_rs_facebook_publier($p, $texte, $image) : aled08e_rs_up_publier($uid, 'facebook', $texte, $image);
        case 'instagram': $p = aled08e_rs_page($c); return $p && !empty($p['ig_id']) ? aled08e_rs_instagram_publier($p, $texte, $image) : aled08e_rs_up_publier($uid, 'instagram', $texte, $image);
        case 'linkedin': return aled08e_rs_linkedin_publier($c['linkedin'], $texte, $image);
    }
    return new WP_Error('aled08_rs', 'Réseau inconnu.');
}

/* =========================================================================
 *  Relier et délier un compte
 * ========================================================================= */
add_action('wp_ajax_aled08e_rs', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_ao', '_ao', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    if (!aled08e_rs_ouvert($uid)) wp_send_json_error(['message' => 'Publier partout n’est pas actif sur votre compte.'], 403);
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) ($P['op'] ?? ''));
    $reseau = sanitize_key((string) ($P['reseau'] ?? ''));
    $c = aled08e_rs_get($uid);
    if ($op === 'delier') {
        $cle = in_array($reseau, ['facebook', 'instagram'], true) ? 'meta' : $reseau;
        if ($cle === 'meta' && empty($c['meta']) && !empty($c['up'])) { aled08e_rs_up_oublier($uid); wp_send_json_success(['message' => 'C’est fait : Pépite ne publie plus sur ces comptes.']); }
        unset($c[$cle]);
        aled08e_rs_set($uid, $c);
        wp_send_json_success(['message' => 'C’est fait : Pépite ne publie plus sur ce compte.']);
    }
    if ($op === 'page') { // choisir une autre page Facebook
        $i = (int) ($P['page'] ?? 0);
        if (isset($c['meta']['pages'][$i])) { $c['meta']['page'] = $i; aled08e_rs_set($uid, $c); }
        wp_send_json_success(['message' => 'Page choisie.']);
    }
    if ($op !== 'relier') wp_send_json_error(['message' => 'Action inconnue.'], 400);
    if (!aled08e_jl_quota($uid, 'aled08_rs_lier_', 12)) wp_send_json_error(['message' => 'Trop d’essais cette heure-ci. Réessayez dans un moment.'], 429);
    if ($reseau === 'bluesky') {
        $id = ltrim(strtolower(trim(sanitize_text_field((string) ($P['identifiant'] ?? '')))), '@');
        $mdp = trim((string) ($P['mdp'] ?? ''));
        if ($id === '' || $mdp === '') wp_send_json_error(['message' => 'Donnez votre identifiant Bluesky et un mot de passe d’application.'], 400);
        if (strpos($id, '.') === false && strpos($id, '@') === false) $id .= '.bsky.social';
        $s = aled08e_rs_bluesky_session($id, $mdp);
        if (is_wp_error($s)) wp_send_json_error(['message' => $s->get_error_message()], 400);
        $c['bluesky'] = ['handle' => (string) $s['handle'], 'did' => (string) $s['did'], 'mdp' => $mdp];
        aled08e_rs_set($uid, $c);
        wp_send_json_success(['message' => 'Pépite connaît maintenant votre Bluesky.']);
    }
    if ($reseau === 'mastodon') {
        $inst = strtolower(trim(sanitize_text_field((string) ($P['instance'] ?? ''))));
        $inst = preg_replace('#^https?://#', '', rtrim($inst, '/'));
        $jeton = trim(sanitize_text_field((string) ($P['jeton'] ?? '')));
        if (!preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $inst) || $jeton === '') wp_send_json_error(['message' => 'Donnez l’adresse de votre serveur Mastodon (par exemple mastodon.social) et votre code d’accès.'], 400);
        $v = aled08e_rs_http('GET', 'https://' . $inst . '/api/v1/accounts/verify_credentials', ['headers' => ['Authorization' => 'Bearer ' . $jeton], 'timeout' => 15], true);
        if (is_wp_error($v) || empty($v['json']['id'])) wp_send_json_error(['message' => 'Mastodon refuse ce code : vérifiez l’adresse du serveur et le code d’accès.'], 400);
        $c['mastodon'] = ['instance' => 'https://' . $inst, 'jeton' => $jeton, 'nom' => '@' . mb_substr(preg_replace('/[^A-Za-z0-9_.-]/', '', (string) ($v['json']['username'] ?? '')), 0, 40) . '@' . $inst];
        aled08e_rs_set($uid, $c);
        wp_send_json_success(['message' => 'Pépite connaît maintenant votre Mastodon.']);
    }
    wp_send_json_error(['message' => 'Ce réseau se relie avec son bouton.'], 400);
});

/* Départ vers Facebook ou LinkedIn, puis retour avec le code d'accord */
add_action('template_redirect', function () {
    if (empty($_GET['aled08e_rs']) || !is_user_logged_in()) return;
    $uid = get_current_user_id();
    $reseau = sanitize_key(wp_unslash($_GET['aled08e_rs']));
    if (!in_array($reseau, ['facebook', 'linkedin', 'uploadpost'], true)) return;
    $fin = function ($ok, $texte) use ($uid) { aled08e_rs_revenir($uid, $ok, $texte); };
    if (!empty($_GET['aller']) && sanitize_key(wp_unslash($_GET['depuis'] ?? '')) === 'appli') set_transient('aled08_rs_depuis_' . $uid, 'appli', HOUR_IN_SECONDS);
    if (!aled08e_rs_ouvert($uid)) $fin(false, 'Publier partout n’est pas actif sur votre compte.');
    if ($reseau === 'uploadpost') {
        if (!aled08e_rs_up_ok()) $fin(false, 'Ce réseau n’est pas encore ouvert à la liaison directe.');
        if (!empty($_GET['aller'])) {
            if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_n'] ?? '')), 'aled08e_rs_aller')) $fin(false, 'La page avait expiré. Réessayez.');
            if (!aled08e_jl_quota($uid, 'aled08_rs_lier_', 12)) $fin(false, 'Trop d’essais cette heure-ci. Réessayez dans un moment.');
            $cr = aled08e_rs_up_creer($uid);
            if (is_wp_error($cr)) $fin(false, 'La liaison n’a pas pu démarrer. Réessayez dans un instant.');
            $j = aled08e_rs_up_appel('POST', '/api/uploadposts/users/generate-jwt', [
                'username' => aled08e_rs_up_profil($uid), 'redirect_url' => aled08e_rs_retour('uploadpost'), 'platforms' => ['facebook', 'instagram'], 'language' => 'fr',
                'logo_image' => get_template_directory_uri() . '/assets/img/logo-512.png', 'connect_title' => 'Les Minis Monstres',
                'connect_description' => 'Reliez votre page Facebook et votre compte Instagram : Pépite y publiera vos photos.', 'redirect_button_text' => 'Revenir aux Minis Monstres', 'show_calendar' => false,
            ]);
            $url = is_wp_error($j) ? '' : esc_url_raw((string) ($j['json']['access_url'] ?? ''), ['https']);
            if ($url === '' || !preg_match('#^https://([a-z0-9-]+\.)?upload-post\.com/#', $url)) $fin(false, 'La liaison n’a pas pu démarrer. Réessayez dans un instant.');
            wp_redirect($url, 302); // phpcs:ignore -- adresse du service, vérifiée ci-dessus
            exit;
        }
        // retour : on relit les comptes reliés
        $comptes = aled08e_rs_up_rafraichir($uid);
        if (is_wp_error($comptes)) $fin(false, 'Je n’ai pas pu vérifier vos comptes. Rechargez la page dans un instant.');
        if (!$comptes) $fin(false, 'Aucun compte relié pour l’instant. Il faut une page Facebook (pas seulement un profil) et, pour Instagram, un compte professionnel.');
        $noms = [];
        if (isset($comptes['facebook'])) $noms[] = 'votre page Facebook « ' . $comptes['facebook'] . ' »';
        if (isset($comptes['instagram'])) $noms[] = 'votre Instagram ' . $comptes['instagram'];
        $fin(true, 'Pépite connaît maintenant ' . implode(' et ', $noms) . '.');
    }
    $retour = aled08e_rs_retour($reseau);
    $pret = $reseau === 'facebook' ? aled08e_rs_meta_ok() : aled08e_rs_linkedin_ok();
    if (!$pret) $fin(false, 'Ce réseau n’est pas encore ouvert à la liaison directe.');

    // 1. départ : on envoie le client donner son accord
    if (!empty($_GET['aller'])) {
        if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_n'] ?? '')), 'aled08e_rs_aller')) $fin(false, 'La page avait expiré. Réessayez.');
        $etat = wp_generate_password(24, false, false);
        set_transient('aled08_rs_etat_' . $uid, $etat, 15 * MINUTE_IN_SECONDS);
        if ($reseau === 'facebook') $url = 'https://www.facebook.com/dialog/oauth?' . http_build_query(['client_id' => aled08e_rs_opt('meta_id'), 'redirect_uri' => $retour, 'state' => $etat, 'response_type' => 'code', 'scope' => 'pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish']);
        else $url = 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query(['response_type' => 'code', 'client_id' => aled08e_rs_opt('linkedin_id'), 'redirect_uri' => $retour, 'state' => $etat, 'scope' => 'openid profile w_member_social']);
        wp_redirect($url, 302); // phpcs:ignore -- adresse fixe du réseau
        exit;
    }
    // 2. retour
    if (!empty($_GET['error'])) $fin(false, 'La liaison a été annulée.');
    if (empty($_GET['code'])) return;
    $etat = (string) get_transient('aled08_rs_etat_' . $uid);
    delete_transient('aled08_rs_etat_' . $uid);
    if ($etat === '' || !hash_equals($etat, sanitize_text_field(wp_unslash($_GET['state'] ?? '')))) $fin(false, 'La liaison a expiré. Réessayez.');
    $code = sanitize_text_field(wp_unslash($_GET['code']));
    $c = aled08e_rs_get($uid);

    if ($reseau === 'facebook') {
        $g = 'https://graph.facebook.com/';
        $t = aled08e_rs_http('GET', $g . 'oauth/access_token?' . http_build_query(['client_id' => aled08e_rs_opt('meta_id'), 'client_secret' => aled08e_rs_opt('meta_secret'), 'redirect_uri' => $retour, 'code' => $code]));
        if (is_wp_error($t)) $fin(false, 'Facebook a refusé la liaison : ' . $t->get_error_message());
        // jeton longue durée : les jetons de page qui en découlent n'expirent pas
        $l = aled08e_rs_http('GET', $g . 'oauth/access_token?' . http_build_query(['grant_type' => 'fb_exchange_token', 'client_id' => aled08e_rs_opt('meta_id'), 'client_secret' => aled08e_rs_opt('meta_secret'), 'fb_exchange_token' => (string) $t['json']['access_token']]));
        $jeton = !is_wp_error($l) && !empty($l['json']['access_token']) ? (string) $l['json']['access_token'] : (string) $t['json']['access_token'];
        $p = aled08e_rs_http('GET', $g . 'me/accounts?' . http_build_query(['fields' => 'id,name,access_token,instagram_business_account{id,username}', 'limit' => 50, 'access_token' => $jeton]));
        if (is_wp_error($p)) $fin(false, 'Facebook n’a pas donné vos pages : ' . $p->get_error_message());
        $pages = [];
        foreach ((array) ($p['json']['data'] ?? []) as $x) {
            if (empty($x['id']) || empty($x['access_token'])) continue;
            $pages[] = ['id' => (string) $x['id'], 'nom' => (string) ($x['name'] ?? 'Page'), 'jeton' => (string) $x['access_token'], 'ig_id' => (string) ($x['instagram_business_account']['id'] ?? ''), 'ig_nom' => (string) ($x['instagram_business_account']['username'] ?? '')];
        }
        if (!$pages) $fin(false, 'Aucune page Facebook trouvée. Il faut gérer une page (pas seulement un profil), et la cocher au moment de l’accord.');
        $c['meta'] = ['pages' => $pages, 'page' => 0];
        aled08e_rs_set($uid, $c);
        $fin(true, 'Pépite connaît maintenant votre page Facebook « ' . $pages[0]['nom'] . ' »' . ($pages[0]['ig_id'] ? ' et votre Instagram @' . $pages[0]['ig_nom'] : '. Pour Instagram, il faut un compte professionnel relié à cette page : en attendant, le bouton « Publier sur Instagram » marche très bien') . '.');
    }

    $t = aled08e_rs_http('POST', 'https://www.linkedin.com/oauth/v2/accessToken', ['body' => ['grant_type' => 'authorization_code', 'code' => $code, 'redirect_uri' => $retour, 'client_id' => aled08e_rs_opt('linkedin_id'), 'client_secret' => aled08e_rs_opt('linkedin_secret')]]);
    if (is_wp_error($t) || empty($t['json']['access_token'])) $fin(false, 'LinkedIn a refusé la liaison' . (is_wp_error($t) ? ' : ' . $t->get_error_message() : '.'));
    $moi = aled08e_rs_http('GET', 'https://api.linkedin.com/v2/userinfo', ['headers' => ['Authorization' => 'Bearer ' . $t['json']['access_token']]]);
    if (is_wp_error($moi) || empty($moi['json']['sub'])) $fin(false, 'LinkedIn n’a pas donné votre profil.');
    $c['linkedin'] = ['jeton' => (string) $t['json']['access_token'], 'sub' => (string) $moi['json']['sub'], 'nom' => (string) ($moi['json']['name'] ?? 'Votre profil'), 'exp' => time() + (int) ($t['json']['expires_in'] ?? 5184000) - DAY_IN_SECONDS];
    aled08e_rs_set($uid, $c);
    $fin(true, 'Pépite connaît maintenant votre LinkedIn (' . $c['linkedin']['nom'] . '). LinkedIn redemande votre accord tous les deux mois.');
}, 5);

/* =========================================================================
 *  Publier (depuis l'outil « Publier partout »)
 * ========================================================================= */
/* La photo est déposée une fois (réduite, en JPEG, dans un dossier public le temps que les réseaux la récupèrent) ;
 * chaque publication la retrouve par sa référence. Seules les photos de ce client sont retrouvées. */
function aled08e_rs_photo_deposer($uid, $fichier, $garde = HOUR_IN_SECONDS) {
    $im = aled08e_rs_image($fichier, $garde);
    if (!$im || is_wp_error($im)) return $im ?: new WP_Error('aled08_rs', 'Aucune photo reçue.');
    $ref = basename($im['chemin'], '.jpg');
    $l = get_user_meta($uid, 'aled08_rs_photos', true);
    $l = array_filter(is_array($l) ? $l : [], function ($p) { return (int) ($p['fin'] ?? 0) > time() && file_exists((string) ($p['chemin'] ?? '')); });
    $l[$ref] = $im + ['fin' => time() + max(HOUR_IN_SECONDS, (int) $garde)];
    update_user_meta($uid, 'aled08_rs_photos', array_slice($l, -30, null, true));
    return ['ref' => $ref] + $im;
}
function aled08e_rs_photo($uid, $ref) {
    $ref = preg_replace('/[^A-Za-z0-9]/', '', (string) $ref);
    if ($ref === '') return null;
    $l = get_user_meta($uid, 'aled08_rs_photos', true);
    $p = is_array($l) ? ($l[$ref] ?? null) : null;
    return $p && file_exists((string) $p['chemin']) ? $p : null;
}
function aled08e_rs_garder($uid, $reseau, $url, $texte) {
    $h = get_user_meta($uid, 'aled08_rs_histo', true);
    $h = is_array($h) ? $h : [];
    array_unshift($h, ['t' => time(), 'r' => $reseau, 'u' => $url, 'x' => mb_substr((string) $texte, 0, 80)]);
    update_user_meta($uid, 'aled08_rs_histo', array_slice($h, 0, 30));
}
add_action('wp_ajax_aled08e_rs_photo', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_ao', '_ao', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    if (!aled08e_rs_ouvert($uid)) wp_send_json_error(['message' => 'Publier partout n’est pas actif sur votre compte.'], 403);
    if (!aled08e_jl_quota($uid, 'aled08_rs_ph_', 40)) wp_send_json_error(['message' => 'Beaucoup de photos cette heure-ci. Réessayez dans un moment.'], 429);
    $p = aled08e_rs_photo_deposer($uid, $_FILES['image'] ?? []);
    if (is_wp_error($p)) wp_send_json_error(['message' => $p->get_error_message()], 400);
    wp_send_json_success(['photo' => $p['ref']]);
});
add_action('wp_ajax_aled08e_publier', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_ao', '_ao', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    if (!aled08e_rs_ouvert($uid)) wp_send_json_error(['message' => 'Publier partout n’est pas actif sur votre compte.'], 403);
    $reseau = sanitize_key(wp_unslash($_POST['reseau'] ?? ''));
    // le texte part tel quel vers le réseau (« <3 », « -50 % », un lien avec des accents) : on retire seulement ce qui n'est pas du texte
    $texte = aled08e_jl_texte(is_scalar($_POST['texte'] ?? '') ? wp_unslash($_POST['texte'] ?? '') : '');
    if ($texte === '') wp_send_json_error(['message' => 'Le texte est vide.'], 400);
    if (mb_strlen($texte) > 5000) wp_send_json_error(['message' => 'Ce texte est trop long pour une publication.'], 400);
    if (!aled08e_jl_quota($uid, 'aled08_rs_nb_', 30)) wp_send_json_error(['message' => 'Vous avez beaucoup publié cette heure-ci. Réessayez dans un moment.'], 429);
    $image = null;
    $ref = sanitize_text_field(wp_unslash($_POST['photo'] ?? ''));
    if ($ref !== '') {
        $image = aled08e_rs_photo($uid, $ref);
        if (!$image) wp_send_json_error(['message' => 'La photo n’est plus là. Rechargez la page et rajoutez-la.'], 400);
    }
    @set_time_limit(120);
    $r = aled08e_rs_publier($uid, $reseau, $texte, $image);
    if (is_wp_error($r)) wp_send_json_error(['message' => $r->get_error_message()], 400);
    aled08e_rs_garder($uid, $reseau, $r['url'], $texte);
    wp_send_json_success(['url' => $r['url']]);
});

/* =========================================================================
 *  « Mes réseaux » : ce que le client voit dans l'outil
 * ========================================================================= */
function aled08e_rs_noms() {
    $n = ['instagram' => 'Instagram', 'facebook' => 'Facebook', 'google' => 'Fiche Google', 'linkedin' => 'LinkedIn', 'site' => 'Mon site', 'bluesky' => 'Bluesky', 'mastodon' => 'Mastodon'];
    if (function_exists('aled08e_kit_defs')) foreach (aled08e_kit_defs() as $id => $d) $n += [$id => $d['nom']];
    return $n;
}
/* « Mes réseaux » : présenter Pépite à ses comptes, une seule fois. Sans liaison, le bouton du réseau fait le travail. */
function aled08e_rs_html($uid) {
    $relies = aled08e_rs_relies($uid);
    $c = aled08e_rs_get($uid);
    $ici = function_exists('aled08e_appli_ici') && aled08e_appli_ici() ? ['depuis' => 'appli'] : [];
    $aller = function ($r) use ($ici) { return esc_url(add_query_arg(['aled08e_rs' => $r, 'aller' => 1, '_n' => wp_create_nonce('aled08e_rs_aller')] + $ici, aled08e_url())); };
    $ligne = function ($nom, $droite, $on = false) { return '<li class="rs-ligne' . ($on ? ' is-on' : '') . '"><strong>' . esc_html($nom) . '</strong>' . $droite . '</li>'; };
    $compte = function ($id) use ($relies) { return '<span class="rs-compte">' . aled08e_icon('check') . esc_html($relies[$id]) . '</span>'; };
    $delier = function ($id) { return '<button type="button" class="link-btn" data-rs-delier="' . esc_attr($id) . '">Ne plus publier ici</button>'; };
    $nb = count($relies) + (aled08e_rs_site_ok($uid) ? 1 : 0);
    $h = '<details class="rs ao-reseaux"' . (isset($_GET['aled08e_rs']) || ($ici && !$relies) ? ' open' : '') . '><summary>' . aled08e_icon('link') . '<span>Mes réseaux' . ($nb ? ' : Pépite en connaît ' . $nb : '') . '</span></summary>'
        . '<p class="app-note">Présentez Pépite une seule fois à un compte : ensuite, elle y publie toute seule. Un réseau pas présenté marche aussi, avec son bouton : le texte et le bon fichier sont prêts, il reste un geste.</p><ul class="rs-liste">';
    // Facebook et Instagram : un seul accord chez Meta donne les deux
    if (isset($relies['facebook'])) {
        $h .= $ligne('Facebook', $compte('facebook') . $delier('facebook'), true);
        $parUp = empty($c['meta']) && aled08e_rs_up_ok();
        $h .= $ligne('Instagram', isset($relies['instagram']) ? $compte('instagram') : ($parUp ? '<a class="btn btn-light btn-sm" href="' . $aller('uploadpost') . '">' . aled08e_icon('send') . '<span>Ajouter mon Instagram</span></a>' : '<span class="rs-bientot">Pour publier directement, il faut un compte Instagram professionnel relié à votre page Facebook. En attendant, le bouton « Publier sur Instagram » marche très bien.</span>'), isset($relies['instagram']));
    } elseif (isset($relies['instagram'])) { // Instagram seul, par Upload-Post
        $h .= $ligne('Instagram', $compte('instagram') . $delier('instagram'), true);
        if (aled08e_rs_up_ok()) $h .= '<li class="rs-ligne"><a class="btn btn-light btn-sm" href="' . $aller('uploadpost') . '">' . aled08e_icon('send') . '<span>Ajouter ma page Facebook</span></a></li>';
    } elseif (aled08e_rs_meta_ok()) {
        $h .= '<li class="rs-ligne"><a class="btn btn-light btn-sm" href="' . $aller('facebook') . '">' . aled08e_icon('send') . '<span>Présenter Pépite à mon Instagram et mon Facebook</span></a></li>';
    } elseif (aled08e_rs_up_ok()) {
        $h .= '<li class="rs-ligne"><a class="btn btn-primary btn-sm" href="' . $aller('uploadpost') . '">' . aled08e_icon('send') . '<span>Relier mon Facebook et mon Instagram</span></a><small class="ol-aide">Une seule fois. La liaison se fait sur la page sécurisée de notre partenaire Upload-Post : nous ne voyons jamais votre mot de passe.</small></li>';
    }
    if (isset($relies['linkedin'])) $h .= $ligne('LinkedIn', $compte('linkedin') . $delier('linkedin'), true);
    elseif (aled08e_rs_linkedin_ok()) $h .= '<li class="rs-ligne"><a class="btn btn-light btn-sm" href="' . $aller('linkedin') . '">' . aled08e_icon('send') . '<span>Présenter Pépite à mon LinkedIn</span></a></li>';
    $h .= $ligne('Fiche Google', '<span class="rs-bientot">Avec son bouton : le texte est copié et votre fiche s’ouvre.</span>');
    $h .= $ligne('TikTok, YouTube, X, Threads, Pinterest, WhatsApp', '<span class="rs-bientot">Avec leur bouton : la vidéo ou la photo au bon format, le texte déjà rempli ou copié.</span>');
    $h .= $ligne('Mon site', aled08e_rs_site_ok($uid) ? '<span class="rs-compte">' . aled08e_icon('check') . 'Pépite y publie une actualité</span>' : '<span class="rs-bientot">Pour les sites faits par Les Minis Monstres.</span>', aled08e_rs_site_ok($uid));
    foreach (['bluesky' => 'Bluesky', 'mastodon' => 'Mastodon'] as $id => $nom) if (isset($relies[$id])) $h .= $ligne($nom, $compte($id) . $delier($id), true);
    $h .= '</ul>';
    if (!isset($relies['bluesky']) || !isset($relies['mastodon'])) {
        $h .= '<details class="rs-form ao-autres"><summary class="link-btn">Vous êtes aussi sur Bluesky ou Mastodon ?</summary>';
        if (!isset($relies['bluesky'])) $h .= '<form data-rs-relier="bluesky"><div class="field"><label for="rs-bs-id">Votre identifiant Bluesky</label><input id="rs-bs-id" type="text" name="identifiant" placeholder="votrenom.bsky.social" autocomplete="off" required></div>'
            . '<div class="field"><label for="rs-bs-mdp">Un mot de passe d’application</label><input id="rs-bs-mdp" type="password" name="mdp" placeholder="xxxx-xxxx-xxxx-xxxx" autocomplete="off" required><small class="ol-aide">À créer dans Bluesky : Paramètres, Confidentialité et sécurité, Mots de passe d’application. Ce n’est pas votre mot de passe habituel.</small></div>'
            . '<button class="btn btn-primary btn-sm" type="submit">Présenter Pépite à mon Bluesky</button><p class="ol-etat" data-rs-etat role="status"></p></form>';
        if (!isset($relies['mastodon'])) $h .= '<form data-rs-relier="mastodon"><div class="field"><label for="rs-ma-i">L’adresse de votre serveur Mastodon</label><input id="rs-ma-i" type="text" name="instance" placeholder="mastodon.social" autocomplete="off" required></div>'
            . '<div class="field"><label for="rs-ma-j">Votre code d’accès</label><input id="rs-ma-j" type="password" name="jeton" autocomplete="off" required><small class="ol-aide">À créer dans Mastodon : Préférences, Développement, Nouvelle application. Cochez « write:statuses » et « write:media », puis copiez le long code que Mastodon affiche.</small></div>'
            . '<button class="btn btn-primary btn-sm" type="submit">Présenter Pépite à mon Mastodon</button><p class="ol-etat" data-rs-etat role="status"></p></form>';
        $h .= '</details>';
    }
    $pages = (array) ($c['meta']['pages'] ?? []);
    if (count($pages) > 1) {
        $h .= '<div class="field rs-page"><label for="rs-page">Votre page Facebook</label><select id="rs-page" data-rs-page>';
        foreach ($pages as $i => $p) $h .= '<option value="' . (int) $i . '"' . ((int) ($c['meta']['page'] ?? 0) === $i ? ' selected' : '') . '>' . esc_html($p['nom']) . '</option>';
        $h .= '</select></div>';
    }
    $histo = get_user_meta($uid, 'aled08_rs_histo', true);
    $noms = aled08e_rs_noms();
    if (is_array($histo) && $histo) {
        $h .= '<details class="rs-histo"><summary>Mes dernières publications</summary><ul>';
        foreach (array_slice($histo, 0, 8) as $l) $h .= '<li><a href="' . esc_url($l['u']) . '" target="_blank" rel="noopener">' . esc_html(($noms[$l['r']] ?? $l['r']) . ' : ' . $l['x']) . '</a> <small>' . esc_html(wp_date('j F', (int) $l['t'])) . '</small></li>';
        $h .= '</ul></details>';
    }
    return $h . '</details>';
}

/* =========================================================================
 *  Réglages (gestion) : les deux applications à déclarer une fois
 * ========================================================================= */
function aled08e_rs_reglages_html() {
    $m = function ($k) { $v = aled08e_rs_opt($k); return $v === '' ? 'aucune' : 'enregistrée, se termine par ' . substr($v, -4); };
    echo '<h2>Publier sur les réseaux (outil « Publier partout »)</h2>';
    echo '<p>Bluesky et Mastodon marchent sans rien régler ici : chaque client relie son compte dans son espace. Pour Facebook, Instagram et LinkedIn, il faut déclarer une fois l’application des Minis Monstres chez le réseau, puis coller ici son identifiant et sa clé secrète. Tant que c’est vide, le client publie avec le bouton de chaque réseau (lien prérempli, ou fichier prêt, légende copiée et réseau ouvert).</p>';
    echo '<table class="form-table" role="presentation">';
    echo '<tr><th>Facebook et Instagram (Meta)</th><td><p><label>Identifiant de l’application <input type="text" name="rs_meta_id" class="regular-text" value="' . esc_attr(aled08e_rs_opt('meta_id')) . '" autocomplete="off"></label></p>'
        . '<p><label>Clé secrète <input type="password" name="rs_meta_secret" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($m('meta_secret')) . '. Laissez vide pour ne rien changer.</span></p>'
        . '<p class="description">Sur developers.facebook.com : créer une application de type « Entreprise », ajouter « Facebook Login », et dans ses réglages coller cette adresse de retour : <code>' . esc_html(aled08e_rs_retour('facebook')) . '</code>. Autorisations à demander en « accès avancé » : pages_show_list, pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish. Meta demande de vérifier l’entreprise (SIRET) avant d’ouvrir l’application aux clients.</p></td></tr>';
    echo '<tr><th>Facebook et Instagram, par Upload-Post</th><td><p><label>Clé Upload-Post <input type="password" name="rs_uploadpost_key" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($m('uploadpost_key')) . '. Laissez vide pour ne rien changer.</span></p>'
        . '<p><label><input type="checkbox" name="rs_uploadpost_effacer" value="1"> Effacer la clé</label></p>'
        . '<p class="description">Le plus rapide : Upload-Post est déjà validé par Meta. Créez un compte sur upload-post.com, copiez la clé (API Keys) et collez-la ici. Chaque client relie ensuite sa page Facebook et son Instagram depuis l’application, sur la page de connexion d’Upload-Post. L’application Meta ci-dessus n’est alors plus nécessaire.</p></td></tr>';
    echo '<tr><th>LinkedIn</th><td><p><label>Identifiant client <input type="text" name="rs_linkedin_id" class="regular-text" value="' . esc_attr(aled08e_rs_opt('linkedin_id')) . '" autocomplete="off"></label></p>'
        . '<p><label>Clé secrète <input type="password" name="rs_linkedin_secret" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($m('linkedin_secret')) . '. Laissez vide pour ne rien changer.</span></p>'
        . '<p class="description">Sur linkedin.com/developers : créer une application, ajouter les produits « Share on LinkedIn » et « Sign In with LinkedIn using OpenID Connect » (ouverts tout de suite), et coller cette adresse de retour : <code>' . esc_html(aled08e_rs_retour('linkedin')) . '</code>. Le client publie sur son profil.</p></td></tr>';
    echo '</table>';
}
function aled08e_rs_reglages_save($P) {
    foreach (['meta_id', 'linkedin_id'] as $k) if (isset($P['rs_' . $k])) aled08e_option_set('aled08_rs_' . $k, preg_replace('/[^A-Za-z0-9_-]/', '', (string) $P['rs_' . $k]));
    foreach (['meta_secret', 'linkedin_secret', 'uploadpost_key'] as $k) { $v = trim((string) ($P['rs_' . $k] ?? '')); if ($v !== '') aled08e_option_set('aled08_rs_' . $k, preg_replace('/[^A-Za-z0-9_=.-]/', '', $v)); }
    if (!empty($P['rs_uploadpost_effacer'])) delete_option('aled08_rs_uploadpost_key');
}
