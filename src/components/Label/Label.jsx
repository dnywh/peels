import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

const StyledLabel = styled(HeadlessLabel)(({ theme }) => ({
  color: theme.colors.text.ui.primary,
  fontWeight: "500",

  "& span": {
    fontWeight: "400",
    color: theme.colors.text.ui.secondary,
  },
}));

export default function Label({ required = true, children, ...props }) {
  const t = useTranslations("Common");

  return (
    <StyledLabel {...props}>
      {children} {!required && <span>({t("optional")})</span>}
    </StyledLabel>
  );
}
