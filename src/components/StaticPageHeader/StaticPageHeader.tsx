import { sharedSectionTextBlockStyles } from "@/styles/commonStyles";
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
      {parent && <a href="./">{parent}</a>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </Header>
  );
}

export default StaticPageHeader;

const Header = styled("header")(({ theme }) => ({
  margin: "4rem auto 3rem",

  ...sharedSectionTextBlockStyles({ theme }),
  maxWidth: "720px",

  "& h1": {
    // fontSize: "3.5rem",
    // color: theme.colors.text.primary,

    // Matches index page.js
    // TODO: consolidate or separate properly
    maxWidth: "24ch",
    fontSize: "2.75rem",
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
  },
}));
