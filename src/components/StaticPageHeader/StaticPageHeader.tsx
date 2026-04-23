import Link from "next/link";
import {
  sharedAnchorTagStyles,
  sharedSectionTextBlockStyles,
} from "@/styles/commonStyles";
import ChevronRightIcon from "@/components/ChevronRightIcon";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

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

const Header = styled.header`
  margin: 5rem auto 3rem;
  ${sharedSectionTextBlockStyles}
  max-width: ${theme.spacing.container.maxWidth.media};

  & h1 {
    max-width: 24ch;
    font-size: 3rem;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-weight: 775;
    color: ${theme.colors.text.primary};

    @media (min-width: 768px) {
      font-size: 4rem;
    }
  }

  & p {
    font-size: 1.25rem;
    color: ${theme.colors.text.tertiary};
  }

  & p a {
    ${sharedAnchorTagStyles}
  }
`;

const StyledLink = styled(Link)`
  ${sharedAnchorTagStyles}
  display: flex;
  align-items: center;
  gap: 0.125rem;
  color: ${theme.colors.text.ui.quinary};
  transition: ${theme.transitions.textColor};

  & svg {
    stroke: ${theme.colors.text.ui.quinary};
    transition: ${theme.transitions.svgColor};
  }

  &:hover {
    color: ${theme.colors.text.ui.emptyState};
  }

  &:hover svg {
    stroke: ${theme.colors.text.ui.emptyState};
  }
`;
