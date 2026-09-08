# Mediora AI Frontend

Next.js frontend for the Mediora AI chest X-ray and skin-lesion screening semester project.

## Current stage

This project includes the existing Next.js frontend and a separate FastAPI
prediction service in `../backend`.

It includes:

- Landing page
- Dashboard
- Chest X-ray or skin-image upload, selected before upload
- Drag & drop
- Image preview
- Real FastAPI model inference and saved model probabilities
- Medical-project disclaimer
- Responsive UI
- Demo login that works without Firebase (set `DEMO_MODE=false` to disable it)
- Report-aware nearby-care finder using the browser's opt-in location permission and Google Maps
- Feedback form with optional Firebase Firestore storage

## Real pretrained model backend

The backend uses TorchXRayVision's published `resnet50-res512-all`
ResNet-50 checkpoint. It is a multi-label chest X-ray model with 18 findings,
not a diagnostic device. See `../backend/README.md` for the checkpoint source,
data cohorts, supported classes, installation, first-download behaviour, APIs,
and limitations.

Start it in a separate terminal before submitting a scan:

```powershell
cd ..\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend posts the upload as multipart `file` to `http://localhost:8000/predict`,
then stores the returned result through its existing authenticated analysis route.
Set `NEXT_PUBLIC_PREDICTION_API_URL` to use another backend address.

The upload page has an **Input image type** choice: **Chest X-ray** or **Skin
image**. The selected type is sent to the backend and stored with the report.
Chest images use the bundled published chest ResNet-50. Skin images use a
separate trained ResNet-50 checkpoint, which must be configured before skin
requests can be analysed. See `../backend/README.md` for its required location
and checkpoint format. The app never sends skin photos to the chest model.

## Run locally

Install Node.js (LTS), then:

```bash
npm install
npm run dev
```

Open:

http://localhost:3000

## Optional Firebase data storage

Authentication uses the existing Firebase environment variables. When those are configured and Cloud Firestore is enabled, the dashboard also stores the location that a user explicitly shares at `users/{uid}` and feedback in `feedback`.

Use rules equivalent to the following before enabling this in production. The feedback rule lets a signed-in user create feedback only for their own UID; do not make the collection publicly readable.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read, update, delete: if false;
    }
  }
}
```

The map uses a Google Maps search embed, so no Google Maps JavaScript API key is required. It searches for respiratory/pulmonology care when the newest report is marked as pneumonia; it is not a medical diagnosis or a provider endorsement.

## Next development stages

1. Add Grad-CAM heatmap generation
2. Add a report download
3. Add model version tracking and production-grade persistence
