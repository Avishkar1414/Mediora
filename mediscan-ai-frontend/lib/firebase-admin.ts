import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { isFirebaseConfigured } from "./config";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp(): App | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (adminApp) {
    return adminApp;
  }

  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  } catch {
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) {
    return null;
  }

  if (!adminAuth) {
    adminAuth = getAuth(app);
  }

  return adminAuth;
}
