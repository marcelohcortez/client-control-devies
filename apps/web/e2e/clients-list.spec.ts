import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Clients List", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("displays clients list page with table headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Company" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Contact" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Phone" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
  });

  test("has Add Client button", async ({ page }) => {
    await expect(page.getByRole("link", { name: /add client/i })).toBeVisible();
  });

  test("has filter bar inputs", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
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
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Company name").fill("xyzzy_nonexistent_12345");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter by contact name reduces results", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Contact name").fill("xyzzy_nonexistent_12345");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter by email reduces results", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Email").fill("xyzzy_nonexistent@nowhere.invalid");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter by phone reduces results", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Phone").fill("000-xyzzy-nonexistent");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter by type of business reduces results", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Type of business").fill("xyzzy_nonexistent_industry");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter by added by reduces results", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await page.getByPlaceholder("Added by").fill("xyzzy_nonexistent_user");
    await expect(page.getByText("No clients found.")).toBeVisible({ timeout: 2000 });
  });

  test("filter bar can be collapsed after expanding", async ({ page }) => {
    await page.getByRole("button", { name: /expand filters/i }).click();
    await expect(page.getByPlaceholder("Company name")).toBeVisible();
    await page.getByRole("button", { name: /collapse filters/i }).click();
    await expect(page.getByPlaceholder("Company name")).not.toBeVisible();
  });

  test("page size selector changes number of results per page", async ({ page }) => {
    // Default limit is 10, with many imported clients there should be exactly 10 rows
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await page.getByLabel(/per page/i).selectOption("5");
    await expect(page.locator("tbody tr")).toHaveCount(5);
  });

  test("pagination controls are visible and next page works", async ({ page }) => {
    await expect(page.getByLabel("Pagination")).toBeVisible();
    await expect(page.getByText(/page 1 of/i)).toBeVisible();
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText(/page 2 of/i)).toBeVisible();
  });

  test("clicking Company header sorts by company name", async ({ page }) => {
    const companyHeader = page.getByRole("columnheader", { name: /company/i });
    await expect(companyHeader).toBeVisible();
    // Default: no sort indicator (⇅)
    await expect(companyHeader).toContainText("⇅");
    await companyHeader.click();
    // After first click: ascending (▲)
    await expect(companyHeader).toContainText("▲");
    await companyHeader.click();
    // After second click: descending (▼)
    await expect(companyHeader).toContainText("▼");
  });

  test("clicking Contact header sorts by contact name", async ({ page }) => {
    const contactHeader = page.getByRole("columnheader", { name: /^contact$/i });
    await expect(contactHeader).toBeVisible();
    await contactHeader.click();
    await expect(contactHeader).toContainText("▲");
  });
});
