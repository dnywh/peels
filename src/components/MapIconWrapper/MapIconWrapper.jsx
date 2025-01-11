import { styled } from "@pigment-css/react";

const StyledMapIcon = styled("svg")(({ theme }) => ({
  fill: theme.colors.marker.dot,
  width: "0.825rem",
  height: "0.825rem",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.12)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",

  variants: [
    {
      props: { size: "large" },
      style: {
        width: "1.75rem",
        height: "1.75rem",
        position: "absolute",
        top: "-0.55rem",
        left: "0",
        transform: "translate(calc(40px - 0.875rem), -50%)",
      },
    },
  ],
}));

function MapIconWrapper({
  children,
  width = "24",
  height = "24",
  label = "",
  fill = "none",
  size = "normal",
  ...props
}) {
  return (
    <StyledMapIcon
      xmlns="http://www.w3.org/2000/svg"
      // preserveAspectRatio="none" // Failed test to stop jitter on Safari during scale transform
      width={width}
      height={height}
      fill={fill}
      aria-hidden="true"
      aria-label={label}
      role="img"
      size={size}
      overflow="visible"
      {...props}
    >
      {children}
    </StyledMapIcon>
  );
}

export default MapIconWrapper;
