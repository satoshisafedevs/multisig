import React, { useState, useEffect } from "react";
import { Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner, useToast } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { db, doc, getDoc } from "../firebase";
import EmailVerifyModal from "./EmailVerifyModal";
import { useUser } from "../providers/User";
import { useWalletConnect } from "../providers/WalletConnect";

function AuthenticatedRoute({ children }) {
    const {
        user,
        gettingUserAuthStatus,
        teamsData,
        setTeamsData,
        setUserTeamData,
        setCurrentTeam,
        setTeamUsersInfo,
        getFirestoreUserData,
        getUserTeamsData,
    } = useUser();
    const [hasFetchedUserData, setHasFetchedUserData] = useState(false);
    const toast = useToast();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { createWeb3Wallet } = useWalletConnect();
    const location = useLocation();

    useEffect(() => {
        if (teamsData && teamsData.length > 0) {
            const team = teamsData.find((t) => t.slug === slug);
            if (!team && location.pathname !== "/") {
                return navigate("/");
            }
            if (team) {
                setCurrentTeam(team);
                const getUserSafesAndWallet = async () => {
                    try {
                        const docRef = doc(db, "users", user.uid, "teams", team.id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const docData = docSnap.data();
                            setUserTeamData({
                                userSafes: docData.safes,
                                userWalletAddress: docData.userWalletAddress,
                            });
                        } else {
                            // when user has no access to a team but UI does not know yet
                            setTeamsData(null);
                            getUserTeamsData(user);
                            return navigate("/");
                        }
                    } catch (error) {
                        toast({
                            description: `Failed to get user safes and wallet: ${error.message}`,
                            position: "top",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                };
                getUserSafesAndWallet();
            }
            // fetch each user id and get displayName and add to team
            if (team?.users) {
                const displayNames = {};
                const getUsersDisplayNames = async (uid) => {
                    try {
                        const docRef = doc(db, "users", uid);
                        const docSnap = await getDoc(docRef);
                        const docData = docSnap.data();
                        const userWalletRef = doc(db, "users", uid, "teams", team.id);
                        const userWalletSnap = await getDoc(userWalletRef);
                        const userWalletData = userWalletSnap.data();
                        const displayInfo = {};
                        displayInfo.displayName = docData.displayName || docData.email;
                        displayInfo.photoUrl = docData.photoURL || null;
                        displayInfo.email = docData.email;
                        displayInfo.walletAddress = userWalletData?.userWalletAddress || null;
                        displayNames[uid] = displayInfo;
                    } catch (error) {
                        toast({
                            description: `Failed to get team display names: ${error.message}`,
                            position: "top",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                };
                Promise.all(team.users.map((uid) => getUsersDisplayNames(uid)))
                    .then(() => setTeamUsersInfo(displayNames))
                    .catch(() => {});
            }
        }
    }, [teamsData, slug]);

    useEffect(() => {
        createWeb3Wallet();
    }, []);

    if (gettingUserAuthStatus) {
        return <Spinner color="blue.500" speed="1s" size="xl" thickness="4px" emptyColor="gray.200" margin="auto" />;
    }

    if (!user) {
        return <Navigate to="/signin" />;
    }

    if (user && !user.emailVerified) {
        return <EmailVerifyModal user={user} />;
    }

    if (!hasFetchedUserData) {
        getUserTeamsData(user);
        getFirestoreUserData(user);
        setHasFetchedUserData(true);
    }

    return children;
}

AuthenticatedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthenticatedRoute;
