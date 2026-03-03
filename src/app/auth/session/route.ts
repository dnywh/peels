import { createClient } from "@/utils/supabase/server";
import {
  getDefaultNextPathByType,
  isSupportedEmailAuthType,
  normalizeNextPath,
} from "@/utils/authRedirects";
import { NextResponse } from "next/server";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-session]", event, data ?? {});
};

const INVALID_SESSION_MESSAGE = "Invalid or expired authentication session.";

export async function POST(request: Request) {
  let body:
    | {
        access_token?: unknown;
        refresh_token?: unknown;
        next?: unknown;
        type?: unknown;
      }
    | undefined;

  try {
    body = await request.json();
  } catch (_error) {
    return NextResponse.json(
      { ok: false, error: INVALID_SESSION_MESSAGE },
      { status: 400 }
    );
  }

  const type = typeof body?.type === "string" ? body.type : null;
  const accessToken =
    typeof body?.access_token === "string" ? body.access_token : null;
  const refreshToken =
    typeof body?.refresh_token === "string" ? body.refresh_token : null;

  if (!isSupportedEmailAuthType(type) || !accessToken || !refreshToken) {
    debugAuth("invalid-payload", {
      hasType: Boolean(type),
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
    });
    return NextResponse.json(
      { ok: false, error: INVALID_SESSION_MESSAGE },
      { status: 400 }
    );
  }

  const defaultNextPath = getDefaultNextPathByType(type);
  const nextPath = normalizeNextPath(
    typeof body?.next === "string" ? body.next : null,
    defaultNextPath
  );

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      debugAuth("set-session-failed", {
        type,
        nextPath,
        code: error.code ?? null,
      });
      return NextResponse.json(
        { ok: false, error: INVALID_SESSION_MESSAGE },
        { status: 401 }
      );
    }

    debugAuth("set-session-success", { type, nextPath });
    return NextResponse.json({ ok: true, next: nextPath });
  } catch (error) {
    debugAuth("set-session-error", {
      type,
      nextPath,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { ok: false, error: INVALID_SESSION_MESSAGE },
      { status: 500 }
    );
  }
}
