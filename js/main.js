/* =========================================================
   ИП ООО «Минавто» — рендеринг главной страницы (index.html)
   Зависимости: js/data.js (window.MinavtoData, window.MINAVTO_DEFAULTS)
   ========================================================= */
(function(){
  'use strict';

  const esc = window.MinavtoData.escapeHtml;
  const data = window.MinavtoData.load();

  /* ---------- HERO bg presets ---------- */
  const HERO_PRESETS = {
    default: '',
    navy: 'linear-gradient(135deg,#0a1f44,#1d5fd6)',
    steel: 'linear-gradient(120deg,#0b0e14 0%,#0e2a5c 60%,#1d5fd6 100%)',
    grid: 'linear-gradient(100deg,rgba(10,31,68,.95),rgba(29,95,214,.45)),repeating-linear-gradient(45deg,#123063 0 12px,#0e2a5c 12px 24px)',
    dark: 'linear-gradient(180deg,#0b0e14,#0a1f44)'
  };

  function applyHeroBg(el, bg){
    if (!bg || bg === 'default'){
      el.style.background = ''; // CSS preset из style.css
      return;
    }
    if (HERO_PRESETS[bg]){
      el.style.background = HERO_PRESETS[bg];
      return;
    }
    // Пользовательское изображение (data-URL или URL)
    el.style.background =
      'linear-gradient(100deg,rgba(10,31,68,.9),rgba(14,42,92,.8) 55%,rgba(29,95,214,.5) 100%), url("' + bg + ') center/cover no-repeat';
  }

  document.addEventListener('DOMContentLoaded', function(){
    render(data);
    initUI();
  });

  function render(d){
    /* Topbar */
    setText('#topbar-left', d.topbar.left);
    setText('#topbar-right', d.topbar.right);

    /* Hero */
    const hero = document.querySelector('.hero');
    setText('#hero-kicker', d.hero.kicker);
    const h1 = document.getElementById('hero-title');
    h1.innerHTML = esc(d.hero.title1) + ' <em>' + esc(d.hero.titleEm) + '</em> ' + esc(d.hero.title2);
    setText('#hero-lead', d.hero.lead);
    setText('#hero-btn1', d.hero.btnPrimary);
    setText('#hero-btn2', d.hero.btnSecondary);
    applyHeroBg(hero, d.hero.bg);
    const badges = document.getElementById('hero-badges');
    badges.innerHTML = d.hero.badges.map(b =>
      '<div class="badge"><b>' + esc(b.t) + '</b>' + esc(b.d) + '</div>').join('');

    /* Strip */
    const strip = document.getElementById('strip-grid');
    strip.innerHTML = d.strip.map(s =>
      '<div class="strip-item"><b>' + esc(s.n) + '</b><span>' + esc(s.t) + '</span></div>').join('');

    /* About */
    setText('#about-kicker', d.about.kicker);
    setText('#about-title', d.about.title);
    const aboutBody = document.getElementById('about-body');
    aboutBody.innerHTML = d.about.paragraphs.map(p => '<p>' + p + '</p>').join('') +
      '<blockquote>' + esc(d.about.quote) + '</blockquote>';
    const aside = document.getElementById('about-aside');
    aside.innerHTML = d.about.aside.map(a =>
      '<div class="cert"><div class="seal">' + esc(a.seal) + '</div><div><b>' +
      esc(a.title) + '</b><small>' + esc(a.text) + '</small></div></div>').join('');

    /* Services */
    setText('#services-kicker', d.services.kicker);
    setText('#services-title', d.services.title);
    setText('#services-sub', d.services.sub);
    const svcGrid = document.getElementById('services-grid');
    svcGrid.innerHTML = d.services.items.map(s =>
      '<div class="card"><div class="icon">' + esc(s.icon) + '</div><h3>' + esc(s.title) + '</h3>' +
      '<p>' + esc(s.desc) + '</p><ul class="svc-list">' +
      s.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>').join('');

    /* Applications */
    setText('#apps-kicker', d.apps.kicker);
    setText('#apps-title', d.apps.title);
    setText('#apps-sub', d.apps.sub);
    const appsGrid = document.getElementById('apps-grid');
    appsGrid.innerHTML = d.apps.items.map(a =>
      '<div class="app-card"><div class="icon">' + esc(a.icon) + '</div><b>' + esc(a.title) + '</b>' +
      '<span>' + esc(a.desc) + '</span></div>').join('');

    /* Process */
    setText('#process-kicker', d.process.kicker);
    setText('#process-title', d.process.title);
    setText('#process-sub', d.process.sub);
    const steps = document.getElementById('steps');
    steps.innerHTML = d.process.steps.map(s =>
      '<div class="step"><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>').join('');

    /* Quality (портфолио сертификатов) */
    setText('#quality-kicker', d.quality.kicker);
    setText('#quality-title', d.quality.title);
    setText('#quality-sub', d.quality.sub);
    renderCerts(d.quality.certs, 'all');
    renderFilters(d.quality.certs);

    /* Contacts */
    setText('#contacts-kicker', d.contacts.kicker);
    setText('#contacts-title', d.contacts.title);
    setText('#contacts-sub', d.contacts.sub);
    const rows = [];
    rows.push(row('Наименование', esc(d.contacts.company)));
    rows.push(row('Адрес', esc(d.contacts.address)));
    d.contacts.phones.forEach(p => {
      rows.push(row(esc(p.label), '<a href="tel:' + esc(p.tel) + '">' + esc(p.display) + '</a>'));
    });
    d.contacts.emails.forEach(e => {
      rows.push(row(esc(e.label), '<a href="mailto:' + esc(e.value) + '">' + esc(e.value) + '</a>'));
    });
    rows.push(row('Сайт', '<a href="https://' + esc(d.contacts.site) + '" target="_blank" rel="noopener">' + esc(d.contacts.site) + '</a>'));
    rows.push(row('УНП', esc(d.contacts.unp)));
    rows.push(row('Режим работы', esc(d.contacts.hours)));
    rows.push(row('Направления', esc(d.contacts.directions)));
    document.getElementById('contacts-table').innerHTML = rows.join('');
    document.getElementById('map-frame').querySelector('iframe').src = d.contacts.mapSrc;

    /* Footer contacts (первые телефон и e-mail) */
    const fTel = d.contacts.phones[0];
    const fSales = d.contacts.phones[1] || fTel;
    const fMail = d.contacts.emails[0];
    setText('#foot-address', d.contacts.address);
    if (fTel) setHTML('#foot-tel', '<a href="tel:' + esc(fTel.tel) + '">' + esc(fTel.display) + '</a>');
    if (fSales) setHTML('#foot-sales', '<a href="tel:' + esc(fSales.tel) + '">Отдел сбыта: ' + esc(fSales.display) + '</a>');
    if (fMail) setHTML('#foot-mail', '<a href="mailto:' + esc(fMail.value) + '">' + esc(fMail.value) + '</a>');
    setText('#foot-desc', d.footer.description);
    setHTML('#foot-copy', d.footer.copyright.replace('{year}', new Date().getFullYear()));
    setText('#foot-legal', d.footer.legal);
  }

  function row(th, td){ return '<tr><th>' + th + '</th><td>' + td + '</td></tr>'; }

  /* ---------- Quality rendering ---------- */
  let currentFilter = 'all';
  function renderCerts(certs, filter){
    const list = filter === 'all' ? certs : certs.filter(c => c.type === filter);
    const grid = document.getElementById('q-grid');
    grid.innerHTML = list.map((c, i) =>
      '<div class="q-card" data-idx="' + certs.indexOf(c) + '">' +
        '<div class="q-thumb">' +
          '<span class="q-type-tag">' + esc(c.type) + '</span>' +
          '<div class="q-doc"><div class="q-doc-head">' + esc(c.name) + '</div>' +
            '<i class="w85"></i><i class="w70"></i><i class="w85"></i><i class="w50"></i><i class="w70"></i><i class="w85"></i><i class="w50"></i>' +
            '<div class="q-seal">' + esc(c.org.split(' ')[0]) + '</div>' +
          '</div>' +
          '<div class="q-zoom">🔍</div>' +
        '</div>' +
        '<div class="q-info"><h3>' + esc(c.name) + '</h3><p>' + esc(c.org) + '</p>' +
          '<div class="q-meta"><span>№ ' + esc(c.num) + ' · ' + esc(c.year) + '</span>' +
          '<span class="q-status">' + esc(c.status) + '</span></div>' +
        '</div>' +
      '</div>').join('') || '<p class="sub">Нет сертификатов данного типа.</p>';

    grid.querySelectorAll('.q-card').forEach(card => {
      card.addEventListener('click', () => openCertModal(certs[+card.dataset.idx]));
    });
  }

  function renderFilters(certs){
    const box = document.getElementById('q-filters');
    const types = ['Все', ...new Set(certs.map(c => c.type))];
    box.innerHTML = types.map((t, i) =>
      '<button class="q-filter' + (i === 0 ? ' active' : '') + '" data-type="' +
      esc(i === 0 ? 'all' : t) + '">' + esc(t) + '</button>').join('');
    box.querySelectorAll('.q-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        box.querySelectorAll('.q-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.type;
        renderCerts(window.__minavtoData.quality.certs, currentFilter);
      });
    });
  }

  function openCertModal(c){
    const modal = document.getElementById('cert-modal');
    document.getElementById('modal-title').textContent = c.name;
    document.getElementById('modal-doc-name').textContent = c.name;
    document.getElementById('modal-doc-org').textContent = c.org;
    document.getElementById('modal-info').innerHTML =
      '<tr><td>Тип</td><td>' + esc(c.type) + '</td></tr>' +
      '<tr><td>Орган сертификации</td><td>' + esc(c.org) + '</td></tr>' +
      '<tr><td>Номер</td><td>' + esc(c.num) + '</td></tr>' +
      '<tr><td>Год получения</td><td>' + esc(c.year) + '</td></tr>' +
      '<tr><td>Статус</td><td>' + esc(c.status) + '</td></tr>' +
      '<tr><td>Примечание</td><td>' + esc(c.note) + '</td></tr>';
    modal.classList.add('open');
  }

  /* ---------- UI init ---------- */
  function initUI(){
    window.__minavtoData = data;

    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    burger.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

    const toTop = document.getElementById('toTop');
    addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 500), {passive:true});
    toTop.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

    const modal = document.getElementById('cert-modal');
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    document.getElementById('modal-close').addEventListener('click', () => modal.classList.remove('open'));
    addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
  }

  /* ---------- DOM helpers ---------- */
  function setText(sel, txt){ const el = document.querySelector(sel); if (el) el.textContent = txt; }
  function setHTML(sel, html){ const el = document.querySelector(sel); if (el) el.innerHTML = html; }
})();
