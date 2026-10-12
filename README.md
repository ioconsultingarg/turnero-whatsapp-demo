# turnero-whatsapp-demo

![Licencia: todos los derechos reservados](https://img.shields.io/badge/licencia-todos%20los%20derechos%20reservados-b91c1c) ![No es open source](https://img.shields.io/badge/open%20source-no-b91c1c)

> [!CAUTION]
> **© 2026 Gonzalo Nicolás Bravo — IO Consulting. Todos los derechos reservados.**
>
> Este repositorio es público **solo** para publicar la demo con GitHub Pages. **No es software libre ni de código abierto.** No tenés permiso para copiar, clonar, modificar, redistribuir ni reutilizar este código o sus partes en otros proyectos, personales o comerciales, ni para usarlo en el entrenamiento de modelos de IA. El uso no autorizado infringe la Ley 11.723 de Propiedad Intelectual (Argentina). Condiciones completas en [`LICENSE`](LICENSE). Para pedir permisos: contacto@ioconsulting.com.ar.
>
> **All rights reserved.** This repository is public **only** to serve a GitHub Pages demo. **It is not free or open source software.** You may not copy, clone, modify, redistribute or reuse this code or any part of it in other projects, personal or commercial, or use it to train AI models. Unauthorized use infringes copyright. Full terms in [`LICENSE`](LICENSE). To request permission: contacto@ioconsulting.com.ar.


Automatización de WhatsApp para Pizzería IO Consulting (mismo cliente ficticio que `landing-comercio-demo` y `menu-qr-demo`), demo de portfolio de **IO Consulting**. A diferencia de los otros dos demos, esto no es un sitio autocontenido — son workflows de **n8n** que se conectan a la **WhatsApp Business Cloud API** de Meta.

## Problema que resuelve

El dueño (o quien atienda el WhatsApp del local) pierde pedidos cuando el negocio está cerrado, y se olvida de mandar recordatorios de reserva, lo que aumenta el ausentismo. Estos dos flujos automatizan eso sin que nadie tenga que estar pendiente del celular.

## Qué incluye

- `index.html` — **simulador visual** de las dos conversaciones (esto es lo que se ve publicado en GitHub Pages, sin necesidad de tener n8n corriendo)
- `workflows/auto-respuesta-fuera-horario.json` — responde automáticamente fuera del horario de atención, con el link al menú
- `workflows/confirmacion-y-recordatorio-turno.json` — confirma la reserva al agendarse y manda un recordatorio 24hs antes

**Importante:** los archivos `.json` son plantillas de referencia en el formato de exportación de n8n. Según la versión de n8n que uses, al importarlas puede hacer falta ajustar algún parámetro o el `typeVersion` de algún nodo; probalas siempre con el número de prueba de Meta antes de usarlas con clientes. Si el import da problemas, más abajo está la receta para armar cada flujo a mano en un par de minutos.

## Requisitos para correrlo de verdad

1. Una instancia de n8n corriendo (self-hosted o n8n Cloud)
2. Una app en [Meta for Developers](https://developers.facebook.com/) con el producto **WhatsApp Business Platform** activado, y un número de prueba (Meta te da uno gratis para testear)
3. En n8n, credencial de tipo **WhatsApp Business Cloud** con el access token y el phone number ID de esa app
4. Dos **plantillas de mensaje aprobadas** en Meta (categoría Utilidad, idioma `es_AR`). La confirmación y el recordatorio los inicia el negocio, y WhatsApp solo permite texto libre dentro de las 24hs posteriores al último mensaje del cliente:
   - `confirmacion_reserva`: "¡Hola {{1}}! Confirmamos tu reserva en Pizzería IO Consulting 🍕 📅 {{2}} a las {{3}} 👥 {{4}} personas. Si necesitás cambiar el horario, respondé este mensaje. ¡Te esperamos!"
   - `recordatorio_reserva`: "¡Hola {{1}}! Te recordamos tu reserva mañana {{2}} a las {{3}} en Pizzería IO Consulting 🍕 Si no podés venir, respondé este mensaje para cancelar o reprogramar. ¡Te esperamos!"
5. Para el flujo de recordatorio: una fuente de datos con las reservas (Google Sheets, Supabase, o el mismo sistema de turnos del portfolio) — el JSON asume una hoja de Sheets llamada "Reservas" con columnas `nombre`, `telefono` (formato `5491122334455`), `fecha` (`AAAA-MM-DD`), `hora` (`HH:MM`) y `recordatorioEnviado` (la completa el flujo)
6. Consentimiento de cada cliente para recibir mensajes por WhatsApp (lo exige Meta) y un aviso de privacidad sobre el uso de su nombre y teléfono (Ley 25.326)

## Cómo importar los workflows

En n8n: menú de arriba a la derecha → **Import from File** → elegir el `.json` correspondiente. Después:

1. Abrir cada nodo de WhatsApp y asignar tu credencial real (donde dice `REPLACE_ME`)
2. Completar `REPLACE_ME_PHONE_NUMBER_ID` con el ID de tu número de WhatsApp Business
3. En el flujo de recordatorio, completar `REPLACE_ME_GOOGLE_SHEET_ID` (aparece en dos nodos) y la credencial de Google Sheets
4. En el nodo **Nuevo turno (Webhook)**, crear una credencial **Header Auth** con un nombre de header y un valor secreto largo y aleatorio. El sistema de turnos tiene que mandar ese header en cada llamada; sin él, el webhook responde 403
5. Activar el workflow (toggle arriba a la derecha)

## Receta manual (si el import falla)

**Auto-respuesta fuera de horario:**
1. Nodo trigger: **WhatsApp Trigger** (evento "messages")
2. Nodo **Code**: descarta los eventos que no son mensajes entrantes, evita responderle dos veces seguidas al mismo contacto y calcula si la hora actual está fuera del horario de atención
3. Nodo **IF**: si está fuera de horario, sigue por una rama; si no, por otra
4. Cada rama termina en un nodo **WhatsApp → Send Message** con el texto correspondiente

**Confirmación y recordatorio:**
1. Un **Webhook** con autenticación Header Auth que recibe la reserva nueva (desde el sistema de turnos) → nodo **IF** que valida el teléfono → nodo **WhatsApp → Send Template** con la confirmación
2. Por separado, un **Schedule Trigger** cada 1 hora → nodo **Google Sheets (Read)** con las reservas → nodo **Code** que filtra las que están a ~24hs → nodo **WhatsApp → Send Template** con el recordatorio → nodo **Google Sheets (Update)** que marca `recordatorioEnviado`

## Ver el simulador

Publicado en GitHub Pages: `https://ioconsultingarg.github.io/turnero-whatsapp-demo/` — sirve para mostrarle a un prospecto cómo se ve la conversación del lado del cliente, sin necesitar credenciales reales ni una instancia de n8n prendida.

![Demo del simulador: cambio entre escenario de fuera de horario y confirmación/recordatorio de turno](assets/turnero-whatsapp-simulador-demo.gif)

## Cómo adaptarlo a otro rubro

Los dos flujos son genéricos: "auto-respuesta fuera de horario" sirve para cualquier PyME, y "confirmación + recordatorio" sirve igual para un turno médico, una clase, o una cancha — solo cambia el texto de los mensajes y la fuente de datos de las reservas.

## Estructura

```
turnero-whatsapp-demo/
├── index.html              (simulador visual)
├── 404.html
├── assets/                 (favicon, imagen para compartir, GIF del README)
├── css/styles.css
├── js/simulador.js
├── workflows/
│   ├── auto-respuesta-fuera-horario.json
│   └── confirmacion-y-recordatorio-turno.json
├── README.md
└── LICENSE
```

## Próximas mejoras posibles

- Bot de FAQ con IA (Claude API) para preguntas frecuentes fuera de las dos ramas actuales
- Encuesta de satisfacción automática post-pedido
- Reemplazar Google Sheets por Supabase para el flujo de recordatorio

---
Parte del portfolio de demos de transformación digital de IO Consulting.
