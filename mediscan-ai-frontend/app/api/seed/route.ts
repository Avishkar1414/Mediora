import { NextResponse } from "next/server";
import { seedAnalyses } from "@/lib/analyses-service";

export async function POST() {
  try {
    const count = await seedAnalyses();
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("Failed to seed analyses:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
