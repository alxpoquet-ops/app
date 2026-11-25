<?php
/**
 * Les Minis Monstres Espace client : l'onglet « Statistiques » de Mon site (25 novembre 2026, demande d'Alex :
 * « des infos, les meilleures pages, des stats claires et précises »).
 *
 * Les chiffres sont ceux que le connecteur mesure sur le site du client (action « stats », lue par aled08e_stats_lire,
 * gardée une heure) : visiteurs et pages vues jour par jour sur 30 jours, pages les plus vues, provenance, appareils,
 * recherches Google (si Search Console est relié), état du site. Rien n'est inventé : sans mesure, on le dit.
 * Les meilleures pages reçoivent leur vrai titre et leur lien grâce à la liste « Mes pages » (includes/mes-pages.php).
 * L'affichage (calculs et dessins) est fait par src/assets/js/main.js (« Statistiques »), le même pour la démo.
 */
defined('ABSPATH') || exit;

/* Les titres et adresses des pages du client, par chemin (« / », « /nos-gateaux » …), pour nommer les meilleures pages */
function aled08e_stats2_titres($uid) {
    if (!function_exists('aled08e_mp_lire')) return [];
    $r = aled08e_mp_lire($uid, false);
    $t = [];
    foreach ((array) ($r['pages'] ?? []) as $p) {
        if (empty($p['adresse'])) continue;
        $t[aled08e_mp_cle($p['adresse'])] = ['titre' => (string) $p['titre'], 'adresse' => (string) $p['adresse'], 'google' => !empty($p['google'])];
    }
    return $t;
}

add_action('wp_ajax_aled08e_stats2', function () {
    if (!check_ajax_referer('aled08e_stats2', '_n', false)) wp_send_json_error(['etat' => 'session'], 403);
    $uid = get_current_user_id();
    if (!$uid) wp_send_json_error(['etat' => 'session'], 403);
    $d = aled08e_stats_lire($uid);
    if (($d['etat'] ?? '') === 'ok') {
        $titres = aled08e_stats2_titres($uid);
        $infos = [];
        foreach ((array) ($d['pages'] ?? []) as $chemin => $vues) {
            $k = aled08e_mp_cle((string) $chemin);
            if (isset($titres[$k])) $infos[(string) $chemin] = $titres[$k];
        }
        $d['pages_infos'] = (object) $infos;
        unset($d['serveur']['memoire'], $d['serveur']['memoire_max'], $d['serveur']['coeurs'], $d['serveur']['charge'], $d['serveur']['disque_libre'], $d['serveur']['disque_total']);
    }
    wp_send_json_success($d);
});

/* Le squelette de l'onglet ; main.js le remplit (et le met à jour toutes les heures) */
function aled08e_stats2_squelette($attrs) {
    $kpi = function ($k, $ic, $lab, $c) { return '<div class="st2-kpi c-' . $c . '"><span class="st2-kpi-ico" aria-hidden="true">' . aled08e_icon($ic) . '</span><small>' . esc_html($lab) . '</small><strong data-st2-v="' . $k . '">…</strong><span class="st2-kpi-plus" data-st2-p="' . $k . '"></span></div>'; };
    $bloc = function ($id, $ic, $titre, $corps, $aide) { return '<section class="st2-bloc" data-st2-bloc="' . $id . '"><h3>' . aled08e_icon($ic) . '<span>' . esc_html($titre) . '</span></h3>' . $corps . '<p class="st2-aide">' . esc_html($aide) . '</p></section>'; };
    return '<div class="st2" data-stats2 ' . $attrs . '>'
        . '<p class="st2-maj" data-st2-maj aria-live="polite">Connexion à votre site…</p>'
        . '<p class="esp-warn" data-st2-msg hidden></p>'
        . '<div class="st2-kpis">' . $kpi('visiteurs', 'users', 'Visiteurs sur 30 jours', 'mint') . $kpi('vues', 'eye', 'Pages vues sur 30 jours', 'sky') . $kpi('semaine', 'calendar-check', 'Visiteurs cette semaine', 'lilac') . $kpi('google', 'search', 'Clics depuis Google', 'peach') . '</div>'
        . $bloc('pages', 'trophy', 'Vos meilleures pages', '<ol class="st2-pages" data-st2="pages"></ol>', 'Les pages les plus vues sur les 30 derniers jours. La part indique quelle proportion de toutes les pages vues elle représente.')
        . $bloc('jours', 'chart-line', 'Vos visiteurs, jour par jour', '<div class="st2-jours" data-st2="jours"></div><p class="st2-ligne" data-st2="record"></p>', 'Chaque barre est une journée : le nombre de personnes différentes venues sur votre site ce jour-là.')
        . '<div class="st2-duo">'
        . $bloc('sources', 'navigation', 'D’où viennent vos visiteurs', '<ul class="st2-barres" data-st2="sources"></ul>', 'Accès direct : votre adresse tapée, un favori, un lien dans un e-mail ou un SMS.')
        . $bloc('appareils', 'smartphone', 'Sur quel appareil', '<ul class="st2-barres" data-st2="appareils"></ul>', 'Sur téléphone, un site doit se lire sans zoomer : le vôtre est fait pour.')
        . '</div>'
        . $bloc('google', 'search-check', 'Sur Google', '<div class="st2-google" data-st2="google"></div>', 'Apparitions : combien de fois votre site s’est affiché dans les résultats. Position : votre place moyenne dans la page de Google (1 = tout en haut).')
        . $bloc('infos', 'info', 'Votre site en bref', '<dl class="st2-infos" data-st2="infos"></dl>', 'La vitesse est le temps moyen que met votre site à répondre. Sous une demi-seconde, c’est très rapide.')
        . '<p class="app-note">Mesure d’audience sans cookie : vos visiteurs sont comptés de façon anonyme, sans aucune donnée personnelle gardée. Vos propres visites, quand vous êtes connecté, et celles des robots ne sont pas comptées.</p>'
        . '</div>';
}
function aled08e_stats2_html($uid) {
    $ajax = esc_url(admin_url('admin-ajax.php'));
    return aled08e_stats2_squelette('data-ajax="' . $ajax . '" data-nonce="' . esc_attr(wp_create_nonce('aled08e_stats2')) . '"');
}
