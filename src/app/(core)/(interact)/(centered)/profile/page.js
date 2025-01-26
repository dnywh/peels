import { createClient } from "@/utils/supabase/server";

import ProfileHeader from "@/components/ProfileHeader";
import ProfileAccountSettings from "@/components/ProfileAccountSettings";
import ProfileListings from "@/components/ProfileListings";
import ProfileActions from "@/components/ProfileActions";
import LegalFooter from "@/components/LegalFooter";

import { styled } from "@pigment-css/react";

export const metadata = {
  title: 'Profile',
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

// This page could be static instead of dynamic by handling searchParams in a client component instead and using Suspense here. See the homepage and Toast component as an example.
export default async function ProfilePage({ searchParams }) {
  const message = (await searchParams)?.message
  const error = (await searchParams)?.error

  const supabase = await createClient();
  // Get user data and listings in one query
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings_with_owner_data")
    .select()
    .eq("owner_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();


  return (
    <>
      {message && <p>Message: {message}</p>}
      {error && <p>Error: {error}</p>}

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

