import React from "react";

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyleUnselected = {
  cursor: "pointer",
  fill: "#d00",
  stroke: "none",
};

const pinStyleSelected = {
  cursor: "pointer",
  fill: "blue",
  stroke: "none",
};

const pinStyleCoarse = {
  backgroundColor: "rgba(0, 0, 255, 0.15)",
  borderRadius: "50%",
  width: "200px",
  height: "200px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

function MapPin({ selected = false, coarse = false }) {
  return (
    <div style={coarse ? pinStyleCoarse : undefined}>
      <svg
        height={selected ? 30 : 20}
        viewBox="0 0 24 24"
        style={selected ? pinStyleSelected : pinStyleUnselected}
      >
        <path d={ICON} />
      </svg>
    </div>
  );
}

export default MapPin;
