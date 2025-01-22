// Required for MDX in Next. See: https://nextjs.org/docs/app/building-your-application/configuring/mdx
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
