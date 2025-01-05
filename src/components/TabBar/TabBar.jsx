"use client";
import { usePathname } from "next/navigation";

import TabBarTab from "@/components/TabBarTab";

const smStyles = "fixed bottom-0 left-0 right-0 h-20";
const mdStyles = undefined;

const smNavStyles =
  "bg-white/95 backdrop-blur-sm p-2 flex justify-between items-center stretch";
const mdNavStyles = "flex flex-col gap-2";

function TabBar({ breakpoint = "sm", ...props }) {
  const pathname = usePathname();
  return (
    <div className={breakpoint === "sm" ? smStyles : mdStyles} {...props}>
      <nav className={breakpoint === "sm" ? smNavStyles : mdNavStyles}>
        {breakpoint === "md" && <TabBarTab title="Peels" icon="P" href="/" />}
        <TabBarTab
          title="Map"
          icon="M"
          href="/map"
          active={pathname.startsWith("/map")}
        />
        <TabBarTab
          title="Chats"
          icon="C"
          href="/chats"
          active={pathname.startsWith("/chats")}
        />
        <TabBarTab
          title="Profile"
          icon="P"
          href="/profile"
          active={pathname.startsWith("/profile")}
        />
      </nav>
    </div>
  );
}

// Alternative visual style (inset)
// function FloatingTabBar() {
//   <div className="fixed bottom-0 left-0 right-0 h-20 p-2">
//     <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm h-full rounded-md">
//       <div className="w-1/3">Map</div>
//       <div className="w-1/3">Chats</div>
//       <div className="w-1/3">Profile</div>
//     </div>
//   </div>;
// }

export default TabBar;
