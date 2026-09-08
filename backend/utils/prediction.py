"""Model loading and inference for the published chest X-ray checkpoint."""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass

import torch
import torchxrayvision as xrv
from PIL import Image

from utils.preprocessing import prepare_xray


MODEL_WEIGHTS = "resnet50-res512-all"
MODEL_NAME = "TorchXRayVision ResNet-50 (512px, all)"
DATASET_DESCRIPTION = (
    "Combined public chest X-ray cohorts used by this TorchXRayVision checkpoint: "
    "PadChest, NIH ChestX-ray14, RSNA, SIIM, and VinDr-CXR."
)


def display_label(label: str) -> str:
    return label.replace("_", " ")


@dataclass
class PredictionService:
    """Keeps one pretrained model in memory for all requests."""

    model: torch.nn.Module
    device: torch.device
    labels: list[str]
    output_indices: list[int]
    input_resolution: int

    @classmethod
    def load(cls) -> "PredictionService":
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # TorchXRayVision's first-download progress bar uses Unicode blocks.
        # Windows PowerShell can otherwise default to cp1252 and abort the
        # legitimate checkpoint download before model loading begins.
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        # TorchXRayVision downloads this named, published checkpoint to its
        # cache on first use and loads the matching DenseNet-121 architecture.
        model = xrv.models.ResNet(weights=MODEL_WEIGHTS, apply_sigmoid=True).to(
            device
        ).eval()
        # NaN operating thresholds mark outputs that this checkpoint does not
        # provide as valid findings. Preserve only verified output positions.
        valid_mask = torch.isfinite(model.op_threshs.detach().cpu())
        output_indices = valid_mask.nonzero(as_tuple=False).flatten().tolist()
        # The library normally enables its operating-point score remapping
        # whenever named weights are used. We disable that optional remapping
        # so the API returns actual sigmoid probabilities, not threshold-scaled
        # screening scores.
        model.op_threshs = None
        labels = [
            display_label(str(model.pathologies[index])) for index in output_indices
        ]
        return cls(
            model=model,
            device=device,
            labels=labels,
            output_indices=output_indices,
            input_resolution=int(model.input_resolution),
        )

    def predict(self, image: Image.Image, threshold: float) -> dict[str, object]:
        tensor = prepare_xray(image, self.input_resolution).to(self.device)
        with torch.no_grad():
            # `apply_sigmoid=True` above makes the model return independent
            # multi-label probabilities. Do not apply a softmax: findings are
            # not mutually exclusive.
            raw_probabilities = self.model(tensor)[0].detach().cpu()
            probabilities = raw_probabilities[self.output_indices].tolist()

        predictions = sorted(
            [
                {
                    "disease": label,
                    "confidence": round(float(probability) * 100, 2),
                    "above_threshold": float(probability) >= threshold,
                }
                for label, probability in zip(self.labels, probabilities, strict=True)
            ],
            key=lambda prediction: float(prediction["confidence"]),
            reverse=True,
        )
        return {
            "top_prediction": predictions[0],
            "predictions": predictions,
            "threshold": threshold,
        }


def prediction_threshold() -> float:
    value = float(os.getenv("PREDICTION_THRESHOLD", "0.5"))
    if not 0 <= value <= 1:
        raise ValueError("PREDICTION_THRESHOLD must be between 0 and 1.")
    return value
