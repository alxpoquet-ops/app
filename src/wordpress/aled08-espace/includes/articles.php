<?php
/**
 * Les Minis Monstres Espace client : les emplacements d'articles de la boutique (onglet « Ma boutique », rubrique « Mes articles »).
 * L'option boutique donne des emplacements d'articles (5 compris). Le client remplit lui-même un emplacement : une photo,
 * une description et un prix, et l'article est créé tout de suite dans la boutique de son site (connecteur : article_poser).
 * Il modifie ou retire aussi ses produits déjà en ligne (les anciens compris). Chaque emplacement en plus coûte 2 € une seule
 * fois, et reste à lui pour toujours.
 * Les produits affichés viennent de la boutique elle-même (connecteur : catalogue). Une boutique qui avait déjà plus de produits
 * que d'emplacements compris les garde tous : ses emplacements de départ = le nombre de produits trouvés la première fois.
 * Si le site n'est pas relié, les articles sont gardés ici et Alex les met en ligne à la main.
 * Prix : src/config.js (creation.boutiqueProduits et creation.boutiqueSlot, via data.json).
 */
defined('ABSPATH') || exit;

function aled08e_art_inclus() { return max(1, (int) (aled08e_data()['creation']['boutiqueProduits'] ?? 5)); }
function aled08e_art_prix() { return (float) (aled08e_data()['creation']['boutiqueSlot'] ?? 2); }
function aled08e_art_achetes($uid) { return (int) get_user_meta($uid, 'aled08_slots_achetes', true); }
/* Les emplacements de départ : ceux compris, ou plus si la boutique avait déjà plus de produits (méta posée à la première lecture) */
function aled08e_art_base($uid) { return max(aled08e_art_inclus(), (int) get_user_meta($uid, 'aled08_slots_base', true)); }
// Offre finale : le Site Boutique n'a plus d'emplacements comptés (boutiqueSlot à 0) : le catalogue est libre.
function aled08e_art_libre() { return aled08e_art_prix() <= 0; }
function aled08e_art_total($uid) { return aled08e_art_libre() ? 100000 : aled08e_art_base($uid) + aled08e_art_achetes($uid) + (aled08e_famille($uid) ? 100 : 0); }
function aled08e_art_liste($uid) { $l = get_user_meta($uid, 'aled08_articles', true); return is_array($l) ? array_values($l) : []; }
function aled08e_art_flash($uid, $ok, $texte) { set_transient('aled08_art_flash_' . (int) $uid, [$ok, $texte], 120); }
function aled08e_art_pret($uid) { return aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== ''; }
function aled08e_art_prix_lu($v) { return (float) str_replace(',', '.', preg_replace('/[^\d,.]/', '', (string) $v)); }

/* Les produits de la boutique (lus sur le site du client) : liste, ou null si le site ne répond pas / n'est pas relié */
function aled08e_art_produits($uid, $frais = false) {
    if (!aled08e_art_pret($uid)) return null;
    $cle = 'aled08_art_cat_' . (int) $uid;
    if (!$frais) { $c = get_transient($cle); if (is_array($c)) return $c; }
    $r = aled08e_lia_appel($uid, 'catalogue', ['limite' => 100]);
    if (is_wp_error($r) || !isset($r['produits']) || !is_array($r['produits'])) return null;
    $prods = $r['produits'];
    // la première fois : les produits déjà en ligne gardent leur place (on ne fait pas payer ce qui existait avant)
    if (get_user_meta($uid, 'aled08_slots_base', true) === '') update_user_meta($uid, 'aled08_slots_base', max(aled08e_art_inclus(), count($prods)));
    set_transient($cle, $prods, 5 * MINUTE_IN_SECONDS);
    return $prods;
}

/* Les catégories de la boutique (catégories de produits de WooCommerce), gardées 5 minutes */
function aled08e_art_categories($uid, $frais = false) {
    if (!aled08e_art_pret($uid)) return [];
    $cle = 'aled08_art_cats_' . (int) $uid;
    $c = $frais ? false : get_transient($cle);
    if (is_array($c)) return $c;
    $r = aled08e_lia_appel($uid, 'categories_lire', []);
    $c = is_array($r) && isset($r['categories']) && is_array($r['categories']) ? $r['categories'] : [];
    set_transient($cle, $c, 5 * MINUTE_IN_SECONDS);
    return $c;
}

/* ---------- les actions : poser ou modifier un article, le retirer, débloquer des emplacements ---------- */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_article'])) return;
    $uid = get_current_user_id();
    $retour = function ($ok, $texte) use ($uid) { if ($uid) aled08e_art_flash($uid, $ok, $texte); delete_transient('aled08_art_cat_' . (int) $uid); delete_transient('aled08_art_cats_' . (int) $uid); wp_safe_redirect(aled08e_url(['sub' => 'articles']) . '#vacances', 303); exit; };
    if (!$uid) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_art'] ?? '')), 'aled08e_art')) $retour(false, 'La page avait expiré. Réessayez.');
    if (!aled08e_est_boutique($uid)) $retour(false, 'Les emplacements d’articles sont réservés aux boutiques en ligne.');
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) $P['aled08e_article']);
    $u = wp_get_current_user();
    $pret = aled08e_art_pret($uid);

    if ($op === 'poser') {
        $n = (int) get_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'));
        if ($n >= 40) $retour(false, 'Vous avez beaucoup travaillé aujourd’hui ! Revenez demain pour d’autres articles.');
        $pid = (int) ($P['pid'] ?? 0);      // un produit de la boutique à modifier
        $idx = isset($P['idx']) && $P['idx'] !== '' ? (int) $P['idx'] : -1; // un article gardé ici (site pas relié)
        $nouveau = !$pid && $idx < 0;
        if ($nouveau) {
            $prods = aled08e_art_produits($uid, true);
            $pris = is_array($prods) ? count($prods) : count(aled08e_art_liste($uid));
            if ($pris >= aled08e_art_total($uid)) $retour(false, 'Tous vos emplacements sont pris. Débloquez-en un de plus, juste en dessous.');
        }
        $nom = trim(sanitize_text_field((string) ($P['nom'] ?? '')));
        $desc = mb_substr(trim(sanitize_textarea_field((string) ($P['description'] ?? ''))), 0, 3000);
        $sansPrix = !empty($P['sans_prix']); // « Je ne mets pas de prix » : l'article est présenté sans prix
        $prix = $sansPrix ? '' : aled08e_art_prix_lu($P['prix'] ?? '');
        if ($nom === '' || mb_strlen($nom) > 120) $retour(false, 'Donnez un nom à votre article (120 caractères au plus).');
        if (!$sansPrix && ($prix < 0.5 || $prix > 5000)) $retour(false, 'Indiquez un prix entre 0,50 € et 5 000 €, ou cochez « Je ne mets pas de prix ».');
        $aid = 0;
        if (!empty($_FILES['image']['name'])) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            if (!empty($_FILES['image']['size']) && $_FILES['image']['size'] > 8 * MB_IN_BYTES) $retour(false, 'La photo est trop lourde (8 Mo au plus).');
            $ft = wp_check_filetype_and_ext($_FILES['image']['tmp_name'], $_FILES['image']['name']);
            if (!in_array($ft['type'] ?? '', ['image/jpeg', 'image/png', 'image/webp'], true)) $retour(false, 'La photo doit être un JPG, un PNG ou un WEBP.');
            $r = media_handle_upload('image', 0);
            if (is_wp_error($r)) $retour(false, 'La photo n’a pas pu être envoyée. Essayez avec une photo plus légère.');
            $aid = (int) $r;
        } elseif ($nouveau) $retour(false, 'Ajoutez une photo de votre article.');
        set_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'), $n + 1, DAY_IN_SECONDS);

        if ($pret) {
            $args = ['nom' => $nom, 'description' => $desc] + ($sansPrix ? ['sans_prix' => 1] : ['prix' => $prix]);
            if (!empty($P['cats_envoyees'])) $args['categories'] = array_values(array_filter(array_map('intval', (array) ($P['categories'] ?? []))));
            if ($pid) $args['id'] = $pid;
            if ($aid) $args['image_url'] = wp_get_attachment_url($aid);
            $res = aled08e_lia_appel($uid, 'article_poser', $args);
            if (is_array($res) && !empty($res['id'])) $retour(true, $nouveau ? 'Votre article est en ligne dans votre boutique !' : 'Votre article est mis à jour.');
            $code = is_wp_error($res) ? (int) ($res->get_error_data()['code'] ?? 0) : 0;
            if ($code === 400 && is_wp_error($res) && stripos($res->get_error_message(), 'inconnue') === false) $retour(false, $res->get_error_message());
            $why = is_wp_error($res) ? $res->get_error_message() : 'réponse inattendue du site';
        } else $why = 'site pas encore relié à l’espace client';
        // le site ne répond pas, ou son connecteur est trop ancien : l'article est gardé ici et Alex le met en ligne à la main
        if ($nouveau || $idx >= 0) {
            $liste = aled08e_art_liste($uid);
            $art = ['nom' => $nom, 'prix' => $prix, 'desc' => $desc, 'img' => $aid ?: (int) ($liste[$idx]['img'] ?? 0), 'statut' => 'attente', 'le' => time()];
            if ($idx >= 0 && isset($liste[$idx])) $liste[$idx] = $art; else $liste[] = $art;
            update_user_meta($uid, 'aled08_articles', array_values($liste));
        }
        wp_mail(aled08e_to(), 'Article à mettre en ligne : ' . $u->display_name, 'Client : ' . $u->display_name . ' (' . $u->user_email . ")\nSite : " . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\nRaison : " . $why . "\n\nArticle : " . $nom . ($pid ? ' (produit n° ' . $pid . ' à modifier)' : '') . "\nPrix : " . $prix . " €\nDescription :\n" . $desc . "\n" . ($aid ? 'Photo : ' . wp_get_attachment_url($aid) . "\n" : ''), aled08e_mail_headers($u->display_name . ' <' . $u->user_email . '>'));
        $retour(true, 'Votre article est enregistré : il sera en ligne dans les prochaines heures.');
    }

    // --- les catégories : en créer une, en supprimer une (ses articles sont gardés)
    if ($op === 'categorie') {
        $nomCat = trim(sanitize_text_field((string) ($P['nom_categorie'] ?? '')));
        if ($nomCat === '' || mb_strlen($nomCat) > 60) $retour(false, 'Donnez un nom à votre catégorie (60 caractères au plus).');
        $r = aled08e_lia_appel($uid, 'categorie_creer', ['nom' => $nomCat]);
        if (is_array($r) && !empty($r['ok'])) $retour(true, 'La catégorie « ' . $nomCat . ' » est créée. Rangez-y vos articles avec « Modifier ».');
        $retour(false, is_wp_error($r) && (int) ($r->get_error_data()['code'] ?? 0) === 400 && stripos($r->get_error_message(), 'inconnue') === false ? $r->get_error_message() : 'La catégorie n’a pas pu être créée. Réessayez dans un instant.');
    }
    if ($op === 'categorie_retirer') {
        $r = aled08e_lia_appel($uid, 'categorie_supprimer', ['id' => (int) ($P['id_categorie'] ?? 0)]);
        if (is_array($r) && !empty($r['ok'])) $retour(true, 'La catégorie est supprimée. Ses articles sont gardés.');
        $retour(false, 'La catégorie n’a pas pu être supprimée. Réessayez dans un instant.');
    }
    if ($op === 'retirer') {
        $pid = (int) ($P['pid'] ?? 0);
        if ($pid) {
            $r = $pret ? aled08e_lia_appel($uid, 'article_retirer', ['id' => $pid]) : new WP_Error('aled08_art', 'site pas relié');
            if (is_wp_error($r)) {
                wp_mail(aled08e_to(), 'Article à retirer : ' . $u->display_name, 'Le client veut retirer le produit n° ' . $pid . " de sa boutique, mais le site n'a pas pu le faire : " . $r->get_error_message() . "\n", aled08e_mail_headers());
                $retour(true, 'C’est noté : cet article va être retiré de votre boutique.');
            }
            $retour(true, 'Votre article est retiré (il reste récupérable quelques jours). Votre emplacement est libre.');
        }
        $idx = (int) ($P['idx'] ?? -1);
        $liste = aled08e_art_liste($uid);
        if (!isset($liste[$idx])) $retour(false, 'Cet article n’existe plus.');
        array_splice($liste, $idx, 1);
        update_user_meta($uid, 'aled08_articles', array_values($liste));
        $retour(true, 'Votre article est retiré. Votre emplacement est libre.');
    }

    if ($op === 'debloquer') {
        $q = (int) ($P['quantite'] ?? 1);
        if (!in_array($q, [1, 5, 10], true)) $q = 1;
        if (empty($P['accord'])) $retour(false, 'Cochez la case qui accepte le prix avant de débloquer.');
        $total = aled08e_art_prix() * $q;
        // payé tout de suite par carte : les emplacements sont débloqués dès le paiement (includes/paiement-direct.php)
        if (!aled08e_famille($uid) && aled08e_pd_pret()) {
            $url = aled08e_pd_session($uid, [['Emplacement d’article en plus pour votre boutique', aled08e_art_prix(), $q]], ['type' => 'emplacements', 'quantite' => $q], 'vacances', 'articles');
            if (!is_wp_error($url)) { wp_redirect($url, 303); exit; }
            $retour(false, 'Le paiement n’a pas pu s’ouvrir. Réessayez dans un instant.');
        }
        $facture = false;
        if (!aled08e_famille($uid)) {
            $cus = aled08e_meta($uid, 'stripe_customer');
            if (function_exists('aled08e_stripe_ready') && aled08e_stripe_ready() && $cus !== '' && !aled08e_sans_formule($uid)) {
                $r = aled08e_stripe_request('POST', '/v1/invoiceitems', ['customer' => $cus, 'amount' => (int) round($total * 100), 'currency' => 'eur', 'description' => ($q > 1 ? $q . ' emplacements' : 'Un emplacement') . ' d’articles en plus pour votre boutique'], 'slots_' . $uid . '_' . time(), true);
                $facture = !is_wp_error($r) && !empty($r['id']);
            }
        }
        update_user_meta($uid, 'aled08_slots_achetes', aled08e_art_achetes($uid) + $q);
        wp_mail(aled08e_to(), 'Emplacements d’articles débloqués : ' . $u->display_name, $u->display_name . ' a débloqué ' . $q . ' emplacement(s) d’articles pour ' . aled08e_euro_txt($total) . ' (' . (aled08e_famille($uid) ? 'offert, compte famille' : ($facture ? 'ajouté à sa prochaine facture Stripe' : 'À FACTURER À LA MAIN')) . ").\n", aled08e_mail_headers());
        $retour(true, $q > 1 ? $q . ' emplacements en plus sont à vous, pour toujours !' : 'Un emplacement de plus est à vous, pour toujours !');
    }
    $retour(false, 'Ça n’a pas marché. Réessayez.');
}, 5);

/* ---------- l'affichage ---------- */
function aled08e_art_form($nonce, $act, $cle, $a = null, $cats = []) {
    $edit = $a !== null;
    $choix = '';
    if ($cats) {
        $mes = $edit ? array_map('intval', (array) ($a['categories'] ?? [])) : [];
        $choix = '<fieldset class="art-cats"><legend>Dans quelle catégorie ?</legend><input type="hidden" name="cats_envoyees" value="1">';
        foreach ($cats as $c) $choix .= '<label class="art-cat"><input type="checkbox" name="categories[]" value="' . (int) $c['id'] . '"' . (in_array((int) $c['id'], $mes, true) ? ' checked' : '') . '><span>' . esc_html($c['nom']) . '</span></label>';
        $choix .= '</fieldset>';
    }
    $id = 'art-' . $cle;
    $h = '<form class="art-form" method="post" enctype="multipart/form-data" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_article" value="poser">';
    if ($edit && !empty($a['pid'])) $h .= '<input type="hidden" name="pid" value="' . (int) $a['pid'] . '">';
    if ($edit && isset($a['idx'])) $h .= '<input type="hidden" name="idx" value="' . (int) $a['idx'] . '">';
    return $h
        . '<div class="field"><label for="' . $id . '-nom">Le nom de l’article</label><input id="' . $id . '-nom" name="nom" type="text" maxlength="120" required value="' . esc_attr($edit ? $a['nom'] : '') . '" placeholder="Ex. : Bougie à la vanille"></div>'
        . '<div class="field"><label for="' . $id . '-prix">Le prix (€)</label><input id="' . $id . '-prix" name="prix" type="text" inputmode="decimal" value="' . esc_attr($edit && $a['prix'] !== '' ? number_format((float) $a['prix'], 2, ',', '') : '') . '" placeholder="Ex. : 12,50"></div>'
        . '<label class="check art-sans-prix"><input type="checkbox" name="sans_prix" value="1"' . ($edit && $a['prix'] === '' ? ' checked' : '') . ' onchange="var p=this.form.elements.prix;p.disabled=this.checked;if(this.checked)p.value=\'\';"><span>Je ne mets pas de prix <small>(l’article est présenté, sans achat en ligne)</small></span></label>'
        . $choix
        . '<div class="field"><label for="' . $id . '-desc">La description</label><textarea id="' . $id . '-desc" name="description" rows="4" maxlength="3000" placeholder="Ce qui le rend unique, sa taille, sa matière…">' . esc_textarea($edit ? $a['desc'] : '') . '</textarea></div>'
        . '<label class="req-photo"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="sr-only"' . ($edit ? '' : ' required') . '>' . aled08e_icon('image-plus') . '<span>' . ($edit ? 'Changer la photo (facultatif)' : 'Ajouter la photo') . '</span></label>'
        . '<button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>' . ($edit ? 'Enregistrer' : 'Mettre en ligne') . '</span></button></form>';
}

function aled08e_articles_html($uid) {
    $flash = get_transient('aled08_art_flash_' . $uid);
    if ($flash) delete_transient('aled08_art_flash_' . $uid);
    $famille = aled08e_famille($uid);
    $nonce = wp_nonce_field('aled08e_art', '_aled08e_art', true, false);
    $act = esc_url(aled08e_url());
    $prix = aled08e_art_prix();

    // les articles : ceux de la boutique (site relié), sinon ceux gardés ici
    $prods = aled08e_art_produits($uid);
    $arts = [];
    if (is_array($prods)) {
        foreach ($prods as $p) $arts[] = ['pid' => (int) $p['id'], 'nom' => (string) $p['nom'], 'prix' => (string) $p['prix'], 'desc' => (string) ($p['description'] ?? ''), 'img' => (string) ($p['image'] ?? ''), 'statut' => $p['statut'] === 'publish' ? 'en_ligne' : 'hors_vente', 'modifiable' => !empty($p['modifiable']), 'a_partir' => !empty($p['a_partir']), 'categories' => (array) ($p['categories'] ?? [])];
    }
    $locaux = aled08e_art_liste($uid);
    foreach ($locaux as $i => $a) if (($a['statut'] ?? '') === 'attente' || !is_array($prods)) $arts[] = ['idx' => $i, 'nom' => $a['nom'], 'prix' => (string) $a['prix'], 'desc' => $a['desc'], 'img' => !empty($a['img']) ? (string) wp_get_attachment_image_url((int) $a['img'], 'medium') : '', 'statut' => 'attente', 'modifiable' => true];
    $total = aled08e_art_total($uid);
    $pris = count($arts);
    $libres = max(0, $total - $pris);
    $libre = aled08e_art_libre();
    $cats = aled08e_art_categories($uid);
    $nomsCats = []; foreach ($cats as $c) $nomsCats[(int) $c['id']] = (string) $c['nom'];

    $h = '<section class="art-zone" aria-label="Vos articles">';
    $h .= '<div class="art-hero"><span class="art-hero-art" aria-hidden="true">' . aled08e_monster('mochi') . '</span>'
        . '<div class="art-hero-txt"><h3>Vos articles</h3><p>Une photo, une description, un prix : votre article est en ligne tout de suite.</p></div>'
        . ($libre ? '<p class="art-compteur"><b>' . (int) $pris . '</b><small>article' . ($pris > 1 ? 's' : '') . '</small></p></div>' : '<p class="art-compteur"><b>' . (int) $libres . '</b><small>emplacement' . ($libres > 1 ? 's' : '') . ' libre' . ($libres > 1 ? 's' : '') . ' sur ' . (int) $total . '</small></p></div>');
    if ($flash) $h .= '<p class="' . ($flash[0] ? 'esp-empty' : 'esp-warn') . '" role="status">' . esc_html($flash[1]) . '</p>';
    $h .= aled08e_pd_flash_html();
    if ($prods === null && aled08e_art_pret($uid)) $h .= '<p class="esp-warn">Votre boutique ne répond pas pour le moment : vos produits s’afficheront ici dès qu’elle répond. Rechargez la page dans un instant.</p>';
    if (!aled08e_art_pret($uid)) $h .= '<p class="app-note">' . aled08e_icon('info') . ' Votre boutique n’est pas encore reliée à votre espace : vos articles sont gardés ici et mis en ligne pour vous.</p>';

    // ajouter un article : en premier, bien visible
    if ($libres > 0) {
        $h .= '<details class="art-ajouter"><summary><span class="art-plus">' . aled08e_icon('plus') . '</span><span><strong>Ajouter un article</strong><small>' . ($libre ? 'Autant que vous voulez' : (int) $libres . ' emplacement' . ($libres > 1 ? 's' : '') . ' libre' . ($libres > 1 ? 's' : '')) . '</small></span></summary>'
            . aled08e_art_form($nonce, $act, 'nouveau', null, $cats) . '</details>';
    }

    if ($arts) {
        $h .= '<ul class="art-grille">';
        foreach ($arts as $k => $a) {
            $etat = $a['statut'] === 'en_ligne' ? '<span class="art-statut is-ok">' . aled08e_icon('check') . 'En ligne</span>' : ($a['statut'] === 'attente' ? '<span class="art-statut is-attente">' . aled08e_icon('clock') . 'Bientôt en ligne</span>' : '<span class="art-statut is-off">Hors vente</span>');
            $cible = !empty($a['pid']) ? '<input type="hidden" name="pid" value="' . (int) $a['pid'] . '">' : '<input type="hidden" name="idx" value="' . (int) $a['idx'] . '">';
            $h .= '<li class="art-carte"><div class="art-img">' . ($a['img'] ? '<img src="' . esc_url($a['img']) . '" alt="" loading="lazy">' : aled08e_icon('shopping-bag')) . '</div>'
                . '<div class="art-corps"><strong>' . esc_html($a['nom']) . '</strong>' . ($a['prix'] !== '' ? '<b class="art-prix">' . (!empty($a['a_partir']) ? '<small>dès </small>' : '') . esc_html(number_format((float) $a['prix'], 2, ',', ' ')) . ' €</b>' : '<b class="art-prix art-prix-sans">Sans prix</b>') . $etat . (function () use ($a, $nomsCats) { $l = []; foreach ((array) ($a['categories'] ?? []) as $cid) if (isset($nomsCats[(int) $cid])) $l[] = '<em class="art-cat-tag">' . esc_html($nomsCats[(int) $cid]) . '</em>'; return $l ? '<span class="art-cat-tags">' . implode('', $l) . '</span>' : ''; })() . '</div>';
            if ($a['modifiable']) {
                $h .= '<details class="art-edit"><summary>' . aled08e_icon('pencil') . '<span>Modifier</span></summary>' . aled08e_art_form($nonce, $act, 'e' . $k, $a, $cats)
                    . '<form class="art-retirer" method="post" action="' . $act . '" onsubmit="return confirm(\'Retirer cet article de votre boutique ?\');">' . $nonce . '<input type="hidden" name="aled08e_article" value="retirer">' . $cible . '<button class="link-btn" type="submit">' . aled08e_icon('x') . 'Retirer cet article</button></form></details>';
            } else {
                $h .= '<p class="art-note">Produit à variantes : faites une demande, on le règle avec vous.</p>';
            }
            $h .= '</li>';
        }
        $h .= '</ul>';
    } else {
        $h .= '<p class="esp-empty">Pas encore d’article. Ajoutez le premier : il sera en ligne dans votre boutique tout de suite.</p>';
    }

    // mes catégories : pour ranger les articles (elles existent aussi sur le site, dans la boutique)
    if (aled08e_art_pret($uid)) {
        $h .= '<details class="art-categories"' . ($cats ? '' : ' open') . '><summary>' . aled08e_icon('tag') . '<span><strong>Mes catégories</strong><small>' . ($cats ? count($cats) . ' catégorie' . (count($cats) > 1 ? 's' : '') . ' pour ranger vos articles' : 'Rangez vos articles : bouquets, cadeaux, décoration…') . '</small></span></summary>';
        if ($cats) {
            $h .= '<ul class="art-cat-liste">';
            foreach ($cats as $c) $h .= '<li><span><strong>' . esc_html($c['nom']) . '</strong><small>' . (int) $c['nombre'] . ' article' . ((int) $c['nombre'] > 1 ? 's' : '') . '</small></span>'
                . '<form method="post" action="' . $act . '" onsubmit="return confirm(\'Supprimer cette catégorie ? Ses articles sont gardés.\');">' . $nonce . '<input type="hidden" name="aled08e_article" value="categorie_retirer"><input type="hidden" name="id_categorie" value="' . (int) $c['id'] . '"><button class="link-btn" type="submit">' . aled08e_icon('x') . 'Supprimer</button></form></li>';
            $h .= '</ul>';
        }
        $h .= '<form class="art-cat-form" method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_article" value="categorie"><div class="field"><label for="art-cat-nom">Nouvelle catégorie</label><input id="art-cat-nom" name="nom_categorie" type="text" maxlength="60" required placeholder="Ex. : Bouquets"></div>'
            . '<button class="btn btn-light" type="submit">' . aled08e_icon('plus') . '<span>Créer la catégorie</span></button></form>'
            . '<p class="app-note">Pour ranger un article : « Modifier », puis cochez sa catégorie. C’est en place sur votre boutique tout de suite.</p></details>';
    }
    // débloquer des emplacements (anciennes offres seulement)
    if ($libre) return $h . '</section>';
    $h .= '<div class="art-debloque"><div class="art-debloque-txt"><strong>' . aled08e_icon('sparkles') . 'Besoin de plus de place ?</strong><p>Chaque emplacement en plus coûte <b>' . esc_html(aled08e_euro_txt($prix)) . '</b>, payé une seule fois. Il est à vous pour toujours : si vous retirez un article, la place reste libre.</p></div>'
        . '<form class="art-debloque-form" method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_article" value="debloquer"><div class="esp-seo-q" role="radiogroup" aria-label="Combien d’emplacements ?">';
    foreach ([1, 5, 10] as $i => $q) $h .= '<label class="esp-seo-q-choix"><input type="radio" name="quantite" value="' . $q . '"' . ($i === 0 ? ' checked' : '') . '><span><strong>+' . $q . '</strong><small>' . esc_html($famille ? 'offert' : aled08e_euro_txt($prix * $q)) . '</small></span></label>';
    $h .= '</div><label class="check"><input type="checkbox" name="accord" value="1" required><span>' . ($famille ? 'Je débloque, c’est offert pour moi' : (aled08e_pd_pret() ? 'J’accepte le prix choisi, je paie par carte à l’étape suivante' : 'J’accepte le prix choisi, Alex m’envoie la facture')) . '</span></label>'
        . '<button class="btn btn-primary" type="submit">' . aled08e_icon('credit-card') . '<span>' . ($famille ? 'Débloquer' : 'Payer et débloquer') . '</span></button></form></div>';
    return $h . '</section>';
}
