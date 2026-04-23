import { expect, test } from "@playwright/test";
import { HOST_EMAIL, delayProfileActionRequests, signIn } from "./helpers";

test("public footer locale switch refreshes the page locale", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByTestId("locale-picker-select").selectOption("de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de", {
    timeout: 15_000,
  });
  await expect(page.getByTestId("locale-picker-select")).toHaveValue("de");
});

test("profile locale change persists after refresh", async ({ page }) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
  await delayProfileActionRequests(page);
  await page.waitForTimeout(3_000);

  await page.getByTestId("profile-account-language-edit").click();
  const languageInput = page.getByTestId("profile-account-language-input");
  const originalLanguage = await languageInput.inputValue();
  const updatedLanguage = originalLanguage === "de" ? "en" : "de";

  await languageInput.selectOption(updatedLanguage);

  const languageSubmit = page.getByTestId("profile-account-language-submit");
  const languageClick = languageSubmit.click();
  await expect(languageSubmit).toBeDisabled();
  await expect(languageSubmit).toHaveAttribute("aria-busy", "true");
  await languageClick;
  await page.waitForTimeout(2_000);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", updatedLanguage, {
    timeout: 15_000,
  });

  await page.getByTestId("profile-account-language-edit").click();
  await page
    .getByTestId("profile-account-language-input")
    .selectOption(originalLanguage);
  await page.getByTestId("profile-account-language-submit").click();
  await page.waitForTimeout(2_000);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", originalLanguage, {
    timeout: 15_000,
  });
});
