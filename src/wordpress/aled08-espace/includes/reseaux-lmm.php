<?php
/**
 * Les Minis Monstres Espace client : les réseaux des Minis Monstres eux-mêmes (Alex, 26 novembre 2026 :
 * « on fera du gratuit et TikTok on demandera l'accès »).
 *
 * Une publication par jour, à 12 h 13 (heure de Paris), week-end compris, en alternance :
 *  - « Les nouvelles » : un site livré (s'il y en a un pas encore annoncé), une nouveauté des Minis Monstres, ou un conseil utile ;
 *  - « La bande » : les petits monstres, ce qu'ils font, les coulisses.
 * Le texte est écrit avec la clé Claude (la même que Cerise), à partir des seuls faits du site (aled08e_bsite_faits) ;
 * le visuel est fabriqué par le site : un fond par monstre (reseaux/fonds, scripts/reseaux-fonds.js) et le titre du jour
 * écrit avec la police du site (reseaux/nunito-*.ttf).
 *
 *  - Instagram et la page Facebook : gratuit, par l'application Meta des Minis Monstres (identifiant et clé secrète dans les
 *    Réglages, section « Publier sur les réseaux »). L'application reste en mode développement : Alex en est l'administrateur,
 *    elle publie sur ses propres comptes sans validation de Meta. Les comptes se relient une fois (menu Les Minis Monstres › Réseaux).
 *  - TikTok : gratuit aussi, mais ses règles demandent que la personne choisisse elle-même la visibilité et clique sur « Publier ».
 *    La publication du jour attend donc Alex sur la page Réseaux (lien dans le bilan du soir) : un choix, un clic.
 *    Tant que TikTok n'a pas validé l'application (« audit »), ce qui part n'est visible que par le compte lui-même.
 *
 * Rien n'est inventé : pas de faux client, pas de faux chiffre, pas de « IA », jamais « réduction », « au lieu de » ni « sans frais ».
 */
defined('ABSPATH') || exit;

/* =========================================================================
 *  État
 * ========================================================================= */
function aled08e_lmm_get() { $c = get_option('aled08_lmm_rs', []); return is_array($c) ? $c : []; }
function aled08e_lmm_set($c) { aled08e_option_set('aled08_lmm_rs', $c); }
function aled08e_lmm_pause() { return get_option('aled08_lmm_rs_pause') === '1'; }
function aled08e_lmm_page() { $c = aled08e_lmm_get(); $p = (array) ($c['pages'] ?? []); return $p ? ($p[(int) ($c['page'] ?? 0)] ?? $p[0]) : null; }
function aled08e_lmm_journal() { $j = get_option('aled08_lmm_rs_journal', []); return is_array($j) ? $j : []; }
function aled08e_lmm_journal_set($j) { update_option('aled08_lmm_rs_journal', array_slice($j, 0, 60), false); }
function aled08e_lmm_du_jour($jour = '') {
    $jour = $jour !== '' ? $jour : wp_date('Y-m-d');
    foreach (aled08e_lmm_journal() as $i => $x) if (($x['jour'] ?? '') === $jour) return [$i, $x];
    return [null, null];
}
function aled08e_lmm_maj($jour, $champs) {
    $j = aled08e_lmm_journal();
    foreach ($j as $i => $x) if (($x['jour'] ?? '') === $jour) { $j[$i] = array_merge($x, $champs); aled08e_lmm_journal_set($j); return $j[$i]; }
    return null;
}
function aled08e_lmm_admin_url($args = []) { return add_query_arg($args, admin_url('admin.php?page=aled08-reseaux')); }

/* =========================================================================
 *  Le sujet du jour
 * ========================================================================= */
const ALED08E_LMM_MONSTRES = ['mochi', 'fantome', 'nuage', 'chaton', 'gelee', 'champi', 'dino', 'etoile'];
// couleurs des monstres (src/lib/bestiaire.js) : [corps, ventre, trait]
function aled08e_lmm_couleurs($m) {
    $c = ['mochi' => ['FFC4AC', 'FFE3D6', 'C2603F'], 'fantome' => ['DCD2FF', 'F1ECFF', '6E54D6'], 'nuage' => ['C4E4FF', 'E9F5FF', '3D84C9'], 'chaton' => ['FFE59A', 'FFF4CF', 'B98A10'],
        'gelee' => ['A9EFD4', 'DDFBEF', '2E9A71'], 'champi' => ['FF9EC4', 'FFF4EA', 'C24A80'], 'dino' => ['BDEFAA', 'E6FADD', '4E9A3A'], 'etoile' => ['FFE07A', 'FFF3C4', 'C99A00']];
    return $c[$m] ?? $c['mochi'];
}
/* Un jour sur deux : les nouvelles, puis la bande */
function aled08e_lmm_type($jour = '') {
    $t = $jour !== '' ? strtotime($jour . ' 12:00:00') : time();
    return ((int) floor($t / DAY_IN_SECONDS)) % 2 === 0 ? 'nouvelles' : 'bande';
}
/* Un site livré pas encore annoncé (le plus ancien d'abord) */
function aled08e_lmm_site_a_annoncer() {
    if (!function_exists('aled08e_realisations_livres')) return null;
    $deja = (array) get_option('aled08_lmm_rs_annonces', []);
    foreach (array_reverse(aled08e_realisations_livres()) as $s) if (!in_array($s['domaine'], $deja, true)) return $s;
    return null;
}
function aled08e_lmm_faits() {
    $f = function_exists('aled08e_bsite_faits') ? aled08e_bsite_faits() : '';
    $D = aled08e_data();
    $sites = [];
    foreach ((array) ($D['clients'] ?? []) as $c) if (!empty($c['name']) && !empty($c['url'])) $sites[] = $c['name'] . ' (' . preg_replace('#^https?://(www\.)?#', '', rtrim((string) $c['url'], '/')) . ')';
    if (function_exists('aled08e_realisations_livres')) foreach (aled08e_realisations_livres() as $s) $sites[] = $s['nom'] . ' (' . $s['domaine'] . ')' . ($s['desc'] !== '' ? ' : ' . $s['desc'] : '');
    if ($sites) $f .= "\nSites déjà faits par les Minis Monstres (page « Nos réalisations ») : " . implode(' ; ', $sites) . '.';
    if (function_exists('aled08e_concours_ouvert') && aled08e_concours_ouvert() && function_exists('aled08e_concours_prochain_tirage')) $f .= "\nLe jeu-concours des Rubans : des Rubans sont cachés sur le site ; tout compte connecté peut jouer ; tirage au sort le " . wp_date('j F', aled08e_concours_prochain_tirage()) . ' (règlement sur la page /jeu-concours/).';
    $f .= "\nLes Minis Monstres sont nés le 25 novembre. Ils sont installés dans les Ardennes et travaillent pour toute la France.";
    return $f;
}
function aled08e_lmm_schema() {
    return ['type' => 'object', 'additionalProperties' => false, 'required' => ['sujet', 'etiquette', 'titre', 'sous_titre', 'legende', 'monstre'], 'properties' => [
        'sujet' => ['type' => 'string'],
        'etiquette' => ['type' => 'string', 'enum' => ['Les nouvelles', 'Nouveau site en ligne', 'Le conseil du jour', 'La bande', 'En coulisses']],
        'titre' => ['type' => 'string'],
        'sous_titre' => ['type' => 'string'],
        'legende' => ['type' => 'string'],
        'monstre' => ['type' => 'string', 'enum' => ALED08E_LMM_MONSTRES],
    ]];
}
function aled08e_lmm_systeme() {
    return "Tu écris la publication du jour des Minis Monstres sur Instagram, Facebook et TikTok. Les Minis Monstres, c'est un petit studio français qui crée les sites internet des commerçants, artisans, indépendants et associations, avec une bande de petits monstres mignons pour mascottes. Le public : des artisans et commerçants qui n'ont pas de site, ou un site qui ne leur rapporte rien. Ils ne sont pas du métier.\n\n"
        . "Rends :\n"
        . "- sujet : quelques mots qui résument le sujet (sert à ne pas se répéter).\n"
        . "- etiquette : le petit bandeau du visuel.\n"
        . "- titre : la phrase écrite en gros sur le visuel. 40 à 60 caractères, percutante, simple, sans point final. Pas d'emoji.\n"
        . "- sous_titre : une phrase sous le titre, 60 à 100 caractères, qui donne envie de lire la suite. Pas d'emoji.\n"
        . "- legende : le texte de la publication, 400 à 900 caractères, en paragraphes courts. Une première ligne qui accroche, puis l'explication concrète, puis une invitation douce (par exemple : « Le lien est dans la bio » ou « les-minis-monstres.fr »). Deux ou trois emojis au plus. Termine par 4 à 6 hashtags en français, utiles (#artisan #commercelocal #siteinternet…).\n"
        . "- monstre : le petit monstre dessiné sur le visuel, choisis celui qui va avec l'humeur. Ne décris jamais le dessin dans le texte.\n\n"
        . "Règles, sans exception :\n"
        . "- N'utilise que les faits fournis. N'invente aucun client, aucun avis, aucun chiffre, aucune promesse de résultat sur Google, aucun délai autre que « en moins d'une semaine ».\n"
        . "- Un prix ne se dit que tel qu'il est dans les faits. C'est un prix de lancement : ne dis jamais réduction, promotion, remise, « au lieu de », prix barré, ni « sans frais ». Pour le paiement en plusieurs fois, dis « possibilité de payer en 3 ou 4 fois ».\n"
        . "- Ne parle jamais d'IA, d'intelligence artificielle, de robot, d'outil automatique ni de modèle de site. Les petits monstres sont la bande des Minis Monstres, c'est tout.\n"
        . "- Écris au « nous » (la bande), jamais « je ». Ne cite pas de prénom. Vouvoie le lecteur.\n"
        . "- Pas de tiret long, pas de point-virgule. Phrases courtes, ton chaleureux, un brin d'humour, jamais moqueur envers ceux qui n'ont pas de site.\n"
        . "- Ne répète pas un sujet déjà traité (liste fournie).";
}
function aled08e_lmm_consigne($type, $site) {
    if ($type === 'nouvelles' && $site) return "Aujourd'hui : « Nouveau site en ligne ». Présente ce site livré par les Minis Monstres : " . $site['nom'] . ' (' . $site['domaine'] . ')' . ($site['desc'] !== '' ? ', ' . $site['desc'] : '') . ". N'invente rien sur cette entreprise au-delà de ces mots. Étiquette : « Nouveau site en ligne ».";
    if ($type === 'nouvelles') return "Aujourd'hui : « Les nouvelles » ou « Le conseil du jour ». Choisis un sujet qui n'a pas été traité : une nouveauté ou un avantage des Minis Monstres tiré des faits (prix de lancement, site prêt en moins d'une semaine, le site vous appartient et se télécharge, le parrainage, l'application et Publier partout, le forfait Mini, les pages de visibilité Google, les sites déjà faits), ou un conseil simple et vrai pour être mieux trouvé sur internet quand on est artisan ou commerçant (fiche Google, photos, horaires à jour, avis clients, site lisible sur téléphone, numéro cliquable…). Un conseil reste général et juste, sans chiffre inventé.";
    return "Aujourd'hui : « La bande » ou « En coulisses ». Présente un membre de la bande et ce qu'il fait pour les clients (d'après les faits : Cerise la secrétaire, Bricou le constructeur, Plume la rédactrice, Mirette la spécialiste visibilité, Mochi l'organisateur, et les autres monstres cités dans les faits), ou montre comment un site naît chez les Minis Monstres (le questionnaire, la création, la mise en ligne en moins d'une semaine, puis les modifications). Ton tendre et drôle.";
}

/* Écrire avec Claude. Rend le tableau du jour, ou une WP_Error. */
function aled08e_lmm_ecrire($type, $site = null) {
    if (aled08e_lia_cle() === '' || !aled08e_lia_sdk()) return new WP_Error('aled08_lmm', 'La clé Claude ou le kit Anthropic manque (Réglages, section Bricou).');
    $deja = [];
    foreach (array_slice(aled08e_lmm_journal(), 0, 40) as $x) if (!empty($x['sujet'])) $deja[] = '- ' . $x['sujet'] . ' (' . ($x['etiquette'] ?? '') . ')';
    $contenu = "<faits>\n" . aled08e_lmm_faits() . "\n</faits>\n\n<deja_traites>\n" . ($deja ? implode("\n", $deja) : '(rien encore : c’est la première publication)') . "\n</deja_traites>\n\n" . aled08e_lmm_consigne($type, $site) . "\nNous sommes le " . wp_date('l j F Y') . '.';
    $messages = [['role' => 'user', 'content' => $contenu]];
    for ($essai = 0; $essai < 2; $essai++) {
        try {
            $client = new \Anthropic\Client(apiKey: aled08e_lia_cle());
            $r = $client->messages->create(
                model: aled08e_lia_modele(),
                maxTokens: 3000,
                system: [['type' => 'text', 'text' => aled08e_lmm_systeme()]],
                messages: $messages,
                outputConfig: ['effort' => 'medium', 'format' => ['type' => 'json_schema', 'schema' => aled08e_lmm_schema()]],
            );
        } catch (\Throwable $e) {
            return new WP_Error('aled08_lmm', 'Claude ne répond pas : ' . mb_substr($e->getMessage(), 0, 200));
        }
        if (in_array($r->stopReason ?? '', ['refusal', 'max_tokens'], true)) return new WP_Error('aled08_lmm', 'Claude n’a pas pu écrire la publication (' . ($r->stopReason ?? '') . ').');
        $brut = '';
        foreach ($r->content as $b) if ($b->type === 'text') $brut .= $b->text;
        $d = json_decode($brut, true);
        if (!is_array($d) || empty($d['titre']) || empty($d['legende'])) return new WP_Error('aled08_lmm', 'La réponse de Claude est incomplète.');
        $propre = function ($t) { return trim(preg_replace('/\s*[—–;]\s*/u', ', ', wp_strip_all_tags((string) $t))); };
        $d = ['sujet' => mb_substr($propre($d['sujet']), 0, 120), 'etiquette' => (string) $d['etiquette'], 'titre' => mb_substr(rtrim($propre($d['titre']), '.'), 0, 80), 'sous_titre' => mb_substr($propre($d['sous_titre']), 0, 130),
            'legende' => mb_substr(trim(preg_replace("/[ \t]*[—–][ \t]*/u", ', ', str_replace(';', ',', wp_strip_all_tags((string) $d['legende'])))), 0, 2100), 'monstre' => in_array($d['monstre'], ALED08E_LMM_MONSTRES, true) ? $d['monstre'] : 'mochi'];
        $faute = aled08e_lmm_faute($d['titre'] . "\n" . $d['sous_titre'] . "\n" . $d['legende']);
        if ($faute === '') return $d;
        $messages[] = ['role' => 'assistant', 'content' => $brut];
        $messages[] = ['role' => 'user', 'content' => 'Ce texte ne respecte pas les règles : ' . $faute . '. Réécris toute la publication en corrigeant cela.'];
    }
    return new WP_Error('aled08_lmm', 'La publication écrite ne respectait pas les règles (' . $faute . ') : rien n’est parti.');
}
/* Ce qui ne doit jamais partir (mêmes règles que les mails) */
function aled08e_lmm_faute($t) {
    $regles = [
        '/\bI\.?A\b|\bAI\b/u' => 'il parle d’IA',
        '/intelligence artificielle|chatgpt|\bclaude\b|\brobots?\b|automatique|automatisé/iu' => 'il parle d’IA, de robot ou d’automatique',
        '/r[ée]duction|promo(tion)?s?\b|remise|au lieu de|prix barr|sans frais|-\s?\d+\s?%/iu' => 'il parle de réduction, de promotion ou de frais',
        '/(^|[\s«(])(je\b|j[’\'])/iu' => 'il dit « je »',
        '/\balex\b/iu' => 'il cite un prénom',
    ];
    foreach ($regles as $re => $pourquoi) if (preg_match($re, $t)) return $pourquoi;
    return '';
}

/* =========================================================================
 *  Le visuel : le fond du monstre, le bandeau et le titre écrits avec la police du site
 * ========================================================================= */
function aled08e_lmm_dossier() {
    $up = wp_upload_dir();
    $d = trailingslashit($up['basedir']) . 'aled08-reseaux';
    if (!wp_mkdir_p($d)) return null;
    if (!file_exists($d . '/index.html')) @file_put_contents($d . '/index.html', '');
    return ['chemin' => $d, 'url' => trailingslashit($up['baseurl']) . 'aled08-reseaux'];
}
function aled08e_lmm_couleur($im, $hex, $alpha = 0) { return imagecolorallocatealpha($im, hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2)), $alpha); }
function aled08e_lmm_rond($im, $x1, $y1, $x2, $y2, $r, $col) {
    imagefilledrectangle($im, $x1 + $r, $y1, $x2 - $r, $y2, $col);
    imagefilledrectangle($im, $x1, $y1 + $r, $x2, $y2 - $r, $col);
    foreach ([[$x1 + $r, $y1 + $r], [$x2 - $r, $y1 + $r], [$x1 + $r, $y2 - $r], [$x2 - $r, $y2 - $r]] as $c) imagefilledellipse($im, $c[0], $c[1], 2 * $r, 2 * $r, $col);
}
/* Couper un texte en lignes qui tiennent dans $largeur */
function aled08e_lmm_lignes($texte, $police, $taille, $largeur) {
    $lignes = [];
    $ligne = '';
    foreach (preg_split('/\s+/u', trim($texte)) as $mot) {
        $essai = $ligne === '' ? $mot : $ligne . ' ' . $mot;
        $b = imagettfbbox($taille, 0, $police, $essai);
        if ($ligne !== '' && $b[2] - $b[0] > $largeur) { $lignes[] = $ligne; $ligne = $mot; }
        else $ligne = $essai;
    }
    if ($ligne !== '') $lignes[] = $ligne;
    return $lignes;
}
function aled08e_lmm_visuel($d, $jour) {
    if (!function_exists('imagecreatefrompng') || !function_exists('imagettftext')) return new WP_Error('aled08_lmm', 'Le serveur ne sait pas fabriquer d’image (GD).');
    $base = dirname(__DIR__) . '/reseaux/';
    $fond = $base . 'fonds/' . $d['monstre'] . '.png';
    $gras = $base . 'nunito-900.ttf';
    $moyen = $base . 'nunito-700.ttf';
    if (!file_exists($fond) || !file_exists($gras)) return new WP_Error('aled08_lmm', 'Les fonds des publications manquent dans l’extension.');
    $dos = aled08e_lmm_dossier();
    if (!$dos) return new WP_Error('aled08_lmm', 'Impossible de préparer le dossier des visuels.');
    [$corps, $ventre, $trait] = aled08e_lmm_couleurs($d['monstre']);
    $im = imagecreatefrompng($fond);
    imagealphablending($im, true);
    $encre = aled08e_lmm_couleur($im, '2E2A47');
    $doux = aled08e_lmm_couleur($im, '2E2A47', 30);
    // le bandeau (étiquette)
    $et = mb_strtoupper($d['etiquette']);
    $b = imagettfbbox(26, 0, $gras, $et);
    $lw = $b[2] - $b[0];
    aled08e_lmm_rond($im, 128, 124, 128 + $lw + 56, 124 + 58, 29, aled08e_lmm_couleur($im, $ventre));
    imagettftext($im, 26, 0, 156, 164, aled08e_lmm_couleur($im, $trait), $gras, $et);
    // le titre et le sous-titre : la plus grande taille qui tient dans la carte (de 210 à 720 px de haut)
    $largeur = 824;
    $insec = function ($t) { return preg_replace(['/ ([?!:;»])/u', '/« /u'], ["\u{00A0}$1", "«\u{00A0}"], trim($t)); }; // pas de « ? » seul en début de ligne
    $titre = $insec($d['titre']);
    $sous = $insec($d['sous_titre']);
    foreach ([64, 58, 54, 50, 46, 42] as $taille) {
        $lt = aled08e_lmm_lignes($titre, $gras, $taille, $largeur);
        $ls = array_slice(aled08e_lmm_lignes($sous, $moyen, 27, $largeur), 0, 3);
        $haut = count($lt) * (int) round($taille * 1.62) + 28 + count($ls) * 48;
        if (count($lt) <= 4 && $haut <= 500) break;
    }
    $y = 210 + (int) round($taille * 1.34);
    foreach ($lt as $l) { imagettftext($im, $taille, 0, 128, $y, $encre, $gras, $l); $y += (int) round($taille * 1.62); }
    $y += 28 - (int) round($taille * 1.62) + 48;
    foreach ($ls as $l) { imagettftext($im, 27, 0, 128, $y, $doux, $moyen, $l); $y += 48; }
    $nom = $jour . '-' . wp_generate_password(8, false, false);
    $f45 = $dos['chemin'] . '/' . $nom . '.jpg';
    imagejpeg($im, $f45, 90);
    // TikTok : le même visuel, un peu plus petit, posé sur un fond 9:16 aux couleurs du monstre
    $tt = imagecreatetruecolor(1080, 1920);
    $c1 = [hexdec(substr($ventre, 0, 2)), hexdec(substr($ventre, 2, 2)), hexdec(substr($ventre, 4, 2))];
    $c2 = [hexdec(substr($corps, 0, 2)), hexdec(substr($corps, 2, 2)), hexdec(substr($corps, 4, 2))];
    for ($yy = 0; $yy < 1920; $yy++) { $k = $yy / 1919; imageline($tt, 0, $yy, 1079, $yy, imagecolorallocate($tt, (int) ($c1[0] + ($c2[0] - $c1[0]) * $k), (int) ($c1[1] + ($c2[1] - $c1[1]) * $k), (int) ($c1[2] + ($c2[2] - $c1[2]) * $k))); }
    imagealphablending($tt, true);
    foreach ([[130, 170, 300], [960, 90, 380], [990, 1830, 460], [70, 1790, 300]] as $b) imagefilledellipse($tt, $b[0], $b[1], $b[2], $b[2], imagecolorallocatealpha($tt, 255, 255, 255, 80));
    imagefilledrectangle($tt, 72, 318, 72 + 960, 318 + 1200, imagecolorallocatealpha($tt, 46, 42, 71, 112)); // ombre douce
    imagecopyresampled($tt, $im, 60, 300, 0, 0, 960, 1200, 1080, 1350);
    $f916 = $dos['chemin'] . '/' . $nom . '-tiktok.jpg';
    imagejpeg($tt, $f916, 90);
    imagedestroy($im);
    imagedestroy($tt);
    return ['chemin' => $f45, 'url' => $dos['url'] . '/' . $nom . '.jpg', 'tiktok_chemin' => $f916, 'tiktok_url' => $dos['url'] . '/' . $nom . '-tiktok.jpg'];
}

/* =========================================================================
 *  Préparer et publier
 * ========================================================================= */
/* Préparer la publication du jour (texte et visuel). $refaire : l'écrire à nouveau. */
function aled08e_lmm_preparer($refaire = false, $jour = '') {
    $jour = $jour !== '' ? $jour : wp_date('Y-m-d');
    [$i, $x] = aled08e_lmm_du_jour($jour);
    if ($x && !$refaire) return $x;
    if ($x && !empty($x['publie'])) return new WP_Error('aled08_lmm', 'La publication du jour est déjà partie : elle ne se réécrit plus.');
    @set_time_limit(180);
    $type = aled08e_lmm_type($jour);
    $site = $type === 'nouvelles' ? aled08e_lmm_site_a_annoncer() : null;
    $d = aled08e_lmm_ecrire($type, $site);
    if (is_wp_error($d)) return $d;
    $v = aled08e_lmm_visuel($d, $jour);
    if (is_wp_error($v)) return $v;
    $e = ['jour' => $jour, 'type' => $type, 'site' => $site['domaine'] ?? '', 'le' => time(), 'resultats' => []] + $d + ['image' => $v['url'], 'chemin' => $v['chemin'], 'tiktok_image' => $v['tiktok_url'], 'tiktok_chemin' => $v['tiktok_chemin']];
    $j = aled08e_lmm_journal();
    if ($i !== null) { foreach (['chemin', 'tiktok_chemin'] as $k) if (!empty($x[$k]) && file_exists($x[$k])) @unlink($x[$k]); unset($j[$i]); }
    array_unshift($j, $e);
    aled08e_lmm_journal_set(array_values($j));
    return $e;
}
/* Publier sur Instagram et Facebook (ce qui est relié et pas encore parti) */
function aled08e_lmm_publier($jour = '') {
    $jour = $jour !== '' ? $jour : wp_date('Y-m-d');
    $e = aled08e_lmm_preparer(false, $jour);
    if (is_wp_error($e)) return $e;
    $p = aled08e_lmm_page();
    if (!$p) return new WP_Error('aled08_lmm', 'La page Facebook des Minis Monstres n’est pas encore reliée (menu Les Minis Monstres › Réseaux).');
    $res = (array) ($e['resultats'] ?? []);
    $image = ['url' => $e['image'], 'chemin' => $e['chemin'], 'mime' => 'image/jpeg'];
    $cibles = ['facebook'];
    if (!empty($p['ig_id'])) $cibles[] = 'instagram';
    foreach ($cibles as $r) {
        if (!empty($res[$r]['ok'])) continue;
        $o = $r === 'facebook' ? aled08e_rs_facebook_publier($p, $e['legende'], $image) : aled08e_rs_instagram_publier($p, $e['legende'], $image);
        $res[$r] = is_wp_error($o) ? ['ok' => false, 'erreur' => $o->get_error_message(), 'le' => time()] : ['ok' => true, 'url' => (string) $o['url'], 'le' => time()];
    }
    $publie = !empty($res['facebook']['ok']) || !empty($res['instagram']['ok']);
    aled08e_lmm_maj($jour, ['resultats' => $res, 'publie' => $publie]);
    if ($publie && !empty($e['site'])) { $a = (array) get_option('aled08_lmm_rs_annonces', []); $a[] = $e['site']; update_option('aled08_lmm_rs_annonces', array_values(array_unique($a)), false); }
    return $res;
}
/* Chaque jour à 12 h 13, heure de Paris (une tâche à usage unique, reprogrammée : elle suit l'heure d'été) */
function aled08e_lmm_prochain() {
    $d = new DateTime('now', wp_timezone());
    $d->setTime(12, 13, 0);
    if ($d->getTimestamp() <= time() + 60) $d->modify('+1 day');
    return $d->getTimestamp();
}
add_action('aled08e_lmm_jour', function () {
    if (!wp_next_scheduled('aled08e_lmm_jour')) wp_schedule_single_event(aled08e_lmm_prochain(), 'aled08e_lmm_jour');
    if (aled08e_lmm_pause()) return;
    $e = aled08e_lmm_preparer();
    if (is_wp_error($e)) { update_option('aled08_lmm_rs_erreur', ['le' => time(), 'texte' => $e->get_error_message()], false); return; }
    delete_option('aled08_lmm_rs_erreur');
    if (aled08e_lmm_page()) aled08e_lmm_publier();
});
add_action('init', function () {
    if (!wp_next_scheduled('aled08e_lmm_jour')) wp_schedule_single_event(aled08e_lmm_prochain(), 'aled08e_lmm_jour');
}, 46);
/* Les visuels de plus de 45 jours s'effacent */
add_action('aled08_quotidien', function () {
    $dos = aled08e_lmm_dossier();
    if (!$dos) return;
    foreach ((array) glob($dos['chemin'] . '/*.jpg') as $f) if (filemtime($f) < time() - 45 * DAY_IN_SECONDS) @unlink($f);
}, 60);

/* =========================================================================
 *  Relier la page Facebook et l'Instagram des Minis Monstres (même application Meta que Publier partout,
 *  même adresse de retour : rien de plus à déclarer chez Meta)
 * ========================================================================= */
add_action('admin_post_aled08e_lmm_meta', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('aled08e_lmm_meta')) wp_die('Accès refusé.');
    if (!aled08e_rs_meta_ok()) { wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => 'meta_manque'])); exit; }
    $uid = get_current_user_id();
    $etat = wp_generate_password(24, false, false);
    set_transient('aled08_rs_etat_' . $uid, $etat, 15 * MINUTE_IN_SECONDS);
    set_transient('aled08_lmm_lier_' . $uid, 1, 15 * MINUTE_IN_SECONDS);
    wp_redirect('https://www.facebook.com/dialog/oauth?' . http_build_query(['client_id' => aled08e_rs_opt('meta_id'), 'redirect_uri' => aled08e_rs_retour('facebook'), 'state' => $etat, 'response_type' => 'code',
        'scope' => 'pages_show_list,pages_manage_posts,pages_read_engagement,business_management,instagram_basic,instagram_content_publish'])); // phpcs:ignore -- adresse fixe de Meta
    exit;
});
add_action('template_redirect', function () {
    if (($_GET['aled08e_rs'] ?? '') !== 'facebook' || !is_user_logged_in()) return;
    $uid = get_current_user_id();
    if (!get_transient('aled08_lmm_lier_' . $uid) || !current_user_can('manage_options')) return; // un client : Publier partout (reseaux.php)
    delete_transient('aled08_lmm_lier_' . $uid);
    $fin = function ($code) { wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => $code])); exit; };
    if (!empty($_GET['error']) || empty($_GET['code'])) $fin('annule');
    $etat = (string) get_transient('aled08_rs_etat_' . $uid);
    delete_transient('aled08_rs_etat_' . $uid);
    if ($etat === '' || !hash_equals($etat, sanitize_text_field(wp_unslash($_GET['state'] ?? '')))) $fin('expire');
    $g = 'https://graph.facebook.com/';
    $t = aled08e_rs_http('GET', $g . 'oauth/access_token?' . http_build_query(['client_id' => aled08e_rs_opt('meta_id'), 'client_secret' => aled08e_rs_opt('meta_secret'), 'redirect_uri' => aled08e_rs_retour('facebook'), 'code' => sanitize_text_field(wp_unslash($_GET['code']))]));
    if (is_wp_error($t) || empty($t['json']['access_token'])) $fin('refus');
    // jeton longue durée : les jetons de page qui en découlent n'expirent pas
    $l = aled08e_rs_http('GET', $g . 'oauth/access_token?' . http_build_query(['grant_type' => 'fb_exchange_token', 'client_id' => aled08e_rs_opt('meta_id'), 'client_secret' => aled08e_rs_opt('meta_secret'), 'fb_exchange_token' => (string) $t['json']['access_token']]));
    $jeton = !is_wp_error($l) && !empty($l['json']['access_token']) ? (string) $l['json']['access_token'] : (string) $t['json']['access_token'];
    $p = aled08e_rs_http('GET', $g . 'me/accounts?' . http_build_query(['fields' => 'id,name,access_token,instagram_business_account{id,username}', 'limit' => 50, 'access_token' => $jeton]));
    if (is_wp_error($p)) $fin('refus');
    $pages = [];
    foreach ((array) ($p['json']['data'] ?? []) as $x) {
        if (empty($x['id']) || empty($x['access_token'])) continue;
        $pages[] = ['id' => (string) $x['id'], 'nom' => (string) ($x['name'] ?? 'Page'), 'jeton' => (string) $x['access_token'], 'ig_id' => (string) ($x['instagram_business_account']['id'] ?? ''), 'ig_nom' => (string) ($x['instagram_business_account']['username'] ?? '')];
    }
    if (!$pages) $fin('sans_page');
    // la page des Minis Monstres d'abord, si elle est dans la liste
    $choix = 0;
    foreach ($pages as $i => $x) if (stripos(remove_accents($x['nom']), 'minis monstres') !== false) { $choix = $i; break; }
    $c = aled08e_lmm_get();
    $c['pages'] = $pages;
    $c['page'] = $choix;
    $c['meta_le'] = time();
    aled08e_lmm_set($c);
    $fin('relie');
}, 4);

/* =========================================================================
 *  TikTok : l'application des Minis Monstres (Login Kit + Content Posting API), la page de publication en un clic
 * ========================================================================= */
function aled08e_lmm_tt_opt($k) { return trim((string) get_option('aled08_lmm_tiktok_' . $k, '')); }
function aled08e_lmm_tt_ok() { return aled08e_lmm_tt_opt('cle') !== '' && aled08e_lmm_tt_opt('secret') !== ''; }
function aled08e_lmm_tt_retour() { return home_url('/tiktok-retour/'); }
/* Le jeton d'accès (24 h), renouvelé avec le jeton de rafraîchissement (un an) */
function aled08e_lmm_tt_jeton() {
    $c = aled08e_lmm_get();
    $t = (array) ($c['tiktok'] ?? []);
    if (empty($t['refresh'])) return new WP_Error('aled08_lmm', 'Le compte TikTok n’est pas relié.');
    if (!empty($t['jeton']) && (int) ($t['exp'] ?? 0) > time() + 120) return (string) $t['jeton'];
    $r = aled08e_rs_http('POST', 'https://open.tiktokapis.com/v2/oauth/token/', ['body' => ['client_key' => aled08e_lmm_tt_opt('cle'), 'client_secret' => aled08e_lmm_tt_opt('secret'), 'grant_type' => 'refresh_token', 'refresh_token' => (string) $t['refresh']]]);
    if (is_wp_error($r) || empty($r['json']['access_token'])) return new WP_Error('aled08_lmm', 'TikTok demande de relier le compte à nouveau.');
    aled08e_lmm_tt_garder($r['json']);
    return (string) $r['json']['access_token'];
}
function aled08e_lmm_tt_garder($j) {
    $c = aled08e_lmm_get();
    $t = (array) ($c['tiktok'] ?? []);
    $t['jeton'] = (string) $j['access_token'];
    $t['exp'] = time() + (int) ($j['expires_in'] ?? 86400);
    if (!empty($j['refresh_token'])) { $t['refresh'] = (string) $j['refresh_token']; $t['refresh_exp'] = time() + (int) ($j['refresh_expires_in'] ?? 31536000); }
    if (!empty($j['open_id'])) $t['open_id'] = (string) $j['open_id'];
    $c['tiktok'] = $t;
    aled08e_lmm_set($c);
}
function aled08e_lmm_tt_appel($chemin, $donnees) {
    $j = aled08e_lmm_tt_jeton();
    if (is_wp_error($j)) return $j;
    $r = aled08e_rs_http('POST', 'https://open.tiktokapis.com' . $chemin, ['headers' => ['Authorization' => 'Bearer ' . $j, 'Content-Type' => 'application/json; charset=UTF-8'], 'body' => wp_json_encode($donnees ?: new stdClass(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 'timeout' => 40]);
    if (is_wp_error($r)) return $r;
    $code = (string) ($r['json']['error']['code'] ?? 'ok');
    if ($code !== 'ok') return new WP_Error('aled08_lmm', 'TikTok : ' . mb_substr((string) ($r['json']['error']['message'] ?? $code), 0, 200), ['code' => $code]);
    return (array) ($r['json']['data'] ?? []);
}
/* Les informations du compte, relues à chaque affichage de la page de publication (règle de TikTok) */
function aled08e_lmm_tt_createur() { return aled08e_lmm_tt_appel('/v2/post/publish/creator_info/query/', []); }

add_action('admin_post_aled08e_lmm_tiktok', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('aled08e_lmm_tiktok')) wp_die('Accès refusé.');
    if (!aled08e_lmm_tt_ok()) { wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => 'tt_manque'])); exit; }
    $etat = wp_generate_password(24, false, false);
    set_transient('aled08_lmm_tt_etat_' . get_current_user_id(), $etat, 15 * MINUTE_IN_SECONDS);
    wp_redirect('https://www.tiktok.com/v2/auth/authorize/?' . http_build_query(['client_key' => aled08e_lmm_tt_opt('cle'), 'scope' => 'user.info.basic,video.publish', 'response_type' => 'code', 'redirect_uri' => aled08e_lmm_tt_retour(), 'state' => $etat])); // phpcs:ignore -- adresse fixe de TikTok
    exit;
});
/* Le retour de TikTok (adresse sans paramètre, comme TikTok le demande), et le fichier de vérification du domaine */
add_action('init', function () {
    $chemin = '/' . trim((string) wp_parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH), '/');
    $fichier = aled08e_lmm_tt_opt('verif_nom');
    if ($fichier !== '' && $chemin === '/' . $fichier) { header('Content-Type: text/plain; charset=utf-8'); echo aled08e_lmm_tt_opt('verif_texte'); exit; } // phpcs:ignore -- texte simple donné par TikTok
    if ($chemin !== '/tiktok-retour') return;
    if (!is_user_logged_in() || !current_user_can('manage_options')) { wp_safe_redirect(wp_login_url(aled08e_lmm_admin_url())); exit; }
    $fin = function ($code) { wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => $code])); exit; };
    $uid = get_current_user_id();
    $etat = (string) get_transient('aled08_lmm_tt_etat_' . $uid);
    delete_transient('aled08_lmm_tt_etat_' . $uid);
    if (!empty($_GET['error']) || empty($_GET['code'])) $fin('annule');
    if ($etat === '' || !hash_equals($etat, sanitize_text_field(wp_unslash($_GET['state'] ?? '')))) $fin('expire');
    $r = aled08e_rs_http('POST', 'https://open.tiktokapis.com/v2/oauth/token/', ['body' => ['client_key' => aled08e_lmm_tt_opt('cle'), 'client_secret' => aled08e_lmm_tt_opt('secret'), 'code' => sanitize_text_field(wp_unslash($_GET['code'])), 'grant_type' => 'authorization_code', 'redirect_uri' => aled08e_lmm_tt_retour()]]);
    if (is_wp_error($r) || empty($r['json']['access_token'])) $fin('refus');
    aled08e_lmm_tt_garder($r['json']);
    $fin('tt_relie');
}, 1);

/* Publier sur TikTok, après le choix d'Alex (visibilité, commentaires, sa marque, accord) */
add_action('admin_post_aled08e_lmm_tt_publier', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('aled08e_lmm_tt_publier')) wp_die('Accès refusé.');
    $P = wp_unslash($_POST);
    $jour = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($P['jour'] ?? '')) ? (string) $P['jour'] : '';
    [, $e] = aled08e_lmm_du_jour($jour);
    $fin = function ($code) { wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => $code]) . '#tiktok'); exit; };
    if (!$e || empty($e['tiktok_image'])) $fin('tt_rien');
    if (!empty($e['resultats']['tiktok']['ok'])) $fin('tt_deja');
    if (empty($P['accord'])) $fin('tt_accord');
    $cr = aled08e_lmm_tt_createur();
    if (is_wp_error($cr)) { aled08e_lmm_maj($jour, ['resultats' => ['tiktok' => ['ok' => false, 'erreur' => $cr->get_error_message(), 'le' => time()]] + (array) $e['resultats']]); $fin('tt_erreur'); }
    $vis = sanitize_text_field((string) ($P['visibilite'] ?? ''));
    if ($vis === '' || !in_array($vis, (array) ($cr['privacy_level_options'] ?? []), true)) $fin('tt_visibilite');
    $desc = mb_substr(trim((string) ($P['legende'] ?? $e['legende'])), 0, 4000);
    $info = ['title' => mb_substr($e['titre'], 0, 90), 'description' => $desc, 'privacy_level' => $vis, 'disable_comment' => empty($P['commentaires']) || !empty($cr['comment_disabled']), 'auto_add_music' => true];
    if (!empty($P['marque'])) $info['brand_organic_toggle'] = true;
    $r = aled08e_lmm_tt_appel('/v2/post/publish/content/init/', ['post_info' => $info, 'source_info' => ['source' => 'PULL_FROM_URL', 'photo_cover_index' => 0, 'photo_images' => [$e['tiktok_image']]], 'post_mode' => 'DIRECT_POST', 'media_type' => 'PHOTO']);
    $res = (array) ($e['resultats'] ?? []);
    $res['tiktok'] = is_wp_error($r) ? ['ok' => false, 'erreur' => $r->get_error_message(), 'le' => time()] : ['ok' => true, 'publish_id' => (string) ($r['publish_id'] ?? ''), 'visibilite' => $vis, 'url' => 'https://www.tiktok.com/@' . (string) ($cr['creator_username'] ?? ''), 'le' => time()];
    aled08e_lmm_maj($jour, ['resultats' => $res]);
    $fin(is_wp_error($r) ? 'tt_erreur' : 'tt_publie');
});

/* =========================================================================
 *  La page « Réseaux » (menu Les Minis Monstres)
 * ========================================================================= */
add_action('admin_menu', function () {
    add_submenu_page('aled08', 'Les réseaux des Minis Monstres', 'Réseaux', 'manage_options', 'aled08-reseaux', 'aled08e_lmm_page_html');
}, 12);
add_action('admin_post_aled08e_lmm', function () {
    if (!current_user_can('manage_options') || !check_admin_referer('aled08e_lmm')) wp_die('Accès refusé.');
    $P = wp_unslash($_POST);
    $faire = sanitize_key((string) ($P['faire'] ?? ''));
    $code = 'ok';
    if ($faire === 'reglages') {
        aled08e_option_set('aled08_lmm_rs_pause', empty($P['actif']) ? '1' : '0');
        $c = aled08e_lmm_get();
        if (isset($P['page'], $c['pages'][(int) $P['page']])) { $c['page'] = (int) $P['page']; aled08e_lmm_set($c); }
        if (isset($P['tt_cle'])) aled08e_option_set('aled08_lmm_tiktok_cle', preg_replace('/[^A-Za-z0-9_-]/', '', (string) $P['tt_cle']));
        $s = trim((string) ($P['tt_secret'] ?? ''));
        if ($s !== '') aled08e_option_set('aled08_lmm_tiktok_secret', preg_replace('/[^A-Za-z0-9_=.-]/', '', $s));
        $vn = trim((string) ($P['tt_verif_nom'] ?? ''));
        if ($vn === '' || preg_match('/^tiktok[A-Za-z0-9_-]{4,80}\.txt$/', $vn)) aled08e_option_set('aled08_lmm_tiktok_verif_nom', $vn);
        aled08e_option_set('aled08_lmm_tiktok_verif_texte', mb_substr(preg_replace('/[^A-Za-z0-9=_.:-]/', '', (string) ($P['tt_verif_texte'] ?? '')), 0, 200));
        if (!empty($P['delier_meta'])) { $c = aled08e_lmm_get(); unset($c['pages'], $c['page']); aled08e_lmm_set($c); }
        if (!empty($P['delier_tiktok'])) { $c = aled08e_lmm_get(); unset($c['tiktok']); aled08e_lmm_set($c); }
        $code = 'enregistre';
    } elseif ($faire === 'preparer') {
        $r = aled08e_lmm_preparer(true);
        if (is_wp_error($r)) { set_transient('aled08_lmm_flash', $r->get_error_message(), 300); $code = 'erreur'; } else $code = 'prepare';
    } elseif ($faire === 'publier') {
        $r = aled08e_lmm_publier();
        if (is_wp_error($r)) { set_transient('aled08_lmm_flash', $r->get_error_message(), 300); $code = 'erreur'; } else $code = 'publie';
    }
    wp_safe_redirect(aled08e_lmm_admin_url(['lmm' => $code]));
    exit;
});
function aled08e_lmm_messages() {
    return [
        'relie' => [true, 'La page Facebook est reliée. Si elle a un Instagram professionnel, il est relié aussi.'], 'tt_relie' => [true, 'Le compte TikTok est relié.'],
        'enregistre' => [true, 'Enregistré.'], 'prepare' => [true, 'La publication du jour est écrite à nouveau.'], 'publie' => [true, 'C’est parti sur les comptes reliés (le détail est ci-dessous).'],
        'tt_publie' => [true, 'C’est parti sur TikTok. TikTok met une minute ou deux à l’afficher.'], 'annule' => [false, 'La liaison a été annulée.'], 'expire' => [false, 'La liaison a expiré. Réessayez.'],
        'refus' => [false, 'Le réseau a refusé la liaison. Vérifiez l’identifiant et la clé de l’application, puis réessayez.'], 'sans_page' => [false, 'Aucune page Facebook trouvée : il faut cocher la page des Minis Monstres au moment de l’accord.'],
        'meta_manque' => [false, 'Collez d’abord l’identifiant et la clé secrète de l’application Meta (Réglages, section « Publier sur les réseaux »).'], 'tt_manque' => [false, 'Collez d’abord la clé et le secret de l’application TikTok, ci-dessous.'],
        'tt_rien' => [false, 'Pas de publication prête pour ce jour.'], 'tt_deja' => [false, 'Cette publication est déjà partie sur TikTok.'], 'tt_accord' => [false, 'Cochez la case d’accord pour publier.'],
        'tt_visibilite' => [false, 'Choisissez qui pourra voir la publication.'], 'tt_erreur' => [false, 'TikTok a refusé : le détail est dans le journal ci-dessous.'],
    ];
}
function aled08e_lmm_page_html() {
    if (!current_user_can('manage_options')) return;
    $c = aled08e_lmm_get();
    $p = aled08e_lmm_page();
    $code = sanitize_key((string) ($_GET['lmm'] ?? ''));
    echo '<div class="wrap"><h1>Les réseaux des Minis Monstres</h1>';
    $m = aled08e_lmm_messages();
    if (isset($m[$code])) echo '<div class="notice notice-' . ($m[$code][0] ? 'success' : 'error') . '"><p>' . esc_html($m[$code][1]) . '</p></div>';
    if ($code === 'erreur' && ($f = get_transient('aled08_lmm_flash'))) echo '<div class="notice notice-error"><p>' . esc_html((string) $f) . '</p></div>';
    $err = get_option('aled08_lmm_rs_erreur');
    if (is_array($err) && (int) ($err['le'] ?? 0) > time() - 2 * DAY_IN_SECONDS) echo '<div class="notice notice-warning"><p>Dernier souci : ' . esc_html((string) $err['texte']) . '</p></div>';
    echo '<p>Chaque jour à 12 h 13, la bande écrit une publication (un jour « Les nouvelles », le lendemain « La bande »), fabrique son visuel et la publie sur la page Facebook et l’Instagram des Minis Monstres. Pour TikTok, ses règles demandent que vous choisissiez la visibilité et cliquiez sur Publier : c’est un clic, plus bas.</p>';

    // la publication du jour
    [, $e] = aled08e_lmm_du_jour();
    echo '<h2>Aujourd’hui</h2>';
    if ($e) {
        echo '<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start"><img src="' . esc_url($e['image']) . '" alt="" style="width:320px;max-width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.12)">';
        echo '<div style="flex:1;min-width:260px;max-width:640px"><p><strong>' . esc_html($e['etiquette'] . ' : ' . $e['titre']) . '</strong></p><div style="white-space:pre-wrap;background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:12px">' . esc_html($e['legende']) . '</div>';
        foreach (['facebook' => 'Facebook', 'instagram' => 'Instagram', 'tiktok' => 'TikTok'] as $k => $nom) {
            $r = $e['resultats'][$k] ?? null;
            if (!$r) continue;
            echo '<p>' . esc_html($nom) . ' : ' . (!empty($r['ok']) ? 'parti' . (!empty($r['url']) ? ' (<a href="' . esc_url($r['url']) . '" target="_blank" rel="noopener">voir</a>)' : '') : 'refusé, ' . esc_html((string) ($r['erreur'] ?? ''))) . '</p>';
        }
        echo '</div></div>';
    } else echo '<p>Pas encore préparée (elle se prépare à 12 h 13).</p>';
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="margin-top:12px">';
    wp_nonce_field('aled08e_lmm');
    echo '<input type="hidden" name="action" value="aled08e_lmm">';
    if (!$e || empty($e['publie'])) echo '<button class="button" name="faire" value="preparer">' . ($e ? 'Réécrire la publication du jour' : 'Préparer la publication du jour maintenant') . '</button> ';
    if ($p) echo '<button class="button button-primary" name="faire" value="publier">Publier maintenant sur Facebook' . (!empty($p['ig_id']) ? ' et Instagram' : '') . '</button>';
    echo '</form>';

    // TikTok : la page de publication, conforme aux règles de TikTok (compte affiché, visibilité choisie, accord)
    echo '<h2 id="tiktok">TikTok</h2>';
    if (empty($c['tiktok']['refresh'])) echo '<p>Pas encore relié.' . (aled08e_lmm_tt_ok() ? ' <a class="button" href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=aled08e_lmm_tiktok'), 'aled08e_lmm_tiktok')) . '">Relier le compte TikTok</a>' : ' Collez d’abord la clé et le secret de l’application, plus bas.') . '</p>';
    elseif ($e && empty($e['resultats']['tiktok']['ok'])) {
        $cr = aled08e_lmm_tt_createur();
        if (is_wp_error($cr)) echo '<p>' . esc_html($cr->get_error_message()) . '</p>';
        else {
            $noms = ['PUBLIC_TO_EVERYONE' => 'Tout le monde', 'MUTUAL_FOLLOW_FRIENDS' => 'Mes amis', 'FOLLOWER_OF_CREATOR' => 'Mes abonnés', 'SELF_ONLY' => 'Moi seulement'];
            echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="max-width:640px">';
            wp_nonce_field('aled08e_lmm_tt_publier');
            echo '<input type="hidden" name="action" value="aled08e_lmm_tt_publier"><input type="hidden" name="jour" value="' . esc_attr($e['jour']) . '">';
            echo '<p>Compte : <strong>' . esc_html((string) ($cr['creator_nickname'] ?? '')) . '</strong> (@' . esc_html((string) ($cr['creator_username'] ?? '')) . ')</p>';
            echo '<p><img src="' . esc_url($e['tiktok_image']) . '" alt="" style="width:180px;border-radius:10px"></p>';
            echo '<p><label>Texte<br><textarea name="legende" rows="8" style="width:100%">' . esc_textarea($e['legende']) . '</textarea></label></p>';
            echo '<p><label>Qui peut voir cette publication ? <select name="visibilite" required><option value="">Choisir…</option>';
            foreach ((array) ($cr['privacy_level_options'] ?? []) as $o) echo '<option value="' . esc_attr($o) . '">' . esc_html($noms[$o] ?? $o) . '</option>';
            echo '</select></label></p>';
            echo '<p><label><input type="checkbox" name="commentaires" value="1"' . (!empty($cr['comment_disabled']) ? ' disabled' : '') . '> Autoriser les commentaires</label></p>';
            echo '<p><label><input type="checkbox" name="marque" value="1"> Cette publication fait la promotion de ma propre marque (Les Minis Monstres)</label></p>';
            echo '<p><label><input type="checkbox" name="accord" value="1" required> J’accepte de publier ce contenu sur TikTok. En publiant, j’accepte la <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noopener">confirmation d’utilisation de la musique</a> de TikTok.</label></p>';
            echo '<p class="description">Tant que TikTok n’a pas validé l’application des Minis Monstres, seule la visibilité « Moi seulement » est acceptée.</p>';
            echo '<p><button class="button button-primary">Publier sur TikTok</button></p></form>';
        }
    } elseif ($e) echo '<p>Partie sur TikTok aujourd’hui.</p>';
    else echo '<p>La publication du jour n’est pas encore prête.</p>';

    // les comptes et les réglages
    echo '<h2>Comptes et réglages</h2><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
    wp_nonce_field('aled08e_lmm');
    echo '<input type="hidden" name="action" value="aled08e_lmm"><input type="hidden" name="faire" value="reglages"><table class="form-table" role="presentation">';
    echo '<tr><th>Publication du jour</th><td><label><input type="checkbox" name="actif" value="1"' . checked(!aled08e_lmm_pause(), true, false) . '> Écrire et publier chaque jour à 12 h 13</label></td></tr>';
    echo '<tr><th>Facebook et Instagram</th><td>';
    if ($p) {
        echo '<p>Page reliée : <select name="page">';
        foreach ((array) $c['pages'] as $i => $x) echo '<option value="' . (int) $i . '"' . selected((int) ($c['page'] ?? 0), $i, false) . '>' . esc_html($x['nom'] . ($x['ig_nom'] ? ' + Instagram @' . $x['ig_nom'] : ' (sans Instagram)')) . '</option>';
        echo '</select></p><p><label><input type="checkbox" name="delier_meta" value="1"> Délier</label></p>';
    }
    echo '<p><a class="button" href="' . esc_url(wp_nonce_url(admin_url('admin-post.php?action=aled08e_lmm_meta'), 'aled08e_lmm_meta')) . '">' . ($p ? 'Relier à nouveau' : 'Relier la page Facebook et l’Instagram des Minis Monstres') . '</a></p>';
    echo '<p class="description">Gratuit, par l’application Meta des Minis Monstres (identifiant et clé secrète : Réglages, section « Publier sur les réseaux »). L’application peut rester en mode développement : vous en êtes l’administrateur, elle publie sur vos propres comptes sans validation de Meta. L’Instagram doit être un compte professionnel relié à la page Facebook.</p></td></tr>';
    $sec = aled08e_lmm_tt_opt('secret');
    echo '<tr><th>TikTok</th><td>';
    if (!empty($c['tiktok']['refresh'])) echo '<p>Compte relié. <label><input type="checkbox" name="delier_tiktok" value="1"> Délier</label></p>';
    echo '<p><label>Clé de l’application (Client key) <input type="text" name="tt_cle" class="regular-text" autocomplete="off" value="' . esc_attr(aled08e_lmm_tt_opt('cle')) . '"></label></p>';
    echo '<p><label>Secret (Client secret) <input type="password" name="tt_secret" class="regular-text" autocomplete="off"></label> <span class="description">' . esc_html($sec === '' ? 'aucun' : 'enregistré, se termine par ' . substr($sec, -4)) . '. Laissez vide pour ne rien changer.</span></p>';
    echo '<p><label>Fichier de vérification du domaine (nom) <input type="text" name="tt_verif_nom" class="regular-text" placeholder="tiktokXXXXXXXX.txt" value="' . esc_attr(aled08e_lmm_tt_opt('verif_nom')) . '"></label></p>';
    echo '<p><label>Son contenu <input type="text" name="tt_verif_texte" class="regular-text" placeholder="tiktok-developers-site-verification=…" value="' . esc_attr(aled08e_lmm_tt_opt('verif_texte')) . '"></label></p>';
    echo '<p class="description">Sur developers.tiktok.com : créer une application, ajouter « Login Kit » et « Content Posting API » (avec « Direct Post »), les autorisations user.info.basic et video.publish, et cette adresse de retour : <code>' . esc_html(aled08e_lmm_tt_retour()) . '</code>. Dans « URL properties », vérifier le domaine <code>' . esc_html(wp_parse_url(home_url(), PHP_URL_HOST)) . '</code> par fichier : collez ici le nom et le contenu du fichier donné par TikTok, enregistrez, puis cliquez sur « Verify » chez TikTok. Ensuite, demander la validation (« audit ») pour publier en public.</p></td></tr>';
    echo '</table><p class="submit"><button class="button button-primary">Enregistrer</button></p></form>';

    // le journal
    echo '<h2>Les dernières publications</h2><table class="widefat striped"><thead><tr><th>Jour</th><th>Visuel</th><th>Sujet</th><th>Facebook</th><th>Instagram</th><th>TikTok</th></tr></thead><tbody>';
    $etat = function ($r) { return !$r ? '–' : (!empty($r['ok']) ? (!empty($r['url']) ? '<a href="' . esc_url($r['url']) . '" target="_blank" rel="noopener">parti</a>' : 'parti') : '<span title="' . esc_attr((string) ($r['erreur'] ?? '')) . '">refusé</span>'); };
    foreach (array_slice(aled08e_lmm_journal(), 0, 14) as $x) {
        $res = (array) ($x['resultats'] ?? []);
        echo '<tr><td>' . esc_html(aled08e_date_fr(strtotime($x['jour'] . ' 12:00:00'), false)) . '</td><td><a href="' . esc_url($x['image']) . '" target="_blank" rel="noopener"><img src="' . esc_url($x['image']) . '" alt="" style="width:64px;border-radius:6px"></a></td><td>' . esc_html($x['etiquette'] . ' : ' . $x['titre']) . '</td><td>' . $etat($res['facebook'] ?? null) . '</td><td>' . $etat($res['instagram'] ?? null) . '</td><td>' . $etat($res['tiktok'] ?? null) . '</td></tr>'; // phpcs:ignore -- échappé ci-dessus
    }
    echo '</tbody></table></div>';
}

/* =========================================================================
 *  Pour les agents (atelier) et le bilan du soir
 * ========================================================================= */
add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/reseaux', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function () {
            $p = aled08e_lmm_page();
            $c = aled08e_lmm_get();
            $j = array_map(function ($x) { unset($x['chemin'], $x['tiktok_chemin']); return $x; }, array_slice(aled08e_lmm_journal(), 0, 14));
            return ['actif' => !aled08e_lmm_pause(), 'facebook' => $p ? $p['nom'] : '', 'instagram' => $p && $p['ig_nom'] ? '@' . $p['ig_nom'] : '', 'tiktok' => !empty($c['tiktok']['refresh']),
                'prochaine' => wp_date('Y-m-d H:i', aled08e_lmm_prochain()), 'type_demain' => aled08e_lmm_type(wp_date('Y-m-d', time() + DAY_IN_SECONDS)), 'erreur' => get_option('aled08_lmm_rs_erreur') ?: null, 'journal' => $j];
        }],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $faire = sanitize_key((string) $r->get_param('faire'));
            if ($faire === 'pause' || $faire === 'reprendre') { aled08e_option_set('aled08_lmm_rs_pause', $faire === 'pause' ? '1' : '0'); return ['ok' => true, 'actif' => $faire === 'reprendre']; }
            if ($faire === 'preparer') { $x = aled08e_lmm_preparer(true); return is_wp_error($x) ? $x : ['ok' => true, 'publication' => array_diff_key($x, ['chemin' => 1, 'tiktok_chemin' => 1])]; }
            if ($faire === 'publier') { $x = aled08e_lmm_publier(); return is_wp_error($x) ? $x : ['ok' => true, 'resultats' => $x]; }
            return new WP_Error('aled08_lmm', 'faire : preparer, publier, pause ou reprendre.', ['status' => 400]);
        }],
    ]);
});
/* Les lignes du bilan du soir */
function aled08e_lmm_bilan_lignes() {
    $l = [];
    $p = aled08e_lmm_page();
    [, $e] = aled08e_lmm_du_jour();
    if (aled08e_lmm_pause()) return ['Réseaux : la publication du jour est en pause (menu Les Minis Monstres › Réseaux).'];
    if (!$e) {
        $err = get_option('aled08_lmm_rs_erreur');
        return [is_array($err) && (int) ($err['le'] ?? 0) > time() - DAY_IN_SECONDS ? 'Réseaux : la publication du jour n’a pas pu être préparée (' . $err['texte'] . ').' : 'Réseaux : pas de publication aujourd’hui.'];
    }
    $res = (array) ($e['resultats'] ?? []);
    $partis = [];
    foreach (['facebook' => 'Facebook', 'instagram' => 'Instagram', 'tiktok' => 'TikTok'] as $k => $n) if (!empty($res[$k]['ok'])) $partis[] = $n;
    $l[] = 'Réseaux : « ' . $e['titre'] . ' » (' . $e['etiquette'] . ')' . ($partis ? ', publié sur ' . implode(', ', $partis) : '') . '.';
    foreach (['facebook' => 'Facebook', 'instagram' => 'Instagram'] as $k => $n) if (isset($res[$k]) && empty($res[$k]['ok'])) $l[] = 'IMPORTANT : ' . $n . ' a refusé la publication du jour (' . $res[$k]['erreur'] . ').';
    if (!$p) $l[] = 'Facebook et Instagram ne sont pas encore reliés : menu Les Minis Monstres › Réseaux, bouton « Relier ». Le visuel du jour : ' . $e['image'];
    if (empty($res['tiktok']['ok'])) $l[] = 'TikTok : un clic pour la publier : ' . aled08e_lmm_admin_url() . '#tiktok';
    return $l;
}
