<?php
/**
 * Les Minis Monstres Espace client : l'organisation des agents (22 novembre 2026, décision d'Alex).
 * LMM tourne seul : chaque travail est fait par un agent, vérifié par un autre, et seuls les cas compliqués remontent à Alex.
 *
 *   - Le constructeur : fait les sites, les pages de visibilité Google et les modifications demandées par les clients.
 *   - Le contrôleur   : relit tout avec un œil neuf, puis livre (ou renvoie à corriger). Rien n'arrive chez un client sans lui.
 *   - Jarvis          : regarde l'ensemble, tient la mémoire propre, et écrit à Alex seulement quand il le faut.
 *   - Le Repéreur, le Facteur et le Répondeur : la prospection par e-mail (25 novembre 2026), éteinte par défaut. Leur travail
 *     est dans includes/prospection.php et includes/prospection-suite.php ; leur poste passe par la même route.
 *
 * Ce fichier porte : le poste de chaque agent (une seule route d'entrée), la mémoire commune (le « second cerveau »),
 * les modifications des clients, les cas pour Alex, le point de Jarvis, et un chien de garde si les agents ne passent plus.
 * Les fiches de poste et les règles viennent du skill « nouveau-site » (regles/*.md, servies par includes/regles.php).
 *
 * Routes (administrateur) :
 *   GET  /aled08/v1/atelier/poste?agent=constructeur|controleur|jarvis|repereur|facteur|repondeur   sa fiche de poste, son travail, la mémoire utile (note son passage)
 *   POST /aled08/v1/atelier/passage {agent, bilan}                        le bilan de fin de passage
 *   GET  /aled08/v1/atelier/memoire?type=&client=&q=&limite=              lire la mémoire
 *   POST /aled08/v1/atelier/memoire {type, client, titre, texte, par}     ajouter une note
 *   GET  /aled08/v1/atelier/demandes                                      les modifications à faire ou à contrôler
 *   POST /aled08/v1/atelier/demande {demande, faire, texte}               commencer, a_controler, corriger, faite, pour_alex, reprendre
 *   POST /aled08/v1/atelier/point {titre, texte}                          le point de Jarvis, par e-mail à Alex
 */
defined('ABSPATH') || exit;

define('ALED08E_CPT_NOTE', 'aled08_note');
define('ALED08E_AGENTS', ['constructeur', 'controleur', 'jarvis', 'repereur', 'facteur', 'repondeur']);
/* Les agents de la prospection par e-mail (includes/prospection.php) */
define('ALED08E_AGENTS_PROSPECTION', ['repereur', 'facteur', 'repondeur']);

/* Les agents font-ils les modifications des clients ? ('0' : tout revient chez Alex, comme avant) */
function aled08e_agents_actifs() { return get_option('aled08_agents', '1') === '1'; }
/* Une demande que les agents traitent : une modification simple (ni page Google, ni extra) */
function aled08e_agents_pour_modifs($pid) {
    return aled08e_agents_actifs() && !get_post_meta($pid, '_aled08_seo', true) && (string) get_post_meta($pid, '_aled08_extra', true) === '';
}

/* ---------- les échanges entre agents (jamais montrés au client) ---------- */
function aled08e_agent_fil($pid) { $f = get_post_meta((int) $pid, '_aled08_agent_fil', true); return is_array($f) ? $f : []; }
function aled08e_agent_fil_ajouter($pid, $qui, $texte) {
    $f = aled08e_agent_fil($pid);
    $f[] = ['qui' => sanitize_key($qui), 'texte' => mb_substr(trim(wp_strip_all_tags((string) $texte)), 0, 3000), 'le' => wp_date('j/m H:i')];
    update_post_meta((int) $pid, '_aled08_agent_fil', array_slice($f, -12));
}
function aled08e_agent_fil_dernier($pid, $qui) {
    foreach (array_reverse(aled08e_agent_fil($pid)) as $x) if (($x['qui'] ?? '') === $qui) return (string) $x['texte'];
    return '';
}
/* Un refus de contrôle de plus ; au-delà de deux, le cas part chez Alex */
function aled08e_agent_tour($pid) {
    $n = (int) get_post_meta((int) $pid, '_aled08_controle_tours', true) + 1;
    update_post_meta((int) $pid, '_aled08_controle_tours', $n);
    return $n;
}

/* ---------- un cas pour Alex : l'e-mail, le seul qui lui demande quelque chose ---------- */
function aled08e_agents_pour_alex($quoi, $titre, $raison, $detail = '') {
    wp_mail(aled08e_to(), 'À voir par vous : ' . $quoi . ' · ' . $titre,
        "Les agents ont besoin de vous pour ce cas.\n\nPourquoi : " . $raison . "\n\n" . ($detail !== '' ? $detail . "\n\n" : '')
        . "Pour répondre : ouvrez une conversation avec Claude et dites ce qu’il faut faire (par exemple « pour " . $quoi . " " . $titre . ", fais ceci »). Le travail reprendra ensuite tout seul.\n\nVotre tableau : " . aled08e_url(['onglet' => 'accueil']) . "\n",
        aled08e_mail_headers());
    aled08e_lia_journal_add('Cas pour Alex (' . $quoi . ' ' . $titre . ') : ' . mb_substr($raison, 0, 200));
}

/* ====================================================================== la mémoire commune (le « second cerveau ») */
add_action('init', function () {
    register_post_type(ALED08E_CPT_NOTE, ['label' => 'Mémoire des agents', 'public' => false, 'show_ui' => false, 'supports' => ['title', 'editor'], 'rewrite' => false, 'query_var' => false]);
});
/* decision : ce qu'Alex a décidé (écrit seulement avec son accord) ; client : ce qu'il faut savoir d'un client ;
   lecon : ce qu'un agent a appris en travaillant ; journal : ce qui a été fait (effacé après 120 jours) */
function aled08e_memoire_types() { return ['decision' => 'Décision d’Alex', 'client' => 'À savoir sur un client', 'lecon' => 'Leçon apprise', 'journal' => 'Journal']; }
function aled08e_memoire_ajouter($type, $titre, $texte, $client = 0, $par = '') {
    if (!isset(aled08e_memoire_types()[$type])) return 0;
    $titre = mb_substr(sanitize_text_field((string) $titre), 0, 160);
    $texte = mb_substr(trim(wp_strip_all_tags((string) $texte)), 0, 3000);
    if ($titre === '' || $texte === '') return 0;
    $id = wp_insert_post(['post_type' => ALED08E_CPT_NOTE, 'post_status' => 'private', 'post_title' => $titre, 'post_content' => $texte], true);
    if (is_wp_error($id)) return 0;
    update_post_meta($id, '_aled08_note_type', $type);
    if ($client) update_post_meta($id, '_aled08_note_client', (int) $client);
    if ($par !== '') update_post_meta($id, '_aled08_note_par', sanitize_key($par));
    return (int) $id;
}
function aled08e_memoire_lire($args = []) {
    $q = ['post_type' => ALED08E_CPT_NOTE, 'post_status' => 'private', 'numberposts' => max(1, min(100, (int) ($args['limite'] ?? 30))), 'orderby' => 'date', 'order' => 'DESC', 'suppress_filters' => true, 'meta_query' => []];
    if (!empty($args['type'])) $q['meta_query'][] = ['key' => '_aled08_note_type', 'value' => (array) $args['type'], 'compare' => 'IN'];
    if (!empty($args['client'])) $q['meta_query'][] = ['key' => '_aled08_note_client', 'value' => (int) $args['client']];
    if (!empty($args['q'])) $q['s'] = sanitize_text_field((string) $args['q']);
    $out = [];
    foreach (get_posts($q) as $p) {
        $c = (int) get_post_meta($p->ID, '_aled08_note_client', true);
        $u = $c ? get_userdata($c) : null;
        $out[] = ['note' => (int) $p->ID, 'type' => (string) get_post_meta($p->ID, '_aled08_note_type', true), 'titre' => $p->post_title, 'texte' => $p->post_content,
            'client' => $c ?: null, 'client_nom' => $u ? $u->display_name : null, 'par' => (string) get_post_meta($p->ID, '_aled08_note_par', true), 'le' => get_the_date('j/m/Y', $p)];
    }
    return $out;
}
/* Le ménage : le journal de plus de 120 jours s'efface (les décisions, les leçons et les notes de clients restent) */
add_action('aled08_quotidien', function () {
    $vieux = get_posts(['post_type' => ALED08E_CPT_NOTE, 'post_status' => 'private', 'numberposts' => 100, 'fields' => 'ids', 'suppress_filters' => true,
        'date_query' => [['before' => '120 days ago']], 'meta_query' => [['key' => '_aled08_note_type', 'value' => 'journal']]]);
    foreach ($vieux as $id) wp_delete_post((int) $id, true);
}, 60);

/* ====================================================================== les modifications demandées par les clients */
function aled08e_agents_demandes() {
    return get_posts(['post_type' => ALED08E_CPT, 'post_status' => 'private', 'numberposts' => 60, 'orderby' => 'date', 'order' => 'ASC', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_par', 'value' => 'alex'], ['key' => '_aled08_statut', 'value' => ['recue', 'encours'], 'compare' => 'IN']]]);
}
/* À qui est la main sur une demande, un chantier ou une page, d'après son état d'agent */
function aled08e_agent_role($etat) {
    if ($etat === 'a_controler') return 'controleur';
    if ($etat === 'pour_alex') return 'alex';
    return 'constructeur';
}
function aled08e_agents_demande_ligne($p, $detail = true) {
    $pid = (int) $p->ID;
    $uid = (int) $p->post_author;
    $u = get_userdata($uid);
    $etat = (string) get_post_meta($pid, '_aled08_agent_etat', true);
    $ech = (int) get_post_meta($pid, '_aled08_echeance', true);
    $l = ['demande' => $pid, 'client' => $u ? $u->display_name : '', 'fiche' => $uid, 'titre' => $p->post_title,
        'site' => (string) (aled08e_meta($uid, 'lia_url') ?: aled08e_meta($uid, 'site')), 'site_relie' => aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== '',
        'etat' => $etat ?: 'a_faire', 'role' => aled08e_agent_role($etat), 'a_faire_avant' => $ech ? wp_date('j/m H:i', $ech) : '', 'en_retard' => $ech && time() > $ech];
    if (!$detail) return $l;
    $photos = [];
    foreach (array_filter((array) get_post_meta($pid, '_aled08_photos', true)) as $id) { $url = wp_get_attachment_url((int) $id); if ($url) $photos[] = $url; }
    $ech2 = [];
    foreach ((function_exists('aled08e_ech_retours') ? aled08e_ech_retours($pid) : []) as $r) $ech2[] = ['qui' => $r['type'] === 'question' ? 'Cerise' : 'client', 'texte' => (string) $r['texte']];
    return $l + ['demande_claire' => (string) (get_post_meta($pid, '_aled08_brief', true) ?: get_post_meta($pid, '_aled08_resume', true)), 'texte_du_client' => $p->post_content, 'photos' => $photos,
        'echanges_avec_le_client' => $ech2, 'note_de_cerise' => (string) get_post_meta($pid, '_aled08_note_cerise', true), 'entre_agents' => aled08e_agent_fil($pid)];
}
function aled08e_agents_demande_faire(WP_REST_Request $req) {
    $d = (array) $req->get_json_params();
    $pid = (int) ($d['demande'] ?? 0);
    $p = $pid ? get_post($pid) : null;
    if (!$p || $p->post_type !== ALED08E_CPT || !aled08e_agents_pour_modifs($pid)) return new WP_Error('aled08_agents', 'Demande introuvable, ou ce n’est pas une modification simple.', ['status' => 404]);
    $statut = (string) get_post_meta($pid, '_aled08_statut', true);
    if (!in_array($statut, ['recue', 'encours'], true) || get_post_meta($pid, '_aled08_par', true) !== 'alex') return new WP_Error('aled08_agents', 'Cette demande n’est pas à faire (statut ' . $statut . ').', ['status' => 409]);
    $faire = sanitize_key((string) ($d['faire'] ?? ''));
    $texte = trim(wp_strip_all_tags((string) ($d['texte'] ?? '')));
    $etat = (string) get_post_meta($pid, '_aled08_agent_etat', true);
    $accord = !empty($d['accord_alex']);
    $uid = (int) $p->post_author;
    $u = get_userdata($uid);
    $set = function ($e) use ($pid) { update_post_meta($pid, '_aled08_agent_etat', $e); };
    if ($faire === 'commencer') {
        if ($etat === 'a_controler' || $etat === 'pour_alex') return new WP_Error('aled08_agents', 'Cette demande est ' . ($etat === 'pour_alex' ? 'chez Alex' : 'au contrôle') . '.', ['status' => 409]);
        if ($statut !== 'encours') { aled08e_demande_marquer($pid, 'encours', 'Bricou : C’est parti, je m’occupe de votre demande.'); update_post_meta($pid, '_aled08_commencee_le', time()); }
        $set('en_cours');
        return new WP_REST_Response(['ok' => true, 'etat' => 'en_cours'], 200);
    }
    if ($faire === 'a_controler') {
        if ($texte === '') return new WP_Error('aled08_agents', 'Dites ce qui a été changé, et où (texte).', ['status' => 400]);
        if ($etat === 'pour_alex') return new WP_Error('aled08_agents', 'Cette demande est chez Alex.', ['status' => 409]);
        aled08e_agent_fil_ajouter($pid, 'constructeur', $texte);
        $set('a_controler');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_controler'], 200);
    }
    if ($faire === 'corriger') {
        if ($etat !== 'a_controler') return new WP_Error('aled08_agents', 'Cette demande n’est pas au contrôle.', ['status' => 409]);
        if ($texte === '') return new WP_Error('aled08_agents', 'Dites ce qu’il faut corriger (texte).', ['status' => 400]);
        aled08e_agent_fil_ajouter($pid, 'controleur', $texte);
        if (aled08e_agent_tour($pid) > 2) {
            $set('pour_alex');
            aled08e_agents_pour_alex('la demande', '#' . $pid . ' de ' . ($u ? $u->display_name : '?'), 'Le contrôle a refusé trois fois le travail fait.', "Dernier refus : " . $texte . "\n\nLa demande : " . ((string) get_post_meta($pid, '_aled08_brief', true) ?: $p->post_content));
            return new WP_REST_Response(['ok' => true, 'etat' => 'pour_alex'], 200);
        }
        $set('a_corriger');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_corriger'], 200);
    }
    if ($faire === 'faite') {
        if ($etat !== 'a_controler' && !$accord) return new WP_Error('aled08_agents', 'Une demande n’est déclarée faite qu’après le contrôle.', ['status' => 409]);
        if ($texte === '') return new WP_Error('aled08_agents', 'Écrivez le petit mot pour le client : ce qui a été fait (texte).', ['status' => 400]);
        aled08e_demande_marquer($pid, 'faite', 'Bricou : ' . $texte);
        $set('faite');
        aled08e_memoire_ajouter('journal', 'Modification faite pour ' . ($u ? $u->display_name : '#' . $uid), $p->post_title . ' : ' . $texte, $uid, 'controleur');
        return new WP_REST_Response(['ok' => true, 'etat' => 'faite', 'email_client' => true], 200);
    }
    if ($faire === 'pour_alex') {
        if ($texte === '') return new WP_Error('aled08_agents', 'Dites pourquoi ce cas est pour Alex (texte).', ['status' => 400]);
        aled08e_agent_fil_ajouter($pid, 'pour_alex', $texte);
        $set('pour_alex');
        update_post_meta($pid, '_aled08_reponse', 'Cerise : Votre demande a besoin du regard d’Alex. Il s’en occupe et vous tient au courant.');
        $photos = [];
        foreach (array_filter((array) get_post_meta($pid, '_aled08_photos', true)) as $id) { $url = wp_get_attachment_url((int) $id); if ($url) $photos[] = $url; }
        aled08e_agents_pour_alex('la demande', '#' . $pid . ' de ' . ($u ? $u->display_name : '?'), $texte,
            'Site : ' . (aled08e_meta($uid, 'site') ?: 'non renseigné') . "\n\nLa demande :\n" . ((string) get_post_meta($pid, '_aled08_brief', true) ?: $p->post_content) . ($photos ? "\n\nPhotos :\n" . implode("\n", $photos) : ''));
        return new WP_REST_Response(['ok' => true, 'etat' => 'pour_alex'], 200);
    }
    if ($faire === 'reprendre') {
        if (!$accord) return new WP_Error('aled08_agents', 'Il faut l’accord d’Alex.', ['status' => 400]);
        if ($texte !== '') aled08e_agent_fil_ajouter($pid, 'alex', $texte);
        delete_post_meta($pid, '_aled08_controle_tours');
        $set('a_corriger');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_corriger'], 200);
    }
    return new WP_Error('aled08_agents', 'À faire inconnu (commencer, a_controler, corriger, faite, pour_alex, reprendre).', ['status' => 400]);
}

/* ====================================================================== le poste d'un agent : sa fiche, son travail, la mémoire */
function aled08e_agents_passages() { $p = get_option('aled08_agents_passages', []); return is_array($p) ? $p : []; }
function aled08e_agents_travail($agent) {
    $t = ['sites' => [], 'pages_google' => [], 'modifications' => [], 'pour_alex' => []];
    // les sites commandés
    $r = aled08e_chantiers_liste(new WP_REST_Request('GET', '/aled08/v1/atelier/chantiers'));
    foreach ((array) ($r->get_data()['chantiers'] ?? []) as $c) {
        if (strpos((string) $c['ref'], 'ESSAI-') === 0) continue;
        $role = $c['role'] ?? '';
        if ($role === 'alex') $t['pour_alex'][] = ['quoi' => 'site', 'commande' => $c['commande'], 'client' => $c['activite'] ?: $c['prenom'], 'a_faire' => $c['a_faire']];
        if ($agent === 'jarvis' || $role === $agent) $t['sites'][] = $c;
    }
    // les pages de visibilité Google
    foreach (aled08e_pg_a_faire() as $p) {
        $etat = (string) get_post_meta($p->ID, '_aled08_pg_etat', true);
        $role = aled08e_agent_role($etat);
        $u = get_userdata((int) $p->post_author);
        $l = ['demande' => (int) $p->ID, 'client' => $u ? $u->display_name : '', 'titre' => $p->post_title, 'etat' => $etat ?: 'a_faire', 'role' => $role];
        if ($role === 'alex') $t['pour_alex'][] = ['quoi' => 'page Google'] + $l;
        if ($agent === 'jarvis' || $role === $agent) $t['pages_google'][] = $l;
    }
    // les modifications des clients
    if (aled08e_agents_actifs()) foreach (aled08e_agents_demandes() as $p) {
        if (!aled08e_agents_pour_modifs($p->ID)) continue;
        $l = aled08e_agents_demande_ligne($p, false);
        if ($l['role'] === 'alex') $t['pour_alex'][] = ['quoi' => 'modification'] + $l;
        if ($agent === 'jarvis' || $l['role'] === $agent) $t['modifications'][] = $l;
    }
    return $t;
}

add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/poste', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
        $agent = sanitize_key((string) $r->get_param('agent'));
        if (!in_array($agent, ALED08E_AGENTS, true)) return new WP_Error('aled08_agents', 'Agent inconnu (constructeur, controleur, jarvis, repereur, facteur, repondeur).', ['status' => 400]);
        $pass = aled08e_agents_passages();
        $avant = $pass;
        $pass[$agent] = ['le' => time(), 'bilan' => $pass[$agent]['bilan'] ?? ''];
        update_option('aled08_agents_passages', $pass, false);
        // le Repéreur et le Facteur : leur poste vient de la prospection (rien_a_faire quand elle est éteinte)
        if (in_array($agent, ALED08E_AGENTS_PROSPECTION, true)) return new WP_REST_Response(function_exists('aled08e_px_poste') ? aled08e_px_poste($agent) : ['agent' => $agent, 'rien_a_faire' => true], 200);
        $travail = aled08e_agents_travail($agent);
        $rien = !$travail['sites'] && !$travail['pages_google'] && !$travail['modifications'];
        $out = ['agent' => $agent, 'rien_a_faire' => $agent !== 'jarvis' && $rien, 'travail' => $travail];
        if ($agent === 'jarvis') {
            $pp = [];
            $pxOn = function_exists('aled08e_px_active') && aled08e_px_active();
            foreach (ALED08E_AGENTS as $a) if ($pxOn || !in_array($a, ALED08E_AGENTS_PROSPECTION, true)) $pp[$a] = isset($avant[$a]) ? ['dernier_passage' => wp_date('j/m H:i', (int) $avant[$a]['le']), 'il_y_a_heures' => round((time() - (int) $avant[$a]['le']) / 3600, 1), 'bilan' => (string) ($avant[$a]['bilan'] ?? '')] : ['dernier_passage' => 'jamais'];
            $out['passages'] = $pp;
            $out['dernier_point_envoye'] = ($x = (int) get_option('aled08_agents_point_le')) ? wp_date('j/m H:i', $x) : 'jamais';
            // la prospection par e-mail : le bilan des sept derniers jours, pour le point du lundi
            if (function_exists('aled08e_px_bilan_jarvis')) $out['prospection'] = aled08e_px_bilan_jarvis();
        }
        // la fiche de poste et la mémoire ne sont envoyées que s'il y a du travail (un passage à vide reste court)
        if (!$out['rien_a_faire']) {
            $out['fiche_de_poste'] = aled08e_regles_texte('agent-' . $agent);
            $out['a_lire_ensuite'] = 'Les règles : GET /aled08/v1/atelier/regles (la liste), puis ?fichier=NOM. Votre fiche dit lesquelles lire selon le travail.';
            $out['memoire'] = ['decisions_et_lecons' => aled08e_memoire_lire(['type' => ['decision', 'lecon'], 'limite' => 40])];
        }
        return new WP_REST_Response($out, 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/passage', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
        $d = (array) $r->get_json_params();
        $agent = sanitize_key((string) ($d['agent'] ?? ''));
        if (!in_array($agent, ALED08E_AGENTS, true)) return new WP_Error('aled08_agents', 'Agent inconnu.', ['status' => 400]);
        $pass = aled08e_agents_passages();
        $pass[$agent] = ['le' => time(), 'bilan' => mb_substr(trim(wp_strip_all_tags((string) ($d['bilan'] ?? ''))), 0, 600)];
        update_option('aled08_agents_passages', $pass, false);
        return new WP_REST_Response(['ok' => true], 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/memoire', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $type = sanitize_key((string) $r->get_param('type'));
            return new WP_REST_Response(['notes' => aled08e_memoire_lire(['type' => $type !== '' ? [$type] : [], 'client' => (int) $r->get_param('client'), 'q' => (string) $r->get_param('q'), 'limite' => (int) ($r->get_param('limite') ?: 30)]), 'types' => aled08e_memoire_types()], 200);
        }],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $d = (array) $r->get_json_params();
            if (!empty($d['supprimer'])) {
                if (empty($d['accord_alex'])) return new WP_Error('aled08_agents', 'Effacer une note demande l’accord d’Alex.', ['status' => 400]);
                $n = get_post((int) $d['supprimer']);
                if (!$n || $n->post_type !== ALED08E_CPT_NOTE) return new WP_Error('aled08_agents', 'Note introuvable.', ['status' => 404]);
                wp_delete_post($n->ID, true);
                return new WP_REST_Response(['ok' => true, 'supprimee' => (int) $n->ID], 200);
            }
            $type = sanitize_key((string) ($d['type'] ?? ''));
            if ($type === 'decision' && empty($d['accord_alex'])) return new WP_Error('aled08_agents', 'Une décision ne s’écrit qu’avec l’accord d’Alex.', ['status' => 400]);
            $client = (int) ($d['client'] ?? 0);
            if ($type === 'client' && (!$client || !get_userdata($client))) return new WP_Error('aled08_agents', 'Pour une note de client, donnez le numéro de sa fiche (client).', ['status' => 400]);
            $id = aled08e_memoire_ajouter($type, (string) ($d['titre'] ?? ''), (string) ($d['texte'] ?? ''), $client, (string) ($d['par'] ?? ''));
            if (!$id) return new WP_Error('aled08_agents', 'Il faut un type (decision, client, lecon, journal), un titre et un texte.', ['status' => 400]);
            return new WP_REST_Response(['ok' => true, 'note' => $id], 200);
        }],
    ]);
    register_rest_route('aled08/v1', '/atelier/demandes', ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function () {
        $out = [];
        if (aled08e_agents_actifs()) foreach (aled08e_agents_demandes() as $p) if (aled08e_agents_pour_modifs($p->ID)) $out[] = aled08e_agents_demande_ligne($p, true);
        return new WP_REST_Response(['demandes' => $out, 'agents_actifs' => aled08e_agents_actifs()], 200);
    }]);
    register_rest_route('aled08/v1', '/atelier/demande', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_agents_demande_faire']);
    register_rest_route('aled08/v1', '/atelier/point', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
        $d = (array) $r->get_json_params();
        $titre = mb_substr(sanitize_text_field((string) ($d['titre'] ?? '')), 0, 120) ?: 'Le point de Jarvis';
        $texte = mb_substr(trim(wp_strip_all_tags((string) ($d['texte'] ?? ''))), 0, 6000);
        if ($texte === '') return new WP_Error('aled08_agents', 'Texte manquant.', ['status' => 400]);
        // pas plus de deux points par jour : Alex n'est dérangé que quand il le faut
        $jour = wp_date('Y-m-d');
        $c = get_option('aled08_agents_point_compte', []);
        $n = (is_array($c) && ($c['jour'] ?? '') === $jour) ? (int) $c['n'] : 0;
        if ($n >= 2) return new WP_Error('aled08_agents', 'Deux points ont déjà été envoyés aujourd’hui.', ['status' => 429]);
        update_option('aled08_agents_point_compte', ['jour' => $jour, 'n' => $n + 1], false);
        update_option('aled08_agents_point_le', time(), false);
        $h = '<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#2E2A47;">' . esc_html($titre) . '</h1>';
        foreach (preg_split('/\n\s*\n/', str_replace("\r", '', $texte)) as $bloc) $h .= '<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#2E2A47;">' . nl2br(esc_html(trim($bloc))) . '</p>';
        $alt = function ($m) use ($texte) { $m->AltBody = $texte; };
        add_action('phpmailer_init', $alt, 20);
        wp_mail(aled08e_to(), 'Jarvis : ' . $titre, aled08e_mail_coque($titre, $h, 'Le point de Jarvis sur Les Minis Monstres.'),
            array_merge(['Content-Type: text/html; charset=UTF-8'], array_values(array_filter((array) aled08e_mail_headers(), function ($e) { return stripos($e, 'content-type:') !== 0; }))));
        remove_action('phpmailer_init', $alt, 20);
        return new WP_REST_Response(['ok' => true], 200);
    }]);
});

/* ====================================================================== le chien de garde : les agents passent-ils encore ? */
/* Une fois par jour. Si le constructeur ou le contrôleur n'est pas passé depuis 26 heures, Alex est prévenu (au plus tous les 3 jours). */
add_action('aled08_quotidien', function () {
    if (!aled08e_agents_actifs() || !get_option('aled08_agents_en_place')) return;
    $pass = aled08e_agents_passages();
    $muets = [];
    foreach (['constructeur', 'controleur'] as $a) if (empty($pass[$a]['le']) || time() - (int) $pass[$a]['le'] > 26 * HOUR_IN_SECONDS) $muets[] = $a;
    if (!$muets || time() - (int) get_option('aled08_agents_alerte_le') < 3 * DAY_IN_SECONDS) return;
    update_option('aled08_agents_alerte_le', time(), false);
    wp_mail(aled08e_to(), 'Les agents ne passent plus : ' . implode(', ', $muets),
        "Depuis plus d’une journée, " . (count($muets) > 1 ? 'ces agents ne sont pas passés' : 'cet agent n’est pas passé') . ' sur le site : ' . implode(', ', $muets) . ".\n\nLes sites, les pages Google et les modifications ne sont donc plus faits tout seuls.\n"
        . "Le plus souvent, la tâche planifiée a perdu son accès au site (le connecteur « Mini monstres »), ou elle est en pause. Ouvrez une conversation avec Claude et dites-le-lui : il vérifiera.\n", aled08e_mail_headers());
}, 70);
