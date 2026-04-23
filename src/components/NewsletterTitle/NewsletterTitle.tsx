import type { PropsWithChildren } from "react";

function NewsletterTitle({ children }: PropsWithChildren) {
  return <h1>{children}</h1>;
}

export default NewsletterTitle;
