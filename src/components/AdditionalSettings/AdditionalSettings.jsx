import { styled } from "@pigment-css/react";

const FooBar = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.colors.border.base}`,
  paddingTop: `calc(${theme.spacing.unit} * 4)`,
  marginTop: `calc(${theme.spacing.unit} * 4)`,
  display: "flex",
  flexDirection: "column",
  gap: `calc(${theme.spacing.unit} * 1.5)`,
}));

function AdditionalSettings({ children }) {
  return <FooBar>{children}</FooBar>;
}

export default AdditionalSettings;
