const { createUser, deleteUser } = require("./manageUsers");
const { onUserWalletChange } = require("./onUserWalletChange");
const { onNewTeamCreated } = require("./onNewTeamCreated");
const { onTeamEdited } = require("./onTeamEdited");
const { onSubscriptionTypeEdited } = require("./onSubscriptionTypeEdited");

module.exports = {
    createUser,
    deleteUser,
    onUserWalletChange,
    onNewTeamCreated,
    onTeamEdited,
    onSubscriptionTypeEdited,
};

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
