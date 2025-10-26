import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
    // Get the initial referrer from the request headers
    const referrer = request.headers.get("referer") || "direct";
    // console.log("Referrer:", referrer); // Logs 'Referrer: null' if missing

    // Get response from session update
    const response = await updateSession(request);

    // Log auth header status (temporary testing)
    // const authHeader = response.headers.get("x-supabase-auth");
    // console.log("Auth header status:", {
    //   exists: !!authHeader,
    //   value: authHeader,
    //   url: request.url,
    // });

    // If this is a new session, set the initial referrer in a custom header
    // This header will be available in server components and API routes
    if (response.headers.get("x-supabase-auth") === "new") {
        response.headers.set("x-initial-referrer", referrer);
        console.log(
            "New session detected, setting initial referrer:",
            referrer,
        );
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
