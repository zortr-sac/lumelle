import { test, expect } from "@playwright/test";

// Full-flow E2E: login → dashboard → servicios → clientas → agenda → caja → public page.
// Uses an existing seeded user (created in 18_owner_can_read_own_business + signup test).
//
// NOTE: This test depends on real Supabase. Email confirmation must be OFF in the
// Supabase Dashboard, and the test user must exist:
//   email: salon.test@lumelle.local
//   password: TestPassword123
//   business slug: studio-bella-test

const USER = {
  email: "salon.test@lumelle.local",
  password: "TestPassword123",
};

test.describe.configure({ mode: "serial" });

test.describe("Flujo completo Lumelle", () => {
  test("login redirige a dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(USER.email);
    await page.getByLabel("Contraseña").fill(USER.password);
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 20_000 }),
      page.getByRole("button", { name: /Ingresar/i }).click(),
    ]);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard carga con saludo y stats", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard");
    await expect(page.getByText(/Hola Mauri/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Studio Bella Test/i)).toBeVisible();
    await expect(page.getByText(/Citas hoy/i)).toBeVisible();
    await expect(page.getByText(/Ventas hoy/i)).toBeVisible();
  });

  test("sidebar navega entre secciones", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /^Servicios$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/servicios/);
    await page.getByRole("link", { name: /^Clientas$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/clientas/);
    await page.getByRole("link", { name: /^Agenda$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/agenda/);
    await page.getByRole("link", { name: /^Caja$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/caja/);
  });

  test("agregar servicio desde plantillas", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/servicios/plantillas");
    await expect(
      page.getByRole("heading", { name: /Plantillas de servicios/i }),
    ).toBeVisible();
    // Encontrar primer "Agregar" disponible y click
    const firstAdd = page.getByRole("button", { name: /^Agregar$/i }).first();
    await firstAdd.click();
    // Esperar feedback (badge "Agregado" o toast)
    await expect(page.getByText(/Agregado|agregado/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("lista de servicios muestra el creado", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/servicios");
    await expect(
      page.getByRole("heading", { name: /^Servicios$/i, level: 1 }),
    ).toBeVisible();
    // Por lo menos una card de servicio
    await expect(
      page.locator("article, [class*='glass-card']").first(),
    ).toBeVisible();
  });

  test("lista de clientas muestra María (seedeada)", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/clientas");
    await expect(
      page.getByRole("heading", { name: /^Clientas$/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/Maria Test Cliente/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("crear nueva clienta", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/clientas/nueva");
    await page.getByLabel(/Nombre completo/i).fill("Ana Pérez E2E");
    await page.getByLabel(/Teléfono/i).fill("+51 911 222 333");
    await page.getByRole("button", { name: /Guardar/i }).click();
    await page.waitForURL(/\/dashboard\/clientas/, { timeout: 15_000 });
    await expect(page.getByText(/Ana Pérez E2E/i)).toBeVisible();
  });

  test("agenda muestra empty state cuando no hay citas", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/agenda");
    await expect(
      page.getByRole("heading", { name: /^Agenda$/i, level: 1 }),
    ).toBeVisible();
    // O hay citas o aparece el empty "Tu agenda está libre"
    const hasEmpty = await page
      .getByText(/Tu agenda está libre/i)
      .isVisible()
      .catch(() => false);
    const hasAppointments = await page.locator("li").count();
    expect(hasEmpty || hasAppointments > 0).toBeTruthy();
  });

  test("caja muestra resumen del día", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/caja");
    await expect(
      page.getByRole("heading", { name: /^Caja$/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/Ventas hoy/i)).toBeVisible();
    await expect(page.getByText(/Gastos/i).first()).toBeVisible();
  });

  test("página pública /b/studio-bella-test es accesible", async ({ page }) => {
    await page.goto("/b/studio-bella-test");
    await expect(page.getByText(/Studio Bella Test/i)).toBeVisible({
      timeout: 15_000,
    });
    // CTA Reservar visible
    await expect(
      page.getByRole("link", { name: /Reservar/i }).first(),
    ).toBeVisible();
  });

  test("ajustes del negocio carga", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/ajustes/negocio");
    await expect(
      page.getByRole("heading", { name: /Mi negocio/i, level: 1 }),
    ).toBeVisible();
    // Slug visible y bloqueado
    const slug = page.getByLabel(/URL pública/i);
    await expect(slug).toBeDisabled();
    await expect(slug).toHaveValue("studio-bella-test");
  });

  test("ajustes de horarios carga 7 días", async ({ page }) => {
    await loginIfNeeded(page);
    await page.goto("/dashboard/ajustes/horarios");
    await expect(
      page.getByRole("heading", { name: /Horarios/i, level: 1 }),
    ).toBeVisible();
    // 7 inputs time x 2 (apertura y cierre)
    const timeInputs = page.locator('input[type="time"]');
    await expect(timeInputs).toHaveCount(14);
  });
});

/**
 * Login helper that's tolerant to "already logged in" state.
 */
async function loginIfNeeded(page: import("@playwright/test").Page) {
  await page.goto("/dashboard");
  if (/\/login/.test(page.url())) {
    await page.getByLabel("Email").fill(USER.email);
    await page.getByLabel("Contraseña").fill(USER.password);
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 20_000 }),
      page.getByRole("button", { name: /Ingresar/i }).click(),
    ]);
  }
}
