export type AnalysisRecord = {
  _id: string;
  userId: string;
  fileName: string;
  prediction: string;
  confidence: number;
  predictions?: Prediction[];
  threshold?: number;
  scanType?: ScanType;
  imageDataUrl?: string;
  createdAt: string;
};

export type ScanType = "chest" | "skin" | "bone" | "other";

export type Prediction = {
  disease: string;
  confidence: number;
  above_threshold: boolean;
};

export type PredictionResponse = {
  success: true;
  filename: string;
  top_prediction: Prediction;
  predictions: Prediction[];
  threshold: number;
  scan_type: "chest" | "skin";
};

export type AuthUser = {
  uid: string;
  email: string;
  displayName?: string;
};

export type DemoPrediction = {
  prediction: string;
  confidence: number;
};
