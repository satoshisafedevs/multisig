const { onRequest } = require("../firebase");
const { openAIResponse } = require("../openai"); // replace with actual module name
const { db, Timestamp } = require("../firebase");
const { corsAndOptions } = require("./cors");

exports.onSatoshiBotMessageReceived = onRequest(
    async (req, res) => {
        corsAndOptions(req, res);
        try {
            // Get the teamId from the context parameters (wildcards)
            console.log(req.body);
            const teamId = req.body.teamid;
            const documentPath = `teams/${teamId}/`;
            const messagesPath = `teams/${teamId}/messages`;
            const teamDoc = await db.doc(documentPath).get();

            // Check if the document exists
            if (!teamDoc.exists) {
                console.error("No such document!");
            } else {
                // Get the bot_uid from the team's document
                const botUid = teamDoc.data().botUid;

                // Query the Firestore database for all messages of the specific team where type is 'satoshibot',
                // sorted by the 'createdAt' field
                const snapshot = await db.collection(messagesPath)
                    .where("type", "==", "satoshibot")
                    .orderBy("createdAt")
                    .get();

                const convo = [];
                snapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    const data = doc.data();

                    // Append "Satoshi:" if the message uid is bot_uid, else append "User"
                    data.text = data.uid === botUid ? `Satoshi: ${data.message}` : `User: ${data.message}`;
                    convo.push(data.text);
                });

                // Call your function with the message
                let response = await openAIResponse(convo);
                response = response.replace(/^\n+|\n+$/g, "");
                const newMessage = {
                    message: response,
                    uid: botUid,
                    type: "satoshibot",
                    createdAt: Timestamp.now(),
                };
                // Add a new document with 'newMessage' object. Firestore will auto-generate an ID.
                await db.collection(messagesPath).add(newMessage);
                res.status(200).send("Bot replied successfully!");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    },
);
