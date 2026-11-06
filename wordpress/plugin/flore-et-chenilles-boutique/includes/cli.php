<?php
/**
 * Commandes WP-CLI : wp fcb setup | wp fcb import | wp fcb payload
 */

defined( 'ABSPATH' ) || exit;

WP_CLI::add_command(
	'fcb setup',
	function () {
		fcb_setup_store();
		WP_CLI::success( 'Boutique configurée.' );
	}
);

WP_CLI::add_command(
	'fcb import',
	function () {
		do {
			$r = fcb_import_step( 5 );
			WP_CLI::log( sprintf( '%d / %d', $r['done'], $r['total'] ) );
		} while ( ! $r['finished'] );
		WP_CLI::success( 'Créations importées.' );
	}
);

WP_CLI::add_command(
	'fcb payload',
	function () {
		fcb_flush_payload();
		WP_CLI::log( wp_json_encode( fcb_payload(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
	}
);
