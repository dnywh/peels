
// import { signOutAction } from "@/app/actions";
import { signOutAction, deleteAccountAction, updateEmailAction, sendPasswordResetEmailAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";

import ProfileHeader from "@/components/ProfileHeader";

import ProfileAccountSettings from "@/components/ProfileAccountSettings";
import ProfileListings from "@/components/ProfileListings";
import LegalFooter from "@/components/LegalFooter";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

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

export default async function ProfilePage({ searchParams }) {
  const message = (await searchParams)?.message
  const error = (await searchParams)?.error

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
      {message && <p>Message: {message}</p>}
      {error && <p>Error: {error}</p>}

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
        <h2>Actions</h2>
        <SectionInner>
          <ul>
            <li>
              Sign out<br />
              Goodbye for now!
              <br />
              <Button
                variant="secondary"
                onClick={signOutAction}
              >
                Sign out
              </Button>
            </li>

            <li>
              Export data<br />
              Get a copy of your Peels data
              <br />
              <ButtonToDialog
                variant="secondary"
                initialButtonText="Export data"
                dialogTitle="Coming soon"
                cancelButtonText="Done"
              >
                We’re still working on this feature. In the meantime, <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">reach out</EncodedEmailHyperlink> and ask us to export your data manually.
              </ButtonToDialog>
            </li>
            <li>
              Manage emails<br />
              Control which emails you receive
              <br />
              <ButtonToDialog
                variant="secondary"
                initialButtonText="Manage emails"
                dialogTitle="Coming soon"
                cancelButtonText="Done"
              >
                We’re still working on this feature. In the meantime, <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">reach out</EncodedEmailHyperlink> and ask us to turn email notifications on or off manually.
              </ButtonToDialog>
            </li>
            <li>
              Delete account<br />
              Delete your account{listings?.length > 0 && `, ${listings.length > 1 ? "listings" : "listing"},`} and all your data
              <br />
              <ButtonToDialog
                initialButtonText="Delete account"
                dialogTitle="Delete account"
                confirmButtonText={`Yes, delete my account ${listings.length > 0 && `and listing${listings.length > 1 ? "s" : ""}`}`}
                action={deleteAccountAction}
              >
                Are you sure you want to delete your account? {listings?.length > 0 && (
                  <>
                    Your listing{listings.length > 1 ? "s" : ""} will also be deleted.
                  </>
                )}
              </ButtonToDialog>
            </li>
          </ul>
        </SectionInner>
      </Section>




      <LegalFooter />
    </>
  );
}

