import { expect, test } from "@playwright/test";

const LISTING_PATH = "/listings/demo-marrickville-compost";
const MAP_LISTING_PATH = "/map?listing=demo-marrickville-compost";
const RESIDENTIAL_LISTING_PATH = "/listings/demo-newtown-worm-farm";

async function getMetaDescription(page: import("@playwright/test").Page) {
  return page.locator('head meta[name="description"]').getAttribute("content");
}

async function getListingJsonLdScripts(page: import("@playwright/test").Page) {
  return page.locator('script[type="application/ld+json"]').allTextContents();
}

type ListingJsonLd = {
  "@context"?: unknown;
  "@type"?: unknown;
  "@id"?: string;
  "@graph"?: unknown;
  mainEntity?: Array<{
    name?: string;
    acceptedAnswer?: {
      text?: string;
    };
  }>;
  about?: {
    address?: unknown;
    additionalProperty?: unknown;
    geo?: unknown;
    image?: unknown;
  };
};

function parseJsonLdScripts(scripts: string[]) {
  return scripts.map((script) => JSON.parse(script) as ListingJsonLd);
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

test("homepage emits object-shaped site JSON-LD", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const jsonLdScripts = await getListingJsonLdScripts(page);
  const siteJsonLd = parseJsonLdScripts(jsonLdScripts).find((data) =>
    Array.isArray(data["@graph"])
  );

  expect(siteJsonLd).toEqual(
    expect.objectContaining({
      "@context": "https://schema.org",
      "@graph": expect.arrayContaining([
        expect.objectContaining({
          "@type": "Organization",
          name: "Peels",
        }),
        expect.objectContaining({
          "@type": "WebSite",
          name: "Peels",
        }),
      ]),
    })
  );
});

test("homepage emits summary FAQPage JSON-LD", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const jsonLdScripts = await getListingJsonLdScripts(page);
  const faqJsonLd = parseJsonLdScripts(jsonLdScripts).find(
    (data) => data["@type"] === "FAQPage"
  );
  const questions = faqJsonLd?.mainEntity?.map((entity) => entity.name) ?? [];

  expect(questions).toEqual(
    expect.arrayContaining([
      "What is Peels?",
      "How do I find a compost drop-off near me?",
      "Can I compost food scraps if I don’t have a garden or compost bin?",
      "Can businesses use Peels to donate food scraps?",
      "I’m not comfortable sharing my address. Can I still participate?",
    ])
  );
  expect(questions).not.toContain("Who maintains Peels?");
});

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

  const listingJsonLd = parseJsonLdScripts(jsonLdScripts).find(
    (data) =>
      data["@id"] ===
      "https://www.peels.app/listings/demo-marrickville-compost#webpage"
  );
  expect(listingJsonLd?.about?.additionalProperty).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Accepted food scraps",
        value: expect.stringContaining("Fruit and vegetable scraps"),
      }),
      expect.objectContaining({
        name: "Items not accepted",
        value: expect.stringContaining("Plastic bags"),
      }),
    ])
  );
});

test("anonymous residential listing pages expose an indexable private-host teaser", async ({
  page,
}) => {
  await page.goto(RESIDENTIAL_LISTING_PATH, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle("Private Host");
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/listings\/demo-newtown-worm-farm$/
  );
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);

  const description = await getMetaDescription(page);
  expect(description).toContain(
    "Private Host accepts food scraps for composting in Newtown, Australia"
  );
  expect(description).not.toContain("Newtown Balcony Worm Farm");

  await expect(
    page.getByRole("heading", { name: "Private Host" })
  ).toBeVisible();
  await expect(page.getByText("Resident of Newtown")).toBeVisible();

  const pageHtml = await page.content();
  for (const privateText of [
    "Newtown Balcony Worm Farm",
    "A small residential setup",
    "Fruit scraps",
    "Paper towels",
    "Crushed egg shells",
    "Citrus in bulk",
    "Cooked food",
    "151.1781",
    "-33.8986",
  ]) {
    expect(pageHtml).not.toContain(privateText);
  }

  const jsonLdScripts = await getListingJsonLdScripts(page);
  const listingJsonLd = parseJsonLdScripts(jsonLdScripts).find(
    (data) =>
      data["@id"] ===
      "https://www.peels.app/listings/demo-newtown-worm-farm#webpage"
  );

  expect(listingJsonLd).toEqual(
    expect.objectContaining({
      "@type": "WebPage",
      name: "Private Host",
    })
  );
  expect(listingJsonLd?.about?.address).toBeUndefined();
  expect(listingJsonLd?.about?.geo).toBeUndefined();
  expect(listingJsonLd?.about?.image).toBeUndefined();
  expect(listingJsonLd?.about?.additionalProperty).toBeUndefined();
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

test("help page emits FAQPage JSON-LD for visible help questions", async ({
  page,
}) => {
  await page.goto("/help", { waitUntil: "domcontentloaded" });

  const jsonLdScripts = await getListingJsonLdScripts(page);
  const faqJsonLd = parseJsonLdScripts(jsonLdScripts).find(
    (data) => data["@type"] === "FAQPage"
  );
  const questions = faqJsonLd?.mainEntity?.map((entity) => entity.name) ?? [];

  expect(questions).toEqual(
    expect.arrayContaining([
      "How do I manage which emails I receive?",
      "How is Peels different to ShareWaste?",
      "Who maintains Peels?",
      "I represent a government or institution. How can we get involved?",
    ])
  );
  expect(
    faqJsonLd?.mainEntity?.some((entity) =>
      entity.acceptedAnswer?.text?.includes(
        "The newsletter is separate and optional"
      )
    )
  ).toBeTruthy();
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
