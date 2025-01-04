import TabBarTab from "@/components/TabBarTab";
function TabBarLeft({ ...props }) {
  return (
    <div {...props}>
      <nav className="flex flex-col gap-2">
        <TabBarTab title="Peels" icon="P" href="/" />
        <TabBarTab title="Map" icon="M" href="/map" />
        <TabBarTab title="Chats" icon="C" href="/chats" />
        <TabBarTab title="Profile" icon="P" href="/profile" />
      </nav>
    </div>
  );
}
export default TabBarLeft;
