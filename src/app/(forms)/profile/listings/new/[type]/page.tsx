import { createClient } from "@/utils/supabase/server";
import ListingWrite from "@/components/ListingWrite";
import FormHeader from "@/components/FormHeader";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ListingType } from "@/types/listing";

type NewListingFormContentProps = {
  params: Promise<{
    type: string;
  }>;
};

const typeConfig: Record<
  ListingType,
  {
    title: string;
    description: string;
  }
> = {
  residential: {
    title: "Add your listing",
    description: "A private residence or similar.",
  },
  community: {
    title: "List your community",
    description:
      "People can drop off food scraps to your community garden, farm, or similar.",
  },
  business: {
    title: "List your business",
    description:
      "People can pick up spent coffee from your cafe, spent hops from your brewery, or similar.",
  },
};

export const metadata: Metadata = {
  title: "Add Listing",
};

function isListingType(type: string): type is ListingType {
  return type === "residential" || type === "community" || type === "business";
}

export default async function NewListingFormContent({
  params,
}: NewListingFormContentProps) {
  const { type } = await params;

  if (!isListingType(type)) {
    notFound();
  }

  const config = typeConfig[type];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect_to=/profile/listings/new/${type}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  return (
    <>
      <FormHeader button="back">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </FormHeader>

      <ListingWrite listingType={type} user={user} profile={profile} />
    </>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ type: "residential" }, { type: "community" }, { type: "business" }];
}
