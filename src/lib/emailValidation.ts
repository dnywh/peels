import { isDisposableEmail } from "fakeout";

/** Disposable domains use the auto-updated dataset bundled with `fakeout`. */
export function isDisposableSignupEmail(email: string): boolean {
  return isDisposableEmail(email.trim());
}
