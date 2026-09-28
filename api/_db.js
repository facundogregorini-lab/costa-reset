// Redis helpers for the Vercel functions. Files starting with "_" are not exposed as routes.
// Works with Upstash (REST: *KV_REST_API_URL / *UPSTASH_REDIS_REST_URL) or any Redis (REDIS_URL).
const memory = new Map(); // only for local development (RESERVAS_MEMORY_DB=1)

function restConfig() {
  for (const suffix of ['KV_REST_API', 'UPSTASH_REDIS_REST']) {
    const urlKey = Object.keys(process.env).find(k => k.endsWith(suffix + '_URL'));
    if (!urlKey) continue;
    const token = process.env[urlKey.slice(0, -'_URL'.length) + '_TOKEN'];
    if (process.env[urlKey] && token) return { url: process.env[urlKey], token };
  }
  return null;
}

function tcpUrl() {
  const key = Object.keys(process.env).find(k => /(^|_)(REDIS_URL|KV_URL)$/.test(k) && /^rediss?:\/\//.test(process.env[k]));
  return key ? process.env[key] : null;
}

let tcpClient = null;
function tcp(url) {
  tcpClient ??= (async () => {
    const { createClient } = require('redis');
    const client = createClient({ url });
    client.on('error', error => console.error('Redis:', error.message));
    await client.connect();
    client.unref();
    return client;
  })().catch(error => { tcpClient = null; throw error; });
  return tcpClient;
}

function memoryCommand([cmd, key, ...args]) {
  switch (cmd) {
    case 'INCR': { const n = Number(memory.get(key) || 0) + 1; memory.set(key, n); return n; }
    case 'EXPIRE': return 1;
    case 'LPUSH': { const list = memory.get(key) || []; list.unshift(...args.reverse()); memory.set(key, list); return list.length; }
    case 'LTRIM': { memory.set(key, (memory.get(key) || []).slice(Number(args[0]), Number(args[1]) + 1)); return 'OK'; }
    case 'LRANGE': { const end = Number(args[1]); return (memory.get(key) || []).slice(Number(args[0]), end < 0 ? undefined : end + 1); }
    default: throw new Error('Unsupported command ' + cmd);
  }
}

const configured = () => Boolean(restConfig() || tcpUrl() || process.env.RESERVAS_MEMORY_DB === '1');

async function redis(...command) {
  command = command.map(String);
  const rest = restConfig();
  if (rest) {
    const response = await fetch(rest.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + rest.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.error) throw new Error('Redis: ' + (json.error || response.status));
    return json.result;
  }
  const url = tcpUrl();
  if (url) return (await tcp(url)).sendCommand(command);
  if (process.env.RESERVAS_MEMORY_DB === '1') return memoryCommand(command);
  throw new Error('No database configured');
}

module.exports = { redis, configured };
