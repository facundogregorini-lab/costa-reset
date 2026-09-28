# Costa Reset Club

Landing del cowork y coliving frente al mar en Chapadmalal. Sitio estático (HTML, CSS y JavaScript, sin compilación) con una función de Vercel para guardar las reservas.

Contenido, fotos y estilo tomados de la versión de Lovable (`costa-reset-flow`). Las fotos se convirtieron a WebP en dos tamaños: la página pesa 1,8 MB en lugar de 10 MB.

## Qué hace

- Hero con fotos que se alternan, manifiesto, el lugar, habitación, equipos, oferta desde USD 40 por noche y formulario de reserva.
- **Reserva:** nombre, WhatsApp y fechas. Abre WhatsApp con el mensaje armado (como antes) y además guarda la solicitud en la base, por si la persona no llega a enviar el mensaje.
- **`/admin.html`:** lista privada de las reservas, protegida con una clave.
- Botón fijo "Reservar" en celulares, animaciones suaves (se desactivan con "reducir movimiento"), datos estructurados para Google y vista previa para redes.

## Publicar en Vercel

1. **Add New → Project** e importá `costa-reset`. Framework: **Other**, sin comando de build.
2. Para guardar reservas: **Storage → Upstash for Redis** (o cualquier Redis) y conectala al proyecto.
3. En **Settings → Environment Variables** agregá `RESERVAS_KEY` con una clave larga: es la que pide `/admin.html`.
4. **Redeploy.**

Sin la base, el formulario sigue funcionando por WhatsApp; solo no se guarda la copia.

Cuando tengas el dominio definitivo, cambiá `og:image` en `index.html` por la URL completa (`https://tu-dominio/img/og.jpg`) para que la vista previa se vea en WhatsApp y redes.

## Desarrollo

```sh
npm install
npm run dev     # http://127.0.0.1:3000, con base en memoria (clave de admin: clave-local-123)
npx playwright install chromium
npm test        # pruebas en navegador: formulario, WhatsApp, admin, celular
```
