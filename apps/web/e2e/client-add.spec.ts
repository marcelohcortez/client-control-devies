import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers";

const UNIQUE_NAME = `E2E_Test_Company_${Date.now()}`;

test.describe("Add Client", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("Add Client button navigates to /clients/new", async ({ page }) => {
    await page.getByRole("link", { name: /add client/i }).click();
    await expect(page).toHaveURL("/clients/new");
  });

  test("fails to submit if company name is empty", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByRole("button", { name: /add client/i }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL("/clients/new");
  });

  test("creates a client with company name only and redirects", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill(UNIQUE_NAME);
    await page.getByRole("button", { name: /add client/i }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/);
    await expect(page.getByText(UNIQUE_NAME)).toBeVisible();
  });

  test("creates a client with all fields filled", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill(`${UNIQUE_NAME}_full`);
    await page.getByLabel("Contact name").fill("Jane Doe");
    await page.getByLabel("Role").fill("CEO");
    await page.getByLabel("Phone").fill("+1 555 0100");
    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Type of business").fill("SaaS");
    await page.getByLabel("Status / Notes").fill("Hot lead");
    await page.getByRole("button", { name: /add client/i }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/);
  });

  test("added_by is automatically set to the logged-in username", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill(`${UNIQUE_NAME}_addedby`);
    await page.getByRole("button", { name: /add client/i }).click();
    await page.waitForURL(/\/clients\/\d+/);
    const addedByValue = page.locator("xpath=//dt[normalize-space()='Added by']/following-sibling::dd[1]");
    await expect(addedByValue).toHaveText(TEST_USER.username);
  });

  test("additional contacts can be added and appear on detail page", async ({ page }) => {
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill(`${UNIQUE_NAME}_contacts`);
    await page.getByRole("button", { name: /add contact/i }).click();
    await page.getByLabel("Name", { exact: true }).fill("Secondary Contact");
    await page.getByRole("button", { name: /add client/i }).click();
    await page.waitForURL(/\/clients\/\d+/);
    await expect(page.getByRole("heading", { name: /additional contacts/i })).toBeVisible();
    await expect(page.getByText("Secondary Contact")).toBeVisible();
  });
});
