<?php
/**
 * Les Minis Monstres : la prospection, ce qu'Alex a demandé au lancement (26 novembre 2026).
 *
 *  1. LOIN D'ALEX D'ABORD : pas un prospect à moins de 40 km de Signy-l'Abbaye (« ceux autour, je les attire avec mes
 *     brochures »). La ville du prospect est placée sur la carte par l'annuaire des communes de l'État (geo.api.gouv.fr),
 *     la distance est calculée à vol d'oiseau. Ville introuvable dans un département voisin : refusé (on ne devine pas).
 *  2. UNE MAQUETTE PAR MÉTIER : chaque nouveau groupe de métier a sa maquette type (comme celle du plombier), faite une
 *     fois par le Facteur, gardée ici, puis remplie pour chaque prospect du groupe avec son nom et sa ville. Le mail a le
 *     bouton « Voir la maquette de votre site », qui ouvre la maquette à son nom (lien signé, compté comme un clic).
 *  3. LE BILAN DU SOIR : chaque soir, les mails envoyés et ce qui compte (commandes, sites livrés, place sur l'hébergement).
 *
 * Routes : GET  /aled08/v1/atelier/maquettes            la liste, et le modèle (plombier) à suivre
 *          POST /aled08/v1/atelier/maquettes {groupe, nom, mots[], html, photos{}}   enregistrer une maquette type
 */
defined('ABSPATH') || exit;

/* ====================================================================== 1. la distance */
function aled08e_px_rayon_min() { return max(0, (int) get_option('aled08_prospection_rayon_min', 40)); }
function aled08e_px_base() {
    $b = get_option('aled08_prospection_base', []);
    return is_array($b) && isset($b['lat'], $b['lng']) ? $b : ['lat' => 49.6996, 'lng' => 4.4183, 'nom' => 'Signy-l’Abbaye'];
}
function aled08e_px_km($lat1, $lng1, $lat2, $lng2) {
    $r = 6371;
    $dl = deg2rad($lat2 - $lat1); $dg = deg2rad($lng2 - $lng1);
    $a = sin($dl / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dg / 2) ** 2;
    return (int) round(2 * $r * asin(min(1, sqrt($a))));
}
/* La place d'une commune sur la carte (gardée 90 jours) : [lat, lng] ou null */
function aled08e_px_commune_centre($ville, $dep) {
    $ville = trim((string) $ville); $dep = strtoupper(trim((string) $dep));
    if ($ville === '' || $dep === '') return null;
    $cle = 'aled08_geo2_' . md5(remove_accents(mb_strtolower($ville)) . '|' . $dep);
    $c = get_transient($cle);
    if (is_array($c)) return $c ?: null;
    $q = trim(preg_replace('/\s*\(.*\)$/', '', preg_replace('/\b\d{5}\b/', '', $ville)));
    $c = [];
    $vu = false; // au moins un annuaire a répondu
    // 1. l'annuaire des communes (geo.api.gouv.fr)
    $u = add_query_arg(['nom' => $q, 'codeDepartement' => $dep, 'fields' => 'nom,centre', 'boost' => 'population', 'limit' => 1], 'https://geo.api.gouv.fr/communes');
    $r = wp_remote_get($u, ['timeout' => 12]);
    if (!is_wp_error($r) && (int) wp_remote_retrieve_response_code($r) === 200) {
        $vu = true;
        $d = json_decode((string) wp_remote_retrieve_body($r), true);
        if (is_array($d) && !empty($d[0]['centre']['coordinates'])) $c = [(float) $d[0]['centre']['coordinates'][1], (float) $d[0]['centre']['coordinates'][0]];
    }
    // 2. en secours, la Base adresse nationale (api-adresse.data.gouv.fr), limitée aux communes
    if (!$c) {
        $u = add_query_arg(['q' => $q, 'type' => 'municipality', 'limit' => 5], 'https://api-adresse.data.gouv.fr/search/');
        $r = wp_remote_get($u, ['timeout' => 12]);
        if (!is_wp_error($r) && (int) wp_remote_retrieve_response_code($r) === 200) {
            $vu = true;
            $d = json_decode((string) wp_remote_retrieve_body($r), true);
            foreach ((array) ($d['features'] ?? []) as $f) {
                $ci = (string) ($f['properties']['citycode'] ?? '');
                $okDep = strlen($dep) === 3 ? strpos($ci, $dep) === 0 : substr($ci, 0, 2) === $dep;
                if ($okDep && !empty($f['geometry']['coordinates'])) { $c = [(float) $f['geometry']['coordinates'][1], (float) $f['geometry']['coordinates'][0]]; break; }
            }
        }
    }
    if (!$vu) return null; // aucun annuaire joignable : rien gardé, on réessaiera
    set_transient($cle, $c, $c ? 90 * DAY_IN_SECONDS : DAY_IN_SECONDS);
    return $c ?: null;
}
/* La distance d'un prospect à Alex, en km ; null si la ville ne se trouve pas */
function aled08e_px_distance($ville, $dep) {
    $c = aled08e_px_commune_centre($ville, $dep);
    if (!$c) return null;
    $b = aled08e_px_base();
    return aled08e_px_km((float) $b['lat'], (float) $b['lng'], $c[0], $c[1]);
}
/* Les départements qui touchent la zone des 40 km : une ville introuvable y est refusée */
function aled08e_px_departements_proches() { return ['08', '51', '02', '55']; }
/* '' si le prospect est assez loin, sinon la raison du refus */
function aled08e_px_refus_distance($ville, $dep, &$km = null) {
    $min = aled08e_px_rayon_min();
    if ($min <= 0) return '';
    $km = aled08e_px_distance($ville, $dep);
    if ($km === null) return in_array(strtoupper((string) $dep), aled08e_px_departements_proches(), true)
        ? 'ville introuvable dans l’annuaire des communes, dans un département proche d’Alex : impossible de vérifier qu’elle est à plus de ' . $min . ' km. Écrivez le nom exact de la commune.' : '';
    if ($km < $min) return 'trop près d’Alex (' . $km . ' km de ' . aled08e_px_base()['nom'] . ') : à moins de ' . $min . ' km, Alex démarche avec ses brochures. Cherchez plus loin.';
    return '';
}
/* La tournée commence loin : les départements proches passent en dernier */
add_filter('aled08e_px_departements_ordre', function ($l) {
    $proches = aled08e_px_departements_proches();
    return array_values(array_merge(array_diff($l, $proches), array_intersect($proches, $l)));
});

/* ====================================================================== 2. les maquettes par métier */
/* Celles livrées avec l'extension (dossier maquettes/), faites et validées avec Alex */
function aled08e_mq_livrees() {
    return [
        'plombier-chauffagiste' => ['nom' => 'Plombiers, chauffagistes', 'mots' => ['plomb', 'chauffag', 'sanitaire', 'chaudi', 'pompe a chaleur', 'pac '], 'fichier' => 'plombier-chauffagiste.html'],
    ];
}
function aled08e_mq_dossier() { return dirname(__DIR__) . '/maquettes/'; }
function aled08e_mq_url() { return plugins_url('maquettes/', dirname(__DIR__) . '/aled08-espace.php'); }
function aled08e_mq_enregistrees() { $m = get_option('aled08_px_maquettes', []); return is_array($m) ? $m : []; }
function aled08e_mq_toutes() {
    $out = [];
    foreach (aled08e_mq_livrees() as $g => $m) if (is_file(aled08e_mq_dossier() . $m['fichier'])) $out[$g] = ['groupe' => $g, 'nom' => $m['nom'], 'mots' => $m['mots'], 'livree' => true, 'le' => ''];
    foreach (aled08e_mq_enregistrees() as $g => $m) $out[$g] = ['groupe' => $g, 'nom' => (string) $m['nom'], 'mots' => (array) $m['mots'], 'livree' => false, 'le' => (string) ($m['le'] ?? '')];
    return $out;
}
function aled08e_mq_norm($t) { return ' ' . trim(preg_replace('/[^a-z0-9]+/', ' ', strtolower(remove_accents((string) $t)))) . ' '; }
/* Le groupe d'un prospect, d'après son métier (« Plombier chauffagiste », « Chauffagiste »…) ; '' si aucune maquette */
function aled08e_mq_pour($metier) {
    $m = aled08e_mq_norm($metier);
    if (trim($m) === '') return '';
    foreach (aled08e_mq_toutes() as $g => $x) foreach ((array) $x['mots'] as $mot) {
        $mot = trim(aled08e_mq_norm($mot));
        if ($mot !== '' && strpos($m, $mot) !== false) return $g;
    }
    return '';
}
function aled08e_mq_html_brut($g) {
    $e = aled08e_mq_enregistrees();
    if (isset($e[$g]['html'])) return (string) $e[$g]['html'];
    $l = aled08e_mq_livrees();
    if (isset($l[$g]) && is_file(aled08e_mq_dossier() . $l[$g]['fichier'])) {
        $h = (string) file_get_contents(aled08e_mq_dossier() . $l[$g]['fichier']);
        return preg_replace('/(src|href)="img\//', '$1="' . esc_url(aled08e_mq_url()) . 'img/', $h);
    }
    return '';
}
/* Rien d'actif dans une maquette : pas de script, pas d'événement, pas de formulaire, pas de cadre */
function aled08e_mq_nettoyer($h) {
    $h = preg_replace('#<(script|iframe|object|embed|form|base|meta\s+http-equiv)[^>]*>.*?</\1>#is', '', (string) $h);
    $h = preg_replace('#<(script|iframe|object|embed|form|base|input|button|meta\s+http-equiv)\b[^>]*>#is', '', $h);
    $h = preg_replace('/\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $h);
    $h = preg_replace('/(href|src|action)\s*=\s*(["\'])\s*(javascript|vbscript|data:text)[^"\']*\2/i', '$1="#"', $h);
    return $h;
}
/* La maquette remplie pour un prospect, avec la barre « Créer mon site » en bas */
function aled08e_mq_rendre($g, $p, $liens) {
    $h = aled08e_mq_html_brut($g);
    if ($h === '') return '';
    $nom = (string) ($p['entreprise'] ?? '');
    $ville = (string) ($p['ville'] ?? '');
    $ini = mb_strtoupper(mb_substr(preg_replace('/^(l’|l\'|la |le |les )/iu', '', $nom), 0, 1));
    $h = str_replace(['{{ENTREPRISE}}', '{{VILLE}}', '{{INITIALE}}'], [esc_html($nom), esc_html($ville), esc_html($ini !== '' ? $ini : 'M')], $h);
    $barre = '<div style="position:fixed;left:0;right:0;bottom:0;z-index:200;background:#2e2a47;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.4;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:center;text-align:center">'
        . '<span>Cette maquette vous plaît ? Votre vrai site, fait avec vos informations, en moins d’une semaine.</span>'
        . '<a href="' . esc_url($liens['creer'] ?? home_url('/creer-mon-site/')) . '" style="background:#ffd36e;color:#2e2a47;font-weight:bold;text-decoration:none;padding:8px 16px;border-radius:999px">Créer mon site</a>'
        . '<a href="' . esc_url($liens['realisations'] ?? home_url('/realisations/')) . '" style="color:#fff">Voir les sites déjà en ligne</a>'
        . '<a href="' . esc_url($liens['stop'] ?? home_url('/')) . '" style="color:#cfc8f5;font-size:13px">Ne plus recevoir de message</a></div><div style="height:64px"></div>';
    return stripos($h, '</body>') !== false ? str_ireplace('</body>', $barre . '</body>', $h) : $h . $barre;
}
/* Enregistrer une maquette type (le Facteur, une fois par groupe) */
function aled08e_mq_enregistrer($d) {
    $g = sanitize_title((string) ($d['groupe'] ?? ''));
    $nom = sanitize_text_field((string) ($d['nom'] ?? ''));
    $mots = array_values(array_filter(array_map(function ($m) { return sanitize_text_field((string) $m); }, (array) ($d['mots'] ?? []))));
    $h = (string) ($d['html'] ?? '');
    if ($g === '' || $nom === '' || !$mots) return new WP_Error('aled08_mq', 'Il faut : groupe (ex. « electricien »), nom (ex. « Électriciens »), mots (ex. ["electric"]) et html.', ['status' => 400]);
    if (isset(aled08e_mq_livrees()[$g])) return new WP_Error('aled08_mq', 'Ce groupe a déjà sa maquette, validée par Alex.', ['status' => 409]);
    if (strlen($h) < 2000 || strlen($h) > 400000) return new WP_Error('aled08_mq', 'HTML trop court ou trop long (2 à 400 Ko).', ['status' => 400]);
    foreach (['{{ENTREPRISE}}', '{{VILLE}}', 'filigrane', 'Maquette'] as $x) if (strpos($h, $x) === false) return new WP_Error('aled08_mq', 'Il manque « ' . $x . ' » : la maquette suit le modèle du plombier (nom et ville remplis, filigrane, bandeau « Maquette pour vous projeter »).', ['status' => 400]);
    // les photos : seulement Pexels, gardées ici (rien n'est chargé ailleurs au moment de l'ouverture)
    $photos = (array) ($d['photos'] ?? []);
    if (count($photos) > 8) return new WP_Error('aled08_mq', '8 photos au plus.', ['status' => 400]);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    foreach ($photos as $repere => $url) {
        $url = esc_url_raw((string) $url);
        $hote = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
        if (!in_array($hote, ['images.pexels.com'], true)) return new WP_Error('aled08_mq', 'Photo refusée (' . $hote . ') : seulement images.pexels.com, libre d’utilisation.', ['status' => 400]);
        $tmp = download_url(add_query_arg(['auto' => 'compress', 'cs' => 'tinysrgb', 'w' => 1600], strtok($url, '?')), 30);
        if (is_wp_error($tmp)) return new WP_Error('aled08_mq', 'Photo impossible à télécharger : ' . $tmp->get_error_message(), ['status' => 502]);
        $id = media_handle_sideload(['name' => 'maquette-' . $g . '-' . sanitize_file_name((string) $repere) . '.jpg', 'tmp_name' => $tmp], 0, 'Maquette ' . $nom);
        if (is_wp_error($id)) { @unlink($tmp); return new WP_Error('aled08_mq', 'Photo refusée : ' . $id->get_error_message(), ['status' => 502]); }
        $h = str_replace('{{PHOTO:' . $repere . '}}', esc_url((string) wp_get_attachment_url($id)), $h);
    }
    if (preg_match('/\{\{PHOTO:[^}]+\}\}/', $h)) return new WP_Error('aled08_mq', 'Une photo {{PHOTO:…}} n’a pas d’adresse dans « photos ».', ['status' => 400]);
    $m = aled08e_mq_enregistrees();
    $m[$g] = ['nom' => $nom, 'mots' => $mots, 'html' => aled08e_mq_nettoyer($h), 'le' => wp_date('Y-m-d H:i')];
    update_option('aled08_px_maquettes', $m, false);
    if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Nouvelle maquette type : ' . $nom, 'Le Facteur a fait la maquette du groupe « ' . $nom . ' » (' . $g . ') : elle sert à tous les prospects suivants de ce métier.', 0, 'facteur');
    return ['ok' => true, 'groupe' => $g, 'nom' => $nom];
}
add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/maquettes', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $out = ['maquettes' => array_values(aled08e_mq_toutes()), 'regle' => 'Un nouveau groupe de métier sans maquette : la faire AVANT le premier mail du groupe, sur le modèle ci-dessous (même structure, vue ordinateur, filigrane, bandeau, {{ENTREPRISE}} {{VILLE}} {{INITIALE}}, tout le reste visiblement un exemple). Photos : Pexels, écrites {{PHOTO:repere}} dans le HTML et données dans « photos » {repere: adresse}.'];
            if ($r->get_param('modele')) $out['modele_html'] = (string) file_get_contents(aled08e_mq_dossier() . 'plombier-chauffagiste.html');
            if ($g = sanitize_title((string) $r->get_param('groupe'))) $out['html'] = aled08e_mq_html_brut($g);
            return new WP_REST_Response($out, 200);
        }],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $x = aled08e_mq_enregistrer((array) $r->get_json_params());
            return is_wp_error($x) ? $x : new WP_REST_Response($x, 200);
        }],
    ]);
});

/* ====================================================================== 3. le bilan du soir : le site et l'hébergement */
function aled08e_px_bilan_site_lignes() {
    $l = [];
    $jour = time() - DAY_IN_SECONDS;
    $n = function ($x, $un, $plusieurs) { return (int) $x . ' ' . ((int) $x > 1 ? $plusieurs : $un); };
    $cmd = function_exists('aled08e_cmd_liste') ? aled08e_cmd_liste(['numberposts' => 200, 'date_query' => [['after' => '-60 days']]]) : [];
    $reel = array_filter($cmd, function ($c) { return !preg_match('/^(TEST|ESSAI)-/i', (string) $c['ref']); });
    $payees = 0; $livres = 0; $enCours = 0;
    foreach ($reel as $c) {
        if (strtotime($c['date']) > $jour && $c['statut'] !== 'attente_paiement' && $c['statut'] !== 'annulee') $payees++;
        if ($c['statut'] === 'en_ligne') { $le = (int) get_post_meta($c['id'], '_aled08_en_ligne_le', true); if ($le > $jour) $livres++; }
        elseif (!in_array($c['statut'], ['attente_paiement', 'annulee'], true)) $enCours++;
    }
    $l[] = '- ' . $n($payees, 'commande payée', 'commandes payées') . ' aujourd’hui, ' . $n($livres, 'site livré', 'sites livrés') . ', ' . $n($enCours, 'site en cours', 'sites en cours');
    // la place sur l'hébergement (o2switch, cPanel)
    $alerte = [];
    if (function_exists('aled08e_cpanel_ok') && aled08e_cpanel_ok() && function_exists('aled08e_hb_cpanel_uapi')) {
        $q = aled08e_hb_cpanel_uapi('Quota', 'get_quota_info', []);
        if (!is_wp_error($q) && is_array($q)) {
            $d = isset($q['data']) && is_array($q['data']) ? $q['data'] : $q;
            $mo = (float) ($d['megabytes_used'] ?? 0); $max = (float) ($d['megabyte_limit'] ?? 0);
            $in = (float) ($d['inodes_used'] ?? 0); $inMax = (float) ($d['inode_limit'] ?? 0);
            $l[] = '- Hébergement : ' . number_format_i18n($mo / 1024, 1) . ' Go utilisés' . ($max > 0 ? ' sur ' . number_format_i18n($max / 1024, 0) . ' Go (' . (int) round(100 * $mo / $max) . ' %)' : ' (sans limite)') . ($inMax > 0 ? ', ' . (int) round(100 * $in / $inMax) . ' % des fichiers permis' : '');
            if ($max > 0 && $mo > 0.8 * $max) $alerte[] = 'L’hébergement est rempli à ' . (int) round(100 * $mo / $max) . ' % : il faut prendre plus de place chez o2switch (ou faire le ménage dans les sauvegardes).';
            if ($inMax > 0 && $in > 0.8 * $inMax) $alerte[] = 'Le nombre de fichiers approche de la limite de l’hébergement (' . (int) round(100 * $in / $inMax) . ' %) : prévoir un hébergement plus grand.';
        }
        $u = aled08e_hb_cpanel_uapi('ResourceUsage', 'get_usages', []);
        if (!is_wp_error($u) && is_array($u)) {
            foreach ((array) (isset($u['data']) ? $u['data'] : $u) as $x) {
                if (!is_array($x) || empty($x['maximum']) || !isset($x['usage']) || !is_numeric($x['maximum']) || !is_numeric($x['usage']) || (float) $x['maximum'] <= 0) continue;
                $pc = (int) round(100 * (float) $x['usage'] / (float) $x['maximum']);
                if ($pc >= 80) $alerte[] = 'Hébergement : « ' . sanitize_text_field((string) ($x['description'] ?? $x['id'] ?? '')) . ' » à ' . $pc . ' % de la limite : si ça dure, passer à une offre plus grande.';
            }
        }
    }
    $nbSites = count(array_filter($reel, function ($c) { return $c['statut'] === 'en_ligne'; }));
    if ($nbSites >= 150) $alerte[] = $nbSites . ' sites clients sur le même hébergement : il est temps de regarder une deuxième offre (o2switch ou OVH) pour répartir.';
    return ['lignes' => $l, 'alertes' => $alerte];
}

/* ====================================================================== 4. le tri des prospects déjà trouvés */
/* Ceux repérés avant la règle des 40 km : ceux qui sont trop près sont écartés (une fois, par paquets de 40, à chaque passage du
 * cron, jusqu'à ce qu'il n'en reste plus). On ne supprime rien : ils restent dans la liste, écartés, pour les brochures d'Alex. */
function aled08e_px_trier_distance() {
    if (get_option('aled08_px_tri_40km') === 'fait2' || aled08e_px_rayon_min() <= 0) return 0;
    $vus = (array) get_option('aled08_px_tri_40km_vus', []);
    $n = 0; $restants = 0;
    $liste = aled08e_px_liste(['etat' => ['nouveau', 'a_ecrire'], 'limite' => 100, 'orderby' => 'date', 'order' => 'ASC']);
    // ceux écartés seulement parce que leur ville n'avait pas été trouvée : on les repasse
    foreach (aled08e_px_liste(['etat' => ['ecarte'], 'limite' => 100]) as $p) if (strpos((string) aled08e_px_meta((int) $p['prospect'], 'ecarte_raison'), 'ville introuvable') === 0) $liste[] = $p;
    foreach ($liste as $p) {
        $id = (int) $p['prospect'];
        if (isset($vus[$id])) continue;
        if ($n >= 40) { $restants++; continue; }
        $n++;
        $km = null;
        $r = aled08e_px_refus_distance((string) aled08e_px_meta($id, 'ville'), (string) aled08e_px_meta($id, 'departement'), $km);
        if ($km !== null) aled08e_px_set($id, 'distance_km', (int) $km);
        $vus[$id] = 1;
        if ($r === '' && aled08e_px_meta($id, 'etat') === 'ecarte') { // finalement assez loin : il revient dans la liste
            aled08e_px_set($id, 'etat', 'nouveau');
            aled08e_px_set($id, 'ecarte_raison', '');
            aled08e_px_journal($id, 'Remis dans la liste : ' . ($km !== null ? $km . ' km d’Alex.' : 'ville vérifiée.'));
        } elseif ($r !== '' && strpos($r, 'ville introuvable') === 0 && aled08e_px_meta($id, 'etat') === 'ecarte') {
            // toujours introuvable : il reste écarté
        } elseif ($r !== '') {
            aled08e_px_set($id, 'etat', 'ecarte');
            aled08e_px_set($id, 'ecarte_raison', $r);
            aled08e_px_journal($id, 'Écarté : ' . $r);
        }
    }
    update_option('aled08_px_tri_40km_vus', $vus, false);
    if ($restants === 0) { update_option('aled08_px_tri_40km', 'fait2', false); delete_option('aled08_px_tri_40km_vus'); }
    return $n;
}
add_action('aled08_quotidien', 'aled08e_px_trier_distance', 5);
add_action('init', function () {
    if (get_option('aled08_px_tri_40km') !== 'fait2' && !wp_next_scheduled('aled08e_px_tri_40km')) wp_schedule_single_event(time() + 60, 'aled08e_px_tri_40km');
}, 46);
add_action('aled08e_px_tri_40km', 'aled08e_px_trier_distance');

/* ====================================================================== 5. le Répondeur répond lui-même (Alex, 26 novembre 2026) */
/* « Il répond tout seul, ou me fait un récap le soir, mais je ne veux pas les mails en double de mon côté. »
 * Plus de brouillon : le Répondeur écrit la réponse, le site la vérifie et l'envoie depuis l'adresse des Minis Monstres, dans
 * la même conversation. Ce qu'il ne peut pas trancher (un cas particulier, un devis sur mesure) est marqué « pour Alex » : il est
 * dans le bilan du soir, avec de quoi rappeler la personne. Aucun mail à Alex dans la journée.
 * POST /aled08/v1/atelier/prospect {prospect, faire: "repondre", avis, resume, corps, message_id?}
 * POST /aled08/v1/atelier/prospect {prospect, faire: "pour_alex", avis, resume}                                       */
function aled08e_px_echange_noter($id, $x) {
    $l = (array) aled08e_px_meta($id, 'echanges', []);
    $l[] = $x + ['le' => time()];
    aled08e_px_set($id, 'echanges', array_slice($l, -20));
}
/* Les montants et les liens permis dans une réponse : ceux des faits du poste, rien d'autre */
function aled08e_px_reponse_refus($corps) {
    $t = (string) $corps;
    $f = function_exists('aled08e_px_faits') ? aled08e_px_faits() : [];
    $tout = wp_json_encode($f, JSON_UNESCAPED_UNICODE);
    if (preg_match('/\b(IA|AI|I\.A\.)\b/u', $t) || preg_match('/intelligence artificielle|chat ?gpt|\bgpt\b|\bclaude\b|openai|chatbot|\brobots?\b|\bagents?\b|automatique/iu', $t)) return 'on ne parle jamais d’IA, d’agent ni d’outil automatique';
    if (preg_match('/(^|[\s«(])(je|moi)(\s|$)|(^|[\s«(])j[’\']\p{L}/iu', $t)) return 'au « nous », au nom de la bande : jamais « je »';
    if (preg_match('/\b(urgent|dernière chance|exceptionnel(le)?|sans frais)\b/iu', $t)) return 'pas de pression ni de promesse (urgent, dernière chance, sans frais…)';
    if (preg_match('/<[a-z\/!]/i', $t)) return 'du texte simple, sans balise';
    preg_match_all('#https?://[^\s)>\]]+#i', $t, $u);
    $liens = array_map('strval', array_values((array) ($f['liens'] ?? [])));
    foreach ($u[0] as $x) if (!in_array(rtrim($x, '.,;:'), $liens, true)) return 'lien refusé (' . $x . ') : seulement ceux de « faits.liens »';
    preg_match_all('/(\d[\d\s ]*(?:[.,]\d+)?)\s*(€|euros?\b)/iu', $t, $p);
    foreach ($p[1] as $x) {
        $n = preg_replace('/[\s ]/u', '', $x);
        if (strpos($tout, $n . ' €') === false && strpos($tout, $n . "\u{a0}€") === false && strpos($tout, $n . ' euros') === false) return 'montant refusé (' . trim($x) . ' €) : seulement les prix des « faits »';
    }
    if (mb_strlen(trim($t)) < 40 || mb_strlen($t) > 1600) return 'une réponse de 40 à 1 600 caractères';
    return '';
}
function aled08e_px_repondre($id, $p, $d) {
    $avis = sanitize_key((string) ($d['avis'] ?? ''));
    if (!in_array($avis, ['interesse', 'question', 'autre'], true)) return new WP_Error('aled08_px', 'avis : interesse, question ou autre.', ['status' => 400]);
    $resume = aled08e_px_texte($d['resume'] ?? '', 300);
    $corps = trim(str_replace("\r", '', wp_strip_all_tags((string) ($d['corps'] ?? ''))));
    if ($resume === '') return new WP_Error('aled08_px', 'Il manque « resume » : une phrase sur ce que la personne a écrit.', ['status' => 400]);
    if (!in_array($p['etat'], ['envoye', 'relance', 'repondu'], true)) return new WP_Error('aled08_px', 'On ne répond qu’à un prospect qui nous a répondu (il est « ' . $p['etat'] . ' »).', ['status' => 409]);
    if (aled08e_px_oppose($p['email'], $p['siren'] ?? '')) return new WP_Error('aled08_px', 'Cette adresse a demandé à ne plus rien recevoir.', ['status' => 409]);
    // pas de ping-pong avec un répondeur automatique : 4 réponses au plus, et une par heure
    $ech = (array) aled08e_px_meta($id, 'echanges', []);
    $envoyes = array_filter($ech, function ($x) { return !empty($x['envoye']); });
    $dernier = $envoyes ? (int) end($envoyes)['le'] : 0;
    if (count($envoyes) >= 4 || $dernier > time() - HOUR_IN_SECONDS) {
        aled08e_px_echange_noter($id, ['avis' => $avis, 'resume' => $resume, 'pour_alex' => true, 'pourquoi' => 'déjà plusieurs réponses envoyées : à Alex de prendre la suite']);
        aled08e_px_set($id, 'pour_alex', time());
        return new WP_REST_Response(['ok' => true, 'envoye' => false, 'pour_alex' => true, 'pourquoi' => 'Déjà plusieurs réponses : c’est Alex qui prend la suite (dans son bilan du soir).'], 200);
    }
    $refus = aled08e_px_reponse_refus($corps);
    if ($refus !== '') return new WP_Error('aled08_px', 'Réponse refusée : ' . $refus . '. Corrige, ou passe-la « pour_alex ».', ['status' => 400]);
    // la réponse, signée par la bande, dans la même conversation
    $hote = (string) wp_parse_url(home_url(), PHP_URL_HOST);
    $stop = aled08e_px_lien($id, 'stop');
    $sujet = 'Re: ' . preg_replace('/^(re\s*:\s*)+/i', '', (string) ($p['sujet'] ?: 'Votre site internet'));
    $texte = $corps . "\n\nBonne journée,\nLa bande des Minis Monstres\n" . $hote . "\n\n--\nPour ne plus rien recevoir : " . $stop;
    $html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15.5px;line-height:1.6;color:#2e2a47;">' . wpautop(make_clickable(esc_html($corps)))
        . '<p>Bonne journée,<br><b>La bande des Minis Monstres</b><br><a href="' . esc_url(home_url('/')) . '" style="color:#5b3fc4;">' . esc_html($hote) . '</a></p>'
        . '<p style="font-size:11.5px;color:#7a7795;">Pour ne plus rien recevoir : <a href="' . esc_url($stop) . '" style="color:#6a5bd6;">se désinscrire en un clic</a>.</p></div>';
    $ref = (string) aled08e_px_meta($id, 'msgid');
    $leur = preg_match('/^<[^<>\s]{3,250}>$/', (string) ($d['message_id'] ?? '')) ? (string) $d['message_id'] : '';
    $chaine = trim($ref . ' ' . $leur);
    $init = function ($m) use ($texte, $leur, $ref, $chaine) {
        $m->AltBody = $texte;
        if ($leur !== '' || $ref !== '') $m->addCustomHeader('In-Reply-To', $leur !== '' ? $leur : $ref);
        if ($chaine !== '') $m->addCustomHeader('References', $chaine);
    };
    $entetes = array_values(array_filter((array) aled08e_mail_headers('Les Minis Monstres <' . aled08e_px_reponse() . '>'), function ($e) { return stripos($e, 'content-type:') !== 0; }));
    $entetes[] = 'Content-Type: text/html; charset=UTF-8';
    $entetes[] = 'From: "Les Minis Monstres" <' . aled08e_px_expediteur() . '>';
    $entetes[] = 'List-Unsubscribe: <' . $stop . '>';
    add_action('phpmailer_init', $init, 20);
    $ok = wp_mail($p['email'], $sujet, $html, $entetes);
    remove_action('phpmailer_init', $init, 20);
    if (!$ok) return new WP_Error('aled08_px', 'Envoi impossible (messagerie du site) : passe-la « pour_alex ».', ['status' => 502]);
    // on note la réponse reçue (comme « repondu ») et ce qu'on a répondu
    if ($p['etat'] !== 'repondu') { aled08e_px_set($id, 'repondu_le', time()); aled08e_px_set($id, 'etat', 'repondu'); aled08e_px_stat('repondus'); }
    $avant = (string) aled08e_px_meta($id, 'reponse_avis');
    aled08e_px_set($id, 'reponse_avis', $avis);
    if ($avis === 'interesse' && $avant !== 'interesse') aled08e_px_stat('interesses');
    aled08e_px_stat('reponses_envoyees');
    aled08e_px_echange_noter($id, ['avis' => $avis, 'resume' => $resume, 'envoye' => true, 'reponse' => mb_substr($corps, 0, 600)]);
    aled08e_px_journal($id, 'A répondu (' . $avis . ') : ' . $resume . ' Réponse envoyée par la bande.');
    delete_transient('aled08e_px_appr');
    return new WP_REST_Response(['ok' => true, 'envoye' => true, 'a' => $p['email'], 'sujet' => $sujet], 200);
}
function aled08e_px_pour_alex($id, $p, $d) {
    $avis = sanitize_key((string) ($d['avis'] ?? 'question'));
    if (!in_array($avis, ['interesse', 'question', 'autre'], true)) $avis = 'question';
    $resume = aled08e_px_texte($d['resume'] ?? '', 400);
    if ($resume === '') return new WP_Error('aled08_px', 'Il manque « resume » : ce que la personne demande, en une ou deux phrases.', ['status' => 400]);
    if (in_array($p['etat'], ['envoye', 'relance'], true)) { aled08e_px_set($id, 'repondu_le', time()); aled08e_px_set($id, 'etat', 'repondu'); aled08e_px_stat('repondus'); }
    $avant = (string) aled08e_px_meta($id, 'reponse_avis');
    aled08e_px_set($id, 'reponse_avis', $avis);
    if ($avis === 'interesse' && $avant !== 'interesse') aled08e_px_stat('interesses');
    aled08e_px_set($id, 'pour_alex', time());
    aled08e_px_echange_noter($id, ['avis' => $avis, 'resume' => $resume, 'pour_alex' => true]);
    aled08e_px_journal($id, 'A répondu (' . $avis . ') : ' . $resume . ' Pour Alex (bilan du soir).');
    return new WP_REST_Response(['ok' => true, 'pour_alex' => true], 200);
}
/* Le résumé des réponses du jour, pour le bilan du soir */
function aled08e_px_bilan_reponses_lignes() {
    $l = []; $alex = [];
    $depuis = time() - DAY_IN_SECONDS;
    foreach (aled08e_px_liste(['etat' => ['repondu', 'commande', 'desinscrit'], 'limite' => 100, 'meta_key' => '_aled08_px_repondu_le', 'order' => 'DESC']) as $p) {
        $id = (int) $p['prospect'];
        foreach ((array) aled08e_px_meta($id, 'echanges', []) as $x) {
            if ((int) ($x['le'] ?? 0) < $depuis) continue;
            $qui = $p['entreprise'] . ($p['ville'] ? ' (' . $p['ville'] . ')' : '');
            if (!empty($x['pour_alex'])) $alex[] = '- ' . $qui . ' : ' . $x['resume'] . (!empty($x['pourquoi']) ? ' (' . $x['pourquoi'] . ')' : '') . "\n  Pour lui répondre : " . $p['email'];
            else $l[] = '- ' . $qui . ' : ' . $x['resume'] . "\n  Nous avons répondu : « " . mb_substr(preg_replace('/\s+/u', ' ', (string) $x['reponse']), 0, 220) . (mb_strlen((string) $x['reponse']) > 220 ? '…' : '') . ' »';
        }
    }
    return ['repondus' => $l, 'pour_alex' => $alex];
}

/* ====================================================================== 6. un envoi hors des heures, à la demande d'Alex */
/* Alex, 26 novembre 2026 au soir : « envoie la première fournée maintenant ». L'option aled08_px_envoi_force_jusqua (une heure,
 * en secondes) ouvre les envois jusqu'à cette heure-là, même hors de 8 h à 18 h en semaine. Le quota du jour reste le même. */
add_filter('aled08e_px_heure_ok', function ($ok, $t) {
    if ((int) get_option('aled08_px_envoi_force_jusqua', 0) > (int) $t) return true;
    return $ok && aled08e_px_creneau($t) !== null; // en semaine, et seulement pendant un des deux envois du jour
}, 10, 2);

/* ====================================================================== 7. deux envois par jour (Alex, 26 novembre 2026) */
/* « 20 le matin, 20 à 12 h 30 » : les premiers mails partent dans deux créneaux seulement, chacun avec son plafond (20 nouvelles
 * entreprises différentes, + 5 par jour d'envoi ; les relances passent en plus). Le Facteur
 * passe à 8 h 28 et à 12 h 28 pour envoyer ; ses autres passages vérifient les nouvelles entreprises et préparent les maquettes.
 * Réglage : option aled08_px_creneaux, [[heure de début, heure de fin, plafond], …] (heure de Paris). */
function aled08e_px_creneaux() {
    $c = get_option('aled08_px_creneaux', [[8, 10, 20], [12, 14, 20]]);
    $out = [];
    foreach ((array) $c as $x) if (is_array($x) && count($x) >= 3) $out[] = [(int) $x[0], (int) $x[1], max(0, (int) $x[2])];
    return $out;
}
/* Le créneau en cours à l'heure $t : [début, fin, plafond] avec ses bornes en secondes, ou null */
function aled08e_px_creneau($t = null) {
    $t = (int) ($t ?? time());
    $h = (int) wp_date('G', $t);
    foreach (aled08e_px_creneaux() as $c) if ($h >= $c[0] && $h < $c[1]) {
        $j = new DateTime('@' . $t); $j->setTimezone(wp_timezone());
        $deb = (clone $j)->setTime($c[0], 0, 0)->getTimestamp();
        $fin = (clone $j)->setTime($c[1], 0, 0)->getTimestamp();
        return ['de' => $deb, 'a' => $fin, 'max' => $c[2]];
    }
    return null;
}
/* Le plafond d'un envoi aujourd'hui : 20 le premier jour, puis 5 de plus par jour d'envoi (Alex, 26 novembre 2026 : « on
 * augmente de 5 tous les jours »), jusqu'à la moitié du plafond du jour (aled08_prospection_quota_max, 150 : 75 par envoi). */
function aled08e_px_jours_envoi($now = null) {
    $premier = (int) get_option('aled08_prospection_premier_envoi', 0);
    if (!$premier) return 0;
    // la montée part du premier jour des deux envois (vendredi 27 novembre 2026 : 20 + 20), pas de la fournée d'essai de la veille
    $premier = max($premier, (int) get_option('aled08_px_rampe_debut', 1795734000));
    $d = new DateTime('@' . $premier); $d->setTimezone(wp_timezone()); $d->setTime(0, 0, 0);
    $fin = new DateTime('@' . (int) ($now ?? time())); $fin->setTimezone(wp_timezone()); $fin->setTime(0, 0, 0);
    $n = 0;
    while ($d < $fin) { $d->modify('+1 day'); if ((int) $d->format('N') <= 5) $n++; }
    return $n;
}
function aled08e_px_plafond_creneau($base, $now = null) {
    $nb = max(1, count(aled08e_px_creneaux()));
    $max = (int) floor(max($base, (int) get_option('aled08_prospection_quota_max', 150)) / $nb);
    return (int) min($max, $base + (int) get_option('aled08_px_hausse_jour', 5) * aled08e_px_jours_envoi($now));
}
/* Les premiers mails envoyés entre deux instants (les relances ne comptent pas) */
function aled08e_px_premiers_entre($de, $a) {
    return count(array_filter(array_map('intval', (array) get_option('aled08_prospection_premiers', [])), function ($t) use ($de, $a) { return $t >= $de && $t < $a; }));
}
add_filter('aled08e_px_quota_jour', function ($q, $now = null) {
    $c = aled08e_px_creneaux();
    if (!$c) return $q;
    $t = 0; foreach ($c as $x) $t += aled08e_px_plafond_creneau($x[2], $now);
    return $t;
}, 10, 2);
add_filter('aled08e_px_quota_restant', function ($r) {
    if (!aled08e_px_creneaux()) return $r;
    $minuit = (new DateTime('today', wp_timezone()))->getTimestamp();
    $jour = max(0, aled08e_px_quota_jour() - aled08e_px_premiers_entre($minuit, $minuit + DAY_IN_SECONDS));
    if ((int) get_option('aled08_px_envoi_force_jusqua', 0) > time()) return $jour;
    $c = aled08e_px_creneau();
    if (!$c) return $jour;
    return max(0, min($jour, aled08e_px_plafond_creneau($c['max']) - aled08e_px_premiers_entre($c['de'], $c['a'])));
});
/* Avec deux envois et leurs plafonds, la limite de 30 par heure ne sert plus (elle bloquerait les relances) : 200 par heure au plus */
add_filter('aled08e_px_heure_max', function ($m) { return aled08e_px_creneaux() ? 200 : $m; });
