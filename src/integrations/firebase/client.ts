import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVAlGJR6fuutqWSuhTdRSqVdZ9pUm4OnA",
  authDomain: "bouhiafoot-2f7e9.firebaseapp.com",
  projectId: "bouhiafoot-2f7e9",
  storageBucket: "bouhiafoot-2f7e9.appspot.com",
  messagingSenderId: "343534699334",
  appId: "1:343534699334:web:f094278aa1f0b9228cdb47",
  measurementId: "G-GJ5V8Q3SVS",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); // ✅ CORRECT

