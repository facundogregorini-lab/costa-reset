# Campañas de validación · Costa Reset Club

**Qué queremos saber:** si hay gente dispuesta a reservar fechas (profesionales remotos) y empresas interesadas en pedir una propuesta. Cada anuncio lleva a la landing con su UTM, así en `/admin.html` se ve qué campaña trae pedidos.

> Landing: https://costa-reset.vercel.app

## 1. Antes de publicar

- [ ] **Píxel de Meta:** crealo en *Administrador de eventos → Conectar orígenes de datos → Web* y pasame el ID; lo instalo en la página. Los formularios ya envían el evento `Lead`.
- [ ] **Página de Facebook y cuenta de Instagram** de Costa Reset Club, conectadas al Business Manager.
- [ ] **Verificar el dominio** en Meta Business (*Configuración → Seguridad de la marca → Dominios*).
- [ ] **Probar la landing:** enviar una pre-reserva y un pedido de empresa y verlos en `/admin.html`.
- [ ] **Respuesta de WhatsApp lista** (ver punto 6): cada pre-reserva tiene que recibir respuesta el mismo día.

## 2. Presupuesto y duración sugeridos

| Campaña | Plataforma | Presupuesto | Duración |
|---|---|---|---|
| Remotos | Meta (Instagram + Facebook) | USD 10/día | 3 semanas |
| Empresas | LinkedIn | USD 10/día (mínimo de LinkedIn) | 2 semanas |
| Búsqueda | Google Ads (opcional) | USD 5/día | 3 semanas |

Total aproximado: USD 450–500. Conviene no tocar los anuncios los primeros 4–5 días para que la plataforma aprenda.

## 3. Cómo leer los resultados

- **Pre-reserva sin pago mide interés, no demanda.** La validación fuerte es cuántas personas, al responderles por WhatsApp, **aceptan dejar una seña** (aunque sea chica y reembolsable). Anotá ese número aparte.
- Mirá por campaña: clics, costo por clic, pre-reservas, **% de visitas que pre-reservan** y noches pedidas (en `/admin.html`).
- Para sacar conclusiones hacen falta varios cientos de visitas por ángulo. Con menos, los números cambian mucho de un día al otro.
- Compará los tres ángulos de Meta (A, B, C): el que traiga más pre-reservas por peso gastado es el mensaje a seguir.
- El campo "¿Cómo venís?" te dice cuánta gente espera que lo pague su empresa: si es alto, el camino B2B tiene más peso.

## 4. Meta · Campaña "Remotos"

- **Objetivo:** Clientes potenciales, con conversión en el sitio web (evento `Lead`). Sin píxel instalado, usá *Tráfico* mientras tanto.
- **Ubicación:** CABA, GBA, La Plata, Córdoba, Rosario, Mendoza y Mar del Plata.
- **Edad:** 25 a 45.
- **Público:** Advantage+ con sugerencias de intereses: trabajo remoto, teletrabajo, nómada digital, emprendimiento, startups, surf, running, bienestar.
- **Ubicaciones de anuncio:** Advantage+ (automáticas). Subí la versión *feed* (4:5) y la *story* (9:16) de cada pieza en el mismo anuncio.

### Anuncio A · El lugar
Piezas: `A-lugar-feed.jpg`, `A-lugar-story.jpg`

**Texto principal:**
> Cambiá el escritorio de tu casa por el mar unos días, sin cortar con el trabajo.
>
> Costa Reset Club es un coliving y cowork premium en la Costa Atlántica: cowork con vista, boxes para videollamadas, gym, pileta, surf y comida saludable a pasos de la playa.
>
> Primera temporada en armado. Pre-reservá tus fechas sin pagar y te confirmamos por WhatsApp.

**Título:** Tu semana de trabajo, frente al mar
**Descripción:** Pre-reserva sin pago
**Botón:** Más información
**Enlace:** `https://costa-reset.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=remotos&utm_content=a-lugar`

### Anuncio B · Un día
Piezas: `B-dia-feed.jpg`, `B-dia-story.jpg`

**Texto principal:**
> 07:00 surf. 09:00 bloque de foco. 13:00 almuerzo de verdad. 14:00 calls en un box sin ruido. 18:30 gym o pileta.
>
> Una jornada normal de trabajo, solo que frente al mar. Vos cumplís tu horario; nosotros resolvemos todo lo demás.

**Título:** Trabajá con foco. Viví con otra energía.
**Descripción:** Desde USD 40 por noche
**Botón:** Reservar
**Enlace:** `https://costa-reset.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=remotos&utm_content=b-dia`

### Anuncio C · El beneficio
Piezas: `C-beneficio-feed.jpg`, `C-beneficio-story.jpg`

**Texto principal:**
> ¿Tu empresa te deja trabajar remoto? Que sea desde la costa.
>
> Cowork con vista al mar, internet pensada para videollamadas, surf, gym y comida saludable. Venís por tu cuenta o se lo proponés a tu empresa como beneficio: tenemos planes para equipos.

**Título:** Trabajo remoto, desde la costa
**Descripción:** Planes para personas y empresas
**Botón:** Más información
**Enlace:** `https://costa-reset.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=remotos&utm_content=c-beneficio`

### Anuncio R · Reel "Un día" (video)
Pieza: `reel-un-dia.mp4` (9:16, 16 segundos, con sonido de mar). Subilo como anuncio aparte dentro del mismo conjunto de "Remotos".

**Texto principal:**
> 07:00 surf. 09:00 foco con vista. 14:00 calls sin ruido. 18:30 pileta.
>
> Coliving y cowork premium en la Costa Atlántica para profesionales remotos. Pre-reservá tus fechas sin pagar y te confirmamos por WhatsApp.

**Título:** Tu semana de trabajo, frente al mar
**Botón:** Más información
**Enlace:** `https://costa-reset.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=remotos&utm_content=r-reel`

Consejos: en *Ubicaciones* dejá las automáticas (el video se adapta a Reels, Stories y feed). Si Meta ofrece agregar música de su biblioteca, podés reemplazar el sonido de mar. El primer cuadro ya tiene el gancho, así que sirve como portada.

### Anuncio E · Comunidad (opcional, conjunto aparte)
Pieza: `E-comunidad-feed.jpg`. Público: intereses en startups, emprendimiento, inversión de riesgo, tecnología.

**Texto principal:**
> Estamos armando la primera temporada de semanas temáticas frente al mar: fintech, IA aplicada, agro y food tech. Founders, fondos e industria trabajando, entrenando y conversando en el mismo lugar.
>
> ¿Te interesa sumarte o querés organizar una semana con tu comunidad?

**Título:** Founders, fondos e industria. Frente al mar.
**Botón:** Más información
**Enlace:** `https://costa-reset.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=comunidad&utm_content=e-comunidad#comunidad`

## 5. LinkedIn · Campaña "Empresas"

- **Objetivo:** Visitas al sitio web.
- **Ubicación:** Argentina.
- **Cargos:** HR Manager, People Manager, Head of People, Talent Acquisition, Employer Branding, CEO, Founder, COO.
- **Tamaño de empresa:** 11 a 500 empleados.
- **Sectores:** software, servicios de TI, fintech, internet, consultoría.

Piezas: `D-empresas-cuadrado.jpg` (1:1) y `D-empresas-horizontal.jpg` (1,91:1).

**Texto de introducción:**
> Tu equipo trabaja remoto. ¿Qué beneficio los hace elegirte y quedarse?
>
> En Costa Reset Club armamos días de trabajo frente al mar para equipos: workation como beneficio (cada persona elige sus fechas), offsites de 2 a 5 días y eventos. Alojamiento, cowork, salas, comida y actividades, resueltos en un solo lugar.
>
> Estamos sumando las primeras empresas de la temporada. Pedí una propuesta sin compromiso.

**Título:** El beneficio que tu equipo sí va a usar
**Botón:** Solicitar presupuesto
**Enlace:** `https://costa-reset.vercel.app/?utm_source=linkedin&utm_medium=paid&utm_campaign=empresas&utm_content=d-beneficio#empresas`

## 6. Google Ads · Búsqueda (opcional)

- **Palabras clave** (concordancia de frase): "coworking frente al mar", "coliving argentina", "workation argentina", "coworking mar del plata", "coworking chapadmalal", "offsite empresas", "retiro de equipo empresa", "lugar para offsite".
- **Palabras negativas:** gratis, trabajo, empleo, alquiler anual, venta.
- **Enlace:** `https://costa-reset.vercel.app/?utm_source=google&utm_medium=cpc&utm_campaign=busqueda`

**Títulos** (máximo 30 caracteres):
Cowork frente al mar · Coliving en la costa · Trabajá desde Chapadmalal · Tu semana de trabajo al mar · Surf, gym y foco · Pre-reservá sin pagar · Desde USD 40 por noche · Boxes para videollamadas · Offsites para equipos · Workation para tu empresa · Costa Reset Club · Salas de reunión y cowork · Beneficio para tu equipo · Coliving para remotos · Cerca de Mar del Plata

**Descripciones** (máximo 90 caracteres):
1. Coliving y cowork premium para remotos: cowork con vista, surf, gym, pileta y comida sana.
2. Pre-reservá tus fechas sin pagar. Te confirmamos por WhatsApp en menos de 24 horas.
3. Workation y offsites para empresas que quieren atraer y retener talento. Pedí propuesta.
4. Boxes para llamadas, salas de reunión y escritorio en cada habitación. Trabajá con foco.

## 7. Respuesta por WhatsApp a cada pre-reserva

> ¡Hola, [nombre]! Gracias por tu pre-reserva en Costa Reset Club para el [fechas]. Estamos armando la primera temporada y te guardamos prioridad para esas fechas.
>
> Para confirmarla pedimos una seña de [monto], que te devolvemos completa si finalmente no abrimos en esas fechas. ¿Querés que te pasemos los datos?
>
> ¿Algo que te gustaría que tenga sí o sí tu estadía?

La última pregunta te sirve para aprender qué valora la gente. Anotá cada respuesta.

## 8. Cuidados

- Todas las piezas dicen "Imagen ilustrativa". Mantenelo mientras las fotos no sean del lugar real.
- No prometas en los anuncios cosas que la landing no dice: fechas de apertura, empresas o fondos confirmados.
- Si una seña se cobra, tiene que quedar claro por escrito cuándo y cómo se devuelve.
