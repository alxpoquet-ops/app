<?php
/**
 * Les Minis Monstres Espace client : l'atelier « Les outils » (24 novembre 2026), côté écran de travail et moteur.
 *
 * Chaque outil vendu (src/config.js, outilsOffre.outils, via data.json) regroupe quelques « briques », les petits outils
 * déjà écrits (src/content/outils-lia.js) qui deviennent ses boutons :
 *  - publier  (Pépite)  : Publier partout. Une photo, quelques mots : le « kit de publication » (includes/kit-publication.php),
 *                         un texte et des hashtags par réseau, la photo et une vidéo au bon format, un bouton par réseau,
 *                         et un lien personnel pour tout retrouver sur le téléphone.
 *  - avis     (Cerise)  : Mes avis Google. Lien et QR code pour demander des avis, réponse à un avis, réponse à un client.
 *  - fiche    (Mirette) : Fiche produit. Photo recadrée et allégée, titre, description, prix conseillé, mise en boutique.
 *  - comparer (Plume)   : Comparer mes devis. 2 à 4 devis côte à côte, et le message pour négocier.
 * Aucun jeton, aucune « énergie » : l'usage est compris dans l'abonnement de l'outil, avec une limite par mois (compteur
 * en méta utilisateur, remis à zéro chaque mois). Avant chaque appel au modèle : outil actif (abonnement ou essai,
 * aled08e_outil_actif de abonnements-outils.php) et limite du mois. Le client ne lit jamais « IA », « jetons » ni « énergie ».
 *
 * Contrat (pour aled08-espace.php et abonnements-outils.php) :
 *  - aled08e_outil_html($uid, $id)  : l'écran de travail complet de l'outil, à insérer dans l'onglet « Mes outils ».
 *  - aled08e_outil_usage($uid, $id) : ['fait' => n, 'limite' => n] pour le mois en cours.
 * Points d'entrée (admin-ajax, nonce « aled08e_ao » dans le champ _ao, client connecté) : aled08e_ao_brique,
 * aled08e_ao_dernier, aled08e_ao_fini, aled08e_ao_programmer, aled08e_ao_deprogrammer, aled08e_ao_avis_lien,
 * aled08e_ao_boutique ; dans kit-publication.php : aled08e_ao_kit_maj, aled08e_ao_kit_mail, aled08e_ao_kit_rappel,
 * aled08e_ao_kit_effacer ; et dans reseaux.php : aled08e_rs (relier), aled08e_rs_photo, aled08e_publier.
 */
defined('ABSPATH') || exit;
require_once __DIR__ . '/kit-publication.php';

/* =========================================================================
 *  L'offre (data.json : outilsOffre ; valeurs de repli tant que l'export ne la contient pas)
 * ========================================================================= */
function aled08e_ao_offre() {
    static $offre = null;
    if ($offre !== null) return $offre;
    $defaut = [
        'publier' => ['nom' => 'Publier partout', 'monstre' => 'etoile', 'chef' => 'Pépite', 'color' => 'butter', 'statut' => 'pret', 'limite' => 60, 'unite' => 'publications', 'court' => 'Une photo, trois mots : un texte pour chaque réseau, publié partout.', 'briques' => ['publier', 'idees']],
        'avis' => ['nom' => 'Mes avis Google', 'monstre' => 'mascotte', 'chef' => 'Cerise', 'color' => 'pink', 'statut' => 'pret', 'limite' => 100, 'unite' => 'réponses', 'court' => 'Un QR code et un lien pour demander des avis, une réponse prête pour chaque avis.', 'briques' => ['avis', 'lienavis', 'qr', 'repondre']],
        'fiche' => ['nom' => 'Fiche produit', 'monstre' => 'gelee', 'chef' => 'Mirette', 'color' => 'sky', 'statut' => 'pret', 'limite' => 60, 'unite' => 'fiches', 'court' => 'Une photo : recadrée et allégée, avec un titre, une description et un prix conseillé.', 'briques' => ['produit', 'formats', 'conseilphoto', 'phototexte']],
        'comparer' => ['nom' => 'Comparer mes devis', 'monstre' => 'champi', 'chef' => 'Plume', 'color' => 'lilac', 'statut' => 'pret', 'limite' => 20, 'unite' => 'comparaisons', 'court' => 'Vos devis de fournisseurs côte à côte, et le message pour négocier le prix.', 'briques' => ['comparer']],
    ];
    $liste = aled08e_data()['outilsOffre']['outils'] ?? null;
    $offre = [];
    if (is_array($liste) && $liste) {
        foreach ($liste as $o) {
            if (!is_array($o) || empty($o['id'])) continue;
            $id = (string) $o['id'];
            $o += $defaut[$id] ?? [];
            if (empty($o['briques'])) $o['briques'] = $defaut[$id]['briques'] ?? [];
            $offre[$id] = $o;
        }
    } else {
        foreach ($defaut as $id => $o) $offre[$id] = ['id' => $id] + $o;
    }
    return $offre;
}
function aled08e_ao_outil($id) { $o = aled08e_ao_offre(); return $o[(string) $id] ?? null; }
/* L'outil est-il ouvert pour ce client (abonnement ou essai) ? Sans abonnements-outils.php : seulement pour un administrateur. */
function aled08e_ao_actif($uid, $id) {
    $o = aled08e_ao_outil($id);
    if (!$uid || !$o || ($o['statut'] ?? 'pret') !== 'pret') return false;
    if (function_exists('aled08e_outil_actif')) return (bool) aled08e_outil_actif($uid, $id);
    return user_can($uid, 'manage_options');
}
/* L'adresse de l'outil dans l'espace (retour d'une liaison Facebook ou LinkedIn) */
function aled08e_ao_url($id) { return (string) apply_filters('aled08e_outil_url', aled08e_url(['outil' => $id]) . '#outils', $id); }
/* Les briques d'un outil, avec leur définition (outils-lia.js) */
function aled08e_ao_briques($id) {
    $o = aled08e_ao_outil($id);
    $l = [];
    foreach ((array) ($o['briques'] ?? []) as $b) { $d = aled08e_jl_outil($b); if ($d) $l[$b] = $d; }
    return $l;
}
function aled08e_ao_chef($o, $b = null) { return (string) (($b['chef'] ?? '') ?: ($o['chef'] ?? 'Cerise')); }
/* Une phrase au fil de la bande (abonnements-outils.php), si elle existe */
function aled08e_ao_fil($uid, $monstre, $texte) { if (function_exists('aled08e_fil_ajouter')) aled08e_fil_ajouter($uid, $monstre, $texte); }

/* =========================================================================
 *  L'usage du mois : un appel au monstre réussi = 1 (publication écrite, réponse, fiche, comparaison)
 * ========================================================================= */
function aled08e_ao_usage_lire($uid) {
    $u = get_user_meta($uid, 'aled08_ao_usage', true);
    if (!is_array($u) || ($u['m'] ?? '') !== wp_date('Y-m')) $u = ['m' => wp_date('Y-m'), 'n' => []];
    return $u;
}
function aled08e_outil_usage($uid, $id) {
    $o = aled08e_ao_outil($id);
    $u = aled08e_ao_usage_lire((int) $uid);
    return ['fait' => (int) ($u['n'][(string) $id] ?? 0), 'limite' => (int) ($o['limite'] ?? 0)];
}
function aled08e_ao_reste($uid, $id) {
    $x = aled08e_outil_usage($uid, $id);
    return $x['limite'] > 0 ? max(0, $x['limite'] - $x['fait']) : PHP_INT_MAX;
}
function aled08e_ao_compter($uid, $id) {
    aled08e_jl_verrou($uid); // relit les métas en base : deux onglets ouverts ne s'écrasent pas
    $u = aled08e_ao_usage_lire($uid);
    $u['n'][(string) $id] = (int) ($u['n'][(string) $id] ?? 0) + 1;
    update_user_meta($uid, 'aled08_ao_usage', $u);
    aled08e_jl_deverrou($uid);
}
function aled08e_ao_usage_txt($uid, $id) {
    $o = aled08e_ao_outil($id);
    $x = aled08e_outil_usage($uid, $id);
    if ($x['limite'] <= 0) return $x['fait'] . ' ' . ($o['unite'] ?? '') . ' ce mois-ci';
    return $x['fait'] . ' sur ' . $x['limite'] . ' ' . ($o['unite'] ?? '') . ' ce mois-ci';
}
function aled08e_ao_limite_txt($id) {
    $o = aled08e_ao_outil($id);
    $mois = wp_date('j F', (new DateTime('first day of next month', wp_timezone()))->getTimestamp());
    return 'Vous avez utilisé vos ' . (int) ($o['limite'] ?? 0) . ' ' . ($o['unite'] ?? '') . ' de ce mois-ci avec ' . ($o['chef'] ?? 'la bande') . '. Elles reviennent le ' . str_replace('1 ', '1er ', $mois) . '.';
}

/* =========================================================================
 *  Les points d'entrée
 * ========================================================================= */
function aled08e_ao_entree() {
    $uid = get_current_user_id();
    if (!$uid || !check_ajax_referer('aled08e_ao', '_ao', false)) wp_send_json_error(['message' => 'La page avait expiré. Rechargez-la, puis réessayez.'], 403);
    return $uid;
}
function aled08e_ao_exiger($uid, $id) {
    if (!aled08e_ao_outil($id)) wp_send_json_error(['message' => 'Outil inconnu.'], 400);
    if (!aled08e_ao_actif($uid, $id)) wp_send_json_error(['message' => 'Cet outil n’est pas actif sur votre compte.', 'inactif' => true], 403);
}

/* Faire tourner une brique : vérifications, appel au monstre, usage compté seulement si le travail est rendu */
add_action('wp_ajax_aled08e_ao_brique', function () {
    $uid = aled08e_ao_entree();
    $id = sanitize_key(wp_unslash($_POST['outil'] ?? ''));
    $bid = sanitize_key(wp_unslash($_POST['brique'] ?? ''));
    aled08e_ao_exiger($uid, $id);
    $o = aled08e_ao_outil($id);
    $b = aled08e_jl_outil($bid);
    if (!$b || !in_array($bid, (array) $o['briques'], true) || !empty($b['local']) || empty($b['champs'])) wp_send_json_error(['message' => 'Ce bouton n’existe pas dans cet outil.'], 400);
    if (aled08e_ao_reste($uid, $id) < 1) wp_send_json_error(['message' => aled08e_ao_limite_txt($id), 'limite' => true], 400);
    // garde-fou : 30 essais par heure, comptés dès maintenant (avant tout traitement de photo)
    if (!aled08e_jl_quota($uid, 'aled08_ao_nb_', 30)) wp_send_json_error(['message' => 'Vous avez beaucoup travaillé cette heure-ci. Faites une pause et revenez dans un moment.'], 429);
    // un seul travail à la fois par client (le verrou tombe tout seul à la fin de la requête)
    global $wpdb;
    if ((int) $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 0)', 'aled08_ao_' . $wpdb->prefix . $uid)) !== 1) wp_send_json_error(['message' => 'Un petit monstre travaille déjà pour vous. Attendez sa réponse, puis relancez.'], 429);
    if (!aled08e_jl_outils_prets()) wp_send_json_error(['message' => 'Les petits monstres ne sont pas encore branchés. Alex s’en occupe : revenez un peu plus tard.'], 400);
    // Publier partout : seulement les réseaux possibles pour ce client
    $retirer = [];
    if ($bid === 'publier') {
        $relies = function_exists('aled08e_rs_relies') ? aled08e_rs_relies($uid) : [];
        if (!function_exists('aled08e_rs_site_ok') || !aled08e_rs_site_ok($uid)) $retirer[] = 'Mon site';
        if (!isset($relies['mastodon'])) $retirer[] = 'Mastodon'; // Bluesky a un lien prérempli : toujours proposé
    }
    $P = wp_unslash($_POST);
    $v = aled08e_jl_valeurs($uid, $b, $P, $_FILES, ['retirer' => $retirer]);
    if (is_wp_error($v)) wp_send_json_error(['message' => $v->get_error_message()], 400);
    if ($bid === 'comparer' && !$v['fichiers'] && trim((string) ($v['valeurs']['texte'] ?? '')) === '') wp_send_json_error(['message' => 'Envoyez vos devis : en photo, en PDF ou en texte collé.'], 400);
    // le ton et les autres choix sont retenus pour la prochaine fois
    $prefs = get_user_meta($uid, 'aled08_ao_prefs', true);
    $prefs = is_array($prefs) ? $prefs : [];
    foreach ((array) $b['champs'] as $c) if (in_array($c['kind'] ?? '', ['choix', 'multi'], true) && isset($v['valeurs'][$c['id']])) $prefs[$bid][$c['id']] = $v['valeurs'][$c['id']];
    update_user_meta($uid, 'aled08_ao_prefs', $prefs);
    $r = aled08e_jl_moteur($uid, $b, $v['valeurs'], $v['fichiers'], aled08e_ao_chef($o, $b));
    aled08e_jl_cout_outil($uid, $b, $r); // le coût Claude va au bilan du mois (rien n'est compté au client)
    if (is_wp_error($r)) wp_send_json_error(['message' => $r->get_error_message()], 400);
    if ($bid === 'publier') {
        // le kit de publication : la réponse est vérifiée avant de compter (une réponse abîmée ne compte pas)
        $kit = aled08e_kit_normaliser(isset($r['json']) ? $r['json'] : aled08e_kit_depuis_blocs($r['blocs'] ?? []), $v['valeurs']['reseaux'] ?? []);
        if (is_wp_error($kit)) wp_send_json_error(['message' => $kit->get_error_message()], 400);
        aled08e_ao_compter($uid, $id);
        $enr = aled08e_kit_creer($uid, $kit, $_FILES['c_image'] ?? [], (string) ($v['valeurs']['description'] ?? ''));
        aled08e_ao_fil($uid, 'etoile', 'Pépite a préparé votre publication pour ' . aled08e_kit_noms($kit['ordre']) . '.');
        $res = ['kit' => $kit, 'enr' => is_wp_error($enr) ? null : $enr, 'usage' => aled08e_outil_usage($uid, $id), 'usageTxt' => aled08e_ao_usage_txt($uid, $id)];
        update_user_meta($uid, 'aled08_ao_dernier', ['outil' => $id, 'brique' => $bid, 't' => time(), 'resultat' => $res]);
        wp_send_json_success($res);
    }
    aled08e_ao_compter($uid, $id);
    $res = ['blocs' => $r['blocs'], 'usage' => aled08e_outil_usage($uid, $id), 'usageTxt' => aled08e_ao_usage_txt($uid, $id)];
    // gardé une heure : si la connexion coupe pendant que le monstre écrit, le navigateur vient rechercher le résultat
    update_user_meta($uid, 'aled08_ao_dernier', ['outil' => $id, 'brique' => $bid, 't' => time(), 'resultat' => $res]);
    wp_send_json_success($res);
});

/* Connexion coupée pendant que le monstre écrivait : le navigateur redemande le dernier résultat */
add_action('wp_ajax_aled08e_ao_dernier', function () {
    $uid = aled08e_ao_entree();
    $d = get_user_meta($uid, 'aled08_ao_dernier', true);
    $depuis = time() - max(0, min(900, (int) ($_POST['il_y_a'] ?? 0)));
    $bid = sanitize_key(wp_unslash($_POST['brique'] ?? ''));
    if (!is_array($d) || ($d['brique'] ?? '') !== $bid || (int) ($d['t'] ?? 0) < $depuis || (empty($d['resultat']['blocs']) && empty($d['resultat']['kit']))) wp_send_json_error(['message' => 'Rien de nouveau.'], 404);
    wp_send_json_success($d['resultat']);
});

/* Fin d'une publication : une phrase au fil de la bande, seulement pour ce que Pépite a vraiment publié (historique des
 * 30 dernières minutes). La préparation (« Pépite a préparé votre publication pour… ») est notée dès que le kit est écrit. */
add_action('wp_ajax_aled08e_ao_fini', function () {
    $uid = aled08e_ao_entree();
    aled08e_ao_exiger($uid, 'publier');
    if (!aled08e_jl_quota($uid, 'aled08_ao_fil_', 20)) wp_send_json_success([]);
    $noms = function_exists('aled08e_rs_noms') ? aled08e_rs_noms() : [];
    $histo = get_user_meta($uid, 'aled08_rs_histo', true);
    $faits = [];
    foreach (is_array($histo) ? $histo : [] as $l) if ((int) ($l['t'] ?? 0) > time() - 30 * MINUTE_IN_SECONDS) $faits[$l['r']] = 1;
    $pub = [];
    foreach (array_unique(array_map('sanitize_key', (array) wp_unslash($_POST['publies'] ?? []))) as $r) if (isset($noms[$r], $faits[$r])) $pub[] = $noms[$r];
    if (!$pub) wp_send_json_success([]);
    $x = trim(preg_replace('/\s+/u', ' ', sanitize_text_field(wp_unslash($_POST['extrait'] ?? ''))));
    $x = $x !== '' ? '« ' . (mb_strlen($x) > 60 ? rtrim(mb_substr($x, 0, 57)) . '…' : $x) . ' »' : 'votre publication';
    $liste = function ($l) { return count($l) > 1 ? implode(', ', array_slice($l, 0, -1)) . ' et ' . end($l) : $l[0]; };
    $t = 'Pépite a publié ' . $x . ' sur ' . $liste($pub) . '.';
    aled08e_ao_fil($uid, 'etoile', $t);
    wp_send_json_success([]);
});

/* =========================================================================
 *  Programmer pour plus tard (tâche planifiée WordPress) : seulement les réseaux où Pépite publie directement
 * ========================================================================= */
function aled08e_ao_progs($uid) { $l = get_user_meta($uid, 'aled08_ao_prog', true); return is_array($l) ? $l : []; }
add_action('wp_ajax_aled08e_ao_programmer', function () {
    $uid = aled08e_ao_entree();
    aled08e_ao_exiger($uid, 'publier');
    if (!aled08e_jl_quota($uid, 'aled08_ao_prg_', 20)) wp_send_json_error(['message' => 'Beaucoup de publications programmées cette heure-ci. Réessayez dans un moment.'], 429);
    $quand = sanitize_text_field(wp_unslash($_POST['quand'] ?? ''));
    $dt = DateTime::createFromFormat('Y-m-d\TH:i', $quand, wp_timezone());
    if (!$dt) wp_send_json_error(['message' => 'Choisissez un jour et une heure.'], 400);
    $t = $dt->getTimestamp();
    if ($t < time() + 10 * MINUTE_IN_SECONDS) wp_send_json_error(['message' => 'Choisissez un moment dans plus de 10 minutes.'], 400);
    if ($t > time() + 30 * DAY_IN_SECONDS) wp_send_json_error(['message' => 'Pépite programme jusqu’à 30 jours à l’avance.'], 400);
    $progs = aled08e_ao_progs($uid);
    if (count($progs) >= 10) wp_send_json_error(['message' => 'Vous avez déjà 10 publications programmées. Attendez qu’une parte.'], 400);
    $directs = aled08e_rs_directs($uid);
    $textes = [];
    foreach ((array) wp_unslash($_POST['textes'] ?? []) as $r => $x) {
        $r = sanitize_key($r);
        $x = aled08e_jl_texte(is_scalar($x) ? $x : '');
        if (!isset($directs[$r]) || $x === '' || mb_strlen($x) > 5000) continue;
        $textes[$r] = $x;
    }
    if (!$textes) wp_send_json_error(['message' => 'Rien à programmer : seuls les réseaux présentés à Pépite (et votre site) se programment.'], 400);
    if (isset($textes['instagram']) && empty($_FILES['image']['name'])) wp_send_json_error(['message' => 'Instagram demande une photo.'], 400);
    $photo = null;
    if (!empty($_FILES['image']['name'])) {
        $photo = aled08e_rs_photo_deposer($uid, $_FILES['image'], $t - time() + HOUR_IN_SECONDS);
        if (is_wp_error($photo)) wp_send_json_error(['message' => $photo->get_error_message()], 400);
    }
    $pid = wp_generate_password(12, false, false);
    $progs[$pid] = ['t' => $t, 'textes' => $textes, 'photo' => $photo ? $photo['ref'] : '', 'extrait' => mb_substr(sanitize_text_field(wp_unslash($_POST['extrait'] ?? '')), 0, 80)];
    update_user_meta($uid, 'aled08_ao_prog', $progs);
    wp_schedule_single_event($t, 'aled08_ao_programme', [(int) $uid, $pid]);
    $noms = aled08e_rs_noms();
    wp_send_json_success(['message' => 'C’est programmé pour le ' . wp_date('j F à G \h i', $t) . ' sur ' . implode(', ', array_map(function ($r) use ($noms) { return $noms[$r] ?? $r; }, array_keys($textes))) . '.']);
});
add_action('wp_ajax_aled08e_ao_deprogrammer', function () {
    $uid = aled08e_ao_entree();
    $pid = preg_replace('/[^A-Za-z0-9]/', '', (string) wp_unslash($_POST['id'] ?? ''));
    $progs = aled08e_ao_progs($uid);
    if (!isset($progs[$pid])) wp_send_json_error(['message' => 'Cette publication n’est plus programmée.'], 404);
    wp_clear_scheduled_hook('aled08_ao_programme', [(int) $uid, $pid]);
    unset($progs[$pid]);
    update_user_meta($uid, 'aled08_ao_prog', $progs);
    wp_send_json_success(['message' => 'C’est annulé.']);
});
add_action('aled08_ao_programme', function ($uid, $pid) {
    $uid = (int) $uid;
    $progs = aled08e_ao_progs($uid);
    $p = $progs[$pid] ?? null;
    if (!$p) return;
    unset($progs[$pid]);
    update_user_meta($uid, 'aled08_ao_prog', $progs);
    if (!aled08e_ao_actif($uid, 'publier')) { aled08e_ao_fil($uid, 'etoile', 'Pépite n’a pas publié votre publication programmée : Publier partout n’est plus actif sur votre compte.'); return; }
    @set_time_limit(300);
    $image = $p['photo'] !== '' ? aled08e_rs_photo($uid, $p['photo']) : null;
    $noms = aled08e_rs_noms();
    $ok = []; $rate = [];
    foreach ((array) $p['textes'] as $r => $texte) {
        $x = aled08e_rs_publier($uid, $r, $texte, $image);
        if (is_wp_error($x)) { $rate[] = ($noms[$r] ?? $r) . ' (' . $x->get_error_message() . ')'; continue; }
        aled08e_rs_garder($uid, $r, $x['url'], $texte);
        $ok[] = $noms[$r] ?? $r;
    }
    $x = $p['extrait'] !== '' ? '« ' . $p['extrait'] . ' »' : 'votre publication programmée';
    if ($ok) aled08e_ao_fil($uid, 'etoile', 'Pépite a publié ' . $x . ' sur ' . implode(', ', $ok) . ', comme prévu.');
    if ($rate) aled08e_ao_fil($uid, 'etoile', 'Pépite n’a pas pu publier ' . $x . ' sur ' . implode(', ', $rate) . '. Vous pouvez la refaire depuis Publier partout.');
}, 10, 2);

/* =========================================================================
 *  Mes avis Google : le client donne lui-même son lien d'avis (rien à faire pour Alex)
 * ========================================================================= */
function aled08e_ao_lien_avis_ok($url) {
    $h = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    if (!preg_match('#^https://#i', $url) || $h === '') return false;
    if (in_array($h, ['g.page', 'maps.app.goo.gl', 'goo.gl', 'search.google.com', 'business.google.com', 'maps.google.com'], true)) return true;
    return (bool) preg_match('/^(www\.)?google\.[a-z.]{2,6}$/', $h);
}
add_action('wp_ajax_aled08e_ao_avis_lien', function () {
    $uid = aled08e_ao_entree();
    aled08e_ao_exiger($uid, 'avis');
    $url = esc_url_raw(trim((string) wp_unslash($_POST['lien'] ?? '')), ['https']);
    if (!aled08e_ao_lien_avis_ok($url)) wp_send_json_error(['message' => 'Ce lien ne vient pas de Google. Copiez le lien donné par « Demander des avis » dans votre fiche Google.'], 400);
    update_user_meta($uid, 'aled08_avis', $url);
    wp_send_json_success(['message' => 'C’est enregistré.', 'lien' => $url]);
});

/* =========================================================================
 *  Fiche produit : mettre en boutique (site du client relié, option e-commerce)
 * ========================================================================= */
function aled08e_ao_boutique_ok($uid) {
    return function_exists('aled08e_est_boutique') && aled08e_est_boutique($uid) && function_exists('aled08e_rs_site_ok') && aled08e_rs_site_ok($uid);
}
add_action('wp_ajax_aled08e_ao_boutique', function () {
    $uid = aled08e_ao_entree();
    aled08e_ao_exiger($uid, 'fiche');
    if (!aled08e_ao_boutique_ok($uid)) wp_send_json_error(['message' => 'La mise en boutique est pour les boutiques faites par Les Minis Monstres. Copiez votre fiche à la place.'], 400);
    $n = (int) get_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'));
    if ($n >= 40) wp_send_json_error(['message' => 'Vous avez beaucoup travaillé aujourd’hui ! Revenez demain pour d’autres articles.'], 429);
    $P = wp_unslash($_POST);
    $nom = trim(sanitize_text_field((string) ($P['nom'] ?? '')));
    $desc = mb_substr(trim(sanitize_textarea_field((string) ($P['description'] ?? ''))), 0, 3000);
    $sansPrix = !empty($P['sans_prix']);
    $prix = $sansPrix ? 0 : (float) str_replace(',', '.', preg_replace('/[^\d,.]/', '', (string) ($P['prix'] ?? '')));
    if ($nom === '' || mb_strlen($nom) > 120) wp_send_json_error(['message' => 'Donnez un titre à votre article (120 caractères au plus).'], 400);
    if (!$sansPrix && ($prix < 0.5 || $prix > 5000)) wp_send_json_error(['message' => 'Indiquez votre prix (entre 0,50 € et 5 000 €), ou cochez « Sans prix ».'], 400);
    if (empty($_FILES['image']['name'])) wp_send_json_error(['message' => 'Ajoutez la photo du produit, en haut.'], 400);
    if (function_exists('aled08e_art_produits') && function_exists('aled08e_art_total')) {
        $prods = aled08e_art_produits($uid, true);
        if (is_array($prods) && count($prods) >= aled08e_art_total($uid)) wp_send_json_error(['message' => 'Tous vos emplacements d’articles sont pris. Débloquez-en un dans Ma boutique.'], 400);
    }
    if ((int) ($_FILES['image']['size'] ?? 0) > 8 * MB_IN_BYTES) wp_send_json_error(['message' => 'La photo est trop lourde (8 Mo au plus).'], 400);
    $ft = wp_check_filetype_and_ext($_FILES['image']['tmp_name'] ?? '', $_FILES['image']['name']);
    if (!in_array($ft['type'] ?? '', ['image/jpeg', 'image/png', 'image/webp'], true)) wp_send_json_error(['message' => 'La photo doit être un JPG, un PNG ou un WEBP.'], 400);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $aid = media_handle_upload('image', 0);
    if (is_wp_error($aid)) wp_send_json_error(['message' => 'La photo n’a pas pu être envoyée. Essayez avec une photo plus légère.'], 400);
    set_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'), $n + 1, DAY_IN_SECONDS);
    $args = ['nom' => $nom, 'description' => $desc, 'image_url' => wp_get_attachment_url($aid)] + ($sansPrix ? ['sans_prix' => 1] : ['prix' => $prix]);
    $res = aled08e_lia_appel($uid, 'article_poser', $args);
    if (!is_array($res) || empty($res['id'])) {
        wp_delete_attachment((int) $aid, true);
        wp_send_json_error(['message' => 'Votre boutique n’a pas répondu. Réessayez dans un instant, ou copiez la fiche.'], 400);
    }
    if (function_exists('aled08e_bg_oublier')) aled08e_bg_oublier($uid);
    delete_transient('aled08_art_cat_' . (int) $uid);
    aled08e_ao_fil($uid, 'gelee', 'Mirette a mis « ' . mb_substr($nom, 0, 60) . ' » en boutique.');
    wp_send_json_success(['message' => 'Votre article est en ligne dans votre boutique !']);
});

/* =========================================================================
 *  L'écran de travail
 * ========================================================================= */
function aled08e_ao_prefs($uid, $bid) { $p = get_user_meta($uid, 'aled08_ao_prefs', true); return is_array($p) && is_array($p[$bid] ?? null) ? $p[$bid] : []; }
/* Un champ d'une brique. $sansPhoto : la photo est choisie une fois en haut de l'outil (Publier partout, Fiche produit). */
function aled08e_ao_champ($id, $bid, $c, $uid, $prefs, $sansPhoto, $options = null) {
    $kind = (string) ($c['kind'] ?? 'texte');
    $n = 'c_' . $c['id'];
    $idh = 'ao-' . $id . '-' . $bid . '-' . $c['id'];
    $aide = !empty($c['aide']) ? '<small class="ol-aide" id="' . esc_attr($idh) . '-aide">' . esc_html($c['aide']) . '</small>' : '';
    $decrit = !empty($c['aide']) ? ' aria-describedby="' . esc_attr($idh) . '-aide"' : '';
    $req = !empty($c['requis']) ? ' required' : '';
    switch ($kind) {
        case 'image':
            if ($sansPhoto) return '';
            return '<label class="req-photo ol-photo"><input type="file" name="c_image" accept="image/*" class="sr-only" data-ao-file' . (!empty($c['requis']) ? ' data-requis="1"' : '') . '>' . aled08e_icon('image-plus') . '<span data-ao-file-nom>' . esc_html($c['label']) . '</span></label>' . $aide;
        case 'fichiers':
            return '<div class="field"><span class="label">' . esc_html($c['label']) . '</span><label class="req-photo ol-photo"><input type="file" name="c_' . esc_attr($c['id']) . '[]" multiple accept="image/*,application/pdf" class="sr-only" data-ao-fichiers data-max="' . (int) ($c['max'] ?? 4) . '"' . $decrit . '>' . aled08e_icon('camera') . '<span>Photographier ou choisir mes devis</span></label><ul class="ao-fichiers" data-ao-fichiers-liste></ul>' . $aide . '</div>';
        case 'texte_long':
            $max = aled08e_jl_max($c);
            return '<div class="field"><label for="' . esc_attr($idh) . '">' . esc_html($c['label']) . '</label><textarea id="' . esc_attr($idh) . '" name="' . esc_attr($n) . '" rows="' . ($max > 2000 ? 7 : 3) . '" data-max="' . (int) $max . '"' . $req . $decrit . '></textarea><small class="ol-compte" data-ao-compte aria-live="polite"></small>' . $aide . '</div>';
        case 'choix':
            $choisi = (string) ($prefs[$c['id']] ?? ($c['defaut'] ?? ''));
            $h = '<div class="field"><label for="' . esc_attr($idh) . '">' . esc_html($c['label']) . '</label><select id="' . esc_attr($idh) . '" name="' . esc_attr($n) . '"' . $decrit . '>';
            foreach ((array) $c['options'] as $opt) $h .= '<option' . ($choisi === $opt ? ' selected' : '') . '>' . esc_html($opt) . '</option>';
            return $h . '</select>' . $aide . '</div>';
        case 'multi':
            $opts = $options !== null ? $options : (array) $c['options'];
            $coches = isset($prefs[$c['id']]) ? (array) $prefs[$c['id']] : (array) ($c['defaut'] ?? []);
            $h = '<fieldset class="field ol-multi"><legend>' . esc_html($c['label']) . '</legend><div class="ol-puces">';
            foreach ($opts as $opt) $h .= '<label class="ol-puce"><input type="checkbox" name="' . esc_attr($n) . '[]" value="' . esc_attr($opt) . '"' . (in_array($opt, $coches, true) ? ' checked' : '') . '><span>' . esc_html($opt) . '</span></label>';
            return $h . '</div>' . $aide . '</fieldset>';
        default:
            $val = ($c['prerempli'] ?? '') === 'activite' ? (string) get_user_meta($uid, 'aled08_jl_activite', true) : '';
            return '<div class="field"><label for="' . esc_attr($idh) . '">' . esc_html($c['label']) . '</label><input id="' . esc_attr($idh) . '" type="text" name="' . esc_attr($n) . '" maxlength="' . (int) aled08e_jl_max($c) . '" value="' . esc_attr($val) . '"' . $req . $decrit . '>' . $aide . '</div>';
    }
}
/* Le formulaire d'une brique et la place de son résultat */
function aled08e_ao_form($id, $bid, $b, $uid, $sansPhoto, $options = [], $bouton = '') {
    $prefs = aled08e_ao_prefs($uid, $bid);
    $photo = '';
    foreach ((array) $b['champs'] as $c) if (($c['kind'] ?? '') === 'image' && $sansPhoto) $photo = !empty($c['requis']) ? 'requis' : 'oui';
    $h = '<form class="ol-form" data-ao-form data-brique="' . esc_attr($bid) . '"' . ($photo ? ' data-photo="' . $photo . '"' : '') . ' novalidate>';
    foreach ((array) $b['champs'] as $c) $h .= aled08e_ao_champ($id, $bid, $c, $uid, $prefs, $sansPhoto, $options[$c['id']] ?? null);
    $h .= '<div class="ol-boutons"><button class="btn btn-primary" type="submit">' . aled08e_icon('sparkles') . '<span>' . esc_html($bouton ?: ($b['bouton'] ?? 'Lancer')) . '</span></button></div>'
        . '<p class="ol-etat" data-ao-etat role="status" aria-live="polite"></p></form>';
    $h .= '<div class="ol-resultat" data-ao-res' . (!empty($b['note']) ? ' data-note="' . esc_attr($b['note']) . '"' : '') . (!empty($b['limites']) ? ' data-limites="' . esc_attr(wp_json_encode($b['limites'])) . '"' : '') . ' hidden></div>';
    return $h;
}
/* La photo choisie une fois pour tout l'outil */
function aled08e_ao_photo_html($id, $titre, $aide) {
    return '<div class="ao-photo" data-ao-photo><p class="app-sub">' . esc_html($titre) . '</p>'
        . '<label class="ao-photo-zone"><input type="file" accept="image/*" class="sr-only" id="ao-photo-' . esc_attr($id) . '" data-ao-photo-file><img alt="" data-ao-photo-apercu hidden><span class="ao-photo-vide" data-ao-photo-vide>' . aled08e_icon('camera') . '<span>' . esc_html($aide) . '</span></span></label>'
        . '<button type="button" class="link-btn" data-ao-photo-retirer hidden>Retirer la photo</button><p class="ol-etat" data-ao-photo-etat role="status" aria-live="polite"></p></div>';
}
/* Les boutons d'un outil (ses briques) */
function aled08e_ao_nav($panneaux) {
    if (count($panneaux) < 2) return '';
    $h = '<div class="ol-filtres ao-nav" role="group" aria-label="Que voulez-vous faire ?">';
    $i = 0;
    foreach ($panneaux as $pid => $nom) { $h .= '<button type="button" class="ol-filtre' . ($i === 0 ? ' is-on' : '') . '" data-ao-aller="' . esc_attr($pid) . '" aria-pressed="' . ($i === 0 ? 'true' : 'false') . '">' . esc_html($nom) . '</button>'; $i++; }
    return $h . '</div>';
}
function aled08e_ao_panneau($pid, $contenu, $visible) { return '<div class="ao-panneau" data-ao-panneau="' . esc_attr($pid) . '"' . ($visible ? '' : ' hidden') . '>' . $contenu . '</div>'; }

/* L'écran complet d'un outil, prêt à insérer dans l'onglet « Mes outils » */
function aled08e_outil_html($uid, $id) {
    $uid = (int) $uid;
    $o = aled08e_ao_outil($id);
    if (!$o) return '';
    $tete = '<header class="ao-tete"><span class="ao-monstre" aria-hidden="true">' . aled08e_monster((string) ($o['monstre'] ?? 'mascotte')) . '</span><div><p class="ao-chef">' . esc_html($o['chef'] ?? '') . '</p><h3>' . esc_html($o['nom'] ?? $id) . '</h3>' . (!empty($o['court']) ? '<p class="ao-court">' . esc_html($o['court']) . '</p>' : '') . '</div></header>';
    $ouvrir = '<section class="ao c-' . esc_attr($o['color'] ?? 'lilac') . '" id="ao-' . esc_attr($id) . '" data-ao="' . esc_attr($id) . '"';
    if (($o['statut'] ?? 'pret') !== 'pret') return aled08e_ao_styles() . $ouvrir . '>' . $tete . '<p class="esp-empty">Bientôt : ' . esc_html($o['chef'] ?? 'la bande') . ' prépare cet outil.</p></section>';
    if (!aled08e_ao_actif($uid, $id)) return aled08e_ao_styles() . $ouvrir . '>' . $tete . '<p class="esp-empty">Cet outil n’est pas encore actif sur votre compte.</p></section>';
    aled08e_ao_scripts();
    $x = aled08e_outil_usage($uid, $id);
    $pct = $x['limite'] > 0 ? min(100, (int) round(100 * $x['fait'] / $x['limite'])) : 0;
    $h = aled08e_ao_styles() . $ouvrir . ' data-chef="' . esc_attr($o['chef'] ?? '') . '" data-ajax="' . esc_url(admin_url('admin-ajax.php')) . '" data-nonce="' . esc_attr(wp_create_nonce('aled08e_ao')) . '" data-unite="' . esc_attr($o['unite'] ?? '') . '">' . $tete
        . '<div class="ao-usage"><span class="ao-jauge" aria-hidden="true"><span data-ao-jauge style="width:' . (int) $pct . '%"></span></span><small data-ao-usage>' . esc_html(aled08e_ao_usage_txt($uid, $id)) . '</small></div>';
    $flash = get_transient('aled08_ao_flash_' . $uid);
    if (is_array($flash) && $id === 'publier') { delete_transient('aled08_ao_flash_' . $uid); $h .= '<p class="' . ($flash[0] ? 'esp-empty' : 'esp-warn') . '" role="status">' . esc_html($flash[1]) . '</p>'; }
    if (!aled08e_jl_outils_prets()) $h .= '<p class="esp-warn">Les petits monstres se branchent en ce moment : revenez un peu plus tard pour qu’ils écrivent pour vous.</p>';
    if ($id === 'publier') $h .= aled08e_ao_publier_html($uid, $o);
    elseif ($id === 'avis') $h .= aled08e_ao_avis_html($uid, $o);
    elseif ($id === 'fiche') $h .= aled08e_ao_fiche_html($uid, $o);
    else {
        $br = aled08e_ao_briques($id);
        $noms = [];
        foreach ($br as $bid => $b) if (empty($b['local'])) $noms[$bid] = $b['name'];
        $h .= aled08e_ao_nav($noms);
        $i = 0;
        foreach ($noms as $bid => $nom) $h .= aled08e_ao_panneau($bid, '<p class="app-note">' . esc_html($br[$bid]['desc'] ?? '') . '</p>' . aled08e_ao_form($id, $bid, $br[$bid], $uid, false), $i++ === 0);
    }
    return $h . '</section>';
}

/* ---------- Publier partout : le kit de publication ---------- */
function aled08e_ao_publier_html($uid, $o) {
    $b = aled08e_jl_outil('publier');
    $idees = aled08e_jl_outil('idees');
    if (!$b) return '<p class="esp-warn">Cet outil se prépare.</p>';
    $directs = function_exists('aled08e_rs_directs') ? aled08e_rs_directs($uid) : [];
    $site = function_exists('aled08e_rs_site_ok') && aled08e_rs_site_ok($uid);
    $options = [];
    foreach ((array) (array_values(array_filter($b['champs'], function ($c) { return $c['id'] === 'reseaux'; }))[0]['options'] ?? []) as $r) {
        if ($r === 'Mon site' && !$site) continue;
        if ($r === 'Mastodon' && !isset($directs['mastodon'])) continue; // Mastodon : seulement présenté à Pépite (chaque serveur a son adresse)
        $options[] = $r;
    }
    $prefs = aled08e_ao_prefs($uid, 'publier');
    // la première fois, un client qui a un site chez nous publie aussi sur son site
    if (!isset($prefs['reseaux']) && $site) foreach ($b['champs'] as $c) if ($c['id'] === 'reseaux') $prefs['reseaux'] = array_merge((array) ($c['defaut'] ?? []), ['Mon site']);
    // les anciens choix (avant le kit) : TikTok et YouTube s'ajoutent une fois, puisqu'ils viennent d'arriver
    if (isset($prefs['reseaux']) && !get_user_meta($uid, 'aled08_kit_vu', true)) { $prefs['reseaux'] = array_values(array_unique(array_merge((array) $prefs['reseaux'], ['TikTok', 'YouTube']))); update_user_meta($uid, 'aled08_kit_vu', 1); }
    $champs = [];
    foreach ($b['champs'] as $c) $champs[$c['id']] = $c;
    $reglages = (isset($champs['ton']) ? aled08e_ao_champ('publier', 'publier', $champs['ton'], $uid, $prefs, true) : '') . (isset($champs['activite']) ? aled08e_ao_champ('publier', 'publier', $champs['activite'], $uid, $prefs, true) : '');
    $form = '<form class="ol-form" data-ao-form data-brique="publier" data-photo="oui" data-ao-pub novalidate>'
        . (isset($champs['description']) ? aled08e_ao_champ('publier', 'publier', $champs['description'], $uid, $prefs, true) : '')
        . (isset($champs['reseaux']) ? aled08e_ao_champ('publier', 'publier', $champs['reseaux'], $uid, $prefs, true, $options) : '')
        . ($reglages !== '' ? '<details class="ao-plus"><summary class="link-btn">Le ton : ' . esc_html((string) ($prefs['ton'] ?? ($champs['ton']['defaut'] ?? 'Chaleureux'))) . ', votre ville</summary><div class="ao-reglages">' . $reglages . '</div></details>' : '')
        . '<div class="ol-boutons"><button class="btn btn-primary ao-grand" type="submit">' . aled08e_icon('sparkles') . '<span>' . esc_html($b['bouton'] ?? 'Pépite, à toi !') . '</span></button></div>'
        . '<p class="ol-etat" data-ao-etat role="status" aria-live="polite"></p></form>';
    // les publications programmées
    $progs = aled08e_ao_progs($uid);
    $noms = function_exists('aled08e_rs_noms') ? aled08e_rs_noms() : [];
    $prog = '';
    if ($progs) {
        uasort($progs, function ($a, $c) { return $a['t'] <=> $c['t']; });
        $prog = '<div class="ao-progs"><p class="app-sub">' . aled08e_icon('clock') . 'Programmées</p><ul>';
        foreach ($progs as $pid => $p) $prog .= '<li><span><strong>' . esc_html(wp_date('j F à G \h i', (int) $p['t'])) . '</strong> · ' . esc_html(implode(', ', array_map(function ($r) use ($noms) { return $noms[$r] ?? $r; }, array_keys((array) $p['textes'])))) . ($p['extrait'] !== '' ? '<small>' . esc_html($p['extrait']) . '</small>' : '') . '</span><button type="button" class="link-btn" data-ao-deprog="' . esc_attr($pid) . '">Annuler</button></li>';
        $prog .= '</ul></div>';
    }
    $monstre = '<span class="ao-mini" aria-hidden="true">' . aled08e_monster('etoile') . '</span>';
    $ecran1 = '<div class="ao-ecran" data-ao-ecran="1">' . aled08e_ao_photo_html('publier', 'Votre photo', 'Prendre ou choisir une photo (facultatif)') . $form
        . ($idees ? '<p class="ao-aussi"><button type="button" class="btn btn-light btn-sm" data-ao-aller="idees">' . aled08e_icon('lightbulb') . '<span>Pas d’idée ? Les idées de la semaine</span></button></p>' : '')
        . aled08e_kit_liste_html($uid) . $prog . (function_exists('aled08e_rs_html') ? aled08e_rs_html($uid) : '') . '</div>';
    $min = wp_date('Y-m-d\TH:i', time() + 15 * MINUTE_IN_SECONDS);
    $maxd = wp_date('Y-m-d\TH:i', time() + 30 * DAY_IN_SECONDS);
    $tel = '<div class="kp-tel" data-ao-kit-tel hidden><div class="ao-qr"><div class="ao-qr-code" data-ao-kit-qr></div><div>'
        . '<p class="app-sub">' . aled08e_icon('phone') . 'Sur mon téléphone</p>'
        . '<p class="app-note">Visez ce code avec l’appareil photo de votre téléphone, ou recevez le lien par e-mail : la photo, la vidéo et les textes y sont prêts, un bouton par réseau. Le lien marche sans mot de passe jusqu’au <span data-ao-kit-fin></span>.</p>'
        . '<div class="ol-bloc-actions"><button type="button" class="btn btn-primary btn-sm" data-ao-kit-mail>' . aled08e_icon('mail') . '<span>M’envoyer le lien</span></button><button type="button" class="btn btn-light btn-sm" data-ao-kit-copier>' . aled08e_icon('link') . '<span>Copier le lien</span></button></div></div></div>'
        . '<details class="ao-plus"><summary class="link-btn">' . aled08e_icon('clock') . '<span>Me le rappeler plus tard</span></summary><div class="ao-prog"><div class="field"><label for="ao-kit-quand">Me le rappeler le… à…</label><input id="ao-kit-quand" type="datetime-local" data-ao-kit-quand min="' . esc_attr($min) . '" max="' . esc_attr($maxd) . '"></div>'
        . '<p class="app-note">À l’heure choisie, Pépite vous envoie un e-mail « C’est l’heure de publier », avec le lien.</p><button type="button" class="btn btn-primary btn-sm" data-ao-kit-rappel>Me le rappeler</button></div></details>'
        . '<p class="ol-etat" data-ao-kit-etat role="status" aria-live="polite"></p>'
        . '<p class="kp-bas"><button type="button" class="link-btn" data-ao-kit-suppr-courant>Supprimer ce lien</button></p></div>';
    $ecran2 = '<div class="ao-ecran" data-ao-ecran="2" hidden><p class="ao-titre">' . $monstre . '<span>Pépite a préparé votre publication</span></p>'
        . '<p class="app-note" data-ao-consigne></p>'
        . $tel
        . '<div class="kp-fichiers" data-ao-kit-fichiers></div>'
        . '<div class="ao-cartes" data-ao-cartes></div>'
        . '<div class="ol-boutons"><button type="button" class="btn btn-primary ao-grand" data-ao-tout>' . aled08e_icon('send') . '<span>Tout publier</span></button>'
        . '<button type="button" class="btn btn-light" data-ao-prog-ouvrir>' . aled08e_icon('clock') . '<span>Programmer pour plus tard</span></button></div>'
        . '<div class="ao-prog" data-ao-prog hidden><div class="field"><label for="ao-prog-quand">Quand publier ?</label><input id="ao-prog-quand" type="datetime-local" data-ao-prog-quand min="' . esc_attr($min) . '" max="' . esc_attr($maxd) . '"></div>'
        . '<button type="button" class="btn btn-primary btn-sm" data-ao-prog-ok>Programmer</button><p class="app-note" data-ao-prog-note></p></div>'
        . '<p class="ol-etat" data-ao-etat2 role="status" aria-live="polite"></p>'
        . '<p><button type="button" class="link-btn" data-ao-retour>Changer ma photo ou mes mots</button></p></div>';
    $ecran3 = '<div class="ao-ecran ao-fin" data-ao-ecran="3" hidden><span class="ao-fin-monstre" aria-hidden="true">' . aled08e_monster('etoile') . '</span>'
        . '<h3 data-ao-fin-titre tabindex="-1">C’est publié !</h3><p data-ao-fin-ou></p><ul class="ao-liens" data-ao-fin-liens></ul>'
        . '<div class="ao-suite"><strong>La suite</strong><p>Besoin d’une idée pour la prochaine fois ? Pépite vous propose trois idées pour la semaine, avec le texte déjà écrit.</p></div>'
        . '<div class="ol-boutons"><button type="button" class="btn btn-primary" data-ao-nouvelle>' . aled08e_icon('plus') . '<span>Une nouvelle publication</span></button>'
        . '<button type="button" class="btn btn-light" data-ao-revoir>' . aled08e_icon('arrow-right') . '<span>Revoir ma publication</span></button>'
        . ($idees ? '<button type="button" class="btn btn-light" data-ao-aller="idees">' . aled08e_icon('lightbulb') . '<span>Les idées de la semaine</span></button>' : '') . '</div></div>';
    $panIdees = $idees ? '<div class="ao-panneau" data-ao-panneau="idees" hidden><p class="ao-titre">' . $monstre . '<span>Les idées de la semaine</span></p><p class="app-note">' . esc_html($idees['desc'] ?? '') . '</p>'
        . aled08e_ao_form('publier', 'idees', $idees, $uid, true) . '<p><button type="button" class="link-btn" data-ao-aller="publier">Revenir à ma publication</button></p></div>' : '';
    $site_url = esc_url_raw(aled08e_meta($uid, 'site'));
    return aled08e_kit_styles() . '<div class="ao-panneau" data-ao-panneau="publier" data-ao-publier data-directs="' . esc_attr(wp_json_encode(array_keys($directs))) . '" data-kit-defs="' . esc_attr(wp_json_encode(aled08e_kit_defs())) . '" data-site="' . esc_attr($site_url) . '">' . $ecran1 . $ecran2 . $ecran3 . '</div>' . $panIdees;
}

/* ---------- Mes avis Google ---------- */
function aled08e_ao_avis_html($uid, $o) {
    $br = aled08e_ao_briques('avis');
    $avis = aled08e_meta($uid, 'avis');
    $site = aled08e_meta($uid, 'site');
    $u = get_userdata($uid);
    $panneaux = [];
    if (isset($br['avis'])) $panneaux['avis'] = 'Répondre à un avis';
    if (isset($br['lienavis']) || isset($br['qr'])) $panneaux['demander'] = 'Demander des avis';
    if (isset($br['repondre'])) $panneaux['repondre'] = 'Répondre à un client';
    $h = aled08e_ao_nav($panneaux);
    $premier = array_key_first($panneaux);
    if (isset($panneaux['avis'])) {
        $h .= aled08e_ao_panneau('avis', '<p class="app-note">Copiez l’avis depuis Google et collez-le ici : Cerise prépare une réponse polie, dans votre ton. Elle ne lit pas encore vos avis Google toute seule.</p>' . aled08e_ao_form('avis', 'avis', $br['avis'], $uid, false), $premier === 'avis');
    }
    if (isset($panneaux['demander'])) {
        $msg = 'Merci pour votre confiance ! Si vous avez un instant, votre avis nous aide beaucoup : ';
        $c = '<p class="app-note">Envoyez ce lien à vos clients après une vente ou une prestation : il ouvre directement la page pour laisser un avis. Sans rien offrir en échange : c’est la règle de Google.</p>';
        $form = '<form class="ao-lien-form" data-ao-avis-lien><div class="field"><label for="ao-avis-lien">Le lien d’avis de votre fiche Google</label><input id="ao-avis-lien" type="url" inputmode="url" name="lien" value="' . esc_attr($avis) . '" placeholder="https://g.page/r/…/review" required aria-describedby="ao-avis-lien-aide"><small class="ol-aide" id="ao-avis-lien-aide">Dans Google, ouvrez votre fiche (connecté avec le compte de votre commerce), touchez « Demander des avis », puis « Copier le lien ».</small></div><button class="btn btn-light btn-sm" type="submit">Enregistrer mon lien</button><p class="ol-etat" data-ao-etat role="status" aria-live="polite"></p></form>';
        if ($avis !== '') {
            $c .= '<div class="ao-avis" data-ao-avis="' . esc_attr($avis) . '"><div class="field"><label for="ao-avis-msg">Le message à envoyer</label><textarea id="ao-avis-msg" rows="4" data-ao-avis-msg>' . esc_textarea($msg . $avis) . '</textarea></div>'
                . '<div class="ol-bloc-actions"><button type="button" class="btn btn-primary btn-sm" data-ao-avis-copier>Copier le message</button><a class="btn btn-light btn-sm" data-ao-avis-sms href="#">Par SMS</a><a class="btn btn-light btn-sm" data-ao-avis-wa href="#" target="_blank" rel="noopener">Par WhatsApp</a><a class="btn btn-light btn-sm" data-ao-avis-mail href="#">Par e-mail</a><span class="ol-bloc-msg" role="status"></span></div></div>'
                . '<div class="ao-qr"><div class="ao-qr-code" data-ao-qr="' . esc_attr($avis) . '" data-ao-qr-nom="' . esc_attr($u ? $u->display_name : '') . '" data-ao-qr-texte="1"></div><div><p class="app-sub">' . aled08e_icon('qr-code') . 'Le QR code pour votre comptoir</p><p class="app-note">Vos clients le visent avec leur téléphone et arrivent sur la page d’avis. À imprimer et poser près de la caisse, sur vos cartes ou vos factures.</p><button type="button" class="btn btn-light btn-sm" data-ao-qr-dl>' . aled08e_icon('download') . '<span>Télécharger pour imprimer</span></button></div></div>'
                . '<details class="ao-plus"><summary class="link-btn">Changer mon lien d’avis</summary>' . $form . '</details>';
        } else {
            $c .= $form;
        }
        if ($site !== '') $c .= '<details class="ao-plus"><summary class="link-btn">Un QR code vers mon site</summary><div class="ao-qr"><div class="ao-qr-code" data-ao-qr="' . esc_attr($site) . '" data-ao-qr-nom=""></div><div><button type="button" class="btn btn-light btn-sm" data-ao-qr-dl>' . aled08e_icon('download') . '<span>Télécharger</span></button></div></div></details>';
        $h .= aled08e_ao_panneau('demander', $c, $premier === 'demander');
    }
    if (isset($panneaux['repondre'])) $h .= aled08e_ao_panneau('repondre', '<p class="app-note">' . esc_html($br['repondre']['desc'] ?? '') . '</p>' . aled08e_ao_form('avis', 'repondre', $br['repondre'], $uid, false), $premier === 'repondre');
    return $h;
}

/* ---------- Fiche produit ---------- */
function aled08e_ao_fiche_html($uid, $o) {
    $br = aled08e_ao_briques('fiche');
    $noms = ['produit' => 'La fiche', 'formats' => 'Recadrer et alléger', 'conseilphoto' => 'Conseils photo', 'phototexte' => 'Recopier un texte'];
    $panneaux = [];
    foreach ($noms as $bid => $nom) if (isset($br[$bid])) $panneaux[$bid] = $nom;
    $h = aled08e_ao_photo_html('fiche', 'La photo du produit', 'Prendre ou choisir une photo') . aled08e_ao_nav($panneaux);
    $premier = array_key_first($panneaux);
    foreach ($panneaux as $bid => $nom) {
        if ($bid === 'formats') {
            $c = '<p class="app-note">La photo d’en haut, au bon format pour chaque usage, et légère pour votre site. Tout se fait sur votre appareil : rien n’est envoyé.</p><p class="ol-etat" data-formats-info role="status" aria-live="polite"></p><div class="ol-formats-liste" data-formats-liste></div>';
            $h .= aled08e_ao_panneau('formats', '<div data-ao-formats>' . $c . '</div>', $premier === 'formats');
            continue;
        }
        $c = '<p class="app-note">' . esc_html($br[$bid]['desc'] ?? '') . '</p>' . aled08e_ao_form('fiche', $bid, $br[$bid], $uid, true);
        if ($bid === 'produit') {
            $c = str_replace(' data-ao-res', ' data-ao-res' . (aled08e_ao_boutique_ok($uid) ? ' data-ao-boutique="1"' : ''), $c);
        }
        $h .= aled08e_ao_panneau($bid, $c, $premier === $bid);
    }
    return $h;
}

/* ---------- Le script et les styles (une fois par page) ---------- */
function aled08e_ao_scripts() {
    if (!function_exists('wp_enqueue_script')) return;
    $f = defined('ALED08E_FILE') ? ALED08E_FILE : dirname(__DIR__) . '/aled08-espace.php';
    $dir = dirname($f);
    $pied = ['in_footer' => true, 'strategy' => 'defer'];
    if (file_exists($dir . '/qrcode.js')) wp_enqueue_script('aled08-qrcode', plugins_url('qrcode.js', $f), [], defined('ALED08E_VERSION') ? ALED08E_VERSION : null, $pied);
    // le kit de publication : les formats et la vidéo (kit-video.js), les boutons par réseau (kit-publication.js)
    wp_enqueue_script('aled08-kit-video', plugins_url('kit-video.js', $f), [], (string) @filemtime($dir . '/kit-video.js'), $pied);
    wp_enqueue_script('aled08-kit', plugins_url('kit-publication.js', $f), ['aled08-kit-video'], (string) @filemtime($dir . '/kit-publication.js'), $pied);
    wp_enqueue_script('aled08-outils', plugins_url('outils.js', $f), ['aled08-kit'], (string) @filemtime($dir . '/outils.js'), $pied);
    // outils.js a pu être déclaré plus tôt (aled08-espace.php) : il passe après le kit
    $ws = wp_scripts();
    if (isset($ws->registered['aled08-outils']) && !in_array('aled08-kit', $ws->registered['aled08-outils']->deps, true)) $ws->registered['aled08-outils']->deps[] = 'aled08-kit';
}
function aled08e_ao_styles() {
    static $fait = false;
    if ($fait) return '';
    $fait = true;
    return '<style id="aled08e-ao-styles">'
        . '.ao{margin:0 0 22px;padding:18px;border-radius:24px;background:var(--card);box-shadow:0 0 0 3px var(--c) inset;min-width:0;scroll-margin-top:calc(var(--header-h,72px) + 12px)}'
        . '.ao *{min-width:0}.ao [hidden]{display:none!important}'
        . '.ao-tete{display:flex;align-items:center;gap:14px;margin-bottom:10px}.ao-tete h3{margin:0;font-size:1.25rem;color:var(--ink)}'
        . '.ao-monstre{flex:none;width:64px;height:64px;display:grid;place-items:center;border-radius:20px;background:var(--c)}.ao-monstre svg{width:54px;height:54px}'
        . '.ao-chef{display:inline-block;margin:0 0 2px;padding:2px 10px;border-radius:999px;background:var(--c);color:var(--c-dd);font-weight:900;font-size:.82rem}'
        . '.ao-court{margin:2px 0 0;color:var(--text);font-weight:600;line-height:1.45}'
        . '.ao-usage{display:flex;align-items:center;gap:10px;margin:0 0 14px}.ao-usage small{color:var(--muted);font-weight:800}'
        . '.ao-jauge{flex:0 1 160px;height:8px;border-radius:999px;background:var(--soft);overflow:hidden}.ao-jauge span{display:block;height:100%;background:var(--c-d,var(--mint-d));border-radius:inherit}'
        . '.ao-nav{margin:4px 0 14px}.ao-panneau{display:grid;gap:12px}.ao-panneau>.app-note,.ao-ecran>.app-note{margin:0}'
        . '.ao-ecran{display:grid;gap:14px}'
        . '.ao-photo{display:grid;gap:8px}.ao-photo .app-sub{margin:0}'
        . '.ao-photo-zone,.ao .req-photo{position:relative}.ao-photo-zone{display:grid;place-items:center;min-height:150px;border-radius:22px;background:var(--c);cursor:pointer;overflow:hidden;box-shadow:0 0 0 2px var(--line) inset}'
        . '.ao-photo-zone:focus-within{outline:3px solid var(--lilac-d);outline-offset:2px}'
        . '.ao-photo-zone img{display:block;width:100%;max-height:340px;object-fit:contain;background:var(--soft)}'
        . '.ao-photo-vide{display:grid;justify-items:center;gap:8px;padding:18px;text-align:center;color:var(--c-dd);font-weight:800}.ao-photo-vide .ico{width:34px;height:34px}'
        . '.ao-photo .link-btn{justify-self:start}'
        . '.ao-grand{min-width:min(100%,280px);justify-content:center}'
        . '.ao-plus>summary{cursor:pointer;list-style:none;display:inline-flex;font-weight:800;color:var(--muted)}.ao-plus>summary::-webkit-details-marker{display:none}.ao-plus[open]>summary{margin-bottom:10px}'
        . '.ao-aussi{margin:0}'
        . '.ao-titre{display:flex;align-items:center;gap:10px;margin:0;font-weight:900;font-size:1.1rem;color:var(--ink)}'
        . '.ao-mini{flex:none;width:44px;height:44px}.ao-mini svg{width:100%;height:100%}'
        . '.ao-cartes{display:grid;gap:12px}'
        . '.ao-carte{display:grid;gap:8px;padding:14px;border-radius:18px;background:var(--soft);box-shadow:0 0 0 2px var(--line) inset}'
        . '.ao-carte.is-off{opacity:.6}.ao-carte.is-fait{box-shadow:0 0 0 2px var(--mint-d) inset}'
        . '.ao-carte-tete{display:flex;align-items:center;gap:10px;cursor:pointer}.ao-carte-tete strong{flex:1;color:var(--ink);font-weight:900}'
        . '.ao-carte-tete input{width:22px;height:22px;accent-color:var(--mint-d);flex:none}.ao-carte-tete small{color:var(--muted);font-weight:700}.ao-carte-tete small.is-trop{color:var(--peach-dd);font-weight:900}'
        . '.ao-carte textarea{width:100%;font:600 .98rem/1.5 var(--font);color:var(--ink);background:var(--card);border:0;box-shadow:0 0 0 2px var(--line) inset;border-radius:14px;padding:12px 14px;resize:vertical}'
        . '.ao-mode{font-size:.85rem;font-weight:800;color:var(--muted)}.ao-mode.is-direct{color:var(--mint-dd)}'
        . '.ao-prog{display:grid;gap:10px;padding:14px;border-radius:18px;background:var(--soft)}.ao-prog .app-note{margin:0}.ao-prog .btn{justify-self:start}'
        . '.ao-progs{padding:14px;border-radius:18px;background:var(--soft)}.ao-progs .app-sub{display:flex;align-items:center;gap:8px;margin:0 0 6px}.ao-progs ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}'
        . '.ao-progs li{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 12px;font-weight:700}.ao-progs small{display:block;color:var(--muted);overflow-wrap:anywhere}'
        . '.ao-reseaux{margin:0}.ao-reseaux>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;font-weight:900;color:var(--ink)}.ao-reseaux>summary::-webkit-details-marker{display:none}.ao-reseaux[open]>summary{margin-bottom:10px}'
        . '.ao-reseaux .rs-ligne .btn{white-space:normal;text-align:left}.ao-autres{margin-top:12px}.ao-autres form{margin-top:12px}'
        . '.ao-fin{justify-items:center;text-align:center}.ao-fin-monstre{width:120px;height:120px}.ao-fin-monstre svg{width:100%;height:100%}'
        . '.ao-fin h3{margin:0;font-size:1.6rem;color:var(--ink)}.ao-fin h3:focus{outline:none}.ao-fin p{margin:0}'
        . '.ao-liens{list-style:none;margin:0;padding:0;display:grid;gap:4px}.ao-liens a{font-weight:800;color:var(--ink)}'
        . '.ao-suite{width:100%;max-width:460px;padding:16px;border-radius:20px;background:var(--mint);color:var(--ink);text-align:left}.ao-suite p{margin:4px 0 0;color:var(--text);font-weight:600}'
        . '.ao-fin .ol-boutons{justify-content:center}'
        . '.ao-fichiers{list-style:none;margin:0;padding:0;display:grid;gap:4px;font-weight:700;color:var(--text)}.ao-fichiers li{overflow-wrap:anywhere}'
        . '.ao-table{overflow-x:auto;border-radius:14px;box-shadow:0 0 0 2px var(--line) inset;background:var(--card)}'
        . '.ao-table table{border-collapse:collapse;width:100%;min-width:560px;font-size:.92rem}.ao-table th,.ao-table td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);color:var(--ink)}'
        . '.ao-table th{background:var(--soft);font-weight:900}.ao-table th,.ao-table td{min-width:110px}.ao-table td{font-weight:600}'
        . '.ao-avis{display:grid;gap:10px}.ao-avis .field textarea{min-height:0}'
        . '.ao-qr{display:flex;flex-wrap:wrap;align-items:center;gap:16px}.ao-qr-code{width:160px;flex:none;border-radius:14px;overflow:hidden;background:#fff}.ao-qr-code svg{display:block;width:100%;height:auto}'
        . '.ao-qr>div:last-child{flex:1 1 200px;display:grid;gap:8px;justify-items:start}.ao-qr .app-sub{display:flex;align-items:center;gap:8px;margin:0}.ao-qr .app-note{margin:0}'
        . '.ao-lien-form{display:grid;gap:10px}.ao-lien-form .btn{justify-self:start}.ao-reglages{display:grid;gap:12px}'
        . '.ao-boutique{display:grid;gap:10px;padding:14px;border-radius:18px;background:var(--mint)}.ao-boutique .app-sub{margin:0}.ao-boutique .btn{justify-self:start}.ao-boutique label.ao-case{display:flex;gap:8px;align-items:center;font-weight:700}'
        . '@media (max-width:520px){.ao{padding:14px;border-radius:20px}.ao-monstre{width:52px;height:52px}.ao-monstre svg{width:44px;height:44px}.ao .ol-boutons .btn,.ao-grand{width:100%;justify-content:center;white-space:normal}.ao-qr-code{width:140px}}'
        . '</style>';
}
