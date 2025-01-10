"use client";
import { useId } from "react";

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
  addButtonText = "Add",
  addAnotherButtonText = "Add another",
}) {
  const uniqueId = useId();
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
            placeholder={index === 0 ? placeholder : secondaryPlaceholder}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
          />
        ))}
        {items.length < limit && (
          <Button
            size="small"
            variant="secondary"
            width="contained"
            onClick={onClick}
          >
            {items.length === 0 ? addButtonText : addAnotherButtonText}
          </Button>
        )}
      </Field>
    </Fieldset>
  );
}

export default MultiInput;
