import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers";

test.describe("Auth", () => {
  test("shows login page at /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Client Control" })).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("redirects unauthenticated users from /clients to /login", async ({ page }) => {
    await page.goto("/clients");
    await expect(page).toHaveURL("/login");
  });

  test("redirects unauthenticated users from /clients/new to /login", async ({ page }) => {
    await page.goto("/clients/new");
    await expect(page).toHaveURL("/login");
  });

  test("fails login with wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("wrong");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("successfully logs in and redirects to /clients", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/clients");
    await expect(page.getByText(TEST_USER.username)).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL("/login");
  });
});
