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
 *   POST /aled08/v1/atelier/chantier { commande, faire: question | note | a_verifier | en_ligne (+ accord_alex), texte, resume }
 *   « resume » : le contenu du site expliqué au client, repris dans l'e-mail « Votre site est en ligne ».
 *   « pages_total » : le nombre de pages du site ; « pages_google » : celles faites pour Google (Site Visibilité et Site Boutique). Tous deux annoncés dans ce même e-mail.
 *   « articles » : le nombre d'articles mis dans la boutique (Site Boutique), annoncé aussi.
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
        $lien = esc_url_raw((string) ($p['lien'] ?? ''));
        if ($lien !== '' && wp_parse_url($lien, PHP_URL_SCHEME) !== 'https') $lien = '';
        if ($lien !== '') update_post_meta($cid, '_aled08_apercu', $lien);
        aled08e_chantier_resume_garder($cid, $p);
        aled08e_chantier_mail_verifier($c, $texte, $lien);
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_verifier'], 200);
    }
    if ($faire === 'en_ligne') {
        // seulement quand Alex l'a dit lui-même dans la conversation
        if (empty($p['accord_alex'])) return new WP_Error('aled08_chantier', 'Il faut l’accord d’Alex.', ['status' => 400]);
        if (aled08e_chantier_etat($cid) !== 'a_verifier') return new WP_Error('aled08_chantier', 'Ce site n’a pas encore été envoyé à la vérification.', ['status' => 409]);
        aled08e_chantier_resume_garder($cid, $p);
        aled08e_cmd_set_statut($cid, 'en_ligne', 'Mis en ligne avec l’accord d’Alex.');
        update_post_meta($cid, '_aled08_chantier', 'en_ligne');
        return new WP_REST_Response(['ok' => true, 'statut' => 'en_ligne'], 200);
    }
    if ($faire === 'livrer') {
        // depuis le 21 novembre 2026 : l'atelier livre lui-même la V1 au client (accord général d'Alex), puis prévient Alex
        if (!in_array($c['statut'], ['pret', 'en_creation'], true)) return new WP_Error('aled08_chantier', 'Cette commande n’est pas en création (statut ' . $c['statut'] . ').', ['status' => 409]);
        if (empty($p['resume'])) return new WP_Error('aled08_chantier', 'Le résumé pour le client (resume) est obligatoire.', ['status' => 400]);
        $lien = esc_url_raw((string) ($p['lien'] ?? ''));
        if ($lien !== '' && wp_parse_url($lien, PHP_URL_SCHEME) !== 'https') $lien = '';
        if ($lien !== '') update_post_meta($cid, '_aled08_apercu', $lien);
        aled08e_chantier_resume_garder($cid, $p);
        if ($c['user']) update_user_meta($c['user'], 'aled08_visuel_fait', wp_date('Y-m-d'));
        aled08e_cmd_set_statut($cid, 'en_ligne', 'V1 livrée par l’atelier.');
        update_post_meta($cid, '_aled08_chantier', 'en_ligne');
        aled08e_cmd_journal($cid, 'Atelier : V1 livrée au client, e-mail « Votre site est en ligne » envoyé.');
        // Alex est prévenu, sans rien à valider
        $site = $lien !== '' ? $lien : ($c['domaine'] ? 'https://' . $c['domaine'] . '/' : (string) aled08e_meta($c['user'], 'site'));
        wp_mail(aled08e_to(), 'Site livré (V1) : ' . ($c['entreprise'] ?: $c['prenom'] . ' ' . $c['nom']), 'L’atelier a livré la V1 du site au client, avec l’e-mail « Votre site est en ligne ».' . "\n\nSite : " . $site . "\nCommande : " . $c['ref'] . ' ' . aled08e_cmd_admin_url($cid) . "\n\nNote de l’atelier :\n" . $texte . "\n\nCe que le client a reçu :\n" . (string) $p['resume'] . "\n", aled08e_mail_headers());
        return new WP_REST_Response(['ok' => true, 'statut' => 'en_ligne'], 200);
    }
    return new WP_Error('aled08_chantier', 'À faire inconnu (question, note, a_verifier, livrer, en_ligne).', ['status' => 400]);
}

/* L'e-mail à Alex, le seul du parcours : le site à regarder, puis la réponse se donne dans la conversation avec Claude */
function aled08e_chantier_conversation() { return (string) get_option('aled08_atelier_conversation', 'https://claude.ai/code') ?: 'https://claude.ai/code'; }
/* Le résumé du contenu du site, écrit pour le client (une ligne par partie) */
function aled08e_chantier_resume($cid) { return (string) get_post_meta($cid, '_aled08_resume', true); }
function aled08e_chantier_resume_garder($cid, $p) {
    $r = trim(sanitize_textarea_field((string) ($p['resume'] ?? '')));
    if ($r !== '') update_post_meta($cid, '_aled08_resume', mb_substr($r, 0, 4000));
    if (isset($p['pages_google'])) update_post_meta($cid, '_aled08_pages_google', max(0, min(200, (int) $p['pages_google'])));
    if (isset($p['pages_total'])) update_post_meta($cid, '_aled08_pages_total', max(0, min(300, (int) $p['pages_total'])));
    if (isset($p['articles'])) update_post_meta($cid, '_aled08_articles', max(0, min(5000, (int) $p['articles'])));
}
/* Le nombre de pages faites pour Google (Site Visibilité et Site Boutique) */
function aled08e_chantier_pages_google($cid) { return (int) get_post_meta($cid, '_aled08_pages_google', true); }
function aled08e_chantier_pages_total($cid) { return (int) get_post_meta($cid, '_aled08_pages_total', true); }
/* Le nombre d'articles mis dans la boutique (Site Boutique) */
function aled08e_chantier_articles($cid) { return (int) get_post_meta($cid, '_aled08_articles', true); }
function aled08e_chantier_mail_verifier($c, $texte, $lien = '') {
    $site = $lien !== '' ? $lien : ($c['domaine'] ? 'https://' . $c['domaine'] . '/' : (string) aled08e_meta($c['user'], 'site'));
    $p = function ($t) { return '<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#CFCBEA;">' . $t . '</p>'; };
    $h = '<h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#FFFFFF;">Un site est prêt à vérifier</h1>'
        . $p('Le site de <b style="color:#FFFFFF;">' . esc_html(aled08e_cmd_nom($c)) . '</b> (' . esc_html($c['ref']) . ') est prêt. Il ne reste qu’à le regarder.')
        . ($site ? aled08e_mail_bouton($site, 'Voir le site') . '<p style="margin:-6px 0 18px;font-size:14px;color:#A9D9C5;">' . esc_html(preg_replace('#^https?://#', '', untrailingslashit($site))) . '</p>' : '')
        . ($texte !== '' ? '<p style="margin:0 0 8px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#FF8EBF;">Ce que j’ai fait, et ce qui reste à voir</p>' . $p(nl2br(esc_html($texte))) : '')
        . (($pg = aled08e_chantier_pages_google($c['id'])) > 0 || aled08e_chantier_pages_total($c['id']) > 0 ? $p('Annoncé au client : <b style="color:#FFFFFF;">' . aled08e_chantier_pages_total($c['id']) . ' pages en tout, dont ' . $pg . ' pages de visibilité Google</b>.') : '')
        . (($res = aled08e_chantier_resume($c['id'])) !== '' ? '<p style="margin:0 0 8px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#FFD36E;">Le résumé que le client recevra</p>' . $p(nl2br(esc_html($res))) : '')
        . '<p style="margin:8px 0 8px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#7BDDB1;">Et ensuite ?</p>'
        . $p('Revenez dans la conversation avec Claude et dites simplement :<br>« <b style="color:#FFFFFF;">OK</b> » pour mettre le site en ligne (le client est prévenu et son forfait démarre),<br>ou ce que vous voulez changer.')
        . aled08e_mail_bouton(aled08e_chantier_conversation(), 'Répondre dans la conversation')
        . '<p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:#8B86B3;">La commande dans l’administration : <a href="' . esc_url(aled08e_cmd_admin_url($c['id'])) . '" style="color:#8B86B3;">' . esc_html($c['ref']) . '</a></p>';
    $alt = function ($m) use ($c, $site, $texte) { $m->AltBody = 'Le site de ' . aled08e_cmd_nom($c) . ' (' . $c['ref'] . ") est prêt à vérifier.\n\nLe site : " . $site . "\n\n" . ($texte !== '' ? $texte . "\n\n" : '') . "Revenez dans la conversation avec Claude : « OK » pour le mettre en ligne, ou ce que vous voulez changer.\n" . aled08e_chantier_conversation() . "\n"; };
    add_action('phpmailer_init', $alt, 20);
    wp_mail(aled08e_to(), 'Site prêt à vérifier : ' . ($c['domaine'] ?: aled08e_cmd_nom($c)), aled08e_mail_coque('Site prêt à vérifier', $h, 'Un site est prêt : regardez-le, puis dites OK ou ce qu’il faut changer.'), ['Content-Type: text/html; charset=UTF-8']);
    remove_action('phpmailer_init', $alt, 20);
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

/* =========================================================================
 *  La grande jauge de création, en haut de l'espace client.
 *  Tant que le site n'est pas en ligne, l'espace ne montre que l'utile : l'accueil, « Ma commande » et « Mon compte ».
 *  Les onglets qui ont besoin du site (demandes, extras, boutique, outils) restent fermés, avec leur cadenas.
 * ========================================================================= */
function aled08e_jauge_active($cmd) {
    return $cmd && ($cmd['statut'] === 'attente_paiement' || in_array($cmd['statut'], aled08e_cmd_statuts_en_cours(), true));
}
function aled08e_jauge_verrou($cmd) { return aled08e_jauge_active($cmd) ? 'demandes,extras,vacances,outils' : ''; }
function aled08e_jauge_etat($cmd) {
    $s = $cmd['statut'];
    $cid = $cmd['id'];
    $brief = aled08e_brief_le($cid) !== '' && !get_post_meta($cid, '_aled08_brief_brouillon', true);
    $ch = aled08e_chantier_etat($cid);
    $infra = ['payee' => 30, 'domaine_commande' => 36, 'domaine_attribue' => 42, 'hebergement' => 48, 'ssl' => 55];
    $r = ['etape' => 0, 'pct' => 5, 'titre' => 'Votre commande attend son paiement', 'texte' => 'Dès que le paiement est confirmé, tout démarre.', 'bouton' => 'Voir ma commande', 'avous' => true];
    if ($s === 'attente_paiement') return $r;
    $r['avous'] = false; $r['bouton'] = 'Suivre ma commande';
    if (isset($infra[$s])) $r = array_merge($r, ['etape' => 2, 'pct' => $infra[$s], 'titre' => 'On prépare la maison de votre site', 'texte' => 'Votre nom de domaine et votre hébergement se mettent en place. Vous n’avez rien à faire pour cette étape.']);
    else $r = array_merge($r, ['etape' => 3, 'pct' => 70, 'titre' => 'Votre site est en cours de création', 'texte' => 'On crée vos pages avec vos textes, vos couleurs et vos photos.']);
    if ($ch === 'a_verifier') $r = array_merge($r, ['etape' => 4, 'pct' => 90, 'titre' => 'Dernières vérifications', 'texte' => 'Votre site est presque prêt : Alex le relit et le peaufine avant de vous le présenter.']);
    if (!$brief) return array_merge($r, ['etape' => 1, 'pct' => min($r['pct'], 20), 'titre' => 'À vous : remplissez votre questionnaire', 'texte' => 'C’est lui qui lance la création : vos couleurs, vos textes, vos photos. Dix minutes suffisent.', 'bouton' => 'Remplir mon questionnaire', 'avous' => true]);
    if ($ch === 'question') return array_merge($r, ['titre' => 'À vous : une question vous attend', 'texte' => 'Nous avons besoin d’une précision pour continuer votre site.', 'bouton' => 'Répondre à la question', 'avous' => true]);
    return $r;
}
function aled08e_jauge_html($cmd) {
    if (!aled08e_jauge_active($cmd)) return '';
    $e = aled08e_jauge_etat($cmd);
    $etapes = ['Paiement', 'Questionnaire', 'Domaine et hébergement', 'Création', 'Vérification', 'En ligne'];
    $h = '<section class="esp-jauge' . ($e['avous'] ? ' is-avous' : '') . '" id="jauge-creation" aria-label="Avancement de la création de votre site">'
        . '<div class="esp-jauge-tete"><span class="esp-jauge-art" aria-hidden="true">' . aled08e_monster($e['avous'] ? 'mascotte' : ($e['etape'] === 3 ? 'bricou' : ($e['etape'] === 4 ? 'etoile' : 'mochi'))) . '</span>'
        . '<div class="esp-jauge-txt"><p class="esp-jauge-titre">' . esc_html($e['titre']) . '</p><p>' . esc_html($e['texte']) . '</p></div>'
        . '<strong class="esp-jauge-pct">' . (int) $e['pct'] . '&nbsp;%</strong></div>'
        . '<div class="esp-jauge-barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' . (int) $e['pct'] . '"><i style="width:' . (int) $e['pct'] . '%"></i></div>'
        . '<ol class="esp-jauge-etapes">';
    foreach ($etapes as $i => $lab) $h .= '<li class="' . ($i < $e['etape'] ? 'is-done' : ($i === $e['etape'] ? 'is-now' : '')) . '"><span>' . esc_html($lab) . '</span></li>';
    $h .= '</ol><div class="esp-jauge-pied"><button type="button" class="btn ' . ($e['avous'] ? 'btn-primary' : 'btn-ghost') . '" data-go="commande">' . esc_html($e['bouton']) . '</button>'
        . '<p class="esp-jauge-note">' . aled08e_icon('lock') . '<span>Demandes, extras et boutique s’ouvrent dès que votre site est en ligne.</span></p></div></section>';
    return $h;
}

/* =========================================================================
 *  La commande d'essai : rejouer tout le parcours d'un client sans rien payer ni rien acheter.
 *  POST /aled08/v1/atelier/essai { faire: creer | etape | questionnaire | connexion | livraison (+ resume, pages_total, pages_google, articles) | supprimer, … }
 *  Le compte et la commande portent la marque « essai » : l'automate les ignore (pas de domaine acheté, pas d'hébergement).
 * ========================================================================= */
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/atelier/essai', ['methods' => 'POST', 'permission_callback' => function () { return current_user_can('manage_options'); }, 'callback' => 'aled08e_essai_faire']);
});
function aled08e_essai_faire(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $faire = sanitize_key((string) ($p['faire'] ?? ''));
    if ($faire === 'creer') {
        $email = sanitize_email((string) ($p['email'] ?? ''));
        if (!is_email($email)) return new WP_Error('aled08_essai', 'Adresse e-mail obligatoire.', ['status' => 400]);
        $ex = get_user_by('email', $email);
        if ($ex && get_user_meta($ex->ID, 'aled08_essai', true) !== '1') return new WP_Error('aled08_essai', 'Cette adresse est déjà celle d’un vrai compte.', ['status' => 409]);
        $cfg = ['type' => in_array(($p['type'] ?? ''), ['une-page', 'vitrine', 'boutique'], true) ? $p['type'] : 'vitrine', 'forfait' => 'base', 'periode' => 'mois', 'lissage' => 0, 'options' => [], 'pages_plus' => 0,
            'domaine' => aled08e_cmd_nettoyer_domaine((string) ($p['domaine'] ?? '')) ?: 'essai-minis-monstres.fr', 'domaine_mien' => true, 'parrain' => '', 'code_evenement' => '', 'remise' => 0];
        $t = function ($k, $def) use ($p) { $v = sanitize_text_field((string) ($p[$k] ?? '')); return $v !== '' ? $v : $def; };
        $c = ['prenom' => $t('prenom', 'Camille'), 'nom' => $t('nom', 'Essai'), 'entreprise' => $t('entreprise', 'La Boulangerie d’Essai'), 'adresse' => $t('adresse', '1 rue de l’Essai'),
            'code_postal' => $t('code_postal', '08000'), 'ville' => $t('ville', 'Charleville-Mézières'), 'telephone' => '0600000000', 'email' => $email];
        $compte = aled08e_compte_pour_commande($c + $cfg);
        if (is_wp_error($compte)) return $compte;
        $uid = (int) $compte['id'];
        update_user_meta($uid, 'aled08_essai', '1');
        $type = aled08e_type($cfg['type']);
        $pid = wp_insert_post(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'private', 'post_author' => $uid, 'post_title' => 'ESSAI : ' . $c['prenom'] . ' ' . $c['nom'] . ' (' . $type['label'] . ')', 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
        if (is_wp_error($pid)) return $pid;
        $metas = ['ref' => 'ESSAI-' . $pid, 'essai' => 1, 'type' => $cfg['type'], 'forfait' => 'base', 'periode' => 'mois', 'lissage' => 0, 'options' => [], 'pages_plus' => 0, 'domaine' => $cfg['domaine'], 'domaine_mien' => 1, 'domaine_statut' => 'client',
            'statut' => 'attente_paiement', 'montants' => aled08e_cmd_montants($cfg), 'message' => '', 'parrain' => '', 'user' => $uid, 'code_evenement' => '', 'remise' => 0,
            'stripe_session' => '', 'stripe_customer' => '', 'stripe_subscription' => '', 'stripe_lissage_item' => '', 'lissage_paye' => 0, 'solde_paye' => 0, 'solde_session' => '', 'demarrage' => 'oui', 'demarrage_le' => time()];
        foreach ($c + $metas as $k => $v) update_post_meta($pid, '_aled08_' . $k, $v);
        aled08e_cmd_journal($pid, 'Commande d’essai créée par l’atelier : rien n’est payé, rien n’est acheté.');
        return new WP_REST_Response(['ok' => true, 'commande' => (int) $pid, 'fiche' => $uid], 200);
    }
    $cid = (int) ($p['commande'] ?? 0);
    if ($faire === 'supprimer') {
        $n = 0;
        foreach (get_posts(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'any', 'numberposts' => 50, 'fields' => 'ids', 'meta_query' => [['key' => '_aled08_essai', 'value' => '1']]]) as $id) { wp_delete_post($id, true); $n++; }
        require_once ABSPATH . 'wp-admin/includes/user.php';
        $u = 0;
        foreach (get_users(['meta_key' => 'aled08_essai', 'meta_value' => '1', 'fields' => 'ID']) as $id) { if (!user_can((int) $id, 'edit_posts')) { wp_delete_user((int) $id); $u++; } }
        return new WP_REST_Response(['ok' => true, 'commandes' => $n, 'comptes' => $u], 200);
    }
    if (!$cid || !get_post_meta($cid, '_aled08_essai', true)) return new WP_Error('aled08_essai', 'Ce n’est pas une commande d’essai.', ['status' => 404]);
    $c = aled08e_cmd_get($cid);
    if ($faire === 'etape') {
        $st = sanitize_key((string) ($p['statut'] ?? ''));
        if (!isset(aled08e_cmd_statuts()[$st]) || $st === 'en_ligne' && empty($p['sur'])) return new WP_Error('aled08_essai', 'Statut refusé.', ['status' => 400]);
        update_post_meta($cid, '_aled08_statut', $st); // posé tel quel : aucun e-mail, aucun achat
        aled08e_cmd_journal($cid, 'Essai : statut « ' . aled08e_cmd_statuts()[$st][0] . ' ».');
        return new WP_REST_Response(['ok' => true, 'statut' => $st], 200);
    }
    if ($faire === 'questionnaire') {
        if (!empty($p['reponses']) && is_array($p['reponses'])) update_post_meta($cid, '_aled08_brief', map_deep($p['reponses'], 'sanitize_textarea_field'));
        else update_post_meta($cid, '_aled08_brief', ['nom_site' => 'La Boulangerie d’Essai', 'activite' => 'Boulangerie artisanale : pains au levain, viennoiseries pur beurre et pâtisseries du week-end.', 'slogan' => 'Le bon pain, tout simplement',
            'zone' => 'Charleville-Mézières', 'couleurs' => ['Beige et tons naturels'], 'ambiance' => ['Chaleureux'], 'textes' => 'Écrivez-les pour moi à partir de mes réponses', 'raison_sociale' => 'La Boulangerie d’Essai']);
        delete_post_meta($cid, '_aled08_brief_brouillon');
        update_post_meta($cid, '_aled08_brief_le', current_time('mysql'));
        aled08e_cmd_journal($cid, 'Essai : questionnaire rempli.');
        return new WP_REST_Response(['ok' => true], 200);
    }
    if ($faire === 'livraison') {
        // l'e-mail « Votre site est en ligne » tel que le client le recevrait, sans changer le statut
        aled08e_chantier_resume_garder($cid, $p);
        aled08e_cmd_mail_client_en_ligne(aled08e_cmd_get($cid));
        aled08e_cmd_journal($cid, 'Essai : e-mail de livraison envoyé (la commande ne passe pas en ligne).');
        return new WP_REST_Response(['ok' => true], 200);
    }
    if ($faire === 'connexion') {
        // le même lien de connexion en un clic que dans l'e-mail de bienvenue, valable un jour
        return new WP_REST_Response(['ok' => true, 'lien' => aled08e_clic_lien((int) $c['user'], 1)], 200);
    }
    return new WP_Error('aled08_essai', 'À faire inconnu.', ['status' => 400]);
}

/* =========================================================================
 *  L'e-mail « Votre site est en ligne » d'un client déjà installé (sans commande dans l'atelier).
 *  POST /aled08/v1/atelier/livraison { fiche, type, resume, pages_total, pages_google, pages_formule, articles, forfait, offerts: [[libellé, prix], …], apercu }
 *  Par défaut c'est un aperçu : il part à Alex seulement. Au client, seulement avec apercu: false et accord_alex: true
 *  (Alex a dit « OK » dans la conversation). Rien d'autre ne change : ni statut, ni forfait.
 * ========================================================================= */
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/atelier/livraison', ['methods' => 'POST', 'permission_callback' => function () { return current_user_can('manage_options'); }, 'callback' => 'aled08e_livraison_faire']);
});
function aled08e_livraison_faire(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $u = get_userdata((int) ($p['fiche'] ?? 0));
    if (!$u || user_can($u, 'edit_posts')) return new WP_Error('aled08_livraison', 'Fiche client introuvable.', ['status' => 404]);
    $apercu = !isset($p['apercu']) || !empty($p['apercu']);
    if (!$apercu && empty($p['accord_alex'])) return new WP_Error('aled08_livraison', 'Envoi au client refusé sans l’accord d’Alex.', ['status' => 403]);
    $type = in_array(($p['type'] ?? ''), ['une-page', 'vitrine', 'boutique'], true) ? $p['type'] : (aled08e_meta($u->ID, 'boutique') === '1' ? 'boutique' : 'vitrine');
    $L = ['resume' => mb_substr(trim(sanitize_textarea_field((string) ($p['resume'] ?? ''))), 0, 4000), 'forfait_nom' => sanitize_text_field((string) ($p['forfait'] ?? ''))];
    foreach (['pages_total' => 300, 'pages_google' => 200, 'pages_formule' => 300, 'articles' => 5000] as $k => $max) if (isset($p[$k])) $L[$k] = max(0, min($max, (int) $p[$k]));
    if (!empty($p['offerts']) && is_array($p['offerts'])) $L['offerts'] = array_slice(array_map(function ($o) { return [sanitize_text_field((string) ($o[0] ?? '')), sanitize_text_field((string) ($o[1] ?? ''))]; }, $p['offerts']), 0, 8);
    update_user_meta($u->ID, 'aled08_livraison', $L);
    $site = (string) aled08e_meta($u->ID, 'site');
    $c = ['id' => 0, 'user' => $u->ID, 'prenom' => $u->first_name ?: $u->display_name, 'email' => $u->user_email, 'type' => $type, 'forfait' => (string) aled08e_meta($u->ID, 'forfait'),
        'domaine' => $site ? preg_replace('#^https?://(www\.)?#', 'www.', untrailingslashit($site)) : '', 'statut' => 'en_ligne', 'reception_payee' => 1, 'solde_paye' => 1,
        'montants' => ['solde' => 0], 'livraison' => $L];
    if (strpos($c['domaine'], 'www.www.') === 0) $c['domaine'] = substr($c['domaine'], 4);
    aled08e_cmd_mail_client_en_ligne($c, $apercu ? aled08e_to() : '');
    if (!$apercu) update_user_meta($u->ID, 'aled08_livraison_envoyee', current_time('mysql'));
    return new WP_REST_Response(['ok' => true, 'envoye_a' => $apercu ? 'Alex (aperçu)' : 'le client'], 200);
}
