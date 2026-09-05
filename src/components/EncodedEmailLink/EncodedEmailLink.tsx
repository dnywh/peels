"use client";

import Link from "next/link";
import StrongLink from "@/components/StrongLink";
import type { PropsWithChildren } from "react";
import { decodeEncodedEmail } from "@/utils/email";

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
  const params = new URLSearchParams();

  if (subject) {
    params.set("subject", subject);
  }

  if (body) {
    params.set("body", body);
  }

  const query = params.toString();
  const href = `mailto:${decodedEmail}${query ? `?${query}` : ""}`;

  if (as === "plain") {
    return <Link href={href}>{children}</Link>;
  }

  return (
    <StrongLink as="anchor" href={href}>
      {children}
    </StrongLink>
  );
}
