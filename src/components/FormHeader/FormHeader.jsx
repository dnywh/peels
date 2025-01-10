import IconButton from "@/components/IconButton";
import { styled } from "@pigment-css/react";

const StyledIconButton = styled(IconButton)({
  variants: [
    {
      props: { action: "back" },
      style: {
        alignSelf: "flex-start",
      },
    },
    {
      props: { action: "close" },
      style: {
        alignSelf: "flex-end",
      },
    },
  ],
});

const Header = styled("header")(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing.forms.maxWidth,

  display: "flex",
  flexDirection: "column",
  gap: "0",
  alignItems: "center",
  textAlign: "center",
  position: "relative",

  "& h1": {
    fontSize: "3rem",
    lineHeight: "1",
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },

  "& p": {
    fontSize: "1rem",
    fontWeight: "normal",
    color: theme.colors.text.secondary,
  },
}));

function FormHeader({ children, action = "back" }) {
  return (
    <Header>
      <StyledIconButton action={action} />
      {children}
    </Header>
  );
}

export default FormHeader;
