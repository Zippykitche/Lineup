import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add environment switching
if (process.env.USE_EMULATOR === "true") {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  console.log("🔥 Running on Emulator");
} else {
  console.log("🚀 Running on Production Firebase");
}

// Load service account safely
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../firebase-service-account.json"),
    "utf8"
  )
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "lineup-backend-dd4a0",
});

const db = admin.firestore();

// Firestore emulator config
if (process.env.FIRESTORE_EMULATOR_HOST) {
  db.settings({
    host: process.env.FIRESTORE_EMULATOR_HOST,
    ssl: false,
  });

  console.log(`🔥 Firestore Emulator connected`);
}

const adminAuth = admin.auth();

export { admin, db, adminAuth };