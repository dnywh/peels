import { Fieldset as HeadlessFieldset } from "@headlessui/react";
import { styled } from "next-yak";
import type { ComponentProps, PropsWithChildren } from "react";

const StyledFieldset = styled(HeadlessFieldset)``;

type FieldsetProps = PropsWithChildren<ComponentProps<typeof HeadlessFieldset>>;

function Fieldset({ children, ...props }: FieldsetProps) {
  return <StyledFieldset {...props}>{children}</StyledFieldset>;
}

export default Fieldset;
