<?php
/**
 * Les Minis Monstres : « Je ne veux plus attendre » (décision d'Alex, 26 novembre 2026).
 *
 * Le client qui a choisi d'attendre ses 14 jours de rétractation peut, à tout moment pendant ce délai, lancer son site
 * depuis son espace client (onglet « Ma commande »). La loi (Code de la consommation, articles L221-25 et L221-28) demande
 * une demande expresse du client, et qu'il reconnaisse perdre son droit de rétractation une fois le site entièrement livré.
 *
 * La « signature » : une case à cocher avec la phrase exacte, et son nom tapé à la main. On garde la preuve (phrase, nom,
 * date et heure, adresse IP, navigateur) dans la commande, et le client en reçoit la copie par e-mail (le support durable
 * que demande la loi). Puis tout repart tout seul : nom de domaine, hébergement, création, 12 heures de garde, livraison.
 */
if (!defined('ABSPATH')) exit;

/* La phrase signée : elle est recopiée telle quelle dans la preuve et dans l'e-mail */
function aled08e_demarrer_phrase($c) {
    return 'Je demande expressément que la création de mon site commence maintenant, avant la fin de mon délai de rétractation de 14 jours. '
        . 'Je reconnais que je perdrai mon droit de rétractation dès que mon site sera entièrement livré. '
        . 'Si je me rétracte avant, le travail déjà fait sera retenu et le reste me sera remboursé.'
        . ($c['domaine'] && !$c['domaine_mien'] ? ' Mon nom de domaine ' . $c['domaine'] . ' est réservé tout de suite, à mon nom, pour un an : il reste à ma charge si je me rétracte.' : '');
}

/* Le bloc dans l'onglet « Ma commande », seulement pendant l'attente */
function aled08e_demarrer_html($c) {
    $flash = isset($_GET['m']) && sanitize_key(wp_unslash($_GET['m'])) === 'demarre'
        ? '<p class="esp-empty" role="status">C’est signé, merci ! Votre site est lancé : la petite bande s’y met tout de suite. Vous avez reçu la copie de votre demande par e-mail.</p>' : '';
    if (isset($_GET['m']) && sanitize_key(wp_unslash($_GET['m'])) === 'demarre_erreur')
        $flash = '<p class="esp-warn" role="status">Pour lancer votre site, cochez la case et écrivez votre nom et votre prénom.</p>';
    $fin = function_exists('aled08e_cmd_attente_fin') ? aled08e_cmd_attente_fin($c['id']) : 0;
    if ($fin <= time() || in_array($c['statut'], ['attente_paiement', 'annulee', 'en_ligne'], true)) return $flash;
    ob_start();
    ?>
    <?php echo $flash; // phpcs:ignore ?>
    <form method="post" action="<?php echo esc_url(aled08e_url()); ?>#commande" class="esp-pay esp-demarrer">
      <input type="hidden" name="aled08e_demarrer" value="1"><input type="hidden" name="cid" value="<?php echo (int) $c['id']; ?>">
      <?php wp_nonce_field('aled08e_demarrer_' . $c['id'], '_aled08e_demarrer'); ?>
      <p><b>Vous ne voulez plus attendre ?</b> Vous avez choisi d’attendre la fin de votre délai de rétractation, le <?php echo esc_html(wp_date('j F Y', $fin)); ?>. Vous pouvez lancer votre site dès maintenant : il suffit de signer ci-dessous.</p>
      <label class="check"><input type="checkbox" name="accord" value="oui" required><span><?php echo esc_html(aled08e_demarrer_phrase($c)); ?></span></label>
      <div class="field"><label for="dem-sig-<?php echo (int) $c['id']; ?>">Votre nom et votre prénom, pour signer</label><input id="dem-sig-<?php echo (int) $c['id']; ?>" type="text" name="signature" required minlength="3" maxlength="80" autocomplete="name"></div>
      <button class="btn btn-primary btn-flaque" type="submit"><?php echo aled08e_icon('rocket'); // phpcs:ignore ?><span>Je signe et je lance mon site</span></button>
      <p class="esp-wait-note">Vous recevez aussitôt la copie de votre demande par e-mail.</p>
    </form>
    <?php
    return ob_get_clean();
}

/* La signature reçue */
add_action('template_redirect', function () {
    if (empty($_POST['aled08e_demarrer'])) return;
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $cid = (int) ($_POST['cid'] ?? 0);
    $c = $cid ? aled08e_cmd_get($cid) : null;
    $retour = function ($m) { wp_safe_redirect(aled08e_url(['m' => $m]) . '#commande', 303); exit; };
    $n = isset($_POST['_aled08e_demarrer']) ? sanitize_text_field(wp_unslash($_POST['_aled08e_demarrer'])) : '';
    if (!$c || (int) $c['user'] !== get_current_user_id() || !wp_verify_nonce($n, 'aled08e_demarrer_' . $cid)) $retour('demarre_erreur');
    if (aled08e_cmd_attente_fin($cid) <= time()) $retour('demarre'); // déjà lancé (double clic) ou délai fini
    $nom = trim(sanitize_text_field(wp_unslash($_POST['signature'] ?? '')));
    if (($_POST['accord'] ?? '') !== 'oui' || mb_strlen($nom) < 3) $retour('demarre_erreur');

    $phrase = aled08e_demarrer_phrase($c);
    $quand = time();
    update_post_meta($cid, '_aled08_demarrage_preuve', [
        'phrase' => $phrase, 'signature' => mb_substr($nom, 0, 80), 'le' => $quand,
        'ip' => sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? '')), 'navigateur' => mb_substr(sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 200),
        'compte' => get_current_user_id(),
    ]);
    update_post_meta($cid, '_aled08_demarrage', 'oui');
    update_post_meta($cid, '_aled08_demarrage_signe_le', $quand);
    $date = function_exists('aled08e_date_fr') ? aled08e_date_fr($quand) : wp_date('j F Y à H:i', $quand);
    aled08e_cmd_journal($cid, 'Le client a signé sa demande de démarrage avant la fin des 14 jours (« ' . $nom . ' », ' . $date . ') : le site est lancé.');

    // la copie au client, sur support durable
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\nVoici la copie de votre demande, signée dans votre espace client.\n\n"
        . 'Commande : ' . $c['ref'] . "\nSignée par : " . $nom . "\nLe : " . $date . "\n\n« " . $phrase . " »\n\n"
        . "Votre site est lancé : la petite bande s’y met tout de suite. Prochain e-mail : quand tout sera configuré.\n"
        . "Vous suivez l’avancement ici : " . aled08e_url() . '#commande' . "\n\nÀ bientôt,\n" . aled08e_data()['name'] . "\n";
    wp_mail($c['email'], 'Votre site est lancé : la copie de votre demande', $corps, aled08e_mail_headers(aled08e_data()['name'] . ' <' . aled08e_to() . '>'));

    // tout repart : les 12 heures de garde partent d'ici si le questionnaire est déjà rempli, puis l'automate avance
    if (function_exists('aled08e_brief_le') && aled08e_brief_le($cid) !== '' && function_exists('aled08e_infos_completes')) aled08e_infos_completes($cid);
    update_post_meta($cid, '_aled08_etape_depuis', time());
    if (function_exists('aled08e_prov_avancer') && in_array($c['statut'], aled08e_prov_etapes_auto(), true)) aled08e_prov_avancer($cid, true);
    $retour('demarre');
}, 9);
