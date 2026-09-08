"""Multi-model registry for the Mediora AI backend.

This module is the single source of truth for "what models are wired up, and
how do you call them". It treats chest X-ray and skin-lesion models as
first-class peers under a common ``ModelEntry`` interface, and is designed
so a model that fails to load (missing optional dependency, absent checkpoint,
no GPU, etc.) never blocks the rest of the service.

Each entry exposes a uniform ``predict(image, threshold)`` contract. The
FastAPI layer only knows about ``ModelRegistry`` — it does not have to
import PyTorch *or* TensorFlow.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Callable, Iterable, Protocol

from PIL import Image

from utils import skin_prediction
from utils.prediction import (
    DATASET_DESCRIPTION,
    MODEL_NAME as CHEST_MODEL_NAME,
    MODEL_WEIGHTS as CHEST_WEIGHTS,
    PredictionService as ChestPredictionService,
    prediction_threshold,
)

LOGGER = logging.getLogger(__name__)

ScanType = str
PredictionDict = dict[str, object]


class SupportsPredict(Protocol):
    """Minimal contract for any model service used by the registry."""

    labels: list[str]
    device: Any

    def predict(self, image: Image.Image, threshold: float) -> PredictionDict: ...


@dataclass
class ModelEntry:
    """A registered model: name, loader, and the live service once loaded."""

    scan_type: ScanType
    display_name: str
    loader: Callable[[], SupportsPredict]
    service: SupportsPredict | None = None
    load_error: str | None = None
    metadata: dict[str, object] = field(default_factory=dict)

    def is_available(self) -> bool:
        return self.service is not None

    def require(self) -> SupportsPredict:
        if self.service is None:
            detail = f"The {self.scan_type} model is not available."
            if self.load_error:
                detail = f"{detail} Model load error: {self.load_error}"
            raise ModelUnavailableError(detail)
        return self.service


class ModelUnavailableError(RuntimeError):
    """Raised when a request targets a model that did not load successfully."""


class ModelRegistry:
    """Holds every model the API exposes, keyed by scan_type."""

    def __init__(self, entries: Iterable[ModelEntry]):
        self._entries: dict[ScanType, ModelEntry] = {entry.scan_type: entry for entry in entries}

    def __contains__(self, scan_type: str) -> bool:
        return scan_type in self._entries

    def scan_types(self) -> list[str]:
        return list(self._entries.keys())

    def get(self, scan_type: str) -> ModelEntry:
        try:
            return self._entries[scan_type]
        except KeyError as error:
            raise ModelUnavailableError(
                f"Scan type {scan_type!r} is not registered. "
                f"Known: {sorted(self.scan_types())}"
            ) from error

    def available_scan_types(self) -> list[str]:
        return [t for t, entry in self._entries.items() if entry.is_available()]

    def status(self) -> dict[str, dict[str, object]]:
        def _device_str(service: object) -> str:
            device = getattr(service, "device", None)
            if device is None:
                return "unavailable"
            return str(device)

        def _json_safe(value: object) -> object:
            """Coerce Path/Enums/torch.device into JSON-friendly primitives."""
            if isinstance(value, dict):
                return {k: _json_safe(v) for k, v in value.items()}
            if isinstance(value, (list, tuple)):
                return [_json_safe(v) for v in value]
            path_cls = type(value).__name__
            if path_cls in {"PosixPath", "WindowsPath", "Path"}:
                return str(value)
            type_name = type(value).__name__
            if type_name == "device":
                return str(value)
            return value

        return {
            entry.scan_type: {
                "display_name": entry.display_name,
                "available": entry.is_available(),
                "device": _device_str(entry.service) if entry.service else "unavailable",
                "labels": list(getattr(entry.service, "labels", []) or []),
                "metadata": _json_safe(entry.metadata),
                "load_error": entry.load_error,
            }
            for entry in self._entries.values()
        }

    def warm_up(self) -> None:
        """Load every registered model, recording failures but never raising."""
        for entry in self._entries.values():
            try:
                entry.service = entry.loader()
                LOGGER.info(
                    "Loaded %s model (%s) on %s",
                    entry.scan_type,
                    entry.display_name,
                    getattr(entry.service, "device", "?"),
                )
                entry.load_error = None
            except Exception as error:  # noqa: BLE001 - any load failure is reported
                entry.service = None
                entry.load_error = str(error)
                LOGGER.warning(
                    "Model %s (%s) is unavailable: %s",
                    entry.scan_type,
                    entry.display_name,
                    error,
                )

    def shutdown(self) -> None:
        for entry in self._entries.values():
            entry.service = None

    def predict(self, scan_type: str, image: Image.Image, threshold: float) -> PredictionDict:
        entry = self.get(scan_type)
        service = entry.require()
        return service.predict(image, threshold)


def build_default_registry() -> ModelRegistry:
    """Construct the registry with the chest and skin services the backend ships with."""

    def _load_chest() -> SupportsPredict:
        return ChestPredictionService.load()

    def _load_skin() -> SupportsPredict:
        return skin_prediction.SkinPredictionService.load()

    chest_entry = ModelEntry(
        scan_type="chest",
        display_name=CHEST_MODEL_NAME,
        loader=_load_chest,
        metadata={
            "checkpoint": CHEST_WEIGHTS,
            "dataset": DATASET_DESCRIPTION,
            "framework": "pytorch+torchxrayvision",
            "input_preprocessing": (
                "RGB converted to grayscale; scaled to [-1024, 1024]; "
                "centre-cropped and resized to 512x512."
            ),
            "output": "Independent sigmoid probabilities for multi-label findings.",
        },
    )
    skin_entry = ModelEntry(
        scan_type="skin",
        display_name=skin_prediction.SKIN_MODEL_NAME,
        loader=_load_skin,
        metadata={
            "checkpoint": str(skin_prediction.skin_model_path()),
            "source": skin_prediction.SKIN_MODEL_SOURCE,
            "framework": "tensorflow/keras",
            "input_preprocessing": (
                "RGB; resize to 224x224, convert to BGR, then apply "
                "ResNet-50 Caffe/ImageNet channel means."
            ),
            "output": "Binary sigmoid probabilities for benign and malignant lesion classes.",
            "tensorflow_installed": skin_prediction.tensorflow_installed(),
        },
    )
    return ModelRegistry([chest_entry, skin_entry])


def current_threshold() -> float:
    return prediction_threshold()
