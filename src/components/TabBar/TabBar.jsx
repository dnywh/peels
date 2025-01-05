"use client";
import { usePathname } from "next/navigation";
import PeelsTab from "@/components/PeelsTab";
import TabBarTab from "@/components/TabBarTab";

const STYLES = {
  sm: {
    container: "fixed bottom-0 left-0 right-0 h-20",
    nav: "h-full bg-white/95 backdrop-blur-sm p-2 flex justify-between items-center stretch",
  },
  md: {
    container: "",
    nav: "flex flex-col gap-2",
  },
};

const NAVIGATION_ITEMS = [
  { title: "Map", icon: "M", href: "/map" },
  { title: "Chats", icon: "C", href: "/chats" },
  { title: "Profile", icon: "P", href: "/profile" },
];

function TabBar({ breakpoint = "sm", className = "", ...props }) {
  const pathname = usePathname();

  return (
    <div
      className={`${STYLES[breakpoint].container} ${className}`.trim()}
      {...props}
    >
      <nav className={STYLES[breakpoint].nav}>
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
      </nav>
    </div>
  );
}

export default TabBar;
