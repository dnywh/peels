"use client";
import { usePathname } from "next/navigation";
import { styled } from "@pigment-css/react";
import IconButton from "@/components/IconButton";
import { useRouter } from "next/navigation";

const ProfilePageLayout = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  //   width: "100%",
  flex: 1,
  alignItems: "flex-start",
  "@media (min-width: 768px)": {
    flexDirection: "row",
  },
});

const ProfileSidebarContainer = styled("div")({
  padding: "1rem",

  "@media (min-width: 768px)": {
    border: "1px solid #e0e0e0",
    borderRadius: "0.5rem",
    position: "sticky",
    top: 0,
  },

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
});

const ProfileMain = styled("main")({
  padding: "1rem",
  width: "100%",
  maxWidth: "40rem",

  "@media (min-width: 768px)": {
    border: "1px solid #e0e0e0",
    borderRadius: "0.5rem",
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
            breakpoint="sm"
            action="back"
            onClick={() => router.push("/profile")}
          />
        )}
        {children}
      </ProfileMain>
    </ProfilePageLayout>
  );
}
