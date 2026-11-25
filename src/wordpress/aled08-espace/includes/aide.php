<?php
/**
 * Les Minis Monstres Espace client : l'aide en lien avec Mes Tutos (24 novembre 2026, fin de soirée).
 * Mes Tutos, ce sont de petits tutos GRATUITS et publics (/mini-tuto/<slug>/), « une sorte de FAQ en mini tuto ».
 * data.json (scripts/wp-espace-data.js) en donne la liste {slug, nom, espace} : « espace » est l'onglet de l'espace client
 * concerné (accueil, site, commande, demandes, extras, vacances, compte). À côté des endroits clés, un petit lien d'aide « ? »
 * mène au tuto de cet onglet. Aucun tuto pour un onglet : rien ne s'affiche. Rien n'est vendu ici.
 */
defined('ABSPATH') || exit;

/* Tous les tutos connus : [['slug', 'nom', 'espace']] */
function aled08e_aide_tutos() {
    $l = [];
    foreach ((array) (aled08e_data()['tutos'] ?? []) as $t) {
        $slug = is_array($t) ? sanitize_title((string) ($t['slug'] ?? '')) : '';
        if ($slug === '') continue;
        $l[] = ['slug' => $slug, 'nom' => (string) ($t['nom'] ?? $slug), 'espace' => (string) ($t['espace'] ?? '')];
    }
    return $l;
}
/* Un tuto par son adresse, ou null */
function aled08e_aide_tuto($slug) {
    foreach (aled08e_aide_tutos() as $t) if ($t['slug'] === $slug) return $t;
    return null;
}
function aled08e_aide_url($slug = '') { return home_url('/mini-tuto/' . ($slug !== '' ? rawurlencode($slug) . '/' : '')); }

/* Le petit lien d'aide d'un onglet : « ? Les tutos : Suivre ma commande · Remplir le questionnaire » (3 au plus, puis « tous
 * les tutos ») ; $sauf : les tutos déjà proposés ailleurs dans l'onglet */
function aled08e_aide_html($espace, $max = 3, $sauf = []) {
    $liens = [];
    $plus = false;
    foreach (aled08e_aide_tutos() as $t) {
        if ($t['espace'] !== $espace || in_array($t['slug'], (array) $sauf, true)) continue;
        if (count($liens) >= $max) { $plus = true; break; }
        $liens[] = '<a href="' . esc_url(aled08e_aide_url($t['slug'])) . '" target="_blank" rel="noopener">' . esc_html($t['nom']) . '</a>';
    }
    if (!$liens) return '';
    $lab = count($liens) > 1 ? 'Les tutos :' : 'Le tuto :';
    if ($plus) $liens[] = '<a href="' . esc_url(aled08e_aide_url()) . '" target="_blank" rel="noopener">tous les tutos</a>';
    return '<p class="mm-aide"><span class="mm-aide-ico" aria-hidden="true">?</span><span class="mm-aide-txt"><span class="mm-aide-lab">' . $lab . '</span> ' . implode('<span class="mm-aide-sep" aria-hidden="true"> · </span>', $liens) . '</span></p>';
}

/* Un lien « Le tuto » vers un tuto précis (s'il existe) */
function aled08e_aide_lien_html($slug, $label = 'Le tuto') {
    if ($slug === '' || !aled08e_aide_tuto($slug)) return '';
    return '<a class="mm-aide-lien" href="' . esc_url(aled08e_aide_url($slug)) . '" target="_blank" rel="noopener"><span class="mm-aide-ico" aria-hidden="true">?</span><span>' . esc_html($label) . '</span></a>';
}

/* Les extras « À la une » (config.tutosOffre.aLaUne) : l'adresse du tuto => l'extra de l'onglet Extras qu'il présente */
function aled08e_aide_a_la_une() {
    $l = [];
    foreach ((array) (aled08e_data()['tutosALaUne'] ?? []) as $slug) {
        $slug = sanitize_title((string) $slug);
        if ($slug === '') continue;
        $extra = strpos($slug, 'visibilite') !== false || strpos($slug, 'google') !== false ? 'packseo'
            : (strpos($slug, 'commerce') !== false || strpos($slug, 'boutique') !== false ? 'ecommerce'
            : (strpos($slug, 'anglais') !== false || strpos($slug, 'traduction') !== false ? 'anglais' : ''));
        if ($extra !== '') $l[$slug] = $extra;
    }
    return $l;
}
/* Le tuto « À la une » d'un extra (packseo, ecommerce, anglais), ou '' */
function aled08e_aide_tuto_extra($extra) {
    $slug = array_search($extra, aled08e_aide_a_la_une(), true);
    return $slug === false ? '' : (string) $slug;
}

/* La carte « Mes Tutos » de l'accueil (atelier « ecole ») : une porte discrète vers les tutos gratuits */
function aled08e_aide_carte_accueil_html($a) {
    return '<article class="mm-carte c-' . esc_attr($a['color'] ?? 'lilac') . '"><div class="mm-carte-tete"><span class="mm-carte-art" aria-hidden="true">' . aled08e_monster($a['monstre'] ?? 'mochi') . '</span><div><strong>' . esc_html($a['label'] ?? 'Mes Tutos') . '</strong><small>Toutes les réponses à vos questions, pas à pas</small></div></div>'
        . '<a class="btn btn-light btn-sm" href="' . esc_url(home_url($a['path'] ?? '/mini-tuto/')) . '" target="_blank" rel="noopener">' . aled08e_icon('book-open') . '<span>Voir les tutos</span></a></article>';
}
