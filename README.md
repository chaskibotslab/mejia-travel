# Mejía Travel

> Todo lo que buscas en el Cantón Mejía: turismo, servicios, gastronomía, hospedaje, emprendimientos, mercado 48h y agenda cultural — en una sola PWA.

App web instalable (Android / iOS / Desktop) construida con **Next.js 14 + Supabase + Tailwind**. Diseñada mobile-first para que cualquier persona pueda encontrar negocios y contactarlos con un toque (llamar, WhatsApp, mapa).

---

## ✨ Características

- **Catálogo categorizado**: 12 categorías raíz con subcategorías (turismo, hospedaje, restaurantes, salud, mecánicos, agroindustria, transporte, etc.).
- **Ficha de negocio completa**: portada, descripción, redes sociales, catálogo PDF, mapa, reseñas con estrellas.
- **Acciones rápidas**: llamar, WhatsApp pre-rellenado, abrir en Google Maps, sitio web.
- **Cerca de mí**: ordena por proximidad usando GPS del dispositivo.
- **Mercado Mejía 48h**: publicaciones temporales (autoexpiración) para vender en horas.
- **Agenda cultural**: eventos del GAD y privados.
- **Clima en tiempo real** del cantón (Open-Meteo, sin API key).
- **Mapa global** con todos los negocios geolocalizados (Leaflet + OpenStreetMap).
- **Panel para dueños**: registran su negocio, suben portada/catálogo, ven estadísticas (vistas, llamadas, WhatsApp).
- **Panel admin**: aprobar/destacar/verificar negocios y artículos, crear eventos.
- **Analítica de tráfico** por negocio y por evento.
- **PWA instalable** con manifest, service worker y soporte offline básico.
- **Branding municipal**: paleta del GAD de Mejía (teal/celeste/lima).

---

## 🚀 Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router, Server Components), React 18, TypeScript |
| Estilo | TailwindCSS, lucide-react |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Mapas | Leaflet + react-leaflet + OpenStreetMap |
| Clima | Open-Meteo (gratis, sin token) |
| Hosting | Railway (Nixpacks o Docker) |
| PWA | Service Worker custom + Web Manifest |

---

## 📦 Estructura del repo

```
mtravel/
├─ src/
│  ├─ app/                 # rutas (App Router)
│  │  ├─ page.tsx          # Home con grid de categorías
│  │  ├─ c/[slug]/         # Categoría / subcategoría
│  │  ├─ n/[slug]/         # Ficha del negocio
│  │  ├─ buscar/           # Búsqueda + Cerca de mí
│  │  ├─ mapa/             # Mapa global
│  │  ├─ mercado/          # Marketplace 48h
│  │  ├─ eventos/          # Agenda cultural
│  │  ├─ cuenta/           # Login / cuenta del usuario
│  │  ├─ panel/            # Dashboard dueños de negocio
│  │  └─ admin/            # Dashboard admin
│  ├─ components/          # UI compartida (TopBar, BottomNav, MapView, ...)
│  └─ lib/
│     ├─ supabase/         # clientes server + browser
│     ├─ types.ts
│     └─ utils.ts          # waLink, telLink, mapLink, timeAgo, ...
├─ supabase/
│  ├─ schema.sql           # Tablas + RLS + triggers + RPC
│  └─ seed.sql             # Categorías de demo
├─ public/                 # manifest, iconos, sw.js
├─ Dockerfile
├─ railway.json
└─ .env.example
```

---

## 🔧 Configuración local

### 1. Requisitos

- Node.js **20+**
- npm 10+
- Una cuenta gratis en [supabase.com](https://supabase.com)

### 2. Clonar e instalar

```bash
git clone <tu-repo> mtravel
cd mtravel
npm install
```

### 3. Configurar Supabase

1. Crea un proyecto nuevo en [app.supabase.com](https://app.supabase.com).
2. En **SQL Editor**, ejecuta primero `supabase/schema.sql` y después `supabase/seed.sql`.
3. En **Storage** crea un bucket llamado `public` y marca **Public bucket**.
4. En **Authentication → Providers**, habilita Email/Password.
5. Copia las credenciales desde **Settings → API** a un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Levantar en dev

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 5. Convertirte en admin

Después de registrarte por primera vez en `/cuenta`, ve a Supabase → Table editor → `profiles` y cambia `role` a `admin` para tu usuario. Recarga la app y ya tendrás acceso al panel `/admin`.

---

## ☁️ Deploy en Railway

### Opción A — Nixpacks (automático)

1. Haz push de este repo a GitHub.
2. En [railway.app](https://railway.app), **New Project → Deploy from GitHub repo**.
3. Selecciona el repo y la carpeta `mtravel/`.
4. En **Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (la URL pública que Railway te da)
5. Railway detecta `railway.json` y construye con Nixpacks automáticamente.
6. Cuando termine, expone el dominio en **Settings → Networking → Generate Domain**.

### Opción B — Docker

Railway también respeta el `Dockerfile`. Si prefieres esa ruta, simplemente añade `"builder": "DOCKERFILE"` en `railway.json`.

---

## 📲 Instalación como app

Una vez desplegado:

- **Android (Chrome)**: el navegador mostrará un banner "Añadir a pantalla de inicio". También: menú ⋮ → *Instalar app*.
- **iOS (Safari)**: botón *Compartir* → *Añadir a la pantalla de inicio*.
- **Desktop (Chrome / Edge)**: ícono ⊕ en la barra de direcciones.

La PWA funciona con conexión intermitente gracias al service worker (`public/sw.js`).

---

## 🛡️ Seguridad

- Todas las tablas usan **Row Level Security** (ver `supabase/schema.sql`):
  - Lectura pública solo de contenido publicado.
  - Cada usuario solo puede editar sus propios negocios/artículos.
  - Los administradores pueden gestionar todo (rol guardado en `profiles.role`).
- Los **conteos de analíticas** son inmutables (insert-only).
- Las **reseñas** son únicas por usuario+negocio (UNIQUE constraint).

---

## 🧹 Mantenimiento

- **Limpiar artículos expirados del marketplace**: usa un cron job (Supabase pg_cron o Railway cron):
  ```sql
  DELETE FROM marketplace_items WHERE expires_at < NOW() - INTERVAL '7 days';
  ```
- **Eventos pasados**: se ocultan automáticamente porque el listado filtra `starts_at >= NOW()`.

---

## 🗺️ Roadmap sugerido

- [ ] Notificaciones push (Web Push API).
- [ ] Reservas / agendamiento con Google Calendar.
- [ ] Pagos con PayPhone / Kushki para destacar publicaciones.
- [ ] Modo turista en inglés (campos `name_en` ya están listos).
- [ ] Stories de 24h por negocio.

---

## 📄 Licencia

MIT © GAD Municipal del Cantón Mejía — Construido por la comunidad para la comunidad.
