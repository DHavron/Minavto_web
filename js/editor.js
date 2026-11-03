/* =========================================================
   ИП ООО «Минавто» — редактор сайта (editor.index)
   Зависимости: js/data.js
   Возможности: hero-фон (пресеты + загрузка), редактирование
   подпунктов разделов, сертификаты (Качество), телефоны и e-mail.
   ========================================================= */
(function(){
  'use strict';

  const esc = window.MinavtoData.escapeHtml;
  const KEY_PASS = 'minavto_editor_pass';
  const KEY_AUTH = 'minavto_editor_auth';
  let data = window.MinavtoData.load();

  /* ---------- Hero фоны ---------- */
  const HERO_BGS = [
    { id:'default', label:'Стандартный (сетка)', css:'linear-gradient(100deg,rgba(10,31,68,.95),rgba(14,42,92,.88) 55%,rgba(29,95,214,.45)),repeating-linear-gradient(45deg,#123063 0 12px,#0e2a5c 12px 24px)' },
    { id:'navy',    label:'Синий градиент',      css:'linear-gradient(135deg,#0a1f44,#1d5fd6)' },
    { id:'steel',   label:'Сталь (чёрный→синий)',css:'linear-gradient(120deg,#0b0e14 0%,#0e2a5c 60%,#1d5fd6 100%)' },
    { id:'dark',    label:'Чёрный → тёмно-синий',css:'linear-gradient(180deg,#0b0e14,#0a1f44)' }
  ];

  /* ================= Экран входа ================= */
  function getPassword(){ return localStorage.getItem(KEY_PASS) || 'admin'; }

  function showLock(){
    document.getElementById('lock').style.display = 'grid';
    document.getElementById('app').style.display = 'none';
    const inp = document.getElementById('pass-input');
    inp.value = ''; inp.focus();
    document.getElementById('pass-form').onsubmit = function(e){
      e.preventDefault();
      if (inp.value === getPassword()){
        sessionStorage.setItem(KEY_AUTH, '1');
        document.getElementById('lock-err').style.display = 'none';
        startApp();
      } else {
        document.getElementById('lock-err').style.display = 'block';
      }
    };
  }

  /* ================= Инициализация ================= */
  function startApp(){
    document.getElementById('lock').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    buildTabs();
    renderAll();
    bindGlobal();
  }

  document.addEventListener('DOMContentLoaded', function(){
    if (sessionStorage.getItem(KEY_AUTH) === '1') startApp();
    else showLock();
  });

  /* ================= Вкладки ================= */
  const TABS = [
    { id:'hero',     label:'Hero-блок' },
    { id:'sections', label:'Разделы и подпункты' },
    { id:'quality',  label:'Качество (сертификаты)' },
    { id:'contacts', label:'Контакты' },
    { id:'settings', label:'Настройки' }
  ];

  function buildTabs(){
    const box = document.getElementById('ed-tabs');
    box.innerHTML = TABS.map((t,i) =>
      '<button class="ed-tab' + (i===0?' active':'') + '" data-tab="'+t.id+'">'+esc(t.label)+'</button>').join('');
    box.querySelectorAll('.ed-tab').forEach(btn => btn.addEventListener('click', () => {
      box.querySelectorAll('.ed-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    }));
  }

  /* ================= Рендер панелей ================= */
  function renderAll(){
    renderHero();
    renderSections();
    renderQuality();
    renderContacts();
    renderSettings();
  }

  /* ---- Hero ---- */
  function renderHero(){
    const h = data.hero;
    const P = document.getElementById('panel-hero');
    P.innerHTML =
      '<div class="block"><h2>Тексты Hero <span class="tag">главный экран</span></h2>' +
      field('kicker','Kicker (надзаголовок)', h.kicker) +
      '<div class="row3">' +
        field('title1','Заголовок — часть 1', h.title1) +
        field('titleEm','Заголовок — выделенный фрагмент', h.titleEm) +
        field('title2','Заголовок — часть 2', h.title2) +
      '</div>' +
      field('lead','Вводный текст', h.lead, 'textarea') +
      '<div class="row">' + field('btnPrimary','Текст кнопки 1', h.btnPrimary) +
      field('btnSecondary','Текст кнопки 2', h.btnSecondary) + '</div>' +
      '</div>' +

      '<div class="block"><h2>Бейджи под текстом <span class="tag">'+h.badges.length+' шт.</span></h2><div id="badges-list"></div>' +
      '<button class="btn light" id="add-badge">+ Добавить бейдж</button></div>' +

      '<div class="block"><h2>Фон Hero</h2>' +
      '<p class="hint" style="margin-bottom:.8rem">Выберите готовый фон или загрузите своё изображение (сохранится в браузере).</p>' +
      '<div class="bg-presets" id="bg-presets"></div>' +
      '<div class="upload-row">' +
        '<input type="file" id="bg-upload" accept="image/*">' +
        '<img class="upload-preview" id="bg-preview" alt="Предпросмотр фона">' +
      '</div>' +
      '<button class="btn light small" id="bg-reset" style="margin-top:.8rem">Сбросить на стандартный</button>' +
      '</div>';

    // поля hero
    ['kicker','title1','titleEm','title2','lead','btnPrimary','btnSecondary'].forEach(k=>{
      bindInput('#f-hero-'+k, v => { data.hero[k] = v; });
    });

    // бейджи
    const bl = document.getElementById('badges-list');
    function drawBadges(){
      bl.innerHTML = h.badges.map((b,i)=>
        '<div class="item"><div class="item-head"><b>Бейдж '+(i+1)+'</b>' +
        '<div class="item-actions"><button class="btn danger small" data-del="'+i+'">Удалить</button></div></div>' +
        '<div class="row">' + field('b-t-'+i,'Заголовок', b.t) + field('b-d-'+i,'Описание', b.d) + '</div></div>').join('');
      bl.querySelectorAll('[data-del]').forEach(btn=>btn.addEventListener('click',()=>{
        h.badges.splice(+btn.dataset.del,1); drawBadges(); toast('Бейдж удалён');
      }));
      h.badges.forEach((b,i)=>{
        bindInput('#f-b-t-'+i, v=>{b.t=v;});
        bindInput('#f-b-d-'+i, v=>{b.d=v;});
      });
    }
    drawBadges();
    document.getElementById('add-badge').addEventListener('click', ()=>{
      h.badges.push({t:'Новый бейдж', d:'Описание'}); drawBadges();
    });

    // фоны
    const presets = document.getElementById('bg-presets');
    presets.innerHTML = HERO_BGS.map(p=>
      '<div class="bg-preset'+(data.hero.bg===p.id?' selected':'')+'" data-bg="'+p.id+'" style="background:'+p.css+'"><span>'+esc(p.label)+'</span></div>').join('');
    presets.querySelectorAll('.bg-preset').forEach(el=>el.addEventListener('click',()=>{
      data.hero.bg = el.dataset.bg;
      presets.querySelectorAll('.bg-preset').forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      hideCustomPreview();
      toast('Фон выбран');
    }));

    document.getElementById('bg-upload').addEventListener('change', function(){
      const f = this.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = e => {
        data.hero.bg = e.target.result;
        presets.querySelectorAll('.bg-preset').forEach(x=>x.classList.remove('selected'));
        const pv = document.getElementById('bg-preview');
        pv.src = e.target.result; pv.style.display='block';
        toast('Изображение загружено');
      };
      r.readAsDataURL(f);
    });
    document.getElementById('bg-reset').addEventListener('click', ()=>{
      data.hero.bg = 'default'; renderHero(); toast('Фон сброшен');
    });
    if (isCustomBg()){
      const pv = document.getElementById('bg-preview');
      pv.src = data.hero.bg; pv.style.display='block';
    }
  }
  function isCustomBg(){ return data.hero.bg && !HERO_BGS.some(p=>p.id===data.hero.bg); }
  function hideCustomPreview(){ const pv=document.getElementById('bg-preview'); pv.style.display='none'; }

  /* ---- Разделы и подпункты ---- */
  function renderSections(){
    const P = document.getElementById('panel-sections');
    P.innerHTML =
      sectionBlock('strip','Цифры (полоса под Hero)','strip') +
      sectionBlock('services','Услуги','services') +
      sectionBlock('apps','Продукция и отрасли','apps') +
      sectionBlock('process','Как мы работаем','process');

    bindSectionHead('services', data.services);
    bindSectionHead('apps', data.apps);
    bindSectionHead('process', data.process);

    // strip items
    const sBox = document.getElementById('items-strip');
    sBox.innerHTML = data.strip.map((s,i)=>
      '<div class="item"><div class="item-head"><b>Показатель '+(i+1)+'</b>'+delBtn('strip',i)+'</div>'+
      '<div class="row">'+field('st-n-'+i,'Число / текст',s.n)+field('st-t-'+i,'Подпись',s.t)+'</div></div>').join('');
    wireItems(sBox, data.strip, ['n','t'], 'st');
    addBtn('add-strip-item', ()=>{ data.strip.push({n:'0',t:'Новый показатель'}); renderSections(); });
    delHandler(sBox, data.strip, renderSections);

    // services items
    const svBox = document.getElementById('items-services');
    svBox.innerHTML = data.services.items.map((s,i)=>
      '<div class="item"><div class="item-head"><b>Услуга '+(i+1)+': '+esc(s.title)+'</b>'+delBtn('svc',i)+'</div>'+
      '<div class="row">'+field('sv-icon-'+i,'Иконка (эмодзи)',s.icon)+field('sv-title-'+i,'Название',s.title)+'</div>'+
      field('sv-desc-'+i,'Описание',s.desc)+
      '<label style="font-size:.82rem;font-weight:600;color:var(--navy-2)">Подпункты (каждый с новой строки)</label>'+
      '<textarea id="f-sv-points-'+i+'" rows="5">'+esc(s.points.join('\n'))+'</textarea></div>').join('');
    data.services.items.forEach((s,i)=>{
      bindInput('#f-sv-icon-'+i,v=>{s.icon=v;});
      bindInput('#f-sv-title-'+i,v=>{s.title=v;});
      bindInput('#f-sv-desc-'+i,v=>{s.desc=v;});
      bindInput('#f-sv-points-'+i,v=>{s.points=v.split('\n').map(x=>x.trim()).filter(Boolean);});
    });
    delHandler(svBox, data.services.items, renderSections);
    addBtn('add-service', ()=>{ data.services.items.push({icon:'🔧',title:'Новая услуга',desc:'Описание',points:['Подпункт 1']}); renderSections(); });

    // apps items
    const apBox = document.getElementById('items-apps');
    apBox.innerHTML = data.apps.items.map((a,i)=>
      '<div class="item"><div class="item-head"><b>Направление '+(i+1)+'</b>'+delBtn('app',i)+'</div>'+
      '<div class="row">'+field('ap-icon-'+i,'Иконка',a.icon)+field('ap-title-'+i,'Название',a.title)+'</div>'+
      field('ap-desc-'+i,'Описание',a.desc,'textarea')+'</div>').join('');
    data.apps.items.forEach((a,i)=>{
      bindInput('#f-ap-icon-'+i,v=>{a.icon=v;});
      bindInput('#f-ap-title-'+i,v=>{a.title=v;});
      bindInput('#f-ap-desc-'+i,v=>{a.desc=v;});
    });
    delHandler(apBox, data.apps.items, renderSections);
    addBtn('add-app', ()=>{ data.apps.items.push({icon:'📦',title:'Новое направление',desc:'Описание'}); renderSections(); });

    // process steps
    const prBox = document.getElementById('items-process');
    prBox.innerHTML = data.process.steps.map((s,i)=>
      '<div class="item"><div class="item-head"><b>Шаг '+(i+1)+'</b>'+delBtn('pr',i)+'</div>'+
      field('pr-title-'+i,'Название шага',s.title)+field('pr-desc-'+i,'Описание',s.desc,'textarea')+'</div>').join('');
    data.process.steps.forEach((s,i)=>{
      bindInput('#f-pr-title-'+i,v=>{s.title=v;});
      bindInput('#f-pr-desc-'+i,v=>{s.desc=v;});
    });
    delHandler(prBox, data.process.steps, renderSections);
    addBtn('add-step', ()=>{ data.process.steps.push({title:'Новый шаг',desc:'Описание'}); renderSections(); });
  }

  function sectionBlock(key,title,listKey){
    const d = data[key==='strip'?'strip':key] || data[key];
    const hasHead = key !== 'strip';
    const obj = data[key];
    let head = '';
    if (hasHead){
      head = '<div class="row3">'+field(key+'-kicker','Kicker',obj.kicker)+
             field(key+'-title','Заголовок раздела',obj.title)+
             field(key+'-sub','Подзаголовок',obj.sub)+'</div>';
    }
    return '<div class="block"><h2>'+esc(title)+' <span class="tag">подпункты</span></h2>'+head+
      '<div id="items-'+listKey+'"></div>'+
      '<button class="btn light" id="add-'+(key==='services'?'service':key==='apps'?'app':key==='process'?'step':'strip-item')+'">+ Добавить пункт</button></div>';
  }

  function bindSectionHead(key,obj){
    bindInput('#f-'+key+'-kicker',v=>{obj.kicker=v;});
    bindInput('#f-'+key+'-title',v=>{obj.title=v;});
    bindInput('#f-'+key+'-sub',v=>{obj.sub=v;});
  }

  function wireItems(box, arr, keys, pre){
    arr.forEach((it,i)=>keys.forEach(k=>bindInput('#f-'+pre+'-'+k+'-'+i,v=>{it[k]=v;})));
  }
  function delBtn(type,i){ return '<div class="item-actions"><button class="btn danger small" data-del="'+i+'">Удалить</button></div>'; }
  function delHandler(box, arr, rerender){
    box.querySelectorAll('[data-del]').forEach(btn=>btn.addEventListener('click',()=>{
      arr.splice(+btn.dataset.del,1); rerender(); toast('Пункт удалён');
    }));
  }
  function addBtn(id, fn){ const el=document.getElementById(id); if(el) el.addEventListener('click',fn); }

  /* ---- Качество (сертификаты) ---- */
  function renderQuality(){
    const q = data.quality;
    const P = document.getElementById('panel-quality');
    P.innerHTML =
      '<div class="block"><h2>Заголовок раздела</h2>'+
      '<div class="row3">'+field('q-kicker','Kicker',q.kicker)+field('q-title','Заголовок',q.title)+field('q-sub','Подзаголовок',q.sub)+'</div></div>'+
      '<div class="block"><h2>Сертификаты <span class="tag">портфолио · '+q.certs.length+' шт.</span></h2><div id="certs-list"></div>'+
      '<button class="btn light" id="add-cert">+ Добавить сертификат</button></div>';

    bindInput('#f-q-kicker',v=>{q.kicker=v;});
    bindInput('#f-q-title',v=>{q.title=v;});
    bindInput('#f-q-sub',v=>{q.sub=v;});

    const list = document.getElementById('certs-list');
    list.innerHTML = q.certs.map((c,i)=>
      '<div class="cert-item">'+
        '<div class="full item-head"><b>Сертификат '+(i+1)+'</b><div class="item-actions"><button class="btn danger small" data-cdel="'+i+'">Удалить</button></div></div>'+
        field('c-name-'+i,'Название',c.name)+
        field('c-type-'+i,'Тип',c.type)+
        field('c-org-'+i,'Орган сертификации',c.org)+
        field('c-num-'+i,'Номер',c.num)+
        field('c-year-'+i,'Год',c.year)+
        field('c-status-'+i,'Статус',c.status)+
        '<div class="full">'+field('c-note-'+i,'Примечание',c.note,'textarea')+'</div>'+
      '</div>').join('');
    q.certs.forEach((c,i)=>{
      [['name','c-name'],['type','c-type'],['org','c-org'],['num','c-num'],['year','c-year'],['status','c-status'],['note','c-note']].forEach(([k,pref])=>{
        bindInput('#f-'+pref+'-'+i, v=>{c[k]=v;});
      });
    });
    list.querySelectorAll('[data-cdel]').forEach(btn=>btn.addEventListener('click',()=>{
      q.certs.splice(+btn.dataset.cdel,1); renderQuality(); toast('Сертификат удалён');
    }));
    document.getElementById('add-cert').addEventListener('click',()=>{
      q.certs.push({name:'Новый сертификат',type:'Тип',org:'Орган',num:'№',year:String(new Date().getFullYear()),status:'Действует',note:''});
      renderQuality();
    });
  }

  /* ---- Контакты ---- */
  function renderContacts(){
    const c = data.contacts;
    const P = document.getElementById('panel-contacts');
    P.innerHTML =
      '<div class="block"><h2>Основное</h2>'+
      '<div class="row">'+field('ct-company','Наименование',c.company)+field('ct-site','Сайт',c.site)+'</div>'+
      field('ct-address','Адрес',c.address,'textarea')+
      '<div class="row">'+field('ct-unp','УНП',c.unp)+field('ct-hours','Режим работы',c.hours)+'</div>'+
      field('ct-directions','Направления',c.directions,'textarea')+'</div>'+

      '<div class="block"><h2>Телефоны <span class="tag">'+c.phones.length+' шт.</span></h2><div id="phones-list"></div>'+
      '<button class="btn light" id="add-phone">+ Добавить телефон</button></div>'+

      '<div class="block"><h2>E-mail адреса <span class="tag">'+c.emails.length+' шт.</span></h2><div id="emails-list"></div>'+
      '<button class="btn light" id="add-email">+ Добавить e-mail</button></div>';

    bindInput('#f-ct-company',v=>{c.company=v;});
    bindInput('#f-ct-site',v=>{c.site=v;});
    bindInput('#f-ct-address',v=>{c.address=v;});
    bindInput('#f-ct-unp',v=>{c.unp=v;});
    bindInput('#f-ct-hours',v=>{c.hours=v;});
    bindInput('#f-ct-directions',v=>{c.directions=v;});

    const ph = document.getElementById('phones-list');
    ph.innerHTML = c.phones.map((p,i)=>
      '<div class="item"><div class="item-head"><b>Телефон '+(i+1)+'</b>'+
      '<div class="item-actions"><button class="btn danger small" data-pdel="'+i+'">Удалить</button></div></div>'+
      '<div class="row3">'+field('p-label-'+i,'Подпись',p.label)+field('p-display-'+i,'Отображаемый номер',p.display)+field('p-tel-'+i,'Формат tel: (+375...)',p.tel)+'</div></div>').join('');
    c.phones.forEach((p,i)=>{
      bindInput('#f-p-label-'+i,v=>{p.label=v;});
      bindInput('#f-p-display-'+i,v=>{p.display=v;});
      bindInput('#f-p-tel-'+i,v=>{p.tel=v;});
    });
    ph.querySelectorAll('[data-pdel]').forEach(btn=>btn.addEventListener('click',()=>{
      c.phones.splice(+btn.dataset.pdel,1); renderContacts(); toast('Телефон удалён');
    }));
    addBtn('add-phone', ()=>{ c.phones.push({label:'Новый телефон',display:'+375 (__) ___-__-__',tel:'+375000000000'}); renderContacts(); });

    const em = document.getElementById('emails-list');
    em.innerHTML = c.emails.map((e,i)=>
      '<div class="item"><div class="item-head"><b>E-mail '+(i+1)+'</b>'+
      '<div class="item-actions"><button class="btn danger small" data-edel="'+i+'">Удалить</button></div></div>'+
      '<div class="row">'+field('e-label-'+i,'Подпись',e.label)+field('e-value-'+i,'Адрес',e.value)+'</div></div>').join('');
    c.emails.forEach((e,i)=>{
      bindInput('#f-e-label-'+i,v=>{e.label=v;});
      bindInput('#f-e-value-'+i,v=>{e.value=v;});
    });
    em.querySelectorAll('[data-edel]').forEach(btn=>btn.addEventListener('click',()=>{
      c.emails.splice(+btn.dataset.edel,1); renderContacts(); toast('E-mail удалён');
    }));
    addBtn('add-email', ()=>{ c.emails.push({label:'E-mail',value:'info@minavto.by'}); renderContacts(); });
  }

  /* ---- Настройки ---- */
  function renderSettings(){
    const P = document.getElementById('panel-settings');
    P.innerHTML =
      '<div class="block"><h2>Верхняя строка (topbar)</h2>'+
      field('tb-left','Левый текст',data.topbar.left,'textarea')+
      field('tb-right','Правый текст',data.topbar.right,'textarea')+'</div>'+
      '<div class="block"><h2>Подвал</h2>'+
      field('ft-desc','Описание компании',data.footer.description,'textarea')+
      field('ft-copy','Строка копирайта ({year} = текущий год)',data.footer.copyright)+
      field('ft-legal','Правая строка',data.footer.legal)+'</div>'+
      '<div class="block"><h2>Пароль редактора</h2>'+
      '<div class="row">'+field('new-pass','Новый пароль','')+field('new-pass2','Повторите пароль','')+'</div>'+
      '<button class="btn navy" id="set-pass">Сменить пароль</button></div>'+
      '<div class="block"><h2>Сброс</h2>'+
      '<p class="hint" style="margin-bottom:.8rem">Вернуть все тексты и настройки сайта к исходным значениям.</p>'+
      '<button class="btn danger" id="reset-all">Сбросить сайт к оригиналу</button></div>';

    bindInput('#f-tb-left',v=>{data.topbar.left=v;});
    bindInput('#f-tb-right',v=>{data.topbar.right=v;});
    bindInput('#f-ft-desc',v=>{data.footer.description=v;});
    bindInput('#f-ft-copy',v=>{data.footer.copyright=v;});
    bindInput('#f-ft-legal',v=>{data.footer.legal=v;});

    document.getElementById('set-pass').addEventListener('click',()=>{
      const a = document.getElementById('f-new-pass').value;
      const b = document.getElementById('f-new-pass2').value;
      if (a.length < 3){ toast('Пароль слишком короткий (мин. 3 символа)','err'); return; }
      if (a !== b){ toast('Пароли не совпадают','err'); return; }
      localStorage.setItem(KEY_PASS, a);
      document.getElementById('f-new-pass').value = '';
      document.getElementById('f-new-pass2').value = '';
      toast('Пароль изменён','ok');
    });

    document.getElementById('reset-all').addEventListener('click',()=>{
      if (confirm('Сбросить все изменения и вернуть исходное содержимое сайта?')){
        window.MinavtoData.reset();
        data = window.MinavtoData.load();
        renderAll();
        toast('Сайт сброшен к оригиналу','ok');
      }
    });
  }

  /* ================= Общие helpers ================= */
  function field(id,label,val,type){
    const input = type === 'textarea'
      ? '<textarea id="f-'+id+'" rows="3">'+esc(val)+'</textarea>'
      : '<input type="text" id="f-'+id+'" value="'+esc(val)+'">';
    return '<div class="field"><label for="f-'+id+'">'+esc(label)+'</label>'+input+'</div>';
  }

  function bindInput(sel, fn){
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener('input', ()=>fn(el.value));
  }

  let toastTimer;
  function toast(msg, kind){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  /* ================= Сохранение / выход ================= */
  function saveAll(){
    if (window.MinavtoData.save(data)){
      toast('✔ Изменения сохранены. Обновите index.html.','ok');
      document.getElementById('save-status').textContent =
        'Сохранено: ' + new Date().toLocaleTimeString('ru-RU');
    } else {
      toast('Не удалось сохранить (переполнен localStorage?)','err');
    }
  }

  function bindGlobal(){
    document.getElementById('btn-save').addEventListener('click', saveAll);
    document.getElementById('btn-exit').addEventListener('click', ()=>{
      if (confirm('Выйти из редактора? Несохранные изменения будут потеряны.')){
        sessionStorage.removeItem(KEY_AUTH);
        location.reload();
      }
    });
    // Ctrl+S — сохранить
    document.addEventListener('keydown', e=>{
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); saveAll(); }
    });
    // Автосохранение каждые 30 секунд
    setInterval(()=>{ if (sessionStorage.getItem(KEY_AUTH)==='1') window.MinavtoData.save(data); }, 30000);
  }
})();
