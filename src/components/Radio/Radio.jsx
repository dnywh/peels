import { Radio as HeadlessRadio } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { styled } from "@pigment-css/react";

const StyledRadio = styled(HeadlessRadio)(({ theme }) => ({
  alignItems: "center",
  padding: "1.25rem",
  alignItems: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  backgroundColor: theme.colors.radio.unchecked.background,
  borderRadius: theme.corners.base,
  border: `2px solid ${theme.colors.radio.unchecked.border}`,
  transition: "background-color 150ms ease-in-out, border 150ms ease-in-out",

  "&[data-checked]": {
    backgroundColor: theme.colors.radio.checked.background,
    border: `2px solid ${theme.colors.radio.checked.border}`,
    [`& ${StyledCheckCircleIcon}`]: {
      opacity: "1",
    },
  },
  "&[data-hover]:not([data-checked])": {
    backgroundColor: theme.colors.radio.hover.background,
    border: `2px solid ${theme.colors.radio.hover.border}`,
  },
}));

const StyledRadioText = styled("div")(({ theme }) => ({
  flex: "1",

  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
}));

const StyledRadioTitle = styled("p")(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: "500",
  lineHeight: "100%",
  color: theme.colors.text.primary,
}));

const StyledRadioDescription = styled("p")(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "normal",
  color: theme.colors.text.secondary,
}));

const StyledCheckCircleIcon = styled(CheckCircleIcon)(({ theme }) => ({
  opacity: "0",
  transition: "opacity 0.2s ease-in-out",
  fill: theme.colors.text.primary,
  width: "1.5rem",
  height: "1.5rem",
}));

function Radio({ title, description, ...props }) {
  return (
    <StyledRadio {...props}>
      <>
        <StyledRadioText>
          <StyledRadioTitle>{title}</StyledRadioTitle>
          <StyledRadioDescription>{description}</StyledRadioDescription>
        </StyledRadioText>
        <StyledCheckCircleIcon />
      </>
    </StyledRadio>
  );
}

export default Radio;
