import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers";

test.describe("Edit Client", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill("Edit Test Co");
    await page.getByRole("button", { name: /add client/i }).click();
    await page.waitForURL(/\/clients\/\d+/);
  });

  test("Edit button navigates to edit page", async ({ page }) => {
    const url = page.url();
    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page).toHaveURL(`${url}/edit`);
  });

  test("edit form is pre-populated with current values", async ({ page }) => {
    await page.getByRole("button", { name: /edit/i }).click();
    await expect(page.getByLabel("Company name")).toHaveValue("Edit Test Co");
  });

  test("successfully saves edited fields and redirects", async ({ page }) => {
    const url = page.url();
    const id = url.split("/").pop() ?? "";
    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByLabel("Contact name").fill("Updated Contact");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page).toHaveURL(`/clients/${id}`);
    await expect(page.getByText("Updated Contact")).toBeVisible();
  });

  test("last_edited_by is set to the logged-in username after saving", async ({ page }) => {
    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByLabel("Contact name").fill("Edited For Tracking");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/);
    const lastEditedValue = page.locator("xpath=//dt[normalize-space()='Last edited by']/following-sibling::dd[1]");
    await expect(lastEditedValue).toHaveText(TEST_USER.username);
  });

  test("additional contact added via edit form appears on detail page", async ({ page }) => {
    await page.getByRole("button", { name: /edit/i }).click();
    await page.getByRole("button", { name: /add contact/i }).click();
    await page.getByLabel("Name", { exact: true }).fill("Contact Via Edit");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page).toHaveURL(/\/clients\/\d+/);
    await expect(page.getByRole("heading", { name: /additional contacts/i })).toBeVisible();
    await expect(page.getByText("Contact Via Edit")).toBeVisible();
  });
});
