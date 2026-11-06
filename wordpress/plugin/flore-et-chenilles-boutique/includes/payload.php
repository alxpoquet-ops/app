<?php
/**
 * Les créations et réglages transmis à la page d'accueil (boutique, fiche, compositeur).
 */

defined( 'ABSPATH' ) || exit;

/** Photos d'une création : vignette (s) et grande image (l). */
function fcb_pics( $ids ) {
	$out = array();
	foreach ( array_unique( array_filter( array_map( 'intval', (array) $ids ) ) ) as $id ) {
		$s = wp_get_attachment_image_url( $id, 'medium_large' );
		$l = wp_get_attachment_image_url( $id, 'full' );
		if ( $l ) {
			$out[] = array(
				's' => $s ? $s : $l,
				'l' => $l,
			);
		}
	}
	return $out;
}

/** Une création au format du site. */
function fcb_product_payload( $p ) {
	$x       = fcb_extra( $p );
	$regular = $p->get_regular_price( 'edit' );
	if ( $p->is_type( 'variable' ) ) {
		$regular = $p->get_variation_regular_price( 'min' );
	}
	$item = array(
		'id'       => fcb_front_id( $p ),
		'wcId'     => $p->get_id(),
		'name'     => $p->get_name(),
		'category' => fcb_category_key( $p ),
		'price'    => ( '' === $regular || null === $regular ) ? null : (float) $regular,
		'desc'     => trim( wp_strip_all_tags( $p->get_short_description() ) ),
		'pics'     => fcb_pics( array_merge( array( $p->get_image_id() ), $p->get_gallery_image_ids() ) ),
		'url'      => get_permalink( $p->get_id() ),
		'soldOut'  => ! $p->is_in_stock(),
		'unique'   => fcb_is_unique( $p ),
	);
	foreach ( array( 'gift', 'badge', 'words', 'bg', 'post' ) as $k ) {
		$v = fcb_meta( $p, $k );
		if ( '' !== $v && null !== $v ) {
			$item[ $k ] = $v;
		}
	}
	$count = (int) fcb_meta( $p, 'count' );
	if ( $count > 0 && null !== $item['price'] && abs( $count * fcb_unit_price() - $item['price'] ) < 0.01 ) {
		$item['count'] = $count;
	}
	if ( ! $p->is_purchasable() && null !== $item['price'] ) {
		$item['linkOnly'] = true;
	}
	if ( $p->is_type( 'variable' ) || $p->is_type( 'external' ) || $p->is_type( 'grouped' ) ) {
		$item['linkOnly'] = true;
	}
	foreach ( array( 'preset', 'bouquet', 'composition', 'illustration', 'art', 'giftcard', 'jar', 'priceFrom', 'quote' ) as $k ) {
		if ( isset( $x[ $k ] ) && '' !== $x[ $k ] && null !== $x[ $k ] && false !== $x[ $k ] ) {
			$item[ $k ] = $x[ $k ];
		}
	}
	if ( ! empty( $x['slideImage'] ) ) {
		$sl = wp_get_attachment_image_url( (int) $x['slideImage'], 'full' );
		if ( $sl ) {
			$item['slideImage'] = $sl;
		}
	}
	if ( ! empty( $x['options']['choices'] ) ) {
		$choices = array();
		foreach ( $x['options']['choices'] as $c ) {
			$ch = array( 'name' => $c['name'] );
			foreach ( array( 'type', 'color', 'price' ) as $k ) {
				if ( isset( $c[ $k ] ) ) {
					$ch[ $k ] = $c[ $k ];
				}
			}
			if ( ! empty( $c['image'] ) ) {
				$ph = fcb_pics( array( (int) $c['image'] ) );
				if ( $ph ) {
					$ch['image'] = $ph[0]['s'];
					$ch['large'] = $ph[0]['l'];
				}
			}
			$choices[] = $ch;
		}
		$item['options'] = array(
			'label'   => fcb_choice_label( $p ),
			'colors'  => ! empty( $x['options']['colors'] ),
			'choices' => $choices,
		);
	}
	return $item;
}

function fcb_build_products() {
	$list = wc_get_products(
		array(
			'status'     => 'publish',
			'limit'      => -1,
			'visibility' => 'catalog',
			'orderby'    => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			),
		)
	);
	$out = array();
	foreach ( $list as $p ) {
		if ( $p->get_id() === fcb_bouquet_product_id() ) {
			continue;
		}
		$out[] = fcb_product_payload( $p );
	}
	return $out;
}

/** Tout ce dont la page d'accueil a besoin. */
function fcb_payload() {
	$products = get_transient( 'fcb_products_v1' );
	if ( false === $products ) {
		$products = fcb_build_products();
		set_transient( 'fcb_products_v1', $products, DAY_IN_SECONDS );
	}
	$s   = fcb_settings();
	$cat = fcb_catalog();
	return array(
		'products'  => $products,
		'unitPrice' => fcb_unit_price(),
		'jar'       => array_merge( isset( $cat['jar'] ) ? $cat['jar'] : array(), array( 'price' => fcb_jar_price() ) ),
		'promo'     => array(
			'label'   => $s['promo_label'],
			'percent' => (float) $s['promo_percent'],
			'from'    => $s['promo_from'],
			'until'   => $s['promo_until'],
		),
		'contact'   => array(
			'email'        => $s['contact_email'],
			'showEmail'    => 'yes' === $s['show_email'],
			'facebook'     => $s['facebook'],
			'formEndpoint' => '',
		),
		'brand'     => array_filter( array( 'instagram' => $s['instagram'] ) ),
		'instagram' => array( 'feedUrl' => $s['instagram_feed'] ),
		'shop'      => array(
			'rest'        => esc_url_raw( rest_url( 'fc/v1/' ) ),
			'nonce'       => wp_create_nonce( 'wp_rest' ),
			'checkoutUrl' => wc_get_checkout_url(),
			'cartUrl'     => wc_get_cart_url(),
			'payments'    => fcb_payment_names(),
		),
	);
}

/** Noms des moyens de paiement activés (« carte bancaire », « PayPal »…), pour les textes du site. */
function fcb_payment_names() {
	$names = array();
	if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
		return $names;
	}
	foreach ( WC()->payment_gateways()->payment_gateways() as $id => $g ) {
		if ( 'yes' !== $g->enabled ) {
			continue;
		}
		if ( false !== strpos( $id, 'stripe' ) || false !== stripos( $g->get_title(), 'carte' ) ) {
			$names['card'] = 'carte bancaire';
		} elseif ( false !== strpos( $id, 'ppcp' ) || false !== strpos( $id, 'paypal' ) ) {
			$names['paypal'] = 'PayPal';
		} else {
			$names[ $id ] = wp_strip_all_tags( $g->get_title() );
		}
	}
	return array_values( $names );
}

/* Le cache se vide dès qu'une création change (prix, photos, stock…). */
foreach ( array( 'woocommerce_update_product', 'woocommerce_new_product', 'woocommerce_delete_product', 'woocommerce_trash_product', 'woocommerce_product_set_stock', 'woocommerce_product_set_stock_status', 'woocommerce_variation_set_stock_status', 'edited_product_cat', 'created_product_cat', 'update_option_fcb_settings' ) as $fcb_hook ) {
	add_action( $fcb_hook, 'fcb_flush_payload' );
}
add_action(
	'save_post_product',
	function () {
		fcb_flush_payload();
	}
);
