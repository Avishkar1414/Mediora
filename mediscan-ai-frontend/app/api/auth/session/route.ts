import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyRequestAuth } from "@/lib/auth-server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { isDemoMode } from "@/lib/config";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { token?: string; type?: string };
  const { token, type } = body;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Demo token
  if (isDemoMode() && token === "demo-token") {
    const response = NextResponse.json({ ok: true, user: { uid: "demo-user", email: "demo@mediora.ai", displayName: "Demo User" } });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  // JWT token (custom backend)
  if (type === "jwt") {
    // Verify JWT using a simple implementation
    // In production, you would use a proper JWT library like jsonwebtoken
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      // Decode payload (middle part) - in production use proper JWT verification
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

      // Validate required fields
      if (!payload.uid || !payload.email) {
        throw new Error("JWT missing required fields");
      }

      const user = {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.name || payload.displayName || payload.email.split("@")[0],
      };

      const response = NextResponse.json({ ok: true, user, type: "jwt" });
      response.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    } catch {
      return NextResponse.json({ error: "Invalid JWT token" }, { status: 401 });
    }
  }

  // Firebase token
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // In demo mode without Firebase Admin, accept the token and extract user info from it
    // This is less secure but allows local development without Firebase Admin setup
    if (isDemoMode()) {
      try {
        // Decode Firebase token payload (second part) without server verification
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

        const user = {
          uid: payload.uid,
          email: payload.email || "",
          displayName: payload.name || payload.displayName,
        };
        const response = NextResponse.json({ ok: true, user, type: "firebase" });
        response.cookies.set(AUTH_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24,
        });
        return response;
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }
    return NextResponse.json(
      { error: "Firebase admin is not configured" },
      { status: 503 }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const user = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name,
    };
    const response = NextResponse.json({ ok: true, user, type: "firebase" });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  const user = await verifyRequestAuth(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
