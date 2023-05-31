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
} from "../firebase";

const useAuth = () => {
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [gettingUserAuthStatus, setGettingUserAuthStatus] = useState(true);
    const [isSigningIn, setSigningIn] = useState(false);
    const [isSigningOut, setSigningOut] = useState(false);
    const [isResettingPassword, setResettingPassword] = useState(false);
    const [authInProgress, setAuthInProgress] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                setUser(userAuth);
                setGettingUserAuthStatus(false);
            } else {
                setUser(null);
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
                setUser(userCredential.user);
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

    return {
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
    };
};

export default useAuth;
