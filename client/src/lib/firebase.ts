// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWDPhNHL8_mHeTxcwOLH1neDZ8FBoA2Ic",
  authDomain: "orbis-f8ba8.firebaseapp.com",
  projectId: "orbis-f8ba8",
  storageBucket: "orbis-f8ba8.firebasestorage.app",
  messagingSenderId: "682963336195",
  appId: "1:682963336195:web:c05e7ce6216be4625d6236",
  measurementId: "G-SGW67CDKSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;