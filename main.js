// Costa Reset Club · interacciones de la landing (sin dependencias)
const WHATSAPP = '5491132524245';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

$('year').textContent = new Date().getFullYear();

// ---------- Origen de la visita (UTM de los anuncios), guardado en la primera página vista ----------
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
function readSource() {
  const params = new URLSearchParams(location.search);
  const fresh = Object.fromEntries(UTM_KEYS.filter(k => params.get(k)).map(k => [k, params.get(k).slice(0, 120)]));
  try {
    if (Object.keys(fresh).length) sessionStorage.setItem('cr-source', JSON.stringify(fresh));
    return JSON.parse(sessionStorage.getItem('cr-source') || 'null') || (document.referrer ? { referrer: document.referrer.slice(0, 120) } : {});
  } catch { return fresh; }
}
const source = readSource();

// Evento de conversión para los píxeles de Meta y Google, si están instalados.
// El eventID viaja también al servidor para que Meta no cuente dos veces la misma conversión
// cuando llegue por el píxel y por la API de conversiones.
const newEventId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
function trackLead(kind, eventId) {
  try { window.fbq?.('track', 'Lead', { content_name: kind }, { eventID: eventId }); } catch {}
  try { window.gtag?.('event', 'generate_lead', { form: kind }); } catch {}
  try { (window.dataLayer ||= []).push({ event: 'lead', form: kind }); } catch {}
}

// Clic en cualquier enlace de WhatsApp: evento "Contact".
document.addEventListener('click', e => {
  if (e.target.closest('a[href*="wa.me/"]')) { try { window.fbq?.('track', 'Contact'); } catch {} }
});

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

// ---------- Botón fijo en celulares: aparece después del hero y se oculta en los formularios ----------
const mobileCta = $('mobileCta');
if ('IntersectionObserver' in window) {
  let pastHero = false;
  const atForm = new Set();
  const waFloat = document.querySelector('.wa-float');
  const sync = () => { mobileCta.classList.toggle('visible', pastHero && atForm.size === 0); waFloat?.classList.toggle('visible', pastHero); };
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); }).observe(document.querySelector('.hero'));
  const formObserver = new IntersectionObserver(entries => {
    for (const e of entries) e.isIntersecting ? atForm.add(e.target) : atForm.delete(e.target);
    sync();
  }, { threshold: 0.05 });
  formObserver.observe($('reservar'));
  formObserver.observe($('companyForm'));
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

// ---------- Utilidades de formularios ----------
function failer(form) {
  const box = form.querySelector('.error');
  return (input, message) => {
    box.textContent = message;
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
    return false;
  };
}
function save(payload) {
  // Se guarda en el servidor (si está configurado) por si la persona no llega a enviar el WhatsApp.
  fetch('/api/reserva', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, source }),
  }).catch(() => {});
}
for (const form of document.querySelectorAll('form.form')) {
  form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));
  form.addEventListener('change', e => e.target.removeAttribute('aria-invalid'));
}

// Después de enviar, la persona pasa a gracias.html, que muestra los próximos pasos y
// dispara ahí el evento Lead (así no se pierde por cambiar de página).
function goThanks(lead) {
  try {
    sessionStorage.setItem('cr-lead', JSON.stringify(lead));
    location.href = 'gracias.html';
    return true;
  } catch {
    trackLead(lead.kind, lead.eventId);
    return false;
  }
}

// ---------- Reserva de personas ----------
const reserveForm = $('reserveForm');
const from = $('from'), to = $('to');
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const parse = value => (value ? new Date(value + 'T12:00:00') : null);
const pretty = d => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

const PRICE_FROM = 40; // USD por noche, el mismo "desde" que muestra la página

from.min = iso(new Date());
to.min = iso(new Date(Date.now() + 86400000));

function nights() {
  const a = parse(from.value), b = parse(to.value);
  return a && b ? Math.round((b - a) / 86400000) : 0;
}
function updateNights() {
  if (from.value) {
    to.min = iso(new Date(parse(from.value).getTime() + 86400000));
    if (to.value && to.value <= from.value) to.value = '';
  }
  const n = nights();
  $('nights').textContent = n > 0
    ? `${n} ${n === 1 ? 'noche' : 'noches'} · desde USD ${(n * PRICE_FROM).toLocaleString('es-AR')} en total (estimado)`
    : '';
}
from.addEventListener('change', () => { updateNights(); if (!to.value) to.focus(); });
to.addEventListener('change', updateNights);

reserveForm.addEventListener('submit', e => {
  e.preventDefault();
  const fail = failer(reserveForm);
  const data = Object.fromEntries(new FormData(reserveForm));
  const name = (data.name || '').trim();
  const phone = (data.whatsapp || '').trim();
  if (name.length < 2) return fail($('name'), 'Decinos tu nombre.');
  if (phone.replace(/\D/g, '').length < 6) return fail($('whatsapp'), 'Revisá tu número de WhatsApp.');
  if (!from.value) return fail(from, 'Elegí tu fecha de llegada.');
  if (from.value < from.min) return fail(from, 'La llegada tiene que ser desde hoy en adelante.');
  if (!to.value || nights() < 1) return fail(to, 'Elegí una fecha de salida posterior a la llegada.');
  if (!data.mode) return fail($('mode'), 'Contanos cómo venís.');
  fail(null, '');
  if (data.website) return; // bots

  const n = nights();
  const text = [
    'Hola! Quiero reservar en Costa Reset Club.',
    '',
    `*Nombre:* ${name}`,
    `*WhatsApp:* ${phone}`,
    `*Fechas:* ${pretty(parse(from.value))} — ${pretty(parse(to.value))} (${n} ${n === 1 ? 'noche' : 'noches'})`,
    `*Cómo vengo:* ${data.mode}`,
  ].join('\n');

  // WhatsApp se abre en el mismo gesto del usuario para que el navegador no lo bloquee.
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  window.open(wa, '_blank', 'noopener');
  const eventId = newEventId();
  save({ type: 'persona', name, whatsapp: phone, from: from.value, to: to.value, mode: data.mode, eventId });
  const lead = { kind: 'reserva', eventId, name, from: from.value, to: to.value, nights: n, wa };
  reserveForm.reset();
  updateNights();
  if (!goThanks(lead)) toast('¡Listo! Abrimos WhatsApp para confirmar tu reserva.');
});

// ---------- Propuesta para empresas ----------
const companyForm = $('companyForm');
companyForm.addEventListener('submit', async e => {
  e.preventDefault();
  const fail = failer(companyForm);
  const data = Object.fromEntries(new FormData(companyForm));
  const name = (data.name || '').trim(), company = (data.company || '').trim(), email = (data.email || '').trim();
  if (name.length < 2) return fail($('c-name'), 'Decinos tu nombre.');
  if (company.length < 2) return fail($('c-company'), '¿En qué empresa trabajás?');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail($('c-email'), 'Revisá el email.');
  if (!data.size) return fail($('c-size'), 'Elegí cuántas personas son.');
  if (!data.interest) return fail($('c-interest'), 'Contanos qué les interesa.');
  fail(null, '');
  if (data.website) return;

  const button = companyForm.querySelector('button[type=submit]');
  const eventId = newEventId();
  button.disabled = true;
  // Acá no hay WhatsApp de respaldo, así que esperamos la confirmación del servidor.
  const response = await fetch('/api/reserva', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'empresa', name, company, email, size: data.size, interest: data.interest, source, eventId }),
  }).catch(() => null);
  button.disabled = false;
  if (!response?.ok) return fail(null, 'No pudimos enviar el pedido. Escribinos a hola@costaresetclub.com y te respondemos igual.');
  companyForm.reset();
  if (!goThanks({ kind: 'empresa', eventId, name, company })) {
    companyForm.querySelector('.form-title').textContent = '¡Gracias! Te escribimos pronto.';
    toast('Recibimos tu pedido. Te escribimos por email en menos de 48 h hábiles.');
  }
});
