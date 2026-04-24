import type { SyntheticEvent } from "react";

export type FormSubmitEvent = SyntheticEvent<HTMLFormElement>;
export type FormSubmitHandler = (
  event: FormSubmitEvent
) => void | Promise<void>;
