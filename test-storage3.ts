import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  projectId: "utopian-truth-xt3g1",
  appId: "1:98014983926:web:b2bad21e3ee4401b26ded7",
  apiKey: "AIzaSyArlqRL1QHMvXv1iCaE2WSf7OFvYHPOQGA",
  authDomain: "utopian-truth-xt3g1.firebaseapp.com",
  storageBucket: "utopian-truth-xt3g1.appspot.com",
  messagingSenderId: "98014983926"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function run() {
  try {
    const r = ref(storage, 'test.txt');
    await uploadString(r, 'hello world');
    const url = await getDownloadURL(r);
    console.log('URL:', url);
  } catch (e) {
    console.error(e);
  }
}
run();
