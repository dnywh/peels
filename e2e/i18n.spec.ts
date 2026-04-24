import { expect, test } from "@playwright/test";
import {
  HOST_EMAIL,
  delayProfileActionRequests,
  delayServerActionRequests,
  signIn,
} from "./helpers";
import { isValidLocale, localeLabels, type Locale } from "../src/i18n/config";

test("public footer locale switch refreshes the page locale", async ({
  page,
}) => {
  await delayServerActionRequests(page);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const localeSelect = page.getByTestId("locale-picker-select");
  const localeChange = localeSelect.selectOption("de");
  await expect(localeSelect).toBeDisabled();
  await expect(localeSelect).toHaveAttribute("aria-busy", "true");
  await localeChange;
  await expect(page.locator("html")).toHaveAttribute("lang", "de", {
    timeout: 15_000,
  });
  await expect(localeSelect).toHaveValue("de");
});

test("profile locale change persists after refresh", async ({ page }) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
  await delayProfileActionRequests(page);

  await page.getByTestId("profile-account-language-edit").click();
  const languageInput = page.getByTestId("profile-account-language-input");
  const originalLanguage = await languageInput.inputValue();

  if (!isValidLocale(originalLanguage)) {
    throw new Error(`Unexpected profile language value: ${originalLanguage}`);
  }

  const originalLocale: Locale = originalLanguage;
  const updatedLanguage: Locale = originalLocale === "de" ? "en" : "de";

  await languageInput.selectOption(updatedLanguage);

  const languageSubmit = page.getByTestId("profile-account-language-submit");
  const languageClick = languageSubmit.click();
  await expect(languageSubmit).toBeDisabled();
  await expect(languageSubmit).toHaveAttribute("aria-busy", "true");
  await languageClick;
  await expect(page.getByTestId("profile-account-language-value")).toHaveText(
    localeLabels[updatedLanguage]
  );

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", updatedLanguage, {
    timeout: 15_000,
  });

  await page.getByTestId("profile-account-language-edit").click();
  await page
    .getByTestId("profile-account-language-input")
    .selectOption(originalLocale);
  await page.getByTestId("profile-account-language-submit").click();
  await expect(page.getByTestId("profile-account-language-value")).toHaveText(
    localeLabels[originalLocale]
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", originalLocale, {
    timeout: 15_000,
  });
});
