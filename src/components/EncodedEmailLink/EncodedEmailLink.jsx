"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import StrongLink from "@/components/StrongLink";

export default function EncodedEmailLink({
  as = "strong", // Use plain Next Link or styled StrongLink component
  address,
  children,
}) {
  const [decodedEmail, setDecodedEmail] = useState("");

  useEffect(() => {
    const decoded = atob(address);
    setDecodedEmail(decoded);
  }, []);

  // For instances where the email link should visually blend in with its parent and siblings
  if (as === "plain") {
    return <Link href={`mailto:${decodedEmail}`}>{children}</Link>;
  }
  // Otherwise...
  // When the link should be styled like the other pronounced StrongLink component instances
  return (
    <StrongLink as="anchor" href={`mailto:${decodedEmail}`}>
      {children}
    </StrongLink>
  );
}
