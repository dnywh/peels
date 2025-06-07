import Link from "next/link";
import {
  sharedSectionTextBlockStyles,
  sharedAnchorTagStyles,
} from "@/styles/commonStyles";
import ChevronRightIcon from "@/components/ChevronRightIcon";
import { styled } from "@pigment-css/react";

function StaticPageHeader({
  title,
  subtitle,
  parent,
}: {
  title: any;
  subtitle: any;
  parent?: any;
}) {
  return (
    <Header>
      {parent ? (
        <StyledLink href="./" aria-label={`Back to ${parent}`}>
          {parent} <ChevronRightIcon size={16} />
        </StyledLink>
      ) : undefined}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </Header>
  );
}

export default StaticPageHeader;

const Header = styled("header")(({ theme }) => ({
  margin: "5rem auto 3rem",

  ...sharedSectionTextBlockStyles({ theme }),
  maxWidth: theme.spacing.container.maxWidth.media,

  "& h1": {
    // fontSize: "3.5rem",
    // color: theme.colors.text.primary,

    // Forked from index page.js
    // TODO: consolidate or separate properly
    maxWidth: "24ch",
    fontSize: "3rem",
    letterSpacing: "-0.03em",
    lineHeight: "1.05",
    fontWeight: "775",
    color: theme.colors.text.primary,

    "@media (min-width: 768px)": {
      // fontSize: "4.75rem",
      fontSize: "4rem",
    },
  },

  "& p": {
    fontSize: "1.25rem",
    color: theme.colors.text.tertiary,

    "& a": {
      ...sharedAnchorTagStyles({ theme }),
    },
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  ...sharedAnchorTagStyles({ theme }),
  display: "flex",
  alignItems: "center",
  gap: "0.125rem",
  color: theme.colors.text.ui.quinary, // theme.colors.text.tertiary,
  transition: theme.transitions.textColor,

  "& svg": {
    stroke: theme.colors.text.ui.quinary,
    transition: theme.transitions.svgColor,
  },

  "&:hover": {
    color: theme.colors.text.ui.emptyState,
    "& svg": {
      stroke: theme.colors.text.ui.emptyState,
    },
  },
}));
