<?php
/**
 * Les Minis Monstres Espace client : Mirette, l'observatrice, écrit l'analyse de la semaine (extra « Analyse de Mirette », ou ancien abonnement Maxi).
 * Une fois par semaine (tâche quotidienne aled08_quotidien), pour chaque client qui a l'extra Analyse de Mirette et dont le site est relié :
 * les chiffres du site (connecteur, action « stats » : visites sur 14 jours, pages les plus vues, provenance, recherches
 * Google si Search Console est relié) partent chez Claude, qui rend une analyse courte et deux suggestions concrètes.
 * Elles s'affichent dans « Les petits mots de la bande » (includes/messages.php). « Oui, faites-le » envoie la suggestion
 * comme une demande : Cerise la précise avec le client, puis Alex la fait. Modèle : celui de la bulle de Cerise (rapide).
 */
defined('ABSPATH') || exit;

function aled08e_mirette_ok($uid) {
    return aled08e_mirette_actif($uid)
        && function_exists('aled08e_lia_prete_pour') && aled08e_lia_prete_pour($uid)
        && function_exists('aled08e_jl_forfait_actif') && aled08e_jl_forfait_actif($uid);
}
function aled08e_mirette_lire($uid) { $v = get_user_meta($uid, 'aled08_mirette', true); return is_array($v) ? $v : []; }

/* Les chiffres envoyés à Claude : courts, sans donnée personnelle */
function aled08e_mirette_chiffres($st) {
    $jours = array_slice(array_values((array) ($st['jours'] ?? [])), -14);
    $g = (array) ($st['google'] ?? []);
    return [
        'visiteurs_par_jour_14_derniers_jours' => array_map(function ($j) { return ['jour' => $j['jour'] ?? '', 'visiteurs' => (int) ($j['visiteurs'] ?? 0), 'vues' => (int) ($j['vues'] ?? 0)]; }, $jours),
        'pages_les_plus_vues_30_jours' => (array) ($st['pages'] ?? []),
        'provenance_30_jours' => (array) ($st['sources'] ?? []),
        'appareils_30_jours' => (array) ($st['appareils'] ?? []),
        'recherches_google' => ($g['etat'] ?? '') === 'ok' ? array_slice((array) ($g['recherches'] ?? []), 0, 10) : 'non disponibles',
        'contenus_en_ligne' => (array) ($st['contenu'] ?? []),
        'boutique_30_jours' => $st['boutique'] ?? null,
    ];
}

function aled08e_mirette_schema() {
    return ['type' => 'object', 'additionalProperties' => false, 'required' => ['analyse', 'suggestions'], 'properties' => [
        'analyse' => ['type' => 'string'],
        'suggestions' => ['type' => 'array', 'items' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['qui', 'titre', 'texte', 'demande'], 'properties' => [
            'qui' => ['type' => 'string', 'enum' => ['bricou', 'plume', 'lumi']],
            'titre' => ['type' => 'string'],
            'texte' => ['type' => 'string'],
            'demande' => ['type' => 'string'],
        ]]],
    ]];
}
function aled08e_mirette_systeme() {
    return "Tu es Mirette, l'observatrice de la petite bande des Minis Monstres, qui entretient le site internet d'un petit commerce, d'un artisan ou d'une association. "
        . "Tu reçois les chiffres de visite de son site. Tu écris pour le propriétaire, qui n'est pas du métier.\n\n"
        . "Rends :\n"
        . "- analyse : deux ou trois phrases simples sur la semaine écoulée comparée à la précédente, avec un ou deux chiffres parlants (visiteurs, page la plus vue, d'où viennent les visiteurs). Ton chaleureux et honnête : si c'est calme, dis-le simplement, sans dramatiser.\n"
        . "- suggestions : une ou deux idées concrètes, faisables sur le site (Alex les fait), tirées des chiffres. qui = « lumi » pour une nouvelle page pour Google, « plume » pour un texte à améliorer, « bricou » (signé Cerise) pour un petit changement sur une page (bandeau, bouton, information à mettre en avant). titre : quelques mots. texte : une ou deux phrases pour le client, en vouvoyant, qui disent pourquoi. demande : la consigne précise que la bande exécutera si le client dit oui, écrite comme une demande de modification.\n\n"
        . "Règles : n'invente aucun chiffre, n'utilise que ceux fournis. Pas de jargon. Pas de tiret long ni de point-virgule. Pas de promesse de résultat sur Google. Si les chiffres sont presque vides, dis que le site démarre et propose une page utile.";
}

/* L'analyse d'un client : chiffres → Claude → méta aled08_mirette */
function aled08e_mirette_analyser($uid) {
    if (!aled08e_mirette_ok($uid) || !aled08e_lia_sdk()) return false;
    delete_transient('aled08_stats_' . (int) $uid);
    $st = aled08e_stats_lire($uid);
    if (($st['etat'] ?? '') !== 'ok') return false;
    $u = get_userdata($uid);
    $contenu = 'Site : ' . (aled08e_meta($uid, 'site') ?: '?') . ($u ? ' (' . $u->display_name . ')' : '') . "\n\n<chiffres>\n" . wp_json_encode(aled08e_mirette_chiffres($st), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n</chiffres>";
    try {
        $client = new \Anthropic\Client(apiKey: aled08e_lia_cle());
        $r = $client->messages->create(
            model: function_exists('aled08e_bulle_modele') ? aled08e_bulle_modele() : aled08e_lia_modele(),
            maxTokens: 1500,
            system: [['type' => 'text', 'text' => aled08e_mirette_systeme()]],
            messages: [['role' => 'user', 'content' => $contenu]],
            outputConfig: ['effort' => 'low', 'format' => ['type' => 'json_schema', 'schema' => aled08e_mirette_schema()]],
        );
    } catch (\Throwable $e) {
        aled08e_lia_journal_add('Mirette : erreur Claude pour ' . ($u ? $u->display_name : '#' . $uid) . ' : ' . $e->getMessage());
        return false;
    }
    if (($r->stopReason ?? '') === 'refusal' || ($r->stopReason ?? '') === 'max_tokens') return false;
    $brut = '';
    foreach ($r->content as $b) if ($b->type === 'text') $brut .= $b->text;
    $d = json_decode($brut, true);
    if (!is_array($d) || !isset($d['analyse'], $d['suggestions']) || !is_array($d['suggestions'])) return false;
    $propre = function ($t, $max) { return mb_substr(trim(preg_replace('/\s*[—–;]\s*/u', ', ', wp_strip_all_tags((string) $t))), 0, $max); };
    $sugg = [];
    foreach (array_slice($d['suggestions'], 0, 2) as $x) {
        if (!is_array($x) || empty($x['titre']) || empty($x['demande'])) continue;
        $sugg[] = ['qui' => in_array($x['qui'] ?? '', ['bricou', 'plume', 'lumi'], true) ? $x['qui'] : 'bricou', 'titre' => $propre($x['titre'], 80), 'texte' => $propre($x['texte'] ?? '', 300), 'demande' => $propre($x['demande'], 800)];
    }
    if (isset($r->usage) && function_exists('aled08e_jl_tarifs') && function_exists('aled08e_jl_cout_noter')) {
        $t = aled08e_jl_tarifs(function_exists('aled08e_bulle_modele') ? aled08e_bulle_modele() : aled08e_lia_modele());
        aled08e_jl_cout_noter($uid, 'mirette:' . wp_date('oW'), aled08e_jl_centimes(((int) ($r->usage->inputTokens ?? 0) * $t['entree'] + (int) ($r->usage->outputTokens ?? 0) * $t['sortie']) / 1000000));
    }
    update_user_meta($uid, 'aled08_mirette', ['semaine' => wp_date('oW'), 'le' => time(), 'analyse' => $propre($d['analyse'], 600), 'suggestions' => $sugg]);
    aled08e_lia_journal_add('Mirette a écrit l’analyse de la semaine pour ' . ($u ? $u->display_name : '#' . $uid) . ' (' . count($sugg) . ' suggestion(s)).');
    return true;
}

/* Chaque jour : les clients avec l'extra Analyse de Mirette dont l'analyse a plus de 7 jours (5 au plus par jour, pour étaler) */
function aled08e_mirette_tourner() {
    if (get_option('aled08_mirette_pause') === '1') return;
    $faits = 0;
    foreach (get_users(['role' => ALED08E_ROLE, 'fields' => 'ID', 'number' => 500]) as $uid) {
        $uid = (int) $uid;
        if ($faits >= 5 || !aled08e_mirette_ok($uid)) continue;
        $m = aled08e_mirette_lire($uid);
        if (!empty($m['le']) && time() - (int) $m['le'] < 7 * DAY_IN_SECONDS - 6 * HOUR_IN_SECONDS) continue;
        @set_time_limit(120);
        if (aled08e_mirette_analyser($uid)) $faits++;
    }
}
add_action('aled08_quotidien', 'aled08e_mirette_tourner', 45);

/* Une suggestion acceptée par le client devient une demande comme les autres : Cerise la précise avec lui, Alex la fait. */
