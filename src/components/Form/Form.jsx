import { styled } from "@pigment-css/react";

const getSharedStyles = ({ theme }) => ({
  display: "flex",
  flexDirection: "column",

  variants: [
    {
      props: { nested: true },
      style: {
        gap: "1rem",
      },
    },
    {
      props: { nested: false },
      style: {
        gap: "2rem",
        maxWidth: theme.spacing.forms.maxWidth,
        background: theme.colors.background.top,
        border: `1px solid ${theme.colors.border.base}`,
        borderRadius: theme.corners.base,
        padding: "1.5rem",

        "@media (min-width: 768px)": {
          background: "inherit",
          border: "none",
          borderRadius: "inherit",
          padding: "0",
        },
      },
    },
  ],
});

const StyledForm = styled("form")(getSharedStyles);
const StyledContainer = styled("section")(getSharedStyles, {
  "& p": {
    textAlign: "center",
    textWrap: "balance",
  },
});

function Form({ nested = false, as = "form", children, ...props }) {
  if (as === "container") {
    return (
      <StyledContainer nested={nested} {...props}>
        {children}
      </StyledContainer>
    );
  }

  return (
    <StyledForm nested={nested} {...props}>
      {children}
    </StyledForm>
  );
}

export default Form;
