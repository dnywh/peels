// Server Component
import AvatarRead from "@/components/AvatarRead";
import ProfileNav from "@/components/ProfileNav";
import ProfileData from "@/components/ProfileData";
import LegalFooter from "@/components/LegalFooter";
import { signOutAction } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import { styled } from "@pigment-css/react";

const ProfileSidebarContainer = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "2rem",
  padding: "1rem",
  "@media (min-width: 768px)": {
    padding: "0",
    width: "18rem",
    position: "sticky",
    top: 0,
  },

  '[data-subpage="true"] &': {
    display: "none",
    "@media (min-width: 768px)": {
      display: "flex",
    },
  },
});

const AvatarSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "@media (min-width: 768px)": {
    display: "none",
  },
});

const Section = styled("div")({
  border: "1px solid #e0e0e0",
  borderRadius: "0.5rem",
  padding: "1rem",
});

export default function ProfileSidebar() {
  return (
    <ProfileSidebarContainer>
      <AvatarSection>
        <AvatarRead />
        <h1>Name</h1>
      </AvatarSection>

      <Section>
        <h2>Settings</h2>
        <ProfileNav />
      </Section>

      <Section>
        <ProfileData />
      </Section>

      <form action={signOutAction}>
        <SubmitButton>Sign out</SubmitButton>
      </form>
      <LegalFooter />
    </ProfileSidebarContainer>
  );
}
