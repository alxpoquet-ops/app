<?php
/**
 * Page introuvable.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="wp-main">
	<div class="container wp-container wp-404">
		<p class="eyebrow">Page introuvable</p>
		<h1>Cette fleur s’est envolée…</h1>
		<p>La page que vous cherchez n’existe pas, ou plus. Les créations, elles, vous attendent toujours.</p>
		<p><a class="btn btn-primary" href="<?php echo esc_url( home_url( '/#boutique' ) ); ?>">Voir les créations</a> <a class="btn btn-ghost" href="<?php echo esc_url( home_url( '/' ) ); ?>">Retour à l’accueil</a></p>
	</div>
</main>
<?php
get_footer();
