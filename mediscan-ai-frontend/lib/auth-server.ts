import { cookies } from "next/headers";
import { DEMO_USER, isDemoMode } from "./config";
import { getAdminAuth } from "./firebase-admin";
import type { AuthUser } from "./types";

export const AUTH_COOKIE = "mediora_auth";

export async function verifyRequestAuth(
  authorizationHeader?: string | null
): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(AUTH_COOKIE)?.value;

  const token =
    authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.slice(7)
      : cookieToken;

  if (!token) {
    return null;
  }

  if (isDemoMode() && token === "demo-token") {
    return {
      uid: DEMO_USER.uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
    };
  }

  const adminAuth = getAdminAuth();

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: decoded.name,
      };
    } catch {
      return null;
    }
  }

  // In demo mode without Firebase Admin, decode the token payload directly
  if (isDemoMode()) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

      if (!payload.uid) {
        return null;
      }

      return {
        uid: payload.uid,
        email: payload.email || "",
        displayName: payload.name || payload.displayName,
      };
    } catch {
      return null;
    }
  }

  return null;
}
