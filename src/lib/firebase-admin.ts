// lib/firebase-admin.ts
import admin from "firebase-admin";

// Check if Firebase admin has already been initialized
if (!admin.apps.length) {
  // Use service account if provided, otherwise use project credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } else {
    // Initialize with application default credentials
    // This works in Firebase hosting or Cloud Functions
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

export { admin };
