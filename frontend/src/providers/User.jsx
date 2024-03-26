import { useToast } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, collection, db, deleteDoc, doc, getDoc, getDocs, onAuthStateChanged, updateDoc } from "../firebase";
import networks from "../utils/networks.json";

const UserContext = createContext();
const UserProvider = UserContext.Provider;

export function useUser() {
    return useContext(UserContext);
}

function User({ children }) {
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [gettingUserAuthStatus, setGettingUserAuthStatus] = useState(true);
    const [firestoreUser, setFirestoreUser] = useState(null);
    const [safes, setSafes] = useState([]);
    const [teamsData, setTeamsData] = useState(null);
    const [userTeamData, setUserTeamData] = useState(null);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamUsersInfo, setTeamUsersInfo] = useState(null);
    const [subscriptionTypes, setSubscriptionTypes] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                setUser(userAuth);
                setGettingUserAuthStatus(false);
            } else {
                setUser(null);
                setFirestoreUser(null);
                setCurrentTeam(null);
                setTeamsData(null);
                setTeamUsersInfo(null);
                setGettingUserAuthStatus(false);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (currentTeam && currentTeam.safes && currentTeam.safes.length > 0) {
            setSafes(currentTeam.safes);
        } else setSafes([]);
    }, [currentTeam]);

    const getUserTeamsData = async () => {
        try {
            const userTeamsRef = collection(db, "users", user.uid, "teams");
            const userTeamsSnap = await getDocs(userTeamsRef);
            const userTeamsData = await Promise.all(
                userTeamsSnap.docs.map(async (teamDoc) => {
                    // get user teams
                    const teamRef = doc(db, "teams", teamDoc.id);
                    const teamSnap = await getDoc(teamRef);
                    if (teamSnap.exists()) {
                        const teamData = teamSnap.data();
                        // check that user also added to the team
                        if (teamData.users.includes(user.uid)) {
                            return { ...teamData, id: teamSnap.id };
                        }
                    }
                    return null;
                }),
            );
            // Filter out null values
            const validTeamsData = userTeamsData.filter((teamDoc) => teamDoc !== null);
            setTeamsData([...validTeamsData]);
            return true;
        } catch (error) {
            toast({
                description: `Failed to get teams: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return false;
        }
    };

    const getFirestoreUserData = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setFirestoreUser({ ...userData, uid: user.uid });
        } catch (error) {
            toast({
                description: `Failed to get user: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const setUserTeamWallet = async (walletAddress) => {
        try {
            const userTeamRef = doc(db, "users", user.uid, "teams", currentTeam.id);
            await updateDoc(userTeamRef, { userWalletAddress: walletAddress });
        } catch (error) {
            toast({
                description: `Failed to update wallet address: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const leaveTeam = async (team) => {
        try {
            const userTeamRef = doc(db, "users", user.uid, "teams", team.id);
            await deleteDoc(userTeamRef);
            const teamRef = doc(db, "teams", team.id);
            const getTeamSnap = await getDoc(teamRef);
            await updateDoc(teamRef, {
                users: getTeamSnap.data().users.filter((userUid) => userUid !== user.uid),
            });
            return true;
        } catch (error) {
            toast({
                description: `Failed to leave the team: ${error.message}`,
                position: "top",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const getSafeData = async (safe, network) => {
        const response = await fetch(`${networks[network].safeTransactionService}/api/v1/safes/${safe}/`);
        if (!response.ok) {
            let errorMessage = "Unprocessable Entity";
            const data = await response.json();
            if (data.message) {
                errorMessage = data.message;
            } else if (response.status === 404) {
                errorMessage = "Resource not found";
            } // Add more status code checks if needed
            throw new Error(errorMessage);
        }
        const responseData = await response.json();
        return { [safe]: responseData };
    };

    const fetchSafesData = async () => Promise.all(safes.map((safe) => getSafeData(safe.safeAddress, safe.network)));

    const getUpdatedSafesData = (currentSafes, fetchedData) => {
        let isUpdateNeeded = false;
        const updatedSafesData = currentSafes.map((safe) => {
            const key = fetchedData[safe.safeAddress] ? safe.safeAddress : null;
            if (
                key &&
                (JSON.stringify(safe.owners) !== JSON.stringify(fetchedData[key].owners) ||
                    safe.threshold !== fetchedData[key].threshold)
            ) {
                isUpdateNeeded = true;
                return { ...safe, ...fetchedData[key] };
            }
            return safe;
        });
        return { updatedSafesData, isUpdateNeeded };
    };

    const fetchAndUpdateLatestSafesData = async () => {
        if (currentTeam?.safes?.length > 0) {
            try {
                const fetchedDataList = await fetchSafesData(currentTeam.safes);
                const combinedData = fetchedDataList.reduce((acc, currData) => ({ ...acc, ...currData }), {});

                if (Object.keys(combinedData).length) {
                    const { updatedSafesData, isUpdateNeeded } = getUpdatedSafesData(currentTeam.safes, combinedData);

                    if (isUpdateNeeded) {
                        const teamRef = doc(db, "teams", currentTeam.id);
                        await updateDoc(teamRef, { safes: updatedSafesData });
                        setCurrentTeam((prevState) => ({ ...prevState, safes: updatedSafesData }));
                        console.log("Updated safes data");
                    }
                }
            } catch (error) {
                if (error.message.includes("The operation was aborted.")) return;
                toast({
                    description: `Failed to sync safes data: ${error.message}`,
                    position: "top",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

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

    const values = useMemo(
        () => ({
            user,
            setUser,
            safes,
            gettingUserAuthStatus,
            firestoreUser,
            setFirestoreUser,
            teamsData,
            setTeamsData,
            userTeamData,
            setUserTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersInfo,
            setTeamUsersInfo,
            getUserTeamsData,
            subscriptionTypes,
            getSubscriptionTypes,
            getFirestoreUserData,
            setUserTeamWallet,
            leaveTeam,
            fetchAndUpdateLatestSafesData,
        }),
        [
            user,
            setUser,
            safes,
            gettingUserAuthStatus,
            firestoreUser,
            setFirestoreUser,
            teamsData,
            setTeamsData,
            userTeamData,
            setUserTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersInfo,
            setTeamUsersInfo,
            getUserTeamsData,
            getFirestoreUserData,
            setUserTeamWallet,
            leaveTeam,
        ],
    );

    return <UserProvider value={values}>{children}</UserProvider>;
}

User.propTypes = {
    children: PropTypes.node.isRequired,
};

export default User;
