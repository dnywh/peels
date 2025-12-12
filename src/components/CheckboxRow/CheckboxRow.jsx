import { useId } from "react";
// Using Headless UI label and field for unset styling
import {
  Field as HeadlessField,
  Label as HeadlessLabel,
} from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledField = styled(HeadlessField)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "1rem 0",

  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${theme.colors.border.stark}`,
  },

  "&[data-invalid]": {
    color: theme.colors.text.ui.error,
  },
}));

const StyledLabel = styled(HeadlessLabel)(({ theme }) => ({
  // fontSize: "0.875rem",
  // color: theme.colors.text.ui.primary,
  flex: 1,
  paddingRight: "1.5rem", // Instead of gap on parent, so this can be tappable
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
    // https://betravis.github.io/shape-tools/path-to-polygon/
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

function CheckboxRow({
  id,
  name,
  defaultChecked = false,
  required = false,
  children,
  passiveLabel = false,
  disabled = false,
}) {
  // Generate a unique ID if none provided
  const generatedId = useId();
  const checkboxId = id || `checkbox-${generatedId}`;

  return (
    <StyledField>
      <StyledLabel htmlFor={checkboxId} passive={passiveLabel}>
        {children}
      </StyledLabel>

      <NativeCheckbox
        id={checkboxId}
        name={name}
        type="checkbox"
        required={required}
        defaultChecked={defaultChecked ? true : undefined}
        disabled={disabled ? "disabled" : undefined}
      />
    </StyledField>
  );
}

export default CheckboxRow;
