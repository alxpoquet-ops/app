<?php
/**
 * Les Minis Monstres Espace client : l'onglet « Extras », la petite boutique des extras.
 * Tout ce qu'un client peut ajouter à son site, rangé par famille, avec le prix bien visible :
 * - les extras payés une fois (aLaDemande dans data.json) : on les commande, ils s'ajoutent à la prochaine facture, Alex les fait ;
 * - les extras au mois (options) : on les ajoute ou on les retire d'un clic, ils s'ajoutent à l'abonnement.
 * Les prix et les textes viennent de src/config.js (data.json). Rien n'est facturé sans que le client ait coché son accord.
 * « À la une » (config.tutosOffre.aLaUne, 24 novembre 2026) : la page de visibilité Google, l'option e-commerce et la traduction
 * anglaise passent en premier, avec un petit badge et le lien vers leur tuto gratuit (includes/aide.php). Rien de plus voyant.
 */
defined('ABSPATH') || exit;

/* La couleur de chaque famille (les mêmes pastels que le reste de l'espace) */
function aled08e_ex_couleur($groupe) {
    return ['trouve' => 'mint', 'contact' => 'pink', 'reseaux' => 'lilac', 'langue' => 'sky', 'quotidien' => 'butter', 'boutique' => 'peach'][$groupe] ?? 'lilac';
}

/* « À la une » : la place de l'extra dans la liste (0, 1, 2…), ou -1 ; et le lien vers son tuto */
function aled08e_ex_une_rang($id) {
    if (!function_exists('aled08e_aide_a_la_une')) return -1;
    $r = array_search($id, array_values(aled08e_aide_a_la_une()), true);
    return $r === false ? -1 : (int) $r;
}
function aled08e_ex_une_badge($id, $badge = '') {
    if ($badge !== '') return '<em class="ex-badge">' . esc_html($badge) . '</em>';
    return aled08e_ex_une_rang($id) >= 0 ? '<em class="ex-badge ex-badge-une">' . aled08e_icon('star') . 'À la une</em>' : '';
}
function aled08e_ex_tuto_html($id) {
    $slug = function_exists('aled08e_aide_tuto_extra') ? aled08e_aide_tuto_extra($id) : '';
    $l = $slug !== '' ? aled08e_aide_lien_html($slug, 'Le tuto') : '';
    return $l !== '' ? '<p class="ex-tuto">' . $l . '</p>' : '';
}
/* L'option e-commerce (« À la une ») : ce n'est pas un extra qu'on commande ici, la carte mène à « Ma boutique » */
function aled08e_ex_carte_ecommerce($uid) {
    $D = aled08e_data();
    $prix = isset($D['creation']['ecommerce']) ? (int) $D['creation']['ecommerce'] : 200;
    $actif = aled08e_est_boutique($uid);
    $badge = $actif ? '<em class="ex-badge ex-badge-actif">' . aled08e_icon('check') . 'Active</em>' : aled08e_ex_une_badge('ecommerce');
    return '<article class="ex-carte c-' . aled08e_ex_couleur('boutique') . ($actif ? ' is-actif' : '') . '" id="ex-ecommerce">'
        . '<header class="ex-tete"><span class="ex-ico">' . aled08e_icon('shopping-bag') . '</span><div class="ex-nom"><strong>Option e-commerce</strong>' . $badge . '</div>'
        . ($actif ? '' : '<span class="ex-prix"><b>+ ' . esc_html(aled08e_euro_txt($prix)) . '</b><small>payé une fois</small></span>') . '</header>'
        . '<p class="ex-court">' . ($actif ? 'Votre boutique en ligne est ouverte : vos articles, vos prix, vos paiements et vos commandes se gèrent dans « Ma boutique ».' : 'Une boutique en ligne sur votre site : vos articles, vos prix, vos paiements et vos commandes, que vous gérez vous-même dans « Ma boutique ».') . '</p>'
        . aled08e_ex_tuto_html('ecommerce')
        . '<button type="button" class="btn ' . ($actif ? 'btn-light' : 'btn-primary') . ' btn-sm ex-go" data-go="vacances">' . aled08e_icon($actif ? 'store' : 'key-round') . '<span>' . ($actif ? 'Ouvrir ma boutique' : 'Voir comment l’ajouter') . '</span></button>'
        . '</article>';
}

/* Une quantité de pack valide pour cet extra (sinon la première proposée, ou 1) */
function aled08e_extra_quantite($x, $val) {
    $packs = array_map('intval', (array) ($x['packs'] ?? []));
    $val = (int) $val;
    if (!$packs) return 1;
    return in_array($val, $packs, true) ? $val : $packs[0];
}

/* Le choix d'un pack (1, 5 ou 10 pages…) : de petites cartes avec le total */
function aled08e_extra_packs_html($x, $famille) {
    $packs = array_map('intval', (array) ($x['packs'] ?? []));
    if (!$packs) return '';
    $unite = (string) ($x['unite'] ?? '');
    $h = '<div class="esp-seo-q" role="radiogroup" aria-label="Combien ?">';
    foreach ($packs as $i => $n) {
        $lib = $n === 1 ? 'Un ' . ($unite ?: 'extra') : $n . ' ' . ($unite === 'page' ? 'pages' : ($unite === 'produit' ? 'produits' : ($unite === 'article' ? 'articles' : 'fois')));
        $h .= '<label class="esp-seo-q-choix"><input type="radio" name="quantite" value="' . (int) $n . '"' . ($i === 0 ? ' checked' : '') . '><span><strong>' . esc_html($lib) . '</strong><small>' . esc_html($famille ? 'offert' : aled08e_euro_txt($x['prix'] * $n)) . '</small></span></label>';
    }
    return $h . '</div>';
}

/* Le prix affiché en haut d'une carte : [gros, petit] */
function aled08e_ex_prix_txt($x, $famille) {
    if ($famille) return ['offert', 'pour vous'];
    $unite = (string) ($x['unite'] ?? '');
    if (!empty($x['packs'])) return [aled08e_euro_txt($x['prix']), 'la ' . $unite . ', payée une fois'];
    return [aled08e_euro_txt($x['prix']), 'payé une fois'];
}

/* L'extra est-il pour ce client ? (réservé aux boutiques, par exemple) */
function aled08e_ex_pour_moi($x, $uid) {
    $types = (array) ($x['types'] ?? []);
    return !$types || in_array(aled08e_est_boutique($uid) ? 'boutique' : 'autre', $types, true);
}

/* Les précisions à demander pour chaque extra payé une fois : [la question, un exemple] */
function aled08e_ex_aide() {
    return [
        'packseo' => ['Des idées de sujets ? (facultatif, sinon Mirette choisit pour vous)', 'Ex. : plombier à Sedan, dépannage le dimanche, prix d’un chauffe-eau'],
        'article' => ['Le sujet de l’article, et ce que vous voulez y dire', 'Ex. : nos conseils pour entretenir un parquet'],
        'avis' => ['Le lien de votre fiche Google (ou le nom exact de votre établissement)', 'Ex. : Boulangerie Martin, rue de la Gare, Sedan'],
        'rdv' => ['Vos jours et horaires de rendez-vous, et la durée d’un rendez-vous', 'Ex. : du mardi au samedi, 9 h à 18 h, rendez-vous de 45 minutes'],
        'whatsapp' => ['Le numéro à afficher (WhatsApp et téléphone)', 'Ex. : 06 12 34 56 78'],
        'newsletter' => ['Ce que vous voulez envoyer à vos clients, et à quel rythme', 'Ex. : mes nouveautés et mes promos, une fois par mois'],
        'instagram' => ['Le nom de votre compte Instagram, et où l’afficher sur le site', 'Ex. : @mon_compte, en bas de la page d’accueil'],
        'traduction' => ['Les pages à traduire (toutes, ou lesquelles)', 'Ex. : toutes les pages, en anglais'],
        'produits' => ['Vos produits (nom, prix, description) et où envoyer les photos', 'Ex. : 10 bougies parfumées, de 8 à 15 €, photos par e-mail'],
        'page' => ['Ce que la nouvelle page doit présenter', 'Ex. : une page pour nos menus de groupe, avec les prix'],
        'photos' => ['Où mettre vos photos, et comment me les envoyer', 'Ex. : 12 photos de mes réalisations, dans la page Galerie'],
        'reprise' => ['L’adresse de votre ancien site, et ce que vous voulez garder', 'Ex. : www.ancien-site.fr, on garde les textes et les photos'],
        'anglais' => ['Les pages à traduire (toutes, ou lesquelles)', 'Ex. : toutes les pages de mon site'],
        'specifique' => ['Décrivez ce que vous voulez ajouter à votre site', 'Ex. : une prise de rendez-vous en ligne, une galerie photo, un espace réservé à mes clients'],
        'point' => ['Vos disponibilités et le sujet du point', 'Ex. : mardi ou jeudi après 18 heures, pour parler de Google'],
    ];
}

/* Une carte d'extra payé une fois */
function aled08e_ex_carte_unique($x, $uid, $famille, $sans) {
    $id = $x['id'];
    $q = aled08e_ex_aide()[$id] ?? ['Vos précisions', 'Dites-nous ce qu’il vous faut'];
    $inclus = '';
    if (!empty($x['inclus'])) { $inclus = '<ul class="ex-inclus">'; foreach ((array) $x['inclus'] as $l) $inclus .= '<li>' . aled08e_icon('check') . '<span>' . esc_html($l) . '</span></li>'; $inclus .= '</ul>'; }
    // sur devis : pas de prix, pas de paiement. Le client décrit son besoin, il reçoit un prix.
    if (!empty($x['devis'])) {
        return '<article class="ex-carte ex-devis c-' . aled08e_ex_couleur($x['groupe'] ?? '') . '" id="ex-' . esc_attr($id) . '">'
            . '<header class="ex-tete"><span class="ex-ico">' . aled08e_icon($x['icon'] ?? 'plus') . '</span><div class="ex-nom"><strong>' . esc_html($x['name']) . '</strong>' . aled08e_ex_une_badge($id, (string) ($x['badge'] ?? '')) . '</div>'
            . '<span class="ex-prix"><b>Sur devis</b><small>gratuit, sans engagement</small></span></header>'
            . '<p class="ex-court">' . esc_html($x['court'] ?? $x['desc'] ?? '') . '</p>' . aled08e_ex_tuto_html($id)
            . '<details class="ex-plus"><summary><span>' . aled08e_icon('file-text') . 'Demander un devis</span></summary>'
            . '<form class="req-form" method="post" action="' . esc_url(aled08e_url()) . '">'
            . '<input type="hidden" name="aled08e_demande" value="1"><input type="hidden" name="extra" value="' . esc_attr($id) . '"><input type="hidden" name="extra_ok" value="1">' . wp_nonce_field('aled08e_demande', '_aled08e', true, false)
            . '<p class="app-note">' . esc_html($x['desc'] ?? '') . '</p>'
            . '<div class="field"><label for="extra-' . esc_attr($id) . '">' . esc_html($q[0]) . '</label><textarea id="extra-' . esc_attr($id) . '" name="demande" rows="3" maxlength="2000" required placeholder="' . esc_attr($q[1]) . '"></textarea></div>'
            . '<p class="ex-delai">' . aled08e_icon('clock') . '<span>Vous recevez un prix. Rien à payer tant que vous n’avez pas dit oui.</span></p>'
            . '<button class="btn btn-primary" type="submit">' . aled08e_icon('send') . '<span>Envoyer ma demande de devis</span></button></form></details>'
            . '</article>';
    }
    [$gros, $petit] = aled08e_ex_prix_txt($x, $famille);
    $badge = aled08e_ex_une_badge($id, (string) ($x['badge'] ?? ''));
    $accord = $famille ? 'Je commande, c’est offert pour moi' : (!empty($x['packs']) ? 'J’accepte le prix du pack choisi ci-dessus' : 'J’accepte ' . aled08e_euro_txt($x['prix']));
    return '<article class="ex-carte c-' . aled08e_ex_couleur($x['groupe'] ?? '') . '" id="ex-' . esc_attr($id) . '">'
        . '<header class="ex-tete"><span class="ex-ico">' . aled08e_icon($x['icon'] ?? 'plus') . '</span><div class="ex-nom"><strong>' . esc_html($x['name']) . '</strong>' . $badge . '</div>'
        . '<span class="ex-prix"><b>' . esc_html($gros) . '</b><small>' . esc_html($petit) . '</small></span></header>'
        . '<p class="ex-court">' . esc_html($x['court'] ?? $x['desc'] ?? '') . '</p>' . $inclus . aled08e_ex_tuto_html($id)
        . '<details class="ex-plus"><summary><span>' . aled08e_icon('plus') . 'Je le veux</span></summary>'
        . '<form class="req-form" method="post" action="' . esc_url(aled08e_url()) . '">'
        . '<input type="hidden" name="aled08e_demande" value="1"><input type="hidden" name="extra" value="' . esc_attr($id) . '">' . wp_nonce_field('aled08e_demande', '_aled08e', true, false)
        . '<p class="app-note">' . esc_html($x['desc'] ?? '') . '</p>'
        . aled08e_extra_packs_html($x, $famille)
        . '<div class="field"><label for="extra-' . esc_attr($id) . '">' . esc_html($q[0]) . '</label><textarea id="extra-' . esc_attr($id) . '" name="demande" rows="2" maxlength="2000" ' . ($id === 'packseo' ? '' : 'required ') . 'placeholder="' . esc_attr($q[1]) . '"></textarea></div>'
        . '<label class="check"><input type="checkbox" name="extra_ok" value="1" required><span>' . esc_html($accord) . ($famille ? '' : (aled08e_pd_pret() ? ', je paie par carte à l’étape suivante' : ', je reçois la facture par e-mail')
            . '. Je demande que le travail commence tout de suite, et je reconnais perdre mon droit de rétractation une fois qu’il est entièrement livré') . '</span></label>'
        . '<p class="ex-delai">' . aled08e_icon('clock') . '<span>Vous êtes prévenu dès que c’est fait.</span></p>'
        . '<button class="btn btn-primary" type="submit">' . aled08e_icon('credit-card') . '<span>' . ($famille ? 'Commander' : 'Commander et payer') . '</span></button></form></details>'
        . '</article>';
}

/* Une carte d'extra au mois : on l'ajoute ou on le retire d'un clic */
function aled08e_ex_carte_mois($o, $uid, $actifs, $mult, $per) {
    $id = $o['id'];
    $actif = in_array($id, $actifs, true);
    $voulus = $actif ? array_values(array_diff($actifs, [$id])) : array_values(array_unique(array_merge($actifs, [$id])));
    $badge = $actif ? '<em class="ex-badge ex-badge-actif">' . aled08e_icon('check') . 'Actif</em>' : (!empty($o['badge']) ? '<em class="ex-badge">' . esc_html($o['badge']) . '</em>' : '');
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $form = '<form class="ex-bascule" method="post" action="' . esc_url(aled08e_url()) . '"><input type="hidden" name="aled08e_changer" value="1"><input type="hidden" name="retour" value="extras"><input type="hidden" name="forfait" value="' . esc_attr($f['id']) . '">'
        . wp_nonce_field('aled08e_changer', '_aled08e_changer', true, false);
    foreach ($voulus as $v) $form .= '<input type="hidden" name="options[]" value="' . esc_attr($v) . '">';
    $form .= $actif
        ? '<button class="btn btn-light btn-sm" type="submit">' . aled08e_icon('x') . '<span>Retirer de mon abonnement</span></button>'
        : '<button class="btn btn-primary btn-sm" type="submit">' . aled08e_icon('plus') . '<span>Ajouter et payer</span></button>';
    $form .= '</form>' . ($actif ? '' : '<p class="ex-delai">' . aled08e_icon('credit-card') . '<span>La part du mois en cours est payée tout de suite, puis c’est avec votre abonnement.</span></p>');
    return '<article class="ex-carte ex-mois c-' . aled08e_ex_couleur($o['group'] ?? '') . ($actif ? ' is-actif' : '') . '" id="ex-' . esc_attr($id) . '">'
        . '<header class="ex-tete"><span class="ex-ico">' . aled08e_icon($o['icon'] ?? 'plus') . '</span><div class="ex-nom"><strong>' . esc_html($o['name']) . '</strong>' . $badge . '</div>'
        . '<span class="ex-prix"><b>' . esc_html(aled08e_euro_txt($o['month'] * $mult)) . '</b><small>' . esc_html($per) . '</small></span></header>'
        . '<p class="ex-court">' . esc_html($o['court'] ?: $o['desc']) . aled08e_info_btn($id, $o['name'], $o['info'] ?? '') . '</p>'
        . $form . '</article>';
}

/* Tout l'onglet « Extras » */
function aled08e_extras_html($uid, $famille, $flash = '') {
    $D = aled08e_data();
    $sans = aled08e_sans_formule($uid);
    $annuel = aled08e_meta($uid, 'paiement') === 'annee';
    $mult = $annuel ? max(1, 12 - (int) ($D['moisOfferts'] ?? 2)) : 1;
    $per = $annuel ? 'par an' : 'par mois';
    $possibles = aled08e_changer_options_possibles($uid); // les extras au mois que ce client peut avoir
    $actifs = array_values(array_filter(array_column($possibles, 'id'), function ($id) use ($uid) { return aled08e_meta($uid, $id) === '1'; }));
    $groupes = (array) ($D['extrasGroupes'] ?? []);

    $unique = []; $mois = [];
    foreach (aled08e_a_la_demande() as $x) if ($x['id'] !== 'urgent' && aled08e_ex_pour_moi($x, $uid)) $unique[$x['groupe'] ?? 'quotidien'][] = $x;
    if (!$sans) foreach ($possibles as $o) $mois[$o['group'] ?? 'quotidien'][] = $o;

    $h = '<section class="ex-hero"><span class="ex-hero-art" aria-hidden="true">' . aled08e_monster('etoile') . '</span><div class="ex-hero-txt"><h3>Un petit plus ? Pépite s’en occupe</h3>'
        . '<p>La page se paie par carte. Le reste est sur devis, gratuit.</p></div>'
        . '<ul class="ex-garanties"><li>' . aled08e_icon('circle-check') . '<span>Paiement sécurisé par carte</span></li><li>' . aled08e_icon('wrench') . '<span>Suivi par Pépite</span></li></ul></section>';

    if ($flash) $h .= $flash;
    if ($actifs) {
        $noms = [];
        foreach ($possibles as $o) if (in_array($o['id'], $actifs, true)) $noms[] = '<li>' . aled08e_icon('check') . '<span>' . esc_html($o['name']) . '</span></li>';
        $h .= '<div class="ex-actifs"><p class="app-sub">Vos extras au mois</p><ul>' . implode('', $noms) . '</ul></div>';
    }

    // les familles, avec un filtre
    $filtre = '<div class="ex-filtre" role="group" aria-label="Choisir une famille"><button type="button" class="is-on" data-ex-filtre="tous">Tout voir</button>';
    $corps = '';
    foreach ($groupes as $g) {
        $gid = $g['id'];
        if (empty($unique[$gid]) && empty($mois[$gid])) continue;
        $filtre .= '<button type="button" data-ex-filtre="' . esc_attr($gid) . '">' . aled08e_icon($g['icon'] ?? 'plus') . '<span>' . esc_html($g['nom']) . '</span></button>';
        $cartes = '';
        foreach ($mois[$gid] ?? [] as $o) $cartes .= aled08e_ex_carte_mois($o, $uid, $actifs, $mult, $per);
        foreach ($unique[$gid] ?? [] as $x) $cartes .= aled08e_ex_carte_unique($x, $uid, $famille, $sans);
        $corps .= '<section class="ex-groupe" data-ex-groupe="' . esc_attr($gid) . '"><h3 class="ex-titre c-' . aled08e_ex_couleur($gid) . '"><span>' . aled08e_icon($g['icon'] ?? 'plus') . '</span>' . esc_html($g['nom']) . '</h3><div class="ex-grille">' . $cartes . '</div></section>';
    }
    $filtre .= '</div>';
    if ($corps === '') return $h . '<p class="esp-empty">Les extras arrivent bientôt.</p>';
    // peu d'extras (offre finale : trois, plus l'option e-commerce « À la une ») : une seule grille, sans filtre ni titres de
    // famille ; les extras « À la une » d'abord, dans leur ordre
    $liste = [];
    foreach ($groupes as $g) { foreach ($mois[$g['id']] ?? [] as $o) $liste[] = [$o['id'], aled08e_ex_carte_mois($o, $uid, $actifs, $mult, $per)]; foreach ($unique[$g['id']] ?? [] as $x) $liste[] = [$x['id'], aled08e_ex_carte_unique($x, $uid, $famille, $sans)]; }
    $ecommerce = aled08e_ex_une_rang('ecommerce') >= 0 ? aled08e_ex_carte_ecommerce($uid) : '';
    if ($ecommerce !== '') $liste[] = ['ecommerce', $ecommerce];
    $rang = function ($id) { $r = aled08e_ex_une_rang($id); return $r < 0 ? 99 : $r; };
    $ordre = array_keys($liste);
    usort($ordre, function ($a, $b) use ($liste, $rang) { return [$rang($liste[$a][0]), $a] <=> [$rang($liste[$b][0]), $b]; });
    $toutes = '';
    foreach ($ordre as $i) $toutes .= $liste[$i][1];
    $h .= count($liste) <= 4 ? '<div class="ex-grille ex-grille-peu">' . $toutes . '</div>'
        : ($ecommerce !== '' ? '<div class="ex-grille ex-grille-peu">' . $ecommerce . '</div>' : '') . $filtre . $corps;
    $h .= '<p class="ex-aide">' . aled08e_icon('message-circle') . '<span>Une question avant de choisir ? Écrivez-la à Bricou, dans l’onglet Modifications.</span> <button type="button" class="link-btn" data-go="demandes">Poser ma question</button></p>';
    return $h;
}

/* Trois extras mis en avant sur l'accueil */
function aled08e_extras_accueil_html($uid, $famille) {
    $D = aled08e_data();
    if (aled08e_sans_formule($uid) && false) return '';
    $vedettes = [];
    foreach (aled08e_a_la_demande() as $x) {
        if ($x['id'] === 'urgent' || !aled08e_ex_pour_moi($x, $uid)) continue;
        $vedettes[] = [$x['name'], $x['court'] ?? '', $x['icon'] ?? 'plus', aled08e_ex_couleur($x['groupe'] ?? ''), !empty($x['devis']) ? 'Sur devis' : aled08e_ex_prix_txt($x, $famille)[0] . (!empty($x['packs']) ? ' la ' . ($x['unite'] ?? 'page') : '')];
    }
    if (!$vedettes) return '';
    $h = '<p class="app-sub">Pour aller plus loin</p><div class="ex-vedettes">';
    foreach (array_slice($vedettes, 0, 3) as $v) $h .= '<button type="button" class="ex-vedette c-' . esc_attr($v[3]) . '" data-go="extras"><span class="ex-ico">' . aled08e_icon($v[2]) . '</span><strong>' . esc_html($v[0]) . '</strong><small>' . esc_html($v[1]) . '</small><b>' . esc_html($v[4]) . '</b></button>';
    return $h . '</div><p class="ex-voir"><button type="button" class="link-btn" data-go="extras">Voir tous les extras ' . aled08e_icon('arrow-right') . '</button></p>';
}
