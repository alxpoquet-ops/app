<?php
/**
 * Le délai de livraison du site (décision d'Alex, 25 novembre 2026 ; 12 heures au lieu de 24 depuis le 26 novembre 2026).
 *
 * Au client, on annonce « en moins d’une semaine » après le questionnaire complet. En vrai, le site est fait, contrôlé et
 * peaufiné tout de suite, puis gardé : il est livré exactement 12 heures après le moment où l'on a toutes les informations : le questionnaire envoyé en entier, ou la dernière réponse
 * du client à une question de l'atelier. Le site peut être prêt avant : il attend alors son heure (état « pret_livraison »)
 * et part tout seul, à l'heure dite, avec l'e-mail « Votre site est en ligne ».
 */
if (!defined('ABSPATH')) exit;

define('ALED08E_DELAI_LIVRAISON', 12 * HOUR_IN_SECONDS);

/* Le moment où l'on a eu toutes les informations (horodatage) : la dernière réponse complète du client */
function aled08e_infos_le($cid) {
    $t = (int) get_post_meta((int) $cid, '_aled08_infos_le', true);
    if ($t) return $t;
    $b = function_exists('aled08e_brief_le') ? aled08e_brief_le($cid) : '';
    return $b !== '' ? (int) get_gmt_from_date($b, 'U') : 0;
}
function aled08e_infos_completes($cid) { update_post_meta((int) $cid, '_aled08_infos_le', time()); }

/* L'heure de livraison : 12 heures après les informations complètes (0 si on ne les a pas encore) */
function aled08e_livraison_heure($cid) { $t = aled08e_infos_le($cid); return $t ? $t + ALED08E_DELAI_LIVRAISON : 0; }

/* Le site est prêt : on le livre tout de suite si l'heure est passée, sinon on le programme. Renvoie l'heure, ou 0 si livré. */
function aled08e_livrer_a_l_heure($cid, $lien = '') {
    $h = aled08e_livraison_heure($cid);
    if ($h <= time()) { aled08e_chantier_livrer_v1($cid, $lien); return 0; }
    update_post_meta($cid, '_aled08_chantier', 'pret_livraison');
    update_post_meta($cid, '_aled08_livrer_le', $h);
    $c = aled08e_cmd_get($cid);
    if ($c && $c['statut'] === 'pret') aled08e_cmd_set_statut($cid, 'en_creation', 'Site contrôlé, livraison programmée.');
    wp_clear_scheduled_hook('aled08e_livraison_programmee', [(int) $cid]);
    wp_schedule_single_event($h, 'aled08e_livraison_programmee', [(int) $cid]);
    aled08e_cmd_journal($cid, 'Atelier : contrôle bon, livraison programmée le ' . wp_date('j F Y à H:i', $h) . ' (12 heures après les informations complètes).');
    return $h;
}

/* À l'heure dite : la livraison, si le site attend toujours (Alex a pu le reprendre entre-temps) */
function aled08e_livraison_due($cid) {
    $cid = (int) $cid;
    if (aled08e_chantier_etat($cid) !== 'pret_livraison') return;
    $h = (int) get_post_meta($cid, '_aled08_livrer_le', true);
    if ($h > time()) { wp_schedule_single_event($h, 'aled08e_livraison_programmee', [$cid]); return; }
    $c = aled08e_cmd_get($cid);
    if (!$c || !in_array($c['statut'], ['pret', 'en_creation'], true)) return;
    delete_post_meta($cid, '_aled08_livrer_le');
    aled08e_chantier_livrer_v1($cid);
}
add_action('aled08e_livraison_programmee', 'aled08e_livraison_due');

/* Filet : la tâche WordPress ne part qu'avec une visite. Toutes les 10 minutes au plus, on livre ce qui est en retard. */
add_action('init', function () {
    if (get_transient('aled08e_livraisons_vues')) return;
    set_transient('aled08e_livraisons_vues', 1, 10 * MINUTE_IN_SECONDS);
    $ids = get_posts(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'any', 'numberposts' => 20, 'fields' => 'ids',
        'meta_query' => [['key' => '_aled08_chantier', 'value' => 'pret_livraison'], ['key' => '_aled08_livrer_le', 'value' => time(), 'compare' => '<=', 'type' => 'NUMERIC']]]);
    foreach ($ids as $cid) aled08e_livraison_due($cid);
}, 40);
