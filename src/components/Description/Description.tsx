import { Description as HeadlessDescription } from "@headlessui/react";
import { styled } from "next-yak";
import type { ComponentProps, PropsWithChildren } from "react";

const StyledDescription = styled(HeadlessDescription)``;

type DescriptionProps = PropsWithChildren<
  ComponentProps<typeof HeadlessDescription>
>;

export default function Description({ children, ...props }: DescriptionProps) {
  return (
    <StyledDescription {...props}>
      <small>{children}</small>
    </StyledDescription>
  );
}
