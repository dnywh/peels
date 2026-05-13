import { expect, type Page } from "@playwright/test";

export const HOST_EMAIL = "demo-host@peels.local";
export const DONOR_EMAIL = "demo-donor@peels.local";
export const SEEDED_PASSWORD = "peels-demo-password";
export const SEEDED_THREAD_ID = "33333333-3333-4333-8333-333333333333";
export const SECOND_SEEDED_THREAD_ID = "77777777-7777-4777-8777-777777777777";
export const HOST_SECOND_SEEDED_THREAD_ID =
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const PROFILE_RENDER_TIMEOUT_MS = 15_000;

type MockGeocodingFeatureOptions = {
  id?: string;
  text?: string;
  placeName?: string;
  center?: [number, number];
  countryCode?: string;
};

export function createMockGeocodingFeature({
  id = "place.123",
  text = "Newtown",
  placeName = "Newtown, New South Wales, Australia",
  center = [151.1781, -33.8985],
  countryCode = "AU",
}: MockGeocodingFeatureOptions = {}) {
  return {
    id,
    type: "Feature",
    text,
    place_name: placeName,
    place_type: ["place"],
    place_type_name: ["Place"],
    center,
    bbox: [center[0], center[1], center[0], center[1]],
    geometry: {
      type: "Point",
      coordinates: center,
    },
    properties: {
      ref: id,
      country_code: countryCode,
    },
    relevance: 1,
  };
}

export async function mockMapTilerGeocoding(
  page: Page,
  feature = createMockGeocodingFeature()
) {
  await page.route("**/geocoding/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        type: "FeatureCollection",
        query: [],
        features: [feature],
        attribution: "Mock MapTiler geocoding",
      }),
    });
  });
}

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

  const expectedUrl = new URL(expectedPath, page.url());

  await Promise.all([
    page.waitForURL(
      (url) =>
        url.pathname === expectedUrl.pathname &&
        url.search === expectedUrl.search
    ),
    page.getByTestId("sign-in-submit").click(),
  ]);
}

export async function delayServerActionRequests(page: Page, delayMs = 500) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const isServerActionRequest =
      request.method() === "POST" &&
      request.headers()["next-action"] !== undefined;

    if (!isServerActionRequest) {
      await route.fallback();
      return;
    }

    await page.waitForTimeout(delayMs);
    await route.continue();
  });
}

export async function delayProfileActionRequests(page: Page, delayMs = 500) {
  await delayServerActionRequests(page, delayMs);
}

export async function delayChatSendRequests(page: Page, delayMs = 500) {
  await page.route(/\/rest\/v1\/chat_messages(?:\?|$)/, async (route) => {
    if (route.request().method() === "POST") {
      await page.waitForTimeout(delayMs);
    }

    await route.continue();
  });
}

export async function failChatSendRequests(
  page: Page,
  message = "Synthetic chat failure"
) {
  await page.route(/\/rest\/v1\/chat_messages(?:\?|$)/, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message }),
      });
      return;
    }

    await route.continue();
  });
}
