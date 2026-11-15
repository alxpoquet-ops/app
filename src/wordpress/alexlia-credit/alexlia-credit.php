<?php
/**
 * Plugin Name: Alex & Lia : mention « Site fait par »
 * Description: Ajoute en bas du site la mention « Site fait par Alex & Lia », avec un lien.
 * Version: 1.0.1
 * Author: Alex & Lia
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

if (!defined('ALEXLIA_CREDIT_URL')) define('ALEXLIA_CREDIT_URL', 'https://www.aled08.fr/');

/* La mention est écrite dans la page ; un petit script la range dans le pied de page du thème quand il en a un. */
add_action('wp_footer', function () {
    $ou = apply_filters('alexlia_credit_cibles', '.site-footer .footer-bottom, .soon-foot, footer');
    echo '<p class="alexlia-credit" style="margin:0;padding:10px 16px 16px;text-align:center;font-size:.85rem;opacity:.85">Site fait par '
        . '<a href="' . esc_url(ALEXLIA_CREDIT_URL) . '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Alex &amp; Lia</a></p>' . "\n";
    echo '<script>(function(){var c=document.querySelector(".alexlia-credit"),f=document.querySelector(' . wp_json_encode($ou) . ');'
        . 'if(!c||!f)return;c.style.padding="8px 0 0";c.style.flexBasis="100%";c.style.width="100%";'
        . 'if(f.tagName==="P")f.insertAdjacentElement("afterend",c);else f.appendChild(c);})();</script>' . "\n";
}, 99);

/* Une page servie sans wp_footer (page d'attente « Bientôt en ligne » par exemple) reçoit la mention quand même. */
add_action('template_redirect', function () {
    if (is_admin() || is_feed() || wp_doing_ajax()) return;
    ob_start(function ($html) {
        if (!is_string($html) || $html === '' || strpos($html, 'alexlia-credit') !== false || stripos($html, '</body>') === false) return $html;
        $lien = '<a href="' . esc_url(ALEXLIA_CREDIT_URL) . '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Alex &amp; Lia</a>';
        $n = 0;
        $out = preg_replace('#(<p class="soon-foot">.*?</p>)#s', '$1' . "\n" . '<p class="soon-foot alexlia-credit" style="margin-top:8px">Site fait par ' . $lien . '</p>', $html, 1, $n);
        if ($n && is_string($out)) return $out;
        $p = '<p class="alexlia-credit" style="margin:0;padding:10px 16px 16px;text-align:center;font-size:.85rem;opacity:.85">Site fait par ' . $lien . '</p>';
        $pos = strripos($html, '</body>');
        return substr($html, 0, $pos) . $p . "\n" . substr($html, $pos);
    });
}, 0);
