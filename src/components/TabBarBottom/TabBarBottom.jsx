import TabBarTab from "@/components/TabBarTab";

function TabBarBottom({ ...props }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20" {...props}>
      <nav className=" bg-white/95 backdrop-blur-sm p-2 flex justify-between items-center stretch">
        <TabBarTab title="Map" icon="M" href="/map" />
        <TabBarTab title="Chats" icon="C" href="/chats" />
        <TabBarTab title="Profile" icon="P" href="/profile" />
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

export default TabBarBottom;
