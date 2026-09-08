"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { DEMO_USER } from "@/lib/config";
import type { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isDemo: boolean;
  isFirebase: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signInWithJWT: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? undefined,
  };
}

async function persistSession(token: string): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

async function clearSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const auth = getFirebaseAuth();
  const isFirebase = Boolean(auth);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const data = (await sessionRes.json()) as { user: AuthUser; token?: string; type?: string };
        if (active) {
          setUser(data.user);
          if (data.type === "demo") {
            setDemoToken(data.token ?? "demo-token");
          } else if (data.type === "jwt") {
            setJwtToken(data.token ?? null);
          }
          setLoading(false);
          return;
        }
      }

      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!active) {
            return;
          }

          if (firebaseUser) {
            const mapped = mapFirebaseUser(firebaseUser);
            setUser(mapped);
            const token = await firebaseUser.getIdToken();
            await persistSession(token);
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => {
          active = false;
          unsubscribe();
        };
      }

      if (active) {
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [auth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        throw new Error("Firebase is not configured. Use demo login instead.");
      }
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      await persistSession(token);
      setDemoToken(null);
      setJwtToken(null);
      setUser(mapFirebaseUser(credential.user));
    },
    [auth]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        throw new Error("Firebase is not configured. Use demo login instead.");
      }
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await credential.user.getIdToken();
      await persistSession(token);
      setDemoToken(null);
      setJwtToken(null);
      setUser(mapFirebaseUser(credential.user));
    },
    [auth]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error("Firebase is not configured. Use demo login instead.");
    }
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const credential = await signInWithPopup(auth, provider);
    const token = await credential.user.getIdToken();
    await persistSession(token);
    setDemoToken(null);
    setJwtToken(null);
    setUser(mapFirebaseUser(credential.user));
  }, [auth]);

  const signInDemo = useCallback(async () => {
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (!response.ok) {
      throw new Error("Demo login failed");
    }
    const data = (await response.json()) as {
      user: AuthUser;
      token: string;
    };
    setDemoToken(data.token);
    setJwtToken(null);
    setUser(data.user);
  }, []);

  const signInWithJWT = useCallback(async (token: string) => {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, type: "jwt" }),
    });
    if (!response.ok) {
      throw new Error("JWT login failed");
    }
    const data = (await response.json()) as { user: AuthUser };
    setJwtToken(token);
    setDemoToken(null);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // Ignore sign-out errors if user is already signed out
      }
    }
    setDemoToken(null);
    setJwtToken(null);
    setUser(null);
  }, [auth]);

  const getToken = useCallback(async () => {
    if (demoToken) {
      return demoToken;
    }
    if (jwtToken) {
      return jwtToken;
    }
    if (auth?.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return null;
  }, [auth, demoToken, jwtToken]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isDemo: Boolean(demoToken),
      isFirebase: Boolean(auth?.currentUser),
      signIn,
      signUp,
      signInWithGoogle,
      signInDemo,
      signInWithJWT,
      logout,
      getToken,
    }),
    [user, loading, demoToken, jwtToken, auth, signIn, signUp, signInWithGoogle, signInDemo, signInWithJWT, logout, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export { DEMO_USER };
