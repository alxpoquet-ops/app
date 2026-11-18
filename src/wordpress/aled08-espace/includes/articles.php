<?php
/**
 * Les Minis Monstres Espace client : les emplacements d'articles de la boutique (onglet « Ma boutique »).
 * L'option boutique donne des emplacements d'articles (5 compris). Le client remplit lui-même un emplacement : une photo,
 * une description et un prix pour un article, qui est créé tout de suite dans la boutique de son site (connecteur, action
 * article_poser). Chaque emplacement en plus coûte 2 € une seule fois, et reste à lui pour toujours.
 * Les prix viennent de src/config.js (creation.boutiqueProduits et creation.boutiqueSlot, via data.json).
 * Si le site n'est pas relié (ou si le connecteur est ancien), l'article est gardé et Alex le met en ligne à la main.
 */
defined('ABSPATH') || exit;

function aled08e_art_inclus() { return max(1, (int) (aled08e_data()['creation']['boutiqueProduits'] ?? 5)); }
function aled08e_art_prix() { return (float) (aled08e_data()['creation']['boutiqueSlot'] ?? 2); }
/* Les emplacements du client : compris + débloqués (un compte famille en a beaucoup : c'est offert) */
function aled08e_art_total($uid) { return aled08e_art_inclus() + (int) get_user_meta($uid, 'aled08_slots_achetes', true) + (aled08e_famille($uid) ? 100 : 0); }
function aled08e_art_liste($uid) { $l = get_user_meta($uid, 'aled08_articles', true); return is_array($l) ? array_values($l) : []; }
function aled08e_art_flash($uid, $ok, $texte) { set_transient('aled08_art_flash_' . (int) $uid, [$ok, $texte], 120); }
function aled08e_art_pret($uid) { return aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== ''; }

/* Un montant lu comme l'écrit un client : « 12,5 », « 12.50 € » */
function aled08e_art_prix_lu($v) { return (float) str_replace(',', '.', preg_replace('/[^\d,.]/', '', (string) $v)); }

/* ---------- les actions : poser un article, le retirer, débloquer des emplacements ---------- */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_article'])) return;
    $uid = get_current_user_id();
    $retour = function ($ok, $texte) use ($uid) { if ($uid) aled08e_art_flash($uid, $ok, $texte); wp_safe_redirect(aled08e_url() . '#vacances', 303); exit; };
    if (!$uid) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_art'] ?? '')), 'aled08e_art')) $retour(false, 'La page avait expiré. Réessayez.');
    if (!aled08e_est_boutique($uid)) $retour(false, 'Les emplacements d’articles sont réservés aux boutiques en ligne.');
    $P = wp_unslash($_POST);
    $op = sanitize_key((string) $P['aled08e_article']);
    $u = wp_get_current_user();
    $liste = aled08e_art_liste($uid);

    if ($op === 'poser') {
        $n = (int) get_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'));
        if ($n >= 40) $retour(false, 'Vous avez beaucoup travaillé aujourd’hui ! Revenez demain pour d’autres articles.');
        $idx = isset($P['idx']) && $P['idx'] !== '' ? (int) $P['idx'] : -1; // -1 : un nouvel article
        $nouveau = $idx < 0 || !isset($liste[$idx]);
        if ($nouveau && count($liste) >= aled08e_art_total($uid)) $retour(false, 'Tous vos emplacements sont pris. Débloquez-en un de plus, ci-dessous.');
        $nom = trim(sanitize_text_field((string) ($P['nom'] ?? '')));
        $desc = trim(sanitize_textarea_field((string) ($P['description'] ?? '')));
        $prix = aled08e_art_prix_lu($P['prix'] ?? '');
        if ($nom === '' || mb_strlen($nom) > 120) $retour(false, 'Donnez un nom à votre article (120 caractères au plus).');
        if ($prix < 0.5 || $prix > 5000) $retour(false, 'Le prix doit être entre 0,50 € et 5 000 €.');
        $desc = mb_substr($desc, 0, 3000);
        // la photo : envoyée dans la médiathèque, puis récupérée par le site du client
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
        $ancien = $nouveau ? [] : $liste[$idx];
        $art = ['nom' => $nom, 'prix' => $prix, 'desc' => $desc, 'img' => $aid ?: (int) ($ancien['img'] ?? 0), 'id' => (int) ($ancien['id'] ?? 0), 'statut' => 'attente', 'le' => time()];
        $res = null;
        if (aled08e_art_pret($uid)) {
            $args = ['nom' => $nom, 'prix' => $prix, 'description' => $desc];
            if ($art['id']) $args['id'] = $art['id'];
            if ($aid) $args['image_url'] = wp_get_attachment_url($aid);
            $res = aled08e_lia_appel($uid, 'article_poser', $args);
        }
        if (is_array($res) && !empty($res['id'])) { $art['id'] = (int) $res['id']; $art['statut'] = 'en_ligne'; $art['url'] = (string) ($res['adresse'] ?? ''); }
        else {
            // le site n'est pas relié, ou son connecteur est trop ancien : Alex met l'article en ligne à la main
            $why = is_wp_error($res) ? $res->get_error_message() : 'site pas encore relié à l’espace client';
            wp_mail(aled08e_to(), 'Article à mettre en ligne : ' . $u->display_name, 'Client : ' . $u->display_name . ' (' . $u->user_email . ")\nSite : " . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\nRaison : " . $why . "\n\nArticle : " . $nom . "\nPrix : " . $prix . " €\nDescription :\n" . $desc . "\n" . ($art['img'] ? "Photo : " . wp_get_attachment_url($art['img']) . "\n" : '') . ($nouveau ? '' : "\n(C'est une modification d'un article existant.)\n"), aled08e_mail_headers($u->display_name . ' <' . $u->user_email . '>'));
        }
        if ($nouveau) $liste[] = $art; else $liste[$idx] = $art;
        update_user_meta($uid, 'aled08_articles', array_values($liste));
        set_transient('aled08_art_n_' . $uid . '_' . wp_date('Ymd'), $n + 1, DAY_IN_SECONDS);
        $retour(true, $art['statut'] === 'en_ligne' ? ($nouveau ? 'Votre article est en ligne dans votre boutique !' : 'Votre article est mis à jour.') : 'Votre article est enregistré : Alex le met en ligne dans les prochaines heures.');
    }

    if ($op === 'retirer') {
        $idx = (int) ($P['idx'] ?? -1);
        if (!isset($liste[$idx])) $retour(false, 'Cet article n’existe plus.');
        $art = $liste[$idx];
        if (!empty($art['id']) && ($art['statut'] ?? '') === 'en_ligne' && aled08e_art_pret($uid)) {
            $r = aled08e_lia_appel($uid, 'article_retirer', ['id' => (int) $art['id']]);
            if (is_wp_error($r)) { wp_mail(aled08e_to(), 'Article à retirer : ' . $u->display_name, 'Le client veut retirer « ' . $art['nom'] . " » (produit n° " . (int) $art['id'] . ") mais le site n'a pas répondu : " . $r->get_error_message() . "\n", aled08e_mail_headers()); }
        } elseif (!empty($art['id'])) {
            wp_mail(aled08e_to(), 'Article à retirer : ' . $u->display_name, 'Le client veut retirer « ' . $art['nom'] . " ».\n", aled08e_mail_headers());
        }
        array_splice($liste, $idx, 1);
        update_user_meta($uid, 'aled08_articles', array_values($liste));
        $retour(true, 'Votre article est retiré. Votre emplacement est libre : vous pouvez en mettre un autre.');
    }

    if ($op === 'debloquer') {
        $q = (int) ($P['quantite'] ?? 1);
        if (!in_array($q, [1, 5, 10], true)) $q = 1;
        if (empty($P['accord'])) $retour(false, 'Cochez la case qui accepte le prix avant de débloquer.');
        $prix = aled08e_art_prix();
        $total = $prix * $q;
        $facture = false;
        if (!aled08e_famille($uid)) {
            $cus = aled08e_meta($uid, 'stripe_customer');
            if (function_exists('aled08e_stripe_ready') && aled08e_stripe_ready() && $cus !== '' && !aled08e_sans_formule($uid)) {
                $r = aled08e_stripe_request('POST', '/v1/invoiceitems', ['customer' => $cus, 'amount' => (int) round($total * 100), 'currency' => 'eur', 'description' => ($q > 1 ? $q . ' emplacements' : 'Un emplacement') . ' d’articles en plus pour votre boutique'], 'slots_' . $uid . '_' . time(), true);
                $facture = !is_wp_error($r) && !empty($r['id']);
            }
        }
        update_user_meta($uid, 'aled08_slots_achetes', (int) get_user_meta($uid, 'aled08_slots_achetes', true) + $q);
        wp_mail(aled08e_to(), 'Emplacements d’articles débloqués : ' . $u->display_name, $u->display_name . ' a débloqué ' . $q . ' emplacement(s) d’articles pour ' . aled08e_euro_txt($total) . ' (' . (aled08e_famille($uid) ? 'offert, compte famille' : ($facture ? 'ajouté à sa prochaine facture Stripe' : 'À FACTURER À LA MAIN')) . ").\n", aled08e_mail_headers());
        $retour(true, $q > 1 ? $q . ' emplacements en plus sont à vous, pour toujours !' : 'Un emplacement de plus est à vous, pour toujours !');
    }
    $retour(false, 'Ça n’a pas marché. Réessayez.');
}, 5);

/* ---------- l'affichage : les emplacements, devant tout le reste de l'onglet ---------- */
function aled08e_articles_html($uid) {
    $flash = get_transient('aled08_art_flash_' . $uid);
    if ($flash) delete_transient('aled08_art_flash_' . $uid);
    $famille = aled08e_famille($uid);
    $liste = aled08e_art_liste($uid);
    $total = aled08e_art_total($uid);
    $utilises = count($liste);
    $libres = max(0, $total - $utilises);
    $prix = aled08e_art_prix();
    $nonce = wp_nonce_field('aled08e_art', '_aled08e_art', true, false);
    $act = esc_url(aled08e_url());
    $formArticle = function ($idx, $a = null) use ($nonce, $act) {
        $edit = $a !== null;
        $i = $edit ? 'e' . (int) $idx : 'n' . (int) $idx;
        return '<form class="art-form" method="post" enctype="multipart/form-data" action="' . $act . '">' . $nonce
            . '<input type="hidden" name="aled08e_article" value="poser"><input type="hidden" name="idx" value="' . ($edit ? (int) $idx : '') . '">'
            . '<div class="field"><label for="art-nom-' . $i . '">Le nom de l’article</label><input id="art-nom-' . $i . '" name="nom" type="text" maxlength="120" required value="' . esc_attr($edit ? $a['nom'] : '') . '" placeholder="Ex. : Bougie à la vanille"></div>'
            . '<div class="field"><label for="art-prix-' . $i . '">Le prix (€)</label><input id="art-prix-' . $i . '" name="prix" type="text" inputmode="decimal" required value="' . esc_attr($edit ? number_format((float) $a['prix'], 2, ',', '') : '') . '" placeholder="Ex. : 12,50"></div>'
            . '<div class="field"><label for="art-desc-' . $i . '">La description</label><textarea id="art-desc-' . $i . '" name="description" rows="3" maxlength="3000" placeholder="Ce qui le rend unique, sa taille, sa matière…">' . esc_textarea($edit ? $a['desc'] : '') . '</textarea></div>'
            . '<label class="req-photo"><input type="file" name="image" accept="image/jpeg,image/png,image/webp" class="sr-only"' . ($edit ? '' : ' required') . '>' . aled08e_icon('image-plus') . '<span>' . ($edit ? 'Changer la photo (facultatif)' : 'Ajouter la photo de l’article') . '</span></label>'
            . '<button class="btn btn-primary" type="submit">' . aled08e_icon('check') . '<span>' . ($edit ? 'Enregistrer' : 'Mettre en ligne') . '</span></button></form>';
    };

    $h = '<section class="art-zone" aria-label="Vos emplacements d’articles">';
    $h .= '<div class="art-hero"><span class="art-hero-art" aria-hidden="true">' . aled08e_monster('champi') . '</span><div><h3>Vos articles</h3><p>Une photo, une description et un prix : votre article est en ligne dans votre boutique, tout de suite. Vous avez <b>' . (int) $total . ' emplacement' . ($total > 1 ? 's' : '') . '</b>, dont <b>' . (int) $libres . ' libre' . ($libres > 1 ? 's' : '') . '</b>.</p></div>'
        . '<p class="art-compteur"><b>' . (int) $utilises . '</b><small>sur ' . (int) $total . '</small></p></div>';
    if ($flash) $h .= '<p class="' . ($flash[0] ? 'esp-empty' : 'esp-warn') . '" role="status">' . esc_html($flash[1]) . '</p>';

    $h .= '<div class="art-grille">';
    foreach ($liste as $idx => $a) {
        $img = !empty($a['img']) ? wp_get_attachment_image_url((int) $a['img'], 'medium') : '';
        $enLigne = ($a['statut'] ?? '') === 'en_ligne';
        $h .= '<article class="art-carte is-plein"><div class="art-img">' . ($img ? '<img src="' . esc_url($img) . '" alt="' . esc_attr($a['nom']) . '" loading="lazy">' : aled08e_icon('shopping-bag')) . '</div>'
            . '<div class="art-corps"><strong>' . esc_html($a['nom']) . '</strong><b class="art-prix">' . esc_html(number_format((float) $a['prix'], 2, ',', ' ')) . ' €</b>'
            . '<span class="art-statut ' . ($enLigne ? 'is-ok' : 'is-attente') . '">' . ($enLigne ? aled08e_icon('check') . 'En ligne' : aled08e_icon('clock') . 'Alex le met en ligne') . '</span></div>'
            . '<div class="art-actions"><details class="art-edit"><summary class="btn btn-light btn-sm">' . aled08e_icon('pencil') . '<span>Modifier</span></summary>' . $formArticle($idx, $a) . '</details>'
            . '<form method="post" action="' . $act . '" onsubmit="return confirm(\'Retirer cet article de votre boutique ?\');">' . $nonce . '<input type="hidden" name="aled08e_article" value="retirer"><input type="hidden" name="idx" value="' . (int) $idx . '"><button class="btn btn-light btn-sm art-retirer" type="submit">' . aled08e_icon('x') . '<span>Retirer</span></button></form></div></article>';
    }
    $affiche = min($libres, 4);
    for ($k = 0; $k < $affiche; $k++) {
        $h .= '<article class="art-carte is-vide"><details class="art-ajout"><summary><span class="art-plus">' . aled08e_icon('plus') . '</span><strong>Emplacement libre</strong><small>Ajouter un article</small></summary>' . $formArticle(-1 - $k) . '</details></article>';
    }
    $h .= '</div>';
    if ($libres > $affiche) $h .= '<p class="app-note">…et ' . (int) ($libres - $affiche) . ' autre' . (($libres - $affiche) > 1 ? 's' : '') . ' emplacement' . (($libres - $affiche) > 1 ? 's' : '') . ' libre' . (($libres - $affiche) > 1 ? 's' : '') . '. Ils s’affichent au fur et à mesure.</p>';
    if (!aled08e_art_pret($uid)) $h .= '<p class="app-note">' . aled08e_icon('info') . ' Votre boutique n’est pas encore reliée à votre espace : vos articles sont gardés et Alex les met en ligne pour vous.</p>';

    // débloquer des emplacements
    $h .= '<div class="art-debloque"><div class="art-debloque-txt"><strong>' . aled08e_icon('sparkles') . 'Besoin de plus de place ?</strong><p>Chaque emplacement en plus coûte <b>' . esc_html(aled08e_euro_txt($prix)) . '</b>, payé une seule fois. Il est à vous pour toujours : si vous retirez un article, la place reste libre.</p></div>'
        . '<form class="art-debloque-form" method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_article" value="debloquer">'
        . '<div class="esp-seo-q" role="radiogroup" aria-label="Combien d’emplacements ?">';
    foreach ([1, 5, 10] as $i => $q) $h .= '<label class="esp-seo-q-choix"><input type="radio" name="quantite" value="' . $q . '"' . ($i === 0 ? ' checked' : '') . '><span><strong>' . ($q === 1 ? '1 emplacement' : $q . ' emplacements') . '</strong><small>' . esc_html($famille ? 'offert' : aled08e_euro_txt($prix * $q)) . '</small></span></label>';
    $h .= '</div><label class="check"><input type="checkbox" name="accord" value="1" required><span>' . ($famille ? 'Je débloque, c’est offert pour moi' : 'J’accepte le prix choisi, ajouté à ma prochaine facture') . '</span></label>'
        . '<button class="btn btn-primary" type="submit">' . aled08e_icon('key-round') . '<span>Débloquer</span></button></form></div>';
    return $h . '</section>';
}
