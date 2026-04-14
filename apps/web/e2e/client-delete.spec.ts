import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Delete Client", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/clients/new");
    await page.getByLabel("Company name").fill("Delete Test Co");
    await page.getByRole("button", { name: /add client/i }).click();
    await page.waitForURL(/\/clients\/\d+/);
  });

  test("Delete button opens confirmation modal", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("confirm button is disabled until 'delete' is typed", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).click();
    const confirmBtn = page.getByRole("button", { name: /delete client/i });
    await expect(confirmBtn).toBeDisabled();

    await page.getByPlaceholder(/type "delete"/i).fill("something else");
    await expect(confirmBtn).toBeDisabled();
  });

  test("confirm button enables when 'delete' is typed", async ({ page }) => {
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByPlaceholder(/type "delete"/i).fill("delete");
    const confirmBtn = page.getByRole("button", { name: /delete client/i });
    await expect(confirmBtn).toBeEnabled();
  });

  test("Cancel closes the modal without deleting", async ({ page }) => {
    const url = page.url();
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL(url);
  });

  test("confirming deletion removes client and redirects to /clients", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByPlaceholder(/type "delete"/i).fill("delete");
    await page.getByRole("button", { name: /delete client/i }).click();
    await expect(page).toHaveURL("/clients");
  });
});
