<?php
/**
 * Adresses utilisées par la page d'accueil :
 *   GET  /wp-json/fc/v1/cart          la sélection (panier WooCommerce)
 *   POST /wp-json/fc/v1/cart/add      ajouter une création ou un bouquet composé
 *   POST /wp-json/fc/v1/cart/update   changer une quantité
 *   POST /wp-json/fc/v1/cart/remove   retirer une création
 *   POST /wp-json/fc/v1/cart/card     écrire ou modifier une carte de vœux
 *   POST /wp-json/fc/v1/contact       formulaire de contact (e-mail à l'atelier)
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'rest_api_init',
	function () {
		$routes = array(
			'/cart'        => array( 'GET', 'fcb_rest_cart' ),
			'/cart/add'    => array( 'POST', 'fcb_rest_cart_add' ),
			'/cart/update' => array( 'POST', 'fcb_rest_cart_update' ),
			'/cart/remove' => array( 'POST', 'fcb_rest_cart_remove' ),
			'/cart/card'   => array( 'POST', 'fcb_rest_cart_card' ),
			'/contact'     => array( 'POST', 'fcb_rest_contact' ),
		);
		/* Administration à distance (assistant, MCP) : réservée aux gérants de la boutique. */
		$admin = array(
			'/admin/status' => array( 'GET', 'fcb_rest_admin_status' ),
			'/admin/setup'  => array( 'POST', 'fcb_rest_admin_setup' ),
			'/admin/import' => array( 'POST', 'fcb_rest_admin_import' ),
		);
		foreach ( $admin as $route => $def ) {
			register_rest_route(
				'fc/v1',
				$route,
				array(
					'methods'             => $def[0],
					'callback'            => $def[1],
					'permission_callback' => function () {
						return current_user_can( 'manage_woocommerce' );
					},
				)
			);
		}
		foreach ( $routes as $route => $def ) {
			register_rest_route(
				'fc/v1',
				$route,
				array(
					'methods'             => $def[0],
					'callback'            => $def[1],
					'permission_callback' => 'GET' === $def[0] ? '__return_true' : 'fcb_rest_same_site',
				)
			);
		}
	}
);

/**
 * Boutique publique, mais seulement depuis le site lui-même : l'en-tête X-FC-Shop ne peut pas être envoyé
 * par un autre site (le navigateur le bloque), et l'origine de la demande, si elle est indiquée, doit être la nôtre.
 */
function fcb_rest_same_site( WP_REST_Request $r ) {
	if ( '1' !== (string) $r->get_header( 'x_fc_shop' ) ) {
		return new WP_Error( 'fcb_forbidden', 'Demande refusée.', array( 'status' => 403 ) );
	}
	$origin = (string) $r->get_header( 'origin' );
	if ( '' !== $origin && wp_parse_url( $origin, PHP_URL_HOST ) !== wp_parse_url( home_url(), PHP_URL_HOST ) ) {
		return new WP_Error( 'fcb_forbidden', 'Demande refusée.', array( 'status' => 403 ) );
	}
	return true;
}

/** Charge le panier du visiteur (session WooCommerce). */
function fcb_rest_boot() {
	if ( ! function_exists( 'wc_load_cart' ) ) {
		return new WP_Error( 'fcb_no_cart', 'La boutique est momentanément indisponible.', array( 'status' => 503 ) );
	}
	wc_load_cart();
	WC()->cart->get_cart();
	return true;
}

function fcb_rest_error( $message, $status = 400 ) {
	$res = new WP_REST_Response(
		array_merge(
			array(
				'ok'      => false,
				'message' => $message,
			),
			WC()->cart ? fcb_cart_state() : array()
		),
		$status
	);
	$res->header( 'Cache-Control', 'no-store' );
	return $res;
}

/** Dernier message d'erreur de WooCommerce (« plus en stock »…), en texte simple. */
function fcb_wc_error() {
	$msg = '';
	foreach ( wc_get_notices( 'error' ) as $n ) {
		$msg = wp_strip_all_tags( is_array( $n ) ? $n['notice'] : $n );
	}
	wc_clear_notices();
	return html_entity_decode( $msg, ENT_QUOTES, 'UTF-8' );
}

/** Réponse : la sélection à jour, et les cookies de session pour la retrouver ensuite. */
function fcb_rest_done( $extra = array() ) {
	WC()->cart->calculate_totals();
	$empty = WC()->cart->is_empty();
	if ( ! $empty && WC()->session ) {
		WC()->session->set_customer_session_cookie( true );
	}
	if ( ! headers_sent() ) {
		if ( $empty ) {
			wc_setcookie( 'woocommerce_items_in_cart', 0, time() - HOUR_IN_SECONDS );
			wc_setcookie( 'woocommerce_cart_hash', '', time() - HOUR_IN_SECONDS );
		} else {
			wc_setcookie( 'woocommerce_items_in_cart', 1 );
			wc_setcookie( 'woocommerce_cart_hash', WC()->cart->get_cart_hash() );
		}
	}
	$res = rest_ensure_response( array_merge( array( 'ok' => true ), fcb_cart_state(), $extra ) );
	$res->header( 'Cache-Control', 'no-store' );
	return $res;
}

/** La sélection au format du site. */
function fcb_cart_state() {
	$items = array();
	$sum   = 0;
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		$product = wc_get_product( $item['product_id'] );
		if ( ! $product ) {
			continue;
		}
		$qty    = (int) $item['quantity'];
		$unit   = fcb_item_regular_unit( $item );
		$paid   = (float) $item['line_subtotal'];
		$sum   += null === $unit ? $paid : $unit * $qty;
		$custom = ! empty( $item['fcb_bouquet'] );
		$thumb  = $product->get_image_id() ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : '';
		$items[] = array(
			'key'     => $key,
			'kind'    => $custom ? 'custom' : 'product',
			'id'      => fcb_front_id( $product ),
			'wcId'    => $product->get_id(),
			'name'    => $custom ? 'Mon bouquet à moi' : $product->get_name(),
			'option'  => fcb_item_option_text( $item ),
			'card'    => ! empty( $item['fcb_card'] ) ? $item['fcb_card'] : null,
			'qty'     => $qty,
			'unique'  => fcb_is_unique( $product ),
			'price'   => $unit,
			'paid'    => round( $paid, 2 ),
			'choice'  => isset( $item['fcb_choice'] ) ? (int) $item['fcb_choice'] : 0,
			'color'   => isset( $item['fcb_color'] ) ? $item['fcb_color'] : '',
			'bouquet' => $custom ? array( 'flowers' => $item['fcb_bouquet'] ) : null,
			'thumb'   => $thumb ? $thumb : '',
		);
	}
	$total = (float) WC()->cart->get_subtotal();
	return array(
		'items' => $items,
		'count' => WC()->cart->get_cart_contents_count(),
		'sum'   => round( $sum, 2 ),
		'total' => round( $total, 2 ),
		'disc'  => round( max( 0, $sum - $total ), 2 ),
	);
}

function fcb_rest_cart() {
	$boot = fcb_rest_boot();
	if ( is_wp_error( $boot ) ) {
		return $boot;
	}
	return fcb_rest_done();
}

function fcb_rest_cart_add( WP_REST_Request $r ) {
	$boot = fcb_rest_boot();
	if ( is_wp_error( $boot ) ) {
		return $boot;
	}
	$card = fcb_clean_card( $r->get_param( 'card' ) );

	/* Bouquet composé dans « Votre bouquet à vous » : le prix est recalculé ici, fleur par fleur. */
	if ( null !== $r->get_param( 'bouquet' ) ) {
		$list = fcb_clean_bouquet( $r->get_param( 'bouquet' ) );
		if ( ! $list || ! fcb_bouquet_count( $list ) ) {
			return fcb_rest_error( 'Ajoutez au moins une fleur à votre bouquet.' );
		}
		$pid = fcb_ensure_bouquet_product();
		if ( ! $pid ) {
			return fcb_rest_error( 'Le compositeur est momentanément indisponible.', 503 );
		}
		$data = array(
			'fcb_bouquet' => $list,
			'fcb_uid'     => wp_generate_uuid4(),
		);
		if ( $card ) {
			$data['fcb_card'] = $card;
		}
		$key = WC()->cart->add_to_cart( $pid, 1, 0, array(), $data );
		if ( ! $key ) {
			return fcb_rest_error( fcb_wc_error() ? fcb_wc_error() : 'Votre bouquet n’a pas pu être ajouté.' );
		}
		wc_clear_notices();
		return fcb_rest_done( array( 'added' => $key ) );
	}

	$product = wc_get_product( absint( $r->get_param( 'product' ) ) );
	if ( ! $product || 'publish' !== $product->get_status() || $product->get_id() === fcb_bouquet_product_id() ) {
		return fcb_rest_error( 'Cette création est introuvable.', 404 );
	}
	if ( ! $product->is_in_stock() ) {
		return fcb_rest_error( fcb_is_unique( $product ) ? 'Cette création unique a déjà trouvé sa maison.' : 'Cette création n’est plus disponible pour le moment.' );
	}
	if ( ! $product->is_purchasable() || ! $product->is_type( 'simple' ) ) {
		return fcb_rest_error( 'Cette création se commande sur sa fiche.' );
	}
	$data = fcb_prepare_item(
		$product,
		array(
			'choice' => $r->get_param( 'choice' ),
			'color'  => $r->get_param( 'color' ),
			'jar'    => (bool) $r->get_param( 'jar' ),
			'card'   => $card,
		)
	);
	if ( is_wp_error( $data ) ) {
		return fcb_rest_error( $data->get_error_message() );
	}
	$qty = max( 1, min( 30, (int) $r->get_param( 'qty' ) ) );
	if ( fcb_is_unique( $product ) ) {
		foreach ( WC()->cart->get_cart() as $item ) {
			if ( (int) $item['product_id'] === $product->get_id() ) {
				return fcb_rest_error( sprintf( '« %s » est une création unique, déjà dans votre sélection.', $product->get_name() ) );
			}
		}
		$qty = 1;
	}
	$key = WC()->cart->add_to_cart( $product->get_id(), $qty, 0, array(), $data );
	if ( ! $key ) {
		$msg = fcb_wc_error();
		return fcb_rest_error( $msg ? $msg : 'Cette création n’a pas pu être ajoutée.' );
	}
	wc_clear_notices();
	return fcb_rest_done( array( 'added' => $key ) );
}

function fcb_rest_cart_update( WP_REST_Request $r ) {
	$boot = fcb_rest_boot();
	if ( is_wp_error( $boot ) ) {
		return $boot;
	}
	$key  = sanitize_text_field( (string) $r->get_param( 'key' ) );
	$item = WC()->cart->get_cart_item( $key );
	if ( ! $item ) {
		return fcb_rest_error( 'Cette création n’est plus dans votre sélection.', 404 );
	}
	$qty = max( 0, min( 99, (int) $r->get_param( 'qty' ) ) );
	if ( $qty > 1 && fcb_is_unique( wc_get_product( $item['product_id'] ) ) ) {
		$qty = 1;
	}
	WC()->cart->set_quantity( $key, $qty, true );
	$msg = fcb_wc_error();
	return $msg ? fcb_rest_error( $msg ) : fcb_rest_done();
}

function fcb_rest_cart_remove( WP_REST_Request $r ) {
	$boot = fcb_rest_boot();
	if ( is_wp_error( $boot ) ) {
		return $boot;
	}
	WC()->cart->remove_cart_item( sanitize_text_field( (string) $r->get_param( 'key' ) ) );
	wc_clear_notices();
	return fcb_rest_done();
}

function fcb_rest_cart_card( WP_REST_Request $r ) {
	$boot = fcb_rest_boot();
	if ( is_wp_error( $boot ) ) {
		return $boot;
	}
	$key      = sanitize_text_field( (string) $r->get_param( 'key' ) );
	$contents = WC()->cart->get_cart();
	if ( ! isset( $contents[ $key ] ) ) {
		return fcb_rest_error( 'Cette création n’est plus dans votre sélection.', 404 );
	}
	$card = fcb_clean_card( $r->get_param( 'card' ) );
	if ( $card ) {
		$contents[ $key ]['fcb_card'] = $card;
	} else {
		unset( $contents[ $key ]['fcb_card'] );
	}
	WC()->cart->set_cart_contents( $contents );
	WC()->cart->set_session();
	return fcb_rest_done();
}

/* ---------- Formulaire de contact ---------- */

function fcb_rest_contact( WP_REST_Request $r ) {
	$p = $r->get_json_params();
	if ( ! is_array( $p ) ) {
		$p = $r->get_body_params();
	}
	$g = function ( $k ) use ( $p ) {
		return isset( $p[ $k ] ) && is_scalar( $p[ $k ] ) ? (string) $p[ $k ] : '';
	};
	if ( '' !== trim( $g( '_honey' ) ) ) {
		return array( 'ok' => true ); // robot : on ne fait rien.
	}
	$name    = sanitize_text_field( $g( 'name' ) );
	$email   = sanitize_email( $g( 'email' ) );
	$message = sanitize_textarea_field( $g( 'message' ) );
	if ( '' === $name || ! is_email( $email ) || '' === trim( $message ) ) {
		return new WP_Error( 'fcb_invalid', 'Il manque juste une petite information.', array( 'status' => 400 ) );
	}
	$ip   = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$lock = 'fcb_contact_' . md5( $ip );
	$sent = (int) get_transient( $lock );
	if ( $sent >= 5 ) {
		return new WP_Error( 'fcb_slow', 'Beaucoup de messages en peu de temps : réessayez dans quelques minutes.', array( 'status' => 429 ) );
	}
	set_transient( $lock, $sent + 1, 15 * MINUTE_IN_SECONDS );

	$subject = sanitize_text_field( $g( 'subject' ) );
	$phone   = sanitize_text_field( $g( 'phone' ) );
	$date    = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $g( 'date' ) ) ? $g( 'date' ) : '';
	$brand   = fcb_brand();
	$lines   = array( 'Bonjour ' . $brand . ' !', '', trim( $message ), '', $name, 'E-mail : ' . $email );
	if ( $phone ) {
		$lines[] = 'Téléphone : ' . $phone;
	}
	if ( $subject ) {
		$lines[] = 'Sujet : ' . $subject;
	}
	if ( $date ) {
		$lines[] = 'Date souhaitée : ' . wp_date( 'j F Y', strtotime( $date . ' 12:00:00' ) );
	}
	$lines[] = '';
	$lines[] = 'Envoyé depuis ' . home_url( '/' );

	$to   = fcb_opt( 'contact_email' );
	$to   = is_email( $to ) ? $to : get_option( 'admin_email' );
	$head = array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>' );
	$ok   = wp_mail( $to, sprintf( '[%s] %s : %s', $brand, $subject ? $subject : 'Un message', $name ), implode( "\n", $lines ), $head );
	if ( ! $ok ) {
		return new WP_Error( 'fcb_mail', 'Votre message n’est pas parti.', array( 'status' => 500 ) );
	}
	if ( 'yes' === fcb_opt( 'autoreply' ) ) {
		wp_mail(
			$email,
			'Merci pour votre message, ' . $brand,
			"Bonjour {$name},\n\nMerci pour votre message ! Je l’ai bien reçu et je vous réponds très vite.\n\nLaurine, {$brand}\n" . home_url( '/' ),
			array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $brand . ' <' . $to . '>' )
		);
	}
	return array( 'ok' => true );
}

/* ---------- Administration à distance ---------- */

function fcb_rest_admin_status() {
	$rows = array();
	foreach ( fcb_checklist() as $row ) {
		$rows[] = array(
			'ok'   => (bool) $row[0],
			'text' => $row[1],
		);
	}
	return array(
		'checklist' => $rows,
		'theme'     => get_stylesheet(),
		'settings'  => fcb_settings(),
	);
}

function fcb_rest_admin_setup() {
	fcb_setup_store();
	return fcb_rest_admin_status();
}

function fcb_rest_admin_import() {
	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	}
	return fcb_import_step( 3 );
}
