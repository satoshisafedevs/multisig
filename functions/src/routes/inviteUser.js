const { onCall } = require("../firebase");
const { db, auth } = require("../firebase");
const { sendHtmlEmail } = require("../smtp2go");

exports.inviteUser = onCall(
    async (req, res) => {
        try {
            // Get the email, teamId, and userMessage from the request body
            console.log(req.body);
            const email = req.data.email;
            const teamId = req.data.teamid;
            const userMessage = req.data.message;
            const senderUid = req.auth.uid;

            // Lookup the sender's displayName
            const senderSnapshot = await db.collection("users").doc(senderUid).get();
            if (!senderSnapshot.exists) {
                throw new Error("Sender not found in users collection.");
            }

            const senderDisplayName = senderSnapshot.data().displayName;
            const senderEmail = senderSnapshot.data().email;

            // Lookup the team's name based on teamId
            const teamSnapshot = await db.collection("teams").doc(teamId).get();
            if (!teamSnapshot.exists) {
                throw new Error("Team not found.");
            }

            const teamName = teamSnapshot.data().name;

            // Check if a user with the provided email already exists
            const userSnapshot = await db.collection("users").where("email", "==", email).get();
            let userId; let setPassword = false;

            if (!userSnapshot.empty) {
                // If the user already exists, get their id
                userId = userSnapshot.docs[0].id;
            } else {
                // If the user does not exist, create a new user
                const userRef = await auth.createUser({
                    email: email,
                    emailVerified: true,
                    disabled: false,
                });
                userId = userRef.uid;
                setPassword = true;
                await db.collection("users").doc(userId).set({ email });
            }

            // Create a new invitation
            const invitation = {
                teamId,
                invitedByEmail: senderEmail, // Use sender's displayName
                status: "pending",
                userId,
                teamName: teamName,
                senderDisplayName: senderDisplayName || senderEmail,
                setPassword,
            };

            // Reference to the team's invitations subcollection
            const invitationsRef = db.collection("invitations");
            const newInvitationRef = await invitationsRef.add(invitation);

            // Get the ID of the new invitation
            const invitationId = newInvitationRef.id;

            // Create a URL with the invitation ID
            const inviteLink = `${process.env.BASE_URL}/invitation?id=${invitationId}`;

            // Assuming the sendHtmlEmail function accepts the parameters in the order:
            // recipientEmail, userMessage, senderName, senderEmail, teamName
            await sendHtmlEmail(
                email,
                userMessage,
                senderDisplayName,
                senderEmail, // sender's email
                teamName,
                inviteLink,
            );

            return "Invitation sent successfully!";
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message); // sending the error message for clarity
        }
    },
);
