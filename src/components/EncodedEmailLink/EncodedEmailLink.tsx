"use client";

import StrongLink from "@/components/StrongLink";
import type { PropsWithChildren } from "react";
import { decodeEncodedEmail } from "@/utils/email";
import { styled } from "next-yak";

const PlainEmailLink = styled.a`
  color: inherit;

  &:visited {
    color: inherit;
  }
`;

type EncodedEmailLinkProps = PropsWithChildren<{
  as?: "plain" | "strong";
  address: string;
  body?: string;
  subject?: string;
}>;

export default function EncodedEmailLink({
  as = "strong",
  address,
  body,
  children,
  subject,
}: EncodedEmailLinkProps) {
  const decodedEmail = decodeEncodedEmail(address);
  const query = [
    subject && `subject=${encodeURIComponent(subject)}`,
    body && `body=${encodeURIComponent(body)}`,
  ]
    .filter(Boolean)
    .join("&");
  const href = `mailto:${decodedEmail}${query ? `?${query}` : ""}`;

  if (as === "plain") {
    return <PlainEmailLink href={href}>{children}</PlainEmailLink>;
  }

  return (
    <StrongLink as="anchor" href={href}>
      {children}
    </StrongLink>
  );
}
