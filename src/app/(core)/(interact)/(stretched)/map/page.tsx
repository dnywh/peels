import { cache } from "react";
import type { Metadata } from "next/types";

import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "@/config/site";
import { generateListingMetadata } from "@/utils/listingUtils";
import MapPageClient from "@/features/map";
import type { Listing } from "@/types/listing";

type MapPageSearchParams = {
  listing?: string;
};

type MapPageProps = {
  searchParams: Promise<MapPageSearchParams>;
};

const getInitialData = cache(async (listingSlug: string | undefined) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const listingResponse = listingSlug
    ? await supabase
        .from(user ? "listings_private_data" : "listings_public_data")
        .select()
        .eq("slug", listingSlug)
        .single()
    : null;

  return {
    user,
    listing: (listingResponse?.data ?? null) as Listing | null,
  };
});

export async function generateMetadata({
  searchParams,
}: MapPageProps): Promise<Metadata> {
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

  return generateListingMetadata(listing, user);
}

export default async function Page({ searchParams }: MapPageProps) {
  const listingSlug = (await searchParams)?.listing;
  const { user, listing } = await getInitialData(listingSlug);

  return (
    <MapPageClient
      user={user}
      initialListingSlug={listingSlug ?? null}
      initialListing={listing}
    />
  );
}
