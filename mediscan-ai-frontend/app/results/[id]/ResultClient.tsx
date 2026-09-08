 "use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  FileImage,
  HeartPulse,
  House,
  Info,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { getFindingInfo, getFindingDetail, URGENCY_STYLES, type FindingInfo, type FindingDetail } from "@/lib/disease-info";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAnalysis } from "@/lib/api-client";
import type { AnalysisRecord } from "@/lib/types";
import InteractiveImage from "@/components/InteractiveImage";

type ResultClientProps = {
  analysisId: string;
};

type Guidance = {
  specialist: string;
  urgency: string;
  symptoms: string[];
  precautions: string[];
  treatment: string[];
  homeCare: string[];
};

type CareProvider = {
  id: string;
  name: string;
  address: string;
  availability: string;
  specialty?: string;
};

type DiseaseInformation = {
  title: string;
  paragraphs: string[];
  whatHappens?: string | null;
  causes?: string[];
  xrayAppearance?: string | null;
};

function imageTypeLabel(scanType?: AnalysisRecord["scanType"]): string {
  return scanType === "skin" ? "Skin lesion" : "Chest X-ray";
}

function getDiseaseInformation(prediction: string, scanType?: AnalysisRecord["scanType"]): DiseaseInformation {
  const detail = getFindingDetail(prediction);

  if (detail) {
    return {
      title: detail.title,
      paragraphs: detail.paragraphs,
      whatHappens: detail.whatHappens,
      causes: detail.causes,
      xrayAppearance: detail.xrayAppearance,
    };
  }

  // Generic fallback when no specific entry exists in the local data table
  const label = scanType === "skin" ? "skin lesion" : "chest X-ray";
  return {
    title: `About ${prediction}`,
    paragraphs: [
      `${prediction} is a ${label} finding highlighted by the Mediora AI screening model. AI output is for educational purposes only and requires review by a qualified clinician in the context of your symptoms and medical history.`,
      "Common next steps after any unexpected AI finding include arranging an in-person clinical evaluation, additional imaging (such as CT or ultrasound), and laboratory tests. Treatment decisions should only be made by a qualified healthcare professional after a complete assessment.",
    ],
    whatHappens: null,
    causes: [],
    xrayAppearance: null,
  };
}

function getGuidance(prediction: string, scanType?: AnalysisRecord["scanType"]): Guidance {
  const finding = prediction.toLowerCase();
  if (scanType === "skin" && finding.includes("malignant")) {
    return {
      specialist: "Dermatologist / skin-cancer specialist",
      urgency: "Arrange an in-person dermatology assessment promptly; a photo-based AI result cannot confirm cancer.",
      symptoms: ["A new or changing mole, spot, or sore", "Uneven colour, border, shape, or size", "A spot that bleeds, crusts, itches, or does not heal"],
      precautions: ["Protect skin from UV exposure with shade, clothing, and sunscreen", "Do not pick, cut, or attempt to remove the lesion", "Track changes with dated photos for your clinician"],
      treatment: ["A clinician may examine the area with dermoscopy", "Diagnosis may require a biopsy reviewed by a specialist", "Treatment is determined only after an in-person evaluation"],
      homeCare: ["Keep the area clean and avoid irritation", "Use sun protection while awaiting review", "Home remedies cannot diagnose or treat a suspicious lesion"],
    };
  }
  if (scanType === "skin") {
    return {
      specialist: "Dermatologist",
      urgency: "Book a routine skin review if the mark is new, changing, painful, or concerning.",
      symptoms: ["A mole or spot that changes over time", "Itching, bleeding, crusting, or a sore that does not heal", "Changes in colour, border, size, or texture"],
      precautions: ["Use broad sun protection and avoid tanning beds", "Avoid scratching or self-treating a changing lesion", "Monitor and photograph noticeable changes"],
      treatment: ["A dermatologist can examine the lesion and decide whether testing is needed", "Treatment depends on the confirmed cause", "Keep follow-up appointments if changes continue"],
      homeCare: ["Keep skin gently clean and moisturised if it is irritated", "Protect the area from friction and sun", "Do not use home removal products on an unexplained lesion"],
    };
  }
  if (finding.includes("cardiomegaly") || finding.includes("cardiomediastinum")) {
    return {
      specialist: "Cardiologist",
      urgency: "Seek timely clinical review, especially with chest discomfort, breathlessness, swelling, or fainting.",
      symptoms: ["Shortness of breath or reduced exercise tolerance", "Leg or ankle swelling", "Palpitations, chest discomfort, dizziness, or fatigue"],
      precautions: ["Do not ignore new chest pain or shortness of breath", "Avoid smoking and discuss alcohol use with a clinician", "Bring a list of medicines and health conditions to the appointment"],
      treatment: ["A clinician may order an ECG, echocardiogram, and blood tests", "Treatment depends on the confirmed heart condition", "Medication changes should only be made by a qualified clinician"],
      homeCare: ["Rest if symptoms occur and follow your existing care plan", "Avoid starting supplements or medicines for this result without advice", "Seek emergency help for severe chest pain, fainting, or breathing difficulty"],
    };
  }
  return {
    specialist: "Pulmonologist / respiratory physician",
    urgency: "Arrange a clinical review, particularly if you have a persistent cough, fever, chest pain, or trouble breathing.",
    symptoms: ["Cough, with or without mucus", "Fever, chills, fatigue, or feeling unwell", "Shortness of breath or pain when breathing or coughing"],
    precautions: ["Avoid smoking, vaping, and second-hand smoke", "Wash hands regularly and stay up to date with vaccines recommended by your clinician", "Wear a mask around others if you have a contagious respiratory illness"],
    treatment: ["A clinician may examine you and order imaging, oxygen checks, or laboratory tests", "Treatment depends on the confirmed cause; antibiotics do not treat viral infections", "Follow the prescribed plan and attend review if symptoms do not improve"],
    homeCare: ["Rest, drink fluids, and monitor symptoms while arranging care", "Use only medicines already recommended for you or confirmed by a pharmacist/clinician", "Get urgent help for severe breathing difficulty, blue lips, confusion, or severe chest pain"],
  };
}

export default function ResultClient({ analysisId }: ResultClientProps) {
  const { getToken } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const token = await getToken();
        setAnalysis(await fetchAnalysis(analysisId, token));
      } catch {
        setError("Could not load this analysis. Please return to the dashboard and try again.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [analysisId, getToken]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading analysis result…
      </main>
    );
  }

  if (!analysis) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <p className="text-sm text-red-700">{error || "Analysis not found."}</p>
        <Link href="/dashboard" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Back to dashboard</Link>
      </main>
    );
  }

  const topPrediction = analysis.prediction;
  const topConfidence = analysis.confidence;
  const analysisDate = new Date(analysis.createdAt).toLocaleDateString();
  const record = analysis;
  const selectedImageType = imageTypeLabel(record.scanType);
  const guidance = getGuidance(topPrediction, record.scanType);

  function downloadReport() {
    const findings = record.predictions?.length
      ? record.predictions
          .map((finding) => `- ${finding.disease}: ${finding.confidence}%`)
          .join("\n")
      : "- Detailed model findings are unavailable for this report.";
    const report = [
      `MEDIORA AI — ${selectedImageType.toUpperCase()} SCREENING REPORT`,
      "",
      `Report ID: ${record._id}`,
      `Created: ${new Date(record.createdAt).toLocaleString()}`,
      `Image: ${record.fileName}`,
      `Input image type: ${selectedImageType}`,
      "",
      "SCREENING RESULT",
      `Finding: ${topPrediction}`,
      `Model confidence: ${topConfidence}%`,
      "",
      "MODEL FINDINGS",
      findings,
      "",
      "IMPORTANT NOTICE",
      "This AI-generated output is an educational/research screening result only.",
      "It is not a medical diagnosis and must not replace evaluation by a qualified healthcare professional.",
    ].join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mediora-report-${record._id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles size={16} />
            </div>
            Mediora AI
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">ANALYSIS RESULT</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {selectedImageType} screening
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileImage size={14} />
                {analysis.fileName}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {analysisDate}
              </span>
              <span>Analysis ID: {analysisId}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              New Scan
            </Link>
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Download size={16} />
              Download Report
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">Uploaded {selectedImageType}</h2>
              <p className="mt-1 text-xs text-slate-500">
                Original image preview
              </p>
            </div>

            <div className="flex min-h-[280px] items-center justify-center bg-slate-950 p-4 md:min-h-[520px] md:p-8">
              {analysis.imageDataUrl ? (
                <InteractiveImage
                  src={analysis.imageDataUrl}
                  alt={`Uploaded ${selectedImageType}`}
                  containerClassName="w-full"
                  className="max-h-[360px] md:max-h-[520px]"
                />
              ) : (
                <p className="text-sm text-white">Image preview is unavailable for this saved report.</p>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI-assisted screening result
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">
                    {topPrediction}
                  </h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <ShieldAlert size={22} />
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Model confidence
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {topConfidence}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${topConfidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <Info className="mt-0.5 shrink-0" size={18} />
                <p>
                  This AI-generated screening result is for educational/research
                  purposes only. It is not a medical diagnosis.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                  All model findings
                  </h2>
                  <p className="text-xs text-slate-500">
                    {record.scanType === "skin"
                      ? "Probabilities across the skin-lesion classes."
                      : "Probabilities are independent; multiple findings can be present."}
                  </p>
                </div>
              </div>

              <div className="mt-5 max-h-72 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
                {(analysis.predictions ?? []).map((prediction) => {
                  const info = getFindingInfo(prediction.disease);
                  const urgencyStyle = info ? URGENCY_STYLES[info.urgency] : URGENCY_STYLES.low;
                  return (
                    <div key={prediction.disease}>
                      <FindingItem prediction={prediction} info={info} urgencyStyle={urgencyStyle} />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <CareGuidance key={`${topPrediction}-${record.scanType ?? ""}`} prediction={topPrediction} scanType={record.scanType} guidance={guidance} />

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={19} />
            <div>
              <p className="font-semibold text-emerald-900">Next step</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Review these research-only outputs with a qualified healthcare
                professional, particularly if there are symptoms or concerns.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-5 text-amber-900">
          <strong>Medical disclaimer:</strong> Mediora AI is an educational/research
          prototype. AI output must not be used as a medical diagnosis or as a
          substitute for evaluation by a qualified healthcare professional.
        </div>
      </section>
    </main>
  );
}

function CareGuidance({ prediction, scanType, guidance }: { prediction: string; scanType?: AnalysisRecord["scanType"]; guidance: Guidance }) {
  const { getToken } = useAuth();

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const [providers, setProviders] = useState<CareProvider[]>([]);
  const [providerError, setProviderError] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(false);

  // All disease information is stored locally — instant, no API call needed
  const diseaseInformation = useMemo(
    () => getDiseaseInformation(prediction, scanType),
    [prediction, scanType]
  );

  const mapQuery = `${guidance.specialist} ${prediction}`;
  const mapUrl = location
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${mapQuery} near ${location.latitude},${location.longitude}`)}&z=13&output=embed`
    : null;
  const mapsLink = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mapQuery} near ${location.latitude},${location.longitude}`)}`
    : null;

  async function loadProviders(latitude: number, longitude: number) {
    setLoadingProviders(true);
    setProviderError("");
    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
        condition: prediction,
      });
      const response = await fetch(`/api/care-providers?${params.toString()}`);
      const payload = (await response.json()) as { providers?: CareProvider[]; error?: string; source?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not load providers.");
      setProviders(payload.providers ?? []);
    } catch (error) {
      setProviderError(error instanceof Error ? error.message : "Could not load the local provider directory.");
    } finally {
      setLoadingProviders(false);
    }
  }

  function findNearbyCare() {
    if (!navigator.geolocation) {
      setLocationStatus("Location services are not supported in this browser. Use the map search instead.");
      return;
    }
    setLocating(true);
    setLocationStatus("Requesting permission to find nearby care…");

    // Try browser geolocation first
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLocation = { latitude: coords.latitude, longitude: coords.longitude };
        setLocation(nextLocation);
        setLocationStatus("Nearby provider details are shown below. Your location is used only for this search.");
        setLocating(false);
        void loadProviders(nextLocation.latitude, nextLocation.longitude);
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
              setLocationStatus("Found location via IP. Nearby providers are shown below.");
              setLocating(false);
              void loadProviders(nextLocation.latitude, nextLocation.longitude);
              return;
            }
          }
        } catch {
          // IP fallback also failed
        }

        // All methods failed
        let message = "We could not determine your location. Please use the map search to find nearby care.";
        if (error.code === 1) {
          message = "Location permission was denied. Please allow location access in your browser settings, or use the map search instead.";
        } else if (error.code === 2) {
          message = "Your location is currently unavailable. Please try again outdoors with GPS enabled, or use the map search.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again outdoors with clear sky view for GPS, or use the map search.";
        }
        setLocationStatus(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }

  const guidanceSections = [
    { title: "Possible symptoms", icon: HeartPulse, items: guidance.symptoms, tone: "bg-rose-50 text-rose-700" },
    { title: "Precautions", icon: ShieldAlert, items: guidance.precautions, tone: "bg-amber-50 text-amber-700" },
    { title: "Care and treatment", icon: Stethoscope, items: guidance.treatment, tone: "bg-blue-50 text-blue-700" },
    { title: "Supportive home care", icon: House, items: guidance.homeCare, tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Understanding this screening result</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Practical guidance for {prediction}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              These are general educational pointers, not a diagnosis or personalised treatment plan.
              {" "}{guidance.urgency}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
            <Stethoscope size={17} />
            {guidance.specialist}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Info className="mt-0.5 shrink-0 text-blue-600" size={19} />
            <div>
              <h3 className="font-semibold text-blue-950">{diseaseInformation.title}</h3>
              <div className="mt-1 space-y-3 text-sm leading-6 text-blue-900">
                {diseaseInformation.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <p className="mt-3 text-xs font-medium text-blue-700">
                Educational information — not a medical diagnosis.
              </p>
            </div>
          </div>
        </div>

        {(diseaseInformation.whatHappens || diseaseInformation.causes?.length || diseaseInformation.xrayAppearance) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {diseaseInformation.whatHappens && (
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">What happens?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{diseaseInformation.whatHappens}</p>
              </article>
            )}
            {diseaseInformation.causes?.length ? (
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Common causes</h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-600">
                  {diseaseInformation.causes.map((cause) => <li key={cause} className="flex gap-2"><span className="text-slate-400">•</span><span>{cause}</span></li>)}
                </ul>
              </article>
            ) : null}
            {diseaseInformation.xrayAppearance && (
              <article className="rounded-2xl border border-slate-100 bg-slate-50 p-5 md:col-span-2">
                <h3 className="font-semibold text-slate-900">On a chest X-ray</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{diseaseInformation.xrayAppearance}</p>
              </article>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {guidanceSections.map(({ title, icon: Icon, items, tone }) => (
            <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={16} />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-5 text-slate-600">
                {items.map((item) => <li key={item} className="flex gap-2"><span className="text-slate-400">•</span><span>{item}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Nearby specialist care</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Find a {guidance.specialist}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Click below to search for hospitals and specialists in your area. Always call ahead to confirm specialty and appointment availability.
            </p>
          </div>
          <button type="button" onClick={findNearbyCare} disabled={locating} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Navigation size={16} />
            {locating ? "Finding care…" : location ? "Refresh nearby care" : "Find nearby care"}
          </button>
        </div>

        {locationStatus && <p className="mx-6 mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{locationStatus}</p>}

        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-3 px-6 pt-5 sm:flex-row">
          {/* Hospitals Search */}
          <a
            href={`https://www.google.com/maps/search/hospital+near+${location ? `${location.latitude},${location.longitude}` : "me"}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
            </svg>
            Search Hospitals
          </a>

          {/* Specialist Search */}
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(guidance.specialist)}+near+${location ? `${location.latitude},${location.longitude}` : "me"}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Stethoscope size={20} />
            Search {guidance.specialist}
          </a>
        </div>

        {/* Map Display */}
        {mapUrl && (
          <div className="px-6 pt-4">
            <iframe
              title={`Map of ${mapQuery} near you`}
              src={mapUrl}
              className="h-72 w-full rounded-2xl border border-slate-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  <MapPin size={16} />
                  Open full map in Google Maps
                </a>
              )}
              {location && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  <Navigation size={16} />
                  Get directions to your location
                </a>
              )}
            </div>
          </div>
        )}

        {/* Provider Directory */}
        {location && (
          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-900">Nearby providers in directory</h3>
              <span className="text-xs text-slate-500">Data from OpenStreetMap</span>
            </div>
            {loadingProviders && <p className="mt-4 text-sm text-slate-500">Loading nearby providers…</p>}
            {providerError && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{providerError}</p>}
            {!loadingProviders && !providerError && providers.length === 0 && <p className="mt-4 text-sm text-slate-500">No providers found in this area. Use the search buttons above to find care in Google Maps.</p>}
            {providers.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {providers.map((provider) => (
                  <article key={provider.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">{provider.name}</p>
                      {provider.specialty && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {provider.specialty}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex gap-2 text-sm leading-5 text-slate-600">
                      <MapPin className="mt-0.5 shrink-0 text-slate-400" size={16} />
                      {provider.address}
                    </p>
                    {provider.availability && provider.availability.length < 100 && (
                      <p className="mt-2 flex gap-2 text-xs leading-5 text-slate-500">
                        <Clock3 className="mt-0.5 shrink-0" size={15} />
                        {provider.availability}
                      </p>
                    )}
                    {location && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provider.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Navigation size={12} />
                        Get directions
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {!location && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <MapPin size={28} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Click &ldquo;Find nearby care&rdquo; to search for hospitals and specialists in your area</p>
            <p className="mt-2 max-w-md text-xs text-slate-500">
              You can also use the search buttons above to find care in your area directly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FindingItem({
  prediction,
  info,
  urgencyStyle,
}: {
  prediction: { disease: string; confidence: number; above_threshold: boolean };
  info: FindingInfo | undefined;
  urgencyStyle: { color: string; bg: string; label: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const confidenceColor =
    prediction.confidence >= 70
      ? "text-red-600"
      : prediction.confidence >= 40
      ? "text-amber-600"
      : "text-slate-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition hover:border-slate-300">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {info && (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${urgencyStyle.bg} ${urgencyStyle.color}`}
              title={urgencyStyle.label}
            >
              {urgencyStyle.label}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{prediction.disease}</p>
            {info && (
              <p className="mt-0.5 truncate text-xs text-slate-500">{info.shortDescription}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`text-sm font-bold ${confidenceColor}`}>{prediction.confidence}%</span>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-3">
          {info ? (
            <p className="text-xs leading-5 text-slate-600">{info.explanation}</p>
          ) : (
            <p className="text-xs leading-5 text-slate-500">
              No additional information available for this finding.
            </p>
          )}
          {prediction.above_threshold && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              Above clinical threshold
            </p>
          )}
        </div>
      )}
    </div>
  );
}
