// src/lib/firebase-admin.ts
import admin from "firebase-admin";

// Prevent multiple initializations in development
let adminInstance: admin.app.App;

async function initializeAdmin() {
  // Return existing instance if already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // Prepare configuration
  let config: { credential: admin.credential.Credential; projectId?: string };

  // Use service account from environment variable if provided
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      config = {
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      };
      console.log("Firebase Admin initialized with service account from env");
    } catch (error) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
      throw error;
    }
  } else {
    // Fallback to application default credentials
    config = {
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    console.log("Firebase Admin initialized with default credentials");
  }

  // Initialize the app with the config
  try {
    return admin.initializeApp(config);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("already exists")) {
      console.warn("Firebase admin app already initialized");
      // Return the first initialized app from the apps array
      return admin.apps[0] as admin.app.App;
    }
    console.error("Firebase admin initialization error:", error);
    throw error;
  }
}

export const getAdmin = async () => {
  if (!adminInstance) {
    adminInstance = await initializeAdmin();
  }
  return adminInstance;
};
