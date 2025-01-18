
import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";

import ProfileHeader from "@/components/ProfileHeader";

import ProfileAccountSettings from "@/components/ProfileAccountSettings";
import ProfileListings from "@/components/ProfileListings";
import LegalFooter from "@/components/LegalFooter";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";

import Form from "@/components/Form";
import Input from "@/components/Input";

import { styled } from "@pigment-css/react";

export const metadata = {
  title: 'Profile',
}

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const SectionInner = styled("div")(({ theme }) => ({
  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: `calc(${theme.spacing.unit} * 3)`,
}));

export default async function ProfilePage() {
  const supabase = await createClient();
  // Get user data and listings in one query
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select()
    .eq("owner_id", user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();


  return (
    <>
      <Section>
        <ProfileHeader profile={profile} user={user} />
      </Section>

      <Section>
        <h2>Listings</h2>
        <SectionInner>
          <ProfileListings firstName={profile?.first_name} listings={listings} />
        </SectionInner>
      </Section>

      <Section>
        <h2>Account</h2>
        <SectionInner>
          <ProfileAccountSettings user={user} profile={profile} />
        </SectionInner>
      </Section>

      <Section>
        <h2>Danger zone</h2>
        <SectionInner>
          <ul>
            <li>Turn off emails</li>
            <li>Delete account</li>
          </ul>
        </SectionInner>
      </Section>

      <form action={signOutAction}>
        <SubmitButton
          pendingText="Signing out..."
          variant="secondary"
          width="full"
        >
          Sign out
        </SubmitButton>
      </form>
      <LegalFooter />
    </>
  );
}

