import { expect, test, type Page } from "@playwright/test";

const HOST_EMAIL = "demo-host@peels.local";
const DONOR_EMAIL = "demo-donor@peels.local";
const SEEDED_PASSWORD = "peels-demo-password";
const SEEDED_THREAD_ID = "33333333-3333-4333-8333-333333333333";

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

test("auth-sign-in redirects a seeded donor into the signed-in experience", async ({
  page,
}) => {
  await signIn(page, { email: DONOR_EMAIL, redirectTo: "/profile" });

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByTestId("profile-first-name")).toHaveText("Riley");
});

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

  await expect(page.getByTestId("profile-first-name")).toHaveText("Avery");
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Marrickville Neighbourhood Compost"
  );
  await expect(page.getByTestId("profile-listings")).toContainText(
    "Inner West Cafe Compost Pickup"
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
