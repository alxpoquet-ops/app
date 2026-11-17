<?php
/**
 * Les Minis Monstres Espace client : la gestion, pour l'administrateur.
 * Quand l'administrateur ouvre /mon-espace/, il voit ce tableau à la place de l'espace client :
 * les demandes à faire (préparées par Cerise), les clients, les commandes et les annonces.
 * Tout est réservé à la capacité manage_options ; rien n'est visible ni modifiable par un client.
 *
 * (La recherche de prospects a été retirée le 17 novembre 2026 ; le type de contenu reste déclaré pour ne rien perdre.)
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

const ALED08E_CPT_ANNONCE = 'aled08_annonce';
add_action('init', function () {
    register_post_type(ALED08E_CPT_ANNONCE, [
        'labels' => ['name' => 'Annonces', 'singular_name' => 'Annonce'],
        'public' => false, 'show_ui' => false, 'show_in_rest' => false, 'exclude_from_search' => true,
        'supports' => ['title', 'editor'], 'capability_type' => 'post', 'capabilities' => aled08e_cpt_caps(), 'map_meta_cap' => true,
    ]);
}, 11);

/* Les dernières annonces, montrées en haut de l'espace de chaque client (texte simple, écrit par l'administrateur). */
function aled08e_annonces($max = 3) {
    return get_posts(['post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'numberposts' => (int) $max, 'orderby' => 'date', 'order' => 'DESC', 'suppress_filters' => true]);
}
function aled08e_annonces_html($max = 3) {
    $l = aled08e_annonces($max);
    if (!$l) return '';
    $h = '<div class="esp-annonces" role="region" aria-label="Dernières infos"><p class="app-sub">' . aled08e_icon('megaphone') . ' Dernières infos</p><ul>';
    foreach ($l as $p) {
        $h .= '<li><strong>' . esc_html($p->post_title) . '</strong><small>' . esc_html(aled08e_date($p->post_date)) . '</small>'
            . ($p->post_content !== '' ? '<p>' . nl2br(esc_html($p->post_content)) . '</p>' : '') . '</li>';
    }
    return $h . '</ul></div>';
}

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
                . "À bientôt,\nAlex et sa petite bande\n";
            wp_mail($u->user_email, 'Votre modification est en ligne', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
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
    $onglet = strpos($quoi, 'annonce') === 0 ? 'annonces' : 'accueil';
    $back = function ($m) use ($onglet) { wp_safe_redirect(aled08e_url(['mg' => $m]) . '#' . $onglet, 303); exit; };
    if (!wp_verify_nonce(sanitize_text_field((string) ($P['_aled08e_gestion'] ?? '')), 'aled08e_gestion')) $back('erreur');

    if ($quoi === 'demande') {
        $pid = (int) ($P['id'] ?? 0);
        $rep = trim(sanitize_textarea_field((string) ($P['reponse'] ?? '')));
        $new = sanitize_key((string) ($P['statut'] ?? ''));
        if ($rep === '') $rep = $new === 'faite' ? 'C’est fait ! Votre modification est en ligne.' : ($new === 'encours' ? 'Alex a commencé votre demande.' : null);
        if ($new === 'encours') update_post_meta($pid, '_aled08_commencee_le', time());
        $ok = aled08e_demande_marquer($pid, $new, $rep);
        $back($ok ? 'demande_ok' : 'erreur');
    }

    if ($quoi === 'annonce_ajout') {
        $titre = sanitize_text_field((string) ($P['titre'] ?? ''));
        $texte = sanitize_textarea_field((string) ($P['texte'] ?? ''));
        if ($titre === '') $back('titre_vide');
        $pid = wp_insert_post(['post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'post_title' => mb_substr($titre, 0, 120), 'post_content' => mb_substr($texte, 0, 1500), 'post_author' => get_current_user_id()], true);
        $back(is_wp_error($pid) || !$pid ? 'erreur' : 'annonce_ok');
    }
    if ($quoi === 'annonce_suppr') {
        $a = get_post((int) ($P['id'] ?? 0));
        if (!$a || $a->post_type !== ALED08E_CPT_ANNONCE) $back('erreur');
        wp_delete_post($a->ID, true);
        $back('annonce_suppr');
    }

    $back('erreur');
}, 5);

/* ------------------------------------------------------------------ le tableau de gestion */
function aled08e_gestion($u) {
    $act = esc_url(aled08e_url());
    $nonce = wp_nonce_field('aled08e_gestion', '_aled08e_gestion', true, false);
    $st = aled08e_statuts();
    $cst = aled08e_cmd_statuts();

    // demandes à traiter (tout ce qui n'est pas « faite »)
    $demandes = get_posts(['post_type' => ALED08E_CPT, 'post_status' => ['private', 'publish'], 'numberposts' => 60, 'orderby' => 'date', 'order' => 'ASC',
        'meta_query' => ['relation' => 'OR', ['key' => '_aled08_statut', 'compare' => 'NOT EXISTS'], ['key' => '_aled08_statut', 'value' => ['faite', 'annulee'], 'compare' => 'NOT IN']]]);
    $clients = get_users(['role' => ALED08E_ROLE, 'orderby' => 'display_name', 'order' => 'ASC', 'number' => 300]);
    $cmds = aled08e_cmd_liste(['numberposts' => 40]);
    $cmdsVivantes = array_filter($cmds, function ($c) { return !in_array($c['statut'], ['en_ligne', 'annulee'], true); });

    $mg = isset($_GET['mg']) ? sanitize_key(wp_unslash($_GET['mg'])) : '';
    $msgs = [
        'demande_ok' => ['esp-empty', 'Demande mise à jour.'],
        'annonce_ok' => ['esp-empty', 'Annonce publiée : vos clients la voient en haut de leur espace.'],
        'annonce_suppr' => ['esp-empty', 'Annonce retirée.'],
        'titre_vide' => ['esp-warn', 'Donnez un titre à votre annonce.'],
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
        <div class="app-user"><?php echo aled08e_monster('mascotte'); // phpcs:ignore ?><div><strong><?php echo esc_html($u->display_name); ?></strong><small>Gestion des Minis Monstres</small></div></div>
        <div class="app-tabs" role="tablist" aria-label="Gestion">
          <?php echo aled08e_tab('accueil', 'house', 'À faire', true) . aled08e_tab('suivi', 'history', 'Demandes'). aled08e_tab('clients', 'users', 'Clients') . aled08e_tab('commandes', 'package', 'Commandes') . aled08e_tab('annonces', 'megaphone', 'Annonces') . aled08e_tab('compte', 'circle-user', 'Mon compte'); // phpcs:ignore ?>
        </div>
        <a class="app-logout" href="<?php echo esc_url(admin_url()); ?>"><?php echo aled08e_icon('wrench'); // phpcs:ignore ?><span>Administration WordPress</span></a>
        <a class="app-logout" href="<?php echo esc_url(wp_logout_url(aled08e_url())); ?>"><?php echo aled08e_icon('log-out'); // phpcs:ignore ?><span>Me déconnecter</span></a>
      </aside>
      <div class="app-main">

        <div class="app-panel" role="tabpanel" id="t-accueil" aria-labelledby="tab-accueil">
          <h2 class="app-h">Bonjour <?php echo esc_html(aled08e_prenom($u)); ?> !</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <?php
          // chez Alex : les demandes transmises par Cerise (et les pages SEO de Lumi), les Maxi d'abord, puis par échéance
          $aFaire = array_values(array_filter($demandes, function ($p) { return get_post_meta($p->ID, '_aled08_par', true) !== 'lia'; }));
          $chezCerise = array_values(array_filter($demandes, function ($p) { return get_post_meta($p->ID, '_aled08_par', true) === 'lia'; }));
          $ech = function ($p) { return (int) get_post_meta($p->ID, '_aled08_echeance', true) ?: strtotime($p->post_date_gmt . ' UTC') + 7 * DAY_IN_SECONDS; };
          usort($aFaire, function ($a, $b) use ($ech) {
              $pa = get_post_meta($a->ID, '_aled08_priorite', true) ? 0 : 1; $pb = get_post_meta($b->ID, '_aled08_priorite', true) ? 0 : 1;
              return $pa !== $pb ? $pa - $pb : $ech($a) - $ech($b);
          });
          $nRetard = count(array_filter($aFaire, function ($p) use ($ech) { return $ech($p) < time(); }));
          ?>
          <div class="app-cards ges-cards">
            <div class="app-card c-sky"><span class="app-card-ico"><?php echo aled08e_icon('wrench'); // phpcs:ignore ?></span><span><small>À faire par vous</small><strong><?php echo count($aFaire); ?></strong></span></div>
            <div class="app-card <?php echo $nRetard ? 'c-pink' : 'c-mint'; ?>"><span class="app-card-ico"><?php echo aled08e_icon('clock'); // phpcs:ignore ?></span><span><small>En retard</small><strong><?php echo (int) $nRetard; ?></strong></span></div>
            <div class="app-card c-lilac"><span class="app-card-ico"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?></span><span><small>En préparation avec Cerise</small><strong><?php echo count($chezCerise); ?></strong></span></div>
            <button type="button" class="app-card c-mint" data-go="commandes"><span class="app-card-ico"><?php echo aled08e_icon('package'); // phpcs:ignore ?></span><span><small>Commandes en cours</small><strong><?php echo count($cmdsVivantes); ?></strong></span></button>
          </div>
          <p class="app-note">Le circuit : le client écrit, Cerise précise la demande avec lui et la lui fait confirmer, puis elle vous l’envoie ici (et par e-mail). Vous faites la modification. Mini : sous 7 jours, une demande à la fois. Maxi : sous 48 h, deux à la fois, en premier dans la liste. Le client peut annuler tant que vous n’avez pas cliqué « Je commence ».</p>

          <p class="app-sub"><?php echo aled08e_icon('wrench'); // phpcs:ignore ?> À faire, dans l’ordre</p>
          <?php if (!$aFaire) : ?>
          <p class="esp-empty">Rien à faire pour le moment.</p>
          <?php else : ?>
          <ul class="ges-list">
            <?php foreach ($aFaire as $p) :
                $s = get_post_meta($p->ID, '_aled08_statut', true) ?: 'recue';
                $c = get_userdata($p->post_author);
                $site = $c ? aled08e_meta($c->ID, 'site') : '';
                $e = $ech($p);
                $reste = $e - time();
                $retard = $reste < 0;
                $brief = trim((string) get_post_meta($p->ID, '_aled08_brief', true));
                $resume = trim((string) get_post_meta($p->ID, '_aled08_resume', true));
                $noteC = trim((string) get_post_meta($p->ID, '_aled08_note_cerise', true));
                $seo = (bool) get_post_meta($p->ID, '_aled08_seo', true);
                $photos = array_filter(array_map('intval', (array) get_post_meta($p->ID, '_aled08_photos', true)));
                if (has_post_thumbnail($p)) $photos[] = (int) get_post_thumbnail_id($p);
                $hist = function_exists('aled08e_ech_retours') ? aled08e_ech_retours($p->ID) : [];
                ?>
            <li class="ges-item ges-afaire<?php echo $retard ? ' is-retard' : ($reste < DAY_IN_SECONDS ? ' is-bientot' : ''); ?>">
              <div class="ges-head"><strong><?php echo esc_html($c ? $c->display_name : 'Client supprimé'); ?></strong>
                <?php if (get_post_meta($p->ID, '_aled08_priorite', true)) : ?><em class="st st-new">Maxi · prioritaire</em><?php endif; ?>
                <?php if ($seo) : ?><em class="st st-doing">Page SEO</em><?php endif; ?>
                <em class="st <?php echo esc_attr($st[$s][1] ?? 'st-new'); ?>"><?php echo esc_html($s === 'encours' ? 'Commencée' : 'À commencer'); ?></em></div>
              <p class="ges-echeance"><?php echo aled08e_icon('clock'); // phpcs:ignore ?><span><?php echo $retard ? '<b>En retard</b> : c’était à faire avant le ' : 'À faire avant le '; ?><?php echo esc_html(wp_date('l j F à G\hi', $e)); ?></span></p>
              <?php if ($resume !== '') : ?><p class="ges-resume"><?php echo esc_html($resume); ?></p><?php endif; ?>
              <?php if ($brief !== '') : ?><div class="ges-brief"><small><?php echo $seo ? 'Le sujet choisi par Lumi' : 'La demande préparée par Cerise, confirmée par le client'; ?></small><?php echo nl2br(esc_html($brief)); ?></div>
              <?php elseif (!$seo) : ?><div class="ges-brief"><small>La demande du client</small><?php echo nl2br(esc_html($p->post_content ?: $p->post_title)); ?></div><?php endif; ?>
              <?php if ($noteC !== '') : ?><p class="ges-meta">Note : <?php echo esc_html($noteC); ?></p><?php endif; ?>
              <?php if ($photos) : ?><div class="ges-photos"><?php foreach (array_unique($photos) as $ph) { $url = wp_get_attachment_url($ph); if ($url) echo '<a class="ges-photo" href="' . esc_url($url) . '" target="_blank" rel="noopener">' . wp_get_attachment_image($ph, 'thumbnail', false, ['alt' => 'Photo jointe']) . '</a>'; } // phpcs:ignore ?></div><?php endif; ?>
              <?php if ($brief !== '' && !$seo || $hist) : ?><details class="ges-details"><summary>Ce que le client a écrit<?php echo $hist ? ', et ses échanges avec Cerise' : ''; ?></summary>
                <p class="ges-text"><?php echo nl2br(esc_html($p->post_content ?: $p->post_title)); ?></p>
                <?php foreach ($hist as $r) : ?><p class="ges-meta"><b><?php echo esc_html(['refus' => 'Correction du client', 'question' => 'Question de Cerise', 'reponse' => 'Réponse du client'][$r['type']] ?? $r['type']); ?> :</b> <?php echo esc_html($r['texte'] !== '' ? $r['texte'] : '(capture seule)'); ?></p><?php endforeach; ?>
              </details><?php endif; ?>
              <p class="ges-meta">Demandée le <?php echo esc_html(aled08e_date($p->post_date)); ?><?php if ($site) : ?> · <a href="<?php echo esc_url($site); ?>" target="_blank" rel="noopener"><?php echo esc_html(preg_replace('#^https?://(www\.)?#', '', untrailingslashit($site))); ?></a> · <a href="<?php echo esc_url(untrailingslashit($site) . '/wp-admin/'); ?>" target="_blank" rel="noopener">administration du site</a><?php endif; ?></p>
              <form class="ges-form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
                <input type="hidden" name="aled08e_gestion" value="demande"><input type="hidden" name="id" value="<?php echo (int) $p->ID; ?>"><?php echo $nonce; // phpcs:ignore ?>
                <label class="sr-only" for="rep-<?php echo (int) $p->ID; ?>">Un mot pour le client (facultatif)</label>
                <textarea id="rep-<?php echo (int) $p->ID; ?>" name="reponse" rows="2" placeholder="Un mot pour le client (facultatif). Sinon : « C’est fait ! Votre modification est en ligne. »"></textarea>
                <div class="ges-actions">
                  <?php if ($s !== 'encours') : ?><button class="btn btn-light btn-sm" type="submit" name="statut" value="encours"><?php echo aled08e_icon('clock'); // phpcs:ignore ?><span>Je commence</span></button><?php endif; ?>
                  <button class="btn btn-primary btn-sm" type="submit" name="statut" value="faite"><?php echo aled08e_icon('check'); // phpcs:ignore ?><span>C’est fait, prévenir le client</span></button>
                  <a class="btn btn-light btn-sm" href="<?php echo esc_url(admin_url('post.php?post=' . (int) $p->ID . '&action=edit')); ?>"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Fiche</span></a>
                </div>
              </form>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>

          <?php if ($chezCerise) : ?>
          <p class="app-sub"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?> En préparation avec Cerise (rien à faire pour vous)</p>
          <ul class="ges-list">
            <?php foreach ($chezCerise as $p) :
                $c = get_userdata($p->post_author);
                $et = (string) get_post_meta($p->ID, '_aled08_lia_etat', true);
                $lib = ['question' => 'Cerise attend la réponse du client', 'a_confirmer' => 'Le client doit confirmer la demande'][$et] ?? 'Cerise relit la demande';
                $txt = trim(preg_replace('/\s+/u', ' ', $p->post_content));
                ?>
            <li class="ges-item ges-mini"><div class="ges-head"><strong><?php echo esc_html($c ? $c->display_name : 'Client supprimé'); ?></strong><em class="st st-doing"><?php echo esc_html($lib); ?></em></div>
              <p class="ges-text"><?php echo esc_html(mb_strlen($txt) > 160 ? mb_substr($txt, 0, 157) . '…' : $txt); ?></p></li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-suivi" aria-labelledby="tab-suivi" hidden>
          <h2 class="app-h">Toutes les demandes</h2>
          <p class="app-p">Les 60 dernières demandes, où elles en sont, et quand elles ont été faites.</p>
          <?php
          $toutes = get_posts(['post_type' => ALED08E_CPT, 'post_status' => ['private', 'publish'], 'numberposts' => 60, 'orderby' => 'date', 'order' => 'DESC']);
          $etats = [
              'en_attente' => ['Cerise relit la demande', 'st-doing'], 'en_cours' => ['Cerise relit la demande', 'st-doing'],
              'question' => ['Cerise attend une réponse du client', 'st-new'], 'a_confirmer' => ['Le client doit confirmer', 'st-new'],
              'transmise' => ['Transmise à Alex', 'st-doing'], 'annule' => ['Annulée', 'esp-st-off'],
          ];
          $nFaites = 0; $nAlex = 0; $nCerise = 0; $cout = 0.0; $delais = [];
          foreach ($toutes as $d) {
              $sd = get_post_meta($d->ID, '_aled08_statut', true) ?: 'recue';
              if ($sd === 'faite') {
                  $nFaites++;
                  $tr = (int) get_post_meta($d->ID, '_aled08_transmise_le', true); $fl = strtotime((string) get_post_meta($d->ID, '_aled08_faite_le', true));
                  if ($tr && $fl) $delais[] = max(0, $fl - $tr);
              } elseif ($sd !== 'annulee') { if (get_post_meta($d->ID, '_aled08_par', true) === 'lia') $nCerise++; else $nAlex++; }
              $c = get_post_meta($d->ID, '_aled08_lia_conso', true);
              if (is_array($c)) $cout += aled08e_lia_cout($c);
          }
          $moy = $delais ? array_sum($delais) / count($delais) : 0;
          ?>
          <div class="app-cards ges-cards">
            <div class="app-card c-lilac"><span class="app-card-ico"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?></span><span><small>Avec Cerise</small><strong><?php echo (int) $nCerise; ?></strong></span></div>
            <div class="app-card c-sky"><span class="app-card-ico"><?php echo aled08e_icon('wrench'); // phpcs:ignore ?></span><span><small>Chez vous</small><strong><?php echo (int) $nAlex; ?></strong></span></div>
            <div class="app-card c-mint"><span class="app-card-ico"><?php echo aled08e_icon('circle-check'); // phpcs:ignore ?></span><span><small>Faites<?php echo $moy ? ' (en ' . ($moy < DAY_IN_SECONDS ? round($moy / HOUR_IN_SECONDS) . ' h' : round($moy / DAY_IN_SECONDS, 1) . ' j') . ' en moyenne)' : ''; ?></small><strong><?php echo (int) $nFaites; ?></strong></span></div>
            <div class="app-card c-pink"><span class="app-card-ico"><?php echo aled08e_icon('badge-euro'); // phpcs:ignore ?></span><span><small>Coût estimé de Cerise</small><strong><?php echo esc_html(number_format($cout, 2, ',', ' ')); ?> $</strong></span></div>
          </div>
          <?php if (!$toutes) : ?><p class="esp-empty">Aucune demande pour le moment.</p><?php else : ?>
          <div class="field ges-filter"><label for="ges-dq">Filtrer</label><input id="ges-dq" type="search" placeholder="Client, Cerise, faite, annulée, page SEO" data-ges-filter="#ges-suivi"></div>
          <ul class="ges-list" id="ges-suivi">
            <?php foreach ($toutes as $d) :
                $sd = get_post_meta($d->ID, '_aled08_statut', true) ?: 'recue';
                $cl = get_userdata($d->post_author);
                $e = (string) get_post_meta($d->ID, '_aled08_lia_etat', true);
                $et = in_array($sd, ['faite', 'annulee'], true) ? null : ($etats[$e] ?? null);
                $annulee = (string) get_post_meta($d->ID, '_aled08_annulee_le', true);
                $faite = (string) get_post_meta($d->ID, '_aled08_faite_le', true);
                $resume = trim((string) get_post_meta($d->ID, '_aled08_resume', true));
                $txt = $resume !== '' ? $resume : ($d->post_content ?: $d->post_title);
                $seo = (bool) get_post_meta($d->ID, '_aled08_seo', true);
                ?>
            <li class="ges-item" data-ges-text="<?php echo esc_attr(mb_strtolower(($cl ? $cl->display_name : '') . ' ' . ($et ? $et[0] : '') . ' ' . ($st[$sd][0] ?? '') . ($seo ? ' page seo' : '') . ($annulee ? ' annulée' : ''))); ?>">
              <div class="ges-head"><strong><?php echo esc_html($cl ? $cl->display_name : 'Client supprimé'); ?></strong><?php if ($seo) : ?><em class="st st-doing">Page SEO</em><?php endif; ?><em class="st <?php echo esc_attr($et ? $et[1] : ($st[$sd][1] ?? 'st-new')); ?>"><?php echo esc_html($et ? $et[0] : ($st[$sd][0] ?? $sd)); ?></em></div>
              <p class="ges-meta">Le <?php echo esc_html(aled08e_date($d->post_date)); ?><?php if ($faite) echo ' · faite le ' . esc_html(aled08e_date($faite)); ?><?php if ($annulee) echo ' · annulée le ' . esc_html(aled08e_date($annulee)); ?></p>
              <p class="ges-text"><?php echo esc_html(mb_strlen($txt) > 260 ? mb_substr($txt, 0, 257) . '…' : $txt); ?></p>
              <div class="ges-actions"><a class="btn btn-light btn-sm" href="<?php echo esc_url(admin_url('post.php?post=' . (int) $d->ID . '&action=edit')); ?>"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Ouvrir la demande</span></a></div>
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
              <div class="ges-head"><strong><?php echo esc_html($c->display_name); ?></strong><?php if ($f) : ?><em class="st st-done"><?php echo esc_html($f['name']); ?><?php echo aled08e_meta($c->ID, 'offert') === '1' ? ', offert' : ''; ?></em><?php else : ?><em class="st esp-st-off">Sans abonnement</em><?php endif; ?></div>
              <p class="ges-meta"><?php if ($site) : ?><a href="<?php echo esc_url($site); ?>" target="_blank" rel="noopener"><?php echo esc_html(preg_replace('#^https?://(www\.)?#', '', untrailingslashit($site))); ?></a> · <?php endif; ?><?php if ($f) echo aled08e_famille($c->ID) ? 'modifications illimitées ∞ ♥ · ' : (int) $util . ' demande' . ($util > 1 ? 's' : '') . ' ce mois · ' . ((int) aled08e_demandes_max($c->ID) > 1 ? 'deux demandes à la fois' : 'une demande à la fois') . ' · '; ?>client depuis le <?php echo esc_html(aled08e_date($c->user_registered)); ?></p>
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
              <p class="ges-meta"><?php echo esc_html($c['ref']); ?> · <?php echo esc_html($t ? $t['name'] : $c['type']); ?> · abonnement <?php echo esc_html(aled08e_euro_txt(aled08e_forfait($c['forfait'])['month'])); ?> par mois<?php if ($c['domaine']) echo ' · ' . esc_html($c['domaine']); ?> · le <?php echo esc_html(aled08e_date($c['date'])); ?></p>
              <p class="ges-meta">Création <?php echo aled08e_euro($c['montants']['creation']); // phpcs:ignore ?>, acompte <?php echo aled08e_euro($c['montants']['acompte']); // phpcs:ignore ?><?php if (aled08e_cmd_reception_due($c)) echo ', <b>reste ' . aled08e_euro($c['montants']['solde']) . ' à régler</b>'; // phpcs:ignore ?></p>
              <?php $ble = function_exists('aled08e_brief_le') ? aled08e_brief_le($c['id']) : ''; ?>
              <p class="ges-meta">Questionnaire : <?php echo $ble ? '<b>reçu le ' . esc_html(aled08e_date($ble)) . '</b>' : 'pas encore rempli'; // phpcs:ignore ?></p>
              <div class="ges-actions"><a class="btn btn-light btn-sm" href="<?php echo esc_url(aled08e_cmd_admin_url($c['id'])); ?>"><?php echo aled08e_icon('pencil'); // phpcs:ignore ?><span>Ouvrir la commande</span></a><?php if ($ble) : ?> <a class="btn btn-primary btn-sm" href="<?php echo esc_url(add_query_arg('aled08e_brief', $c['id'], home_url('/'))); ?>"><?php echo aled08e_icon('download'); // phpcs:ignore ?><span>Questionnaire</span></a><?php endif; ?></div>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

        <div class="app-panel" role="tabpanel" id="t-annonces" aria-labelledby="tab-annonces" hidden>
          <h2 class="app-h">Annonces</h2>
          <?php echo $flash; // phpcs:ignore ?>
          <p class="app-p">Une info à donner à tous vos clients : une nouveauté, des congés, une maintenance. Les trois dernières annonces s’affichent en haut de leur espace.</p>
          <form class="form esp-form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
            <input type="hidden" name="aled08e_gestion" value="annonce_ajout"><?php echo $nonce; // phpcs:ignore ?>
            <p class="app-sub"><?php echo aled08e_icon('megaphone'); // phpcs:ignore ?> Nouvelle annonce</p>
            <div class="field"><label for="an-titre">Titre</label><input id="an-titre" name="titre" type="text" maxlength="120" placeholder="Nouveau : la traduction en anglais" required></div>
            <div class="field"><label for="an-texte">Message (facultatif)</label><textarea id="an-texte" name="texte" rows="4" maxlength="1500" placeholder="Quelques lignes, en texte simple."></textarea></div>
            <button class="btn btn-primary" type="submit"><?php echo aled08e_icon('send'); // phpcs:ignore ?><span>Publier pour tous les clients</span></button>
          </form>
          <p class="app-sub">Annonces en ligne</p>
          <?php $annonces = aled08e_annonces(30); if (!$annonces) : ?><p class="esp-empty">Aucune annonce pour le moment.</p><?php else : ?>
          <ul class="ges-list">
            <?php foreach ($annonces as $i => $a) : ?>
            <li class="ges-item">
              <div class="ges-head"><strong><?php echo esc_html($a->post_title); ?></strong><em class="st <?php echo $i < 3 ? 'st-done' : 'esp-st-off'; ?>"><?php echo $i < 3 ? 'Affichée' : 'Ancienne'; ?></em></div>
              <p class="ges-meta">Publiée le <?php echo esc_html(aled08e_date($a->post_date)); ?></p>
              <?php if ($a->post_content !== '') : ?><p class="ges-text"><?php echo nl2br(esc_html($a->post_content)); ?></p><?php endif; ?>
              <form class="ges-actions" method="post" action="<?php echo $act; // phpcs:ignore ?>">
                <input type="hidden" name="aled08e_gestion" value="annonce_suppr"><input type="hidden" name="id" value="<?php echo (int) $a->ID; ?>"><?php echo $nonce; // phpcs:ignore ?>
                <button class="btn btn-light btn-sm ges-suppr" type="submit" data-ges-quoi="annonce_suppr" data-ges-confirm="Retirer cette annonce ?"><?php echo aled08e_icon('x'); // phpcs:ignore ?><span>Retirer</span></button>
              </form>
            </li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
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

/* Publier une annonce sans passer par l'écran de gestion : l'option aled08_annonce_a_publier
 * ({"titre": "...", "texte": "..."}) est lue par la tâche planifiée « aled08_annonce_publier », puis effacée. */
add_action('aled08_annonce_publier', function () {
    $a = get_option('aled08_annonce_a_publier');
    if (is_string($a)) $a = json_decode($a, true);
    delete_option('aled08_annonce_a_publier');
    $titre = is_array($a) ? sanitize_text_field((string) ($a['titre'] ?? '')) : '';
    if ($titre === '') return;
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID', 'fields' => 'ids']);
    wp_insert_post(['post_type' => ALED08E_CPT_ANNONCE, 'post_status' => 'private', 'post_title' => mb_substr($titre, 0, 120), 'post_content' => mb_substr(sanitize_textarea_field((string) ($a['texte'] ?? '')), 0, 1500), 'post_author' => $admins ? (int) $admins[0] : 0]);
    update_option('aled08_annonce_derniere', ['titre' => $titre, 'le' => current_time('mysql'), 'total' => count(aled08e_annonces(100))], false);
});
