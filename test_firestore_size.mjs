import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "utopian-truth-xt3g1",
  appId: "1:98014983926:web:b2bad21e3ee4401b26ded7",
  apiKey: "AIzaSyArlqRL1QHMvXv1iCaE2WSf7OFvYHPOQGA",
  authDomain: "utopian-truth-xt3g1.firebaseapp.com",
  storageBucket: "utopian-truth-xt3g1.firebasestorage.app",
  messagingSenderId: "98014983926"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-e6d2f5ae-bd98-4b8a-b3f8-9969088a2937");

async function run() {
  try {
    const dummyData = "A".repeat(1.1 * 1024 * 1024); // 1.1 MB string
    await addDoc(collection(db, 'orders'), {
        userId: 'guest',
        items: [],
        total: 100,
        status: 'pending',
        paymentStatus: 'pending',
        testField: dummyData
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
