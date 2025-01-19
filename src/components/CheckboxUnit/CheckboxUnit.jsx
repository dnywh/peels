import { Checkbox as HeadlessCheckbox } from "@headlessui/react";
import { Label as HeadlessLabel } from "@headlessui/react";

import Field from "@/components/Field";
import Label from "@/components/Label";
import InputHint from "@/components/InputHint";

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
  color: "currentColor",
  width: "1.15em",
  height: "1.15em",
  border: "0.15em solid currentColor",
  borderRadius: "0.15em",
  transform: "translateY(-0.075em)",

  display: "grid",
  placeContent: "center",

  "&::before": {
    content: "''",
    width: "0.65em",
    height: "0.65em",
    transform: "scale(0.75)",
    opacity: 0,
    transition: "100ms transform ease-in-out, 100ms opacity ease-in-out",
    boxShadow: "inset 1em 1em blue",
    /* Windows High Contrast Mode */
    backgroundColor: "CanvasText",
    // Create the checkmark
    clipPath: "polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)",
    // clip-path: ;
    // transform: "scale(1)",
  },

  "&:checked::before": {
    transform: "scale(1)",
    opacity: 1,
  },

  "&:focus": {
    outline: `3px solid ${theme.colors.focus.outline}`,
    outlineOffset: 0,
  },

  "&[disabled]": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
}));

// const StyledCheckbox = styled(HeadlessCheckbox)(({ theme }) => ({
//   cursor: "pointer",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   width: "1.5rem",
//   height: "1.5rem",
//   border: `1px solid ${theme.colors.border.stark}`,
//   borderRadius: `calc(${theme.corners.base} * 0.5)`,
//   backgroundColor: theme.colors.checkbox.unchecked.background,

//   outline: "none",
//   "&:focus, &[data-focus]": {
//     outline: `3px solid ${theme.colors.focus.outline}`,
//   },

//   "&[data-checked]": {
//     backgroundColor: theme.colors.checkbox.checked.background,
//     borderColor: theme.colors.checkbox.checked.background,

//     "& svg": {
//       opacity: 1,
//     },
//   },
//   "&[data-disabled]": {
//     cursor: "not-allowed",
//     opacity: 0.5,
//   },
// }));

// TODO use same SVG as in accepted/rejected items
const Check = styled("svg")(({ theme }) => ({
  width: "1rem",
  height: "1rem",
  stroke: theme.colors.checkbox.checked.foreground,
  opacity: 0,
}));

function CheckboxUnit({
  checked = false,
  setChecked,
  required = false,
  children,
  passiveLabel = false,
  disabled = false,
  // error,
}) {
  return (
    <StyledField>
      <StyledFieldContents>
        <StyledLabel htmlFor="checkbox" passive={passiveLabel}>
          {children}
        </StyledLabel>

        <NativeCheckbox
          type="checkbox"
          required={required}
          id="checkbox"
          checked={checked ? "checked" : undefined}
          disabled={disabled ? "disabled" : undefined}
        />
        {/* <StyledCheckbox
          checked={checked}
          onChange={setChecked}
          required={required}
          invalid={error ? "true" : undefined}
        >
          <Check viewBox="0 0 14 14" fill="none">
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Check>
        </StyledCheckbox> */}
      </StyledFieldContents>
      {/* {error && <InputHint variant="error">{error}</InputHint>} */}
    </StyledField>
  );
}

export default CheckboxUnit;
