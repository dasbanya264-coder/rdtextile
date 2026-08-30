import { storage } from './src/lib/firebase.js';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

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
