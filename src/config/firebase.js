// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnIToJmAN4x4AywUcRwefO4cHmL_SXS5c",
  authDomain: "marshmallow-ffe30.firebaseapp.com",
  projectId: "marshmallow-ffe30",
  storageBucket: "marshmallow-ffe30.firebasestorage.app",
  messagingSenderId: "222271317100",
  appId: "1:222271317100:web:33d82a095902096216a449",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
