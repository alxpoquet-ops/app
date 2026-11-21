<?php
/**
 * Le mode « je clique, je modifie » : le client change lui-même les textes et les photos de ses pages,
 * directement sur son site, sans compte WordPress.
 *
 * 1. Dans son application (l'espace client des Minis Monstres), le client clique « Modifier mon site ».
 *    L'application fabrique un lien valable 10 minutes et une seule fois, signé avec la clé partagée du connecteur.
 * 2. Le site vérifie la signature et pose un cookie de modification (2 heures, HttpOnly, propre à ce navigateur).
 * 3. Tant que le cookie est là, chaque page montre une petite barre : un clic sur un texte de la page le rend
 *    modifiable, un clic sur une photo permet d'en mettre une autre. Rien d'autre (mise en page, menus, réglages).
 * 4. Chaque changement est enregistré avec une révision juste avant : « Annuler » revient en arrière.
 */
defined('ABSPATH') || exit;

define('ALEXLIA_ED_COOKIE', 'alexlia_edition');

function alexlia_ed_signer($donnees) {
    return hash_hmac('sha256', 'alexlia-edition|' . $donnees, alexlia_conn_secret());
}
function alexlia_ed_b64($s) { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function alexlia_ed_unb64($s) { return (string) base64_decode(strtr($s, '-_', '+/')); }

/* Le lien de l'application : ?alexlia_editer=CHARGE.SIGNATURE (charge = {exp, n}) */
function alexlia_ed_jeton_valide($jeton) {
    if (alexlia_conn_secret() === '' || get_option('alexlia_pause') === '1') return null;
    $p = explode('.', (string) $jeton);
    if (count($p) !== 2 || !hash_equals(alexlia_ed_signer('jeton|' . $p[0]), $p[1])) return null;
    $d = json_decode(alexlia_ed_unb64($p[0]), true);
    if (!is_array($d) || empty($d['n']) || !preg_match('/^[a-f0-9]{16,64}$/', (string) $d['n'])) return null;
    $exp = (int) ($d['exp'] ?? 0);
    if ($exp < time() || $exp > time() + 900) return null;
    if (get_transient('alexlia_ed_lien_' . $d['n'])) return null; // un lien ne sert qu'une fois
    set_transient('alexlia_ed_lien_' . $d['n'], 1, HOUR_IN_SECONDS);
    return ['n' => (string) $d['n']];
}

/* Le cookie : EXP.N.SIGNATURE ; renvoie N (l'identifiant de la séance) ou '' */
function alexlia_ed_seance() {
    static $n = null;
    if ($n !== null) return $n;
    $n = '';
    $c = (string) ($_COOKIE[ALEXLIA_ED_COOKIE] ?? '');
    if ($c === '' || alexlia_conn_secret() === '' || get_option('alexlia_pause') === '1') return $n;
    $p = explode('.', $c);
    if (count($p) !== 3 || (int) $p[0] < time() || !preg_match('/^[a-f0-9]{16,64}$/', $p[1])) return $n;
    if (!hash_equals(alexlia_ed_signer('cookie|' . $p[0] . '|' . $p[1]), $p[2])) return $n;
    if (get_transient('alexlia_ed_fini_' . $p[1])) return $n;
    $n = $p[1];
    return $n;
}
function alexlia_ed_actif() { return alexlia_ed_seance() !== ''; }
function alexlia_ed_anti_rebond() { return alexlia_ed_signer('page|' . alexlia_ed_seance()); }

add_action('init', function () {
    if (empty($_GET['alexlia_editer']) || is_admin()) return;
    nocache_headers();
    $ok = alexlia_ed_jeton_valide(wp_unslash($_GET['alexlia_editer']));
    if (!$ok) wp_die('Ce lien de modification n’est plus valable. Ouvrez-en un nouveau depuis votre application, avec le bouton « Modifier mon site ».', 'Lien expiré', ['response' => 403]);
    $exp = time() + 2 * HOUR_IN_SECONDS;
    setcookie(ALEXLIA_ED_COOKIE, $exp . '.' . $ok['n'] . '.' . alexlia_ed_signer('cookie|' . $exp . '|' . $ok['n']), ['expires' => $exp, 'path' => '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax']);
    alexlia_conn_journal('Mode modification ouvert depuis l’application du client.');
    wp_safe_redirect(remove_query_arg('alexlia_editer') ?: home_url('/'), 302);
    exit;
}, 1);

/* ---------- Sur les pages, en mode modification ---------- */
add_action('wp', function () {
    if (is_admin() || !alexlia_ed_actif()) return;
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
    nocache_headers();
    // le texte affiché doit être celui enregistré, caractère pour caractère
    remove_filter('the_content', 'wptexturize');
    remove_filter('the_content', 'convert_smilies', 20);
    add_filter('the_content', 'alexlia_ed_reperes', 9999);
    add_action('wp_footer', 'alexlia_ed_barre', 9999);
    add_filter('show_admin_bar', '__return_false');
});
/* Deux repères invisibles encadrent le contenu de la page : seul ce qui est entre eux se modifie */
function alexlia_ed_reperes($c) {
    static $faits = [];
    $id = (int) get_the_ID();
    if (!$id || !is_singular() || $id !== (int) get_queried_object_id() || isset($faits[$id]) || !alexlia_conn_post($id)) return $c;
    $faits[$id] = true;
    return '<span hidden data-alexlia-debut="' . $id . '"></span>' . $c . '<span hidden data-alexlia-fin="' . $id . '"></span>';
}

function alexlia_ed_barre() {
    $cfg = ['api' => esc_url_raw(rest_url('alexlia/v1/edition/')), 'jeton' => alexlia_ed_anti_rebond()];
    ?>
<style id="alexlia-edition-css">
.ale-barre{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;width:max-content;max-width:calc(100% - 20px);padding:10px 12px;border-radius:20px;background:#2E2A47;color:#fff;font:500 14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 16px 40px -12px rgba(0,0,0,.45)}
.ale-barre p{margin:0;padding:0 4px;max-width:34em;color:#fff}
.ale-barre button,.ale-pop button{appearance:none;border:0;border-radius:999px;padding:8px 14px;font:700 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;background:#fff;color:#2E2A47}
.ale-barre button.ale-fin{background:#7EDDB5}
.ale-modifiable{outline:2px dashed rgba(140,108,242,.55)!important;outline-offset:3px;border-radius:4px;cursor:text!important}
.ale-modifiable:hover{outline-color:#8C6CF2!important;background:rgba(140,108,242,.07)}
.ale-en-cours{outline:3px solid #8C6CF2!important;outline-offset:3px;background:#fff!important;color:#2E2A47!important}
img.ale-photo{outline:3px dashed rgba(255,143,94,.75)!important;outline-offset:-3px;cursor:pointer!important}
.ale-pop{position:absolute;z-index:2147483001;display:flex;gap:6px;padding:6px;border-radius:999px;background:#2E2A47;box-shadow:0 10px 26px -10px rgba(0,0,0,.5)}
.ale-pop button.ale-ok{background:#7EDDB5}
.ale-toast{position:fixed;left:50%;top:calc(16px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147483002;padding:10px 16px;border-radius:14px;background:#2E2A47;color:#fff;font:600 14px/1.35 system-ui,-apple-system,sans-serif;max-width:calc(100% - 24px);box-shadow:0 10px 26px -10px rgba(0,0,0,.5)}
.ale-toast.ale-erreur{background:#A3305F}
</style>
<div class="ale-barre" role="region" aria-label="Mode modification">
  <p data-ale-aide>Mode modification : cliquez sur un texte ou une photo de la page pour le changer.</p>
  <button type="button" data-ale-annuler hidden>Annuler la dernière</button>
  <button type="button" class="ale-fin" data-ale-fin>Terminer</button>
</div>
<script id="alexlia-edition-js">
(function(){
  var C = <?php echo wp_json_encode($cfg); ?>;
  var BLOCS = /^(P|H1|H2|H3|H4|H5|H6|LI|FIGCAPTION|BLOCKQUOTE|TD|TH|DT|DD|SUMMARY|BUTTON|LABEL)$/;
  var debut = document.querySelector('[data-alexlia-debut]');
  var aide = document.querySelector('[data-ale-aide]');
  var btnAnnuler = document.querySelector('[data-ale-annuler]');
  function toast(t, err){ var d=document.createElement('div'); d.className='ale-toast'+(err?' ale-erreur':''); d.setAttribute('role','status'); d.textContent=t; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, err?6000:2600); }
  function appel(chemin, corps, fichier){
    var o = {method:'POST', credentials:'same-origin', headers:{'X-Alexlia-Edition':C.jeton}};
    if (fichier) { o.body = corps; } else { o.headers['Content-Type']='application/json'; o.body = JSON.stringify(corps||{}); }
    return fetch(C.api + chemin, o).then(function(r){ return r.text().then(function(t){
      var j = null; try { j = JSON.parse(t); } catch(e) {}
      if (!j && /Security check|Test de s.curit/i.test(t)) throw new Error('Le site a demandé une petite vérification de sécurité : rechargez la page, puis recommencez.');
      if (!j) throw new Error(r.status === 429 ? 'Le site reçoit beaucoup de visites en ce moment : réessayez dans quelques secondes.' : 'Le site n’a pas répondu comme prévu. Réessayez dans un instant.');
      if (!r.ok) throw new Error(j.message || 'Ça n’a pas marché. Réessayez dans un instant.');
      return j; }); });
  }
  document.querySelector('[data-ale-fin]').addEventListener('click', function(){ sessionStorage.removeItem('ale-annuler'); appel('terminer').then(function(){ location.reload(); }).catch(function(){ location.reload(); }); });
  btnAnnuler.addEventListener('click', function(){ appel('annuler').then(function(j){ toast(j.message||'C’est annulé.'); setTimeout(function(){ location.reload(); }, 700); }).catch(function(e){ toast(e.message, true); }); });
  if (sessionStorage.getItem('ale-annuler')) btnAnnuler.hidden = false;
  if (!debut) { aide.textContent = 'Sur cette page, les textes viennent de la mise en page : pour les changer, faites une demande depuis votre application. Les autres pages se modifient ici.'; return; }
  var id = debut.getAttribute('data-alexlia-debut');
  var fin = document.querySelector('[data-alexlia-fin="'+id+'"]');
  // tout ce qui est entre les deux repères
  var zone = [], n = debut.nextSibling;
  while (n && n !== fin) { if (n.nodeType === 1) zone.push(n); n = n.nextSibling; }
  function dansZone(el){ for (var i=0;i<zone.length;i++) if (zone[i]===el || zone[i].contains(el)) return true; return false; }
  function tous(sel){ var r=[]; zone.forEach(function(z){ if (z.matches && z.matches(sel)) r.push(z); Array.prototype.push.apply(r, z.querySelectorAll(sel)); }); return r; }
  // un texte modifiable : un bloc de texte (paragraphe, titre, élément de liste…) sans autre bloc dedans ; ou le texte d'un bouton-lien
  var textes = tous('p,h1,h2,h3,h4,h5,h6,li,figcaption,blockquote,td,th,dt,dd,summary,a').filter(function(el){
    if (!el.textContent.trim()) return false;
    if (el.tagName === 'A') return /btn|button/i.test(el.className) && !el.closest('p,li,h1,h2,h3,h4,h5,h6');
    if (el.querySelector('p,h1,h2,h3,h4,h5,h6,li,ul,ol,div,section,figure,table,blockquote,img,svg,iframe,form,input,select,textarea')) return false;
    return true;
  });
  textes.forEach(function(el){ el.classList.add('ale-modifiable'); });
  var photos = tous('img').filter(function(im){ return im.getAttribute('src'); });
  photos.forEach(function(im){ im.classList.add('ale-photo'); });
  if (!textes.length && !photos.length) aide.textContent = 'Rien à modifier directement sur cette page : faites une demande depuis votre application.';
  var pop = null, courant = null, avant = '';
  function fermerPop(){ if (pop) { pop.remove(); pop = null; } }
  function placer(p, el){ var r = el.getBoundingClientRect(); p.style.top = (window.scrollY + r.bottom + 8) + 'px'; p.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - p.offsetWidth - 8)) + 'px'; }
  function rang(el, html){ var k=0; for (var i=0;i<textes.length;i++){ if (textes[i]===el) return k; if ((textes[i].getAttribute('data-ale-avant')||textes[i].innerHTML)===html) k++; } return 0; }
  function arreter(garder){
    if (!courant) return;
    var el = courant; courant = null; fermerPop();
    el.removeAttribute('contenteditable'); el.classList.remove('ale-en-cours');
    if (!garder) { el.innerHTML = avant; return; }
    var apres = el.innerHTML;
    if (apres === avant) return;
    if (!el.textContent.trim()) { el.innerHTML = avant; toast('Un texte ne peut pas rester vide. Pour retirer un passage, faites une demande depuis votre application.', true); return; }
    appel('texte', {post:+id, avant:avant, apres:apres, rang:rang(el, avant)}).then(function(j){
      el.innerHTML = j.html; el.removeAttribute('data-ale-avant'); sessionStorage.setItem('ale-annuler','1'); btnAnnuler.hidden = false; toast('C’est enregistré : votre site est à jour.');
    }).catch(function(e){ el.innerHTML = avant; toast(e.message, true); });
  }
  textes.forEach(function(el){
    el.addEventListener('click', function(ev){
      if (courant === el) return;
      ev.preventDefault(); ev.stopPropagation();
      if (courant) arreter(true);
      courant = el; avant = el.innerHTML; el.setAttribute('data-ale-avant', avant);
      el.setAttribute('contenteditable', 'true'); el.classList.add('ale-en-cours'); el.focus();
      pop = document.createElement('div'); pop.className = 'ale-pop';
      pop.innerHTML = '<button type="button" class="ale-ok">Enregistrer</button><button type="button">Annuler</button>';
      document.body.appendChild(pop); placer(pop, el);
      pop.firstChild.addEventListener('mousedown', function(e){ e.preventDefault(); arreter(true); });
      pop.lastChild.addEventListener('mousedown', function(e){ e.preventDefault(); arreter(false); });
    }, true);
    el.addEventListener('keydown', function(ev){
      if (courant !== el) return;
      if (ev.key === 'Escape') { ev.preventDefault(); arreter(false); }
      if (ev.key === 'Enter' && !ev.shiftKey && !/^(LI|P|BLOCKQUOTE|TD|DD)$/.test(el.tagName)) { ev.preventDefault(); arreter(true); }
    });
    el.addEventListener('paste', function(ev){ ev.preventDefault(); var t=(ev.clipboardData||window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t); });
  });
  // une photo : on en choisit une autre sur le téléphone ou l'ordinateur
  var choix = document.createElement('input'); choix.type = 'file'; choix.accept = 'image/jpeg,image/png,image/webp'; choix.hidden = true; document.body.appendChild(choix);
  var photoCourante = null;
  photos.forEach(function(im){
    var lien = im.closest('a');
    (lien || im).addEventListener('click', function(ev){
      if (ev.target !== im) return;
      ev.preventDefault(); ev.stopPropagation();
      if (courant) arreter(true);
      fermerPop(); photoCourante = im;
      pop = document.createElement('div'); pop.className = 'ale-pop';
      pop.innerHTML = '<button type="button" class="ale-ok">Changer la photo</button><button type="button">Fermer</button>';
      document.body.appendChild(pop); placer(pop, im);
      pop.firstChild.addEventListener('click', function(){ choix.value=''; choix.click(); });
      pop.lastChild.addEventListener('click', fermerPop);
    }, true);
  });
  choix.addEventListener('change', function(){
    var f = choix.files && choix.files[0]; if (!f || !photoCourante) return;
    if (f.size > 8*1024*1024) { toast('Cette photo est trop lourde (8 Mo au plus).', true); return; }
    var fd = new FormData(); fd.append('post', id); fd.append('src', photoCourante.getAttribute('src')); fd.append('rang', photos.filter(function(p){ return p.getAttribute('src')===photoCourante.getAttribute('src'); }).indexOf(photoCourante)); fd.append('fichier', f);
    fermerPop(); toast('Envoi de la photo…');
    appel('image', fd, true).then(function(j){ photoCourante.src = j.url; photoCourante.removeAttribute('srcset'); photoCourante.removeAttribute('sizes'); sessionStorage.setItem('ale-annuler','1'); btnAnnuler.hidden = false; toast('Nouvelle photo en place.'); })
      .catch(function(e){ toast(e.message, true); });
  });
  document.addEventListener('mousedown', function(ev){ if (courant && !courant.contains(ev.target) && !(pop && pop.contains(ev.target))) arreter(true); });
})();
</script>
    <?php
}

/* ---------- Les enregistrements ---------- */
/* Ces routes ont leur propre contrôle (cookie signé + jeton de page) : un en-tête d'identification étranger ne les bloque pas */
add_filter('rest_authentication_errors', function ($r) {
    if (is_wp_error($r) && strpos((string) ($_SERVER['REQUEST_URI'] ?? ''), '/alexlia/v1/edition/') !== false && alexlia_ed_actif()) return true;
    return $r;
}, 999);
add_action('rest_api_init', function () {
    foreach (['texte', 'image', 'annuler', 'terminer'] as $quoi) {
        register_rest_route('alexlia/v1', '/edition/' . $quoi, ['methods' => 'POST', 'callback' => 'alexlia_ed_' . $quoi, 'permission_callback' => 'alexlia_ed_autorise']);
    }
});
function alexlia_ed_autorise(WP_REST_Request $req) {
    if (!alexlia_ed_actif()) return new WP_Error('alexlia_edition', 'Le mode modification est fermé. Rouvrez-le depuis votre application.', ['status' => 401]);
    if (!hash_equals(alexlia_ed_anti_rebond(), (string) $req->get_header('x_alexlia_edition'))) return new WP_Error('alexlia_edition', 'Demande refusée. Rechargez la page.', ['status' => 403]);
    // au plus 300 changements par séance
    $k = 'alexlia_ed_nb_' . alexlia_ed_seance();
    $nb = (int) get_transient($k);
    if ($nb >= 300) return new WP_Error('alexlia_edition', 'Beaucoup de changements d’un coup : faites une pause, puis rouvrez le mode modification.', ['status' => 429]);
    set_transient($k, $nb + 1, 3 * HOUR_IN_SECONDS);
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID']);
    if ($admins) wp_set_current_user($admins[0]->ID); // pour les révisions, comme les autres actions du connecteur
    return true;
}
/* La pile des retours en arrière de la séance : [post, révision d'avant] */
function alexlia_ed_empiler($post, $rev) {
    if (!$rev) return;
    $k = 'alexlia_ed_pile_' . alexlia_ed_seance();
    $pile = get_transient($k);
    $pile = is_array($pile) ? $pile : [];
    $pile[] = [(int) $post, (int) $rev];
    set_transient($k, array_slice($pile, -50), 3 * HOUR_IN_SECONDS);
}
/* Le n-ième passage identique, avec les deux façons d'écrire l'espace insécable */
function alexlia_ed_trouver($tout, $avant, $rang) {
    $nbsp = "\u{00A0}";
    $formes = array_unique([$avant, str_replace('&nbsp;', $nbsp, $avant), str_replace($nbsp, '&nbsp;', $avant), str_replace(['&nbsp;', $nbsp], ' ', $avant)]);
    foreach ($formes as $f) {
        if ($f === '') continue;
        $pos = [];
        for ($i = strpos($tout, $f); $i !== false; $i = strpos($tout, $f, $i + 1)) $pos[] = $i;
        if (!$pos) continue;
        $p = $pos[min(max(0, (int) $rang), count($pos) - 1)];
        return [$p, strlen($f)];
    }
    return null;
}
function alexlia_ed_enregistrer($p, $contenu, $quoi) {
    $rev = alexlia_conn_revision_avant($p);
    $r = wp_update_post(wp_slash(['ID' => $p->ID, 'post_content' => $contenu]), true);
    if (is_wp_error($r)) return $r;
    alexlia_ed_empiler($p->ID, $rev);
    alexlia_conn_journal('Modification en direct par le client : ' . $quoi . ' sur « ' . $p->post_title . ' ».');
    return true;
}
function alexlia_ed_texte(WP_REST_Request $req) {
    $d = (array) $req->get_json_params();
    $p = alexlia_conn_post($d['post'] ?? 0);
    if (!$p) return new WP_Error('alexlia_edition', 'Cette page ne se modifie pas ici.', ['status' => 404]);
    $avant = (string) ($d['avant'] ?? '');
    $apres = (string) ($d['apres'] ?? '');
    if ($avant === '' || strlen($avant) > 20000 || strlen($apres) > 20000) return new WP_Error('alexlia_edition', 'Texte trop long.', ['status' => 400]);
    // seuls les petits styles du texte restent : liens, gras, italique, retours à la ligne
    $apres = wp_kses($apres, ['a' => ['href' => true, 'target' => true, 'rel' => true, 'class' => true], 'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'br' => [], 'span' => ['class' => true]]);
    $apres = preg_replace('#(<br\s*/?>\s*)+$#u', '', $apres);
    if (trim(wp_strip_all_tags(str_replace('&nbsp;', ' ', $apres))) === '') return new WP_Error('alexlia_edition', 'Un texte ne peut pas rester vide.', ['status' => 400]);
    $ici = alexlia_ed_trouver($p->post_content, $avant, (int) ($d['rang'] ?? 0));
    if (!$ici) return new WP_Error('alexlia_edition', 'Ce texte vient de la mise en page du site : il se change par une demande depuis votre application.', ['status' => 409]);
    $contenu = substr($p->post_content, 0, $ici[0]) . $apres . substr($p->post_content, $ici[0] + $ici[1]);
    $ok = alexlia_ed_enregistrer($p, $contenu, 'un texte');
    if (is_wp_error($ok)) return $ok;
    return ['ok' => true, 'html' => $apres];
}
function alexlia_ed_image(WP_REST_Request $req) {
    $p = alexlia_conn_post($req->get_param('post'));
    if (!$p) return new WP_Error('alexlia_edition', 'Cette page ne se modifie pas ici.', ['status' => 404]);
    $src = (string) $req->get_param('src');
    $f = $req->get_file_params()['fichier'] ?? null;
    if ($src === '' || !$f || !empty($f['error']) || empty($f['tmp_name'])) return new WP_Error('alexlia_edition', 'La photo n’est pas arrivée. Réessayez.', ['status' => 400]);
    if ((int) $f['size'] > 8 * 1024 * 1024) return new WP_Error('alexlia_edition', 'Cette photo est trop lourde (8 Mo au plus).', ['status' => 413]);
    $t = wp_check_filetype_and_ext($f['tmp_name'], (string) $f['name']);
    if (!in_array($t['type'] ?? '', ['image/jpeg', 'image/png', 'image/webp'], true)) return new WP_Error('alexlia_edition', 'Choisissez une photo JPG, PNG ou WebP.', ['status' => 415]);
    // la photo à remplacer doit être dans le contenu de la page
    $balises = [];
    if (preg_match_all('#<img\b[^>]*>#iu', $p->post_content, $m, PREG_OFFSET_CAPTURE)) {
        foreach ($m[0] as $b) if (preg_match('#\ssrc=(["\'])' . preg_quote($src, '#') . '\1#u', $b[0])) $balises[] = $b;
    }
    if (!$balises) return new WP_Error('alexlia_edition', 'Cette photo vient de la mise en page du site : elle se change par une demande depuis votre application.', ['status' => 409]);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $aid = media_handle_sideload(['name' => sanitize_file_name((string) $f['name']), 'tmp_name' => $f['tmp_name']], $p->ID);
    if (is_wp_error($aid)) return new WP_Error('alexlia_edition', 'La photo n’a pas pu être enregistrée.', ['status' => 500]);
    $grand = wp_get_attachment_image_src($aid, 'large') ?: wp_get_attachment_image_src($aid, 'full');
    $url = $grand ? $grand[0] : wp_get_attachment_url($aid);
    $b = $balises[min(max(0, (int) $req->get_param('rang')), count($balises) - 1)];
    $nouvelle = preg_replace('#\s(srcset|sizes)=(["\']).*?\2#iu', '', $b[0]);
    $nouvelle = preg_replace('#\ssrc=(["\'])' . preg_quote($src, '#') . '\1#u', ' src="' . esc_url($url) . '"', $nouvelle, 1);
    if ($grand) {
        $nouvelle = preg_replace('#\swidth=(["\'])\d+\1#iu', ' width="' . (int) $grand[1] . '"', $nouvelle);
        $nouvelle = preg_replace('#\sheight=(["\'])\d+\1#iu', ' height="' . (int) $grand[2] . '"', $nouvelle);
    }
    $nouvelle = preg_replace('#wp-image-\d+#u', 'wp-image-' . (int) $aid, $nouvelle);
    $contenu = substr($p->post_content, 0, $b[1]) . $nouvelle . substr($p->post_content, $b[1] + strlen($b[0]));
    $ok = alexlia_ed_enregistrer($p, $contenu, 'une photo');
    if (is_wp_error($ok)) return $ok;
    return ['ok' => true, 'url' => $url];
}
function alexlia_ed_annuler() {
    $k = 'alexlia_ed_pile_' . alexlia_ed_seance();
    $pile = get_transient($k);
    $pile = is_array($pile) ? $pile : [];
    $der = array_pop($pile);
    if (!$der) return new WP_Error('alexlia_edition', 'Il n’y a rien à annuler.', ['status' => 404]);
    set_transient($k, $pile, 3 * HOUR_IN_SECONDS);
    $r = wp_restore_post_revision($der[1]);
    if (!$r || is_wp_error($r)) return new WP_Error('alexlia_edition', 'Le retour en arrière n’a pas pu se faire.', ['status' => 500]);
    alexlia_conn_journal('Modification en direct annulée par le client.');
    return ['ok' => true, 'message' => $pile ? 'C’est annulé.' : 'C’est annulé : la page est revenue comme avant.', 'reste' => count($pile)];
}
function alexlia_ed_terminer() {
    set_transient('alexlia_ed_fini_' . alexlia_ed_seance(), 1, 3 * HOUR_IN_SECONDS);
    setcookie(ALEXLIA_ED_COOKIE, '', ['expires' => time() - 3600, 'path' => '/', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax']);
    alexlia_conn_journal('Mode modification fermé par le client.');
    return ['ok' => true];
}
