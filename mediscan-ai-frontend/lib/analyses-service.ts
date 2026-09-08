import { ObjectId } from "mongodb";
import {
  createDemoAnalysis,
  getDemoAnalysis,
  listDemoAnalyses,
  seedDemoAnalyses,
} from "./demo-store";
import { getAnalysesCollection, shouldUseDemoStore } from "./mongodb";
import type { AnalysisRecord } from "./types";

function toAnalysisRecord(doc: AnalysisRecord & { _id: unknown }): AnalysisRecord {
  return {
    ...doc,
    _id: String(doc._id),
  };
}

export async function listAnalyses(userId: string): Promise<AnalysisRecord[]> {
  if (shouldUseDemoStore()) {
    return listDemoAnalyses(userId);
  }

  const collection = await getAnalysesCollection();
  const docs = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(toAnalysisRecord);
}

export async function getAnalysis(
  id: string,
  userId: string
): Promise<AnalysisRecord | null> {
  if (shouldUseDemoStore()) {
    return getDemoAnalysis(id, userId);
  }

  const collection = await getAnalysesCollection();
  const query = ObjectId.isValid(id)
    ? { _id: new ObjectId(id), userId }
    : { _id: id as unknown as ObjectId, userId };

  const doc = await collection.findOne(query as never);
  return doc ? toAnalysisRecord(doc as AnalysisRecord & { _id: unknown }) : null;
}

export async function createAnalysis(input: {
  userId: string;
  fileName: string;
  imageDataUrl?: string;
  prediction: string;
  confidence: number;
  predictions: AnalysisRecord["predictions"];
  threshold: number;
  scanType: AnalysisRecord["scanType"];
}): Promise<AnalysisRecord> {
  if (shouldUseDemoStore()) {
    return createDemoAnalysis(input);
  }

  const collection = await getAnalysesCollection();
  const record = {
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

  const result = await collection.insertOne(record as never);
  return {
    ...record,
    _id: String(result.insertedId),
  };
}

export async function seedAnalyses(): Promise<number> {
  if (shouldUseDemoStore()) {
    return seedDemoAnalyses();
  }

  return 0;
}
