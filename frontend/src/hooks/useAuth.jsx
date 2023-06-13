import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import {
    auth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    updateProfile,
    onSnapshot,
    Timestamp,
} from "../firebase";
import { useFirestoreUser } from "../providers/FirestoreUser";

const useAuth = () => {
    const { firestoreUser, setFirestoreUser } = useFirestoreUser();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [gettingUserAuthStatus, setGettingUserAuthStatus] = useState(true);
    const [isSigningIn, setSigningIn] = useState(false);
    const [isSigningOut, setSigningOut] = useState(false);
    const [isResettingPassword, setResettingPassword] = useState(false);
    const [authInProgress, setAuthInProgress] = useState(false);

    const getFirestoreUserData = async (userAuth) => {
        const docRef = doc(db, "users", userAuth.uid);
        try {
            const docSnap = await getDoc(docRef);
            setFirestoreUser({ ...docSnap.data(), uid: userAuth.uid });
        } catch (error) {
            toast({
                description: `Failed to get firestore user: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                setUser(userAuth);
                getFirestoreUserData(userAuth);
                setGettingUserAuthStatus(false);
            } else {
                setUser(null);
                setFirestoreUser(null);
                setGettingUserAuthStatus(false);
            }
        });
        return unsubscribe;
    }, []);

    const createUser = (email, password) => {
        setSigningIn(true);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setSigningIn(false);
                sendEmailVerification(userCredential.user);
            })
            .catch((error) => {
                setSigningIn(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const signInUser = (email, password) => {
        setSigningIn(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setSigningIn(false);
                setUser(userCredential.user);
            })
            .catch((error) => {
                setSigningIn(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const signOutUser = () => {
        setSigningOut(true);
        signOut(auth)
            .then(() => {
                setSigningOut(false);
                toast({
                    description: "Signed out successfully.",
                    position: "top",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                setSigningOut(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const resetPassword = (email) => {
        setResettingPassword(true);
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setResettingPassword(false);
                toast({
                    description: "Reset password email sent, check your inbox.",
                    position: "top",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                setResettingPassword(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const resendVerificationEmail = () => {
        setAuthInProgress(true);
        sendEmailVerification(auth.currentUser)
            .then(() => {
                setAuthInProgress(false);
                toast({
                    description: "Email verification sent, check your inbox.",
                    position: "top",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            })
            .catch((error) => {
                setAuthInProgress(false);
                toast({
                    description: error.message,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const addMessage = async (text) => {
        let team;
        if (!firestoreUser.team) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                team = docSnap.data().team;
                setFirestoreUser({ ...firestoreUser, ...docSnap.data() });
            }
        } else {
            team = firestoreUser.team;
        }
        const docRef = doc(db, "teams", team, "chat", "messages");
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    [Timestamp.now().toMillis()]: {
                        from: user.displayName || user.email,
                        message: text,
                        uid: user.uid,
                    },
                });
            } else {
                await setDoc(docRef, {
                    [Timestamp.now().toMillis()]: {
                        from: user.displayName || user.email,
                        message: text,
                        uid: user.uid,
                    },
                });
            }
        } catch (error) {
            toast({
                description: `Failed to send message: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const updateFirestoreUserData = async (userData, data) => {
        const docRef = doc(db, "users", userData.uid);
        try {
            await updateDoc(docRef, data);
            setFirestoreUser(...firestoreUser, ...data);
        } catch (error) {
            toast({
                description: `Failed to update firestore user: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return {
        db,
        doc,
        getDoc,
        setDoc,
        user,
        gettingUserAuthStatus,
        isSigningIn,
        isSigningOut,
        isResettingPassword,
        createUser,
        signInUser,
        signOutUser,
        resetPassword,
        resendVerificationEmail,
        authInProgress,
        addMessage,
        updateDoc,
        updateFirestoreUserData,
        updateProfile,
        onSnapshot,
    };
};

export default useAuth;
