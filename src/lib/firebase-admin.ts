// lib/firebase-admin.ts
import admin from "firebase-admin";

// Check if Firebase admin has already been initialized
if (!admin.apps.length) {
  try {
    // Use service account if provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("Firebase Admin initialized with service account");
    } else {
      // Initialize with application default credentials
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

      console.log("Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export { admin };
