import { Radio as HeadlessRadio } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { theme } from "@/styles/theme.yak";

import { styled } from "next-yak";
import type { ComponentProps } from "react";

const StyledCheckCircleIcon = styled(CheckCircleIcon)`
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  fill: ${theme.colors.text.primary};
  width: 1.5rem;
  height: 1.5rem;
`;

const StyledRadio = styled(HeadlessRadio)`
  align-items: center;
  padding: 1.25rem;
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  background-color: ${theme.colors.radio.unchecked.background};
  border-radius: ${theme.corners.base};
  border: 2px solid ${theme.colors.radio.unchecked.border};
  transition:
    background-color 150ms ease-in-out,
    border 150ms ease-in-out;
  &[data-checked] {
    background-color: ${theme.colors.radio.checked.background};
    border: 2px solid ${theme.colors.radio.checked.border};
    & .check-circle-icon {
      opacity: 1;
    }
  }
  &[data-hover]:not([data-checked]) {
    background-color: ${theme.colors.radio.hover.background};
    border: 2px solid ${theme.colors.radio.hover.border};
  }
`;

const StyledRadioText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledRadioTitle = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 100%;
  color: ${theme.colors.text.primary};
`;

const StyledRadioDescription = styled.p`
  font-size: 1rem;
  font-weight: normal;
  color: ${theme.colors.text.secondary};
`;

function Radio({
  title,
  description,
  ...props
}: {
  title: string;
  description: string;
} & ComponentProps<typeof HeadlessRadio>) {
  return (
    <StyledRadio {...props}>
      <>
        <StyledRadioText>
          <StyledRadioTitle>{title}</StyledRadioTitle>
          <StyledRadioDescription>{description}</StyledRadioDescription>
        </StyledRadioText>
        <StyledCheckCircleIcon className="check-circle-icon" />
      </>
    </StyledRadio>
  );
}

export default Radio;
