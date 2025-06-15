import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRLLM6791Yr3Qk2ehps0T39nea4tX-ko0",
  authDomain: "crime-tracker-68d4d.firebaseapp.com",
  projectId: "crime-tracker-68d4d",
  storageBucket: "crime-tracker-68d4d.firebasestorage.app",
  messagingSenderId: "220462345785",
  appId: "1:220462345785:web:8b2b616a11ab89b32e27e8",
  measurementId: "G-M6PKJVJXQK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
