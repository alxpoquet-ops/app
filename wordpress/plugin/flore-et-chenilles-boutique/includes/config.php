<?php
/**
 * Réglages, catalogue (fleurs, couleurs, catégories) et petites aides partagées.
 */

defined( 'ABSPATH' ) || exit;

/** Catalogue fixe : fleurs et couleurs du compositeur, catégories, textes (data/catalog.json). */
function fcb_catalog() {
	static $catalog = null;
	if ( null === $catalog ) {
		$file    = FCB_DIR . 'data/catalog.json';
		$catalog = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
		if ( ! is_array( $catalog ) ) {
			$catalog = array();
		}
	}
	return $catalog;
}

/** Réglages par défaut (modifiables dans WooCommerce › Flore & Chenilles). */
function fcb_defaults() {
	$c     = fcb_catalog();
	$promo = isset( $c['promo'] ) && is_array( $c['promo'] ) ? $c['promo'] : array();
	return array(
		'contact_email'  => ! empty( $c['contact']['email'] ) ? $c['contact']['email'] : get_option( 'admin_email' ),
		'show_email'     => 'yes',
		'autoreply'      => 'yes',
		'facebook'       => '',
		'instagram'      => ! empty( $c['brand']['instagram'] ) ? $c['brand']['instagram'] : '',
		'instagram_feed' => '',
		'unit_price'     => isset( $c['unitPrice'] ) ? (float) $c['unitPrice'] : 8,
		'jar_price'      => isset( $c['jar']['price'] ) ? (float) $c['jar']['price'] : 5,
		'promo_label'    => isset( $promo['label'] ) ? $promo['label'] : 'Offre de lancement',
		'promo_percent'  => isset( $promo['percent'] ) ? (float) $promo['percent'] : 0,
		'promo_from'     => isset( $promo['from'] ) ? $promo['from'] : '',
		'promo_until'    => isset( $promo['until'] ) ? $promo['until'] : '',
		'vat_note'       => 'yes',
	);
}

function fcb_settings() {
	return wp_parse_args( (array) get_option( 'fcb_settings', array() ), fcb_defaults() );
}

function fcb_opt( $key ) {
	$s = fcb_settings();
	return isset( $s[ $key ] ) ? $s[ $key ] : null;
}

function fcb_brand() {
	$c = fcb_catalog();
	return ! empty( $c['brand']['name'] ) ? $c['brand']['name'] : get_bloginfo( 'name' );
}

function fcb_unit_price() {
	return max( 0, (float) fcb_opt( 'unit_price' ) );
}

function fcb_jar_price() {
	return max( 0, (float) fcb_opt( 'jar_price' ) );
}

function fcb_jar_label() {
	$c = fcb_catalog();
	return ! empty( $c['jar']['label'] ) ? $c['jar']['label'] : 'Dans un bocal transparent';
}

/** Pourcentage de l'offre de lancement en cours (0 en dehors des dates). */
function fcb_promo_percent() {
	$p = (float) fcb_opt( 'promo_percent' );
	if ( $p <= 0 || $p >= 100 ) {
		return 0;
	}
	$today = wp_date( 'Y-m-d' );
	$from  = (string) fcb_opt( 'promo_from' );
	$until = (string) fcb_opt( 'promo_until' );
	if ( ( $from && $today < $from ) || ( $until && $today > $until ) ) {
		return 0;
	}
	return $p;
}

/** Montant après l'offre de lancement. */
function fcb_with_promo( $amount ) {
	$pct = fcb_promo_percent();
	if ( ! $pct || '' === $amount || null === $amount ) {
		return $amount;
	}
	$decimals = function_exists( 'wc_get_price_decimals' ) ? wc_get_price_decimals() : 2;
	return round( (float) $amount * ( 100 - $pct ) / 100, $decimals );
}

/** Prix au format français : « 8 € », « 43,20 € ». */
function fcb_money( $n ) {
	$n = (float) $n;
	$s = ( floor( $n ) == $n ) ? number_format( $n, 0, ',', ' ' ) : number_format( $n, 2, ',', ' ' );
	return $s . ' €';
}

/* ---------- Catégories : slug WordPress → clé utilisée par le site ---------- */

function fcb_categories() {
	$c = fcb_catalog();
	return isset( $c['categories'] ) && is_array( $c['categories'] ) ? $c['categories'] : array();
}

function fcb_category_key( $product ) {
	if ( ! $product ) {
		return '';
	}
	$map = array();
	foreach ( fcb_categories() as $cat ) {
		$map[ $cat['slug'] ] = $cat['key'];
	}
	$first = '';
	foreach ( $product->get_category_ids() as $id ) {
		$t = get_term( $id, 'product_cat' );
		if ( ! $t || is_wp_error( $t ) ) {
			continue;
		}
		if ( isset( $map[ $t->slug ] ) ) {
			return $map[ $t->slug ];
		}
		if ( ! $first ) {
			$first = $t->slug;
		}
	}
	return $first;
}

/* ---------- Données d'une création ---------- */

function fcb_meta( $product, $key ) {
	return $product ? $product->get_meta( '_fc_' . $key, true ) : '';
}

/** Création unique : un seul exemplaire (tout ce qui est dans un vase). */
function fcb_is_unique( $product ) {
	return 'yes' === fcb_meta( $product, 'unique' );
}

/** Données complémentaires (choix de fleurs, composition, bouquet modèle…). */
function fcb_extra( $product ) {
	$d = fcb_meta( $product, 'data' );
	if ( is_string( $d ) && '' !== $d ) {
		$d = json_decode( $d, true );
	}
	return is_array( $d ) ? $d : array();
}

function fcb_is_unit( $product ) {
	return 'unite' === fcb_category_key( $product );
}

/** Les fleurs à l'unité peuvent être fixées dans un bocal transparent (en option). */
function fcb_has_jar_option( $product ) {
	$x = fcb_extra( $product );
	return fcb_is_unit( $product ) && empty( $x['jar'] ) && fcb_jar_price() > 0;
}

function fcb_choices( $product ) {
	$x = fcb_extra( $product );
	return isset( $x['options']['choices'] ) && is_array( $x['options']['choices'] ) ? array_values( $x['options']['choices'] ) : array();
}

function fcb_choice_label( $product ) {
	$x = fcb_extra( $product );
	return ! empty( $x['options']['label'] ) ? $x['options']['label'] : 'Votre fleur';
}

function fcb_has_colors( $product ) {
	$x = fcb_extra( $product );
	return ! empty( $x['options']['colors'] );
}

function fcb_colors() {
	$c = fcb_catalog();
	return isset( $c['colors'] ) && is_array( $c['colors'] ) ? $c['colors'] : array();
}

function fcb_color_name( $key ) {
	$colors = fcb_colors();
	return isset( $colors[ $key ]['name'] ) ? $colors[ $key ]['name'] : '';
}

function fcb_flowers() {
	$c = fcb_catalog();
	return isset( $c['flowers'] ) && is_array( $c['flowers'] ) ? $c['flowers'] : array();
}

/* ---------- Carte de vœux ---------- */

function fcb_card_max() {
	$c = fcb_catalog();
	return ! empty( $c['card']['maxLength'] ) ? (int) $c['card']['maxLength'] : 160;
}

/** Carte nettoyée (pour, message, de la part de), ou null si elle est vide. */
function fcb_clean_card( $card ) {
	if ( ! is_array( $card ) ) {
		return null;
	}
	$cut  = function ( $v, $n ) {
		$v = trim( preg_replace( '/[ \t]+/', ' ', sanitize_textarea_field( is_scalar( $v ) ? (string) $v : '' ) ) );
		return function_exists( 'mb_substr' ) ? mb_substr( $v, 0, $n ) : substr( $v, 0, $n );
	};
	$out = array(
		'to'   => $cut( isset( $card['to'] ) ? $card['to'] : '', 40 ),
		'msg'  => $cut( isset( $card['msg'] ) ? $card['msg'] : '', fcb_card_max() ),
		'from' => $cut( isset( $card['from'] ) ? $card['from'] : '', 40 ),
	);
	$out['to']   = str_replace( array( "\r", "\n" ), ' ', $out['to'] );
	$out['from'] = str_replace( array( "\r", "\n" ), ' ', $out['from'] );
	return ( '' === $out['to'] && '' === $out['msg'] && '' === $out['from'] ) ? null : $out;
}

function fcb_card_line( $card ) {
	$card = fcb_clean_card( $card );
	if ( ! $card ) {
		return '';
	}
	$parts = array();
	if ( $card['to'] ) {
		$parts[] = 'Pour ' . $card['to'];
	}
	if ( $card['msg'] ) {
		$parts[] = '« ' . $card['msg'] . ' »';
	}
	if ( $card['from'] ) {
		$parts[] = 'de la part de ' . $card['from'];
	}
	return implode( ', ', $parts );
}

/* ---------- Bouquet composé sur le site ---------- */

function fcb_builder_max() {
	$c = fcb_catalog();
	return ! empty( $c['builder']['max'] ) ? (int) $c['builder']['max'] : 20;
}

/** Bouquet vérifié : liste de [fleur, couleur], ou null. */
function fcb_clean_bouquet( $list ) {
	if ( ! is_array( $list ) ) {
		return null;
	}
	$flowers = fcb_flowers();
	$colors  = fcb_colors();
	$out     = array();
	foreach ( $list as $f ) {
		if ( ! is_array( $f ) || empty( $f[0] ) ) {
			continue;
		}
		$type = sanitize_key( $f[0] );
		if ( ! isset( $flowers[ $type ] ) ) {
			continue;
		}
		$fixed = ! empty( $flowers[ $type ]['fixedColor'] ) ? $flowers[ $type ]['fixedColor'] : '';
		$color = $fixed ? $fixed : sanitize_key( isset( $f[1] ) ? $f[1] : '' );
		if ( ! $fixed && ! isset( $colors[ $color ] ) ) {
			continue;
		}
		$out[] = array( $type, $color );
		if ( count( $out ) >= fcb_builder_max() ) {
			break;
		}
	}
	return $out ? $out : null;
}

function fcb_bouquet_count( $list ) {
	$flowers = fcb_flowers();
	$n       = 0;
	foreach ( (array) $list as $f ) {
		if ( empty( $flowers[ $f[0] ]['foliage'] ) ) {
			$n++;
		}
	}
	return $n;
}

/** Prix d'un bouquet composé : une fleur = le prix d'une fleur, feuillage offert. */
function fcb_bouquet_price( $list ) {
	return fcb_bouquet_count( $list ) * fcb_unit_price();
}

/** « 3 roses (2 rose, 1 blanc), 2 feuillages » */
function fcb_describe_bouquet( $list ) {
	$flowers = fcb_flowers();
	$groups  = array();
	foreach ( (array) $list as $f ) {
		$groups[ $f[0] ][ $f[1] ] = ( isset( $groups[ $f[0] ][ $f[1] ] ) ? $groups[ $f[0] ][ $f[1] ] : 0 ) + 1;
	}
	$parts = array();
	foreach ( $groups as $type => $cols ) {
		$info = isset( $flowers[ $type ] ) ? $flowers[ $type ] : array( 'name' => $type, 'plural' => $type );
		$n    = array_sum( $cols );
		$name = function_exists( 'mb_strtolower' ) ? mb_strtolower( $n > 1 ? $info['plural'] : $info['name'] ) : strtolower( $n > 1 ? $info['plural'] : $info['name'] );
		$det  = '';
		if ( empty( $info['fixedColor'] ) ) {
			$bits = array();
			foreach ( $cols as $c => $k ) {
				$cn     = fcb_color_name( $c );
				$cn     = function_exists( 'mb_strtolower' ) ? mb_strtolower( $cn ) : strtolower( $cn );
				$bits[] = ( count( $cols ) > 1 ? $k . ' ' : '' ) . $cn;
			}
			$det = ' (' . implode( ', ', $bits ) . ')';
		}
		$parts[] = $n . ' ' . $name . $det;
	}
	return implode( ', ', $parts );
}

/** Le produit caché qui sert de support aux bouquets composés sur le site. */
function fcb_bouquet_product_id() {
	return (int) get_option( 'fcb_bouquet_product', 0 );
}

/** Identifiant d'une création côté site (sa référence, ou p + numéro). */
function fcb_front_id( $product ) {
	if ( ! $product ) {
		return '';
	}
	$sku = $product->get_sku();
	return $sku ? $sku : 'p' . $product->get_id();
}

/** Vide le cache des créations affichées sur le site. */
function fcb_flush_payload() {
	delete_transient( 'fcb_products_v1' );
}

/* Repères des pages de contenu, modifiables par l'API WordPress (assistant, MCP) pour les gérants. */
add_action(
	'init',
	function () {
		foreach ( array( '_fc_seo_page' => 'integer', '_fc_title' => 'string', '_fc_desc' => 'string' ) as $key => $type ) {
			register_post_meta(
				'page',
				$key,
				array(
					'type'          => $type,
					'single'        => true,
					'show_in_rest'  => true,
					'auth_callback' => function () {
						return current_user_can( 'edit_pages' );
					},
				)
			);
		}
	}
);

/* Plan du site (wp-sitemap.xml) : sans la liste des comptes (elle montre l'identifiant de connexion)
   ni le support caché des bouquets composés. */
add_filter(
	'wp_sitemaps_add_provider',
	function ( $provider, $name ) {
		return 'users' === $name ? false : $provider;
	},
	10,
	2
);
add_filter(
	'wp_sitemaps_posts_query_args',
	function ( $args, $post_type ) {
		if ( 'product' === $post_type && fcb_bouquet_product_id() ) {
			$args['post__not_in'] = array_merge( isset( $args['post__not_in'] ) ? (array) $args['post__not_in'] : array(), array( fcb_bouquet_product_id() ) );
		}
		return $args;
	},
	10,
	2
);
/* Même chose avec Rank Math : le support caché des bouquets reste hors du plan du site et hors de Google. */
add_filter(
	'rank_math/sitemap/posts_to_exclude',
	function ( $ids ) {
		$id = fcb_bouquet_product_id();
		if ( $id ) {
			$ids   = (array) $ids;
			$ids[] = $id;
		}
		return $ids;
	}
);
add_filter(
	'rank_math/frontend/robots',
	function ( $robots ) {
		$id = fcb_bouquet_product_id();
		if ( $id && is_singular( 'product' ) && get_queried_object_id() === $id ) {
			$robots['index']  = 'noindex';
			$robots['follow'] = 'nofollow';
		}
		return $robots;
	}
);
/* Les pages d'auteur ne servent à rien sur une boutique : retour à l'accueil. */
add_action(
	'template_redirect',
	function () {
		if ( is_author() ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	}
);
