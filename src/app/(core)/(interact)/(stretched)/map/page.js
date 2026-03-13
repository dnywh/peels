import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "@/config/site";
import { generateListingMetadata } from "@/utils/listingUtils";
import MapPageClient from "@/components/MapPageClient";
import { cache } from "react";

// Fetch data only once and use across metadata and page
const getInitialData = cache(async (listingSlug) => {
  const supabase = await createClient();

  // Get user first
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Then get listing data if slug exists
  const listingResponse = listingSlug
    ? await supabase
        .from(user ? "listings_private_data" : "listings_public_data")
        .select()
        .eq("slug", listingSlug)
        .single()
    : null;

  return {
    user,
    listing: listingResponse?.data,
  };
});

export async function generateMetadata({ searchParams }) {
  const listingSlug = (await searchParams)?.listing;

  if (!listingSlug) {
    return {
      title: "Map",
      openGraph: {
        title: `Map · ${siteConfig.name}`,
      },
    };
  }

  const { user, listing } = await getInitialData(listingSlug);

  // Use shared utility to generate metadata
  return generateListingMetadata(listing, user);
}

export default async function Page({ searchParams }) {
  const listingSlug = (await searchParams)?.listing;
  const { user, listing } = await getInitialData(listingSlug);

  return (
    <MapPageClient
      user={user}
      initialListingSlug={listingSlug}
      initialListing={listing}
    />
  );
}
