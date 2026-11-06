<?php
/**
 * Offre de lancement : remise automatique sur toutes les créations, entre deux dates.
 * Les prix barrés apparaissent partout (boutique, fiche, panier, e-mails) comme une promotion WooCommerce.
 */

defined( 'ABSPATH' ) || exit;

/** Prix d'une création pendant l'offre (sauf si un prix est déjà fixé dans le panier). */
function fcb_promo_price( $price, $product ) {
	if ( '' === $price || null === $price || ! fcb_promo_percent() || $product->get_meta( '_fc_locked', true ) ) {
		return $price;
	}
	$regular = $product->get_regular_price( 'edit' );
	if ( '' === $regular || null === $regular ) {
		return $price;
	}
	return (string) min( (float) $price, fcb_with_promo( $regular ) );
}

function fcb_promo_sale_price( $sale, $product ) {
	if ( ! fcb_promo_percent() || $product->get_meta( '_fc_locked', true ) ) {
		return $sale;
	}
	$regular = $product->get_regular_price( 'edit' );
	if ( '' === $regular || null === $regular ) {
		return $sale;
	}
	$promo = fcb_with_promo( $regular );
	return ( '' === $sale || null === $sale || (float) $sale > $promo ) ? (string) $promo : $sale;
}

add_filter( 'woocommerce_product_get_price', 'fcb_promo_price', 50, 2 );
add_filter( 'woocommerce_product_variation_get_price', 'fcb_promo_price', 50, 2 );
add_filter( 'woocommerce_product_get_sale_price', 'fcb_promo_sale_price', 50, 2 );
add_filter( 'woocommerce_product_variation_get_sale_price', 'fcb_promo_sale_price', 50, 2 );
add_filter(
	'woocommerce_variation_prices_price',
	function ( $price, $variation ) {
		return fcb_promo_price( $price, $variation );
	},
	50,
	2
);
add_filter(
	'woocommerce_variation_prices_sale_price',
	function ( $sale, $variation ) {
		return fcb_promo_sale_price( $sale, $variation );
	},
	50,
	2
);
add_filter(
	'woocommerce_get_variation_prices_hash',
	function ( $hash ) {
		$hash[] = 'fcb-' . fcb_promo_percent();
		return $hash;
	}
);

/* Pastille « −10 % » au lieu de « Promo ! ». */
add_filter(
	'woocommerce_sale_flash',
	function ( $html ) {
		$pct = fcb_promo_percent();
		if ( ! $pct ) {
			return $html;
		}
		return '<span class="onsale">−' . esc_html( rtrim( rtrim( number_format( $pct, 2, ',', '' ), '0' ), ',' ) ) . ' %</span>';
	}
);
