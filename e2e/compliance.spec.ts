import { test, expect } from "@playwright/test";

test.describe("Páginas de compliance y soporte", () => {
  test("/privacy renderiza política y secciones", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Política de privacidad/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Datos que recolectamos/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tus derechos/i })).toBeVisible();
    await expect(page.getByText(/Ley 29733/i).first()).toBeVisible();
  });

  test("/terms renderiza términos", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Términos y condiciones/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Aceptación/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pago y prueba/i })).toBeVisible();
  });

  test("/help renderiza FAQs", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { name: /Centro de ayuda/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Cómo recibo reservas/i)).toBeVisible();
    await expect(page.getByText(/Yape o Plin/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /WhatsApp/i }).first()).toBeVisible();
  });

  test("404 muestra not-found amigable", async ({ page }) => {
    const response = await page.goto("/ruta-que-no-existe-jamas");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.getByRole("link", { name: /Volver al inicio/i })).toBeVisible();
  });
});
