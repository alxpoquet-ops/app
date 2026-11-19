<?php
/**
 * Plugin Name: Flore & Chenilles : mode vitrine
 * Description: Le site présente les compositions sans prix ni paiement. Les visiteurs ajoutent leurs coups de cœur à leur sélection et envoient une demande de réservation, qui arrive par e-mail. Le compositeur « Votre bouquet à vous » est retiré. Désactiver l'extension remet la boutique comme avant.
 * Version: 1.0.4
 * Requires PHP: 7.4
 * Author: Les Minis Monstres
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

define('FV_VERSION', '1.0.4');

/* Adresse qui reçoit les demandes : celle des réglages de la boutique, sinon celle du site */
function fv_destinataire() {
    if (function_exists('fcb_settings')) {
        $s = fcb_settings();
        if (!empty($s['contact_email']) && is_email($s['contact_email'])) return $s['contact_email'];
    }
    return get_option('admin_email');
}
/* Le connecteur des Minis Monstres a son propre bouton « Nous contacter » en vitrine : ici, c'est le formulaire de réservation qui le remplace */
add_filter('alexlia_vitrine_bouton', '__return_false');
function fv_front() { return !is_admin() && !wp_doing_ajax(); }

/* =========================================================================
 *  1. Réception des demandes de réservation (formulaire de l'accueil et des fiches)
 * ========================================================================= */
function fv_trop_de_demandes() {
    $ip = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . wp_salt('nonce')), 0, 20);
    $k = 'fv_rl_' . $ip;
    $n = (int) get_transient($k);
    if ($n >= 8) return true;
    set_transient($k, $n + 1, HOUR_IN_SECONDS);
    return false;
}
function fv_envoyer($nom, $email, $tel, $message, $sujet) {
    $nom = mb_substr(sanitize_text_field($nom), 0, 120);
    $email = sanitize_email($email);
    $tel = mb_substr(sanitize_text_field($tel), 0, 40);
    $message = mb_substr(sanitize_textarea_field($message), 0, 6000);
    if ($nom === '' || !is_email($email) || $message === '') return false;
    $corps = $message . "\n\n---\nNom : $nom\nE-mail : $email\nTéléphone : " . ($tel ?: 'non indiqué') . "\n\nPour répondre, il suffit de répondre à cet e-mail.\n";
    $h = ['Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $nom . ' <' . $email . '>'];
    $ok = wp_mail(fv_destinataire(), mb_substr(sanitize_text_field($sujet ?: 'Nouvelle demande de réservation'), 0, 150), $corps, $h);
    if ($ok) {
        // un petit accusé de réception au visiteur
        wp_mail($email, 'Votre demande est bien reçue', "Bonjour $nom,\n\nMerci pour votre demande ! Je l’ai bien reçue et je vous réponds très vite par e-mail pour confirmer la composition, le prix, la date et le retrait ou la livraison.\n\nÀ très bientôt,\nFlore & Chenilles\n", ['Content-Type: text/plain; charset=UTF-8']);
    }
    return $ok;
}
add_action('rest_api_init', function () {
    register_rest_route('flore/v1', '/demande', [
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $r) {
            $d = $r->get_json_params();
            $d = is_array($d) ? $d : $r->get_params();
            if (!empty($d['_honey'])) return ['success' => true, 'ok' => true];
            if (fv_trop_de_demandes()) return new WP_REST_Response(['success' => false, 'ok' => false, 'message' => 'Trop de demandes, réessayez dans un moment.'], 429);
            $sujet = str_replace('Nouvelle commande de', 'Demande de réservation de', (string) ($d['_subject'] ?? ''));
            $ok = fv_envoyer($d['Nom'] ?? ($d['name'] ?? ''), $d['email'] ?? '', $d['Téléphone'] ?? ($d['phone'] ?? ''), $d['Message'] ?? ($d['message'] ?? ''), $sujet);
            return new WP_REST_Response(['success' => $ok, 'ok' => $ok], $ok ? 200 : 400);
        },
    ]);
});
/* Formulaire de la fiche d'une création (pages WooCommerce) */
add_action('admin_post_nopriv_fv_reserver', 'fv_reserver_post');
add_action('admin_post_fv_reserver', 'fv_reserver_post');
function fv_reserver_post() {
    $pid = (int) ($_POST['produit'] ?? 0);
    $retour = $pid ? get_permalink($pid) : home_url('/');
    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_fv'] ?? '')), 'fv_reserver') || !empty($_POST['_honey']) || fv_trop_de_demandes()) {
        wp_safe_redirect(add_query_arg('reservation', 'erreur', $retour) . '#reserver', 303); exit;
    }
    $P = wp_unslash($_POST);
    $titre = $pid ? get_the_title($pid) : '';
    $msg = "Bonjour Flore & Chenilles !\n\nJ’aimerais réserver cette composition : " . $titre . ($pid ? ' (' . get_permalink($pid) . ')' : '') . "\n"
        . (!empty($P['quantite']) ? 'Quantité : ' . (int) $P['quantite'] . "\n" : '')
        . (!empty($P['date']) ? 'Pour le : ' . sanitize_text_field($P['date']) . "\n" : '')
        . (!empty($P['message']) ? "\n" . $P['message'] . "\n" : '');
    $ok = fv_envoyer($P['nom'] ?? '', $P['email'] ?? '', $P['telephone'] ?? '', $msg, 'Demande de réservation : ' . $titre);
    wp_safe_redirect(add_query_arg('reservation', $ok ? 'ok' : 'erreur', $retour) . '#reserver', 303); exit;
}

/* =========================================================================
 *  2. Plus de prix ni de paiement sur les pages WooCommerce
 * ========================================================================= */
add_filter('woocommerce_get_price_html', function ($h) { return fv_front() ? '' : $h; }, 99);
add_filter('woocommerce_is_purchasable', function ($v) { return fv_front() ? false : $v; }, 99);
add_filter('woocommerce_variation_is_purchasable', function ($v) { return fv_front() ? false : $v; }, 99);
add_filter('woocommerce_structured_data_product', function ($d) { unset($d['offers']); return $d; }, 99);
add_filter('rank_math/snippet/rich_snippet_product_entity', function ($e) { unset($e['offers']); return $e; }, 99);
add_action('template_redirect', function () {
    if (function_exists('is_cart') && (is_cart() || is_checkout())) { wp_safe_redirect(home_url('/#boutique'), 302); exit; }
});
add_action('woocommerce_single_product_summary', function () {
    echo '<p class="fv-compo-tag">Composition faite main</p>';
}, 4);
add_action('woocommerce_single_product_summary', function () {
    global $product;
    $etat = isset($_GET['reservation']) ? sanitize_key(wp_unslash($_GET['reservation'])) : '';
    ?>
    <div class="fv-reserver" id="reserver">
      <h2>Réserver cette composition</h2>
      <p>Pas de paiement en ligne : envoyez votre demande, je vous réponds par e-mail pour confirmer le prix, la date et le retrait ou la livraison.</p>
      <?php if ($etat === 'ok') echo '<p class="fv-ok" role="status">Merci ! Votre demande est bien partie. Je vous réponds très vite par e-mail.</p>'; elseif ($etat === 'erreur') echo '<p class="fv-err" role="status">Votre demande n’est pas partie. Vérifiez votre nom, votre e-mail et votre message, puis réessayez.</p>'; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="fv-form">
        <input type="hidden" name="action" value="fv_reserver">
        <input type="hidden" name="produit" value="<?php echo (int) ($product ? $product->get_id() : 0); ?>">
        <?php wp_nonce_field('fv_reserver', '_fv'); ?>
        <label class="fv-hp" aria-hidden="true">Ne pas remplir<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label>
        <p class="fv-row"><label>Prénom et nom<input name="nom" required autocomplete="name"></label><label>E-mail<input name="email" type="email" required autocomplete="email"></label></p>
        <p class="fv-row"><label>Téléphone (facultatif)<input name="telephone" type="tel" autocomplete="tel"></label><label>Pour le (facultatif)<input name="date" type="date"></label></p>
        <p class="fv-row"><label>Quantité<input name="quantite" type="number" min="1" max="50" value="1"></label></p>
        <p><label>Votre message<textarea name="message" rows="3" required>J’aimerais réserver cette composition.</textarea></label></p>
        <button class="button btn btn-primary" type="submit">Envoyer ma demande de réservation</button>
      </form>
    </div>
    <?php
}, 31);

/* =========================================================================
 *  3. L'accueil : données sans prix, envoi des demandes par le site, compositeur retiré
 * ========================================================================= */
add_action('wp_enqueue_scripts', function () {
    $css = 'a[href$="#bouquet"],#bouquet,.why-price,[data-pm-custom],.product .price,.pm-price,.pm-count-line,.cart-total,.ci-price,.order-recap .tot,.order-recap li > span:last-child,.promo-pill,.promo-banner,.promo-tag,.sort-field,.fc-count-line{display:none!important}'
        . '.fv-compo-tag,.fv-tag{display:inline-block;margin:0 0 6px;padding:3px 10px;border-radius:999px;background:#ECE5F8;color:#5B4A8B;font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase}'
        . '.fv-reserver{margin:22px 0;padding:18px;border-radius:18px;background:#FBF1F4}.fv-reserver h2{margin-top:0;font-size:1.3rem}.fv-form label{display:block;font-weight:600;margin-bottom:8px}.fv-form input,.fv-form textarea{display:block;width:100%;margin-top:4px;padding:10px 12px;border:1px solid #E8D5DC;border-radius:12px;font:inherit}.fv-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.fv-hp{position:absolute!important;left:-9999px}.fv-ok{padding:10px 12px;border-radius:12px;background:#E2F1E7;color:#235C3A}.fv-err{padding:10px 12px;border-radius:12px;background:#FDE8E4;color:#8A2E1E}';
    wp_register_style('flore-vitrine', false, [], FV_VERSION);
    wp_enqueue_style('flore-vitrine');
    wp_add_inline_style('flore-vitrine', $css);
    if (!is_front_page()) return;
    $js = '(function(){var S=window.SITE=window.SITE||{};var W=window.FC_WP;'
        . 'if(W){delete W.shop;W.promo={percent:0};W.unitPrice=null;W.jar=Object.assign({},W.jar||{},{price:null});'
        . 'W.contact=Object.assign({},W.contact||{},{formEndpoint:' . wp_json_encode(rest_url('flore/v1/demande')) . '});'
        . 'var sp=function(v){return typeof v==="string"&&/\\d\\s?€/.test(v)?v.replace(/[^.!?]*\\d\\s?€[^.!?]*[.!?]?\\s*/g," ").replace(/\\s{2,}/g," ").trim():v;};(W.products||[]).forEach(function(p){Object.keys(p).forEach(function(k){p[k]=sp(p[k]);});p.price=null;delete p.linkOnly;delete p.count;delete p.priceFrom;delete p.quote;if(p.options&&p.options.choices)p.options.choices.forEach(function(c){c.price=null;});});}'
        . 'S.shop=null;S.promo={percent:0};S.delivery=Object.assign({},S.delivery||{},{zones:[]});})();';
    // juste après les données du thème (data.js) et avant son script (app.js), qui en dépend
    wp_add_inline_script('fc-data', $js, 'after');
    // textes de l'accueil : pas de prix, pas de paiement, on réserve
    $dom = '(function(){function q(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}'
        . 'function t(el,txt){if(el)el.textContent=txt;}'
        . 'function texte(){'
        . 'q(".step").forEach(function(s){var p=s.querySelector("p");if(p&&/fleur par fleur/.test(p.textContent))t(p,"Une de mes compositions, à réserver en quelques clics.");});'
        . 'q(".shop-note").forEach(function(p){p.lastChild&&(p.lastChild.textContent=" Ajoutez vos compositions préférées à votre sélection et écrivez votre carte de vœux, puis envoyez votre demande de réservation : je vous réponds par e-mail pour le prix, la date et le retrait ou la livraison.");});'
        . 'q(".faq-item").forEach(function(d){var s=d.querySelector("summary"),a=d.querySelector(".faq-a");if(!s||!a)return;var k=s.textContent;'
        . 'if(/Combien co/.test(k)){a.innerHTML="<p>Les prix sont donnés sur demande. Réservez la composition qui vous plaît : je vous réponds par e-mail avec son prix, la date et le retrait ou la livraison.</p>";}'
        . 'else if(/choisir mes couleurs/.test(k)){a.innerHTML="<p>Bien sûr ! Parlez-moi de vos idées : les couleurs de votre salon, de votre chambre ou de votre mariage, on peut essayer ensemble.</p>";}'
        . 'else{q("p",a).forEach(function(p){p.innerHTML=p.innerHTML.replace(/\\s*Le bocal est à 5[^.]*\\.\\s*/,"");});}});'
        . 'var w=document.createTreeWalker(document.body,4),n,l=[];while(n=w.nextNode())if(/\\d\\s?€/.test(n.nodeValue)&&!n.parentNode.closest("script,style"))l.push(n);l.forEach(function(n){n.nodeValue=n.nodeValue.replace(/[^.!?]*\\d\\s?€[^.!?]*[.!?]?\\s*/g," ").replace(/\\s{2,}/g," ");});'
        . 'q("[data-checkout]").forEach(function(b){if(b.firstChild&&b.firstChild.nodeType===3)b.firstChild.textContent="Réserver ";});}'
        . 'function etiquettes(){q(".product-body").forEach(function(b){if(!b.querySelector(".fv-tag")){var e=document.createElement("span");e.className="fv-tag";e.textContent="Composition";b.insertBefore(e,b.firstChild);}});'
        . 'q(".pm-info").forEach(function(b){if(!b.querySelector(".fv-tag")){var e=document.createElement("span");e.className="fv-tag";e.textContent="Composition faite main";b.insertBefore(e,b.firstChild);}});'
        . 'q("[data-pm-add]").forEach(function(b){var s=b.lastChild;if(s&&s.nodeType===3&&/sélection/.test(s.textContent))s.textContent=" Réserver cette composition";});'
        . 'q("#modal-title").forEach(function(h){if(/Finaliser ma demande/.test(h.textContent))t(h,"Ma demande de réservation");});}'
        . 'document.addEventListener("DOMContentLoaded",function(){texte();etiquettes();new MutationObserver(etiquettes).observe(document.body,{childList:true,subtree:true});});})();';
    wp_register_script('flore-vitrine-textes', false, [], FV_VERSION, ['in_footer' => true]);
    wp_enqueue_script('flore-vitrine-textes');
    wp_add_inline_script('flore-vitrine-textes', $dom);
}, 30);

/* Les phrases avec un prix disparaissent des descriptions */
function fv_sans_prix($html) {
    if (is_admin() || !is_string($html) || !preg_match('/\d\s?(€|&euro;)/u', $html)) return $html;
    return preg_replace('/[^.!?<>]*\d\s?(€|&euro;)[^.!?<]*[.!?]?\s*/u', ' ', $html);
}
add_filter('the_content', function ($c) { return is_singular('product') ? fv_sans_prix($c) : $c; }, 20);
add_filter('woocommerce_short_description', 'fv_sans_prix', 20);

/* Le produit support du compositeur ne doit plus apparaître */
add_action('pre_get_posts', function ($q) {
    if (is_admin() || !$q->is_main_query() || !function_exists('fcb_bouquet_product_id')) return;
    if ($q->get('post_type') === 'product' || $q->is_post_type_archive('product') || $q->is_tax(['product_cat', 'product_tag'])) {
        $ex = (array) $q->get('post__not_in');
        $ex[] = (int) fcb_bouquet_product_id();
        $q->set('post__not_in', $ex);
    }
});
