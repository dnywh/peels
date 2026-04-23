import { expect, test } from "@playwright/test";
import { HOST_EMAIL, delayProfileActionRequests, signIn } from "./helpers";

test("profile account actions show pending feedback and update the read view", async ({
  page,
}) => {
  await signIn(page, { email: HOST_EMAIL, redirectTo: "/profile" });
  await delayProfileActionRequests(page);

  const profileAccountSettings = page.getByTestId("profile-account-settings");
  await expect(profileAccountSettings).toBeVisible();
  await expect(profileAccountSettings).toHaveAttribute("data-hydrated", "true");

  await page.getByTestId("profile-account-first-name-edit").click();
  const firstNameInput = page.getByTestId("profile-account-first-name-input");
  const originalFirstName = await firstNameInput.inputValue();
  const updatedFirstName =
    originalFirstName === "Avery Test" ? "Avery Again" : "Avery Test";
  await firstNameInput.fill(updatedFirstName);

  const firstNameSubmit = page.getByTestId("profile-account-first-name-submit");
  const firstNameClick = firstNameSubmit.click();
  await expect(firstNameSubmit).toBeDisabled();
  await expect(firstNameSubmit).toHaveAttribute("aria-busy", "true");
  await firstNameClick;
  await expect(page.getByTestId("profile-account-first-name-value")).toHaveText(
    updatedFirstName
  );

  await page.getByTestId("profile-account-newsletter-edit").click();
  const newsletterInput = page.getByTestId("profile-account-newsletter-input");
  const originalNewsletterPreference = await newsletterInput.inputValue();
  const updatedNewsletterPreference =
    originalNewsletterPreference === "true" ? "false" : "true";
  await newsletterInput.selectOption(updatedNewsletterPreference);

  const newsletterSubmit = page.getByTestId(
    "profile-account-newsletter-submit"
  );
  const newsletterClick = newsletterSubmit.click();
  await expect(newsletterSubmit).toBeDisabled();
  await expect(newsletterSubmit).toHaveAttribute("aria-busy", "true");
  await newsletterClick;
  await page.getByTestId("profile-account-newsletter-edit").click();
  await expect(
    page.getByTestId("profile-account-newsletter-input")
  ).toHaveValue(updatedNewsletterPreference);
  await page.getByRole("button", { name: /cancel|abbrechen/i }).click();

  await page.getByTestId("profile-account-first-name-edit").click();
  await page
    .getByTestId("profile-account-first-name-input")
    .fill(originalFirstName);
  await page.getByTestId("profile-account-first-name-submit").click();
  await expect(page.getByTestId("profile-account-first-name-value")).toHaveText(
    originalFirstName
  );

  await page.getByTestId("profile-account-newsletter-edit").click();
  await page
    .getByTestId("profile-account-newsletter-input")
    .selectOption(originalNewsletterPreference);
  await page.getByTestId("profile-account-newsletter-submit").click();
  await page.getByTestId("profile-account-newsletter-edit").click();
  await expect(
    page.getByTestId("profile-account-newsletter-input")
  ).toHaveValue(originalNewsletterPreference);
  await page.getByRole("button", { name: /cancel|abbrechen/i }).click();
});
