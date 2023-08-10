const { db } = require("../../firebase");
const chai = require("chai");
const axios = require("axios");
const expect = chai.expect;

describe("On inviting a user", function () {
    this.timeout(20000);
    it.skip("should create a new invitation in the database", async () => {
        const email = "testEmail@example.com";
        const teamId = "testTeam123";
        let invitationId;

        // Call the route via HTTP
        await axios.post("http://127.0.0.1:5001/prontoai-playground/us-central1/api-inviteUser", { email, teamId });

        let c = 0;
        let invitations;
        while (c < 6) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Query the Firestore database for the specific invitation
            const snapshot = await db
                .collection("invitations")
                .where("teamId", "==", teamId)
                .where("invitedByEmail", "==", email)
                .get();

            invitations = snapshot.docs;

            if (invitations && invitations.length > 0) {
                // Store the id of the invitation for cleanup
                invitationId = invitations[0].id;
                break;
            }
            c++;
            if (c >= 6) {
                throw new Error("Timeout - exceeded 12 seconds");
            }
        }
        expect(invitations.length).to.be.greaterThan(0);
        const invitationData = invitations[0].data();
        expect(invitationData.status).to.equal("pending");

        // Clean up: delete the invitation
        if (invitationId) {
            await db.collection("invitations").doc(invitationId).delete();
        }
    });
});
