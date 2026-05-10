import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import {
  generateListingJsonLd,
  generateListingMetadata,
  getAnonymousSensitiveListingTeaser,
  getListingDisplayName,
} from "@/utils/listingUtils";
import { getListingSeoOptions } from "@/utils/listingSeo";
import ListingRead from "@/components/ListingRead";
import JsonLd from "@/components/JsonLd";
import { styled } from "next-yak";
import { cache } from "react";
import { theme } from "@/styles/theme.yak";

type ListingPageParams = Promise<{ slug: string }>;

const StyledMain = styled.main`
  flex: 1;
  margin: 2rem auto;
  max-width: ${theme.spacing.container.maxWidth.text};
  display: flex;
  flex-direction: column;
  gap: 3rem;
  @media (min-width: 768px) {
    margin: 0 auto 2rem;
  }
  @media (min-width: 1280px) {
    gap: 1.5rem;
    max-width: 1024px;
    display: grid;
    grid-template-columns: 7fr 5fr;
  }
  @media (min-width: 1920px) {
    max-width: 1344px;
    grid-template-columns: 8fr 4fr;
  }
`;

const getListingData = cache(async (slug: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listing } = await supabase
    .from(user ? "listing_contact_cards" : "public_listings")
    .select()
    .match({ slug })
    .single();
  return { user, listing };
});

export async function generateMetadata({
  params,
}: {
  params: ListingPageParams;
}) {
  const { slug } = await params;
  const { user, listing } = await getListingData(slug);
  const listingSeoOptions = await getListingSeoOptions();
  // Use shared utility to generate metadata
  return generateListingMetadata(listing, user, {
    ...listingSeoOptions,
    includeFullMetadata: true,
  });
}

export default async function ListingPage({
  params,
}: {
  params: ListingPageParams;
}) {
  const { slug } = await params;
  const { user, listing } = await getListingData(slug);
  const referenceNow = new Date().toISOString();

  if (!listing) {
    notFound();
  }

  const listingSeoOptions = await getListingSeoOptions();
  const listingJsonLd = generateListingJsonLd(listing, user, listingSeoOptions);
  const listingForRead = getAnonymousSensitiveListingTeaser(listing, user);
  const listingDisplayName = getListingDisplayName(
    listingForRead,
    user,
    listingSeoOptions.seoCopy
  );

  // TODO: Return 'Success' toast for folks who have just created a new listing and have been redirected to it, here

  return (
    <StyledMain>
      {listingJsonLd ? <JsonLd data={listingJsonLd} /> : null}
      <ListingRead
        user={user}
        listing={listingForRead}
        listingDisplayName={listingDisplayName}
        referenceNow={referenceNow}
      />
    </StyledMain>
  );
}
