<?php
/**
 * Plugin Name: Alex & Lia : connecteur
 * Description: À installer sur le site d'un client. Permet à Lia (l'IA d'Alex & Lia) de modifier et mettre à jour ce site, uniquement par des actions limitées et signées : lire les pages, changer un texte, publier une actualité, ajouter une image. Chaque changement garde une révision, pour pouvoir l'annuler.
 * Version: 1.3.0
 * Requires PHP: 7.4
 * Author: Alex & Lia
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('ALEXLIA_CONN_VERSION', '1.3.0');

/* =========================================================================
 *  Réglage : la clé secrète partagée avec Alex & Lia (Réglages › Alex & Lia)
 * ========================================================================= */
function alexlia_conn_secret() {
    if (defined('ALEXLIA_SECRET') && ALEXLIA_SECRET) return (string) ALEXLIA_SECRET;
    return (string) get_option('alexlia_secret', '');
}
function alexlia_conn_source() {
    // le site d'Alex & Lia, seule origine acceptée pour les images à importer
    return (string) get_option('alexlia_source', 'https://www.aled08.fr');
}

add_action('admin_menu', function () {
    add_options_page('Alex & Lia', 'Alex & Lia', 'manage_options', 'alexlia', 'alexlia_conn_page');
});
function alexlia_conn_page() {
    if (!current_user_can('manage_options')) return;
    if (isset($_POST['_alexlia']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_alexlia'])), 'alexlia_save')) {
        $s = trim((string) wp_unslash($_POST['alexlia_secret'] ?? ''));
        if ($s !== '' && preg_match('/^[A-Za-z0-9]{32,128}$/', $s)) update_option('alexlia_secret', $s, false);
        $src = esc_url_raw(trim((string) wp_unslash($_POST['alexlia_source'] ?? '')));
        if ($src) update_option('alexlia_source', untrailingslashit($src), false);
        if (!empty($_POST['alexlia_pause'])) update_option('alexlia_pause', '1', false); else delete_option('alexlia_pause');
        echo '<div class="notice notice-success"><p>Réglages enregistrés.</p></div>';
    }
    $sec = alexlia_conn_secret();
    echo '<div class="wrap"><h1>Alex &amp; Lia : connecteur</h1>';
    echo '<p>Ce connecteur permet à Lia de modifier ce site à la demande de son propriétaire, depuis son espace client Alex &amp; Lia. Lia ne peut ni supprimer de page, ni toucher aux extensions, au thème ou aux comptes. Chaque changement garde une révision.</p>';
    echo '<form method="post">';
    wp_nonce_field('alexlia_save', '_alexlia');
    echo '<table class="form-table" role="presentation">';
    echo '<tr><th><label for="alexlia-secret">Clé secrète</label></th><td>';
    if (defined('ALEXLIA_SECRET') && ALEXLIA_SECRET) echo '<p>Définie dans wp-config.php.</p>';
    else echo '<input type="password" id="alexlia-secret" name="alexlia_secret" class="regular-text" autocomplete="off"><p class="description">' . ($sec ? 'Clé enregistrée, se termine par …' . esc_html(substr($sec, -4)) . '. Laissez vide pour ne rien changer.' : 'Collez ici la clé affichée dans la fiche du client, sur le site Alex &amp; Lia.') . '</p>';
    echo '</td></tr>';
    echo '<tr><th><label for="alexlia-source">Site Alex &amp; Lia</label></th><td><input type="url" id="alexlia-source" name="alexlia_source" class="regular-text" value="' . esc_attr(alexlia_conn_source()) . '"><p class="description">Les images envoyées par le client ne sont importées que depuis cette adresse.</p></td></tr>';
    echo '<tr><th>Pause</th><td><label><input type="checkbox" name="alexlia_pause" value="1"' . checked(get_option('alexlia_pause'), '1', false) . '> Mettre Lia en pause sur ce site (elle ne peut plus rien modifier)</label></td></tr>';
    echo '</table><p class="submit"><button class="button button-primary" type="submit">Enregistrer</button></p></form>';
    $j = get_option('alexlia_journal', []);
    if ($j) {
        echo '<h2>Derniers changements faits par Lia</h2><ul>';
        foreach (array_slice((array) $j, 0, 30) as $e) echo '<li><small>' . esc_html($e['date']) . '</small> ' . esc_html($e['texte']) . '</li>';
        echo '</ul>';
    }
    echo '</div>';
}

/* =========================================================================
 *  Route REST signée : POST /wp-json/alexlia/v1/action
 *  En-têtes : X-AlexLia-Time (secondes UNIX), X-AlexLia-Signature = hex(hmac_sha256(time . "." . corps, clé))
 *  Corps JSON : {"action": "...", "args": {...}}
 * ========================================================================= */
add_action('rest_api_init', function () {
    register_rest_route('alexlia/v1', '/action', [
        'methods' => 'POST',
        'permission_callback' => '__return_true', // la signature est vérifiée dans le callback
        'callback' => 'alexlia_conn_action',
    ]);
});

function alexlia_conn_journal($texte) {
    $j = get_option('alexlia_journal', []);
    $j = is_array($j) ? $j : [];
    array_unshift($j, ['date' => current_time('mysql'), 'texte' => mb_substr((string) $texte, 0, 300)]);
    update_option('alexlia_journal', array_slice($j, 0, 100), false);
}

function alexlia_conn_action(WP_REST_Request $req) {
    $secret = alexlia_conn_secret();
    if ($secret === '') return new WP_Error('alexlia_off', 'Connecteur non configuré.', ['status' => 503]);
    $body = (string) $req->get_body();
    $ts = (int) $req->get_header('x_alexlia_time');
    $sig = (string) $req->get_header('x_alexlia_signature');
    if (!$ts || abs(time() - $ts) > 300 || !hash_equals(hash_hmac('sha256', $ts . '.' . $body, $secret), $sig)) {
        return new WP_Error('alexlia_signature', 'Signature refusée.', ['status' => 401]);
    }
    // une même requête signée ne sert qu'une fois
    $nonce = 'alexlia_' . substr(hash('sha256', $sig), 0, 32);
    if (get_transient($nonce)) return new WP_Error('alexlia_rejeu', 'Requête déjà reçue.', ['status' => 409]);
    set_transient($nonce, 1, 600);
    if (get_option('alexlia_pause') === '1') return new WP_Error('alexlia_pause', 'Lia est en pause sur ce site.', ['status' => 423]);
    if (strlen($body) > 400000) return new WP_Error('alexlia_trop_gros', 'Requête trop lourde.', ['status' => 413]);

    $data = json_decode($body, true);
    if (!is_array($data) || empty($data['action'])) return new WP_Error('alexlia_format', 'Requête illisible.', ['status' => 400]);
    $args = is_array($data['args'] ?? null) ? $data['args'] : [];

    // les changements sont faits au nom du premier administrateur (pour les révisions)
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID']);
    if ($admins) wp_set_current_user($admins[0]->ID);

    switch ((string) $data['action']) {
        case 'infos': return alexlia_conn_infos();
        case 'lister': return alexlia_conn_lister($args);
        case 'lire': return alexlia_conn_lire($args);
        case 'remplacer': return alexlia_conn_remplacer($args);
        case 'modifier': return alexlia_conn_modifier($args);
        case 'publier': return alexlia_conn_publier($args);
        case 'image': return alexlia_conn_image($args);
        case 'reglage': return alexlia_conn_reglage($args);
        case 'restaurer': return alexlia_conn_restaurer($args);
        case 'preparer': return alexlia_conn_preparer($args);
        case 'appliquer': return alexlia_conn_appliquer($args);
        case 'abandonner': return alexlia_conn_abandonner($args);
        case 'stats': return alexlia_conn_stats();
        case 'vacances_lire': return alexlia_vac_get();
        case 'vacances_regler': return alexlia_vac_regler($args);
        default: return new WP_Error('alexlia_action', 'Action inconnue.', ['status' => 400]);
    }
}

/* ---------- lecture ---------- */
function alexlia_conn_types() { return ['page', 'post']; }
function alexlia_conn_post($id) {
    $p = get_post((int) $id);
    if (!$p || !in_array($p->post_type, alexlia_conn_types(), true) || in_array($p->post_status, ['trash', 'auto-draft', 'inherit'], true)) return null;
    return $p;
}
function alexlia_conn_infos() {
    return ['nom' => get_bloginfo('name'), 'slogan' => get_bloginfo('description'), 'url' => home_url('/'), 'wordpress' => get_bloginfo('version'), 'connecteur' => ALEXLIA_CONN_VERSION, 'page_accueil' => (int) get_option('page_on_front')];
}
function alexlia_conn_lister($args) {
    $type = in_array($args['type'] ?? '', alexlia_conn_types(), true) ? $args['type'] : 'any';
    $q = get_posts(['post_type' => $type === 'any' ? alexlia_conn_types() : $type, 'post_status' => ['publish', 'draft', 'private'], 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC']);
    $out = [];
    foreach ($q as $p) $out[] = ['id' => $p->ID, 'type' => $p->post_type, 'titre' => $p->post_title, 'statut' => $p->post_status, 'adresse' => get_permalink($p), 'modifie' => $p->post_modified];
    return ['contenus' => $out];
}
function alexlia_conn_lire($args) {
    $p = alexlia_conn_post($args['id'] ?? 0);
    if (!$p) return new WP_Error('alexlia_introuvable', 'Contenu introuvable.', ['status' => 404]);
    $c = (string) $p->post_content;
    // avec un jeton : le contenu tel qu'il sera après les changements déjà préparés
    $b = alexlia_conn_brouillon($args['jeton'] ?? '');
    if ($b && isset($b['posts'][$p->ID]['contenu'])) $c = (string) $b['posts'][$p->ID]['contenu'];
    return ['id' => $p->ID, 'type' => $p->post_type, 'titre' => $p->post_title, 'contenu' => mb_substr($c, 0, 60000), 'tronque' => mb_strlen($c) > 60000, 'extrait' => $p->post_excerpt, 'adresse' => get_permalink($p)];
}

/* ---------- écriture (une révision est gardée avant chaque changement) ---------- */
function alexlia_conn_revision_avant($p) {
    if (!wp_revisions_enabled($p)) return 0;
    $rid = wp_save_post_revision($p->ID);
    if (!$rid) { $revs = wp_get_post_revisions($p->ID, ['numberposts' => 1]); $rid = $revs ? (int) array_key_first($revs) : 0; }
    return (int) $rid;
}
function alexlia_conn_propre($html) { return wp_kses_post((string) $html); }

function alexlia_conn_remplacer($args) {
    $p = alexlia_conn_post($args['id'] ?? 0);
    if (!$p) return new WP_Error('alexlia_introuvable', 'Contenu introuvable.', ['status' => 404]);
    $ancien = (string) ($args['ancien'] ?? '');
    $nouveau = alexlia_conn_propre($args['nouveau'] ?? '');
    if ($ancien === '' || mb_strlen($ancien) > 20000) return new WP_Error('alexlia_args', 'Texte à remplacer manquant.', ['status' => 400]);
    $n = substr_count($p->post_content, $ancien);
    if ($n === 0) return new WP_Error('alexlia_absent', 'Le texte à remplacer n’a pas été trouvé tel quel. Relisez la page.', ['status' => 409]);
    if ($n > 1 && empty($args['tous'])) return new WP_Error('alexlia_plusieurs', 'Le texte apparaît ' . $n . ' fois : précisez un passage plus long, ou demandez de tout remplacer.', ['status' => 409]);
    $rev = alexlia_conn_revision_avant($p);
    $contenu = $n > 1 ? str_replace($ancien, $nouveau, $p->post_content) : alexlia_conn_remplacer_un($p->post_content, $ancien, $nouveau);
    $r = wp_update_post(['ID' => $p->ID, 'post_content' => $contenu], true);
    if (is_wp_error($r)) return $r;
    alexlia_conn_journal('Texte remplacé sur « ' . $p->post_title . ' » (' . $n . ' fois).');
    return ['ok' => true, 'id' => $p->ID, 'remplacements' => $n, 'revision_avant' => $rev, 'adresse' => get_permalink($p)];
}
function alexlia_conn_remplacer_un($tout, $a, $b) {
    $i = strpos($tout, $a);
    return $i === false ? $tout : substr($tout, 0, $i) . $b . substr($tout, $i + strlen($a));
}
function alexlia_conn_modifier($args) {
    $p = alexlia_conn_post($args['id'] ?? 0);
    if (!$p) return new WP_Error('alexlia_introuvable', 'Contenu introuvable.', ['status' => 404]);
    $maj = ['ID' => $p->ID];
    if (isset($args['titre'])) $maj['post_title'] = sanitize_text_field((string) $args['titre']);
    if (isset($args['contenu'])) $maj['post_content'] = alexlia_conn_propre($args['contenu']);
    if (isset($args['extrait'])) $maj['post_excerpt'] = sanitize_textarea_field((string) $args['extrait']);
    if (count($maj) === 1) return new WP_Error('alexlia_args', 'Rien à modifier.', ['status' => 400]);
    $rev = alexlia_conn_revision_avant($p);
    $r = wp_update_post($maj, true);
    if (is_wp_error($r)) return $r;
    alexlia_conn_journal('Contenu modifié : « ' . ($maj['post_title'] ?? $p->post_title) . ' ».');
    return ['ok' => true, 'id' => $p->ID, 'revision_avant' => $rev, 'adresse' => get_permalink($p)];
}
function alexlia_conn_publier($args) {
    $titre = sanitize_text_field((string) ($args['titre'] ?? ''));
    $contenu = alexlia_conn_propre($args['contenu'] ?? '');
    if ($titre === '' || $contenu === '') return new WP_Error('alexlia_args', 'Titre et contenu obligatoires.', ['status' => 400]);
    $post = ['post_type' => 'post', 'post_status' => 'publish', 'post_title' => $titre, 'post_content' => $contenu];
    if (!empty($args['image_id'])) $img = (int) $args['image_id'];
    $id = wp_insert_post($post, true);
    if (is_wp_error($id)) return $id;
    if (!empty($img) && get_post($img) && get_post_type($img) === 'attachment') set_post_thumbnail($id, $img);
    alexlia_conn_journal('Actualité publiée : « ' . $titre . ' ».');
    return ['ok' => true, 'id' => (int) $id, 'adresse' => get_permalink($id)];
}
/* Importer une image envoyée par le client (uniquement depuis le site Alex & Lia) */
function alexlia_conn_image($args) {
    $url = esc_url_raw((string) ($args['url'] ?? ''));
    $src = wp_parse_url(alexlia_conn_source(), PHP_URL_HOST);
    if (!$url || wp_parse_url($url, PHP_URL_HOST) !== $src) return new WP_Error('alexlia_image', 'Image refusée : elle doit venir du site Alex & Lia.', ['status' => 400]);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $id = media_sideload_image($url, 0, sanitize_text_field((string) ($args['description'] ?? '')), 'id');
    if (is_wp_error($id)) return $id;
    alexlia_conn_journal('Image ajoutée à la médiathèque (#' . (int) $id . ').');
    return ['ok' => true, 'image_id' => (int) $id, 'adresse' => wp_get_attachment_url($id), 'balise' => wp_get_attachment_image($id, 'large')];
}
/* Réglages autorisés : nom et slogan du site seulement */
function alexlia_conn_reglage($args) {
    $ok = ['nom' => 'blogname', 'slogan' => 'blogdescription'];
    $nom = (string) ($args['nom'] ?? '');
    if (!isset($ok[$nom])) return new WP_Error('alexlia_reglage', 'Réglage non autorisé.', ['status' => 403]);
    $avant = get_option($ok[$nom]);
    update_option($ok[$nom], sanitize_text_field((string) ($args['valeur'] ?? '')));
    alexlia_conn_journal('Réglage « ' . $nom . ' » changé.');
    return ['ok' => true, 'avant' => $avant];
}
/* Annuler : remettre une révision gardée avant un changement de Lia */
function alexlia_conn_restaurer($args) {
    $rid = (int) ($args['revision'] ?? 0);
    $rev = $rid ? wp_get_post_revision($rid) : null;
    if (!$rev) return new WP_Error('alexlia_revision', 'Révision introuvable.', ['status' => 404]);
    $parent = alexlia_conn_post($rev->post_parent);
    if (!$parent) return new WP_Error('alexlia_revision', 'Contenu introuvable.', ['status' => 404]);
    $r = wp_restore_post_revision($rid);
    if (!$r) return new WP_Error('alexlia_revision', 'Restauration impossible.', ['status' => 500]);
    alexlia_conn_journal('Changement annulé sur « ' . $parent->post_title . ' ».');
    return ['ok' => true, 'id' => $parent->ID];
}

/* =========================================================================
 *  Aperçu avant mise en ligne : Lia prépare les changements dans un brouillon (jeton),
 *  le client les voit sur son vrai site avec ?alexlia_apercu=jeton, puis confirme : « appliquer ».
 * ========================================================================= */
function alexlia_conn_jeton_ok($j) { return is_string($j) && preg_match('/^[A-Za-z0-9]{24,64}$/', $j); }
function alexlia_conn_brouillon($j) {
    if (!alexlia_conn_jeton_ok($j)) return null;
    $b = get_transient('alexlia_ap_' . $j);
    return is_array($b) ? $b : null;
}
function alexlia_conn_brouillon_set($j, $b) { set_transient('alexlia_ap_' . $j, $b, 21 * DAY_IN_SECONDS); }
function alexlia_conn_apercu_url($j, $url) { return add_query_arg('alexlia_apercu', $j, $url); }

function alexlia_conn_preparer($args) {
    $j = (string) ($args['jeton'] ?? '');
    if (!alexlia_conn_jeton_ok($j)) return new WP_Error('alexlia_jeton', 'Jeton d’aperçu invalide.', ['status' => 400]);
    $b = alexlia_conn_brouillon($j) ?: ['posts' => [], 'articles' => [], 'reglages' => [], 'cree' => time()];
    $op = (string) ($args['op'] ?? '');
    if ($op === 'remplacer' || $op === 'modifier') {
        $p = alexlia_conn_post($args['id'] ?? 0);
        if (!$p) return new WP_Error('alexlia_introuvable', 'Contenu introuvable.', ['status' => 404]);
        $d = $b['posts'][$p->ID] ?? [];
        $base = isset($d['contenu']) ? (string) $d['contenu'] : (string) $p->post_content;
        if ($op === 'remplacer') {
            $ancien = (string) ($args['ancien'] ?? '');
            $nouveau = alexlia_conn_propre($args['nouveau'] ?? '');
            if ($ancien === '' || mb_strlen($ancien) > 20000) return new WP_Error('alexlia_args', 'Texte à remplacer manquant.', ['status' => 400]);
            $n = substr_count($base, $ancien);
            if ($n === 0) return new WP_Error('alexlia_absent', 'Le texte à remplacer n’a pas été trouvé tel quel. Relisez la page (avec le jeton).', ['status' => 409]);
            if ($n > 1 && empty($args['tous'])) return new WP_Error('alexlia_plusieurs', 'Le texte apparaît ' . $n . ' fois : précisez un passage plus long, ou demandez de tout remplacer.', ['status' => 409]);
            $d['contenu'] = $n > 1 ? str_replace($ancien, $nouveau, $base) : alexlia_conn_remplacer_un($base, $ancien, $nouveau);
        } else {
            if (!isset($args['titre']) && !isset($args['contenu'])) return new WP_Error('alexlia_args', 'Rien à modifier.', ['status' => 400]);
            if (isset($args['titre'])) $d['titre'] = sanitize_text_field((string) $args['titre']);
            if (isset($args['contenu'])) $d['contenu'] = alexlia_conn_propre($args['contenu']);
        }
        $b['posts'][$p->ID] = $d;
        alexlia_conn_brouillon_set($j, $b);
        return ['ok' => true, 'prepare' => true, 'id' => $p->ID, 'apercu' => alexlia_conn_apercu_url($j, get_permalink($p)), 'adresse' => get_permalink($p)];
    }
    if ($op === 'publier') {
        $titre = sanitize_text_field((string) ($args['titre'] ?? ''));
        $contenu = alexlia_conn_propre($args['contenu'] ?? '');
        if ($titre === '' || $contenu === '') return new WP_Error('alexlia_args', 'Titre et contenu obligatoires.', ['status' => 400]);
        $b['articles'][] = ['titre' => $titre, 'contenu' => $contenu, 'image_id' => (int) ($args['image_id'] ?? 0)];
        alexlia_conn_brouillon_set($j, $b);
        $k = count($b['articles']) - 1;
        return ['ok' => true, 'prepare' => true, 'apercu' => alexlia_conn_apercu_url($j, add_query_arg('alexlia_article', $k, home_url('/')))];
    }
    if ($op === 'reglage') {
        $ok = ['nom' => 'blogname', 'slogan' => 'blogdescription'];
        $nom = (string) ($args['nom'] ?? '');
        if (!isset($ok[$nom])) return new WP_Error('alexlia_reglage', 'Réglage non autorisé.', ['status' => 403]);
        $b['reglages'][$nom] = sanitize_text_field((string) ($args['valeur'] ?? ''));
        alexlia_conn_brouillon_set($j, $b);
        return ['ok' => true, 'prepare' => true, 'avant' => get_option($ok[$nom]), 'apercu' => alexlia_conn_apercu_url($j, home_url('/'))];
    }
    return new WP_Error('alexlia_args', 'Opération inconnue.', ['status' => 400]);
}

function alexlia_conn_appliquer($args) {
    $j = (string) ($args['jeton'] ?? '');
    $b = alexlia_conn_brouillon($j);
    if (!$b) return new WP_Error('alexlia_jeton', 'Aperçu introuvable ou expiré.', ['status' => 404]);
    $faits = [];
    foreach ($b['posts'] as $id => $d) {
        $p = alexlia_conn_post($id);
        if (!$p) continue;
        $maj = ['ID' => $p->ID];
        if (isset($d['titre'])) $maj['post_title'] = $d['titre'];
        if (isset($d['contenu'])) $maj['post_content'] = $d['contenu'];
        $rev = alexlia_conn_revision_avant($p);
        $r = wp_update_post($maj, true);
        if (is_wp_error($r)) return $r;
        $faits[] = ['type' => 'contenu', 'id' => $p->ID, 'revision_avant' => $rev, 'adresse' => get_permalink($p), 'titre' => $maj['post_title'] ?? $p->post_title];
        alexlia_conn_journal('Contenu mis à jour après accord du client : « ' . ($maj['post_title'] ?? $p->post_title) . ' ».');
    }
    foreach ($b['articles'] as $a) {
        $r = alexlia_conn_publier($a);
        if (is_wp_error($r)) return $r;
        $faits[] = ['type' => 'publier', 'id' => $r['id'], 'revision_avant' => 0, 'adresse' => $r['adresse'], 'titre' => $a['titre']];
    }
    foreach ($b['reglages'] as $nom => $v) {
        $r = alexlia_conn_reglage(['nom' => $nom, 'valeur' => $v]);
        if (is_wp_error($r)) return $r;
        $faits[] = ['type' => 'reglage', 'id' => 0, 'revision_avant' => 0, 'adresse' => '', 'titre' => $nom, 'avant' => $r['avant']];
    }
    delete_transient('alexlia_ap_' . $j);
    return ['ok' => true, 'faits' => $faits];
}
function alexlia_conn_abandonner($args) {
    $j = (string) ($args['jeton'] ?? '');
    if (alexlia_conn_jeton_ok($j)) delete_transient('alexlia_ap_' . $j);
    return ['ok' => true];
}

/* Affichage de l'aperçu sur le vrai site (rien n'est enregistré, rien n'est en cache, non indexé) */
function alexlia_conn_apercu_actif() {
    static $b = false;
    if ($b !== false) return $b;
    $b = null;
    if (!empty($_GET['alexlia_apercu'])) $b = alexlia_conn_brouillon(sanitize_text_field(wp_unslash($_GET['alexlia_apercu'])));
    return $b;
}
add_action('init', function () {
    $b = alexlia_conn_apercu_actif();
    if (!$b) return;
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
    add_action('send_headers', 'nocache_headers');
    add_filter('wp_robots', function ($r) { $r['noindex'] = true; $r['nofollow'] = true; return $r; });
    $art = isset($_GET['alexlia_article']) ? (int) $_GET['alexlia_article'] : -1;
    $article = ($art >= 0 && isset($b['articles'][$art])) ? $b['articles'][$art] : null;
    add_filter('the_content', function ($c) use ($b, $article) {
        $id = get_the_ID();
        if ($article && in_the_loop() && is_main_query()) return $article['contenu'] . ($article['image_id'] ? wp_get_attachment_image($article['image_id'], 'large') : '');
        // le contenu prévu passe ensuite par les filtres habituels (blocs, paragraphes, codes courts)
        if ($id && isset($b['posts'][$id]['contenu'])) return $b['posts'][$id]['contenu'];
        return $c;
    }, 1);
    add_filter('the_title', function ($t, $id = 0) use ($b, $article) {
        if ($article && in_the_loop() && is_main_query()) return $article['titre'];
        return isset($b['posts'][$id]['titre']) ? $b['posts'][$id]['titre'] : $t;
    }, 10, 2);
    foreach (['nom' => 'blogname', 'slogan' => 'blogdescription'] as $k => $opt) {
        if (isset($b['reglages'][$k])) { $v = $b['reglages'][$k]; add_filter('option_' . $opt, function () use ($v) { return $v; }); }
    }
    // l'actualité prévue s'affiche à la place de la page d'accueil (ou de la dernière actualité)
    if ($article) add_action('pre_get_posts', function ($q) {
        if (!$q->is_main_query() || is_admin()) return;
        $last = get_posts(['post_type' => 'post', 'numberposts' => 1, 'fields' => 'ids']);
        if ($last) { $q->set('p', $last[0]); $q->set('post_type', 'post'); $q->is_home = false; $q->is_single = true; $q->is_singular = true; $q->is_front_page = false; }
    });
    // un bandeau en haut : ce n'est qu'un aperçu
    $bandeau = function () { echo '<div style="position:sticky;top:0;z-index:99999;background:#2E2A47;color:#fff;font:600 15px/1.4 system-ui,sans-serif;text-align:center;padding:10px 14px">Aperçu préparé par Lia : rien n’est encore en ligne. Confirmez dans votre espace Alex &amp; Lia.</div>'; };
    add_action('wp_body_open', $bandeau);
});


/* =========================================================================
 *  Statistiques du site, pour le tableau de bord du client (forfait Titan)
 *  Mesure d'audience sans cookie : chaque visiteur est compté par une empreinte
 *  anonyme (adresse IP + navigateur + sel du jour), jamais conservée en clair,
 *  et le sel change chaque jour. Aucune donnée personnelle n'est gardée.
 * ========================================================================= */
function alexlia_stats_get() { $s = get_option('alexlia_stats'); return is_array($s) ? $s : ['jours' => [], 'srv' => []]; }
function alexlia_stats_robot($ua) { return $ua === '' || (bool) preg_match('/bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python|headless|lighthouse|pingdom|uptime/i', $ua); }

add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || is_feed() || is_preview() || is_404() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' || isset($_GET['alexlia_apercu']) || is_user_logged_in()) return;
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    if (alexlia_stats_robot($ua)) return;
    $GLOBALS['alexlia_stats_hit'] = ['ua' => $ua, 'url' => (string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), 'ref' => (string) ($_SERVER['HTTP_REFERER'] ?? '')];
}, 1);

add_action('shutdown', function () {
    $hit = $GLOBALS['alexlia_stats_hit'] ?? null;
    if (!$hit) return;
    $jour = wp_date('Y-m-d');
    $sel = get_option('alexlia_stats_sel');
    if (!is_array($sel) || ($sel['jour'] ?? '') !== $jour) { $sel = ['jour' => $jour, 'sel' => wp_generate_password(32, false, false)]; update_option('alexlia_stats_sel', $sel, false); }
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $empreinte = substr(hash('sha256', $sel['sel'] . '|' . $ip . '|' . $hit['ua']), 0, 16);

    $s = alexlia_stats_get();
    $d = $s['jours'][$jour] ?? ['vues' => 0, 'visiteurs' => 0, 'vus' => [], 'pages' => [], 'sources' => [], 'appareils' => ['mobile' => 0, 'ordinateur' => 0, 'tablette' => 0], 'heures' => array_fill(0, 24, 0), 'temps' => 0, 'mesures' => 0];
    $d['vues']++;
    $d['heures'][(int) wp_date('G')]++;
    if (!isset($d['vus'][$empreinte])) {
        if (count($d['vus']) < 5000) $d['vus'][$empreinte] = 1;
        $d['visiteurs']++;
        $type = preg_match('/ipad|tablet/i', $hit['ua']) ? 'tablette' : (preg_match('/mobi|android|iphone/i', $hit['ua']) ? 'mobile' : 'ordinateur');
        $d['appareils'][$type]++;
        $hote = (string) wp_parse_url($hit['ref'], PHP_URL_HOST);
        $hote = preg_replace('/^www\./', '', strtolower($hote));
        $ici = preg_replace('/^www\./', '', strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST)));
        $src = $hote === '' || $hote === $ici ? 'Accès direct' : (preg_match('/google\./', $hote) ? 'Google' : (preg_match('/facebook|fb\.|instagram/', $hote) ? 'Réseaux sociaux' : (preg_match('/bing|qwant|duckduckgo|ecosia|yahoo/', $hote) ? 'Autres moteurs' : 'Autres sites')));
        $d['sources'][$src] = ($d['sources'][$src] ?? 0) + 1;
    }
    $page = mb_substr($hit['url'] ?: '/', 0, 120);
    $d['pages'][$page] = ($d['pages'][$page] ?? 0) + 1;
    if (count($d['pages']) > 60) { arsort($d['pages']); $d['pages'] = array_slice($d['pages'], 0, 40, true); }
    if (!empty($_SERVER['REQUEST_TIME_FLOAT'])) { $d['temps'] += max(0, microtime(true) - (float) $_SERVER['REQUEST_TIME_FLOAT']); $d['mesures']++; }
    $s['jours'][$jour] = $d;
    // trente jours gardés ; les empreintes des jours passés sont effacées
    ksort($s['jours']);
    foreach (array_keys($s['jours']) as $k) { if ($k !== $jour) unset($s['jours'][$k]['vus']); }
    $s['jours'] = array_slice($s['jours'], -31, null, true);
    $s['srv'] = ['memoire' => memory_get_peak_usage(true), 'le' => time()];
    // visiteurs venus dans la dernière heure
    $actifs = get_transient('alexlia_actifs');
    $actifs = is_array($actifs) ? $actifs : [];
    $actifs[$empreinte] = time();
    $actifs = array_filter($actifs, function ($t) { return $t > time() - HOUR_IN_SECONDS; });
    set_transient('alexlia_actifs', array_slice($actifs, -2000, null, true), 2 * HOUR_IN_SECONDS);
    update_option('alexlia_stats', $s, false);
}, 99);

function alexlia_conn_octets($v) {
    $v = trim((string) $v); if ($v === '' || $v === '-1') return 0;
    $n = (float) $v; $u = strtolower(substr($v, -1));
    return (int) ($u === 'g' ? $n * 1073741824 : ($u === 'm' ? $n * 1048576 : ($u === 'k' ? $n * 1024 : $n)));
}
function alexlia_conn_stats() {
    $s = alexlia_stats_get();
    $jour = wp_date('Y-m-d');
    $jours = [];
    for ($i = 29; $i >= 0; $i--) {
        $k = wp_date('Y-m-d', time() - $i * DAY_IN_SECONDS);
        $d = $s['jours'][$k] ?? [];
        $jours[] = ['jour' => $k, 'vues' => (int) ($d['vues'] ?? 0), 'visiteurs' => (int) ($d['visiteurs'] ?? 0)];
    }
    $auj = $s['jours'][$jour] ?? [];
    $somme = function ($cle) use ($s) { $t = []; foreach ($s['jours'] as $d) foreach ((array) ($d[$cle] ?? []) as $k => $v) $t[$k] = ($t[$k] ?? 0) + (int) $v; arsort($t); return $t; };
    $actifs = get_transient('alexlia_actifs');
    $actifs = is_array($actifs) ? count(array_filter($actifs, function ($t) { return $t > time() - HOUR_IN_SECONDS; })) : 0;
    $tps = 0; $mes = 0; foreach ($s['jours'] as $d) { $tps += (float) ($d['temps'] ?? 0); $mes += (int) ($d['mesures'] ?? 0); }
    $charge = function_exists('sys_getloadavg') ? @sys_getloadavg() : false;
    $coeurs = 0;
    if (@is_readable('/proc/cpuinfo')) { $ci = (string) @file_get_contents('/proc/cpuinfo'); $coeurs = preg_match_all('/^processor\s*:/m', $ci); }
    $libre = function_exists('disk_free_space') ? @disk_free_space(ABSPATH) : false;
    $total = function_exists('disk_total_space') ? @disk_total_space(ABSPATH) : false;
    $comptes = wp_count_posts('page'); $articles = wp_count_posts('post');
    $boutique = null;
    if (function_exists('wc_get_orders')) {
        $cmd30 = wc_get_orders(['limit' => 500, 'status' => ['wc-processing', 'wc-completed'], 'date_created' => '>' . (time() - 30 * DAY_IN_SECONDS), 'return' => 'objects']);
        $ca = 0.0; $auj_n = 0; foreach ($cmd30 as $o) { $ca += (float) $o->get_total(); if ($o->get_date_created() && $o->get_date_created()->date('Y-m-d') === $jour) $auj_n++; }
        $prod = wp_count_posts('product');
        $boutique = ['commandes_30j' => count($cmd30), 'commandes_aujourdhui' => $auj_n, 'ventes_30j' => round($ca, 2), 'produits' => (int) ($prod->publish ?? 0), 'devise' => function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'EUR'];
    }
    return [
        'le' => time(),
        'aujourdhui' => ['vues' => (int) ($auj['vues'] ?? 0), 'visiteurs' => (int) ($auj['visiteurs'] ?? 0), 'actifs' => $actifs, 'heures' => array_values(array_map('intval', (array) ($auj['heures'] ?? array_fill(0, 24, 0))))],
        'jours' => $jours,
        'pages' => array_slice($somme('pages'), 0, 8, true),
        'sources' => $somme('sources'),
        'appareils' => $somme('appareils'),
        'serveur' => [
            'memoire' => (int) ($s['srv']['memoire'] ?? memory_get_peak_usage(true)),
            'memoire_max' => alexlia_conn_octets(ini_get('memory_limit')),
            'coeurs' => $coeurs ?: null,
            'charge' => is_array($charge) ? array_map(function ($v) { return round((float) $v, 2); }, $charge) : null,
            'disque_libre' => $libre !== false ? (int) $libre : null,
            'disque_total' => $total !== false ? (int) $total : null,
            'temps_reponse' => $mes ? round($tps / $mes, 3) : null,
            'php' => PHP_VERSION, 'wordpress' => get_bloginfo('version'), 'https' => is_ssl() || strpos(home_url(), 'https://') === 0,
        ],
        'contenu' => ['pages' => (int) ($comptes->publish ?? 0), 'articles' => (int) ($articles->publish ?? 0)],
        'boutique' => $boutique,
    ];
}


/* =========================================================================
 *  Mode vacances de la boutique (réglé par le client depuis son espace Alex & Lia)
 *  mode « ferme » : plus aucune commande possible ; mode « retard » : commandes
 *  acceptées, expédition au retour. Un bandeau prévient les visiteurs.
 * ========================================================================= */
function alexlia_vac_get() {
    $v = get_option('alexlia_vacances');
    $v = is_array($v) ? $v : [];
    $v += ['actif' => false, 'debut' => '', 'fin' => '', 'mode' => 'ferme', 'message' => ''];
    $v['en_cours'] = alexlia_vac_en_cours($v);
    $v['boutique'] = class_exists('WooCommerce');
    return $v;
}
function alexlia_vac_date($d) { return preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $d) ? (string) $d : ''; }
function alexlia_vac_en_cours($v = null) {
    $v = $v ?? get_option('alexlia_vacances');
    if (!is_array($v) || empty($v['actif'])) return false;
    $auj = wp_date('Y-m-d');
    if (!empty($v['debut']) && $auj < $v['debut']) return false;
    if (!empty($v['fin']) && $auj > $v['fin']) return false;
    return true;
}
function alexlia_vac_regler($args) {
    $v = [
        'actif' => !empty($args['actif']),
        'debut' => alexlia_vac_date($args['debut'] ?? ''),
        'fin' => alexlia_vac_date($args['fin'] ?? ''),
        'mode' => ($args['mode'] ?? '') === 'retard' ? 'retard' : 'ferme',
        'message' => mb_substr(sanitize_textarea_field((string) ($args['message'] ?? '')), 0, 400),
    ];
    if ($v['debut'] && $v['fin'] && $v['fin'] < $v['debut']) return new WP_Error('alexlia_vac', 'La date de fin est avant la date de début.', ['status' => 400]);
    update_option('alexlia_vacances', $v, true);
    alexlia_conn_journal('Mode vacances ' . ($v['actif'] ? 'activé (' . ($v['debut'] ?: 'dès maintenant') . ' au ' . ($v['fin'] ?: 'sans date de fin') . ', ' . $v['mode'] . ')' : 'désactivé') . '.');
    if (function_exists('litespeed_purge_all')) litespeed_purge_all();
    do_action('litespeed_purge_all');
    if (function_exists('wp_cache_flush')) wp_cache_flush();
    return alexlia_vac_get();
}
function alexlia_vac_texte() {
    $v = alexlia_vac_get();
    $fin = $v['fin'] ? date_i18n('j F Y', strtotime($v['fin'])) : '';
    if ($v['message'] !== '') return $v['message'];
    if ($v['mode'] === 'retard') return 'Nous sommes en congés' . ($fin ? ' jusqu’au ' . $fin : '') . '. Vous pouvez commander : votre colis partira dès notre retour.';
    return 'La boutique est en pause pour congés' . ($fin ? ' jusqu’au ' . $fin : '') . '. Les commandes reprennent à notre retour. Merci de votre patience !';
}
add_action('init', function () {
    if (is_admin() || !alexlia_vac_en_cours()) return;
    $v = alexlia_vac_get();
    if ($v['mode'] === 'ferme') {
        add_filter('woocommerce_is_purchasable', '__return_false', 99);
        add_filter('woocommerce_variation_is_purchasable', '__return_false', 99);
        add_action('woocommerce_check_cart_items', function () { wc_add_notice(alexlia_vac_texte(), 'error'); });
    } else {
        add_action('woocommerce_before_cart', function () { wc_print_notice(alexlia_vac_texte(), 'notice'); });
        add_action('woocommerce_before_checkout_form', function () { wc_print_notice(alexlia_vac_texte(), 'notice'); });
    }
    add_action('woocommerce_single_product_summary', function () { echo '<p class="alexlia-vac-produit" style="padding:10px 14px;border-radius:12px;background:#fff4d6;color:#5b4300;font-weight:600">' . esc_html(alexlia_vac_texte()) . '</p>'; }, 25);
    $bandeau = function () {
        static $fait = false; if ($fait) return; $fait = true;
        echo '<div class="alexlia-vacances" role="status" style="position:relative;z-index:99999;padding:10px 16px;text-align:center;background:#fff4d6;color:#5b4300;font:600 15px/1.4 system-ui,sans-serif">' . esc_html(alexlia_vac_texte()) . '</div>';
    };
    add_action('wp_body_open', $bandeau, 1);
    add_action('wp_footer', function () use ($bandeau) { ob_start(); $bandeau(); $h = ob_get_clean(); if ($h) echo '<script>(function(){var d=document.createElement("div");d.innerHTML=' . wp_json_encode($h) . ';document.body.insertBefore(d.firstChild,document.body.firstChild);})();</script>'; }, 1);
});
