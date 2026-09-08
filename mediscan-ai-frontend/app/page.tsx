import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  Activity,
  Heart,
  Users,
  FileSearch,
  MapPin,
  Zap,
  Award,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">Mediora AI</p>
              <p className="text-xs text-slate-500">Chest & Skin Screening</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:block"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl hover:shadow-blue-600/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,119,198,0.15),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                AI-Powered Medical Screening
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Understand your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  chest X-ray
                </span>{" "}
                with AI assistance
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Upload your chest X-ray or skin image and get instant AI-powered analysis.
                Clear, understandable results to discuss with your healthcare provider.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/analyze"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:shadow-xl hover:shadow-blue-600/30"
                >
                  <Upload size={20} />
                  Analyze X-Ray Now
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Create Account
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  No account required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  Free to try
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  Results in seconds
                </span>
              </div>
            </div>

            {/* Right Content - Demo Preview */}
            <div className="relative lg:pl-8">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-200 to-indigo-200 opacity-30 blur-xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-2xl shadow-slate-900/10">
                {/* Demo Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Mediora AI</p>
                      <p className="text-xs text-slate-500">Analysis Preview</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Demo Result
                  </span>
                </div>

                {/* Demo Content */}
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  {/* X-Ray Image */}
                  <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-2">
                    <div className="relative aspect-square w-full">
                      <Image
                        src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop"
                        alt="Chest X-Ray"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
                      Chest X-Ray
                    </div>
                  </div>

                  {/* Result Card */}
                  <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      AI Prediction
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">Normal</p>
                    <p className="text-sm text-emerald-600">87% Confidence</p>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Confidence</span>
                        <span>87%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Footer */}
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    This is a demo preview. Sign up to analyze your own images.
                  </p>
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-slate-200/50 bg-white p-4 shadow-xl shadow-slate-900/10 lg:bottom-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">10K+</p>
                    <p className="text-xs text-slate-500">Images Analyzed</p>
                  </div>
                </div>
              </div>

              {/* Floating Accuracy Card */}
              <div className="absolute -top-4 -right-4 rounded-2xl border border-slate-200/50 bg-white p-4 shadow-xl shadow-slate-900/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">94%</p>
                    <p className="text-xs text-slate-500">Accuracy Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-4 lg:px-8">
          <StatCard icon={<FileSearch size={24} />} value="15+" label="Disease Classes" />
          <StatCard icon={<Users size={24} />} value="5K+" label="Active Users" />
          <StatCard icon={<Clock3 size={24} />} value="<5s" label="Analysis Time" />
          <StatCard icon={<ShieldCheck size={24} />} value="100%" label="Data Privacy" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Get AI-powered insights in three simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <HowItWorksCard
              number="01"
              title="Upload Your Image"
              description="Choose a chest X-ray or skin lesion photo from your device. We support JPG, PNG formats up to 10MB."
              icon={<Upload size={28} />}
            />
            <HowItWorksCard
              number="02"
              title="AI Analysis"
              description="Our deep learning models analyze the image and identify potential findings based on trained medical data."
              icon={<Activity size={28} />}
            />
            <HowItWorksCard
              number="03"
              title="Get Results"
              description="Receive clear, understandable results with confidence scores and guidance on next steps to discuss with your doctor."
              icon={<FileSearch size={28} />}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Powerful Features for Better Healthcare
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Everything you need to understand your medical images and find the right care.
              </p>

              <div className="mt-10 space-y-6">
                <FeatureCard
                  icon={<Activity size={24} />}
                  title="AI-Powered Analysis"
                  description="State-of-the-art deep learning models trained on extensive medical imaging datasets for accurate predictions."
                />
                <FeatureCard
                  icon={<Heart size={24} />}
                  title="Detailed Disease Information"
                  description="Get comprehensive information about potential conditions, causes, and what to expect."
                />
                <FeatureCard
                  icon={<MapPin size={24} />}
                  title="Find Nearby Care"
                  description="Locate specialists and hospitals near you based on your analysis results."
                />
                <FeatureCard
                  icon={<Zap size={24} />}
                  title="Instant Results"
                  description="Get your analysis results in seconds, not hours or days. Fast, free, and accessible."
                />
              </div>
            </div>

            {/* Feature Image */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-200 to-indigo-200 opacity-40 blur-xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=500&fit=crop"
                  alt="Medical Professional Analysis"
                  width={600}
                  height={500}
                  className="w-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-lg font-semibold text-white">AI-Assisted Medical Analysis</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Advanced technology meets healthcare expertise
                  </p>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200/50 bg-white p-5 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">HIPAA Ready</p>
                    <p className="text-sm text-slate-500">Your data stays private</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent_60%)]" />

            <div className="relative px-8 py-16 lg:px-16 lg:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  Ready to understand your health better?
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Join thousands of users who trust Mediora AI for their medical image screening needs.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/analyze"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
                  >
                    Start Free Analysis
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Mediora AI</p>
                  <p className="text-xs text-slate-500">Chest & Skin Screening</p>
                </div>
              </Link>
              <p className="mt-4 max-w-sm text-sm text-slate-500">
                AI-powered medical image screening for chest X-rays and skin lesions.
                Get instant insights to discuss with your healthcare provider.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-slate-900">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li><Link href="/analyze" className="hover:text-blue-600">Analyze X-Ray</Link></li>
                <li><Link href="/analyze" className="hover:text-blue-600">Skin Screening</Link></li>
                <li><Link href="/login" className="hover:text-blue-600">Create Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="hover:text-blue-600">Medical Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            <p>
              Educational/research project. AI output is not a medical diagnosis and should not replace
              evaluation by a qualified healthcare professional.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function HowItWorksCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
          {icon}
        </div>
        <div className="absolute left-10 top-0 -ml-6 mt-4 hidden text-6xl font-bold text-slate-100 lg:block">
          {number}
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
