<?php
/**
 * Petites aides pour les gabarits.
 */

defined( 'ABSPATH' ) || exit;

/** Page de contenu (fleurs, occasions, conseils…) : repère enregistré, ou mise en page reconnue dans le contenu. */
function fc_is_seo_page( $id = 0 ) {
	$id = $id ? $id : get_queried_object_id();
	if ( ! $id || 'page' !== get_post_type( $id ) ) {
		return false;
	}
	if ( get_post_meta( $id, '_fc_seo_page', true ) ) {
		return true;
	}
	$content = (string) get_post_field( 'post_content', $id );
	return false !== strpos( $content, 'class="pg-crumbs"' );
}

/** Titre et description d'une page de contenu (repères du site, ou ceux de Rank Math / Yoast). */
function fc_page_seo_meta( $what, $id = 0 ) {
	$id   = $id ? $id : get_queried_object_id();
	$keys = 'title' === $what ? array( '_fc_title', 'rank_math_title', '_yoast_wpseo_title' ) : array( '_fc_desc', 'rank_math_description', '_yoast_wpseo_metadesc' );
	foreach ( $keys as $k ) {
		$v = trim( (string) get_post_meta( $id, $k, true ) );
		if ( '' !== $v && false === strpos( $v, '%' ) ) {
			return 'title' === $what ? trim( preg_replace( '/\s*\|\s*Flore & Chenilles$/', '', $v ) ) : $v;
		}
	}
	return '';
}

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
