"use client";
import { usePathname } from "next/navigation";
import PeelsTab from "@/components/PeelsTab";
import TabBarTab from "@/components/TabBarTab";
import MapIcon from "@/components/MapIcon";
import ChatsIcon from "@/components/ChatsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import { styled } from "@pigment-css/react";

const StyledTabBar = styled("div")({
  variants: [
    {
      props: { breakpoint: "sm" },
      style: {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        // height: "80px",
        margin: "0 0.75rem 0.75rem",
        touchAction: "none",
        display: "flex",
        justifyContent: "center",
        "@media (min-width: 768px)": {
          display: "none",
        },
      },
    },
    {
      props: { breakpoint: "md" },
      style: {
        display: "none",
        "@media (min-width: 768px)": {
          display: "unset",
          width: "fit-content",
          height: "fit-content",
          borderTop: "none",
          touchAction: "auto",
        },
      },
    },
    {
      props: { position: "floating", breakpoint: "md" },
      style: {
        position: "fixed",
        top: "calc(1.5rem - 0.5rem)", // Visually indentical positining to non-floating tab bar. Math: (non-floating inset - floating padding)
        left: "calc(1.5rem - 0.5rem)",
        padding: "0.5rem",

        borderRadius: "10px",
        bottom: "unset",
        right: "unset",
      },
    },
    {
      props: { position: "inline", breakpoint: "md" },
      style: { position: "relative" },
    },
  ],
});

const StyledTabBarNav = styled("nav")(({ theme }) => ({
  flex: 1,
  height: "4rem",
  maxWidth: theme.spacing.controls.maxWidth,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,

  "@media (min-width: 768px)": {
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "0",

    height: "auto",
    flexDirection: "column",
    gap: "1.5rem",
  },
}));

const NAVIGATION_ITEMS = [
  { title: "Map", Icon: MapIcon, href: "/map" },
  { title: "Chats", Icon: ChatsIcon, href: "/chats" },
  { title: "Profile", Icon: ProfileIcon, href: "/profile" },
];

function TabBar({ breakpoint = "sm", position = "inline", ...props }) {
  const pathname = usePathname();

  return (
    <StyledTabBar breakpoint={breakpoint} position={position} {...props}>
      <StyledTabBarNav>
        {breakpoint === "md" && <PeelsTab size={32} />}
        {NAVIGATION_ITEMS.map(({ title, Icon, href }) => (
          <TabBarTab
            key={href}
            title={title}
            icon={
              <Icon
                size={24}
                variant={pathname.startsWith(href) ? "solid" : "outline"}
              />
            }
            href={href}
            active={pathname.startsWith(href)}
          />
        ))}
      </StyledTabBarNav>
    </StyledTabBar>
  );
}

export default TabBar;
