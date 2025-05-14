// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMzNHfi4ugx-6sFlSLa1O5nEIDLkRHfIs",
  authDomain: "flexievent-adbbb.firebaseapp.com",
  projectId: "flexievent-adbbb",
  storageBucket: "flexievent-adbbb.appspot.com",
  messagingSenderId: "523631233312",
  appId: "1:523631233312:web:8982dbd967b5db7d23af45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// (optional) export the individual services you’ll use
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
