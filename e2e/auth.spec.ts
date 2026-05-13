import { test, expect } from "@playwright/test";

test.describe("Páginas de autenticación", () => {
  test("/login renderiza form completo", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Volvé a tu salón")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: /Ingresar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Crear una/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Olvidaste/i })).toBeVisible();
  });

  test("/login valida email inválido", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("no-es-email");
    await page.getByLabel("Contraseña").fill("xyz");
    await page.getByRole("button", { name: /Ingresar/i }).click();
    await expect(page.getByText(/Invalid email|email/i).first()).toBeVisible();
  });

  test("/signup renderiza form completo", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Crea tu cuenta").first()).toBeVisible();
    await expect(page.getByLabel(/Tu nombre completo/i)).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: /Crear mi cuenta/i })).toBeVisible();
  });

  test("/signup valida contraseña débil", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel(/Tu nombre completo/i).fill("Maria Pruebas");
    await page.getByLabel("Email").fill("maria@example.com");
    await page.getByLabel("Contraseña").fill("abc");
    await page.getByRole("button", { name: /Crear mi cuenta/i }).click();
    await expect(page.getByText(/Mínimo 8 caracteres|mayúscula|número/i).first()).toBeVisible();
  });

  test("/forgot renderiza form de recuperación", async ({ page }) => {
    await page.goto("/forgot");
    await expect(page.getByText("Recuperar contraseña").first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /Enviar link/i })).toBeVisible();
  });

  test("rutas protegidas redirigen a login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("redirect=%2Fdashboard");
  });

  test("/dashboard/agenda sin auth redirige", async ({ page }) => {
    await page.goto("/dashboard/agenda");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/onboarding sin auth redirige", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login/);
  });
});
