import { NextRequest, NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/auth-server";
import { getAnalysis } from "@/lib/analyses-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyRequestAuth(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const analysis = await getAnalysis(id, user.uid);
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Failed to get analysis:", error);
    return NextResponse.json(
      { error: "Failed to load analysis" },
      { status: 500 }
    );
  }
}
