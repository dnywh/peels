import { expect, test } from "@playwright/test";
import {
  HOST_EMAIL,
  SEEDED_PASSWORD,
  SEEDED_THREAD_ID,
  createAdminClient,
  delayServerActionRequests,
  generateRecoveryToken,
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

test("password reset success page renders for signed-in users", async ({
  page,
}) => {
  const successMessage =
    "Your password has been updated. Let’s get back to composting!";

  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: `/profile/reset-password?success=${encodeURIComponent(
      successMessage
    )}`,
  });

  await expect(
    page.getByRole("heading", { name: "Password updated" })
  ).toBeVisible();
  await expect(page.getByText(successMessage)).toBeVisible();
});

test("email scanner requests do not consume a recovery token", async ({
  page,
  request,
}) => {
  const tokenHash = await generateRecoveryToken(HOST_EMAIL);
  const confirmPath = `/auth/confirm?token_hash=${tokenHash}&type=recovery&next=/profile/reset-password&locale=en`;

  const headResponse = await request.head(confirmPath);
  expect(headResponse.ok()).toBe(true);

  const getResponse = await request.get(confirmPath);
  expect(getResponse.ok()).toBe(true);

  await page.goto(confirmPath);
  await expect(
    page.getByRole("heading", { name: "Reset your password" })
  ).toBeVisible();
  await expect(
    page.getByText("Press ‘Continue’ to choose a new password.")
  ).toBeVisible();
  await page.getByTestId("auth-confirm-submit").click();

  await expect(page).toHaveURL(/\/profile\/reset-password$/);
  await expect(
    page.getByRole("heading", { name: "Reset password" })
  ).toBeVisible();
});

test("confirmation copy matches the email auth action", async ({ page }) => {
  const confirmationCases = [
    {
      type: "signup",
      heading: "Confirm your email",
      body: "Press ‘Continue’ to finish creating your account.",
    },
    {
      type: "invite",
      heading: "Accept your invitation",
      body: "Press ‘Continue’ to join Peels.",
    },
    {
      type: "magiclink",
      heading: "Sign in to Peels",
      body: "Press ‘Continue’ to sign in.",
    },
    {
      type: "recovery",
      heading: "Reset your password",
      body: "Press ‘Continue’ to choose a new password.",
    },
    {
      type: "email_change",
      heading: "Confirm your new email",
      body: "Press ‘Continue’ to update your email address.",
    },
  ] as const;

  for (const confirmationCase of confirmationCases) {
    await page.goto(
      `/auth/confirm?token_hash=unused-copy-test-token&type=${confirmationCase.type}`
    );
    await expect(
      page.getByRole("heading", { name: confirmationCase.heading })
    ).toBeVisible();
    await expect(page.getByText(confirmationCase.body)).toBeVisible();
    await expect(page.getByTestId("auth-confirm-submit")).toHaveText(
      "Continue"
    );
  }
});

test("consumed recovery tokens show the invalid-link error", async ({
  page,
}) => {
  const tokenHash = await generateRecoveryToken(HOST_EMAIL);
  const admin = createAdminClient();
  const { error } = await admin.auth.verifyOtp({
    type: "recovery",
    token_hash: tokenHash,
  });
  expect(error).toBeNull();

  await page.goto(
    `/auth/confirm?token_hash=${tokenHash}&type=recovery&next=/profile/reset-password`
  );
  await page.getByTestId("auth-confirm-submit").click();

  await expect(page).toHaveURL(/\/sign-in\?.*error=/);
  await expect(page.getByTestId("sign-in-form")).toContainText(
    /invalid or has expired/i
  );
});

test("malformed confirmation links show the invalid-link error", async ({
  page,
}) => {
  await page.goto("/auth/confirm?type=recovery&next=/profile/reset-password");

  await expect(page).toHaveURL(/\/sign-in\?.*error=/);
  await expect(page.getByTestId("sign-in-form")).toContainText(
    /invalid or has expired/i
  );
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

  await expect(page).toHaveURL(/\/sign-in\?/);
  const redirectedUrl = new URL(page.url());
  expect(redirectedUrl.searchParams.get("redirect_to")).toBe(
    `/chats/${SEEDED_THREAD_ID}`
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
