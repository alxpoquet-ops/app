<?php
/**
 * Fiche d'une création (page WooCommerce) : vignettes, choix de la fleur et de la couleur,
 * option bocal, carte de vœux offerte, mention « Vendue » pour une création unique.
 */

defined( 'ABSPATH' ) || exit;

/** Vignettes d'une création : création unique, vase / pot offert, bocal en option. */
function fcb_badges_html( $product ) {
	if ( ! $product ) {
		return '';
	}
	$out   = '';
	$badge = fcb_meta( $product, 'badge' );
	if ( $badge ) {
		$out .= '<span class="fc-tag is-new">' . esc_html( $badge ) . '</span>';
	}
	if ( fcb_is_unique( $product ) ) {
		$out .= '<span class="fc-tag is-unique">✦ Création unique</span>';
	}
	$gift = fcb_meta( $product, 'gift' );
	if ( $gift ) {
		$out .= '<span class="fc-tag ' . ( false !== stripos( $gift, 'pot' ) ? 'is-pot' : 'is-gift' ) . '">' . esc_html( $gift ) . '</span>';
	}
	if ( fcb_has_jar_option( $product ) ) {
		$out .= '<span class="fc-tag is-jar">Bocal en option</span>';
	}
	return $out ? '<div class="fc-tags">' . $out . '</div>' : '';
}

add_action(
	'woocommerce_single_product_summary',
	function () {
		global $product;
		echo fcb_badges_html( $product ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- échappé plus haut.
	},
	4
);
add_action(
	'woocommerce_before_shop_loop_item_title',
	function () {
		global $product;
		echo fcb_badges_html( $product ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	11
);

/* Sous le prix : le mot de Laurine et le détail du prix d'un bouquet. */
add_action(
	'woocommerce_single_product_summary',
	function () {
		global $product;
		if ( ! $product ) {
			return;
		}
		$count = (int) fcb_meta( $product, 'count' );
		$reg   = (float) $product->get_regular_price( 'edit' );
		if ( $count > 0 && abs( $count * fcb_unit_price() - $reg ) < 0.01 ) {
			$gift = fcb_meta( $product, 'gift' );
			echo '<p class="fc-count-line">' . esc_html( $count . ' fleurs × ' . fcb_money( fcb_unit_price() ) . ( $gift ? ' · ' . strtolower( $gift ) : '' ) ) . '</p>';
		}
		$words = fcb_meta( $product, 'words' );
		if ( $words ) {
			echo '<blockquote class="fc-words"><p>« ' . esc_html( $words ) . ' »</p><cite>Laurine, ' . esc_html( fcb_brand() ) . '</cite></blockquote>';
		}
		if ( fcb_is_unique( $product ) && $product->is_in_stock() ) {
			echo '<p class="fc-unique-note"><strong>Création unique</strong> Il n’en existe qu’un seul exemplaire' . ( false !== stripos( (string) fcb_meta( $product, 'gift' ), 'vase' ) ? ', avec son vase.' : '.' ) . '</p>';
		}
	},
	15
);

/* Champs ajoutés au formulaire « Ajouter au panier ». */
add_action(
	'woocommerce_before_add_to_cart_button',
	function () {
		global $product;
		if ( ! $product || $product->get_id() === fcb_bouquet_product_id() ) {
			return;
		}
		echo '<input type="hidden" name="fcb_form" value="1">';
		$choices = fcb_choices( $product );
		if ( $choices ) {
			echo '<p class="fc-field"><label for="fcb_choice">' . esc_html( fcb_choice_label( $product ) ) . '</label><select id="fcb_choice" name="fcb_choice" required><option value="">Choisir…</option>';
			foreach ( $choices as $i => $c ) {
				echo '<option value="' . esc_attr( $i ) . '">' . esc_html( $c['name'] ) . '</option>';
			}
			echo '</select></p>';
		}
		if ( fcb_has_colors( $product ) ) {
			echo '<p class="fc-field"><label for="fcb_color">Couleur</label><select id="fcb_color" name="fcb_color"><option value="">À préciser ensemble</option>';
			foreach ( fcb_colors() as $k => $c ) {
				echo '<option value="' . esc_attr( $k ) . '">' . esc_html( $c['name'] ) . '</option>';
			}
			echo '</select></p>';
		}
		if ( fcb_has_jar_option( $product ) ) {
			$c = fcb_catalog();
			echo '<label class="fc-jar"><input type="checkbox" name="fcb_jar" value="1"> <span><strong>' . esc_html( fcb_jar_label() ) . ' (+' . esc_html( fcb_money( fcb_jar_price() ) ) . ')</strong>';
			if ( ! empty( $c['jar']['desc'] ) ) {
				echo '<small>' . esc_html( $c['jar']['desc'] ) . '</small>';
			}
			echo '</span></label>';
		}
		$max = fcb_card_max();
		echo '<details class="fc-card"><summary><strong>Carte de vœux offerte</strong> Écrire mon message</summary>' .
			'<p class="fc-field"><label for="fcb_card_to">Pour <small>(facultatif)</small></label><input id="fcb_card_to" name="fcb_card_to" type="text" maxlength="40" autocomplete="off"></p>' .
			'<p class="fc-field"><label for="fcb_card_msg">Votre message</label><textarea id="fcb_card_msg" name="fcb_card_msg" rows="3" maxlength="' . esc_attr( $max ) . '"></textarea></p>' .
			'<p class="fc-field"><label for="fcb_card_from">De la part de <small>(facultatif)</small></label><input id="fcb_card_from" name="fcb_card_from" type="text" maxlength="40" autocomplete="off"></p>' .
			'</details>';
	}
);

/* Création unique vendue. */
add_filter(
	'woocommerce_get_availability_text',
	function ( $text, $product ) {
		if ( $product && ! $product->is_in_stock() && fcb_is_unique( $product ) ) {
			return 'Vendue : cette création unique a trouvé sa maison.';
		}
		if ( $product && $product->is_in_stock() && fcb_is_unique( $product ) ) {
			return 'Création unique, disponible';
		}
		return $text;
	},
	10,
	2
);

/* Le support des bouquets composés n'a pas de page à lui : on renvoie vers le compositeur. */
add_action(
	'template_redirect',
	function () {
		if ( is_singular( 'product' ) && get_queried_object_id() === fcb_bouquet_product_id() ) {
			wp_safe_redirect( home_url( '/#bouquet' ) );
			exit;
		}
	}
);

/* Toujours une seule création unique à la fois (pas de champ quantité). */
add_filter(
	'woocommerce_is_sold_individually',
	function ( $yes, $product ) {
		return $yes || fcb_is_unique( $product );
	},
	10,
	2
);
