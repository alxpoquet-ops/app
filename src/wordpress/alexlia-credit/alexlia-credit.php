<?php
/**
 * Plugin Name: Alex & Co : mention « Site fait par »
 * Description: Ajoute en bas du site la mention « Site fait et entretenu par Alex & Co », avec le logo et un lien.
 * Version: 1.2.0
 * Author: Alex & Co
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

if (!defined('ALEXLIA_CREDIT_URL')) define('ALEXLIA_CREDIT_URL', 'https://www.aled08.fr/');

/* La mention : texte, logo (la tête d'Alex au casque de chantier) et lien, puis l'année. */
function alexlia_credit_html() {
    $logo = '<svg width="24" height="24" style="flex:none" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="#fff" stroke="#fff" stroke-width="7" stroke-linejoin="round"><path d="M8 44C8 27 18 17 32 17S56 27 56 44C56 54 48 59 32 59S8 54 8 44Z"/><path d="M12 27C13 14 21 6 32 6S51 14 52 27Z"/><rect x="7" y="24" width="50" height="7" rx="3.5"/></g><path d="M8 44C8 27 18 17 32 17S56 27 56 44C56 54 48 59 32 59S8 54 8 44Z" fill="#BCC8FF" stroke="#4F5FC4" stroke-width="2.2"/><path d="M14 42c1-5 3-8 6-9.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M12 27C13 14 21 6 32 6S51 14 52 27Z" fill="#fff" stroke="#7D87BE" stroke-width="2.2" stroke-linejoin="round"/><path d="M32 8V25" stroke="#DCE1F7" stroke-width="3.4" stroke-linecap="round"/><rect x="7" y="24" width="50" height="7" rx="3.5" fill="#F1F3FF" stroke="#7D87BE" stroke-width="2.2"/><path d="M22 11.2l1.1 2.9 3.1.2-2.4 1.9.8 3-2.6-1.7-2.6 1.7.8-3-2.4-1.9 3.1-.2Z" fill="#FFC23D" stroke="#C99A00" stroke-width="1" stroke-linejoin="round"/><ellipse cx="23" cy="40" rx="2.6" ry="3.2" fill="#2E2A47"/><circle cx="24" cy="38.7" r="1.05" fill="#fff"/><ellipse cx="41" cy="40" rx="2.6" ry="3.2" fill="#2E2A47"/><circle cx="42" cy="38.7" r="1.05" fill="#fff"/><g fill="rgba(255,255,255,.22)" stroke="#2E2A47" stroke-width="2.3" stroke-linejoin="round"><rect x="15" y="33.5" width="16" height="13" rx="4"/><rect x="33" y="33.5" width="16" height="13" rx="4"/></g><path d="M31 38.5q1-1.4 2 0M15 37l-4.5-1.2M49 37l4.5-1.2" fill="none" stroke="#2E2A47" stroke-width="2" stroke-linecap="round"/><ellipse cx="13.5" cy="50" rx="3.6" ry="2.1" fill="#FF7FAE" opacity=".65"/><ellipse cx="50.5" cy="50" rx="3.6" ry="2.1" fill="#FF7FAE" opacity=".65"/><path d="M28 51q2 2.6 4 0q2 2.6 4 0" fill="none" stroke="#2E2A47" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return 'Site fait et entretenu par <a href="' . esc_url(ALEXLIA_CREDIT_URL) . '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px;vertical-align:middle">' . $logo . '<span style="text-decoration:underline">Alex &amp; Co</span></a> ' . esc_html(wp_date('Y'));
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
