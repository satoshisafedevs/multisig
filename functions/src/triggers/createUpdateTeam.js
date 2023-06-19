const { db, onDocumentUpdated } = require("../firebase");

exports.createUpdateTeam = onDocumentUpdated("/users/{uid}", async (event) => {
    const userRef = db.collection("users").doc(event.params.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    // do nothing if user deleted or has no team yet
    if (!userData.deleted && userData.team) {
        const teamDataRef = db.collection("teams").doc(userData.team);
        const teamDoc = await teamDataRef.get();
        if (teamDoc.exists) {
            const teamData = teamDoc.data();
            if (teamData.users.includes(event.params.uid)) {
                // update just displayName for team user if something is changed
                return db
                    .collection("teams")
                    .doc(userData.team)
                    .set(
                        {
                            usersInfo: {
                                ...teamData.usersInfo,
                                [event.params.uid]: {
                                    displayName: userData.displayName || "",
                                },
                            },
                        },
                        { merge: true },
                    );
            }
            // update team users doc
            return db
                .collection("teams")
                .doc(userData.team)
                .set(
                    {
                        users: [...teamData.users, event.params.uid],
                        usersInfo: {
                            ...teamData.usersInfo,
                            [event.params.uid]: {
                                displayName: userData.displayName || "",
                            },
                        },
                    },
                    { merge: true },
                );
        } else {
            // create new team doc
            return db
                .collection("teams")
                .doc(userData.team)
                .set({
                    users: [event.params.uid],
                    usersInfo: {
                        [event.params.uid]: {
                            displayName: userData.displayName || "",
                        },
                    },
                });
        }
    }
    return null;
});
