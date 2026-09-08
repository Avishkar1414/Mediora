import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-server";
import { DEMO_USER, isDemoMode } from "@/lib/config";

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Demo login is only available when DEMO_MODE=true" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    user: {
      uid: DEMO_USER.uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
    },
    token: "demo-token",
  });

  response.cookies.set(AUTH_COOKIE, "demo-token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
