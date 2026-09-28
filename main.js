// Costa Reset Club · interacciones de la landing (sin dependencias)
const WHATSAPP = '5491132524245';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Hero: fotos que se alternan ----------
const slides = [...document.querySelectorAll('.hero-slides img')];
let current = 0;
if (!reduced && slides.length > 1) {
  setInterval(() => {
    if (document.hidden) return;
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, 5500);
}

// ---------- Aparición al hacer scroll ----------
const revealed = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduced) {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealed.forEach(el => io.observe(el));
} else {
  revealed.forEach(el => el.classList.add('in'));
}

// ---------- Botón fijo en celulares: aparece después del hero y se oculta en el formulario ----------
const mobileCta = $('mobileCta');
if ('IntersectionObserver' in window) {
  let pastHero = false, atForm = false;
  const sync = () => mobileCta.classList.toggle('visible', pastHero && !atForm);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); }).observe(document.querySelector('.hero'));
  new IntersectionObserver(([e]) => { atForm = e.isIntersecting; sync(); }, { threshold: 0.05 }).observe($('reservar'));
}

// ---------- Aviso breve ----------
let toastTimer;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 4000);
}

// ---------- Reserva ----------
const form = $('reserveForm');
const from = $('from'), to = $('to');
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const parse = value => (value ? new Date(value + 'T12:00:00') : null);
const pretty = d => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

from.min = iso(new Date());
to.min = iso(new Date(Date.now() + 86400000));

function nights() {
  const a = parse(from.value), b = parse(to.value);
  return a && b ? Math.round((b - a) / 86400000) : 0;
}
function updateNights() {
  if (from.value) {
    const next = new Date(parse(from.value).getTime() + 86400000);
    to.min = iso(next);
    if (to.value && to.value <= from.value) to.value = '';
  }
  const n = nights();
  $('nights').textContent = n > 0 ? `${n} ${n === 1 ? 'noche' : 'noches'} seleccionadas` : '';
}
from.addEventListener('change', () => { updateNights(); if (!to.value) to.focus(); });
to.addEventListener('change', updateNights);

function fail(input, message) {
  $('formError').textContent = message;
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
}

form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const name = (data.name || '').trim();
  const phone = (data.whatsapp || '').trim();
  if (name.length < 2) return fail($('name'), 'Decinos tu nombre.');
  if (phone.replace(/\D/g, '').length < 6) return fail($('whatsapp'), 'Revisá tu número de WhatsApp.');
  if (!from.value) return fail(from, 'Elegí tu fecha de llegada.');
  if (from.value < from.min) return fail(from, 'La llegada tiene que ser desde hoy en adelante.');
  if (!to.value || nights() < 1) return fail(to, 'Elegí una fecha de salida posterior a la llegada.');
  fail(null, '');
  if (data.website) return; // bots

  const n = nights();
  const team = $('team').checked;
  const lines = [
    'Hola! Quiero reservar en Costa Reset Club.',
    '',
    `*Nombre:* ${name}`,
    `*WhatsApp:* ${phone}`,
    `*Fechas:* ${pretty(parse(from.value))} — ${pretty(parse(to.value))} (${n} ${n === 1 ? 'noche' : 'noches'})`,
  ];
  if (team) lines.push('*Vengo con mi equipo*');

  // WhatsApp se abre en el mismo gesto del usuario para que el navegador no lo bloquee.
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');

  // La reserva también queda guardada en el servidor (si está configurado), por si no llega a enviar el WhatsApp.
  fetch('/api/reserva', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, whatsapp: phone, from: from.value, to: to.value, nights: n, team, website: data.website || '' }),
  }).catch(() => {});

  toast('¡Listo! Abrimos WhatsApp para confirmar tu reserva.');
  form.reset();
  updateNights();
});
