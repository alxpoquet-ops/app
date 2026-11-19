<?php
/**
 * Plugin Name: Les Minis Monstres : mention « Site fait par »
 * Description: Ajoute en bas du site la mention « Site fait et entretenu par les Minis Monstres », avec le logo et un lien.
 * Version: 1.4.0
 * Author: Les Minis Monstres
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

if (!defined('ALEXLIA_CREDIT_URL')) define('ALEXLIA_CREDIT_URL', 'https://www.les-minis-monstres.fr/');

/* La mention : texte, logo (la petite fenêtre de site à cornes) et lien, puis l'année. */
function alexlia_credit_html() {
    $logo = '<svg width="24" height="24" style="flex:none" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g transform="translate(2 4) scale(.5)"><g fill="#fff" stroke="#fff" stroke-width="15" stroke-linejoin="round"><path d="M26 24L16 0l26 16ZM94 24l10-24-26 16Z"/><rect x="10" y="16" width="100" height="96" rx="26"/></g><path d="M26 24L16 0l26 16ZM94 24l10-24-26 16Z" fill="#FFD75E" stroke="#2E2A47" stroke-width="5" stroke-linejoin="round"/><rect x="10" y="16" width="100" height="96" rx="26" fill="#FF8EBF" stroke="#2E2A47" stroke-width="6"/><path d="M10 42a26 26 0 0 1 26-26h48a26 26 0 0 1 26 26v2H10Z" fill="#FFF6EF" stroke="#2E2A47" stroke-width="6" stroke-linejoin="round"/><circle cx="30" cy="31" r="4.5" fill="#FF8EBF"/><circle cx="44" cy="31" r="4.5" fill="#FFD75E"/><circle cx="58" cy="31" r="4.5" fill="#7BDDB1"/><ellipse cx="42" cy="68" rx="7.5" ry="9" fill="#2E2A47"/><circle cx="44.6" cy="64.4" r="3" fill="#fff"/><ellipse cx="78" cy="68" rx="7.5" ry="9" fill="#2E2A47"/><circle cx="80.6" cy="64.4" r="3" fill="#fff"/><ellipse cx="27" cy="86" rx="8" ry="4.6" fill="#fff" opacity=".6"/><ellipse cx="93" cy="86" rx="8" ry="4.6" fill="#fff" opacity=".6"/><path d="M50 86q5 7 10 0q5 7 10 0" fill="none" stroke="#2E2A47" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
    return 'Site fait et entretenu par <a href="' . esc_url(ALEXLIA_CREDIT_URL) . '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;vertical-align:middle">' . $logo . '<span style="text-decoration:underline">les Minis Monstres</span></a> ' . esc_html(wp_date('Y'));
}

/* La mention est écrite dans la page ; un petit script la range dans le pied de page du thème quand il en a un. */
add_action('wp_footer', function () {
    $ou = apply_filters('alexlia_credit_cibles', '.site-footer .footer-bottom, .soon-foot, footer');
    echo '<p class="alexlia-credit" style="margin:0;padding:10px 16px 16px;text-align:center;font-size:.85rem;opacity:.85">' . alexlia_credit_html() . '</p>' . "\n";
    echo '<script>(function(){var c=document.querySelector(".alexlia-credit"),f=document.querySelector(' . wp_json_encode($ou) . ');'
        . 'if(!c||!f)return;c.style.padding="8px 0 0";c.style.flexBasis="100%";c.style.width="100%";'
        . 'if(f.tagName==="P")f.insertAdjacentElement("afterend",c);else f.appendChild(c);})();</script>' . "\n";
}, 99);

/* Une page servie sans wp_footer (page d'attente « Bientôt en ligne » par exemple) reçoit la mention quand même. */
add_action('template_redirect', function () {
    if (is_admin() || is_feed() || wp_doing_ajax()) return;
    ob_start(function ($html) {
        if (!is_string($html) || $html === '' || strpos($html, 'alexlia-credit') !== false || stripos($html, '</body>') === false) return $html;
        $mention = alexlia_credit_html();
        $n = 0;
        $out = preg_replace('#(<p class="soon-foot">.*?</p>)#s', '$1' . "\n" . '<p class="soon-foot alexlia-credit" style="margin-top:8px">' . $mention . '</p>', $html, 1, $n);
        if ($n && is_string($out)) return $out;
        $p = '<p class="alexlia-credit" style="margin:0;padding:10px 16px 16px;text-align:center;font-size:.85rem;opacity:.85">' . $mention . '</p>';
        $pos = strripos($html, '</body>');
        return substr($html, 0, $pos) . $p . "\n" . substr($html, $pos);
    });
}, 0);
