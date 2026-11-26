<?php
/**
 * Les Minis Monstres : les sites livrés s'ajoutent tout seuls à la page « Nos réalisations » (Alex, 26 novembre 2026).
 *
 * La page est construite par le site (node build.js) avec les clients de config.js ; l'export l'entoure de
 * [aled08_sites]…[/aled08_sites] et laisse la marque <!--minis-sites-livres--> au bout de la grille de cartes. Ici, on
 * remplace cette marque par une carte pour chaque site en ligne livré par l'automate :
 *  - commande « en_ligne », avec un nom de domaine, qui n'est pas un essai (référence TEST- ou ESSAI-) ;
 *  - pas déjà sur la page (Flore et Chenilles, Dodedo…), pas dans la liste des exclus (aled08.fr, lesnotesdutemps.fr) ;
 *  - le client peut refuser d'y apparaître (CGV) : méta _aled08_realisation = « non ».
 * Rien d'inventé : le nom du site, le type, la ville et la phrase d'accroche viennent du questionnaire du client.
 */
if (!defined('ABSPATH')) exit;

function aled08e_realisations_exclus() {
    $x = get_option('aled08_realisations_exclus', ['aled08.fr', 'lesnotesdutemps.fr']);
    return array_map('strtolower', is_array($x) ? $x : []);
}

/* Les sites livrés, du plus récent au plus ancien (gardés une heure : la page reste rapide) */
function aled08e_realisations_livres() {
    $l = get_transient('aled08_realisations');
    if (is_array($l)) return $l;
    $l = [];
    foreach (aled08e_cmd_par_statut(['en_ligne']) as $c) {
        $dom = strtolower(trim((string) $c['domaine']));
        if ($dom === '' || preg_match('/^(TEST|ESSAI)-/i', (string) $c['ref'])) continue;
        if (in_array(preg_replace('/^www\./', '', $dom), aled08e_realisations_exclus(), true)) continue;
        if (get_post_meta($c['id'], '_aled08_realisation', true) === 'non') continue;
        $b = function_exists('aled08e_brief_get') ? aled08e_brief_get($c['id']) : [];
        $v = function ($k) use ($b) { $x = $b[$k] ?? ''; return is_string($x) ? trim(wp_strip_all_tags($x)) : ''; };
        $nom = $v('nom_site') !== '' ? $v('nom_site') : ($c['entreprise'] !== '' ? $c['entreprise'] : $dom);
        $ville = $v('base') !== '' ? $v('base') : $c['ville'];
        $slogan = $v('slogan');
        $le = (int) get_post_meta($c['id'], '_aled08_en_ligne_le', true);
        $depuis = $le ? 'en ligne depuis ' . wp_date('F Y', $le) : '';
        $lieu = $ville !== '' ? 'À ' . $ville : '';
        $desc = $slogan !== '' ? $slogan : ($lieu !== '' || $depuis !== '' ? ucfirst(trim($lieu . ($lieu !== '' && $depuis !== '' ? ', ' : '') . $depuis)) . '.' : '');
        $l[] = ['nom' => $nom, 'domaine' => preg_replace('/^www\./', '', $dom), 'boutique' => $c['type'] === 'boutique', 'desc' => mb_substr($desc, 0, 160)];
    }
    set_transient('aled08_realisations', $l, HOUR_IN_SECONDS);
    return $l;
}
// une livraison efface la mémoire : le nouveau site apparaît tout de suite
// (et la date de mise en ligne est notée, pour le bilan du soir)
$aled08e_mis_en_ligne = function ($mid, $pid, $k, $val) {
    if ($k !== '_aled08_statut' || $val !== 'en_ligne') return;
    delete_transient('aled08_realisations');
    if (!get_post_meta($pid, '_aled08_en_ligne_le', true)) update_post_meta($pid, '_aled08_en_ligne_le', time());
};
add_action('updated_post_meta', $aled08e_mis_en_ligne, 10, 4);
add_action('added_post_meta', $aled08e_mis_en_ligne, 10, 4);

function aled08e_realisations_cartes($deja = '') {
    $couleurs = ['peach', 'butter', 'pink', 'mint', 'lilac'];
    $h = '';
    foreach (aled08e_realisations_livres() as $i => $s) {
        if ($deja !== '' && stripos($deja, $s['domaine']) !== false) continue;
        $h .= '<div class="client-card c-' . $couleurs[$i % count($couleurs)] . ' reveal"><span class="type-ico">' . aled08e_icon($s['boutique'] ? 'shopping-bag' : 'store') . '</span>'
            . '<span class="client-genre">' . ($s['boutique'] ? 'Boutique en ligne' : 'Site vitrine') . '</span><strong>' . esc_html($s['nom']) . '</strong>'
            . ($s['desc'] !== '' ? '<span class="client-desc">' . esc_html($s['desc']) . '</span>' : '')
            . '<a class="client-url" href="' . esc_url('https://' . $s['domaine'] . '/') . '" target="_blank" rel="noopener">' . aled08e_icon('globe') . esc_html($s['domaine']) . aled08e_icon('arrow-right') . '</a></div>';
    }
    return $h;
}

add_shortcode('aled08_sites', function ($a, $contenu = '') {
    $contenu = (string) $contenu;
    return str_replace('<!--minis-sites-livres-->', aled08e_realisations_cartes($contenu), $contenu);
});
