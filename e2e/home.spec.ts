import { expect, test } from "@playwright/test";

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

  await expect(featuredHostCards).toHaveCount(3);
  await expect(
    page.getByTestId("homepage-featured-host-demo-marrickville-compost")
  ).toBeVisible();
  await expect(
    page.getByTestId("homepage-featured-host-demo-inner-west-cafe")
  ).toBeVisible();
  await expect(
    page.getByTestId("homepage-featured-host-demo-tempe-share-shed")
  ).toBeVisible();
  await expect(
    page.getByTestId("homepage-featured-host-demo-stanmore-bakery")
  ).toHaveCount(0);
  await expect(
    page.getByTestId("homepage-featured-host-demo-newtown-worm-farm")
  ).toHaveCount(0);
});
