import { MongoClient, Db, Collection } from "mongodb";
import { isDemoMode, isMongoConfigured } from "./config";
import type { AnalysisRecord } from "./types";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "mediora";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(MONGODB_DB);
}

export async function getAnalysesCollection(): Promise<Collection<AnalysisRecord>> {
  const db = await getDb();
  return db.collection<AnalysisRecord>("analyses");
}

export function shouldUseDemoStore(): boolean {
  return isDemoMode() || !isMongoConfigured();
}
