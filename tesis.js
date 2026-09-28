// Tesis: aparición al hacer scroll, embudos, tooltip y calculadora.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
$('year').textContent = new Date().getFullYear();

// Aparición
const revealed = document.querySelectorAll('.reveal, .bars');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add(e.target.classList.contains('bars') ? 'drawn' : 'in'); io.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealed.forEach(el => io.observe(el));
} else {
  revealed.forEach(el => el.classList.add(el.classList.contains('bars') ? 'drawn' : 'in'));
}

// Embudos: ancho proporcional (lineal o logarítmico)
for (const list of document.querySelectorAll('.bars')) {
  const max = Number(list.dataset.max), log = list.dataset.scale === 'log';
  for (const li of list.children) {
    const v = Number(li.dataset.value);
    const ratio = log ? Math.log10(v) / Math.log10(max) : v / max;
    li.style.setProperty('--w', (ratio * 100).toFixed(2) + '%');
    li.tabIndex = 0;
    li.setAttribute('aria-label', `${li.querySelector('.bar-label').textContent}: ${li.querySelector('.bar-value').textContent}. ${li.dataset.kind}. ${li.dataset.source}`);
  }
}

// Tooltip con fuente y tipo de dato
const tip = $('tip');
function showTip(li, x, y) {
  tip.replaceChildren();
  const kind = document.createElement('span'); kind.className = 'kind'; kind.textContent = li.dataset.kind;
  const b = document.createElement('b'); b.textContent = li.querySelector('.bar-value').textContent;
  const src = document.createElement('span'); src.textContent = li.dataset.source;
  tip.append(kind, b, src); tip.hidden = false;
  const r = tip.getBoundingClientRect();
  tip.style.left = Math.min(x + 14, innerWidth - r.width - 8) + 'px';
  tip.style.top = Math.max(8, y - r.height - 12) + 'px';
}
document.querySelectorAll('.bars li').forEach(li => {
  li.addEventListener('pointermove', e => showTip(li, e.clientX, e.clientY));
  li.addEventListener('pointerleave', () => { tip.hidden = true; });
  li.addEventListener('focus', () => { const r = li.getBoundingClientRect(); showTip(li, r.left, r.top); });
  li.addEventListener('blur', () => { tip.hidden = true; });
});

// Calculadora
const PEOPLE_MARKET = 650000, COMPANY_MARKET = 2450, NIGHTS_PER_COMPANY = 20 * 4;
const fmt = n => Math.round(n).toLocaleString('es-AR');
const pct = n => (n < 0.1 ? n.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : n < 10 ? n.toLocaleString('es-AR', { maximumFractionDigits: 1 }) : Math.round(n).toLocaleString('es-AR')) + '%';
const val = id => Number($(id).value);
function calc() {
  const rooms = val('rooms'), occ = val('occ') / 100, stay = val('stay'), visits = val('visits'), corp = val('corp') / 100, sites = val('sites');
  $('o-rooms').textContent = rooms; $('o-occ').textContent = Math.round(occ * 100) + '%'; $('o-stay').textContent = stay;
  $('o-visits').textContent = visits.toLocaleString('es-AR'); $('o-corp').textContent = Math.round(corp * 100) + '%'; $('o-sites').textContent = sites;
  const nights = rooms * 365 * occ * sites;
  const people = nights * (1 - corp) / stay / visits;
  const companies = nights * corp / NIGHTS_PER_COMPANY;
  const share = people / PEOPLE_MARKET * 100, cshare = companies / COMPANY_MARKET * 100;
  $('r-nights').textContent = fmt(nights);
  $('r-people').textContent = fmt(people);
  $('r-share').textContent = pct(share);
  $('r-share-bar').style.width = Math.min(100, share) + '%';
  $('r-companies').textContent = fmt(Math.ceil(companies));
  $('r-cshare').textContent = pct(cshare);
  $('r-cshare-bar').style.width = Math.min(100, cshare) + '%';
}
$('calc').addEventListener('input', calc);
calc();
