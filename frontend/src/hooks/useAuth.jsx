import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import {
    auth,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    db,
    doc,
    updateDoc,
    updateProfile,
} from "../firebase";
import { useUser } from "../providers/User";

const useAuth = () => {
    const { setUser, firestoreUser, setFirestoreUser } = useUser();
    const toast = useToast();
    const [isSigningIn, setSigningIn] = useState(false);
    const [isSigningOut, setSigningOut] = useState(false);
    const [isResettingPassword, setResettingPassword] = useState(false);
    const [authInProgress, setAuthInProgress] = useState(false);

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

    const updateUserData = async (userData, data) => {
        try {
            const docRef = doc(db, "users", userData.uid);
            await updateDoc(docRef, data);
            setFirestoreUser(...firestoreUser, ...data);
        } catch (error) {
            toast({
                description: `Failed to update user: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return {
        isSigningIn,
        isSigningOut,
        isResettingPassword,
        createUser,
        signInUser,
        signOutUser,
        resetPassword,
        resendVerificationEmail,
        authInProgress,
        updateUserData,
        updateProfile,
    };
};

export default useAuth;
