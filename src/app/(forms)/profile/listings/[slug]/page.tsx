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
  const t = await getTranslations();
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect_to=/profile/listings/${slug}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  const { data: listing } = await supabase
    .from("listings_private_data")
    .select()
    .eq("owner_id", user.id)
    .match({ slug })
    .single();

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
