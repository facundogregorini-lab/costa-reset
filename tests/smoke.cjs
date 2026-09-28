// Browser checks for the landing. Run: npm test (needs Playwright's Chromium).
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('./server.cjs');
const SITE = 'http://127.0.0.1:4183';
const shots = path.resolve(__dirname, '..', 'test-results'); fs.mkdirSync(shots, { recursive: true });
const reports = []; const check = (name, ok) => { assert.ok(ok, name); reports.push(name); console.log('PASS', name); };
const iso = offset => new Date(Date.now() + offset * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

(async () => {
  const server = createServer(); await new Promise(r => server.listen(4183, '127.0.0.1', r));
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(SITE, { waitUntil: 'load' });
    check('Title and headline', (await page.title()).includes('Costa Reset Club') && (await page.textContent('h1')).includes('Encontrá tu mejor versión'));
    check('All sections present', await page.evaluate(() => ['manifiesto', 'lugar', 'habitacion', 'equipos', 'oferta', 'reservar'].every(id => document.getElementById(id))));
    check('Price shown', (await page.textContent('#oferta')).includes('USD 40'));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80)); } scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForTimeout(1200);
    check('All images load', await page.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)));
    check('Sections reveal on scroll', await page.evaluate(() => [...document.querySelectorAll('.reveal')].every(el => el.classList.contains('in'))));
    await page.screenshot({ path: path.join(shots, 'desktop-hero.png') });
    await page.screenshot({ path: path.join(shots, 'desktop-full.png'), fullPage: true });

    // Form validation
    await page.click('#reserveForm button[type=submit]');
    check('Empty form asks for the name', (await page.textContent('#formError')).includes('nombre'));
    await page.fill('#name', 'Ana Pérez'); await page.fill('#whatsapp', '12');
    await page.click('#reserveForm button[type=submit]');
    check('Invalid WhatsApp is rejected', (await page.textContent('#formError')).includes('WhatsApp'));
    await page.fill('#whatsapp', '+54 9 11 5555-1234');
    await page.fill('#from', iso(10)); await page.dispatchEvent('#from', 'change');
    await page.fill('#to', iso(8)); await page.dispatchEvent('#to', 'change');
    await page.click('#reserveForm button[type=submit]');
    check('Departure before arrival is rejected', (await page.textContent('#formError')).includes('salida'));
    await page.fill('#to', iso(13)); await page.dispatchEvent('#to', 'change');
    check('Nights are counted', (await page.textContent('#nights')).includes('3 noches'));
    await page.check('#team');

    // Submit opens WhatsApp with the details and stores the booking
    await page.context().route('https://wa.me/**', r => r.fulfill({ body: 'whatsapp' }));
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('#reserveForm button[type=submit]')]);
    const text = decodeURIComponent(new URL(popup.url()).searchParams.get('text'));
    check('WhatsApp opens with the booking', popup.url().startsWith('https://wa.me/5491132524245') && text.includes('Ana Pérez') && text.includes('3 noches') && text.includes('equipo'));
    await popup.close();
    check('Confirmation toast', (await page.textContent('#toast')).includes('WhatsApp'));
    check('Form resets', (await page.inputValue('#name')) === '' && (await page.textContent('#nights')) === '');
    await page.waitForTimeout(300);

    // Admin page
    const admin = await browser.newPage();
    admin.on('pageerror', e => errors.push(e.message));
    await admin.goto(SITE + '/admin.html');
    await admin.fill('#key', 'incorrecta'); await admin.click('#login button');
    await admin.waitForFunction(() => document.getElementById('status').textContent.includes('Clave'));
    check('Admin rejects a wrong key', true);
    await admin.fill('#key', 'clave-local-123'); await admin.click('#login button');
    await admin.waitForSelector('#rows tr');
    const row = await admin.textContent('#rows tr');
    check('Admin lists the booking', row.includes('Ana Pérez') && row.includes('3') && row.includes('Sí'));
    await admin.screenshot({ path: path.join(shots, 'admin.png') });

    // API guards
    const post = body => fetch(SITE + '/api/reserva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    check('API rejects incomplete data', (await post({ name: 'x' })).status === 400);
    const before = (await (await fetch(SITE + '/api/reserva', { headers: { Authorization: 'Bearer clave-local-123' } })).json()).reservas.length;
    await post({ name: 'Bot', whatsapp: '123456789', from: iso(2), to: iso(4), website: 'spam' });
    const after = (await (await fetch(SITE + '/api/reserva', { headers: { Authorization: 'Bearer clave-local-123' } })).json()).reservas.length;
    check('Honeypot drops bots silently', before === after);

    // Mobile
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    phone.on('pageerror', e => errors.push(e.message));
    await phone.goto(SITE, { waitUntil: 'load' });
    check('No horizontal scroll on mobile', await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('Sticky CTA hidden on the hero', !(await phone.evaluate(() => document.getElementById('mobileCta').classList.contains('visible'))));
    await phone.evaluate(() => scrollTo({ top: innerHeight * 2, behavior: 'instant' })); await phone.waitForTimeout(600);
    check('Sticky CTA appears after the hero', await phone.evaluate(() => document.getElementById('mobileCta').classList.contains('visible')));
    await phone.screenshot({ path: path.join(shots, 'mobile-scroll.png') });
    await phone.evaluate(() => document.getElementById('reservar').scrollIntoView({ behavior: 'instant' })); await phone.waitForTimeout(600);
    check('Sticky CTA hides at the form', !(await phone.evaluate(() => document.getElementById('mobileCta').classList.contains('visible'))));
    await phone.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await phone.waitForTimeout(300);
    await phone.screenshot({ path: path.join(shots, 'mobile-hero.png') });
    await phone.screenshot({ path: path.join(shots, 'mobile-full.png'), fullPage: true });

    // Reduced motion shows everything without animating
    const calm = await browser.newPage({ reducedMotion: 'reduce' });
    await calm.goto(SITE, { waitUntil: 'load' });
    check('Reduced motion keeps content visible', await calm.evaluate(() => getComputedStyle(document.querySelector('#manifiesto .reveal')).opacity === '1'));

    check('No uncaught browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: reports.length, errors }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
