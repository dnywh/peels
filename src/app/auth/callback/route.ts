import { createClient } from "@/utils/supabase/server";
import { normalizeNextPath } from "@/utils/authRedirects";
import { NextResponse } from "next/server";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";
const INVALID_LINK_MESSAGE =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-callback]", event, data ?? {});
};

export async function GET(request: Request) {
  // Legacy/code-based callback route for auth flows that return `?code=...`.
  // Hash-token flows are finalized by AuthHashCompletion + POST /auth/session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const authErrorDescription = requestUrl.searchParams.get("error_description");
  const requestedNextPath =
    requestUrl.searchParams.get("next") ??
    requestUrl.searchParams.get("redirect_to");
  const nextPath = normalizeNextPath(requestedNextPath, "/profile");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      debugAuth("code-exchange-failed", {
        code: error.code ?? null,
        nextPath,
      });
      const signInUrl = new URL("/sign-in", origin);
      signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
      signInUrl.searchParams.set("redirect_to", nextPath);
      return NextResponse.redirect(signInUrl);
    }

    debugAuth("code-exchange-success", { nextPath });
    return NextResponse.redirect(new URL(nextPath, origin));
  }

  if (authErrorDescription) {
    debugAuth("callback-error", {
      nextPath,
      reason: authErrorDescription,
    });
    const signInUrl = new URL("/sign-in", origin);
    signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
    signInUrl.searchParams.set("redirect_to", nextPath);
    return NextResponse.redirect(signInUrl);
  }

  debugAuth("missing-code-redirect-home", { nextPath });
  const homeUrl = new URL("/", origin);
  homeUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(homeUrl);
}
