// src/lib/firebase-admin.ts
import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { devLog } from "../utils/devLog";

// firebase-admin v14 is modular-only: consumers get the App here and wrap it
// with getAuth()/getFirestore() themselves.
let adminApp: App | undefined;

function initializeAdmin(): App {
  // Reuse the existing app across dev hot-reloads
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      devLog("Firebase Admin initialized with service account from env");
      return initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
    } catch (error) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
      throw error;
    }
  }

  devLog("Firebase Admin initialized with default credentials");
  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const getAdmin = async (): Promise<App> => {
  if (!adminApp) {
    adminApp = initializeAdmin();
  }
  return adminApp;
};
