import React, { createContext, useContext, useState, useMemo } from "react";
import { PropTypes } from "prop-types";

const FirestoreUserContext = createContext();
const FirestoreUserProvider = FirestoreUserContext.Provider;

export function useFirestoreUser() {
    return useContext(FirestoreUserContext);
}

function FirestoreUser({ children }) {
    const [firestoreUser, setFirestoreUser] = useState({});
    const [teamData, setTeamData] = useState({});
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamUsersDisplayNames, setTeamUsersDisplayNames] = useState(null);

    const values = useMemo(
        () => ({
            firestoreUser,
            setFirestoreUser,
            teamData,
            setTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersDisplayNames,
            setTeamUsersDisplayNames,
        }),
        [
            firestoreUser,
            setFirestoreUser,
            teamData,
            setTeamData,
            currentTeam,
            setCurrentTeam,
            teamUsersDisplayNames,
            setTeamUsersDisplayNames,
        ],
    );

    return <FirestoreUserProvider value={values}>{children}</FirestoreUserProvider>;
}

FirestoreUser.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FirestoreUser;
