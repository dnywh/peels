import { getLocale, getTranslations } from "next-intl/server";
import type { ListingSeoCopy } from "./listingUtils.ts";

function splitKeywordList(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export async function getListingSeoOptions() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Listings.seo" });

  const seoCopy: ListingSeoCopy = {
    privateHostName: t("privateHostName"),
    fallbackListingName: t("fallbackListingName"),
    residentialConnectName: t("residentialConnectName"),
    residentialIntro: ({ name, location }) =>
      location
        ? t("residentialIntroWithLocation", { name, location })
        : t("residentialIntro", { name }),
    businessIntro: ({ name, location }) =>
      location
        ? t("businessIntroWithLocation", { name, location })
        : t("businessIntro", { name }),
    connect: ({ name, siteName }) =>
      t("connect", { name, siteName, explainer: t("siteExplainer") }),
    acceptedItemsLabel: t("acceptedItemsLabel"),
    rejectedItemsLabel: t("rejectedItemsLabel"),
    locationKeywords: ({ location }) => [
      t("keywords.location", { location }),
      t("keywords.foodScraps", { location }),
      t("keywords.compost", { location }),
      t("keywords.foodScrapDropOff", { location }),
      t("keywords.compostDropOff", { location }),
    ],
    baseKeywords: () => splitKeywordList(t("keywords.base")),
  };

  return {
    locale,
    seoCopy,
  };
}
