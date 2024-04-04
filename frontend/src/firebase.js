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
    connectAuthEmulator,
    updatePassword,
} from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    deleteField,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    limit,
    where,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    writeBatch,
    getCountFromServer,
    connectFirestoreEmulator,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";

const isServerActive = async (url) => {
    try {
        await fetch(url, { mode: "no-cors" });
        return true;
    } catch (error) {
        console.error(`Failed to connect to ${url}`);
        return false;
    }
};

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
const functions = getFunctions(app);

const inviteUser = httpsCallable(functions, "api-inviteUser");
const acceptInvite = httpsCallable(functions, "api-acceptInvite");
const transactions = httpsCallable(functions, "api-transactions");
const getWalletTokenBalances = httpsCallable(functions, "api-getWalletTokenBalances");
const getTransactionDetails = httpsCallable(functions, "api-getTransactionDetails");
// const createNewSatoshiBot = httpsCallable(functions, "api-createNewSatoshiBot");

// Check if localhost:5001 is active
isServerActive("http://localhost:4000").then((isActive) => {
    if (isActive) {
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFirestoreEmulator(db, "localhost", 8080);
        connectFunctionsEmulator(functions, "localhost", 5001);
    }
});

export {
    addDoc,
    analytics,
    app,
    auth,
    collection,
    createUserWithEmailAndPassword,
    db,
    functions,
    inviteUser,
    acceptInvite,
    // createNewSatoshiBot,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    deleteField,
    onAuthStateChanged,
    onSnapshot,
    orderBy,
    query,
    limit,
    where,
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
    writeBatch,
    updatePassword,
    getCountFromServer,
    transactions,
    getWalletTokenBalances,
    getTransactionDetails,
};
