<?php
/**
 * Page « Bientôt en ligne » de Flore & Chenilles (remplace celle de WooCommerce tant que la boutique n'est pas ouverte).
 */

defined( 'ABSPATH' ) || exit;

$fc_ig   = fc_instagram_url();
$fc_mail = fc_setting( 'contact_email' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="robots" content="noindex, follow">
	<meta name="theme-color" content="#FBF7F2">
	<title>Flore &amp; Chenilles | Bientôt en ligne</title>
	<meta name="description" content="La boutique de fleurs éternelles en fil chenille de Flore &amp; Chenilles, faites main à Signy-l’Abbaye (Ardennes), ouvre très bientôt.">
	<link rel="icon" href="<?php echo esc_url( FC_ASSETS . 'assets/img/favicon.png' ); ?>" type="image/png">
	<link rel="preload" href="<?php echo esc_url( FC_ASSETS . 'assets/fonts/fraunces-latin-full-normal.woff2' ); ?>" as="font" type="font/woff2" crossorigin>
	<link rel="preload" href="<?php echo esc_url( FC_ASSETS . 'assets/fonts/jost-latin-wght-normal.woff2' ); ?>" as="font" type="font/woff2" crossorigin>
	<link rel="stylesheet" href="<?php echo esc_url( FC_ASSETS . 'assets/css/site.css?v=' . fc_asset_ver( 'assets/css/site.css' ) ); ?>">
	<style>
		body.fc-soon { min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 32px 16px; overflow-x: hidden; }
		.fc-soon .blob { position: fixed; z-index: 0; border-radius: 50%; filter: blur(60px); opacity: 0.7; pointer-events: none; }
		.fc-soon .blob-1 { width: 46vmax; height: 46vmax; left: -14vmax; top: -16vmax; background: var(--blush); }
		.fc-soon .blob-2 { width: 40vmax; height: 40vmax; right: -12vmax; top: 10vmax; background: var(--lilac); }
		.fc-soon .blob-3 { width: 36vmax; height: 36vmax; left: 18vmax; bottom: -20vmax; background: var(--mint); }
		.soon-card { position: relative; z-index: 1; width: min(100%, 980px); display: grid; gap: clamp(20px, 4vw, 48px); align-items: center; padding: clamp(26px, 5vw, 60px); border-radius: var(--r-xl); background: rgba(255, 253, 251, 0.72); box-shadow: var(--shadow-lg); backdrop-filter: blur(10px); }
		@media (min-width: 820px) { .soon-card { grid-template-columns: 1.1fr 0.9fr; } }
		.soon-logo { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 26px; text-decoration: none; }
		.soon-logo img { width: 58px; height: 58px; border-radius: 50%; box-shadow: var(--shadow-sm); }
		.soon-logo span { font-family: var(--serif); font-size: 1.5rem; color: var(--plum); }
		.soon-logo em { font-style: normal; font-weight: 400; font-variation-settings: 'SOFT' 0, 'WONK' 0; padding: 0 0.06em; color: var(--rose-ink); }
		.soon-copy h1 { font-size: clamp(2.4rem, 1.4rem + 4vw, 4.2rem); margin-bottom: 0.4em; }
		.soon-copy p { max-width: 34em; font-size: 1.08rem; color: var(--plum-2); }
		.soon-points { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 28px; padding: 0; list-style: none; }
		.soon-points li { padding: 6px 13px; border-radius: 999px; background: var(--lilac); font-size: 0.84rem; font-weight: 500; color: #5B3F73; }
		.soon-points li:nth-child(2) { background: #DDF0E3; color: #3B7552; }
		.soon-points li:nth-child(3) { background: #FBDDE8; color: #9C3F69; }
		.soon-actions { display: flex; flex-wrap: wrap; gap: 10px; }
		.soon-art { position: relative; aspect-ratio: 0.9; border-radius: 48% 48% 32px 32px / 34% 34% 32px 32px; background: linear-gradient(160deg, #FBEAF0, #EFE7F8 60%, #E6F3EA); overflow: hidden; box-shadow: var(--shadow); }
		.soon-art svg { width: 100%; height: 100%; }
		.soon-bug { position: absolute; left: 50%; bottom: 14px; width: 110px; transform: translateX(-50%); }
		.soon-fly { position: fixed; z-index: 2; width: 38px; pointer-events: none; animation: soon-fly 14s ease-in-out infinite; }
		@keyframes soon-fly { 0% { transform: translate(-10vw, 70vh) rotate(-8deg); } 25% { transform: translate(30vw, 35vh) rotate(10deg); } 50% { transform: translate(70vw, 55vh) rotate(-6deg); } 75% { transform: translate(95vw, 20vh) rotate(8deg); } 100% { transform: translate(115vw, 40vh) rotate(0); } }
		.soon-foot { margin-top: 26px; font-size: 0.82rem; color: var(--plum-3); }
		@media (prefers-reduced-motion: reduce) { .soon-fly { display: none; } }
	</style>
</head>
<body class="fc-soon">
	<?php get_template_part( 'parts/sprite' ); ?>
	<span class="blob blob-1" aria-hidden="true"></span><span class="blob blob-2" aria-hidden="true"></span><span class="blob blob-3" aria-hidden="true"></span>
	<main class="soon-card">
		<div class="soon-copy">
			<a class="soon-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo esc_url( FC_ASSETS . 'assets/photos/logo.jpg' ); ?>" alt="" width="58" height="58"><span>Flore <em>&amp;</em> Chenilles</span></a>
			<p class="eyebrow">Bientôt en ligne</p>
			<h1>Des fleurs qui <em>ne fanent jamais</em>, très bientôt ici.</h1>
			<p>La boutique en ligne de fleurs éternelles en fil chenille, façonnées à la main dans mon atelier de Signy-l’Abbaye, ouvre ses portes dans quelques jours. En attendant, retrouvez mes créations sur Instagram. Écrivez-moi via les réseaux sociaux pour toute commande.</p>
			<ul class="soon-points"><li>Fait main dans les Ardennes</li><li>Sans pollen</li><li>Carte de vœux offerte</li></ul>
			<div class="soon-actions">
				<a class="btn btn-primary" href="<?php echo esc_url( $fc_ig ); ?>" target="_blank" rel="noopener"><svg><use href="#i-instagram"/></svg> Suivre sur Instagram</a>
				<a class="btn btn-ghost" href="https://ig.me/m/<?php echo rawurlencode( fc_setting( 'instagram', 'flore_et_chenilles' ) ); ?>" target="_blank" rel="noopener"><svg><use href="#i-chat"/></svg> M’écrire en message privé</a>
				<?php if ( fc_setting( 'facebook' ) ) : ?>
					<a class="btn btn-ghost" href="<?php echo esc_url( fc_setting( 'facebook' ) ); ?>" target="_blank" rel="noopener"><svg><use href="#i-facebook"/></svg> Facebook</a>
				<?php endif; ?>
			</div>
			<p class="soon-foot">© <?php echo esc_html( wp_date( 'Y' ) ); ?> Flore &amp; Chenilles · Fleurs éternelles faites main à Signy-l’Abbaye</p>
		</div>
		<div class="soon-art" data-soon-art aria-hidden="true"><div class="soon-bug" data-soon-bug></div></div>
	</main>
	<div class="soon-fly" data-soon-fly aria-hidden="true"></div>
	<script src="<?php echo esc_url( FC_ASSETS . 'assets/js/flowers.js?v=' . fc_asset_ver( 'assets/js/flowers.js' ) ); ?>"></script>
	<script>
		(function () {
			var FC = window.FC_FLOWERS;
			if (!FC) return;
			var art = document.querySelector('[data-soon-art]');
			if (art && FC.bouquet) art.insertAdjacentHTML('afterbegin', FC.bouquet({ flowers: [['lys', 'mauve'], ['pavot', 'lavande'], ['rose', 'rose'], ['gerbera', 'blanc'], ['tulipe', 'jaune'], ['hortensia', 'ciel'], ['eucalyptus'], ['eucalyptus']] }, { fit: true, aspect: 0.9, pad: 16, label: 'Un bouquet en fil chenille' }));
			var bug = document.querySelector('[data-soon-bug]');
			if (bug && FC.cuteCaterpillar) bug.innerHTML = FC.cuteCaterpillar();
			else if (bug && FC.caterpillar) bug.innerHTML = FC.caterpillar();
			var fly = document.querySelector('[data-soon-fly]');
			if (fly && FC.butterfly) fly.innerHTML = FC.butterfly('#C8A0E2');
		})();
	</script>
</body>
</html>
