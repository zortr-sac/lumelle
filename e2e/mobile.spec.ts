import { test, expect, devices } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

test.describe("Mobile UX", () => {
  test("landing es responsive en iPhone", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    // No scrollbar horizontal
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflow).toBeFalsy();
  });

  test("login es usable en mobile", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    const pwdInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole("button", { name: /Ingresar/i });

    // Form completo es visible y se puede rellenar sin scroll horizontal
    await expect(emailInput).toBeVisible();
    await expect(pwdInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    await emailInput.fill("test@example.com");
    await pwdInput.fill("password123");
    await expect(emailInput).toHaveValue("test@example.com");

    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflow).toBeFalsy();
  });

  test("forms tienen autocomplete correcto", async ({ page }) => {
    await page.goto("/login");
    const email = page.locator('input[type="email"]');
    await expect(email).toHaveAttribute("autocomplete", "email");
    const pwd = page.locator('input[type="password"]');
    await expect(pwd).toHaveAttribute("autocomplete", "current-password");
  });
});
