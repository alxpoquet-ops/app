<?php
/**
 * Flore & Chenilles · Boutique (thème enfant).
 * Le parent garde tout : l'accueil, la boutique, les pages de contenu, le style.
 * L'enfant change la navigation (de vraies pages au lieu des ancres de l'accueil),
 * le pied de page, le fil d'Ariane et l'en-tête de la boutique.
 */
defined( 'ABSPATH' ) || exit;

/* Le style de l'enfant, après celui du parent. */
add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( 'fcb-enfant', get_stylesheet_uri(), array( 'fc-site' ), wp_get_theme()->get( 'Version' ) . '.' . filemtime( get_stylesheet_directory() . '/style.css' ) );
	},
	30
);

/** L'adresse d'une page du site par son chemin. */
function fcb_url( $chemin ) {
	return esc_url( home_url( $chemin ) );
}

/** L'adresse de la boutique. */
function fcb_boutique_url() {
	return function_exists( 'wc_get_page_id' ) && wc_get_page_id( 'shop' ) > 0 ? esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ) : fcb_url( '/boutique/' );
}

/** La rubrique du site où se trouve le visiteur (pour allumer le bon lien). */
function fcb_rubrique() {
	if ( is_front_page() ) {
		return 'accueil';
	}
	if ( function_exists( 'is_woocommerce' ) && ( is_shop() || is_product_taxonomy() || is_product() ) ) {
		return 'boutique';
	}
	if ( is_page() ) {
		$ids = array_merge( array( get_queried_object_id() ), get_post_ancestors( get_queried_object_id() ) );
		foreach ( $ids as $id ) {
			$slug = get_post_field( 'post_name', $id );
			if ( in_array( $slug, array( 'fleurs', 'occasions', 'conseils' ), true ) ) {
				return $slug;
			}
			if ( 'questions-frequentes' === $slug ) {
				return 'questions';
			}
			if ( in_array( $slug, array( 'lexique', 'guide' ), true ) ) {
				return 'conseils';
			}
		}
	}
	return '';
}
function fcb_courant( $rubrique ) {
	return fcb_rubrique() === $rubrique ? ' aria-current="page"' : '';
}

/* Le fil d'Ariane d'une création ramène à la page boutique (le parent menait à l'accueil). */
add_filter(
	'woocommerce_get_breadcrumb',
	function ( $crumbs ) {
		if ( isset( $crumbs[1][1] ) && home_url( '/#boutique' ) === $crumbs[1][1] ) {
			$crumbs[1][1] = fcb_boutique_url();
		}
		return $crumbs;
	},
	20
);

/* L'en-tête de la boutique : une phrase, les catégories, les points forts. */
add_action(
	'woocommerce_archive_description',
	function () {
		if ( ! ( is_shop() || is_product_category() ) ) {
			return;
		}
		$cats = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
				'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
			)
		);
		$actuelle = is_product_category() ? get_queried_object_id() : 0;
		echo '<div class="fcb-boutique-tete">';
		if ( is_shop() ) {
			echo '<p>Bouquets et décorations en fleurs éternelles, façonnés à la main dans mon atelier des Ardennes.</p>';
		}
		echo '<ul class="fcb-chips" aria-label="Catégories de la boutique">';
		echo '<li><a href="' . fcb_boutique_url() . '"' . ( $actuelle ? '' : ' aria-current="page"' ) . '>Toutes les créations</a></li>'; // phpcs:ignore
		if ( ! is_wp_error( $cats ) ) {
			foreach ( $cats as $c ) {
				echo '<li><a href="' . esc_url( get_term_link( $c ) ) . '"' . ( $actuelle === (int) $c->term_id ? ' aria-current="page"' : '' ) . '>' . esc_html( $c->name ) . ' <small>' . (int) $c->count . '</small></a></li>';
			}
		}
		echo '</ul>';
		echo '<ul class="fcb-rassure"><li><svg><use href="#i-hand"/></svg>Tout à la main</li><li><svg><use href="#i-infinity"/></svg>Ne fane jamais</li><li><svg><use href="#i-pin"/></svg>Atelier des Ardennes</li></ul>';
		echo '</div>';
	},
	5
);

/* L'accueil allégé : un lien vers la page complète sous l'aperçu des créations et des occasions. */
add_action(
	'wp_footer',
	function () {
		if ( ! is_front_page() ) {
			return;
		}
		$liens = array(
			array( '#boutique .product-grid', fcb_boutique_url(), 'Voir toute la boutique' ),
			array( '#occasions .occasion-grid', fcb_url( '/occasions/' ), 'Toutes les occasions' ),
		);
		$js = '(function(){var L=' . wp_json_encode( $liens ) . ';L.forEach(function(l){var g=document.querySelector(l[0]);if(!g||g.parentNode.querySelector(".fcb-suite"))return;var d=document.createElement("div");d.className="fcb-suite";d.innerHTML=\'<a class="btn btn-primary" href="\'+l[1]+\'">\'+l[2]+\' <svg><use href="#i-arrow"/></svg></a>\';g.parentNode.insertBefore(d,g.nextSibling);});})();';
		echo '<script>' . $js . '</script>' . "\n"; // phpcs:ignore
	},
	99
);

/* Le bouton soleil / lune : clair ou sombre, le choix du visiteur est gardé (minis-theme, comme le connecteur). */
add_action(
	'wp_footer',
	function () {
		$js = '(function(){var h=document.documentElement,b=document.querySelector("[data-fcb-theme]");'
			. 'function maj(t){var m=document.querySelector("meta[name=theme-color]");if(m)m.setAttribute("content",t==="dark"?"#1D1418":"#FBF7F2");'
			. 'if(b){b.setAttribute("aria-pressed",t==="dark"?"true":"false");b.setAttribute("aria-label",t==="dark"?"Passer en apparence claire":"Passer en apparence sombre");}}'
			. 'maj(h.getAttribute("data-theme")==="dark"?"dark":"light");if(!b)return;'
			. 'b.addEventListener("click",function(){var t=h.getAttribute("data-theme")==="dark"?"light":"dark";'
			. 'if(typeof window.minisTheme==="function"){window.minisTheme(t);}else{h.setAttribute("data-theme",t);try{localStorage.setItem("minis-theme",t)}catch(e){}}maj(t);});})();';
		echo '<script>' . $js . '</script>' . "\n"; // phpcs:ignore
	},
	99
);
