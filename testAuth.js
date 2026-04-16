
console.log("🚀 AUTH TEST STARTING...");

import { adminAuth } from "./src/config/firebase.js";
import { auth } from "./src/config/firebaseClient.js";
import { signInWithEmailAndPassword } from "firebase/auth";

// ============================
// REGISTER (ADMIN SDK)
// ============================
const registerUser = async (email, password) => {
  try {
    const user = await adminAuth.createUser({
      email,
      password,
    });

    console.log("✅ USER REGISTERED:", user.uid);
    return user;
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err.message);
  }
};

// ============================
// LOGIN (CLIENT SDK)
// ============================
const loginUser = async (email, password) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    console.log("✅ LOGIN SUCCESS:");
    console.log("EMAIL:", userCred.user.email);
    console.log("UID:", userCred.user.uid);

    return userCred.user;
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
  }
};

// ============================
// RUN TEST
// ============================
const runTest = async () => {
  const email = `test_${Date.now()}@kbc.co.ke`;
  const password = "123456";

  console.log("Creating user...");
  await registerUser(email, password);

  console.log("\nLogging in...");
  await loginUser(email, password);
};

runTest();