"use client";
import { usePathname } from "next/navigation";
import { styled } from "@pigment-css/react";
import IconButton from "@/components/IconButton";
import { useRouter } from "next/navigation";

const ProfilePageLayout = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  "@media (min-width: 768px)": {
    flexDirection: "row",
  },
});

const ProfileSidebarContainer = styled("div")({
  '[data-subpage="true"] &': {
    display: "none",
    "@media (min-width: 768px)": {
      display: "block",
    },
  },
});

const ProfileSidebar = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "2rem",
  width: "16rem",
  "@media (min-width: 768px)": {
    position: "sticky",
    top: 0,
    border: "1px solid grey",
  },
});

const ProfileMain = styled("main")({
  flex: 1,
  "[data-desktop-back-button]": {
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
});

export default function ProfileLayoutClient({ children, sidebar }) {
  const pathname = usePathname();
  const isSubpage = pathname !== "/profile";
  const router = useRouter();
  return (
    <ProfilePageLayout data-subpage={isSubpage}>
      <ProfileSidebarContainer>
        <ProfileSidebar>{sidebar}</ProfileSidebar>
      </ProfileSidebarContainer>

      <ProfileMain>
        {isSubpage && (
          <IconButton
            data-desktop-back-button
            action="back"
            onClick={() => router.push("/profile")}
          />
        )}
        {children}
      </ProfileMain>
    </ProfilePageLayout>
  );
}
