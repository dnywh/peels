import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const INITIAL_REFERRER_COOKIE = "initial_referrer";
const INITIAL_REFERRER_MAX_AGE = 60 * 60 * 24 * 90;
const INITIAL_REFERRER_MAX_LENGTH = 512;

function getExternalReferrer(request: NextRequest) {
  const referrer = request.headers.get("referer");

  if (!referrer) return null;

  try {
    const referrerUrl = new URL(referrer);

    if (referrerUrl.host === request.nextUrl.host) {
      return null;
    }

    referrerUrl.search = "";
    referrerUrl.hash = "";

    return referrerUrl.toString().slice(0, INITIAL_REFERRER_MAX_LENGTH);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const hasInitialReferrerCookie = request.cookies.get(INITIAL_REFERRER_COOKIE);
  const externalReferrer = getExternalReferrer(request);

  if (
    !hasInitialReferrerCookie &&
    externalReferrer &&
    request.method === "GET"
  ) {
    response.cookies.set(INITIAL_REFERRER_COOKIE, externalReferrer, {
      httpOnly: false,
      maxAge: INITIAL_REFERRER_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
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
