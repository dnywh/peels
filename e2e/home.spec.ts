import { expect, test } from "@playwright/test";

test("homepage hydrates without chat date mismatches", async ({ page }) => {
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

  const initialDayLabels = await page
    .getByTestId("chat-day-label")
    .allTextContents();
  const initialTimestamps = await page
    .getByTestId("chat-message-timestamp")
    .allTextContents();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2_000);

  const hydratedDayLabels = await page
    .getByTestId("chat-day-label")
    .allTextContents();
  const hydratedTimestamps = await page
    .getByTestId("chat-message-timestamp")
    .allTextContents();

  expect(hydratedDayLabels).toEqual(initialDayLabels);
  expect(hydratedTimestamps).toEqual(initialTimestamps);
  expect(
    pageErrors.some((message) => message.includes("Minified React error #418"))
  ).toBeFalsy();
  expect(
    consoleErrors.some((message) =>
      message.includes("Minified React error #418")
    )
  ).toBeFalsy();
});
