<?php
/**
 * Panier : carte de vœux, fleur et couleur choisies, option bocal, bouquet composé, créations uniques.
 * Ces informations suivent la création du panier jusqu'à la commande et aux e-mails.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Prépare les informations d'une création ajoutée au panier.
 *
 * @param WC_Product $product Création.
 * @param array      $in      choice (index), color, jar, card.
 * @return array|WP_Error
 */
function fcb_prepare_item( $product, $in ) {
	$out     = array();
	$choices = fcb_choices( $product );
	if ( $choices ) {
		$i = isset( $in['choice'] ) ? $in['choice'] : null;
		if ( null === $i || '' === $i || ! is_numeric( $i ) || ! isset( $choices[ (int) $i ] ) ) {
			return new WP_Error( 'fcb_choice', 'Choisissez votre fleur.' );
		}
		$out['fcb_choice'] = (int) $i;
	}
	if ( fcb_has_colors( $product ) && ! empty( $in['color'] ) ) {
		$k = sanitize_key( $in['color'] );
		if ( fcb_color_name( $k ) ) {
			$out['fcb_color'] = $k;
		}
	}
	if ( ! empty( $in['jar'] ) && fcb_has_jar_option( $product ) ) {
		$out['fcb_jar'] = 1;
	}
	$card = fcb_clean_card( isset( $in['card'] ) ? $in['card'] : null );
	if ( $card ) {
		$out['fcb_card'] = $card;
	}
	return $out;
}

/** Valeurs envoyées par le formulaire de la fiche d'une création. */
function fcb_form_input() {
	// phpcs:disable WordPress.Security.NonceVerification.Missing -- formulaire « ajouter au panier » de WooCommerce.
	$g = function ( $k ) {
		return isset( $_POST[ $k ] ) ? wp_unslash( $_POST[ $k ] ) : '';
	};
	$in = array(
		'choice' => $g( 'fcb_choice' ),
		'color'  => $g( 'fcb_color' ),
		'jar'    => ! empty( $_POST['fcb_jar'] ),
		'card'   => array(
			'to'   => $g( 'fcb_card_to' ),
			'msg'  => $g( 'fcb_card_msg' ),
			'from' => $g( 'fcb_card_from' ),
		),
	);
	// phpcs:enable
	return $in;
}

add_filter(
	'woocommerce_add_to_cart_validation',
	function ( $passed, $product_id ) {
		if ( empty( $_POST['fcb_form'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return $passed;
		}
		$product = wc_get_product( $product_id );
		$check   = $product ? fcb_prepare_item( $product, fcb_form_input() ) : null;
		if ( is_wp_error( $check ) ) {
			wc_add_notice( $check->get_error_message(), 'error' );
			return false;
		}
		return $passed;
	},
	10,
	2
);

add_filter(
	'woocommerce_add_cart_item_data',
	function ( $data, $product_id ) {
		if ( empty( $_POST['fcb_form'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return $data;
		}
		$product = wc_get_product( $product_id );
		$extra   = $product ? fcb_prepare_item( $product, fcb_form_input() ) : array();
		return is_wp_error( $extra ) ? $data : array_merge( $data, $extra );
	},
	10,
	2
);

/* Une création unique ne peut être qu'une fois dans le panier, même avec deux cartes différentes. */
add_filter(
	'woocommerce_add_to_cart_sold_individually_found_in_cart',
	function ( $found, $product_id ) {
		if ( $found || ! WC()->cart ) {
			return $found;
		}
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( (int) $item['product_id'] === (int) $product_id ) {
				return true;
			}
		}
		return $found;
	},
	10,
	2
);
add_filter(
	'woocommerce_cart_product_cannot_add_another_message',
	function ( $message, $product ) {
		return $product && fcb_is_unique( $product )
			? sprintf( '« %s » est une création unique : elle est déjà dans votre sélection.', $product->get_name() )
			: $message;
	},
	10,
	2
);

/** Prix normal (avant l'offre de lancement) d'un article du panier, bocal compris. */
function fcb_item_regular_unit( $item ) {
	if ( ! empty( $item['fcb_bouquet'] ) ) {
		return (float) fcb_bouquet_price( $item['fcb_bouquet'] );
	}
	$product = isset( $item['data'] ) ? $item['data'] : null;
	if ( ! $product ) {
		return null;
	}
	$regular = $product->get_regular_price( 'edit' );
	if ( '' === $regular || null === $regular ) {
		$price = $product->get_price( 'edit' );
		if ( '' === $price || null === $price ) {
			return null;
		}
		$regular = $price;
	}
	return (float) $regular + ( ! empty( $item['fcb_jar'] ) ? fcb_jar_price() : 0 );
}

/* Prix calculés : bocal (+5 €) et bouquet composé (une fleur = 8 €), offre de lancement comprise. */
add_action(
	'woocommerce_before_calculate_totals',
	function ( $cart ) {
		foreach ( $cart->get_cart() as $item ) {
			if ( empty( $item['fcb_bouquet'] ) && empty( $item['fcb_jar'] ) ) {
				continue;
			}
			$base = fcb_item_regular_unit( $item );
			if ( null === $base ) {
				continue;
			}
			$item['data']->update_meta_data( '_fc_locked', 1 );
			$item['data']->set_price( fcb_with_promo( $base ) );
		}
	},
	20
);

/** Lignes affichées sous une création : fleur, couleur, composition, bocal, carte. */
function fcb_item_rows( $item, $for_order = false ) {
	$rows    = array();
	$product = wc_get_product( ! empty( $item['product_id'] ) ? $item['product_id'] : 0 );
	if ( isset( $item['fcb_choice'] ) && $product ) {
		$choices = fcb_choices( $product );
		if ( isset( $choices[ $item['fcb_choice'] ] ) ) {
			$rows[ fcb_choice_label( $product ) ] = $choices[ $item['fcb_choice'] ]['name'];
		}
	}
	if ( $product && fcb_has_colors( $product ) ) {
		$rows['Couleur'] = ! empty( $item['fcb_color'] ) ? fcb_color_name( $item['fcb_color'] ) : 'À préciser ensemble';
	}
	if ( ! empty( $item['fcb_bouquet'] ) ) {
		$rows['Composition'] = fcb_describe_bouquet( $item['fcb_bouquet'] );
	}
	if ( ! empty( $item['fcb_jar'] ) ) {
		$rows['Option'] = fcb_jar_label() . ' (+' . fcb_money( fcb_jar_price() ) . ')';
	}
	$line = ! empty( $item['fcb_card'] ) ? fcb_card_line( $item['fcb_card'] ) : '';
	$rows['Carte de vœux'] = $line ? $line : ( $for_order ? 'Offerte, sans message' : 'Offerte' );
	return $rows;
}

add_filter(
	'woocommerce_get_item_data',
	function ( $data, $item ) {
		foreach ( fcb_item_rows( $item ) as $label => $value ) {
			$data[] = array(
				'key'   => $label,
				'value' => esc_html( $value ),
			);
		}
		return $data;
	},
	10,
	2
);

add_action(
	'woocommerce_checkout_create_order_line_item',
	function ( $line, $key, $values ) {
		foreach ( fcb_item_rows( $values, true ) as $label => $value ) {
			$line->add_meta_data( $label, $value, true );
		}
		if ( ! empty( $values['fcb_card'] ) ) {
			$line->add_meta_data( '_fcb_card', $values['fcb_card'], true );
		}
		if ( ! empty( $values['fcb_bouquet'] ) ) {
			$line->add_meta_data( '_fcb_bouquet', $values['fcb_bouquet'], true );
		}
	},
	10,
	3
);

/* Le bouquet composé garde son joli nom. */
add_filter(
	'woocommerce_cart_item_name',
	function ( $name, $item ) {
		return ! empty( $item['fcb_bouquet'] ) ? esc_html__( 'Mon bouquet à moi', 'flore-et-chenilles' ) : $name;
	},
	10,
	2
);
add_filter(
	'woocommerce_order_item_name',
	function ( $name, $item ) {
		return $item->get_meta( '_fcb_bouquet' ) ? esc_html__( 'Mon bouquet à moi', 'flore-et-chenilles' ) : $name;
	},
	10,
	2
);

/** Texte court sous le nom d'une création dans « Ma sélection » (comme sur le site). */
function fcb_item_option_text( $item ) {
	$product = wc_get_product( $item['product_id'] );
	$notes   = array();
	if ( ! empty( $item['fcb_bouquet'] ) ) {
		$notes[] = fcb_describe_bouquet( $item['fcb_bouquet'] );
	} elseif ( $product ) {
		$opt = '';
		if ( isset( $item['fcb_choice'] ) ) {
			$choices = fcb_choices( $product );
			if ( isset( $choices[ $item['fcb_choice'] ] ) ) {
				$n   = $choices[ $item['fcb_choice'] ]['name'];
				$opt = fcb_choice_label( $product ) . ' : ' . ( function_exists( 'mb_strtolower' ) ? mb_strtolower( mb_substr( $n, 0, 1 ) ) . mb_substr( $n, 1 ) : $n );
			}
		}
		if ( fcb_has_colors( $product ) ) {
			$cn   = ! empty( $item['fcb_color'] ) ? fcb_color_name( $item['fcb_color'] ) : 'à préciser';
			$opt .= ( $opt ? ', ' : '' ) . 'couleur : ' . ( function_exists( 'mb_strtolower' ) ? mb_strtolower( $cn ) : strtolower( $cn ) );
		}
		if ( $opt ) {
			$notes[] = $opt;
		}
		if ( ! empty( $item['fcb_jar'] ) ) {
			$notes[] = ( function_exists( 'mb_strtolower' ) ? mb_strtolower( fcb_jar_label() ) : fcb_jar_label() ) . ' (+' . fcb_money( fcb_jar_price() ) . ')';
		}
		$gift = fcb_meta( $product, 'gift' );
		if ( $gift ) {
			$notes[] = function_exists( 'mb_strtolower' ) ? mb_strtolower( $gift ) : strtolower( $gift );
		}
	}
	$text = implode( ' · ', $notes );
	return function_exists( 'mb_strtoupper' ) ? mb_strtoupper( mb_substr( $text, 0, 1 ) ) . mb_substr( $text, 1 ) : ucfirst( $text );
}
