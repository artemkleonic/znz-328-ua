
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch(e){return d} },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  };
  const toast = (msg)=>{
    let t = $('#toast');
    if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display='block';
    clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.style.display='none',3200);
  };
  window.Site = {store, toast};

  function initMenu(){
    const btn = $('[data-mobile-toggle]');
    const nav = $('#mainNav');
    if(btn && nav) btn.addEventListener('click',()=>nav.classList.toggle('open'));

    $$('.nav-button').forEach(button=>{
      button.setAttribute('type','button');
      button.addEventListener('click', e=>{
        if(window.innerWidth <= 1050){
          e.preventDefault();
          const item = button.closest('.nav-item');
          const isOpen = item?.classList.contains('is-open');
          $$('.nav-item.is-open').forEach(i=>{ if(i!==item) i.classList.remove('is-open'); });
          item?.classList.toggle('is-open', !isOpen);
          button.setAttribute('aria-expanded', String(!isOpen));
        }
      });
    });

    $$('nav a').forEach(a=>a.addEventListener('click',()=>{
      if(window.innerWidth <= 1050) nav?.classList.remove('open');
    }));

    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 1050){
        nav?.classList.remove('open');
        $$('.nav-item.is-open').forEach(i=>i.classList.remove('is-open'));
      }
    });

    const path = location.pathname.split('/').pop() || 'index.html';
    $$('a[href="'+path+'"]').forEach(a=>a.classList.add('active'));
  }

  function initSearch(){
    const panel = $('#searchPanel');
    const openers = $$('[data-open-search]');
    const close = $('[data-close-search]');
    const input = $('#globalSearchInput');
    const results = $('#globalSearchResults');
    const buildIndex = ()=>{
      const data = window.SITE_DATA || {};
      const pages = (data.pages||[]).map(p=>({...p,type:'Сторінка'}));
      const docs = (data.documents||[]).map(d=>({title:d.title, url:d.file, description:d.category+' · '+d.ext, type:'Документ'}));
      const news = (data.news||[]).map(n=>({title:n.title, url:n.url, description:n.text, type:'Новина'}));
      return [...pages,...docs,...news];
    };
    const index = buildIndex();
    function render(q){
      q = (q||'').trim().toLowerCase();
      if(!results) return;
      const items = q.length < 2 ? index.slice(0,8) : index.filter(i => 
        (i.title+' '+(i.description||'')+' '+(i.type||'')).toLowerCase().includes(q)
      ).slice(0,30);
      results.innerHTML = items.map(i=>`
        <a class="result-card" href="${i.url}">
          <small>${i.type}</small>
          <strong>${i.title}</strong>
          <div>${i.description||''}</div>
        </a>`).join('') || '<div class="result-card">Нічого не знайдено. Спробуйте інший запит.</div>';
    }
    openers.forEach(b=>b.addEventListener('click',()=>{panel.style.display='block'; setTimeout(()=>input?.focus(),60); render(input?.value);}));
    close?.addEventListener('click',()=>panel.style.display='none');
    panel?.addEventListener('click',e=>{if(e.target===panel) panel.style.display='none'});
    input?.addEventListener('input',e=>render(e.target.value));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && panel) panel.style.display='none';
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){e.preventDefault(); $('[data-open-search]')?.click();}
    });
  }

  function initDocs(){
    const root = $('#documentsList');
    if(!root) return;
    const q = $('#docSearch'), cat = $('#docCategory'), ext = $('#docExt');
    const data = window.SITE_DATA?.documents || [];
    const cats = [...new Set(data.map(d=>d.category))].sort();
    cat.innerHTML = '<option value="">Усі розділи</option>'+cats.map(c=>`<option>${c}</option>`).join('');
    const exts = [...new Set(data.map(d=>d.ext))].sort();
    ext.innerHTML = '<option value="">Усі типи</option>'+exts.map(c=>`<option>${c}</option>`).join('');
    function fmt(n){ if(n>1048576) return (n/1048576).toFixed(1)+' МБ'; if(n>1024) return Math.round(n/1024)+' КБ'; return n+' Б';}
    function render(){
      let items = data.filter(d=>{
        const query=(q.value||'').toLowerCase();
        return (!query || (d.title+' '+d.category+' '+d.ext).toLowerCase().includes(query)) &&
        (!cat.value || d.category===cat.value) && (!ext.value || d.ext===ext.value);
      });
      root.innerHTML = items.map(d=>`
        <div class="doc-card" data-doc="${d.file}">
          <div>
            <h3>${d.title}</h3>
            <div class="doc-meta">${d.category} · ${d.ext} · ${fmt(d.size)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
            <button class="fav" data-fav="${d.file}" title="Додати в обране">★</button>
            <a class="btn" href="${d.file}" target="_blank" rel="noopener">Відкрити</a>
          </div>
        </div>`).join('') || '<div class="card">За вибраними фільтрами документів не знайдено.</div>';
      updateFavButtons();
    }
    [q,cat,ext].forEach(el=>el?.addEventListener('input',render));
    root.addEventListener('click',e=>{
      const b = e.target.closest('[data-fav]'); if(!b) return;
      const favs = store.get('znz328:favs', []);
      const f=b.dataset.fav;
      const next = favs.includes(f) ? favs.filter(x=>x!==f) : [...favs,f];
      store.set('znz328:favs', next); updateFavButtons(); toast(next.includes(f)?'Документ додано в обране':'Документ прибрано з обраного');
    });
    function updateFavButtons(){
      const favs = store.get('znz328:favs', []);
      $$('[data-fav]').forEach(b=>{b.style.opacity = favs.includes(b.dataset.fav)?'1':'.45';});
    }
    render();
  }

  function initNews(){
    const root = $('#newsGrid');
    if(!root) return;
    const data = window.SITE_DATA?.news || [];
    const filter = $('#newsFilter');
    const tags = ['', ...new Set(data.map(n=>n.tag))];
    filter.innerHTML = tags.map(t=>`<option value="${t}">${t||'Усі новини'}</option>`).join('');
    function render(){
      const items = data.filter(n=>!filter.value || n.tag===filter.value);
      root.innerHTML = items.map(n=>`
        <article class="card news-card">
          <img src="${n.img}" alt="">
          <div class="inner">
            <span class="tag">${n.tag}</span>
            <h3>${n.title}</h3>
            <div class="date">${new Date(n.date).toLocaleDateString('uk-UA')}</div>
            <p>${n.text}</p>
            <a class="btn" href="${n.url}">Детальніше</a>
          </div>
        </article>`).join('');
    }
    filter.addEventListener('change',render); render();
  }

  function initCalendar(){
    const root = $('#calendarGrid'); if(!root) return;
    const events = window.SITE_DATA?.events || [];
    const month = 5; // June 2026
    const year = 2026;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month+1, 0).getDate();
    let startOffset = (first.getDay()+6)%7;
    let html='';
    for(let i=0;i<startOffset;i++) html += '<div></div>';
    for(let d=1; d<=daysInMonth; d++){
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const ev = events.filter(e=>e.date===ds);
      html += `<div class="day ${ev.length?'has-event':''}"><b>${d}</b>${ev.map(e=>`<span class="event-pill">${e.title}</span>`).join('')}</div>`;
    }
    root.innerHTML = html;
  }

  function initGallery(){
    const gal = $('#galleryGrid'); if(gal){
      const imgs = window.SITE_DATA?.gallery || [];
      gal.innerHTML = imgs.map((src,i)=>`<button data-lightbox="${src}" aria-label="Відкрити фото ${i+1}"><img src="${src}" alt="Фото з життя ліцею"></button>`).join('');
    }
    const lb = $('#lightbox'); const lbimg = $('#lightboxImg');
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-lightbox]');
      if(b && lb && lbimg){ lbimg.src=b.dataset.lightbox; lb.style.display='flex'; }
      if(e.target===lb){ lb.style.display='none'; lbimg.src='';}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && lb){lb.style.display='none';}});
  }

  function initAuth(){
    const state = store.get('znz328:user', null);
    $$('[data-user-name]').forEach(el=>el.textContent = state?.name || 'Гість');
    const authBox = $('#authBox');
    if(authBox){
      renderAuth();
      authBox.addEventListener('submit',e=>{
        e.preventDefault();
        const form=e.target;
        if(form.matches('#registerForm')){
          const user = Object.fromEntries(new FormData(form).entries());
          user.created = new Date().toISOString();
          store.set('znz328:user', user);
          toast('Реєстрацію збережено. Ви увійшли в особистий кабінет.');
          renderAuth();
        }
        if(form.matches('#loginForm')){
          const name = form.querySelector('[name=name]').value || 'Користувач';
          const email = form.querySelector('[name=email]').value || '';
          store.set('znz328:user', {name,email,role:'Користувач',created:new Date().toISOString()});
          toast('Вхід виконано.');
          renderAuth();
        }
      });
    }
    function renderAuth(){
      const user = store.get('znz328:user', null);
      if(user){
        authBox.innerHTML = `
          <div class="card">
            <span class="badge">Особистий кабінет</span>
            <h2>Вітаємо, ${user.name}</h2>
            <p class="lead">Ваш профіль збережений у цьому браузері. Ви можете залишати коментарі, відгуки та формувати список обраних документів.</p>
            <div class="grid grid-3">
              <div class="card"><b>Роль</b><p>${user.role||'Користувач'}</p></div>
              <div class="card"><b>Email</b><p>${user.email||'не вказано'}</p></div>
              <div class="card"><b>Обране</b><p>${store.get('znz328:favs',[]).length} документів</p></div>
            </div>
            <button class="btn btn-danger" id="logoutBtn" style="margin-top:18px">Вийти</button>
          </div>`;
        $('#logoutBtn').addEventListener('click',()=>{localStorage.removeItem('znz328:user'); toast('Ви вийшли з кабінету.'); renderAuth();});
      } else {
        authBox.innerHTML = `
        <div class="grid grid-2">
          <form id="registerForm" class="card form-grid">
            <span class="badge">Реєстрація</span>
            <h2>Створити профіль</h2>
            <input class="input" name="name" required placeholder="Ім’я та прізвище">
            <input class="input" name="email" type="email" required placeholder="Email">
            <select class="select" name="role"><option>Батьки</option><option>Учень / учениця</option><option>Випускник / випускниця</option><option>Працівник закладу</option></select>
            <button class="btn btn-primary">Зареєструватися</button>
          </form>
          <form id="loginForm" class="card form-grid">
            <span class="badge">Вхід</span>
            <h2>Увійти</h2>
            <input class="input" name="name" required placeholder="Ім’я">
            <input class="input" name="email" type="email" placeholder="Email">
            <button class="btn btn-accent">Увійти</button>
            <p>Після входу можна залишати коментарі та відгуки.</p>
          </form>
        </div>`;
      }
    }
  }

  function initComments(){
    const box = $('[data-comments-for]');
    if(!box) return;
    const key = 'znz328:comments:'+box.dataset.commentsFor;
    function render(){
      const user = store.get('znz328:user', null);
      const comments = store.get(key, []);
      box.innerHTML = `
        <h2>Коментарі</h2>
        <p>Коментарі допомагають зробити сторінку живою: питання, уточнення, подяки, пропозиції.</p>
        ${user ? `
          <form id="commentForm" class="form-grid">
            <textarea class="input" name="text" rows="4" required placeholder="Напишіть коментар..."></textarea>
            <button class="btn btn-primary">Додати коментар</button>
          </form>` :
          `<div class="callout">Щоб залишити коментар, перейдіть на сторінку <a href="auth.html"><b>реєстрації / входу</b></a>.</div>`}
        <div>${comments.map(c=>`
          <div class="comment"><strong>${c.name}</strong><small>${new Date(c.date).toLocaleString('uk-UA')}</small><div>${c.text}</div></div>`).join('') || '<div class="comment">Поки немає коментарів. Будьте першим, хто поставить корисне питання.</div>'}</div>`;
      $('#commentForm')?.addEventListener('submit',e=>{
        e.preventDefault(); const text=e.target.text.value.trim(); if(!text) return;
        const u = store.get('znz328:user', {name:'Користувач'});
        comments.unshift({name:u.name, text:text.replace(/[<>]/g,''), date:new Date().toISOString()});
        store.set(key, comments.slice(0,50)); toast('Коментар додано.'); render();
      });
    }
    render();
  }

  function initReviews(){
    const root = $('#reviewsList'), form=$('#reviewForm');
    if(!root) return;
    const seeded = [
      {name:'Шкільна спільнота', role:'батьки', rating:5, text:'Цінуємо відкриту комунікацію, системність у документах і увагу до безпеки дітей.', date:'2026-05-25'},
      {name:'Випускники', role:'випускники', rating:5, text:'Ліцей дає не лише знання, а й навичку самостійно думати, працювати з інформацією та відповідати за вибір.', date:'2026-05-18'},
      {name:'Учнівська ініціатива', role:'учні', rating:4, text:'Подобається, що є гуртки, шкільна газета, бібліотечні заходи та можливість проявити себе.', date:'2026-05-10'}
    ];
    function render(){
      const reviews = [...store.get('znz328:reviews', []), ...seeded];
      root.innerHTML = reviews.map(r=>`
        <div class="review-card">
          <div class="stars">${'★'.repeat(+r.rating)}${'☆'.repeat(5-(+r.rating))}</div>
          <h3>${r.name}</h3>
          <small>${r.role||''} · ${new Date(r.date).toLocaleDateString('uk-UA')}</small>
          <p>${r.text}</p>
        </div>`).join('');
    }
    form?.addEventListener('submit',e=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.date = new Date().toISOString();
      data.text = (data.text||'').replace(/[<>]/g,'');
      const reviews = store.get('znz328:reviews', []);
      reviews.unshift(data); store.set('znz328:reviews', reviews.slice(0,30));
      form.reset(); toast('Відгук додано. Дякуємо.'); render();
    });
    render();
  }

  function initAppeal(){
    const form=$('#appealForm'); if(!form) return;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      data.date=new Date().toISOString();
      const list=store.get('znz328:appeals',[]);
      list.unshift(data); store.set('znz328:appeals', list.slice(0,100));
      form.reset(); toast('Звернення збережено. Для реального відправлення потрібне підключення пошти або CRM.');
    });
  }

  function initAdmin(){
    const root=$('#adminPanel'); if(!root) return;
    const appeals=store.get('znz328:appeals',[]);
    const reviews=store.get('znz328:reviews',[]);
    root.innerHTML = `
      <div class="grid grid-2">
        <div class="card"><h2>Звернення</h2>${appeals.map(a=>`<div class="comment"><strong>${a.name||'Без імені'}</strong><small>${a.email||''} · ${new Date(a.date).toLocaleString('uk-UA')}</small><div>${a.message||''}</div></div>`).join('')||'<p>Звернень поки немає.</p>'}</div>
        <div class="card"><h2>Відгуки</h2>${reviews.map(r=>`<div class="comment"><strong>${r.name||'Гість'} · ${r.rating}★</strong><small>${new Date(r.date).toLocaleString('uk-UA')}</small><div>${r.text||''}</div></div>`).join('')||'<p>Нових відгуків поки немає.</p>'}</div>
      </div>`;
  }

  function initFaq(){
    $$('.faq-q').forEach(b=>b.addEventListener('click',()=>{
      const p=b.nextElementSibling; p.style.display=p.style.display==='block'?'none':'block';
    }));
  }

  function initTools(){
    const fs=store.get('znz328:fontScale',1);
    document.documentElement.style.setProperty('--font-scale',fs);
    if(store.get('znz328:contrast',false)) document.body.classList.add('contrast');
    if(store.get('znz328:reader',false)) document.body.classList.add('reader');
    $('[data-font-plus]')?.addEventListener('click',()=>{let v=Math.min(1.25, store.get('znz328:fontScale',1)+.05);store.set('znz328:fontScale',v);document.documentElement.style.setProperty('--font-scale',v);});
    $('[data-font-minus]')?.addEventListener('click',()=>{let v=Math.max(.9, store.get('znz328:fontScale',1)-.05);store.set('znz328:fontScale',v);document.documentElement.style.setProperty('--font-scale',v);});
    $('[data-contrast]')?.addEventListener('click',()=>{document.body.classList.toggle('contrast');store.set('znz328:contrast',document.body.classList.contains('contrast'));});
    $('[data-reader]')?.addEventListener('click',()=>{document.body.classList.toggle('reader');store.set('znz328:reader',document.body.classList.contains('reader'));});
    $('[data-print]')?.addEventListener('click',()=>window.print());
    $('[data-top]')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    $('[data-copy-link]')?.addEventListener('click',()=>navigator.clipboard?.writeText(location.href).then(()=>toast('Посилання скопійовано')));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initMenu();initSearch();initDocs();initNews();initCalendar();initGallery();initAuth();initComments();initReviews();initAppeal();initAdmin();initFaq();initTools();
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
})();
