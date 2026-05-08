import { expect, test } from "@playwright/test";

const LISTING_PATH = "/listings/demo-marrickville-compost";
const MAP_LISTING_PATH = "/map?listing=demo-marrickville-compost";

async function getMetaDescription(page: import("@playwright/test").Page) {
  return page.locator('head meta[name="description"]').getAttribute("content");
}

async function getListingJsonLdScripts(page: import("@playwright/test").Page) {
  return page.locator('script[type="application/ld+json"]').allTextContents();
}

async function newLocalePage(
  browser: import("@playwright/test").Browser,
  locale: string,
  acceptLanguage: string
) {
  const baseURL = test.info().project.use.baseURL as string | undefined;
  const context = await browser.newContext({
    baseURL,
    locale,
    extraHTTPHeaders: {
      "Accept-Language": acceptLanguage,
    },
  });
  const page = await context.newPage();

  return { context, page };
}

test("public listing pages expose crawlable listing metadata", async ({
  page,
}) => {
  await page.goto(LISTING_PATH, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle("Marrickville Neighbourhood Compost");
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/listings\/demo-marrickville-compost$/
  );

  const description = await getMetaDescription(page);
  expect(description).toContain(
    "Marrickville Neighbourhood Compost helps people compost food scraps"
  );

  const jsonLdScripts = await getListingJsonLdScripts(page);
  expect(
    jsonLdScripts.some(
      (script) =>
        script.includes('"@type":"WebPage"') &&
        script.includes("Marrickville Neighbourhood Compost")
    )
  ).toBeTruthy();
});

test("public listing pages localise Spanish SEO metadata", async ({
  browser,
}) => {
  const { context, page } = await newLocalePage(
    browser,
    "es-MX",
    "es-MX,es;q=0.9,en;q=0.8"
  );

  try {
    await page.goto(LISTING_PATH, { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page).toHaveTitle("Marrickville Neighbourhood Compost");
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/listings\/demo-marrickville-compost$/
    );

    const description = await getMetaDescription(page);
    expect(description).toContain(
      "Marrickville Neighbourhood Compost ayuda a compostar restos de comida"
    );
    expect(description).not.toContain("helps people compost food scraps");

    const jsonLdScripts = await getListingJsonLdScripts(page);
    expect(
      jsonLdScripts.some(
        (script) =>
          script.includes('"inLanguage":"es"') &&
          script.includes("ayuda a compostar restos de comida")
      )
    ).toBeTruthy();
  } finally {
    await context.close();
  }
});

test("public listing pages localise Brazilian Portuguese SEO metadata", async ({
  browser,
}) => {
  const { context, page } = await newLocalePage(
    browser,
    "pt-BR",
    "pt-BR,pt;q=0.9,en;q=0.8"
  );

  try {
    await page.goto(LISTING_PATH, { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

    const description = await getMetaDescription(page);
    expect(description).toContain(
      "Marrickville Neighbourhood Compost ajuda pessoas a compostar restos de comida"
    );
    expect(description).not.toContain("helps people compost food scraps");
  } finally {
    await context.close();
  }
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

test("map listing URLs localise metadata without changing canonical", async ({
  browser,
}) => {
  const { context, page } = await newLocalePage(
    browser,
    "es-MX",
    "es-MX,es;q=0.9,en;q=0.8"
  );

  try {
    await page.goto(MAP_LISTING_PATH, { waitUntil: "domcontentloaded" });

    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/listings\/demo-marrickville-compost$/
    );

    const description = await getMetaDescription(page);
    expect(description).toContain(
      "Marrickville Neighbourhood Compost ayuda a compostar restos de comida"
    );
  } finally {
    await context.close();
  }
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
