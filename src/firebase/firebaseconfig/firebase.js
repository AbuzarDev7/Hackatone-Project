
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC00uklC3PigmXtJ3EMXbzEVPFz5UtRm3Y",
  authDomain: "ticketing-tracking-hkt-pro.firebaseapp.com",
  projectId: "ticketing-tracking-hkt-pro",
  storageBucket: "ticketing-tracking-hkt-pro.firebasestorage.app",
  messagingSenderId: "142586680847",
  appId: "1:142586680847:web:6a49803aad36a64e49757a",
  measurementId: "G-BMGD4PYZFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)