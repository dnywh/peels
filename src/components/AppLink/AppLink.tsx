import NextLink from "next/link";
import { forwardRef } from "react";
import type { ComponentProps, Ref } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { prefetch = false, ...props },
  ref
) {
  return (
    <NextLink
      {...props}
      prefetch={prefetch}
      ref={ref as Ref<HTMLAnchorElement>}
    />
  );
});

export default AppLink;
