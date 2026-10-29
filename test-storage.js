import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const storage = getStorage(app);
const storageRef = ref(storage, 'test.txt');

uploadString(storageRef, 'Hello world').then(() => {
  console.log('Upload successful');
  process.exit(0);
}).catch((err) => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
