<?php
/**
 * Thème Flore & Chenilles.
 *
 * L'accueil reprend le site d'origine (boutique, fiche d'une création, compositeur, papillons…) ;
 * les autres pages (fiche WooCommerce, panier, commande, compte, pages légales) en gardent le style.
 */

defined( 'ABSPATH' ) || exit;

define( 'FC_THEME_VERSION', wp_get_theme( get_template() )->get( 'Version' ) );
define( 'FC_ASSETS', trailingslashit( get_template_directory_uri() ) );

require get_template_directory() . '/inc/template-tags.php';
require get_template_directory() . '/inc/seo.php';

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support(
			'woocommerce',
			array(
				'thumbnail_image_width' => 600,
				'single_image_width'    => 900,
				'product_grid'          => array(
					'default_columns' => 3,
					'default_rows'    => 4,
					'min_columns'     => 2,
					'max_columns'     => 4,
				),
			)
		);
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
		add_theme_support( 'editor-styles' );
	}
);

/** Numéro de version des fichiers (change dès qu'un fichier change : pas de vieux cache). */
function fc_asset_ver( $rel ) {
	$file = get_template_directory() . '/' . $rel;
	return FC_THEME_VERSION . ( file_exists( $file ) ? '.' . filemtime( $file ) : '' );
}

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( 'fc-site', FC_ASSETS . 'assets/css/site.css', array(), fc_asset_ver( 'assets/css/site.css' ) );
		wp_enqueue_script( 'fc-flowers', FC_ASSETS . 'assets/js/flowers.js', array(), fc_asset_ver( 'assets/js/flowers.js' ), array( 'strategy' => 'defer' ) );
		if ( is_front_page() ) {
			wp_enqueue_script( 'fc-data', FC_ASSETS . 'assets/js/data.js', array(), fc_asset_ver( 'assets/js/data.js' ), array( 'strategy' => 'defer' ) );
			wp_enqueue_script( 'fc-app', FC_ASSETS . 'assets/js/app.js', array( 'fc-data', 'fc-flowers' ), fc_asset_ver( 'assets/js/app.js' ), array( 'strategy' => 'defer' ) );
			/* L'accueil a son propre style : pas besoin de celui de WooCommerce. */
			foreach ( array( 'woocommerce-general', 'woocommerce-layout', 'woocommerce-smallscreen', 'wc-blocks-style', 'wp-block-library' ) as $h ) {
				wp_dequeue_style( $h );
			}
		} else {
			wp_enqueue_style( 'fc-woo', FC_ASSETS . 'assets/css/woo.css', array( 'fc-site' ), fc_asset_ver( 'assets/css/woo.css' ) );
			if ( is_page() && get_post_meta( get_queried_object_id(), '_fc_seo_page', true ) ) {
				wp_enqueue_style( 'fc-pages', FC_ASSETS . 'assets/css/pages.css', array( 'fc-woo' ), fc_asset_ver( 'assets/css/pages.css' ) );
			}
			wp_enqueue_script( 'fc-lite', FC_ASSETS . 'assets/js/lite.js', array( 'fc-flowers' ), fc_asset_ver( 'assets/js/lite.js' ), array( 'strategy' => 'defer' ) );
		}
	},
	20
);

/* Les créations et réglages de la boutique, pour l'accueil (lus par app.js). */
add_action(
	'wp_head',
	function () {
		if ( ! is_front_page() ) {
			return;
		}
		$data = function_exists( 'fcb_payload' ) ? fcb_payload() : array();
		$data['assets'] = FC_ASSETS;
		echo '<script>window.FC_WP=' . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP ) . ";</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON encodé.
	},
	1
);

/* Polices préchargées, icône du site. */
add_action(
	'wp_head',
	function () {
		foreach ( array( 'fraunces-latin-full-normal', 'jost-latin-wght-normal' ) as $font ) {
			echo '<link rel="preload" href="' . esc_url( FC_ASSETS . 'assets/fonts/' . $font . '.woff2' ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
		}
		if ( ! has_site_icon() ) {
			echo '<link rel="icon" href="' . esc_url( FC_ASSETS . 'assets/img/favicon.png' ) . '" type="image/png">' . "\n";
			echo '<link rel="apple-touch-icon" href="' . esc_url( FC_ASSETS . 'assets/img/apple-touch-icon.png' ) . '">' . "\n";
		}
		echo '<meta name="theme-color" content="#FBF7F2">' . "\n";
	},
	2
);

/* WooCommerce : enveloppe des pages boutique, colonnes, textes. */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
add_filter(
	'loop_shop_columns',
	function () {
		return 3;
	}
);
add_filter(
	'woocommerce_output_related_products_args',
	function ( $args ) {
		$args['posts_per_page'] = 3;
		$args['columns']        = 3;
		return $args;
	}
);
add_filter(
	'woocommerce_product_related_products_heading',
	function () {
		return 'Vous aimerez aussi';
	}
);
/* La référence interne (UGS) reste dans l'administration. */
add_filter(
	'wc_product_sku_enabled',
	function ( $on ) {
		return is_admin() ? $on : false;
	}
);
add_filter(
	'woocommerce_product_single_add_to_cart_text',
	function () {
		return 'Ajouter à ma sélection';
	}
);
add_filter(
	'woocommerce_product_add_to_cart_text',
	function ( $text, $product ) {
		return $product && $product->is_purchasable() && $product->is_in_stock() && $product->is_type( 'simple' ) ? 'Ajouter' : $text;
	},
	10,
	2
);
add_filter(
	'woocommerce_breadcrumb_defaults',
	function ( $d ) {
		$d['delimiter'] = ' <span class="sep" aria-hidden="true">›</span> ';
		$d['home']      = 'Accueil';
		return $d;
	}
);

/* Fil d'Ariane sur la fiche d'une création : retour vers la boutique de l'accueil. */
add_filter(
	'woocommerce_get_breadcrumb',
	function ( $crumbs ) {
		if ( isset( $crumbs[1] ) && function_exists( 'wc_get_page_id' ) && get_permalink( wc_get_page_id( 'shop' ) ) === $crumbs[1][1] ) {
			$crumbs[1][1] = home_url( '/#boutique' );
		}
		return $crumbs;
	}
);
