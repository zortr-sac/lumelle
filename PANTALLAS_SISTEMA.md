# Pantallas del Sistema BellezaPro

> Análisis exhaustivo de todas las pantallas del SaaS de salones de belleza.
> **Stack:** Next.js 15 (App Router) · Tailwind · Supabase · Glassmorphism · Paleta lila/peach/lavender.
> **Total de pantallas:** **34**

---

## Índice por zonas

| Zona | Cantidad | Pantallas |
|---|---|---|
| 1. Públicas (marketing/legales) | 7 | Landing, Privacidad, Términos, Ayuda, 404, Error de ruta, Error global |
| 2. Autenticación | 4 | Login, Signup, Recuperar contraseña, Nueva contraseña |
| 3. Onboarding | 1 | Wizard de 3 pasos |
| 4. Página pública del salón `/b/[slug]` | 3 | Home del salón, Wizard de reserva, Éxito |
| 5. Dashboard | 1 | Resumen del día |
| 6. Agenda | 2 | Lista por día, Nueva cita |
| 7. Clientas | 4 | Lista, Detalle, Nueva, Editar |
| 8. Servicios | 4 | Lista, Nuevo, Editar, Plantillas |
| 9. Caja | 4 | Resumen del día, Abrir caja, Cerrar caja, Nueva venta |
| 10. Ajustes | 4 | Perfil, Negocio, Horarios, Equipo |

---

## 1. Zona pública (marketing / legales)

### 1.1 Landing `/`
**Archivo:** `src/app/page.tsx`

**Cómo se ve (de arriba a abajo):**

1. **Header fijo (h-20):**
   - Izquierda: cuadrado redondeado `size-10` con gradient lila→peach y un icono `Sparkles` blanco dentro. Al lado, marca **"BellezaPro"** en fuente display, `xl`, semibold. Al hacer hover el icono rota -6°.
   - Centro (solo md+): links **"Funciones"**, **"Precios"**, **"Iniciar sesión"** con subrayado animado lavender en hover.
   - Derecha: botón **"Empezar gratis"** (size sm, primario).

2. **Hero (py-16 md:py-28, centrado):**
   - Badge soft con icono Sparkles: *"Hecho para manicuristas y salones en Perú"*.
   - H1 (font-display, hasta 7xl en lg): *"Ordena tu agenda y haz que tus **clientas vuelvan**"* — las dos últimas palabras con gradient-text lila→peach.
   - Párrafo: *"Agenda, caja y reservas online en una sola app. Tus clientas reservan desde un link y tú controlas todo desde el celular."*
   - Doble CTA: **"Probar gratis 14 días"** (primario, con `ArrowRight` y efecto shine) + **"Ver demo"** (variant glass).
   - Microcopy: *"Sin tarjeta de crédito · Configuración en 5 minutos"*.

3. **Tarjeta hero con grid de 6 features (mt-20):**
   - Card `glass-card-strong` con aspect 16/9 y fondo gradient lila/peach/cream 30%.
   - Grid 2/3 columnas con mini-cards (icono lavender + título): Agenda inteligente · Reservas por WhatsApp · Caja con Yape y Plin · Historial de clientas · Reportes en frases simples · Tu página pública.

4. **Sección "Funciones" (id=features, py-20):**
   - Badge "Funciones" + H2 *"Todo lo que necesitas para tu salón en un solo lugar"*.
   - Grid de 6 `TiltCard` (efecto 3D al hover): cada una con icono lavender en cuadrado `bg-grad-soft`, título display y descripción muted. Reveal animation con delay secuencial.

5. **Sección "Precios" (id=precios):** 3 cards en grid:
   - **Básico — S/39/mes** "Manicurista independiente" (variant outline).
   - **Pro — S/89/mes** "Studio pequeño (2-5 técnicas)" — destacado con ring lavender, badge "Más popular" y CTA primario.
   - **Salón — S/199/mes** "Equipo grande con inventario" (variant outline).
   - Cada card lista features con `CheckCircle2` lavender.

6. **CTA final (py-20):** glass-card-strong, max-w-4xl, *"¿Lista para ordenar tu salón?"* + botón shine **"Crear mi cuenta"**.

7. **Footer (border-t):** *"© 2026 BellezaPro. Hecho con cariño en Perú 🇵🇪"* + links Privacidad / Términos / Ayuda.

---

### 1.2 Política de privacidad `/privacy`
**Archivo:** `src/app/privacy/page.tsx`

- Fondo gradient hero opacity 20% (fixed inset-0).
- Header con link **"Volver"** (`ChevronLeft`) + logo BellezaPro.
- H1 *"Política de privacidad"* (display, 4xl→5xl) + *"Última actualización: 2026"*.
- 9 secciones de contenido: **1) Quiénes somos** (Ley 29733 Perú) · **2) Datos que recolectamos** (dueña, clientas, uso) · **3) Cómo usamos tus datos** · **4) Compartir información** · **5) Tus derechos** · **6) Seguridad** (HTTPS, hashing, RLS) · **7) Retención** (30 días backup) · **8) Cambios** · **9) Contacto** (`hola@bellezapro.app`).

---

### 1.3 Términos y condiciones `/terms`
**Archivo:** `src/app/terms/page.tsx`

- Misma plantilla que Privacy (fondo, header, logo, max-w-3xl).
- H1 *"Términos y condiciones"*.
- 10 secciones: Aceptación · Cuentas (una cuenta = un negocio) · Pago y prueba (14 días free, sin reembolso) · Uso aceptable · Datos del negocio · Disponibilidad (esfuerzo 99%) · Limitación de responsabilidad · Cambios al servicio (30 días aviso) · Ley aplicable (Perú, Lima) · Contacto.

---

### 1.4 Centro de ayuda `/help`
**Archivo:** `src/app/help/page.tsx`

- Header + H1 *"Centro de ayuda"* + bajada *"Las preguntas más frecuentes…"*.
- **7 FAQs** en cards `glass-card` con padding 5:
  1. ¿Cómo recibo reservas en línea?
  2. ¿Cómo confirmo una reserva?
  3. ¿Puedo registrar pagos con Yape o Plin?
  4. ¿Cómo evito doble agendamiento?
  5. ¿Cómo agrego mis técnicas?
  6. ¿Mis datos están seguros?
  7. ¿Puedo cancelar cuando quiera?
- Card final `glass-card-strong` *"¿Necesitas más ayuda?"* con dos botones: **WhatsApp** (`wa.me/51999999999`) y **hola@bellezapro.app**.

---

### 1.5 Not Found `/not-found.tsx`
**Archivo:** `src/app/not-found.tsx`

- Pantalla completa centrada, fondo `bg-grad-hero` opacity 30%.
- Círculo `size-20` con gradient hero + icono `Sparkles` blanco.
- **"404"** (display, 5xl→6xl) + *"No encontramos esta página."*.
- Botón **"Volver al inicio"** (size lg) → `/`.

---

### 1.6 Error de ruta `error.tsx`
**Archivo:** `src/app/error.tsx`

- Centrado, fondo grad-hero opacity 20%.
- Círculo `bg-amber-100` con `AlertTriangle` ámbar.
- *"Algo salió mal"* + *"Tuvimos un problema cargando esta página. Ya estamos enterados."* + error digest en font-mono si existe.
- Botones **"Reintentar"** (`RotateCcw`, dispara `reset()`) y **"Ir al inicio"** (glass, → `/dashboard`).

---

### 1.7 Error global `global-error.tsx`
**Archivo:** `src/app/global-error.tsx`

- Reemplaza el root layout si todo falla. Sin CSS global (todo inline).
- Fondo gradient `linear-gradient(135deg,#E0BBE4,#FEC8D8,#FFDFD3)`, fontFamily system-ui.
- Emoji **"💔"** (48px) + *"Algo salió muy mal"* + *"La aplicación no pudo iniciar. Por favor recarga la página."* + ID del error.
- Botón **"Recargar"** redondeado completo con gradient lila→rosa (`#957DAD → #C9395E`).

---

## 2. Autenticación

**Layout compartido:** `src/app/(auth)/layout.tsx` — `AmbientBlobs` decorativos animados + header con logo BellezaPro + main centrado con card `max-w-md`.

### 2.1 Login `/login`
**Archivos:** `(auth)/login/page.tsx` + `login-form.tsx`

- Card `glass-card-strong` centrada.
- Título **"Volvé a tu salón"** + descripción *"Ingresa tu email y contraseña"*.
- Formulario (space-y-4):
  - **Email** (placeholder `tu@email.com`, autocomplete email).
  - **Contraseña** (autocomplete current-password).
- Botón **"Ingresar"** (size lg, width full). Cuando envía: `Loader2` + *"Ingresando…"*.
- Link gris debajo: **"¿Olvidaste tu contraseña?"** → `/forgot`.
- Link: **"¿Aún no tienes cuenta? Crear una"** → `/signup`.
- En error muestra toast rojo *"No pudimos iniciar sesión"* (mapea "Invalid login credentials" a *"Email o contraseña incorrectos"*).
- En éxito redirige a `searchParams.redirect ?? "/dashboard"`.

---

### 2.2 Signup `/signup`
**Archivos:** `(auth)/signup/page.tsx` + `signup-form.tsx`

- Card glass-card-strong.
- Título **"Crea tu cuenta"** + descripción *"14 días gratis. Sin tarjeta."*.
- Formulario:
  - **Tu nombre completo** (placeholder `María Pérez`).
  - **Email**.
  - **Contraseña** + helper *"Mínimo 8 caracteres, una mayúscula y un número"* (en gris si no hay error, en rojo si falla).
- Botón **"Crear mi cuenta"**. Loading: *"Creando cuenta…"*.
- Link **"¿Ya tienes cuenta? Iniciar sesión"** + microcopy legal *"Al continuar aceptas los términos y la política de privacidad"* con links subrayados.
- En éxito: toast *"¡Cuenta creada! Vamos a configurar tu negocio"* → `/onboarding`.

---

### 2.3 Recuperar contraseña `/forgot`
**Archivos:** `(auth)/forgot/page.tsx` + `forgot-form.tsx`

- Card glass-card-strong.
- Título **"Recuperar contraseña"** + *"Te enviaremos un link para restablecerla"*.
- **Estado 1 (formulario):** input Email + botón **"Enviar link de recuperación"** (loading *"Enviando…"*).
- **Estado 2 (enviado):** caja rounded-2xl con fondo `bg-brand-lila/10` y texto *"Revisa tu bandeja de entrada. Si no lo encuentras, mira en spam."*. El formulario desaparece.
- Link gris **"Volver a iniciar sesión"** → `/login`.

---

### 2.4 Nueva contraseña `/reset`
**Archivos:** `(auth)/reset/page.tsx` + `reset-form.tsx`

- Card glass-card-strong, layout minimalista.
- Título **"Nueva contraseña"** + *"Elige una contraseña segura"*.
- Un solo campo: **Nueva contraseña** (autocomplete new-password).
- Botón **"Guardar contraseña"** (loading *"Guardando…"*).
- En éxito: toast *"Contraseña actualizada"* → `/dashboard`.

---

## 3. Onboarding

### 3.1 Wizard de configuración `/onboarding`
**Archivos:** `(app)/onboarding/page.tsx` + `onboarding-wizard.tsx`

- Si ya tiene `businessId` redirige a `/dashboard`. Si no hay sesión → `/login`.
- Fondo: gradient hero 30% + blob lila blur 3xl en top-right.
- **Sección bienvenida:** badge soft *"Hola María"* (con primer nombre) + H1 *"Vamos a configurar tu salón en 3 pasos"* (display, md:4xl).
- **Indicador de progreso:** 3 círculos `size-10` conectados por líneas `h-1 w-12`. Completado = gradient button + `Check`. Actual = gradient. Pendiente = `bg-muted`.

**PASO 1 — Tu negocio**
- Card title *"Tu negocio"* / desc *"Nombre y URL"*.
- **Nombre del salón** (placeholder `Studio Bella Nails`). Al perder foco autosugiere slug si está vacío.
- **Tu URL pública** con prefijo fijo `bellezapro.app/b/` y input inline (lowercase + sanea). Indicador en tiempo real: spinner mientras chequea, **checkmark verde** si está disponible, **"No disponible"** rojo si está taken.
- Helper: *"Aquí tus clientas reservarán. Comparte por Instagram o WhatsApp."*.
- Botón **"Continuar"**.

**PASO 2 — Ubicación**
- **Distrito** (placeholder `Miraflores`).
- **Ciudad** (default `Lima`).
- **Dirección (opcional)** + helper *"Solo aparecerá en tu página pública si la pones aquí."*.
- Botones **"Atrás"** (ghost) y **"Continuar"**.

**PASO 3 — Contacto**
- **WhatsApp del salón** (placeholder `+51 999 999 999`) + helper *"Por aquí recibirás confirmaciones de citas."*.
- **Instagram (opcional)** con prefijo `@` (placeholder `studio.bella`).
- **Política de reservas (opcional)** textarea (placeholder *"Confirmación por WhatsApp. Cancelaciones con 24h de anticipación."*).
- Botones **"Atrás"** y **"Crear mi salón"** (submit, loading *"Creando…"*).
- En éxito: toast *"¡Tu negocio está listo!"* → `/dashboard`.

---

## 4. Página pública del salón `/b/[slug]`

**Layout:** `(b)/[slug]/layout.tsx` — fondo grad-hero 20% + blob lila blur en top-right.

### 4.1 Home del salón `/b/[slug]`
**Archivo:** `src/app/b/[slug]/page.tsx`

- **Hero imagen de portada** (256px mobile → 384px desktop) en la parte superior.
- **Card header** `glass-card-strong` posicionada `-mt-20` (solapando la imagen):
  - **Logo** circular `size-24/32` con border blanco 4px, rounded-3xl, shadow-pop, sobre el resto.
  - **Nombre del negocio** en font-display (3xl→5xl).
  - **Ubicación** con icono `MapPin` (distrito, ciudad).
  - **Instagram** como link `@usuario` (si está configurado).
  - Botón primario **"Reservar cita"** (size xl, efecto shine) → `/b/[slug]/reservar`.
  - Botón secundario **"Consultar"** (glass, size sm) que abre WhatsApp con mensaje pre-armado.
- **Servicios agrupados por categoría:** grid 1/2/3 columnas. Cada card glass:
  - Miniatura del servicio (o icono).
  - Nombre + descripción (clamp 2 líneas).
  - Precio en PEN + duración en min con icono `Clock`.
  - Botón **"Reservar"** → `/b/[slug]/reservar?service={id}`.
- **Equipo:** grid 2/3/4 columnas. Círculos `size-20` con la inicial del nombre sobre color personalizado + nombre + rol.
- **Horarios:** tabla días/rangos (ej. `Lunes 09:00 – 18:00` o `Cerrado`).
- **Dirección** con `MapPin`.
- **CTA final:** *"¿Lista para tu próxima cita?"* + botón grande → `/b/[slug]/reservar`.
- **Footer:** *"Hecho con ✨ por BellezaPro"*.

---

### 4.2 Wizard de reserva `/b/[slug]/reservar`
**Archivos:** `reservar/page.tsx` + `booking-wizard.tsx`

- Link superior `< Nombre del Salón`.
- **Indicador de 4 pasos:** círculos numerados `size-9` conectados; completados con gradient + check.

**PASO 1 — Servicio (*"¿Qué te haces?"*)**
- Lista scrolleable (max-h 60vh) de servicios. Cada uno:
  - Miniatura 64×64 (imagen o icono Sparkles).
  - Nombre + descripción 1 línea + duración con icono Clock + precio.
  - Seleccionado: border 2 lavender + `bg-lavender/10`.

**PASO 2 — Técnica (*"¿Con quién?"*)**
- Grid 2 columnas. Si el servicio no requiere staff: opción **"Cualquiera disponible"** con icono Sparkles.
- Cada técnica: círculo 64 con inicial sobre color custom, nombre y rol.

**PASO 3 — Fecha y hora (*"¿Cuándo?"*)**
- **Selector horizontal de 14 días:** cada día box `min-w-16` con día de semana, número grande en display y mes. Seleccionado: gradient button + texto blanco + shadow.
- **Grupos de slots:**
  - **Mañana** (icono Sun) — grid 3/4 cols.
  - **Tarde** (icono Sunset).
  - **Noche** (icono Moon).
  - Cada slot: botón rounded-xl con la hora (ej `09:00`).
- Mientras carga: spinner *"cargando"*. Sin slots: icono Calendar + *"Sin horarios disponibles este día"*.

**PASO 4 — Tus datos**
- **Tu nombre** (2-120, placeholder `María Pérez`).
- **WhatsApp** (validación PE, placeholder `+51 999 999 999`).
- **Email** (opcional).
- **Notas** (textarea opcional, max 500, placeholder *"¿Algo que debamos saber?"*).
- **Resumen** en box `bg-muted/50 rounded-2xl`: Servicio · Con · Cuándo (fecha completa en español) · línea divisora · **Total** en grande.
- **Política de reservas** del salón (si existe) en box `bg-lila/10`.
- **Checkbox:** *"Acepto las políticas de privacidad y autorizo el uso de mis datos"* + link `/privacy`.
- Botones **"Atrás"** + **"Confirmar reserva"** (loading *"⟳ Reservando…"*).

---

### 4.3 Reserva exitosa `/b/[slug]/reservar/exito`
**Archivo:** `b/[slug]/reservar/exito/page.tsx`

- Pantalla completa centrada. Fondo grad-hero 30% + blob lila.
- Card `glass-card-strong` max-w-xl, padding 8-10.
- Círculo `bg-emerald-100 size-20` con `CheckCircle2` emerald-600.
- H1 **"¡Reserva enviada!"** (display 3xl-4xl).
- Texto: *"[Nombre Salón] la recibirá ahora. **Confírmala por WhatsApp** para asegurar tu hora."*.
- Box `bg-lila/10 rounded-2xl` con icono Sparkles + título **"Próximos pasos"** y lista numerada:
  1. Envía el mensaje de WhatsApp prellenado.
  2. Espera que el salón te confirme.
  3. ¡Listo! Te esperan.
- Botón primario **"Confirmar por WhatsApp"** (icono `MessageCircle`, size xl, shine) abre `wa.me` con mensaje prellenado.
- Botón ghost **"Volver a [Nombre Salón]"** → `/b/[slug]`.

---

## 5. Dashboard (área autenticada)

**Layout `(app)`:** valida sesión y envuelve en `AppShell` (sidebar/topbar).

### 5.1 Dashboard `/dashboard`
**Archivo:** `(app)/dashboard/page.tsx` + `_components/sections.tsx`

**Header:**
- Badge soft con Sparkles: *"Hola María"*.
- H1 en display: nombre del salón.
- Subtítulo gris *"Esto es lo que pasa hoy en tu negocio."*.
- Derecha: botón **"Ver página pública"** (glass + `ExternalLink`) y **"Nueva cita"** (primario + `Plus`).

**4 StatCards (grid md:2 / lg:4)**, todos clickeables:
1. **Citas hoy** — icono `Calendar` lavender + número → `/dashboard/agenda`.
2. **Ventas hoy** — icono `CreditCard` + monto PEN → `/dashboard/caja`.
3. **Por confirmar** — icono `Bell` + cantidad (ring ámbar si hay pendientes) → `/dashboard/agenda?status=requested`.
4. **7 días** — icono `TrendingUp` + ingresos semanales → `/dashboard/caja`.

**Grid central 2/3 + 1/3:**
- **Lado izquierdo (Citas de hoy):**
  - Card con título y botón **"Ver todas"** (chevron).
  - Vacío: EmptyState con ilustración + *"Tu agenda está libre hoy ✨"* + botón **"Crear cita"**.
  - Con citas: lista `ul`. Cada item: hora grande en display tabular-nums, nombre clienta, servicio + técnica (xs muted), badge de estado.
- **Lado derecho (Por confirmar):**
  - Card. Vacío: EmptyState descriptivo.
  - Con pendientes: items con borde `border-amber-200 bg-amber-50/60`, nombre + servicio/fecha.

**Sección inferior — Próximos cumpleaños:**
- Icono `Cake` + título. Grid sm:2/lg:3 con items `bg-brand-peach/20 rounded-2xl p-3`: nombre + fecha con 🎂.

---

## 6. Agenda

### 6.1 Agenda `/dashboard/agenda`
**Archivos:** `agenda/page.tsx` + `_components/agenda-list.tsx` + `appointment-row.tsx`

**Header:**
- H1 *"Agenda"* + subtítulo con fecha completa en español (*"martes, 13 de mayo de 2026"*).
- Botones de navegación (`<` `>` `Hoy`) + botón primario **"Nueva cita"**.

**Selector horizontal de 7 días** (3 antes + hoy + 3 después). Cada botón `min-w-16`:
- Día abreviado uppercase + número grande display + mes abreviado.
- Activo: `bg-grad-button` + blanco + shadow. Inactivo: `bg-white/60` con scale 105% en hover.
- Cada botón es link `?date=yyyy-MM-dd`.

**Filtros de estado (badges):** Todas · Solicitadas · Confirmadas · Atendidas. Activo variant info, inactivo outline.

**Listado:**
- Vacío: EmptyState con ilustración + *"Tu agenda está libre este día ✨"* + botón **"Crear cita"**.
- Con citas: `ul divide-y`. Cada fila:
  - **Hora** grande en display + duración en xs.
  - **Dot color** del staff (fallback `#957DAD`).
  - **Nombre cliente** + servicio·técnica truncados.
  - **Precio** en display sm (visible en sm+).
  - **Badge** según estado: Solicitada (warning), Confirmada (info), En atención (success), Atendida (soft), Cancelada / No asistió (destructive).
  - Botón `MoreVertical` → abre Dialog.

**Dialog de acciones (al click ⋮):**
- Header con nombre cliente.
- Detalles: Servicio · Hora inicio – fin · Técnica · Notas.
- Botones contextuales:
  - `requested` → **Confirmar** (`Check`) + WhatsApp.
  - `confirmed` → **Iniciar** (`Play`) + WhatsApp.
  - `in_progress` → **Finalizar** (`Square`) + WhatsApp.
  - Si no terminada: **Cancelar cita** (rojo, ocupa todo el ancho).

---

### 6.2 Nueva cita `/dashboard/agenda/nueva`
**Archivos:** `agenda/nueva/page.tsx` + `appointment-form.tsx`

- Header: H1 *"Nueva cita"* + subtítulo *"Agenda una cita interna desde el dashboard."*.
- Card `glass-card-strong` max-w-2xl mx-auto. Formulario (space-y-5):
  1. **Clienta:** Select con clientas (max 500). Si no hay, link **"crear clienta"** azul → `/dashboard/clientas/nueva`.
  2. **Servicio:** Select con servicios activos `[NOMBRE] · [DURACIÓN]min · [PRECIO]`. Si no hay, link a `/dashboard/servicios/nuevo`.
  3. **Técnica (opcional):** Select solo si hay staff bookable. Cada opción: dot color + nombre. Default placeholder *"Sin asignar"*.
  4. **Fecha y Hora (grid sm:2):**
     - **Fecha:** Popover con Calendar. Botón muestra fecha formateada (*"lunes 13 de mayo de 2026"*) o *"Elegir fecha"*. Default: hoy.
     - **Hora:** input `type=time` (default `10:00`).
  5. **Notas (opcional):** textarea (placeholder *"Ej: pedir esmalte de color azul, llega 5 min tarde…"*).
- Botones **"Cancelar"** (ghost) + **"Agendar cita"** (loading *"Agendando…"*).
- Estado inicial: `confirmed` (no requested).
- Éxito: toast *"Cita agendada ✨"* → `/dashboard/agenda`.

---

## 7. Clientas

### 7.1 Listado `/dashboard/clientas`
**Archivo:** `dashboard/clientas/page.tsx`

- Header: H1 **"Clientas"** + subtítulo *"Tu historial. La que vuelve te quiere."* + botón primario **"Nueva clienta"**.
- **Barra de búsqueda** con `Search` icon, placeholder *"Buscar por nombre o teléfono"*.
- **5 badges/pills:** Todas · Nuevas · Activas · Frecuentes · Inactivas (funcionan como links de filtro `?status=`).
- **Grid 1/2/3 columnas** con cards glass clickeables → `/dashboard/clientas/[id]`. Cada card:
  - Nombre (truncado).
  - Teléfono con icono Phone (formateado *+51 999 999 999*).
  - Badge de estado (info/success/warning/soft).
  - Cantidad de visitas.
  - Total gastado en S/.
  - Última visita (si existe).
  - Cumpleaños con icono Cake formato *"d MMM"*.
- Animaciones: PageTransition + Stagger + HoverCard subtle.
- Vacío: EmptyState + CTA para crear primera clienta.

---

### 7.2 Detalle `/dashboard/clientas/[id]`
**Archivo:** `dashboard/clientas/[id]/page.tsx`

**Header:**
- H1 nombre clienta (3xl/4xl) + Badge de estado.
- Botones: **WhatsApp** (glass, si tiene teléfono) + **Editar** (primary).

**Grid 3 columnas:**
- **Card "Contacto" (col-span-1):** lista con iconos — Teléfono, Email, Instagram (`@`), Ubicación (MapPin), Cumpleaños (Cake, formato *"d MMM yyyy"*).
- **Card "Estadísticas" (col-span-2):** 3 boxes `rounded-2xl bg-grad-soft p-3`:
  - **Visitas** — número.
  - **Total gastado** — moneda S/.
  - **Última visita** — *"d MMM"* o guion.

**Card condicional "Cuidados especiales"** (solo si hay alergias o notas):
- Sección **ALERGIAS / CUIDADOS**.
- Sección **NOTAS INTERNAS**.

**Card "Historial de citas":**
- Max 20 citas DESC. `ul divide-y`. Cada item:
  - Servicio (sm font-medium).
  - Fecha/hora + nombre técnica (xs muted).
  - Badge estado (soft).
- Vacío: *"Sin citas registradas todavía."*.

---

### 7.3 Nueva clienta `/dashboard/clientas/nueva`
**Archivo:** `dashboard/clientas/nueva/page.tsx`

- H1 **"Nueva clienta"** + subtítulo *"Cuanto más sepas de ella, mejor la atiendes."*.
- Card glass-card-strong max-w-xl con `<CustomerForm />`.

**CustomerForm:**
- **Nombre completo** (required, placeholder `María Pérez`).
- **Teléfono** (placeholder `+51 999 999 999`).
- **Email** (opcional).
- **Cumpleaños** (date opcional).
- **Distrito** (opcional, placeholder `Miraflores`).
- **Instagram** con prefijo `@` decorativo (opcional).
- **Alergias o cuidados** (textarea, placeholder *"Alergia a acetona, esmaltes vegan only…"*).
- **Notas internas** (textarea, placeholder *"Le gusta gel, viene cada 3 semanas…"*).
- Layout: nombre full / teléfono+email 2col / cumpleaños+distrito 2col / instagram full / textareas full.
- Botones **"Cancelar"** (ghost) + **"Guardar"** (loading *"Guardando…"*).

---

### 7.4 Editar clienta `/dashboard/clientas/[id]/editar`
**Archivo:** `dashboard/clientas/[id]/editar/page.tsx`

- Idéntico al de Nueva pero con `defaultValues` precargados y subtítulo *"Actualiza los datos de {customer.name}."*. Requiere rol *receptionist*.

---

## 8. Servicios

### 8.1 Listado `/dashboard/servicios`
**Archivo:** `dashboard/servicios/page.tsx`

- Header: H1 *"Servicios"* + subtítulo *"Lo que ofreces. Aparece en tu página pública de reservas."* + botón **"Nuevo servicio"**.
- Servicios agrupados por categoría. Cada grupo: H2 nombre categoría (text-muted) + grid 3 cols de cards `glass-card`.

**Cada card:**
- Imagen opcional (h-40 cover) arriba.
- Nombre servicio (medium).
- Descripción (clamp 2 líneas, xs muted).
- Badge **"Pausado"** si `is_active=false` (card opacity-60).
- Precio grande (`text-2xl font-display`).
- Duración con icono `Clock` (xs).
- Acciones: botón `Edit` + botón `MoreVertical`.

**Vacío:** EmptyState con ilustración + *"Define lo que ofreces"* + *"Agrega los servicios para que tus clientas puedan reservar…"* + botones **"Crear servicio"** + **"Usar plantillas"**.

**Dialog del menú ⋮:** Pausar/Activar + **Eliminar** (rojo). El Dialog de confirmación dice *"¿Eliminar servicio? Esta acción no se puede deshacer. Si el servicio tiene citas, se mantendrán pero ya no podrás agendarlo."*.

---

### 8.2 Nuevo servicio `/dashboard/servicios/nuevo`
**Archivo:** `dashboard/servicios/nuevo/page.tsx`

- H1 *"Nuevo servicio"* + subtítulo *"Define qué ofreces para que aparezca en tu página pública."*.
- Card max-w-2xl con `<ServiceForm />`.

**ServiceForm:**
- **Nombre servicio** (required, placeholder `Manicure gel`).
- **2 cols:** Categoría (dropdown: Manicure, Pedicure, Diseños, Cejas, Pestañas, Maquillaje, Cabello, Spa, Otros) + Duración en minutos (step 5, min 5).
- **2 cols:** Precio (prefijo `S/`, step 0.5) + Tiempo de limpieza (opcional, step 5).
- **Descripción** (textarea, placeholder *"Lo que incluye el servicio…"*).
- **Caja de checkboxes** (`bg-muted/40 rounded`):
  - ☑ **"Servicio activo"** — *"Si está pausado, no aparece en tu página pública"*.
  - ☑ **"Requiere elegir técnica"** — *"La clienta elegirá quién la atiende"*.
- Botones **"Cancelar"** (ghost) + **"Crear servicio"** / **"Guardar cambios"** según contexto.

---

### 8.3 Editar servicio `/dashboard/servicios/[id]/editar`
**Archivo:** `dashboard/servicios/[id]/editar/page.tsx`

- H1 *"Editar servicio"* + subtítulo *"Actualiza los datos de {service.name}."*.
- Mismo ServiceForm con `defaultValues`. Requiere rol *owner*.

---

### 8.4 Plantillas `/dashboard/servicios/plantillas`
**Archivos:** `servicios/plantillas/page.tsx` + `templates-grid.tsx`

- Botón back *"Volver a servicios"* (ghost, sm).
- H1 *"Plantillas de servicios"* + subtítulo *"Agrega servicios populares a tu catálogo en un click."*.
- Plantillas agrupadas por categoría con Badge soft en cada grupo.
- Grid sm:2/lg:3 de cards `glass-card`. Cada card:
  - Nombre + descripción (clamp 2).
  - Precio default S/ + duración con icono Clock.
  - Botón **"Agregar"** o (si ya está) Badge **"Agregado ✓"** + opacity-60.
- Animación Framer Motion staggered (delay 0.04s, duración 0.36s).

---

## 9. Caja

### 9.1 Caja (resumen del día) `/dashboard/caja`
**Archivo:** `dashboard/caja/page.tsx`

**Header:**
- H1 *"Caja"* + subtítulo *"Movimiento del día. [Sesión abierta/Sin sesión activa]."*.
- Sin sesión: botón **"Abrir caja"**. Con sesión: **"+ Nueva venta"** + **"Cerrar caja"** (glass + `Lock`).

**3 StatCards (grid md:3, stagger animation, HoverCard subtle):**
1. **Ventas hoy** — `CreditCard` + monto display 3xl + *"[N] venta/ventas"*.
2. **Gastos** — `Wallet` + monto.
3. **Neto** — `TrendingUp` + monto con `gradient-text` (degradado).

**Card "Por método de pago":**
- Vacío: *"Sin pagos registrados."*.
- Con datos: grid sm:2/lg:3. Cada item: icono `Smartphone` lavender + nombre método (Efectivo / Yape / Plin / Transferencia / POS / Otro) + monto right-aligned.

**Card "Ventas del día":**
- Vacío con sesión: EmptyState + *"Aún no hay ventas / Cuando registres una venta aparecerá aquí."* + botón **"Registrar venta"**.
- Vacío sin sesión: *"Abre caja para empezar a registrar ventas."* + botón **"Abrir caja"**.
- Con ventas: `ul divide-y` (DESC). Cada item: nombre cliente (o *"Cliente walk-in"*) + fecha/hora xs muted + monto en display lg.

---

### 9.2 Abrir caja `/dashboard/caja/abrir`
**Archivos:** `caja/abrir/page.tsx` + `open-session-form.tsx`

- Si ya hay sesión abierta → redirect a `/dashboard/caja`.
- Card `glass-card-strong` max-w-md con title **"Abrir caja"** + descripción *"Cuenta el efectivo con el que abres el día. El sistema lo usará para el cuadre al cerrar."*.
- **Efectivo de apertura** — input number (min 0, step 0.5) con prefijo `S/` (absolute left-4), autoFocus. Helper *"Cuenta los billetes y monedas físicos antes de empezar."*.
- **Notas (opcional)** — textarea (placeholder *"Ej: Fondo fijo del día"*).
- Botones **"Cancelar"** (ghost) + **"Abrir caja"** (loading *"Abriendo…"*).
- Éxito: toast *"Caja abierta 💼"* → `/dashboard/caja`.

---

### 9.3 Cerrar caja `/dashboard/caja/cierre`
**Archivos:** `caja/cierre/page.tsx` + `close-session-form.tsx`

- Si no hay sesión abierta → redirect a `/dashboard/caja`.

**Resumen contable** (box `rounded-2xl bg-grad-soft/40 p-5 space-y-3`). Componente Row por línea:
- **Apertura** — monto + fecha/hora subtext.
- **+ Ventas en efectivo** — suma `payments.method=cash`.
- **- Gastos en efectivo** — suma `expenses`.
- **Esperado en caja** — bold, display text-2xl (opening + ingreso − egreso).

**Formulario (max-w-xl glass-card-strong):**
- **Efectivo contado en caja** — input number prefijo `S/`, autoFocus, classes `text-xl font-display`.
- **Alerta dinámica** según diferencia:
  - `= 0`: variant success + `CheckCircle2` + *"**Cuadra perfecto.** Diferencia: S/0.00"*.
  - `> 0`: variant info + `AlertTriangle` + *"Sobrante de **[MONTO]**. Hay más efectivo del esperado."*.
  - `< 0`: variant warning + `AlertTriangle` + *"Faltante de **[MONTO]**. Falta efectivo."*.
- **Notas (opcional)** — textarea (placeholder *"Ej: Devolución olvidada, propina extra…"*).
- Botones **"Cancelar"** + **"Cerrar caja"** (loading *"Cerrando…"*).
- Toast dinámico al éxito: *"Caja cuadrada ✓"* o *"Caja cerrada con [sobrante/faltante] de [monto]"*.

---

### 9.4 Nueva venta `/dashboard/caja/nueva-venta`
**Archivos:** `caja/nueva-venta/page.tsx` + `sale-form.tsx`

- Header: H1 *"Nueva venta"* + subtítulo *"Precargado desde la cita."* o *"Registrar venta sin cita o walk-in."*.

**Card 1 — Servicios (glass-card-strong p-5):**
- Header con título "Servicios" + Select **"Agregar servicio"** (w-56) — opciones `[NOMBRE] — [PRECIO]`.
- Vacío: *"Agrega al menos un servicio para continuar"*.
- Con items: `ul space-y-2`, cada `li bg-white/60 p-3 rounded-2xl`:
  - Nombre (flex-1 truncate) + precio unitario xs.
  - Input cantidad (w-16 h-10 center, min 1).
  - Subtotal calculado (display, w-24 right).
  - Botón `Trash` rojo.

**Card 2 — Cliente y ajustes (glass-card p-5):**
- **Cliente (opcional)** — Select (placeholder *"Walk-in (sin cliente)"*).
- **Grid sm:2:** Descuento + Propina (number, prefijo S/, min 0, step 0.5, default 0).

**Card 3 — Totales (glass-card-strong p-5):**
- Subtotal (gris).
- **− Descuento** (text-destructive rojo).
- **+ Propina** (emerald-700 verde).
- Línea divisora `border-brand-lila/30`.
- **TOTAL** — display text-3xl con `gradient-text`.

**Card 4 — Pagos (glass-card p-5):**
- Header: título + botón **"Agregar"** (glass + Plus) que crea payment con method=cash y amount remaining.
- `ul` de pagos. Cada item:
  - Icono del método.
  - Select método (w-36): Efectivo (Banknote) · Yape (Smartphone) · Plin (Smartphone) · Transferencia (Send) · POS (CreditCard) · Otro (Wallet2).
  - Input amount (S/, flex-1).
  - Botón **"Completar"** si remaining > 0.
  - Botón Trash (solo si payments > 1).
- **Status de pagos** (p-3 rounded-2xl):
  - remaining=0: `bg-emerald-50 text-emerald-700` *"Pagos cuadran ✓"*.
  - remaining>0: `bg-amber-50 text-amber-800` *"Falta cobrar"*.
  - remaining<0: `bg-destructive/10 text-destructive` *"Sobra cobrado"*.
  - Monto faltante/sobrante en display lg.

**Botones finales:**
- **"Cancelar"** (ghost).
- **"Registrar venta · [TOTAL EN PEN]"** (primary, lg). Disabled si items=0 o remaining≠0 o pending.
- Éxito: toast *"Venta registrada ✨"* → `/dashboard/caja`.

---

## 10. Ajustes

### 10.1 Perfil `/dashboard/ajustes/perfil`
**Archivos:** `perfil/page.tsx` + `profile-form.tsx` + `password-form.tsx`

- Header: H1 *"Mi perfil"* + email del usuario como subtitle.
- Container max-w-xl con 2 cards apiladas:

**Card 1 — Información personal:**
- Form:
  - **Nombre completo** (required, minLength 2).
  - **Teléfono** (opcional, placeholder `+51 999 999 999`).
  - Botón **"Guardar"** alineado derecha (loading *"Guardando…"*).
- Éxito: toast *"Perfil actualizado ✨"*.

**Card 2 — Seguridad:**
- Header: *"Seguridad"* + *"Cambia tu contraseña periódicamente."*.
- Form:
  - **Nueva contraseña** + helper *"Mínimo 8 caracteres, una mayúscula y un número."*.
  - **Confirmar contraseña**.
  - Validación: ambas deben coincidir (toast.error si no).
  - Botón **"Cambiar contraseña"** (loading *"Cambiando…"*). Reset campos al éxito.

---

### 10.2 Negocio `/dashboard/ajustes/negocio`
**Archivos:** `negocio/page.tsx` + `business-form.tsx`

- Header: H1 *"Mi negocio"* + subtítulo *"Lo que ven tus clientas."* + botón **"Ver página pública"** (glass) abre `/b/{slug}` en nueva tab.
- Container max-w-2xl.

**Card "Información del negocio":**
- Header con título y description que muestra `tu URL pública: **bellezapro.app/b/{slug}**`.
- Form:
  - **Nombre del salón** (required).
  - **URL pública (slug)** — **disabled** + helper *"El slug no se puede cambiar después de creado. Contacta soporte si necesitas modificarlo."*.
  - **2 cols:** Distrito + Ciudad.
  - **Dirección** (full).
  - **2 cols:** WhatsApp + Instagram (con `@` decorativo).
  - **Política de reservas** (textarea, placeholder *"Confirmación por WhatsApp. Cancelaciones con 24h de anticipación."*).
  - Botón **"Guardar"** → toast *"Negocio actualizado ✨"*.

---

### 10.3 Horarios `/dashboard/ajustes/horarios`
**Archivos:** `horarios/page.tsx` + `hours-editor.tsx`

- Header: H1 *"Horarios de atención"* + subtítulo *"Define cuándo recibes citas. Aparecerá en tu página pública."*.
- Container max-w-2xl con card `glass-card-strong`.
- **Editor:** grid de 7 filas (una por día) con cols `[120px_1fr_1fr_auto]`:
  - Label día de semana (bold).
  - Input time **Abre** (HH:MM).
  - Input time **Cierra** (HH:MM).
  - **Switch** + label "Abierto/Cerrado".
- Inputs de hora se deshabilitan si `is_closed=true`.
- Default precargado: 09:00–18:00 todos los días, domingo cerrado.
- Border-top separador antes del botón **"Guardar cambios"** (primary lg, alineado derecha, loading *"Guardando…"*).
- Éxito: toast *"Horarios actualizados ⏰"*.

---

### 10.4 Equipo `/dashboard/ajustes/equipo`
**Archivos:** `equipo/page.tsx` + `team-manager.tsx`

- Header: H1 *"Equipo"* + subtítulo *"Tus técnicas y recepcionistas. Pueden tener cuentas propias o solo aparecer en agenda."*.

**Card 1 — Técnicas (glass-card-strong):**
- Header con 2 botones: **"Invitar por email"** (`Mail`, glass sm) y **"Agregar técnica"** (`Plus`, primary sm).

**AddStaffForm (AnimatePresence expand):**
- **Nombre** (required).
- **Rol** (opcional).
- **Color de identificación** — 6 botones circulares preset con colores `#957DAD` `#F4A1B6` `#E0BBE4` `#FEC8D8` `#5BC0A8` `#F2B05E`. Seleccionado: ring + scale-105.
- **Instagram** (opcional, con `@`).
- Botones **"Cancelar"** + **"Agregar"**.

**InviteForm (AnimatePresence expand):**
- **Email** (required).
- **Rol** — 2 cards clickeables como radio:
  - **"Técnica"** — *"Solo sus citas"*.
  - **"Recepcionista"** — *"Agenda + caja"*.
  - Seleccionado: `border-brand-lavender bg-brand-lila/10`.
- Botones **"Cancelar"** + **"Enviar invitación"** → toast *"Invitación enviada a {email}"*.

**Lista de técnicas:**
- Cada item `flex bg-white/60 p-3 rounded-2xl`:
  - Avatar circular `size-12` con inicial sobre color custom.
  - Nombre (medium) + rol (xs muted) + Instagram (xs `@`).
  - Badge **"Activa"** (success) o **"Pausada"** (soft).
  - Botón delete (`Trash2` rojo) — con confirm dialog.
- Vacío: *"Aún no tienes técnicas. Agrega la primera para empezar a asignar citas."*.

**Card 2 — Invitaciones pendientes** (solo si hay):
- H2 *"Invitaciones pendientes"*.
- Cada invitación: email (medium) + rol + *"Vence [fecha]"* + Badge **"Pendiente"** (warning).

---

## Apéndice — Sistema visual

### Paleta de marca
| Token | Hex/Uso |
|---|---|
| Lila base | `#E0BBE4` |
| Lila oscuro / lavender | `#957DAD` (`brand-lavender`) |
| Peach | `#FEC8D8` / `#F4A1B6` |
| Cream | `#FFDFD3` |
| Texto oscuro | `#1F1A2E` |
| Gradient hero | `lila → peach` (135deg) |

### Tipografía
- **Body / UI:** Inter (`font-sans`).
- **Display / títulos:** Fraunces (`font-display`).

### Componentes recurrentes
- **Cards:** `glass-card` y `glass-card-strong` (glassmorphism + `backdrop-blur` + `border-2 bg-white/80`).
- **Botones:** primary con `bg-grad-button` + clase `btn-shine`, secundario `variant=glass`, terciario `outline`/`ghost`.
- **Badges:** soft / info (azul) / success (verde) / warning (ámbar) / destructive (rojo).
- **Inputs:** `rounded-2xl border-2 bg-white/80 backdrop-blur` con `focus:ring-2`.
- **Animaciones:** `PageTransition`, `Stagger`+`StaggerItem`, `HoverCard` (subtle), `TiltCard`, `AmbientBlobs` (fondo de auth/onboarding), Framer Motion `AnimatePresence`.
- **Iconografía:** Lucide (Sparkles, Calendar, CreditCard, Users, Clock, MapPin, MessageCircle, Phone, Mail, Trash2, Plus, Check, ChevronLeft/Right, Lock, ExternalLink, Cake, Bell, TrendingUp, Wallet, Banknote, Smartphone, Send, AlertTriangle, CheckCircle2, etc.).

### Breakpoints
- **base** (mobile): stacked, single column.
- **sm** (640): grids de 2.
- **md** (768): nav desktop visible, 2-3 columnas.
- **lg** (1024): 3-4 columnas en grids, contenedores con su max-width final.
