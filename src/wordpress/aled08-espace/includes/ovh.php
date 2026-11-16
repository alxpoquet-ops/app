<?php
/**
 * Les Minis Monstres Espace client : OVHcloud (API v1, sans SDK).
 *  - signature des requêtes (clés dans wp-config.php ou dans les réglages, jamais affichées)
 *  - achat d'un nom de domaine au nom du client (panier, contact titulaire, configurations, essai à blanc, commande)
 *  - suivi de la commande OVH, serveurs DNS, renouvellement automatique
 *  - hébergement web OVH : rattacher un domaine (multisite, SSL), tâches, adresse e-mail, base de données, module WordPress
 * Référence : https://eu.api.ovh.com/console/ (schémas /1.0/order.json, /1.0/me.json, /1.0/domain.json, /1.0/hosting/web.json, /1.0/email/domain.json)
 */
defined('ABSPATH') || exit;

define('ALED08E_OVH_BASE', 'https://eu.api.ovh.com/1.0');

/* =========================================================================
 *  Clés et réglages
 * ========================================================================= */
function aled08e_ovh_cle($nom) {
    $const = 'ALED08_OVH_' . strtoupper($nom);
    if (defined($const) && constant($const)) return (string) constant($const);
    return (string) get_option('aled08_ovh_' . $nom, '');
}
function aled08e_ovh_ready() { return aled08e_ovh_cle('ak') !== '' && aled08e_ovh_cle('as') !== '' && aled08e_ovh_cle('ck') !== ''; }
/* Nom du service d'hébergement web OVH (ex. xxxxx.cluster0yy.hosting.ovh.net) : constante ou réglage */
function aled08e_ovh_hosting() {
    if (defined('ALED08_OVH_HOSTING') && ALED08_OVH_HOSTING) return (string) ALED08_OVH_HOSTING;
    return (string) get_option('aled08_ovh_hosting', '');
}
function aled08e_ovh_hosting_ready() { return aled08e_ovh_ready() && aled08e_ovh_hosting() !== ''; }
/* Essai à blanc : s'arrêter juste avant l'achat et demander une validation (coché par défaut) */
function aled08e_ovh_essai() { return get_option('aled08_ovh_essai', '1') === '1'; }
/* Installer WordPress automatiquement sur l'hébergement OVH (expérimental, décoché par défaut) */
function aled08e_ovh_wp_auto() { return get_option('aled08_ovh_wp', '0') === '1'; }

function aled08e_ovh_masque($k) { return $k === '' ? 'aucune clé enregistrée' : 'clé enregistrée, se termine par …' . substr($k, -4); }

/* Journal des appels (50 derniers), lisible dans l'admin : jamais de clé dedans */
function aled08e_ovh_journal_add($type, $resultat) {
    $j = get_option('aled08_ovh_journal', []);
    $j = is_array($j) ? $j : [];
    array_unshift($j, ['date' => current_time('mysql'), 'type' => mb_substr((string) $type, 0, 120), 'resultat' => mb_substr((string) $resultat, 0, 400)]);
    update_option('aled08_ovh_journal', array_slice($j, 0, 50), false);
}
function aled08e_ovh_journal() { $j = get_option('aled08_ovh_journal', []); return is_array($j) ? $j : []; }

/* =========================================================================
 *  Requête signée
 *  X-Ovh-Signature = '$1$' . sha1(AS + '+' + CK + '+' + METHODE + '+' + URL complète + '+' + CORPS + '+' + TIMESTAMP)
 *  Le corps signé est EXACTEMENT la chaîne JSON envoyée (vide pour GET et DELETE sans corps).
 * ========================================================================= */
function aled08e_ovh_delta() {
    $d = get_transient('aled08_ovh_delta');
    if ($d !== false) return (int) $d;
    $r = wp_remote_get(ALED08E_OVH_BASE . '/auth/time', ['timeout' => 15]);
    $t = is_wp_error($r) ? 0 : (int) trim((string) wp_remote_retrieve_body($r));
    $d = $t > 0 ? $t - time() : 0;
    set_transient('aled08_ovh_delta', $d, HOUR_IN_SECONDS);
    return $d;
}
function aled08e_ovh_request($method, $path, $body = null, $quiet = false) {
    if (!aled08e_ovh_ready()) return new WP_Error('aled08_ovh', 'OVH n’est pas configuré (clés manquantes).');
    $method = strtoupper($method);
    $url = ALED08E_OVH_BASE . $path;
    $json = ($body === null || $method === 'GET') ? '' : wp_json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $ts = time() + aled08e_ovh_delta();
    $sig = '$1$' . sha1(aled08e_ovh_cle('as') . '+' . aled08e_ovh_cle('ck') . '+' . $method . '+' . $url . '+' . $json . '+' . $ts);
    $args = [
        'method' => $method, 'timeout' => 40,
        'headers' => [
            'Content-Type' => 'application/json; charset=utf-8',
            'X-Ovh-Application' => aled08e_ovh_cle('ak'), 'X-Ovh-Consumer' => aled08e_ovh_cle('ck'),
            'X-Ovh-Timestamp' => (string) $ts, 'X-Ovh-Signature' => $sig,
        ],
    ];
    if ($json !== '') $args['body'] = $json;
    $r = wp_remote_request($url, $args);
    if (is_wp_error($r)) {
        if (!$quiet) aled08e_ovh_journal_add('réseau ' . $method . ' ' . $path, $r->get_error_message());
        return new WP_Error('aled08_ovh', 'OVH injoignable : ' . $r->get_error_message());
    }
    $code = (int) wp_remote_retrieve_response_code($r);
    $raw = (string) wp_remote_retrieve_body($r);
    $data = json_decode($raw, true);
    if ($code >= 400) {
        $msg = is_array($data) && !empty($data['message']) ? $data['message'] : ('réponse ' . $code);
        $class = is_array($data) && !empty($data['class']) ? $data['class'] : '';
        if (!$quiet) aled08e_ovh_journal_add('erreur ' . $method . ' ' . $path, $msg . ($class ? ' [' . $class . ']' : ''));
        return new WP_Error('aled08_ovh', $msg, ['code' => $code, 'class' => $class, 'details' => is_array($data) ? ($data['details'] ?? null) : null]);
    }
    return $data === null && $raw !== '' ? $raw : $data;
}
/* Test des réglages : le compte (nic) et, si renseigné, l'hébergement */
function aled08e_ovh_test() {
    $me = aled08e_ovh_request('GET', '/me');
    if (is_wp_error($me)) return $me;
    $out = 'OK, compte ' . (is_array($me) ? ($me['nichandle'] ?? '?') : '?');
    if (aled08e_ovh_hosting() !== '') {
        $h = aled08e_ovh_request('GET', '/hosting/web/' . rawurlencode(aled08e_ovh_hosting()));
        $out .= is_wp_error($h) ? ' ; hébergement : ' . $h->get_error_message() : ' ; hébergement ' . ($h['offer'] ?? '') . ' (' . ($h['state'] ?? '') . '), IP ' . ($h['hostingIp'] ?? '?');
    }
    return $out;
}

/* =========================================================================
 *  Nom de domaine : achat au nom du client
 *  Retour : ['etape' => 'devis', 'prix' => …, 'cart' => …] (essai à blanc), ['etape' => 'commande', 'orderId' => …, 'prix' => …] ou WP_Error
 * ========================================================================= */
function aled08e_ovh_contact_pour($c) {
    // un contact OVH par client, réutilisé pour ses commandes suivantes
    $cid = $c['user'] ? (string) get_user_meta($c['user'], 'aled08_ovh_contact', true) : '';
    if ($cid !== '') return $cid;
    $tel = preg_replace('/[^0-9+]/', '', (string) $c['telephone']);
    if (strpos($tel, '0') === 0) $tel = '+33.' . substr($tel, 1);
    elseif (strpos($tel, '+33') === 0) $tel = '+33.' . ltrim(substr($tel, 3), '0');
    elseif (strpos($tel, '+') === 0 && strpos($tel, '.') === false) $tel = substr($tel, 0, 3) . '.' . substr($tel, 3);
    $body = [
        'firstName' => $c['prenom'], 'lastName' => $c['nom'], 'email' => $c['email'], 'phone' => $tel,
        'legalForm' => $c['entreprise'] ? 'corporation' : 'individual', 'language' => 'fr_FR',
        'address' => ['line1' => $c['adresse'], 'zip' => $c['code_postal'], 'city' => $c['ville'], 'country' => 'FR'],
    ];
    if ($c['entreprise']) $body['organisationName'] = $c['entreprise'];
    $r = aled08e_ovh_request('POST', '/me/contact', $body);
    if (is_wp_error($r)) return $r;
    $id = (string) ($r['id'] ?? '');
    if ($id === '') return new WP_Error('aled08_ovh', 'Contact OVH créé sans identifiant.');
    if ($c['user']) update_user_meta($c['user'], 'aled08_ovh_contact', $id);
    return $id;
}
function aled08e_ovh_commander_domaine($c, $valide = false, $dns = '') {
    $dom = $c['domaine'];
    if (!$dom) return new WP_Error('aled08_ovh', 'Pas de nom de domaine sur la commande.');
    $cart = aled08e_ovh_request('POST', '/order/cart', ['ovhSubsidiary' => 'FR', 'description' => 'Commande ' . $c['ref']]);
    if (is_wp_error($cart)) return $cart;
    $cartId = (string) ($cart['cartId'] ?? '');
    if ($cartId === '') return new WP_Error('aled08_ovh', 'Panier OVH sans identifiant.');
    $a = aled08e_ovh_request('POST', '/order/cart/' . rawurlencode($cartId) . '/assign');
    if (is_wp_error($a)) return $a;

    $infos = aled08e_ovh_request('GET', '/order/cart/' . rawurlencode($cartId) . '/domain?domain=' . rawurlencode($dom));
    if (is_wp_error($infos)) return $infos;
    $offre = null;
    foreach ((array) $infos as $i) {
        if (!empty($i['orderable']) && (($i['action'] ?? '') === 'create')) { $offre = $i; break; }
    }
    if (!$offre) return new WP_Error('aled08_ovh', 'Le nom ' . $dom . ' n’est pas commandable chez OVH (déjà pris ou réservé).');
    if (!in_array((string) ($offre['pricingMode'] ?? ''), ['create-default', 'default'], true)) {
        return new WP_Error('aled08_ovh', 'Le nom ' . $dom . ' est vendu à un tarif spécial (' . ($offre['pricingMode'] ?? '?') . ') : à valider à la main.');
    }
    $item = aled08e_ovh_request('POST', '/order/cart/' . rawurlencode($cartId) . '/domain', ['domain' => $dom, 'duration' => 'P1Y']);
    if (is_wp_error($item)) return $item;
    $itemId = (string) ($item['itemId'] ?? '');
    if ($itemId === '') return new WP_Error('aled08_ovh', 'Article OVH sans identifiant.');

    $req = aled08e_ovh_request('GET', '/order/cart/' . rawurlencode($cartId) . '/item/' . rawurlencode($itemId) . '/requiredConfiguration');
    if (is_wp_error($req)) return $req;
    $contact = null;
    $labels = [];
    foreach ((array) $req as $r) $labels[(string) ($r['label'] ?? '')] = $r;
    $conf = [];
    if (isset($labels['OWNER_LEGAL_AGE'])) $conf['OWNER_LEGAL_AGE'] = 'true';
    if (isset($labels['OWNER_CONTACT'])) {
        $contact = aled08e_ovh_contact_pour($c);
        if (is_wp_error($contact)) return $contact;
        $conf['OWNER_CONTACT'] = '/me/contact/' . $contact;
    }
    if ($dns !== '' && isset($labels['DNS'])) $conf['DNS'] = $dns;
    foreach ($labels as $label => $r) {
        if (!empty($r['required']) && !isset($conf[$label])) {
            return new WP_Error('aled08_ovh', 'OVH demande une information que l’automate ne sait pas remplir pour ' . $dom . ' : ' . $label . '. À commander à la main.');
        }
    }
    foreach ($conf as $label => $value) {
        $r = aled08e_ovh_request('POST', '/order/cart/' . rawurlencode($cartId) . '/item/' . rawurlencode($itemId) . '/configuration', ['label' => $label, 'value' => $value]);
        if (is_wp_error($r)) return $r;
    }
    $devis = aled08e_ovh_request('GET', '/order/cart/' . rawurlencode($cartId) . '/checkout');
    if (is_wp_error($devis)) return $devis;
    $prix = isset($devis['prices']['withTax']['value']) ? (float) $devis['prices']['withTax']['value'] : null;
    if ($prix !== null && $prix > 60) return new WP_Error('aled08_ovh', 'Prix inattendu pour ' . $dom . ' : ' . $prix . ' € TTC. Achat bloqué, à vérifier à la main.');
    if (aled08e_ovh_essai() && !$valide) return ['etape' => 'devis', 'prix' => $prix, 'cart' => $cartId];

    $cmd = aled08e_ovh_request('POST', '/order/cart/' . rawurlencode($cartId) . '/checkout', ['autoPayWithPreferredPaymentMethod' => true, 'waiveRetractationPeriod' => true]);
    if (is_wp_error($cmd)) return $cmd;
    $orderId = (string) ($cmd['orderId'] ?? '');
    if ($orderId === '') return new WP_Error('aled08_ovh', 'Commande OVH sans numéro.');
    aled08e_ovh_journal_add('achat domaine', $dom . ' : commande ' . $orderId . ($prix !== null ? ', ' . $prix . ' € TTC' : ''));
    return ['etape' => 'commande', 'orderId' => $orderId, 'prix' => $prix, 'url' => (string) ($cmd['url'] ?? '')];
}
/* Statut d'une commande OVH : cancelled, cancelling, checking, delivered, delivering, documentsRequested, notPaid, unknown */
function aled08e_ovh_statut_commande($orderId) {
    $s = aled08e_ovh_request('GET', '/me/order/' . rawurlencode($orderId) . '/status');
    if (is_wp_error($s)) return $s;
    return is_string($s) ? trim($s, '"') : (string) $s;
}
/* Commande « notPaid » : payer avec le moyen enregistré */
function aled08e_ovh_payer_commande($orderId) {
    $m = aled08e_ovh_request('GET', '/me/order/' . rawurlencode($orderId) . '/availableRegisteredPaymentMean');
    if (is_wp_error($m)) return $m;
    $m = (array) $m;
    if (!$m) return new WP_Error('aled08_ovh', 'Aucun moyen de paiement enregistré chez OVH.');
    $mean = (string) ($m[0]['paymentMean'] ?? '');
    $body = ['paymentMean' => $mean];
    if (!empty($m[0]['paymentMeanId'])) $body['paymentMeanId'] = (int) $m[0]['paymentMeanId'];
    return aled08e_ovh_request('POST', '/me/order/' . rawurlencode($orderId) . '/payWithRegisteredPaymentMean', $body);
}
function aled08e_ovh_domaine_existe($dom) {
    $d = aled08e_ovh_request('GET', '/domain/' . rawurlencode($dom), null, true);
    return !is_wp_error($d);
}
function aled08e_ovh_domaine_dns($dom, $hosts) {
    $ns = [];
    foreach ((array) $hosts as $h) $ns[] = ['host' => $h];
    return aled08e_ovh_request('POST', '/domain/' . rawurlencode($dom) . '/nameServers/update', ['nameServers' => $ns]);
}
function aled08e_ovh_renouvellement_auto($dom) {
    $s = aled08e_ovh_request('GET', '/domain/' . rawurlencode($dom) . '/serviceInfos', null, true);
    if (is_wp_error($s) || !is_array($s)) return $s;
    if (!empty($s['renew']['automatic'])) return true;
    $renew = (array) ($s['renew'] ?? []);
    $renew['automatic'] = true;
    $renew['deleteAtExpiration'] = false;
    return aled08e_ovh_request('PUT', '/domain/' . rawurlencode($dom) . '/serviceInfos', ['renew' => $renew]);
}

/* =========================================================================
 *  Hébergement web OVH
 * ========================================================================= */
function aled08e_ovh_hb_path($dom) { return 'sites/' . preg_replace('/[^a-z0-9.-]/', '', strtolower($dom)); }
function aled08e_ovh_hb_infos() {
    $h = aled08e_ovh_request('GET', '/hosting/web/' . rawurlencode(aled08e_ovh_hosting()), null, true);
    return is_wp_error($h) ? $h : (array) $h;
}
function aled08e_ovh_hb_ip() {
    $h = aled08e_ovh_hb_infos();
    return is_wp_error($h) ? '' : (string) ($h['hostingIp'] ?? '');
}
/* Rattacher un domaine (et son www) : retourne la tâche OVH (id) ou WP_Error ; un domaine déjà rattaché n'est pas une erreur */
function aled08e_ovh_hb_attacher($dom) {
    $svc = rawurlencode(aled08e_ovh_hosting());
    $deja = aled08e_ovh_request('GET', '/hosting/web/' . $svc . '/attachedDomain/' . rawurlencode($dom), null, true);
    if (!is_wp_error($deja)) return ['deja' => true, 'id' => 0];
    $body = ['domain' => $dom, 'path' => aled08e_ovh_hb_path($dom), 'ssl' => true, 'cdn' => 'none', 'firewall' => 'active', 'bypassDNSConfiguration' => false];
    $t = aled08e_ovh_request('POST', '/hosting/web/' . $svc . '/attachedDomain', $body);
    if (is_wp_error($t)) return $t;
    // le www, en plus, sur le même dossier (non bloquant)
    $w = aled08e_ovh_request('POST', '/hosting/web/' . $svc . '/attachedDomain', ['domain' => 'www.' . $dom, 'path' => aled08e_ovh_hb_path($dom), 'ssl' => true, 'cdn' => 'none', 'firewall' => 'active', 'bypassDNSConfiguration' => false], true);
    return ['deja' => false, 'id' => (int) ($t['id'] ?? 0), 'www' => !is_wp_error($w)];
}
function aled08e_ovh_hb_tache($id) {
    if (!$id) return 'done';
    $t = aled08e_ovh_request('GET', '/hosting/web/' . rawurlencode(aled08e_ovh_hosting()) . '/tasks/' . (int) $id, null, true);
    if (is_wp_error($t)) return 'inconnue';
    return (string) ($t['status'] ?? 'inconnue'); // todo, doing, done, error, cancelled
}
function aled08e_ovh_hb_domaine_etat($dom) {
    $d = aled08e_ovh_request('GET', '/hosting/web/' . rawurlencode(aled08e_ovh_hosting()) . '/attachedDomain/' . rawurlencode($dom), null, true);
    return is_wp_error($d) ? null : (array) $d;
}
/* Adresse e-mail pro contact@domaine (service e-mail inclus avec le domaine OVH) */
function aled08e_ovh_email_creer($dom, $compte, $mdp) {
    $svc = aled08e_ovh_request('GET', '/email/domain/' . rawurlencode($dom), null, true);
    if (is_wp_error($svc)) return new WP_Error('aled08_ovh', 'Pas de service e-mail OVH pour ' . $dom . ' : ' . $svc->get_error_message());
    $deja = aled08e_ovh_request('GET', '/email/domain/' . rawurlencode($dom) . '/account/' . rawurlencode($compte), null, true);
    if (!is_wp_error($deja)) return ['deja' => true];
    $r = aled08e_ovh_request('POST', '/email/domain/' . rawurlencode($dom) . '/account', ['accountName' => $compte, 'password' => $mdp, 'size' => 5000000000, 'description' => 'Adresse pro créée par les Minis Monstres']);
    if (is_wp_error($r)) return $r;
    return ['deja' => false, 'tache' => (int) ($r['id'] ?? 0)];
}
/* Base de données + module WordPress (expérimental, derrière un réglage) */
function aled08e_ovh_hb_base_creer($dom, $mdp) {
    $svc = rawurlencode(aled08e_ovh_hosting());
    $cap = aled08e_ovh_request('GET', '/hosting/web/' . $svc . '/databaseCreationCapabilities');
    if (is_wp_error($cap)) return $cap;
    $choix = null;
    foreach ((array) $cap as $k) {
        if (in_array((string) ($k['type'] ?? ''), ['mysql', 'mariadb'], true) && ($k['available'] ?? 1)) { $choix = $k; break; }
    }
    if (!$choix) return new WP_Error('aled08_ovh', 'Plus de base de données disponible sur l’hébergement OVH (quota atteint).');
    $infos = aled08e_ovh_hb_infos();
    if (is_wp_error($infos)) return $infos;
    $login = (string) ($infos['primaryLogin'] ?? '');
    $user = strtolower($login . substr(preg_replace('/[^a-z0-9]/', '', strtolower($dom)), 0, 6));
    $body = ['capabilitie' => (string) ($choix['capabilitie'] ?? 'sqlPerso'), 'type' => (string) $choix['type'], 'user' => $user, 'password' => $mdp];
    if (!empty($choix['version'])) $body['version'] = $choix['version'];
    $r = aled08e_ovh_request('POST', '/hosting/web/' . $svc . '/database', $body);
    if (is_wp_error($r)) return $r;
    return ['user' => $user, 'tache' => (int) ($r['id'] ?? 0)];
}
function aled08e_ovh_module_wordpress() {
    $list = aled08e_ovh_request('GET', '/hosting/web/moduleList?latest=true&active=true', null, true);
    if (is_wp_error($list)) return 0;
    foreach ((array) $list as $id) {
        $m = aled08e_ovh_request('GET', '/hosting/web/moduleList/' . (int) $id, null, true);
        if (!is_wp_error($m) && strtolower((string) ($m['name'] ?? '')) === 'wordpress') return (int) $id;
    }
    return 0;
}
function aled08e_ovh_hb_wordpress($dom, $db, $adminMdp) {
    $moduleId = aled08e_ovh_module_wordpress();
    if (!$moduleId) return new WP_Error('aled08_ovh', 'Module WordPress introuvable dans la liste OVH.');
    $svc = rawurlencode(aled08e_ovh_hosting());
    $body = [
        'moduleId' => $moduleId, 'domain' => $dom, 'path' => aled08e_ovh_hb_path($dom), 'language' => 'fr_FR',
        'adminName' => 'alex', 'adminPassword' => $adminMdp,
        'dependencies' => [['type' => 'sql', 'name' => $db['name'], 'user' => $db['user'], 'password' => $db['password'], 'server' => $db['server'], 'port' => (int) ($db['port'] ?: 3306), 'prefix' => 'wp_']],
    ];
    return aled08e_ovh_request('POST', '/hosting/web/' . $svc . '/module', $body);
}
