<?php
/**
 * Import des créations du site (data/creations.json + photos dans import/photos),
 * par petites étapes pour ne jamais dépasser le temps d'exécution du serveur.
 * Une création déjà présente (même référence) n'est jamais modifiée ni dupliquée.
 */

defined( 'ABSPATH' ) || exit;

function fcb_creations() {
	static $list = null;
	if ( null === $list ) {
		$file = FCB_DIR . 'data/creations.json';
		$list = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
		if ( ! is_array( $list ) ) {
			$list = array();
		}
	}
	return $list;
}

/** Catégories de la boutique (Bouquets, Fleurs à l'unité, Déco & cadeaux). */
function fcb_import_categories() {
	$ids = array();
	foreach ( fcb_categories() as $i => $cat ) {
		$term = get_term_by( 'slug', $cat['slug'], 'product_cat' );
		if ( ! $term ) {
			$res = wp_insert_term(
				$cat['name'],
				'product_cat',
				array(
					'slug'        => $cat['slug'],
					'description' => isset( $cat['intro'] ) ? $cat['intro'] : '',
				)
			);
			if ( is_wp_error( $res ) ) {
				continue;
			}
			$ids[ $cat['key'] ] = (int) $res['term_id'];
			update_term_meta( $ids[ $cat['key'] ], 'order', $i );
		} else {
			$ids[ $cat['key'] ] = (int) $term->term_id;
		}
	}
	return $ids;
}

/** Ajoute une photo du dossier import/photos à la médiathèque (une seule fois). */
function fcb_import_photo( $file, $title, &$state ) {
	$file = basename( (string) $file );
	if ( ! $file ) {
		return 0;
	}
	if ( ! empty( $state['files'][ $file ] ) && get_post( $state['files'][ $file ] ) ) {
		return (int) $state['files'][ $file ];
	}
	$src = FCB_DIR . 'import/photos/' . $file;
	if ( ! is_readable( $src ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( $file );
	if ( ! $tmp || ! copy( $src, $tmp ) ) {
		return 0;
	}
	$id = media_handle_sideload(
		array(
			'name'     => $file,
			'tmp_name' => $tmp,
		),
		0,
		$title
	);
	if ( is_wp_error( $id ) ) {
		if ( file_exists( $tmp ) ) {
			wp_delete_file( $tmp );
		}
		return 0;
	}
	update_post_meta( $id, '_wp_attachment_image_alt', $title . ' en fil chenille, création ' . fcb_brand() );
	$state['files'][ $file ] = (int) $id;
	return (int) $id;
}

/** Texte de la fiche d'une création. */
function fcb_import_description( $it ) {
	$html = ''; // la phrase de présentation est déjà dans la description courte, en haut de la fiche.
	if ( ! empty( $it['extra']['composition'] ) ) {
		$colors = fcb_colors();
		$html  .= '<ul>';
		foreach ( $it['extra']['composition'] as $c ) {
			$cn    = isset( $colors[ $c['color'] ]['name'] ) ? $colors[ $c['color'] ]['name'] : $c['color'];
			$html .= '<li><strong>' . esc_html( $cn ) . '</strong> : ' . esc_html( $c['text'] ) . '</li>';
		}
		$html .= '</ul>';
	}
	if ( ! empty( $it['count'] ) && null !== $it['price'] && abs( $it['count'] * fcb_unit_price() - $it['price'] ) < 0.01 ) {
		$html .= '<p>Ce bouquet compte ' . (int) $it['count'] . ' fleurs, à ' . esc_html( fcb_money( fcb_unit_price() ) ) . ' la fleur ; le feuillage est offert' . ( ! empty( $it['gift'] ) ? ', et le vase aussi' : '' ) . '.</p>';
	}
	$html .= '<p>Façonnée à la main dans mon atelier de ' . esc_html( fcb_city() ) . ', dans les Ardennes, elle ne fane jamais et ne demande ni eau ni entretien. Elle est emballée dans une pochette transparente fermée d’un nœud, avec sa carte de vœux offerte.</p>';
	if ( 'unite' === $it['category'] && empty( $it['extra']['jar'] ) ) {
		$html .= '<p>Sur demande, je la fixe à l’intérieur d’un bocal transparent (+' . esc_html( fcb_money( fcb_jar_price() ) ) . ') : protégée de la pluie et du vent, elle peut fleurir une sépulture.</p>';
	}
	return $html;
}

function fcb_import_one( $it, &$state, $cats ) {
	$p = new WC_Product_Simple();
	$p->set_name( $it['name'] );
	$p->set_slug( $it['slug'] );
	$p->set_status( 'publish' );
	$p->set_menu_order( (int) $it['order'] );
	$p->set_sku( $it['sku'] );
	if ( null !== $it['price'] ) {
		$p->set_regular_price( wc_format_decimal( $it['price'] ) );
	}
	$p->set_short_description( isset( $it['desc'] ) ? $it['desc'] : '' );
	$p->set_description( fcb_import_description( $it ) );
	if ( isset( $cats[ $it['category'] ] ) ) {
		$p->set_category_ids( array( $cats[ $it['category'] ] ) );
	}
	$p->set_reviews_allowed( false );
	$img = ! empty( $it['image'] ) ? fcb_import_photo( $it['image'], $it['name'], $state ) : 0;
	if ( $img ) {
		$p->set_image_id( $img );
	}
	$gallery = array();
	foreach ( (array) $it['gallery'] as $f ) {
		$g = fcb_import_photo( $f, $it['name'], $state );
		if ( $g && $g !== $img ) {
			$gallery[] = $g;
		}
	}
	$p->set_gallery_image_ids( $gallery );
	if ( ! empty( $it['unique'] ) ) {
		$p->set_sold_individually( true );
		$p->set_manage_stock( true );
		$p->set_stock_quantity( 1 );
	}
	foreach ( array( 'gift', 'badge', 'words', 'bg', 'post' ) as $k ) {
		if ( ! empty( $it[ $k ] ) ) {
			$p->update_meta_data( '_fc_' . $k, $it[ $k ] );
		}
	}
	$p->update_meta_data( '_fc_unique', ! empty( $it['unique'] ) ? 'yes' : 'no' );
	if ( ! empty( $it['count'] ) ) {
		$p->update_meta_data( '_fc_count', (int) $it['count'] );
	}
	$extra = isset( $it['extra'] ) && is_array( $it['extra'] ) ? $it['extra'] : array();
	if ( ! empty( $extra['options']['choices'] ) ) {
		foreach ( $extra['options']['choices'] as $i => $c ) {
			$extra['options']['choices'][ $i ]['image'] = ! empty( $c['image'] ) ? fcb_import_photo( $c['image'], $it['name'] . ' : ' . $c['name'], $state ) : 0;
		}
	}
	if ( ! empty( $extra['slideImage'] ) ) {
		$extra['slideImage'] = fcb_import_photo( $extra['slideImage'], $it['name'], $state );
	}
	if ( $extra ) {
		$p->update_meta_data( '_fc_data', wp_json_encode( $extra ) );
	}
	return $p->save();
}

/* ---------- Pages de contenu : fleurs, occasions, conseils, pages locales, guide ---------- */

function fcb_pages_data() {
	static $list = null;
	if ( null === $list ) {
		$file = FCB_DIR . 'data/pages.json';
		$list = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : array();
		if ( ! is_array( $list ) ) {
			$list = array();
		}
	}
	return $list;
}

/** Remplace les repères ({{home}}, {{img:g044.webp:s}}, {{creation:rose-rouge}}…) par les vraies adresses. */
function fcb_resolve( $html, $state ) {
	$theme = trailingslashit( get_template_directory_uri() );
	$files = isset( $state['files'] ) ? $state['files'] : array();
	return preg_replace_callback(
		'/\{\{(home|theme|img|photo|creation)(?::([^}]*))?\}\}/',
		function ( $m ) use ( $files, $theme ) {
			$arg = isset( $m[2] ) ? $m[2] : '';
			switch ( $m[1] ) {
				case 'home':
					return home_url( '/' );
				case 'theme':
					return $theme;
				case 'img':
					$bits = array_pad( explode( ':', $arg ), 2, 'l' );
					$id   = isset( $files[ $bits[0] ] ) ? (int) $files[ $bits[0] ] : 0;
					$url  = $id ? wp_get_attachment_image_url( $id, 's' === $bits[1] ? 'medium_large' : 'full' ) : '';
					return $url ? $url : FCB_URL . 'import/photos/' . $bits[0];
				case 'photo':
					$id  = isset( $files[ $arg ] ) ? (int) $files[ $arg ] : 0;
					$url = $id ? wp_get_attachment_image_url( $id, 'full' ) : '';
					return $url ? $url : $theme . 'assets/photos/' . $arg;
				case 'creation':
					$p = get_page_by_path( $arg, OBJECT, 'product' );
					return $p ? get_permalink( $p ) : home_url( '/creation/' . $arg . '/' );
			}
			return '';
		},
		$html
	);
}

function fcb_import_page( $pg, &$state ) {
	$existing = get_page_by_path( $pg['path'] );
	if ( $existing ) {
		return (int) $existing->ID;
	}
	$parts  = explode( '/', $pg['path'] );
	$slug   = array_pop( $parts );
	$parent = 0;
	if ( $parts ) {
		$pp     = get_page_by_path( implode( '/', $parts ) );
		$parent = $pp ? (int) $pp->ID : 0;
	}
	$kses = has_filter( 'content_save_pre', 'wp_filter_post_kses' );
	kses_remove_filters(); // contenu préparé par l'atelier : on le garde tel quel (photos, liens).
	$id = wp_insert_post(
		array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'post_title'     => $pg['h1'],
			'post_name'      => $slug,
			'post_parent'    => $parent,
			'comment_status' => 'closed',
			'post_content'   => "<!-- wp:html -->\n" . fcb_resolve( $pg['html'], $state ) . "\n<!-- /wp:html -->",
		),
		true
	);
	if ( $kses ) {
		kses_init_filters();
	}
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	$meta = array(
		'_fc_seo_page'          => 1,
		'_fc_title'             => $pg['title'],
		'_fc_desc'              => $pg['desc'],
		'_yoast_wpseo_title'    => $pg['title'] . ' | Flore & Chenilles',
		'_yoast_wpseo_metadesc' => $pg['desc'],
		'rank_math_title'       => $pg['title'] . ' | Flore & Chenilles',
		'rank_math_description' => $pg['desc'],
	);
	foreach ( $meta as $k => $v ) {
		update_post_meta( $id, $k, $v );
	}
	return (int) $id;
}

/** Une étape d'import : quelques créations à la fois, puis les pages de contenu. */
function fcb_import_step( $limit = 3 ) {
	$items = fcb_creations();
	$state = get_option( 'fcb_import', array() );
	$state = array_merge(
		array(
			'done'  => array(),
			'files' => array(),
		),
		is_array( $state ) ? $state : array()
	);
	$cats  = fcb_import_categories();
	$n     = 0;
	foreach ( $items as $it ) {
		if ( isset( $state['done'][ $it['sku'] ] ) ) {
			continue;
		}
		$existing = wc_get_product_id_by_sku( $it['sku'] );
		if ( $existing ) {
			$state['done'][ $it['sku'] ] = (int) $existing;
			continue;
		}
		if ( $n >= $limit ) {
			break;
		}
		$id                          = fcb_import_one( $it, $state, $cats );
		$state['done'][ $it['sku'] ] = $id ? (int) $id : 0;
		$n++;
		update_option( 'fcb_import', $state, false );
	}
	update_option( 'fcb_import', $state, false );
	$pages = fcb_pages_data();
	if ( ! isset( $state['pages'] ) ) {
		$state['pages'] = array();
	}
	if ( count( $state['done'] ) >= count( $items ) && $n < $limit ) {
		$k = 0;
		foreach ( $pages as $pg ) {
			if ( isset( $state['pages'][ $pg['path'] ] ) ) {
				continue;
			}
			if ( $k >= 12 ) {
				break;
			}
			$state['pages'][ $pg['path'] ] = fcb_import_page( $pg, $state );
			$k++;
		}
		update_option( 'fcb_import', $state, false );
	}
	$done  = count( $state['done'] ) + count( $state['pages'] );
	$total = count( $items ) + count( $pages );
	if ( $done >= $total ) {
		fcb_ensure_bouquet_product();
		fcb_flush_payload();
	}
	return array(
		'done'     => $done,
		'total'    => $total,
		'finished' => $done >= $total,
	);
}
