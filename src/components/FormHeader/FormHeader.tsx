import { sharedSectionTextBlockStyles } from "@/styles/commonStyles";
import IconButton from "@/components/IconButton";
import type { IconButtonProps } from "@/components/IconButton";

import PeelsLogo from "@/components/PeelsLogo";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

const iconBackStyles = css`
  align-self: flex-start;
`;

const iconCloseStyles = css`
  align-self: flex-end;
`;

type FormHeaderButton = NonNullable<IconButtonProps["icon"]> | "none";

const StyledIconButton = styled(IconButton)<{
  $icon?: Exclude<FormHeaderButton, "none">;
}>`
  ${({ $icon }) => $icon === "back" && iconBackStyles}
  ${({ $icon }) => $icon === "close" && iconCloseStyles}
`;

const noButtonHeaderStyles = css`
  margin-top: 1rem;
`;

const Header = styled.header<{ $button?: FormHeaderButton }>`
  width: 100%;
  padding: 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;

  ${({ $button }) => $button === "none" && noButtonHeaderStyles}
`;

const Text = styled.div`
  ${sharedSectionTextBlockStyles}
  max-width: ${theme.spacing.container.textOpticalWidth};

  & h1 {
    font-size: 2.75rem;
    line-height: 100%;
    letter-spacing: -0.025em;
    font-weight: bold;
    color: ${theme.colors.text.brand.primary};
  }

  & p {
    font-size: 1rem;
    line-height: 135%;
    font-weight: normal;
    color: ${theme.colors.text.ui.secondary};
  }
`;

function FormHeader({
  children,
  button = "back",
}: {
  children?: ReactNode;
  button?: FormHeaderButton;
}) {
  return (
    <Header $button={button}>
      {button === "none" ? null : (
        <StyledIconButton icon={button} $icon={button} />
      )}
      <PeelsLogo />
      <Text>{children}</Text>
    </Header>
  );
}

export default FormHeader;
