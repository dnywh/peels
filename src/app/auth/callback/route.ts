import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;
  // const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const next = requestUrl.searchParams.get("next") || "/map";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // Debug log
    console.log('Auth callback:', {
      type,
      code: code.slice(0, 6) + '...', // Log just the start of the code to check if it's a signup
      userId: data?.user?.id
    });

    // If this is a 'signup' verification, send to profile, otherwise go to next (map)
    if (type === 'signup') {
      console.log('Redirecting new signup to profile');
      return NextResponse.redirect(`${origin}/profile`);
    }
  }

  console.log('Redirecting to:', `${origin}${next}`);
  return NextResponse.redirect(`${origin}${next}`);
}
