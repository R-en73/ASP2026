import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import bundledConfig from "../../firebase-applet-config.json";

let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let initPromise: Promise<void> | null = null;

export const initFirebase = async () => {
  if (app && db) return { app, db, auth, storage };
  if (initPromise) {
    await initPromise;
    return { app, db, auth, storage };
  }

  initPromise = (async () => {
    try {
      let config: any = bundledConfig;
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}firebase-applet-config.json`);
        if (response.ok) {
          const fetched = await response.json();
          if (fetched && fetched.projectId) {
            config = fetched;
          }
        }
      } catch {
        // Use bundledConfig
      }

      app = !getApps().length ? initializeApp(config) : getApp();
      const dbId = config.firestoreDatabaseId || config.databaseId;
      // CRITICAL: Always use the provisioned named database
      db = dbId ? getFirestore(app, dbId) : getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      throw error;
    }
  })();

  await initPromise;
  return { app, db, auth, storage };
};

export const getDb = async () => {
  const { db } = await initFirebase();
  return db;
};

export const getFirebaseAppAuth = async () => {
  const { auth } = await initFirebase();
  return auth;
};

export const getAppStorage = async () => {
  const { storage } = await initFirebase();
  return storage;
};
