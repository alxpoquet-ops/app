<?php
/**
 * Référencement de base (si aucune extension SEO n'est installée) :
 * titre et description de l'accueil, partage sur les réseaux, fiche « fleuriste artisan » pour Google.
 * Avec Yoast SEO ou Rank Math, ces balises sont laissées à l'extension.
 */

defined( 'ABSPATH' ) || exit;

function fc_seo_plugin_active() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' );
}

const FC_HOME_TITLE = 'Flore & Chenilles — Fleurs éternelles en fil chenille, Ardennes';
const FC_HOME_DESC  = 'Fleurs éternelles en fil chenille faites main à Signy-l’Abbaye (Ardennes) : bouquets, fleurs à l’unité dès 8 €, carte de vœux offerte. Retrait ou livraison.';

add_filter(
	'pre_get_document_title',
	function ( $title ) {
		if ( fc_seo_plugin_active() ) {
			return $title;
		}
		if ( is_front_page() ) {
			return FC_HOME_TITLE;
		}
		$custom = is_page() ? get_post_meta( get_queried_object_id(), '_fc_title', true ) : '';
		return $custom ? $custom . ' | Flore & Chenilles' : $title;
	}
);
add_filter(
	'document_title_separator',
	function () {
		return '—';
	}
);

/** Description de la page affichée. */
function fc_seo_description() {
	if ( is_front_page() ) {
		return FC_HOME_DESC;
	}
	if ( function_exists( 'is_product' ) && is_product() ) {
		$p = wc_get_product( get_queried_object_id() );
		if ( $p ) {
			$d = wp_strip_all_tags( $p->get_short_description() ? $p->get_short_description() : $p->get_description() );
			return wp_html_excerpt( $p->get_name() . ' en fil chenille : ' . $d, 155, '…' );
		}
	}
	if ( function_exists( 'is_product_category' ) && is_product_category() ) {
		$t = get_queried_object();
		return $t && $t->description ? wp_html_excerpt( wp_strip_all_tags( $t->description ), 155, '…' ) : '';
	}
	if ( is_page() && get_post_meta( get_queried_object_id(), '_fc_desc', true ) ) {
		return get_post_meta( get_queried_object_id(), '_fc_desc', true );
	}
	if ( is_singular() ) {
		$post = get_queried_object();
		return $post ? wp_html_excerpt( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ), 155, '…' ) : '';
	}
	return '';
}

add_action(
	'wp_head',
	function () {
		if ( fc_seo_plugin_active() ) {
			return;
		}
		$noindex = ( function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) ) || is_search() || is_404();
		if ( $noindex ) {
			echo '<meta name="robots" content="noindex, follow">' . "\n";
			return;
		}
		$desc  = fc_seo_description();
		$title = is_front_page() ? 'Flore & Chenilles — Des fleurs qui ne fanent jamais' : wp_get_document_title();
		$url   = is_front_page() ? home_url( '/' ) : ( is_singular() ? get_permalink() : '' );
		$image = FC_ASSETS . 'assets/img/og-image.png';
		if ( function_exists( 'is_product' ) && is_product() ) {
			$p = wc_get_product( get_queried_object_id() );
			if ( $p && $p->get_image_id() ) {
				$image = wp_get_attachment_image_url( $p->get_image_id(), 'full' );
			}
		}
		if ( $desc ) {
			echo '<meta name="description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		echo '<meta property="og:type" content="' . ( is_front_page() ? 'website' : 'article' ) . '">' . "\n";
		echo '<meta property="og:locale" content="fr_FR">' . "\n";
		echo '<meta property="og:site_name" content="Flore &amp; Chenilles">' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $desc ) {
			echo '<meta property="og:description" content="' . esc_attr( $desc ) . '">' . "\n";
		}
		if ( $url ) {
			echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
		}
		echo '<meta property="og:image" content="' . esc_url( $image ) . '">' . "\n";
		echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
		if ( is_front_page() ) {
			echo '<link rel="canonical" href="' . esc_url( home_url( '/' ) ) . '">' . "\n";
		}
	},
	3
);

/* La page d'accueil a déjà son adresse de référence (ci-dessus). */
add_action(
	'wp',
	function () {
		if ( is_front_page() && ! fc_seo_plugin_active() ) {
			remove_action( 'wp_head', 'rel_canonical' );
		}
	}
);

/* Fiche « fleuriste artisan » pour Google, sur l'accueil. */
add_action(
	'wp_head',
	function () {
		if ( ! is_front_page() ) {
			return;
		}
		$home = home_url( '/' );
		$mail = fc_setting( 'contact_email' );
		$fb   = fc_setting( 'facebook' );
		$same = array_values( array_filter( array( fc_instagram_url(), $fb ) ) );
		$ld   = array(
			'@context' => 'https://schema.org',
			'@graph'   => array(
				array_filter(
					array(
						'@type'               => 'Florist',
						'@id'                 => $home . '#atelier',
						'name'                => 'Flore & Chenilles',
						'description'         => 'Bouquets et fleurs éternelles en fil chenille, faits main avec passion dans un atelier de Signy-l’Abbaye, dans les Ardennes.',
						'url'                 => $home,
						'logo'                => FC_ASSETS . 'assets/photos/logo.jpg',
						'image'               => FC_ASSETS . 'assets/img/og-image.png',
						'email'               => $mail,
						'priceRange'          => '8 € – 88 €',
						'currenciesAccepted'  => 'EUR',
						'paymentAccepted'     => 'Carte bancaire, PayPal',
						'address'             => array(
							'@type'           => 'PostalAddress',
							'addressLocality' => 'Signy-l’Abbaye',
							'postalCode'      => '08460',
							'addressRegion'   => 'Ardennes',
							'addressCountry'  => 'FR',
						),
						'areaServed'          => array(
							array(
								'@type' => 'City',
								'name'  => 'Signy-l’Abbaye',
							),
							array(
								'@type' => 'AdministrativeArea',
								'name'  => 'Ardennes',
							),
						),
						'sameAs'              => $same,
						'knowsAbout'          => array( 'fleurs en fil chenille', 'fleurs éternelles', 'bouquets faits main', 'fleurs en cure-pipe' ),
					)
				),
				array(
					'@type'      => 'WebSite',
					'@id'        => $home . '#site',
					'url'        => $home,
					'name'       => 'Flore & Chenilles',
					'inLanguage' => 'fr-FR',
					'publisher'  => array( '@id' => $home . '#atelier' ),
				),
			),
		);
		echo '<script type="application/ld+json">' . wp_json_encode( $ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	4
);
