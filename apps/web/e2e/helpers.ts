import type { Page } from "@playwright/test";

export const TEST_USER = {
  username: "admin",
  password: "adminadmin",
};

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(TEST_USER.username);
  await page.getByLabel("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("/clients");
}
