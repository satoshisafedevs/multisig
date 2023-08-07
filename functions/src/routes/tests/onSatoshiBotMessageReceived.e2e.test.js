const { db, Timestamp } = require("../../firebase");
const chai = require("chai");
const axios = require("axios");
const expect = chai.expect;

describe("On new message in the teams collection", function() {
    this.timeout(18000);
    it("should write a new message to the teams collection", async () => {
        const teamId = "testTeam123";
        const botUid = "botUid123";
        const documentPath = `teams/${teamId}/messages/`;

        const newMessage = {
            message: "Swap my 3 ETH for 100 USDT on Uniswap",
            uid: "lsjdfsdlfkjsdf",
            type: "satoshibot",
            createdAt: Timestamp.now(),
        };

        // Points to the 'messages' subcollection in the team document
        const messagesCollectionRef = db.collection("teams").doc(teamId).collection("messages");
        // Add a new document with 'newMessage' object. Firestore will auto-generate an ID.
        await messagesCollectionRef.add(newMessage);

        // Set botUid field under the team document
        await db.doc(`teams/${teamId}`).set({ botUid }, { merge: true });

        // Call the route via HTTP instead of the functions import
        await axios.post(
            "http://127.0.0.1:5001/prontoai-playground/us-central1/api-onSatoshiBotMessageReceived",
            { teamid: teamId, message: newMessage },
        );

        let c = 0;
        let messages;
        while (c < 6) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const teamDoc = await db.collection(documentPath).get();
            messages = teamDoc.docs;
            if (messages && messages.length > 0) {
                break;
            }
            c++;
            if (c >= 6) {
                throw new Error("Timeout - exceeded 12 seconds");
            }
        }
        expect(messages.length).to.be.greaterThan(0);
    });
});
