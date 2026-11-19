<?php
/**
 * Les Minis Monstres Espace client : les outils de la boutique en ligne (onglet « Ma boutique »).
 * Codes promo, soldes rapides et bandeau d'annonce, réglés en quelques secondes par le client.
 * Tout passe par le connecteur de son site (actions boutique_lire, promo_creer, promo_supprimer,
 * soldes_regler, bandeau_regler). Ça ne compte pas dans les modifications du forfait.
 */
defined('ABSPATH') || exit;

/* État de la boutique (gardé 10 minutes, remis à jour après chaque réglage) */
function aled08e_bq_lire($uid, $frais = false) {
    $cle = 'aled08_bq_' . (int) $uid;
    if (!$frais) { $c = get_transient($cle); if (is_array($c)) return $c; }
    if (!aled08e_meta($uid, 'lia_url') || !aled08e_meta($uid, 'lia_secret')) return ['etat' => 'non_relie'];
    $r = aled08e_lia_appel($uid, 'boutique_lire', []);
    if (is_wp_error($r)) {
        $code = (int) ($r->get_error_data()['code'] ?? 0);
        return ['etat' => $code === 400 ? 'connecteur_ancien' : 'injoignable'];
    }
    $r['etat'] = empty($r['boutique']) ? 'sans_boutique' : 'ok';
    set_transient($cle, $r, 10 * MINUTE_IN_SECONDS);
    return $r;
}

add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_bq'])) return;
    $uid = get_current_user_id();
    $back = function ($ok, $texte) use ($uid) {
        if ($uid) set_transient('aled08_bq_flash_' . $uid, [$ok, $texte], 120);
        wp_safe_redirect(aled08e_url(['sub' => 'promos']) . '#vacances', 303); exit;
    };
    if (!$uid) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_bq'] ?? '')), 'aled08e_bq')) $back(false, 'La page avait expiré. Réessayez.');
    if (!aled08e_est_boutique($uid)) $back(false, 'Ces outils sont réservés aux boutiques en ligne.');
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) $P['aled08e_bq']);
    $date = function ($d) { $d = (string) $d; return preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) ? $d : ''; };
    $nb = function ($v) { return (float) str_replace([',', ' '], ['.', ''], (string) $v); };
    switch ($op) {
        case 'promo_creer':
            $args = [
                'code' => strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) ($P['code'] ?? ''))),
                'type' => ($P['type'] ?? '') === 'fixe' ? 'fixe' : 'pourcent',
                'montant' => $nb($P['montant'] ?? 0),
                'livraison' => !empty($P['livraison']),
                'minimum' => $nb($P['minimum'] ?? 0),
                'limite' => (int) ($P['limite'] ?? 0),
                'un_par_client' => !empty($P['un_par_client']),
                'fin' => $date($P['fin'] ?? ''),
            ];
            $ok = 'Le code ' . $args['code'] . ' est créé. Vos clients peuvent l’utiliser tout de suite.';
            break;
        case 'promo_supprimer':
            $args = ['id' => (int) ($P['id'] ?? 0)];
            $ok = 'Le code est supprimé.';
            break;
        case 'soldes':
            $args = ['actif' => ($P['etat'] ?? '') === 'on', 'pct' => (int) ($P['pct'] ?? 10), 'debut' => $date($P['debut'] ?? ''), 'fin' => $date($P['fin'] ?? ''), 'categorie' => (int) ($P['categorie'] ?? 0)];
            $op = 'soldes_regler';
            $ok = $args['actif'] ? 'Les soldes sont programmées. Les prix barrés apparaissent sur votre boutique.' : 'Les soldes sont arrêtées : les prix normaux sont revenus.';
            break;
        case 'bandeau':
            $args = ['actif' => ($P['etat'] ?? '') === 'on', 'message' => (string) ($P['message'] ?? ''), 'couleur' => sanitize_key((string) ($P['couleur'] ?? 'rose')), 'fin' => $date($P['fin'] ?? '')];
            $op = 'bandeau_regler';
            $ok = $args['actif'] ? 'Le bandeau est affiché en haut de votre site.' : 'Le bandeau est retiré.';
            break;
        default:
            $back(false, 'Action inconnue.');
    }
    $r = aled08e_lia_appel($uid, $op, $args);
    if (is_wp_error($r)) $back(false, (int) ($r->get_error_data()['code'] ?? 0) === 400 && strpos($r->get_error_message(), 'Action inconnue') !== false ? 'L’extension de votre site doit être mise à jour. On s’en occupe.' : $r->get_error_message());
    $r['etat'] = 'ok';
    set_transient('aled08_bq_' . $uid, $r, 10 * MINUTE_IN_SECONDS);
    $back(true, $ok);
}, 5);

function aled08e_boutique_html($uid) {
    $b = aled08e_bq_lire($uid);
    $flash = get_transient('aled08_bq_flash_' . $uid);
    if ($flash) delete_transient('aled08_bq_flash_' . $uid);
    $dev = ($b['devise'] ?? 'EUR') === 'EUR' ? '€' : ($b['devise'] ?? '€');
    $fr = function ($d) { return $d ? wp_date('j M Y', strtotime($d . ' 12:00')) : ''; };
    $nonce = wp_nonce_field('aled08e_bq', '_aled08e_bq', true, false);
    $auj = wp_date('Y-m-d');
    ob_start();
    ?>
<h2 class="app-h">Ma boutique</h2>
<?php $sub = aled08e_bg_sub(); echo aled08e_bg_flash_html($uid) . aled08e_bg_nav($sub); // phpcs:ignore ?>
<?php if ($sub === 'articles') : echo aled08e_articles_html($uid); // phpcs:ignore
elseif ($sub === 'prix') : echo aled08e_bg_prix_html($uid); // phpcs:ignore
elseif ($sub === 'paiements') : echo aled08e_bg_paiements_html($uid); // phpcs:ignore
elseif ($sub === 'livraison') : echo aled08e_bg_livraison_html($uid); // phpcs:ignore
elseif ($sub === 'commandes') : echo aled08e_bg_commandes_html($uid); // phpcs:ignore
else : ?>
<p class="app-p">Des petits outils de vente à régler vous-même en quelques secondes. Ils ne comptent pas dans vos modifications.</p>
<?php if ($flash) echo '<p class="' . ($flash[0] ? 'esp-empty' : 'esp-warn') . '" role="status">' . esc_html($flash[1]) . '</p>'; ?>
<?php if (($b['etat'] ?? '') !== 'ok') :
    $msg = ['non_relie' => 'Votre boutique n’est pas encore reliée à votre espace. On s’en occupe.', 'connecteur_ancien' => 'L’extension de votre site doit être mise à jour pour ces outils. On s’en occupe.', 'sans_boutique' => 'Aucune boutique WooCommerce n’a été trouvée sur votre site.'][$b['etat'] ?? ''] ?? 'Votre site ne répond pas pour le moment. Rechargez la page dans un instant.'; ?>
<p class="esp-warn"><?php echo esc_html($msg); ?></p>
<?php else :
    $so = $b['soldes']; $ba = $b['bandeau']; ?>
<div class="bq-grid">

  <section class="bq-card c-pink" id="bq-promo">
    <h3 class="bq-h"><span class="bq-ico"><?php echo aled08e_icon('badge-percent'); // phpcs:ignore ?></span>Codes promo</h3>
    <form class="form esp-form bq-form" method="post" action="<?php echo esc_url(aled08e_url()); ?>">
      <?php echo $nonce; // phpcs:ignore ?>
      <div class="esp-grid2">
        <div class="field"><label for="bq-code">Le code</label><input id="bq-code" name="code" required minlength="3" maxlength="20" pattern="[A-Za-z0-9-]{3,20}" placeholder="NOEL10" style="text-transform:uppercase" autocomplete="off"><small class="field-hint">Lettres et chiffres, sans espace</small></div>
        <div class="field"><label for="bq-montant">La réduction</label><div class="bq-inline"><input id="bq-montant" name="montant" type="number" min="1" max="500" step="0.5" value="10"><select name="type" aria-label="Type de réduction"><option value="pourcent">%</option><option value="fixe"><?php echo esc_html($dev); ?></option></select></div></div>
      </div>
      <label class="bq-check"><input type="checkbox" name="livraison" value="1"><span>Livraison offerte avec ce code</span></label>
      <details class="bq-plus"><summary>Plus d’options</summary>
        <div class="esp-grid2">
          <div class="field"><label for="bq-fin">Valable jusqu’au</label><input id="bq-fin" name="fin" type="date" min="<?php echo esc_attr($auj); ?>"><small class="field-hint">Vide : sans fin</small></div>
          <div class="field"><label for="bq-min">Commande minimum (<?php echo esc_html($dev); ?>)</label><input id="bq-min" name="minimum" type="number" min="0" step="1" placeholder="0"></div>
          <div class="field"><label for="bq-lim">Nombre d’utilisations</label><input id="bq-lim" name="limite" type="number" min="1" step="1" placeholder="Illimité"></div>
        </div>
        <label class="bq-check"><input type="checkbox" name="un_par_client" value="1"><span>Une seule fois par client</span></label>
      </details>
      <button class="btn btn-primary" type="submit" name="aled08e_bq" value="promo_creer"><?php echo aled08e_icon('plus'); // phpcs:ignore ?><span>Créer le code</span></button>
    </form>
    <?php if ($b['promos']) : ?>
    <ul class="bq-list">
      <?php foreach ($b['promos'] as $p) :
          $val = $p['type'] === 'percent' ? rtrim(rtrim(number_format($p['montant'], 2, ',', ''), '0'), ',') . ' %' : ($p['montant'] > 0 ? number_format($p['montant'], 2, ',', ' ') . ' ' . $dev : '');
          $det = array_filter([$val ? '-' . $val : '', $p['livraison'] ? 'livraison offerte' : '', $p['minimum'] > 0 ? 'dès ' . number_format($p['minimum'], 0, ',', ' ') . ' ' . $dev : '', $p['fin'] ? 'jusqu’au ' . $fr($p['fin']) : '']); ?>
      <li class="<?php echo $p['expire'] ? 'is-fini' : ''; ?>">
        <span class="bq-code"><?php echo esc_html($p['code']); ?></span>
        <span class="bq-det"><?php echo esc_html(implode(' · ', $det)); ?><small><?php echo $p['expire'] ? 'Terminé' : esc_html('Utilisé ' . (int) $p['utilise'] . ' fois' . ($p['limite'] ? ' sur ' . (int) $p['limite'] : '')); ?></small></span>
        <form method="post" action="<?php echo esc_url(aled08e_url()); ?>" onsubmit="return confirm('Supprimer le code <?php echo esc_js($p['code']); ?> ?')"><?php echo $nonce; // phpcs:ignore ?><input type="hidden" name="id" value="<?php echo (int) $p['id']; ?>"><button class="bq-x" type="submit" name="aled08e_bq" value="promo_supprimer" aria-label="Supprimer le code <?php echo esc_attr($p['code']); ?>"><?php echo aled08e_icon('x'); // phpcs:ignore ?></button></form>
      </li>
      <?php endforeach; ?>
    </ul>
    <?php else : ?><p class="esp-empty">Pas encore de code promo. Créez le premier ci-dessus.</p><?php endif; ?>
  </section>

  <section class="bq-card c-peach" id="bq-soldes">
    <h3 class="bq-h"><span class="bq-ico"><?php echo aled08e_icon('tag'); // phpcs:ignore ?></span>Soldes rapides <?php if (!empty($so['en_cours'])) echo '<em class="st st-doing">En cours</em>'; elseif (!empty($so['actif'])) echo '<em class="st st-new">Programmées</em>'; ?></h3>
    <p class="app-p">Un pourcentage sur toute la boutique ou une catégorie. Les prix barrés s’affichent tout seuls, et tout revient à la normale à la date de fin.</p>
    <form class="form esp-form bq-form" method="post" action="<?php echo esc_url(aled08e_url()); ?>">
      <?php echo $nonce; // phpcs:ignore ?>
      <div class="field"><label for="bq-pct">Réduction : <b data-bq-pct><?php echo (int) $so['pct']; ?> %</b></label><input id="bq-pct" name="pct" type="range" min="5" max="70" step="5" value="<?php echo (int) $so['pct']; ?>" oninput="this.form.querySelector('[data-bq-pct]').textContent=this.value+' %'"></div>
      <div class="field"><label for="bq-cat">Sur</label><select id="bq-cat" name="categorie"><option value="0">Toute la boutique</option><?php foreach ($b['categories'] as $c) echo '<option value="' . (int) $c['id'] . '"' . selected((int) $so['categorie'], (int) $c['id'], false) . '>' . esc_html($c['nom']) . '</option>'; ?></select></div>
      <div class="esp-grid2">
        <div class="field"><label for="bq-sd">Du</label><input id="bq-sd" name="debut" type="date" value="<?php echo esc_attr($so['debut']); ?>"><small class="field-hint">Vide : dès maintenant</small></div>
        <div class="field"><label for="bq-sf">Au (inclus)</label><input id="bq-sf" name="fin" type="date" value="<?php echo esc_attr($so['fin']); ?>" min="<?php echo esc_attr($auj); ?>"><small class="field-hint">Vide : jusqu’à ce que vous l’arrêtiez</small></div>
      </div>
      <input type="hidden" name="aled08e_bq" value="soldes">
      <div class="ges-actions">
        <button class="btn btn-primary" type="submit" name="etat" value="on"><?php echo aled08e_icon('zap'); // phpcs:ignore ?><span><?php echo !empty($so['actif']) ? 'Enregistrer' : 'Lancer les soldes'; ?></span></button>
        <?php if (!empty($so['actif'])) : ?><button class="btn btn-light" type="submit" name="etat" value="off"><?php echo aled08e_icon('x'); // phpcs:ignore ?><span>Arrêter</span></button><?php endif; ?>
      </div>
    </form>
  </section>

  <section class="bq-card c-sky" id="bq-bandeau">
    <h3 class="bq-h"><span class="bq-ico"><?php echo aled08e_icon('megaphone'); // phpcs:ignore ?></span>Bandeau d’annonce <?php if (!empty($ba['en_cours'])) echo '<em class="st st-doing">Affiché</em>'; ?></h3>
    <p class="app-p">Une phrase tout en haut de votre site : « Livraison offerte ce week-end », « Nouvelle collection en ligne »…</p>
    <form class="form esp-form bq-form" method="post" action="<?php echo esc_url(aled08e_url()); ?>">
      <?php echo $nonce; // phpcs:ignore ?>
      <div class="field"><label for="bq-msg">Le message</label><input id="bq-msg" name="message" maxlength="160" value="<?php echo esc_attr($ba['message']); ?>" placeholder="Livraison offerte jusqu’à dimanche !"></div>
      <fieldset class="bq-couleurs"><legend class="field-label">Couleur</legend>
        <?php foreach (['rose' => '#ffe1ea', 'vert' => '#dcf5e8', 'bleu' => '#dcecff', 'jaune' => '#fff4d6'] as $k => $hex) echo '<label><input type="radio" name="couleur" value="' . esc_attr($k) . '"' . checked($ba['couleur'], $k, false) . '><span style="background:' . esc_attr($hex) . '"></span>' . esc_html(ucfirst($k)) . '</label>'; ?>
      </fieldset>
      <div class="field"><label for="bq-bf">Jusqu’au (inclus)</label><input id="bq-bf" name="fin" type="date" value="<?php echo esc_attr($ba['fin']); ?>" min="<?php echo esc_attr($auj); ?>"><small class="field-hint">Vide : jusqu’à ce que vous le retiriez</small></div>
      <input type="hidden" name="aled08e_bq" value="bandeau">
      <div class="ges-actions">
        <button class="btn btn-primary" type="submit" name="etat" value="on"><?php echo aled08e_icon('megaphone'); // phpcs:ignore ?><span><?php echo !empty($ba['actif']) ? 'Enregistrer' : 'Afficher le bandeau'; ?></span></button>
        <?php if (!empty($ba['actif'])) : ?><button class="btn btn-light" type="submit" name="etat" value="off"><?php echo aled08e_icon('x'); // phpcs:ignore ?><span>Retirer</span></button><?php endif; ?>
      </div>
    </form>
  </section>

</div>
<?php endif; ?>
<div class="bq-vac" id="bq-vacances">
  <?php echo aled08e_vacances_html($uid); // phpcs:ignore ?>
</div>
<?php endif; // fin des rubriques de la boutique ?>
    <?php
    return ob_get_clean();
}
