"use client";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useTabBar } from "@/contexts/TabBarContext";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import PeelsTab from "@/components/PeelsTab";
import TabBarTab from "@/components/TabBarTab";
import MapIcon from "@/components/MapIcon";
import ChatsIcon from "@/components/ChatsIcon";
import ProfileIcon from "@/components/ProfileIcon";
import AboutIcon from "@/components/AboutIcon";

import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { HTMLAttributes } from "react";

type TabBarBreakpoint = "sm" | "md";
type TabBarPosition = "fixed" | "inline" | "dynamic" | "inherit";

const smallBreakpointStyles = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 ${theme.spacing.tabBar.marginX} ${theme.spacing.tabBar.marginBottom};
  touch-action: none;
  display: flex;
  justify-content: center;
  z-index: 3;

  @media (min-width: 768px) {
    display: none;
  }
`;

const mediumBreakpointStyles = css`
  display: none;

  @media (min-width: 768px) {
    display: unset;
    width: fit-content;
    height: fit-content;
    border-top: none;
    touch-action: auto;
  }
`;

const fixedPositionStyles = css`
  position: fixed;
  top: calc(1.5rem - 0.75rem);
  left: calc(1.5rem - 0.75rem);
  padding: 0.75rem;
  border-radius: 1rem;
  bottom: unset;
  right: unset;
  background-color: color-mix(
    in srgb,
    ${theme.colors.background.sunk} 80%,
    transparent
  );
  backdrop-filter: blur(1.5rem);
  z-index: 3;
`;

const inlinePositionStyles = css`
  position: sticky;
  top: 1.5rem;
`;

const dynamicPositionStyles = css`
  position: sticky;
  top: 1.5rem;

  @media (min-width: 960px) {
    position: fixed;
    top: 1.5rem;
  }
`;

const StyledTabBar = styled.div<{
  $breakpoint?: TabBarBreakpoint;
  $position?: TabBarPosition;
}>`
  ${({ $breakpoint }) =>
    $breakpoint === "md" ? mediumBreakpointStyles : smallBreakpointStyles}

  ${({ $breakpoint, $position }) => {
    if ($breakpoint !== "md") return "";
    if ($position === "fixed") return fixedPositionStyles;
    if ($position === "inline") return inlinePositionStyles;
    if ($position === "dynamic") return dynamicPositionStyles;
    return "";
  }}
`;

const StyledTabBarNav = styled.nav`
  flex: 1;
  height: 4rem;
  max-width: ${theme.spacing.tabBar.maxWidth};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${theme.colors.background.top};
  border-radius: ${theme.corners.base};
  border: 1px solid ${theme.colors.border.base};
  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    box-shadow: none;
    border: none;
    background-color: transparent;
    border-radius: 0;
    height: auto;
    flex-direction: column;
    gap: 1.5rem;
  }
`;

function TabBar({
  breakpoint = "sm",
  position,
  ...props
}: {
  breakpoint?: TabBarBreakpoint;
  position?: Exclude<TabBarPosition, "inherit">;
} & HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations("App");
  const actionsT = useTranslations("Actions");
  const pathname = usePathname();
  const { tabBarProps } = useTabBar();
  const { shouldShowUnreadIndicator } = useUnreadMessages();

  const NAVIGATION_ITEMS = [
    { title: t("map"), Icon: MapIcon, href: "/map" },
    { title: t("chats"), Icon: ChatsIcon, href: "/chats" },
    { title: t("profile"), Icon: ProfileIcon, href: "/profile" },
  ];

  // Only use visibility prop on small breakpoint. Larger breakpoints should always be visible.
  if (!tabBarProps.visible && breakpoint === "sm") return null;

  // Only use the position prop on larger breakpoints. Smaller breakpoints should always use the default position.
  const resolvedPosition =
    breakpoint === "md" ? position || tabBarProps.position : "inherit";

  return (
    <StyledTabBar
      $breakpoint={breakpoint}
      $position={resolvedPosition}
      {...props}
    >
      <StyledTabBarNav>
        {/* Show 'home' AKA 'about' as the first tab item on larger breakpoints */}
        {breakpoint === "md" && (
          <PeelsTab ariaLabel={actionsT("home")} size={32} />
        )}
        {NAVIGATION_ITEMS.map(({ title, Icon, href }) => (
          <TabBarTab
            key={href}
            title={title}
            icon={
              <Icon
                size="24"
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
            title={t("about")}
            icon={
              <AboutIcon
                size="24"
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
