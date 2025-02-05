"use client";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useTabBar } from "@/contexts/TabBarContext";

import { usePathname } from "next/navigation";
import PeelsTab from "@/components/PeelsTab";
import TabBarTab from "@/components/TabBarTab";
import MapIcon from "@/components/MapIcon";
import ChatsIcon from "@/components/ChatsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import AboutIcon from "@/components/AboutIcon";

import { styled } from "@pigment-css/react";

const StyledTabBar = styled("div")(({ theme }) => ({
  variants: [
    {
      props: { breakpoint: "sm" },
      style: {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        margin: `0 ${theme.spacing.tabBar.marginX} ${theme.spacing.tabBar.marginBottom}`,
        touchAction: "none",
        display: "flex",
        justifyContent: "center",
        zIndex: 3,
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
      props: { position: "fixed", breakpoint: "md" },
      style: {
        position: "fixed",
        top: "calc(1.5rem - 0.75rem)", // Visually indentical positioning to non-floating tab bar. Math: (non-floating inset - floating padding)
        left: "calc(1.5rem - 0.75rem)",
        padding: "0.75rem",

        borderRadius: "1rem",
        bottom: "unset",
        right: "unset",
        backgroundColor: `color-mix(in srgb, ${theme.colors.background.sunk} 80%, transparent)`, // Match the page background
        backdropFilter: "blur(1.5rem)",
        zIndex: 3, // Sit above media like the homepage photos
      },
    },
    {
      props: { position: "inline", breakpoint: "md" },
      style: {
        position: "sticky",
        top: "1.5rem",
      },
    },
    {
      props: { position: "dynamic", breakpoint: "md" },
      style: {
        position: "sticky",
        top: "1.5rem",
        "@media (min-width: 960px)": {
          position: "fixed",
          top: "1.5rem",
        },
      },
    },
  ],
}));

const StyledTabBarNav = styled("nav")(({ theme }) => ({
  flex: 1,
  height: "4rem",
  maxWidth: theme.spacing.tabBar.maxWidth,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
  boxShadow: `0px 0px 3px 1px rgba(0, 0, 0, 0.06)`,

  "@media (min-width: 768px)": {
    boxShadow: "none",
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

function TabBar({ breakpoint = "sm", ...props }) {
  const pathname = usePathname();
  const { tabBarProps } = useTabBar();
  const { shouldShowUnreadIndicator } = useUnreadMessages();

  console.log("shouldShowUnreadIndicator", shouldShowUnreadIndicator);

  // Only use visibility prop on small breakpoint. Larger breakpoints should always be visible.
  if (!tabBarProps.visible && breakpoint === "sm") return null;

  // Only use the position prop on larger breakpoints. Smaller breakpoints should always use the default position.
  const position = breakpoint === "md" ? tabBarProps.position : "inherit";

  return (
    <StyledTabBar breakpoint={breakpoint} position={position} {...props}>
      <StyledTabBarNav>
        {/* Show 'home' AKA 'about' as the first tab item on larger breakpoints */}
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
            unreadDot={href === "/chats" && shouldShowUnreadIndicator}
          />
        ))}
        {/* Show 'home' AKA 'about' as the last tab item on smaller breakpoints */}
        {breakpoint === "sm" && (
          <TabBarTab
            title="About"
            icon={
              <AboutIcon
                size={24}
                variant={pathname === "/" ? "solid" : "outline"}
              />
            }
            href="/"
            active={pathname === "/"}
          />
        )}
      </StyledTabBarNav>
    </StyledTabBar>
  );
}

export default TabBar;
