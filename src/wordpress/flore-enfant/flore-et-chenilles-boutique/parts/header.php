<?php
/* En-tête de Flore & Chenilles · Boutique : de vraies pages dans le menu, et un menu téléphone illustré. */
defined( 'ABSPATH' ) || exit;
$fcb_liens = array(
	array( 'accueil', fcb_url( '/' ), 'Accueil', 'i-flower', '#F8E1E6' ),
	array( 'boutique', fcb_boutique_url(), 'La boutique', 'i-bag', '#ECE5F8' ),
	array( 'fleurs', fcb_url( '/fleurs/' ), 'Les fleurs', 'i-stem', '#E2F1E7' ),
	array( 'occasions', fcb_url( '/occasions/' ), 'Occasions', 'i-gift', '#FBEBDD' ),
	array( 'conseils', fcb_url( '/conseils/' ), 'Conseils', 'i-leaf', '#E3EDF8' ),
	array( 'questions', fcb_url( '/questions-frequentes/' ), 'Vos questions', 'i-chat', '#F8E1E6' ),
	array( 'contact', fcb_url( '/#contact' ), 'Contact', 'i-mail', '#F8F0D6' ),
);
?>
<header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="<?php echo fcb_url( '/' ); ?>" aria-label="Flore &amp; Chenilles, retour à l’accueil">
        <img class="logo-img" src="<?php echo esc_url( FC_ASSETS ); ?>assets/photos/logo.jpg" alt="" width="44" height="44">
        <span class="logo-word">Flore <em>&amp;</em> Chenilles</span>
      </a>
      <nav class="fcb-nav" aria-label="Navigation principale">
        <a href="<?php echo fcb_boutique_url(); ?>"<?php echo fcb_courant( 'boutique' ); ?>>Boutique</a>
        <a href="<?php echo fcb_url( '/fleurs/' ); ?>"<?php echo fcb_courant( 'fleurs' ); ?>>Les fleurs</a>
        <a href="<?php echo fcb_url( '/occasions/' ); ?>"<?php echo fcb_courant( 'occasions' ); ?>>Occasions</a>
        <a href="<?php echo fcb_url( '/conseils/' ); ?>"<?php echo fcb_courant( 'conseils' ); ?>>Conseils</a>
        <a href="<?php echo fcb_url( '/#atelier' ); ?>">L’atelier</a>
        <a href="<?php echo fcb_url( '/#contact' ); ?>">Contact</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn fcb-theme" type="button" data-fcb-theme aria-label="Passer en apparence sombre" aria-pressed="false"><svg class="fcb-soleil" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><svg class="fcb-lune" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6Z"/></svg></button>
        <a class="icon-btn hide-sm" data-ig href="<?php echo esc_url( fc_instagram_url() ); ?>" target="_blank" rel="noopener" aria-label="Instagram de Flore &amp; Chenilles (nouvel onglet)"><svg><use href="#i-instagram"/></svg></a>
        <?php fc_cart_button(); ?>
        <button class="icon-btn burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
      </div>
    </div>
    <div class="crawl" aria-hidden="true"><div class="crawl-bar"></div><div class="crawl-bug" data-caterpillar></div></div>
  </header>

<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <nav aria-label="Menu mobile">
      <?php foreach ( $fcb_liens as $i => $l ) : ?>
      <a class="fcb-lien" href="<?php echo $l[1]; // phpcs:ignore ?>" style="--i:<?php echo (int) $i; ?>"<?php echo fcb_courant( $l[0] ); ?>><span class="fcb-ic" style="--t:<?php echo esc_attr( $l[4] ); ?>" aria-hidden="true"><svg><use href="#<?php echo esc_attr( $l[3] ); ?>"/></svg></span><?php echo esc_html( $l[2] ); ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="mobile-social">
      <a class="btn btn-ghost" data-ig href="<?php echo esc_url( fc_instagram_url() ); ?>" target="_blank" rel="noopener"><svg><use href="#i-instagram"/></svg><span data-ig-handle>@<?php echo esc_html( fc_setting( 'instagram', 'flore_et_chenilles' ) ); ?></span></a>
    </div>
  </div>
