// POST: guarda una pre-reserva ("persona") o un pedido de propuesta ("empresa").
// GET con "Authorization: Bearer RESERVAS_KEY": lista las últimas para /admin.html.
const crypto = require('node:crypto');
const { redis, configured } = require('./_db');

const KEY = 'reservas', MAX_STORED = 2000, PER_IP_HOUR = 20;
const MODES = ['Por mi cuenta', 'Me lo ofrece mi empresa', 'Con mi equipo'];
const SIZES = ['1 a 10', '11 a 50', '51 a 200', 'Más de 200'];
const INTERESTS = ['Beneficio de workation', 'Offsite de equipo', 'Evento o workshop', 'Todavía no sé'];
const SOURCE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'referrer'];

const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const oneOf = (value, list) => (list.includes(value) ? value : '');

function sameSecret(given, expected) {
  const a = crypto.createHash('sha256').update(given).digest(), b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function payload(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

function source(data) {
  const raw = data && typeof data === 'object' ? data : {};
  return Object.fromEntries(SOURCE_KEYS.filter(k => raw[k]).map(k => [k, clean(raw[k], 120)]));
}

// Returns the entry to store, or null if the data is invalid.
function entryFrom(data) {
  const base = { type: data.type === 'empresa' ? 'empresa' : 'persona', name: clean(data.name, 80), source: source(data.source), eventId: clean(data.eventId, 64), createdAt: new Date().toISOString() };
  if (base.name.length < 2) return null;
  if (base.type === 'empresa') {
    const entry = { ...base, company: clean(data.company, 80), email: clean(data.email, 120), size: oneOf(data.size, SIZES), interest: oneOf(data.interest, INTERESTS) };
    return entry.company.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email) && entry.size && entry.interest ? entry : null;
  }
  const entry = { ...base, whatsapp: clean(data.whatsapp, 40), from: clean(data.from, 10), to: clean(data.to, 10), mode: oneOf(data.mode, MODES) || (data.team ? 'Con mi equipo' : '') };
  if (entry.whatsapp.replace(/\D/g, '').length < 6 || !isDate(entry.from) || !isDate(entry.to) || entry.to <= entry.from) return null;
  entry.nights = Math.round((Date.parse(entry.to) - Date.parse(entry.from)) / 86400000);
  return entry;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, data) => res.status(status).json(data);
  if (!configured()) return reply(503, { error: 'La base de datos no está conectada.' });

  try {
    if (req.method === 'GET') {
      const secret = process.env.RESERVAS_KEY || '';
      const given = (/^Bearer (.+)$/.exec(req.headers.authorization || '') || [])[1] || '';
      if (secret.length < 8 || !sameSecret(given, secret)) return reply(401, { error: 'Clave incorrecta.' });
      const list = await redis('LRANGE', KEY, 0, 499);
      return reply(200, { reservas: list.map(item => JSON.parse(item)) });
    }
    if (req.method !== 'POST') return reply(405, { error: 'Método no permitido.' });

    const data = payload(req);
    if (data.website) return reply(200, { ok: true }); // honeypot: bots get a silent success

    const ip = clean((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress, 64) || 'unknown';
    const rateKey = 'reservas-rl:' + crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
    const count = await redis('INCR', rateKey);
    if (count === 1) await redis('EXPIRE', rateKey, 3600);
    if (count > PER_IP_HOUR) return reply(429, { error: 'Demasiados envíos. Probá más tarde.' });

    const entry = entryFrom(data);
    if (!entry) return reply(400, { error: 'Datos incompletos.' });
    await redis('LPUSH', KEY, JSON.stringify(entry));
    await redis('LTRIM', KEY, 0, MAX_STORED - 1);
    return reply(200, { ok: true });
  } catch (error) {
    console.error(error);
    return reply(500, { error: 'No pudimos guardar el pedido.' });
  }
};
