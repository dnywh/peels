import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Get the referrer from the request headers
  const referrer = request.headers.get("referer") || "direct";

  // Get response from session update
  const response = await updateSession(request);

  // If this is a new session, set the referrer in a custom header
  // This header will be available in server components and API routes
  if (response.headers.get("x-supabase-auth") === "new") {
    response.headers.set("x-initial-referrer", referrer);
    console.log("New session detected, setting referrer:", referrer);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
