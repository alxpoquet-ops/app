<?php
/* Pied de page de Flore & Chenilles · Boutique : toutes les pages du site, rangées. */
defined( 'ABSPATH' ) || exit;
$fcb_cats = get_terms( array( 'taxonomy' => 'product_cat', 'hide_empty' => true, 'exclude' => array( (int) get_option( 'default_product_cat' ) ) ) );
?>
<footer class="site-footer">
    <div class="container footer-grid fcb-pied">
      <div class="footer-brand">
        <a class="logo" href="<?php echo fcb_url( '/' ); ?>" aria-label="Flore &amp; Chenilles, accueil">
          <img class="logo-img logo-img--lg" src="<?php echo esc_url( FC_ASSETS ); ?>assets/photos/logo.jpg" alt="" width="64" height="64">
          <span class="logo-word">Flore <em>&amp;</em> Chenilles</span>
        </a>
        <p>Bouquets et décorations en fleurs éternelles, façonnés à la main avec passion dans mon atelier de <span data-city>Signy-l’Abbaye</span>, dans les Ardennes.</p>
      </div>
      <nav class="footer-nav" aria-label="La boutique">
        <h3>La boutique</h3>
        <a href="<?php echo fcb_boutique_url(); ?>">Toutes les créations</a>
        <?php if ( ! is_wp_error( $fcb_cats ) ) : foreach ( $fcb_cats as $c ) : ?>
        <a href="<?php echo esc_url( get_term_link( $c ) ); ?>"><?php echo esc_html( $c->name ); ?></a>
        <?php endforeach; endif; ?>
        <a href="<?php echo fcb_url( '/livraison-fleurs-signy-l-abbaye/' ); ?>">Livraison &amp; retrait</a>
        <a href="<?php echo fcb_url( '/questions-frequentes/' ); ?>">Questions fréquentes</a>
      </nav>
      <nav class="footer-nav" aria-label="Bon à savoir">
        <h3>Bon à savoir</h3>
        <a href="<?php echo fcb_url( '/fleurs/' ); ?>">Les fleurs en fil chenille</a>
        <a href="<?php echo fcb_url( '/occasions/' ); ?>">Une fleur pour chaque occasion</a>
        <a href="<?php echo fcb_url( '/conseils/' ); ?>">Conseils &amp; inspirations</a>
        <a href="<?php echo fcb_url( '/guide/' ); ?>">Le guide des fleurs éternelles</a>
        <a href="<?php echo fcb_url( '/lexique/' ); ?>">Le lexique</a>
        <a href="<?php echo fcb_url( '/fleurs-eternelles-ardennes/' ); ?>">Fleurs éternelles dans les Ardennes</a>
        <a href="<?php echo fcb_url( '/artisan-fleuriste-signy-l-abbaye/' ); ?>">Artisan fleuriste à Signy-l’Abbaye</a>
      </nav>
      <div class="footer-nav">
        <h3>Restons en lien</h3>
        <a href="<?php echo fcb_url( '/#atelier' ); ?>">L’atelier</a>
        <a href="<?php echo fcb_url( '/#contact' ); ?>">Formulaire de contact</a>
        <a data-ig href="<?php echo esc_url( fc_instagram_url() ); ?>" target="_blank" rel="noopener">Instagram</a>
        <a data-ig-dm href="https://ig.me/m/<?php echo rawurlencode( fc_setting( 'instagram', 'flore_et_chenilles' ) ); ?>" target="_blank" rel="noopener">Message privé</a>
        <a data-email <?php fc_email_attrs(); ?> data-email-row><?php echo fc_email_text(); // phpcs:ignore ?></a>
      </div>
    </div>
    <p class="footer-big" aria-hidden="true">Flore <em>&amp;</em> Chenilles</p>
    <div class="container footer-bottom">
      <p>© <span data-year><?php echo esc_html( wp_date( 'Y' ) ); ?></span> Flore &amp; Chenilles · Fait main avec passion dans les Ardennes</p>
      <?php fc_legal_links(); ?>
      <a href="<?php echo is_front_page() ? '#accueil' : '#main'; ?>" class="to-top">Retour en haut <svg><use href="#i-arrow"/></svg></a>
    </div>
  </footer>
