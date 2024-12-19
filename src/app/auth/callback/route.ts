import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  // const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const next = requestUrl.searchParams.get("next") || "/map";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // if (redirectTo) {
  //   return NextResponse.redirect(`${origin}${redirectTo}`);
  // }

    // New users from sign-up will have a special parameter
    const isNewUser = requestUrl.searchParams.get("new_user") === "true";
    if (isNewUser) {
      return NextResponse.redirect(`${origin}/profile`);
    }

  return NextResponse.redirect(`${origin}${next}`);
}
