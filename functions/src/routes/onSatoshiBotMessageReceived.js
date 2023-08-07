const { onRequest } = require("../firebase");
const { openAIResponse } = require("../openai"); // replace with actual module name
const { db, Timestamp } = require("../firebase");
const { corsAndOptions } = require("./cors");
const { getAssetsByTeam } = require("../wallet/assets");

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
                    const openAiObject = {};
                    // Append "Satoshi:" if the message uid is bot_uid, else append "User"
                    openAiObject.role = data.uid === botUid ?
                        "assistant" : "user";
                    openAiObject.content = data.message;
                    convo.push(openAiObject);
                });

                const assets = await getAssetsByTeam(teamId);

                // Call your function with the message
                const response = await openAIResponse(convo, assets);
                const newMessage = {
                    message: response.message,
                    uid: botUid,
                    type: "satoshibot",
                    createdAt: Timestamp.now(),
                    satoshiObject: response,
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
