<?php
/**
 * Administration : onglet « Flore & Chenilles » dans la fiche d'une création,
 * page de réglages (WooCommerce › Flore & Chenilles) avec la mise en place en un clic.
 */

defined( 'ABSPATH' ) || exit;

/* ---------- Fiche d'une création : vignettes, création unique, nombre de fleurs, mot de Laurine ---------- */

add_filter(
	'woocommerce_product_data_tabs',
	function ( $tabs ) {
		$tabs['fcb'] = array(
			'label'    => 'Flore & Chenilles',
			'target'   => 'fcb_product_data',
			'class'    => array(),
			'priority' => 15,
		);
		return $tabs;
	}
);

add_action(
	'woocommerce_product_data_panels',
	function () {
		global $post;
		$product = wc_get_product( $post->ID );
		echo '<div id="fcb_product_data" class="panel woocommerce_options_panel"><div class="options_group">';
		woocommerce_wp_checkbox(
			array(
				'id'          => '_fc_unique',
				'label'       => 'Création unique',
				'description' => 'Un seul exemplaire (par exemple dans son vase) : le stock passe à 1 et la création s’affiche « Vendue » une fois achetée.',
				'value'       => $product && fcb_is_unique( $product ) ? 'yes' : 'no',
			)
		);
		woocommerce_wp_select(
			array(
				'id'          => '_fc_gift',
				'label'       => 'Vignette cadeau',
				'options'     => array(
					''            => 'Aucune',
					'Vase offert' => 'Vase offert',
					'Pot offert'  => 'Pot offert',
				),
				'value'       => $product ? fcb_meta( $product, 'gift' ) : '',
				'desc_tip'    => true,
				'description' => 'Petite vignette sur la photo.',
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'                => '_fc_count',
				'label'             => 'Nombre de fleurs',
				'type'              => 'number',
				'custom_attributes' => array( 'min' => 0, 'step' => 1 ),
				'value'             => $product ? fcb_meta( $product, 'count' ) : '',
				'desc_tip'          => true,
				'description'       => sprintf( 'Pour un bouquet : %s par fleur, feuillage offert. Laissez vide pour un prix libre.', fcb_money( fcb_unit_price() ) ),
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'          => '_fc_badge',
				'label'       => 'Étiquette',
				'placeholder' => 'Nouveauté',
				'value'       => $product ? fcb_meta( $product, 'badge' ) : '',
				'desc_tip'    => true,
				'description' => 'Facultatif : « Nouveauté », « Coup de cœur »…',
			)
		);
		woocommerce_wp_textarea_input(
			array(
				'id'          => '_fc_words',
				'label'       => 'Le mot de Laurine',
				'value'       => $product ? fcb_meta( $product, 'words' ) : '',
				'desc_tip'    => true,
				'description' => 'Une petite phrase affichée entre guillemets sur la fiche.',
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'          => '_fc_bg',
				'label'       => 'Couleur de fond',
				'placeholder' => '#F8E1E6',
				'value'       => $product ? fcb_meta( $product, 'bg' ) : '',
				'desc_tip'    => true,
				'description' => 'Couleur pastel derrière la photo, en attendant qu’elle s’affiche.',
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'          => '_fc_post',
				'label'       => 'Publication Instagram',
				'placeholder' => 'https://www.instagram.com/p/…',
				'value'       => $product ? fcb_meta( $product, 'post' ) : '',
			)
		);
		echo '</div></div>';
	}
);

add_action(
	'woocommerce_admin_process_product_object',
	function ( $product ) {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- WooCommerce vérifie le jeton du formulaire.
		$unique = ! empty( $_POST['_fc_unique'] );
		$was    = fcb_is_unique( $product );
		$product->update_meta_data( '_fc_unique', $unique ? 'yes' : 'no' );
		$gift = isset( $_POST['_fc_gift'] ) ? sanitize_text_field( wp_unslash( $_POST['_fc_gift'] ) ) : '';
		$product->update_meta_data( '_fc_gift', $gift );
		$count = isset( $_POST['_fc_count'] ) ? absint( $_POST['_fc_count'] ) : 0;
		$product->update_meta_data( '_fc_count', $count ? $count : '' );
		$product->update_meta_data( '_fc_badge', isset( $_POST['_fc_badge'] ) ? sanitize_text_field( wp_unslash( $_POST['_fc_badge'] ) ) : '' );
		$product->update_meta_data( '_fc_words', isset( $_POST['_fc_words'] ) ? sanitize_textarea_field( wp_unslash( $_POST['_fc_words'] ) ) : '' );
		$bg = isset( $_POST['_fc_bg'] ) ? sanitize_hex_color( wp_unslash( $_POST['_fc_bg'] ) ) : '';
		$product->update_meta_data( '_fc_bg', $bg ? $bg : '' );
		$product->update_meta_data( '_fc_post', isset( $_POST['_fc_post'] ) ? esc_url_raw( wp_unslash( $_POST['_fc_post'] ) ) : '' );
		// phpcs:enable
		if ( $unique ) {
			$product->set_sold_individually( true );
			if ( ! $was || ! $product->get_manage_stock() ) {
				$product->set_manage_stock( true );
				if ( null === $product->get_stock_quantity() || $product->get_stock_quantity() > 1 ) {
					$product->set_stock_quantity( 1 );
				}
			}
		}
		/* Prix d'un bouquet : nombre de fleurs × prix d'une fleur, si aucun prix n'est saisi. */
		if ( $count && '' === $product->get_regular_price( 'edit' ) ) {
			$product->set_regular_price( wc_format_decimal( $count * fcb_unit_price() ) );
		}
	}
);

/* ---------- Page de réglages ---------- */

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'woocommerce', 'Flore & Chenilles', 'Flore & Chenilles', 'manage_woocommerce', 'fcb', 'fcb_settings_page' );
	},
	60
);

add_action(
	'admin_init',
	function () {
		register_setting(
			'fcb',
			'fcb_settings',
			array(
				'type'              => 'array',
				'sanitize_callback' => 'fcb_sanitize_settings',
				'default'           => fcb_defaults(),
			)
		);
	}
);

function fcb_sanitize_settings( $in ) {
	$in  = is_array( $in ) ? $in : array();
	$d   = fcb_defaults();
	$out = array();
	$out['contact_email']  = isset( $in['contact_email'] ) && is_email( $in['contact_email'] ) ? sanitize_email( $in['contact_email'] ) : $d['contact_email'];
	foreach ( array( 'show_email', 'autoreply', 'vat_note' ) as $k ) {
		$out[ $k ] = empty( $in[ $k ] ) ? 'no' : 'yes';
	}
	$out['facebook']       = isset( $in['facebook'] ) ? esc_url_raw( trim( $in['facebook'] ) ) : '';
	$out['instagram']      = isset( $in['instagram'] ) ? preg_replace( '/[^A-Za-z0-9._]/', '', ltrim( trim( $in['instagram'] ), '@' ) ) : $d['instagram'];
	$out['instagram_feed'] = isset( $in['instagram_feed'] ) ? esc_url_raw( trim( $in['instagram_feed'] ) ) : '';
	$out['unit_price']     = isset( $in['unit_price'] ) && '' !== $in['unit_price'] ? max( 0, (float) str_replace( ',', '.', $in['unit_price'] ) ) : $d['unit_price'];
	$out['jar_price']      = isset( $in['jar_price'] ) && '' !== $in['jar_price'] ? max( 0, (float) str_replace( ',', '.', $in['jar_price'] ) ) : $d['jar_price'];
	$out['promo_label']    = isset( $in['promo_label'] ) ? sanitize_text_field( $in['promo_label'] ) : $d['promo_label'];
	$out['promo_percent']  = isset( $in['promo_percent'] ) ? min( 90, max( 0, (float) str_replace( ',', '.', $in['promo_percent'] ) ) ) : 0;
	foreach ( array( 'promo_from', 'promo_until' ) as $k ) {
		$out[ $k ] = isset( $in[ $k ] ) && preg_match( '/^\d{4}-\d{2}-\d{2}$/', $in[ $k ] ) ? $in[ $k ] : '';
	}
	return $out;
}

/** Ce qui reste à faire pour ouvrir la boutique. */
function fcb_checklist() {
	$state    = get_option( 'fcb_import', array() );
	$total    = count( fcb_creations() ) + count( fcb_pages_data() );
	$imported = ( isset( $state['done'] ) ? count( $state['done'] ) : 0 ) + ( isset( $state['pages'] ) ? count( $state['pages'] ) : 0 );
	$gateways = array();
	if ( WC()->payment_gateways() ) {
		foreach ( WC()->payment_gateways()->payment_gateways() as $id => $g ) {
			if ( 'yes' === $g->enabled ) {
				$gateways[] = $id;
			}
		}
	}
	$has = function ( $needle ) use ( $gateways ) {
		foreach ( $gateways as $id ) {
			if ( false !== strpos( $id, $needle ) ) {
				return true;
			}
		}
		return false;
	};
	$legal = array();
	foreach ( array( 'cgv', 'mentions', 'privacy' ) as $k ) {
		$pid = (int) get_option( 'fcb_page_' . $k );
		$legal[ $k ] = $pid && 'publish' === get_post_status( $pid );
	}
	$install = function ( $slug ) {
		return admin_url( 'plugin-install.php?tab=plugin-information&plugin=' . $slug );
	};
	return array(
		array( get_option( 'fcb_setup_done' ), 'Boutique configurée (euros, livraison, pages panier et commande, e-mails)', '' ),
		array( $total && $imported >= $total, sprintf( 'Créations et pages de contenu importées (%d sur %d)', min( $imported, $total ), $total ), '' ),
		array( $has( 'stripe' ), 'Paiement par carte : installer « WooCommerce Stripe Payment Gateway », puis connecter votre compte Stripe', $install( 'woocommerce-gateway-stripe' ) ),
		array( $has( 'ppcp' ) || $has( 'paypal' ), 'Paiement PayPal : installer « WooCommerce PayPal Payments », puis connecter votre compte PayPal', $install( 'woocommerce-paypal-payments' ) ),
		array( defined( 'WPMS_PLUGIN_VER' ), 'E-mails fiables : installer « WP Mail SMTP » avec l’adresse e-mail créée chez o2switch', $install( 'wp-mail-smtp' ) ),
		array( '' !== fcb_opt( 'instagram_feed' ) || shortcode_exists( 'instagram-feed' ), 'Instagram : vos dernières publications (adresse du flux ci-dessous, ou extension « Smash Balloon Instagram Feed »)', $install( 'instagram-feed' ) ),
		array( $legal['cgv'] && $legal['mentions'] && $legal['privacy'], 'Pages légales : compléter puis publier les CGV, les mentions légales et la politique de confidentialité (brouillons créés)', admin_url( 'edit.php?post_type=page&post_status=draft' ) ),
		array( 'yes' !== get_option( 'woocommerce_coming_soon' ), 'Ouvrir la boutique au public (WooCommerce › Réglages › Visibilité du site)', admin_url( 'admin.php?page=wc-settings&tab=site-visibility' ) ),
	);
}

function fcb_settings_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return;
	}
	$s = fcb_settings();
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$notice = isset( $_GET['fcb_notice'] ) ? sanitize_key( $_GET['fcb_notice'] ) : '';
	?>
	<div class="wrap fcb-admin">
		<h1>Flore &amp; Chenilles</h1>
		<?php if ( 'setup' === $notice ) : ?>
			<div class="notice notice-success"><p>La boutique est configurée : euros, livraison (retrait gratuit, 5 € jusqu’à 15 km, 10 € jusqu’à 25 km), pages et e-mails.</p></div>
		<?php endif; ?>

		<div class="fcb-box">
			<h2>Mise en place</h2>
			<ol class="fcb-check">
				<?php foreach ( fcb_checklist() as $row ) : ?>
					<li class="<?php echo $row[0] ? 'is-ok' : 'is-todo'; ?>">
						<span class="fcb-dot" aria-hidden="true"><?php echo $row[0] ? '✓' : '•'; ?></span>
						<?php echo esc_html( $row[1] ); ?>
						<?php if ( ! $row[0] && $row[2] ) : ?>
							<a href="<?php echo esc_url( $row[2] ); ?>">Ouvrir</a>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ol>
			<p class="fcb-actions">
				<a class="button button-primary" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=fcb_setup' ), 'fcb_setup' ) ); ?>">1. Configurer la boutique</a>
				<button type="button" class="button button-primary" id="fcb-import">2. Importer mes créations</button>
				<span id="fcb-import-status" aria-live="polite"></span>
			</p>
			<p class="description">« Configurer la boutique » peut être relancé sans risque : il complète ce qui manque sans effacer vos réglages. L’import ajoute les créations qui ne sont pas encore dans la boutique (photos comprises) ; il peut prendre une à deux minutes.</p>
		</div>

		<form method="post" action="options.php" class="fcb-box">
			<?php settings_fields( 'fcb' ); ?>
			<h2>Contact</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="fcb-email">E-mail de l’atelier</label></th><td><input id="fcb-email" type="email" class="regular-text" name="fcb_settings[contact_email]" value="<?php echo esc_attr( $s['contact_email'] ); ?>"><p class="description">Reçoit les messages du formulaire de contact.</p></td></tr>
				<tr><th scope="row">Options</th><td>
					<label><input type="checkbox" name="fcb_settings[show_email]" value="1" <?php checked( 'yes', $s['show_email'] ); ?>> Afficher cette adresse sur le site</label><br>
					<label><input type="checkbox" name="fcb_settings[autoreply]" value="1" <?php checked( 'yes', $s['autoreply'] ); ?>> Envoyer un petit accusé de réception à la personne qui écrit</label>
				</td></tr>
				<tr><th scope="row"><label for="fcb-ig">Instagram</label></th><td>@<input id="fcb-ig" type="text" class="regular-text" name="fcb_settings[instagram]" value="<?php echo esc_attr( $s['instagram'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="fcb-feed">Flux Instagram</label></th><td><input id="fcb-feed" type="url" class="large-text" name="fcb_settings[instagram_feed]" value="<?php echo esc_attr( $s['instagram_feed'] ); ?>" placeholder="https://feeds.behold.so/…"><p class="description">Pour afficher vos 6 dernières publications : créez un flux gratuit sur behold.so (connexion avec votre compte Instagram), puis collez ici son adresse « JSON ». Sans flux, le site montre une sélection de vos photos.</p></td></tr>
				<tr><th scope="row"><label for="fcb-fb">Page Facebook</label></th><td><input id="fcb-fb" type="url" class="large-text" name="fcb_settings[facebook]" value="<?php echo esc_attr( $s['facebook'] ); ?>" placeholder="https://www.facebook.com/…"></td></tr>
			</table>
			<h2>Prix</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="fcb-unit">Prix d’une fleur</label></th><td><input id="fcb-unit" type="number" step="0.01" min="0" class="small-text" name="fcb_settings[unit_price]" value="<?php echo esc_attr( $s['unit_price'] ); ?>"> €<p class="description">Utilisé par le compositeur « Votre bouquet à vous » et pour les bouquets dont vous indiquez le nombre de fleurs.</p></td></tr>
				<tr><th scope="row"><label for="fcb-jar">Option bocal</label></th><td>+ <input id="fcb-jar" type="number" step="0.01" min="0" class="small-text" name="fcb_settings[jar_price]" value="<?php echo esc_attr( $s['jar_price'] ); ?>"> € <span class="description">(fleurs à l’unité ; 0 pour retirer l’option)</span></td></tr>
				<tr><th scope="row">Mention TVA</th><td><label><input type="checkbox" name="fcb_settings[vat_note]" value="1" <?php checked( 'yes', $s['vat_note'] ); ?>> Afficher « TVA non applicable, art. 293 B du CGI » (micro-entreprise en franchise de TVA)</label></td></tr>
			</table>
			<h2>Offre de lancement</h2>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="fcb-pl">Nom</label></th><td><input id="fcb-pl" type="text" class="regular-text" name="fcb_settings[promo_label]" value="<?php echo esc_attr( $s['promo_label'] ); ?>"></td></tr>
				<tr><th scope="row"><label for="fcb-pp">Remise</label></th><td>− <input id="fcb-pp" type="number" step="1" min="0" max="90" class="small-text" name="fcb_settings[promo_percent]" value="<?php echo esc_attr( $s['promo_percent'] ); ?>"> % <span class="description">(0 pour l’arrêter)</span></td></tr>
				<tr><th scope="row">Dates</th><td>du <input type="date" name="fcb_settings[promo_from]" value="<?php echo esc_attr( $s['promo_from'] ); ?>"> au <input type="date" name="fcb_settings[promo_until]" value="<?php echo esc_attr( $s['promo_until'] ); ?>"> inclus<p class="description">La remise s’applique toute seule à toutes les créations pendant ces dates, avec les prix barrés.</p></td></tr>
			</table>
			<?php submit_button( 'Enregistrer' ); ?>
		</form>
	</div>
	<style>
		.fcb-admin .fcb-box { max-width: 900px; margin: 18px 0; padding: 6px 22px 18px; background: #fff; border: 1px solid #e6dfe4; border-radius: 12px; }
		.fcb-check { list-style: none; margin: 0; padding: 0; }
		.fcb-check li { display: flex; gap: 10px; align-items: baseline; padding: 7px 0; border-bottom: 1px solid #f2edf0; }
		.fcb-check li:last-child { border-bottom: 0; }
		.fcb-check .fcb-dot { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #f3e6ec; color: #9c3f69; font-weight: 700; flex: none; }
		.fcb-check li.is-ok .fcb-dot { background: #ddf0e3; color: #3b7552; }
		.fcb-check li.is-ok { color: #50606a; }
		.fcb-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }
	</style>
	<script>
	( function () {
		const btn = document.getElementById( 'fcb-import' );
		const out = document.getElementById( 'fcb-import-status' );
		if ( ! btn ) return;
		btn.addEventListener( 'click', async function () {
			btn.disabled = true;
			out.textContent = 'Import en cours…';
			try {
				for ( let i = 0; i < 200; i++ ) {
					const body = new URLSearchParams( { action: 'fcb_import_step', _ajax_nonce: <?php echo wp_json_encode( wp_create_nonce( 'fcb_import' ) ); ?> } );
					const r = await fetch( ajaxurl, { method: 'POST', body, credentials: 'same-origin' } );
					const j = await r.json();
					if ( ! j.success ) throw new Error( ( j.data && j.data.message ) || 'erreur' );
					out.textContent = 'Import en cours… ' + j.data.done + ' / ' + j.data.total;
					if ( j.data.finished ) {
						out.textContent = 'C’est fait : vos créations et vos pages de contenu sont en ligne.';
						setTimeout( () => location.reload(), 1200 );
						return;
					}
				}
			} catch ( e ) {
				out.textContent = 'L’import s’est interrompu (' + e.message + '). Cliquez à nouveau pour reprendre là où il s’est arrêté.';
				btn.disabled = false;
			}
		} );
	} )();
	</script>
	<?php
}

add_action(
	'admin_post_fcb_setup',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Accès refusé.' );
		}
		check_admin_referer( 'fcb_setup' );
		fcb_setup_store();
		wp_safe_redirect( admin_url( 'admin.php?page=fcb&fcb_notice=setup' ) );
		exit;
	}
);

add_action(
	'wp_ajax_fcb_import_step',
	function () {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Accès refusé.' ), 403 );
		}
		check_ajax_referer( 'fcb_import' );
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}
		wp_send_json_success( fcb_import_step( 3 ) );
	}
);

/* Après l'activation : un lien direct vers la mise en place. */
add_action(
	'admin_notices',
	function () {
		if ( ! get_transient( 'fcb_activated' ) || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		delete_transient( 'fcb_activated' );
		echo '<div class="notice notice-info"><p><strong>Flore &amp; Chenilles</strong> est activée. <a href="' . esc_url( admin_url( 'admin.php?page=fcb' ) ) . '">Ouvrir la mise en place</a> pour configurer la boutique et importer vos créations.</p></div>';
	}
);
