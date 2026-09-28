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
    // Meta's script is stubbed, so every fbq() call stays in fbq.queue where we can inspect it.
    await page.context().route('https://connect.facebook.net/**', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
    const fbqCalls = () => page.evaluate(() => window.fbq.queue.map(args => [...args]));
    await page.goto(SITE + '/?utm_source=meta&utm_campaign=validacion-oct', { waitUntil: 'load' });
    check('Title and headline', (await page.title()).includes('Costa Reset Club') && (await page.textContent('h1')).includes('frente al mar'));
    check('All sections present', await page.evaluate(() => ['para-quien', 'dia', 'lugar', 'habitacion', 'empresas', 'comunidad', 'precios', 'preguntas', 'reservar'].every(id => document.getElementById(id))));
    check('Price shown', (await page.textContent('#precios')).includes('USD 40'));
    await page.click('#preguntas summary >> nth=2'); check('FAQ opens', await page.isVisible('#preguntas details:nth-child(3) p'));
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80)); } scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForTimeout(1200);
    check('All images load', await page.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)));
    check('Sections reveal on scroll', await page.evaluate(() => [...document.querySelectorAll('.reveal')].every(el => el.classList.contains('in'))));
    await page.screenshot({ path: path.join(shots, 'desktop-hero.png') });
    await page.screenshot({ path: path.join(shots, 'desktop-full.png'), fullPage: true });

    // Form validation
    await page.click('#reserveForm button[type=submit]');
    check('Empty form asks for the name', (await page.textContent('#reserveForm .error')).includes('nombre'));
    await page.fill('#name', 'Ana Pérez'); await page.fill('#whatsapp', '12');
    await page.click('#reserveForm button[type=submit]');
    check('Invalid WhatsApp is rejected', (await page.textContent('#reserveForm .error')).includes('WhatsApp'));
    await page.fill('#whatsapp', '+54 9 11 5555-1234');
    await page.fill('#from', iso(10)); await page.dispatchEvent('#from', 'change');
    await page.fill('#to', iso(8)); await page.dispatchEvent('#to', 'change');
    await page.click('#reserveForm button[type=submit]');
    check('Departure before arrival is rejected', (await page.textContent('#reserveForm .error')).includes('salida'));
    await page.fill('#to', iso(13)); await page.dispatchEvent('#to', 'change');
    check('Nights are counted', (await page.textContent('#nights')).includes('3 noches'));
    await page.click('#reserveForm button[type=submit]');
    check('Asks how they come', (await page.textContent('#reserveForm .error')).includes('cómo venís'));
    await page.selectOption('#mode', 'Me lo ofrece mi empresa');

    // Submit opens WhatsApp with the details and stores the booking
    await page.context().route('https://wa.me/**', r => r.fulfill({ body: 'whatsapp' }));
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('#reserveForm button[type=submit]')]);
    const text = decodeURIComponent(new URL(popup.url()).searchParams.get('text'));
    check('WhatsApp opens with the booking', popup.url().startsWith('https://wa.me/5491132524245') && text.includes('Ana Pérez') && text.includes('3 noches') && text.includes('Me lo ofrece mi empresa'));
    await popup.close();
    const leads = (await fbqCalls()).filter(c => c[0] === 'track' && c[1] === 'Lead');
    check('Pixel is initialised with PageView', (await fbqCalls()).some(c => c[0] === 'init' && c[1] === '1671294247882059') && (await fbqCalls()).some(c => c[1] === 'PageView'));
    check('Booking fires a Lead with an eventID', leads.length === 1 && leads[0][2].content_name === 'reserva' && leads[0][3].eventID?.length > 8);
    const bookingEventId = leads[0][3].eventID;
    check('Confirmation toast', (await page.textContent('#toast')).includes('WhatsApp'));
    check('Form resets', (await page.inputValue('#name')) === '' && (await page.textContent('#nights')) === '');
    await page.waitForTimeout(300);

    // Company form
    await page.click('#companyForm button[type=submit]');
    check('Company form validates', (await page.textContent('#companyForm .error')).includes('nombre'));
    await page.fill('#c-name', 'Laura Gómez'); await page.fill('#c-company', 'Acme SA'); await page.fill('#c-email', 'laura@acme');
    await page.selectOption('#c-size', '51 a 200'); await page.selectOption('#c-interest', 'Offsite de equipo');
    await page.click('#companyForm button[type=submit]');
    check('Company email is validated', (await page.textContent('#companyForm .error')).includes('email'));
    await page.fill('#c-email', 'laura@acme.com'); await page.click('#companyForm button[type=submit]');
    await page.waitForFunction(() => document.querySelector('#companyForm .form-title').textContent.includes('Gracias'));
    check('Company request is sent', (await page.textContent('#toast')).includes('Recibimos'));
    const companyLead = (await fbqCalls()).filter(c => c[1] === 'Lead').pop();
    check('Company request fires its own Lead', companyLead[2].content_name === 'empresa' && companyLead[3].eventID !== bookingEventId);
    const [waPopup] = await Promise.all([page.waitForEvent('popup'), page.click('.btn-wa')]);
    await waPopup.close();
    check('WhatsApp clicks fire Contact', (await fbqCalls()).some(c => c[1] === 'Contact'));

    // Admin page
    const admin = await browser.newPage();
    admin.on('pageerror', e => errors.push(e.message));
    await admin.goto(SITE + '/admin.html');
    await admin.fill('#key', 'incorrecta'); await admin.click('#login button');
    await admin.waitForFunction(() => document.getElementById('status').textContent.includes('Clave'));
    check('Admin rejects a wrong key', true);
    await admin.fill('#key', 'clave-local-123'); await admin.click('#login button');
    await admin.waitForSelector('#rows tr');
    const rows = await admin.$$eval('#rows tr', trs => trs.map(t => t.textContent));
    check('Admin lists the company request', rows[0].includes('Acme SA') && rows[0].includes('Offsite') && rows[0].includes('meta · validacion-oct'));
    check('Admin lists the booking with its source', rows[1].includes('Ana Pérez') && rows[1].includes('3 n.') && rows[1].includes('Me lo ofrece mi empresa') && rows[1].includes('meta · validacion-oct'));
    const summary = await admin.textContent('#summary');
    const stored = (await (await fetch(SITE + '/api/reserva', { headers: { Authorization: 'Bearer clave-local-123' } })).json()).reservas;
    check('Server keeps the eventID for deduplication', stored.some(x => x.eventId === bookingEventId) && stored.some(x => x.type === 'empresa' && x.eventId));
    check('Admin summary counts leads by campaign', summary.includes('1pre-reservas') && summary.includes('3noches') && summary.includes('1empresas') && summary.includes('2meta · validacion-oct'));
    await admin.screenshot({ path: path.join(shots, 'admin.png') });

    // API guards
    const post = body => fetch(SITE + '/api/reserva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    check('API rejects incomplete data', (await post({ name: 'x' })).status === 400 && (await post({ type: 'empresa', name: 'Ana', company: 'X', email: 'nope' })).status === 400);
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
    check('Reduced motion keeps content visible', await calm.evaluate(() => getComputedStyle(document.querySelector('#para-quien .reveal')).opacity === '1'));

    check('No uncaught browser errors', errors.length === 0);
    console.log(JSON.stringify({ passed: reports.length, errors }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
