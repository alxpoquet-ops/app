<?php
/**
 * Alex & Lia Espace client : mode vacances d'une boutique en ligne.
 * Le client choisit les dates, ce qui se passe pendant ce temps (boutique fermée, ou commandes
 * acceptées avec expédition au retour) et le message affiché. Le réglage part sur son site
 * par le connecteur (action « vacances_regler ») ; il ne compte pas comme une modification.
 */
defined('ABSPATH') || exit;

/* Le client a-t-il une boutique en ligne ? (commande « boutique », ou case cochée dans sa fiche) */
function aled08e_est_boutique($uid) {
    if (aled08e_meta($uid, 'boutique') === '1') return true;
    foreach (aled08e_cmd_user_commandes($uid) as $c) if (($c['type'] ?? '') === 'boutique') return true;
    return false;
}

/* Réglage connu (copie gardée dans la fiche du client, pour ne pas interroger son site à chaque page) */
function aled08e_vac_get($uid) {
    $v = get_user_meta($uid, 'aled08_vacances', true);
    $v = is_array($v) ? $v : [];
    return $v + ['actif' => false, 'debut' => '', 'fin' => '', 'mode' => 'ferme', 'message' => '', 'le' => ''];
}
function aled08e_vac_en_cours($v) {
    if (empty($v['actif'])) return false;
    $auj = wp_date('Y-m-d');
    return !(($v['debut'] && $auj < $v['debut']) || ($v['fin'] && $auj > $v['fin']));
}

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_vacances'])) return;
    $back = function ($m) { wp_safe_redirect(aled08e_url(['mv' => $m]) . '#vacances', 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_vac'] ?? '')), 'aled08e_vacances')) $back('erreur');
    $uid = get_current_user_id();
    if (!aled08e_est_boutique($uid)) $back('erreur');
    $P = wp_unslash($_POST);
    $date = function ($d) { $d = (string) $d; return preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) ? $d : ''; };
    $v = [
        'actif' => sanitize_key((string) ($P['aled08e_vacances'] ?? '')) === 'activer',
        'debut' => $date($P['debut'] ?? ''),
        'fin' => $date($P['fin'] ?? ''),
        'mode' => ($P['mode'] ?? '') === 'retard' ? 'retard' : 'ferme',
        'message' => mb_substr(sanitize_textarea_field((string) ($P['message'] ?? '')), 0, 400),
    ];
    if ($v['actif'] && $v['debut'] && $v['fin'] && $v['fin'] < $v['debut']) $back('dates');
    $r = aled08e_lia_appel($uid, 'vacances_regler', $v);
    if (is_wp_error($r)) $back('injoignable');
    $v['le'] = current_time('mysql');
    update_user_meta($uid, 'aled08_vacances', $v);
    $u = wp_get_current_user();
    wp_mail(aled08e_to(), 'Mode vacances ' . ($v['actif'] ? 'activé' : 'arrêté') . ' : ' . $u->display_name,
        $u->display_name . ($v['actif'] ? ' a activé le mode vacances de sa boutique, du ' . ($v['debut'] ?: 'jour même') . ' au ' . ($v['fin'] ?: '(sans date de fin)') . ' (' . ($v['mode'] === 'retard' ? 'commandes acceptées, expédition au retour' : 'boutique fermée') . ').' : ' a arrêté le mode vacances de sa boutique.') . "\n", aled08e_mail_headers());
    $back($v['actif'] ? 'actif' : 'arrete');
}, 5);

function aled08e_vacances_html($uid) {
    $v = aled08e_vac_get($uid);
    $en = aled08e_vac_en_cours($v);
    $mv = isset($_GET['mv']) ? sanitize_key(wp_unslash($_GET['mv'])) : '';
    $msgs = [
        'actif' => ['esp-empty', 'C’est enregistré : le mode vacances est programmé sur votre boutique.'],
        'arrete' => ['esp-empty', 'Le mode vacances est arrêté : votre boutique fonctionne normalement.'],
        'dates' => ['esp-warn', 'La date de retour est avant la date de départ.'],
        'injoignable' => ['esp-warn', 'Votre site n’a pas répondu : rien n’a changé. Réessayez dans un instant, ou écrivez à Alex.'],
        'erreur' => ['esp-warn', 'Ça n’a pas marché. Rechargez la page et réessayez.'],
    ];
    $fr = function ($d) { return $d ? wp_date('j F Y', strtotime($d . ' 12:00')) : ''; };
    $etat = !$v['actif'] ? ['st-done', 'Boutique ouverte'] : ($en ? ['st-doing', 'En vacances en ce moment'] : ['st-new', 'Vacances programmées']);
    $defaut = $v['mode'] === 'retard' ? 'Nous sommes en congés. Vous pouvez commander : votre colis partira dès notre retour.' : 'La boutique est en pause pour congés. Les commandes reprennent à notre retour. Merci de votre patience !';
    ob_start();
    ?>
<h2 class="app-h">Mode vacances</h2>
<?php if (isset($msgs[$mv])) echo '<p class="' . esc_attr($msgs[$mv][0]) . '" role="status">' . esc_html($msgs[$mv][1]) . '</p>'; ?>
<p class="app-p">Vous partez ? Mettez votre boutique en pause pour les dates de votre choix. Un bandeau prévient vos visiteurs, et tout repart seul à la date de retour. Ça ne compte pas dans vos modifications.</p>
<div class="vac-etat"><em class="st <?php echo esc_attr($etat[0]); ?>"><?php echo esc_html($etat[1]); ?></em><?php if ($v['actif']) echo '<span>' . esc_html(($v['debut'] ? 'Du ' . $fr($v['debut']) : 'Dès maintenant') . ($v['fin'] ? ' au ' . $fr($v['fin']) . ' inclus' : ', sans date de retour') . ' · ' . ($v['mode'] === 'retard' ? 'commandes acceptées, expédition au retour' : 'commandes fermées')) . '</span>'; ?></div>
<form class="form esp-form vac-form" method="post" action="<?php echo esc_url(aled08e_url()); ?>">
  <?php wp_nonce_field('aled08e_vacances', '_aled08e_vac'); ?>
  <div class="esp-grid2">
    <div class="field"><label for="vac-debut">Départ (premier jour fermé)</label><input id="vac-debut" type="date" name="debut" value="<?php echo esc_attr($v['debut']); ?>" min="<?php echo esc_attr(wp_date('Y-m-d')); ?>"><small class="field-hint">Vide : dès maintenant</small></div>
    <div class="field"><label for="vac-fin">Retour (dernier jour fermé)</label><input id="vac-fin" type="date" name="fin" value="<?php echo esc_attr($v['fin']); ?>" min="<?php echo esc_attr(wp_date('Y-m-d')); ?>"><small class="field-hint">Vide : jusqu’à ce que vous l’arrêtiez</small></div>
  </div>
  <fieldset class="req-par"><legend class="app-sub">Pendant vos vacances</legend>
    <label class="req-par-opt"><input type="radio" name="mode" value="ferme"<?php checked($v['mode'], 'ferme'); ?>><span><?php echo aled08e_icon('lock'); // phpcs:ignore ?><strong>Boutique fermée</strong><small>Vos produits restent visibles, mais personne ne peut commander.</small></span></label>
    <label class="req-par-opt"><input type="radio" name="mode" value="retard"<?php checked($v['mode'], 'retard'); ?>><span><?php echo aled08e_icon('package'); // phpcs:ignore ?><strong>Commandes acceptées</strong><small>On peut commander, et le bandeau prévient que l’expédition se fera à votre retour.</small></span></label>
  </fieldset>
  <div class="field"><label for="vac-msg">Message du bandeau (facultatif)</label><textarea id="vac-msg" name="message" rows="3" maxlength="400" placeholder="<?php echo esc_attr($defaut); ?>"><?php echo esc_textarea($v['message']); ?></textarea><small class="field-hint">Vide : un message simple, avec votre date de retour, est écrit pour vous.</small></div>
  <div class="ges-actions">
    <button class="btn btn-primary" type="submit" name="aled08e_vacances" value="activer"><?php echo aled08e_icon('calendar-check'); // phpcs:ignore ?><span><?php echo $v['actif'] ? 'Enregistrer les changements' : 'Activer le mode vacances'; ?></span></button>
    <?php if ($v['actif']) : ?><button class="btn btn-light" type="submit" name="aled08e_vacances" value="arreter"><?php echo aled08e_icon('x'); // phpcs:ignore ?><span>Arrêter, rouvrir la boutique</span></button><?php endif; ?>
  </div>
</form>
    <?php
    return ob_get_clean();
}
