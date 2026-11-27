<?php
/**
 * Les Minis Monstres Espace client : la suite de la prospection par e-mail (décision d'Alex, 25 novembre 2026, soir :
 * « le plus automatique possible »). Ce fichier complète includes/prospection.php.
 *
 *   1. L'APERÇU PERSONNALISÉ. Pour les meilleurs prospects (note de 80 ou plus, data.json « prospection.apercuNote »), le
 *      mail a un bouton « Voir l'aperçu de votre site » : une page à leur nom (/?lmm_apercu=…, lien signé, jamais dans
 *      Google). Rien d'inventé : le nom, le métier et la ville viennent de l'annuaire, tout le reste est marqué comme
 *      un emplacement à remplir (« Ici, vos services »).
 *   2. CE QUI MARCHE. Les résultats par métier, par département et par type de sujet (clics, réponses, intéressés,
 *      commandes, refus) : le Repéreur va d'abord vers le métier qui répond le mieux (deux zones sur trois), le Facteur
 *      sait quel type de sujet marche.
 *   3. LE RÉPONDEUR (troisième agent, tâche planifiée avec Gmail). Il lit les réponses arrivées à l'adresse des réponses :
 *      il désinscrit tout seul ceux qui disent stop, note les adresses fausses, classe les réponses et prépare pour Alex un
 *      BROUILLON de réponse dans Gmail. Il n'envoie jamais de réponse lui-même : c'est Alex qui l'envoie, en un geste.
 *   4. LE DÉBRIEF DU SOIR. Chaque jour de semaine à 18 h 15 (heure de Paris), Alex reçoit un e-mail : combien de mails
 *      sont partis, combien ont cliqué, répondu, refusé, combien d'adresses fausses, de commandes, et ce qui l'attend.
 *   5. LA PAUSE AUTOMATIQUE. Trop de refus (plus de 5 % de désinscriptions) ou trop d'adresses fausses (plus de 8 %) sur
 *      7 jours et au moins 40 envois : la prospection s'éteint toute seule et Alex est prévenu. Lui seul la rallume.
 */
defined('ABSPATH') || exit;

/* ====================================================================== 1. l'aperçu personnalisé */
function aled08e_px_apercu_ok($id) { return $id && (int) aled08e_px_meta($id, 'note', 0) >= aled08e_px_offre()['apercu_note']; }
function aled08e_px_apercu_lien($id) {
    if (!$id) return add_query_arg('lmm_apercu', 'exemple', home_url('/'));
    return add_query_arg('lmm_apercu', (int) $id . '-' . aled08e_px_signe($id, 'apercu'), home_url('/'));
}
/* L'aperçu d'un essai : l'entreprise d'exemple est gardée 7 jours derrière un jeton tiré au hasard (pas de nom dans l'adresse :
 * personne ne peut fabriquer une page à nos couleurs avec le nom qu'il veut) */
function aled08e_px_apercu_essai($p, $m) {
    $jeton = strtolower(wp_generate_password(20, false, false));
    set_transient('aled08e_px_apx_' . $jeton, ['entreprise' => (string) ($p['entreprise'] ?? ''), 'metier' => (string) ($p['metier'] ?? ''), 'ville' => (string) ($p['ville'] ?? ''), 'points' => (array) ($m['points'] ?? [])], 7 * DAY_IN_SECONDS);
    return add_query_arg('lmm_apercu', 'essai-' . $jeton, home_url('/'));
}
/* Cinq habillages : deux entreprises ne reçoivent pas forcément le même aperçu (règle « jamais deux sites pareils ») */
function aled08e_px_apercu_habillage($nom) {
    $h = [
        ['fond' => '#fff8f2', 'doux' => '#e8e0ff', 'vif' => '#5b3fc4', 'encre' => '#2e2a47', 'rayon' => '26px', 'police' => 'Georgia, "Times New Roman", serif'],
        ['fond' => '#f4fbf7', 'doux' => '#d5f5e8', 'vif' => '#176a4c', 'encre' => '#1f2d27', 'rayon' => '14px', 'police' => '"Trebuchet MS", Verdana, sans-serif'],
        ['fond' => '#f6f9ff', 'doux' => '#ddeeff', 'vif' => '#2c67ae', 'encre' => '#1d2a3d', 'rayon' => '8px', 'police' => 'Arial, Helvetica, sans-serif'],
        ['fond' => '#fffaf0', 'doux' => '#fff1c2', 'vif' => '#8a5a00', 'encre' => '#33290f', 'rayon' => '22px', 'police' => 'Georgia, "Times New Roman", serif'],
        ['fond' => '#fff7f4', 'doux' => '#ffe4d6', 'vif' => '#9c4220', 'encre' => '#3a231a', 'rayon' => '18px', 'police' => '"Trebuchet MS", Verdana, sans-serif'],
    ];
    return $h[abs(crc32((string) $nom)) % count($h)];
}
function aled08e_px_apercu_html($p, $liens) {
    $e = function ($t) { return esc_html((string) $t); };
    $nom = (string) $p['entreprise'];
    $metier = (string) ($p['metier'] ?? '');
    $metier = $metier !== '' ? mb_strtoupper(mb_substr($metier, 0, 1)) . mb_substr($metier, 1) : '';
    $ville = (string) ($p['ville'] ?? '');
    $H = aled08e_px_apercu_habillage($nom);
    $prix = aled08e_px_prix();
    $lanc = aled08e_px_lancement();
    $offre = aled08e_euro_txt($prix['prix']) . ' la création' . ($lanc ? ', prix de lancement jusqu’au ' . $lanc['jusquau'] . ' (ensuite ' . aled08e_euro_txt($lanc['normal']) . ')' : '') . '.';
    $points = array_slice((array) ($p['points'] ?? []), 0, 3);
    $css = 'body{margin:0;background:' . $H['fond'] . ';color:' . $H['encre'] . ';font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.6}'
        . '*{box-sizing:border-box}a{color:inherit}'
        . '.bandeau{position:sticky;top:0;z-index:5;background:#2e2a47;color:#fff;padding:10px 16px;font-size:14px;line-height:1.45;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:center;text-align:center}'
        . '.bandeau b{color:#ffe28a}.bandeau a{display:inline-block;background:#7ad9b0;color:#12392a;font-weight:bold;text-decoration:none;padding:8px 16px;border-radius:999px;white-space:nowrap}'
        . '.page{max-width:980px;margin:0 auto;padding:0 18px 40px}'
        . '.tete{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 20px;padding:18px 0}'
        . '.tete strong{font-family:' . $H['police'] . ';font-size:22px}.menu{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:15px;font-weight:bold}'
        . '.hero{background:' . $H['doux'] . ';border-radius:' . $H['rayon'] . ';padding:44px 26px;margin:6px 0 30px}'
        . '.hero h1{margin:0 0 10px;font-family:' . $H['police'] . ';font-size:clamp(32px,7vw,56px);line-height:1.08}'
        . '.hero p{margin:0 0 20px;font-size:20px}.faux{display:inline-block;background:' . $H['vif'] . ';color:#fff;font-weight:bold;padding:12px 22px;border-radius:999px;margin:0 8px 8px 0}'
        . '.faux.clair{background:#fff;color:' . $H['vif'] . ';border:2px solid ' . $H['vif'] . '}'
        . 'h2{font-family:' . $H['police'] . ';font-size:26px;line-height:1.2;margin:34px 0 14px}'
        . '.grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:14px}'
        . '.carte{background:#fff;border:2px solid ' . $H['doux'] . ';border-radius:' . $H['rayon'] . ';padding:18px}.carte b{display:block;margin-bottom:4px}'
        . '.vide{border:2px dashed ' . $H['vif'] . ';background:transparent;color:' . $H['vif'] . '}.vide small{display:block;color:' . $H['encre'] . ';font-size:14.5px;line-height:1.5}'
        . '.photo{min-height:150px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:bold}'
        . '.fin{background:#2e2a47;color:#fff;border-radius:' . $H['rayon'] . ';padding:30px 24px;margin:40px 0 18px;text-align:center}'
        . '.fin h2{margin:0 0 8px;color:#fff}.fin p{margin:0 0 18px}.fin a{display:inline-block;margin:0 6px 10px;padding:13px 22px;border-radius:999px;font-weight:bold;text-decoration:none}'
        . '.fin .oui{background:#7ad9b0;color:#12392a}.fin .voir{background:#fff;color:#2e2a47}'
        . '.pied{font-size:12.5px;line-height:1.5;color:#6b6789;text-align:center}';
    $h = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive">'
        . '<title>' . $e($nom) . ' : un aperçu de votre site · Les Minis Monstres</title><style>' . $css . '</style></head><body>'
        . '<div class="bandeau"><span>Aperçu préparé pour <b>' . $e($nom) . '</b> par Les Minis Monstres. Ce n’est pas encore votre site : c’est à quoi il pourrait ressembler.</span><a href="' . esc_url($liens['creer']) . '">Je veux ce site</a></div>'
        . '<div class="page">'
        . '<div class="tete"><strong>' . $e($nom) . '</strong><div class="menu" aria-hidden="true"><span>Accueil</span><span>Services</span><span>Photos</span><span>Contact</span></div></div>'
        . '<div class="hero"><h1>' . $e($nom) . '</h1><p>' . $e(trim($metier . ($ville !== '' ? ' à ' . $ville : ''))) . '</p><span class="faux" aria-hidden="true">Nous contacter</span><span class="faux clair" aria-hidden="true">Voir nos services</span></div>';
    if ($points) {
        $h .= '<h2>Ce que ce site ferait pour vous</h2><div class="grille">';
        foreach ($points as $pt) $h .= '<div class="carte"><b>' . $e(($pt['icone'] ?? '') . ' ' . ($pt['titre'] ?? '')) . '</b>' . $e($pt['texte'] ?? '') . '</div>';
        $h .= '</div>';
    }
    $h .= '<h2>Vos services</h2><div class="grille">'
        . '<div class="carte vide"><b>Votre premier service</b><small>Vous nous dites ce que vous proposez, on l’écrit ici, avec vos mots.</small></div>'
        . '<div class="carte vide"><b>Votre deuxième service</b><small>Avec vos tarifs, si vous voulez les afficher.</small></div>'
        . '<div class="carte vide"><b>Votre spécialité</b><small>Ce qui fait qu’on vient chez vous plutôt qu’ailleurs.</small></div></div>'
        . '<h2>Vos photos</h2><div class="grille">'
        . '<div class="carte vide photo">Votre plus belle photo</div><div class="carte vide photo">Votre travail</div><div class="carte vide photo">Votre équipe, votre lieu</div></div>'
        . '<h2>Vous trouver, vous écrire</h2><div class="grille">'
        . '<div class="carte vide"><b>Vos horaires</b><small>Toujours à jour : vous les changez vous-même en une minute.</small></div>'
        . '<div class="carte vide"><b>Votre adresse et un plan</b><small>Pour venir chez vous sans chercher.</small></div>'
        . '<div class="carte vide"><b>Un formulaire de contact</b><small>Vos clients vous écrivent, même quand vous êtes occupé.</small></div></div>'
        . '<div class="fin"><h2>Ce site peut être en ligne en moins d’une semaine</h2><p>Avec vos textes, vos photos et vos couleurs. ' . $e($offre) . ' Le site est à vous.</p>'
        . '<a class="oui" href="' . esc_url($liens['creer']) . '">Créer mon site</a><a class="voir" href="' . esc_url($liens['demo']) . '">Essayer la démo</a></div>'
        . '<p class="pied">' . $e(aled08e_px_identite()) . ' <a href="' . esc_url($liens['stop']) . '">Ne plus recevoir de message</a>.</p>'
        . '</div></body></html>';
    return $h;
}
add_action('init', function () {
    if (!isset($_GET['lmm_apercu'])) return;
    $v = (string) wp_unslash($_GET['lmm_apercu']);
    $p = null; $id = 0;
    if ($v === 'exemple') {
        $ex = aled08e_px_exemple();
        $p = ['entreprise' => $ex['entreprise'], 'metier' => 'Boulangerie', 'ville' => 'Charleville-Mézières', 'points' => $ex['morceaux']['points']];
    } elseif (preg_match('/^essai-([a-z0-9]{20})$/', $v, $mm)) {
        $t = get_transient('aled08e_px_apx_' . $mm[1]);
        if (is_array($t) && !empty($t['entreprise'])) $p = $t;
    } else {
        $j = aled08e_px_lire_jeton($v, false);
        if ($j && hash_equals(aled08e_px_signe($j['id'], 'apercu'), $j['sig']) && ($x = aled08e_px_get($j['id'])) && !in_array($x['etat'], ['desinscrit', 'ecarte'], true)) {
            $id = (int) $j['id'];
            $m = (array) aled08e_px_meta($id, 'morceaux', []);
            $p = ['entreprise' => $x['entreprise'], 'metier' => $x['metier'], 'ville' => $x['ville'], 'points' => (array) ($m['points'] ?? [])];
        }
    }
    nocache_headers();
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    if (!$p) { wp_safe_redirect(home_url('/'), 302); exit; }
    if ($id) {
        // la visite compte comme un clic (jamais celle d'un robot de messagerie)
        $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
        $robot = ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' || $ua === '' || preg_match('/bot|crawl|spider|preview|scan|safelinks|proofpoint|mimecast|barracuda|curl|wget|python|headless/i', $ua);
        if (!$robot) {
            $l = (array) aled08e_px_meta($id, 'clics', []);
            $l[] = ['vers' => 'apercu', 'le' => wp_date('Y-m-d H:i')];
            aled08e_px_set($id, 'clics', array_slice($l, -20));
            aled08e_px_set($id, 'nb_clics', (int) aled08e_px_meta($id, 'nb_clics', 0) + 1);
            aled08e_px_stat('clics_apercu');
            delete_transient('aled08e_px_appr');
        }
    }
    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    // la maquette type de son métier, à son nom (prospection-plus.php) ; sinon l'aperçu simple
    $g = function_exists('aled08e_mq_pour') ? aled08e_mq_pour((string) ($p['metier'] ?? '')) : '';
    $mq = $g !== '' ? aled08e_mq_rendre($g, $p, aled08e_px_liens($id)) : '';
    if ($mq !== '') {
        header("Content-Security-Policy: script-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'");
        echo $mq; // phpcs:ignore
        exit;
    }
    echo aled08e_px_apercu_html($p, aled08e_px_liens($id)); // phpcs:ignore
    exit;
}, 2);

/* ====================================================================== 1 bis. la position sur Google */
/* Le site mesure lui-même, par le service Serper (les résultats de Google, en France et en français), où l'entreprise apparaît
 * quand on tape la recherche que le Repéreur a notée (« coiffeur Signy-l'Abbaye »). Jamais un chiffre donné par un agent :
 * Google refuse les recherches faites par un programme, un agent ne peut pas le voir lui-même. Sans clé, rien n'est mesuré. */
function aled08e_px_mesurer($id) {
    $cle = trim((string) get_option('aled08_prospection_serper', ''));
    if ($cle === '') return null;
    $q = trim((string) aled08e_px_meta($id, 'recherche'));
    if ($q === '') $q = trim(aled08e_px_meta($id, 'metier') . ' ' . aled08e_px_meta($id, 'ville'));
    if ($q === '') return null;
    $r = wp_remote_post('https://google.serper.dev/search', ['timeout' => 20, 'headers' => ['X-API-KEY' => $cle, 'Content-Type' => 'application/json'],
        'body' => wp_json_encode(['q' => $q, 'gl' => 'fr', 'hl' => 'fr', 'num' => 50])]);
    if (is_wp_error($r) || (int) wp_remote_retrieve_response_code($r) !== 200) { aled08e_px_journal($id, 'Position sur Google : mesure impossible (service indisponible ou clé refusée).'); return null; }
    $d = json_decode((string) wp_remote_retrieve_body($r), true);
    if (!is_array($d) || !isset($d['organic']) || !is_array($d['organic'])) return null;
    $res = aled08e_px_reperer($d['organic'], (string) get_the_title($id), (string) aled08e_px_meta($id, 'url_source'), (string) aled08e_px_meta($id, 'site_actuel'));
    $c = ['recherche' => $q, 'position' => $res['position'], 'regardes' => max(10, count($d['organic'])), 'trouve' => $res['trouve'], 'url' => $res['url'], 'le' => time()];
    aled08e_px_set($id, 'constat', $c);
    aled08e_px_journal($id, 'Position sur Google pour « ' . $q . ' » : ' . ($c['position'] ? $c['position'] . 'e (' . $c['trouve'] . ')' : 'absent des ' . $c['regardes'] . ' premiers résultats') . '.');
    return $c;
}
/* Dans les résultats : la première page qui est à l'entreprise (sa page Facebook, sa fiche, son ancien site, ou un titre à son nom) */
function aled08e_px_reperer($organic, $nom, $source, $site) {
    $norm = function ($u) { $h = strtolower((string) wp_parse_url((string) $u, PHP_URL_HOST)); return preg_replace('/^(www|m|fr-fr|fr)\./', '', $h) . rtrim(strtolower((string) wp_parse_url((string) $u, PHP_URL_PATH)), '/'); };
    $cibles = array_values(array_filter([$source !== '' ? $norm($source) : '', $site !== '' ? $norm($site) : '']));
    $mots = aled08e_px_mots($nom);
    foreach (array_values($organic) as $i => $o) {
        $lien = (string) ($o['link'] ?? '');
        $n = $norm($lien);
        $ok = false;
        foreach ($cibles as $c) if ($c !== '' && strlen($c) > 6 && strpos($n, $c) === 0) $ok = true;
        if (!$ok && $mots) {
            $titre = strtolower(remove_accents((string) ($o['title'] ?? '')));
            $tous = true;
            foreach ($mots as $m) if (strpos($titre, $m) === false) $tous = false;
            $ok = $tous;
        }
        if ($ok) return ['position' => (int) ($o['position'] ?? $i + 1), 'trouve' => aled08e_px_trouve_libelle($lien), 'url' => $lien];
    }
    return ['position' => 0, 'trouve' => '', 'url' => ''];
}
function aled08e_px_trouve_libelle($url) {
    $h = strtolower((string) wp_parse_url((string) $url, PHP_URL_HOST));
    if (preg_match('/(^|\.)facebook\.com$/', $h)) return 'votre page Facebook';
    if (preg_match('/(^|\.)instagram\.com$/', $h)) return 'votre compte Instagram';
    if (preg_match('/(^|\.)pagesjaunes\.fr$/', $h)) return 'votre fiche PagesJaunes';
    if (preg_match('/(^|\.)google\./', $h)) return 'votre fiche Google';
    return 'une page à votre nom';
}
function aled08e_px_ordinal($n) { return (int) $n === 1 ? '1re' : (int) $n . 'e'; }
/* Les quatre lignes du bloc « Nous avons fait le test » : la recherche, le résultat, ce que ça veut dire, la proposition */
function aled08e_px_constat_lignes($c, $nom) {
    $q = (string) $c['recherche'];
    $pos = (int) $c['position'];
    $quand = !empty($c['le']) ? 'Le ' . wp_date('j F', (int) $c['le']) . ', nous' : 'Nous';
    $l1 = $quand . ' avons tapé « ' . $q . ' » sur Google.';
    if ($pos <= 0) return [$l1, $nom . ' n’apparaît dans aucun des ' . (int) ($c['regardes'] ?? 50) . ' premiers résultats.', 'Ceux qui font cette recherche trouvent d’autres noms, mais pas le vôtre : pour eux, c’est comme si vous n’existiez pas encore.', 'Envie d’y apparaître, avec votre propre site ? C’est notre métier.'];
    $qui = mb_strtoupper(mb_substr((string) $c['trouve'], 0, 1)) . mb_substr((string) $c['trouve'], 1);
    if ($pos <= 10) return [$l1, $qui . ' arrive en ' . aled08e_px_ordinal($pos) . ' position : bravo, c’est la première page !', 'Mais vos clients y trouvent ' . $c['trouve'] . ', pas votre vitrine à vous, avec vos tarifs et vos photos.', 'Envie que ce soit votre propre site qu’ils voient ? C’est notre métier.'];
    $page = (int) ceil($pos / 10);
    return [$l1, $qui . ' arrive en ' . aled08e_px_ordinal($pos) . ' position, sur la ' . aled08e_px_ordinal($page) . ' page des résultats.', 'Or la plupart des gens ne regardent que la première page : ceux qui font cette recherche trouvent d’abord ' . ($pos - 1) . ' autres résultats avant le vôtre.', 'Envie de vous rapprocher de la première page, avec votre propre site ? C’est notre métier.'];
}
/* Pour la relance et les agents : la mesure en une phrase */
function aled08e_px_constat_court($c, $nom) {
    $pos = (int) $c['position'];
    if ($pos <= 0) return $nom . ' n’apparaissait dans aucun des ' . (int) ($c['regardes'] ?? 50) . ' premiers résultats';
    return (string) $c['trouve'] . ' arrivait en ' . aled08e_px_ordinal($pos) . ' position' . ($pos > 10 ? ', sur la ' . aled08e_px_ordinal((int) ceil($pos / 10)) . ' page' : '');
}
function aled08e_px_constat_txt($c, $nom) { return 'En tapant « ' . $c['recherche'] . ' » sur Google, ' . aled08e_px_constat_court($c, $nom) . '.'; }

/* ====================================================================== 1 ter. un nom de domaine libre, à son nom */
/* Le nom de domaine reprend le nom ENTIER de l'entreprise, tous ses mots dans l'ordre, « de », « du », « et » compris
 * (Alex, 25 novembre 2026 : un domaine qui perd un mot, comme fabriquereve.fr pour « Fabrique de Rêve », ne doit jamais
 * arriver). Seuls tombent l'article du début (« La », « L’ ») et la forme juridique (SARL, EI…). Sans accent : un accent
 * dans une adresse se tape mal et passe mal dans les e-mails.
 * L'ordre (Alex : « ça fait plus joli ») : fabrique-de-reve.fr, fabriquedereve.fr, la-fabrique-de-reve.fr,
 * fabrique-de-reve-pourcy.fr, fabrique-de-reve.com. Le premier libre, vérifié auprès du registre officiel (RDAP : l'AFNIC
 * pour les .fr, includes/commandes.php). */
function aled08e_px_domaine_mots($t, $nom = true) {
    $t = strtolower(remove_accents(str_replace('’', "'", trim((string) $t))));
    if ($nom) $t = preg_replace("/^(?:(?:le|la|les)\s+|l')/", '', $t);      // l'article du début seulement
    $t = str_replace("'", '', $t);                                              // l'élision se colle : d'or → dor, l'abbaye → labbaye
    $l = preg_split('/[^a-z0-9]+/', $t, -1, PREG_SPLIT_NO_EMPTY);
    $formes = ['sarl', 'sas', 'sasu', 'eurl', 'ei', 'eirl', 'snc', 'sci', 'scop', 'ets', 'etablissements'];
    return array_values(array_filter($l, function ($m) use ($formes) { return !in_array($m, $formes, true); }));
}
/* Vrai si le domaine contient tous les mots du nom, dans l'ordre, sans en sauter un : le garde-fou, vérifié partout */
function aled08e_px_domaine_fidele($domaine, $nom) {
    $m = aled08e_px_domaine_mots($nom);
    if (!$m) return false;
    $label = str_replace('-', '', strtolower(preg_replace('/\.(fr|com)$/', '', (string) $domaine)));
    return strpos($label, implode('', $m)) !== false;
}
function aled08e_px_domaine_candidats($nom, $ville = '', $article = '') {
    $m = aled08e_px_domaine_mots($nom);
    if (!$m) return [];
    $tiret = implode('-', $m);
    $colle = implode('', $m);
    $v = aled08e_px_domaine_mots($ville, false);
    $art = str_replace("'", '’', (string) $article);
    $c = [$tiret . '.fr', $colle . '.fr'];
    if ($art === 'la' || $art === 'le' || $art === 'les') $c[] = $art . '-' . $tiret . '.fr';
    if ($art === 'l’') $c[] = 'l' . $tiret . '.fr';
    if ($v) $c[] = $tiret . '-' . implode('-', $v) . '.fr';
    $c[] = $tiret . '.com';
    // une forme correcte (lettres, chiffres, tirets ; 3 à 50 caractères), sans doublon, et jamais un mot en moins
    return array_values(array_unique(array_filter($c, function ($d) use ($nom) {
        return (bool) preg_match('/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])\.(fr|com)$/', $d) && strpos($d, '--') === false && aled08e_px_domaine_fidele($d, $nom);
    })));
}
function aled08e_px_domaine_trouver($nom, $ville = '', $article = '') {
    if (!function_exists('aled08e_rdap_statut')) return '';
    foreach (array_slice(aled08e_px_domaine_candidats($nom, $ville, $article), 0, 5) as $d) if (aled08e_rdap_statut($d) === 'libre') return $d;
    return '';
}

/* ====================================================================== 2. ce qui marche */
/* Les résultats de tous les mails envoyés, rangés par métier, département, type de sujet et entreprise récente ou non.
 * La note d'un groupe (à partir de 10 envois) : clics + 5 × intéressés + 20 × commandes − 4 × refus, pour 100 envois. */
function aled08e_px_apprentissage() {
    $c = get_transient('aled08e_px_appr');
    if (is_array($c)) return $c;
    $ids = get_posts(['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => 3000, 'fields' => 'ids', 'suppress_filters' => true, 'orderby' => 'ID', 'order' => 'DESC',
        'meta_query' => [['key' => '_aled08_px_envoye_le', 'compare' => 'EXISTS']]]);
    $g = ['metier' => [], 'departement' => [], 'sujet' => [], 'recente' => []];
    $vide = ['envois' => 0, 'clics' => 0, 'reponses' => 0, 'interesses' => 0, 'refus' => 0, 'commandes' => 0];
    foreach ($ids as $id) {
        $etat = (string) aled08e_px_meta($id, 'etat');
        $cr = (array) aled08e_px_meta($id, 'criteres', []);
        $cles = ['metier' => (string) aled08e_px_meta($id, 'metier_page', '') ?: 'autre', 'departement' => (string) aled08e_px_meta($id, 'departement', '') ?: '?',
            'sujet' => (string) aled08e_px_meta($id, 'sujet_type', '') ?: 'non_precise', 'recente' => !empty($cr['creation_recente']) ? 'oui' : 'non'];
        $f = ['envois' => 1, 'clics' => (int) aled08e_px_meta($id, 'nb_clics', 0) > 0 ? 1 : 0, 'reponses' => aled08e_px_meta($id, 'repondu_le', 0) ? 1 : 0,
            'interesses' => aled08e_px_meta($id, 'reponse_avis') === 'interesse' ? 1 : 0, 'refus' => ($etat === 'desinscrit' || aled08e_px_meta($id, 'reponse_avis') === 'pas_interesse') ? 1 : 0,
            'commandes' => aled08e_px_meta($id, 'commande', 0) ? 1 : 0];
        foreach ($cles as $axe => $k) { $g[$axe][$k] = $g[$axe][$k] ?? $vide; foreach ($f as $x => $v) $g[$axe][$k][$x] += $v; }
    }
    foreach ($g as $axe => $l) {
        foreach ($l as $k => $x) $g[$axe][$k]['note'] = $x['envois'] >= 10 ? (int) round(($x['clics'] + 5 * $x['interesses'] + 20 * $x['commandes'] - 4 * $x['refus']) * 100 / $x['envois']) : null;
        uasort($g[$axe], function ($a, $b) { return [$b['note'] ?? -9999, $b['envois']] <=> [$a['note'] ?? -9999, $a['envois']]; });
    }
    $out = ['envois' => count($ids)] + $g;
    set_transient('aled08e_px_appr', $out, 3 * HOUR_IN_SECONDS);
    return $out;
}
/* Le métier qui répond le mieux ('' tant qu'on ne sait pas : il faut au moins deux métiers notés, et une note positive) */
function aled08e_px_meilleur_metier() {
    $m = array_filter(aled08e_px_apprentissage()['metier'], function ($x, $k) { return $x['note'] !== null && $k !== 'autre'; }, ARRAY_FILTER_USE_BOTH);
    if (count($m) < 2) return '';
    $k = (string) array_key_first($m);
    return $m[$k]['note'] > 0 ? $k : '';
}
/* Le résumé pour les agents et pour Alex : les trois premiers de chaque rangement, en clair */
function aled08e_px_ce_qui_marche() {
    $a = aled08e_px_apprentissage();
    $top = function ($l) {
        $out = [];
        foreach (array_slice(array_filter($l, function ($x) { return $x['note'] !== null; }), 0, 3, true) as $k => $x) $out[] = ['quoi' => (string) $k] + $x;
        return $out;
    };
    $sujets = $top($a['sujet']);
    return ['mails_comptes' => (int) $a['envois'], 'metiers' => $top($a['metier']), 'departements' => $top($a['departement']), 'types_de_sujet' => $sujets, 'entreprises_recentes' => $a['recente'],
        'conseil' => $a['envois'] < 30 ? 'Pas encore assez de mails pour savoir ce qui marche : variez les types de sujet (question, constat, benefice, local).'
            : ($sujets ? 'Le type de sujet qui marche le mieux : « ' . $sujets[0]['quoi'] . ' ». Gardez-en un sur quatre d’un autre type, pour continuer d’apprendre.' : 'Donnez toujours « sujet_type » à l’envoi : c’est ce qui permet d’apprendre.')];
}

/* ====================================================================== 3. le poste du Répondeur */
/* Ce que le Répondeur a le droit de dire : des faits tirés de la configuration du site, jamais un chiffre écrit à la main */
function aled08e_px_faits() {
    $D = aled08e_data();
    $prix = aled08e_px_prix();
    $lanc = aled08e_px_lancement();
    $mini = null;
    foreach ((array) ($D['forfaits'] ?? []) as $f) if (($f['id'] ?? '') === 'base') $mini = $f;
    $f = ['offre' => aled08e_px_offre_txt(), 'creation' => aled08e_euro_txt($prix['prix']) . ' la création du Site Essentiel' . ($lanc ? ' (prix de lancement jusqu’au ' . $lanc['jusquau'] . ', puis ' . aled08e_euro_txt($lanc['normal']) . ')' : ''),
        'delai' => 'Le site est en ligne en moins d’une semaine après le questionnaire rempli.',
        'propriete' => 'Le site appartient au client : il peut le télécharger quand il veut depuis son espace client. Le nom de domaine est à son nom.',
        'espace_client' => 'Un espace client pour tout suivre, modifier son site soi-même et demander des modifications ; des mini-tutos gratuits expliquent chaque étape.',
        'liens' => ['site' => home_url('/'), 'tarifs' => home_url('/tarifs/'), 'demo' => home_url('/mon-espace/demo/'), 'creer' => home_url('/creer-mon-site/'), 'questions' => home_url('/faq/'), 'contact' => home_url('/contact/')]];
    if (!empty($D['creation']['ecommerce'])) $f['boutique'] = 'Option boutique en ligne : + ' . aled08e_euro_txt((float) $D['creation']['ecommerce']) . '.';
    if ($mini) $f['forfait'] = 'Ensuite, au choix : le forfait ' . ($mini['name'] ?? 'Mini') . ' à ' . aled08e_euro_txt((float) ($mini['month'] ?? 0)) . ' par mois, sans engagement (hébergement, sécurité, sauvegardes, maintenance, modifications incluses), ou rien du tout : le client héberge son site lui-même.';
    if (!empty($D['fractionne']['fois'])) $f['paiement'] = 'Paiement possible en ' . $D['fractionne']['fois'] . ' fois' . (!empty($D['fractionne']['organismes']) ? ' avec ' . $D['fractionne']['organismes'] : '') . '.';
    return $f;
}
function aled08e_px_poste_repondeur() {
    $out = ['agent' => 'repondeur'];
    $recents = get_posts(['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => 1, 'fields' => 'ids', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_px_envoye_le', 'value' => time() - 45 * DAY_IN_SECONDS, 'compare' => '>', 'type' => 'NUMERIC']]]);
    if (!$recents) return $out + ['rien_a_faire' => true, 'pourquoi' => 'Aucun mail de prospection envoyé depuis 45 jours : pas de réponse à attendre.'];
    $adr = aled08e_px_reponse();
    $exp = aled08e_px_expediteur();
    $out['rien_a_faire'] = false;
    $out['travail'] = [
        'adresse_reponses' => $adr, 'adresse_envoi' => $exp, 'etiquette_gmail' => 'LMM-traite',
        'recherches_gmail' => [
            'reponses' => 'to:' . $adr . ' newer_than:5d -label:LMM-traite -from:' . $exp,
            'adresses_fausses' => 'from:(mailer-daemon OR postmaster) newer_than:5d -label:LMM-traite',
        ],
        'faits' => aled08e_px_faits(),
        'en_attente_de_reponse' => (int) (aled08e_px_compteurs()['par_etat']['envoye'] ?? 0) + (int) (aled08e_px_compteurs()['par_etat']['relance'] ?? 0),
    ];
    $out['fiche_de_poste'] = aled08e_regles_texte('agent-repondeur');
    $out['a_lire_ensuite'] = 'Lisez aussi GET /aled08/v1/atelier/regles?fichier=prospection (les garde-fous) et ?fichier=offre (ce que nous vendons).';
    $out['memoire'] = ['decisions_et_lecons' => function_exists('aled08e_memoire_lire') ? aled08e_memoire_lire(['type' => ['decision', 'lecon'], 'limite' => 40]) : []];
    return $out;
}

/* ====================================================================== 4. le débrief du soir */
function aled08e_px_debrief_texte() {
    $r = aled08e_px_resume();
    $j = aled08e_px_stats_sur(1);
    $s = $r['semaine'];
    $t = $r['total'];
    $n = function ($x, $un, $plusieurs) { return (int) $x . ' ' . ((int) $x > 1 ? $plusieurs : $un); };
    $clics = (int) $j['clics_demo'] + (int) $j['clics_apercu'] + (int) $j['clics_site'];
    $l = [];
    $l[] = 'Bonjour Alex,';
    $l[] = '';
    $l[] = 'Le bilan du ' . wp_date('l j F') . '.';
    $site = function_exists('aled08e_px_bilan_site_lignes') ? aled08e_px_bilan_site_lignes() : ['lignes' => [], 'alertes' => []];
    $alertes = array_merge($site['alertes'], (array) (aled08e_px_jarvis_alertes()));
    if ($alertes) { $l[] = ''; $l[] = 'IMPORTANT :'; foreach ($alertes as $a) $l[] = '- ' . $a; }
    $l[] = '';
    $l[] = 'Le site :';
    foreach ($site['lignes'] as $x) $l[] = $x;
    $l[] = '';
    $l[] = 'La prospection :';
    $l[] = '';
    $l[] = '- ' . $n((int) $j['envois'] + (int) $j['relances'], 'mail envoyé', 'mails envoyés') . ' (' . $n($j['envois'], 'premier message', 'premiers messages') . ', ' . $n($j['relances'], 'relance', 'relances') . ')';
    $l[] = '- ' . $n($clics, 'clic', 'clics') . ' dans les mails';
    $l[] = '- ' . $n($j['repondus'], 'réponse', 'réponses') . ', dont ' . $n($j['interesses'], 'intéressé', 'intéressés') . ' ; ' . $n((int) ($j['reponses_envoyees'] ?? 0), 'réponse envoyée par la bande', 'réponses envoyées par la bande');
    $l[] = '- ' . $n($j['desinscrits'], 'refus (désinscription)', 'refus (désinscriptions)') . ' et ' . $n($j['rebonds'], 'adresse fausse', 'adresses fausses');
    $l[] = '- ' . $n($j['commandes'], 'commande', 'commandes');
    // les réponses du jour : ce que la bande a répondu, et ce qui attend Alex (pas de brouillon, pas de mail en double)
    $rep = function_exists('aled08e_px_bilan_reponses_lignes') ? aled08e_px_bilan_reponses_lignes() : ['repondus' => [], 'pour_alex' => []];
    if ($rep['pour_alex']) { $l[] = ''; $l[] = 'À VOUS (la bande n’a pas la réponse) :'; foreach ($rep['pour_alex'] as $x) $l[] = $x; }
    if ($rep['repondus']) { $l[] = ''; $l[] = 'Les réponses du jour, et ce que nous avons répondu :'; foreach ($rep['repondus'] as $x) $l[] = $x; }
    // les réseaux des Minis Monstres (includes/reseaux-lmm.php)
    if (function_exists('aled08e_lmm_bilan_lignes')) { $l[] = ''; foreach (aled08e_lmm_bilan_lignes() as $x) $l[] = $x; }
    $l[] = '';
    $l[] = 'Sur 7 jours : ' . $n((int) $s['envois'] + (int) $s['relances'], 'mail', 'mails') . ', ' . $n((int) $s['clics_demo'] + (int) $s['clics_apercu'] + (int) $s['clics_site'], 'clic', 'clics') . ', ' . $n($s['repondus'], 'réponse', 'réponses')
        . ' (' . $n($s['interesses'], 'intéressé', 'intéressés') . '), ' . (int) $s['desinscrits'] . ' refus, ' . $n($s['rebonds'], 'adresse fausse', 'adresses fausses') . ', ' . $n($s['commandes'], 'commande', 'commandes') . '.';
    $l[] = 'En attente : ' . $n($t['nouveau'], 'entreprise', 'entreprises') . ' à vérifier, ' . (int) $t['a_ecrire'] . ' à qui écrire. Demain : jusqu’à ' . aled08e_px_quota_jour(time() + DAY_IN_SECONDS) . ' mails.';
    $m = aled08e_px_ce_qui_marche();
    if ($m['metiers']) $l[] = 'Ce qui marche le mieux : ' . implode(', ', array_map(function ($x) { $noms = aled08e_px_metiers(); return ($noms[$x['quoi']]['nom'] ?? $x['quoi']) . ' (' . $x['clics'] . ' clics et ' . $x['interesses'] . ' intéressés sur ' . $x['envois'] . ' mails)'; }, $m['metiers'])) . '.';
    if (!$r['active']) {
        $p = (array) get_option('aled08_prospection_pause', []);
        $l[] = '';
        $l[] = 'La prospection est éteinte' . (!empty($p['le']) && (int) $p['le'] > time() - 3 * DAY_IN_SECONDS ? ' (mise en pause automatique : ' . (string) ($p['raison'] ?? '') . ')' : '') . '. Pour la rallumer : votre espace de gestion, bloc « Prospection ».';
    }
    $l[] = '';
    $l[] = 'Le détail : ' . home_url('/mon-espace/') . ' (espace de gestion, « Prospection »).';
    return implode("\n", $l);
}
/* Ce que la prospection elle-même signale (pause, trop de refus…) : repris en tête du bilan */
function aled08e_px_jarvis_alertes() {
    $out = [];
    if (function_exists('aled08e_px_bilan_jarvis')) { $j = aled08e_px_bilan_jarvis(); foreach ((array) ($j['a_signaler'] ?? []) as $a) $out[] = (string) $a; }
    return $out;
}
/* Un bilan chaque soir (Alex, 26 novembre 2026 : « chaque soir, le nombre de mails envoyés et les infos importantes ») */
function aled08e_px_debrief_envoyer() {
    $j = aled08e_px_stats_sur(1);
    $envoyes = (int) $j['envois'] + (int) $j['relances'];
    $sujet = 'Le bilan du ' . wp_date('j F') . ' : ' . $envoyes . ' mail' . ($envoyes > 1 ? 's' : '') . ' envoyé' . ($envoyes > 1 ? 's' : '') . ', ' . (int) $j['repondus'] . ' réponse' . ((int) $j['repondus'] > 1 ? 's' : '') . ', ' . (int) $j['commandes'] . ' commande' . ((int) $j['commandes'] > 1 ? 's' : '');
    return wp_mail(aled08e_to(), $sujet, aled08e_px_debrief_texte(), aled08e_mail_headers());
}
/* Chaque soir à 18 h 15, heure de Paris, week-end compris (une tâche à usage unique, reprogrammée : elle suit l'heure d'été) */
function aled08e_px_debrief_prochain() {
    $d = new DateTime('now', wp_timezone());
    $d->setTime(18, 15, 0);
    if ($d->getTimestamp() <= time() + 60) $d->modify('+1 day');
    return $d->getTimestamp();
}
add_action('aled08e_px_debrief', function () {
    aled08e_px_surveiller();
    aled08e_px_debrief_envoyer();
    if (!wp_next_scheduled('aled08e_px_debrief')) wp_schedule_single_event(aled08e_px_debrief_prochain(), 'aled08e_px_debrief');
});
add_action('init', function () {
    if (!wp_next_scheduled('aled08e_px_debrief')) wp_schedule_single_event(aled08e_px_debrief_prochain(), 'aled08e_px_debrief');
}, 45);

/* ====================================================================== 5. la pause automatique */
/* Trop de refus ou trop d'adresses fausses : on s'arrête avant d'abîmer l'adresse d'envoi. Alex seul rallume. */
function aled08e_px_surveiller() {
    if (!aled08e_px_active()) return '';
    $s = aled08e_px_stats_sur(7);
    $env = (int) $s['envois'] + (int) $s['relances'];
    if ($env < 40) return '';
    $raison = '';
    if ((int) $s['desinscrits'] * 20 > $env) $raison = 'plus de 5 % de désinscriptions sur 7 jours (' . (int) $s['desinscrits'] . ' sur ' . $env . ' mails).';
    elseif ((int) $s['rebonds'] * 100 > $env * 8) $raison = 'plus de 8 % d’adresses fausses sur 7 jours (' . (int) $s['rebonds'] . ' sur ' . $env . ' mails).';
    if ($raison === '') return '';
    update_option('aled08_prospection_active', '0', false);
    update_option('aled08_prospection_pause', ['le' => time(), 'raison' => $raison], false);
    wp_mail(aled08e_to(), 'La prospection s’est mise en pause toute seule',
        "Bonjour Alex,\n\nLa prospection par e-mail vient de s’éteindre automatiquement : " . $raison . "\n\nC’est une sécurité : continuer abîmerait la réputation de l’adresse d’envoi. Plus aucun mail ne part, et les agents s’arrêtent.\n\n"
        . "Avant de rallumer : regardez les métiers et les départements visés, et le texte des mails (espace de gestion, bloc « Prospection »).\n\nPour rallumer : le bouton « Allumer la prospection » du même bloc.\n", aled08e_mail_headers());
    if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Prospection mise en pause automatiquement', 'La prospection s’est éteinte toute seule : ' . $raison . ' Alex seul la rallume.', 0, 'systeme');
    return $raison;
}
