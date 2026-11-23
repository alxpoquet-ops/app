<?php
/**
 * Les Minis Monstres Espace client : l'administration.
 *  - menu « Les Minis Monstres » : Tableau de bord, Commandes, Demandes clients, Réglages (pastille des commandes à traiter)
 *  - liste des commandes (colonnes), fiche commande (détails, actions par boutons, journal)
 *  - réglages : Stripe (clés, secret du webhook, pied de page des factures, test), e-mail de réception, mise en ligne automatique (OVH, cPanel)
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  Menu
 * ========================================================================= */
add_action('admin_menu', function () {
    add_menu_page('Les Minis Monstres', 'Les Minis Monstres', 'manage_options', 'aled08', 'aled08e_admin_tableau', 'dashicons-smiley', 3);
    add_submenu_page('aled08', 'Tableau de bord des Minis Monstres', 'Tableau de bord', 'manage_options', 'aled08', 'aled08e_admin_tableau');
}, 9);
add_action('admin_menu', function () {
    add_submenu_page('aled08', 'Réglages des Minis Monstres', 'Réglages', 'manage_options', 'aled08-reglages', 'aled08e_admin_reglages');
}, 11);

/* Commandes qui demandent une action : à encaisser, payées (domaine à réserver, création à lancer) */
function aled08e_admin_a_traiter() {
    $out = [];
    foreach (aled08e_cmd_par_statut(['attente_paiement', 'payee', 'domaine_commande', 'domaine_attribue', 'hebergement', 'ssl', 'pret', 'en_creation']) as $c) {
        $auto = in_array($c['statut'], aled08e_prov_etapes_auto(), true);
        if ($c['statut'] === 'attente_paiement' || $c['statut'] === 'pret') $out[] = $c; // à encaisser, ou à créer
        elseif ($auto && (get_post_meta($c['id'], '_aled08_intervention', true) || get_post_meta($c['id'], '_aled08_ovh_devis_mail', true) && !get_post_meta($c['id'], '_aled08_ovh_valide', true))) $out[] = $c; // bloquée
        elseif ($auto && aled08e_hebergeur() === 'manuel' && in_array($c['statut'], ['domaine_attribue'], true)) $out[] = $c; // à ajouter à la main
        elseif ($auto && aled08e_registrar() !== 'ovh' && $c['statut'] === 'payee' && $c['domaine'] && !$c['domaine_mien']) $out[] = $c; // domaine à réserver à la main
    }
    return $out;
}
function aled08e_admin_badge($n) {
    return $n ? ' <span class="awaiting-mod count-' . (int) $n . '"><span class="pending-count">' . (int) $n . '</span></span>' : '';
}
add_action('admin_menu', function () {
    global $menu, $submenu;
    if (!current_user_can('manage_options')) return;
    $n = count(aled08e_admin_a_traiter());
    if ($n && is_array($menu)) {
        foreach ($menu as $i => $item) if (($item[2] ?? '') === 'aled08') $menu[$i][0] .= aled08e_admin_badge($n);
    }
    $q = new WP_Query(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'posts_per_page' => 50, 'fields' => 'ids', 'no_found_rows' => true, 'meta_key' => '_aled08_statut', 'meta_value' => 'recue']);
    $d = count($q->posts);
    if (is_array($submenu) && isset($submenu['aled08'])) {
        foreach ($submenu['aled08'] as $i => $item) {
            if (($item[2] ?? '') === 'edit.php?post_type=' . ALED08E_CPT && $d) $submenu['aled08'][$i][0] .= aled08e_admin_badge($d);
            if (($item[2] ?? '') === 'edit.php?post_type=' . ALED08E_CPT_CMD && $n) $submenu['aled08'][$i][0] .= aled08e_admin_badge($n);
        }
    }
}, 99);

/* Un peu de style pour nos pages */
add_action('admin_head', function () {
    $s = get_current_screen();
    if (!$s || (strpos((string) $s->id, 'aled08') === false && $s->post_type !== ALED08E_CPT_CMD)) return;
    echo '<style>
.aled08-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin:16px 0}
.aled08-card{background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:14px 18px}
.aled08-card h2{margin:0 0 8px;font-size:15px;display:flex;align-items:center;gap:8px}
.aled08-card h2 .count{background:#d63638;color:#fff;border-radius:10px;padding:0 7px;font-size:12px;line-height:18px}
.aled08-card h2 .count.ok{background:#00a32a}
.aled08-card ul{margin:0}.aled08-card li{margin:0 0 8px;padding:8px 10px;background:#f6f7f7;border-radius:6px}
.aled08-card li small{color:#646970;display:block}
.aled08-card .help{color:#646970;font-size:12px;margin:6px 0 0}
.aled08-pre{white-space:pre-wrap;background:#f6f7f7;border-radius:6px;padding:8px 10px;font-size:12px;margin:0}
.aled08-st{display:inline-block;padding:2px 9px;border-radius:999px;font-weight:600;font-size:12px}
.aled08-st-attente_paiement{background:#DDEEFF;color:#2C67AE}.aled08-st-payee,.aled08-st-en_creation,.aled08-st-domaine_commande,.aled08-st-domaine_attribue,.aled08-st-hebergement,.aled08-st-ssl,.aled08-st-pret{background:#FFF1C2;color:#7A5600}.aled08-st-en_ligne{background:#D5F5E8;color:#176A4C}.aled08-st-annulee{background:#eee;color:#555}
.aled08-prov{margin:0 0 10px;padding:10px 12px;border-radius:8px;background:#f6f7f7}.aled08-prov.is-hold{background:#fcf0f1}.aled08-prov ol{margin:6px 0 0 18px}.aled08-prov li.is-done{color:#1f7a55}.aled08-prov li.is-now{font-weight:600}
.aled08-actions form{margin:0 0 8px}.aled08-actions .button{width:100%;text-align:center}
.aled08-detail dl{display:grid;grid-template-columns:170px 1fr;gap:6px 12px;margin:0}.aled08-detail dt{color:#646970}.aled08-detail dd{margin:0}
.aled08-journal{margin:0}.aled08-journal li{margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid #f0f0f1;font-size:13px}.aled08-journal small{color:#646970}
.aled08-copy{width:100%;font-family:monospace}
</style>';
});

/* =========================================================================
 *  Tableau de bord
 * ========================================================================= */
function aled08e_admin_lien_cmd($c) {
    return '<a href="' . esc_url(aled08e_cmd_admin_url($c['id'])) . '"><strong>' . esc_html($c['ref']) . '</strong></a> : ' . esc_html(aled08e_cmd_nom($c));
}
function aled08e_admin_tableau() {
    if (!current_user_can('manage_options')) return;
    $aTraiter = aled08e_admin_a_traiter();
    $domaines = [];
    if (aled08e_registrar() !== 'ovh') foreach (aled08e_cmd_par_statut(['payee', 'en_creation']) as $c) if ($c['domaine'] && !$c['domaine_mien'] && $c['domaine_statut'] === 'a_reserver') $domaines[] = $c;
    $misesEnLigne = aled08e_prov_en_cours();
    $interventions = [];
    foreach ($misesEnLigne as $c) if (get_post_meta($c['id'], '_aled08_intervention', true) || (get_post_meta($c['id'], '_aled08_ovh_devis_mail', true) && !get_post_meta($c['id'], '_aled08_ovh_valide', true))) $interventions[] = $c;
    $demandes = get_posts(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'numberposts' => 20, 'meta_key' => '_aled08_statut', 'meta_value' => 'recue']);
    $retards = get_users(['role' => ALED08E_ROLE, 'meta_key' => 'aled08_abonnement', 'meta_value' => 'past_due', 'number' => 50]);
    $suppr = aled08e_comptes_a_supprimer(30);
    $lissages = [];
    foreach (aled08e_cmd_liste(['meta_key' => '_aled08_lissage', 'meta_value' => 0, 'meta_compare' => '>', 'meta_type' => 'NUMERIC']) as $c) if ($c['statut'] !== 'annulee' && !get_post_meta($c['id'], '_aled08_lissage_fini', true) && in_array($c['statut'], aled08e_cmd_statuts_payes(), true)) $lissages[] = $c;
    $stripe = aled08e_stripe_ready();
    $libSt = aled08e_cmd_statuts();
    echo '<div class="wrap"><h1>Les Minis Monstres : tableau de bord</h1>';
    echo '<p>Tout ce qui demande une action est ici. Les commandes arrivent depuis la page <a href="' . esc_url(home_url('/commander/')) . '" target="_blank">/commander/</a>, les demandes depuis l’espace client.</p>';
    if (!$stripe) echo '<div class="notice notice-warning inline"><p>Le paiement en ligne n’est pas activé : les commandes sont enregistrées « en attente de paiement » et vous envoyez le lien de paiement vous-même. <a href="' . esc_url(admin_url('admin.php?page=aled08-reglages')) . '">Activer Stripe</a>.</p></div>';
    elseif (aled08e_stripe_mode_test()) echo '<div class="notice notice-info inline"><p>Stripe est en <strong>mode test</strong> : aucun vrai paiement n’est encaissé. Remplacez la clé par la clé réelle (sk_live_…) dans les réglages quand tout est vérifié.</p></div>';
    if (function_exists('aled08e_lia_cle') && aled08e_lia_cle() === '') echo '<div class="notice notice-warning inline"><p><strong>La petite bande n’est pas encore branchée.</strong> La bulle de Cerise, la préparation des demandes et les sujets de Lumi attendent votre clé Claude : c’est la seule chose à régler. <a class="button button-primary" href="' . esc_url(admin_url('admin.php?page=aled08-reglages#aled08e-lia-key')) . '">Entrer ma clé Claude</a></p></div>';
    elseif (function_exists('aled08e_lia_sdk_present') && !aled08e_lia_sdk_present()) echo '<div class="notice notice-warning inline"><p><strong>Le kit Claude est absent.</strong> Installez l’extension « alexlia-sdk » pour que Cerise fonctionne.</p></div>';
    echo '<div class="aled08-cards">';

    echo '<div class="aled08-card"><h2>Commandes à traiter <span class="count' . ($aTraiter ? '' : ' ok') . '">' . count($aTraiter) . '</span></h2>';
    if ($aTraiter) {
        echo '<ul>';
        foreach ($aTraiter as $c) {
            if ($c['statut'] === 'attente_paiement') $aide = $stripe ? 'Le client n’a pas fini son paiement. Relancez-le, ou marquez « Payée » s’il a payé autrement.' : 'Envoyez le lien de paiement, puis marquez « Payée ».';
            elseif ($c['statut'] === 'pret') $aide = 'Tout est prêt : créez le site, puis cliquez « Site en ligne ».';
            elseif (get_post_meta($c['id'], '_aled08_intervention', true)) $aide = 'Intervention nécessaire : ' . (string) get_post_meta($c['id'], '_aled08_intervention_msg', true);
            elseif (get_post_meta($c['id'], '_aled08_ovh_devis_mail', true) && !get_post_meta($c['id'], '_aled08_ovh_valide', true)) $aide = 'Achat du domaine à confirmer (essai à blanc OVH) : ' . (string) get_post_meta($c['id'], '_aled08_ovh_devis', true) . ' € TTC.';
            elseif ($c['statut'] === 'domaine_attribue') $aide = 'Ajoutez le domaine sur l’hébergement à la main, puis cliquez « Domaine ajouté ».';
            else $aide = 'Réservez le nom de domaine, puis cliquez « Domaine réservé ».';
            echo '<li>' . aled08e_admin_lien_cmd($c) . ' <span class="aled08-st aled08-st-' . esc_attr($c['statut']) . '">' . esc_html($libSt[$c['statut']][0]) . '</span><small>' . esc_html($aide) . '</small></li>';
        }
        echo '</ul>';
    } else echo '<p>Rien à faire pour le moment.</p>';
    echo '<p class="help"><a href="' . esc_url(admin_url('edit.php?post_type=' . ALED08E_CPT_CMD)) . '">Toutes les commandes</a></p></div>';

    echo '<div class="aled08-card"><h2>Mises en ligne en cours <span class="count' . ($interventions ? '' : ' ok') . '">' . count($misesEnLigne) . '</span></h2>';
    echo '<p class="help">Après paiement, l’automate enchaîne : nom de domaine (' . esc_html(aled08e_registrar() === 'ovh' ? 'achat OVH' : 'à réserver à la main') . '), hébergement (' . esc_html(aled08e_hebergeur_libelle()) . '), DNS, certificat SSL. Une étape bloquée vous est signalée par e-mail. Prochain passage de l’automate : ' . (($n2 = wp_next_scheduled('aled08_provision')) ? esc_html(wp_date('H:i', $n2)) : 'non planifié') . '.</p>';
    if ($misesEnLigne) {
        echo '<ul>';
        foreach ($misesEnLigne as $c) {
            $dep = (int) get_post_meta($c['id'], '_aled08_etape_depuis', true);
            $inter = get_post_meta($c['id'], '_aled08_intervention', true);
            echo '<li>' . aled08e_admin_lien_cmd($c) . ' <span class="aled08-st aled08-st-' . esc_attr($c['statut']) . '">' . esc_html($libSt[$c['statut']][0]) . '</span><small>' . esc_html(($c['domaine'] ?: 'sans domaine') . ($dep ? ', depuis ' . human_time_diff($dep) : '') . ($inter ? '. INTERVENTION : ' . (string) get_post_meta($c['id'], '_aled08_intervention_msg', true) : '')) . '</small></li>';
        }
        echo '</ul>';
    } else echo '<p>Aucune mise en ligne en cours.</p>';
    echo '</div>';

    echo '<div class="aled08-card"><h2>Noms de domaine à réserver à la main <span class="count' . ($domaines ? '' : ' ok') . '">' . count($domaines) . '</span></h2>';
    if ($domaines) {
        echo '<p class="help">OVH n’est pas configuré : commandez le domaine chez votre registrar (le titulaire est le client), puis cliquez « Domaine réservé » dans la fiche. Pour l’achat automatique, renseignez vos clés OVH dans les réglages.</p><ul>';
        foreach ($domaines as $c) echo '<li><strong>' . esc_html($c['domaine']) . '</strong> (' . aled08e_admin_lien_cmd($c) . ')<small>Titulaire : ' . esc_html(str_replace("\n", ', ', aled08e_cmd_titulaire_txt($c))) . '</small></li>';
        echo '</ul>';
    } else echo '<p>Aucun nom de domaine en attente.</p>';
    echo '</div>';

    echo '<div class="aled08-card"><h2>Demandes de modification reçues <span class="count' . ($demandes ? '' : ' ok') . '">' . count($demandes) . '</span></h2>';
    if ($demandes) {
        echo '<ul>';
        foreach ($demandes as $p) { $u = get_userdata($p->post_author); echo '<li><a href="' . esc_url(get_edit_post_link($p->ID)) . '">' . esc_html($p->post_title) . '</a><small>' . esc_html(($u ? $u->display_name : '') . ', ' . aled08e_date($p->post_date)) . '</small></li>'; }
        echo '</ul>';
    } else echo '<p>Aucune demande en attente.</p>';
    echo '<p class="help"><a href="' . esc_url(admin_url('edit.php?post_type=' . ALED08E_CPT)) . '">Toutes les demandes</a></p></div>';

    echo '<div class="aled08-card"><h2>Abonnements en retard de paiement <span class="count' . ($retards ? '' : ' ok') . '">' . count($retards) . '</span></h2>';
    if ($retards) {
        echo '<p class="help">Stripe réessaie tout seul pendant quelques jours. Le client voit un message dans son espace pour changer de carte.</p><ul>';
        foreach ($retards as $u) echo '<li><a href="' . esc_url(get_edit_user_link($u->ID)) . '">' . esc_html($u->display_name) . '</a><small>' . esc_html($u->user_email) . '</small></li>';
        echo '</ul>';
    } else echo '<p>Tous les abonnements sont à jour.</p>';
    echo '</div>';

    echo '<div class="aled08-card"><h2>Comptes supprimés sous 30 jours <span class="count' . ($suppr ? '' : ' ok') . '">' . count($suppr) . '</span></h2>';
    echo '<p class="help">Un compte client sans connexion depuis 12 mois et sans abonnement actif est supprimé par la tâche quotidienne, avec un e-mail d’avertissement un mois avant. Pour garder un compte, cochez « Abonnement actif hors Stripe » dans sa fiche.</p>';
    if ($suppr) {
        echo '<ul>';
        foreach ($suppr as $s) echo '<li><a href="' . esc_url(get_edit_user_link($s['user']->ID)) . '">' . esc_html($s['user']->display_name) . '</a><small>suppression prévue le ' . esc_html(wp_date('j F Y', $s['suppression'])) . ($s['averti'] ? ', averti' : ', avertissement à venir') . '</small></li>';
        echo '</ul>';
    } else echo '<p>Aucun compte concerné.</p>';
    $next = wp_next_scheduled('aled08_quotidien');
    echo '<p class="help">Prochaine tâche quotidienne : ' . ($next ? esc_html(wp_date('j F Y à H:i', $next)) : 'non planifiée (elle se planifie au prochain chargement)') . '.</p></div>';

    echo '<div class="aled08-card"><h2>Lissages en cours <span class="count ok">' . count($lissages) . '</span></h2>';
    if ($lissages) {
        echo '<ul>';
        foreach ($lissages as $c) echo '<li>' . aled08e_admin_lien_cmd($c) . '<small>Lissage : ' . (int) $c['lissage_paye'] . ' / ' . (int) $c['montants']['lissage_total_echeances'] . ' payées, ' . aled08e_euro($c['montants']['lissage_mensualite']) . ' ' . ($c['periode'] === 'annee' ? 'par an' : 'par mois') . ($c['stripe_subscription'] ? '' : ', hors Stripe') . '</small></li>';
        echo '</ul>';
    } else echo '<p>Aucun lissage en cours.</p>';
    echo '<p class="help">Après la dernière échéance, la ligne « création lissée » est retirée de l’abonnement Stripe automatiquement. Une vérification quotidienne recompte depuis les factures.</p></div>';

    echo '<div class="aled08-card"><h2>Derniers événements Stripe</h2>';
    $j = array_slice(aled08e_stripe_journal(), 0, 15);
    if ($j) {
        echo '<ul class="aled08-journal">';
        foreach ($j as $e) echo '<li><small>' . esc_html(wp_date('d/m H:i', strtotime(get_gmt_from_date($e['date']) . ' UTC'))) . '</small> <strong>' . esc_html($e['type']) . '</strong> : ' . esc_html($e['resultat']) . '</li>';
        echo '</ul>';
    } else echo '<p>Aucun événement reçu pour le moment.' . ($stripe ? ' Vérifiez que le webhook est bien créé dans Stripe (voir Réglages).' : '') . '</p>';
    $refus = aled08e_stripe_refus();
    if ($refus) echo '<p class="help">' . (int) $refus['n'] . ' requête(s) sans signature valable refusée(s) sur le webhook, la dernière le ' . esc_html(wp_date('d/m/Y à H:i', strtotime(get_gmt_from_date($refus['dernier']) . ' UTC'))) . '. Si le chiffre grimpe alors que Stripe n’enregistre aucun événement, vérifiez le secret du webhook dans les réglages.</p>';
    echo '</div>';

    echo '<div class="aled08-card"><h2>Derniers appels OVH</h2>';
    $j = array_slice(aled08e_ovh_journal(), 0, 12);
    if ($j) {
        echo '<ul class="aled08-journal">';
        foreach ($j as $e) echo '<li><small>' . esc_html(wp_date('d/m H:i', strtotime(get_gmt_from_date($e['date']) . ' UTC'))) . '</small> <strong>' . esc_html($e['type']) . '</strong> : ' . esc_html($e['resultat']) . '</li>';
        echo '</ul>';
    } else echo '<p>' . (aled08e_ovh_ready() ? 'Aucun appel pour le moment.' : 'OVH n’est pas configuré (réglages).') . '</p>';
    echo '</div>';

    echo '<div class="aled08-card"><h2>Journal des comptes</h2>';
    $j = array_slice(aled08e_comptes_journal(), 0, 10);
    if ($j) {
        echo '<ul class="aled08-journal">';
        foreach ($j as $e) echo '<li><small>' . esc_html(wp_date('d/m/Y', strtotime(get_gmt_from_date($e['date']) . ' UTC'))) . '</small> ' . esc_html($e['texte']) . '</li>';
        echo '</ul>';
    } else echo '<p>Rien pour le moment.</p>';
    echo '</div>';

    echo '</div></div>';
}

/* =========================================================================
 *  Liste des commandes : colonnes
 * ========================================================================= */
add_filter('manage_' . ALED08E_CPT_CMD . '_posts_columns', function ($c) {
    return ['cb' => $c['cb'] ?? '', 'aled08_ref' => 'Référence', 'aled08_client' => 'Client', 'aled08_site' => 'Site', 'aled08_forfait' => 'Abonnement', 'aled08_jour' => 'Montant du jour', 'aled08_statut' => 'Statut', 'aled08_domaine' => 'Nom de domaine', 'date' => 'Date'];
});
add_action('manage_' . ALED08E_CPT_CMD . '_posts_custom_column', function ($col, $pid) {
    $c = aled08e_cmd_get($pid);
    if (!$c) return;
    switch ($col) {
        case 'aled08_ref':
            echo '<a class="row-title" href="' . esc_url(aled08e_cmd_admin_url($pid)) . '"><strong>' . esc_html($c['ref']) . '</strong></a>';
            if ($c['lissage']) echo '<br><small>lissé ' . (int) $c['lissage_paye'] . ' / ' . (int) $c['montants']['lissage_total_echeances'] . '</small>';
            break;
        case 'aled08_client':
            echo esc_html(aled08e_cmd_nom($c)) . '<br><small><a href="mailto:' . esc_attr($c['email']) . '">' . esc_html($c['email']) . '</a></small>';
            break;
        case 'aled08_site':
            $t = aled08e_type($c['type']);
            echo esc_html($t ? $t['label'] : $c['type']) . '<br><small>' . aled08e_euro($c['montants']['creation']) . '</small>';
            break;
        case 'aled08_forfait':
            echo esc_html(aled08e_euro_txt(aled08e_forfait($c['forfait'])['month'])) . ' par mois<br><small>' . ($c['periode'] === 'annee' ? 'payé à l’année' : 'payé au mois') . ($c['options'] ? ', ' . esc_html(implode(', ', $c['options'])) : '') . '</small>';
            break;
        case 'aled08_jour':
            echo '<strong>' . aled08e_euro($c['montants']['total_jour']) . '</strong>';
            if ($c['montants']['solde'] > 0) echo '<br><small>reste ' . aled08e_euro($c['montants']['solde']) . (($c['solde_paye'] || $c['reception_payee']) ? ' réglé' : ' à la réception') . '</small>';
            break;
        case 'aled08_statut':
            echo '<span class="aled08-st aled08-st-' . esc_attr($c['statut']) . '">' . esc_html(aled08e_cmd_statuts()[$c['statut']][0] ?? $c['statut']) . '</span>';
            if ($c['paiement_en_cours']) echo '<br><small>prélèvement en cours</small>';
            break;
        case 'aled08_domaine':
            if (!$c['domaine']) echo '<em>à choisir</em>';
            else echo esc_html($c['domaine']) . '<br><small>' . esc_html(aled08e_cmd_domaine_statuts()[$c['domaine_statut']] ?? $c['domaine_statut']) . '</small>';
            break;
    }
}, 10, 2);
add_filter('post_row_actions', function ($actions, $post) {
    if ($post->post_type === ALED08E_CPT_CMD) { unset($actions['inline hide-if-no-js'], $actions['view']); }
    return $actions;
}, 10, 2);

/* =========================================================================
 *  Fiche commande : détails, actions, journal
 * ========================================================================= */
add_action('add_meta_boxes_' . ALED08E_CPT_CMD, function ($post) {
    remove_meta_box('submitdiv', ALED08E_CPT_CMD, 'side');
    remove_meta_box('slugdiv', ALED08E_CPT_CMD, 'normal');
    add_meta_box('aled08e_cmd_actions', 'Actions', 'aled08e_cmd_box_actions', ALED08E_CPT_CMD, 'side', 'high');
    add_meta_box('aled08e_cmd_detail', 'La commande', 'aled08e_cmd_box_detail', ALED08E_CPT_CMD, 'normal', 'high');
    add_meta_box('aled08e_cmd_journal', 'Journal', 'aled08e_cmd_box_journal', ALED08E_CPT_CMD, 'normal', 'default');
});
/* Le titre n'est pas modifiable : on le montre tel quel */
add_action('edit_form_after_title', function ($post) {
    if ($post->post_type !== ALED08E_CPT_CMD) return;
    echo '<style>#titlediv{display:none}</style><h2 style="margin:0 0 12px">' . esc_html($post->post_title) . '</h2>';
});
function aled08e_cmd_bouton($cid, $faire, $label, $classe = 'button', $confirm = '', $extra = '') {
    return '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"' . ($confirm ? ' onsubmit="return confirm(' . esc_attr(wp_json_encode($confirm)) . ')"' : '') . '>'
        . '<input type="hidden" name="action" value="aled08e_cmd"><input type="hidden" name="cid" value="' . (int) $cid . '"><input type="hidden" name="faire" value="' . esc_attr($faire) . '">'
        . wp_nonce_field('aled08e_cmd_' . $cid, '_aled08e_cmd', true, false) . $extra
        . '<button type="submit" class="' . esc_attr($classe) . '">' . esc_html($label) . '</button></form>';
}
function aled08e_cmd_box_actions($post) {
    $c = aled08e_cmd_get($post->ID);
    if (!$c) return;
    $s = $c['statut'];
    $stripe = aled08e_stripe_ready();
    $soldeDu = !$c['reception_payee'] && $c['montants']['solde'] > 0 && !$c['solde_paye'];
    echo '<div class="aled08-actions">';
    echo '<p>Statut : <span class="aled08-st aled08-st-' . esc_attr($s) . '">' . esc_html(aled08e_cmd_statuts()[$s][0]) . '</span></p>';
    if ($s === 'attente_paiement') {
        echo aled08e_cmd_bouton($post->ID, 'payee', 'Marquer payée (hors Stripe)', 'button button-primary', 'Le client a payé autrement (virement, espèces) ? La commande passe à « Payée » et le client reçoit un e-mail.');
        echo '<p class="description">' . ($stripe ? 'Le client peut aussi reprendre son paiement en ligne depuis son espace.' : 'Envoyez-lui votre lien de paiement ou votre RIB, puis cliquez ici.') . '</p>';
    }
    $auto = in_array($s, aled08e_prov_etapes_auto(), true);
    if ($auto) {
        $inter = get_post_meta($post->ID, '_aled08_intervention', true);
        $devis = get_post_meta($post->ID, '_aled08_ovh_devis_mail', true) && !get_post_meta($post->ID, '_aled08_ovh_valide', true) && $s === 'payee';
        $dep = (int) get_post_meta($post->ID, '_aled08_etape_depuis', true);
        echo '<div class="aled08-prov' . ($inter ? ' is-hold' : '') . '"><strong>Mise en ligne automatique</strong> (' . esc_html(aled08e_hebergeur_libelle()) . ', domaine ' . esc_html(aled08e_registrar() === 'ovh' ? 'OVH' : 'à la main') . ')<br>'
            . 'Étape : ' . esc_html(aled08e_cmd_statuts()[$s][0]) . ($dep ? ', depuis ' . esc_html(human_time_diff($dep)) : '') . ', essais : ' . (int) get_post_meta($post->ID, '_aled08_etape_tentatives', true)
            . ($inter ? '<br><strong>Intervention nécessaire :</strong> ' . esc_html((string) get_post_meta($post->ID, '_aled08_intervention_msg', true)) : '')
            . ($devis ? '<br><strong>Achat du domaine à confirmer :</strong> ' . esc_html($c['domaine']) . ' pour ' . esc_html((string) get_post_meta($post->ID, '_aled08_ovh_devis', true)) . ' € TTC (essai à blanc OVH).' : '')
            . (get_post_meta($post->ID, '_aled08_ovh_order', true) ? '<br>Commande OVH n° ' . esc_html((string) get_post_meta($post->ID, '_aled08_ovh_order', true)) . (get_post_meta($post->ID, '_aled08_ovh_prix', true) !== '' ? ' (' . esc_html((string) get_post_meta($post->ID, '_aled08_ovh_prix', true)) . ' € TTC)' : '') : '')
            . '</div>';
        if ($devis) echo aled08e_cmd_bouton($post->ID, 'ovh_confirmer', 'Confirmer l’achat OVH (' . (string) get_post_meta($post->ID, '_aled08_ovh_devis', true) . ' € TTC)', 'button button-primary', 'Acheter ' . $c['domaine'] . ' chez OVH, au nom du client, avec votre moyen de paiement OVH ?');
        if ($s === 'payee' && $c['domaine'] && !$c['domaine_mien'] && $c['domaine_statut'] === 'a_reserver' && aled08e_registrar() !== 'ovh') {
            echo aled08e_cmd_bouton($post->ID, 'domaine_reserve', 'Domaine réservé', 'button button-primary');
            echo '<p class="description">À cliquer quand le nom de domaine est commandé chez votre registrar. L’automate continue (hébergement, DNS, SSL).</p>';
        }
        if ($s === 'domaine_attribue' && aled08e_hebergeur() === 'manuel') {
            echo aled08e_cmd_bouton($post->ID, 'hebergement_ok', 'Domaine ajouté sur l’hébergement', 'button button-primary');
            echo '<p class="description">À cliquer quand le domaine est ajouté dans cPanel (dossier public_html/' . esc_html($c['domaine']) . '). L’automate attend ensuite le certificat HTTPS.</p>';
        }
        echo aled08e_cmd_bouton($post->ID, 'avancer', $inter ? 'Réessayer maintenant' : 'Avancer maintenant');
        echo aled08e_cmd_bouton($post->ID, 'passer', 'Passer l’étape (faite à la main)', 'button', 'Passer à l’étape suivante sans vérification ? À faire seulement si vous avez fait cette étape vous-même.');
        if ($s !== 'payee' || !$c['domaine'] || $c['domaine_mien']) echo aled08e_cmd_bouton($post->ID, 'pret', 'Tout est prêt (forcer)', 'button', 'Marquer l’hébergement comme prêt ? Le client reçoit « Tout est prêt, je crée votre site ».');
    }
    if ($s === 'payee' && !$auto) echo aled08e_cmd_bouton($post->ID, 'en_creation', 'Création en cours');
    if (in_array($s, aled08e_cmd_statuts_en_cours(), true)) {
        echo aled08e_cmd_bouton($post->ID, 'en_ligne', 'Site en ligne', 'button button-primary', 'Le client reçoit l’e-mail « Votre site est en ligne »' . ($soldeDu ? ', avec le solde de ' . aled08e_euro_txt($c['montants']['solde']) . ' à régler' : '') . '. Continuer ?');
    }
    if ($soldeDu && in_array($s, aled08e_cmd_statuts_payes(), true)) {
        echo aled08e_cmd_bouton($post->ID, 'solde_paye', 'Reste payé (hors Stripe)', 'button', 'Le solde de ' . aled08e_euro_txt($c['montants']['solde']) . ' a été payé autrement ?');
        if ($stripe) echo aled08e_cmd_bouton($post->ID, 'lien_solde', 'Copier un lien de paiement du reste (en une fois, avec l’abonnement)');
    }
    if ($c['user']) echo aled08e_cmd_bouton($post->ID, 'renvoyer_acces', 'Renvoyer l’e-mail d’accès à l’espace');
    if (aled08e_cpanel_ok() && $c['domaine'] && in_array($s, aled08e_cmd_statuts_en_cours(), true) && aled08e_hebergeur() !== 'cpanel') {
        $mdp = in_array('mail', $c['options'], true) ? '<p><label>Mot de passe de la boîte contact@' . esc_html($c['domaine']) . ' (à transmettre au client)<br><input type="password" name="mdp_mail" class="regular-text" autocomplete="new-password" style="width:100%"></label></p>' : '';
        echo aled08e_cmd_bouton($post->ID, 'cpanel', 'Brancher sur l’hébergement', 'button', 'Créer le domaine additionnel' . ($mdp ? ' et la boîte e-mail' : '') . ' sur le cPanel ? À tester d’abord sur un domaine de test.', $mdp);
    }
    if ($s !== 'annulee' && $s !== 'en_ligne') echo aled08e_cmd_bouton($post->ID, 'annuler', 'Annuler la commande', 'button button-link-delete', 'Annuler cette commande ? Le client n’est pas prévenu automatiquement : écrivez-lui. Si un abonnement Stripe existe, arrêtez-le aussi dans Stripe.');
    if ($s === 'annulee') echo aled08e_cmd_bouton($post->ID, 'payee', 'Rétablir en « Payée »');
    echo '</div>';
}
function aled08e_cmd_box_detail($post) {
    $c = aled08e_cmd_get($post->ID);
    if (!$c) return;
    $D = aled08e_data();
    $m = $c['montants'];
    $t = aled08e_type($c['type']);
    $f = aled08e_forfait($c['forfait']);
    $per = $c['periode'] === 'annee' ? 'par an' : 'par mois';
    $u = $c['user'] ? get_userdata($c['user']) : null;
    $opts = [];
    foreach ($c['options'] as $oid) { $o = aled08e_option($oid); $opts[] = $o ? $o['name'] : $oid; }
    if (!empty($c['pages_plus'])) $opts[] = aled08e_cmd_pages_plus_txt($c['pages_plus']);
    $row = function ($k, $v) { echo '<dt>' . esc_html($k) . '</dt><dd>' . $v . '</dd>'; };
    echo '<div class="aled08-detail"><dl>';
    $row('Référence', '<strong>' . esc_html($c['ref']) . '</strong>, reçue le ' . esc_html(aled08e_date($c['date'])));
    $row('Client', esc_html(aled08e_cmd_nom($c)) . ($u ? ' · <a href="' . esc_url(get_edit_user_link($u->ID)) . '#aled08e">fiche client</a> (' . esc_html($u->user_login) . ')' : ' · <em>compte introuvable</em>'));
    $row('Coordonnées', '<a href="mailto:' . esc_attr($c['email']) . '">' . esc_html($c['email']) . '</a> · ' . esc_html($c['telephone']) . '<br>' . esc_html($c['adresse'] . ', ' . $c['code_postal'] . ' ' . $c['ville']));
    $row('Site', esc_html($t ? $t['label'] : $c['type']) . ', création ' . aled08e_euro($m['creation']) . ($t ? ' (délai habituel : ' . esc_html($t['delai']) . ')' : ''));
    $row('Nom de domaine', $c['domaine'] ? '<strong>' . esc_html($c['domaine']) . '</strong> : ' . esc_html(aled08e_cmd_domaine_statuts()[$c['domaine_statut']] ?? $c['domaine_statut']) . ($c['domaine_mien'] ? ' (le client l’a déjà, il faudra pointer ses DNS)' : '') : '<em>à choisir avec le client</em>');
    if (aled08e_est_seule($c['forfait'])) $row('Formule', '<strong>Création seule</strong> : pas d’abonnement. Le client garde son nom de domaine et son hébergement : remettez-lui le code du site (fichiers et sauvegarde).');
    else $row('Abonnement', esc_html((aled08e_forfait($c['forfait'])['name'] ?? '') . ', ') . aled08e_euro($m['mensuel_forfait']) . ' ' . esc_html($per) . ($c['periode'] === 'annee' ? ' (' . (int) $D['moisOfferts'] . ' mois offerts)' : ''));
    $row('Options', $opts ? esc_html(implode(', ', $opts)) . ($m['mensuel_options'] > 0 ? ', ' . aled08e_euro($m['mensuel_options']) . ' ' . esc_html($per) : '') . ($m['options_ponctuel'] > 0 ? ', ' . aled08e_euro($m['options_ponctuel']) . ' une fois' : '') : 'aucune');
    if ((float) $m['solde'] <= 0) $row('Création', aled08e_euro($m['acompte']) . ' payés en entier à la commande (en une fois, ou en 3 ou 4 fois avec Alma ou Klarna)' . (aled08e_est_seule($c['forfait']) ? '' : ' ; forfait ' . ($c['reception_payee'] ? '<strong>démarré</strong>' : 'à démarrer à la mise en ligne')));
    else $row('Création', 'acompte ' . aled08e_euro($m['acompte']) . ' à la commande, puis à la réception : '
        . ($c['reception_payee']
            ? ($c['lissage'] ? 'reste en ' . (int) $m['lissage_total_echeances'] . ' fois, ' . aled08e_euro($m['lissage_mensualite']) . ' par mois. <strong>' . (int) $c['lissage_paye'] . ' / ' . (int) $m['lissage_total_echeances'] . ' payées</strong>' . (get_post_meta($c['id'], '_aled08_lissage_fini', true) ? ' (terminé)' : '') : 'reste payé en une fois, ' . aled08e_euro($m['solde']) . ' <strong>(payé)</strong>')
            : 'reste ' . aled08e_euro($m['solde']) . ($c['solde_paye'] ? ' <strong>(payé à la main)</strong>' : ' <strong>(à régler, ' . ($c['lissage'] ? 'le client pensait payer en ' . (int) $c['lissage'] . ' fois' : 'en une fois prévu') . ')</strong>')));
    $row('Montant du jour de la commande', '<strong>' . aled08e_euro($m['total_jour']) . '</strong>');
    if ($c['parrain']) { $p = aled08e_user_by_code($c['parrain']); $row('Parrainage', esc_html($c['parrain']) . ' (' . ($p ? '<a href="' . esc_url(get_edit_user_link($p->ID)) . '">' . esc_html($p->display_name) . '</a>' : 'code inconnu') . ')'); }
    if ($c['message']) $row('Message du client', '<div class="aled08-pre">' . esc_html($c['message']) . '</div>');
    $abo = $u ? aled08e_meta($u->ID, 'abonnement') : '';
    $row('Stripe', $c['stripe_subscription']
        ? 'abonnement ' . esc_html($c['stripe_subscription']) . ($abo ? ' (' . esc_html($abo) . ')' : '') . ', client ' . esc_html($c['stripe_customer']) . ($c['stripe_lissage_item'] ? ', ligne de lissage ' . esc_html($c['stripe_lissage_item']) : '')
        : ($c['paiement_en_cours'] ? 'prélèvement en cours de confirmation' : 'pas de paiement Stripe pour cette commande'));
    echo '</dl></div>';
    $note = (string) get_post_meta($c['id'], '_aled08_note', true);
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="margin-top:14px"><input type="hidden" name="action" value="aled08e_cmd"><input type="hidden" name="cid" value="' . (int) $c['id'] . '"><input type="hidden" name="faire" value="note">' . wp_nonce_field('aled08e_cmd_' . $c['id'], '_aled08e_cmd', true, false)
        . '<label for="aled08e-note"><strong>Note pour vous</strong> (le client ne la voit pas)</label><textarea id="aled08e-note" name="note" rows="3" class="large-text">' . esc_textarea($note) . '</textarea><p><button class="button" type="submit">Enregistrer la note</button></p></form>';
}
function aled08e_cmd_box_journal($post) {
    $c = aled08e_cmd_get($post->ID);
    if (!$c) return;
    if (!$c['journal']) { echo '<p>Rien pour le moment.</p>'; return; }
    echo '<ul class="aled08-journal">';
    foreach (array_reverse($c['journal']) as $e) echo '<li><small>' . esc_html(wp_date('d/m/Y H:i', strtotime(get_gmt_from_date($e['date']) . ' UTC'))) . '</small> ' . esc_html($e['texte']) . '</li>';
    echo '</ul>';
}

/* Les boutons de la fiche */
add_action('admin_post_aled08e_cmd', function () {
    if (!current_user_can('manage_options')) wp_die('Accès refusé.');
    $cid = (int) ($_POST['cid'] ?? 0);
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_cmd'] ?? '')), 'aled08e_cmd_' . $cid)) wp_die('Lien expiré : revenez en arrière et réessayez.');
    $c = aled08e_cmd_get($cid);
    if (!$c) wp_die('Commande inconnue.');
    $faire = sanitize_key(wp_unslash($_POST['faire'] ?? ''));
    $msg = $faire;
    // payé hors Stripe : le compte est marqué « abonnement actif hors Stripe », sinon la tâche quotidienne pourrait le supprimer un jour
    $manuel = function () use ($c) {
        if ($c['user'] && !$c['stripe_subscription'] && aled08e_meta($c['user'], 'abonnement_manuel') !== '1') {
            update_user_meta($c['user'], 'aled08_abonnement_manuel', '1');
            aled08e_cmd_journal($c['id'], 'Compte marqué « abonnement actif hors Stripe » (paiement noté à la main).');
        }
    };
    switch ($faire) {
        case 'payee': aled08e_cmd_set_statut($cid, 'payee', 'marquée à la main'); $manuel(); break;
        case 'domaine_reserve':
            aled08e_cmd_set_domaine($cid, 'reserve');
            if (in_array($c['statut'], ['payee', 'domaine_commande'], true)) { aled08e_prov_set($cid, 'domaine_attribue', 'réservé à la main'); aled08e_prov_avancer($cid, true); }
            break;
        case 'hebergement_ok':
            if ($c['statut'] === 'domaine_attribue') { aled08e_prov_set($cid, 'hebergement', 'domaine ajouté à la main'); aled08e_prov_avancer($cid, true); }
            break;
        case 'avancer':
            delete_post_meta($cid, '_aled08_intervention'); delete_post_meta($cid, '_aled08_intervention_msg'); delete_post_meta($cid, '_aled08_etape_tentatives');
            $r = aled08e_prov_avancer($cid, true);
            set_transient('aled08e_msg_' . get_current_user_id(), 'Résultat : ' . $r . '. ' . (($c2 = aled08e_cmd_get($cid)) ? 'Statut : ' . aled08e_cmd_statuts()[$c2['statut']][0] : ''), 300);
            break;
        case 'passer':
            $ordre = aled08e_prov_etapes_auto(); $ordre[] = 'pret';
            $i = array_search($c['statut'], $ordre, true);
            if ($i !== false && isset($ordre[$i + 1])) { if ($c['statut'] === 'payee' || $c['statut'] === 'domaine_commande') aled08e_cmd_set_domaine($cid, 'reserve'); aled08e_prov_set($cid, $ordre[$i + 1], 'étape passée à la main'); aled08e_prov_avancer($cid, true); }
            break;
        case 'pret':
            if (in_array($c['statut'], aled08e_prov_etapes_auto(), true)) { aled08e_prov_set($cid, 'pret', 'forcé depuis l’administration'); aled08e_prov_mail_client_pret($c); }
            break;
        case 'ovh_confirmer':
            update_post_meta($cid, '_aled08_ovh_valide', 1);
            $r = aled08e_prov_avancer($cid, true);
            set_transient('aled08e_msg_' . get_current_user_id(), 'Achat lancé : ' . $r . '.', 300);
            break;
        case 'en_creation': aled08e_cmd_set_statut($cid, 'en_creation'); break;
        case 'en_ligne': aled08e_cmd_set_statut($cid, 'en_ligne'); break;
        case 'solde_paye': update_post_meta($cid, '_aled08_solde_paye', 1); aled08e_cmd_journal($cid, 'Solde marqué payé à la main (' . aled08e_euro_txt($c['montants']['solde']) . ').'); $manuel(); break;
        case 'annuler': aled08e_cmd_set_statut($cid, 'annulee', 'depuis l’administration'); break;
        case 'renvoyer_acces':
            if ($c['user'] && aled08e_compte_envoyer_acces($c['user'], $c['ref'])) aled08e_cmd_journal($cid, 'E-mail d’accès à l’espace renvoyé.');
            else $msg = 'erreur';
            break;
        case 'lien_solde':
            $url = aled08e_stripe_solde_session($cid, DAY_IN_SECONDS);
            if (is_wp_error($url)) { set_transient('aled08e_msg_' . get_current_user_id(), 'Lien impossible : ' . $url->get_error_message(), 300); $msg = 'erreur'; }
            else set_transient('aled08e_lien_' . get_current_user_id(), $url, 300);
            break;
        case 'cpanel':
            $res = aled08e_cpanel_brancher($cid, (string) wp_unslash($_POST['mdp_mail'] ?? ''));
            $msg = 'cpanel';
            set_transient('aled08e_msg_' . get_current_user_id(), is_wp_error($res) ? 'cPanel : ' . $res->get_error_message() : $res, 300);
            if (is_wp_error($res)) $msg = 'erreur';
            break;
        case 'note':
            update_post_meta($cid, '_aled08_note', sanitize_textarea_field(wp_unslash($_POST['note'] ?? '')));
            break;
        default: $msg = 'erreur';
    }
    wp_safe_redirect(add_query_arg('aled08e_msg', $msg, aled08e_cmd_admin_url($cid)));
    exit;
});
add_action('admin_notices', function () {
    if (!isset($_GET['aled08e_msg']) || !current_user_can('manage_options')) return;
    $m = sanitize_key(wp_unslash($_GET['aled08e_msg']));
    $lib = [
        'payee' => 'Commande marquée payée. Le client a reçu un e-mail. S’il paie hors Stripe, son compte est noté « abonnement actif hors Stripe » (fiche client).', 'domaine_reserve' => 'Nom de domaine noté comme réservé : l’automate continue.', 'en_creation' => 'Création en cours.',
        'hebergement_ok' => 'Domaine noté comme ajouté sur l’hébergement : l’automate attend le certificat HTTPS.', 'avancer' => 'Automate relancé.', 'passer' => 'Étape passée.', 'pret' => 'Hébergement marqué prêt : le client a reçu l’e-mail.', 'ovh_confirmer' => 'Achat OVH confirmé.', 'test_ovh' => 'Test OVH :', 'test_cpanel' => 'Test cPanel :',
        'en_ligne' => 'Site en ligne : le client a reçu l’e-mail.', 'solde_paye' => 'Solde noté comme payé.', 'annuler' => 'Commande annulée.', 'renvoyer_acces' => 'E-mail d’accès renvoyé au client.',
        'lien_solde' => 'Lien de paiement créé (valable 24 heures). Copiez-le et envoyez-le au client :', 'cpanel' => 'Réponse du cPanel (à tester une fois sur un domaine de test) :', 'note' => 'Note enregistrée.',
        'reglages' => 'Réglages enregistrés.', 'bande' => 'La bande :', 'test_lia' => 'Test de la clé Claude :', 'lia_ok' => 'Demande notée comme vérifiée.', 'lia_annule' => 'Changements de Bricou annulés :', 'lia_relance' => 'Cerise est relancée sur cette demande.', 'test' => 'Test de connexion Stripe :', 'erreur' => 'L’action n’a pas abouti.',
    ];
    if (!isset($lib[$m])) return;
    $detail = get_transient('aled08e_msg_' . get_current_user_id());
    $lien = get_transient('aled08e_lien_' . get_current_user_id());
    delete_transient('aled08e_msg_' . get_current_user_id());
    delete_transient('aled08e_lien_' . get_current_user_id());
    $ok = $m !== 'erreur' && !(in_array($m, ['test', 'test_ovh', 'test_cpanel', 'test_lia'], true) && is_string($detail) && strpos($detail, 'OK') !== 0);
    echo '<div class="notice ' . ($ok ? 'notice-success' : 'notice-error') . ' is-dismissible"><p>' . esc_html($lib[$m]) . ($detail ? ' <strong>' . esc_html($detail) . '</strong>' : '') . '</p>';
    if ($lien) echo '<p><input type="text" class="aled08-copy" readonly value="' . esc_attr($lien) . '" onclick="this.select()"></p>';
    echo '</div>';
});

/* =========================================================================
 *  cPanel (optionnel, constantes dans wp-config.php) : domaine additionnel et boîte e-mail
 * ========================================================================= */
/* Les accès viennent de wp-config.php ou, à défaut, des réglages (enregistrés sans chargement automatique, jamais affichés) */
foreach (['HOST' => 'host', 'USER' => 'user', 'TOKEN' => 'token', 'PASS' => 'pass', 'MAIN_DOMAIN' => 'main_domain'] as $aled08e_c => $aled08e_o) {
    if (!defined('ALED08_CPANEL_' . $aled08e_c)) define('ALED08_CPANEL_' . $aled08e_c, (string) get_option('aled08_cpanel_' . $aled08e_o, ''));
}
unset($aled08e_c, $aled08e_o);
function aled08e_cpanel_ok() {
    return ALED08_CPANEL_HOST && ALED08_CPANEL_USER && ALED08_CPANEL_MAIN_DOMAIN && (ALED08_CPANEL_TOKEN || ALED08_CPANEL_PASS);
}
function aled08e_cpanel_brancher($cid, $mdp = '') {
    if (!aled08e_cpanel_ok()) return new WP_Error('aled08_cpanel', 'cPanel non configuré.');
    $c = aled08e_cmd_get($cid);
    if (!$c || !$c['domaine']) return new WP_Error('aled08_cpanel', 'Pas de nom de domaine sur cette commande.');
    $r = aled08e_hb_cpanel_attacher($c['domaine']);
    if (is_wp_error($r)) return $r;
    $out = $r;
    if (in_array('mail', $c['options'], true) && $mdp !== '') {
        $r2 = aled08e_hb_cpanel_email($c['domaine'], 'contact', $mdp);
        $out .= ' | Boîte contact@ : ' . (is_wp_error($r2) ? $r2->get_error_message() : (!empty($r2['deja']) ? 'déjà existante' : 'créée'));
    } elseif (in_array('mail', $c['options'], true)) {
        $out .= ' | Boîte e-mail non créée : aucun mot de passe saisi.';
    }
    aled08e_hb_cpanel_autossl();
    aled08e_cmd_journal($cid, 'Branchement cPanel : ' . mb_substr($out, 0, 300));
    return $out;
}

/* =========================================================================
 *  Réglages
 * ========================================================================= */
function aled08e_admin_reglages() {
    if (!current_user_can('manage_options')) return;
    $constSecret = defined('ALED08_STRIPE_SECRET') && ALED08_STRIPE_SECRET;
    $constWh = defined('ALED08_STRIPE_WEBHOOK_SECRET') && ALED08_STRIPE_WEBHOOK_SECRET;
    $wh = home_url('/wp-json/aled08/v1/stripe');
    echo '<div class="wrap"><h1>Les Minis Monstres : réglages</h1>';
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="aled08e_reglages">' . wp_nonce_field('aled08e_reglages', '_aled08e_reglages', true, false);

    echo '<h2>Paiement en ligne (Stripe)</h2>';
    echo '<p>Tant qu’aucune clé n’est enregistrée, les commandes sont prises « en attente de paiement » et vous envoyez le lien de paiement vous-même. Le pas à pas complet est dans le guide <code>docs/gestion-du-site.md</code>.</p>';
    echo '<table class="form-table" role="presentation">';
    echo '<tr><th><label for="aled08e-sk">Clé secrète</label></th><td>';
    if ($constSecret) echo '<p>Définie dans wp-config.php (constante ALED08_STRIPE_SECRET) : ' . esc_html(aled08e_stripe_masque(ALED08_STRIPE_SECRET)) . '.</p>';
    else echo '<input type="password" id="aled08e-sk" name="stripe_secret" class="regular-text" autocomplete="off" placeholder="sk_live_… ou sk_test_…"><p class="description">' . esc_html(aled08e_stripe_masque(get_option('aled08_stripe_secret', ''))) . '. Laissez vide pour ne rien changer. Dans Stripe : Développeurs, Clés API, « Clé secrète ».</p>';
    echo '</td></tr>';
    echo '<tr><th><label for="aled08e-wh">Secret du webhook</label></th><td>';
    if ($constWh) echo '<p>Défini dans wp-config.php (constante ALED08_STRIPE_WEBHOOK_SECRET) : ' . esc_html(aled08e_stripe_masque(ALED08_STRIPE_WEBHOOK_SECRET)) . '.</p>';
    else echo '<input type="password" id="aled08e-wh" name="stripe_webhook_secret" class="regular-text" autocomplete="off" placeholder="whsec_…"><p class="description">' . esc_html(aled08e_stripe_masque(get_option('aled08_stripe_webhook_secret', ''))) . '. Laissez vide pour ne rien changer.</p>';
    echo '<p class="description">Adresse du webhook à créer dans Stripe (Développeurs, Webhooks, format Snapshot, version d’API ' . esc_html(ALED08E_STRIPE_API) . ') :<br><code>' . esc_html($wh) . '</code><br>Événements : checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted.</p>';
    echo '</td></tr>';
    if (!$constSecret || !$constWh) echo '<tr><th>Effacer</th><td><label><input type="checkbox" name="effacer_stripe" value="1"> Effacer les clés enregistrées (retour au mode « paiement en attente »)</label></td></tr>';
    echo '<tr><th><label for="aled08e-footer">Pied de page des factures (mention TVA)</label></th><td><input type="text" id="aled08e-footer" name="stripe_footer" class="large-text" value="' . esc_attr(get_option('aled08_stripe_footer', '')) . '" placeholder="' . esc_attr(ALED08E_STRIPE_FOOTER_DEFAUT) . '"><p class="description">Ajouté sur chaque facture Stripe. Vide : « ' . esc_html(ALED08E_STRIPE_FOOTER_DEFAUT) . ' ». Ajoutez le SIRET quand vous l’avez. Réglez aussi le pied de page par défaut dans Stripe (Paramètres, Facturation, Modèle de facture) pour la toute première facture.</p></td></tr>';
    $moy = get_option('aled08e_stripe_moyens');
    echo '<tr><th>Moyens de paiement</th><td><button type="submit" name="stripe_moyens" value="1" class="button">Allumer tous les moyens de paiement</button>'
        . '<p class="description">Carte, Apple Pay, Google Pay, PayPal, Klarna, Alma, prélèvement SEPA… La page de paiement montre ensuite ceux qui conviennent à chaque client. Certains demandent d’accepter leurs conditions dans Stripe (Réglages › Moyens de paiement).</p>'
        . (is_array($moy) ? '<p class="description"><strong>Dernier passage, ' . esc_html(wp_date('j F Y à H:i', (int) $moy['le'])) . ' :</strong> ' . esc_html(!empty($moy['erreur']) ? $moy['erreur'] : aled08e_stripe_moyens_txt($moy['moyens'] ?? [])) . '</p>' : '') . '</td></tr>';
    echo '<tr><th>Test de connexion</th><td><button type="submit" name="tester" value="1" class="button">Tester la connexion (GET /v1/balance)</button><p class="description">Affiche OK, ou l’erreur renvoyée par Stripe. Enregistrez d’abord la clé.</p></td></tr>';
    echo '</table>';

    echo '<h2>E-mails</h2><table class="form-table" role="presentation">';
    echo '<tr><th><label for="aled08e-codes">Codes promo</label></th><td><textarea id="aled08e-codes" name="codes_evenement" rows="3" class="large-text code">' . esc_textarea(implode("\n", aled08e_codes_evenement())) . '</textarea><p class="description">Un code par ligne, à donner à qui vous voulez (une opération, un partenaire) : chaque code donne ' . (int) ((aled08e_data()['evenement']['remise'] ?? 20)) . ' % de remise sur la création du site. Le client le tape dans la case « Code promo ou parrainage ». Laissez vide : aucun code promo. Les codes de parrainage des clients marchent tout seuls dans la même case.</p></td></tr>';
    echo '<tr><th><label for="aled08e-to">Adresse de réception</label></th><td><input type="email" id="aled08e-to" name="form_to" class="regular-text" value="' . esc_attr(get_option('aled08_form_to', '')) . '" placeholder="' . esc_attr(defined('ALED08_FORM_TO') ? ALED08_FORM_TO : get_option('admin_email')) . '"><p class="description">Reçoit les commandes, les demandes de modification, les messages du formulaire de contact et les alertes Stripe. Vide : l’adresse du thème, sinon celle de WordPress.</p></td></tr>';
    echo '</table>';

    echo '<h2>Mise en ligne automatique</h2>';
    echo '<p>Après le paiement, l’automate achète le nom de domaine au nom du client (OVH), le rattache à l’hébergement, attend le certificat HTTPS et crée la boîte e-mail pro si elle est commandée. Hébergeur en service : <strong>' . esc_html(aled08e_hebergeur_libelle()) . '</strong>. Achat des domaines : <strong>' . esc_html(aled08e_registrar() === 'ovh' ? 'OVH (automatique)' : 'à la main') . '</strong>.</p>';
    echo '<table class="form-table" role="presentation">';
    foreach (['ak' => 'Application key', 'as' => 'Application secret', 'ck' => 'Consumer key'] as $k => $lab) {
        $const = 'ALED08_OVH_' . strtoupper($k);
        echo '<tr><th><label for="aled08e-ovh-' . $k . '">OVH : ' . esc_html($lab) . '</label></th><td>';
        if (defined($const) && constant($const)) echo '<p>Définie dans wp-config.php : ' . esc_html(aled08e_ovh_masque(constant($const))) . '.</p>';
        else echo '<input type="password" id="aled08e-ovh-' . $k . '" name="ovh_' . $k . '" class="regular-text" autocomplete="off"><p class="description">' . esc_html(aled08e_ovh_masque(get_option('aled08_ovh_' . $k, ''))) . '. Laissez vide pour ne rien changer. Clés à créer sur https://eu.api.ovh.com/createToken/ (droits listés dans le guide).</p>';
        echo '</td></tr>';
    }
    echo '<tr><th><label for="aled08e-ovh-hosting">OVH : nom de l’hébergement web</label></th><td>';
    if (defined('ALED08_OVH_HOSTING') && ALED08_OVH_HOSTING) echo '<p>Défini dans wp-config.php : <code>' . esc_html(ALED08_OVH_HOSTING) . '</code>.</p>';
    else echo '<input type="text" id="aled08e-ovh-hosting" name="ovh_hosting" class="regular-text" value="' . esc_attr(get_option('aled08_ovh_hosting', '')) . '" placeholder="xxxxx.cluster0yy.hosting.ovh.net"><p class="description">Le « nom du service » de votre hébergement, visible dans l’espace client OVH (Web Cloud, Hébergements). Vide : les domaines ne sont pas rattachés automatiquement.</p>';
    echo '</td></tr>';
    echo '<tr><th>Hébergeur</th><td><select name="hebergeur">';
    foreach (['auto' => 'Automatique (OVH si configuré, sinon cPanel, sinon manuel)', 'ovh' => 'OVH', 'cpanel' => 'o2switch cPanel (jeton)', 'manuel' => 'Manuel (vous ajoutez le domaine à la main)'] as $k => $lab) echo '<option value="' . esc_attr($k) . '"' . selected(get_option('aled08_hebergeur', 'auto'), $k, false) . '>' . esc_html($lab) . '</option>';
    echo '</select></td></tr>';
    echo '<tr><th>Sécurité</th><td><label><input type="checkbox" name="ovh_essai" value="1"' . checked(aled08e_ovh_essai(), true, false) . '> Essai à blanc OVH : chaque achat de domaine attend votre validation (un e-mail, un clic). Conseillé pour les premières commandes.</label><br>'
        . '<label><input type="checkbox" name="ovh_wp" value="1"' . checked(aled08e_ovh_wp_auto(), true, false) . '> Installer WordPress automatiquement sur l’hébergement OVH (expérimental : base de données et module OVH ; les identifiants vont dans la note interne de la commande).</label></td></tr>';
    if (!defined('ALED08_OVH_AK')) echo '<tr><th>Effacer</th><td><label><input type="checkbox" name="effacer_ovh" value="1"> Effacer les clés OVH enregistrées</label></td></tr>';
    echo '<tr><th>Tests</th><td><button type="submit" name="tester_ovh" value="1" class="button">Tester OVH (compte et hébergement)</button> ';
    if (aled08e_cpanel_ok()) echo '<button type="submit" name="tester_cpanel" value="1" class="button">Tester cPanel</button>';
    echo '<p class="description">Enregistrez d’abord les clés, puis testez.</p></td></tr>';
    echo '</table>';
    echo '<h3>cPanel o2switch</h3>';
    echo '<p><label><input type="checkbox" name="pose_auto" value="1"' . checked(function_exists('aled08e_pose_auto') && aled08e_pose_auto(), true, false) . '> Poser le site tout seul sur o2switch : WordPress, l’extension du type commandé, le lien avec l’espace client</label></p>';
    echo '<p>' . (aled08e_cpanel_ok() ? 'Relié : hôte <code>' . esc_html(ALED08_CPANEL_HOST) . '</code>, utilisateur <code>' . esc_html(ALED08_CPANEL_USER) . '</code>, domaine principal <code>' . esc_html(ALED08_CPANEL_MAIN_DOMAIN) . '</code>, accès par ' . (ALED08_CPANEL_TOKEN ? 'jeton' : 'mot de passe') . '.' : 'Pas encore relié : remplissez les quatre lignes ci-dessous, enregistrez, puis « Tester cPanel ».') . '</p>';
    echo '<table class="form-table" role="presentation">';
    foreach (['host' => ['Hôte cPanel', 'exemple.o2switch.net'], 'user' => ['Utilisateur cPanel', ''], 'main_domain' => ['Domaine principal du compte', 'les-minis-monstres.fr']] as $k => $d) {
        echo '<tr><th><label for="aled08e-cp-' . $k . '">' . esc_html($d[0]) . '</label></th><td><input type="text" id="aled08e-cp-' . $k . '" name="cpanel_' . $k . '" class="regular-text" value="' . esc_attr(get_option('aled08_cpanel_' . $k, '')) . '" placeholder="' . esc_attr($d[1]) . '" autocomplete="off"></td></tr>';
    }
    foreach (['token' => 'Jeton d’accès (cPanel › Gérer les jetons d’API)', 'pass' => 'Ou, si o2switch ne permet pas de créer un jeton : le mot de passe cPanel'] as $k => $lab) {
        echo '<tr><th><label for="aled08e-cp-' . $k . '">' . esc_html($lab) . '</label></th><td><input type="password" id="aled08e-cp-' . $k . '" name="cpanel_' . $k . '" class="regular-text" autocomplete="new-password"><p class="description">' . (get_option('aled08_cpanel_' . $k, '') !== '' ? 'Enregistré. ' : 'Rien d’enregistré. ') . 'Laissez vide pour ne rien changer.</p></td></tr>';
    }
    echo '<tr><th>Effacer</th><td><label><input type="checkbox" name="effacer_cpanel" value="1"> Effacer les accès cPanel enregistrés</label></td></tr></table>';

    aled08e_lia_reglages_html();
    aled08e_rs_reglages_html();
    echo '<p class="submit"><button type="submit" class="button button-primary">Enregistrer</button></p></form>';
    aled08e_jl_bilan_html();
    echo '</div>';
}
/* Options sans autoload : les clés ne sont chargées qu'à la demande */
function aled08e_option_set($k, $v) {
    if (get_option($k, null) === null) add_option($k, $v, '', false);
    else update_option($k, $v, false);
}
add_action('admin_post_aled08e_reglages', function () {
    if (!current_user_can('manage_options')) wp_die('Accès refusé.');
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_reglages'] ?? '')), 'aled08e_reglages')) wp_die('Lien expiré : revenez en arrière et réessayez.');
    $P = wp_unslash($_POST);
    if (!empty($P['effacer_stripe'])) { delete_option('aled08_stripe_secret'); delete_option('aled08_stripe_webhook_secret'); }
    $sk = trim((string) ($P['stripe_secret'] ?? ''));
    if ($sk !== '' && preg_match('/^(sk|rk)_(live|test)_[A-Za-z0-9]+$/', $sk)) aled08e_option_set('aled08_stripe_secret', $sk);
    $wh = trim((string) ($P['stripe_webhook_secret'] ?? ''));
    if ($wh !== '' && preg_match('/^whsec_[A-Za-z0-9]+$/', $wh)) aled08e_option_set('aled08_stripe_webhook_secret', $wh);
    aled08e_option_set('aled08_stripe_footer', sanitize_text_field((string) ($P['stripe_footer'] ?? '')));
    if (isset($P['codes_evenement'])) {
        $codes = array_values(array_unique(array_filter(array_map('aled08e_clean_code', preg_split('/[\s,;]+/', (string) $P['codes_evenement'])))));
        update_option('aled08_codes_evenement', implode("\n", $codes), false);
    }
    $to = sanitize_email((string) ($P['form_to'] ?? ''));
    if ($to === '' || is_email($to)) update_option('aled08_form_to', $to);
    if (!empty($P['effacer_ovh'])) { foreach (['ak', 'as', 'ck'] as $k) delete_option('aled08_ovh_' . $k); delete_transient('aled08_ovh_delta'); }
    foreach (['ak', 'as', 'ck'] as $k) {
        $v = trim((string) ($P['ovh_' . $k] ?? ''));
        if ($v !== '' && preg_match('/^[A-Za-z0-9_-]{8,128}$/', $v)) aled08e_option_set('aled08_ovh_' . $k, $v);
    }
    if (isset($P['ovh_hosting'])) aled08e_option_set('aled08_ovh_hosting', sanitize_text_field((string) $P['ovh_hosting']));
    $heb = sanitize_key((string) ($P['hebergeur'] ?? 'auto'));
    update_option('aled08_hebergeur', in_array($heb, ['auto', 'ovh', 'cpanel', 'manuel'], true) ? $heb : 'auto', false);
    update_option('aled08_ovh_essai', !empty($P['ovh_essai']) ? '1' : '0', false);
    update_option('aled08_ovh_wp', !empty($P['ovh_wp']) ? '1' : '0', false);
    update_option('aled08_pose_auto', !empty($P['pose_auto']) ? '1' : '0', false);
    if (!empty($P['effacer_cpanel'])) foreach (['host', 'user', 'token', 'pass', 'main_domain'] as $k) delete_option('aled08_cpanel_' . $k);
    foreach (['host', 'main_domain'] as $k) if (isset($P['cpanel_' . $k]) && empty($P['effacer_cpanel'])) {
        $v = strtolower(trim((string) $P['cpanel_' . $k]));
        if ($v === '' || preg_match('/^[a-z0-9.-]{3,190}$/', $v)) aled08e_option_set('aled08_cpanel_' . $k, $v);
    }
    if (isset($P['cpanel_user']) && empty($P['effacer_cpanel'])) { $v = trim((string) $P['cpanel_user']); if ($v === '' || preg_match('/^[A-Za-z0-9_]{2,32}$/', $v)) aled08e_option_set('aled08_cpanel_user', $v); }
    foreach (['token', 'pass'] as $k) { $v = (string) ($P['cpanel_' . $k] ?? ''); if (trim($v) !== '' && strlen($v) <= 200 && empty($P['effacer_cpanel'])) aled08e_option_set('aled08_cpanel_' . $k, $k === 'token' ? trim($v) : $v); }
    aled08e_rs_reglages_save($P);
    $msg = aled08e_lia_reglages_save($P) ?: 'reglages';
    if (!empty($P['tester_ovh'])) {
        $t = aled08e_ovh_test();
        set_transient('aled08e_msg_' . get_current_user_id(), is_wp_error($t) ? 'Erreur : ' . $t->get_error_message() : $t, 300);
        $msg = 'test_ovh';
    }
    if (!empty($P['tester_cpanel'])) {
        delete_transient('aled08_cpanel_local_essai'); // le test refait l'essai « de l'intérieur du serveur »
        $t = aled08e_hb_cpanel_test();
        set_transient('aled08e_msg_' . get_current_user_id(), is_wp_error($t) ? 'Erreur : ' . $t->get_error_message() : $t, 300);
        $msg = 'test_cpanel';
    }
    if (!empty($P['stripe_moyens'])) {
        $t = aled08e_stripe_moyens_activer();
        set_transient('aled08e_msg_' . get_current_user_id(), is_wp_error($t) ? 'Erreur : ' . $t->get_error_message() : 'OK. ' . aled08e_stripe_moyens_txt($t), 300);
        $msg = 'test';
    }
    if (!empty($P['tester'])) {
        $t = aled08e_stripe_test();
        set_transient('aled08e_msg_' . get_current_user_id(), is_wp_error($t) ? 'Erreur : ' . $t->get_error_message() : $t, 300);
        $msg = 'test';
    }
    wp_safe_redirect(add_query_arg('aled08e_msg', $msg, admin_url('admin.php?page=aled08-reglages')));
    exit;
});
