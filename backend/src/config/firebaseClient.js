import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDyy28_R7rnl5anxNz1nqnTN62KrjlZtE",
  authDomain: "kbc-lineup.firebaseapp.com",
  projectId: "kbc-lineup",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };