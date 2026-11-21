<?php
/**
 * Page introuvable : retour vers la boutique.
 */
defined( 'ABSPATH' ) || exit;
get_header();
?>
<main id="main" class="wp-main">
	<div class="container wp-container wp-404">
		<p class="eyebrow">Page introuvable</p>
		<h1>Cette fleur s’est envolée…</h1>
		<p>La page que vous cherchez n’existe pas, ou plus. Les créations, elles, vous attendent toujours.</p>
		<p><a class="btn btn-primary" href="<?php echo fcb_boutique_url(); // phpcs:ignore ?>">Voir la boutique</a> <a class="btn btn-ghost" href="<?php echo fcb_url( '/' ); // phpcs:ignore ?>">Retour à l’accueil</a></p>
	</div>
</main>
<?php
get_footer();
