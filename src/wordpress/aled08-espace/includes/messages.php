<?php
/**
 * Les Minis Monstres Espace client : les petits mots de la bande, sur l'accueil de l'espace client.
 * Un monstre, un titre, un message court et un petit visuel. Tout est fait à partir de ce qu'on sait déjà :
 * - Mirette (Maxi) : l'analyse de la semaine, lue dans les chiffres du site (stats.php, gardés une heure, jamais d'appel ici).
 * - Bricou et Plume (Maxi) : les idées de saison (une liste écrite ici, sans appel au modèle), et les suggestions qu'Alex
 *   écrit dans la fiche du client (champ « Suggestions de la bande »). « Oui, faites-le » envoie une demande de modification.
 * - Lumi : la dernière page de visibilité Google mise en ligne (demande faite avec le préfixe « Page de visibilité Google »), pour tous.
 * - Pistache : l'état du site (en ligne, cadenas), pour tous.
 * Avec Mini, un dernier mot présente Maxi. Le client peut écarter un message (« Plus tard ») : il ne revient pas.
 */
defined('ABSPATH') || exit;

/* Les monstres de la bande, par leur prénom : dessin et rôle */
function aled08e_msg_monstres() {
    return [
        'mirette' => ['gelee', 'Mirette', 'La spécialiste visibilité'],
        'lumi' => ['gelee', 'Mirette', 'La spécialiste visibilité'], // Lumi n'existe plus : ses petits mots sont signés Mirette
        'bricou' => ['bricou', 'Bricou', 'Le constructeur'],
        'cerise' => ['mascotte', 'Cerise', 'La secrétaire'],
        'plume' => ['fantome', 'Plume', 'La rédactrice'],
        'pistache' => ['bricou', 'Bricou', 'Le constructeur'], // Pistache n'existe plus
        'mochi' => ['mochi', 'Mochi', 'L’organisateur'],
        'champi' => ['mochi', 'Mochi', 'L’organisateur'], // Champi n'existe plus
    ];
}
function aled08e_msg_maxi($uid) { return aled08e_mirette_actif($uid); } // l'extra « Analyse de Mirette » (ou l'ancien Maxi)
function aled08e_msg_ecartes($uid) { $v = get_user_meta($uid, 'aled08_msg_ecartes', true); return is_array($v) ? $v : []; }

/* Les idées de saison : [mois (1 à 12), monstre, titre, texte, la demande envoyée si le client dit oui] */
function aled08e_msg_saisons() {
    return [
        [[11, 12], 'cerise', 'Vos horaires des fêtes', 'En décembre, beaucoup de visiteurs cherchent vos horaires des fêtes. On peut ajouter un petit bandeau en haut de votre page d’accueil.', 'Ajouter un bandeau en haut de l’accueil avec nos horaires des fêtes de fin d’année. (Suggestion de Cerise : je vous donne les horaires en réponse.)'],
        [[1], 'plume', 'Une page pour la nouvelle année', 'Janvier, c’est le bon moment pour présenter vos nouveautés ou vos tarifs de l’année. On vous prépare une page ?', 'Préparer une page « Nos nouveautés de l’année » sur mon site. (Suggestion de Plume.)'],
        [[3, 4], 'plume', 'Le printemps arrive', 'Les recherches de saison montent au printemps. Une page pour votre service le plus demandé à cette période vous ferait trouver plus souvent.', 'Écrire une page de printemps pour notre service le plus demandé. (Suggestion de Plume : je précise le service en réponse.)'],
        [[6, 7], 'cerise', 'Vos horaires d’été', 'Vous fermez ou changez vos horaires cet été ? On peut les afficher clairement, avec un petit bandeau.', 'Afficher nos horaires d’été avec un bandeau en haut du site. (Suggestion de Cerise : je donne les dates en réponse.)'],
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
    // Mirette : l'analyse de la semaine écrite par Claude (includes/mirette.php), sinon calculée sur les chiffres déjà gardés
    $ia = function_exists('aled08e_mirette_lire') ? aled08e_mirette_lire($uid) : [];
    $iaFraiche = $maxi && !empty($ia['le']) && time() - (int) $ia['le'] < 10 * DAY_IN_SECONDS;
    $st = get_transient('aled08_stats_' . (int) $uid);
    if ($iaFraiche) {
        $vis = null;
        if (is_array($st) && !empty($st['jours'])) $vis = ['type' => 'barres', 'data' => array_map(function ($x) { return (int) ($x['visiteurs'] ?? 0); }, array_slice(array_values($st['jours']), -7)), 'evol' => null];
        $msgs[] = ['id' => 'mirette-ia-' . ($ia['semaine'] ?? ''), 'qui' => 'mirette', 'maxi' => true, 'quand' => 'cette semaine', 'titre' => 'Votre semaine en un coup d’œil', 'texte' => (string) $ia['analyse'], 'vis' => $vis];
    } elseif ($maxi && is_array($st) && !empty($st['jours']) && is_array($st['jours'])) {
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
    // Lumi : la dernière page de visibilité Google mise en ligne (une demande « Page de visibilité Google » terminée)
    $seo = get_posts(['post_type' => ALED08E_CPT, 'author' => $uid, 'post_status' => 'private', 'numberposts' => 1, 'orderby' => 'modified', 'meta_query' => [['key' => '_aled08_statut', 'value' => 'faite'], ['key' => '_aled08_seo', 'value' => '1']], 'suppress_filters' => true]);
    if ($seo) {
        $t = trim(preg_replace('/^Page (SEO|visibilité Google)\s*:\s*/u', '', $seo[0]->post_title));
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
        if ($iaFraiche) foreach ((array) ($ia['suggestions'] ?? []) as $x) {
            $qui = in_array($x['qui'] ?? '', ['bricou', 'plume', 'lumi'], true) ? $x['qui'] : 'bricou';
            $msgs[] = ['id' => 'ia-' . $qui . '-' . substr(md5(($ia['semaine'] ?? '') . $x['titre']), 0, 10), 'qui' => $qui, 'maxi' => true, 'action' => true, 'quand' => 'cette semaine', 'titre' => $x['titre'], 'texte' => $x['texte'], 'demande' => $x['demande'] . ' (Suggestion de la bande, acceptée par le client.)', 'vis' => ['type' => $qui === 'bricou' ? 'bandeau' : 'idee', 'mot' => $x['titre']]];
        }
    }
    // Pistache : l'état du site
    $site = aled08e_meta($uid, 'site');
    if ($site !== '') {
        $msgs[] = ['id' => 'pistache-' . wp_date('oW'), 'qui' => 'pistache', 'quand' => 'cette semaine', 'titre' => 'Je veille sur votre site', 'texte' => 'Sauvegardes, cadenas et surveillance : tout est en place. Si quelque chose ne va pas, Alex est prévenu.', 'vis' => ['type' => 'voyants', 'https' => stripos($site, 'https://') === 0]];
    }
    // sans l'extra : un mot pour présenter l'analyse de Mirette
    if (!$maxi && !aled08e_sans_formule($uid)) {
        $x = aled08e_option('mirette');
        if ($x && empty($x['retire'])) $msgs[] = ['id' => 'teaser-mirette', 'qui' => 'mirette', 'teaser' => true, 'titre' => 'Je peux surveiller votre site chaque semaine', 'texte' => $x['desc'] . ' C’est un extra à ' . aled08e_euro_txt($x['month']) . ' par mois, que vous ajoutez ou retirez quand vous voulez, dans Abonnement et factures.'];
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
            $h .= '<article class="msg msg-teaser"><span class="msg-art">' . aled08e_monster('maxi') . '</span><div class="msg-corps"><p class="msg-titre">' . esc_html($x['titre']) . '</p><p class="msg-txt">' . esc_html($x['texte']) . '</p><p class="msg-actions"><button type="button" class="btn btn-light btn-sm" data-go="forfait">' . aled08e_icon('arrow-right') . '<span>Voir ' . esc_html($evo['name'] ?? 'Maxi') . '</span></button>' . $plusTard . '</p></div></article>';
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
    if (($maxi['id'] ?? '') !== 'evolution' || count(aled08e_data()['forfaits']) < 2) return; // Maxi n'est plus proposé
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID', 'fields' => 'ids']);
    $titre = 'Deux abonnements : ' . $mini['name'] . ' et ' . $maxi['name'];
    wp_insert_post([
        'post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'post_title' => $titre,
        'post_content' => $mini['name'] . ', à ' . aled08e_euro_txt($mini['month']) . ' par mois : votre site entretenu, vos modifications incluses ' . aled08e_delai_txt($mini) . ', et une page pour Google chaque mois.' . "\n"
            . $maxi['name'] . ', à ' . aled08e_euro_txt($maxi['month']) . ' par mois : vos modifications en priorité sous 48 h, deux demandes à la fois, une page optimisée chaque semaine, et la bande qui surveille votre site pour vous proposer des idées, ici, dans vos petits mots.' . "\n"
            . 'Vous changez quand vous voulez, dans Mon compte. Et une page de visibilité Google en plus coûte maintenant ' . aled08e_euro_txt((float) (aled08e_a_la_demande('packseo')['prix'] ?? 5)) . ', dans Mes demandes.',
        'post_author' => $admins ? (int) $admins[0] : 0, 'post_date' => wp_date('Y-m-d H:i:s'),
    ]);
    update_option('aled08_annonce_derniere', ['titre' => $titre, 'le' => current_time('mysql'), 'total' => function_exists('aled08e_annonces') ? count(aled08e_annonces(100)) : 1], false);
}, 24);

/* « Écrire à Cerise » : une case sur l'accueil. Le message part dans la bulle de Cerise (main.js), qui s'ouvre et répond. */
function aled08e_cerise_box_html() {
    $idees = ['Changer mes horaires', 'Ajouter une photo sur mon site', 'Une idée de page pour Google ?', 'Que comprend mon abonnement ?'];
    $h = '<div class="cerise-box"><span aria-hidden="true">' . aled08e_monster('mascotte') . '</span><div>'
        . '<p>Écrire à Cerise<small>Une question, une modification ? Elle vous répond tout de suite et prépare votre demande.</small></p>'
        . '<form class="cerise-form" data-cerise-form><input type="text" maxlength="600" placeholder="Ex. : nous serons fermés lundi" aria-label="Votre message à Cerise"><button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('send') . '<span>Envoyer</span></button></form>'
        . '<div class="cerise-ideas">';
    foreach ($idees as $i) $h .= '<button type="button" data-cerise-idee>' . esc_html($i) . '</button>';
    return $h . '</div></div></div>';
}

/* =========================================================================
 *  Bricou et Cerise, toujours visibles en haut de l'espace client, avec la jauge des demandes en cours
 * ========================================================================= */
/* Les demandes qui avancent (deux au plus à la fois ; les pages de Lumi ne comptent pas) */
function aled08e_demandes_en_cours($uid) {
    return get_posts(['post_type' => ALED08E_CPT, 'author' => (int) $uid, 'post_status' => ['private', 'publish'], 'numberposts' => 10, 'orderby' => 'date', 'order' => 'ASC',
        'meta_query' => ['relation' => 'AND', ['key' => '_aled08_statut', 'value' => ['recue', 'encours'], 'compare' => 'IN'], ['key' => '_aled08_seo', 'compare' => 'NOT EXISTS']]]);
}
/* Où en est une demande : 1 reçue, 2 prise en compte, 3 visuel à valider, 4 validée (Bricou modifie) */
/* Où en est une demande : 1 reçue (Cerise la relit), 2 précisée avec Cerise (question ou demande à vérifier), 3 chez Alex, 4 faite */
function aled08e_gauge_etape($p) {
    $etat = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
    if (in_array($etat, ['question', 'a_confirmer'], true)) return 2;
    if (get_post_meta($p->ID, '_aled08_par', true) === 'alex' || in_array($etat, ['transmise', 'refuse', 'pour_alex'], true)) return 3;
    return 1;
}
/* Demandes en même temps : une avec l'abonnement (Mini), deux avec l'extra « Deux demandes à la fois » (ou l'ancien Maxi) */
function aled08e_demandes_max($uid = 0) {
    $uid = $uid ?: get_current_user_id();
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    if (aled08e_famille($uid)) return 2;
    return max(1, (int) ($f['demandesMax'] ?? (!empty($f['optimisation']) ? 2 : 1))) + (aled08e_extra_actif($uid, 'deux') && empty($f['optimisation']) ? 1 : 0);
}
/* Le visuel (aperçu sur le vrai site) préparé par Bricou pour une demande, s'il y en a un */
function aled08e_gauge_apercu($p) {
    foreach ((array) get_post_meta($p->ID, '_aled08_lia_actions', true) as $a) if (is_array($a) && !empty($a['apercu'])) return (string) $a['apercu'];
    return '';
}
/* La croix pour annuler, au bout de la jauge (mêmes règles que « Annuler la demande » dans l'historique) */
function aled08e_gauge_croix_ancienne($p) {
    return ''; // les clients ne peuvent plus annuler une demande lancée
    if (!function_exists('aled08e_annulation_possible')) return '';
    $pourquoi = aled08e_annulation_possible($p);
    if ($pourquoi === 'deja') return '';
    if ($pourquoi !== '') return '<a class="gauge-x is-off" href="' . esc_url(home_url('/contact/')) . '" title="' . esc_attr($pourquoi === 'quota' ? 'Vos 3 annulations du mois sont utilisées : écrivez à Alex' : 'Après 24 heures, écrivez à Alex pour annuler') . '" aria-label="Annuler : écrire à Alex">' . aled08e_icon('x') . '</a>';
    return '<form class="gauge-x-form" method="post" action="' . esc_url(aled08e_url()) . '" onsubmit="return confirm(\'Annuler cette demande ? Elle ne comptera pas dans vos interventions.\');">'
        . '<input type="hidden" name="aled08e_annuler" value="' . (int) $p->ID . '">' . wp_nonce_field('aled08e_annuler_' . $p->ID, '_aled08e_annul', true, false)
        . '<button class="gauge-x" type="submit" title="Annuler cette demande" aria-label="Annuler cette demande">' . aled08e_icon('x') . '</button></form>';
}
function aled08e_gauge_html_ancienne($uid) {
    $liste = aled08e_demandes_en_cours($uid);
    if (!$liste) return '<p class="gauge-vide">' . aled08e_icon('check') . '<span>Aucune demande en cours. Dites à Bricou ce que vous voulez changer : il s’en occupe.</span></p>';
    $etapes = ['Demande reçue', 'Prise en compte', 'Visuel à valider', 'Mise en ligne'];
    $h = '';
    foreach (array_slice($liste, 0, aled08e_demandes_max($uid)) as $p) {
        $n = aled08e_gauge_etape($p);
        $txt = trim(preg_replace('/\s+/u', ' ', $p->post_content));
        $apercu = in_array($n, [3, 4], true) ? aled08e_gauge_apercu($p) : '';
        $vers = in_array($n, [3, 4], true);
        $h .= '<div class="gauge"><p class="gauge-t"><strong>' . esc_html(mb_strlen($txt) > 70 ? mb_substr($txt, 0, 67) . '…' : $txt) . '</strong></p><div class="gauge-ligne"><ol class="gauge-etapes" style="--n:' . (int) $n . '">';
        foreach ($etapes as $i => $e) {
            $in = '<b>' . ($i + 1 < $n ? '✓' : $i + 1) . '</b><span>' . esc_html($e) . '</span>';
            // le visuel à valider se clique : il s'ouvre sur le vrai site, avec ce qui change surligné
            // « à valider » se clique : on descend jusqu'à la demande, dans l'historique (aperçu, avant/après et boutons « Oui, c'est bon »)
            $in = ($i === 2 && $vers) ? '<a class="gauge-visuel" href="#req-' . (int) $p->ID . '" data-gauge-vers="' . (int) $p->ID . '" title="Cliquez pour aller à la demande et la valider"><s class="gauge-tache" aria-hidden="true"></s>' . $in . '<i class="gauge-clic">Cliquez ici</i></a>' : $in;
            $h .= '<li class="' . ($i + 1 < $n ? 'is-fait' : ($i + 1 === $n ? 'is-en-cours' : '')) . '">' . $in . '</li>';
        }
        $h .= '</ol>' . aled08e_gauge_croix($p) . '</div>';
        if (get_post_meta($p->ID, '_aled08_lia_etat', true) === 'question') $h .= '<p class="gauge-a">Bricou vous pose une question : <a href="#req-' . (int) $p->ID . '" data-gauge-vers="' . (int) $p->ID . '">répondre</a>, avec une capture d’écran si vous voulez.</p>';
        if ($n === 3) $h .= '<p class="gauge-a">À vous : ' . ($apercu ? '<a href="' . esc_url($apercu) . '" target="_blank" rel="noopener">voir le visuel</a>, puis ' : '') . 'dites si c’est bon dans l’historique, juste en dessous. Dès que vous validez, Bricou modifie.</p>';
        $h .= '</div>';
    }
    $max = aled08e_demandes_max($uid);
    if (count($liste) >= $max) $h .= '<p class="gauge-max">' . ($max > 1 ? 'Trois demandes à la fois' : 'Une demande à la fois') . ' avec votre abonnement : la suivante partira dès que ' . ($max > 1 ? 'l’une est terminée.' : 'celle-ci est terminée.') . '</p>';
    return $h;
}
function aled08e_bande_haut_html($uid) {
    $idees = ['Changer mes horaires', 'Ajouter une photo sur mon site', 'Une idée de page pour Google ?', 'Que comprend mon abonnement ?'];
    $h = '<section class="bande-haut" aria-label="Bricou et Cerise">'
        . '<div class="bande-haut-tete"><span class="bande-haut-art" aria-hidden="true">' . aled08e_monster('bricou') . aled08e_monster('mascotte') . '</span>'
        . '<div><strong>Les Minis Monstres à votre service !</strong><p>Parlez-leur quand vous voulez, comme à des collègues : ils répondent à vos questions et font vos modifications.</p></div></div>'
        . '<form class="cerise-form" data-cerise-form><input type="text" maxlength="600" placeholder="Ex. : nous serons fermés lundi, ou : que comprend mon abonnement ?" aria-label="Votre message aux Minis Monstres"><button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('send') . '<span>Envoyer</span></button></form>'
        . '<div class="cerise-ideas">';
    // la conversation (l'historique) s'affiche au-dessus de la zone de texte, comme dans une messagerie
    $h = str_replace('<form class="cerise-form" data-cerise-form>', '<div class="dialogue" data-dialogue hidden aria-label="Conversation avec les Minis Monstres"></div><form class="cerise-form" data-cerise-form>', $h);
    foreach ($idees as $i) $h .= '<button type="button" data-cerise-idee>' . esc_html($i) . '</button>';
    return $h . '</div><div class="gauge-bloc" data-gauge aria-live="polite">' . aled08e_gauge_html($uid) . '</div></section>';
}

/* =========================================================================
 *  La jauge des demandes (tout se fait depuis la jauge) : « Voir le visuel » ouvre le visuel dans une fenêtre, avec Oui / Non ;
 *  la question de Bricou aussi. Rien à chercher plus bas dans la page.
 * ========================================================================= */
function aled08e_gauge_html_v2($uid) {
    $liste = aled08e_demandes_en_cours($uid);
    if (!$liste) return '';
    $etapes = ['Demande reçue', 'Prise en compte', 'Visuel à valider', 'Mise en ligne'];
    $h = '';
    foreach (array_slice($liste, 0, aled08e_demandes_max($uid)) as $p) {
        $n = aled08e_gauge_etape($p);
        $etat = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
        $txt = trim(preg_replace('/\s+/u', ' ', $p->post_content));
        $h .= '<div class="gauge"><div class="gauge-entete"><p class="gauge-t"><strong>' . esc_html(mb_strlen($txt) > 70 ? mb_substr($txt, 0, 67) . '…' : $txt) . '</strong></p>' . aled08e_gauge_croix($p) . '</div><ol class="gauge-etapes" style="--n:' . (int) $n . '">';
        foreach ($etapes as $i => $e) {
            $in = '<b>' . ($i + 1 < $n ? '✓' : $i + 1) . '</b><span>' . esc_html($e) . '</span>';
            if ($i === 2 && $etat === 'a_confirmer') $in = '<button type="button" class="gauge-visuel" data-gauge-ouvrir="visuel-' . (int) $p->ID . '" title="Voir le visuel à valider"><s class="gauge-tache" aria-hidden="true"></s>' . $in . '</button>';
            $h .= '<li class="' . ($i + 1 < $n ? 'is-fait' : ($i + 1 === $n ? 'is-en-cours' : '')) . '">' . $in . '</li>';
        }
        $h .= '</ol>';
        if ($etat === 'a_confirmer') $h .= '<p class="gauge-a">Bricou a fini : regardez le visuel, puis dites si c’est bon.</p><button type="button" class="btn btn-primary btn-sm gauge-btn" data-gauge-ouvrir="visuel-' . (int) $p->ID . '">' . aled08e_icon('eye') . '<span>Voir le visuel</span></button>';
        elseif ($etat === 'question') {
            $q = preg_replace('/^Bricou : /u', '', (string) get_post_meta($p->ID, '_aled08_reponse', true));
            $h .= '<p class="gauge-a"><b>Bricou vous pose une question :</b> ' . esc_html(mb_substr($q, 0, 220)) . '</p><button type="button" class="btn btn-primary btn-sm gauge-btn" data-gauge-ouvrir="question-' . (int) $p->ID . '">' . aled08e_icon('message-circle') . '<span>Répondre à Bricou</span></button>';
        }
        $h .= '</div>';
    }
    $max = aled08e_demandes_max($uid);
    if (count($liste) >= $max) $h .= '<p class="gauge-max">' . ($max > 1 ? 'Trois demandes à la fois' : 'Une demande à la fois') . ' avec votre abonnement : la suivante partira dès que ' . ($max > 1 ? 'l’une est terminée.' : 'celle-ci est terminée.') . '</p>';
    return $h;
}
/* Les fenêtres de la jauge : le visuel à valider (avant / après, aperçu, Oui / Non) et la question de Bricou */
function aled08e_gauge_modals_html_v2($uid) {
    $h = '';
    foreach (array_slice(aled08e_demandes_en_cours($uid), 0, aled08e_demandes_max($uid)) as $p) {
        $etat = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
        if ($etat === 'a_confirmer') {
            $url = aled08e_gauge_apercu($p);
            $h .= '<dialog class="visuel-modal" id="visuel-' . (int) $p->ID . '" aria-label="Le visuel à valider"><div class="visuel-tete"><strong>Voici la modification de Bricou</strong><button type="button" class="visuel-x" data-fermer aria-label="Fermer">' . aled08e_icon('x') . '</button></div>'
                . ($url ? '<iframe class="visuel-cadre" data-src="' . esc_url($url) . '" title="Le site avec la modification" loading="lazy"></iframe><p class="visuel-lien"><a href="' . esc_url($url) . '" target="_blank" rel="noopener">Ouvrir dans un nouvel onglet</a></p>' : '')
                . aled08e_lia_bloc_confirmation($p) . '</dialog>';
        } elseif ($etat === 'question') {
            $q = preg_replace('/^Bricou : /u', '', (string) get_post_meta($p->ID, '_aled08_reponse', true));
            $h .= '<dialog class="visuel-modal" id="question-' . (int) $p->ID . '" aria-label="La question de Bricou"><div class="visuel-tete"><strong>Bricou vous pose une question</strong><button type="button" class="visuel-x" data-fermer aria-label="Fermer">' . aled08e_icon('x') . '</button></div>'
                . '<p class="visuel-question">' . nl2br(esc_html($q)) . '</p>' . aled08e_ech_bloc_question($p) . '</dialog>';
        }
    }
    return $h;
}
function aled08e_gauge_zone_html($uid) {
    return '<section class="gauge-zone" aria-label="Avancement de vos demandes"><div class="gauge-bloc" data-gauge aria-live="polite">' . aled08e_gauge_html($uid) . '</div><div data-gauge-modals>' . aled08e_gauge_modals_html($uid) . '</div></section>';
}

/* La croix pour annuler une demande en cours : à tout moment, sans limite. Rien n'a été changé sur le site avant la validation du visuel. */
function aled08e_gauge_croix_v2($p) {
    if (get_post_meta($p->ID, '_aled08_annulee_le', true)) return '';
    return '<form class="gauge-x-form" method="post" action="' . esc_url(aled08e_url()) . '" onsubmit="return confirm(\'Annuler cette demande ? Rien ne sera changé sur votre site.\');">'
        . '<input type="hidden" name="aled08e_annuler" value="' . (int) $p->ID . '">' . wp_nonce_field('aled08e_annuler_' . $p->ID, '_aled08e_annul', true, false)
        . '<button class="gauge-x" type="submit" title="Annuler cette demande" aria-label="Annuler cette demande">' . aled08e_icon('x') . '</button></form>';
}


/* =========================================================================
 *  La jauge (17 novembre 2026) : Cerise prépare la demande avec le client, Alex fait la modification.
 *  Étapes : Demande reçue · Précisée avec Cerise · Chez Alex · Faite. Tout se fait depuis la jauge (fenêtres).
 * ========================================================================= */
function aled08e_gauge_annulable($p) {
    if (get_post_meta($p->ID, '_aled08_annulee_le', true)) return false;
    // une demande s'annule tant qu'Alex ne l'a pas commencée
    return !(get_post_meta($p->ID, '_aled08_par', true) === 'alex' && get_post_meta($p->ID, '_aled08_statut', true) === 'encours');
}
function aled08e_gauge_croix($p) {
    if (!aled08e_gauge_annulable($p)) return '';
    return '<form class="gauge-x-form" method="post" action="' . esc_url(aled08e_url()) . '" onsubmit="return confirm(\'Annuler cette demande ?\');">'
        . '<input type="hidden" name="aled08e_annuler" value="' . (int) $p->ID . '">' . wp_nonce_field('aled08e_annuler_' . $p->ID, '_aled08e_annul', true, false)
        . '<button class="gauge-x" type="submit" title="Annuler cette demande" aria-label="Annuler cette demande">' . aled08e_icon('x') . '</button></form>';
}
function aled08e_gauge_html($uid) {
    $liste = aled08e_demandes_en_cours($uid);
    if (!$liste) return '';
    $etapes = ['Demande reçue', 'Précisée avec Bricou', 'Chez Alex', 'Faite'];
    $h = '';
    foreach (array_slice($liste, 0, aled08e_demandes_max($uid)) as $p) {
        $n = aled08e_gauge_etape($p);
        $etat = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
        $txt = trim(preg_replace('/\s+/u', ' ', $p->post_content));
        $h .= '<div class="gauge"><div class="gauge-entete"><p class="gauge-t"><strong>' . esc_html(mb_strlen($txt) > 70 ? mb_substr($txt, 0, 67) . '…' : $txt) . '</strong></p>' . aled08e_gauge_croix($p) . '</div><ol class="gauge-etapes" style="--n:' . (int) $n . '">';
        foreach ($etapes as $i => $e) {
            $in = '<b>' . ($i + 1 < $n ? '✓' : $i + 1) . '</b><span>' . esc_html($e) . '</span>';
            if ($i === 1 && $etat === 'a_confirmer') $in = '<button type="button" class="gauge-visuel" data-gauge-ouvrir="visuel-' . (int) $p->ID . '" title="Vérifier ma demande"><s class="gauge-tache" aria-hidden="true"></s>' . $in . '</button>';
            if ($i === 1 && $etat === 'question') $in = '<button type="button" class="gauge-visuel" data-gauge-ouvrir="question-' . (int) $p->ID . '" title="Répondre à Bricou"><s class="gauge-tache" aria-hidden="true"></s>' . $in . '</button>';
            $h .= '<li class="' . ($i + 1 < $n ? 'is-fait' : ($i + 1 === $n ? 'is-en-cours' : '')) . '">' . $in . '</li>';
        }
        $h .= '</ol>';
        if ($etat === 'a_confirmer') $h .= '<p class="gauge-a">Bricou a préparé votre demande : vérifiez qu’elle dit bien ce que vous voulez.</p><button type="button" class="btn btn-primary btn-sm gauge-btn" data-gauge-ouvrir="visuel-' . (int) $p->ID . '">' . aled08e_icon('eye') . '<span>Vérifier ma demande</span></button>';
        elseif ($etat === 'question') {
            $q = preg_replace('/^(Bricou|Bricou) : /u', '', (string) get_post_meta($p->ID, '_aled08_reponse', true));
            $h .= '<p class="gauge-a"><b>Bricou vous pose une question :</b> ' . esc_html(mb_substr($q, 0, 220)) . '</p><button type="button" class="btn btn-primary btn-sm gauge-btn" data-gauge-ouvrir="question-' . (int) $p->ID . '">' . aled08e_icon('message-circle') . '<span>Répondre à Bricou</span></button>';
        } elseif ($n === 3) {
            $ech = (int) get_post_meta($p->ID, '_aled08_echeance', true);
            $h .= '<p class="gauge-a">' . (get_post_meta($p->ID, '_aled08_statut', true) === 'encours' ? 'Alex travaille sur votre demande' : 'Votre demande est chez Alex') . ($ech ? ' : c’est fait d’ici ' . esc_html(aled08e_cer_echeance_txt($ech)) . '.' : '.') . '</p>';
        } else $h .= '<p class="gauge-a">Bricou relit votre demande…</p>';
        $h .= '</div>';
    }
    $max = aled08e_demandes_max($uid);
    if (count($liste) >= $max) $h .= '<p class="gauge-max">' . ($max > 1 ? 'Deux demandes à la fois' : 'Une demande à la fois') . ' avec votre abonnement : la suivante pourra partir dès que ' . ($max > 1 ? 'l’une est faite.' : 'celle-ci est faite.') . '</p>';
    return $h;
}
function aled08e_gauge_modals_html($uid) {
    $h = '';
    foreach (array_slice(aled08e_demandes_en_cours($uid), 0, aled08e_demandes_max($uid)) as $p) {
        $etat = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
        if ($etat === 'a_confirmer') {
            $h .= '<dialog class="visuel-modal" id="visuel-' . (int) $p->ID . '" aria-label="Votre demande à vérifier"><div class="visuel-tete"><strong>Votre demande, préparée par Bricou</strong><button type="button" class="visuel-x" data-fermer aria-label="Fermer">' . aled08e_icon('x') . '</button></div>'
                . aled08e_lia_bloc_confirmation($p) . '</dialog>';
        } elseif ($etat === 'question') {
            $q = preg_replace('/^(Bricou|Bricou) : /u', '', (string) get_post_meta($p->ID, '_aled08_reponse', true));
            $h .= '<dialog class="visuel-modal" id="question-' . (int) $p->ID . '" aria-label="La question de Bricou"><div class="visuel-tete"><strong>Bricou vous pose une question</strong><button type="button" class="visuel-x" data-fermer aria-label="Fermer">' . aled08e_icon('x') . '</button></div>'
                . '<p class="visuel-question">' . nl2br(esc_html($q)) . '</p>' . aled08e_ech_bloc_question($p) . '</dialog>';
        }
    }
    return $h;
}
