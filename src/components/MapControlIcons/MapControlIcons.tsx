import type { ComponentProps } from "react";

import IconWrapper from "../IconWrapper";

type MapControlIconProps = Omit<
  ComponentProps<typeof IconWrapper>,
  "children" | "fill" | "viewBox"
>;

export function MapControlGpsIcon(props: MapControlIconProps) {
  return (
    <IconWrapper size={16} viewBox="0 0 18 18" {...props} fill="currentColor">
      <path d="M16.207 3.069 11.145 15.444c-.211.493-.739.774-1.266.668A1.122 1.122 0 0 1 9 14.987V8.8H2.813a1.123 1.123 0 0 1-.457-2.145L14.73 1.593a1.123 1.123 0 0 1 1.477 1.476Z" />
    </IconWrapper>
  );
}

export function MapControlMinusIcon(props: MapControlIconProps) {
  return (
    <IconWrapper size={16} viewBox="0 0 18 18" {...props} fill="currentColor">
      <path d="M16.313 8.8c0 .633-.528 1.125-1.125 1.125H2.813c-.633 0-1.125-.492-1.125-1.125 0-.598.492-1.125 1.125-1.125h12.375c.597 0 1.125.527 1.125 1.125Z" />
    </IconWrapper>
  );
}

export function MapControlPlusIcon(props: MapControlIconProps) {
  return (
    <IconWrapper size={16} viewBox="0 0 18 18" {...props} fill="currentColor">
      <path d="M10.125 2.612v5.063h5.063c.597 0 1.125.527 1.125 1.125 0 .633-.528 1.125-1.125 1.125h-5.063v5.062c0 .633-.527 1.125-1.125 1.125-.633 0-1.125-.492-1.125-1.125V9.925H2.812c-.632 0-1.125-.492-1.125-1.125 0-.598.493-1.125 1.125-1.125h5.063V2.612c0-.597.492-1.125 1.125-1.125.598 0 1.125.528 1.125 1.125Z" />
    </IconWrapper>
  );
}

export function MapControlSearchIcon(props: MapControlIconProps) {
  return (
    <IconWrapper size={16} viewBox="0 0 19 19" {...props} fill="currentColor">
      <path d="M14.625 7.313c0 1.617-.527 3.128-1.406 4.324l4.43 4.465c.456.421.456 1.16 0 1.582-.422.457-1.16.457-1.583 0l-4.464-4.465a7.237 7.237 0 0 1-4.29 1.406C3.27 14.625 0 11.355 0 7.312 0 3.305 3.27 0 7.313 0c4.007 0 7.312 3.305 7.312 7.313Zm-7.313 5.062a5.02 5.02 0 0 0 4.36-2.531 5.02 5.02 0 0 0 0-5.063 5.02 5.02 0 0 0-4.36-2.531c-1.828 0-3.48.984-4.394 2.531a5.02 5.02 0 0 0 0 5.063c.914 1.582 2.566 2.531 4.394 2.531Z" />
    </IconWrapper>
  );
}
