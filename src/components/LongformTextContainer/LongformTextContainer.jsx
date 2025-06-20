import { styled } from "@pigment-css/react";

// Often used for MD files like newsletter issues, privacy policy, colophon, etc
function LongformTextContainer({ children }) {
  return <StyledLongformTextContent>{children}</StyledLongformTextContent>;
}

export default LongformTextContainer;

const StyledLongformTextContent = styled("div")(({ theme }) => ({
  // Fully separate from or merge with (legal) Main styles
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.text, // Matches Profile
  margin: "4rem auto 0",
  backgroundColor: theme.colors.background.top,
  padding: "2rem 1.25rem 3.5rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,

  // Match EmailHr
  "& > hr": {
    margin: "2rem 0",
    borderColor: theme.colors.border.elevated,
    borderTopWidth: 1,
    borderBottomWidth: 0,
  },

  "& > h2, > h3, > h4, > h5, > h6": {
    lineHeight: theme.typography.lineHeight.h,
    fontWeight: 500,
    color: theme.colors.text.brand.primary,
  },

  "& > h2": {
    fontSize: "1.5rem",
  },

  "& > h3": {
    fontSize: "1.25rem",
  },

  "& > h4": {
    fontSize: "1.1rem",
  },

  "& > p, & li": {
    fontSize: theme.typography.size.p.md,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.p.md,

    "& > strong": {
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
    "& > h2": {
      fontSize: "1.875rem",
    },
    "& > h3": {
      fontSize: "1.5rem",
    },

    "& > h4": {
      fontSize: "1.25rem",
    },

    "& > p, & li": {
      fontSize: theme.typography.size.p.lg,
      lineHeight: theme.typography.lineHeight.p.lg,
    },
  },
}));
