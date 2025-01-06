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

const StyledTabBarNav = styled("nav")({
  height: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  "@media (min-width: 768px)": {
    height: "auto",
    flexDirection: "column",
    gap: "1rem",
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
    <StyledTabBar breakpoint={breakpoint} position={position} {...props}>
      <StyledTabBarNav>
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
