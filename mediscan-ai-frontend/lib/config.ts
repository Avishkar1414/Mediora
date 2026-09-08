export function isDemoMode(): boolean {
  // The project advertises demo login as the local fallback. Keep it available
  // unless a deployed environment explicitly turns it off.
  return process.env.DEMO_MODE !== "false";
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export const DEMO_USER = {
  email: "demo@mediora.ai",
  password: "demo123456",
  uid: "demo-user",
  displayName: "Demo User",
};

type DemoPrediction = { prediction: string; confidence: number };

export const DEMO_PREDICTIONS: Record<string, DemoPrediction> = {
  "demo-analysis-001": { prediction: "Pneumonia", confidence: 91.4 },
  "demo-1": { prediction: "Normal", confidence: 87.2 },
  "demo-2": { prediction: "Pneumonia", confidence: 78.5 },
};

export function getDemoPrediction(id?: string): DemoPrediction {
  if (id && DEMO_PREDICTIONS[id]) {
    return DEMO_PREDICTIONS[id];
  }
  return { prediction: "Pneumonia", confidence: 91.4 };
}
