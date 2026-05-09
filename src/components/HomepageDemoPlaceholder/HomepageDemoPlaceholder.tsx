import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { HTMLAttributes } from "react";

export default function HomepageDemoPlaceholder({
  variant = "panel",
  ...props
}: {
  variant?: "map" | "chat" | "photos" | "panel";
} & HTMLAttributes<HTMLDivElement>) {
  return <Placeholder $variant={variant} aria-hidden="true" {...props} />;
}

const Placeholder = styled.div<{
  $variant: "map" | "chat" | "photos" | "panel";
}>`
  width: ${({ $variant }) =>
    $variant === "photos" ? "min(100%, 58rem)" : "95vw"};
  max-width: ${({ $variant }) => ($variant === "photos" ? "58rem" : "400px")};
  min-height: ${({ $variant }) => {
    if ($variant === "map") return "32rem";
    if ($variant === "photos") return "12rem";
    return "28rem";
  }};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.corners.base};
  background:
    linear-gradient(
      110deg,
      transparent 0%,
      color-mix(in srgb, ${theme.colors.background.top}, transparent 18%) 42%,
      ${theme.colors.background.top} 50%,
      color-mix(in srgb, ${theme.colors.background.top}, transparent 18%) 58%,
      transparent 100%
    ),
    ${theme.colors.background.slight};
  background-size: 220% 100%;
  animation: placeholder-pulse 1.4s ease-in-out infinite;

  @keyframes placeholder-pulse {
    0% {
      background-position: 120% 0;
    }

    100% {
      background-position: -120% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
