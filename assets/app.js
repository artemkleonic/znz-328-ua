
const menuBtn = document.querySelector('.menu-btn');
const mainNav = document.querySelector('.main-nav');
menuBtn?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mainNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));

const searchInput = document.querySelector('#docSearch');
const rows = Array.from(document.querySelectorAll('.doc-row'));
const buttons = Array.from(document.querySelectorAll('.filter-btn'));
let currentFilter = 'all';
function applyDocs(){
  const q = (searchInput?.value || '').toLowerCase().trim();
  rows.forEach(row => {
    const text = (row.dataset.doc || row.textContent).toLowerCase();
    const cat = row.dataset.category || '';
    const okText = !q || text.includes(q);
    const okCat = currentFilter === 'all' || cat === currentFilter;
    row.style.display = okText && okCat ? '' : 'none';
  });
}
searchInput?.addEventListener('input', applyDocs);
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter || 'all';
  applyDocs();
}));
