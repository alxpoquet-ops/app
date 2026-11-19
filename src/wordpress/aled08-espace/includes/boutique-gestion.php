<?php
/**
 * Les Minis Monstres Espace client : le client gère toute sa boutique depuis l'onglet « Ma boutique ».
 * - Ses prix : prix, promo, mise en vente et stock de chaque produit (connecteur : catalogue, produit_regler).
 * - Ses moyens de paiement : Stripe, PayPal, virement, chèque, paiement à la livraison, ou un autre (connecteur :
 *   paiements_lire, paiement_regler). Les clés de paiement partent directement sur le site du client : elles ne sont ni gardées
 *   ici, ni écrites dans un journal, ni renvoyées à l'écran.
 * - Ses commandes récentes (lecture seule).
 * Les articles (emplacements) sont dans includes/articles.php, les codes promo et soldes dans includes/boutique.php.
 */
defined('ABSPATH') || exit;

function aled08e_bg_flash($uid, $ok, $texte) { set_transient('aled08_bg_flash_' . (int) $uid, [$ok, $texte], 120); }
function aled08e_bg_sub() { $s = sanitize_key(wp_unslash($_GET['sub'] ?? '')); return in_array($s, ['articles', 'prix', 'paiements', 'livraison', 'commandes', 'promos'], true) ? $s : 'articles'; }
function aled08e_bg_pret($uid) { return aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== ''; }
/* Un appel au site du client : [tableau] ou un texte d'erreur clair */
function aled08e_bg_appel($uid, $action, $args = []) {
    if (!aled08e_bg_pret($uid)) return 'non_relie';
    $r = aled08e_lia_appel($uid, $action, $args);
    if (is_wp_error($r)) {
        $code = (int) ($r->get_error_data()['code'] ?? 0);
        return $code === 400 && stripos($r->get_error_message(), 'inconnue') !== false ? 'connecteur_ancien' : $r;
    }
    return $r;
}
function aled08e_bg_message_etat($r) {
    if ($r === 'non_relie') return 'Votre boutique n’est pas encore reliée à votre espace. Alex s’en occupe.';
    if ($r === 'connecteur_ancien') return 'L’extension de votre site doit être mise à jour pour ces réglages. Alex s’en occupe.';
    return is_wp_error($r) ? $r->get_error_message() : 'Votre site ne répond pas pour le moment. Rechargez la page dans un instant.';
}

/* ---------- les actions ---------- */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_bg'])) return;
    $uid = get_current_user_id();
    $sub = 'articles';
    $retour = function ($ok, $texte) use ($uid, &$sub) { if ($uid) aled08e_bg_flash($uid, $ok, $texte); wp_safe_redirect(aled08e_url(['sub' => $sub]) . '#vacances', 303); exit; };
    if (!$uid) { wp_safe_redirect(aled08e_url(), 303); exit; }
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) $P['aled08e_bg']);
    $sub = in_array($op, ['prix'], true) ? 'prix' : (in_array($op, ['livraison'], true) ? 'livraison' : (in_array($op, ['commande'], true) ? 'commandes' : 'paiements'));
    if (!wp_verify_nonce(sanitize_text_field((string) ($P['_aled08e_bg'] ?? '')), 'aled08e_bg')) $retour(false, 'La page avait expiré. Réessayez.');
    if (!aled08e_est_boutique($uid)) $retour(false, 'Ces réglages sont réservés aux boutiques en ligne.');
    $u = wp_get_current_user();

    // --- les prix
    if ($op === 'prix') {
        $faits = 0; $erreurs = [];
        foreach (array_slice((array) ($P['p'] ?? []), 0, 30, true) as $id => $l) {
            $id = (int) $id; if (!$id || !is_array($l)) continue;
            $nouv = ['prix' => trim((string) ($l['prix'] ?? '')), 'promo' => trim((string) ($l['promo'] ?? '')), 'vente' => !empty($l['vente']) ? 1 : 0, 'stock' => !empty($l['stock']) ? 1 : 0];
            $anc = ['prix' => trim((string) ($l['o_prix'] ?? '')), 'promo' => trim((string) ($l['o_promo'] ?? '')), 'vente' => !empty($l['o_vente']) ? 1 : 0, 'stock' => !empty($l['o_stock']) ? 1 : 0];
            if ($nouv === $anc) continue;
            $args = ['id' => $id, 'prix' => $nouv['prix'], 'prix_promo' => $nouv['promo'], 'en_stock' => (bool) $nouv['stock'], 'statut' => $nouv['vente'] ? 'publish' : 'draft'];
            $r = aled08e_bg_appel($uid, 'produit_regler', $args);
            if (is_array($r)) $faits++; else { $erreurs[] = is_wp_error($r) ? $r->get_error_message() : aled08e_bg_message_etat($r); if (!is_wp_error($r)) break; }
        }
        if ($erreurs) $retour(false, ($faits ? $faits . ' produit(s) enregistré(s). ' : '') . 'Un réglage n’a pas pu être fait : ' . $erreurs[0]);
        $retour(true, $faits ? ($faits > 1 ? $faits . ' produits sont à jour sur votre boutique.' : 'Votre produit est à jour sur votre boutique.') : 'Rien n’a changé.');
    }

    // --- un moyen de paiement
    if ($op === 'paiement') {
        $id = sanitize_key((string) ($P['id'] ?? ''));
        $args = ['id' => $id, 'actif' => !empty($P['actif'])];
        $cles = false;
        if ($id === 'stripe' && (trim((string) ($P['pk'] ?? '')) !== '' || trim((string) ($P['sk'] ?? '')) !== '')) {
            if (strpos(aled08e_meta($uid, 'lia_url'), 'https://') !== 0) $retour(false, 'Pour votre sécurité, les clés de paiement ne partent que vers un site en HTTPS. Alex s’en occupe.');
            $args['cles'] = ['publiable' => trim((string) ($P['pk'] ?? '')), 'secrete' => trim((string) ($P['sk'] ?? '')), 'test' => ($P['mode'] ?? '') === 'test'];
            $cles = true;
        }
        if ($id === 'bacs') $args['compte'] = ['titulaire' => (string) ($P['titulaire'] ?? ''), 'banque' => (string) ($P['banque'] ?? ''), 'iban' => (string) ($P['iban'] ?? ''), 'bic' => (string) ($P['bic'] ?? '')];
        if ($id === 'cheque') $args['instructions'] = (string) ($P['instructions'] ?? '');
        $r = aled08e_bg_appel($uid, 'paiement_regler', $args);
        unset($args, $P['sk'], $_POST['sk']);
        if (!is_array($r)) $retour(false, aled08e_bg_message_etat($r));
        wp_mail(aled08e_to(), 'Moyen de paiement réglé : ' . $u->display_name, $u->display_name . ' a réglé son moyen de paiement « ' . $id . ' » depuis son espace' . ($cles ? ' (clés enregistrées sur son site)' : '') . ".\n", aled08e_mail_headers());
        $retour(true, !empty($P['actif']) ? 'C’est enregistré : ce moyen de paiement est actif sur votre boutique.' : 'C’est enregistré : ce moyen de paiement est désactivé.');
    }

    // --- installer l'extension officielle Stripe ou PayPal sur le site du client
    if ($op === 'installer') {
        $id = sanitize_key((string) ($P['id'] ?? ''));
        if (!in_array($id, ['stripe', 'ppcp-gateway'], true)) $retour(false, 'Ce moyen de paiement ne s’installe pas d’ici.');
        @set_time_limit(180);
        $r = aled08e_bg_appel($uid, 'paiement_installer', ['id' => $id]);
        if (!is_array($r)) $retour(false, aled08e_bg_message_etat($r));
        wp_mail(aled08e_to(), 'Extension de paiement installée : ' . $u->display_name, $u->display_name . ' a installé l’extension « ' . $id . ' » sur sa boutique depuis son espace.' . "\n", aled08e_mail_headers());
        $retour(true, $id === 'stripe' ? 'Stripe est installé ! Il ne reste qu’à coller vos clés ci-dessous, puis à cocher « Je propose ce moyen de paiement ».' : 'PayPal est installé ! Il ne reste qu’à connecter votre compte PayPal (bouton ci-dessous).');
    }

    // --- la livraison (modes d'expédition de WooCommerce)
    if ($op === 'livraison') {
        $r = aled08e_bg_appel($uid, 'livraison_regler', ['forfait' => !empty($P['forfait']), 'forfait_prix' => (string) ($P['forfait_prix'] ?? ''), 'gratuit' => !empty($P['gratuit']), 'gratuit_minimum' => (string) ($P['gratuit_minimum'] ?? ''), 'retrait' => !empty($P['retrait'])]);
        if (!is_array($r)) $retour(false, aled08e_bg_message_etat($r));
        $retour(true, 'Votre livraison est réglée. C’est en place sur votre boutique.');
    }
    // --- une commande qui avance (statuts de WooCommerce, qui prévient le client)
    if ($op === 'commande') {
        $vers = sanitize_key((string) ($P['statut'] ?? ''));
        $r = aled08e_bg_appel($uid, 'commande_statut', ['id' => (int) ($P['id'] ?? 0), 'statut' => $vers]);
        if (!is_array($r)) $retour(false, aled08e_bg_message_etat($r));
        $retour(true, $vers === 'completed' ? 'Commande terminée : votre client est prévenu par e-mail.' : 'Commande en préparation.');
    }

    // --- un autre moyen de paiement : Alex s'en occupe
    if ($op === 'demander') {
        $quoi = trim(sanitize_textarea_field((string) ($P['quoi'] ?? '')));
        if ($quoi === '') $retour(false, 'Dites-moi en quelques mots ce que vous voulez brancher.');
        wp_mail(aled08e_to(), 'Boutique : moyen de paiement à brancher : ' . $u->display_name, 'Client : ' . $u->display_name . ' (' . $u->user_email . ")\nSite : " . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\n\nIl veut :\n" . mb_substr($quoi, 0, 1000) . "\n", aled08e_mail_headers($u->display_name . ' <' . $u->user_email . '>'));
        $retour(true, 'C’est envoyé à Alex : il branche ce moyen de paiement sur votre boutique et vous prévient dès que c’est prêt.');
    }
    $retour(false, 'Ça n’a pas marché. Réessayez.');
}, 5);

/* ---------- la navigation entre les rubriques de la boutique ---------- */
function aled08e_bg_nav($sub) {
    $r = ['articles' => ['shopping-bag', 'Mes articles'], 'prix' => ['badge-euro', 'Mes prix'], 'paiements' => ['credit-card', 'Paiements'], 'livraison' => ['package', 'Livraison'], 'commandes' => ['receipt', 'Commandes'], 'promos' => ['badge-percent', 'Promos et soldes']];
    $h = '<nav class="ex-filtre bg-nav" aria-label="Rubriques de ma boutique">';
    foreach ($r as $id => [$ic, $lib]) $h .= '<a class="bg-lien' . ($id === $sub ? ' is-on' : '') . '"' . ($id === $sub ? ' aria-current="page"' : '') . ' href="' . esc_url(aled08e_url(['sub' => $id]) . '#vacances') . '">' . aled08e_icon($ic) . '<span>' . esc_html($lib) . '</span></a>';
    return $h . '</nav>';
}
function aled08e_bg_flash_html($uid) {
    $f = get_transient('aled08_bg_flash_' . (int) $uid);
    if (!$f) return '';
    delete_transient('aled08_bg_flash_' . (int) $uid);
    return '<p class="' . ($f[0] ? 'esp-empty' : 'esp-warn') . '" role="status">' . esc_html($f[1]) . '</p>';
}

/* ---------- Mes prix ---------- */
function aled08e_bg_prix_html($uid) {
    $pg = max(1, (int) ($_GET['pg'] ?? 1));
    $r = aled08e_bg_appel($uid, 'catalogue', ['page' => $pg]);
    $h = '<h3 class="bg-titre">Mes prix</h3><p class="app-p">Changez le prix, mettez une promo, retirez un produit de la vente ou marquez-le en rupture : c’est mis à jour sur votre boutique dès que vous enregistrez.</p>';
    if (!is_array($r)) return $h . '<p class="esp-warn">' . esc_html(aled08e_bg_message_etat($r)) . '</p>';
    if (empty($r['produits'])) return $h . '<p class="esp-empty">Votre boutique n’a pas encore de produit. Ajoutez le premier dans « Mes articles ».</p>';
    $dev = ($r['devise'] ?? 'EUR') === 'EUR' ? '€' : ($r['devise'] ?? '€');
    $h .= '<form class="bg-prix" method="post" action="' . esc_url(aled08e_url()) . '">' . wp_nonce_field('aled08e_bg', '_aled08e_bg', true, false) . '<input type="hidden" name="aled08e_bg" value="prix"><ul class="bg-liste">';
    foreach ($r['produits'] as $p) {
        $id = (int) $p['id'];
        $vente = $p['statut'] === 'publish';
        $h .= '<li class="bg-ligne' . ($p['modifiable'] ? '' : ' is-fixe') . '"><span class="bg-vignette">' . (!empty($p['image']) ? '<img src="' . esc_url($p['image']) . '" alt="" loading="lazy">' : aled08e_icon('shopping-bag')) . '</span>'
            . '<span class="bg-nom"><strong>' . esc_html($p['nom']) . '</strong><small>' . ($vente ? 'En vente' : 'Hors vente') . '</small></span>';
        if (!$p['modifiable']) { $h .= '<span class="bg-fixe">Plusieurs variantes : demandez à Alex de les régler.</span></li>'; continue; }
        $n = 'p[' . $id . ']';
        $h .= '<label class="bg-champ"><span>Prix (' . esc_html($dev) . ')</span><input type="text" inputmode="decimal" name="' . $n . '[prix]" value="' . esc_attr(str_replace('.', ',', (string) $p['prix'])) . '"></label>'
            . '<label class="bg-champ"><span>Promo (' . esc_html($dev) . ')</span><input type="text" inputmode="decimal" name="' . $n . '[promo]" value="' . esc_attr(str_replace('.', ',', (string) $p['prix_promo'])) . '" placeholder="aucune"></label>'
            . '<span class="bg-cases"><label><input type="checkbox" name="' . $n . '[vente]" value="1"' . ($vente ? ' checked' : '') . '> En vente</label><label><input type="checkbox" name="' . $n . '[stock]" value="1"' . (!empty($p['en_stock']) ? ' checked' : '') . '> En stock</label></span>'
            . '<input type="hidden" name="' . $n . '[o_prix]" value="' . esc_attr(str_replace('.', ',', (string) $p['prix'])) . '"><input type="hidden" name="' . $n . '[o_promo]" value="' . esc_attr(str_replace('.', ',', (string) $p['prix_promo'])) . '">'
            . ($vente ? '<input type="hidden" name="' . $n . '[o_vente]" value="1">' : '') . (!empty($p['en_stock']) ? '<input type="hidden" name="' . $n . '[o_stock]" value="1">' : '') . '</li>';
    }
    $h .= '</ul><button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer mes prix</span></button></form>';
    if (($r['pages'] ?? 1) > 1) {
        $h .= '<p class="bg-pages">';
        for ($i = 1; $i <= (int) $r['pages']; $i++) $h .= '<a class="btn btn-light btn-sm' . ($i === $pg ? ' is-on' : '') . '" href="' . esc_url(aled08e_url(['sub' => 'prix', 'pg' => $i]) . '#vacances') . '">' . $i . '</a> ';
        $h .= '</p>';
    }
    return $h;
}

/* ---------- Paiements ---------- */
function aled08e_bg_paiements_html($uid) {
    $r = aled08e_bg_appel($uid, 'paiements_lire');
    $h = '<h3 class="bg-titre">Mes moyens de paiement</h3><p class="app-p">Choisissez comment vos clients vous paient. Vos clés de paiement sont enregistrées directement sur votre site : elles ne passent pas par ici et ne s’affichent jamais.</p>';
    if (!is_array($r)) return $h . '<p class="esp-warn">' . esc_html(aled08e_bg_message_etat($r)) . '</p>';
    $nonce = wp_nonce_field('aled08e_bg', '_aled08e_bg', true, false);
    $act = esc_url(aled08e_url());
    $icones = ['stripe' => 'credit-card', 'ppcp-gateway' => 'badge-euro', 'bacs' => 'receipt', 'cheque' => 'pencil', 'cod' => 'package'];
    $h .= '<div class="bg-paiements">';
    foreach ($r['paiements'] as $g) {
        $id = $g['id'];
        $etat = !$g['installe'] ? '<em class="ex-badge">Pas installé</em>' : ($g['actif'] ? '<em class="ex-badge ex-badge-actif">' . aled08e_icon('check') . 'Actif</em>' : '<em class="ex-badge ex-badge-off">Inactif</em>');
        $corps = '';
        if (!$g['installe']) {
            $corps = '<p class="app-note">L’extension officielle de ' . esc_html($id === 'stripe' ? 'Stripe' : 'PayPal') . ' n’est pas encore sur votre site. Installez-la en un clic : elle reste éteinte tant que vous ne l’avez pas réglée.</p>'
                . '<form method="post" action="' . $act . '" onsubmit="this.querySelector(\'button\').disabled=true;this.querySelector(\'button span\').textContent=\'Installation… (une minute)\';">' . $nonce . '<input type="hidden" name="aled08e_bg" value="installer"><input type="hidden" name="id" value="' . esc_attr($id) . '"><button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('download') . '<span>Installer ' . esc_html($id === 'stripe' ? 'Stripe' : 'PayPal') . '</span></button></form>';
        } elseif ($id === 'ppcp-gateway') {
            $corps = '<p class="app-note">PayPal se connecte avec votre compte PayPal : c’est un petit parcours à faire une fois. Alex peut le faire avec vous, ou vous le faites depuis votre site.</p>'
                . '<div class="ges-actions"><a class="btn btn-light btn-sm" href="' . esc_url($g['config_url']) . '" target="_blank" rel="noopener">' . aled08e_icon('link') . '<span>Ouvrir les réglages PayPal</span></a>'
                . '<form method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_bg" value="demander"><input type="hidden" name="quoi" value="Brancher PayPal avec moi"><button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('send') . '<span>Demander à Alex</span></button></form></div>'
                . '<form class="bg-pf" method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_bg" value="paiement"><input type="hidden" name="id" value="' . esc_attr($id) . '"><label class="check"><input type="checkbox" name="actif" value="1"' . ($g['actif'] ? ' checked' : '') . '><span>PayPal est proposé à mes clients</span></label><button class="btn btn-light btn-sm" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>';
        } else {
            $c = '<label class="check"><input type="checkbox" name="actif" value="1"' . ($g['actif'] ? ' checked' : '') . '><span>Je propose ce moyen de paiement à mes clients</span></label>';
            if ($id === 'stripe') {
                $c .= '<div class="esp-grid2"><div class="field"><label for="st-pk">Clé publiable (pk_…)</label><input id="st-pk" name="pk" type="text" autocomplete="off" placeholder="' . ($g['cles'] ? '•••• déjà enregistrée' : 'pk_live_…') . '"></div>'
                    . '<div class="field"><label for="st-sk">Clé secrète (sk_…)</label><input id="st-sk" name="sk" type="password" autocomplete="new-password" placeholder="' . ($g['cles'] ? '•••• déjà enregistrée' : 'sk_live_…') . '"></div></div>'
                    . '<div class="radio-group"><label><input type="radio" name="mode" value="reel"' . (($g['mode'] ?? 'reel') !== 'test' ? ' checked' : '') . '> Mode réel</label><label><input type="radio" name="mode" value="test"' . (($g['mode'] ?? '') === 'test' ? ' checked' : '') . '> Mode test</label></div>'
                    . '<p class="app-note">Vos clés se trouvent dans votre compte Stripe, rubrique Développeurs, Clés API. Laissez les champs vides pour garder les clés actuelles.</p>';
            } elseif ($id === 'bacs') {
                $cp = $g['compte'] ?? [];
                $c .= '<div class="esp-grid2"><div class="field"><label for="bq-tit">Titulaire du compte</label><input id="bq-tit" name="titulaire" type="text" value="' . esc_attr($cp['titulaire'] ?? '') . '"></div><div class="field"><label for="bq-ban">Banque</label><input id="bq-ban" name="banque" type="text" value="' . esc_attr($cp['banque'] ?? '') . '"></div>'
                    . '<div class="field"><label for="bq-iban">IBAN</label><input id="bq-iban" name="iban" type="text" autocomplete="off" value="' . esc_attr($cp['iban'] ?? '') . '" placeholder="FR76…"></div><div class="field"><label for="bq-bic">BIC</label><input id="bq-bic" name="bic" type="text" autocomplete="off" value="' . esc_attr($cp['bic'] ?? '') . '"></div></div>';
            } elseif ($id === 'cheque') {
                $c .= '<div class="field"><label for="bq-chq">Ce que vous dites à vos clients (à qui faire le chèque, où l’envoyer)</label><textarea id="bq-chq" name="instructions" rows="2" maxlength="500">' . esc_textarea($g['instructions'] ?? '') . '</textarea></div>';
            }
            $corps = '<form method="post" action="' . $act . '" class="bg-pf">' . $nonce . '<input type="hidden" name="aled08e_bg" value="paiement"><input type="hidden" name="id" value="' . esc_attr($id) . '">' . $c . '<button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>';
        }
        $h .= '<article class="ex-carte bg-pay c-' . ($g['actif'] ? 'mint' : 'lilac') . '"><header class="ex-tete"><span class="ex-ico">' . aled08e_icon($icones[$id] ?? 'credit-card') . '</span><div class="ex-nom"><strong>' . esc_html($g['nom']) . '</strong>' . $etat . '</div></header>' . $corps . '</article>';
    }
    foreach ((array) ($r['autres'] ?? []) as $g) {
        $h .= '<article class="ex-carte bg-pay c-sky"><header class="ex-tete"><span class="ex-ico">' . aled08e_icon('credit-card') . '</span><div class="ex-nom"><strong>' . esc_html($g['nom']) . '</strong>' . ($g['actif'] ? '<em class="ex-badge ex-badge-actif">' . aled08e_icon('check') . 'Actif</em>' : '<em class="ex-badge ex-badge-off">Inactif</em>') . '</div></header>'
            . '<form method="post" action="' . $act . '" class="bg-pf">' . $nonce . '<input type="hidden" name="aled08e_bg" value="paiement"><input type="hidden" name="id" value="' . esc_attr($g['id']) . '"><label class="check"><input type="checkbox" name="actif" value="1"' . ($g['actif'] ? ' checked' : '') . '><span>Je propose ce moyen de paiement à mes clients</span></label><button class="btn btn-light btn-sm" type="submit">' . aled08e_icon('check') . '<span>Enregistrer</span></button></form>'
            . '<p class="app-note"><a href="' . esc_url($g['config_url']) . '" target="_blank" rel="noopener">Ouvrir ses réglages sur mon site</a></p></article>';
    }
    $h .= '<article class="ex-carte bg-pay c-peach"><header class="ex-tete"><span class="ex-ico">' . aled08e_icon('plus') . '</span><div class="ex-nom"><strong>Un autre moyen de paiement ?</strong></div></header>'
        . '<p class="ex-court">Mollie, Payplug, SumUp, Alma, Apple Pay, paiement en plusieurs fois… Dites-moi lequel : Alex le branche sur votre boutique.</p>'
        . '<form method="post" action="' . $act . '" class="bg-pf">' . $nonce . '<input type="hidden" name="aled08e_bg" value="demander"><div class="field"><label for="bq-autre">Ce que vous voulez brancher</label><textarea id="bq-autre" name="quoi" rows="2" maxlength="1000" required placeholder="Ex. : payer en 3 fois avec Alma"></textarea></div><button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('send') . '<span>Demander à Alex</span></button></form></article>';
    return $h . '</div>';
}

/* ---------- Commandes ---------- */
function aled08e_bg_commandes_html($uid) {
    $r = aled08e_bg_appel($uid, 'commandes_lire');
    $h = '<h3 class="bg-titre">Mes dernières commandes</h3>';
    if (!is_array($r)) return $h . '<p class="esp-warn">' . esc_html(aled08e_bg_message_etat($r)) . '</p>';
    if (empty($r['commandes'])) return $h . '<p class="esp-empty">Pas encore de commande. Dès que votre premier client commande, elle apparaît ici.</p>';
    $dev = ($r['devise'] ?? 'EUR') === 'EUR' ? '€' : ($r['devise'] ?? '€');
    $h .= '<ul class="bg-commandes">';
    $nonce = wp_nonce_field('aled08e_bg', '_aled08e_bg', true, false);
    foreach ($r['commandes'] as $c) {
        $actions = '';
        if (!empty($c['id']) && in_array($c['statut_id'], ['on-hold', 'pending', 'processing'], true)) {
            $btn = function ($vers, $ic, $lib) use ($c, $nonce) { return '<button class="btn btn-light btn-sm" type="submit" name="statut" value="' . $vers . '">' . aled08e_icon($ic) . '<span>' . $lib . '</span></button>'; };
            $actions = '<form class="bg-cmd-actions" method="post" action="' . esc_url(aled08e_url()) . '">' . $nonce . '<input type="hidden" name="aled08e_bg" value="commande"><input type="hidden" name="id" value="' . (int) $c['id'] . '">'
                . ($c['statut_id'] !== 'processing' ? $btn('processing', 'clock', 'Je la prépare') : '') . $btn('completed', 'check', 'Expédiée ou remise') . '</form>';
        }
        $h .= '<li><span class="bg-num">#' . esc_html($c['numero']) . '</span><span class="bg-cmd"><strong>' . esc_html($c['client'] ?: 'Client') . '</strong><small>' . esc_html(aled08e_date($c['date'])) . ' · ' . (int) $c['articles'] . ' article' . ((int) $c['articles'] > 1 ? 's' : '') . '</small></span><em class="st ' . (in_array($c['statut_id'], ['completed'], true) ? 'st-done' : (in_array($c['statut_id'], ['cancelled', 'failed', 'refunded'], true) ? 'esp-st-off' : 'st-doing')) . '">' . esc_html($c['statut']) . '</em><b>' . esc_html(number_format((float) $c['total'], 2, ',', ' ')) . ' ' . esc_html($dev) . '</b>' . $actions . '</li>';
    }
    $h .= '</ul><p class="app-note">Quand vous marquez une commande « Expédiée ou remise », votre client reçoit l’e-mail de votre boutique. Pour le détail d’une commande ou un remboursement : <a href="' . esc_url($r['liste'] ?? '') . '" target="_blank" rel="noopener">mes commandes</a>.</p>';
    return $h;
}

/* ---------- Livraison (modes d'expédition de WooCommerce, zone France) ---------- */
function aled08e_bg_livraison_html($uid) {
    $r = aled08e_bg_appel($uid, 'livraison_lire');
    $h = '<h3 class="bg-titre">Ma livraison</h3>';
    if (!is_array($r)) return $h . '<p class="esp-warn">' . esc_html(aled08e_bg_message_etat($r)) . '</p>';
    $c = function ($k) use ($r) { return !empty($r[$k]['actif']) ? ' checked' : ''; };
    $h .= '<p class="app-p">Choisissez comment vos clients reçoivent leurs achats, en France. Vous pouvez cocher plusieurs cases : votre client choisira.</p>'
        . '<form class="form esp-form bg-livraison" method="post" action="' . esc_url(aled08e_url()) . '">' . wp_nonce_field('aled08e_bg', '_aled08e_bg', true, false) . '<input type="hidden" name="aled08e_bg" value="livraison">'
        . '<div class="bg-carte"><label class="check"><input type="checkbox" name="forfait" value="1"' . $c('forfait') . '><span><strong>Livraison à prix fixe</strong></span></label>'
        . '<div class="field"><label for="bg-liv-prix">Prix de la livraison (€)</label><input id="bg-liv-prix" name="forfait_prix" inputmode="decimal" maxlength="8" placeholder="5,90" value="' . esc_attr(str_replace('.', ',', (string) ($r['forfait']['prix'] ?? ''))) . '"></div></div>'
        . '<div class="bg-carte"><label class="check"><input type="checkbox" name="gratuit" value="1"' . $c('gratuit') . '><span><strong>Livraison gratuite</strong></span></label>'
        . '<div class="field"><label for="bg-liv-min">À partir de combien d’achats ? (€, vide = toujours gratuite)</label><input id="bg-liv-min" name="gratuit_minimum" inputmode="decimal" maxlength="8" placeholder="50" value="' . esc_attr(str_replace('.', ',', (string) ($r['gratuit']['minimum'] ?? ''))) . '"></div></div>'
        . '<div class="bg-carte"><label class="check"><input type="checkbox" name="retrait" value="1"' . $c('retrait') . '><span><strong>Retrait sur place</strong>, gratuit : votre client vient chercher sa commande</span></label></div>'
        . '<button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>Enregistrer ma livraison</span></button></form>'
        . '<p class="app-note">Besoin de tarifs par poids, par pays ou avec un transporteur ? Ça se règle dans <a href="' . esc_url($r['reglages'] ?? '') . '" target="_blank" rel="noopener">les réglages d’expédition de votre boutique</a>, ou faites une demande.</p>';
    return $h;
}
