/*!
 * Flore & Chenilles — interactions du site
 * Boutique, panier, compositeur « Votre bouquet à vous », contact, animations.
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
  S.papers = S.papers || {};
  S.ribbons = S.ribbons || {};
  FC.register({ colors: S.colors, papers: S.papers, ribbons: S.ribbons, pots: S.pots });

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
  const BRAND = (S.brand && S.brand.name) || 'Flore & Chenilles';
  const IG = (S.brand && S.brand.instagram) || 'flore_et_chenilles';
  const IG_URL = 'https://www.instagram.com/' + IG + '/';
  const IG_DM = 'https://ig.me/m/' + IG;
  const EMAIL = (S.contact && S.contact.email) || '';
  const ENDPOINT = (S.contact && S.contact.formEndpoint) || '';
  const NB = ' ';
  const colorName = (k) => (S.colors[k] ? S.colors[k].name : k);
  const flowerInfo = (t) => S.flowers[t] || { name: t, plural: t, price: 0 };
  const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
  const frDate = (iso) => {
    const p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  };

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
   * Liens & coordonnées
   * ------------------------------------------------------------------ */
  $$('[data-ig]').forEach((a) => { a.href = IG_URL; });
  $$('[data-ig-dm]').forEach((a) => { a.href = IG_DM; });
  $$('[data-ig-handle]').forEach((el) => { el.textContent = '@' + IG; });
  if (EMAIL) {
    $$('[data-email]').forEach((a) => { a.href = 'mailto:' + EMAIL; a.textContent = EMAIL; });
    $$('[data-email-row]').forEach((el) => { el.hidden = false; });
  }
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

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
   * Illustrations produits
   * ------------------------------------------------------------------ */
  function resolveBouquet(p, idx) {
    const choices = (p.options && p.options.choices) || [];
    const ch = choices[idx || 0];
    const main = (ch && ch.color) || (choices.find((c) => c.color) || {}).color || 'rose';
    return Object.assign({}, p.bouquet, {
      flowers: (p.bouquet.flowers || []).map((f) => [f[0], f[1] === '$main' ? main : f[1]])
    });
  }
  function productArt(p, idx, o) {
    o = o || {};
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`;
    if (p.giftcard || !p.bouquet) return FC.giftcard();
    return FC.bouquet(resolveBouquet(p, idx), { fit: true, aspect: o.aspect || 0.9, pad: o.pad != null ? o.pad : 18, label: p.name });
  }
  function productPrice(p, idx) {
    const ch = p.options && p.options.choices[idx || 0];
    return ch && ch.price != null ? ch.price : p.price;
  }
  const findProduct = (id) => S.products.find((x) => x.id === id);

  /* ------------------------------------------------------------------ *
   * Fenêtre modale
   * ------------------------------------------------------------------ */
  const modal = $('#modal');
  const modalContent = $('[data-modal-content]', modal);
  let modalReturn = null;
  function openModal(html, bind, opts) {
    if (!modal.classList.contains('is-open')) modalReturn = document.activeElement;
    modalContent.innerHTML = html;
    modal.classList.toggle('modal--narrow', !!(opts && opts.narrow));
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true, 'modal');
    $('.modal-panel', modal).scrollTop = 0;
    if (bind) bind(modalContent.firstElementChild);
    setTimeout(() => {
      const f = $('[autofocus]', modalContent) || $('.modal-close', modal);
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false, 'modal');
    if (modalReturn && document.contains(modalReturn) && modalReturn.focus) modalReturn.focus({ preventScroll: true });
  }
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });

  /* ------------------------------------------------------------------ *
   * Panier
   * ------------------------------------------------------------------ */
  let cart = store.get('fc-cart', []);
  if (!Array.isArray(cart)) cart = [];
  const drawer = $('#cart');
  const cartItemsEl = $('[data-cart-items]');
  const cartFoot = $('[data-cart-foot]');
  const cartTotalEl = $('[data-cart-total]');
  const cartCountEl = $('[data-cart-count]');
  const cartBtn = $('.cart-btn');
  const cartTotal = () => cart.reduce((s, it) => s + it.price * it.qty, 0);
  const cartQty = () => cart.reduce((s, it) => s + it.qty, 0);

  function saveCart() { store.set('fc-cart', cart); }
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
  function addProduct(p, idx, qty) {
    const ch = p.options && p.options.choices[idx || 0];
    addToCart({
      key: p.id + (ch ? '|' + ch.name : ''),
      kind: 'product',
      id: p.id,
      choice: idx || 0,
      name: p.name,
      option: ch ? p.options.label + ' : ' + ch.name : '',
      price: productPrice(p, idx),
      qty: qty || 1
    });
    toast(`«${NB}${p.name}${ch ? ' – ' + ch.name : ''}${NB}» est dans votre panier`);
  }
  function itemThumb(it) {
    if (it.kind === 'custom' && it.bouquet) return { bg: '#F8E4E9', html: FC.bouquet(it.bouquet, { fit: true, aspect: 1, pad: 10, label: it.name }) };
    const p = findProduct(it.id);
    if (!p) return { bg: '#F8E4E9', html: '' };
    return { bg: p.bg || '#F8E4E9', html: productArt(p, it.choice || 0, { aspect: 1, pad: 10 }) };
  }
  function renderCart(focusSel) {
    const n = cartQty();
    cartCountEl.textContent = n;
    cartCountEl.classList.toggle('has', n > 0);
    cartBtn.setAttribute('aria-label', n ? `Ouvrir le panier (${plural(n, 'article', 'articles')})` : 'Ouvrir le panier');
    if (!cart.length) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">' +
        `<div class="cart-empty-art">${FC.bouquet({ container: 'none', ribbon: 'satin_rose', flowers: [['tulipe', 'rose']] }, { fit: true, aspect: 0.9, pad: 10, label: 'Une tulipe toute seule' })}</div>` +
        '<h3>Votre panier est encore vide</h3>' +
        `<p>Cette petite tulipe se sent bien seule… Offrez-lui un peu de compagnie${NB}!</p>` +
        '<a class="btn btn-primary" href="#boutique" data-close>Découvrir la boutique</a>' +
        '</div>';
      cartFoot.hidden = true;
      return;
    }
    cartFoot.hidden = false;
    cartItemsEl.innerHTML = cart.map((it, i) => {
      const th = itemThumb(it);
      return '<div class="cart-item">' +
        `<div class="ci-thumb" style="--bg:${esc(th.bg)}">${th.html}</div>` +
        `<div><div class="ci-name">${esc(it.name)}</div>${it.option ? `<div class="ci-opt">${esc(it.option)}</div>` : ''}` +
        `<div class="qty" role="group" aria-label="Quantité"><button type="button" data-cq="-1" data-i="${i}" aria-label="Retirer un exemplaire">−</button><output aria-live="polite">${it.qty}</output><button type="button" data-cq="1" data-i="${i}" aria-label="Ajouter un exemplaire">+</button></div></div>` +
        `<div class="ci-side"><span class="ci-price">${price(it.price * it.qty)}</span><button type="button" class="ci-remove" data-del="${i}">Retirer</button></div>` +
        '</div>';
    }).join('');
    cartTotalEl.textContent = price(cartTotal());
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
      toast('Article retiré du panier');
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
   * Envoi des messages (Instagram, e-mail ou formulaire en ligne)
   * ------------------------------------------------------------------ */
  function sendButtons() {
    let s = '';
    if (ENDPOINT) s += '<button class="btn btn-primary" type="submit" value="form"><svg><use href="#i-mail"/></svg> Envoyer le message</button>';
    s += `<button class="btn ${ENDPOINT ? 'btn-ghost' : 'btn-primary'}" type="submit" value="instagram"><svg><use href="#i-instagram"/></svg> Envoyer sur Instagram</button>`;
    if (EMAIL) s += '<button class="btn btn-ghost" type="submit" value="email"><svg><use href="#i-mail"/></svg> Envoyer par e-mail</button>';
    return s;
  }
  function validate(form) {
    let first = null;
    $$('[required]', form).forEach((el) => {
      const bad = !String(el.value || '').trim();
      const f = el.closest('.field');
      if (f) f.classList.toggle('is-invalid', bad);
      if (bad && !first) first = el;
    });
    if (first) {
      first.focus();
      toast('Il manque juste une petite information');
      return false;
    }
    return true;
  }
  document.addEventListener('input', (e) => {
    const f = e.target.closest && e.target.closest('.field.is-invalid');
    if (f && String(e.target.value || '').trim()) f.classList.remove('is-invalid');
  });

  async function postForm(data) {
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  function bindSend(form, compose, opts) {
    opts = opts || {};
    let via = ENDPOINT ? 'form' : 'instagram';
    form.addEventListener('click', (e) => {
      const b = e.target.closest('button[type="submit"]');
      if (b) via = b.value;
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (e.submitter && e.submitter.value) via = e.submitter.value;
      if (!validate(form)) return;
      const data = {};
      new FormData(form).forEach((v, k) => { data[k] = String(v); });
      const msg = compose(data);
      if (via === 'email' && EMAIL) {
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.body);
        showDone('email', msg, opts);
      } else if (via === 'form' && ENDPOINT) {
        const btns = $$('button[type="submit"]', form);
        btns.forEach((b) => { b.disabled = true; });
        const ok = await postForm(Object.assign({ _subject: msg.subject, message: msg.body }, data));
        btns.forEach((b) => { b.disabled = false; });
        if (ok) showDone('form', msg, opts);
        else toast('Oups, l’envoi n’a pas abouti. Essayez via Instagram.');
      } else {
        const copied = copyText(msg.body);
        let opened = false;
        try {
          const w = window.open(IG_DM, '_blank');
          if (w) {
            opened = true;
            try { w.opener = null; } catch (err) { /* sans importance */ }
          }
        } catch (err) {
          opened = false;
        }
        showDone('instagram', msg, Object.assign({ copied, opened }, opts));
      }
      if (opts.onSent) opts.onSent();
    });
  }

  function showDone(via, msg, opts) {
    opts = opts || {};
    clearTimeout(toastT);
    if (toastEl) toastEl.classList.remove('is-on');
    const art = FC.bouquet({ paper: 'poudre', ribbon: 'satin_rose', flowers: [['tulipe', 'rose'], ['marguerite', 'blanc'], ['rose', 'lilas'], ['cosmos', 'peche'], ['gypsophile', 'blanc'], ['eucalyptus']] }, { fit: true, aspect: 0.94, pad: 10, label: 'Un bouquet pour vous remercier' });
    let text;
    if (via === 'instagram') {
      text = opts.opened
        ? `La conversation Instagram s’est ouverte dans un nouvel onglet${NB}: collez-y votre message et envoyez-le.`
        : 'Ouvrez la conversation Instagram avec le bouton ci-dessous, collez-y votre message et envoyez-le.';
    } else if (via === 'email') {
      text = `Votre messagerie devrait s’ouvrir avec le message prêt. Sinon, copiez-le et envoyez-le à ${EMAIL}.`;
    } else {
      text = `Votre message nous est bien parvenu. Nous vous répondons très vite${NB}!`;
    }
    const title = via === 'form' ? `Merci, message envoyé${NB}!` : `Votre message est prêt${NB}!`;
    const mailHref = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.body);
    const html = '<div class="dialog-body done">' +
      `<div class="done-art">${art}</div>` +
      `<h2 id="modal-title">${title}</h2>` +
      `<p>${esc(text)}</p>` +
      (via !== 'form' ? `<p class="copy-status" data-copy-status hidden></p><textarea id="done-message" rows="6" readonly aria-label="Votre message">${esc(msg.body)}</textarea>` : '') +
      '<div class="form-actions">' +
      (via === 'instagram' ? `<a class="btn btn-primary" href="${IG_DM}" target="_blank" rel="noopener"><svg><use href="#i-instagram"/></svg> Ouvrir la conversation</a>` : '') +
      (via === 'email' ? `<a class="btn btn-primary" href="${esc(mailHref)}"><svg><use href="#i-mail"/></svg> Ouvrir ma messagerie</a>` : '') +
      (via !== 'form' ? '<button class="btn btn-ghost" type="button" data-copy>Copier le message</button>' : '') +
      (opts.order ? '<button class="btn btn-ghost" type="button" data-clear>Vider mon panier</button>' : '') +
      '<button class="btn btn-soft" type="button" data-close>Fermer</button>' +
      '</div></div>';
    openModal(html, (root) => {
      const status = $('[data-copy-status]', root);
      const copyBtn = $('[data-copy]', root);
      const markCopied = (ok, fromClick) => {
        if (!status) return;
        status.hidden = false;
        status.textContent = ok ? `Message copié${NB}: il ne reste plus qu’à le coller.` : 'Sélectionnez le message ci-dessous pour le copier.';
        if (ok && copyBtn) copyBtn.textContent = 'Message copié';
        if (!ok && fromClick) { const ta = $('textarea', root); ta.focus(); ta.select(); }
      };
      if (opts.copied && opts.copied.then) opts.copied.then((ok) => markCopied(ok, false));
      root.addEventListener('click', (e) => {
        if (e.target.closest('[data-copy]')) copyText(msg.body).then((ok) => markCopied(ok, true));
        if (e.target.closest('[data-clear]')) {
          cart = [];
          saveCart();
          renderCart();
          toast('Panier vidé');
          closeModal();
        }
      });
    }, { narrow: true });
  }

  /* ---------- Commande ---------- */
  function composeOrder(d) {
    const lines = [`Bonjour ${BRAND}${NB}!`, '', `Je souhaite passer commande${NB}:`, ''];
    cart.forEach((it) => {
      lines.push(`• ${it.name}${it.qty > 1 ? ' × ' + it.qty : ''} — ${price(it.price * it.qty)}`);
      if (it.option) lines.push('   ' + it.option);
    });
    lines.push('', `Total${NB}: ${price(cartTotal())}`, '', `Remise souhaitée${NB}: ${d.delivery}`);
    if (d.date) lines.push(`Pour le${NB}: ${frDate(d.date)}`);
    lines.push(`Nom${NB}: ${d.name}`, `Contact${NB}: ${d.reply}`);
    if (d.note && d.note.trim()) lines.push('', d.note.trim());
    lines.push('', 'Merci beaucoup !');
    return { subject: 'Commande — ' + d.name, body: lines.join('\n') };
  }
  function openCheckout() {
    if (!cart.length) return;
    const html = '<div class="dialog-body">' +
      '<h2 id="modal-title">Finaliser ma commande</h2>' +
      `<p>Quelques informations et c’est tout${NB}: nous préparons votre message de commande, il ne restera plus qu’à l’envoyer. Nous vous répondrons pour confirmer les détails, le paiement et la remise.</p>` +
      '<form novalidate>' +
      '<div class="field-row">' +
      '<label class="field"><span>Prénom &amp; nom</span><input name="name" autocomplete="name" required autofocus></label>' +
      '<label class="field"><span>E-mail ou téléphone</span><input name="reply" autocomplete="email" required></label>' +
      '</div><div class="field-row">' +
      '<label class="field"><span>Remise souhaitée</span><select name="delivery"><option>Remise en main propre</option><option>Envoi postal</option><option>À définir ensemble</option></select></label>' +
      '<label class="field"><span>Pour le <small>(facultatif)</small></span><input type="date" name="date"></label>' +
      '</div>' +
      '<label class="field"><span>Un mot à ajouter <small>(facultatif)</small></span><textarea name="note" rows="2"></textarea></label>' +
      `<div class="order-recap"><ul>${cart.map((it) => `<li><span>${esc(it.name)}${it.qty > 1 ? ' × ' + it.qty : ''}</span><span>${price(it.price * it.qty)}</span></li>`).join('')}</ul><div class="tot"><span>Total</span><span>${price(cartTotal())}</span></div></div>` +
      `<div class="form-actions">${sendButtons()}</div>` +
      `<p class="form-note">Aucun paiement n’est demandé sur ce site${NB}: il est convenu ensemble, après confirmation.</p>` +
      '</form></div>';
    openModal(html, (root) => bindSend($('form', root), composeOrder, { order: true }), { narrow: true });
  }

  /* ---------- Formulaire de contact ---------- */
  const contactForm = $('[data-contact-form]');
  function composeContact(d) {
    const lines = [`Bonjour ${BRAND}${NB}!`, '', d.message.trim(), '', '— ' + d.name, `Contact${NB}: ${d.reply}`, `Sujet${NB}: ${d.subject}`];
    if (d.date) lines.push(`Date souhaitée${NB}: ${frDate(d.date)}`);
    return { subject: d.subject + ' — ' + d.name, body: lines.join('\n') };
  }
  if (contactForm) {
    $('[data-form-actions]', contactForm).innerHTML = sendButtons();
    bindSend(contactForm, composeContact, { onSent: () => contactForm.reset() });
  }
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
  let activeCat = 'all';
  const filtersEl = $('[data-filters]');
  const gridEl = $('[data-products]');

  function renderFilters() {
    const cats = (S.categories || [{ id: 'all', name: 'Tout' }])
      .filter((c) => c.id === 'all' || S.products.some((p) => p.category === c.id));
    filtersEl.innerHTML = cats.map((c) => {
      const n = c.id === 'all' ? S.products.length : S.products.filter((p) => p.category === c.id).length;
      return `<button type="button" class="filter" data-cat="${esc(c.id)}" aria-pressed="${c.id === activeCat}">${esc(c.name)}<span class="n">${n}</span></button>`;
    }).join('');
  }
  function renderProducts(instant) {
    const list = S.products.filter((p) => activeCat === 'all' || p.category === activeCat);
    gridEl.innerHTML = list.map((p, i) => {
      const colored = p.options ? p.options.choices.filter((c) => c.color) : [];
      const dots = colored.length > 1 ? `<span class="dots" aria-hidden="true">${colored.slice(0, 4).map((c) => `<i style="--c:${FC.hex(c.color)}"></i>`).join('')}</span>` : '';
      return `<article class="product${instant ? '' : ' reveal'}" style="--i:${i % 3}">` +
        `<button class="product-media${p.image ? ' has-photo' : ''}" type="button" style="--bg:${esc(p.bg || '#F8E1E6')}" data-open="${esc(p.id)}" aria-label="Voir ${esc(p.name)}">` +
        (p.badge ? `<span class="badge">${esc(p.badge)}</span>` : '') +
        `<span class="product-art">${productArt(p, 0)}</span></button>` +
        '<div class="product-body">' +
        `<h3><button type="button" data-open="${esc(p.id)}">${esc(p.name)}</button></h3>` +
        `<p>${esc(p.desc)}</p>` +
        '<div class="product-foot">' +
        `<span class="price">${p.priceFrom ? '<small>dès</small> ' : ''}${price(p.price)}</span>${dots}` +
        `<button class="add-btn" type="button" data-quick="${esc(p.id)}" aria-label="${p.priceFrom ? 'Demander un devis : ' : 'Ajouter au panier : '}${esc(p.name)}"><svg><use href="#i-${p.priceFrom ? 'arrow' : 'plus'}"/></svg></button>` +
        '</div></div></article>';
    }).join('');
    if (!instant) reveal(gridEl);
  }
  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b || b.dataset.cat === activeCat) return;
    activeCat = b.dataset.cat;
    $$('[data-cat]', filtersEl).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    if (reduceMotion) { renderProducts(true); return; }
    gridEl.classList.add('is-switching');
    setTimeout(() => {
      renderProducts(true);
      requestAnimationFrame(() => gridEl.classList.remove('is-switching'));
    }, 280);
  });
  gridEl.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) { openProduct(o.dataset.open); return; }
    const q = e.target.closest('[data-quick]');
    if (!q) return;
    const p = findProduct(q.dataset.quick);
    if (!p) return;
    if (p.priceFrom) { openProduct(p.id); return; }
    addProduct(p, 0, 1);
    q.classList.add('is-done');
    q.innerHTML = '<svg><use href="#i-check"/></svg>';
    setTimeout(() => {
      q.classList.remove('is-done');
      q.innerHTML = '<svg><use href="#i-plus"/></svg>';
    }, 1500);
  });

  function openProduct(id) {
    const p = findProduct(id);
    if (!p) return;
    let idx = 0, qty = 1;
    const priceHTML = (i) => (p.priceFrom ? '<small>à partir de</small> ' : '') + price(productPrice(p, i));
    const opts = p.options
      ? `<div><span class="pm-label" id="pm-opt-label">${esc(p.options.label)}</span><div class="pills" role="radiogroup" aria-labelledby="pm-opt-label">` +
        p.options.choices.map((c, i) => `<button type="button" class="pill" role="radio" aria-checked="${i === 0}" data-choice="${i}">${c.color ? `<i style="--c:${FC.hex(c.color)}"></i>` : ''}${esc(c.name)}</button>`).join('') +
        '</div></div>'
      : '';
    const actions = p.priceFrom
      ? '<button type="button" class="btn btn-primary" data-pm-quote>Demander un devis <svg><use href="#i-arrow"/></svg></button>'
      : '<div class="qty" role="group" aria-label="Quantité"><button type="button" data-q="-1" aria-label="Retirer un exemplaire">−</button><output data-q-val aria-live="polite">1</output><button type="button" data-q="1" aria-label="Ajouter un exemplaire">+</button></div>' +
        '<button type="button" class="btn btn-primary" data-pm-add><svg><use href="#i-bag"/></svg> Ajouter au panier</button>';
    const html = '<div class="pm">' +
      `<div class="pm-media" style="--bg:${esc(p.bg || '#F8E1E6')}"><div class="pm-art" data-pm-art>${productArt(p, 0, { aspect: 0.92 })}</div></div>` +
      '<div class="pm-info">' +
      (p.badge ? `<span class="badge badge--inline">${esc(p.badge)}</span>` : '') +
      `<h2 id="modal-title">${esc(p.name)}</h2>` +
      `<p class="pm-price" data-pm-price>${priceHTML(0)}</p>` +
      `<p class="pm-desc">${esc(p.desc)}</p>` +
      (p.details ? `<ul class="pm-details">${p.details.map((d) => `<li><svg><use href="#i-check"/></svg>${esc(d)}</li>`).join('')}</ul>` : '') +
      opts +
      `<div class="pm-actions">${actions}</div>` +
      '<p class="tiny">Fait main à la commande · Couleurs ajustables sur simple demande</p>' +
      '</div></div>';
    openModal(html, (root) => {
      root.addEventListener('click', (e) => {
        const c = e.target.closest('[data-choice]');
        if (c) {
          idx = +c.dataset.choice;
          $$('[data-choice]', root).forEach((x) => x.setAttribute('aria-checked', String(x === c)));
          if (p.bouquet && !p.image) $('[data-pm-art]', root).innerHTML = productArt(p, idx, { aspect: 0.92 });
          $('[data-pm-price]', root).innerHTML = priceHTML(idx);
          return;
        }
        const qb = e.target.closest('[data-q]');
        if (qb) {
          qty = Math.max(1, Math.min(20, qty + +qb.dataset.q));
          $('[data-q-val]', root).textContent = qty;
          return;
        }
        if (e.target.closest('[data-pm-add]')) {
          addProduct(p, idx, qty);
          closeModal();
          return;
        }
        if (e.target.closest('[data-pm-quote]')) {
          closeModal();
          prefillContact('Mariage & événements', `Bonjour${NB}! J’aimerais un devis pour «${NB}${p.name}${NB}».\nDate de l’événement${NB}: \nCouleurs souhaitées${NB}: \nNombre de pièces (bouquet, boutonnières…)${NB}: `);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Votre bouquet à vous
   * ------------------------------------------------------------------ */
  const BLD = S.builder || {};
  const MAX = BLD.maxFlowers || 20;
  const BASE = BLD.basePrice || 0;
  const stageSvg = $('[data-stage]');
  const preview = $('[data-preview]');
  const stage = stageSvg ? FC.stage(stageSvg) : null;
  const colorsEl = $('[data-b-colors]');
  const pickerEl = $('[data-b-flowers]');
  const chipsEl = $('[data-b-chips]');
  const papersEl = $('[data-b-papers]');
  const ribbonsEl = $('[data-b-ribbons]');
  const msgEl = $('[data-b-message]');
  const counterEl = $('[data-b-counter]');
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
  function fromPreset(pr) {
    pr = pr || {};
    return {
      flowers: toItems(pr.flowers),
      paper: S.papers[pr.paper] ? pr.paper : firstKey(S.papers),
      ribbon: S.ribbons[pr.ribbon] ? pr.ribbon : firstKey(S.ribbons),
      message: typeof pr.message === 'string' ? pr.message.slice(0, 80) : ''
    };
  }
  const serialize = (st) => ({ f: st.flowers.map((f) => [f.type, f.color]), p: st.paper, r: st.ribbon, m: st.message });
  const fromSerialized = (o) => (o && Array.isArray(o.f) ? fromPreset({ flowers: o.f, paper: o.p, ribbon: o.r, message: o.m }) : null);
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

  let bState = fromSerialized(store.get('fc-bouquet', null)) || fromPreset(BLD.start);

  function totals() {
    const fl = bState.flowers.reduce((s, f) => s + (flowerInfo(f.type).price || 0), 0);
    return { fl, total: bState.flowers.length ? fl + BASE : 0 };
  }
  function describe(st) {
    const groups = {}, order = [];
    st.flowers.forEach((f) => {
      if (!groups[f.type]) { groups[f.type] = {}; order.push(f.type); }
      groups[f.type][f.color] = (groups[f.type][f.color] || 0) + 1;
    });
    const parts = order.map((t) => {
      const g = groups[t], info = flowerInfo(t), cols = Object.keys(g);
      const n = cols.reduce((s, c) => s + g[c], 0);
      const detail = info.fixedColor ? '' : ' (' + cols.map((c) => (cols.length > 1 ? g[c] + ' ' : '') + colorName(c).toLowerCase()).join(', ') + ')';
      return n + ' ' + (n > 1 ? info.plural : info.name).toLowerCase() + detail;
    });
    let s = parts.join(', ');
    s += ' · Papier ' + (S.papers[st.paper] ? S.papers[st.paper].name.toLowerCase() : st.paper);
    s += ', ruban ' + (S.ribbons[st.ribbon] ? S.ribbons[st.ribbon].name.toLowerCase() : st.ribbon);
    if (st.message && st.message.trim()) s += ` · Petit mot${NB}: «${NB}${st.message.trim()}${NB}»`;
    return s;
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
      return `<button type="button" class="fp" data-add="${esc(t)}" aria-label="Ajouter : ${esc(f.name)}, ${price(f.price)}" title="${esc(f.desc || f.name)}">` +
        '<span class="fp-plus" aria-hidden="true">+</span>' +
        `<span class="fp-art">${FC.icon(t, FC.hex(f.fixedColor || bColor))}</span>` +
        `<span class="fp-name">${esc(f.name)}</span><span class="fp-price">${price(f.price)}</span></button>`;
    }).join('');
  }
  function renderWraps() {
    const sw = (group, key, attr) => `<button type="button" class="swatch" role="radio" aria-checked="${key === bState[attr]}" data-${attr}="${esc(key)}" style="--c:${esc(group[key].hex)}"><i></i>${esc(group[key].name)}</button>`;
    papersEl.innerHTML = Object.keys(S.papers).map((k) => sw(S.papers, k, 'paper')).join('');
    ribbonsEl.innerHTML = Object.keys(S.ribbons).map((k) => sw(S.ribbons, k, 'ribbon')).join('');
  }
  const chipHTML = (f) =>
    `<button type="button" class="chip" data-remove="${f.id}" style="--c:${FC.hex(f.color)}" aria-label="Retirer : ${esc(flowerInfo(f.type).name)} ${esc(colorName(f.color))}"><i></i>${esc(flowerInfo(f.type).name)}<svg><use href="#i-close"/></svg></button>`;
  function renderChips() {
    const ids = new Set(bState.flowers.map((f) => String(f.id)));
    $$('.chip', chipsEl).forEach((c) => { if (!ids.has(c.dataset.remove)) c.remove(); });
    const have = new Set($$('.chip', chipsEl).map((c) => c.dataset.remove));
    bState.flowers.forEach((f) => { if (!have.has(String(f.id))) chipsEl.insertAdjacentHTML('beforeend', chipHTML(f)); });
  }
  function renderSummary() {
    const n = bState.flowers.length, t = totals();
    $('[data-b-count]').textContent = plural(n, 'fleur', 'fleurs');
    $('[data-b-total]').textContent = price(t.total);
    $('[data-b-total-2]').textContent = price(t.total);
    $('[data-b-flowers-price]').textContent = price(t.fl);
    $('[data-b-count-2]').textContent = n ? '(' + n + ')' : '';
    $('[data-b-base]').textContent = price(BASE);
    $('[data-b-count-max]').textContent = n + ' / ' + MAX;
    preview.classList.toggle('is-empty', n === 0);
    $('[data-b-undo]').disabled = n === 0;
  }
  function syncControls() {
    renderWraps();
    msgEl.value = bState.message || '';
    counterEl.textContent = msgEl.value.length + '/' + msgEl.maxLength;
  }
  function bUpdate(opts) {
    stageStarted = true;
    if (stage) stage.set(bState);
    renderChips();
    renderSummary();
    store.set('fc-bouquet', serialize(bState));
    if (opts && opts.pulse && !reduceMotion) {
      preview.classList.remove('is-pulse');
      void preview.offsetWidth;
      preview.classList.add('is-pulse');
    }
  }

  if (stage) {
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
    papersEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-paper]');
      if (!b) return;
      bState.paper = b.dataset.paper;
      $$('[data-paper]', papersEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      bUpdate();
    });
    ribbonsEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ribbon]');
      if (!b) return;
      bState.ribbon = b.dataset.ribbon;
      $$('[data-ribbon]', ribbonsEl).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      bUpdate();
    });
    msgEl.addEventListener('input', () => {
      bState.message = msgEl.value;
      counterEl.textContent = msgEl.value.length + '/' + msgEl.maxLength;
      bUpdate();
    });

    $('[data-b-surprise]').addEventListener('click', () => {
      const pals = BLD.palettes && BLD.palettes.length ? BLD.palettes : [{ colors: Object.keys(S.colors).slice(0, 3) }];
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const P = pick(pals);
      const focal = ['rose', 'tulipe', 'marguerite', 'cosmos', 'hortensia'].filter((t) => S.flowers[t]);
      const a = pick(focal), b = pick(focal);
      const n = 6 + Math.floor(Math.random() * 6);
      const fl = [];
      for (let i = 0; i < n; i++) {
        const t = i % 3 === 2 ? pick(focal) : i % 2 ? b : a;
        let c = P.colors[i % P.colors.length];
        if (t === 'marguerite' && Math.random() < 0.6) c = pick(['blanc', 'vanille']);
        fl.push([t, c]);
      }
      if (S.flowers.gypsophile && Math.random() < 0.8) fl.push(['gypsophile', 'blanc']);
      if (S.flowers.eucalyptus) fl.push(['eucalyptus']);
      if (S.flowers.lavande && Math.random() < 0.4) fl.push(['lavande', 'lavande']);
      bState = fromPreset({ flowers: fl, paper: P.paper, ribbon: P.ribbon, message: bState.message });
      syncControls();
      bUpdate({ pulse: true });
      toast(`Et voilà une composition surprise${NB}!`);
    });
    $('[data-b-undo]').addEventListener('click', () => {
      if (!bState.flowers.length) return;
      bState.flowers.pop();
      bUpdate();
    });
    $('[data-b-reset]').addEventListener('click', () => {
      bState.flowers = [];
      bState.message = '';
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
        price: totals().total,
        qty: 1,
        bouquet: { flowers: bState.flowers.map((f) => [f.type, f.color]), paper: bState.paper, ribbon: bState.ribbon }
      });
      toast(`Votre bouquet est dans le panier${NB}!`);
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
  }

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
  const occEl = $('[data-occasions]');
  if (occEl) {
    occEl.innerHTML = (S.occasions || []).map((o, i) =>
      `<article class="occasion reveal" style="--i:${i % 3};--bg:${esc(o.bg)}">` +
      `<div class="occ-art">${FC.bouquet(o.preset, { fit: true, aspect: 124 / 140, pad: 6, label: 'Bouquet ' + o.title })}</div>` +
      `<div><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p>` +
      `<button type="button" class="occ-link" data-occ="${esc(o.id)}">Composer ce bouquet <svg><use href="#i-arrow"/></svg></button></div>` +
      '</article>'
    ).join('');
    occEl.addEventListener('click', (e) => {
      const card = e.target.closest('.occasion');
      if (!card || !stage) return;
      const id = $('[data-occ]', card).dataset.occ;
      const o = (S.occasions || []).find((x) => x.id === id);
      if (!o) return;
      bState = fromPreset(o.preset);
      syncControls();
      renderChips();
      renderSummary();
      $('#bouquet').scrollIntoView({ behavior: smooth, block: 'start' });
      setTimeout(() => bUpdate({ pulse: true }), reduceMotion ? 0 : 650);
      toast(`Composition «${NB}${o.title}${NB}» prête${NB}: ajustez-la à votre goût`);
    });
  }

  /* ------------------------------------------------------------------ *
   * Avis (seulement s'il y en a de vrais dans data.js)
   * ------------------------------------------------------------------ */
  if (S.reviews && S.reviews.length) {
    const sec = $('#avis');
    sec.hidden = false;
    $('[data-reviews]', sec).innerHTML = S.reviews.map((r, i) =>
      `<figure class="review reveal" style="--i:${i % 3}"><blockquote>«${NB}${esc(r.text)}${NB}»</blockquote><figcaption>— ${esc(r.name)}${r.occasion ? ', ' + esc(r.occasion) : ''}</figcaption></figure>`
    ).join('');
  }

  /* ------------------------------------------------------------------ *
   * Instagram
   * ------------------------------------------------------------------ */
  const instaEl = $('[data-insta]');
  if (instaEl) {
    const photos = (S.instagram && S.instagram.photos) || [];
    const tiles = photos.length
      ? photos.slice(0, 6).map((ph) => ({ bg: '#F8E1E6', html: `<img src="${esc(ph.src)}" alt="${esc(ph.alt || '')}" loading="lazy" decoding="async">`, label: ph.alt }))
      : [
          { bg: '#F8E4E9', html: FC.icon('rose', FC.hex('rose')), label: 'Rose spirale' },
          { bg: '#E3EDF8', html: FC.bouquet({ paper: 'ciel', ribbon: 'ivoire', flowers: [['hortensia', 'ciel'], ['hortensia', 'blanc'], ['rose', 'ciel'], ['marguerite', 'blanc'], ['gypsophile', 'blanc'], ['eucalyptus']] }, { fit: true, aspect: 1, pad: 8, label: 'Bouquet bleu ciel' }), label: 'Bouquet bleu ciel' },
          { bg: '#F1EAF8', html: FC.bouquet({ container: 'none', ribbon: 'lilas', flowers: [['tulipe', 'lilas'], ['tulipe', 'rose'], ['tulipe', 'lavande']] }, { fit: true, aspect: 1, pad: 8, label: 'Trois tulipes' }), label: 'Trois tulipes' },
          { bg: '#F6F0D8', html: FC.bouquet({ container: 'pot', pot: 'lilas', flowers: [['cosmos', 'rose'], ['marguerite', 'blanc'], ['cosmos', 'peche'], ['eucalyptus']] }, { fit: true, aspect: 1, pad: 8, label: 'Petit pot fleuri' }), label: 'Petit pot fleuri' },
          { bg: '#E2F1E7', html: FC.icon('hortensia', FC.hex('lilas')), label: 'Hortensia lilas' },
          { bg: '#FBEBDD', html: FC.atelier(), label: 'Dans l’atelier' }
        ];
    instaEl.innerHTML = tiles.map((t, i) =>
      `<a class="insta-tile reveal" style="--i:${i};--bg:${t.bg}" href="${IG_URL}" target="_blank" rel="noopener" aria-label="Voir sur Instagram${t.label ? ' : ' + esc(t.label) : ''}">` +
      `<span class="insta-art">${t.html}</span><span class="insta-over"><svg><use href="#i-instagram"/></svg></span></a>`
    ).join('');
  }

  /* ------------------------------------------------------------------ *
   * Accueil : bouquet, pétales, papillons, nouveauté
   * ------------------------------------------------------------------ */
  const heroEl = $('[data-hero-bouquet]');
  if (heroEl && S.hero && S.hero.bouquet) {
    heroEl.innerHTML = FC.bouquet(S.hero.bouquet, { animate: !reduceMotion, gentle: PREVIEW, mascot: true, viewBox: '0 40 400 470', label: 'Bouquet pastel de fleurs en fil chenille, emballé dans du papier rose' });
  }
  const petalsEl = $('[data-petals]');
  if (petalsEl && !reduceMotion) {
    const cols = ['#F3C4CF', '#D9CBF0', '#F8CDB5', '#C9DDF2', '#F7E6B0', '#C6E6D3'];
    let html = '';
    for (let i = 0; i < 9; i++) {
      html += `<span class="petal" style="--x:${(6 + Math.random() * 86).toFixed(1)}%;--s:${(9 + Math.random() * 9).toFixed(1)}px;--c:${cols[i % cols.length]};--t:${(10 + Math.random() * 8).toFixed(1)}s;--d:${(-Math.random() * 16).toFixed(1)}s;--dx:${(-50 + Math.random() * 100).toFixed(0)}px;--r:${(200 + Math.random() * 360).toFixed(0)}deg"></span>`;
    }
    petalsEl.innerHTML = html;
  }
  $$('[data-butterfly]').forEach((el) => { el.innerHTML = FC.butterfly(el.getAttribute('data-butterfly')); });
  const atelierEl = $('[data-atelier]');
  if (atelierEl) atelierEl.innerHTML = FC.atelier();

  const featured = findProduct(S.hero && S.hero.featured) || S.products[0];
  const chip = $('[data-featured]');
  if (chip && featured) {
    $('[data-featured-name]', chip).textContent = featured.name;
    $('small', chip).textContent = featured.badge || 'À découvrir';
    $('[data-featured-art]', chip).innerHTML = productArt(featured, 0, { aspect: 1, pad: 6 });
    $('[data-featured-art]', chip).style.background = featured.bg || '';
    chip.setAttribute('aria-label', 'Découvrir : ' + featured.name);
    chip.addEventListener('click', () => openProduct(featured.id));
  } else if (chip) {
    chip.hidden = true;
  }

  /* ------------------------------------------------------------------ *
   * Clavier : Échap & piège de focus
   * ------------------------------------------------------------------ */
  function trap(container, e) {
    const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
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
    }
  });

  /* ------------------------------------------------------------------ *
   * Mention « aperçu » (version claude.ai uniquement)
   * ------------------------------------------------------------------ */
  if (PREVIEW) {
    const pill = document.createElement('div');
    pill.className = 'preview-pill';
    pill.setAttribute('role', 'note');
    pill.innerHTML = '<svg aria-hidden="true"><use href="#i-info"/></svg><span>Aperçu : textes, prix et visuels d’exemple</span>' +
      '<button type="button" aria-label="Masquer ce message"><svg aria-hidden="true"><use href="#i-close"/></svg></button>';
    $('button', pill).addEventListener('click', () => pill.remove());
    document.body.appendChild(pill);
  }

  /* ------------------------------------------------------------------ *
   * Démarrage
   * ------------------------------------------------------------------ */
  renderFilters();
  renderProducts();
  renderCart();
  reveal(document);
  loadFromHash();
})();
