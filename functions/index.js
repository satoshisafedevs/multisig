// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');
const twilio = require('twilio');
const admin = require('firebase-admin');
const twilioSecrets =  require('./twilioSecrets.json');
const { write } = require('firebase-functions/logger');
const appUrl = 'https://us-central1-text-chatgpt.cloudfunctions.net/receivedText'
const twilioClient = new twilio(twilioSecrets.accountSID, twilioSecrets.authToken);
const { openAIResponse } = require('./openAI');

admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.receivedText = functions.https.onRequest(async (req, res) => {
    if(!(req.body.AccountSid === twilioSecrets.accountSID && req.get('X-Twilio-Signature').length > 0)) {
        return;
    }
    const userPhone = req.body.From;
    const userDocRef = admin.firestore().collection('userConvos').doc(userPhone);
    const userDoc = await userDocRef.get();
    // If a user already has a conversation going
    if(userDoc.exists) {

        // log the message to the messageReceived docs
        const writeResult = await admin.firestore().collection('messageReceived').add({
            headers: req.headers,
            body: req.body,
            hostname: req.hostname,
            ip: req.ip,
            createdTime: Date.now()
        });

        // setup variables
        const receivedMessage = req.body.Body;
        const docData = userDoc.data();
        const convo = docData.convoArray;

        // if UNSUBSCRIBE in the message
        if(receivedMessage.indexOf('UNSUBSCRIBE') >= 0) {
            const unSubscribeUser = await admin.firestore().collection('userConvos').doc(user.phoneNumber).set({
                    subscribed: false
                },
                {merge: true}
            );
            twilioClient.messages.create({
                body: 'You have been successfully unsubscribed. If at any time you would like to come back, simply sign up at www.getprontoai.com again. Thanks!',
                to: userPhone,
                from: twilioSecrets.twilioNumber,
            });
            return;
        }

        // if too many messages
        // if(convo.length > 100) {
        //     twilioClient.messages.create({
        //         body: 'You have run into our systems limiter. Thanks for using the product! We are rolling out a paid service shortly and we will let you know when its launched.',
        //         to: userPhone,
        //         from: twilioSecrets.twilioNumber,
        //     });
        //     twilioClient.messages.create({
        //         body: 'User: ' + userPhone + ' has hit the limit',
        //         to: '+14359620349',
        //         from: twilioSecrets.twilioNumber,
        //     });
        //     return;
        // }

        // add human message to convo
        convo.push("Human:" + receivedMessage);

        // get AI response
        const aiResponse = await openAIResponse(convo);

        // create the response object
        convo.push('AI:' + aiResponse);
        let messageToSend = {
            body: aiResponse,
            to: userPhone,
            from: twilioSecrets.twilioNumber,
            dateCreated: Date.now()
        }

        // text the user back
        try {
        twilioClient.messages.create(messageToSend);
        } catch(e) {
            console.log(e);
        }


        // log the message to the messageSent collection
        const logMessage = await admin.firestore().collection('messageSent').add({
            ...messageToSend
        });

        // save the messages to the userConvo object
        await admin.firestore().collection('userConvos').doc(userPhone).update({
            convoArray: convo,
            receivedMessages: [...docData.receivedMessages, writeResult.id],
            sentMessages: [...docData.sentMessages, logMessage.id]
        }, {merge: true});

    } else {

        // tell user to register on website
        const unregisteredMsg = "Hey there! It looks like you haven't registered on our site yet. Please head to https://getprontoai.com/ to register."

        // text the user that they don't have an account
        try {
            twilioClient.messages.create({
                body: unregisteredMsg,
                to: userPhone,
                from: twilioSecrets.twilioNumber,
            });
        } catch (e) {
            console.log(e);
        }

    }
    return;
  });

exports.sendWelcomeText = functions.auth.user().onCreate(async (user) => {
    const msg = "Welcome to texting ProntoAI! ProntoAI is fantastic at answering questions, having a conversation, or basically anything that can be written (even playing chess)." +
    " To get started simply text back! \n\nTo unsubscribe, text back STOP in all caps";
    let messageToSend = {
        body: msg,
        to: user.phoneNumber,
        from: twilioSecrets.twilioNumber,
    }
    const message = await twilioClient.messages.create(messageToSend);
    messageToSend.dateSent = Date.now();
    const logMessage = await admin.firestore().collection('messageSent').add({
        ...messageToSend
    });
    const userConvoDoc = {
        welcomeMessageSent: msg,
        convoArray: [],
        sentMessages: [logMessage.id],
        receivedMessages: [],
        timeOfLastMessage: Date.now()
    };
    const newDoc = await admin.firestore().collection('userConvos').doc(user.phoneNumber).set({ ...userConvoDoc });
});