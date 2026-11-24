<?php
/**
 * Les Minis Monstres Espace client : le questionnaire de création (« brief »).
 * Après sa commande, le client le remplit dans l'onglet « Ma commande » : nom du site, couleurs, ambiance,
 * coordonnées, photos avec description, prix ou produits, livraison… Il est prérempli avec la commande.
 * Son envoi lance la création. Les questions viennent de src/content/brief.js (data.json → « brief »).
 * Les réponses sont gardées sur la commande (_aled08_brief), et Alex les reçoit par e-mail.
 * Un administrateur peut les télécharger en JSON : ?aled08e_brief=ID (pour générer le site).
 */
defined('ABSPATH') || exit;

/* Les sections et champs du questionnaire pour un type de site */
function aled08e_brief_def($type, $cmd = null) {
    $out = [];
    foreach ((array) (aled08e_data()['brief'] ?? []) as $s) {
        if (!empty($s['types']) && !in_array($type, $s['types'], true)) continue;
        $s['champs'] = array_values(array_filter((array) $s['champs'], function ($c) use ($type, $cmd) { return (empty($c['types']) || in_array($type, $c['types'], true)) && aled08e_brief_pour_commande($c, $cmd); }));
        if ($s['champs']) $out[] = $s;
    }
    return $out;
}
/* Un champ qui dépend de la commande (siCommande) :
   'domaine_a_demander' : le client a déjà son nom de domaine mais ne l'a pas donné à la commande. S'il l'a donné,
   ou si on le lui fournit, la question ne se pose pas. */
function aled08e_brief_pour_commande($c, $cmd) {
    if (empty($c['siCommande']) || !is_array($cmd)) return true;
    if ($c['siCommande'] === 'domaine_a_demander') return !empty($cmd['domaine_mien']) && trim((string) $cmd['domaine']) === '';
    return true;
}
function aled08e_brief_get($cid) {
    $b = get_post_meta($cid, '_aled08_brief', true);
    return is_array($b) ? $b : [];
}
function aled08e_brief_images($cid) {
    $v = get_post_meta($cid, '_aled08_brief_images', true);
    return is_array($v) ? array_values(array_filter($v, function ($im) { return is_array($im) && !empty($im['id']); })) : [];
}
function aled08e_brief_le($cid) { return (string) get_post_meta($cid, '_aled08_brief_le', true); }

/* Valeurs reprises de la commande */
function aled08e_brief_prerempli($cmd, $cle) {
    $adr = trim($cmd['adresse'] . ', ' . trim($cmd['code_postal'] . ' ' . $cmd['ville']), ', ');
    $nom = trim($cmd['prenom'] . ' ' . $cmd['nom']);
    switch ($cle) {
        case 'entreprise': return $cmd['entreprise'] ?: $nom;
        case 'raison': return $cmd['entreprise'] ?: $nom;
        case 'domaine': return $cmd['domaine'] ?: 'À choisir avec Alex';
        case 'email': return $cmd['email'];
        case 'telephone': return $cmd['telephone'];
        case 'adresse_complete': return $adr;
    }
    return '';
}

/* Le champ est-il affiché, d'après les réponses (condition « si ») ? */
function aled08e_brief_visible($c, $rep) {
    if (empty($c['si'])) return true;
    $v = $rep[$c['si']['champ']] ?? '';
    $attendu = (array) $c['si']['vaut'];
    foreach ((array) $v as $x) if (in_array($x, $attendu, true)) return true;
    return false;
}

/* ---------- envoi du questionnaire ---------- */
add_action('template_redirect', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_POST['aled08e_brief'])) return;
    $uid = get_current_user_id();
    $cid = (int) ($_POST['cid'] ?? 0);
    $back = function ($m) { wp_safe_redirect(aled08e_url(['mb' => $m]) . '#commande', 303); exit; };
    if (!$uid) { wp_safe_redirect(aled08e_url(), 303); exit; }
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_aled08e_brief'] ?? '')), 'aled08e_brief_' . $cid)) $back('brief_expire');
    $cmd = aled08e_cmd_get($cid);
    if (!$cmd || (int) $cmd['user'] !== $uid || $cmd['statut'] === 'annulee') $back('brief_erreur');

    $P = wp_unslash($_POST['b'] ?? []);
    $P = is_array($P) ? $P : [];
    $rep = [];
    $propre = function ($v, $long = false) { $v = is_scalar($v) ? (string) $v : ''; return $long ? mb_substr(sanitize_textarea_field($v), 0, 3000) : mb_substr(sanitize_text_field($v), 0, 300); };
    $manque = [];
    foreach (aled08e_brief_def($cmd['type'], $cmd) as $s) {
        foreach ($s['champs'] as $c) {
            $id = $c['id'];
            switch ($c['kind']) {
                case 'texte': case 'email': case 'tel':
                    $rep[$id] = !empty($c['lectureSeule']) ? aled08e_brief_prerempli($cmd, $c['prerempli'] ?? '') : $propre($P[$id] ?? '');
                    if ($c['kind'] === 'email' && $rep[$id] !== '' && !is_email($rep[$id])) $rep[$id] = '';
                    break;
                case 'texte_long':
                    $rep[$id] = $propre($P[$id] ?? '', true);
                    break;
                case 'ouinon':
                    $rep[$id] = in_array($P[$id] ?? '', ['oui', 'non'], true) ? $P[$id] : '';
                    break;
                case 'choix':
                    $v = $propre($P[$id] ?? '');
                    $rep[$id] = in_array($v, (array) $c['options'], true) ? $v : ($v === '__autre' ? $propre($P[$id . '_autre'] ?? '') : '');
                    break;
                case 'multi':
                    $v = array_values(array_intersect((array) ($P[$id] ?? []), (array) $c['options']));
                    $autre = !empty($c['autre']) ? $propre($P[$id . '_autre'] ?? '') : '';
                    if ($autre !== '') $v[] = $autre;
                    $rep[$id] = $v;
                    break;
                case 'liste':
                    $lignes = [];
                    foreach ((array) ($P[$id] ?? []) as $l) {
                        if (!is_array($l)) continue;
                        $ligne = [];
                        foreach ((array) $c['colonnes'] as $col) $ligne[$col['id']] = $propre($l[$col['id']] ?? '', $col['kind'] === 'texte_long');
                        if (implode('', $ligne) !== '') $lignes[] = $ligne;
                        if (count($lignes) >= (int) ($c['max'] ?? 12)) break;
                    }
                    $rep[$id] = $lignes;
                    break;
            }
            if (!empty($c['requis']) && aled08e_brief_visible($c, $rep) && empty($rep[$id] ?? null) && !in_array($c['kind'], ['fichier', 'images'], true)) $manque[] = $c['label'];
        }
    }
    // les champs cachés par une condition ne sont pas gardés
    foreach (aled08e_brief_def($cmd['type'], $cmd) as $s) foreach ($s['champs'] as $c) if (!aled08e_brief_visible($c, $rep)) unset($rep[$c['id']]);
    // le nom de domaine que le client a déjà, donné ici : il rejoint sa commande
    if (!empty($rep['domaine']) && !empty($cmd['domaine_mien']) && trim((string) $cmd['domaine']) === '') {
        $d = aled08e_cmd_nettoyer_domaine($rep['domaine']);
        if ($d !== '' && aled08e_cmd_domaine_valide($d)) { update_post_meta($cid, '_aled08_domaine', $d); $rep['domaine'] = $d; }
    }

    // photos : celles déjà envoyées (description modifiable, ou à retirer), puis les nouvelles
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    $mimes = ['jpg|jpeg|jpe' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp', 'heic' => 'image/heic', 'svg' => 'image/svg+xml', 'pdf' => 'application/pdf'];
    $envoi = function ($f) use ($cid, $uid, $mimes) {
        if (!empty($f['error']) || empty($f['tmp_name']) || $f['size'] > 8 * 1024 * 1024) return 0;
        $_FILES['aled08e_brief_fichier'] = $f;
        $att = media_handle_upload('aled08e_brief_fichier', $cid, ['post_author' => $uid], ['test_form' => false, 'mimes' => $mimes]);
        return is_wp_error($att) ? 0 : (int) $att;
    };
    $images = [];
    $avant = aled08e_brief_images($cid);
    $garde = (array) wp_unslash($_POST['b_img_desc'] ?? []);
    $retire = array_map('intval', (array) ($_POST['b_img_del'] ?? []));
    foreach ($avant as $im) {
        $aid = (int) ($im['id'] ?? 0);
        if (!$aid || in_array($aid, $retire, true)) continue;
        $images[] = ['id' => $aid, 'description' => $propre($garde[$aid] ?? ($im['description'] ?? ''))];
    }
    $echec = 0;
    if (!empty($_FILES['b_img']['name']) && is_array($_FILES['b_img']['name'])) {
        $desc = (array) wp_unslash($_POST['b_img_new_desc'] ?? []);
        foreach ($_FILES['b_img']['name'] as $k => $nom) {
            if ($nom === '' || count($images) >= 10) continue;
            $aid = $envoi(['name' => $nom, 'type' => $_FILES['b_img']['type'][$k], 'tmp_name' => $_FILES['b_img']['tmp_name'][$k], 'error' => $_FILES['b_img']['error'][$k], 'size' => $_FILES['b_img']['size'][$k]]);
            if ($aid) $images[] = ['id' => $aid, 'description' => $propre($desc[$k] ?? '')]; else $echec++;
        }
    }
    update_post_meta($cid, '_aled08_brief_images', $images);
    if (!empty($_POST['b_logo_del'])) delete_post_meta($cid, '_aled08_brief_logo');
    if (!empty($_FILES['b_logo']['name'])) {
        $aid = $envoi($_FILES['b_logo']);
        if ($aid) update_post_meta($cid, '_aled08_brief_logo', $aid); else $echec++;
    }

    $premiere = aled08e_brief_le($cid) === '';
    update_post_meta($cid, '_aled08_brief', $rep);
    if ($manque) { update_post_meta($cid, '_aled08_brief_brouillon', 1); $back('brief_incomplet'); }
    delete_post_meta($cid, '_aled08_brief_brouillon');
    update_post_meta($cid, '_aled08_brief_le', current_time('mysql'));
    aled08e_cmd_journal($cid, $premiere ? 'Questionnaire de création reçu.' : 'Questionnaire de création mis à jour.');
    if ($premiere) delete_post_meta($cid, '_aled08_chantier'); elseif (aled08e_chantier_etat($cid) === 'question') update_post_meta($cid, '_aled08_chantier', 'reponse');
    if ($premiere && !(function_exists('aled08e_appel_fait') && aled08e_appel_fait($cid))) {
        // l'appel d'Alex : un seul e-mail, avec le numéro à appeler ; le feu vert se donne dans l'espace de gestion (« À appeler »)
        wp_mail(aled08e_to(), 'À appeler : ' . aled08e_cmd_nom($cmd) . ' (' . $cmd['ref'] . ')',
            'Le questionnaire de ' . aled08e_cmd_nom($cmd) . ($cmd['entreprise'] ? ' (' . $cmd['entreprise'] . ')' : '') . " est rempli.\n\n"
            . 'Appelez-le pour parler de son site : ' . ($cmd['telephone'] ?: 'pas de numéro, écrivez-lui à ' . $cmd['email']) . "\n\n"
            . "Ensuite, donnez le feu vert à la bande dans votre espace (onglet « À faire », « À appeler ») :\n" . aled08e_url() . "#accueil\n\n"
            . "Le questionnaire :\n" . aled08e_brief_texte($cid) . "\n", aled08e_mail_headers());
    } elseif (!function_exists('aled08e_chantier_auto') || !aled08e_chantier_auto()) wp_mail(aled08e_to(), ($premiere ? 'Questionnaire reçu : ' : 'Questionnaire modifié : ') . aled08e_cmd_nom($cmd) . ' (' . $cmd['ref'] . ')',
        aled08e_brief_texte($cid) . "\n\nFichier complet (pour générer le site) : " . add_query_arg('aled08e_brief', $cid, home_url('/')) . "\n", aled08e_mail_headers());
    $back($echec ? 'brief_photos' : ($premiere ? 'brief_ok' : 'brief_maj'));
}, 5);

/* ---------- les réponses en texte (e-mail) et en JSON (téléchargement administrateur) ---------- */
function aled08e_brief_texte($cid) {
    $cmd = aled08e_cmd_get($cid);
    $rep = aled08e_brief_get($cid);
    $t = aled08e_type($cmd['type']);
    $o = 'Questionnaire de création : ' . aled08e_cmd_nom($cmd) . ' (' . $cmd['ref'] . ', ' . ($t ? $t['label'] : $cmd['type']) . ")\n";
    foreach (aled08e_brief_def($cmd['type'], $cmd) as $s) {
        $o .= "\n== " . $s['titre'] . " ==\n";
        foreach ($s['champs'] as $c) {
            if ($c['kind'] === 'images') {
                foreach (aled08e_brief_images($cid) as $i => $im) $o .= '- Photo ' . ($i + 1) . ' : ' . wp_get_attachment_url($im['id']) . ($im['description'] ? ' (' . $im['description'] . ')' : '') . "\n";
                continue;
            }
            if ($c['kind'] === 'fichier') { $l = (int) get_post_meta($cid, '_aled08_brief_logo', true); $o .= $c['label'] . ' : ' . ($l ? wp_get_attachment_url($l) : 'pas de logo') . "\n"; continue; }
            if (!array_key_exists($c['id'], $rep)) continue;
            $v = $rep[$c['id']];
            if ($c['kind'] === 'liste') {
                $o .= $c['label'] . " :\n";
                foreach ((array) $v as $l) $o .= '  - ' . implode(' | ', array_filter((array) $l)) . "\n";
            } else {
                $o .= $c['label'] . ' : ' . (is_array($v) ? implode(', ', $v) : $v) . "\n";
            }
        }
    }
    return $o;
}
add_action('template_redirect', function () {
    if (empty($_GET['aled08e_brief'])) return;
    if (!current_user_can('manage_options')) { wp_safe_redirect(home_url('/')); exit; }
    $cid = (int) $_GET['aled08e_brief'];
    $cmd = aled08e_cmd_get($cid);
    if (!$cmd) { status_header(404); exit; }
    $img = [];
    foreach (aled08e_brief_images($cid) as $im) $img[] = ['url' => wp_get_attachment_url($im['id']), 'description' => $im['description'] ?? ''];
    $logo = (int) get_post_meta($cid, '_aled08_brief_logo', true);
    nocache_headers();
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="brief-' . sanitize_file_name($cmd['ref']) . '.json"');
    echo wp_json_encode([
        'commande' => ['ref' => $cmd['ref'], 'type' => $cmd['type'], 'forfait' => $cmd['forfait'], 'options' => $cmd['options'], 'domaine' => $cmd['domaine'], 'client' => aled08e_cmd_nom($cmd), 'email' => $cmd['email'], 'telephone' => $cmd['telephone']],
        'recu_le' => aled08e_brief_le($cid),
        'reponses' => aled08e_brief_get($cid),
        'logo' => $logo ? wp_get_attachment_url($logo) : null,
        'images' => $img,
        'questions' => aled08e_brief_def($cmd['type'], $cmd),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

/* ---------- le formulaire dans l'onglet « Ma commande » ---------- */
function aled08e_brief_html($cmd) {
    if ($cmd['statut'] === 'annulee') return '';
    $cid = (int) $cmd['id'];
    $rep = aled08e_brief_get($cid);
    $le = aled08e_brief_le($cid);
    $fait = $le !== '' && !get_post_meta($cid, '_aled08_brief_brouillon', true);
    $ouvert = !$fait || (isset($_GET['mb']) && strpos(sanitize_key(wp_unslash($_GET['mb'])), 'brief') === 0);
    $mb = isset($_GET['mb']) ? sanitize_key(wp_unslash($_GET['mb'])) : '';
    $msgs = [
        'brief_ok' => ['esp-empty', 'Merci ! Votre questionnaire est bien reçu. Je vous appelle très vite pour parler de votre site et de ce que vous attendez, puis la bande se met au travail.'],
        'brief_maj' => ['esp-empty', 'C’est enregistré : vos nouvelles réponses sont bien reçues.'],
        'brief_incomplet' => ['esp-warn', 'Il manque une ou plusieurs réponses obligatoires (marquées d’une étoile). Vos réponses sont gardées : complétez-les puis renvoyez.'],
        'brief_photos' => ['esp-warn', 'Vos réponses sont reçues, mais une photo n’a pas pu être envoyée (8 Mo au plus, en JPG, PNG ou WebP). Réessayez-la.'],
        'brief_expire' => ['esp-warn', 'La page avait expiré : rien n’a été perdu, renvoyez simplement le formulaire.'],
        'brief_erreur' => ['esp-warn', 'Ça n’a pas marché. Rechargez la page et réessayez.'],
    ];
    $val = function ($c) use ($rep, $cmd) {
        if (array_key_exists($c['id'], $rep)) return $rep[$c['id']];
        if (!empty($c['prerempli'])) return aled08e_brief_prerempli($cmd, $c['prerempli']);
        return $c['defaut'] ?? ($c['kind'] === 'multi' || $c['kind'] === 'liste' ? [] : '');
    };
    $n = function ($id, $suffixe = '') { return 'b[' . $id . ']' . $suffixe; };
    $champ = function ($c) use ($val, $n, $cid) {
        $id = $c['id']; $v = $val($c);
        $req = !empty($c['requis']);
        $lab = esc_html($c['label']) . ($req ? ' <span class="bf-req" aria-hidden="true">*</span>' : '');
        $aide = !empty($c['aide']) ? '<small class="field-hint">' . esc_html($c['aide']) . '</small>' : '';
        $si = !empty($c['si']) ? ' data-si="' . esc_attr($c['si']['champ']) . '" data-si-vaut="' . esc_attr(wp_json_encode((array) $c['si']['vaut'])) . '"' : '';
        $h = '<div class="field bf-champ bf-k-' . esc_attr($c['kind']) . '"' . $si . ' data-champ="' . esc_attr($id) . '">';
        switch ($c['kind']) {
            case 'texte': case 'email': case 'tel':
                $type = $c['kind'] === 'texte' ? 'text' : $c['kind'];
                $h .= '<label for="bf-' . esc_attr($id) . '">' . $lab . '</label><input id="bf-' . esc_attr($id) . '" type="' . $type . '" name="' . esc_attr($n($id)) . '" value="' . esc_attr((string) $v) . '" maxlength="300"' . (!empty($c['lectureSeule']) ? ' readonly' : '') . ($req ? ' required' : '') . '>' . $aide;
                break;
            case 'texte_long':
                $h .= '<label for="bf-' . esc_attr($id) . '">' . $lab . '</label><textarea id="bf-' . esc_attr($id) . '" name="' . esc_attr($n($id)) . '" rows="3" maxlength="3000"' . ($req ? ' required' : '') . '>' . esc_textarea((string) $v) . '</textarea>' . $aide;
                break;
            case 'ouinon':
                $h .= '<fieldset><legend>' . $lab . '</legend><div class="bf-pills">';
                foreach (['oui' => 'Oui', 'non' => 'Non'] as $k => $l) $h .= '<label class="bf-pill"><input type="radio" name="' . esc_attr($n($id)) . '" value="' . $k . '"' . checked($v, $k, false) . '><span>' . $l . '</span></label>';
                $h .= '</div>' . $aide . '</fieldset>';
                break;
            case 'choix': case 'multi':
                $multi = $c['kind'] === 'multi';
                $vals = (array) $v;
                $autreVal = '';
                foreach ($vals as $x) if (!in_array($x, (array) $c['options'], true)) $autreVal = $x;
                $h .= '<fieldset><legend>' . $lab . '</legend><div class="bf-pills">';
                foreach ((array) $c['options'] as $o) $h .= '<label class="bf-pill"><input type="' . ($multi ? 'checkbox' : 'radio') . '" name="' . esc_attr($n($id, $multi ? '[]' : '')) . '" value="' . esc_attr($o) . '"' . (in_array($o, $vals, true) ? ' checked' : '') . '><span>' . esc_html($o) . '</span></label>';
                if (!empty($c['autre'])) {
                    if (!$multi) $h .= '<label class="bf-pill"><input type="radio" name="' . esc_attr($n($id)) . '" value="__autre"' . ($autreVal !== '' ? ' checked' : '') . '><span>Autre</span></label>';
                    $h .= '</div><input class="bf-autre" type="text" name="' . esc_attr($n($id . '_autre')) . '" value="' . esc_attr($autreVal) . '" placeholder="Autre : précisez" maxlength="300" aria-label="' . esc_attr($c['label'] . ', autre') . '">';
                } else {
                    $h .= '</div>';
                }
                $h .= $aide . '</fieldset>';
                break;
            case 'liste':
                $lignes = (array) $v;
                $max = (int) ($c['max'] ?? 8);
                $h .= '<fieldset><legend>' . $lab . '</legend>' . $aide . '<div class="bf-liste" data-liste>';
                for ($i = 0; $i < $max; $i++) {
                    $l = $lignes[$i] ?? [];
                    $vide = !$l;
                    $h .= '<div class="bf-ligne"' . ($vide && $i >= max(2, count($lignes)) ? ' hidden' : '') . '>';
                    foreach ((array) $c['colonnes'] as $col) {
                        $nm = $n($id, '[' . $i . '][' . $col['id'] . ']');
                        $h .= '<label><span>' . esc_html($col['label']) . '</span>' . ($col['kind'] === 'texte_long'
                            ? '<textarea name="' . esc_attr($nm) . '" rows="2" maxlength="3000">' . esc_textarea($l[$col['id']] ?? '') . '</textarea>'
                            : '<input type="text" name="' . esc_attr($nm) . '" value="' . esc_attr($l[$col['id']] ?? '') . '" maxlength="300">') . '</label>';
                    }
                    $h .= '</div>';
                }
                $h .= '</div><button type="button" class="btn btn-light btn-sm" data-liste-plus>' . aled08e_icon('plus') . '<span>Ajouter une ligne</span></button></fieldset>';
                break;
            case 'fichier':
                $logo = (int) get_post_meta($cid, '_aled08_brief_logo', true);
                $h .= '<label for="bf-' . esc_attr($id) . '">' . $lab . '</label>';
                if ($logo) $h .= '<div class="bf-logo"><img src="' . esc_url(wp_get_attachment_image_url($logo, 'thumbnail') ?: wp_get_attachment_url($logo)) . '" alt="Votre logo" loading="lazy"><label class="bq-check"><input type="checkbox" name="b_logo_del" value="1"><span>Retirer ce logo</span></label></div>';
                $h .= '<input id="bf-' . esc_attr($id) . '" type="file" name="b_logo" accept="image/*,.svg,.pdf">' . $aide;
                break;
            case 'images':
                $max = (int) ($c['max'] ?? 10);
                $deja = aled08e_brief_images($cid);
                $h .= '<fieldset><legend>' . $lab . '</legend>' . $aide . '<div class="bf-images">';
                foreach ($deja as $im) {
                    $aid = (int) $im['id'];
                    $h .= '<div class="bf-img"><img src="' . esc_url(wp_get_attachment_image_url($aid, 'thumbnail') ?: wp_get_attachment_url($aid)) . '" alt="" loading="lazy"><input type="text" name="b_img_desc[' . $aid . ']" value="' . esc_attr($im['description'] ?? '') . '" placeholder="Description de la photo" maxlength="300" aria-label="Description de la photo"><label class="bq-check"><input type="checkbox" name="b_img_del[]" value="' . $aid . '"><span>Retirer</span></label></div>';
                }
                $h .= '</div><div class="bf-liste" data-liste>';
                for ($i = 0; $i < max(0, $max - count($deja)); $i++) {
                    $h .= '<div class="bf-ligne bf-ligne-img"' . ($i >= 2 ? ' hidden' : '') . '><label><span>Photo</span><input type="file" name="b_img[]" accept="image/*"></label><label><span>Description</span><input type="text" name="b_img_new_desc[]" placeholder="Ex. : le bouquet de mariée rose" maxlength="300"></label></div>';
                }
                $h .= '</div>' . (count($deja) < $max ? '<button type="button" class="btn btn-light btn-sm" data-liste-plus>' . aled08e_icon('image-plus') . '<span>Ajouter une photo</span></button>' : '') . '</fieldset>';
                break;
        }
        return $h . '</div>';
    };
    $t = aled08e_type($cmd['type']);
    ob_start();
    ?>
<section class="bf" id="questionnaire">
  <div class="bf-head">
    <span class="bf-ico"><?php echo aled08e_icon($fait ? 'circle-check' : 'clipboard-check'); // phpcs:ignore ?></span>
    <div>
      <h3>Votre questionnaire de création</h3>
      <p><?php echo $fait
          ? 'Reçu le ' . esc_html(aled08e_date($le)) . '. ' . (function_exists('aled08e_appel_fait') && !aled08e_appel_fait($cid) ? 'Je vous appelle très vite' . ($cmd['telephone'] ? ' au ' . esc_html($cmd['telephone']) : '') . ' pour parler de votre site, puis la bande se met au travail. ' : '') . 'Vous pouvez encore modifier vos réponses : je travaille toujours avec la dernière version.'
          : 'Avec lui, puis un petit appel ensemble, on lance la création. Couleurs, ambiance, photos' . ($cmd['type'] === 'boutique' ? ', produits, livraison' : ', prix') . ' : avec vos réponses, je crée votre ' . esc_html(mb_strtolower($t ? $t['label'] : 'site')) . '. Comptez une dizaine de minutes.'; ?></p>
    </div>
    <?php if (!$fait) echo '<em class="st st-new">À remplir</em>'; else echo '<em class="st st-done">Reçu</em>'; ?>
  </div>
  <?php if (isset($msgs[$mb])) echo '<p class="' . esc_attr($msgs[$mb][0]) . '" role="status">' . esc_html($msgs[$mb][1]) . '</p>'; ?>
  <details class="bf-details"<?php echo $ouvert ? ' open' : ''; ?>>
    <summary><?php echo $fait ? 'Voir ou modifier mes réponses' : 'Remplir le questionnaire'; ?></summary>
    <form class="form esp-form bf-form" method="post" action="<?php echo esc_url(aled08e_url()); ?>" enctype="multipart/form-data">
      <?php wp_nonce_field('aled08e_brief_' . $cid, '_aled08e_brief'); ?>
      <input type="hidden" name="cid" value="<?php echo $cid; ?>">
      <?php foreach (aled08e_brief_def($cmd['type'], $cmd) as $i => $s) : ?>
      <fieldset class="bf-section">
        <legend><span class="bf-num"><?php echo (int) $i + 1; ?></span><?php echo aled08e_icon($s['icon'] ?? 'check'); // phpcs:ignore ?><?php echo esc_html($s['titre']); ?></legend>
        <?php foreach ($s['champs'] as $c) echo $champ($c); // phpcs:ignore ?>
      </fieldset>
      <?php endforeach; ?>
      <p class="field-hint">* réponse obligatoire. Vous pourrez modifier vos réponses ensuite.</p>
      <button class="btn btn-primary" type="submit" name="aled08e_brief" value="1"><?php echo aled08e_icon('send'); // phpcs:ignore ?><span><?php echo $fait ? 'Enregistrer mes réponses' : 'Envoyer et lancer la création'; ?></span></button>
    </form>
  </details>
</section>
<script>
(function () {
  var f = document.querySelector('.bf-form');
  if (!f) return;
  function valeurs(nom) {
    return Array.prototype.slice.call(f.querySelectorAll('[name="b[' + nom + ']"], [name="b[' + nom + '][]"]')).filter(function (i) { return (i.type !== 'radio' && i.type !== 'checkbox') || i.checked; }).map(function (i) { return i.value; });
  }
  function maj() {
    f.querySelectorAll('[data-si]').forEach(function (el) {
      var att = JSON.parse(el.getAttribute('data-si-vaut') || '[]'), v = valeurs(el.getAttribute('data-si'));
      el.hidden = !v.some(function (x) { return att.indexOf(x) > -1; });
    });
  }
  f.addEventListener('change', maj); maj();
  f.querySelectorAll('[data-liste-plus]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.parentNode.querySelector('[data-liste]'); if (!l) return;
      var h = l.querySelector('.bf-ligne[hidden]');
      if (h) { h.hidden = false; var i = h.querySelector('input,textarea'); if (i) i.focus(); }
      if (!l.querySelector('.bf-ligne[hidden]')) b.hidden = true;
    });
  });
})();
</script>
    <?php
    return ob_get_clean();
}
