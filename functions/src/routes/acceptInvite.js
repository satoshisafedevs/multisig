const { db, auth, onCall, FieldValue, HttpsError } = require("../firebase");

exports.acceptInvite = onCall(async (req, res) => {
    try {
        const { inviteId, userId, password, displayName, walletAddress, teamId } = req.data;

        // Lookup the invite
        const inviteRef = db.collection("invitations").doc(inviteId);
        const inviteDoc = await inviteRef.get();
        if (!inviteDoc.exists) {
            throw new Error("Invite not found.");
        }

        const inviteData = inviteDoc.data();
        if (inviteData.setPassword) {
            // Assume the existence of a function to update the user's password
            await auth.updateUser(userId, { password });
        }

        // Conditionally prepare the user data for update
        const userData = {};
        if (displayName !== null && displayName !== "") {
            userData.displayName = displayName;
        }

        // Update user document with displayName (if not null) and wallet address
        await db.collection("users").doc(userId).set(userData, { merge: true });

        // Update teams collection for the user
        await db.collection("users").doc(userId).collection("teams").doc(teamId).set({
            userWalletAddress: walletAddress,
        });

        // Add user to team
        const teamUsersRef = db.collection("teams").doc(teamId);
        await teamUsersRef.update({
            users: FieldValue.arrayUnion(userId),
        });
        const teamDoc = await teamUsersRef.get();
        const teamSlug = teamDoc.data().slug;

        // Update the invite to reflect completion
        await inviteRef.update({ status: "complete", setPassword: false });

        // Return success message or other relevant data
        return { message: "Invite accepted successfully", teamId: teamId, teamSlug: teamSlug };
    } catch (error) {
        console.error("Error handling invite:", error);
        throw new HttpsError("unknown", error.message);
    }
});
