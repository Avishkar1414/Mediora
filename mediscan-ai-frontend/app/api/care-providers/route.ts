import { NextRequest, NextResponse } from "next/server";

type OverpassElement = {
  id: number;
  tags?: Record<string, string>;
};

type CareProvider = {
  id: string;
  name: string;
  address: string;
  availability: string;
  specialty?: string;
  distance?: string;
};

type GeminiProvider = {
  name: string;
  specialty: string;
  address: string;
  reason: string;
};

function readCoordinate(value: string | null) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function providerAddress(tags: Record<string, string>) {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"],
    tags["addr:city"] ?? tags["addr:district"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Address is not listed in this directory.";
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
}

async function fetchOSMProviders(latitude: number, longitude: number): Promise<CareProvider[]> {
  const query = `[out:json][timeout:12];
    (
      nwr["amenity"="doctors"](around:10000,${latitude},${longitude});
      nwr["healthcare"="doctor"](around:10000,${latitude},${longitude});
      nwr["amenity"="hospital"](around:10000,${latitude},${longitude});
    );
    out tags 24;`;

  try {
    const directoryUrl = new URL("https://overpass-api.de/api/interpreter");
    directoryUrl.searchParams.set("data", query);
    const response = await fetch(directoryUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MedioraAI/1.0 (nearby-care-directory)",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Directory returned ${response.status}`);

    const payload = (await response.json()) as { elements?: OverpassElement[] };
    const seen = new Set<string>();
    const providers: CareProvider[] = (payload.elements ?? []).flatMap((element) => {
      const tags = element.tags;
      const name = tags?.name?.trim();
      if (!tags || !name || seen.has(name.toLowerCase())) return [];
      seen.add(name.toLowerCase());

      // Extract specialty from tags
      let specialty = "";
      if (tags["healthcare:specialty"]) {
        specialty = tags["healthcare:specialty"];
      } else if (tags["amenity"] === "hospital") {
        specialty = "Hospital";
      } else if (tags["amenity"] === "doctors") {
        specialty = tags["doctor:type"] ?? "General Practitioner";
      }

      return [{
        id: String(element.id),
        name,
        specialty,
        address: providerAddress(tags),
        availability: tags.opening_hours
          ? `Reported hours: ${tags.opening_hours}`
          : "Hours are not listed — contact the provider to confirm availability.",
      }];
    });

    return providers.slice(0, 15); // Return more for Gemini to process
  } catch (error) {
    console.error("OSM fetch error:", error);
    return [];
  }
}

async function fetchGeminiProviders(
  providers: CareProvider[],
  latitude: number,
  longitude: number,
  condition: string,
  apiKey: string
): Promise<CareProvider[]> {
  if (providers.length === 0) return [];

  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  const providerList = providers
    .map((p, i) => `${i + 1}. ${p.name} - ${p.specialty || "General"} - ${p.address}`)
    .join("\n");

  const prompt = `You are a medical concierge helping a patient find the most relevant healthcare providers for their condition.

Patient's AI screening result: "${condition}"

Nearby providers from our directory:
${providerList}

Return JSON only with this exact shape:
{
  "recommendations": [
    {
      "index": 1,
      "specialty": "relevant specialty for this condition",
      "reason": "why this provider is suitable for this condition in 10-15 words"
    }
  ]
}

Rules:
- Select up to 6 most relevant providers for this condition
- Prioritize specialists relevant to the condition (e.g., pulmonologists for respiratory, dermatologists for skin, cardiologists for heart-related)
- Hospitals are good for serious conditions
- Return the index numbers from the provider list
- Write reason in plain English, patient-friendly tone
- Return empty array if no providers are relevant
- JSON only, no extra text`;

  try {
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
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      }
    );

    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
    if (!text) throw new Error("Gemini returned no text");

    const parsed = JSON.parse(text) as { recommendations?: { index: number; specialty: string; reason: string }[] };
    const recommendations = parsed.recommendations ?? [];

    // Map recommendations back to providers with enriched data
    const recommendedProviders: CareProvider[] = [];
    for (const rec of recommendations) {
      const provider = providers[rec.index - 1];
      if (provider) {
        recommendedProviders.push({
          ...provider,
          specialty: rec.specialty || provider.specialty,
          availability: rec.reason,
        });
      }
    }

    return recommendedProviders.slice(0, 6);
  } catch (error) {
    console.error("Gemini provider enhancement error:", error);
    // Return OSM providers filtered to essentials on error
    return providers.slice(0, 6).map((p) => ({
      ...p,
      availability: p.availability || "Contact for availability",
    }));
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latitude = readCoordinate(searchParams.get("lat"));
  const longitude = readCoordinate(searchParams.get("lng"));
  const condition = searchParams.get("condition")?.trim() || "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    latitude === null || longitude === null ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
  ) {
    return NextResponse.json({ error: "A valid location is required." }, { status: 400 });
  }

  // Fetch OSM providers first
  const osmProviders = await fetchOSMProviders(latitude, longitude);

  if (!apiKey) {
    // Return OSM providers without Gemini enhancement
    return NextResponse.json({
      providers: osmProviders.slice(0, 6),
      source: "directory",
    });
  }

  // Use Gemini to intelligently recommend providers based on condition
  const enhancedProviders = await fetchGeminiProviders(
    osmProviders,
    latitude,
    longitude,
    condition,
    apiKey
  );

  return NextResponse.json({
    providers: enhancedProviders.length > 0 ? enhancedProviders : osmProviders.slice(0, 6),
    source: enhancedProviders.length > 0 ? "ai-enhanced" : "directory",
  });
}
