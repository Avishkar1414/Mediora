"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LogIn,
  LogOut,
  Plus,
  Sparkles,
  Stethoscope,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type NavBarProps = {
  showNewScan?: boolean;
};

export default function NavBar({ showNewScan = false }: NavBarProps) {
  const router = useRouter();
  const { user, loading, logout, isDemo } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  }

  function getUserInitials(email: string): string {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Sparkles size={18} />
          </div>
          <span className="font-bold text-slate-900">Mediora AI</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              {/* New Scan Button */}
              {showNewScan && (
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  New Scan
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {/* Avatar */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {getUserInitials(user.email)}
                  </div>
                  <span className="hidden sm:block">{user.email}</span>
                  {isDemo && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                      Demo
                    </span>
                  )}
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                      {/* User Info */}
                      <div className="border-b border-slate-100 px-4 pb-3 pt-1">
                        <p className="font-medium text-slate-900">{user.displayName || "User"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            isDemo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {isDemo ? "Demo Account" : "Firebase Account"}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Stethoscope size={16} className="text-slate-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/analyze"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Plus size={16} className="text-slate-400" />
                          New Scan
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {loggingOut ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <LogOut size={16} />
                          )}
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
              >
                <LogIn size={16} />
                Login
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Sparkles size={16} />
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
