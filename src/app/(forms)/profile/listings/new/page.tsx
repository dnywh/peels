import { createClient } from "@/utils/supabase/server";
import FormHeader from "@/components/FormHeader";
import ListingTypeChooser from "@/components/ListingTypeChooser";
import {
  MAX_LISTINGS_PER_USER,
  MAX_RESIDENTIAL_LISTINGS_PER_USER,
} from "@/config/listingLimits";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: listings }] = user
    ? await Promise.all([
        supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
        supabase.from("listings").select("type").eq("owner_id", user.id),
      ])
    : [{ data: null }, { data: null }];

  const isAdmin = profile?.is_admin === true;
  const totalListingCount = listings?.length ?? 0;
  const residentialListingCount =
    listings?.filter((listing) => listing.type === "residential").length ?? 0;
  const hasReachedListingLimit =
    !isAdmin && totalListingCount >= MAX_LISTINGS_PER_USER;
  const hasReachedResidentialListingLimit =
    !isAdmin && residentialListingCount >= MAX_RESIDENTIAL_LISTINGS_PER_USER;

  const hostOptions = [
    ...(!hasReachedListingLimit && !hasReachedResidentialListingLimit
      ? [
          {
            key: "residential",
            title: t("Listings.new.options.residential.title"),
            description: t("Listings.new.options.residential.description"),
          },
        ]
      : []),
    ...(!hasReachedListingLimit
      ? [
          {
            key: "community",
            title: t("Listings.new.options.community.title"),
            description: t("Listings.new.options.community.description"),
          },
        ]
      : []),
  ];

  const listingOptions = hasReachedListingLimit
    ? []
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

  const options = isHostSelection ? hostOptions : listingOptions;

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
        emptyMessage={t("Listings.new.noAvailableOptions")}
        ariaLabel={
          isHostSelection
            ? t("Listings.new.hostTypeLabel")
            : t("Listings.new.listingTypeLabel")
        }
      />
    </>
  );
}
