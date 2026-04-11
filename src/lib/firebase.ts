import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAhm8LPSIK7nGNmXjL5Gp1s2shrW0BviiU",
  authDomain: "mike-likes-dogs.firebaseapp.com",
  projectId: "mike-likes-dogs",
  storageBucket: "mike-likes-dogs.firebasestorage.app",
  messagingSenderId: "971887144821",
  appId: "1:971887144821:web:b63d0b117de575fd11ed3c",
  measurementId: "G-3XZSW2Y32G"
};

// Initialize Firebase only if it hasn't been initialized already
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);
