(function () {
  'use strict';

  /* ---- hotspots: one active at a time ---- */
  var NAV = [
    ['Operations', '6 pages — a timetable per campus, the farm school diary and the student pipeline.'],
    ['Finance', '6 pages — invoice and pay review, Xero exports, PAYE overage hours.'],
    ['Management', '13 pages — students, staff, attendance, pairings, capacity and dashboards.'],
    ['Buttons', '4 pages — generate sessions, invoices and pay, with documentation.']
  ];
  var showEls = Array.from(document.querySelectorAll('[data-show]'));
  var hideEls = Array.from(document.querySelectorAll('[data-hide-on]'));
  var navImgs = Array.from(document.querySelectorAll('.navpop-shot img'));
  var navBars = Array.from(document.querySelectorAll('.navcard-bars span'));
  var navNum = document.querySelector('[data-nav="num"]');
  var navName = document.querySelector('[data-nav="name"]');
  var navDesc = document.querySelector('[data-nav="desc"]');
  var hot = null, navI = 0, navOpenedAt = 0;

  function setHot(k) {
    hot = k;
    showEls.forEach(function (el) { el.classList.toggle('is-on', el.dataset.show === k); });
    hideEls.forEach(function (el) { el.classList.toggle('is-off', k !== null && el.dataset.hideOn.split(' ').indexOf(k) > -1); });
  }

  function renderNav() {
    navImgs.forEach(function (img, i) { img.classList.toggle('is-on', i === navI); });
    navBars.forEach(function (bar, i) { bar.classList.toggle('is-on', i <= navI); });
    if (navNum) navNum.textContent = navI + 1;
    if (navName) navName.textContent = NAV[navI][0];
    if (navDesc) navDesc.textContent = NAV[navI][1];
  }
  // The sidebar only changes when the visitor asks: opening shows interface 1,
  // each further activation of the same "+" steps to the next one.
  function openNav() {
    if (hot === 'nav') return;
    navI = 0; renderNav(); setHot('nav');
    navOpenedAt = performance.now();
  }
  function nextNav() {
    // A tap fires mouseenter/focus and click together; don't let that single
    // gesture both open the panel and skip past interface 1.
    if (hot !== 'nav') { openNav(); return; }
    if (performance.now() - navOpenedAt < 400) return;
    navI = (navI + 1) % NAV.length; renderNav();
  }
  function on(k) { if (k === 'nav') openNav(); else setHot(k); }
  function off() { setHot(null); }

  document.querySelectorAll('.hs[data-hot]').forEach(function (btn) {
    var k = btn.dataset.hot;
    btn.addEventListener('mouseenter', function () { on(k); });
    btn.addEventListener('focus', function () { on(k); });
    btn.addEventListener('mouseleave', off);
    btn.addEventListener('blur', off);
    btn.addEventListener('click', function () { if (k === 'nav') nextNav(); else on(k); });
  });

  /* ---- timetable: hide the scroll hint once the viewer scrolls ---- */
  var tt = document.querySelector('.tt');
  var ttScroll = tt && tt.querySelector('.tt-scroll');
  if (ttScroll) {
    ttScroll.addEventListener('scroll', function () { tt.classList.toggle('scrolled', ttScroll.scrollTop > 40); }, { passive: true });
  }

  /* ---- session generator ---- */
  var GEN_TOTAL = 1100, CELLS = 60, DURATION = 1800;
  var CELL_COLS = (function () { var out = [], s = 7; for (var i = 0; i < CELLS; i++) { s = (s * 9301 + 49297) % 233280; var r = s / 233280; out.push(r < .22 ? '#fbbf24' : r < .62 ? '#c9f0d2' : '#dbe6fb'); } return out; })();
  var CELL_ORDER = (function () { var a = [], s = 3, i; for (i = 0; i < CELLS; i++) a.push(i); for (i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } var rank = []; a.forEach(function (c, idx) { rank[c] = idx; }); return rank; })();

  var genBtn = document.getElementById('gen-btn');
  var genNum = document.getElementById('gen-num');
  var genLog = document.getElementById('gen-log');
  var genDot = document.getElementById('gen-dot');
  var genWeek = document.getElementById('gen-week');
  var cellWrap = document.getElementById('gen-cells');
  if (!genBtn || !genNum || !genLog || !genDot || !genWeek || !cellWrap) return;

  var cells = [];
  for (var c = 0; c < CELLS; c++) { var span = document.createElement('span'); cellWrap.appendChild(span); cells.push(span); }

  var gen = 'idle', genP = 0;
  var fmt = function (n) { return n.toLocaleString('en-GB'); };

  function renderGen() {
    var filled = gen === 'idle' ? 0 : gen === 'running' ? Math.round(genP * CELLS) : CELLS;
    var count = Math.round(genP * GEN_TOTAL);
    genNum.textContent = gen === 'running' ? fmt(count) : '1,100+';
    genBtn.textContent = gen === 'idle' ? 'Generate sessions' : gen === 'running' ? 'Generating…' : 'Run again';
    genBtn.classList.toggle('rerun', gen === 'rerun');
    genLog.textContent = gen === 'idle' ? 'ready · press to generate the term'
      : gen === 'running' ? 'creating ' + fmt(count) + ' sessions…'
      : gen === 'done' ? '1,100+ created · 0 duplicates'
      : 'rerun · 0 created — every session already exists';
    genDot.style.background = gen === 'idle' ? '#9ca3af' : gen === 'running' ? '#f59e0b' : gen === 'done' ? '#16a34a' : 'oklch(58% 0.19 292)';
    genWeek.textContent = gen === 'idle' ? 'Term 1 · empty' : 'Term 1 · weeks 1–7';
    cells.forEach(function (cell, i) {
      var isOn = CELL_ORDER[i] < filled;
      cell.classList.toggle('is-on', isOn);
      cell.style.background = isOn ? CELL_COLS[i] : '';
    });
  }

  genBtn.addEventListener('click', function () {
    if (gen === 'running') return;
    if (gen !== 'idle') { gen = 'rerun'; renderGen(); return; }
    var t0 = performance.now();
    gen = 'running'; genP = 0; renderGen();
    function step(now) {
      var p = Math.min(1, (now - t0) / DURATION);
      genP = 1 - Math.pow(1 - p, 3);
      if (p >= 1) gen = 'done';
      renderGen();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  renderGen();
})();
