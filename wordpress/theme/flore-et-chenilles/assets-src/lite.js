/*!
 * Flore & Chenilles — pages de la boutique (fiche, panier, commande, compte, pages légales).
 * En-tête, chenille de progression, menu mobile et apparitions, comme sur l'accueil.
 */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const FC = window.FC_FLOWERS;

  const header = $('.site-header');
  const crawl = $('.crawl');
  const bug = $('[data-caterpillar]');
  if (bug && FC && FC.caterpillar) bug.innerHTML = FC.caterpillar();
  let lastY = window.scrollY, ticking = false, t = 0;
  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (crawl) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      crawl.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, y / max)).toFixed(4) : '0');
      if (Math.abs(y - lastY) > 1) {
        crawl.classList.toggle('is-back', y < lastY);
        crawl.classList.add('is-crawling');
        clearTimeout(t);
        t = setTimeout(() => crawl.classList.remove('is-crawling'), 220);
      }
    }
    lastY = y;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const burger = $('.burger');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (open) document.documentElement.style.setProperty('--sbw', window.innerWidth - document.documentElement.clientWidth + 'px');
    document.body.classList.toggle('no-scroll', open);
  }
  if (burger) burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  if (menu) $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 980) setMenu(false); });

  $$('.reveal').forEach((el) => el.classList.add('is-in'));
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

})();
