const { onCall, db, log, error, HttpsError } = require("../firebase");

exports.removeTeamUser = onCall(async (req, res) => {
    // Check if the request is authenticated
    if (!req.auth) {
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    try {
        const { userId, teamId } = req.data;
        // Start a transaction to ensure atomicity of the operations
        await db.runTransaction(async (transaction) => {
            const userTeamsRef = db.collection("users").doc(userId).collection("teams").doc(teamId);
            const teamRef = db.collection("teams").doc(teamId);

            // Fetch the team document within the transaction to ensure consistency
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) {
                throw new HttpsError("not-found", "Team does not exist");
            }
            const team = teamDoc.data();

            // Check if the caller is the owner of the team
            if (team.ownerId !== req.auth.uid) {
                throw new HttpsError("permission-denied", "The caller is not the owner of the team.");
            }

            // Update the users array by removing the userId
            const usersArray = team.users || [];
            const updatedUsers = usersArray.filter((u) => u !== userId);
            transaction.update(teamRef, { users: updatedUsers });

            // Delete the team entry from the user's subcollection
            transaction.delete(userTeamsRef);
        });
        log(`Removed user: ${userId}, from team: ${teamId}`);
        return true;
    } catch (err) {
        error(err);
        throw new HttpsError("unknown", err.message);
    }
});
