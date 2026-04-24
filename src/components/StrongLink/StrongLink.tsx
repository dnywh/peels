import type { ComponentProps, ReactNode } from "react";
import { css, styled } from "next-yak";

import AppLink from "@/components/AppLink";
import { resolveExternalRel } from "@/utils/linkRel";
import { theme } from "@/styles/theme.yak";

const sharedStyles = css`
  color: ${theme.colors.text.brand.primary};
  font-weight: 500;
  text-decoration: underline;
  transition: opacity 150ms ease-in-out;

  &:visited {
    color: ${theme.colors.text.brand.primary};
  }

  &:hover {
    opacity: 0.65;
  }
`;

const StyledLink = styled(AppLink)`
  ${sharedStyles}
`;

const StyledPlainAnchor = styled.a`
  ${sharedStyles}
`;

type AnchorHTMLProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type NextLinkProps = Omit<ComponentProps<typeof AppLink>, "href">;

type SharedStrongLinkProps = {
  href: string;
  children?: ReactNode;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

// `as="anchor"` renders a plain `<a>` for cases where Next's Link misbehaves
// (e.g. `mailto:` — see https://dannywhite.net/notes/next-link-email/).
// Anything else renders a Next.js Link and forwards Link-specific props.
type StrongLinkProps = SharedStrongLinkProps &
  (({ as?: undefined } & NextLinkProps) | { as: "anchor" });

// Pre-styled anchor element. Defaults `rel="noopener"` whenever
// `target="_blank"` is set (via `resolveExternalRel`) while preserving the
// Referer header, so external sites can still see the traffic is from Peels.
export default function StrongLink(props: StrongLinkProps) {
  const { href, children, target, rel, className, style, onClick } = props;
  const resolvedRel = resolveExternalRel(target, rel);

  if (props.as === "anchor") {
    return (
      <StyledPlainAnchor
        href={href}
        target={target}
        rel={resolvedRel}
        className={className}
        style={style}
        onClick={onClick}
      >
        {children}
      </StyledPlainAnchor>
    );
  }

  // Pull out the shared props so the spread only forwards Link-specific ones.
  const {
    href: _h,
    children: _c,
    target: _t,
    rel: _r,
    className: _cl,
    style: _st,
    onClick: _oc,
    as: _as,
    ...linkProps
  } = props;

  return (
    <StyledLink
      href={href}
      target={target}
      rel={resolvedRel}
      className={className}
      style={style}
      onClick={onClick}
      {...(linkProps as NextLinkProps)}
    >
      {children}
    </StyledLink>
  );
}
