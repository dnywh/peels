import type { SyntheticEvent } from "react";

export type FormSubmitEvent = SyntheticEvent<HTMLFormElement, SubmitEvent>;
export type FormSubmitHandler = (
  event: FormSubmitEvent
) => void | Promise<void>;
