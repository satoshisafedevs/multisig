import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth"; // Assuming you have an authentication hook
import EmailVerifyModal from "./EmailVerifyModal";
import { useFirestoreUser } from "../providers/FirestoreUser";

function AuthenticatedRoute({ children }) {
    const { teamData, setCurrentTeam, setTeamUsersDisplayNames } = useFirestoreUser();
    const [hasFetchedUserData, setHasFetchedUserData] = useState(false);
    const { slug } = useParams();
    const { user, doc, db, getDoc, gettingUserAuthStatus, getFirestoreUserData, getUserTeamsData } = useAuth();

    useEffect(() => {
        if (teamData && teamData.length > 0) {
            const team = teamData.find((t) => t.slug === slug);
            // fetch each user id and get displayName and add to team
            if (team?.users) {
                const displayNames = {};
                const getUsersDisplayNames = async (el) => {
                    const docRef = doc(db, "users", el);
                    const docSnap = await getDoc(docRef);
                    displayNames[el] = docSnap.data().displayName;
                };
                Promise.all(team.users.map((el) => getUsersDisplayNames(el)))
                    .then(() => setTeamUsersDisplayNames(displayNames))
                    .catch(() => {});
            }
            setCurrentTeam({ ...team });
        }
    }, [teamData, slug]);

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
        setHasFetchedUserData(true);
        getUserTeamsData(user);
        getFirestoreUserData(user);
    }

    return children;
}

AuthenticatedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthenticatedRoute;
