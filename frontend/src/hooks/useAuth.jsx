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
    addDoc,
    collection,
    updateDoc,
    deleteDoc,
    updateProfile,
    onSnapshot,
    Timestamp,
    getDocs,
} from "../firebase";
import { useFirestoreUser } from "../providers/FirestoreUser";

const useAuth = () => {
    const { firestoreUser, setFirestoreUser, setTeamData, currentTeam, setCurrentTeam, setTeamUsersDisplayNames } =
        useFirestoreUser();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [gettingUserAuthStatus, setGettingUserAuthStatus] = useState(true);
    const [isSigningIn, setSigningIn] = useState(false);
    const [isSigningOut, setSigningOut] = useState(false);
    const [isResettingPassword, setResettingPassword] = useState(false);
    const [authInProgress, setAuthInProgress] = useState(false);

    const getUserTeamsData = async (userAuth) => {
        try {
            const userTeamsRef = collection(db, "users", userAuth.uid, "teams");
            const userTeamsSnap = await getDocs(userTeamsRef);
            const teamsData = await Promise.all(
                userTeamsSnap.docs.map(async (teamDoc) => {
                    const teamRef = doc(db, "teams", teamDoc.id);
                    const teamSnap = await getDoc(teamRef);
                    if (teamSnap.exists()) {
                        return { ...teamSnap.data(), id: teamSnap.id };
                    }
                    return null;
                }),
            );

            // Filter out null values
            const validTeamsData = teamsData.filter((teamDoc) => teamDoc !== null);
            setTeamData([...validTeamsData]);
        } catch (error) {
            toast({
                description: `Failed to get teams: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getFirestoreUserData = async (userAuth) => {
        const userRef = doc(db, "users", userAuth.uid);
        try {
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setFirestoreUser({ ...userData, uid: userAuth.uid });
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
                setGettingUserAuthStatus(false);
            } else {
                setUser(null);
                setFirestoreUser(null);
                setCurrentTeam(null);
                setTeamData(null);
                setTeamUsersDisplayNames(null);
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
        try {
            const newMessage = {
                message: text,
                uid: user.uid,
                type: "text",
                createdAt: Timestamp.now(),
            };

            // Points to the 'messages' subcollection in the team document
            const messagesCollectionRef = collection(db, "teams", currentTeam.id, "messages");

            // Add a new document with 'newMessage' object. Firestore will auto-generate an ID.
            await addDoc(messagesCollectionRef, newMessage);
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

    const deleteMessage = async (messageID) => {
        const docRef = doc(db, "teams", currentTeam.id, "messages", messageID);
        try {
            await deleteDoc(docRef);
        } catch (error) {
            toast({
                description: `Failed to delete message: ${error.message}`,
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
        currentTeam,
        setDoc,
        addDoc,
        collection,
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
        deleteMessage,
        updateDoc,
        updateFirestoreUserData,
        updateProfile,
        onSnapshot,
        getFirestoreUserData,
        getUserTeamsData,
    };
};

export default useAuth;
