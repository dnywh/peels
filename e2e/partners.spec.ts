import { expect, test } from "@playwright/test";

test("partners page shows partner and council mention proof", async ({
  page,
}) => {
  await page.goto("/partners", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Partners", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Community partners" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Visit LOCCAL" })
  ).toHaveAttribute("href", "https://www.loccal.org.au/");
  await expect(page.getByAltText("LOCCAL logo")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Mentioned by councils" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Waverley Council" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Merri-bek City Council" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Northern Beaches Council" })
  ).toBeVisible();
});

test("homepage and footer link to partners", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "In good company" })
  ).toBeVisible();
  await expect(page.getByAltText("LOCCAL logo")).toBeVisible();
  await expect(page.getByText("Community partner: LOCCAL")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See all partners and mentions" })
  ).toHaveAttribute("href", "/partners");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Partners" })
  ).toHaveAttribute("href", "/partners");
});
