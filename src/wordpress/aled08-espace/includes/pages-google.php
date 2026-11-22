<?php
/**
 * Les Minis Monstres Espace client : les pages de visibilité Google, faites automatiquement (21 novembre 2026).
 * Le client commande une page ou un pack (1, 5 ou 10) depuis son espace. Mirette choisit les sujets (lumi.php).
 * Le constructeur lit la liste et prépare chaque page en brouillon sur le site du client ; le contrôleur la relit,
 * la publie et la valide ici (22 novembre 2026 : rien n'arrive chez un client sans le contrôle d'un autre agent). Quand toutes les pages d'une commande sont en ligne, le client reçoit un joli e-mail avec ses pages,
 * et Alex est prévenu. Personne n'a rien à faire à la main.
 *
 * Routes (administrateur, pour l'atelier) :
 *   GET  /aled08/v1/atelier/pages-google               les pages à écrire (sujet, site, questionnaire du client)
 *   POST /aled08/v1/atelier/page-google {demande, faire, …}
 *        a_controler (le constructeur : titre, page, texte) ; corriger (le contrôleur : texte) ;
 *        valider (le contrôleur, page publiée : lien) ; pour_alex (texte) ; reprendre (avec l'accord d'Alex)
 */
defined('ABSPATH') || exit;

/* Les pages de visibilité Google pas encore faites */
function aled08e_pg_a_faire() {
    return get_posts(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'numberposts' => 60, 'orderby' => 'date', 'order' => 'ASC', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_seo', 'value' => '1'], ['key' => '_aled08_statut', 'value' => ['recue', 'encours'], 'compare' => 'IN']]]);
}
/* Le questionnaire de création du client (pour écrire sans rien inventer) : celui de sa commande la plus récente */
function aled08e_pg_questionnaire($uid) {
    foreach (aled08e_cmd_user_commandes($uid) as $c) {
        if (function_exists('aled08e_brief_le') && aled08e_brief_le($c['id']) !== '') return aled08e_brief_texte($c['id']);
    }
    return '';
}

add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/pages-google', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function () {
        $out = [];
        foreach (aled08e_pg_a_faire() as $p) {
            $uid = (int) $p->post_author;
            $u = get_userdata($uid);
            $site = aled08e_meta($uid, 'lia_url');
            $etat = (string) get_post_meta($p->ID, '_aled08_pg_etat', true);
            $out[] = [
                'demande' => (int) $p->ID,
                'etat' => $etat ?: 'a_faire',
                'role' => function_exists('aled08e_agent_role') ? aled08e_agent_role($etat) : 'constructeur',
                'entre_agents' => function_exists('aled08e_agent_fil') ? aled08e_agent_fil($p->ID) : [],
                'page_preparee' => $etat !== '' ? ['titre' => (string) get_post_meta($p->ID, '_aled08_pg_titre', true), 'lien' => (string) get_post_meta($p->ID, '_aled08_lien', true), 'page' => (int) get_post_meta($p->ID, '_aled08_pg_page', true)] : null,
                'client' => $u ? $u->display_name : '',
                'site' => $site,
                'site_relie' => $site !== '' && aled08e_meta($uid, 'lia_secret') !== '',
                'sujet' => (string) get_post_meta($p->ID, '_aled08_brief', true),
                'idees_du_client' => ($par = (int) get_post_meta($p->ID, '_aled08_seo_parent', true)) && ($pp = get_post($par)) ? wp_strip_all_tags($pp->post_content) : '',
                'commande_groupee' => $par,
                'questionnaire' => aled08e_pg_questionnaire($uid),
            ];
        }
        return new WP_REST_Response(['pages' => $out, 'aide' => 'Le constructeur prépare la page en brouillon puis POST /aled08/v1/atelier/page-google {demande, faire: "a_controler", titre, page, texte}. Le contrôleur la publie puis {demande, faire: "valider", lien}, ou {demande, faire: "corriger", texte}.'], 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/page-google', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_pg_livrer']);
});

function aled08e_pg_livrer(WP_REST_Request $req) {
    $d = (array) $req->get_json_params();
    $pid = (int) ($d['demande'] ?? 0);
    $p = $pid ? get_post($pid) : null;
    if (!$p || $p->post_type !== ALED08E_CPT || !get_post_meta($pid, '_aled08_seo', true)) return new WP_Error('aled08_pg', 'Demande introuvable.', ['status' => 404]);
    $faire = sanitize_key((string) ($d['faire'] ?? 'a_controler'));
    $etat = (string) get_post_meta($pid, '_aled08_pg_etat', true);
    $note = trim(wp_strip_all_tags((string) ($d['texte'] ?? '')));
    $titre = mb_substr(sanitize_text_field((string) ($d['titre'] ?? '')), 0, 160);
    $lien = esc_url_raw((string) ($d['lien'] ?? ''));
    $uidP = (int) $p->post_author;
    $nomP = '#' . $pid . ' de ' . (($uu = get_userdata($uidP)) ? $uu->display_name : '?');
    if (get_post_meta($pid, '_aled08_statut', true) === 'faite') return new WP_Error('aled08_pg', 'Cette page est déjà livrée.', ['status' => 409]);
    if ($faire === 'a_controler') {
        // le constructeur a préparé la page (en brouillon sur le site du client) : elle part au contrôle
        if ($etat === 'pour_alex') return new WP_Error('aled08_pg', 'Cette page est chez Alex.', ['status' => 409]);
        if ($titre === '' || (empty($d['page']) && !wp_http_validate_url($lien))) return new WP_Error('aled08_pg', 'Il faut le titre de la page, et son numéro sur le site du client (page) ou son adresse (lien).', ['status' => 400]);
        update_post_meta($pid, '_aled08_pg_titre', $titre);
        if (!empty($d['page'])) update_post_meta($pid, '_aled08_pg_page', (int) $d['page']);
        if ($lien !== '') update_post_meta($pid, '_aled08_lien', $lien);
        if ($note !== '') aled08e_agent_fil_ajouter($pid, 'constructeur', $note);
        update_post_meta($pid, '_aled08_statut', 'encours');
        update_post_meta($pid, '_aled08_pg_etat', 'a_controler');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_controler'], 200);
    }
    if ($faire === 'corriger') {
        if ($etat !== 'a_controler') return new WP_Error('aled08_pg', 'Cette page n’est pas au contrôle.', ['status' => 409]);
        if ($note === '') return new WP_Error('aled08_pg', 'Dites ce qu’il faut corriger (texte).', ['status' => 400]);
        aled08e_agent_fil_ajouter($pid, 'controleur', $note);
        if (aled08e_agent_tour($pid) > 2) {
            update_post_meta($pid, '_aled08_pg_etat', 'pour_alex');
            aled08e_agents_pour_alex('la page Google', $nomP, 'Le contrôle a refusé trois fois la page.', 'Dernier refus : ' . $note);
            return new WP_REST_Response(['ok' => true, 'etat' => 'pour_alex'], 200);
        }
        update_post_meta($pid, '_aled08_pg_etat', 'a_corriger');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_corriger'], 200);
    }
    if ($faire === 'pour_alex') {
        if ($note === '') return new WP_Error('aled08_pg', 'Dites pourquoi ce cas est pour Alex (texte).', ['status' => 400]);
        aled08e_agent_fil_ajouter($pid, 'pour_alex', $note);
        update_post_meta($pid, '_aled08_pg_etat', 'pour_alex');
        aled08e_agents_pour_alex('la page Google', $nomP, $note, 'Sujet : ' . (string) get_post_meta($pid, '_aled08_brief', true));
        return new WP_REST_Response(['ok' => true, 'etat' => 'pour_alex'], 200);
    }
    if ($faire === 'reprendre') {
        if (empty($d['accord_alex'])) return new WP_Error('aled08_pg', 'Il faut l’accord d’Alex.', ['status' => 400]);
        if ($note !== '') aled08e_agent_fil_ajouter($pid, 'alex', $note);
        delete_post_meta($pid, '_aled08_controle_tours');
        update_post_meta($pid, '_aled08_pg_etat', 'a_corriger');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_corriger'], 200);
    }
    if ($faire !== 'valider') return new WP_Error('aled08_pg', 'À faire inconnu (a_controler, corriger, valider, pour_alex, reprendre).', ['status' => 400]);
    // le contrôleur a publié la page et la valide : elle est livrée
    if ($etat !== 'a_controler' && empty($d['accord_alex'])) return new WP_Error('aled08_pg', 'Une page n’est validée qu’après être passée au contrôle (faire "a_controler" d’abord).', ['status' => 409]);
    if ($titre === '') $titre = (string) get_post_meta($pid, '_aled08_pg_titre', true);
    if ($titre === '' || !wp_http_validate_url($lien)) return new WP_Error('aled08_pg', 'Il faut le titre de la page et son adresse en ligne (https://…).', ['status' => 400]);
    update_post_meta($pid, '_aled08_pg_etat', 'faite');
    update_post_meta($pid, '_aled08_statut', 'faite');
    update_post_meta($pid, '_aled08_lien', $lien);
    update_post_meta($pid, '_aled08_pg_titre', $titre);
    update_post_meta($pid, '_aled08_faite_le', time());
    update_post_meta($pid, '_aled08_reponse', 'Votre page « ' . $titre . ' » est en ligne : ' . $lien);
    wp_update_post(['ID' => $pid, 'post_title' => 'Page de visibilité Google : ' . $titre]);
    $uid = (int) $p->post_author;
    aled08e_lia_journal_add('Atelier : page de visibilité Google contrôlée et en ligne pour ' . (($u = get_userdata($uid)) ? $u->display_name : '#' . $uid) . ' : ' . $titre . '.');

    // toutes les pages de la même commande sont en ligne ? alors le joli e-mail part
    $parent = (int) get_post_meta($pid, '_aled08_seo_parent', true);
    $groupe = $parent ? get_posts(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'numberposts' => 20, 'orderby' => 'date', 'order' => 'ASC', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_seo_parent', 'value' => (string) $parent]]]) : [$p];
    $reste = 0; $pages = [];
    foreach ($groupe as $g) {
        if (get_post_meta($g->ID, '_aled08_statut', true) !== 'faite') { $reste++; continue; }
        $pages[] = [(string) get_post_meta($g->ID, '_aled08_pg_titre', true) ?: $g->post_title, (string) get_post_meta($g->ID, '_aled08_lien', true)];
    }
    $envoye = false;
    $cle = $parent ?: $pid;
    if (!$reste && !get_post_meta($cle, '_aled08_pg_mail', true)) {
        update_post_meta($cle, '_aled08_pg_mail', time());
        aled08e_pg_mail_client($uid, $pages);
        $u = get_userdata($uid);
        wp_mail(aled08e_to(), 'Pages Google en ligne : ' . ($u ? $u->display_name : '?') . ' (' . count($pages) . ')',
            "L’atelier a écrit et mis en ligne ces pages de visibilité Google. Le client a reçu son e-mail.\n\n" . implode("\n", array_map(function ($x) { return '- ' . $x[0] . ' : ' . $x[1]; }, $pages)) . "\n", aled08e_mail_headers());
        $envoye = true;
    }
    return new WP_REST_Response(['ok' => true, 'reste_dans_la_commande' => $reste, 'email_client' => $envoye], 200);
}

/* Le joli e-mail au client : ses nouvelles pages, avec leurs liens */
function aled08e_pg_mail_client($uid, $pages) {
    $u = get_userdata($uid);
    if (!$u || !$pages) return;
    $prenom = trim((string) get_user_meta($uid, 'first_name', true)) ?: $u->display_name;
    $n = count($pages);
    $p = function ($t, $taille = 16) { return '<p style="margin:0 0 12px;font-size:' . (int) $taille . 'px;line-height:1.6;color:#2E2A47;">' . $t . '</p>'; };
    $liste = '';
    foreach ($pages as $x) {
        $liste .= '<tr><td style="padding:8px 0;border-bottom:1px solid #F1E8F7;"><a href="' . esc_url($x[1]) . '" style="font-size:16px;font-weight:bold;color:#A3305F;text-decoration:none;">' . esc_html($x[0]) . '</a>'
            . '<br><span style="font-size:13px;color:#6B6789;">' . esc_html(preg_replace('#^https?://#', '', untrailingslashit($x[1]))) . '</span></td></tr>';
    }
    $h = '<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#2E2A47;">' . ($n > 1 ? 'Vos ' . $n . ' pages Google sont en ligne' : 'Votre page Google est en ligne') . '</h1>'
        . $p('Bonjour ' . esc_html($prenom) . ',')
        . $p('Les Minis Monstres ont écrit ' . ($n > 1 ? 'vos ' . $n . ' nouvelles pages' : 'votre nouvelle page') . ' de visibilité Google. ' . ($n > 1 ? 'Elles sont' : 'Elle est') . ' déjà en ligne sur votre site :')
        . aled08e_mail_carte('beurre', '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $liste . '</table>', 'etoile', aled08e_mail_etiquette($n > 1 ? 'Vos nouvelles pages' : 'Votre nouvelle page', '#9a6a00'))
        . aled08e_mail_carte('ciel', $p('<b>À quoi ' . ($n > 1 ? 'elles servent' : 'elle sert') . ' ?</b> Chaque page répond à une recherche que font vos clients sur Google. C’est une porte d’entrée de plus vers votre site. Google met en général quelques jours à quelques semaines pour ' . ($n > 1 ? 'les' : 'la') . ' prendre en compte.', 15), '', '')
        . $p('Un mot à changer ? Faites-le vous-même avec le bouton « Modifier mon site moi-même » de votre application, ou demandez-le-nous dans « Mes modifications ».', 15)
        . '<p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#2E2A47;">À très vite,<br><b>Alex et sa petite bande</b></p>';
    $txt = 'Bonjour ' . $prenom . ",\n\nLes Minis Monstres ont écrit " . ($n > 1 ? 'vos ' . $n . ' nouvelles pages' : 'votre nouvelle page') . " de visibilité Google. En ligne sur votre site :\n\n"
        . implode("\n", array_map(function ($x) { return '- ' . $x[0] . ' : ' . $x[1]; }, $pages))
        . "\n\nChaque page répond à une recherche que font vos clients sur Google. Google met en général quelques jours à quelques semaines pour les prendre en compte.\n\nUn mot à changer ? Faites-le vous-même (« Modifier mon site moi-même ») ou demandez-le-nous dans « Mes modifications » : " . aled08e_url() . "\n\nÀ très vite,\nAlex et sa petite bande\n";
    $alt = function ($m) use ($txt) { $m->AltBody = $txt; };
    add_action('phpmailer_init', $alt, 20);
    $titre = $n > 1 ? 'Vos ' . $n . ' pages Google sont en ligne' : 'Votre page Google est en ligne';
    wp_mail($u->user_email, $titre, aled08e_mail_coque($titre, $h, 'Les Minis Monstres ont écrit vos pages de visibilité Google : les voici.'),
        array_merge(['Content-Type: text/html; charset=UTF-8'], array_values(array_filter((array) aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'), function ($e) { return stripos($e, 'content-type:') !== 0; }))));
    remove_action('phpmailer_init', $alt, 20);
}
