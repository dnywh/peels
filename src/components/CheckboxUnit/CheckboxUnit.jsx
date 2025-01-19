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

const StyledCheckbox = styled(HeadlessCheckbox)(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.5)`,
  backgroundColor: theme.colors.checkbox.unchecked.background,

  outline: "none",
  "&:focus, &[data-focus]": {
    outline: `3px solid ${theme.colors.focus.outline}`,
  },

  "&[data-checked]": {
    backgroundColor: theme.colors.checkbox.checked.background,
    borderColor: theme.colors.checkbox.checked.background,

    "& svg": {
      opacity: 1,
    },
  },
  "&[data-disabled]": {
    cursor: "not-allowed",
    opacity: 0.5,
  },
}));

// TODO use same SVG as in accepted/rejected items
const Check = styled("svg")(({ theme }) => ({
  width: "1rem",
  height: "1rem",
  stroke: theme.colors.checkbox.checked.foreground,
  opacity: 0,
}));

function CheckboxUnit({
  checked,
  setChecked,
  required = false,
  children,
  passiveLabel = false,
  // error,
}) {
  return (
    <StyledField>
      <StyledFieldContents>
        <StyledLabel htmlFor="checkbox" passive={passiveLabel}>
          {children}
        </StyledLabel>

        <input
          type="checkbox"
          required={required}
          id="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
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
