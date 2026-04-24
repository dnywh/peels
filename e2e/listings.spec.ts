import { expect, test } from "@playwright/test";
import {
  HOST_EMAIL,
  PROFILE_RENDER_TIMEOUT_MS,
  delayServerActionRequests,
  signIn,
} from "./helpers";

const BUSINESS_LISTING_EDIT_PATH = "/profile/listings/demo-inner-west-cafe";
const ALTERNATE_BUSINESS_DESCRIPTION =
  "A demo business listing with a slightly different description for e2e coverage.";

test("profile loads the seeded host account and listings", async ({ page }) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });

  await expect(page.getByTestId("profile-first-name")).toHaveText(/\S+/, {
    timeout: PROFILE_RENDER_TIMEOUT_MS,
  });
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Marrickville Neighbourhood Compost"
  );
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Inner West Cafe Compost Pickup"
  );
});

test("listing type chooser routes signed-in hosts to the selected form", async ({
  page,
}) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: "/profile/listings/new",
  });

  const chooser = page.getByTestId("listing-type-chooser");
  const businessOption = page.getByTestId("listing-type-option-business");
  const continueButton = page.getByTestId("listing-type-chooser-submit");

  await expect(chooser).toBeVisible();
  await expect(businessOption).toBeVisible();
  await businessOption.click();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();

  await expect(page).toHaveURL(/\/profile\/listings\/new\/business$/);
  await expect(page.locator("#name")).toBeVisible();
});

test("new listing form shows validation feedback when location is missing", async ({
  page,
}) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: "/profile/listings/new/business",
  });
  await expect(page.getByTestId("listing-write-form")).toBeVisible();
  await page.locator("#name").fill("Temporary Demo Business");
  await page
    .locator("#description")
    .fill("A test-only description that leaves location empty on purpose.");
  await page.locator('input[name="legal_agreement"]').check();
  await page.getByTestId("listing-write-submit").click();

  await expect(
    page.getByText(
      /Please select a location\.|Bitte wähle einen Standort aus\.|Selecciona una ubicación\./
    )
  ).toBeVisible();
});

test("listing edit saves and restores seeded business fields", async ({
  page,
}) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: BUSINESS_LISTING_EDIT_PATH,
  });
  await expect(page.getByTestId("listing-write-form")).toBeVisible();
  const descriptionInput = page.locator("#description");
  const visibilityInput = page.locator("#visibility");
  const originalDescription = await descriptionInput.inputValue();
  const originalVisibility = await visibilityInput.inputValue();
  const updatedDescription =
    originalDescription === ALTERNATE_BUSINESS_DESCRIPTION
      ? "A demo business listing so local development exercises the multi-listing host views and badges."
      : ALTERNATE_BUSINESS_DESCRIPTION;
  const updatedVisibility = originalVisibility === "true" ? "false" : "true";

  await descriptionInput.fill(updatedDescription);
  await visibilityInput.selectOption(updatedVisibility);
  await delayServerActionRequests(page);

  const submitButton = page.getByTestId("listing-write-submit");
  const updateNavigation = page.waitForURL(
    /\/listings\/demo-inner-west-cafe\?status=updated$/
  );
  await submitButton.click();
  await expect(submitButton).toBeDisabled();
  await expect(submitButton).toHaveAttribute("aria-busy", "true");
  await updateNavigation;

  await page.goto(BUSINESS_LISTING_EDIT_PATH);
  await expect(page.locator("#description")).toHaveValue(updatedDescription);
  await expect(page.locator("#visibility")).toHaveValue(updatedVisibility);

  await page.locator("#description").fill(originalDescription);
  await page.locator("#visibility").selectOption(originalVisibility);

  await Promise.all([
    page.waitForURL(/\/listings\/demo-inner-west-cafe\?status=updated$/),
    page.getByTestId("listing-write-submit").click(),
  ]);

  await page.goto(BUSINESS_LISTING_EDIT_PATH);
  await expect(page.locator("#description")).toHaveValue(originalDescription);
  await expect(page.locator("#visibility")).toHaveValue(originalVisibility);
});
