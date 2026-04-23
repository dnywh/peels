import Image from "next/image";
import { styled } from "next-yak";
import { useTranslations } from "next-intl";

export default function PostageStamp() {
  const t = useTranslations("Newsletter");

  return (
    <StyledImage
      src="/stamp.png"
      alt={t("stampAlt")}
      width={224}
      height={132}
    />
  );
}

const StyledImage = styled(Image)`
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none;
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0.28;
  transform: rotate(-16deg) translate(90px, -8px) scale(0.95);
`;
