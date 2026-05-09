import { expect, test, type Page } from "@playwright/test";
import {
  HOST_EMAIL,
  delayProfileActionRequests,
  delayServerActionRequests,
  signIn,
} from "./helpers";
import { isValidLocale, localeLabels, type Locale } from "../src/i18n/config";

async function submitProfileLocaleForm(page: Page, locale: Locale) {
  await page.getByTestId("profile-account-language-input").selectOption(locale);

  const languageSubmit = page.getByTestId("profile-account-language-submit");
  const languageClick = languageSubmit.click();
  await expect(languageSubmit).toBeDisabled();
  await expect(languageSubmit).toHaveAttribute("aria-busy", "true");
  await languageClick;
  await expect(page.getByTestId("profile-account-language-value")).toHaveText(
    localeLabels[locale]
  );
}

async function saveProfileLocale(page: Page, locale: Locale) {
  const languageInput = page.getByTestId("profile-account-language-input");

  if (await languageInput.isVisible().catch(() => false)) {
    await submitProfileLocaleForm(page, locale);
    return;
  }

  await page.getByTestId("profile-account-language-edit").click();
  await submitProfileLocaleForm(page, locale);
}

test("public footer locale switch refreshes the page locale", async ({
  page,
}) => {
  await delayServerActionRequests(page);
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const localeSelect = page.getByTestId("locale-picker-select");
  await expect(localeSelect).toBeVisible();
  await localeSelect.selectOption("de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de", {
    timeout: 15_000,
  });
  await expect(localeSelect).toHaveValue("de");
});

test("public footer locale picker ignores stale auth cookies", async ({
  baseURL,
  page,
}) => {
  if (typeof baseURL !== "string") {
    throw new Error("Expected Playwright baseURL to be configured");
  }

  await page.context().addCookies([
    {
      name: "sb-stale-auth-token",
      value: "stale",
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");

  await expect(page.getByTestId("locale-picker-select")).toBeVisible();
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

  await submitProfileLocaleForm(page, updatedLanguage);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", updatedLanguage, {
    timeout: 15_000,
  });

  await saveProfileLocale(page, originalLocale);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", originalLocale, {
    timeout: 15_000,
  });
});

test("signed-in preference overrides guest footer locale cookie", async ({
  page,
}) => {
  let originalLocale: Locale | null = null;

  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
  await delayProfileActionRequests(page);

  try {
    await page.getByTestId("profile-account-language-edit").click();
    const languageInput = page.getByTestId("profile-account-language-input");
    const originalLanguage = await languageInput.inputValue();

    if (!isValidLocale(originalLanguage)) {
      throw new Error(`Unexpected profile language value: ${originalLanguage}`);
    }

    originalLocale = originalLanguage;
    await submitProfileLocaleForm(page, "en");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en", {
      timeout: 15_000,
    });

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.getByRole("button", { name: /sign out/i }).click(),
    ]);

    const localeSelect = page.getByTestId("locale-picker-select");
    await expect(localeSelect).toBeVisible();
    await localeSelect.selectOption("de");
    await expect(page.locator("html")).toHaveAttribute("lang", "de", {
      timeout: 15_000,
    });

    await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });

    await expect(page.locator("html")).toHaveAttribute("lang", "en", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("profile-account-language-value")).toHaveText(
      localeLabels.en
    );
  } finally {
    if (originalLocale && originalLocale !== "en") {
      await page.goto("/profile");

      if (new URL(page.url()).pathname === "/sign-in") {
        await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
      }

      await saveProfileLocale(page, originalLocale);
    }
  }
});
