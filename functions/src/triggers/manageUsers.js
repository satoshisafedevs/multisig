const functions = require("firebase-functions");
const { db, Timestamp } = require("../firebase");

// v2 functions can't do this, yet?
// https://firebase.google.com/docs/functions/auth-events
// https://firebase.google.com/docs/functions/version-comparison#limitations
const createUser = functions.auth.user().onCreate((user) => {
    return db
        .collection("users")
        .doc(user.uid)
        .set({
            email: user.email || "none",
            creationTime: user.metadata.creationTime || "none",
            emailVerified: user.emailVerified || "false",
        });
});

const deleteUser = functions.auth.user().onDelete((user) => {
    return db
        .collection("users")
        .doc(user.uid)
        .update({
            deleted: true,
            deletionTime:
                Timestamp.now().toDate().toISOString().split(".")[0] + "Z",
        });
});

module.exports = {
    createUser,
    deleteUser,
};
