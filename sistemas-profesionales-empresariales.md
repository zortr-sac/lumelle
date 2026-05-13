# Guía completa de sistemas profesionales y empresariales

> Características, buenas prácticas, patrones de escalabilidad, y estrategias de performance para sistemas con clientes masivos. Incluye cómo lo hacen Netflix, Stripe, Google, Amazon, Cloudflare, Shopify, Discord, Uber y otras empresas de referencia.

**Objetivo de performance:** primera carga de página < 2 segundos, contenido visible sin demora perceptible.

---

## Tabla de contenidos

1. [Idempotencia y control de concurrencia](#1-idempotencia-y-control-de-concurrencia)
2. [Transacciones y consistencia de datos](#2-transacciones-y-consistencia-de-datos)
3. [Resiliencia y tolerancia a fallos](#3-resiliencia-y-tolerancia-a-fallos)
4. [Performance y escalabilidad](#4-performance-y-escalabilidad)
5. [API y contratos](#5-api-y-contratos)
6. [Seguridad](#6-seguridad)
7. [Observabilidad](#7-observabilidad)
8. [Deployment e infraestructura](#8-deployment-e-infraestructura)
9. [Base de datos](#9-base-de-datos)
10. [Mensajería asíncrona](#10-mensajería-asíncrona)
11. [UX y front-end](#11-ux-y-front-end)
12. [Compliance y privacidad](#12-compliance-y-privacidad)
13. [Testing](#13-testing)
14. [Operaciones / SRE](#14-operaciones--sre)
15. [Multi-tenancy](#15-multi-tenancy)
16. [Patrones de arquitectura empresarial](#16-patrones-de-arquitectura-empresarial)
17. [**Performance: cómo lograr <2s de carga**](#17-performance-cómo-lograr-2s-de-carga)
18. [**Autenticación eficiente (sin matar la BD)**](#18-autenticación-eficiente-sin-matar-la-bd)
19. [**Renderizar UI rápido con BD enorme**](#19-renderizar-ui-rápido-con-bd-enorme)
20. [**Cómo lo hacen las grandes empresas**](#20-cómo-lo-hacen-las-grandes-empresas)
21. [Pequeños detalles que distinguen lo profesional](#21-pequeños-detalles-que-distinguen-lo-profesional)

---

## 1. Idempotencia y control de concurrencia

### Idempotencia de cliente (UI)
Deshabilitar botones tras el primer click, debounce/throttle en inputs, mostrar estados de "loading". Es la primera línea, no la única.

### Idempotencia de servidor (idempotency keys)
El cliente envía `Idempotency-Key: <uuid>` en el header. El servidor guarda el resultado en una tabla/cache. Si llega la misma key, devuelve la respuesta cacheada en lugar de re-ejecutar.

**Stripe es el caso canónico.** Si cobras dos veces por un retry de red, pierdes la confianza del cliente. Reglas:
- Guardar la key con el hash del request body para detectar "misma key, distinto payload" → error 422.
- TTL típico: 24h-7 días.
- Protege contra: doble click, retry tras 504, reapertura de pestaña, doble pestaña, retry de cliente móvil tras pérdida de red.

```http
POST /api/charges
Idempotency-Key: 8f3c1b9e-7d4a-4f2b-9c8d-1e2f3a4b5c6d
Content-Type: application/json

{ "amount": 5000, "currency": "USD" }
```

### Optimistic locking (versionado)
Cada row tiene un campo `version`. El UPDATE incluye `WHERE version = X`. Si dos usuarios editan al mismo tiempo, el segundo recibe error y reintenta con datos frescos. Evita "lost updates".

### Pessimistic locking
`SELECT ... FOR UPDATE`. Bloquea la fila durante la transacción. Útil para inventarios, saldos. Costoso bajo alta concurrencia.

### Distributed locks
Cuando varios procesos compiten por un recurso (ej. cron en 5 réplicas que debe correr 1 sola vez). Patrones: Redis Redlock, ZooKeeper, etcd. **Siempre con TTL** para evitar deadlocks si el proceso muere.

---

## 2. Transacciones y consistencia de datos

### Transacciones ACID
Atomicidad, Consistencia, Aislamiento, Durabilidad. Esencial para operaciones multi-tabla (transferencia: débito + crédito atómicos).

### Niveles de aislamiento
Read Uncommitted, Read Committed, Repeatable Read, Serializable. Default: Read Committed. Para pagos/contabilidad: Serializable o snapshot isolation.

### Outbox pattern
Problema: necesitas guardar en BD y publicar evento en Kafka; si haces los dos por separado, puede fallar uno. Solución: en la misma transacción, escribes en la tabla `outbox`. Un worker aparte la lee y publica al broker. Garantiza "at-least-once" sin transacciones distribuidas.

### Saga pattern
Para transacciones que cruzan múltiples servicios. Cada paso tiene su compensación. Si falla el paso 4, ejecutas las compensaciones de 3, 2, 1 en orden inverso. Ej.: reserva de hotel + vuelo + auto.

### Event sourcing
En lugar de guardar el estado actual, guardas la secuencia de eventos. El estado se reconstruye reproduciendo eventos. Auditoría perfecta y "time travel". Sistemas financieros y e-commerce críticos lo usan.

### CQRS (Command Query Responsibility Segregation)
Separar modelo de escritura del de lectura. Las lecturas van a réplicas optimizadas (índices, vistas materializadas). Útil cuando lectura y escritura tienen patrones muy distintos.

### Eventual consistency
En sistemas distribuidos, los datos no siempre están sincronizados al instante. Diseña la UX para tolerarlo ("tu pedido aparecerá en unos segundos").

---

## 3. Resiliencia y tolerancia a fallos

### Retries con exponential backoff + jitter
Reintenta tras 1s, 2s, 4s, 8s... con **jitter aleatorio** para evitar el "thundering herd" (todos los clientes reintentando al mismo tiempo).

### Circuit breakers
Si un servicio downstream está caído, deja de enviarle requests durante X segundos. Estados: **Closed → Open → Half-Open**. Netflix popularizó esto con Hystrix; hoy se usa Resilience4j, Polly.

### Bulkheads
Pools separados de recursos para que un servicio lento no consuma todos los threads. Como compartimentos estancos en un barco.

### Timeouts
Toda llamada externa debe tener timeout. Regla: **timeout del cliente < timeout del servidor** en cada capa.

### Graceful degradation
Si el servicio de recomendaciones ML está caído, sirves recomendaciones genéricas. El sitio degrada pero no muere.

### Fallbacks
Respuestas cacheadas, valores por defecto, features simplificadas cuando un servicio no responde.

### Health checks (liveness + readiness)
- **Liveness**: ¿el proceso está vivo? Si no, Kubernetes lo reinicia.
- **Readiness**: ¿está listo para recibir tráfico? Si está cargando cache, dice "no" y el load balancer no le envía requests.

### Chaos engineering
Netflix corre Chaos Monkey en producción: mata instancias al azar para probar resiliencia real. Madurez extrema.

### Dead Letter Queue (DLQ)
Mensajes que fallan tras N reintentos van a una cola separada para inspección humana. Evita loops infinitos.

---

## 4. Performance y escalabilidad

### Caching multinivel
- Browser cache (headers HTTP)
- CDN (Cloudflare, CloudFront, Fastly)
- Edge cache
- App cache (Redis, Memcached)
- DB query cache
- Vistas materializadas

### Estrategias de invalidación de cache
- Write-through, write-behind, write-around
- Cache-aside (lazy loading)
- TTL + revalidación
- Stale-while-revalidate (SWR)

### Database sharding/partitioning
Dividir datos por user_id, geo, fecha. Discord usa esto sobre Cassandra/ScyllaDB para manejar trillones de mensajes.

### Read replicas
Una primaria para escrituras, N réplicas para lecturas. La mayoría de carga es lectura.

### Connection pooling
PgBouncer, ProxySQL. Reutiliza conexiones a BD en lugar de abrir/cerrar (cada conexión Postgres ~10MB).

### Procesamiento asíncrono
Lo que no necesita responder al usuario va a una cola (SQS, RabbitMQ, Kafka). Respuesta rápida; trabajo pesado en background.

### Pagination cursor-based
**NO uses** `OFFSET 1000000 LIMIT 20`: la BD lee 1M filas y descarta 999,980. Usa cursores: `WHERE id > last_seen_id ORDER BY id LIMIT 20`.

### Evitar N+1 queries
Eager loading, batching (DataLoader pattern). Es la causa #1 de lentitud "misteriosa".

### Backpressure
Si el productor genera más rápido de lo que el consumidor procesa, hay que pausarlo o descartar.

### Auto-scaling
Horizontal (más instancias) basado en CPU, RPS, latencia, tamaño de cola. Vertical (más recursos) tiene techo.

---

## 5. API y contratos

### Rate limiting
Algoritmos:
- **Token bucket** (permite ráfagas)
- **Leaky bucket** (suaviza tráfico)
- **Sliding window log/counter**

Por usuario, IP, API key, endpoint. Devolver `429 Too Many Requests` con header `Retry-After`.

### Throttling
Más suave que rate limiting: ralentiza en lugar de rechazar.

### Quotas
Límites por mes/día por plan. GitHub: 5,000 requests/hora autenticado.

### Versionado de API
- En URL (`/v1/`, `/v2/`) — simple
- En header (`Accept-Version: 2`) — limpio
- Por fecha (Stripe: `Stripe-Version: 2024-06-20`) — granular

### Backward compatibility
Nunca remover campos sin proceso de deprecation (6-12 meses). Solo agregar campos opcionales. Cambios breaking → nueva versión.

### OpenAPI / contratos
Define la API en spec (OpenAPI, gRPC proto, GraphQL schema). Genera clientes, valida requests, documenta automáticamente.

### Webhooks robustos
- Firma HMAC para verificar autenticidad
- Reintentos con backoff
- Idempotencia (event_id único)
- Replay desde dashboard
- Documentar todos los eventos posibles

---

## 6. Seguridad

### Autenticación
- OAuth 2.0 / OIDC
- JWT con expiración corta + refresh tokens
- Sesiones server-side (más seguras para web)
- MFA / 2FA (TOTP, WebAuthn/passkeys)

### Autorización
- **RBAC** (Role-Based Access Control)
- **ABAC** (Attribute-Based: políticas con contexto)
- Tools: Open Policy Agent (OPA), Casbin, Cerbos
- Principio de mínimo privilegio

### Defensa OWASP Top 10
- SQL injection → prepared statements / ORMs
- XSS → escape de output, Content Security Policy
- CSRF → tokens CSRF, SameSite cookies
- SSRF → whitelist de URLs permitidas
- IDOR → siempre validar ownership del recurso

### Secrets management
HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager. Rotación automática. **NUNCA** secrets en código.

### Encriptación
- En tránsito: TLS 1.2+, HSTS
- En reposo: cifrado de discos, columnas sensibles cifradas a nivel app
- KMS con rotación de llaves

### Audit logs
Quién hizo qué, cuándo, desde dónde. Inmutables (append-only). Esencial para SOC2, HIPAA, PCI.

### Zero Trust
"Never trust, always verify". Cada request se autentica/autoriza, incluso entre servicios internos. mTLS entre microservicios.

### WAF (Web Application Firewall)
Cloudflare, AWS WAF. Bloquea patrones de ataque conocidos.

### Bot mitigation
hCaptcha, Cloudflare Turnstile, fingerprinting.

### DDoS protection
Cloudflare, AWS Shield. Absorbe ataques volumétricos.

---

## 7. Observabilidad

### Logs estructurados
JSON con campos consistentes (`request_id`, `user_id`, `level`, `service`). Centralizados (ELK, Loki, Datadog). **Nunca** logs en texto plano a escala.

### Métricas (Four Golden Signals de Google SRE)
- **Latency** (p50, p95, p99 — nunca solo promedio)
- **Traffic** (RPS)
- **Errors** (rate)
- **Saturation** (CPU, memoria, IO)

### Distributed tracing
OpenTelemetry, Jaeger, Honeycomb. Un `trace_id` viaja por todos los servicios. Indispensable en microservicios.

### SLI / SLO / SLA
- **SLI**: lo que mides (% requests <300ms)
- **SLO**: tu objetivo interno (99.9%)
- **SLA**: lo que prometes contractualmente
- **Error budget**: si SLO es 99.9%, tienes 0.1% de presupuesto. Si lo agotas, frenas releases.

### Alertas inteligentes
Alertar sobre **síntomas** (usuarios afectados), no causas. Pager solo para acción humana inmediata.

### Real User Monitoring (RUM)
Métricas reales desde browsers de usuarios: Core Web Vitals, errores JS, geo-latencia.

### Synthetic monitoring
Pruebas automatizadas que simulan usuarios cada minuto desde varios puntos del mundo.

### Error tracking
Sentry, Bugsnag. Agrupa errores con stack trace + contexto.

---

## 8. Deployment e infraestructura

### CI/CD
Cada commit → tests → deploy. Sin intervención manual. Amazon: deploy cada 11.7 segundos en promedio.

### Blue/Green deployment
Dos ambientes idénticos. Deploy en el "green" inactivo, switch del load balancer cuando esté listo. Rollback instantáneo.

### Canary deployment
Liberas al 1% del tráfico, luego 5%, 25%, 100%. Rollback automático si métricas se degradan.

### Feature flags
LaunchDarkly, Unleash, Flagsmith. Despliegas código apagado. Lo prendes para 1% de usuarios. Separa deploy de release.

### Infrastructure as Code (IaC)
Terraform, Pulumi, CloudFormation. Infra versionada en Git.

### Immutable infrastructure
No haces SSH para "arreglar" servidores. Los destruyes y creas nuevos.

### Multi-region / multi-AZ
Si una región AWS se cae, tu sistema sigue funcionando.

### Rollback plan
Todo release debe ser rollback-able en <5 minutos. Migraciones pensadas para no romper la versión anterior.

---

## 9. Base de datos

### Migraciones expand-contract
Cambios de schema en pasos compatibles hacia atrás:
1. Agregar columna nueva (compatible)
2. Deploy código que escribe en ambas
3. Backfill datos
4. Deploy código que lee de la nueva
5. Eliminar columna vieja

### Backups + restore probado
Tener backup no sirve si nunca probaste restaurar. Define **RPO** (cuánta data puedes perder) y **RTO** (cuánto puedes estar caído).

### Soft deletes
`deleted_at` en lugar de `DELETE`. Permite undo, auditoría, recuperación.

### Audit columns
`created_at`, `updated_at`, `created_by`, `updated_by` en toda tabla.

### Índices apropiados
Pero no de más: cada índice ralentiza writes. Monitorea slow queries y usa `EXPLAIN ANALYZE`.

### Particionamiento
Tablas grandes particionadas por fecha. Drop de partición es instantáneo vs DELETE masivo.

---

## 10. Mensajería asíncrona

### Idempotent consumers
Los mensajes pueden llegar duplicados (at-least-once). El consumidor debe procesarlos N veces con el mismo resultado.

### Ordering guarantees
Kafka garantiza orden dentro de una partición, no global. Diseña la partition key con esto en mente.

### Dead Letter Queue + replay
Mensajes fallidos van a DLQ. Después de arreglar el bug, los reproduces.

### Exactly-once vs at-least-once
Exactly-once es muy costoso. La mayoría usa at-least-once + idempotencia.

---

## 11. UX y front-end

### Optimistic UI
Actualiza la UI inmediatamente asumiendo éxito; si falla, revierte. Linear, Notion, Superhuman lo usan.

### Loading states + skeletons
Nada de spinners genéricos durante 5s. Skeletons que reflejan el contenido que viene.

### Error boundaries
Un error en un componente no debe tumbar toda la app.

### Offline support
Service Workers, PWAs. Funciona sin red para acciones básicas.

### Accesibilidad (WCAG 2.1 AA)
Contraste, navegación por teclado, screen readers, ARIA. **Obligatorio por ley** en muchos países.

### i18n / l10n
Internacionalización + localización (traducciones, formatos, RTL).

### Performance budget
Bundles <200KB, LCP <2.5s, etc. Monitoreado en CI.

---

## 12. Compliance y privacidad

### GDPR / CCPA / LGPD
- Right to access (export data)
- Right to be forgotten (delete + cascade)
- Consentimiento explícito para cookies/tracking

### Data residency
Datos europeos en EU, datos chinos en China.

### PII handling
Mínima recolección, encriptación, acceso loggeado, retention policies.

### Frameworks
SOC 2, ISO 27001, HIPAA, PCI DSS según industria.

---

## 13. Testing

### Pirámide de tests
- Unit (rápidos, muchos)
- Integration (medianos)
- E2E (lentos, pocos)

### Contract testing
Pact, Spring Cloud Contract. Verifica que cambios en una API no rompen consumidores.

### Load testing
k6, Gatling, Locust. **Antes** de Black Friday, no después.

### Chaos engineering
Gremlin, Chaos Mesh. Inyecta latencia, mata pods, llena disco.

### Smoke tests en producción
Tests post-deploy verificando flujos críticos reales.

### Shadow traffic
Duplicar tráfico real a la nueva versión sin afectar usuarios. Compara respuestas.

---

## 14. Operaciones / SRE

### On-call rotation + runbooks
Cada alerta debe linkear a un runbook con pasos de mitigación.

### Postmortems blameless
Después de un incidente: qué pasó, por qué, cómo evitarlo. **Sin culpar personas**.

### Game days
Simular fallas en horario laboral con todo el equipo. Practicar como bomberos.

### Capacity planning
Proyectar carga futura, dimensionar antes de explotar.

### Cost monitoring
FinOps: tagear recursos, dashboard de costos, alertas de gasto.

---

## 15. Multi-tenancy

### Aislamiento de tenants
- Schema por tenant (más aislado, más caro)
- Database por tenant (máximo aislamiento, regulado)
- Shared con `tenant_id` en cada query (más eficiente, más riesgoso)

### Quotas y noisy-neighbor protection
Que un cliente abusivo no degrade a los demás.

---

## 16. Patrones de arquitectura empresarial

### API Gateway
Punto único de entrada: auth, rate limiting, routing, transformación. Kong, Apigee, AWS API Gateway.

### Service mesh
Istio, Linkerd. mTLS, retries, circuit breakers, observabilidad — manejados por sidecar, sin tocar código.

### BFF (Backend For Frontend)
Una API dedicada por cliente (web, mobile, partners) en vez de "one-size-fits-all".

### Cell-based architecture (Amazon)
Particionar la infra en "celdas" independientes. Una falla afecta solo a una celda. Reduce blast radius.

### Strangler fig pattern
Para migrar de un monolito legacy: el nuevo sistema "estrangula" partes del viejo gradualmente.

---

# 17. Performance: cómo lograr <2s de carga

> Esta sección es el corazón de "por qué tu página debe cargar en menos de 2 segundos y cómo lograrlo".

## 17.1 Métricas objetivo (Core Web Vitals)

Google los usa como factor de ranking SEO. Son tu **tablero oficial**:

| Métrica | Bueno | Aceptable | Pobre |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | <2.5s | 2.5-4s | >4s |
| **INP** (Interaction to Next Paint) | <200ms | 200-500ms | >500ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.1-0.25 | >0.25 |
| **TTFB** (Time to First Byte) | <200ms | 200-600ms | >600ms |
| **FCP** (First Contentful Paint) | <1.8s | 1.8-3s | >3s |

**Regla de oro de Amazon:** cada 100ms adicionales = 1% de pérdida de ventas. Walmart: cada 1 segundo de mejora = 2% más de conversión.

## 17.2 Estrategias de renderizado

### CSR (Client-Side Rendering) — el default antiguo de React/Vue
HTML mínimo, JS pesado, todo se renderiza en el browser. **Malo para LCP**: el usuario ve pantalla blanca hasta que JS descarga + ejecuta + pide datos. Solo úsalo en apps autenticadas tipo dashboard donde SEO no importa.

### SSR (Server-Side Rendering)
HTML completo desde el server. El usuario ve contenido al instante; JS se hidrata después. Frameworks: Next.js, Nuxt, SvelteKit, Remix.

### SSG (Static Site Generation)
HTML pre-generado en build time. Servido desde CDN. **Imbatible en velocidad**. Para contenido que no cambia por usuario: blogs, docs, landing pages.

### ISR (Incremental Static Regeneration)
Mezcla SSG + revalidación. La página se regenera cada N minutos en background. Next.js lo popularizó. Ideal para e-commerce: catálogo casi estático que se actualiza periódicamente.

### Streaming SSR (lo más moderno)
React 18, Next.js App Router, Remix. El servidor envía HTML por chunks usando `Suspense`. El header llega instantáneamente; las secciones lentas se muestran cuando estén listas. **Es como ver un video que ya empezó vs esperar a descargarlo entero.**

```jsx
<Layout>
  <Header /> {/* llega inmediato */}
  <Suspense fallback={<Skeleton />}>
    <SlowProductGrid /> {/* llega cuando esté listo */}
  </Suspense>
  <Suspense fallback={<Skeleton />}>
    <Recommendations /> {/* llega aún más tarde */}
  </Suspense>
</Layout>
```

### Edge rendering
Cloudflare Workers, Vercel Edge Functions, Deno Deploy. Tu código corre en 300+ ubicaciones cercanas al usuario. **TTFB típico: 50ms** en cualquier parte del mundo.

### Islands architecture
Astro, Qwik, Fresh. HTML estático con "islas" interactivas hidratadas selectivamente. **Solo descargas el JS que necesitas.** Ideal para sitios de contenido con widgets puntuales.

### Resumability (Qwik)
En lugar de hidratar (re-ejecutar todo el JS en el cliente), Qwik serializa el estado y lo "resume". Resultado: JS prácticamente cero en la primera carga.

## 17.3 Optimización de assets

### Imágenes (suelen ser el 60% del peso de la página)
- Formatos modernos: **AVIF > WebP > JPEG**
- Responsive: `<picture>` con `srcset` y `sizes`
- Lazy loading: `loading="lazy"` para imágenes below-the-fold
- Eager + priority en LCP image
- Dimensiones explícitas (width/height) para evitar CLS
- CDN con transformación on-the-fly: Cloudflare Images, imgix, Cloudinary
- `next/image`, `<Image>` de Astro, equivalentes en cada framework

### Fuentes
- `font-display: swap` (muestra texto fallback hasta que llegue la fuente)
- Preload de fuentes críticas: `<link rel="preload" as="font">`
- Subset de fuentes (solo glifos necesarios)
- Self-hosting > Google Fonts (privacy + un DNS lookup menos)
- Variable fonts (un archivo para todos los pesos)

### JavaScript
- **Code splitting** por ruta: solo cargas el código de la página actual
- **Tree shaking**: eliminar código no usado en build
- **Minificación**: terser, esbuild
- **Compresión**: Brotli > gzip (~20% mejor)
- **Dynamic imports**: `import()` para código no crítico
- **Bundle analysis**: webpack-bundle-analyzer, source-map-explorer
- Evitar librerías masivas: `date-fns` en lugar de `moment`, `lodash-es` con tree-shaking

### CSS
- **Critical CSS inline** en el `<head>` (lo necesario para above-the-fold)
- Resto del CSS async
- Tailwind con purge (CSS final ~10KB)
- Evitar `@import` en CSS (bloquea renderizado)

### HTML
- **Compresión Brotli**
- Minificación
- Evitar nesting excesivo

## 17.4 Resource hints (instrucciones al browser)

```html
<!-- DNS lookup anticipado -->
<link rel="dns-prefetch" href="//api.midominio.com">

<!-- TCP + TLS handshake anticipado -->
<link rel="preconnect" href="https://api.midominio.com">

<!-- Descargar recurso ya, lo necesito en esta página -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>

<!-- Descargar para navegación futura -->
<link rel="prefetch" href="/dashboard.js">

<!-- Pre-renderizar página completa -->
<link rel="prerender" href="/checkout">
```

## 17.5 Estrategias de red

- **HTTP/2** (multiplexing: muchos requests en una conexión)
- **HTTP/3** sobre QUIC (sobrevive a cambios de red, móvil)
- **CDN** que sirva desde el POP más cercano al usuario
- **Edge caching** con headers `Cache-Control` agresivos
- **`stale-while-revalidate`**: sirve cache vieja, revalida en background
- **ETag / If-None-Match** para responses 304 (vacías, rapidísimas)
- **Connection keep-alive**

## 17.6 Performance budget en CI

Bloquea PRs que rompan el budget:

```yaml
# lighthouse-budget.json
[{
  "resourceSizes": [
    { "resourceType": "script", "budget": 200 },
    { "resourceType": "image", "budget": 300 },
    { "resourceType": "total", "budget": 1000 }
  ],
  "timings": [
    { "metric": "lcp", "budget": 2500 },
    { "metric": "interactive", "budget": 3000 }
  ]
}]
```

Tools: Lighthouse CI, SpeedCurve, Calibre, WebPageTest.

---

# 18. Autenticación eficiente (sin matar la BD)

> "Cada página hace 50 queries a tablas distintas para ver si el usuario tiene permisos" → este es el anti-patrón más común. Aquí está cómo lo resuelven las empresas serias.

## 18.1 El problema

En cada request, una app naïve hace algo así:

```sql
SELECT * FROM sessions WHERE token = ?;          -- 1 query
SELECT * FROM users WHERE id = ?;                -- 1 query
SELECT * FROM user_roles WHERE user_id = ?;      -- 1 query
SELECT * FROM role_permissions WHERE role IN ?;  -- 1 query
SELECT * FROM organizations WHERE id = ?;        -- 1 query
SELECT * FROM org_memberships WHERE ...;         -- 1 query
SELECT * FROM features_flags WHERE ...;          -- 1 query
-- ... y suma
```

**Resultado:** 7+ queries por request × 1,000 RPS = 7,000 queries/segundo solo para autenticar. Tu BD muere antes de servir contenido real.

## 18.2 Solución: stateless tokens con datos embebidos

### JWT (JSON Web Token)

El token contiene el `user_id`, roles, claims relevantes, **firmado** con una llave secreta. El server solo verifica la firma (operación de CPU, ~microsegundos). **Cero queries a BD.**

```json
// Payload del JWT
{
  "sub": "user_42",
  "roles": ["admin", "billing"],
  "org_id": "org_7",
  "permissions": ["read:invoices", "write:users"],
  "plan": "enterprise",
  "exp": 1735689600,
  "iat": 1735603200
}
```

**Ventajas**
- Verificación local, sin BD
- Escala horizontalmente sin estado compartido
- Funciona perfecto con edge computing

**Desventajas**
- Difícil de revocar antes del `exp`
- Si los claims cambian, el usuario no lo ve hasta el siguiente refresh
- No metas data sensible (es base64, no encriptado por default)

**Mitigaciones**
- Expiración corta (15 min)
- Refresh tokens de larga vida en HttpOnly cookie
- **Revocation list en Redis**: en logout o ban, agregas el `jti` (token ID) a una blacklist. Cada request consulta Redis (sub-ms) en vez de BD.

## 18.3 Sessions con cache (alternativa)

Para sistemas donde necesitas revocación instantánea o data fresca:

1. Login → genera `session_id` random (no JWT)
2. Guardas en Redis: `session:abc123 → { user_id, roles, perms, expires }`
3. Cookie HttpOnly Secure SameSite con el `session_id`
4. Cada request: **1 sola lectura a Redis** (~0.5ms), no a BD

```python
# Pseudo-código middleware
def auth_middleware(request):
    sid = request.cookies['sid']
    session = redis.get(f'session:{sid}')  # 0.5ms
    if not session:
        return 401
    request.user = session  # ya viene con roles, perms, etc.
```

**Redis maneja millones de ops/seg en una sola instancia.** Tu BD no se entera.

## 18.4 Híbrido (lo que usan empresas grandes)

**JWT como token de transporte + Redis como source of truth.**

- JWT corto (5-15 min) para acceso rápido sin tocar nada
- Refresh token de larga vida que **sí valida contra Redis** al renovar
- Redis tiene la verdad sobre revocación, ban, cambios de rol
- BD solo se toca en login, cambio de password, cambio de permisos

## 18.5 Edge authentication

**El truco más potente para latencia global.**

Cloudflare Workers, Vercel Edge Middleware, Lambda@Edge. La validación del JWT corre en el POP más cercano al usuario:

```js
// Cloudflare Worker
export default {
  async fetch(request) {
    const token = request.headers.get('Authorization');
    const payload = await verifyJWT(token, SECRET); // <1ms
    if (!payload) return new Response('401', { status: 401 });
    // Solo requests autenticadas llegan al origin
    return fetch(request);
  }
}
```

Resultado: requests no autenticadas se bloquean en el edge sin tocar tu infraestructura.

## 18.6 Permission caching denormalizado

En lugar de calcular permisos en cada request, **pre-computa** un blob de permisos en login:

```json
// Guardado en Redis al login: auth:user:42
{
  "user_id": 42,
  "org_id": 7,
  "plan": "enterprise",
  "roles": ["admin"],
  "permissions": [
    "invoices.read", "invoices.write",
    "users.read", "users.write",
    "billing.manage"
  ],
  "feature_flags": ["new_dashboard", "ai_summaries"],
  "limits": { "api_calls": 100000, "users": 50 }
}
```

**Una sola lectura Redis** trae todo. Cuando cambian permisos, invalidas la key.

## 18.7 Authorization en cada página

### Patrón 1: Middleware en cada ruta

```js
// Next.js middleware.ts
export async function middleware(req) {
  const token = req.cookies.get('token');
  const user = await verifyAndGetUser(token); // Redis o JWT
  if (!user) return NextResponse.redirect('/login');
  req.user = user;
}
```

### Patrón 2: Higher-Order Components / decorators

```jsx
export default withAuth(Dashboard, { requiredRole: 'admin' });
```

### Patrón 3: Policy/permission checks declarativos

```jsx
<Can I="edit" a="Invoice" this={invoice}>
  <EditButton />
</Can>
```

### Patrón 4: Edge middleware (recomendado para producción)

Validas en el edge antes de servir cualquier cosa. Usuarios sin auth nunca tocan tu app.

## 18.8 Buenas prácticas adicionales

- **HttpOnly + Secure + SameSite cookies** para tokens
- **CSRF tokens** o SameSite=Strict
- **Rotación de refresh tokens** (un solo uso, se invalida tras canjearlo)
- **Detección de robo**: si un refresh token se usa dos veces, asume robo y revoca toda la familia
- **Rate limiting** específico en endpoints de login (3 intentos/min por IP+username)
- **Account lockout** progresivo
- **Logging estructurado** de eventos de auth para detección de anomalías
- **WebAuthn / passkeys** para reemplazar passwords (Google, Apple, Microsoft ya lo permiten)

---

# 19. Renderizar UI rápido con BD enorme

> Tu BD tiene 500M de filas. ¿Cómo entregas la página en <2s?

## 19.1 No leas más de lo necesario

### Pagination cursor-based (no offset)

```sql
-- ❌ MAL (lento con offset grande)
SELECT * FROM products ORDER BY created_at LIMIT 20 OFFSET 100000;

-- ✅ BIEN (rápido siempre)
SELECT * FROM products
WHERE created_at < $last_seen_created_at
ORDER BY created_at DESC
LIMIT 20;
```

### Select solo las columnas necesarias

```sql
-- ❌
SELECT * FROM users WHERE id = ?;

-- ✅
SELECT id, name, avatar_url FROM users WHERE id = ?;
```

### Proyecta en GraphQL / REST

Los clientes deben pedir solo los campos que usan. GraphQL lo obliga; en REST, sparse fieldsets: `?fields=id,name,email`.

## 19.2 Indexa correctamente

- **B-tree** para igualdad y rangos
- **GIN** para arrays, JSONB, full-text en Postgres
- **BRIN** para datos secuenciales gigantes (logs por fecha)
- **Covering indexes** (incluyen las columnas del SELECT, evita lookup a la tabla)
- **Partial indexes** (`WHERE active = true`) — más pequeños, más rápidos
- **Composite indexes** en orden de selectividad

Usa `EXPLAIN ANALYZE` religiosamente. Una query a 500M filas con índice correcto es ~5ms; sin índice puede ser 30 segundos.

## 19.3 Caching agresivo de queries

```
Browser → CDN → Edge Cache → Redis → DB
```

- **Redis** para cache de queries frecuentes
- TTL según volatilidad (ej. catálogo: 5 min; perfil propio: 30s; precio: 10s)
- **Cache-aside pattern**:

```python
def get_product(id):
    cached = redis.get(f"product:{id}")
    if cached:
        return cached
    product = db.query("SELECT ... WHERE id = ?", id)
    redis.set(f"product:{id}", product, ttl=300)
    return product
```

- **Stale-while-revalidate**: sirve cache vieja, refresca en background. El usuario nunca espera.

## 19.4 Read replicas + routing inteligente

- Escrituras → primaria
- Lecturas → réplica
- Después de escribir, las próximas N lecturas del mismo usuario van a la primaria (evita ver datos viejos por replication lag)

## 19.5 Vistas materializadas

Para reportes/dashboards con agregaciones pesadas (que tomarían segundos con joins en vivo):

```sql
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT user_id, COUNT(*) total, SUM(amount) revenue
FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;

REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
```

Refresca cada hora con cron. El dashboard responde en milisegundos.

## 19.6 Pre-computed counts y contadores

**Twitter NO ejecuta `COUNT(*) FROM tweets WHERE user_id = ?`.** Mantienen un contador denormalizado que se incrementa con cada tweet. Mismo principio para likes, followers, etc.

```sql
-- Al insertar un tweet
BEGIN;
INSERT INTO tweets ...;
UPDATE user_stats SET tweet_count = tweet_count + 1 WHERE user_id = ?;
COMMIT;
```

## 19.7 Denormalización estratégica

3FN es bonita en teoría. En producción a escala, denormalizas:

- Guarda `author_name` en `posts` aunque también esté en `users`
- Guarda totales en órdenes en vez de calcular sumando line_items
- **Trade-off**: más espacio + complejidad de updates, pero queries instantáneas

## 19.8 Search engine para texto

NO uses `LIKE '%palabra%'` en Postgres para búsqueda real (full table scan). Usa:

- **Postgres FTS** (`tsvector`/`tsquery`) — bueno para volúmenes medianos
- **Elasticsearch / OpenSearch** — estándar de la industria
- **Algolia / Meilisearch / Typesense** — managed, rapidísimos

## 19.9 Data warehouse separado para analytics

Reportes y BI **NO** deben correr contra la BD transaccional:

- CDC (Debezium, Fivetran) → Snowflake / BigQuery / Redshift / ClickHouse
- Queries analíticas en columnas comprimidas, miles de veces más rápido
- Tu OLTP queda libre para servir usuarios

## 19.10 N+1 elimination

```js
// ❌ N+1: una query por post
const posts = await db.posts.findAll();
for (const post of posts) {
  post.author = await db.users.findById(post.author_id); // ¡N queries!
}

// ✅ batching con DataLoader
const loader = new DataLoader(ids => db.users.findByIds(ids));
const posts = await db.posts.findAll();
await Promise.all(posts.map(p => loader.load(p.author_id))); // 1 query
```

## 19.11 Streaming de datos al UI

En vez de esperar todos los datos, **streaming response**:

- Server Components de React con `Suspense`
- HTTP chunked transfer
- WebSockets / SSE para datos en vivo
- Skeleton screens mientras llega cada chunk

## 19.12 Pre-fetching inteligente

- Al hover sobre un link, prefetch de la siguiente página (Next.js lo hace por defecto)
- Predicción de navegación basada en patrones (Quicklink de Google)
- Service Worker que cachea rutas probables

## 19.13 Compresión y tamaño de payload

- JSON minificado (sin espacios)
- Brotli compression
- Para APIs internas: **gRPC + Protobuf** o **MessagePack** (5-10x más pequeño que JSON)
- Truncar campos enormes (descripciones largas: enviar primeros 200 chars + "load more")

---

# 20. Cómo lo hacen las grandes empresas

## Stripe
- **Idempotency keys** en cada endpoint mutativo (canónico de la industria)
- Versionado de API por fecha (`Stripe-Version: 2024-06-20`)
- Webhooks con firma HMAC y reintentos
- Documentación generada del código (no se desincroniza)
- API consistency: cada recurso tiene los mismos verbos y estructura

## Netflix
- **Microservicios** (700+ servicios)
- **Chaos Monkey** y la Simian Army: matan servicios en producción
- **Hystrix** (circuit breaker) — abandonado pero su filosofía vive
- **EVCache** (memcached distribuido) para caching masivo
- **Open Connect**: su propio CDN para video
- **Hermes**: motor JS optimizado para apps móviles

## Google
- **SRE** como disciplina (libros de SRE son la biblia)
- **Spanner**: BD globalmente consistente con relojes atómicos
- **BigTable**: NoSQL masivo
- **Borg → Kubernetes**: orquestación de contenedores
- **SLO-driven development**: error budgets gobiernan releases

## Amazon
- **Cell-based architecture**: blast radius reducido
- **Two-pizza teams**: equipos pequeños, autónomos
- **Service-oriented**: Bezos mandate de 2002 (todo se comunica por API)
- **DynamoDB**: NoSQL con latencia sub-10ms a cualquier escala
- Deploy cada **11.7 segundos** en promedio

## Cloudflare
- **300+ POPs globales**: tu código corre cerca del usuario
- **Workers** (V8 isolates, no containers): cold start ~5ms
- **KV / Durable Objects / R2** para storage en el edge
- **Argo Smart Routing**: mejora 30% de latencia rerouteando

## Shopify
- **Pod architecture**: cada pod sirve a un subset de tiendas
- **Hydrogen**: framework React server-side sobre Oxygen (edge)
- **Modular monolith** > microservicios para ellos
- Sobreviven Black Friday con tráfico 100x el normal

## Discord
- **Elixir/Erlang** para WebSockets masivos (millones de conexiones por máquina)
- Migración de **Cassandra → ScyllaDB** para mensajes (latencia p99 de 40ms a 5ms)
- **Rust** para servicios críticos (Read States)

## Uber
- **H3**: indexación geoespacial hexagonal
- **Cadence/Temporal**: orquestación de workflows long-running
- **Schemaless**: capa sobre MySQL para sharding masivo
- **DOMA**: Domain-Oriented Microservice Architecture

## Twitter / X
- **Manhattan**: KV store interno
- **Pre-computed timelines**: el feed se calcula al escribir, no al leer
- **Snowflake IDs**: IDs únicos distribuidos sin coordinación

## Vercel / Next.js
- **ISR** (Incremental Static Regeneration)
- **Edge Functions** para baja latencia global
- **App Router con Server Components** y streaming

## Notion
- **Operational Transformation / CRDTs** para colaboración en tiempo real
- Modelo de bloques recursivos (todo es un bloque)
- Sharding por workspace

## WhatsApp
- **Erlang**: 2M conexiones por servidor
- 50 ingenieros para 900M usuarios cuando los compró Facebook
- "Boring tech" llevada al extremo

---

## 21. Pequeños detalles que distinguen lo profesional

- **Request ID** en todos los logs y devuelto al cliente para soporte
- **Correlation ID** entre servicios
- **Graceful shutdown**: el proceso termina requests en vuelo antes de morir (SIGTERM → drena → SIGKILL)
- **Retry-After headers** en 429 y 503
- **Compression** (gzip, brotli) en respuestas
- **HTTP/2 o HTTP/3** para multiplexing
- **ETag / If-None-Match** para responses condicionales (304)
- **Pagination con `next_cursor`** en respuestas
- **Soft launch / dark launch** de features
- **Kill switches** para apagar features en caliente
- **Maintenance mode** elegante con página explicativa, no 500
- **Accept-Language** header respetado
- **Tiempos en UTC en BD**, conversión a timezone local solo en presentación
- **Money en enteros (centavos)**, jamás en floats
- **UUIDs en lugar de IDs autoincrementales** públicos (no exponer cardinalidad)
- **Snowflake IDs** o ULIDs si necesitas IDs ordenables sin coordinación
- **Health endpoints separados** para liveness y readiness
- **Versioning de assets estáticos** con hash en el nombre (`app.a3f9c2.js`) → cache forever
- **Robots.txt y sitemap.xml** correctos
- **OpenGraph / Twitter Cards** para previews al compartir
- **Favicons** completos para todos los dispositivos
- **404 y 500 con utilidad** (búsqueda, links útiles, no solo "error")
- **Confirmación antes de acciones destructivas** (con typing del nombre del recurso)
- **Exportar datos del usuario** en formato estándar (CSV, JSON)
- **Empty states informativos** ("Aún no tienes pedidos. Crea el primero aquí")

---

## Checklist final para un sistema "production-ready"

### Performance
- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] CDN configurado con cache headers correctos
- [ ] Imágenes en AVIF/WebP con lazy loading
- [ ] Code splitting por ruta
- [ ] Critical CSS inline
- [ ] Brotli compression
- [ ] HTTP/2 o HTTP/3
- [ ] Performance budget en CI

### Resiliencia
- [ ] Idempotency keys en endpoints mutativos
- [ ] Retries con exponential backoff + jitter
- [ ] Circuit breakers en llamadas externas
- [ ] Timeouts en cada nivel
- [ ] Health checks (liveness + readiness)
- [ ] Graceful shutdown
- [ ] Dead letter queues

### Datos
- [ ] Transacciones donde corresponda
- [ ] Migraciones expand-contract
- [ ] Backups + restore probado
- [ ] Read replicas para lecturas
- [ ] Cache (Redis) para datos calientes
- [ ] Cursor-based pagination
- [ ] Índices monitoreados con EXPLAIN
- [ ] Soft deletes + audit columns

### Auth
- [ ] JWT corto + refresh token
- [ ] Permisos cacheados en Redis
- [ ] Edge auth si aplica
- [ ] HttpOnly + Secure + SameSite cookies
- [ ] MFA / passkeys disponible
- [ ] Rate limiting en login
- [ ] Audit logs de auth

### Seguridad
- [ ] TLS 1.2+ obligatorio
- [ ] Secrets en vault, no en código
- [ ] OWASP Top 10 mitigado
- [ ] WAF + DDoS protection
- [ ] Rate limiting por usuario/IP/endpoint
- [ ] CSP headers
- [ ] Encriptación de datos sensibles en reposo

### Observabilidad
- [ ] Logs estructurados centralizados
- [ ] Métricas (Four Golden Signals)
- [ ] Distributed tracing
- [ ] SLOs definidos + error budgets
- [ ] Alertas sobre síntomas, no causas
- [ ] RUM + synthetic monitoring
- [ ] Error tracking (Sentry)

### Operaciones
- [ ] CI/CD automatizado
- [ ] Canary o blue/green deployments
- [ ] Feature flags
- [ ] Rollback plan probado
- [ ] Runbooks para cada alerta
- [ ] On-call rotation
- [ ] Postmortems blameless
- [ ] Multi-region o al menos multi-AZ

### UX
- [ ] Skeletons y loading states
- [ ] Optimistic UI donde aplica
- [ ] Error boundaries
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] i18n preparado
- [ ] Empty states útiles
- [ ] 404 / 500 amigables

### Compliance
- [ ] GDPR / CCPA según aplique
- [ ] Right to access / forgotten implementados
- [ ] PII identificada y protegida
- [ ] Audit logs inmutables
- [ ] Data retention policies

---

> **La diferencia entre un sistema amateur y uno profesional no es una tecnología mágica: es la suma de cien decisiones pequeñas tomadas con disciplina. Cada item de este documento es una de esas decisiones.**
