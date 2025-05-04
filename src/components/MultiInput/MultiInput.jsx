"use client";
import { useId, useRef } from "react";

import Form from "@/components/Form";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";

import { styled } from "@pigment-css/react";

function MultiInput({
  label,
  placeholder = undefined,
  secondaryPlaceholder = placeholder,
  items,
  minRequired = 0,
  handleItemChange,
  onClick,
  limit = 10,
  type = "text",
  pattern = undefined,
  addButtonText = "Add",
  addAnotherButtonText = "Add another",
}) {
  const uniqueId = useId();
  const addButtonRef = useRef(null);

  const handleAddItem = () => {
    onClick();
    // After adding item, focus the new input field
    setTimeout(() => {
      const newIndex = items.length;
      const newInput = document.getElementById(`${uniqueId}-${newIndex}`);
      if (newInput) {
        newInput.focus();
      }
    }, 0);
  };

  const handleInputKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (addButtonRef.current) {
        addButtonRef.current.focus();
      }
    }
  };

  return (
    <Fieldset>
      <Field>
        <Label
          required={minRequired > 0}
          htmlFor={`${uniqueId}-${items.length - 1}`}
        >
          {label}
        </Label>
        {items.map((item, index) => (
          <Input
            key={`${uniqueId}-${index}`}
            id={`${uniqueId}-${index}`}
            required={index === 0 && minRequired === 1}
            type={type}
            pattern={pattern ? pattern : undefined}
            placeholder={index === 0 ? placeholder : secondaryPlaceholder}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, index)}
          />
        ))}
        {items.length < limit && (
          <Button
            ref={addButtonRef}
            size="small"
            variant="secondary"
            width="contained"
            onClick={handleAddItem}
          >
            {items.length === 0 ? addButtonText : addAnotherButtonText}
          </Button>
        )}
      </Field>
    </Fieldset>
  );
}

export default MultiInput;
