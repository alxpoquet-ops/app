<?php
/**
 * Plugin Name: Les Minis Monstres : connecteur
 * Description: À installer sur le site d'un client. Permet à Bricou (l'IA des Minis Monstres) de modifier et mettre à jour ce site, uniquement par des actions limitées et signées : lire les pages, changer un texte, publier une actualité, ajouter une image. Chaque changement garde une révision, pour pouvoir l'annuler.
 * Version: 2.0.0
 * Requires PHP: 7.4
 * Author: Alex & Co
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('ALEXLIA_CONN_VERSION', '2.0.0');
require_once __DIR__ . '/mcp.php'; // serveur MCP intégré : les outils de Bricou, sans rien installer d'autre

/* =========================================================================
 *  Réglage : la clé secrète partagée avec Alex & Co (Réglages › Alex & Co)
 * ========================================================================= */
function alexlia_conn_secret() {
    if (defined('ALEXLIA_SECRET') && ALEXLIA_SECRET) return (string) ALEXLIA_SECRET;
    return (string) get_option('alexlia_secret', '');
}
function alexlia_conn_source() {
    // le site d'Alex & Co, seule origine acceptée pour les images à importer
    return (string) get_option('alexlia_source', 'https://www.les-minis-monstres.fr');
}

add_action('admin_menu', function () {
    add_options_page('Alex & Co', 'Alex & Co', 'manage_options', 'alexlia', 'alexlia_conn_page');
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
    echo '<div class="wrap"><h1>Les Minis Monstres : connecteur</h1>';
    echo '<p>Ce connecteur permet à Bricou de modifier ce site à la demande de son propriétaire, depuis son espace client Les Minis Monstres. Bricou ne peut ni supprimer de page, ni toucher aux extensions, au thème ou aux comptes. Chaque changement garde une révision.</p>';
    echo '<form method="post">';
    wp_nonce_field('alexlia_save', '_alexlia');
    echo '<table class="form-table" role="presentation">';
    echo '<tr><th><label for="alexlia-secret">Clé secrète</label></th><td>';
    if (defined('ALEXLIA_SECRET') && ALEXLIA_SECRET) echo '<p>Définie dans wp-config.php.</p>';
    else echo '<input type="password" id="alexlia-secret" name="alexlia_secret" class="regular-text" autocomplete="off"><p class="description">' . ($sec ? 'Clé enregistrée, se termine par …' . esc_html(substr($sec, -4)) . '. Laissez vide pour ne rien changer.' : 'Collez ici la clé affichée dans la fiche du client, sur le site Les Minis Monstres.') . '</p>';
    echo '</td></tr>';
    echo '<tr><th><label for="alexlia-source">Site Les Minis Monstres</label></th><td><input type="url" id="alexlia-source" name="alexlia_source" class="regular-text" value="' . esc_attr(alexlia_conn_source()) . '"><p class="description">Les images envoyées par le client ne sont importées que depuis cette adresse.</p></td></tr>';
    echo '<tr><th>Pause</th><td><label><input type="checkbox" name="alexlia_pause" value="1"' . checked(get_option('alexlia_pause'), '1', false) . '> Mettre Lia en pause sur ce site (elle ne peut plus rien modifier)</label></td></tr>';
    echo '</table><p class="submit"><button class="button button-primary" type="submit">Enregistrer</button></p></form>';
    $j = get_option('alexlia_journal', []);
    if ($j) {
        echo '<h2>Derniers changements faits par Bricou</h2><ul>';
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
        case 'boutique_lire': return alexlia_bq_lire();
        case 'promo_creer': return alexlia_bq_promo_creer($args);
        case 'promo_supprimer': return alexlia_bq_promo_supprimer($args);
        case 'soldes_regler': return alexlia_bq_soldes_regler($args);
        case 'bandeau_regler': return alexlia_bq_bandeau_regler($args);
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
    return ['nom' => get_bloginfo('name'), 'slogan' => get_bloginfo('description'), 'url' => home_url('/'), 'wordpress' => get_bloginfo('version'), 'connecteur' => ALEXLIA_CONN_VERSION, 'mcp' => 1, 'page_accueil' => (int) get_option('page_on_front')];
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
/* Importer une image envoyée par le client (uniquement depuis le site Alex & Co) */
function alexlia_conn_image($args) {
    $url = esc_url_raw((string) ($args['url'] ?? ''));
    // le site des Minis Monstres, sous son nom actuel ou son ancien nom (aled08.fr) : les photos déjà envoyées gardent leur adresse
    $src = wp_parse_url(alexlia_conn_source(), PHP_URL_HOST);
    $ok = [$src, 'aled08.fr', 'www.aled08.fr'];
    if (!$url || !in_array(wp_parse_url($url, PHP_URL_HOST), $ok, true)) return new WP_Error('alexlia_image', 'Image refusée : elle doit venir du site Alex & Co.', ['status' => 400]);
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
/* Annuler : remettre une révision gardée avant un changement de Bricou */
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
 *  Aperçu avant mise en ligne : Bricou prépare les changements dans un brouillon (jeton),
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
        $apercu = alexlia_conn_apercu_url($j, home_url('/'));
        // le nom s'affiche-t-il vraiment sur le site ? Certains thèmes l'écrivent en dur : le réglage ne change alors rien à l'écran.
        $visible = alexlia_conn_texte_visible($apercu, $b['reglages'][$nom]);
        $avant = (string) get_option($ok[$nom]);
        $remplace = false;
        // le thème écrit le nom lui-même : on remplace aussi l'ancien nom à l'écran (aperçu, puis site après l'accord du client)
        if ($visible === false && $avant !== '' && $avant !== $b['reglages'][$nom]) { // nom ou slogan écrit en dur par le thème
            $b['affichages'] = array_values(array_filter((array) ($b['affichages'] ?? []), function ($a) use ($avant) { return ($a['ancien'] ?? '') !== $avant; }));
            $b['affichages'][] = ['ancien' => $avant, 'nouveau' => $b['reglages'][$nom]];
            alexlia_conn_brouillon_set($j, $b);
            $visible = alexlia_conn_texte_visible($apercu, $b['reglages'][$nom]);
            $remplace = $visible === true;
        }
        $b['alertes'][$nom] = $visible === false ? 'Ce texte n’apparaît pas sur la page : le thème du site l’écrit lui-même et je n’ai pas pu le remplacer à l’écran.' : ($remplace ? 'Le thème du site écrit ce nom lui-même : il est aussi remplacé à l’écran (en-tête, pied de page…).' : '');
        alexlia_conn_brouillon_set($j, $b);
        return ['ok' => true, 'prepare' => true, 'avant' => $avant, 'apercu' => $apercu, 'visible_sur_le_site' => $visible, 'remplacement_affichage' => $remplace,
            'note' => $visible === false ? 'ATTENTION : le nouveau texte ne s’affiche PAS sur la page d’accueil (le thème l’écrit en dur). Le réglage ne change que l’onglet du navigateur et le référencement.' : ($remplace ? 'Le thème écrit le nom en dur : l’ancien nom est aussi remplacé à l’écran par le nouveau, visible dans l’aperçu.' : '')];
    }
    if ($op === 'affichage') {
        // un texte que le thème écrit lui-même (en-tête, accroche, pied de page…) : remplacé à l'écran dans l'aperçu, puis sur le site après l'accord du client
        $anc = trim((string) ($args['ancien'] ?? '')); $nou = trim((string) ($args['nouveau'] ?? ''));
        $limite = function_exists('alexlia_mcp_limites') ? alexlia_mcp_limites('affichage_remplacer', ['ancien' => $anc, 'nouveau' => $nou]) : null;
        if (is_wp_error($limite)) return new WP_Error('alexlia_args', $limite->get_error_message(), ['status' => 400]);
        if (mb_strlen($anc) < 4 || mb_strlen($anc) > 300 || $nou === '' || mb_strlen($nou) > 600 || $anc === $nou) return new WP_Error('alexlia_args', 'Textes manquants, trop courts ou trop longs.', ['status' => 400]);
        $b['affichages'] = array_values(array_filter((array) ($b['affichages'] ?? []), function ($a) use ($anc) { return ($a['ancien'] ?? '') !== $anc; }));
        $b['affichages'][] = ['ancien' => $anc, 'nouveau' => $nou];
        alexlia_conn_brouillon_set($j, $b);
        $apercu = alexlia_conn_apercu_url($j, home_url('/'));
        $visible = alexlia_conn_texte_visible($apercu, $nou);
        return ['ok' => true, 'prepare' => true, 'apercu' => $apercu, 'visible_sur_le_site' => $visible,
            'note' => $visible === false ? 'ATTENTION : le nouveau texte n’apparaît toujours pas sur la page d’accueil : vérifiez que « ancien » est écrit exactement comme à l’écran, ou que le texte est sur une autre page.' : 'Le nouveau texte est visible dans l’aperçu.'];
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
    foreach ((array) ($b['affichages'] ?? []) as $a) alexlia_conn_affichage_ajouter($a['ancien'], $a['nouveau']);
    delete_transient('alexlia_ap_' . $j);
    return ['ok' => true, 'faits' => $faits];
}
function alexlia_conn_abandonner($args) {
    $j = (string) ($args['jeton'] ?? '');
    if (alexlia_conn_jeton_ok($j)) delete_transient('alexlia_ap_' . $j);
    return ['ok' => true];
}

/* Remplacements d'affichage : un texte que le thème écrit lui-même (le nom du site dans l'en-tête, le pied de page…) est remplacé dans la page
 * au moment de l'envoi au navigateur. Gardés dans l'option alexlia_affichages, dans l'ordre ; un nouveau changement de nom s'ajoute à la suite. */
function alexlia_conn_affichages() { $l = get_option('alexlia_affichages'); return is_array($l) ? $l : []; }
function alexlia_conn_affichage_ajouter($ancien, $nouveau) {
    $ancien = (string) $ancien; $nouveau = (string) $nouveau;
    if ($ancien === '' || $ancien === $nouveau) return;
    $l = alexlia_conn_affichages();
    $l[] = ['ancien' => $ancien, 'nouveau' => $nouveau, 'le' => time()];
    update_option('alexlia_affichages', array_slice($l, -20), false);
    alexlia_conn_journal('Affichage : « ' . $ancien . ' » remplacé par « ' . $nouveau . ' » à l’écran (le thème l’écrit lui-même).');
}
function alexlia_conn_affichage_regex($ancien) {
    $re = '';
    foreach (preg_split('//u', html_entity_decode((string) $ancien, ENT_QUOTES, 'UTF-8'), -1, PREG_SPLIT_NO_EMPTY) as $c) {
        if ($c === ' ') $re .= '(?:\s|&nbsp;|<[^>]*>)+';
        elseif ($c === '&') $re .= '(?:&amp;|&#038;|&#38;|&)';
        elseif ($c === "'" || $c === '’') $re .= "(?:'|’|&#039;|&#8217;|&rsquo;|&apos;)";
        else $re .= preg_quote($c, '/');
    }
    return '/' . $re . '/';
}
function alexlia_conn_affichages_appliquer($html, $liste) {
    // ni les scripts, ni les styles, ni l'encart d'aperçu ne sont touchés
    $morceaux = preg_split('/(<script\b.*?<\/script>|<style\b.*?<\/style>|<!--alexlia-ap-->.*?<!--\/alexlia-ap-->)/is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
    foreach ($morceaux as $i => $m) {
        if ($i % 2 === 1) continue;
        foreach ($liste as $a) {
            if (empty($a['ancien'])) continue;
            $out = @preg_replace_callback(alexlia_conn_affichage_regex($a['ancien']), function () use ($a) { return esc_html((string) $a['nouveau']); }, $m);
            if (is_string($out)) $m = $out;
        }
        $morceaux[$i] = $m;
    }
    return implode('', $morceaux);
}
add_action('template_redirect', function () {
    if (is_admin() || wp_doing_ajax() || is_feed() || is_robots() || (defined('REST_REQUEST') && REST_REQUEST)) return;
    $liste = alexlia_conn_affichages();
    $b = alexlia_conn_apercu_actif();
    if ($b && !empty($b['affichages'])) $liste = array_merge($liste, $b['affichages']);
    if (!$liste) return;
    ob_start(function ($h) use ($liste) { return (stripos($h, '<html') === false) ? $h : alexlia_conn_affichages_appliquer($h, $liste); });
}, 0);

/* Le texte apparaît-il dans la page affichée (hors balises d'en-tête et hors encart d'aperçu) ? null si on n'a pas pu regarder */
function alexlia_conn_texte_visible($url, $texte) {
    $r = wp_remote_get($url, ['timeout' => 12, 'redirection' => 3, 'headers' => ['Cache-Control' => 'no-cache']]);
    if (is_wp_error($r) || (int) wp_remote_retrieve_response_code($r) !== 200) return null;
    $h = (string) wp_remote_retrieve_body($r);
    $h = preg_replace('/<!--alexlia-ap-->.*?<!--\/alexlia-ap-->/s', '', $h);
    $h = preg_replace('/<head\b.*?<\/head>|<script\b.*?<\/script>|<style\b.*?<\/style>/is', '', $h);
    $t = html_entity_decode(trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($h))), ENT_QUOTES, 'UTF-8');
    return mb_stripos($t, html_entity_decode((string) $texte, ENT_QUOTES, 'UTF-8')) !== false;
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
    // ce qui change, calculé avant que les filtres de l'aperçu ne s'installent (valeurs d'origine)
    $changes = [];
    $marques = [];
    foreach ((array) ($b['posts'] ?? []) as $pid => $d) {
        $p = get_post((int) $pid);
        if (!$p) continue;
        if (isset($d['titre']) && $d['titre'] !== $p->post_title) $changes[] = ['quoi' => 'Titre de la page « ' . $p->post_title . ' »', 'avant' => $p->post_title, 'apres' => $d['titre']];
        if (isset($d['contenu'])) {
            $r = alexlia_conn_surligner($p->post_content, $d['contenu']);
            if ($r) { $marques[(int) $pid] = $r['html']; $changes[] = ['quoi' => 'Texte de la page « ' . $p->post_title . ' »', 'avant' => $r['avant'], 'apres' => $r['apres']]; }
        }
    }
    foreach ((array) ($b['reglages'] ?? []) as $k => $v) {
        $opt = $k === 'slogan' ? 'blogdescription' : 'blogname';
        $changes[] = ['quoi' => $k === 'slogan' ? 'Slogan du site' : 'Nom du site (en haut du site, dans l’onglet du navigateur)', 'avant' => (string) get_option($opt), 'apres' => (string) $v];
    }
    foreach ((array) ($b['articles'] ?? []) as $a) $changes[] = ['quoi' => 'Nouvelle actualité', 'avant' => '', 'apres' => (string) $a['titre']];
    foreach ((array) ($b['affichages'] ?? []) as $a) if (empty($b['reglages']) || !in_array($a['nouveau'], array_values((array) $b['reglages']), true)) $changes[] = ['quoi' => 'Texte du thème, remplacé à l’écran', 'avant' => (string) $a['ancien'], 'apres' => (string) $a['nouveau']];
    add_filter('the_content', function ($c) use ($b, $article, $marques) {
        $id = get_the_ID();
        if ($article && in_the_loop() && is_main_query()) return $article['contenu'] . ($article['image_id'] ? wp_get_attachment_image($article['image_id'], 'large') : '');
        // le contenu prévu passe ensuite par les filtres habituels (blocs, paragraphes, codes courts) ; ce qui change est surligné
        if ($id && isset($marques[$id])) return $marques[$id];
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
    // un petit encart en bas de l'écran (il ne cache pas le site) : ce n'est qu'un aperçu, et il dit ce qui change
    $alertes = array_filter((array) ($b['alertes'] ?? []));
    add_action('wp_footer', function () use ($changes, $alertes) {
        $li = '';
        foreach ($changes as $c) {
            $cut = function ($t) { $t = trim((string) $t); return mb_strlen($t) > 140 ? mb_substr($t, 0, 137) . '…' : $t; };
            $li .= '<li style="margin:6px 0"><b>' . esc_html($c['quoi']) . '</b><br>'
                . ($c['avant'] !== '' ? '<del style="opacity:.7">' . esc_html($cut($c['avant'])) . '</del> → ' : '')
                . '<ins style="text-decoration:none;background:#ffe27a;color:#2E2A47;padding:0 4px;border-radius:4px">' . esc_html($cut($c['apres']) ?: '(retiré)') . '</ins></li>';
        }
        $al = $alertes ? '<p style="margin:8px 0 0;background:#ffe27a;color:#2E2A47;border-radius:10px;padding:6px 10px"><b>À savoir :</b> ' . esc_html(implode(' ', $alertes)) . '</p>' : '';
        echo '<!--alexlia-ap--><style>mark.alexlia-mod{background:#ffe27a;color:inherit;outline:2px solid #ff8fb3;outline-offset:2px;border-radius:3px;padding:0 2px}#alexlia-ap button{font:inherit;cursor:pointer;border:0;border-radius:999px;padding:5px 12px;background:#fff;color:#2E2A47;font-weight:700}</style>'
            . '<div id="alexlia-ap" role="status" style="position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;max-width:620px;margin:0 auto;background:#2E2A47;color:#fff;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.3);font:500 14px/1.45 system-ui,sans-serif;padding:12px 16px">'
            . '<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>Aperçu préparé par Bricou.</b> Rien n’est encore en ligne.</span><span style="display:flex;gap:6px"><button type="button" data-ap-liste aria-expanded="true">Ce qui change (' . count($changes) . ')</button><button type="button" data-ap-fermer aria-label="Masquer l’aperçu">×</button></span></div>'
            . '<div data-ap-detail style="margin-top:8px;max-height:38vh;overflow:auto"><ul style="margin:0;padding:0;list-style:none">' . $li . '</ul>' . $al . '<p style="margin:8px 0 0;opacity:.85">Le texte changé est surligné sur la page. Pour valider, retournez dans votre espace Les Minis Monstres.</p></div></div><!--/alexlia-ap-->'
            . '<script>(function(){var b=document.getElementById("alexlia-ap");if(!b)return;var d=b.querySelector("[data-ap-detail]"),l=b.querySelector("[data-ap-liste]");l.addEventListener("click",function(){d.hidden=!d.hidden;l.setAttribute("aria-expanded",d.hidden?"false":"true");});b.querySelector("[data-ap-fermer]").addEventListener("click",function(){b.style.display="none";});var m=document.querySelector("mark.alexlia-mod");if(m)setTimeout(function(){m.scrollIntoView({block:"center",behavior:"smooth"});},400);})();</script>';
    });
});

/* Le texte prévu, avec ce qui a changé entouré d'un surlignage (null si rien ne change) */
function alexlia_conn_surligner($ancien, $nouveau) {
    $a = (string) $ancien; $n = (string) $nouveau;
    if ($a === $n) return null;
    $la = strlen($a); $ln = strlen($n); $min = min($la, $ln);
    $p = 0; while ($p < $min && $a[$p] === $n[$p]) $p++;
    $s = 0; while ($s < $min - $p && $a[$la - 1 - $s] === $n[$ln - 1 - $s]) $s++;
    // le début : on recule jusqu'au début d'un mot, hors d'une balise
    $pre = substr($n, 0, $p);
    $lt = strrpos($pre, '<'); $gt = strrpos($pre, '>');
    if ($lt !== false && ($gt === false || $lt > $gt)) $p = $lt;
    while ($p > 0 && !in_array($n[$p - 1], [' ', '>', "\n"], true)) $p--;
    // la fin : on avance jusqu'à la fin du mot, hors d'une balise
    $e = $ln - $s;
    while ($e < $ln && !in_array($n[$e], [' ', '<', "\n"], true)) $e++;
    $post = substr($n, $e);
    $gt2 = strpos($post, '>'); $lt2 = strpos($post, '<');
    if ($gt2 !== false && ($lt2 === false || $gt2 < $lt2)) $e += $gt2 + 1;
    $ae = max($p, $la - ($ln - $e));
    $milieu = substr($n, $p, $e - $p);
    $marque = preg_replace_callback('/<[^>]*>|[^<]+/u', function ($m) {
        return ($m[0][0] === '<' || trim($m[0]) === '') ? $m[0] : '<mark class="alexlia-mod">' . $m[0] . '</mark>';
    }, $milieu);
    $txt = function ($h) { return trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($h))); };
    return ['html' => substr($n, 0, $p) . $marque . substr($n, $e), 'avant' => $txt(substr($a, $p, $ae - $p)), 'apres' => $txt($milieu)];
}


/* =========================================================================
 *  Statistiques du site, pour le tableau de bord du client (extra « Chiffres détaillés »)
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
        'google' => alexlia_conn_google(),
    ];
}

/* Les recherches Google qui amènent au site : lues dans les données Search Console que Rank Math
 * enregistre sur le site (si Search Console est relié dans Rank Math). Sinon : null, avec la raison. */
function alexlia_conn_google() {
    global $wpdb;
    $t = $wpdb->prefix . 'rank_math_analytics_gsc';
    if (!defined('RANK_MATH_VERSION') && !class_exists('RankMath')) return ['etat' => 'sans_rank_math'];
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $t)) !== $t) return ['etat' => 'non_relie'];
    $cols = $wpdb->get_col("SHOW COLUMNS FROM `$t`");
    foreach (['created', 'query', 'impressions', 'clicks', 'position'] as $c) if (!in_array($c, (array) $cols, true)) return ['etat' => 'format_inconnu'];
    $depuis = gmdate('Y-m-d H:i:s', time() - 28 * DAY_IN_SECONDS);
    $tot = $wpdb->get_row($wpdb->prepare("SELECT SUM(impressions) i, SUM(clicks) c FROM `$t` WHERE created >= %s", $depuis), ARRAY_A);
    if (!$tot || !(int) $tot['i']) return ['etat' => 'vide'];
    $rows = $wpdb->get_results($wpdb->prepare("SELECT query q, SUM(impressions) i, SUM(clicks) c, SUM(position * impressions) / NULLIF(SUM(impressions), 0) p FROM `$t` WHERE created >= %s AND query <> '' GROUP BY query ORDER BY SUM(clicks) DESC, SUM(impressions) DESC LIMIT 8", $depuis), ARRAY_A);
    $liste = [];
    foreach ((array) $rows as $r) $liste[] = ['recherche' => (string) $r['q'], 'position' => round((float) $r['p'], 1), 'apparitions' => (int) $r['i'], 'clics' => (int) $r['c']];
    return ['etat' => 'ok', 'jours' => 28, 'apparitions' => (int) $tot['i'], 'clics' => (int) $tot['c'], 'recherches' => $liste];
}


/* =========================================================================
 *  Mode vacances de la boutique (réglé par le client depuis son espace Alex & Co)
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


/* =========================================================================
 *  Outils de la boutique, réglés par le client depuis son espace Alex & Co :
 *  codes promo, soldes rapides (un pourcentage sur tout ou une catégorie, avec des dates)
 *  et bandeau d'annonce en haut du site. Rien ne touche aux fiches produits : les soldes
 *  sont calculés à l'affichage, et s'arrêtent seuls à la date de fin.
 * ========================================================================= */
function alexlia_bq_vider_cache() {
    if (function_exists('litespeed_purge_all')) litespeed_purge_all();
    do_action('litespeed_purge_all');
    if (function_exists('wc_delete_product_transients')) wc_delete_product_transients();
    if (function_exists('wp_cache_flush')) wp_cache_flush();
}
function alexlia_bq_wc() { return class_exists('WooCommerce') && class_exists('WC_Coupon'); }
function alexlia_bq_soldes() {
    $v = get_option('alexlia_soldes');
    $v = is_array($v) ? $v : [];
    return $v + ['actif' => false, 'pct' => 10, 'debut' => '', 'fin' => '', 'categorie' => 0];
}
function alexlia_bq_bandeau() {
    $v = get_option('alexlia_bandeau');
    $v = is_array($v) ? $v : [];
    return $v + ['actif' => false, 'message' => '', 'couleur' => 'rose', 'fin' => ''];
}
function alexlia_bq_dans_dates($v) {
    if (empty($v['actif'])) return false;
    $auj = wp_date('Y-m-d');
    if (!empty($v['debut']) && $auj < $v['debut']) return false;
    if (!empty($v['fin']) && $auj > $v['fin']) return false;
    return true;
}
function alexlia_bq_lire() {
    if (!alexlia_bq_wc()) return ['boutique' => false];
    $promos = [];
    foreach (get_posts(['post_type' => 'shop_coupon', 'post_status' => 'publish', 'numberposts' => 40, 'orderby' => 'date', 'order' => 'DESC']) as $p) {
        $c = new WC_Coupon($p->ID);
        $exp = $c->get_date_expires();
        $promos[] = [
            'id' => $p->ID, 'code' => strtoupper($c->get_code()), 'type' => $c->get_discount_type(), 'montant' => (float) $c->get_amount(),
            'livraison' => (bool) $c->get_free_shipping(), 'minimum' => (float) $c->get_minimum_amount(),
            'fin' => $exp ? $exp->date('Y-m-d') : '', 'utilise' => (int) $c->get_usage_count(), 'limite' => (int) $c->get_usage_limit(),
            'expire' => $exp && $exp->getTimestamp() < time(),
        ];
    }
    $cats = [];
    foreach (get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true, 'number' => 60]) as $t) if (!is_wp_error($t)) $cats[] = ['id' => $t->term_id, 'nom' => html_entity_decode($t->name)];
    $so = alexlia_bq_soldes(); $so['en_cours'] = alexlia_bq_dans_dates($so);
    $ba = alexlia_bq_bandeau(); $ba['en_cours'] = alexlia_bq_dans_dates($ba);
    return ['boutique' => true, 'devise' => get_woocommerce_currency(), 'promos' => $promos, 'categories' => $cats, 'soldes' => $so, 'bandeau' => $ba];
}
function alexlia_bq_promo_creer($a) {
    if (!alexlia_bq_wc()) return new WP_Error('alexlia_bq', 'Pas de boutique sur ce site.', ['status' => 400]);
    $code = strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) ($a['code'] ?? '')));
    if (strlen($code) < 3 || strlen($code) > 20) return new WP_Error('alexlia_bq', 'Le code doit faire de 3 à 20 lettres ou chiffres.', ['status' => 400]);
    if (wc_get_coupon_id_by_code($code)) return new WP_Error('alexlia_bq_pris', 'Ce code existe déjà.', ['status' => 409]);
    $type = ($a['type'] ?? '') === 'fixe' ? 'fixed_cart' : 'percent';
    $m = round((float) ($a['montant'] ?? 0), 2);
    $livraison = !empty($a['livraison']);
    if (!$livraison && ($m <= 0 || ($type === 'percent' && $m > 90) || ($type === 'fixed_cart' && $m > 500))) return new WP_Error('alexlia_bq', 'Montant de la réduction impossible.', ['status' => 400]);
    $c = new WC_Coupon();
    $c->set_code(strtolower($code));
    $c->set_discount_type($type);
    $c->set_amount(max(0, $m));
    $c->set_free_shipping($livraison);
    $c->set_individual_use(true);
    if (!empty($a['minimum'])) $c->set_minimum_amount(max(0, round((float) $a['minimum'], 2)));
    if (!empty($a['limite'])) $c->set_usage_limit(max(1, (int) $a['limite']));
    if (!empty($a['un_par_client'])) $c->set_usage_limit_per_user(1);
    $fin = alexlia_vac_date($a['fin'] ?? '');
    if ($fin) $c->set_date_expires(strtotime($fin . ' 23:59:59'));
    $c->set_description('Créé depuis l’espace Alex & Co');
    $id = $c->save();
    if (!$id) return new WP_Error('alexlia_bq', 'Le code n’a pas pu être créé.', ['status' => 500]);
    alexlia_conn_journal('Code promo ' . $code . ' créé.');
    return alexlia_bq_lire();
}
function alexlia_bq_promo_supprimer($a) {
    $id = (int) ($a['id'] ?? 0);
    $p = $id ? get_post($id) : null;
    if (!$p || $p->post_type !== 'shop_coupon') return new WP_Error('alexlia_bq', 'Code introuvable.', ['status' => 404]);
    wp_trash_post($id);
    alexlia_conn_journal('Code promo ' . strtoupper($p->post_title) . ' supprimé (corbeille).');
    return alexlia_bq_lire();
}
function alexlia_bq_soldes_regler($a) {
    $v = [
        'actif' => !empty($a['actif']),
        'pct' => max(5, min(70, (int) ($a['pct'] ?? 10))),
        'debut' => alexlia_vac_date($a['debut'] ?? ''),
        'fin' => alexlia_vac_date($a['fin'] ?? ''),
        'categorie' => max(0, (int) ($a['categorie'] ?? 0)),
    ];
    if ($v['debut'] && $v['fin'] && $v['fin'] < $v['debut']) return new WP_Error('alexlia_bq', 'La date de fin est avant la date de début.', ['status' => 400]);
    update_option('alexlia_soldes', $v, true);
    alexlia_conn_journal('Soldes ' . ($v['actif'] ? 'activées : -' . $v['pct'] . ' %' : 'arrêtées') . '.');
    alexlia_bq_vider_cache();
    return alexlia_bq_lire();
}
function alexlia_bq_bandeau_regler($a) {
    $v = [
        'actif' => !empty($a['actif']),
        'message' => mb_substr(sanitize_text_field((string) ($a['message'] ?? '')), 0, 160),
        'couleur' => in_array($a['couleur'] ?? '', ['rose', 'vert', 'bleu', 'jaune'], true) ? $a['couleur'] : 'rose',
        'fin' => alexlia_vac_date($a['fin'] ?? ''),
    ];
    if ($v['actif'] && $v['message'] === '') return new WP_Error('alexlia_bq', 'Écrivez le message du bandeau.', ['status' => 400]);
    update_option('alexlia_bandeau', $v, true);
    alexlia_conn_journal('Bandeau ' . ($v['actif'] ? 'affiché' : 'retiré') . '.');
    alexlia_bq_vider_cache();
    return alexlia_bq_lire();
}

/* soldes : prix calculé à l'affichage, jamais enregistré dans le produit */
function alexlia_bq_solde_pour($product) {
    static $regle = null;
    if ($regle === null) { $s = alexlia_bq_soldes(); $regle = alexlia_bq_dans_dates($s) ? $s : false; }
    if (!$regle || !$product || !is_object($product)) return null;
    $pid = $product->get_parent_id() ?: $product->get_id();
    if ($regle['categorie'] && !has_term((int) $regle['categorie'], 'product_cat', $pid)) return null;
    $reg = $product->get_regular_price('edit');
    if ($reg === '' || (float) $reg <= 0) return null;
    $prix = round((float) $reg * (100 - (int) $regle['pct']) / 100, wc_get_price_decimals());
    $propre = $product->get_sale_price('edit');
    if ($propre !== '' && (float) $propre < $prix) return null; // une promo déjà plus forte sur le produit reste
    return $prix;
}
add_action('init', function () {
    if (!class_exists('WooCommerce') || (is_admin() && !wp_doing_ajax())) return;
    if (alexlia_bq_dans_dates(alexlia_bq_soldes())) {
        $prix = function ($p, $product) { $n = alexlia_bq_solde_pour($product); return $n === null ? $p : $n; };
        foreach (['woocommerce_product_get_price', 'woocommerce_product_get_sale_price', 'woocommerce_product_variation_get_price', 'woocommerce_product_variation_get_sale_price'] as $f) add_filter($f, $prix, 99, 2);
        add_filter('woocommerce_variation_prices_price', function ($p, $var) { $n = alexlia_bq_solde_pour($var); return $n === null ? $p : $n; }, 99, 2);
        add_filter('woocommerce_variation_prices_sale_price', function ($p, $var) { $n = alexlia_bq_solde_pour($var); return $n === null ? $p : $n; }, 99, 2);
        add_filter('woocommerce_get_variation_prices_hash', function ($h) { $h[] = 'alexlia-' . md5(wp_json_encode(alexlia_bq_soldes())); return $h; }, 99);
        add_filter('woocommerce_product_is_on_sale', function ($on, $product) { return alexlia_bq_solde_pour($product) !== null ? true : $on; }, 99, 2);
    }
    $b = alexlia_bq_bandeau();
    if (alexlia_bq_dans_dates($b) && $b['message'] !== '') {
        $c = ['rose' => ['#ffe1ea', '#7a1f3d'], 'vert' => ['#dcf5e8', '#145a3a'], 'bleu' => ['#dcecff', '#173f73'], 'jaune' => ['#fff4d6', '#5b4300']][$b['couleur']] ?? ['#ffe1ea', '#7a1f3d'];
        $bandeau = function () use ($b, $c) {
            static $fait = false; if ($fait) return; $fait = true;
            echo '<div class="alexlia-bandeau" role="status" style="position:relative;z-index:99998;padding:9px 16px;text-align:center;background:' . esc_attr($c[0]) . ';color:' . esc_attr($c[1]) . ';font:600 15px/1.4 system-ui,sans-serif">' . esc_html($b['message']) . '</div>';
        };
        add_action('wp_body_open', $bandeau, 2);
        add_action('wp_footer', function () use ($bandeau) { ob_start(); $bandeau(); $h = ob_get_clean(); if ($h) echo '<script>(function(){var d=document.createElement("div");d.innerHTML=' . wp_json_encode($h) . ';document.body.insertBefore(d.firstChild,document.body.firstChild);})();</script>'; }, 2);
    }
});
