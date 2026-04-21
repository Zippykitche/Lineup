import "dotenv/config";

console.log("🚀 AUTH TEST STARTING...");

import { adminAuth } from "./src/config/firebase.js";
import { loginUser as loginWithRest } from "./src/auth.js";

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
    const user = await loginWithRest(email, password);

    console.log("✅ LOGIN SUCCESS:");
    console.log("EMAIL:", user.email);
    console.log("UID:", user.uid);

    return user;
  } catch (err) {
    // Error logging handled by loginWithRest
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
  const loggedInUser = await loginUser(email, password);
  if (loggedInUser) {
    console.log("TOKEN:", loggedInUser.idToken);
  }
};

runTest();