import { expect, test } from "@playwright/test";
import { HOST_EMAIL, signIn } from "./helpers";

test("homepage hydrates without chat date mismatches", async ({
  browser,
  page,
}) => {
  const { baseURL, extraHTTPHeaders, locale } = test.info().project.use;

  if (typeof baseURL !== "string") {
    throw new Error("Expected Playwright baseURL to be configured");
  }

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", {
      name: "Find a home for your food scraps, wherever you are",
    })
  ).toBeVisible();

  const serverContext = await browser.newContext({
    baseURL,
    extraHTTPHeaders,
    javaScriptEnabled: false,
    locale,
  });
  const serverPage = await serverContext.newPage();
  await serverPage.goto("/");
  const serverDayLabels = await serverPage
    .getByTestId("chat-day-label")
    .allTextContents();
  const serverTimestamps = await serverPage
    .getByTestId("chat-message-timestamp")
    .allTextContents();
  await serverContext.close();

  await page.waitForLoadState("networkidle");
  await expect
    .poll(async () => page.getByTestId("chat-day-label").allTextContents())
    .toEqual(["Yesterday", "Today"]);

  const hydratedDayLabels = await page
    .getByTestId("chat-day-label")
    .allTextContents();
  const hydratedTimestamps = await page
    .getByTestId("chat-message-timestamp")
    .allTextContents();

  expect(serverDayLabels).toEqual(["Thu, May 1", "Fri, May 2"]);
  expect(hydratedDayLabels).toEqual(["Yesterday", "Today"]);
  expect(hydratedTimestamps).toEqual(serverTimestamps);
  expect(
    pageErrors.some((message) => message.includes("Minified React error #418"))
  ).toBeFalsy();
  expect(
    consoleErrors.some((message) =>
      message.includes("Minified React error #418")
    )
  ).toBeFalsy();
});

test("homepage drop-off only shows curated featured hosts", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("homepage-featured-hosts")).toBeVisible();

  const featuredHostCards = page.locator(
    '[data-testid^="homepage-featured-host-"]'
  );
  const allowedFeaturedHosts = new Set([
    "homepage-featured-host-demo-marrickville-compost",
    "homepage-featured-host-demo-inner-west-cafe",
    "homepage-featured-host-demo-tempe-share-shed",
  ]);

  await expect(featuredHostCards).toHaveCount(3);

  const renderedFeaturedHosts = await featuredHostCards.evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("data-testid"))
  );

  expect(renderedFeaturedHosts).toHaveLength(3);
  expect(new Set(renderedFeaturedHosts).size).toBe(3);
  expect(
    renderedFeaturedHosts.every(
      (testId): testId is string =>
        typeof testId === "string" && allowedFeaturedHosts.has(testId)
    )
  ).toBeTruthy();
  await expect(
    page.getByTestId("homepage-featured-host-demo-stanmore-bakery")
  ).toHaveCount(0);
  await expect(
    page.getByTestId("homepage-featured-host-demo-newtown-worm-farm")
  ).toHaveCount(0);
});

test("homepage account button stays hidden while signed-in profile state loads", async ({
  page,
}) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });

  let resolveProfileRequest = () => {};
  const profileRequestStarted = new Promise<void>((resolve) => {
    resolveProfileRequest = resolve;
  });
  let continueProfileRequest = () => {};
  const profileRequestCanContinue = new Promise<void>((resolve) => {
    continueProfileRequest = resolve;
  });

  await page.route(/\/rest\/v1\/profiles(?:\?|$)/, async (route) => {
    const request = route.request();

    if (
      request.method() === "GET" &&
      request.url().includes("select=first_name")
    ) {
      resolveProfileRequest();
      await profileRequestCanContinue;
    }

    await route.continue();
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await profileRequestStarted;

  try {
    await expect(page.getByTestId("account-button-loading")).toHaveCount(0);
    await expect(page.getByTestId("account-button-profile")).toHaveCount(0);
    await expect(page.getByTestId("account-button-sign-in")).toHaveCount(0);
  } finally {
    continueProfileRequest();
  }

  const profileAccountButton = page.getByTestId("account-button-profile");

  await expect(profileAccountButton).toHaveAttribute("href", "/profile");
  await expect(profileAccountButton).toHaveCSS("opacity", "1");
});

test("homepage account button links guests to sign in", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("account-button-sign-in")).toHaveAttribute(
    "href",
    "/sign-in"
  );
  await expect(page.getByTestId("account-button-profile")).toHaveCount(0);
});
