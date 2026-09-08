"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Sparkles,
  UserPlus,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  Activity,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, signInDemo, user, loading } = useAuth();

  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect to dashboard whenever a user is authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setSubmitting(false);
        return;
      }

      if (!isLogin) {
        // Sign up
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setSubmitting(false);
          return;
        }
        await signUp(email, password);
      } else {
        // Login
        await signIn(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleDemoMode() {
    setError("");
    setSubmitting(true);
    try {
      await signInDemo();
      router.push("/dashboard");
    } catch {
      setError("Demo login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles size={16} />
            </div>
            Mediora AI
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Branding */}
            <div className="hidden flex-col justify-center lg:flex">
              <div className="max-w-lg">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                  Welcome to{" "}
                  <span className="text-blue-600">Mediora AI</span>
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  AI-powered medical image screening for chest X-rays and skin lesions. Get instant insights to discuss with your healthcare provider.
                </p>

                <div className="mt-8 space-y-4">
                  <Feature
                    icon={<Activity size={20} />}
                    title="AI-Powered Analysis"
                    description="Advanced deep learning models trained on medical imaging data"
                  />
                  <Feature
                    icon={<Stethoscope size={20} />}
                    title="Expert Guidance"
                    description="Personalized care recommendations based on your results"
                  />
                  <Feature
                    icon={<ShieldCheck size={20} />}
                    title="Privacy First"
                    description="Your data is encrypted and never shared without consent"
                  />
                  <Feature
                    icon={<MapPin size={20} />}
                    title="Nearby Care"
                    description="Find specialists and hospitals near your location"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex flex-col justify-center">
              <div className="w-full">
                {/* Tab Switcher */}
                <div className="mb-8 flex rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/50">
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                    }}
                    className={`flex-1 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      isLogin
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setError("");
                    }}
                    className={`flex-1 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      !isLogin
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Form Card */}
                <div className="rounded-3xl border border-slate-200/50 bg-white p-8 shadow-xl shadow-slate-200/50">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-950">
                      {isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {isLogin
                        ? "Sign in to access your medical imaging dashboard"
                        : "Get started with Mediora AI today"}
                    </p>
                  </div>

                  {/* Google Button */}
                  <button
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || submitting}
                    className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                        or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    {/* Name (Sign up only) */}
                    {!isLogin && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserPlus className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password (Sign up only) */}
                    {!isLogin && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    {/* Forgot Password (Login only) */}
                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || googleLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : isLogin ? (
                        <>
                          <LogIn size={18} />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Create Account
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo Mode Link */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                      Want to explore first?{" "}
                      <button
                        onClick={handleDemoMode}
                        disabled={submitting || googleLoading}
                        className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
                      >
                        Use Demo Account
                      </button>
                    </p>
                  </div>

                  {/* Terms */}
                  <p className="mt-6 text-center text-xs text-slate-400">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Mobile Branding */}
                <div className="mt-8 lg:hidden">
                  <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-lg">
                    <h3 className="font-bold text-slate-950">Why Mediora AI?</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <ShieldCheck size={16} />
                        </div>
                        <p className="text-sm text-slate-600">Your data is encrypted and private</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Activity size={16} />
                        </div>
                        <p className="text-sm text-slate-600">AI-powered medical image analysis</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <MapPin size={16} />
                        </div>
                        <p className="text-sm text-slate-600">Find nearby specialists easily</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
