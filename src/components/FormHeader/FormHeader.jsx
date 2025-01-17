import IconButton from "@/components/IconButton";
import PeelsLogo from "@/components/PeelsLogo";
import { styled } from "@pigment-css/react";

const StyledIconButton = styled(IconButton)({
  variants: [
    {
      props: { button: "back" },
      style: {
        alignSelf: "flex-start",
      },
    },
    {
      props: { button: "close" },
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
  gap: "0.75rem",
  alignItems: "center",
  textAlign: "center",
  position: "relative",
  textWrap: "balance",
  variants: [
    {
      props: { button: "none" },
      style: {
        marginTop: "1rem", // Top of the form looks a bit empty without an IconButton, so add some padding in this case.
      },
    },
  ],

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

function FormHeader({ children, button = "back" }) {
  return (
    <Header button={button}>
      {button === "none" ? null : <StyledIconButton button={button} />}
      <PeelsLogo />
      {children}
    </Header>
  );
}

export default FormHeader;
