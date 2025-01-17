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
  padding: "0 0.25rem", // Inset a little bit from the maxWidth, visually

  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  alignItems: "center",

  variants: [
    {
      props: { button: "none" },
      style: {
        marginTop: "1rem", // Top of the form looks a bit empty without an IconButton, so add some padding in this case.
      },
    },
  ],
}));

const Text = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",

  textAlign: "center",
  position: "relative",
  textWrap: "balance",

  "& h1": {
    fontSize: "2.75rem",
    lineHeight: "1",
    fontWeight: "bold",
    color: theme.colors.text.brand.primary,
  },

  "& p": {
    fontSize: "1rem",
    lineHeight: "120%",
    fontWeight: "normal",
    color: theme.colors.text.ui.secondary,
  },
}));

function FormHeader({ children, button = "back" }) {
  return (
    <Header button={button}>
      {button === "none" ? null : <StyledIconButton button={button} />}
      <PeelsLogo />
      <Text>{children}</Text>
    </Header>
  );
}

export default FormHeader;
