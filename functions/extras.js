// require("dotenv").config();
//
// exports.sendWelcomeText = functions.auth.user().onCreate(async (user) => {
//     const msg =
//         "Welcome to texting ProntoAI! ProntoAI is fantastic at answering questions, having a conversation, or " +
//         "basically anything that can be written (even playing chess)." +
//         " To get started simply text back! \n\nTo unsubscribe, text back STOP in all caps";
//     const messageToSend = {
//         body: msg,
//         to: user.phoneNumber,
//         from: process.env.TWILIO_NUMBER,
//     };
//     const message = await twilioClient.messages.create(messageToSend);
//     messageToSend.dateSent = Date.now();
//     const logMessage = await db
//         .collection("messageSent")
//         .add({
//             ...messageToSend,
//         });
//     const userConvoDoc = {
//         welcomeMessageSent: msg,
//         convoArray: [],
//         sentMessages: [logMessage.id],
//         receivedMessages: [],
//         timeOfLastMessage: Date.now(),
//     };
//     const newDoc = await db
//         .collection("userConvos")
//         .doc(user.phoneNumber)
//         .set({...userConvoDoc});
// });
