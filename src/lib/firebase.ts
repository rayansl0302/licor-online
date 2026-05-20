import { initializeApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBuqORNE_V3yNRrw607wcLKQHyYR0lNXc",
  authDomain: "licor-online.firebaseapp.com",
  projectId: "licor-online",
  storageBucket: "licor-online.firebasestorage.app",
  messagingSenderId: "781062229474",
  appId: "1:781062229474:web:87dec70b60631892f47dbb",
};

export const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});
