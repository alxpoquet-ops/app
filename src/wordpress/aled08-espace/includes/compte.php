<?php
/**
 * Les Minis Monstres Espace client : onglet « Mon compte ».
 * Le client change lui-même son nom, son entreprise, son téléphone, son adresse e-mail et son mot de passe.
 * L'e-mail et le mot de passe demandent le mot de passe actuel ; WordPress prévient l'ancienne adresse du changement.
 */
defined('ABSPATH') || exit;

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_compte'])) return;
    $back = function ($m) { wp_safe_redirect(aled08e_url(['mc' => $m]) . '#compte', 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_compte'] ?? '')), 'aled08e_compte')) $back('erreur');
    $u = wp_get_current_user();
    $uid = $u->ID;
    $P = wp_unslash($_POST);
    $quoi = sanitize_key($P['aled08e_compte']);

    if ($quoi === 'apparence') {
        $m = sanitize_key((string) ($P['apparence'] ?? 'clair'));
        if (!in_array($m, ['auto', 'clair', 'sombre'], true)) $back('erreur');
        update_user_meta($uid, 'aled08_apparence', $m);
        $r = (aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== '') ? aled08e_lia_appel($uid, 'apparence_regler', ['mode' => $m]) : null;
        $back(is_wp_error($r) ? 'apparence_attente' : 'apparence_ok');
    }
    if ($quoi === 'site') {
        $nom = mb_substr(sanitize_text_field((string) ($P['site_nom'] ?? '')), 0, 80);
        $slogan = mb_substr(sanitize_text_field((string) ($P['site_slogan'] ?? '')), 0, 160);
        if ($nom === '' || aled08e_meta($uid, 'lia_url') === '' || aled08e_meta($uid, 'lia_secret') === '') $back('erreur');
        $a = aled08e_lia_appel($uid, 'reglage', ['nom' => 'nom', 'valeur' => $nom]);
        $b = is_wp_error($a) ? $a : aled08e_lia_appel($uid, 'reglage', ['nom' => 'slogan', 'valeur' => $slogan]);
        delete_transient('aled08e_site_infos_' . $uid);
        $back(is_wp_error($b) ? 'site_attente' : 'site_ok');
    }
    if ($quoi === 'infos') {
        $prenom = sanitize_text_field((string) ($P['prenom'] ?? ''));
        $nom = sanitize_text_field((string) ($P['nom'] ?? ''));
        $ent = sanitize_text_field((string) ($P['entreprise'] ?? ''));
        $tel = preg_replace('/[^0-9+ .()-]/', '', (string) ($P['telephone'] ?? ''));
        if ($prenom === '' && $nom === '' && $ent === '') $back('nom_vide');
        $r = wp_update_user(['ID' => $uid, 'first_name' => $prenom, 'last_name' => $nom, 'display_name' => $ent ?: trim($prenom . ' ' . $nom)]);
        if (is_wp_error($r)) $back('erreur');
        update_user_meta($uid, 'aled08_entreprise', $ent);
        update_user_meta($uid, 'aled08_telephone', mb_substr(trim($tel), 0, 30));
        $back('infos_ok');
    }

    // e-mail et mot de passe : le mot de passe actuel est demandé
    $actuel = (string) ($P['mdp_actuel'] ?? '');
    if ($actuel === '' || !wp_check_password($actuel, $u->user_pass, $uid)) $back('mdp_faux');

    if ($quoi === 'email') {
        $email = sanitize_email((string) ($P['email'] ?? ''));
        if (!is_email($email)) $back('email_invalide');
        if (strtolower($email) === strtolower($u->user_email)) $back('email_ok');
        $autre = email_exists($email);
        if ($autre && (int) $autre !== $uid) $back('email_pris');
        $ancien = $u->user_email;
        $r = wp_update_user(['ID' => $uid, 'user_email' => $email]); // WordPress écrit à l'ancienne adresse
        if (is_wp_error($r)) $back('erreur');
        wp_mail(aled08e_to(), 'Un client a changé son adresse e-mail', $u->display_name . ' : ' . $ancien . ' devient ' . $email . "\n", aled08e_mail_headers());
        $back('email_ok');
    }

    if ($quoi === 'mdp') {
        $n1 = (string) ($P['mdp_nouveau'] ?? '');
        $n2 = (string) ($P['mdp_confirme'] ?? '');
        if (mb_strlen($n1) < 10) $back('mdp_court');
        if ($n1 !== $n2) $back('mdp_diff');
        $r = wp_update_user(['ID' => $uid, 'user_pass' => $n1]); // WordPress envoie un e-mail de confirmation
        if (is_wp_error($r)) $back('erreur');
        // les autres appareils sont déconnectés, celui-ci reste connecté
        wp_set_current_user($uid);
        wp_set_auth_cookie($uid, true, is_ssl());
        WP_Session_Tokens::get_instance($uid)->destroy_others(wp_get_session_token());
        $back('mdp_ok');
    }
    $back('erreur');
}, 5);

function aled08e_panel_compte($u) {
    $uid = $u->ID;
    $mc = isset($_GET['mc']) ? sanitize_key(wp_unslash($_GET['mc'])) : '';
    $msgs = [
        'infos_ok' => ['esp-empty', 'C’est enregistré.'],
        'site_ok' => ['esp-empty', 'C’est enregistré : votre site affiche son nouveau nom et sa phrase d’accroche (dans l’onglet du navigateur et sur Google).'],
        'site_attente' => ['esp-warn', 'Votre site ne répond pas pour le moment. Réessayez dans un instant.'],
        'apparence_ok' => ['esp-empty', 'C’est enregistré : votre site s’ouvre maintenant avec cette apparence.'],
        'apparence_attente' => ['esp-warn', 'Votre choix est noté. Votre site ne répond pas pour le moment : on l’applique dès qu’il est disponible.'],
        'email_ok' => ['esp-empty', 'Votre adresse e-mail est à jour. Un message de confirmation part à l’ancienne adresse.'],
        'mdp_ok' => ['esp-empty', 'Mot de passe changé. Vos autres appareils sont déconnectés.'],
        'nom_vide' => ['esp-warn', 'Indiquez au moins un nom ou un nom d’entreprise.'],
        'mdp_faux' => ['esp-warn', 'Le mot de passe actuel n’est pas le bon.'],
        'email_invalide' => ['esp-warn', 'Cette adresse e-mail n’est pas valide.'],
        'email_pris' => ['esp-warn', 'Cette adresse e-mail est déjà utilisée par un autre compte. Écrivez-moi si c’est bien la vôtre.'],
        'mdp_court' => ['esp-warn', 'Choisissez un mot de passe d’au moins 10 caractères.'],
        'mdp_diff' => ['esp-warn', 'Les deux nouveaux mots de passe ne sont pas pareils.'],
        'erreur' => ['esp-warn', 'Ça n’a pas marché. Réessayez, ou écrivez-moi.'],
    ];
    $flash = isset($msgs[$mc]) ? '<p class="' . $msgs[$mc][0] . '" role="status">' . esc_html($msgs[$mc][1]) . '</p>' : '';
    $nonce = wp_nonce_field('aled08e_compte', '_aled08e_compte', true, false);
    $act = esc_url(aled08e_url());
    $champ = function ($id, $label, $name, $val, $type = 'text', $auto = '', $extra = '') {
        return '<div class="field"><label for="' . $id . '">' . esc_html($label) . '</label><input id="' . $id . '" name="' . $name . '" type="' . $type . '" value="' . esc_attr($val) . '"' . ($auto ? ' autocomplete="' . $auto . '"' : '') . $extra . '></div>';
    };
    ob_start();
    echo '<h2 class="app-h">Mon compte</h2>' . $flash; // phpcs:ignore
    echo '<p class="app-p">Vos informations, votre adresse e-mail et votre mot de passe. Vous changez tout vous-même, quand vous voulez.</p>';

    echo '<form class="form esp-form" method="post" action="' . $act . '"><input type="hidden" name="aled08e_compte" value="infos">' . $nonce; // phpcs:ignore
    echo '<p class="app-sub">' . aled08e_icon('circle-user') . ' Mes informations</p><div class="esp-grid2">'; // phpcs:ignore
    echo $champ('mc-prenom', 'Prénom', 'prenom', $u->first_name, 'text', 'given-name') . $champ('mc-nom', 'Nom', 'nom', $u->last_name, 'text', 'family-name'); // phpcs:ignore
    echo $champ('mc-ent', 'Entreprise (facultatif)', 'entreprise', aled08e_meta($uid, 'entreprise'), 'text', 'organization') . $champ('mc-tel', 'Téléphone', 'telephone', aled08e_meta($uid, 'telephone'), 'tel', 'tel'); // phpcs:ignore
    echo '</div><button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>'; // phpcs:ignore

    echo '<form class="form esp-form" method="post" action="' . $act . '"><input type="hidden" name="aled08e_compte" value="email">' . $nonce; // phpcs:ignore
    echo '<p class="app-sub">' . aled08e_icon('mail') . ' Mon adresse e-mail</p>'; // phpcs:ignore
    echo '<p class="app-note">Elle sert à vous connecter et à recevoir les nouvelles de votre site.</p>';
    echo $champ('mc-email', 'Adresse e-mail', 'email', $u->user_email, 'email', 'email', ' required'); // phpcs:ignore
    echo $champ('mc-mdp1', 'Mot de passe actuel, pour confirmer', 'mdp_actuel', '', 'password', 'current-password', ' required'); // phpcs:ignore
    echo '<button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Changer mon e-mail</span></button></form>'; // phpcs:ignore

    $app = aled08e_meta($u->ID, 'apparence') ?: 'clair';
    echo '<form class="form esp-form" method="post" action="' . $act . '"><input type="hidden" name="aled08e_compte" value="apparence">' . $nonce; // phpcs:ignore
    echo '<p class="app-sub">' . aled08e_icon('sparkles') . ' L’apparence de mon site</p>'; // phpcs:ignore
    echo '<p class="app-note">Votre site existe en version claire et en version sombre. Il s’ouvre en clair ; vos visiteurs passent en sombre avec le petit soleil ou la lune. Vous pouvez choisir une autre ouverture.</p><div class="esp-apparence">';
    foreach (['clair' => ['Clair', 'Conseillé : fond clair à l’ouverture'], 'sombre' => ['Sombre', 'Fond sombre à l’ouverture'], 'auto' => ['Automatique', 'Selon le réglage du téléphone de chaque visiteur']] as $k => $l) {
        echo '<label class="esp-reste"><input type="radio" name="apparence" value="' . $k . '"' . checked($app, $k, false) . '><span><strong>' . esc_html($l[0]) . '</strong><small>' . esc_html($l[1]) . '</small></span></label>';
    }
    echo '</div><button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>'; // phpcs:ignore

    // le nom et la phrase d'accroche du site (onglet du navigateur, résultats Google), lus sur le site du client
    if (aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== '') {
        $inf = get_transient('aled08e_site_infos_' . $uid);
        if (!is_array($inf)) { $inf = aled08e_lia_appel($uid, 'infos'); $inf = is_wp_error($inf) ? [] : $inf; set_transient('aled08e_site_infos_' . $uid, $inf, 10 * MINUTE_IN_SECONDS); }
        if ($inf) {
            echo '<form class="form esp-form" method="post" action="' . $act . '"><input type="hidden" name="aled08e_compte" value="site">' . $nonce; // phpcs:ignore
            echo '<p class="app-sub">' . aled08e_icon('globe') . ' Le nom de mon site</p>'; // phpcs:ignore
            echo '<p class="app-note">Ils s’affichent dans l’onglet du navigateur et dans les résultats de Google.</p>';
            echo $champ('mc-site-nom', 'Nom du site', 'site_nom', (string) ($inf['nom'] ?? ''), 'text', 'organization', ' required maxlength="80"'); // phpcs:ignore
            echo $champ('mc-site-slogan', 'Phrase d’accroche (facultative)', 'site_slogan', (string) ($inf['slogan'] ?? ''), 'text', 'off', ' maxlength="160"'); // phpcs:ignore
            echo '<button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>'; // phpcs:ignore
        }
    }

    echo '<form class="form esp-form" method="post" action="' . $act . '"><input type="hidden" name="aled08e_compte" value="mdp">' . $nonce; // phpcs:ignore
    echo '<p class="app-sub">' . aled08e_icon('lock') . ' Mon mot de passe</p>'; // phpcs:ignore
    echo $champ('mc-mdp2', 'Mot de passe actuel', 'mdp_actuel', '', 'password', 'current-password', ' required'); // phpcs:ignore
    echo '<div class="esp-grid2">' . $champ('mc-mdp3', 'Nouveau mot de passe (10 caractères au moins)', 'mdp_nouveau', '', 'password', 'new-password', ' required minlength="10"') . $champ('mc-mdp4', 'Encore une fois', 'mdp_confirme', '', 'password', 'new-password', ' required minlength="10"') . '</div>'; // phpcs:ignore
    echo '<button class="btn btn-primary" type="submit">' . aled08e_icon('key-round') . '<span>Changer mon mot de passe</span></button>'; // phpcs:ignore
    echo '<p class="app-note">Mot de passe oublié ? Déconnectez-vous, puis « Mot de passe oublié » sur la page de connexion.</p></form>';
    return ob_get_clean();
}
