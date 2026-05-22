import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "AbysApp" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "wrong@test.com");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('[type="submit"]');
    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 5000 });
  });

  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
