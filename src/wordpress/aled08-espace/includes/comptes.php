<?php
/**
 * Alex & Lia Espace client : comptes clients automatiques.
 *  - création (ou rattachement) du compte à la commande, e-mail pour choisir le mot de passe
 *  - dernière connexion (connexion WordPress et visite connectée de /mon-espace/, une fois par jour)
 *  - tâche quotidienne « aled08_quotidien » : avertissement à 11 mois, suppression à 12 mois sans abonnement actif,
 *    jamais moins de 30 jours après l'avertissement, et seulement pour un compte dont le seul rôle est « client »
 */
defined('ABSPATH') || exit;

/* Contexte passé à l'e-mail de bienvenue (filtre wp_new_user_notification_email du fichier principal) */
function aled08e_compte_contexte($set = null) {
    static $ctx = null;
    if ($set !== null) $ctx = $set ?: null;
    return $ctx;
}

/* Journal des comptes (50 dernières lignes), visible dans l'administration */
function aled08e_comptes_journal_add($texte) {
    $j = get_option('aled08_comptes_journal', []);
    $j = is_array($j) ? $j : [];
    $j[] = ['date' => current_time('mysql'), 'texte' => mb_substr((string) $texte, 0, 300)];
    update_option('aled08_comptes_journal', array_slice($j, -50), false);
}
function aled08e_comptes_journal() {
    $j = get_option('aled08_comptes_journal', []);
    return is_array($j) ? array_reverse($j) : [];
}

/* Identifiant dérivé de l'e-mail, unique */
function aled08e_compte_identifiant($email) {
    $base = strtolower(sanitize_user(strtok((string) $email, '@'), true));
    $base = preg_replace('/[^a-z0-9._-]/', '', $base);
    $base = trim($base, '._-');
    if (strlen($base) < 3) $base = 'client' . $base;
    $base = substr($base, 0, 40);
    $login = $base;
    $n = 1;
    while (username_exists($login)) { $n++; $login = $base . $n; }
    return $login;
}

/* Un compte « simple » : client (ou simple abonné) sans aucun droit d'édition. Jamais un administrateur, un éditeur, un auteur… */
function aled08e_compte_simple($u) {
    if (!($u instanceof WP_User)) return false;
    if (array_diff(array_values((array) $u->roles), [ALED08E_ROLE, 'subscriber'])) return false;
    return !user_can($u, 'edit_posts') && !user_can($u, 'manage_options');
}
/* Un compte que la tâche quotidienne a le droit de supprimer : le seul rôle est « client », sans droit d'édition */
function aled08e_compte_supprimable($u) {
    return aled08e_compte_simple($u) && array_values((array) $u->roles) === [ALED08E_ROLE];
}

/* Création ou rattachement d'un compte client pour une commande.
 * $d : prenom, nom, entreprise, email, telephone, forfait, periode, options (tableau), domaine, domaine_mien, parrain
 * Retour : ['id' => int, 'cree' => bool, 'login' => string] ou WP_Error
 * Le code de parrainage reste dans la commande : la méta du filleul n'est posée qu'à la mise en ligne de son site. */
function aled08e_compte_pour_commande($d) {
    $email = sanitize_email($d['email'] ?? '');
    if (!is_email($email)) return new WP_Error('aled08_compte', 'Adresse e-mail invalide.');
    $existing = get_user_by('email', $email);
    $options = (array) ($d['options'] ?? []);
    $metas = [
        'forfait' => sanitize_key($d['forfait'] ?? ''),
        'paiement' => ($d['periode'] ?? 'mois') === 'annee' ? 'annee' : 'mois',
    ] + aled08e_extras_metas($options) + [
        'site' => (!empty($d['domaine']) && empty($d['domaine_mien'])) ? 'https://' . $d['domaine'] : '',
    ];

    if ($existing) {
        // compte déjà là : la commande lui est rattachée, sans toucher au mot de passe ni aux informations du compte.
        // L'adresse e-mail est saisie par un visiteur anonyme : le compte ne reprend les choix de la commande qu'au paiement
        // (aled08e_compte_metas_commande), et le rôle client n'est ajouté qu'à un compte sans autre rôle.
        if (!aled08e_is_client($existing) && aled08e_compte_simple($existing)) $existing->add_role(ALED08E_ROLE);
        return ['id' => (int) $existing->ID, 'cree' => false, 'login' => $existing->user_login];
    }

    $prenom = sanitize_text_field($d['prenom'] ?? '');
    $nom = sanitize_text_field($d['nom'] ?? '');
    $entreprise = sanitize_text_field($d['entreprise'] ?? '');
    $display = $entreprise ?: trim($prenom . ' ' . $nom);
    $login = aled08e_compte_identifiant($email);
    $uid = wp_insert_user([
        'user_login' => $login,
        'user_pass' => wp_generate_password(24, true, false),
        'user_email' => $email,
        'first_name' => $prenom,
        'last_name' => $nom,
        'display_name' => $display ?: $login,
        'nickname' => $prenom ?: $login,
        'role' => ALED08E_ROLE,
        'show_admin_bar_front' => 'false',
    ]);
    if (is_wp_error($uid)) return $uid;
    foreach ($metas as $k => $v) update_user_meta($uid, 'aled08_' . $k, $v);
    if (!empty($d['telephone'])) update_user_meta($uid, 'aled08_telephone', sanitize_text_field($d['telephone']));
    if ($entreprise) update_user_meta($uid, 'aled08_entreprise', $entreprise);
    aled08e_comptes_journal_add('Compte créé pour ' . $display . ' (' . $email . ')' . (!empty($d['ref']) ? ', commande ' . $d['ref'] : ''));
    return ['id' => (int) $uid, 'cree' => true, 'login' => $login];
}

/* Au paiement d'une commande : le compte reprend ses choix (forfait, période, option e-mail, adresse du site)
 * là où rien n'est encore renseigné. Rien n'est écrasé. */
function aled08e_compte_metas_commande($cmd) {
    $uid = (int) ($cmd['user'] ?? 0);
    if (!$uid || !get_userdata($uid)) return;
    $metas = [
        'forfait' => sanitize_key($cmd['forfait'] ?? ''),
        'paiement' => ($cmd['periode'] ?? 'mois') === 'annee' ? 'annee' : 'mois',
    ] + aled08e_extras_metas((array) ($cmd['options'] ?? [])) + [
        'site' => (!empty($cmd['domaine']) && empty($cmd['domaine_mien'])) ? 'https://' . $cmd['domaine'] : '',
    ];
    foreach ($metas as $k => $v) {
        if ($v !== '' && aled08e_meta($uid, $k) === '') update_user_meta($uid, 'aled08_' . $k, $v);
    }
}

/* E-mail « Votre espace client Alex & Lia » avec le lien pour choisir le mot de passe (nouveau compte ou renvoi) */
function aled08e_compte_envoyer_acces($uid, $ref = '') {
    $u = get_userdata($uid);
    if (!$u) return false;
    aled08e_compte_contexte(['ref' => $ref]);
    wp_new_user_notification($uid, null, 'user');
    aled08e_compte_contexte(false);
    return true;
}

/* =========================================================================
 *  Dernière connexion
 * ========================================================================= */
function aled08e_noter_connexion($uid) {
    update_user_meta($uid, 'aled08_derniere_connexion', current_time('mysql'));
    delete_user_meta($uid, 'aled08_avertissement_suppression');
}
add_action('wp_login', function ($login, $user) {
    if ($user instanceof WP_User && aled08e_is_client($user)) aled08e_noter_connexion($user->ID);
}, 10, 2);
add_action('template_redirect', function () {
    if (!is_user_logged_in() || !is_page('mon-espace') || !aled08e_is_client()) return;
    $uid = get_current_user_id();
    $last = aled08e_meta($uid, 'derniere_connexion');
    if (!$last || substr($last, 0, 10) !== current_time('Y-m-d')) aled08e_noter_connexion($uid);
}, 2);

/* =========================================================================
 *  Tâche quotidienne
 * ========================================================================= */
function aled08e_planifier_quotidien() {
    if (!wp_next_scheduled('aled08_quotidien')) {
        // la nuit, heure de Paris
        $ts = strtotime('tomorrow 03:15', current_time('timestamp'));
        $ts = $ts - (int) (get_option('gmt_offset') * HOUR_IN_SECONDS);
        wp_schedule_event($ts, 'daily', 'aled08_quotidien');
    }
}
add_action('init', function () {
    if (!wp_doing_ajax() && !wp_next_scheduled('aled08_quotidien')) aled08e_planifier_quotidien();
}, 20);

/* Un abonnement est « actif » si : Stripe le dit (active ou past_due), ou la case « hors Stripe » est cochée,
 * ou une commande non annulée date de moins de 12 mois. */
function aled08e_compte_abonnement_actif($uid) {
    $abo = aled08e_meta($uid, 'abonnement');
    if (in_array($abo, ['active', 'past_due'], true)) return true;
    if (aled08e_meta($uid, 'abonnement_manuel') === '1' || aled08e_meta($uid, 'offert') === '1') return true;
    foreach (aled08e_cmd_user_commandes($uid) as $c) {
        if ($c['statut'] !== 'annulee' && strtotime($c['date']) > strtotime('-12 months')) return true;
    }
    return false;
}
function aled08e_compte_derniere_activite($u) {
    $last = aled08e_meta($u->ID, 'derniere_connexion');
    // la dernière connexion est en heure locale, la date d'inscription de WordPress est déjà en UTC
    return $last ? strtotime(get_gmt_from_date($last) . ' UTC') : strtotime($u->user_registered . ' UTC');
}
/* Date de l'avertissement envoyé (horodatage), 0 si aucun */
function aled08e_compte_averti_le($u) {
    $averti = aled08e_meta($u->ID, 'avertissement_suppression');
    return $averti ? (int) strtotime(get_gmt_from_date($averti) . ' UTC') : 0;
}
/* Date de suppression d'un compte sans abonnement : 12 mois après la dernière activité, et jamais moins de 30 jours
 * après l'e-mail d'avertissement (ou après aujourd'hui s'il n'est pas encore parti). */
function aled08e_compte_date_suppression($u) {
    $averti = aled08e_compte_averti_le($u);
    return max(strtotime('+12 months', aled08e_compte_derniere_activite($u)), ($averti ?: time()) + 30 * DAY_IN_SECONDS);
}

/* Comptes concernés par la suppression : ['user' => WP_User, 'suppression' => timestamp, 'averti' => bool] */
function aled08e_comptes_a_supprimer($dans_jours = 30) {
    $out = [];
    foreach (get_users(['role' => ALED08E_ROLE, 'number' => 500, 'fields' => 'all']) as $u) {
        if (!aled08e_compte_supprimable($u)) continue;
        if (aled08e_compte_abonnement_actif($u->ID)) continue;
        $sup = aled08e_compte_date_suppression($u);
        if ($sup <= time() + $dans_jours * DAY_IN_SECONDS) $out[] = ['user' => $u, 'suppression' => $sup, 'averti' => aled08e_compte_averti_le($u) > 0];
    }
    usort($out, function ($a, $b) { return $a['suppression'] <=> $b['suppression']; });
    return $out;
}

/* Tâche quotidienne. Un compte n'est supprimé qu'après l'e-mail d'avertissement, envoyé au moins 30 jours avant :
 * un compte déjà inactif depuis plus de 12 mois au premier passage est d'abord averti. */
function aled08e_comptes_nettoyage() {
    foreach (get_users(['role' => ALED08E_ROLE, 'number' => 500, 'fields' => 'all']) as $u) {
        if (!aled08e_compte_supprimable($u)) continue; // jamais un administrateur ni un compte qui a un autre rôle
        $actif = aled08e_compte_abonnement_actif($u->ID);
        $last = aled08e_compte_derniere_activite($u);
        $averti = aled08e_compte_averti_le($u);
        if ($actif || $last > strtotime('-11 months')) {
            if ($averti) delete_user_meta($u->ID, 'aled08_avertissement_suppression');
            continue;
        }
        $nom = $u->display_name . ' (' . $u->user_email . ')';
        if (!$averti) {
            $date = wp_date('j F Y', aled08e_compte_date_suppression($u));
            $corps = 'Bonjour ' . aled08e_prenom($u) . ",\n\n"
                . "Votre espace client Alex & Lia n’a pas été ouvert depuis près d’un an, et aucun abonnement n’est en cours.\n"
                . "Sans connexion de votre part, votre compte et ses données seront supprimés le " . $date . ".\n\n"
                . "Pour le garder, il suffit de vous connecter une fois :\n" . aled08e_url() . "\n\n"
                . "Une question ? Répondez à cet e-mail.\n\nÀ bientôt,\nAlex, et Lia\n";
            wp_mail($u->user_email, 'Votre espace client Alex & Lia : une connexion avant le ' . $date . ' pour le garder', $corps, aled08e_mail_headers('Alex & Lia <' . aled08e_to() . '>'));
            update_user_meta($u->ID, 'aled08_avertissement_suppression', current_time('mysql'));
            aled08e_comptes_journal_add('Avertissement envoyé à ' . $nom . ' : suppression le ' . $date . ($last <= strtotime('-12 months') ? ' (compte déjà inactif depuis plus de 12 mois)' : '') . '.');
            continue;
        }
        if ($last <= strtotime('-12 months') && $averti <= time() - 30 * DAY_IN_SECONDS) {
            require_once ABSPATH . 'wp-admin/includes/user.php';
            if (!wp_delete_user($u->ID)) continue;
            aled08e_comptes_journal_add('Compte supprimé : ' . $nom . ', sans connexion ni abonnement depuis 12 mois, averti le ' . wp_date('j F Y', $averti) . '.');
            wp_mail(aled08e_to(), 'Compte client supprimé : ' . $u->display_name, 'Le compte client ' . $nom . " a été supprimé par la tâche quotidienne : aucune connexion ni abonnement actif depuis 12 mois, avertissement envoyé le " . wp_date('j F Y', $averti) . ".\nSes demandes et ses photos sont parties avec le compte. Les factures Stripe restent dans Stripe.\n", aled08e_mail_headers());
        }
    }
}
add_action('aled08_quotidien', 'aled08e_comptes_nettoyage', 10);
