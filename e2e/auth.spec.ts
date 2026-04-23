import { expect, test } from "@playwright/test";
import { HOST_EMAIL, SEEDED_THREAD_ID, signIn } from "./helpers";

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
