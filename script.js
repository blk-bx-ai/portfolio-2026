'use strict';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── 1. HERO ENTRANCE ────────────────────────────────────────────────────────
// Staggered fade-up on each hero element as soon as the page paints.

(function () {
  if (prefersReduced) return;

  const items = [
    ['.eyebrow',      0],
    ['.hero-title', 200],
    ['.hero-sub',   420],
    ['.hero .btn',  580],
  ];

  items.forEach(([sel, delay]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    // Set hidden state synchronously so there is no flash
    el.style.cssText +=
      ';opacity:0;transform:translateY(22px)' +
      ';transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)';
    setTimeout(() => {
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, delay + 60); // +60 ms paint buffer
  });
})();


// ─── 2. SCROLL REVEAL ────────────────────────────────────────────────────────
// IntersectionObserver fades elements up as they enter the viewport.
// Stagger groups (portfolio cards, story blocks, etc.) animate sequentially.

(function () {
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  function prime(el) {
    if (prefersReduced) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity .72s ${EASE}, transform .72s ${EASE}`;
  }

  function reveal(el, delay) {
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal(entry.target, parseInt(entry.target.dataset.revealDelay || '0'));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  // Single elements
  [
    '.story-left',
    '.portfolio .section-label',
    '.portfolio .section-title',
    '.portfolio-intro',
    '.stack .section-title',
    '.stack-grid',
    '.audience .section-label',
    '.audience .section-title',
    '.contact .section-label',
    '.contact .section-title',
    '.trust-cluster',
  ].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    prime(el);
    io.observe(el);
  });

  // Staggered groups: [parentSelector, childSelector, msPerStep]
  [
    ['.story-right',    '.story-block',   120],
    ['.portfolio-grid', '.story-block',   140],
    ['.spec-list',      '.spec-item',     160],
  ].forEach(([parentSel, childSel, step]) => {
    const parent = document.querySelector(parentSel);
    if (!parent) return;
    parent.querySelectorAll(childSel).forEach((el, i) => {
      prime(el);
      el.dataset.revealDelay = String(i * step);
      io.observe(el);
    });
  });
})();


// ─── 3. NAV SCROLL STATE ─────────────────────────────────────────────────────
// Adds .scrolled to the nav when the user scrolls past 24 px,
// darkening the background slightly.

(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


// ─── 9. AIRTABLE DUAL MODAL ──────────────────────────────────────────────────
// Reads data-modal attribute on trigger buttons to open the matching modal by
// ID. Closes on X button (.modal-close), backdrop click, or Escape key.

(function () {
  let activeModal = null;

  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    activeModal = overlay;
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    activeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeModal = null;
  }

  // All trigger buttons — data-modal value is the target modal ID
  document.querySelectorAll('[data-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(btn.dataset.modal);
    });
  });

  // X close buttons (one per modal)
  document.querySelectorAll('.modal-close').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  // Backdrop click to close
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  });

  // Escape key to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();


// ─── 10. MOBILE NAV ──────────────────────────────────────────────────────────
// Toggles .nav-open on the nav element when the hamburger is clicked.
// Closes automatically when any nav link is tapped.

(function () {
  const nav    = document.querySelector('.nav');
  const toggle = document.querySelector('.mobile-toggle');
  if (!nav || !toggle) return;

  function openMenu() {
    nav.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('nav-open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    nav.classList.contains('nav-open') ? closeMenu() : openMenu();
  });

  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();
