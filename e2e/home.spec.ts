import { expect, test } from "@playwright/test";

test("homepage hydrates without chat date mismatches", async ({
  browser,
  page,
}) => {
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
    baseURL: "http://127.0.0.1:3000",
    javaScriptEnabled: false,
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
  await page.waitForTimeout(2_000);

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
