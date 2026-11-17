<?php
/**
 * Les Minis Monstres Espace client : les petits mots de la bande, sur l'accueil de l'espace client.
 * Un monstre, un titre, un message court et un petit visuel. Tout est fait à partir de ce qu'on sait déjà :
 * - Mirette (Maxi) : l'analyse de la semaine, lue dans les chiffres du site (stats.php, gardés une heure, jamais d'appel ici).
 * - Bricou et Plume (Maxi) : les idées de saison (une liste écrite ici, sans appel au modèle), et les suggestions qu'Alex
 *   écrit dans la fiche du client (champ « Suggestions de la bande »). « Oui, faites-le » envoie une demande de modification.
 * - Lumi : la dernière page SEO mise en ligne (demande faite avec le préfixe « Page SEO »), pour tous.
 * - Pistache : l'état du site (en ligne, cadenas), pour tous.
 * Avec Mini, un dernier mot présente Maxi. Le client peut écarter un message (« Plus tard ») : il ne revient pas.
 */
defined('ABSPATH') || exit;

/* Les monstres de la bande, par leur prénom : dessin et rôle */
function aled08e_msg_monstres() {
    return [
        'mirette' => ['gelee', 'Mirette', 'L’observatrice'],
        'lumi' => ['etoile', 'Lumi', 'L’étoile de Google'],
        'bricou' => ['bricou', 'Bricou', 'Le constructeur'],
        'plume' => ['fantome', 'Plume', 'La rédactrice'],
        'pistache' => ['dino', 'Pistache', 'Le gardien'],
        'mochi' => ['mochi', 'Mochi', 'L’organisateur'],
        'champi' => ['champi', 'Champi', 'Le vendeur'],
    ];
}
function aled08e_msg_maxi($uid) { return !empty(aled08e_forfait(aled08e_meta($uid, 'forfait'))['optimisation']) || aled08e_famille($uid); }
function aled08e_msg_ecartes($uid) { $v = get_user_meta($uid, 'aled08_msg_ecartes', true); return is_array($v) ? $v : []; }

/* Les idées de saison : [mois (1 à 12), monstre, titre, texte, la demande envoyée si le client dit oui] */
function aled08e_msg_saisons() {
    return [
        [[11, 12], 'bricou', 'Vos horaires des fêtes', 'En décembre, beaucoup de visiteurs cherchent vos horaires des fêtes. Je peux ajouter un petit bandeau en haut de votre page d’accueil.', 'Ajouter un bandeau en haut de l’accueil avec nos horaires des fêtes de fin d’année. (Suggestion de Bricou : je vous donne les horaires en réponse.)'],
        [[1], 'plume', 'Une page pour la nouvelle année', 'Janvier, c’est le bon moment pour présenter vos nouveautés ou vos tarifs de l’année. Je vous prépare une page ?', 'Préparer une page « Nos nouveautés de l’année » sur mon site. (Suggestion de Plume.)'],
        [[3, 4], 'plume', 'Le printemps arrive', 'Les recherches de saison montent au printemps. Je peux écrire une page pour votre service le plus demandé à cette période.', 'Écrire une page de printemps pour notre service le plus demandé. (Suggestion de Plume : je précise le service en réponse.)'],
        [[6, 7], 'bricou', 'Vos horaires d’été', 'Vous fermez ou changez vos horaires cet été ? Je peux les afficher clairement, avec un petit bandeau.', 'Afficher nos horaires d’été avec un bandeau en haut du site. (Suggestion de Bricou : je donne les dates en réponse.)'],
        [[9], 'plume', 'La rentrée', 'À la rentrée, vos clients reviennent sur Google. Une page de conseils de rentrée peut vous faire trouver plus souvent.', 'Préparer une page de conseils de rentrée pour mes clients. (Suggestion de Plume.)'],
    ];
}

/* Les suggestions écrites par Alex dans la fiche du client : une par ligne, « monstre | titre | texte » */
function aled08e_msg_suggestions_alex($uid) {
    $out = [];
    foreach (preg_split('/\r?\n/', aled08e_meta($uid, 'suggestions')) as $l) {
        $p = array_map('trim', explode('|', $l));
        if (count($p) < 3 || $p[2] === '') continue;
        $m = sanitize_key($p[0]);
        $out[] = ['id' => 's' . substr(md5($l), 0, 10), 'qui' => isset(aled08e_msg_monstres()[$m]) ? $m : 'bricou', 'titre' => $p[1], 'texte' => $p[2], 'demande' => $p[1] . ' : ' . $p[2] . ' (Suggestion de la bande, acceptée par le client.)', 'action' => true, 'maxi' => true, 'quand' => 'cette semaine', 'vis' => ['type' => 'idee', 'mot' => $p[1]]];
    }
    return $out;
}

/* Tous les messages du client, dans l'ordre d'affichage */
function aled08e_messages($uid) {
    $maxi = aled08e_msg_maxi($uid);
    $msgs = [];
    // Mirette : l'analyse de la semaine (les chiffres déjà gardés, sinon rien)
    $st = get_transient('aled08_stats_' . (int) $uid);
    if ($maxi && is_array($st) && !empty($st['jours']) && is_array($st['jours'])) {
        $j = array_values($st['jours']);
        $n = count($j);
        $sem = array_slice($j, max(0, $n - 7));
        $avant = array_slice($j, max(0, $n - 14), max(0, min(7, $n - 7)));
        $somme = function ($a) { return array_sum(array_map(function ($x) { return (int) ($x['visiteurs'] ?? 0); }, $a)); };
        $s1 = $somme($sem);
        $s0 = $somme($avant);
        $pages = is_array($st['pages'] ?? null) ? $st['pages'] : [];
        arsort($pages);
        $top = $pages ? (string) array_key_first($pages) : '';
        $evol = $s0 > 0 ? (int) round(($s1 - $s0) / $s0 * 100) : 0;
        $txt = $s1 . ' visiteur' . ($s1 > 1 ? 's' : '') . ' cette semaine' . ($s0 > 0 ? ($evol >= 0 ? ', ' . $evol . ' % de plus que la semaine d’avant.' : ', un peu moins que la semaine d’avant. C’est souvent passager.') : '.') . ($top !== '' ? ' La page la plus vue : ' . $top . '.' : '');
        $msgs[] = ['id' => 'mirette-' . wp_date('oW'), 'qui' => 'mirette', 'maxi' => true, 'quand' => 'cette semaine', 'titre' => 'Votre semaine en un coup d’œil', 'texte' => $txt, 'vis' => ['type' => 'barres', 'data' => array_map(function ($x) { return (int) ($x['visiteurs'] ?? 0); }, $sem), 'evol' => $s0 > 0 ? $evol : null]];
    }
    // Lumi : la dernière page SEO mise en ligne (une demande « Page SEO » terminée)
    $seo = get_posts(['post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => 'private', 'numberposts' => 1, 'orderby' => 'modified', 's' => 'Page SEO', 'meta_query' => [['key' => '_aled08_statut', 'value' => 'faite']], 'suppress_filters' => true]);
    if ($seo) {
        $t = trim(preg_replace('/^Page SEO\s*:\s*/u', '', $seo[0]->post_title));
        $msgs[] = ['id' => 'lumi-' . $seo[0]->ID, 'qui' => 'lumi', 'quand' => aled08e_date($seo[0]->post_modified), 'titre' => 'Nouvelle page en ligne', 'texte' => 'Votre page « ' . $t . ' » est en ligne. Google va la découvrir dans les prochains jours.', 'vis' => ['type' => 'google', 'titre' => $t, 'site' => preg_replace('#^https?://#', '', rtrim(aled08e_meta($uid, 'site'), '/'))]];
    }
    // Bricou et Plume : les idées de saison et les suggestions d'Alex (Maxi)
    if ($maxi) {
        $mois = (int) wp_date('n');
        foreach (aled08e_msg_saisons() as $i => [$m, $qui, $titre, $texte, $demande]) {
            if (!in_array($mois, $m, true)) continue;
            $msgs[] = ['id' => 'saison-' . $i . '-' . wp_date('Y'), 'qui' => $qui, 'maxi' => true, 'action' => true, 'quand' => 'ce mois-ci', 'titre' => $titre, 'texte' => $texte, 'demande' => $demande, 'vis' => $qui === 'bricou' ? ['type' => 'bandeau', 'mot' => $titre] : ['type' => 'idee', 'mot' => $titre]];
        }
        $msgs = array_merge($msgs, aled08e_msg_suggestions_alex($uid));
    }
    // Pistache : l'état du site
    $site = aled08e_meta($uid, 'site');
    if ($site !== '') {
        $msgs[] = ['id' => 'pistache-' . wp_date('oW'), 'qui' => 'pistache', 'quand' => 'cette semaine', 'titre' => 'Je veille sur votre site', 'texte' => 'Sauvegardes, cadenas et surveillance : tout est en place. Si quelque chose ne va pas, Alex est prévenu.', 'vis' => ['type' => 'voyants', 'https' => stripos($site, 'https://') === 0]];
    }
    // Mini : un mot pour présenter Maxi
    if (!$maxi && !aled08e_sans_formule($uid)) {
        $evo = aled08e_forfait('evolution');
        if (($evo['id'] ?? '') === 'evolution') $msgs[] = ['id' => 'teaser-maxi', 'qui' => 'mirette', 'teaser' => true, 'titre' => 'Avec ' . $evo['name'] . ', la bande vous écrit chaque semaine', 'texte' => ((aled08e_data()['optimisation']['texte'] ?? '') ?: 'La bande surveille votre site et vous propose des améliorations.') . ' Vos petites modifications sont faites dans l’heure, pour ' . aled08e_euro_txt($evo['month']) . ' par mois.'];
    }
    $ecartes = aled08e_msg_ecartes($uid);
    return array_values(array_filter($msgs, function ($x) use ($ecartes) { return !in_array($x['id'], $ecartes, true); }));
}

/* Le petit visuel d'un message */
function aled08e_msg_visuel($v) {
    if (!$v) return '';
    switch ($v['type']) {
        case 'barres':
            $max = max(1, max($v['data'] ?: [1]));
            $b = '';
            foreach ($v['data'] as $i => $n) $b .= '<i style="height:' . (int) max(6, round($n / $max * 100)) . '%"' . ($i === count($v['data']) - 1 ? ' class="is-on"' : '') . '></i>';
            return '<div class="msg-vis msg-barres" aria-hidden="true">' . $b . ($v['evol'] !== null ? '<span>' . ($v['evol'] >= 0 ? '+' : '') . (int) $v['evol'] . ' %</span>' : '') . '</div>';
        case 'google':
            return '<div class="msg-vis msg-google" aria-hidden="true"><small>' . esc_html($v['site'] ?: 'votre site') . '</small><b>' . esc_html($v['titre']) . '</b><span>Votre nouvelle page, telle qu’elle peut apparaître sur Google.</span></div>';
        case 'bandeau':
            return '<div class="msg-vis msg-bandeau" aria-hidden="true"><span class="msg-bandeau-bar">' . aled08e_icon('megaphone') . esc_html($v['mot']) . '</span><span class="msg-bandeau-site"><i></i><i></i><i></i></span></div>';
        case 'idee':
            return '<div class="msg-vis msg-idee" aria-hidden="true">' . aled08e_icon('search') . '<span>' . esc_html($v['mot']) . '</span></div>';
        case 'voyants':
            return '<div class="msg-vis msg-voyants" aria-hidden="true"><span>' . aled08e_icon('check') . 'Sauvegarde</span>' . (!empty($v['https']) ? '<span>' . aled08e_icon('lock') . 'HTTPS</span>' : '') . '<span>' . aled08e_icon('shield-check') . 'Surveillé</span></div>';
    }
    return '';
}

/* Le bloc « Les petits mots de la bande », sur l'accueil */
function aled08e_messages_html($uid) {
    $msgs = aled08e_messages($uid);
    if (!$msgs) return '';
    $M = aled08e_msg_monstres();
    $evo = aled08e_forfait('evolution');
    $h = '<div class="msgs" id="messages"><p class="app-sub">Les petits mots de la bande</p>';
    foreach (array_slice($msgs, 0, 5) as $x) {
        $qui = $M[$x['qui']] ?? $M['bricou'];
        $plusTard = '<form method="post" action="' . esc_url(aled08e_url()) . '#messages" class="msg-form"><input type="hidden" name="aled08e_msg" value="ecarter"><input type="hidden" name="id" value="' . esc_attr($x['id']) . '">' . wp_nonce_field('aled08e_msg', '_aled08e_msg', true, false) . '<button class="btn btn-light btn-sm" type="submit"><span>' . (!empty($x['action']) ? 'Plus tard' : 'Merci, c’est noté') . '</span></button></form>';
        if (!empty($x['teaser'])) {
            $h .= '<article class="msg msg-teaser"><span class="msg-art">' . aled08e_monster('gelee') . '</span><div class="msg-corps"><p class="msg-titre">' . esc_html($x['titre']) . '</p><p class="msg-txt">' . esc_html($x['texte']) . '</p><p class="msg-actions"><button type="button" class="btn btn-light btn-sm" data-go="forfait">' . aled08e_icon('arrow-right') . '<span>Voir ' . esc_html($evo['name'] ?? 'Maxi') . '</span></button>' . $plusTard . '</p></div></article>';
            continue;
        }
        $oui = '';
        if (!empty($x['action'])) {
            $oui = '<form method="post" action="' . esc_url(aled08e_url()) . '" class="msg-form"><input type="hidden" name="aled08e_demande" value="1"><input type="hidden" name="aled08e_msg_id" value="' . esc_attr($x['id']) . '"><input type="hidden" name="demande" value="' . esc_attr($x['demande']) . '">' . wp_nonce_field('aled08e_demande', '_aled08e', true, false) . '<button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('check') . '<span>Oui, faites-le</span></button></form>';
        }
        $h .= '<article class="msg' . (!empty($x['maxi']) ? ' is-maxi' : '') . '"><span class="msg-art">' . aled08e_monster($qui[0]) . '</span><div class="msg-corps">'
            . '<p class="msg-qui"><strong>' . esc_html($qui[1]) . '</strong><small>' . esc_html($qui[2] . (!empty($x['quand']) ? ' · ' . $x['quand'] : '')) . '</small>' . (!empty($x['maxi']) && !empty($evo['name']) ? '<em class="msg-tag">' . esc_html($evo['name']) . '</em>' : '') . '</p>'
            . '<p class="msg-titre">' . esc_html($x['titre']) . '</p><p class="msg-txt">' . esc_html($x['texte']) . '</p>'
            . aled08e_msg_visuel($x['vis'] ?? null)
            . '<p class="msg-actions">' . $oui . $plusTard . '</p></div></article>';
    }
    return $h . '</div>';
}

/* « Plus tard » ou « Merci, c'est noté » : le message est écarté pour de bon */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_msg'])) return;
    $uid = get_current_user_id();
    if (!$uid || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_msg'] ?? '')), 'aled08e_msg')) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $id = sanitize_key(wp_unslash($_POST['id'] ?? ''));
    if ($id !== '') {
        $e = aled08e_msg_ecartes($uid);
        if (!in_array($id, $e, true)) $e[] = $id;
        update_user_meta($uid, 'aled08_msg_ecartes', array_slice($e, -200));
    }
    wp_safe_redirect(aled08e_url() . '#messages', 303); exit;
}, 9);

/* « Oui, faites-le » : la demande part comme une demande normale ; le message est alors écarté */
add_action('aled08e_demande_creee', function ($pid, $par, $uid) {
    $id = sanitize_key(wp_unslash($_POST['aled08e_msg_id'] ?? ''));
    if ($id === '' || !$uid) return;
    $e = aled08e_msg_ecartes($uid);
    if (!in_array($id, $e, true)) $e[] = $id;
    update_user_meta($uid, 'aled08_msg_ecartes', array_slice($e, -200));
    update_post_meta($pid, '_aled08_suggestion', $id);
}, 10, 3);

/* Annonce de Mini et Maxi (une seule fois) : ce qui change pour les clients */
add_action('init', function () {
    if (get_option('aled08e_annonce_minimaxi') === '1' || !defined('ALED08E_CPT_ANNONCE') || !post_type_exists(ALED08E_CPT_ANNONCE)) return;
    update_option('aled08e_annonce_minimaxi', '1', false); // posé d'abord : deux visites en même temps ne publient pas deux fois
    $mini = aled08e_forfait('base');
    $maxi = aled08e_forfait('evolution');
    if (($maxi['id'] ?? '') !== 'evolution') return;
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID', 'fields' => 'ids']);
    $titre = 'Deux abonnements : ' . $mini['name'] . ' et ' . $maxi['name'];
    wp_insert_post([
        'post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'post_title' => $titre,
        'post_content' => $mini['name'] . ', à ' . aled08e_euro_txt($mini['month']) . ' par mois : votre site entretenu, vos modifications incluses ' . aled08e_delai_txt($mini) . ', et une page pour Google chaque mois.' . "\n"
            . $maxi['name'] . ', à ' . aled08e_euro_txt($maxi['month']) . ' par mois : vos petites modifications faites dans l’heure, une page optimisée chaque semaine, et la bande qui surveille votre site pour vous proposer des idées, ici, dans vos petits mots.' . "\n"
            . 'Vous changez quand vous voulez, dans Mon compte. Et une page SEO en plus coûte maintenant ' . aled08e_euro_txt((float) (aled08e_a_la_demande('packseo')['prix'] ?? 5)) . ', dans Mes demandes.',
        'post_author' => $admins ? (int) $admins[0] : 0, 'post_date' => wp_date('Y-m-d H:i:s'),
    ]);
    update_option('aled08_annonce_derniere', ['titre' => $titre, 'le' => current_time('mysql'), 'total' => function_exists('aled08e_annonces') ? count(aled08e_annonces(100)) : 1], false);
}, 24);
