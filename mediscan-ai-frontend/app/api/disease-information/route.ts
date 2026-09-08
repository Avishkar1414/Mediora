import { NextRequest, NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/auth-server";

type GeneratedInformation = {
  title?: unknown;
  paragraphs?: unknown;
  whatHappens?: unknown;
  causes?: unknown;
  xrayAppearance?: unknown;
};

function asText(value: unknown, maximumLength: number) {
  return typeof value === "string" && value.trim() && value.length <= maximumLength
    ? value.trim()
    : null;
}

// In-memory cache for AI-generated disease information (1 hour TTL)
const CACHE_TTL_MS = 60 * 60 * 1000;
type CacheEntry = { information: object; expiresAt: number };
const diseaseCache = new Map<string, CacheEntry>();

function getCacheKey(disease: string, scanType: string): string {
  return `${scanType}::${disease.toLowerCase().trim()}`;
}

function getCachedInformation(disease: string, scanType: string) {
  const key = getCacheKey(disease, scanType);
  const entry = diseaseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    diseaseCache.delete(key);
    return null;
  }
  return entry.information;
}

function setCachedInformation(disease: string, scanType: string, information: object) {
  const key = getCacheKey(disease, scanType);
  diseaseCache.set(key, { information, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
  const user = await verifyRequestAuth(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disease = request.nextUrl.searchParams.get("disease")?.trim();
  const scanType = request.nextUrl.searchParams.get("scanType")?.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!disease || disease.length > 80 || (scanType !== "chest" && scanType !== "skin")) {
    return NextResponse.json({ error: "A valid screening finding is required." }, { status: 400 });
  }

  // Check cache first — instant response for repeated requests
  const cached = getCachedInformation(disease, scanType);
  if (cached) {
    return NextResponse.json({ information: cached, cached: true });
  }

  // If no API key, return a friendly error so the frontend uses its local fallback
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI disease information is not configured. The local fallback information will be used." },
      { status: 503 }
    );
  }

  const prompt = `You are a medical information assistant. The AI screening model predicted "${disease}" from a ${scanType === "chest" ? "chest X-ray" : "skin image"}.

Write 2 detailed, patient-friendly paragraphs (60-100 words each) about this specific condition or finding. Be concrete and informative — not vague or generic.

Return JSON only with this exact shape:
{
  "title": "About [condition name]",
  "paragraphs": ["first paragraph 60-100 words", "second paragraph 60-100 words"],
  "whatHappens": "2-3 sentence explanation of the pathophysiology (what goes wrong in the body)",
  "causes": ["cause 1", "cause 2", "cause 3", "cause 4"],
  "xrayAppearance": "2-3 sentence description of how this appears on a chest X-ray (chest X-ray only)"
}

Rules:
- Write as if explaining to an intelligent patient who wants to understand their health
- Include specific, accurate medical details about THIS condition
- Do NOT use generic filler like "this finding should be interpreted with symptoms"
- Do NOT say "a qualified clinician can help" — patients know that
- Do NOT prescribe medications or doses
- For xrayAppearance: describe actual radiographic findings (patterns, densities, locations)
- Return null/omit optional fields if not clinically applicable
- If the finding is very vague like "Infiltration" or "Abnormal", provide general information about what such findings might indicate`;

  try {
    const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 600,
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("");
    if (!text) throw new Error("Gemini returned no text content");

    const generated = JSON.parse(text) as GeneratedInformation;
    const title = asText(generated.title, 120);
    const paragraphs = Array.isArray(generated.paragraphs)
      ? generated.paragraphs.map((paragraph) => asText(paragraph, 700)).filter((paragraph): paragraph is string => Boolean(paragraph))
      : [];
    if (!title || paragraphs.length < 1) throw new Error("Gemini returned an invalid information format");
    if (paragraphs.length > 3) {
      paragraphs.length = 3; // Cap at 3 paragraphs
    }

    const causes = Array.isArray(generated.causes)
      ? generated.causes.map((cause) => asText(cause, 180)).filter((cause): cause is string => Boolean(cause)).slice(0, 5)
      : [];
    const information = {
      title,
      paragraphs,
      whatHappens: asText(generated.whatHappens, 600),
      causes,
      xrayAppearance: asText(generated.xrayAppearance, 600),
    };
    // Cache the AI response for 1 hour so repeated lookups are instant
    setCachedInformation(disease, scanType, information);
    return NextResponse.json({ information });
  } catch (error) {
    console.error("Could not generate disease information:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Could not generate disease information." }, { status: 502 });
  }
}
