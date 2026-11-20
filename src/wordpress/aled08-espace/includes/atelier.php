<?php
/**
 * Les Minis Monstres Espace client : l'atelier.
 * Un seul branchement pour tous les sites des clients : l'administrateur des Minis Monstres (Alex, ou Claude relié à ce site)
 * envoie ici une action, et l'espace client la transmet au site du client, signée avec sa clé de liaison.
 *  GET  /wp-json/aled08/v1/atelier            la liste des sites reliés
 *  POST /wp-json/aled08/v1/atelier            { site: "exemple.fr" ou numéro de fiche, action: "…", args: { … } }
 * Actions utiles : infos, lister, lire, atelier_rest { methode, route, requete, corps }, atelier_image { url | base64, nom, alt }.
 * La clé du site ne sort jamais d'ici.
 */
defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => 'aled08e_atelier_sites'],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_atelier_action'],
    ]);
});

function aled08e_atelier_sites() {
    $l = [];
    foreach (get_users(['meta_key' => 'aled08_lia_url', 'meta_compare' => 'EXISTS', 'number' => 500]) as $u) {
        $url = aled08e_meta($u->ID, 'lia_url');
        if ($url === '') continue;
        $l[] = ['fiche' => (int) $u->ID, 'client' => $u->display_name, 'site' => untrailingslashit($url), 'relie' => aled08e_meta($u->ID, 'lia_secret') !== '', 'visuel' => aled08e_meta($u->ID, 'visuel_fait') ?: 'à faire'];
    }
    return new WP_REST_Response(['sites' => $l, 'en_attente_de_fiche' => array_keys(function_exists('aled08e_relier_attente') ? aled08e_relier_attente() : [])], 200);
}

function aled08e_atelier_fiche($site) {
    if (is_numeric($site)) return get_userdata((int) $site) ? (int) $site : 0;
    $hote = aled08e_relier_hote(strpos((string) $site, '://') === false ? 'https://' . $site : (string) $site);
    return $hote === '' ? 0 : (int) aled08e_relier_client($hote);
}

function aled08e_atelier_action(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $uid = aled08e_atelier_fiche($p['site'] ?? '');
    if (!$uid) return new WP_Error('aled08_atelier', 'Aucune fiche client ne porte ce site.', ['status' => 404]);
    $action = sanitize_key((string) ($p['action'] ?? ''));
    if ($action === '') return new WP_Error('aled08_atelier', 'Action manquante.', ['status' => 400]);
    // le visuel est terminé : on le note sur la fiche (rien n'est envoyé au site)
    if ($action === 'visuel_fait') { update_user_meta($uid, 'aled08_visuel_fait', wp_date('Y-m-d')); return new WP_REST_Response(['ok' => true], 200); }
    @set_time_limit(180);
    $r = aled08e_lia_appel($uid, $action, is_array($p['args'] ?? null) ? $p['args'] : []);
    if (is_wp_error($r)) return new WP_Error('aled08_atelier', $r->get_error_message(), ['status' => 502]);
    return new WP_REST_Response($r, 200);
}

/* =========================================================================
 *  Les chantiers : la création d'un site, de la commande au « prêt à vérifier », sans Alex.
 *  L'atelier (Claude relié à ce site) lit la liste, pose ses questions au client (e-mail + espace client),
 *  fait le visuel par atelier_rest, puis prévient Alex : c'est le seul e-mail qu'il reçoit.
 *   GET  /aled08/v1/atelier/chantiers                 les commandes payées pas encore en ligne
 *   POST /aled08/v1/atelier/chantier { commande, faire: question | note | a_verifier, texte }
 *  États (_aled08_chantier) : '' (à lire), question (on attend le client), reponse (le client a répondu), visuel, a_verifier.
 * ========================================================================= */
function aled08e_chantier_auto() { return get_option('aled08_chantier_auto', '1') === '1'; }
function aled08e_chantier_fil($cid) { $f = get_post_meta((int) $cid, '_aled08_chantier_fil', true); return is_array($f) ? $f : []; }
function aled08e_chantier_fil_ajouter($cid, $qui, $texte) {
    $f = aled08e_chantier_fil($cid);
    $f[] = ['qui' => $qui === 'client' ? 'client' : 'bande', 'texte' => mb_substr(trim((string) $texte), 0, 4000), 'le' => current_time('mysql')];
    update_post_meta((int) $cid, '_aled08_chantier_fil', array_slice($f, -60));
}
function aled08e_chantier_etat($cid) { return (string) get_post_meta((int) $cid, '_aled08_chantier', true); }

add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/chantiers', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => 'aled08e_chantiers_liste']);
    register_rest_route('aled08/v1', '/atelier/chantier', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_chantier_faire']);
});

function aled08e_chantiers_liste(WP_REST_Request $req) {
    $ids = get_posts(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'any', 'numberposts' => 40, 'fields' => 'ids', 'orderby' => 'date', 'order' => 'ASC',
        'meta_query' => [['key' => '_aled08_statut', 'value' => aled08e_cmd_statuts_en_cours(), 'compare' => 'IN']]]);
    $detail = (int) $req->get_param('commande');
    $out = [];
    foreach ($ids as $cid) {
        $c = aled08e_cmd_get($cid);
        if (!$c) continue;
        $etat = aled08e_chantier_etat($cid);
        $brief = aled08e_brief_le($cid) !== '' && !get_post_meta($cid, '_aled08_brief_brouillon', true);
        $pose = (bool) get_post_meta($cid, '_aled08_pose_fin', true);
        $relie = $c['user'] && aled08e_meta($c['user'], 'lia_secret') !== '' && aled08e_meta($c['user'], 'lia_url') !== '';
        // ce qu'il y a à faire maintenant, en clair
        if ($etat === 'a_verifier') $afaire = 'rien : Alex vérifie';
        elseif (!$brief) $afaire = 'rien : on attend le questionnaire du client';
        elseif ($etat === 'question') $afaire = 'rien : on attend la réponse du client';
        elseif (!$relie) $afaire = 'lire le questionnaire et poser les questions utiles ; le site n’est pas encore installé (' . $c['statut'] . ')';
        else $afaire = 'faire le visuel (questionnaire reçu, site installé et relié)';
        $l = ['commande' => (int) $cid, 'ref' => $c['ref'], 'prenom' => $c['prenom'], 'activite' => $c['entreprise'], 'type' => $c['type'], 'forfait' => $c['forfait'], 'domaine' => $c['domaine'],
            'statut' => $c['statut'], 'questionnaire_recu' => $brief, 'site_installe' => $pose, 'site_relie' => $relie, 'etat' => $etat ?: 'a_lire', 'a_faire' => $afaire];
        if ($detail === (int) $cid) {
            $l['questionnaire'] = $brief ? aled08e_brief_texte($cid) : '';
            $l['echanges'] = aled08e_chantier_fil($cid);
            $l['journal'] = array_slice((array) get_post_meta($cid, '_aled08_journal', true), -15);
        }
        $out[] = $l;
    }
    return new WP_REST_Response(['chantiers' => $out, 'aide' => 'Ajoutez ?commande=ID pour lire le questionnaire et les échanges d’un chantier.'], 200);
}

function aled08e_chantier_faire(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $cid = (int) ($p['commande'] ?? 0);
    $c = $cid ? aled08e_cmd_get($cid) : null;
    if (!$c) return new WP_Error('aled08_chantier', 'Commande introuvable.', ['status' => 404]);
    $faire = sanitize_key((string) ($p['faire'] ?? ''));
    $texte = trim(wp_strip_all_tags((string) ($p['texte'] ?? '')));
    $site = $c['domaine'] ? 'https://' . $c['domaine'] . '/' : '';
    if ($faire === 'question') {
        if ($texte === '') return new WP_Error('aled08_chantier', 'Texte manquant.', ['status' => 400]);
        if (!is_email($c['email'])) return new WP_Error('aled08_chantier', 'Pas d’adresse e-mail sur cette commande.', ['status' => 400]);
        aled08e_chantier_fil_ajouter($cid, 'bande', $texte);
        update_post_meta($cid, '_aled08_chantier', 'question');
        update_post_meta($cid, '_aled08_chantier_question_le', time());
        $lien = aled08e_url() . '#commande';
        wp_mail($c['email'], 'Une petite question pour votre site', 'Bonjour ' . $c['prenom'] . ",\n\nPour avancer sur votre site, nous avons besoin d’une précision :\n\n" . $texte
            . "\n\nPour répondre, c’est ici, dans votre espace client (onglet « Ma commande ») :\n" . $lien . "\n\nMerci, et à très vite !\nLes Minis Monstres\n", aled08e_mail_headers());
        aled08e_cmd_journal($cid, 'Atelier : question envoyée au client.');
        return new WP_REST_Response(['ok' => true, 'etat' => 'question'], 200);
    }
    if ($faire === 'note') {
        if ($texte === '') return new WP_Error('aled08_chantier', 'Texte manquant.', ['status' => 400]);
        aled08e_cmd_journal($cid, 'Atelier : ' . mb_substr($texte, 0, 500));
        if (!empty($p['etat']) && in_array($p['etat'], ['visuel', 'reponse'], true)) update_post_meta($cid, '_aled08_chantier', $p['etat']);
        return new WP_REST_Response(['ok' => true], 200);
    }
    if ($faire === 'a_verifier') {
        update_post_meta($cid, '_aled08_chantier', 'a_verifier');
        if ($c['user']) update_user_meta($c['user'], 'aled08_visuel_fait', wp_date('Y-m-d'));
        if ($c['statut'] === 'pret') aled08e_cmd_set_statut($cid, 'en_creation', 'Visuel fait par l’atelier, à vérifier.');
        aled08e_cmd_journal($cid, 'Atelier : site prêt à vérifier.');
        wp_mail(aled08e_to(), 'Site prêt à vérifier : ' . ($c['domaine'] ?: aled08e_cmd_nom($c)),
            'Le site de ' . aled08e_cmd_nom($c) . ' (' . $c['ref'] . ") est prêt. Il ne reste qu’à le regarder et à peaufiner.\n\n" . ($site ? 'Le site : ' . $site . "\n" : '')
            . ($texte !== '' ? "\nCe qui a été fait, et ce qui reste à voir :\n" . $texte . "\n" : '')
            . "\nQuand il vous plaît, passez la commande « En ligne » : le client est prévenu et règle le reste.\n" . aled08e_cmd_admin_url($cid) . "\n", aled08e_mail_headers());
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_verifier'], 200);
    }
    return new WP_Error('aled08_chantier', 'À faire inconnu (question, note, a_verifier).', ['status' => 400]);
}

/* Le client répond dans son espace, onglet « Ma commande » */
add_action('template_redirect', function () {
    if (empty($_POST['aled08e_chantier_rep']) || !is_user_logged_in()) return;
    $cid = (int) $_POST['aled08e_chantier_rep'];
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_chantier'] ?? '')), 'aled08e_chantier_' . $cid)) return;
    $c = aled08e_cmd_get($cid);
    if (!$c || (int) $c['user'] !== get_current_user_id()) return;
    $t = trim(sanitize_textarea_field(wp_unslash($_POST['reponse'] ?? '')));
    if ($t !== '') {
        aled08e_chantier_fil_ajouter($cid, 'client', $t);
        update_post_meta($cid, '_aled08_chantier', 'reponse');
        aled08e_cmd_journal($cid, 'Le client a répondu à la question de l’atelier.');
    }
    wp_safe_redirect(aled08e_url() . '#commande', 303);
    exit;
}, 6);

function aled08e_chantier_html($cmd) {
    $fil = aled08e_chantier_fil($cmd['id']);
    if (!$fil) return '';
    $h = '<div class="esp-chantier" id="chantier"><p class="app-sub">Nos questions pour votre site</p>';
    foreach ($fil as $m) $h .= '<p class="esp-chantier-msg is-' . esc_attr($m['qui']) . '"><strong>' . ($m['qui'] === 'client' ? 'Vous' : 'Les Minis Monstres') . '</strong><br>' . nl2br(esc_html($m['texte'])) . '</p>';
    if (aled08e_chantier_etat($cmd['id']) === 'question') {
        $h .= '<form method="post" class="esp-chantier-form"><input type="hidden" name="aled08e_chantier_rep" value="' . (int) $cmd['id'] . '">' . wp_nonce_field('aled08e_chantier_' . $cmd['id'], '_aled08e_chantier', true, false)
            . '<div class="field"><label for="chantier-rep">Votre réponse</label><textarea id="chantier-rep" name="reponse" rows="4" maxlength="4000" required></textarea></div>'
            . '<button type="submit" class="btn btn-primary">Envoyer ma réponse</button></form>';
    } elseif (end($fil)['qui'] === 'client') {
        $h .= '<p class="esp-chantier-msg">Merci, votre réponse est bien arrivée. On continue votre site.</p>';
    }
    return $h . '</div>';
}

/* Rappel au client resté sans répondre : une fois, au bout de 3 jours */
add_action('aled08_horaire', function () {
    $ids = get_posts(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'any', 'numberposts' => 20, 'fields' => 'ids', 'meta_query' => [['key' => '_aled08_chantier', 'value' => 'question']]]);
    foreach ($ids as $cid) {
        $le = (int) get_post_meta($cid, '_aled08_chantier_question_le', true);
        if (!$le || $le > time() - 3 * DAY_IN_SECONDS || get_post_meta($cid, '_aled08_chantier_rappel', true) == $le) continue;
        $c = aled08e_cmd_get($cid);
        if (!$c || !is_email($c['email']) || !in_array($c['statut'], aled08e_cmd_statuts_en_cours(), true)) continue;
        update_post_meta($cid, '_aled08_chantier_rappel', $le);
        wp_mail($c['email'], 'Votre site attend votre réponse', 'Bonjour ' . $c['prenom'] . ",\n\nNous avons une question en attente pour votre site. Dès que vous y répondez, on reprend :\n" . aled08e_url() . "#commande\n\nMerci !\nLes Minis Monstres\n", aled08e_mail_headers());
    }
});
