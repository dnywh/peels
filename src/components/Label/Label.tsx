import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "@pigment-css/react";
import type { ComponentProps, ReactNode } from "react";

const StyledLabel = styled(HeadlessLabel)(({ theme }) => ({
  color: theme.colors.text.ui.primary,
  fontWeight: "500",

  "& span": {
    fontWeight: "400",
    color: theme.colors.text.ui.secondary,
  },
}));

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
