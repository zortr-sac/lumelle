import { expect, test } from "@playwright/test";

test.describe("Landing comercial /", () => {
  test("renderiza propuesta de valor y CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText(/Luminosidad/i);
    await expect(
      page.getByRole("link", { name: /Crear cuenta/i }).first(),
    ).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toHaveCount(1);
  });

  test("muestra 3 planes con precios", async ({ page }) => {
    await page.goto("/#precios");
    await expect(page.getByRole("heading", { name: /^Solo$/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Atelier$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Maison$/i }),
    ).toBeVisible();

    await expect(page.getByText(/S\/39/)).toBeVisible();
    await expect(page.getByText(/S\/89/)).toBeVisible();
    await expect(page.getByText(/S\/199/)).toBeVisible();
  });

  test("navegacion a signup funciona", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('a[href="/signup"]').first();
    await expect(link).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/signup$/, { timeout: 15_000 }),
      link.click(),
    ]);
    await expect(page.getByText("Crea tu cuenta").first()).toBeVisible();
  });

  test("scroll a features muestra todas las funciones", async ({ page }) => {
    await page.goto("/#features");
    await expect(
      page.getByRole("heading", { name: /Agenda del d(i|í)a/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Reservas por link/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Caja clara/i }),
    ).toBeVisible();
  });

  test("footer tiene links a compliance", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: /Privacidad/i }),
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /T(e|é)rminos/i }),
    ).toBeVisible();
    await expect(footer.getByRole("link", { name: /Ayuda/i })).toBeVisible();
  });

  test("security headers presentes en respuesta", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});
