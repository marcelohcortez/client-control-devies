import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Client Detail", () => {
  test.beforeEach(async ({ page }) => {
    // Create a test client via the UI so we have something to view
    await login(page);
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill("Detail Test Co");
    await page.getByLabel("Contact name").fill("John Detail");
    await page.getByLabel("Role").fill("Manager");
    await page.getByRole("button", { name: /add client/i }).click();
    await page.waitForURL(/\/clients\/\d+/);
  });

  test("displays all client fields", async ({ page }) => {
    await expect(page.getByText("Detail Test Co")).toBeVisible();
    await expect(page.getByText("John Detail")).toBeVisible();
    await expect(page.getByText("Manager")).toBeVisible();
  });

  test("shows Edit and Delete buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
  });
});
