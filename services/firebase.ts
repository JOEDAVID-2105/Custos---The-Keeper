
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAwnKk2kLYiy1euioFJnSq13Ezf1RcIjk",
  authDomain: "custos-2105.firebaseapp.com",
  projectId: "custos-2105",
  storageBucket: "custos-2105.firebasestorage.app",
  messagingSenderId: "1070725139620",
  appId: "1:1070725139620:web:a35fc637497f6426feaa31",
  measurementId: "G-DN215VDHQG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
