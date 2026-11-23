<?php
/**
 * Les Minis Monstres Espace client : les règles de création d'un site, servies à l'atelier automatique.
 *
 * Les règles s'écrivent à un seul endroit : .claude/skills/nouveau-site/regles/*.md (le skill « nouveau-site »).
 * À l'export (scripts/wp-export.py), elles sont rangées dans le fichier regles-donnees.php de cette extension.
 * L'atelier (la tâche planifiée) les lit ici avant de créer un site ou une page, pour suivre les mêmes règles
 * qu'une session de travail avec Alex.
 *
 * Route (administrateur) :
 *   GET /aled08/v1/atelier/regles                 la liste des fichiers, et pour quel travail les lire
 *   GET /aled08/v1/atelier/regles?fichier=visuel  le texte d'un fichier
 *   GET /aled08/v1/atelier/regles?pour=site       tous les fichiers à lire pour un travail (site, pages-google)
 */
defined('ABSPATH') || exit;

/* Les fichiers servis, dans l'ordre de lecture : nom => [titre, travaux concernés] */
function aled08e_regles_liste() {
    return [
        'regles-d-or' => ['Les règles d’or : à lire en premier, à chaque fois', ['site', 'pages-google', 'modification']],
        'escalade' => ['Les cas pour Alex : ce qui remonte, et comment', ['site', 'pages-google', 'modification']],
        'organisation' => ['Qui fait quoi : les trois agents, la mémoire', ['organisation']],
        'agent-constructeur' => ['Fiche de poste du constructeur', ['poste']],
        'agent-controleur' => ['Fiche de poste du contrôleur', ['poste']],
        'agent-jarvis' => ['Fiche de poste de Jarvis', ['poste']],
        'travail-en-parallele' => ['Beaucoup de travail : l’ordre, et les sous-agents en parallèle', ['poste']],
        'offre' => ['L’offre, les prix, les mots à employer', ['site']],
        'concurrents' => ['La référence du métier du client, à chercher avant chaque site', ['site']],
        'visuel' => ['Le visuel : parties de la page, téléphone, clair et sombre', ['site']],
        'conversion' => ['Un site qui fait venir des demandes', ['site']],
        'google' => ['Être trouvé sur Google, pages de visibilité', ['site', 'pages-google']],
        'vitesse-accessibilite' => ['Un site rapide et utilisable par tous', ['site', 'pages-google']],
        'legal' => ['Les pages légales et la vie privée', ['site']],
        'controle-qualite' => ['Le contrôle avant de livrer', ['site', 'pages-google', 'modification']],
        'livraison' => ['Poser une question, livrer, annoncer', ['site', 'pages-google']],
    ];
}
/* Les textes : un fichier PHP fabriqué à l'export (regles-donnees.php), pour qu'ils ne soient pas lisibles par une simple adresse */
function aled08e_regles_donnees() {
    static $d = null;
    if ($d === null) {
        $f = dirname(__DIR__) . '/regles-donnees.php';
        $d = is_readable($f) ? include $f : [];
        if (!is_array($d)) $d = [];
    }
    return $d;
}
function aled08e_regles_texte($nom) {
    if (!isset(aled08e_regles_liste()[$nom])) return '';
    return (string) (aled08e_regles_donnees()[$nom] ?? '');
}

add_action('rest_api_init', function () {
    register_rest_route('aled08/v1', '/atelier/regles', ['methods' => 'GET', 'permission_callback' => function () { return current_user_can('manage_options'); }, 'callback' => function (WP_REST_Request $r) {
        $liste = aled08e_regles_liste();
        $nom = sanitize_key((string) $r->get_param('fichier'));
        $pour = sanitize_key((string) $r->get_param('pour'));
        if ($nom !== '') {
            $t = aled08e_regles_texte($nom);
            if ($t === '') return new WP_Error('aled08_regles', 'Fichier de règles introuvable : ' . $nom . '.', ['status' => 404]);
            return new WP_REST_Response(['fichier' => $nom, 'titre' => $liste[$nom][0], 'texte' => $t], 200);
        }
        if ($pour !== '') {
            $out = [];
            foreach ($liste as $n => $x) {
                if (!in_array($pour, $x[1], true)) continue;
                $t = aled08e_regles_texte($n);
                if ($t !== '') $out[] = ['fichier' => $n, 'titre' => $x[0], 'texte' => $t];
            }
            if (!$out) return new WP_Error('aled08_regles', 'Aucune règle pour ce travail (site, pages-google).', ['status' => 404]);
            return new WP_REST_Response(['pour' => $pour, 'regles' => $out], 200);
        }
        $index = [];
        foreach ($liste as $n => $x) $index[] = ['fichier' => $n, 'titre' => $x[0], 'pour' => $x[1], 'present' => aled08e_regles_texte($n) !== ''];
        return new WP_REST_Response(['fichiers' => $index, 'aide' => 'Ajoutez ?pour=site ou ?pour=pages-google pour lire d’un coup toutes les règles d’un travail, ou ?fichier=NOM pour un seul fichier.'], 200);
    }]);
});
