const { onCall } = require("../firebase");
const { db, auth } = require("../firebase");

exports.acceptInvite = onCall(async (req, res) => {
    try {
        // Get the email, teamId, and userMessage from the request body
        const inviteId = req.data.inviteId;
        const userId = req.data.userId;
        const password = req.data.password;

        // Lookup the invite in the invitations collection
        const inviteRef = db.collection("invitations").doc(inviteId);
        const inviteDoc = await inviteRef.get();

        if (!inviteDoc.exists) {
            console.error("Invite not found.");
            return;
        }

        const inviteData = inviteDoc.data();

        // Check if setPassword is true
        if (inviteData.setPassword) {
            // Fetch the user and update the password
            const user = await auth.getUser(userId);
            if (user) {
                await auth.updateUser(userId, { password: password });
                console.log("Password updated successfully.");

                console.log("Updated user setPassword status to false.");
            } else {
                console.error("User not found.");
            }
        }
        // Update the status field of the invite document and disable password setting
        await inviteRef.update({ status: "complete", setPassword: false });
    } catch (error) {
        console.error(error);
    }
});
