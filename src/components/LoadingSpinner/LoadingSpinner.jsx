import React from "react";

function LoadingSpinner() {
  return (
    <div
      style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 1000 }}
    >
      Loading...
    </div>
  );
}

export default LoadingSpinner;
