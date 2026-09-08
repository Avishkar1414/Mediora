"""Generate deterministic in-memory test images for offline self-tests.

These are *not* real medical images. They are engineered to exercise the
preprocessing and inference pipeline of each model without contacting the
network or relying on a real chest X-ray / skin-lesion photograph.
"""

from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def make_synthetic_xray(size: int = 512) -> Image.Image:
    """Create a grayscale 512x512 image that resembles an X-ray plate enough to
    pass the standard preprocessing pipeline (single channel, intensity range
    inside the expected 8-bit window)."""
    rng = np.random.default_rng(seed=20240101)
    gradient = np.linspace(40, 215, size, dtype=np.float32)
    canvas = np.tile(gradient, (size, 1))
    canvas += rng.normal(0, 8, canvas.shape).astype(np.float32)
    # Two rough lung-shaped ovals to give the model something structured.
    yy, xx = np.indices((size, size))
    left_lung = ((xx - size * 0.32) ** 2 + (yy - size * 0.55) ** 2) < (size * 0.18) ** 2
    right_lung = ((xx - size * 0.68) ** 2 + (yy - size * 0.55) ** 2) < (size * 0.18) ** 2
    canvas[left_lung | right_lung] = np.clip(canvas[left_lung | right_lung] - 35, 0, 255)
    canvas = np.clip(canvas, 0, 255).astype(np.uint8)
    image = Image.fromarray(canvas, mode="L").convert("RGB")
    return image


def make_synthetic_skin(size: int = 224) -> Image.Image:
    """Create a 224x224 skin-tone coloured image with a darker lesion patch.

    The exact colour is not medically meaningful; the goal is to exercise the
    Caffe/ImageNet preprocessing and the binary classifier's forward path.
    """
    rng = np.random.default_rng(seed=20240202)
    base = np.full((size, size, 3), [214, 184, 156], dtype=np.float32)
    noise = rng.normal(0, 6, base.shape).astype(np.float32)
    base = np.clip(base + noise, 0, 255)
    yy, xx = np.indices((size, size))
    lesion = ((xx - size * 0.55) ** 2 + (yy - size * 0.48) ** 2) < (size * 0.18) ** 2
    base[lesion] = np.clip(base[lesion] - [60, 40, 20], 0, 255)
    image = Image.fromarray(base.astype(np.uint8), mode="RGB")
    # Slight blur smooths the lesion edge so resizing does not alias hard.
    return image.filter(ImageFilter.GaussianBlur(radius=1.0))


def synthetic_fixture(scan_type: str) -> Image.Image:
    """Return an in-memory synthetic image appropriate for the scan type."""
    if scan_type == "chest":
        return make_synthetic_xray()
    if scan_type == "skin":
        return make_synthetic_skin()
    raise ValueError(f"No synthetic fixture for scan_type={scan_type!r}")


def write_fixture(path: Path, scan_type: str) -> Path:
    """Save a synthetic image to disk for repeated /predict smoke tests."""
    path.parent.mkdir(parents=True, exist_ok=True)
    image = synthetic_fixture(scan_type)
    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        image = image.convert("RGB")
        image.save(path, format="JPEG", quality=90)
    else:
        image.save(path, format="PNG")
    return path


def encode_for_upload(image: Image.Image, suffix: str = ".png") -> tuple[bytes, str]:
    """Return (bytes, content_type) for an in-memory multipart upload."""
    buffer = io.BytesIO()
    if suffix.lower() in {".jpg", ".jpeg"}:
        image.convert("RGB").save(buffer, format="JPEG", quality=90)
        return buffer.getvalue(), "image/jpeg"
    image.save(buffer, format="PNG")
    return buffer.getvalue(), "image/png"
