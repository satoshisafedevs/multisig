import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
    RecaptchaVerifier,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    updatePassword,
    updateProfile,
} from "firebase/auth";
import {
    Timestamp,
    addDoc,
    collection,
    connectFirestoreEmulator,
    deleteDoc,
    deleteField,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

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
const getPaymentLink = httpsCallable(functions, "api-getPaymentLink");
const getWalletTokenBalances = httpsCallable(functions, "api-getWalletTokenBalances");
const getTransactionDetails = httpsCallable(functions, "api-getTransactionDetails");
const selectSubscriptionForTeam = httpsCallable(functions, "api-selectSubscriptionForTeam");
const addSupportUserToTeam = httpsCallable(functions, "api-addSupportUserToTeam");

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
    RecaptchaVerifier,
    Timestamp,
    acceptInvite,
    addDoc,
    analytics,
    app,
    auth,
    collection,
    createUserWithEmailAndPassword,
    db,
    deleteDoc,
    deleteField,
    // createNewSatoshiBot,
    doc,
    functions,
    getCountFromServer,
    getDoc,
    getDocs,
    getPaymentLink,
    getWalletTokenBalances,
    inviteUser,
    limit,
    onAuthStateChanged,
    onSnapshot,
    orderBy,
    query,
    sendEmailVerification,
    sendPasswordResetEmail,
    serverTimestamp,
    setDoc,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    updateDoc,
    updateProfile,
    updatePassword,
    transactions,
    where,
    getTransactionDetails,
    selectSubscriptionForTeam,
    addSupportUserToTeam,
};
