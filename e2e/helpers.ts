import { expect, type Page } from "@playwright/test";

export const HOST_EMAIL = "demo-host@peels.local";
export const DONOR_EMAIL = "demo-donor@peels.local";
export const SEEDED_PASSWORD = "peels-demo-password";
export const SEEDED_THREAD_ID = "33333333-3333-4333-8333-333333333333";
export const PROFILE_RENDER_TIMEOUT_MS = 15_000;

export async function signIn(
  page: Page,
  {
    email,
    redirectTo = "/profile",
    expectedPath = redirectTo,
  }: {
    email: string;
    redirectTo?: string;
    expectedPath?: string;
  }
) {
  await page.goto(`/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`);

  await expect(page.getByTestId("sign-in-form")).toBeVisible();

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(SEEDED_PASSWORD);

  const expectedUrl = new URL(expectedPath, "http://127.0.0.1:3000");

  await Promise.all([
    page.waitForURL(
      (url) =>
        url.pathname === expectedUrl.pathname &&
        url.search === expectedUrl.search
    ),
    page.getByTestId("sign-in-submit").click(),
  ]);
}

export async function delayProfileActionRequests(page: Page, delayMs = 500) {
  await page.route(/\/profile(?:\/|\?|$)/, async (route) => {
    if (route.request().method() === "POST") {
      await page.waitForTimeout(delayMs);
    }

    await route.continue();
  });
}
