<?php
/**
 * Pages : panier (« Ma sélection »), commande, compte, pages légales…
 */

defined( 'ABSPATH' ) || exit;

get_header();

/* Pages de contenu (fleurs, occasions, conseils…) : leur propre mise en page. */
if ( fc_is_seo_page() ) {
	echo '<main id="main" class="pg-wrap wp-seo">';
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	echo '</main>';
	get_footer();
	return;
}

$fc_eyebrow = 'Flore & Chenilles';
if ( function_exists( 'is_cart' ) ) {
	if ( is_cart() ) {
		$fc_eyebrow = 'Votre panier';
	} elseif ( is_checkout() ) {
		$fc_eyebrow = 'Paiement sécurisé';
	} elseif ( is_account_page() ) {
		$fc_eyebrow = 'Espace client';
	}
}
?>
<main id="main" class="wp-main<?php echo function_exists( 'is_cart' ) && ( is_cart() || is_checkout() || is_account_page() ) ? ' wc-main' : ''; ?>">
	<div class="container wp-container">
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class( 'wp-article' ); ?>>
				<header class="wp-head"><p class="eyebrow"><?php echo esc_html( $fc_eyebrow ); ?></p><h1><?php the_title(); ?></h1></header>
				<div class="wp-content"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
	</div>
</main>
<?php
get_footer();
