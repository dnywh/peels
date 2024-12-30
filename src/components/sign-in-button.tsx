"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";

// Whitelist of allowed redirect paths
// const ALLOWED_REDIRECTS = ["/map", "/chats", "/profile"];

export default function SignInButton() {
  const pathname = usePathname();

  // Only include from parameter if the current path is in our whitelist
  // const href = ALLOWED_REDIRECTS.includes(pathname)
  //   ? `/sign-in?from=${pathname}`
  //   : "/sign-in";
  const href = `/sign-in?from=${pathname}`;

  return (
    <Button asChild size="sm" variant={"outline"}>
      <Link href={href}>Sign in</Link>
    </Button>
  );
}
