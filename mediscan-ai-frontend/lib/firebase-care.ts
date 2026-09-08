import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getFirebaseApp } from "./firebase-client";

export type SavedLocation = {
  uid: string;
  latitude: number;
  longitude: number;
  prediction: string;
};

function getDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

/**
 * Stores only the location a signed-in user explicitly chose to share.
 * Firestore rules should restrict `users/{uid}` to that authenticated user.
 */
export async function saveCareLocation(location: SavedLocation): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const { doc, setDoc } = await import("firebase/firestore");
  await setDoc(
    doc(db, "users", location.uid),
    {
      careLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        prediction: location.prediction,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
  return true;
}

export async function saveFeedback(input: {
  uid: string;
  email: string;
  message: string;
  rating: number;
  prediction: string;
}): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const { addDoc, collection } = await import("firebase/firestore");
  await addDoc(collection(db, "feedback"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return true;
}
