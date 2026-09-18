import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6bHdBhjZtD8VwkfKmzdaNcvu1N_KRUP4",
  authDomain: "mulakatdegerlendir-f51e0.firebaseapp.com",
  projectId: "mulakatdegerlendir-f51e0",
  storageBucket: "mulakatdegerlendir-f51e0.firebasestorage.app",
  messagingSenderId: "1039438035607",
  appId: "1:1039438035607:web:c2b64da376a32290aa87d2"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app); // Veritabanımız
export const auth = getAuth(app);    // Kayıt/Giriş sistemimiz
