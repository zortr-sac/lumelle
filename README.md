# BellezaPro

SaaS multi-tenant para manicuristas, studios de uñas y salones de belleza en Perú.

> Ordena tus citas, controla tus pagos, mide tus ganancias y haz que tus clientas vuelvan.

## Stack

- **Next.js 15** (App Router, RSC, Server Actions)
- **Supabase** (Postgres + Auth + Storage + RLS con JWT custom claims)
- **Tailwind CSS** + **shadcn/ui** + **Radix Primitives**
- **react-hook-form** + **zod**
- **@tanstack/react-query**
- **date-fns** + **date-fns-tz** (timezone-aware)
- **TypeScript** estricto
- **Vitest** (unit) + **Playwright** (E2E)

## Características clave

- Multi-tenant con aislamiento por `business_id` y RLS optimizado vía JWT claims
- Página pública por negocio (`/b/{slug}`) con wizard de reserva mobile-first
- Anti-doble-booking con constraint `EXCLUDE` de Postgres
- WhatsApp manual (links `wa.me` con mensaje prellenado, sin API)
- Locale es-PE, currency PEN, timezone `America/Lima`

## Estructura

```
src/
  app/
    (auth)/            login, signup, forgot, reset
    (app)/             dashboard, onboarding, agenda, clientas, servicios, caja, ajustes
    b/[slug]/          página pública del negocio + wizard de reserva
    api/               /api/slots, /api/bookings (rate-limited)
  components/          ui (shadcn), layout, providers
  lib/
    supabase/          server, client, admin, middleware (SSR)
    auth/              session, role-guard
    tenant/            resolve, current
    slots/             algoritmo de disponibilidad (con tests)
    whatsapp/          builder, templates es-PE
    rate-limit/        upstash (con fallback in-memory)
    validators/        zod schemas
    format/            currency, phone, date
  server/
    actions/           server actions por dominio
  types/               database.types.ts (generado)
supabase/
  migrations/          0001-0014 (extensions, schema, RLS, JWT hook, seeds)
  config.toml
e2e/                   Playwright tests
```

## Setup

### Requisitos

- Node ≥ 20
- pnpm ≥ 9
- Supabase CLI (`brew install supabase/tap/supabase` o equivalente)
- Cuenta Supabase Cloud (o local con Docker)

### Instalación

```bash
pnpm install
cp .env.example .env.local
# completar variables
```

### Supabase local

```bash
pnpm supabase start
pnpm db:reset                        # aplica migraciones
pnpm db:types                        # genera src/types/database.types.ts
```

### Auth Hook (Custom Access Token)

En **Supabase Dashboard → Authentication → Hooks** habilitar el "Custom Access Token Hook" apuntando a la función `public.custom_access_token_hook` (definida en `supabase/migrations/0013_auth_hook_jwt.sql`). Esto inyecta `business_ids[]`, `current_business_id` y `business_role` en cada JWT. La RLS depende de estos claims.

### Storage

El bucket `business-assets` se crea por la migración `0011_storage_buckets.sql`. Las políticas RLS de storage filtran por `(storage.foldername(name))[1] = current_business_id`.

### Variables de entorno (mínimas)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BellezaPro
```

Opcionales en desarrollo (rate limit cae a in-memory):

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Dev server en `:3000` con Turbopack |
| `pnpm build` | Build de producción |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest (unit) |
| `pnpm test:e2e` | Playwright (E2E) |
| `pnpm db:start` | Levantar Supabase local |
| `pnpm db:reset` | Resetear DB + aplicar migraciones |
| `pnpm db:types` | Regenerar tipos de DB |

## Arquitectura clave

### Multi-tenancy via JWT claims

El Auth Hook `custom_access_token_hook` (en `0013_auth_hook_jwt.sql`) ejecuta en cada login y refresh, leyendo `business_users` y `profiles.current_business_id` para inyectar claims al JWT:

- `business_ids: uuid[]` — todos los negocios donde el usuario es miembro activo
- `current_business_id: uuid` — el negocio activo (selector en UI)
- `business_role: enum` — rol en el negocio actual

Las políticas RLS leen directo del JWT con `auth.jwt() ->> 'current_business_id'`. Esto evita subqueries por row y escala 10x mejor que validaciones basadas en `EXISTS`.

### Anti-doble-booking

```sql
ALTER TABLE appointments
  ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    staff_id WITH =,
    business_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status IN ('confirmed', 'in_progress'));
```

Las citas en estado `requested` NO bloquean slot — la dueña confirma manualmente vía WhatsApp y ahí pasa a `confirmed`. Esto evita que reservas con teléfonos falsos saturen la agenda.

### Rate limiting

`/api/bookings` y `/api/slots` están protegidos por Upstash Rate Limit (con fallback a in-memory en dev). Configura `UPSTASH_REDIS_REST_*` para producción.

### Reservas públicas

- `/b/[slug]` (página landing del negocio) → ISR 60s
- `/b/[slug]/reservar` → wizard de 4 pasos (servicio → técnica → fecha/hora → datos)
- `POST /api/bookings` → crea cita en estado `requested`, devuelve `wa.me` link prellenado
- Dueña confirma desde dashboard → estado pasa a `confirmed`

## Compliance

- **Ley 29733 (Protección de Datos Personales, Perú)**: tabla `audit_logs` registra accesos sensibles. Cada negocio puede exportar/borrar sus datos (TODO Fase 2).
- **Privacidad**: política en `/privacy`, consentimiento explícito en formularios públicos.
- **Slug blocklist**: rutas reservadas (`api`, `admin`, etc.) no asignables como slug de negocio.

## Roadmap

| Fase | Contenido |
|---|---|
| **MVP (este)** | Auth, negocios, servicios, clientas, agenda, reservas públicas, caja |
| Fase 2 | Inventario con recetas, comisiones, recordatorios automáticos |
| Fase 3 | Marketing, campañas, fidelización, segmentos avanzados |
| Fase 4 | Marketplace público (`/explorar`) con búsqueda por distrito |
| Fase 5 | WhatsApp Business Platform, pasarela de pagos, facturación electrónica |

## Documentación de producto

Ver `DOCUMENTACION_SAAS_BELLEZA.md` para la especificación completa (24 secciones).

---

Hecho con ✨ en Perú
