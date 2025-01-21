// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYAAsXkIzfr6ax4BQPfEXBX7gfjPzNPU8",
  authDomain: "ai-trip-planner-d3e6d.firebaseapp.com",
  projectId: "ai-trip-planner-d3e6d",
  storageBucket: "ai-trip-planner-d3e6d.firebasestorage.app",
  messagingSenderId: "210440389823",
  appId: "1:210440389823:web:fee986d100e398edf0f20a",
  measurementId: "G-018D1TC8Q0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
// const analytics = getAnalytics(app);