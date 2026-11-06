<?php
/**
 * En-tête commun : logo, navigation, Instagram, « Ma sélection », menu mobile.
 */

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<script>document.documentElement.classList.add('js');window.addEventListener('error',function(){document.documentElement.classList.remove('js');});</script>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Aller au contenu</a>
<?php
get_template_part( 'parts/sprite' );
get_template_part( 'parts/header' );
