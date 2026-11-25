<?php
/**
 * Le jeu-concours de Ruban, le petit monstre cadeau (demande d'Alex, 25 novembre 2026).
 *
 * Pendant un jeu, Ruban se cache dans l'espace client. Un client (ou un simple inscrit, sans achat) le trouve, clique dessus,
 * laisse son adresse e-mail et accepte le règlement (/jeu-concours/) : il participe. Quand Alex le demande, Claude ferme le
 * jeu et tire une personne au hasard (random_int) : elle gagne un Site Essentiel et un an de forfait Mini, offerts.
 *
 * Éteint par défaut. Tout se pilote par l'API, réservée aux administrateurs :
 *   GET  /aled08/v1/atelier/concours                         l'état, le nombre d'inscrits, la liste, les tirages passés
 *   POST /aled08/v1/atelier/concours { faire: ouvrir }       ouvre un nouveau jeu (cachette au choix : { cachette: "infos" })
 *   POST /aled08/v1/atelier/concours { faire: cachette, cachette } change la cachette pendant le jeu
 *   POST /aled08/v1/atelier/concours { faire: fermer }       ferme le jeu et tire au sort le gagnant
 *   POST /aled08/v1/atelier/concours { faire: retirer }      nouveau tirage (le gagnant n'a pas répondu en 15 jours)
 * Aucun e-mail n'est envoyé au gagnant : Alex le prévient lui-même.
 * Les inscriptions sont effacées 3 mois après le tirage (règlement, article 8).
 */
defined('ABSPATH') || exit;

/* Les cachettes possibles : un endroit de l'espace client (sélecteur), avec son nom en clair */
function aled08e_concours_cachettes() {
    return [
        'infos' => ['#t-compte [data-sm-part="infos"]', 'Mon compte, rubrique « Mes infos »'],
        'forfait' => ['#t-compte [data-sm-part="forfait"]', 'Mon compte, rubrique « Mon forfait »'],
        'factures' => ['#t-compte [data-sm-part="factures"]', 'Mon compte, rubrique « Factures »'],
        'accueil' => ['#t-accueil', 'l’accueil de l’espace client'],
        'stats' => ['#t-stats', 'Mon site, Statistiques'],
        'modifications' => ['#t-demandes', 'Mon site, Modifications'],
    ];
}
function aled08e_concours_etat() {
    $e = get_option('aled08_concours', []);
    return wp_parse_args(is_array($e) ? $e : [], ['id' => '', 'ouvert' => false, 'ouvert_le' => '', 'cachette' => 'infos', 'tirages' => []]);
}
function aled08e_concours_ouvert() { $e = aled08e_concours_etat(); return $e['ouvert'] && $e['id'] !== ''; }
function aled08e_concours_cle($id) { return 'aled08_concours_' . preg_replace('/[^a-z0-9_]/', '', (string) $id); }

/* Les participations d'un jeu : [user, nom, email, le], les comptes de l'équipe exclus */
function aled08e_concours_inscrits($id) {
    $cle = aled08e_concours_cle($id);
    $out = [];
    foreach (get_users(['meta_key' => $cle, 'fields' => 'all', 'number' => 5000]) as $u) {
        if (user_can($u, 'edit_posts')) continue;
        $p = get_user_meta($u->ID, $cle, true);
        if (!is_array($p) || empty($p['email'])) continue;
        $out[] = ['user' => (int) $u->ID, 'nom' => $u->display_name, 'email' => (string) $p['email'], 'le' => (string) ($p['le'] ?? '')];
    }
    return $out;
}

/* ---------- dans l'espace client : Ruban caché, puis la fenêtre d'inscription ---------- */
function aled08e_concours_html($u) {
    if (!aled08e_concours_ouvert() || !$u || user_can($u, 'edit_posts')) return '';
    $e = aled08e_concours_etat();
    $cach = aled08e_concours_cachettes();
    $sel = $cach[$e['cachette']][0] ?? $cach['infos'][0];
    $deja = get_user_meta($u->ID, aled08e_concours_cle($e['id']), true);
    $deja = is_array($deja) && !empty($deja['email']) ? (string) $deja['email'] : '';
    $D = aled08e_data();
    $prix = (float) ($D['creation']['prix'] ?? 0);
    $mini = 0; foreach ((array) ($D['forfaits'] ?? []) as $f) { $mini = (float) ($f['month'] ?? 0); break; }
    $regl = home_url('/jeu-concours/');
    ob_start();
    ?>
<button type="button" class="cc-ruban" data-cc-ruban data-cachette="<?php echo esc_attr($sel); ?>" aria-label="Un petit monstre cadeau se cache ici : ouvrir" hidden><?php echo aled08e_monster('ruban'); // phpcs:ignore ?></button>
<dialog class="cc-dialog" data-cc-dialog aria-labelledby="cc-titre">
  <form method="dialog" class="cc-fermer-f"><button class="cc-fermer" aria-label="Fermer"><?php echo aled08e_icon('x'); // phpcs:ignore ?></button></form>
  <div class="cc-art" aria-hidden="true"><?php echo aled08e_monster('ruban'); // phpcs:ignore ?></div>
  <h2 id="cc-titre">Bravo, vous avez trouvé Ruban !</h2>
  <p>Ruban garde un cadeau : <strong>un site internet offert</strong> (le Site Essentiel<?php echo $prix ? ', d’une valeur de ' . esc_html(aled08e_euro_txt($prix)) : ''; ?>) et <strong>un an de forfait Mini</strong><?php echo $mini ? ' (' . esc_html(aled08e_euro_txt($mini * 12)) . ')' : ''; ?>. Le site est à vous : vous le gardez, même après l’année offerte.</p>
  <div class="cc-deja" data-cc-deja<?php echo $deja === '' ? ' hidden' : ''; ?>>
    <p class="cc-ok"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span>Vous participez au tirage au sort avec l’adresse <b data-cc-mail><?php echo esc_html($deja); ?></b>. Bonne chance !</span></p>
  </div>
  <form class="cc-form" data-cc-form<?php echo $deja !== '' ? ' hidden' : ''; ?>>
    <input type="hidden" name="_cc" value="<?php echo esc_attr(wp_create_nonce('aled08e_concours')); ?>">
    <label class="cc-label" for="cc-mail">Votre adresse e-mail, pour vous prévenir si vous gagnez</label>
    <input class="cc-input" id="cc-mail" type="email" name="email" required autocomplete="email" value="<?php echo esc_attr($u->user_email); ?>">
    <label class="check cc-check"><input type="checkbox" name="accord" value="1" required><span>J’ai lu le <a href="<?php echo esc_url($regl); ?>" target="_blank" rel="noopener">règlement du jeu</a> et je l’accepte. Mon adresse sert seulement au tirage au sort.</span></label>
    <p class="cc-err" data-cc-err role="alert" hidden></p>
    <button class="btn btn-primary cc-go" type="submit"><?php echo aled08e_icon('gift'); // phpcs:ignore ?><span>Je participe</span></button>
  </form>
</dialog>
<script>
(function () {
  var b = document.querySelector('[data-cc-ruban]'), d = document.querySelector('[data-cc-dialog]');
  if (!b || !d) return;
  var cible = document.querySelector(b.getAttribute('data-cachette')) || document.querySelector('#t-compte') || document.querySelector('#t-accueil');
  if (cible) { cible.classList.add('cc-cachette'); cible.appendChild(b); b.hidden = false; }
  b.addEventListener('click', function () { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); });
  var f = d.querySelector('[data-cc-form]'), err = d.querySelector('[data-cc-err]');
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var go = f.querySelector('.cc-go'); go.disabled = true; err.hidden = true;
    var fd = new FormData(f); fd.append('action', 'aled08e_concours');
    fetch(<?php echo wp_json_encode(admin_url('admin-ajax.php')); ?>, { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        go.disabled = false;
        if (j && j.success) { d.querySelector('[data-cc-mail]').textContent = j.data.email; f.hidden = true; d.querySelector('[data-cc-deja]').hidden = false; }
        else { err.textContent = (j && j.data && j.data.message) || 'Ça n’a pas marché. Réessayez dans un instant.'; err.hidden = false; }
      })
      .catch(function () { go.disabled = false; err.textContent = 'Ça n’a pas marché. Réessayez dans un instant.'; err.hidden = false; });
  });
})();
</script>
<?php
    return ob_get_clean();
}

/* L'inscription : une par compte et par adresse, seulement pendant le jeu */
add_action('wp_ajax_aled08e_concours', function () {
    $non = function ($m) { wp_send_json_error(['message' => $m]); };
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_cc'] ?? '')), 'aled08e_concours')) $non('La page a expiré : rechargez-la, puis réessayez.');
    if (!aled08e_concours_ouvert()) $non('Le jeu est terminé. Merci d’avoir cherché Ruban !');
    $u = wp_get_current_user();
    if (!$u || !$u->ID || user_can($u, 'edit_posts')) $non('Ce compte ne peut pas participer.');
    if (empty($_POST['accord'])) $non('Cochez la case du règlement pour participer.');
    $email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
    if (!is_email($email)) $non('Cette adresse e-mail ne semble pas valable.');
    $e = aled08e_concours_etat();
    $cle = aled08e_concours_cle($e['id']);
    $deja = get_user_meta($u->ID, $cle, true);
    if (is_array($deja) && !empty($deja['email'])) wp_send_json_success(['email' => $deja['email']]);
    foreach (aled08e_concours_inscrits($e['id']) as $i) if (strtolower($i['email']) === strtolower($email)) $non('Cette adresse participe déjà au jeu.');
    update_user_meta($u->ID, $cle, ['email' => $email, 'le' => current_time('mysql')]);
    wp_send_json_success(['email' => $email]);
});

/* ---------- l'API d'Alex (par Claude) ---------- */
add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/concours', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function () {
        $e = aled08e_concours_etat();
        $l = $e['id'] !== '' ? aled08e_concours_inscrits($e['id']) : [];
        $c = aled08e_concours_cachettes();
        return new WP_REST_Response(['ouvert' => aled08e_concours_ouvert(), 'id' => $e['id'], 'ouvert_le' => $e['ouvert_le'], 'cachette' => $e['cachette'], 'cachette_texte' => $c[$e['cachette']][1] ?? '',
            'cachettes' => array_map(function ($x) { return $x[1]; }, $c), 'inscrits' => count($l), 'liste' => $l, 'tirages' => $e['tirages']], 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/concours', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_concours_faire']);
});
function aled08e_concours_tirer($id, $exclus = []) {
    $l = array_values(array_filter(aled08e_concours_inscrits($id), function ($i) use ($exclus) { return !in_array($i['user'], $exclus, true); }));
    if (!$l) return null;
    return $l[random_int(0, count($l) - 1)] + ['parmi' => count($l)];
}
function aled08e_concours_faire(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $faire = sanitize_key((string) ($p['faire'] ?? ''));
    $e = aled08e_concours_etat();
    $cach = aled08e_concours_cachettes();
    $cachette = sanitize_key((string) ($p['cachette'] ?? ''));
    if ($cachette !== '' && !isset($cach[$cachette])) return new WP_Error('aled08_concours', 'Cachette inconnue : ' . implode(', ', array_keys($cach)) . '.', ['status' => 400]);
    if ($faire === 'ouvrir') {
        if (aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Un jeu est déjà ouvert (' . $e['id'] . ').', ['status' => 409]);
        $e['id'] = 'c' . wp_date('Ymd_His');
        $e['ouvert'] = true;
        $e['ouvert_le'] = current_time('mysql');
        if ($cachette !== '') $e['cachette'] = $cachette;
        update_option('aled08_concours', $e, false);
        return new WP_REST_Response(['ok' => true, 'id' => $e['id'], 'cachette' => $cach[$e['cachette']][1]], 200);
    }
    if ($faire === 'cachette') {
        if ($cachette === '') return new WP_Error('aled08_concours', 'Donnez la cachette.', ['status' => 400]);
        $e['cachette'] = $cachette;
        update_option('aled08_concours', $e, false);
        return new WP_REST_Response(['ok' => true, 'cachette' => $cach[$cachette][1]], 200);
    }
    if ($faire === 'fermer' || $faire === 'retirer') {
        if ($e['id'] === '') return new WP_Error('aled08_concours', 'Aucun jeu n’a été ouvert.', ['status' => 409]);
        $exclus = [];
        if ($faire === 'retirer') {
            if (aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Le jeu est encore ouvert : fermez-le d’abord.', ['status' => 409]);
            foreach ($e['tirages'] as $t) if ($t['id'] === $e['id']) $exclus[] = (int) $t['user'];
        }
        $e['ouvert'] = false;
        $g = aled08e_concours_tirer($e['id'], $exclus);
        $t = ['id' => $e['id'], 'le' => current_time('mysql'), 'user' => $g ? $g['user'] : 0, 'nom' => $g ? $g['nom'] : '', 'email' => $g ? $g['email'] : '', 'parmi' => $g ? $g['parmi'] : 0, 'faire' => $faire];
        $e['tirages'][] = $t;
        update_option('aled08_concours', $e, false);
        if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Jeu-concours de Ruban : ' . ($faire === 'retirer' ? 'nouveau tirage' : 'tirage'), $g ? 'Gagnant tiré au sort parmi ' . $g['parmi'] . ' participations : ' . $g['nom'] . '.' : 'Aucune participation.', $g ? $g['user'] : 0, 'claude');
        return new WP_REST_Response(['ok' => true, 'ferme' => true, 'gagnant' => $g, 'note' => $g ? 'Gagnant tiré au hasard (random_int). Prévenez-le par e-mail : il a 15 jours pour répondre (règlement, article 7).' : 'Personne n’a participé.'], 200);
    }
    return new WP_Error('aled08_concours', 'À faire inconnu (ouvrir, cachette, fermer, retirer).', ['status' => 400]);
}

/* Le ménage : les inscriptions d'un jeu tiré depuis plus de 3 mois sont effacées (une fois par jour au plus) */
add_action('init', function () {
    if (get_transient('aled08e_concours_menage')) return;
    set_transient('aled08e_concours_menage', 1, DAY_IN_SECONDS);
    $e = aled08e_concours_etat();
    $vus = [];
    foreach ($e['tirages'] as $t) {
        if (isset($vus[$t['id']]) || $t['id'] === $e['id'] && aled08e_concours_ouvert()) continue;
        $vus[$t['id']] = 1;
        $der = '';
        foreach ($e['tirages'] as $x) if ($x['id'] === $t['id'] && $x['le'] > $der) $der = $x['le'];
        if ($der !== '' && strtotime($der) < current_time('timestamp') - 90 * DAY_IN_SECONDS) delete_metadata('user', 0, aled08e_concours_cle($t['id']), '', true);
    }
}, 45);
