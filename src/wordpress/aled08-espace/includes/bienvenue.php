<?php
/**
 * Les Minis Monstres Espace client : l'e-mail de bienvenue d'un client, aux couleurs du site.
 * Il rappelle son offre et lui donne ses identifiants. Envoyé une seule fois, à la demande d'Alex :
 * une note temporaire (option aled08e_bienvenue_envoi : compte, mot de passe, remise à zéro des demandes) est lue,
 * effacée tout de suite, puis l'e-mail part. Le mot de passe n'est jamais gardé ni écrit dans un journal.
 */
defined('ABSPATH') || exit;

function aled08e_bienvenue_expediteur() { return (string) apply_filters('aled08e_bienvenue_from', 'contact@lesminismonstres.fr'); }

/* L'e-mail, en HTML (tableaux et styles en ligne : c'est ce que les messageries affichent bien) */
function aled08e_bienvenue_html($u, $mdp) {
    $D = aled08e_data();
    $uid = (int) $u->ID;
    $prenom = aled08e_prenom($u);
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $boutique = aled08e_est_boutique($uid);
    $type = null;
    foreach ((array) ($D['types'] ?? []) as $t) if (($t['id'] ?? '') === ($boutique ? 'boutique' : 'vitrine')) $type = $t;
    $dom = function_exists('aled08e_domaine_mensuel') ? (float) aled08e_domaine_mensuel($uid) : 0.0;
    $prix = (float) ($f['month'] ?? 10) + $dom;
    $site = (string) aled08e_meta($uid, 'site');
    $host = $site ? preg_replace('/^www\./', '', (string) wp_parse_url($site, PHP_URL_HOST)) : '';
    $espace = aled08e_url();
    $logo = get_template_directory_uri() . '/assets/img/logo-192.png';
    $e = 'esc_html';
    $ligne = function ($txt) { return '<tr><td style="padding:5px 0;font-size:15px;line-height:1.5;color:#ECE9FF;"><span style="color:#7BDDB1;font-weight:bold;">&#10003;</span>&nbsp; ' . esc_html($txt) . '</td></tr>'; };
    $carte = function ($fond, $bord, $contenu) { return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:' . $fond . ';border:2px solid ' . $bord . ';border-radius:22px;"><tr><td style="padding:20px 22px;">' . $contenu . '</td></tr></table>'; };

    $inclusSite = $type ? array_slice((array) ($type['inclus'] ?? []), 1, 5) : [];
    $inclusForfait = array_values(array_filter((array) ($f['main'] ?? []), function ($x) { return strpos($x, 'Nom de domaine fourni') !== 0; }));

    $h = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenue chez les Minis Monstres</title></head>'
        . '<body style="margin:0;padding:0;background:#16142A;">'
        . '<div style="display:none;max-height:0;overflow:hidden;">Votre espace client est prêt : vos identifiants et votre offre sont juste ici.</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#16142A;"><tr><td align="center" style="padding:24px 12px;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;color:#ECE9FF;">'
        . '<tr><td align="center" style="padding:6px 0 18px;"><img src="' . esc_url($logo) . '" width="76" height="76" alt="Les Minis Monstres" style="display:block;border:0;border-radius:20px;"><p style="margin:10px 0 0;font-size:15px;font-weight:bold;letter-spacing:.02em;color:#FF8EBF;">Les Minis Monstres</p></td></tr>'
        . '<tr><td style="background:#232040;border-radius:28px;padding:28px 22px;">'
        . '<h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:#FFFFFF;">Bienvenue dans la famille, ' . $e($prenom) . ' !</h1>'
        . '<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#CFCBEA;">Toute la petite bande est ravie de vous accueillir. Votre espace client est prêt : c’est votre coin à vous, pour gérer votre site et votre boutique, tranquillement, depuis votre téléphone.</p>'
        // les identifiants
        . $carte('#1E3A32', '#7BDDB1',
            '<p style="margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#7BDDB1;">Vos identifiants</p>'
            . '<p style="margin:0 0 6px;font-size:15px;color:#CFCBEA;">Votre e-mail</p><p style="margin:0 0 12px;font-size:18px;font-weight:bold;color:#FFFFFF;">' . $e($u->user_email) . '</p>'
            . '<p style="margin:0 0 6px;font-size:15px;color:#CFCBEA;">Votre mot de passe</p><p style="margin:0 0 16px;font-size:18px;font-weight:bold;color:#FFFFFF;font-family:Consolas,Menlo,monospace;">' . $e($mdp) . '</p>'
            . '<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#7BDDB1;"><a href="' . esc_url($espace) . '" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:bold;color:#16142A;text-decoration:none;">Ouvrir mon espace client</a></td></tr></table>'
            . '<p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#A9D9C5;">Vous pouvez changer votre mot de passe quand vous voulez, dans « Mon compte ».</p>')
        // l'offre
        . '<h2 style="margin:8px 0 12px;font-size:19px;color:#FFFFFF;">Votre offre, en clair</h2>'
        . $carte('#3A2333', '#FF8EBF',
            '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#FF8EBF;">Votre site</p>'
            . '<p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:#FFFFFF;">' . $e($type['name'] ?? 'Votre site') . '</p>'
            . ($host ? '<p style="margin:0 0 10px;font-size:15px;color:#F3C4DA;">' . $e($host) . '</p>' : '')
            . '<table role="presentation" cellpadding="0" cellspacing="0">' . implode('', array_map($ligne, $inclusSite)) . '</table>')
        . $carte('#1E3A32', '#7BDDB1',
            '<p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#7BDDB1;">Votre forfait</p>'
            . '<p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:#FFFFFF;">Forfait ' . $e($f['name'] ?? 'Mini') . ', nom de domaine compris</p>'
            . '<p style="margin:0 0 10px;font-size:15px;color:#A9D9C5;">' . $e(aled08e_euro_txt($prix)) . ' par mois, sans engagement</p>'
            . '<table role="presentation" cellpadding="0" cellspacing="0">' . implode('', array_map($ligne, array_merge($inclusForfait, $dom > 0 ? ['Votre nom de domaine, fourni et renouvelé pour vous'] : []))) . '</table>')
        // la bande
        . '<h2 style="margin:8px 0 12px;font-size:19px;color:#FFFFFF;">Qui fait quoi ?</h2>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">'
        . '<tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#CFCBEA;"><b style="color:#FFFFFF;">Cerise</b> répond à vos questions, dans la petite bulle en bas de l’écran.</td></tr>'
        . '<tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#CFCBEA;"><b style="color:#FFFFFF;">Bricou</b> prépare vos demandes de modification, puis Alex les fait.</td></tr>'
        . ($boutique ? '<tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#CFCBEA;"><b style="color:#FFFFFF;">Mochi</b> range votre boutique : articles, catégories, commandes.</td></tr>' : '')
        . '<tr><td style="padding:6px 0;font-size:15px;line-height:1.5;color:#CFCBEA;"><b style="color:#FFFFFF;">Pépite</b> vous présente les extras, si un jour vous en avez envie.</td></tr>'
        . '</table>'
        . '<p style="margin:0 0 6px;font-size:16px;line-height:1.6;color:#CFCBEA;">Une question ? Répondez simplement à cet e-mail : on vous lit, et on vous répond.</p>'
        . '<p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:#FFFFFF;">À très vite,<br><b>Alex et les Minis Monstres</b></p>'
        . '</td></tr>'
        . '<tr><td align="center" style="padding:18px 10px 0;font-size:12px;line-height:1.5;color:#8B86B3;">Les Minis Monstres, sites internet pour artisans et commerçants.<br>Gardez cet e-mail : il contient vos identifiants.</td></tr>'
        . '</table></td></tr></table></body></html>';
    return $h;
}

/* La version texte, pour les messageries qui n'affichent pas le HTML */
function aled08e_bienvenue_texte($u, $mdp) {
    $uid = (int) $u->ID;
    $f = aled08e_forfait(aled08e_meta($uid, 'forfait'));
    $dom = function_exists('aled08e_domaine_mensuel') ? (float) aled08e_domaine_mensuel($uid) : 0.0;
    return 'Bienvenue dans la famille, ' . aled08e_prenom($u) . " !\n\nVotre espace client est prêt : " . aled08e_url() . "\n\nVotre e-mail : " . $u->user_email . "\nVotre mot de passe : " . $mdp
        . "\n\nVotre offre : " . (aled08e_est_boutique($uid) ? 'Site Boutique' : 'votre site') . ', avec le forfait ' . ($f['name'] ?? 'Mini') . ', nom de domaine compris (' . aled08e_euro_txt((float) ($f['month'] ?? 10) + $dom) . " par mois, sans engagement).\n\nUne question ? Répondez à cet e-mail.\n\nÀ très vite,\nAlex et les Minis Monstres\n";
}

function aled08e_bienvenue_envoyer($uid, $mdp) {
    $u = get_userdata((int) $uid);
    if (!$u || !is_email($u->user_email)) return false;
    $from = aled08e_bienvenue_expediteur();
    $texte = aled08e_bienvenue_texte($u, $mdp);
    $alt = function ($phpmailer) use ($texte) { $phpmailer->AltBody = $texte; };
    $adr = function () use ($from) { return $from; };
    $nom = function () { return 'Les Minis Monstres'; };
    add_action('phpmailer_init', $alt);
    add_filter('wp_mail_from', $adr, 99);
    add_filter('wp_mail_from_name', $nom, 99);
    $ok = wp_mail($u->user_email, 'Bienvenue chez les Minis Monstres, ' . aled08e_prenom($u) . ' !', aled08e_bienvenue_html($u, $mdp), ['Content-Type: text/html; charset=UTF-8', 'Reply-To: "Les Minis Monstres" <' . $from . '>']);
    remove_action('phpmailer_init', $alt);
    remove_filter('wp_mail_from', $adr, 99);
    remove_filter('wp_mail_from_name', $nom, 99);
    return (bool) $ok;
}

/* Remettre à zéro l'historique des demandes d'un client (corbeille : récupérable 30 jours) */
function aled08e_demandes_vider($uid) {
    $ids = get_posts(['post_type' => ALED08E_CPT, 'post_status' => 'any', 'author' => (int) $uid, 'numberposts' => 500, 'fields' => 'ids', 'suppress_filters' => true]);
    foreach ($ids as $id) wp_trash_post((int) $id);
    delete_user_meta((int) $uid, 'aled08_jl_journal');
    delete_user_meta((int) $uid, 'aled08_msg_ecartes');
    return count($ids);
}

/* Le déclencheur, une seule fois : la note est effacée avant tout le reste */
add_action('init', function () {
    $n = get_option('aled08e_bienvenue_envoi');
    if (!is_array($n) || empty($n['uid'])) return;
    delete_option('aled08e_bienvenue_envoi');
    $uid = (int) $n['uid'];
    $res = ['uid' => $uid, 'le' => wp_date('Y-m-d H:i:s')];
    if (!empty($n['vider'])) $res['demandes_retirees'] = aled08e_demandes_vider($uid);
    $res['mail'] = !empty($n['mdp']) ? aled08e_bienvenue_envoyer($uid, (string) $n['mdp']) : null;
    update_option('aled08e_bienvenue_resultat', $res, false);
}, 40);
