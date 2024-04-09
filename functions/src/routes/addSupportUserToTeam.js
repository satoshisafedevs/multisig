const { onCall, db, Timestamp, FieldValue } = require("../firebase");

exports.addSupportUserToTeam = onCall(async (req) => {
    // Retrieve the team ID and the message text from the request
    const { teamId } = req.data;
    const messageText =
        "Welcome to Satoshi Safe! Get started by creating or importing a safe. " +
        "If you have any questions, you can find your answer in our helpful docs link at the top. ";

    // Choose environment variables based on the environment (adjust as needed)
    const supportUserId = process.env.SUPPORT_UID; // Ensure this is set in your function's configuration
    const supportWalletAddress = process.env.SUPPORT_WALLET_ADDRESS;

    // Ensure the support user is added to the team's user list
    await db
        .collection("teams")
        .doc(teamId)
        .update({
            users: FieldValue.arrayUnion(supportUserId),
        });

    // Also, add the team UID to the support user's list of teams, including the support wallet address
    await db.collection("users").doc(supportUserId).collection("teams").doc(teamId).set(
        {
            userWalletAddress: supportWalletAddress,
        },
        { merge: true },
    );

    const newMessage = {
        message: messageText,
        uid: supportUserId,
        type: "text", // Assuming all messages from support are of type text
        createdAt: Timestamp.now(),
    };
    // Points to the 'messages' subcollection in the team document
    const messagesCollectionRef = db.collection("teams").doc(teamId).collection("messages");
    // Add a new document with 'newMessage' object. Firestore will auto-generate an ID.
    await messagesCollectionRef.add(newMessage);

    return { success: true, message: "Support user and message added to team successfully." };
});
