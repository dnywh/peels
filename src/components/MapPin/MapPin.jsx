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
  // width: "200px",
  // height: "200px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

function MapPin({
  selected = false,
  coarse = false,
  zoomLevel = null,
  distanceAcrossMapWidth = 0,
  mapWidth = 0,
}) {
  // console.log("zoomLevel", zoomLevel);
  const basicSize = 2 ** (zoomLevel * 0.565);
  // const size = 1000 / (1 + Math.exp(-10 * (zoomLevel - 10)));
  // const size = 100 * zoomLevel ** 0.5;

  // at 14 zoom level, size is 20
  //at 22 zoom level, size is 100

  const km = 0.5;
  const smartSize = (mapWidth / distanceAcrossMapWidth) * km;

  // console.log("size", smartSize, "zoomLevel", zoomLevel);
  // console.log(distanceAcrossMapWidth, mapWidth, { smartSize });

  return (
    <div
      style={
        coarse
          ? {
              ...pinStyleCoarse,
              width: `${smartSize}px`,
              height: `${smartSize}px`,
            }
          : undefined
      }
    >
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
