<?php
/**
 * Pied de page commun ; sur l'accueil, aussi « Ma sélection » et la fenêtre des créations.
 */

defined( 'ABSPATH' ) || exit;

get_template_part( 'parts/footer' );
if ( is_front_page() ) {
	get_template_part( 'parts/overlays' );
} else {
	echo '<div class="toast" role="status" aria-live="polite"></div>';
}
wp_footer();
?>
</body>
</html>
