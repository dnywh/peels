import { Field as HeadlessField } from "@headlessui/react";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ComponentProps, PropsWithChildren } from "react";

const StyledField = styled(HeadlessField)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.forms.gap.field};
`;

type FieldProps = PropsWithChildren<ComponentProps<typeof HeadlessField>>;

export default function Field({ children, ...props }: FieldProps) {
  return <StyledField {...props}>{children}</StyledField>;
}
