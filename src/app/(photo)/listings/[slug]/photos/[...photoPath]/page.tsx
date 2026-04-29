import { notFound } from "next/navigation";
import { cache } from "react";
import { getTranslations } from "next-intl/server";

import StandaloneListingPhotoPage from "@/components/StandaloneListingPhotoPage";
import { createClient } from "@/utils/supabase/server";
import { getStoragePublicUrl } from "@/utils/storage";
import { parseListingPhotoPath } from "@/utils/listingPhotoRoute";

type ListingPhotoPageParams = Promise<{
  photoPath?: string[];
  slug: string;
}>;

const getListingData = cache(async (slug: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listing } = await supabase
    .from(user ? "listings_private_data" : "listings_public_data")
    .select()
    .match({ slug })
    .single();

  return { user, listing };
});

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
