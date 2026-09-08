"""CLI self-test for the Mediora AI multi-model backend.

Loads every registered model, runs the chest and skin services on a
synthetic in-memory fixture, and prints a per-model summary. Exits with
status 0 if at least one model produced a prediction, 1 otherwise.

Usage (PowerShell):

    .\\venv\\Scripts\\python.exe verify_backend.py
    .\\venv\\Scripts\\python.exe verify_backend.py --scan-type chest
    .\\venv\\Scripts\\python.exe verify_backend.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from typing import Any

from model_registry import build_default_registry, current_threshold
from utils.diagnostics import synthetic_fixture
from utils.request_context import configure_logging


def _run(scan_type: str, *, threshold: float) -> dict[str, Any]:
    registry = build_default_registry()
    registry.warm_up()
    entry = registry.get(scan_type)
    if not entry.is_available():
        return {
            "scan_type": scan_type,
            "ok": False,
            "skipped": True,
            "reason": entry.load_error or "model did not load",
        }
    image = synthetic_fixture(scan_type)
    started = time.perf_counter()
    result = entry.service.predict(image, threshold)  # type: ignore[union-attr]
    elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
    return {
        "scan_type": scan_type,
        "ok": True,
        "elapsed_ms": elapsed_ms,
        "device": str(getattr(entry.service, "device", "?")),
        "labels": list(getattr(entry.service, "labels", []) or []),
        "top_prediction": result.get("top_prediction"),
        "threshold": result.get("threshold"),
        "prediction_count": len(result.get("predictions", [])),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Mediora AI multi-model self-test")
    parser.add_argument(
        "--scan-type",
        choices=["chest", "skin", "all"],
        default="all",
        help="Which model to verify (default: all)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=None,
        help="Override PREDICTION_THRESHOLD for this run (0-1)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the result as JSON only (no human-readable text)",
    )
    args = parser.parse_args(argv)

    configure_logging()
    threshold = args.threshold if args.threshold is not None else current_threshold()
    scan_types = ["chest", "skin"] if args.scan_type == "all" else [args.scan_type]
    results = [_run(scan, threshold=threshold) for scan in scan_types]
    ok = any(r.get("ok") for r in results)

    if args.json:
        json.dump({"ok": ok, "results": results, "threshold": threshold}, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print(f"Threshold: {threshold}")
        for result in results:
            if result.get("skipped"):
                print(f"[{result['scan_type']}] SKIPPED — {result.get('reason')}")
            else:
                top = result.get("top_prediction") or {}
                print(
                    f"[{result['scan_type']}] OK — top: {top.get('disease')} "
                    f"({top.get('confidence')}% after_threshold={top.get('above_threshold')}) "
                    f"in {result.get('elapsed_ms')}ms on {result.get('device')}"
                )
                print(f"  labels: {result.get('labels')}")
        print()
        print("OVERALL:", "OK" if ok else "FAIL")

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
