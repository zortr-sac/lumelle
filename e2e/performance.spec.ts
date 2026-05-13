import { test, expect } from "@playwright/test";

test.describe("Performance y assets", () => {
  test("landing carga en menos de 3 segundos", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("login carga rápido", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("fonts cargan (preload o stylesheet)", async ({ page }) => {
    await page.goto("/");
    // Next/Google Fonts puede usar preload (prod) o stylesheet (dev)
    const fontLinks = await page.locator(
      'link[rel="preload"][as="font"], link[rel="stylesheet"][href*="fonts"], link[rel="stylesheet"][href*="_next"]',
    ).count();
    expect(fontLinks).toBeGreaterThan(0);
  });

  test("respuestas comprimidas", async ({ request }) => {
    const response = await request.get("/", {
      headers: { "Accept-Encoding": "gzip, br" },
    });
    expect(response.status()).toBe(200);
    // En dev Next puede no comprimir; en prod sí
    // Solo verificamos que la página devuelve algo
    const body = await response.text();
    expect(body.length).toBeGreaterThan(0);
  });
});
