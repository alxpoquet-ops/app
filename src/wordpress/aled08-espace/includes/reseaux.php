<?php
/**
 * Alex & Co Espace client : publier sur les réseaux sociaux depuis l'espace client (outil « Publier partout »).
 *
 * Le client relie ses comptes une fois, puis publie une photo et un texte sur chacun, sans quitter son espace.
 *  - Bluesky et Mastodon : le client donne un mot de passe d'application ou un jeton. Aucune application à déclarer.
 *  - Facebook (page) et Instagram (compte professionnel relié à la page) : par l'application Meta d'Alex & Co
 *    (identifiant et clé secrète dans les réglages de l'extension).
 *  - LinkedIn (profil) : par l'application LinkedIn d'Alex & Co (identifiant et clé secrète dans les réglages).
 * Les jetons d'accès restent dans la fiche du client (jamais affichés). La photo est gardée une heure, le temps
 * que les réseaux la récupèrent, puis effacée. Publier ne coûte aucun Jeton Lia : seul le texte écrit par Lia en coûte.
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  Réglages et état
 * ========================================================================= */
function aled08e_rs_opt($k) { return trim((string) get_option('aled08_rs_' . $k, '')); }
function aled08e_rs_meta_ok() { return aled08e_rs_opt('meta_id') !== '' && aled08e_rs_opt('meta_secret') !== ''; }
function aled08e_rs_linkedin_ok() { return aled08e_rs_opt('linkedin_id') !== '' && aled08e_rs_opt('linkedin_secret') !== ''; }
function aled08e_rs_retour($reseau) { return aled08e_url(['aled08e_rs' => $reseau]); }
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
function aled08e_rs_image($fichier) {
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
    wp_schedule_single_event(time() + HOUR_IN_SECONDS, 'aled08_rs_nettoyer', [$s['path']]);
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

/* Publier sur un réseau relié. Rend ['url' => adresse de la publication] ou une WP_Error. */
function aled08e_rs_publier($uid, $reseau, $texte, $image) {
    $c = aled08e_rs_get($uid);
    $relies = aled08e_rs_relies($uid);
    if (!isset($relies[$reseau])) return new WP_Error('aled08_rs', 'Ce réseau n’est pas relié.');
    switch ($reseau) {
        case 'bluesky': return aled08e_rs_bluesky_publier($c['bluesky'], $texte, $image);
        case 'mastodon': return aled08e_rs_mastodon_publier($c['mastodon'], $texte, $image);
        case 'facebook': return aled08e_rs_facebook_publier(aled08e_rs_page($c), $texte, $image);
        case 'instagram': return aled08e_rs_instagram_publier(aled08e_rs_page($c), $texte, $image);
        case 'linkedin': return aled08e_rs_linkedin_publier($c['linkedin'], $texte, $image);
    }
    return new WP_Error('aled08_rs', 'Réseau inconnu.');
}

/* =========================================================================
 *  Relier et délier un compte
 * ========================================================================= */
add_action('wp_ajax_aled08e_rs', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_jl', '_aled08e_jl', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) ($P['op'] ?? ''));
    $reseau = sanitize_key((string) ($P['reseau'] ?? ''));
    $c = aled08e_rs_get($uid);
    if ($op === 'delier') {
        $cle = in_array($reseau, ['facebook', 'instagram'], true) ? 'meta' : $reseau;
        unset($c[$cle]);
        aled08e_rs_set($uid, $c);
        wp_send_json_success(['message' => 'Compte délié.']);
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
        wp_send_json_success(['message' => 'Bluesky est relié.']);
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
        wp_send_json_success(['message' => 'Mastodon est relié.']);
    }
    wp_send_json_error(['message' => 'Ce réseau se relie avec son bouton.'], 400);
});

/* Départ vers Facebook ou LinkedIn, puis retour avec le code d'accord */
add_action('template_redirect', function () {
    if (empty($_GET['aled08e_rs']) || !is_user_logged_in()) return;
    $uid = get_current_user_id();
    $reseau = sanitize_key(wp_unslash($_GET['aled08e_rs']));
    if (!in_array($reseau, ['facebook', 'linkedin'], true)) return;
    $fin = function ($ok, $texte) use ($uid) { set_transient('aled08_jl_flash_' . $uid, [$ok, $texte], 120); wp_safe_redirect(aled08e_url(['ol' => 'publier']) . '#outils', 303); exit; };
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
        $fin(true, 'Facebook est relié : page « ' . $pages[0]['nom'] . ' »' . ($pages[0]['ig_id'] ? ', avec Instagram @' . $pages[0]['ig_nom'] : '. Pour Instagram, il faut un compte professionnel relié à cette page') . '.');
    }

    $t = aled08e_rs_http('POST', 'https://www.linkedin.com/oauth/v2/accessToken', ['body' => ['grant_type' => 'authorization_code', 'code' => $code, 'redirect_uri' => $retour, 'client_id' => aled08e_rs_opt('linkedin_id'), 'client_secret' => aled08e_rs_opt('linkedin_secret')]]);
    if (is_wp_error($t) || empty($t['json']['access_token'])) $fin(false, 'LinkedIn a refusé la liaison' . (is_wp_error($t) ? ' : ' . $t->get_error_message() : '.'));
    $moi = aled08e_rs_http('GET', 'https://api.linkedin.com/v2/userinfo', ['headers' => ['Authorization' => 'Bearer ' . $t['json']['access_token']]]);
    if (is_wp_error($moi) || empty($moi['json']['sub'])) $fin(false, 'LinkedIn n’a pas donné votre profil.');
    $c['linkedin'] = ['jeton' => (string) $t['json']['access_token'], 'sub' => (string) $moi['json']['sub'], 'nom' => (string) ($moi['json']['name'] ?? 'Votre profil'), 'exp' => time() + (int) ($t['json']['expires_in'] ?? 5184000) - DAY_IN_SECONDS];
    aled08e_rs_set($uid, $c);
    $fin(true, 'LinkedIn est relié : ' . $c['linkedin']['nom'] . '. LinkedIn redemande votre accord tous les deux mois.');
}, 5);

/* =========================================================================
 *  Publier (depuis l'outil « Publier partout »)
 * ========================================================================= */
add_action('wp_ajax_aled08e_publier', function () {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_jl', '_aled08e_jl', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    $reseau = sanitize_key(wp_unslash($_POST['reseau'] ?? ''));
    // le texte part tel quel vers le réseau (« <3 », « -50 % », un lien avec des accents) : on retire seulement ce qui n'est pas du texte
    $texte = aled08e_jl_texte(is_scalar($_POST['texte'] ?? '') ? wp_unslash($_POST['texte'] ?? '') : '');
    if ($texte === '') wp_send_json_error(['message' => 'Le texte est vide.'], 400);
    if (mb_strlen($texte) > 5000) wp_send_json_error(['message' => 'Ce texte est trop long pour une publication.'], 400);
    if (!aled08e_jl_quota($uid, 'aled08_rs_nb_', 30)) wp_send_json_error(['message' => 'Vous avez beaucoup publié cette heure-ci. Réessayez dans un moment.'], 429);
    $image = null;
    if (!empty($_FILES['image']['name'])) {
        $image = aled08e_rs_image($_FILES['image']);
        if (is_wp_error($image)) wp_send_json_error(['message' => $image->get_error_message()], 400);
    }
    @set_time_limit(120);
    $r = aled08e_rs_publier($uid, $reseau, $texte, $image);
    if (is_wp_error($r)) wp_send_json_error(['message' => $r->get_error_message()], 400);
    $h = get_user_meta($uid, 'aled08_rs_histo', true);
    $h = is_array($h) ? $h : [];
    array_unshift($h, ['t' => time(), 'r' => $reseau, 'u' => $r['url'], 'x' => mb_substr($texte, 0, 80)]);
    update_user_meta($uid, 'aled08_rs_histo', array_slice($h, 0, 30));
    wp_send_json_success(['url' => $r['url']]);
});

/* =========================================================================
 *  « Mes réseaux » : ce que le client voit dans l'outil
 * ========================================================================= */
function aled08e_rs_noms() { return ['facebook' => 'Facebook', 'instagram' => 'Instagram', 'linkedin' => 'LinkedIn', 'bluesky' => 'Bluesky', 'mastodon' => 'Mastodon']; }
function aled08e_rs_html($uid) {
    $relies = aled08e_rs_relies($uid);
    $c = aled08e_rs_get($uid);
    $noms = aled08e_rs_noms();
    $aller = function ($r) { return esc_url(add_query_arg(['aled08e_rs' => $r, 'aller' => 1, '_n' => wp_create_nonce('aled08e_rs_aller')], home_url('/mon-espace/'))); };
    $h = '<div class="rs" data-rs><p class="app-sub">' . aled08e_icon('link') . 'Mes réseaux</p>'
        . '<p class="app-note">Reliez un compte une fois : ensuite, un bouton suffit pour y publier. Pour les autres réseaux (Facebook, Instagram, LinkedIn…), le texte est copié et le réseau s’ouvre : il reste à coller.</p><ul class="rs-liste">';
    foreach ($noms as $id => $nom) {
        // un réseau dont l'application n'est pas déclarée dans les réglages n'est pas montré : il reste le copier-coller
        if (!isset($relies[$id]) && in_array($id, ['facebook', 'instagram'], true) && !aled08e_rs_meta_ok()) continue;
        if (!isset($relies[$id]) && $id === 'linkedin' && !aled08e_rs_linkedin_ok()) continue;
        $h .= '<li class="rs-ligne' . (isset($relies[$id]) ? ' is-on' : '') . '"><strong>' . esc_html($nom) . '</strong>';
        if (isset($relies[$id])) {
            $h .= '<span class="rs-compte">' . aled08e_icon('check') . esc_html($relies[$id]) . '</span>';
            if ($id !== 'instagram') $h .= '<button type="button" class="link-btn" data-rs-delier="' . esc_attr($id) . '">Délier</button>';
        } elseif ($id === 'facebook') {
            $h .= aled08e_rs_meta_ok() ? '<a class="btn btn-light btn-sm" href="' . $aller('facebook') . '">Relier ma page</a>' : '<span class="rs-bientot">Liaison directe bientôt</span>';
        } elseif ($id === 'instagram') {
            $h .= '<span class="rs-bientot">' . (isset($relies['facebook']) ? 'Il faut un compte Instagram professionnel relié à votre page Facebook' : (aled08e_rs_meta_ok() ? 'Se relie avec votre page Facebook' : 'Liaison directe bientôt')) . '</span>';
        } elseif ($id === 'linkedin') {
            $h .= aled08e_rs_linkedin_ok() ? '<a class="btn btn-light btn-sm" href="' . $aller('linkedin') . '">Relier mon profil</a>' : '<span class="rs-bientot">Liaison directe bientôt</span>';
        } elseif ($id === 'bluesky') {
            $h .= '<details class="rs-form"><summary class="btn btn-light btn-sm">Relier</summary><form data-rs-relier="bluesky"><div class="field"><label for="rs-bs-id">Votre identifiant Bluesky</label><input id="rs-bs-id" type="text" name="identifiant" placeholder="votrenom.bsky.social" autocomplete="off" required></div>'
                . '<div class="field"><label for="rs-bs-mdp">Un mot de passe d’application</label><input id="rs-bs-mdp" type="password" name="mdp" placeholder="xxxx-xxxx-xxxx-xxxx" autocomplete="off" required><small class="ol-aide">À créer dans Bluesky : Paramètres, Confidentialité et sécurité, Mots de passe d’application. Ce n’est pas votre mot de passe habituel.</small></div>'
                . '<button class="btn btn-primary btn-sm" type="submit">Relier Bluesky</button><p class="ol-etat" data-rs-etat role="status"></p></form></details>';
        } elseif ($id === 'mastodon') {
            $h .= '<details class="rs-form"><summary class="btn btn-light btn-sm">Relier</summary><form data-rs-relier="mastodon"><div class="field"><label for="rs-ma-i">L’adresse de votre serveur</label><input id="rs-ma-i" type="text" name="instance" placeholder="mastodon.social" autocomplete="off" required></div>'
                . '<div class="field"><label for="rs-ma-j">Votre code d’accès</label><input id="rs-ma-j" type="password" name="jeton" autocomplete="off" required><small class="ol-aide">À créer dans Mastodon : Préférences, Développement, Nouvelle application. Cochez « write:statuses » et « write:media », puis copiez le code que Mastodon affiche sous « Votre jeton d’accès ».</small></div>'
                . '<button class="btn btn-primary btn-sm" type="submit">Relier Mastodon</button><p class="ol-etat" data-rs-etat role="status"></p></form></details>';
        }
        $h .= '</li>';
    }
    $h .= '</ul>';
    $pages = (array) ($c['meta']['pages'] ?? []);
    if (count($pages) > 1) {
        $h .= '<div class="field rs-page"><label for="rs-page">Votre page Facebook</label><select id="rs-page" data-rs-page>';
        foreach ($pages as $i => $p) $h .= '<option value="' . (int) $i . '"' . ((int) ($c['meta']['page'] ?? 0) === $i ? ' selected' : '') . '>' . esc_html($p['nom']) . '</option>';
        $h .= '</select></div>';
    }
    $histo = get_user_meta($uid, 'aled08_rs_histo', true);
    if (is_array($histo) && $histo) {
        $h .= '<details class="rs-histo"><summary>Mes dernières publications</summary><ul>';
        foreach (array_slice($histo, 0, 8) as $l) $h .= '<li><a href="' . esc_url($l['u']) . '" target="_blank" rel="noopener">' . esc_html(($noms[$l['r']] ?? $l['r']) . ' : ' . $l['x']) . '</a> <small>' . esc_html(wp_date('j F', (int) $l['t'])) . '</small></li>';
        $h .= '</ul></details>';
    }
    return $h . '</div>';
}

/* =========================================================================
 *  Réglages (gestion) : les deux applications à déclarer une fois
 * ========================================================================= */
function aled08e_rs_reglages_html() {
    $m = function ($k) { $v = aled08e_rs_opt($k); return $v === '' ? 'aucune' : 'enregistrée, se termine par ' . substr($v, -4); };
    echo '<h2>Publier sur les réseaux (outil « Publier partout »)</h2>';
    echo '<p>Bluesky et Mastodon marchent sans rien régler ici : chaque client relie son compte dans son espace. Pour Facebook, Instagram et LinkedIn, il faut déclarer une fois l’application Alex & Co chez le réseau, puis coller ici son identifiant et sa clé secrète. Tant que c’est vide, le client voit « Liaison directe bientôt » et publie par copier-coller.</p>';
    echo '<table class="form-table" role="presentation">';
    echo '<tr><th>Facebook et Instagram (Meta)</th><td><p><label>Identifiant de l’application <input type="text" name="rs_meta_id" class="regular-text" value="' . esc_attr(aled08e_rs_opt('meta_id')) . '" autocomplete="off"></label></p>'
        . '<p><label>Clé secrète <input type="password" name="rs_meta_secret" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($m('meta_secret')) . '. Laissez vide pour ne rien changer.</span></p>'
        . '<p class="description">Sur developers.facebook.com : créer une application de type « Entreprise », ajouter « Facebook Login », et dans ses réglages coller cette adresse de retour : <code>' . esc_html(aled08e_rs_retour('facebook')) . '</code>. Autorisations à demander en « accès avancé » : pages_show_list, pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish. Meta demande de vérifier l’entreprise (SIRET) avant d’ouvrir l’application aux clients.</p></td></tr>';
    echo '<tr><th>LinkedIn</th><td><p><label>Identifiant client <input type="text" name="rs_linkedin_id" class="regular-text" value="' . esc_attr(aled08e_rs_opt('linkedin_id')) . '" autocomplete="off"></label></p>'
        . '<p><label>Clé secrète <input type="password" name="rs_linkedin_secret" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($m('linkedin_secret')) . '. Laissez vide pour ne rien changer.</span></p>'
        . '<p class="description">Sur linkedin.com/developers : créer une application, ajouter les produits « Share on LinkedIn » et « Sign In with LinkedIn using OpenID Connect » (ouverts tout de suite), et coller cette adresse de retour : <code>' . esc_html(aled08e_rs_retour('linkedin')) . '</code>. Le client publie sur son profil.</p></td></tr>';
    echo '</table>';
}
function aled08e_rs_reglages_save($P) {
    foreach (['meta_id', 'linkedin_id'] as $k) if (isset($P['rs_' . $k])) aled08e_option_set('aled08_rs_' . $k, preg_replace('/[^A-Za-z0-9_-]/', '', (string) $P['rs_' . $k]));
    foreach (['meta_secret', 'linkedin_secret'] as $k) { $v = trim((string) ($P['rs_' . $k] ?? '')); if ($v !== '') aled08e_option_set('aled08_rs_' . $k, preg_replace('/[^A-Za-z0-9_=.-]/', '', $v)); }
}
