<?php
/**
 * Les Minis Monstres Espace client : « Mes pages » (25 novembre 2026, demande d'Alex).
 * Dans l'onglet Mon site, le client a toujours la liste de toutes les pages publiées de son site, dont ses pages
 * de visibilité Google : titre, adresse, type, date de mise en ligne, avec « Voir » et « Modifier ».
 * Un prestataire classique ne donne accès à rien : ici, tout est sous les yeux du client.
 *
 * D'où vient la liste :
 *   - du site du client, lue en direct par le connecteur (action « lister », en lecture seule). Le connecteur 2.14.0
 *     et plus donne aussi la date de mise en ligne et le rôle de la page (accueil, boutique) ; un ancien connecteur
 *     donne le reste, et les dates des pages Google viennent alors de ce que l'espace a enregistré à la livraison ;
 *   - les pages de visibilité Google sont reconnues par ce que includes/pages-google.php enregistre à la livraison
 *     (numéro de la page sur le site du client, son adresse, son titre) ;
 *   - la liste est gardée 10 minutes ; site injoignable : la dernière liste connue (gardée sur la fiche du client) ;
 *   - site pas encore relié : ce que l'espace sait déjà (l'accueil et les pages Google livrées) ;
 *   - avant la mise en ligne : un simple message.
 * L'espace s'affiche sans attendre le site du client : la liste se met à jour en arrière-plan, quand le bloc est vu.
 */
defined('ABSPATH') || exit;

/* Les noms d'hôte acceptés pour les liens (le site du client, avec ou sans www) */
function aled08e_mp_hote($url) { return preg_replace('#^www\.#', '', strtolower((string) wp_parse_url((string) $url, PHP_URL_HOST))); }
function aled08e_mp_hotes($uid) {
    return array_values(array_filter(array_unique([aled08e_mp_hote(aled08e_meta($uid, 'lia_url')), aled08e_mp_hote(aled08e_meta($uid, 'site'))])));
}
/* Une adresse du site du client, toujours en https ; '' si elle mène ailleurs */
function aled08e_mp_adresse($uid, $url) {
    $url = trim((string) $url);
    $h = aled08e_mp_hote($url);
    if ($h === '' || !in_array($h, aled08e_mp_hotes($uid), true) || !in_array(strtolower((string) wp_parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true)) return '';
    return esc_url_raw(preg_replace('#^http://#i', 'https://', $url), ['https']);
}
/* La clé de comparaison d'une adresse : chemin sans barre finale, en minuscules (+ ?page_id=…) */
function aled08e_mp_cle($url) {
    $p = strtolower(untrailingslashit((string) wp_parse_url((string) $url, PHP_URL_PATH)));
    $q = (string) wp_parse_url((string) $url, PHP_URL_QUERY);
    return ($p === '' ? '/' : $p) . ($q !== '' ? '?' . $q : '');
}
function aled08e_mp_titre_cle($t) { return strtolower(trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(html_entity_decode((string) $t, ENT_QUOTES, 'UTF-8'))))); }

/* Les pages de visibilité Google livrées à ce client (ce que pages-google.php enregistre) */
function aled08e_mp_google($uid) {
    $out = [];
    foreach (get_posts(['post_type' => ALED08E_CPT, 'author' => (int) $uid, 'post_status' => ['private', 'publish'], 'numberposts' => 200, 'orderby' => 'date', 'order' => 'DESC', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_seo', 'value' => '1'], ['key' => '_aled08_statut', 'value' => 'faite']]]) as $p) {
        $adr = aled08e_mp_adresse($uid, (string) get_post_meta($p->ID, '_aled08_lien', true));
        if ($adr === '') continue;
        $out[] = [
            'titre' => (string) get_post_meta($p->ID, '_aled08_pg_titre', true) ?: preg_replace('/^Page de visibilité Google : /u', '', $p->post_title),
            'adresse' => $adr,
            'id' => (int) get_post_meta($p->ID, '_aled08_pg_page', true),
            'date' => (int) get_post_meta($p->ID, '_aled08_faite_le', true),
        ];
    }
    return $out;
}

/* Où en est le site : avant (pas encore en ligne), non_relie (en ligne, pas encore relié à l'espace), relie */
function aled08e_mp_etat_site($uid) {
    $enLigne = false; $enCours = false;
    foreach (aled08e_cmd_user_commandes($uid) as $c) {
        if ($c['statut'] === 'en_ligne') $enLigne = true;
        elseif ($c['statut'] !== 'annulee') $enCours = true;
    }
    if ($enCours && !$enLigne) return 'avant';
    if (aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== '') return 'relie';
    if ($enLigne || aled08e_meta($uid, 'site') !== '') return 'non_relie';
    return 'avant';
}

/* Ce que l'espace sait sans le site : l'accueil et les pages Google livrées */
function aled08e_mp_connues($uid) {
    $pages = [];
    $accueil = aled08e_mp_adresse($uid, aled08e_meta($uid, 'site'));
    if ($accueil !== '') $pages[] = ['titre' => 'Accueil', 'adresse' => trailingslashit($accueil), 'google' => false, 'role' => 'accueil', 'date' => 0];
    foreach (aled08e_mp_google($uid) as $g) $pages[] = ['titre' => $g['titre'], 'adresse' => $g['adresse'], 'google' => true, 'role' => '', 'date' => $g['date']];
    return aled08e_mp_trier($pages);
}

/* L'accueil d'abord, puis les pages du site dans l'ordre du site, puis les pages Google, les plus récentes d'abord */
function aled08e_mp_trier($pages) {
    $rang = function ($p) { return $p['role'] === 'accueil' ? 0 : ($p['google'] ? 2 : 1); };
    $i = 0;
    foreach ($pages as &$p) $p['_i'] = $i++;
    unset($p);
    usort($pages, function ($a, $b) use ($rang) {
        $r = $rang($a) <=> $rang($b);
        if ($r) return $r;
        if ($a['google'] && $b['google'] && $a['date'] !== $b['date']) return $b['date'] <=> $a['date'];
        return $a['_i'] <=> $b['_i'];
    });
    foreach ($pages as &$p) unset($p['_i']);
    unset($p);
    return $pages;
}

/* La liste lue sur le site du client (réponse de l'action « lister »), avec les pages Google reconnues */
function aled08e_mp_depuis_site($uid, $contenus) {
    $google = aled08e_mp_google($uid);
    $parId = []; $parAdr = []; $parTitre = [];
    foreach ($google as $k => $g) {
        if ($g['id']) $parId[$g['id']] = $k;
        $parAdr[aled08e_mp_cle($g['adresse'])] = $k;
        $parTitre[aled08e_mp_titre_cle($g['titre'])] = $k;
    }
    $vus = [];
    $pages = [];
    foreach ((array) $contenus as $c) {
        if (!is_array($c) || ($c['statut'] ?? '') !== 'publish' || ($c['type'] ?? 'page') !== 'page') continue;
        $adr = aled08e_mp_adresse($uid, (string) ($c['adresse'] ?? ''));
        if ($adr === '') continue;
        $id = (int) ($c['id'] ?? 0);
        $titre = mb_substr(trim(wp_strip_all_tags(html_entity_decode((string) ($c['titre'] ?? ''), ENT_QUOTES, 'UTF-8'))), 0, 160);
        $k = $parId[$id] ?? ($parAdr[aled08e_mp_cle($adr)] ?? ($parTitre[aled08e_mp_titre_cle($titre)] ?? null));
        if ($k !== null) $vus[$k] = true;
        $role = sanitize_key((string) ($c['role'] ?? ''));
        if ($role === '' && aled08e_mp_cle($adr) === aled08e_mp_cle(aled08e_meta($uid, 'lia_url') ?: '/')) $role = 'accueil';
        $date = (int) ($c['publie'] ?? 0); // connecteur 2.14.0 et plus
        if (!$date && $k !== null) $date = (int) $google[$k]['date'];
        $pages[] = ['titre' => $titre !== '' ? $titre : 'Page sans titre', 'adresse' => $adr, 'google' => $k !== null, 'role' => in_array($role, ['accueil', 'boutique'], true) ? $role : '', 'date' => $date];
    }
    // une page Google livrée mais absente de la liste (publiée comme article, par exemple) : on la montre quand même
    foreach ($google as $k => $g) if (empty($vus[$k])) $pages[] = ['titre' => $g['titre'], 'adresse' => $g['adresse'], 'google' => true, 'role' => '', 'date' => $g['date']];
    return aled08e_mp_trier($pages);
}

/* La liste des pages du client : ['etat' => ok|injoignable|non_relie|avant|attente, 'pages' => […], 'le' => horodatage]
 * $direct : lire le site du client si la liste gardée a plus de 10 minutes (sinon, la dernière liste connue, à rafraîchir) */
function aled08e_mp_lire($uid, $direct = false) {
    $site = aled08e_mp_etat_site($uid);
    if ($site === 'avant') return ['etat' => 'avant', 'pages' => [], 'le' => 0];
    if ($site === 'non_relie') return ['etat' => 'non_relie', 'pages' => aled08e_mp_connues($uid), 'le' => time()];
    $cle = 'aled08e_mp_' . (int) $uid;
    $c = get_transient($cle);
    if (is_array($c) && isset($c['etat'])) return $c;
    $derniere = get_user_meta($uid, 'aled08_mp_liste', true);
    $derniere = is_array($derniere) && isset($derniere['pages']) ? $derniere : null;
    if (!$direct) return ['etat' => 'attente', 'pages' => $derniere ? $derniere['pages'] : aled08e_mp_connues($uid), 'le' => $derniere ? (int) $derniere['le'] : 0, 'premiere' => !$derniere];
    $r = aled08e_lia_appel($uid, 'lister', ['type' => 'page']);
    if (is_wp_error($r) || !isset($r['contenus']) || !is_array($r['contenus'])) {
        $res = ['etat' => 'injoignable', 'pages' => $derniere ? $derniere['pages'] : aled08e_mp_connues($uid), 'le' => $derniere ? (int) $derniere['le'] : 0];
        set_transient($cle, $res, 2 * MINUTE_IN_SECONDS); // un site en panne n'est pas rappelé à chaque affichage
        return $res;
    }
    $res = ['etat' => 'ok', 'pages' => aled08e_mp_depuis_site($uid, $r['contenus']), 'le' => time()];
    set_transient($cle, $res, 10 * MINUTE_IN_SECONDS);
    update_user_meta($uid, 'aled08_mp_liste', ['le' => $res['le'], 'pages' => $res['pages']]);
    return $res;
}
/* Une page livrée ou changée : la liste se relit à la prochaine visite */
function aled08e_mp_oublier($uid) { delete_transient('aled08e_mp_' . (int) $uid); }

/* « 12 novembre 2026 », en français quelle que soit la langue du WordPress */
function aled08e_mp_date($ts) {
    $m = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return wp_date('j', (int) $ts) . ' ' . $m[(int) wp_date('n', (int) $ts) - 1] . ' ' . wp_date('Y', (int) $ts);
}

/* « 7 pages, dont 3 pages de visibilité Google » */
function aled08e_mp_compteur_txt($pages) {
    $n = count($pages);
    $g = count(array_filter($pages, function ($p) { return !empty($p['google']); }));
    $t = $n . ' page' . ($n > 1 ? 's' : '');
    if ($g) $t .= $g === $n ? ($n > 1 ? ', toutes de visibilité Google' : ' de visibilité Google') : ', dont ' . $g . ' page' . ($g > 1 ? 's' : '') . ' de visibilité Google';
    return $t;
}

/* Le contenu du bloc (aussi renvoyé par la mise à jour en arrière-plan) */
function aled08e_mp_corps_html($uid, $r) {
    if ($r['etat'] === 'avant') {
        return '<p class="esp-empty mp-vide">' . aled08e_icon('clock') . '<span>La liste de vos pages apparaîtra ici dès que votre site sera en ligne.</span></p>';
    }
    if ($r['etat'] === 'attente' && !empty($r['premiere'])) {
        return '<p class="esp-empty mp-vide" data-mp-lecture>' . aled08e_icon('refresh-cw') . '<span>Lecture de vos pages sur votre site…</span></p>';
    }
    $pages = (array) $r['pages'];
    $h = '<p class="mp-compteur" data-mp-compteur>' . esc_html($pages ? aled08e_mp_compteur_txt($pages) : 'Aucune page publiée pour le moment') . '</p>';
    $quand = $r['le'] ? aled08e_mp_date($r['le']) : '';
    if ($r['etat'] === 'injoignable') {
        $h .= '<p class="esp-warn mp-note" role="status">' . aled08e_icon('triangle-alert') . '<span>Votre site ne répond pas pour le moment. ' . ($quand ? 'Voici la dernière liste connue, du ' . esc_html($quand) . '.' : 'Voici les pages que nous connaissons déjà.') . '</span></p>';
    } elseif ($r['etat'] === 'non_relie') {
        $h .= '<p class="esp-empty mp-note">' . aled08e_icon('info') . '<span>Voici les pages que nous connaissons déjà. La liste complète arrive ici dès que votre site est relié à votre espace.</span></p>';
    }
    if (!$pages) return $h;
    $edition = aled08e_edition_dispo($uid);
    $ligne = function ($p) use ($edition) {
        $role = $p['role'] ?? '';
        $type = $p['google'] ? 'Page de visibilité Google' : ($role === 'accueil' ? 'Page d’accueil' : ($role === 'boutique' ? 'Page de la boutique' : 'Page du site'));
        $ic = $p['google'] ? 'search' : ($role === 'accueil' ? 'house' : ($role === 'boutique' ? 'shopping-bag' : 'file-text'));
        $affiche = rawurldecode(preg_replace('#^https?://(www\.)?#i', '', untrailingslashit($p['adresse'])));
        $modif = $edition
            ? '<button type="submit" name="page" value="' . esc_attr($p['adresse']) . '" class="btn btn-light btn-sm" aria-label="' . esc_attr('Modifier « ' . $p['titre'] . ' » sur mon site') . '">' . aled08e_icon('pencil') . '<span>Modifier</span></button>'
            : '<button type="button" class="btn btn-light btn-sm" data-mp-go="demandes" data-mp-page="' . esc_attr($p['titre']) . '" aria-label="' . esc_attr('Demander une modification de « ' . $p['titre'] . ' »') . '">' . aled08e_icon('pencil') . '<span>Modifier</span></button>';
        return '<li class="mp-item' . ($p['google'] ? ' is-google' : '') . '">'
            . '<span class="mp-ico" aria-hidden="true">' . aled08e_icon($ic) . '</span>'
            . '<span class="mp-txt"><strong>' . esc_html($p['titre']) . '</strong><small class="mp-adr">' . esc_html($affiche) . '</small>'
            . '<span class="mp-meta"><em class="mp-type">' . esc_html($type) . '</em>' . (!empty($p['date']) ? '<span>En ligne depuis le ' . esc_html(aled08e_mp_date($p['date'])) . '</span>' : '') . '</span></span>'
            . '<span class="mp-act"><a class="btn btn-light btn-sm" href="' . esc_url($p['adresse'], ['https']) . '" target="_blank" rel="noopener" aria-label="' . esc_attr('Voir « ' . $p['titre'] . ' » (nouvel onglet)') . '">' . aled08e_icon('eye') . '<span>Voir</span></a>' . $modif . '</span>'
            . '</li>';
    };
    $max = 8;
    $liste = '<ul class="mp-liste">' . implode('', array_map($ligne, array_slice($pages, 0, $max))) . '</ul>';
    if (count($pages) > $max) {
        $reste = count($pages) - $max;
        $liste .= '<details class="mp-plus"><summary>' . aled08e_icon('plus') . '<span>Voir ' . ($reste > 1 ? 'les ' . $reste . ' autres pages' : 'l’autre page') . '</span></summary><ul class="mp-liste">' . implode('', array_map($ligne, array_slice($pages, $max))) . '</ul></details>';
    }
    if ($edition) {
        // un seul formulaire : chaque bouton « Modifier » envoie l'adresse de sa page ; le lien signé est fabriqué au clic (includes/edition.php)
        $liste = '<form method="post" action="' . esc_url(aled08e_url()) . '" target="_blank" class="mp-form">'
            . '<input type="hidden" name="aled08e_editer" value="1">' . wp_nonce_field('aled08e_editer', '_aled08e_editer', false, false) . $liste . '</form>'
            . '<p class="mp-aide">' . aled08e_icon('sparkles') . '<span>« Modifier » ouvre la page sur votre site, en mode modification : un clic sur un texte ou une photo, vous le changez, c’est en ligne.</span></p>';
    } else {
        $liste .= '<p class="mp-aide">' . aled08e_icon('sparkles') . '<span>« Modifier » vous emmène dans « Mes modifications » : dites-nous ce qu’il faut changer sur la page, on s’en occupe.</span></p>';
    }
    return $h . $liste;
}

/* Le bloc « Mes pages » de l'onglet Mon site */
function aled08e_mp_html($uid) {
    $r = aled08e_mp_lire($uid);
    $charger = $r['etat'] === 'attente';
    $maj = $r['etat'] === 'ok' ? 'À jour' : ($charger ? 'Mise à jour…' : '');
    ob_start();
    ?>
<section class="mp" id="mes-pages" aria-labelledby="mp-titre" data-mp data-mp-charger="<?php echo $charger ? '1' : '0'; ?>" data-ajax="<?php echo esc_url(admin_url('admin-ajax.php')); ?>" data-nonce="<?php echo esc_attr($charger ? wp_create_nonce('aled08e_mes_pages') : ''); ?>">
  <div class="mp-tete">
    <span class="mp-tete-ico" aria-hidden="true"><?php echo aled08e_icon('file-text'); // phpcs:ignore ?></span>
    <div><h3 id="mp-titre">Mes pages</h3><p>Toutes les pages de votre site, dont vos pages de visibilité Google, toujours sous la main.</p></div>
    <small class="mp-maj" data-mp-maj aria-live="polite"><?php echo esc_html($maj); ?></small>
  </div>
  <div data-mp-corps><?php echo aled08e_mp_corps_html($uid, $r); // phpcs:ignore ?></div>
</section>
<script>
(function () {
  var b = document.querySelector('[data-mp]');
  if (!b) return;
  var corps = b.querySelector('[data-mp-corps]'), maj = b.querySelector('[data-mp-maj]');
  // « Modifier » sans le mode modification : on ouvre « Mes modifications », la demande commence par le nom de la page
  function brancher() {
    [].forEach.call(b.querySelectorAll('[data-mp-go]'), function (x) {
      x.addEventListener('click', function () {
        var t = document.querySelector('[role="tab"][data-tab="' + x.getAttribute('data-mp-go') + '"]');
        if (t) t.click();
        var r = document.getElementById('req-txt'), p = x.getAttribute('data-mp-page');
        if (r && p && !r.value) r.value = 'Sur la page « ' + p + ' » : ';
        if (r) setTimeout(function () { try { r.focus({ preventScroll: true }); } catch (e) { r.focus(); } }, 450);
      });
    });
  }
  brancher();
  // le raccourci de l'Accueil : on ouvre Mon site, puis on descend jusqu'au bloc
  [].forEach.call(document.querySelectorAll('[data-mp-aller]'), function (x) {
    x.addEventListener('click', function () {
      setTimeout(function () {
        var h = document.querySelector('.site-header'), doux = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        window.scrollBy({ top: b.getBoundingClientRect().top - (h ? h.offsetHeight : 70) - 10, behavior: doux ? 'smooth' : 'auto' });
      }, 120);
    });
  });
  if (b.getAttribute('data-mp-charger') !== '1' || !window.fetch) return;
  var fait = false;
  function charger() {
    if (fait) return; fait = true;
    b.setAttribute('aria-busy', 'true');
    var f = new FormData(); f.append('action', 'aled08e_mes_pages'); f.append('_n', b.getAttribute('data-nonce'));
    fetch(b.getAttribute('data-ajax'), { method: 'POST', body: f, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.success || !j.data || typeof j.data.html !== 'string') throw new Error('reponse');
        corps.innerHTML = j.data.html;
        if (maj) maj.textContent = j.data.etat === 'ok' ? 'À jour' : '';
        brancher();
      })
      .catch(function () {
        if (maj) maj.textContent = 'Mise à jour impossible pour le moment';
        var l = corps.querySelector('[data-mp-lecture] span');
        if (l) l.textContent = 'Votre site met du temps à répondre. Rouvrez votre espace dans un instant pour voir vos pages.';
      })
      .then(function () { b.removeAttribute('aria-busy'); });
  }
  if ('IntersectionObserver' in window) {
    var o = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { o.disconnect(); charger(); } });
    o.observe(b);
  } else charger();
})();
</script>
    <?php
    return ob_get_clean();
}

/* Le raccourci discret de l'Accueil (sans appeler le site du client : ce qui est déjà connu) */
function aled08e_mp_raccourci_html($uid) {
    $r = aled08e_mp_lire($uid);
    if ($r['etat'] === 'avant' || !$r['pages']) return '';
    $n = empty($r['premiere']) ? count($r['pages']) : 0;
    return '<p class="mp-raccourci">' . aled08e_icon('file-text') . '<span>Toutes les pages de votre site sont dans « Mon site ».</span> '
        . '<button type="button" class="link-btn" data-go="site" data-mp-aller>' . esc_html($n > 1 ? 'Voir mes ' . $n . ' pages' : ($n === 1 ? 'Voir ma page' : 'Voir mes pages')) . '</button></p>';
}

/* La mise à jour en arrière-plan : seulement les pages du client connecté */
add_action('wp_ajax_aled08e_mes_pages', function () {
    if (!check_ajax_referer('aled08e_mes_pages', '_n', false)) wp_send_json_error(['etat' => 'session'], 403);
    $uid = get_current_user_id();
    if (!$uid) wp_send_json_error(['etat' => 'session'], 403);
    $r = aled08e_mp_lire($uid, true);
    wp_send_json_success(['etat' => $r['etat'], 'html' => aled08e_mp_corps_html($uid, $r)]);
});
