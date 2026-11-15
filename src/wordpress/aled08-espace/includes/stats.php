<?php
/**
 * Alex & Lia Espace client : le tableau de bord en direct (forfait Titan).
 * Les chiffres viennent du site du client, par le connecteur (action « stats »), et se mettent
 * à jour toutes les 30 secondes. Les autres forfaits voient un aperçu flouté.
 */
defined('ABSPATH') || exit;

function aled08e_stats_acces($uid) {
    return aled08e_meta($uid, 'forfait') === 'titan' || aled08e_famille($uid);
}

/* Chiffres du site du client (gardés 20 secondes pour ne pas solliciter son site à chaque rafraîchissement) */
function aled08e_stats_lire($uid) {
    $cle = 'aled08_stats_' . (int) $uid;
    $c = get_transient($cle);
    if (is_array($c)) return $c;
    if (!aled08e_meta($uid, 'lia_url') || !aled08e_meta($uid, 'lia_secret')) return ['etat' => 'non_relie'];
    $r = aled08e_lia_appel($uid, 'stats', []);
    if (is_wp_error($r)) {
        $code = (int) ($r->get_error_data()['code'] ?? 0);
        return ['etat' => $code === 400 ? 'connecteur_ancien' : 'injoignable'];
    }
    $r['etat'] = 'ok';
    set_transient($cle, $r, 20);
    return $r;
}

add_action('wp_ajax_aled08e_stats', function () {
    if (!check_ajax_referer('aled08e_stats', '_n', false)) wp_send_json_error(['etat' => 'session'], 403);
    $uid = get_current_user_id();
    if (!aled08e_stats_acces($uid)) wp_send_json_error(['etat' => 'forfait'], 403);
    wp_send_json_success(aled08e_stats_lire($uid));
});

function aled08e_stats_html($uid) {
    $acces = aled08e_stats_acces($uid);
    $boutique = false;
    foreach (aled08e_cmd_user_commandes($uid) as $c) if ($c['type'] === 'boutique') $boutique = true;
    $carte = function ($id, $ic, $label, $couleur) { return '<div class="live-kpi c-' . $couleur . '"><span class="live-kpi-ico">' . aled08e_icon($ic) . '</span><span><small>' . esc_html($label) . '</small><strong data-live="' . $id . '">0</strong></span></div>'; };
    ob_start();
    ?>
<section class="live<?php echo $acces ? '' : ' is-locked'; ?>" data-live-stats="<?php echo $acces ? '1' : '0'; ?>" data-ajax="<?php echo esc_url(admin_url('admin-ajax.php')); ?>" data-nonce="<?php echo esc_attr($acces ? wp_create_nonce('aled08e_stats') : ''); ?>">
  <div class="live-head">
    <p class="app-sub"><span class="live-dot" aria-hidden="true"></span>Votre site en direct</p>
    <small class="live-maj" data-live-maj aria-live="polite"><?php echo $acces ? 'Connexion à votre site…' : 'Exemple'; ?></small>
  </div>
  <p class="esp-warn" data-live-msg hidden></p>
  <div class="live-kpis">
    <?php echo $carte('actifs', 'users', 'En ce moment', 'pink') . $carte('visiteurs', 'user', 'Visiteurs aujourd’hui', 'mint') . $carte('vues', 'eye', 'Pages vues aujourd’hui', 'sky') . $carte('temps', 'timer', 'Temps de réponse', 'butter'); // phpcs:ignore ?>
    <?php if ($boutique) echo $carte('commandes', 'shopping-bag', 'Commandes aujourd’hui', 'lilac') . $carte('ventes', 'euro', 'Ventes sur 30 jours', 'peach'); // phpcs:ignore ?>
  </div>
  <div class="live-grid">
    <div class="live-card live-wide"><p class="live-title">Visiteurs sur 30 jours</p><div class="live-chart" data-chart="jours"></div><p class="live-legend"><span class="lg lg-a"></span>Visiteurs <span class="lg lg-b"></span>Pages vues</p></div>
    <div class="live-card"><p class="live-title">Aujourd’hui, heure par heure</p><div class="live-chart" data-chart="heures"></div></div>
    <div class="live-card"><p class="live-title">Appareils</p><div class="live-donut" data-chart="appareils"></div></div>
    <div class="live-card"><p class="live-title">D’où viennent vos visiteurs</p><div class="live-donut" data-chart="sources"></div></div>
    <div class="live-card"><p class="live-title">Pages les plus vues</p><div class="live-bars" data-chart="pages"></div></div>
    <div class="live-card live-wide"><p class="live-title">Votre serveur</p>
      <div class="live-gauges">
        <div class="live-gauge" data-gauge="memoire"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 60a50 50 0 0 1 100 0" class="g-bg"/><path d="M10 60a50 50 0 0 1 100 0" class="g-val" pathLength="100" stroke-dasharray="0 100"/></svg><strong>0 %</strong><small>Mémoire (RAM) de votre site</small></div>
        <div class="live-gauge" data-gauge="charge"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 60a50 50 0 0 1 100 0" class="g-bg"/><path d="M10 60a50 50 0 0 1 100 0" class="g-val" pathLength="100" stroke-dasharray="0 100"/></svg><strong>0</strong><small>Charge du serveur</small></div>
        <div class="live-gauge" data-gauge="disque"><svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 60a50 50 0 0 1 100 0" class="g-bg"/><path d="M10 60a50 50 0 0 1 100 0" class="g-val" pathLength="100" stroke-dasharray="0 100"/></svg><strong>0 %</strong><small>Espace disque</small></div>
      </div>
      <dl class="live-infos" data-live-infos>
        <div><dt>Sécurité HTTPS</dt><dd data-info="https">…</dd></div>
        <div><dt>WordPress</dt><dd data-info="wordpress">…</dd></div>
        <div><dt>PHP</dt><dd data-info="php">…</dd></div>
        <div><dt>Pages en ligne</dt><dd data-info="pages">…</dd></div>
        <div><dt>Articles</dt><dd data-info="articles">…</dd></div>
        <?php if ($boutique) : ?><div><dt>Produits</dt><dd data-info="produits">…</dd></div><?php endif; ?>
      </dl>
    </div>
  </div>
  <?php if (!$acces) : ?><div class="live-lock"><span><?php echo aled08e_icon('lock'); // phpcs:ignore ?></span><strong>Votre site en direct, avec Titan</strong><p>Visiteurs en ce moment, pages vues, appareils, provenance, mémoire et charge du serveur : tout se met à jour toutes les 30 secondes.</p><button type="button" class="btn btn-primary btn-sm" data-go="forfait"><?php echo aled08e_icon('arrow-right'); // phpcs:ignore ?><span>Voir le forfait Titan</span></button></div><?php endif; ?>
  <p class="app-note">Mesure d’audience sans cookie : vos visiteurs sont comptés de façon anonyme, sans aucune donnée personnelle gardée. Les visites des personnes connectées et des robots ne sont pas comptées.</p>
</section>
<script>
(function () {
  var box = document.querySelector('[data-live-stats]');
  if (!box) return;
  var actif = box.getAttribute('data-live-stats') === '1';
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s) { return box.querySelector(s); };
  var nf = function (n) { return (Math.round(n * 10) / 10).toLocaleString('fr-FR'); };
  var el = function (t, a) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; };
  var vider = function (n) { while (n.firstChild) n.removeChild(n.firstChild); };
  var COUL = ['var(--mint-d)', 'var(--lilac-d)', 'var(--pink-d)', 'var(--sky-d)', 'var(--butter-d)', 'var(--peach-d)'];

  function courbe(n, jours) {
    vider(n);
    var W = 600, H = 180, P = 24, max = 1;
    jours.forEach(function (j) { max = Math.max(max, j.vues, j.visiteurs); });
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'live-svg', role: 'img', 'aria-label': 'Visiteurs sur 30 jours' });
    for (var g = 0; g <= 3; g++) { var y = P + (H - 2 * P) * g / 3; svg.appendChild(el('line', { x1: P, x2: W - 6, y1: y, y2: y, class: 'grid' })); }
    var pts = function (cle) { return jours.map(function (j, i) { return [P + (W - P - 6) * i / Math.max(1, jours.length - 1), H - P - (H - 2 * P) * j[cle] / max]; }); };
    [['vues', 'var(--sky-d)', 'line-b'], ['visiteurs', 'var(--mint-d)', 'line-a']].forEach(function (c) {
      var p = pts(c[0]);
      var d = p.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
      if (c[0] === 'visiteurs') svg.appendChild(el('path', { d: d + ' L' + p[p.length - 1][0] + ' ' + (H - P) + ' L' + P + ' ' + (H - P) + 'Z', class: 'area' }));
      svg.appendChild(el('path', { d: d, class: c[2] }));
    });
    var t = el('text', { x: P, y: 14, class: 'axe' }); t.textContent = 'max ' + nf(max); svg.appendChild(t);
    var t2 = el('text', { x: W - 6, y: H - 6, class: 'axe', 'text-anchor': 'end' }); t2.textContent = 'aujourd’hui'; svg.appendChild(t2);
    n.appendChild(svg);
  }
  function barres(n, vals, lab) {
    vider(n);
    var W = 300, H = 150, max = Math.max.apply(null, vals.concat([1])), bw = W / vals.length;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'live-svg', role: 'img', 'aria-label': lab });
    var h = new Date().getHours();
    vals.forEach(function (v, i) { var bh = Math.max(2, (H - 22) * v / max); svg.appendChild(el('rect', { x: i * bw + 1.5, y: H - 16 - bh, width: bw - 3, height: bh, rx: 3, class: i === h ? 'bar now' : 'bar' })); });
    [0, 6, 12, 18].forEach(function (x) { var t = el('text', { x: x * bw, y: H - 2, class: 'axe' }); t.textContent = x + 'h'; svg.appendChild(t); });
    n.appendChild(svg);
  }
  function camembert(n, obj) {
    vider(n);
    var cles = Object.keys(obj || {}), total = cles.reduce(function (s, k) { return s + (+obj[k] || 0); }, 0);
    var svg = el('svg', { viewBox: '0 0 120 120', class: 'live-svg donut', role: 'img' });
    svg.appendChild(el('circle', { cx: 60, cy: 60, r: 44, class: 'donut-bg' }));
    var acc = 0, leg = document.createElement('ul'); leg.className = 'donut-leg';
    cles.forEach(function (k, i) {
      var v = +obj[k] || 0; if (!total) return;
      var part = v / total * 100;
      svg.appendChild(el('circle', { cx: 60, cy: 60, r: 44, pathLength: 100, class: 'donut-part', stroke: COUL[i % COUL.length], 'stroke-dasharray': part + ' ' + (100 - part), 'stroke-dashoffset': -acc, transform: 'rotate(-90 60 60)' }));
      acc += part;
    });
    var c = el('text', { x: 60, y: 66, 'text-anchor': 'middle', class: 'donut-total' }); c.textContent = nf(total); svg.appendChild(c);
    (cles.length ? cles : ['Pas encore de visite']).forEach(function (k, i) {
      var li = document.createElement('li'); li.innerHTML = '<i style="background:' + (cles.length ? COUL[i % COUL.length] : 'var(--edge)') + '"></i>'; li.appendChild(document.createTextNode(k + (cles.length ? ' : ' + (total ? Math.round(obj[k] / total * 100) : 0) + ' %' : ''))); leg.appendChild(li);
    });
    n.appendChild(svg); n.appendChild(leg);
  }
  function pages(n, obj) {
    vider(n);
    var cles = Object.keys(obj || {}), max = Math.max.apply(null, cles.map(function (k) { return obj[k]; }).concat([1]));
    if (!cles.length) { n.innerHTML = '<p class="live-vide">Les pages les plus vues s’afficheront ici.</p>'; return; }
    cles.forEach(function (k) { var d = document.createElement('div'); d.className = 'pb'; d.innerHTML = '<span class="pb-l"></span><span class="pb-v"></span><span class="pb-b"><i style="width:' + Math.round(obj[k] / max * 100) + '%"></i></span>'; d.children[0].textContent = k === '/' ? 'Accueil' : decodeURIComponent(k); d.children[1].textContent = nf(obj[k]); n.appendChild(d); });
  }
  function jauge(nom, pct, texte) {
    var g = box.querySelector('[data-gauge="' + nom + '"]'); if (!g) return;
    pct = Math.max(0, Math.min(100, pct || 0));
    g.querySelector('.g-val').setAttribute('stroke-dasharray', pct + ' 100');
    g.classList.toggle('is-haut', pct > 80);
    g.querySelector('strong').textContent = texte;
  }
  var go = function (o) { return Math.round(o / 1048576) + ' Mo'; };
  function afficher(d) {
    var a = d.aujourdhui || {}, s = d.serveur || {}, b = d.boutique;
    var set = function (k, v) { var e = $('[data-live="' + k + '"]'); if (e) e.textContent = v; };
    set('actifs', nf(a.actifs || 0)); set('visiteurs', nf(a.visiteurs || 0)); set('vues', nf(a.vues || 0));
    set('temps', s.temps_reponse != null ? nf(s.temps_reponse * 1000) + ' ms' : '–');
    if (b) { set('commandes', nf(b.commandes_aujourdhui || 0)); set('ventes', nf(b.ventes_30j || 0) + ' €'); }
    courbe($('[data-chart="jours"]'), d.jours || []);
    barres($('[data-chart="heures"]'), a.heures || new Array(24).fill(0), 'Visites heure par heure');
    camembert($('[data-chart="appareils"]'), d.appareils || {});
    camembert($('[data-chart="sources"]'), d.sources || {});
    pages($('[data-chart="pages"]'), d.pages || {});
    jauge('memoire', s.memoire_max ? s.memoire / s.memoire_max * 100 : 0, s.memoire ? go(s.memoire) + (s.memoire_max ? ' / ' + go(s.memoire_max) : '') : '–');
    var ch = s.charge ? (s.coeurs ? s.charge[0] / s.coeurs * 100 : s.charge[0] * 25) : 0;
    jauge('charge', ch, s.charge ? (s.coeurs ? Math.round(ch) + ' %' : nf(s.charge[0])) : 'non fournie');
    jauge('disque', s.disque_total ? (1 - s.disque_libre / s.disque_total) * 100 : 0, s.disque_total ? Math.round((1 - s.disque_libre / s.disque_total) * 100) + ' %' : 'non fourni');
    var info = function (k, v) { var e = $('[data-info="' + k + '"]'); if (e) e.textContent = v; };
    info('https', s.https ? 'Active, cadenas affiché' : (s.https === false ? 'À vérifier' : '–'));
    info('wordpress', s.wordpress || '–'); info('php', s.php || '–');
    info('pages', d.contenu ? nf(d.contenu.pages) : '–'); info('articles', d.contenu ? nf(d.contenu.articles) : '–');
    if (b) info('produits', nf(b.produits || 0));
  }
  var vide = { aujourdhui: { heures: new Array(24).fill(0) }, jours: Array.from({ length: 30 }, function () { return { vues: 0, visiteurs: 0 }; }), serveur: {} };
  if (!actif) {
    var ex = { aujourdhui: { actifs: 3, visiteurs: 48, vues: 131, heures: [0,0,0,0,0,0,1,2,4,6,7,5,6,4,5,6,8,9,7,5,3,2,1,0] }, jours: Array.from({ length: 30 }, function (_, i) { var v = 20 + Math.round(18 * Math.sin(i / 3) + i); return { visiteurs: v, vues: v * 3 }; }), appareils: { mobile: 64, ordinateur: 30, tablette: 6 }, sources: { Google: 52, 'Accès direct': 27, 'Réseaux sociaux': 15, 'Autres sites': 6 }, pages: { '/': 60, '/contact/': 22, '/tarifs/': 17 }, serveur: { memoire: 64 * 1048576, memoire_max: 256 * 1048576, charge: [0.6], disque_libre: 6e9, disque_total: 10e9, temps_reponse: 0.32, https: true, php: '8.3', wordpress: '7.1' }, contenu: { pages: 6, articles: 4 }, boutique: { commandes_aujourdhui: 2, ventes_30j: 845, produits: 20 } };
    afficher(ex); return;
  }
  afficher(vide);
  var msg = $('[data-live-msg]'), maj = $('[data-live-maj]'), dernier = 0, minuteur = null;
  var MSG = { non_relie: 'Votre site n’est pas encore relié à votre espace. Alex s’en occupe : les chiffres apparaîtront ici dès que c’est fait.', connecteur_ancien: 'L’extension de votre site doit être mise à jour pour afficher les chiffres. Alex s’en occupe.', injoignable: 'Votre site ne répond pas pour le moment. Nouvel essai dans 30 secondes.' };
  function charger() {
    if (document.hidden) return;
    var f = new FormData(); f.append('action', 'aled08e_stats'); f.append('_n', box.getAttribute('data-nonce'));
    fetch(box.getAttribute('data-ajax'), { method: 'POST', body: f, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (r) {
      var d = r && r.data ? r.data : {};
      if (!r.success || d.etat !== 'ok') { msg.textContent = MSG[d.etat] || 'Les chiffres ne sont pas disponibles pour le moment.'; msg.hidden = false; return; }
      msg.hidden = true; dernier = Date.now(); afficher(d);
    }).catch(function () { msg.textContent = MSG.injoignable; msg.hidden = false; });
  }
  setInterval(function () { maj.textContent = dernier ? 'Mis à jour il y a ' + Math.round((Date.now() - dernier) / 1000) + ' s' : 'Connexion à votre site…'; }, 1000);
  charger(); minuteur = setInterval(charger, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) charger(); });
})();
</script>
    <?php
    return ob_get_clean();
}
