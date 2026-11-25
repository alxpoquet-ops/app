<?php
/**
 * Les Minis Monstres Espace client : les outils par abonnement (atelier « Les outils », décision d'Alex du 24 novembre 2026)
 * et « Le fil de la bande » (ce que les petits monstres ont fait pour le client).
 *
 * Un seul compte, un seul espace, une seule facture. Les outils se vendent à tout le monde (avec ou sans site chez nous),
 * outil par outil, ou « Toute la bande » (tous les outils prêts). Essai gratuit (outilsOffre.essaiJours, 14 jours), sans carte,
 * un essai par outil et par compte. Pas de jetons ni d'énergie : l'usage est compris, avec une limite par mois (outilsOffre).
 *
 * CONTRAT avec includes/atelier-outils.php (l'écran de travail de chaque outil, écrit à part) :
 *   aled08e_outil_actif($uid, $id)            bool : le client peut utiliser l'outil (abonnement, « bande », essai en cours,
 *                                              outil inclusSite avec un site actif, ou administrateur). Faux pour un outil « bientôt ».
 *   aled08e_outils_etat($uid)                  [id => ['statut' => actif|essai|inactif|bientot, 'fin_essai' => ts|0, 'prix' => int,
 *                                              'par' => abonnement|bande|site|essai|admin|'']] (les outils seulement, pas « bande »)
 *   aled08e_fil_ajouter($uid, $monstre, $texte) une ligne dans le fil de la bande (40 gardées, avec la date)
 *   aled08e_fil_lire($uid, $n = 10)            les $n dernières lignes, la plus récente d'abord
 *   fournis par atelier-outils.php (appelés seulement s'ils existent) : aled08e_outil_html($uid, $id), aled08e_outil_usage($uid, $id)
 *
 * Données (méta du compte) :
 *   aled08_outils_abos   [id => ['item' => si_…, 'sub' => sub_…, 'depuis' => ts, 'fin' => 0|ts, 'prix' => int]] (id ou « bande ») ;
 *                        'fin' : l'outil est arrêté par le client, il reste actif jusqu'à cette date (fin du mois payé)
 *   aled08_outils_essais [id => ['debut' => ts, 'fin' => ts, 'mail' => 0|ts, 'fini' => 0|1]]
 *   aled08_outils_sub    l'abonnement Stripe ouvert pour les outils (compte sans forfait de site)
 *   aled08_fil           [['t' => ts, 'm' => monstre, 'x' => texte]]
 *
 * Stripe (includes/stripe.php) : une seule facture par mois. Le client a déjà un abonnement au mois (forfait Mini, ou un
 * abonnement d'outils) : on y ajoute une ligne (subscription item, price_data), la part du mois en cours est payée tout de suite.
 * Sinon : une page de paiement Checkout (mode abonnement). Arrêter un outil : sa ligne est retirée à la fin du mois payé,
 * sans toucher au reste. « Toute la bande » remplace les lignes d'outils séparés. Ventes fermées (includes/ouverture.php) :
 * pas d'essai ni d'abonnement (le serveur vérifie aled08e_ventes_ouvertes(), les boutons portent data-achat).
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  L'offre (data.json, depuis src/config.js)
 * ========================================================================= */
function aled08e_outils_offre() {
    $o = aled08e_data()['outilsOffre'] ?? null;
    if (!is_array($o) || empty($o['outils']) || (isset($o['actif']) && !$o['actif'])) return null;
    return $o + ['essaiJours' => 14, 'bande' => ['id' => 'bande', 'nom' => 'Toute la bande', 'prix' => 19, 'court' => '']];
}
function aled08e_outils_liste() { $o = aled08e_outils_offre(); return $o ? array_values((array) $o['outils']) : []; }
function aled08e_essai_jours() { $o = aled08e_outils_offre(); return max(1, (int) ($o['essaiJours'] ?? 14)); }
/* Un outil (ou « bande ») : sa définition, ou null */
function aled08e_outil_def($id) {
    foreach (aled08e_outils_liste() as $o) if (($o['id'] ?? '') === $id) return $o + ['chef' => '', 'color' => 'lilac', 'monstre' => 'mascotte', 'court' => '', 'limite' => 0, 'unite' => '', 'tag' => '', 'inclusSite' => false];
    $off = aled08e_outils_offre();
    if ($id === 'bande' && $off) return (array) $off['bande'] + ['id' => 'bande', 'nom' => 'Toute la bande', 'prix' => 19, 'statut' => 'pret', 'monstre' => 'mascotte', 'chef' => 'La bande', 'color' => 'lilac', 'court' => '', 'limite' => 0, 'unite' => '', 'tag' => '', 'inclusSite' => false];
    return null;
}
/* Les outils prêts (vendus), dans l'ordre de l'offre */
function aled08e_outils_prets() { return array_values(array_filter(aled08e_outils_liste(), function ($o) { return ($o['statut'] ?? '') === 'pret'; })); }
/* Un identifiant d'outil reçu d'un lien ou d'un formulaire : l'id s'il existe (ou « bande »), sinon '' */
function aled08e_outils_param($v) {
    $v = is_string($v) ? sanitize_key(wp_unslash($v)) : '';
    return ($v !== '' && aled08e_outil_def($v)) ? $v : '';
}
/* Le prix d'un outil en texte : « 9 € par mois » */
function aled08e_outil_prix_txt($def) { return aled08e_euro_txt((int) ($def['prix'] ?? 0)) . ' par mois'; }
/* Outils mis de côté (outilsOffre.actif faux) : le nom d'un outil que le client paie peut-être encore (data.json, même éteint) */
function aled08e_outil_nom_brut($id) {
    $o = aled08e_data()['outilsOffre'] ?? null;
    if ($id === 'bande') return (string) (is_array($o) ? ($o['bande']['nom'] ?? '') : '') ?: 'Toute la bande';
    foreach ((array) (is_array($o) ? ($o['outils'] ?? []) : []) as $x) if (($x['id'] ?? '') === $id) return (string) ($x['nom'] ?? $id);
    return (string) $id;
}
/* Les outils encore payés par un client alors que les outils ne sont plus proposés : [id => abonnement] (un essai, lui,
 * s'arrête tout seul et n'est plus montré) */
function aled08e_outils_restants($uid) {
    if (aled08e_outils_offre()) return [];
    return array_filter(aled08e_outils_abos($uid), 'aled08e_outils_abo_vivant');
}
/* Dans « Mon compte », pour ces clients seulement : la ligne, avec « Arrêter cet outil » (rien n'est prélevé ensuite) */
function aled08e_outils_restants_compte_html($uid) {
    $r = aled08e_outils_restants($uid);
    if (!$r) return '';
    $h = '<p class="app-sub">' . aled08e_icon('toolbox') . ' Vos outils</p><ul class="mo-lignes">';
    foreach ($r as $id => $a) {
        $act = empty($a['fin']) ? aled08e_outils_bouton('arreter', $id, 'Arrêter cet outil', 'x', 'btn btn-light btn-sm', false, 'compte', true) : '';
        if (aled08e_outils_retractable($a)) $act .= aled08e_outils_bouton('retracter', $id, 'Me rétracter et être remboursé', 'rotate-ccw', 'btn btn-light btn-sm', false, 'compte', true);
        $h .= '<li><span class="mo-ligne-art" aria-hidden="true">' . aled08e_monster($id === 'bande' ? 'mascotte' : 'etoile') . '</span><span class="mo-ligne-nom"><strong>' . esc_html(aled08e_outil_nom_brut($id)) . '</strong>'
            . ($a['fin'] ? '<small>Arrêté : actif jusqu’au ' . esc_html(wp_date('j F Y', (int) $a['fin'])) . ', puis plus rien n’est prélevé</small>' : '') . '</span><b>' . aled08e_euro((float) ($a['prix'] ?? 0)) . ' <small>par mois</small></b>' . $act . '</li>'; // phpcs:ignore
    }
    return $h . '</ul><p class="app-note">Les outils sont mis de côté pour l’instant : ils ne s’ouvrent plus dans votre espace. Arrêtez le vôtre ici : rien n’est plus prélevé après le mois déjà payé. Une question ? <a href="' . esc_url(home_url('/contact/')) . '">Écrivez-nous</a>.</p>';
}
/* Le dessin d'un monstre d'après son dessin (etoile, mascotte…) ou son prénom (Cerise, Pépite…) */
function aled08e_fil_dessin($m) {
    $m = sanitize_key(remove_accents(mb_strtolower((string) $m)));
    $prenoms = ['cerise' => 'mascotte', 'pepite' => 'etoile', 'mirette' => 'gelee', 'plume' => 'champi', 'bricou' => 'bricou', 'mochi' => 'mochi', 'bande' => 'mascotte'];
    return $prenoms[$m] ?? ($m !== '' ? $m : 'mascotte');
}

/* =========================================================================
 *  Ce que le client a (abonnements, essais)
 * ========================================================================= */
function aled08e_outils_abos($uid) { $v = get_user_meta((int) $uid, 'aled08_outils_abos', true); return is_array($v) ? $v : []; }
function aled08e_outils_essais($uid) { $v = get_user_meta((int) $uid, 'aled08_outils_essais', true); return is_array($v) ? $v : []; }
function aled08e_outils_abos_sauver($uid, $a) { update_user_meta((int) $uid, 'aled08_outils_abos', $a); }
function aled08e_outils_essais_sauver($uid, $e) { update_user_meta((int) $uid, 'aled08_outils_essais', $e); }
/* Une ligne d'abonnement qui compte encore : pas arrêtée, ou arrêtée mais pas encore au bout du mois payé */
function aled08e_outils_abo_vivant($a) { return is_array($a) && !empty($a['item']) && (empty($a['fin']) || (int) $a['fin'] > time()); }
/* L'essai a-t-il déjà été pris pour cet outil ? (l'essai de « toute la bande » compte pour tous les outils) */
function aled08e_outils_essai_pris($uid, $id) {
    $e = aled08e_outils_essais($uid);
    return isset($e[$id]) || ($id !== 'bande' && isset($e['bande']));
}
/* Le client a-t-il un site chez nous, avec un forfait actif (ou en cours de création) ? Pour les outils « offert avec un site ». */
function aled08e_outils_a_un_site($uid) {
    static $cache = [];
    $uid = (int) $uid;
    if (isset($cache[$uid])) return $cache[$uid];
    // CGV : un outil offert avec le forfait Mini s'arrête si le forfait s'arrête. On regarde donc l'abonnement du forfait
    // lui-même (celui de chaque commande), jamais le statut global du compte (qu'une facture d'outils peut remettre à « actif »).
    $ok = false;
    if ($uid && aled08e_meta($uid, 'forfait') !== '') {
        foreach (['offert', 'famille', 'abonnement_manuel'] as $k) if (aled08e_meta($uid, $k) === '1') $ok = true;
        $cmds = function_exists('aled08e_cmd_user_commandes') ? aled08e_cmd_user_commandes($uid) : [];
        foreach ($cmds as $c) {
            if ($ok || in_array($c['statut'], ['annulee', 'attente_paiement'], true)) continue;
            $abo = (string) get_post_meta($c['id'], '_aled08_abonnement', true);
            if (in_array($abo, ['active', 'past_due'], true) || ($abo === '' && empty($c['stripe_subscription']))) $ok = true; // forfait actif, ou site en création (le forfait démarre à la réception)
        }
        // compte créé à la main, sans commande : son abonnement Stripe du forfait
        if (!$ok && !$cmds && aled08e_meta($uid, 'stripe_subscription') !== '' && in_array(aled08e_meta($uid, 'abonnement'), ['active', 'past_due'], true)) $ok = true;
    }
    return $cache[$uid] = $ok;
}

/* L'état de chaque outil pour ce client (le contrat : voir en haut du fichier) */
function aled08e_outils_etat($uid) {
    $uid = (int) $uid;
    $out = [];
    $abos = aled08e_outils_abos($uid);
    $essais = aled08e_outils_essais($uid);
    $now = time();
    $admin = $uid && user_can($uid, 'manage_options');
    $bandeAbo = aled08e_outils_abo_vivant($abos['bande'] ?? null);
    $bandeEssai = (int) ($essais['bande']['fin'] ?? 0) > $now ? (int) $essais['bande']['fin'] : 0;
    foreach (aled08e_outils_liste() as $o) {
        $id = (string) ($o['id'] ?? '');
        if ($id === '') continue;
        $prix = (int) ($o['prix'] ?? 0);
        if (($o['statut'] ?? '') !== 'pret') { $out[$id] = ['statut' => 'bientot', 'fin_essai' => 0, 'prix' => $prix, 'par' => '']; continue; }
        $r = ['statut' => 'actif', 'fin_essai' => 0, 'prix' => $prix, 'par' => ''];
        if ($admin) $r['par'] = 'admin';
        elseif (aled08e_outils_abo_vivant($abos[$id] ?? null)) $r['par'] = 'abonnement';
        elseif ($bandeAbo) $r['par'] = 'bande';
        elseif (!empty($o['inclusSite']) && aled08e_outils_a_un_site($uid)) $r['par'] = 'site';
        else {
            $fin = max((int) ($essais[$id]['fin'] ?? 0) > $now ? (int) $essais[$id]['fin'] : 0, $bandeEssai);
            $r = $fin ? ['statut' => 'essai', 'fin_essai' => $fin, 'prix' => $prix, 'par' => 'essai'] : ['statut' => 'inactif', 'fin_essai' => 0, 'prix' => $prix, 'par' => ''];
        }
        $out[$id] = $r;
    }
    return $out;
}
/* Le client peut-il utiliser cet outil ? */
function aled08e_outil_actif($uid, $id) {
    $e = aled08e_outils_etat($uid)[(string) $id] ?? null;
    return $e !== null && in_array($e['statut'], ['actif', 'essai'], true);
}
/* « Toute la bande » : ['statut' => actif|essai|inactif, 'fin_essai', 'prix', 'fin' (arrêtée : actif jusqu'à)] */
function aled08e_bande_etat($uid) {
    $def = aled08e_outil_def('bande');
    $abos = aled08e_outils_abos($uid);
    $essais = aled08e_outils_essais($uid);
    $r = ['statut' => 'inactif', 'fin_essai' => 0, 'prix' => (int) ($def['prix'] ?? 0), 'fin' => 0];
    if (aled08e_outils_abo_vivant($abos['bande'] ?? null)) return ['statut' => 'actif', 'fin' => (int) ($abos['bande']['fin'] ?? 0)] + $r;
    if ((int) ($essais['bande']['fin'] ?? 0) > time()) return ['statut' => 'essai', 'fin_essai' => (int) $essais['bande']['fin']] + $r;
    return $r;
}
/* Jours restants d'un essai (au moins 1 tant qu'il court) */
function aled08e_outils_jours_restants($fin) { return max(1, (int) ceil(((int) $fin - time()) / DAY_IN_SECONDS)); }

/* =========================================================================
 *  Le fil de la bande
 * ========================================================================= */
function aled08e_fil_ajouter($uid, $monstre, $texte) {
    $uid = (int) $uid;
    $texte = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $texte)));
    if (!$uid || $texte === '' || !get_userdata($uid)) return false;
    $l = get_user_meta($uid, 'aled08_fil', true);
    $l = is_array($l) ? $l : [];
    $m = sanitize_key(remove_accents(mb_strtolower((string) $monstre))) ?: 'mascotte';
    $texte = mb_substr($texte, 0, 300);
    $der = end($l);
    if (is_array($der) && ($der['x'] ?? '') === $texte && time() - (int) ($der['t'] ?? 0) < 600) return true; // pas deux fois la même ligne d'affilée
    $l[] = ['t' => time(), 'm' => $m, 'x' => $texte];
    update_user_meta($uid, 'aled08_fil', array_slice($l, -40));
    return true;
}
function aled08e_fil_lire($uid, $n = 10) {
    $l = get_user_meta((int) $uid, 'aled08_fil', true);
    $l = is_array($l) ? array_reverse($l) : [];
    $out = [];
    foreach (array_slice($l, 0, max(1, (int) $n)) as $x) $out[] = ['date' => (int) ($x['t'] ?? 0), 'monstre' => (string) ($x['m'] ?? 'mascotte'), 'texte' => (string) ($x['x'] ?? '')];
    return $out;
}
/* « Ce matin », « Hier », « Lundi », « 3 novembre » */
function aled08e_fil_quand($ts) {
    $j = wp_date('Y-m-d', $ts);
    if ($j === wp_date('Y-m-d')) return (int) wp_date('G', $ts) < 12 ? 'Ce matin' : 'Aujourd’hui';
    if ($j === wp_date('Y-m-d', time() - DAY_IN_SECONDS)) return 'Hier';
    if (time() - $ts < 6 * DAY_IN_SECONDS) return ucfirst(wp_date('l', $ts));
    return wp_date('j F', $ts);
}
function aled08e_fil_html($uid, $n = 6) {
    $l = aled08e_fil_lire($uid, $n);
    $h = '<section class="mm-bloc mm-fil" aria-labelledby="mm-fil-t"><h3 class="mm-bloc-t" id="mm-fil-t">Le fil de la bande</h3>';
    if (!$l) return $h . '<p class="mm-vide">' . aled08e_monster('pense') . '<span>Ici, vous verrez ce que les petits monstres font pour vous : ' . (aled08e_outils_offre() ? 'une modification faite, une page pour Google en ligne, un outil qui a travaillé.' : 'une modification faite, une page pour Google en ligne, votre site mis en ligne.') . '</span></p></section>';
    $h .= '<ul class="mm-fil-l">';
    foreach ($l as $x) {
        $h .= '<li><span class="mm-fil-art" aria-hidden="true">' . aled08e_monster(aled08e_fil_dessin($x['monstre'])) . '</span><p>' . esc_html($x['texte']) . '</p><time datetime="' . esc_attr(gmdate('c', $x['date'])) . '">' . esc_html(aled08e_fil_quand($x['date'])) . '</time></li>';
    }
    return $h . '</ul></section>';
}

/* Le fil se remplit tout seul : une demande faite (par Bricou, Alex, ou une page de visibilité Google en ligne),
 * la commande payée, le site en ligne. Une demande passée à « faite » est notée à la fin de la requête, une seule fois,
 * quand son titre et ses informations sont à jour (pages-google.php renomme la demande juste après). */
function aled08e_fil_demande_faite($mid, $pid, $cle, $val) {
    if ($cle !== '_aled08_statut' || $val !== 'faite' || get_post_type($pid) !== ALED08E_CPT) return;
    if (empty($GLOBALS['aled08e_fil_attente'])) {
        $GLOBALS['aled08e_fil_attente'] = [];
        add_action('shutdown', 'aled08e_fil_demandes_noter', 5);
    }
    $GLOBALS['aled08e_fil_attente'][(int) $pid] = true;
}
add_action('added_post_meta', 'aled08e_fil_demande_faite', 10, 4);
add_action('updated_post_meta', 'aled08e_fil_demande_faite', 10, 4);
function aled08e_fil_demandes_noter() {
    foreach (array_keys((array) ($GLOBALS['aled08e_fil_attente'] ?? [])) as $pid) {
        $p = get_post($pid);
        if (!$p || get_post_meta($pid, '_aled08_fil_note', true) || get_post_meta($pid, '_aled08_statut', true) !== 'faite') continue;
        update_post_meta($pid, '_aled08_fil_note', time());
        $court = function ($t) { $t = trim(preg_replace('/\s+/u', ' ', (string) $t)); return mb_strlen($t) > 90 ? rtrim(mb_substr($t, 0, 87)) . '…' : $t; };
        $extra = (string) get_post_meta($pid, '_aled08_extra', true);
        if (get_post_meta($pid, '_aled08_seo', true)) {
            $titre = (string) get_post_meta($pid, '_aled08_pg_titre', true) ?: preg_replace('/^Page de visibilité Google : /u', '', $p->post_title);
            aled08e_fil_ajouter($p->post_author, 'gelee', 'Mirette a mis en ligne votre page pour Google « ' . $court($titre) . ' ».');
        } elseif ($extra === 'packseo') {
            $n = max(1, (int) get_post_meta($pid, '_aled08_quantite', true));
            aled08e_fil_ajouter($p->post_author, 'gelee', $n > 1 ? 'Mirette a choisi les sujets de vos ' . $n . ' pages pour Google : la bande les écrit.' : 'Mirette a choisi le sujet de votre page pour Google : la bande l’écrit.');
        } elseif ($extra !== '') {
            $x = aled08e_a_la_demande($extra, true);
            aled08e_fil_ajouter($p->post_author, 'etoile', 'Pépite : votre extra « ' . ($x ? $x['name'] : $court($p->post_title)) . ' » est fait.');
        } else {
            $resume = trim((string) get_post_meta($pid, '_aled08_resume', true));
            aled08e_fil_ajouter($p->post_author, 'bricou', 'Bricou a mis en ligne votre modification : « ' . $court($resume !== '' ? $resume : $p->post_title) . ' ».');
        }
    }
    $GLOBALS['aled08e_fil_attente'] = [];
}
add_action('aled08e_statut_change', function ($cid, $statut, $old) {
    $c = function_exists('aled08e_cmd_get') ? aled08e_cmd_get($cid) : null;
    if (!$c || empty($c['user'])) return;
    if ($statut === 'payee' && $old === 'attente_paiement') aled08e_fil_ajouter($c['user'], 'bricou', 'Bricou a bien reçu votre commande ' . $c['ref'] . ' : il prépare votre site.');
    if ($statut === 'en_ligne') aled08e_fil_ajouter($c['user'], 'bricou', 'Bricou a mis votre site en ligne' . (!empty($c['domaine']) ? ' : ' . $c['domaine'] : '') . '. Bravo !');
}, 20, 3);

/* =========================================================================
 *  Essai gratuit : 14 jours, sans carte, géré ici (un par outil et par compte)
 * ========================================================================= */
function aled08e_outils_essayer($uid, $id) {
    $def = aled08e_outil_def($id);
    if (!$def || ($def['statut'] ?? 'pret') !== 'pret') return new WP_Error('aled08_outils', 'inconnu');
    if (!aled08e_ventes_ouvertes()) return new WP_Error('aled08_ventes', aled08e_ventes_message());
    if ($id === 'bande' ? aled08e_bande_etat($uid)['statut'] !== 'inactif' : aled08e_outil_actif($uid, $id)) return 'deja';
    if (aled08e_outils_essai_pris($uid, $id)) return new WP_Error('aled08_outils', 'essai_deja');
    $e = aled08e_outils_essais($uid);
    $fin = time() + aled08e_essai_jours() * DAY_IN_SECONDS;
    $e[$id] = ['debut' => time(), 'fin' => $fin, 'mail' => 0, 'fini' => 0];
    aled08e_outils_essais_sauver($uid, $e);
    aled08e_fil_ajouter($uid, $id === 'bande' ? 'mascotte' : $def['monstre'], $id === 'bande'
        ? 'Toute la bande est à votre service jusqu’au ' . wp_date('j F', $fin) . ' : c’est votre essai gratuit.'
        : ($def['chef'] ?: 'La bande') . ' commence son essai avec vous : « ' . $def['nom'] . ' » est à vous jusqu’au ' . wp_date('j F', $fin) . '.');
    return 'ok';
}

/* =========================================================================
 *  Abonnement Stripe : une seule facture par mois
 * ========================================================================= */
/* Le produit Stripe d'un outil (créé une fois par compte Stripe et par mode, puis réutilisé) */
function aled08e_outils_produit($id) {
    $def = aled08e_outil_def($id);
    if (!$def) return new WP_Error('aled08_outils', 'Outil inconnu.');
    $mode = substr(md5(substr(aled08e_stripe_secret(), -8)), 0, 10);
    $tous = get_option('aled08_outils_produits', []);
    $tous = is_array($tous) ? $tous : [];
    if (!empty($tous[$mode][$id])) return (string) $tous[$mode][$id];
    $p = aled08e_stripe_request('POST', '/v1/products', ['name' => $id === 'bande' ? 'Les outils : ' . $def['nom'] : 'Outil : ' . $def['nom'], 'metadata' => ['aled08' => 'outil', 'outil' => $id]], 'outil-produit-' . $mode . '-' . $id);
    if (is_wp_error($p) || empty($p['id'])) return is_wp_error($p) ? $p : new WP_Error('aled08_outils', 'Produit non créé.');
    $tous[$mode][$id] = (string) $p['id'];
    update_option('aled08_outils_produits', $tous, false);
    return (string) $p['id'];
}
/* Le prix d'une ligne, pour Stripe */
function aled08e_outils_price_data($id) {
    $prod = aled08e_outils_produit($id);
    if (is_wp_error($prod)) return $prod;
    return ['currency' => 'eur', 'product' => $prod, 'unit_amount' => aled08e_stripe_cents((int) aled08e_outil_def($id)['prix']), 'recurring' => ['interval' => 'month']];
}
/* Un abonnement Stripe du client, lu chez Stripe : ['id', 'interval', 'cancel', 'items' => [ids], 'outils' => bool] ou null */
function aled08e_outils_lire_sub($sub) {
    if ($sub === '') return null;
    $s = aled08e_stripe_request('GET', '/v1/subscriptions/' . rawurlencode($sub), [], '', true);
    if (is_wp_error($s) || empty($s['id'])) return null;
    $items = (array) ($s['items']['data'] ?? []);
    return [
        'id' => (string) $s['id'], 'status' => (string) ($s['status'] ?? ''), 'interval' => (string) ($items[0]['price']['recurring']['interval'] ?? 'month'),
        'cancel' => !empty($s['cancel_at_period_end']), 'items' => array_map(function ($i) { return (string) ($i['id'] ?? ''); }, $items),
        'fins' => array_combine(array_map(function ($i) { return (string) ($i['id'] ?? ''); }, $items) ?: [], array_map(function ($i) use ($s) { return (int) ($i['current_period_end'] ?? ($s['current_period_end'] ?? 0)); }, $items) ?: []),
        'outils' => !empty($s['metadata']['aled08_outils_user']),
    ];
}
/* L'abonnement où ajouter une ligne : celui du forfait (au mois, pas en train de s'arrêter), sinon celui des outils. Null : Checkout. */
function aled08e_outils_sub_hote($uid) {
    foreach (array_unique(array_filter([aled08e_meta($uid, 'stripe_subscription'), aled08e_meta($uid, 'outils_sub')])) as $sid) {
        $s = aled08e_outils_lire_sub($sid);
        if (!$s || !in_array($s['status'], ['active', 'trialing', 'past_due'], true) || $s['interval'] !== 'month') continue;
        if ($s['cancel'] && !$s['outils']) continue; // le forfait s'arrête : on n'y accroche rien
        return $s;
    }
    return null;
}
/* Prendre un outil (ou « bande ») : 'ok' (ligne ajoutée), une adresse Checkout (à ouvrir), 'deja', ou WP_Error */
function aled08e_outils_abonner($uid, $id) {
    $def = aled08e_outil_def($id);
    if (!$def || ($def['statut'] ?? 'pret') !== 'pret') return new WP_Error('aled08_outils', 'inconnu');
    if (!aled08e_ventes_ouvertes()) return new WP_Error('aled08_ventes', aled08e_ventes_message());
    if (!aled08e_stripe_ready()) return new WP_Error('aled08_outils', 'stripe');
    $abos = aled08e_outils_abos($uid);
    if (aled08e_outils_abo_vivant($abos[$id] ?? null)) return !empty($abos[$id]['fin']) ? aled08e_outils_reprendre($uid, $id) : 'deja';
    if ($id !== 'bande' && aled08e_outils_abo_vivant($abos['bande'] ?? null)) return 'deja';
    $verrou = 'aled08_outils_verrou_' . (int) $uid;
    if (get_transient($verrou)) return new WP_Error('aled08_outils', 'occupe');
    set_transient($verrou, 1, MINUTE_IN_SECONDS);
    $pd = aled08e_outils_price_data($id);
    if (is_wp_error($pd)) { delete_transient($verrou); return $pd; }
    $hote = aled08e_outils_sub_hote($uid);
    if (!$hote) {
        $url = aled08e_outils_checkout($uid, $id, $pd);
        delete_transient($verrou);
        return $url;
    }
    // une ligne de plus sur la facture du mois. La clé d'idempotence change à chaque nouvel abonnement à cet outil :
    // un double clic ne crée qu'une ligne, un abonnement repris plus tard en crée bien une nouvelle.
    $n = get_user_meta($uid, 'aled08_outils_n', true);
    $n = is_array($n) ? $n : [];
    $r = aled08e_stripe_request('POST', '/v1/subscription_items', [
        'subscription' => $hote['id'], 'price_data' => $pd, 'quantity' => 1,
        'metadata' => ['aled08_outil' => $id, 'user' => (string) $uid],
        'proration_behavior' => 'always_invoice', 'payment_behavior' => 'error_if_incomplete',
    ], 'outil-ligne-' . (int) $uid . '-' . $id . '-' . $hote['id'] . '-' . (int) ($n[$id] ?? 0));
    if (is_wp_error($r) || empty($r['id'])) { delete_transient($verrou); return is_wp_error($r) ? $r : new WP_Error('aled08_outils', 'paiement'); }
    $n[$id] = (int) ($n[$id] ?? 0) + 1;
    update_user_meta($uid, 'aled08_outils_n', $n);
    // l'abonnement des outils allait s'arrêter (dernière ligne arrêtée) : il continue, la ligne arrêtée part à sa date
    if ($hote['cancel'] && $hote['outils']) {
        aled08e_stripe_request('POST', '/v1/subscriptions/' . rawurlencode($hote['id']), ['cancel_at_period_end' => 'false'], 'outils-reprise-' . $hote['id'] . '-' . wp_generate_password(8, false));
        foreach (aled08e_outils_abos($uid) as $tid => $a) if (($a['sub'] ?? '') === $hote['id'] && !empty($a['fin'])) aled08e_outils_planifier_fin($uid, $tid, $a);
    }
    aled08e_outils_noter($uid, $id, (string) $r['id'], $hote['id']);
    delete_transient($verrou);
    return 'ok';
}
/* Pas encore d'abonnement au mois : une page de paiement Stripe (mode abonnement) */
function aled08e_outils_checkout($uid, $id, $pd) {
    $u = get_userdata($uid);
    if (!$u) return new WP_Error('aled08_outils', 'Compte inconnu.');
    $params = [
        'mode' => 'subscription',
        'locale' => 'fr',
        'client_reference_id' => 'u' . (int) $uid,
        'metadata' => ['aled08_outils' => $id, 'user' => (string) $uid],
        'line_items' => [['quantity' => 1, 'price_data' => $pd]],
        'subscription_data' => ['metadata' => ['aled08_outils_user' => (string) $uid]],
        'success_url' => add_query_arg(['outils' => 'ok', 'choix' => $id], aled08e_url()) . '&session={CHECKOUT_SESSION_ID}#outils',
        'cancel_url' => aled08e_url(['outils' => 'annule', 'choix' => $id]) . '#outils',
    ];
    $cus = aled08e_stripe_client_connu($uid);
    if ($cus) $params['customer'] = $cus;
    else $params['customer_email'] = $u->user_email;
    aled08e_stripe_expirer_session(aled08e_meta($uid, 'outils_session')); // une seule page de paiement ouverte à la fois
    $r = aled08e_stripe_request('POST', '/v1/checkout/sessions', $params, 'outils-checkout-' . (int) $uid . '-' . $id . '-' . wp_generate_password(10, false));
    if (is_wp_error($r)) return $r;
    if (empty($r['url'])) return new WP_Error('aled08_outils', 'Stripe n’a pas renvoyé d’adresse de paiement.');
    update_user_meta($uid, 'aled08_outils_session', (string) ($r['id'] ?? ''));
    return (string) $r['url'];
}
/* Une ligne prise : notée chez le client. « Toute la bande » remplace les lignes d'outils séparés. */
function aled08e_outils_noter($uid, $id, $item, $sub) {
    $def = aled08e_outil_def($id);
    $abos = aled08e_outils_abos($uid);
    $abos[$id] = ['item' => $item, 'sub' => $sub, 'depuis' => time(), 'fin' => 0, 'prix' => (int) ($def['prix'] ?? 0)];
    aled08e_outils_abos_sauver($uid, $abos);
    if ($id === 'bande') {
        foreach ($abos as $tid => $a) {
            if ($tid === 'bande' || empty($a['item'])) continue;
            aled08e_outils_retirer_ligne($a, 'create_prorations'); // le reste du mois de l'outil séparé revient en avoir sur la prochaine facture
            wp_clear_scheduled_hook('aled08e_outil_fin', [(int) $uid, (string) $tid, (string) $a['item']]);
            $abos = aled08e_outils_abos($uid);
            unset($abos[$tid]);
            aled08e_outils_abos_sauver($uid, $abos);
        }
    }
    aled08e_fil_ajouter($uid, $id === 'bande' ? 'mascotte' : ($def['monstre'] ?? 'mascotte'), $id === 'bande'
        ? 'Toute la bande travaille maintenant pour vous, tous les outils compris.'
        : ($def['chef'] ?: 'La bande') . ' est ravi(e) de rester : « ' . $def['nom'] . ' » est à vous.');
}
/* Retirer une ligne chez Stripe. Stripe refuse de retirer la dernière ligne d'un abonnement : on arrête alors l'abonnement
 * des outils lui-même (jamais celui du forfait, qui a toujours sa ligne « forfait »). */
function aled08e_outils_retirer_ligne($a, $prorata = 'none') {
    $r = aled08e_stripe_request('DELETE', '/v1/subscription_items/' . rawurlencode((string) $a['item']), ['proration_behavior' => $prorata], '', true);
    if (!is_wp_error($r)) return true;
    $s = aled08e_outils_lire_sub((string) ($a['sub'] ?? ''));
    if (!$s || in_array($s['status'], ['canceled', 'incomplete_expired'], true) || !in_array((string) $a['item'], $s['items'], true)) return true; // déjà parti
    if ($s['outils'] && count($s['items']) <= 1) {
        $d = aled08e_stripe_request('DELETE', '/v1/subscriptions/' . rawurlencode($s['id']), ['prorate' => $prorata === 'none' ? 'false' : 'true']);
        if (!is_wp_error($d)) return true;
    }
    aled08e_stripe_journal_add('outils : ligne non retirée', (string) $a['item'] . ' : ' . $r->get_error_message());
    return false;
}

/* Arrêter un outil : il reste actif jusqu'à la fin du mois payé, puis sa ligne est retirée de la facture */
function aled08e_outils_arreter($uid, $id) {
    $abos = aled08e_outils_abos($uid);
    $a = $abos[$id] ?? null;
    if (!aled08e_outils_abo_vivant($a)) return new WP_Error('aled08_outils', 'rien');
    if (!empty($a['fin'])) return 'deja';
    $s = aled08e_stripe_ready() ? aled08e_outils_lire_sub((string) $a['sub']) : null;
    $fin = $s ? (int) ($s['fins'][$a['item']] ?? 0) : 0;
    if ($fin <= time()) {
        // Stripe ne répond pas : la date du prochain prélèvement, d'après le jour où l'outil a été pris. Alex vérifie.
        $fin = (int) $a['depuis'];
        while ($fin <= time()) $fin = strtotime('+1 month', $fin);
        $u = get_userdata($uid);
        wp_mail(aled08e_to(), 'À vérifier : outil arrêté par ' . ($u ? $u->display_name : '#' . $uid), 'Le client a arrêté l’outil « ' . (aled08e_outil_def($id)['nom'] ?? aled08e_outil_nom_brut($id)) . ' », mais Stripe n’a pas répondu. La ligne (' . $a['item'] . ', abonnement ' . $a['sub'] . ') sera retirée le ' . wp_date('j F Y', $fin) . ". Vérifiez dans Stripe qu’elle part bien.\n", aled08e_mail_headers());
    }
    $a['fin'] = $fin;
    $abos[$id] = $a;
    aled08e_outils_abos_sauver($uid, $abos);
    // la seule ligne de l'abonnement des outils : l'abonnement entier s'arrête à la fin de la période
    if ($s && $s['outils'] && count($s['items']) <= 1) aled08e_stripe_request('POST', '/v1/subscriptions/' . rawurlencode($s['id']), ['cancel_at_period_end' => 'true'], 'outils-fin-' . $s['id'] . '-' . $fin);
    else aled08e_outils_planifier_fin($uid, $id, $a);
    return 'ok';
}
/* La ligne part deux heures avant la fin de la période : rien n'est prélevé pour le mois suivant, rien n'est remboursé */
function aled08e_outils_planifier_fin($uid, $id, $a) {
    $args = [(int) $uid, (string) $id, (string) $a['item']];
    wp_clear_scheduled_hook('aled08e_outil_fin', $args);
    wp_schedule_single_event(max(time() + 60, (int) $a['fin'] - 2 * HOUR_IN_SECONDS), 'aled08e_outil_fin', $args);
}
add_action('aled08e_outil_fin', function ($uid, $id, $item) {
    $a = aled08e_outils_abos($uid)[$id] ?? null;
    if (!$a || ($a['item'] ?? '') !== $item || empty($a['fin'])) return; // repris entre-temps
    if (aled08e_outils_retirer_ligne($a, 'none')) { $abos = aled08e_outils_abos($uid); $abos[$id]['retiree'] = 1; aled08e_outils_abos_sauver($uid, $abos); }
}, 10, 3);
/* Reprendre un outil arrêté avant la fin du mois : rien ne change sur la facture */
function aled08e_outils_reprendre($uid, $id) {
    $abos = aled08e_outils_abos($uid);
    $a = $abos[$id] ?? null;
    if (!aled08e_outils_abo_vivant($a) || empty($a['fin'])) return new WP_Error('aled08_outils', 'rien');
    if (!empty($a['retiree'])) return new WP_Error('aled08_outils', 'trop_tard');
    $s = aled08e_outils_lire_sub((string) $a['sub']);
    if ($s && $s['cancel'] && $s['outils']) {
        $r = aled08e_stripe_request('POST', '/v1/subscriptions/' . rawurlencode($s['id']), ['cancel_at_period_end' => 'false'], 'outils-reprise-' . $s['id'] . '-' . wp_generate_password(8, false));
        if (is_wp_error($r)) return $r;
    }
    wp_clear_scheduled_hook('aled08e_outil_fin', [(int) $uid, (string) $id, (string) $a['item']]);
    $a['fin'] = 0;
    $abos[$id] = $a;
    aled08e_outils_abos_sauver($uid, $abos);
    return 'ok';
}

/* Rétractation (CGV, article 20) : un consommateur qui se rétracte dans les 14 jours suivant le début de l'abonnement payant
 * paie la part du mois déjà écoulée, le reste lui est remboursé. L'outil s'arrête tout de suite, sa ligne quitte la facture ;
 * le remboursement se fait à la main par Alex (e-mail avec le calcul, trace dans le journal Stripe et chez le client). */
const ALED08E_OUTILS_RETRACTATION_JOURS = 14;
function aled08e_outils_retractable($a) { return aled08e_outils_abo_vivant($a) && empty($a['fin']) && time() - (int) ($a['depuis'] ?? 0) < ALED08E_OUTILS_RETRACTATION_JOURS * DAY_IN_SECONDS; }
function aled08e_outils_retracter($uid, $id) {
    $abos = aled08e_outils_abos($uid);
    $a = $abos[$id] ?? null;
    if (!aled08e_outils_abo_vivant($a)) return new WP_Error('aled08_outils', 'rien');
    if (!aled08e_outils_retractable($a)) return new WP_Error('aled08_outils', 'delai');
    $def = aled08e_outil_def($id) ?: ['nom' => aled08e_outil_nom_brut($id), 'prix' => (int) ($a['prix'] ?? 0)]; // outils mis de côté
    $s = aled08e_stripe_ready() ? aled08e_outils_lire_sub((string) $a['sub']) : null;
    $finPeriode = $s ? (int) ($s['fins'][$a['item']] ?? 0) : 0;
    if ($finPeriode <= time()) $finPeriode = strtotime('+1 month', (int) $a['depuis']);
    $retire = aled08e_stripe_ready() && aled08e_outils_retirer_ligne($a, 'none');
    unset($abos[$id]);
    aled08e_outils_abos_sauver($uid, $abos);
    wp_clear_scheduled_hook('aled08e_outil_fin', [(int) $uid, (string) $id, (string) $a['item']]);
    // le calcul pour Alex : la part payée qui n'a pas servi (estimation, à vérifier sur la facture Stripe)
    $jours = max(1, (int) round(($finPeriode - (int) $a['depuis']) / DAY_IN_SECONDS));
    $restant = max(0, (int) floor(($finPeriode - time()) / DAY_IN_SECONDS));
    $estim = round((float) ($a['prix'] ?? 0) * min(1, $restant / max(28, $jours)), 2);
    $trace = get_user_meta($uid, 'aled08_outils_retractations', true);
    $trace = is_array($trace) ? $trace : [];
    $trace[] = ['outil' => $id, 'le' => time(), 'depuis' => (int) $a['depuis'], 'item' => (string) $a['item'], 'sub' => (string) $a['sub'], 'estimation' => $estim];
    update_user_meta($uid, 'aled08_outils_retractations', array_slice($trace, -20));
    aled08e_stripe_journal_add('outils : rétractation', $id . ' (client ' . $uid . '), environ ' . aled08e_euro_txt($estim) . ' à rembourser');
    $u = get_userdata($uid);
    wp_mail(aled08e_to(), 'À faire : rétractation d’un outil par ' . ($u ? $u->display_name : '#' . $uid),
        ($u ? $u->display_name . ' (' . $u->user_email . ')' : 'Le client') . ' se rétracte de l’outil « ' . $def['nom'] . ' », pris le ' . wp_date('j F Y', (int) $a['depuis']) . " (moins de 14 jours).

"
        . 'L’outil est arrêté. ' . ($retire ? 'Sa ligne est retirée de la facture Stripe.' : 'ATTENTION : sa ligne n’a pas pu être retirée chez Stripe (' . $a['item'] . ', abonnement ' . $a['sub'] . ') : retirez-la à la main.') . "

"
        . 'À rembourser (CGV, article 20) : la part non écoulée de ce qui a été payé, environ ' . aled08e_euro_txt($estim) . ' (' . $restant . ' jours sur ' . $jours . ', prix ' . aled08e_outil_prix_txt($def) . "). Vérifiez la facture dans Stripe, puis remboursez depuis le paiement.

"
        . 'Fiche : ' . admin_url('user-edit.php?user_id=' . (int) $uid) . "
", aled08e_mail_headers());
    return 'ok';
}

/* Webhook (stripe.php) : la page de paiement d'un outil est payée */
function aled08e_outils_on_checkout($s) {
    $uid = (int) ($s['metadata']['user'] ?? 0);
    $id = aled08e_outils_param((string) ($s['metadata']['aled08_outils'] ?? ''));
    $sub = aled08e_stripe_id($s['subscription'] ?? '');
    $sid = (string) ($s['id'] ?? '');
    if (!$uid || !get_userdata($uid) || $id === '' || $sub === '') return 'outils : session incomplète';
    if (!in_array((string) ($s['payment_status'] ?? ''), ['paid', 'no_payment_required'], true)) return 'outils : paiement en attente';
    $faites = get_user_meta($uid, 'aled08_outils_sessions', true);
    $faites = is_array($faites) ? $faites : [];
    if (in_array($sid, $faites, true)) return 'outils : session déjà traitée';
    $faites[] = $sid;
    update_user_meta($uid, 'aled08_outils_sessions', array_slice($faites, -50));
    $cus = aled08e_stripe_id($s['customer'] ?? '');
    if ($cus) {
        aled08e_stripe_noter_customer($uid, $cus);
        aled08e_stripe_request('POST', '/v1/customers/' . rawurlencode($cus), ['invoice_settings' => ['footer' => aled08e_stripe_footer()]], 'outils-pied-' . $cus . '-' . $sid);
    }
    $sl = aled08e_outils_lire_sub($sub);
    $item = $sl && $sl['items'] ? $sl['items'][0] : '';
    $abos = aled08e_outils_abos($uid);
    $u = get_userdata($uid);
    if (aled08e_outils_abo_vivant($abos[$id] ?? null) && ($abos[$id]['sub'] ?? '') !== $sub) {
        aled08e_stripe_mail_owner('À vérifier : outil payé deux fois par ' . $u->display_name, $u->display_name . ' (' . $u->user_email . ') avait déjà l’outil « ' . aled08e_outil_def($id)['nom'] . ' » (abonnement ' . $abos[$id]['sub'] . ') et vient d’en payer un second (abonnement ' . $sub . "). Remboursez et arrêtez le second dans Stripe.\n");
        return 'outils : ' . $id . ' payé deux fois, Alex prévenu';
    }
    $ancien = aled08e_meta($uid, 'outils_sub');
    if ($ancien === '' || $ancien !== $sub) update_user_meta($uid, 'aled08_outils_sub', $sub);
    aled08e_outils_noter($uid, $id, $item, $sub);
    return 'outils : ' . $id . ' pris par le client ' . $uid;
}
/* Webhook (stripe.php) : un abonnement change ou s'arrête. Les lignes d'outils qui n'y sont plus sont oubliées. */
function aled08e_outils_on_subscription($uid, $sub, $deleted) {
    $sid = aled08e_stripe_id($sub['id'] ?? '');
    if (!$uid || $sid === '') return '';
    $statut = (string) ($sub['status'] ?? '');
    $fini = $deleted || in_array($statut, ['canceled', 'incomplete_expired', 'unpaid'], true);
    $items = array_map(function ($i) { return (string) ($i['id'] ?? ''); }, (array) ($sub['items']['data'] ?? []));
    $fins = [];
    foreach ((array) ($sub['items']['data'] ?? []) as $i) $fins[(string) ($i['id'] ?? '')] = (int) ($i['current_period_end'] ?? ($sub['current_period_end'] ?? 0));
    $abos = aled08e_outils_abos($uid);
    $chg = [];
    foreach ($abos as $tid => $a) {
        if (($a['sub'] ?? '') !== $sid) continue;
        $garde = !empty($a['fin']) && (int) $a['fin'] > time(); // arrêté par le client : actif jusqu'à la date annoncée
        if ($fini || ($items && !in_array((string) $a['item'], $items, true))) {
            if ($garde) continue;
            unset($abos[$tid]); $chg[] = $tid . ' retiré';
        } elseif (!empty($sub['cancel_at_period_end']) && empty($a['fin'])) {
            $abos[$tid]['fin'] = $fins[(string) $a['item']] ?? (int) ($sub['cancel_at'] ?? 0); $chg[] = $tid . ' s’arrête avec l’abonnement'; // le client a résilié tout l'abonnement
        }
    }
    if ($chg) aled08e_outils_abos_sauver($uid, $abos);
    if ($fini && aled08e_meta($uid, 'outils_sub') === $sid) delete_user_meta($uid, 'aled08_outils_sub');
    return $chg ? 'outils : ' . implode(', ', $chg) : '';
}

/* Au retour de la page de paiement : la session est lue tout de suite, sans attendre le webhook */
add_action('template_redirect', function () {
    if (($_GET['outils'] ?? '') !== 'ok' || empty($_GET['session']) || !is_user_logged_in() || !aled08e_stripe_ready()) return;
    $sid = sanitize_text_field(wp_unslash($_GET['session']));
    if (!preg_match('/^cs_[A-Za-z0-9_]+$/', $sid)) return;
    $s = aled08e_stripe_request('GET', '/v1/checkout/sessions/' . rawurlencode($sid), [], '', true);
    if (is_wp_error($s) || (int) ($s['metadata']['user'] ?? 0) !== get_current_user_id() || empty($s['metadata']['aled08_outils'])) return;
    aled08e_outils_on_checkout($s);
}, 2);

/* =========================================================================
 *  Les boutons de l'espace : essayer, prendre, arrêter, reprendre
 * ========================================================================= */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_outils'])) return;
    $quoi = sanitize_key(wp_unslash($_POST['aled08e_outils']));
    $id = aled08e_outils_param($_POST['outil'] ?? '');
    // outils mis de côté : seul un outil encore payé par le client peut être arrêté (ou faire l'objet d'une rétractation)
    if (!aled08e_outils_offre()) {
        $id = '';
        $v = is_string($_POST['outil'] ?? null) ? sanitize_key(wp_unslash($_POST['outil'])) : '';
        if (is_user_logged_in() && in_array($quoi, ['arreter', 'retracter'], true) && isset(aled08e_outils_restants(get_current_user_id())[$v])) $id = $v;
    }
    $onglet = (($_POST['retour'] ?? '') === 'compte') ? 'compte' : 'outils';
    $back = function ($m) use ($id, $onglet) { wp_safe_redirect(aled08e_url(['mo' => $m] + ($id ? ['choix' => $id] : []) + ($onglet === 'compte' ? ['ou' => 'compte'] : [])) . '#' . $onglet, 303); exit; };
    if (!is_user_logged_in()) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if ($id === '' || !in_array($quoi, ['essai', 'abonner', 'arreter', 'reprendre', 'retracter'], true)) $back('erreur');
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_outils'] ?? '')), 'aled08e_outils_' . $quoi . '_' . $id)) $back('erreur');
    if (!aled08e_is_client() && !current_user_can('manage_options')) $back('erreur');
    $uid = get_current_user_id();
    if (in_array($quoi, ['essai', 'abonner'], true) && !aled08e_ventes_ouvertes()) $back('ventes'); // ventes fermées : ni essai ni abonnement
    if ($quoi === 'essai') $r = aled08e_outils_essayer($uid, $id);
    elseif ($quoi === 'abonner') $r = aled08e_outils_abonner($uid, $id);
    elseif ($quoi === 'arreter') $r = aled08e_outils_arreter($uid, $id);
    elseif ($quoi === 'retracter') $r = aled08e_outils_retracter($uid, $id);
    else $r = aled08e_outils_reprendre($uid, $id);
    if (is_wp_error($r)) {
        $code = $r->get_error_code() === 'aled08_ventes' ? 'ventes' : $r->get_error_message();
        if (!in_array($code, ['ventes', 'essai_deja', 'occupe', 'stripe', 'rien', 'trop_tard', 'delai'], true)) {
            if ($quoi === 'abonner') aled08e_stripe_journal_add('outils : abonnement refusé', $id . ' (client ' . $uid . ') : ' . $r->get_error_message());
            $code = $quoi === 'abonner' ? 'paiement' : 'erreur';
        }
        $back($code);
    }
    if (is_string($r) && strpos($r, 'https://') === 0) { wp_redirect($r, 303); exit; } // phpcs:ignore WordPress.Security.SafeRedirect -- page de paiement Stripe
    $back($r === 'deja' ? 'deja' : ['essai' => 'essai_ok', 'abonner' => 'abo_ok', 'arreter' => 'arret_ok', 'reprendre' => 'reprise_ok', 'retracter' => 'retract_ok'][$quoi]);
}, 5);

/* Un lien public /mon-espace/?outil=<id> pour un client connecté : Mes outils, l'outil choisi en avant.
 * (L'ancien système d'outils, en pause, utilisait aussi ?outil= : on ne touche à rien s'il est remis en service.) */
add_action('template_redirect', function () {
    if (!is_user_logged_in() || empty($_GET['outil']) || ($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET' || aled08e_outils_on() || !is_page('mon-espace')) return;
    $id = aled08e_outils_param($_GET['outil']);
    if ($id === '') return;
    wp_safe_redirect(aled08e_url(['choix' => $id]) . '#outils', 302);
    exit;
}, 3);

/* =========================================================================
 *  Créer son compte depuis un outil : e-mail et mot de passe, connecté tout de suite (pas d'e-mail à Alex)
 * ========================================================================= */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_inscription_outil'])) return;
    $P = wp_unslash($_POST);
    $id = aled08e_outils_param($_POST['outil'] ?? '');
    $back = function ($m) use ($id) { wp_safe_redirect(aled08e_url(['inscription' => $m, 'outil' => $id ?: 'bande']) . '#inscription', 303); exit; };
    if (is_user_logged_in()) { wp_safe_redirect(aled08e_url(['choix' => $id]) . '#outils', 303); exit; }
    foreach (['prenom', 'email', 'mdp', 'site_web'] as $k) if (isset($P[$k]) && !is_string($P[$k])) $back('erreur');
    if (!empty($P['site_web'])) $back('erreur'); // piège à robots
    if (!wp_verify_nonce(sanitize_text_field((string) ($P['_aled08e_insc'] ?? '')), 'aled08e_inscription_outil')) $back('erreur');
    $ip = preg_replace('/[^0-9a-f:.]/i', '', (string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $cle = 'aled08_insc_' . md5($ip); // le même compteur que l'inscription simple : 5 comptes par heure
    $n = (int) get_transient($cle);
    if ($n >= 5) $back('trop');
    $prenom = mb_substr(sanitize_text_field((string) ($P['prenom'] ?? '')), 0, 60);
    $email = sanitize_email((string) ($P['email'] ?? ''));
    $mdp = (string) ($P['mdp'] ?? '');
    if ($prenom === '' || !is_email($email)) $back('champs');
    if (mb_strlen($mdp) < 10) $back('mdp_court');
    if (email_exists($email)) $back('existe');
    set_transient($cle, $n + 1, HOUR_IN_SECONDS);
    $r = aled08e_compte_pour_commande(['prenom' => $prenom, 'nom' => '', 'email' => $email]);
    if (is_wp_error($r) || empty($r['cree'])) $back(is_wp_error($r) ? 'erreur' : 'existe');
    $uid = (int) $r['id'];
    wp_set_password($mdp, $uid);
    update_user_meta($uid, 'aled08_inscrit_seul', current_time('mysql'));
    update_user_meta($uid, 'aled08_inscrit_outils', $id ?: 'bande');
    wp_set_current_user($uid);
    wp_set_auth_cookie($uid, true, is_ssl());
    if (function_exists('aled08e_noter_connexion')) aled08e_noter_connexion($uid);
    aled08e_fil_ajouter($uid, 'mascotte', 'Cerise vous souhaite la bienvenue chez les Minis Monstres !');
    wp_safe_redirect(aled08e_url(['choix' => $id, 'mo' => 'bienvenue']) . '#outils', 303);
    exit;
}, 4);

/* La page publique d'un outil pour un visiteur pas connecté : l'outil, créer son compte ou se connecter */
function aled08e_outils_porte_html($id) {
    $def = aled08e_outil_def($id);
    if (!$def) return '';
    $m = isset($_GET['inscription']) ? sanitize_key(wp_unslash($_GET['inscription'])) : '';
    $msgs = [
        'champs' => 'Indiquez votre prénom et une adresse e-mail valide.',
        'mdp_court' => 'Choisissez un mot de passe d’au moins 10 caractères.',
        'existe' => 'Cette adresse a déjà un compte : connectez-vous juste à côté. Mot de passe oublié ? Le lien est sous le formulaire.',
        'trop' => 'Trop d’essais depuis votre connexion. Réessayez dans une heure, ou écrivez-nous.',
        'erreur' => 'Le compte n’a pas pu être créé. Réessayez, ou écrivez-nous.',
    ];
    $alerte = isset($msgs[$m]) ? '<p class="form-alert" role="alert">' . esc_html($msgs[$m]) . '</p>' : '';
    $erreurLogin = isset($_GET['connexion']) ? '<p class="form-alert" role="alert">Adresse e-mail ou mot de passe incorrect. Réessayez, ou demandez un nouveau mot de passe.</p>' : '';
    $act = esc_url(aled08e_url());
    $bande = $id === 'bande';
    $prets = aled08e_outils_prets();
    $titre = $bande ? 'Toute la bande à votre service' : $def['nom'];
    $art = $bande ? implode('', array_map(function ($o) { return '<span>' . aled08e_monster($o['monstre']) . '</span>'; }, array_slice($prets, 0, 4))) : '<span>' . aled08e_monster($def['monstre']) . '</span>';
    $chef = $bande ? count($prets) . ' petits monstres au travail' : ($def['chef'] ? 'Avec ' . $def['chef'] : '');
    $limite = !$bande && !empty($def['limite']) ? 'Jusqu’à ' . (int) $def['limite'] . ' ' . $def['unite'] . ' par mois, compris.' : '';
    ob_start();
    ?>
<section class="section section-app mm-porte-outil"><div class="container">
  <div class="mm-po-tete c-<?php echo esc_attr($def['color'] ?? 'lilac'); ?>">
    <div class="mm-po-art<?php echo $bande ? ' is-bande' : ''; ?>" aria-hidden="true"><?php echo $art; // phpcs:ignore ?></div>
    <div class="mm-po-txt">
      <p class="mm-po-sur"><?php echo esc_html($chef); ?></p>
      <h2 class="h2"><?php echo esc_html($titre); ?></h2>
      <p><?php echo esc_html($def['court']); ?></p>
      <ul class="mm-po-points">
        <li><?php echo aled08e_icon('gift'); // phpcs:ignore ?><span><?php echo (int) aled08e_essai_jours(); ?> jours gratuits, sans carte bancaire</span></li>
        <li><?php echo aled08e_icon('euro'); // phpcs:ignore ?><span>Ensuite <?php echo esc_html(aled08e_outil_prix_txt($def)); ?>, sans engagement</span></li>
        <?php if ($limite) : ?><li><?php echo aled08e_icon('check'); // phpcs:ignore ?><span><?php echo esc_html($limite); ?></span></li><?php endif; ?>
      </ul>
    </div>
  </div>
  <div class="login-wrap mm-po-forms">
    <div class="form-card login-card" id="inscription">
      <h2 class="h3"><?php echo aled08e_icon('sparkles'); // phpcs:ignore ?>Je crée mon compte</h2>
      <p class="mm-po-note">Un compte gratuit, puis votre essai démarre en un clic. Pas besoin d’avoir un site chez nous.</p>
      <?php echo $alerte; // phpcs:ignore ?>
      <form class="form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
        <input type="hidden" name="aled08e_inscription_outil" value="1"><input type="hidden" name="outil" value="<?php echo esc_attr($id); ?>">
        <?php wp_nonce_field('aled08e_inscription_outil', '_aled08e_insc'); ?>
        <div class="hp" aria-hidden="true"><label for="po-web">Ne pas remplir</label><input id="po-web" name="site_web" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="field"><label for="po-prenom">Prénom</label><input id="po-prenom" name="prenom" type="text" autocomplete="given-name" required maxlength="60"></div>
        <div class="field"><label for="po-email">E-mail</label><input id="po-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="po-mdp">Mot de passe (10 caractères au moins)</label><input id="po-mdp" name="mdp" type="password" autocomplete="new-password" required minlength="10"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit"><?php echo aled08e_icon('arrow-right'); // phpcs:ignore ?><span>Créer mon compte</span></button>
        <p class="form-note">Votre adresse sert seulement à votre compte (<a href="<?php echo esc_url(home_url('/politique-de-confidentialite/')); ?>">confidentialité</a>).</p>
      </form>
    </div>
    <div class="form-card login-card">
      <h2 class="h3"><?php echo aled08e_icon('circle-user'); // phpcs:ignore ?>J’ai déjà un compte</h2>
      <?php echo $erreurLogin; // phpcs:ignore ?>
      <form class="form" method="post" action="<?php echo $act; // phpcs:ignore ?>">
        <input type="hidden" name="aled08_login" value="1"><input type="hidden" name="outil" value="<?php echo esc_attr($id); ?>">
        <div class="field"><label for="po-log">E-mail ou identifiant</label><input id="po-log" name="log" type="text" autocomplete="username" required></div>
        <div class="field"><label for="po-pwd">Mot de passe</label><input id="po-pwd" name="pwd" type="password" autocomplete="current-password" required></div>
        <label class="check"><input type="checkbox" name="rememberme" value="forever"><span>Rester connecté sur cet appareil</span></label>
        <button class="btn btn-light btn-lg btn-block" type="submit"><?php echo aled08e_icon('key-round'); // phpcs:ignore ?><span>Me connecter</span></button>
      </form>
      <p class="login-links"><a href="<?php echo esc_url(wp_lostpassword_url(aled08e_url(['mdp' => 'envoye']))); ?>">Mot de passe oublié ?</a></p>
    </div>
  </div>
</div></section>
    <?php
    return ob_get_clean();
}

/* =========================================================================
 *  Tous les jours : l'e-mail aimable 2 jours avant la fin d'un essai, la fin des essais, le ménage des lignes arrêtées
 * ========================================================================= */
function aled08e_outils_quotidien() {
    $now = time();
    foreach (get_users(['meta_key' => 'aled08_outils_essais', 'fields' => 'ID', 'number' => 1000]) as $uid) {
        $uid = (int) $uid;
        $u = get_userdata($uid);
        $e = aled08e_outils_essais($uid);
        if (!$u || !$e) continue;
        $etat = aled08e_outils_etat($uid);
        $bande = aled08e_bande_etat($uid);
        $bientot = [];
        foreach ($e as $id => $x) {
            $fin = (int) ($x['fin'] ?? 0);
            $def = aled08e_outil_def($id);
            if (!$def) continue;
            $garde = $id === 'bande' ? $bande['statut'] === 'actif' : in_array($etat[$id]['par'] ?? '', ['abonnement', 'bande', 'site', 'admin'], true);
            if (empty($x['mail']) && $fin > $now && $fin - $now <= 2 * DAY_IN_SECONDS + HOUR_IN_SECONDS && !$garde) { $bientot[$id] = $fin; $e[$id]['mail'] = $now; }
            if (empty($x['fini']) && $fin <= $now) {
                $e[$id]['fini'] = 1;
                if (!$garde) aled08e_fil_ajouter($uid, $id === 'bande' ? 'mascotte' : $def['monstre'], 'L’essai de « ' . $def['nom'] . ' » est fini. Vous pouvez le garder quand vous voulez, dans Mes outils.');
            }
        }
        aled08e_outils_essais_sauver($uid, $e);
        if ($bientot) {
            $noms = [];
            foreach ($bientot as $id => $fin) { $d = aled08e_outil_def($id); $noms[] = '« ' . $d['nom'] . ' » (' . aled08e_outil_prix_txt($d) . ')'; }
            $id1 = (string) array_key_first($bientot);
            $d1 = aled08e_outil_def($id1);
            $corps = 'Bonjour ' . aled08e_prenom($u) . ",\n\n"
                . ($id1 === 'bande' ? 'Toute la bande' : ($d1['chef'] ?: 'La bande')) . ' a été ravi(e) de travailler pour vous ! Votre essai gratuit de ' . implode(' et de ', $noms) . ' se termine le ' . wp_date('l j F', $bientot[$id1]) . ".\n\n"
                . "Rien ne sera prélevé : sans rien faire, l’outil s’arrête tout simplement, et vos réglages restent gardés.\n\n"
                . "Il vous a plu ? Vous le gardez en un clic, sans engagement, depuis votre espace :\n" . aled08e_url(['choix' => $id1]) . "#outils\n\n"
                . "À bientôt,\nAlex et les Minis Monstres\n";
            wp_mail($u->user_email, 'Votre essai de ' . ($id1 === 'bande' ? 'toute la bande' : $d1['nom']) . ' se termine dans 2 jours', $corps, aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>'));
        }
    }
    // les lignes arrêtées : retirées si la tâche du jour J n'est pas passée ; les lignes au bout de leur mois sont oubliées
    foreach (get_users(['meta_key' => 'aled08_outils_abos', 'fields' => 'ID', 'number' => 1000]) as $uid) {
        $abos = aled08e_outils_abos($uid);
        $chg = false;
        foreach ($abos as $id => $a) {
            if (empty($a['fin'])) continue;
            if ((int) $a['fin'] <= $now + 3 * HOUR_IN_SECONDS && empty($a['retiree']) && aled08e_stripe_ready() && aled08e_outils_retirer_ligne($a, 'none')) { $abos[$id]['retiree'] = 1; $chg = true; }
            if ((int) $a['fin'] < $now - DAY_IN_SECONDS) { unset($abos[$id]); $chg = true; }
        }
        if ($chg) aled08e_outils_abos_sauver($uid, $abos);
    }
}
add_action('aled08_quotidien', 'aled08e_outils_quotidien', 40);

/* =========================================================================
 *  L'abonnement du client, ligne par ligne (accueil et Mon compte)
 * ========================================================================= */
/* [['type' => forfait|domaine|extra|outil|bande, 'id', 'nom', 'prix' => float, 'txt' => texte à la place du prix, 'mois' => bool (compte dans le total du mois), 'fin' => ts]] */
function aled08e_abonnement_lignes($uid) {
    $D = aled08e_data();
    $l = [];
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mult = $annuel ? max(1, 12 - (int) ($D['moisOfferts'] ?? 2)) : 1;
    $per = $annuel ? 'par an' : '';
    if (aled08e_meta($uid, 'forfait') !== '' && !(function_exists('aled08e_sans_forfait') && aled08e_sans_forfait($uid))) {
        $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
        $offert = aled08e_meta($uid, 'offert') === '1';
        $nom = aled08e_meta($uid, 'forfait_nom') !== '' ? aled08e_meta($uid, 'forfait_nom') : ($f['name'] ?? '');
        $l[] = ['type' => 'forfait', 'id' => 'forfait', 'nom' => 'Forfait ' . $nom . ' (site)', 'prix' => $offert ? 0 : (float) $f['month'] * $mult, 'txt' => $offert ? 'offert' : $per, 'mois' => !$annuel, 'fin' => 0];
        $dom = function_exists('aled08e_domaine_mensuel') ? (float) aled08e_domaine_mensuel($uid) : 0;
        if ($dom > 0) $l[] = ['type' => 'domaine', 'id' => 'domaine', 'nom' => 'Nom de domaine', 'prix' => $offert ? 0 : $dom * $mult, 'txt' => $offert ? 'offert' : $per, 'mois' => !$annuel, 'fin' => 0];
        foreach (aled08e_extras() as $o) if (aled08e_extra_actif($uid, $o['id'])) $l[] = ['type' => 'extra', 'id' => $o['id'], 'nom' => $o['name'], 'prix' => $offert ? 0 : (float) $o['month'] * $mult, 'txt' => $offert ? 'offert' : $per, 'mois' => !$annuel, 'fin' => 0];
    }
    if (!aled08e_outils_offre()) return $l;
    $abos = aled08e_outils_abos($uid);
    $b = aled08e_bande_etat($uid);
    if ($b['statut'] === 'actif') $l[] = ['type' => 'bande', 'id' => 'bande', 'nom' => aled08e_outil_def('bande')['nom'], 'prix' => (float) ($abos['bande']['prix'] ?? $b['prix']), 'txt' => '', 'mois' => true, 'fin' => (int) $b['fin']];
    elseif ($b['statut'] === 'essai') $l[] = ['type' => 'bande', 'id' => 'bande', 'nom' => aled08e_outil_def('bande')['nom'], 'prix' => 0, 'txt' => 'essai jusqu’au ' . wp_date('j F', $b['fin_essai']), 'mois' => false, 'fin' => 0];
    foreach (aled08e_outils_etat($uid) as $id => $e) {
        $def = aled08e_outil_def($id);
        if ($e['par'] === 'abonnement') $l[] = ['type' => 'outil', 'id' => $id, 'nom' => $def['nom'], 'prix' => (float) ($abos[$id]['prix'] ?? $e['prix']), 'txt' => '', 'mois' => true, 'fin' => (int) ($abos[$id]['fin'] ?? 0)];
        elseif ($e['par'] === 'site') $l[] = ['type' => 'outil', 'id' => $id, 'nom' => $def['nom'], 'prix' => 0, 'txt' => 'inclus', 'mois' => false, 'fin' => 0];
        elseif ($e['statut'] === 'essai' && $b['statut'] !== 'essai') $l[] = ['type' => 'outil', 'id' => $id, 'nom' => $def['nom'], 'prix' => 0, 'txt' => 'essai jusqu’au ' . wp_date('j F', $e['fin_essai']), 'mois' => false, 'fin' => 0];
    }
    return $l;
}
/* Le prix d'une ligne en HTML */
function aled08e_abonnement_prix_html($x) {
    if ($x['txt'] === 'offert') return '<s class="app-barre">' . aled08e_euro($x['prix'] ?: 0) . '</s> <b class="app-offert">Offert</b>';
    if ($x['prix'] <= 0 && $x['txt'] !== '') return esc_html($x['txt']);
    return aled08e_euro($x['prix']) . ($x['txt'] !== '' ? ' <small>' . esc_html($x['txt']) . '</small>' : '');
}
/* Le bloc « Mon abonnement » de l'accueil */
function aled08e_abonnement_resume_html($uid) {
    $l = aled08e_abonnement_lignes($uid);
    $h = '<section class="mm-bloc mm-abo" aria-labelledby="mm-abo-t"><h3 class="mm-bloc-t" id="mm-abo-t">Mon abonnement</h3>';
    if (!$l && aled08e_outils_offre()) return $h . '<p class="mm-vide-txt">Rien pour le moment. Un outil vous tente ? Les ' . (int) aled08e_essai_jours() . ' premiers jours sont offerts.</p><button type="button" class="btn btn-light btn-sm" data-go="outils">' . aled08e_icon('toolbox') . '<span>Voir les outils</span></button></section>';
    // outils mis de côté : un compte sans site n'a rien à payer (la carte « Mon site », juste au-dessus, mène à « Créer mon site »)
    if (!$l) return $h . '<p class="mm-vide-txt">Rien pour le moment : aucun abonnement, rien à payer. Quand votre site sera chez nous, son forfait s’affichera ici.</p></section>';
    $total = 0.0;
    $h .= '<ul class="mm-abo-l">';
    foreach ($l as $x) {
        if ($x['mois'] && $x['txt'] !== 'offert') $total += $x['prix'];
        $h .= '<li><span>' . esc_html($x['nom']) . ($x['fin'] ? '<small>jusqu’au ' . esc_html(wp_date('j F', $x['fin'])) . '</small>' : '') . '</span><b>' . aled08e_abonnement_prix_html($x) . '</b></li>'; // phpcs:ignore
    }
    $h .= '</ul><p class="mm-abo-total"><span>Chaque mois</span><b>' . aled08e_euro($total) . '</b></p>';
    $annuel = (bool) array_filter($l, function ($x) { return $x['txt'] === 'par an'; });
    if (!aled08e_outils_offre()) return $h . '<p class="mm-abo-note">' . ($annuel ? 'Votre forfait est payé à l’année. ' : 'Une seule facture chaque mois. ') . 'Sans engagement.</p></section>';
    return $h . '<p class="mm-abo-note">' . ($annuel ? 'Votre forfait est payé à l’année ; les outils, chaque mois. ' : 'Une seule facture. ') . 'Chaque outil s’arrête quand vous voulez.</p></section>';
}

/* Un petit formulaire d'action sur un outil (avec son nonce). $achat : bouton grisé tant que les ventes sont fermées. */
function aled08e_outils_bouton($quoi, $id, $label, $icone, $classe = 'btn btn-primary btn-sm', $achat = false, $retour = 'outils', $confirmer = false) {
    return '<form class="mo-form" method="post" action="' . esc_url(aled08e_url()) . '"' . ($confirmer ? ' data-confirmer' : '') . '><input type="hidden" name="aled08e_outils" value="' . esc_attr($quoi) . '"><input type="hidden" name="outil" value="' . esc_attr($id) . '"><input type="hidden" name="retour" value="' . esc_attr($retour) . '">'
        . wp_nonce_field('aled08e_outils_' . $quoi . '_' . $id, '_aled08e_outils', false, false)
        . '<button class="' . esc_attr($classe) . '" type="submit"' . ($achat ? ' data-achat' : '') . '>' . aled08e_icon($icone) . '<span>' . esc_html($label) . '</span></button></form>';
}

/* Les lignes de l'abonnement dans « Mon compte », avec « Arrêter cet outil » */
function aled08e_abonnement_outils_compte_html($uid) {
    if (!aled08e_outils_offre()) return aled08e_outils_restants_compte_html($uid);
    $lignes = array_values(array_filter(aled08e_abonnement_lignes($uid), function ($x) { return in_array($x['type'], ['outil', 'bande'], true); }));
    $h = '<p class="app-sub">' . aled08e_icon('toolbox') . ' Mes outils</p>';
    if (!$lignes) return $h . '<p class="esp-empty">Aucun outil pour le moment. <button type="button" class="link-btn" data-go="outils">Voir les outils</button> : ' . (int) aled08e_essai_jours() . ' jours gratuits pour chacun.</p>';
    $h .= '<ul class="mo-lignes">';
    foreach ($lignes as $x) {
        $def = aled08e_outil_def($x['id']);
        $abo = aled08e_outils_abos($uid)[$x['id']] ?? null;
        $act = '';
        if ($abo && aled08e_outils_abo_vivant($abo)) {
            $act = empty($abo['fin'])
                ? aled08e_outils_bouton('arreter', $x['id'], 'Arrêter cet outil', 'x', 'btn btn-light btn-sm', false, 'compte', true)
                : (empty($abo['retiree']) ? aled08e_outils_bouton('reprendre', $x['id'], 'Le garder', 'rotate-ccw', 'btn btn-light btn-sm', false, 'compte') : '');
            if (aled08e_outils_retractable($abo)) $act .= '<details class="mo-retract"><summary>Je me rétracte</summary><p>Vous l’avez pris le ' . esc_html(wp_date('j F', (int) $abo['depuis'])) . ' : pendant 14 jours, vous pouvez vous rétracter. L’outil s’arrête tout de suite, vous payez seulement les jours passés, le reste vous est remboursé.</p>'
                . aled08e_outils_bouton('retracter', $x['id'], 'Me rétracter et être remboursé', 'rotate-ccw', 'btn btn-light btn-sm', false, 'compte', true) . '</details>';
        } elseif (strpos($x['txt'], 'essai') === 0) {
            $act = aled08e_outils_bouton('abonner', $x['id'], 'Le garder pour ' . aled08e_outil_prix_txt($def), 'credit-card', 'btn btn-primary btn-sm', true, 'compte');
        }
        $h .= '<li><span class="mo-ligne-art" aria-hidden="true">' . aled08e_monster($x['id'] === 'bande' ? 'mascotte' : $def['monstre']) . '</span><span class="mo-ligne-nom"><strong>' . esc_html($x['nom']) . '</strong>'
            . ($x['fin'] ? '<small>Arrêté : actif jusqu’au ' . esc_html(wp_date('j F Y', $x['fin'])) . ', puis plus rien n’est prélevé</small>' : '') . '</span><b>' . aled08e_abonnement_prix_html($x) . '</b>' . $act . '</li>'; // phpcs:ignore
    }
    $h .= '</ul><p class="app-note">Arrêter un outil ne touche à rien d’autre : il reste à vous jusqu’à la fin du mois payé, puis sa ligne quitte votre facture. Un essai gratuit, lui, s’arrête tout seul : il ne devient jamais payant sans votre clic.</p>';
    if (aled08e_meta($uid, 'stripe_subscription') !== '' && array_filter($lignes, function ($x) { return $x['prix'] > 0; })) $h .= '<p class="app-note">Vos outils sont sur la même facture que votre forfait : si vous résiliez le forfait, ils s’arrêtent avec lui. Vous pourrez les reprendre seuls.</p>';
    return $h;
}

/* =========================================================================
 *  L'onglet « Mes outils »
 * ========================================================================= */
/* Le message après une action faite depuis « Mon compte » (arrêter, reprendre, se rétracter) : affiché là-bas, pas dans Mes outils */
function aled08e_outils_flash_html_compte() { return (($_GET['ou'] ?? '') === 'compte') ? aled08e_outils_flash_html(true) : ''; }
function aled08e_outils_flash_html($ici = false) {
    if (!$ici && ($_GET['ou'] ?? '') === 'compte') return '';
    $m = isset($_GET['mo']) ? sanitize_key(wp_unslash($_GET['mo'])) : '';
    $o = isset($_GET['outils']) ? sanitize_key(wp_unslash($_GET['outils'])) : '';
    $id = aled08e_outils_param($_GET['choix'] ?? '');
    $def = $id ? aled08e_outil_def($id) : null;
    $nom = $def ? '« ' . $def['nom'] . ' »' : 'l’outil';
    $j = (int) aled08e_essai_jours();
    $abo = $id && is_user_logged_in() ? (aled08e_outils_abos(get_current_user_id())[$id] ?? null) : null;
    $msgs = [
        'bienvenue' => ['esp-empty', 'Bienvenue ! Votre compte est prêt. ' . ($def ? 'Lancez votre essai de ' . $nom . ' juste en dessous : ' . $j . ' jours gratuits, sans carte.' : 'Choisissez un outil : ' . $j . ' jours gratuits, sans carte.')],
        'essai_ok' => ['esp-empty', 'C’est parti : ' . $nom . ' est à vous pendant ' . $j . ' jours, gratuitement. Aucune carte, rien à payer. On vous écrit 2 jours avant la fin.'],
        'abo_ok' => ['esp-empty', 'Merci ! ' . ucfirst($nom) . ' est à vous. La part du mois en cours est payée maintenant, ensuite il est sur votre facture de chaque mois.'],
        'arret_ok' => ['esp-empty', 'C’est noté : ' . $nom . ' s’arrête' . ($abo && !empty($abo['fin']) ? ' le ' . wp_date('j F', (int) $abo['fin']) : ' à la fin du mois payé') . (aled08e_outils_offre() ? '. Vous le gardez jusque-là, et rien d’autre ne change.' : '. Plus rien n’est prélevé ensuite, et rien d’autre ne change.')],
        'reprise_ok' => ['esp-empty', 'Parfait, vous gardez ' . $nom . '. Rien ne change sur votre facture.'],
        'retract_ok' => ['esp-empty', 'C’est noté : ' . $nom . ' est arrêté. Vous payez seulement les jours passés : le reste vous est remboursé sous quelques jours, sur votre carte.'],
        'delai' => ['esp-warn', 'Les 14 jours de rétractation sont passés. Vous pouvez arrêter l’outil : il s’arrête à la fin du mois payé.'],
        'deja' => ['esp-empty', 'Vous avez déjà ' . $nom . '.'],
        'essai_deja' => ['esp-warn', 'Vous avez déjà essayé ' . $nom . '. Vous pouvez le garder quand vous voulez, sans engagement.'],
        'ventes' => ['esp-warn', aled08e_ventes_message()],
        'occupe' => ['esp-warn', 'Un instant : votre demande précédente est encore en cours. Réessayez dans une minute.'],
        'stripe' => ['esp-warn', 'Le paiement en ligne n’est pas encore prêt. Écrivez-nous : on s’en occupe tout de suite.'],
        'paiement' => ['esp-warn', 'Le paiement n’a pas abouti, rien n’a été pris. Vérifiez votre carte (Mon compte, « Gérer mon paiement »), puis réessayez.'],
        'trop_tard' => ['esp-warn', 'Cet outil vient de quitter votre facture : reprenez-le simplement depuis Mes outils.'],
        'rien' => ['esp-warn', 'Cet outil n’est pas dans votre abonnement.'],
        'erreur' => ['esp-warn', 'Ça n’a pas marché. Rechargez la page et réessayez, ou écrivez-nous.'],
    ];
    if ($o === 'ok') return '<p class="esp-empty" role="status">Merci, votre paiement est bien reçu ! ' . esc_html(ucfirst($nom)) . ' est à vous : il apparaît ici dans un instant.</p>';
    if ($o === 'annule') return '<p class="esp-warn" role="status">Le paiement n’a pas été fait : rien n’est pris. Vous pouvez recommencer quand vous voulez.</p>';
    return isset($msgs[$m]) ? '<p class="' . $msgs[$m][0] . '" role="status">' . esc_html($msgs[$m][1]) . '</p>' : '';
}

/* L'usage du mois d'un outil (atelier-outils.php), en petite barre */
function aled08e_outils_usage_html($uid, $id, $def) {
    if (!function_exists('aled08e_outil_usage')) return '';
    $u = aled08e_outil_usage($uid, $id);
    if (!is_array($u) || empty($u['limite'])) return '';
    $fait = max(0, (int) ($u['fait'] ?? 0));
    $lim = max(1, (int) $u['limite']);
    $pct = min(100, (int) round($fait * 100 / $lim));
    return '<div class="mo-usage' . ($pct >= 90 ? ' is-plein' : '') . '"><p><span>Ce mois-ci</span><b>' . $fait . ' / ' . $lim . ' ' . esc_html((string) ($def['unite'] ?? '')) . '</b></p><span class="mo-usage-barre" aria-hidden="true"><i style="width:' . $pct . '%"></i></span>'
        . ($fait >= $lim ? '<small>La limite du mois est atteinte : l’outil reprend le 1er du mois, sans rien payer de plus.</small>' : '') . '</div>';
}

/* Une carte d'outil */
function aled08e_outils_carte_html($uid, $def, $e, $choisi, $bandeEssaiPossible) {
    $id = $def['id'];
    $classes = 'mo-carte c-' . sanitize_html_class($def['color'] ?? 'lilac') . ($choisi ? ' is-choisi' : '') . ($e['statut'] === 'bientot' ? ' is-bientot' : '') . (in_array($e['statut'], ['actif', 'essai'], true) ? ' is-pris' : '');
    $badge = '';
    if ($e['statut'] === 'bientot') $badge = '<em class="mo-badge">Bientôt</em>';
    elseif ($e['par'] === 'site') $badge = '<em class="mo-badge is-ok">' . aled08e_icon('check') . 'Inclus avec votre site</em>';
    elseif ($e['par'] === 'bande') $badge = '<em class="mo-badge is-ok">' . aled08e_icon('check') . 'Avec toute la bande</em>';
    elseif ($e['par'] === 'admin') $badge = '<em class="mo-badge is-ok">Administrateur</em>';
    elseif ($e['statut'] === 'actif') $badge = '<em class="mo-badge is-ok">' . aled08e_icon('check') . 'À vous</em>';
    elseif ($e['statut'] === 'essai') $badge = '<em class="mo-badge is-essai">' . aled08e_icon('hourglass') . 'Essai : encore ' . aled08e_outils_jours_restants($e['fin_essai']) . ' j</em>';
    elseif (!empty($def['tag'])) $badge = '<em class="mo-badge">' . esc_html($def['tag']) . '</em>';
    $h = '<article class="' . esc_attr($classes) . '" id="outil-' . esc_attr($id) . '"' . ($choisi ? ' data-mo-choisi' : '') . '>'
        . '<header class="mo-tete"><span class="mo-art" aria-hidden="true">' . aled08e_monster($def['monstre']) . '</span><div class="mo-nom"><strong>' . esc_html($def['nom']) . '</strong>' . ($def['chef'] ? '<small>avec ' . esc_html($def['chef']) . '</small>' : '') . '</div>'
        . '<span class="mo-prix"><b>' . esc_html(aled08e_euro_txt((int) $def['prix'])) . '</b><small>par mois</small></span></header>'
        . $badge . '<p class="mo-court">' . esc_html($def['court']) . '</p>';
    if ($e['statut'] === 'bientot') return $h . '<p class="mo-etat">' . aled08e_icon('clock') . '<span>' . esc_html($def['chef'] ?: 'La bande') . ' le prépare : il arrive très bientôt.</span></p></article>';
    if (!empty($def['limite'])) $h .= '<p class="mo-limite">' . aled08e_icon('check') . '<span>Jusqu’à ' . (int) $def['limite'] . ' ' . esc_html($def['unite']) . ' par mois, compris</span></p>';
    $abo = aled08e_outils_abos($uid)[$id] ?? null;
    if (in_array($e['statut'], ['actif', 'essai'], true)) {
        $h .= aled08e_outils_usage_html($uid, $id, $def);
        if ($abo && !empty($abo['fin'])) $h .= '<p class="mo-etat">' . aled08e_icon('clock') . '<span>Arrêté : à vous jusqu’au ' . esc_html(wp_date('j F', (int) $abo['fin'])) . '</span></p>';
        $h .= '<div class="mo-actions"><a class="btn btn-primary btn-sm" href="' . esc_url(aled08e_url(['choix' => $id])) . '#outils">' . aled08e_icon('play') . '<span>Ouvrir l’outil</span></a>';
        if ($e['statut'] === 'essai') $h .= aled08e_outils_bouton('abonner', $id, 'Le garder : ' . aled08e_outil_prix_txt($def), 'credit-card', 'btn btn-light btn-sm', true);
        return $h . '</div></article>';
    }
    // pas encore pris
    $h .= '<div class="mo-actions">';
    if (!aled08e_outils_essai_pris($uid, $id)) $h .= aled08e_outils_bouton('essai', $id, 'Essayer ' . (int) aled08e_essai_jours() . ' jours', 'gift', 'btn btn-primary btn-sm', true) . aled08e_outils_bouton('abonner', $id, 'Le prendre tout de suite', 'credit-card', 'link-btn', true);
    else $h .= '<p class="mo-etat">' . aled08e_icon('hourglass') . '<span>Votre essai est fini. ' . esc_html($def['chef'] ?: 'La bande') . ' vous attend !</span></p>' . aled08e_outils_bouton('abonner', $id, 'Continuer pour ' . aled08e_outil_prix_txt($def), 'credit-card', 'btn btn-primary btn-sm', true);
    return $h . '</div></article>';
}

/* La carte « Toute la bande » */
function aled08e_outils_bande_html($uid, $choisi) {
    $def = aled08e_outil_def('bande');
    $prets = aled08e_outils_prets();
    if (!$def || count($prets) < 2) return '';
    $somme = array_sum(array_map(function ($o) { return (int) $o['prix']; }, $prets));
    $b = aled08e_bande_etat($uid);
    $abo = aled08e_outils_abos($uid)['bande'] ?? null;
    $h = '<section class="mo-bande' . ($choisi ? ' is-choisi' : '') . ($b['statut'] !== 'inactif' ? ' is-pris' : '') . '" id="outil-bande"' . ($choisi ? ' data-mo-choisi' : '') . '>'
        . '<div class="mo-bande-art" aria-hidden="true">' . implode('', array_map(function ($o) { return '<span>' . aled08e_monster($o['monstre']) . '</span>'; }, array_slice($prets, 0, 5))) . '</div>'
        . '<div class="mo-bande-txt"><h3>' . esc_html($def['nom']) . '</h3><p>' . esc_html($def['court'] ?: 'Tous les outils prêts, et les prochains dès leur sortie.') . '</p>'
        . '<p class="mo-bande-prix"><b>' . esc_html(aled08e_outil_prix_txt($def)) . '</b>' . ($somme > (int) $def['prix'] ? ' <small>au lieu de ' . esc_html(aled08e_euro_txt($somme)) . ' outil par outil</small>' : '') . '</p></div><div class="mo-bande-act">';
    if ($b['statut'] === 'actif') $h .= '<em class="mo-badge is-ok">' . aled08e_icon('check') . 'Toute la bande est à vous</em>' . ($abo && !empty($abo['fin']) ? '<small class="mo-fin">jusqu’au ' . esc_html(wp_date('j F', (int) $abo['fin'])) . '</small>' : '');
    elseif ($b['statut'] === 'essai') $h .= '<em class="mo-badge is-essai">' . aled08e_icon('hourglass') . 'Essai : encore ' . aled08e_outils_jours_restants($b['fin_essai']) . ' j</em>' . aled08e_outils_bouton('abonner', 'bande', 'La garder : ' . aled08e_outil_prix_txt($def), 'credit-card', 'btn btn-primary btn-sm', true);
    elseif (!aled08e_outils_essai_pris($uid, 'bande')) $h .= aled08e_outils_bouton('essai', 'bande', 'Essayer toute la bande ' . (int) aled08e_essai_jours() . ' jours', 'gift', 'btn btn-primary btn-sm', true) . aled08e_outils_bouton('abonner', 'bande', 'La prendre tout de suite', 'credit-card', 'link-btn', true);
    else $h .= aled08e_outils_bouton('abonner', 'bande', 'Prendre toute la bande : ' . aled08e_outil_prix_txt($def), 'credit-card', 'btn btn-primary btn-sm', true);
    return $h . '</div></section>';
}

/* L'écran de travail de l'outil choisi (atelier-outils.php), en grand, en haut de l'onglet */
function aled08e_outils_ecran_html($uid, $id) {
    $def = aled08e_outil_def($id);
    if (!$def || $id === 'bande' || !aled08e_outil_actif($uid, $id)) return '';
    $corps = function_exists('aled08e_outil_html') ? (string) aled08e_outil_html($uid, $id) : '';
    if ($corps === '') $corps = '<p class="mm-vide">' . aled08e_monster($def['monstre']) . '<span>' . esc_html($def['chef'] ?: 'La bande') . ' range ses affaires : l’écran de « ' . esc_html($def['nom']) . ' » arrive très bientôt ici. Votre essai ne commence vraiment qu’à ce moment-là : on vous prévient.</span></p>';
    return '<section class="mo-ecran c-' . sanitize_html_class($def['color'] ?? 'lilac') . '" id="outil-ecran" data-mo-choisi aria-labelledby="mo-ecran-t">'
        . '<header class="mo-ecran-tete"><span class="mo-art" aria-hidden="true">' . aled08e_monster($def['monstre']) . '</span><div><h3 id="mo-ecran-t">' . esc_html($def['nom']) . '</h3>' . ($def['chef'] ? '<small>' . esc_html($def['chef']) . ' travaille pour vous</small>' : '') . '</div>'
        . '<a class="btn btn-light btn-sm" href="' . esc_url(aled08e_url()) . '#outils">' . aled08e_icon('x') . '<span>Fermer</span></a></header>'
        . aled08e_outils_usage_html($uid, $id, $def) . '<div class="mo-ecran-corps">' . $corps . '</div></section>';
}

/* Tout l'onglet « Mes outils » */
function aled08e_outils_panel_html($uid) {
    if (!aled08e_outils_offre()) return '<h2 class="app-h">Mes outils</h2><p class="esp-empty">Les outils arrivent très bientôt.</p>';
    $choix = ($_GET['ou'] ?? '') === 'compte' ? '' : aled08e_outils_param($_GET['choix'] ?? '');
    $etat = aled08e_outils_etat($uid);
    $h = '<h2 class="app-h">Mes outils</h2><p class="app-p">De petits monstres qui travaillent pour vous, tous les jours. ' . (int) aled08e_essai_jours() . ' jours gratuits pour chaque outil, sans carte bancaire. Ensuite, chacun s’arrête quand vous voulez.</p>'
        . aled08e_outils_flash_html();
    if (!aled08e_ventes_ouvertes()) $h .= '<p class="esp-warn mo-ventes">' . aled08e_icon('clock') . '<span>' . esc_html(aled08e_ventes_message()) . '</span></p>';
    if ($choix && $choix !== 'bande') $h .= aled08e_outils_ecran_html($uid, $choix);
    $cartes = '';
    $pris = '';
    foreach (aled08e_outils_liste() as $o) {
        $def = aled08e_outil_def($o['id']);
        $e = $etat[$o['id']] ?? ['statut' => 'bientot', 'fin_essai' => 0, 'prix' => 0, 'par' => ''];
        $c = aled08e_outils_carte_html($uid, $def, $e, $choix === $o['id'] && !in_array($e['statut'], ['actif', 'essai'], true), false);
        if (in_array($e['statut'], ['actif', 'essai'], true)) $pris .= $c; else $cartes .= $c;
    }
    if ($pris !== '') $h .= '<p class="app-sub">' . aled08e_icon('check') . ' Vos outils</p><div class="mo-grille">' . $pris . '</div>';
    $h .= aled08e_outils_bande_html($uid, $choix === 'bande');
    if ($cartes !== '') $h .= '<p class="app-sub">' . aled08e_icon('sparkles') . ' ' . ($pris !== '' ? 'Les autres outils' : 'Les outils de la bande') . '</p><div class="mo-grille">' . $cartes . '</div>';
    $h .= '<p class="app-note mo-pied">' . aled08e_icon('receipt') . '<span>Une seule facture chaque mois, avec ' . (aled08e_meta($uid, 'forfait') !== '' ? 'votre forfait et ' : '') . 'vos outils. L’usage est compris, avec une limite raisonnable par mois : une fois atteinte, l’outil attend le mois suivant, sans supplément. Un essai s’arrête tout seul, sans jamais devenir payant. Pour arrêter un outil : Mon compte, « Arrêter cet outil ».</span></p>';
    // l'outil choisi (lien public, retour de paiement) : on le montre
    $h .= '<script>(function(){var c=document.querySelector("[data-mo-choisi]");if(!c)return;window.addEventListener("load",function(){setTimeout(function(){var p=c.closest("[role=tabpanel]");if(p&&p.hidden)return;var e=document.querySelector(".site-header");window.scrollBy({top:c.getBoundingClientRect().top-((e?e.offsetHeight:70)+16),behavior:"smooth"});},250);});})();</script>';
    return $h;
}

/* =========================================================================
 *  L'accueil : les cartes par atelier, la porte « Créer mon site », le petit encart « Nouveau »
 * ========================================================================= */
/* $site : ['ok' => bool (un site, en ligne ou en création), 'host', 'etat', 'formule' => bool] */
function aled08e_ateliers_cartes_html($uid, $site) {
    $cartes = '';
    foreach ((array) (aled08e_data()['ateliers'] ?? []) as $a) {
        if (!empty($a['cache']) || ($a['id'] ?? '') === 'maison') continue;
        if ($a['id'] === 'sites') {
            $sub = $site['ok'] ? trim(($site['etat'] ?? '') . ($site['host'] ? ' · ' . $site['host'] : '')) : 'Pas encore de site chez nous';
            $btn = $site['ok']
                ? ($site['formule'] ? '<button type="button" class="btn btn-light btn-sm" data-go="demandes">' . aled08e_icon('pencil') . '<span>Demander une modification</span></button>' : '<button type="button" class="btn btn-light btn-sm" data-go="site">' . aled08e_icon('globe') . '<span>Voir mon site</span></button>')
                : '<a class="btn btn-light btn-sm" href="' . esc_url(home_url('/creer-mon-site/')) . '">' . aled08e_icon('wand-sparkles') . '<span>Créer mon site</span></a>';
            $cartes .= '<article class="mm-carte c-' . esc_attr($a['color']) . '"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">' . aled08e_monster($a['monstre']) . '</span><div><strong>Mon site</strong><small>' . esc_html($sub) . '</small></div></div>' . $btn . '</article>';
            continue;
        }
        if ($a['id'] === 'ecole' && function_exists('aled08e_aide_carte_accueil_html')) { $cartes .= aled08e_aide_carte_accueil_html($a); continue; } // Mes Tutos (gratuits, includes/aide.php)
        if ($a['id'] === 'outils' && aled08e_outils_offre()) {
            $n = 0;
            foreach (aled08e_outils_etat($uid) as $id => $e) {
                if (!in_array($e['statut'], ['actif', 'essai'], true) || $n >= 3) continue;
                $def = aled08e_outil_def($id);
                $u = function_exists('aled08e_outil_usage') ? aled08e_outil_usage($uid, $id) : null;
                $sub = $e['statut'] === 'essai' ? 'Essai : encore ' . aled08e_outils_jours_restants($e['fin_essai']) . ' jours'
                    : (is_array($u) && isset($u['fait']) ? (int) $u['fait'] . ' ' . $def['unite'] . ' ce mois-ci' : ($e['par'] === 'site' ? 'Inclus avec votre site' : 'Prêt à travailler'));
                $cartes .= '<article class="mm-carte c-' . esc_attr($def['color']) . '"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">' . aled08e_monster($def['monstre']) . '</span><div><strong>' . esc_html($def['nom']) . '</strong><small>' . esc_html($sub) . '</small></div></div>'
                    . '<a class="btn btn-light btn-sm" href="' . esc_url(aled08e_url(['choix' => $id])) . '#outils">' . aled08e_icon('play') . '<span>Ouvrir</span></a></article>';
                $n++;
            }
            if (!$n) $cartes .= '<article class="mm-carte c-' . esc_attr($a['color']) . '"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">' . aled08e_monster($a['monstre']) . '</span><div><strong>' . esc_html($a['label']) . '</strong><small>' . (int) aled08e_essai_jours() . ' jours gratuits pour chaque outil, sans carte</small></div></div>'
                . '<button type="button" class="btn btn-light btn-sm" data-go="outils">' . aled08e_icon('toolbox') . '<span>Découvrir les outils</span></button></article>';
        }
    }
    return $cartes !== '' ? '<div class="mm-cartes">' . $cartes . '</div>' : '';
}
/* « Mon site » pour un compte sans site : une jolie porte vers /creer-mon-site/ */
function aled08e_site_porte_html() {
    $D = aled08e_data();
    $prix = (int) ($D['creation']['prix'] ?? 400);
    $mini = aled08e_forfait('base');
    $at = [];
    foreach ((array) ($D['ateliers'] ?? []) as $a) if (($a['id'] ?? '') === 'sites') $at = $a;
    return '<h2 class="app-h">Mon site</h2><section class="mm-porte c-mint">'
        . '<span class="mm-porte-art" aria-hidden="true">' . aled08e_monster('bricou') . '</span>'
        . '<div class="mm-porte-txt"><p class="mm-po-sur">Avec Bricou</p><h3>Votre site, en ligne en 24 à 48 heures</h3>'
        . '<p>' . esc_html($at['court'] ?? 'Votre site professionnel en 24 à 48 heures, puis on s’en occupe chaque mois.') . '</p>'
        . '<ul class="mm-po-points"><li>' . aled08e_icon('check') . '<span>' . esc_html(aled08e_euro_txt($prix)) . ' la création, payée une fois</span></li>'
        . '<li>' . aled08e_icon('check') . '<span>Puis le forfait ' . esc_html($mini['name'] ?? 'Mini') . ' : ' . esc_html(aled08e_euro_txt($mini['month'] ?? 10)) . ' par mois, modifications incluses</span></li>'
        . '<li>' . aled08e_icon('check') . '<span>' . (aled08e_outils_offre() ? 'Tout se suit ici, dans le même espace, sur la même facture que vos outils' : 'Tout se suit ici : votre commande, vos modifications, vos factures') . '</span></li></ul>'
        . '<div class="mm-porte-act"><a class="btn btn-primary" href="' . esc_url(home_url('/creer-mon-site/')) . '">' . aled08e_icon('wand-sparkles') . '<span>Créer mon site</span></a>'
        . '<a class="btn btn-light" href="' . esc_url(home_url('/mon-espace/demo/')) . '">' . aled08e_icon('eye') . '<span>Voir la démo</span></a></div></div></section>';
}
/* L'encart « Nouveau » sous les onglets : un outil prêt que le client n'a jamais essayé */
function aled08e_outils_nouveau_html($uid) {
    if (!aled08e_outils_offre() || !aled08e_ventes_ouvertes()) return '';
    foreach (aled08e_outils_etat($uid) as $id => $e) {
        if ($e['statut'] !== 'inactif' || aled08e_outils_essai_pris($uid, $id)) continue;
        $def = aled08e_outil_def($id);
        $phrase = trim((string) preg_replace('/[:.].*$/su', '', (string) $def['court']));
        return '<aside class="mm-nouveau c-' . esc_attr($def['color']) . '"><strong>Nouveau</strong><p>' . esc_html($def['nom']) . ($phrase !== '' && mb_strlen($phrase) < 70 ? ' : ' . esc_html(mb_strtolower(mb_substr($phrase, 0, 1)) . mb_substr($phrase, 1)) . '.' : '.') . ' <a href="' . esc_url(aled08e_url(['choix' => $id])) . '#outils">Essayer ' . (int) aled08e_essai_jours() . ' jours</a></p></aside>';
    }
    return '';
}
/* Un onglet avec son petit monstre (Accueil, Mon site, Mes outils, Mon compte) */
function aled08e_tab_monstre($id, $monstre, $label, $on = false, $extra = '') {
    $ic = ['accueil' => 'house', 'site' => 'globe', 'outils' => 'sparkles', 'compte' => 'circle-user'][$id] ?? 'house'; // l'icône, montrée sur téléphone à la place du monstre
    return '<button type="button" role="tab" id="tab-' . esc_attr($id) . '" aria-controls="t-' . esc_attr($id) . '" aria-selected="' . ($on ? 'true' : 'false') . '"' . ($on ? '' : ' tabindex="-1"') . ' data-tab="' . esc_attr($id) . '"' . $extra . '><span class="tab-monstre" aria-hidden="true">' . aled08e_monster($monstre) . '</span><span class="tab-ico" aria-hidden="true">' . aled08e_icon($ic) . '</span><span>' . esc_html($label) . '</span></button>';
}
/* Un sous-onglet de « Mon site » (Ma commande, Modifications, Extras, Ma boutique) */
function aled08e_tab_sous($id, $ic, $label) {
    return '<button type="button" role="tab" id="tab-' . esc_attr($id) . '" aria-controls="t-' . esc_attr($id) . '" aria-selected="false" tabindex="-1" data-tab="' . esc_attr($id) . '" data-groupe="site" class="tab-sous">' . aled08e_icon($ic) . '<span>' . esc_html($label) . '</span></button>';
}
/* Sur téléphone, les sous-onglets de « Mon site » sont en haut de chaque panneau du site ; « Mon site » reste allumé */
function aled08e_site_nav_html($actif, $tabs) {
    if (count($tabs) < 2) return '';
    $h = '<nav class="mm-site-nav" aria-label="Mon site">';
    foreach ($tabs as $id => [$ic, $label]) $h .= '<button type="button" data-go="' . esc_attr($id) . '"' . ($id === $actif ? ' aria-current="page"' : '') . '>' . aled08e_icon($ic) . '<span>' . esc_html($label) . '</span></button>';
    return $h . '</nav>';
}
function aled08e_site_groupe_js() {
    return '<script>(function(){var a=document.querySelector("[data-espace]");if(!a||!window.MutationObserver)return;var s=a.querySelector("[role=tab][data-tab=site]"),l=a.querySelectorAll("[role=tab][data-groupe=site]");if(!s||!l.length)return;'
        . 'function m(){var on=false;l.forEach(function(t){if(t.getAttribute("aria-selected")==="true")on=true;});s.classList.toggle("is-groupe-on",on);a.classList.toggle("is-site-sous",on);}'
        . 'var o=new MutationObserver(m);l.forEach(function(t){o.observe(t,{attributes:true,attributeFilter:["aria-selected"]});});m();})();</script>';
}

/* =========================================================================
 *  Pour Alex : les outils d'un client (gestion et fiche client)
 * ========================================================================= */
function aled08e_outils_client_txt($uid) {
    if (!aled08e_outils_offre()) { // outils mis de côté : seulement ceux que le client paie encore (à arrêter, voir Mon compte)
        $t = [];
        foreach (aled08e_outils_restants($uid) as $id => $a) $t[] = aled08e_outil_nom_brut($id) . ' (encore payé, ' . aled08e_euro_txt((float) ($a['prix'] ?? 0)) . ' par mois' . (!empty($a['fin']) ? ', arrêté, jusqu’au ' . wp_date('j F', (int) $a['fin']) : '') . ')';
        return implode(', ', $t);
    }
    $t = [];
    $b = aled08e_bande_etat($uid);
    if ($b['statut'] !== 'inactif') $t[] = 'Toute la bande' . ($b['statut'] === 'essai' ? ' (essai)' : '');
    foreach (aled08e_outils_etat($uid) as $id => $e) {
        if (!in_array($e['par'], ['abonnement', 'site', 'essai'], true)) continue;
        if ($e['par'] === 'essai' && $b['statut'] === 'essai') continue;
        $abo = aled08e_outils_abos($uid)[$id] ?? null;
        $t[] = aled08e_outil_def($id)['nom'] . ($e['par'] === 'essai' ? ' (essai jusqu’au ' . wp_date('j F', $e['fin_essai']) . ')' : ($e['par'] === 'site' ? ' (inclus)' : (!empty($abo['fin']) ? ' (arrêté, jusqu’au ' . wp_date('j F', (int) $abo['fin']) . ')' : '')));
    }
    return implode(', ', $t);
}
add_action('show_user_profile', 'aled08e_outils_fiche', 11);
add_action('edit_user_profile', 'aled08e_outils_fiche', 11);
function aled08e_outils_fiche($user) {
    if (!current_user_can('edit_users') || !is_object($user) || (!aled08e_outils_offre() && !aled08e_outils_restants($user->ID))) return;
    $t = aled08e_outils_client_txt($user->ID);
    echo '<table class="form-table" role="presentation"><tr><th>Outils des Minis Monstres</th><td>' . esc_html($t !== '' ? $t : 'aucun') . (aled08e_meta($user->ID, 'outils_sub') ? '<p class="description">Abonnement Stripe des outils : ' . esc_html(aled08e_meta($user->ID, 'outils_sub')) . '</p>' : '') . '</td></tr></table>';
}
