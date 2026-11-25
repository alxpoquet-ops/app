<?php
/**
 * Les Minis Monstres Espace client : les sous-menus des onglets (25 novembre 2026, demande d'Alex : « des sous-menus pour les
 * autres menus, comme pour la boutique »). Chaque onglet (Mon site, Statistiques, Modifications, Mon compte) montre en haut une
 * grille de rubriques ; on touche une rubrique, seule elle s'affiche. Le même dessin que le sous-menu de Ma boutique (.bg-nav).
 * Le script est dans src/assets/js/main.js (« Les sous-menus des onglets ») ; la démo utilise les mêmes classes.
 */
defined('ABSPATH') || exit;

/* La grille des rubriques : $items = [id => [icône, libellé]] ; les rubriques vides ne sont pas proposées */
function aled08e_sm_nav($items, $label = 'Rubriques') {
    if (count($items) < 2) return '';
    $h = '<nav class="ex-filtre bg-nav sm-nav" data-sm-nav aria-label="' . esc_attr($label) . '">';
    $i = 0;
    foreach ($items as $id => [$ic, $lib]) {
        $h .= '<button type="button" class="bg-lien' . ($i === 0 ? ' is-on' : '') . '" data-sm-go="' . esc_attr($id) . '" aria-pressed="' . ($i === 0 ? 'true' : 'false') . '">' . aled08e_icon($ic) . '<span>' . esc_html($lib) . '</span></button>';
        $i++;
    }
    return $h . '</nav>';
}
/* Une rubrique : son contenu, caché tant qu'on n'a pas choisi la rubrique (sauf la première) */
function aled08e_sm_part($id, $html, $premiere = false, $attrs = '') {
    if (trim((string) $html) === '') return '';
    return '<div class="sm-part" data-sm-part="' . esc_attr($id) . '"' . ($premiere ? '' : ' hidden') . ($attrs !== '' ? ' ' . $attrs : '') . '>' . $html . '</div>';
}
/* Un onglet entier : la grille puis les rubriques non vides, dans l'ordre donné. $parts = [id => [icône, libellé, html]] */
function aled08e_sm_html($parts, $label = 'Rubriques') {
    $parts = array_filter($parts, function ($p) { return trim((string) $p[2]) !== ''; });
    $nav = [];
    foreach ($parts as $id => $p) $nav[$id] = [$p[0], $p[1]];
    $h = aled08e_sm_nav($nav, $label);
    $i = 0;
    foreach ($parts as $id => $p) { $h .= aled08e_sm_part($id, $p[2], $i === 0, $p[3] ?? ''); $i++; }
    return $h;
}
