"""Inference service for the research-only skin-lesion ResNet-50 model.

TensorFlow is treated as an *optional* dependency. If it is not installed in the
current environment, ``SkinPredictionService.load`` raises a clear ``ImportError``
that the FastAPI layer surfaces as a 503. Chest screening still works in that
case, so the rest of the multi-model backend stays online.
"""

from __future__ import annotations

import logging
import os
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING

LOGGER = logging.getLogger(__name__)

SKIN_MODEL_NAME = "Skin lesion ResNet-50 (benign vs malignant)"
SKIN_MODEL_SOURCE = "https://huggingface.co/devatreya/skin-lesion-resnet50/resolve/main/resnet50_best.h5"
DEFAULT_MODEL_PATH = Path("model/resnet50_best.h5")

# Reduced TensorFlow log noise before importing it; this only has an effect
# once the import below succeeds.
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

if TYPE_CHECKING:  # pragma: no cover - import-only typing
    import tensorflow as tf  # noqa: F401
    import numpy as np  # noqa: F401


def _try_import_tensorflow() -> tuple[bool, str | None]:
    """Return (ok, error). Keeps a TensorFlow failure from breaking the whole
    backend at import time."""
    try:
        import tensorflow  # noqa: F401
        import numpy  # noqa: F401
    except Exception as error:  # noqa: BLE001 - any import failure is reported
        return False, str(error)
    return True, None


def skin_model_path() -> Path:
    """Return an explicit model path or the project-local download cache path."""
    return Path(os.getenv("SKIN_RESNET50_WEIGHTS", str(DEFAULT_MODEL_PATH))).expanduser()


def ensure_skin_model(path: Path) -> Path:
    """Download the published model once when no custom checkpoint was supplied."""
    if path.is_file():
        return path

    if "SKIN_RESNET50_WEIGHTS" in os.environ:
        raise FileNotFoundError(f"Configured skin model was not found at {path}.")

    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(f"{path.suffix}.download")
    try:
        LOGGER.info("Downloading skin model from %s", SKIN_MODEL_SOURCE)
        urllib.request.urlretrieve(SKIN_MODEL_SOURCE, temporary_path)
        temporary_path.replace(path)
    except Exception as error:  # noqa: BLE001
        if temporary_path.exists():
            temporary_path.unlink()
        raise RuntimeError(
            "Could not download the skin ResNet-50 model. Check your internet "
            "connection or set SKIN_RESNET50_WEIGHTS to a local .h5 file."
        ) from error
    return path


@dataclass
class SkinPredictionService:
    """Keeps the dedicated trained skin-lesion ResNet-50 in memory."""

    model: "tf.keras.Model"
    device: str
    labels: list[str]

    @classmethod
    def load(cls) -> "SkinPredictionService":
        tf_ok, tf_error = _try_import_tensorflow()
        if not tf_error:
            pass
        if not tf_ok:
            raise ImportError(
                "TensorFlow is not installed. The skin-lesion route needs "
                "`pip install tensorflow` (or a local .h5 checkpoint via "
                "SKIN_RESNET50_WEIGHTS) to load. The chest X-ray route is "
                "still available without it."
            )
        import numpy as np  # local import: requires TF
        import tensorflow as tf  # local import: requires TF

        path = ensure_skin_model(skin_model_path())
        model = tf.keras.models.load_model(path, compile=False)
        device = "GPU" if tf.config.list_physical_devices("GPU") else "CPU"
        LOGGER.info("Loaded %s on %s", SKIN_MODEL_NAME, device)
        # Touch numpy so the import is not flagged as unused when this
        # service is used in isolation.
        _ = np.zeros((1, 1), dtype=np.float32)
        return cls(model=model, device=device, labels=["Benign", "Malignant"])

    def predict(self, image, threshold: float) -> dict[str, object]:
        import numpy as np  # local import: keeps the module TF-tolerant

        # This is the model card's Keras ResNet-50 preprocessing: resize to
        # 224px, RGB-to-BGR conversion, then Caffe/ImageNet channel means.
        image_array = np.asarray(
            image.convert("RGB").resize((224, 224)), dtype=np.float32
        )
        image_array = image_array[..., ::-1]
        image_array[..., 0] -= 103.939
        image_array[..., 1] -= 116.779
        image_array[..., 2] -= 123.68
        malignant_probability = float(
            self.model.predict(np.expand_dims(image_array, axis=0), verbose=0)[0][0]
        )
        malignant_probability = min(max(malignant_probability, 0.0), 1.0)
        probabilities = {
            "Benign": 1.0 - malignant_probability,
            "Malignant": malignant_probability,
        }
        predictions = sorted(
            [
                {
                    "disease": label,
                    "confidence": round(probability * 100, 2),
                    "above_threshold": probability >= threshold,
                }
                for label, probability in probabilities.items()
            ],
            key=lambda prediction: float(prediction["confidence"]),
            reverse=True,
        )
        return {
            "top_prediction": predictions[0],
            "predictions": predictions,
            "threshold": threshold,
        }


def tensorflow_installed() -> bool:
    """Return True if TensorFlow is importable in this environment."""
    ok, _ = _try_import_tensorflow()
    return ok
