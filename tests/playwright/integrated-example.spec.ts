import { expect, test } from "@playwright/test";

test("integrated example renders the workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Support intégré" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Slides" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Presentation" })).toBeVisible();
});
