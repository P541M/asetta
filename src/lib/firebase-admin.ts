// src/lib/firebase-admin.ts
import admin from "firebase-admin";

let adminInstance: admin.app.App | null = null;

async function initializeAdmin() {
  if (adminInstance) return adminInstance;

  try {
    // Try to use the local file first
    try {
      const serviceAccountModule = await import("../../serviceAccountKey.json");
      const serviceAccount = serviceAccountModule.default;

      adminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized with local service account file");
      return adminInstance;
    } catch (fileError) {
      console.log(
        "No local serviceAccountKey.json found, trying environment variable"
      );

      // Fall back to environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT
          );
          adminInstance = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log(
            "Firebase Admin initialized with service account from env"
          );
          return adminInstance;
        } catch (parseError) {
          console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", parseError);
        }
      }

      // Last resort: use application default credentials
      adminInstance = admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log("Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
    throw error;
  }

  return adminInstance;
}

export const getAdmin = async () => {
  if (!adminInstance) {
    await initializeAdmin();
  }
  return adminInstance;
};
