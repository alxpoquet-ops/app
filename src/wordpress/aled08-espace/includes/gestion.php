<?php
/**
 * Alex & Lia Espace client : la gestion, pour l'administrateur.
 * Quand l'administrateur ouvre /mon-espace/, il voit ce tableau à la place de l'espace client :
 * les demandes à traiter, les clients, les commandes et sa liste de prospects.
 * Tout est réservé à la capacité manage_options ; rien n'est visible ni modifiable par un client.
 *
 * Prospects : la liste se remplit à la main. Rien n'est collecté ni envoyé automatiquement :
 * l'extension aide à chercher, garde la liste et prépare un message à copier.
 */
defined('ABSPATH') || exit;

const ALED08E_CPT_PROSPECT = 'aled08_prospect';

function aled08e_est_gerant() { return is_user_logged_in() && current_user_can('manage_options'); }

add_action('init', function () {
    register_post_type(ALED08E_CPT_PROSPECT, [
        'labels' => ['name' => 'Prospects', 'singular_name' => 'Prospect'],
        'public' => false, 'show_ui' => false, 'show_in_rest' => false, 'exclude_from_search' => true,
        'supports' => ['title'], 'capability_type' => 'post', 'capabilities' => aled08e_cpt_caps(), 'map_meta_cap' => true,
    ]);
}, 11);

function aled08e_prospect_statuts() {
    return [
        'a_contacter' => ['À contacter', 'st-new'],
        'contacte' => ['Contacté', 'st-doing'],
        'repondu' => ['A répondu', 'st-doing'],
        'client' => ['Devenu client', 'st-done'],
        'non' => ['Pas intéressé', 'esp-st-off'],
    ];
}

/* Passe une demande à un statut, garde la réponse et prévient le client quand c'est fait. */
function aled08e_demande_marquer($pid, $new, $rep = null) {
    $post = get_post($pid);
    if (!$post || $post->post_type !== ALED08E_CPT) return false;
    if (!isset(aled08e_statuts()[$new])) $new = 'recue';
    $old = get_post_meta($pid, '_aled08_statut', true) ?: 'recue';
    update_post_meta($pid, '_aled08_statut', $new);
    if ($rep !== null) update_post_meta($pid, '_aled08_reponse', $rep);
    $rep = (string) get_post_meta($pid, '_aled08_reponse', true);
    if ($new === 'faite' && $old !== 'faite') {
        update_post_meta($pid, '_aled08_faite_le', current_time('mysql'));
        $u = get_userdata($post->post_author);
        if ($u) {
            $corps = 'Bonjour ' . aled08e_prenom($u) . ",\n\n"
                . "Votre demande est faite et en ligne :\n« " . $post->post_title . " »\n\n"
                . ($rep ? $rep . "\n\n" : '')
                . "Vous retrouvez le suivi de vos demandes dans votre espace client :\n" . aled08e_url() . "#demandes\n\n"
                . "À bientôt,\nAlex, et Lia\n";
            wp_mail($u->user_email, 'Votre modification est en ligne', $corps, aled08e_mail_headers('Alex & Lia <' . aled08e_to() . '>'));
        }
    }
    return true;
}

/* Une adresse saisie à la main : on ne garde que du http(s). */
function aled08e_gestion_url($v) {
    $v = trim((string) $v);
    if ($v === '') return '';
    if (!preg_match('#^https?://#i', $v)) $v = 'https://' . $v;
    $v = esc_url_raw($v, ['http', 'https']);
    return $v && wp_parse_url($v, PHP_URL_HOST) ? $v : '';
}

/* ------------------------------------------------------------------ actions */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_gestion'])) return;
    if (!aled08e_est_gerant()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $P = wp_unslash($_POST);
    $quoi = sanitize_key($P['aled08e_gestion']);
    $onglet = in_array($quoi, ['demande'], true) ? 'accueil' : 'prospects';
    $back = function ($m) use ($onglet) { wp_safe_redirect(aled08e_url(['mg' => $m]) . '#' . $onglet, 303); exit; };
    if (!wp_verify_nonce(sanitize_text_field((string) ($P['_aled08e_gestion'] ?? '')), 'aled08e_gestion')) $back('erreur');

    if ($quoi === 'demande') {
        $pid = (int) ($P['id'] ?? 0);
        $rep = sanitize_textarea_field((string) ($P['reponse'] ?? ''));
        $ok = aled08e_demande_marquer($pid, sanitize_key((string) ($P['statut'] ?? '')), $rep);
        $back($ok ? 'demande_ok' : 'erreur');
    }

    if ($quoi === 'prospect_ajout') {
        $nom = sanitize_text_field((string) ($P['nom'] ?? ''));
        if ($nom === '') $back('nom_vide');
        $pid = wp_insert_post(['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'post_title' => mb_substr($nom, 0, 120), 'post_author' => get_current_user_id()], true);
        if (is_wp_error($pid) || !$pid) $back('erreur');
        update_post_meta($pid, '_p_activite', mb_substr(sanitize_text_field((string) ($P['activite'] ?? '')), 0, 80));
        update_post_meta($pid, '_p_ville', mb_substr(sanitize_text_field((string) ($P['ville'] ?? '')), 0, 80));
        update_post_meta($pid, '_p_source', aled08e_gestion_url($P['source'] ?? ''));
        update_post_meta($pid, '_p_contact', mb_substr(sanitize_text_field((string) ($P['contact'] ?? '')), 0, 200));
        update_post_meta($pid, '_p_note', mb_substr(sanitize_textarea_field((string) ($P['note'] ?? '')), 0, 600));
        update_post_meta($pid, '_p_statut', 'a_contacter');
        $back('prospect_ok');
    }

    $pid = (int) ($P['id'] ?? 0);
    $p = $pid ? get_post($pid) : null;
    if (!$p || $p->post_type !== ALED08E_CPT_PROSPECT) $back('erreur');

    if ($quoi === 'prospect_statut') {
        $s = sanitize_key((string) ($P['statut'] ?? ''));
        if (!isset(aled08e_prospect_statuts()[$s])) $back('erreur');
        update_post_meta($pid, '_p_statut', $s);
        if ($s === 'contacte' && !get_post_meta($pid, '_p_contacte_le', true)) update_post_meta($pid, '_p_contacte_le', current_time('mysql'));
        $back('statut_ok');
    }
    if ($quoi === 'prospect_suppr') {
        wp_delete_post($pid, true);
        $back('suppr_ok');
    }
    $back('erreur');
}, 5);

/* ------------------------------------------------------------------ message de premier contact */
function aled08e_prospect_message($nom, $activite, $ville) {
    $t = aled08e_type('une-page');
    $f = aled08e_forfait('chico');
    $quoi = $activite ? 'votre activité de ' . mb_strtolower($activite) : 'votre activité';
    if ($ville) $quoi .= ' à ' . $ville;
    return "Bonjour,\n\n"
        . 'Je suis tombé sur ' . $quoi . " en cherchant sur internet, et j'ai vu que vous n'aviez pas encore de site.\n\n"
        . 'Je crée des sites simples pour les indépendants : à partir de ' . aled08e_euro_txt($t ? $t['price'] : 250) . ', puis ' . aled08e_euro_txt($f['month']) . " par mois tout compris (hébergement, nom de domaine, mises à jour). Le prix est affiché avant de commander, et le forfait est sans engagement.\n\n"
        . "Si cela vous intéresse, tout est expliqué ici :\n" . home_url('/') . "\n\n"
        . "Et si ce n'est pas le moment, aucun souci : je ne vous relancerai pas.\n\n"
        . "Bonne journée,\nAlex, d'Alex & Lia\n";
}

/* ------------------------------------------------------------------ le tableau de gestion */
function aled08e_gestion($u) {
    $act = esc_url(aled08e_url());
    $nonce = wp_nonce_field('aled08e_gestion', '_aled08e_gestion', true, false);
    $st = aled08e_statuts();
    $pst = aled08e_prospect_statuts();
    $cst = aled08e_cmd_statuts();

    // demandes à traiter (tout ce qui n'est pas « faite »)
    $demandes = get_posts(['post_type' => ALED08E_CPT, 'post_status' => ['private', 'publish'], 'numberposts' => 60, 'orderby' => 'date', 'order' => 'ASC',
        'meta_query' => ['relation' => 'OR', ['key' => '_aled08_statut', 'compare' => 'NOT EXISTS'], ['key' => '_aled08_statut', 'value' => 'faite', 'compare' => '!=']]]);
    $clients = get_users(['role' => ALED08E_ROLE, 'orderby' => 'display_name', 'order' => 'ASC', 'number' => 300]);
    $cmds = aled08e_cmd_liste(['numberposts' => 40]);
    $cmdsVivantes = array_filter($cmds, function ($c) { return !in_array($c['statut'], ['en_ligne', 'annulee'], true); });
    $prospects = get_posts(['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => 300, 'orderby' => 'date', 'order' => 'DESC']);
    $pmeta = function ($p, $k) { return (string) get_post_meta($p->ID, '_p_' . $k, true); };
    $aContacter = count(array_filter($prospects, function ($p) use ($pmeta) { return ($pmeta($p, 'statut') ?: 'a_contacter') === 'a_contacter'; }));

    $mg = isset($_GET['mg']) ? sanitize_key(wp_unslash($_GET['mg'])) : '';
    $msgs = [
        'demande_ok' => ['esp-empty', 'Demande mise à jour.'],
        'prospect_ok' => ['esp-empty', 'Prospect ajouté à la liste.'],
        'statut_ok' => ['esp-empty', 'Prospect mis à jour.'],
        'suppr_ok' => ['esp-empty', 'Prospect retiré de la liste.'],
        'nom_vide' => ['esp-warn', 'Indiquez au moins le nom du prospect.'],
        'erreur' => ['esp-warn', 'Ça n’a pas marché. Rechargez la page et réessayez.'],
    ];
    $flash = isset($msgs[$mg]) ? '<p class="' . $msgs[$mg][0] . '" role="status">' . esc_html($msgs[$mg][1]) . '</p>' : '';
    $champ = function ($id, $label, $name, $ph = '', $type = 'text') {
        return '<div class="field"><label for="' . $id . '">' . esc_html($label) . '</label><input id="' . $id . '" name="' . $name . '" type="' . $type . '" placeholder="' . esc_attr($ph) . '"></div>';
    };

    ob_start();
    ?>
<section class="section section-app"><div class="container">
  <div class="app" data-espace data-gestion>
    <div class="app-shell">
      <aside class="app-side">
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small>Gestion Alex &amp; Lia</small></div></div>
        <div class="app-tabs" role="tablist" aria-label="Gestion">
          <?php echo aled08e_tab('accueil', 'house', 'À faire', true) . aled08e_tab('clients', 'users', 'Clients') . aled08e_tab('commandes', 'package', 'Commandes') . aled08e_tab('prospects', 'target', 'Prospects') . aled08e_tab('compte', 'circle-user', 'Mon compte'); // phpcs:ignore ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(admin_url()); ?>"><?php echo aled08e_icon('wrench'); // phpcs:ignore ?><span>Administration WordPress</span></a>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour <?php echo esc_html(aled08e_prenom($u)); ?> !</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <div class="app-cards ges-cards">
            <div class="app-card c-sky"><span class="app-card-ico"><?php echo aled08e_icon('message-circle'); // phpcs:ignore ?></span><span><small>Demandes à traiter</small><strong><?php echo count($demandes); ?></strong></span></div>
            <button type="button" class="app-card c-mint" data-go="commandes"><span class="app-card-ico"><?php echo aled08e_icon('package'); // phpcs:ignore ?></span><span><small>Commandes en cours</small><strong><?php echo count($cmdsVivantes); ?></strong></span></button>
            <button type="button" class="app-card c-lilac" data-go="clients"><span class="app-card-ico"><?php echo aled08e_icon('users'); // phpcs:ignore ?></span><span><small>Clients</small><strong><?php echo count($clients); ?></strong></span></button>
            <button type="button" class="app-card c-pink" data-go="prospects"><span class="app-card-ico"><?php echo aled08e_icon('target'); // phpcs:ignore ?></span><span><small>Prospects à contacter</small><strong><?php echo (int) $aContacter; ?></strong></span></button>
          </div>
          <p class="app-sub">Demandes de modification à traiter</p>
          <?php if (!$demandes) : ?>
          <p class="esp-empty">Rien à traiter pour le moment.</p>
          <?php else : ?>
          <ul class="ges-list">
            <?php foreach ($demandes as $p) :
                $s = get_post_meta($p->ID, '_aled08_statut', true) ?: 'recue';
                $c = get_userdata($p->post_author);
                $site = $c ? aled08e_meta($c->ID, 'site') : '';
                $par = get_post_meta($p->ID, '_aled08_par', true) === 'lia' ? 'Lia' : 'Alex';
                ?>
            <li class="ges-item">
              <div class="ges-head"><strong><?php echo esc_html($c ? $c->display_name : 'Client supprimé'); ?></strong><em class="st <?php echo esc_attr($st[$s][1] ?? 'st-new'); ?>"><?php echo esc_html($st[$s][0] ?? $s); ?></em></div>
              <p class="ges-meta">Pour <?php echo esc_html($par); ?>, le <?php echo esc_html(aled08e_date($p->post_date)); ?><?php if ($site) : ?> · <a href="<?php echo esc_url($site); ?>" target="_blank" rel="noopener"><?php echo esc_html(preg_replace('#^https?://(www\.)?#', '', untrailingslashit($site))); ?></a><?php endif; ?><?php if (get_post_meta($p->ID, '_aled08_hors_forfait', true)) echo ' · Boost 1 €'; ?></p>
              <p class="ges-text"><?php echo nl2br(esc_html($p->post_content ?: $p->post_title)); ?></p>
              <?php if (has_post_thumbnail($p)) echo '<a class="ges-photo" href="' . esc_url(get_the_post_thumbnail_url($p, 'full')) . '" target="_blank" rel="noopener">' . get_the_post_thumbnail($p, 'thumbnail', ['alt' => 'Photo jointe']) . '</a>'; // phpcs:ignore ?>
              <form class="ges-form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
                <input type="hidden" name="aled08e_gestion" value="demande"><input type="hidden" name="id" value="<?php echo (int) $p->ID; ?>"><?php echo $nonce; // phpcs:ignore ?>
                <label class="sr-only" for="rep-<?php echo (int) $p->ID; ?>">Un mot pour le client (facultatif)</label>
                <textarea id="rep-<?php echo (int) $p->ID; ?>" name="reponse" rows="2" placeholder="Un mot pour le client (facultatif)"><?php echo esc_textarea((string) get_post_meta($p->ID, '_aled08_reponse', true)); ?></textarea>
                <div class="ges-actions">
                  <?php if ($s !== 'encours') : ?><button class="btn btn-light btn-sm" type="submit" name="statut" value="encours"><?php echo aled08e_icon('clock'); // phpcs:ignore ?><span>En cours</span></button><?php endif; ?>
                  <button class="btn btn-primary btn-sm" type="submit" name="statut" value="faite"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span>Faite, prévenir le client</span></button>
                </div>
              </form>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-clients" aria-labelledby="tab-clients" hidden>
          <h2 class="app-h">Clients</h2>
          <div class="field ges-filter"><label for="ges-q">Chercher un client</label><input id="ges-q" type="search" placeholder="Nom, site, e-mail" data-ges-filter="#ges-clients"></div>
          <?php if (!$clients) : ?><p class="esp-empty">Aucun client pour le moment.</p><?php else : ?>
          <ul class="ges-list" id="ges-clients">
            <?php foreach ($clients as $c) :
                $fid = aled08e_meta($c->ID, 'forfait');
                $f = $fid ? aled08e_forfait($fid) : null;
                $site = aled08e_meta($c->ID, 'site');
                $tel = aled08e_meta($c->ID, 'telephone');
                $util = $f ? aled08e_count_month($c->ID, 'alex') + aled08e_count_month($c->ID, 'lia') : 0;
                ?>
            <li class="ges-item" data-ges-text="<?php echo esc_attr(mb_strtolower($c->display_name . ' ' . $site . ' ' . $c->user_email)); ?>">
              <div class="ges-head"><strong><?php echo esc_html($c->display_name); ?></strong><?php if ($f) : ?><em class="st st-done"><?php echo esc_html($f['name']); ?><?php echo aled08e_meta($c->ID, 'offert') === '1' ? ', offert' : ''; ?></em><?php else : ?><em class="st esp-st-off">Sans forfait</em><?php endif; ?></div>
              <p class="ges-meta"><?php if ($site) : ?><a href="<?php echo esc_url($site); ?>" target="_blank" rel="noopener"><?php echo esc_html(preg_replace('#^https?://(www\.)?#', '', untrailingslashit($site))); ?></a> · <?php endif; ?><?php if ($f) echo (int) $util . ' / ' . (int) $f['quota'] . ' modification' . ((int) $f['quota'] > 1 ? 's' : '') . ' ce mois · '; ?>client depuis le <?php echo esc_html(aled08e_date($c->user_registered)); ?></p>
              <div class="ges-actions">
                <a class="btn btn-light btn-sm" href="mailto:<?php echo esc_attr($c->user_email); ?>"><?php echo aled08e_icon('mail'); // phpcs:ignore ?><span><?php echo esc_html($c->user_email); ?></span></a>
                <?php if ($tel) : ?><a class="btn btn-light btn-sm" href="tel:<?php echo esc_attr(preg_replace('/[^0-9+]/', '', $tel)); ?>"><?php echo aled08e_icon('phone'); // phpcs:ignore ?><span><?php echo esc_html($tel); ?></span></a><?php endif; ?>
                <a class="btn btn-light btn-sm" href="<?php echo esc_url(admin_url('user-edit.php?user_id=' . (int) $c->ID)); ?>"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Fiche</span></a>
              </div>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-commandes" aria-labelledby="tab-commandes" hidden>
          <h2 class="app-h">Commandes</h2>
          <?php if (!$cmds) : ?><p class="esp-empty">Aucune commande pour le moment.</p><?php else : ?>
          <ul class="ges-list">
            <?php foreach ($cmds as $c) :
                $t = aled08e_type($c['type']);
                $s = $cst[$c['statut']] ?? [$c['statut'], 'st-new'];
                ?>
            <li class="ges-item">
              <div class="ges-head"><strong><?php echo esc_html(aled08e_cmd_nom($c)); ?></strong><em class="st <?php echo esc_attr($s[1]); ?>"><?php echo esc_html($s[0]); ?></em></div>
              <p class="ges-meta"><?php echo esc_html($c['ref']); ?> · <?php echo esc_html($t ? $t['name'] : $c['type']); ?> · forfait <?php echo esc_html(aled08e_forfait($c['forfait'])['name']); ?><?php if ($c['domaine']) echo ' · ' . esc_html($c['domaine']); ?> · le <?php echo esc_html(aled08e_date($c['date'])); ?></p>
              <p class="ges-meta">Création <?php echo aled08e_euro($c['montants']['creation']); // phpcs:ignore ?>, acompte <?php echo aled08e_euro($c['montants']['acompte']); // phpcs:ignore ?><?php if (aled08e_cmd_reception_due($c)) echo ', <b>reste ' . aled08e_euro($c['montants']['solde']) . ' à régler</b>'; // phpcs:ignore ?></p>
              <div class="ges-actions"><a class="btn btn-light btn-sm" href="<?php echo esc_url(aled08e_cmd_admin_url($c['id'])); ?>"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Ouvrir la commande</span></a></div>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-prospects" aria-labelledby="tab-prospects" hidden>
          <h2 class="app-h">Prospects</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <p class="app-p">Des indépendants actifs sur internet mais sans site. Vous les cherchez, vous les notez ici, et vous leur écrivez vous-même, un par un.</p>

          <div class="esp-form ges-find">
            <p class="app-sub"><?php echo aled08e_icon('search'); // phpcs:ignore ?> 1. Chercher</p>
            <div class="esp-grid2">
              <div class="field"><label for="ges-metier">Métier</label><input id="ges-metier" type="text" placeholder="coiffeuse à domicile" data-ges-metier></div>
              <div class="field"><label for="ges-ville">Ville ou secteur</label><input id="ges-ville" type="text" placeholder="Charleville-Mézières" data-ges-ville></div>
            </div>
            <div class="ges-actions" data-ges-liens>
              <a class="btn btn-light btn-sm" target="_blank" rel="noopener" data-ges-lien="https://www.google.com/maps/search/{q}"><?php echo aled08e_icon('map-pin'); // phpcs:ignore ?><span>Google Maps</span></a>
              <a class="btn btn-light btn-sm" target="_blank" rel="noopener" data-ges-lien="https://www.facebook.com/search/pages/?q={q}"><?php echo aled08e_icon('users'); // phpcs:ignore ?><span>Pages Facebook</span></a>
              <a class="btn btn-light btn-sm" target="_blank" rel="noopener" data-ges-lien="https://www.google.com/search?q={q}+site%3Ainstagram.com"><?php echo aled08e_icon('camera'); // phpcs:ignore ?><span>Instagram</span></a>
              <a class="btn btn-light btn-sm" target="_blank" rel="noopener" data-ges-lien="https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui={m}&amp;ou={v}"><?php echo aled08e_icon('search'); // phpcs:ignore ?><span>Pages Jaunes</span></a>
            </div>
            <ul class="ges-tips">
              <li><b>Sur Google Maps :</b> une fiche avec des avis récents et des photos, mais sans bouton « Site Web », c’est un bon prospect.</li>
              <li><b>Sur Facebook ou Instagram :</b> des publications ce mois-ci, et aucun site dans la présentation.</li>
              <li><b>À laisser de côté :</b> une page à l’abandon, ou quelqu’un qui a déjà un site, même ancien.</li>
            </ul>
          </div>

          <form class="form esp-form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
            <input type="hidden" name="aled08e_gestion" value="prospect_ajout"><?php echo $nonce; // phpcs:ignore ?>
            <p class="app-sub"><?php echo aled08e_icon('plus'); // phpcs:ignore ?> 2. Noter un prospect</p>
            <div class="esp-grid2">
              <?php echo $champ('pr-nom', 'Nom ou enseigne', 'nom', 'Coiffure Marie') . $champ('pr-act', 'Activité', 'activite', 'coiffeuse à domicile') . $champ('pr-ville', 'Ville', 'ville', 'Sedan') . $champ('pr-src', 'Où je l’ai trouvé (lien)', 'source', 'facebook.com/…') . $champ('pr-contact', 'Comment le joindre', 'contact', 'formulaire, e-mail, messagerie'); // phpcs:ignore ?>
              <div class="field"><label for="pr-note">Note</label><input id="pr-note" name="note" type="text" placeholder="12 avis, publie chaque semaine"></div>
            </div>
            <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('plus'); // phpcs:ignore ?><span>Ajouter à la liste</span></button>
          </form>

          <p class="app-sub"><?php echo aled08e_icon('send'); // phpcs:ignore ?> 3. Ma liste (<?php echo count($prospects); ?>)</p>
          <?php if (!$prospects) : ?><p class="esp-empty">La liste est vide. Cherchez un métier et une ville, puis notez ici ceux qui n’ont pas de site.</p><?php else : ?>
          <div class="field ges-filter"><label for="ges-pq">Filtrer la liste</label><input id="ges-pq" type="search" placeholder="Nom, ville, statut" data-ges-filter="#ges-prospects"></div>
          <ul class="ges-list" id="ges-prospects">
            <?php foreach ($prospects as $p) :
                $s = $pmeta($p, 'statut') ?: 'a_contacter';
                $s = isset($pst[$s]) ? $s : 'a_contacter';
                $actv = $pmeta($p, 'activite'); $ville = $pmeta($p, 'ville'); $src = $pmeta($p, 'source'); $contact = $pmeta($p, 'contact'); $note = $pmeta($p, 'note');
                $le = $pmeta($p, 'contacte_le');
                $mid = 'msg-' . (int) $p->ID;
                ?>
            <li class="ges-item" data-ges-text="<?php echo esc_attr(mb_strtolower($p->post_title . ' ' . $actv . ' ' . $ville . ' ' . $pst[$s][0])); ?>">
              <div class="ges-head"><strong><?php echo esc_html($p->post_title); ?></strong><em class="st <?php echo esc_attr($pst[$s][1]); ?>"><?php echo esc_html($pst[$s][0]); ?></em></div>
              <p class="ges-meta"><?php echo esc_html(implode(' · ', array_filter([$actv, $ville, $le ? 'contacté le ' . aled08e_date($le) : '']))); ?></p>
              <?php if ($contact) : ?><p class="ges-meta">Le joindre : <?php echo esc_html($contact); ?></p><?php endif; ?>
              <?php if ($note) : ?><p class="ges-text"><?php echo esc_html($note); ?></p><?php endif; ?>
              <details class="ges-msg"><summary>Message prêt à copier</summary>
                <textarea id="<?php echo esc_attr($mid); ?>" rows="9" readonly><?php echo esc_textarea(aled08e_prospect_message($p->post_title, $actv, $ville)); ?></textarea>
                <button type="button" class="btn btn-light btn-sm" data-ges-copie="#<?php echo esc_attr($mid); ?>"><?php echo aled08e_icon('clipboard-check'); // phpcs:ignore ?><span>Copier le message</span></button>
              </details>
              <form class="ges-actions" method="post" action="<?php echo $act; // phpcs:ignore ?>">
                <input type="hidden" name="id" value="<?php echo (int) $p->ID; ?>"><?php echo $nonce; // phpcs:ignore ?>
                <?php if ($src) : ?><a class="btn btn-light btn-sm" href="<?php echo esc_url($src); ?>" target="_blank" rel="noopener noreferrer"><?php echo aled08e_icon('globe'); // phpcs:ignore ?><span>Voir sa page</span></a><?php endif; ?>
                <?php foreach ($pst as $k => $v) : if ($k === $s) continue; ?>
                <button class="btn btn-light btn-sm" type="submit" name="statut" value="<?php echo esc_attr($k); ?>" formaction="<?php echo $act; // phpcs:ignore ?>" data-ges-quoi="prospect_statut"><?php echo esc_html($v[0]); ?></button>
                <?php endforeach; ?>
                <button class="btn btn-light btn-sm ges-suppr" type="submit" data-ges-quoi="prospect_suppr" data-ges-confirm="Retirer ce prospect de la liste ?"><?php echo aled08e_icon('x'); // phpcs:ignore ?><span>Retirer</span></button>
                <input type="hidden" name="aled08e_gestion" value="prospect_statut">
              </form>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
          <p class="app-note">Un seul message par personne, sans relance, et uniquement pour son activité professionnelle. Si quelqu’un répond non, passez-le en « Pas intéressé » pour ne jamais lui réécrire.</p>
        </div>

        <div class="app-panel" role="tabpanel" id="t-compte" aria-labelledby="tab-compte" hidden>
          <?php echo aled08e_panel_compte($u); // phpcs:ignore ?>
        </div>
      </div>
    </div>
  </div>
</div></section>
<script>
(function () {
  var app = document.querySelector('[data-gestion]');
  if (!app) return;
  var all = function (s, r) { return Array.prototype.slice.call((r || app).querySelectorAll(s)); };
  // filtre des listes
  all('[data-ges-filter]').forEach(function (inp) {
    var list = app.querySelector(inp.getAttribute('data-ges-filter'));
    if (!list) return;
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase();
      all('[data-ges-text]', list).forEach(function (li) { li.hidden = q !== '' && li.getAttribute('data-ges-text').indexOf(q) === -1; });
    });
  });
  // liens de recherche : métier + ville
  var metier = app.querySelector('[data-ges-metier]'), ville = app.querySelector('[data-ges-ville]');
  var liens = function () {
    var m = encodeURIComponent((metier.value || '').trim()), v = encodeURIComponent((ville.value || '').trim());
    var q = encodeURIComponent(((metier.value || '') + ' ' + (ville.value || '')).trim());
    all('[data-ges-lien]').forEach(function (a) {
      if (!q) { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); return; }
      a.removeAttribute('aria-disabled');
      a.href = a.getAttribute('data-ges-lien').replace('{q}', q).replace('{m}', m).replace('{v}', v);
    });
  };
  if (metier && ville) { metier.addEventListener('input', liens); ville.addEventListener('input', liens); liens(); }
  // copie du message
  all('[data-ges-copie]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = app.querySelector(b.getAttribute('data-ges-copie'));
      if (!t) return;
      var fin = function () { var s = b.querySelector('span'), old = s.textContent; s.textContent = 'Copié !'; setTimeout(function () { s.textContent = old; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(fin, function () { t.select(); document.execCommand('copy'); fin(); });
      else { t.select(); document.execCommand('copy'); fin(); }
    });
  });
  // boutons d'un prospect : le bouton cliqué dit quelle action envoyer
  all('[data-ges-quoi]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      var msg = b.getAttribute('data-ges-confirm');
      if (msg && !window.confirm(msg)) { e.preventDefault(); return; }
      b.form.querySelector('[name="aled08e_gestion"]').value = b.getAttribute('data-ges-quoi');
    });
  });
})();
</script>
    <?php
    return ob_get_clean();
}
