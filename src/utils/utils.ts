import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Checks if Turnstile CAPTCHA is enabled.
 * Requires both NEXT_PUBLIC_TURNSTILE_SITEKEY and NEXT_PUBLIC_TURNSTILE_ENABLED to be set.
 * @returns {boolean} True if Turnstile is enabled, false otherwise.
 */
export function isTurnstileEnabled(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true"
  );
}
