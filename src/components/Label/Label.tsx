import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "next-yak";
import type { ComponentProps, ReactNode } from "react";
import { theme } from "@/styles/theme.yak";

const StyledLabel = styled(HeadlessLabel)`
  color: ${theme.colors.text.ui.primary};
  font-weight: 500;
  & span {
    font-weight: 400;
    color: ${theme.colors.text.ui.secondary};
  }
`;

type LabelProps = ComponentProps<typeof HeadlessLabel> & {
  required?: boolean;
  optionalText?: string;
  children: ReactNode;
};

export default function Label({
  required = true,
  optionalText = "",
  children,
  ...props
}: LabelProps) {
  return (
    <StyledLabel {...props}>
      {children} {!required && optionalText && <span>({optionalText})</span>}
    </StyledLabel>
  );
}
