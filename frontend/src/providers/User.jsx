import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useToast } from "@chakra-ui/react";
import { auth, onAuthStateChanged, db, collection, doc, getDoc, getDocs } from "../firebase";

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
    const [teamsData, setTeamsData] = useState(null);
    const [userTeamData, setUserTeamData] = useState(null);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamUsersDisplayNames, setTeamUsersDisplayNames] = useState(null);

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
                setTeamUsersDisplayNames(null);
                setGettingUserAuthStatus(false);
            }
        });
        return unsubscribe;
    }, []);

    const getUserTeamsData = async (userAuth) => {
        try {
            const userTeamsRef = collection(db, "users", userAuth.uid, "teams");
            const userTeamsSnap = await getDocs(userTeamsRef);
            const userTeamsData = await Promise.all(
                userTeamsSnap.docs.map(async (teamDoc) => {
                    // get user teams
                    const teamRef = doc(db, "teams", teamDoc.id);
                    const teamSnap = await getDoc(teamRef);
                    if (teamSnap.exists()) {
                        const teamData = teamSnap.data();
                        // check that user also added to the team
                        if (teamData.users.includes(userAuth.uid)) {
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

    const getFirestoreUserData = async (userAuth) => {
        try {
            const userRef = doc(db, "users", userAuth.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setFirestoreUser({ ...userData, uid: userAuth.uid });
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

    const values = useMemo(
        () => ({
            user,
            setUser,
            gettingUserAuthStatus,
            firestoreUser,
            setFirestoreUser,
            teamsData,
            setTeamsData,
            userTeamData,
            setUserTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersDisplayNames,
            setTeamUsersDisplayNames,
            getUserTeamsData,
            getFirestoreUserData,
        }),
        [
            user,
            setUser,
            gettingUserAuthStatus,
            firestoreUser,
            setFirestoreUser,
            teamsData,
            setTeamsData,
            userTeamData,
            setUserTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersDisplayNames,
            setTeamUsersDisplayNames,
            getUserTeamsData,
            getFirestoreUserData,
        ],
    );

    return <UserProvider value={values}>{children}</UserProvider>;
}

User.propTypes = {
    children: PropTypes.node.isRequired,
};

export default User;
