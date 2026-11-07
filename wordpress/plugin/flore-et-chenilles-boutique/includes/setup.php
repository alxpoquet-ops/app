<?php
/**
 * Mise en place de la boutique en un clic : euros, livraison autour de l'atelier,
 * pages panier / commande / compte, pages légales (brouillons à compléter), e-mails, adresses.
 * Peut être relancée sans risque : elle complète ce qui manque.
 */

defined( 'ABSPATH' ) || exit;

function fcb_city() {
	$c = fcb_catalog();
	return ! empty( $c['brand']['city'] ) ? $c['brand']['city'] : 'Signy-l’Abbaye';
}

/** Le produit caché qui porte les bouquets composés sur le site. */
function fcb_ensure_bouquet_product() {
	$id = fcb_bouquet_product_id();
	$p  = $id ? wc_get_product( $id ) : null;
	if ( $p && 'trash' !== $p->get_status() ) {
		return $id;
	}
	$existing = wc_get_product_id_by_sku( 'bouquet-sur-mesure' );
	if ( $existing ) {
		update_option( 'fcb_bouquet_product', (int) $existing );
		return (int) $existing;
	}
	$p = new WC_Product_Simple();
	$p->set_name( 'Votre bouquet sur mesure' );
	$p->set_slug( 'votre-bouquet-sur-mesure' );
	$p->set_sku( 'bouquet-sur-mesure' );
	$p->set_status( 'publish' );
	$p->set_catalog_visibility( 'hidden' );
	$p->set_regular_price( wc_format_decimal( fcb_unit_price() ) );
	$p->set_short_description( 'Un bouquet composé fleur par fleur dans « Votre bouquet à vous » : une fleur = ' . fcb_money( fcb_unit_price() ) . ', feuillage offert.' );
	$p->set_reviews_allowed( false );
	$id = $p->save();
	update_option( 'fcb_bouquet_product', (int) $id );
	return (int) $id;
}

/** Contenu de page en blocs simples (titres, paragraphes, listes). */
function fcb_blocks( $html ) {
	$html = preg_replace( '#<h2>(.*?)</h2>#s', "<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">$1</h2>\n<!-- /wp:heading -->", $html );
	$html = preg_replace( '#<h3>(.*?)</h3>#s', "<!-- wp:heading {\"level\":3} -->\n<h3 class=\"wp-block-heading\">$1</h3>\n<!-- /wp:heading -->", $html );
	$html = preg_replace( '#<p>(.*?)</p>#s', "<!-- wp:paragraph -->\n<p>$1</p>\n<!-- /wp:paragraph -->", $html );
	$html = preg_replace_callback(
		'#<ul>(.*?)</ul>#s',
		function ( $m ) {
			$items = preg_replace( '#<li>(.*?)</li>#s', "<!-- wp:list-item -->\n<li>$1</li>\n<!-- /wp:list-item -->", $m[1] );
			return "<!-- wp:list -->\n<ul class=\"wp-block-list\">" . $items . "</ul>\n<!-- /wp:list -->";
		},
		$html
	);
	return trim( $html );
}

/** Crée une page si elle n'existe pas encore (identifiant gardé dans une option). */
function fcb_ensure_page( $option, $title, $slug, $content, $status = 'publish' ) {
	$id = (int) get_option( $option );
	if ( $id && get_post( $id ) && 'trash' !== get_post_status( $id ) ) {
		return $id;
	}
	$found = get_page_by_path( $slug );
	if ( $found && 'trash' !== $found->post_status ) {
		update_option( $option, $found->ID );
		return $found->ID;
	}
	$id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => $status,
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_content' => $content,
		)
	);
	if ( $id && ! is_wp_error( $id ) ) {
		update_option( $option, $id );
		return $id;
	}
	return 0;
}

/** Pages panier, commande et compte : versions classiques, compatibles avec Stripe et PayPal. */
function fcb_setup_wc_pages() {
	$pages = array(
		'woocommerce_cart_page_id'      => array( 'Ma sélection', 'panier', '[woocommerce_cart]', 'woocommerce/cart' ),
		'woocommerce_checkout_page_id'  => array( 'Commande', 'commande', '[woocommerce_checkout]', 'woocommerce/checkout' ),
		'woocommerce_myaccount_page_id' => array( 'Mon compte', 'mon-compte', '[woocommerce_my_account]', '' ),
	);
	foreach ( $pages as $option => $def ) {
		$content = "<!-- wp:shortcode -->\n" . $def[2] . "\n<!-- /wp:shortcode -->";
		$id      = (int) get_option( $option );
		$post    = $id ? get_post( $id ) : null;
		if ( $post && 'trash' !== $post->post_status ) {
			if ( false === strpos( $post->post_content, $def[2] ) && ( ! $def[3] || false !== strpos( $post->post_content, $def[3] ) || '' === trim( $post->post_content ) ) ) {
				wp_update_post(
					array(
						'ID'           => $id,
						'post_content' => $content,
					)
				);
			}
			continue;
		}
		$new = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $def[0],
				'post_name'    => $def[1],
				'post_content' => $content,
			)
		);
		if ( $new && ! is_wp_error( $new ) ) {
			update_option( $option, $new );
		}
	}
	$shop = (int) get_option( 'woocommerce_shop_page_id' );
	if ( ! $shop || ! get_post( $shop ) ) {
		$shop = wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => 'Toutes les créations',
				'post_name'   => 'creations',
			)
		);
		if ( $shop && ! is_wp_error( $shop ) ) {
			update_option( 'woocommerce_shop_page_id', $shop );
		}
	}
}

/** Livraison : retrait gratuit à l'atelier, livraison 5 € jusqu'à 15 km et 10 € jusqu'à 25 km (Ardennes). */
function fcb_setup_shipping() {
	$name = 'Autour de l’atelier (Ardennes)';
	foreach ( WC_Shipping_Zones::get_zones() as $z ) {
		if ( $z['zone_name'] === $name ) {
			return;
		}
	}
	$city  = fcb_city();
	$c     = fcb_catalog();
	$zones = isset( $c['delivery']['zones'] ) ? $c['delivery']['zones'] : array(
		array(
			'upToKm' => 15,
			'price'  => 5,
		),
		array(
			'upToKm' => 25,
			'price'  => 10,
		),
	);
	$zone = new WC_Shipping_Zone();
	$zone->set_zone_name( $name );
	$zone->set_zone_order( 0 );
	$zone->add_location( 'FR', 'country' );
	$zone->add_location( '08*', 'postcode' );
	$zone->save();

	$pickup_title = 'Retrait à l’atelier, à ' . $city . ' (gratuit)';
	$id           = $zone->add_shipping_method( 'local_pickup' );
	update_option(
		'woocommerce_local_pickup_' . $id . '_settings',
		array(
			'title'      => $pickup_title,
			'tax_status' => 'none',
			'cost'       => '',
		)
	);
	$from = 0;
	foreach ( $zones as $z ) {
		$range = $from ? sprintf( 'de %d à %d km', $from, $z['upToKm'] ) : sprintf( 'jusqu’à %d km', $z['upToKm'] );
		$id    = $zone->add_shipping_method( 'flat_rate' );
		update_option(
			'woocommerce_flat_rate_' . $id . '_settings',
			array(
				'title'      => 'Livraison ' . $range . ' autour de ' . $city,
				'tax_status' => 'none',
				'cost'       => (string) $z['price'],
			)
		);
		$from = (int) $z['upToKm'];
	}

	/* Partout ailleurs : retrait à l'atelier (la livraison plus loin se voit ensemble). */
	$rest = new WC_Shipping_Zone( 0 );
	if ( ! $rest->get_shipping_methods() ) {
		$id = $rest->add_shipping_method( 'local_pickup' );
		update_option(
			'woocommerce_local_pickup_' . $id . '_settings',
			array(
				'title'      => $pickup_title,
				'tax_status' => 'none',
				'cost'       => '',
			)
		);
	}
}

/** Pages légales, créées en brouillon : à compléter (SIRET, adresse…) puis publier. */
function fcb_setup_legal_pages() {
	$brand = fcb_brand();
	$city  = fcb_city();
	$site  = home_url( '/' );
	$mail  = fcb_opt( 'contact_email' );
	$todo  = function ( $t ) {
		return '<mark>[À compléter : ' . $t . ']</mark>';
	};

	$mentions = '<p>Conformément à l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations sur l’éditeur et l’hébergeur du site ' . esc_html( $site ) . '.</p>'
		. '<h2>Éditeur du site</h2>'
		. '<p>' . $todo( 'prénom et nom' ) . ', entrepreneur individuel (micro-entreprise), exerçant sous le nom commercial « ' . esc_html( $brand ) . ' ».<br>SIRET : ' . $todo( 'numéro SIRET' ) . '<br>Adresse : ' . $todo( 'adresse de l’atelier' ) . ', 08460 ' . esc_html( $city ) . '<br>E-mail : ' . esc_html( $mail ) . '<br>Téléphone : ' . $todo( 'numéro de téléphone' ) . '</p>'
		. '<p>Directrice de la publication : ' . $todo( 'prénom et nom' ) . '.</p>'
		. '<h2>Hébergeur</h2>'
		. '<p>o2switch, Chemin des Pardiaux, 63000 Clermont-Ferrand, France, www.o2switch.fr ' . $todo( 'vérifier ces informations sur la page « mentions légales » du site o2switch.fr' ) . '</p>'
		. '<h2>Propriété intellectuelle</h2>'
		. '<p>Les créations, photographies, textes et illustrations de ce site sont la propriété de ' . esc_html( $brand ) . '. Toute reproduction, même partielle, est interdite sans autorisation écrite.</p>'
		. '<h2>Données personnelles</h2>'
		. '<p>Pour savoir comment vos données sont utilisées et protégées, consultez la politique de confidentialité.</p>';

	$zones_txt = 'retrait gratuit à l’atelier, à ' . esc_html( $city ) . ', ou livraison en main propre : 5 € jusqu’à 15 km et 10 € de 15 à 25 km autour de l’atelier. Au-delà, la livraison se voit ensemble avant la commande';
	$cgv = '<p>Les présentes conditions générales de vente (CGV) s’appliquent à toutes les commandes passées sur le site ' . esc_html( $site ) . ' entre ' . $todo( 'prénom et nom' ) . ', entrepreneur individuel exerçant sous le nom commercial « ' . esc_html( $brand ) . ' », SIRET ' . $todo( 'numéro SIRET' ) . ', ' . $todo( 'adresse' ) . ', 08460 ' . esc_html( $city ) . ', ' . esc_html( $mail ) . ' (« le vendeur »), et toute personne physique qui achète pour ses besoins personnels (« le client »). Passer commande vaut acceptation des présentes CGV.</p>'
		. '<h2>1. Les créations</h2>'
		. '<p>Les créations sont des fleurs éternelles en fil chenille, façonnées à la main dans l’atelier. Chaque pièce étant faite main, de légères différences avec les photos (nuances, forme des pétales) sont possibles et font son charme. Les créations signalées « Création unique » n’existent qu’en un seul exemplaire.</p>'
		. '<p>Les créations sont décoratives : elles contiennent une tige métallique et de petites pièces, et ne doivent pas être laissées à portée des jeunes enfants ni des animaux.</p>'
		. '<h2>2. Prix</h2>'
		. '<p>Les prix sont indiqués en euros, toutes taxes comprises' . ( 'yes' === fcb_opt( 'vat_note' ) ? ' (TVA non applicable, article 293 B du Code général des impôts)' : '' ) . '. Les frais de livraison éventuels sont indiqués avant la validation de la commande. Les offres promotionnelles sont valables pendant la période indiquée sur le site.</p>'
		. '<h2>3. Commande</h2>'
		. '<p>Le client choisit ses créations, écrit s’il le souhaite le message de sa carte de vœux (offerte), choisit le retrait ou la livraison, puis valide et paie sa commande. Un e-mail de confirmation récapitule la commande. Le vendeur se réserve le droit d’annuler une commande en cas de problème de paiement ou de litige antérieur avec le client.</p>'
		. '<h2>4. Paiement</h2>'
		. '<p>Le paiement se fait en ligne, au moment de la commande, par carte bancaire, via le service de paiement sécurisé myPOS. Le vendeur n’a jamais accès aux données bancaires du client.</p>'
		. '<h2>5. Fabrication, retrait et livraison</h2>'
		. '<p>Les créations sont façonnées à la main, à la commande, ou déjà prêtes lorsqu’il s’agit d’une création unique. Le délai est indiqué au client après sa commande ; pour une date précise, il est conseillé de prévenir le plus tôt possible. Modes de remise : ' . $zones_txt . '. Le vendeur contacte le client pour convenir du jour du retrait ou de la livraison.</p>'
		. '<h2>6. Droit de rétractation</h2>'
		. '<p>Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose de 14 jours à compter de la réception de sa création pour se rétracter, sans avoir à se justifier, en adressant au vendeur une déclaration claire (par exemple par e-mail, ou avec le formulaire ci-dessous). La création est à retourner ou à rapporter dans son état d’origine, dans les 14 jours suivant la rétractation, les frais de retour restant à la charge du client. Le vendeur rembourse toutes les sommes versées, frais de livraison initiaux compris, dans les 14 jours suivant la rétractation, par le même moyen de paiement ; il peut attendre d’avoir récupéré la création.</p>'
		. '<p>Conformément à l’article L221-28 (3°) du Code de la consommation, le droit de rétractation ne s’applique pas aux créations confectionnées selon les spécifications du client ou nettement personnalisées, notamment les bouquets composés sur mesure (« Votre bouquet à vous ») et les commandes spéciales.</p>'
		. '<h3>Formulaire de rétractation</h3>'
		. '<p>À l’attention de ' . esc_html( $brand ) . ', ' . esc_html( $mail ) . ' : je vous notifie par la présente ma rétractation du contrat portant sur la vente de la création ci-dessous. Commandée le / reçue le : … Nom du client : … Adresse du client : … Date : … Signature (en cas d’envoi papier).</p>'
		. '<h2>7. Garanties légales</h2>'
		. '<p>Le client bénéficie de la garantie légale de conformité (articles L217-3 à L217-20 du Code de la consommation), pendant deux ans à compter de la remise de la création, et de la garantie des vices cachés (articles 1641 à 1649 du Code civil). Pour la mettre en œuvre, il suffit d’écrire au vendeur en décrivant le problème.</p>'
		. '<h2>8. Données personnelles</h2>'
		. '<p>Les informations demandées servent uniquement à traiter la commande et à échanger avec le client. Voir la politique de confidentialité.</p>'
		. '<h2>9. Médiation et litiges</h2>'
		. '<p>En cas de difficulté, le client écrit d’abord au vendeur pour trouver une solution amiable. À défaut, il peut recourir gratuitement au médiateur de la consommation : ' . $todo( 'nom, adresse et site du médiateur choisi (adhésion obligatoire pour vendre aux particuliers)' ) . '. Les présentes CGV sont soumises au droit français.</p>';

	$privacy = '<p>Cette politique explique quelles informations sont recueillies sur ' . esc_html( $site ) . ' et comment elles sont utilisées. Responsable du traitement : ' . $todo( 'prénom et nom' ) . ', « ' . esc_html( $brand ) . ' », ' . esc_html( $mail ) . '.</p>'
		. '<h2>Les informations recueillies</h2>'
		. '<ul><li>Lors d’une commande : nom, adresse, e-mail, téléphone, messages des cartes de vœux et détails de la commande, pour la préparer, la remettre et établir la facture.</li><li>Par le formulaire de contact : nom, e-mail, téléphone (facultatif) et message, pour vous répondre.</li><li>Pour le paiement : les données bancaires sont saisies directement sur la page sécurisée de myPOS ; elles ne sont jamais transmises ni conservées par la boutique.</li></ul>'
		. '<h2>Pourquoi et combien de temps</h2>'
		. '<p>Les données de commande sont nécessaires à l’exécution de la vente et conservées le temps imposé par les obligations comptables (10 ans pour les factures). Les messages de contact sont conservés le temps de l’échange, puis au maximum 3 ans.</p>'
		. '<h2>Qui y a accès</h2>'
		. '<p>Uniquement ' . esc_html( $brand ) . ' et ses prestataires techniques : l’hébergeur du site (o2switch, en France) et le service de paiement (myPOS). Aucune donnée n’est vendue ni cédée.</p>'
		. '<h2>Cookies</h2>'
		. '<p>Le site utilise seulement les cookies nécessaires à son fonctionnement (panier, connexion à votre compte). Aucun cookie publicitaire n’est déposé.</p>'
		. '<h2>Vos droits</h2>'
		. '<p>Vous pouvez accéder à vos données, les faire rectifier ou effacer, vous opposer à leur utilisation ou demander leur portabilité en écrivant à ' . esc_html( $mail ) . '. Vous pouvez aussi adresser une réclamation à la CNIL (www.cnil.fr).</p>';

	$cgv_id = fcb_ensure_page( 'fcb_page_cgv', 'Conditions générales de vente', 'conditions-generales-de-vente', fcb_blocks( $cgv ), 'draft' );
	fcb_ensure_page( 'fcb_page_mentions', 'Mentions légales', 'mentions-legales', fcb_blocks( $mentions ), 'draft' );
	$priv_id = (int) get_option( 'wp_page_for_privacy_policy' );
	if ( $priv_id && get_post( $priv_id ) && ! get_option( 'fcb_page_privacy' ) ) {
		$post = get_post( $priv_id );
		if ( 'publish' !== $post->post_status ) {
			wp_update_post(
				array(
					'ID'           => $priv_id,
					'post_title'   => 'Politique de confidentialité',
					'post_content' => fcb_blocks( $privacy ),
				)
			);
		}
		update_option( 'fcb_page_privacy', $priv_id );
	} else {
		$priv_id = fcb_ensure_page( 'fcb_page_privacy', 'Politique de confidentialité', 'politique-de-confidentialite', fcb_blocks( $privacy ), 'draft' );
		if ( $priv_id ) {
			update_option( 'wp_page_for_privacy_policy', $priv_id );
		}
	}
	if ( $cgv_id && 'publish' === get_post_status( $cgv_id ) ) {
		update_option( 'woocommerce_terms_page_id', $cgv_id );
	}
	if ( $priv_id ) {
		update_option( 'woocommerce_privacy_policy_page_id', $priv_id );
	}
}

function fcb_setup_store() {
	$city = fcb_city();
	$set  = array(
		'woocommerce_currency'                       => 'EUR',
		'woocommerce_currency_pos'                   => 'right_space',
		'woocommerce_price_thousand_sep'             => ' ',
		'woocommerce_price_decimal_sep'              => ',',
		'woocommerce_price_num_decimals'             => '2',
		'woocommerce_default_country'                => 'FR',
		'woocommerce_store_city'                     => $city,
		'woocommerce_store_postcode'                 => '08460',
		'woocommerce_allowed_countries'              => 'specific',
		'woocommerce_specific_allowed_countries'     => array( 'FR' ),
		'woocommerce_ship_to_countries'              => '',
		'woocommerce_calc_taxes'                     => 'no',
		'woocommerce_enable_guest_checkout'          => 'yes',
		'woocommerce_enable_checkout_login_reminder' => 'yes',
		'woocommerce_enable_signup_and_login_from_checkout' => 'yes',
		'woocommerce_registration_generate_password' => 'yes',
		'woocommerce_enable_reviews'                 => 'no',
		'woocommerce_weight_unit'                    => 'kg',
		'woocommerce_dimension_unit'                 => 'cm',
		'woocommerce_cart_redirect_after_add'        => 'no',
		'woocommerce_enable_ajax_add_to_cart'        => 'yes',
		'woocommerce_email_from_name'                => fcb_brand(),
		'woocommerce_email_base_color'               => '#A24E74',
		'woocommerce_email_background_color'         => '#FBF7F2',
		'woocommerce_email_body_background_color'    => '#FFFFFF',
		'woocommerce_email_text_color'               => '#4A2C3D',
		'woocommerce_email_footer_text'              => fcb_brand() . ' · Fleurs éternelles en fil chenille, faites main à ' . $city . ' (Ardennes)',
	);
	foreach ( $set as $k => $v ) {
		update_option( $k, $v );
	}
	if ( '' === (string) get_option( 'woocommerce_email_header_image' ) && function_exists( 'get_theme_file_uri' ) && file_exists( get_theme_file_path( 'assets/photos/logo.jpg' ) ) ) {
		update_option( 'woocommerce_email_header_image', get_theme_file_uri( 'assets/photos/logo.jpg' ) );
	}

	fcb_setup_wc_pages();
	fcb_setup_shipping();
	fcb_setup_legal_pages();
	fcb_ensure_bouquet_product();

	/* La page d'accueil du site. */
	$home = fcb_ensure_page( 'fcb_page_home', 'Accueil', 'accueil', '' );
	if ( $home && 'page' !== get_option( 'show_on_front' ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home );
	}

	/* De jolies adresses : /creation/bouquet-rose-tendre/, /categorie/bouquets/. */
	if ( '' === (string) get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}
	$perma = (array) get_option( 'woocommerce_permalinks', array() );
	update_option(
		'woocommerce_permalinks',
		array_merge(
			$perma,
			array(
				'product_base'  => '/creation',
				'category_base' => 'categorie',
				'tag_base'      => 'etiquette',
			)
		)
	);
	update_option( 'woocommerce_queue_flush_rewrite_rules', 'yes' );
	flush_rewrite_rules( false );

	update_option( 'fcb_setup_done', time() );
	fcb_flush_payload();
}

/* Les CGV sont demandées à la commande dès qu'elles sont publiées (et plus si elles repassent en brouillon). */
add_action(
	'transition_post_status',
	function ( $new, $old, $post ) {
		if ( 'page' !== $post->post_type || (int) $post->ID !== (int) get_option( 'fcb_page_cgv' ) ) {
			return;
		}
		if ( 'publish' === $new ) {
			update_option( 'woocommerce_terms_page_id', $post->ID );
		} elseif ( (int) get_option( 'woocommerce_terms_page_id' ) === (int) $post->ID ) {
			update_option( 'woocommerce_terms_page_id', 0 );
		}
	},
	10,
	3
);
