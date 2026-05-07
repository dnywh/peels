import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  authStateHeaderName,
  authStateSignedIn,
  authStateSignedOut,
  currentPathHeaderName,
} from "@/utils/supabase/authState";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    const requestHeaders = new Headers(request.headers);
    const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    requestHeaders.set(currentPathHeaderName, currentPath);
    let response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    const refreshForwardedResponse = () => {
      const cookiesToForward = response.cookies.getAll();

      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      cookiesToForward.forEach((cookie) => response.cookies.set(cookie));
    };

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            requestHeaders.set("cookie", request.cookies.toString());
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();
    requestHeaders.set(
      authStateHeaderName,
      user.error ? authStateSignedOut : authStateSignedIn
    );
    refreshForwardedResponse();

    // Redirect guests away from protected routes
    const protectedRoutes = ["/profile", "/chats"];
    for (const route of protectedRoutes) {
      if (request.nextUrl.pathname.startsWith(route) && user.error) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("redirect_to", currentPath);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Redirect authenticated users away from guest-only routes
    const guestRoutes = ["/sign-up", "/forgot-password", "/sign-in"];
    for (const route of guestRoutes) {
      if (request.nextUrl.pathname.startsWith(route) && !user.error) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(authStateHeaderName, authStateSignedOut);
    requestHeaders.set(
      currentPathHeaderName,
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
};
