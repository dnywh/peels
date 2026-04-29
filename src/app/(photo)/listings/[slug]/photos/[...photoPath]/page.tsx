import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import StandaloneListingPhotoPage from "@/components/StandaloneListingPhotoPage";
import type { Listing } from "@/types/listing";
import { getListingDisplayName } from "@/utils/listingUtils";
import { createClient } from "@/utils/supabase/server";
import { getStoragePublicUrl } from "@/utils/storage";
import { parseListingPhotoPath } from "@/utils/listingPhotoRoute";

type ListingPhotoPageParams = Promise<{
  photoPath?: string[];
  slug: string;
}>;

type ListingPhotoPageListing = Pick<
  Listing,
  "name" | "owner_first_name" | "photos" | "type"
>;

const getListingData = cache(async (slug: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listingData } = await supabase
    .from(user ? "listings_private_data" : "listings_public_data")
    .select("name, owner_first_name, photos, type")
    .match({ slug })
    .single();

  return {
    user,
    listing: (listingData as ListingPhotoPageListing | null) ?? null,
  };
});

export async function generateMetadata({
  params,
}: {
  params: ListingPhotoPageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const { user, listing } = await getListingData(slug);

  if (!listing) {
    return {
      title: "Photo",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const listingDisplayName = getListingDisplayName(listing, user);

  return {
    title: listingDisplayName ? `Photo · ${listingDisplayName}` : "Photo",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ListingPhotoPage({
  params,
}: {
  params: ListingPhotoPageParams;
}) {
  const { photoPath, slug } = await params;
  const photo = parseListingPhotoPath(photoPath);
  const { user, listing } = await getListingData(slug);
  const t = await getTranslations();

  if (!listing || !photo) {
    notFound();
  }

  if (!Array.isArray(listing.photos) || !listing.photos.includes(photo)) {
    notFound();
  }

  if (!user && listing.type === "residential") {
    notFound();
  }

  const src = getStoragePublicUrl("listing_photos", photo);

  if (!src) {
    notFound();
  }

  return (
    <StandaloneListingPhotoPage
      alt={`Listing photo ${listing.photos.indexOf(photo) + 1}`}
      backHref={`/listings/${slug}`}
      closeLabel={t("Actions.close")}
      src={src}
    />
  );
}
