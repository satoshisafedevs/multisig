import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    RecaptchaVerifier,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    updateProfile,
} from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASURMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {
    addDoc,
    analytics,
    app,
    auth,
    collection,
    createUserWithEmailAndPassword,
    db,
    doc,
    getDoc,
    getDocs,
    onAuthStateChanged,
    onSnapshot,
    orderBy,
    query,
    RecaptchaVerifier,
    sendEmailVerification,
    sendPasswordResetEmail,
    serverTimestamp,
    setDoc,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    Timestamp,
    updateDoc,
    updateProfile,
};
