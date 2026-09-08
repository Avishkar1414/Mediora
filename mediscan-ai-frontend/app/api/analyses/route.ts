import { NextRequest, NextResponse } from "next/server";
import { verifyRequestAuth } from "@/lib/auth-server";
import { createAnalysis, listAnalyses } from "@/lib/analyses-service";
import type { PredictionResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = await verifyRequestAuth(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const analyses = await listAnalyses(user.uid);
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Failed to list analyses:", error);
    return NextResponse.json(
      { error: "Failed to load analyses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyRequestAuth(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const predictionRaw = formData.get("prediction");
    const scanType = formData.get("scanType");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }
    if (typeof predictionRaw !== "string") {
      return NextResponse.json({ error: "Prediction data is required" }, { status: 400 });
    }

    let prediction: PredictionResponse;
    try {
      prediction = JSON.parse(predictionRaw) as PredictionResponse;
    } catch {
      return NextResponse.json({ error: "Prediction data is invalid" }, { status: 400 });
    }
    if (
      !prediction.success ||
      !prediction.top_prediction ||
      !Array.isArray(prediction.predictions) ||
      typeof prediction.top_prediction.disease !== "string" ||
      typeof prediction.top_prediction.confidence !== "number"
    ) {
      return NextResponse.json({ error: "Prediction data is incomplete" }, { status: 400 });
    }
    if (
      (scanType !== "chest" && scanType !== "skin") ||
      prediction.scan_type !== scanType
    ) {
      return NextResponse.json({ error: "Only chest or skin model results can be saved" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageDataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const analysis = await createAnalysis({
      userId: user.uid,
      fileName: file.name,
      imageDataUrl,
      prediction: prediction.top_prediction.disease,
      confidence: prediction.top_prediction.confidence,
      predictions: prediction.predictions,
      threshold: prediction.threshold,
      scanType: prediction.scan_type,
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    console.error("Failed to create analysis:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}
