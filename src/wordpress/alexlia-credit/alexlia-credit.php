<?php
/**
 * Plugin Name: Alex & Lia : mention « Site fait par »
 * Description: Ajoute en bas du site la mention « Site fait et entretenu par Alex & Lia », avec le logo et un lien.
 * Version: 1.1.0
 * Author: Alex & Lia
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

if (!defined('ALEXLIA_CREDIT_URL')) define('ALEXLIA_CREDIT_URL', 'https://www.aled08.fr/');

/* La mention : texte, logo (pot de peinture) et lien, puis l'année. */
function alexlia_credit_html() {
    $logo = '<svg width="30" height="22" style="flex:none" viewBox="2 17 62 46" aria-hidden="true" focusable="false"><defs><linearGradient id="alc" gradientUnits="userSpaceOnUse" x1="17" y1="0" x2="63" y2="0"><stop offset="0" stop-color="#7EDDB5"/><stop offset=".28" stop-color="#FFD45E"/><stop offset=".52" stop-color="#FF9E6E"/><stop offset=".76" stop-color="#FF6FAE"/><stop offset="1" stop-color="#9B7BFF"/></linearGradient><linearGradient id="alci" gradientUnits="userSpaceOnUse" x1="15" y1="0" x2="49" y2="0"><stop offset="0" stop-color="#9B7BFF"/><stop offset=".35" stop-color="#FF6FAE"/><stop offset=".65" stop-color="#FF9E6E"/><stop offset="1" stop-color="#FFD45E"/></linearGradient><linearGradient id="alcb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#ECE7FB"/><stop offset="1" stop-color="#B4A9DC"/></linearGradient></defs><path d="M3.5 57.6c1.5-2.2 6-2.8 11-2.6 6-.8 12-.6 17 0 1.5 2.4-1 4.6-6 5-7 .8-15 .6-19.5-.4-2.2-.5-3.3-1.2-2.5-2Z" fill="#000" opacity=".28"/><g transform="translate(23 37.4) rotate(84.3) translate(-30 -34)"><path d="M15 21 18.2 51.500c8 4.2 19.6 4.2 27.6 0L49 21Z" fill="url(#alcb)"/><path d="M16.2 31.500c10 3.6 21.6 3.6 31.6 0M17.4 43c9.3 3.4 19.9 3.4 29.2 0" fill="none" stroke="#B9AFE0" stroke-width="1.5" opacity=".75"/><path d="M15.5 22C12 40 52 40 48.5 22" fill="none" stroke="#9E93CC" stroke-width="2" stroke-linecap="round"/><ellipse cx="32" cy="21" rx="17" ry="5.2" fill="url(#alci)" stroke="#E4DEF8" stroke-width="2.2"/></g><path d="M33 43.5C36 42 39.5 43.5 41 46.5 43 50 49 49.6 55 50.4 59.5 51 63 52.6 63.4 55 63.8 58.2 59.5 59.8 54 60.3 44 61.6 33 61.5 24 60.2 18.5 59.4 15.5 57.6 17 55.4 19 52.6 26 53.6 29 50.5 31 48.4 31 45 33 43.5Z" fill="url(#alc)"/><path d="M36 47.500c2 2.5 6 3.5 10 3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><circle cx="57.5" cy="45.5" r="1.8" fill="#FF6FAE"/><circle cx="49.5" cy="42.5" r="1.2" fill="#FFD45E"/><circle cx="13" cy="60.8" r="1.3" fill="#7EDDB5"/></svg>';
    return 'Site fait et entretenu par <a href="' . esc_url(ALEXLIA_CREDIT_URL) . '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;vertical-align:middle">' . $logo . '<span style="text-decoration:underline">Alex &amp; Lia</span></a> ' . esc_html(wp_date('Y'));
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
