import { expect, test } from "@playwright/test";

const LISTING_PATH = "/listings/demo-marrickville-compost";
const MAP_LISTING_PATH = "/map?listing=demo-marrickville-compost";

test("public listing pages expose crawlable listing metadata", async ({
  page,
}) => {
  await page.goto(LISTING_PATH, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle("Marrickville Neighbourhood Compost");
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/listings\/demo-marrickville-compost$/
  );

  const description = await page
    .locator('head meta[name="description"]')
    .getAttribute("content");
  expect(description).toContain(
    "Marrickville Neighbourhood Compost helps people compost food scraps"
  );

  const jsonLdScripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(
    jsonLdScripts.some(
      (script) =>
        script.includes('"@type":"WebPage"') &&
        script.includes("Marrickville Neighbourhood Compost")
    )
  ).toBeTruthy();
});

test("map listing URLs canonicalise to the static listing sibling", async ({
  page,
}) => {
  await page.goto(MAP_LISTING_PATH, { waitUntil: "domcontentloaded" });

  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/listings\/demo-marrickville-compost$/
  );
});

test("auth utility pages are noindex and omitted from the sitemap", async ({
  page,
  request,
}) => {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });

  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex,\s*follow/
  );

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();

  const sitemapXml = await sitemap.text();
  expect(sitemapXml).not.toContain("/sign-in");
  expect(sitemapXml).not.toContain("/sign-up");
  expect(sitemapXml).toContain("/listings/demo-marrickville-compost");
});

test("robots.txt allows crawling and advertises the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();

  const robots = await response.text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Sitemap: https://www.peels.app/sitemap.xml");
});
