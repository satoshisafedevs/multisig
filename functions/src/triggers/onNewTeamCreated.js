const { onDocumentCreated, log, db, admin } = require("../firebase");

// Assuming the system user's UID is stored in an environment variable named SYSTEM_USER_UID
const SYSTEM_USER_UID = process.env.SATOSHI_SUPPORT_UID;

exports.onNewTeamCreated = onDocumentCreated("/teams/{teamId}", async (event) => {
    const newTeamData = event.data.after.data();

    if (!newTeamData) {
        log("No team data found");
        return;
    }

    try {
        // Check if the system user's UID is not already part of the users array
        if (!newTeamData.users.includes(SYSTEM_USER_UID)) {
            const teamRef = db.collection("teams").doc(event.params.teamId);
            await teamRef.update({
                // Add the system user's UID to the users array
                users: admin.firestore.FieldValue.arrayUnion(SYSTEM_USER_UID),
            });
            log("System user added to the team");
        } else {
            log("System user already part of the team");
        }
    } catch (error) {
        log(`Failed to add system user to the team: ${error}`);
    }
});
