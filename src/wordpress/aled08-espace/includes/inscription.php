<?php
/**
 * Alex & Lia Espace client : créer son compte sans commander.
 * Le visiteur donne son prénom, son nom et son e-mail ; il reçoit un e-mail pour choisir son mot de passe
 * (ce qui vérifie aussi l'adresse). Un compte sans forfait voit un espace simple : bienvenue, démo, commander, Mon compte.
 * Sans commande ni forfait, la règle habituelle s'applique : compte supprimé après 12 mois sans connexion.
 */
defined('ABSPATH') || exit;

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_inscription'])) return;
    $back = function ($m) { wp_safe_redirect(aled08e_url(['inscription' => $m]) . '#inscription', 303); exit; };
    if (is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $P = wp_unslash($_POST);
    foreach (['prenom', 'nom', 'email', 'site_web'] as $k) if (isset($P[$k]) && !is_string($P[$k])) $back('erreur');
    if (!empty($P['site_web'])) $back('envoye'); // piège à robots : on fait comme si tout allait bien
    // pas plus de 5 inscriptions par heure depuis une même adresse
    $ip = preg_replace('/[^0-9a-f:.]/i', '', (string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $cle = 'aled08_insc_' . md5($ip);
    $n = (int) get_transient($cle);
    if ($n >= 5) $back('trop');
    set_transient($cle, $n + 1, HOUR_IN_SECONDS);

    $prenom = sanitize_text_field((string) ($P['prenom'] ?? ''));
    $nom = sanitize_text_field((string) ($P['nom'] ?? ''));
    $email = sanitize_email((string) ($P['email'] ?? ''));
    if ($prenom === '' || !is_email($email)) $back('champs');

    $existant = get_user_by('email', $email);
    if ($existant) {
        // même réponse qu'un nouveau compte (on ne dit pas qui est déjà inscrit) ; un client reçoit un lien pour son mot de passe
        if (aled08e_is_client($existant)) retrieve_password($existant->user_login);
        $back('envoye');
    }
    $r = aled08e_compte_pour_commande(['prenom' => mb_substr($prenom, 0, 60), 'nom' => mb_substr($nom, 0, 60), 'email' => $email]);
    if (is_wp_error($r)) $back('erreur');
    update_user_meta($r['id'], 'aled08_inscrit_seul', current_time('mysql'));
    aled08e_compte_envoyer_acces($r['id'], '');
    wp_mail(aled08e_to(), 'Nouveau compte créé sur le site', trim($prenom . ' ' . $nom) . ' (' . $email . ") a créé son compte, sans commande pour l’instant.\n\nFiche : " . admin_url('user-edit.php?user_id=' . (int) $r['id']) . "\n", aled08e_mail_headers());
    $back('envoye');
}, 4);

/* Message après l'inscription, sur la page de connexion (la page est en cache : le message vient de l'adresse) */
function aled08e_inscription_message($c) {
    $m = isset($_GET['inscription']) ? sanitize_key(wp_unslash($_GET['inscription'])) : '';
    $txt = [
        'envoye' => ['form-ok', 'C’est presque fini ! Un e-mail vient de partir : ouvrez-le pour choisir votre mot de passe. Pensez à regarder dans les indésirables.'],
        'champs' => ['form-alert', 'Indiquez au moins votre prénom et une adresse e-mail valide.'],
        'trop' => ['form-alert', 'Trop d’essais depuis votre connexion. Réessayez dans une heure, ou écrivez-moi.'],
        'erreur' => ['form-alert', 'Le compte n’a pas pu être créé. Réessayez, ou écrivez-moi.'],
    ];
    if (!isset($txt[$m])) return $c;
    return str_replace('<p class="form-alert" data-signup-msg hidden></p>', '<p class="' . $txt[$m][0] . '" role="status">' . esc_html($txt[$m][1]) . '</p>', $c);
}

/* Un compte sans forfait ni commande : espace simple */
function aled08e_sans_forfait($uid) {
    return aled08e_meta($uid, 'forfait') === '' && aled08e_meta($uid, 'offert') !== '1' && !aled08e_cmd_user_commandes($uid);
}
function aled08e_dashboard_libre($u) {
    $D = aled08e_data();
    ob_start();
    ?>
<section class="section section-app"><div class="container">
  <div class="app" data-espace>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small><?php echo esc_html($u->user_email); ?></small></div></div>
        <div class="app-tabs" role="tablist" aria-label="Mon espace">
          <?php echo aled08e_tab('accueil', 'house', 'Accueil', true) . aled08e_tab('compte', 'circle-user', 'Mon compte'); // phpcs:ignore ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">
        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bienvenue <?php echo esc_html(aled08e_prenom($u)); ?> !</h2>
          <p class="app-p">Votre compte est prêt. Quand vous commandez votre site, tout arrive ici : le suivi de la commande, vos demandes de modification à Lia ou à Alex, votre tableau de bord, votre QR code et votre parrainage.</p>
          <div class="app-cards">
            <a class="app-card c-mint" href="<?php echo esc_url(home_url('/creer-mon-site/')); ?>"><span class="app-card-ico"><?php echo aled08e_icon('wand-sparkles'); // phpcs:ignore ?></span><span><small>Étape suivante</small><strong>Créer mon site</strong><span>Choisir, voir le prix, commander</span></span></a>
            <a class="app-card c-lilac" href="<?php echo esc_url(home_url('/forfaits/')); ?>"><span class="app-card-ico"><?php echo aled08e_icon('heart'); // phpcs:ignore ?></span><span><small>Les forfaits</small><strong>Chico, Power, Titan</strong><span>Dès 5 € par mois</span></span></a>
            <a class="app-card c-pink" href="<?php echo esc_url(home_url('/mon-espace/demo/')); ?>"><span class="app-card-ico"><?php echo aled08e_icon('circle-user'); // phpcs:ignore ?></span><span><small>Pour voir</small><strong>La démo</strong><span>Un espace client rempli d’exemples</span></span></a>
          </div>
          <p class="app-note">Une question avant de vous lancer ? <a href="<?php echo esc_url(home_url('/contact/')); ?>">Écrivez-nous</a>.</p>
        </div>
        <div class="app-panel" role="tabpanel" id="t-compte" aria-labelledby="tab-compte" hidden>
          <?php echo aled08e_panel_compte($u); // phpcs:ignore ?>
        </div>
      </div>
    </div>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}
