const { onCall } = require("../firebase");
const { db, Timestamp, FieldValue } = require("../firebase");
const { generateWallet } = require("../wallet");
const { createOrUpdatePrivateKey } = require("../firebase");

exports.createNewSatoshiBot = onCall(async (req) => {
    const teamId = req.data.teamId;
    const newSatoshiBotData = {
        displayName: "Satoshi Bot",
        email: "support@satoshisafe.ai",
        creationTime: Timestamp.now(),
    };
    const newSatoshiBotDoc = await db.collection("users").add(newSatoshiBotData);
    await db
        .collection("teams")
        .doc(teamId)
        .set(
            {
                users: FieldValue.arrayUnion(newSatoshiBotDoc.id),
            },
            { merge: true },
        );
    const newWallet = await generateWallet();
    await db.collection("users").doc(newSatoshiBotDoc.id).collection("teams").doc(teamId).set({
        userWalletAddress: newWallet.address,
    });
    createOrUpdatePrivateKey("pKey-" + newSatoshiBotDoc.id, newWallet.privateKey);
    return newSatoshiBotDoc.id;
});
