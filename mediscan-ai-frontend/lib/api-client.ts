import type { AnalysisRecord, PredictionResponse, ScanType } from "@/lib/types";

const PREDICTION_API_URL =
  process.env.NEXT_PUBLIC_PREDICTION_API_URL ?? "http://localhost:8000";

/**
 * Read the JSON `detail` field from a FastAPI error response. FastAPI
 * returns either `{detail: "..."}` (HTTPException) or
 * `{detail: [{msg, ...}]}` (RequestValidationError); both are handled.
 */
function extractErrorDetail(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export async function authorizedFetch(
  path: string,
  token: string | null,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(path, { ...init, headers });
}

export async function fetchAnalyses(token: string | null): Promise<AnalysisRecord[]> {
  const response = await authorizedFetch("/api/analyses", token);
  if (!response.ok) {
    throw new Error("Failed to load analyses");
  }
  const data = (await response.json()) as { analyses: AnalysisRecord[] };
  return data.analyses;
}

export async function fetchAnalysis(
  id: string,
  token: string | null
): Promise<AnalysisRecord> {
  const response = await authorizedFetch(`/api/analyses/${id}`, token);
  if (!response.ok) {
    throw new Error("Failed to load analysis");
  }
  const data = (await response.json()) as { analysis: AnalysisRecord };
  return data.analysis;
}

export async function submitAnalysis(
  file: File,
  token: string | null,
  prediction: PredictionResponse
): Promise<AnalysisRecord> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("prediction", JSON.stringify(prediction));
  formData.append("scanType", prediction.scan_type);

  const response = await authorizedFetch("/api/analyses", token, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  const data = (await response.json()) as { analysis: AnalysisRecord };
  return data.analysis;
}

export type BackendAvailability = {
  ok: boolean;
  availableScanTypes: ScanType[];
  reason?: string;
};

/**
 * Probe the FastAPI backend's /ready endpoint. The backend is considered
 * usable if the request succeeds and reports at least one loaded model.
 * Network errors are surfaced as `{ok: false}` so the UI can fall back to
 * demo mode with a clear message.
 */
export async function checkBackendAvailability(): Promise<BackendAvailability> {
  try {
    const response = await fetch(`${PREDICTION_API_URL}/ready`, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { reason?: string; detail?: string }
        | null;
      return {
        ok: false,
        availableScanTypes: [],
        reason: payload?.reason ?? payload?.detail ?? `Backend not ready (HTTP ${response.status})`,
      };
    }
    const payload = (await response.json()) as {
      status: string;
      available_scan_types: ScanType[];
    };
    return {
      ok: payload.status === "ready",
      availableScanTypes: payload.available_scan_types ?? [],
    };
  } catch (error) {
    return {
      ok: false,
      availableScanTypes: [],
      reason:
        error instanceof Error
          ? `Could not reach ${PREDICTION_API_URL} — ${error.message}`
          : "Unknown network error reaching the backend.",
    };
  }
}

export async function predictXray(
  file: File,
  scanType: ScanType
): Promise<PredictionResponse> {
  const formData = new FormData();
  // The FastAPI endpoint intentionally expects the field name "file".
  formData.append("file", file);
  formData.append("scan_type", scanType);

  let response: Response;
  try {
    response = await fetch(`${PREDICTION_API_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      `Could not reach the prediction service at ${PREDICTION_API_URL}. ` +
        "Start the FastAPI backend on port 8000 (see backend/README.md)."
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | PredictionResponse
    | { detail?: string | { msg?: string }[] }
    | null;
  if (!response.ok || !payload || !("success" in payload)) {
    throw new Error(
      extractErrorDetail(
        payload,
        "The prediction service could not analyze this image."
      )
    );
  }
  return payload;
}
