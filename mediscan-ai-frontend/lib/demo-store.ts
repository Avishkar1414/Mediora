import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { DEMO_PREDICTIONS, DEMO_USER } from "./config";
import type { AnalysisRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "analyses.json");

let memoryStore: AnalysisRecord[] | null = null;

function defaultSeedRecords(): AnalysisRecord[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return [
    {
      _id: "demo-1",
      userId: DEMO_USER.uid,
      fileName: "chest_xray_001.jpg",
      prediction: DEMO_PREDICTIONS["demo-1"].prediction,
      confidence: DEMO_PREDICTIONS["demo-1"].confidence,
      createdAt: now.toISOString(),
    },
    {
      _id: "demo-2",
      userId: DEMO_USER.uid,
      fileName: "chest_xray_002.png",
      prediction: DEMO_PREDICTIONS["demo-2"].prediction,
      confidence: DEMO_PREDICTIONS["demo-2"].confidence,
      createdAt: yesterday.toISOString(),
    },
    {
      _id: "demo-analysis-001",
      userId: DEMO_USER.uid,
      fileName: "chest_xray_demo.jpg",
      prediction: DEMO_PREDICTIONS["demo-analysis-001"].prediction,
      confidence: DEMO_PREDICTIONS["demo-analysis-001"].confidence,
      createdAt: now.toISOString(),
    },
  ];
}

async function ensureStore(): Promise<AnalysisRecord[]> {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    memoryStore = JSON.parse(raw) as AnalysisRecord[];
  } catch {
    memoryStore = defaultSeedRecords();
    await persistStore(memoryStore);
  }

  return memoryStore;
}

async function persistStore(records: AnalysisRecord[]): Promise<void> {
  memoryStore = records;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export async function listDemoAnalyses(userId: string): Promise<AnalysisRecord[]> {
  const records = await ensureStore();
  return records
    .filter((record) => record.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getDemoAnalysis(
  id: string,
  userId: string
): Promise<AnalysisRecord | null> {
  const records = await ensureStore();
  const record = records.find(
    (item) => item._id === id && item.userId === userId
  );
  return record ?? null;
}

export async function createDemoAnalysis(input: {
  userId: string;
  fileName: string;
  imageDataUrl?: string;
  prediction: string;
  confidence: number;
  predictions: AnalysisRecord["predictions"];
  threshold: number;
  scanType: AnalysisRecord["scanType"];
}): Promise<AnalysisRecord> {
  const records = await ensureStore();
  const record: AnalysisRecord = {
    _id: randomUUID(),
    userId: input.userId,
    fileName: input.fileName,
    prediction: input.prediction,
    confidence: input.confidence,
    predictions: input.predictions,
    threshold: input.threshold,
    scanType: input.scanType,
    imageDataUrl: input.imageDataUrl,
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);
  await persistStore(records);
  return record;
}

export async function seedDemoAnalyses(): Promise<number> {
  const records = defaultSeedRecords();
  await persistStore(records);
  return records.length;
}
