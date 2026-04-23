import FormHeader from "@/components/FormHeader";
import ListingTypeChooser from "@/components/ListingTypeChooser";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type AddListingPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Add Listing",
};

export default async function AddListingPage({
  searchParams,
}: AddListingPageProps) {
  const t = await getTranslations();
  const { type } = await searchParams;
  const isHostSelection = type === "host";

  const options = isHostSelection
    ? [
        {
          key: "residential",
          title: t("Listings.new.options.residential.title"),
          description: t("Listings.new.options.residential.description"),
        },
        {
          key: "community",
          title: t("Listings.new.options.community.title"),
          description: t("Listings.new.options.community.description"),
        },
      ]
    : [
        {
          key: "host",
          title: t("Listings.new.options.host.title"),
          description: t("Listings.new.options.host.description"),
        },
        {
          key: "business",
          title: t("Listings.new.options.business.title"),
          description: t("Listings.new.options.business.description"),
        },
      ];

  return (
    <>
      <FormHeader button="back">
        <h1>
          {isHostSelection
            ? t("Listings.new.hostTypeTitle")
            : t("Listings.new.listingTypeTitle")}
        </h1>
      </FormHeader>

      <ListingTypeChooser
        mode={isHostSelection ? "host" : "listing"}
        options={options}
        continueLabel={t("Actions.continue")}
        ariaLabel={
          isHostSelection
            ? t("Listings.new.hostTypeLabel")
            : t("Listings.new.listingTypeLabel")
        }
      />
    </>
  );
}
