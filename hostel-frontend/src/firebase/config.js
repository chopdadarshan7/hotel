// ============================================================
//  firebase/config.js  —  Hostel Management System
//  Replace the firebaseConfig values with YOUR project's keys
//  from Firebase Console → Project Settings → General
// ============================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhwA507a38QbKtReU2hz9ydTmOemG_hHI",
  authDomain: "flutter-ai-playground-cdc50.firebaseapp.com",
  projectId: "flutter-ai-playground-cdc50",
  storageBucket: "flutter-ai-playground-cdc50.firebasestorage.app",
  messagingSenderId: "870298669709",
  appId: "1:870298669709:web:21c916b9bdaa4b9bec88c4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
