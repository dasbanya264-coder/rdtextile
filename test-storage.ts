import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';

const app = initializeApp({
  projectId: "utopian-truth-xt3g1",
  appId: "1:98014983926:web:b2bad21e3ee4401b26ded7",
  apiKey: "AIzaSyArlqRL1QHMvXv1iCaE2WSf7OFvYHPOQGA",
  authDomain: "utopian-truth-xt3g1.firebaseapp.com",
  storageBucket: "utopian-truth-xt3g1.firebasestorage.app",
});
const storage = getStorage(app);
const storageRef = ref(storage, 'test.txt');
uploadString(storageRef, 'hello world').then(() => console.log('success')).catch(console.error).then(() => process.exit(0));
