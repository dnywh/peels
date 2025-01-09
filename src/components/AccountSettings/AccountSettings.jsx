import { styled } from "@pigment-css/react";

const FooBar = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.colors.border.base}`,
  paddingTop: theme.spacing.unit * 4,
  marginTop: theme.spacing.unit * 4,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.unit * 1.5,
}));

function AccountSettings({ children }) {
  return <FooBar>{children}</FooBar>;
}

export default AccountSettings;
