"""Preprocessing required by TorchXRayVision's 224px DenseNet classifier."""

from __future__ import annotations

import numpy as np
import torch
import torchxrayvision as xrv
from PIL import Image
from torchvision import transforms


def prepare_xray(image: Image.Image, resolution: int) -> torch.Tensor:
    """Return a single-channel tensor using the checkpoint's preprocessing.

    The TorchXRayVision checkpoint expects one grayscale channel scaled from
    an 8-bit image to the [-1024, 1024] range, followed by centre crop and a
    checkpoint-specific resize. This intentionally does *not* use ImageNet
    normalization.
    """

    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    grayscale = rgb.mean(axis=2)
    normalized = xrv.datasets.normalize(grayscale, 255)
    transform = transforms.Compose(
        [xrv.datasets.XRayCenterCrop(), xrv.datasets.XRayResizer(resolution)]
    )
    resized = transform(normalized[None, ...])
    return torch.from_numpy(resized).unsqueeze(0).float()
