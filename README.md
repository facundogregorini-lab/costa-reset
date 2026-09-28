# Costa Reset Club

Landing del cowork y coliving frente al mar en Chapadmalal. Sitio estático (HTML, CSS y JavaScript, sin compilación) con una función de Vercel para guardar las reservas.

Contenido, fotos y estilo tomados de la versión de Lovable (`costa-reset-flow`). Las fotos se convirtieron a WebP en dos tamaños: la página pesa 1,8 MB en lugar de 10 MB.

## Qué hace

- Hero con fotos que se alternan, manifiesto, el lugar, habitación, equipos, oferta desde USD 40 por noche y formulario de reserva.
- **Reserva:** nombre, WhatsApp y fechas. Abre WhatsApp con el mensaje armado (como antes) y además guarda la solicitud en la base, por si la persona no llega a enviar el mensaje.
- **`/admin.html`:** lista privada de las reservas, protegida con una clave.
- **Página de gracias** (`gracias.html`) después de cada formulario, con los próximos pasos; ahí se dispara el evento `Lead` del píxel.
- Botón flotante de WhatsApp, calculadora de precio estimado en el formulario y sección "Cómo llegar" con mapa ilustrativo.
- Botón fijo "Reservar" en celulares, animaciones suaves (se desactivan con "reducir movimiento"), datos estructurados para Google y vista previa para redes.

## Propuesta de valor

Dos públicos con su propio camino: **profesionales remotos** (pre-reserva con fechas, que abre WhatsApp) y **empresas** (pedido de propuesta: beneficio de workation, offsites o eventos). La sección **Comunidad** presenta las semanas temáticas con startups, fondos e industrias como calendario en armado de la primera temporada.

## Tesis para inversores y empresas

`/tesis` presenta el problema, la evidencia, el tamaño de mercado (con fuentes y supuestos marcados) y una calculadora que muestra qué fracción del mercado hace falta para llenar una sede o una cadena. `vercel.json` activa `cleanUrls`, así las páginas funcionan sin `.html`.

## Medir los anuncios

- Cada pedido guarda de dónde vino: `utm_source`, `utm_campaign`, etc., `gclid` o `fbclid`. Usá UTM en todos los anuncios, por ejemplo `?utm_source=meta&utm_campaign=remotos-oct`.
- `/admin.html` muestra el total de pre-reservas, noches pedidas, pedidos de empresas y los pedidos por campaña.
- Si instalás el píxel de Meta o la etiqueta de Google en `index.html` (hay un comentario que marca el lugar), cada formulario envía el evento de conversión `Lead` / `generate_lead`.

## Publicar en Vercel

1. **Add New → Project** e importá `costa-reset`. Framework: **Other**, sin comando de build.
2. Para guardar reservas: **Storage → Upstash for Redis** (o cualquier Redis) y conectala al proyecto.
3. En **Settings → Environment Variables** agregá `RESERVAS_KEY` con una clave larga: es la que pide `/admin.html`.
4. **Redeploy.**

Sin la base, el formulario sigue funcionando por WhatsApp; solo no se guarda la copia.

La landing está en https://costa-reset.vercel.app. Si cambiás de dominio, actualizá `og:image`, `og:url` y `canonical` en `index.html`.

## Desarrollo

```sh
npm install
npm run dev     # http://127.0.0.1:3000, con base en memoria (clave de admin: clave-local-123)
npx playwright install chromium
npm test        # pruebas en navegador: formulario, WhatsApp, admin, celular
```
