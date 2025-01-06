"use client";
import { usePathname } from "next/navigation";
import PeelsTab from "@/components/PeelsTab";
import TabBarTab from "@/components/TabBarTab";

import { styled } from "@pigment-css/react";

// const STYLES = {
//   sm: {
//     container: "fixed bottom-0 left-0 right-0 h-20 border-t border-gray-200",
//     nav: "h-full bg-white/95 backdrop-blur-sm p-2 flex justify-between items-center stretch",
//   },
//   md: {
//     container: "",
//     nav: "flex flex-col gap-2",
//   },
// };

const StyledTabBar = styled("div")({
  background: "yellow",
  // "fixed bottom-0 left-0 right-0 h-20 border-t border-gray-200",

  variants: [
    {
      props: { breakpoint: "sm" },
      style: {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        height: "80px",
        borderTop: "1px solid #e0e0e0",
        touchAction: "none",
        display: "block",
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
        },
      },
    },
    {
      props: { position: "floating", breakpoint: "md" },
      style: {
        position: "fixed",
        background: "red",
        top: "4px",
        left: "4px",
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

  "@media (min-width: 768px)": {
    width: "fit-content",
    height: "fit-content",
    borderTop: "none",
    touchAction: "auto",
  },
});

const StyledTabBarNav = styled("nav")({
  // "h-full bg-white/95 backdrop-blur-sm p-2 flex justify-between items-center stretch",
  height: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  "@media (min-width: 768px)": {
    // "flex flex-col gap-2",
    height: "auto",
    flexDirection: "column",
    gap: "2px",
  },
});

const NAVIGATION_ITEMS = [
  { title: "Map", icon: "M", href: "/map" },
  { title: "Chats", icon: "C", href: "/chats" },
  { title: "Profile", icon: "P", href: "/profile" },
];

function TabBar({ breakpoint = "sm", position = "inline", ...props }) {
  const pathname = usePathname();

  return (
    <StyledTabBar
      // className={`${STYLES[breakpoint].container} ${className}`.trim()}
      breakpoint={breakpoint}
      position={position}
      {...props}
    >
      <StyledTabBarNav
      // className={STYLES[breakpoint].nav}
      >
        {breakpoint === "md" && <PeelsTab />}
        {NAVIGATION_ITEMS.map(({ title, icon, href }) => (
          <TabBarTab
            key={href}
            title={title}
            icon={icon}
            href={href}
            active={pathname.startsWith(href)}
          />
        ))}
      </StyledTabBarNav>
    </StyledTabBar>
  );
}

export default TabBar;
