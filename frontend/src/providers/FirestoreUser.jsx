import React, { createContext, useContext, useState, useMemo } from "react";
import { PropTypes } from "prop-types";

const FirestoreUserContext = createContext();
const FirestoreUserProvider = FirestoreUserContext.Provider;

export function useFirestoreUser() {
    return useContext(FirestoreUserContext);
}

function FirestoreUser({ children }) {
    const [firestoreUser, setFirestoreUser] = useState({});
    const [teamMembers, setTeamMembers] = useState({});

    const values = useMemo(
        () => ({
            firestoreUser,
            setFirestoreUser,
            teamMembers,
            setTeamMembers,
        }),
        [firestoreUser, setFirestoreUser, teamMembers, setTeamMembers],
    );

    return <FirestoreUserProvider value={values}>{children}</FirestoreUserProvider>;
}

FirestoreUser.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FirestoreUser;
