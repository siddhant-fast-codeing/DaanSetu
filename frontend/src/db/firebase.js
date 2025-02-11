import { initializeApp } from "firebase/app";
import "firebase/firestore";
import { collection, getFirestore } from "firebase/firestore";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const ngoCollection = collection(db, "ngo");
const ngoRequirementsCollection = collection(db, "ngo-requirements");

export { app, ngoCollection, firebaseConfig, ngoRequirementsCollection };
