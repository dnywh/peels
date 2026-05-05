import { expect, test } from "@playwright/test";

test("share page presents the sharing resources download", async ({ page }) => {
  await page.goto("/share", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Spread the word", exact: true })
  ).toBeVisible();
  await expect(page).toHaveTitle(/Share · Peels/);
  const downloadLink = page.getByRole("link", { name: "Download everything" });

  await expect(downloadLink).toHaveAttribute("href", /share-peels\.zip/);
  await expect(downloadLink).toHaveAttribute("target", "_blank");
  await expect(downloadLink).toHaveAttribute("rel", "noopener");
  await expect(
    page.getByRole("heading", { name: "Digital tiles" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Print assets" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Workshop resources" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Inside the ZIP" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Copy examples" })
  ).toBeVisible();
  await expect(page.getByText("Shortest", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Peels connects folks with food scraps to those who compost."
    )
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Partners page" })
  ).toHaveAttribute("href", "/partners");
});

test("promo-kit redirects to share", async ({ page }) => {
  const redirectResponse = await page.request.get("/promo-kit", {
    maxRedirects: 0,
  });

  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toMatch(/\/share$/);

  await page.goto("/promo-kit", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/share$/);
  await expect(
    page.getByRole("heading", { name: "Spread the word", exact: true })
  ).toBeVisible();
});

test("help page combines FAQ and contact options", async ({ page }) => {
  await page.goto("/help", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Help", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Using Peels" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "About Peels" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.getByLabel("If you want to")).toBeVisible();

  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Help" })
  ).toHaveAttribute("href", "/help");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Contact" })
  ).toHaveCount(0);
});

test("contact redirects to the help contact anchor", async ({ page }) => {
  const redirectResponse = await page.request.get("/contact?address=support", {
    maxRedirects: 0,
  });

  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toMatch(
    /\/help\?address=support#contact$/
  );

  await page.goto("/contact?address=support", {
    waitUntil: "domcontentloaded",
  });

  await expect(page).toHaveURL(/\/help\?address=support#contact$/);
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("select#contact-address")).toHaveValue("support");
});

test("contact ignores old source-specific routes", async ({ page }) => {
  await page.goto("/contact?via=therot", {
    waitUntil: "domcontentloaded",
  });

  await expect(page).toHaveURL(/\/help#contact$/);
  await expect(page.locator("select#contact-address")).toHaveValue("general");
});

test("support redirects to help", async ({ page }) => {
  const redirectResponse = await page.request.get("/support?address=support", {
    maxRedirects: 0,
  });

  expect(redirectResponse.status()).toBe(308);
  expect(redirectResponse.headers().location).toMatch(
    /\/help\?address=support$/
  );

  await page.goto("/support?address=support", {
    waitUntil: "domcontentloaded",
  });

  await expect(page).toHaveURL(/\/help\?address=support$/);
  await expect(
    page.getByRole("heading", { name: "Help", exact: true })
  ).toBeVisible();
});

test("help promotion FAQ links to share", async ({ page }) => {
  await page.goto("/help", { waitUntil: "domcontentloaded" });

  await page.getByText("How can I promote Peels to my community?").click();

  await expect(page.getByRole("link", { name: "Share page" })).toHaveAttribute(
    "href",
    "/share"
  );
});
