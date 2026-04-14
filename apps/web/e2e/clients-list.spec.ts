import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Clients List", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("displays clients list page with table headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Company" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Contact" })).toBeVisible();
  });

  test("has Add Client button", async ({ page }) => {
    await expect(page.getByRole("link", { name: /add client/i })).toBeVisible();
  });

  test("has filter bar inputs", async ({ page }) => {
    await expect(page.getByPlaceholder("Company name")).toBeVisible();
    await expect(page.getByPlaceholder("Contact name")).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Phone")).toBeVisible();
    await expect(page.getByPlaceholder("Type of business")).toBeVisible();
    await expect(page.getByPlaceholder("Added by")).toBeVisible();
  });

  test("clicking a client row navigates to detail page", async ({ page }) => {
    const firstRow = page.getByRole("link").or(page.locator("tr[role='link']")).first();
    // If there is at least one client row, click it
    const count = await page.locator("tbody tr").count();
    if (count > 0) {
      await page.locator("tbody tr").first().click();
      await expect(page).toHaveURL(/\/clients\/\d+/);
    }
  });

  test("filter by company name reduces results", async ({ page }) => {
    // Type a search term that likely matches nothing
    await page.getByPlaceholder("Company name").fill("xyzzy_nonexistent_12345");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });
});
