import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (process.env.USE_EMULATOR === "true") {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  console.log("Running on Emulator");
} else {
  console.log("Running on Production Firebase");
}

// Always use FIREBASE_SERVICE_ACCOUNT env var if available
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log("Loading service account from FIREBASE_SERVICE_ACCOUNT env var");
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  console.log("Loading service account from JSON file");
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../firebase-service-account.json'), 'utf8')
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

if (process.env.FIRESTORE_EMULATOR_HOST) {
  db.settings({ host: process.env.FIRESTORE_EMULATOR_HOST, ssl: false });
  console.log("Firestore Emulator connected");
}

const adminAuth = admin.auth();
export { admin, db, adminAuth };