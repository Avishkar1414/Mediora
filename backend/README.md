# Mediora AI — Multi-Model Backend

This FastAPI service hosts a **multi-model screening pipeline** behind a
single API:

| Scan type   | Model                                | Framework                       | Status                                 |
| ----------- | ------------------------------------ | ------------------------------- | -------------------------------------- |
| `chest`     | TorchXRayVision ResNet-50 (512px)    | PyTorch + `torchxrayvision`     | Always loaded                          |
| `skin`      | Skin-lesion ResNet-50 (benign/malig.)| TensorFlow / Keras              | Loaded when TF is installed            |
| `bone`      | —                                    | —                               | Returns 422 (not supported yet)        |
| `other`     | —                                    | —                               | Returns 422 (not supported yet)        |

Both models live behind a single `ModelRegistry` (`model_registry.py`) so
adding a third model is a single registration call. **The chest route
works even if TensorFlow is missing** — the skin route then returns
HTTP 503 with a clear diagnostic instead of producing a non-medical
prediction.

> **Medical disclaimer:** This is an educational/research prototype, **not
> a medical device or diagnosis**. A qualified clinician must interpret
> any output clinically.

---

## API

| Method | Path               | Purpose                                                    |
| ------ | ------------------ | ---------------------------------------------------------- |
| `GET`  | `/health`          | Always-200 liveness probe; lists every model's status     |
| `GET`  | `/ready`           | Readiness probe; 200 only if ≥ 1 model is loaded, else 503 |
| `GET`  | `/model-info`      | Class lists, framework, preprocessing, and metadata        |
| `GET`  | `/verify`          | Offline self-test that runs every loaded model            |
| `GET`  | `/test-fixture/{chest&#124;skin}` | Returns a synthetic PNG for smoke tests         |
| `POST` | `/predict`         | Multipart upload (`file` + `scan_type`)                    |

### `POST /predict`

Form fields:

- `file`: JPG, JPEG, or PNG, ≤ 10 MB.
- `scan_type`: one of `chest`, `skin`, `bone`, `other`. Only `chest`
  and `skin` are wired up; `bone`/`other` return HTTP 422.

Example response:

```json
{
  "success": true,
  "filename": "xray.png",
  "scan_type": "chest",
  "request_id": "dfb59e442e2d",
  "top_prediction": { "disease": "Effusion", "confidence": 3.16, "above_threshold": false },
  "predictions": [
    { "disease": "Effusion",  "confidence": 3.16, "above_threshold": false },
    { "disease": "Infiltration", "confidence": 0.22, "above_threshold": false },
    "..."
  ],
  "threshold": 0.5
}
```

Every response includes `request_id`. The same id is in the
`X-Mediora-Request-Id` response header and in the backend's structured
log line for the request.

### `GET /verify`

Runs every loaded model against a deterministic synthetic image and
returns the per-model top prediction. Returns `ok: false` if any model
fails. Useful for CI, smoke tests, and "is the backend healthy?"
post-deploy probes.

---

## Selected models and sources

### Chest X-ray — TorchXRayVision ResNet-50

- **Model:** `xrv.models.ResNet(weights="resnet50-res512-all")`
- **Checkpoint source:** [TorchXRayVision](https://github.com/mlmed/torchxrayvision) — downloaded automatically on first startup and cached by the library.
- **Training data:** PadChest, NIH ChestX-ray14, RSNA, SIIM, VinDr-CXR. See the [TorchXRayVision docs](https://torchxrayvision.readthedocs.io/en/latest/).
- **Preprocessing:** RGB → grayscale, scaled from 8-bit intensities to `[-1024, 1024]`, centre-cropped, resized to 512 × 512. **Not** ImageNet-normalized.
- **Output:** 16 independent sigmoid probabilities (the 18-output checkpoint
  with two NaN-marked outputs is filtered to verified positions).
- **Disabled remap:** the library's optional operating-point remap is
  switched off, so the API returns raw sigmoid probabilities rather than
  threshold-scaled screening scores.

### Skin lesion — Keras ResNet-50 (binary)

- **Model:** `devatreya/skin-lesion-resnet50` from Hugging Face, a Keras
  ResNet-50 with a single sigmoid head (benign vs malignant).
- **Checkpoint source:** <https://huggingface.co/devatreya/skin-lesion-resnet50/resolve/main/resnet50_best.h5>
- **Preprocessing:** RGB → 224 × 224 → BGR → Caffe/ImageNet channel means
  (103.939, 116.779, 123.68).
- **Output:** `sigmoid` probability for the *malignant* class; benign
  probability is `1 - malignant`.

Override the checkpoint with a local file by exporting
`SKIN_RESNET50_WEIGHTS=...` before starting the API.

---

## Install and run (Windows PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt        # core + chest route
# Optional — enables the skin route (~400 MB):
pip install tensorflow==2.19.1

# Quickest start:
.\start_backend.ps1
# Or, equivalently:
$env:PYTHONIOENCODING = "utf-8"
uvicorn main:app --host 127.0.0.1 --port 8000
```

The first start downloads the TorchXRayVision weights (~100 MB) and, if
enabled, the skin `.h5` (~100 MB). Subsequent starts reuse the local
cache. CUDA is used automatically when PyTorch detects a GPU; otherwise
inference runs on CPU.

### Quick smoke test

```powershell
# In another terminal, from anywhere:
curl http://127.0.0.1:8000/ready
curl http://127.0.0.1:8000/model-info
curl http://127.0.0.1:8000/verify
```

Or use the bundled CLI self-test (no HTTP server needed):

```powershell
.\venv\Scripts\python.exe verify_backend.py
.\venv\Scripts\python.exe verify_backend.py --scan-type chest --json
```

### Predict from the command line

```powershell
curl -F "file=@test_fixtures/synth_xray.png" -F "scan_type=chest" http://127.0.0.1:8000/predict
curl -F "file=@test_fixtures/synth_skin.png" -F "scan_type=skin"  http://127.0.0.1:8000/predict
```

The `test_fixtures/` directory is created the first time the
`verify_backend.py` script runs (or you can `mkdir test_fixtures` and
`curl -o test_fixtures/synth_xray.png http://127.0.0.1:8000/test-fixture/chest`).

---

## Configuration

| Env var                  | Default                                                | Effect                                                      |
| ------------------------ | ------------------------------------------------------ | ----------------------------------------------------------- |
| `PREDICTION_THRESHOLD`   | `0.5`                                                  | Threshold for the `above_threshold` flag (0–1). All probabilities are always returned. |
| `CORS_ORIGINS`           | `http://localhost:3000,http://127.0.0.1:3000`          | Comma-separated allow-list for the frontend.                |
| `SKIN_RESNET50_WEIGHTS`  | `model/resnet50_best.h5`                               | Override the skin checkpoint path.                         |
| `LOG_LEVEL`              | `INFO`                                                 | Uvicorn/mediora log level.                                  |
| `PYTHONIOENCODING`       | (not set)                                              | Set to `utf-8` to avoid Windows cp1252 issues during the first TorchXRayVision download. |

---

## Project layout

```
backend/
├── main.py                  # FastAPI app, endpoints, lifespan
├── model_registry.py        # ModelEntry + ModelRegistry (multi-model abstraction)
├── verify_backend.py        # CLI self-test
├── start_backend.ps1        # Convenience launcher
├── requirements.txt
├── utils/
│   ├── prediction.py        # Chest X-ray service (PyTorch + torchxrayvision)
│   ├── skin_prediction.py   # Skin lesion service (TensorFlow/Keras, optional)
│   ├── preprocessing.py     # X-ray-specific preprocessing
│   ├── diagnostics.py       # Synthetic test images + helpers
│   └── request_context.py   # Request id, timing, structured logging
├── model/                   # Cached checkpoints (created on first start)
└── test_fixtures/           # Generated synthetic images for smoke tests
```

---

## Troubleshooting

| Symptom                                                       | Likely cause                                                | Fix                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `GET /ready` returns 503 with `chest` only listed             | TensorFlow is not installed                                 | `pip install tensorflow==2.19.1` (optional but enables the skin route) |
| `GET /ready` returns 503 with **no** models                   | Both loaders crashed (often torchxrayvision or TF error)    | Check `fastapi-*.stdout.log` for the exception during startup        |
| `POST /predict` returns 503 for `scan_type=skin`              | TF missing **or** skin checkpoint not downloaded yet       | Wait for first-start download, or set `SKIN_RESNET50_WEIGHTS` to a local `.h5` |
| Frontend shows "Could not reach the prediction service"       | Backend not running on port 8000                            | Run `.\start_backend.ps1` in the backend directory                   |
| First start hangs for 1–3 minutes                             | TorchXRayVision / HF model downloading                      | One-time; subsequent starts are fast                                  |
| Unicode error during download on Windows                      | Console encoding is cp1252                                  | `set PYTHONIOENCODING=utf-8` before `uvicorn` (the included `start_backend.ps1` does this) |

---

## License & data

The TorchXRayVision weights are released under
[Apache-2.0](https://github.com/mlmed/torchxrayvision/blob/master/LICENSE).
The skin-lesion Keras checkpoint is published on Hugging Face under its
own license — see the model card. **No PHI is stored by this service.**
