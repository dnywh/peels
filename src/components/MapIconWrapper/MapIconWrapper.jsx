import { styled } from "@pigment-css/react";

const StyledMapIcon = styled("svg")(({ theme }) => ({
  fill: theme.colors.marker.dot,
  width: "0.825rem",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.12)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",
}));

function MapIconWrapper({
  children,
  width = "24",
  height = "24",
  label = "",
  fill = "none",
  ...props
}) {
  return (
    <StyledMapIcon
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
      aria-hidden="true"
      aria-label={label}
      role="img"
      {...props}
    >
      {children}
    </StyledMapIcon>
  );
}

export default MapIconWrapper;
