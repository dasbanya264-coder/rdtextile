import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  projectId: "utopian-truth-xt3g1",
  appId: "1:98014983926:web:b2bad21e3ee4401b26ded7",
  apiKey: "AIzaSyArlqRL1QHMvXv1iCaE2WSf7OFvYHPOQGA",
  authDomain: "utopian-truth-xt3g1.firebaseapp.com",
  storageBucket: "utopian-truth-xt3g1.firebasestorage.app",
  messagingSenderId: "98014983926"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const storageRef = ref(storage, 'test.txt');

async function run() {
  try {
    console.log("Uploading...");
    await uploadString(storageRef, 'Hello world');
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
run();
