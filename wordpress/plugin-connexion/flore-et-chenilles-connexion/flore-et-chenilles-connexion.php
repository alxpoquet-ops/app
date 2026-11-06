<?php
/**
 * Plugin Name:       Flore & Chenilles – Connexion
 * Plugin URI:        https://github.com/alxpoquet-ops/app
 * Description:       Permet de se connecter au site (MCP, API WordPress) avec un mot de passe d’application, même quand l’hébergement retire l’en-tête « Authorization » ou qu’une extension vérifie l’utilisateur trop tôt. L’identifiant peut aussi arriver par l’en-tête « X-FC-Auth ». Vous pouvez la désactiver quand vous n’en avez plus besoin.
 * Version:           1.0.0
 * Author:            Flore & Chenilles
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

/*
 * 1. Le mot de passe d'application peut arriver par un autre en-tête que « Authorization »
 *    (certains hébergeurs le retirent) : X-FC-Auth: Basic base64(identifiant:mot de passe).
 *    WordPress le vérifie ensuite lui-même, exactement comme d'habitude.
 */
if ( empty( $_SERVER['PHP_AUTH_USER'] ) ) {
	$fc_auth_raw = '';
	foreach ( array( 'HTTP_X_FC_AUTH', 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION' ) as $fc_auth_key ) {
		if ( ! empty( $_SERVER[ $fc_auth_key ] ) && is_string( $_SERVER[ $fc_auth_key ] ) ) {
			$fc_auth_raw = trim( $_SERVER[ $fc_auth_key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- vérifié ci-dessous puis par WordPress.
			break;
		}
	}
	if ( $fc_auth_raw && preg_match( '/^(?:Basic\s+)?([A-Za-z0-9+\/]+={0,2})$/i', $fc_auth_raw, $fc_auth_m ) ) {
		$fc_auth_dec = base64_decode( $fc_auth_m[1], true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		if ( is_string( $fc_auth_dec ) && false !== strpos( $fc_auth_dec, ':' ) ) {
			list( $fc_auth_user, $fc_auth_pass ) = explode( ':', $fc_auth_dec, 2 );
			$_SERVER['PHP_AUTH_USER'] = $fc_auth_user;
			$_SERVER['PHP_AUTH_PW']   = $fc_auth_pass;
		}
	}
	unset( $fc_auth_raw, $fc_auth_key, $fc_auth_m, $fc_auth_dec, $fc_auth_user, $fc_auth_pass );
}

/*
 * 2. Si une extension demande « qui est connecté ? » très tôt, avant que WordPress sache qu'il s'agit
 *    d'une demande à l'API, les mots de passe d'application étaient ignorés : on la reconnaît dès le début.
 */
add_filter(
	'application_password_is_api_request',
	function ( $is_api ) {
		if ( $is_api ) {
			return true;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput
		if ( isset( $_GET['rest_route'] ) ) {
			return true;
		}
		$uri    = isset( $_SERVER['REQUEST_URI'] ) ? (string) $_SERVER['REQUEST_URI'] : '';
		// phpcs:enable
		$prefix = '/' . trim( rest_get_url_prefix(), '/' ) . '/';
		return false !== strpos( $uri, $prefix );
	}
);
