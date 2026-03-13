import { createClient } from "@/utils/supabase/server";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileAccountSettings from "@/components/ProfileAccountSettings";
import ProfileListings from "@/components/ProfileListings";
import ProfileActions from "@/components/ProfileActions";
import LegalFooter from "@/components/LegalFooter";
import { styled } from "@pigment-css/react";
import { Suspense } from "react";
import Toast from "@/components/Toast";

export const metadata = {
  title: "Profile",
};

// Keep URL-based feedback in a client leaf so server rendering is driven by auth/data only.
export default async function ProfilePage() {
  const supabase = await createClient();
  // Get the authenticated user first, then fetch profile data in parallel.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: listings }, { data: profile }] = await Promise.all([
    supabase
      // We can access the "listings" table here directly as we have a policy set allowing authenticated owners access to their full listings
      // TODO: but should we? Can we get everything we need from the private_data view?
      .from("listings")
      .select()
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select().eq("id", user.id).single(),
  ]);

  return (
    <>
      <Suspense>
        <Toast />
      </Suspense>

      <NakedSection>
        <ProfileHeader profile={profile} user={user} />
      </NakedSection>

      <Section>
        <h2>Listings</h2>
        <ProfileListings user={user} profile={profile} listings={listings} />
      </Section>

      <Section>
        <h2>Account</h2>
        <ProfileAccountSettings user={user} profile={profile} />
      </Section>

      <Section>
        <h2>Actions</h2>
        <ProfileActions listings={listings} />
      </Section>

      <LegalFooter />
    </>
  );
}

const NakedSection = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: `calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5)`, // + 1.5 units internally, for consistency with other sections that may or may not have hover padding internally

  "& > h2": {
    fontSize: "1.5rem",
    marginLeft: `calc(${theme.spacing.unit} * 1.5)`, // Match above padding
  },
}));
