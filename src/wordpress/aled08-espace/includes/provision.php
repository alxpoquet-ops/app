<?php
/**
 * ALED08 Espace client : la mise en ligne automatique après paiement.
 *  États d'une commande (dans l'ordre) : attente_paiement → payee → domaine_commande → domaine_attribue → hebergement → ssl → pret → en_ligne
 *  Chaque étape est faite par la tâche « aled08_provision » (toutes les 5 minutes), ou par les boutons de l'admin.
 *  Hébergeur : OVH (API, en principal), cPanel (jeton, en secours) ou manuel (e-mail et boutons).
 *  Registrar : OVH (achat au nom du client), sinon manuel (e-mail de rappel et bouton « Domaine réservé »).
 *  Une étape qui échoue trois fois, ou qui dure trop, passe la commande en « intervention » : ALED08 reçoit l'erreur
 *  exacte, le client voit une phrase rassurante. Rien n'est acheté avant le statut « payee ».
 */
defined('ABSPATH') || exit;

/* Durées d'attente avant de prévenir ALED08 (secondes) */
function aled08e_prov_limites() {
    return ['payee' => 2 * HOUR_IN_SECONDS, 'domaine_commande' => DAY_IN_SECONDS, 'domaine_attribue' => 6 * HOUR_IN_SECONDS, 'hebergement' => 6 * HOUR_IN_SECONDS, 'ssl' => DAY_IN_SECONDS];
}
function aled08e_prov_etapes_auto() { return ['payee', 'domaine_commande', 'domaine_attribue', 'hebergement', 'ssl']; }

/* Hébergeur et registrar effectifs */
function aled08e_hebergeur() {
    $choix = (string) get_option('aled08_hebergeur', 'auto');
    if ($choix === 'ovh' && aled08e_ovh_hosting_ready()) return 'ovh';
    if ($choix === 'cpanel' && aled08e_cpanel_ok()) return 'cpanel';
    if ($choix === 'manuel') return 'manuel';
    if (aled08e_ovh_hosting_ready()) return 'ovh';
    if (aled08e_cpanel_ok()) return 'cpanel';
    return 'manuel';
}
function aled08e_registrar() { return aled08e_ovh_ready() ? 'ovh' : 'manuel'; }
function aled08e_hebergeur_libelle($h = null) {
    $h = $h ?: aled08e_hebergeur();
    return ['ovh' => 'OVH (automatique)', 'cpanel' => 'o2switch cPanel (jeton)', 'manuel' => 'manuel (vous ajoutez le domaine à la main)'][$h] ?? $h;
}

/* =========================================================================
 *  Tâche toutes les 5 minutes
 * ========================================================================= */
add_filter('cron_schedules', function ($s) {
    if (!isset($s['aled08_5min'])) $s['aled08_5min'] = ['interval' => 5 * MINUTE_IN_SECONDS, 'display' => 'Toutes les 5 minutes (ALED08)'];
    return $s;
});
function aled08e_prov_planifier() {
    if (!wp_next_scheduled('aled08_provision')) wp_schedule_event(time() + 60, 'aled08_5min', 'aled08_provision');
}
add_action('init', function () { if (!wp_doing_ajax() && !wp_next_scheduled('aled08_provision')) aled08e_prov_planifier(); }, 21);
add_action('aled08_provision', 'aled08e_prov_tour');
/* Une commande vient d'être payée : première étape tout de suite (puis la tâche prend le relais) */
add_action('aled08e_statut_change', function ($id, $statut, $old) {
    if ($statut === 'payee') {
        update_post_meta($id, '_aled08_etape_depuis', time());
        delete_post_meta($id, '_aled08_etape_tentatives');
        aled08e_prov_avancer($id);
    }
}, 10, 3);

/* Commandes en cours de mise en ligne */
function aled08e_prov_en_cours() {
    return aled08e_cmd_par_statut(aled08e_prov_etapes_auto());
}
function aled08e_prov_tour() {
    foreach (aled08e_prov_en_cours() as $c) {
        if (get_post_meta($c['id'], '_aled08_intervention', true)) continue;
        aled08e_prov_avancer($c['id']);
    }
}

/* =========================================================================
 *  Avancer d'une étape (verrou de 4 minutes par commande)
 * ========================================================================= */
function aled08e_prov_avancer($cid, $force = false) {
    $lock = 'aled08_prov_' . (int) $cid;
    if (!$force && get_transient($lock)) return 'occupe';
    set_transient($lock, 1, 4 * MINUTE_IN_SECONDS);
    $c = aled08e_cmd_get($cid);
    if (!$c || !in_array($c['statut'], aled08e_prov_etapes_auto(), true)) { delete_transient($lock); return 'rien'; }
    if (!$force && get_post_meta($cid, '_aled08_intervention', true)) { delete_transient($lock); return 'intervention'; }
    $res = null;
    try {
        switch ($c['statut']) {
            case 'payee': $res = aled08e_prov_etape_domaine($c); break;
            case 'domaine_commande': $res = aled08e_prov_etape_suivi_domaine($c); break;
            case 'domaine_attribue': $res = aled08e_prov_etape_hebergement($c); break;
            case 'hebergement': $res = aled08e_prov_etape_dns_email($c); break;
            case 'ssl': $res = aled08e_prov_etape_ssl($c); break;
        }
    } catch (Throwable $e) {
        $res = new WP_Error('aled08_prov', 'Erreur interne : ' . $e->getMessage());
    }
    if (is_wp_error($res)) {
        $n = (int) get_post_meta($cid, '_aled08_etape_tentatives', true) + 1;
        update_post_meta($cid, '_aled08_etape_tentatives', $n);
        aled08e_cmd_journal($cid, 'Automate (' . $c['statut'] . ') : ' . $res->get_error_message() . ' (essai ' . $n . ')');
        if ($n >= 3) aled08e_prov_intervention($c, $res->get_error_message());
        delete_transient($lock);
        return 'erreur';
    }
    // étape trop longue sans erreur ?
    $depuis = (int) get_post_meta($cid, '_aled08_etape_depuis', true);
    $lim = aled08e_prov_limites()[$c['statut']] ?? DAY_IN_SECONDS;
    $c2 = aled08e_cmd_get($cid);
    if ($c2 && $c2['statut'] === $c['statut'] && $depuis && time() - $depuis > $lim && !get_post_meta($cid, '_aled08_lenteur_prevenu', true)) {
        update_post_meta($cid, '_aled08_lenteur_prevenu', 1);
        aled08e_prov_mail_owner($c, 'Mise en ligne plus longue que prévu', 'La commande ' . $c['ref'] . ' est à l’étape « ' . aled08e_cmd_statuts()[$c['statut']][0] . ' » depuis plus de ' . round($lim / HOUR_IN_SECONDS) . ' heures, sans erreur. Jetez un œil : ' . aled08e_cmd_admin_url($cid) . "\n\nJournal : voir la fiche. Le client voit « ça prend un peu plus de temps que prévu ».");
    }
    delete_transient($lock);
    return is_string($res) ? $res : 'ok';
}
/* Passage à l'étape suivante : remise à zéro des compteurs */
function aled08e_prov_set($cid, $statut, $note = '') {
    update_post_meta($cid, '_aled08_etape_depuis', time());
    delete_post_meta($cid, '_aled08_etape_tentatives');
    delete_post_meta($cid, '_aled08_lenteur_prevenu');
    delete_post_meta($cid, '_aled08_intervention');
    delete_post_meta($cid, '_aled08_intervention_msg');
    return aled08e_cmd_set_statut($cid, $statut, $note);
}
function aled08e_prov_intervention($c, $msg) {
    update_post_meta($c['id'], '_aled08_intervention', 1);
    update_post_meta($c['id'], '_aled08_intervention_msg', mb_substr((string) $msg, 0, 500));
    aled08e_cmd_journal($c['id'], 'Intervention nécessaire : ' . $msg);
    aled08e_prov_mail_owner($c, 'Intervention nécessaire : ' . $c['ref'], 'L’automate s’est arrêté sur la commande ' . $c['ref'] . ' (' . aled08e_cmd_nom($c) . "), étape « " . aled08e_cmd_statuts()[$c['statut']][0] . " ».\n\nErreur : " . $msg . "\n\nDans la fiche, corrigez puis cliquez « Réessayer », ou « Passer l’étape » si vous l’avez faite à la main :\n" . aled08e_cmd_admin_url($c['id']) . "\n\nLe client voit seulement : « Je m’en occupe personnellement, vous serez prévenu par e-mail ».");
}
function aled08e_prov_mail_owner($c, $sujet, $corps) {
    wp_mail(aled08e_to(), $sujet, $corps, aled08e_mail_headers());
}
function aled08e_prov_mdp() { return wp_generate_password(16, false); }

/* =========================================================================
 *  Étape 1 : nom de domaine (payee → domaine_commande ou domaine_attribue)
 * ========================================================================= */
function aled08e_prov_etape_domaine($c) {
    $cid = $c['id'];
    if (!$c['domaine']) {
        // pas de nom choisi : ALED08 le choisit avec le client, l'automate attend le bouton « Domaine réservé »
        if (!get_post_meta($cid, '_aled08_prov_mail_domaine', true)) {
            update_post_meta($cid, '_aled08_prov_mail_domaine', 1);
            aled08e_prov_mail_owner($c, 'Commande ' . $c['ref'] . ' : nom de domaine à choisir', 'Le client n’a pas choisi de nom de domaine. Choisissez-le avec lui, renseignez-le dans la fiche, puis cliquez « Domaine réservé » quand il est acheté : ' . aled08e_cmd_admin_url($cid));
        }
        return 'attente';
    }
    if ($c['domaine_mien']) {
        // le client garde son domaine : réglages DNS envoyés, on passe directement à l'hébergement
        if (!get_post_meta($cid, '_aled08_prov_mail_dns', true)) {
            update_post_meta($cid, '_aled08_prov_mail_dns', 1);
            aled08e_prov_mail_client_dns($c);
        }
        aled08e_cmd_set_domaine($cid, 'client');
        return aled08e_prov_set($cid, 'domaine_attribue', 'domaine existant du client') ? 'ok' : 'erreur';
    }
    if (aled08e_registrar() !== 'ovh') {
        // registrar manuel : l'e-mail « commande payée » et le rappel quotidien demandent la réservation ; bouton « Domaine réservé »
        return 'attente';
    }
    if ($c['domaine_statut'] === 'reserve' || aled08e_ovh_domaine_existe($c['domaine'])) {
        aled08e_cmd_set_domaine($cid, 'reserve');
        return aled08e_prov_set($cid, 'domaine_attribue', 'déjà dans le compte OVH') ? 'ok' : 'erreur';
    }
    // hébergement o2switch (cPanel ou manuel) : le domaine acheté chez OVH pointe tout de suite vers o2switch
    $dns = aled08e_hebergeur() !== 'ovh' ? 'ns1.o2switch.net;ns2.o2switch.net' : '';
    $valide = (bool) get_post_meta($cid, '_aled08_ovh_valide', true);
    $r = aled08e_ovh_commander_domaine($c, $valide, $dns);
    if (is_wp_error($r)) return $r;
    if ($r['etape'] === 'devis') {
        if (!get_post_meta($cid, '_aled08_ovh_devis_mail', true)) {
            update_post_meta($cid, '_aled08_ovh_devis_mail', 1);
            update_post_meta($cid, '_aled08_ovh_devis', $r['prix']);
            aled08e_cmd_journal($cid, 'OVH, essai à blanc : ' . $c['domaine'] . ' à ' . ($r['prix'] !== null ? $r['prix'] . ' € TTC' : 'prix inconnu') . '. En attente de votre validation.');
            aled08e_prov_mail_owner($c, 'À valider : achat du domaine ' . $c['domaine'], 'Essai à blanc OVH réussi pour la commande ' . $c['ref'] . " :\n" . $c['domaine'] . ' pour 1 an, ' . ($r['prix'] !== null ? $r['prix'] . ' € TTC' : 'prix inconnu') . ", payé avec votre moyen de paiement OVH.\n\nPour acheter, ouvrez la fiche et cliquez « Confirmer l’achat OVH » :\n" . aled08e_cmd_admin_url($cid) . "\n\nPour ne plus valider à la main, décochez « Essai à blanc » dans les réglages.");
        }
        return 'devis';
    }
    update_post_meta($cid, '_aled08_ovh_order', $r['orderId']);
    update_post_meta($cid, '_aled08_ovh_prix', $r['prix']);
    aled08e_cmd_journal($cid, 'OVH : domaine ' . $c['domaine'] . ' commandé (n° ' . $r['orderId'] . ($r['prix'] !== null ? ', ' . $r['prix'] . ' € TTC' : '') . ').');
    return aled08e_prov_set($cid, 'domaine_commande') ? 'ok' : 'erreur';
}
/* Étape 2 : la commande OVH est-elle livrée ? */
function aled08e_prov_etape_suivi_domaine($c) {
    $cid = $c['id'];
    $orderId = (string) get_post_meta($cid, '_aled08_ovh_order', true);
    if ($orderId === '') {
        if (aled08e_ovh_domaine_existe($c['domaine'])) { aled08e_cmd_set_domaine($cid, 'reserve'); return aled08e_prov_set($cid, 'domaine_attribue') ? 'ok' : 'erreur'; }
        return new WP_Error('aled08_prov', 'Numéro de commande OVH absent.');
    }
    $st = aled08e_ovh_statut_commande($orderId);
    if (is_wp_error($st)) return $st;
    if ($st === 'delivered' || aled08e_ovh_domaine_existe($c['domaine'])) {
        aled08e_cmd_set_domaine($cid, 'reserve');
        aled08e_ovh_renouvellement_auto($c['domaine']);
        aled08e_prov_mail_client_domaine($c);
        return aled08e_prov_set($cid, 'domaine_attribue', 'OVH : livré') ? 'ok' : 'erreur';
    }
    if ($st === 'notPaid' && !get_post_meta($cid, '_aled08_ovh_paye_tente', true)) {
        update_post_meta($cid, '_aled08_ovh_paye_tente', 1);
        $p = aled08e_ovh_payer_commande($orderId);
        if (is_wp_error($p)) return new WP_Error('aled08_prov', 'Commande OVH non payée et paiement impossible : ' . $p->get_error_message());
        aled08e_cmd_journal($cid, 'OVH : paiement de la commande ' . $orderId . ' lancé avec le moyen enregistré.');
        return 'attente';
    }
    if (in_array($st, ['cancelled', 'cancelling', 'documentsRequested'], true)) return new WP_Error('aled08_prov', 'Commande OVH ' . $orderId . ' : ' . $st . '. Voir https://www.ovh.com/manager/');
    return 'attente';
}
/* Étape 3 : rattacher le domaine à l'hébergement (domaine_attribue → hebergement) */
function aled08e_prov_etape_hebergement($c) {
    $cid = $c['id'];
    $h = aled08e_hebergeur();
    if ($h === 'ovh') {
        if ($c['domaine_mien'] && !aled08e_prov_dns_vers($c['domaine'], aled08e_ovh_hb_ip())) return 'attente';
        $r = aled08e_ovh_hb_attacher($c['domaine']);
        if (is_wp_error($r)) return $r;
        if (!empty($r['id'])) update_post_meta($cid, '_aled08_ovh_tache', (int) $r['id']);
        aled08e_cmd_journal($cid, !empty($r['deja']) ? 'OVH : domaine déjà rattaché à l’hébergement.' : 'OVH : domaine rattaché à l’hébergement (tâche ' . (int) $r['id'] . ', www ' . (!empty($r['www']) ? 'aussi' : 'non') . ').');
        return aled08e_prov_set($cid, 'hebergement') ? 'ok' : 'erreur';
    }
    if ($h === 'cpanel') {
        if (!aled08e_prov_dns_ns_o2switch($c['domaine'])) return 'attente';
        $r = aled08e_hb_cpanel_attacher($c['domaine']);
        if (is_wp_error($r)) return $r;
        aled08e_cmd_journal($cid, 'cPanel : ' . $r);
        return aled08e_prov_set($cid, 'hebergement') ? 'ok' : 'erreur';
    }
    // manuel : un e-mail, puis le bouton « Domaine ajouté sur l'hébergement »
    if (!get_post_meta($cid, '_aled08_prov_mail_hb', true)) {
        update_post_meta($cid, '_aled08_prov_mail_hb', 1);
        aled08e_prov_mail_owner($c, 'À faire : ajouter ' . $c['domaine'] . ' sur l’hébergement', 'Le nom de domaine ' . $c['domaine'] . ' de la commande ' . $c['ref'] . " est prêt.\n\nAjoutez-le sur l’hébergement (cPanel › Domaines, dossier public_html/" . $c['domaine'] . ($c['domaine_mien'] ? "). Le client garde son domaine : ses DNS doivent pointer vers l’hébergement (il a reçu les réglages par e-mail).\n" : ").\n") . (in_array('mail', $c['options'], true) ? 'Créez aussi la boîte contact@' . $c['domaine'] . " (option e-mail pro).\n" : '') . "\nPuis cliquez « Domaine ajouté sur l’hébergement » dans la fiche :\n" . aled08e_cmd_admin_url($cid));
    }
    return 'attente';
}
/* Étape 4 : DNS en place, boîte e-mail (hebergement → ssl) */
function aled08e_prov_etape_dns_email($c) {
    $cid = $c['id'];
    $h = aled08e_hebergeur();
    if ($h === 'ovh') {
        $t = (int) get_post_meta($cid, '_aled08_ovh_tache', true);
        $st = aled08e_ovh_hb_tache($t);
        if (in_array($st, ['error', 'cancelled'], true)) return new WP_Error('aled08_prov', 'Tâche OVH de rattachement en erreur (' . $st . ').');
        if (!in_array($st, ['done', 'inconnue'], true)) return 'attente';
        $ip = aled08e_ovh_hb_ip();
        if ($ip && !aled08e_prov_dns_vers($c['domaine'], $ip)) return 'attente';
        aled08e_prov_email($c);
        aled08e_prov_wordpress($c);
        return aled08e_prov_set($cid, 'ssl', 'DNS en place') ? 'ok' : 'erreur';
    }
    if ($h === 'cpanel') {
        $ip = aled08e_hb_cpanel_ip();
        if ($ip && !aled08e_prov_dns_vers($c['domaine'], $ip)) return 'attente';
        aled08e_prov_email($c);
        aled08e_hb_cpanel_autossl();
        return aled08e_prov_set($cid, 'ssl', 'DNS en place') ? 'ok' : 'erreur';
    }
    // manuel : on attend que le domaine réponde en HTTPS (étape suivante), sans IP de référence
    return aled08e_prov_set($cid, 'ssl') ? 'ok' : 'erreur';
}
/* Étape 5 : le site répond en HTTPS (ssl → pret) */
function aled08e_prov_etape_ssl($c) {
    $cid = $c['id'];
    if (aled08e_prov_https_ok($c['domaine'])) {
        aled08e_prov_mail_client_pret($c);
        aled08e_prov_mail_owner($c, 'Tout est prêt : ' . $c['domaine'], 'Le domaine ' . $c['domaine'] . ' de la commande ' . $c['ref'] . " répond en HTTPS. L’hébergement est prêt : à vous de créer le site, puis cliquez « Site en ligne » dans la fiche :\n" . aled08e_cmd_admin_url($cid) . (get_post_meta($cid, '_aled08_wp_admin', true) ? "\n\nWordPress a été installé automatiquement : identifiants dans la fiche (note interne)." : ''));
        return aled08e_prov_set($cid, 'pret', 'HTTPS actif') ? 'ok' : 'erreur';
    }
    return 'attente';
}

/* ---------- vérifications réseau ---------- */
function aled08e_prov_dns_vers($dom, $ip) {
    if (!$ip) return true;
    $recs = @dns_get_record($dom, DNS_A);
    if (!is_array($recs)) return false;
    foreach ($recs as $r) if (($r['ip'] ?? '') === $ip) return true;
    return false;
}
function aled08e_prov_dns_ns_o2switch($dom) {
    $recs = @dns_get_record($dom, DNS_NS);
    if (!is_array($recs)) return false;
    foreach ($recs as $r) if (stripos((string) ($r['target'] ?? ''), 'o2switch') !== false) return true;
    return false;
}
function aled08e_prov_https_ok($dom) {
    $r = wp_remote_head('https://' . $dom . '/', ['timeout' => 15, 'sslverify' => true, 'redirection' => 3]);
    if (is_wp_error($r)) return false;
    $code = (int) wp_remote_retrieve_response_code($r);
    return $code > 0 && $code < 500;
}

/* ---------- adresse e-mail pro (option mail), non bloquante ---------- */
function aled08e_prov_email($c) {
    $cid = $c['id'];
    if (!in_array('mail', $c['options'], true) || get_post_meta($cid, '_aled08_email_fait', true)) return;
    $mdp = aled08e_prov_mdp();
    $h = aled08e_hebergeur();
    $r = $h === 'ovh' ? aled08e_ovh_email_creer($c['domaine'], 'contact', $mdp) : ($h === 'cpanel' ? aled08e_hb_cpanel_email($c['domaine'], 'contact', $mdp) : new WP_Error('aled08_prov', 'hébergeur manuel'));
    if (is_wp_error($r)) {
        aled08e_cmd_journal($cid, 'Boîte e-mail non créée automatiquement : ' . $r->get_error_message() . '. À créer à la main.');
        aled08e_prov_mail_owner($c, 'À faire : boîte contact@' . $c['domaine'], 'La boîte e-mail de la commande ' . $c['ref'] . " n’a pas pu être créée automatiquement : " . $r->get_error_message() . "\nCréez-la à la main et envoyez les identifiants au client.\n" . aled08e_cmd_admin_url($cid));
        return;
    }
    update_post_meta($cid, '_aled08_email_fait', 1);
    if (!empty($r['deja'])) { aled08e_cmd_journal($cid, 'Boîte contact@' . $c['domaine'] . ' déjà existante.'); return; }
    aled08e_cmd_journal($cid, 'Boîte contact@' . $c['domaine'] . ' créée (' . $h . '). Identifiants envoyés au client.');
    $web = $h === 'ovh' ? 'https://www.ovhcloud.com/fr/mail/ (webmail OVH)' : 'https://' . (defined('ALED08_CPANEL_HOST') ? ALED08_CPANEL_HOST : 'webmail') . ':2096';
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\nVotre adresse e-mail professionnelle est prête :\n"
        . 'Adresse : contact@' . $c['domaine'] . "\nMot de passe : " . $mdp . "\n\n"
        . "Pour la lire : " . $web . "\n"
        . ($h === 'ovh' ? "Sur votre téléphone ou Outlook : serveur entrant ssl0.ovh.net (IMAP, port 993), serveur sortant ssl0.ovh.net (SMTP, port 465), identifiant = l’adresse complète.\n" : "Sur votre téléphone ou Outlook : serveur entrant et sortant = celui de l’hébergement (IMAP 993, SMTP 465), identifiant = l’adresse complète.\n")
        . "\nChangez le mot de passe dès votre première connexion.\n\nÀ bientôt,\n" . aled08e_data()['name'] . "\n";
    wp_mail($c['email'], 'Votre adresse e-mail pro est prête', $corps, aled08e_mail_headers(aled08e_data()['name'] . ' <' . aled08e_to() . '>'));
}
/* ---------- WordPress automatique sur OVH (expérimental, réglage), non bloquant ---------- */
function aled08e_prov_wordpress($c) {
    $cid = $c['id'];
    if (!aled08e_ovh_wp_auto() || aled08e_hebergeur() !== 'ovh' || get_post_meta($cid, '_aled08_wp_tente', true)) return;
    update_post_meta($cid, '_aled08_wp_tente', 1);
    $mdpDb = aled08e_prov_mdp();
    $db = aled08e_ovh_hb_base_creer($c['domaine'], $mdpDb);
    if (is_wp_error($db)) { aled08e_cmd_journal($cid, 'WordPress automatique : base non créée (' . $db->get_error_message() . ').'); return; }
    $infos = aled08e_ovh_hb_infos();
    $server = is_wp_error($infos) ? '' : (string) ($infos['hostingIp'] ?? '');
    $adminMdp = aled08e_prov_mdp();
    $r = aled08e_ovh_hb_wordpress($c['domaine'], ['name' => $db['user'], 'user' => $db['user'], 'password' => $mdpDb, 'server' => $server, 'port' => 3306], $adminMdp);
    if (is_wp_error($r)) { aled08e_cmd_journal($cid, 'WordPress automatique : module non installé (' . $r->get_error_message() . '). La base ' . $db['user'] . ' existe.'); return; }
    update_post_meta($cid, '_aled08_wp_admin', 'alex');
    $note = (string) get_post_meta($cid, '_aled08_note', true);
    update_post_meta($cid, '_aled08_note', trim($note . "\nWordPress OVH : admin « alex », mot de passe " . $adminMdp . ' ; base ' . $db['user'] . ', mot de passe ' . $mdpDb . ' (installation lancée, 15 minutes environ).'));
    aled08e_cmd_journal($cid, 'WordPress automatique : installation lancée sur ' . $c['domaine'] . ' (identifiants dans la note interne).');
}

/* =========================================================================
 *  cPanel (jeton) : adaptateur de secours
 * ========================================================================= */
function aled08e_hb_cpanel_base() { return 'https://' . ALED08_CPANEL_HOST . ':2083'; }
function aled08e_hb_cpanel_headers() { return ['Authorization' => 'cpanel ' . ALED08_CPANEL_USER . ':' . ALED08_CPANEL_TOKEN]; }
function aled08e_hb_cpanel_uapi($module, $func, $params = []) {
    if (!aled08e_cpanel_ok()) return new WP_Error('aled08_cpanel', 'cPanel non configuré.');
    $url = aled08e_hb_cpanel_base() . '/execute/' . rawurlencode($module) . '/' . rawurlencode($func) . ($params ? '?' . http_build_query($params, '', '&') : '');
    $r = wp_remote_get($url, ['timeout' => 40, 'headers' => aled08e_hb_cpanel_headers()]);
    if (is_wp_error($r)) return new WP_Error('aled08_cpanel', 'cPanel injoignable : ' . $r->get_error_message());
    $d = json_decode((string) wp_remote_retrieve_body($r), true);
    if (!is_array($d) || !isset($d['result'])) return new WP_Error('aled08_cpanel', 'Réponse cPanel illisible (' . (int) wp_remote_retrieve_response_code($r) . ').');
    if (empty($d['result']['status'])) return new WP_Error('aled08_cpanel', implode(' ; ', (array) ($d['result']['errors'] ?? ['erreur cPanel'])));
    return $d['result']['data'] ?? true;
}
function aled08e_hb_cpanel_api2($module, $func, $params = []) {
    if (!aled08e_cpanel_ok()) return new WP_Error('aled08_cpanel', 'cPanel non configuré.');
    $q = array_merge(['cpanel_jsonapi_user' => ALED08_CPANEL_USER, 'cpanel_jsonapi_apiversion' => 2, 'cpanel_jsonapi_module' => $module, 'cpanel_jsonapi_func' => $func], $params);
    $r = wp_remote_post(aled08e_hb_cpanel_base() . '/json-api/cpanel', ['timeout' => 40, 'headers' => aled08e_hb_cpanel_headers(), 'body' => $q]);
    if (is_wp_error($r)) return new WP_Error('aled08_cpanel', 'cPanel injoignable : ' . $r->get_error_message());
    $d = json_decode((string) wp_remote_retrieve_body($r), true);
    if (!is_array($d) || !isset($d['cpanelresult'])) return new WP_Error('aled08_cpanel', 'Réponse cPanel illisible.');
    $cr = $d['cpanelresult'];
    if (!empty($cr['error'])) return new WP_Error('aled08_cpanel', (string) $cr['error']);
    $data = $cr['data'] ?? [];
    $first = is_array($data) && isset($data[0]) ? $data[0] : $data;
    if (is_array($first) && isset($first['result']) && !(int) $first['result']) return new WP_Error('aled08_cpanel', (string) ($first['reason'] ?? 'refusé'));
    return $first;
}
function aled08e_hb_cpanel_ip() {
    $i = aled08e_hb_cpanel_uapi('Variables', 'get_user_information', ['name' => 'ip']);
    return is_wp_error($i) || !is_array($i) ? '' : (string) ($i['ip'] ?? '');
}
function aled08e_hb_cpanel_attacher($dom) {
    $sub = preg_replace('/[^a-z0-9-]/', '', strtolower(strtok($dom, '.')));
    $dir = 'public_html/' . $dom;
    $u = aled08e_hb_cpanel_uapi('AddonDomain', 'addaddondomain', ['newdomain' => $dom, 'subdomain' => $sub, 'dir' => $dir]);
    if (!is_wp_error($u)) return 'domaine ' . $dom . ' ajouté (UAPI), dossier ' . $dir;
    $a = aled08e_hb_cpanel_api2('AddonDomain', 'addaddondomain', ['newdomain' => $dom, 'subdomain' => $sub, 'dir' => $dir, 'ftp_is_optional' => 1]);
    if (is_wp_error($a)) {
        if (stripos($a->get_error_message(), 'already') !== false || stripos($a->get_error_message(), 'déjà') !== false) return 'domaine ' . $dom . ' déjà présent';
        return new WP_Error('aled08_cpanel', 'Ajout du domaine refusé : ' . $a->get_error_message() . ' (UAPI : ' . $u->get_error_message() . ')');
    }
    return 'domaine ' . $dom . ' ajouté (API 2), dossier ' . $dir;
}
function aled08e_hb_cpanel_email($dom, $compte, $mdp) {
    $r = aled08e_hb_cpanel_uapi('Email', 'add_pop', ['email' => $compte, 'domain' => $dom, 'password' => $mdp, 'quota' => 2048, 'send_welcome_email' => 0]);
    if (is_wp_error($r)) {
        if (stripos($r->get_error_message(), 'already') !== false || stripos($r->get_error_message(), 'exist') !== false) return ['deja' => true];
        return $r;
    }
    return ['deja' => false];
}
function aled08e_hb_cpanel_autossl() {
    aled08e_hb_cpanel_uapi('SSL', 'start_autossl_check');
}
function aled08e_hb_cpanel_test() {
    $i = aled08e_hb_cpanel_uapi('Variables', 'get_user_information', ['name-1' => 'user', 'name-2' => 'domain', 'name-3' => 'ip']);
    if (is_wp_error($i)) return $i;
    return 'OK, compte ' . ($i['user'] ?? '?') . ', domaine principal ' . ($i['domain'] ?? '?') . ', IP ' . ($i['ip'] ?? '?');
}

/* =========================================================================
 *  E-mails au client (peu nombreux, rassurants)
 * ========================================================================= */
function aled08e_prov_signature() { return "\n\nÀ bientôt,\n" . aled08e_data()['name'] . "\n"; }
function aled08e_prov_mail_client_domaine($c) {
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\nVotre nom de domaine " . $c['domaine'] . " est réservé, à votre nom. Je prépare maintenant l’hébergement et le certificat de sécurité : c’est automatique, et en général tout est prêt en une heure environ.\n\nVous suivez l’avancement ici : " . aled08e_url() . '#commande' . aled08e_prov_signature();
    wp_mail($c['email'], 'Votre nom de domaine est réservé', $corps, aled08e_mail_headers(aled08e_data()['name'] . ' <' . aled08e_to() . '>'));
}
function aled08e_prov_mail_client_pret($c) {
    $delai = aled08e_cmd_delai_type($c);
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\nTout est prêt : votre nom de domaine, l’hébergement et le certificat de sécurité. Je commence la création de votre site" . ($delai ? ' (délai habituel : ' . $delai . ')' : '') . ".\n\nJe vous écris dès que j’ai besoin de vous (textes, photos, horaires). Vous suivez l’avancement ici : " . aled08e_url() . '#commande' . aled08e_prov_signature();
    wp_mail($c['email'], 'Tout est prêt, je crée votre site', $corps, aled08e_mail_headers(aled08e_data()['name'] . ' <' . aled08e_to() . '>'));
}
function aled08e_prov_mail_client_dns($c) {
    $h = aled08e_hebergeur();
    $regl = $h === 'ovh'
        ? "Enregistrement A : @ vers " . (aled08e_ovh_hb_ip() ?: 'l’adresse IP que je vous confirme') . "\nEnregistrement CNAME : www vers " . $c['domaine'] . "\n"
        : "Serveurs de noms : ns1.o2switch.net et ns2.o2switch.net\n";
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\nVous gardez votre nom de domaine " . $c['domaine'] . ". Pour qu’il mène à votre nouveau site, il faut modifier ses réglages DNS chez votre fournisseur actuel :\n\n" . $regl . "\nSi vous préférez, envoyez-moi vos identifiants et je le fais pour vous. Dès que c’est en place, la suite est automatique." . aled08e_prov_signature();
    wp_mail($c['email'], 'Vos réglages DNS pour ' . $c['domaine'], $corps, aled08e_mail_headers(aled08e_data()['name'] . ' <' . aled08e_to() . '>'));
}

/* =========================================================================
 *  Espace client : frise et texte d'attente, état en direct (REST)
 * ========================================================================= */
function aled08e_prov_etapes_client($c) {
    $dom = $c['domaine'] && !$c['domaine_mien'];
    return [
        ['id' => 'commande', 'label' => 'Commande reçue', 'icon' => 'clipboard-check', 'statuts' => []],
        ['id' => 'paiement', 'label' => 'Paiement', 'icon' => 'credit-card', 'statuts' => ['attente_paiement']],
        ['id' => 'domaine', 'label' => $dom ? 'Nom de domaine' : 'Votre domaine', 'icon' => 'globe', 'statuts' => ['payee', 'domaine_commande']],
        ['id' => 'hebergement', 'label' => 'Hébergement', 'icon' => 'package', 'statuts' => ['domaine_attribue', 'hebergement']],
        ['id' => 'ssl', 'label' => 'Sécurité (SSL)', 'icon' => 'shield-check', 'statuts' => ['ssl']],
        ['id' => 'creation', 'label' => 'Création du site', 'icon' => 'wand-sparkles', 'statuts' => ['pret', 'en_creation']],
        ['id' => 'en_ligne', 'label' => 'En ligne', 'icon' => 'rocket', 'statuts' => []],
    ];
}
/* Index de l'étape en cours (0 = commande reçue, 6 = en ligne) et texte d'attente */
function aled08e_prov_etat_client($c) {
    $s = $c['statut'];
    $etapes = aled08e_prov_etapes_client($c);
    $idx = 6;
    if ($s !== 'en_ligne') {
        $idx = 1;
        foreach ($etapes as $i => $e) if (in_array($s, $e['statuts'], true)) { $idx = $i; break; }
    }
    $inter = (bool) get_post_meta($c['id'], '_aled08_intervention', true);
    $depuis = (int) get_post_meta($c['id'], '_aled08_etape_depuis', true);
    $long = $depuis && time() - $depuis > 2 * HOUR_IN_SECONDS && in_array($s, aled08e_prov_etapes_auto(), true);
    $textes = [
        'attente_paiement' => 'Dès que votre paiement est confirmé, tout s’enchaîne automatiquement.',
        'payee' => $c['domaine_mien'] ? 'Je prépare votre hébergement. Vous avez reçu vos réglages DNS par e-mail.' : 'Je réserve votre nom de domaine à votre nom.',
        'domaine_commande' => 'Votre nom de domaine est en cours d’attribution par le registre.',
        'domaine_attribue' => 'Nom de domaine attribué. Je prépare votre hébergement.',
        'hebergement' => 'Votre hébergement se met en place et votre adresse se propage sur internet.',
        'ssl' => 'Le certificat de sécurité (le cadenas HTTPS) est en cours de création.',
        'pret' => 'Tout est prêt : je crée votre site. Je vous écris dès que j’ai besoin de vous.',
        'en_creation' => 'Je crée votre site. Je vous écris dès que j’ai besoin de vous.',
        'en_ligne' => 'Votre site est en ligne !',
        'annulee' => 'Cette commande est annulée.',
    ];
    $texte = $textes[$s] ?? '';
    if ($inter) $texte = 'Une petite vérification est nécessaire : je m’en occupe personnellement, et je vous préviens par e-mail dès que c’est réglé.';
    elseif ($long) $texte .= ' Ça prend un peu plus de temps que prévu, c’est normal pour certains noms de domaine.';
    $pct = (int) round($idx / 6 * 100);
    $auto = in_array($s, aled08e_prov_etapes_auto(), true);
    return ['idx' => $idx, 'pct' => $pct, 'texte' => $texte, 'auto' => $auto, 'intervention' => $inter, 'etapes' => $etapes];
}
/* Dates des étapes faites, depuis le journal (« Statut : … ») */
function aled08e_prov_dates($c) {
    $out = [];
    $lib = aled08e_cmd_statuts();
    foreach ($c['journal'] as $e) {
        foreach ($lib as $k => $v) {
            if (strpos((string) $e['texte'], 'Statut : ' . $v[0]) === 0) $out[$k] = $e['date'];
        }
    }
    $out['commande'] = $c['date'];
    return $out;
}
/* Le bloc d'attente et la frise (HTML), réutilisé par la page et par la route REST */
function aled08e_prov_frise_html($c) {
    $et = aled08e_prov_etat_client($c);
    $s = $c['statut'];
    $dates = aled08e_prov_dates($c);
    $libStatut = aled08e_cmd_libelle_client($s);
    $out = '';
    if ($s !== 'annulee' && $s !== 'en_ligne' && $s !== 'attente_paiement') {
        $out .= '<div class="esp-wait' . ($et['intervention'] ? ' is-hold' : '') . '">'
            . '<span class="esp-wait-art">' . aled08e_monster('mascotte') . '</span>'
            . '<div class="esp-wait-txt"><p class="esp-wait-title">' . esc_html($libStatut) . '</p><p>' . esc_html($et['texte']) . '</p>'
            . ($et['auto'] && !$et['intervention'] ? '<p class="esp-wait-note">En général, tout est prêt en une heure environ. Pour certains noms de domaine, ça peut prendre jusqu’à 24 heures. Vous pouvez fermer cette page : je vous préviens par e-mail.</p>' : '')
            . '</div>'
            . '<div class="esp-wait-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' . (int) $et['pct'] . '" aria-label="Avancement"><i style="width:' . (int) $et['pct'] . '%"></i></div>'
            . '</div>';
    }
    $out .= '<ol class="esp-timeline' . ($s === 'annulee' ? ' is-off' : '') . '">';
    foreach ($et['etapes'] as $i => $e) {
        $cls = $i < $et['idx'] || $s === 'en_ligne' ? 'is-done' : ($i === $et['idx'] ? 'is-now' : '');
        if ($s === 'annulee') $cls = $i === 0 ? 'is-done' : '';
        $when = '';
        if ($cls === 'is-done') {
            $d = $i === 0 ? ($dates['commande'] ?? '') : '';
            if ($i === 1) $d = $dates['payee'] ?? '';
            if ($i === 2) $d = $dates['domaine_attribue'] ?? '';
            if ($i === 3) $d = $dates['ssl'] ?? '';
            if ($i === 4) $d = $dates['pret'] ?? '';
            if ($i === 6) $d = $dates['en_ligne'] ?? '';
            if ($d) $when = '<small>' . esc_html(wp_date('j M, H:i', strtotime(get_gmt_from_date($d) . ' UTC'))) . '</small>';
        } elseif ($cls === 'is-now' && $et['auto'] && !$et['intervention']) {
            $when = '<small>en cours</small>';
        }
        $out .= '<li class="' . $cls . '"><span class="esp-tl-ico">' . aled08e_icon($cls === 'is-done' ? 'check' : $e['icon']) . '</span><span class="esp-tl-txt">' . esc_html($e['label']) . $when . '</span></li>';
    }
    $out .= '</ol>';
    return $out;
}
/* Route REST : état de la commande du client connecté (rafraîchissement sans recharger la page) */
add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/commande/etat', [
        'methods' => 'GET',
        'permission_callback' => function () { return is_user_logged_in(); },
        'callback' => function (WP_REST_Request $req) {
            $cid = (int) $req->get_param('cid');
            $c = $cid ? aled08e_cmd_get($cid) : null;
            if (!$c || (int) $c['user'] !== get_current_user_id()) return new WP_Error('aled08_refuse', 'Commande introuvable.', ['status' => 404]);
            $et = aled08e_prov_etat_client($c);
            return ['statut' => $c['statut'], 'idx' => $et['idx'], 'pct' => $et['pct'], 'auto' => $et['auto'], 'html' => aled08e_prov_frise_html($c), 'libelle' => aled08e_cmd_libelle_client($c['statut'])];
        },
    ]);
});
