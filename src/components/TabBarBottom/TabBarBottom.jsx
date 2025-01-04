function TabBarBottom({ ...props }) {
  return (
    <div {...props}>
      <div className="bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="w-1/3">Map</div>
          <div className="w-1/3">Chats</div>
          <div className="w-1/3">Profile</div>
        </div>
      </div>
    </div>
  );
}

// Alternative
function FloatingTabBar() {
  <div className="fixed bottom-0 left-0 right-0 h-20 p-2">
    <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm h-full rounded-md">
      <div className="w-1/3">Map</div>
      <div className="w-1/3">Chats</div>
      <div className="w-1/3">Profile</div>
    </div>
  </div>;
}

export default TabBarBottom;
