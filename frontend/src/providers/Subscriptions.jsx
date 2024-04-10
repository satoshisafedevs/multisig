import { useToast } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    auth,
    collection,
    db,
    doc,
    getDoc,
    getDocs,
    onAuthStateChanged,
    onSnapshot,
    query,
    setDoc,
    where,
} from "../firebase";
import { useUser } from "./User";

const SubscriptionsContext = createContext();
const SubscriptionProvider = SubscriptionsContext.Provider;

export function useSubscriptions() {
    return useContext(SubscriptionsContext);
}

function Subscriptions({ children }) {
    const toast = useToast();
    const { firestoreUser } = useUser();
    const [user, setUser] = useState(null);
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState();
    const [activeSubscriptionSub, setActiveSubscriptionsSub] = useState();
    const [userInvoiceSettings, setUserInvoiceSettings] = useState();

    const subscribeToUserSubscriptions = async (userId) => {
        try {
            return onSnapshot(
                query(collection(db, "subscriptions"), where("team.ownerId", "==", userId)),
                (querySnapshot) => {
                    const subscriptions = querySnapshot.docs.map((sub) => ({
                        ...sub.data(),
                        id: sub.id,
                        trialEndDate: sub.data().trialEndDate?.toDate(),
                        trialStartDate: sub.data().trialStartDate?.toDate(),
                        nextBillingDate: sub.data().nextBillingDate?.toDate(),
                    }));
                    setActiveSubscriptions(subscriptions);
                },
            );
        } catch (error) {
            toast({
                description: `Failed to get active subscription: ${error.message}`,
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
                if (activeSubscriptionSub) {
                    activeSubscriptionSub();
                }
                setActiveSubscriptionsSub(subscribeToUserSubscriptions(userAuth.uid));
            } else {
                setActiveSubscriptions(null);
            }
        });
        return unsubscribe;
    }, []);

    const getSubscriptionTypes = async () => {
        try {
            const subscriptionTypesRef = collection(db, "subscriptionTypes");
            const subscriptionTypesSnap = await getDocs(subscriptionTypesRef);
            const subscriptionTypesData = [];
            if (!subscriptionTypesSnap.empty) {
                subscriptionTypesSnap.docs.forEach((d) => {
                    subscriptionTypesData.push({
                        id: d.id,
                        ...d.data(),
                    });
                });
            }
            subscriptionTypesData.sort((a, b) => a.price - b.price);
            setSubscriptionTypes(subscriptionTypesData);
        } catch (error) {
            toast({
                description: `Failed to get subscription types: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getUserInvoiceSettings = async () => {
        try {
            const docRef = doc(db, "invoiceSettings", firestoreUser.uid);
            const invoiceData = await getDoc(docRef);
            setUserInvoiceSettings(invoiceData.data());
        } catch (error) {
            toast({
                description: `Failed to get user invoice settings: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const updateUserInvoiceSettings = async (data) => {
        try {
            const docRef = doc(db, "invoiceSettings", firestoreUser.uid);
            await setDoc(docRef, data, { merge: true });
            getUserInvoiceSettings();
        } catch (error) {
            toast({
                description: `Failed to update user invoice settings: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const values = useMemo(
        () => ({
            user,
            setUser,
            subscriptionTypes,
            getSubscriptionTypes,
            activeSubscriptions,
            getUserInvoiceSettings,
            updateUserInvoiceSettings,
            userInvoiceSettings,
        }),
        [user, setUser, activeSubscriptions, getUserInvoiceSettings, updateUserInvoiceSettings, userInvoiceSettings],
    );

    return <SubscriptionProvider value={values}>{children}</SubscriptionProvider>;
}

Subscriptions.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Subscriptions;
