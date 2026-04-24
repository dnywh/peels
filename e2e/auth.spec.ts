import { expect, test } from "@playwright/test";
import {
  HOST_EMAIL,
  SEEDED_PASSWORD,
  SEEDED_THREAD_ID,
  delayServerActionRequests,
  signIn,
} from "./helpers";

test("public listing shows the seeded public listing and guest contact gate", async ({
  page,
}) => {
  await page.goto("/listings/demo-marrickville-compost");

  await expect(
    page.getByRole("heading", { name: "Marrickville Neighbourhood Compost" })
  ).toBeVisible();
  await expect(page.getByTestId("listing-guest-cta")).toBeVisible();
  await expect(page.getByTestId("listing-sign-in-to-contact")).toHaveAttribute(
    "href",
    "/sign-in?redirect_to=/listings/demo-marrickville-compost"
  );
});

test("sign-in preserves a safe redirect_to", async ({ page }) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: "/profile",
  });

  await expect(page).toHaveURL(/\/profile$/);
});

test("sign-in normalises unsafe redirect_to values", async ({ page }) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: "https://example.com/phish",
    expectedPath: "/map",
  });

  await expect(page).toHaveURL(/\/map$/);
});

test("guest chats redirect preserves the requested chat path", async ({
  page,
}) => {
  await page.goto(`/chats/${SEEDED_THREAD_ID}`);

  await expect(page).toHaveURL(
    new RegExp(`/sign-in\\?redirect_to=/?chats/${SEEDED_THREAD_ID}$`)
  );
  await expect(page.getByTestId("sign-in-form")).toBeVisible();
});

test("sign-up shows client validation feedback before submitting", async ({
  page,
}) => {
  await page.goto("/sign-up");

  await page.locator('input[name="first_name"]').fill("@@");
  await page.locator('input[name="email"]').fill("new-person@example.com");
  await page.locator('input[name="password"]').fill(SEEDED_PASSWORD);
  await page.locator('input[name="legal_agreement"]').check();
  await page.getByTestId("sign-up-submit").click();

  await expect(page.getByTestId("sign-up-first-name-error")).toBeVisible();
  await expect(page.getByTestId("sign-up-form")).toContainText(
    /Please fix the above error/
  );
});

test("sign-up shows pending feedback and preserves server errors", async ({
  page,
}) => {
  await delayServerActionRequests(page);
  await page.goto("/sign-up");

  await page.locator('input[name="first_name"]').fill("Avery");
  await page.locator('input[name="email"]').fill(HOST_EMAIL);
  await page.locator('input[name="password"]').fill(SEEDED_PASSWORD);
  await page.locator('input[name="legal_agreement"]').check();

  const submitButton = page.getByTestId("sign-up-submit");
  const submitClick = submitButton.click();
  await expect(submitButton).toBeDisabled();
  await expect(submitButton).toHaveAttribute("aria-busy", "true");
  await submitClick;

  await expect(page).toHaveURL(/\/sign-up\?.*error=/);
  await expect(page.getByTestId("sign-up-form")).toContainText(
    /already exists/i
  );
});
