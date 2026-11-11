<?php
/**
 * Plugin Name:       Flore & Chenilles · Boutique
 * Plugin URI:        https://github.com/alxpoquet-ops/app
 * Description:       La boutique de Flore & Chenilles pour WooCommerce : carte de vœux offerte, option bocal, créations uniques, offre de lancement, compositeur « Votre bouquet à vous », formulaire de contact et import des créations.
 * Version:           1.0.4
 * Author:            Flore & Chenilles
 * Text Domain:       flore-et-chenilles
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * WC requires at least: 8.5
 * License:           GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

define( 'FCB_VERSION', '1.0.4' );
define( 'FCB_FILE', __FILE__ );
define( 'FCB_DIR', plugin_dir_path( __FILE__ ) );
define( 'FCB_URL', plugin_dir_url( __FILE__ ) );

/* Compatible avec le stockage moderne des commandes et le paiement en blocs. */
add_action(
	'before_woocommerce_init',
	function () {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', FCB_FILE, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', FCB_FILE, true );
		}
	}
);

require_once FCB_DIR . 'includes/config.php';

add_action(
	'plugins_loaded',
	function () {
		if ( ! class_exists( 'WooCommerce' ) ) {
			add_action(
				'admin_notices',
				function () {
					echo '<div class="notice notice-error"><p><strong>Flore &amp; Chenilles · Boutique</strong> a besoin de WooCommerce : installez et activez WooCommerce.</p></div>';
				}
			);
			return;
		}
		foreach ( array( 'pricing', 'cart', 'product', 'payload', 'rest', 'admin', 'setup', 'import', 'emails' ) as $part ) {
			require_once FCB_DIR . 'includes/' . $part . '.php';
		}
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			require_once FCB_DIR . 'includes/cli.php';
		}
	}
);

register_activation_hook(
	__FILE__,
	function () {
		if ( false === get_option( 'fcb_settings', false ) ) {
			add_option( 'fcb_settings', fcb_defaults() );
		}
		set_transient( 'fcb_activated', 1, MINUTE_IN_SECONDS * 5 );
	}
);
