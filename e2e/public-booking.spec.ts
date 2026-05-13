import { test, expect } from "@playwright/test";

test.describe("Reservas públicas /b/[slug]", () => {
  test("slug inexistente devuelve 404", async ({ page }) => {
    const response = await page.goto("/b/negocio-que-no-existe");
    // notFound() inside a layout triggers Next's not-found which returns 404
    expect(response?.status()).toBe(404);
  });

  test("/api/slots requiere parámetros válidos", async ({ request }) => {
    const response = await request.get("/api/slots");
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("/api/slots con slug inválido devuelve 404", async ({ request }) => {
    const response = await request.get(
      "/api/slots?slug=no-existe-xyz&serviceId=00000000-0000-0000-0000-000000000000&date=2026-06-01",
    );
    expect(response.status()).toBe(404);
  });

  test("/api/bookings rechaza body vacío", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/inválidos/i);
  });

  test("/api/bookings rechaza con teléfono inválido", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {
        slug: "demo",
        serviceId: "00000000-0000-0000-0000-000000000000",
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        customer: { name: "Test", phone: "123" },
        acceptedPolicies: true,
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
  });

  test("/api/bookings rate-limited en exceso", async ({ request }) => {
    // 6 intentos rápidos: el 6º debería ser 429 (limit es 5/min)
    const responses = await Promise.all(
      Array.from({ length: 6 }).map(() =>
        request.post("/api/bookings", {
          data: {},
          headers: { "Content-Type": "application/json", "X-Forwarded-For": "1.2.3.4" },
        }),
      ),
    );
    const rateLimited = responses.filter((r) => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThanOrEqual(1);
    const limitResp = rateLimited[0]!;
    expect(limitResp.headers()["retry-after"]).toBeTruthy();
  });
});
