import type { SubmitEvent as ReactSubmitEvent } from "react";

export type FormSubmitEvent = ReactSubmitEvent<HTMLFormElement>;
export type FormSubmitHandler = (
  event: FormSubmitEvent
) => void | Promise<void>;
