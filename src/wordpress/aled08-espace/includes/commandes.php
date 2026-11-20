<?php
/**
 * Les Minis Monstres Espace client : les commandes passées sur /commander/.
 *  - type de contenu privé « aled08_commande » (référence ALED-AAAA-NNNN, métas _aled08_*)
 *  - montants recalculés côté serveur depuis data.json (le navigateur ne fait jamais foi)
 *  - traitement du formulaire POST (anti-robot, validation stricte, compte client, e-mails, Stripe ou attente)
 *  - changements de statut et e-mails qui vont avec, rappel quotidien des noms de domaine à réserver
 */
defined('ABSPATH') || exit;

/* Statuts d'une commande et du nom de domaine */
function aled08e_cmd_statuts() {
    return [
        'attente_paiement' => ['En attente de paiement', 'st-new'],
        'payee' => ['Payée', 'st-doing'],
        'domaine_commande' => ['Nom de domaine en cours d’attribution', 'st-doing'],
        'domaine_attribue' => ['Nom de domaine attribué', 'st-doing'],
        'hebergement' => ['Hébergement en préparation', 'st-doing'],
        'ssl' => ['Certificat SSL en cours', 'st-doing'],
        'pret' => ['Prêt : création du site', 'st-doing'],
        'en_creation' => ['En création', 'st-doing'],
        'en_ligne' => ['En ligne', 'st-done'],
        'annulee' => ['Annulée', 'esp-st-off'],
    ];
}
/* Statuts d'une commande payée et vivante (tout sauf attente de paiement et annulée) */
function aled08e_cmd_statuts_payes($avec_en_ligne = true) {
    $l = ['payee', 'domaine_commande', 'domaine_attribue', 'hebergement', 'ssl', 'pret', 'en_creation'];
    if ($avec_en_ligne) $l[] = 'en_ligne';
    return $l;
}
/* Statuts « en cours de mise en ligne ou de création » (après paiement, avant la mise en ligne) */
function aled08e_cmd_statuts_en_cours() { return aled08e_cmd_statuts_payes(false); }
function aled08e_cmd_domaine_statuts() {
    return ['a_reserver' => 'À réserver', 'reserve' => 'Réservé', 'en_ligne' => 'En ligne', 'client' => 'Au client (il l’a déjà)'];
}

/* =========================================================================
 *  Type de contenu « Commande » (privé, pas de création à la main)
 * ========================================================================= */
add_action('init', function () {
    register_post_type(ALED08E_CPT_CMD, [
        'labels' => [
            'name' => 'Commandes', 'singular_name' => 'Commande', 'menu_name' => 'Commandes', 'all_items' => 'Commandes',
            'edit_item' => 'Commande', 'view_item' => 'Voir la commande', 'search_items' => 'Chercher une commande',
            'not_found' => 'Aucune commande pour le moment. Les commandes passées sur la page /commander/ arrivent ici.', 'not_found_in_trash' => 'Aucune commande dans la corbeille.',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => 'aled08',
        'show_in_rest' => false,
        'supports' => ['title'],
        'capability_type' => 'post',
        'capabilities' => aled08e_cpt_caps(),
        'map_meta_cap' => true,
    ]);
}, 9);

/* Les commandes et les demandes (coordonnées, identifiants Stripe) ne se voient et ne se modifient qu'avec manage_options :
 * un éditeur ou un auteur WordPress n'y a pas accès. Rien n'est créé à la main. */
function aled08e_cpt_caps() {
    $caps = ['create_posts' => 'do_not_allow'];
    foreach (['edit_posts', 'edit_others_posts', 'edit_published_posts', 'edit_private_posts', 'publish_posts', 'read_private_posts', 'delete_posts', 'delete_others_posts', 'delete_published_posts', 'delete_private_posts'] as $cap) {
        $caps[$cap] = 'manage_options';
    }
    return $caps;
}

/* « un mois », « 2 mois » */
function aled08e_mois_txt($n) {
    $n = (int) $n;
    return $n === 1 ? 'un mois' : $n . ' mois';
}

/* Référence ALED-AAAA-NNNN : compteur dans une option, remis à zéro chaque année.
 * Appelée une fois la commande créée, et revérifiée : deux commandes au même instant ne partagent pas une référence. */
function aled08e_cmd_reference() {
    $annee = (int) wp_date('Y');
    $essais = 0;
    do {
        $c = get_option('aled08_commande_compteur', []);
        if (!is_array($c) || (int) ($c['annee'] ?? 0) !== $annee) $c = ['annee' => $annee, 'n' => 0];
        $c['n'] = (int) $c['n'] + 1;
        update_option('aled08_commande_compteur', $c, false);
        $ref = sprintf('ALED-%d-%04d', $annee, $c['n']);
    } while (aled08e_cmd_by_ref($ref) && ++$essais < 20);
    return $ref;
}

/* =========================================================================
 *  Montants (le serveur fait foi)
 *  $cfg : type, forfait, periode (mois|annee), lissage (0, ou nombre de mensualités : 6 ou 12), options (tableau d'ids)
 * ========================================================================= */
function aled08e_cmd_forfait_existe($id) {
    if (aled08e_est_seule($id)) return true;
    foreach (aled08e_data()['forfaits'] as $f) if ($f['id'] === $id) return true;
    return false;
}
/* Paiement du site en plusieurs fois : 6 ou 12 (« oui » des anciens liens = 12), sinon 0 */
function aled08e_cmd_lissage_n($v) {
    $n = $v === 'oui' ? 12 : (int) $v;
    $ok = (array) (aled08e_data()['lissageDurees'] ?? [6, 12]);
    return in_array($n, array_map('intval', $ok), true) ? $n : 0;
}
/* Pages en plus : au-delà des pages comprises, un prix par page, payé une fois (borné à pagesPlusMax) */
function aled08e_cmd_pages_plus($v) {
    $max = (int) (aled08e_data()['creation']['pagesPlusMax'] ?? 40);
    return max(0, min($max, (int) $v));
}
function aled08e_cmd_page_prix() { return (float) (aled08e_data()['creation']['pagePlus'] ?? 10); }
function aled08e_cmd_pages_plus_txt($n) { $n = (int) $n; return $n . ($n > 1 ? ' pages en plus' : ' page en plus'); }
/* Codes promo (l'ancienne « offre événement », retirée du site le 17 novembre 2026) : les codes valables se règlent dans
 * les réglages de l'extension, la remise en % sur la création. Aucun code par défaut. */
function aled08e_codes_evenement() {
    $v = get_option('aled08_codes_evenement', '');
    return array_values(array_filter(array_map('aled08e_clean_code', preg_split('/[\s,;]+/', (string) $v))));
}
function aled08e_code_evenement_ok($code) { $c = aled08e_clean_code($code); return $c !== '' && in_array($c, aled08e_codes_evenement(), true); }
function aled08e_remise_evenement() { return max(0, min(90, (int) (aled08e_data()['evenement']['remise'] ?? 20))); }
/* Vérification d'un code depuis le configurateur et la page Commander (20 essais par heure et par adresse IP) */
function aled08e_code_evenement_ajax() {
    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0';
    $k = 'aled08_code_ev_' . md5($ip);
    $n = (int) get_transient($k);
    if ($n >= 20) wp_send_json_error(['message' => 'Trop d’essais. Réessayez dans une heure.'], 429);
    set_transient($k, $n + 1, HOUR_IN_SECONDS);
    $code = wp_unslash($_GET['code'] ?? '');
    // une seule case pour le code promo et le code de parrainage : on dit seulement de quel genre il est (jamais à qui il appartient)
    if (aled08e_code_evenement_ok($code)) wp_send_json_success(['type' => 'promo', 'remise' => aled08e_remise_evenement()]);
    // le parrainage est retiré (19 novembre 2026) : un ancien code de parrainage n'est plus reconnu
    if (false && aled08e_user_by_code(aled08e_clean_code($code))) wp_send_json_success(['type' => 'parrain', 'mois' => (int) (aled08e_data()['parrainageMois'] ?? 1)]);
    wp_send_json_error(['message' => 'Code inconnu.']);
}
add_action('wp_ajax_aled08e_code_evenement', 'aled08e_code_evenement_ajax');
add_action('wp_ajax_nopriv_aled08e_code_evenement', 'aled08e_code_evenement_ajax');

function aled08e_cmd_montants($cfg) {
    $D = aled08e_data();
    $type = aled08e_type($cfg['type'] ?? '');
    $f = aled08e_forfait($cfg['forfait'] ?? '');
    $annee = ($cfg['periode'] ?? 'mois') === 'annee';
    $mult = $annee ? max(1, 12 - (int) $D['moisOfferts']) : 1; // à l'année : 10 mois payés
    $creation = (float) ($type ? $type['price'] : 0);
    $acompte = round($creation * (int) $D['acompte'] / 100, 2);
    $solde = round($creation - $acompte, 2);
    $mensuelForfait = (float) $f['month'] * $mult;
    // le nom de domaine fourni par nous : + 2 € par mois sur le forfait (pas si le client a déjà le sien, ni en Autonomie)
    $domaineMensuel = ((float) $f['month'] > 0 && empty($cfg['domaine_mien']) && !aled08e_est_seule($cfg['forfait'] ?? '')) ? (float) ($D['domainePrix'] ?? 0) * $mult : 0.0;
    $mensuelForfait += $domaineMensuel;
    $mensuelOptions = 0.0;
    $ponctuel = 0.0;
    foreach ((array) ($cfg['options'] ?? []) as $oid) {
        $o = aled08e_option($oid);
        if (!$o) continue;
        $mensuelOptions += (float) $o['month'] * $mult;
        $ponctuel += (float) $o['once'];
    }
    $pagesPlus = aled08e_cmd_pages_plus($cfg['pages_plus'] ?? 0);
    $ponctuel += $pagesPlus * aled08e_cmd_page_prix();
    // code événement : la remise porte sur la création (le site et ce qui se paie une fois), pas sur la formule
    $remise = max(0, min(90, (int) ($cfg['remise'] ?? 0)));
    if ($remise) {
        $creation = round($creation * (100 - $remise) / 100, 2);
        $ponctuel = round($ponctuel * (100 - $remise) / 100, 2);
        $acompte = round($creation * (int) $D['acompte'] / 100, 2);
        $solde = round($creation - $acompte, 2);
    }
    // À la commande : l'acompte (25 %) et les options ponctuelles. À la réception du site : le reste,
    // en une fois ou en 6 / 12 fois sans frais (engagement le temps de payer), et le forfait démarre.
    $nb = (int) ($cfg['lissage'] ?? 0);
    $lissage = $nb > 0;
    $mensualite = $lissage ? floor($solde / $nb * 100) / 100 : 0.0; // arrondi au centime inférieur : jamais plus que le reste dû
    $totalJour = $acompte + $ponctuel;
    return [
        'creation' => $creation,
        'acompte' => $acompte,
        'solde' => $solde,
        'mensuel_forfait' => $mensuelForfait,
        'domaine_mensuel' => $domaineMensuel,
        'mensuel_options' => $mensuelOptions,
        'options_ponctuel' => $ponctuel,
        'pages_plus' => $pagesPlus,
        'lissage_mensualite' => $lissage ? $mensualite : 0.0,
        'lissage_total_echeances' => $lissage ? $nb : 0,
        'total_jour' => round($totalJour, 2),
        'remise' => $remise,
    ];
}

/* =========================================================================
 *  Lecture d'une commande
 * ========================================================================= */
function aled08e_cmd_get($id) {
    $p = get_post($id);
    if (!$p || $p->post_type !== ALED08E_CPT_CMD) return null;
    $g = function ($k, $def = '') use ($id) {
        $v = get_post_meta($id, '_aled08_' . $k, true);
        return ($v === '' || $v === false || $v === null) ? $def : $v;
    };
    $m = $g('montants', []);
    $m = (is_array($m) ? $m : []) + ['creation' => 0, 'acompte' => 0, 'solde' => 0, 'mensuel_forfait' => 0, 'mensuel_options' => 0, 'options_ponctuel' => 0, 'lissage_mensualite' => 0, 'lissage_total_echeances' => 0, 'total_jour' => 0];
    $out = [
        'id' => (int) $id, 'ref' => (string) $g('ref', '#' . $id), 'date' => $p->post_date, 'post' => $p,
        'type' => (string) $g('type'), 'forfait' => (string) $g('forfait'), 'periode' => (string) $g('periode', 'mois'),
        'lissage' => (int) $g('lissage', 0), 'options' => array_values((array) $g('options', [])), 'pages_plus' => (int) $g('pages_plus', 0),
        'domaine' => (string) $g('domaine'), 'domaine_mien' => (int) $g('domaine_mien', 0), 'domaine_statut' => (string) $g('domaine_statut', 'a_reserver'),
        'statut' => (string) $g('statut', 'attente_paiement'), 'montants' => $m,
        'message' => (string) $g('message'), 'parrain' => (string) $g('parrain'), 'user' => (int) $g('user', $p->post_author),
        'code_evenement' => (string) $g('code_evenement'), 'remise' => (int) $g('remise', 0),
        'stripe_session' => (string) $g('stripe_session'), 'stripe_customer' => (string) $g('stripe_customer'), 'stripe_subscription' => (string) $g('stripe_subscription'),
        'stripe_lissage_item' => (string) $g('stripe_lissage_item'), 'lissage_paye' => (int) $g('lissage_paye', 0), 'solde_paye' => (int) $g('solde_paye', 0), 'solde_session' => (string) $g('solde_session'),
        'paiement_en_cours' => (int) $g('paiement_en_cours', 0), 'reception_payee' => (int) $g('reception_payee', 0), 'solde_fois' => (int) $g('solde_fois', 0),
        'journal' => array_values((array) $g('journal', [])),
    ];
    foreach (['prenom', 'nom', 'entreprise', 'adresse', 'code_postal', 'ville', 'telephone', 'email'] as $k) $out[$k] = (string) $g($k);
    return $out;
}
function aled08e_cmd_liste($args = []) {
    $posts = get_posts(array_merge(['post_type' => ALED08E_CPT_CMD, 'post_status' => 'private', 'numberposts' => 200, 'orderby' => 'date', 'order' => 'DESC'], $args));
    $out = [];
    foreach ($posts as $p) { $c = aled08e_cmd_get($p->ID); if ($c) $out[] = $c; }
    return $out;
}
function aled08e_cmd_user_commandes($uid) {
    return $uid ? aled08e_cmd_liste(['author' => (int) $uid]) : [];
}
function aled08e_cmd_par_statut($statuts) {
    return aled08e_cmd_liste(['meta_query' => [['key' => '_aled08_statut', 'value' => (array) $statuts, 'compare' => 'IN']]]);
}
function aled08e_cmd_par_meta($k, $v) {
    $l = aled08e_cmd_liste(['numberposts' => 1, 'meta_key' => '_aled08_' . $k, 'meta_value' => $v]);
    return $l ? $l[0] : null;
}
function aled08e_cmd_by_ref($ref) { return aled08e_cmd_par_meta('ref', $ref); }
/* Commandes passées avec cette adresse e-mail depuis $depuis secondes */
function aled08e_cmd_recentes_email($email, $depuis) {
    $out = [];
    foreach (aled08e_cmd_liste(['numberposts' => 20, 'meta_key' => '_aled08_email', 'meta_value' => $email]) as $c) {
        if (strtotime(get_gmt_from_date($c['date']) . ' UTC') >= time() - $depuis) $out[] = $c;
    }
    return $out;
}
/* Même configuration (type, forfait, période, lissage, options, nom de domaine) ? */
function aled08e_cmd_meme_config($c, $cfg) {
    $a = [(int) ($c['pages_plus'] ?? 0), $c['type'], $c['forfait'], $c['periode'], (int) $c['lissage'], array_values((array) $c['options']), $c['domaine'], (int) $c['domaine_mien']];
    $b = [(int) ($cfg['pages_plus'] ?? 0), $cfg['type'], $cfg['forfait'], $cfg['periode'], (int) ($cfg['lissage'] ?? 0), array_values((array) $cfg['options']), $cfg['domaine'], !empty($cfg['domaine_mien']) ? 1 : 0];
    return $a === $b;
}

function aled08e_cmd_journal($id, $texte) {
    $j = get_post_meta($id, '_aled08_journal', true);
    $j = is_array($j) ? $j : [];
    $j[] = ['date' => current_time('mysql'), 'texte' => mb_substr((string) $texte, 0, 400)];
    update_post_meta($id, '_aled08_journal', array_slice($j, -100));
}
function aled08e_cmd_nom($c) { return trim($c['prenom'] . ' ' . $c['nom']) . ($c['entreprise'] ? ' (' . $c['entreprise'] . ')' : ''); }
function aled08e_cmd_admin_url($id) { return admin_url('post.php?post=' . (int) $id . '&action=edit'); }
function aled08e_cmd_delai_type($c) { $t = aled08e_type($c['type']); return $t ? $t['delai'] : ''; }

/* Récapitulatif en texte brut (e-mails) */
function aled08e_cmd_recap_txt($c) {
    $D = aled08e_data();
    $m = $c['montants'];
    $type = aled08e_type($c['type']);
    $f = aled08e_forfait($c['forfait']);
    $annee = $c['periode'] === 'annee';
    $per = $annee ? 'par an' : 'par mois';
    $opts = [];
    foreach ($c['options'] as $oid) {
        $o = aled08e_option($oid);
        if ($o) $opts[] = $o['name'] . ', ' . ($o['once'] ? aled08e_euro_txt($o['once']) . ' une fois' : aled08e_euro_txt($annee ? $o['month'] * max(1, 12 - (int) $D['moisOfferts']) : $o['month']) . ' ' . $per);
    }
    if (!empty($c['pages_plus'])) $opts[] = aled08e_cmd_pages_plus_txt($c['pages_plus']) . ', ' . aled08e_euro_txt($c['pages_plus'] * aled08e_cmd_page_prix()) . ' une fois';
    if (!$c['domaine']) $dom = 'à choisir ensemble';
    elseif ($c['domaine_mien']) $dom = $c['domaine'] . ' (le client l’a déjà)';
    else $dom = $c['domaine'] . ' (à réserver au nom du client)';
    $pay = 'acompte de ' . aled08e_euro_txt($m['acompte']) . ' à la commande, puis à la réception du site : '
        . ($c['lissage'] ? 'le reste en ' . (int) $m['lissage_total_echeances'] . ' fois sans frais, ' . aled08e_euro_txt($m['lissage_mensualite']) . ' par mois (engagement de ' . (int) $m['lissage_total_echeances'] . ' mois)' . (aled08e_est_seule($c['forfait']) ? '' : ', avec l’abonnement') : 'le reste en une fois, ' . aled08e_euro_txt($m['solde']) . (aled08e_est_seule($c['forfait']) ? '' : ', et l’abonnement démarre'));
    return 'Référence : ' . $c['ref'] . "\n"
        . 'Site : ' . ($type ? $type['label'] : $c['type']) . ', création ' . aled08e_euro_txt($m['creation']) . ($type ? ' (délai habituel : ' . $type['delai'] . ')' : '') . "\n"
        . 'Nom de domaine : ' . $dom . "\n"
        . (aled08e_est_seule($c['forfait']) ? "Formule : création seule, sans abonnement (le code du site est remis au client)\n" : 'Abonnement : ' . aled08e_euro_txt($m['mensuel_forfait']) . ' ' . $per . ($annee ? ' (' . (int) $D['moisOfferts'] . ' mois offerts)' : '') . "\n")
        . 'Options et extras : ' . ($opts ? implode(' ; ', $opts) : 'aucun') . "\n"
        . 'Paiement de la création : ' . $pay . "\n"
        . 'Montant du jour de la commande : ' . aled08e_euro_txt($m['total_jour']) . "\n";
}
function aled08e_cmd_titulaire_txt($c) {
    return aled08e_cmd_nom($c) . "\n" . $c['adresse'] . "\n" . $c['code_postal'] . ' ' . $c['ville'] . "\n" . $c['email'] . "\n" . $c['telephone'];
}

/* =========================================================================
 *  Nom de domaine : nettoyage, forme, vérification RDAP côté serveur (cache 10 min)
 * ========================================================================= */
function aled08e_cmd_nettoyer_domaine($v) {
    $v = strtolower(trim(remove_accents((string) $v)));
    $v = preg_replace('#^https?://#', '', $v);
    $v = preg_replace('#^www\.#', '', $v);
    $v = preg_replace('#[/?\#].*$#', '', $v);
    $v = preg_replace('/\s+/', '', $v);
    return substr($v, 0, 253);
}
function aled08e_cmd_domaine_valide($d) {
    return (bool) preg_match('/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/', $d);
}
/* Retour : libre | pris | inconnu (extension non vérifiable ou service injoignable : on ne bloque pas) */
function aled08e_rdap_statut($domaine) {
    $key = 'aled08_rdap_' . md5($domaine);
    $cache = get_transient($key);
    if ($cache) return $cache;
    $tld = substr(strrchr($domaine, '.'), 1);
    $bases = [
        'fr' => 'https://rdap.nic.fr/domain/',
        'com' => 'https://rdap.verisign.com/com/v1/domain/',
        'net' => 'https://rdap.verisign.com/net/v1/domain/',
        'org' => 'https://rdap.publicinterestregistry.org/rdap/domain/',
    ];
    if (!isset($bases[$tld])) return 'inconnu';
    $r = wp_remote_get($bases[$tld] . rawurlencode($domaine), ['timeout' => 8, 'headers' => ['Accept' => 'application/rdap+json']]);
    if (is_wp_error($r)) return 'inconnu';
    $code = (int) wp_remote_retrieve_response_code($r);
    $res = $code === 404 ? 'libre' : ($code >= 200 && $code < 300 ? 'pris' : 'inconnu');
    if ($res !== 'inconnu') set_transient($key, $res, 10 * MINUTE_IN_SECONDS);
    return $res;
}

/* Adresse de retour vers /commander/ avec la configuration conservée */
function aled08e_cmd_url_commander($cfg, $extra = []) {
    $q = $extra + [
        'type' => $cfg['type'] ?? '', 'forfait' => $cfg['forfait'] ?? '', 'periode' => $cfg['periode'] ?? '',
        'lissage' => !empty($cfg['lissage']) ? (string) (int) $cfg['lissage'] : '', 'domaine' => $cfg['domaine'] ?? '',
        'domaine_statut' => !empty($cfg['domaine_mien']) ? 'mien' : '', 'options' => implode(',', (array) ($cfg['options'] ?? [])), 'pages_plus' => !empty($cfg['pages_plus']) ? (string) (int) $cfg['pages_plus'] : '', 'parrain' => $cfg['parrain'] ?? '', 'code' => $cfg['code_evenement'] ?? '',
    ];
    $q = array_filter($q, function ($v) { return (string) $v !== ''; });
    return home_url('/commander/') . ($q ? '?' . http_build_query($q, '', '&', PHP_QUERY_RFC3986) : '');
}
function aled08e_cmd_redirect_erreur($code, $cfg) {
    wp_safe_redirect(aled08e_cmd_url_commander($cfg, ['erreur' => $code]), 303);
    exit;
}
/* Après l'enregistrement : page de paiement Stripe si configuré, sinon confirmation « en attente » (lien envoyé à la main).
 * En cas d'erreur Stripe, retour sur /commander/?erreur=paiement : la commande reste en attente et un nouvel envoi la reprend. */
function aled08e_cmd_vers_paiement($pid, $ref, $cfg) {
    if (aled08e_stripe_ready()) {
        $url = aled08e_stripe_checkout($pid);
        if (is_wp_error($url)) {
            aled08e_cmd_journal($pid, 'Paiement Stripe impossible : ' . $url->get_error_message());
            aled08e_cmd_redirect_erreur('paiement', $cfg);
        }
        wp_redirect($url, 303); // phpcs:ignore WordPress.Security.SafeRedirect -- page de paiement Stripe
        exit;
    }
    wp_safe_redirect(home_url('/commande-confirmee/?ref=' . rawurlencode($ref) . '&attente=1'), 303);
    exit;
}

/* =========================================================================
 *  Traitement du formulaire de /commander/ (POST aled08_order=1)
 * ========================================================================= */
add_action('template_redirect', 'aled08e_cmd_traiter_post', 1);
function aled08e_cmd_traiter_post() {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08_order'])) return;
    $P = wp_unslash($_POST);
    $get = function ($k, $max = 200) use ($P) {
        $v = $P[$k] ?? '';
        if (is_array($v)) return '';
        return mb_substr(trim(preg_replace('/[\r\n\t]+/', ' ', wp_strip_all_tags((string) $v))), 0, $max);
    };
    $optionsIn = $P['options'] ?? [];
    if (!is_array($optionsIn)) $optionsIn = explode(',', (string) $optionsIn);
    $options = [];
    foreach ($optionsIn as $o) { $o = sanitize_key($o); $oo = $o !== '' ? aled08e_option($o) : null; if ($oo && empty($oo['retire']) && ($oo['quand'] ?? '') !== 'espace') $options[] = $o; } // pas d'option retirée, ni le Pack SEO (il se prend dans l'espace client)
    // options réservées à certains types de site (stock, comptes clients : boutique seulement)
    $typeIn = sanitize_key($get('type', 30));
    $options = array_values(array_filter($options, function ($oid) use ($typeIn) { $o = aled08e_option($oid); return $o && (empty($o['types']) || in_array($typeIn, (array) $o['types'], true)); }));
    $cfg = [
        'type' => $typeIn,
        'forfait' => sanitize_key($get('forfait', 30)),
        'periode' => 'mois', // le paiement à l'année n'est plus proposé (19 novembre 2026)
        'lissage' => aled08e_cmd_lissage_n($get('lissage', 5)),
        'options' => array_values(array_unique($options)),
        'pages_plus' => aled08e_cmd_pages_plus($get('pages_plus', 4)),
        'domaine' => aled08e_cmd_nettoyer_domaine($get('domaine', 253)),
        'domaine_mien' => $get('domaine_mien', 2) === '1',
        'parrain' => '', // parrainage retiré (19 novembre 2026)
        'code_evenement' => aled08e_clean_code($get('code_evenement', 30)),
    ];
    // code événement : vérifié ici, la remise est recalculée par le serveur
    $cfg['remise'] = ($cfg['code_evenement'] !== '' && aled08e_code_evenement_ok($cfg['code_evenement'])) ? aled08e_remise_evenement() : 0;
    if ($cfg['lissage']) $cfg['periode'] = 'mois'; // le site en plusieurs fois se paie avec un forfait au mois
    // « Je m'en occupe moi-même » (champ gestion = moi) : création seule, sans formule. Le client garde son nom de domaine
    // et son hébergement. Il peut payer le reste en une fois ou étalé (un abonnement Stripe qui ne porte que les mensualités).
    if (sanitize_key($get('gestion', 10)) === 'moi') $cfg['forfait'] = 'sans';
    if (aled08e_est_seule($cfg['forfait'])) { $cfg['domaine_mien'] = true; $cfg['domaine'] = ''; $cfg['periode'] = 'mois'; }
    $err = function ($code) use ($cfg) { aled08e_cmd_redirect_erreur($code, $cfg); };
    // la case « Code promo ou parrainage » : un code de parrainage tapé là devient le parrain de la commande
    if (false && $cfg['code_evenement'] !== '' && !$cfg['remise'] && aled08e_user_by_code($cfg['code_evenement'])) {
        if ($cfg['parrain'] === '') $cfg['parrain'] = $cfg['code_evenement'];
        $cfg['code_evenement'] = '';
    }
    if ($cfg['code_evenement'] !== '' && !$cfg['remise']) $err('code');

    // anti-robot : champ piège rempli ; horodatage absent, envoi en moins de 3 secondes, horodatage dans le futur ou vieux de plus de 24 heures
    // (le champ _t est rempli par le script de la page ; un robot qui poste le HTML brut ne passe pas)
    if ($get('site_web', 200) !== '') $err('robot');
    $t = (float) $get('_t', 20);
    $now = microtime(true) * 1000;
    if ($t <= 0 || $now - $t < 3000 || $t > $now + 60000 || $now - $t > DAY_IN_SECONDS * 1000) $err('robot');
    // limite par adresse IP : 5 commandes par heure (et 20 essais)
    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '0';
    $kCmd = 'aled08_cmd_ip_' . md5($ip);
    $kTry = 'aled08_try_ip_' . md5($ip);
    $nTry = (int) get_transient($kTry);
    set_transient($kTry, $nTry + 1, HOUR_IN_SECONDS);
    if ((int) get_transient($kCmd) >= 5 || $nTry >= 20) $err('robot');

    // configuration
    if (!aled08e_type($cfg['type']) || !aled08e_cmd_forfait_existe($cfg['forfait'])) $err('champs');

    // coordonnées
    $c = [
        'prenom' => $get('prenom', 60), 'nom' => $get('nom', 60), 'entreprise' => $get('entreprise', 120),
        'adresse' => $get('adresse', 200), 'code_postal' => preg_replace('/\s+/', '', $get('code_postal', 10)), 'ville' => $get('ville', 80),
        'telephone' => $get('telephone', 30), 'email' => sanitize_email($get('email', 150)),
    ];
    foreach (['prenom', 'nom', 'adresse', 'code_postal', 'ville', 'telephone'] as $k) if ($c[$k] === '') $err('champs');
    if (!is_email($c['email'])) $err('email');
    if (!preg_match('/^[0-9]{5}$/', $c['code_postal'])) $err('champs');
    if (!preg_match('/^\+?[0-9][0-9 .()-]{5,19}$/', $c['telephone'])) $err('champs');
    $message = mb_substr(sanitize_textarea_field((string) ($P['message'] ?? '')), 0, 3000);

    // nom de domaine : forme, puis disponibilité (seulement s'il faut le réserver)
    if ($cfg['domaine'] !== '' && !aled08e_cmd_domaine_valide($cfg['domaine'])) $err('domaine');
    if ($cfg['domaine'] !== '' && !$cfg['domaine_mien'] && aled08e_rdap_statut($cfg['domaine']) === 'pris') $err('domaine');

    // cases à cocher
    if ($get('cgv', 5) !== 'oui') $err('cgv');
    // quand commencer : « oui » (tout de suite, le client renonce à se rétracter une fois le site livré) ou « attendre » (après les 14 jours)
    $demarrage = sanitize_key($get('demarrage', 10));
    if (!in_array($demarrage, ['oui', 'attendre'], true)) $err('demarrage');
    if ($cfg['lissage'] && $get('engagement', 5) !== 'oui') $err('engagement');

    // montants recalculés ici, jamais repris du navigateur
    $m = aled08e_cmd_montants($cfg);
    if ($m['total_jour'] <= 0) $err('champs');

    // même adresse e-mail : pas plus de 3 commandes par heure ; et un nouvel envoi du même formulaire (après une erreur
    // Stripe, un retour arrière…) reprend la commande encore en attente au lieu d'en créer une deuxième
    $recentes = aled08e_cmd_recentes_email($c['email'], HOUR_IN_SECONDS);
    if (count($recentes) >= 3) $err('robot');
    foreach ($recentes as $r) {
        if ($r['statut'] === 'attente_paiement' && !$r['paiement_en_cours'] && aled08e_cmd_meme_config($r, $cfg)) {
            aled08e_cmd_journal($r['id'], 'Formulaire renvoyé depuis le site : reprise de cette commande (pas de nouvelle commande, pas de nouvel e-mail).');
            aled08e_cmd_vers_paiement($r['id'], $r['ref'], $cfg);
        }
    }

    // compte client : créé, ou rattaché s'il existe déjà pour cet e-mail
    $compte = aled08e_compte_pour_commande($c + $cfg);
    if (is_wp_error($compte)) $err('inconnu');
    $uid = $compte['id'];

    // la commande, puis sa référence (le compteur n'est consommé que si la commande existe)
    $type = aled08e_type($cfg['type']);
    $titre = trim($c['prenom'] . ' ' . $c['nom']) . ($c['entreprise'] ? ', ' . $c['entreprise'] : '') . ' (' . $type['label'] . ')';
    $pid = wp_insert_post([
        'post_type' => ALED08E_CPT_CMD, 'post_status' => 'private', 'post_author' => $uid, 'post_title' => $titre,
        'comment_status' => 'closed', 'ping_status' => 'closed',
    ], true);
    if (is_wp_error($pid)) $err('inconnu');
    $ref = aled08e_cmd_reference();
    update_post_meta($pid, '_aled08_ref', $ref);
    // la preuve du choix du client, avec sa date
    update_post_meta($pid, '_aled08_demarrage', $demarrage);
    update_post_meta($pid, '_aled08_demarrage_le', time());
    wp_update_post(['ID' => $pid, 'post_title' => $ref . ' : ' . $titre]);
    $metas = [
        'ref' => $ref, 'type' => $cfg['type'], 'forfait' => $cfg['forfait'], 'periode' => $cfg['periode'], 'lissage' => (int) $cfg['lissage'], 'options' => $cfg['options'], 'pages_plus' => (int) $cfg['pages_plus'],
        'domaine' => $cfg['domaine'], 'domaine_mien' => $cfg['domaine_mien'] ? 1 : 0, 'domaine_statut' => $cfg['domaine_mien'] ? 'client' : 'a_reserver',
        'statut' => 'attente_paiement', 'montants' => $m, 'message' => $message, 'parrain' => $cfg['parrain'], 'user' => $uid,
        'code_evenement' => $cfg['remise'] ? $cfg['code_evenement'] : '', 'remise' => (int) $cfg['remise'],
        'stripe_session' => '', 'stripe_customer' => '', 'stripe_subscription' => '', 'stripe_lissage_item' => '', 'lissage_paye' => 0, 'solde_paye' => 0, 'solde_session' => '',
    ];
    foreach ($c as $k => $v) $metas[$k] = $v;
    foreach ($metas as $k => $v) update_post_meta($pid, '_aled08_' . $k, $v);
    aled08e_cmd_journal($pid, 'Commande reçue depuis le site.');
    aled08e_cmd_journal($pid, $demarrage === 'oui'
        ? 'Choix du client : démarrer tout de suite. Il a demandé expressément le démarrage avant la fin des 14 jours et reconnu qu’il perd son droit de rétractation une fois le site entièrement livré.'
        : 'Choix du client : attendre 14 jours. La création ne commence pas avant le ' . wp_date('j F Y', time() + 14 * DAY_IN_SECONDS) . ' (fin du délai de rétractation).');
    aled08e_cmd_journal($pid, $compte['cree'] ? 'Compte client créé : ' . $compte['login'] . '.' : 'Commande rattachée au compte existant : ' . $compte['login'] . '.');
    set_transient($kCmd, (int) get_transient($kCmd) + 1, HOUR_IN_SECONDS);
    $cmd = aled08e_cmd_get($pid);

    // e-mails : propriétaire, client, puis l'accès à l'espace pour un nouveau compte
    $stripe = aled08e_stripe_ready();
    aled08e_cmd_mail_owner_nouvelle($cmd, $compte, $stripe);
    aled08e_cmd_mail_client_nouvelle($cmd, $compte, $stripe);
    if ($compte['cree']) aled08e_compte_envoyer_acces($uid, $ref);

    // paiement : Stripe si configuré, sinon « en attente » (lien envoyé à la main)
    aled08e_cmd_vers_paiement($pid, $ref, $cfg);
}

/* =========================================================================
 *  Changements de statut (admin ou Stripe) et leurs e-mails
 * ========================================================================= */
function aled08e_cmd_set_statut($id, $statut, $note = '') {
    $cmd = aled08e_cmd_get($id);
    if (!$cmd || !isset(aled08e_cmd_statuts()[$statut])) return false;
    $old = $cmd['statut'];
    if ($old === $statut) return true;
    update_post_meta($id, '_aled08_statut', $statut);
    aled08e_cmd_journal($id, 'Statut : ' . aled08e_cmd_statuts()[$statut][0] . ($note ? ' (' . $note . ')' : '') . '.');
    $cmd['statut'] = $statut;
    do_action('aled08e_statut_change', $id, $statut, $old);
    if ($statut === 'payee' && $old === 'attente_paiement') {
        aled08e_compte_metas_commande($cmd); // le compte reprend les choix de la commande, maintenant qu'elle est payée
        aled08e_cmd_mail_client_payee($cmd);
        aled08e_cmd_mail_owner_payee($cmd);
    }
    if ($statut === 'en_ligne') {
        if ($cmd['domaine'] && !$cmd['domaine_mien'] && $cmd['domaine_statut'] !== 'client') { update_post_meta($id, '_aled08_domaine_statut', 'en_ligne'); $cmd['domaine_statut'] = 'en_ligne'; }
        if ($cmd['user'] && $cmd['domaine'] && aled08e_meta($cmd['user'], 'site') === '') update_user_meta($cmd['user'], 'aled08_site', 'https://' . $cmd['domaine']);
        aled08e_cmd_mail_client_en_ligne($cmd);
        aled08e_cmd_parrainage_en_ligne($cmd);
    }
    return true;
}
function aled08e_cmd_set_domaine($id, $statut) {
    if (!isset(aled08e_cmd_domaine_statuts()[$statut])) return false;
    update_post_meta($id, '_aled08_domaine_statut', $statut);
    aled08e_cmd_journal($id, 'Nom de domaine : ' . aled08e_cmd_domaine_statuts()[$statut] . '.');
    return true;
}
/* Site du filleul en ligne : le parrain reçoit son mois offert (une seule fois par commande).
 * C'est ici, et seulement ici, que le filleul reçoit la méta aled08_parrain : le parrain ne compte un filleul
 * « en ligne » qu'une fois le site vraiment en ligne, pas dès le formulaire de commande. */
function aled08e_cmd_parrainage_en_ligne($cmd) {
    return; // parrainage retiré (19 novembre 2026)
    if (!$cmd['parrain'] || get_post_meta($cmd['id'], '_aled08_parrain_prevenu', true)) return;
    $p = aled08e_user_by_code($cmd['parrain']);
    if (!$p || $p->ID === $cmd['user']) return;
    update_post_meta($cmd['id'], '_aled08_parrain_prevenu', 1);
    $mois = (int) aled08e_data()['parrainageMois'];
    update_user_meta($p->ID, 'aled08_mois_offerts', (int) aled08e_meta($p->ID, 'mois_offerts') + $mois);
    if ($cmd['user']) {
        update_user_meta($cmd['user'], 'aled08_mois_offerts', (int) aled08e_meta($cmd['user'], 'mois_offerts') + $mois);
        if (aled08e_meta($cmd['user'], 'parrain') === '') update_user_meta($cmd['user'], 'aled08_parrain', aled08e_clean_code($cmd['parrain']));
    }
    $corps = 'Bonjour ' . aled08e_prenom($p) . ",\n\n"
        . 'Bonne nouvelle : ' . $cmd['prenom'] . ' a créé son site grâce à vous. Vous recevez ' . aled08e_mois_txt($mois) . " d’abonnement offert, merci !\n\n"
        . "Vos parrainages sont dans votre espace client :\n" . aled08e_url() . "#parrainage\n\nÀ bientôt,\nAlex et les Minis Monstres\n";
    wp_mail($p->user_email, 'Votre parrainage : un mois offert', $corps, aled08e_mail_headers());
    aled08e_cmd_journal($cmd['id'], 'Parrainage : ' . aled08e_mois_txt($mois) . ' offert au parrain ' . $p->display_name . ' et au client.');
}

/* ---------- e-mails ---------- */
function aled08e_cmd_mail_owner_nouvelle($c, $compte, $stripe) {
    $sujet = 'Nouvelle commande ' . $c['ref'] . ' : ' . aled08e_cmd_nom($c);
    $corps = "Nouvelle commande sur " . home_url('/commander/') . "\n\n"
        . aled08e_cmd_recap_txt($c) . "\n"
        . "Client :\n" . aled08e_cmd_titulaire_txt($c) . "\n\n"
        . (!empty($c['remise']) ? 'Code promo : ' . $c['code_evenement'] . ' (' . (int) $c['remise'] . " % de remise sur la création, déjà déduits)\n" : '')
        . ($c['parrain'] ? 'Code de parrainage : ' . $c['parrain'] . ' (' . (aled08e_user_by_code($c['parrain']) ? aled08e_user_by_code($c['parrain'])->display_name : 'code inconnu') . ")\n" : '')
        . ($c['message'] ? "Message du client :\n" . $c['message'] . "\n\n" : '')
        . (get_post_meta($c['id'], '_aled08_demarrage', true) === 'attendre'
            ? 'DÉMARRAGE : le client a choisi d’attendre 14 jours. Ne commencez pas la création avant le ' . wp_date('j F Y', time() + 14 * DAY_IN_SECONDS) . ".\n"
            : "Démarrage : tout de suite (le client renonce à se rétracter une fois le site entièrement livré).\n")
        . 'Compte client : ' . ($compte['cree'] ? 'créé (' . $compte['login'] . '), e-mail de mot de passe envoyé' : 'déjà existant (' . $compte['login'] . '), commande rattachée') . "\n"
        . 'Paiement : ' . ($stripe ? 'le client est envoyé sur la page de paiement Stripe. Vous recevrez un e-mail quand il sera confirmé.' : 'paiement en ligne non activé. Envoyez-lui un lien ou un RIB, puis marquez la commande « Payée » dans l’administration.') . "\n\n"
        . 'Fiche commande : ' . aled08e_cmd_admin_url($c['id']) . "\n";
    wp_mail(aled08e_to(), $sujet, $corps, aled08e_mail_headers(aled08e_cmd_nom($c) . ' <' . $c['email'] . '>'));
}
function aled08e_cmd_mail_client_nouvelle($c, $compte, $stripe) {
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\n"
        . "Merci pour votre commande ! Voici son récapitulatif.\n\n"
        . aled08e_cmd_recap_txt($c) . "\n"
        . "Ce qui se passe ensuite :\n"
        . ($stripe
            ? "1. Votre paiement est confirmé par e-mail dans les minutes qui suivent (un peu plus pour un prélèvement).\n"
            : "1. Je vous envoie le lien de paiement sous 24 heures.\n")
        . ($c['domaine'] && !$c['domaine_mien'] ? '2. Je réserve le nom de domaine ' . $c['domaine'] . " à votre nom.\n" : "2. Je prépare l’hébergement de votre site.\n")
        . "3. Je vous écris sous 24 heures pour commencer la création.\n"
        . "4. Vous suivez tout dans votre espace client : " . aled08e_url() . "\n"
        . ($compte['cree']
            ? "   Un autre e-mail arrive avec le lien pour choisir votre mot de passe.\n\n"
            : "   Vous avez déjà un compte : connectez-vous avec votre mot de passe habituel.\n\n")
        . "Une question ? Répondez à cet e-mail.\n\nÀ bientôt,\nAlex et les Minis Monstres\n";
    wp_mail($c['email'], 'Votre commande ' . $c['ref'] . ' est bien reçue', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
}
function aled08e_cmd_mail_client_payee($c) {
    $delai = aled08e_cmd_delai_type($c);
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\n"
        . "Votre acompte est bien reçu, merci !\n"
        . "Le reste se règle à la réception de votre site (en une fois, ou en 3 ou 4 fois avec Alma ou Klarna), et votre forfait démarre à ce moment-là.\n"
        . 'Référence de la commande : ' . $c['ref'] . "\n\n"
        . "Ce qui se passe maintenant :\n"
        . ($c['domaine'] && !$c['domaine_mien'] ? '1. Je réserve le nom de domaine ' . $c['domaine'] . " à votre nom.\n" : "1. Je prépare l’hébergement de votre site.\n")
        . "2. Vous remplissez votre questionnaire de création dans votre espace client (une dizaine de minutes) : couleurs, ambiance, photos, prix ou produits. C’est lui qui lance la création : " . aled08e_url() . "#commande\n"
        . '3. Je crée votre site' . ($delai ? ' (délai habituel : ' . $delai . ', à partir de vos réponses)' : '') . ", et vous suivez l’avancement dans votre espace client.\n\n"
        . "À bientôt,\nAlex et les Minis Monstres\n";
    wp_mail($c['email'], 'Votre acompte pour la commande ' . $c['ref'] . ' est reçu', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
}
function aled08e_cmd_mail_owner_payee($c) {
    $dom = $c['domaine'] && !$c['domaine_mien'];
    $sujet = 'Commande ' . $c['ref'] . ' payée' . ($dom ? ' : nom de domaine à réserver' : '');
    $corps = 'La commande ' . $c['ref'] . ' de ' . aled08e_cmd_nom($c) . " est payée.\n\n"
        . aled08e_cmd_recap_txt($c) . "\n"
        . ($dom
            ? (function_exists('aled08e_registrar') && aled08e_registrar() === 'ovh'
                ? "Nom de domaine : " . $c['domaine'] . " (achat automatique chez OVH" . (function_exists('aled08e_ovh_essai') && aled08e_ovh_essai() ? ', avec votre validation par e-mail' : '') . ")\n\n"
                : "Nom de domaine à réserver : " . $c['domaine'] . "\nTitulaire (le client) :\n" . aled08e_cmd_titulaire_txt($c) . "\n\nCommandez le domaine chez votre registrar, puis cliquez « Domaine réservé » dans la fiche commande.\n\n")
            : "Le client garde son nom de domaine : il faudra pointer ses DNS vers l’hébergement.\n\n")
        . 'Fiche commande : ' . aled08e_cmd_admin_url($c['id']) . "\n";
    wp_mail(aled08e_to(), $sujet, $corps, aled08e_mail_headers());
}
function aled08e_cmd_mail_client_en_ligne($c) {
    $site = $c['domaine'] ? 'https://' . $c['domaine'] : aled08e_meta($c['user'], 'site');
    $solde = (float) $c['montants']['solde'];
    $soldeDu = aled08e_cmd_reception_due(array_merge($c, ['statut' => 'en_ligne']));
    $corps = 'Bonjour ' . $c['prenom'] . ",\n\n"
        . "Bonne nouvelle : votre site est en ligne !\n" . ($site ? 'Adresse : ' . $site . "\n" : '') . "\n"
        . ($soldeDu
            ? 'À la réception, il reste ' . aled08e_euro_txt($solde) . ' pour la création. Vous choisissez : en une fois, ou ' . aled08e_fois_txt() . ". Votre forfait démarre à ce moment-là.\n"
                . (aled08e_stripe_ready()
                    ? "Tout se fait dans votre espace client, onglet « Ma commande » :\n" . aled08e_url() . "#commande\n\n"
                    : "Je vous envoie le lien de paiement dans un e-mail séparé.\n\n")
            : '')
        . "Pour faire évoluer votre site, envoyez vos demandes depuis votre espace client, onglet « Mes demandes » :\n" . aled08e_url() . "\n"
        . "Merci pour votre confiance,\nAlex et sa petite bande\n";
    wp_mail($c['email'], 'Votre site est en ligne', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
}

/* Rappel quotidien : noms de domaine à réserver (commandes payées) */
function aled08e_cmd_rappel_domaines() {
    $list = [];
    if (function_exists('aled08e_registrar') && aled08e_registrar() === 'ovh') return; // l'automate achète les domaines chez OVH
    foreach (aled08e_cmd_par_statut(['payee', 'en_creation']) as $c) {
        if ($c['domaine'] && !$c['domaine_mien'] && $c['domaine_statut'] === 'a_reserver') $list[] = $c;
    }
    if (!$list) return;
    $corps = count($list) . ' nom(s) de domaine à réserver chez votre registrar (par exemple https://www.ovh.com/manager/ ou https://clients.o2switch.fr) :' . "\n\n";
    foreach ($list as $c) {
        $corps .= $c['domaine'] . ' (commande ' . $c['ref'] . ")\nTitulaire :\n" . aled08e_cmd_titulaire_txt($c) . "\nFiche : " . aled08e_cmd_admin_url($c['id']) . "\n\n";
    }
    $corps .= "Quand c’est fait, cliquez « Domaine réservé » dans la fiche de la commande : ce rappel s’arrête.\n";
    wp_mail(aled08e_to(), 'Rappel : ' . count($list) . ' nom(s) de domaine à réserver', $corps, aled08e_mail_headers());
}
add_action('aled08_quotidien', 'aled08e_cmd_rappel_domaines', 20);

/* À la réception : le reste de la création (et le démarrage du forfait) est-il encore à régler ? */
/* Le paiement en plusieurs fois passe par un organisme externe (Alma, Klarna), sur la page de paiement Stripe :
 * il avance la somme, le client le rembourse. « en 3 ou 4 fois avec Alma ou Klarna » */
function aled08e_fois_txt() {
    $f = (array) (aled08e_data()['fractionne'] ?? []);
    return 'en ' . ($f['fois'] ?? '3 ou 4') . ' fois avec ' . ($f['organismes'] ?? 'Alma ou Klarna');
}
function aled08e_cmd_reception_due($c) {
    return $c['statut'] === 'en_ligne' && empty($c['reception_payee']) && empty($c['solde_paye']) && (float) $c['montants']['solde'] > 0;
}
/* Montants recalculés pour le choix fait à la réception (n = 0 : en une fois ; 6 ou 12 : en plusieurs fois, forfait au mois) */
function aled08e_cmd_montants_reception($c, $n) {
    $cfg = ['type' => $c['type'], 'forfait' => $c['forfait'], 'periode' => $n ? 'mois' : $c['periode'], 'lissage' => $n, 'options' => $c['options'], 'pages_plus' => $c['pages_plus'] ?? 0, 'remise' => (int) ($c['remise'] ?? 0)];
    return aled08e_cmd_montants($cfg);
}
