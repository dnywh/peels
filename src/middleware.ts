import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // Redirect authenticated users away from auth pages
  const { data: { user } } = await supabase.auth.getUser();
  // Your existing middleware logic for other protected routes
  if (
    !user && (
      request.nextUrl.pathname.startsWith("/chats") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/reset-password")
    )
  ) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?from=${request.nextUrl.pathname.slice(1)}`,
        request.url,
      ),
    );
  }

  // Redirect authenticated users away from guest pages
  if (
    user && (
      request.nextUrl.pathname.startsWith("/forgot-password") ||
      request.nextUrl.pathname.startsWith("/sign-in")
    )
  ) {
    return NextResponse.redirect(
      new URL(
        `/profile?from=${request.nextUrl.pathname.slice(1)}`,
        request.url,
      ),
    );
  }

  // console.log("user", user);
  return response;
}

export const config = {
  /*
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
   * Feel free to modify this pattern to include more paths.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
