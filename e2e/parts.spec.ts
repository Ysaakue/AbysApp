import { test, expect } from "@playwright/test";

test.describe("Parts stock pagination", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "admin@abysapp.com");
    await page.fill('[name="password"]', "admin123");
    await page.click('[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("shows pagination controls on stock page", async ({ page }) => {
    await page.goto("/dashboard/parts");
    const stockLinks = page.getByRole("button", { name: "Stock" });
    const count = await stockLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }
    await stockLinks.first().click();
    await expect(page.getByText("Rows per page:")).toBeVisible();
    const pageSizeSelect = page.locator("select").filter({ hasText: "5" });
    await expect(pageSizeSelect).toBeVisible();
  });

  test("page size selector has expected options", async ({ page }) => {
    await page.goto("/dashboard/parts");
    const stockLinks = page.getByRole("button", { name: "Stock" });
    if (await stockLinks.count() === 0) { test.skip(); return; }
    await stockLinks.first().click();
    const select = page.locator("select").first();
    const options = await select.locator("option").allTextContents();
    expect(options).toContain("5");
    expect(options).toContain("10");
    expect(options).toContain("30");
    expect(options).toContain("50");
  });
});
