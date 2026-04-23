import { createClient } from "@/utils/supabase/server";
import {
  deleteAccountAction,
  sendEmailChangeEmailAction,
  signOutAction,
  updateFirstNameAction,
  updateNewsletterPreferenceAction,
  updatePreferredLocaleAction,
} from "@/app/actions";
import { theme } from "@/styles/theme.yak";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileAccountSettings from "@/components/ProfileAccountSettings";
import ProfileListings from "@/components/ProfileListings";
import ProfileActions from "@/components/ProfileActions";
import SiteFooter from "@/components/SiteFooter";
import { styled } from "next-yak";
import { Suspense } from "react";
import Toast from "@/components/Toast";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { defaultLocale, normaliseLocale } from "@/i18n/config";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Profile.sections");

  return {
    title: t("account"),
    openGraph: {
      title: `${t("account")} · ${siteConfig.name}`,
    },
  };
}

// Keep URL-based feedback in a client leaf so server rendering is driven by auth/data only.
export default async function ProfilePage() {
  const t = await getTranslations("Profile.sections");
  const supabase = await createClient();
  // Get the authenticated user first, then fetch profile data in parallel.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

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

  const userMetadataPreferredLocale = user?.user_metadata?.preferred_locale;
  const preferredLocale =
    normaliseLocale(profile?.preferred_locale) ??
    (typeof userMetadataPreferredLocale === "string"
      ? normaliseLocale(userMetadataPreferredLocale)
      : undefined) ??
    defaultLocale;

  return (
    <>
      <Suspense>
        <Toast />
      </Suspense>

      <NakedSection>
        <ProfileHeader profile={profile} user={user} />
      </NakedSection>

      <Section>
        <h2>{t("listings")}</h2>
        <ProfileListings user={user} profile={profile} listings={listings} />
      </Section>

      <Section>
        <h2>{t("account")}</h2>
        <ProfileAccountSettings
          user={{ email: user.email ?? "" }}
          profile={{
            ...(profile ?? {}),
            preferred_locale: preferredLocale,
          }}
          updateFirstNameAction={updateFirstNameAction}
          sendEmailChangeEmailAction={sendEmailChangeEmailAction}
          updateNewsletterPreferenceAction={updateNewsletterPreferenceAction}
          updatePreferredLocaleAction={updatePreferredLocaleAction}
        />
      </Section>

      <Section>
        <h2>{t("actions")}</h2>
        <ProfileActions
          listings={listings ?? undefined}
          signOutAction={signOutAction}
          deleteAccountAction={deleteAccountAction}
        />
      </Section>

      <SiteFooter />
    </>
  );
}

const NakedSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
  padding: calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 1.5)
    calc(${theme.spacing.unit} * 1.5);
  & > h2 {
    font-size: 1.5rem;
    margin-left: calc(${theme.spacing.unit} * 1.5);
  }
`;
