"use client";
import { usePathname } from "next/navigation";
import IconButton from "@/components/IconButton";
import { useRouter } from "next/navigation";
import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  //   width: "100%",
  flex: 1,
  alignItems: "flex-start",
  // maxWidth: "960px", // Should be applied to children (perhaps as a wrapper) and shared with Listings page

  "@media (min-width: 768px)": {
    justifyContent: "center",
    flexDirection: "row",
  },
  // Optically center the content once the screen width is greater than tab bar + left column + main column width
  // Calculate this dynamically rather than guessing the tab bar width (and gutters, etc) as 2rem
  "@media (min-width: 1200px)": {
    // Turned off because it also affects dialogs (e.g. delete account dialog)
    // transform: "translateX(-2rem)", // Should be more exactly calculated from TabBar width (and account for gutters, etc) and also shared with Listings page
  },
});

const ProfileMain = styled("main")(({ theme }) => ({
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  backgroundColor: theme.colors.background.top,

  padding: `calc(${theme.spacing.unit} * 3)`,

  width: "100%",

  "@media (min-width: 768px)": {
    maxWidth: "40rem",
  },
}));

export default function ProfileLayoutClient({ children, sidebar }) {
  const pathname = usePathname();
  const isSubpage = pathname !== "/profile";
  const router = useRouter();
  return (
    <ProfilePageLayout data-subpage={isSubpage}>
      {sidebar}

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
