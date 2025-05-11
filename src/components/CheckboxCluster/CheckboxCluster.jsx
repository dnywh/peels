import { styled } from "@pigment-css/react";

const StyledCheckboxCluster = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "0 1rem",

  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.625)`,
  backgroundColor: theme.colors.background.slight,
}));

function CheckboxCluster({ children }) {
  return <StyledCheckboxCluster>{children}</StyledCheckboxCluster>;
}

export default CheckboxCluster;
