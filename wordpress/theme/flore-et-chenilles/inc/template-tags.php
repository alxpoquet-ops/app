<?php
/**
 * Petites aides pour les gabarits.
 */

defined( 'ABSPATH' ) || exit;

/** Réglage de l'extension boutique (si elle est active). */
function fc_setting( $key, $default = '' ) {
	if ( function_exists( 'fcb_opt' ) ) {
		$v = fcb_opt( $key );
		return ( null === $v || '' === $v ) ? $default : $v;
	}
	return $default;
}

/** Les liens « #atelier », « #contact »… mènent à l'accueil depuis les autres pages. */
function fc_home_anchor() {
	return is_front_page() ? '' : esc_url( home_url( '/' ) );
}

function fc_instagram_url() {
	$ig = fc_setting( 'instagram', 'flore_et_chenilles' );
	return 'https://www.instagram.com/' . rawurlencode( $ig ) . '/';
}

/** Lien Facebook : affiché seulement si l'adresse est renseignée. */
function fc_facebook_attrs() {
	$fb = fc_setting( 'facebook' );
	echo $fb ? 'href="' . esc_url( $fb ) . '"' : 'hidden href="#contact"'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

/** Ligne de l'e-mail : affichée si l'atelier le souhaite. */
function fc_email_attrs() {
	$mail = fc_setting( 'contact_email' );
	$show = 'yes' === fc_setting( 'show_email', 'yes' );
	echo ( $mail && $show ) ? 'href="mailto:' . esc_attr( antispambot( $mail ) ) . '"' : 'hidden href="#contact"'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

function fc_email_text() {
	$mail = fc_setting( 'contact_email' );
	return 'yes' === fc_setting( 'show_email', 'yes' ) && $mail ? antispambot( $mail ) : '';
}

/** Bouton « Ma sélection » : tiroir sur l'accueil, page panier ailleurs. */
function fc_cart_button() {
	if ( is_front_page() ) {
		get_template_part( 'parts/cart-button' );
		return;
	}
	$n   = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
	$url = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/#boutique' );
	echo '<a class="icon-btn cart-btn" href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $n ? sprintf( 'Ma sélection (%d)', $n ) : 'Ma sélection' ) . '"><svg><use href="#i-bag"/></svg><span class="cart-count' . ( $n ? ' has' : '' ) . '">' . (int) $n . '</span></a>';
}

/** Liens légaux du pied de page (seulement les pages publiées). */
function fc_legal_links() {
	$links = array();
	$pages = array(
		'fcb_page_cgv'               => 'CGV',
		'fcb_page_mentions'          => 'Mentions légales',
		'wp_page_for_privacy_policy' => 'Confidentialité',
	);
	foreach ( $pages as $option => $label ) {
		$id = (int) get_option( $option );
		if ( $id && 'publish' === get_post_status( $id ) ) {
			$links[] = '<a href="' . esc_url( get_permalink( $id ) ) . '">' . esc_html( $label ) . '</a>';
		}
	}
	if ( function_exists( 'wc_get_page_permalink' ) ) {
		$links[] = '<a href="' . esc_url( wc_get_page_permalink( 'myaccount' ) ) . '">Mon compte</a>';
	}
	if ( $links ) {
		echo '<nav class="footer-legal" aria-label="Informations légales">' . implode( '<span aria-hidden="true">·</span>', $links ) . '</nav>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}

/** Vos dernières publications Instagram par l'extension Smash Balloon, si elle est installée sans flux Behold. */
function fc_use_smash_balloon() {
	return shortcode_exists( 'instagram-feed' ) && '' === fc_setting( 'instagram_feed' );
}
