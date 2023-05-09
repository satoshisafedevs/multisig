const { twilioClient } = require("./twilio");
const { db } = require("./firebase");
const { openAIResponse } = require("./openAI");

async function receivedMessageHandler(req, res) {
    if (
        !(
            req.body.AccountSid === process.env.TWILIO_ACCOUNT_SID &&
            req.get("X-Twilio-Signature").length > 0
        )
    ) {
        return;
    }
    const userPhone = req.body.From;
    const userDocRef = db
        .collection("userConvos")
        .doc(userPhone);
    const userDoc = await userDocRef.get();
    // If a user already has a conversation going
    if (userDoc.exists) {
        // log the message to the messageReceived docs
        const writeResult = await db
            .collection("messageReceived")
            .add({
                headers: req.headers,
                body: req.body,
                hostname: req.hostname,
                ip: req.ip,
                createdTime: Date.now(),
            });

        // setup variables
        const receivedMessage = req.body.Body;
        const docData = userDoc.data();
        const convo = docData.convoArray;

        // if UNSUBSCRIBE in the message
        if (receivedMessage.indexOf("UNSUBSCRIBE") >= 0) {
            // await db
            //     .collection("userConvos")
            //     .doc(user.phoneNumber)
            //     .set(
            //         {
            //             subscribed: false,
            //         },
            //         {merge: true},
            //     );
            twilioClient.messages.create({
                body: "You have been successfully unsubscribed. If at any time you would like to come back, "+
                "simply sign up at www.getprontoai.com again. Thanks!",
                to: userPhone,
                from: process.env.TWILIO_NUMBER,
            });
            return;
        }

        // if too many messages
        // if(convo.length > 100) {
        //     twilioClient.messages.create({
        //         body: 'You have run into our systems limiter. Thanks for using the product! We are rolling
        // out a paid service shortly and we will let you know when its launched.',
        //         to: userPhone,
        //         from: process.env.TWILIO_NUMBER
        //     });
        //     twilioClient.messages.create({
        //         body: 'User: ' + userPhone + ' has hit the limit',
        //         to: '+14359620349',
        //         from: process.env.TWILIO_NUMBER
        //     });
        //     return;
        // }

        // add human message to convo
        convo.push("Human:" + receivedMessage);

        // get AI response
        const aiResponse = await openAIResponse(convo);

        // create the response object
        convo.push("AI:" + aiResponse);
        const messageToSend = {
            body: aiResponse,
            to: userPhone,
            from: process.env.TWILIO_NUMBER,
            dateCreated: Date.now(),
        };

        // text the user back
        try {
            twilioClient.messages.create(messageToSend);
        } catch (e) {
            console.log(e);
        }

        // log the message to the messageSent collection
        const logMessage = await db
            .collection("messageSent")
            .add({
                ...messageToSend,
            });

        // save the messages to the userConvo object
        await db
            .collection("userConvos")
            .doc(userPhone)
            .update(
                {
                    convoArray: convo,
                    receivedMessages: [
                        ...docData.receivedMessages,
                        writeResult.id,
                    ],
                    sentMessages: [...docData.sentMessages, logMessage.id],
                },
                { merge: true },
            );
    } else {
        // tell user to register on website
        const unregisteredMsg =
            "Hey there! It looks like you haven't registered on our site yet. "+
            "Please head to https://getprontoai.com/ to register.";

        // text the user that they don't have an account
        try {
            twilioClient.messages.create({
                body: unregisteredMsg,
                to: userPhone,
                from: process.env.TWILIO_NUMBER,
            });
        } catch (e) {
            console.log(e);
        }
    }
    res.end();
}

module.exports = {
    receivedMessageHandler,
};
