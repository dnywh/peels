export type InlineActionResult<T = undefined> = {
  success: boolean;
  error: string | null;
  data?: T;
};
