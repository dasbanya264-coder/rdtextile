import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "utopian-truth-xt3g1",
  appId: "1:98014983926:web:b2bad21e3ee4401b26ded7",
  apiKey: "AIzaSyArlqRL1QHMvXv1iCaE2WSf7OFvYHPOQGA",
  authDomain: "utopian-truth-xt3g1.firebaseapp.com",
  storageBucket: "utopian-truth-xt3g1.firebasestorage.app",
  messagingSenderId: "98014983926"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-e6d2f5ae-bd98-4b8a-b3f8-9969088a2937");
export const storage = getStorage(app);
