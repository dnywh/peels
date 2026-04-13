import Image from "next/image";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

export default function PostageStamp() {
  const t = useTranslations("Newsletter");

  return (
    <StyledImage
      src="/stamp.png"
      alt={t("stampAlt")}
      width={224}
      height={132}
      aria-hidden="true"
      role="presentation"
    />
  );
}

const StyledImage = styled(Image)(({ theme }) => ({
  userDrag: "none",
  "-webkit-user-drag": "none",
  userSelect: "none",
  position: "absolute",
  top: 0,
  right: 0,
  opacity: 0.28,
  transform: "rotate(-16deg) translate(90px, -8px) scale(0.95)",
}));
