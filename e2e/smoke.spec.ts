import { expect, test, type Page } from "@playwright/test";

const HOST_EMAIL = "demo-host@peels.local";
const DONOR_EMAIL = "demo-donor@peels.local";
const SEEDED_PASSWORD = "peels-demo-password";
const SEEDED_THREAD_ID = "33333333-3333-4333-8333-333333333333";
const PROFILE_RENDER_TIMEOUT_MS = 15_000;

async function signIn(
  page: Page,
  {
    email,
    redirectTo = "/profile",
  }: {
    email: string;
    redirectTo?: string;
  }
) {
  await page.goto(`/sign-in?redirect_to=${encodeURIComponent(redirectTo)}`);

  await expect(page.getByTestId("sign-in-form")).toBeVisible();

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(SEEDED_PASSWORD);

  await Promise.all([
    page.waitForURL((url) => url.pathname === redirectTo),
    page.getByTestId("sign-in-submit").click(),
  ]);
}

async function delayProfileActionRequests(page: Page, delayMs = 500) {
  await page.route("**/profile", async (route) => {
    if (route.request().method() === "POST") {
      await page.waitForTimeout(delayMs);
    }

    await route.continue();
  });
}

test("public-listing shows the seeded public listing and guest contact gate", async ({
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

test("profile loads the seeded host account and listings", async ({ page }) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });

  await expect(page.getByTestId("profile-first-name")).toHaveText("Avery", {
    timeout: PROFILE_RENDER_TIMEOUT_MS,
  });
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Marrickville Neighbourhood Compost"
  );
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Inner West Cafe Compost Pickup"
  );
});

test("sign-in form preserves redirect_to", async ({ page }) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: "/profile",
  });

  await expect(page).toHaveURL(/\/profile$/);
});

test("profile account actions show pending feedback and update the read view", async ({
  page,
}) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
  await delayProfileActionRequests(page);

  await page.getByTestId("profile-account-first-name-edit").click();
  await page.getByTestId("profile-account-first-name-input").fill("Avery Test");

  const firstNameSubmit = page.getByTestId("profile-account-first-name-submit");
  const firstNameClick = firstNameSubmit.click();
  await expect(firstNameSubmit).toHaveText("Updating...");
  await firstNameClick;
  await expect(page.getByTestId("profile-account-first-name-value")).toHaveText(
    "Avery Test"
  );

  await page.getByTestId("profile-account-newsletter-edit").click();
  await page
    .getByTestId("profile-account-newsletter-input")
    .selectOption("false");

  const newsletterSubmit = page.getByTestId(
    "profile-account-newsletter-submit"
  );
  const newsletterClick = newsletterSubmit.click();
  await expect(newsletterSubmit).toHaveText("Updating...");
  await newsletterClick;
  await expect(page.getByTestId("profile-account-newsletter-value")).toHaveText(
    "Not subscribed"
  );

  await page.getByTestId("profile-account-language-edit").click();
  await page.getByTestId("profile-account-language-input").selectOption("de");

  const languageSubmit = page.getByTestId("profile-account-language-submit");
  const languageClick = languageSubmit.click();
  await expect(languageSubmit).toHaveText("Updating...");
  await languageClick;
  await expect(page.getByTestId("profile-account-language-value")).toHaveText(
    "Deutsch"
  );
});

test("chat loads the seeded thread and composer for a signed-in donor", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  await expect(page).toHaveURL(new RegExp(`/chats/${SEEDED_THREAD_ID}$`));
  await expect(page.getByTestId("chat-window")).toBeVisible();
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Hey Avery, do you take coffee grounds from a small home espresso machine?"
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Yes, absolutely. Small sealed containers are perfect."
  );
  await expect(page.getByTestId("chat-composer")).toBeVisible();
  await expect(page.getByTestId("chat-composer-input")).toBeVisible();
});
