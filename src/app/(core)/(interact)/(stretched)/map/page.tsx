import { cache } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next/types";

import { createClient } from "@/utils/supabase/server";
import { siteConfig } from "@/config/site";
import { generateListingMetadata } from "@/utils/listingUtils";
import { getListingSeoOptions } from "@/utils/listingSeo";
import { createPeelsMetadata } from "@/utils/seo";
import MapPageClient from "@/features/map";
import type { Listing } from "@/types/listing";
import { parseStoredInitialMapCoordinates } from "@/features/map/lib/mapInitialView";
import { STORED_MAP_VIEW_KEY } from "@/features/map/lib/mapStorageConstants";

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

function parseInitialMapCoordinatesCookie(value: string | undefined) {
  if (!value) return null;

  try {
    return parseStoredInitialMapCoordinates(decodeURIComponent(value));
  } catch {
    return parseStoredInitialMapCoordinates(value);
  }
}

function getMapMetadata() {
  return createPeelsMetadata({
    title: "Map",
    canonicalPath: "/map",
    openGraph: {
      title: `Map · ${siteConfig.name}`,
    },
    twitter: {
      title: `Map · ${siteConfig.name}`,
    },
  });
}

export async function generateMetadata({
  searchParams,
}: MapPageProps): Promise<Metadata> {
  const listingSlug = (await searchParams)?.listing;

  if (!listingSlug) {
    return getMapMetadata();
  }

  const { user, listing } = await getInitialData(listingSlug);

  if (!listing) {
    return getMapMetadata();
  }

  const listingSeoOptions = await getListingSeoOptions();

  return generateListingMetadata(listing, user, listingSeoOptions);
}

export default async function Page({ searchParams }: MapPageProps) {
  const listingSlug = (await searchParams)?.listing;
  const { user, listing } = await getInitialData(listingSlug);
  const referenceNow = new Date().toISOString();
  const storedMapViewCookie = (await cookies()).get(STORED_MAP_VIEW_KEY)?.value;
  const initialMapCoordinates =
    parseInitialMapCoordinatesCookie(storedMapViewCookie);

  return (
    <MapPageClient
      user={user}
      initialListingSlug={listingSlug ?? null}
      initialListing={listing}
      initialMapCoordinates={initialMapCoordinates}
      referenceNow={referenceNow}
    />
  );
}
