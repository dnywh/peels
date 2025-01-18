import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Whitelist of allowed redirect paths
const ALLOWED_REDIRECTS = ["/map", "/chats", "/profile"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next");

  // Validate 'next' parameter if it exists
  const validatedNext = next && ALLOWED_REDIRECTS.includes(next)
    ? next
    : "/map";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Debug log
    console.log("Auth callback:", {
      type,
      userId: data?.user?.id,
    });

    // Handle different verification types
    if (type === "signup") {
      console.log("Redirecting new signup to profile");
      return NextResponse.redirect(`${origin}/profile`);
    } else if (type === "email_change") {
      // Redirect to profile with success message
      console.log("Redirecting email change to profile");
      return NextResponse.redirect(
        `${origin}/profile?success=Your email has been updated successfully`,
      );
    }
  }

  // If no code is provided, redirect to the next URL
  console.log("Redirecting to:", `${origin}${validatedNext}`);
  return NextResponse.redirect(`${origin}${validatedNext}`);
}
