"""FastAPI service for the Mediora AI multi-model screening API.

The service hosts a chest X-ray model and a skin-lesion model side by side.
Every request goes through a single :class:`ModelRegistry`, so adding a new
model only requires registering another ``ModelEntry``.
"""

from __future__ import annotations

import io
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from PIL import Image, UnidentifiedImageError

from model_registry import (
    ModelRegistry,
    ModelUnavailableError,
    build_default_registry,
    current_threshold,
)
from utils.diagnostics import encode_for_upload, synthetic_fixture
from utils.request_context import configure_logging, request_scope

LOGGER = logging.getLogger("mediora.api")
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png"}
SUPPORTED_SCAN_TYPES = ("chest", "skin")
KNOWN_SCAN_TYPES = ("chest", "skin", "bone", "other")
MIN_LABELS_FOR_READY = 1  # at least one model must be live for /ready to be 200

configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Warm every model in the registry exactly once when the app starts."""
    registry.warm_up()
    yield
    registry.shutdown()


registry: ModelRegistry = build_default_registry()
app = FastAPI(
    title="Mediora AI Prediction API",
    version="2.0.0",
    description=(
        "Multi-model medical-imaging screening prototype. Hosts a chest X-ray "
        "classifier and a skin-lesion classifier behind a common API."
    ),
    lifespan=lifespan,
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Attach a request id header to every response for client correlation."""
    response = await call_next(request)
    response.headers.setdefault("X-Mediora-Request-Id", getattr(request.state, "request_id", ""))
    return response


def _validate_upload(upload: UploadFile, content: bytes) -> Image.Image:
    filename = upload.filename or "uploaded-image"
    suffix = os.path.splitext(filename.lower())[1]
    if upload.content_type not in ALLOWED_CONTENT_TYPES or suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=415, detail="Only JPG, JPEG, and PNG images are supported."
        )
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")

    try:
        with Image.open(io.BytesIO(content)) as probe:
            probe.verify()
        with Image.open(io.BytesIO(content)) as opened:
            return opened.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise HTTPException(status_code=400, detail="The upload is not a valid image.") from error


@app.get("/health")
def health() -> dict[str, object]:
    """Lightweight liveness probe — always 200 if the process is up."""
    available = registry.available_scan_types()
    return {
        "status": "ok" if available else "degraded",
        "available_scan_types": available,
        "registered_scan_types": registry.scan_types(),
        "models": registry.status(),
    }


@app.get("/ready")
def ready() -> dict[str, object]:
    """Readiness probe — 200 only if at least one model is live, 503 otherwise."""
    available = registry.available_scan_types()
    if not available:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "reason": "No models finished loading. Check backend startup logs.",
                "models": registry.status(),
            },
        )
    return {"status": "ready", "available_scan_types": available}


@app.get("/model-info")
def model_info() -> dict[str, object]:
    """Factual metadata and class lists for each registered model."""
    return {
        "models": registry.status(),
        "supported_scan_types": list(SUPPORTED_SCAN_TYPES),
        "known_scan_types": list(KNOWN_SCAN_TYPES),
        "unavailable_scan_types": {
            "bone": "No validated bone-specific checkpoint is configured.",
            "other": "No validated model is configured for this body region.",
        },
    }


@app.get("/verify")
def verify_all() -> dict[str, object]:
    """Offline self-test: run every loaded model against a synthetic image."""
    results: dict[str, object] = {}
    overall_ok = True
    for scan_type in SUPPORTED_SCAN_TYPES:
        entry = registry.get(scan_type)
        if not entry.is_available():
            results[scan_type] = {
                "ok": False,
                "skipped": True,
                "reason": entry.load_error or "model not loaded",
            }
            overall_ok = False
            continue
        try:
            fixture = synthetic_fixture(scan_type)
            prediction = entry.service.predict(fixture, current_threshold())  # type: ignore[union-attr]
            top = prediction.get("top_prediction") if isinstance(prediction, dict) else None
            results[scan_type] = {
                "ok": True,
                "top_prediction": top,
                "predictions": prediction.get("predictions", []) if isinstance(prediction, dict) else [],
                "threshold": prediction.get("threshold") if isinstance(prediction, dict) else None,
            }
        except Exception as error:  # noqa: BLE001 - report the test failure
            LOGGER.exception("Self-test failed for %s", scan_type)
            results[scan_type] = {
                "ok": False,
                "skipped": False,
                "reason": f"{type(error).__name__}: {error}",
            }
            overall_ok = False
    return {
        "ok": overall_ok,
        "results": results,
        "available_scan_types": registry.available_scan_types(),
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...), scan_type: str = Form("chest")
) -> dict[str, object]:
    scan_type = scan_type.strip().lower()
    if scan_type not in KNOWN_SCAN_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Scan type must be chest, skin, bone, or other.",
        )
    if scan_type not in SUPPORTED_SCAN_TYPES:
        raise HTTPException(
            status_code=422,
            detail=(
                "This scan type is not supported yet. Mediora AI will not use a "
                "chest or skin model for bone or other body-region images."
            ),
        )

    with request_scope(scan_type=scan_type) as ctx:
        try:
            entry = registry.get(scan_type)
            service = entry.require()
        except ModelUnavailableError as error:
            ctx.extras["reason"] = "model_unavailable"
            raise HTTPException(status_code=503, detail=str(error)) from error

        content = await file.read()
        ctx.extras["filename"] = file.filename
        ctx.extras["bytes"] = len(content)
        image = _validate_upload(file, content)

        try:
            threshold = current_threshold()
            result = service.predict(image, threshold)
        except ValueError as error:
            raise HTTPException(status_code=500, detail=str(error)) from error
        except Exception as error:  # noqa: BLE001
            LOGGER.exception("Prediction failed for %s", scan_type)
            raise HTTPException(
                status_code=500,
                detail="The model could not analyze this image.",
            ) from error

        ctx.extras["top"] = (result.get("top_prediction") or {}).get("disease") if isinstance(result, dict) else None
        return {
            "success": True,
            "filename": file.filename,
            "scan_type": scan_type,
            "request_id": ctx.request_id,
            **result,
        }


# Provide a tiny self-test endpoint that returns a synthetic image so the
# frontend (or a developer) can hit ``/predict`` without needing real
# medical images. This never uses the real models.
@app.get("/test-fixture/{scan_type}")
def test_fixture(scan_type: str) -> JSONResponse:
    if scan_type not in SUPPORTED_SCAN_TYPES:
        raise HTTPException(status_code=400, detail="Unknown scan type.")
    image = synthetic_fixture(scan_type)
    payload, content_type = encode_for_upload(image, ".png")
    from fastapi.responses import Response
    return Response(content=payload, media_type=content_type)
