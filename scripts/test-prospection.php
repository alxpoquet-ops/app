<?php
/**
 * Test de la prospection par e-mail (src/wordpress/aled08-espace/includes/prospection.php), sans WordPress :
 * de petites doublures en mémoire (options, articles et métas, e-mails) suffisent pour vérifier les garde-fous.
 *
 *   php scripts/test-prospection.php
 *
 * Rien n'est envoyé : wp_mail est remplacé par une boîte en mémoire. data.json est fabriqué à la volée (scripts/wp-espace-data.js).
 * L'aperçu du mail est écrit dans le dossier donné en premier argument (facultatif), pour le regarder dans un navigateur.
 */
error_reporting(E_ALL);
define('ABSPATH', __DIR__ . '/');
define('DAY_IN_SECONDS', 86400);
define('HOUR_IN_SECONDS', 3600);
define('WEEK_IN_SECONDS', 604800);
define('MINUTE_IN_SECONDS', 60);
date_default_timezone_set('UTC');

/* ---------------------------------------------------------------- doublures de WordPress */
$GLOBALS['T'] = ['options' => [], 'posts' => [], 'metas' => [], 'mails' => [], 'actions' => [], 'filtres' => [], 'n' => 100];
class WP_Error { public $c; public $m; public $d; function __construct($c = '', $m = '', $d = []) { $this->c = $c; $this->m = $m; $this->d = $d; } function get_error_message() { return $this->m; } function get_error_data() { return $this->d; } }
class WP_REST_Response { public $data; public $status; function __construct($d = null, $s = 200) { $this->data = $d; $this->status = $s; } function get_data() { return $this->data; } }
class WP_REST_Request { private $j; function __construct($m = 'GET', $r = '', $j = []) { $this->j = $j; } function get_json_params() { return $this->j; } function get_param($k) { return $this->j[$k] ?? null; } }
function is_wp_error($x) { return $x instanceof WP_Error; }
function add_action($h, $cb, $p = 10, $n = 1) { $GLOBALS['T']['actions'][$h][] = $cb; return true; }
function add_filter($h, $cb, $p = 10, $n = 1) { $GLOBALS['T']['filtres'][$h][] = $cb; return true; }
function remove_action($h, $cb, $p = 10) { return true; }
function do_action($h, ...$a) { foreach ($GLOBALS['T']['actions'][$h] ?? [] as $cb) $cb(...$a); }
function apply_filters($h, $v, ...$a) { foreach ($GLOBALS['T']['filtres'][$h] ?? [] as $cb) $v = $cb($v, ...$a); return $v; }
function get_option($k, $d = false) { return array_key_exists($k, $GLOBALS['T']['options']) ? $GLOBALS['T']['options'][$k] : $d; }
function update_option($k, $v, $a = null) { $GLOBALS['T']['options'][$k] = $v; return true; }
function delete_option($k) { unset($GLOBALS['T']['options'][$k]); return true; }
function wp_timezone() { return new DateTimeZone('Europe/Paris'); }
function wp_date($f, $t = null) { $d = new DateTime('@' . ($t ?? time())); $d->setTimezone(wp_timezone()); $mois = ['January' => 'janvier', 'February' => 'février', 'March' => 'mars', 'April' => 'avril', 'May' => 'mai', 'June' => 'juin', 'July' => 'juillet', 'August' => 'août', 'September' => 'septembre', 'October' => 'octobre', 'November' => 'novembre', 'December' => 'décembre']; return strtr($d->format($f), $mois); }
function esc_html($t) { return htmlspecialchars((string) $t, ENT_QUOTES, 'UTF-8'); }
function esc_attr($t) { return esc_html($t); }
function esc_url($u) { return esc_html($u); }
function esc_url_raw($u, $p = []) { return filter_var($u, FILTER_VALIDATE_URL) ? $u : ''; }
function wp_parse_url($u, $c = -1) { return parse_url($u, $c); }
function home_url($p = '') { return 'https://www.les-minis-monstres.fr' . ($p ?: '/'); }
function add_query_arg($k, $v, $u) { return $u . (strpos($u, '?') === false ? '?' : '&') . $k . '=' . rawurlencode($v); }
function get_template_directory_uri() { return 'https://www.les-minis-monstres.fr/wp-content/themes/lmm'; }
function wp_strip_all_tags($t) { return trim(strip_tags((string) $t)); }
function is_email($e) { return filter_var($e, FILTER_VALIDATE_EMAIL) ? $e : false; }
function remove_accents($t) { return iconv('UTF-8', 'ASCII//TRANSLIT', (string) $t); }
function sanitize_key($k) { return preg_replace('/[^a-z0-9_\-]/', '', strtolower((string) $k)); }
function sanitize_text_field($t) { return trim(strip_tags((string) $t)); }
function wp_generate_password($n = 12, $s = true, $x = false) { return substr(bin2hex(random_bytes($n)), 0, $n); }
function current_user_can($c) { return true; }
function checked($a, $b, $e = true) { return $a === $b ? ' checked' : ''; }
function get_user_by($k, $v) { return $v === 'deja.client@exemple.fr' ? (object) ['ID' => 1] : false; }
function wp_mail($a, $s, $m, $h = []) { $GLOBALS['T']['mails'][] = compact('a', 's', 'm', 'h'); return true; }
function aled08e_to() { return 'alex@exemple.fr'; }
function aled08e_mail_from() { return 'contact@lesminismonstres.fr'; }
function aled08e_mail_headers($reply = '') { $h = ['Content-Type: text/plain; charset=UTF-8']; if ($reply) $h[] = 'Reply-To: ' . $reply; return $h; }
function aled08e_icon($n) { return ''; }
function aled08e_clean_code($c) { return strtoupper(substr(preg_replace('/[^A-Za-z0-9-]/', '', (string) $c), 0, 20)); }
function aled08e_code_evenement_ok($c) { return false; }
function aled08e_regles_texte($n) { return 'fiche ' . $n; }
function aled08e_memoire_lire($a = []) { return []; }
function aled08e_cmd_journal($id, $t) {}
function aled08e_euro($n) { $n = (float) $n; return number_format($n, floor($n) == $n ? 0 : 2, ',', ' ') . '&nbsp;€'; }
function aled08e_euro_txt($n) { $n = (float) $n; return number_format($n, floor($n) == $n ? 0 : 2, ',', ' ') . ' €'; }
function aled08e_data() { static $d = null; if ($d === null) $d = json_decode(shell_exec('node ' . escapeshellarg(__DIR__ . '/wp-espace-data.js')), true); return $d; }
function aled08e_type($id) { foreach (aled08e_data()['types'] as $t) if ($t['id'] === $id) return $t; return null; }
// articles et métas
function wp_insert_post($a, $e = false) { $id = ++$GLOBALS['T']['n']; $GLOBALS['T']['posts'][$id] = (object) ($a + ['ID' => $id, 'post_date' => date('Y-m-d H:i:s')]); $GLOBALS['T']['posts'][$id]->ID = $id; return $id; }
function get_post($id) { return $GLOBALS['T']['posts'][(int) $id] ?? null; }
function get_the_date($f, $p) { return date($f, strtotime($p->post_date)); }
function get_the_title($id) { return $GLOBALS['T']['posts'][(int) $id]->post_title ?? ''; }
function wp_delete_post($id, $f = false) { unset($GLOBALS['T']['posts'][(int) $id], $GLOBALS['T']['metas'][(int) $id]); }
function get_post_meta($id, $k, $s = false) { return $GLOBALS['T']['metas'][(int) $id][$k] ?? ''; }
function update_post_meta($id, $k, $v) { $GLOBALS['T']['metas'][(int) $id][$k] = $v; return true; }
function delete_post_meta($id, $k) { unset($GLOBALS['T']['metas'][(int) $id][$k]); return true; }
function get_posts($q) {
    $out = [];
    foreach ($GLOBALS['T']['posts'] as $id => $p) {
        if (($q['post_type'] ?? '') !== ($p->post_type ?? '')) continue;
        $ok = true;
        foreach ((array) ($q['meta_query'] ?? []) as $c) {
            $v = $GLOBALS['T']['metas'][$id][$c['key']] ?? null;
            $cmp = $c['compare'] ?? '=';
            if ($cmp === 'EXISTS') $ok = $ok && $v !== null;
            elseif ($cmp === 'IN') $ok = $ok && in_array((string) $v, array_map('strval', (array) $c['value']), true);
            elseif ($cmp === '<') $ok = $ok && $v !== null && (float) $v < (float) $c['value'];
            else $ok = $ok && $v !== null && (string) $v === (string) $c['value'];
        }
        if ($ok) $out[] = $id;
    }
    $out = array_slice($out, 0, (int) ($q['numberposts'] ?? 5));
    return ($q['fields'] ?? '') === 'ids' ? $out : array_map('get_post', $out);
}
class FauxWpdb {
    public $postmeta = 'pm', $posts = 'p';
    function prepare($sql, ...$a) { return [$sql, $a]; }
    function get_results($q) { $n = []; foreach ($GLOBALS['T']['posts'] as $id => $p) { $e = $GLOBALS['T']['metas'][$id]['_aled08_px_etat'] ?? null; if ($e !== null) $n[$e] = ($n[$e] ?? 0) + 1; } $o = []; foreach ($n as $e => $c) $o[] = (object) ['e' => $e, 'n' => $c]; return $o; }
    function get_var($q) { $s = 0; foreach ($GLOBALS['T']['metas'] as $m) $s += (int) ($m['_aled08_px_nb_clics'] ?? 0); return $s; }
}
$GLOBALS['wpdb'] = new FauxWpdb();
define('ALED08E_CPT_PROSPECT', 'aled08_prospect');

require __DIR__ . '/../src/wordpress/aled08-espace/includes/prospection.php';

/* ---------------------------------------------------------------- les vérifications */
$ok = 0; $ko = 0;
function verifie($titre, $cond, $detail = '') { global $ok, $ko; if ($cond) { $ok++; echo "  ok  $titre\n"; } else { $ko++; echo "  ÉCHEC  $titre" . ($detail !== '' ? " ($detail)" : '') . "\n"; } }
function faire($d) { $r = aled08e_px_faire(new WP_REST_Request('POST', '/aled08/v1/atelier/prospect', $d)); return $r; }
function statut($r) { return is_wp_error($r) ? (int) ($r->get_error_data()['status'] ?? 0) : $r->status; }
$GLOBALS['heure_ok'] = true;
add_filter('aled08e_px_heure_ok', function ($v) { return $GLOBALS['heure_ok']; });
$bon = function ($x = []) {
    return $x + ['entreprise' => 'Boulangerie Martin', 'article' => 'la', 'metier' => 'boulangerie', 'metier_page' => 'site-internet-boulangerie-patisserie', 'ville' => 'Charleville-Mézières', 'departement' => '08',
        'siren' => '948617782', 'entreprise_individuelle' => true, 'email' => 'boulangerie.martin@orange.fr', 'url_source_email' => 'https://www.google.com/maps/place/x', 'recherche' => 'boulangerie Charleville-Mézières',
        'criteres' => ['sans_site' => true, 'metier_recherche' => true, 'activite_recente' => true, 'independante' => true], 'raisons' => 'Fiche Google à jour, 48 avis, aucun site trouvé.'];
};
$morceaux = ['sujet' => 'Boulangerie Martin : vos clients vous cherchent sur Google', 'phrase' => 'En cherchant « boulangerie Charleville-Mézières » sur Google, j’ai trouvé la fiche de la Boulangerie Martin… mais pas de site internet.',
    'points' => [['icone' => '🔎', 'titre' => 'Être trouvé', 'texte' => 'quand quelqu’un cherche une boulangerie près de chez lui.'], ['icone' => '🕒', 'titre' => 'Vos horaires et vos photos', 'texte' => 'toujours à jour, même le dimanche.'], ['icone' => '🎂', 'titre' => 'Des commandes de gâteaux', 'texte' => 'qui arrivent même quand vous êtes au fournil.']]];

echo "Les vérifications simples\n";
verifie('SIREN juste (948 617 782)', aled08e_px_siren_ok('948 617 782'));
verifie('SIREN faux refusé', !aled08e_px_siren_ok('123456789'));
verifie('101 départements dans la tournée, les Ardennes d’abord', count(aled08e_px_departements()) === 101 && aled08e_px_departements()[0] === '08', (string) count(aled08e_px_departements()));
verifie('gmail d’une société sans son nom : refusé', aled08e_px_email_refus('jean.dupont@gmail.com', ['entreprise' => 'Garage du Centre']) !== '');
verifie('gmail d’une société avec son nom : accepté', aled08e_px_email_refus('garageducentre08@gmail.com', ['entreprise' => 'Garage du Centre']) === '');
verifie('gmail d’une entreprise individuelle : accepté', aled08e_px_email_refus('jean.dupont@gmail.com', ['entreprise_individuelle' => true]) === '');
verifie('adresse technique refusée', aled08e_px_email_refus('noreply@boulangerie.fr') !== '');
verifie('adresse mal formée refusée', aled08e_px_email_refus('boulangerie@') !== '');
verifie('administration refusée', aled08e_px_email_refus('contact@ardennes.gouv.fr') !== '');
verifie('note : sans site, métier recherché, activité, indépendante, page métier = 100', aled08e_px_note(['sans_site' => 1, 'metier_recherche' => 1, 'activite_recente' => 1, 'independante' => 1], true) === 100);
verifie('libellé de la source Facebook', aled08e_px_source_libelle('https://www.facebook.com/x') === 'sa page Facebook');
$prixSite = (float) aled08e_type('une-page')['price'];
verifie('prix réduit calculé depuis la config (' . $prixSite . ' € moins 10 %)', aled08e_px_prix()['prix'] === $prixSite && abs(aled08e_px_prix()['reduit'] - round($prixSite * 0.9, 2)) < 0.001, aled08e_euro_txt(aled08e_px_prix()['reduit']));
verifie('identité tirée de data.json', aled08e_px_identite() === 'Les Minis Monstres, entreprise individuelle d’Alexandre Poquet, SIREN 948 617 782, 08460 Signy-l’Abbaye.', aled08e_px_identite());
update_option('aled08_prospection_premier_envoi', time() - 15 * DAY_IN_SECONDS);
verifie('quota : 20 + 20 par semaine (deux semaines : 60)', aled08e_px_quota_jour() === 60, (string) aled08e_px_quota_jour());
update_option('aled08_prospection_premier_envoi', time() - 70 * WEEK_IN_SECONDS);
verifie('quota plafonné à 150', aled08e_px_quota_jour() === 150);
delete_option('aled08_prospection_premier_envoi');
verifie('quota avant tout envoi : 20', aled08e_px_quota_jour() === 20);

echo "Éteinte par défaut\n";
verifie('prospection éteinte par défaut', !aled08e_px_active());
$poste = aled08e_px_poste('facteur');
verifie('poste du Facteur : rien à faire', $poste['rien_a_faire'] === true && !isset($poste['fiche_de_poste']));
verifie('poste du Repéreur : rien à faire', aled08e_px_poste('repereur')['rien_a_faire'] === true);
$ex = faire(['faire' => 'apercu']);
verifie('aperçu possible même éteinte', statut($ex) === 200 && strpos($ex->data['html'], 'MAIL10-7KQ2') !== false);

echo "L'ajout (le Repéreur)\n";
update_option('aled08_prospection_active', '1');
$r1 = aled08e_px_ajouter($bon());
verifie('un bon prospect est ajouté « nouveau », note 100', !empty($r1['ok']) && $r1['etat'] === 'nouveau' && $r1['note'] === 100, json_encode($r1, JSON_UNESCAPED_UNICODE));
$id = (int) $r1['prospect'];
verifie('même adresse : refusé', empty(aled08e_px_ajouter($bon(['siren' => '732829320']))['ok']));
verifie('même SIREN : refusé', empty(aled08e_px_ajouter($bon(['email' => 'autre@boulangerie-martin.fr']))['ok']));
verifie('sans source de l’adresse : refusé', empty(aled08e_px_ajouter($bon(['email' => 'a@b-martin.fr', 'siren' => '732829320', 'url_source_email' => '']))['ok']));
verifie('adresse d’un client : refusée', empty(aled08e_px_ajouter($bon(['email' => 'deja.client@exemple.fr', 'siren' => '732829320']))['ok']));
$r2 = aled08e_px_ajouter($bon(['entreprise' => 'Fleurs Lune', 'email' => 'contact@fleurs-lune.fr', 'siren' => '732829320', 'metier_page' => '', 'criteres' => ['sans_site' => false, 'metier_recherche' => true, 'independante' => true]]));
verifie('note sous 60 : écarté tout de suite', !empty($r2['ok']) && $r2['etat'] === 'ecarte' && $r2['note'] === 30, json_encode($r2));

echo "Les garde-fous de l'envoi (le Facteur)\n";
verifie('envoyer un prospect pas revérifié : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux)) === 409);
verifie('retenir sans dire ce qui a été vérifié : refusé', statut(faire(['prospect' => $id, 'faire' => 'retenir'])) === 400);
verifie('retenir : passe « à écrire »', statut(faire(['prospect' => $id, 'faire' => 'retenir', 'texte' => 'Adresse vue sur la fiche, pas de site.'])) === 200 && aled08e_px_meta($id, 'etat') === 'a_ecrire');
verifie('site ou ventes fermés : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux)) === 409);
update_option('aled08_site_ouvert', '1'); update_option('aled08_ventes_ouvertes', '1');
$GLOBALS['heure_ok'] = false;
verifie('hors des heures d’envoi : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux)) === 409);
$GLOBALS['heure_ok'] = true;
update_option('aled08_prospection_active', '0');
verifie('prospection éteinte : refusé (403)', statut(faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux)) === 403);
update_option('aled08_prospection_active', '1');
verifie('un texte qui parle d’IA : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer', 'phrase' => 'Grâce à l’IA, j’ai trouvé la fiche de la Boulangerie Martin sur Google, sans site.'] + $morceaux)) === 400);
verifie('un prix écrit à la main : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer', 'sujet' => 'Un site pour 500 € seulement, Boulangerie Martin'] + $morceaux)) === 400);
verifie('deux points au lieu de trois : refusé', statut(faire(['prospect' => $id, 'faire' => 'envoyer', 'points' => array_slice($morceaux['points'], 0, 2)] + $morceaux)) === 400);
verifie('du HTML dans un point : refusé ou nettoyé', ($x = faire(['prospect' => $id, 'faire' => 'apercu', 'points' => array_merge([['titre' => '<b>Être</b> trouvé', 'texte' => '<a href="https://x">quand</a> on cherche une boulangerie.']], array_slice($morceaux['points'], 1))] + $morceaux)) && statut($x) === 200 && strpos($x->data['html'], 'href="https://x"') === false);
$GLOBALS['T']['mails'] = [];
$r = faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux);
verifie('l’envoi part', statut($r) === 200 && count($GLOBALS['T']['mails']) === 1, is_wp_error($r) ? $r->m : '');
$mail = $GLOBALS['T']['mails'][0] ?? ['a' => '', 's' => '', 'm' => '', 'h' => []];
$code = $r->data['code'] ?? '';
verifie('au prospect, avec le sujet', $mail['a'] === 'boulangerie.martin@orange.fr' && $mail['s'] === $morceaux['sujet']);
verifie('code personnel MAIL10-XXXX', (bool) preg_match('/^MAIL10-[2-9A-HJKMNP-Z]{4}$/', $code), $code);
verifie('le mail porte le code, le prix réduit et le prix', strpos($mail['m'], $code) !== false && strpos($mail['m'], aled08e_euro(round($prixSite * 0.9, 2))) !== false && strpos($mail['m'], 'à partir de ' . aled08e_euro($prixSite)) !== false);
verifie('le mail dit la source de l’adresse', strpos($mail['m'], 'l’adresse de la Boulangerie Martin est publiée sur <a href="https://www.google.com/maps/place/x"') !== false);
verifie('le mail a l’identité de l’expéditeur', strpos($mail['m'], 'SIREN 948 617 782') !== false && strpos($mail['m'], 'Alexandre Poquet') !== false);
verifie('le mail a le lien de désinscription signé', strpos($mail['m'], 'lmm_stop=' . $id . '-' . aled08e_px_signe($id, 'stop')) !== false);
verifie('les boutons passent par le suivi des clics', strpos($mail['m'], 'lmm_px=' . $id . '-demo-') !== false && strpos($mail['m'], 'lmm_px=' . $id . '-site-') !== false);
verifie('pas de pixel espion (une seule image : le logo)', substr_count($mail['m'], '<img') === 1);
verifie('Reply-To chez Alex, From des Minis Monstres, en HTML', in_array('Reply-To: Alex · Les Minis Monstres <alex@exemple.fr>', $mail['h'], true) && in_array('Content-Type: text/html; charset=UTF-8', $mail['h'], true) && preg_grep('/^From: .*contact@lesminismonstres\.fr/', $mail['h']));
verifie('en-têtes de désinscription des messageries', (bool) preg_grep('/^List-Unsubscribe: </', $mail['h']) && in_array('List-Unsubscribe-Post: List-Unsubscribe=One-Click', $mail['h'], true));
verifie('le prospect est « envoye », le quota compté', aled08e_px_meta($id, 'etat') === 'envoye' && aled08e_px_envoyes_aujourdhui() === 1 && aled08e_px_quota_restant() === 19);
verifie('pas deux fois le même mail', statut(faire(['prospect' => $id, 'faire' => 'envoyer'] + $morceaux)) === 409);

echo "Le code personnel\n";
verifie('le code est accepté', aled08e_px_code_ok($code) === $id);
verifie('en minuscules aussi', aled08e_px_code_ok(strtolower($code)) === $id);
verifie('un code inventé est refusé', aled08e_px_code_ok('MAIL10-ZZZZ') === 0);
$env = (int) aled08e_px_meta($id, 'envoye_le');
aled08e_px_set($id, 'envoye_le', time() - 31 * DAY_IN_SECONDS);
verifie('après 30 jours, refusé', aled08e_px_code_ok($code) === 0);
aled08e_px_set($id, 'envoye_le', $env);

echo "La relance\n";
verifie('trop tôt : refusée', statut(faire(['prospect' => $id, 'faire' => 'relancer'])) === 409);
aled08e_px_set($id, 'envoye_le', time() - 8 * DAY_IN_SECONDS);
aled08e_px_set($id, 'msgid', '<lmm-px-1@x>');
$GLOBALS['T']['mails'] = [];
$r = faire(['prospect' => $id, 'faire' => 'relancer']);
verifie('après 7 jours : partie, dans le même fil', statut($r) === 200 && strpos($GLOBALS['T']['mails'][0]['s'] ?? '', 'Re : ') === 0 && strpos($GLOBALS['T']['mails'][0]['m'] ?? '', 'pour la Boulangerie Martin') !== false && strpos($GLOBALS['T']['mails'][0]['m'] ?? '', 'dernier message') !== false, is_wp_error($r) ? $r->m : '');
verifie('une seule relance', statut(faire(['prospect' => $id, 'faire' => 'relancer'])) === 409);

echo "Le quota et l'étalement\n";
$r3 = aled08e_px_ajouter($bon(['entreprise' => 'Garage Dupont', 'article' => 'le', 'email' => 'contact@garage-dupont.fr', 'siren' => '552100554', 'metier_page' => 'site-internet-garage-automobile']));
$id3 = (int) $r3['prospect'];
faire(['prospect' => $id3, 'faire' => 'retenir', 'texte' => 'Vérifié.']);
update_option('aled08_prospection_quota_depart', 2);
verifie('quota du jour atteint : refusé (429)', statut(faire(['prospect' => $id3, 'faire' => 'envoyer'] + $morceaux)) === 429);
update_option('aled08_prospection_quota_depart', 20);
update_option('aled08_prospection_envois', array_fill(0, 30, time() - 60));
$r = faire(['prospect' => $id3, 'faire' => 'envoyer'] + $morceaux);
verifie('30 envois dans l’heure : refusé, avec l’attente', statut($r) === 429 && ($r->get_error_data()['reessayer_dans_minutes'] ?? 0) > 50);
update_option('aled08_prospection_envois', []);
verifie('ensuite, ça repart', statut(faire(['prospect' => $id3, 'faire' => 'envoyer'] + $morceaux)) === 200);

echo "La désinscription et la liste d'opposition\n";
verifie('désinscription', aled08e_px_desinscrire($id3, 'test') && aled08e_px_meta($id3, 'etat') === 'desinscrit');
wp_delete_post($id3);
verifie('même effacé, l’adresse reste refusée', empty(aled08e_px_ajouter($bon(['entreprise' => 'Garage Dupont', 'email' => 'contact@garage-dupont.fr', 'siren' => '732829320']))['ok']));
verifie('et le SIREN aussi', empty(aled08e_px_ajouter($bon(['entreprise' => 'Garage Dupont', 'email' => 'garage@dupont-autos.fr', 'siren' => '552100554']))['ok']));
verifie('jamais d’adresse en clair dans la liste', strpos(json_encode(get_option('aled08_prospection_opposition')), 'garage') === false);
verifie('une signature fausse ne désinscrit pas', aled08e_px_signe($id, 'stop') !== aled08e_px_signe($id + 1, 'stop'));

echo "La commande avec le code\n";
do_action('aled08e_commande_recue', 999, ['code_evenement' => $code, 'remise_sur' => 'creation'], ['email' => 'x@y.fr']);
verifie('le prospect passe « commande »', aled08e_px_meta($id, 'etat') === 'commande' && (int) aled08e_px_meta($id, 'commande') === 999);
do_action('aled08e_statut_change', 999, 'payee', 'attente_paiement');
verifie('payée : le code est utilisé', aled08e_px_code_ok($code) === 0);

echo "Le résumé et les postes\n";
$res = aled08e_px_resume();
verifie('résumé : compteurs, quota, semaine', isset($res['total']['commande'], $res['semaine']['envois'], $res['quota_restant']) && $res['semaine']['envois'] === 2 && $res['semaine']['relances'] === 1, json_encode($res['semaine']));
$pr = aled08e_px_poste('repereur');
verifie('poste du Repéreur : une zone et des métiers', !$pr['rien_a_faire'] && $pr['travail']['zone_suggeree']['departement'] === '08' && count($pr['travail']['metiers']) === 16 && $pr['fiche_de_poste'] === 'fiche agent-repereur');
aled08e_px_tournee_noter('08', $pr['travail']['zone_suggeree']['metier']['slug']);
verifie('la tournée avance', aled08e_px_zone_suivante()['metier']['slug'] !== $pr['travail']['zone_suggeree']['metier']['slug']);
verifie('bilan pour Jarvis', aled08e_px_bilan_jarvis()['sept_derniers_jours']['commandes'] === 1);
$bloc = aled08e_px_bloc_gestion('https://x/mon-espace/', '');
verifie('le bloc « Prospection » de l’espace de gestion', strpos($bloc, 'Prospection par e-mail') !== false && strpos($bloc, 'Couper la prospection') !== false && strpos($bloc, 'Boulangerie Martin') !== false);
ob_start(); aled08e_px_reglages_html(); $reg = ob_get_clean();
verifie('la case « Prospection activée » des Réglages', strpos($reg, 'name="prospection_active"') !== false);
aled08e_px_reglages_save(['prospection_present' => '1']);
verifie('décocher la case éteint la prospection', !aled08e_px_active());

// l'aperçu, pour le regarder
if (!empty($argv[1]) && is_dir($argv[1])) {
    file_put_contents($argv[1] . '/apercu-mail.html', faire(['faire' => 'apercu'])->data['html']);
    file_put_contents($argv[1] . '/apercu-relance.html', faire(['faire' => 'apercu', 'pour' => 'relancer'])->data['html']);
    file_put_contents($argv[1] . '/apercu-mail.txt', faire(['faire' => 'apercu'])->data['texte']);
    echo "Aperçus écrits dans " . $argv[1] . "\n";
}
echo "\n$ok vérifications réussies, $ko en échec.\n";
exit($ko ? 1 : 0);
