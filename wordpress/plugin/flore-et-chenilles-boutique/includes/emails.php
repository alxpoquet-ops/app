<?php
/**
 * E-mails et récapitulatifs : mention TVA, petit mot sur le retrait ou la livraison.
 */

defined( 'ABSPATH' ) || exit;

function fcb_vat_note() {
	return 'yes' === fcb_opt( 'vat_note' ) ? 'TVA non applicable, art. 293 B du CGI' : '';
}

/* Sous le total du panier et de la commande. */
foreach ( array( 'woocommerce_cart_totals_after_order_total', 'woocommerce_review_order_after_order_total' ) as $fcb_hook ) {
	add_action(
		$fcb_hook,
		function () {
			$note = fcb_vat_note();
			if ( $note ) {
				echo '<tr class="fc-vat"><td colspan="2"><small>' . esc_html( $note ) . '</small></td></tr>';
			}
		}
	);
}

/* Pied des e-mails. */
add_filter(
	'woocommerce_email_footer_text',
	function ( $text ) {
		$note = fcb_vat_note();
		return $note ? $text . '<br>' . esc_html( $note ) : $text;
	}
);

/* E-mail au client : la suite, en quelques mots. */
add_action(
	'woocommerce_email_after_order_table',
	function ( $order, $sent_to_admin, $plain_text ) {
		if ( $sent_to_admin ) {
			return;
		}
		$text = 'Merci pour votre commande ! Je prépare votre création avec soin, emballée dans sa pochette transparente fermée d’un nœud, avec votre carte de vœux. Je vous écris très vite pour convenir du jour du retrait ou de la livraison.';
		if ( $plain_text ) {
			echo "\n" . esc_html( $text ) . "\n";
		} else {
			echo '<p style="margin:18px 0;">' . esc_html( $text ) . '</p>';
		}
	},
	10,
	3
);
