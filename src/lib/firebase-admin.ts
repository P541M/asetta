// src/lib/firebase-admin.ts
import admin from "firebase-admin";

// This prevents multiple initializations in development
// when API routes get called multiple times
interface AdminConfig {
  credential: admin.credential.Credential;
  projectId?: string;
}

/**
 * Global variable to hold the admin instance
 * Using this pattern ensures the admin SDK is only initialized once
 */
let adminInstance: admin.app.App;

async function initializeAdmin() {
  // Return existing instance if already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  // Only proceed with initialization if no apps exist
  let config: AdminConfig;

  try {
    // Try to use the local file first
    try {
      const serviceAccountModule = await import("../../serviceAccountKey.json");
      const serviceAccount = serviceAccountModule.default;
      config = {
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      };
      console.log("Firebase Admin initialized with local service account file");
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
          config = {
            credential: admin.credential.cert(
              serviceAccount as admin.ServiceAccount
            ),
          };
          console.log(
            "Firebase Admin initialized with service account from env"
          );
        } catch (parseError) {
          console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", parseError);
          throw parseError;
        }
      } else {
        // Last resort: use application default credentials
        config = {
          credential: admin.credential.applicationDefault(),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        };
        console.log("Firebase Admin initialized with default credentials");
      }
    }

    // Initialize the app with the config
    return admin.initializeApp(config);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        console.error("Firebase admin app already initialized");
        return admin.getApps()[0];
      }
      console.error("Firebase admin initialization error:", error.message);
    } else {
      console.error("Unknown error during Firebase admin initialization");
    }
    throw error;
  }
}

export const getAdmin = async () => {
  if (!adminInstance) {
    adminInstance = await initializeAdmin();
  }
  return adminInstance;
};
