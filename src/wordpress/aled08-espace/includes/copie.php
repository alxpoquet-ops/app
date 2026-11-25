<?php
/**
 * « Télécharger mon site » (25 novembre 2026, demande d'Alex : « c'est son site »). Dans Mon site, rubrique « Télécharger » :
 * le client choisit le format (pages HTML et CSS, ou WordPress complet), clique, et le zip se télécharge tout seul.
 * Le zip est fabriqué sur le serveur de SON site par le connecteur (action signée « copie », alexlia-connecteur/copie.php),
 * puis le navigateur le récupère directement là-bas (adresse impossible à deviner, effacée au bout de 2 heures).
 * Une copie toutes les 5 minutes au plus par client. Si le connecteur du site est trop ancien pour la copie, Alex est prévenu
 * et le client reçoit sa copie par e-mail.
 */
defined('ABSPATH') || exit;

function aled08e_copie_possible($uid) { return aled08e_meta($uid, 'lia_url') !== '' && aled08e_meta($uid, 'lia_secret') !== ''; }

function aled08e_copie_html($uid) {
    $h = '<div class="cp-copie">';
    $h .= '<h3 class="app-sub">Télécharger mon site</h3>';
    if (!aled08e_copie_possible($uid)) {
        return $h . '<p class="esp-empty">Votre site n’est pas encore en ligne. Dès qu’il le sera, vous pourrez en télécharger une copie complète ici, quand vous voulez.</p></div>';
    }
    $h .= '<p>Votre site est à vous. Récupérez-en une copie complète, avec toutes vos pages et toutes vos images, dans un fichier zip. Choisissez le format :</p>';
    $h .= '<form class="cp-form" data-cp-form>'
        . '<input type="hidden" name="_cp" value="' . esc_attr(wp_create_nonce('aled08e_copie')) . '">'
        . '<div class="cp-choix">'
        . '<label class="cp-carte c-sky"><input type="radio" name="format" value="html" checked><span class="cp-ico">' . aled08e_icon('globe') . '</span><span><strong>Pages HTML et CSS</strong><small>Votre site tel qu’on le voit : les pages, les styles, les images. Il s’ouvre sur n’importe quel ordinateur et se pose chez n’importe quel hébergeur. Le formulaire de contact et la boutique n’y fonctionnent pas.</small></span></label>'
        . '<label class="cp-carte c-lilac"><input type="radio" name="format" value="wordpress"><span class="cp-ico">' . aled08e_icon('layers') . '</span><span><strong>WordPress complet</strong><small>Tout le site, avec sa base de données : pour le réinstaller tel quel chez un autre hébergeur, boutique comprise. Le fichier est plus lourd.</small></span></label>'
        . '</div>'
        . '<button class="btn btn-primary cp-go" type="submit">' . aled08e_icon('download') . '<span>Télécharger mon site</span></button>'
        . '<p class="cp-etat" data-cp-etat role="status" hidden></p>'
        . '</form>';
    $h .= '<p class="cp-note">' . aled08e_icon('info') . '<span>Chaque zip contient un fichier « LISEZ-MOI » qui explique quoi en faire. Pour votre sécurité, la copie WordPress ne contient aucun mot de passe du serveur.</span></p>';
    $h .= '<script>(function(){var f=document.querySelector("[data-cp-form]");if(!f||f.dataset.pret)return;f.dataset.pret=1;var e=f.querySelector("[data-cp-etat]"),b=f.querySelector(".cp-go");'
        . 'function dire(t,ok){e.hidden=false;e.className="cp-etat"+(ok===false?" is-err":ok?" is-ok":" is-attente");e.textContent=t;}'
        . 'f.addEventListener("submit",function(ev){ev.preventDefault();if(b.disabled)return;b.disabled=true;var fd=new FormData(f);fd.append("action","aled08e_copie");'
        . 'dire(fd.get("format")==="wordpress"?"On prépare votre copie WordPress… Cela peut prendre quelques minutes : gardez cette page ouverte.":"On prépare votre copie… Cela prend en général moins d’une minute.");'
        . 'fetch(' . wp_json_encode(admin_url('admin-ajax.php')) . ',{method:"POST",body:fd,credentials:"same-origin"}).then(function(r){return r.json();}).then(function(j){b.disabled=false;'
        . 'if(j&&j.success&&j.data.url){dire("C’est prêt ("+j.data.taille+") : le téléchargement démarre. Il ne démarre pas ? ",true);var a=document.createElement("a");a.href=j.data.url;a.textContent="Cliquez ici";a.setAttribute("download","");e.appendChild(a);e.appendChild(document.createTextNode(". Le lien reste valable 2 heures."));location.href=j.data.url;}'
        . 'else if(j&&j.success){dire(j.data.message,true);}else{dire((j&&j.data&&j.data.message)||"Ça n’a pas marché. Réessayez dans un instant.",false);}})'
        . '.catch(function(){b.disabled=false;dire("La préparation prend plus de temps que prévu. Réessayez dans quelques minutes.",false);});});})();</script>';
    return $h . '</div>';
}

function aled08e_copie_taille($o) {
    if ($o >= 1073741824) return number_format_i18n($o / 1073741824, 1) . ' Go';
    if ($o >= 1048576) return number_format_i18n($o / 1048576, 1) . ' Mo';
    return number_format_i18n(max(1, $o / 1024), 0) . ' Ko';
}

add_action('wp_ajax_aled08e_copie', function () {
    $non = function ($m) { wp_send_json_error(['message' => $m]); };
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_cp'] ?? '')), 'aled08e_copie')) $non('La page a expiré : rechargez-la, puis réessayez.');
    $uid = get_current_user_id();
    if (!$uid || !aled08e_copie_possible($uid)) $non('Votre site n’est pas encore relié à votre espace : la copie sera possible dès sa mise en ligne.');
    $format = ($_POST['format'] ?? '') === 'wordpress' ? 'wordpress' : 'html';
    $cle = 'aled08e_copie_' . $uid;
    if (get_transient($cle)) $non('Une copie vient d’être préparée. Attendez quelques minutes avant d’en demander une autre.');
    set_transient($cle, 1, 5 * MINUTE_IN_SECONDS);
    if (function_exists('set_time_limit')) @set_time_limit(620);
    $r = aled08e_lia_appel($uid, 'copie', ['format' => $format]);
    $u = get_userdata($uid);
    $fmt = $format === 'wordpress' ? 'WordPress complet' : 'pages HTML et CSS';
    if (is_wp_error($r)) {
        $m = $r->get_error_message();
        if (stripos($m, 'Action inconnue') !== false) {
            // le connecteur du site est d'une version sans la copie : Alex le met à jour et envoie la copie
            wp_mail(aled08e_to(), 'Copie du site demandée : ' . ($u ? $u->display_name : '#' . $uid),
                'Le client demande une copie de son site (' . $fmt . '), mais le connecteur de son site est trop ancien pour la faire tout seul.' . "\n\nSite : " . aled08e_meta($uid, 'lia_url') . "\nClient : " . ($u ? $u->display_name . ' <' . $u->user_email . '>' : '#' . $uid) . "\n\nMettez à jour l’extension « Les Minis Monstres : connecteur » (version 2.15.0 ou plus) sur son site, puis il pourra la télécharger lui-même. En attendant, envoyez-lui sa copie par e-mail.\n", aled08e_mail_headers());
            if (function_exists('aled08e_lia_journal_add')) aled08e_lia_journal_add('Copie demandée par ' . ($u ? $u->display_name : '#' . $uid) . ' : connecteur trop ancien, Alex prévenu.');
            wp_send_json_success(['message' => 'C’est noté : nous préparons votre copie (' . $fmt . ') et nous vous l’envoyons par e-mail.']);
        }
        delete_transient($cle);
        $non('La copie n’a pas pu être préparée : ' . $m);
    }
    $url = (string) ($r['url'] ?? '');
    $hote = strtolower((string) wp_parse_url(aled08e_meta($uid, 'lia_url'), PHP_URL_HOST));
    $h2 = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    if ($url === '' || !preg_match('#^https?://#', $url) || ($h2 !== $hote && 'www.' . $h2 !== $hote && $h2 !== 'www.' . $hote)) { delete_transient($cle); $non('La copie n’a pas pu être préparée. Réessayez dans un instant.'); }
    if (function_exists('aled08e_lia_journal_add')) aled08e_lia_journal_add('Copie du site (' . $fmt . ') téléchargée par ' . ($u ? $u->display_name : '#' . $uid) . ', ' . aled08e_copie_taille((int) ($r['taille'] ?? 0)) . '.');
    wp_send_json_success(['url' => esc_url_raw($url), 'taille' => aled08e_copie_taille((int) ($r['taille'] ?? 0))]);
});
