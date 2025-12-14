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

/**
 * Validates a Turnstile CAPTCHA token server-side with Cloudflare.
 * @param {string} token - The Turnstile token to validate.
 * @returns {Promise<{success: boolean, error?: string}>} Validation result.
 */
export async function validateTurnstileToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return {
      success: false,
      error: "CAPTCHA verification is not properly configured.",
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.error("Turnstile validation failed:", result);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error validating Turnstile token:", error);
    return {
      success: false,
      error: "Verification service unavailable. Please try again later.",
    };
  }
}
