
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
