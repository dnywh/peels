// Using Headless UI label for unset styling
import { Label as HeadlessLabel } from "@headlessui/react";

import Field from "@/components/Field";

import { styled } from "@pigment-css/react";

const StyledField = styled(Field)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.forms.gap.field,
}));

const StyledFieldContents = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "1rem",
  padding: "0.825rem 1rem",

  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.625)`,
  backgroundColor: theme.colors.background.slight,

  "&[data-invalid]": {
    borderColor: theme.colors.input.invalid.border,
    borderWidth: "1.5px",
    backgroundColor: theme.colors.background.error,
    color: theme.colors.text.ui.error,
  },
}));

const StyledLabel = styled(HeadlessLabel)(({ theme }) => ({
  // fontSize: "0.875rem",
  color: theme.colors.text.ui.primary,
  flex: 1,
}));

const NativeCheckbox = styled("input")(({ theme }) => ({
  // https://moderncss.dev/pure-css-custom-checkbox-style/
  appearance: "none",
  margin: 0,
  font: "inherit",
  color: theme.colors.checkbox.unchecked.foreground,
  width: "1.25rem",
  height: "1.25rem",
  border: `0.15em solid ${theme.colors.checkbox.border}`,
  borderRadius: "0.25em",
  transform: "translateY(-0.075em)",

  display: "grid",
  placeContent: "center",

  "&::before": {
    content: "''",
    width: "0.65em",
    height: "0.65em",
    transform: "scale(0.675)",
    opacity: 0,
    transition: "150ms transform ease-in-out, 100ms opacity ease-in-out",
    boxShadow: `inset 1em 1em ${theme.colors.checkbox.checked.foreground}`,
    /* Windows High Contrast Mode */
    backgroundColor: "CanvasText",

    // Cut out the checkmark shape
    // 1. Export the SVG at 100x100, with the desired shape taking up the entire canvas
    // 2. Convert from SVG to CSS clipPath using percentages (that's why we export at 100x100)
    // https://moderncss.dev/pure-css-custom-checkbox-style/
    clipPath:
      "polygon(97% 16%, 97% 27%, 40% 84%, 29% 84%, 3% 58%, 3% 47%, 14% 47%, 34% 67%, 86% 16%, 97% 16%)",
  },

  "&:checked": {
    background: theme.colors.checkbox.checked.background,
  },

  "&:checked::before": {
    transform: "scale(1.15)",
    opacity: 1,
  },

  outline: "none",
  "&:focus": {
    outline: `2px solid ${theme.colors.focus.outline}`,
    outlineOffset: 0,
  },

  "&[disabled]": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
}));

function CheckboxUnit({
  defaultChecked = false,
  required = false,
  children,
  passiveLabel = false,
  disabled = false,
}) {
  return (
    <StyledField>
      <StyledFieldContents>
        <StyledLabel htmlFor="checkbox" passive={passiveLabel}>
          {children}
        </StyledLabel>

        <NativeCheckbox
          id="checkbox"
          type="checkbox"
          required={required}
          defaultChecked={defaultChecked ? true : undefined}
          disabled={disabled ? "disabled" : undefined}
        />
      </StyledFieldContents>
    </StyledField>
  );
}

export default CheckboxUnit;
