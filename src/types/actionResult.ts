export type InlineActionResult<T = undefined> = {
  success: boolean;
  error: string | null;
  data?: T;
  unexpected?: boolean;
};

export type SupportErrorData = {
  supportReference?: string;
};
