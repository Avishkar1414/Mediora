"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { logout, loading } = useAuth();

  useEffect(() => {
    async function performLogout() {
      await logout();
      router.push("/");
    }
    if (!loading) {
      performLogout();
    }
  }, [loading, logout, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-slate-500">Signing out...</p>
      </div>
    </main>
  );
}
