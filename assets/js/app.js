/*!
 * Flore & Chenilles — interactions du site
 * Boutique, sélection, compositeur « Votre bouquet à vous », cartes de vœux,
 * envoi des messages par e-mail, animations.
 * Le contenu (produits, prix, couleurs…) se modifie dans assets/js/data.js.
 */
(function () {
  'use strict';

  const S = window.SITE || {};
  const FC = window.FC_FLOWERS;
  if (!FC) return;
  const PREVIEW = !!window.FC_PREVIEW; // version d'aperçu (page claude.ai)
  S.products = S.products || [];
  S.colors = S.colors || {};
  S.flowers = S.flowers || {};
  FC.register({ colors: S.colors, pots: S.pots });

  /* ------------------------------------------------------------------ *
   * Utilitaires
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt0 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const price = (n) => (Number.isInteger(n) ? fmt0 : fmt2).format(n);
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const smooth = reduceMotion ? 'auto' : 'smooth';
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible : tant pis */ }
    }
  };
  const NB = ' ';
  const BRAND = (S.brand && S.brand.name) || 'Flore & Chenilles';
  const IG = (S.brand && S.brand.instagram) || 'flore_et_chenilles';
  const IG_URL = 'https://www.instagram.com/' + IG + '/';
  const IG_DM = 'https://ig.me/m/' + IG;
  const CITY = (S.brand && S.brand.city) || 'Signy-l’Abbaye';
  const C = S.contact || {};
  const FB = String(C.facebook || '').trim();
  const EMAIL = String(C.email || '').trim();
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
  const MAIL_OK = isEmail(EMAIL); // une vraie adresse (et non un alias FormSubmit)
  const ENDPOINT = String(C.formEndpoint || '').trim();
  // Les messages partent par e-mail via FormSubmit (ou un autre service si formEndpoint est rempli).
  const SEND_URL = ENDPOINT || (EMAIL ? 'https://formsubmit.co/ajax/' + EMAIL : '');
  const UNIT = S.unitPrice != null && !isNaN(+S.unitPrice) ? +S.unitPrice : 8;
  const PACK = S.packaging || 'Pochette transparente et nœud';
  const JAR = Object.assign({ price: 5, label: 'Dans un bocal transparent' }, S.jar || {});
  const CARD = Object.assign({ maxLength: 160, suggestions: [] }, S.card || {});
  const ZONES = ((S.delivery && S.delivery.zones) || []).filter((z) => z && z.upToKm > 0 && z.price != null).sort((a, b) => a.upToKm - b.upToKm);
  /* Offre de lancement : active entre promo.from et promo.until (inclus). */
  const PROMO = (() => {
    const pr = S.promo || {};
    const pct = +pr.percent || 0;
    if (!(pct > 0 && pct < 100)) return null;
    const day = (iso, end) => {
      const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? new Date(+m[1], +m[2] - 1, +m[3], end ? 23 : 0, end ? 59 : 0, end ? 59 : 0) : null;
    };
    const from = day(pr.from), until = day(pr.until, true), now = new Date();
    if ((from && now < from) || (until && now > until)) return null;
    return { pct, label: pr.label || 'Offre de lancement', until };
  })();
  const round2 = (n) => Math.round(n * 100) / 100;
  const withPromo = (v) => (PROMO && v != null ? round2((v * (100 - PROMO.pct)) / 100) : v);
  const pctText = () => (PROMO ? `−${PROMO.pct}${NB}%` : '');
  const untilText = () => (PROMO && PROMO.until ? PROMO.until.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const colorName = (k) => (S.colors[k] ? S.colors[k].name : k);
  const flowerInfo = (t) => S.flowers[t] || { name: t, plural: t };
  const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
  const withPrice = (txt) => String(txt || '').replace(/\{prix\}/g, price(UNIT)).replace(/\{bocal\}/g, price(JAR.price));
  const zonesText = () => ZONES.map((z) => `${price(z.price)} jusqu’à ${z.upToKm}${NB}km`).join(', ');
  const deliveryText = () => ZONES.length
    ? `Livraison${NB}: ${zonesText()} autour de ${CITY}. Au-delà, on en parle ensemble.`
    : `Livraison autour de ${CITY}${NB}: on en parle ensemble.`;
  const frDate = (iso) => {
    const p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  };

  /* Exécute une partie du site sans qu'une erreur empêche le reste de s'afficher. */
  function safe(label, fn) {
    try { fn(); } catch (err) { if (window.console) console.error('[Flore & Chenilles] ' + label, err); }
  }
  const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };

  /* ---------- Notification ---------- */
  const toastEl = $('.toast');
  let toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2900);
  }

  /* ---------- Copier du texte (promesse : true si la copie a réussi) ---------- */
  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }
  function copyText(text) {
    const legacy = legacyCopy(text);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => legacy);
    }
    return Promise.resolve(legacy);
  }

  /* ---------- Verrouillage du défilement ---------- */
  const locks = new Set();
  function lockScroll(on, key) {
    if (on) locks.add(key); else locks.delete(key);
    const lock = locks.size > 0;
    if (lock && !document.body.classList.contains('no-scroll')) {
      document.documentElement.style.setProperty('--sbw', window.innerWidth - document.documentElement.clientWidth + 'px');
    }
    document.body.classList.toggle('no-scroll', lock);
  }

  /* ------------------------------------------------------------------ *
   * Liens, coordonnées et textes calculés
   * ------------------------------------------------------------------ */
  $$('[data-ig]').forEach((a) => { a.href = IG_URL; });
  $$('[data-ig-dm]').forEach((a) => { a.href = IG_DM; });
  $$('[data-ig-handle]').forEach((el) => { el.textContent = '@' + IG; });
  if (MAIL_OK && C.showEmail !== false) {
    $$('[data-email]').forEach((a) => { a.href = 'mailto:' + EMAIL; a.textContent = EMAIL; });
    $$('[data-email-row]').forEach((el) => { el.hidden = false; });
  }
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  if (FB) {
    $$('[data-fb]').forEach((a) => { a.href = FB; a.hidden = false; });
    $$('[data-fb-row]').forEach((el) => { el.hidden = false; });
  }
  $$('[data-city]').forEach((el) => { el.textContent = CITY; });
  $$('[data-delivery]').forEach((el) => { el.textContent = deliveryText(); });
  $$('[data-unit-price]').forEach((el) => { el.textContent = price(UNIT); });
  $$('[data-pack]').forEach((el) => { el.textContent = PACK; });

  /* ------------------------------------------------------------------ *
   * En-tête, chenille de progression, navigation
   * ------------------------------------------------------------------ */
  const header = $('.site-header');
  const crawl = $('.crawl');
  const bug = $('[data-caterpillar]');
  if (bug) bug.innerHTML = FC.caterpillar();
  let lastY = window.scrollY, ticking = false, crawlT = 0;
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    crawl.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, y / max)).toFixed(4) : '0');
    if (Math.abs(y - lastY) > 1) {
      crawl.classList.toggle('is-back', y < lastY);
      crawl.classList.add('is-crawling');
      clearTimeout(crawlT);
      crawlT = setTimeout(() => crawl.classList.remove('is-crawling'), 220);
    }
    lastY = y;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = '#' + e.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['#accueil'].concat(navLinks.map((a) => a.getAttribute('href'))).forEach((id) => {
      const s = $(id);
      if (s) spy.observe(s);
    });
  }

  const burger = $('.burger');
  const mmenu = $('#mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    mmenu.classList.toggle('is-open', open);
    mmenu.setAttribute('aria-hidden', String(!open));
    lockScroll(open, 'menu');
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', mmenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 980 && mmenu.classList.contains('is-open')) setMenu(false);
  });

  /* ------------------------------------------------------------------ *
   * Apparitions au défilement
   * ------------------------------------------------------------------ */
  let io = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  }
  const reveal = (root) => $$('.reveal:not(.is-in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  /* ------------------------------------------------------------------ *
   * Créations : photos, prix, illustrations
   * ------------------------------------------------------------------ */
  /* 'g087' → photos de la galerie (vignette + grande image) ; sinon un chemin d'image. */
  function pic(ref) {
    if (!ref) return null;
    if (typeof ref === 'object') {
      const s = ref.s || ref.image;
      return s ? { s, l: ref.l || ref.large || s } : null;
    }
    const r = String(ref).trim();
    if (/^g\d+$/i.test(r)) return { s: 'assets/gallery/' + r + '-s.webp', l: 'assets/gallery/' + r + '.webp' };
    return { s: r, l: r };
  }
  S.products.forEach((p) => {
    if (p.photo && !p.image) {
      const g = pic(p.photo);
      if (g) { p.image = g.s; p.large = g.l; }
    }
    p.pics = (p.image ? [{ s: p.image, l: p.large || p.image }] : []).concat((p.more || []).map(pic).filter(Boolean));
    if (p.options && Array.isArray(p.options.choices)) {
      p.options.choices.forEach((c) => {
        const g = pic(c.image);
        if (g) { c.image = g.s; c.large = g.l; }
      });
    } else {
      delete p.options;
    }
  });
  const findProduct = (id) => S.products.find((x) => x.id === id);
  const catOf = (id) => (S.categories || []).find((c) => c.id === id) || {};
  const blurbOf = (p) => p.desc || catOf(p.category).blurb || '';

  function resolveBouquet(p, idx) {
    const choices = (p.options && p.options.choices) || [];
    const ch = choices[idx || 0];
    const main = (ch && ch.color) || (choices.find((c) => c.color) || {}).color || 'rose';
    return Object.assign({}, p.bouquet, {
      flowers: (p.bouquet.flowers || []).map((f) => [f[0], f[1] === '$main' ? main : f[1]])
    });
  }
  const GRID_SIZES = '(max-width: 899px) 48vw, 400px';
  const ARTS = { mystery: FC.mystery };
  /**
   * Illustration d'une création : photo du choix (idx), photo n° o.pic, ou dessin.
   * o.large : grande image (fenêtre) ; o.sizes : taille d'affichage pour le navigateur.
   */
  function productArt(p, idx, o) {
    o = o || {};
    const choice = idx == null ? null : p.options && p.options.choices[idx || 0];
    if (choice && choice.image) {
      const src = o.large ? choice.large || choice.image : choice.image;
      return `<img src="${esc(src)}" alt="${esc(p.name + ' : ' + choice.name)}"${o.large ? '' : ' loading="lazy"'} decoding="async">`;
    }
    if (p.art && ARTS[p.art]) return ARTS[p.art]();
    const ph = p.pics && (p.pics[o.pic || 0] || p.pics[0]);
    if (ph) {
      if (o.large) return `<img src="${esc(ph.l)}" alt="${esc(p.name)}" decoding="async">`;
      const set = ph.l && ph.l !== ph.s ? ` srcset="${esc(ph.s)} 480w, ${esc(ph.l)} 960w" sizes="${esc(o.sizes || GRID_SIZES)}"` : '';
      return `<img src="${esc(ph.s)}"${set} alt="${esc(p.name)}" loading="lazy" decoding="async">`;
    }
    if (p.giftcard || !p.bouquet) return FC.giftcard();
    return FC.bouquet(resolveBouquet(p, idx), { fit: true, aspect: o.aspect || 0.9, pad: o.pad != null ? o.pad : 18, label: p.name });
  }
  function productPrice(p, idx) {
    const ch = p.options && p.options.choices[idx || 0];
    if (ch && ch.price != null) return ch.price;
    if (p.price != null) return p.price;
    if (p.count > 0) return p.count * UNIT + (p.jar ? JAR.price : 0);
    return p.category === 'unite' && !p.quote ? UNIT : null;
  }
  /* Les fleurs à l'unité peuvent être glissées dans un bocal transparent. */
  const jarOption = (p) => p.category === 'unite' && !p.jar && JAR.price != null;
  function priceText(p, idx) {
    const v = productPrice(p, idx);
    if (v == null) return p.quote ? 'Sur devis' : 'Sur demande';
    return (p.priceFrom ? 'dès ' : '') + price(v);
  }
  /** Prix affiché, barré et remisé pendant l'offre de lancement. */
  function priceHTML(p, idx, add) {
    let v = productPrice(p, idx);
    if (v == null) return esc(priceText(p, idx));
    v += add || 0;
    const from = p.priceFrom ? 'dès ' : '';
    if (!PROMO) return esc(from + price(v));
    return `<s>${price(v)}</s> <ins>${from}${price(withPromo(v))}</ins>`;
  }

  /* ------------------------------------------------------------------ *
   * Cartes de vœux (offertes avec chaque création)
   * ------------------------------------------------------------------ */
  const cleanCard = (c) => {
    c = c || {};
    const t = (v, n) => String(v || '').trim().slice(0, n);
    return { to: t(c.to, 40), msg: t(c.msg, CARD.maxLength), from: t(c.from, 40) };
  };
  const cardEmpty = (c) => { c = cleanCard(c); return !c.to && !c.msg && !c.from; };
  function cardLine(c) {
    c = cleanCard(c);
    const parts = [];
    if (c.to) parts.push('Pour ' + c.to);
    if (c.msg) parts.push(`«${NB}${c.msg}${NB}»`);
    if (c.from) parts.push('de la part de ' + c.from);
    return parts.join(' — ');
  }
  /** Champs d'une carte de vœux (pour, message, de la part de) + idées de messages. */
  function cardFieldsHTML(id, card) {
    const c = cleanCard(card);
    const max = CARD.maxLength;
    return '<div class="card-fields" data-card-fields>' +
      '<div class="field-row">' +
      `<label class="field"><span>Pour <small>(facultatif)</small></span><input id="${id}-to" type="text" data-card="to" maxlength="40" placeholder="Léa" autocomplete="off" value="${esc(c.to)}"></label>` +
      `<label class="field"><span>De la part de <small>(facultatif)</small></span><input id="${id}-from" type="text" data-card="from" maxlength="40" placeholder="Marie" autocomplete="off" value="${esc(c.from)}"></label>` +
      '</div>' +
      `<label class="field field--counter"><span>Votre message</span><textarea id="${id}-msg" data-card="msg" rows="2" maxlength="${max}" placeholder="Joyeux anniversaire ma belle…">${esc(c.msg)}</textarea><span class="counter" data-card-count>${c.msg.length}/${max}</span></label>` +
      (CARD.suggestions.length
        ? `<div class="card-ideas" role="group" aria-label="Idées de messages">${CARD.suggestions.map((t) => `<button type="button" class="card-idea" data-card-idea="${esc(t)}">${esc(t)}</button>`).join('')}</div>`
        : '') +
      '</div>';
  }
  function readCard(fields) {
    const g = (k) => { const el = $(`[data-card="${k}"]`, fields); return el ? el.value : ''; };
    return cleanCard({ to: g('to'), msg: g('msg'), from: g('from') });
  }
  /** Écoute les champs de carte d'un conteneur ; onChange(fields, carte) à chaque saisie. */
  function bindCard(root, onChange) {
    root.addEventListener('input', (e) => {
      const el = e.target;
      if (!el.matches || !el.matches('[data-card]')) return;
      const fields = el.closest('[data-card-fields]');
      if (el.dataset.card === 'msg') {
        const n = $('[data-card-count]', fields);
        if (n) n.textContent = el.value.length + '/' + el.maxLength;
      }
      onChange(fields, readCard(fields));
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-card-idea]');
      if (!b) return;
      const ta = $('[data-card="msg"]', b.closest('[data-card-fields]'));
      if (!ta) return;
      ta.value = b.dataset.cardIdea.slice(0, ta.maxLength);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.focus();
    });
  }

  /* ------------------------------------------------------------------ *
   * Fenêtre modale
   * ------------------------------------------------------------------ */
  const modal = $('#modal');
  const modalContent = $('[data-modal-content]', modal);
  let modalReturn = null;
  function openModal(html, bind, opts) {
    opts = opts || {};
    if (!modal.classList.contains('is-open')) modalReturn = document.activeElement;
    modalContent.innerHTML = html;
    modal.classList.toggle('modal--narrow', !!opts.narrow);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true, 'modal');
    $('.modal-panel', modal).scrollTop = 0;
    if (bind) bind(modalContent.firstElementChild);
    setTimeout(() => {
      const f = (opts.focus && $(opts.focus, modalContent)) || $('[autofocus]', modalContent) || $('.modal-close', modal);
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false, 'modal');
    navIds = [];
    if (modalReturn && document.contains(modalReturn) && modalReturn.focus) modalReturn.focus({ preventScroll: true });
  }
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });

  /* ------------------------------------------------------------------ *
   * Ma sélection
   * ------------------------------------------------------------------ */
  let cart = store.get('fc-cart-v2', []);
  if (!Array.isArray(cart)) cart = [];
  const drawer = $('#cart');
  const cartItemsEl = $('[data-cart-items]');
  const cartFoot = $('[data-cart-foot]');
  const cartTotalEl = $('[data-cart-total]');
  const cartCountEl = $('[data-cart-count]');
  const cartBtn = $('.cart-btn');
  const cartPromoEl = $('[data-cart-promo]');
  const cartSums = () => cart.reduce((acc, it) => {
    if (it.price == null) acc.ask += it.qty; else acc.sum += it.price * it.qty;
    return acc;
  }, { sum: 0, ask: 0 });
  const ucfirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const BF_COLS = ['#C8A0E2', '#F5B07D', '#F4ADC5', '#A8D3F0', '#8ED6D0', '#F7D25E', '#B3B0EC'];
  /** Montants de la sélection : sous-total, remise de lancement, livraison (opt), total. */
  function cartTotals(opt) {
    const t = cartSums();
    const disc = PROMO ? round2((t.sum * PROMO.pct) / 100) : 0;
    const fee = (opt && opt.fee) || 0;
    return { sum: t.sum, ask: t.ask, disc, fee, total: round2(t.sum - disc + fee) };
  }
  /** Total de la sélection, avec la livraison choisie (opt) si besoin. */
  function totalText(opt) {
    const c = cartTotals(opt);
    const extra = [];
    if (c.ask) extra.push('sur devis');
    if (opt && opt.ask) extra.push('livraison à voir ensemble');
    if (!extra.length) return price(c.total);
    return ucfirst((c.total ? price(c.total) + ' + ' : '') + extra.join(' + '));
  }
  /** Ligne « Offre de lancement » : montant déduit, ou remise à appliquer au devis. */
  function promoLine() {
    if (!PROMO) return null;
    const c = cartTotals();
    if (!c.disc && !c.ask) return null;
    return { label: `${PROMO.label} (${pctText()})`, value: c.disc ? '−' + price(c.disc) : 'sur le devis', note: c.disc && c.ask ? 'aussi sur les créations sur demande' : '' };
  }
  const lineText = (it) => (it.price == null ? 'Sur demande' : price(it.price * it.qty));
  const cartQty = () => cart.reduce((s, it) => s + it.qty, 0);

  function saveCart() { store.set('fc-cart-v2', cart); }
  function addToCart(item) {
    const ex = cart.find((c) => c.key === item.key);
    if (ex) ex.qty = Math.min(99, ex.qty + item.qty);
    else cart.push(item);
    saveCart();
    renderCart();
    cartBtn.classList.remove('bump');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('bump');
  }
  /** Un petit papillon vole du bouton jusqu'au panier. */
  function flyToCart(from) {
    if (reduceMotion || !from || !from.getBoundingClientRect || !cartBtn || !document.body.animate) return;
    const a = from.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const el = document.createElement('div');
    el.className = 'flyer';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = FC.butterfly(BF_COLS[Math.floor(Math.random() * BF_COLS.length)]);
    document.body.appendChild(el);
    const x0 = a.left + a.width / 2 - 19, y0 = a.top + a.height / 2 - 17;
    const x1 = b.left + b.width / 2 - 19, y1 = b.top + b.height / 2 - 17;
    const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 140, my = Math.min(y0, y1) - 90 - Math.random() * 60;
    const anim = el.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.4)`, opacity: 0 },
      { transform: `translate(${(x0 + mx) / 2}px, ${(y0 + my) / 2}px) scale(1) rotate(-12deg)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${mx}px, ${my}px) scale(1) rotate(10deg)`, opacity: 1, offset: 0.62 },
      { transform: `translate(${x1}px, ${y1}px) scale(.4) rotate(0deg)`, opacity: 0.3 }
    ], { duration: 1150, easing: 'cubic-bezier(.45,0,.25,1)' });
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  }
  function addProduct(p, idx, qty, extra) {
    extra = extra || {};
    const ch = p.options && p.options.choices[idx || 0];
    const col = extra.color && S.colors[extra.color] ? extra.color : '';
    const card = cardEmpty(extra.card) ? null : cleanCard(extra.card);
    let option = ch ? p.options.label + NB + ': ' + ch.name.charAt(0).toLowerCase() + ch.name.slice(1) : '';
    if (p.options && p.options.colors) option += `, couleur${NB}: ` + (col ? colorName(col).toLowerCase() : 'à préciser');
    const jar = !!extra.jar && jarOption(p);
    const notes = [option, jar ? `${JAR.label.toLowerCase()} (+${price(JAR.price)})` : '', p.jar ? 'en bocal transparent' : '', p.gift ? p.gift.toLowerCase() : ''].filter(Boolean);
    option = notes.join(' · ');
    option = option.charAt(0).toUpperCase() + option.slice(1);
    const base = productPrice(p, idx);
    addToCart({
      key: [p.id, ch ? ch.name : '', col, jar ? 'bocal' : '', card ? JSON.stringify(card) : ''].join('|'),
      kind: 'product',
      id: p.id,
      choice: idx || 0,
      color: col,
      name: p.name,
      option,
      price: base == null ? null : base + (jar ? JAR.price : 0),
      qty: qty || 1,
      card
    });
    toast(`«${NB}${p.name}${NB}» est dans votre sélection`);
  }
  function itemThumb(it) {
    if (it.kind === 'custom' && it.bouquet) return { bg: '#F8E4E9', html: FC.bouquet(it.bouquet, { fit: true, aspect: 1, pad: 10, label: it.name }) };
    const p = findProduct(it.id);
    if (!p) return { bg: '#F8E4E9', html: '' };
    return { bg: p.bg || '#F8E4E9', html: productArt(p, p.options ? it.choice || 0 : null, { aspect: 1, pad: 10, sizes: '80px' }) };
  }
  function renderCart(focusSel) {
    const n = cartQty();
    cartCountEl.textContent = n;
    cartCountEl.classList.toggle('has', n > 0);
    cartBtn.setAttribute('aria-label', n ? `Ouvrir ma sélection (${plural(n, 'création', 'créations')})` : 'Ouvrir ma sélection');
    if (!cart.length) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">' +
        `<div class="cart-empty-art">${FC.bouquet({ container: 'none', flowers: [['tulipe', 'rose']] }, { fit: true, aspect: 0.9, pad: 10, label: 'Une tulipe toute seule' })}</div>` +
        '<h3>Votre sélection est encore vide</h3>' +
        `<p>Cette petite tulipe se sent bien seule… Offrez-lui un peu de compagnie${NB}!</p>` +
        '<a class="btn btn-primary" href="#boutique" data-close>Voir mes créations</a>' +
        '</div>';
      cartFoot.hidden = true;
      return;
    }
    cartFoot.hidden = false;
    cartItemsEl.innerHTML = cart.map((it, i) => {
      const th = itemThumb(it);
      const card = cardEmpty(it.card)
        ? '<div class="ci-card is-empty"><svg aria-hidden="true"><use href="#i-mail"/></svg>Carte de vœux offerte</div>'
        : `<div class="ci-card"><svg aria-hidden="true"><use href="#i-mail"/></svg><span>${esc(cardLine(it.card))}</span></div>`;
      return '<div class="cart-item">' +
        `<div class="ci-thumb" style="--bg:${esc(th.bg)}">${th.html}</div>` +
        `<div><div class="ci-name">${esc(it.name)}</div>${it.option ? `<div class="ci-opt">${esc(it.option)}</div>` : ''}${card}` +
        `<div class="qty" role="group" aria-label="Quantité"><button type="button" data-cq="-1" data-i="${i}" aria-label="Retirer un exemplaire">−</button><output aria-live="polite">${it.qty}</output><button type="button" data-cq="1" data-i="${i}" aria-label="Ajouter un exemplaire">+</button></div></div>` +
        `<div class="ci-side"><span class="ci-price${it.price == null ? ' is-ask' : ''}">${lineText(it)}</span><button type="button" class="ci-remove" data-del="${i}">Retirer</button></div>` +
        '</div>';
    }).join('');
    cartTotalEl.textContent = totalText();
    const pl = promoLine();
    if (cartPromoEl) {
      cartPromoEl.hidden = !pl;
      cartPromoEl.innerHTML = pl ? `<span>${esc(pl.label)}</span><span>${esc(pl.value)}</span>` : '';
    }
    if (focusSel) {
      const f = $(focusSel, cartItemsEl);
      if (f) f.focus({ preventScroll: true });
    }
  }
  cartItemsEl.addEventListener('click', (e) => {
    const q = e.target.closest('[data-cq]');
    if (q) {
      const i = +q.dataset.i, it = cart[i];
      if (!it) return;
      it.qty = Math.min(99, it.qty + +q.dataset.cq);
      if (it.qty <= 0) { cart.splice(i, 1); saveCart(); renderCart(); return; }
      saveCart();
      renderCart(`[data-cq="${q.dataset.cq}"][data-i="${i}"]`);
      return;
    }
    const d = e.target.closest('[data-del]');
    if (d) {
      cart.splice(+d.dataset.del, 1);
      saveCart();
      renderCart();
      toast('Création retirée de votre sélection');
    }
  });

  let drawerReturn = null;
  function openCart() {
    drawerReturn = document.activeElement;
    renderCart();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    lockScroll(true, 'cart');
    setTimeout(() => {
      const b = $('.drawer-head [data-close]', drawer);
      if (b) b.focus({ preventScroll: true });
    }, 80);
  }
  function closeCart() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    lockScroll(false, 'cart');
    if (drawerReturn && drawerReturn.focus) drawerReturn.focus({ preventScroll: true });
  }
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeCart();
  });
  $('[data-checkout]').addEventListener('click', () => {
    closeCart();
    setTimeout(openCheckout, 260);
  });

  /* ------------------------------------------------------------------ *
   * Envoi des messages par e-mail
   * ------------------------------------------------------------------ */
  function validate(form) {
    let first = null;
    $$('input, select, textarea', form).forEach((el) => {
      if (el.disabled || el.name === '_honey') return;
      const v = String(el.value || '').trim();
      const missing = el.required && !v;
      const badMail = !missing && !!v && el.type === 'email' && !isEmail(v);
      const f = el.closest('.field');
      if (f) {
        f.classList.toggle('is-invalid', missing || badMail);
        f.classList.toggle('is-invalid-email', badMail);
      }
      if ((missing || badMail) && !first) first = el;
    });
    if (first) {
      first.focus();
      toast(first.type === 'email' && String(first.value || '').trim() ? 'Votre adresse e-mail semble incomplète' : 'Il manque juste une petite information');
      return false;
    }
    return true;
  }
  document.addEventListener('input', (e) => {
    const f = e.target.closest && e.target.closest('.field.is-invalid');
    if (f && String(e.target.value || '').trim()) f.classList.remove('is-invalid', 'is-invalid-email');
  });

  /** Envoie le message (FormSubmit ou autre service). Résultat : { ok, reason }. */
  async function sendMail(d, msg) {
    if (!SEND_URL) return { ok: false, reason: 'none' };
    const body = {
      _subject: msg.subject,
      _template: 'table',
      _captcha: 'false',
      _replyto: d.email,
      email: d.email,
      Nom: d.name,
      'Téléphone': (d.phone || '').trim() || '—',
      Message: msg.body
    };
    if (!ENDPOINT) body._autoresponse = `Bonjour ${d.name}, merci pour votre message ! Je l’ai bien reçu et je vous réponds très vite. — ${BRAND}`;
    try {
      const r = await fetch(SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });
      let j = null;
      try { j = await r.json(); } catch (e) { j = null; }
      const flag = !j ? true : j.success != null ? String(j.success) === 'true' : j.ok != null ? !!j.ok : true;
      if (r.ok && flag) return { ok: true };
      return { ok: false, reason: j && /activ/i.test(String(j.message || '')) ? 'activation' : 'error' };
    } catch (e) {
      return { ok: false, reason: 'network' };
    }
  }
  const mailtoHref = (msg) => 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.body);
  const sendButton = (label) => `<button class="btn btn-primary" type="submit" data-send><svg><use href="#i-mail"/></svg> <span>${esc(label)}</span></button>`;
  const honeypot = '<label class="hp" aria-hidden="true">Ne pas remplir<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label>';

  /* Message d'erreur sous le formulaire : réessayer, écrire par e-mail ou copier le message. */
  function showSendAlert(form, reason, msg) {
    const box = $('[data-send-alert]', form);
    if (!box) return;
    let text;
    if (reason === 'none') text = `<strong>L’envoi par e-mail n’est pas encore activé sur le site.</strong> Copiez votre message et envoyez-le-moi en message privé${NB}: je vous réponds très vite.`;
    else if (reason === 'activation') text = `<strong>Le formulaire est en cours d’activation.</strong> Réessayez un peu plus tard, ou envoyez-moi votre message autrement${NB}:`;
    else text = `<strong>Oups, votre message n’est pas parti.</strong> Vérifiez votre connexion puis réessayez, ou envoyez-le-moi autrement${NB}:`;
    box.innerHTML = `<p>${text}</p><div class="send-alert-actions">` +
      (reason !== 'none' ? '<button class="btn btn-primary btn-sm" type="submit">Réessayer</button>' : '') +
      (MAIL_OK ? `<a class="btn btn-ghost btn-sm" href="${esc(mailtoHref(msg))}"><svg><use href="#i-mail"/></svg> Écrire par e-mail</a>` : '') +
      (reason === 'none' ? `<a class="btn btn-ghost btn-sm" href="${IG_DM}" target="_blank" rel="noopener"><svg><use href="#i-instagram"/></svg> Message privé</a>` : '') +
      '<button class="btn btn-ghost btn-sm" type="button" data-copy-msg>Copier mon message</button>' +
      '</div>';
    box.hidden = false;
    $('[data-copy-msg]', box).addEventListener('click', (e) => {
      copyText(msg.body).then((ok) => {
        e.target.textContent = ok ? 'Message copié' : 'Copie impossible';
      });
    });
    box.scrollIntoView({ behavior: smooth, block: 'nearest' });
  }

  function bindSend(form, compose, opts) {
    opts = opts || {};
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.dataset.busy) return;
      const alertBox = $('[data-send-alert]', form);
      if (alertBox) { alertBox.hidden = true; alertBox.innerHTML = ''; }
      if (!validate(form)) return;
      const data = {};
      new FormData(form).forEach((v, k) => { data[k] = String(v); });
      if (data._honey) { showDone('sent', null, opts); return; } // robot : on ne fait rien
      const msg = compose(data);
      if (PREVIEW) { showDone('preview', msg, opts); return; }
      if (!SEND_URL) { showSendAlert(form, 'none', msg); return; }
      const btn = $('[data-send]', form);
      const label = btn ? btn.innerHTML : '';
      form.dataset.busy = '1';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> <span>Envoi en cours…</span>'; }
      const res = await sendMail(data, msg);
      delete form.dataset.busy;
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      if (res.ok) {
        if (opts.onSent) opts.onSent();
        showDone('sent', msg, Object.assign({ email: data.email }, opts));
      } else {
        showSendAlert(form, res.reason, msg);
      }
    });
  }

  function showDone(kind, msg, opts) {
    opts = opts || {};
    clearTimeout(toastT);
    if (toastEl) toastEl.classList.remove('is-on');
    const art = FC.bouquet({ flowers: [['lys', 'mauve'], ['pavot', 'lavande'], ['gerbera', 'blanc'], ['rose', 'rose'], ['tulipe', 'jaune'], ['eucalyptus']] }, { fit: true, aspect: 0.94, pad: 10, label: 'Un bouquet pour vous remercier' });
    const preview = kind === 'preview';
    const title = preview ? `Votre message est prêt${NB}!` : `Merci, c’est envoyé${NB}!`;
    let text;
    if (preview) text = `Ceci est un aperçu du site${NB}: une fois en ligne, ce message partira directement par e-mail à ${BRAND}.`;
    else if (opts.order) text = `Votre demande m’est bien parvenue. Je vous réponds très vite${opts.email ? ' à ' + opts.email : ''} pour confirmer le prix, la date et la remise.`;
    else text = `Votre message m’est bien parvenu. Je vous réponds très vite${opts.email ? ' à ' + opts.email : ''}.`;
    const html = '<div class="dialog-body done">' +
      `<div class="done-art">${art}</div>` +
      `<h2 id="modal-title">${title}</h2>` +
      `<p>${esc(text)}</p>` +
      (preview && msg ? `<textarea rows="7" readonly aria-label="Votre message">${esc(msg.body)}</textarea>` : '') +
      '<div class="form-actions"><button class="btn btn-primary" type="button" data-close>Fermer</button></div></div>';
    openModal(html, null, { narrow: true });
  }

  /* ---------- Commande ---------- */
  function deliveryOptions() {
    const list = [{ value: 'retrait', label: `Retrait à l’atelier, à ${CITY} (gratuit)`, fee: 0 }];
    let from = 0;
    ZONES.forEach((z, i) => {
      const range = from ? `de ${from} à ${z.upToKm}${NB}km` : `jusqu’à ${z.upToKm}${NB}km`;
      list.push({ value: 'zone' + i, label: `Livraison ${range} (${price(z.price)})`, feeLabel: 'Livraison ' + range, fee: z.price, delivery: true });
      from = z.upToKm;
    });
    if (from) list.push({ value: 'loin', label: `Livraison à plus de ${from}${NB}km (à voir ensemble)`, fee: 0, delivery: true, ask: true });
    else list.push({ value: 'livraison', label: 'Livraison (à voir ensemble)', fee: 0, delivery: true, ask: true });
    list.push({ value: 'a-definir', label: 'Je ne sais pas encore', fee: 0 });
    return list;
  }
  const deliveryOption = (v) => deliveryOptions().find((o) => o.value === v) || deliveryOptions()[0];
  function composeOrder(d) {
    const opt = deliveryOption(d.delivery);
    const lines = [`Bonjour ${BRAND}${NB}!`, '', `J’aimerais commander${NB}:`, ''];
    cart.forEach((it) => {
      lines.push(`• ${it.name}${it.qty > 1 ? ' × ' + it.qty : ''} — ${lineText(it)}`);
      if (it.option) lines.push('   ' + it.option);
      lines.push(`   Carte de vœux${NB}: ` + (cardEmpty(it.card) ? 'sans message' : cardLine(it.card)));
    });
    const pl = promoLine();
    if (pl) lines.push(`• ${pl.label} — ${pl.value}${pl.note ? ' (' + pl.note + ')' : ''}`);
    if (opt.fee) lines.push(`• ${opt.feeLabel} — ${price(opt.fee)}`);
    lines.push('', `Total${NB}: ${totalText(opt)}`, `Emballage${NB}: ${PACK.toLowerCase()}`, '', `Retrait ou livraison${NB}: ${opt.label}`);
    if (opt.delivery && d.address && d.address.trim()) lines.push(`Adresse de livraison${NB}: ${d.address.trim()}`);
    if (d.date) lines.push(`Pour le${NB}: ${frDate(d.date)}`);
    lines.push(`Nom${NB}: ${d.name}`, `E-mail${NB}: ${d.email}`);
    if (d.phone && d.phone.trim()) lines.push(`Téléphone${NB}: ${d.phone.trim()}`);
    if (d.note && d.note.trim()) lines.push('', d.note.trim());
    lines.push('', 'Merci beaucoup !');
    return { subject: `Nouvelle commande — ${d.name}`, body: lines.join('\n') };
  }
  function recapHTML(opt) {
    const pl = promoLine();
    return `<ul>${cart.map((it) => `<li><span>${esc(it.name)}${it.qty > 1 ? ' × ' + it.qty : ''}</span><span>${lineText(it)}</span></li>`).join('')}` +
      (pl ? `<li class="is-promo"><span>${esc(pl.label)}</span><span>${esc(pl.value)}</span></li>` : '') +
      (opt && opt.fee ? `<li><span>${esc(opt.feeLabel)}</span><span>${price(opt.fee)}</span></li>` : '') +
      `<li class="is-free"><span>Emballage (${esc(PACK.toLowerCase())}) et carte${cart.length > 1 ? 's' : ''} de vœux</span><span>Offerts</span></li>` +
      `</ul><div class="tot"><span>Total</span><span>${totalText(opt)}</span></div>`;
  }
  /* Une carte de vœux par création, modifiable avant l'envoi. */
  function orderCardsHTML() {
    return '<div class="oc">' +
      `<p class="oc-head"><svg aria-hidden="true"><use href="#i-mail"/></svg> <span><strong>Vos cartes de vœux, offertes.</strong> Écrivez un petit mot pour chaque création (facultatif).</span></p>` +
      cart.map((it, i) => {
        const empty = cardEmpty(it.card);
        return `<details class="oc-item" data-oc="${i}"${cart.length === 1 && empty ? ' open' : ''}>` +
          `<summary><span class="oc-name">${esc(it.name)}${it.qty > 1 ? ' × ' + it.qty : ''}</span><span class="oc-state" data-oc-state>${empty ? 'Écrire la carte' : esc(cardLine(it.card))}</span></summary>` +
          cardFieldsHTML('oc' + i, it.card) +
          '</details>';
      }).join('') +
      '</div>';
  }
  function openCheckout() {
    if (!cart.length) return;
    const opts = deliveryOptions();
    const html = '<div class="dialog-body">' +
      '<h2 id="modal-title">Finaliser ma demande</h2>' +
      `<p>Quelques informations et c’est tout${NB}: votre demande m’arrive directement par e-mail. Je vous réponds pour confirmer le prix, la date et la remise.</p>` +
      '<form novalidate>' +
      '<div class="field-row">' +
      '<label class="field"><span>Prénom &amp; nom</span><input id="o-name" name="name" autocomplete="name" required autofocus></label>' +
      '<label class="field"><span>E-mail</span><input id="o-email" name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
      '</div><div class="field-row">' +
      '<label class="field"><span>Téléphone <small>(facultatif)</small></span><input id="o-phone" name="phone" type="tel" autocomplete="tel"></label>' +
      '<label class="field"><span>Pour le <small>(facultatif)</small></span><input id="o-date" type="date" name="date"></label>' +
      '</div>' +
      `<label class="field"><span>Retrait ou livraison</span><select id="o-delivery" name="delivery">${opts.map((o) => `<option value="${o.value}">${esc(o.label)}</option>`).join('')}</select></label>` +
      '<label class="field" data-place hidden><span>Adresse de livraison</span><input id="o-address" name="address" autocomplete="street-address" placeholder="Numéro, rue, ville"></label>' +
      `<p class="form-note" data-place-note hidden>${esc(deliveryText())} Je vous confirme le tarif selon votre adresse.</p>` +
      orderCardsHTML() +
      '<label class="field"><span>Un mot à ajouter <small>(facultatif)</small></span><textarea id="o-note" name="note" rows="2"></textarea></label>' +
      `<div class="order-recap" data-recap>${recapHTML(opts[0])}</div>` +
      honeypot +
      `<div class="form-actions">${sendButton('Envoyer ma demande')}</div>` +
      '<div class="send-alert" data-send-alert role="alert" hidden></div>' +
      `<p class="form-note">Aucun paiement n’est demandé sur ce site${NB}: on en parle ensemble, après confirmation.</p>` +
      '</form></div>';
    openModal(html, (root) => {
      const form = $('form', root);
      const sel = form.elements.delivery, place = $('[data-place]', root), note = $('[data-place-note]', root), recap = $('[data-recap]', root);
      sel.addEventListener('change', () => {
        const opt = deliveryOption(sel.value);
        place.hidden = !opt.delivery;
        note.hidden = !opt.delivery;
        form.elements.address.required = !!opt.delivery;
        if (!opt.delivery) place.classList.remove('is-invalid');
        recap.innerHTML = recapHTML(opt);
      });
      bindCard(root, (fields, card) => {
        const item = fields.closest('[data-oc]');
        const it = item && cart[+item.dataset.oc];
        if (!it) return;
        it.card = cardEmpty(card) ? null : card;
        saveCart();
        $('[data-oc-state]', item).textContent = it.card ? cardLine(it.card) : 'Écrire la carte';
      });
      bindSend(form, composeOrder, {
        order: true,
        onSent: () => { cart = []; saveCart(); renderCart(); }
      });
    }, { narrow: true });
  }

  /* ---------- Formulaire de contact ---------- */
  const contactForm = $('[data-contact-form]');
  function composeContact(d) {
    const lines = [`Bonjour ${BRAND}${NB}!`, '', d.message.trim(), '', '— ' + d.name, `E-mail${NB}: ${d.email}`];
    if (d.phone && d.phone.trim()) lines.push(`Téléphone${NB}: ${d.phone.trim()}`);
    lines.push(`Sujet${NB}: ${d.subject}`);
    if (d.date) lines.push(`Date souhaitée${NB}: ${frDate(d.date)}`);
    return { subject: `${d.subject} — ${d.name}`, body: lines.join('\n') };
  }
  if (contactForm) safe('contact', () => {
    $('[data-form-actions]', contactForm).innerHTML = sendButton('Envoyer mon message');
    bindSend(contactForm, composeContact, { onSent: () => contactForm.reset() });
  });
  function prefillContact(subject, message) {
    if (!contactForm) return;
    const sel = contactForm.elements.subject;
    Array.from(sel.options).forEach((o) => { if (o.text === subject) sel.value = o.value; });
    if (message && !contactForm.elements.message.value.trim()) contactForm.elements.message.value = message;
    $('#contact').scrollIntoView({ behavior: smooth, block: 'start' });
    setTimeout(() => contactForm.elements.name.focus({ preventScroll: true }), reduceMotion ? 0 : 800);
  }

  /* ------------------------------------------------------------------ *
   * Boutique
   * ------------------------------------------------------------------ */
  const STEP = 12;
  let activeCat = 'all';
  let shown = STEP;
  const filtersEl = $('[data-filters]');
  const gridEl = $('[data-products]');
  const moreBtn = $('[data-shop-more]');
  const introEl = $('[data-cat-intro]');
  const shopList = () => S.products.filter((p) => activeCat === 'all' || p.category === activeCat);

  function renderFilters() {
    const cats = (S.categories || [{ id: 'all', name: 'Tout' }])
      .filter((c) => c.id === 'all' || S.products.some((p) => p.category === c.id));
    filtersEl.innerHTML = cats.map((c) => {
      const n = c.id === 'all' ? S.products.length : S.products.filter((p) => p.category === c.id).length;
      return `<button type="button" class="filter" data-cat="${esc(c.id)}" aria-pressed="${c.id === activeCat}">${esc(c.name)}<span class="n">${n}</span></button>`;
    }).join('');
  }
  function productCard(p, i, cls) {
    const ask = productPrice(p, 0) == null;
    const quick = p.quote || (p.options && p.options.colors);
    return `<article class="product${cls}" style="--i:${i % 3}">` +
      `<button class="product-media${p.pics.length ? ' has-photo' : ''}" type="button" style="--bg:${esc(p.bg || '#F8E1E6')}" data-open="${esc(p.id)}" aria-label="Voir ${esc(p.name)}">` +
      (p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '') +
      (p.pics.length > 1 ? `<span class="pics-n" aria-hidden="true"><svg><use href="#i-photos"/></svg>${p.pics.length}</span>` : '') +
      (p.gift ? `<span class="gift-tag"><svg aria-hidden="true"><use href="#i-gift"/></svg>${esc(p.gift)}</span>` : '') +
      (jarOption(p) ? `<span class="gift-tag is-jar" title="${esc(JAR.desc || '')}"><svg aria-hidden="true"><use href="#i-jar"/></svg>Option bocal +${price(JAR.price)}</span>` : '') +
      `<span class="product-art">${productArt(p, null)}</span></button>` +
      '<div class="product-body">' +
      `<h3><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>` +
      `<p>${esc(blurbOf(p))}</p>` +
      '<div class="product-foot">' +
      `<span class="price${ask ? ' is-ask' : ''}${PROMO && !ask ? ' is-promo' : ''}">${priceHTML(p, 0)}</span>` +
      `<button class="add-btn${p.quote ? ' is-quote' : ''}" type="button" data-quick="${esc(p.id)}" aria-label="${p.quote ? 'Demander un devis : ' : quick ? 'Choisir : ' : 'Ajouter à ma sélection : '}${esc(p.name)}"><svg><use href="#i-${p.quote ? 'arrow' : 'plus'}"/></svg></button>` +
      '</div></div></article>';
  }
  /** mode : undefined (premier affichage), 'instant' (changement de filtre), nombre (index des nouvelles cartes après « Voir plus »). */
  function renderProducts(mode) {
    const list = shopList();
    const n = Math.min(shown, list.length);
    const complete = n >= list.length;
    const from = typeof mode === 'number' ? mode : mode === 'instant' ? Infinity : 0;
    gridEl.innerHTML = list.slice(0, n).map((p, i) => {
      const last = complete && i === n - 1;
      const cls = (last && n % 3 === 1 ? ' wide3' : '') + (last && n % 2 === 1 ? ' wide2' : '') + (i >= from ? ' reveal' : '');
      return productCard(p, i, cls);
    }).join('');
    if (moreBtn) {
      moreBtn.hidden = complete;
      moreBtn.innerHTML = `Voir plus de créations <span class="n">${list.length - n}</span>`;
    }
    if (introEl) {
      const intro = withPrice(catOf(activeCat).intro || '');
      introEl.hidden = !intro;
      introEl.innerHTML = intro ? `<svg aria-hidden="true"><use href="#i-flower"/></svg><p>${esc(intro)}</p>` : '';
    }
    reveal(gridEl);
  }
  function setCategory(cat, instant) {
    activeCat = cat;
    shown = STEP;
    $$('[data-cat]', filtersEl).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === cat)));
    if (instant || reduceMotion) { renderProducts('instant'); return; }
    gridEl.classList.add('is-switching');
    setTimeout(() => {
      renderProducts('instant');
      requestAnimationFrame(() => gridEl.classList.remove('is-switching'));
    }, 280);
  }
  function showCategory(cat) {
    if (!S.products.some((p) => p.category === cat)) return;
    setCategory(cat, true);
    $('#boutique').scrollIntoView({ behavior: smooth, block: 'start' });
  }
  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b || b.dataset.cat === activeCat) return;
    setCategory(b.dataset.cat);
  });
  if (moreBtn) moreBtn.addEventListener('click', () => {
    const from = shown;
    shown += STEP;
    renderProducts(from);
    const next = $$('.product', gridEl)[from];
    const btn = next && $('[data-open]', next);
    if (btn) btn.focus({ preventScroll: true });
  });
  gridEl.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { openProduct(o.dataset.open, shopList().map((p) => p.id)); return; }
    const q = e.target.closest('[data-quick]');
    if (!q) return;
    const p = findProduct(q.dataset.quick);
    if (!p) return;
    if (p.quote || p.priceFrom || (p.options && p.options.colors)) { openProduct(p.id, shopList().map((x) => x.id)); return; }
    addProduct(p, 0, 1);
    flyToCart(q);
    q.classList.add('is-done');
    q.innerHTML = '<svg><use href="#i-check"/></svg>';
    setTimeout(() => {
      q.classList.remove('is-done');
      q.innerHTML = '<svg><use href="#i-plus"/></svg>';
    }, 1500);
  });

  /* ---------- Fiche d'une création (avec navigation précédente / suivante) ---------- */
  let navIds = [];
  let currentId = '';
  const WHY = [['clock', 'du temps'], ['chenille', 'des fils chenille'], ['stem', 'une tige de fer'], ['tape', 'du scotch de masquage'], ['drop', 'de la colle'], ['brush', 'du maquillage'], ['gift', 'un emballage'], ['heart', 'et plein d’amour']];
  const whyHTML = () => `<div class="pm-why"><p>Une fleur, c’est${NB}:</p><ul>${WHY.map((w) => `<li><svg aria-hidden="true"><use href="#i-${w[0]}"/></svg>${w[1]}</li>`).join('')}</ul></div>`;

  function openProduct(id, nav, focusSel) {
    const p = findProduct(id);
    if (!p) return;
    currentId = id;
    if (nav) navIds = nav.filter((x) => findProduct(x));
    if (navIds.indexOf(id) < 0) navIds = [];
    const pos = navIds.indexOf(id);
    let idx = 0, qty = 1, color = '', picIdx = 0, jar = false;
    const o = p.options;
    const icon = (c) => (c.type && S.flowers[c.type] ? `<span class="pill-ic" aria-hidden="true">${FC.icon(c.type, FC.hex(color || c.color || 'rose'))}</span>` : (c.color ? `<i style="--c:${FC.hex(c.color)}"></i>` : ''));
    const pillsHTML = () => o.choices.map((c, i) => `<button type="button" class="pill" role="radio" aria-checked="${i === idx}" data-choice="${i}">${icon(c)}${esc(c.name)}</button>`).join('');
    const colorKeys = Object.keys(S.colors).filter((k) => !S.colors[k].hidden);
    const opts = o
      ? `<div><span class="pm-label" id="pm-opt-label">${esc(o.label)}</span><div class="pills" role="radiogroup" aria-labelledby="pm-opt-label" data-pills>${pillsHTML()}</div></div>` +
        (o.colors
          ? `<div><span class="pm-label" id="pm-col-label">Sa couleur <em data-col-name>à choisir</em></span><div class="swatches swatches--sm" role="radiogroup" aria-labelledby="pm-col-label">` +
            colorKeys.map((k) => `<button type="button" class="swatch" role="radio" aria-checked="false" aria-label="${esc(S.colors[k].name)}" title="${esc(S.colors[k].name)}" data-pm-color="${esc(k)}" style="--c:${esc(S.colors[k].hex)}"></button>`).join('') +
            '</div></div>'
          : '')
      : '';
    const compo = p.composition && p.composition.length
      ? `<div><span class="pm-label">Composition</span><ul class="pm-compo">${p.composition.map((c) => `<li><i style="--c:${FC.hex(c.color)}"></i><span><strong>${esc(colorName(c.color))}</strong>${NB}: ${esc(c.text)}</span></li>`).join('')}</ul></div>`
      : '';
    const words = p.words ? `<blockquote class="pm-words"><p>«${NB}${esc(p.words)}${NB}»</p><cite><svg aria-hidden="true"><use href="#i-chenille"/></svg> Flore &amp; Chenilles</cite></blockquote>` : '';
    const card = p.quote ? '' :
      '<details class="pm-card"><summary><svg aria-hidden="true"><use href="#i-mail"/></svg><span><strong>Carte de vœux offerte</strong> Écrire mon message</span></summary>' +
      cardFieldsHTML('pm-card', null) + '</details>';
    const actions = p.quote
      ? '<button type="button" class="btn btn-primary" data-pm-quote>Demander un devis <svg><use href="#i-arrow"/></svg></button>'
      : '<div class="qty" role="group" aria-label="Quantité"><button type="button" data-q="-1" aria-label="Retirer un exemplaire">−</button><output data-q-val aria-live="polite">1</output><button type="button" data-q="1" aria-label="Ajouter un exemplaire">+</button></div>' +
        '<button type="button" class="btn btn-primary" data-pm-add><svg><use href="#i-bag"/></svg> Ajouter à ma sélection</button>';
    const links = (p.preset && stage ? '<button type="button" class="pm-link" data-pm-custom><svg><use href="#i-sparkle"/></svg> Personnaliser ce bouquet</button>' : '') +
      (p.post ? `<a class="pm-link" href="${esc(p.post)}" target="_blank" rel="noopener"><svg><use href="#i-instagram"/></svg> Voir la publication</a>` : '') +
      (!p.quote ? '<button type="button" class="pm-link" data-pm-ask><svg><use href="#i-palette"/></svg> La même dans d’autres couleurs</button>' : '');
    const thumbs = p.pics.length > 1
      ? `<div class="pm-thumbs" role="group" aria-label="Photos de la création">${p.pics.map((ph, i) => `<button type="button" class="pm-thumb" data-pic="${i}" aria-pressed="${i === 0}" aria-label="Photo ${i + 1} sur ${p.pics.length}"><img src="${esc(ph.s)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div>`
      : '';
    const navBtns = pos >= 0 && navIds.length > 1
      ? '<button type="button" class="icon-btn pm-nav pm-prev" data-pm-nav="-1" aria-label="Création précédente"><svg><use href="#i-arrow"/></svg></button>' +
        '<button type="button" class="icon-btn pm-nav pm-next" data-pm-nav="1" aria-label="Création suivante"><svg><use href="#i-arrow"/></svg></button>' +
        `<span class="pm-count">${pos + 1} / ${navIds.length}</span>`
      : '';
    const cat = catOf(p.category).name;
    const html = '<div class="pm">' +
      `<div class="pm-media${p.pics.length ? ' has-photo' : ''}" style="--bg:${esc(p.bg || '#F8E1E6')}"><div class="pm-art" data-pm-art>${productArt(p, null, { aspect: 0.92, large: true })}</div>${thumbs}${navBtns}</div>` +
      '<div class="pm-info">' +
      (cat && p.category !== 'sur-mesure' ? `<p class="pm-cat">${esc(cat)}</p>` : '') +
      (p.badge ? `<span class="badge badge--inline">${esc(p.badge)}</span>` : '') +
      `<h2 id="modal-title">${esc(p.name)}</h2>` +
      `<p class="pm-price${productPrice(p, 0) == null ? ' is-ask' : ''}"><span data-pm-price>${priceHTML(p, 0)}</span>${PROMO ? ` <span class="promo-tag">${pctText()}</span>` : ''}</p>` +
      words +
      (p.count ? `<p class="pm-count-line">${p.count}${NB}fleurs × ${price(UNIT)}${p.jar ? ' + bocal ' + price(JAR.price) : ''}${p.gift ? ' · ' + esc(p.gift.toLowerCase()) : ''}</p>` : (p.gift ? `<p class="pm-count-line">${esc(p.gift)}</p>` : '')) +
      `<p class="pm-desc">${esc(blurbOf(p))}</p>` +
      (p.category === 'unite' ? whyHTML() : '') +
      compo + opts +
      (jarOption(p) ? `<label class="pm-jar"><input type="checkbox" id="pm-jar" data-pm-jar><span class="pm-jar-ic" aria-hidden="true"><svg><use href="#i-jar"/></svg></span><span><strong>${esc(JAR.label)}</strong><small>${esc(JAR.desc || 'Sur demande.')}</small></span><b>+${price(JAR.price)}</b></label>` : '') +
      card +
      `<div class="pm-actions">${actions}</div>` +
      (links ? `<div class="pm-links">${links}</div>` : '') +
      (p.illustration ? `<p class="tiny">${esc(p.illustration)}</p>` : `<p class="tiny">Fait main à la commande · ${esc(PACK)} · Carte de vœux offerte</p>`) +
      '</div></div>';
    openModal(html, (root) => {
      const art = $('[data-pm-art]', root);
      const showPic = (i) => {
        picIdx = i;
        art.innerHTML = productArt(p, null, { aspect: 0.92, large: true, pic: i });
        $$('[data-pic]', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.pic === i)));
      };
      root.addEventListener('click', (e) => {
        const nb = e.target.closest('[data-pm-nav]');
        if (nb) { stepProduct(+nb.dataset.pmNav); return; }
        const th = e.target.closest('[data-pic]');
        if (th) { showPic(+th.dataset.pic); return; }
        const c = e.target.closest('[data-choice]');
        if (c) {
          idx = +c.dataset.choice;
          $$('[data-choice]', root).forEach((x) => x.setAttribute('aria-checked', String(x === c)));
          art.innerHTML = productArt(p, idx, { aspect: 0.92, large: true });
          $$('[data-pic]', root).forEach((b) => b.setAttribute('aria-pressed', 'false'));
          $('[data-pm-price]', root).innerHTML = priceHTML(p, idx, jar ? JAR.price : 0);
          return;
        }
        const sw = e.target.closest('[data-pm-color]');
        if (sw) {
          color = sw.dataset.pmColor;
          $$('[data-pm-color]', root).forEach((x) => x.setAttribute('aria-checked', String(x === sw)));
          $('[data-col-name]', root).textContent = colorName(color).toLowerCase();
          $('[data-pills]', root).innerHTML = pillsHTML();
          return;
        }
        const qb = e.target.closest('[data-q]');
        if (qb) {
          qty = Math.max(1, Math.min(30, qty + +qb.dataset.q));
          $('[data-q-val]', root).textContent = qty;
          return;
        }
        if (e.target.closest('[data-pm-add]')) {
          flyToCart(e.target.closest('[data-pm-add]'));
          const fields = $('[data-card-fields]', root);
          addProduct(p, o ? idx : 0, qty, { color, jar, card: fields ? readCard(fields) : null });
          closeModal();
          return;
        }
        if (e.target.closest('[data-pm-custom]')) {
          closeModal();
          loadPreset(p.preset, p.name);
          return;
        }
        if (e.target.closest('[data-pm-ask]')) {
          closeModal();
          prefillContact('Un bouquet sur mesure', `Bonjour${NB}! J’aimerais «${NB}${p.name}${NB}», mais dans d’autres couleurs${NB}: \nPour le${NB}: `);
          return;
        }
        if (e.target.closest('[data-pm-quote]')) {
          closeModal();
          const souvenir = p.id === 'souvenir';
          prefillContact(souvenir ? 'Une composition souvenir' : 'Un bouquet sur mesure',
            souvenir
              ? `Bonjour, je souhaiterais une composition souvenir en bocal, en mémoire d’un être cher.\nCouleurs ou fleurs souhaitées${NB}: \nPour le${NB}: `
              : `Bonjour${NB}! J’aimerais un devis pour «${NB}${p.name}${NB}».\nDate souhaitée${NB}: \nCouleurs ou fleurs souhaitées${NB}: `);
        }
      });
      bindCard(root, () => {});
      const jarBox = $('[data-pm-jar]', root);
      if (jarBox) jarBox.addEventListener('change', () => {
        jar = jarBox.checked;
        $('[data-pm-price]', root).innerHTML = priceHTML(p, o ? idx : 0, jar ? JAR.price : 0);
      });
      // Glisser du doigt sur la photo : création précédente / suivante (ou photo suivante).
      const media = $('.pm-media', root);
      let x0 = null, y0 = null;
      media.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      media.addEventListener('touchend', (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
        const d = dx < 0 ? 1 : -1;
        if (p.pics.length > 1 && picIdx + d >= 0 && picIdx + d < p.pics.length) showPic(picIdx + d);
        else if (navIds.length > 1) stepProduct(d);
      }, { passive: true });
      // Précharge les photos des créations voisines.
      [-1, 1].forEach((d) => {
        const n = navIds.length > 1 && pos >= 0 ? findProduct(navIds[(pos + d + navIds.length) % navIds.length]) : null;
        if (n && n.pics.length) { const im = new Image(); im.src = n.pics[0].l; }
      });
    }, { focus: focusSel });
  }
  function stepProduct(d) {
    if (navIds.length < 2) return;
    const i = Math.max(0, navIds.indexOf(currentId));
    openProduct(navIds[(i + d + navIds.length) % navIds.length], null, `[data-pm-nav="${d}"]`);
  }

  /* ------------------------------------------------------------------ *
   * Votre bouquet à vous
   * ------------------------------------------------------------------ */
  const BLD = S.builder || {};
  const MAX = BLD.maxFlowers || 20;
  const stageSvg = $('[data-stage]');
  const preview = $('[data-preview]');
  const stage = stageSvg ? FC.stage(stageSvg) : null;
  const colorsEl = $('[data-b-colors]');
  const pickerEl = $('[data-b-flowers]');
  const chipsEl = $('[data-b-chips]');
  const cardHost = $('[data-b-card]');
  const firstKey = (o) => Object.keys(o)[0];
  let uid = 1;
  let bColor = (BLD.start && S.colors[BLD.start.color] && BLD.start.color) || firstKey(S.colors);
  let stageStarted = false;

  function toItems(arr) {
    return (arr || [])
      .filter((f) => Array.isArray(f) && S.flowers[f[0]])
      .slice(0, MAX)
      .map((f) => ({ id: uid++, type: f[0], color: S.flowers[f[0]].fixedColor || (S.colors[f[1]] ? f[1] : bColor) }));
  }
  /** Bouquet à partir d'un modèle ; la carte garde ce qui était déjà écrit (keep) sauf indication contraire. */
  function fromPreset(pr, keep) {
    pr = pr || {};
    const c = pr.card || {};
    const k = keep || {};
    return {
      flowers: toItems(pr.flowers),
      card: cleanCard({
        to: c.to != null ? c.to : k.to,
        msg: typeof pr.message === 'string' ? pr.message : c.msg != null ? c.msg : k.msg,
        from: c.from != null ? c.from : k.from
      })
    };
  }
  const serialize = (st) => ({ f: st.flowers.map((f) => [f.type, f.color]), t: st.card.to, m: st.card.msg, d: st.card.from });
  const fromSerialized = (o) => (o && Array.isArray(o.f) ? fromPreset({ flowers: o.f, card: { to: o.t || '', msg: o.m || '', from: o.d || '' } }) : null);
  function encode(o) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(s) {
    try {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return JSON.parse(decodeURIComponent(escape(atob(s))));
    } catch (e) {
      return null;
    }
  }

  let bState = fromSerialized(store.get('fc-bouquet-v2', null)) || fromPreset(BLD.start);
  function describe(st) {
    const groups = {}, order = [];
    st.flowers.forEach((f) => {
      if (!groups[f.type]) { groups[f.type] = {}; order.push(f.type); }
      groups[f.type][f.color] = (groups[f.type][f.color] || 0) + 1;
    });
    return order.map((t) => {
      const g = groups[t], info = flowerInfo(t), cols = Object.keys(g);
      const n = cols.reduce((s, c) => s + g[c], 0);
      const detail = info.fixedColor ? '' : ' (' + cols.map((c) => (cols.length > 1 ? g[c] + ' ' : '') + colorName(c).toLowerCase()).join(', ') + ')';
      return n + ' ' + (n > 1 ? info.plural : info.name).toLowerCase() + detail;
    }).join(', ');
  }

  function renderColors() {
    colorsEl.innerHTML = Object.keys(S.colors).filter((k) => !S.colors[k].hidden).map((k) =>
      `<button type="button" class="swatch" role="radio" aria-checked="${k === bColor}" aria-label="${esc(S.colors[k].name)}" title="${esc(S.colors[k].name)}" data-color="${esc(k)}" style="--c:${esc(S.colors[k].hex)}"></button>`
    ).join('');
    $('[data-b-color-name]').textContent = colorName(bColor);
  }
  function renderPicker() {
    pickerEl.innerHTML = Object.keys(S.flowers).map((t) => {
      const f = S.flowers[t];
      return `<button type="button" class="fp" data-add="${esc(t)}" aria-label="Ajouter : ${esc(f.name)}" title="${esc(f.desc || f.name)}">` +
        '<span class="fp-plus" aria-hidden="true">+</span>' +
        `<span class="fp-art">${FC.icon(t, FC.hex(f.fixedColor || bColor))}</span>` +
        `<span class="fp-name">${esc(f.name)}</span></button>`;
    }).join('');
  }
  const chipHTML = (f) =>
    `<button type="button" class="chip" data-remove="${f.id}" style="--c:${FC.hex(f.color)}" aria-label="Retirer : ${esc(flowerInfo(f.type).name)} ${esc(colorName(f.color))}"><i></i>${esc(flowerInfo(f.type).name)}<svg><use href="#i-close"/></svg></button>`;
  function renderChips() {
    const ids = new Set(bState.flowers.map((f) => String(f.id)));
    $$('.chip', chipsEl).forEach((c) => { if (!ids.has(c.dataset.remove)) c.remove(); });
    const have = new Set($$('.chip', chipsEl).map((c) => c.dataset.remove));
    bState.flowers.forEach((f) => { if (!have.has(String(f.id))) chipsEl.insertAdjacentHTML('beforeend', chipHTML(f)); });
  }
  /* Prix du bouquet composé : chaque fleur au prix d'une fleur, le feuillage est offert. */
  const bouquetPrice = (st) => st.flowers.filter((f) => !(S.flowers[f.type] && S.flowers[f.type].foliage)).length * UNIT;
  function renderSummary() {
    const n = bState.flowers.length;
    const bp = bouquetPrice(bState);
    const bpHTML = PROMO && bp ? `<s>${price(bp)}</s> ${price(withPromo(bp))}` : esc(price(bp));
    $$('[data-b-price], [data-b-price-2]').forEach((el) => { el.innerHTML = bpHTML; });
    const leaves = bState.flowers.filter((f) => S.flowers[f.type] && S.flowers[f.type].foliage).length;
    setText('[data-b-count]', plural(n - leaves, 'fleur', 'fleurs') + (leaves ? ' + feuillage' : ''));
    setText('[data-b-count-2]', String(n - leaves) + (leaves ? ' + ' + plural(leaves, 'feuillage', 'feuillages') : ''));
    setText('[data-b-count-max]', n + ' / ' + MAX);
    setText('[data-b-card-state]', cardEmpty(bState.card) ? 'Offerte' : 'Offerte, avec votre mot');
    if (preview) preview.classList.toggle('is-empty', n === 0);
    const undo = $('[data-b-undo]');
    if (undo) undo.disabled = n === 0;
  }
  function syncControls() {
    if (cardHost) cardHost.innerHTML = cardFieldsHTML('b-card', bState.card);
  }
  function bUpdate(opts) {
    stageStarted = true;
    if (stage) stage.set(bState);
    renderChips();
    renderSummary();
    store.set('fc-bouquet-v2', serialize(bState));
    if (opts && opts.pulse && !reduceMotion) {
      preview.classList.remove('is-pulse');
      void preview.offsetWidth;
      preview.classList.add('is-pulse');
    }
  }

  safe('compositeur', () => {
    if (!stage) return;
    renderColors();
    renderPicker();
    syncControls();
    renderChips();
    renderSummary();

    colorsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-color]');
      if (!b) return;
      bColor = b.dataset.color;
      $$('[data-color]', colorsEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      $('[data-b-color-name]').textContent = colorName(bColor);
      renderPicker();
    });
    pickerEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      if (bState.flowers.length >= MAX) { toast(`Votre bouquet est déjà bien garni${NB}: ${MAX} fleurs maximum`); return; }
      const f = S.flowers[b.dataset.add];
      bState.flowers.push({ id: uid++, type: b.dataset.add, color: f.fixedColor || bColor });
      bUpdate({ pulse: true });
    });
    chipsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      bState.flowers = bState.flowers.filter((f) => String(f.id) !== b.dataset.remove);
      bUpdate();
    });
    if (cardHost) bindCard(cardHost, (fields, card) => {
      bState.card = card;
      bUpdate();
    });

    $('[data-b-surprise]').addEventListener('click', () => {
      const pals = BLD.palettes && BLD.palettes.length ? BLD.palettes : [{ colors: Object.keys(S.colors).slice(0, 3) }];
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const P = pick(pals);
      const focal = ['lys', 'arum', 'pavot', 'gerbera', 'rose', 'tulipe', 'hortensia'].filter((t) => S.flowers[t]);
      const a = pick(focal), b = pick(focal);
      const n = 6 + Math.floor(Math.random() * 6);
      const fl = [];
      for (let i = 0; i < n; i++) {
        const t = i % 3 === 2 ? pick(focal) : i % 2 ? b : a;
        fl.push([t, P.colors[i % P.colors.length]]);
      }
      if (S.flowers.eucalyptus) { fl.push(['eucalyptus']); if (Math.random() < 0.5) fl.push(['eucalyptus']); }
      bState = fromPreset({ flowers: fl }, bState.card);
      bUpdate({ pulse: true });
      toast(`Et voilà une composition surprise${NB}!`);
    });
    $('[data-b-undo]').addEventListener('click', () => {
      if (!bState.flowers.length) return;
      bState.flowers.pop();
      bUpdate();
    });
    $('[data-b-reset]').addEventListener('click', () => {
      bState = { flowers: [], card: cleanCard(null) };
      syncControls();
      bUpdate();
    });
    const shareBtn = $('[data-b-share]');
    if (shareBtn && PREVIEW) shareBtn.hidden = true;
    if (shareBtn) shareBtn.addEventListener('click', () => {
      if (!bState.flowers.length) { toast('Ajoutez d’abord quelques fleurs'); return; }
      const url = location.href.split('#')[0] + '#bouquet=' + encode(serialize(bState));
      if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        navigator.share({ title: BRAND, text: 'Regarde le bouquet que j’ai composé !', url }).catch(() => {});
        return;
      }
      copyText(url).then((ok) => {
        if (ok) { toast(`Lien de votre bouquet copié${NB}: partagez-le${NB}!`); return; }
        openModal('<div class="dialog-body"><h2 id="modal-title">Le lien de votre bouquet</h2>' +
          `<p>Copiez ce lien pour partager votre composition${NB}:</p>` +
          `<label class="field"><span class="sr-only">Lien du bouquet</span><input id="share-link" type="text" readonly value="${esc(url)}"></label></div>`,
          (root) => { const i = $('input', root); setTimeout(() => { i.focus(); i.select(); }, 80); }, { narrow: true });
      });
    });
    $('[data-b-add]').addEventListener('click', () => {
      if (!bState.flowers.length) { toast('Ajoutez au moins une fleur à votre bouquet'); return; }
      addToCart({
        key: 'custom-' + Date.now(),
        kind: 'custom',
        name: 'Mon bouquet à moi',
        option: describe(bState),
        price: bouquetPrice(bState),
        qty: 1,
        card: cardEmpty(bState.card) ? null : cleanCard(bState.card),
        bouquet: { flowers: bState.flowers.map((f) => [f.type, f.color]) }
      });
      flyToCart($('[data-b-add]'));
      toast(`Votre bouquet est dans votre sélection${NB}!`);
    });

    // La première animation se lance quand le compositeur devient visible.
    if (!PREVIEW && 'IntersectionObserver' in window) {
      const so = new IntersectionObserver((en) => {
        if (en.some((x) => x.isIntersecting)) {
          so.disconnect();
          if (!stageStarted) bUpdate();
        }
      }, { threshold: 0.2 });
      so.observe(stageSvg);
    } else {
      bUpdate();
    }
  });

  function loadFromHash() {
    const m = location.hash.match(/^#bouquet=([\w-]+)/);
    if (!m || !stage) return;
    const st = fromSerialized(decode(m[1]));
    if (!st || !st.flowers.length) return;
    bState = st;
    syncControls();
    bUpdate();
    try { history.replaceState(null, '', location.pathname + location.search + '#bouquet'); } catch (e) { /* file:// */ }
    setTimeout(() => $('#bouquet').scrollIntoView({ behavior: 'auto', block: 'start' }), 120);
    toast('Voici le bouquet que l’on vous a partagé');
  }
  window.addEventListener('hashchange', loadFromHash);

  /* ------------------------------------------------------------------ *
   * Occasions
   * ------------------------------------------------------------------ */
  function loadPreset(preset, title) {
    if (!stage || !preset) return;
    bState = fromPreset(preset, bState.card);
    syncControls();
    renderChips();
    renderSummary();
    $('#bouquet').scrollIntoView({ behavior: smooth, block: 'start' });
    setTimeout(() => bUpdate({ pulse: true }), reduceMotion ? 0 : 650);
    toast(`Composition «${NB}${title}${NB}» prête${NB}: ajustez-la à votre goût`);
  }
  const occEl = $('[data-occasions]');
  if (occEl) safe('occasions', () => {
    occEl.innerHTML = (S.occasions || []).map((o, i) =>
      `<article class="occasion reveal" style="--i:${i % 3};--bg:${esc(o.bg)}">` +
      `<div class="occ-art">${FC.bouquet(o.preset, { fit: true, aspect: 124 / 140, pad: 6, label: o.title })}</div>` +
      `<div><h3>${esc(o.title)}</h3><p>${esc(withPrice(o.text))}</p>` +
      `<button type="button" class="occ-link" data-occ="${esc(o.id)}">${o.product || o.cat ? 'Découvrir' : 'Composer ce bouquet'} <svg><use href="#i-arrow"/></svg></button></div>` +
      '</article>'
    ).join('');
    occEl.addEventListener('click', (e) => {
      const card = e.target.closest('.occasion');
      if (!card) return;
      const o = (S.occasions || []).find((x) => x.id === $('[data-occ]', card).dataset.occ);
      if (!o) return;
      if (o.cat && S.products.some((p) => p.category === o.cat)) { showCategory(o.cat); return; }
      if (o.product && findProduct(o.product)) { openProduct(o.product); return; }
      loadPreset(o.preset, o.title);
    });
  });

  /* ------------------------------------------------------------------ *
   * Avis (seulement s'il y en a de vrais dans data.js)
   * ------------------------------------------------------------------ */
  if (S.reviews && S.reviews.length) safe('avis', () => {
    const sec = $('#avis');
    sec.hidden = false;
    $('[data-reviews]', sec).innerHTML = S.reviews.map((r, i) =>
      `<figure class="review reveal" style="--i:${i % 3}"><blockquote>«${NB}${esc(r.text)}${NB}»</blockquote><figcaption>— ${esc(r.name)}${r.occasion ? ', ' + esc(r.occasion) : ''}</figcaption></figure>`
    ).join('');
  });

  /* ------------------------------------------------------------------ *
   * Instagram
   * ------------------------------------------------------------------ */
  const instaEl = $('[data-insta]');
  if (instaEl) safe('instagram', () => {
    const photos = (S.instagram && S.instagram.photos) || [];
    const tiles = photos.length
      ? photos.slice(0, 6).map((ph) => ({ bg: '#F8E1E6', html: `<img src="${esc(ph.src)}" alt="${esc(ph.alt || '')}" loading="lazy" decoding="async">`, label: ph.alt, url: ph.url }))
      : [
          { bg: '#F8E4E9', html: FC.icon('rose', FC.hex('rose')), label: 'Rose' },
          { bg: '#E3EDF8', html: FC.bouquet({ flowers: [['hortensia', 'ciel'], ['hortensia', 'blanc'], ['rose', 'ciel'], ['eucalyptus']] }, { fit: true, aspect: 1, pad: 8, label: 'Bouquet bleu ciel' }), label: 'Bouquet bleu ciel' },
          { bg: '#F1EAF8', html: FC.bouquet({ container: 'none', flowers: [['tulipe', 'mauve'], ['tulipe', 'rose'], ['tulipe', 'lavande']] }, { fit: true, aspect: 1, pad: 8, label: 'Trois tulipes' }), label: 'Trois tulipes' },
          { bg: '#F6F0D8', html: FC.bouquet({ container: 'pot', pot: 'lilas', flowers: [['jonquille', 'jaune'], ['jonquille', 'jaune'], ['eucalyptus']] }, { fit: true, aspect: 1, pad: 8, label: 'Petit pot fleuri' }), label: 'Petit pot fleuri' },
          { bg: '#E2F1E7', html: FC.icon('hortensia', FC.hex('lavande')), label: 'Hortensia' },
          { bg: '#FBEBDD', html: FC.atelier(), label: 'Dans l’atelier' }
        ];
    const renderTiles = (list) => {
      instaEl.innerHTML = list.map((t, i) =>
        `<a class="insta-tile reveal" style="--i:${i};--bg:${t.bg}" href="${esc(t.url || IG_URL)}" target="_blank" rel="noopener" aria-label="Voir sur Instagram${t.label ? ' : ' + esc(t.label) : ''}">` +
        `<span class="insta-art">${t.html}</span><span class="insta-over"><svg><use href="#i-instagram"/></svg></span></a>`
      ).join('');
    };
    renderTiles(tiles);

    // Dernières publications : flux JSON (Behold.so ou API Instagram) si une adresse est renseignée.
    const feedUrl = S.instagram && S.instagram.feedUrl;
    if (feedUrl && window.fetch && !PREVIEW) {
      fetch(feedUrl)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
        .then((json) => {
          const list = Array.isArray(json) ? json : (json && (json.posts || json.data)) || [];
          const latest = list.map((p) => {
            const sizes = p.sizes || {};
            const pickSize = (k) => sizes[k] && sizes[k].mediaUrl;
            const video = /video/i.test(p.mediaType || p.media_type || '');
            const src = pickSize('medium') || pickSize('small') || pickSize('large') ||
              (video ? p.thumbnailUrl || p.thumbnail_url : p.mediaUrl || p.media_url) || p.thumbnailUrl || p.thumbnail_url;
            const caption = String(p.prunedCaption || p.caption || '').split('\n')[0].trim().slice(0, 120);
            return src ? { bg: '#F8E1E6', url: p.permalink || IG_URL, label: caption || 'Publication Instagram', html: `<img src="${esc(src)}" alt="${esc(caption)}" loading="lazy" decoding="async">` } : null;
          }).filter(Boolean).slice(0, 6);
          if (latest.length) {
            renderTiles(latest);
            reveal(instaEl);
          }
        })
        .catch((err) => { if (window.console) console.warn('[Flore & Chenilles] flux Instagram indisponible, photos de secours affichées', err); });
    }
  });

  /* ------------------------------------------------------------------ *
   * Accueil : diaporama, papillons, nouveauté
   * ------------------------------------------------------------------ */
  const slidesEl = $('[data-hero-slides]');
  const dotsEl = $('[data-hero-dots]');
  safe('diaporama', () => {
    const slides = ((S.hero && S.hero.slides) || []).map(findProduct).filter((p) => p && p.image);
    if (!slidesEl || !dotsEl || !slides.length) return;
    let cur = 0, timer = 0;
    slidesEl.innerHTML = slides.map((p, i) =>
      `<span class="hero-slide${i === 0 ? ' is-on' : ''}"><img src="${esc(p.slideImage || p.large || p.image)}" alt="${esc(p.name)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></span>`
    ).join('');
    dotsEl.innerHTML = slides.map((p, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-dot="${i}" aria-label="${esc(p.name)}"></button>`).join('');
    const show = (i) => {
      cur = (i + slides.length) % slides.length;
      $$('.hero-slide', slidesEl).forEach((el, k) => el.classList.toggle('is-on', k === cur));
      $$('[data-dot]', dotsEl).forEach((el, k) => el.classList.toggle('is-on', k === cur));
      slidesEl.setAttribute('aria-label', 'Voir : ' + slides[cur].name);
    };
    const play = () => {
      clearInterval(timer);
      if (!reduceMotion && slides.length > 1) timer = setInterval(() => show(cur + 1), 4800);
    };
    show(0);
    play();
    slidesEl.addEventListener('click', () => openProduct(slides[cur].id, slides.map((p) => p.id)));
    dotsEl.addEventListener('click', (e) => {
      const d = e.target.closest('[data-dot]');
      if (d) { show(+d.dataset.dot); play(); }
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : play()));
  });
  safe('papillons', () => {
    $$('[data-butterfly]').forEach((el) => { el.innerHTML = FC.butterfly(el.getAttribute('data-butterfly')); });
  });
  const atelierEl = $('[data-atelier]');
  if (atelierEl) atelierEl.innerHTML = FC.atelier();

  const chip = $('[data-featured]');
  const featured = findProduct(S.hero && S.hero.featured) || S.products[0];
  if (chip && featured) safe('nouveauté', () => {
    $('[data-featured-name]', chip).textContent = featured.name;
    $('small', chip).textContent = featured.badge || 'À découvrir';
    $('[data-featured-art]', chip).innerHTML = productArt(featured, null, { aspect: 1, pad: 6, sizes: '72px' });
    $('[data-featured-art]', chip).style.background = featured.bg || '';
    chip.setAttribute('aria-label', 'Découvrir : ' + featured.name);
    chip.addEventListener('click', () => openProduct(featured.id));
  });
  else if (chip) chip.hidden = true;

  /* ------------------------------------------------------------------ *
   * Offre de lancement : accueil, boutique et bandeau défilant
   * ------------------------------------------------------------------ */
  if (PROMO) safe('offre de lancement', () => {
    const until = untilText();
    const pill = $('[data-promo-pill]');
    if (pill) {
      const short = PROMO.until ? PROMO.until.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '';
      pill.innerHTML = `<span class="promo-pct">${pctText()}</span><span>${esc(PROMO.label)}${short ? `<span class="pp-date"> · jusqu’au ${esc(short)}</span>` : ''}</span><svg aria-hidden="true"><use href="#i-arrow"/></svg>`;
      pill.hidden = false;
    }
    const banner = $('[data-promo-banner]');
    if (banner) {
      banner.innerHTML = `<span class="promo-pct">${pctText()}</span><p><strong>${esc(PROMO.label)}${NB}:</strong> ${PROMO.pct}${NB}% de remise sur toutes les créations${until ? ' jusqu’au ' + esc(until) : ''}. La remise est appliquée automatiquement à votre demande.</p>`;
      banner.hidden = false;
    }
    $$('.marquee-track > span').forEach((sp) => {
      if (sp.textContent === 'Fait main avec passion') sp.insertAdjacentHTML('beforebegin', `<span class="mq-promo">${esc(PROMO.label)} ${pctText()}</span><svg><use href="#i-flower"/></svg>`);
    });
  });

  /* ------------------------------------------------------------------ *
   * Papillons et chenilles : un peu de vie sur toute la page
   * ------------------------------------------------------------------ */
  // Où vivent les petites bêtes : conteneur, espèce, place (classe CSS), trajet (part de la largeur).
  const CRITTERS = [
    { host: '.hero-art', kind: 'cat', cls: 'c-hero', track: 0.4 },
    { host: '.marquee-wrap', kind: 'cat', cls: 'c-marquee', track: 0.62 },
    { host: '.about-art', kind: 'bf', cls: 'b-about' },
    { host: '.steps-list', kind: 'cat', cls: 'c-steps', track: 0.78 },
    { host: '#boutique .section-head', kind: 'bf', cls: 'b-shop', rest: true },
    { host: '.why-price', kind: 'cat', cls: 'c-why', track: 0.46 },
    { host: '.why-price', kind: 'bf', cls: 'b-why' },
    { host: '.builder-panel', kind: 'bf', cls: 'b-builder' },
    { host: '#occasions .section-head', kind: 'bf', cls: 'b-occ', rest: true },
    { host: '.delivery-panel', kind: 'cat', cls: 'c-deliv', track: 0.4 },
    { host: '.insta-head', kind: 'bf', cls: 'b-insta' },
    { host: '.faq-intro', kind: 'cat', cls: 'c-faq', sleepy: true },
    { host: '.contact-panel', kind: 'bf', cls: 'b-contact' },
    { host: '.footer-big', kind: 'cat', cls: 'c-footer', track: 0.7 }
  ];
  const CAT_COLS = [
    ['#C6E6D3', '#C9DDF2', '#D9CBF0', '#F8CDB5', '#F3C4CF'],
    ['#F8CDB5', '#F7E3A1', '#C6E6D3', '#C9DDF2', '#D9CBF0'],
    ['#D9CBF0', '#F3C4CF', '#F8CDB5', '#C6E6D3', '#C9DDF2']
  ];
  const CAT_HEADS = ['#F3C4CF', '#C9DDF2', '#F8CDB5'];
  const SAYINGS = ['Coucou !', 'Un jour, je serai papillon !', 'Miam, une fleur !', 'Tout doux…', 'Bonne journée !', 'Tu as vu mes couleurs ?', 'Je fais le tour de l’atelier !'];
  const critters = [];
  function sizeTracks() {
    critters.forEach((c) => {
      if (!c.track) return;
      const track = Math.max(0, Math.round(c.host.clientWidth * c.track - c.el.offsetWidth));
      c.el.style.setProperty('--track', track + 'px');
      c.el.style.setProperty('--dur', Math.max(16, Math.round(track / 14)) + 's');
    });
  }
  if (S.critters !== false) safe('papillons et chenilles', () => {
    const awake = 'IntersectionObserver' in window
      ? new IntersectionObserver((en) => en.forEach((e) => e.target.classList.toggle('is-awake', e.isIntersecting)), { rootMargin: '120px 0px' })
      : null;
    CRITTERS.forEach((c, i) => {
      const host = $(c.host);
      if (!host) return;
      const el = document.createElement('div');
      el.className = `critter critter-${c.kind} ${c.cls}${c.rest ? ' is-resting' : ''}${c.sleepy ? ' is-sleeping' : ''}`;
      el.setAttribute('aria-hidden', 'true');
      const look = { colors: CAT_COLS[i % CAT_COLS.length], head: CAT_HEADS[i % CAT_HEADS.length] };
      if (c.kind === 'bf') {
        el.style.setProperty('--delay', (-i * 1.7).toFixed(1) + 's');
        el.innerHTML = `<div class="bf-float"><div class="bf-flee">${FC.butterfly(BF_COLS[i % BF_COLS.length])}</div></div>`;
        const flee = () => {
          if (el.classList.contains('is-off')) return;
          el.style.setProperty('--fx', ((Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 90)).toFixed(0) + 'px');
          el.classList.add('is-off');
          setTimeout(() => el.classList.remove('is-off'), 2800);
        };
        el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') flee(); });
        el.addEventListener('click', flee);
      } else {
        el.innerHTML = `<div class="cp-walk"><div class="cp-flip"><div class="cp-body">${FC.cuteCaterpillar(Object.assign({ sleepy: c.sleepy }, look))}</div></div>` +
          '<span class="cp-bubble"></span><span class="cp-heart"><svg><use href="#i-heart"/></svg></span>' +
          (c.sleepy ? '<span class="cp-z"><i>z</i><i>z</i><i>z</i></span>' : '') + '</div>';
        el.addEventListener('click', () => {
          if (el.classList.contains('is-happy')) return;
          const body = $('.cp-body', el);
          if (c.sleepy) {
            body.innerHTML = FC.cuteCaterpillar(look);
            el.classList.remove('is-sleeping');
            $('.cp-bubble', el).textContent = 'Oh ! Coucou !';
          } else {
            $('.cp-bubble', el).textContent = SAYINGS[Math.floor(Math.random() * SAYINGS.length)];
          }
          el.classList.add('is-happy');
          setTimeout(() => {
            el.classList.remove('is-happy');
            if (c.sleepy) setTimeout(() => {
              body.innerHTML = FC.cuteCaterpillar(Object.assign({ sleepy: true }, look));
              el.classList.add('is-sleeping');
            }, 1800);
          }, 2600);
        });
      }
      host.appendChild(el);
      critters.push({ el, host, track: c.track });
      if (awake) awake.observe(el); else el.classList.add('is-awake');
    });
    sizeTracks();
    let rt = 0;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeTracks, 200); }, { passive: true });

    // De temps en temps, un papillon traverse l'écran.
    if (reduceMotion || PREVIEW || !document.body.animate) return;
    const visit = () => {
      if (document.hidden || locks.size) { setTimeout(visit, 8000); return; }
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.createElement('div');
      el.className = 'flyer flyer--visit';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = FC.butterfly(BF_COLS[Math.floor(Math.random() * BF_COLS.length)]);
      document.body.appendChild(el);
      const ltr = Math.random() < 0.5, y0 = h * (0.18 + Math.random() * 0.5), frames = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, x = ltr ? -60 + (w + 120) * t : w + 60 - (w + 120) * t;
        frames.push({ transform: `translate(${x.toFixed(0)}px, ${(y0 + Math.sin(t * Math.PI * 2.4) * 46 - t * 70).toFixed(0)}px) rotate(${(Math.sin(t * 11) * 14).toFixed(0)}deg)` });
      }
      const anim = el.animate(frames, { duration: 10000 + Math.random() * 5000, easing: 'linear' });
      const done = () => { el.remove(); setTimeout(visit, 20000 + Math.random() * 25000); };
      anim.onfinish = done;
      anim.oncancel = done;
    };
    setTimeout(visit, 9000);
  });

  /* ------------------------------------------------------------------ *
   * Clavier : Échap, flèches & piège de focus
   * ------------------------------------------------------------------ */
  function trap(container, e) {
    const f = $$('a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])', container)
      .filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      else if (drawer.classList.contains('is-open')) closeCart();
      else if (mmenu.classList.contains('is-open')) setMenu(false);
    } else if (e.key === 'Tab') {
      if (modal.classList.contains('is-open')) trap($('.modal-panel', modal), e);
      else if (drawer.classList.contains('is-open')) trap($('.drawer-panel', drawer), e);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && modal.classList.contains('is-open') && $('[data-pm-nav]', modal)) {
      const t = e.target;
      if (t && t.matches && t.matches('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      stepProduct(e.key === 'ArrowRight' ? 1 : -1);
    }
  });

  /* ------------------------------------------------------------------ *
   * Mention « aperçu » (version claude.ai uniquement)
   * ------------------------------------------------------------------ */
  if (PREVIEW) safe('aperçu', () => {
    const pill = document.createElement('div');
    pill.className = 'preview-pill';
    pill.setAttribute('role', 'note');
    pill.innerHTML = '<svg aria-hidden="true"><use href="#i-info"/></svg><span>Aperçu du site · version de travail</span>' +
      '<button type="button" aria-label="Masquer ce message"><svg aria-hidden="true"><use href="#i-close"/></svg></button>';
    $('button', pill).addEventListener('click', () => pill.remove());
    document.body.appendChild(pill);
  });

  /* ------------------------------------------------------------------ *
   * Démarrage
   * ------------------------------------------------------------------ */
  safe('filtres', renderFilters);
  safe('créations', () => renderProducts());
  safe('sélection', () => renderCart());
  safe('apparitions', () => reveal(document));
  safe('lien partagé', loadFromHash);
})();
