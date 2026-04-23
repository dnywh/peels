import { RadioGroup as HeadlessRadioGroup } from "@headlessui/react";
import { styled } from "next-yak";
import type { ComponentProps, PropsWithChildren } from "react";

const StyledRadioGroup = styled(HeadlessRadioGroup)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

type RadioGroupProps = PropsWithChildren<
  ComponentProps<typeof HeadlessRadioGroup>
>;

function RadioGroup({ children, ...props }: RadioGroupProps) {
  return <StyledRadioGroup {...props}>{children}</StyledRadioGroup>;
}

export default RadioGroup;
