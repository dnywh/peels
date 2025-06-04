import { styled } from "@pigment-css/react";

function NewsletterBody({ children }) {
  return <Content>{children}</Content>;
}

export default NewsletterBody;

const Content = styled("div")(({ theme }) => ({
  // Fully separate from or merge with (text) Main styles
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxWidth: "512px",
  margin: "4rem auto 0",
  backgroundColor: theme.colors.background.top,
  padding: "2rem 1.25rem 3.5rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,

  // Match EmailHr
  "& hr": {
    margin: "32px 0",
    borderColor: theme.colors.border.elevated,
    borderTopWidth: 1,
  },

  "& h1": {
    fontSize: "2.25rem",
    color: theme.colors.text.primary,
  },

  "& h2, h3, h4, h5, h6": {
    fontWeight: 500,
  },

  "& h2": {
    fontSize: "1.75rem",
  },

  "& h3": {
    fontSize: "1.25rem",
  },

  "& h4": {
    fontSize: "1.25rem",
  },

  "& p, & li": {
    color: theme.colors.text.secondary,
    lineHeight: "160%",
    fontSize: "1rem",

    "& strong": {
      fontWeight: 500,
    },
  },

  "& p + p, & ul + p, & ol + p": {
    marginTop: "1rem",
  },

  "& p + h2, & ul + h2, & ol + h2": {
    marginTop: "2rem",
  },

  "& p + h3, & ul + h3, & ol + h3": {
    marginTop: "1.5rem",
  },

  "& p + h4, & ul + h4, & ol + h4": {
    marginTop: "1rem",
  },

  "& ul, & ol": {
    listStylePosition: "inside",
  },

  "& ul": {
    listStyleType: "disc",
  },

  "& ol": {
    listStyleType: "decimal",
  },

  "& li + li": {
    marginTop: "0.5rem",
  },

  "@media (min-width: 768px)": {
    margin: "4rem auto 3rem",

    "& h1": {
      fontSize: "3rem",
    },
    "& h2": {
      fontSize: "2rem",
    },
    "& h3": {
      fontSize: "1.5rem",
    },

    "& h4": {
      fontSize: "1.25rem",
    },

    "& p, & li": {
      fontSize: "1.25rem",
      lineHeight: "160%",
    },
  },
}));
