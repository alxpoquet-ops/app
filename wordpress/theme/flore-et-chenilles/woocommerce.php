<?php
/**
 * Pages de la boutique WooCommerce : fiche d'une création, catégories, toutes les créations.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="wp-main wc-main">
	<div class="container wp-container">
		<?php woocommerce_content(); ?>
	</div>
</main>
<?php
get_footer();
