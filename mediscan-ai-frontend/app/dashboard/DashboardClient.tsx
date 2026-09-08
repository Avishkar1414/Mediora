"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileScan,
  History,
  Hospital,
  Loader2,
  MapPin,
  Navigation,
  Send,
  Star,
  Stethoscope,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalyses } from "@/lib/api-client";
import { saveCareLocation, saveFeedback } from "@/lib/firebase-care";
import type { AnalysisRecord } from "@/lib/types";

function formatDate(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString();
}

export default function DashboardClient() {
  const router = useRouter();
  const { user, loading, getToken } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const token = await getToken();
        const records = await fetchAnalyses(token);
        setAnalyses(records);
      } catch {
        setError("Could not load analysis history from MongoDB.");
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [user, loading, getToken, router]);

  const completed = analyses.filter((item) => item.prediction !== "Awaiting model");

  return (
    <main className="min-h-screen bg-slate-50">
      <NavBar showNewScan />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold text-blue-600">DASHBOARD</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Image screening analysis
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your analysis history loaded from MongoDB (or demo store in local mode).
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard title="Total scans" value={String(analyses.length)} icon={<FileScan size={19} />} />
          <StatCard
            title="Completed analyses"
            value={String(completed.length)}
            icon={<Stethoscope size={19} />}
          />
          <StatCard title="History" value={fetching ? "..." : "Ready"} icon={<History size={19} />} />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">Recent analyses</h2>
              <p className="mt-1 text-xs text-slate-500">
                Stored records for {user?.email ?? "your account"}.
              </p>
            </div>
            <Link
              href="/analyze"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Start a scan
            </Link>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading history...
            </div>
          ) : analyses.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No analyses yet. Upload your first chest X-ray or skin image to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analyses.map((item) => (
                <Link
                  key={item._id}
                  href={`/results/${item._id}`}
                  className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {item.imageDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageDataUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileScan size={22} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800">{item.fileName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:inline-block">
                      {item.prediction} ({item.confidence}%)
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:hidden">
                      {item.confidence}%
                    </span>
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Important:</strong> This interface is an educational/research prototype. It does
          not provide a medical diagnosis.
        </div>

        <CareFinder analysis={completed[0]} user={user} />
      </section>
    </main>
  );
}

type CareFinderProps = {
  analysis?: AnalysisRecord;
  user: { uid: string; email: string } | null;
};

function getCareSearch(prediction?: string) {
  const result = prediction?.toLowerCase() ?? "";
  if (result.includes("pneumonia")) {
    return {
      title: "Pneumonia care nearby",
      query: "pneumonia treatment hospital pulmonology clinic",
      detail:
        "Your latest screening result suggests searching for hospitals with respiratory or pulmonology care.",
    };
  }
  if (result.includes("normal")) {
    return {
      title: "General healthcare nearby",
      query: "hospital clinic",
      detail: "Find a nearby clinician if you have symptoms or would like a professional review.",
    };
  }
  return {
    title: "Healthcare nearby",
    query: "chest specialist hospital pulmonology clinic",
    detail: "Find a nearby clinician for a professional review of this screening result.",
  };
}

function CareFinder({ analysis, user }: CareFinderProps) {
  const care = useMemo(() => getCareSearch(analysis?.prediction), [analysis?.prediction]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const mapUrl = location
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${care.query} near ${location.latitude},${location.longitude}`)}&z=13&output=embed`
    : null;
  const mapsLink = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${care.query} near ${location.latitude},${location.longitude}`)}`
    : null;

  function findNearbyCare() {
    if (!navigator.geolocation) {
      setLocationStatus("Your browser does not support location services. Please search Google Maps manually.");
      return;
    }

    setLocating(true);
    setLocationStatus("Requesting your permission to use your current location…");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextLocation = { latitude: coords.latitude, longitude: coords.longitude };
        setLocation(nextLocation);
        try {
          const saved = user
            ? await saveCareLocation({
                uid: user.uid,
                ...nextLocation,
                prediction: analysis?.prediction ?? "No report yet",
              })
            : false;
          setLocationStatus(
            saved
              ? "Nearby care is shown below. Your opted-in location was saved to Firebase."
              : "Nearby care is shown below. Firebase is not configured, so your location was not saved."
          );
        } catch {
          setLocationStatus("Nearby care is shown below. We could not save your location to Firebase.");
        } finally {
          setLocating(false);
        }
      },
      async (error) => {
        // Browser geolocation failed, try IP-based fallback
        setLocationStatus("Browser location failed. Trying IP-based location...");
        try {
          const response = await fetch("https://ipapi.co/json/", {
            signal: AbortSignal.timeout(8000),
          });
          if (response.ok) {
            const data = await response.json() as { latitude?: number; longitude?: number; error?: string };
            if (data.latitude && data.longitude) {
              const nextLocation = { latitude: data.latitude, longitude: data.longitude };
              setLocation(nextLocation);
              try {
                const saved = user
                  ? await saveCareLocation({
                      uid: user.uid,
                      ...nextLocation,
                      prediction: analysis?.prediction ?? "No report yet",
                    })
                  : false;
                setLocationStatus(
                  saved
                    ? "Found location via IP. Nearby care is shown below."
                    : "Found location via IP. Nearby care is shown below. Firebase is not configured."
                );
              } catch {
                setLocationStatus("Found location via IP. Nearby care is shown below.");
              }
              setLocating(false);
              return;
            }
          }
        } catch {
          // IP fallback also failed
        }

        // All methods failed
        let message = "We could not determine your location. Please use the map search to find nearby care.";
        if (error.code === 1) {
          message = "Location permission was denied. Please allow location access in your browser settings, or search for a hospital in Google Maps.";
        } else if (error.code === 2) {
          message = "Your location is currently unavailable. Please try again outdoors with GPS enabled, or search Google Maps.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again outdoors with clear sky view for GPS, or search Google Maps.";
        }
        setLocationStatus(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }

  async function submitFeedback(event: FormEvent) {
    event.preventDefault();
    if (!feedback.trim() || !rating || !user) return;

    setSendingFeedback(true);
    setFeedbackStatus("");
    const payload = {
      uid: user.uid,
      email: user.email,
      message: feedback.trim(),
      rating,
      prediction: analysis?.prediction ?? "No report yet",
    };
    try {
      const saved = await saveFeedback(payload);
      if (!saved) {
        const key = "mediora-feedback";
        const current = JSON.parse(localStorage.getItem(key) ?? "[]") as typeof payload[];
        localStorage.setItem(key, JSON.stringify([{ ...payload, createdAt: new Date().toISOString() }, ...current]));
      }
      setFeedback("");
      setRating(0);
      setFeedbackStatus(saved ? "Thank you — your feedback was saved to Firebase." : "Thank you — Firebase is not configured, so feedback was saved on this device.");
    } catch {
      setFeedbackStatus("We could not send feedback. Please try again.");
    } finally {
      setSendingFeedback(false);
    }
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_.7fr]" aria-label="Nearby healthcare and feedback">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600">
              <Hospital size={19} />
              <p className="text-sm font-semibold">CARE FINDER</p>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{care.title}</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">{care.detail}</p>
          </div>
          <button
            type="button"
            onClick={findNearbyCare}
            disabled={locating}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            {location ? "Refresh location" : "Use my location"}
          </button>
        </div>

        <div className="p-6">
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
            Share location only if you want nearby results. This feature helps you search for care; it does not recommend a provider or replace a clinician’s judgement.
          </p>
          {locationStatus && <p className="mt-3 text-sm text-slate-600">{locationStatus}</p>}

          {mapUrl ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title={`${care.title} map`}
                src={mapUrl}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {mapsLink && (
                <a href={mapsLink} target="_blank" rel="noreferrer" className="block px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-50">
                  Open the full hospital search in Google Maps
                </a>
              )}
            </div>
          ) : (
            <div className="mt-5 flex h-40 items-center justify-center rounded-2xl bg-slate-50 px-6 text-center text-sm text-slate-500">
              Allow location access to load nearby hospitals and clinics here.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submitFeedback} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600">
          <Send size={18} />
          <p className="text-sm font-semibold">FEEDBACK</p>
        </div>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Help improve Mediora</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Tell us whether this report and care finder were useful.</p>

        <div className="mt-5 flex gap-1" aria-label="Rate your experience">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} className="rounded p-1 text-amber-400" aria-label={`${value} star${value === 1 ? "" : "s"}`}>
              <Star size={23} fill={value <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="What worked well, or what should we improve?"
          className="mt-4 min-h-28 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          required
        />
        {feedbackStatus && <p className="mt-3 text-sm text-slate-600">{feedbackStatus}</p>}
        <button type="submit" disabled={sendingFeedback || !feedback.trim() || !rating || !user} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {sendingFeedback ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Send feedback
        </button>
      </form>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
      </div>
      <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
