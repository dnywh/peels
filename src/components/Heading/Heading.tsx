import { styled } from "next-yak";
import type { HTMLAttributes, ReactNode } from "react";

const Heading1 = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const Heading2 = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const Heading3 = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const Heading4 = styled.h4`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const Heading5 = styled.h5`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;
const Heading6 = styled.h6`
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingLevel;
  children?: ReactNode;
};

function Heading({ as = "h1", children, ...props }: HeadingProps) {
  if (as === "h1") {
    return <Heading1 {...props}>{children}</Heading1>;
  }
  if (as === "h2") {
    return <Heading2 {...props}>{children}</Heading2>;
  }
  if (as === "h3") {
    return <Heading3 {...props}>{children}</Heading3>;
  }
  if (as === "h4") {
    return <Heading4 {...props}>{children}</Heading4>;
  }
  if (as === "h5") {
    return <Heading5 {...props}>{children}</Heading5>;
  }
  if (as === "h6") {
    return <Heading6 {...props}>{children}</Heading6>;
  }

  return null;
}

export default Heading;
