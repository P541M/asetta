// src/lib/firebase-admin.ts
import admin from "firebase-admin";

let adminInstance: admin.app.App | null = null;

async function initializeAdmin() {
  if (adminInstance) return adminInstance;

  try {
    let serviceAccount;

    if (process.env.NODE_ENV === "development") {
      const serviceAccountModule = await import("../../serviceAccountKey.json");
      serviceAccount = serviceAccountModule.default;
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (serviceAccount) {
      adminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized with service account");
    } else {
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
