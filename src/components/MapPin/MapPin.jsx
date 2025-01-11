import MapBusinessIcon from "../MapBusinessIcon";
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
  boxShadow: `0 0 0 2.5px ${theme.colors.marker.border}`,
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: theme.colors.text.tertiary, // Backup background color for when type is not specified
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.10)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",
  transition: "transform 80ms ease-in-out",

  "&:hover": {
    transform: "scale(1.065)",
  },

  variants: [
    {
      props: { type: "residential" },
      style: {
        backgroundColor: theme.colors.marker.background.residential,
      },
    },
    {
      props: { type: "community" },
      style: {
        backgroundColor: theme.colors.marker.background.community,
      },
    },
    {
      props: { type: "business" },
      style: {
        backgroundColor: theme.colors.marker.background.business,
      },
    },
  ],
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
  backgroundColor: theme.colors.marker.background.residential,
}));

const SelectedPinRing = styled("div")(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: `color-mix(in srgb, ${theme.colors.marker.background.residential} 30%, black 10%)`,
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
  fill: theme.colors.marker.background.residential,
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

const SelectedPinVisual = styled("svg")(({ theme }) => ({
  fill: theme.colors.marker.dot,
  width: "3.25rem",
  position: "absolute",
  top: "-0.55rem",
  left: "0",
  transform: "translate(calc(40px - 1.625rem), -50%)",
}));

const UnselectedPinVisual = styled("svg")(({ theme }) => ({
  // opacity: 0,
  fill: theme.colors.marker.dot,
  width: "0.825rem",
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
  type,
  zoomLevel = null,
  distanceAcrossMapWidth = 0,
  mapWidth = 0,
}) {
  console.log(type);
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
        <SelectedPinVisual width="28" height="25" viewBox="0 0 28 25">
          <path d="M14.9908 20.9385C14.5433 19.2884 15.3619 17.4999 15.4095 17.3982C12.9103 22.7012 4.36932 27.6935 0.270306 21.4206C-0.186555 20.3373 0.729951 20.4571 1.24906 20.8029C1.76802 21.1484 2.82759 21.6021 3.44754 21.7628C7.71202 22.8686 9.78804 15.4122 10.4849 12.4108C11.0886 9.81002 11.6648 5.98332 14.0918 4.39126C14.3037 4.25226 14.5313 4.13674 14.7225 3.96818C15.2179 3.52429 15.4587 2.51547 15.6017 1.89945C15.6866 1.53318 15.738 1.12733 15.9598 0.812548C16.2495 0.401349 16.826 0.315992 17.283 0.461713C17.9114 0.662099 18.1417 1.30716 17.9068 1.90938C17.7026 2.42001 17.4518 2.91455 17.291 3.4417C17.1271 3.97915 17.0757 4.49697 17.274 4.97245C17.8631 6.38362 18.1223 7.93187 17.941 9.45501C17.6545 11.7926 16.8076 14.1777 16.9478 16.5502C17.1415 19.8377 20.332 21.8607 23.4304 21.7436C24.3236 21.7098 25.4077 21.5626 26.6731 20.9385C27.234 20.6514 28.3289 21.1232 27.617 21.7496C24.5741 24.4161 16.4638 26.3697 14.9908 20.9385Z" />
          <path d="M7.44926 17.8197C7.95288 16.7416 8.35278 15.5891 8.66083 14.5529C7.04742 14.0547 6.38445 12.7261 5.77392 11.1603C5.02357 9.23457 4.40513 9.92251 4.43631 11.863C4.47088 14.0144 5.65862 16.423 7.44926 17.8197Z" />
        </SelectedPinVisual>
      </SelectedPin>
    );
  }
  // Unselected
  return (
    <UnselectedPin>
      <UnselectedPinInner type={type}>
        <UnselectedPinVisual width="28" height="25" viewBox="0 0 28 25">
          <path d="M14.9908 20.9385C14.5433 19.2884 15.3619 17.4999 15.4095 17.3982C12.9103 22.7012 4.36932 27.6935 0.270306 21.4206C-0.186555 20.3373 0.729951 20.4571 1.24906 20.8029C1.76802 21.1484 2.82759 21.6021 3.44754 21.7628C7.71202 22.8686 9.78804 15.4122 10.4849 12.4108C11.0886 9.81002 11.6648 5.98332 14.0918 4.39126C14.3037 4.25226 14.5313 4.13674 14.7225 3.96818C15.2179 3.52429 15.4587 2.51547 15.6017 1.89945C15.6866 1.53318 15.738 1.12733 15.9598 0.812548C16.2495 0.401349 16.826 0.315992 17.283 0.461713C17.9114 0.662099 18.1417 1.30716 17.9068 1.90938C17.7026 2.42001 17.4518 2.91455 17.291 3.4417C17.1271 3.97915 17.0757 4.49697 17.274 4.97245C17.8631 6.38362 18.1223 7.93187 17.941 9.45501C17.6545 11.7926 16.8076 14.1777 16.9478 16.5502C17.1415 19.8377 20.332 21.8607 23.4304 21.7436C24.3236 21.7098 25.4077 21.5626 26.6731 20.9385C27.234 20.6514 28.3289 21.1232 27.617 21.7496C24.5741 24.4161 16.4638 26.3697 14.9908 20.9385Z" />
          <path d="M7.44926 17.8197C7.95288 16.7416 8.35278 15.5891 8.66083 14.5529C7.04742 14.0547 6.38445 12.7261 5.77392 11.1603C5.02357 9.23457 4.40513 9.92251 4.43631 11.863C4.47088 14.0144 5.65862 16.423 7.44926 17.8197Z" />
        </UnselectedPinVisual>
      </UnselectedPinInner>
    </UnselectedPin>
  );
}
export default MapPin;
