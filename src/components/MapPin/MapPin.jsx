import { styled } from "@pigment-css/react";

const UnselectedPin = styled("div")(({ theme }) => ({
  cursor: "pointer",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const UnselectedPinInner = styled("div")(({ theme }) => ({
  boxShadow: `0 0 0 3px ${theme.colors.marker.border}`,
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: theme.colors.marker.background.receive,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.10)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",
  transition: "transform 80ms ease-in-out",

  "&:hover": {
    transform: "scale(1.065)",
  },
}));

const SelectedPin = styled("div")(({ theme }) => ({
  // cursor: "pointer",
  display: "flex",
  // flexDirection: "column",
  // justifyContent: "center",
  // alignItems: "center",
  // width: "48px",
  // height: "48px",
  // borderRadius: "50%",
}));

const SelectedPinInner = styled("div")(({ theme }) => ({
  boxShadow: `0 0 0 3px ${theme.colors.border.base}`,
  backgroundColor: theme.colors.marker.background.receive,
}));

const SelectedPinRing = styled("div")(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: `color-mix(in srgb, ${theme.colors.marker.background.receive} 30%, black 10%)`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const SelectedPinDot = styled("div")(({ theme }) => ({
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "50%",
  backgroundColor: theme.colors.marker.dot,
  boxShadow: `0 0 1px 1px ${theme.colors.border.elevated}`,
}));

const SelectedPinIcon = styled("svg")(({ theme }) => ({
  fill: theme.colors.marker.background.receive,
  stroke: theme.colors.marker.border,
  strokeWidth: "1.5px",
  overflow: "visible",
  width: "3.25rem",
  position: "absolute",
  top: "-0.2rem",
  left: "0",
  transform: "translate(calc(40px - 1.625rem), -50%)",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.12)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",
}));

const ICON = `M18.149 15.8139C18.2078 15.7251 18.2326 15.6533 18.2915 15.5646C19.3387 13.9878 20 12.0412 20 10C20 4.4 15.5 0 10 0C4.5 0 0 4.5 0 10C0 11.8662 0.522404 13.6453 1.40473 15.0937C1.52799 15.296 1.62851 15.5285 1.79602 15.696C1.79734 15.6974 1.79867 15.6987 1.8 15.7C1.90535 15.8054 1.94349 15.9666 2.02739 16.0897C2.18874 16.3264 2.36323 16.5632 2.6 16.8C4.5396 19.1126 7.70356 22.2044 9.18572 23.6258C9.64236 24.0637 10.3577 24.0638 10.8151 23.6266C12.2976 22.2097 15.4607 19.1376 17.4 16.9C17.5711 16.6433 17.8155 16.3866 18.0078 16.1299C18.07 16.0467 18.0918 15.9006 18.149 15.8139Z`;

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

  if (selected) {
    return (
      <SelectedPin>
        {/* <SelectedPinInner /> */}
        <SelectedPinRing>
          <SelectedPinDot />
        </SelectedPinRing>

        <SelectedPinIcon viewBox="0 0 20 24">
          <path d={ICON} />
        </SelectedPinIcon>
      </SelectedPin>
    );
  }
  // Unselected
  return (
    <UnselectedPin>
      <UnselectedPinInner />
    </UnselectedPin>
  );
}
export default MapPin;
