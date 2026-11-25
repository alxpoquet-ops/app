<?php
/**
 * Le jeu-concours des Rubans, les petits monstres cadeaux (demande d'Alex, 25 novembre 2026).
 *
 * Pendant un jeu, CINQ Rubans se cachent sur le site, un par catégorie : la page d'accueil, l'espace client, les mini-tutos,
 * la page Tarifs et les questions fréquentes (la liste est dans le règlement, /jeu-concours/). Il faut être connecté à son
 * compte (gratuit, sans achat) pour les voir. Chaque Ruban trouvé s'ajoute au compteur flottant de l'espace client, avec un
 * indice pour chacun. Les cinq trouvés : le joueur donne son e-mail et son numéro de portable, et participe au tirage.
 *
 * Contre la triche (Alex : « un par numéro ») : une participation par compte, par adresse e-mail et par numéro de portable.
 * Les participations faites depuis le même appareil ou la même adresse internet sont signalées (pas refusées : une famille
 * peut partager un ordinateur) ; le gagnant est appelé au numéro donné avant de recevoir son lot.
 * Les Rubans sont validés par le serveur : chacun porte un jeton secret, donné seulement sur sa page.
 *
 * Éteint par défaut. Tout se pilote par l'API, réservée aux administrateurs :
 *   GET  /aled08/v1/atelier/concours                     l'état, les cachettes, les inscrits, les doublons possibles, les tirages
 *   POST /aled08/v1/atelier/concours { faire: ouvrir }   ouvre un nouveau jeu
 *   POST … { faire: cachette, cachette: "tarifs", chemin?, selecteur?, indice?, coin? }   déplace un Ruban (même catégorie)
 *   POST … { faire: fermer }    ferme le jeu et tire au sort le gagnant (random_int) parmi les participations complètes
 *   POST … { faire: retirer }   nouveau tirage (le gagnant n'a pas répondu en 15 jours, ou sa participation n'était pas valable)
 * Aucun e-mail n'est envoyé au gagnant : Alex le prévient lui-même. Données effacées 3 mois après le dernier tirage.
 */
defined('ABSPATH') || exit;

/* Les cinq cachettes par défaut : une par catégorie du règlement. coin : où Ruban dépasse dans le bloc choisi. */
function aled08e_concours_cachettes_defaut() {
    return [
        'accueil' => ['categorie' => 'La page d’accueil du site', 'chemin' => '/', 'selecteur' => '#deroulement', 'coin' => 'bas-gauche',
            'indice' => 'Sur la page d’accueil, je suis les étapes, de la commande à la mise en ligne.'],
        'espace' => ['categorie' => 'L’espace client', 'chemin' => '/mon-espace/', 'selecteur' => '#t-compte [data-sm-part="infos"], #t-compte', 'coin' => 'bas-droite',
            'indice' => 'Dans votre espace client, je garde vos informations au chaud, dans Mon compte.'],
        'tutos' => ['categorie' => 'Les mini-tutos', 'chemin' => '/mini-tuto/qui-sont-les-minis-monstres/', 'selecteur' => '.tuto-section', 'coin' => 'haut-droite',
            'indice' => 'Dans les mini-tutos, je me présente avec toute la bande.'],
        'tarifs' => ['categorie' => 'La page Tarifs', 'chemin' => '/tarifs/', 'selecteur' => '#extras', 'coin' => 'haut-gauche',
            'indice' => 'Sur la page des tarifs, je joue avec les extras.'],
        'faq' => ['categorie' => 'Les questions fréquentes', 'chemin' => '/faq/', 'selecteur' => '.page-hero + .section', 'coin' => 'bas-droite',
            'indice' => 'Vous avez une question ? Je me cache parmi les réponses.'],
    ];
}
function aled08e_concours_etat() {
    $e = get_option('aled08_concours', []);
    return wp_parse_args(is_array($e) ? $e : [], ['id' => '', 'ouvert' => false, 'ouvert_le' => '', 'cachettes' => [], 'tirages' => []]);
}
function aled08e_concours_cachettes() {
    $e = aled08e_concours_etat();
    $c = aled08e_concours_cachettes_defaut();
    foreach ((array) $e['cachettes'] as $k => $v) if (isset($c[$k]) && is_array($v)) $c[$k] = array_merge($c[$k], array_intersect_key($v, array_flip(['chemin', 'selecteur', 'indice', 'coin'])));
    return $c;
}
function aled08e_concours_ouvert() { $e = aled08e_concours_etat(); return $e['ouvert'] && $e['id'] !== ''; }
function aled08e_concours_cle($id, $quoi = 'concours') { return 'aled08_' . $quoi . '_' . preg_replace('/[^a-z0-9_]/', '', (string) $id); }
function aled08e_concours_jeton($id, $cach) { return substr(hash_hmac('sha256', $id . '|' . $cach, wp_salt('nonce')), 0, 20); }
/* Les Rubans trouvés par un compte pendant le jeu en cours : [cachette => heure] */
function aled08e_concours_trouves($uid, $id = '') {
    if ($id === '') $id = aled08e_concours_etat()['id'];
    $t = $id !== '' ? get_user_meta((int) $uid, aled08e_concours_cle($id, 'rubans'), true) : [];
    return is_array($t) ? array_intersect_key($t, aled08e_concours_cachettes_defaut()) : [];
}
function aled08e_concours_participation($uid, $id = '') {
    if ($id === '') $id = aled08e_concours_etat()['id'];
    $p = $id !== '' ? get_user_meta((int) $uid, aled08e_concours_cle($id), true) : [];
    return is_array($p) && !empty($p['email']) ? $p : null;
}
/* Un numéro de portable français (métropole et outre-mer : 06 et 07), sous la forme +33XXXXXXXXX ; '' s'il n'est pas valable */
function aled08e_concours_tel($t) {
    $d = preg_replace('/\D+/', '', (string) $t);
    if (strpos($d, '0033') === 0) $d = substr($d, 4);
    elseif (strpos($d, '33') === 0 && strlen($d) === 11) $d = substr($d, 2);
    elseif (strlen($d) === 10 && $d[0] === '0') $d = substr($d, 1);
    return preg_match('/^[67]\d{8}$/', $d) ? '+33' . $d : '';
}
/* Un chemin de page sous une seule forme : « / », « /tarifs/ » */
function aled08e_concours_chemin($c) { $c = trim((string) $c, '/'); return $c === '' ? '/' : '/' . $c . '/'; }
function aled08e_concours_ip() { return wp_hash(preg_replace('/[^0-9a-f:.]/i', '', (string) ($_SERVER['REMOTE_ADDR'] ?? '')), 'nonce'); }

/* Les participations complètes d'un jeu, les comptes de l'équipe exclus, avec les doublons possibles signalés */
function aled08e_concours_inscrits($id) {
    $cle = aled08e_concours_cle($id);
    $out = [];
    foreach (get_users(['meta_key' => $cle, 'number' => 5000]) as $u) {
        if (user_can($u, 'edit_posts')) continue;
        $p = get_user_meta($u->ID, $cle, true);
        if (!is_array($p) || empty($p['email'])) continue;
        $out[] = ['user' => (int) $u->ID, 'nom' => $u->display_name, 'email' => (string) $p['email'], 'tel' => (string) ($p['tel'] ?? ''), 'le' => (string) ($p['le'] ?? ''),
            'appareil' => (string) ($p['appareil'] ?? ''), 'ip' => (string) ($p['ip'] ?? '')];
    }
    $compte = function ($k) use ($out) { $n = []; foreach ($out as $i) if ($i[$k] !== '') $n[$i[$k]] = ($n[$i[$k]] ?? 0) + 1; return $n; };
    $app = $compte('appareil'); $ip = $compte('ip');
    foreach ($out as &$i) {
        $i['doublon_possible'] = ($i['appareil'] !== '' && $app[$i['appareil']] > 1) ? 'même appareil qu’une autre participation' : (($i['ip'] !== '' && $ip[$i['ip']] > 1) ? 'même adresse internet qu’une autre participation' : '');
        unset($i['appareil'], $i['ip']);
    }
    return $out;
}

/* ---------- sur toutes les pages : les Rubans, l'animation, le compteur et le formulaire (chargés par le script) ---------- */
add_action('wp_footer', function () {
    if (!aled08e_concours_ouvert() || is_admin()) return;
    $D = aled08e_data();
    $valeur = (float) ($D['creation']['prixNormal'] ?? ($D['creation']['prix'] ?? 0));
    $mini = 0; foreach ((array) ($D['forfaits'] ?? []) as $f) { $mini = (float) ($f['month'] ?? 0); break; }
    $cfg = ['ajax' => admin_url('admin-ajax.php'), 'espace' => function_exists('aled08e_url') ? aled08e_url() : home_url('/mon-espace/'),
        'reglement' => home_url('/jeu-concours/'), 'ruban' => aled08e_monster('ruban'), 'icones' => ['x' => aled08e_icon('x'), 'check' => aled08e_icon('check'), 'gift' => aled08e_icon('gift')],
        'lot' => 'un site internet pour votre activité (le Site Essentiel, d’une valeur de ' . aled08e_euro_txt($valeur) . ') et un an de forfait Mini (' . aled08e_euro_txt($mini * 12) . ')'];
    ?>
<script id="lmm-rubans">
(function (C) {
  var ici = location.pathname.replace(/\/?$/, '/'), N = 0, etat = null;
  var el = function (h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  var post = function (action, data) { var f = new FormData(); f.append('action', action); Object.keys(data || {}).forEach(function (k) { f.append(k, data[k]); }); return fetch(C.ajax, { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }); };
  var appareil = function () { try { var a = localStorage.getItem('lmm-ruban-appareil'); if (!a) { a = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('lmm-ruban-appareil', a); } return a; } catch (e) { return ''; } };
  function toast(t) { var x = el('<p class="cc-toast" role="status"></p>'); x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.classList.add('is-out'); }, 3600); setTimeout(function () { x.remove(); }, 4200); }
  function confettis(x, y) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cols = ['#FF9EC4', '#FFE07A', '#A9EFD4', '#AED2FF', '#C9B8FF', '#FFB38A'];
    for (var i = 0; i < 26; i++) { var p = document.createElement('i'); p.className = 'cc-confetti'; var a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110;
      p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;background:' + cols[i % cols.length] + ';--dx:' + Math.cos(a) * d + 'px;--dy:' + (Math.sin(a) * d - 40) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg';
      document.body.appendChild(p); setTimeout(function (q) { return function () { q.remove(); }; }(p), 1300); }
  }
  // Le compteur flottant (espace client) et sa liste d'indices
  function compteur() {
    var vieux = document.querySelector('[data-cc-compteur]'); if (vieux) vieux.remove();
    if (!etat || !etat.connecte || ici !== new URL(C.espace, location.href).pathname.replace(/\/?$/, '/')) return;
    var n = etat.trouves.length, T = etat.total;
    var b = el('<div class="cc-compteur" data-cc-compteur><button type="button" class="cc-compteur-btn" aria-expanded="false" aria-controls="cc-indices"><span class="cc-compteur-art" aria-hidden="true">' + C.ruban + '</span><span class="cc-compteur-n"><b>' + n + '</b>/' + T + '</span><span class="sr-only"> Rubans trouvés : voir les indices</span></button>'
      + '<div class="cc-indices" id="cc-indices" hidden><p class="cc-indices-t">Les ' + T + ' Rubans cachés</p><ul></ul><p class="cc-indices-fin"></p><a class="cc-indices-regl" href="' + C.reglement + '">Le règlement du jeu</a></div></div>');
    var ul = b.querySelector('ul');
    etat.cachettes.forEach(function (c) { var ok = etat.trouves.indexOf(c.id) > -1; var li = el('<li class="' + (ok ? 'is-ok' : '') + '"><span class="cc-ind-ico" aria-hidden="true">' + (ok ? C.icones.check : '?') + '</span><span><b></b><small></small></span></li>'); li.querySelector('b').textContent = c.categorie + (ok ? ' : trouvé' : ''); li.querySelector('small').textContent = c.indice; ul.appendChild(li); });
    var fin = b.querySelector('.cc-indices-fin');
    if (etat.inscrit) fin.textContent = 'Vous participez au tirage au sort. Bonne chance !';
    else if (n >= T) { fin.innerHTML = '<button type="button" class="btn btn-primary cc-go-form">' + C.icones.gift + '<span>Je participe au tirage</span></button>'; fin.querySelector('button').addEventListener('click', formulaire); }
    else fin.textContent = 'Trouvez les ' + T + ' Rubans pour participer au tirage au sort.';
    var btn = b.querySelector('.cc-compteur-btn'), pan = b.querySelector('.cc-indices');
    btn.addEventListener('click', function () { var o = pan.hidden; pan.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
    document.body.appendChild(b);
  }
  // Le formulaire, une fois les cinq trouvés
  function formulaire() {
    var d = document.querySelector('[data-cc-dialog]'); if (d) d.remove();
    d = el('<dialog class="cc-dialog" data-cc-dialog aria-labelledby="cc-titre"><form method="dialog" class="cc-fermer-f"><button class="cc-fermer" aria-label="Fermer">' + C.icones.x + '</button></form>'
      + '<div class="cc-art" aria-hidden="true">' + C.ruban + '</div><h2 id="cc-titre">Bravo, vous avez trouvé les ' + etat.total + ' Rubans !</h2>'
      + '<p>Ils gardent un cadeau : <strong>' + C.lot + '</strong>. Vous en profitez gratuitement pendant un an, puis vous pouvez le garder en ligne avec le forfait Mini. Le site et le nom de domaine restent la propriété des Minis Monstres (voir le règlement).</p>'
      + '<div class="cc-deja" hidden><p class="cc-ok">' + C.icones.check + '<span>C’est noté : vous participez au tirage au sort. Bonne chance !</span></p></div>'
      + '<form class="cc-form"><label class="cc-label" for="cc-mail">Votre adresse e-mail</label><input class="cc-input" id="cc-mail" type="email" name="email" required autocomplete="email">'
      + '<label class="cc-label" for="cc-tel">Votre numéro de portable, pour vous appeler si vous gagnez</label><input class="cc-input" id="cc-tel" type="tel" name="tel" required autocomplete="tel" inputmode="tel" placeholder="06 12 34 56 78">'
      + '<label class="check cc-check"><input type="checkbox" name="accord" value="1" required><span>J’ai lu le <a href="' + C.reglement + '" target="_blank" rel="noopener">règlement du jeu</a> et je l’accepte. Une seule participation par personne et par numéro.</span></label>'
      + '<p class="cc-err" role="alert" hidden></p><button class="btn btn-primary cc-go" type="submit">' + C.icones.gift + '<span>Je participe</span></button></form></dialog>');
    document.body.appendChild(d);
    var f = d.querySelector('.cc-form'), err = d.querySelector('.cc-err');
    f.email.value = etat.email || '';
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); var go = f.querySelector('.cc-go'); go.disabled = true; err.hidden = true;
      post('aled08e_concours', { _cc: etat.nonce, email: f.email.value, tel: f.tel.value, accord: f.accord.checked ? '1' : '', appareil: appareil() }).then(function (j) {
        go.disabled = false;
        if (j && j.success) { f.hidden = true; d.querySelector('.cc-deja').hidden = false; etat.inscrit = true; compteur(); }
        else { err.textContent = (j && j.data && j.data.message) || 'Ça n’a pas marché. Réessayez dans un instant.'; err.hidden = false; }
      }).catch(function () { go.disabled = false; err.textContent = 'Ça n’a pas marché. Réessayez dans un instant.'; err.hidden = false; });
    });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  // Un Ruban caché sur cette page
  function cacher(r) {
    var cible = null; r.selecteur.split(',').some(function (s) { try { cible = document.querySelector(s.trim()); } catch (e) {} return !!cible; });
    if (!cible) return;
    var b = el('<button type="button" class="cc-ruban cc-' + r.coin + '" aria-label="Un petit monstre cadeau se cache ici : l’attraper">' + C.ruban + '</button>');
    cible.classList.add('cc-cachette'); cible.appendChild(b);
    b.addEventListener('click', function () {
      if (b.disabled) return; b.disabled = true;
      var z = b.getBoundingClientRect(); confettis(z.left + z.width / 2, z.top + z.height / 2); b.classList.add('cc-attrape');
      post('aled08e_ruban_trouve', { _cc: etat.nonce, jeton: r.jeton }).then(function (j) {
        setTimeout(function () { b.remove(); }, 900);
        if (!j || !j.success) { toast((j && j.data && j.data.message) || 'Ruban s’est échappé ! Rechargez la page.'); return; }
        etat.trouves = j.data.trouves; compteur();
        var n = etat.trouves.length;
        if (n >= etat.total && !etat.inscrit) setTimeout(formulaire, 950);
        else toast(n >= etat.total ? 'Vous avez trouvé les ' + etat.total + ' Rubans !' : 'Ruban trouvé : ' + n + ' sur ' + etat.total + '. Les indices sont dans votre espace client.');
      });
    });
  }
  post('aled08e_rubans', { chemin: ici }).then(function (j) {
    if (!j || !j.success) return; etat = j.data;
    if (!etat.connecte) return;
    (etat.ici || []).forEach(cacher); compteur();
  }).catch(function () {});
})(<?php echo wp_json_encode($cfg); ?>);
</script>
    <?php
}, 50);

/* L'état pour la page en cours : les Rubans de cette page (non trouvés), les trouvés, la participation */
function aled08e_concours_ajax_etat() {
    if (!aled08e_concours_ouvert()) wp_send_json_success(['ouvert' => false, 'connecte' => false]);
    $u = wp_get_current_user();
    if (!$u || !$u->ID || user_can($u, 'edit_posts')) wp_send_json_success(['ouvert' => true, 'connecte' => false]);
    $e = aled08e_concours_etat();
    $chemin = aled08e_concours_chemin(sanitize_text_field(wp_unslash($_POST['chemin'] ?? '')));
    $base = rtrim(aled08e_concours_chemin(wp_parse_url(home_url('/'), PHP_URL_PATH)), '/'); // un WordPress dans un sous-dossier
    if ($base !== '' && strpos($chemin, $base . '/') === 0) $chemin = aled08e_concours_chemin(substr($chemin, strlen($base)));
    $trouves = aled08e_concours_trouves($u->ID);
    $ici = []; $liste = [];
    foreach (aled08e_concours_cachettes() as $k => $c) {
        $liste[] = ['id' => $k, 'categorie' => $c['categorie'], 'indice' => $c['indice']];
        if (!isset($trouves[$k]) && aled08e_concours_chemin($c['chemin']) === $chemin) $ici[] = ['id' => $k, 'selecteur' => $c['selecteur'], 'coin' => $c['coin'], 'jeton' => aled08e_concours_jeton($e['id'], $k)];
    }
    $p = aled08e_concours_participation($u->ID);
    wp_send_json_success(['ouvert' => true, 'connecte' => true, 'total' => count($liste), 'cachettes' => $liste, 'trouves' => array_keys($trouves), 'ici' => $ici,
        'inscrit' => (bool) $p, 'email' => $p ? $p['email'] : $u->user_email, 'nonce' => wp_create_nonce('aled08e_concours')]);
}
add_action('wp_ajax_aled08e_rubans', 'aled08e_concours_ajax_etat');
add_action('wp_ajax_nopriv_aled08e_rubans', 'aled08e_concours_ajax_etat');

/* Un Ruban attrapé : le jeton secret de sa cachette, vérifié par le serveur */
add_action('wp_ajax_aled08e_ruban_trouve', function () {
    $non = function ($m) { wp_send_json_error(['message' => $m]); };
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_cc'] ?? '')), 'aled08e_concours')) $non('La page a expiré : rechargez-la, puis attrapez Ruban à nouveau.');
    if (!aled08e_concours_ouvert()) $non('Le jeu est terminé. Merci d’avoir cherché les Rubans !');
    $u = wp_get_current_user();
    if (!$u || !$u->ID || user_can($u, 'edit_posts')) $non('Ce compte ne peut pas participer.');
    $e = aled08e_concours_etat();
    $jeton = sanitize_text_field(wp_unslash($_POST['jeton'] ?? ''));
    $quel = '';
    foreach (array_keys(aled08e_concours_cachettes()) as $k) if (hash_equals(aled08e_concours_jeton($e['id'], $k), $jeton)) $quel = $k;
    if ($quel === '') $non('Ce Ruban n’est pas reconnu. Rechargez la page.');
    $t = aled08e_concours_trouves($u->ID);
    if (!isset($t[$quel])) { $t[$quel] = time(); update_user_meta($u->ID, aled08e_concours_cle($e['id'], 'rubans'), $t); }
    wp_send_json_success(['trouves' => array_keys($t)]);
});

/* La participation : les cinq Rubans trouvés, une par compte, par adresse e-mail et par numéro de portable */
add_action('wp_ajax_aled08e_concours', function () {
    $non = function ($m) { wp_send_json_error(['message' => $m]); };
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_cc'] ?? '')), 'aled08e_concours')) $non('La page a expiré : rechargez-la, puis réessayez.');
    if (!aled08e_concours_ouvert()) $non('Le jeu est terminé. Merci d’avoir cherché les Rubans !');
    $u = wp_get_current_user();
    if (!$u || !$u->ID || user_can($u, 'edit_posts')) $non('Ce compte ne peut pas participer.');
    $e = aled08e_concours_etat();
    if (count(aled08e_concours_trouves($u->ID)) < count(aled08e_concours_cachettes())) $non('Il faut d’abord trouver les ' . count(aled08e_concours_cachettes()) . ' Rubans.');
    if (aled08e_concours_participation($u->ID)) wp_send_json_success(['deja' => true]);
    if (empty($_POST['accord'])) $non('Cochez la case du règlement pour participer.');
    $email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
    if (!is_email($email)) $non('Cette adresse e-mail ne semble pas valable.');
    $tel = aled08e_concours_tel(wp_unslash($_POST['tel'] ?? ''));
    if ($tel === '') $non('Donnez un numéro de portable français (06 ou 07), par exemple 06 12 34 56 78.');
    foreach (aled08e_concours_inscrits($e['id']) as $i) {
        if (strtolower($i['email']) === strtolower($email)) $non('Cette adresse e-mail participe déjà au jeu.');
        if ($i['tel'] === $tel) $non('Ce numéro participe déjà au jeu : une seule participation par numéro.');
    }
    $app = preg_replace('/[^a-z0-9]/', '', strtolower((string) wp_unslash($_POST['appareil'] ?? '')));
    update_user_meta($u->ID, aled08e_concours_cle($e['id']), ['email' => $email, 'tel' => $tel, 'le' => current_time('mysql'), 'appareil' => substr($app, 0, 40), 'ip' => aled08e_concours_ip()]);
    wp_send_json_success(['ok' => true]);
});

/* ---------- l'API d'Alex (par Claude) ---------- */
add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/concours', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function () {
        $e = aled08e_concours_etat();
        $l = $e['id'] !== '' ? aled08e_concours_inscrits($e['id']) : [];
        $joueurs = 0; $parRuban = [];
        if ($e['id'] !== '') foreach (get_users(['meta_key' => aled08e_concours_cle($e['id'], 'rubans'), 'fields' => 'ID', 'number' => 5000]) as $uid) {
            $joueurs++;
            foreach (array_keys(aled08e_concours_trouves($uid, $e['id'])) as $k) $parRuban[$k] = ($parRuban[$k] ?? 0) + 1;
        }
        return new WP_REST_Response(['ouvert' => aled08e_concours_ouvert(), 'id' => $e['id'], 'ouvert_le' => $e['ouvert_le'], 'cachettes' => aled08e_concours_cachettes(),
            'joueurs' => $joueurs, 'trouves_par_ruban' => $parRuban, 'inscrits' => count($l), 'liste' => $l, 'tirages' => $e['tirages']], 200);
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
    if ($faire === 'ouvrir') {
        if (aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Un jeu est déjà ouvert (' . $e['id'] . ').', ['status' => 409]);
        $e['id'] = 'c' . wp_date('Ymd_His');
        $e['ouvert'] = true;
        $e['ouvert_le'] = current_time('mysql');
        update_option('aled08_concours', $e, false);
        return new WP_REST_Response(['ok' => true, 'id' => $e['id'], 'cachettes' => aled08e_concours_cachettes()], 200);
    }
    if ($faire === 'cachette') {
        $k = sanitize_key((string) ($p['cachette'] ?? ''));
        if (!isset(aled08e_concours_cachettes_defaut()[$k])) return new WP_Error('aled08_concours', 'Cachette inconnue : ' . implode(', ', array_keys(aled08e_concours_cachettes_defaut())) . '.', ['status' => 400]);
        $v = (array) ($e['cachettes'][$k] ?? []);
        foreach (['chemin', 'selecteur', 'indice', 'coin'] as $c) if (isset($p[$c]) && is_string($p[$c]) && trim($p[$c]) !== '') $v[$c] = sanitize_text_field($p[$c]);
        if (isset($v['coin']) && !in_array($v['coin'], ['haut-gauche', 'haut-droite', 'bas-gauche', 'bas-droite'], true)) unset($v['coin']);
        $e['cachettes'][$k] = $v;
        update_option('aled08_concours', $e, false);
        return new WP_REST_Response(['ok' => true, 'cachette' => aled08e_concours_cachettes()[$k]], 200);
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
        $e['tirages'][] = ['id' => $e['id'], 'le' => current_time('mysql'), 'user' => $g ? $g['user'] : 0, 'nom' => $g ? $g['nom'] : '', 'email' => $g ? $g['email'] : '', 'tel' => $g ? $g['tel'] : '', 'parmi' => $g ? $g['parmi'] : 0, 'faire' => $faire];
        update_option('aled08_concours', $e, false);
        if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Jeu-concours des Rubans : ' . ($faire === 'retirer' ? 'nouveau tirage' : 'tirage'), $g ? 'Gagnant tiré au sort parmi ' . $g['parmi'] . ' participations : ' . $g['nom'] . '.' : 'Aucune participation.', $g ? $g['user'] : 0, 'claude');
        return new WP_REST_Response(['ok' => true, 'ferme' => true, 'gagnant' => $g, 'note' => $g ? 'Gagnant tiré au hasard (random_int). Appelez-le au numéro donné et écrivez-lui : il a 15 jours pour répondre (règlement, article 7).' . ($g['doublon_possible'] ? ' Attention : ' . $g['doublon_possible'] . ', vérifiez avant de remettre le lot.' : '') : 'Personne n’a participé.'], 200);
    }
    return new WP_Error('aled08_concours', 'À faire inconnu (ouvrir, cachette, fermer, retirer).', ['status' => 400]);
}

/* Le ménage : les données d'un jeu tiré depuis plus de 3 mois sont effacées (une fois par jour au plus) */
add_action('init', function () {
    if (get_transient('aled08e_concours_menage')) return;
    set_transient('aled08e_concours_menage', 1, DAY_IN_SECONDS);
    $e = aled08e_concours_etat();
    $der = [];
    foreach ($e['tirages'] as $t) if (!isset($der[$t['id']]) || $t['le'] > $der[$t['id']]) $der[$t['id']] = $t['le'];
    $garde = [];
    foreach ($der as $id => $le) {
        if ($id === $e['id'] && aled08e_concours_ouvert()) continue;
        if (strtotime($le) < current_time('timestamp') - 90 * DAY_IN_SECONDS) {
            delete_metadata('user', 0, aled08e_concours_cle($id), '', true);
            delete_metadata('user', 0, aled08e_concours_cle($id, 'rubans'), '', true);
            $garde[] = $id;
        }
    }
    if ($garde) { // les coordonnées du gagnant disparaissent aussi de l'historique
        foreach ($e['tirages'] as &$t) if (in_array($t['id'], $garde, true)) { $t['email'] = ''; $t['tel'] = ''; }
        update_option('aled08_concours', $e, false);
    }
}, 45);
