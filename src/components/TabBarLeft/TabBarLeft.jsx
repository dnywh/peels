function TabBarLeft({ ...props }) {
  return (
    <div {...props}>
      <div className="">
        <div className="w-1/3">Map</div>
        <div className="w-1/3">Chats</div>
        <div className="w-1/3">Profile</div>
      </div>
    </div>
  );
}
export default TabBarLeft;
