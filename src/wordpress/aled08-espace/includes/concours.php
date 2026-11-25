<?php
/**
 * Le jeu-concours des Rubans, les petits monstres cadeaux (demandes d'Alex, 25 novembre 2026).
 *
 * LE JEU, EN MANCHES DE 100 JOURS, 100 % AUTOMATIQUE
 *  - Pendant une manche, CINQ Rubans se cachent sur le site, un par catégorie du règlement (/jeu-concours/) : la page d'accueil,
 *    l'espace client, les mini-tutos, la page Tarifs et les questions fréquentes. À chaque manche, leurs cachettes changent
 *    (tirées dans une réserve d'endroits bien visibles, jamais les mêmes que la manche d'avant).
 *  - Il faut être connecté à son compte (gratuit, sans achat) pour les voir. Tout le monde joue, sauf l'équipe et les anciens gagnants.
 *    Un gagnant qui a déjà un site ou une commande reçoit un an de forfait Mini offert (ajoutés tout seuls à ses mois offerts).
 *  - Dans l'espace client, un compteur flottant montre les Rubans trouvés, un indice pour chacun et le chrono du tirage.
 *  - Les cinq trouvés : le joueur donne son e-mail et son numéro de portable (une participation par compte, par e-mail et par
 *    numéro ; les doublons d'appareil ou d'adresse internet sont signalés).
 *  - À la fin des 100 jours, le tirage se fait tout seul (random_int). Le gagnant reçoit un e-mail « Félicitations » avec un code
 *    personnel (GAGNANT-…), valable 30 jours, à taper dans « Créer mon site » : il suit le même parcours qu'un client, sans rien
 *    payer pour le Site Essentiel, et son forfait Mini est offert 6 mois (includes/commandes.php). Alex reçoit une copie.
 *    Puis une nouvelle manche commence, avec de nouvelles cachettes.
 *  - Sur la page d'accueil, un encart montre le chrono et les derniers gagnants dont le site est en ligne (jamais de faux gagnants).
 *
 * L'API d'Alex (administrateurs) :
 *   GET  /aled08/v1/atelier/concours                       l'état, la manche, les cachettes, les joueurs, les inscrits, les tirages
 *   POST /aled08/v1/atelier/concours { faire: ouvrir }     lance le jeu (manche 1, 100 jours ; { jours: N } pour une autre durée)
 *   POST … { faire: melanger }                              tire de nouvelles cachettes pour la manche en cours
 *   POST … { faire: cachette, cachette: "tarifs", chemin, selecteur, indice, coin }   place un Ruban à la main
 *   POST … { faire: tirer }      tire au sort tout de suite et lance la manche suivante
 *   POST … { faire: retirer }    nouveau tirage de la dernière manche (gagnant qui ne répond pas, triche)
 *   POST … { faire: arreter }    arrête le jeu sans tirage
 * Les données d'une manche (Rubans trouvés, e-mails, numéros) sont effacées 3 mois après son tirage.
 */
defined('ABSPATH') || exit;

define('ALED08E_MANCHE_JOURS', 100);
define('ALED08E_LOT_JOURS', 30); // le code du gagnant reste valable 30 jours

/* ---------- les cachettes : une réserve d'endroits par catégorie, bien visibles quand on est sur la bonne page ---------- */
function aled08e_concours_categories() {
    return ['accueil' => 'La page d’accueil du site', 'espace' => 'L’espace client', 'tutos' => 'Les mini-tutos', 'tarifs' => 'La page Tarifs', 'faq' => 'Les questions fréquentes'];
}
function aled08e_concours_pool() {
    $t = function ($chemin, $sel, $coin, $indice) { return ['chemin' => $chemin, 'selecteur' => $sel, 'coin' => $coin, 'indice' => $indice]; };
    return [
        'accueil' => [
            $t('/', '#deroulement', 'bas-gauche', 'Je ne suis pas loin de l’entrée. J’aime avancer pas à pas.'),
            $t('/', '#compris', 'haut-droite', 'Je ne suis pas loin de l’entrée. Je fais l’inventaire.'),
            $t('/', '#uniques', 'bas-droite', 'Je ne suis pas loin de l’entrée. Je me crois un peu à part.'),
            $t('/', '#confiance', 'haut-gauche', 'Je ne suis pas loin de l’entrée. Je reste près de quelqu’un de confiance.'),
            $t('/', '#questions', 'bas-droite', 'Je ne suis pas loin de l’entrée. Je doute de tout.'),
        ],
        'espace' => [
            $t('/mon-espace/', '#t-compte [data-sm-part="infos"], #t-compte', 'bas-droite', 'Chez vous, je garde ce qui vous ressemble.'),
            $t('/mon-espace/', '#t-site', 'bas-droite', 'Chez vous, je surveille votre plus beau projet.'),
            $t('/mon-espace/', '#t-accueil .mm-duo, #t-accueil', 'haut-droite', 'Chez vous, j’écoute les nouvelles.'),
            $t('/mon-espace/', '#t-compte .compte-forfait, #t-compte', 'haut-droite', 'Chez vous, je compte les sous.'),
        ],
        'tutos' => [
            $t('/mini-tuto/qui-sont-les-minis-monstres/', '.tuto-section', 'haut-droite', 'Là où l’on apprend, je fais les présentations.'),
            $t('/mini-tuto/creer-mon-site-avec-nous/', '.tuto-section', 'bas-gauche', 'Là où l’on apprend, je mets la main à la pâte.'),
            $t('/mini-tuto/pourquoi-choisir-les-minis-monstres/', '.tuto-section', 'haut-gauche', 'Là où l’on apprend, j’aide ceux qui hésitent.'),
            $t('/mini-tuto/deroulement-d-un-achat/', '.tuto-section', 'bas-droite', 'Là où l’on apprend, je suis un panier.'),
            $t('/mini-tuto/combien-de-temps-pour-mon-site/', '.tuto-section', 'haut-droite', 'Là où l’on apprend, je regarde l’horloge.'),
        ],
        'tarifs' => [
            $t('/tarifs/', '#extras', 'haut-gauche', 'Là où l’on parle d’argent, j’aime les petits plus.'),
            $t('/tarifs/', '#comment', 'bas-droite', 'Là où l’on parle d’argent, je me demande comment c’est possible.'),
            $t('/tarifs/', '#detail', 'haut-droite', 'Là où l’on parle d’argent, je lis les petites lignes.'),
            $t('/tarifs/', '#questions', 'bas-gauche', 'Là où l’on parle d’argent, j’hésite encore.'),
        ],
        'faq' => [
            $t('/faq/', '.page-hero + .section', 'haut-droite', 'Là où l’on vous répond, je suis pressé.'),
            $t('/faq/', '.page-hero + .section', 'bas-gauche', 'Là où l’on vous répond, je suis patient.'),
            $t('/faq/', '.page-hero', 'bas-droite', 'Là où l’on vous répond, je n’ai pas lu la suite.'),
        ],
    ];
}
/* Une cachette par catégorie, au hasard, différente de la manche d'avant quand c'est possible */
function aled08e_concours_choisir($avant = []) {
    $out = [];
    foreach (aled08e_concours_pool() as $k => $liste) {
        $ok = array_values(array_filter($liste, function ($c) use ($avant, $k) { return empty($avant[$k]) || $c['selecteur'] !== $avant[$k]['selecteur'] || $c['chemin'] !== $avant[$k]['chemin'] || $c['coin'] !== $avant[$k]['coin']; }));
        if (!$ok) $ok = $liste;
        $out[$k] = $ok[random_int(0, count($ok) - 1)];
    }
    return $out;
}
function aled08e_concours_etat() {
    $e = get_option('aled08_concours', []);
    return wp_parse_args(is_array($e) ? $e : [], ['id' => '', 'ouvert' => false, 'ouvert_le' => '', 'manche' => 0, 'debut' => 0, 'fin' => 0, 'jours' => ALED08E_MANCHE_JOURS, 'cachettes' => [], 'tirages' => []]);
}
function aled08e_concours_sauver($e) { update_option('aled08_concours', $e, false); }
function aled08e_concours_cachettes() {
    $e = aled08e_concours_etat();
    $pool = aled08e_concours_pool();
    $out = [];
    foreach (aled08e_concours_categories() as $k => $cat) {
        $c = (isset($e['cachettes'][$k]) && is_array($e['cachettes'][$k]) && !empty($e['cachettes'][$k]['chemin'])) ? $e['cachettes'][$k] : $pool[$k][0];
        foreach ($pool[$k] as $pc) if ($pc['chemin'] === $c['chemin'] && $pc['selecteur'] === $c['selecteur'] && $pc['coin'] === $c['coin']) $c['indice'] = $pc['indice']; // les indices à jour, même en cours de manche
        $out[$k] = ['categorie' => $cat] + array_intersect_key($c, array_flip(['chemin', 'selecteur', 'coin', 'indice']));
    }
    return $out;
}
function aled08e_concours_ouvert() { $e = aled08e_concours_etat(); return $e['ouvert'] && $e['id'] !== ''; }
function aled08e_concours_cle($id, $quoi = 'concours') { return 'aled08_' . $quoi . '_' . preg_replace('/[^a-z0-9_]/', '', (string) $id); }
function aled08e_concours_jeton($id, $cach) { return substr(hash_hmac('sha256', $id . '|' . $cach, wp_salt('nonce')), 0, 20); }
/* Les Rubans trouvés par un compte pendant la manche en cours : [cachette => heure] */
function aled08e_concours_trouves($uid, $id = '') {
    if ($id === '') $id = aled08e_concours_etat()['id'];
    $t = $id !== '' ? get_user_meta((int) $uid, aled08e_concours_cle($id, 'rubans'), true) : [];
    return is_array($t) ? array_intersect_key($t, aled08e_concours_categories()) : [];
}
function aled08e_concours_participation($uid, $id = '') {
    if ($id === '') $id = aled08e_concours_etat()['id'];
    $p = $id !== '' ? get_user_meta((int) $uid, aled08e_concours_cle($id), true) : [];
    return is_array($p) && !empty($p['email']) ? $p : null;
}
/* Qui peut jouer : un compte connecté, hors équipe, sans site ni commande chez nous, jamais gagnant */
function aled08e_concours_peut_jouer($u) {
    if (!$u || empty($u->ID) || user_can($u, 'edit_posts')) return false;
    return aled08e_meta((int) $u->ID, 'concours_gagne') === ''; // une seule victoire par personne ; les clients jouent aussi (Alex, 25 novembre 2026)
}
/* Un client a déjà un site ou une commande chez nous : s'il gagne, son lot est un an de forfait Mini offert (pas un site) */
define('ALED08E_LOT_CLIENT_MOIS', 12); // un client gagnant : un an de forfait Mini (Alex, 25 novembre 2026, au lieu de 3 mois)
define('ALED08E_LOT_SITE_MOIS', 6);    // un nouveau gagnant : le site, et 6 mois de forfait Mini (au lieu d'un an)
function aled08e_concours_est_client($uid) {
    $uid = (int) $uid;
    if (aled08e_meta($uid, 'lia_url') !== '' || aled08e_meta($uid, 'site') !== '') return true;
    if (function_exists('aled08e_cmd_user_commandes')) foreach (aled08e_cmd_user_commandes($uid) as $c) if (($c['statut'] ?? '') !== 'annulee') return true;
    return false;
}
function aled08e_concours_lot_txt($uid) {
    $D = aled08e_data();
    if (aled08e_concours_est_client($uid)) return 'un an de forfait Mini offert (12 mois), ajouté tout seul à vos mois offerts';
    $valeur = (float) ($D['creation']['prixNormal'] ?? ($D['creation']['prix'] ?? 0));
    $mini = 0; foreach ((array) ($D['forfaits'] ?? []) as $f) { $mini = (float) ($f['month'] ?? 0); break; }
    return 'un site internet offert (le Site Essentiel, d’une valeur de ' . aled08e_euro_txt($valeur) . ') et ' . ALED08E_LOT_SITE_MOIS . ' mois de forfait Mini (' . aled08e_euro_txt($mini * ALED08E_LOT_SITE_MOIS) . ')';
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
/* Le temps restant avant le tirage, en clair */
function aled08e_concours_reste_txt($fin) {
    $s = max(0, (int) $fin - time());
    $j = intdiv($s, DAY_IN_SECONDS); $h = intdiv($s % DAY_IN_SECONDS, HOUR_IN_SECONDS);
    return $j > 1 ? $j . ' jours' : ($j === 1 ? '1 jour et ' . $h . ' h' : $h . ' h');
}

/* Les participations complètes d'une manche, les comptes de l'équipe exclus, avec les doublons possibles signalés */
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

/* ---------- les manches et le tirage ---------- */
function aled08e_concours_nouvelle_manche($e, $jours = 0) {
    $jours = $jours ?: (int) ($e['jours'] ?: ALED08E_MANCHE_JOURS);
    $e['manche'] = (int) $e['manche'] + 1;
    $e['id'] = 'c' . wp_date('Ymd_His');
    $e['ouvert'] = true;
    $e['ouvert_le'] = current_time('mysql');
    $e['debut'] = time();
    $e['fin'] = time() + $jours * DAY_IN_SECONDS;
    $e['jours'] = $jours;
    $e['cachettes'] = aled08e_concours_choisir((array) $e['cachettes']);
    return $e;
}
function aled08e_concours_tirer($id, $exclus = []) {
    $l = array_values(array_filter(aled08e_concours_inscrits($id), function ($i) use ($exclus) { return !in_array($i['user'], $exclus, true); }));
    if (!$l) return null;
    return $l[random_int(0, count($l) - 1)] + ['parmi' => count($l)];
}
function aled08e_concours_code_neuf() {
    $a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $c = ''; for ($i = 0; $i < 6; $i++) $c .= $a[random_int(0, strlen($a) - 1)];
    return 'GAGNANT-' . $c;
}
/* Tire le gagnant d'une manche, le prévient par e-mail, prévient Alex, et note le tirage. Renvoie le tirage. */
function aled08e_concours_designer(&$e, $id, $exclus = [], $faire = 'tirer') {
    $g = aled08e_concours_tirer($id, $exclus);
    $t = ['id' => $id, 'manche' => (int) $e['manche'], 'le' => current_time('mysql'), 'user' => $g ? $g['user'] : 0, 'nom' => $g ? $g['nom'] : '', 'email' => $g ? $g['email'] : '',
        'tel' => $g ? $g['tel'] : '', 'parmi' => $g ? $g['parmi'] : 0, 'faire' => $faire, 'code' => '', 'code_fin' => 0, 'commande' => 0, 'doublon' => $g ? $g['doublon_possible'] : ''];
    $t['lot'] = '';
    if ($g) {
        update_user_meta($g['user'], 'aled08_concours_gagne', $id);
        if (aled08e_concours_est_client($g['user'])) {
            // un client : un an de forfait Mini offert, ajoutés tout de suite à ses mois offerts (includes/parrainage.php)
            $t['lot'] = 'mois';
            $t['mois'] = ALED08E_LOT_CLIENT_MOIS;
            $t['detail'] = function_exists('aled08e_mois_offerts_ajouter') ? aled08e_mois_offerts_ajouter($g['user'], ALED08E_LOT_CLIENT_MOIS, 'concours') : '';
            aled08e_concours_mail_gagnant_client($t);
        } else {
            $t['lot'] = 'site';
            $t['code'] = aled08e_concours_code_neuf();
            $t['code_fin'] = time() + ALED08E_LOT_JOURS * DAY_IN_SECONDS;
            aled08e_concours_mail_gagnant($t);
        }
    }
    $e['tirages'][] = $t;
    $txt = !$g ? 'Personne n’a trouvé les cinq Rubans : pas de gagnant pour cette manche.'
        : 'Gagnant tiré au sort parmi ' . $g['parmi'] . ' participation' . ($g['parmi'] > 1 ? 's' : '') . ' : ' . $g['nom'] . ' (' . $g['email'] . '). '
          . ($t['lot'] === 'mois' ? 'Déjà client : un an de forfait Mini offert (' . ALED08E_LOT_CLIENT_MOIS . ' mois), ajouté tout seul. ' . ($t['detail'] ?? '') : 'Code ' . $t['code'] . ', valable jusqu’au ' . aled08e_date_fr($t['code_fin'], false) . '. Il commande son site sur « Créer mon site » comme un client, sans payer le Site Essentiel, et son forfait Mini est offert ' . ALED08E_LOT_SITE_MOIS . ' mois.')
          . ($g['doublon_possible'] ? ' Attention : ' . $g['doublon_possible'] . '.' : '');
    wp_mail(aled08e_to(), $g ? 'Jeu-concours : le gagnant de la manche ' . (int) $e['manche'] : 'Jeu-concours : pas de gagnant pour la manche ' . (int) $e['manche'], $txt . "\n\nLe gagnant a reçu son e-mail de félicitations.\n", aled08e_mail_headers());
    if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Jeu-concours, manche ' . (int) $e['manche'] . ' : ' . ($faire === 'retirer' ? 'nouveau tirage' : 'tirage'), $txt, $g ? $g['user'] : 0, 'claude');
    return $t;
}
function aled08e_concours_mail_gagnant_client($t) {
    $u = get_userdata($t['user']);
    $prenom = $u && function_exists('aled08e_prenom') ? aled08e_prenom($u) : ($u ? $u->display_name : '');
    $corps = 'Bonjour ' . $prenom . ",\n\n"
        . "Félicitations : vous avez gagné le jeu des Rubans !\n\n"
        . "Vous avez déjà votre site chez nous : votre lot, c’est un an de forfait Mini offert. Il est déjà ajouté à votre compte, vous n’avez rien à faire.\n"
        . (!empty($t['detail']) ? $t['detail'] . "\n" : '')
        . "\nVous les retrouvez dans votre espace client (Mon compte) :\n" . aled08e_url() . "\n\nEncore bravo, et merci de votre fidélité !\nAlex et les Minis Monstres\n";
    return wp_mail($t['email'], 'Félicitations : un an de forfait offert !', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
}
function aled08e_concours_mail_gagnant($t) {
    $u = get_userdata($t['user']);
    $prenom = $u && function_exists('aled08e_prenom') ? aled08e_prenom($u) : ($u ? $u->display_name : '');
    $D = aled08e_data();
    $valeur = (float) ($D['creation']['prixNormal'] ?? ($D['creation']['prix'] ?? 0));
    $lien = add_query_arg('code', $t['code'], home_url('/creer-mon-site/'));
    $corps = 'Bonjour ' . $prenom . ",\n\n"
        . "Félicitations : vous avez gagné un site internet !\n\n"
        . 'Vous avez trouvé les cinq Rubans, et le tirage au sort vous a désigné. Votre lot : un Site Essentiel (valeur ' . aled08e_euro_txt($valeur) . ') et ' . ALED08E_LOT_SITE_MOIS . " mois de forfait Mini, offerts. Le site est à vous : vous le gardez.\n\n"
        . "Votre code personnel : " . $t['code'] . "\n"
        . 'Il est valable jusqu’au ' . aled08e_date_fr($t['code_fin'], false) . ", seulement avec votre compte.\n\n"
        . "Pour recevoir votre site :\n"
        . "1. Connectez-vous à votre espace client, puis ouvrez « Créer mon site » avec ce lien (le code est déjà rempli) :\n   " . $lien . "\n"
        . '2. Faites les mêmes choix qu’un client : votre nom de domaine, puis vos coordonnées. Vous ne payez rien pour le site, et le forfait Mini est offert ' . ALED08E_LOT_SITE_MOIS . " mois.\n"
        . "3. Remplissez le questionnaire de création dans votre espace : votre site est en ligne 24 à 48 heures après.\n\n"
        . "Si vous ajoutez l’option e-commerce, seule cette option est à payer.\n\n"
        . "Encore bravo, et à très vite !\nAlex et les Minis Monstres\n";
    return wp_mail($t['email'], 'Félicitations : vous avez gagné un site internet !', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
}
/* Fin d'une manche : le tirage, puis la manche suivante, tout seuls. Toutes les heures (tâche WordPress) et, au plus toutes les
 * 15 minutes, à la première visite (filet si la tâche ne part pas). */
function aled08e_concours_horloge() {
    $e = aled08e_concours_etat();
    if (!$e['ouvert'] || !$e['fin'] || time() < (int) $e['fin']) return;
    if (get_transient('aled08e_concours_tirage_en_cours')) return;
    set_transient('aled08e_concours_tirage_en_cours', 1, 10 * MINUTE_IN_SECONDS);
    aled08e_concours_designer($e, $e['id'], [], 'tirer');
    $e = aled08e_concours_nouvelle_manche($e);
    aled08e_concours_sauver($e);
    delete_transient('aled08e_concours_tirage_en_cours');
}
add_action('aled08e_concours_horloge', 'aled08e_concours_horloge');
add_action('init', function () {
    if (!wp_next_scheduled('aled08e_concours_horloge')) wp_schedule_event(time() + 300, 'hourly', 'aled08e_concours_horloge');
    if (get_transient('aled08e_concours_vu')) return;
    set_transient('aled08e_concours_vu', 1, 15 * MINUTE_IN_SECONDS);
    aled08e_concours_horloge();
}, 46);

/* ---------- le code du gagnant, dans « Créer mon site » (includes/commandes.php) ---------- */
function aled08e_concours_lot($code) {
    $code = strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) $code));
    if (strpos($code, 'GAGNANT-') !== 0) return null;
    $e = aled08e_concours_etat();
    foreach ($e['tirages'] as $i => $t) if (!empty($t['code']) && hash_equals($t['code'], $code)) return ['index' => $i] + $t;
    return null;
}
/* Le code est-il utilisable par ce compte ? Renvoie '' si oui, sinon la raison. */
function aled08e_concours_lot_refus($code, $uid) {
    $t = aled08e_concours_lot($code);
    if (!$t) return 'inconnu';
    if (!$uid || (int) $t['user'] !== (int) $uid) return 'Ce code est réservé au compte du gagnant : connectez-vous avec ce compte.';
    if (!empty($t['commande'])) return 'Ce code a déjà servi pour votre commande.';
    if ((int) $t['code_fin'] < time()) return 'Ce code a expiré le ' . aled08e_date_fr((int) $t['code_fin'], false) . '.';
    return '';
}
function aled08e_concours_lot_utilise($code, $pid) {
    $t = aled08e_concours_lot($code);
    if (!$t) return;
    $e = aled08e_concours_etat();
    $e['tirages'][$t['index']]['commande'] = (int) $pid;
    aled08e_concours_sauver($e);
}
/* Le forfait Mini offert (lot du jeu-concours) : à la fin, l'offre s'arrête et le client démarre son forfait (rappel un mois avant) */
add_action('aled08_quotidien', function () {
    foreach (get_users(['meta_key' => 'aled08_offert_fin', 'number' => 500]) as $u) {
        $fin = (int) get_user_meta($u->ID, 'aled08_offert_fin', true);
        if (!$fin) continue;
        if ($fin <= time()) {
            delete_user_meta($u->ID, 'aled08_offert');
            delete_user_meta($u->ID, 'aled08_offert_fin');
            wp_mail($u->user_email, 'Vos mois de forfait Mini offerts sont terminés', 'Bonjour ' . (function_exists('aled08e_prenom') ? aled08e_prenom($u) : $u->display_name) . ",\n\nVos mois de forfait Mini offerts (votre lot du jeu-concours) sont terminés.\n\nPour garder votre site en ligne avec nous, démarrez votre forfait dans votre espace client (Mon compte, « Mon forfait ») :\n" . aled08e_url() . "\n\nVous préférez l’héberger ailleurs ? Téléchargez-le à tout moment dans Mon site, « Télécharger » : il est à vous.\n\nÀ bientôt,\nAlex et les Minis Monstres\n", aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
            wp_mail(aled08e_to(), 'Fin du forfait offert : ' . $u->display_name, 'Le forfait Mini offert (lot du jeu-concours) de ' . $u->display_name . ' <' . $u->user_email . "> est terminée. Il a été invité à démarrer son forfait.\n", aled08e_mail_headers());
        } elseif ($fin - time() < 30 * DAY_IN_SECONDS && !get_user_meta($u->ID, 'aled08_offert_rappel', true)) {
            update_user_meta($u->ID, 'aled08_offert_rappel', 1);
            wp_mail($u->user_email, 'Votre forfait Mini offert se termine le ' . aled08e_date_fr($fin, false), 'Bonjour ' . (function_exists('aled08e_prenom') ? aled08e_prenom($u) : $u->display_name) . ",\n\nPetit rappel : votre forfait Mini offert se termine le " . aled08e_date_fr($fin, false) . ".\nEnsuite, le forfait Mini continue à " . aled08e_euro_txt((float) ((aled08e_data()['forfaits'][0]['month'] ?? 10))) . " par mois, sans engagement : vous le démarrerez dans votre espace client. Vous pouvez aussi télécharger votre site (Mon site, « Télécharger ») et l’héberger où vous voulez.\n\nÀ bientôt,\nAlex et les Minis Monstres\n", aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
        }
    }
});

/* ---------- l'encart de la page d'accueil : le chrono et les derniers gagnants (vrais, avec leur site en ligne) ---------- */
function aled08e_concours_gagnants($n = 3) {
    $e = aled08e_concours_etat();
    $out = [];
    foreach (array_reverse($e['tirages']) as $t) {
        if (count($out) >= $n) break;
        if (($t['lot'] ?? '') === 'mois' && !empty($t['user'])) { // un client gagnant : 3 mois offerts, son site est déjà en ligne
            $site = aled08e_meta((int) $t['user'], 'site');
            $u = get_userdata((int) $t['user']);
            if ($site !== '' && $u) $out[] = ['nom' => aled08e_meta((int) $t['user'], 'entreprise') ?: aled08e_prenom($u), 'ville' => '', 'url' => esc_url_raw($site), 'domaine' => (string) wp_parse_url($site, PHP_URL_HOST), 'manche' => (int) ($t['manche'] ?? 0)];
            continue;
        }
        if (empty($t['commande'])) continue;
        $c = function_exists('aled08e_cmd_get') ? aled08e_cmd_get((int) $t['commande']) : null;
        if (!$c || $c['statut'] !== 'en_ligne' || empty($c['domaine'])) continue;
        $out[] = ['nom' => $c['entreprise'] ?: $c['prenom'], 'ville' => (string) ($c['ville'] ?? ''), 'url' => 'https://' . $c['domaine'] . '/', 'domaine' => $c['domaine'], 'manche' => (int) ($t['manche'] ?? 0)];
    }
    return $out;
}
function aled08e_concours_encart_html() {
    $e = aled08e_concours_etat();
    $g = aled08e_concours_gagnants();
    if (!aled08e_concours_ouvert() && !$g) return '';
    $h = '<div class="jr-encart">';
    $h .= '<span class="jr-art" aria-hidden="true">' . aled08e_monster('ruban') . '</span><div class="jr-corps">';
    $h .= '<p class="jr-sur">Le jeu des Rubans</p><h2 class="jr-titre">Un site internet à gagner tous les ' . (int) ($e['jours'] ?: ALED08E_MANCHE_JOURS) . ' jours</h2>';
    if (aled08e_concours_ouvert()) {
        $h .= '<p>Cinq Rubans, de petits monstres cadeaux, se cachent sur notre site. Créez votre espace client (c’est gratuit), trouvez-les tous et participez au tirage au sort. Déjà client ? Vous jouez aussi : à gagner, un an de forfait offert.</p>';
        $h .= '<p class="jr-chrono" data-jr-fin="' . (int) $e['fin'] . '">' . aled08e_icon('clock') . '<span>Prochain tirage dans <b data-jr-reste>' . esc_html(aled08e_concours_reste_txt($e['fin'])) . '</b>, le ' . esc_html(aled08e_date_fr((int) $e['fin'])) . ' (heure de Paris)</span></p>';
        $h .= '<p class="jr-go"><a class="btn btn-primary" href="' . esc_url(aled08e_url() . '#inscription') . '">' . aled08e_icon('gift') . '<span>Je joue</span></a> <a class="jr-regl" href="' . esc_url(home_url('/jeu-concours/')) . '">Le règlement</a></p>';
    }
    if ($g) {
        $h .= '<p class="jr-g-t">Les derniers gagnants</p><ul class="jr-gagnants">';
        foreach ($g as $x) $h .= '<li><span>' . aled08e_icon('trophy') . '</span><span><strong>' . esc_html($x['nom']) . '</strong>' . ($x['ville'] ? ' <small>' . esc_html($x['ville']) . '</small>' : '') . '<a href="' . esc_url($x['url']) . '" target="_blank" rel="noopener">' . esc_html($x['domaine']) . '</a></span></li>';
        $h .= '</ul>';
    }
    return $h . '</div></div>';
}

/* ---------- sur toutes les pages : les Rubans, l'animation, le compteur, le chrono et le formulaire ---------- */
add_action('wp_footer', function () {
    if (is_admin()) return;
    // l'encart de la page d'accueil (un emplacement data-jeu-rubans, posé par le site public)
    $encart = aled08e_concours_encart_html();
    if ($encart !== '') echo '<template id="lmm-jr-tpl">' . $encart . '</template><script>(function(){var t=document.getElementById("lmm-jr-tpl"),p=document.querySelector("[data-jeu-rubans]");if(!t||!p)return;(p.querySelector("[data-jeu-rubans-in]")||p).appendChild(t.content.cloneNode(true));p.hidden=false;var c=p.querySelector("[data-jr-fin]");if(!c)return;var f=+c.getAttribute("data-jr-fin")*1000,b=c.querySelector("[data-jr-reste]");function z(){var s=Math.max(0,Math.floor((f-Date.now())/1000)),j=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);b.textContent=(j?j+" j ":"")+h+" h "+(m<10?"0":"")+m+" min";}z();setInterval(z,30000);})();</script>'; // phpcs:ignore
    if (!aled08e_concours_ouvert()) return;
    $e = aled08e_concours_etat();
    $D = aled08e_data();
    $valeur = (float) ($D['creation']['prixNormal'] ?? ($D['creation']['prix'] ?? 0));
    $mini = 0; foreach ((array) ($D['forfaits'] ?? []) as $f) { $mini = (float) ($f['month'] ?? 0); break; }
    $cfg = ['ajax' => admin_url('admin-ajax.php'), 'espace' => function_exists('aled08e_url') ? aled08e_url() : home_url('/mon-espace/'),
        'reglement' => home_url('/jeu-concours/'), 'ruban' => aled08e_monster('ruban'), 'icones' => ['x' => aled08e_icon('x'), 'check' => aled08e_icon('check'), 'gift' => aled08e_icon('gift'), 'clock' => aled08e_icon('clock')],
        'lot' => 'un site internet offert (le Site Essentiel, d’une valeur de ' . aled08e_euro_txt($valeur) . ') et ' . ALED08E_LOT_SITE_MOIS . ' mois de forfait Mini (' . aled08e_euro_txt($mini * ALED08E_LOT_SITE_MOIS) . ')'];
    ?>
<script id="lmm-rubans">
(function (C) {
  var ici = location.pathname.replace(/\/?$/, '/'), etat = null, minuteur = null;
  var el = function (h) { var d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
  var post = function (action, data) { var f = new FormData(); f.append('action', action); Object.keys(data || {}).forEach(function (k) { f.append(k, data[k]); }); return fetch(C.ajax, { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }); };
  var appareil = function () { try { var a = localStorage.getItem('lmm-ruban-appareil'); if (!a) { a = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('lmm-ruban-appareil', a); } return a; } catch (e) { return ''; } };
  var deux = function (n) { return (n < 10 ? '0' : '') + n; };
  var reste = function (court) { var s = Math.max(0, Math.floor((etat.fin * 1000 - Date.now()) / 1000)), j = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return court ? (j ? j + ' j' : deux(h) + ':' + deux(m)) : (j ? j + ' j ' : '') + deux(h) + ' h ' + deux(m) + ' min ' + deux(x) + ' s'; };
  function toast(t) { var x = el('<p class="cc-toast" role="status"></p>'); x.textContent = t; document.body.appendChild(x); setTimeout(function () { x.classList.add('is-out'); }, 3600); setTimeout(function () { x.remove(); }, 4200); }
  var calme = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  // Les confettis : animés par le navigateur (Web Animations), retirés quoi qu'il arrive au bout de 1,2 seconde
  function confettis(x, y) {
    if (calme()) return;
    var cols = ['#FF9EC4', '#FFE07A', '#A9EFD4', '#AED2FF', '#C9B8FF', '#FFB38A'];
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i'); p.className = 'cc-confetti';
      var a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110, dx = Math.cos(a) * d, dy = Math.sin(a) * d + 50, r = Math.random() * 720 - 360;
      p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = cols[i % cols.length];
      document.body.appendChild(p);
      if (p.animate) p.animate([{ transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 }, { transform: 'translate(' + (dx - 4) + 'px, ' + (dy - 6) + 'px) rotate(' + r + 'deg)', opacity: 0 }], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
      else p.style.opacity = '0';
      setTimeout(function (q) { return function () { if (q.parentNode) q.parentNode.removeChild(q); }; }(p), 1200);
    }
  }
  // Ruban saute, tourne et s'envole ; il quitte la page au bout de 0,9 seconde, même si le serveur tarde ou ne répond pas
  function envol(b) {
    b.disabled = true; b.classList.add('cc-attrape');
    var s = b.querySelector('svg');
    if (s && s.animate && !calme()) s.animate([
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(1.8) translateY(-10px) rotate(-12deg)', opacity: 1, offset: 0.35 },
      { transform: 'scale(1.6) translateY(-18px) rotate(200deg)', opacity: 1, offset: 0.6 },
      { transform: 'scale(0.2) translateY(-50px) rotate(400deg)', opacity: 0 }
    ], { duration: 850, easing: 'ease-in-out', fill: 'forwards' });
    else b.style.opacity = '0';
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 900);
  }
  // Le compteur flottant de l'espace client : les Rubans trouvés, le chrono du tirage et les indices
  function compteur() {
    var vieux = document.querySelector('[data-cc-compteur]'); if (vieux) vieux.remove();
    if (minuteur) clearInterval(minuteur);
    if (!etat || !etat.connecte || ici !== new URL(C.espace, location.href).pathname.replace(/\/?$/, '/')) return;
    var n = etat.trouves.length, T = etat.total;
    var b = el('<div class="cc-compteur" data-cc-compteur><button type="button" class="cc-compteur-btn" aria-expanded="false" aria-controls="cc-indices"><span class="cc-compteur-art" aria-hidden="true">' + C.ruban + '</span><span class="cc-compteur-n"><b>' + n + '</b>/' + T + '</span><span class="cc-compteur-chrono">' + C.icones.clock + '<span data-cc-court></span></span><span class="sr-only"> Rubans trouvés : voir les indices et le temps restant</span></button>'
      + '<div class="cc-indices" id="cc-indices" hidden><p class="cc-indices-t">Le jeu des Rubans</p><p class="cc-chrono">Prochain tirage dans <b data-cc-long></b><small data-cc-date></small></p><p class="cc-lot" data-cc-lot></p><ul></ul><p class="cc-indices-fin"></p><a class="cc-indices-regl" href="' + C.reglement + '">Le règlement du jeu</a></div></div>');
    var ul = b.querySelector('ul');
    etat.cachettes.forEach(function (c) { var ok = etat.trouves.indexOf(c.id) > -1; var li = el('<li class="' + (ok ? 'is-ok' : '') + '"><span class="cc-ind-ico" aria-hidden="true">' + (ok ? C.icones.check : '?') + '</span><span><b></b><small></small></span></li>'); li.querySelector('b').textContent = c.categorie + (ok ? ' : trouvé' : ''); li.querySelector('small').textContent = c.indice; ul.appendChild(li); });
    var fin = b.querySelector('.cc-indices-fin');
    if (etat.inscrit) fin.textContent = 'Vous participez au tirage au sort. Le gagnant reçoit un e-mail. Bonne chance !';
    else if (n >= T) { fin.innerHTML = '<button type="button" class="btn btn-primary cc-go-form">' + C.icones.gift + '<span>Je participe au tirage</span></button>'; fin.querySelector('button').addEventListener('click', formulaire); }
    else fin.textContent = 'Trouvez les ' + T + ' Rubans pour participer au tirage au sort.';
    var btn = b.querySelector('.cc-compteur-btn'), pan = b.querySelector('.cc-indices');
    btn.addEventListener('click', function () { var o = pan.hidden; pan.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
    document.body.appendChild(b);
    b.querySelector('[data-cc-date]').textContent = 'le ' + etat.fin_txt + ', heure de Paris';
    b.querySelector('[data-cc-lot]').textContent = 'À gagner pour vous : ' + etat.lot + '.' + (etat.mois_offerts ? ' ' + etat.mois_offerts : '');
    var tic = function () { b.querySelector('[data-cc-court]').textContent = reste(true); b.querySelector('[data-cc-long]').textContent = reste(false); };
    tic(); minuteur = setInterval(tic, 1000);
  }
  // Le formulaire, une fois les cinq trouvés
  function formulaire() {
    var d = document.querySelector('[data-cc-dialog]'); if (d) d.remove();
    d = el('<dialog class="cc-dialog" data-cc-dialog aria-labelledby="cc-titre"><form method="dialog" class="cc-fermer-f"><button class="cc-fermer" aria-label="Fermer">' + C.icones.x + '</button></form>'
      + '<div class="cc-art" aria-hidden="true">' + C.ruban + '</div><h2 id="cc-titre">Bravo, vous avez trouvé les ' + etat.total + ' Rubans !</h2>'
      + '<p>Ils gardent un cadeau : <strong>' + (etat.lot || C.lot) + '</strong>.' + (etat.client ? '' : ' Le site est à vous : vous le gardez, même après les mois offerts.') + ' Le tirage a lieu dans <b>' + reste(false) + '</b> : le gagnant est prévenu par e-mail.</p>'
      + '<div class="cc-deja" hidden><p class="cc-ok">' + C.icones.check + '<span>C’est noté : vous participez au tirage au sort. Bonne chance !</span></p></div>'
      + '<form class="cc-form"><label class="cc-label" for="cc-mail">Votre adresse e-mail, pour vous prévenir si vous gagnez</label><input class="cc-input" id="cc-mail" type="email" name="email" required autocomplete="email">'
      + '<label class="cc-label" for="cc-tel">Votre numéro de portable</label><input class="cc-input" id="cc-tel" type="tel" name="tel" required autocomplete="tel" inputmode="tel" placeholder="06 12 34 56 78"><small class="cc-aide">Un numéro ne sert qu’une fois : une seule participation par personne.</small>'
      + '<label class="check cc-check"><input type="checkbox" name="accord" value="1" required><span>J’ai lu le <a href="' + C.reglement + '" target="_blank" rel="noopener">règlement du jeu</a> et je l’accepte.</span></label>'
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
      if (b.disabled) return;
      var z = b.getBoundingClientRect(); confettis(z.left + z.width / 2, z.top + z.height / 2); envol(b);
      var rate = function (m) { toast(m || 'Ruban s’est échappé ! Il revient dans un instant : réessayez.'); setTimeout(function () { cacher(r); }, 1500); };
      post('aled08e_ruban_trouve', { _cc: etat.nonce, jeton: r.jeton }).catch(function () { return null; }).then(function (j) {
        if (!j || !j.success) { rate(j && j.data && j.data.message); return; }
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

/* L'état pour la page en cours : les Rubans de cette page (non trouvés), les trouvés, la participation, la fin de la manche */
function aled08e_concours_ajax_etat() {
    if (!aled08e_concours_ouvert()) wp_send_json_success(['ouvert' => false, 'connecte' => false]);
    $u = wp_get_current_user();
    if (!aled08e_concours_peut_jouer($u)) wp_send_json_success(['ouvert' => true, 'connecte' => false]);
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
        'inscrit' => (bool) $p, 'email' => $p ? $p['email'] : $u->user_email, 'fin' => (int) $e['fin'], 'fin_txt' => aled08e_date_fr((int) $e['fin']), 'lot' => aled08e_concours_lot_txt($u->ID), 'client' => aled08e_concours_est_client($u->ID), 'mois_offerts' => function_exists('aled08e_mois_offerts_txt') ? aled08e_mois_offerts_txt($u->ID) : '', 'nonce' => wp_create_nonce('aled08e_concours')]);
}
add_action('wp_ajax_aled08e_rubans', 'aled08e_concours_ajax_etat');
add_action('wp_ajax_nopriv_aled08e_rubans', 'aled08e_concours_ajax_etat');

/* Un Ruban attrapé : le jeton secret de sa cachette, vérifié par le serveur */
add_action('wp_ajax_aled08e_ruban_trouve', function () {
    $non = function ($m) { wp_send_json_error(['message' => $m]); };
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_cc'] ?? '')), 'aled08e_concours')) $non('La page a expiré : rechargez-la, puis attrapez Ruban à nouveau.');
    if (!aled08e_concours_ouvert()) $non('Le jeu est en pause. Merci d’avoir cherché les Rubans !');
    $u = wp_get_current_user();
    if (!aled08e_concours_peut_jouer($u)) $non('Ce compte ne peut pas participer (règlement, article 3).');
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
    if (!aled08e_concours_ouvert()) $non('Le jeu est en pause. Merci d’avoir cherché les Rubans !');
    $u = wp_get_current_user();
    if (!aled08e_concours_peut_jouer($u)) $non('Ce compte ne peut pas participer (règlement, article 3).');
    $e = aled08e_concours_etat();
    if (count(aled08e_concours_trouves($u->ID)) < count(aled08e_concours_categories())) $non('Il faut d’abord trouver les ' . count(aled08e_concours_categories()) . ' Rubans.');
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
    // un numéro (ou une adresse) déjà gagnant ne rejoue pas
    foreach ($e['tirages'] as $t) if (!empty($t['user']) && ((!empty($t['tel']) && $t['tel'] === $tel) || strtolower((string) $t['email']) === strtolower($email))) $non('Ce numéro ou cette adresse a déjà gagné : une seule victoire par personne.');
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
        return new WP_REST_Response(['ouvert' => aled08e_concours_ouvert(), 'manche' => (int) $e['manche'], 'id' => $e['id'], 'debut' => $e['debut'] ? wp_date('Y-m-d H:i', $e['debut']) : '',
            'tirage_le' => $e['fin'] ? wp_date('Y-m-d H:i', $e['fin']) : '', 'reste' => $e['fin'] ? aled08e_concours_reste_txt($e['fin']) : '', 'cachettes' => aled08e_concours_cachettes(),
            'joueurs' => $joueurs, 'trouves_par_ruban' => $parRuban, 'inscrits' => count($l), 'liste' => $l, 'tirages' => $e['tirages'], 'gagnants_affiches' => aled08e_concours_gagnants()], 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/concours', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_concours_faire']);
});
function aled08e_concours_faire(WP_REST_Request $req) {
    $p = (array) $req->get_json_params();
    $faire = sanitize_key((string) ($p['faire'] ?? ''));
    $e = aled08e_concours_etat();
    if ($faire === 'ouvrir') {
        if (aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Le jeu tourne déjà (manche ' . (int) $e['manche'] . ', tirage le ' . aled08e_date_fr((int) $e['fin']) . ').', ['status' => 409]);
        $e = aled08e_concours_nouvelle_manche($e, max(1, min(365, (int) ($p['jours'] ?? ALED08E_MANCHE_JOURS))));
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'manche' => $e['manche'], 'tirage_le' => wp_date('Y-m-d H:i', $e['fin']), 'cachettes' => aled08e_concours_cachettes()], 200);
    }
    if ($faire === 'melanger') {
        if (!aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Le jeu n’est pas lancé.', ['status' => 409]);
        $e['cachettes'] = aled08e_concours_choisir((array) $e['cachettes']);
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'cachettes' => aled08e_concours_cachettes(), 'note' => 'Les Rubans déjà trouvés restent comptés.'], 200);
    }
    if ($faire === 'cachette') {
        $k = sanitize_key((string) ($p['cachette'] ?? ''));
        if (!isset(aled08e_concours_categories()[$k])) return new WP_Error('aled08_concours', 'Cachette inconnue : ' . implode(', ', array_keys(aled08e_concours_categories())) . '.', ['status' => 400]);
        $v = aled08e_concours_cachettes()[$k];
        foreach (['chemin', 'selecteur', 'indice', 'coin'] as $c) if (isset($p[$c]) && is_string($p[$c]) && trim($p[$c]) !== '') $v[$c] = sanitize_text_field($p[$c]);
        if (!in_array($v['coin'], ['haut-gauche', 'haut-droite', 'bas-gauche', 'bas-droite'], true)) $v['coin'] = 'bas-droite';
        unset($v['categorie']);
        $e['cachettes'][$k] = $v;
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'cachette' => aled08e_concours_cachettes()[$k]], 200);
    }
    if ($faire === 'tirer') {
        if (!aled08e_concours_ouvert()) return new WP_Error('aled08_concours', 'Le jeu n’est pas lancé.', ['status' => 409]);
        $t = aled08e_concours_designer($e, $e['id'], [], 'tirer');
        $e = aled08e_concours_nouvelle_manche($e);
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'tirage' => $t, 'manche_suivante' => $e['manche'], 'tirage_suivant' => wp_date('Y-m-d H:i', $e['fin'])], 200);
    }
    if ($faire === 'retirer') {
        $der = end($e['tirages']);
        if (!$der) return new WP_Error('aled08_concours', 'Aucun tirage à refaire.', ['status' => 409]);
        if (!empty($der['commande'])) return new WP_Error('aled08_concours', 'Le gagnant a déjà commandé son site : pas de nouveau tirage.', ['status' => 409]);
        $exclus = [];
        foreach ($e['tirages'] as $i => $t) if ($t['id'] === $der['id'] && !empty($t['user'])) { $exclus[] = (int) $t['user']; $e['tirages'][$i]['code_fin'] = 0; delete_user_meta((int) $t['user'], 'aled08_concours_gagne'); }
        $t = aled08e_concours_designer($e, $der['id'], $exclus, 'retirer');
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'tirage' => $t, 'note' => 'L’ancien code est annulé.'], 200);
    }
    if ($faire === 'arreter') {
        $e['ouvert'] = false;
        aled08e_concours_sauver($e);
        return new WP_REST_Response(['ok' => true, 'note' => 'Le jeu est arrêté, sans tirage. Les Rubans ne se montrent plus.'], 200);
    }
    return new WP_Error('aled08_concours', 'À faire inconnu (ouvrir, melanger, cachette, tirer, retirer, arreter).', ['status' => 400]);
}

/* Le ménage : les données d'une manche tirée depuis plus de 3 mois sont effacées (une fois par jour au plus) */
add_action('init', function () {
    if (get_transient('aled08e_concours_menage')) return;
    set_transient('aled08e_concours_menage', 1, DAY_IN_SECONDS);
    $e = aled08e_concours_etat();
    $der = [];
    foreach ($e['tirages'] as $t) if (!isset($der[$t['id']]) || $t['le'] > $der[$t['id']]) $der[$t['id']] = $t['le'];
    $vieux = [];
    foreach ($der as $id => $le) {
        if ($id === $e['id'] && aled08e_concours_ouvert()) continue;
        if (strtotime($le) < current_time('timestamp') - 90 * DAY_IN_SECONDS) {
            delete_metadata('user', 0, aled08e_concours_cle($id), '', true);
            delete_metadata('user', 0, aled08e_concours_cle($id, 'rubans'), '', true);
            $vieux[] = $id;
        }
    }
    if ($vieux) { // le numéro du gagnant disparaît aussi de l'historique (son nom reste, pour l'encart des gagnants)
        foreach ($e['tirages'] as &$t) if (in_array($t['id'], $vieux, true)) $t['tel'] = '';
        aled08e_concours_sauver($e);
    }
}, 45);
