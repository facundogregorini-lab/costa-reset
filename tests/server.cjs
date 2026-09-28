// Local server that mimics Vercel: static files + api/*.js, with an in-memory database.
// Usage: npm run dev  →  http://127.0.0.1:3000
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
process.env.RESERVAS_MEMORY_DB ??= '1';
process.env.RESERVAS_KEY ??= 'clave-local-123';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain' };

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const api = /^\/api\/([a-z]+)$/.exec(url.pathname);
    if (api) {
      const file = path.join(root, 'api', api[1] + '.js');
      if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('{}'); }
      let raw = ''; for await (const chunk of req) raw += chunk;
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
      res.status = code => { res.statusCode = code; return res; };
      res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
      return require(file)(req, res);
    }
    let rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    if (!path.extname(rel) && fs.existsSync(path.join(root, rel + '.html'))) rel += '.html'; // like Vercel's cleanUrls
    const file = path.join(root, rel);
    if (!file.startsWith(root) || rel.startsWith('api/') || rel.startsWith('tests/') || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
}

module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, '127.0.0.1', () => console.log('Costa Reset en http://127.0.0.1:' + port));
}
