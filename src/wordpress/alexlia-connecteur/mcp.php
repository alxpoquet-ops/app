<?php
/**
 * Les Minis Monstres : connecteur. Serveur MCP intégré.
 * Le connecteur parle aussi le protocole MCP (HTTP, réponses JSON) sur /wp-json/alexlia/v1/mcp : Bricou y trouve ses outils
 * sans rien installer d'autre sur le site du client. La clé n'est pas à copier : elle se déduit de la clé de liaison
 * (celle qui relie déjà le site à l'espace client), par un calcul à sens unique (HMAC) que l'espace client refait de son côté.
 * Les modifications sont faites tout de suite sur le site ; chaque outil garde une révision (restaurer_revision pour tout remettre comme avant).
 */
defined('ABSPATH') || exit;

function alexlia_mcp_liste($a) { return is_array($a) && ($a === [] || array_keys($a) === range(0, count($a) - 1)); }

function alexlia_mcp_token() {
    $s = alexlia_conn_secret();
    return $s === '' ? '' : hash_hmac('sha256', 'alexlia-mcp-v1', $s);
}

add_action('rest_api_init', function () {
    register_rest_route('alexlia/v1', '/mcp', [
        'methods' => ['POST', 'GET', 'DELETE'],
        'permission_callback' => '__return_true', // la clé est vérifiée dans le callback
        'callback' => 'alexlia_mcp_http',
    ]);
});

/* La clé arrive dans l'en-tête Authorization (Bearer) ou, quand l'hébergeur le retire, dans l'adresse (?k=) */
function alexlia_mcp_autorise(WP_REST_Request $req) {
    $t = alexlia_mcp_token();
    if ($t === '') return false;
    $h = (string) $req->get_header('authorization');
    $k = preg_match('/^Bearer\s+(\S+)$/i', $h, $m) ? $m[1] : (string) $req->get_param('k');
    return $k !== '' && hash_equals($t, $k);
}

function alexlia_mcp_http(WP_REST_Request $req) {
    if (!alexlia_mcp_autorise($req)) return new WP_Error('alexlia_mcp_auth', 'Clé refusée.', ['status' => 401]);
    if (get_option('alexlia_pause') === '1') return new WP_Error('alexlia_pause', 'Bricou est en pause sur ce site.', ['status' => 423]);
    $methode = $req->get_method();
    if ($methode === 'GET') return new WP_REST_Response(null, 405);
    if ($methode === 'DELETE') return new WP_REST_Response(null, 200);
    $corps = (string) $req->get_body();
    if (strlen($corps) > 600000) return new WP_Error('alexlia_trop_gros', 'Requête trop lourde.', ['status' => 413]);
    $d = json_decode($corps, true);
    if (!is_array($d)) return new WP_REST_Response(['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32700, 'message' => 'JSON illisible.']], 200);
    // les changements sont faits au nom du premier administrateur (pour les révisions)
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID']);
    if ($admins) wp_set_current_user($admins[0]->ID);
    $lot = alexlia_mcp_liste($d) ? $d : [$d];
    $reponses = [];
    foreach ($lot as $msg) {
        if (!is_array($msg) || !isset($msg['method'])) continue;
        if (!array_key_exists('id', $msg)) continue; // une notification : pas de réponse
        $reponses[] = alexlia_mcp_message($msg);
    }
    if (!$reponses) return new WP_REST_Response(null, 202);
    return new WP_REST_Response(alexlia_mcp_liste($d) ? $reponses : $reponses[0], 200);
}

function alexlia_mcp_message($msg) {
    $id = $msg['id'];
    $m = (string) $msg['method'];
    $p = is_array($msg['params'] ?? null) ? $msg['params'] : [];
    $ok = function ($r) use ($id) { return ['jsonrpc' => '2.0', 'id' => $id, 'result' => $r]; };
    $ko = function ($c, $t) use ($id) { return ['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $c, 'message' => $t]]; };
    if ($m === 'initialize') {
        $v = (string) ($p['protocolVersion'] ?? '');
        return $ok(['protocolVersion' => in_array($v, ['2025-06-18', '2025-03-26', '2024-11-05'], true) ? $v : '2025-03-26', 'capabilities' => ['tools' => ['listChanged' => false]],
            'serverInfo' => ['name' => 'Les Minis Monstres', 'version' => ALEXLIA_CONN_VERSION], 'instructions' => 'Outils pour modifier le site WordPress de ce client. Lisez avant de modifier ; chaque changement garde une révision.']);
    }
    if ($m === 'ping') return $ok(new stdClass());
    if ($m === 'tools/list') {
        $l = [];
        foreach (alexlia_mcp_outils() as $nom => $o) $l[] = ['name' => $nom, 'description' => $o['description'], 'inputSchema' => $o['schema']];
        return $ok(['tools' => $l]);
    }
    if ($m === 'tools/call') {
        $nom = (string) ($p['name'] ?? '');
        $outils = alexlia_mcp_outils();
        if (!isset($outils[$nom])) return $ko(-32602, 'Outil inconnu : ' . $nom);
        $args = is_array($p['arguments'] ?? null) ? $p['arguments'] : [];
        $r = call_user_func($outils[$nom]['fn'], $args);
        if (is_wp_error($r)) return $ok(['content' => [['type' => 'text', 'text' => $r->get_error_message()]], 'isError' => true]);
        return $ok(['content' => [['type' => 'text', 'text' => (string) wp_json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]], 'isError' => false]);
    }
    return $ko(-32601, 'Méthode inconnue : ' . $m);
}

/* Les outils de Bricou */
function alexlia_mcp_outils() {
    $s = function ($props, $req = []) { return ['type' => 'object', 'properties' => $props ?: new stdClass(), 'required' => $req, 'additionalProperties' => false]; };
    $t = function ($d) { return ['type' => 'string', 'description' => $d]; };
    $n = function ($d) { return ['type' => 'integer', 'description' => $d]; };
    return [
        'site_infos' => ['description' => 'Nom, slogan, adresse, thème, page d’accueil et version de WordPress du site.', 'schema' => $s([]), 'fn' => function () {
            $i = alexlia_conn_infos();
            $i['theme'] = wp_get_theme()->get('Name');
            return $i;
        }],
        'lister_contenus' => ['description' => 'Liste les pages et articles du site (id, type, titre, statut, adresse). À utiliser d’abord pour trouver la bonne page.', 'schema' => $s(['type' => ['type' => 'string', 'enum' => ['page', 'post', 'any']]]), 'fn' => 'alexlia_conn_lister'],
        'lire_contenu' => ['description' => 'Lit le contenu complet d’une page ou d’un article (HTML et blocs WordPress), par son id. Toujours lire avant de modifier.', 'schema' => $s(['id' => $n('Identifiant')], ['id']), 'fn' => 'alexlia_conn_lire'],
        'remplacer_texte' => ['description' => 'Remplace un passage exact du contenu d’une page. « ancien » est copié tel quel depuis lire_contenu, balises comprises, assez long pour être unique. Renvoie revision_avant (pour restaurer).', 'schema' => $s(['id' => $n('Identifiant'), 'ancien' => $t('Passage exact à remplacer'), 'nouveau' => $t('Nouveau passage'), 'tous' => ['type' => 'boolean', 'description' => 'Remplacer toutes les occurrences']], ['id', 'ancien', 'nouveau']), 'fn' => 'alexlia_conn_remplacer'],
        'modifier_contenu' => ['description' => 'Remplace le titre et/ou tout le contenu d’une page ou d’un article. Garde la même structure de blocs WordPress que le contenu lu. Renvoie revision_avant.', 'schema' => $s(['id' => $n('Identifiant'), 'titre' => $t('Nouveau titre'), 'contenu' => $t('Nouveau contenu complet'), 'extrait' => $t('Nouvel extrait')], ['id']), 'fn' => 'alexlia_conn_modifier'],
        'creer_contenu' => ['description' => 'Crée une nouvelle page ou un nouvel article. Par défaut en brouillon ; statut « publish » pour le mettre en ligne tout de suite.', 'schema' => $s(['type' => ['type' => 'string', 'enum' => ['page', 'post']], 'titre' => $t('Titre'), 'contenu' => $t('Contenu en HTML simple'), 'statut' => ['type' => 'string', 'enum' => ['draft', 'publish']], 'image_id' => $n('Image à la une (id de la médiathèque)')], ['titre', 'contenu']), 'fn' => 'alexlia_mcp_creer'],
        'importer_image' => ['description' => 'Importe dans la médiathèque la photo envoyée par le client (adresse sur le site Les Minis Monstres). Renvoie l’id et la balise HTML.', 'schema' => $s(['url' => $t('Adresse de la photo'), 'description' => $t('Texte alternatif')], ['url']), 'fn' => 'alexlia_conn_image'],
        'lister_medias' => ['description' => 'Liste les 40 dernières images de la médiathèque (id, adresse, titre).', 'schema' => $s([]), 'fn' => function () {
            $o = [];
            foreach (get_posts(['post_type' => 'attachment', 'post_mime_type' => 'image', 'numberposts' => 40, 'post_status' => 'inherit']) as $a) $o[] = ['id' => $a->ID, 'adresse' => wp_get_attachment_url($a->ID), 'titre' => $a->post_title];
            return ['medias' => $o];
        }],
        'modifier_reglage' => ['description' => 'Change le nom ou le slogan du site (réglages WordPress). Attention : si le thème écrit le nom lui-même, il ne change pas à l’écran ; vérifiez avec texte_visible, puis utilisez affichage_remplacer.', 'schema' => $s(['nom' => ['type' => 'string', 'enum' => ['nom', 'slogan']], 'valeur' => $t('Nouvelle valeur')], ['nom', 'valeur']), 'fn' => 'alexlia_conn_reglage'],
        'texte_visible' => ['description' => 'Vérifie qu’un texte s’affiche bien sur une page du site (page d’accueil par défaut). Renvoie visible: true ou false.', 'schema' => $s(['texte' => $t('Texte à chercher'), 'adresse' => $t('Adresse de la page (facultatif)')], ['texte']), 'fn' => function ($a) {
            $u = esc_url_raw((string) ($a['adresse'] ?? '')) ?: home_url('/');
            if (wp_parse_url($u, PHP_URL_HOST) !== wp_parse_url(home_url('/'), PHP_URL_HOST)) return new WP_Error('alexlia_adresse', 'Adresse hors du site.');
            return ['visible' => alexlia_conn_texte_visible(add_query_arg('alexlia_v', time(), $u), (string) ($a['texte'] ?? ''))];
        }],
        'affichage_remplacer' => ['description' => 'Remplace à l’écran un texte que le thème écrit lui-même (nom du site dans l’en-tête ou le pied de page par exemple), sur toutes les pages. Les textes des pages se changent avec remplacer_texte, pas avec cet outil.', 'schema' => $s(['ancien' => $t('Texte actuel tel qu’affiché'), 'nouveau' => $t('Nouveau texte')], ['ancien', 'nouveau']), 'fn' => function ($a) {
            $anc = trim((string) ($a['ancien'] ?? '')); $nou = trim((string) ($a['nouveau'] ?? ''));
            if ($anc === '' || mb_strlen($anc) > 200 || mb_strlen($nou) > 200) return new WP_Error('alexlia_args', 'Textes manquants ou trop longs.');
            alexlia_conn_affichage_ajouter($anc, $nou);
            return ['ok' => true, 'annuler_avec' => 'affichage_annuler (ancien = « ' . $anc . ' »)'];
        }],
        'affichage_annuler' => ['description' => 'Retire un remplacement d’affichage fait avec affichage_remplacer (remet le texte du thème).', 'schema' => $s(['ancien' => $t('Texte « ancien » du remplacement à retirer')], ['ancien']), 'fn' => function ($a) {
            $anc = trim((string) ($a['ancien'] ?? ''));
            $l = array_values(array_filter(alexlia_conn_affichages(), function ($x) use ($anc) { return ($x['ancien'] ?? '') !== $anc; }));
            update_option('alexlia_affichages', $l, false);
            alexlia_conn_journal('Remplacement d’affichage retiré : « ' . $anc . ' ».');
            return ['ok' => true, 'restants' => count($l)];
        }],
        'css_lire' => ['description' => 'Lit le CSS additionnel du site (réglages > CSS additionnel).', 'schema' => $s([]), 'fn' => function () { return ['css' => (string) wp_get_custom_css()]; }],
        'css_modifier' => ['description' => 'Remplace tout le CSS additionnel du site. Lisez d’abord avec css_lire et gardez le CSS existant. Renvoie l’ancien CSS (« avant »).', 'schema' => $s(['css' => $t('CSS complet')], ['css']), 'fn' => function ($a) {
            $css = (string) ($a['css'] ?? '');
            if (strlen($css) > 60000) return new WP_Error('alexlia_args', 'CSS trop long.');
            $avant = (string) wp_get_custom_css();
            $r = wp_update_custom_css_post(wp_strip_all_tags($css));
            if (is_wp_error($r)) return $r;
            alexlia_conn_journal('CSS additionnel modifié.');
            return ['ok' => true, 'avant' => mb_substr($avant, 0, 12000)];
        }],
        'lister_revisions' => ['description' => 'Liste les révisions gardées pour une page ou un article (id de révision, date).', 'schema' => $s(['id' => $n('Identifiant de la page')], ['id']), 'fn' => function ($a) {
            $p = alexlia_conn_post($a['id'] ?? 0);
            if (!$p) return new WP_Error('alexlia_introuvable', 'Contenu introuvable.');
            $o = [];
            foreach (wp_get_post_revisions($p->ID, ['numberposts' => 15]) as $r) $o[] = ['revision' => $r->ID, 'date' => $r->post_modified, 'titre' => $r->post_title];
            return ['revisions' => $o];
        }],
        'retirer_contenu_cree' => ['description' => 'Met à la corbeille une page ou un article créé avec creer_contenu (seulement ceux-là, dans les 14 jours). Sert à annuler une création.', 'schema' => $s(['id' => $n('Identifiant donné par creer_contenu')], ['id']), 'fn' => function ($a) {
            $id = (int) ($a['id'] ?? 0);
            $crees = get_option('alexlia_mcp_crees', []);
            if (!is_array($crees) || empty($crees[$id]) || time() - (int) $crees[$id] > 14 * DAY_IN_SECONDS || !alexlia_conn_post($id)) return new WP_Error('alexlia_args', 'Seuls les contenus créés par Bricou récemment peuvent être retirés.');
            wp_trash_post($id);
            unset($crees[$id]);
            update_option('alexlia_mcp_crees', $crees, false);
            alexlia_conn_journal('Contenu créé retiré (#' . $id . ').');
            return ['ok' => true];
        }],
        'restaurer_revision' => ['description' => 'Remet une page comme elle était dans une révision (revision_avant donné par remplacer_texte ou modifier_contenu). Sert à tout annuler.', 'schema' => $s(['revision' => $n('Identifiant de la révision')], ['revision']), 'fn' => 'alexlia_conn_restaurer'],
    ];
}

function alexlia_mcp_creer($a) {
    $type = ($a['type'] ?? 'page') === 'post' ? 'post' : 'page';
    $titre = sanitize_text_field((string) ($a['titre'] ?? ''));
    $contenu = alexlia_conn_propre($a['contenu'] ?? '');
    if ($titre === '' || $contenu === '') return new WP_Error('alexlia_args', 'Titre et contenu obligatoires.');
    $id = wp_insert_post(['post_type' => $type, 'post_status' => ($a['statut'] ?? 'draft') === 'publish' ? 'publish' : 'draft', 'post_title' => $titre, 'post_content' => $contenu], true);
    if (is_wp_error($id)) return $id;
    $img = (int) ($a['image_id'] ?? 0);
    if ($img && get_post_type($img) === 'attachment') set_post_thumbnail($id, $img);
    $crees = get_option('alexlia_mcp_crees', []);
    $crees = is_array($crees) ? $crees : [];
    $crees[(int) $id] = time();
    update_option('alexlia_mcp_crees', array_slice($crees, -50, null, true), false);
    alexlia_conn_journal('Contenu créé : « ' . $titre . ' ».');
    return ['ok' => true, 'id' => (int) $id, 'statut' => get_post_status($id), 'adresse' => get_permalink($id), 'pour_annuler' => 'retirer_contenu_cree avec cet id'];
}
