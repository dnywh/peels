"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTabBar } from "@/contexts/TabBarContext";
import IconButton from "@/components/IconButton";
import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  //   width: "100%",
  flex: 1,
  alignItems: "flex-start",
  "@media (min-width: 1200px)": {
    flexDirection: "row",
    justifyContent: "center",
  },
});

const ProfileMain = styled("main")(({ theme }) => ({
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  backgroundColor: theme.colors.background.top,

  padding: theme.spacing.unit * 3,

  width: "100%",

  "@media (min-width: 768px)": {
    width: "inherit",
    maxWidth: "40rem",
  },
}));

export default function ProfileLayoutClient({ children, sidebar }) {
  const pathname = usePathname();
  const isSubpage = pathname !== "/profile";
  const router = useRouter();
  const { setTabBarProps } = useTabBar();

  useEffect(() => {
    setTabBarProps((prev) => ({ ...prev, position: "floating" }));
    return () => setTabBarProps((prev) => ({ ...prev, position: "inherit" }));
  }, [setTabBarProps]);

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
