"use client";
import { useId } from "react";

import Form from "@/components/Form";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import TextArea from "@/components/TextArea";

import { styled } from "@pigment-css/react";

function MultiInput({
  label,
  placeholder,
  items,
  handleItemChange,
  onClick,
  limit = 10,
}) {
  const uniqueId = useId();
  return (
    <Fieldset>
      <Field>
        <Label htmlFor={`${uniqueId}-${items.length - 1}`}>{label}</Label>
        {items.map((item, index) => (
          <Input
            key={`${uniqueId}-${index}`}
            id={`${uniqueId}-${index}`}
            required={index === 0}
            type="text"
            placeholder={placeholder}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
          />
        ))}
        {items.length < limit && <Button onClick={onClick}>Add another</Button>}
      </Field>
    </Fieldset>
  );
}

export default MultiInput;
