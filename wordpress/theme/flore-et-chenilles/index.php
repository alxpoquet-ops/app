<?php
/**
 * Pages, articles et listes.
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="main" class="wp-main">
	<div class="container wp-container">
		<?php if ( have_posts() ) : ?>
			<?php if ( ! is_singular() ) : ?>
				<header class="wp-head"><p class="eyebrow">Flore &amp; Chenilles</p><h1><?php echo esc_html( wp_strip_all_tags( get_the_archive_title() ? get_the_archive_title() : 'Actualités' ) ); ?></h1></header>
			<?php endif; ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<article <?php post_class( 'wp-article' ); ?>>
					<?php if ( is_singular() ) : ?>
						<header class="wp-head"><p class="eyebrow">Flore &amp; Chenilles</p><h1><?php the_title(); ?></h1></header>
						<div class="wp-content"><?php the_content(); ?></div>
					<?php else : ?>
						<h2 class="wp-list-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div class="wp-content"><?php the_excerpt(); ?></div>
					<?php endif; ?>
				</article>
			<?php endwhile; ?>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<header class="wp-head"><h1>Rien à afficher ici</h1></header>
			<p><a class="btn btn-primary" href="<?php echo esc_url( home_url( '/' ) ); ?>">Retour à l’accueil</a></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
