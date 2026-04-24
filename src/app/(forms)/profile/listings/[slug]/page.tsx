import { createClient } from "@/utils/supabase/server";
import FormHeader from "@/components/FormHeader";
import ListingWrite from "@/components/ListingWrite";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

type EditListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Listing",
};

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const [{ slug }, supabase] = await Promise.all([params, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect_to=/profile/listings/${slug}`);
  }

  const [
    t,
    { data: profile, error: profileError },
    { data: listing, error: listingError },
  ] = await Promise.all([
    getTranslations(),
    supabase
      .from("profiles")
      .select("first_name, avatar, is_admin")
      .eq("id", user.id)
      .single(),
    supabase
      .from("listings_private_data")
      .select(
        `
          id,
          avatar,
          name,
          description,
          coordinates,
          country_code,
          area_name,
          accepted_items,
          rejected_items,
          photos,
          links,
          type,
          slug,
          is_stub,
          visibility,
          owner_has_multiple_non_residential_listings
        `
      )
      .eq("owner_id", user.id)
      .match({ slug })
      .maybeSingle(),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (listingError) {
    throw new Error(listingError.message);
  }

  if (!listing) {
    return <div>{t("Listings.edit.notFound")}</div>;
  }

  return (
    <>
      <FormHeader button="back">
        <h1>{t("Listings.edit.title")}</h1>
      </FormHeader>

      <ListingWrite initialListing={listing} user={user} profile={profile} />
    </>
  );
}
