import { test, expect } from "@playwright/test";

test.describe("Service Orders", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "admin@abysapp.com");
    await page.fill('[name="password"]', "admin123");
    await page.click('[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("orders list page loads", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByRole("heading", { name: "Service Orders" })).toBeVisible();
    await expect(page.getByRole("button", { name: "+ New Order" })).toBeVisible();
  });

  test("new order button opens modal", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByRole("button", { name: "+ New Order" }).click();
    await expect(page.getByText("New Service Order")).toBeVisible();
  });
});
