import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD5FtVkUOqufdpZu8FhaFWJHzBECXDn6_k',
  authDomain: 'text-chatgpt.firebaseapp.com',
  projectId: 'text-chatgpt',
  storageBucket: 'text-chatgpt.appspot.com',
  messagingSenderId: '1041401476799',
  appId: '1:1041401476799:web:04a9c8384dc0dc0b99780a',
  measurementId: 'G-90JE35NMRL',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export {
  app, auth, analytics, RecaptchaVerifier, signInWithPhoneNumber,
};
