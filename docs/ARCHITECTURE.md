# 🏛️ Mejía Travel — Arquitectura, claves y lógica

Documento de referencia para mantener la app a mediano plazo.

## 1. Stack

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTES                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Web (PWA)    │ │ App Android  │ │ App iOS (WebView)    │ │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
   ┌───────────────────────────────────────────────────┐
   │  Next.js 14 (App Router)  →  Railway              │
   │  - SSR / RSC / API routes                         │
   │  - /api/chat → Groq Llama 3.3                     │
   └────────────┬──────────────────────────────────────┘
                │
                ▼
   ┌───────────────────────────────────────────────────┐
   │  Supabase                                         │
   │  - PostgreSQL (RLS)                               │
   │  - Auth (email + magic link)                      │
   │  - Storage (bucket "media")                       │
   └───────────────────────────────────────────────────┘
```

## 2. Variables de entorno

| Variable | Dónde se usa | Ejemplo / origen |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | `https://tuhhdcpugmqherkglhvy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (admin tasks) | Service role — **NUNCA** exponer |
| `GROQ_API_KEY` | `/api/chat` | https://console.groq.com |
| `NEXT_PUBLIC_SITE_URL` | Redirects de auth, OG | `https://mejia.chaskibots.com` |

> Configúralas en Railway → *Variables*. Localmente: `.env.local`.

### 🔑 ¿Cuál clave usa el navegador?

Sólo las que empiezan con `NEXT_PUBLIC_`. Estas son **públicas** por diseño;
la seguridad real la hace **RLS en Supabase** (políticas por fila).
La `SERVICE_ROLE_KEY` sólo vive en el backend (Railway env), nunca llega al
navegador ni a la app móvil.

## 3. Tablas principales

| Tabla | Propósito |
|---|---|
| `profiles` | Usuarios (rol: user / admin) |
| `categories` / `subcategories` | Taxonomía dinámica |
| `businesses` | Negocios con foto, contacto, ubicación |
| `professionals` | Profesionales independientes |
| `coops` | Cooperativas de transporte |
| `events` | Agenda de eventos |
| `tourist_routes` + `route_stops` | Rutas turísticas con paradas |
| `marketplace_items` | Mercado temporal |
| `banners` | Banners del home |
| `reviews` | Reseñas |
| `analytics` | Tracking de clicks (call/whatsapp/map) |
| `app_settings` | Configuración global del admin |

Todas tienen **RLS activa**: lectura pública para `is_published = true`,
escritura sólo para `auth.uid()` con rol admin.

## 4. Storage (`bucket = media`)

- Bucket público para **lectura**.
- Subida limitada a admins (ver `supabase/storage.sql`).
- Estructura recomendada de carpetas:
  - `negocios/{userId}/{ts}.jpg`
  - `eventos/{userId}/{ts}.jpg`
  - `rutas/{userId}/{ts}.jpg`
  - `banners/{userId}/{ts}.jpg`
- Componente `<ImageUpload>` se encarga de subir + devolver la URL pública.
  Permite también pegar una **URL externa** si no quieres alojar la imagen.

## 5. Interfaces (UI)

### Pública

| Ruta | Función |
|---|---|
| `/` | Home: hero + categorías + destacados + eventos + rutas |
| `/categorias/[slug]` | Listado por categoría con filtros |
| `/negocios/[slug]` | Ficha completa del negocio |
| `/profesionales`, `/cooperativas` | Listados |
| `/eventos`, `/eventos/[id]` | Agenda |
| `/rutas`, `/rutas/[slug]` | Rutas turísticas con mapa |
| `/mercado` | Marketplace |
| `/buscar?q=` | Búsqueda multi-entidad |
| `/cuenta` | Login + perfil del usuario |

### Admin (`/admin/*`, requiere rol admin)

| Ruta | Función |
|---|---|
| `/admin` | Dashboard con métricas |
| `/admin/negocios` | CRUD negocios |
| `/admin/categorias` | CRUD categorías + subcategorías |
| `/admin/profesionales` | CRUD profesionales |
| `/admin/cooperativas` | CRUD cooperativas |
| `/admin/eventos` | CRUD eventos |
| `/admin/mercado` | Moderación marketplace |
| `/admin/banners` | Banners del home |
| `/admin/rutas` | CRUD rutas con paradas |
| `/admin/ajustes` | Configuración global |

## 6. Lógica de subida de imágenes

```
[Admin] selecciona foto en <ImageUpload>
   │
   ▼
supabase.storage.from('media').upload(path, file)
   │  (RLS comprueba que sea admin)
   ▼
getPublicUrl(path) → URL pública con CDN
   │
   ▼
Se guarda esa URL en la tabla correspondiente (cover_image, logo, etc.)
```

Si el usuario prefiere no subir, puede pegar una URL externa
(Wikimedia, Pexels, etc.) y la app la trata igual.

## 7. AI Assistant

`/api/chat/route.ts` recibe los mensajes, antepone un *system prompt* con
contexto del cantón Mejía y llama al endpoint de **Groq** con el modelo
`llama-3.3-70b-versatile`. La respuesta se transmite al componente
`<AIAssistant>` flotante en el home.

## 8. PWA

- `public/manifest.json` define nombre, colores, iconos.
- `public/sw.js` cachea la *app shell* y permite instalación.
- Iconos PNG generados desde `public/icons/icon.svg` con
  `npm run icons` (script `scripts/gen-icons.mjs`).

## 9. Apps nativas

Ver `docs/MOBILE.md`.
