"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileImage,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { predictXray, submitAnalysis } from "@/lib/api-client";
import type { ScanType } from "@/lib/types";
import InteractiveImage from "@/components/InteractiveImage";

type ScanState = "idle" | "ready" | "analyzing";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AnalyzeClient() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<ScanState>("idle");
  const [scanType, setScanType] = useState<ScanType>("chest");

  function acceptFile(selectedFile: File) {
    setError("");

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Please upload an image smaller than 10 MB.");
      return;
    }

    // Clean up previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(imageUrl);
    setState("ready");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    acceptFile(selectedFile);

    // Allows selecting the same file again
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    acceptFile(droppedFile);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
  }

  function removeFile() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");
    setError("");
    setState("idle");
  }

  const imageTypeLabel = scanType === "skin" ? "Skin image" : "Chest X-ray";
  const analysisLabel = scanType === "skin" ? "skin lesion" : "chest X-ray";

  async function analyzeImage() {
    if (!file) {
      setError(`Please upload a ${analysisLabel} image first.`);
      return;
    }

    setError("");
    setState("analyzing");

    try {
      const token = await getToken();
      const prediction = await predictXray(file, scanType);
      const analysis = await submitAnalysis(file, token, prediction);
      router.push(`/results/${analysis._id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Analysis failed. Please sign in and try again."
      );
      setState("ready");
    }
  }

  const fileSize = file
    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
    : "";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Back to home
          </Link>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles size={16} />
            </div>

            Mediora AI
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-blue-600">
            IMAGE TYPE SELECTION
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Upload an image for screening
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Choose the image type first, then upload a clear chest X-ray or skin-lesion photo for AI-assisted screening.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Input image type</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose the type that matches your image. Chest X-rays use the published
            chest ResNet-50; skin photos use a separately trained skin-lesion ResNet-50.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {([
              ["chest", "Chest X-ray"],
              ["skin", "Skin image"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setScanType(value)}
                disabled={state === "analyzing"}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  scanType === value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-3xl border-2 border-dashed p-10 text-center transition sm:p-16 ${
              dragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UploadCloud size={30} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              {dragging
                ? `Drop your ${analysisLabel} image here`
                : `Drag & drop your ${analysisLabel} image here`}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              or choose an image from your computer
            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              <FileImage size={17} />

              Browse Files

              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-5 text-xs text-slate-400">
              JPG • JPEG • PNG • Maximum 10 MB
            </p>
          </div>
        ) : (
          /* Preview */
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* File header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {imageTypeLabel} selected
                </p>

                <p className="text-xs text-slate-500">
                  {file.name} • {fileSize}
                </p>
              </div>

              <button
                onClick={removeFile}
                disabled={state === "analyzing"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Remove image"
              >
                <X size={19} />
              </button>
            </div>

            {/* Content */}
            <div className="grid gap-4 p-4 md:gap-6 md:p-6 md:grid-cols-[1.25fr_.75fr]">
              {/* Image */}
              <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950 p-3 md:min-h-[380px] md:p-4">
                {preview ? (
                  <InteractiveImage
                    src={preview}
                    alt={`Uploaded ${analysisLabel}`}
                    containerClassName="w-full"
                    className="max-h-[320px] md:max-h-[520px]"
                  />
                ) : (
                  <p className="text-sm text-white">
                    Unable to preview image
                  </p>
                )}
              </div>

              {/* Information */}
              <div className="flex flex-col">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Input image type
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {imageTypeLabel}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {scanType === "chest"
                      ? "Your image is ready for AI-assisted chest screening."
                      : "Your image is ready for AI-assisted skin-lesion screening."}
                  </p>
                </div>

                <div className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-blue-600"
                    size={19}
                  />

                  <p className="text-xs leading-5 text-blue-800">
                    Your selected input type determines which dedicated ResNet-50
                    model receives the image. Skin photos are never sent to the
                    chest X-ray model.
                  </p>
                </div>

                {/* Analyze */}
                <div className="mt-auto pt-6">
                  <button
                    onClick={analyzeImage}
                    disabled={state === "analyzing"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {state === "analyzing" ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Analyzing image...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Analyze {imageTypeLabel}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
