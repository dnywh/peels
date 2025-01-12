"use client";
import { usePathname } from "next/navigation";
import IconButton from "@/components/IconButton";
import { useRouter } from "next/navigation";
import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  //   width: "100%",
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "center",
  "@media (min-width: 768px)": {
    flexDirection: "row",
  },
});

const ProfileMain = styled("main")(({ theme }) => ({
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  backgroundColor: theme.colors.background.top,

  padding: theme.spacing.unit * 3,

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
