const functions = require("firebase-functions");
const { db, onDocumentUpdated, Timestamp } = require("../firebase");

// v2 functions can't do this, yet?
// https://firebase.google.com/docs/functions/auth-events
// https://firebase.google.com/docs/functions/version-comparison#limitations
exports.createUser = functions.auth.user().onCreate((user) => {
    return db
        .collection("users")
        .doc(user.uid)
        .set({
            email: user.email || "none",
            creationTime: user.metadata.creationTime || "none",
            emailVerified: user.emailVerified || "false",
        });
});

exports.deleteUser = functions.auth.user().onDelete((user) => {
    return db
        .collection("users")
        .doc(user.uid)
        .update({
            deleted: true,
            deletionTime:
                Timestamp.now().toDate().toISOString().split(".")[0] + "Z",
        });
});

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

// exports.createUserProfile = onDocumentCreated(
//     "/typeformData/{phoneNumber}",
//     async (event) => {
//         const userDocRef = db
//             .collection("userProfile")
//             .doc(event.params.phoneNumber);
//         const userDoc = await userDocRef.get();
//         if (userDoc.exists) {
//             log(
//                 "Can't create user with provided phone number, user already exists:",
//                 event.params.phoneNumber,
//             );
//             return;
//         }
//         const typeformData = await db
//             .collection("typeformData")
//             .doc(event.params.phoneNumber)
//             .get()
//             .then((doc) => doc.data());
//         return userDocRef.set({
//             userCreated: new Date(),
//             timeZone: typeformData?.timeZone?.answer || "undefined",
//         });
//     },
// );
