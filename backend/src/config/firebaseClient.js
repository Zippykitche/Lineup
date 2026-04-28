import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDyy28_R7rnl5anxNz1nqnTN62KrjlZtE",
  authDomain: "lineup-backend-dd4a0.firebaseapp.com",
  projectId: "lineup-backend-dd4a0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };